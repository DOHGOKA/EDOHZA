import { CbMathType, FicheAPC, HandicapProfileId, PreferenceApprentissage } from './types';
import {
  alignFicheToDisciplineSubtitles,
  findDisciplineProfile,
  getDisciplineSubtitleForStep,
} from './disciplines';
import {
  buildFallbackMathSchematisation,
  isMathContext,
  normalizeCbMathCode,
} from './math-schematisation';
import {
  buildUniversalManipulationSchematisation,
  enrichManipulationPhases,
} from './manipulation-phases';
import {
  applyLocalHandicapInclusion,
  DEFAULT_HANDICAP_PROFILES,
  normalizeHandicapProfiles,
} from './inclusion';
import { getTemplateByDiscipline } from './templates';
import { sanitizeSvg } from './svg-sanitize';
import { createUid } from './utils';

const FICHES_KEY = 'atelier_apc_fiches_v1';
const PREFS_KEY = 'atelier_apc_preferences_v1';
const ACTIVE_ID_KEY = 'atelier_apc_active_id_v1';

export const INVARIANT_APC_SUBTITLES: string[] = [
  'Mise en train & réactivation des prérequis',
  'Situation déclenchante & consigne initiale',
  'Manipulation guidée & recherche active',
  'Synthèse collective & structuration',
  'Évaluation formative & transfert',
  'Remédiation différenciée & prolongement',
];

export function cloneFicheDeep<T = FicheAPC>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Fallback below
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function inferInvariantSubtitle(
  etapeTitle: string,
  index: number,
  matiereOrDisciplineId?: string
): string {
  if (matiereOrDisciplineId) {
    const profile = findDisciplineProfile(matiereOrDisciplineId);
    return getDisciplineSubtitleForStep(profile, etapeTitle, index);
  }
  const lower = (etapeTitle || '').toLowerCase();
  if (lower.includes('préparation') || lower.includes('accroche') || lower.includes('rappel')) {
    return 'Mise en train & réactivation des prérequis';
  }
  if (lower.includes('lancement') || lower.includes('découverte')) {
    return 'Situation déclenchante & consigne initiale';
  }
  if (lower.includes('activité') || lower.includes('manipulation') || lower.includes('reconstitution')) {
    return 'Manipulation guidée & recherche active';
  }
  if (lower.includes('pause') || lower.includes('remédiation') || lower.includes('consolidation')) {
    return 'Remédiation différenciée & pause active';
  }
  if (lower.includes('synthèse') || lower.includes('mémo') || lower.includes('trace')) {
    return 'Synthèse collective & institutionnalisation';
  }
  if (lower.includes('évaluation') || lower.includes('validation') || lower.includes('bilan')) {
    return 'Évaluation formative & transfert';
  }
  return INVARIANT_APC_SUBTITLES[index % INVARIANT_APC_SUBTITLES.length];
}

export function normalizeFiche(fiche: FicheAPC): FicheAPC {
  const profile = findDisciplineProfile(
    fiche.disciplineId || fiche.matiere,
    fiche.titre
  );
  const resolvedDisciplineId = fiche.disciplineId || profile.id;
  const resolvedCb =
    fiche.competenceDeBase?.trim() ||
    `${profile.cbPrefixe} — ${fiche.competenceVisee || fiche.theme}`;
  const mathActive = isMathContext(fiche.matiere, resolvedDisciplineId);

  const situationSource =
    fiche.introduction?.accroche ||
    fiche.introduction?.miseEnSituation ||
    fiche.theme;
  const enrichCtx = {
    matiere: fiche.matiere || profile.matiere,
    disciplineId: resolvedDisciplineId,
    competenceDeBase: resolvedCb,
    titre: fiche.titre,
    theme: fiche.theme,
    situationProbleme: situationSource,
    niveau: fiche.niveau,
    deroulement: fiche.deroulement,
  };

  const rawSchematisation =
    fiche.schematisationMath?.actif &&
    Array.isArray(fiche.schematisationMath.phases) &&
    fiche.schematisationMath.phases.length >= 3
      ? enrichManipulationPhases(
          {
            ...fiche.schematisationMath,
            phases: fiche.schematisationMath.phases.map((p) => ({
              ...p,
              svgSchemaCode: sanitizeSvg(p.svgSchemaCode || '', '0 0 360 200'),
            })),
          },
          enrichCtx
        )
      : mathActive
      ? buildFallbackMathSchematisation({
          cbCode: fiche.schematisationMath?.cbCode,
          competenceDeBase: resolvedCb,
          titre: fiche.titre,
          theme: fiche.theme,
          situationProbleme: situationSource,
          niveau: fiche.niveau,
        })
      : undefined;

  const rawPhasesManipulation = mathActive
    ? undefined
    : fiche.phasesManipulation?.actif &&
      Array.isArray(fiche.phasesManipulation.phases) &&
      fiche.phasesManipulation.phases.length >= 3
    ? enrichManipulationPhases(
        {
          ...fiche.phasesManipulation,
          phases: fiche.phasesManipulation.phases.map((p) => ({
            ...p,
            svgSchemaCode: sanitizeSvg(p.svgSchemaCode || '', '0 0 360 200'),
          })),
        },
        enrichCtx
      )
    : buildUniversalManipulationSchematisation(enrichCtx);

  return {
    ...fiche,
    titre: fiche.titre || 'Séance APC sans titre',
    theme: fiche.theme || 'Consolidation des compétences',
    matiere: fiche.matiere || profile.matiere,
    niveau: fiche.niveau || 'CM1',
    duree: fiche.duree || '45 min',
    effectif: fiche.effectif || '6 élèves (groupe APC)',
    competenceVisee: fiche.competenceVisee || fiche.theme || '',
    disciplineId: resolvedDisciplineId,
    origineModele: fiche.origineModele,
    fichierSource: fiche.fichierSource?.nom
      ? {
          nom: fiche.fichierSource.nom,
          format: fiche.fichierSource.format || 'text',
          importeLe: fiche.fichierSource.importeLe || fiche.createdAt || new Date().toISOString(),
          action: fiche.fichierSource.action === 'retouche' ? 'retouche' : 'creation',
          tailleOctets: fiche.fichierSource.tailleOctets,
        }
      : undefined,
    derniereRetouche: fiche.derniereRetouche?.date
      ? {
          date: fiche.derniereRetouche.date,
          scope: fiche.derniereRetouche.scope || 'complet',
          resume: fiche.derniereRetouche.resume || '',
          sectionsModifiees: Array.isArray(fiche.derniereRetouche.sectionsModifiees)
            ? fiche.derniereRetouche.sectionsModifiees
            : [],
          fichierAppui: fiche.derniereRetouche.fichierAppui,
        }
      : undefined,
    handicapsInclus: Array.isArray(fiche.handicapsInclus)
      ? normalizeHandicapProfiles(fiche.handicapsInclus)
      : undefined,
    competenceDeBase: resolvedCb,
    prerequis: Array.isArray(fiche.prerequis) ? fiche.prerequis : [],
    materiel: Array.isArray(fiche.materiel) ? fiche.materiel : [],
    objectifsSpecifiques: Array.isArray(fiche.objectifsSpecifiques)
      ? fiche.objectifsSpecifiques
      : [],
    introduction: {
      accroche: fiche.introduction?.accroche || '',
      miseEnSituation: fiche.introduction?.miseEnSituation || '',
      consigneDepart: fiche.introduction?.consigneDepart || '',
    },
    deroulement: Array.isArray(fiche.deroulement)
      ? fiche.deroulement.map((step, idx) => ({
          ...step,
          id: step.id || `etape-${idx + 1}`,
          etape: step.etape || `Étape ${idx + 1}`,
          duree: step.duree || '8 min',
          activitesMaitre: step.activitesMaitre || '',
          activitesEleves: step.activitesEleves || '',
          indicateursInclusifs: step.indicateursInclusifs || '',
          sousTitreInvariable:
            step.sousTitreInvariable?.trim() ||
            inferInvariantSubtitle(step.etape, idx, profile.id),
        }))
      : [],
    questionsReponses: Array.isArray(fiche.questionsReponses)
      ? fiche.questionsReponses
      : [],
    illustration: {
      titre: fiche.illustration?.titre || `Schéma : ${fiche.titre || 'Séance APC'}`,
      legende: fiche.illustration?.legende || '',
      typeSchema: fiche.illustration?.typeSchema || 'svg',
      svgCode: sanitizeSvg(fiche.illustration?.svgCode || ''),
      annotations: Array.isArray(fiche.illustration?.annotations)
        ? fiche.illustration.annotations
        : [],
    },
    objetManipulable: {
      actif: Boolean(fiche.objetManipulable?.actif),
      type: fiche.objetManipulable?.type || 'fractions',
      titre: fiche.objetManipulable?.titre || '',
      consigne: fiche.objetManipulable?.consigne || '',
      parametres: fiche.objetManipulable?.parametres || {
        valeurA: 1,
        valeurB: 2,
        denominateur: 2,
        unite: 'unités',
      },
    },
    synthese: {
      resumeCle: fiche.synthese?.resumeCle || '',
      traceEcriteEleve: fiche.synthese?.traceEcriteEleve || '',
      motsCles: Array.isArray(fiche.synthese?.motsCles)
        ? fiche.synthese.motsCles
        : [],
      prolongement: fiche.synthese?.prolongement || '',
    },
    suggestionsIA: Array.isArray(fiche.suggestionsIA) ? fiche.suggestionsIA : [],
    historique: Array.isArray(fiche.historique) ? fiche.historique : [],
    eleves: Array.isArray(fiche.eleves)
      ? fiche.eleves.map((el, idx) => ({
          id: el.id || `eleve-${idx + 1}`,
          prenom: el.prenom || '',
          besoinSpecifique: el.besoinSpecifique || '',
          objectifIndividuel: el.objectifIndividuel || '',
          statut:
            el.statut === 'acquis' || el.statut === 'a_consolider'
              ? el.statut
              : 'en_cours',
        }))
      : [],
    observations: fiche.observations || '',
    schematisationMath: rawSchematisation,
    phasesManipulation: rawPhasesManipulation,
  };
}

