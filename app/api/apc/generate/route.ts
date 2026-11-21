import { NextRequest, NextResponse } from 'next/server';
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
import { CbMathType, FicheAPC, HandicapProfileId, ReasoningQuality } from '@/lib/types';
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

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const {
      titre = '',
      theme = '',
      competenceDeBase = '',
      cbCode,
      disciplineId = '',
      matiere = 'Mathématiques',
      niveau = 'CM2',
      duree = '45 min',
      contexteInclusif = '',
      includeManipulable = true,
      sourceText = '',
      sourceImage = null,
      referenceFiche = null,
      handicapProfiles,
      quality = 'equilibre',
      preferences = [],
    } = body as {
      titre?: string;
      theme?: string;
      competenceDeBase?: string;
      cbCode?: CbMathType;
      disciplineId?: string;
      matiere?: string;
      niveau?: string;
      duree?: string;
      contexteInclusif?: string;
      includeManipulable?: boolean;
      sourceText?: string;
      sourceImage?: { mimeType: string; data: string } | null;
      referenceFiche?: FicheAPC | null;
      handicapProfiles?: HandicapProfileId[];
      quality?: ReasoningQuality;
      preferences?: { regle: string }[];
    };

    const hasSource = Boolean(sourceText.trim() || sourceImage?.data);
    if ((!titre.trim() || !theme.trim()) && !hasSource) {
      return NextResponse.json(
        { error: 'Le titre et le thème (ou un texte/image source) sont requis pour générer une fiche APC.' },
        { status: 400 }
      );
    }

    if (sourceImage?.data) {
      validateBase64Payload(sourceImage.data, 10 * 1024 * 1024, 'L’image jointe');
    }

    const ai = getGeminiClient();
    const activeProfile = findDisciplineProfile(
      disciplineId || referenceFiche?.disciplineId || matiere,
      titre
    );

    const prefsText =
      Array.isArray(preferences) && preferences.length > 0
        ? `\nPréférences pédagogiques apprises de l'enseignant à respecter impérativement :\n${preferences
            .map((p) => `- ${p.regle}`)
            .join('\n')}`
        : '';

    const disciplineDirectiveText = `\n${buildDisciplinePromptDirectives(activeProfile, true)}`;

    const mathActive = isMathContext(matiere, activeProfile.id);
    const resolvedCb = mathActive
      ? normalizeCbMathCode(cbCode, competenceDeBase, titre, theme)
      : undefined;
    const mathDirectiveText =
      mathActive && resolvedCb
        ? `\n\n${buildMathSchematisationPromptRules({
            cbCode: resolvedCb,
            titre: titre || 'Leçon de mathématiques',
            theme,
            situationProbleme: contexteInclusif || theme || sourceText.slice(0, 300),
            niveau,
          })}`
        : '\n\nPour les disciplines autres que Mathématiques, mets schematisationMath.actif = false et schematisationMath.phases = [].';

    const refStructureText = referenceFiche
      ? `\nMODÈLE DE RÉFÉRENCE (créer une fiche IDENTIQUE en structure) :
- Conserve exactement ${referenceFiche.deroulement.length} étapes avec ces intitulés et sous-titres invariables exacts :
${referenceFiche.deroulement
  .map(
    (s, i) =>
      `  ${i + 1}. "${s.etape}" — Sous-titre invariable : "${s.sousTitreInvariable || ''}" (${s.duree})`
  )
  .join('\n')}
- Modèle de CB en en-tête : "${referenceFiche.competenceDeBase || referenceFiche.competenceVisee}"
Adapte intégralement les contenus (Activités du maître, Activités de l'élève, Indicateurs pédagogiques inclusifs, Q&R interactives, Schéma SVG et Synthèse) au nouveau sujet tout en gardant cette architecture identique.`
      : '';

    const selectedHandicaps = normalizeHandicapProfiles(
      Array.isArray(handicapProfiles) && handicapProfiles.length > 0
        ? handicapProfiles
        : referenceFiche?.handicapsInclus && referenceFiche.handicapsInclus.length > 0
        ? referenceFiche.handicapsInclus
        : DEFAULT_HANDICAP_PROFILES
    );
    const inclusionDirectiveText = `\n\n${buildInclusionHandicapDirectives(
      selectedHandicaps,
      quality === 'expert'
    )}`;

    const systemInstruction = `Tu es un inspecteur pédagogique et concepteur expert en Activités Pédagogiques Complémentaires (APC) et pédagogie inclusive (scolarisation et inclusion des enfants en situation de handicap, différenciation, troubles DYS, TDAH, manipulation active).
Tu génères des fiches pédagogiques APC complètes, prêtes à l'impression, en français rigoureux et directement exploitable en classe.
Règles impératives :
1. Renseigne toujours "competenceDeBase" (CB avec code et libellé clair au niveau de l'en-tête).
2. Le tableau de déroulement doit comporter 5 à 6 étapes séquencées avec "etape" ET "sousTitreInvariable" en respectant impérativement les sous-titres propres à la discipline sélectionnée.
3. Chaque étape doit enrichir de façon détaillée et interactive : "activitesMaitre", "activitesEleves", et "indicateursInclusifs" (critères observables vérifiables + adaptations inclusives APC spécifiques à la matière et aux handicaps).
4. Génère 3 à 4 "questionsReponses" véritablement interactives (Fondamental, Approfondissement, Défi) avec indice d'étayage exploitable à l'oral ou sur tablette.
5. L'illustration doit être un code SVG propre et compact (<svg viewBox="0 0 640 280" ...>) contenant un véritable schéma disciplinaire annoté.
6. Si la matière est Mathématiques ou Sciences (ou si demandé), active "objetManipulable" avec un type pertinent.${disciplineDirectiveText}${inclusionDirectiveText}${mathDirectiveText}${refStructureText}${prefsText}`;

    const textPrompt = `Génère une fiche pédagogique APC complète :
- Discipline ciblée : ${activeProfile.nom}
- Titre : ${titre || 'À déduire fidèlement de la ressource fournie'}
- Thème / Notion : ${theme || 'À extraire de la ressource fournie'}
${competenceDeBase ? `- CB (Compétence de Base) souhaitée : ${competenceDeBase}` : ''}
- Matière : ${matiere}
- Niveau scolaire : ${niveau}
- Durée totale : ${duree}
- Objet manipulable souhaité : ${includeManipulable ? 'Oui si pertinent' : 'Non'}
${contexteInclusif ? `- Contexte / recommandations : ${contexteInclusif}` : ''}
${sourceText.trim() ? `\nTexte source importé à transformer en fiche APC complète :\n${sourceText.slice(0, 35000)}` : ''}`;

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
              text: `${textPrompt}\n\nAnalyse attentivement le texte et les exercices visibles sur cette image pour construire la fiche APC complète.`,
            },
          ],
        }
      : textPrompt;

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: FICHE_APC_SCHEMA,
        thinkingConfig: { thinkingLevel: resolveThinkingLevel(quality) },
      },
    });

    const generated = parseGeminiJson<Record<string, any>>(
      response.text,
      'Réponse vide du moteur IA.'
    );

    const fiche = buildFicheFromAi(generated, {
      idPrefix: 'fiche',
      disciplineId: activeProfile.id,
      fallbackTitre: titre || 'Fiche APC générée',
      fallbackTheme: theme || 'Séance APC issue de document',
      fallbackMatiere: matiere,
      fallbackNiveau: niveau,
      fallbackDuree: duree,
      fallbackCb: competenceDeBase,
      cbCodeHint: resolvedCb,
      handicapProfiles: selectedHandicaps,
      modeCreation: sourceImage?.data || sourceText.trim() ? 'import' : 'ia',
      historyAction: referenceFiche
        ? `Génération IA (${activeProfile.nom})`
        : `Génération IA complète (${activeProfile.nom})`,
      historyResume: `Fiche APC générée (${quality}) pour « ${generated.titre || titre || 'nouvelle séance'} ».`,
      referenceFiche,
    });

    return NextResponse.json({ fiche });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la génération de la fiche APC.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
