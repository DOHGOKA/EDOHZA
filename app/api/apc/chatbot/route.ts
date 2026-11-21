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
  buildFicheFromAi,
  normalizeSchematisationMath,
  parseRequestJson,
  validateBase64Payload,
  generateFicheDiffSummary,
  getHttpStatusFromError,
} from '@/lib/gemini';
import { FicheAPC, HandicapProfileId, ReasoningQuality } from '@/lib/types';
import { createCompactSnapshot, inferInvariantSubtitle } from '@/lib/storage';
import { buildUniversalManipulationSchematisation } from '@/lib/manipulation-phases';
import { createUid } from '@/lib/utils';
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

const CHATBOT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description:
        'Réponse conversationnelle claire et concise à l’enseignant en français expliquant l’action effectuée ou les conseils pédagogiques.',
    },
    actionType: {
      type: Type.STRING,
      description:
        "Choisir parmi : 'none' (simple conseil/réponse), 'create_fiche' (création d'une nouvelle fiche APC complète ou identique au modèle), 'update_fiche' (retouche complète ou partielle de la fiche active).",
    },
    fiche: FICHE_APC_SCHEMA,
    regleApprentissage: {
      type: Type.STRING,
      description:
        'Règle pédagogique générale réutilisable retenue de cette demande (chaîne vide si aucune).',
    },
  },
  required: ['reply', 'actionType', 'regleApprentissage'],
};

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const {
      message = '',
      history = [],
      activeFiche = null,
      referenceFiche = null,
      intent = 'auto',
      sourceText = '',
      sourceImage = null,
      handicapProfiles,
      quality = 'equilibre',
      preferences = [],
    } = body as {
      message?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
      activeFiche?: FicheAPC | null;
      referenceFiche?: FicheAPC | null;
      intent?: 'auto' | 'create_identical' | 'update_active';
      sourceText?: string;
      sourceImage?: { mimeType: string; data: string } | null;
      handicapProfiles?: HandicapProfileId[];
      quality?: ReasoningQuality;
      preferences?: { regle: string }[];
    };

    if (!message.trim() && !sourceText.trim() && !sourceImage?.data) {
      return NextResponse.json(
        { error: 'Veuillez écrire, dicter ou joindre un document pour échanger avec le chatbot.' },
        { status: 400 }
      );
    }

    if (sourceImage?.data) {
      validateBase64Payload(sourceImage.data, 10 * 1024 * 1024, 'L’image jointe');
    }

    const ai = getGeminiClient();
    const isIntentUpdate = intent === 'update_active';
    const isIntentCreateIdentical = intent === 'create_identical';
    const hasExplicitNewDisciplineCue =
      !isIntentUpdate &&
      !isIntentCreateIdentical &&
      /français|francais|lecture|grammaire|conjugaison|orthographe|vocabulaire|expression|histoire|géographie|geographie|ecm|sciences|edhc|eps|anglais|informatique/i.test(
        message
      ) &&
      /crée|cree|nouvelle fiche|génère|genere|rédige|redige|prépare|prepare/i.test(
        message
      );

    const modelRef = isIntentUpdate
      ? activeFiche || referenceFiche
      : isIntentCreateIdentical
      ? referenceFiche || activeFiche
      : referenceFiche || (hasExplicitNewDisciplineCue ? null : activeFiche);

    const activeProfile = findDisciplineProfile(
      modelRef?.disciplineId || modelRef?.matiere,
      modelRef?.titre || message
    );
    const disciplineDirectiveBlock = `\n${buildDisciplinePromptDirectives(activeProfile, true)}`;
    const mathContextActive =
      isMathContext(modelRef?.matiere, activeProfile.id) ||
      (!modelRef &&
        /math|fraction|calcul|géométrie|geometrie|mesure|cb1|cb2|cb3|nombre|problème/i.test(
          message
        ));
    const mathCbHint = mathContextActive
      ? normalizeCbMathCode(
          modelRef?.schematisationMath?.cbCode,
          modelRef?.competenceDeBase,
          modelRef?.titre || message,
          modelRef?.theme
        )
      : undefined;
    const mathDirectiveBlock =
      mathContextActive && mathCbHint
        ? `\n${buildMathSchematisationPromptRules({
            cbCode: mathCbHint,
            titre: modelRef?.titre || message.slice(0, 80),
            theme: modelRef?.theme,
            situationProbleme:
              modelRef?.introduction?.accroche || sourceText.slice(0, 260) || message,
            niveau: modelRef?.niveau || 'CM2',
          })}`
        : '';

    const prefsText =
      Array.isArray(preferences) && preferences.length > 0
        ? `\nPréférences mémorisées de l'enseignant :\n${preferences
            .map((p) => `- ${p.regle}`)
            .join('\n')}`
        : '';

    const refStructureBlock = modelRef
      ? `\n${
          isIntentUpdate
            ? 'FICHE ACTIVE À RETOUCHER'
            : isIntentCreateIdentical
            ? 'FICHE MODÈLE À REPRODUIRE À L’IDENTIQUE'
            : 'CONTEXTE DE LA FICHE OUVERTE'
        } (${modelRef.titre} · ${modelRef.matiere} · ${modelRef.niveau}) :
- CB actuelle : ${modelRef.competenceDeBase || modelRef.competenceVisee}
- Étapes & sous-titres invariables :
${modelRef.deroulement
  .map(
    (s, i) =>
      `  ${i + 1}. "${s.etape}" | Sous-titre invariable: "${s.sousTitreInvariable || ''}" (${s.duree})`
  )
  .join('\n')}
- Résumé contexte actif : ${JSON.stringify({
          competenceVisee: modelRef.competenceVisee,
          introduction: modelRef.introduction,
          deroulement: modelRef.deroulement,
          questionsReponses: modelRef.questionsReponses,
          synthese: modelRef.synthese,
        })}`
      : '';

    const intentDirective =
      intent === 'create_identical'
        ? "L'utilisateur demande explicitement de CRÉER UNE NOUVELLE FICHE PÉDAGOGIQUE IDENTIQUE en structure au modèle fourni : mets actionType='create_fiche' et génère l'objet 'fiche' complet en gardant exactement les étapes et sous-titres invariables du modèle."
        : intent === 'update_active'
        ? "L'utilisateur demande de RETOUCHER LA FICHE ACTIVE : mets actionType='update_fiche' et produis l'objet 'fiche' complet mis à jour en conservant les sous-titres des étapes invariables selon la discipline."
        : "Détermine intelligemment si l'utilisateur souhaite créer une nouvelle fiche ('create_fiche'), modifier la fiche active ('update_fiche'), ou simplement recevoir un conseil ('none'). En cas de création ou modification, remplis complètement l'objet 'fiche'.";

    const selectedHandicaps = normalizeHandicapProfiles(
      Array.isArray(handicapProfiles) && handicapProfiles.length > 0
        ? handicapProfiles
        : modelRef?.handicapsInclus && modelRef.handicapsInclus.length > 0
        ? modelRef.handicapsInclus
        : DEFAULT_HANDICAP_PROFILES
    );
    const inclusionBlock = `\n${buildInclusionHandicapDirectives(
      selectedHandicaps,
      quality === 'expert'
    )}`;

    const systemInstruction = `Tu es l'assistant Chatbot IA expert de l'Atelier APC.
Tu aides les enseignants par écrit, par dictée audio transcrite, à partir d'un texte importé ou d'une image d'un texte/manuel pour :
1) Créer des fiches pédagogiques APC complètes et identiques en structure (CB en en-tête, sous-titres d'étapes invariables selon chaque discipline, Activités du maître, Activités des élèves, Indicateurs pédagogiques inclusifs en APC avec adaptations pour enfants en situation de handicap, Questions-réponses interactives, schéma SVG annoté).
2) Retoucher intelligemment une fiche existante selon ses recommandations tout en respectant les sous-titres d'étapes propres à la matière.
${intentDirective}${disciplineDirectiveBlock}${inclusionBlock}${mathDirectiveBlock}${refStructureBlock}${prefsText}`;

    const conversationHistory = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Enseignant' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const promptText = `${conversationHistory ? `Historique récent :\n${conversationHistory}\n\n` : ''}Message / recommandation actuelle de l'enseignant :
