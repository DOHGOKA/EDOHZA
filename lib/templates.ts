import { DomaineModele, FicheAPC, ModeleFicheAPC } from './types';
import { createUid } from './utils';
import { findDisciplineProfile } from './disciplines';
import { DEFAULT_HANDICAP_PROFILES } from './inclusion';
import { CM1_S9_FR_TEMPLATES } from './templates-cm1-s9-fr';
import { CM1_S9_MATH_TEMPLATES } from './templates-cm1-s9-math';
import { EXTRA_GENERAL_MODELE_FICHES } from './templates-general-extra';
import {
  buildFallbackMathSchematisation,
  isMathContext,
} from './math-schematisation';
import {
  buildUniversalManipulationSchematisation,
  enrichManipulationPhases,
} from './manipulation-phases';

export const DOMAINE_MODELES: DomaineModele[] = [
  'Mathématiques',
  'Français',
  'Sciences humaines',
  'Sciences & Technologie',
  'Éducation & Vie sociale',
  'Arts, EPS & Activité manuelle',
  'Remédiation',
  'Langues',
];

const GENERAL_MODELE_FICHES: ModeleFicheAPC[] = [
  {
    id: 'modele-mathematiques',
    nom: 'Mathématiques',
    sousLabel: 'Calcul, numération & manipulation concrète',
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Séance structurée autour d’une situation-problème concrète, d’une manipulation active, d’une schématisation et d’un transfert évaluatif.',
    competenceDeBaseModele:
      'CB1 (Mathématiques) — Résoudre des problèmes arithmétiques ou géométriques en mobilisant le calcul réfléchi et la manipulation.',
    competenceViseeModele:
      'Comprendre et appliquer une procédure mathématique en justifiant sa démarche à l’oral et par le schéma.',
    titreSuggere: 'Résoudre un problème numérique par la manipulation et le schéma',
    themeSuggere: 'Nombres, calculs et résolution de problèmes concrets',
    objectifsSpecifiques: [
      'Modéliser une situation concrète à l’aide d’un matériel ou d’un schéma en barres.',
      'Effectuer le calcul adapté en verbalisant chaque étape.',
      'Vérifier la vraisemblance du résultat obtenu.',
    ],
    prerequis: [
      'Maîtriser la numération de position et les faits numériques de base.',
    ],
    materielSuggere: [
      'Jetons, cubes emboîtables ou bandes-unités',
      'Ardoises effaçables et feutres',
      'Fiche de recherche à grands carreaux',
    ],
    introduction: {
      accroche:
        'Présentation d’un défi concret issu de la vie quotidienne de la classe nécessitant un calcul précis.',
      miseEnSituation:
        'Les élèves reformulent ce qu’on cherche avec leurs propres mots avant de toucher le matériel.',
      consigneDepart:
        'Représentez la situation avec le matériel ou un schéma sur votre ardoise, puis trouvez la solution.',
    },
    includeManipulable: true,
    manipulableType: 'fractions',
    etapes: [
      {
        etape: '1. Éveil mathématique & Calcul rapide',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Qui peut résoudre ces 4 calculs flash sur ardoise en utilisant un complément à 10 ou un double ?\nQ2 : Quelle astuce mentale as-tu choisie pour aller vite ?\n• Valide les procédés PLM et fait verbaliser la stratégie.',
        activitesEleves:
          'R1 : Écrivent les réponses simultanément sur l’ardoise et lèvent au signal.\nR2 : Expliquent à voix haute leur décomposition (« J’ai d’abord complété à 10, puis ajouté le reste »).',
        indicateursInclusifs:
          '• Réactivation réussie des faits numériques de base.\n[Inclusion handicap] DYS/Dyscalculie/TSA : bande numérique individuelle, tables de repères autorisées et temps de réponse allongé.',
      },
      {
        etape: '2. Situation-problème déclenchante',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          '• Lit l’énoncé à voix posée et affiche les données clés en couleur.\nQ1 : De quoi parle l’histoire et quelles grandeurs ou quantités connaît-on déjà ?\nQ2 : Que cherche-t-on exactement et quel ordre de grandeur estimez-vous ?',
        activitesEleves:
          'R1 : Repèrent les données utiles et reformulent l’énoncé sans lire mot à mot.\nR2 : Formulent une première estimation raisonnable avant de toucher au matériel.',
        indicateursInclusifs:
          '• Reformulation exacte du but du problème.\n[Inclusion handicap] Visuel/Auditif/DYS : énoncé épuré police sans empattement, mots-clés surlignés et lecture orale face classe.',
      },
      {
        etape: '3. Manipulation & Recherche guidée',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Comment représenter la situation avec vos jetons, cubes ou bandes-unités ?\nQ2 : Quel schéma en barres traduit votre manipulation avant de poser l’opération ?\n• Accompagne les binômes sans donner la réponse.',
        activitesEleves:
          'R1 : Manipulent les jetons/bandes pour modéliser les parts ou les ajouts.\nR2 : Tracent un schéma annoté avec un « ? » puis écrivent l’égalité mathématique correspondante.',
        indicateursInclusifs:
          '• Adéquation entre manipulation, schéma et calcul.\n[Inclusion handicap] Moteur/Visuel/DYS : binômes complémentaires, matériel tactile en relief et simulateur manipulable interactif sur écran.',
      },
      {
        etape: '4. Mise en commun & Structuration',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '9 min',
        activitesMaitre:
          'Q1 : En comparant ces deux procédures au tableau, laquelle est la plus rapide et la plus sûre ?\nQ2 : Quelle règle générale pouvons-nous encadrer pour réussir tous les problèmes de ce type ?',
        activitesEleves:
          'R1 : Expliquent leur démarche, repèrent les erreurs éventuelles et valident la procédure experte.\nR2 : Complètent l’encadré mémo avec le schéma type et l’unité attendue.',
        indicateursInclusifs:
          '• Formalisation claire de la procédure experte.\n[Inclusion handicap] DYS/TSA : mémo visuel étape par étape avec exemple résolu en couleurs et carte-méthode.',
      },
      {
        etape: '5. Entraînement différencié & Bilan',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Quelle opération choisissez-vous pour ces deux mini-problèmes gradués ?\nQ2 : Comment vérifier que votre réponse est vraisemblable avec la bonne unité ?',
        activitesEleves:
          'R1 : Résolvent l’exercice adapté en autonomie en traçant d’abord le mini-schéma.\nR2 : Contrôlent l’ordre de grandeur, l’unité et cochent leur grille d’auto-vérification.',
        indicateursInclusifs:
          '• Réussite autonome sur le palier adapté.\n[Inclusion handicap] Dyscalculie/Moteur : quantité allégée, schéma pré-amorcé, calculatrice de vérification ou réponse orale.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment représenter la situation par un schéma avant de calculer ?',
        reponseAttendue: 'En dessinant les quantités connues sous forme de barres ou paquets et en marquant par un « ? » ce que l’on cherche.',
        indicePedagogique: 'Utilise des barres ou des paquets pour montrer les parts égales, les écarts ou les ajouts.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment vérifier si ta réponse est logique par rapport à l’énoncé ?',
        reponseAttendue: 'En comparant l’ordre de grandeur du résultat avec l’estimation de départ et en vérifiant l’unité attendue.',
        indicePedagogique: 'Relis uniquement la question finale et vérifie que ton nombre a du sens.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Un élève trouve un résultat plus grand que le total initial alors qu’on cherchait une part. Comment prouver son erreur sans refaire le calcul ?',
        reponseAttendue: 'Une part ne peut pas dépasser le tout de départ ; sur le schéma en barres, le morceau doit être plus court que la barre totale.',
        indicePedagogique: 'Compare la taille de ta barre-réponse avec celle de la barre du total.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En mathématiques, je lis, je manipule ou je schématise, puis je calcule et je vérifie.',
      traceEcriteEleve: 'Méthode en 4 étapes : 1) Comprendre 2) Schématiser 3) Calculer 4) Vérifier l’unité.',
      motsCles: ['Manipulation', 'Schéma', 'Calcul', 'Vérification'],
      prolongement: 'Proposer aux élèves de créer un énoncé similaire pour leurs camarades.',
    },
  },
  {
    id: 'modele-fr-manipule-phrases-1',
    nom: 'Français — Je manipule les phrases 1',
    sousLabel: 'Structuration de la phrase simple (sujet, verbe, sens)',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CE1',
    dureeParDefaut: '40 min',
    description:
      'Modèle dédié à la découverte de l’architecture de la phrase : ordre des mots, majuscule/point, repérage du verbe et du groupe sujet par étiquettes mobiles.',
    competenceDeBaseModele:
      'CB1 (Français — Grammaire) — Identifier la phrase simple, en vérifier le sens et repérer les constituants essentiels par manipulation.',
    competenceViseeModele:
      'Construire, segmenter et transformer une phrase syntaxiquement correcte à l’aide d’étiquettes-mots.',
    titreSuggere: 'Je manipule les phrases 1 : construire et repérer la phrase simple',
    themeSuggere: 'Grammaire — Ordre des mots, ponctuation et noyau verbal',
    objectifsSpecifiques: [
      'Distinguer une suite de mots d’une phrase qui a du sens.',
      'Placer la majuscule et le point pour délimiter la phrase.',
      'Encadrer ou déplacer le groupe sujet et le verbe conjugué.',
    ],
    prerequis: [
      'Savoir lire des mots usuels et reconnaître un point et une majuscule.',
    ],
    materielSuggere: [
      'Bandes et étiquettes-mots plastifiées (couleurs par nature grammaticale)',
      'Pochettes transparentes et feutres effaçables',
      'Cahier d’essai ou ardoise',
    ],
    introduction: {
      accroche:
        'Un message mélangé est arrivé en classe (« mange / pomme / une / Le / garçon / petit ») : comment le réparer pour qu’on le comprenne ?',
      miseEnSituation:
        'Les élèves écoutent deux suites de mots lues par l’enseignant et lèvent la main uniquement lorsque la phrase veut dire quelque chose.',
      consigneDepart:
        'Manipulez les étiquettes pour remettre la phrase en ordre et placez les cartes Majuscule et Point.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Mise en train — Phrase ou non-phrase ?',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Écoutez ces 4 suites de mots : lesquelles sont de vraies phrases qui veulent dire quelque chose ?\nQ2 : Qu’est-ce qui manque à celles qui ne fonctionnent pas ?',
        activitesEleves:
          'R1 : Lèvent ou baissent le pouce pour valider le sens de chaque énoncé.\nR2 : Justifient à l’oral (« Les mots sont dans le désordre / il manque une action »).',
        indicateursInclusifs:
          '• Discrimination orale claire phrase / non-phrase.\n[Inclusion handicap] Auditif/Visuel/TSA : appui visuel au tableau avec pictogrammes « Sens OK », « Majuscule » et « Point ».',
      },
      {
        etape: '2. Découverte avec étiquettes mobiles',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Comment remettre ces étiquettes mélangées dans l’ordre pour former une phrase juste ?\nQ2 : Quelle carte placer tout au début et tout à la fin ?',
        activitesEleves:
          'R1 : Testent des assemblages en binôme et lisent à voix haute pour vérifier le sens.\nR2 : Placent l’étiquette Majuscule au début et la carte Point à la fin.',
        indicateursInclusifs:
          '• Construction syntaxique manipulatoire correcte.\n[Inclusion handicap] DYS/Moteur/Visuel : étiquettes grand format avec code couleur stable (bleu = sujet, rouge = verbe).',
      },
      {
        etape: '3. Manipulation active : substituer et déplacer',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '13 min',
        activitesMaitre:
          'Q1 : Si on remplace l’étiquette bleue « Le garçon » par « Les filles », quel autre mot bouge ou change à l’oreille ?\nQ2 : Peut-on remplacer le verbe rouge pour changer l’action ?',
        activitesEleves:
          'R1 : Substituent les étiquettes sujet/verbe et écoutent la nouvelle phrase à voix haute.\nR2 : Encadrent « C’est … qui » pour confirmer qui fait l’action.',
        indicateursInclusifs:
          '• Repérage du sujet et du verbe par substitution.\n[Inclusion handicap] DYS/Auditif : lecture systématique à voix haute avant tout écrit ; étiquettes aimantées ou cartonnées.',
      },
      {
        etape: '4. Synthèse & Règle de la phrase',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Quels sont les 3 indices indispensables pour reconnaître et construire une phrase ?\nQ2 : Comment relier ces indices sur notre affiche-repère ?',
        activitesEleves:
          'R1 : Énoncent : 1) Du sens 2) Une majuscule 3) Un point.\nR2 : Complètent la phrase-modèle et surlignent en couleur le début et la fin.',
        indicateursInclusifs:
          '• Formulation claire des 3 critères.\n[Inclusion handicap] DYS/TSA : carte mentale courte à 3 icônes collée dans le cahier mémo.',
      },
      {
        etape: '5. Réinvestissement & Validation',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Quels mots remettre en ordre pour réparer ces deux phrases ?\nQ2 : Vérifiez avec vos 3 doigts : sens, majuscule, point — tout y est ?',
        activitesEleves:
          'R1 : Reconstituent puis écrivent ou collent une phrase complète correcte.\nR2 : Auto-valident leurs 3 critères avant le bilan final.',
        indicateursInclusifs:
          '• Production autonome d’une phrase simple correcte.\n[Inclusion handicap] Moteur/DYS : collage des étiquettes ou saisie vocale acceptée en cas de trouble graphomoteur.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quels sont les trois indices pour savoir si une suite de mots est une vraie phrase ?',
        reponseAttendue: 'Elle a du sens, elle commence par une majuscule et se termine par un point.',
        indicePedagogique: 'Regarde le tout début, la toute fin et lis à voix haute dans ta tête.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Si je change qui fait l’action (« Le chat » devient « Les chats »), que se passe-t-il ?',
        reponseAttendue: 'Le verbe s’adapte au pluriel pour que la phrase reste correcte.',
        indicePedagogique: 'Écoute attentivement la phrase à l’oral avec « ils ».',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Dans « Au marché achète des fruits maman », pourquoi cette suite n’est-elle pas correcte et comment la réparer ?',
        reponseAttendue: 'Les mots ne sont pas dans un ordre grammatical clair : « Maman achète des fruits au marché. » (avec majuscule et point).',
        indicePedagogique: 'Commence par chercher qui fait l’action (le sujet), puis l’action (le verbe).',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Une phrase raconte une idée qui a du sens, commence par une majuscule et finit par un point.',
      traceEcriteEleve: 'Ma check-list phrase : [Majuscule] + [Mots dans l’ordre qui ont du sens] + [Point . ! ?].',
      motsCles: ['Phrase', 'Majuscule', 'Point', 'Sens', 'Manipulation'],
      prolongement: 'Jeu du cadavre exquis grammatical avec cartes sujet / verbe / lieu.',
    },
  },
  {
    id: 'modele-fr-apprends-a-lire',
    nom: 'Français — J’apprends à lire',
    sousLabel: 'Déchiffrage, combinatoire, fluence & compréhension',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CP',
    dureeParDefaut: '35 min',
    description:
      'Séance pas-à-pas combinant conscience phonologique, décodage syllabique, lecture fluide à voix haute et compréhension fine d’un court texte.',
    competenceDeBaseModele:
      'CB2 (Français — Lecture) — Décoder avec exactitude et fluidité des mots et phrases courtes pour en comprendre le sens.',
    competenceViseeModele:
      'Identifier le graphème cible, lire des syllabes puis des phrases avec intonation et répondre à des questions de sens.',
    titreSuggere: 'J’apprends à lire : décoder, fluidifier et comprendre',
    themeSuggere: 'Lecture — Combinatoire, fluence et compréhension explicite',
    objectifsSpecifiques: [
      'Associer correctement le son (phonème) et son écriture (graphème).',
      'Fusionner des syllabes pour lire des mots réguliers sans hésitation.',
      'Identifier les personnages et l’action principale d’un texte court.',
    ],
    prerequis: [
      'Connaître les voyelles simples et les consonnes déjà étudiées.',
    ],
    materielSuggere: [
      'Cartes sons / syllabes mobiles',
      'Texte court adapté (syllabes colorées / lettres muettes grisées)',
      'Règle de lecture ou cache-ligne',
    ],
    introduction: {
      accroche:
        'Boîte à devinettes sonores : 3 mots-images contenant le son du jour à reconnaître à l’oreille.',
      miseEnSituation:
        'Les élèves frappent les syllabes des mots trouvés et localisent la place du son cible.',
      consigneDepart:
        'Observez les syllabes qui défilent et assemblez-les pour lire vos premiers mots secrets.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Échauffement phonologique',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Dans quels mots entendons-nous le son cible aujourd’hui ?\nQ2 : Combien de syllabes frappez-vous et où se cache ce son (début, milieu, fin) ?',
        activitesEleves:
          'R1 : Discriminent à l’oreille et lèvent la carte-son dès qu’ils entendent le phonème.\nR2 : Frappent les syllabes dans les mains et localisent la syllabe contenant le son.',
        indicateursInclusifs:
          '• Discrimination auditive et segmentation syllabique exactes.\n[Inclusion handicap] Auditif/DYS/TSA : articulation exagérée face au groupe + geste Borel-Maisonny multisensoriel.',
      },
      {
        etape: '2. Découverte du graphème & Combinatoire',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Quelle lettre ou groupe de lettres écrit ce son sur notre mot-repère ?\nQ2 : Que lit-on quand on fait glisser la consonne vers la voyelle (« m…a → ma ») ?',
        activitesEleves:
          'R1 : Observent le graphème cible et son geste associé.\nR2 : Fusionnent et lisent les syllabes en chœur puis individuellement au rythme du pointeur.',
        indicateursInclusifs:
          '• Fusion syllabique fluide.\n[Inclusion handicap] Visuel/DYS : arcs syllabiques tracés sous les syllabes et police aérée corps 14+.',
      },
      {
        etape: '3. Lecture guidée de mots et phrases',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '10 min',
        activitesMaitre:
          'Q1 : En binôme avec votre cache-ligne, comment découper les mots nouveaux pour les déchiffrer sans deviner ?\nQ2 : Où reprend-on son souffle sur les points ?',
        activitesEleves:
          'R1 : Lisent à voix posée en découpant syllabe par syllabe sous le guidage du partenaire.\nR2 : Relisent les phrases en respectant les pauses de ponctuation.',
        indicateursInclusifs:
          '• Déchiffrage exact sans invention de fin de mot.\n[Inclusion handicap] DYS/Visuel/Moteur : syllabes bicolores, lettres muettes grisées et cache-ligne rigide.',
      },
      {
        etape: '4. Compréhension & Mise en mots',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Qui agit dans ce court texte et où se passe la scène ?\nQ2 : Quels mots exacts du texte prouvent votre réponse ?',
        activitesEleves:
          'R1 : Reformulent l’idée du texte avec leurs propres mots.\nR2 : Pointent et surlignent l’indice précis dans la phrase lue.',
        indicateursInclusifs:
          '• Prélèvement d’indices explicites dans le texte.\n[Inclusion handicap] TSA/DYS/Auditif : support illustré et questions à choix guidés pour les petits décodeurs.',
      },
      {
        etape: '5. Défi fluence & Bilan individuel',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '6 min',
        activitesMaitre:
          'Q1 : En 30 secondes de lecture tranquille, jusqu’à quel mot arrivez-vous avec justesse ?\nQ2 : Quel mot difficile de tout à l’heure savez-vous maintenant lire du premier coup ?',
        activitesEleves:
          'R1 : Relisent le passage ciblé avec plus d’aisance qu’au premier essai.\nR2 : Entourent leur progrès sur la jauge personnelle et partagent un mot réussi.',
        indicateursInclusifs:
          '• Amélioration mesurée par rapport à son propre essai.\n[Inclusion handicap] Zéro compétition anxiogène ; lecture en duo ou chuchotée autorisée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment faire quand je bloque sur un mot un peu long ?',
        reponseAttendue: 'Je découpe le mot syllabe par syllabe avec mon doigt, puis je relis le mot entier.',
        indicePedagogique: 'Cache la fin du mot avec ton doigt pour ne voir qu’une syllabe à la fois.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment montrer dans le texte que ma réponse est juste ?',
        reponseAttendue: 'En pointant et en surlignant la phrase précise qui donne l’information.',
        indicePedagogique: 'Cherche le nom du personnage ou le mot de la question dans le texte.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi les lettres grises à la fin de certains mots ne se prononcent-elles pas mais restent importantes ?',
        reponseAttendue: 'Ce sont des lettres muettes (souvent de famille ou de pluriel comme -s, -t, -d) qui aident à comprendre le sens et l’orthographe.',
        indicePedagogique: 'Pense à « grand » / « grande » ou à « un chat » / « des chats ».',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Pour bien lire, j’assemble les syllabes, je respecte les points et je vérifie que j’ai compris.',
      traceEcriteEleve: 'Mot-repère du jour + 4 syllabes clés lues avec fluidité.',
      motsCles: ['Phonème', 'Syllabe', 'Fluence', 'Compréhension'],
      prolongement: 'Relecture du court texte à la maison avec un adulte en 2 minutes.',
    },
  },
  {
    id: 'modele-fr-sais-ecrire-mots',
    nom: 'Français — Je sais écrire les mots',
    sousLabel: 'Orthographe lexicale, encodage & mémorisation active',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CE1',
    dureeParDefaut: '40 min',
    description:
      'Modèle structuré pour maîtriser l’orthographe des mots : analyse des régularités graphophonologiques, mémorisation visuelle/motrice et dictée flash.',
    competenceDeBaseModele:
      'CB3 (Français — Orthographe) — Encoder des mots réguliers et mémoriser l’orthographe des mots fréquents ou invariants.',
    competenceViseeModele:
      'Écrire sans erreur les mots étudiés en s’appuyant sur les sons, les familles de mots et les lettres muettes.',
    titreSuggere: 'Je sais écrire les mots : observer, mémoriser et orthographier',
    themeSuggere: 'Orthographe lexicale et stratégies d’encodage',
    objectifsSpecifiques: [
      'Segmenter un mot en syllabes et en sons pour l’encoder.',
      'Repérer les difficultés orthographiques (lettres muettes, doubles consonnes, accents).',
      'Réutiliser les mots mémorisés dans une courte dictée.',
    ],
    prerequis: [
      'Maîtriser les correspondances graphophonologiques simples.',
    ],
    materielSuggere: [
      'Cartes-mots avec difficultés surlignées',
      'Ardoises effaçables et cache-mots',
      'Répertoire orthographique personnel',
    ],
    introduction: {
      accroche:
        'Jeu du « détective orthographique » : observer 4 mots affichés 10 secondes et repérer le piège caché dans chacun.',
      miseEnSituation:
        'Les élèves identifient pourquoi un mot ne s’écrit pas exactement comme il se prononce (lettre muette finale, famille de mots).',
      consigneDepart:
        'Observez attentivement le mot modèle, photographiez ses pièges dans votre tête, puis écrivez-le sans modèle.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Réactivation des sons et syllabes',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quelles lettres écrivent ces 3 syllabes ou mots simples dictés sur ardoise ?\nQ2 : Quels sons entendons-nous exactement dans chaque syllabe ?',
        activitesEleves:
          'R1 : Encodent rapidement à l’ardoise et lèvent simultanément pour contrôle.\nR2 : Énoncent la suite des sons et corrigent aussitôt si besoin.',
        indicateursInclusifs:
          '• Encodage phonologique fiable sur mots simples.\n[Inclusion handicap] DYS/Auditif/Visuel : tableau des sons complexes affiché en repère visuel permanent.',
      },
      {
        etape: '2. Observation guidée des mots cibles',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Dans ces 5 mots cibles, quelles lettres s’entendent et quelle lettre est un « piège » (muette ou son complexe) ?\nQ2 : Quel mot de la même famille aide à retenir la lettre muette ?',
        activitesEleves:
          'R1 : Épellent chaque mot, tracent les syllabes et entourent la difficulté en couleur.\nR2 : Justifient oralement la lettre muette (ex. « grand → grande »).',
        indicateursInclusifs:
          '• Analyse morphologique et graphémique explicite.\n[Inclusion handicap] Kinesthésique/DYS/TSA : verbalisation à voix haute + écriture en l’air du mot complet.',
      },
      {
        etape: '3. Entraînement actif « Regarder - Cacher - Écrire »',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '12 min',
        activitesMaitre:
          'Q1 : Après 5 secondes d’observation, pouvez-vous écrire le mot de mémoire sans modèle ?\nQ2 : Lettre par lettre, votre mot est-il identique au modèle affiché ensuite ?',
        activitesEleves:
          'R1 : Observent, cachent le modèle, écrivent le mot d’un seul jet sur ardoise.\nR2 : Comparent immédiatement avec le modèle et réécrivent en entier si erreur.',
        indicateursInclusifs:
          '• Mémorisation orthographique active sans copie servile.\n[Inclusion handicap] TDAH/DYS/Moteur : vagues courtes de 2 à 3 mots ; étiquettes de lettres autorisées.',
      },
      {
        etape: '4. Classement & Règle de mémorisation',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Dans quelle famille ranger chaque mot (invariables, familles, doubles consonnes) ?\nQ2 : Quelle astuce mémo retenez-vous pour le mot le plus difficile ?',
        activitesEleves:
          'R1 : Classent les mots dans le tableau collectif.\nR2 : Recopient les mots réussis dans leur répertoire avec un code couleur sur la difficulté.',
        indicateursInclusifs:
          '• Organisation structurée dans le répertoire personnel.\n[Inclusion handicap] Visuel/Moteur : modèle ligné agrandi et étiquettes autocollantes disponibles.',
      },
      {
        etape: '5. Dictée flash en contexte',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Écoutez ces deux courtes phrases contenant nos mots du jour : comment les écrire avec majuscule et point ?\nQ2 : En pointant chaque mot étudié, vérifiez vos lettres pièges !',
        activitesEleves:
          'R1 : Écrivent sous la dictée à rythme posé.\nR2 : Relisent avec le doigt sous chaque mot cible pour vérifier lettres muettes et accents.',
        indicateursInclusifs:
          '• Orthographe correcte des mots cibles en phrase.\n[Inclusion handicap] Moteur/DYS : texte à trous proposé en aménagement ou dictée vocale.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment retrouver la lettre muette à la fin d’un mot comme « grand » ou « chat » ?',
        reponseAttendue: 'En cherchant un mot de la même famille au féminin ou un dérivé (grande, chaton).',
        indicePedagogique: 'Transforme le mot au féminin ou cherche un petit mot de la même famille.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Que faire après avoir écrit un mot sous la dictée pour éviter les fautes d’étourderie ?',
        reponseAttendue: 'Relire le mot syllabe par syllabe en vérifiant qu’aucun son ni lettre muette ne manque.',
        indicePedagogique: 'Relis lentement en posant la pointe de ton crayon sous chaque syllabe écrite.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi faut-il toujours cacher le modèle avant d’écrire un mot qu’on apprend ?',
        reponseAttendue: 'Pour obliger le cerveau à photographier le mot entier en mémoire plutôt que de copier lettre par lettre.',
        indicePedagogique: 'Rappelle-toi les 3 temps : Regarder → Cacher → Écrire d’un coup.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Pour savoir écrire un mot, j’écoute ses syllabes, je cherche sa famille et je retiens sa lettre piège.',
      traceEcriteEleve: 'Méthode R-C-É : Regarder · Cacher · Écrire et Comparer.',
      motsCles: ['Encodage', 'Famille de mots', 'Lettre muette', 'Dictée'],
      prolongement: 'Réutilisation des mots mémorisés dans une phrase personnelle libre.',
    },
  },
  {
    id: 'modele-fr-produis-texte',
    nom: 'Français — Je produis un texte',
    sousLabel: 'Planification, rédaction guidée & révision',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CE2',
    dureeParDefaut: '45 min',
    description:
      'Atelier complet de production d’écrit : analyse de la consigne, recherche d’idées avec boîte à mots, rédaction accompagnée et relecture critériée.',
    competenceDeBaseModele:
      'CB4 (Français — Production d’écrit) — Planifier, rédiger et réviser un court texte cohérent répondant à une situation de communication.',
    competenceViseeModele:
      'Produire un texte structuré de 4 à 6 phrases en respectant le thème, les connecteurs et la ponctuation.',
    titreSuggere: 'Je produis un texte : planifier, rédiger et améliorer mon écrit',
    themeSuggere: 'Production d’écrit — Cohérence narrative et révision guidée',
    objectifsSpecifiques: [
      'Dégager les idées principales avant de rédiger grâce à une carte d’idées.',
      'Utiliser une boîte à mots et des connecteurs temporels (d’abord, ensuite, enfin).',
      'Relire et corriger son texte avec une grille simple.',
    ],
    prerequis: [
      'Savoir rédiger une phrase simple correcte avec majuscule et point.',
    ],
    materielSuggere: [
      'Affiche « Boîte à mots » thématique (noms, verbes, connecteurs)',
      'Trame de planification en 3 cases',
      'Grille de relecture couleur',
    ],
    introduction: {
      accroche:
        'Découverte d’une image séquentielle ou d’un début de récit interrompu : quelle suite pouvons-nous inventer ?',
      miseEnSituation:
        'Échange oral rapide pour faire émerger qui parle, où se passe la scène et ce qui arrive.',
      consigneDepart:
        'Complétez d’abord vos 3 idées dans la grille, puis rédigez votre texte en piochant dans la boîte à mots.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Découverte de la consigne & Analyse d’un modèle',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '6 min',
        activitesMaitre:
          'Q1 : En écoutant ce court texte modèle, comment l’auteur montre-t-il le début, le problème puis la fin ?\nQ2 : Quels mots annoncent la suite des actions ?',
        activitesEleves:
          'R1 : Repèrent les 3 moments du récit.\nR2 : Relèvent les connecteurs temporels (« D’abord, soudain, enfin »).',
        indicateursInclusifs:
          '• Repérage de la structure du texte attendu.\n[Inclusion handicap] DYS/Visuel/TSA : connecteurs surlignés en couleurs contrastées sur le modèle affiché.',
      },
      {
        etape: '2. Planification orale & Boîte à mots',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Quels mots utiles (personnages, verbes d’action, adjectifs) devons-nous placer dans notre boîte à mots ?\nQ2 : Que notez-vous dans vos 3 cases Début / Milieu / Fin avant de rédiger ?',
        activitesEleves:
          'R1 : Enrichissent collectivement la boîte à mots au tableau.\nR2 : Planifient leurs 3 idées clés en mots ou petits croquis dans la trame.',
        indicateursInclusifs:
          '• Planification effective avant la rédaction.\n[Inclusion handicap] TSA/DYS/Moteur : trame visuelle à pictogrammes et dictée à l’adulte ou vocale possible pour amorcer.',
      },
      {
        etape: '3. Rédaction guidée du premier jet',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '16 min',
        activitesMaitre:
          'Q1 : Dis-moi d’abord ta phrase à l’oral : a-t-elle du sens ?\nQ2 : Où peux-tu trouver l’orthographe de ce mot difficile ?',
        activitesEleves:
          'R1 : Formulent oralement leur phrase avant de l’écrire en sautant une ligne.\nR2 : Piochent dans la boîte à mots pour enrichir leur récit sans bloquer sur l’orthographe.',
        indicateursInclusifs:
          '• Cohérence et enchaînement des phrases produites.\n[Inclusion handicap] DYS/Moteur/TDAH : longueur graduée (2–3 phrases étayées ou 5–6 autonomes), interligne double.',
      },
      {
        etape: '4. Révision & Amélioration ciblée',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '8 min',
        activitesMaitre:
          'Q1 : En utilisant votre grille à 3 critères, toutes vos phrases ont-elles majuscule et point ?\nQ2 : Quelle phrase pouvez-vous améliorer avec un connecteur ou un adjectif ?',
        activitesEleves:
          'R1 : Relisent à mi-voix pour vérifier ponctuation et oublis.\nR2 : Remplacent une répétition ou ajoutent un mot précis sur la ligne sautée.',
        indicateursInclusifs:
          '• Révision autonome à l’aide de la grille.\n[Inclusion handicap] TDAH/DYS : grille limitée à 3 critères visuels clairs, règle de lecture recommandée.',
      },
      {
        etape: '5. Partage & Valorisation',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Qui souhaite partager sa production devant le groupe ?\nQ2 : Quel passage ou mot choisi vous a particulièrement plu chez votre camarade ?',
        activitesEleves:
          'R1 : Lisent leur texte avec expressivité.\nR2 : Formulent un retour positif précis sur les idées ou connecteurs utilisés.',
        indicateursInclusifs:
          '• Prise de parole valorisée et écoute bienveillante.\n[Inclusion handicap] Auditif/DYS/TSA : droit au joker ou lecture partagée/accompagnée par l’enseignant.',
      },
    ],
    questionsReponses: [
      {
        question: 'Pourquoi préparer une trame et une boîte à mots avant d’écrire ?',
        reponseAttendue: 'Pour avoir déjà ses idées et son vocabulaire prêts, et se concentrer sur les phrases.',
        indicePedagogique: 'Pense à un cuisinier qui sort tous ses ingrédients avant de commencer.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment éviter de répéter toujours « et après… et après… » dans son texte ?',
        reponseAttendue: 'En utilisant des mots de liaison variés comme D’abord, Ensuite, Soudain, Finalement.',
        indicePedagogique: 'Regarde la colonne « Connecteurs » de la boîte à mots.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Lors de la relecture, comment repérer si une phrase est trop longue ou manque d’un point ?',
        reponseAttendue: 'En la lisant à mi-voix : dès que l’idée change et qu’on reprend son souffle, il faut vérifier s’il faut un point et une majuscule.',
        indicePedagogique: 'Lis ton texte comme si tu le racontais à quelqu’un qui ne le connaît pas.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Écrire un texte, c’est 1) Planifier ses idées, 2) Rédiger avec la boîte à mots, 3) Relire et améliorer.',
      traceEcriteEleve: 'Check-list d’auteur : Idées dans l’ordre · Connecteurs · Majuscules et points · Relecture.',
      motsCles: ['Planification', 'Rédaction', 'Connecteurs', 'Révision'],
      prolongement: 'Mise au propre illustrée pour le recueil de textes de la classe.',
    },
  },
  {
    id: 'modele-fr-manipule-phrases-2',
    nom: 'Français — Je manipule les phrases 2',
    sousLabel: 'Enrichissement, expansions, types de phrases & accords',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Approfondissement syntaxique : enrichir une phrase minimale (compléments, adjectifs), transformer la forme (négative, interrogative) et gérer les accords.',
    competenceDeBaseModele:
      'CB5 (Français — Syntaxe) — Enrichir, réduire et transformer des phrases en maîtrisant les accords dans le groupe nominal et sujet-verbe.',
    competenceViseeModele:
      'Manipuler des groupes de mots pour enrichir le sens d’une phrase et effectuer des transformations syntaxiques exactes.',
    titreSuggere: 'Je manipule les phrases 2 : enrichir, transformer et accorder',
    themeSuggere: 'Grammaire avancée — Expansions, formes de phrases et chaîne d’accords',
    objectifsSpecifiques: [
      'Distinguer les groupes indispensables des groupes déplaçables/supprimables.',
      'Enrichir un groupe nominal par des adjectifs ou compléments.',
      'Transformer une phrase affirmative en phrase négative ou interrogative en gardant les accords.',
    ],
    prerequis: [
      'Identifier le verbe conjugué et son sujet dans une phrase simple.',
    ],
    materielSuggere: [
      'Bandes de phrases découpables en groupes fonctionnels',
      'Cartes de transformation (« Ne… pas », « ? », « Pluriel »)',
      'Surligneurs de 3 couleurs',
    ],
    introduction: {
      accroche:
        'Comparaison entre une phrase « squelette » (« Le chien court. ») et une phrase enrichie (« Ce matin, le grand chien noir court joyeusement dans le parc. »).',
      miseEnSituation:
        'Les élèves testent quels morceaux on peut déplacer ou effacer sans casser la phrase.',
      consigneDepart:
        'Découpez la phrase en blocs, déplacez les compléments et enrichissez le nom sans oublier les accords.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Rappel — Réduire à la phrase minimale',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Dans cette longue phrase au tableau, quels morceaux peut-on supprimer tout en gardant une phrase juste ?\nQ2 : Quels sont les deux éléments impossibles à enlever ?',
        activitesEleves:
          'R1 : Replient ou retirent les bandes compléments déplaçables.\nR2 : Identifient le noyau Sujet + Verbe et vérifient la phrase minimale à l’oral.',
        indicateursInclusifs:
          '• Distinction nette entre noyau et expansions.\n[Inclusion handicap] DYS/Moteur/Kinesthésique : manipulation physique avec bandes pliables avant tout écrit.',
      },
      {
        etape: '2. Situation de transformation syntaxique',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Avec la carte « Négation », où place-t-on « ne » et « pas » autour de l’action ?\nQ2 : Si on passe le sujet au pluriel, quels autres mots de la phrase doivent s’accorder ?',
        activitesEleves:
          'R1 : Enserrent le verbe conjugué avec les deux lunettes de la négation.\nR2 : Anticipent à l’oral puis montrent les marques d’accords muettes (-s, -x, -nt).',
        indicateursInclusifs:
          '• Anticipation orale des transformations.\n[Inclusion handicap] Visuel/DYS/Auditif : lunettes de la négation matérialisées en couleur autour du verbe.',
      },
      {
        etape: '3. Atelier de manipulation en groupes de mots',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Comment enrichir ce groupe nominal avec un adjectif ou un complément ?\nQ2 : Tracez les flèches d’accord : qui commande la terminaison de l’adjectif puis celle du verbe ?',
        activitesEleves:
          'R1 : Insèrent des expansions et déplacent le complément circonstanciel en tête ou fin de phrase.\nR2 : Tracent les chaînes d’accords en couleur (déterminant → nom → adjectif ; sujet → verbe).',
        indicateursInclusifs:
          '• Chaîne d’accords complète et cohérente.\n[Inclusion handicap] DYS/Moteur/TSA : étiquettes de groupes fonctionnels et fléchage bicolore stable.',
      },
      {
        etape: '4. Synthèse sur les manipulations possibles',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Quelles sont les 4 manipulations du grammairien pour modifier une phrase ?\nQ2 : Quelle précaution prendre dès qu’on modifie un mot ?',
        activitesEleves:
          'R1 : Citer : Déplacer · Supprimer · Remplacer · Enrichir.\nR2 : Complètent le tableau mémo en vérifiant la chaîne d’accords.',
        indicateursInclusifs:
          '• Maîtrise des 4 opérations syntaxiques.\n[Inclusion handicap] Visuel/DYS : fiche-outil synthétique avec pictogrammes pour chaque opération.',
      },
      {
        etape: '5. Exercice d’application & Vérification',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Transformez cette phrase au pluriel et à la forme négative.\nQ2 : Entourez chaque terminaison modifiée pour prouver votre vérification.',
        activitesEleves:
          'R1 : Effectuent les deux transformations demandées en autonomie.\nR2 : Relient sujet/verbe et nom/adjectif avant de valider.',
        indicateursInclusifs:
          '• Exactitude des transformations et accords.\n[Inclusion handicap] DYS/Moteur : double interligne, phrases pré-segmentées ou choix multiples sur terminaisons.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment reconnaître un groupe complément que l’on peut déplacer dans la phrase ?',
        reponseAttendue: 'On peut le mettre au début ou à la fin de la phrase, ou le supprimer, sans que la phrase perde son sens.',
        indicePedagogique: 'Essaie de placer le morceau au tout début de ta phrase.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Quand je passe « Le petit oiseau chante » au pluriel, quels mots changent ?',
        reponseAttendue: 'Le déterminant (Les), l’adjectif (petits), le nom (oiseaux) et le verbe (chantent).',
        indicePedagogique: 'Vérifie à la fois le groupe du nom (avec -s/-x) et le verbe (avec -nt).',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Mets la phrase « Les enfants joyeux mangent une pomme rouge. » à la forme négative puis encadre le verbe.',
        reponseAttendue: '« Les enfants joyeux ne mangent pas une (ou de) pomme rouge. » Le verbe conjugué « mangent » est encadré par « ne … pas ».',
        indicePedagogique: 'Demande-toi quel mot porte la conjugaison et pose les lunettes « ne … pas » autour de lui.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'On peut enrichir et transformer une phrase par 4 manipulations en veillant toujours aux accords.',
      traceEcriteEleve: 'Les 4 outils du grammairien : Déplacer · Supprimer · Remplacer · Enrichir (+ flèches d’accords).',
      motsCles: ['Syntaxe', 'Enrichissement', 'Transformation', 'Accords'],
      prolongement: 'Défi d’écriture : transformer une phrase minimale en phrase descriptive très précise.',
    },
  },
  {
    id: 'modele-fr-apprends-a-ecrire',
    nom: 'Français — J’apprends à écrire',
    sousLabel: 'Geste graphique, calligraphie, posture & copie active',
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CP',
    dureeParDefaut: '30 min',
    description:
      'Séance ciblée sur la motricité fine, le tracé cursif fluide, le respect des interlignes et les stratégies de copie efficace sans erreur.',
    competenceDeBaseModele:
      'CB6 (Français — Écriture) — Maîtriser le geste graphique cursif, l’enchaînement des lettres et la copie lisible sur lignage.',
    competenceViseeModele:
      'Tracer avec aisance et régularité les lettres cibles et copier des mots/phrases sans erreur de forme ni d’orthographe.',
    titreSuggere: 'J’apprends à écrire : maîtriser le geste graphique et copier avec soin',
    themeSuggere: 'Graphisme, écriture cursive et copie active',
    objectifsSpecifiques: [
      'Adopter une posture corporelle et une tenue de crayon détendues.',
      'Respecter le sens du tracé, les points d’attaque et la hauteur des interlignes.',
      'Copier des mots par groupes de lettres plutôt que lettre par lettre.',
    ],
    prerequis: [
      'Identifier le haut, le bas, la ligne de base et le sens gauche-droite.',
    ],
    materielSuggere: [
      'Crayons ergonomiques ou guide-doigts si nécessaire',
      'Fiches plastifiées grand format (lignage coloré Terre/Herbe/Ciel)',
      'Cahier d’écriture adapté (Séyès 3 mm ou 2,5 mm)',
    ],
    introduction: {
      accroche:
        'Courte gymnastique des doigts (« le piano », « la pince », « les cercles du poignet ») pendant 2 minutes pour délier la main.',
      miseEnSituation:
        'Observation d’un tracé agrandi au tableau avec flèche de départ et trajet en couleur.',
      consigneDepart:
        'Suivez d’abord le trajet avec le doigt dans l’air puis sur la fiche plastifiée avant de passer au crayon.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Préparation motrice & Posture',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Vos deux pieds sont-ils bien posés au sol et votre main libre tient-elle le cahier ?\nQ2 : Montrez la pince détendue à 3 doigts avant de commencer.',
        activitesEleves:
          'R1 : Vérifient posture, inclinaison du cahier et appui du poignet.\nR2 : Réalisent la gymnastique des doigts (« piano, cercles du poignet ») avec le groupe.',
        indicateursInclusifs:
          '• Posture et tenue du crayon détendues.\n[Inclusion handicap] Moteur/Dyspraxie : guide-doigts ou crayon triangulaire épais et plan incliné si besoin.',
      },
      {
        etape: '2. Démonstration verbalisée du tracé',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '6 min',
        activitesMaitre:
          'Q1 : D’où part la flèche de départ et jusqu’à quelle ligne monte ou descend la lettre ?\nQ2 : Répétez avec moi les mots du geste (« je monte, je tourne à gauche, je descends tout droit »).',
        activitesEleves:
          'R1 : Repèrent le point d’attaque et les repères Terre/Herbe/Ciel.\nR2 : Tracent d’abord le geste dans l’air puis sur ardoise non lignée.',
        indicateursInclusifs:
          '• Sens de rotation et point d’attaque intégrés.\n[Inclusion handicap] Visuel/DYS/Auditif : lignage couleur contrasté (herbe verte, ciel bleu, terre marron) + verbalisation lente.',
      },
      {
        etape: '3. Entraînement progressif sur lignage',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Comment enchaîner deux lettres sans lever le crayon avant la lettre ronde ?\nQ2 : Où faut-il s’arrêter entre l’herbe et le ciel ?',
        activitesEleves:
          'R1 : Tracent des lettres isolées puis des syllabes en maintenant des liaisons fluides.\nR2 : Respectent calmement les hauteurs d’interlignes sans rechercher la vitesse.',
        indicateursInclusifs:
          '• Régularité et fluidité du ductus cursif.\n[Inclusion handicap] Moteur/Visuel/Gauchers : lignage élargi (3–4 mm) et modèles placés à gauche ET à droite.',
      },
      {
        etape: '4. Copie active en mémoire',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Pouvez-vous photographier toute la syllabe ou le petit mot dans votre tête avant d’écrire ?\nQ2 : Combien de fois avez-vous relevé les yeux pour copier ce mot ?',
        activitesEleves:
          'R1 : Lisent le mot entier, le mémorisent puis le copient sans découper lettre par lettre.\nR2 : Vérifient liaison et orthographe au terme du mot.',
        indicateursInclusifs:
          '• Copie par unités de sens (syllabes/mots).\n[Inclusion handicap] DYS/Visuel/Moteur : modèle rapproché juste au-dessus de la ligne pour limiter les sauts oculaires.',
      },
      {
        etape: '5. Auto-observation & Valorisation',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quelle lettre ou quel mot est le mieux formé sur votre ligne et pourquoi ?\nQ2 : Quel petit point améliorerons-nous demain ?',
        activitesEleves:
          'R1 : Entourent leur plus belle lettre ou mot réussi et justifient (taille, régularité).\nR2 : Accueillent le retour positif individuel.',
        indicateursInclusifs:
          '• Auto-évaluation lucide et positive.\n[Inclusion handicap] Moteur/TSA : valorisation de l’effort et de la propreté sans aucune pénalité liée à la lenteur.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment bien tenir son crayon pour ne pas avoir mal aux doigts ?',
        reponseAttendue: 'Le crayon repose sur le majeur, guidé sans crispation entre le pouce et l’index.',
        indicePedagogique: 'Vérifie que ton poignet reste posé sur la table et que tes doigts ne sont pas crispés.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Pourquoi faut-il copier mot par mot plutôt que lettre par lettre ?',
        reponseAttendue: 'On écrit plus vite, plus régulièrement et on retient mieux l’orthographe du mot.',
        indicePedagogique: 'Lis le mot en entier dans ta tête avant de poser la pointe du crayon.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Quand est-on obligé de lever le crayon au milieu d’un mot en écriture cursive ?',
        reponseAttendue: 'Juste avant les lettres rondes (a, d, g, o, q, c) et pour ajouter ensuite les points sur i/j et les barres des t ou accents.',
        indicePedagogique: 'Observe où commence une lettre ronde comme « a » ou « d » : en haut à droite !',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Pour bien écrire : bonne posture, bon sens de rotation, respect des interlignes et copie par mots.',
      traceEcriteEleve: 'Mes 3 secrets d’écriture : Main détendue · Bonne hauteur · Je copie le mot entier.',
      motsCles: ['Calligraphie', 'Interligne', 'Posture', 'Copie active'],
      prolongement: 'Illustration personnelle à côté de la phrase soigneusement recopiée.',
    },
  },
  {
    id: 'modele-sciences-humaines-1',
    nom: 'Sciences humaines 1',
    sousLabel: 'Histoire — Repères chronologiques & traces du passé',
    domaine: 'Sciences humaines',
    matiere: 'Sciences humaines',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Démarche historique en APC : lecture et comparaison de documents d’époque, construction d’une frise chronologique et compréhension des faits historiques.',
    competenceDeBaseModele:
      'CB1 (Sciences humaines 1 — Histoire) — Se repérer dans le temps long et analyser des sources documentaires simples pour expliquer un fait historique.',
    competenceViseeModele:
      'Situer un événement sur une frise chronologique et extraire des informations fiables à partir de documents historiques.',
    titreSuggere: 'Sciences humaines 1 : analyser des traces du passé et situer sur une frise',
    themeSuggere: 'Histoire — Repères temporels, sources et vie quotidienne d’autrefois',
    objectifsSpecifiques: [
      'Distinguer passé proche, passé lointain et présent sur une frise graduée.',
      'Prélever 3 informations précises dans un document iconographique ou un court texte historique.',
      'Restituer à l’oral l’évolution constatée entre deux époques.',
    ],
    prerequis: [
      'Connaître les grandes unités de mesure du temps (année, décennie, siècle).',
    ],
    materielSuggere: [
      'Frise chronologique murale et bandes individuelles',
      'Dossier de 2 documents comparatifs (image d’archive + témoignage court)',
      'Fiches d’observation guidée',
    ],
    introduction: {
      accroche:
        'Observation de deux photographies ou gravures d’un même lieu à deux époques différentes : qu’est-ce qui a changé ?',
      miseEnSituation:
        'Recueil des hypothèses des élèves sur l’époque probable de chaque image.',
      consigneDepart:
        'Classez les documents du plus ancien au plus récent et relevez au moins deux indices de datation.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Réactivation des repères temporels',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Où placer ces 3 dates ou repères déjà connus sur la frise chronologique ?\nQ2 : Combien d’années compte un siècle et dans quel sens lit-on la flèche du temps ?',
        activitesEleves:
          'R1 : Positionnent les vignettes du plus ancien (à gauche) au plus récent (à droite).\nR2 : Rappellent les repères (année, décennie, siècle) et la flèche orientée.',
        indicateursInclusifs:
          '• Placement chronologique exact.\n[Inclusion handicap] DYS/Visuel/TSA : code couleur fixe par grande période sur toutes les frises et police lisible.',
      },
      {
        etape: '2. Confrontation documentaire initiale',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          '• Lit les sources à haute voix.\nQ1 : Quelle est la nature de chaque document (photo, gravure, témoignage) et sa date ?\nQ2 : Quelle grande différence saute aux yeux entre les deux époques ?',
        activitesEleves:
          'R1 : Identifient titre, auteur et date de chaque source.\nR2 : Formulent une première hypothèse historique à vérifier par l’enquête.',
        indicateursInclusifs:
          '• Identification correcte des sources historiques.\n[Inclusion handicap] DYS/Auditif/Visuel : textes lus à haute voix, description orale des gravures et mots-clés agrandis.',
      },
      {
        etape: '3. Enquête & Analyse en binômes',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Qui agit, où et comment vivaient les habitants selon le document 1 ?\nQ2 : Quels indices prouvent le changement ou la continuité dans le document 2 ?',
        activitesEleves:
          'R1 : Entourent les preuves précises sur les images/textes.\nR2 : Complètent le tableau comparatif Avant / Aujourd’hui en binôme.',
        indicateursInclusifs:
          '• Prélèvement d’au moins 3 indices prouvés.\n[Inclusion handicap] Moteur/DYS : étiquettes à coller et questions à choix guidés pour limiter la charge rédactionnelle.',
      },
      {
        etape: '4. Synthèse chronologique & Trace écrite',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Quelles preuves fiables retenons-nous pour répondre à la question de départ ?\nQ2 : Où coller le repère d’aujourd’hui sur la frise personnelle ?',
        activitesEleves:
          'R1 : Co-construisent la courte synthèse structurée avec dates et mots historiques clés.\nR2 : Placent la vignette datée au bon endroit de leur frise.',
        indicateursInclusifs:
          '• Trace écrite datée et exacte.\n[Inclusion handicap] Visuel/Moteur/DYS : frise à compléter avec vignettes déjà imprimées et encadré mémo.',
      },
      {
        etape: '5. Vérification & Ouverture',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Sur ces deux questions flash, quel document vous permet de prouver votre réponse ?\nQ2 : Qu’est-ce qui a le plus changé entre l’époque étudiée et la nôtre ?',
        activitesEleves:
          'R1 : Répondent individuellement en citant un indice tiré d’une source.\nR2 : Expliquent une évolution ou une trace encore visible aujourd’hui.',
        indicateursInclusifs:
          '• Justification par appui sur une source.\n[Inclusion handicap] DYS/Auditif/Moteur : validation orale ou par pointage sur document acceptée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Qu’est-ce qu’une source historique et à quoi sert-elle ?',
        reponseAttendue: 'C’est une trace laissée par le passé (objet, photo, texte) qui permet de prouver comment vivaient les gens.',
        indicePedagogique: 'Pense au travail d’un enquêteur qui cherche des preuves.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment placer correctement deux événements sur une frise chronologique ?',
        reponseAttendue: 'De gauche à droite, du plus ancien au plus récent, en respectant les intervalles de temps.',
        indicePedagogique: 'Compare d’abord les années ou les siècles avant de placer la flèche.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi l’historien préfère-t-il croiser deux documents différents (ex. une photo et un texte d’époque) plutôt qu’un seul ?',
        reponseAttendue: 'Pour vérifier que l’information est fiable, compléter les détails manquants et éviter de généraliser un point de vue unique.',
        indicePedagogique: 'Demande-toi si un seul témoin voit toujours toute la scène.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En Histoire, on s’appuie sur des traces et des dates précises pour comprendre les changements dans le temps.',
      traceEcriteEleve: 'Repère clé placé sur ma frise + 3 mots de vocabulaire historique expliqués.',
      motsCles: ['Chronologie', 'Source', 'Époque', 'Repère'],
      prolongement: 'Enquête auprès d’un membre de la famille sur un objet ou mode de vie d’autrefois.',
    },
  },
  {
    id: 'modele-sciences-humaines-2',
    nom: 'Sciences humaines 2',
    sousLabel: 'Géographie — Espaces, cartes, paysages & milieux de vie',
    domaine: 'Sciences humaines',
    matiere: 'Sciences humaines',
    niveauParDefaut: 'CM2',
    dureeParDefaut: '45 min',
    description:
      'Modèle géographique en APC : lecture de cartes et photographies de paysages, analyse des interactions humains/milieux et légende structurée.',
    competenceDeBaseModele:
      'CB2 (Sciences humaines 2 — Géographie) — Se repérer dans l’espace à différentes échelles et lire des cartes ou paysages pour comprendre l’organisation des territoires.',
    competenceViseeModele:
      'Lire une carte avec sa légende, décrire un paysage et expliquer comment les habitants aménagent leur espace.',
    titreSuggere: 'Sciences humaines 2 : lire l’espace, les paysages et les cartes',
    themeSuggere: 'Géographie — Paysages, mobilités, ressources et cartes à différentes échelles',
    objectifsSpecifiques: [
      'Identifier les éléments naturels et les aménagements humains sur un paysage.',
      'Utiliser l’orientation (rose des vents), l’échelle et la légende d’une carte.',
      'Réaliser un croquis simple avec une légende ordonnée.',
    ],
    prerequis: [
      'Connaître les 4 points cardinaux (Nord, Sud, Est, Ouest).',
    ],
    materielSuggere: [
      'Photographies de paysages et cartes géographiques couleur',
      'Calques ou fonds de carte simplifiés',
      'Crayons de couleur pour la légende',
    ],
    introduction: {
      accroche:
        'Zoom progressif du quartier/village vers le pays et le continent : où sommes-nous et que voit-on autour de nous ?',
      miseEnSituation:
        'Observation d’une photo aérienne ou d’un paysage contrasté pour nommer ce qui est naturel et ce qui a été construit.',
      consigneDepart:
        'Repérez sur la carte les axes principaux et classez les éléments du paysage en deux colonnes.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Repérage spatial rapide',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Vers où oriente-t-on le Nord sur la carte et où se trouvent les 3 autres points cardinaux ?\nQ2 : Où lit-on le titre et l’échelle de cette carte ?',
        activitesEleves:
          'R1 : Orientent leur carte en pointant Nord, Sud, Est et Ouest.\nR2 : Nomment deux repères connus et vérifient l’échelle graphique.',
        indicateursInclusifs:
          '• Orientation et lecture des repères cartographiques.\n[Inclusion handicap] Visuel/DYS/TSA : rose des vents permanente en couleurs contrastées.',
      },
      {
        etape: '2. Observation d’un paysage ou d’une carte',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Au premier plan, au second plan et à l’arrière-plan du paysage, que distingue-t-on ?\nQ2 : Quels éléments sont naturels et lesquels ont été aménagés par les humains ?',
        activitesEleves:
          'R1 : Décrivent les plans de l’image avec le vocabulaire géographique (relief, habitat, axe).\nR2 : Classent éléments naturels et aménagements humains en deux colonnes.',
        indicateursInclusifs:
          '• Description ordonnée par plans visuels.\n[Inclusion handicap] Visuel/DYS : description verbale détaillée + grille avec étiquettes-mots disponibles.',
      },
      {
        etape: '3. Cartographie & Légende guidée',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quels figurés (point, trait, zone) choisir pour les villes, les routes/fleuves et les reliefs ?\nQ2 : Comment regrouper ces figurés par rubriques claires dans la légende ?',
        activitesEleves:
          'R1 : Reportent les informations sur le fond de carte avec précision.\nR2 : Organisent la légende en catégories ordonnées et colorient proprement.',
        indicateursInclusifs:
          '• Cohérence exacte entre croquis et légende.\n[Inclusion handicap] Visuel/Moteur/Daltonisme : fonds contrastés, motifs/hachures en plus des couleurs, calque ou collage.',
      },
      {
        etape: '4. Mise en relation Homme / Territoire',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Quels atouts ou contraintes du milieu expliquent les aménagements observés ?\nQ2 : Quels mots résument le mieux la règle TOLE d’une carte ?',
        activitesEleves:
          'R1 : Formulent 2 liens entre relief/climat et activités humaines.\nR2 : Complètent le mémo TOLE (Titre · Orientation · Légende · Échelle).',
        indicateursInclusifs:
          '• Compréhension des interactions humains/milieux.\n[Inclusion handicap] DYS/TSA : schéma relationnel visuel « Atouts ↔ Aménagements ».',
      },
      {
        etape: '5. Quiz de lecture de carte',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '8 min',
        activitesMaitre:
          'Q1 : En suivant la rose des vents, dans quelle direction se situe ce repère par rapport à l’autre ?\nQ2 : Que signifie ce figuré sur la carte réalisée ?',
        activitesEleves:
          'R1 : Localisent avec la rose des vents et répondent avec précision.\nR2 : Lisent le sens du figuré directement grâce à leur légende.',
        indicateursInclusifs:
          '• Lecture autonome de carte et légende.\n[Inclusion handicap] Visuel/Auditif/DYS : lecture guidée des figurés et réponse orale ou par pointage acceptée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quels éléments sont indispensables sur toute carte géographique pour pouvoir la lire ?',
        reponseAttendue: 'Le titre, l’orientation (rose des vents/Nord), la légende et l’échelle.',
        indicePedagogique: 'Regarde dans les coins de la carte avant de lire ce qui est dessiné.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Quelle différence y a-t-il entre un figuré linéaire et un figuré de surface dans une légende ?',
        reponseAttendue: 'Le figuré linéaire représente un trajet (route, fleuve) et le figuré de surface colorie une zone (forêt, mer, ville).',
        indicePedagogique: 'Pense à la différence entre un trait et une zone coloriée.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi les villes importantes sont-elles souvent installées près d’un fleuve, d’une vallée ou d’un littoral ?',
        reponseAttendue: 'Parce que l’eau, les terres plates et les voies de transport facilitent la vie, l’agriculture et les échanges commerciaux.',
        indicePedagogique: 'Pense aux atouts d’un terrain plat proche de l’eau par rapport à une haute montagne escarpée.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'La géographie aide à lire les paysages et les cartes pour comprendre comment les humains habitent un territoire.',
      traceEcriteEleve: 'TOLE : Titre · Orientation · Légende · Échelle + croquis complété.',
      motsCles: ['Paysage', 'Carte', 'Légende', 'Échelle', 'Territoire'],
      prolongement: 'Repérer sur un plan du quartier le trajet entre l’école et un équipement public.',
    },
  },
  {
    id: 'modele-sciences-techno',
    nom: 'Sciences et Technologie',
    sousLabel: 'Démarche d’investigation, expérimentation & modélisation',
    domaine: 'Sciences & Technologie',
    matiere: 'Sciences et Technologie',
    niveauParDefaut: 'CM2',
    dureeParDefaut: '50 min',
    description:
      'Démarche scientifique complète : questionnement, formulation d’hypothèses, protocole expérimental, observation rigoureuse et conclusion scientifique.',
    competenceDeBaseModele:
      'CB1 (Sciences et Technologie) — Pratiquer une démarche d’investigation scientifique (observer, formuler des hypothèses, expérimenter, conclure).',
    competenceViseeModele:
      'Concevoir et mettre en œuvre une expérience simple ou analyser un objet technique pour valider une hypothèse.',
    titreSuggere: 'Sciences et Technologie : expérimenter pour vérifier une hypothèse',
    themeSuggere: 'Démarche d’investigation — Matière, vivant ou objet technique',
    objectifsSpecifiques: [
      'Formuler une question scientifique et une hypothèse testable.',
      'Suivre un protocole expérimental en ne faisant varier qu’un seul paramètre à la fois.',
      'Rédiger une conclusion objective à partir des observations.',
    ],
    prerequis: [
      'Savoir observer un phénomène et décrire ce que l’on voit sans interpréter trop vite.',
    ],
    materielSuggere: [
      'Matériel d’expérimentation sécurisé par îlot',
      'Cahier d’expériences (schéma d’observation)',
      'Fiche protocole avec pictogrammes de sécurité',
    ],
    introduction: {
      accroche:
        'Démonstration d’un phénomène intrigant ou dysfonctionnement d’un objet technique : pourquoi cela réagit-il ainsi ?',
      miseEnSituation:
        'Les élèves confrontent leurs représentations initiales et proposent des explications possibles.',
      consigneDepart:
        'Notez votre hypothèse (« Je pense que… ») puis dessinez le montage qui permettra de la tester.',
    },
    includeManipulable: true,
    manipulableType: 'balance_algebre',
    etapes: [
      {
        etape: '1. Situation étonnante & Question scientifique',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Que observez-vous exactement sans deviner trop vite la cause ?\nQ2 : Quelle question scientifique précise pouvons-nous écrire au tableau ?',
        activitesEleves:
          'R1 : Décrivent objectivement le phénomène ou le mécanisme observé.\nR2 : Formulent une question vérifiable par l’expérience.',
        indicateursInclusifs:
          '• Distinction fait observé / interprétation.\n[Inclusion handicap] Visuel/Auditif/DYS : observation rapprochée pour tous et vocabulaire illustré au tableau.',
      },
      {
        etape: '2. Hypothèses & Protocole expérimental',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Quelle est votre hypothèse (« Je pense que… parce que… ») ?\nQ2 : Comment préparer une expérience test et une expérience témoin en sécurité ?',
        activitesEleves:
          'R1 : Émettent leurs hypothèses à l’oral ou sur le cahier d’expériences.\nR2 : Choisissent le matériel et prévoient de ne modifier qu’un seul paramètre.',
        indicateursInclusifs:
          '• Protocole testable avec témoin prévu.\n[Inclusion handicap] DYS/TSA/Moteur : amorces de phrases écrites et fiche-protocole à pictogrammes de sécurité.',
      },
      {
        etape: '3. Expérimentation & Observation',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '17 min',
        activitesMaitre:
          'Q1 : Que mesurez-vous ou observez-vous entre le témoin et l’essai ?\nQ2 : Comment légender à la règle votre schéma d’observation ?',
        activitesEleves:
          'R1 : Réalisent le protocole en îlots, notent les mesures exactes.\nR2 : Dessinent au crayon le montage observé avec des traits de légende droits.',
        indicateursInclusifs:
          '• Manipulation rigoureuse et schéma légendé.\n[Inclusion handicap] Moteur/TSA/Visuel : rôles coopératifs répartis (manipulateur, observateur, secrétaire).',
      },
      {
        etape: '4. Interprétation & Conclusion scientifique',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Les résultats valident-ils ou réfutent-ils votre hypothèse de départ ?\nQ2 : Quelle conclusion scientifique objective pouvons-nous retenir ?',
        activitesEleves:
          'R1 : Comparent observation et hypothèse sans gêne si l’hypothèse était fausse.\nR2 : Rédigent ou complètent la règle scientifique validée.',
        indicateursInclusifs:
          '• Conclusion fondée sur les preuves.\n[Inclusion handicap] TSA/DYS : erreur d’hypothèse valorisée comme étape scientifique normale ; conclusion à trous.',
      },
      {
        etape: '5. Transfert technologique ou scientifique',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '7 min',
        activitesMaitre:
          'Q1 : D’après la loi découverte aujourd’hui, que va-t-il se passer dans ce nouveau cas ?\nQ2 : Quel mot scientifique justifie votre prédiction ?',
        activitesEleves:
          'R1 : Prédisent l’effet dans une situation inédite.\nR2 : Justifient leur réponse en mobilisant le lexique précis.',
        indicateursInclusifs:
          '• Transfert du principe scientifique.\n[Inclusion handicap] DYS/Moteur/Visuel : schéma à flécher ou QCM illustré accepté sans surcharge écrite.',
      },
    ],
    questionsReponses: [
      {
        question: 'Pourquoi faut-il garder une expérience « témoin » quand on fait un test ?',
        reponseAttendue: 'Pour pouvoir comparer et être sûr que le changement observé vient bien du seul paramètre modifié.',
        indicePedagogique: 'Imagine que tu changes deux choses en même temps : comment savoir laquelle a agi ?',
        difficulte: 'Fondamental',
      },
      {
        question: 'Que doit contenir un bon schéma d’expérience scientifique ?',
        reponseAttendue: 'Un dessin simple au crayon, des traits de légende à la règle et un titre clair.',
        indicePedagogique: 'Pense à nommer chaque élément dessiné avec des flèches droites.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Si ton hypothèse de départ est contredite par l’expérience, faut-il modifier tes résultats pour qu’elle ait l’air juste ?',
        reponseAttendue: 'Jamais : en sciences, on garde fidèlement les observations réelles et on révise l’hypothèse pour comprendre pourquoi.',
        indicePedagogique: 'Une expérience qui prouve qu’une idée était fausse fait tout autant avancer la science.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'La démarche scientifique suit 4 temps : Question → Hypothèse → Expérience et observation → Conclusion.',
      traceEcriteEleve: 'Ce que j’ai testé, ce que j’ai observé et la règle scientifique retenue.',
      motsCles: ['Hypothèse', 'Protocole', 'Témoin', 'Observation', 'Conclusion'],
      prolongement: 'Observer un objet ou phénomène similaire dans l’environnement proche.',
    },
  },
  {
    id: 'modele-education-sociale',
    nom: 'Éducation Sociale',
    sousLabel: 'Citoyenneté, droits, règles de vie & vivre-ensemble',
    domaine: 'Éducation & Vie sociale',
    matiere: 'Éducation Sociale',
    niveauParDefaut: 'CE2',
    dureeParDefaut: '40 min',
    description:
      'Séance participative autour d’un dilemme concret ou d’une situation sociale : analyse des points de vue, débat réglé, droits/devoirs et engagement collectif.',
    competenceDeBaseModele:
      'CB1 (Éducation Sociale) — Respecter les règles de la vie collective, exercer son esprit critique et coopérer de manière responsable.',
    competenceViseeModele:
      'Identifier les valeurs de respect, de solidarité et d’équité dans une situation de vie courante et proposer une attitude adaptée.',
    titreSuggere: 'Éducation Sociale : comprendre les règles, coopérer et respecter autrui',
    themeSuggere: 'Vivre-ensemble, citoyenneté, droits de l’enfant et médiation',
    objectifsSpecifiques: [
      'Reconnaître les besoins et émotions des différents acteurs d’une situation sociale.',
      'Distinguer un droit individuel d’une responsabilité envers le groupe.',
      'Participer à un débat réglé en écoutant la parole d’autrui.',
    ],
    prerequis: [
      'Connaître les règles élémentaires de prise de parole en classe.',
    ],
    materielSuggere: [
      'Cartes-scénarios ou courtes BD illustrant une situation de vie scolaire/sociale',
      'Bâton de parole pour le débat réglé',
      'Affiche charte de classe',
    ],
    introduction: {
      accroche:
        'Lecture ou jeu de rôle d’une courte situation problématique dans la cour ou le quartier.',
      miseEnSituation:
        'Les élèves identifient ce qui pose problème et ce que ressent chaque personne impliquée.',
      consigneDepart:
        'En petit groupe, proposez deux solutions respectueuses pour résoudre cette situation sans conflit.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Rappel des règles du débat bienveillant',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Quelles sont les 3 règles d’or pour débattre dans le respect de chacun ?\nQ2 : À qui confions-nous le bâton de parole aujourd’hui ?',
        activitesEleves:
          'R1 : Citer : écouter sans couper, critiquer une idée sans blesser la personne, demander la parole.\nR2 : Désignent le modérateur et préparent le bâton de parole.',
        indicateursInclusifs:
          '• Cadre d’écoute respectueux instauré.\n[Inclusion handicap] TSA/Auditif/DYS : supports pictogrammes des 3 règles et droit de s’exprimer via une carte-avis.',
      },
      {
        etape: '2. Situation-dilemme déclenchante',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Que se passe-t-il exactement dans cette situation sans prendre parti tout de suite ?\nQ2 : Que peut ressentir chacune des personnes impliquées ?',
        activitesEleves:
          'R1 : Décrivent objectivement les faits de la carte-scénario.\nR2 : Nomment les émotions et besoins de chaque personnage.',
        indicateursInclusifs:
          '• Analyse objective des faits et ressentis.\n[Inclusion handicap] TSA/Auditif/Visuel : cartes-émotions visuelles et lecture expressive de la BD ou scène.',
      },
      {
        etape: '3. Atelier de médiation & Recherche de solutions',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '13 min',
        activitesMaitre:
          'Q1 : Quelles conséquences aurait cette réaction brusque par rapport à une solution pacifique ?\nQ2 : Comment classer ces cartes-attitudes entre « Juste / Respectueux » et « Risqué / Injuste » ?',
        activitesEleves:
          'R1 : Testent par jeu de rôles les effets de chaque piste proposée.\nR2 : Classent les cartes-attitudes en sous-groupes et choisissent une solution équitable.',
        indicateursInclusifs:
          '• Propositions de résolution pacifique argumentées.\n[Inclusion handicap] DYS/Moteur/TSA : tri d’images et jeu de rôles guidé sans barrière écrite.',
      },
      {
        etape: '4. Mise en commun & Engagements collectifs',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Quel droit ou quelle valeur citoyenne protège la solution que vous avez choisie ?\nQ2 : Quel engagement positif (« Je m’engage à… ») écrivons-nous pour la classe ?',
        activitesEleves:
          'R1 : Relient l’action au respect, à la solidarité ou à l’équité.\nR2 : Co-rédigent la règle d’engagement positive sur l’affiche.',
        indicateursInclusifs:
          '• Formulation d’engagements concrets et positifs.\n[Inclusion handicap] Formulations positives courtes illustrées de pictogrammes affichées en classe.',
      },
      {
        etape: '5. Évaluation en situation & Bilan',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Dans ces deux nouveaux mini-cas, quelle conduite est responsable (carte Verte ou Rouge) ?\nQ2 : Comment expliquer votre choix avec la règle du jour ?',
        activitesEleves:
          'R1 : Lèvent simultanément la carte couleur adaptée.\nR2 : Justifient oralement en s’appuyant sur les droits et devoirs étudiés.',
        indicateursInclusifs:
          '• Prise de position citoyenne justifiée.\n[Inclusion handicap] Auditif/TSA/Moteur : vote simultané par cartes couleur sans exposition stressante.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quelle différence y a-t-il entre « vouloir tout décider seul » et « respecter les règles communes » ?',
        reponseAttendue: 'Les règles communes protègent les droits de chacun pour que tout le monde puisse vivre ensemble sereinement.',
        indicePedagogique: 'Demande-toi ce qui se passerait si personne ne respectait la même règle en même temps.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment réagir calmement face à un désaccord avec un camarade ?',
        reponseAttendue: 'Dire ce que l’on ressent avec « Je », écouter l’autre et chercher un compromis ou demander un médiateur.',
        indicePedagogique: 'Pense aux 3 étapes : Parler calme · Écouter · Trouver une solution à deux.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Un camarade en fauteuil ou malvoyant ne peut pas accéder à un jeu dans la cour. Que signifie « agir avec équité et inclusion » ?',
        reponseAttendue: 'Adapter les règles ou choisir un jeu où il peut participer pleinement au lieu de le laisser spectateur.',
        indicePedagogique: 'L’équité consiste à ajuster les conditions pour que chacun ait sa vraie place.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Vivre ensemble repose sur le respect mutuel, l’écoute, le partage des droits et le sens des responsabilités.',
      traceEcriteEleve: 'Notre engagement social : J’écoute, je respecte les différences et je cherche des solutions justes.',
      motsCles: ['Respect', 'Citoyenneté', 'Solidarité', 'Règles', 'Médiation'],
      prolongement: 'Mise en place de l’engagement retenu pendant une semaine dans la vie de classe.',
    },
  },
  {
    id: 'modele-eps',
    nom: 'Éducation Physique et Sportive',
    sousLabel: 'Motricité, coopération, règles de jeu & sécurité',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Éducation Physique et Sportive',
    niveauParDefaut: 'CE2',
    dureeParDefaut: '45 min',
    description:
      'Fiche de terrain EPS complète : échauffement progressif, atelier moteur guidé, situation ludique ou sportive évolutive, sécurité et retour au calme.',
    competenceDeBaseModele:
      'CB1 (EPS) — Adapter ses déplacements et actions motrices à des environnements variés tout en respectant les règles de sécurité et de fair-play.',
    competenceViseeModele:
      'Coordonner ses actions motrices avec précision et coopérer ou s’opposer loyalement dans le respect des règles du jeu.',
    titreSuggere: 'EPS : coordonner ses gestes moteurs et coopérer dans le respect des règles',
    themeSuggere: 'Motricité, jeux collectifs, adresse et fair-play',
    objectifsSpecifiques: [
      'Préparer son corps à l’effort par un échauffement articulaire et cardio-respiratoire.',
      'Améliorer la coordination, l’équilibre ou la précision du geste moteur visé.',
      'Respecter les limites du terrain, l’arbitrage et la sécurité des camarades.',
    ],
    prerequis: [
      'Tenue adaptée et connaissance du signal sonore d’arrêt immédiat.',
    ],
    materielSuggere: [
      'Plots, cerceaux, chasubles de 2 couleurs, ballons ou témoins',
      'Sifflet et chronomètre',
      'Fiches visuelles d’atelier plastifiées',
    ],
    introduction: {
      accroche:
        'Présentation rapide du terrain et du défi moteur du jour dès le rassemblement initial.',
      miseEnSituation:
        'Rappel des règles de sécurité et démonstration claire par deux élèves volontaires.',
      consigneDepart:
        'Au signal, entrez dans l’échauffement en gardant toujours un espace libre autour de vous.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Rassemblement & Échauffement progressif',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Quel est le signal d’arrêt immédiat et pourquoi garde-t-on un bras d’espace libre autour de soi ?\nQ2 : Quelles articulations préparons-nous en premier avant de courir ou lancer ?',
        activitesEleves:
          'R1 : Vérifient l’espace de sécurité et réagissent aussitôt au signal.\nR2 : Mobilisent chevilles, genoux, hanches et épaules au rythme indiqué.',
        indicateursInclusifs:
          '• Réactivité au signal et échauffement complet.\n[Inclusion handicap] Auditif/TDAH/Moteur : double signal (bras levé + sifflet court) et démonstration physique.',
      },
      {
        etape: '2. Situation motrice de référence & Découverte',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Après ce premier essai, qu’est-ce qui a bien fonctionné et qu’est-ce qui freine notre réussite ?\nQ2 : Quelles limites de terrain devons-nous absolument respecter ?',
        activitesEleves:
          'R1 : Expérimentent le jeu ou parcours de référence et repèrent un point technique à améliorer.\nR2 : Identifient les zones matérialisées par les plots.',
        indicateursInclusifs:
          '• Prise de repères spatiaux et techniques.\n[Inclusion handicap] Visuel/Moteur : plots haute visibilité, zones de couleurs distinctes et distances ajustables.',
      },
      {
        etape: '3. Ateliers d’apprentissage moteur',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quelle posture des appuis ou des bras rend votre geste plus précis ?\nQ2 : Quel niveau d’atelier (Vert, Bleu, Rouge) choisissez-vous maintenant pour progresser ?',
        activitesEleves:
          'R1 : Répètent le geste ciblé par rotations rapides sans attente longue.\nR2 : Ajustent leur posture et passent au niveau supérieur dès 3 réussites.',
        indicateursInclusifs:
          '• Engagement moteur actif et progrès gestuel.\n[Inclusion handicap] Moteur/Visuel/TSA : 3 paliers auto-choisis (cibles plus larges, balles souples/sonores, appuis stables).',
      },
      {
        etape: '4. Situation de réinvestissement ludique',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Comment réinvestir le geste travaillé pendant cette mini-rencontre ou ce relais ?\nQ2 : Quels critères surveille le jeune arbitre ou observateur ?',
        activitesEleves:
          'R1 : Appliquent en situation de jeu les progrès moteurs en coopérant avec leurs partenaires.\nR2 : Respectent les décisions de l’arbitre et encouragent leur équipe.',
        indicateursInclusifs:
          '• Fair-play et transfert en situation réelle.\n[Inclusion handicap] Moteur/TSA : rôles valorisants multiples (joueur, arbitre, coach, marqueur de points).',
      },
      {
        etape: '5. Retour au calme & Bilan collectif',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '5 min',
        activitesMaitre:
          'Q1 : En respirant calmement en cercle, quel progrès concret avez-vous réussi aujourd’hui ?\nQ2 : Comment rangeons-nous le matériel en équipe ?',
        activitesEleves:
          'R1 : Pratiquent la respiration lente et nomment une réussite personnelle ou collective.\nR2 : Participent au rangement ordonné et s’hydratent.',
        indicateursInclusifs:
          '• Retour au calme apaisé avant le retour en classe.\n[Inclusion handicap] TSA/Moteur : rituel assis en cercle avec repères visuels et temps calme guidé.',
      },
    ],
    questionsReponses: [
      {
        question: 'Pourquoi est-il important de s’échauffer avant une activité sportive ?',
        reponseAttendue: 'Pour préparer les muscles, le cœur et les articulations et éviter les blessures.',
        indicePedagogique: 'Pense à ce qui arrive à un muscle froid si on lui demande un grand effort brutal.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment aider son équipe à progresser pendant un jeu collectif ?',
        reponseAttendue: 'En se démarquant, en communiquant positivement et en respectant les règles sans se fâcher.',
        indicePedagogique: 'Regarde où sont tes partenaires libres avant d’agir.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi proposer plusieurs tailles de cibles ou distances dans un atelier EPS plutôt qu’une seule ?',
        reponseAttendue: 'Pour que chaque élève, quelles que soient sa taille ou ses capacités motrices, réussisse puis relève un défi adapté à son niveau.',
        indicePedagogique: 'Pense au principe d’inclusion : tout le monde s’exerce et progresse au bon palier.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En EPS, on s’échauffe, on s’entraîne pour progresser, on coopère en sécurité et on revient au calme.',
      traceEcriteEleve: 'Mon repère EPS : Sécurité · Progrès moteur · Fair-play.',
      motsCles: ['Échauffement', 'Coordination', 'Sécurité', 'Fair-play', 'Coopération'],
      prolongement: 'Reprise du rôle d’arbitre élève lors de la séance suivante.',
    },
  },
  {
    id: 'modele-art-plastique',
    nom: 'Art Plastique',
    sousLabel: 'Création plastique, gestes, couleurs & regard critique',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Art Plastique',
    niveauParDefaut: 'CE2',
    dureeParDefaut: '45 min',
    description:
      'Démarche artistique créative : incitation plastique ouverte, exploration des matériaux et couleurs, production personnelle et mise en regard d’œuvres.',
    competenceDeBaseModele:
      'CB1 (Art Plastique) — Expérimenter des matériaux, outils et gestes plastiques pour exprimer une intention créative et observer des œuvres.',
    competenceViseeModele:
      'Produire une réalisation plastique expressive à partir d’une contrainte créative et verbaliser ses choix visuels.',
    titreSuggere: 'Art Plastique : explorer les matières, couleurs et compositions',
    themeSuggere: 'Pratique plastique — Geste, contraste, composition et culture artistique',
    objectifsSpecifiques: [
      'Expérimenter librement un outil, un support ou un mélange de couleurs.',
      'Organiser l’espace de la feuille avec une intention claire (contraste, rythme, plan).',
      'Décrire sa production et celle d’un artiste avec un vocabulaire plastique précis.',
    ],
    prerequis: [
      'Connaître l’usage soigneux du matériel d’arts visuels et de nettoyage.',
    ],
    materielSuggere: [
      'Papiers de formats/textures variés, gouache ou pastels/encres',
      'Pinceaux, éponges, spatules ou outils détournés',
      '2 reproductions d’œuvres d’art de référence',
    ],
    introduction: {
      accroche:
        'Découverte sensorielle d’un matériau ou d’une incitation mystère (« Comment faire apparaître le mouvement sans dessiner de personnage ? »).',
      miseEnSituation:
        'Court échange sur ce que l’incitation inspire, sans imposer de modèle unique à copier.',
      consigneDepart:
        'Explorez d’abord deux gestes différents sur une bande d’essai avant de composer votre œuvre finale.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Éveil du regard & Installation',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quelles lignes, textures ou couleurs chaudes/froides repérez-vous autour de nous ?\nQ2 : Votre espace protégé et vos outils sont-ils prêts en sécurité ?',
        activitesEleves:
          'R1 : Observent l’environnement et nomment des sensations plastiques.\nR2 : Protègent la table et préparent les outils choisis.',
        indicateursInclusifs:
          '• Installation propre et vocabulaire d’observation activé.\n[Inclusion handicap] Moteur/Visuel : pinceaux à manches larges, éponges, feutres épais ou supports fixés.',
      },
      {
        etape: '2. Incitation créative & Essais libres',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Que vous inspire cette contrainte créative sans copier un modèle unique ?\nQ2 : Quels deux gestes ou mélanges testez-vous d’abord sur la bande d’essai ?',
        activitesEleves:
          'R1 : Échangent brièvement sur des pistes variées possibles.\nR2 : Expérimentent empreintes, traits ou superpositions sur petit format.',
        indicateursInclusifs:
          '• Exploration personnelle sans copie imposée.\n[Inclusion handicap] TSA/DYS : aucune « faute » esthétique ; repères visuels des techniques possibles.',
      },
      {
        etape: '3. Réalisation personnelle accompagnée',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '18 min',
        activitesMaitre:
          'Q1 : Où souhaitez-vous attirer le regard sur votre feuille ?\nQ2 : Quel contraste (clair/foncé, plein/vide, lisse/texturé) renforcera votre intention ?',
        activitesEleves:
          'R1 : Composent leur création sur le grand format en assumant leurs choix.\nR2 : Réinvestissent les gestes trouvés lors des essais.',
        indicateursInclusifs:
          '• Intention plastique visible dans la composition.\n[Inclusion handicap] Moteur/Visuel : travail possible debout, sur chevalet, ou avec gabarits de contraste.',
      },
      {
        etape: '4. Mini-galerie & Rencontre avec une œuvre',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Quel effet plastique remarquons-nous dans la création de notre camarade ?\nQ2 : Quel point commun voyez-vous avec cette œuvre d’art de référence ?',
        activitesEleves:
          'R1 : Décrivent respectueusement les productions exposées en cercle.\nR2 : Relient leurs trouvailles aux choix de l’artiste observé.',
        indicateursInclusifs:
          '• Regard curieux et vocabulaire plastique précis.\n[Inclusion handicap] DYS/Auditif/TSA : mots-étiquettes plastiques (contraste, texture, aplats, rythme) visibles.',
      },
      {
        etape: '5. Rangement & Trace réflexive',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quel titre personnel résume le mieux votre création ?\nQ2 : Quelle mission de rangement accomplissez-vous avec votre îlot ?',
        activitesEleves:
          'R1 : Donnent un titre à leur œuvre et le notent ou le dictent au dos.\nR2 : Nettoient les outils et posent la réalisation au séchage.',
        indicateursInclusifs:
          '• Autonomie matérielle et recul critique.\n[Inclusion handicap] Tâches de rangement simples et illustrées ; titre dicté si besoin.',
      },
    ],
    questionsReponses: [
      {
        question: 'Pourquoi faire des essais sur une petite feuille avant de commencer le grand format ?',
        reponseAttendue: 'Pour tester les couleurs, les outils et les gestes sans craindre de se tromper.',
        indicePedagogique: 'Pense à la palette de recherche d’un peintre avant sa toile.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment créer un contraste fort dans une composition plastique ?',
        reponseAttendue: 'En rapprochant des couleurs opposées (clair/foncé, chaud/froid) ou des formes lisses et texturées.',
        indicePedagogique: 'Observe ce qui ressort le plus quand tu éloignes ta feuille.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi deux élèves ayant la même consigne d’Art Plastique produisent-ils deux œuvres très différentes ?',
        reponseAttendue: 'Parce qu’en Art Plastique la consigne est une incitation ouverte : chacun exprime ses choix de composition, de geste et de couleur.',
        indicePedagogique: 'Compare avec un coloriage où tout le monde doit faire pareil : ici, tu es créateur.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En Art Plastique, on expérimente des outils, on ose des choix personnels et on compare avec des œuvres d’art.',
      traceEcriteEleve: 'Mon carnet d’artiste : Titre de l’œuvre · Technique testée · Ce que j’ai découvert.',
      motsCles: ['Incitation', 'Composition', 'Contraste', 'Geste', 'Œuvre'],
      prolongement: 'Exposition commentée des créations dans le couloir ou cahier des arts.',
    },
  },
  {
    id: 'modele-activite-manuelle',
    nom: 'Activité Manuelle',
    sousLabel: 'Fabrication concrète, découpage, pliage & assemblage',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Activité Manuelle',
    niveauParDefaut: 'CE1',
    dureeParDefaut: '45 min',
    description:
      'Atelier pratique de réalisation d’un objet concret (pliage, collage, tressage, maquette ou recyclage créatif) avec fiche technique illustrée et sécurité.',
    competenceDeBaseModele:
      'CB1 (Activité Manuelle) — Suivre une fiche technique étape par étape en manipulant les outils avec précision, soin et sécurité pour fabriquer un objet.',
    competenceViseeModele:
      'Mesurer, plier, découper et assembler des matériaux simples pour réaliser un objet fonctionnel ou décoratif fini.',
    titreSuggere: 'Activité Manuelle : concevoir et assembler un objet étape par étape',
    themeSuggere: 'Savoir-faire manuel — Mesure, découpe, pliage et assemblage sécurisé',
    objectifsSpecifiques: [
      'Lire et respecter l’ordre chronologique d’une fiche de fabrication illustrée.',
      'Manipuler ciseaux, règle et colle avec précision et soin.',
      'Vérifier la solidité et la finition de l’objet fabriqué.',
    ],
    prerequis: [
      'Tenir une paire de ciseaux en sécurité et tracer un trait le long d’une règle.',
    ],
    materielSuggere: [
      'Cartonnette, papier épais ou matériaux de récupération propres',
      'Ciseaux à bouts ronds, règle, crayon gris, colle adaptée',
      'Fiche de montage illustrée en 4 étapes + objet prototype fini',
    ],
    introduction: {
      accroche:
        'Présentation de l’objet fini (« modèle témoin ») manipulé par les élèves : comment a-t-il été fabriqué ?',
      miseEnSituation:
        'Identification des pièces composant l’objet et des outils nécessaires sans toucher aux ciseaux pour l’instant.',
      consigneDepart:
        'Vérifiez votre matériel devant vous puis suivez les étapes numérotées une par une avec l’aide du tableau.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Observation du modèle & Règles de sécurité',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Combien de pièces composent cet objet prototype et quels outils sont indispensables ?\nQ2 : Quelle règle de sécurité respectons-nous avec les ciseaux ?',
        activitesEleves:
          'R1 : Observent l’objet témoin en 3D et vérifient leur matériel devant eux.\nR2 : Rappellent : ciseaux tenus fermés, pointe vers le bas lors des déplacements.',
        indicateursInclusifs:
          '• Identification des pièces et règles de sécurité.\n[Inclusion handicap] Visuel/DYS/TSA : modèle réel manipulable à la main et fiche illustrée sans texte long.',
      },
      {
        etape: '2. Préparation, traçage et repérage des plis',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Sur la fiche technique, que faut-il faire sur le trait plein et sur les pointillés ?\nQ2 : Comment maintenir fermement la règle ou le gabarit avec la main qui ne trace pas ?',
        activitesEleves:
          'R1 : Distinguent découpe (trait plein) et pliage (pointillés).\nR2 : Reportent les repères proprement à l’aide du gabarit ou de la règle.',
        indicateursInclusifs:
          '• Repérage précis avant découpage.\n[Inclusion handicap] Moteur/Gauchers/Visuel : gabarits rigides, règle antidérapante et ciseaux ergonomiques ou à ressort.',
      },
      {
        etape: '3. Découpage & Assemblage guidé',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '18 min',
        activitesMaitre:
          'Q1 : Quelle pièce découpons-nous et plions-nous à l’étape en cours ?\nQ2 : Quelle quantité juste de colle faut-il appliquer pour que la pièce tienne sans gondoler ?',
        activitesEleves:
          'R1 : Suivent le rythme étape par étape en découpant sur le trait puis en marquant les plis.\nR2 : Appliquent une fine couche régulière et maintiennent appuyé 10 secondes.',
        indicateursInclusifs:
          '• Geste soigné et respect de la séquence.\n[Inclusion handicap] Moteur/TSA/DYS : validation étape par étape ; entraide ponctuelle entre voisins pour maintenir les pièces.',
      },
      {
        etape: '4. Finitions & Personnalisation',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '8 min',
        activitesMaitre:
          'Q1 : L’assemblage est-il solide et conforme aux critères de réussite du tableau ?\nQ2 : Quel détail personnel ou décoratif ajoutez-vous maintenant ?',
        activitesEleves:
          'R1 : Vérifient les raccords et ajustent un collage si nécessaire.\nR2 : Personnalisent leur création et inscrivent leur prénom.',
        indicateursInclusifs:
          '• Soin et finition contrôlés.\n[Inclusion handicap] Critères de réussite visuels (3 icônes : Solide / Plis nets / Propre).',
      },
      {
        etape: '5. Test collectif, Rangement & Bilan',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Quelle étape vous a demandé le plus de précision aujourd’hui ?\nQ2 : Comment trier les chutes recyclables et laisser la table nette ?',
        activitesEleves:
          'R1 : Présentent leur objet fini et partagent une difficulté surmontée.\nR2 : Trient les chutes et rangent ciseaux et colles rebouchées.',
        indicateursInclusifs:
          '• Valorisation du travail manuel et tri responsable.\n[Inclusion handicap] Valorisation de la persévérance quel que soit le rythme d’exécution.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment reconnaître sur une fiche technique où il faut couper et où il faut plier ?',
        reponseAttendue: 'On coupe sur les traits pleins et on plie sur les pointillés.',
        indicePedagogique: 'Regarde la légende des traits au début de la fiche de montage.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Que faire pour que deux pièces collées tiennent bien sans gondoler le papier ?',
        reponseAttendue: 'Mettre une couche fine et régulière de colle sur les bords et maintenir appuyé quelques secondes.',
        indicePedagogique: 'Trop de colle mouille le papier ; appuie doucement en comptant jusqu’à 10.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pour découper une forme courbe sans abîmer le papier avec les ciseaux, quelle main doit tourner ?',
        reponseAttendue: 'C’est la main qui tient la feuille qui la fait tourner doucement pendant que la main aux ciseaux garde une coupe régulière.',
        indicePedagogique: 'Essaie de tourner le papier comme un volant plutôt que de tordre ton poignet.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En Activité Manuelle, je lis la fiche technique, je travaille avec sécurité et je soigne chaque assemblage.',
      traceEcriteEleve: 'Étapes réussies : Préparer · Couper (trait plein) · Plier (pointillés) · Assembler et soigner.',
      motsCles: ['Fiche technique', 'Pliage', 'Découpage', 'Assemblage', 'Sécurité'],
      prolongement: 'Utilisation de l’objet fabriqué dans un projet de classe ou présentation aux autres classes.',
    },
  },
  {
    id: 'modele-remediation',
    nom: 'Remédiation APC',
    sousLabel: 'Diagnostic d’erreur, déblocage ciblé & consolidation',
    domaine: 'Remédiation',
    matiere: 'Remédiation',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '35 min',
    description:
      'Modèle spécifique aux petits groupes de besoin APC : identification bienveillante de l’obstacle, reprise par un canal différent (manipulatif/visuel), puis réussite immédiate.',
    competenceDeBaseModele:
      'CB-REM (Remédiation APC) — Identifier la cause d’une difficulté récurrente, construire une stratégie de contournement fiable et retrouver la réussite autonome.',
    competenceViseeModele:
      'Dépasser un blocage précis en s’appuyant sur un étayage visuel ou manipulatif puis réussir 3 exercices ciblés.',
    titreSuggere: 'Remédiation APC : comprendre son erreur et consolider la notion',
    themeSuggere: 'Remédiation pédagogique différenciée en petit groupe de besoin',
    objectifsSpecifiques: [
      'Mettre des mots sur la difficulté rencontrée sans jugement.',
      'Comprendre le mécanisme sous-jacent par une nouvelle approche concrète.',
      'Valider immédiatement la maîtrise sur des exercices progressifs.',
    ],
    prerequis: [
      'Avoir déjà rencontré la notion en classe entière (besoin identifié en évaluation diagnostique).',
    ],
    materielSuggere: [
      'Cartes-indices ou sous-main d’étayage individualisé',
      'Matériel concret de manipulation (jetons, étiquettes, schémas)',
      '3 exercices gradués très courts',
    ],
    introduction: {
      accroche:
        'Contrat de confiance dès l’accueil : « Aujourd’hui, nous sommes en petit groupe pour trouver ensemble l’astuce qui débloque cette notion ! »',
      miseEnSituation:
        'Analyse bienveillante d’une erreur fréquente (« L’erreur du robot ») pour dédramatiser et observer où le raisonnement dévie.',
      consigneDepart:
        'Observez l’erreur commise par le robot et expliquez comment la corriger étape par étape.',
    },
    includeManipulable: true,
    manipulableType: 'droite_graduee',
    etapes: [
      {
        etape: '1. Accueil rassurant & Diagnostic flash',
        sousTitreInvariable: 'Mise en train & réactivation des prérequis',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Qu’allons-nous réussir ensemble aujourd’hui grâce à notre petit groupe ?\nQ2 : Sur ce premier micro-défi accessible, quelle étape savez-vous déjà faire sans hésiter ?',
        activitesEleves:
          'R1 : Formulent avec confiance ce qui leur semblait difficile jusque-là.\nR2 : Réussissent le premier item simple et identifient leurs appuis.',
        indicateursInclusifs:
          '• Climat sécurisé et première réussite immédiate.\n[Inclusion handicap] TSA/DYS/Auditif : contrat explicite bienveillant et repères visuels rassurants.',
      },
      {
        etape: '2. Analyse de « l’erreur du robot »',
        sousTitreInvariable: 'Situation déclenchante & consigne initiale',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Regardez le travail de notre robot : à quelle micro-étape son raisonnement a-t-il dévié ?\nQ2 : Pourquoi son astuce ne fonctionne-t-elle pas ici ?',
        activitesEleves:
          'R1 : Pointent l’étape exacte où l’erreur apparaît sur l’exemple anonyme.\nR2 : Expliquent à voix haute comment corriger la procédure du robot.',
        indicateursInclusifs:
          '• Identification lucide de l’obstacle cognitif.\n[Inclusion handicap] Décentration sécurisante : l’erreur appartient toujours au « robot », jamais à un élève.',
      },
      {
        etape: '3. Reprise guidée par manipulation & verbalisation',
        sousTitreInvariable: 'Manipulation guidée & recherche active',
        duree: '11 min',
        activitesMaitre:
          'Q1 : En manipulant les jetons ou étiquettes, que dis-tu à voix haute à chaque geste (« Je fais… parce que… ») ?\nQ2 : Peux-tu essayer le deuxième cas avec un peu moins d’aide ?',
        activitesEleves:
          'R1 : Utilisent le sous-main couleur et le matériel concret tout en verbalisant chaque micro-étape.\nR2 : Réussissent progressivement en estompant l’étayage.',
        indicateursInclusifs:
          '• Procédure verbalisée et fiable.\n[Inclusion handicap] DYS/Dyscalculie/Moteur : étayage maximal au départ puis retrait progressif adapté à chacun.',
      },
      {
        etape: '4. Fiche-astuce personnelle',
        sousTitreInvariable: 'Synthèse collective & structuration',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quelle est ta propre « règle d’or anti-piège » en une phrase courte ?\nQ2 : Quel exemple juste écris-tu sur ton marque-page d’étayage ?',
        activitesEleves:
          'R1 : Formulent leur astuce personnelle avec des mots simples.\nR2 : Complètent et plastifient/rangent leur marque-page réutilisable.',
        indicateursInclusifs:
          '• Outil d’étayage personnel prêt à l’emploi.\n[Inclusion handicap] Sous-main ou marque-page contrasté réutilisable dès le lendemain en classe entière.',
      },
      {
        etape: '5. Mini-validation de réussite autonome',
        sousTitreInvariable: 'Évaluation formative & transfert',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Avec votre marque-page posé à côté, réussissez ces 3 items courts tout seul !\nQ2 : Qu’est-ce qui a changé entre le début et la fin de cette séance ?',
        activitesEleves:
          'R1 : Appliquent leur astuce avec méthode sur les 3 items gradués.\nR2 : Constatent leurs progrès mesurables et gagnent en confiance.',
        indicateursInclusifs:
          '• Validation de 2/3 items minimum en autonomie.\n[Inclusion handicap] Temps adapté, modalité orale ou manipulatoire acceptée et félicitation ciblée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quelle étape dois-tu toujours vérifier en premier pour éviter le piège habituel ?',
        reponseAttendue: 'Appliquer le premier point de ma fiche-astuce avant de passer à la réponse finale.',
        indicePedagogique: 'Regarde le mot en couleur tout en haut de ton marque-page d’étayage.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment utiliser ton outil d’aide demain pendant le travail en classe entière ?',
        reponseAttendue: 'Le poser à côté du cahier et le consulter dès qu’on hésite, puis essayer de s’en passer progressivement.',
        indicePedagogique: 'Utilise-le comme une béquille temporaire le temps de devenir sûr de toi.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Pourquoi analyser « l’erreur du robot » aide-t-elle plus que de simplement copier la bonne réponse ?',
        reponseAttendue: 'Parce que repérer exactement où le mécanisme bloque permet de comprendre le piège et de ne plus le reproduire seul.',
        indicePedagogique: 'Copier la réponse corrige une feuille, mais comprendre l’erreur corrige ta méthode.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'La remédiation permet de comprendre son erreur, de trouver une astuce concrète et de retrouver confiance.',
      traceEcriteEleve: 'Mon marque-page anti-erreur : 1) Je repère le piège · 2) J’applique mon astuce · 3) Je vérifie.',
      motsCles: ['Diagnostic', 'Étayage', 'Astuce', 'Confiance', 'Consolidation'],
      prolongement: 'Réutilisation du marque-page d’étayage lors de la prochaine évaluation formative en classe.',
    },
  },
];

const RAW_MODELE_FICHES: ModeleFicheAPC[] = [
  ...CM1_S9_FR_TEMPLATES,
  ...CM1_S9_MATH_TEMPLATES,
  ...EXTRA_GENERAL_MODELE_FICHES,
  ...GENERAL_MODELE_FICHES.map((tpl) => ({
    ...tpl,
    collection: 'general' as const,
    disciplineSpecifiqueId: tpl.disciplineSpecifiqueId || tpl.id,
    handicapsInclus: tpl.handicapsInclus || [...DEFAULT_HANDICAP_PROFILES],
  })),
];

export const MODELE_FICHES: ModeleFicheAPC[] = RAW_MODELE_FICHES.map((tpl) => {
  const profile = findDisciplineProfile(
    tpl.disciplineSpecifiqueId || tpl.id,
    tpl.titreSuggere
  );
  const preserveTemplateSubtitles = tpl.collection === 'cm1_s9';
  return {
    ...tpl,
    collection: tpl.collection || 'general',
    disciplineSpecifiqueId: tpl.disciplineSpecifiqueId || profile.id,
    handicapsInclus: tpl.handicapsInclus || [...DEFAULT_HANDICAP_PROFILES],
    etapes: tpl.etapes.map((step, idx) => ({
      ...step,
      sousTitreInvariable: preserveTemplateSubtitles
        ? step.sousTitreInvariable ||
          profile.etapesCanoniques[idx]?.sousTitreInvariable ||
          'Étape pédagogique structurée'
        : profile.etapesCanoniques[idx]?.sousTitreInvariable ||
          step.sousTitreInvariable,
    })),
  };
});

export function getTemplateByDiscipline(
  disciplineId?: string,
  matiere?: string,
  titreHint?: string
): ModeleFicheAPC {
  const profile = findDisciplineProfile(disciplineId || matiere, titreHint);
  const generalMatch =
    MODELE_FICHES.find(
      (t) => t.collection !== 'cm1_s9' && t.id === profile.id
    ) ||
    MODELE_FICHES.find(
      (t) => t.collection !== 'cm1_s9' && t.disciplineSpecifiqueId === profile.id
    );
  if (generalMatch) return generalMatch;

  const anyMatch =
    MODELE_FICHES.find((t) => t.id === disciplineId) ||
    MODELE_FICHES.find((t) => t.disciplineSpecifiqueId === profile.id) ||
    MODELE_FICHES.find(
      (t) => t.matiere.toLowerCase() === (matiere || '').trim().toLowerCase()
    );
  return anyMatch || MODELE_FICHES.find((t) => t.id === 'modele-remediation') || MODELE_FICHES[0];
}

export function applyFullDisciplineTemplateToFiche(
  fiche: FicheAPC,
  disciplineId: string
): FicheAPC {
  const profile = findDisciplineProfile(disciplineId, fiche.titre);
  const template = getTemplateByDiscipline(profile.id, profile.matiere, fiche.titre);
  const now = new Date().toISOString();

  return {
    ...fiche,
    disciplineId: profile.id,
    matiere: profile.matiere,
    competenceDeBase:
      fiche.competenceDeBase?.trim() &&
      fiche.competenceDeBase.toLowerCase().includes(profile.matiere.toLowerCase())
        ? fiche.competenceDeBase
        : `${profile.cbPrefixe} — ${fiche.theme || template.themeSuggere}`,
    handicapsInclus:
      fiche.handicapsInclus && fiche.handicapsInclus.length > 0
        ? fiche.handicapsInclus
        : [...DEFAULT_HANDICAP_PROFILES],
    deroulement: template.etapes.map((st, idx) => ({
      id: `${fiche.id}-e${idx + 1}`,
      etape: st.etape,
      sousTitreInvariable:
        profile.etapesCanoniques[idx]?.sousTitreInvariable || st.sousTitreInvariable,
      duree: st.duree,
      activitesMaitre: st.activitesMaitre,
      activitesEleves: st.activitesEleves,
      indicateursInclusifs: st.indicateursInclusifs,
      indicateurValide: fiche.deroulement[idx]?.indicateurValide ?? false,
    })),
    questionsReponses: template.questionsReponses.map((q, idx) => ({
      id: `${fiche.id}-q${idx + 1}`,
      question: q.question,
      reponseAttendue: q.reponseAttendue,
      indicePedagogique: q.indicePedagogique,
      difficulte: q.difficulte,
    })),
    schematisationMath: isMathContext(profile.matiere, profile.id)
      ? fiche.schematisationMath?.actif
        ? enrichManipulationPhases(fiche.schematisationMath, {
            matiere: profile.matiere,
            disciplineId: profile.id,
            competenceDeBase: fiche.competenceDeBase,
            titre: fiche.titre,
            theme: fiche.theme,
            situationProbleme: fiche.introduction?.accroche || fiche.theme,
            niveau: fiche.niveau,
          })
        : buildFallbackMathSchematisation({
            competenceDeBase: fiche.competenceDeBase,
            titre: fiche.titre,
            theme: fiche.theme,
            situationProbleme: fiche.introduction?.accroche || fiche.theme,
            niveau: fiche.niveau,
          })
      : undefined,
    phasesManipulation: !isMathContext(profile.matiere, profile.id)
      ? buildUniversalManipulationSchematisation({
          matiere: profile.matiere,
          disciplineId: profile.id,
          competenceDeBase: fiche.competenceDeBase,
          titre: fiche.titre,
          theme: fiche.theme,
          situationProbleme: fiche.introduction?.accroche || fiche.theme,
          niveau: fiche.niveau,
        })
      : undefined,
    updatedAt: now,
  };
}

export function buildFicheFromTemplate(
  template: ModeleFicheAPC,
  overrides?: {
    titre?: string;
    theme?: string;
    competenceDeBase?: string;
    niveau?: string;
    duree?: string;
    includeManipulable?: boolean;
  }
): FicheAPC {
  const now = new Date().toISOString();
  const id = createUid('fiche-tpl');
  const titre = overrides?.titre?.trim() || template.titreSuggere;
  const theme = overrides?.theme?.trim() || template.themeSuggere;
  const niveau = overrides?.niveau || template.niveauParDefaut;
  const duree = overrides?.duree || template.dureeParDefaut;
  const competenceDeBase =
    overrides?.competenceDeBase?.trim() || template.competenceDeBaseModele;
  const useManip =
    typeof overrides?.includeManipulable === 'boolean'
      ? overrides.includeManipulable
      : template.includeManipulable;
  const resolvedDisciplineId =
    template.disciplineSpecifiqueId ||
    findDisciplineProfile(template.id, template.titreSuggere).id;
  const profile = findDisciplineProfile(resolvedDisciplineId, template.titreSuggere);
  const preserveTemplateSubtitles = template.collection === 'cm1_s9';

  const illustration = template.customIllustration
    ? {
        titre: template.customIllustration.titre,
        legende: template.customIllustration.legende,
        typeSchema: template.customIllustration.typeSchema,
        svgCode: template.customIllustration.svgCode,
        annotations: template.customIllustration.annotations.map((ann, idx) => ({
          id: `${id}-ann-${idx + 1}`,
          x: ann.x,
          y: ann.y,
          label: ann.label,
          detail: ann.detail,
        })),
      }
    : {
        titre: `Schéma structurel — ${template.nom}`,
        legende: `Canevas visuel du modèle « ${template.nom} » (modifiable ou régénérable par l’IA).`,
        typeSchema: 'carte_mentale' as const,
        svgCode: `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="220" fill="#F8FAFC" rx="8"/>
  <rect x="140" y="20" width="360" height="42" rx="6" fill="#0F172A"/>
  <text x="320" y="46" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${template.nom.toUpperCase()} · ${niveau}</text>
  <line x1="320" y1="62" x2="115" y2="112" stroke="#0284C7" stroke-width="2"/>
  <line x1="320" y1="62" x2="320" y2="112" stroke="#059669" stroke-width="2"/>
  <line x1="320" y1="62" x2="525" y2="112" stroke="#D97706" stroke-width="2"/>
  <rect x="25" y="112" width="180" height="74" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
  <text x="115" y="140" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0284C7">1. Découvrir</text>
  <text x="115" y="164" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Accroche &amp; prérequis</text>
  <rect x="230" y="112" width="180" height="74" rx="6" fill="#FFFFFF" stroke="#059669" stroke-width="1.5"/>
  <text x="320" y="140" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">2. Manipuler</text>
  <text x="320" y="164" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Activité active &amp; étayage</text>
  <rect x="435" y="112" width="180" height="74" rx="6" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/>
  <text x="525" y="140" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#D97706">3. Consolider</text>
  <text x="525" y="164" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">Synthèse &amp; évaluation</text>
</svg>`,
        annotations: [
          {
            id: `${id}-ann-1`,
            x: 50,
            y: 22,
            label: template.nom,
            detail: template.description,
          },
        ],
      };

  return {
    id,
    disciplineId: resolvedDisciplineId,
    origineModele: template.origineModele,
    handicapsInclus: template.handicapsInclus
      ? [...template.handicapsInclus]
      : [...DEFAULT_HANDICAP_PROFILES],
    titre,
    theme,
    matiere: template.matiere,
    niveau,
    duree,
    effectif: template.collection === 'cm1_s9' ? 'Groupe classe / APC différencié' : '5 à 6 élèves (groupe APC)',
    competenceDeBase,
    competenceVisee: template.competenceViseeModele,
    objectifsSpecifiques: [...template.objectifsSpecifiques],
    prerequis: [...template.prerequis],
    materiel: [...template.materielSuggere],
    introduction: { ...template.introduction },
    deroulement: template.etapes.map((step, idx) => ({
      id: `${id}-e${idx + 1}`,
      etape: step.etape,
      sousTitreInvariable: preserveTemplateSubtitles
        ? step.sousTitreInvariable ||
          profile.etapesCanoniques[idx]?.sousTitreInvariable ||
          'Étape pédagogique structurée'
        : profile.etapesCanoniques[idx]?.sousTitreInvariable ||
          step.sousTitreInvariable,
      duree: step.duree,
      activitesMaitre: step.activitesMaitre,
      activitesEleves: step.activitesEleves,
      indicateursInclusifs: step.indicateursInclusifs,
      indicateurValide: false,
    })),
    questionsReponses: template.questionsReponses.map((q, idx) => ({
      id: `${id}-q${idx + 1}`,
      ...q,
    })),
    illustration,
    objetManipulable: {
      actif: useManip,
      type: template.manipulableType || 'fractions',
      titre: `Outil interactif — ${titre}`,
      consigne: 'Utilisez les commandes ci-dessous pour illustrer la notion en direct.',
      parametres: {
        valeurA: 2,
        valeurB: 3,
        denominateur: 6,
        unite: 'unités',
      },
    },
    schematisationMath: isMathContext(template.matiere, resolvedDisciplineId)
      ? template.customSchematisationMath
        ? enrichManipulationPhases(
            {
              ...template.customSchematisationMath,
              phases: template.customSchematisationMath.phases.map((p) => ({
                ...p,
              })),
            },
            {
              matiere: template.matiere,
              disciplineId: resolvedDisciplineId,
              competenceDeBase,
              titre,
              theme,
              situationProbleme: template.introduction.accroche,
              niveau,
            }
          )
        : buildFallbackMathSchematisation({
            competenceDeBase,
            titre,
            theme,
            situationProbleme: template.introduction.accroche,
            niveau,
          })
      : undefined,
    phasesManipulation: !isMathContext(template.matiere, resolvedDisciplineId)
      ? buildUniversalManipulationSchematisation({
          matiere: template.matiere,
          disciplineId: resolvedDisciplineId,
          competenceDeBase,
          titre,
          theme,
          situationProbleme:
            template.introduction.accroche || template.introduction.miseEnSituation || theme,
          niveau,
        })
      : undefined,
    synthese: { ...template.synthese, motsCles: [...template.synthese.motsCles] },
    suggestionsIA: [],
    historique: [
      {
        id: createUid('hist'),
        date: now,
        action: `Modèle « ${template.nom} »`,
        resume: `Fiche pré-remplie à partir du modèle pédagogique « ${template.nom} » avec adaptations inclusion handicap.`,
      },
    ],
    modeCreation: 'manuel',
    createdAt: now,
    updatedAt: now,
  };
}
