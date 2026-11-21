import { FicheAPC } from './types';
import { getEffectiveManipulationSchematisation } from './manipulation-phases';

export interface TtsSegment {
  id: string;
  label: string;
  text: string;
}

/**
 * Nettoie un texte pédagogique pour une lecture orale naturelle et fluide.
 */
export function cleanTextForSpeech(input: string): string {
  if (!input) return '';
  return input
    .replace(/\[Inclusion handicap\]/gi, 'Adaptation pour l’inclusion :')
    .replace(/\[([^\]]+)\]/g, '$1.')
    .replace(/\bQ(\d+)\s*:/g, 'Question $1 :')
    .replace(/\bR(\d+)\s*:/g, 'Réponse $1 :')
    .replace(/\bCB(\d*)\b/g, 'Compétence de base $1')
    .replace(/[•▪◦]/g, '')
    .replace(/→|⇒/g, ' puis ')
    .replace(/←/g, ' depuis ')
    .replace(/↔/g, ' entre ')
    .replace(/≤/g, ' inférieur ou égal à ')
    .replace(/≥/g, ' supérieur ou égal à ')
    .replace(/≠/g, ' différent de ')
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Découpe un texte long en segments <= maxLen caractères sur les limites de phrases,
 * évitant le blocage connu de Chrome/Chromium sur les longs énoncés Web Speech.
 */
