import {
  DisciplineProfileAPC,
  DomaineModele,
  FicheAPC,
} from './types';

export const DISCIPLINE_DOMAINS: Array<DomaineModele | 'Langues'> = [
  'Mathématiques',
  'Français',
  'Sciences humaines',
  'Sciences & Technologie',
  'Éducation & Vie sociale',
  'Arts, EPS & Activité manuelle',
  'Remédiation',
  'Langues',
];

export const DISCIPLINE_PROFILES: DisciplineProfileAPC[] = [
  {
    id: 'modele-mathematiques',
    nom: 'Mathématiques',
    sousLabel: 'Calcul, numération, grandeurs, géométrie & résolution de problèmes',
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    cbPrefixe: 'CB1 (Mathématiques)',
    piliersInclusifsAPC: [
      'Manipulation concrète préalable (bâtonnets, balance, solides, rapporteur/compas adaptés, bande numérique)',
      'Énoncés épurés avec mots-clés surlignés, description verbale des figures géométriques et schémas en barres',
      'Instruments ergonomiques / binôme tuteur pour tracés (dyspraxie) et tableau de conversion permanent (dyscalculie)',
    ],
    etapesCanoniques: [
      {
        etape: '1. Éveil mathématique & Calcul rapide',
        sousTitreInvariable: 'Calcul mental flash & réactivation des faits numériques',
        duree: '5 min',
        focusInclusif: 'Bande numérique, gestes comptés ou table de repères autorisée en appui visuel.',
      },
      {
        etape: '2. Situation-problème déclenchante',
        sousTitreInvariable: 'Problème concret, reformulation orale & estimation initiale',
        duree: '8 min',
        focusInclusif: 'Lecture oralisée face classe ; données clés isolées pour élèves DYS / TSA.',
      },
      {
        etape: '3. Manipulation & Recherche guidée',
        sousTitreInvariable: 'Manipulation collective, petits groupes & schématisation concrète',
        duree: '15 min',
        focusInclusif: 'Matériel tactile en relief, binômes complémentaires et double entrée matériel réel / schéma en barres.',
      },
      {
        etape: '4. Mise en commun & Structuration',
        sousTitreInvariable: 'Représentation / Abstraction & institutionnalisation mathématique',
        duree: '9 min',
        focusInclusif: 'Encadré mémo étape par étape avec exemple résolu en couleurs et verbalisation.',
      },
      {
        etape: '5. Entraînement différencié & Bilan',
        sousTitreInvariable: 'Exercices de consolidation, prolongement & vérification autonome',
        duree: '8 min',
        focusInclusif: 'Parcours à quantité allégée ou étayée ; validation orale / schématique acceptée.',
      },
    ],
  },
  {
    id: 'modele-math-consolidation',
    nom: 'Mathématiques — Consolidation',
    sousLabel: 'Calcul mental, analyse de problèmes, choix d’opération, composition & résolution',
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    cbPrefixe: 'CB1 + CB2 (Mathématiques — Consolidation)',
    piliersInclusifsAPC: [
      'Découpage explicite de la démarche de résolution en 5 sous-compétences graduées (Analyser / Question / Opération / Composer / Résoudre)',
      'Schématisation systématique en barres et figures annotées avant tout calcul numérique ou conversion',
      'Tableaux de conversion en couleurs, gabarits d’échelles et exercices calibrés selon les besoins moteurs, DYS, visuels ou auditifs',
    ],
    etapesCanoniques: [
      {
        etape: 'Prise en main & Contrôle du matériel',
        sousTitreInvariable: 'Chant thématique & vérification ardoise, bâtonnets et matériel partagé',
        duree: '5 min',
        focusInclusif: 'Accueil apaisé, matériel ergonomique vérifié et partage organisé en binôme.',
      },
      {
        etape: 'Éveil mathématique & Calcul mental',
        sousTitreInvariable: 'Révision tables & automatisation des stratégies de calcul rapide (÷5, ÷50)',
        duree: '10 min',
        focusInclusif: 'Schéma en barres explicatif de la procédure (÷10 × 2) et ardoise avec temps adapté.',
      },
      {
        etape: 'Résolution 1 & 2 : Analyser & Poser la question',
        sousTitreInvariable: 'Tri des données utiles, échelle géométrique & formulation de la question pertinente',
        duree: '18 min',
        focusInclusif: 'Énoncés segmentés à l’oral et par code couleur ; description orale des figures triangulaires.',
      },
      {
        etape: 'Résolution 3 & 4 : Opération & Composition',
        sousTitreInvariable: 'Conversion d’unités, choix de l’opération & remise en ordre d’énoncé cohérent',
        duree: '17 min',
        focusInclusif: 'Tableau d’unités permanent (dag/hg/g) et étiquettes-phrases manipulables pour composer.',
      },
      {
        etape: 'Résolution 5 : Problèmes complets de synthèse',
        sousTitreInvariable: 'Résolution multi-étapes (masses, fractions, tracés à l’échelle) & vérification',
        duree: '20 min',
        focusInclusif: 'Schéma en barres pré-amorcé, échelle rappelée et binôme tuteur pour tracé au rapporteur.',
      },
    ],
  },
  {
    id: 'modele-fr-manipule-phrases-1',
    nom: 'Français — Je manipule les phrases 1',
    sousLabel: 'Structuration de la phrase simple (sujet, verbe, sens, ponctuation)',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB1 (Français — Je manipule les phrases 1)',
    piliersInclusifsAPC: [
      'Étiquettes-mots grand format manipulables sur table avant tout passage à l’écrit',
      'Code couleur grammatical fixe (bleu = qui fait l’action / sujet ; rouge = verbe/action)',
      'Possibilité de coller les étiquettes ou de dicter plutôt que recopier en cas de trouble graphomoteur',
    ],
    etapesCanoniques: [
      {
        etape: '1. Mise en train — Phrase ou non-phrase ?',
        sousTitreInvariable: 'Discrimination orale phrase / non-phrase & critères de sens',
        duree: '5 min',
        focusInclusif: 'Pictogrammes visuels « Majuscule » et « Point » affichés au tableau.',
      },
      {
        etape: '2. Découverte avec étiquettes mobiles',
        sousTitreInvariable: 'Découverte de l’ordre des mots par manipulation d’étiquettes',
        duree: '8 min',
        focusInclusif: 'Code couleur grammatical stable pour les élèves dyslexiques.',
      },
      {
        etape: '3. Manipulation active : substituer et déplacer',
        sousTitreInvariable: 'Substitution, déplacement & accord simple Sujet-Verbe',
        duree: '13 min',
        focusInclusif: 'Oralisation systématique de chaque phrase testée avant validation.',
      },
      {
        etape: '4. Synthèse & Règle de la phrase',
        sousTitreInvariable: 'Institutionnalisation des 3 critères (sens, majuscule, point)',
        duree: '7 min',
        focusInclusif: 'Carte mentale à 3 repères visuels dans le cahier-outil.',
      },
      {
        etape: '5. Réinvestissement & Validation',
        sousTitreInvariable: 'Reconstitution guidée & validation syntaxique autonome',
        duree: '7 min',
        focusInclusif: 'Option collage d’étiquettes ou copie courte adaptée.',
      },
    ],
  },
  {
    id: 'modele-fr-apprends-a-lire',
    nom: 'Français — J’apprends à lire',
    sousLabel: 'Conscience phonologique, lecture silencieuse, lecture à haute voix & fluence',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB2 (Français — J’apprends à lire)',
    piliersInclusifsAPC: [
      'Lecture magistrale posée et articulée face à la classe (lecture labiale pour déficience auditive)',
      'Textes à police sans empattement corps 16+, interligne aéré 1,5, cache-ligne anti-saut et liaisons repérées',
      'Réponses orales, par pointage ou fiches autocorrectives avant écriture pour élèves DYS, dyspraxiques ou malvoyants',
    ],
    etapesCanoniques: [
      {
        etape: '1. Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        focusInclusif: 'Chant rythmé avec gestes visuels pour inclure les élèves malentendants ou TSA.',
      },
      {
        etape: '2. Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & partage coopératif du support',
        duree: '2 min',
        focusInclusif: 'Repère visuel de page coloré et partage prévu en binôme sans stigmatisation.',
      },
      {
        etape: '3. Mise en situation – Annonce de l’objet et des objectifs',
        sousTitreInvariable: 'Ancrage dans le vécu, annonce explicite de l’objet & des objectifs de lecture',
        duree: '5 min',
        focusInclusif: 'Reformulation orale courte de l’objet ; numéro de page écrit en grand au tableau.',
      },
      {
        etape: '4. Lecture silencieuse',
        sousTitreInvariable: 'Lecture silencieuse guidée & compréhension avec fiches autocorrectives',
        duree: '10 min',
        focusInclusif: 'Cache-ligne, temps majoré, questions segmentées 1 à 1 et version agrandie / audio pour DYS & malvoyants.',
      },
      {
        etape: '5. Lecture à haute voix',
        sousTitreInvariable: 'Lecture magistrale, lecture individuelle & entraînement pauses / liaisons (//, /, ---)',
        duree: '10 min',
        focusInclusif: 'Modélisation vocale articulée face classe et codage visuel des pauses (//) et liaisons (---).',
      },
      {
        etape: '6. Exercices',
        sousTitreInvariable: 'Repérage de phrases cibles & concours bienveillant de lecture expressive',
        duree: '6 min',
        focusInclusif: 'Encouragement des lecteurs hésitants ; comparaison bienveillante sur critères explicites.',
      },
      {
        etape: '7. Bilan',
        sousTitreInvariable: 'Synthèse des acquis de lecture & transfert dans la vie courante',
        duree: '4 min',
        focusInclusif: 'Valorisation orale des progrès et consigne courte de relecture à la maison.',
      },
    ],
  },
  {
    id: 'modele-fr-apprends-a-parler',
    nom: 'Français — J’apprends à parler',
    sousLabel: 'Communication orale, actes de parole, jeux de rôles & transfert situationnel',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB1 (Français — J’apprends à parler)',
    piliersInclusifsAPC: [
      'Observation silencieuse préalable de l’image avec description orale détaillée pour élèves malvoyants',
      'Cartes-structures d’actes de parole et pictogrammes visuels pour soutenir les élèves malentendants, TSA ou DYS',
      'Binômes coopératifs sécurisants permettant la répétition guidée sans exposition anxieuse',
    ],
    etapesCanoniques: [
      {
        etape: '1. Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en confiance vocale collective',
        duree: '3 min',
        focusInclusif: 'Participation chorale joyeuse et rythme gestuel visible par tous.',
      },
      {
        etape: '2. Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & organisation du partage en binôme',
        duree: '2 min',
        focusInclusif: 'Vérification rapide et ouverture guidée à la page de l’image support.',
      },
      {
        etape: '3. Activation des prérequis',
        sousTitreInvariable: 'Réactivation dialoguée en binômes des actes de parole connus',
        duree: '4 min',
        focusInclusif: 'Structures modèles affichées au tableau en gros caractères contrastés.',
      },
      {
        etape: '4. Situation problème',
        sousTitreInvariable: 'Observation silencieuse de l’image support & repérage initial',
        duree: '3 min',
        focusInclusif: 'Temps d’observation suffisant et description verbale des détails pour élèves déficients visuels.',
      },
      {
        etape: '5. Expression libre',
        sousTitreInvariable: 'Prise de parole spontanée sur l’image & relevé bienveillant des écarts',
        duree: '5 min',
        focusInclusif: 'Droit de parole respecté, acceptation de phrases courtes ou appui sur pictogrammes.',
      },
      {
        etape: '6. Expression dirigée',
        sousTitreInvariable: 'Questionnement ciblé, mémorisation des structures & jeux de rôles guidés',
        duree: '6 min',
        focusInclusif: 'Répétition face à la classe pour lecture labiale et cartes-répliques en soutien.',
      },
      {
        etape: '7. Phase de transfert',
        sousTitreInvariable: 'Réinvestissement autonome des actes de parole dans de nouveaux scénarios',
        duree: '4 min',
        focusInclusif: 'Temps de préparation en binôme et variation des contextes (maison, école, quartier).',
      },
      {
        etape: '8. Bilan',
        sousTitreInvariable: 'Verbalisation des formules apprises & usage dans la vie quotidienne',
        duree: '3 min',
        focusInclusif: 'Tour de parole court laissant s’exprimer plusieurs profils d’élèves.',
      },
    ],
  },
  {
    id: 'modele-fr-utilise-mots-nouveaux',
    nom: 'Français — J’utilise les mots nouveaux',
    sousLabel: 'Vocabulaire en contexte, sémantique, dramatisation, fixation & transfert écrit',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB1 + CB3 (Français — J’utilise les mots nouveaux)',
    piliersInclusifsAPC: [
      'Dramatisation, objets réels et images concrètes pour expliquer chaque mot nouveau sans abstraction pure',
      'Épellation orale + mise en évidence couleur des mots cibles dans les phrases supports',
      'Banque d’étiquettes-mots et phrases à trous proposées pour alléger la copie des élèves dyspraxiques ou DYS',
    ],
    etapesCanoniques: [
      {
        etape: '1. Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en disponibilité du groupe',
        duree: '3 min',
        focusInclusif: 'Accueil apaisé et signal visuel d’entrée dans la séance.',
      },
      {
        etape: '2. Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon, texte support & entraide',
        duree: '2 min',
        focusInclusif: 'Matériel ergonomique prêt (ardoise stabilisée, feutre épais si trouble moteur).',
      },
      {
        etape: '3. Activation des prérequis',
        sousTitreInvariable: 'Réinvestissement lexical sur ardoise à partir des mots précédents',
        duree: '5 min',
        focusInclusif: 'Banque de mots visible et travail par étiquettes possible en cas de lenteur graphique.',
      },
      {
        etape: '4. Imprégnation (Mise en situation)',
        sousTitreInvariable: 'Lecture du texte support, compréhension & dégagement des expressions cibles',
        duree: '7 min',
        focusInclusif: 'Lecture magistrale articulée ; mots cibles surlignés dans le texte agrandi.',
      },
      {
        etape: '5. Étude, Analyse et découverte',
        sousTitreInvariable: 'Élévation du sens par dramatisation, objets, exemples & famille de mots',
        duree: '10 min',
        focusInclusif: 'Explication multisensorielle (mimer, montrer l’objet, illustrer, épeler).',
      },
      {
        etape: '6. Fixation',
        sousTitreInvariable: 'Production de phrases orales et écrites & recherche de synonymes/contraires',
        duree: '7 min',
        focusInclusif: 'Validation orale avant passage à l’écrit ; modèle orthographique visible au tableau.',
      },
      {
        etape: '7. Transfert',
        sousTitreInvariable: 'Complétion en contexte & courte production écrite réutilisant les mots',
        duree: '7 min',
        focusInclusif: 'Texte à trous ou dictée à l’adulte acceptée pour les élèves à besoin graphomoteur.',
      },
      {
        etape: '8. Bilan',
        sousTitreInvariable: 'Rappel des expressions maîtrisées & transfert en rédaction quotidienne',
        duree: '4 min',
        focusInclusif: 'Carnet/boîte à mots illustrée complétée avec l’enseignant si besoin.',
      },
    ],
  },
  {
    id: 'modele-fr-sais-ecrire-mots',
    nom: 'Français — Je sais écrire les mots',
    sousLabel: 'Encodage phonologique, orthographe lexicale & mémorisation active',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB3 (Français — Je sais écrire les mots)',
    piliersInclusifsAPC: [
      'Segmentation par paquets très courts de 2 à 3 mots pour prévenir la surcharge TDAH',
      'Verbalisation orale et tracé kinesthésique (en l’air / sur ardoise) de la lettre piège',
      'Recours aux familles de mots (grand/grande) et texte à trous en aménagement dysorthographique',
    ],
    etapesCanoniques: [
      {
        etape: '1. Réactivation des sons et syllabes',
        sousTitreInvariable: 'Correspondance sons-syllabes & encodage rapide à l’ardoise',
        duree: '5 min',
        focusInclusif: 'Tableau de référence des sons complexes maintenu visible.',
      },
      {
        etape: '2. Observation guidée des mots cibles',
        sousTitreInvariable: 'Analyse orthographique, syllabation & repérage des lettres pièges',
        duree: '8 min',
        focusInclusif: 'Surlignage couleur des lettres muettes ou graphèmes complexes.',
      },
      {
        etape: '3. Entraînement actif « Regarder - Cacher - Écrire »',
        sousTitreInvariable: 'Mémorisation visuo-motrice active par paquets de mots',
        duree: '12 min',
        focusInclusif: 'Feedback immédiat après chaque mot sans laisser d’erreur s’ancrer.',
      },
      {
        etape: '4. Classement & Règle de mémorisation',
        sousTitreInvariable: 'Classement lexical par régularités & astuce orthographique',
        duree: '7 min',
        focusInclusif: 'Modèle ligné agrandi ou étiquettes autocollantes pour le répertoire.',
      },
      {
        etape: '5. Dictée flash en contexte',
        sousTitreInvariable: 'Dictée flash contextualisée & relecture orthographique guidée',
        duree: '8 min',
        focusInclusif: 'Phrase à trous proposée aux élèves à grande lenteur graphique.',
      },
    ],
  },
  {
    id: 'modele-fr-produis-texte',
    nom: 'Français — Je produis un texte',
    sousLabel: 'Planification d’idées, rédaction guidée & révision critériée',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB4 (Français — Je produis un texte)',
    piliersInclusifsAPC: [
      'Boîte à mots thématique structurée (personnages, actions, connecteurs) visible pendant toute la rédaction',
      'Trame de planification visuelle en 3 cases et oralisation/dictée vocale de la phrase avant écriture',
      'Longueur attendue différenciée (2-3 phrases étayées ou 5-6 phrases autonomes) et grille à 3 critères maximum',
    ],
    etapesCanoniques: [
      {
        etape: '1. Découverte de la consigne & Analyse d’un modèle',
        sousTitreInvariable: 'Analyse d’un texte-modèle & cadrage de l’intention d’écriture',
        duree: '6 min',
        focusInclusif: 'Connecteurs temporels mis en évidence par couleur sur le modèle.',
      },
      {
        etape: '2. Planification orale & Boîte à mots',
        sousTitreInvariable: 'Planification en 3 temps & co-construction de la boîte à mots',
        duree: '8 min',
        focusInclusif: 'Trame à pictogrammes et amorces de phrases ou dictée à l’adulte.',
      },
      {
        etape: '3. Rédaction guidée du premier jet',
        sousTitreInvariable: 'Rédaction guidée du premier jet avec étayage individuel',
        duree: '16 min',
        focusInclusif: 'Double saut de ligne systématique et valorisation des idées avant la norme.',
      },
      {
        etape: '4. Révision & Amélioration ciblée',
        sousTitreInvariable: 'Relecture outillée par grille visuelle & enrichissement ciblé',
        duree: '8 min',
        focusInclusif: 'Grille de relecture limitée à 3 critères clairs (sens, ponctuation, mots-outils).',
      },
      {
        etape: '5. Partage & Valorisation',
        sousTitreInvariable: 'Lecture expressive des productions & valorisation du statut d’auteur',
        duree: '7 min',
        focusInclusif: 'Lecture partagée avec l’enseignant ou droit au joker pour les élèves anxieux.',
      },
    ],
  },
  {
    id: 'modele-fr-manipule-phrases-2',
    nom: 'Français — Je manipule les phrases 2',
    sousLabel: 'Expansions, transformations de phrases & chaîne d’accords',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB5 (Français — Je manipule les phrases 2)',
    piliersInclusifsAPC: [
      'Découpage physique en groupes fonctionnels (bandes pliables / ciseaux) avant manipulation écrite',
      'Matérialisation visuelle des « lunettes de la négation » et flèches couleur pour la chaîne d’accords',
      'Interligne aéré 1,5 et phrases pré-segmentées en groupe de besoin',
    ],
    etapesCanoniques: [
      {
        etape: '1. Rappel — Réduire à la phrase minimale',
        sousTitreInvariable: 'Réduction à la phrase minimale & repérage du noyau Sujet-Verbe',
        duree: '6 min',
        focusInclusif: 'Manipulation tactile avec bandes à plier/masquer pour les compléments.',
      },
      {
        etape: '2. Situation de transformation syntaxique',
        sousTitreInvariable: 'Observation des formes de phrases & anticipations d’accords',
        duree: '8 min',
        focusInclusif: 'Cartes de transformation visuelles (Négation, Pluriel, Question).',
      },
      {
        etape: '3. Atelier de manipulation en groupes de mots',
        sousTitreInvariable: 'Enrichissement, déplacement & traçage de la chaîne d’accords',
        duree: '15 min',
        focusInclusif: 'Fléchage couleur des accords (Déterminant → Nom → Adjectif ; Sujet → Verbe).',
      },
      {
        etape: '4. Synthèse sur les manipulations possibles',
        sousTitreInvariable: 'Formalisation des 4 opérations syntaxiques (Déplacer/Supprimer/Remplacer/Enrichir)',
        duree: '8 min',
        focusInclusif: 'Fiche-outil illustrée à 4 icônes d’action.',
      },
      {
        etape: '5. Exercice d’application & Vérification',
        sousTitreInvariable: 'Transformations écrites autonomes & contrôle explicite des accords',
        duree: '8 min',
        focusInclusif: 'Phrases pré-découpées et évaluation ciblée uniquement sur les accords visés.',
      },
    ],
  },
  {
    id: 'modele-fr-apprends-a-ecrire',
    nom: 'Français — J’apprends à écrire',
    sousLabel: 'Geste graphique cursif, posture, lignage & copie active',
    domaine: 'Français',
    matiere: 'Français',
    cbPrefixe: 'CB6 (Français — J’apprends à écrire)',
    piliersInclusifsAPC: [
      'Crayon ergonomique, guide-doigts et modèles placés à gauche ET à droite pour les élèves gauchers',
      'Lignage repéré en couleurs (Terre / Herbe / Ciel) et format élargi (Séyès 3-4 mm) pour dyspraxie',
      'Modèle directement au-dessus de la ligne d’écriture et évaluation sur la fluidité/soin sans sanction de vitesse',
    ],
    etapesCanoniques: [
      {
        etape: '1. Préparation motrice & Posture',
        sousTitreInvariable: 'Échauffement digital, posture corporelle & tenue du crayon',
        duree: '4 min',
        focusInclusif: 'Vérification individuelle de la prise trépied avec guide-doigts si besoin.',
      },
      {
        etape: '2. Démonstration verbalisée du tracé',
        sousTitreInvariable: 'Modélisation spatiale verbalisée du tracé cursif & repères couleur',
        duree: '6 min',
        focusInclusif: 'Tracé en grand dans les airs puis sur ardoise avec repères Terre/Herbe/Ciel.',
      },
      {
        etape: '3. Entraînement progressif sur lignage',
        sousTitreInvariable: 'Entraînement cursif guidé sur lignage adapté & liaisons fluides',
        duree: '10 min',
        focusInclusif: 'Modèles symétriques gaucher/droitier et lignage élargi 3-4 mm.',
      },
      {
        etape: '4. Copie active en mémoire',
        sousTitreInvariable: 'Stratégie de copie active par syllabes et mots entiers mémorisés',
        duree: '5 min',
        focusInclusif: 'Modèle rapproché au-dessus de la ligne pour éviter la fatigue oculaire.',
      },
      {
        etape: '5. Auto-observation & Valorisation',
        sousTitreInvariable: 'Auto-appréciation du tracé le mieux réussi & valorisation positive',
        duree: '5 min',
        focusInclusif: 'Encouragement ciblé sur la régularité du geste plutôt que la quantité.',
      },
    ],
  },
  {
    id: 'modele-sciences-humaines-1',
    nom: 'Sciences humaines 1',
    sousLabel: 'Histoire — Repères chronologiques, sources & évolution des sociétés',
    domaine: 'Sciences humaines',
    matiere: 'Sciences humaines',
    cbPrefixe: 'CB1 (Sciences humaines 1 — Histoire)',
    piliersInclusifsAPC: [
      'Code couleur fixe et permanent par grande période historique sur toutes les frises',
      'Lecture orale ou support audio systématique des sources textuelles anciennes',
      'Tableau comparatif Avant/Après avec vignettes ou étiquettes à coller plutôt que rédaction longue',
    ],
    etapesCanoniques: [
      {
        etape: '1. Réactivation des repères temporels',
        sousTitreInvariable: 'Réactivation des repères chronologiques sur la frise de classe',
        duree: '5 min',
        focusInclusif: 'Frise murale et individuelle avec code couleur chronologique constant.',
      },
      {
        etape: '2. Confrontation documentaire initiale',
        sousTitreInvariable: 'Présentation des sources historiques & problématique d’époque',
        duree: '8 min',
        focusInclusif: 'Textes lus à voix haute et agrandissement visuel des documents iconographiques.',
      },
      {
        etape: '3. Enquête & Analyse en binômes',
        sousTitreInvariable: 'Enquête documentaire guidée (Qui ? Quand ? Où ?) & comparaison',
        duree: '15 min',
        focusInclusif: 'Fiches à choix ou étiquettes-indices à placer sur les documents.',
      },
      {
        etape: '4. Synthèse chronologique & Trace écrite',
        sousTitreInvariable: 'Mise en récit historique, dates clés & positionnement sur frise',
        duree: '9 min',
        focusInclusif: 'Frise chronologique à compléter par vignettes déjà légendées.',
      },
      {
        etape: '5. Vérification & Ouverture',
        sousTitreInvariable: 'Contrôle des repères historiques, lexique & ouverture mémorielle',
        duree: '8 min',
        focusInclusif: 'Validation orale par preuve tirée d’un document.',
      },
    ],
  },
  {
    id: 'modele-sciences-humaines-2',
    nom: 'Sciences humaines 2',
    sousLabel: 'Géographie — Espaces, cartes, paysages & aménagement des territoires',
    domaine: 'Sciences humaines',
    matiere: 'Sciences humaines',
    cbPrefixe: 'CB2 (Sciences humaines 2 — Géographie)',
    piliersInclusifsAPC: [
      'Rose des vents permanente avec codes couleurs orientés sur la table et au tableau',
      'Fonds de carte simplifiés à forts contrastes et pictogrammes simples pour les figurés',
      'Grille lexicale descriptive (premier plan / arrière-plan, relief, habitat) accessible pendant l’activité',
    ],
    etapesCanoniques: [
      {
        etape: '1. Repérage spatial rapide',
        sousTitreInvariable: 'Orientation dans l’espace, points cardinaux & lecture du titre/échelle',
        duree: '5 min',
        focusInclusif: 'Rose des vents tactile/visuelle fixée au coin du bureau.',
      },
      {
        etape: '2. Observation d’un paysage ou d’une carte',
        sousTitreInvariable: 'Lecture géographique de paysage par plans & questionnement spatial',
        duree: '8 min',
        focusInclusif: 'Banque d’étiquettes lexicales géographiques à poser sur la photo.',
      },
      {
        etape: '3. Cartographie & Légende guidée',
        sousTitreInvariable: 'Croquis cartographique guidé, figurés & légende catégorisée',
        duree: '15 min',
        focusInclusif: 'Fonds de carte contrastés et gabarits simples pour les figurés.',
      },
      {
        etape: '4. Mise en relation Homme / Territoire',
        sousTitreInvariable: 'Analyse des interactions milieux naturels, ressources & aménagements',
        duree: '9 min',
        focusInclusif: 'Schéma cause-effet visuel (Atouts / Contraintes ↔ Aménagements).',
      },
      {
        etape: '5. Quiz de lecture de carte',
        sousTitreInvariable: 'Vérification autonome de localisation, orientation & légende (TOLE)',
        duree: '8 min',
        focusInclusif: 'Questionnement court avec repérage direct du doigt sur la carte.',
      },
    ],
  },
  {
    id: 'modele-sciences-techno',
    nom: 'Sciences et Technologie',
    sousLabel: 'Démarche d’investigation, expérimentation, sécurité & modélisation',
    domaine: 'Sciences & Technologie',
    matiere: 'Sciences et Technologie',
    cbPrefixe: 'CB1 (Sciences et Technologie)',
    piliersInclusifsAPC: [
      'Répartition explicite des rôles en îlot (manipulateur, observateur, secrétaire, gardien sécurité)',
      'Amorces écrites fournies (« Je pense que… parce que… », « J’observe que… ») pour alléger la rédaction',
      'Schéma d’expérience légendé accepté comme preuve scientifique complète, erreur d’hypothèse valorisée',
    ],
    etapesCanoniques: [
      {
        etape: '1. Situation étonnante & Question scientifique',
        sousTitreInvariable: 'Observation d’un phénomène intrigant & formulation du problème scientifique',
        duree: '6 min',
        focusInclusif: 'Manipulation démonstrative visible de près et lexique scientifique illustré.',
      },
      {
        etape: '2. Hypothèses & Protocole expérimental',
        sousTitreInvariable: 'Émission d’hypothèses testables & conception du protocole témoin/test',
        duree: '10 min',
        focusInclusif: 'Amorces de phrases et pictogrammes de sécurité obligatoires.',
      },
      {
        etape: '3. Expérimentation & Observation',
        sousTitreInvariable: 'Investigation expérimentale sécurisée & relevé rigoureux d’observations',
        duree: '17 min',
        focusInclusif: 'Rôles tournants structurés en îlot ; schématisation guidée à la règle.',
      },
      {
        etape: '4. Interprétation & Conclusion scientifique',
        sousTitreInvariable: 'Confrontation hypothèses/résultats & formalisation de la loi scientifique',
        duree: '10 min',
        focusInclusif: 'Valorisation de toute hypothèse réfutée comme étape scientifique normale.',
      },
      {
        etape: '5. Transfert technologique ou scientifique',
        sousTitreInvariable: 'Réinvestissement expérimental dans une situation nouvelle',
        duree: '7 min',
        focusInclusif: 'Schéma à flécher ou QCM illustré en évaluation formative.',
      },
    ],
  },
  {
    id: 'modele-education-sociale',
    nom: 'Éducation Sociale',
    sousLabel: 'Citoyenneté, droits, coopération, empathie & résolution de conflits',
    domaine: 'Éducation & Vie sociale',
    matiere: 'Éducation Sociale',
    cbPrefixe: 'CB1 (Éducation Sociale)',
    piliersInclusifsAPC: [
      'Cartes émotions visuelles et bâton de parole pour sécuriser l’expression de chacun',
      'Droit explicite de passer son tour ou d’utiliser une carte d’avis (Accord / Nuance / Désaccord)',
      'Jeux de rôle encadrés et formulations positives des règles collectives',
    ],
    etapesCanoniques: [
      {
        etape: '1. Rappel des règles du débat bienveillant',
        sousTitreInvariable: 'Contrat d’écoute bienveillante & installation du cadre de parole',
        duree: '4 min',
        focusInclusif: 'Pictogrammes de respect de la parole affichés face au groupe.',
      },
      {
        etape: '2. Situation-dilemme déclenchante',
        sousTitreInvariable: 'Présentation d’un dilemme vécu & distinction faits / émotions',
        duree: '8 min',
        focusInclusif: 'Cartes émotions visuelles pour identifier les ressentis sans blocage.',
      },
      {
        etape: '3. Atelier de médiation & Recherche de solutions',
        sousTitreInvariable: 'Débat coopératif, jeu de rôle & recherche de solutions équitables',
        duree: '13 min',
        focusInclusif: 'Classement d’images-attitudes permettant d’agir sans barrière écrite.',
      },
      {
        etape: '4. Mise en commun & Engagements collectifs',
        sousTitreInvariable: 'Formalisation des droits, devoirs & charte d’engagements positifs',
        duree: '8 min',
        focusInclusif: 'Règles formulées au positif (« Je peux / Je m’engage à… »).',
      },
      {
        etape: '5. Évaluation en situation & Bilan',
        sousTitreInvariable: 'Arbitrage argumenté de nouveaux mini-cas & prise de recul civique',
        duree: '7 min',
        focusInclusif: 'Cartes vote couleur (Vert / Orange / Rouge) pour inclure tous les élèves.',
      },
    ],
  },
  {
    id: 'modele-eps',
    nom: 'Éducation Physique et Sportive',
    sousLabel: 'Motricité, coordination, ateliers sportifs, sécurité & fair-play',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Éducation Physique et Sportive',
    cbPrefixe: 'CB1 (EPS)',
    piliersInclusifsAPC: [
      'Consignes brèves couplées à une démonstration motrice et à un double signal (visuel + sonore)',
      'Ateliers multi-niveaux à choix (cibles plus larges, distances modulées, balles souples)',
      'Rôles sociaux valorisants alternatifs en cas de fatigabilité ou besoin moteur (arbitre, coach, observateur)',
    ],
    etapesCanoniques: [
      {
        etape: '1. Rassemblement & Échauffement progressif',
        sousTitreInvariable: 'Consignes de sécurité, mise en disponibilité & échauffement progressif',
        duree: '7 min',
        focusInclusif: 'Double signal visuel + sifflet et démonstration physique immédiate.',
      },
      {
        etape: '2. Situation motrice de référence & Découverte',
        sousTitreInvariable: 'Situation motrice globale de référence & repérage des difficultés',
        duree: '8 min',
        focusInclusif: 'Zones au sol délimitées par couleurs contrastées et espacement sécurisé.',
      },
      {
        etape: '3. Ateliers d’apprentissage moteur',
        sousTitreInvariable: 'Ateliers moteurs gradués, répétition guidée & régulation posturale',
        duree: '15 min',
        focusInclusif: 'Difficulté modulable en direct par matériel adapté et cibles proches/éloignées.',
      },
      {
        etape: '4. Situation de réinvestissement ludique',
        sousTitreInvariable: 'Mise en jeu collective ou opposition loyale arbitrée en sécurité',
        duree: '10 min',
        focusInclusif: 'Rôles tournants (joueur, arbitre, observateur de critères simples).',
      },
      {
        etape: '5. Retour au calme & Bilan collectif',
        sousTitreInvariable: 'Retour au calme respiratoire, bilan moteur & fair-play partagé',
        duree: '5 min',
        focusInclusif: 'Transition respiratoire apaisée assis en cercle avant le retour en classe.',
      },
    ],
  },
  {
    id: 'modele-art-plastique',
    nom: 'Art Plastique',
    sousLabel: 'Incitation créative, exploration des matériaux & dialogue avec l’art',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Art Plastique',
    cbPrefixe: 'CB1 (Art Plastique)',
    piliersInclusifsAPC: [
      'Outils adaptés à la préhension (pinceaux à manche épais, éponges, spatules, travail possible debout)',
      'Incitation ouverte sans modèle unique à copier : toute exploration plastique est valorisée',
      'Banque de mots-étiquettes plastiques (contraste, texture, aplats, rythme) pour aider à commenter',
    ],
    etapesCanoniques: [
      {
        etape: '1. Éveil du regard & Installation',
        sousTitreInvariable: 'Éveil perceptif, installation sécurisée & lexique visuel de départ',
        duree: '5 min',
        focusInclusif: 'Outils ergonomiques préparés à portée de main selon les besoins moteurs.',
      },
      {
        etape: '2. Incitation créative & Essais libres',
        sousTitreInvariable: 'Incitation plastique ouverte & expérimentation libre sur bande d’essai',
        duree: '8 min',
        focusInclusif: 'Zéro échec sur la feuille d’essai : libération du geste créatif.',
      },
      {
        etape: '3. Réalisation personnelle accompagnée',
        sousTitreInvariable: 'Création plastique personnelle, composition & accompagnement non intrusif',
        duree: '18 min',
        focusInclusif: 'L’enseignant ne retouche pas la feuille ; gabarits optionnels si besoin.',
      },
      {
        etape: '4. Mini-galerie & Rencontre avec une œuvre',
        sousTitreInvariable: 'Mini-galerie réflexive des productions & dialogue avec une œuvre de référence',
        duree: '9 min',
        focusInclusif: 'Étiquettes de vocabulaire esthétique pour soutenir l’expression orale.',
      },
      {
        etape: '5. Rangement & Trace réflexive',
        sousTitreInvariable: 'Soin coopératif des outils, titrage de l’œuvre & trace artistique',
        duree: '5 min',
        focusInclusif: 'Rôles de nettoyage clairs et valorisation du titre choisi par l’élève.',
      },
    ],
  },
  {
    id: 'modele-activite-manuelle',
    nom: 'Activité Manuelle',
    sousLabel: 'Fabrication guidée étape par étape (mesure, découpe, pliage, assemblage)',
    domaine: 'Arts, EPS & Activité manuelle',
    matiere: 'Activité Manuelle',
    cbPrefixe: 'CB1 (Activité Manuelle)',
    piliersInclusifsAPC: [
      'Fiche de montage purement visuelle (numéros + traits pleins = couper / pointillés = plier) + prototype 3D manipulable',
      'Ciseaux adaptés (gauchers, à ressort), gabarits rigides pré-tracés pour troubles praxiques',
      'Validation bienveillante micro-étape par micro-étape avant assemblage final',
    ],
    etapesCanoniques: [
      {
        etape: '1. Observation du modèle & Règles de sécurité',
        sousTitreInvariable: 'Analyse du prototype fini, inventaire du matériel & sécurité des outils',
        duree: '5 min',
        focusInclusif: 'Prototype réel manipulable en 3D et notice visuelle sans texte dense.',
      },
      {
        etape: '2. Préparation, traçage et repérage des plis',
        sousTitreInvariable: 'Traçage avec gabarits & repérage des lignes de coupe et de pliage',
        duree: '8 min',
        focusInclusif: 'Gabarits rigides et distinction visuelle trait plein / pointillé.',
      },
      {
        etape: '3. Découpage & Assemblage guidé',
        sousTitreInvariable: 'Découpage sécurisé, marquage des plis & assemblage séquencé',
        duree: '18 min',
        focusInclusif: 'Ciseaux gauchers/ressort et rythme guidé étape après étape.',
      },
      {
        etape: '4. Finitions & Personnalisation',
        sousTitreInvariable: 'Contrôle de solidité, ajustements techniques & personnalisation soignée',
        duree: '8 min',
        focusInclusif: 'Critères visuels de qualité simples (collage net, symétrie, prénom).',
      },
      {
        etape: '5. Test collectif, Rangement & Bilan',
        sousTitreInvariable: 'Test fonctionnel de l’objet, tri des matériaux & bilan du savoir-faire',
        duree: '6 min',
        focusInclusif: 'Valorisation de la persévérance manuelle et de l’entraide.',
      },
    ],
  },
  {
    id: 'modele-remediation',
    nom: 'Remédiation APC',
    sousLabel: 'Diagnostic d’erreur bienveillant, étayage multisensoriel & consolidation',
    domaine: 'Remédiation',
    matiere: 'Remédiation',
    cbPrefixe: 'CB-REM (Remédiation APC)',
    piliersInclusifsAPC: [
      'Décentration affective : l’erreur est externalisée (« l’erreur du robot »), zéro mise en échec individuelle',
      'Changement de canal d’apprentissage (passer du tout-écrit au manipulatif, gestuel ou coloré)',
      'Co-construction d’un sous-main / marque-page anti-piège réutilisable dès le retour en classe entière',
    ],
    etapesCanoniques: [
      {
        etape: '1. Accueil rassurant & Diagnostic flash',
        sousTitreInvariable: 'Contrat de confiance sécurisant & réactivation d’une première réussite',
        duree: '5 min',
        focusInclusif: 'Défi d’entrée accessible à 100% pour installer la sécurité affective.',
      },
      {
        etape: '2. Analyse de « l’erreur du robot »',
        sousTitreInvariable: 'Décentration sur l’erreur type & identification précise de l’obstacle',
        duree: '7 min',
        focusInclusif: 'Production anonyme analysée collectivement sans stigmatiser l’élève.',
      },
      {
        etape: '3. Reprise guidée par manipulation & verbalisation',
        sousTitreInvariable: 'Étayage multisensoriel maximal & verbalisation pas-à-pas (« Je fais… parce que… »)',
        duree: '11 min',
        focusInclusif: 'Estompement progressif de l’aide selon l’aisance réelle de chaque élève.',
      },
      {
        etape: '4. Fiche-astuce personnelle',
        sousTitreInvariable: 'Co-construction d’une règle d’or visuelle / marque-page anti-piège',
        duree: '5 min',
        focusInclusif: 'Outil plastique personnel utilisable dès le lendemain en classe entière.',
      },
      {
        etape: '5. Mini-validation de réussite autonome',
        sousTitreInvariable: 'Évaluation formative courte avec outil d’aide & mesure des progrès',
        duree: '7 min',
        focusInclusif: 'Seuil explicite encourageant (ex. 2/3 réussites) avec feedback positif immédiat.',
      },
    ],
  },
  {
    id: 'modele-langues-vivantes',
    nom: 'Langues vivantes',
    sousLabel: 'Compréhension orale, phonologie, interaction en binôme & lexique actif',
    domaine: 'Langues',
    matiere: 'Langues vivantes',
    cbPrefixe: 'CB1 (Langues vivantes)',
    piliersInclusifsAPC: [
      'Double entrée sonore et visuelle (flashcards illustrées, mimes) avant toute trace écrite',
      'Répétition chorale sécurisante avant la prise de parole individuelle',
      'Écriture phonétique/visuelle tolérée en brouillon et scripts d’interaction courts à trous',
    ],
    etapesCanoniques: [
      {
        etape: '1. Rituel oral & Échauffement phonologique',
        sousTitreInvariable: 'Mise en oreille, rythme phonologique & réactivation lexicale orale',
        duree: '5 min',
        focusInclusif: 'Répétition chorale ludique sans exposition stressante individuelle.',
      },
      {
        etape: '2. Exposition situationnelle & Compréhension',
        sousTitreInvariable: 'Découverte orale contextualisée par flashcards, mime ou dialogue audio',
        duree: '8 min',
        focusInclusif: 'Supports imagés constants pour associer sens et sonorité sans traduction lourde.',
      },
      {
        etape: '3. Interaction guidée en binôme',
        sousTitreInvariable: 'Jeux de dialogue structurés & manipulation des formulations cibles',
        duree: '14 min',
        focusInclusif: 'Cartes-répliques illustrées soutenant les élèves DYS ou réservés.',
      },
      {
        etape: '4. Fixation & Trace lexicale illustrée',
        sousTitreInvariable: 'Structuration phonologique/écrite & mémorisation active du lexique',
        duree: '8 min',
        focusInclusif: 'Vignettes mot-image ou code couleur des sons spécifiques.',
      },
      {
        etape: '5. Mini-scène & Validation orale',
        sousTitreInvariable: 'Réinvestissement communicatif en micro-dialogue & bilan',
        duree: '7 min',
        focusInclusif: 'Évaluation centrée sur la communication réussie, erreur dédramatisée.',
      },
    ],
  },
];

