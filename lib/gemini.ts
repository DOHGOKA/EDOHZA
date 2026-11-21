import {
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
  ThinkingLevel,
  Type,
} from '@google/genai';
import {
  CbMathType,
  ExerciceProgressifPhase,
  FicheAPC,
  FichierSourceMetadata,
  HandicapProfileId,
  PhaseManipulationMath,
  QuestionReponsePhase,
  ReasoningQuality,
  SchematisationMathPhases,
} from './types';
import {
  buildUniversalManipulationSchematisation,
  enrichManipulationPhases,
} from './manipulation-phases';
import { inferInvariantSubtitle } from './storage';
import { findDisciplineProfile } from './disciplines';
import {
  DEFAULT_HANDICAP_PROFILES,
  normalizeHandicapProfiles,
} from './inclusion';
import {
  buildFallbackMathSchematisation,
  CB_MATH_CATALOG,
  isMathContext,
  normalizeCbMathCode,
} from './math-schematisation';
import { sanitizeSvg } from './svg-sanitize';
import { createUid } from './utils';

export { sanitizeSvg };

export const GEMINI_MODEL = 'gemini-4-hydrogen';
export const GEMINI_TRANSCRIBE_MODEL = 'gemini-3.5-transcribe';

export function resolveThinkingLevel(quality?: ReasoningQuality): ThinkingLevel {
  if (quality === 'expert') return ThinkingLevel.XHIGH;
  if (quality === 'rapide') return ThinkingLevel.LOW;
  return ThinkingLevel.MEDIUM;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Clé API Gemini manquante côté serveur. Veuillez configurer GEMINI_API_KEY dans Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export class ApiRouteError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function parseRequestJson<T = Record<string, any>>(
  req: Request
): Promise<T> {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      throw new ApiRouteError('Corps de requête JSON invalide.', 400);
    }
    return body as T;
  } catch (err) {
    if (err instanceof ApiRouteError) throw err;
    throw new ApiRouteError('Corps de requête JSON malformé.', 400);
  }
}

export function validateBase64Payload(
  base64: string,
  maxBytes: number,
  label: string
): void {
  if (!base64) return;
  const approxBytes = Math.floor((base64.length * 3) / 4);
  if (approxBytes > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new ApiRouteError(
      `${label} dépasse la taille maximale autorisée (${maxMb} Mo).`,
      413
    );
  }
}

export function getHttpStatusFromError(err: unknown): number {
  if (err instanceof ApiRouteError) {
    return err.status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/\b400\b/.test(msg) || msg.includes('API_KEY_INVALID')) return 400;
  if (/\b401\b/.test(msg) || /\b403\b/.test(msg) || msg.includes('PERMISSION_DENIED')) return 403;
  if (/\b404\b/.test(msg) || msg.includes('NOT_FOUND')) return 404;
  if (/\b413\b/.test(msg)) return 413;
  if (/\b429\b/.test(msg) || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  if (/\b503\b/.test(msg) || msg.includes('UNAVAILABLE')) return 503;
  return 500;
}

function formatGeminiError(err: unknown): Error {
  if (err instanceof ApiRouteError) return err;
  const rawMsg = err instanceof Error ? err.message : String(err);
  if (rawMsg.includes('API_KEY_INVALID') || /\b400\b/.test(rawMsg)) {
    return new ApiRouteError(
      'Requête ou clé API invalide. Vérifiez votre clé dans le panneau Settings > Secrets.',
      400
    );
  }
  if (rawMsg.includes('PERMISSION_DENIED') || /\b403\b/.test(rawMsg)) {
    return new ApiRouteError(
      'Accès refusé par l’API Gemini. Vérifiez votre clé dans Settings > Secrets.',
      403
    );
  }
  if (rawMsg.includes('RESOURCE_EXHAUSTED') || /\b429\b/.test(rawMsg)) {
    return new ApiRouteError(
      'Quota temporairement atteint. Patientez quelques instants avant de réessayer.',
      429
    );
  }
  if (rawMsg.includes('NOT_FOUND') || /\b404\b/.test(rawMsg)) {
    return new ApiRouteError(
      `Modèle IA (${GEMINI_MODEL}) introuvable. Veuillez vérifier la configuration du modèle.`,
      404
    );
  }
  if (/\b503\b/.test(rawMsg) || rawMsg.includes('UNAVAILABLE')) {
    return new ApiRouteError(
      'Le moteur IA est temporairement surchargé. Veuillez réessayer dans quelques secondes.',
      503
    );
  }
  return err instanceof Error ? err : new Error(rawMsg);
}

export async function callGeminiWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParameters,
  maxRetries = 2
): Promise<GenerateContentResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        /\b429\b/.test(msg) ||
        /\b503\b/.test(msg) ||
        /\b502\b/.test(msg) ||
        /\b504\b/.test(msg) ||
        /\b500\b/.test(msg) ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('fetch') ||
        msg.includes('network');

      if (!isTransient || attempt === maxRetries) {
        throw formatGeminiError(err);
      }
      const delayMs = 700 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw formatGeminiError(lastError);
}

