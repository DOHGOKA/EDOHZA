import { FicheAPC, HandicapProfileId, HandicapProfileSpec } from './types';

export const DEFAULT_HANDICAP_PROFILES: HandicapProfileId[] = [
  'visuel',
  'auditif',
  'moteur',
  'dys_tdah',
  'tsa_cognitif',
];

export const HANDICAP_PROFILES: HandicapProfileSpec[] = [
  {
    id: 'visuel',
    nom: 'Déficience visuelle (malvoyance / cécité)',
    court: 'Visuel',
    description:
      'Agrandi corps 16+, contraste fort, verbalisation des figures/tableaux et matériel tactile en relief.',
    amenagementsMateriel:
      'Supports agrandis (A3, corps 16–20 sans empattement, contraste fort), gabarits cartonnés et graduations tactiles en relief.',
    amenagementsMaitre:
      'Décrit à voix haute tout geste, figure ou mot écrit au tableau ; évite les formulations purement déictiques (« ici », « là »).',
    amenagementsEleve:
      'Explore par le toucher (bâtonnets, figures épaisses, réglettes en relief) ; utilise un cache-ligne contrasté ou la dictée orale.',
    indicateursInclusifsCles:
      'Description auditive systématique et validation tactile/orale sans pénalisation liée à la fatigue visuelle.',
  },
  {
    id: 'auditif',
    nom: 'Déficience auditive (malentendance / surdité)',
    court: 'Auditif',
    description:
      'Lecture labiale face à la classe, double codage visuel permanent et reformulation écrite des échanges.',
    amenagementsMateriel:
      'Fiches consignes visuelles illustrées, pictogrammes d’actions, tableau récapitulatif des Q/R clés visible en continu.',
    amenagementsMaitre:
      'Parle face aux élèves sans tourner le dos en écrivant ; montre visuellement chaque mot-clé ou geste Borel-Maisonny / signe d’appui.',
    amenagementsEleve:
      'S’appuie sur l’affichage permanent, les démonstrations gestuelles et répond à l’ardoise ou par étiquettes visuelles.',
    indicateursInclusifsCles:
      'Double canal visuel + écrit garanti à chaque consigne ; répétition et validation des prises de parole des pairs face à l’élève.',
  },
  {
    id: 'moteur',
    nom: 'Handicap moteur & dyspraxie',
    court: 'Moteur / Praxique',
    description:
      'Outils ergonomiques stabilisés, allégement du geste graphique, étiquettes ou binôme tuteur pour les instruments.',
    amenagementsMateriel:
      'Tapis antidérapant, règle à poignée, compas à molette bloquante, ciseaux à ressort, cahier pré-ligné aéré et étiquettes autocollantes.',
    amenagementsMaitre:
      'Dispense de recopie longue des consignes ; fournit figures ou tableaux pré-tracés et laisse un temps majoré d’un tiers.',
    amenagementsEleve:
      'Manipule en binôme coopératif (l’élève dirige le raisonnement, le pair stabilise l’instrument) ou utilise la réponse orale / texte à trous.',
    indicateursInclusifsCles:
      'Évaluation centrée sur le raisonnement disciplinaire plutôt que sur la perfection motrice ou la vitesse de copie.',
  },
  {
    id: 'dys_tdah',
    nom: 'Troubles DYS & TDAH (dyslexie, dyscalculie, attention)',
    court: 'DYS / TDAH',
    description:
      'Découpage séquentiel court, code couleur grammatical/numérique, police aérée et supports mémo visuels.',
    amenagementsMateriel:
      'Textes interligne 1,5, syllabes colorées / lettres muettes grisées, cache-ligne, bande numérique et tableau de conversion plastifié.',
    amenagementsMaitre:
      'Donne une seule micro-consigne à la fois, limite la surcharge du tableau et ménage de courtes pauses actives de recentrage.',
    amenagementsEleve:
      'Surligne les mots-clés, procède par paquets courts (2–3 items) avec feedback immédiat et consulte son sous-main repère.',
    indicateursInclusifsCles:
      'Réduction du coût de décodage et auto-vérification guidée par étapes courtes sans mise en échec.',
  },
  {
    id: 'tsa_cognitif',
    nom: 'TSA & déficience intellectuelle',
    court: 'TSA / Cognitif',
    description:
      'Séquence prévisible matérialisée, consignes explicites sans implicite, repères sensoriels apaisants et réussites graduées.',
    amenagementsMateriel:
      'Planning visuel des étapes posé sur la table, cartes-étapes imagées, matériel manipulable concret, casque anti-bruit si besoin.',
    amenagementsMaitre:
      'Utilise un langage littéral, clair et bienveillant ; annonce chaque transition d’étape à l’avance et valorise chaque micro-réussite.',
    amenagementsEleve:
      'Coche les étapes accomplies sur sa bande de travail, utilise un modèle résolu pas-à-pas et participe à son rythme.',
    indicateursInclusifsCles:
      'Cadre rassurant et prévisible, guidage explicite par modélisation concrète et validation par palier accessible.',
  },
];

