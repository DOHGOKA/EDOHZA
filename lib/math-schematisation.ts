import {
  CbMathType,
  PhaseManipulationMath,
  SchematisationMathPhases,
} from './types';
import { enrichManipulationPhases } from './manipulation-phases';

export const CB_MATH_CATALOG: Record<
  CbMathType,
  {
    code: CbMathType;
    court: string;
    libelle: string;
    materielPrivilegie: string;
    modelesSchema: string;
  }
> = {
  CB1: {
    code: 'CB1',
    court: 'Nombres & Calculs',
    libelle:
      'CB1 — Résoudre des situations-problèmes mobilisant la numération, les quatre opérations, les fractions ou les nombres décimaux.',
    materielPrivilegie:
      'Jetons, bûchettes groupées par dizaines/centaines, bandes-unités fractionnées, billets/pièces factices, abaques',
    modelesSchema:
      'Schéma en barres (partie-tout / comparaison), groupements par paquets de 10, droite numérique graduée, partage figuré',
  },
  CB2: {
    code: 'CB2',
    court: 'Géométrie & Espace',
    libelle:
      'CB2 — Résoudre des situations-problèmes de géométrie (figures planes, solides, tracés aux instruments, symétrie et repérage).',
    materielPrivilegie:
      'Gabarits cartonnés, papier pointé/quadrillé, solides manipulables, miroirs de symétrie, règle, équerre, compas',
    modelesSchema:
      'Figure géométrique codée (angles droits, égalités de longueurs, sommets nommés), patron déplié, axe de symétrie sur quadrillage',
  },
  CB3: {
    code: 'CB3',
    court: 'Grandeurs, Mesures & Proportionnalité',
    libelle:
      'CB3 — Résoudre des situations-problèmes de grandeurs et mesures (longueurs, masses, contenances, durées, monnaie, aires, périmètres, proportionnalité).',
    materielPrivilegie:
      'Bandes-étalons, règle graduée, balance à plateaux et masses marquées, récipients gradués, horloges mobiles, pièces et billets',
    modelesSchema:
      'Double bande comparative, balance d’équivalence de mesures, tableau de proportionnalité fléché, rectangle quadrillé aire/périmètre',
  },
};

export function isMathContext(matiere?: string, disciplineId?: string): boolean {
  const normalized = `${matiere || ''} ${disciplineId || ''}`.toLowerCase();
  return (
    normalized.includes('math') ||
    normalized === 'modele-mathematiques' ||
    normalized === 'tpl:modele-mathematiques'
  );
}

export function detectCbMathCode(
  competenceDeBase?: string,
  titre?: string,
  theme?: string
): CbMathType {
  const cbText = (competenceDeBase || '').toUpperCase();
  if (/\bCB\s*2\b/.test(cbText)) return 'CB2';
  if (/\bCB\s*3\b/.test(cbText)) return 'CB3';
  if (/\bCB\s*1\b/.test(cbText)) return 'CB1';

  const combined = `${competenceDeBase || ''} ${titre || ''} ${theme || ''}`.toLowerCase();

  if (
    /géométrie|geometrie|triangle|carré|carre|rectangle|cercle|polygone|solide|cube|pavé|symétrie|symetrie|angle|parallèle|parallele|perpendiculaire|quadrillage|figure|compas|équerre/.test(
      combined
    )
  ) {
    return 'CB2';
  }

  if (
    /grandeur|mesure|longueur|masse|poids|gramme|kilo|litre|contenance|durée|duree|heure|minute|monnaie|prix|euro|franc|cfa|aire|surface|périmètre|perimetre|proportionnalit|vitesse|échelle|echelle/.test(
      combined
    )
  ) {
    return 'CB3';
  }

  return 'CB1';
}

export function normalizeCbMathCode(
  value?: string,
  competenceDeBase?: string,
  titre?: string,
  theme?: string
): CbMathType {
  const upper = (value || '').trim().toUpperCase();
  if (upper === 'CB1' || upper === 'CB2' || upper === 'CB3') {
    return upper;
  }
  return detectCbMathCode(competenceDeBase, titre, theme);
}