export function parseGeminiJson<T>(rawText: string | undefined, fallbackMsg: string): T {
  if (!rawText) {
    throw new Error(fallbackMsg);
  }
  const stripped = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    throw new Error('Réponse IA mal structurée. Veuillez relancer la génération.');
  }
}

// sanitizeSvg imported from ./svg-sanitize above

export const SCHEMATISATION_MATH_SCHEMA = {
  type: Type.OBJECT,
  description:
    'Schématisation IA en 3 phases de manipulation (Collective, Petits groupes, Individuelle) obligatoire pour Mathématiques (CB1, CB2 ou CB3) avec données concrètes tirées de la situation-problème et du titre.',
  properties: {
    actif: {
      type: Type.BOOLEAN,
      description: 'true pour Mathématiques (CB1, CB2 ou CB3), false pour les autres matières.',
    },
    cbCode: {
      type: Type.STRING,
      description: "Code officiel de Compétence de Base en Mathématiques : 'CB1', 'CB2' ou 'CB3'.",
    },
    cbLibelle: {
      type: Type.STRING,
      description: 'Libellé complet de la CB (ex: CB1 — Résoudre des situations-problèmes...).',
    },
    situationProblemeReference: {
      type: Type.STRING,
      description: 'Situation-problème concrète servant de source aux données manipulées.',
    },
    titreLeconReference: {
      type: Type.STRING,
      description: 'Titre exact de la leçon de mathématiques.',
    },
    synthesePassageAbstraction: {
      type: Type.STRING,
      description: 'Description du passage Concret → Schéma → Écriture mathématique abstraite.',
    },
    phases: {
      type: Type.ARRAY,
      description:
        'Exactement 3 phases dans cet ordre : collective, petits_groupes, individuelle.',
      items: {
        type: Type.OBJECT,
        properties: {
          phase: {
            type: Type.STRING,
            description: "Doit être 'collective', 'petits_groupes' ou 'individuelle'.",
          },
          titrePhase: {
            type: Type.STRING,
            description: 'Ex: 1. Manipulation collective / 2. Manipulation en petits groupes / 3. Manipulation individuelle.',
          },
          modalite: {
            type: Type.STRING,
            description: 'Organisation spatiale et sociale de la classe.',
          },
          donneesConcretes: {
            type: Type.STRING,
            description: 'Nombres, mesures, figures et objets concrets tirés de la situation-problème et du titre.',
          },
          materielConcret: {
            type: Type.STRING,
            description: 'Matériel manipulable concret adapté à cette phase et à la CB.',
          },
          actionSchemaEleve: {
            type: Type.STRING,
            description: 'Actions de manipulation et de schématisation attendues de l’élève.',
          },
          etayageInclusifAPC: {
            type: Type.STRING,
            description: 'Adaptation inclusive APC (DYS, dyscalculie, dyspraxie, TDAH).',
          },
          svgSchemaCode: {
            type: Type.STRING,
            description:
              'SVG compact (<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">...</svg>) illustrant cette phase avec les nombres/figures concrets en français, fond #F8FAFC, couleurs #0F172A, #0284C7, #059669, #D97706.',
          },
          exercicesProgressifs: {
            type: Type.ARRAY,
            description:
              '3 exercices progressifs interactifs dans cette phase (Palier 1 · Découverte, Palier 2 · Entraînement, Palier 3 · Défi) avec données concrètes.',
            items: {
              type: Type.OBJECT,
              properties: {
                palier: {
                  type: Type.STRING,
                  description: "Palier : 'Palier 1 · Découverte', 'Palier 2 · Entraînement' ou 'Palier 3 · Défi'.",
                },
                type: {
                  type: Type.STRING,
                  description: "'choix' (QCM 3 choix) ou 'saisie' (réponse courte/numérique).",
                },
                consigne: { type: Type.STRING },
                donneesConcretes: { type: Type.STRING },
                choix: { type: Type.ARRAY, items: { type: Type.STRING } },
                reponseAttendue: { type: Type.STRING },
                unite: { type: Type.STRING },
                indice: { type: Type.STRING },
                explication: { type: Type.STRING },
                lienSituationProbleme: { type: Type.STRING },
              },
              required: ['palier', 'type', 'consigne', 'donneesConcretes', 'reponseAttendue', 'indice', 'explication'],
            },
          },
          questionsReponsesPhase: {
            type: Type.ARRAY,
            description:
              '2 questions-réponses liées au thème, au titre et à la situation-problème dans cette phase.',
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                reponseAttendue: { type: Type.STRING },
                indice: { type: Type.STRING },
                ancrageThemeTitreSituation: { type: Type.STRING },
              },
              required: ['question', 'reponseAttendue', 'indice', 'ancrageThemeTitreSituation'],
            },
          },
        },
        required: [
          'phase',
          'titrePhase',
          'modalite',
          'donneesConcretes',
          'materielConcret',
          'actionSchemaEleve',
          'etayageInclusifAPC',
          'svgSchemaCode',
          'exercicesProgressifs',
          'questionsReponsesPhase',
        ],
      },
    },
  },
  required: [
    'actif',
    'cbCode',
    'cbLibelle',
    'situationProblemeReference',
    'titreLeconReference',
    'phases',
    'synthesePassageAbstraction',
  ],
};

