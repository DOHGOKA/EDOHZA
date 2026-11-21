import { DEFAULT_HANDICAP_PROFILES } from './inclusion';
import { ModeleFicheAPC } from './types';

export const CM1_S9_FR_TEMPLATES: ModeleFicheAPC[] = [
  // FICHE 1
  {
    id: 'cm1-s9-fiche-01',
    nom: 'Fiche 1 · J’apprends à lire — La fête de fin d’année',
    sousLabel: 'CM1 Semaine 9 · Lecture silencieuse, lecture à haute voix, liaisons & fluence (CB2)',
    collection: 'cm1_s9',
    ficheNumero: 1,
    disciplineSpecifiqueId: 'modele-fr-apprends-a-lire',
    origineModele: 'CM1 · Semaine 9 · Fiche 1',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '40 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 1) : lecture silencieuse avec fiches autocorrectives, lecture magistrale, pauses (//, /) et liaisons obligatoires (---), adaptée aux élèves en situation de handicap.',
    competenceDeBaseModele:
      'CB2 : Mobiliser les ressources de la langue pour prélever les informations utiles et réagir juste à travers la lecture et l’exploitation de différents types de textes d’au moins dix phrases dans des situations de vie courante.',
    competenceViseeModele:
      'Lire de manière expressive et courante le texte « La fête de fin d’année scolaire » en respectant la prononciation, les pauses et les liaisons.',
    titreSuggere: 'La fête de fin d’année scolaire (J’apprends à lire)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Lire de manière expressive et courante le texte proposé (page 90).',
      'Lire en respectant la prononciation, la ponctuation (/, //), les liaisons (---) et l’intonation.',
    ],
    prerequis: [
      'Connaître la valeur des signes de ponctuation (point, virgule) et le principe de liaison entre mots.',
    ],
    materielSuggere: [
      'Texte : Mon livre de français CM1 (guide du maître p. 123-124, manuel p. 90)',
      'Fiches autocorrectives de compréhension',
      'Version agrandie corps 18 sans empattement, cache-ligne contrasté et cartes-réponses visuelles (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Chant court collectif sur les fêtes scolaires, rythmé visuellement pour capter l’attention de toute la classe.',
      miseEnSituation:
        'Rappel des moments de réjouissance à l’école avant les vacances (fête de fin d’année : chants, danses, jeux, repas partagés).',
      consigneDepart:
        'Ouvrez votre livre de français CM1 à la page 90 (ou utilisez le texte agrandi/cache-ligne remis sur table).',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant joyeux en lien avec les fêtes allons-nous chanter pour ouvrir la séance ?\nQ2 : Qui veut battre la mesure avec moi ?\n• Lance le chant choisi avec la classe, bat la mesure face aux élèves et invite chacun à chanter avec entrain.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant choisi avec la classe).\nR2 : Un élève volontaire accompagne le rythme ; toute la classe chante en respectant la mélodie (debout ou assis selon le besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court, connu, participation de toute la classe · Contrôle Q/R : Q « Quel thème évoque notre chant ? » → R « La fête et la joie partagée ».\n[Inclusion handicap] Auditif/TSA : battre la mesure visiblement face classe avec signal visuel d’ouverture ; Moteur : participation assise autorisée.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & partage coopératif du support',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre livre de français CM1 et votre cahier de brouillon.\nQ2 : Qui n’a pas son livre aujourd’hui ? Avec quel camarade de table peut-il le partager ?',
        activitesEleves:
          'R1 : Je montre mon livre de français CM1 posé ouvert sur la table.\nR2 : Je n’ai pas mon livre ; je le partage avec mon voisin (ou j’utilise la fiche agrandie).',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide en circulant et partage effectif · Contrôle Q/R : Q « Tout le monde voit-il bien la page du texte ? » → R « Oui, en binôme ou sur support adapté ».\n[Inclusion handicap] Visuel/DYS : remettre le texte agrandi corps 18 sans empattement, interligne 1,5 et le guide-ligne contrasté.',
      },
      {
        etape: 'Mise en situation – Annonce de l’objet et des objectifs',
        sousTitreInvariable: 'Ancrage dans le vécu, annonce explicite de l’objet & des objectifs de lecture',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Que font souvent les élèves et les maîtres de votre école avant de partir en vacances, à la fin de l’année scolaire ?\nQ2 : Comment appelle-t-on ce moment de réjouissance et qu’y fait-on d’habitude ?\n• Annonce l’objet : « Aujourd’hui, nous allons étudier un texte qui parle de la fête de fin d’année scolaire. »\n• Annonce les objectifs : lire de façon expressive et courante en respectant la ponctuation et les liaisons.\nConsigne : Ouvrez votre livre à la page 90.',
        activitesEleves:
          'R1 : Les élèves et les maîtres organisent une fête à l’école avant les vacances.\nR2 : C’est la fête de fin d’année scolaire ; on chante, on danse, on joue et on mange ensemble.\n• Redit l’objet de la leçon avec ses propres mots et ouvre le manuel à la page 90.',
        indicateursInclusifs:
          '• Indicateur pédagogique : ancrage dans le vécu et reformulation de l’objet par 1 ou 2 élèves · Contrôle Q/R : Q « À quelle page se trouve le texte et quel en est le titre ? » → R « Page 90 : La fête de fin d’année scolaire ».\n[Inclusion handicap] Auditif/TSA : écrire en grand « Page 90 » et les objectifs en 2 lignes claires face classe.',
      },
      {
        etape: 'Lecture silencieuse',
        sousTitreInvariable: 'Lecture silencieuse guidée & compréhension avec fiches autocorrectives',
        duree: '10 min',
        activitesMaitre:
          'Consigne : Lisez tout le texte en silence, sans bouger les lèvres ni suivre à voix haute, puis répondez aux questions.\nQ1 : Quelle fête célèbrent-ils et où ont-ils trouvé l’argent ? Q2 : Quelles activités sont programmées ?\nQ3 : Qu’a demandé Tété à son père et quelle a été sa réponse ?\nQ4 : Qui était l’invité spécial et quels deux prix ont été gagnés ? Q5 : De quoi parle le texte en général ?\n• Fait corriger à l’aide des fiches autocorrectives.',
        activitesEleves:
          '• Lit silencieusement durant 3 à 5 minutes.\nR1 : La fête de fin d’année scolaire ; grâce à la vente des produits du jardin scolaire et aux dons collectés.\nR2 : Une kermesse, un pique-nique et divers jeux dotés de prix.\nR3 : Son lecteur CD ; son père a accepté avec plaisir.\nR4 : L’inspecteur ; une bande dessinée et un livre de conte.\nR5 : De l’organisation et du déroulement d’une fête de fin d’année à l’école (se corrige avec la fiche autocorrective).',
        indicateursInclusifs:
          '• Indicateur pédagogique : lecture vraiment silencieuse + réponses justifiées · Contrôle Q/R : Q « Comment les élèves ont-ils financé la fête ? » → R « Produits du jardin scolaire et dons collectés ».\n[Inclusion handicap] Visuel/DYS/Moteur : temps majoré (+2 min), cache-ligne contrasté, questions présentées une à une et réponse orale ou par pointage acceptée.',
      },
      {
        etape: 'Lecture à haute voix',
        sousTitreInvariable: 'Lecture magistrale, lecture individuelle & entraînement pauses / liaisons (//, /, ---)',
        duree: '10 min',
        activitesMaitre:
          '• Lecture magistrale : Lit tout le texte d’une voix posée face classe pendant que les élèves suivent du doigt.\nQ1 : Qu’avez-vous remarqué dans ma manière de lire ?\n• Lecture individuelle : Q2 : Qui veut lire le premier passage en respectant la ponctuation ? Que fait-on à (//), à (/) et à (---) ?\n• Entraînement au tableau : « L’année scolaire tire à sa fin.// Élèves et enseignants s’apprêtent à partir en vacances.// Comme l’exige la tradition dans notre école,/ il a été décidé de célébrer la fin d’année scolaire.// Des commissions ont--- été formées par les--- élèves.// »\nQ3 : Quelles liaisons obligatoires faut-il prononcer dans la dernière phrase ?',
        activitesEleves:
          '• Suit du doigt page 90 puis lit à haute voix par passages.\nR1 : Vous vous arrêtez aux points et aux virgules et vous mettez le ton juste.\nR2 : Arrêt long au point (//), petite pause à la virgule (/), liaison sans coupure entre mots (---).\nR3 : « ont--- été » (son [t]) et « les--- élèves » (son [z]).',
        indicateursInclusifs:
          '• Indicateur pédagogique : respect des pauses (/, //), liaisons (---) et intonation · Contrôle Q/R : Q « Quelle lettre entend-on entre les et élèves ? » → R « Le son [z] : les-[z]-élèves ».\n[Inclusion handicap] DYS/Visuel/Auditif : coder en couleur (// rouge, / bleu, --- vert) sur bande agrandie et lire face aux élèves malentendants.',
      },
      {
        etape: 'Exercices',
        sousTitreInvariable: 'Repérage de phrases cibles & concours bienveillant de lecture expressive',
        duree: '6 min',
        activitesMaitre:
          'Consigne : Répétez puis retrouvez et lisez dans le texte les phrases contenant : « la fête de fin d’année scolaire », « réaliser ce projet », « la kermesse », « les dons collectés », « un livre de conte », « des jeux et concours ».\nQ1 : Qui lit la phrase contenant « les dons collectés » ?\n• Organise un concours bienveillant du meilleur lecteur (critères : ponctuation, liaisons, fluidité, intonation).\nQ2 : Qui mérite d’être félicité pour sa lecture et pourquoi ?',
        activitesEleves:
          '• Répète les expressions puis lit à haute voix la phrase correspondante dans le livre.\nR1 : « Les dons collectés ont suffi pour l’organisation de la fête. »\nR2 : C’est … parce qu’il/elle a respecté la ponctuation, les liaisons et l’intonation.',
        indicateursInclusifs:
          '• Indicateur pédagogique : faire lire le plus grand nombre · Contrôle Q/R : Q « Quels sont les 3 critères d’une belle lecture ? » → R « Ponctuation, liaisons, intonation ».\n[Inclusion handicap] TSA/DYS/Auditif : court passage (1-2 phrases) préparé en binôme à l’avance ; critères affichés par pictogrammes.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Synthèse des acquis de lecture & transfert dans la vie courante',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris à lire aujourd’hui et quelles règles avons-nous appliquées ?\nQ2 : Comment allez-vous réutiliser cette compétence à la maison ou devant vos camarades ?\n• Félicite chaque progrès et donne la relecture en prolongement.',
        activitesEleves:
          'R1 : J’ai appris à lire le texte « La fête de fin d’année scolaire » en respectant la ponctuation (/, //) et les liaisons (---).\nR2 : Je relirai le texte avec le ton à mes parents ou mes frères et sœurs à la maison.',
        indicateursInclusifs:
          '• Indicateur pédagogique : expression de 3 ou 4 élèves + lien vie courante · Contrôle Q/R : Q « Que dois-tu faire devant une virgule (/) ? » → R « Une courte pause ».\n[Inclusion handicap] Valoriser les efforts de fluence sans comparaison punitive.',
      },
    ],
    questionsReponses: [
      {
        question: 'Où les élèves et enseignants ont-ils trouvé l’argent pour organiser la fête ?',
        reponseAttendue: 'À partir des recettes de la vente des produits du jardin scolaire et des dons collectés.',
        indicePedagogique: 'Relis le paragraphe sur les préparatifs (ou repère les mots surlignés « jardin scolaire » et « dons »).',
        difficulte: 'Fondamental',
      },
      {
        question: 'Que signifient les signes (//), (/) et (---) dans le passage d’entraînement ?',
        reponseAttendue: 'Arrêt long au point (//), pause courte à la virgule (/), liaison obligatoire entre deux mots (---).',
        indicePedagogique: 'Associe chaque signe à un geste de la main (arrêt fermé, petite pause, deux doigts joints).',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Quelles liaisons obligatoires faut-il faire dans : « Des commissions ont été formées par les élèves » ?',
        reponseAttendue: '« ont--- été » et « les--- élèves ».',
        indicePedagogique: 'Repère la consonne finale devant une voyelle au début du mot suivant.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Lire couramment consiste à respecter les pauses de ponctuation (/, //), l’intonation et les liaisons obligatoires (---).',
      traceEcriteEleve: 'Je m’arrête longtemps au point (//), un peu à la virgule (/), et je fais les liaisons (ont--- été ; les--- élèves).',
      motsCles: ['Ponctuation', 'Liaisons', 'Fluidité', 'Intonation', 'Fête scolaire'],
      prolongement: 'Relire le passage d’entraînement à la maison devant la famille ou avec l’enregistrement vocal.',
    },
  },

  // FICHE 2
  {
    id: 'cm1-s9-fiche-02',
    nom: 'Fiche 2 · J’apprends à lire — Une belle randonnée',
    sousLabel: 'CM1 Semaine 9 · Lecture expressive, intonation interrogative & liaisons (CB2)',
    collection: 'cm1_s9',
    ficheNumero: 2,
    disciplineSpecifiqueId: 'modele-fr-apprends-a-lire',
    origineModele: 'CM1 · Semaine 9 · Fiche 2',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '40 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 2) : étude du texte « Une belle randonnée » (Alédjo-Kadara), intonation de la question polie et liaisons (ses--- amis, bien--- équipés, en--- eau).',
    competenceDeBaseModele:
      'CB2 : Mobiliser les ressources de la langue pour prélever les informations utiles et réagir juste à travers la lecture et l’exploitation de différents types de textes d’au moins dix phrases dans des situations de vie courante.',
    competenceViseeModele:
      'Lire de façon expressive et courante « Une belle randonnée » en adaptant le ton aux phrases interrogatives et en respectant les liaisons.',
    titreSuggere: 'Une belle randonnée (J’apprends à lire)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Lire de manière expressive et courante le texte proposé (page 97).',
      'Respecter la prononciation, les liaisons et l’intonation montante d’une question polie.',
    ],
    prerequis: [
      'Identifier une phrase interrogative (?) et appliquer les marques de pause (/, //).',
    ],
    materielSuggere: [
      'Texte : Mon livre de français CM1 (guide du maître p. 130-131, manuel p. 97)',
      'Fiches autocorrectives de compréhension',
      'Supports agrandis contrastés, guide-ligne et cartes pictogrammes de randonnée (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique rythmé pour installer l’écoute et l’entrain collectif.',
      miseEnSituation: 'Échange à partir des sorties ou excursions scolaires vers des sites touristiques du pays.',
      consigneDepart: 'Ouvrez votre livre à la page 97 (ou prenez la fiche de lecture agrandie).',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant rythmé sur les sorties et les fêtes allons-nous chanter ensemble ?\nQ2 : Êtes-vous prêts à suivre le tempo des mains ?\n• Lance le chant, bat la mesure et invite toute la classe à chanter avec entrain.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant choisi avec la classe).\nR2 : Oui ! Toute la classe chante en respectant le rythme et la mélodie.',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court thématique, engagement de toute la classe · Contrôle Q/R : Q « Que prépare ce chant ? » → R « Une belle séance de lecture ».\n[Inclusion handicap] Auditif/TSA : gestuelle d’accompagnement claire et annonce visuelle du démarrage.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & partage coopératif du support',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre livre de français CM1 et votre règle/marque-page.\nQ2 : Qui n’a pas son livre ? Avec quel camarade peut-il le partager ?',
        activitesEleves:
          'R1 : Je montre mon livre de français CM1 posé ouvert sur ma table.\nR2 : Je partage avec mon voisin (ou je prends le texte agrandi).',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide en circulant et partage effectif · Contrôle Q/R : Q « Chaque table a-t-elle un livre ouvert ? » → R « Oui ».\n[Inclusion handicap] Visuel/Moteur : vérifier l’inclinaison confortable du support et remettre la fiche agrandie contrastée.',
      },
      {
        etape: 'Mise en situation – Annonce de l’objet et des objectifs',
        sousTitreInvariable: 'Ancrage dans le vécu, annonce explicite de l’objet & des objectifs de lecture',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Pour découvrir des sites touristiques ou des localités du pays, les maîtres et les élèves s’organisent parfois pour s’y rendre. Comment appelle-t-on cette sortie ?\nQ2 : Avez-vous déjà fait une telle sortie ? Où et avec qui ?\n• Annonce l’objet : « Aujourd’hui, nous allons étudier le texte intitulé Une belle randonnée. »\n• Annonce les objectifs : lire couramment en adaptant la voix aux questions polies (?) et aux liaisons.\nConsigne : Ouvrez votre livre à la page 97.',
        activitesEleves:
          'R1 : C’est une excursion, une randonnée, un périple ou un voyage scolaire.\nR2 : Oui, je suis allé(e) à … avec mon école ou ma famille.\n• Reformule l’objet de la leçon et ouvre le livre à la page 97.',
        indicateursInclusifs:
          '• Indicateur pédagogique : accueil de toutes les réponses pertinentes + reformulation de l’objet · Contrôle Q/R : Q « À quelle page se trouve le texte ? » → R « Page 97 ».\n[Inclusion handicap] TSA/Auditif : afficher « Page 97 — Une belle randonnée » avec pictogramme vélo/montagne.',
      },
      {
        etape: 'Lecture silencieuse',
        sousTitreInvariable: 'Lecture silencieuse guidée & compréhension avec fiches autocorrectives',
        duree: '10 min',
        activitesMaitre:
          'Consigne : Lisez le texte en silence (3 à 5 min) puis répondez par écrit.\nQ1 : Où vont Tété et ses amis et de quel moyen de locomotion disposent-ils ?\nQ2 : Connaissent-ils la voie d’accès à la montagne ? Justifie par une phrase du texte.\nQ3 : Que découvrent-ils en haut de la montagne ?\nQ4 : De quoi le texte nous parle-t-il en général ?\n• Fait corriger à l’aide des fiches autocorrectives.',
        activitesEleves:
          '• Lit silencieusement puis vérifie avec la fiche autocorrective.\nR1 : À Alédjo-Kadara, sur des vélos tout-terrain.\nR2 : Non, car ils ont sollicité l’aide d’un guide touristique qui les a conduits à la montagne.\nR3 : Ils découvrent une belle forêt au sommet de la montagne.\nR4 : D’une excursion/randonnée réussie entre amis.',
        indicateursInclusifs:
          '• Indicateur pédagogique : justification par le texte + auto-correction · Contrôle Q/R : Q « Qui a aidé les cyclistes à trouver le chemin ? » → R « Un guide touristique ».\n[Inclusion handicap] DYS/Moteur/Visuel : surlignage guidé de la phrase justificative ; réponse orale ou par étiquettes pour élèves dyspraxiques.',
      },
      {
        etape: 'Lecture à haute voix',
        sousTitreInvariable: 'Lecture magistrale, lecture individuelle & entraînement pauses / liaisons (//, /, ---)',
        duree: '10 min',
        activitesMaitre:
          '• Lecture magistrale : Lit tout le texte face classe en marquant bien l’intonation des questions.\nQ1 : Comment ai-je lu la question « Auriez-vous la gentillesse… ? »\n• Lecture individuelle : Q2 : Que devez-vous respecter en lisant votre passage ?\n• Entraînement au tableau : « Tété et ses--- amis décident d’aller en randonnée à Alédjo-Kadara.// Tôt le matin,/ ils partent d’Aléhéridè,/ chacun sur son vélo tout-terrain.// Les randonneurs,/ bien--- équipés en vivres et en--- eau,/ empruntent la nationale n° 1 par la faille d’Alédjo,/ un site touristique de renommée internationale.// »\nQ3 : Quelles trois liaisons obligatoires faut-il faire dans ce passage ?',
        activitesEleves:
          '• Suit du doigt page 97 puis lit un passage à haute voix.\nR1 : Vous avez monté la voix à la fin pour montrer la politesse de la question.\nR2 : Les pauses (/, //), les liaisons (---) et l’intonation montante devant « ? ».\nR3 : « ses--- amis », « bien--- équipés », « en--- eau ».',
        indicateursInclusifs:
          '• Indicateur pédagogique : intonation juste sur (?) et respect des 3 liaisons · Contrôle Q/R : Q « Où monte-t-on la voix dans une phrase interrogative ? » → R « En fin de phrase devant ? ».\n[Inclusion handicap] Auditif/DYS : tracer une flèche montante ↗ devant (?) et des arcs verts sous les liaisons.',
      },
      {
        etape: 'Exercices',
        sousTitreInvariable: 'Repérage de phrases cibles & concours bienveillant de lecture expressive',
        duree: '6 min',
        activitesMaitre:
          'Consigne : Répétez et retrouvez dans le texte les phrases contenant : « Auriez-vous la gentillesse ? » ; « des crissements de pneus sur les cailloux » ; « chacun enfourche son vélo et aborde la descente ».\nQ1 : Que signifie l’expression « enfourcher son vélo » ?\n• Organise le concours du meilleur lecteur.\nQ2 : Qui a lu avec le meilleur ton et la meilleure fluidité ? Pourquoi ?',
        activitesEleves:
          '• Répète et lit à haute voix les phrases repérées.\nR1 : C’est monter sur son vélo.\nR2 : C’est … car il/elle respecte les pauses, les liaisons et monte bien la voix aux questions.',
        indicateursInclusifs:
          '• Indicateur pédagogique : participation large + explicitation du lexique · Contrôle Q/R : Q « Quel bruit font les pneus sur le chemin ? » → R « Des crissements de pneus sur les cailloux ».\n[Inclusion handicap] Visuel/TSA : mimer « enfourcher un vélo » et valoriser l’expressivité sans pénaliser la lenteur.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Synthèse des acquis de lecture & transfert dans la vie courante',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris aujourd’hui avec le texte « Une belle randonnée » ?\nQ2 : Que pouvez-vous partager de cette lecture à la maison ?\n• Félicite la classe et donne la lecture en prolongement.',
        activitesEleves:
          'R1 : J’ai appris à lire avec l’intonation d’une question polie et à faire les liaisons (ses--- amis, bien--- équipés, en--- eau).\nR2 : Je lirai un passage à mes parents et je leur raconterai la sortie à Alédjo-Kadara.',
        indicateursInclusifs:
          '• Indicateur pédagogique : expression de 3 ou 4 élèves + transfert vie courante · Contrôle Q/R : Q « Cite une liaison retenue aujourd’hui » → R « En--- eau ».\n[Inclusion handicap] Reformulation orale libre ou résumé illustré accepté.',
      },
    ],
    questionsReponses: [
      {
        question: 'Pourquoi Tété et ses amis sollicitent-ils l’aide d’un guide touristique ?',
        reponseAttendue: 'Parce qu’ils ne connaissent pas la voie d’accès à la montagne d’Alédjo-Kadara.',
        indicePedagogique: 'Cherche dans le texte le moment où ils demandent leur chemin.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Comment doit-on lire la phrase « Auriez-vous la gentillesse ? » ?',
        reponseAttendue: 'En montant la voix en fin de phrase pour marquer la question polie.',
        indicePedagogique: 'Repère le point d’interrogation (?) et mime l’intonation montante avec la main.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Relève les trois liaisons obligatoires du passage d’entraînement.',
        reponseAttendue: '« ses--- amis », « bien--- équipés », « en--- eau ».',
        indicePedagogique: 'Observe les mots terminés par s ou n suivis d’une voyelle.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'La lecture expressive adapte la voix aux questions polies (?) et respecte les liaisons obligatoires.',
      traceEcriteEleve: 'Je monte la voix à la question (?) et je lie : ses--- amis, bien--- équipés, en--- eau.',
      motsCles: ['Randonnée', 'Intonation', 'Liaisons', 'Alédjo-Kadara', 'Vélo'],
      prolongement: 'Raconter et relire un extrait de la randonnée à la maison.',
    },
  },

  // FICHE 3
  {
    id: 'cm1-s9-fiche-03',
    nom: 'Fiche 3 · J’apprends à parler — Demander la permission',
    sousLabel: 'CM1 Semaine 9 · Expression orale, jeux de rôles & politesse (CB1)',
    collection: 'cm1_s9',
    ficheNumero: 3,
    disciplineSpecifiqueId: 'modele-fr-apprends-a-parler',
    origineModele: 'CM1 · Semaine 9 · Fiche 3',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '30 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 3) : demander et accorder poliment la permission à partir de l’image page 89 (M’autorises-tu à… / Avec plaisir / Sans souci / Volontiers).',
    competenceDeBaseModele:
      'CB1 : Mobiliser les ressources de la langue dans les situations de communication pour exprimer oralement ses pensées, ses sentiments ou répondre à une sollicitation.',
    competenceViseeModele:
      'S’exprimer librement et poliment à l’oral en utilisant les mots et expressions pour demander la permission ou répondre à une demande.',
    titreSuggere: 'Mots et expressions pour demander la permission ou répondre',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'S’exprimer librement en utilisant les formules pour demander la permission.',
      'Répondre poliment à une demande de permission en situation de jeu de rôles.',
    ],
    prerequis: [
      'Utiliser les formules de base : Aimerais-tu que… ? Pourrais-tu… ? Si tu veux.',
    ],
    materielSuggere: [
      'Image du livre : Mon livre de français CM1 (guide du maître p. 122-123, manuel p. 89)',
      'Cartes-formules visuelles contrastées et pictogrammes d’actes de parole (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique collectif battu en rythme face à la classe.',
      miseEnSituation: 'Réactivation en binômes puis observation silencieuse de l’image de la page 89.',
      consigneDepart: 'Observez bien l’image de la page 89 en silence avant de lever le doigt.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en confiance vocale collective',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant allons-nous chanter pour chauffer nos voix avant de parler ensemble ?\nQ2 : Tout le monde suit-il la cadence ?\n• Lance le chant, bat la mesure face aux élèves et encourage l’enthousiasme.',
        activitesEleves:
          'R1 : Nous chantons « … ».\nR2 : Oui ! Toute la classe chante en rythme et sourit.',
        indicateursInclusifs:
          '• Indicateur pédagogique : climat de confiance vocale · Contrôle Q/R : Q « Pourquoi est-il important d’articuler ? » → R « Pour bien se faire comprendre ».\n[Inclusion handicap] Auditif/Moteur : gestes visibles et liberté de rester assis.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & organisation du partage en binôme',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre livre de français CM1 ouvert à la bonne page.\nQ2 : Qui n’a pas son livre et avec qui va-t-il l’observer en binôme ?',
        activitesEleves:
          'R1 : Je montre mon livre de français CM1.\nR2 : Je partage l’image de la page 89 avec mon voisin (ou la planche agrandie).',
        indicateursInclusifs:
          '• Indicateur pédagogique : toutes les tables ont accès à l’image p. 89 · Contrôle Q/R : Q « À quelle page observons-nous l’image ? » → R « Page 89 ».\n[Inclusion handicap] Visuel : image page 89 agrandie/contrastée déposée sur table.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Réactivation dialoguée en binômes des actes de parole connus',
        duree: '4 min',
        activitesMaitre:
          'Consigne : En binômes, posez-vous des questions polies et répondez avec : Aimerais-tu que… ? Pourrais-tu… ? Si tu veux… ; M’accordes-tu la permission de… ? Me permets-tu… ? Je te le permets.\nQ1 : (E1 à E2) Aimerais-tu que je t’apporte une chaise ? Q2 : (E3 à E4) Pourrais-tu m’aider ? Q3 : M’accordes-tu la permission de sortir ?',
        activitesEleves:
          '• Joue de courts dialogues deux à deux.\nR1 : Bien sûr ! / Avec plaisir.\nR2 : Si tu veux.\nR3 : Je te le permets / Si cela peut t’être utile.',
        indicateursInclusifs:
          '• Indicateur pédagogique : prise de parole fluide de plusieurs binômes · Contrôle Q/R : Q « Quelle formule emploies-tu pour demander gentiment ? » → R « Pourrais-tu… / M’accordes-tu la permission de… ».\n[Inclusion handicap] DYS/Auditif/TSA : garder les amorces écrites en gros caractères au tableau.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Observation silencieuse de l’image support & repérage initial',
        duree: '3 min',
        activitesMaitre:
          'Consigne : Observez attentivement l’image du livre à la page 89 en silence pendant 1 minute.\nQ1 : Quels personnages et quels lieux repérez-vous sur cette scène ?\nQ2 : Que semblent-ils être en train de faire ?',
        activitesEleves:
          '• Observe en silence puis lève le doigt.\nR1 : Un papa, un garçon (Tété), une cour d’école décorée, des élèves et des revendeuses.\nR2 : Le garçon parle poliment à son papa devant la fête.',
        indicateursInclusifs:
          '• Indicateur pédagogique : temps d’observation silencieuse respecté · Contrôle Q/R : Q « Où se déroule la scène ? » → R « À la maison et dans la cour de l’école en fête ».\n[Inclusion handicap] Visuel : décrire à voix haute les différentes zones de l’image (premier plan, cour, banderole).',
      },
      {
        etape: 'Expression libre',
        sousTitreInvariable: 'Prise de parole spontanée sur l’image & relevé bienveillant des écarts',
        duree: '5 min',
        activitesMaitre:
          'Consigne : Dites librement tout ce que vous voyez sur l’image de la page 89.\n• Laisse parler librement et note discrètement au tableau les erreurs fréquentes à corriger ensuite.\nQ : Qui peut ajouter un détail que ses camarades n’ont pas encore cité ?',
        activitesEleves:
          'R : Je vois un papa qui discute avec son fils Tété ; dans la cour de l’école, il y a des élèves qui s’amusent, le drapeau togolais, des guirlandes et des revendeuses avec des glacières.',
        indicateursInclusifs:
          '• Indicateur pédagogique : participation spontanée du plus grand nombre · Contrôle Q/R : Q « Quel objet voit-on près du papa ou de la fête ? » → R « Le lecteur CD / les glacières et décorations ».\n[Inclusion handicap] TSA/Auditif : accepter phrases courtes ou pointage visuel avant reformulation collective.',
      },
      {
        etape: 'Expression dirigée',
        sousTitreInvariable: 'Questionnement ciblé, mémorisation des structures & jeux de rôles guidés',
        duree: '6 min',
        activitesMaitre:
          'Q1 : Que dit le jeune garçon à son papa et que lui répond son père ?\nQ2 : Que lis-tu sur la banderole et à quelle occasion a lieu la fête ?\nQ3 : Que te rappelle cette image ?\n• Fait répéter les actes de parole : M’autorises-tu à… ? Permets-moi de… ; Me permets-tu de… ; M’autorisez-vous à… / Avec plaisir ! Volontiers ! Sans souci ! Comme tu veux ! Évidemment !\nConsigne : Jouez la scène en binômes en utilisant tour à tour ces formules.',
        activitesEleves:
          'R1 : « Papa, m’autorises-tu à apporter ton lecteur CD à l’école pour la fête ? » – « Avec plaisir ! »\nR2 : « Vive la fête de fin d’année scolaire » ; à la fin de l’année scolaire.\nR3 : La fête organisée dans notre école.\n• Jeux de rôles : « Permets-moi de voir dans ton cahier. – Sans souci. » / « Me permets-tu de te rendre visite ce soir ? – Volontiers. » / « M’autorisez-vous à prendre part à la fête ? – Évidemment. »',
        indicateursInclusifs:
          '• Indicateur pédagogique : réemploi exact des formules et correction des erreurs relevées · Contrôle Q/R : Q « Cite deux façons polies de répondre oui » → R « Volontiers / Sans souci ».\n[Inclusion handicap] Auditif/DYS/TSA : cartes-répliques doubles (Demande en bleu / Réponse en vert) manipulées en binôme face à face.',
      },
      {
        etape: 'Phase de transfert',
        sousTitreInvariable: 'Réinvestissement autonome des actes de parole dans de nouveaux scénarios',
        duree: '4 min',
        activitesMaitre:
          'Consigne : Jouez aux parents et aux enfants : demandez la permission d’aller au cinéma, en excursion ou en promenade.\nQ1 : Comment demandes-tu la permission à maman ou papa ?\nQ2 : Que répond le parent quand il accepte avec gentillesse ?',
        activitesEleves:
          'R1 : Enfant : « Papa, me permets-tu d’aller au cinéma ce soir ? » / « Maman, m’autorises-tu à participer à l’excursion ? » / « Permets-moi d’aller voir mon camarade. »\nR2 : Parent : « Avec plaisir ! » / « Sans souci ! » / « Comme tu veux ! »',
        indicateursInclusifs:
          '• Indicateur pédagogique : transfert spontané à la vie quotidienne (maison, loisirs) · Contrôle Q/R : Q « Quelle formule emploies-tu pour parler à deux adultes ? » → R « M’autorisez-vous à… ? ».\n[Inclusion handicap] TSA/Moteur : 1 minute de préparation en binôme avec cartes-mots ; espace dégagé pour jouer assis ou debout.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Verbalisation des formules apprises & usage dans la vie quotidienne',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris à faire à cette séance ?\nQ2 : Où et quand allez-vous utiliser ces formules polies dès aujourd’hui ?\n• Félicite les élèves et encourage l’usage quotidien.',
        activitesEleves:
          'R1 : J’ai appris à demander la permission poliment et à répondre aimablement à une demande.\nR2 : Je les utiliserai à la maison avec mes parents et en classe avec mes camarades et mon maître.',
        indicateursInclusifs:
          '• Indicateur pédagogique : verbalisation par 3 ou 4 élèves + lien vie courante · Contrôle Q/R : Q « Comment réponds-tu si tu acceptes avec joie ? » → R « Avec plaisir / Volontiers ! ».\n[Inclusion handicap] Validation par geste ou carte-formule acceptée pour élèves peu verbaux.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment Tété demande-t-il poliment à son papa d’emporter le lecteur CD ?',
        reponseAttendue: '« Papa, m’autorises-tu à apporter ton lecteur CD à l’école pour la fête ? »',
        indicePedagogique: 'Commence par « M’autorises-tu à… ? ».',
        difficulte: 'Fondamental',
      },
      {
        question: 'Cite trois expressions polies pour accepter une demande de permission.',
        reponseAttendue: 'Avec plaisir ; Sans souci ; Volontiers (ou Comme tu veux ; Évidemment).',
        indicePedagogique: 'Regarde les réponses vertes affichées au tableau.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Formule une demande pour aller au cinéma avec tes parents en utilisant « Me permets-tu… ».',
        reponseAttendue: '« Papa/Maman, me permets-tu d’aller au cinéma ce soir ? »',
        indicePedagogique: 'N’oublie pas l’intonation polie et le verbe à l’infinitif après « de ».',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Pour demander la permission poliment, on emploie des formules précises et on répond avec courtoisie.',
      traceEcriteEleve: 'Demander : M’autorises-tu à… ? Me permets-tu de… ? Permets-moi de… | Répondre : Avec plaisir, Sans souci, Volontiers, Évidemment.',
      motsCles: ['Permission', 'Politesse', 'M’autorises-tu', 'Volontiers', 'Jeu de rôles'],
      prolongement: 'Utiliser ces formules à la maison pour demander une sortie ou un objet.',
    },
  },

  // FICHE 4
  {
    id: 'cm1-s9-fiche-04',
    nom: 'Fiche 4 · J’apprends à parler — Demander la permission (suite)',
    sousLabel: 'CM1 Semaine 9 · Formules nuancées & interactions touristiques (CB1)',
    collection: 'cm1_s9',
    ficheNumero: 4,
    disciplineSpecifiqueId: 'modele-fr-apprends-a-parler',
    origineModele: 'CM1 · Semaine 9 · Fiche 4',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '30 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 4) : consolidation des demandes polies à partir de l’image page 96 (Auriez-vous la gentillesse de…, Ça te plaît-il de…, Pas de problème ! Bien sûr !).',
    competenceDeBaseModele:
      'CB1 : Mobiliser les ressources de la langue dans les situations de communication pour exprimer oralement ses pensées, ses sentiments ou répondre à une sollicitation.',
    competenceViseeModele:
      'Formuler des demandes polies de service ou de permission en variant les registres (vouvoiement / tutoiement) dans des situations de loisirs et de tourisme.',
    titreSuggere: 'Demander la permission ou un service poliment (suite et fin)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Réemployer les structures de demande de permission acquises.',
      'Utiliser « Auriez-vous / Aurais-tu la gentillesse de… », « Ça te dérange de… », « Pas de problème ! ».',
    ],
    prerequis: [
      'Formules de la Fiche 3 (Me permets-tu…, M’autorises-tu…, Avec plaisir, Sans souci).',
    ],
    materielSuggere: [
      'Image du livre : Mon livre de français CM1 (guide du maître p. 129-130, manuel p. 96)',
      'Cartes-scénarios illustrées et étiquettes « Tu / Vous » en couleurs contrastées (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique collectif suivi du rappel ludique parents/enfants de la Fiche 3.',
      miseEnSituation: 'Observation de l’image page 96 : quatre jeunes à vélo face à un guide touristique sur le chemin d’Alédjo-Kadara.',
      consigneDepart: 'Observez l’image de la page 96 et repérez qui parle à qui.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en confiance vocale collective',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant rythmé allons-nous entonner pour démarrer dans la joie ?\nQ2 : Qui donne le signal avec moi ?\n• Lance le chant, bat la mesure et mobilise toute la classe.',
        activitesEleves:
          'R1 : Nous chantons « … ».\nR2 : Toute la classe chante en rythme (debout ou assis selon besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant collectif entraînant · Contrôle Q/R : Q « Sommes-nous prêts pour nos jeux de rôles ? » → R « Oui ! ».\n[Inclusion handicap] Auditif/TSA : repère rythmique visuel de la main.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification du manuel & organisation du partage en binôme',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre livre de français CM1 ouvert à la page 96.\nQ2 : Qui n’a pas son livre ? Avec quel camarade le partage-t-il ?',
        activitesEleves:
          'R1 : Je montre mon livre ouvert à la page 96.\nR2 : Je partage avec mon voisin (ou j’observe la planche agrandie).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chaque binôme observe l’image p. 96 · Contrôle Q/R : Q « Quelle page étudions-nous ? » → R « Page 96 ».\n[Inclusion handicap] Visuel : ouvrir à la page 96 avec marque-page tactile contrasté.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Réactivation dialoguée en binômes des actes de parole connus',
        duree: '4 min',
        activitesMaitre:
          'Consigne : Jouez rapidement aux parents et aux enfants avec les formules apprises hier (cinéma, excursion, promenade).\nQ1 : Quelle expression utilises-tu pour demander l’autorisation à tes parents ?\nQ2 : Comment le parent répond-il « oui » poliment ?',
        activitesEleves:
          '• Joue en binômes : « Me permets-tu d’aller au cinéma ? – Avec plaisir ! » / « M’autorises-tu à participer à l’excursion ? – Sans souci ! »\nR1 : M’autorises-tu à… / Me permets-tu de…\nR2 : Avec plaisir ; sans souci ; volontiers.',
        indicateursInclusifs:
          '• Indicateur pédagogique : réemploi spontané des acquis de la Fiche 3 · Contrôle Q/R : Q « Cite une autre formule de demande » → R « Permets-moi de… ».\n[Inclusion handicap] DYS/Auditif : afficher les formules clés en colonne gauche/droite au tableau.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Observation silencieuse de l’image support & repérage initial',
        duree: '3 min',
        activitesMaitre:
          'Consigne : Observez en silence l’image de la page 96 pendant 1 minute.\nQ1 : Combien de personnages comptez-vous et comment se déplacent-ils ?\nQ2 : À qui semblent-ils s’adresser ?',
        activitesEleves:
          '• Observe en silence puis lève le doigt.\nR1 : Cinq personnes à vélo (quatre enfants et un adulte).\nR2 : Les enfants s’adressent à l’adulte sur son vélo.',
        indicateursInclusifs:
          '• Indicateur pédagogique : observation calme et précise · Contrôle Q/R : Q « Quel moyen de transport utilisent-ils ? » → R « Le vélo ».\n[Inclusion handicap] Visuel : décrire oralement la scène (4 jeunes cyclistes, 1 adulte face à eux, route caillouteuse).',
      },
      {
        etape: 'Expression libre',
        sousTitreInvariable: 'Prise de parole spontanée sur l’image & relevé bienveillant des écarts',
        duree: '4 min',
        activitesMaitre:
          'Consigne : Dites librement tout ce que vous voyez sur cette image.\n• Note au tableau les erreurs récurrentes sans couper la parole.\nQ : Que remarquez-vous encore autour des cyclistes ?',
        activitesEleves:
          'R : Je vois quatre enfants (dont une fille) sur des vélos tout-terrain ; ils discutent avec un homme sur un vélo en face d’eux ; autour, il y a des cailloux, des herbes et une route de montagne.',
        indicateursInclusifs:
          '• Indicateur pédagogique : prise de parole diversifiée · Contrôle Q/R : Q « Combien de filles vois-tu dans le groupe ? » → R « Une fille (avec trois garçons) ».\n[Inclusion handicap] TSA/Auditif : valider chaque observation juste sans interrompre.',
      },
      {
        etape: 'Expression dirigée',
        sousTitreInvariable: 'Questionnement ciblé, mémorisation des structures & jeux de rôles guidés',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Où vont ces jeunes et que demande la jeune fille à l’homme ?\nQ2 : Qui est cet homme et que leur répond-il ? Q3 : Que te rappelle cette scène ?\n• Fait répéter les nouvelles formules : Auriez-vous / Aurais-tu la gentillesse de… ? J’aimerais… ; Ça te dérange de… ? Ça te plaît-il de… ? Cela te plairait-il… ? / Sans souci ! Pas de problème ! Bien sûr !\nConsigne : Jouez la scène puis créez des dialogues en binômes (adulte = vous / camarade = tu).',
        activitesEleves:
          'R1 : Au foyer de charité d’Alédjo-Kadara ; elle demande : « Bonjour monsieur, auriez-vous la gentillesse de nous conduire au foyer de charité d’Alédjo-Kadara ? »\nR2 : C’est un guide touristique ; il répond : « Sans souci, suivez-moi. » R3 : Le tourisme / une randonnée.\n• Jeux de rôles : « Aurais-tu la gentillesse de me passer ton crayon ? – Pas de problème. » / « Ça te plaît-il de passer les vacances avec moi ? – Bien sûr ! »',
        indicateursInclusifs:
          '• Indicateur pédagogique : distinction vouvoiement/tutoiement + correction des écarts · Contrôle Q/R : Q « Pourquoi dit-on auriez-vous au guide ? » → R « C’est un adulte qu’on vouvoie par respect ».\n[Inclusion handicap] DYS/Auditif : code couleur Vouvoiement (adulte = bleu) / Tutoiement (camarade = orange).',
      },
      {
        etape: 'Phase de transfert',
        sousTitreInvariable: 'Réinvestissement autonome des actes de parole dans de nouveaux scénarios',
        duree: '4 min',
        activitesMaitre:
          'Consigne : Parlez de la fête scolaire (préparatifs, dons reçus, kermesse, jeux, prix, pique-nique) en employant les formules apprises.\nQ1 : Comment demandes-tu à ton camarade de te raconter la fête ?\nQ2 : Comment l’invites-tu à venir ou à jouer avec toi ?',
        activitesEleves:
          'R1 : E1 : « Aurais-tu la gentillesse de me raconter la fête scolaire ? » – E2 : « Bien sûr ! »\nR2 : E1 : « J’aimerais te voir à la prochaine fête. » – E2 : « Pas de problème. » / E3 : « Cela te plairait-il de jouer avec moi ? » – E4 : « Avec plaisir ! »',
        indicateursInclusifs:
          '• Indicateur pédagogique : réinvestissement autonome contextualisé · Contrôle Q/R : Q « Comment répondre poliment à une invitation ? » → R « Pas de problème / Bien sûr ! ».\n[Inclusion handicap] TSA/Moteur : temps de préparation de 2 min en binôme avec cartes-mots.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Verbalisation des formules apprises & usage dans la vie quotidienne',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris aujourd’hui à l’oral ?\nQ2 : Dans quelles situations réelles allez-vous réutiliser ces formules ?\n• Félicite la classe et encourage la politesse au quotidien.',
        activitesEleves:
          'R1 : J’ai appris à demander poliment un service ou une permission à un adulte (vous) et à un camarade (tu).\nR2 : Je les utiliserai à l’école, à la maison et en voyage.',
        indicateursInclusifs:
          '• Indicateur pédagogique : bilan verbalisé par 3 ou 4 élèves · Contrôle Q/R : Q « Quelle différence entre Auriez-vous et Aurais-tu ? » → R « Vous pour un adulte, tu pour un ami ».\n[Inclusion handicap] Encouragement systématique et bienveillant de chaque prise de parole.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quelle formule utilise la jeune fille pour s’adresser au guide touristique ?',
        reponseAttendue: '« Bonjour monsieur, auriez-vous la gentillesse de nous conduire au foyer de charité d’Alédjo-Kadara ? »',
        indicePedagogique: 'On emploie « vous » car on parle à un adulte inconnu.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Transforme « Auriez-vous la gentillesse de m’aider ? » pour parler à un camarade.',
        reponseAttendue: '« Aurais-tu la gentillesse de m’aider ? »',
        indicePedagogique: 'Remplace « vous » par « tu ».',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Invite un camarade à la fête de l’école avec « Ça te plaît-il… » ou « Cela te plairait-il… ».',
        reponseAttendue: '« Cela te plairait-il de venir à la prochaine fête de l’école avec moi ? – Bien sûr ! »',
        indicePedagogique: 'Associe la formule d’invitation et une réponse enthousiaste.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'On adapte la formule de politesse selon l’interlocuteur (Auriez-vous… à un adulte / Aurais-tu… à un camarade).',
      traceEcriteEleve: 'Adulte : Auriez-vous la gentillesse de… ? | Camarade : Aurais-tu la gentillesse de… ? Ça te plaît-il de… ? | Réponses : Pas de problème ! Bien sûr !',
      motsCles: ['Vouvoiement', 'Tutoiement', 'Gentillesse', 'Invitation', 'Tourisme'],
      prolongement: 'Préparer un mini-dialogue de deux répliques sur les vacances ou une sortie.',
    },
  },

  // FICHE 5
  {
    id: 'cm1-s9-fiche-05',
    nom: 'Fiche 5 · Je manipule les phrases 1 — Les pronoms personnels COI',
    sousLabel: 'CM1 Semaine 9 · Grammaire : lui, leur, elle, elles, eux (CB1 + CB3)',
    collection: 'cm1_s9',
    ficheNumero: 5,
    disciplineSpecifiqueId: 'modele-fr-manipule-phrases-1',
    origineModele: 'CM1 · Semaine 9 · Fiche 5',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 5) : identifier le GN (COI) et le remplacer par lui, leur, elle, elles, eux (règle des prépositions et de « leur » sans préposition).',
    competenceDeBaseModele:
      'CB1 & CB3 : Mobiliser les ressources de la langue pour exprimer oralement ses pensées et produire à l’écrit des textes significatifs d’au moins dix phrases.',
    competenceViseeModele:
      'Identifier les GN (COI) dans des phrases et les remplacer par le pronom personnel COI convenable (lui, leur, elle, elles, eux).',
    titreSuggere: 'Les pronoms personnels COI (Je manipule les phrases 1)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Identifier les GN (COI) dans des phrases.',
      'Remplacer le GN (COI) par le pronom personnel COI convenable : lui, leur, elle, elles, eux.',
    ],
    prerequis: [
      'Reconnaître un complément répondant aux questions « à qui ? », « de quoi ? », « sur qui ? ».',
    ],
    materielSuggere: [
      'Mon livre de français CM1 (guide du maître p. 126-127, manuel p. 92-93)',
      'Phrase support, ardoise, craie, chiffon',
      'Étiquettes-pronoms aimantées en couleurs (lui/leur en bleu, à elle/à eux en vert) et texte à trous (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant court thématique puis rappel actif du GN (COI) sur ardoise.',
      miseEnSituation: 'Comparaison au tableau des paires de phrases (a sans pronom / b avec pronom COI) autour de Tété, du guide et du directeur.',
      consigneDepart: 'Observez les phrases (a) et (b) au tableau et repérez les mots qui évitent la répétition.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en confiance collective',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant court allons-nous entonner pour bien démarrer la grammaire ?\nQ2 : Tous ensemble au signal de la main !\n• Lance le chant en lien avec le thème et bat la mesure.',
        activitesEleves:
          'R1 : Nous chantons « … ».\nR2 : Toute la classe chante en rythme (debout ou assis selon besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court thématique et mise en disponibilité · Contrôle Q/R : Q « Quelle leçon commençons-nous ? » → R « Je manipule les phrases 1 (grammaire) ».\n[Inclusion handicap] Auditif/TSA : signal visuel d’ouverture et de clôture.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon & solidarité de table',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre ardoise, votre craie, votre chiffon et votre livre (p. 92-93).\nQ2 : Qui manque d’un objet ? Comment organisons-nous l’entraide entre voisins ?',
        activitesEleves:
          'R1 : Voici mon ardoise, ma craie et mon chiffon.\nR2 : Je partage avec mon camarade de table.',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide et partage organisé · Contrôle Q/R : Q « Tout le monde est-il prêt à écrire sur l’ardoise ? » → R « Oui ».\n[Inclusion handicap] Moteur : vérifier feutre effaçable épais ou mise à disposition des étiquettes-pronoms.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Réactivation des prérequis sur ardoise',
        duree: '5 min',
        activitesMaitre:
          'Consigne : Complétez chaque phrase avec un GN (COI) sur l’ardoise :\nQ1 : a) Le patron s’entretient quotidiennement … | b) Une femme entrepreneur jouit …\nQ2 : c) Le ministre s’adresse … | d) L’entreprise compte … pour faire ses livraisons.\nQ3 : À quelles questions répond ce complément après le verbe ?',
        activitesEleves:
          'R1 : a) … aux employeurs. b) … de ses efforts.\nR2 : c) … à la population. d) … sur vous.\nR3 : Il répond aux questions « à qui ? », « de quoi ? », « sur qui ? » (c’est un GN COI).',
        indicateursInclusifs:
          '• Indicateur pédagogique : identification exacte du GN (COI) · Contrôle Q/R : Q « Dans s’adresse à la population, quelle est la préposition ? » → R « à ».\n[Inclusion handicap] DYS/Visuel : lire chaque amorce lentement ; étiquettes « à qui ? / de quoi ? / sur qui ? » posées sur table.',
      },
      {
        etape: 'Mise en situation',
        sousTitreInvariable: 'Découverte de la phrase support contextualisée & annonce de l’objet',
        duree: '6 min',
        activitesMaitre:
          '• Écrit et fait lire au tableau :\n1) a- Tété va chez son père. Tété demande une autorisation à son père. / b- Tété va chez son père et lui demande une autorisation.\n2) a- Le guide accueille les touristes. Le guide indique le chemin aux touristes. / b- Le guide accueille les touristes et leur indique le chemin.\n3) a- Le directeur rassemble les élèves. Le directeur s’adresse aux élèves. / b- Le directeur rassemble les élèves et s’adresse à eux.\nQ1 : Quelle répétition évite-t-on dans les phrases b ?\nQ2 : Quels petits mots remplacent « à son père », « aux touristes » et « aux élèves » ?\n• Annonce l’objet et les objectifs de la séance.',
        activitesEleves:
          '• Suit et lit les paires de phrases (2 ou 3 élèves lisent à haute voix).\nR1 : On évite de répéter « à son père », « aux touristes » et « aux élèves ».\nR2 : Les mots « lui », « leur » et « eux ».\n• Reformule l’objet de la leçon.',
        indicateursInclusifs:
          '• Indicateur pédagogique : repérage clair du rôle anti-répétition · Contrôle Q/R : Q « Quel mot remplace aux touristes ? » → R « leur ».\n[Inclusion handicap] DYS/Visuel : souligner le GN (COI) et le pronom remplaçant dans la même couleur.',
      },
      {
        etape: 'Manipulation',
        sousTitreInvariable: 'Substitutions, déplacements & transformations grammaticales actives',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Relevez chaque pronom personnel COI dans les phrases b et indiquez quel GN (COI) il remplace.\nQ2 : Transformez : « Tété va chez son père et lui demande une autorisation » avec (chez sa mère ; chez ses amis ; chez ses amies).\nQ3 : Transformez : « Le directeur rassemble les élèves et s’adresse à eux » avec (les filles ; le groupe ; tous les enseignants ; nos parents ; les revendeuses).',
        activitesEleves:
          'R1 : « lui » → « à son père » ; « leur » → « aux touristes » ; « eux » → « aux élèves ».\nR2 : … chez sa mère et lui demande… / chez ses amis et leur demande… / chez ses amies et leur demande…\nR3 : … s’adresse à elles / à lui / à eux / à eux / à elles.',
        indicateursInclusifs:
          '• Indicateur pédagogique : justesse des substitutions masculin/féminin et singulier/pluriel · Contrôle Q/R : Q « Quel pronom remplace les revendeuses après à ? » → R « à elles ».\n[Inclusion handicap] Moteur/DYS : manipulation d’étiquettes mobiles (lui / leur / à elle / à elles / à eux) avant toute copie.',
      },
      {
        etape: 'Découverte',
        sousTitreInvariable: 'Verbalisation de la règle syntaxique & trace écrite',
        duree: '8 min',
        activitesMaitre:
          '• Note quelques phrases réussies des élèves au tableau.\nQ1 : Par quels pronoms personnels remplace-t-on un GN (COI) ?\nQ2 : Devant quels pronoms trouve-t-on une préposition (à, de, avec, sur, pour) ?\nQ3 : Le pronom « leur » est-il précédé d’une préposition ? Et « lui » ?',
        activitesEleves:
          'R1 : Par les pronoms personnels COI : lui, leur, elle, elles, eux.\nR2 : Les pronoms elle, elles, eux sont souvent précédés d’une préposition (il s’adresse à elles ; il parle d’eux).\nR3 : Non, « leur » n’est jamais précédé d’une préposition (Maman leur a acheté des cahiers) ; « lui » peut être précédé ou non de « à » ou « de ».\n• Retient et copie la règle.',
        indicateursInclusifs:
          '• Indicateur pédagogique : découverte guidée de la règle et trace écrite exacte · Contrôle Q/R : Q « Peut-on dire il s’adresse à leur ? » → R « Non, on dit il leur parle ou il s’adresse à eux ».\n[Inclusion handicap] DYS/Moteur/TSA : remettre l’encadré « Retenir » imprimé en police aérée avec codes couleurs.',
      },
      {
        etape: 'Application',
        sousTitreInvariable: 'Exercices de réinvestissement gradués & vérification',
        duree: '8 min',
        activitesMaitre:
          '1) Exercices du manuel page 93.\n2) Consigne : Remplacez le pronom COI par le GN (COI) convenable :\na) La maîtresse leur parle. b) Les autorités leur offrent des vivres. c) Le chien lui obéit. d) Le médecin lui a prescrit des médicaments. e) À la maternité, la sage-femme rassemble les femmes et s’adresse à elles.\nQ1 : Quel GN (COI) remplace « lui » dans la phrase c ?\nQ2 : Quel GN (COI) remplace « elles » dans la phrase e ?',
        activitesEleves:
          '• Traite les exercices du manuel p. 93 puis remplace les pronoms :\na) … parle aux élèves. b) … offrent des vivres aux populations. d) … a prescrit des médicaments à maman.\nR1 : « lui » remplace « à son maître » (Le chien obéit à son maître).\nR2 : « elles » remplace « aux femmes » (… s’adresse aux femmes).',
        indicateursInclusifs:
          '• Indicateur pédagogique : correction orale et écrite des phrases · Contrôle Q/R : Q « Quelle phrase contient un COI singulier ? » → R « c) et d) avec lui ».\n[Inclusion handicap] Moteur/DYS : copier seulement 3 phrases ciblées ou compléter sur fiche à trous.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Synthèse des acquis grammaticaux & transfert',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris aujourd’hui en grammaire ?\nQ2 : Comment ces pronoms vous aideront-ils dans vos rédactions ?',
        activitesEleves:
          'R1 : J’ai appris à identifier un GN (COI) et à le remplacer par lui, leur, elle, elles ou eux.\nR2 : Je les utiliserai pour éviter les répétitions lorsque je parle ou j’écris.',
        indicateursInclusifs:
          '• Indicateur pédagogique : synthèse par 3 ou 4 élèves + transfert en rédaction · Contrôle Q/R : Q « Cite les 5 pronoms COI vus aujourd’hui » → R « lui, leur, elle, elles, eux ».\n[Inclusion handicap] Reformulation orale valorisée sans surcharge écrite.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quel pronom COI remplace « aux touristes » dans « Le guide indique le chemin aux touristes » ?',
        reponseAttendue: '« leur » : Le guide leur indique le chemin.',
        indicePedagogique: 'Placé devant le verbe, sans préposition, au pluriel = « leur » (invariable).',
        difficulte: 'Fondamental',
      },
      {
        question: 'Le pronom « leur » peut-il être précédé d’une préposition comme « à » ?',
        reponseAttendue: 'Non, « leur » n’est jamais précédé d’une préposition ; après « à », on emploie « eux » ou « elles ».',
        indicePedagogique: 'Compare : « Il leur parle » vs « Il s’adresse à eux ».',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Remplace le pronom dans : « À la maternité, la sage-femme rassemble les femmes et s’adresse à elles. »',
        reponseAttendue: '« elles » remplace « les femmes » (s’adresse aux femmes).',
        indicePedagogique: 'Cherche le nom féminin pluriel cité juste avant.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Les pronoms personnels COI (lui, leur, elle, elles, eux) évitent les répétitions d’un GN (COI).',
      traceEcriteEleve: 'GN (COI) → lui, leur (jamais précédé de préposition), elle, elles, eux (souvent après à, de, avec, sur, pour).',
      motsCles: ['Pronom COI', 'lui', 'leur', 'eux / elles', 'Préposition'],
      prolongement: 'Écrire 2 phrases personnelles utilisant « lui » et « leur » sans répétition.',
    },
  },

  // FICHE 6
  {
    id: 'cm1-s9-fiche-06',
    nom: 'Fiche 6 · Je manipule les phrases 2 — Verbes aller et venir',
    sousLabel: 'CM1 Semaine 9 · Conjugaison : temps simples, passé composé & plus-que-parfait (CB1 + CB3)',
    collection: 'cm1_s9',
    ficheNumero: 6,
    disciplineSpecifiqueId: 'modele-fr-manipule-phrases-2',
    origineModele: 'CM1 · Semaine 9 · Fiche 6',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 6) : conjuguer aller et venir (et revenir) aux temps simples, au passé composé et au plus-que-parfait avec l’auxiliaire être et l’accord du participe passé.',
    competenceDeBaseModele:
      'CB1 & CB3 : Mobiliser les ressources de la langue pour exprimer oralement ses pensées et produire à l’écrit des textes significatifs d’au moins dix phrases.',
    competenceViseeModele:
      'Identifier les verbes aller et venir dans des phrases et les employer aux temps simples, au passé composé et au plus-que-parfait de l’indicatif.',
    titreSuggere: 'Les verbes « aller » et « venir » aux temps simples, passé composé et plus-que-parfait',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Identifier les verbes aller et venir dans des phrases.',
      'Employer oralement ou par écrit aller et venir aux temps simples, au passé composé et au plus-que-parfait de l’indicatif.',
    ],
    prerequis: [
      'Conjuguer au passé simple (gagner, grandir, courir) et reconnaître les temps de l’indicatif.',
    ],
    materielSuggere: [
      'Mon livre de français CM1 (guide du maître p. 127-128, manuel p. 93-95)',
      'Phrase support, ardoise, craie, chiffon',
      'Frise temporelle visuelle et tableau de conjugaison bicolore radical/terminaison + accord être (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique collectif puis rappel rapide du passé simple sur ardoise.',
      miseEnSituation: 'Lecture au tableau de trois phrases évoquant des déplacements (stands de jeu, livrets scolaires, berger).',
      consigneDepart: 'Observez les verbes en action dans les trois phrases au tableau.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en confiance collective',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant court en lien avec les fêtes et les voyages allons-nous entonner pour lancer la séance ?\nQ2 : Qui veut accompagner le rythme avec moi face à la classe ?\n• Lance le chant, bat la mesure visiblement et invite tous les élèves à participer avec entrain.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant choisi avec la classe).\nR2 : Un élève volontaire bat la mesure ; toute la classe chante ensemble avec dynamisme (debout ou assis selon le besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court thématique et adhésion collective · Contrôle Q/R : Q « Quel verbe d’action apparaît souvent dans nos chants de fête ? » → R « Aller, venir, partir, chanter ».\n[Inclusion handicap] Auditif/TSA : battre la mesure face classe avec signal visuel d’entrée ; Moteur : participation assise valorisée.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon & solidarité de table',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre ardoise, votre craie, votre chiffon et votre livre de français CM1.\nQ2 : Qui n’a pas son matériel complet aujourd’hui et avec quel camarade peut-il le partager ?',
        activitesEleves:
          'R1 : Je lève mon ardoise propre, ma craie, mon chiffon et je pose mon manuel sur la table.\nR2 : Je signale ce qui me manque et je partage l’ardoise ou le manuel avec mon voisin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide en circulant et partage effectif · Contrôle Q/R : Q « Chacun a-t-il accès à une ardoise et au manuel ? » → R « Oui, individuellement ou en binôme ».\n[Inclusion handicap] Moteur/Visuel : fournir feutre effaçable large ou cahier pré-ligné et frise temporelle agrandie sur table.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Réactivation des prérequis sur ardoise',
        duree: '6 min',
        activitesMaitre:
          'Consigne : Conjuguez au passé simple de l’indicatif les verbes gagner, grandir et courir avec : je ; Kpatcha ; ma sœur et moi ; les éperviers ; maman et toi.\nQ1 : Quelle terminaison prend « gagner » (1er groupe) à la 3e personne du singulier (Kpatcha) et à la 1re personne du pluriel (ma sœur et moi) ?\nQ2 : Quelle voyelle caractérise le passé simple de « grandir » puis celui de « courir » ?',
        activitesEleves:
          '• Écrit sur l’ardoise : gagner (je gagnai, Kpatcha gagna, nous gagnâmes, ils gagnèrent, vous gagnâtes) ; grandir (je grandis, il grandit, nous grandîmes, ils grandirent, vous grandîtes) ; courir (je courus, il courut, nous courûmes, ils coururent, vous courûtes).\nR1 : Pour « gagner » : -a avec Kpatcha (gagna) et -âmes avec ma sœur et moi (gagnâmes).\nR2 : La voyelle -i- pour « grandir » (grandit) et la voyelle -u- pour « courir » (courut).',
        indicateursInclusifs:
          '• Indicateur pédagogique : maîtrise des terminaisons du passé simple sur ardoise · Contrôle Q/R : Q « Comment écrit-on ma sœur et moi (courir) au passé simple ? » → R « nous courûmes (avec accent circonflexe) ».\n[Inclusion handicap] DYS/Moteur : ne faire écrire qu’un verbe ou une seule personne par tour d’ardoise ; fournir bande-repère des 3 types (-a / -i / -u).',
      },
      {
        etape: 'Mise en situation',
        sousTitreInvariable: 'Découverte des phrases supports & annonce de l’objet',
        duree: '5 min',
        activitesMaitre:
          '• Écrit au tableau et fait lire à haute voix :\n1- Les élèves vont et viennent d’un stand de jeu à un autre.\n2- À la fin de l’année dernière, les parents étaient allés retirer les livrets scolaires de leurs enfants.\n3- Le berger ira à la source d’eau avec son troupeau de bœufs.\nQ1 : De quoi parlent ces trois phrases ? Quels mots montrent les actions de déplacement ?\nQ2 : Ces trois actions se passent-elles au même moment (hier, aujourd’hui ou demain) ?\n• Annonce l’objet et les objectifs : identifier et conjuguer « aller » et « venir » aux temps simples, au passé composé et au plus-que-parfait.',
        activitesEleves:
          '• Observe, suit du doigt et lit les trois phrases à haute voix.\nR1 : Elles parlent de déplacements : « vont », « viennent », « étaient allés » et « ira ».\nR2 : Non : la phrase 1 est au présent (aujourd’hui), la phrase 2 dans le passé lointain (l’année dernière) et la phrase 3 dans le futur (demain).\n• Reformule l’objet de la séance.',
        indicateursInclusifs:
          '• Indicateur pédagogique : repérage des verbes de déplacement et situement sur la ligne du temps · Contrôle Q/R : Q « Quel verbe situe l’action dans le futur ? » → R « ira (le berger ira) ».\n[Inclusion handicap] Visuel/DYS/TSA : encadrer les verbes en couleur au tableau et relier chaque phrase à la flèche Passé / Présent / Futur.',
      },
      {
        etape: 'Manipulation',
        sousTitreInvariable: 'Repérage, substitutions de personnes & variations temporelles',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Relevez tous les verbes conjugués des phrases 1, 2 et 3, donnez leur infinitif puis leur temps exact.\nQ2 : Transformez oralement puis sur ardoise : « Les élèves vont et viennent » avec : je ; tu ; elle ; nous ; toi et elle.\nQ3 : Transformez « Les parents étaient allés retirer les livrets » avec : Koffi et moi ; je ; tu ; vous ; maman ; son frère et toi.\nQ4 : Que remarquez-vous à la fin de « allé » quand le sujet est « maman » puis « les parents » ?',
        activitesEleves:
          'R1 : vont → aller (présent) ; viennent → venir (présent) ; étaient allés → aller (plus-que-parfait) ; ira → aller (futur simple).\nR2 : Je vais et viens ; tu vas et viens ; elle va et vient ; nous allons et venons ; toi et elle allez et venez.\nR3 : Koffi et moi étions allés ; j’étais allé(e) ; tu étais allé(e) ; vous étiez allés ; maman était allée ; son frère et toi étiez allés.\nR4 : Le participe passé prend « -e » avec « maman » (féminin singulier) et « -s » avec « les parents » (masculin pluriel).',
        indicateursInclusifs:
          '• Indicateur pédagogique : justesse des substitutions et perception de l’accord avec « être » · Contrôle Q/R : Q « Comment écrit-on maman était all… ? » → R « maman était allée (-ée) ».\n[Inclusion handicap] DYS/Auditif/Moteur : étiquettes-sujets et étiquettes-terminaisons (-é / -ée / -és) codées en couleur (rose féminin, bleu masculin, +s pluriel).',
      },
      {
        etape: 'Découverte',
        sousTitreInvariable: 'Observation des radicaux, auxiliaire être & règle de conjugaison',
        duree: '8 min',
        activitesMaitre:
          'Consigne : Ouvrez le manuel page 94 et observez le tableau de conjugaison de « aller » et « venir ».\nQ1 : À quel groupe appartiennent les verbes « aller » et « venir » ? Pourquoi ?\nQ2 : Quels sont les trois radicaux différents du verbe « aller » aux temps simples (présent, imparfait, futur) ?\nQ3 : Avec quel auxiliaire conjugue-t-on « aller » et « venir » au passé composé et au plus-que-parfait ? Quelle règle s’applique au participe passé ?\nQ4 : Comment conjugue-t-on « revenir » (ex. : Fati est revenue / était revenue) ?',
        activitesEleves:
          'R1 : Au 3e groupe tous les deux, car leur radical change (« aller » n’est pas un verbe du 1er groupe malgré sa terminaison -er).\nR2 : Les radicaux v- (je vais, tu vas), all- (nous allons, j’allais, j’allai) et ir- (j’irai).\nR3 : Avec l’auxiliaire « être » (au présent pour le passé composé : je suis allé ; à l’imparfait pour le plus-que-parfait : j’étais allé) ; le participe passé s’accorde en genre et en nombre avec le sujet.\nR4 : « Revenir » se conjugue exactement comme « venir » (avec l’auxiliaire être aux temps composés).\n• Copie la synthèse.',
        indicateursInclusifs:
          '• Indicateur pédagogique : formulation exacte de la règle des radicaux et de l’accord avec être · Contrôle Q/R : Q « Quelle différence entre passé composé et plus-que-parfait d’aller ? » → R « Auxiliaire être au présent (suis allé) vs à l’imparfait (étais allé) ».\n[Inclusion handicap] DYS/Visuel/Moteur : distribuer la fiche « Retenir » agrandie avec les 3 radicaux d’aller (v-, all-, ir-) surlignés.',
      },
      {
        etape: 'Application',
        sousTitreInvariable: 'Exercices de réinvestissement gradués & correction',
        duree: '8 min',
        activitesMaitre:
          '1) Traiter d’abord les exercices du manuel page 95.\n2) Consigne : Réécrivez chaque phrase au temps demandé :\n1- Ils vont au stade pour suivre un match. (futur simple)\n2- Fati revient de Sokodé. (plus-que-parfait)\n3- Chaque samedi, mes parents vont au marché pour faire les emplettes. (imparfait)\n4- Les passagers viennent d’arriver à la gare routière. (passé simple)\nQ1 : Dans la phrase 2, pourquoi faut-il écrire « était revenue » avec un -e final ?\nQ2 : Dans la phrase 4, quel radical prend « venir » au passé simple avec « les passagers » ?',
        activitesEleves:
          '• Réalise les exercices p. 95 puis transforme les 4 phrases :\n1- Ils iront au stade pour suivre un match.\n2- Fati était revenue de Sokodé.\n3- Chaque samedi, mes parents allaient au marché pour faire les emplettes.\n4- Les passagers vinrent d’arriver à la gare routière.\nR1 : Parce que l’auxiliaire est « être » et le sujet « Fati » est féminin singulier.\nR2 : Le radical « vin- » suivi de « -rent » : ils vinrent.',
        indicateursInclusifs:
          '• Indicateur pédagogique : correction collective puis individuelle exacte · Contrôle Q/R : Q « Transforme mes parents vont à l’imparfait » → R « mes parents allaient ».\n[Inclusion handicap] Moteur/DYS : proposer les 4 phrases imprimées à trous pour ne compléter que le verbe conjugué.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Synthèse des acquis de conjugaison & transfert',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris aujourd’hui sur les verbes « aller » et « venir » ?\nQ2 : Dans quelles situations de la vie courante ou de rédaction allez-vous utiliser ces verbes et ces temps ?\n• Félicite la classe et propose de rédiger 2 phrases personnelles sur une sortie.',
        activitesEleves:
          'R1 : J’ai appris à conjuguer aller, venir et revenir aux temps simples, au passé composé et au plus-que-parfait en accordant le participe passé avec être.\nR2 : Je les utiliserai pour raconter mes déplacements, mes sorties et mes voyages au passé ou au futur.',
        indicateursInclusifs:
          '• Indicateur pédagogique : verbalisation par 3 ou 4 élèves + lien avec la production écrite · Contrôle Q/R : Q « Donne la 1re personne du pluriel de venir au futur simple et au passé composé » → R « nous viendrons / nous sommes venus ».\n[Inclusion handicap] Auto-évaluation par carte couleur (vert/jaune) ou reformulation orale.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quel auxiliaire utilise-t-on pour conjuguer aller et venir au passé composé et au plus-que-parfait ?',
        reponseAttendue: 'L’auxiliaire « être » (ex. : je suis allé, j’étais venu), avec accord du participe passé.',
        indicePedagogique: 'Vérifie avec l’exemple « maman était allée ».',
        difficulte: 'Fondamental',
      },
      {
        question: 'Mets au plus-que-parfait : « Fati revient de Sokodé. »',
        reponseAttendue: 'Fati était revenue de Sokodé.',
        indicePedagogique: 'Être à l’imparfait (était) + participe passé accordé au féminin (revenue).',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Mets au passé simple : « Les passagers viennent d’arriver à la gare routière. »',
        reponseAttendue: 'Les passagers vinrent d’arriver à la gare routière.',
        indicePedagogique: 'Rappelle-toi le radical « vin- » à la 3e personne du pluriel (-rent).',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Aller et venir sont du 3e groupe ; aux temps composés, ils se conjuguent avec « être » et s’accordent avec le sujet.',
      traceEcriteEleve: 'Aller (vais, allais, irai, allai ; je suis allé / j’étais allé) · Venir / Revenir (viens, venais, viendrai, vins ; je suis venu / j’étais venu).',
      motsCles: ['Aller', 'Venir', 'Auxiliaire être', 'Plus-que-parfait', 'Passé simple'],
      prolongement: 'Rédiger 2 phrases racontant une sortie au passé composé et au plus-que-parfait.',
    },
  },

  // FICHE 7
  {
    id: 'cm1-s9-fiche-07',
    nom: 'Fiche 7 · Je produis un texte — Raconter une sortie récréative',
    sousLabel: 'CM1 Semaine 9 · Production écrite en 3 moments (début, déroulement, fin) (CB3)',
    collection: 'cm1_s9',
    ficheNumero: 7,
    disciplineSpecifiqueId: 'modele-fr-produis-texte',
    origineModele: 'CM1 · Semaine 9 · Fiche 7',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 7) : repérer les 3 moments d’un récit de sortie et produire un texte d’au moins dix phrases (avec production modèle sur le barrage de Nangbéto).',
    competenceDeBaseModele:
      'CB3 : Mobiliser les ressources de la langue pour produire à l’écrit des différents types de textes significatifs, simples et courts d’au moins dix phrases dans des situations de communication.',
    competenceViseeModele:
      'Repérer les différents moments d’un récit de sortie et produire un texte cohérent racontant une sortie récréative en voiture avec ses parents.',
    titreSuggere: 'Raconter une sortie récréative (Je produis un texte)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Repérer les différents moments du texte (« Une belle randonnée »).',
      'Produire un texte proche du texte étudié en racontant une sortie récréative en trois moments.',
    ],
    prerequis: [
      'Rappeler les étapes de structuration d’un écrit (ex. lettre amicale : en-tête, corps, conclusion).',
    ],
    materielSuggere: [
      'Mon livre de français CM1 (guide du maître p. 133-134, manuel p. 99)',
      'Texte support, cahier, stylo',
      'Grille visuelle à 3 boîtes (Début / Déroulement / Fin), banque de connecteurs et aide à la dictée vocale/pair (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique collectif puis rappel des étapes de la lettre amicale.',
      miseEnSituation: 'Rappel de l’idée générale du texte n° 2 « Une belle randonnée » pour en dégager l’architecture.',
      consigneDepart: 'Repérez les trois grands moments du texte lu et rangez-les dans le tableau.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant court en lien avec les fêtes et les sorties allons-nous chanter ensemble ?\nQ2 : Qui donne le signal de départ avec moi ?\n• Lance le chant, bat la mesure et encourage chacun à chanter avec entrain.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant connu de la classe).\nR2 : Un élève aide à battre la mesure ; toute la classe chante en rythme.',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court entraînant et climat serein · Contrôle Q/R : Q « Ce chant donne envie de partager quel moment ? » → R « Une fête ou une sortie ».\n[Inclusion handicap] TSA/Auditif : signal visuel d’entrée et battement visible face classe.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification cahier, stylo & organisation du partage',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre cahier de rédaction, votre stylo et le texte support (« Une belle randonnée »).\nQ2 : Qui n’a pas son matériel et comment organisons-nous le partage ?',
        activitesEleves:
          'R1 : Je présente mon cahier ouvert, mon stylo et le texte support sur la table.\nR2 : Je signale ce qu’il me manque et je partage avec mon voisin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : disponibilité effective du cahier et du stylo · Contrôle Q/R : Q « Tout le monde a-t-il de quoi écrire ou un gabarit ? » → R « Oui ».\n[Inclusion handicap] Moteur/DYS : fournir guide-doigts, cahier à interlignes espacés ou fiche-guide à 3 cadres (Début / Déroulement / Fin).',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Rappel de structuration d’un écrit antérieur',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Quelles sont les grandes étapes pour rédiger une lettre amicale ?\nQ2 : Où place-t-on le lieu et la date, les coordonnées de l’expéditeur puis la signature ?\nQ3 : Pourquoi doit-on organiser un texte en étapes avant de l’écrire ?',
        activitesEleves:
          'R1 : L’en-tête, la formule d’appel, le corps de la lettre (objet, événements, sentiments), la formule finale et la signature.\nR2 : Lieu et date en haut à droite ; expéditeur en haut à gauche ; signature en bas à droite.\nR3 : Pour que le lecteur comprenne facilement l’histoire dans l’ordre.',
        indicateursInclusifs:
          '• Indicateur pédagogique : rappel exact de la silhouette de la lettre · Contrôle Q/R : Q « Que contient le corps d’une lettre amicale ? » → R « L’objet, les événements vécus et les sentiments ».\n[Inclusion handicap] Visuel/DYS : afficher la silhouette schématique de la lettre avec 4 zones colorées.',
      },
      {
        etape: 'Mise en situation',
        sousTitreInvariable: 'Rappel du texte modèle & annonce de l’objet d’étude',
        duree: '4 min',
        activitesMaitre:
          'Q1 : De quoi nous parlait le texte n° 2 « Une belle randonnée » étudié en lecture ?\nQ2 : Avec qui Tété et ses amis sont-ils partis et qui les a accueillis sur place ?\n• Annonce l’objet et les objectifs : repérer les trois moments d’un récit de sortie puis produire un texte d’au moins dix phrases racontant une sortie récréative en voiture avec ses parents.',
        activitesEleves:
          'R1 : Il raconte une excursion, une belle sortie récréative entre amis sur un site touristique.\nR2 : Entre amis ; ils ont été accueillis par un guide touristique.\n• Reformule l’objet de la leçon.',
        indicateursInclusifs:
          '• Indicateur pédagogique : rappel fidèle de l’idée générale et appropriation du projet d’écriture · Contrôle Q/R : Q « Que devons-nous savoir produire à la fin de la séance ? » → R « Raconter une sortie récréative en trois moments ».\n[Inclusion handicap] TSA/Auditif : afficher l’objectif visuel « Raconter une sortie en 3 étapes » au tableau.',
      },
      {
        etape: 'Manipulation',
        sousTitreInvariable: 'Découpage du texte modèle en moments clés dans un tableau',
        duree: '8 min',
        activitesMaitre:
          'Consigne : Observez le texte « Une belle randonnée », découpez-le en trois grands moments et rangez chaque passage dans le tableau (Début | Déroulement | Fin et impressions).\nQ1 : Où commence et où finit le Début de la randonnée ? Que décide-t-on et que prépare-t-on ?\nQ2 : Que raconte le Déroulement ? Par quels mots de passage repère-t-on les actions ?\nQ3 : Comment se termine l’excursion et quel sentiment exprime le texte à la fin ?\n• Fait lire à haute voix chacun des trois passages repérés.',
        activitesEleves:
          'R1 : Début : de « Tété et ses amis décident d’aller en randonnée… » jusqu’à « …site touristique de renommée internationale » (décision, préparatifs, départ).\nR2 : Déroulement : rencontre avec le guide touristique, visite commentée et actions vécues jusqu’au « sommeil réparateur ».\nR3 : Fin et impressions : au réveil, les randonneurs sont fatigués mais très contents d’avoir réalisé leur rêve.\n• Lit à haute voix les trois extraits correspondants.',
        indicateursInclusifs:
          '• Indicateur pédagogique : découpage exact en 3 blocs dans le tableau · Contrôle Q/R : Q « Dans quel moment place-t-on la rencontre avec le guide ? » → R « Dans le déroulement (2e moment) ».\n[Inclusion handicap] DYS/Visuel : surligner le texte en 3 couleurs (bleu = début, vert = déroulement, orange = fin) et manipuler 3 bandes-titres.',
      },
      {
        etape: 'Découverte',
        sousTitreInvariable: 'Dégagement de l’ordre chronologique & trace écrite',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Les actions de ce récit se suivent-elles dans un ordre logique dans le temps ?\nQ2 : Peut-on placer la visite du site avant le départ ou avant les préparatifs ? Pourquoi ?\nQ3 : Quels trois éléments précis faut-il décrire quand on raconte une sortie récréative (randonnée, visite, excursion, promenade) ?',
        activitesEleves:
          'R1 : Oui, les actions se suivent dans un ordre chronologique logique.\nR2 : Non, on ne peut pas intervertir l’ordre : on prépare d’abord le voyage, on voyage, on visite puis on rentre.\nR3 : Il faut décrire : 1) Le début (qui part, quand, les préparatifs, l’heure du départ) ; 2) Le déroulement (le trajet, ce qu’on a vu, fait, entendu, mangé) ; 3) La fin et les impressions (le retour, le ressenti, la leçon tirée).\n• Retient et note la grille de rédaction.',
        indicateursInclusifs:
          '• Indicateur pédagogique : compréhension de l’enchaînement chronologique non interversible · Contrôle Q/R : Q « Cite 2 informations à mettre absolument dans le début » → R « Le jour/l’heure du départ et les préparatifs avec qui on part ».\n[Inclusion handicap] TSA/Moteur : afficher une frise en 3 vignettes (1. Départ → 2. Visite → 3. Retour & émotions) + banque de connecteurs (Très tôt, Puis, Après, Enfin).',
      },
      {
        etape: 'Application et Transfert',
        sousTitreInvariable: 'Planification guidée, rédaction individuelle & production modèle',
        duree: '12 min',
        activitesMaitre:
          '1) Exercices préparatoires du manuel page 99.\n2) Consigne : Raconte par écrit, en dix phrases au moins, ce que tu as vu et fait au cours d’une randonnée en voiture avec tes parents.\nQ1 (Planification Début) : Quel jour êtes-vous partis ? Avec qui ? Qu’avait préparé maman ? Où êtes-vous allés ?\nQ2 (Planification Déroulement) : Combien de temps a duré le trajet ? Qui vous a accueillis ? Qu’avez-vous observé et fait avant puis après la pause ?\nQ3 (Planification Fin) : Comment s’est passé le retour et quel sentiment as-tu gardé de cette sortie ?',
        activitesEleves:
          '• Traite les exercices p. 99 puis planifie et rédige son récit en trois paragraphes :\nR1 : Un samedi très tôt, mes parents et moi en voiture vers le barrage de Nangbéto avec la nourriture préparée la veille.\nR2 : Une heure et demie de route, accueil par le guide, visite des compartiments de l’usine, déjeuner après trente minutes, nettoyage des lieux.\nR3 : Reprise de la route du retour ; fatigués mais très contents.\nProduction modèle : Un samedi, mes parents et moi avons décidé de visiter le barrage de Nangbéto en voiture. Très tôt le matin, nous avons quitté la maison avec de la nourriture préparée la veille par maman. Nous sommes arrivés sur le site après une heure et demie de route. Un homme s’est approché de nous : c’était le guide. Il a discuté avec papa, qui lui a expliqué le but de notre visite. Nous sommes passés d’un compartiment à un autre pour observer les installations de l’usine. Émus par ce parcours, nous avons pris une pause déjeuner après une trentaine de minutes. Après le repas, malgré la fatigue, nous avons nettoyé les lieux. Puis nous avons repris la route du retour. Nous étions fatigués mais très contents de cette belle sortie.',
        indicateursInclusifs:
          '• Indicateur pédagogique : respect des 3 moments, des connecteurs temporels et de la cohérence des temps · Contrôle Q/R : Q « Quel geste citoyen font les visiteurs avant de repartir ? » → R « Malgré la fatigue, ils nettoient les lieux ».\n[Inclusion handicap] Moteur/DYS/TSA : autoriser 5 à 6 phrases structurées à l’aide d’amorces (« Un samedi… », « Arrivés sur le site… », « À la fin… »), fiche vocabulaire illustrée ou dictée à un pair/adulte.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Auto-évaluation du récit & lien avec la vie courante',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris à faire aujourd’hui en production écrite ?\nQ2 : Comment relirez-vous vos prochaines rédactions pour vérifier qu’elles sont bien construites ?\n• Félicite les élèves pour leurs récits et propose la relecture illustrée à la maison.',
        activitesEleves:
          'R1 : J’ai appris à raconter une sortie récréative dans l’ordre en trois moments : début, déroulement, fin et impressions.\nR2 : Je vérifierai les trois paragraphes, l’ordre chronologique et mes sentiments à la fin pour raconter mes sorties à mes camarades ou à ma famille.',
        indicateursInclusifs:
          '• Indicateur pédagogique : restitution par 3 ou 4 élèves et auto-contrôle des 3 moments · Contrôle Q/R : Q « Si j’ai oublié de dire comment je me sentais au retour, quel moment manque ? » → R « La fin et les impressions ».\n[Inclusion handicap] Valoriser la lecture à voix haute de courtes phrases réussies sans exposer les erreurs orthographiques.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quels sont les trois moments obligatoires pour raconter une sortie récréative ?',
        reponseAttendue: '1) Le début (préparatifs, jour, départ), 2) Le déroulement (actions, observations), 3) La fin et les impressions.',
        indicePedagogique: 'Pense à l’ordre chronologique : Avant / Pendant / Après.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Peut-on placer le retour à la maison avant la visite du site ?',
        reponseAttendue: 'Non, car les actions doivent s’enchaîner dans un ordre chronologique et logique.',
        indicePedagogique: 'Vérifie avec les mots de liaison temporelle (Très tôt… Puis… Après le repas…).',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Dans la production modèle au barrage de Nangbéto, quel sentiment exprime le narrateur à la fin ?',
        reponseAttendue: 'Il est fatigué mais très content de cette belle sortie.',
        indicePedagogique: 'Relis la toute dernière phrase du texte modèle.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Raconter une sortie récréative exige un ordre chronologique strict : début, déroulement, fin et impressions.',
      traceEcriteEleve: 'Mon récit en 3 moments : 1) Début (qui, quand, où, départ) · 2) Déroulement (ce que j’ai vu et fait) · 3) Fin et impressions.',
      motsCles: ['Chronologie', 'Début', 'Déroulement', 'Impressions', 'Barrage de Nangbéto'],
      prolongement: 'Relire et illustrer sa rédaction à la maison en encadrant les trois paragraphes.',
    },
  },

  // FICHE 8
  {
    id: 'cm1-s9-fiche-08',
    nom: 'Fiche 8 · Je sais écrire les mots — Pluriel des noms en « eu » et « ou »',
    sousLabel: 'CM1 Semaine 9 · Orthographe lexicale, exceptions & dictée préparée (CB3)',
    collection: 'cm1_s9',
    ficheNumero: 8,
    disciplineSpecifiqueId: 'modele-fr-sais-ecrire-mots',
    origineModele: 'CM1 · Semaine 9 · Fiche 8',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '50 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 8) : règle du pluriel des noms en « eu » (x ; exceptions pneus, bleus, lieus) et en « ou » (s ; 7 exceptions bijoux, cailloux, choux, genoux, hiboux, joujoux, poux) + dictée complète.',
    competenceDeBaseModele:
      'CB3 : Mobiliser les ressources de la langue pour produire à l’écrit des différents types de textes significatifs, simples et courts d’au moins dix phrases dans des situations de communication.',
    competenceViseeModele:
      'Employer à l’oral et à l’écrit le pluriel des noms terminés par « eu » et « ou » en respectant la règle générale et les exceptions.',
    titreSuggere: 'Le pluriel des noms terminés par « eu » et « ou » (Je sais écrire les mots)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Distinguer le pluriel régulier des noms en « eu » (+x) et en « ou » (+s).',
      'Orthographier sans erreur les exceptions (pneus, bleus, lieus ; bijoux, cailloux, choux, genoux, hiboux, joujoux, poux).',
    ],
    prerequis: [
      'Accorder le participe passé avec le COD placé avant le verbe.',
    ],
    materielSuggere: [
      'Mon livre de français CM1 (guide du maître p. 132, manuel p. 98)',
      'Phrase d’étude, ardoise, craie, chiffon',
      'Cartes-images des 7 exceptions en -oux + dictée à trous pour élèves DYS/moteur (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique puis révision rapide sur ardoise de l’accord du participe passé avec COD antéposé.',
      miseEnSituation: 'Observation au tableau de 4 phrases contenant pneus, cailloux, bijoux, acajous et jeux.',
      consigneDepart: 'Observez la terminaison finale de chacun de ces noms au pluriel.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant joyeux en lien avec les fêtes allons-nous chanter pour démarrer la séance ?\nQ2 : Qui veut marquer le tempo avec moi ?\n• Lance le chant, bat la mesure face à la classe et invite chacun à participer.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant choisi avec la classe).\nR2 : Un élève marque la mesure ; toute la classe chante avec entrain (debout ou assis selon le besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chant court entraînant et climat attentif · Contrôle Q/R : Q « Quel mot du chant prendrait un s ou un x au pluriel ? » → R « Réponse orale sur un nom du chant ».\n[Inclusion handicap] Auditif/TSA : gestes de rythme visibles face classe ; Moteur : participation assise.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon & solidarité',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre ardoise, votre craie, votre chiffon et votre cahier de dictée.\nQ2 : Qui n’a pas son matériel et avec qui peut-il le partager ?',
        activitesEleves:
          'R1 : Je lève mon ardoise, ma craie, mon chiffon et je pose mon cahier sur la table.\nR2 : Je signale ce qu’il me manque et je partage avec mon voisin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide en circulant et partage effectif · Contrôle Q/R : Q « Chacun a-t-il une surface prête pour la dictée ? » → R « Oui, ardoise et cahier prêts ».\n[Inclusion handicap] Moteur/Visuel : crayon ergonomique, ardoise antidérapante et fiche mémo agrandie.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Révision orthographique sur ardoise',
        duree: '6 min',
        activitesMaitre:
          'Consigne : Remplacez les COD soulignés par un pronom et accordez le participe passé sur l’ardoise :\n1- Les ouvriers ont créé leur entreprise. 2- Le menuisier a fabriqué de jolies armoires. 3- Les élèves ont produit des légumes bios. 4- Les cuisinières ont proposé des mets locaux. 5- Moussa a acheté des chaussures.\nQ1 : Comment s’accorde « fabriquées » dans la phrase 2 et pourquoi ?\nQ2 : Comment s’accorde « produits » dans la phrase 3 ?',
        activitesEleves:
          '• Écrit sur l’ardoise : 1- Les ouvriers l’ont créée. 2- Le menuisier les a fabriquées. 3- Les élèves les ont produits. 4- Les cuisinières les ont proposés. 5- Moussa les a achetées.\nR1 : « fabriquées » prend -es (féminin pluriel) car « les » remplace « de jolies armoires », placé avant l’auxiliaire avoir.\nR2 : « produits » prend -s (masculin pluriel) car « les » remplace « des légumes bios », placé avant le verbe.',
        indicateursInclusifs:
          '• Indicateur pédagogique : justification exacte de l’accord du participe passé avec COD antéposé · Contrôle Q/R : Q « Que remplace l’ dans Les ouvriers l’ont créée ? » → R « leur entreprise (féminin singulier → -e) ».\n[Inclusion handicap] DYS/Moteur : faire écrire 2 phrases sur ardoise et traiter les 3 autres à l’oral avec cartes genre/nombre.',
      },
      {
        etape: 'Mise en situation',
        sousTitreInvariable: 'Observation du corpus de phrases supports',
        duree: '5 min',
        activitesMaitre:
          '• Écrit au tableau et fait lire :\n1- Dans des crissements de pneus sur les cailloux, les randonneurs parviennent à destination.\n2- La mariée porte des bijoux dorés.\n3- Dans le jardin, il y a des acajous.\n4- Mon pays a participé aux jeux olympiques de l’année 2021.\nQ1 : Quels noms terminés par le son [ø] (eu) ou [u] (ou) reconnaissez-vous dans ces phrases ?\nQ2 : Ces noms sont-ils au singulier ou au pluriel ?\n• Annonce l’objet et les objectifs : orthographier sans erreur le pluriel des noms en « eu » et en « ou » avec leurs exceptions.',
        activitesEleves:
          '• Observe au tableau, suit et lit à haute voix.\nR1 : pneus, cailloux, bijoux, acajous, jeux.\nR2 : Ils sont tous au pluriel, mais certains finissent par « s » et d’autres par « x ».\n• Reformule l’objet de la séance.',
        indicateursInclusifs:
          '• Indicateur pédagogique : identification claire des 5 noms cibles et de leurs terminaisons · Contrôle Q/R : Q « Lesquels de ces cinq noms se terminent par x ? » → R « cailloux, bijoux, jeux ».\n[Inclusion handicap] Visuel/DYS : coder les terminaisons « s » en rouge et « x » en vert au tableau.',
      },
      {
        etape: 'Manipulation',
        sousTitreInvariable: 'Tri singulier/pluriel & recherche de mots analogues',
        duree: '7 min',
        activitesMaitre:
          'Q1 : Classez ces cinq noms en deux colonnes : noms en « eu » et noms en « ou ».\nQ2 : Écrivez chacun de ces cinq noms au singulier sur votre ardoise.\nQ3 : Trouvez d’autres noms en « eu » et en « ou » puis essayez de les mettre au pluriel.',
        activitesEleves:
          'R1 : Colonne « eu » : pneus, jeux | Colonne « ou » : cailloux, bijoux, acajous.\nR2 : un pneu, un jeu ; un caillou, un bijou, un acajou.\nR3 : un feu → des feux ; un cheveu → des cheveux ; un genou → des genoux ; un chou → des choux ; un clou → des clous ; un trou → des trous.',
        indicateursInclusifs:
          '• Indicateur pédagogique : tri exact et production d’exemples personnels · Contrôle Q/R : Q « Quel est le singulier de des bijoux ? » → R « un bijou (sans x) ».\n[Inclusion handicap] Visuel/Auditif/TSA : associer chaque exception à une carte-image ou un mime (genou, bijou, caillou, chou, hibou, joujou, pou).',
      },
      {
        etape: 'Découverte',
        sousTitreInvariable: 'Comparaison singulier/pluriel, règle & exceptions',
        duree: '9 min',
        activitesMaitre:
          'Q1 : Comparez la colonne singulier et la colonne pluriel : que remarquez-vous à la fin des noms ?\nQ2 : Quelle est la règle générale du pluriel des noms en « eu » et quelles sont les 3 exceptions qui prennent un « s » ?\nQ3 : Quelle est la règle générale du pluriel des noms en « ou » et quels sont les 7 noms exceptions qui prennent un « x » ?',
        activitesEleves:
          'R1 : Au pluriel, les noms en « eu » et en « ou » se terminent soit par « s », soit par « x ».\nR2 : Les noms en « eu » prennent généralement un « x » (un jeu → des jeux), sauf : pneu, bleu, lieu (le poisson) qui prennent un « s » (des pneus, des bleus, des lieus).\nR3 : Les noms en « ou » prennent généralement un « s » (un clou → des clous, l’acajou → des acajous), sauf 7 noms : bijou, caillou, chou, genou, hibou, joujou, pou qui prennent un « x » (des bijoux, des genoux…).\n• Retient et note la synthèse.',
        indicateursInclusifs:
          '• Indicateur pédagogique : énonciation complète des règles et des 3 + 7 exceptions · Contrôle Q/R : Q « Pourquoi dit-on des lieus avec s dans la pêche ? » → R « Parce que le poisson (le lieu) est une exception en -eus ».\n[Inclusion handicap] DYS/TSA : fiche mémo illustrée des 7 noms en -oux (« Viens sur mes genoux… ») et des 3 exceptions en -eus laissée sur table.',
      },
      {
        etape: 'Application',
        sousTitreInvariable: 'Exercices du manuel & dictée de contrôle guidée',
        duree: '14 min',
        activitesMaitre:
          '1) Traiter les exercices du manuel page 98.\n2) Dictée préparée et guidée : « Le menuisier a acheté un paquet de clous. Ma grande sœur m’a donné en cadeau des bijoux qu’elle a rapportés du Ghana. Le grand-père est un pêcheur avisé qui prend souvent des lieus. Dans la cour de notre école, on voit un grand acajou qui nous donne de l’ombre. »\nQ1 : Avant d’écrire, quels mots de la dictée demandent d’appliquer la règle du jour ?\nQ2 : Pourquoi « acajou » dans la dernière phrase ne prend-il ni s ni x ?',
        activitesEleves:
          '• Réalise les exercices p. 98 puis écrit la dictée sous la dictée du maître.\nR1 : « clous » (-ou + s), « bijoux » (exception -oux), « lieus » (poisson, exception -eus) et « acajou » (singulier).\nR2 : Parce qu’il y a « un grand acajou », donc le nom est au singulier.',
        indicateursInclusifs:
          '• Indicateur pédagogique : correction des exercices et réussite orthographique des mots cibles en dictée · Contrôle Q/R : Q « Épelle les trois mots clés de la dictée au pluriel » → R « C-L-O-U-S, B-I-J-O-U-X, L-I-E-U-S ».\n[Inclusion handicap] DYS/Moteur/Auditif : dicter face classe par groupes de souffle ; fournir dictée à trous ciblant clous/bijoux/lieus/acajou pour les élèves dyspraxiques.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Synthèse orthographique & réinvestissement',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Qu’avons-nous appris aujourd’hui sur l’orthographe du pluriel des noms ?\nQ2 : Quel réflexe devez-vous avoir avant d’écrire un nom en « eu » ou en « ou » au pluriel ?',
        activitesEleves:
          'R1 : J’ai appris la règle générale (-eu → -eux ; -ou → -ous) et les exceptions (pneus, bleus, lieus ; et les 7 mots en -oux).\nR2 : Je vérifie si le nom fait partie des exceptions avant de choisir « s » ou « x » dans mes dictées et mes rédactions.',
        indicateursInclusifs:
          '• Indicateur pédagogique : restitution orale des exceptions et transfert en écriture autonome · Contrôle Q/R : Q « Mets au pluriel : un chou, un trou, un pneu » → R « des choux, des trous, des pneus ».\n[Inclusion handicap] Auto-correction bienveillante guidée avec le mémo visuel.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment écrit-on « un pneu » et « un feu » au pluriel ?',
        reponseAttendue: 'Des pneus (exception en -s) et des feux (règle générale en -x).',
        indicePedagogique: 'Retiens les 3 exceptions en « eu » qui prennent un s : pneu, bleu, lieu (le poisson).',
        difficulte: 'Fondamental',
      },
      {
        question: 'Cite les 7 noms en « ou » qui prennent un « x » au pluriel.',
        reponseAttendue: 'Bijou, caillou, chou, genou, hibou, joujou, pou.',
        indicePedagogique: 'Aide-toi de la petite histoire : « Viens sur mes genoux avec tes joujoux… ».',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Dans la dictée, pourquoi écrit-on « des lieus » avec un « s » ?',
        reponseAttendue: 'Parce qu’il s’agit du poisson (le lieu), qui fait partie des exceptions en « eu » prenant « s » (contrairement à « des lieux » = endroits).',
        indicePedagogique: 'Relis la phrase : « Le grand-père est un pêcheur avisé… ».',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'En règle générale : -eu → -eux (sauf pneus, bleus, lieus poissons) ; -ou → -ous (sauf 7 noms en -oux).',
      traceEcriteEleve: '-eu + x (sauf pneus, bleus, lieus) | -ou + s (sauf bijoux, cailloux, choux, genoux, hiboux, joujoux, poux).',
      motsCles: ['Pluriel -eu', 'Pluriel -ou', 'Exceptions', 'Dictée', 'Orthographe'],
      prolongement: 'Rédiger deux phrases intégrant chacune une exception en -eus et une exception en -oux.',
    },
  },

  // FICHE 9
  {
    id: 'cm1-s9-fiche-09',
    nom: 'Fiche 9 · J’utilise les mots nouveaux — Texte n° 1',
    sousLabel: 'CM1 Semaine 9 · Vocabulaire en contexte : s’apprêtent, les dons, sollicite, a été meublé par (CB1 + CB3)',
    collection: 'cm1_s9',
    ficheNumero: 9,
    disciplineSpecifiqueId: 'modele-fr-utilise-mots-nouveaux',
    origineModele: 'CM1 · Semaine 9 · Fiche 9',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Français',
    matiere: 'Français',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '45 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 9) : acquisition sémantique, épellation, dramatisation, fixation et transfert des 4 expressions du texte n° 1.',
    competenceDeBaseModele:
      'CB1 & CB3 : Mobiliser les ressources de la langue pour exprimer oralement ses pensées et produire à l’écrit des textes significatifs d’au moins dix phrases.',
    competenceViseeModele:
      'Comprendre et utiliser à bon escient les expressions « s’apprêtent », « les dons », « sollicite » et « a été meublé par » dans des situations de communication.',
    titreSuggere: 'Texte n° 1 : s’apprêtent ; les dons ; sollicite ; a été meublé par',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Expliquer et épeler les expressions nouvelles issues du texte n° 1.',
      'Employer chaque expression dans une phrase personnelle et un court texte cohérent.',
    ],
    prerequis: [
      'Réemployer le vocabulaire de la semaine précédente (capital, livraisons, procuré, gagner sa vie).',
    ],
    materielSuggere: [
      'Mon livre de français CM1 (guide du maître p. 125-126, manuel p. 91)',
      'Texte support, ardoise, craie, chiffon',
      'Cartes-mots imagées, étiquettes mobiles et phrases à trous (inclusion handicap)',
    ],
    introduction: {
      accroche: 'Chant thématique collectif puis texte à trous sur ardoise avec les mots déjà connus.',
      miseEnSituation: 'Relecture du texte n° 1 pour dégager les 4 expressions nouvelles.',
      consigneDepart: 'Repérez dans le texte ce que font élèves, directeur et partenaires pour préparer la fête.',
    },
    includeManipulable: false,
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant thématique & mise en disponibilité du groupe',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant joyeux en lien avec notre thème allons-nous chanter pour commencer ?\nQ2 : Qui veut battre la mesure avec moi ?\n• Lance le chant, bat la mesure et encourage chacun à participer.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant choisi avec la classe).\nR2 : Un élève marque le rythme ; toute la classe chante avec entrain.',
        indicateursInclusifs:
          '• Indicateur pédagogique : adhésion vocale et calme avant l’étude · Contrôle Q/R : Q « Ce chant prépare à travailler sur quel texte ? » → R « Texte n° 1 : La fête de fin d’année scolaire ».\n[Inclusion handicap] Auditif/TSA : gestes visuels de direction face classe ; Moteur : posture assise autorisée.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, craie, chiffon, texte support & entraide',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez-moi votre ardoise, votre craie, votre chiffon et le texte n° 1 (page 91).\nQ2 : Qui n’a pas son matériel complet et avec qui peut-il le partager ?',
        activitesEleves:
          'R1 : Je montre mon ardoise, ma craie, mon chiffon et mon manuel ouvert.\nR2 : Je signale ce qui me manque et je partage avec mon voisin de table.',
        indicateursInclusifs:
          '• Indicateur pédagogique : contrôle rapide et partage solidaire · Contrôle Q/R : Q « Chacun voit-il bien les mots du texte n° 1 ? » → R « Oui, sur le manuel ou la fiche agrandie ».\n[Inclusion handicap] Visuel/Moteur/DYS : fournir le texte support agrandi avec les 4 expressions cibles surlignées.',
      },
      {
        etape: 'Activation des prérequis',
        sousTitreInvariable: 'Réinvestissement lexical sur ardoise à partir des mots précédents',
        duree: '5 min',
        activitesMaitre:
          'Consigne : Complétez ces phrases sur l’ardoise avec les expressions déjà étudiées : « gagner ma vie autrement », « je me suis procuré », « mon capital », « les livraisons » :\n1) Le … de cette entreprise est très élevé.\n2) C’est ce qui permet de faire des … à domicile.\n3) Avec mes économies, … deux poules et un coq pour mon projet d’élevage.\n4) Tu peux … en faisant le petit élevage.\nQ1 : Quel mot convient au n° 1 et au n° 2 ?\nQ2 : Que signifie « se procurer quelque chose » dans la phrase 3 ?',
        activitesEleves:
          '• Écrit sur l’ardoise : 1) capital ; 2) livraisons ; 3) je me suis procuré ; 4) gagner ta vie.\nR1 : « capital » au n° 1 (l’argent de départ) et « livraisons » au n° 2 (apporter les marchandises chez le client).\nR2 : Cela signifie acheter, obtenir ce dont on a besoin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : réemploi exact des 4 mots de la semaine précédente · Contrôle Q/R : Q « Par quel mot simple peut-on remplacer capital ? » → R « Le fonds ou l’argent de départ ».\n[Inclusion handicap] DYS/Moteur : numéroter 1 à 4 et ne faire copier que le mot manquant sur l’ardoise.',
      },
      {
        etape: 'Imprégnation (Mise en situation)',
        sousTitreInvariable: 'Lecture du texte support, compréhension & dégagement des expressions cibles',
        duree: '6 min',
        activitesMaitre:
          '• Lit le texte n° 1 de façon expressive puis le fait relire par 2 élèves.\nQ1 : Que font les élèves et les enseignants avant de partir pour les vacances ?\nQ2 : Avec quel argent ont-ils pu organiser la fête ?\nQ3 : L’école a-t-elle organisé la fête sans informer l’inspecteur ? Vrai ou faux ? Justifie par le texte.\nQ4 : Lisez le passage qui précise les activités inscrites au programme.\n• Dégage au tableau les 4 expressions : « s’apprêtent », « les dons », « sollicite », « a été meublé par » et annonce les objectifs.',
        activitesEleves:
          '• Écoute puis lit des passages du texte.\nR1 : Ils « s’apprêtent » à partir en vacances.\nR2 : Grâce aux recettes du jardin et aux « dons » collectés.\nR3 : Faux : le directeur « sollicite » une autorisation auprès de l’inspecteur.\nR4 : « Le programme a été meublé par une kermesse, un pique-nique et divers jeux dotés de prix. »',
        indicateursInclusifs:
          '• Indicateur pédagogique : repérage précis des 4 expressions en contexte · Contrôle Q/R : Q « Qui le directeur sollicite-t-il ? » → R « L’inspecteur, pour avoir l’autorisation ».\n[Inclusion handicap] Auditif/Visuel/DYS : afficher les 4 expressions en grand format contrasté et numéroter les lignes du texte.',
      },
      {
        etape: 'Étude, Analyse et découverte',
        sousTitreInvariable: 'Élévation du sens par dramatisation, objets, exemples & famille de mots',
        duree: '10 min',
        activitesMaitre:
          '• Fait relever, lire, épeler sur ardoise et expliquer chaque expression par mimes et exemples :\nQ1 : Que veut dire « s’apprêtent » ? Peut-on aussi « apprêter » un repas ou une salle ?\nQ2 : Que signifie « les dons collectés » et quels mots sont de la même famille que « don » ?\nQ3 : Que fait quelqu’un qui « sollicite » une permission ou une aide ?\nQ4 : Que signifie « a été meublé par » dans un programme (et quel est son autre sens dans une maison) ?\n• Fait noter les explications et exemples au cahier.',
        activitesEleves:
          '• Lit, épelle chaque mot sur l’ardoise et participe aux mimes.\nR1 : « S’apprêtent » = se préparent (ex. : Les élèves s’apprêtent pour le défilé ; apprêter un repas = le préparer).\nR2 : Ce que les gens ont offert gratuitement (un don de bâtiment scolaire) ; famille de don : donner, donneur, donateur, donation.\nR3 : Il demande poliment, avec respect, une autorisation ou une aide (ex. : Ika sollicite une permission).\nR4 : « A été meublé par » = a comporté, a été composé de (La conférence a été meublée par un exposé suivi de débats ; sens concret : meubler un salon avec des chaises et tables).',
        indicateursInclusifs:
          '• Indicateur pédagogique : compréhension des deux sens (figuré/concret) et épellation juste · Contrôle Q/R : Q « Donne deux mots de la famille de don » → R « donner, donateur (ou donneur, donation) ».\n[Inclusion handicap] Auditif/TSA/DYS : mimer « s’apprêter » et « solliciter poliment » ; segmenter l’épellation syllabe par syllabe.',
      },
      {
        etape: 'Fixation',
        sousTitreInvariable: 'Production de phrases orales et écrites & recherche de synonymes/contraires',
        duree: '7 min',
        activitesMaitre:
          'Consigne : Employez chacune des quatre expressions dans une phrase personnelle correcte, puis cherchez un synonyme ou un contraire.\nQ1 : Quel est un synonyme de « s’apprêter » et un contraire de « don » (offrir gratuitement) ?\nQ2 : Quelle phrase peut-on construire avec « sollicite » et avec « a été meublé par » ?',
        activitesEleves:
          '• Propose et corrige ses phrases :\n- Les élèves s’apprêtent pour le défilé à l’école.\n- À cette rentrée, notre école a eu un don de bâtiment scolaire.\n- Ika sollicite une permission pour se rendre au stade.\n- La conférence a été meublée par un exposé suivi de débats.\nR1 : Synonyme de s’apprêter = se préparer ; contraire de don = achat / vente.\nR2 : Phrases validées au tableau et lues à haute voix.',
        indicateursInclusifs:
          '• Indicateur pédagogique : production de phrases syntaxiquement justes · Contrôle Q/R : Q « Remplace s’apprêtent par un synonyme dans : Les joueurs s’apprêtent » → R « Les joueurs se préparent ».\n[Inclusion handicap] DYS/Moteur : préparer les phrases à l’oral en binôme puis n’en copier qu’une ou deux choisies.',
      },
      {
        etape: 'Transfert',
        sousTitreInvariable: 'Complétion en contexte & courte production écrite réutilisant les mots',
        duree: '8 min',
        activitesMaitre:
          'Consigne 1 : Complétez ces phrases avec : « s’apprêtent », « les dons », « sollicite(nt) », « a été meublé(e) » :\n1) Les élèves …1… une permission pour aller à la plage.\n2) Les joueurs …2… pour le début du championnat.\n3) La cérémonie de baptême …3… par le message du doyen et la sortie du bébé.\n4) Pour la construction du bâtiment scolaire, notre école a obtenu des …4… des partenaires.\nQ1 : Pourquoi écrit-on « sollicitent » (-ent) au n° 1 et « a été meublée » (-ée) au n° 3 ?\nConsigne 2 : Rédigez un petit texte de 3 à 4 phrases racontant une fête en employant ces mots.',
        activitesEleves:
          '• Complète sur ardoise : 1) sollicitent · 2) s’apprêtent · 3) a été meublée · 4) dons.\nR1 : Au n° 1, le sujet « Les élèves » est pluriel (-ent) ; au n° 3, le sujet « La cérémonie » est féminin singulier après être (-ée).\n• Écrit un court paragraphe cohérent intégrant au moins 3 expressions nouvelles.',
        indicateursInclusifs:
          '• Indicateur pédagogique : réemploi exact en contexte + vigilance sur l’accord · Contrôle Q/R : Q « Quel mot complète la phrase 4 avec partenaires ? » → R « des dons ».\n[Inclusion handicap] DYS/TSA : fournir la fiche numérotée 1-4 avec étiquettes mobiles à placer avant la courte rédaction.',
      },
      {
        etape: 'Bilan',
        sousTitreInvariable: 'Rappel des expressions maîtrisées & transfert en rédaction quotidienne',
        duree: '4 min',
        activitesMaitre:
          'Q1 : Quelles quatre expressions nouvelles avons-nous apprises et expliquées aujourd’hui ?\nQ2 : À quoi vous serviront-elles quand vous parlerez ou rédigerez un texte sur une fête ou une cérémonie ?',
        activitesEleves:
          'R1 : s’apprêtent (se préparent), les dons (ce qui est offert), sollicite (demande poliment) et a été meublé par (a comporté).\nR2 : Elles rendront mes phrases et mes rédactions plus riches et plus précises.',
        indicateursInclusifs:
          '• Indicateur pédagogique : récitation/réemploi sans erreur par 3 ou 4 élèves · Contrôle Q/R : Q « Comment dire poliment Je demande la permission au directeur ? » → R « Je sollicite la permission auprès du directeur ».\n[Inclusion handicap] Compléter le carnet de vocabulaire visuel avec mots-clés et pictogrammes.',
      },
    ],
    questionsReponses: [
      {
        question: 'Que signifie l’expression « sollicite » dans « Le directeur sollicite une autorisation » ?',
        reponseAttendue: 'Il demande avec respect une autorisation.',
        indicePedagogique: 'Pense à la manière polie dont le directeur écrit à l’inspecteur.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Cite trois mots de la même famille que « don ».',
        reponseAttendue: 'Donner, donneur, donateur, donation.',
        indicePedagogique: 'Cherche le radical « don- ».',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Complète au bon accord : « La cérémonie de baptême … par le message du doyen. »',
        reponseAttendue: '« a été meublée » (accord féminin singulier avec « la cérémonie »).',
        indicePedagogique: 'Le sujet « la cérémonie » est féminin singulier après l’auxiliaire être.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle: 'Enrichir son vocabulaire permet de comprendre les nuances de sens (ex. meubler un programme vs meubler une salle) et d’écrire avec précision.',
      traceEcriteEleve: 'S’apprêter = se préparer · Les dons = ce qui est offert (donner, donateur) · Solliciter = demander avec respect · Être meublé par = comporter.',
      motsCles: ['S’apprêtent', 'Dons', 'Sollicite', 'Meublé par', 'Famille de mots'],
      prolongement: 'Écrire un court paragraphe de 4 phrases sur une fête au village en utilisant au moins 3 mots nouveaux.',
    },
  },
];