export const SAMPLE_FICHES: FicheAPC[] = [
  {
    id: 'fiche-math-fractions-cm2',
    titre: 'Comparer et construire des fractions équivalentes',
    theme: 'Nombres et calculs — Les fractions simples et équivalentes',
    matiere: 'Mathématiques',
    niveau: 'CM2',
    duree: '45 min',
    effectif: '6 élèves (groupe de besoin APC)',
    competenceDeBase:
      'CB1 (Mathématiques CM2) — Mobiliser les écritures fractionnaires et leur équivalence pour résoudre des situations concrètes de partage et de mesure.',
    competenceVisee:
      'Reconnaître, représenter et produire des fractions équivalentes à partir de partages géométriques et de droites graduées.',
    objectifsSpecifiques: [
      'Identifier que deux fractions différentes peuvent représenter la même quantité (ex. 1/2 = 2/4 = 3/6).',
      'Passer d’une représentation figurée (disque ou bande) à l’écriture fractionnaire.',
      'Justifier une égalité de fractions à l’oral en s’appuyant sur la manipulation.',
    ],
    prerequis: [
      'Lire et écrire une fraction simple inférieure ou égale à 1.',
      'Identifier le numérateur (parts prises) et le dénominateur (parts égales du tout).',
    ],
    materiel: [
      'Bandes de papier fractionnées (demis, quarts, huitièmes, tiers, sixièmes)',
      'Ardoises effaçables et feutres à pointe moyenne',
      'Objet manipulable numérique sur tablette ou TBI',
    ],
    introduction: {
      accroche:
        'Deux tablettes de chocolat identiques : Léa mange 1/2 de sa tablette, Sami mange 2/4 de la sienne. Qui a mangé le plus de chocolat ?',
      miseEnSituation:
        'Les élèves formulent une première hypothèse à l’ardoise sans calculer, puis vérifient en superposant des bandes de papier colorées.',
      consigneDepart:
        'Manipulez les bandes unité pour prouver votre réponse en montrant la part exacte occupée par chaque fraction.',
    },
    deroulement: [
      {
        id: 'etape-1',
        etape: '1. Préparation & Accroche',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Entre 1/2 et 2/4 d’une même tablette de chocolat, qui a mangé le plus ?\nQ2 : Quelle part de la bande-unité représente le dénominateur ?\n• Présente la situation au tableau et distribue les bandes.',
        activitesEleves:
          'R1 : Formulent une conjecture individuelle sur ardoise et verbalisent leur intuition.\nR2 : Rappel : le dénominateur indique en combien de parts égales on partage l’unité.',
        indicateursInclusifs:
          '• Lecture exacte des écritures fractionnaires.\n[Inclusion handicap] DYS/Visuel/Auditif : consigne lue face classe et affichée avec code couleur (numérateur bleu / dénominateur vert).',
      },
      {
        id: 'etape-2',
        etape: '2. Lancement & Découverte',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Que constatez-vous en superposant 1 bande 1/2 avec 2 bandes 1/4 et 4 bandes 1/8 ?\nQ2 : Que devient la taille de chaque part quand le dénominateur double ?',
        activitesEleves:
          'R1 : Superposent les bandes et constatent que la longueur totale occupée est strictement identique.\nR2 : Expliquent : plus il y a de parts dans l’unité, plus chaque part est petite.',
        indicateursInclusifs:
          '• Mise en évidence concrète de l’égalité des longueurs.\n[Inclusion handicap] Moteur/Visuel : binômes hétérogènes et réglettes tactiles en relief pour troubles praxiques.',
      },
      {
        id: 'etape-3',
        etape: '3. Activité 1 : Atelier d’équivalence',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quelles fractions sont égales à 1/3, 2/3 puis 3/4 sur vos bandes ou sur la barre interactive ?\nQ2 : Par quel même nombre multiplie-t-on haut et bas pour passer de 2/3 à 4/6 ?',
        activitesEleves:
          'R1 : Complètent le tableau de correspondance en combinant bandes papier et outil interactif.\nR2 : Découvrent le facteur multiplicateur commun (×2, ×3) entre numérateur et dénominateur.',
        indicateursInclusifs:
          '• Passage réussi du matériel concret à la règle multiplicative.\n[Inclusion handicap] Dyscalculie/DYS/TDAH : défis en 3 paliers gradués, temps majoré et bande-repère maintenue sur la table.',
      },
      {
        id: 'etape-4',
        etape: '4. Synthèse collective',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Quelle règle générale permet d’obtenir à coup sûr une fraction équivalente ?\nQ2 : Peut-on aussi diviser le numérateur et le dénominateur par un même nombre ?',
        activitesEleves:
          'R1 : Reformulent : on multiplie (ou divise) le haut ET le bas par un même nombre différent de zéro.\nR2 : Complètent la trace écrite schématisée avec l’exemple 1/2 = 2/4 = 4/8.',
        indicateursInclusifs:
          '• Maîtrise orale et écrite de la règle d’équivalence.\n[Inclusion handicap] DYS/Visuel : carte mentale structurée avec flèches ×2 en couleurs et schéma annoté.',
      },
      {
        id: 'etape-5',
        etape: '5. Évaluation & Validation',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Complétez ces 3 égalités à trous sur votre ardoise (ex. 3/4 = ?/8).\nQ2 : Parmi ces 4 fractions, quel est l’intrus et comment le prouver ?',
        activitesEleves:
          'R1 : Résolvent individuellement puis lèvent l’ardoise au signal.\nR2 : Justifient à l’oral l’intrus devant le groupe en s’appuyant sur la règle ou le schéma.',
        indicateursInclusifs:
          '• Réussite sur égalités simples et justification.\n[Inclusion handicap] Moteur/DYS/Auditif : réponse acceptée à l’oral ou par schéma sur bande-unité ; valorisation positive.',
      },
    ],
    questionsReponses: [
      {
        id: 'qr-1',
        question: 'Pourquoi 2/4 représente-t-il la même quantité que 1/2 ?',
        reponseAttendue:
          'Parce qu’on a coupé chaque demi en 2 parts plus petites : on a donc 2 fois plus de parts (4 au lieu de 2), et on en prend aussi 2 fois plus (2 au lieu de 1).',
        indicePedagogique:
          'Faire plier la bande 1/2 en deux devant l’élève pour montrer l’apparition des quarts.',
        difficulte: 'Fondamental',
      },
      {
        id: 'qr-2',
        question: 'Trouve deux fractions équivalentes à 2/3 en utilisant des sixièmes puis des neuvièmes.',
        reponseAttendue: '2/3 = 4/6 = 6/9.',
        indicePedagogique:
          'Multiplier numérateur et dénominateur par 2, puis par 3.',
        difficulte: 'Approfondissement',
      },
      {
        id: 'qr-3',
        question: 'Léo affirme que 3/5 = 4/6 parce qu’il a ajouté 1 en haut et 1 en bas. A-t-il raison ?',
        reponseAttendue:
          'Non, ajouter un même nombre ne conserve pas la proportion : 3/5 = 0,6 alors que 4/6 ≈ 0,67. Il faut multiplier ou diviser par un même nombre non nul.',
        indicePedagogique:
          'Vérifier avec l’objet manipulable en comparant les longueurs des barres.',
        difficulte: 'Défi',
      },
    ],
    illustration: {
      titre: 'Équivalence visuelle : 1/2 = 2/4 = 4/8',
      legende:
        'Trois bandes de même longueur unité montrant la conservation de la quantité malgré le découpage plus fin.',
      typeSchema: 'geometrie',
      svgCode: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="280" fill="#F8FAFC" rx="8"/>
  <text x="28" y="34" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">Conservation de l'unité et découpage équivalent</text>
  <text x="28" y="78" font-family="monospace" font-size="14" font-weight="600" fill="#0284C7">1 / 2</text>
  <rect x="96" y="54" width="240" height="40" fill="#0284C7" fill-opacity="0.88" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="336" y="54" width="240" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <text x="216" y="79" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">1/2</text>
  <text x="28" y="144" font-family="monospace" font-size="14" font-weight="600" fill="#059669">2 / 4</text>
  <rect x="96" y="120" width="120" height="40" fill="#059669" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="216" y="120" width="120" height="40" fill="#059669" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="336" y="120" width="120" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="456" y="120" width="120" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <text x="156" y="145" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#FFFFFF">1/4</text>
  <text x="276" y="145" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#FFFFFF">1/4</text>
  <text x="28" y="210" font-family="monospace" font-size="14" font-weight="600" fill="#D97706">4 / 8</text>
  <rect x="96" y="186" width="60" height="40" fill="#D97706" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="156" y="186" width="60" height="40" fill="#D97706" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="216" y="186" width="60" height="40" fill="#D97706" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="276" y="186" width="60" height="40" fill="#D97706" fill-opacity="0.85" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="336" y="186" width="60" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="396" y="186" width="60" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="456" y="186" width="60" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <rect x="516" y="186" width="60" height="40" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
  <line x1="336" y1="46" x2="336" y2="246" stroke="#DC2626" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="344" y="256" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">Frontière d'équivalence exacte (= 0,5)</text>
</svg>`,
      annotations: [
        {
          id: 'ann-1',
          x: 52,
          y: 26,
          label: 'Même unité totale',
          detail: 'Les trois bandes ont exactement la même longueur totale (1 unité).',
        },
        {
          id: 'ann-2',
          x: 52.5,
          y: 88,
          label: 'Alignement des frontières',
          detail: 'La ligne pointillée rouge montre que 1/2, 2/4 et 4/8 s’arrêtent au même endroit.',
        },
      ],
    },
    objetManipulable: {
      actif: true,
      type: 'fractions',
      titre: 'Comparateur dynamique de fractions équivalentes',
      consigne:
        'Ajustez le numérateur, le dénominateur et le facteur multiplicateur pour observer que la surface colorée reste identique.',
      parametres: {
        valeurA: 1,
        valeurB: 2,
        denominateur: 2,
        unite: 'parts',
      },
    },
    synthese: {
      resumeCle:
        'On obtient une fraction équivalente en multipliant ou en divisant le numérateur ET le dénominateur par un même nombre entier différent de zéro.',
      traceEcriteEleve:
        'Deux fractions sont équivalentes lorsqu’elles représentent la même part d’une même unité : 1/2 = (1×2)/(2×2) = 2/4 = 4/8.',
      motsCles: ['Numérateur', 'Dénominateur', 'Équivalence', 'Unité', 'Partage égal'],
      prolongement:
        'En séance suivante : utiliser les fractions équivalentes pour additionner deux fractions de dénominateurs multiples (1/2 + 1/4).',
    },
    suggestionsIA: [
      {
        id: 'sug-1',
        categorie: 'Inclusion',
        titre: 'Code couleur systématique sur les ardoises',
        constat:
          'Les élèves confondent souvent numérateur et dénominateur lors du passage à l’écriture abstraite.',
        proposition:
          'Ajouter une règle explicite d’encadrement couleur (bleu pour le haut, vert pour le bas) dès l’Activité 1.',
        appliquee: false,
      },
      {
        id: 'sug-2',
        categorie: 'Différenciation',
        titre: 'Défi de simplification inverse',
        constat: 'Les élèves rapides maîtrisent vite la multiplication mais peinent à simplifier.',
        proposition:
          'Intégrer une question de passage de 6/8 à 3/4 par regroupement de parts par deux.',
        appliquee: false,
      },
    ],
    historique: [
      {
        id: 'hist-1',
        date: '2026-11-12T09:30:00Z',
        action: 'Création initiale',
        resume: 'Fiche modèle APC générée et validée pour le cycle 3 (CM2).',
      },
    ],
    eleves: [
      {
        id: 'eleve-1',
        prenom: 'Léa M.',
        besoinSpecifique: 'DYS / Repérage visuel (code couleur numérateur-dénominateur)',
        objectifIndividuel: 'Associer bande pliée 1/2 et 2/4 à l’oral sans inversion.',
        statut: 'en_cours',
      },
      {
        id: 'eleve-2',
        prenom: 'Sami K.',
        besoinSpecifique: 'TDAH / Consignes séquentielles courtes avec bande-repère',
        objectifIndividuel: 'Compléter 2 égalités simples à trous sur ardoise.',
        statut: 'acquis',
      },
      {
        id: 'eleve-3',
        prenom: 'Noah T.',
        besoinSpecifique: 'Trouble praxique / Manipulation en binôme avec réglettes tactiles',
        objectifIndividuel: 'Justifier oralement pourquoi 3/5 ≠ 4/6 par comparaison.',
        statut: 'a_consolider',
      },
    ],
    modeCreation: 'ia',
    createdAt: '2026-11-12T09:30:00Z',
    updatedAt: '2026-11-12T09:30:00Z',
  },
  {
    id: 'fiche-fr-accord-verbe-cm1',
    titre: 'Accorder le verbe avec un sujet éloigné ou inversé',
    theme: 'Étude de la langue — Maîtrise de l’accord sujet-verbe',
    matiere: 'Français',
    niveau: 'CM1',
    duree: '40 min',
    effectif: '5 élèves (APC remédiation orthographique)',
    competenceDeBase:
      'CB2 (Français CM1) — Maîtriser la chaîne d’accord sujet-verbe dans des phrases complexes à sujet éloigné ou inversé.',
    competenceVisee:
      'Identifier le noyau du groupe sujet même lorsqu’il est séparé du verbe par un complément ou placé après le verbe, afin d’accorder correctement.',
    objectifsSpecifiques: [
      'Repérer le verbe conjugué et poser la question « Qui est-ce qui + verbe ? ».',
      'Distinguer le mot-noyau du groupe nominal sujet des compléments intercalés.',
      'Réussir l’accord en personne et en nombre dans des phrases courtes puis complexes.',
    ],
    prerequis: [
      'Identifier le verbe conjugué dans une phrase simple.',
      'Connaître les terminaisons du présent et de l’imparfait (-e/-ent, -ait/-aient).',
    ],
    materiel: [
      'Étiquettes-mots mobiles (sujets, écrans, verbes)',
      'Surligneurs jaune (verbe) et bleu (sujet)',
      'Fiches d’entraînement à police adaptée (sans empattement, interligne 1,5)',
    ],
    introduction: {
      accroche:
        'Observation de la phrase piège : « Les oiseaux du grand parc chante(nt) dès l’aube. » Pourquoi certains écrivent-ils -e au lieu de -ent ?',
      miseEnSituation:
        'Chaque élève entoure le mot juste avant le verbe (« parc ») et découvre le piège de proximité.',
      consigneDepart:
        'En binôme, utilisez la manipulation des étiquettes pour supprimer les mots qui font écran entre le sujet et le verbe.',
    },
    deroulement: [
      {
        id: 'etape-fr-1',
        etape: '1. Préparation & Détection du piège',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Dans « Les oiseaux du grand parc chante(nt)… », quel est le verbe conjugué ?\nQ2 : Pourquoi certains hésitent-ils entre -e et -ent devant « parc » ?',
        activitesEleves:
          'R1 : Soulignent « chantent » en jaune.\nR2 : Expriment leur doute entre le mot proche « parc » (singulier) et « les oiseaux » (pluriel).',
        indicateursInclusifs:
          '• Prise de conscience du piège de proximité.\n[Inclusion handicap] DYS/Visuel : supports imprimés corps 14 sans empattement, interligne 1,5 et mots-clés colorés.',
      },
      {
        id: 'etape-fr-2',
        etape: '2. Lancement : La règle de l’élastique',
        duree: '8 min',
        activitesMaitre:
          'Q1 : En encadrant par « Ce sont … qui », qui fait réellement l’action de chanter ?\nQ2 : Par quel pronom (il / ils) remplace-t-on ce groupe sujet ?',
        activitesEleves:
          'R1 : Testent « Ce sont les oiseaux du grand parc qui chantent » et isolent le noyau « oiseaux ».\nR2 : Remplacent par « Ils » et concluent à la terminaison -ent.',
        indicateursInclusifs:
          '• Maîtrise du test « C’est / Ce sont … qui ».\n[Inclusion handicap] Kinesthésique/Moteur/TSA : relier physiquement les deux étiquettes avec un fil de laine ou une flèche.',
      },
      {
        id: 'etape-fr-3',
        etape: '3. Activité 1 : Tri et accord sur étiquettes',
        duree: '14 min',
        activitesMaitre:
          'Q1 : Dans « Dans la forêt avancent les loups », où se cache le sujet du verbe ?\nQ2 : Comment remettre mentalement la phrase dans l’ordre pour vérifier la terminaison ?',
        activitesEleves:
          'R1 : Manipulent les étiquettes pour repérer le sujet inversé (« les loups ») après le verbe.\nR2 : Associent le pronom substitut (« Ils ») puis choisissent la terminaison juste.',
        indicateursInclusifs:
          '• Identification fiable des sujets éloignés et inversés.\n[Inclusion handicap] Moteur/DYS : grille de relecture en 3 étapes et étiquettes collables pour réduire la copie.',
      },
      {
        id: 'etape-fr-4',
        etape: '4. Synthèse & Mémo visuel',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Quels sont les 3 verbes d’action de notre méthode pour accorder sans jamais tomber dans le piège ?\nQ2 : Quel exemple à sujet éloigné et quel exemple à sujet inversé garder en modèle ?',
        activitesEleves:
          'R1 : Énoncent : 1) Repérer le verbe · 2) Encadrer le sujet · 3) Remplacer par il/ils.\nR2 : Complètent leur carte-mémo personnelle avec flèche d’accord.',
        indicateursInclusifs:
          '• Mémorisation de la procédure en 3 temps.\n[Inclusion handicap] DYS/Visuel : schéma fléché couleur conservé dans le cahier-outil.',
      },
      {
        id: 'etape-fr-5',
        etape: '5. Évaluation flash',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Avant d’écrire la terminaison du verbe dicté, où tracez-vous votre flèche d’accord ?\nQ2 : Quel pronom mental justifie votre terminaison ?',
        activitesEleves:
          'R1 : Tracent la flèche du noyau du sujet vers le verbe puis écrivent -e ou -ent / -ait ou -aient.\nR2 : Justifient oralement avec « il » ou « ils ».',
        indicateursInclusifs:
          '• Accord exact sur 2 phrases pièges.\n[Inclusion handicap] DYS/Moteur : évaluation ciblée sur la terminaison verbale uniquement (mots fournis).',
      },
    ],
    questionsReponses: [
      {
        id: 'qr-fr-1',
        question: 'Comment éviter le piège du mot placé juste devant le verbe ?',
        reponseAttendue:
          'On encadre le groupe sujet par « C’est ... qui » ou « Ce sont ... qui » et on le remplace par un pronom (il, elle, ils, elles).',
        indicePedagogique:
          'Faire supprimer mentalement le complément du nom (« du grand parc ») pour rapprocher noyau et verbe.',
        difficulte: 'Fondamental',
      },
      {
        id: 'qr-fr-2',
        question: 'Dans « Au fond du jardin dorment les chats », quel est le sujet et pourquoi ?',
        reponseAttendue:
          'Le sujet est « les chats » (sujet inversé après le verbe). Ce sont les chats qui dorment -> ils dorment (-ent).',
        indicePedagogique: 'Remettre la phrase dans l’ordre canonique Sujet + Verbe.',
        difficulte: 'Approfondissement',
      },
      {
        id: 'qr-fr-3',
        question: 'Dans « Les nuages que pousse le vent traversent le ciel », quel nom commande l’accord de « traversent » : le vent ou les nuages ?',
        reponseAttendue:
          'Ce sont « Les nuages » qui traversent le ciel (ils traversent → -ent), tandis que « le vent » commande seulement le verbe « pousse ».',
        indicePedagogique: 'Pose deux questions distinctes : qui pousse ? puis qui traverse le ciel ?',
        difficulte: 'Défi',
      },
    ],
    illustration: {
      titre: 'Schéma de la méthode de l’élastique Sujet-Verbe',
      legende: 'Identifier le mot-noyau au-delà du complément écran pour accorder le verbe.',
      typeSchema: 'carte_mentale',
      svgCode: `<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="250" fill="#F8FAFC" rx="8"/>
  <text x="28" y="34" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">Relier le noyau du sujet au verbe malgré les mots écrans</text>
  <rect x="34" y="100" width="135" height="46" rx="6" fill="#DBEAFE" stroke="#0284C7" stroke-width="2"/>
  <text x="101" y="128" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">Les oiseaux</text>
  <rect x="188" y="100" height="46" width="175" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 3" stroke-width="1.5"/>
  <text x="275" y="128" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#475569">du grand parc (écran)</text>
  <rect x="384" y="100" width="128" height="46" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="448" y="128" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">chantent</text>
  <path d="M 101 100 C 101 48, 448 48, 448 100" fill="none" stroke="#0284C7" stroke-width="2.5"/>
  <polygon points="448,100 442,89 454,89" fill="#0284C7"/>
  <text x="275" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0284C7">Accord direct : Ils (pluriel) -> -ent</text>
  <rect x="140" y="182" width="360" height="40" rx="6" fill="#ECFDF5" stroke="#059669" stroke-width="1.5"/>
  <text x="320" y="207" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="600" fill="#065F46">Test : « Ce sont les oiseaux qui chantent » = validé</text>
</svg>`,
      annotations: [
        {
          id: 'ann-fr-1',
          x: 16,
          y: 49,
          label: 'Noyau du sujet',
          detail: 'Mot chef du groupe nominal qui commande l’accord (pluriel).',
        },
        {
          id: 'ann-fr-2',
          x: 43,
          y: 49,
          label: 'Complément écran',
          detail: 'Ne commande jamais le verbe ; on peut le déplacer ou le masquer.',
        },
      ],
    },
    objetManipulable: {
      actif: false,
      type: 'fractions',
      titre: 'Outil mathématique désactivé pour cette séance de français',
      consigne: '',
      parametres: { valeurA: 1, valeurB: 2, denominateur: 2 },
    },
    synthese: {
      resumeCle:
        'Le verbe s’accorde toujours avec le noyau du sujet, jamais avec le mot le plus proche.',
      traceEcriteEleve:
        'Pour accorder sans erreur : 1) Je trouve le verbe. 2) J’encadre le sujet avec « C’est / Ce sont ... qui ». 3) Je remplace par il/ils pour choisir la terminaison.',
      motsCles: ['Noyau du sujet', 'Complément écran', 'Sujet inversé', 'Pronom substitut'],
      prolongement:
        'Réinvestissement en dictée négociée lors de la prochaine séance de classe.',
    },
    suggestionsIA: [
      {
        id: 'sug-fr-1',
        categorie: 'Évaluation',
        titre: 'Grille d’auto-correction autonome',
        constat: 'Les élèves ont besoin d’un repère stable après la séance APC.',
        proposition:
          'Ajouter une check-list de 3 cases à cocher en marge de l’évaluation flash.',
        appliquee: false,
      },
    ],
    historique: [
      {
        id: 'hist-fr-1',
        date: '2026-11-10T14:15:00Z',
        action: 'Création initiale',
        resume: 'Fiche APC Français CM1 prête à l’emploi.',
      },
    ],
    modeCreation: 'ia',
    createdAt: '2026-11-10T14:15:00Z',
    updatedAt: '2026-11-10T14:15:00Z',
  },
  {
    id: 'fiche-sci-cycle-eau-6e',
    titre: 'Modéliser le cycle de l’eau et les changements d’état',
    theme: 'Matière, mouvement, énergie — États physiques et cycle naturel de l’eau',
    matiere: 'Sciences et Technologie',
    niveau: '6ème',
    duree: '50 min',
    effectif: '6 élèves (atelier scientifique APC)',
    competenceDeBase:
      'CB1 (Sciences 6ème) — Pratiquer une démarche d’investigation pour expliquer les changements d’état de l’eau et modéliser le cycle naturel.',
    competenceVisee:
      'Relier les transformations physiques de l’eau (évaporation, condensation, solidification, fusion) aux phénomènes météorologiques du cycle de l’eau.',
    objectifsSpecifiques: [
      'Nommer correctement les quatre changements d’état majeurs du cycle naturel.',
      'Associer l’apport ou la perte de chaleur à chaque changement d’état.',
      'Annoter un schéma scientifique complet avec des flèches orientées et des légendes exactes.',
    ],
    prerequis: [
      'Connaître les trois états de la matière (solide, liquide, gazeux).',
      'Savoir lire une température en degrés Celsius (°C) sur un thermomètre.',
    ],
    materiel: [
      'Bocal transparent fermé, glaçons et eau tiède pour mini-modélisation',
      'Cartes-étiquettes plastifiées des changements d’état',
      'Schéma vierge agrandi au format A3',
    ],
    introduction: {
      accroche:
        'Pourquoi des gouttelettes apparaissent-elles sous le couvercle d’un bocal contenant de l’eau tiède surmonté d’un glaçon ?',
      miseEnSituation:
        'Observation directe du dispositif expérimental pendant 3 minutes et formulation d’hypothèses orales.',
      consigneDepart:
        'Décrivez le trajet invisible de l’eau entre le fond du bocal et le couvercle froid en utilisant vos mots.',
    },
    deroulement: [
      {
        id: 'etape-sci-1',
        etape: '1. Préparation & Observation expérimentale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Que voyez-vous se former sur les parois et sous le couvercle du bocal contenant de l’eau tiède et un glaçon ?\nQ2 : D’où vient cette eau selon vos premières hypothèses ?',
        activitesEleves:
          'R1 : Observent attentivement la buée puis les gouttes qui retombent.\nR2 : Formulent des hypothèses orales ou dessinent ce qu’ils observent.',
        indicateursInclusifs:
          '• Distinction nette entre fait observé et hypothèse.\n[Inclusion handicap] Moteur/DYS/Visuel : réponse autorisée par dessin fléché et observation rapprochée autour du bocal.',
      },
      {
        id: 'etape-sci-2',
        etape: '2. Lancement & Lexique scientifique',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Quel nom scientifique correspond au passage de l’eau liquide à la vapeur invisible ?\nQ2 : Et quand la vapeur refroidie redevient des gouttelettes sous le couvercle ?',
        activitesEleves:
          'R1 : Associent « Évaporation » à la montée invisible due à la chaleur.\nR2 : Placent les cartes-étiquettes « Condensation », « Précipitations » et « Ruissellement » sur le dispositif et le schéma.',
        indicateursInclusifs:
          '• Maîtrise du lexique des changements d’état.\n[Inclusion handicap] DYS/Auditif/TSA : lexique illustré avec code couleur thermique (rouge = réchauffement / bleu = refroidissement).',
      },
      {
        id: 'etape-sci-3',
        etape: '3. Activité 1 : Reconstitution du cycle complet',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quel est le rôle du Soleil et du froid d’altitude dans ces 3 scénarios climatiques ?\nQ2 : Comment relier toutes les flèches pour montrer que la quantité d’eau sur Terre se conserve ?',
        activitesEleves:
          'R1 : Complètent le schéma du cycle en binôme et orientent correctement chaque flèche.\nR2 : Vérifient la boucle fermée avec l’explorateur de bilan des volumes.',
        indicateursInclusifs:
          '• Modélisation exacte du cycle fermé.\n[Inclusion handicap] TDAH/DYS/Moteur : binôme tuteur, étayage par questions fermées intermédiaires et étiquettes à placer.',
      },
      {
        id: 'etape-sci-4',
        etape: '4. Synthèse structurée',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Quelles sont les 4 étapes majeures du cycle naturel de l’eau dans l’ordre ?\nQ2 : Quelle différence entre la vapeur invisible et la buée ou le nuage visible ?',
        activitesEleves:
          'R1 : Énoncent : Évaporation → Condensation → Précipitations → Ruissellement/Infiltration.\nR2 : Retiennent que le nuage est déjà composé de gouttelettes liquides ou cristaux, pas de gaz invisible.',
        indicateursInclusifs:
          '• Synthèse scientifique précise sans confusion gaz/buée.\n[Inclusion handicap] DYS/Visuel : trace écrite aérée à trous et encadré visuel récapitulatif.',
      },
      {
        id: 'etape-sci-5',
        etape: '5. Évaluation formative',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Ces 3 affirmations (« Les nuages sont de la vapeur d’eau gazeuse »…) sont-elles Vraies ou Fausses ?\nQ2 : Quel mot scientifique justifie votre carte ?',
        activitesEleves:
          'R1 : Lèvent simultanément la carte Vrai ou Faux.\nR2 : Justifient oralement avec le vocabulaire exact appris en séance.',
        indicateursInclusifs:
          '• Validation individuelle des acquis.\n[Inclusion handicap] TSA/Auditif/Moteur : réponse gestuelle simultanée sans exposition anxiogène.',
      },
    ],
    questionsReponses: [
      {
        id: 'qr-sci-1',
        question: 'Quel est le moteur énergétique qui déclenche l’évaporation de l’eau des océans ?',
        reponseAttendue:
          'Le rayonnement solaire (la chaleur du Soleil) réchauffe l’eau en surface et permet son passage à l’état gazeux.',
        indicePedagogique: 'Comparer avec l’eau tiède chauffée au fond du bocal.',
        difficulte: 'Fondamental',
      },
      {
        id: 'qr-sci-2',
        question: 'Que se passe-t-il quand la vapeur d’eau rencontre l’air froid en altitude ?',
        reponseAttendue:
          'Elle se refroidit et subit une condensation (liquéfaction) en minuscules gouttelettes qui forment les nuages.',
        indicePedagogique: 'Observer le dessous du couvercle refroidi par le glaçon.',
        difficulte: 'Approfondissement',
      },
      {
        id: 'qr-sci-3',
        question: 'Pourquoi dit-on que la quantité totale d’eau sur Terre reste constante malgré les sécheresses locales ?',
        reponseAttendue:
          'Parce que le cycle de l’eau est une boucle fermée : l’eau ne disparaît pas, elle change d’état et se déplace d’un réservoir à un autre (océans, atmosphère, continents).',
        indicePedagogique: 'Observe le bocal fermé : l’eau s’évapore puis retombe à l’intérieur sans s’échapper.',
        difficulte: 'Défi',
      },
    ],
    illustration: {
      titre: 'Schéma annoté du cycle naturel de l’eau',
      legende: 'Boucle fermée pilotée par l’énergie solaire et la gravité terrestre.',
      typeSchema: 'svg',
      svgCode: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="280" fill="#F8FAFC" rx="8"/>
  <circle cx="90" cy="56" r="28" fill="#F59E0B"/>
  <text x="90" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#B45309">Énergie solaire</text>
  <rect x="40" y="210" width="240" height="48" rx="4" fill="#0284C7" fill-opacity="0.85"/>
  <text x="160" y="238" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Océan (état liquide)</text>
  <path d="M 180 205 C 180 150, 210 130, 230 92" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="5 3"/>
  <polygon points="230,92 221,98 232,104" fill="#DC2626"/>
  <text x="150" y="146" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">Évaporation</text>
  <ellipse cx="320" cy="68" rx="76" ry="26" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>
  <text x="320" y="72" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">Condensation (nuages)</text>
  <path d="M 400 72 L 485 72" fill="none" stroke="#475569" stroke-width="2"/>
  <polygon points="485,72 476,67 476,77" fill="#475569"/>
  <ellipse cx="525" cy="72" rx="46" ry="22" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
  <line x1="510" y1="100" x2="500" y2="148" stroke="#0284C7" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="535" y1="100" x2="525" y2="148" stroke="#0284C7" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="530" y="168" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0284C7">Précipitations</text>
  <polygon points="430,258 530,180 610,258" fill="#D1FAE5" stroke="#059669" stroke-width="1.5"/>
  <path d="M 470 220 Q 380 232 285 232" fill="none" stroke="#059669" stroke-width="2.5"/>
  <polygon points="285,232 295,227 295,237" fill="#059669"/>
  <text x="375" y="250" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065F46">Ruissellement &amp; infiltration</text>
</svg>`,
      annotations: [
        {
          id: 'ann-sci-1',
          x: 28,
          y: 52,
          label: 'Changement liquide -> gaz',
          detail: 'Sous l’effet de la chaleur solaire, l’eau liquide devient vapeur invisible.',
        },
        {
          id: 'ann-sci-2',
          x: 50,
          y: 25,
          label: 'Changement gaz -> liquide',
          detail: 'En altitude, le refroidissement transforme la vapeur en gouttelettes (nuages).',
        },
      ],
    },
    objetManipulable: {
      actif: true,
      type: 'proportionnalite',
      titre: 'Bilan de conservation des volumes d’eau',
      consigne: 'Observez la proportionnalité entre surface évaporée et volume précipité dans un cycle fermé.',
      parametres: {
        valeurA: 4,
        valeurB: 3,
        unite: 'L/m²',
      },
    },
    synthese: {
      resumeCle:
        'L’eau sur Terre décrit un cycle fermé permanent en changeant d’état physique sous l’action de l’énergie solaire et de la gravité.',
      traceEcriteEleve:
        'Évaporation (liquide -> gaz) -> Condensation (gaz -> liquide) -> Précipitations -> Ruissellement vers les océans.',
      motsCles: ['Évaporation', 'Condensation', 'Précipitations', 'Ruissellement', 'Cycle fermé'],
      prolongement: 'Mesure pluviométrique sur une semaine dans la cour du collège.',
    },
    suggestionsIA: [
      {
        id: 'sug-sci-1',
        categorie: 'Clarté',
        titre: 'Distinguer vapeur invisible et brouillard',
        constat: 'Les élèves confondent souvent la vapeur d’eau (gaz invisible) avec la buée visible.',
        proposition: 'Ajouter une remarque explicite dans la colonne Indicateurs de l’étape 2.',
        appliquee: false,
      },
    ],
    historique: [
      {
        id: 'hist-sci-1',
        date: '2026-11-11T10:00:00Z',
        action: 'Création initiale',
        resume: 'Fiche modèle Sciences 6ème prête pour expérimentation APC.',
      },
    ],
    modeCreation: 'ia',
    createdAt: '2026-11-11T10:00:00Z',
    updatedAt: '2026-11-11T10:00:00Z',
  },
];

