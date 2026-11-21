import { readBlobAsBase64 } from './api-client';
import { createCompactSnapshot, normalizeFiche } from './storage';
import { sanitizeSvg } from './svg-sanitize';
import { FicheAPC } from './types';
import { createUid } from './utils';

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 Mo

export const UNIVERSAL_FILE_ACCEPT =
  '.docx,.pdf,.txt,.md,.markdown,.csv,.tsv,.html,.htm,.rtf,.json,.png,.jpg,.jpeg,.webp';

export const TEXT_FILE_ACCEPT =
  '.docx,.txt,.md,.markdown,.csv,.tsv,.html,.htm,.rtf';

export type ParsedUploadKind = 'docx' | 'pdf' | 'image' | 'json' | 'text';

export interface ParsedUploadResult {
  kind: ParsedUploadKind;
  /** Format normalisé accepté par les routes API (/api/apc/import, /api/apc/retouch) */
  apiFormat: 'docx' | 'pdf' | 'text' | 'image' | 'json';
  fileName: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  textContent?: string;
  base64Data?: string;
  previewUrl?: string;
  jsonFiches?: FicheAPC[];
  jsonCompilationTitle?: string;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Décode un buffer texte en UTF-8 strict, puis bascule sur Windows-1252 si des octets ISO-8859-1
 * (fichiers texte Windows/Word anciens en français) provoquent une erreur UTF-8.
 */
async function readTextWithFrenchEncodingFallback(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    try {
      return new TextDecoder('windows-1252').decode(buffer);
    } catch {
      return await file.text();
    }
  }
}

/**
 * Convertit proprement du HTML en texte structuré sans exécuter ni injecter de balises.
 */
function htmlToStructuredText(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc
        .querySelectorAll('script, style, noscript, iframe, svg')
        .forEach((el) => el.remove());

      const blocks: string[] = [];
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const t = (node.textContent || '').replace(/\s+/g, ' ');
          if (t.trim()) blocks.push(t.trim());
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === 'tr') {
          const cells = Array.from(el.querySelectorAll('th, td'))
            .map((c) => (c.textContent || '').replace(/\s+/g, ' ').trim())
            .filter(Boolean);
          if (cells.length > 0) {
            blocks.push(cells.join(' | '));
          }
          return;
        }
        if (/^(h[1-6]|p|li|div|section|article|blockquote|pre)$/.test(tag)) {
          const hasBlockChild = Array.from(el.children).some((c) =>
            /^(h[1-6]|p|li|div|section|article|table|tr|ul|ol)$/.test(
              c.tagName.toLowerCase()
            )
          );
          if (!hasBlockChild) {
            const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (text) {
              blocks.push(tag.startsWith('h') ? `\n${text}` : text);
            }
            return;
          }
        }
        Array.from(el.childNodes).forEach(walk);
      };
      if (doc.body) {
        walk(doc.body);
      }
      const joined = blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      if (joined) return joined;
    } catch {
      // fallback below
    }
  }
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convertit un fichier CSV/TSV en texte structuré lisible par l'IA et l'analyseur local.
 */