export function findDisciplineProfile(
  identifier?: string,
  titreHint?: string
): DisciplineProfileAPC {
  const rawId = (identifier || '').trim();
  const byId = DISCIPLINE_PROFILES.find(
    (d) =>
      d.id === rawId ||
      `tpl:${d.id}` === rawId ||
      d.nom.toLowerCase() === rawId.toLowerCase()
  );
  if (byId) return byId;

  const normalized = `${rawId} ${titreHint || ''}`.toLowerCase();

  // Exact mapping for CM1 Semaine 9 template IDs & PDF titles
  if (normalized.includes('cm1-s9-fiche-01') || normalized.includes('cm1-s9-fiche-02')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-apprends-a-lire')!;
  }
  if (normalized.includes('cm1-s9-fiche-03') || normalized.includes('cm1-s9-fiche-04')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-apprends-a-parler')!;
  }
  if (normalized.includes('cm1-s9-fiche-05')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-manipule-phrases-1')!;
  }
  if (normalized.includes('cm1-s9-fiche-06')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-manipule-phrases-2')!;
  }
  if (normalized.includes('cm1-s9-fiche-07')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-produis-texte')!;
  }
  if (normalized.includes('cm1-s9-fiche-08')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-sais-ecrire-mots')!;
  }
  if (normalized.includes('cm1-s9-fiche-09')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-utilise-mots-nouveaux')!;
  }
  if (normalized.includes('cm1-s9-fiche-10')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-math-consolidation')!;
  }
  if (
    normalized.includes('cm1-s9-fiche-11') ||
    normalized.includes('cm1-s9-fiche-12') ||
    normalized.includes('cm1-s9-fiche-13') ||
    normalized.includes('cm1-s9-fiche-14')
  ) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-mathematiques')!;
  }

  // Specific sub-modules in French, Math & Sciences humaines
  if (normalized.includes('consolidation') && normalized.includes('math')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-math-consolidation')!;
  }
  if (
    normalized.includes('apprends à parler') ||
    normalized.includes('j’apprends à parler') ||
    normalized.includes('demander la permission')
  ) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-apprends-a-parler')!;
  }
  if (
    normalized.includes('utilise les mots nouveaux') ||
    normalized.includes('mots nouveaux')
  ) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-utilise-mots-nouveaux')!;
  }
  if (normalized.includes('manipule les phrases 2') || normalized.includes('phrases 2')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-manipule-phrases-2')!;
  }
  if (normalized.includes('manipule les phrases') || normalized.includes('phrases 1')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-manipule-phrases-1')!;
  }
  if (normalized.includes('apprends à lire') || normalized.includes('j’apprends à lire') || normalized.includes('fluence')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-apprends-a-lire')!;
  }
  if (normalized.includes('sais écrire') || normalized.includes('dictée') || normalized.includes('orthographe lexicale')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-sais-ecrire-mots')!;
  }
  if (normalized.includes('produis un texte') || normalized.includes('production d’écrit') || normalized.includes('rédig')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-produis-texte')!;
  }
  if (normalized.includes('apprends à écrire') || normalized.includes('calligraphie') || normalized.includes('geste graphique')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-apprends-a-ecrire')!;
  }
  if (normalized.includes('sciences humaines 2') || normalized.includes('géographie') || normalized.includes('paysage') || normalized.includes('carte')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-sciences-humaines-2')!;
  }
  if (normalized.includes('sciences humaines 1') || normalized.includes('sciences humaines') || normalized.includes('histoire')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-sciences-humaines-1')!;
  }
  if (normalized.includes('technologie') || normalized.includes('sciences et tech') || normalized.includes('expérience')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-sciences-techno')!;
  }
  if (normalized.includes('éducation sociale') || normalized.includes('civique') || normalized.includes('vivre-ensemble')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-education-sociale')!;
  }
  if (normalized.includes('physique et sportive') || normalized.includes('eps') || normalized.includes('sport')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-eps')!;
  }
  if (normalized.includes('art plastique') || normalized.includes('arts et culture') || normalized.includes('arts visuels')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-art-plastique')!;
  }
  if (normalized.includes('activité manuelle') || normalized.includes('pliage') || normalized.includes('fabrication')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-activite-manuelle')!;
  }
  if (normalized.includes('remédiation') || normalized.includes('remediation')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-remediation')!;
  }
  if (normalized.includes('langues') || normalized.includes('anglais') || normalized.includes('espagnol')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-langues-vivantes')!;
  }
  if (normalized.includes('français') || normalized.includes('francais')) {
    return DISCIPLINE_PROFILES.find((d) => d.id === 'modele-fr-manipule-phrases-1')!;
  }

  return DISCIPLINE_PROFILES[0]; // Mathématiques par défaut
}

