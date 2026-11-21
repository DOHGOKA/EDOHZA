import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import {
  getGeminiClient,
  GEMINI_MODEL,
  FICHE_APC_SCHEMA,
  sanitizeSvg,
  callGeminiWithRetry,
  parseGeminiJson,
  resolveThinkingLevel,
  normalizeSchematisationMath,
  parseRequestJson,
  validateBase64Payload,
  generateFicheDiffSummary,
  getHttpStatusFromError,
} from '@/lib/gemini';
import {
  FicheAPC,
  HandicapProfileId,
  ReasoningQuality,
  RetouchScope,
} from '@/lib/types';
import { createCompactSnapshot, inferInvariantSubtitle } from '@/lib/storage';
import {
  buildUniversalManipulationSchematisation,
  enrichManipulationPhases,
} from '@/lib/manipulation-phases';
import { createUid } from '@/lib/utils';
import {
  buildDisciplinePromptDirectives,
  findDisciplineProfile,
  getDisciplineSubtitleForStep,
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

const RETOUCH_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ficheMiseAJour: FICHE_APC_SCHEMA,
    resumeModifications: {
      type: Type.STRING,
      description: 'Résumé clair en 1 à 2 phrases des modifications effectuées sur la fiche.',
    },
    regleApprentissage: {
      type: Type.STRING,
      description:
        "Règle générale réutilisable déduite du commentaire de l'enseignant pour les futures fiches (laisser vide si non applicable).",
    },
  },
  required: ['ficheMiseAJour', 'resumeModifications', 'regleApprentissage'],
};

const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    diagnosticGlobal: {
      type: Type.STRING,
      description: 'Analyse sémantique et structurelle synthétique de la fiche actuelle.',
    },
    suggestions: {
      type: Type.ARRAY,
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
  required: ['diagnosticGlobal', 'suggestions'],
};

const ENRICH_QR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questionsReponses: {
      type: Type.ARRAY,
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
  },
  required: ['questionsReponses'],
};

interface SourceFilePayload {
  format: 'docx' | 'pdf' | 'text' | 'image';
  fileName: string;
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
  tailleOctets?: number;
}