export const DEFAULT_PREFERENCES: PreferenceApprentissage[] = [
  {
    id: 'pref-1',
    date: '2026-11-12T09:30:00Z',
    regle: 'Toujours inclure des adaptations explicites DYS / TDAH dans la colonne Indicateurs pédagogiques inclusifs.',
    source: 'Référentiel inclusion APC',
  },
  {
    id: 'pref-2',
    date: '2026-11-12T09:35:00Z',
    regle: 'Privilégier des consignes courtes numérotées et des vérifications orales avant le passage à l’écrit.',
    source: 'Retour pratique enseignant',
  },
];

export function createCompactSnapshot(fiche: FicheAPC): string {
  const { historique: _ignored, ...rest } = fiche;
  void _ignored;
  return JSON.stringify(rest);
}

export function loadFiches(): FicheAPC[] {
  if (typeof window === 'undefined') return SAMPLE_FICHES.map(normalizeFiche);
  try {
    const raw = window.localStorage.getItem(FICHES_KEY);
    if (!raw) {
      const normalized = SAMPLE_FICHES.map(normalizeFiche);
      window.localStorage.setItem(FICHES_KEY, JSON.stringify(normalized));
      return normalized;
    }
    const parsed = JSON.parse(raw) as FicheAPC[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeFiche)
      : SAMPLE_FICHES.map(normalizeFiche);
  } catch {
    return SAMPLE_FICHES.map(normalizeFiche);
  }
}