export function getDisciplineSubtitleForStep(
  profile: DisciplineProfileAPC,
  etapeTitle: string,
  index: number
): string {
  const lower = (etapeTitle || '').toLowerCase();
  const specs = profile.etapesCanoniques;
  const exactMatch = specs.find((s) =>
    s.etape.toLowerCase().includes(lower) || lower.includes(s.etape.toLowerCase().replace(/^\d+\.\s*/, ''))
  );
  if (exactMatch) {
    return exactMatch.sousTitreInvariable;
  }
  if (lower.includes('prise en main')) {
    return 'Chant court thématique & mise en disponibilité inclusive';
  }
  if (lower.includes('contrôle du matériel')) {
    return 'Vérification du matériel scolaire & organisation du partage';
  }
  if (lower.includes('éveil mathématique')) {
    return 'Comptage rythmique & réactivation orale des nombres';
  }
  if (lower.includes('calcul mental')) {
    return 'Calcul mental stratégique sur situation concrète & ardoise';
  }
  if (lower.includes('révision')) {
    return 'Réactivation rapide des prérequis opératoires ou géométriques';
  }
  if (lower.includes('travail collectif') && lower.includes('manipulation')) {
    return 'Manipulation concrète collective guidée & observation tactile';
  }
  if (lower.includes('représentation') || lower.includes('abstraction')) {
    return 'Passage du concret au schéma et formalisation de la règle';
  }
  if (lower.includes('petits groupes') || lower.includes('individuel')) {
    return 'Application coopérative en petits groupes puis transfert individuel';
  }
  if (lower.includes('prolongement')) {
    return 'Transfert autonome & continuité pour la séance suivante';
  }
  if (specs[index]) {
    if (lower.includes('bilan') || lower.includes('évaluation') || lower.includes('validation') || lower.includes('quiz') || lower.includes('transfert')) {
      return specs[specs.length - 1].sousTitreInvariable;
    }
    if ((lower.includes('synthèse') || lower.includes('structuration') || lower.includes('règle') || lower.includes('trace') || lower.includes('galerie')) && specs[3]) {
      return specs[3].sousTitreInvariable;
    }
    if ((lower.includes('éveil') || lower.includes('mise en train') || lower.includes('échauffement') || lower.includes('accueil') || lower.includes('préparation')) && specs[0]) {
      return specs[0].sousTitreInvariable;
    }
    return specs[index].sousTitreInvariable;
  }
  return specs[index % specs.length].sousTitreInvariable;
}