export function splitSpeechChunks(text: string, maxLen = 210): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const sentences = cleaned
    .split(/(?<=[.!?…;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      const words = sentence.split(/\s+/);
      let part = '';
      for (const word of words) {
        if ((part ? `${part} ${word}` : word).length > maxLen) {
          if (part) chunks.push(part);
          part = word;
        } else {
          part = part ? `${part} ${word}` : word;
        }
      }
      if (part) chunks.push(part);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Construit les sections structurées d'une fiche APC pour la relecture vocale par l'enseignant.
 */
export function buildFicheTtsSegments(fiche: FicheAPC): TtsSegment[] {
  const segments: TtsSegment[] = [];

  const objectifsText = (fiche.objectifsSpecifiques || [])
    .filter(Boolean)
    .map((o, i) => `Objectif ${i + 1} : ${o}`)
    .join('. ');
  const prerequisText = (fiche.prerequis || []).filter(Boolean).join(', ');
  const materielText = (fiche.materiel || []).filter(Boolean).join(', ');

  segments.push({
    id: 'cadre',
    label: 'En-tête & Cadre APC',
    text: [
      `Fiche pédagogique APC : ${fiche.titre}.`,
      `Matière : ${fiche.matiere}. Niveau : ${fiche.niveau}. Durée prévue : ${fiche.duree}. Effectif : ${fiche.effectif}.`,
      fiche.theme ? `Thème : ${fiche.theme}.` : '',
      fiche.competenceDeBase ? `Compétence de base : ${fiche.competenceDeBase}.` : '',
      fiche.competenceVisee ? `Compétence visée : ${fiche.competenceVisee}.` : '',
      objectifsText ? `${objectifsText}.` : '',
      prerequisText ? `Prérequis : ${prerequisText}.` : '',
      materielText ? `Matériel et supports : ${materielText}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
  });

  if (
    fiche.introduction?.accroche ||
    fiche.introduction?.miseEnSituation ||
    fiche.introduction?.consigneDepart
  ) {
    segments.push({
      id: 'introduction',
      label: 'Introduction & Mise en situation',
      text: [
        'Introduction et mise en situation.',
        fiche.introduction.accroche ? `Accroche : ${fiche.introduction.accroche}.` : '',
        fiche.introduction.miseEnSituation
          ? `Mise en situation : ${fiche.introduction.miseEnSituation}.`
          : '',
        fiche.introduction.consigneDepart
          ? `Consigne de départ : ${fiche.introduction.consigneDepart}.`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    });
  }

  (fiche.deroulement || []).forEach((step, idx) => {
    segments.push({
      id: `step-${idx}`,
      label: `Étape ${idx + 1} : ${step.etape}`,
      text: [
        `Étape ${idx + 1} : ${step.etape}.`,
        step.sousTitreInvariable ? `Rubrique : ${step.sousTitreInvariable}.` : '',
        step.duree ? `Durée : ${step.duree}.` : '',
        step.activitesMaitre ? `Activités du maître : ${step.activitesMaitre}.` : '',
        step.activitesEleves ? `Activités des élèves : ${step.activitesEleves}.` : '',
        step.indicateursInclusifs
          ? `Indicateurs pédagogiques inclusifs : ${step.indicateursInclusifs}.`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    });
  });

  const activeManip = getEffectiveManipulationSchematisation(fiche);
  if (activeManip && (activeManip.phases || []).length > 0) {
    const isMath = Boolean(fiche.schematisationMath?.actif);
    const phasesText = activeManip.phases
      .map((p) => {
        const exText = (p.exercicesProgressifs || [])
          .map(
            (ex) =>
              `${ex.palier} : ${ex.consigne}. ${
                ex.choix && ex.choix.length > 0
                  ? `Choix proposés : ${ex.choix.join(', ')}. `
                  : ''
              }Réponse attendue : ${ex.reponseAttendue}${
                ex.unite &&
                !ex.reponseAttendue.toLowerCase().includes(ex.unite.toLowerCase())
                  ? ` ${ex.unite}`
                  : ''
              }. ${ex.explication ? `Explication : ${ex.explication}.` : ''}`
          )
          .join(' ');
        const qrPhaseText = (p.questionsReponsesPhase || [])
          .map(
            (qr, idx) =>
              `Question de phase ${idx + 1} : ${qr.question}. Réponse attendue : ${qr.reponseAttendue}. ${
                qr.indice ? `Indice : ${qr.indice}.` : ''
              }`
          )
          .join(' ');

        return [
          `${p.titrePhase}, modalité ${p.modalite}.`,
          `Données concrètes : ${p.donneesConcretes}.`,
          `Matériel : ${p.materielConcret}.`,
          `Action de l’élève : ${p.actionSchemaEleve}.`,
          `Étayage inclusif : ${p.etayageInclusifAPC}.`,
          exText ? `Exercices progressifs. ${exText}` : '',
          qrPhaseText ? `Questions et réponses de la phase. ${qrPhaseText}` : '',
        ]
          .filter(Boolean)
          .join(' ');
      })
      .join(' ');

    segments.push({
      id: 'schem-manip',
      label: isMath
        ? `Manipulation & Exercices (${activeManip.cbCode})`
        : `Manipulation & Exercices (${fiche.matiere})`,
      text: [
        isMath
          ? `Phases de manipulation et schématisation en mathématiques, ${activeManip.cbCode}.`
          : `Phases de manipulation, schématisation et exercices progressifs en ${fiche.matiere}.`,
        activeManip.situationProblemeReference
          ? `Situation-problème de référence : ${activeManip.situationProblemeReference}.`
          : '',
        phasesText,
        activeManip.synthesePassageAbstraction
          ? `Passage à l’abstraction : ${activeManip.synthesePassageAbstraction}.`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    });
  }

  if ((fiche.questionsReponses || []).length > 0) {
    const qrText = fiche.questionsReponses
      .map(
        (qr, i) =>
          `Question ${i + 1}, niveau ${qr.difficulte} : ${qr.question}. Réponse attendue : ${qr.reponseAttendue}. ${
            qr.indicePedagogique ? `Indice pédagogique : ${qr.indicePedagogique}.` : ''
          }`
      )
      .join(' ');
    segments.push({
      id: 'qr',
      label: `Questions-réponses (${fiche.questionsReponses.length})`,
      text: `Questions-réponses interactives. ${qrText}`,
    });
  }

  segments.push({
    id: 'synthese',
    label: 'Synthèse, Trace écrite & Observations',
    text: [
      'Synthèse et trace écrite.',
      fiche.synthese?.resumeCle ? `Idée clé : ${fiche.synthese.resumeCle}.` : '',
      fiche.synthese?.traceEcriteEleve
        ? `Trace écrite de l’élève : ${fiche.synthese.traceEcriteEleve}.`
        : '',
      fiche.synthese?.prolongement
        ? `Prolongement : ${fiche.synthese.prolongement}.`
        : '',
      fiche.observations?.trim()
        ? `Observations de l’enseignant : ${fiche.observations}.`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  });

  return segments.filter((s) => cleanTextForSpeech(s.text).length > 0);
}
