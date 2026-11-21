import { NextRequest, NextResponse } from 'next/server';
import {
  callGeminiWithRetry,
  GEMINI_MODEL,
  getGeminiClient,
  getHttpStatusFromError,
  normalizeSchematisationMath,
  parseGeminiJson,
  parseRequestJson,
  resolveThinkingLevel,
  SCHEMATISATION_MATH_SCHEMA,
} from '@/lib/gemini';
import {
  buildMathSchematisationPromptRules,
  CB_MATH_CATALOG,
  normalizeCbMathCode,
} from '@/lib/math-schematisation';
import { CbMathType, FicheAPC, ReasoningQuality } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const {
      fiche,
      cbCode,
      titre,
      situationProbleme,
      instruction = '',
      quality = 'equilibre',
    } = body as {
      fiche?: FicheAPC;
      cbCode?: CbMathType;
      titre?: string;
      situationProbleme?: string;
      instruction?: string;
      quality?: ReasoningQuality;
    };

    const resolvedTitre = (titre || fiche?.titre || '').trim();
    if (!resolvedTitre) {
      return NextResponse.json(
        { error: 'Le titre de la leçon est requis pour schématiser les phases.' },
        { status: 400 }
      );
    }

    const resolvedSituation = (
      situationProbleme ||
      fiche?.introduction?.accroche ||
      fiche?.introduction?.miseEnSituation ||
      fiche?.theme ||
      ''
    ).trim();

    const resolvedCb = normalizeCbMathCode(
      cbCode,
      fiche?.competenceDeBase,
      resolvedTitre,
      fiche?.theme
    );

    const ai = getGeminiClient();
    const rules = buildMathSchematisationPromptRules({
      cbCode: resolvedCb,
      titre: resolvedTitre,
      theme: fiche?.theme,
      situationProbleme: resolvedSituation,
      niveau: fiche?.niveau || 'CM2',
    });

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_MODEL,
      contents: `Génère une schématisation IA complète en 3 phases de manipulation (collective, petits groupes, individuelle) pour cette leçon de Mathématiques :
- Compétence de Base : ${resolvedCb} (${CB_MATH_CATALOG[resolvedCb].court})
- Libellé CB de la fiche : ${fiche?.competenceDeBase || CB_MATH_CATALOG[resolvedCb].libelle}
- Titre de la leçon : ${resolvedTitre}
- Thème : ${fiche?.theme || 'Mathématiques APC'}
- Niveau scolaire : ${fiche?.niveau || 'CM2'}
- Situation-problème concrète : ${resolvedSituation || 'À contextualiser fidèlement selon le titre de la leçon'}
${fiche?.competenceVisee ? `- Compétence visée : ${fiche.competenceVisee}` : ''}
${instruction.trim() ? `\nConsignes complémentaires de l'enseignant : ${instruction.trim()}` : ''}`,
      config: {
        systemInstruction: `Tu es un didacticien expert des Mathématiques en Approche Par Compétences (APC) et pédagogie inclusive (CB1, CB2, CB3).
${rules}
Chaque phase doit comporter des données numériques, géométriques ou de mesure CONCRÈTES, COHÉRENTES mathématiquement (aucune erreur de calcul) et un code SVG lisible, propre et expressif (<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">...</svg>).`,
        responseMimeType: 'application/json',
        responseSchema: SCHEMATISATION_MATH_SCHEMA,
        thinkingConfig: { thinkingLevel: resolveThinkingLevel(quality) },
      },
    });

    const parsed = parseGeminiJson<Record<string, any>>(
      response.text,
      'Réponse vide lors de la schématisation mathématique.'
    );

    const schematisationMath = normalizeSchematisationMath(parsed, {
      matiere: 'Mathématiques',
      disciplineId: 'modele-mathematiques',
      cbCode: resolvedCb,
      competenceDeBase: fiche?.competenceDeBase,
      titre: resolvedTitre,
      theme: fiche?.theme,
      situationProbleme: resolvedSituation,
      niveau: fiche?.niveau,
    });

    return NextResponse.json({
      schematisationMath,
      resume: `Schématisation IA (${resolvedCb} · 3 phases de manipulation) générée pour « ${resolvedTitre} ».`,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la schématisation IA en Mathématiques.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