export interface SaveFichesResult {
  ok: boolean;
  trimmed?: boolean;
  error?: string;
}

function capSnapshots(fiches: FicheAPC[], maxSnapshotsPerFiche: number): FicheAPC[] {
  return fiches.map((fiche) => {
    const hist = Array.isArray(fiche.historique) ? fiche.historique : [];
    let kept = 0;
    return {
      ...fiche,
      historique: hist.slice(0, 15).map((entry) => {
        if (!entry.snapshot) return entry;
        if (kept < maxSnapshotsPerFiche) {
          kept += 1;
          return entry;
        }
        const { snapshot: _drop, ...rest } = entry;
        void _drop;
        return rest;
      }),
    };
  });
}

export function saveFiches(fiches: FicheAPC[]): SaveFichesResult {
  if (typeof window === 'undefined') return { ok: true };
  const prepared = capSnapshots(fiches, 6);
  try {
    window.localStorage.setItem(FICHES_KEY, JSON.stringify(prepared));
    return { ok: true };
  } catch {
    try {
      const stripped = capSnapshots(fiches, 0);
      window.localStorage.setItem(FICHES_KEY, JSON.stringify(stripped));
      return { ok: true, trimmed: true };
    } catch {
      return {
        ok: false,
        error:
          'Espace de stockage local saturé. Exportez puis supprimez d’anciennes fiches pour libérer de la place.',
      };
    }
  }
}