export const FICHE_APC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    titre: { type: Type.STRING, description: 'Titre clair et opérationnel de la fiche APC.' },
    theme: { type: Type.STRING, description: 'Thème du programme scolaire.' },
    matiere: { type: Type.STRING, description: 'Matière scolaire.' },
    niveau: { type: Type.STRING, description: 'Niveau scolaire (ex: CM2, 6ème).' },
    duree: { type: Type.STRING, description: 'Durée totale de la séance (ex: 45 min).' },
    effectif: { type: Type.STRING, description: 'Taille du groupe APC recommandé.' },
    competenceDeBase: {
      type: Type.STRING,
      description: 'CB (Compétence de Base) figurant dans l’en-tête de la fiche (ex: CB1 — Mobiliser les nombres...).',
    },
    competenceVisee: { type: Type.STRING, description: 'Compétence principale travaillée.' },
    objectifsSpecifiques: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 à 4 objectifs opérationnels mesurables.',
    },
    prerequis: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 à 3 prérequis attendus.',
    },
    materiel: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Matériel pédagogique et adaptations inclusives.',
    },
    introduction: {
      type: Type.OBJECT,
      properties: {
        accroche: { type: Type.STRING, description: 'Situation déclenchante concrète adaptée au niveau.' },
        miseEnSituation: { type: Type.STRING, description: 'Phase d’observation et de questionnement initial.' },
        consigneDepart: { type: Type.STRING, description: 'Première consigne claire donnée aux élèves.' },
      },
      required: ['accroche', 'miseEnSituation', 'consigneDepart'],
    },
    deroulement: {
      type: Type.ARRAY,
      description: 'Tableau structuré de 5 à 6 étapes pédagogiques séquencées.',
      items: {
        type: Type.OBJECT,
        properties: {
          etape: { type: Type.STRING, description: 'Nom numéroté de l’étape (ex: 1. Préparation, 2. Lancement, 3. Activité 1, 4. Consolidation, 5. Synthèse, 6. Évaluation).' },
          sousTitreInvariable: {
            type: Type.STRING,
            description: 'Sous-titre pédagogique invariable propre à la discipline/matière de la fiche.',
          },
          duree: { type: Type.STRING, description: 'Durée de l’étape (ex: 10 min).' },
          activitesMaitre: { type: Type.STRING, description: 'Consignes, ressources, questionnement et animation du maître.' },
          activitesEleves: { type: Type.STRING, description: 'Tâches concrètes, manipulations, échanges et exercices des élèves.' },
          indicateursInclusifs: { type: Type.STRING, description: 'Critères d’évaluation formative observables, adaptations DYS/TDAH/besoins spécifiques et validation des objectifs.' },
        },
        required: [
          'etape',
          'sousTitreInvariable',
          'duree',
          'activitesMaitre',
          'activitesEleves',
          'indicateursInclusifs',
        ],
      },
    },
    questionsReponses: {
      type: Type.ARRAY,
      description: '3 à 4 questions-réponses interactives graduées.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          reponseAttendue: { type: Type.STRING },
          indicePedagogique: { type: Type.STRING },
          difficulte: {
            type: Type.STRING,
            description: "Doit être exactement 'Fondamental', 'Approfondissement' ou 'Défi'.",
          },
        },
        required: ['question', 'reponseAttendue', 'indicePedagogique', 'difficulte'],
      },
    },
    illustration: {
      type: Type.OBJECT,
      properties: {
        titre: { type: Type.STRING },
        legende: { type: Type.STRING },
        typeSchema: {
          type: Type.STRING,
          description: "Doit être 'svg', 'graphique', 'carte_mentale' ou 'geometrie'.",
        },
        svgCode: {
          type: Type.STRING,
          description:
            'Code SVG compact et valide (<svg viewBox="0 0 640 280" ...>), fond #F8FAFC, 8 à 18 formes/étiquettes lisibles en français (#0F172A, #0284C7, #059669, #D97706), sans script ni image externe.',
        },
        annotations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: 'Position X en pourcentage (10 à 90).' },
              y: { type: Type.NUMBER, description: 'Position Y en pourcentage (15 à 85).' },
              label: { type: Type.STRING },
              detail: { type: Type.STRING },
            },
            required: ['x', 'y', 'label', 'detail'],
          },
        },
      },
      required: ['titre', 'legende', 'typeSchema', 'svgCode', 'annotations'],
    },
    objetManipulable: {
      type: Type.OBJECT,
      properties: {
        actif: { type: Type.BOOLEAN, description: 'true si la matière/thème se prête à une manipulation interactive (mathématiques, sciences, mesures).' },
        type: {
          type: Type.STRING,
          description: "Choisir parmi: 'fractions', 'balance_algebre', 'geometrie_aire', 'droite_graduee', 'proportionnalite'.",
        },
        titre: { type: Type.STRING },
        consigne: { type: Type.STRING },
        parametres: {
          type: Type.OBJECT,
          properties: {
            valeurA: { type: Type.NUMBER },
            valeurB: { type: Type.NUMBER },
            denominateur: { type: Type.NUMBER },
            unite: { type: Type.STRING },
          },
          required: ['valeurA', 'valeurB'],
        },
      },
      required: ['actif', 'type', 'titre', 'consigne', 'parametres'],
    },
    schematisationMath: SCHEMATISATION_MATH_SCHEMA,
    synthese: {
      type: Type.OBJECT,
      properties: {
        resumeCle: { type: Type.STRING },
        traceEcriteEleve: { type: Type.STRING },
        motsCles: { type: Type.ARRAY, items: { type: Type.STRING } },
        prolongement: { type: Type.STRING },
      },
      required: ['resumeCle', 'traceEcriteEleve', 'motsCles', 'prolongement'],
    },
    suggestionsIA: {
      type: Type.ARRAY,
      description: '2 à 3 suggestions d’amélioration pédagogique pertinentes.',
      items: {
        type: Type.OBJECT,
        properties: {
          categorie: {
            type: Type.STRING,
            description: "Choisir parmi: 'Clarté', 'Inclusion', 'Différenciation', 'Évaluation', 'Illustration'.",
          },
          titre: { type: Type.STRING },
          constat: { type: Type.STRING },
          proposition: { type: Type.STRING },
        },
        required: ['categorie', 'titre', 'constat', 'proposition'],
      },
    },
  },
  required: [
    'titre',
    'theme',
    'matiere',
    'niveau',
    'duree',
    'effectif',
    'competenceDeBase',
    'competenceVisee',
    'objectifsSpecifiques',
    'prerequis',
    'materiel',
    'introduction',
    'deroulement',
    'questionsReponses',
    'illustration',
    'objetManipulable',
    'synthese',
    'suggestionsIA',
  ],
};

