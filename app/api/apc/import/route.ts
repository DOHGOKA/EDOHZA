import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import {
  getGeminiClient,
  GEMINI_MODEL,
  FICHE_APC_SCHEMA,
  callGeminiWithRetry,
  parseGeminiJson,
  resolveThinkingLevel,
  buildFicheFromAi,
  parseRequestJson,
  validateBase64Payload,
  getHttpStatusFromError,
} from '@/lib/gemini';
import { FicheAPC, HandicapProfileId, ReasoningQuality } from '@/lib/types';
import {
  buildDisciplinePromptDirectives,
  findDisciplineProfile,
} from '@/lib/disciplines';
import {
  buildInclusionHandicapDirectives,
  DEFAULT_HANDICAP_PROFILES,
  normalizeHandicapProfiles,
} from '@/lib/inclusion';
import {
  buildMathSchematisationPromptRules,
  isMathContext,
  normalizeCbMathCode,
} from '@/lib/math-schematisation';

const IMPORT_COMPILATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isCompilation: {
      type: Type.BOOLEAN,
      description:
        'true si le document contient 2 fiches pédagogiques/leçons distinctes ou plus, false s’il ne contient qu’une seule fiche.',
    },
    compilationTitle: {
      type: Type.STRING,
      description:
        'Titre global du recueil ou du fichier importé (ex: « Compilation CM1 Semaine 9 »).',
    },
    fiches: {
      type: Type.ARRAY,
      description:
        'Liste de toutes les fiches pédagogiques distinctes extraites du document (1 à 10 fiches maximum), chacune complète et différenciée.',
      items: FICHE_APC_SCHEMA,
    },
  },
  required: ['isCompilation', 'compilationTitle', 'fiches'],
};

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const {
      format,
      fileName = 'document',
      fileSize,
      textContent = '',
      base64Data = '',
      mimeType = '',
      referenceFiche = null,
      handicapProfiles,
      quality = 'equilibre',
      preferences = [],
      extractMode = 'auto',
      adaptationInstruction = '',
    } = body as {
      format: 'docx' | 'pdf' | 'text' | 'image';
      fileName?: string;
      fileSize?: number;
      textContent?: string;
      base64Data?: string;
      mimeType?: string;
      referenceFiche?: FicheAPC | null;
      handicapProfiles?: HandicapProfileId[];
      quality?: ReasoningQuality;
      preferences?: { regle: string }[];
      extractMode?: 'auto' | 'single' | 'compilation';
      adaptationInstruction?: string;
    };

    if (
      format !== 'pdf' &&
      format !== 'docx' &&
      format !== 'text' &&
      format !== 'image'
    ) {
      return NextResponse.json(
        {
          error:
            'Format d’importation non pris en charge (docx, pdf, image ou text attendu).',
        },
        { status: 400 }
      );
    }

    if ((format === 'pdf' || format === 'image') && !base64Data) {
      return NextResponse.json(
        { error: `Contenu ${format.toUpperCase()} manquant pour la conversion.` },
        { status: 400 }
      );
    }

    if (base64Data) {
      validateBase64Payload(
        base64Data,
        12 * 1024 * 1024,
        `Le fichier ${format.toUpperCase()}`
      );
    }

    if ((format === 'docx' || format === 'text') && !textContent.trim()) {
      return NextResponse.json(
        { error: 'Le document importé semble vide ou illisible.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const inferredProfile = findDisciplineProfile(
      referenceFiche?.disciplineId ||
        referenceFiche?.matiere ||
        textContent.slice(0, 1500),
      fileName
    );
    const disciplineDirectives = buildDisciplinePromptDirectives(
      inferredProfile,
      true
    );

    const mathActive = isMathContext(
      inferredProfile.matiere,
      inferredProfile.id
    );
    const cbHint = mathActive
      ? normalizeCbMathCode(
          undefined,
          textContent.slice(0, 500),
          fileName,
          ''
        )
      : undefined;
    const mathBlock =
      mathActive && cbHint
        ? `\n\n${buildMathSchematisationPromptRules({
            cbCode: cbHint,
            titre: fileName,
            theme: inferredProfile.nom,
            situationProbleme: textContent.slice(0, 300) || fileName,
            niveau: referenceFiche?.niveau || 'CM1',
          })}`
        : '';

    const prefsText =
      Array.isArray(preferences) && preferences.length > 0
        ? `\nPréférences de l'enseignant à appliquer lors de la normalisation :\n${preferences
            .map((p) => `- ${p.regle}`)
            .join('\n')}`
        : '';

    const adaptText = adaptationInstruction.trim()
      ? `\nCONSIGNE D'ADAPTATION ET DE RETOUCHE À L'IMPORTATION :\n"${adaptationInstruction.trim()}"`
      : '';

    const refText = referenceFiche
      ? `\nSTRUCTURE MODÈLE IDENTIQUE À RESPECTER :
Calque exactement ces ${referenceFiche.deroulement.length} étapes invariables et leurs sous-titres :
${referenceFiche.deroulement
  .map(
    (s, i) =>
      `${i + 1}. "${s.etape}" — Sous-titre invariable : "${s.sousTitreInvariable || ''}"`
  )
  .join('\n')}`
      : '';

    const selectedHandicaps = normalizeHandicapProfiles(
      Array.isArray(handicapProfiles) && handicapProfiles.length > 0
        ? handicapProfiles
        : referenceFiche?.handicapsInclus &&
          referenceFiche.handicapsInclus.length > 0
        ? referenceFiche.handicapsInclus
        : DEFAULT_HANDICAP_PROFILES
    );
    const inclusionText = `\n\n${buildInclusionHandicapDirectives(
      selectedHandicaps,
      quality === 'expert'
    )}`;

    const useCompilationSchema = extractMode !== 'single';
    const compilationInstruction =
      extractMode === 'compilation'
        ? `\nMODE COMPILATION ACTIVÉ : Le document peut regrouper plusieurs fiches, séances ou leçons (même dans des matières ou niveaux différents). Sépare et extrais CHAQUE fiche distinctement dans le tableau "fiches" (jusqu'à 10 fiches), sans les fusionner et en préservant leur titre, matière, niveau et contenu propres.`
        : useCompilationSchema
        ? `\nDÉTECTION MULTI-FICHES : Si le document contient plusieurs fiches/séances distinctes (ex: Fiche 1, Fiche 2, Séance 1, Séance 2...), extrais-les SÉPARÉMENT dans "fiches" avec "isCompilation": true. S'il ne contient qu'une seule séance/fiche, mets 1 élément dans "fiches" avec "isCompilation": false.`
        : '';

    const systemInstruction = `Tu es un expert en ingénierie pédagogique APC et inclusion scolaire.
Ta mission : analyser un document importé (${fileName}), extraire fidèlement tout texte visible (y compris OCR sur image ou tableau), corriger les incohérences et convertir vers le format structuré FicheAPC optimisé en préservant la discipline spécifique de chaque fiche.
Règles :
1. Renseigne toujours "competenceDeBase" (CB au niveau de l'en-tête).
2. Structure chaque déroulement avec les 4 colonnes obligatoires (Étapes avec sousTitreInvariable propre à la discipline, Activités du maître avec Q1/Q2, Activités des élèves avec R1/R2, Indicateurs pédagogiques inclusifs incluant [Inclusion handicap]).
3. Génère des "questionsReponses" interactives graduées et un schéma vectoriel SVG annoté résumant le concept clé.
4. En Mathématiques (CB1/CB2/CB3), renseigne obligatoirement "schematisationMath" en 3 phases avec données concrètes, exercices progressifs et Q&R de phase.${compilationInstruction}
${disciplineDirectives}${inclusionText}${mathBlock}${refText}${prefsText}${adaptText}`;

    const clippedText = textContent.slice(0, 110000);
    const contents =
      format === 'pdf' || format === 'image'
        ? {
            parts: [
              {
                inlineData: {
                  mimeType:
                    format === 'pdf'
                      ? 'application/pdf'
                      : mimeType || 'image/png',
                  data: base64Data,
                },
              },
              {
                text: `Lis, extrais et convertis fidèlement le contenu de ce document (${fileName}) en ${
                  useCompilationSchema
                    ? 'une ou plusieurs fiches pédagogiques APC distinctes (si c’est une compilation).'
                    : 'une fiche pédagogique APC complète et structurée.'
                }`,
              },
            ],
          }
        : `Voici le contenu extrait du fichier « ${fileName} » :\n\n${clippedText}\n\nConvertis et optimise ce document en ${
            useCompilationSchema
              ? 'fiche(s) pédagogique(s) APC normalisée(s) (sépare chaque fiche distincte si ce fichier est une compilation).'
              : 'fiche pédagogique APC normalisée.'
          }`;

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: useCompilationSchema
          ? IMPORT_COMPILATION_SCHEMA
          : FICHE_APC_SCHEMA,
        thinkingConfig: {
          thinkingLevel:
            format === 'pdf' || format === 'image'
              ? resolveThinkingLevel(quality === 'rapide' ? 'equilibre' : quality)
              : resolveThinkingLevel(quality),
        },
      },
    });

    if (!useCompilationSchema) {
      const parsed = parseGeminiJson<Record<string, unknown>>(
        response.text,
        'Impossible de convertir ce document en fiche APC.'
      );
      const fiche = buildFicheFromAi(parsed, {
        idPrefix: 'fiche-import',
        fallbackTitre: fileName.replace(
          /\.(docx|pdf|txt|md|csv|tsv|html?|rtf|png|jpg|jpeg|webp)$/i,
          ''
        ),
        fallbackTheme: 'Document pédagogique importé et normalisé',
        handicapProfiles: selectedHandicaps,
        modeCreation: 'import',
        historyAction: `Importation & normalisation (${format.toUpperCase()})`,
        historyResume: `Document « ${fileName} » converti et structuré automatiquement par l’IA.`,
        referenceFiche,
        fichierSource: {
          nom: fileName,
          format,
          importeLe: new Date().toISOString(),
          action: 'creation',
          tailleOctets: typeof fileSize === 'number' ? fileSize : undefined,
        },
      });
      return NextResponse.json({
        fiche,
        fiches: [fiche],
        isCompilation: false,
        compilationTitle: fiche.titre,
      });
    }

    const parsedBundle = parseGeminiJson<{
      isCompilation?: boolean;
      compilationTitle?: string;
      fiches?: Record<string, unknown>[];
    }>(response.text, 'Impossible de convertir ce document en fiche(s) APC.');

    const rawFiches = Array.isArray(parsedBundle.fiches)
      ? parsedBundle.fiches.filter(Boolean)
      : [];

    if (rawFiches.length === 0) {
      throw new Error('Aucune fiche exploitable n’a pu être extraite de ce document.');
    }

    const baseTitle = fileName.replace(
      /\.(docx|pdf|txt|md|csv|tsv|html?|rtf|png|jpg|jpeg|webp)$/i,
      ''
    );

    const builtFiches: FicheAPC[] = rawFiches.slice(0, 12).map((raw, idx) => {
      const ficheProfile = findDisciplineProfile(
        String(raw.matiere || '') || referenceFiche?.disciplineId,
        String(raw.titre || baseTitle)
      );
      const ficheMathActive = isMathContext(
        String(raw.matiere || ficheProfile.matiere),
        ficheProfile.id
      );
      const ficheCbHint = ficheMathActive
        ? normalizeCbMathCode(
            undefined,
            String(raw.competenceDeBase || ''),
            String(raw.titre || ''),
            String(raw.theme || '')
          )
        : undefined;

      return buildFicheFromAi(raw, {
        idPrefix: 'fiche-import',
        disciplineId: referenceFiche?.disciplineId || ficheProfile.id,
        cbCodeHint: ficheCbHint,
        fallbackTitre:
          rawFiches.length > 1 ? `${baseTitle} — Fiche ${idx + 1}` : baseTitle,
        fallbackTheme: 'Document pédagogique importé et normalisé',
        handicapProfiles: selectedHandicaps,
        modeCreation: 'import',
        historyAction:
          rawFiches.length > 1
            ? `Importation compilation (${format.toUpperCase()} · #${idx + 1}/${rawFiches.length})`
            : `Importation & normalisation (${format.toUpperCase()})`,
        historyResume: `Extrait de « ${fileName} » et structuré automatiquement avec différenciation APC.`,
        referenceFiche,
        fichierSource: {
          nom: fileName,
          format,
          importeLe: new Date().toISOString(),
          action: 'creation',
          tailleOctets: typeof fileSize === 'number' ? fileSize : undefined,
        },
      });
    });

    return NextResponse.json({
      fiche: builtFiches[0],
      fiches: builtFiches,
      isCompilation: builtFiches.length > 1 || Boolean(parsedBundle.isCompilation),
      compilationTitle: parsedBundle.compilationTitle || baseTitle,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la conversion du document importé.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