export function loadPreferences(): PreferenceApprentissage[] {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as PreferenceApprentissage[];
    return Array.isArray(parsed) ? parsed : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: PreferenceApprentissage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

export function loadActiveFicheId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

export function saveActiveFicheId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch {
    // Ignore
  }
}

/**
 * Générateur déterministe hors-ligne permettant de créer une fiche APC structurée
 * même sans connexion internet.
 */
export function buildOfflineFiche(params: {
  titre: string;
  theme: string;
  matiere: string;
  niveau: string;
  duree: string;
  disciplineId?: string;
  competenceDeBase?: string;
  cbCode?: CbMathType;
  handicapProfiles?: HandicapProfileId[];
  includeManipulable: boolean;
  referenceFiche?: FicheAPC | null;
}): FicheAPC {
  const now = new Date().toISOString();
  const id = createUid('fiche');
  const isMathOrScience =
    params.matiere === 'Mathématiques' || params.matiere === 'Sciences et Technologie';
  const profile = findDisciplineProfile(
    params.referenceFiche?.disciplineId || params.disciplineId || params.matiere,
    params.titre
  );
  const mathActive = isMathContext(params.matiere, profile.id);
  const resolvedCbCode = mathActive
    ? normalizeCbMathCode(
        params.cbCode,
        params.competenceDeBase,
        params.titre,
        params.theme
      )
    : undefined;
  const resolvedHandicaps = normalizeHandicapProfiles(
    params.handicapProfiles && params.handicapProfiles.length > 0
      ? params.handicapProfiles
      : params.referenceFiche?.handicapsInclus || DEFAULT_HANDICAP_PROFILES
  );

  const tpl = getTemplateByDiscipline(
    params.referenceFiche?.disciplineId || params.disciplineId || params.matiere,
    params.matiere,
    params.titre
  );
  const titleLabel = params.titre?.trim() || tpl.titreSuggere;
  const themeLabel = params.theme?.trim() || tpl.themeSuggere;

  const baseStages =
    params.referenceFiche && params.referenceFiche.deroulement.length > 0
      ? params.referenceFiche.deroulement.map((refStep, idx) => {
          const tplStep = tpl.etapes[idx];
          const canon = profile.etapesCanoniques[idx];
          const hasRichActivities =
            refStep.activitesMaitre.includes('Q') || refStep.activitesEleves.includes('R');
          return {
            id: `${id}-e${idx + 1}`,
            etape: refStep.etape,
            sousTitreInvariable:
              refStep.sousTitreInvariable ||
              inferInvariantSubtitle(refStep.etape, idx, profile.id),
            duree: refStep.duree,
            activitesMaitre: hasRichActivities
              ? refStep.activitesMaitre
              : tplStep?.activitesMaitre ||
                `• Conduit « ${refStep.etape} » autour de « ${titleLabel} ».\nQ1 : Quelle donnée ou règle repérez-vous ici ?\nQ2 : Comment expliquer votre démarche ?`,
            activitesEleves: hasRichActivities
              ? refStep.activitesEleves
              : tplStep?.activitesEleves ||
                `R1 : Observent et identifient les éléments clés sur « ${themeLabel} ».\nR2 : Formulent leur réponse à l’oral puis sur support adapté.`,
            indicateursInclusifs:
              refStep.indicateursInclusifs?.includes('[Inclusion handicap]')
                ? refStep.indicateursInclusifs
                : tplStep?.indicateursInclusifs ||
                  `• ${canon?.focusInclusif || 'Critères observables APC.'}\n[Inclusion handicap] DYS/Visuel/Auditif/Moteur/TSA : consignes courtes numérotées, support aéré et validation orale/visuelle.`,
          };
        })
      : tpl.etapes.map((tplStep, idx) => {
          const canon = profile.etapesCanoniques[idx];
          return {
            id: `${id}-e${idx + 1}`,
            etape: canon?.etape || tplStep.etape,
            sousTitreInvariable: canon?.sousTitreInvariable || tplStep.sousTitreInvariable,
            duree: tplStep.duree || canon?.duree || '8 min',
            activitesMaitre:
              idx === 1
                ? `• Contexte : « ${titleLabel} » (${themeLabel}).\n${tplStep.activitesMaitre}`
                : tplStep.activitesMaitre,
            activitesEleves: tplStep.activitesEleves,
            indicateursInclusifs: tplStep.indicateursInclusifs,
          };
        });

  const baseQuestions =
    params.referenceFiche &&
    params.referenceFiche.questionsReponses.length >= 3
      ? params.referenceFiche.questionsReponses.map((q, idx) => ({
          id: `${id}-q${idx + 1}`,
          question: q.question,
          reponseAttendue: q.reponseAttendue,
          indicePedagogique: q.indicePedagogique,
          difficulte: q.difficulte,
        }))
      : tpl.questionsReponses.map((q, idx) => ({
          id: `${id}-q${idx + 1}`,
          question:
            idx === 0 && params.titre?.trim()
              ? `${q.question} (Séance : « ${titleLabel} »)`
              : q.question,
          reponseAttendue: q.reponseAttendue,
          indicePedagogique: q.indicePedagogique,
          difficulte: q.difficulte,
        }));

  return {
    id,
    disciplineId: profile.id,
    origineModele: params.referenceFiche?.origineModele,
    handicapsInclus: resolvedHandicaps,
    titre: params.titre || 'Séance APC structurée',
    theme: params.theme || 'Consolidation des compétences fondamentales',
    matiere: params.matiere,
    niveau: params.niveau,
    duree: params.duree || '45 min',
    effectif: '5 à 6 élèves (groupe APC)',
    competenceDeBase:
      params.competenceDeBase?.trim() ||
      `${profile.cbPrefixe} — Mobiliser les savoirs liés à « ${params.theme} ».`,
    competenceVisee: `Maîtriser les notions clés liées à « ${params.theme} » dans le cadre de la séance « ${params.titre} ».`,
    objectifsSpecifiques: [
      `Comprendre le concept central de : ${params.titre}.`,
      'Mettre en œuvre une démarche structurée et verbaliser ses stratégies.',
      'Réussir les exercices d’application guidée puis autonome.',
    ],
    prerequis: [
      `Notions antérieures du niveau ${params.niveau} en ${params.matiere}.`,
    ],
    materiel: [
      'Fiche élève imprimée (corps lisible, interligne aéré)',
      'Ardoise effaçable et matériel de manipulation',
    ],
    introduction: {
      accroche: `Situation de départ concrète autour de « ${params.titre} » pour susciter le questionnement immédiat des élèves.`,
      miseEnSituation:
        'Échange rapide en petit groupe afin d’identifier les représentations initiales et rassurer les élèves.',
      consigneDepart:
        'Observez l’exemple proposé et formulez une première piste sur votre ardoise.',
    },
    deroulement: baseStages,
    questionsReponses: baseQuestions,
    illustration: {
      titre: `Schéma structurant : ${params.titre}`,
      legende: 'Support visuel généré localement (mode hors-ligne, modifiable ou régénérable par IA en ligne).',
      typeSchema: 'carte_mentale',
      svgCode: `<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="240" fill="#F8FAFC" rx="8"/>
  <rect x="200" y="24" width="240" height="44" rx="6" fill="#0F172A"/>
  <text x="320" y="51" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${params.matiere.toUpperCase()} — ${params.niveau}</text>
  <line x1="320" y1="68" x2="120" y2="120" stroke="#0284C7" stroke-width="2"/>
  <line x1="320" y1="68" x2="320" y2="120" stroke="#059669" stroke-width="2"/>
  <line x1="320" y1="68" x2="520" y2="120" stroke="#D97706" stroke-width="2"/>
  <rect x="30" y="120" width="180" height="72" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
  <text x="120" y="148" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0284C7">1. Observer</text>
  <text x="120" y="170" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Situation concrète</text>
  <rect x="230" y="120" width="180" height="72" rx="6" fill="#FFFFFF" stroke="#059669" stroke-width="1.5"/>
  <text x="320" y="148" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">2. Manipuler</text>
  <text x="320" y="170" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Essais &amp; verbalisation</text>
  <rect x="430" y="120" width="180" height="72" rx="6" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/>
  <text x="520" y="148" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#D97706">3. Valider</text>
  <text x="520" y="170" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Synthèse &amp; transfert</text>
</svg>`,
      annotations: [
        {
          id: `${id}-ann-1`,
          x: 50,
          y: 20,
          label: 'Point d’ancrage',
          detail: 'Relie le titre de la séance aux trois phases actives.',
        },
      ],
    },
    objetManipulable: {
      actif: params.includeManipulable && isMathOrScience,
      type: params.matiere === 'Mathématiques' ? 'geometrie_aire' : 'proportionnalite',
      titre: `Explorateur interactif — ${params.titre}`,
      consigne: 'Modifiez les paramètres ci-dessous pour expérimenter visuellement pendant l’APC.',
      parametres: {
        valeurA: 3,
        valeurB: 4,
        denominateur: 6,
        unite: 'unités',
      },
    },
    schematisationMath: mathActive
      ? buildFallbackMathSchematisation({
          cbCode: resolvedCbCode,
          competenceDeBase:
            params.competenceDeBase?.trim() ||
            `${profile.cbPrefixe} — Mobiliser les savoirs liés à « ${params.theme} ».`,
          titre: params.titre || 'Séance de mathématiques APC',
          theme: params.theme,
          situationProbleme: `Situation de départ concrète autour de « ${params.titre} » pour susciter le questionnement immédiat des élèves.`,
          niveau: params.niveau,
        })
      : undefined,
    phasesManipulation: !mathActive
      ? buildUniversalManipulationSchematisation({
          matiere: params.matiere,
          disciplineId: profile.id,
          competenceDeBase:
            params.competenceDeBase?.trim() ||
            `${profile.cbPrefixe} — Mobiliser les savoirs liés à « ${params.theme} ».`,
          titre: params.titre || 'Séance APC',
          theme: params.theme,
          situationProbleme: `Situation de départ concrète autour de « ${params.titre} » pour susciter le questionnement immédiat des élèves.`,
          niveau: params.niveau,
        })
      : undefined,
    synthese: {
      resumeCle: `Synthèse de la séance « ${params.titre} » : consolider les acquis par manipulation et verbalisation.`,
      traceEcriteEleve: `À retenir (${params.niveau}) : étape par étape, j’applique la méthode travaillée en APC pour réussir seul.`,
      motsCles: [params.matiere, params.niveau, 'APC', 'Manipulation', 'Autonomie'],
      prolongement: 'Réinvestissement rapide au début de la séance de classe suivante.',
    },
    suggestionsIA: [
      {
        id: `${id}-sug-1`,
        categorie: 'Illustration',
        titre: 'Enrichir le schéma avec l’IA en ligne',
        constat: 'Cette fiche a été créée en mode hors-ligne avec un schéma générique.',
        proposition:
          'Une fois connecté, cliquez sur « Analyser avec l’IA » pour générer un schéma disciplinaire sur mesure.',
        appliquee: false,
      },
    ],
    historique: [
      {
        id: `${id}-h1`,
        date: now,
        action: 'Création hors-ligne',
        resume: 'Structure complète générée localement sans connexion.',
      },
    ],
    modeCreation: 'manuel',
    createdAt: now,
    updatedAt: now,
  };
}