export function alignFicheToDisciplineSubtitles(
  fiche: FicheAPC,
  profile: DisciplineProfileAPC,
  options?: { updateStepTitles?: boolean }
): FicheAPC {
  return {
    ...fiche,
    disciplineId: profile.id,
    matiere: profile.matiere,
    deroulement: fiche.deroulement.map((step, idx) => {
      const canonical = profile.etapesCanoniques[idx];
      const nextEtape =
        options?.updateStepTitles && canonical ? canonical.etape : step.etape;
      const nextSub =
        canonical && fiche.deroulement.length <= profile.etapesCanoniques.length
          ? canonical.sousTitreInvariable
          : getDisciplineSubtitleForStep(profile, nextEtape, idx);
      return {
        ...step,
        etape: nextEtape,
        sousTitreInvariable: nextSub,
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function buildDisciplinePromptDirectives(
  profile: DisciplineProfileAPC,
  strictSubtitles = true
): string {
  const stepsLines = profile.etapesCanoniques
    .map(
      (s, idx) =>
        `  Étape ${idx + 1} (${s.duree}) : "${s.etape}"\n    -> Sous-titre invariable OBLIGATOIRE selon la matière : "${s.sousTitreInvariable}"\n    -> Repère inclusif APC de cette étape : ${s.focusInclusif}`
    )
    .join('\n');

  return `DISCIPLINE SPÉCIFIQUE SÉLECTIONNÉE : ${profile.nom} (Domaine : ${profile.domaine} | Matière : ${profile.matiere})
- En-tête CB (Compétence de Base) : Utilise le format officiel "${profile.cbPrefixe} — [Compétence du programme adaptée au sujet]".
- ARCHITECTURE DES ÉTAPES ET SOUS-TITRES SELON CETTE MATIÈRE ${strictSubtitles ? '(INVARIABLES ET STRICTEMENT RESPECTÉS)' : '(À RESPECTER)'} :
${stepsLines}
- PÉDAGOGIE INCLUSIVE EN APC OBLIGATOIRE POUR ${profile.nom.toUpperCase()} :
${profile.piliersInclusifsAPC.map((p) => `  • ${p}`).join('\n')}`;
}