function escapeXml(input: string): string {
  return (input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function shortSnippet(input: string, max = 38): string {
  const clean = (input || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function extractConcreteNumbers(text: string): number[] {
  const matches = (text || '').match(/\d+(?:[.,]\d+)?/g) || [];
  const nums = matches
    .map((m) => Number(m.replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 10000);
  return Array.from(new Set(nums));
}

export function buildMathSchematisationPromptRules(params: {
  cbCode: CbMathType;
  titre?: string;
  theme?: string;
  situationProbleme?: string;
  niveau?: string;
}): string {
  const info = CB_MATH_CATALOG[params.cbCode];
  return `SCHÉMATISATION IA EN 3 PHASES DE MANIPULATION (MATHÉMATIQUES — ${info.code} : ${info.court}) :
- Compétence de Base ciblée : ${info.libelle}
- Thème de la séance : « ${params.theme || 'Mathématiques APC'} »
- Titre de la leçon : « ${params.titre || 'Leçon de mathématiques'} » (${params.niveau || 'Primaire / Collège'})
- Situation-problème source : « ${params.situationProbleme || 'Situation-problème concrète issue du quotidien des élèves'} »
- Matériel recommandé pour ${info.code} : ${info.materielPrivilegie}
- Modèles de schémas privilégiés pour ${info.code} : ${info.modelesSchema}

Tu DOIS renseigner l'objet "schematisationMath" avec actif=true, cbCode="${info.code}", cbLibelle, situationProblemeReference, titreLeconReference, synthesePassageAbstraction et EXACTEMENT 3 objets dans "phases" dans cet ordre strict :
1. phase: "collective" — "1. Manipulation collective" (Grand groupe au tableau / démonstration guidée)
   - Utilise exactement les données concrètes extraites de la situation-problème, du thème et du titre de la leçon (ex. mêmes nombres, objets, unités, figures).
   - svgSchemaCode : un SVG compact (<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">...</svg>) représentant fidèlement la manipulation collective avec étiquettes concrètes en français, chiffres/mesures réels de la situation-problème, couleurs contrastées (#0F172A, #0284C7, #059669, #D97706 sur fond #F8FAFC).
2. phase: "petits_groupes" — "2. Manipulation en petits groupes" (Îlots de 3 à 4 élèves / binômes coopératifs)
   - Propose une variation concrète et réaliste (nouvelles données numériques, grandeurs ou figures adaptées au même thème et niveau) permettant la confrontation de procédures entre pairs.
   - svgSchemaCode : un SVG distinct (<svg viewBox="0 0 360 200" ...>) montrant les nouvelles données concrètes et la schématisation collaborative produite par les îlots.
3. phase: "individuelle" — "3. Manipulation individuelle" (Travail autonome sur ardoise / matériel personnel)
   - Propose une donnée concrète de transfert individuel (palier standard + palier adapté inclusif APC pour élève DYS/dyscalculique) préparant l'écriture mathématique abstraite.
   - svgSchemaCode : un SVG distinct (<svg viewBox="0 0 360 200" ...>) montrant la vérification individuelle du concret vers l'écriture mathématique abstraite.

OBLIGATION DANS CHAQUE PHASE (exercicesProgressifs & questionsReponsesPhase) :
- Pour CHACUNE des 3 phases, renseigne "exercicesProgressifs" avec 3 exercices graduels ("Palier 1 · Découverte", "Palier 2 · Entraînement", "Palier 3 · Défi"), de type 'choix' (avec 3 choix) ou 'saisie' (avec reponseAttendue exacte + unite éventuelle), comportant donneesConcretes, indice, explication et lienSituationProbleme.
- Pour CHACUNE des 3 phases, renseigne "questionsReponsesPhase" avec 2 questions-réponses directement liées au thème, au titre de la leçon et à la situation-problème (question, reponseAttendue, indice, ancrageThemeTitreSituation).`;
}

export const CM1_S9_MATH_SCHEMATISATIONS: Record<
  'fiche-10' | 'fiche-11' | 'fiche-12' | 'fiche-13' | 'fiche-14',
  SchematisationMathPhases
> = {
  'fiche-10': {
    actif: true,
    cbCode: 'CB1',
    cbLibelle:
      'CB1 + CB2 (Mathématiques CM1) — Consolidation : calcul mental (÷5, ÷50), fractions, masses (g/dag/hg/kg) et triangles rectangles à l’échelle.',
    situationProblemeReference:
      'Usine de jouets (40 jouets ÷ 5), fête d’usine (4/5 de 150 invités), gâteau (3 705 g), billes de Yao (1 800 g), haricots (3/5 de 1 800 kg), champ de soja (6 958 m²) et aire de jeu (75 m à l’échelle 1/1000).',
    titreLeconReference:
      'Consolidation : calcul mental (÷5, ÷50) et résolution graduée de problèmes',
    synthesePassageAbstraction:
      'Manipulation en barres & conversions (÷5 = ÷10 × 2 ; unités en g) → Schéma fractionnaire & triangle à l’échelle → Résolution multi-étapes structurée.',
    phases: [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Ardoise, bâtonnets & tableau',
        donneesConcretes:
          'Calcul mental usine (40 jouets ÷ 5 = 8 ; 300 cadeaux ÷ 50 = 6) + Analyser l’aire de jeu ABC (triangle rectangle en A, côté AC = 75 m à l’échelle 1 cm pour 10 m → 7,5 cm).',
        materielConcret:
          '40 bâtonnets groupés par 8, règle plate et équerre géante au tableau.',
        actionSchemaEleve:
          'Partage les 40 bâtonnets en 5 paquets égaux, formule la règle ÷5 (÷10 × 2) et trace l’esquisse codée du triangle rectangle ABC (AC = 7,5 cm).',
        etayageInclusifAPC:
          'Barre de 5 cases égales dessinée au tableau et code couleur rouge sur l’angle droit en A pour les élèves DYS/dyscalculiques.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Collectif · Partage 40 ÷ 5 &amp; Aire de jeu 75 m</text><rect x="14" y="34" width="170" height="72" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="50" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">40 jouets ÷ 5 ateliers</text><rect x="22" y="58" width="28" height="22" fill="#DBEAFE" stroke="#0284C7"/><rect x="52" y="58" width="28" height="22" fill="#DBEAFE" stroke="#0284C7"/><rect x="82" y="58" width="28" height="22" fill="#DBEAFE" stroke="#0284C7"/><rect x="112" y="58" width="28" height="22" fill="#DBEAFE" stroke="#0284C7"/><rect x="142" y="58" width="28" height="22" fill="#DBEAFE" stroke="#0284C7"/><text x="36" y="73" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text><text x="66" y="73" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text><text x="96" y="73" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text><text x="126" y="73" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text><text x="156" y="73" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text><text x="99" y="96" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">40 ÷ 10 × 2 = 8 | 300 ÷ 50 = 6</text><rect x="196" y="34" width="150" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="204" y="50" font-family="sans-serif" font-size="10" font-weight="700" fill="#D97706">Aire ABC (1 cm = 10 m)</text><polygon points="218,154 218,74 326,154" fill="#FEF3C7" stroke="#0F172A" stroke-width="1.8"/><rect x="218" y="143" width="11" height="11" fill="none" stroke="#DC2626" stroke-width="1.5"/><text x="208" y="158" font-family="sans-serif" font-size="10" font-weight="700" fill="#0F172A">A</text><text x="208" y="76" font-family="sans-serif" font-size="10" font-weight="700" fill="#0F172A">C</text><text x="331" y="158" font-family="sans-serif" font-size="10" font-weight="700" fill="#0F172A">B</text><text x="224" y="114" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#0284C7">75 m = 7,5 cm</text><text x="271" y="174" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">Angle droit en A (équerre)</text><rect x="14" y="116" width="170" height="68" rx="5" fill="#ECFDF5" stroke="#059669"/><text x="99" y="138" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#065F46">Astuce ÷5 et ÷50</text><text x="99" y="156" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#0F172A">÷5 → (N ÷ 10) × 2</text><text x="99" y="172" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#0F172A">÷50 → (N ÷ 100) × 2</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots coopératifs · Étiquettes & tableau de conversion',
        donneesConcretes:
          'Fête d’usine : 4/5 de 150 invités (= 120) · Gâteau : 50 dag + 20 hg + 75 + 850 + 80 + 200 g (= 3 705 g) · Billes de Yao : étiquettes c→e→a→b→d, (70+20) × 20 g = 1 800 g.',
        materielConcret:
          'Étiquettes cartonnées (a, b, c, d, e), tableau kg/hg/dag/g et bandes fractionnées en 5 parts.',
        actionSchemaEleve:
          'Reconstitue l’ordre logique de l’énoncé avec les étiquettes, place les masses du gâteau dans le tableau en grammes et valide 4/5 de 150 sur schéma en barres.',
        etayageInclusifAPC:
          'Manipulation directe d’étiquettes sans copie intégrale et tableau de masses coloré pour éviter les erreurs de zéro.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Îlots · Invités (4/5), Gâteau (3 705 g) &amp; Yao</text><rect x="14" y="32" width="332" height="58" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="47" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">150 invités : 4/5 présents = 4 × 30 = 120</text><rect x="22" y="54" width="60" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="82" y="54" width="60" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="142" y="54" width="60" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="202" y="54" width="60" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="262" y="54" width="60" height="22" fill="#FEF3C7" stroke="#D97706"/><text x="52" y="69" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#065F46">30</text><text x="112" y="69" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#065F46">30</text><text x="172" y="69" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#065F46">30</text><text x="232" y="69" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#065F46">30</text><text x="292" y="69" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#92400E">30</text><rect x="14" y="98" width="168" height="88" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="114" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">Gâteau → tout en g</text><text x="22" y="131" font-family="monospace" font-size="9.5" fill="#0F172A">50 dag = 500 g</text><text x="22" y="146" font-family="monospace" font-size="9.5" fill="#0F172A">20 hg  = 2 000 g</text><text x="22" y="161" font-family="monospace" font-size="9.5" fill="#0F172A">+ 75+850+80+200</text><text x="22" y="177" font-family="monospace" font-size="10.5" font-weight="700" fill="#059669">Total = 3 705 g</text><rect x="190" y="98" width="156" height="88" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="198" y="114" font-family="sans-serif" font-size="10" font-weight="700" fill="#D97706">Billes de Yao</text><text x="198" y="131" font-family="sans-serif" font-size="9.5" fill="#334155">Ordre : c → e → a → b → d</text><text x="198" y="148" font-family="monospace" font-size="10" fill="#0F172A">70 + 20 = 90 billes</text><text x="198" y="165" font-family="monospace" font-size="10" font-weight="700" fill="#B45309">90 × 20 g = 1 800 g</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Cahier, équerre & schéma en barres',
        donneesConcretes:
          'Problème (a) : 1 800 kg haricot (3/5 vendus = 1 080 kg, reste 720 kg) + triangle 5×8 cm · Problème (b) : champ 6 958 m² (1/7 = 994 m² ; aîné 3/7 = 2 982 m² ; récolte 68 586 dag) + triangle 7×8,5 cm.',
        materielConcret:
          'Cahier, règle, équerre, rapporteur et fiche de résolution en 3 boîtes.',
        actionSchemaEleve:
          'Représente les parts (3/5 puis 3/7 et 2/7) par des barres avant de calculer et trace les deux triangles rectangles aux instruments.',
        etayageInclusifAPC:
          'Découpage en 3 mini-étapes numérotées et gabarit d’angle droit personnel pour sécuriser le tracé.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Individuel · Problèmes (a) Haricot &amp; (b) Champ</text><rect x="14" y="32" width="332" height="62" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="47" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">(a) 1 800 kg haricots (1/5 = 360 kg)</text><rect x="22" y="54" width="60" height="20" fill="#DBEAFE" stroke="#0284C7"/><rect x="82" y="54" width="60" height="20" fill="#DBEAFE" stroke="#0284C7"/><rect x="142" y="54" width="60" height="20" fill="#DBEAFE" stroke="#0284C7"/><rect x="202" y="54" width="60" height="20" fill="#F1F5F9" stroke="#94A3B8"/><rect x="262" y="54" width="60" height="20" fill="#F1F5F9" stroke="#94A3B8"/><text x="112" y="88" text-anchor="middle" font-family="monospace" font-size="9.5" font-weight="700" fill="#0284C7">Vendus 3/5 = 1 080 kg</text><text x="262" y="88" text-anchor="middle" font-family="monospace" font-size="9.5" fill="#475569">Reste 720 kg</text><rect x="14" y="102" width="332" height="86" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="117" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">(b) Champ 6 958 m² (1/7 = 994 m²)</text><rect x="22" y="125" width="44" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="66" y="125" width="44" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="110" y="125" width="44" height="22" fill="#D1FAE5" stroke="#059669"/><rect x="154" y="125" width="44" height="22" fill="#FEF3C7" stroke="#D97706"/><rect x="198" y="125" width="44" height="22" fill="#FEF3C7" stroke="#D97706"/><rect x="242" y="125" width="44" height="22" fill="#E0F2FE" stroke="#0284C7"/><rect x="286" y="125" width="44" height="22" fill="#E0F2FE" stroke="#0284C7"/><text x="88" y="162" text-anchor="middle" font-family="monospace" font-size="9.5" font-weight="700" fill="#065F46">Aîné 3/7 = 2 982 m²</text><text x="242" y="162" text-anchor="middle" font-family="monospace" font-size="9.5" fill="#92400E">2e &amp; 3e : 1 988 m² ch.</text><text x="180" y="179" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">Soja aîné : 2 982 × 23 = 68 586 dag = 685 860 g</text></svg>`,
      },
    ],
  },
  'fiche-11': {
    actif: true,
    cbCode: 'CB3',
    cbLibelle:
      'CB3 (Mathématiques CM1) — Mesurer, classer et construire des angles en degrés (°) à l’aide de secteurs manipulables, de l’équerre et du rapporteur.',
    situationProblemeReference:
      'Confection de guirlandes décoratives identiques pour la fête de l’école (mesurer l’ouverture des fanions en degrés), secteur de 70°, jeu d’angle à 60° et tracés de 80° et 120°.',
    titreLeconReference: 'Mesurer les angles au rapporteur (degrés °)',
    synthesePassageAbstraction:
      'Comparaison tactile de secteurs carton face à l’équerre (90°) → Lecture graduée au rapporteur (centre + 0° → 70°) → Construction exacte en degrés (60°, 80°, 120°).',
    phases: [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Fanions, secteurs carton ABCD & équerre',
        donneesConcretes:
          'Guirlandes de fête et secteurs découpés en carton ABCD : repérage du sommet et des deux côtés ; comparaison directe à l’angle droit de l’équerre (90°) pour classer aigu (< 90°), droit (90°), obtus (> 90°) et plat (180°).',
        materielConcret:
          'Fanions de guirlande, secteurs angulaires rigides en carton ABCD et grande équerre de tableau.',
        actionSchemaEleve:
          'Superpose les secteurs en carton sur le coin de l’équerre, vérifie que la longueur des côtés ne change pas l’ouverture et classe les 4 familles d’angles.',
        etayageInclusifAPC:
          'Secteurs épais en carton contrasté manipulés à deux mains ; codage couleur : bleu (< 90°), vert (= 90°), orange (> 90°), rouge (= 180°).',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Collectif · Guirlandes &amp; Secteurs face à 90°</text><rect x="14" y="32" width="162" height="74" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="48" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">Aigu &lt; 90° (fanion)</text><polygon points="32,94 98,94 74,56" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.8"/><circle cx="32" cy="94" r="3" fill="#DC2626"/><text x="106" y="76" font-family="sans-serif" font-size="9.5" fill="#334155">Plus fermé</text><text x="106" y="90" font-family="sans-serif" font-size="9.5" fill="#334155">que l’équerre</text><rect x="184" y="32" width="162" height="74" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="192" y="48" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Droit = 90° (équerre)</text><polyline points="204,94 204,58 262,94" fill="none" stroke="#059669" stroke-width="2"/><rect x="204" y="83" width="11" height="11" fill="none" stroke="#059669" stroke-width="1.5"/><text x="272" y="82" font-family="sans-serif" font-size="9.5" fill="#065F46">Angle droit</text><rect x="14" y="114" width="162" height="72" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="22" y="130" font-family="sans-serif" font-size="10" font-weight="700" fill="#D97706">Obtus &gt; 90°</text><polyline points="62,172 138,172" stroke="#0F172A" stroke-width="2"/><line x1="62" y1="172" x2="32" y2="140" stroke="#D97706" stroke-width="2"/><path d="M 84 172 A 22 22 0 0 0 46 156" fill="none" stroke="#D97706" stroke-width="1.8"/><text x="92" y="156" font-family="sans-serif" font-size="9.5" fill="#92400E">Plus ouvert</text><rect x="184" y="114" width="162" height="72" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="192" y="130" font-family="sans-serif" font-size="10" font-weight="700" fill="#DC2626">Plat = 180°</text><line x1="202" y1="164" x2="326" y2="164" stroke="#DC2626" stroke-width="2.2"/><circle cx="264" cy="164" r="3.5" fill="#0F172A"/><path d="M 244 164 A 20 20 0 0 1 284 164" fill="none" stroke="#DC2626" stroke-width="1.5"/><text x="264" y="180" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">2 angles droits (90° + 90°)</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots coopératifs · Rapporteur & mesure exacte',
        donneesConcretes:
          'Lecture guidée d’un angle de 70° au rapporteur (centre sur le sommet O, graduation 0° sur le côté 1) et défi en îlot : tracer un angle de 60° en 5 minutes.',
        materielConcret:
          'Rapporteurs transparents (ou grand format contrasté), règles plates, fiches cartonnées.',
        actionSchemaEleve:
          'Place à deux le centre sur le sommet O, aligne 0°, lit 70° (en justifiant pourquoi ce n’est pas 110°) puis pointe M à 60° pour tracer [OM).',
        etayageInclusifAPC:
          'Check-list en 3 pictos (« 1. Centre → 2. 0° → 3. Lire depuis 0° ») ; un élève maintient le rapporteur pendant que le pair pointe 60°.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Îlots · Mesure à 70° &amp; Défi construction 60°</text><rect x="14" y="32" width="204" height="154" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><path d="M 38 158 A 82 82 0 0 1 202 158 Z" fill="#DBEAFE" fill-opacity="0.55" stroke="#0284C7" stroke-width="1.6"/><circle cx="120" cy="158" r="3.5" fill="#DC2626"/><text x="114" y="174" font-family="sans-serif" font-size="10" font-weight="700" fill="#DC2626">Sommet O</text><line x1="120" y1="158" x2="210" y2="158" stroke="#0F172A" stroke-width="2.2"/><text x="190" y="150" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#0F172A">0°</text><line x1="120" y1="158" x2="152" y2="70" stroke="#059669" stroke-width="2.4"/><path d="M 150 158 A 30 30 0 0 0 130 130" fill="none" stroke="#D97706" stroke-width="2"/><text x="158" y="128" font-family="sans-serif" font-size="11" font-weight="700" fill="#D97706">70°</text><text x="120" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748B">90°</text><rect x="226" y="32" width="120" height="154" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="234" y="50" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Défi îlot : 60°</text><line x1="244" y1="144" x2="328" y2="144" stroke="#0F172A" stroke-width="2"/><line x1="244" y1="144" x2="286" y2="72" stroke="#059669" stroke-width="2"/><circle cx="286" cy="72" r="3" fill="#059669"/><text x="292" y="76" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#059669">M (60°)</text><text x="242" y="158" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#0F172A">A</text><text x="322" y="158" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#0F172A">B</text><text x="286" y="176" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">Estimer (&lt; 90°) avant</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Cahier, règle & rapporteur',
        donneesConcretes:
          'Construction individuelle de deux angles : un angle aigu de 80° (proche de 90°) et un angle obtus de 120° (plus grand que 90°), puis contrôle à l’équerre.',
        materielConcret:
          'Rapporteur personnel, règle graduée antidérapante, crayon taillé.',
        actionSchemaEleve:
          'Trace le premier côté [AB], place le rapporteur en A, pointe 80° (puis 120° sur un deuxième tracé) et vérifie la nature aigu/obtus.',
        etayageInclusifAPC:
          'Demis-droites [AB) pré-tracées sur fiche adaptée ; tolérance de ± 2° et vérification orale de la cohérence avec 90°.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Individuel · Tracer 80° (aigu) &amp; 120° (obtus)</text><rect x="14" y="34" width="160" height="148" rx="5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/><text x="24" y="52" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0284C7">1) Angle aigu : 80°</text><line x1="42" y1="146" x2="152" y2="146" stroke="#0F172A" stroke-width="2"/><line x1="42" y1="146" x2="58" y2="62" stroke="#0284C7" stroke-width="2.2"/><line x1="42" y1="146" x2="42" y2="62" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M 74 146 A 32 32 0 0 0 48 115" fill="none" stroke="#0284C7" stroke-width="2"/><text x="76" y="114" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0284C7">80°</text><text x="94" y="170" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">Juste avant 90°</text><rect x="186" y="34" width="160" height="148" rx="5" fill="#FFFFFF" stroke="#D97706" stroke-width="1.4"/><text x="196" y="52" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#B45309">2) Angle obtus : 120°</text><line x1="254" y1="146" x2="332" y2="146" stroke="#0F172A" stroke-width="2"/><line x1="254" y1="146" x2="212" y2="74" stroke="#D97706" stroke-width="2.2"/><line x1="254" y1="146" x2="254" y2="66" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M 282 146 A 28 28 0 0 0 240 122" fill="none" stroke="#D97706" stroke-width="2"/><text x="278" y="112" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#B45309">120°</text><text x="266" y="170" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">Au-delà de 90° (&lt; 180°)</text></svg>`,
      },
    ],
  },
  'fiche-12': {
    actif: true,
    cbCode: 'CB1',
    cbLibelle:
      'CB1 (Mathématiques CM1) — Calculer une fraction d’un nombre entier par partage concret puis par la règle (N ÷ dénominateur) × numérateur.',
    situationProblemeReference:
      'Anniversaire : 2/9 de 45 chaises pour la famille ; cultivateur : 3/5 de 215 ignames vendues ; tente des 90 ans de grand-mère : 7/9 de 162 places occupées.',
    titreLeconReference: 'Calculer une fraction d’un nombre',
    synthesePassageAbstraction:
      '45 bâtonnets en 9 tas de 5 (2 tas = 10) → Schéma en barres (215 ÷ 5 = 43 ; 3 parts = 129) → Règle générale (N ÷ d) × n ou (N × n) ÷ d.',
    phases: [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · 45 bâtonnets & 9 tas égaux',
        donneesConcretes:
          'Anniversaire (p. 107) : 45 chaises au total ; les 2/9 sont réservés à la famille → partage de 45 bâtonnets en 9 tas égaux de 5 (1/9 = 5), prise de 2 tas (2/9 = 10 chaises).',
        materielConcret:
          '45 bâtonnets ou jetons + 9 coupelles numérotées 1 à 9 au bureau central.',
        actionSchemaEleve:
          'Distribue les 45 bâtonnets un à un dans 9 tas égaux, constate 5 par tas et regroupe 2 tas pour lire 10 chaises avant d’écrire (45 ÷ 9) × 2.',
        etayageInclusifAPC:
          '9 coupelles numérotées en gros caractères et coloration des 2 premières coupelles pour visualiser numérateur (2) et dénominateur (9).',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Collectif · 2/9 de 45 chaises (9 tas de 5)</text><rect x="14" y="34" width="332" height="72" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><rect x="24" y="48" width="30" height="34" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.8"/><rect x="59" y="48" width="30" height="34" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.8"/><rect x="94" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="129" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="164" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="199" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="234" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="269" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><rect x="304" y="48" width="30" height="34" rx="4" fill="#F1F5F9" stroke="#94A3B8"/><text x="39" y="69" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">5</text><text x="74" y="69" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">5</text><text x="109" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="144" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="179" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="214" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="249" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="284" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="319" y="69" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">5</text><text x="56" y="98" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#0284C7">2/9 = 10</text><text x="224" y="98" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">9 tas égaux (45 ÷ 9 = 5 par tas)</text><rect x="14" y="116" width="162" height="70" rx="5" fill="#ECFDF5" stroke="#059669"/><text x="95" y="138" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#065F46">Méthode 1 (conseillée)</text><text x="95" y="160" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0F172A">(45 ÷ 9) × 2 = 10</text><rect x="184" y="116" width="162" height="70" rx="5" fill="#FEF3C7" stroke="#D97706"/><text x="265" y="138" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#92400E">Méthode 2</text><text x="265" y="160" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0F172A">(45 × 2) ÷ 9 = 10</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots coopératifs · Schéma en barres (215 ignames)',
        donneesConcretes:
          'Cultivateur : 215 ignames récoltées, 3/5 vendues au marché → barre partagée en 5 parts égales (1/5 = 215 ÷ 5 = 43 ignames) ; 3 parts vendues = 43 × 3 = 129 ignames ; reste 2/5 = 86 ignames.',
        materielConcret:
          'Bandes papier pliées en 5 cases égales et grande ardoise par îlot.',
        actionSchemaEleve:
          'Dessine la barre de 215 divisée en 5 blocs, calcule la valeur d’un bloc (43), colorie 3 blocs et confronte avec l’îlot voisin.',
        etayageInclusifAPC:
          'Bande pré-découpée en 5 cases sur la table pour élève DYS/dyscalculique ; division posée guidée étape par étape.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Îlots · 3/5 de 215 ignames (215 ÷ 5 = 43)</text><rect x="14" y="34" width="332" height="152" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="180" y="54" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0F172A">Récolte totale : 215 ignames (5/5)</text><rect x="24" y="66" width="62" height="36" fill="#D1FAE5" stroke="#059669" stroke-width="1.6"/><rect x="86" y="66" width="62" height="36" fill="#D1FAE5" stroke="#059669" stroke-width="1.6"/><rect x="148" y="66" width="62" height="36" fill="#D1FAE5" stroke="#059669" stroke-width="1.6"/><rect x="210" y="66" width="62" height="36" fill="#FEF3C7" stroke="#D97706" stroke-width="1.4"/><rect x="272" y="66" width="62" height="36" fill="#FEF3C7" stroke="#D97706" stroke-width="1.4"/><text x="55" y="88" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#065F46">43</text><text x="117" y="88" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#065F46">43</text><text x="179" y="88" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#065F46">43</text><text x="241" y="88" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#92400E">43</text><text x="303" y="88" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#92400E">43</text><text x="117" y="122" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#059669">Vendues (3/5) = 43 × 3 = 129</text><text x="272" y="122" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#B45309">Reste (2/5) = 86</text><rect x="34" y="138" width="292" height="34" rx="4" fill="#F8FAFC" stroke="#CBD5E1"/><text x="180" y="159" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#0F172A">Contrôle : 129 + 86 = 215 ignames</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Cahier & barre de 9 parts (162 places)',
        donneesConcretes:
          'Tente des 90 ans de grand-mère : 7/9 de 162 places occupées → (162 ÷ 9) × 7 = 18 × 7 = 126 invités assis et 2/9 = 36 places libres (plus 2/3 de 348 = 232 et 3/5 de 150 = 90).',
        materielConcret:
          'Ardoise, cahier et grille fractionnée de 9 cases.',
        actionSchemaEleve:
          'Calcule la part unitaire (1/9 = 18), colorie 7 cases sur 9, multiplie par 7 (= 126) et vérifie 126 + 36 = 162.',
        etayageInclusifAPC:
          'Double entrée guidée (1. Je divise par le dénominateur → 2. Je multiplie par le numérateur) et table de 18 écrite en appui si besoin.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Individuel · Tente 162 places (7/9 occupées)</text><rect x="14" y="34" width="332" height="152" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="24" y="54" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">1/9 de 162 = 162 ÷ 9 = 18 places par bloc</text><rect x="22" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="56" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="90" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="124" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="158" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="192" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="226" y="66" width="34" height="30" fill="#DBEAFE" stroke="#0284C7"/><rect x="260" y="66" width="34" height="30" fill="#FEF3C7" stroke="#D97706"/><rect x="294" y="66" width="34" height="30" fill="#FEF3C7" stroke="#D97706"/><text x="39" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="73" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="107" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="141" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="175" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="209" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="243" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">18</text><text x="277" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#92400E">18</text><text x="311" y="85" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#92400E">18</text><text x="141" y="116" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">7/9 occupées = 18 × 7 = 126</text><text x="294" y="116" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#D97706">Libres = 36</text><text x="180" y="146" text-anchor="middle" font-family="monospace" font-size="10" fill="#334155">2/3 de 348 = 232 | 3/5 de 150 = 90</text><text x="180" y="168" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Vérification : 126 + 36 = 162 places</text></svg>`,
      },
    ],
  },
  'fiche-13': {
    actif: true,
    cbCode: 'CB3',
    cbLibelle:
      'CB3 (Mathématiques CM1) — Mesurer et convertir des masses à la balance à plateaux avec le gramme (g) et ses multiples (dag, hg, kg).',
    situationProblemeReference:
      'Anniversaire d’Adjo (3 kg fonio + 2 kg viande + 500 g tomate + 20 g sel = 5 520 g) et pâte de gari de Napo (250 g + 4 × 7 dag + 50 g = 580 g).',
    titreLeconReference:
      'Mesurer des masses : le gramme et ses multiples (dag, hg, kg)',
    synthesePassageAbstraction:
      'Pesée physique sur balance à plateaux (aiguille centrée : 1 kg = 1 000 g) → Tableau kg | hg | dag | g (achats d’Adjo = 5 520 g) → Conversions rapides et vigilance zéro intercalé.',
    phases: [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Balance à plateaux & masses marquées',
        donneesConcretes:
          'Pesée d’objets réels (cahier, boîte de craies, caillou) sur balance à plateaux jusqu’à l’équilibre (aiguille verticale centrée) : découverte des multiples 1 dag = 10 g, 1 hg = 100 g, 1 kg = 1 000 g.',
        materielConcret:
          'Balance à plateaux, boîte de masses marquées (g, dag, hg, kg), objets de classe.',
        actionSchemaEleve:
          'Place l’objet sur un plateau, ajoute les masses marquées sur l’autre jusqu’à l’alignement horizontal des deux plateaux et lit la masse totale.',
        etayageInclusifAPC:
          'Faire soupeser à la main les masses de 100 g (1 hg) et 1 kg (1 000 g) ; verbalisation précise de la position centrée de l’aiguille.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Collectif · Balance à plateaux &amp; multiples</text><rect x="14" y="34" width="194" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><polygon points="101,158 121,158 111,106" fill="#334155"/><line x1="42" y1="106" x2="180" y2="106" stroke="#0F172A" stroke-width="2.6"/><line x1="111" y1="106" x2="111" y2="74" stroke="#DC2626" stroke-width="2"/><polygon points="111,68 107,78 115,78" fill="#DC2626"/><rect x="28" y="88" width="46" height="16" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1.4"/><text x="51" y="82" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#92400E">1 kg</text><rect x="148" y="88" width="48" height="16" rx="3" fill="#D1FAE5" stroke="#059669" stroke-width="1.4"/><text x="172" y="82" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#065F46">1 000 g</text><text x="111" y="176" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">Aiguille centrée = équilibre</text><rect x="216" y="34" width="130" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="224" y="54" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">Équivalences</text><text x="224" y="80" font-family="monospace" font-size="10.5" font-weight="700" fill="#0F172A">1 dag = 10 g</text><text x="224" y="106" font-family="monospace" font-size="10.5" font-weight="700" fill="#0F172A">1 hg  = 100 g</text><text x="224" y="132" font-family="monospace" font-size="10.5" font-weight="700" fill="#059669">1 kg  = 1 000 g</text><text x="224" y="164" font-family="sans-serif" font-size="9" fill="#475569">10× plus grand à gauche</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots coopératifs · Tableau kg | hg | dag | g (Adjo)',
        donneesConcretes:
          'Anniversaire d’Adjo (p. 109) : 3 kg de fonio (= 3 000 g) + 2 kg de viande (= 2 000 g) + 500 g de tomate + 20 g de sel = 5 520 g (soit 5 kg 520 g).',
        materielConcret:
          'Tableau de conversion plastifié kg/hg/dag/g et jetons-chiffres mobiles par îlot.',
        actionSchemaEleve:
          'Place un seul chiffre par colonne dans le tableau, ajoute les zéros jusqu’à la colonne « g » et additionne colonne par colonne.',
        etayageInclusifAPC:
          'Colonnes alternées avec colonne cible « g » surlignée en bleu et jetons-chiffres effaçables pour éviter les erreurs de copie.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Îlots · Anniversaire d’Adjo dans le tableau</text><rect x="14" y="32" width="332" height="154" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><rect x="24" y="44" width="78" height="22" fill="#0F172A"/><rect x="102" y="44" width="78" height="22" fill="#0F172A"/><rect x="180" y="44" width="78" height="22" fill="#0F172A"/><rect x="258" y="44" width="78" height="22" fill="#0284C7"/><text x="63" y="59" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#FFFFFF">kg</text><text x="141" y="59" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#FFFFFF">hg</text><text x="219" y="59" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#FFFFFF">dag</text><text x="297" y="59" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#FFFFFF">g</text><rect x="24" y="66" width="312" height="20" fill="#F8FAFC" stroke="#CBD5E1"/><text x="63" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="#0F172A">3</text><text x="141" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748B">0</text><text x="219" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748B">0</text><text x="297" y="80" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">0</text><rect x="24" y="86" width="312" height="20" fill="#FFFFFF" stroke="#CBD5E1"/><text x="63" y="100" text-anchor="middle" font-family="monospace" font-size="11" fill="#0F172A">2</text><text x="141" y="100" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748B">0</text><text x="219" y="100" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748B">0</text><text x="297" y="100" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">0</text><rect x="24" y="106" width="312" height="20" fill="#F8FAFC" stroke="#CBD5E1"/><text x="141" y="120" text-anchor="middle" font-family="monospace" font-size="11" fill="#0F172A">5</text><text x="219" y="120" text-anchor="middle" font-family="monospace" font-size="11" fill="#0F172A">0</text><text x="297" y="120" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">0</text><rect x="24" y="126" width="312" height="20" fill="#FFFFFF" stroke="#CBD5E1"/><text x="219" y="140" text-anchor="middle" font-family="monospace" font-size="11" fill="#0F172A">2</text><text x="297" y="140" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">0</text><rect x="24" y="150" width="312" height="26" fill="#ECFDF5" stroke="#059669" stroke-width="1.4"/><text x="180" y="167" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#065F46">Total achats Adjo = 5 520 g (5 kg 520 g)</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Pâte de gari de Napo & conversions',
        donneesConcretes:
          'Pâte de gari de Napo : 250 g gari + 4 × 7 dag viande (= 280 g) + 50 g piment = 580 g · Cas individuel : 2 kg + 800 g + 35 g = 2 835 g · Attention au 0 intercalé : 1 kg 9 dag = 1 090 g.',
        materielConcret:
          'Ardoise, fiche tableau personnelle et feutre effaçable.',
        actionSchemaEleve:
          'Convertit d’abord les 28 dag en 280 g dans son tableau personnel, additionne 250 + 280 + 50 = 580 g puis résout 1 kg 9 dag = 1 090 g.',
        etayageInclusifAPC:
          'Décomposition visuelle en 2 boîtes (1. Viande en g ; 2. Somme) et marqueur rouge sur le « 0 » dans la colonne hg pour 1 kg 9 dag.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Individuel · Pâte de Napo (580 g) &amp; piège du 0</text><rect x="14" y="34" width="166" height="148" rx="5" fill="#FFFFFF" stroke="#059669" stroke-width="1.4"/><text x="22" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Pâte de gari (Napo)</text><text x="22" y="72" font-family="monospace" font-size="9.5" fill="#0F172A">Viande : 4 × 7 dag</text><text x="22" y="88" font-family="monospace" font-size="9.5" font-weight="700" fill="#0284C7">= 28 dag = 280 g</text><line x1="22" y1="98" x2="168" y2="98" stroke="#E2E8F0"/><text x="22" y="114" font-family="monospace" font-size="9.5" fill="#334155">250 g + 280 g + 50 g</text><rect x="22" y="128" width="146" height="36" rx="4" fill="#ECFDF5" stroke="#059669"/><text x="95" y="150" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#065F46">= 580 g</text><rect x="188" y="34" width="158" height="148" rx="5" fill="#FFFFFF" stroke="#D97706" stroke-width="1.4"/><text x="196" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="#B45309">Vigilance : zéro intercalé</text><text x="196" y="74" font-family="monospace" font-size="10" fill="#0F172A">1 kg 9 dag = ? g</text><rect x="198" y="84" width="34" height="28" fill="#F8FAFC" stroke="#CBD5E1"/><rect x="232" y="84" width="34" height="28" fill="#FEE2E2" stroke="#DC2626"/><rect x="266" y="84" width="34" height="28" fill="#F8FAFC" stroke="#CBD5E1"/><rect x="300" y="84" width="34" height="28" fill="#DBEAFE" stroke="#0284C7"/><text x="215" y="102" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0F172A">1</text><text x="249" y="102" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#DC2626">0</text><text x="283" y="102" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0F172A">9</text><text x="317" y="102" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">0</text><text x="266" y="132" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="700" fill="#DC2626">1 kg 9 dag = 1 090 g</text><text x="266" y="156" text-anchor="middle" font-family="monospace" font-size="9.5" fill="#475569">2 kg+800g+35g = 2 835 g</text></svg>`,
      },
    ],
  },
  'fiche-14': {
    actif: true,
    cbCode: 'CB2',
    cbLibelle:
      'CB2 (Mathématiques CM1) — Identifier par leurs propriétés et construire avec précision les triangles (rectangle, isocèle, équilatéral) à l’équerre et au compas.',
    situationProblemeReference:
      'Semaine artistique : éventails en forme de triangles réguliers (tri de polygones), motif de sac kenté (triangle équilatéral de 5 cm), triangle isocèle (8 cm ; 6 cm ; 6 cm) et espace de manifestation (8 m × 12 m à l’échelle 1 cm/1 m).',
    titreLeconReference:
      'Construire des polygones : le triangle (rectangle, isocèle, équilatéral)',
    synthesePassageAbstraction:
      'Tri tactile de polygones carton (3 côtés, 3 sommets) → Programmes de tracé à l’équerre et au compas (sac kenté 5 cm) → Constructions codées autonomes (8-6-6 cm et plan 8×12 cm).',
    phases: [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Éventails & lot de polygones carton',
        donneesConcretes:
          'Tri d’un lot de polygones prédécoupés en carton pour confectionner des éventails : isolement des figures à 3 côtés et classement des 3 triangles (rectangle = 1 angle droit ; isocèle = 2 côtés égaux ; équilatéral = 3 côtés égaux).',
        materielConcret:
          'Polygones prédécoupés en carton épais, modèle d’éventail plié, grande équerre et compas de tableau.',
        actionSchemaEleve:
          'Écarte les quadrilatères/pentagones, passe le doigt sur les 3 côtés, vérifie l’angle droit à l’équerre et marque les côtés égaux.',
        etayageInclusifAPC:
          'Gommettes tactiles posées sur les côtés de même longueur et coin d’équerre rouge sur l’angle droit.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Collectif · Tri des éventails (3 types de triangles)</text><rect x="14" y="34" width="106" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="67" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">Rectangle</text><polygon points="28,144 28,74 102,144" fill="#DBEAFE" stroke="#0F172A" stroke-width="1.8"/><rect x="28" y="133" width="11" height="11" fill="none" stroke="#DC2626" stroke-width="1.5"/><text x="67" y="168" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">1 angle droit (90°)</text><rect x="127" y="34" width="106" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="180" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#D97706">Isocèle</text><polygon points="142,144 218,144 180,70" fill="#FEF3C7" stroke="#0F172A" stroke-width="1.8"/><line x1="154" y1="104" x2="164" y2="110" stroke="#D97706" stroke-width="2"/><line x1="196" y1="110" x2="206" y2="104" stroke="#D97706" stroke-width="2"/><text x="180" y="168" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">2 côtés égaux</text><rect x="240" y="34" width="106" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="293" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Équilatéral</text><polygon points="254,144 332,144 293,76" fill="#D1FAE5" stroke="#0F172A" stroke-width="1.8"/><line x1="266" y1="108" x2="276" y2="114" stroke="#059669" stroke-width="2"/><line x1="310" y1="114" x2="320" y2="108" stroke="#059669" stroke-width="2"/><line x1="293" y1="138" x2="293" y2="150" stroke="#059669" stroke-width="2"/><text x="293" y="168" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#475569">3 côtés égaux</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots coopératifs · Compas (sac kenté 5 cm) & équerre',
        donneesConcretes:
          'Décoration du sac en tissu kenté : construire au compas et à la règle un triangle équilatéral ABC de 5 cm de côté (deux arcs de rayon 5 cm centrés en A et B se coupent en C).',
        materielConcret:
          'Règle graduée, compas à molette bloquante, feuilles papier kraft.',
        actionSchemaEleve:
          'Trace [AB] = 5 cm, règle l’ouverture du compas à 5 cm, trace deux arcs depuis A et B, marque le point C et code les 3 côtés égaux.',
        etayageInclusifAPC:
          'Compas à molette bloquante ; montrer comment faire tourner la feuille sous la pointe sèche pour les élèves dyspraxiques.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Îlots · Motif sac kenté (Équilatéral 5 cm)</text><rect x="14" y="34" width="194" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><path d="M 88 64 A 96 96 0 0 1 134 64" fill="none" stroke="#059669" stroke-width="1.5" stroke-dasharray="4 3"/><path d="M 102 52 A 96 96 0 0 1 120 74" fill="none" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4 3"/><polygon points="56,154 166,154 111,58" fill="#D1FAE5" fill-opacity="0.65" stroke="#0F172A" stroke-width="2"/><circle cx="111" cy="58" r="3" fill="#DC2626"/><text x="44" y="158" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0F172A">A</text><text x="172" y="158" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0F172A">B</text><text x="111" y="50" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#DC2626">C</text><text x="111" y="172" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#059669">AB = AC = BC = 5 cm</text><rect x="216" y="34" width="130" height="150" rx="5" fill="#FFFFFF" stroke="#CBD5E1"/><text x="224" y="54" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669">Étapes au compas</text><text x="224" y="78" font-family="sans-serif" font-size="9.5" fill="#334155">1. Tracer [AB] = 5 cm</text><text x="224" y="102" font-family="sans-serif" font-size="9.5" fill="#334155">2. Ouvrir à 5 cm</text><text x="224" y="126" font-family="sans-serif" font-size="9.5" fill="#334155">3. Arc depuis A &amp; B</text><text x="224" y="150" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#DC2626">4. Relier A-C et B-C</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Isocèle (8-6-6) & Plan (8 m × 12 m)',
        donneesConcretes:
          'Tracé individuel d’un triangle isocèle ABC (base AB = 8 cm, AC = BC = 6 cm au compas), puis plan d’un espace de manifestation rectangle en A (8 m × 12 m → 8 cm × 12 cm à l’échelle 1 cm/1 m).',
        materielConcret:
          'Règle, compas, équerre et papier quadrillé centimétré.',
        actionSchemaEleve:
          'Trace AB = 8 cm, reporte 6 cm au compas depuis A et B ; puis trace à l’équerre deux côtés de 8 cm et 12 cm et relie l’hypoténuse.',
        etayageInclusifAPC:
          'Segment de base [AB] déjà amorcé sur feuille quadrillée centimétrée pour faciliter le repérage spatial.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="20" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">Individuel · Isocèle (8-6-6) &amp; Espace 8×12 m</text><rect x="14" y="34" width="162" height="150" rx="5" fill="#FFFFFF" stroke="#D97706" stroke-width="1.4"/><text x="95" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#B45309">Isocèle (6 ; 6 ; 8 cm)</text><path d="M 76 80 A 70 70 0 0 1 114 80" fill="none" stroke="#D97706" stroke-width="1.4" stroke-dasharray="3 3"/><polygon points="38,150 152,150 95,74" fill="#FEF3C7" fill-opacity="0.7" stroke="#0F172A" stroke-width="1.8"/><text x="54" y="112" font-family="monospace" font-size="9.5" font-weight="700" fill="#B45309">6 cm</text><text x="116" y="112" font-family="monospace" font-size="9.5" font-weight="700" fill="#B45309">6 cm</text><text x="95" y="168" text-anchor="middle" font-family="monospace" font-size="9.5" font-weight="700" fill="#0F172A">AB = 8 cm</text><rect x="184" y="34" width="162" height="150" rx="5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/><text x="265" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#0284C7">Plan (1 cm = 1 m)</text><polygon points="208,150 208,74 328,150" fill="#DBEAFE" fill-opacity="0.7" stroke="#0F172A" stroke-width="1.8"/><rect x="208" y="139" width="11" height="11" fill="none" stroke="#DC2626" stroke-width="1.5"/><text x="214" y="112" font-family="monospace" font-size="9.5" font-weight="700" fill="#0284C7">8 cm</text><text x="268" y="168" text-anchor="middle" font-family="monospace" font-size="9.5" font-weight="700" fill="#0F172A">12 cm (12 m)</text></svg>`,
      },
    ],
  },
};