function inferLevelFromText(rawText: string, fileName: string): string {
  const combined = `${fileName}\n${rawText.slice(0, 1200)}`;
  const match = combined.match(
    /\b(CP|CE1|CE2|CM1|CM2|6[eè]me|5[eè]me|4[eè]me|3[eè]me|Lyc[ée]e)\b/i
  );
  if (!match) return 'CM1';
  const found = match[1].toUpperCase();
  if (found.startsWith('6')) return '6ème';
  if (found.startsWith('5')) return '5ème';
  if (found.startsWith('4')) return '4ème';
  if (found.startsWith('3')) return '3ème';
  if (found.startsWith('LYC')) return 'Lycée';
  return found;
}

function inferDureeFromText(rawText: string): string {
  const match = rawText.slice(0, 1200).match(/\b(\d{2})\s*min(?:utes?)?\b/i);
  if (match) {
    const mins = parseInt(match[1], 10);
    if (mins >= 15 && mins <= 120) return `${mins} min`;
  }
  return '45 min';
}

function splitTextIntoCompilationBlocks(rawText: string): string[] {
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
      if (chunk.length >= 60) sections.push(chunk);
    }
    if (sections.length >= 2) return sections.slice(0, 15);
  }

  const headerMatches = Array.from(
    clean.matchAll(
      /(?:^|\n)(?=(?:Mati[èe]re|Titre\s+de\s+la\s+(?:fiche|s[ée]ance))\s*:)/gim
    )
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
      if (chunk.length >= 60) sections.push(chunk);
    }
    if (sections.length >= 2) return sections.slice(0, 15);
  }

  return [clean];
}

