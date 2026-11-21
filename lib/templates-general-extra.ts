import { DEFAULT_HANDICAP_PROFILES } from './inclusion';
import { ModeleFicheAPC } from './types';

export const EXTRA_GENERAL_MODELE_FICHES: ModeleFicheAPC[] = [
  {
    id: 'modele-math-consolidation',
    nom: 'Mathématiques — Consolidation',
    sousLabel: 'Calcul mental stratégique & 5 compétences de résolution graduée',
    collection: 'general',
    disciplineSpecifiqueId: 'modele-math-consolidation',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '60 min',
    description:
      'Trame complète de consolidation mathématique APC : éveil numérique, calcul mental rapide (PLM), analyse des données, choix de question/opération, composition et résolution multi-étapes.',
    competenceDeBaseModele:
      'CB1 + CB2 (Mathématiques — Consolidation) — Mobiliser le calcul réfléchi, les conversions et les schémas en barres pour analyser, composer et résoudre des problèmes concrets.',
    competenceViseeModele:
      'Enchaîner avec rigueur les 5 sous-compétences du résolveur de problèmes (Analyser, Questionner, Choisir l’opération, Composer, Résoudre) et justifier ses résultats.',
    titreSuggere: 'Consolidation mathématique : calcul réfléchi et résolution graduée',
    themeSuggere: 'Problèmes de la vie courante, partages, mesures et grandeurs',
    objectifsSpecifiques: [
      'Automatiser les stratégies de calcul mental (÷5, ÷50, compléments et multiplications rapides).',
      'Trier les données utiles, formuler la question pertinente et choisir l’opération adaptée.',
      'Résoudre un problème complet en s’appuyant sur un schéma en barres et les conversions exactes.',
    ],
    prerequis: [
      'Maîtriser les tables de multiplication usuelles et le tableau de conversion des unités.',
    ],
    materielSuggere: [
      'Ardoise effaçable, bâtonnets/jetons de manipulation et règle',
      'Tableau de conversion plastifié en couleurs',
      'Étiquettes-énoncés manipulables et fiches à énoncés épurés (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Défi d’atelier : comment vérifier en moins de 30 secondes si un partage de 300 cahiers par lots de 50 tombe juste ?',
      miseEnSituation:
        'Les élèves échangent sur les astuces de calcul mental et rappellent la démarche en 4 temps : Comprendre → Schématiser → Calculer → Vérifier.',
      consigneDepart:
        'Préparez votre ardoise pour le calcul rapide puis analysons ensemble chaque étape d’un problème.',
    },
    includeManipulable: true,
    manipulableType: 'proportionnalite',
    etapes: [
      {
        etape: 'Prise en main & Contrôle du matériel',
        sousTitreInvariable: 'Chant thématique & vérification ardoise, bâtonnets et matériel partagé',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Montrez votre ardoise, votre craie et vos bâtonnets.\nQ2 : Qui partage le matériel avec son voisin ?\n• Lance un chant rythmé bref puis vérifie que chaque élève dispose du tableau de conversion.',
        activitesEleves:
          'R1 : Voici mon ardoise et mes bâtonnets.\nR2 : Je partage avec mon camarade de table.\n• Chante ensemble et pose les outils prêts sur le coin du bureau.',
        indicateursInclusifs:
          '• Vérification bienveillante du matériel et partage organisé.\n[Inclusion handicap] Auditif/TSA : signal visuel d’entrée dans la tâche ; Moteur/Visuel : ardoise stabilisée et tableau agrandi.',
      },
      {
        etape: 'Éveil mathématique & Calcul mental',
        sousTitreInvariable: 'Révision tables & automatisation des stratégies de calcul rapide (÷5, ÷50)',
        duree: '10 min',
        activitesMaitre:
          '• Fait compter par sauts de 4 et de 5.\nQ1 : Comment diviser mentalement 40 par 5 puis 300 par 50 (PLM sur ardoise) ?\nQ2 : Quelle astuce fonctionne à tous les coups ?',
        activitesEleves:
          'R1 : 40 ÷ 5 = 8 ; 300 ÷ 50 = 6 (écrit sur ardoise au signal).\nR2 : Pour ÷5, on fait ÷10 puis ×2 ; pour ÷50, on fait ÷100 puis ×2.',
        indicateursInclusifs:
          '• Procédure PLM simultanée sur ardoise.\n[Inclusion handicap] DYS/Dyscalculie : schéma en 5 parts égales affiché au tableau et bande numérique de repère autorisée.',
      },
      {
        etape: 'Résolution 1 & 2 : Analyser & Poser la question',
        sousTitreInvariable: 'Tri des données utiles, échelle géométrique & formulation de la question pertinente',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Dans cet énoncé, quelles données sont utiles pour répondre et quel mot-clé indique la grandeur ?\nQ2 : Quelle question mathématique précise peut-on poser à partir des données restantes ?',
        activitesEleves:
          'R1 : Les élèves entourent uniquement les nombres utiles et barrent les informations superflues.\nR2 : Formulent une question cohérente à l’oral puis à l’ardoise et vérifient la vraisemblance.',
        indicateursInclusifs:
          '• Lecture analytique guidée avant tout calcul.\n[Inclusion handicap] TSA/DYS/Visuel : surlignage couleur des données utiles et choix guidé entre deux propositions de questions.',
      },
      {
        etape: 'Résolution 3 & 4 : Opération & Composition',
        sousTitreInvariable: 'Conversion d’unités, choix de l’opération & remise en ordre d’énoncé cohérent',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Avant d’additionner des grandeurs, que devons-nous toujours vérifier sur les unités ?\nQ2 : Dans quel ordre logique placer ces étiquettes-phrases pour fabriquer un problème cohérent ?',
        activitesEleves:
          'R1 : Il faut tout convertir dans la même unité à l’aide du tableau.\nR2 : Ordonnent les étiquettes (Situation → Données → Question) et nomment l’opération adaptée.',
        indicateursInclusifs:
          '• Conversion systématique et manipulation d’étiquettes.\n[Inclusion handicap] Moteur/DYS : vraies étiquettes cartonnées à déplacer sur table sans copie longue.',
      },
      {
        etape: 'Résolution 5 : Problèmes complets de synthèse',
        sousTitreInvariable: 'Résolution multi-étapes (masses, fractions, tracés à l’échelle) & vérification',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quelle représentation en barres montre les étapes du calcul ?\nQ2 : Comment contrôler que la phrase-réponse répond exactement à la question avec la bonne unité ?',
        activitesEleves:
          'R1 : Dessinent le schéma en barres, posent les opérations dans l’ordre et rédigent la phrase-réponse.\nR2 : Vérifient l’ordre de grandeur et l’unité finale.',
        indicateursInclusifs:
          '• Démarche structurée : Schéma / Calcul / Phrase-réponse.\n[Inclusion handicap] Dyscalculie/Visuel/Moteur : schéma pré-amorcé, calculatrice de vérification ou réponse orale étayée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment calculer mentalement 350 ÷ 50 ou 45 ÷ 5 sans poser la division ?',
        reponseAttendue: 'On divise d’abord par 100 (ou par 10), puis on multiplie le résultat par 2 : 350 ÷ 100 × 2 = 7 ; 45 ÷ 10 × 2 = 9.',
        indicePedagogique: 'Souviens-toi que 5 est la moitié de 10 et 50 est la moitié de 100.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Quelles étapes suivre avant de choisir une opération dans un problème long ?',
        reponseAttendue: 'Lire la question finale, trier les données utiles, convertir dans la même unité et tracer un schéma en barres.',
        indicePedagogique: 'Ne commence jamais à calculer avant d’avoir repéré l’unité demandée.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Remets en ordre et résous : (a) Il dépense 1/4 de ses 200 F. (b) Ali a 200 F. (c) Combien lui reste-t-il ?',
        reponseAttendue: 'Ordre b → a → c. Dépense = 200 ÷ 4 = 50 F ; reste = 200 − 50 = 150 F.',
        indicePedagogique: 'Place d’abord la situation de départ, puis l’action, puis la question.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Consolider en mathématiques, c’est automatiser le calcul réfléchi et enchaîner analyse, schéma, conversion et vérification.',
      traceEcriteEleve: '÷5 = ÷10 × 2 · ÷50 = ÷100 × 2. Je trie les données, je schématise en barres et je vérifie l’unité.',
      motsCles: ['Consolidation', 'Calcul mental', 'Analyse', 'Schéma en barres', 'Vérification'],
      prolongement: 'Faire inventer en binôme un problème à deux étapes pour un autre groupe.',
    },
  },
  {
    id: 'modele-fr-apprends-a-parler',
    nom: 'Français — J’apprends à parler',
    sousLabel: 'Communication orale, actes de parole, jeux de rôles & transfert',
    collection: 'general',
    disciplineSpecifiqueId: 'modele-fr-apprends-a-parler',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '35 min',
    description:
      'Modèle structuré de communication orale en APC : chant, activation en binômes, observation silencieuse d’image, expression libre, expression dirigée par jeux de rôles et transfert.',
    competenceDeBaseModele:
      'CB1 (Français — Communication orale) — Mobiliser le lexique et les actes de parole adaptés pour interagir poliment et avec aisance dans des situations de communication courantes.',
    competenceViseeModele:
      'Produire à l’oral des énoncés complets et appropriés à la situation en respectant les formules de politesse et l’intonation.',
    titreSuggere: 'J’apprends à parler : utiliser les actes de parole en situation',
    themeSuggere: 'Communication orale — Interaction, politesse et jeux de rôles',
    objectifsSpecifiques: [
      'Observer et décrire une situation imagée avec un vocabulaire précis.',
      'Employer correctement les formules d’actes de parole cibles en contexte.',
      'Réinvestir ces structures dans un dialogue spontané ou un jeu de rôles.',
    ],
    prerequis: [
      'Écouter son interlocuteur sans l’interrompre et parler distinctement.',
    ],
    materielSuggere: [
      'Image support grand format du manuel ou affiche contrastée',
      'Cartes-structures d’actes de parole (Demande / Réponse)',
      'Pictogrammes visuels des personnages et lieux (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Chant collectif rythmé puis court dialogue modèle joué devant la classe.',
      miseEnSituation:
        'Activation rapide en binômes des formules déjà connues suivie d’une observation silencieuse de l’image support.',
      consigneDepart:
        'Observez attentivement la scène sur l’image avant de dire librement ce que vous voyez.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en confiance vocale collective',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant allons-nous interpréter pour lancer notre séance d’oral ?\n• Entonne le chant face à la classe en marquant le rythme.',
        activitesEleves:
          'R : Nous chantons « … » avec entrain et articulation claire.',
        indicateursInclusifs:
          '• Participation joyeuse et mise en voix collective.\n[Inclusion handicap] Auditif/TSA/Moteur : gestes visibles face classe et posture assise ou debout libre.',
      },
      {
        etape: '2. Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & organisation du partage en binôme',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Ouvrez votre manuel à la page de l’image.\nQ2 : Qui partage son manuel ou sa planche agrandie avec son voisin ?',
        activitesEleves:
          'R1 : J’ouvre le livre à la bonne page.\nR2 : Je partage l’image avec mon voisin.',
        indicateursInclusifs:
          '• Vérification rapide dans les rangs.\n[Inclusion handicap] Visuel : mettre à disposition une copie A3 contrastée de l’image.',
      },
      {
        etape: '3. Activation des prérequis',
        sousTitreInvariable: 'Réactivation dialoguée en binômes des actes de parole connus',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Deux à deux, comment saluer ou demander un renseignement poliment ?\nQ2 : Qui veut rejouer son micro-dialogue devant la classe ?',
        activitesEleves:
          'R1 : Échangent deux à deux en réutilisant les formules apprises précédemment.\nR2 : Rejouent le dialogue avec intonation.',
        indicateursInclusifs:
          '• Réactivation orale par binômes.\n[Inclusion handicap] DYS/Auditif : garder les structures connues écrites en gros caractères au tableau.',
      },
      {
        etape: '4. Situation problème',
        sousTitreInvariable: 'Observation silencieuse de l’image support & repérage initial',
        duree: '4 min',
        activitesMaitre:
          'Q : Regardez attentivement qui est sur l’image, où ils se trouvent et ce qui se passe.\n• Accorde 1 minute d’observation silencieuse.',
        activitesEleves:
          'R : Observent en silence les personnages, le décor et les indices visuels avant de lever le doigt.',
        indicateursInclusifs:
          '• Temps d’observation respecté.\n[Inclusion handicap] Visuel : description verbale structurée des plans de l’image pour l’élève malvoyant.',
      },
      {
        etape: '5. Expression libre',
        sousTitreInvariable: 'Prise de parole spontanée sur l’image & relevé bienveillant des écarts',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Que voyez-vous sur cette scène ?\nQ2 : Qui peut ajouter un détail sur les attitudes ou les objets ?\n• Note discrètement les erreurs syntaxiques à corriger ensuite.',
        activitesEleves:
          'R1 : Décrivent spontanément les personnages, les lieux et les actions.\nR2 : Complètent les observations des camarades.',
        indicateursInclusifs:
          '• Prise de parole libre sans interruption punitive.\n[Inclusion handicap] TSA/Auditif : phrases courtes acceptées ou pointage sur image avant reformulation bienveillante.',
      },
      {
        etape: '6. Expression dirigée',
        sousTitreInvariable: 'Questionnement ciblé, mémorisation des structures & jeux de rôles guidés',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Que dit le premier personnage et avec quelle formule ?\nQ2 : Que répond son interlocuteur ?\n• Fait répéter les 3 structures clés et dirige des jeux de rôles deux à deux.',
        activitesEleves:
          'R1 : Repèrent et répètent les actes de parole modèles avec le bon ton.\nR2 : Jouent la scène en binôme devant le groupe.',
        indicateursInclusifs:
          '• Correction bienveillante de la prononciation et de la politesse.\n[Inclusion handicap] Auditif/DYS/TSA : cartes-répliques doubles en couleurs (Demande / Réponse) manipulées face à face.',
      },
      {
        etape: '7. Phase de transfert',
        sousTitreInvariable: 'Réinvestissement autonome des actes de parole dans de nouveaux scénarios',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Comment adapter ces mêmes formules à la maison, au marché ou dans la cour ?\n• Propose deux nouveaux contextes à jouer.',
        activitesEleves:
          'R1 : Inventent et jouent des dialogues originaux dans une nouvelle situation de vie courante.',
        indicateursInclusifs:
          '• Variation des contextes quotidiens.\n[Inclusion handicap] TSA/Moteur : temps de préparation de 1 minute en binôme et jeu assis ou debout libre.',
      },
      {
        etape: '8. Bilan',
        sousTitreInvariable: 'Verbalisation des formules apprises & usage dans la vie quotidienne',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Quelles expressions nouvelles avons-nous apprises aujourd’hui ?\nQ2 : Quand allez-vous les utiliser dès ce soir ?',
        activitesEleves:
          'R1 : Citer 2 ou 3 formules clés apprises pendant la séance.\nR2 : Indiquer une situation concrète en famille ou à l’école.',
        indicateursInclusifs:
          '• Expression de 3 à 4 élèves variés.\n[Inclusion handicap] Validation par geste ou carte-formule possible pour les élèves peu verbaux.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quelles sont les deux règles d’or pour réussir un dialogue poli à l’oral ?',
        reponseAttendue: 'Regarder et écouter son interlocuteur, puis utiliser la formule adaptée avec une intonation aimable.',
        indicePedagogique: 'Pense à la posture, au volume de voix et au mot de politesse.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment adapter sa demande selon que l’on parle à un camarade ou à un adulte ?',
        reponseAttendue: 'On emploie le tutoiement (« Peux-tu… ») avec un camarade et le vouvoiement (« Pourriez-vous / M’autorisez-vous… ») avec un adulte.',
        indicePedagogique: 'Observe comment changent « tu » et « vous » et la terminaison du verbe.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Imagine un court dialogue de 2 répliques pour demander un service à un voisin.',
        reponseAttendue: 'Ex. « Bonjour, pourriez-vous me prêter une chaise s’il vous plaît ? – Avec plaisir, la voici ! »',
        indicePedagogique: 'Réutilise une formule d’ouverture + une formule de réponse polie.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'À l’oral, j’observe la situation, j’emploie la formule adaptée à mon interlocuteur et je parle avec politesse.',
      traceEcriteEleve: 'Formules du jour affichées : [Demander] + [Répondre poliment] + [Adapter tu / vous].',
      motsCles: ['Oral', 'Acte de parole', 'Politesse', 'Jeu de rôles', 'Transfert'],
      prolongement: 'Réutiliser une des formules apprises à la maison ou en récréation.',
    },
  },
  {
    id: 'modele-fr-utilise-mots-nouveaux',
    nom: 'Français — J’utilise les mots nouveaux',
    sousLabel: 'Vocabulaire contextualisé, dramatisation, fixation & réemploi écrit',
    collection: 'general',
    disciplineSpecifiqueId: 'modele-fr-utilise-mots-nouveaux',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Séance complète d’acquisition lexicale en contexte : prérequis sur ardoise, imprégnation par texte support, élévation du sens par dramatisation/objets/synonymes, fixation et transfert.',
    competenceDeBaseModele:
      'CB1 + CB3 (Français — Vocabulaire) — Comprendre, mémoriser et réemployer avec exactitude des mots et expressions nouveaux à l’oral et à l’écrit.',
    competenceViseeModele:
      'Expliquer le sens de mots nouveaux en contexte et les réutiliser dans des phrases personnelles justes et orthographiées.',
    titreSuggere: 'J’utilise les mots nouveaux : comprendre, fixer et réemployer le lexique',
    themeSuggere: 'Vocabulaire en contexte, synonymes, contraires et familles de mots',
    objectifsSpecifiques: [
      'Dégager le sens d’un mot nouveau grâce au contexte, aux objets ou à la dramatisation.',
      'Orthographier correctement les mots étudiés et trouver un synonyme ou contraire.',
      'Réemployer ces mots nouveaux dans une phrase ou un court paragraphe personnel.',
    ],
    prerequis: [
      'Lire un court paragraphe et utiliser le contexte pour anticiper le sens d’un mot.',
    ],
    materielSuggere: [
      'Texte support agrandi avec mots cibles surlignés',
      'Objets réels, images illustrées et étiquettes-mots',
      'Ardoise, craie, chiffon et carnet de vocabulaire (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Lecture d’un court extrait comportant 3 mots mystérieux soulignés : qui devine déjà ce qu’ils veulent dire ?',
      miseEnSituation:
        'Réactivation des mots de la séance précédente à l’ardoise puis découverte du texte support.',
      consigneDepart:
        'Repérez chaque mot nouveau dans la phrase et cherchons ensemble comment le mimer ou l’illustrer.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en disponibilité du groupe',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant lançons-nous pour dynamiser la classe ?\n• Entonne le chant et vérifie l’attention.',
        activitesEleves:
          'R : Chante avec le groupe en suivant le rythme.',
        indicateursInclusifs:
          '• Disponibilité calme et joyeuse.\n[Inclusion handicap] Auditif/TSA : annonce visuelle de la séance de vocabulaire.',
      },
      {
        etape: '2. Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon, texte support & entraide',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez votre ardoise et le texte support.\nQ2 : Qui manque d’un outil et partage avec son voisin ?',
        activitesEleves:
          'R1 : Voici mon ardoise et ma fiche.\nR2 : Je partage le texte agrandi avec mon voisin.',
        indicateursInclusifs:
          '• Vérification rapide.\n[Inclusion handicap] Visuel/Moteur : texte corps 16+, mots cibles surlignés, feutre ergonomique.',
      },
      {
        etape: '3. Activation des prérequis',
        sousTitreInvariable: 'Réinvestissement lexical sur ardoise à partir des mots précédents',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Qui peut écrire ou employer à l’oral un mot appris la dernière fois ?\nQ2 : Quel mot de sens proche connaît-on ?',
        activitesEleves:
          'R1 : Écrivent un mot ou une courte phrase sur ardoise.\nR2 : Proposent un synonyme ou un exemple concret.',
        indicateursInclusifs:
          '• Réemploi actif immédiat.\n[Inclusion handicap] DYS/Moteur : banque d’étiquettes-mots visible pour éviter la surcharge d’écriture.',
      },
      {
        etape: '4. Imprégnation (Mise en situation)',
        sousTitreInvariable: 'Lecture du texte support, compréhension & dégagement des expressions cibles',
        duree: '7 min',
        activitesMaitre:
          '• Lit le texte à voix posée.\nQ1 : De quoi parle ce court texte ?\nQ2 : Quels sont les mots nouveaux mis en évidence au tableau ?',
        activitesEleves:
          'R1 : Résument l’idée générale à l’oral.\nR2 : Lisent et répètent distinctement les expressions cibles.',
        indicateursInclusifs:
          '• Accès au sens global avant l’étude lexicale.\n[Inclusion handicap] Auditif/Visuel : lecture face classe + mise en couleur des mots cibles.',
      },
      {
        etape: '5. Étude, Analyse et découverte',
        sousTitreInvariable: 'Élévation du sens par dramatisation, objets, exemples & famille de mots',
        duree: '10 min',
        activitesMaitre:
          'Q1 : Que veut dire ce mot selon la phrase ? Pouvez-vous le mimer ou montrer un exemple ?\nQ2 : Comment s’épelle-t-il et quels mots appartiennent à sa famille ?',
        activitesEleves:
          'R1 : Miment l’action, observent l’image/objet et expliquent avec leurs mots.\nR2 : Épellent le mot, notent les lettres pièges et trouvent un mot dérivé.',
        indicateursInclusifs:
          '• Découverte multisensorielle (mime + image + exemple).\n[Inclusion handicap] TSA/DYS/Auditif : associer systématiquement chaque mot à un geste ou pictogramme fixe.',
      },
      {
        etape: '6. Fixation',
        sousTitreInvariable: 'Production de phrases orales et écrites & recherche de synonymes/contraires',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Formulez oralement une phrase vraie contenant le mot nouveau.\nQ2 : Quel synonyme ou contraire peut-on associer ?',
        activitesEleves:
          'R1 : Produisent des phrases à l’oral puis en écrivent une sur ardoise.\nR2 : Proposent un synonyme ou un antonyme pertinent.',
        indicateursInclusifs:
          '• Validation orale systématique avant écriture.\n[Inclusion handicap] DYS : modèle orthographique exact laissé au tableau pendant la copie.',
      },
      {
        etape: '7. Transfert',
        sousTitreInvariable: 'Complétion en contexte & courte production écrite réutilisant les mots',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Quel mot nouveau complète exactement chaque phrase du texte à trous ?\nQ2 : Rédigez deux phrases libres sur un sujet différent avec deux mots appris.',
        activitesEleves:
          'R1 : Complètent le texte à trous et justifient leur choix.\nR2 : Rédigent leur mini-production personnelle.',
        indicateursInclusifs:
          '• Réemploi en contexte nouveau.\n[Inclusion handicap] Moteur/DYS : collage d’étiquettes ou dictée vocale/à l’adulte acceptée.',
      },
      {
        etape: '8. Bilan',
        sousTitreInvariable: 'Rappel des expressions maîtrisées & transfert en rédaction quotidienne',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Quels mots nouveaux gardez-vous dans votre « boîte à mots » aujourd’hui ?\nQ2 : Dans quelle matière ou rédaction pourrez-vous les réutiliser ?',
        activitesEleves:
          'R1 : Citer et définir brièvement 2 ou 3 mots du jour.\nR2 : Donner une idée de réemploi en expression écrite ou orale.',
        indicateursInclusifs:
          '• Ancrage dans le répertoire personnel.\n[Inclusion handicap] Carnet lexical illustré complété par pictogramme ou mot-exemple.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment trouver le sens d’un mot inconnu sans ouvrir tout de suite le dictionnaire ?',
        reponseAttendue: 'En relisant les mots avant et après dans la phrase (le contexte) et en cherchant sa famille de mots.',
        indicePedagogique: 'Regarde les indices donnés par le verbe, le lieu ou les autres mots de la phrase.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Quelle différence y a-t-il entre un synonyme et un contraire (antonyme) ?',
        reponseAttendue: 'Un synonyme a presque le même sens (ex. joyeux / ravi), tandis qu’un contraire a le sens opposé (joyeux / triste).',
        indicePedagogique: 'Vérifie si tu peux remplacer le mot dans la phrase sans changer le sens général.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Réemploie un mot nouveau étudié dans une phrase personnelle qui montre clairement son sens.',
        reponseAttendue: 'Ex. Une phrase contextuellement précise où le mot ne peut pas être confondu (sujet + verbe + précision de sens).',
        indicePedagogique: 'Ajoute un détail (« parce que… » ou un lieu) qui aide le lecteur à comprendre le mot.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Pour maîtriser un mot nouveau : je le comprends en contexte, je le mime ou l’illustre, j’observe son orthographe et je le réemploie.',
      traceEcriteEleve: 'Mots nouveaux du jour + Définition simple + Exemple personnel + Mot de la même famille.',
      motsCles: ['Vocabulaire', 'Contexte', 'Dramatisation', 'Synonyme', 'Réemploi'],
      prolongement: 'Réutiliser au moins 2 mots nouveaux dans la prochaine séance de production d’écrit.',
    },
  },
  {
    id: 'modele-langues-vivantes',
    nom: 'Langues vivantes',
    sousLabel: 'Compréhension orale, phonologie, interaction en binôme & trace lexicale',
    collection: 'general',
    disciplineSpecifiqueId: 'modele-langues-vivantes',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Langues',
    matiere: 'Langues vivantes',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Séance communicative de langue vivante en APC : rituel phonologique choral, découverte multisensorielle par flashcards, jeux de dialogue en binôme et trace lexicale illustrée.',
    competenceDeBaseModele:
      'CB1 (Langues vivantes) — Comprendre des énoncés oraux simples et interagir dans des situations de communication quotidiennes avec une prononciation intelligible.',
    competenceViseeModele:
      'Identifier à l’oral et réemployer dans un micro-dialogue 5 à 6 mots ou formulations cibles avec l’intonation adaptée.',
    titreSuggere: 'Langues vivantes : comprendre à l’oral et dialoguer en binôme',
    themeSuggere: 'Communication du quotidien — Salutations, goûts, famille ou école',
    objectifsSpecifiques: [
      'Reconnaître à l’écoute les mots et structures cibles associés aux flashcards.',
      'Reproduire collectivement puis en binôme le rythme et la phonologie justes.',
      'Mener un court échange question-réponse en autonomie devant le groupe.',
    ],
    prerequis: [
      'Connaître les formules de salutation de base et les consignes de classe simples.',
    ],
    materielSuggere: [
      'Jeu de flashcards grand format illustrées et sans texte parasite',
      'Cartes-répliques de dialogue et support audio natif',
      'Vignettes mot-image à découper/coller (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Rituel d’accueil gestuel dans la langue cible accompagné d’une devinette sonore ou d’un sac mystère contenant des cartes illustrées.',
      miseEnSituation:
        'Les élèves écoutent un court dialogue authentique et pointent les images correspondantes sans traduire mot à mot.',
      consigneDepart:
        'Écoutez d’abord attentivement, associez chaque son à son image, puis répétez ensemble en rythme.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: '1. Rituel oral & Échauffement phonologique',
        sousTitreInvariable: 'Mise en oreille, rythme phonologique & réactivation lexicale orale',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Greeting & weather ritual — Quel mot ou quelle formule avons-nous apprise lors du dernier rituel ?\nQ2 : Répétons ensemble ce son difficile en frappant la syllabe accentuée.',
        activitesEleves:
          'R1 : Répondent en chœur puis par volontaires aux salutations rituelles.\nR2 : Répètent en jouant sur la voix (chuchotée, joyeuse, rythmée).',
        indicateursInclusifs:
          '• Répétition chorale sécurisante sans exposition stressante.\n[Inclusion handicap] Auditif/TSA/DYS : double entrée orale + geste + flashcard visible face classe.',
      },
      {
        etape: '2. Exposition situationnelle & Compréhension',
        sousTitreInvariable: 'Découverte orale contextualisée par flashcards, mime ou dialogue audio',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Quelle flashcard correspond au mot que vous venez d’entendre ?\nQ2 : Quel geste permet de montrer l’action sans traduire en français ?',
        activitesEleves:
          'R1 : Pointent ou lèvent la bonne carte illustrée à l’écoute.\nR2 : Associent immédiatement le mime au mot prononcé.',
        indicateursInclusifs:
          '• Accès au sens par l’image et le mime.\n[Inclusion handicap] Visuel/Auditif : cartes contrastées grand format, articulation claire face au groupe.',
      },
      {
        etape: '3. Interaction guidée en binôme',
        sousTitreInvariable: 'Jeux de dialogue structurés & manipulation des formulations cibles',
        duree: '15 min',
        activitesMaitre:
          'Q1 : Quelle question poser à son partenaire avec la carte piochée ?\nQ2 : Comment répondre en phrase complète plutôt que par un seul mot ?',
        activitesEleves:
          'R1 : Échangent deux à deux en piochant des cartes-répliques.\nR2 : Formulent question et réponse complètes en s’aidant mutuellement.',
        indicateursInclusifs:
          '• Manipulation orale en binômes coopératifs.\n[Inclusion handicap] DYS/TSA : cartes-répliques illustrées à structure fixe et écriture phonétique simple autorisée.',
      },
      {
        etape: '4. Fixation & Trace lexicale illustrée',
        sousTitreInvariable: 'Structuration phonologique/écrite & mémorisation active du lexique',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Comment relier chaque mot écrit à sa vignette image dans votre cahier ?\nQ2 : Quels sons s’écrivent différemment de leur prononciation ?',
        activitesEleves:
          'R1 : Associent vignettes image et étiquettes-mots puis vérifient ensemble.\nR2 : Repèrent en couleur les sons particuliers de la langue cible.',
        indicateursInclusifs:
          '• Trace écrite légère et illustrée.\n[Inclusion handicap] Moteur/DYS : collage des vignettes déjà imprimées plutôt que copie longue.',
      },
      {
        etape: '5. Mini-scène & Validation orale',
        sousTitreInvariable: 'Réinvestissement communicatif en micro-dialogue & bilan',
        duree: '8 min',
        activitesMaitre:
          'Q1 : Qui souhaite jouer sa mini-scène de 2 à 4 répliques avec son binôme ?\nQ2 : Qu’avons-nous réussi à dire aujourd’hui dans cette langue ?',
        activitesEleves:
          'R1 : Jouent le micro-dialogue avec naturel et écoute mutuelle.\nR2 : Citer une phrase entière maîtrisée en fin de séance.',
        indicateursInclusifs:
          '• Évaluation centrée sur la communication réussie.\n[Inclusion handicap] Droit au jeu en binôme avec carte-aide visible ; zéro sanction de l’accent.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment mémoriser plus facilement un nouveau mot en langue vivante ?',
        reponseAttendue: 'En l’écoutant plusieurs fois, en le répétant à voix haute et en l’associant à une image ou un geste.',
        indicePedagogique: 'Utilise ta mémoire auditive et visuelle en même temps plutôt que d’essayer d’épeler d’abord.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Pourquoi travaille-t-on d’abord à l’oral et par images avant d’écrire les mots ?',
        reponseAttendue: 'Parce que l’orthographe d’une langue étrangère ne se lit pas toujours comme en français : entendre d’abord évite de mal prononcer.',
        indicePedagogique: 'Pense au décalage entre ce qu’on entend et ce qui est écrit.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Formule un mini-dialogue de 2 répliques réinvestissant la structure du jour.',
        reponseAttendue: 'Une question claire adressée au partenaire et une réponse complète adaptée à la situation.',
        indicePedagogique: 'Appuie-toi sur les deux cartes-répliques de l’atelier en binôme.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En langue vivante, j’écoute, je mime et j’associe à l’image, puis j’ose dialoguer en binôme.',
      traceEcriteEleve: 'Mes 5 mots-images du jour + 1 question et 1 réponse modèles illustrées.',
      motsCles: ['Écoute', 'Phonologie', 'Flashcards', 'Dialogue', 'Interaction'],
      prolongement: 'Refaire le rituel d’ouverture en début de journée dès le lendemain.',
    },
  },
];