const SCOPE_LABELS: Record<RetouchScope, string> = {
  contenu_etapes: 'Contenu des étapes (Activités M/É & Indicateurs)',
  cadre_apc: 'En-tête & Cadre APC (CB, objectifs, mise en situation)',
  inclusion_handicap: 'Adaptations d’inclusion handicap',
  qr_evaluation: 'Questions-réponses & évaluation',
  schematisation_math: 'Phases de manipulation, schémas, exercices & Q&R',
  complet: 'Fiche complète',
};

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const {
      mode = 'modify',
      fiche,
      instruction = '',
      disciplineId,
      handicapProfiles,
      hauteGamme = false,
      preferences = [],
      quality = 'expert',
      preserveInvariantSubtitles = true,
      regenerateDiagram = false,
      targetStepIndex,
      retouchScope,
      appliedSuggestionId,
      sourceFile = null,
    } = body as {
      mode: 'modify' | 'analyze' | 'enrich_qr' | 'retouch_discipline';
      fiche: FicheAPC;
      instruction?: string;
      disciplineId?: string;
      handicapProfiles?: HandicapProfileId[];
      hauteGamme?: boolean;
      preferences?: { regle: string }[];
      quality?: ReasoningQuality;
      preserveInvariantSubtitles?: boolean;
      regenerateDiagram?: boolean;
      targetStepIndex?: number;
      retouchScope?: RetouchScope;
      appliedSuggestionId?: string;
      sourceFile?: SourceFilePayload | null;
    };

    if (!fiche || !Array.isArray(fiche.deroulement)) {
      return NextResponse.json(
        { error: 'Fiche APC invalide ou manquante.' },
        { status: 400 }
      );
    }

    if (sourceFile) {
      if (
        sourceFile.format !== 'docx' &&
        sourceFile.format !== 'pdf' &&
        sourceFile.format !== 'text' &&
        sourceFile.format !== 'image'
      ) {
        return NextResponse.json(
          { error: 'Format de fichier d’appui non pris en charge (docx, pdf, image ou text).' },
          { status: 400 }
        );
      }
      if ((sourceFile.format === 'pdf' || sourceFile.format === 'image') && !sourceFile.base64Data) {
        return NextResponse.json(
          { error: `Le contenu du fichier ${sourceFile.format.toUpperCase()} d’appui est manquant.` },
          { status: 400 }
        );
      }
      if (sourceFile.base64Data) {
        validateBase64Payload(
          sourceFile.base64Data,
          12 * 1024 * 1024,
          `Le fichier ${sourceFile.format.toUpperCase()} d’appui`
        );
      }
      if ((sourceFile.format === 'docx' || sourceFile.format === 'text') && !sourceFile.textContent?.trim()) {
        return NextResponse.json(
          { error: 'Le fichier texte/Word d’appui semble vide ou illisible.' },
          { status: 400 }
        );
      }
    }

    const ai = getGeminiClient();
    const effectiveQuality: ReasoningQuality = hauteGamme ? 'expert' : quality;
    const thinkingLevel = resolveThinkingLevel(effectiveQuality);
    const originalProfile = findDisciplineProfile(
      fiche.disciplineId || fiche.matiere,
      fiche.titre
    );
    const activeProfile = findDisciplineProfile(
      disciplineId || fiche.disciplineId || fiche.matiere,
      fiche.titre
    );
    const isSameDiscipline = activeProfile.id === originalProfile.id;
    const selectedHandicaps = normalizeHandicapProfiles(
      Array.isArray(handicapProfiles) && handicapProfiles.length > 0
        ? handicapProfiles
        : fiche.handicapsInclus && fiche.handicapsInclus.length > 0
        ? fiche.handicapsInclus
        : DEFAULT_HANDICAP_PROFILES
    );
    const inclusionBlock = buildInclusionHandicapDirectives(
      selectedHandicaps,
      Boolean(hauteGamme || effectiveQuality === 'expert')
    );

    if (mode === 'analyze') {
      const response = await callGeminiWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: `Analyse cette fiche pédagogique APC (${activeProfile.nom}) sur le plan sémantique, structurel, didactique et inclusif (CB, respect des sous-titres d'étapes de la discipline, Activités du maître, Activités des élèves, Indicateurs inclusifs APC & inclusion handicap, Q&R interactives), puis propose 3 à 4 améliorations concrètes et directement applicables :\n\n${JSON.stringify(
          {
            titre: fiche.titre,
            theme: fiche.theme,
            matiere: fiche.matiere,
            discipline: activeProfile.nom,
            niveau: fiche.niveau,
            duree: fiche.duree,
            competenceDeBase: fiche.competenceDeBase,
            competenceVisee: fiche.competenceVisee,
            handicapsInclus: selectedHandicaps,
            introduction: fiche.introduction,
            deroulement: fiche.deroulement,
            questionsReponses: fiche.questionsReponses,
            synthese: fiche.synthese,
          }
        )}`,
        config: {
          systemInstruction: `Tu es un conseiller pédagogique spécialisé en APC et école inclusive (inclusion des enfants en situation de handicap) pour la discipline « ${activeProfile.nom} ». Piliers inclusifs attendus : ${activeProfile.piliersInclusifsAPC.join(' ; ')}.\n\n${inclusionBlock}\n\nProduis un diagnostic précis et des suggestions actionnables de qualité haute gamme.`,
          responseMimeType: 'application/json',
          responseSchema: ANALYSIS_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel },
        },
      });

      const parsed = parseGeminiJson<{
        diagnosticGlobal?: string;
        suggestions?: Record<string, string>[];
      }>(response.text, 'Réponse d’analyse vide.');

      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((s, idx) => ({
            id: `sug-${Date.now()}-${idx}`,
            categorie: (s.categorie as FicheAPC['suggestionsIA'][number]['categorie']) || 'Clarté',
            titre: s.titre || 'Amélioration suggérée',
            constat: s.constat || '',
            proposition: s.proposition || '',
            appliquee: false,
          }))
        : [];

      return NextResponse.json({
        diagnosticGlobal: parsed.diagnosticGlobal || '',
        suggestions,
      });
    }

    if (mode === 'enrich_qr') {
      const response = await callGeminiWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: `Génère 4 à 5 questions-réponses interactives graduées (Fondamental, Approfondissement, Défi) directement alignées avec la discipline « ${activeProfile.nom} », les Activités du maître, Activités des élèves et Indicateurs inclusifs de cette fiche :\n\n${JSON.stringify(
          {
            titre: fiche.titre,
            theme: fiche.theme,
            matiere: fiche.matiere,
            discipline: activeProfile.nom,
            niveau: fiche.niveau,
            competenceDeBase: fiche.competenceDeBase,
            deroulement: fiche.deroulement,
          }
        )}`,
        config: {
          systemInstruction:
            'Tu conçois des questions-réponses interactives pour la classe avec réponse attendue claire et indice d’étayage immédiat pour l’enseignant ou l’élève.',
          responseMimeType: 'application/json',
          responseSchema: ENRICH_QR_SCHEMA,
          thinkingConfig: { thinkingLevel },
        },
      });

      const parsed = parseGeminiJson<{
        questionsReponses?: Record<string, string>[];
      }>(response.text, 'Impossible de générer des questions-réponses.');

      const now = new Date().toISOString();
      const nextQr = Array.isArray(parsed.questionsReponses)
        ? parsed.questionsReponses.map((qr, idx) => ({
            id: createUid(`qr-${idx}`),
            question: qr.question || '',
            reponseAttendue: qr.reponseAttendue || '',
            indicePedagogique: qr.indicePedagogique || '',
            difficulte: (qr.difficulte === 'Approfondissement' || qr.difficulte === 'Défi'
              ? qr.difficulte
              : 'Fondamental') as 'Fondamental' | 'Approfondissement' | 'Défi',
          }))
        : Array.isArray(fiche.questionsReponses)
        ? fiche.questionsReponses
        : [];

      const updatedFiche: FicheAPC = {
        ...fiche,
        questionsReponses: nextQr,
        derniereRetouche: {
          date: now,
          scope: 'qr_evaluation',
          resume: `${nextQr.length} questions-réponses interactives générées en cohérence avec le déroulement.`,
          sectionsModifiees: ['Questions-réponses interactives'],
        },
        historique: [
          {
            id: createUid('hist'),
            date: now,
            action: 'Enrichissement Q&R IA',
            resume: `${nextQr.length} questions-réponses interactives générées en cohérence avec le déroulement.`,
            snapshot: createCompactSnapshot(fiche),
          },
          ...(Array.isArray(fiche.historique) ? fiche.historique.slice(0, 14) : []),
        ],
        updatedAt: now,
      };

      return NextResponse.json({
        fiche: updatedFiche,
        resumeModifications: `${nextQr.length} questions-réponses interactives générées.`,
        sectionsModifiees: ['Questions-réponses interactives'],
        regleApprentissage: '',
      });
    }

    const isDisciplineFullRetouch = mode === 'retouch_discipline';
    const effectiveScope: RetouchScope =
      retouchScope ||
      (typeof targetStepIndex === 'number' && !isDisciplineFullRetouch
        ? 'contenu_etapes'
        : 'complet');

    if (!isDisciplineFullRetouch && !instruction.trim() && !sourceFile) {
      return NextResponse.json(
        { error: 'Veuillez préciser la modification souhaitée ou joindre un fichier d’appui.' },
        { status: 400 }
      );
    }

    const prefsContext =
      Array.isArray(preferences) && preferences.length > 0
        ? `\nPréférences mémorisées de l'enseignant :\n${preferences
            .map((p) => `- ${p.regle}`)
            .join('\n')}`
        : '';

    const disciplineBlock = buildDisciplinePromptDirectives(
      activeProfile,
      preserveInvariantSubtitles
    );

    const invariantRule = preserveInvariantSubtitles
      ? `\nCONTRAINTE D'INVARIANCE PAR MATIÈRE : Les sous-titres des étapes ("sousTitreInvariable") doivent impérativement respecter ceux de la discipline « ${activeProfile.nom} » ci-dessus.`
      : '';

    const scopeDirective = (() => {
      switch (effectiveScope) {
        case 'contenu_etapes':
          return typeof targetStepIndex === 'number' && fiche.deroulement[targetStepIndex]
            ? `\nPORTÉE VERROUILLÉE (Étape #${targetStepIndex + 1} uniquement) : Modifie EXCLUSIVEMENT "activitesMaitre", "activitesEleves" et "indicateursInclusifs" de l'étape #${targetStepIndex + 1} (« ${fiche.deroulement[targetStepIndex].etape} »). Conserve strictement à l'identique l'en-tête, le cadre APC, les autres étapes et la synthèse.`
            : `\nPORTÉE VERROUILLÉE (Contenu des étapes) : Concentre exclusivement la retouche sur "activitesMaitre", "activitesEleves" et "indicateursInclusifs" des étapes du déroulement. Ne modifie pas le titre, la matière, le niveau ni l'identité de la fiche.`;
        case 'cadre_apc':
          return `\nPORTÉE VERROUILLÉE (En-tête & Cadre APC) : Concentre la retouche uniquement sur titre, thème, competenceDeBase, competenceVisee, objectifsSpecifiques, prerequis, materiel et introduction. Laisse les étapes du déroulement, les Q&R et la synthèse inchangées.`;
        case 'inclusion_handicap':
          return `\nPORTÉE VERROUILLÉE (Inclusion handicap) : Préserve le sujet, le titre, la matière et la progression d'origine, mais enrichis le matériel adapté, les gestes inclusifs du maître, les modalités accessibles pour les élèves, et les "[Inclusion handicap]" dans "indicateursInclusifs" pour les profils sélectionnés.`;
        case 'qr_evaluation':
          return `\nPORTÉE VERROUILLÉE (Q&R & Évaluation) : Mets à jour uniquement "questionsReponses" (3 à 5 items gradués Fondamental / Approfondissement / Défi avec indice pédagogique) sans altérer les autres sections de la fiche.`;
        case 'schematisation_math':
          return `\nPORTÉE VERROUILLÉE (Phases de manipulation & schématisation) : Mets à jour uniquement les 3 phases de manipulation (collective, petits_groupes, individuelle) reliées au thème, au titre et à la situation-problème, avec données concrètes, schémas SVG compacts, 3 exercices progressifs (Paliers 1-3) et 2 Q&R par phase, sans altérer l'en-tête ni les autres sections.`;
        default:
          return '';
      }
    })();

    const keepExistingDetailedStructure =
      isSameDiscipline &&
      (Boolean(fiche.origineModele) || fiche.deroulement.length > 5);

    const baseInstruction = isDisciplineFullRetouch
      ? keepExistingDetailedStructure
        ? `RETOUCHE HAUTE GAMME INCLUSIVE POUR LA DISCIPLINE SPÉCIFIQUE « ${activeProfile.nom} » :
1. Préserve fidèlement la spécificité disciplinaire, les références de manuels/textes et EXACTEMENT les ${fiche.deroulement.length} étapes existantes ainsi que leurs sous-titres invariables.
2. Enrichis de façon approfondie et haute gamme chaque cellule : Activités du maître (questions Q1/Q2, gestes professionnels, guidage visuel et oral), Activités des élèves (réponses R1/R2 attendues, manipulations, tâches actives) et Indicateurs Pédagogiques Inclusifs [Inclusion handicap] directement opératoires pour les profils sélectionnés.
3. Enrichis les Q&R interactives, le matériel adapté (sans supprimer le matériel d'origine) et la synthèse inclusive.${
            instruction.trim()
              ? `\nPrécisions supplémentaires de l'enseignant : ${instruction.trim()}`
              : ''
          }`
        : `RETOUCHE COMPLÈTE DE LA FICHE PÉDAGOGIQUE POUR LA DISCIPLINE SPÉCIFIQUE « ${activeProfile.nom} » :