/**
 * Importation hors-ligne d'un texte ou fichier Word extrait en brouillon structuré APC.
 */
export function buildImportedDraftFromText(
  fileName: string,
  rawText: string,
  options?: {
    format?: 'docx' | 'text';
    tailleOctets?: number;
    handicapProfiles?: HandicapProfileId[];
    referenceFiche?: FicheAPC | null;
    indexInCompilation?: number;
  }
): FicheAPC {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const explicitTitleLine = lines.find((l) => /^titre\s*[:—-]/i.test(l));
  const cleanedExplicitTitle = explicitTitleLine
    ? explicitTitleLine.replace(/^titre\s*(?:de\s+la\s+(?:fiche|s[ée]ance))?\s*[:—-]\s*/i, '').trim()
    : '';
  const firstMeaningful =
    lines.find((l) => !/^(===|---|\*\*\*)/.test(l)) || '';
  const baseName = fileName.replace(/\.(docx|pdf|txt|md|csv|tsv|html?|rtf)$/i, '');
  const titleCandidate = (
    cleanedExplicitTitle ||
    firstMeaningful.slice(0, 95) ||
    (options?.indexInCompilation
      ? `${baseName} — Fiche ${options.indexInCompilation}`
      : baseName)
  ).slice(0, 100);

  const explicitThemeLine = lines.find((l) => /^th[èe]me\s*[:—-]/i.test(l));
  const themeCandidate = explicitThemeLine
    ? explicitThemeLine.replace(/^th[èe]me\s*[:—-]\s*/i, '').trim()
    : '';

  const bodySnippet = lines.slice(1, 7).join(' ');
  const profile = findDisciplineProfile(
    rawText.slice(0, 900),
    `${titleCandidate} ${fileName}`
  );
  const inferredNiveau = inferLevelFromText(rawText, fileName);
  const inferredDuree = inferDureeFromText(rawText);
  const mathActive = isMathContext(profile.matiere, profile.id);

  const draft = buildOfflineFiche({
    titre: titleCandidate,
    theme:
      themeCandidate ||
      bodySnippet.slice(0, 140) ||
      `Contenu importé depuis ${fileName}`,
    matiere: profile.matiere,
    disciplineId: profile.id,
    niveau: inferredNiveau,
    duree: inferredDuree,
    includeManipulable: mathActive,
    handicapProfiles: options?.handicapProfiles,
    referenceFiche: options?.referenceFiche,
  });

  const now = new Date().toISOString();
  const detectedFormat =
    options?.format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : 'text');
  return normalizeFiche({
    ...draft,
    modeCreation: 'import',
    fichierSource: {
      nom: fileName,
      format: detectedFormat,
      importeLe: now,
      action: 'creation',
      tailleOctets: options?.tailleOctets,
    },
    introduction: {
      ...draft.introduction,
      miseEnSituation:
        bodySnippet.slice(0, 420) || draft.introduction.miseEnSituation,
    },
    historique: [
      {
        id: `${draft.id}-h-import`,
        date: now,
        action: options?.indexInCompilation
          ? `Importation compilation hors-ligne (#${options.indexInCompilation})`
          : 'Importation locale (hors-ligne)',
        resume: `Document « ${fileName} » structuré localement (${profile.nom}, ${inferredNiveau}). Utilisez l’assistant IA en ligne pour affiner.`,
      },
    ],
  });
}