"${message.trim() || 'Crée une fiche APC structurée à partir de la pièce jointe.'}"
${sourceText.trim() ? `\nTexte joint :\n${sourceText.slice(0, 30000)}` : ''}`;

    const contents = sourceImage?.data
      ? {
          parts: [
            {
              inlineData: {
                mimeType: sourceImage.mimeType || 'image/png',
                data: sourceImage.data,
              },
            },
            {
              text: `${promptText}\n\nExtrais et exploite le texte/exercice visible sur l'image jointe.`,
            },
          ],
        }
      : promptText;

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: CHATBOT_RESPONSE_SCHEMA,
        thinkingConfig: { thinkingLevel: resolveThinkingLevel(quality) },
      },
    });

    const parsed = parseGeminiJson<{
      reply?: string;
      actionType?: 'none' | 'create_fiche' | 'update_fiche';
      fiche?: Record<string, any>;
      regleApprentissage?: string;
    }>(response.text, 'Réponse vide du chatbot.');

    const actionType = parsed.actionType || 'none';
    let resultingFiche: FicheAPC | null = null;
    let sectionsModifiees: string[] = [];

    if (actionType === 'create_fiche' && parsed.fiche) {
      const explicitRef = isIntentCreateIdentical
        ? referenceFiche || activeFiche
        : referenceFiche || undefined;
      const targetCreateProfile = explicitRef
        ? activeProfile
        : findDisciplineProfile(
            parsed.fiche.matiere,
            parsed.fiche.titre || message
          );
      const createMathActive = isMathContext(
        parsed.fiche.matiere || targetCreateProfile.matiere,
        targetCreateProfile.id
      );
      const createCbHint = createMathActive
        ? normalizeCbMathCode(
            parsed.fiche.schematisationMath?.cbCode,
            parsed.fiche.competenceDeBase,
            parsed.fiche.titre || message,
            parsed.fiche.theme
          )
        : undefined;

      resultingFiche = buildFicheFromAi(parsed.fiche, {
        idPrefix: 'fiche-chat',
        disciplineId: targetCreateProfile.id,
        cbCodeHint: createCbHint,
        handicapProfiles: selectedHandicaps,
        modeCreation: sourceText.trim() || sourceImage?.data ? 'import' : 'ia',
        historyAction: `Création via Chatbot IA (${targetCreateProfile.nom})`,
        historyResume: `Fiche créée par conversation chatbot (${quality}) : « ${message.slice(0, 80)} ».`,
        referenceFiche: explicitRef,
      });
    } else if (actionType === 'update_fiche' && parsed.fiche && activeFiche) {
      const updated = parsed.fiche;
      const now = new Date().toISOString();
      const stamp = Date.now();
      const snapshot = createCompactSnapshot(activeFiche);
      const updatedProfile = findDisciplineProfile(
        activeFiche.disciplineId || updated.matiere || activeFiche.matiere,
        updated.titre || activeFiche.titre
      );

      resultingFiche = {
        ...activeFiche,
        disciplineId: activeFiche.disciplineId || updatedProfile.id,
        origineModele: activeFiche.origineModele,
        handicapsInclus: selectedHandicaps,
        titre: updated.titre || activeFiche.titre,
        theme: updated.theme || activeFiche.theme,
        matiere: updated.matiere || activeFiche.matiere,
        niveau: updated.niveau || activeFiche.niveau,
        duree: updated.duree || activeFiche.duree,
        effectif: updated.effectif || activeFiche.effectif,
        competenceDeBase: updated.competenceDeBase || activeFiche.competenceDeBase,
        competenceVisee: updated.competenceVisee || activeFiche.competenceVisee,
        objectifsSpecifiques: Array.isArray(updated.objectifsSpecifiques)
          ? updated.objectifsSpecifiques
          : activeFiche.objectifsSpecifiques,
        prerequis: Array.isArray(updated.prerequis)
          ? updated.prerequis
          : activeFiche.prerequis,
        materiel: Array.isArray(updated.materiel)
          ? updated.materiel
          : activeFiche.materiel,
        introduction: updated.introduction || activeFiche.introduction,
        deroulement: Array.isArray(updated.deroulement)
          ? updated.deroulement.map((step: Record<string, string>, idx: number) => {
              const orig = activeFiche.deroulement[idx];
              const etape = orig ? orig.etape : step.etape || `Étape ${idx + 1}`;
              return {
                id: orig?.id || `${activeFiche.id}-chat-${stamp}-${idx}`,
                etape,
                sousTitreInvariable:
                  orig?.sousTitreInvariable ||
                  updatedProfile.etapesCanoniques[idx]?.sousTitreInvariable ||
                  step.sousTitreInvariable ||
                  inferInvariantSubtitle(etape, idx, updatedProfile.id),
                duree: step.duree || orig?.duree || '8 min',
                activitesMaitre: step.activitesMaitre || '',
                activitesEleves: step.activitesEleves || '',
                indicateursInclusifs: step.indicateursInclusifs || '',
                indicateurValide: orig?.indicateurValide ?? false,
              };
            })
          : activeFiche.deroulement,
        questionsReponses: Array.isArray(updated.questionsReponses)
          ? updated.questionsReponses.map((qr: Record<string, string>, idx: number) => ({
              id: `${activeFiche.id}-qr-${stamp}-${idx}`,
              question: qr.question || '',
              reponseAttendue: qr.reponseAttendue || '',
              indicePedagogique: qr.indicePedagogique || '',
              difficulte:
                qr.difficulte === 'Approfondissement' || qr.difficulte === 'Défi'
                  ? qr.difficulte
                  : 'Fondamental',
            }))
          : activeFiche.questionsReponses,
        illustration: {
          titre: updated.illustration?.titre || activeFiche.illustration.titre,
          legende: updated.illustration?.legende || activeFiche.illustration.legende,
          typeSchema:
            updated.illustration?.typeSchema || activeFiche.illustration.typeSchema,
          svgCode: updated.illustration?.svgCode?.trim()
            ? sanitizeSvg(updated.illustration.svgCode)
            : activeFiche.illustration.svgCode,
          annotations: Array.isArray(updated.illustration?.annotations)
            ? updated.illustration.annotations.map(
                (ann: { x: number; y: number; label: string; detail: string }, idx: number) => ({
                  id: `${activeFiche.id}-ann-${stamp}-${idx}`,
                  x: Math.min(90, Math.max(10, Number(ann.x) || 50)),
                  y: Math.min(85, Math.max(15, Number(ann.y) || 50)),
                  label: ann.label || `Repère ${idx + 1}`,
                  detail: ann.detail || '',
                })
              )
            : activeFiche.illustration.annotations,
        },
        objetManipulable: updated.objetManipulable || activeFiche.objetManipulable,
        ...(() => {
          const effMatiere = updated.matiere || activeFiche.matiere;
          const effDiscId = activeFiche.disciplineId || updatedProfile.id;
          const effTitre = updated.titre || activeFiche.titre;
          const effTheme = updated.theme || activeFiche.theme;
          const effCb = updated.competenceDeBase || activeFiche.competenceDeBase;
          const effSit =
            updated.introduction?.accroche ||
            activeFiche.introduction?.accroche ||
            effTheme;
          const effNiveau = updated.niveau || activeFiche.niveau;
          const isMath = isMathContext(effMatiere, effDiscId);

          if (isMath) {
            return {
              schematisationMath: normalizeSchematisationMath(
                updated.schematisationMath || activeFiche.schematisationMath,
                {
                  matiere: effMatiere,
                  disciplineId: effDiscId,
                  cbCode: mathCbHint,
                  competenceDeBase: effCb,
                  titre: effTitre,
                  theme: effTheme,
                  situationProbleme: effSit,
                  niveau: effNiveau,
                }
              ),
              phasesManipulation: undefined,
            };
          }
          return {
            schematisationMath: undefined,
            phasesManipulation: buildUniversalManipulationSchematisation({
              matiere: effMatiere,
              disciplineId: effDiscId,
              competenceDeBase: effCb,
              titre: effTitre,
              theme: effTheme,
              situationProbleme: effSit,
              niveau: effNiveau,
            }),
          };
        })(),
        synthese: updated.synthese || activeFiche.synthese,
        historique: [
          {
            id: createUid('hist'),
            date: now,
            action: 'Retouche via Chatbot IA',
            resume: parsed.reply?.slice(0, 140) || message.slice(0, 120),
            snapshot,
          },
          ...(Array.isArray(activeFiche.historique)
            ? activeFiche.historique.slice(0, 14)
            : []),
        ],
        updatedAt: now,
      };

      sectionsModifiees = generateFicheDiffSummary(activeFiche, resultingFiche);
      resultingFiche.derniereRetouche = {
        date: now,
        scope: 'complet',
        resume: parsed.reply?.slice(0, 160) || message.slice(0, 140),
        sectionsModifiees,
      };
    }

    return NextResponse.json({
      reply: parsed.reply || 'Opération effectuée avec succès.',
      actionType: resultingFiche ? actionType : 'none',
      fiche: resultingFiche,
      sectionsModifiees,
      regleApprentissage: parsed.regleApprentissage || '',
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur du chatbot pédagogique.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