function tabularToStructuredText(raw: string, delimiterHint?: string): string {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';
  const sample = lines[0];
  const sep =
    delimiterHint ||
    (sample.includes('\t') ? '\t' : sample.includes(';') ? ';' : ',');
  return lines
    .map((line) =>
      line
        .split(sep)
        .map((cell) => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
        .join(' | ')
    )
    .join('\n');
}

/**
 * Extracteur léger de texte brut depuis un document RTF (gère les séquences \'hh françaises).
 */
function rtfToStructuredText(rtf: string): string {
  const withoutGroups = rtf
    .replace(/\{\\\*\\[^}]*\}/g, ' ')
    .replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|pict)[\s\S]*?\}/gi, ' ');

  const withAccents = withoutGroups.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    try {
      return new TextDecoder('windows-1252').decode(new Uint8Array([code]));
    } catch {
      return String.fromCharCode(code);
    }
  });

  return withAccents
    .replace(/\\u(-?\d+)\??/g, (_, codeStr) => {
      const n = parseInt(codeStr, 10);
      return String.fromCharCode(n < 0 ? 65536 + n : n);
    })
    .replace(/\\par\b|\\line\b/gi, '\n')
    .replace(/\\tab\b/gi, ' | ')
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/[{}]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function coerceParsedJsonToFiches(
  rawJson: unknown,
  fileName: string,
  fileSize: number,
  options?: {
    isRetouchMode?: boolean;
    activeFiche?: FicheAPC;
  }
): { fiches: FicheAPC[]; compilationTitle?: string } {
  const now = new Date().toISOString();
  let compilationTitle: string | undefined;
  let candidateList: Partial<FicheAPC>[] = [];

  if (Array.isArray(rawJson)) {
    candidateList = rawJson as Partial<FicheAPC>[];
    compilationTitle = fileName.replace(/\.json$/i, '');
  } else if (rawJson && typeof rawJson === 'object') {
    const obj = rawJson as Record<string, unknown>;
    if (Array.isArray(obj.fiches)) {
      candidateList = obj.fiches as Partial<FicheAPC>[];
      compilationTitle =
        typeof obj.titreCompilation === 'string'
          ? obj.titreCompilation
          : fileName.replace(/\.json$/i, '');
    } else if (obj.titre && Array.isArray(obj.deroulement)) {
      candidateList = [obj as Partial<FicheAPC>];
    }
  }

  const validCandidates = candidateList.filter(
    (item) => item && typeof item.titre === 'string' && Array.isArray(item.deroulement)
  );

  if (validCandidates.length === 0) {
    throw new Error(
      'Fichier JSON invalide : aucune fiche APC valide (titre + déroulement) détectée.'
    );
  }

  const isSingleRetouch =
    Boolean(options?.isRetouchMode) &&
    Boolean(options?.activeFiche) &&
    validCandidates.length === 1;

  const fiches = validCandidates.map((parsed) => {
    const active = options?.activeFiche;
    const retouch = isSingleRetouch && active;

    return normalizeFiche({
      id: retouch ? active.id : createUid('fiche-json'),
      disciplineId:
        parsed.disciplineId || (retouch ? active.disciplineId : undefined),
      origineModele:
        parsed.origineModele || (retouch ? active.origineModele : undefined),
      handicapsInclus: parsed.handicapsInclus,
      fichierSource: {
        nom: fileName,
        format: 'json',
        importeLe: now,
        action: retouch ? 'retouche' : 'creation',
        tailleOctets: fileSize,
      },
      derniereRetouche: parsed.derniereRetouche,
      titre: String(parsed.titre),
      theme: String(parsed.theme || 'Thème importé'),
      matiere: parsed.matiere || 'Autre',
      niveau: parsed.niveau || 'CM1',
      duree: String(parsed.duree || '45 min'),
      effectif: String(parsed.effectif || '6 élèves'),
      competenceDeBase: parsed.competenceDeBase
        ? String(parsed.competenceDeBase)
        : undefined,
      competenceVisee: String(parsed.competenceVisee || ''),
      objectifsSpecifiques: Array.isArray(parsed.objectifsSpecifiques)
        ? parsed.objectifsSpecifiques
        : [],
      prerequis: Array.isArray(parsed.prerequis) ? parsed.prerequis : [],
      materiel: Array.isArray(parsed.materiel) ? parsed.materiel : [],
      introduction: parsed.introduction || {
        accroche: '',
        miseEnSituation: '',
        consigneDepart: '',
      },
      deroulement: parsed.deroulement || [],
      illustration: {
        titre: parsed.illustration?.titre || 'Schéma pédagogique',
        legende: parsed.illustration?.legende || '',
        typeSchema: parsed.illustration?.typeSchema || 'svg',
        svgCode: sanitizeSvg(parsed.illustration?.svgCode || ''),
        annotations: Array.isArray(parsed.illustration?.annotations)
          ? parsed.illustration.annotations
          : [],
      },
      questionsReponses: Array.isArray(parsed.questionsReponses)
        ? parsed.questionsReponses
        : [],
      objetManipulable: parsed.objetManipulable || {
        actif: false,
        type: 'fractions',
        titre: '',
        consigne: '',
        parametres: { valeurA: 1, valeurB: 2, denominateur: 4, unite: 'unités' },
      },
      schematisationMath: parsed.schematisationMath,
      phasesManipulation: parsed.phasesManipulation,
      synthese: parsed.synthese || {
        resumeCle: '',
        traceEcriteEleve: '',
        motsCles: [],
        prolongement: '',
      },
      eleves: Array.isArray(parsed.eleves)
        ? parsed.eleves
        : retouch
        ? active.eleves
        : undefined,
      observations:
        parsed.observations ?? (retouch ? active.observations : undefined),
      suggestionsIA: Array.isArray(parsed.suggestionsIA)
        ? parsed.suggestionsIA
        : [],
      historique:
        retouch && active
          ? [
              {
                id: createUid('hist'),
                date: now,
                action: 'Retouche par fichier JSON',
                resume: `Contenu mis à jour depuis « ${fileName} ».`,
                snapshot: createCompactSnapshot(active),
              },
              ...(Array.isArray(active.historique)
                ? active.historique.slice(0, 14)
                : []),
            ]
          : Array.isArray(parsed.historique)
          ? parsed.historique
          : [
              {
                id: createUid('hist'),
                date: now,
                action: 'Import JSON',
                resume: `Restauration depuis « ${fileName} ».`,
              },
            ],
      modeCreation:
        retouch && active
          ? active.modeCreation
          : parsed.modeCreation || 'import',
      createdAt:
        retouch && active ? active.createdAt : parsed.createdAt || now,
      updatedAt: now,
    });
  });

  return { fiches, compilationTitle };
}

/**
 * Lit et décode universellement tout fichier pédagogique (.docx, .pdf, .txt, .md, .csv, .tsv, .html, .rtf, .json, image).
 */