/**
 * Découpe un document texte/Word contenant une compilation de plusieurs fiches
 * en brouillons APC distincts et différenciés (mode hors-ligne ou pré-analyse).
 */
export function buildImportedCompilationsFromText(
  fileName: string,
  rawText: string,
  options?: {
    format?: 'docx' | 'text';
    tailleOctets?: number;
    handicapProfiles?: HandicapProfileId[];
    referenceFiche?: FicheAPC | null;
  }
): FicheAPC[] {
  const sections = splitTextIntoCompilationBlocks(rawText);
  if (sections.length <= 1) {
    return [buildImportedDraftFromText(fileName, rawText, options)];
  }
  return sections.map((sectionText, idx) =>
    buildImportedDraftFromText(fileName, sectionText, {
      ...options,
      indexInCompilation: idx + 1,
    })
  );
}

/**
 * Applique une retouche/adaptation locale cohérente sur une fiche (utilisée en lot
 * sur des sélections ou compilations) avec sauvegarde automatique dans l'historique.
 */
export function applyBatchLocalAdaptationToFiche(
  fiche: FicheAPC,
  options: {
    handicapProfiles?: HandicapProfileId[];
    refreshManipulationPhases?: boolean;
    alignDisciplineSubtitles?: boolean;
  }
): FicheAPC {
  const now = new Date().toISOString();
  const snapshot = createCompactSnapshot(fiche);
  let next: FicheAPC = cloneFicheDeep(fiche);
  const changedLabels: string[] = [];

  if (options.alignDisciplineSubtitles) {
    const profile = findDisciplineProfile(
      next.disciplineId || next.matiere,
      next.titre
    );
    next = alignFicheToDisciplineSubtitles(next, profile);
    changedLabels.push(`Sous-titres disciplinaires (${profile.nom})`);
  }

  if (options.handicapProfiles && options.handicapProfiles.length > 0) {
    next = applyLocalHandicapInclusion(next, options.handicapProfiles);
    changedLabels.push(
      `Inclusion handicap (${options.handicapProfiles.length} profils)`
    );
  }

  if (options.refreshManipulationPhases) {
    const profile = findDisciplineProfile(
      next.disciplineId || next.matiere,
      next.titre
    );
    const situation =
      next.introduction?.accroche ||
      next.introduction?.miseEnSituation ||
      next.theme;
    const mathActive = isMathContext(next.matiere, profile.id);
    if (mathActive) {
      const cb = normalizeCbMathCode(
        next.schematisationMath?.cbCode,
        next.competenceDeBase,
        next.titre,
        next.theme
      );
      next.schematisationMath = next.schematisationMath?.actif
        ? enrichManipulationPhases(next.schematisationMath, {
            matiere: next.matiere,
            disciplineId: profile.id,
            competenceDeBase: next.competenceDeBase,
            titre: next.titre,
            theme: next.theme,
            situationProbleme: situation,
            niveau: next.niveau,
          })
        : buildFallbackMathSchematisation({
            cbCode: cb,
            competenceDeBase: next.competenceDeBase,
            titre: next.titre,
            theme: next.theme,
            situationProbleme: situation,
            niveau: next.niveau,
          });
      next.phasesManipulation = undefined;
    } else {
      next.phasesManipulation = buildUniversalManipulationSchematisation({
        matiere: next.matiere,
        disciplineId: profile.id,
        competenceDeBase: next.competenceDeBase,
        titre: next.titre,
        theme: next.theme,
        situationProbleme: situation,
        niveau: next.niveau,
        deroulement: next.deroulement,
      });
      next.schematisationMath = undefined;
    }
    changedLabels.push('Phases de manipulation, schémas, exercices & Q&R');
  }

  const normalized = normalizeFiche({
    ...next,
    updatedAt: now,
    derniereRetouche: {
      date: now,
      scope: 'inclusion_handicap',
      resume: `Adaptation en lot appliquée : ${changedLabels.join(', ') || 'Normalisation APC'}.`,
      sectionsModifiees: changedLabels,
    },
    historique: [
      {
        id: createUid('hist'),
        date: now,
        action: 'Retouche & adaptation en lot',
        resume: changedLabels.join(' · ') || 'Normalisation locale',
        snapshot,
      },
      ...(Array.isArray(fiche.historique) ? fiche.historique.slice(0, 14) : []),
    ],
  });

  return normalized;
}