export function normalizeHandicapProfiles(
  input?: unknown
): HandicapProfileId[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [...DEFAULT_HANDICAP_PROFILES];
  }
  const validIds = new Set<HandicapProfileId>(DEFAULT_HANDICAP_PROFILES);
  const filtered = input.filter((id): id is HandicapProfileId =>
    typeof id === 'string' && validIds.has(id as HandicapProfileId)
  );
  return filtered.length > 0 ? Array.from(new Set(filtered)) : [...DEFAULT_HANDICAP_PROFILES];
}

export function getHandicapSpecs(ids?: HandicapProfileId[]): HandicapProfileSpec[] {
  const activeIds = normalizeHandicapProfiles(ids);
  return HANDICAP_PROFILES.filter((p) => activeIds.includes(p.id));
}

export function formatHandicapSummary(ids?: HandicapProfileId[]): string {
  return getHandicapSpecs(ids)
    .map((p) => p.court)
    .join(' · ');
}

export function buildInclusionHandicapDirectives(
  selectedIds?: HandicapProfileId[],
  hauteGamme = true
): string {
  const specs = getHandicapSpecs(selectedIds);
  const lines = specs
    .map(
      (s) =>
        `  • ${s.nom} :
    - Matériel : ${s.amenagementsMateriel}
    - Geste du maître : ${s.amenagementsMaitre}
    - Rôle de l’élève : ${s.amenagementsEleve}
    - Critère IP : ${s.indicateursInclusifsCles}`
    )
    .join('\n');

  return `EXIGENCE D'INCLUSION DES ENFANTS EN SITUATION DE HANDICAP (${hauteGamme ? 'QUALITÉ HAUTE GAMME — NIVEAU INSPECTEUR APC' : 'APC INCLUSIVE'}) :
Profils ciblés activement : ${specs.map((s) => s.nom).join(' | ')}.
Directives concrètes par profil :
${lines}

RÈGLES OBLIGATOIRES D'ÉDITION INCLUSIVE :
1. Intègre concrètement les aménagements de ces profils dans "materiel" (sans surcharger : 1 à 2 lignes claires de matériel adapté), dans "activitesMaitre" (gestes explicites de présentation face classe, description orale des figures, micro-consignes), dans "activitesEleves" (modalités accessibles : manipulation concrète, binôme, ardoise/oral/étiquettes) et surtout dans "indicateursInclusifs" de CHAQUE étape (en conservant intacts les indicateurs pédagogiques d’origine + les adaptations handicap précises).
2. Ne dénature jamais le fond disciplinaire ni les sous-titres invariables de la matière : enrichis chaque étape avec une précision haute gamme immédiatement praticable en classe ordinaire et APC.
3. Assure que les "questionsReponses" comportent un "indicePedagogique" utilisable pour étayer un élève en situation de handicap (reformulation, manipulation ou repère visuel/tactile).`;
}

export function applyLocalHandicapInclusion(
  fiche: FicheAPC,
  selectedIds: HandicapProfileId[]
): FicheAPC {
  const active = normalizeHandicapProfiles(selectedIds);
  const specs = getHandicapSpecs(active);
  const tagMarker = '[Inclusion handicap]';

  const nextSteps = fiche.deroulement.map((step, idx) => {
    const cleanBase = (step.indicateursInclusifs || '')
      .replace(/\n*\[Inclusion handicap\][\s\S]*$/i, '')
      .trim();
    const spec = specs[idx % specs.length];
    const secondarySpec = specs[(idx + 1) % specs.length];
    const inclusionLine =
      spec.id === secondarySpec.id
        ? `${tagMarker} ${spec.court} : ${spec.indicateursInclusifsCles}`
        : `${tagMarker} ${spec.court} : ${spec.indicateursInclusifsCles} | ${secondarySpec.court} : ${secondarySpec.amenagementsEleve}`;

    return {
      ...step,
      indicateursInclusifs: cleanBase
        ? `${cleanBase}\n${inclusionLine}`
        : inclusionLine,
    };
  });

  const baseMateriel = fiche.materiel.filter(
    (m) => !m.startsWith('Adaptation handicap :')
  );
  const adaptationLines = specs.map(
    (s) => `Adaptation handicap (${s.court}) : ${s.amenagementsMateriel}`
  );

  return {
    ...fiche,
    handicapsInclus: active,
    materiel: [...baseMateriel, ...adaptationLines],
    deroulement: nextSteps,
    updatedAt: new Date().toISOString(),
  };
}