export function normalizeSchematisationMath(
  rawSchem: Record<string, any> | null | undefined,
  context: {
    matiere?: string;
    disciplineId?: string;
    cbCode?: CbMathType;
    competenceDeBase?: string;
    titre: string;
    theme?: string;
    situationProbleme?: string;
    niveau?: string;
  }
): SchematisationMathPhases | undefined {
  const mathActive = isMathContext(context.matiere, context.disciplineId);
  if (!mathActive && !rawSchem?.actif) {
    return undefined;
  }

  const resolvedCb = normalizeCbMathCode(
    context.cbCode || rawSchem?.cbCode,
    context.competenceDeBase,
    context.titre,
    context.theme
  );

  const fallback = buildFallbackMathSchematisation({
    cbCode: resolvedCb,
    competenceDeBase: context.competenceDeBase,
    titre: context.titre,
    theme: context.theme,
    situationProbleme: context.situationProbleme,
    niveau: context.niveau,
  });

  if (!rawSchem || !Array.isArray(rawSchem.phases) || rawSchem.phases.length === 0) {
    return fallback;
  }

  const phaseOrder: Array<'collective' | 'petits_groupes' | 'individuelle'> = [
    'collective',
    'petits_groupes',
    'individuelle',
  ];

  const normalizedPhases: PhaseManipulationMath[] = phaseOrder.map((phaseKey, idx) => {
    const rawMatch =
      rawSchem.phases.find(
        (p: Record<string, unknown>) =>
          String(p.phase || '').toLowerCase() === phaseKey
      ) || rawSchem.phases[idx];
    const fb = fallback.phases[idx];
    if (!rawMatch) return fb;

    const rawExList = Array.isArray(rawMatch.exercicesProgressifs)
      ? (rawMatch.exercicesProgressifs as Array<Record<string, unknown>>)
      : [];
    const exercicesProgressifs: ExerciceProgressifPhase[] | undefined =
      rawExList.length >= 2
        ? rawExList.map((ex, i) => {
            const palierRaw = String(ex.palier || '');
            const palier: ExerciceProgressifPhase['palier'] =
              palierRaw.includes('3') || palierRaw.toLowerCase().includes('défi')
                ? 'Palier 3 · Défi'
                : palierRaw.includes('2') || palierRaw.toLowerCase().includes('entraînement')
                ? 'Palier 2 · Entraînement'
                : i === 2
                ? 'Palier 3 · Défi'
                : i === 1
                ? 'Palier 2 · Entraînement'
                : 'Palier 1 · Découverte';
            const choix = Array.isArray(ex.choix)
              ? ex.choix.map((c) => String(c || '').trim()).filter(Boolean)
              : undefined;
            return {
              id: `${phaseKey}-ai-ex-${i + 1}`,
              palier,
              type: ex.type === 'choix' && choix && choix.length >= 2 ? 'choix' : 'saisie',
              consigne: String(ex.consigne || ''),
              donneesConcretes: String(ex.donneesConcretes || rawMatch.donneesConcretes || ''),
              choix: ex.type === 'choix' && choix && choix.length >= 2 ? choix : undefined,
              reponseAttendue: String(ex.reponseAttendue || ''),
              unite: ex.unite ? String(ex.unite) : undefined,
              indice: String(ex.indice || ''),
              explication: String(ex.explication || ''),
              lienSituationProbleme: String(
                ex.lienSituationProbleme || context.situationProbleme || context.titre || ''
              ),
            };
          })
        : fb.exercicesProgressifs;

    const rawQrList = Array.isArray(rawMatch.questionsReponsesPhase)
      ? (rawMatch.questionsReponsesPhase as Array<Record<string, unknown>>)
      : [];
    const questionsReponsesPhase: QuestionReponsePhase[] | undefined =
      rawQrList.length >= 1
        ? rawQrList.map((qr, i) => ({
            id: `${phaseKey}-ai-qr-${i + 1}`,
            question: String(qr.question || ''),
            reponseAttendue: String(qr.reponseAttendue || ''),
            indice: String(qr.indice || ''),
            ancrageThemeTitreSituation: String(
              qr.ancrageThemeTitreSituation ||
                `${context.theme || ''} · ${context.titre || ''}`
            ),
          }))
        : fb.questionsReponsesPhase;

    return {
      phase: phaseKey,
      titrePhase: rawMatch.titrePhase || fb.titrePhase,
      modalite: rawMatch.modalite || fb.modalite,
      donneesConcretes: rawMatch.donneesConcretes || fb.donneesConcretes,
      materielConcret: rawMatch.materielConcret || fb.materielConcret,
      actionSchemaEleve: rawMatch.actionSchemaEleve || fb.actionSchemaEleve,
      etayageInclusifAPC: rawMatch.etayageInclusifAPC || fb.etayageInclusifAPC,
      svgSchemaCode:
        typeof rawMatch.svgSchemaCode === 'string' && rawMatch.svgSchemaCode.includes('<svg')
          ? sanitizeSvg(rawMatch.svgSchemaCode, '0 0 360 200')
          : fb.svgSchemaCode,
      exercicesProgressifs,
      questionsReponsesPhase,
    };
  });

  return enrichManipulationPhases(
    {
      actif: true,
      cbCode: resolvedCb,
      cbLibelle:
        rawSchem.cbLibelle?.trim() ||
        context.competenceDeBase?.trim() ||
        CB_MATH_CATALOG[resolvedCb].libelle,
      situationProblemeReference:
        rawSchem.situationProblemeReference?.trim() ||
        context.situationProbleme?.trim() ||
        fallback.situationProblemeReference,
      titreLeconReference:
        rawSchem.titreLeconReference?.trim() ||
        context.titre ||
        fallback.titreLeconReference,
      phases: normalizedPhases,
      synthesePassageAbstraction:
        rawSchem.synthesePassageAbstraction?.trim() ||
        fallback.synthesePassageAbstraction,
    },
    {
      matiere: context.matiere,
      disciplineId: context.disciplineId,
      competenceDeBase: context.competenceDeBase,
      titre: context.titre,
      theme: context.theme,
      situationProbleme: context.situationProbleme,
      niveau: context.niveau,
    }
  );
}

