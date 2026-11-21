import {
  CbMathType,
  EtapePedagogique,
  ExerciceProgressifPhase,
  FicheAPC,
  PhaseManipulationMath,
  QuestionReponsePhase,
  SchematisationMathPhases,
} from './types';
import { sanitizeSvg } from './svg-sanitize';

export interface ManipulationContext {
  matiere?: string;
  disciplineId?: string;
  competenceDeBase?: string;
  titre?: string;
  theme?: string;
  situationProbleme?: string;
  niveau?: string;
  deroulement?: EtapePedagogique[];
}

function escapeXml(input: string): string {
  return (input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function clipText(input: string, max = 42): string {
  const clean = (input || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function extractNumbers(text: string): number[] {
  const normalized = (text || '').replace(/(\d)\s+(?=\d{3}\b)/g, '$1');
  const matches = normalized.match(/\d+(?:[.,]\d+)?/g) || [];
  const nums = matches
    .map((m) => Number(m.replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 100000);
  return Array.from(new Set(nums));
}

function makeAnchor(theme?: string, titre?: string, situation?: string): string {
  const t = clipText(theme || 'Thème de la séance', 38);
  const ti = clipText(titre || 'Leçon APC', 42);
  const s = clipText(situation || 'Situation-problème de départ', 55);
  return `Thème : ${t} · Titre : ${ti} · Situation : ${s}`;
}

function normalizeAnswerString(val: string): string {
  return (val || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[°]/g, 'deg')
    .trim();
}

export function evaluateExerciceResponse(
  ex: ExerciceProgressifPhase,
  rawUserAnswer: string
): boolean {
  const userNorm = normalizeAnswerString(rawUserAnswer);
  if (!userNorm) return false;

  const expectedNorm = normalizeAnswerString(ex.reponseAttendue);
  if (userNorm === expectedNorm) return true;

  if (ex.unite) {
    const expectedWithoutUnit = normalizeAnswerString(
      `${ex.reponseAttendue}`.replace(new RegExp(ex.unite, 'gi'), '')
    );
    const userWithoutUnit = normalizeAnswerString(
      rawUserAnswer.replace(new RegExp(ex.unite, 'gi'), '')
    );
    if (expectedWithoutUnit && userWithoutUnit === expectedWithoutUnit) {
      return true;
    }
  }

  // Numeric equivalence check (e.g. "7,5" === "7.5 cm" or "1800" === "1 800 g")
  const userNumMatch = rawUserAnswer
    .replace(/(\d)\s+(?=\d{3}\b)/g, '$1')
    .match(/-?\d+(?:[.,]\d+)?/);
  const expNumMatch = ex.reponseAttendue
    .replace(/(\d)\s+(?=\d{3}\b)/g, '$1')
    .match(/-?\d+(?:[.,]\d+)?/);

  if (
    ex.type === 'saisie' &&
    userNumMatch &&
    expNumMatch &&
    Math.abs(
      Number(userNumMatch[0].replace(',', '.')) -
        Number(expNumMatch[0].replace(',', '.'))
    ) < 1e-4 &&
    userNorm.replace(/[0-9.]/g, '').length <= 6
  ) {
    return true;
  }

  return false;
}

type PresetTopicKey =
  | 'consolidation_cm1'
  | 'angles_cm1'
  | 'fraction_nombre_cm1'
  | 'masses_cm1'
  | 'triangles_cm1'
  | 'fractions_equiv';

function detectPresetTopic(ctx: ManipulationContext): PresetTopicKey | null {
  const text = `${ctx.titre || ''} ${ctx.theme || ''} ${ctx.situationProbleme || ''} ${ctx.competenceDeBase || ''}`.toLowerCase();
  if (/angle|rapporteur|degr[eé]|guirlande|fanion/.test(text)) return 'angles_cm1';
  if (/fraction d['’]un nombre|chaises|ignames|162 places|45 chaises/.test(text)) {
    return 'fraction_nombre_cm1';
  }
  if (/masse|gramme|dag|hg|kg|balance|fonio|gari|adjo|napo/.test(text)) {
    return 'masses_cm1';
  }
  if (/triangle|polygone|kent[eé]|éventail|équilatéral|isocèle/.test(text)) {
    return 'triangles_cm1';
  }
  if (/consolidation|÷\s*5|÷\s*50|jouets|billes|haricot|soja|6\s*958/.test(text)) {
    return 'consolidation_cm1';
  }
  if (/fraction.*équivalent|1\/2\s*=\s*2\/4/.test(text)) {
    return 'fractions_equiv';
  }
  return null;
}

function buildPresetExercisesAndQr(
  topic: PresetTopicKey,
  phaseKey: PhaseManipulationMath['phase'],
  anchor: string,
  donneesConcretes: string
): {
  exercicesProgressifs: ExerciceProgressifPhase[];
  questionsReponsesPhase: QuestionReponsePhase[];
} {
  const pid = `${topic}-${phaseKey}`;

  if (topic === 'consolidation_cm1') {
    if (phaseKey === 'collective') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'choix',
            consigne:
              'À l’usine, on distribue 40 jouets entre 5 ateliers. Combien de jouets reçoit chaque atelier ?',
            donneesConcretes: '40 jouets répartis équitablement en 5 paquets (40 ÷ 5).',
            choix: ['6 jouets', '8 jouets', '10 jouets'],
            reponseAttendue: '8 jouets',
            indice: 'Utilise la règle : (40 ÷ 10) × 2.',
            explication: '40 ÷ 10 = 4, puis 4 × 2 = 8 jouets par atelier.',
            lienSituationProbleme: 'Partage concret des jouets de l’usine (calcul mental ÷5).',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne:
              'On répartit 300 cadeaux par lots de 50 pour la fête de l’usine. Combien de lots obtient-on ?',
            donneesConcretes: '300 cadeaux ÷ 50 cadeaux par lot.',
            reponseAttendue: '6',
            unite: 'lots',
            indice: 'Pour diviser par 50, divise 300 par 100 puis multiplie par 2.',
            explication: '300 ÷ 100 = 3, puis 3 × 2 = 6 lots de 50 cadeaux.',
            lienSituationProbleme: 'Préparation des lots de cadeaux à l’usine (÷50).',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'saisie',
            consigne:
              'Sur le plan de l’aire de jeu triangulaire (échelle 1 cm pour 10 m), quelle longueur en cm représente le côté AC de 75 m ?',
            donneesConcretes: 'Côté réel AC = 75 m ; échelle 1 cm ↔ 10 m.',
            reponseAttendue: '7,5',
            unite: 'cm',
            indice: 'Divise 75 m par 10 m pour obtenir la mesure en centimètres.',
            explication: '75 ÷ 10 = 7,5 cm sur le cahier avec l’angle droit en A.',
            lienSituationProbleme: 'Tracé à l’échelle 1/1000 de l’aire de jeu ABC.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Dans le thème « Les métiers et les usines », quelle astuce mentale permet de partager vite 40 jouets ou 300 cadeaux ?',
            reponseAttendue:
              'Pour diviser par 5, on divise par 10 puis on multiplie par 2 ; pour diviser par 50, on divise par 100 puis on multiplie par 2.',
            indice: 'Observe combien de fois 5 tient dans 10 (2 fois).',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Où dois-tu placer l’équerre pour représenter l’aire de jeu ABC dont l’angle droit est en A ?',
            reponseAttendue:
              'On pose le coin de l’angle droit de l’équerre exactement sur le sommet A après avoir tracé [AC] = 7,5 cm.',
            indice: 'Repère la lettre du sommet indiquée dans « triangle rectangle en A ».',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    if (phaseKey === 'petits_groupes') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'saisie',
            consigne:
              'Sur les 150 invités à la fête de l’usine, combien représente 1/5 des invités ?',
            donneesConcretes: 'Total = 150 invités répartis en 5 cases égales.',
            reponseAttendue: '30',
            unite: 'invités',
            indice: 'Calcule 150 ÷ 5.',
            explication: '150 ÷ 5 = 30 invités par cinquième (une case de la barre).',
            lienSituationProbleme: 'Schéma en barres de la fête d’usine.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'choix',
            consigne:
              'Pour le gâteau d’usine (50 dag lait + 20 hg crème + 75 g + 850 g + 80 g + 200 g), quelle est la masse totale en grammes ?',
            donneesConcretes: '50 dag = 500 g ; 20 hg = 2 000 g ; autres = 1 205 g.',
            choix: ['2 705 g', '3 705 g', '3 205 g'],
            reponseAttendue: '3 705 g',
            indice: 'Convertis d’abord 50 dag (= 500 g) et 20 hg (= 2 000 g) avant d’additionner.',
            explication: '500 + 2 000 + 75 + 850 + 80 + 200 = 3 705 g.',
            lienSituationProbleme: 'Ingrédients du gâteau convertis dans le tableau kg/hg/dag/g.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'saisie',
            consigne:
              'Yao part avec 70 billes, en gagne 20 et chaque bille pèse 20 g. Quelle masse totale de billes rapporte-t-il (en g) ?',
            donneesConcretes: 'Ordre des étiquettes c→e→a→b→d : (70 + 20) billes × 20 g.',
            reponseAttendue: '1800',
            unite: 'g',
            indice: 'Additionne d’abord les billes (70 + 20 = 90), puis multiplie 90 × 20 g.',
            explication: '90 × 20 g = 1 800 g (soit 1 kg 800 g).',
            lienSituationProbleme: 'Remise en ordre de l’énoncé des billes de Yao.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Dans la situation du gâteau, pourquoi ne doit-on jamais additionner directement 50 dag et 850 g ?',
            reponseAttendue:
              'Parce qu’ils ne sont pas dans la même unité : il faut tout convertir en grammes (50 dag = 500 g et 20 hg = 2 000 g) avant de calculer.',
            indice: 'Vérifie la colonne de chaque chiffre dans le tableau de masses.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Si 4/5 des 150 invités sont présents (= 120), combien reste-t-il d’absents ?',
            reponseAttendue: 'Il manque 1/5, soit 30 invités absents (150 − 120 = 30).',
            indice: 'Regarde la dernière case non coloriée de la barre des 5 parts.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'saisie',
          consigne:
            'Maman récolte 1 800 kg de haricots et vend les 3/5. Quelle masse représente d’abord 1/5 (en kg) ?',
          donneesConcretes: '1 800 kg partagés en 5 parts égales.',
          reponseAttendue: '360',
          unite: 'kg',
          indice: 'Calcule 1 800 ÷ 5 avec la règle ÷10 × 2.',
          explication: '1 800 ÷ 10 = 180, puis 180 × 2 = 360 kg pour 1/5.',
          lienSituationProbleme: 'Problème (a) : récolte de haricots.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'choix',
          consigne:
            'Combien de kilogrammes de haricots ont été vendus (3/5 de 1 800 kg) et combien reste-t-il ?',
          donneesConcretes: '1/5 = 360 kg ; part vendue = 3 parts ; reste = 2 parts.',
          choix: [
            '1 080 kg vendus · reste 720 kg',
            '720 kg vendus · reste 1 080 kg',
            '900 kg vendus · reste 900 kg',
          ],
          reponseAttendue: '1 080 kg vendus · reste 720 kg',
          indice: 'Multiplie 360 kg par 3 pour la part vendue.',
          explication: '360 × 3 = 1 080 kg vendus ; 1 800 − 1 080 = 720 kg restants.',
          lienSituationProbleme: 'Partage proportionnel de la récolte (3/5 et 2/5).',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne:
            'Le champ de 6 958 m² est partagé en 7 parts : l’aîné reçoit 3/7. Quelle surface (en m²) obtient l’aîné ?',
          donneesConcretes: '1/7 = 6 958 ÷ 7 = 994 m² ; part de l’aîné = 3 × 994 m².',
          reponseAttendue: '2982',
          unite: 'm²',
          indice: 'Calcule 994 × 3.',
          explication: '994 × 3 = 2 982 m² (soit une récolte de soja de 2 982 × 23 = 68 586 dag).',
          lienSituationProbleme: 'Problème (b) : champ agricole de soja.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question:
            'Comment vérifier rapidement que le partage du champ (2 982 m², 1 988 m², 1 988 m²) est exact ?',
          reponseAttendue:
            'En additionnant les trois parts : 2 982 + 1 988 + 1 988 = 6 958 m², on retrouve exactement l’aire totale du champ.',
          indice: 'Fais la somme des trois aires calculées.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question:
            'Dans le problème (a), combien vaut la somme des deux angles aigus du triangle rectangle de 5 cm et 8 cm ?',
          reponseAttendue: 'Elle vaut toujours 90° (environ 58° + 32° = 90°).',
          indice: 'Dans un triangle rectangle, les deux autres angles complètent l’angle droit à 180°.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  if (topic === 'angles_cm1') {
    if (phaseKey === 'collective') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'choix',
            consigne:
              'Un fanion de guirlande a une ouverture plus petite que le coin de l’équerre (90°). Comment appelle-t-on cet angle ?',
            donneesConcretes: 'Comparaison directe secteur carton face à 90°.',
            choix: ['Angle aigu (< 90°)', 'Angle droit (= 90°)', 'Angle obtus (> 90°)'],
            reponseAttendue: 'Angle aigu (< 90°)',
            indice: 'Il est plus fermé que l’angle droit de l’équerre.',
            explication: 'Tout angle compris entre 0° et 90° (exclu) est un angle aigu.',
            lienSituationProbleme: 'Classement des fanions de guirlande de la fête.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne:
              'Un angle plat est formé de deux angles droits côte à côte. Combien de degrés mesure-t-il ?',
            donneesConcretes: '2 angles droits = 90° + 90°.',
            reponseAttendue: '180',
            unite: '°',
            indice: 'Additionne deux fois 90°.',
            explication: '90° + 90° = 180° : ses deux côtés forment une ligne droite.',
            lienSituationProbleme: 'Classification des 4 secteurs carton ABCD.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'choix',
            consigne:
              'Si l’on prolonge les deux côtés d’un secteur de fanion avec une règle, que devient l’ouverture de l’angle ?',
            donneesConcretes: 'Secteurs ABCD superposés de côtés courts ou longs.',
            choix: [
              'Elle reste exactement identique',
              'Elle double en degrés',
              'Elle devient toujours obtuse',
            ],
            reponseAttendue: 'Elle reste exactement identique',
            indice: 'L’angle mesure l’écartement entre les côtés, pas leur longueur.',
            explication: 'La longueur des demi-droites ne modifie jamais la mesure en degrés.',
            lienSituationProbleme: 'Conception de guirlandes identiques de différentes tailles.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Pour décorer l’école avec des guirlandes identiques, quelles deux parties forment chaque angle du fanion ?',
            reponseAttendue: 'Un sommet et deux côtés (deux demi-droites de même origine).',
            indice: 'Passe le doigt sur la pointe du secteur carton puis sur ses deux bords.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Quel instrument permet de mesurer précisément l’ouverture d’un fanion entre 0° et 180° ?',
            reponseAttendue: 'Le rapporteur gradué en degrés (°).',
            indice: 'Son unité porte un petit rond en haut à droite du nombre (°).',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    if (phaseKey === 'petits_groupes') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'choix',
            consigne:
              'Sur le schéma du rapporteur (angle plus fermé que 90°), le côté 2 passe devant 70° et 110°. Quelle mesure lis-tu ?',
            donneesConcretes: 'Centre sur O, 0° sur côté 1, angle aigu.',
            choix: ['70°', '110°', '90°'],
            reponseAttendue: '70°',
            indice: 'L’angle est aigu : il mesure donc moins de 90°.',
            explication: 'En comptant depuis le 0° posé sur le côté 1, l’angle aigu vaut 70°.',
            lienSituationProbleme: 'Lecture guidée du secteur de 70° en îlot.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'choix',
            consigne:
              'Quel est l’ordre correct des 3 gestes pour mesurer un angle au rapporteur ?',
            donneesConcretes: 'Sommet O, côté 1, échelle 0°.',
            choix: [
              '1. Centre sur sommet → 2. 0° sur côté 1 → 3. Lire depuis ce 0°',
              '1. 90° sur sommet → 2. Mesurer les bords → 3. Additionner',
              '1. Poser au milieu → 2. Lire toujours la grande graduation',
            ],
            reponseAttendue:
              '1. Centre sur sommet → 2. 0° sur côté 1 → 3. Lire depuis ce 0°',
            indice: 'On commence toujours par caler le centre du rapporteur sur le sommet.',
            explication: 'Sans aligner le centre sur O et le 0° sur le côté 1, la lecture est fausse.',
            lienSituationProbleme: 'Méthode de mesure au rapporteur en îlot.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'saisie',
            consigne:
              'Pour le jeu de la fête, votre îlot doit tracer un angle de 60°. Combien de degrés lui manque-t-il pour atteindre un angle droit (90°) ?',
            donneesConcretes: 'Angle tracé = 60° ; angle droit = 90°.',
            reponseAttendue: '30',
            unite: '°',
            indice: 'Calcule la différence 90° − 60°.',
            explication: '90° − 60° = 30° : l’angle de 60° est bien aigu.',
            lienSituationProbleme: 'Défi de construction à 60° en petits groupes.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Pourquoi le rapporteur possède-t-il deux rangées de graduations (de 0° à 180° dans les deux sens) ?',
            reponseAttendue:
              'Pour pouvoir mesurer un angle que son premier côté soit orienté vers la droite ou vers la gauche, en partant toujours de 0°.',
            indice: 'Vérifie de quel côté est posé ton premier segment [OA).',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Si deux îlots obtiennent 60° et 120° pour le même fanion aigu du jeu, lequel s’est trompé d’échelle ?',
            reponseAttendue:
              'Celui qui a lu 120°, car un angle aigu est obligatoirement inférieur à 90°.',
            indice: 'Estime toujours à l’œil face à 90° avant de valider la lecture.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne:
            'Tu viens de tracer un angle de 80° sur ton cahier. Quelle est sa nature ?',
          donneesConcretes: 'Mesure = 80° (comparé à 90°).',
          choix: ['Angle aigu', 'Angle droit', 'Angle obtus'],
          reponseAttendue: 'Angle aigu',
          indice: 'Compare 80° à 90°.',
          explication: '80° < 90° : c’est un angle aigu, juste un peu plus fermé que l’équerre.',
          lienSituationProbleme: 'Tracé individuel de l’angle de 80°.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'choix',
          consigne:
            'Pour construire un angle de 120°, de quel côté de 90° dois-tu placer ton repère en partant du 0° ?',
          donneesConcretes: '120° est compris entre 90° et 180°.',
          choix: [
            'Après 90°, en allant vers 180°',
            'Avant 90°, entre 0° et 60°',
            'Exactement sur la marque 90°',
          ],
          reponseAttendue: 'Après 90°, en allant vers 180°',
          indice: 'Un angle de 120° est obtus (> 90°).',
          explication: '120° dépasse l’angle droit de 30°, vers le 180°.',
          lienSituationProbleme: 'Construction autonome d’un angle obtus de 120°.',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne:
            'Tu as tracé un angle de 80° puis un autre de 120° côte à côte. Combien mesurent-ils ensemble (en °) ?',
          donneesConcretes: '80° + 120°.',
          reponseAttendue: '200',
          unite: '°',
          indice: 'Additionne 80 + 120.',
          explication: '80° + 120° = 200° (20° de plus qu’un angle plat de 180°).',
          lienSituationProbleme: 'Contrôle des deux constructions individuelles.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question:
            'Comment peux-tu vérifier sans calcul que ton angle tracé de 120° est plausible ?',
          reponseAttendue:
            'En posant le coin de l’équerre sur le sommet : le deuxième côté doit s’ouvrir au-delà de l’angle droit (90°).',
          indice: 'Compare ton tracé avec l’équerre.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: 'Quelle différence sépare un angle de 89° et un angle de 90° ?',
          reponseAttendue:
            '89° est un angle aigu (< 90°) alors que 90° est exactement un angle droit.',
          indice: 'Un degré de moins suffit à le rendre aigu.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  if (topic === 'fraction_nombre_cm1') {
    if (phaseKey === 'collective') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'saisie',
            consigne:
              'On partage 45 bâtonnets en 9 tas égaux pour représenter 1/9 des 45 chaises. Combien y a-t-il dans 1 tas ?',
            donneesConcretes: '45 chaises ÷ 9 tas égaux.',
            reponseAttendue: '5',
            unite: 'chaises',
            indice: 'Cherche dans la table de 9 : 9 × ? = 45.',
            explication: '45 ÷ 9 = 5 chaises par tas (1/9 = 5).',
            lienSituationProbleme: 'Anniversaire : partage des 45 chaises sous la tente.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne:
              'Les 2/9 des 45 chaises sont réservés à la famille. Combien de chaises cela fait-il ?',
            donneesConcretes: '2 tas de 5 bâtonnets chacun.',
            reponseAttendue: '10',
            unite: 'chaises',
            indice: 'Multiplie la valeur d’un tas (5) par le numérateur (2).',
            explication: '(45 ÷ 9) × 2 = 5 × 2 = 10 chaises réservées à la famille.',
            lienSituationProbleme: 'Calcul de 2/9 de 45 chaises.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'choix',
            consigne:
              'Combien de chaises restent disponibles pour les camarades (7/9 de 45) ?',
            donneesConcretes: 'Total = 45 chaises ; famille = 10 chaises.',
            choix: ['35 chaises', '25 chaises', '40 chaises'],
            reponseAttendue: '35 chaises',
            indice: 'Calcule 45 − 10 ou bien 7 × 5.',
            explication: '7 tas × 5 = 35 chaises (et 10 + 35 = 45 chaises).',
            lienSituationProbleme: 'Vérification complète de l’anniversaire.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Dans la fraction 2/9 des 45 chaises, que représentent respectivement le 9 et le 2 lors de la manipulation ?',
            reponseAttendue:
              'Le dénominateur 9 indique en combien de tas égaux on partage les 45 bâtonnets ; le numérateur 2 indique combien de tas on prend.',
            indice: 'Observe les 9 coupelles et les 2 coupelles coloriées.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question: 'Quelles sont les deux écritures possibles pour calculer 2/9 de 45 ?',
            reponseAttendue: '(45 ÷ 9) × 2 = 10 ou bien (45 × 2) ÷ 9 = 10.',
            indice: 'On divise d’abord par le dénominateur (plus simple) ou on multiplie d’abord par le numérateur.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    if (phaseKey === 'petits_groupes') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'saisie',
            consigne:
              'Un cultivateur récolte 215 ignames et partage sa barre en 5 parts égales. Combien vaut 1/5 de 215 ?',
            donneesConcretes: '215 ignames ÷ 5 parts.',
            reponseAttendue: '43',
            unite: 'ignames',
            indice: 'Calcule 215 ÷ 5 (200 ÷ 5 = 40 et 15 ÷ 5 = 3).',
            explication: '215 ÷ 5 = 43 ignames dans chaque bloc de la barre.',
            lienSituationProbleme: 'Récolte des 215 ignames du cultivateur.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne:
              'Il vend les 3/5 de ses 215 ignames au marché. Combien d’ignames a-t-il vendues ?',
            donneesConcretes: '3 parts de 43 ignames.',
            reponseAttendue: '129',
            unite: 'ignames',
            indice: 'Multiplie 43 par 3.',
            explication: '43 × 3 = 129 ignames vendues.',
            lienSituationProbleme: 'Part vendue (3/5) sur le schéma en barres.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'choix',
            consigne: 'Combien d’ignames restent invendues (2/5 de 215) ?',
            donneesConcretes: '215 ignames au total ; 129 vendues.',
            choix: ['86 ignames', '96 ignames', '76 ignames'],
            reponseAttendue: '86 ignames',
            indice: 'Calcule 43 × 2 ou 215 − 129.',
            explication: '43 × 2 = 86 ignames (vérification : 129 + 86 = 215).',
            lienSituationProbleme: 'Contrôle final du problème des ignames.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Pourquoi la méthode « diviser d’abord par le dénominateur » est-elle plus pratique pour 3/5 de 215 ?',
            reponseAttendue:
              'Parce que 215 ÷ 5 = 43 est plus petit et facile à multiplier ensuite par 3 (= 129) que 215 × 3 = 645.',
            indice: 'Compare la taille des nombres dans (215 ÷ 5) × 3 et (215 × 3) ÷ 5.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question: 'Sur la barre de 5 parts égales, quelle fraction correspond aux 86 ignames restantes ?',
            reponseAttendue: 'Les 2/5 de la récolte (5/5 − 3/5 = 2/5).',
            indice: 'Compte les cases jaunes non vendues sur le schéma.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'saisie',
          consigne:
            'Pour les 90 ans de grand-mère, la tente a 162 places (9 parts). Combien de places vaut 1/9 ?',
          donneesConcretes: '162 places ÷ 9.',
          reponseAttendue: '18',
          unite: 'places',
          indice: 'Calcule 162 ÷ 9 (9 × 10 = 90 ; reste 72 ; 9 × 8 = 72).',
          explication: '162 ÷ 9 = 18 places par bloc.',
          lienSituationProbleme: 'Tente des 90 ans de grand-mère.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne:
            'Les 7/9 des 162 places sont occupées. Combien d’invités sont assis sous la tente ?',
          donneesConcretes: '7 parts de 18 places.',
          reponseAttendue: '126',
          unite: 'places',
          indice: 'Calcule 18 × 7.',
          explication: '18 × 7 = 126 invités assis ; il reste 36 places libres (2 × 18).',
          lienSituationProbleme: 'Calcul individuel 7/9 de 162.',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne:
            'Calcule de façon autonome les 2/3 de 348.',
          donneesConcretes: '(348 ÷ 3) × 2.',
          reponseAttendue: '232',
          indice: 'Trouve d’abord 348 ÷ 3 = 116, puis multiplie par 2.',
          explication: '348 ÷ 3 = 116 ; 116 × 2 = 232.',
          lienSituationProbleme: 'Transfert autonome de la règle générale.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question:
            'Sous la tente de 162 places, comment vérifier que 126 places occupées et 36 places libres forment bien le total ?',
          reponseAttendue: 'On additionne : 126 + 36 = 162 places au total.',
          indice: '7/9 + 2/9 = 9/9 = tout le groupe.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: 'Quelle règle générale écris-tu dans ta trace écrite pour calculer a/b de N ?',
          reponseAttendue: 'On divise N par le dénominateur b, puis on multiplie le résultat par le numérateur a.',
          indice: 'Diviser par le bas, multiplier par le haut.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  if (topic === 'masses_cm1') {
    if (phaseKey === 'collective') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'choix',
            consigne:
              'Sur la balance à plateaux, comment sait-on que la masse posée équilibre exactement l’objet ?',
            donneesConcretes: 'Balance à plateaux et aiguille centrale.',
            choix: [
              'Les deux plateaux sont horizontaux et l’aiguille est centrée',
              'Le plateau de gauche touche la table',
              'L’aiguille penche vers les masses marquées',
            ],
            reponseAttendue:
              'Les deux plateaux sont horizontaux et l’aiguille est centrée',
            indice: 'Observe la position verticale du repère rouge au milieu.',
            explication: 'L’équilibre correspond toujours à l’aiguille verticale centrée.',
            lienSituationProbleme: 'Pesée collective d’objets de la classe.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne: 'Combien de grammes vaut une masse marquée de 1 hg ?',
            donneesConcretes: '1 dag = 10 g ; 1 hg = 10 dag.',
            reponseAttendue: '100',
            unite: 'g',
            indice: 'Hectogramme signifie « cent grammes ».',
            explication: '1 hg = 100 g (et 1 kg = 10 hg = 1 000 g).',
            lienSituationProbleme: 'Découverte des multiples du gramme (dag, hg, kg).',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'saisie',
            consigne: 'Combien de grammes équilibrent une masse de 1 kg ?',
            donneesConcretes: 'Plateau gauche = 1 kg ; plateau droit = ? g.',
            reponseAttendue: '1000',
            unite: 'g',
            indice: '1 kg = 10 hg = 100 dag.',
            explication: '1 kg = 1 000 g.',
            lienSituationProbleme: 'Équivalence fondamentale sur la balance.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'De combien en combien multiplie-t-on quand on passe du kg vers hg, puis dag, puis g ?',
            reponseAttendue: 'De 10 en 10 à chaque colonne vers la droite.',
            indice: '1 kg = 10 hg ; 1 hg = 10 dag ; 1 dag = 10 g.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Pourquoi le gramme seul ne suffit-il pas pour peser un sac de fonio de 3 kg ?',
            reponseAttendue:
              'Parce qu’il faudrait 3 000 petites masses de 1 g : on utilise le kilogramme (kg) pour les objets lourds.',
            indice: 'Compare la taille d’un trombone (1 g) et celle d’un sac de 3 kg.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    if (phaseKey === 'petits_groupes') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'saisie',
            consigne:
              'Pour l’anniversaire d’Adjo, on achète 3 kg de fonio. Combien cela fait-il en grammes ?',
            donneesConcretes: '3 dans la colonne kg du tableau kg | hg | dag | g.',
            reponseAttendue: '3000',
            unite: 'g',
            indice: 'Ajoute des zéros jusqu’à la colonne g.',
            explication: '3 kg = 3 000 g.',
            lienSituationProbleme: 'Courses de l’anniversaire d’Adjo.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'saisie',
            consigne:
              'Additionne toutes les courses d’Adjo : 3 kg fonio + 2 kg viande + 500 g tomate + 20 g sel (en g).',
            donneesConcretes: '3 000 g + 2 000 g + 500 g + 20 g.',
            reponseAttendue: '5520',
            unite: 'g',
            indice: '3 000 + 2 000 = 5 000 ; ajoute 500 puis 20.',
            explication: '5 000 + 500 + 20 = 5 520 g (soit 5 kg 520 g).',
            lienSituationProbleme: 'Masse totale des achats d’Adjo dans le tableau.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'choix',
            consigne:
              'Quelle autre écriture correspond exactement à 5 520 g ?',
            donneesConcretes: '5 dans kg, 5 dans hg, 2 dans dag, 0 dans g.',
            choix: ['5 kg 520 g', '55 kg 20 g', '5 kg 52 g'],
            reponseAttendue: '5 kg 520 g',
            indice: 'Lis le chiffre des milliers (kg) puis les trois derniers chiffres (g).',
            explication: '5 520 g = 5 000 g + 520 g = 5 kg 520 g.',
            lienSituationProbleme: 'Lecture double des unités dans le tableau d’îlot.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Quelle règle d’or respecte-t-on dans le tableau kg | hg | dag | g ?',
            reponseAttendue:
              'On écrit un seul chiffre par colonne et on complète avec des zéros jusqu’à l’unité demandée.',
            indice: 'Jamais deux chiffres dans la même case !',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question:
              'Dans les achats d’Adjo, quelle est la masse de sel (20 g) exprimée en décagrammes (dag) ?',
            reponseAttendue: '20 g = 2 dag.',
            indice: '1 dag = 10 g.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'saisie',
          consigne:
            'Napo prépare une pâte de gari avec 4 morceaux de viande de 7 dag chacun. Combien font 28 dag en grammes ?',
          donneesConcretes: '4 × 7 dag = 28 dag.',
          reponseAttendue: '280',
          unite: 'g',
          indice: 'Ajoute un zéro à 28 dag pour atteindre la colonne g.',
          explication: '28 dag = 280 g.',
          lienSituationProbleme: 'Pâte de gari de Napo.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne:
            'Calcule la masse totale de la pâte de Napo : 250 g gari + 280 g viande + 50 g piment (en g).',
          donneesConcretes: '250 + 280 + 50 g.',
          reponseAttendue: '580',
          unite: 'g',
          indice: '250 + 50 = 300, puis ajoute 280.',
          explication: '250 + 50 + 280 = 580 g.',
          lienSituationProbleme: 'Addition finale de la recette de Napo.',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne:
            'Attention au zéro intercalé ! Convertis 1 kg 9 dag en grammes.',
          donneesConcretes: 'kg=1 | hg=0 | dag=9 | g=0.',
          reponseAttendue: '1090',
          unite: 'g',
          indice: 'La colonne hg est vide : n’oublie pas d’y écrire un 0 !',
          explication: '1 kg = 1 000 g et 9 dag = 90 g, donc 1 000 + 90 = 1 090 g.',
          lienSituationProbleme: 'Piège du zéro intercalé dans le tableau individuel.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question: 'Pourquoi faut-il mettre un 0 dans la colonne hg pour convertir 1 kg 9 dag en g ?',
          reponseAttendue:
            'Parce qu’il y a 0 hectogramme : sans ce zéro intercalé, on lirait 190 g au lieu de 1 090 g.',
          indice: '1 kg vaut déjà 1 000 g !',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: 'Combien valent 2 kg + 800 g + 35 g en grammes ?',
          reponseAttendue: '2 000 + 800 + 35 = 2 835 g.',
          indice: 'Convertis d’abord 2 kg en 2 000 g.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  if (topic === 'triangles_cm1') {
    if (phaseKey === 'collective') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'choix',
            consigne:
              'Un éventail triangulaire possède exactement un angle droit vérifié à l’équerre. De quel triangle s’agit-il ?',
            donneesConcretes: 'Tri du lot de polygones en carton.',
            choix: ['Triangle rectangle', 'Triangle équilatéral', 'Triangle quelconque'],
            reponseAttendue: 'Triangle rectangle',
            indice: 'Son nom rappelle le coin du rectangle (angle droit).',
            explication: 'Un triangle ayant un angle droit (90°) est un triangle rectangle.',
            lienSituationProbleme: 'Tri des éventails de la semaine artistique.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'choix',
            consigne:
              'Combien de côtés égaux possède un triangle isocèle ?',
            donneesConcretes: 'Gommettes posées sur les côtés de même longueur.',
            choix: ['2 côtés égaux', '3 côtés égaux', 'Aucun côté égal'],
            reponseAttendue: '2 côtés égaux',
            indice: 'Pense à « iso » = 2 côtés identiques (comme deux jambes égales).',
            explication: 'Un triangle isocèle a 2 côtés de même longueur (et 2 angles égaux à la base).',
            lienSituationProbleme: 'Classement des triangles manipulés collectivement.',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'choix',
            consigne:
              'Quel triangle régulier a à la fois 3 côtés égaux et 3 sommets ?',
            donneesConcretes: 'Éventails symétriques de la semaine artistique.',
            choix: ['Triangle équilatéral', 'Triangle rectangle', 'Pentagone'],
            reponseAttendue: 'Triangle équilatéral',
            indice: '« Équi » = égal, « latéral » = côté.',
            explication: 'Le triangle équilatéral a ses 3 côtés de même longueur.',
            lienSituationProbleme: 'Choix de l’éventail régulier.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question:
              'Lors du tri collectif pour la semaine artistique, comment sépares-tu d’abord les triangles des autres polygones ?',
            reponseAttendue: 'On ne garde que les polygones fermés qui ont exactement 3 côtés et 3 sommets.',
            indice: 'Compte les côtés au toucher avant d’utiliser l’équerre.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question: 'Quels deux instruments principaux servent à tracer avec précision ces 3 triangles ?',
            reponseAttendue: 'L’équerre (pour l’angle droit) et le compas + règle graduée (pour reporter les côtés égaux).',
            indice: 'Un instrument pour 90°, un pour reporter des longueurs égales.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    if (phaseKey === 'petits_groupes') {
      return {
        exercicesProgressifs: [
          {
            id: `${pid}-ex1`,
            palier: 'Palier 1 · Découverte',
            type: 'saisie',
            consigne:
              'Le motif du sac kenté est un triangle équilatéral de 5 cm de côté. Quel est son périmètre total (en cm) ?',
            donneesConcretes: '3 côtés égaux de 5 cm chacun.',
            reponseAttendue: '15',
            unite: 'cm',
            indice: 'Calcule 5 + 5 + 5.',
            explication: '3 × 5 cm = 15 cm.',
            lienSituationProbleme: 'Tracé du motif sac kenté en petits groupes.',
          },
          {
            id: `${pid}-ex2`,
            palier: 'Palier 2 · Entraînement',
            type: 'choix',
            consigne:
              'Pour tracer le 3e sommet du triangle équilatéral de 5 cm, quel écartement donnes-tu au compas ?',
            donneesConcretes: 'Segment [AB] = 5 cm déjà tracé.',
            choix: ['5 cm depuis A et 5 cm depuis B', '2,5 cm depuis A', '10 cm depuis B'],
            reponseAttendue: '5 cm depuis A et 5 cm depuis B',
            indice: 'Les 3 côtés doivent mesurer exactement 5 cm.',
            explication: 'L’intersection des deux arcs de rayon 5 cm donne le sommet C à égale distance de A et B.',
            lienSituationProbleme: 'Programme de construction au compas (sac kenté).',
          },
          {
            id: `${pid}-ex3`,
            palier: 'Palier 3 · Défi',
            type: 'saisie',
            consigne:
              'Vous tracez maintenant le triangle isocèle de côtés AB = 8 cm, AC = 6 cm et BC = 6 cm. Quel est son périmètre (en cm) ?',
            donneesConcretes: 'Base AB = 8 cm ; deux côtés égaux = 6 cm chacun.',
            reponseAttendue: '20',
            unite: 'cm',
            indice: 'Additionne 8 + 6 + 6.',
            explication: '8 + 6 + 6 = 20 cm.',
            lienSituationProbleme: 'Construction en îlot du triangle isocèle 8-6-6 cm.',
          },
        ],
        questionsReponsesPhase: [
          {
            id: `${pid}-qr1`,
            question: 'Pourquoi les deux arcs de compas de rayon 6 cm tracés depuis A et B se coupent-ils ?',
            reponseAttendue:
              'Parce que la somme des deux rayons (6 + 6 = 12 cm) est plus grande que la base AB = 8 cm : c’est l’inégalité triangulaire.',
            indice: 'Compare 6 + 6 = 12 à 8.',
            ancrageThemeTitreSituation: anchor,
          },
          {
            id: `${pid}-qr2`,
            question: 'Quels signes de codage poses-tu sur le triangle isocèle ABC (AC = BC = 6 cm) ?',
            reponseAttendue: 'Un même petit trait (//) sur les côtés [AC] et [BC] pour indiquer qu’ils sont égaux.',
            indice: 'On ne met pas le trait sur la base [AB] qui mesure 8 cm.',
            ancrageThemeTitreSituation: anchor,
          },
        ],
      };
    }

    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'saisie',
          consigne:
            'L’espace de la manifestation mesure 8 m × 12 m (échelle 1 cm pour 1 m). Quelle longueur en cm traces-tu pour 12 m ?',
          donneesConcretes: 'Échelle 1 cm = 1 m ; dimension réelle = 12 m.',
          reponseAttendue: '12',
          unite: 'cm',
          indice: 'Chaque mètre réel correspond à 1 cm sur ta feuille.',
          explication: '12 m → 12 cm et 8 m → 8 cm.',
          lienSituationProbleme: 'Plan à l’échelle de l’espace de manifestation.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne:
            'Si on partage ce rectangle (8 m × 12 m) par sa diagonale en deux triangles rectangles, quelle est l’aire totale du rectangle (en m²) ?',
          donneesConcretes: 'Longueur = 12 m ; largeur = 8 m.',
          reponseAttendue: '96',
          unite: 'm²',
          indice: 'Multiplie 12 × 8.',
          explication: '12 × 8 = 96 m² (chaque triangle rectangle vaut la moitié : 48 m²).',
          lienSituationProbleme: 'Calcul de surface de la manifestation.',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'choix',
          consigne:
            'Pour vérifier que ton rectangle (8 cm × 12 cm) et ses triangles rectangles sont précis, quel contrôle fais-tu aux sommets ?',
          donneesConcretes: 'Plan tracé au crayon à l’échelle.',
          choix: [
            'Vérifier les angles droits à l’équerre et les côtés opposés égaux',
            'Mesurer seulement un côté',
            'Effacer le codage des sommets',
          ],
          reponseAttendue:
            'Vérifier les angles droits à l’équerre et les côtés opposés égaux',
          indice: 'Contrôle à la fois les longueurs et l’angle droit.',
          explication: 'Un rectangle possède 4 angles droits et des côtés opposés de même longueur.',
          lienSituationProbleme: 'Vérification autonome des tracés.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question:
            'Si tu traces un triangle rectangle de 6 cm et 8 cm, comment contrôles-tu la précision du tracé ?',
          reponseAttendue:
            'L’angle entre les deux côtés mesure bien 90° à l’équerre et les mesures à la règle sont exactement 6 cm et 8 cm.',
          indice: 'Utilise successivement l’équerre et la règle graduée.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: 'Combien mesure la moitié de l’espace (8 m × 12 m) en forme de triangle rectangle ?',
          reponseAttendue: '48 m² (la moitié de 96 m²).',
          indice: 'Divise l’aire du rectangle par 2.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  // fractions_equiv (SAMPLE_FICHES[0])
  if (phaseKey === 'collective') {
    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne:
            'Deux gâteaux identiques sont partagés : 1 part sur 2 pour l’un, 2 parts sur 4 pour l’autre. Qui en mange le plus ?',
          donneesConcretes: 'Bandes-unités comparées superposées : 1/2 et 2/4.',
          choix: ['La même quantité (1/2 = 2/4)', 'Celui qui a 2/4', 'Celui qui a 1/2'],
          reponseAttendue: 'La même quantité (1/2 = 2/4)',
          indice: 'Aligne la bande coupée en 2 et celle coupée en 4.',
          explication: '1/2 et 2/4 couvrent exactement la moitié du disque ou de la bande.',
          lienSituationProbleme: 'Partage équitable du gâteau en début de séance.',
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne:
            'Complète l’égalité avec le bon numérateur : 1/2 = ? / 6.',
          donneesConcretes: 'Bande divisée en 6 parts égales superposée à 1/2.',
          reponseAttendue: '3',
          indice: 'La moitié de 6 parts égales, c’est combien de parts ?',
          explication: '1 × 3 = 3 et 2 × 3 = 6, donc 1/2 = 3/6.',
          lienSituationProbleme: 'Passage du partage en 2 parts au partage en 6 parts.',
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'choix',
          consigne: 'Quelle fraction N’EST PAS équivalente à 1/2 ?',
          donneesConcretes: 'Comparaison sur droite graduée.',
          choix: ['3/5', '4/8', '5/10'],
          reponseAttendue: '3/5',
          indice: 'Dans une fraction égale à 1/2, le dénominateur est toujours le double du numérateur.',
          explication: 'Le double de 3 est 6 (pas 5) : 3/5 est donc plus grand que 1/2.',
          lienSituationProbleme: 'Justification orale de l’équivalence.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question:
            'Pourquoi 2/4 représente-t-il la même quantité que 1/2 alors que les nombres sont différents ?',
          reponseAttendue:
            'Parce que les parts sont deux fois plus petites, mais on en prend deux fois plus : la surface totale coloriée est identique.',
          indice: 'Superpose les bandes pliées en 2 et en 4.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: 'Comment appelle-t-on le nombre du haut et le nombre du bas d’une fraction ?',
          reponseAttendue: 'En haut le numérateur (parts prises) et en bas le dénominateur (parts égales du tout).',
          indice: 'Dénominateur = dénommer / couper le tout en parts égales.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  return {
    exercicesProgressifs: [
      {
        id: `${pid}-ex1`,
        palier: 'Palier 1 · Découverte',
        type: 'saisie',
        consigne:
          'Complète pour obtenir une fraction équivalente à 2/3 : 2/3 = ? / 6.',
        donneesConcretes: 'Chaque tiers est coupé en 2 parts égales (×2).',
        reponseAttendue: '4',
        indice: 'Multiplie aussi le numérateur 2 par 2.',
        explication: '2 × 2 = 4 et 3 × 2 = 6, donc 2/3 = 4/6.',
        lienSituationProbleme: 'Atelier d’équivalence sur bandes fractionnées.',
      },
      {
        id: `${pid}-ex2`,
        palier: 'Palier 2 · Entraînement',
        type: 'saisie',
        consigne: 'Simplifie la fraction 6/8 en divisant haut et bas par 2 : 6/8 = ? / 4.',
        donneesConcretes: 'Regroupement des huitièmes deux par deux en quarts.',
        reponseAttendue: '3',
        indice: 'Combien font 6 ÷ 2 ?',
        explication: '6 ÷ 2 = 3 et 8 ÷ 2 = 4, donc 6/8 = 3/4.',
        lienSituationProbleme: 'Droite graduée et regroupement de parts.',
      },
      {
        id: `${pid}-ex3`,
        palier: 'Palier 3 · Défi',
        type: 'choix',
        consigne: 'Parmi ces égalités, laquelle est entièrement exacte ?',
        donneesConcretes: donneesConcretes,
        choix: ['3/4 = 6/8 = 9/12', '2/3 = 4/9 = 6/12', '1/3 = 2/5 = 3/9'],
        reponseAttendue: '3/4 = 6/8 = 9/12',
        indice: 'Vérifie que numérateur et dénominateur sont multipliés par le même nombre (×2 puis ×3).',
        explication: '3/4 × 2/2 = 6/8 et 3/4 × 3/3 = 9/12.',
        lienSituationProbleme: 'Validation autonome de la règle multiplicatrice.',
      },
    ],
    questionsReponsesPhase: [
      {
        id: `${pid}-qr1`,
        question: 'Quelle règle permet de fabriquer une fraction équivalente sans changer la quantité ?',
        reponseAttendue:
          'Multiplier (ou diviser) le numérateur et le dénominateur par un même nombre différent de zéro.',
        indice: 'Ce que je fais en bas, je le fais aussi en haut.',
        ancrageThemeTitreSituation: anchor,
      },
      {
        id: `${pid}-qr2`,
        question: 'Si je coupe une bande en 12 parts au lieu de 4, combien de parts valent 3/4 ?',
        reponseAttendue: '9 parts sur 12 (9/12), car 4 × 3 = 12 et 3 × 3 = 9.',
        indice: 'Par combien a-t-on multiplié 4 pour obtenir 12 ?',
        ancrageThemeTitreSituation: anchor,
      },
    ],
  };
}

function buildDynamicMathExercisesAndQr(
  cbCode: CbMathType,
  phase: PhaseManipulationMath,
  ctx: ManipulationContext,
  anchor: string
): {
  exercicesProgressifs: ExerciceProgressifPhase[];
  questionsReponsesPhase: QuestionReponsePhase[];
} {
  const nums = extractNumbers(
    `${phase.donneesConcretes} ${ctx.titre || ''} ${ctx.situationProbleme || ''}`
  );
  const pid = `dyn-${cbCode}-${phase.phase}`;
  const titleShort = clipText(ctx.titre || 'la leçon', 40);
  const sitShort = clipText(ctx.situationProbleme || phase.donneesConcretes, 58);

  if (cbCode === 'CB2') {
    const a = nums[0] && nums[0] <= 50 ? nums[0] : 6;
    const b = nums[1] && nums[1] <= 50 ? nums[1] : 4;
    const perim = 2 * (a + b);
    const area = a * b;
    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne: `Sur le schéma de « ${titleShort} », quel instrument vérifie les angles droits (90°) de la figure (${a} u × ${b} u) ?`,
          donneesConcretes: `Figure manipulée avec côtés ${a} u et ${b} u.`,
          choix: ['L’équerre', 'Le compas seul', 'La balance'],
          reponseAttendue: 'L’équerre',
          indice: 'Cherche l’outil en triangle qui possède un coin de 90°.',
          explication: 'L’équerre permet de contrôler ou tracer chaque angle droit.',
          lienSituationProbleme: `Observation directe sur « ${sitShort} ».`,
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne: `En mesurant le contour complet d’une figure de côtés ${a} u et ${b} u (deux longueurs et deux largeurs), quel périmètre total obtiens-tu (en u) ?`,
          donneesConcretes: `Périmètre = ${a} + ${b} + ${a} + ${b}.`,
          reponseAttendue: String(perim),
          unite: 'u',
          indice: `Calcule (${a} + ${b}) × 2.`,
          explication: `${a} + ${b} = ${a + b}, puis ${a + b} × 2 = ${perim} unités.`,
          lienSituationProbleme: `Mesure concrète des bords dans « ${titleShort} ».`,
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne: `Combien de carreaux unités couvre l’intérieur d’un rectangle de ${a} u sur ${b} u ?`,
          donneesConcretes: `${a} colonnes de ${b} carreaux chacune.`,
          reponseAttendue: String(area),
          unite: 'u²',
          indice: `Multiplie ${a} × ${b}.`,
          explication: `${a} × ${b} = ${area} carreaux unités.`,
          lienSituationProbleme: `Passage de la figure manipulée à l’écriture géométrique.`,
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question: `En lien avec « ${titleShort} », quels éléments faut-il vérifier sur le schéma géométrique de cette phase ?`,
          reponseAttendue: `Le nom des sommets, les longueurs (${a} u et ${b} u), les angles droits (équerre) et les côtés égaux codés.`,
          indice: 'Vérifie la légende et le codage posé sur les côtés et les angles.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: `Comment le matériel (${clipText(phase.materielConcret, 45)}) aide-t-il à résoudre « ${sitShort} » ?`,
          reponseAttendue: `Il permet de manipuler et mesurer réellement la figure avant de tracer et justifier la propriété à l’écrit.`,
          indice: 'Relie le geste concret à la règle géométrique.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  if (cbCode === 'CB3') {
    const q1 = nums[0] && nums[0] <= 200 ? nums[0] : 4;
    const mult = phase.phase === 'collective' ? 2 : phase.phase === 'petits_groupes' ? 3 : 5;
    const res = q1 * mult;
    return {
      exercicesProgressifs: [
        {
          id: `${pid}-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne: `Pour mesurer correctement les grandeurs de « ${titleShort} », que doit-on toujours indiquer après le nombre ?`,
          donneesConcretes: `Étalon de base = ${q1} unités.`,
          choix: [
            'L’unité exacte (g, m, L, min, °…)',
            'Uniquement le nombre sans unité',
            'Une lettre prise au hasard',
          ],
          reponseAttendue: 'L’unité exacte (g, m, L, min, °…)',
          indice: 'Un nombre sans unité ne précise pas ce qu’on mesure.',
          explication: 'Toute mesure ou grandeur s’écrit toujours avec son unité.',
          lienSituationProbleme: `Situation-problème : « ${sitShort} ».`,
        },
        {
          id: `${pid}-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne: `En reportant ${mult} fois l’étalon de ${q1} unités, quelle mesure totale obtient-on ?`,
          donneesConcretes: `${mult} lots identiques de ${q1} unités.`,
          reponseAttendue: String(res),
          unite: 'u',
          indice: `Calcule ${mult} × ${q1}.`,
          explication: `${mult} × ${q1} = ${res} unités.`,
          lienSituationProbleme: `Report concret de l’étalon dans « ${phase.titrePhase} ».`,
        },
        {
          id: `${pid}-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne: `Si on ajoute encore 1 étalon (${q1} u) aux ${res} u obtenues, quel nouveau total atteint-on ?`,
          donneesConcretes: `${res} u + ${q1} u.`,
          reponseAttendue: String(res + q1),
          unite: 'u',
          indice: `Additionne ${res} + ${q1}.`,
          explication: `${res} + ${q1} = ${res + q1} unités (soit ${mult + 1} étalons).`,
          lienSituationProbleme: `Vérification de la proportionnalité de la mesure.`,
        },
      ],
      questionsReponsesPhase: [
        {
          id: `${pid}-qr1`,
          question: `Dans le thème « ${clipText(ctx.theme || 'Grandeurs', 36)} », pourquoi vérifie-t-on l’unité avant tout calcul ?`,
          reponseAttendue: `On ne peut additionner ou comparer que des grandeurs exprimées dans la même unité de mesure.`,
          indice: 'Pense à convertir les unités différentes avant de calculer.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `${pid}-qr2`,
          question: `Comment vérifies-tu le résultat ${res} u avec le matériel de cette phase ?`,
          reponseAttendue: `En reportant concrètement ${mult} fois l’étalon de ${q1} u et en contrôlant sur le schéma gradué.`,
          indice: 'Concret → Schéma → Calcul + Unité.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    };
  }

  // CB1 dynamic
  const a = nums[0] && nums[0] <= 500 ? nums[0] : 12;
  const b = nums[1] && nums[1] <= 500 ? nums[1] : 8;
  const sum = a + b;
  const diff = Math.abs(a - b);
  return {
    exercicesProgressifs: [
      {
        id: `${pid}-ex1`,
        palier: 'Palier 1 · Découverte',
        type: 'saisie',
        consigne: `À partir des deux collections du schéma (${a} et ${b}), quel est leur total ensemble ?`,
        donneesConcretes: `Donnée A = ${a} ; Donnée B = ${b}.`,
        reponseAttendue: String(sum),
        indice: `Réunis les deux barres : ${a} + ${b}.`,
        explication: `${a} + ${b} = ${sum}.`,
        lienSituationProbleme: `Mise en barres des données de « ${sitShort} ».`,
      },
      {
        id: `${pid}-ex2`,
        palier: 'Palier 2 · Entraînement',
        type: 'saisie',
        consigne: `Quel est l’écart (la différence) entre la plus grande quantité (${Math.max(a, b)}) et la plus petite (${Math.min(a, b)}) ?`,
        donneesConcretes: `Comparaison des barres ${Math.max(a, b)} et ${Math.min(a, b)}.`,
        reponseAttendue: String(diff),
        indice: `Calcule ${Math.max(a, b)} − ${Math.min(a, b)}.`,
        explication: `${Math.max(a, b)} − ${Math.min(a, b)} = ${diff}.`,
        lienSituationProbleme: `Comparaison des quantités dans « ${titleShort} ».`,
      },
      {
        id: `${pid}-ex3`,
        palier: 'Palier 3 · Défi',
        type: 'choix',
        consigne: `Si l’on double chacune des deux quantités (${a} et ${b}), quel nouveau total obtient-on ?`,
        donneesConcretes: `2 × (${a} + ${b}) = 2 × ${sum}.`,
        choix: [String(sum * 2), String(sum + 2), String(Math.max(1, sum - 2))],
        reponseAttendue: String(sum * 2),
        indice: `Multiplie le total ${sum} par 2.`,
        explication: `2 × ${sum} = ${sum * 2}.`,
        lienSituationProbleme: `Transfert numérique autour de « ${titleShort} ».`,
      },
    ],
    questionsReponsesPhase: [
      {
        id: `${pid}-qr1`,
        question: `Dans « ${titleShort} », que représentent les nombres ${a} et ${b} sur le schéma en barres ?`,
        reponseAttendue: `Ils représentent les deux quantités concrètes tirées de la situation-problème (« ${sitShort} ») avant le calcul du total (${sum}).`,
        indice: 'Relis la barre bleue et la barre verte du schéma.',
        ancrageThemeTitreSituation: anchor,
      },
      {
        id: `${pid}-qr2`,
        question: `Comment le schéma de cette phase aide-t-il un élève à choisir la bonne opération ?`,
        reponseAttendue: `Voir les deux parties réunies montre qu’on additionne (${a} + ${b} = ${sum}) ; voir l’écart montre qu’on soustrait.`,
        indice: 'Parties → Tout = addition ; Tout − Partie = soustraction.',
        ancrageThemeTitreSituation: anchor,
      },
    ],
  };
}

function buildDisciplinePhases(ctx: ManipulationContext): SchematisationMathPhases {
  const matiere = ctx.matiere || 'Discipline APC';
  const titre = ctx.titre || 'Séance APC';
  const theme = ctx.theme || 'Thème de la séance';
  const situation =
    ctx.situationProbleme?.trim() ||
    `Situation-problème concrète liée au thème « ${theme} » et à la séance « ${titre} ».`;
  const anchor = makeAnchor(theme, titre, situation);
  const mLower = `${matiere} ${ctx.disciplineId || ''}`.toLowerCase();

  const titreEsc = escapeXml(clipText(titre, 30));
  const themeEsc = escapeXml(clipText(theme, 28));
  const isFrench = /fran[çc]ais|lecture|vocabulaire|expression|grammaire|conjugaison|orthographe/.test(
    mLower
  );
  const isScience = /science|technologie|svt|physique|observation|vivant|eau/.test(mLower);
  const isAnglais = /anglais|english/.test(mLower);

  const labelStep1 = isFrench
    ? 'Texte / Énoncé réel'
    : isScience
    ? 'Observation réelle'
    : isAnglais
    ? 'Dialogue / Flashcards'
    : 'Situation vécue';
  const labelStep2 = isFrench
    ? 'Tri d’étiquettes / Indices'
    : isScience
    ? 'Expérience & mesures'
    : isAnglais
    ? 'Jeu de rôle guidé'
    : 'Classement coopératif';
  const labelStep3 = isFrench
    ? 'Production & règle'
    : isScience
    ? 'Schéma annoté & loi'
    : isAnglais
    ? 'Mini-scène orale'
    : 'Synthèse autonome';

  const makeSvg = (
    phaseTitle: string,
    box1Title: string,
    box1Sub: string,
    box2Title: string,
    box2Sub: string,
    footer: string
  ) =>
    `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="200" fill="#F8FAFC" rx="8"/><text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">${escapeXml(phaseTitle)} · ${titreEsc}</text><rect x="16" y="34" width="328" height="24" rx="4" fill="#E0F2FE" stroke="#0284C7"/><text x="180" y="50" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#0369A1">Thème : ${themeEsc}</text><rect x="16" y="70" width="146" height="82" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/><text x="89" y="94" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0284C7">${escapeXml(box1Title)}</text><text x="89" y="118" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#334155">${escapeXml(box1Sub)}</text><path d="M 166 111 L 192 111" stroke="#059669" stroke-width="2.2"/><polygon points="196,111 188,106 188,116" fill="#059669"/><rect x="198" y="70" width="146" height="82" rx="6" fill="#ECFDF5" stroke="#059669" stroke-width="1.5"/><text x="271" y="94" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">${escapeXml(box2Title)}</text><text x="271" y="118" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">${escapeXml(box2Sub)}</text><text x="180" y="176" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">${escapeXml(footer)}</text></svg>`;

  const phases: PhaseManipulationMath[] = [
    {
      phase: 'collective',
      titrePhase: '1. Manipulation collective',
      modalite: `Grand groupe · Tableau & repérage guidé (${matiere})`,
      donneesConcretes: `Exploration collective de « ${clipText(situation, 95)} » autour du titre « ${clipText(titre, 50)} » (${theme}).`,
      materielConcret: isFrench
        ? 'Texte support agrandi au tableau, étiquettes-mots contrastées, bandes de ponctuation/liaison.'
        : isScience
        ? 'Échantillons réels ou maquette au bureau, tableau d’observation à 2 colonnes.'
        : 'Support visuel affiché face classe, cartes-indices et ardoise collective.',
      actionSchemaEleve:
        'Observe les indices concrets de la situation-problème, reformule le défi de la leçon et classe les premiers éléments au tableau.',
      etayageInclusifAPC:
        'Consigne segmentée en 2 actions visuelles ; repères colorés fixes pour soutenir l’attention et les élèves DYS/auditifs.',
      svgSchemaCode: makeSvg(
        'Collectif',
        `1. ${labelStep1}`,
        'Indices de départ',
        '2. Mise en commun',
        'Règle dégagée ensemble',
        'Manipulation collective → repères partagés'
      ),
      exercicesProgressifs: [
        {
          id: `disc-col-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne: `Quel est le point de départ concret travaillé dans « ${clipText(titre, 42)} » ?`,
          donneesConcretes: clipText(situation, 90),
          choix: [
            `Observer et analyser le support lié à « ${clipText(theme, 28)} »`,
            'Recopier un texte hors-sujet sans observer',
            'Ignorer la consigne de départ',
          ],
          reponseAttendue: `Observer et analyser le support lié à « ${clipText(theme, 28)} »`,
          indice: 'Relis le thème et la situation-problème de la séance.',
          explication: 'Toute manipulation collective commence par l’observation guidée du support concret lié au thème.',
          lienSituationProbleme: clipText(situation, 75),
        },
        {
          id: `disc-col-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'choix',
          consigne: `À la fin de la phase collective en ${matiere}, que doit produire la classe avant le travail en îlots ?`,
          donneesConcretes: `Titre : ${clipText(titre, 48)}.`,
          choix: [
            'Un repère visuel / une règle claire comprise par tous',
            'Une liste de mots sans aucun lien avec la leçon',
            'Rien avant l’évaluation finale',
          ],
          reponseAttendue: 'Un repère visuel / une règle claire comprise par tous',
          indice: 'La manipulation collective construit les repères communs utilisés ensuite en groupe.',
          explication: 'Le schéma collectif fixe les critères de réussite pour les îlots.',
          lienSituationProbleme: `Préparation des critères de « ${clipText(titre, 38)} ».`,
        },
        {
          id: `disc-col-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'saisie',
          consigne: `Combien d’étapes clés relie le schéma collectif ci-dessus (${labelStep1} → Mise en commun) ? Écris le chiffre.`,
          donneesConcretes: '1. Support réel → 2. Mise en commun.',
          reponseAttendue: '2',
          indice: 'Compte les deux cadres du schéma collectif.',
          explication: 'Les 2 temps relient l’observation concrète à la mise en commun structurée.',
          lienSituationProbleme: 'Structuration logique de la phase collective.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `disc-col-qr1`,
          question: `Quel lien unit le thème « ${clipText(theme, 35)} » à la situation de départ de « ${clipText(titre, 38)} » ?`,
          reponseAttendue: `La situation de départ place les élèves dans un cas concret du thème « ${clipText(theme, 35)} » afin de faire émerger l’objectif de la leçon.`,
          indice: 'Appuie-toi sur la mise en situation du début de séance.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `disc-col-qr2`,
          question: `Comment l’élève en difficulté (DYS/auditif) accède-t-il aux indices de cette phase collective ?`,
          reponseAttendue: `Grâce au support agrandi, aux repères colorés au tableau et à la reformulation orale courte.`,
          indice: 'Observe les adaptations inclusives de la phase.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    },
    {
      phase: 'petits_groupes',
      titrePhase: '2. Manipulation en petits groupes',
      modalite: 'Îlots coopératifs de 3 à 4 élèves · Échanges & tri actif',
      donneesConcretes: `Application coopérative sur « ${clipText(titre, 48)} » : tri, classement ou transformation à partir d’étiquettes/supports d’îlot (${theme}).`,
      materielConcret: isFrench
        ? 'Jeux d’étiquettes cartonnées, surligneurs bicolores et ardoise d’îlot A3.'
        : isScience
        ? 'Matériel d’expérience par îlot, fiche d’observation et schéma à compléter.'
        : 'Cartes de manipulation, feuille A3 partagée et crayons.',
      actionSchemaEleve:
        'Manipule les cartes/supports en équipe, compare deux hypothèses, complète le schéma d’îlot et justifie son choix devant les pairs.',
      etayageInclusifAPC:
        'Rôles tournants (lecteur, manipulateur, rapporteur) ; cartes manipulables sans surcharge de copie manuscrite.',
      svgSchemaCode: makeSvg(
        'Petits groupes',
        `Îlot · ${labelStep2}`,
        'Essais & confrontation',
        'Accord d’équipe',
        'Preuve sur schéma',
        'Confrontation coopérative entre pairs'
      ),
      exercicesProgressifs: [
        {
          id: `disc-grp-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne: `En petits groupes sur « ${clipText(titre, 40)} », comment résout-on un désaccord entre deux élèves de l’îlot ?`,
          donneesConcretes: 'Travail coopératif avec matériel manipulable.',
          choix: [
            'On teste ou vérifie avec les indices du support et le critère commun',
            'Le plus rapide impose sa réponse sans expliquer',
            'On laisse la question vide',
          ],
          reponseAttendue:
            'On teste ou vérifie avec les indices du support et le critère commun',
          indice: 'La preuve vient de la manipulation et du support.',
          explication: 'L’îlot argumente à partir des faits observés sur le support concret.',
          lienSituationProbleme: clipText(situation, 75),
        },
        {
          id: `disc-grp-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne: `Un îlot complet réunit 3 rôles (lecteur, manipulateur, rapporteur). Pour 4 îlots en classe, combien d’élèves participent activement ?`,
          donneesConcretes: '4 îlots × 3 rôles.',
          reponseAttendue: '12',
          unite: 'élèves',
          indice: 'Calcule 4 × 3.',
          explication: '4 îlots × 3 élèves = 12 élèves actifs simultanément.',
          lienSituationProbleme: `Organisation coopérative sur « ${clipText(theme, 35)} ».`,
        },
        {
          id: `disc-grp-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'choix',
          consigne: `Quel indice montre que la schématisation d’îlot est réussie avant la mise en commun ?`,
          donneesConcretes: `Production attendue : ${labelStep2}.`,
          choix: [
            'Chaque groupe sait expliquer son classement ou son choix avec un exemple exact',
            'Personne ne peut relire le schéma de l’îlot',
            'Les étiquettes sont restées mélangées',
          ],
          reponseAttendue:
            'Chaque groupe sait expliquer son classement ou son choix avec un exemple exact',
          indice: 'Un bon schéma se comprend et se justifie à l’oral.',
          explication: 'Le rapporteur s’appuie sur un exemple précis tiré du support.',
          lienSituationProbleme: `Validation coopérative de « ${clipText(titre, 38)} ».`,
        },
      ],
      questionsReponsesPhase: [
        {
          id: `disc-grp-qr1`,
          question: `Pourquoi travailler par îlots de 3 à 4 élèves sur « ${clipText(titre, 38)} » avant l’exercice individuel ?`,
          reponseAttendue: `Pour manipuler sans crainte de l’erreur, confronter plusieurs points de vue et consolider la méthode avant d’être seul.`,
          indice: 'Pense au rôle de l’entraide entre pairs.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `disc-grp-qr2`,
          question: `Comment l’îlot intègre-t-il un camarade ayant des difficultés d’écriture ou de motricité ?`,
          reponseAttendue: `En lui confiant le tri d’étiquettes cartonnées ou le rôle de vérificateur/rapporteur oral sans exiger une copie longue.`,
          indice: 'Sépare le raisonnement de la tâche de copie.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    },
    {
      phase: 'individuelle',
      titrePhase: '3. Manipulation individuelle',
      modalite: 'Travail autonome · Ardoise ou fiche personnelle adaptée',
      donneesConcretes: `Transfert personnel sur « ${clipText(titre, 48)} » : réinvestissement autonome à partir d’un nouveau cas issu de « ${clipText(theme, 36)} ».`,
      materielConcret:
        'Ardoise individuelle, fiche d’exercice graduée à 2 paliers et mémo visuel de référence.',
      actionSchemaEleve:
        'Applique seul la démarche structurée, vérifie son travail grâce à la mini-check-list puis formule ce qu’il a retenu.',
      etayageInclusifAPC:
        '2 paliers au choix, police lisible espacée, temps majoré (+2 min) et validation orale ou par pointage acceptée.',
      svgSchemaCode: makeSvg(
        'Individuel',
        '1. Je manipule seul',
        'Cas concret personnel',
        `2. ${labelStep3}`,
        'Auto-vérification réussie',
        'Autonomie → institutionnalisation APC'
      ),
      exercicesProgressifs: [
        {
          id: `disc-ind-ex1`,
          palier: 'Palier 1 · Découverte',
          type: 'choix',
          consigne: `Avant d’écrire sa réponse individuelle sur « ${clipText(titre, 38)} », quel réflexe faut-il avoir ?`,
          donneesConcretes: 'Utilisation de l’ardoise et du mémo visuel.',
          choix: [
            'Relire la consigne et utiliser les repères dégagés en groupe',
            'Répondre au hasard le plus vite possible',
            'Copier sans comprendre',
          ],
          reponseAttendue:
            'Relire la consigne et utiliser les repères dégagés en groupe',
          indice: 'Le mémo collectif sert de guide personnel.',
          explication: 'S’appuyer sur les critères de réussite garantit un transfert fiable.',
          lienSituationProbleme: clipText(situation, 75),
        },
        {
          id: `disc-ind-ex2`,
          palier: 'Palier 2 · Entraînement',
          type: 'saisie',
          consigne: `Sur une fiche d’auto-contrôle de 5 items liés à « ${clipText(theme, 32)} », si un élève en réussit 4, combien lui en reste-t-il à consolider ?`,
          donneesConcretes: '5 items − 4 réussis.',
          reponseAttendue: '1',
          unite: 'item',
          indice: 'Calcule 5 − 4.',
          explication: '5 − 4 = 1 item à revoir lors de l’étayage ciblé.',
          lienSituationProbleme: `Auto-évaluation individuelle sur « ${clipText(titre, 38)} ».`,
        },
        {
          id: `disc-ind-ex3`,
          palier: 'Palier 3 · Défi',
          type: 'choix',
          consigne: `Comment reconnaît-on qu’un élève maîtrise la compétence de « ${clipText(titre, 38)} » à l’issue de la phase individuelle ?`,
          donneesConcretes: `Thème : ${clipText(theme, 38)}.`,
          choix: [
            'Il réussit seul un nouveau cas et sait expliquer comment il a fait',
            'Il répète seulement quand le maître souffle la réponse',
            'Il récite sans pouvoir l’appliquer',
          ],
          reponseAttendue:
            'Il réussit seul un nouveau cas et sait expliquer comment il a fait',
          indice: 'En APC, la compétence se prouve par le transfert autonome.',
          explication: 'Réussir seul un cas nouveau et le justifier valide l’objectif.',
          lienSituationProbleme: 'Transfert final vers la trace écrite et la vie courante.',
        },
      ],
      questionsReponsesPhase: [
        {
          id: `disc-ind-qr1`,
          question: `Que retiens-tu d’essentiel sur « ${clipText(titre, 40)} » pour résoudre d’autres situations du thème « ${clipText(theme, 32)} » ?`,
          reponseAttendue: `Je repère les indices du support concret, j’applique la méthode vérifiée en groupe et je contrôle mon résultat avec la check-list.`,
          indice: 'Résume la démarche en 3 gestes simples.',
          ancrageThemeTitreSituation: anchor,
        },
        {
          id: `disc-ind-qr2`,
          question: `Où et quand peux-tu réutiliser cette compétence hors de la classe ?`,
          reponseAttendue: `Dans les situations réelles du quotidien liées au thème « ${clipText(theme, 36)} » (lecture, échange, observation, mesure).`,
          indice: 'Fais le lien avec le vécu des élèves.',
          ancrageThemeTitreSituation: anchor,
        },
      ],
    },
  ];

  return {
    actif: true,
    cbCode: 'CB1',
    cbLibelle:
      ctx.competenceDeBase?.trim() ||
      `Compétence APC (${matiere}) — ${clipText(titre, 65)}`,
    situationProblemeReference: situation,
    titreLeconReference: titre,
    phases,
    synthesePassageAbstraction: `Observation concrète (« ${clipText(titre, 40)} ») → Manipulation coopérative en îlots → Réinvestissement autonome & trace écrite.`,
  };
}

export function enrichManipulationPhases(
  schem: SchematisationMathPhases,
  ctx: ManipulationContext
): SchematisationMathPhases {
  const situation =
    schem.situationProblemeReference?.trim() ||
    ctx.situationProbleme?.trim() ||
    ctx.theme?.trim() ||
    `Situation-problème liée à « ${ctx.titre || schem.titreLeconReference} »`;
  const titre = ctx.titre?.trim() || schem.titreLeconReference || 'Séance APC';
  const theme = ctx.theme?.trim() || 'Consolidation des compétences';
  const anchor = makeAnchor(theme, titre, situation);
  const presetTopic = detectPresetTopic({
    ...ctx,
    titre,
    theme,
    situationProbleme: situation,
  });

  const enrichedPhases: PhaseManipulationMath[] = (schem.phases || []).map(
    (phase) => {
      const hasValidExercises =
        Array.isArray(phase.exercicesProgressifs) &&
        phase.exercicesProgressifs.length >= 2 &&
        phase.exercicesProgressifs.every(
          (ex) => ex.consigne?.trim() && ex.reponseAttendue?.trim()
        );
      const hasValidQr =
        Array.isArray(phase.questionsReponsesPhase) &&
        phase.questionsReponsesPhase.length >= 1 &&
        phase.questionsReponsesPhase.every(
          (qr) => qr.question?.trim() && qr.reponseAttendue?.trim()
        );

      let generated: {
        exercicesProgressifs: ExerciceProgressifPhase[];
        questionsReponsesPhase: QuestionReponsePhase[];
      } | null = null;

      if (!hasValidExercises || !hasValidQr) {
        generated = presetTopic
          ? buildPresetExercisesAndQr(
              presetTopic,
              phase.phase,
              anchor,
              phase.donneesConcretes
            )
          : buildDynamicMathExercisesAndQr(
              schem.cbCode || 'CB1',
              phase,
              { ...ctx, titre, theme, situationProbleme: situation },
              anchor
            );
      }

      return {
        ...phase,
        svgSchemaCode: sanitizeSvg(phase.svgSchemaCode || '', '0 0 360 200'),
        exercicesProgressifs: hasValidExercises
          ? phase.exercicesProgressifs!.map((ex, i) => ({
              ...ex,
              id: ex.id || `${phase.phase}-ex-${i + 1}`,
            }))
          : generated!.exercicesProgressifs,
        questionsReponsesPhase: hasValidQr
          ? phase.questionsReponsesPhase!.map((qr, i) => ({
              ...qr,
              id: qr.id || `${phase.phase}-qr-${i + 1}`,
              ancrageThemeTitreSituation:
                qr.ancrageThemeTitreSituation?.trim() || anchor,
            }))
          : generated!.questionsReponsesPhase,
      };
    }
  );

  return {
    ...schem,
    situationProblemeReference: situation,
    titreLeconReference: titre,
    phases: enrichedPhases,
  };
}

export function buildUniversalManipulationSchematisation(
  ctx: ManipulationContext
): SchematisationMathPhases {
  return buildDisciplinePhases(ctx);
}

export function getEffectiveManipulationSchematisation(
  fiche: Pick<FicheAPC, 'schematisationMath' | 'phasesManipulation'>
): SchematisationMathPhases | null {
  if (
    fiche.schematisationMath?.actif &&
    Array.isArray(fiche.schematisationMath.phases) &&
    fiche.schematisationMath.phases.length > 0
  ) {
    return fiche.schematisationMath;
  }
  if (
    fiche.phasesManipulation?.actif &&
    Array.isArray(fiche.phasesManipulation.phases) &&
    fiche.phasesManipulation.phases.length > 0
  ) {
    return fiche.phasesManipulation;
  }
  return null;
}

/**
 * Associe directement les phases de manipulation (collective, petits_groupes, individuelle)
 * aux étapes correspondantes du déroulement sur la fiche pédagogique.
 */
export function mapPhasesToDeroulementSteps(
  deroulement: EtapePedagogique[],
  phases: PhaseManipulationMath[]
): {
  stepPhaseMap: Map<string, PhaseManipulationMath[]>;
  unmappedPhases: PhaseManipulationMath[];
} {
  const stepPhaseMap = new Map<string, PhaseManipulationMath[]>();
  if (!deroulement.length || !phases.length) {
    return { stepPhaseMap, unmappedPhases: [...phases] };
  }

  const phaseByKey = new Map<
    PhaseManipulationMath['phase'],
    PhaseManipulationMath
  >();
  for (const p of phases) {
    phaseByKey.set(p.phase, p);
  }
  const assigned = new Set<PhaseManipulationMath['phase']>();

  const pushToStep = (
    stepId: string,
    key: PhaseManipulationMath['phase']
  ) => {
    const p = phaseByKey.get(key);
    if (!p || assigned.has(key)) return;
    const list = stepPhaseMap.get(stepId) || [];
    list.push(p);
    stepPhaseMap.set(stepId, list);
    assigned.add(key);
  };

  // Pass 1: Explicit CM1 S9 Math & explicit step patterns
  for (const step of deroulement) {
    const txt = `${step.etape} ${step.sousTitreInvariable || ''}`.toLowerCase();

    if (
      /travail collectif.*manipul|manipulation collective|calcul mental.*÷\s*5|résolution de problème.*1/.test(
        txt
      )
    ) {
      pushToStep(step.id, 'collective');
    }

    if (
      /petits groupes\s*\/\s*individuel|îlots.*individuel|résolution de problème.*(2|3|4)/.test(
        txt
      )
    ) {
      pushToStep(step.id, 'petits_groupes');
      if (/individuel/.test(txt)) {
        pushToStep(step.id, 'individuelle');
      }
    } else if (/petits groupes|îlots|travail en groupe/.test(txt)) {
      pushToStep(step.id, 'petits_groupes');
    } else if (/individuel|résolution de problème.*5\s*\(a\)|travail autonome/.test(txt)) {
      pushToStep(step.id, 'individuelle');
    }
  }

  // Pass 2: For standard 5-step APC templates ("Manipulation guidée & recherche active", "Activité 1", "Étude, Analyse et découverte", etc.)
  if (assigned.size < phases.length) {
    const manipStep =
      deroulement.find((s) =>
        /manipul|recherche active|atelier|expériment|activité\s*1|découverte|analyse et découverte|reprise guidée|assemblage|interaction guidée|lecture.*voix|exercices/i.test(
          `${s.etape} ${s.sousTitreInvariable || ''}`
        )
      ) || deroulement[Math.min(2, deroulement.length - 1)];

    if (manipStep) {
      for (const p of phases) {
        if (!assigned.has(p.phase)) {
          pushToStep(manipStep.id, p.phase);
        }
      }
    }
  }

  const unmappedPhases = phases.filter((p) => !assigned.has(p.phase));
  return { stepPhaseMap, unmappedPhases };
}