export function buildFallbackMathSchematisation(params: {
  cbCode?: CbMathType;
  competenceDeBase?: string;
  titre: string;
  theme?: string;
  situationProbleme?: string;
  niveau?: string;
}): SchematisationMathPhases {
  const combinedLookup = `${params.titre || ''} ${params.situationProbleme || ''} ${params.competenceDeBase || ''}`.toLowerCase();
  const enrichCtx = {
    matiere: 'Mathématiques',
    competenceDeBase: params.competenceDeBase,
    titre: params.titre,
    theme: params.theme,
    situationProbleme: params.situationProbleme,
    niveau: params.niveau,
  };
  if (/angle|rapporteur|degr[eé]|guirlande|fanion/.test(combinedLookup)) {
    const base = CM1_S9_MATH_SCHEMATISATIONS['fiche-11'];
    return enrichManipulationPhases(
      {
        ...base,
        titreLeconReference: params.titre || base.titreLeconReference,
        situationProblemeReference:
          params.situationProbleme?.trim() || base.situationProblemeReference,
        phases: base.phases.map((p) => ({ ...p })),
      },
      enrichCtx
    );
  }
  if (/fraction d['’]un nombre|chaises|ignames|bâtonnets.*tas|162 places/.test(combinedLookup)) {
    const base = CM1_S9_MATH_SCHEMATISATIONS['fiche-12'];
    return enrichManipulationPhases(
      {
        ...base,
        titreLeconReference: params.titre || base.titreLeconReference,
        situationProblemeReference:
          params.situationProbleme?.trim() || base.situationProblemeReference,
        phases: base.phases.map((p) => ({ ...p })),
      },
      enrichCtx
    );
  }
  if (/masse|gramme|dag|hg|kg|balance|fonio|gari|adjo|napo/.test(combinedLookup)) {
    const base = CM1_S9_MATH_SCHEMATISATIONS['fiche-13'];
    return enrichManipulationPhases(
      {
        ...base,
        titreLeconReference: params.titre || base.titreLeconReference,
        situationProblemeReference:
          params.situationProbleme?.trim() || base.situationProblemeReference,
        phases: base.phases.map((p) => ({ ...p })),
      },
      enrichCtx
    );
  }
  if (/triangle|polygone|kenté|kente|éventail|équilatéral|isocèle/.test(combinedLookup)) {
    const base = CM1_S9_MATH_SCHEMATISATIONS['fiche-14'];
    return enrichManipulationPhases(
      {
        ...base,
        titreLeconReference: params.titre || base.titreLeconReference,
        situationProblemeReference:
          params.situationProbleme?.trim() || base.situationProblemeReference,
        phases: base.phases.map((p) => ({ ...p })),
      },
      enrichCtx
    );
  }
  if (/consolidation|÷\s*5|÷\s*50|jouets|billes|haricot|soja|6\s*958/.test(combinedLookup)) {
    const base = CM1_S9_MATH_SCHEMATISATIONS['fiche-10'];
    return enrichManipulationPhases(
      {
        ...base,
        titreLeconReference: params.titre || base.titreLeconReference,
        situationProblemeReference:
          params.situationProbleme?.trim() || base.situationProblemeReference,
        phases: base.phases.map((p) => ({ ...p })),
      },
      enrichCtx
    );
  }

  const cbCode = normalizeCbMathCode(
    params.cbCode,
    params.competenceDeBase,
    params.titre,
    params.theme
  );
  const info = CB_MATH_CATALOG[cbCode];
  const situation =
    params.situationProbleme?.trim() ||
    `Situation-problème contextualisée autour de « ${params.titre} »`;

  const nums = extractConcreteNumbers(`${params.titre} ${situation}`);

  if (cbCode === 'CB2') {
    const L = nums[0] && nums[0] <= 20 ? nums[0] : 6;
    const l = nums[1] && nums[1] <= 15 ? nums[1] : 4;
    const L2 = L + 2;
    const l2 = Math.max(2, l - 1);
    const L3 = L + 1;

    const phases: PhaseManipulationMath[] = [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Tableau & gabarits géants',
        donneesConcretes: `Figure modèle issue de « ${shortSnippet(params.titre, 34)} » : côtés ${L} u et ${l} u, repérage des sommets A, B, C, D et des angles droits.`,
        materielConcret: 'Gabarits grand format au tableau, règle plate, équerre géante aimantée.',
        actionSchemaEleve:
          'Observe le gabarit manipulé collectivement, nomme les sommets et place les symboles d’angle droit et d’égalité de côtés.',
        etayageInclusifAPC:
          'Code couleur contrasté par propriété (bleu = côtés égaux, rouge = angle droit) pour soutenir le repérage visuo-spatial.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Collectif · Figure codée (${L} u × ${l} u)</text><rect x="85" y="48" width="190" height="104" fill="#E0F2FE" stroke="#0284C7" stroke-width="2.5"/><rect x="85" y="48" width="14" height="14" fill="none" stroke="#DC2626" stroke-width="2"/><rect x="261" y="48" width="14" height="14" fill="none" stroke="#DC2626" stroke-width="2"/><text x="76" y="44" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">A</text><text x="278" y="44" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">B</text><text x="278" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">C</text><text x="76" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">D</text><text x="180" y="42" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#0284C7">${L} unités</text><text x="58" y="104" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#059669">${l} u</text><text x="180" y="184" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Observation collective : angles droits &amp; côtés opposés</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots de 3 à 4 élèves · Papier pointé & bandes',
        donneesConcretes: `Défi d’îlot : construire et comparer deux tracés (${L2} u × ${l2} u et figure symétrique ou décomposée) sur quadrillage.`,
        materielConcret: 'Papier quadrillé A3, bandes articulées, équerres et crayons de couleur.',
        actionSchemaEleve:
          'Construit la figure avec les bandes articulées en groupe, trace le schéma sur quadrillage puis vérifie les propriétés à l’équerre.',
        etayageInclusifAPC:
          'Binôme tuteur pour le maintien des instruments ; papier quadrillé agrandi (carreaux 1 cm) pour élèves dyspraxiques.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Petits groupes · Comparaison (${L2} u × ${l2} u)</text><g stroke="#E2E8F0" stroke-width="1"><line x1="40" y1="45" x2="320" y2="45"/><line x1="40" y1="75" x2="320" y2="75"/><line x1="40" y1="105" x2="320" y2="105"/><line x1="40" y1="135" x2="320" y2="135"/><line x1="40" y1="165" x2="320" y2="165"/><line x1="180" y1="36" x2="180" y2="174"/></g><line x1="180" y1="36" x2="180" y2="174" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 3"/><polygon points="60,150 155,150 155,65" fill="#D1FAE5" stroke="#059669" stroke-width="2"/><polygon points="300,150 205,150 205,65" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="115" y="168" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#065F46">Îlot A (${L2}u)</text><text x="245" y="168" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#B45309">Îlot B (sym.)</text><text x="180" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Confrontation sur quadrillage &amp; vérification par pliage</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail autonome · Ardoise quadrillée & fiche',
        donneesConcretes: `Reproduction autonome d’une figure de côté ${L3} u avec codage complet et phrase de justification.`,
        materielConcret: 'Ardoise quadrillée individuelle, règle graduée, gabarit d’angle droit.',
        actionSchemaEleve:
          'Trace seul la figure demandée, code les angles et les côtés égaux, puis rédige ou dicte la propriété géométrique.',
        etayageInclusifAPC:
          'Points d’ancrage déjà placés sur la fiche adaptée et modèle d’angle droit cartonné personnel.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Individuel · Tracé guidé (${L3} u) &amp; codage</text><rect x="52" y="50" width="110" height="100" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><circle cx="52" cy="50" r="3.5" fill="#0284C7"/><circle cx="162" cy="50" r="3.5" fill="#0284C7"/><circle cx="162" cy="150" r="3.5" fill="#0284C7"/><circle cx="52" cy="150" r="3.5" fill="#0284C7"/><line x1="104" y1="45" x2="110" y2="55" stroke="#0284C7" stroke-width="2"/><line x1="104" y1="145" x2="110" y2="155" stroke="#0284C7" stroke-width="2"/><rect x="192" y="54" width="144" height="92" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/><text x="264" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">Check-list élève</text><text x="206" y="106" font-family="sans-serif" font-size="10.5" fill="#334155">1. Sommets reliés (${L3} u)</text><text x="206" y="124" font-family="sans-serif" font-size="10.5" fill="#334155">2. Gabarit angle vérifié</text><text x="206" y="140" font-family="sans-serif" font-size="10.5" fill="#059669">3. Codage reporté</text></svg>`,
      },
    ];

    return enrichManipulationPhases(
      {
        actif: true,
        cbCode,
        cbLibelle: params.competenceDeBase?.trim() || info.libelle,
        situationProblemeReference: situation,
        titreLeconReference: params.titre,
        phases,
        synthesePassageAbstraction: `Manipulation de gabarits (${L}×${l}) → Schéma codé sur quadrillage → Formulation des propriétés géométriques exactes.`,
      },
      enrichCtx
    );
  }

  if (cbCode === 'CB3') {
    const q1 = nums[0] && nums[0] <= 200 ? nums[0] : 4;
    const u2 = nums[1] && nums[1] <= 500 ? nums[1] : 12;
    const coef = 3;
    const totalGroup = q1 * coef;
    const indivVal = Math.max(2, q1 + 2);

    const phases: PhaseManipulationMath[] = [
      {
        phase: 'collective',
        titrePhase: '1. Manipulation collective',
        modalite: 'Grand groupe · Étalon & tableau de mesure',
        donneesConcretes: `Données de la situation-problème : grandeur de départ = ${q1} unités pour 1 lot, référence totale = ${u2} unités (« ${shortSnippet(params.titre, 28)} »).`,
        materielConcret: 'Étalons collectifs (bandes, masses ou récipients), tableau gradué affiché.',
        actionSchemaEleve:
          'Compare et reporte l’étalon de mesure au tableau, vérifie l’unité et schématise la correspondance sur une double bande.',
        etayageInclusifAPC:
          'Unités affichées en couleur dédiée et manipulation verbale avant toute conversion chiffrée.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Collectif · Étalon &amp; mesure (${q1} u / ${u2} u)</text><rect x="28" y="54" width="120" height="32" rx="4" fill="#0284C7"/><text x="88" y="74" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#FFFFFF">1 lot = ${q1} u</text><rect x="28" y="106" width="280" height="32" rx="4" fill="#059669"/><text x="168" y="126" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#FFFFFF">Situation cible : ${u2} unités</text><line x1="28" y1="154" x2="308" y2="154" stroke="#0F172A" stroke-width="2"/><text x="168" y="176" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Report collectif de l’étalon et lecture directe de l’unité</text></svg>`,
      },
      {
        phase: 'petits_groupes',
        titrePhase: '2. Manipulation en petits groupes',
        modalite: 'Îlots de 3 à 4 élèves · Instruments & tableau',
        donneesConcretes: `Mesure concrète en îlot : passage de ${q1} u à ${totalGroup} u (×${coef} lots) et vérification par report successif.`,
        materielConcret: 'Bandes-mesures, balances/règles par îlot, fiche tableau à compléter.',
        actionSchemaEleve:
          'Mesure concrètement ${coef} lots identiques, complète le schéma de proportionnalité ou de conversion et confronte le résultat avec l’îlot voisin.',
        etayageInclusifAPC:
          'Tableau pré-tracé à colonnes contrastées et rappel visuel des équivalences d’unités sur la table.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Petits groupes · Mise à l’échelle (×${coef})</text><rect x="28" y="52" width="90" height="34" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.5"/><text x="73" y="73" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#0F172A">${q1} u</text><rect x="128" y="52" width="90" height="34" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.5"/><text x="173" y="73" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#0F172A">${q1} u</text><rect x="228" y="52" width="90" height="34" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.5"/><text x="273" y="73" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#0F172A">${q1} u</text><path d="M 173 94 L 173 116" stroke="#059669" stroke-width="2.5"/><polygon points="173,122 167,112 179,112" fill="#059669"/><rect x="68" y="126" width="210" height="36" rx="6" fill="#ECFDF5" stroke="#059669" stroke-width="2"/><text x="173" y="148" text-anchor="middle" font-family="monospace" font-size="12.5" font-weight="700" fill="#065F46">${coef} × ${q1} u = ${totalGroup} u</text><text x="180" y="184" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Vérification expérimentale en îlot</text></svg>`,
      },
      {
        phase: 'individuelle',
        titrePhase: '3. Manipulation individuelle',
        modalite: 'Travail personnel · Réglette graduée & ardoise',
        donneesConcretes: `Cas individuel : trouver l’équivalence ou le total pour ${indivVal} unités de base (palier 1 : ×2 = ${indivVal * 2} ; palier 2 : ×5 = ${indivVal * 5}).`,
        materielConcret: 'Réglette graduée personnelle, bande-mémo d’unités, ardoise.',
        actionSchemaEleve:
          'Représente seul sa mesure sur bande graduée, inscrit l’opération avec l’unité explicite et contrôle la vraisemblance.',
        etayageInclusifAPC:
          'Choix entre 2 paliers numériques ; fiche-repère de conversion autorisée pour élève dyscalculique.',
        svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Individuel · Passage à la mesure abstraite</text><rect x="26" y="52" width="144" height="82" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/><text x="98" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">Palier Fondamental</text><text x="98" y="102" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#0F172A">${indivVal} u × 2 = ${indivVal * 2} u</text><text x="98" y="122" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Avec réglette graduée</text><rect x="190" y="52" width="144" height="82" rx="6" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/><text x="262" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#B45309">Palier Défi</text><text x="262" y="102" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#0F172A">${indivVal} u × 5 = ${indivVal * 5} u</text><text x="262" y="122" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Calcul &amp; unité écrite</text><text x="180" y="170" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#059669" font-weight="700">Concret (étalon) → Schéma → Calcul + Unité</text></svg>`,
      },
    ];

    return enrichManipulationPhases(
      {
        actif: true,
        cbCode,
        cbLibelle: params.competenceDeBase?.trim() || info.libelle,
        situationProblemeReference: situation,
        titreLeconReference: params.titre,
        phases,
        synthesePassageAbstraction: `Report de l’étalon concret (${q1} u) → Schéma comparatif gradué → Calcul exact accompagné de son unité.`,
      },
      enrichCtx
    );
  }

  // CB1: Nombres & Calculs (default)
  const a = nums[0] && nums[0] <= 500 ? nums[0] : 12;
  const b = nums[1] && nums[1] <= 500 ? nums[1] : 8;
  const sumAB = a + b;
  const gA = a + 4;
  const gB = b + 2;
  const iA = Math.max(3, Math.round(a / 2));
  const iB = Math.max(2, Math.round(b / 2));

  const phases: PhaseManipulationMath[] = [
    {
      phase: 'collective',
      titrePhase: '1. Manipulation collective',
      modalite: 'Grand groupe · Tableau & matériel collectif',
      donneesConcretes: `Données issues de la situation-problème (« ${shortSnippet(params.titre, 30)} ») : quantité A = ${a}, quantité B = ${b}, total = ${sumAB}.`,
      materielConcret: 'Jetons magnétiques, bûchettes groupées par 10 ou bandes-unités au tableau.',
      actionSchemaEleve:
        'Verbalise les quantités en jeu, observe la mise en correspondance des jetons et valide collectivement le schéma en barres au tableau.',
      etayageInclusifAPC:
        'Lecture oralisée de l’énoncé ; code couleur fixe entre la donnée A (bleu) et la donnée B (vert) pour lever les blocages DYS.',
      svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Collectif · Schéma en barres (${a} et ${b})</text><rect x="30" y="54" width="165" height="40" rx="4" fill="#0284C7"/><text x="112" y="79" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#FFFFFF">Donnée A : ${a}</text><rect x="200" y="54" width="130" height="40" rx="4" fill="#059669"/><text x="265" y="79" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#FFFFFF">Donnée B : ${b}</text><line x1="30" y1="112" x2="330" y2="112" stroke="#0F172A" stroke-width="2"/><rect x="105" y="122" width="150" height="34" rx="5" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><text x="180" y="144" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#0F172A">Tout = ${a} + ${b} = ${sumAB}</text><text x="180" y="182" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Manipulation guidée au tableau : parties → tout</text></svg>`,
    },
    {
      phase: 'petits_groupes',
      titrePhase: '2. Manipulation en petits groupes',
      modalite: 'Îlots de 3 à 4 élèves · Matériel de table & confront.',
      donneesConcretes: `Variante d’îlot : regrouper/comparer ${gA} éléments et ${gB} éléments (résultat attendu : ${gA + gB}) sur plateau partagé.`,
      materielConcret: 'Boîtes de jetons/réglettes Cuisenaire ou bandes papier par îlot, grande ardoise A3.',
      actionSchemaEleve:
        'Manipule les réglettes en équipe, trace le schéma sur l’ardoise d’îlot et confronte deux procédures avant la mise en commun.',
      etayageInclusifAPC:
        'Rôles tournants (manipulateur, dessinateur, rapporteur) et bande numérique plastifiée accessible sur la table.',
      svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Petits groupes · Recherche (${gA} et ${gB})</text><rect x="26" y="52" width="144" height="86" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/><text x="98" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">Îlot 1 · Manipulation</text><circle cx="62" cy="100" r="10" fill="#0284C7"/><circle cx="90" cy="100" r="10" fill="#0284C7"/><circle cx="118" cy="100" r="10" fill="#059669"/><text x="98" y="126" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0F172A">${gA} + ${gB}</text><rect x="190" y="52" width="144" height="86" rx="6" fill="#FFFFFF" stroke="#059669" stroke-width="1.5"/><text x="262" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#059669">Îlot 2 · Schéma</text><rect x="210" y="90" width="54" height="22" rx="3" fill="#0284C7"/><rect x="268" y="90" width="46" height="22" rx="3" fill="#059669"/><text x="262" y="128" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#065F46">= ${gA + gB}</text><text x="180" y="176" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Confrontation concret ↔ schématisation entre pairs</text></svg>`,
    },
    {
      phase: 'individuelle',
      titrePhase: '3. Manipulation individuelle',
      modalite: 'Travail personnel · Ardoise & matériel individuel',
      donneesConcretes: `Transfert personnel : résoudre avec ${iA} et ${iB} (total ${iA + iB}) puis écrire l’égalité mathématique.`,
      materielConcret: 'Ardoise effaçable, 10 à 20 jetons personnels ou bande graduée individuelle.',
      actionSchemaEleve:
        'Construit seul son schéma de résolution, compte ou vérifie avec ses jetons puis écrit l’expression mathématique.',
      etayageInclusifAPC:
        'Bande numérique individuelle autorisée ; validation orale ou par schéma acceptée pour élève dyscalculique.',
      svgSchemaCode: `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="16" y="24" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Individuel · Du schéma à l’écriture (${iA}, ${iB})</text><rect x="26" y="54" width="96" height="72" rx="6" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/><text x="74" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0284C7">1. Concret</text><text x="74" y="104" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0F172A">${iA} ; ${iB}</text><path d="M 126 90 L 142 90" stroke="#475569" stroke-width="2"/><polygon points="144,90 138,86 138,94" fill="#475569"/><rect x="146" y="54" width="92" height="72" rx="6" fill="#ECFDF5" stroke="#059669" stroke-width="1.5"/><text x="192" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#059669">2. Schéma</text><rect x="160" y="92" width="32" height="16" rx="2" fill="#0284C7"/><rect x="194" y="92" width="28" height="16" rx="2" fill="#059669"/><path d="M 242 90 L 258 90" stroke="#475569" stroke-width="2"/><polygon points="260,90 254,86 254,94" fill="#475569"/><rect x="262" y="54" width="76" height="72" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><text x="300" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#B45309">3. Abstrait</text><text x="300" y="104" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="#0F172A">${iA}+${iB}=${iA + iB}</text><text x="180" y="168" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Appropriation autonome et institutionnalisation</text></svg>`,
    },
  ];

  return enrichManipulationPhases(
    {
      actif: true,
      cbCode,
      cbLibelle: params.competenceDeBase?.trim() || info.libelle,
      situationProblemeReference: situation,
      titreLeconReference: params.titre,
      phases,
      synthesePassageAbstraction: `Manipulation de jetons/barres (${a} et ${b}) → Schématisation comparative en îlot → Écriture mathématique abstraite autonome.`,
    },
    enrichCtx
  );
}

export function escapeSvgText(text: string): string {
  return escapeXml(text);
}