export async function readAnyUploadedFile(
  file: File,
  options?: {
    maxBytes?: number;
    isRetouchMode?: boolean;
    activeFiche?: FicheAPC;
  }
): Promise<ParsedUploadResult> {
  const maxBytes = options?.maxBytes ?? MAX_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`Le fichier « ${file.name} » dépasse la limite de ${maxMb} Mo.`);
  }

  const ext = getFileExtension(file.name);
  const mimeType =
    file.type ||
    (ext === 'pdf'
      ? 'application/pdf'
      : ext === 'png'
      ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'webp'
      ? 'image/webp'
      : 'text/plain');

  if (ext === 'json') {
    const raw = await readTextWithFrenchEncodingFallback(file);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      throw new Error(`Le fichier JSON « ${file.name} » est malformé.`);
    }
    const { fiches, compilationTitle } = coerceParsedJsonToFiches(
      parsedJson,
      file.name,
      file.size,
      {
        isRetouchMode: options?.isRetouchMode,
        activeFiche: options?.activeFiche,
      }
    );
    return {
      kind: 'json',
      apiFormat: 'json',
      fileName: file.name,
      fileSize: file.size,
      mimeType: 'application/json',
      extension: ext,
      jsonFiches: fiches,
      jsonCompilationTitle: compilationTitle,
    };
  }

  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const textContent = (result.value || '').trim();
    if (!textContent) {
      throw new Error(
        `Le document Word « ${file.name} » ne contient aucun texte exploitable.`
      );
    }
    return {
      kind: 'docx',
      apiFormat: 'docx',
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      extension: ext,
      textContent,
    };
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const base64Data = await readBlobAsBase64(file);
    return {
      kind: 'pdf',
      apiFormat: 'pdf',
      fileName: file.name,
      fileSize: file.size,
      mimeType: 'application/pdf',
      extension: ext || 'pdf',
      base64Data,
    };
  }

  if (
    /^(png|jpe?g|webp|gif|bmp)$/i.test(ext) ||
    mimeType.startsWith('image/')
  ) {
    const base64Data = await readBlobAsBase64(file);
    return {
      kind: 'image',
      apiFormat: 'image',
      fileName: file.name,
      fileSize: file.size,
      mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png',
      extension: ext || 'png',
      base64Data,
      previewUrl: `data:${mimeType.startsWith('image/') ? mimeType : 'image/png'};base64,${base64Data}`,
    };
  }

  const rawText = await readTextWithFrenchEncodingFallback(file);
  let textContent = rawText;

  if (ext === 'html' || ext === 'htm') {
    textContent = htmlToStructuredText(rawText);
  } else if (ext === 'rtf') {
    textContent = rtfToStructuredText(rawText);
  } else if (ext === 'csv' || ext === 'tsv') {
    textContent = tabularToStructuredText(rawText, ext === 'tsv' ? '\t' : undefined);
  }

  textContent = textContent.trim();
  if (!textContent) {
    throw new Error(`Le fichier « ${file.name} » semble vide ou illisible.`);
  }

  return {
    kind: 'text',
    apiFormat: 'text',
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    extension: ext || 'txt',
    textContent,
  };
}

/**
 * Détecte si un texte brut provient d'une compilation de plusieurs fiches pédagogiques
 * (plusieurs séances, leçons ou fiches APC) et découpe les blocs correspondants.
 */
export function detectCompilationSections(rawText: string): string[] {
  const clean = (rawText || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  const boundaryPattern =
    /(?:^|\n)(?=(?:={3,}|-{3,}\s*FICHE|\*{3,}|#\s+)?(?:FICHE\s*(?:P[ÉE]DAGOGIQUE)?\s*(?:N[°o]?\s*\d+|APC|\d+)|S[ÉE]ANCE\s*(?:N[°o]?\s*)?\d+|LE[ÇC]ON\s*(?:N[°o]?\s*)?\d+|MODULES?\s*\d+\s*[:—-]|===+\s*FICHE))/gim;

  const matches = Array.from(clean.matchAll(boundaryPattern));
  if (matches.length >= 2) {
    const sections: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index ?? 0;
      const end =
        i + 1 < matches.length ? matches[i + 1].index ?? clean.length : clean.length;
      const chunk = clean.slice(start, end).trim();
      if (chunk.length >= 60) {
        sections.push(chunk);
      }
    }
    if (sections.length >= 2) {
      return sections.slice(0, 15);
    }
  }

  // Secondary check: repeated "Matière :" or "Titre :" headers inside long text
  const headerMatches = Array.from(
    clean.matchAll(/(?:^|\n)(?=(?:Mati[èe]re|Titre\s+de\s+la\s+(?:fiche|s[ée]ance))\s*:)/gim)
  );
  if (headerMatches.length >= 2) {
    const sections: string[] = [];
    for (let i = 0; i < headerMatches.length; i++) {
      const start = headerMatches[i].index ?? 0;
      const end =
        i + 1 < headerMatches.length
          ? headerMatches[i + 1].index ?? clean.length
          : clean.length;
      const chunk = clean.slice(start, end).trim();
      if (chunk.length >= 60) {
        sections.push(chunk);
      }
    }
    if (sections.length >= 2) {
      return sections.slice(0, 15);
    }
  }

  return [clean];
}