export function buildFicheFromAi(
  raw: Record<string, any>,
  options: {
    idPrefix?: string;
    disciplineId?: string;
    fallbackTitre?: string;
    fallbackTheme?: string;
    fallbackMatiere?: string;
    fallbackNiveau?: string;
    fallbackDuree?: string;
    fallbackCb?: string;
    cbCodeHint?: CbMathType;
    handicapProfiles?: HandicapProfileId[];
    modeCreation: 'ia' | 'import' | 'manuel';
    historyAction: string;
    historyResume: string;
    referenceFiche?: FicheAPC | null;
    fichierSource?: FichierSourceMetadata;
  }
): FicheAPC {
  const now = new Date().toISOString();
  const id = createUid(options.idPrefix || 'fiche');
  const rawSteps = Array.isArray(raw.deroulement) ? raw.deroulement : [];
  const profile = findDisciplineProfile(
    options.disciplineId ||
      options.referenceFiche?.disciplineId ||
      raw.matiere ||
      options.fallbackMatiere,
    raw.titre || options.fallbackTitre
  );

  const deroulement =
    rawSteps.length > 0
      ? rawSteps.map((step: Record<string, string>, idx: number) => {
          const refStep = options.referenceFiche?.deroulement?.[idx];
          const etape = refStep
            ? refStep.etape
            : step.etape || profile.etapesCanoniques[idx]?.etape || `Étape ${idx + 1}`;
          const sousTitreInvariable = refStep
            ? refStep.sousTitreInvariable ||
              inferInvariantSubtitle(refStep.etape, idx, profile.id)
            : profile.etapesCanoniques[idx]?.sousTitreInvariable ||
              step.sousTitreInvariable ||
              inferInvariantSubtitle(etape, idx, profile.id);

          return {
            id: `${id}-step-${idx + 1}`,
            etape,
            sousTitreInvariable,
            duree:
              step.duree ||
              refStep?.duree ||
              profile.etapesCanoniques[idx]?.duree ||
              '8 min',
            activitesMaitre: step.activitesMaitre || '',
            activitesEleves: step.activitesEleves || '',
            indicateursInclusifs: step.indicateursInclusifs || '',
            indicateurValide: false,
          };
        })
      : (options.referenceFiche?.deroulement?.length
          ? options.referenceFiche.deroulement
          : profile.etapesCanoniques
        ).map((srcStep, idx) => ({
          id: `${id}-step-${idx + 1}`,
          etape: srcStep.etape || `Étape ${idx + 1}`,
          sousTitreInvariable:
            srcStep.sousTitreInvariable ||
            inferInvariantSubtitle(srcStep.etape, idx, profile.id),
          duree: srcStep.duree || '8 min',
          activitesMaitre:
            'activitesMaitre' in srcStep && srcStep.activitesMaitre
              ? srcStep.activitesMaitre
              : `• Conduit « ${srcStep.etape} ».\nQ1 : Quel élément clé repérez-vous ?\nQ2 : Comment justifier votre réponse ?`,
          activitesEleves:
            'activitesEleves' in srcStep && srcStep.activitesEleves
              ? srcStep.activitesEleves
              : 'R1 : Observent, manipulent et répondent.\nR2 : Verbalisent leur démarche.',
          indicateursInclusifs:
            'indicateursInclusifs' in srcStep && srcStep.indicateursInclusifs
              ? srcStep.indicateursInclusifs
              : `${'focusInclusif' in srcStep ? srcStep.focusInclusif : 'Critères observables APC.'}\n[Inclusion handicap] DYS/Visuel/Auditif/Moteur/TSA : consignes courtes numérotées et support adapté.`,
          indicateurValide: false,
        }));

  const resolvedTitre = raw.titre || options.fallbackTitre || 'Fiche pédagogique APC';
  const resolvedTheme = raw.theme || options.fallbackTheme || 'Séance APC structurée';
  const resolvedMatiere = raw.matiere || options.fallbackMatiere || profile.matiere;
  const resolvedNiveau = raw.niveau || options.fallbackNiveau || 'CM2';
  const resolvedCb =
    raw.competenceDeBase ||
    options.fallbackCb ||
    `${profile.cbPrefixe} — ${raw.competenceVisee || resolvedTheme}`;
  const resolvedIntro = raw.introduction || {
    accroche: '',
    miseEnSituation: '',
    consigneDepart: '',
  };

  const resolvedDisciplineId =
    options.disciplineId || options.referenceFiche?.disciplineId || profile.id;
  const situationForPhases =
    resolvedIntro.accroche || resolvedIntro.miseEnSituation || resolvedTheme;

  const schematisationMath = normalizeSchematisationMath(raw.schematisationMath, {
    matiere: resolvedMatiere,
    disciplineId: resolvedDisciplineId,
    cbCode: options.cbCodeHint,
    competenceDeBase: resolvedCb,
    titre: resolvedTitre,
    theme: resolvedTheme,
    situationProbleme: situationForPhases,
    niveau: resolvedNiveau,
  });

  const phasesManipulation = !schematisationMath
    ? buildUniversalManipulationSchematisation({
        matiere: resolvedMatiere,
        disciplineId: resolvedDisciplineId,
        competenceDeBase: resolvedCb,
        titre: resolvedTitre,
        theme: resolvedTheme,
        situationProbleme: situationForPhases,
        niveau: resolvedNiveau,
        deroulement,
      })
    : undefined;

  return {
    id,
    disciplineId: options.disciplineId || options.referenceFiche?.disciplineId || profile.id,
    origineModele: options.referenceFiche?.origineModele,
    fichierSource: options.fichierSource,
    handicapsInclus: normalizeHandicapProfiles(
      options.handicapProfiles && options.handicapProfiles.length > 0
        ? options.handicapProfiles
        : options.referenceFiche?.handicapsInclus || DEFAULT_HANDICAP_PROFILES
    ),
    titre: resolvedTitre,
    theme: resolvedTheme,
    matiere: resolvedMatiere,
    niveau: resolvedNiveau,
    duree: raw.duree || options.fallbackDuree || '45 min',
    effectif: raw.effectif || '5 à 6 élèves (groupe APC)',
    competenceDeBase: resolvedCb,
    competenceVisee: raw.competenceVisee || '',
    objectifsSpecifiques: Array.isArray(raw.objectifsSpecifiques)
      ? raw.objectifsSpecifiques
      : [],
    prerequis: Array.isArray(raw.prerequis) ? raw.prerequis : [],
    materiel: Array.isArray(raw.materiel) ? raw.materiel : [],
    introduction: resolvedIntro,
    deroulement,
    questionsReponses: Array.isArray(raw.questionsReponses)
      ? raw.questionsReponses.map((qr: Record<string, string>, idx: number) => ({
          id: `${id}-qr-${idx + 1}`,
          question: qr.question || '',
          reponseAttendue: qr.reponseAttendue || '',
          indicePedagogique: qr.indicePedagogique || '',
          difficulte:
            qr.difficulte === 'Approfondissement' || qr.difficulte === 'Défi'
              ? qr.difficulte
              : 'Fondamental',
        }))
      : [],
    illustration: {
      titre: raw.illustration?.titre || `Schéma : ${resolvedTitre}`,
      legende: raw.illustration?.legende || '',
      typeSchema: raw.illustration?.typeSchema || 'svg',
      svgCode: sanitizeSvg(raw.illustration?.svgCode),
      annotations: Array.isArray(raw.illustration?.annotations)
        ? raw.illustration.annotations.map(
            (ann: { x: number; y: number; label: string; detail: string }, idx: number) => ({
              id: `${id}-ann-${idx + 1}`,
              x: Math.min(90, Math.max(10, Number(ann.x) || 50)),
              y: Math.min(85, Math.max(15, Number(ann.y) || 50)),
              label: ann.label || `Repère ${idx + 1}`,
              detail: ann.detail || '',
            })
          )
        : [],
    },
    objetManipulable: raw.objetManipulable || {
      actif: false,
      type: 'fractions',
      titre: 'Outil manipulable',
      consigne: '',
      parametres: { valeurA: 1, valeurB: 2, denominateur: 4, unite: 'unités' },
    },
    schematisationMath,
    phasesManipulation,
    synthese: raw.synthese || {
      resumeCle: '',
      traceEcriteEleve: '',
      motsCles: [],
      prolongement: '',
    },
    suggestionsIA: Array.isArray(raw.suggestionsIA)
      ? raw.suggestionsIA.map((sug: Record<string, string>, idx: number) => ({
          id: `${id}-sug-${idx + 1}`,
          categorie: (sug.categorie as FicheAPC['suggestionsIA'][number]['categorie']) || 'Clarté',
          titre: sug.titre || 'Suggestion pédagogique',
          constat: sug.constat || '',
          proposition: sug.proposition || '',
          appliquee: false,
        }))
      : [],
    historique: [
      {
        id: `${id}-hist-1`,
        date: now,
        action: options.historyAction,
        resume: options.historyResume,
      },
    ],
    modeCreation: options.modeCreation,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateFicheDiffSummary(
  before: FicheAPC,
  after: FicheAPC
): string[] {
  const changed: string[] = [];

  if (
    before.titre !== after.titre ||
    before.theme !== after.theme ||
    before.matiere !== after.matiere ||
    before.niveau !== after.niveau ||
    before.duree !== after.duree ||
    before.effectif !== after.effectif
  ) {
    changed.push('En-tête & Identité de la fiche');
  }

  if (
    before.competenceDeBase !== after.competenceDeBase ||
    before.competenceVisee !== after.competenceVisee ||
    JSON.stringify(before.objectifsSpecifiques) !== JSON.stringify(after.objectifsSpecifiques) ||
    JSON.stringify(before.prerequis) !== JSON.stringify(after.prerequis) ||
    JSON.stringify(before.materiel) !== JSON.stringify(after.materiel) ||
    JSON.stringify(before.introduction) !== JSON.stringify(after.introduction)
  ) {
    changed.push('Cadre APC (CB, objectifs, matériel & mise en situation)');
  }

  const changedSteps: number[] = [];
  const maxSteps = Math.max(before.deroulement.length, after.deroulement.length);
  for (let i = 0; i < maxSteps; i++) {
    const a = before.deroulement[i];
    const b = after.deroulement[i];
    if (
      !a ||
      !b ||
      a.etape !== b.etape ||
      a.duree !== b.duree ||
      a.activitesMaitre !== b.activitesMaitre ||
      a.activitesEleves !== b.activitesEleves ||
      a.indicateursInclusifs !== b.indicateursInclusifs
    ) {
      changedSteps.push(i + 1);
    }
  }
  if (changedSteps.length > 0) {
    changed.push(
      changedSteps.length === 1
        ? `Contenu déroulement (Étape ${changedSteps[0]})`
        : `Contenu déroulement (${changedSteps.length} étapes : ${changedSteps.join(', ')})`
    );
  }

  if (
    JSON.stringify(before.handicapsInclus || []) !==
    JSON.stringify(after.handicapsInclus || [])
  ) {
    changed.push('Profils d’inclusion handicap');
  }

  if (
    JSON.stringify(before.questionsReponses) !==
    JSON.stringify(after.questionsReponses)
  ) {
    changed.push('Questions-réponses interactives');
  }

  if (
    JSON.stringify(before.schematisationMath || null) !==
      JSON.stringify(after.schematisationMath || null) ||
    JSON.stringify(before.phasesManipulation || null) !==
      JSON.stringify(after.phasesManipulation || null)
  ) {
    changed.push('Schématisation & exercices par phase de manipulation');
  }

  if (
    before.illustration?.svgCode !== after.illustration?.svgCode ||
    before.illustration?.titre !== after.illustration?.titre ||
    before.illustration?.legende !== after.illustration?.legende
  ) {
    changed.push('Illustration SVG annotée');
  }

  if (JSON.stringify(before.synthese) !== JSON.stringify(after.synthese)) {
    changed.push('Synthèse & trace écrite');
  }

  return changed;
}