1. Réécris et harmonise intégralement l'en-tête (competenceDeBase au format "${activeProfile.cbPrefixe}", competenceVisee, objectifsSpecifiques, prerequis, materiel adapté) et l'introduction pour cette discipline.
2. Restructure les ${activeProfile.etapesCanoniques.length} étapes du déroulement en respectant EXACTEMENT les intitulés d'étapes et les sous-titres invariables de « ${activeProfile.nom} ».
3. Enrichis de façon approfondie chaque cellule : Activités du maître (gestes professionnels, consignes courtes), Activités des élèves (tâches actives propres à la discipline) et Indicateurs Pédagogiques Inclusifs en APC avec aménagements concrets pour les enfants en situation de handicap.
4. Adapte les questions-réponses interactives et la synthèse trace écrite inclusive.${
            instruction.trim()
              ? `\nPrécisions supplémentaires de l'enseignant : ${instruction.trim()}`
              : ''
          }`
      : instruction.trim() ||
        (sourceFile
          ? `Exploite le fichier externe joint (« ${sourceFile.fileName} ») pour retoucher la fiche active selon la portée demandée (${SCOPE_LABELS[effectiveScope]}), tout en conservant l'identité et la structure APC de la fiche active.`
          : 'Améliore la fiche.');

    const mathActive = isMathContext(
      isDisciplineFullRetouch ? activeProfile.matiere : fiche.matiere,
      activeProfile.id
    );
    const resolvedCb = mathActive
      ? normalizeCbMathCode(
          fiche.schematisationMath?.cbCode,
          fiche.competenceDeBase,
          fiche.titre,
          fiche.theme
        )
      : undefined;

    const mathRetouchRule =
      mathActive && resolvedCb
        ? `\n\n${buildMathSchematisationPromptRules({
            cbCode: resolvedCb,
            titre: fiche.titre,
            theme: fiche.theme,
            situationProbleme:
              fiche.introduction?.accroche ||
              fiche.introduction?.miseEnSituation ||
              fiche.theme,
            niveau: fiche.niveau,
          })}`
        : effectiveScope === 'schematisation_math' || effectiveScope === 'complet' || isDisciplineFullRetouch
        ? `\n\nLa discipline « ${activeProfile.nom} » n'est pas Mathématiques : si l'instruction ou la portée demande d'enrichir les phases de manipulation, renseigne "schematisationMath" avec actif=true et exactement 3 phases (collective, petits_groupes, individuelle) contenant des données concrètes disciplinaires (extraits, mesures, faits, consignes), un svgSchemaCode compact adapté, 3 exercices progressifs (Paliers 1-3) et 2 Q&R de phase ancrées au thème, au titre et à la situation-problème.`
        : '\n\nSi la discipline n’est pas Mathématiques et que la portée ne vise pas les phases de manipulation, définis schematisationMath.actif = false et schematisationMath.phases = [].';

    const diagramRule =
      regenerateDiagram
        ? 'Régénère un schéma SVG propre et adapté à la discipline demandée dans illustration.svgCode.'
        : 'Si l’instruction ne demande pas de modifier le schéma graphique, retourne une chaîne vide "" pour illustration.svgCode afin de conserver le schéma actuel et d’accélérer la réponse.';

    const currentManipData = mathActive
      ? fiche.schematisationMath
      : fiche.phasesManipulation;

    const fichePayloadText = `Voici la fiche APC actuelle à retoucher (Portée : ${SCOPE_LABELS[effectiveScope]}) :\n${JSON.stringify({
      titre: fiche.titre,
      theme: fiche.theme,
      matiere: fiche.matiere,
      disciplineId: activeProfile.id,
      niveau: fiche.niveau,
      duree: fiche.duree,
      effectif: fiche.effectif,
      competenceDeBase: fiche.competenceDeBase,
      competenceVisee: fiche.competenceVisee,
      objectifsSpecifiques: fiche.objectifsSpecifiques,
      prerequis: fiche.prerequis,
      materiel: fiche.materiel,
      introduction: fiche.introduction,
      deroulement: fiche.deroulement,
      questionsReponses: fiche.questionsReponses,
      phasesManipulationActuelles: currentManipData
        ? {
            situationProblemeReference: currentManipData.situationProblemeReference,
            synthesePassageAbstraction: currentManipData.synthesePassageAbstraction,
            phases: (currentManipData.phases || []).map((p) => ({
              phase: p.phase,
              titrePhase: p.titrePhase,
              modalite: p.modalite,
              donneesConcretes: p.donneesConcretes,
              materielConcret: p.materielConcret,
              actionSchemaEleve: p.actionSchemaEleve,
              etayageInclusifAPC: p.etayageInclusifAPC,
              exercicesProgressifs: p.exercicesProgressifs,
              questionsReponsesPhase: p.questionsReponsesPhase,
            })),
          }
        : undefined,
      illustration: {
        titre: fiche.illustration.titre,
        legende: fiche.illustration.legende,
        typeSchema: fiche.illustration.typeSchema,
        annotations: fiche.illustration.annotations,
      },
      objetManipulable: fiche.objetManipulable,
      synthese: fiche.synthese,
    })}\n\nInstruction de retouche de l'enseignant :\n"${baseInstruction}"`;

    const fileTextSection =
      sourceFile && (sourceFile.format === 'docx' || sourceFile.format === 'text')
        ? `\n\n--- CONTENU DU FICHIER D'APPUI EXTERNE (« ${sourceFile.fileName} », format ${sourceFile.format.toUpperCase()}) ---\n${(
            sourceFile.textContent || ''
          ).slice(0, 35000)}`
        : '';

    const contents =
      sourceFile && (sourceFile.format === 'pdf' || sourceFile.format === 'image')
        ? {
            parts: [
              {
                inlineData: {
                  mimeType:
                    sourceFile.format === 'pdf'
                      ? 'application/pdf'
                      : sourceFile.mimeType || 'image/png',
                  data: sourceFile.base64Data || '',
                },
              },
              {
                text: `${fichePayloadText}\n\nDocument externe joint (« ${sourceFile.fileName} ») : extrais-en les éléments pertinents (exercices, textes, consignes, exemples ou critères) pour enrichir et retoucher la fiche active selon la portée choisie.`,
              },
            ],
          }
        : `${fichePayloadText}${fileTextSection}`;

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: `Tu es un inspecteur pédagogique et concepteur APC spécialiste de l'école inclusive (scolarisation et inclusion haute gamme des enfants en situation de handicap). Tu effectues une retouche intelligente, ciblée et respectueuse des couches de contenu sur la fiche pédagogique fournie, sans confondre un fichier externe d'appui avec la fiche structurée.
${disciplineBlock}
${inclusionBlock}${mathRetouchRule}
${diagramRule}
Déduis également si possible une règle générale courte d'apprentissage continu ("regleApprentissage") reflétant la préférence exprimée par l'enseignant.${invariantRule}${scopeDirective}${prefsContext}`,
        responseMimeType: 'application/json',
        responseSchema: RETOUCH_RESPONSE_SCHEMA,
        thinkingConfig: { thinkingLevel },
      },
    });

    const result = parseGeminiJson<{
      ficheMiseAJour?: Record<string, any>;
      resumeModifications?: string;
      regleApprentissage?: string;
    }>(response.text, 'Réponse de retouche vide.');

    const updated = result.ficheMiseAJour;
    if (!updated) {
      throw new Error('Impossible d’appliquer la retouche sur cette fiche.');
    }

    const now = new Date().toISOString();
    const stamp = Date.now();
    const preRetouchSnapshot = createCompactSnapshot(fiche);

    // Scope locking flags
    const isSingleStepLocked =
      !isDisciplineFullRetouch &&
      effectiveScope === 'contenu_etapes' &&
      typeof targetStepIndex === 'number' &&
      Boolean(fiche.deroulement[targetStepIndex]);

    const lockCadreAndIdentity =
      !isDisciplineFullRetouch &&
      (effectiveScope === 'contenu_etapes' ||
        effectiveScope === 'qr_evaluation' ||
        effectiveScope === 'schematisation_math');

    const lockDeroulement =
      !isDisciplineFullRetouch &&
      (effectiveScope === 'cadre_apc' ||
        effectiveScope === 'qr_evaluation' ||
        effectiveScope === 'schematisation_math');

    const lockQr =
      !isDisciplineFullRetouch &&
      (effectiveScope === 'cadre_apc' ||
        effectiveScope === 'schematisation_math' ||
        (effectiveScope === 'contenu_etapes' && typeof targetStepIndex !== 'number'));

    const lockSynthese =
      !isDisciplineFullRetouch &&
      (effectiveScope === 'cadre_apc' ||
        effectiveScope === 'qr_evaluation' ||
        effectiveScope === 'schematisation_math' ||
        effectiveScope === 'contenu_etapes');

    const lockIllustration =
      !regenerateDiagram &&
      !isDisciplineFullRetouch &&
      effectiveScope !== 'complet';

    const rawUpdatedSteps = Array.isArray(updated.deroulement) && updated.deroulement.length > 0
      ? updated.deroulement
      : fiche.deroulement;

    const mergedSteps = lockDeroulement
      ? fiche.deroulement
      : isSingleStepLocked
      ? fiche.deroulement.map((origStep, idx) => {
          if (idx !== targetStepIndex) return origStep;
          const step = rawUpdatedSteps[idx] || rawUpdatedSteps[0] || {};
          const canonicalSpec = activeProfile.etapesCanoniques[idx];
          return {
            ...origStep,
            duree: step.duree || origStep.duree,
            activitesMaitre: step.activitesMaitre || origStep.activitesMaitre,
            activitesEleves: step.activitesEleves || origStep.activitesEleves,
            indicateursInclusifs:
              step.indicateursInclusifs ||
              origStep.indicateursInclusifs ||
              canonicalSpec?.focusInclusif ||
              '',
          };
        })
      : rawUpdatedSteps.map((step: Record<string, string>, idx: number) => {
          const origStep = fiche.deroulement[idx];
          const canonicalSpec = activeProfile.etapesCanoniques[idx];

          let etape = step.etape || origStep?.etape || `Étape ${idx + 1}`;
          let sousTitreInvariable =
            step.sousTitreInvariable ||
            origStep?.sousTitreInvariable ||
            inferInvariantSubtitle(etape, idx, activeProfile.id);

          if (isDisciplineFullRetouch && keepExistingDetailedStructure && origStep) {
            etape = preserveInvariantSubtitles
              ? origStep.etape
              : step.etape || origStep.etape;
            sousTitreInvariable =
              origStep.sousTitreInvariable ||
              canonicalSpec?.sousTitreInvariable ||
              inferInvariantSubtitle(etape, idx, activeProfile.id);
          } else if (isDisciplineFullRetouch && canonicalSpec) {
            etape = preserveInvariantSubtitles
              ? canonicalSpec.etape
              : step.etape || canonicalSpec.etape;
            sousTitreInvariable = canonicalSpec.sousTitreInvariable;
          } else if (preserveInvariantSubtitles && origStep) {
            etape = origStep.etape;
            sousTitreInvariable =
              origStep.sousTitreInvariable ||
              canonicalSpec?.sousTitreInvariable ||
              getDisciplineSubtitleForStep(activeProfile, etape, idx);
          } else if (preserveInvariantSubtitles && canonicalSpec) {
            sousTitreInvariable = canonicalSpec.sousTitreInvariable;
          }

          return {
            id: origStep?.id || `${fiche.id}-retouch-${stamp}-${idx}`,
            etape,
            sousTitreInvariable,
            duree: step.duree || origStep?.duree || canonicalSpec?.duree || '8 min',
            activitesMaitre: step.activitesMaitre || origStep?.activitesMaitre || '',
            activitesEleves: step.activitesEleves || origStep?.activitesEleves || '',
            indicateursInclusifs:
              step.indicateursInclusifs ||
              origStep?.indicateursInclusifs ||
              canonicalSpec?.focusInclusif ||
              '',
            indicateurValide:
              isDisciplineFullRetouch && !keepExistingDetailedStructure
                ? false
                : origStep?.indicateurValide ?? false,
          };
        });

    const preservedSuggestions = (() => {
      if (appliedSuggestionId) {
        return (fiche.suggestionsIA || []).map((s) =>
          s.id === appliedSuggestionId ? { ...s, appliquee: true } : s
        );
      }
      if (
        (isDisciplineFullRetouch || effectiveScope === 'complet') &&
        Array.isArray(updated.suggestionsIA) &&
        updated.suggestionsIA.length > 0
      ) {
        return updated.suggestionsIA.map((sug: Record<string, string>, idx: number) => ({
          id: createUid(`${fiche.id}-sug-${idx}`),
          categorie: (sug.categorie as FicheAPC['suggestionsIA'][number]['categorie']) || 'Clarté',
          titre: sug.titre || 'Suggestion',
          constat: sug.constat || '',
          proposition: sug.proposition || '',
          appliquee: false,
        }));
      }
      return Array.isArray(fiche.suggestionsIA) ? fiche.suggestionsIA : [];
    })();

    const allowSchemUpdate =
      isDisciplineFullRetouch ||
      effectiveScope === 'complet' ||
      effectiveScope === 'schematisation_math' ||
      effectiveScope === 'inclusion_handicap';

    const mergedFiche: FicheAPC = {
      ...fiche,
      disciplineId: activeProfile.id,
      origineModele: fiche.origineModele,
      fichierSource: sourceFile
        ? {
            nom: sourceFile.fileName,
            format: sourceFile.format,
            importeLe: now,
            action: 'retouche',
            tailleOctets: sourceFile.tailleOctets,
          }
        : fiche.fichierSource,
      handicapsInclus: selectedHandicaps,
      titre:
        lockCadreAndIdentity || effectiveScope === 'inclusion_handicap'
          ? fiche.titre
          : updated.titre || fiche.titre,
      theme:
        lockCadreAndIdentity || effectiveScope === 'inclusion_handicap'
          ? fiche.theme
          : updated.theme || fiche.theme,
      matiere: isDisciplineFullRetouch
        ? activeProfile.matiere
        : lockCadreAndIdentity || effectiveScope === 'inclusion_handicap'
        ? fiche.matiere
        : updated.matiere || fiche.matiere,
      niveau:
        lockCadreAndIdentity || effectiveScope === 'inclusion_handicap'
          ? fiche.niveau
          : updated.niveau || fiche.niveau,
      duree: lockCadreAndIdentity ? fiche.duree : updated.duree || fiche.duree,
      effectif: lockCadreAndIdentity ? fiche.effectif : updated.effectif || fiche.effectif,
      competenceDeBase: lockCadreAndIdentity
        ? fiche.competenceDeBase
        : updated.competenceDeBase || fiche.competenceDeBase,
      competenceVisee:
        lockCadreAndIdentity || effectiveScope === 'inclusion_handicap'
          ? fiche.competenceVisee
          : updated.competenceVisee || fiche.competenceVisee,
      objectifsSpecifiques: lockCadreAndIdentity
        ? fiche.objectifsSpecifiques
        : Array.isArray(updated.objectifsSpecifiques)
        ? updated.objectifsSpecifiques
        : fiche.objectifsSpecifiques,
      prerequis: lockCadreAndIdentity
        ? fiche.prerequis
        : Array.isArray(updated.prerequis)
        ? updated.prerequis
        : fiche.prerequis,
      materiel: lockCadreAndIdentity
        ? fiche.materiel
        : Array.isArray(updated.materiel)
        ? updated.materiel
        : fiche.materiel,
      introduction: lockCadreAndIdentity
        ? fiche.introduction
        : updated.introduction || fiche.introduction,
      deroulement: mergedSteps,
      questionsReponses: lockQr
        ? fiche.questionsReponses
        : Array.isArray(updated.questionsReponses)
        ? updated.questionsReponses.map((qr: Record<string, string>, idx: number) => ({
            id: `${fiche.id}-qr-${stamp}-${idx}`,
            question: qr.question || '',
            reponseAttendue: qr.reponseAttendue || '',
            indicePedagogique: qr.indicePedagogique || '',
            difficulte:
              qr.difficulte === 'Approfondissement' || qr.difficulte === 'Défi'
                ? qr.difficulte
                : 'Fondamental',
          }))
        : fiche.questionsReponses,
      illustration: lockIllustration
        ? fiche.illustration
        : {
            titre: updated.illustration?.titre || fiche.illustration.titre,
            legende: updated.illustration?.legende || fiche.illustration.legende,
            typeSchema: updated.illustration?.typeSchema || fiche.illustration.typeSchema,
            svgCode: updated.illustration?.svgCode?.trim()
              ? sanitizeSvg(updated.illustration.svgCode)
              : fiche.illustration.svgCode,
            annotations: Array.isArray(updated.illustration?.annotations)
              ? updated.illustration.annotations.map(
                  (ann: { x: number; y: number; label: string; detail: string }, idx: number) => ({
                    id: `${fiche.id}-ann-${stamp}-${idx}`,
                    x: Math.min(90, Math.max(10, Number(ann.x) || 50)),
                    y: Math.min(85, Math.max(15, Number(ann.y) || 50)),
                    label: ann.label || `Repère ${idx + 1}`,
                    detail: ann.detail || '',
                  })
                )
              : fiche.illustration.annotations,
          },
      objetManipulable: lockCadreAndIdentity
        ? fiche.objetManipulable
        : updated.objetManipulable || fiche.objetManipulable,
      schematisationMath: mathActive
        ? allowSchemUpdate
          ? normalizeSchematisationMath(
              updated.schematisationMath || fiche.schematisationMath,
              {
                matiere: isDisciplineFullRetouch
                  ? activeProfile.matiere
                  : lockCadreAndIdentity
                  ? fiche.matiere
                  : updated.matiere || fiche.matiere,
                disciplineId: activeProfile.id,
                cbCode: resolvedCb,
                competenceDeBase: lockCadreAndIdentity
                  ? fiche.competenceDeBase
                  : updated.competenceDeBase || fiche.competenceDeBase,
                titre: lockCadreAndIdentity ? fiche.titre : updated.titre || fiche.titre,
                theme: lockCadreAndIdentity ? fiche.theme : updated.theme || fiche.theme,
                situationProbleme:
                  (lockCadreAndIdentity
                    ? fiche.introduction?.accroche
                    : updated.introduction?.accroche) ||
                  fiche.introduction?.accroche ||
                  fiche.theme,
                niveau: lockCadreAndIdentity ? fiche.niveau : updated.niveau || fiche.niveau,
              }
            )
          : fiche.schematisationMath
        : undefined,
      phasesManipulation: !mathActive
        ? allowSchemUpdate || isDisciplineFullRetouch || !fiche.phasesManipulation?.actif
          ? (() => {
              const effMatiere = isDisciplineFullRetouch
                ? activeProfile.matiere
                : lockCadreAndIdentity
                ? fiche.matiere
                : updated.matiere || fiche.matiere;
              const effCb = lockCadreAndIdentity
                ? fiche.competenceDeBase
                : updated.competenceDeBase || fiche.competenceDeBase;
              const effTitre = lockCadreAndIdentity
                ? fiche.titre
                : updated.titre || fiche.titre;
              const effTheme = lockCadreAndIdentity
                ? fiche.theme
                : updated.theme || fiche.theme;
              const effSit =
                (lockCadreAndIdentity
                  ? fiche.introduction?.accroche
                  : updated.introduction?.accroche) ||
                fiche.introduction?.accroche ||
                fiche.theme;
              const effNiveau = lockCadreAndIdentity
                ? fiche.niveau
                : updated.niveau || fiche.niveau;

              if (
                Array.isArray(updated.schematisationMath?.phases) &&
                updated.schematisationMath.phases.length >= 3
              ) {
                const aiPhases = normalizeSchematisationMath(
                  { ...updated.schematisationMath, actif: true },
                  {
                    matiere: effMatiere,
                    disciplineId: activeProfile.id,
                    competenceDeBase: effCb,
                    titre: effTitre,
                    theme: effTheme,
                    situationProbleme: effSit,
                    niveau: effNiveau,
                  }
                );
                if (aiPhases) {
                  return enrichManipulationPhases(aiPhases, {
                    matiere: effMatiere,
                    disciplineId: activeProfile.id,
                    competenceDeBase: effCb,
                    titre: effTitre,
                    theme: effTheme,
                    situationProbleme: effSit,
                    niveau: effNiveau,
                    deroulement: mergedSteps,
                  });
                }
              }

              return buildUniversalManipulationSchematisation({
                matiere: effMatiere,
                disciplineId: activeProfile.id,
                competenceDeBase: effCb,
                titre: effTitre,
                theme: effTheme,
                situationProbleme: effSit,
                niveau: effNiveau,
                deroulement: mergedSteps,
              });
            })()
          : fiche.phasesManipulation
        : undefined,
      synthese: lockSynthese
        ? fiche.synthese
        : updated.synthese ||
          fiche.synthese || {
            resumeCle: '',
            traceEcriteEleve: '',
            motsCles: [],
            prolongement: '',
          },
      suggestionsIA: preservedSuggestions,
      updatedAt: now,
    };

    const sectionsModifiees = generateFicheDiffSummary(fiche, mergedFiche);
    const resumeFinal =
      result.resumeModifications ||
      (isDisciplineFullRetouch
        ? `Fiche retouchée pour « ${activeProfile.nom} ».`
        : sourceFile
        ? `Fiche retouchée depuis le fichier « ${sourceFile.fileName} » (${SCOPE_LABELS[effectiveScope]}).`
        : 'Fiche mise à jour par l’IA.');

    mergedFiche.derniereRetouche = {
      date: now,
      scope: effectiveScope,
      resume: resumeFinal,
      sectionsModifiees,
      fichierAppui: sourceFile?.fileName,
    };

    mergedFiche.historique = [
      {
        id: createUid('hist'),
        date: now,
        action: sourceFile
          ? `Retouche depuis fichier (${sourceFile.format.toUpperCase()})`
          : isDisciplineFullRetouch
          ? `Retouche ${hauteGamme ? 'Haute Gamme ' : ''}— ${activeProfile.nom}`
          : typeof targetStepIndex === 'number'
          ? `Retouche étape ${targetStepIndex + 1} (${SCOPE_LABELS[effectiveScope]})`
          : `Retouche ciblée — ${SCOPE_LABELS[effectiveScope]}`,
        resume:
          sectionsModifiees.length > 0
            ? `${resumeFinal} Sections modifiées : ${sectionsModifiees.join(', ')}.`
            : resumeFinal,
        snapshot: preRetouchSnapshot,
      },
      ...(Array.isArray(fiche.historique) ? fiche.historique.slice(0, 14) : []),
    ];

    return NextResponse.json({
      fiche: mergedFiche,
      resumeModifications: resumeFinal,
      sectionsModifiees,
      regleApprentissage: result.regleApprentissage || '',
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors de la retouche IA.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
