import { DEFAULT_HANDICAP_PROFILES } from './inclusion';
import { CM1_S9_MATH_SCHEMATISATIONS } from './math-schematisation';
import { ModeleFicheAPC } from './types';

export const CM1_S9_MATH_TEMPLATES: ModeleFicheAPC[] = [
  // FICHE 10 — MATHÉMATIQUES : Consolidation
  {
    id: 'cm1-s9-fiche-10',
    nom: 'Fiche 10 · Mathématiques — Consolidation (Problèmes & Calcul mental)',
    sousLabel: 'CM1 Semaine 9 · Consolidation CB1 + CB2 : ÷5, ÷50 & 5 compétences de résolution',
    collection: 'cm1_s9',
    ficheNumero: 10,
    disciplineSpecifiqueId: 'modele-math-consolidation',
    origineModele: 'CM1 · Semaine 9 · Fiche 10',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '70 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 10) : consolidation CB1 & CB2 autour du thème « Les métiers et les usines » — calcul mental (÷5, ÷50) et les 5 étapes progressives de résolution de problèmes, avec schémas annotés et inclusion handicap.',
    competenceDeBaseModele:
      'CB1 + CB2 (Mathématiques CM1) — Mobiliser nombres, fractions, conversions de masses, 4 opérations, triangles rectangles à l’échelle et résolution graduée de problèmes concrets.',
    competenceViseeModele:
      'Automatiser la division par 5 et par 50, analyser un problème, poser la question pertinente, choisir l’opération, composer un énoncé et résoudre des problèmes complets.',
    titreSuggere: 'Consolidation : calcul mental (÷5, ÷50) et résolution graduée de problèmes',
    themeSuggere: 'Les métiers et les usines',
    objectifsSpecifiques: [
      'Diviser mentalement un nombre à 2 chiffres par 5 (÷10 × 2) et à 3 chiffres par 50 (÷100 × 2).',
      'Analyser les données utiles, formuler la question qui convient et identifier la bonne opération.',
      'Remettre en ordre un énoncé et résoudre des problèmes complets (masses, fractions, triangles à l’échelle).',
    ],
    prerequis: [
      'Connaître les tables de multiplication par 4 et par 5.',
      'Maîtriser les unités de masse (g, dag, hg, kg) et le tracé d’un triangle rectangle à l’équerre.',
    ],
    materielSuggere: [
      'Mon livre de mathématiques CM1 (guide du maître p. 91-92, manuel de l’élève p. 77-78)',
      'Ardoise, craie, chiffon, bâtonnets, cailloux, exercices oraux et écrits',
      'Tableau de conversion g/dag/hg/kg en couleurs, règle antidérapante, équerre à large poignée et fiches contrastées (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Chant court collectif puis réactivation des tables par 4 et par 5 avant de relever les défis de l’usine de jouets, de la pâtisserie et du champ agricole.',
      miseEnSituation:
        'À l’usine, pour distribuer 40 jouets entre 5 ateliers ou partager 300 cadeaux en lots de 50, comment calculer rapidement et vérifier par un schéma ?',
      consigneDepart:
        'Travaillons successivement le calcul mental sur ardoise puis les 5 compétences du bon résolveur de problèmes.',
    },
    includeManipulable: true,
    manipulableType: 'proportionnalite',
    customIllustration: {
      titre: 'Schémas de consolidation — Partages (÷5), fraction 4/5 & triangle rectangle (75 m)',
      legende: 'Représentations visuelles des problèmes de consolidation : barre 40 jouets ÷ 5, barre 150 invités (4/5 = 120) et triangle rectangle à l’échelle 1/1000.',
      typeSchema: 'geometrie',
      svgCode: `<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="250" fill="#F8FAFC" rx="8"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">Consolidation CM1 S9 : schémas en barres &amp; figure géométrique à l’échelle</text>
  <rect x="20" y="42" width="290" height="86" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="32" y="60" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">Calcul mental : 40 jouets ÷ 5 = 8</text>
  <rect x="32" y="72" width="52" height="28" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.2"/>
  <rect x="84" y="72" width="52" height="28" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.2"/>
  <rect x="136" y="72" width="52" height="28" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.2"/>
  <rect x="188" y="72" width="52" height="28" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.2"/>
  <rect x="240" y="72" width="52" height="28" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.2"/>
  <text x="58" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">8</text>
  <text x="110" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">8</text>
  <text x="162" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">8</text>
  <text x="214" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">8</text>
  <text x="266" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">8</text>
  <text x="162" y="116" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Règle : (40 ÷ 10) × 2 = 4 × 2 = 8</text>

  <rect x="20" y="140" width="290" height="92" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="32" y="158" font-family="sans-serif" font-size="11" font-weight="700" fill="#059669">Fraction : 4/5 de 150 invités</text>
  <rect x="32" y="170" width="52" height="28" fill="#D1FAE5" stroke="#059669" stroke-width="1.2"/>
  <rect x="84" y="170" width="52" height="28" fill="#D1FAE5" stroke="#059669" stroke-width="1.2"/>
  <rect x="136" y="170" width="52" height="28" fill="#D1FAE5" stroke="#059669" stroke-width="1.2"/>
  <rect x="188" y="170" width="52" height="28" fill="#D1FAE5" stroke="#059669" stroke-width="1.2"/>
  <rect x="240" y="170" width="52" height="28" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2"/>
  <text x="58" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">30</text>
  <text x="110" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">30</text>
  <text x="162" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">30</text>
  <text x="214" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">30</text>
  <text x="266" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400E">30</text>
  <text x="136" y="216" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#059669">4/5 présents = 120</text>
  <text x="266" y="216" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#D97706">1/5 = 30</text>

  <rect x="330" y="42" width="290" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="342" y="60" font-family="sans-serif" font-size="11" font-weight="700" fill="#D97706">Analyse : Aire de jeu ABC (1 cm = 10 m)</text>
  <polygon points="365,198 365,88 565,198" fill="#FEF3C7" fill-opacity="0.55" stroke="#0F172A" stroke-width="2"/>
  <rect x="365" y="184" width="14" height="14" fill="none" stroke="#DC2626" stroke-width="1.6"/>
  <text x="352" y="202" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">A</text>
  <text x="352" y="88" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">C</text>
  <text x="572" y="202" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">B</text>
  <text x="380" y="146" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#0284C7">AC = 75 m → 7,5 cm</text>
  <text x="465" y="218" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Angle droit en A · Échelle 1/1000</text>
</svg>`,
      annotations: [
        {
          x: 26,
          y: 35,
          label: 'Partage en 5 parts égales',
          detail: 'Diviser par 5 revient à prendre le dixième puis multiplier par 2 : 40 ÷ 10 × 2 = 8.',
        },
        {
          x: 26,
          y: 76,
          label: 'Fraction 4/5 de 150',
          detail: 'Chaque cinquième vaut 30 ; 4 parts représentent 120 invités présents.',
        },
        {
          x: 74,
          y: 56,
          label: 'Échelle 1 cm pour 10 m',
          detail: 'Un côté de 75 m se représente par un segment de 7,5 cm sur le cahier.',
        },
      ],
    },
    customSchematisationMath: CM1_S9_MATH_SCHEMATISATIONS['fiche-10'],
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Quel chant rythmé sur le travail et les métiers allons-nous entonner pour bien démarrer ?\nQ2 : Qui veut donner le signal de départ avec moi ?\n• Lance le chant en lien avec « Les métiers et les usines » et bat la mesure face classe.',
        activitesEleves:
          'R1 : Nous chantons « … » (chant connu choisi avec la classe).\nR2 : Un élève volontaire frappe le rythme ; tous se lèvent (ou restent assis selon besoin) et chantent avec entrain.',
        indicateursInclusifs:
          '• Indicateur pédagogique : climat serein, rythme collectif tenu · Contrôle Q/R : Q « Quel thème évoque notre chant ? » → R « Les métiers et le travail bien fait ».\n[Inclusion handicap] Auditif/TSA : signal visuel d’ouverture et fermeture ; Moteur : posture assise ou appui pupitre autorisés.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, bâtonnets & partage coopératif',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez vos ardoises, craies, chiffons, règle, équerre et bâtonnets/cailloux.\nQ2 : Qui n’a pas son matériel complet ? Avec quel camarade peut-il le partager ?',
        activitesEleves:
          'R1 : Je présente mon ardoise, ma règle, mon équerre et mon paquet de bâtonnets.\nR2 : Je partage mes bâtonnets et mon manuel (p. 77-78) avec mon voisin de table.',
        indicateursInclusifs:
          '• Indicateur pédagogique : 100 % des tables équipées · Contrôle Q/R : Q « Où posons-nous les bâtonnets avant l’éveil ? » → R « Sur le coin gauche de la table ».\n[Inclusion handicap] Visuel/Moteur : règle antidérapante contrastée, équerre à large poignée et fiche A4 grand format.',
      },
      {
        etape: 'Éveil mathématique',
        sousTitreInvariable: 'Réactivation des tables de multiplication par 4 et par 5',
        duree: '4 min',
        activitesMaitre:
          '• Fait compter par sauts de 4 jusqu’à 40 puis de 5 jusqu’à 50.\nQ1 : Combien font 4 × 7 et 4 × 9 ?\nQ2 : Combien font 5 × 8 et quel lien remarques-tu entre ÷5 et ×5 ?',
        activitesEleves:
          '• Compte à voix haute en frappant dans les mains aux multiples de 10.\nR1 : 4 × 7 = 28 ; 4 × 9 = 36.\nR2 : 5 × 8 = 40 ; si 5 × 8 = 40, alors 40 ÷ 5 = 8.',
        indicateursInclusifs:
          '• Indicateur pédagogique : réponses exactes et rapides sur les tables ×4 et ×5 · Contrôle Q/R : Q « Quel est le double de 5 × 4 ? » → R « 40 ».\n[Inclusion handicap] Dyscalculie/Auditif : bande numérique des multiples (0-4-8… / 0-5-10…) affichée au tableau.',
      },
      {
        etape: 'Calcul mental',
        sousTitreInvariable: 'Diviser par 5 (2 chiffres) et par 50 (3 chiffres)',
        duree: '6 min',
        activitesMaitre:
          '• Situation de l’usine : « On distribue 40 jouets entre 5 ateliers (puis 30 cadeaux entre 5 enfants) ; puis on répartit 300 cadeaux par paquets de 50 (puis 150 sachets par 50). »\n[Schématisation — Consolidation ÷5 / ÷50] :\n  40 jouets = | 8 | 8 | 8 | 8 | 8 |  →  (40 ÷ 10) × 2 = 4 × 2 = 8\n  300 cadeaux ÷ 50  →  (300 ÷ 100) × 2 = 3 × 2 = 6 paquets\nQ1 : Combien de jouets reçoit chaque atelier pour 40 ÷ 5 ? Et pour 300 ÷ 50 ?\nQ2 : Quelle règle mentale fonctionne à tous les coups pour ÷5 et ÷50 ?',
        activitesEleves:
          '• Manipule rapidement 5 groupements sur ardoise et lève au signal (PLM) :\nR1 : 40 ÷ 5 = 8 jouets ; 30 ÷ 5 = 6 cadeaux ; 300 ÷ 50 = 6 paquets ; 150 ÷ 50 = 3 paquets.\nR2 : Pour ÷5, je divise par 10 puis je multiplie par 2 ; pour ÷50, je divise par 100 puis je multiplie par 2.',
        indicateursInclusifs:
          '• Indicateur pédagogique : automatisme PLM réussi sans calcul posé · Contrôle Q/R : Q « Comment calculer 250 ÷ 50 de tête ? » → R « 250 ÷ 100 = 2,5 × 2 = 5 (ou 5 × 50 = 250) ».\n[Inclusion handicap] DYS/Dyscalculie : schéma en 5 barres de 8 maintenu au tableau et délai visuel majoré (+5 s).',
      },
      {
        etape: 'Résolution de problème – 1. Je sais analyser un problème',
        sousTitreInvariable: 'Identification des données géométriques & conversion à l’échelle',
        duree: '8 min',
        activitesMaitre:
          '• Énoncé (p. 77) : L’aire de jeu a la forme d’un triangle rectangle ABC (angle droit en A) dont un côté mesure 75 m. Représenter à l’échelle 1 cm pour 10 m.\n[Schématisation — Manipulation à l’échelle (1/1000)] :\n  C (75 m → 7,5 cm)\n  |\\ \n  | \\  ← angle droit en A vérifié à l’équerre\n  A__\\B   Échelle : 10 m ↦ 1 cm  donc  75 m ÷ 10 = 7,5 cm\nQ1 : Quelles sont les données utiles et où est placé l’angle droit ?\nQ2 : Quelle longueur réelle sur ton cahier correspond à 75 m à l’échelle 1 cm pour 10 m ?',
        activitesEleves:
          '• Entoure « triangle rectangle ABC », « angle droit en A », « 75 m », « 1 cm pour 10 m » et manipule l’équerre.\nR1 : C’est un triangle rectangle ABC avec l’angle droit au sommet A.\nR2 : 75 ÷ 10 = 7,5 cm ; trace le côté [AC] = 7,5 cm et place l’équerre en A.',
        indicateursInclusifs:
          '• Indicateur pédagogique : extraction exacte des grandeurs et conversion à l’échelle · Contrôle Q/R : Q « Quelle longueur tracerait-on pour 50 m à la même échelle ? » → R « 5 cm ».\n[Inclusion handicap] Visuel/Dyspraxie : coder « 75 m » et « 1 cm = 10 m » en couleur, fournir gabarit d’angle droit ou binôme traceur.',
      },
      {
        etape: 'Résolution de problème – 2. Je sais poser la question qui convient',
        sousTitreInvariable: 'Formulation de la question pertinente & calcul de fraction (4/5)',
        duree: '8 min',
        activitesMaitre:
          '• Énoncé : Pour la fête de l’usine, 150 personnes sont invitées ; les 4/5 sont présentes.\n[Schématisation — Manipulation en barres (150 invités)] :\n  Total = 150 invités = | 30 | 30 | 30 | 30 | 30 |  (1/5 = 150 ÷ 5 = 30)\n                        [──── 4/5 présents = 120 ────][1/5 = 30]\nQ1 : Quelle question mathématique pertinente peux-tu formuler à partir de cet énoncé ?\nQ2 : En t’appuyant sur la barre en 5 parts, combien d’invités sont présents ?',
        activitesEleves:
          '• Manipule la bande partagée en 5 cases égales et écrit 30 dans chaque case.\nR1 : « Combien d’invités sont présents à la fête ? » (ou « Combien d’invités sont absents ? »).\nR2 : 1/5 = 150 ÷ 5 = 30 → 4/5 = 30 × 4 = 120 invités présents.',
        indicateursInclusifs:
          '• Indicateur pédagogique : question cohérente avec les données chiffrées · Contrôle Q/R : Q « Combien d’invités manquent ? » → R « 1/5 = 30 invités ».\n[Inclusion handicap] TSA/DYS : proposer 2 étiquettes-questions à comparer (1 pertinente / 1 hors-sujet) et s’appuyer sur la bande de 5 cases.',
      },
      {
        etape: 'Résolution de problème – 3. Je sais trouver l’opération qui convient',
        sousTitreInvariable: 'Choix de l’opération & conversions de masses en grammes',
        duree: '9 min',
        activitesMaitre:
          '• Énoncé du gâteau : 50 dag de lait, 75 g d’œuf, 850 g de chocolat, 80 g de sucre, 200 g de farine et 20 hg de crème.\n[Schématisation — Manipulation tableau de masses → tout en g] :\n  |  kg  |  hg  | dag |   g   |\n  |      |   5  |  0  |   0   |  (50 dag = 500 g)\n  |   2  |   0  |  0  |   0   |  (20 hg  = 2 000 g)\n  + 75 g + 850 g + 80 g + 200 g  =  3 705 g\nQ1 : Pourquoi faut-il choisir la suite d’opérations b du manuel avant d’additionner ?\nQ2 : Quelle masse totale en grammes obtient-on après conversion ?',
        activitesEleves:
          '• Place 50 dag et 20 hg dans son tableau de conversion manipulable avant de poser la somme.\nR1 : On choisit la proposition b car il faut d’abord tout convertir dans la même unité (en g) puis additionner.\nR2 : 500 + 2 000 + 75 + 850 + 80 + 200 = 3 705 g.',
        indicateursInclusifs:
          '• Indicateur pédagogique : aucune addition effectuée sans conversion préalable · Contrôle Q/R : Q « Combien de grammes valent 20 hg ? » → R « 2 000 g ».\n[Inclusion handicap] Dyscalculie/DYS : tableau kg | hg | dag | g plastifié en couleurs contrastées avec 1 chiffre par colonne.',
      },
      {
        etape: 'Résolution de problème – 4. Je sais composer un problème',
        sousTitreInvariable: 'Remise en ordre logique d’étiquettes-énoncé & calcul multiplicatif',
        duree: '8 min',
        activitesMaitre:
          '• Énoncé mélangé (étiquettes a, b, c, d, e) : Yao part avec 70 billes, gagne 20 billes de plus ; chaque bille pèse 20 g.\n[Schématisation — Manipulation d’étiquettes & schéma multiplicatif] :\n  Ordre : [c : départ 70] → [e : gain +20] → [a : 1 bille = 20 g] → [b : question] → [d]\n  Total billes = (70 + 20) = 90 billes  ──× 20 g──▶  1 800 g (1 kg 800 g)\nQ1 : Dans quel ordre logique manipules-tu les étiquettes pour obtenir un énoncé compréhensible ?\nQ2 : Quelle opération donnes-tu pour trouver la masse totale des billes au retour ?',
        activitesEleves:
          '• Déplace physiquement les étiquettes cartonnées sur la table jusqu’à obtenir un récit cohérent.\nR1 : L’ordre logique est c → e → a → b → d.\nR2 : D’abord 70 + 20 = 90 billes ; puis 90 × 20 g = 1 800 g (1 kg 800 g).',
        indicateursInclusifs:
          '• Indicateur pédagogique : chronologie narrative + calcul en 2 étapes exactes · Contrôle Q/R : Q « Pourquoi ne peut-on pas commencer par la question d ? » → R « On ne connaît pas encore les données ».\n[Inclusion handicap] DYS/Moteur : manipuler de vraies étiquettes cartonnées mobiles c, e, a, b, d sans tout recopier.',
      },
      {
        etape: 'Résolution de problème – 5. Je sais résoudre un problème (a)',
        sousTitreInvariable: 'Problème de synthèse n° 1 : masses, fractions (3/5) & triangle',
        duree: '11 min',
        activitesMaitre:
          '• Problème (a) : Maman récolte 1 800 kg de haricots et 300 kg de mil ; elle vend les 3/5 du haricot. Tracer un triangle rectangle de 5 cm et 8 cm.\n[Schématisation — Barre haricots (3/5) & Triangle 5×8 cm] :\n  1 800 kg = | 360 | 360 | 360 | 360 | 360 |  → Vendus 3/5 = 1 080 kg | Reste = 720 kg\n  Triangle rectangle : côté 1 = 5 cm ⊥ côté 2 = 8 cm (mesure des 2 angles aigus ≈ 58° et 32°)\nQ1 : Combien font 1 800 kg et 300 kg en hg puis en g ?\nQ2 : Quelle masse de haricots est vendue (3/5) et quelle masse reste-t-il ?\nQ3 : Comment traces-tu le triangle 5 cm × 8 cm et que vaut la somme de ses deux angles aigus ?',
        activitesEleves:
          '• Dessine la barre en 5 parts de 360 kg, effectue les conversions et trace le triangle à l’équerre.\nR1 : Haricots = 18 000 hg = 1 800 000 g ; mil = 3 000 hg = 300 000 g.\nR2 : (1 800 ÷ 5) × 3 = 360 × 3 = 1 080 kg vendus ; il reste 720 kg.\nR3 : Trace à l’équerre 5 cm et 8 cm, relie l’hypoténuse et mesure ≈ 58° + 32° = 90°.',
        indicateursInclusifs:
          '• Indicateur pédagogique : présentation Données / Solution / Phrase-réponse soignée · Contrôle Q/R : Q « Comment vérifier 1 080 kg + 720 kg ? » → R « 1 080 + 720 = 1 800 kg ».\n[Inclusion handicap] Visuel/Moteur : rapporteur contrasté, calculatrice de vérification sur grands nombres autorisée.',
      },
      {
        etape: 'Résolution de problème – 5. Je sais résoudre un problème (b)',
        sousTitreInvariable: 'Problème de synthèse n° 2 : partage 3/7 & 2/7, récolte soja & échelle',
        duree: '11 min',
        activitesMaitre:
          '• Problème (b) : Champ de 6 958 m² partagé (3/7 aîné ; 2/7 au 2e ; 2/7 au 3e) ; rendement soja 23 dag/m² sur la part de l’aîné ; triangle 70 m × 85,2 m à l’échelle 1/1000.\n[Schématisation — Partage en 7 parts & Plan 1/1000] :\n  6 958 m² = | 994 | 994 | 994 | 994 | 994 | 994 | 994 |  (1/7 = 6 958 ÷ 7 = 994 m²)\n             [──── Aîné 3/7 = 2 982 ────][── 2e = 1 988 ──][── 3e = 1 988 ──]\n  Plan 1 cm/10 m : 70 m → 7 cm  ⊥  85,2 m → 8,52 cm (≈ 8,5 cm)\nQ1 : Quelle aire reçoit chacun des trois enfants ?\nQ2 : Quelle masse de soja l’aîné récolte-t-il en dag puis en g ?\nQ3 : Quelles dimensions en cm traces-tu pour le triangle à l’échelle 1 cm pour 10 m ?',
        activitesEleves:
          '• Schématise la barre de 7 parts égales, calcule étape par étape puis trace le plan à l’échelle.\nR1 : 1/7 = 994 m² → Aîné (3/7) = 2 982 m² ; 2e et 3e (2/7 chacun) = 1 988 m² chacun.\nR2 : 2 982 × 23 = 68 586 dag = 685 860 g.\nR3 : Côtés de l’angle droit 7 cm et 8,5 cm à l’équerre ; angles aigus ≈ 51° et 39°.',
        indicateursInclusifs:
          '• Indicateur pédagogique : démarche multi-étapes complète + unité à chaque ligne · Contrôle Q/R : Q « 2 982 + 1 988 + 1 988 redonne-t-il le champ entier ? » → R « Oui, 6 958 m² ».\n[Inclusion handicap] DYS/TDAH : découper en 3 fiches-étapes (1. Aires ; 2. Soja ; 3. Tracé) et réponse orale acceptée pour les mesures d’angles.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment diviser mentalement 300 par 50 sans poser l’opération ?',
        reponseAttendue: 'On divise 300 par 100 (= 3) puis on multiplie par 2 : 3 × 2 = 6.',
        indicePedagogique: '50 est la moitié de 100 : il y a donc 2 fois 50 dans chaque centaine.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Pourquoi faut-il convertir 50 dag et 20 hg avant d’additionner les ingrédients du gâteau ?',
        reponseAttendue: 'On ne peut additionner que des masses exprimées dans la même unité : 50 dag = 500 g et 20 hg = 2 000 g, d’où 3 705 g.',
        indicePedagogique: 'Place chaque nombre dans le tableau kg | hg | dag | g jusqu’à la colonne g.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Dans le champ de 6 958 m², comment trouver rapidement la part de 3/7 puis celles de 2/7 ?',
        reponseAttendue: 'On calcule d’abord 1/7 (= 6 958 ÷ 7 = 994 m²), puis on multiplie 994 par 3 (= 2 982 m²) et par 2 (= 1 988 m²).',
        indicePedagogique: 'Vérifie à la fin : 2 982 + 1 988 + 1 988 = 6 958 m².',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle:
        'Pour diviser par 5 ou 50, on passe par ÷10 × 2 ou ÷100 × 2 ; pour réussir un problème complexe, on trie les données, on convertit dans la même unité et on s’appuie sur un schéma.',
      traceEcriteEleve:
        '÷5 = ÷10 × 2 · ÷50 = ÷100 × 2. Je convertis toujours dans la même unité avant de calculer et je trace à l’échelle (1 cm pour 10 m).',
      motsCles: ['Calcul mental ÷5 / ÷50', 'Analyse de problème', 'Conversions g/dag/hg/kg', 'Fraction d’un nombre', 'Échelle 1/1000'],
      prolongement: 'Poursuivre les exercices complémentaires du manuel page 78 à la maison ou en atelier.',
    },
  },

  // FICHE 11 — MATHÉMATIQUES : Mesurer les angles
  {
    id: 'cm1-s9-fiche-11',
    nom: 'Fiche 11 · Mathématiques — Mesurer les angles',
    sousLabel: 'CM1 Semaine 9 · Géométrie & Mesure : rapporteur, degrés (°) et types d’angles (CB3)',
    collection: 'cm1_s9',
    ficheNumero: 11,
    disciplineSpecifiqueId: 'modele-mathematiques',
    origineModele: 'CM1 · Semaine 9 · Fiche 11',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '70 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 11) : découverte et mesure des angles (aigu, droit, obtus, plat) avec le rapporteur gradué en degrés, incluant manipulation de secteurs en carton et inclusion handicap.',
    competenceDeBaseModele:
      'CB3 (Mathématiques CM1) — Résoudre des situations-problèmes géométriques de repérage, de mesure et de construction d’angles à l’aide du rapporteur et de l’équerre.',
    competenceViseeModele:
      'Identifier, comparer, mesurer au rapporteur et construire un angle donné en degrés (°).',
    titreSuggere: 'Mesurer les angles au rapporteur (degrés °)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Distinguer le sommet et les deux côtés d’un angle, et classer angle aigu (&lt; 90°), droit (90°), obtus (&gt; 90°) et plat (180°).',
      'Positionner correctement le centre et le 0° du rapporteur pour lire une mesure en degrés.',
      'Construire un angle de mesure donnée (60°, 80°, 120°) à la règle et au rapporteur.',
    ],
    prerequis: [
      'Identifier et vérifier un angle droit à l’aide d’une équerre.',
      'Tracer une demi-droite ou un segment proprement à la règle.',
    ],
    materielSuggere: [
      'Mon livre de mathématiques CM1 (guide du maître p. 119-121, manuel p. 104-106)',
      'Règle, rapporteur, équerre, ardoise, craie, chiffon',
      'Secteurs angulaires découpés dans du carton épais (supports tactiles contrastés)',
      'Rapporteur grand format à double lecture simplifiée et gabarits en relief (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Pour décorer la salle des fêtes de l’école, les élèves découpent des guirlandes en papier : comment s’assurer que deux fanions ont exactement la même ouverture ?',
      miseEnSituation:
        'Comparaison de secteurs angulaires en carton et vérification à l’équerre pour découvrir que l’ouverture d’un angle ne dépend pas de la longueur de ses côtés.',
      consigneDepart:
        'Manipulez d’abord les secteurs en carton puis observons comment le rapporteur permet de mesurer précisément en degrés (°).',
    },
    includeManipulable: true,
    manipulableType: 'geometrie_aire',
    customIllustration: {
      titre: 'Lecture d’un angle au rapporteur (70°) & classification des angles',
      legende: 'Positionnement du centre du rapporteur sur le sommet O, alignement sur 0° et lecture à 70° (angle aigu).',
      typeSchema: 'geometrie',
      svgCode: `<svg viewBox="0 0 640 245" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="245" fill="#F8FAFC" rx="8"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">Mesurer un angle au rapporteur (exemple : 70°)</text>
  <rect x="20" y="40" width="350" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <path d="M 85 185 A 120 120 0 0 1 325 185 Z" fill="#DBEAFE" fill-opacity="0.45" stroke="#0284C7" stroke-width="1.8"/>
  <path d="M 110 185 A 95 95 0 0 1 300 185" fill="none" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3 3"/>
  <circle cx="205" cy="185" r="4" fill="#DC2626"/>
  <text x="195" y="204" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">Sommet</text>
  <line x1="205" y1="185" x2="345" y2="185" stroke="#0F172A" stroke-width="2.4"/>
  <text x="330" y="176" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">0° (Côté 1)</text>
  <line x1="205" y1="185" x2="253" y2="54" stroke="#059669" stroke-width="2.6"/>
  <text x="260" y="64" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#059669">70° (Côté 2)</text>
  <path d="M 248 185 A 43 43 0 0 0 220 144" fill="none" stroke="#D97706" stroke-width="2.5"/>
  <text x="255" y="148" font-family="sans-serif" font-size="12" font-weight="700" fill="#D97706">70°</text>
  <text x="205" y="92" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">90°</text>
  <line x1="205" y1="65" x2="205" y2="76" stroke="#64748B" stroke-width="1.5"/>

  <rect x="388" y="40" width="232" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="400" y="60" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">Repères des 4 angles</text>
  <polyline points="435,96 402,96 426,74" fill="none" stroke="#0284C7" stroke-width="2"/>
  <text x="448" y="94" font-family="sans-serif" font-size="11" fill="#0F172A">Aigu : &lt; 90° (ex. 60°)</text>
  <polyline points="435,134 402,134 402,106" fill="none" stroke="#059669" stroke-width="2"/>
  <rect x="402" y="126" width="8" height="8" fill="none" stroke="#059669" stroke-width="1.2"/>
  <text x="448" y="130" font-family="sans-serif" font-size="11" fill="#0F172A">Droit : = 90°</text>
  <polyline points="442,172 414,172 396,150" fill="none" stroke="#D97706" stroke-width="2"/>
  <text x="448" y="168" font-family="sans-serif" font-size="11" fill="#0F172A">Obtus : &gt; 90° (ex. 120°)</text>
  <line x1="398" y1="204" x2="442" y2="204" stroke="#DC2626" stroke-width="2"/>
  <circle cx="420" cy="204" r="3" fill="#DC2626"/>
  <text x="448" y="208" font-family="sans-serif" font-size="11" fill="#0F172A">Plat : = 180°</text>
</svg>`,
      annotations: [
        {
          x: 32,
          y: 75,
          label: 'Centre sur le sommet',
          detail: 'Le repère central du rapporteur doit coïncider exactement avec le sommet de l’angle.',
        },
        {
          x: 52,
          y: 75,
          label: 'Zéro sur le premier côté',
          detail: 'On aligne la graduation 0° sur le côté 1 et on lit sur l’échelle qui démarre à 0.',
        },
        {
          x: 78,
          y: 48,
          label: 'Classification par rapport à 90°',
          detail: 'Inférieur à 90° = aigu ; égal à 90° = droit ; compris entre 90° et 180° = obtus.',
        },
      ],
    },
    customSchematisationMath: CM1_S9_MATH_SCHEMATISATIONS['fiche-11'],
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant joyeux sur le thème des fêtes allons-nous chanter pour ouvrir la séance ?\n• Fait entonner un chant connu, bat la mesure face aux élèves.',
        activitesEleves:
          'R : Nous chantons « … » (chant choisi avec la classe).\n• Se lève (ou reste assis selon besoin) et chante en rythme.',
        indicateursInclusifs:
          '• Indicateur pédagogique : climat serein, disponibilité collective · Contrôle Q/R : Q « Sommes-nous prêts à manipuler nos instruments ? » → R « Oui ! ».\n[Inclusion handicap] Auditif/Moteur : signaux visuels d’entrée et posture adaptée.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification des instruments de géométrie & partage',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Montrez votre règle, votre équerre et votre rapporteur.\nQ2 : Qui n’a pas de rapporteur ? Comment organisons-nous le partage en binôme ?',
        activitesEleves:
          'R1 : Voici ma règle graduée, mon équerre et mon rapporteur.\nR2 : Je partage mon rapporteur et mes secteurs en carton avec mon voisin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : chaque binôme dispose d’un rapporteur lisible · Contrôle Q/R : Q « À quoi sert le rapporteur ? » → R « À mesurer et tracer des angles en degrés ».\n[Inclusion handicap] Visuel/Dyspraxie : rapporteur grand format à graduations contrastées et secteurs en carton épais.',
      },
      {
        etape: 'Éveil mathématique',
        sousTitreInvariable: 'Suite numérique de 500 en 500 jusqu’à 10 000',
        duree: '4 min',
        activitesMaitre:
          '• Fait compter de 500 en 500 de 0 à 10 000 puis à reculons de 10 000 à 0.\nQ1 : Quel nombre vient juste après 3 500 en avançant de 500 ?\nQ2 : Et juste avant 7 000 en reculant de 500 ?',
        activitesEleves:
          '• Compte collectivement puis en relais rapide : 0, 500, 1 000, …, 10 000 et à rebours.\nR1 : 4 000.\nR2 : 6 500.',
        indicateursInclusifs:
          '• Indicateur pédagogique : enchaînement fluide sans erreur aux milliers · Contrôle Q/R : Q « Combien de pas de 500 font 2 000 ? » → R « 4 pas ».\n[Inclusion handicap] Dyscalculie : repère visuel des milliers (1 000, 2 000…) au tableau.',
      },
      {
        etape: 'Calcul mental',
        sousTitreInvariable: 'Division rapide par 5 sur ardoise',
        duree: '5 min',
        activitesMaitre:
          '• Dicte (PLM) : 90 ÷ 5 ; 60 ÷ 5 ; 50 ÷ 5 ; 80 ÷ 5.\nQ1 : Que trouvez-vous pour 90 ÷ 5 et 80 ÷ 5 ?\nQ2 : Quelle astuce mentale as-tu utilisée ?',
        activitesEleves:
          '• Écrit sur ardoise et lève au signal :\nR1 : 18 ; 12 ; 10 ; 16.\nR2 : J’ai divisé par 10 puis multiplié par 2 (ex. 90 ÷ 10 = 9 ; 9 × 2 = 18).',
        indicateursInclusifs:
          '• Indicateur pédagogique : rapidité et exactitude PLM · Contrôle Q/R : Q « Que vaut 70 ÷ 5 ? » → R « 14 ».\n[Inclusion handicap] DYS/TDAH : temps de réponse légèrement majoré et validation positive.',
      },
      {
        etape: 'Révision',
        sousTitreInvariable: 'Reconnaître un angle droit à l’aide de l’équerre',
        duree: '5 min',
        activitesMaitre:
          '• Consigne : Tracez deux droites perpendiculaires sur l’ardoise.\nQ1 : Quel instrument permet de vérifier qu’un angle est droit ?\nQ2 : Comment places-tu cet instrument sur l’angle ?',
        activitesEleves:
          '• Trace deux droites et teste l’ouverture.\nR1 : On utilise l’équerre.\nR2 : Je fais coïncider exactement les deux bords perpendiculaires de l’équerre avec les deux côtés de l’angle.',
        indicateursInclusifs:
          '• Indicateur pédagogique : maîtrise du positionnement de l’équerre · Contrôle Q/R : Q « Combien mesure un angle droit ? » → R « 90 degrés ».\n[Inclusion handicap] Visuel/Moteur : montrer avec une grande équerre de tableau contrastée.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Décoration de fête : comparer et mesurer l’ouverture des guirlandes',
        duree: '6 min',
        activitesMaitre:
          '• Présente la situation (p. 104) : Pour confectionner des guirlandes en papier identiques pour la fête de l’école (et un jeu d’adresse à 60°), il faut mesurer exactement l’angle de chaque fanion.\n[Schématisation — Situation-problème des guirlandes] :\n  Fanion 1 : /\\  (ouverture ?°)  vs  Fanion 2 : /   \\ (ouverture ?°)\nQ1 : Suffit-il de mesurer la longueur des bords du fanion pour savoir si l’ouverture est identique ?\nQ2 : Quel outil et quelle unité nous permettent de mesurer précisément cette ouverture ?',
        activitesEleves:
          '• Observe les fanions découpés et reformule le problème.\nR1 : Non, la longueur des côtés ne change pas l’ouverture de l’angle.\nR2 : Il faut utiliser le rapporteur qui mesure en degrés (°).',
        indicateursInclusifs:
          '• Indicateur pédagogique : compréhension du problème et distinction longueur/ouverture · Contrôle Q/R : Q « Quel est le symbole du degré ? » → R « Le petit rond en haut (°) ».\n[Inclusion handicap] Auditif/TSA : montrer de vrais fanions découpés et afficher les mots-clés (angle, degré °, rapporteur).',
      },
      {
        etape: 'Travail collectif – Manipulation',
        sousTitreInvariable: 'Exploration tactile de secteurs carton ABCD & classification',
        duree: '10 min',
        activitesMaitre:
          '• Fait manipuler et superposer les secteurs angulaires ABCD (et le tétraèdre en carton) face au coin de l’équerre (90°).\n[Schématisation — Manipulation tactile des secteurs ABCD] :\n  • Aigu (< 90°) : /_  (plus fermé que l’équerre)\n  • Droit (= 90°) : |_  (coïncide avec l’équerre)\n  • Obtus (> 90°) : \\_  (plus ouvert que l’équerre)\n  • Plat (= 180°) : ──•──  (deux angles droits = 90° + 90°)\nQ1 : Quelles parties forment un angle ?\nQ2 : En comparant au coin de l’équerre (90°), comment classe-t-on ces 4 secteurs ?',
        activitesEleves:
          '• Manipule chaque secteur cartonné contre l’équerre et touche le sommet puis les deux côtés.\nR1 : Un sommet et deux côtés (demi-droites).\nR2 : Droit = 90° ; aigu < 90° (plus fermé) ; obtus > 90° (plus ouvert) ; plat = 180°.',
        indicateursInclusifs:
          '• Indicateur pédagogique : classement exact des 4 natures d’angles par comparaison directe · Contrôle Q/R : Q « Si on prolonge les côtés d’un secteur, son angle change-t-il ? » → R « Non ».\n[Inclusion handicap] Visuel/Moteur : secteurs en carton épais manipulés à deux mains, code couleur bleu/vert/orange/rouge.',
      },
      {
        etape: 'Travail collectif – Représentation / Abstraction',
        sousTitreInvariable: 'Méthode rigoureuse de lecture au rapporteur (exemple 70°)',
        duree: '10 min',
        activitesMaitre:
          '• Démontre au tableau et projette le schéma du rapporteur sur un secteur de 70° :\n[Schématisation — Lecture graduée au rapporteur (70°)] :\n       90°\n      . | .   70° (côté 2)\n    .   |  / \n  180°──O──────── 0° (côté 1)\n   Centre sur sommet O  +  0° aligné sur côté 1  →  lecture = 70°\nQ1 : Quels sont les 3 gestes obligatoires pour placer le rapporteur ?\nQ2 : Pourquoi lit-on 70° et non 110° sur la double graduation ?',
        activitesEleves:
          '• Place son rapporteur sur le schéma modèle et suit la graduation depuis 0°.\nR1 : 1) Centre sur le sommet ; 2) 0° aligné sur le premier côté ; 3) Lire sur l’échelle qui démarre à 0°.\nR2 : Parce qu’on compte à partir du 0° posé sur le côté 1 et que cet angle est plus fermé que 90° (aigu).',
        indicateursInclusifs:
          '• Indicateur pédagogique : choix exact de l’échelle (interne vs externe) · Contrôle Q/R : Q « Si l’angle était obtus, lirait-on 70° ou 110° ? » → R « 110° (> 90°) ».\n[Inclusion handicap] DYS/Dyscalculie : check-list en 3 étapes numérotées + estimation préalable (< 90° ou > 90°).',
      },
      {
        etape: 'Travail en petits groupes / individuel',
        sousTitreInvariable: 'Construction d’angles de 60°, 80° et 120°',
        duree: '12 min',
        activitesMaitre:
          '• Petits groupes (jeu 60°) : « Tracez un segment [AB], placez le centre du rapporteur en A et marquez un point M à 60°, puis tracez [AM). »\n• Individuel : « Construisez un angle aigu de 80° et un angle obtus de 120°. »\n[Schématisation — Programme de tracé 60° / 80° / 120°] :\n  1. Tracer [AB]  →  2. Centre en A, 0° sur B  →  3. Pointer 60° / 80° / 120°  →  4. Relier à A\nQ1 : Avant de relier, l’angle de 60° et celui de 80° seront-ils plus fermés ou plus ouverts que l’équerre ?\nQ2 : Et celui de 120° ?',
        activitesEleves:
          '• Travaille en îlot (60°) puis individuellement (80° et 120°) avec règle et rapporteur.\nR1 : Ils sont aigus (< 90°), donc plus fermés que l’équerre.\nR2 : 120° est obtus (> 90°), donc plus ouvert que l’équerre.',
        indicateursInclusifs:
          '• Indicateur pédagogique : précision du tracé (± 2°) et cohérence aigu/obtus · Contrôle Q/R : Q « De quel côté du 90° dois-tu chercher 120° en partant de 0° ? » → R « Après 90°, vers 180° ».\n[Inclusion handicap] Dyspraxie/Moteur : binôme tuteur qui maintient le rapporteur ou demi-droite [AB) déjà tracée sur fiche.',
      },
      {
        etape: 'Exercices de consolidation et de contrôle',
        sousTitreInvariable: 'Identification et synthèse des mesures (90°, <90°, >90°, 180°)',
        duree: '8 min',
        activitesMaitre:
          '• Consigne : Complète les définitions puis mesure 2 angles du manuel (p. 105).\nQ1 : Combien mesure un angle droit ? un angle plat ?\nQ2 : Quelle est la nature d’un angle de 45° ? et d’un angle de 135° ?',
        activitesEleves:
          '• Répond sur cahier puis mesure au rapporteur les figures du manuel.\nR1 : Angle droit = 90° ; angle plat = 180°.\nR2 : 45° est un angle aigu (< 90°) ; 135° est un angle obtus (> 90°).',
        indicateursInclusifs:
          '• Indicateur pédagogique : validation individuelle rapide · Contrôle Q/R : Q « Un angle de 89° est-il droit ou aigu ? » → R « Aigu car 89° < 90° ».\n[Inclusion handicap] DYS/Visuel : figures agrandies avec côtés prolongés pour faciliter la lecture sur le rapporteur.',
      },
      {
        etape: 'Prolongement',
        sousTitreInvariable: 'Transfert en autonomie — Activité 3 (manuel p. 106)',
        duree: '4 min',
        activitesMaitre:
          'Q : Quelle activité réalisons-nous à la maison et quel soin devons-nous prendre du rapporteur ?\n• Note l’activité 3 page 106 au tableau et félicite les progrès.',
        activitesEleves:
          'R : L’activité 3 page 106 ; nous protégeons notre rapporteur dans le cartable pour ne pas casser les graduations.',
        indicateursInclusifs:
          '• Indicateur pédagogique : devoir compris et copié correctement · Contrôle Q/R : Q « À quelle page se trouve l’activité ? » → R « Page 106 ».\n[Inclusion handicap] Consigne écrite en grand format et vérifiée dans le cahier de textes.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment savoir quelle échelle de nombres lire sur un rapporteur à double graduation ?',
        reponseAttendue: 'On regarde où se trouve le 0° posé sur le premier côté de l’angle, puis on compte à partir de ce 0° (et on vérifie si l’angle est aigu < 90° ou obtus > 90°).',
        indicePedagogique: 'Estime d’abord à l’œil ou à l’équerre : est-il plus petit ou plus grand que 90° ?',
        difficulte: 'Fondamental',
      },
      {
        question: 'Si je prolonge les deux côtés d’un angle, sa mesure en degrés change-t-elle ?',
        reponseAttendue: 'Non, la mesure d’un angle dépend uniquement de l’écartement (ouverture) entre les deux côtés, jamais de leur longueur.',
        indicePedagogique: 'Compare deux secteurs en carton de tailles différentes mais de même pointe.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Combien de degrés mesure un angle plat formé par deux demi-droites opposées ?',
        reponseAttendue: 'Un angle plat mesure 180°, soit l’équivalent de deux angles droits (90° + 90°).',
        indicePedagogique: 'Pose deux coins d’équerre côte à côte le long d’une règle.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle:
        'Un angle se mesure en degrés (°) à l’aide d’un rapporteur en plaçant le centre sur le sommet et le 0° sur un côté.',
      traceEcriteEleve:
        'Angle aigu < 90° · Angle droit = 90° · Angle obtus > 90° (et < 180°) · Angle plat = 180°. L’ouverture ne dépend pas de la longueur des côtés.',
      motsCles: ['Rapporteur', 'Degré (°)', 'Sommet', 'Angle aigu', 'Angle obtus', 'Angle droit'],
      prolongement: 'Réaliser l’activité 3 page 106 du manuel CM1.',
    },
  },

  // FICHE 12 — MATHÉMATIQUES : Calculer une fraction d’un nombre
  {
    id: 'cm1-s9-fiche-12',
    nom: 'Fiche 12 · Mathématiques — Calculer une fraction d’un nombre',
    sousLabel: 'CM1 Semaine 9 · Nombres & Calcul : (N ÷ dénominateur) × numérateur (CB1)',
    collection: 'cm1_s9',
    ficheNumero: 12,
    disciplineSpecifiqueId: 'modele-mathematiques',
    origineModele: 'CM1 · Semaine 9 · Fiche 12',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '70 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 12) : calcul d’une fraction d’un nombre par manipulation de 45 bâtonnets en 9 tas, passage à la règle (N ÷ d) × n et résolution des problèmes (215 ignames, 162 places), avec inclusion handicap.',
    competenceDeBaseModele:
      'CB1 (Mathématiques CM1) — Mobiliser les écritures fractionnaires et le calcul réfléchi pour déterminer une fraction d’une quantité dans des situations concrètes.',
    competenceViseeModele:
      'Calculer une fraction d’un nombre entier en passant du partage concret au calcul réfléchi (N × a) ÷ b ou (N ÷ b) × a.',
    titreSuggere: 'Calculer une fraction d’un nombre',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Partager concrètement une collection (45 bâtonnets en 9 parts) pour trouver une fraction simple (2/9).',
      'Appliquer la règle de calcul : diviser le nombre par le dénominateur puis multiplier par le numérateur (ou inversement).',
      'Résoudre des problèmes de fractions appliqués à la vie courante (3/5 de 215, 2/3 de 348, 7/9 de 162).',
    ],
    prerequis: [
      'Additionner et soustraire deux fractions de même dénominateur.',
      'Maîtriser la division exacte par un nombre à un chiffre.',
    ],
    materielSuggere: [
      'Mon livre de mathématiques CM1 (guide du maître p. 122-123, manuel p. 107-108)',
      'Ardoise, craie, chiffon, bâtonnets, cailloux, billes',
      'Barres fractionnées contrastées, jetons bicolores et fiches visuelles à étapes (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Pour l’anniversaire d’un camarade, 45 chaises sont alignées sous la tente. Les 2/9 de ces chaises sont réservés aux membres de la famille. Combien de chaises faut-il réserver ?',
      miseEnSituation:
        'Manipulation réelle de 45 bâtonnets répartis en 9 tas égaux pour voir immédiatement ce que représente 1/9 puis 2/9.',
      consigneDepart:
        'Formez 9 tas égaux avec 45 bâtonnets puis prenez 2 tas pour découvrir la réponse avant d’écrire le calcul.',
    },
    includeManipulable: true,
    manipulableType: 'fractions',
    customIllustration: {
      titre: 'Fraction d’un nombre : 2/9 de 45 chaises & 3/5 de 215 ignames',
      legende: 'Du partage en tas égaux (45 ÷ 9 = 5 par tas ; 2 tas = 10) au schéma en barres (215 ÷ 5 = 43 ; 3 parts = 129).',
      typeSchema: 'geometrie',
      svgCode: `<svg viewBox="0 0 640 245" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="245" fill="#F8FAFC" rx="8"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">Calculer une fraction d’un nombre : passage Manipulation → Schéma → Règle</text>
  <rect x="20" y="40" width="600" height="88" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="32" y="58" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0284C7">1. Manipulation : 2/9 de 45 bâtonnets (9 tas égaux de 5)</text>
  <rect x="32" y="70" width="58" height="30" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.5"/>
  <rect x="96" y="70" width="58" height="30" rx="4" fill="#DBEAFE" stroke="#0284C7" stroke-width="1.5"/>
  <rect x="160" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="224" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="288" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="352" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="416" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="480" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <rect x="544" y="70" width="58" height="30" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.2"/>
  <text x="61" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">5</text>
  <text x="125" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0284C7">5</text>
  <text x="189" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="253" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="317" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="381" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="445" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="509" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="573" y="89" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">5</text>
  <text x="93" y="117" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0284C7">2/9 = 5 × 2 = 10</text>
  <text x="385" y="117" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">Total : 45 ÷ 9 = 5 par part → (45 ÷ 9) × 2 = 10 chaises</text>

  <rect x="20" y="142" width="600" height="90" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="32" y="160" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#059669">2. Petits groupes : 3/5 de 215 ignames (215 ÷ 5 = 43 par part)</text>
  <rect x="32" y="172" width="114" height="32" fill="#D1FAE5" stroke="#059669" stroke-width="1.5"/>
  <rect x="146" y="172" width="114" height="32" fill="#D1FAE5" stroke="#059669" stroke-width="1.5"/>
  <rect x="260" y="172" width="114" height="32" fill="#D1FAE5" stroke="#059669" stroke-width="1.5"/>
  <rect x="374" y="172" width="114" height="32" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2"/>
  <rect x="488" y="172" width="114" height="32" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2"/>
  <text x="89" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#065F46">43</text>
  <text x="203" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#065F46">43</text>
  <text x="317" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#065F46">43</text>
  <text x="431" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#92400E">43</text>
  <text x="545" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#92400E">43</text>
  <text x="203" y="221" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#059669">3/5 vendus = 43 × 3 = 129 ignames</text>
  <text x="488" y="221" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#D97706">2/5 restants = 86</text>
</svg>`,
      annotations: [
        {
          x: 20,
          y: 36,
          label: 'Diviser par le dénominateur (9)',
          detail: 'Le dénominateur indique en combien de tas égaux on partage la collection : 45 ÷ 9 = 5.',
        },
        {
          x: 42,
          y: 78,
          label: 'Multiplier par le numérateur (3)',
          detail: 'Le numérateur indique combien de parts on prend : 43 × 3 = 129.',
        },
      ],
    },
    customSchematisationMath: CM1_S9_MATH_SCHEMATISATIONS['fiche-12'],
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant joyeux allons-nous entonner ensemble pour bien commencer la séance ?\n• Lance un chant court connu sur le thème des fêtes et bat la mesure.',
        activitesEleves:
          'R : Nous chantons « … ».\n• Se lève (ou reste assis selon besoin) et chante avec entrain.',
        indicateursInclusifs:
          '• Indicateur pédagogique : mobilisation joyeuse de toute la classe · Contrôle Q/R : Q « Quel est le thème de notre semaine ? » → R « Les fêtes et les loisirs ».\n[Inclusion handicap] Auditif/Moteur : battue visible face classe et liberté de rester assis.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, bâtonnets, cailloux & partage',
        duree: '2 min',
        activitesMaitre:
          'Q1 : Montrez vos ardoises, craies, chiffons et vos 45 bâtonnets/cailloux.\nQ2 : Qui n’a pas assez de bâtonnets ? Comment regroupons-nous le matériel en binôme ?',
        activitesEleves:
          'R1 : Voici mon ardoise et mon lot de bâtonnets.\nR2 : Nous mettons nos bâtonnets en commun pour avoir au moins 45 objets sur la table.',
        indicateursInclusifs:
          '• Indicateur pédagogique : chaque binôme dispose de 45 objets · Contrôle Q/R : Q « Combien d’objets faut-il préparer par table ? » → R « 45 bâtonnets ».\n[Inclusion handicap] Moteur/Visuel : privilégier gros jetons stables plutôt que petites billes qui roulent.',
      },
      {
        etape: 'Éveil mathématique',
        sousTitreInvariable: 'Comptage de 500 en 500 de 0 à 10 000',
        duree: '4 min',
        activitesMaitre:
          '• Fait compter de 500 en 500 en ordre croissant puis décroissant.\nQ1 : Quel nombre vient après 5 500 ?\nQ2 : Quel nombre précède 9 000 en reculant de 500 ?',
        activitesEleves:
          '• Compte de 0 à 10 000 puis de 10 000 à 0.\nR1 : 6 000.\nR2 : 8 500.',
        indicateursInclusifs:
          '• Indicateur pédagogique : fluidité des passages aux milliers · Contrôle Q/R : Q « Que vaut la moitié de 1 000 ? » → R « 500 ».\n[Inclusion handicap] Dyscalculie : bande repère 0 – 5 000 – 10 000 visible.',
      },
      {
        etape: 'Calcul mental',
        sousTitreInvariable: 'Révision rapide ÷5 et ÷50',
        duree: '5 min',
        activitesMaitre:
          '• Dicte (PLM) : 70 ÷ 5 ; 95 ÷ 5 ; 250 ÷ 50 ; 450 ÷ 50.\nQ1 : Quels résultats inscrivez-vous sur l’ardoise ?\nQ2 : Comment vérifies-tu que 450 ÷ 50 = 9 ?',
        activitesEleves:
          '• Répond sur ardoise au signal :\nR1 : 14 ; 19 ; 5 ; 9.\nR2 : Parce que (450 ÷ 100) × 2 = 9 ou 9 × 50 = 450.',
        indicateursInclusifs:
          '• Indicateur pédagogique : consolidation de l’automatisme ÷5 et ÷50 · Contrôle Q/R : Q « Que vaut 350 ÷ 50 ? » → R « 7 ».\n[Inclusion handicap] DYS/TDAH : un calcul à la fois avec vérification collective.',
      },
      {
        etape: 'Révision',
        sousTitreInvariable: 'Addition et soustraction de fractions de même dénominateur',
        duree: '5 min',
        activitesMaitre:
          '• Écrit au tableau : 7/15 + 4/15 = ? et 6/9 − 4/9 = ?\nQ1 : Quels résultats obtenez-vous ?\nQ2 : Quelle règle applique-t-on quand les dénominateurs sont identiques ?',
        activitesEleves:
          '• Calcule sur ardoise.\nR1 : 11/15 et 2/9.\nR2 : On additionne ou on soustrait uniquement les numérateurs et on conserve le même dénominateur.',
        indicateursInclusifs:
          '• Indicateur pédagogique : maîtrise du rôle du numérateur et du dénominateur · Contrôle Q/R : Q « Dans 2/9, que désigne le 9 ? » → R « Le nombre total de parts égales ».\n[Inclusion handicap] DYS/Dyscalculie : numérateur encadré en bleu, dénominateur souligné en vert.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Anniversaire : calculer les 2/9 de 45 chaises',
        duree: '6 min',
        activitesMaitre:
          '• Présente l’énoncé (p. 107) : Pour un anniversaire, 45 chaises sont alignées. Les 2/9 des chaises sont réservés aux membres de la famille.\n[Schématisation — Situation-problème des 45 chaises] :\n  45 chaises au total  ──▶  [ ? | ? |   |   |   |   |   |   |   ]  (2 parts sur 9)\nQ1 : De quel nombre total part-on et quelle fraction cherche-t-on ?\nQ2 : Que signifie « prendre les 2/9 de 45 » ?',
        activitesEleves:
          '• Reformule la situation-problème.\nR1 : On part de 45 chaises et on cherche les 2/9 de 45.\nR2 : Cela veut dire partager 45 en 9 parts égales et en prendre 2 parts.',
        indicateursInclusifs:
          '• Indicateur pédagogique : compréhension du sens « fraction d’une quantité » · Contrôle Q/R : Q « L’ensemble des chaises correspond à quelle fraction ? » → R « 9/9 ».\n[Inclusion handicap] Auditif/TSA : afficher « 45 chaises » et « 2/9 = ? » en grand format contrasté.',
      },
      {
        etape: 'Travail collectif – Manipulation',
        sousTitreInvariable: 'Partage physique de 45 bâtonnets en 9 tas égaux',
        duree: '10 min',
        activitesMaitre:
          '• Consigne : Prenez vos 45 bâtonnets et formez 9 tas rigoureusement égaux.\n[Schématisation — Manipulation des 45 bâtonnets en 9 tas] :\n  [ 5 ] [ 5 ] [ 5 ] [ 5 ] [ 5 ] [ 5 ] [ 5 ] [ 5 ] [ 5 ]  = 45 bâtonnets\n  └──── 2/9 = 5 + 5 = 10 chaises ────┘\nQ1 : Combien de bâtonnets y a-t-il dans 1 tas (1/9 de 45) ?\nQ2 : Combien de bâtonnets obtient-on si l’on réunit 2 tas (2/9 de 45) ?',
        activitesEleves:
          '• Distribue les 45 bâtonnets un à un dans 9 tas égaux puis isole 2 tas.\nR1 : Il y a 5 bâtonnets dans 1 tas (1/9 de 45 = 5).\nR2 : Dans 2 tas (2/9), il y a 5 + 5 = 10 bâtonnets, donc 10 chaises pour la famille.',
        indicateursInclusifs:
          '• Indicateur pédagogique : partage exact en 9 tas de 5 avant toute formule · Contrôle Q/R : Q « Combien de chaises restent pour les amis (7/9) ? » → R « 7 × 5 = 35 chaises ».\n[Inclusion handicap] Visuel/Moteur/Dyscalculie : 9 gobelets ou cerceaux numérotés 1 à 9 pour sécuriser la distribution.',
      },
      {
        etape: 'Travail collectif – Représentation / Abstraction',
        sousTitreInvariable: 'Émergence des deux écritures : (45 ÷ 9) × 2 et (45 × 2) ÷ 9',
        duree: '10 min',
        activitesMaitre:
          '• Traduit la manipulation au tableau en schéma en barres puis en calculs :\n[Schématisation — Passage du concret à la règle] :\n  45 ──(÷ 9)──▶ 5 (= 1/9) ──(× 2)──▶ 10 (= 2/9)\n  Méthode 1 : (45 ÷ 9) × 2 = 5 × 2 = 10   |   Méthode 2 : (45 × 2) ÷ 9 = 90 ÷ 9 = 10\nQ1 : Quelle opération donne 5 ? Puis quelle opération donne 10 ?\nQ2 : Comment énonces-tu la règle pour calculer une fraction a/b d’un nombre N ?',
        activitesEleves:
          '• Observe le passage des tas aux écritures mathématiques.\nR1 : 45 ÷ 9 donne 5 (une part), puis 5 × 2 donne 10 (deux parts).\nR2 : Pour calculer une fraction d’un nombre, on divise ce nombre par le dénominateur puis on multiplie par le numérateur (ou on multiplie par le numérateur puis on divise par le dénominateur).',
        indicateursInclusifs:
          '• Indicateur pédagogique : double voie de calcul verbalisée correctement · Contrôle Q/R : Q « Quelle méthode évite les grands nombres ? » → R « Diviser d’abord par le dénominateur ».\n[Inclusion handicap] DYS/Dyscalculie : privilégier (N ÷ dénominateur) × numérateur avec flèches colorées.',
      },
      {
        etape: 'Travail en petits groupes / individuel',
        sousTitreInvariable: 'Applications concrètes : 3/5 de 215 ignames ; 2/3 de 348 ; 3/5 de 150',
        duree: '12 min',
        activitesMaitre:
          '• Petits groupes : Un cultivateur récolte 215 ignames et vend les 3/5. Combien d’ignames a-t-il vendues ?\n[Schématisation — Barre des 215 ignames (îlots)] :\n  215 ignames = | 43 | 43 | 43 | 43 | 43 |  →  3/5 vendues = 43 × 3 = 129 | Reste 2/5 = 86\n• Individuel : Calcule les 2/3 de 348 puis les 3/5 de 150.\nQ1 : Que vaut 1/5 de 215 ignames, puis 3/5 ?\nQ2 : Quels résultats trouves-tu individuellement pour 2/3 de 348 et 3/5 de 150 ?',
        activitesEleves:
          '• Trace la barre de 5 cases égales en îlot puis calcule individuellement sur cahier.\nR1 : 215 ÷ 5 = 43 ignames pour 1/5 ; 43 × 3 = 129 ignames vendues.\nR2 : (348 ÷ 3) × 2 = 116 × 2 = 232 ; (150 ÷ 5) × 3 = 30 × 3 = 90.',
        indicateursInclusifs:
          '• Indicateur pédagogique : schéma en barres exact + opération juste · Contrôle Q/R : Q « Quelle fraction des 215 ignames reste non vendue ? » → R « 2/5 soit 86 ignames ».\n[Inclusion handicap] DYS/TDAH : schéma en barres à 5 ou 3 cases pré-dessiné à compléter avant de multiplier.',
      },
      {
        etape: 'Exercices de consolidation et de contrôle',
        sousTitreInvariable: 'Problème du 90e anniversaire : tente de 162 places (7/9 occupées)',
        duree: '9 min',
        activitesMaitre:
          '• Énoncé (p. 108) : Pour les 90 ans de grand-mère, une tente compte 162 places ; les 7/9 sont occupées par les invités.\n[Schématisation — Tente de 162 places (9 parts de 18)] :\n  | 18 | 18 | 18 | 18 | 18 | 18 | 18 | 18 | 18 | → Occupées (7/9) = 126 · Libres (2/9) = 36\nQ1 : Combien d’invités sont assis sous la tente ?\nQ2 : Quelle fraction et combien de places restent libres ? Comment vérifies-tu ?',
        activitesEleves:
          '• Trace la barre en 9 cases de 18 et résout dans le cahier.\nR1 : (162 ÷ 9) × 7 = 18 × 7 = 126 invités assis.\nR2 : Il reste 2/9 libres = 18 × 2 = 36 places ; vérification : 126 + 36 = 162.',
        indicateursInclusifs:
          '• Indicateur pédagogique : résolution autonome et preuve par addition · Contrôle Q/R : Q « Que vaut 1/9 de 162 ? » → R « 18 places ».\n[Inclusion handicap] Dyscalculie : calcul posé en étapes guidées (1. ÷9 ; 2. ×7) et validation orale.',
      },
      {
        etape: 'Prolongement',
        sousTitreInvariable: 'Transfert — Activité 3 (manuel p. 108)',
        duree: '4 min',
        activitesMaitre:
          'Q : Quelle règle retiens-tu aujourd’hui pour réussir l’activité 3 page 108 à la maison ?\n• Donne la référence de l’exercice et félicite les élèves.',
        activitesEleves:
          'R : Je divise d’abord par le dénominateur pour trouver une part, puis je multiplie par le numérateur.\n• Note l’activité 3 p. 108 et range ses bâtonnets.',
        indicateursInclusifs:
          '• Indicateur pédagogique : règle verbalisée et référence notée · Contrôle Q/R : Q « Que dois-tu faire en premier pour calculer 3/4 de 20 ? » → R « 20 ÷ 4 = 5 ».\n[Inclusion handicap] Référence écrite en gros caractères et vérifiée dans le cahier.',
      },
    ],
    questionsReponses: [
      {
        question: 'Comment calculer les 2/9 de 45 sans se tromper ?',
        reponseAttendue: 'On divise 45 par 9 (= 5, qui vaut 1/9), puis on multiplie 5 par 2 (= 10).',
        indicePedagogique: 'Demande-toi toujours : « Combien vaut UNE seule part (1/9) ? »',
        difficulte: 'Fondamental',
      },
      {
        question: 'Si un vendeur vend les 3/5 de ses 215 ignames, quelle fraction lui reste-t-il et combien cela fait-il ?',
        reponseAttendue: 'Il lui reste 2/5 (car 5/5 − 3/5 = 2/5), soit 43 × 2 = 86 ignames.',
        indicePedagogique: 'Calcule 1/5 = 215 ÷ 5 = 43, puis multiplie par 2.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Sous une tente de 162 places dont les 7/9 sont occupées, comment vérifier ta réponse à la fin ?',
        reponseAttendue: 'On ajoute les places occupées (126) et les places libres (2/9 = 36) : 126 + 36 = 162 places au total.',
        indicePedagogique: 'La somme des parts prises et des parts restantes doit redonner le tout.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle:
        'Calculer une fraction d’un nombre revient à partager ce nombre en parts égales (÷ dénominateur) puis à prendre le nombre de parts voulu (× numérateur).',
      traceEcriteEleve:
        'Fraction a/b d’un nombre N = (N ÷ b) × a ou (N × a) ÷ b. Exemple : 2/9 de 45 = (45 ÷ 9) × 2 = 10.',
      motsCles: ['Fraction d’un nombre', 'Numérateur', 'Dénominateur', 'Partage égal', 'Unité 1/b'],
      prolongement: 'Activité 3 page 108 du manuel CM1.',
    },
  },

  // FICHE 13 — MATHÉMATIQUES : Mesurer des masses : le gramme et ses multiples
  {
    id: 'cm1-s9-fiche-13',
    nom: 'Fiche 13 · Mathématiques — Mesurer des masses (g, dag, hg, kg)',
    sousLabel: 'CM1 Semaine 9 · Grandeurs & Mesures : balance, masses marquées & conversions (CB3)',
    collection: 'cm1_s9',
    ficheNumero: 13,
    disciplineSpecifiqueId: 'modele-mathematiques',
    origineModele: 'CM1 · Semaine 9 · Fiche 13',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '70 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 13) : découverte de la balance à plateaux et des multiples du gramme (dag, hg, kg), tableau de conversion et résolution de problèmes culinaires d’anniversaire, avec inclusion handicap.',
    competenceDeBaseModele:
      'CB3 (Mathématiques CM1) — Mesurer, comparer et convertir des masses à l’aide de la balance et des multiples du gramme (dag, hg, kg) dans des situations de vie courante.',
    competenceViseeModele:
      'Utiliser les unités de masse (g, dag, hg, kg), lire une pesée sur une balance et convertir pour additionner des masses.',
    titreSuggere: 'Mesurer des masses : le gramme et ses multiples (dag, hg, kg)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Identifier le gramme (g) et ses multiples : décagramme (1 dag = 10 g), hectogramme (1 hg = 100 g), kilogramme (1 kg = 1 000 g).',
      'Réaliser l’équilibre d’une balance à plateaux avec des masses marquées.',
      'Convertir des masses dans un tableau pour additionner et résoudre des problèmes concrets.',
    ],
    prerequis: [
      'Maîtriser les conversions de longueurs (dm, m, mm) avec un tableau de numération.',
      'Effectuer des multiplications et divisions par 10, 100 et 1 000.',
    ],
    materielSuggere: [
      'Mon livre de mathématiques CM1 (guide du maître p. 124-125, manuel p. 109-110)',
      'Balance à plateaux, boîte de masses marquées, objets de différentes natures',
      'Ardoise, craie, chiffon, bâtonnets, cailloux',
      'Tableau de conversion kg/hg/dag/g plastifié en couleurs contrastées et étiquettes-chiffres mobiles (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Pour l’anniversaire d’Adjo, sa maman achète 3 kg de fonio, 2 kg de viande, 500 g de tomate et 20 g de sel. Quelle masse totale (en grammes) transporte-t-elle ?',
      miseEnSituation:
        'Observation d’une vraie balance à plateaux : quand l’aiguille est au centre, la masse des objets équilibre exactement les masses marquées.',
      consigneDepart:
        'Pesons d’abord des objets réels avec les masses marquées puis rangeons nos mesures dans le tableau du gramme et de ses multiples.',
    },
    includeManipulable: true,
    manipulableType: 'balance_algebre',
    customIllustration: {
      titre: 'Balance en équilibre & Tableau des multiples du gramme (Anniversaire d’Adjo)',
      legende: 'Équivalence visuelle sur balance à plateaux et conversion dans le tableau kg · hg · dag · g → 5 520 g.',
      typeSchema: 'svg',
      svgCode: `<svg viewBox="0 0 640 245" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="245" fill="#F8FAFC" rx="8"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">Mesurer et convertir des masses : le gramme (g) et ses multiples</text>
  <rect x="20" y="40" width="230" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="135" y="58" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0284C7">Balance à l’équilibre</text>
  <polygon points="123,205 147,205 135,140" fill="#334155"/>
  <line x1="55" y1="140" x2="215" y2="140" stroke="#0F172A" stroke-width="3"/>
  <line x1="135" y1="140" x2="135" y2="108" stroke="#DC2626" stroke-width="2"/>
  <polygon points="135,102 131,112 139,112" fill="#DC2626"/>
  <rect x="38" y="122" width="52" height="16" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1.4"/>
  <text x="64" y="114" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400E">1 kg</text>
  <rect x="176" y="122" width="54" height="16" rx="3" fill="#D1FAE5" stroke="#059669" stroke-width="1.4"/>
  <text x="203" y="114" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065F46">1 000 g</text>
  <text x="135" y="222" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Aiguille au centre = égalité exacte</text>

  <rect x="266" y="40" width="354" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="278" y="58" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#059669">Tableau de conversion (Achats d’Adjo)</text>
  <rect x="278" y="70" width="82" height="26" fill="#0F172A"/>
  <rect x="360" y="70" width="82" height="26" fill="#0F172A"/>
  <rect x="442" y="70" width="82" height="26" fill="#0F172A"/>
  <rect x="524" y="70" width="82" height="26" fill="#0284C7"/>
  <text x="319" y="87" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">kg</text>
  <text x="401" y="87" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">hg</text>
  <text x="483" y="87" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">dag</text>
  <text x="565" y="87" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">g</text>
  <rect x="278" y="96" width="328" height="24" fill="#F8FAFC" stroke="#CBD5E1"/>
  <text x="319" y="112" text-anchor="middle" font-family="monospace" font-size="12" fill="#0F172A">3</text>
  <text x="401" y="112" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748B">0</text>
  <text x="483" y="112" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748B">0</text>
  <text x="565" y="112" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0284C7">0</text>
  <rect x="278" y="120" width="328" height="24" fill="#FFFFFF" stroke="#CBD5E1"/>
  <text x="319" y="136" text-anchor="middle" font-family="monospace" font-size="12" fill="#0F172A">2</text>
  <text x="401" y="136" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748B">0</text>
  <text x="483" y="136" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748B">0</text>
  <text x="565" y="136" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0284C7">0</text>
  <rect x="278" y="144" width="328" height="24" fill="#F8FAFC" stroke="#CBD5E1"/>
  <text x="401" y="160" text-anchor="middle" font-family="monospace" font-size="12" fill="#0F172A">5</text>
  <text x="483" y="160" text-anchor="middle" font-family="monospace" font-size="12" fill="#0F172A">0</text>
  <text x="565" y="160" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0284C7">0</text>
  <rect x="278" y="168" width="328" height="24" fill="#FFFFFF" stroke="#CBD5E1"/>
  <text x="483" y="184" text-anchor="middle" font-family="monospace" font-size="12" fill="#0F172A">2</text>
  <text x="565" y="184" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#0284C7">0</text>
  <rect x="278" y="194" width="328" height="26" fill="#ECFDF5" stroke="#059669" stroke-width="1.4"/>
  <text x="442" y="211" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065F46">Total = 5 520 g (5 kg 520 g)</text>
</svg>`,
      annotations: [
        {
          x: 21,
          y: 58,
          label: 'Équilibre de la balance',
          detail: 'Quand les deux plateaux s’équilibrent, l’aiguille pointe verticalement au milieu : 1 kg = 1 000 g.',
        },
        {
          x: 68,
          y: 62,
          label: 'Tableau de conversion',
          detail: 'On place un seul chiffre par colonne et on complète de zéros jusqu’à l’unité demandée (g).',
        },
      ],
    },
    customSchematisationMath: CM1_S9_MATH_SCHEMATISATIONS['fiche-13'],
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant sur les fêtes allons-nous chanter ensemble pour bien démarrer ?\n• Lance un chant connu et bat la mesure face classe.',
        activitesEleves:
          'R : Nous chantons « … ».\n• Se lève (ou reste assis selon besoin) et chante avec entrain.',
        indicateursInclusifs:
          '• Indicateur pédagogique : climat positif et attention mobilisée · Contrôle Q/R : Q « Qui célèbre-t-on dans notre histoire du jour ? » → R « L’anniversaire d’Adjo ! ».\n[Inclusion handicap] Auditif/Moteur : repères visuels et posture adaptée.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification ardoise, bâtonnets, balance & masses marquées',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Montrez vos ardoises, craies, chiffons et bâtonnets.\nQ2 : Observez la balance et les boîtes de masses marquées : qui veut vérifier si l’aiguille est libre ?',
        activitesEleves:
          'R1 : Voici notre ardoise et nos bâtonnets ; nous partageons si un camarade en manque.\nR2 : Deux élèves viennent vérifier le fléau et les masses marquées (g, dag, hg, kg).',
        indicateursInclusifs:
          '• Indicateur pédagogique : matériel de pesée prêt et sécurisé · Contrôle Q/R : Q « Que peut-on lire sur la plus grosse masse ? » → R « 1 kg ».\n[Inclusion handicap] Moteur/Visuel : plateau accessible à hauteur des élèves et masses étiquetées en gros caractères.',
      },
      {
        etape: 'Éveil mathématique',
        sousTitreInvariable: 'Comptage de 1 000 en 1 000 de 0 à 10 000',
        duree: '4 min',
        activitesMaitre:
          '• Fait compter de 1 000 en 1 000 de 0 à 10 000 puis à rebours.\nQ1 : Quel millier suit 4 000 ?\nQ2 : Combien de milliers faut-il pour faire 10 000 ?',
        activitesEleves:
          '• Compte collectivement : 0, 1 000, 2 000, …, 10 000 et à reculons.\nR1 : 5 000.\nR2 : 10 milliers (10 × 1 000).',
        indicateursInclusifs:
          '• Indicateur pédagogique : préparation directe à 1 kg = 1 000 g · Contrôle Q/R : Q « Si 1 kg = 1 000 g, que valent 3 kg ? » → R « 3 000 g ».\n[Inclusion handicap] Dyscalculie : bande numérique des milliers visible au tableau.',
      },
      {
        etape: 'Calcul mental',
        sousTitreInvariable: 'Division rapide par 50 sur ardoise',
        duree: '5 min',
        activitesMaitre:
          '• Dicte (PLM) : 300 ÷ 50 ; 600 ÷ 50 ; 800 ÷ 50 ; 900 ÷ 50.\nQ1 : Quels résultats montrez-vous sur ardoise ?\nQ2 : Comment trouves-tu 900 ÷ 50 sans poser l’opération ?',
        activitesEleves:
          '• Écrit sur ardoise au signal :\nR1 : 6 ; 12 ; 16 ; 18.\nR2 : Je fais (900 ÷ 100) × 2 = 9 × 2 = 18.',
        indicateursInclusifs:
          '• Indicateur pédagogique : règle ÷100 × 2 automatisée · Contrôle Q/R : Q « Que vaut 700 ÷ 50 ? » → R « 14 ».\n[Inclusion handicap] DYS/TDAH : rythme régulier sans précipitation.',
      },
      {
        etape: 'Révision',
        sousTitreInvariable: 'Conversions de longueurs : 148 dm et 265 m en mm',
        duree: '5 min',
        activitesMaitre:
          '• Consigne : Convertissez 148 dm en mm et 265 m en mm sur ardoise.\nQ1 : Quels résultats obtenez-vous ?\nQ2 : Comment décalons-nous dans le tableau des longueurs ?',
        activitesEleves:
          '• Place dans le tableau m | dm | cm | mm.\nR1 : 148 dm = 14 800 mm ; 265 m = 265 000 mm.\nR2 : On ajoute un zéro par colonne vide jusqu’à l’unité demandée.',
        indicateursInclusifs:
          '• Indicateur pédagogique : réinvestissement du principe décimal · Contrôle Q/R : Q « Combien de zéros ajoute-t-on pour passer de m à mm ? » → R « 3 zéros (× 1 000) ».\n[Inclusion handicap] Dyscalculie/DYS : colonnes m | dm | cm | mm tracées en grand.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Anniversaire d’Adjo : additionner des masses hétérogènes',
        duree: '6 min',
        activitesMaitre:
          '• Présente la situation (p. 109) : Pour l’anniversaire d’Adjo, sa maman achète 3 kg de fonio, 2 kg de viande, 500 g de tomate et 20 g de sel.\n[Schématisation — Situation-problème de l’anniversaire d’Adjo] :\n  3 kg (fonio) + 2 kg (viande) + 500 g (tomate) + 20 g (sel)  =  ? g\nQ1 : Peut-on additionner directement 3 + 2 + 500 + 20 ? Pourquoi ?\nQ2 : Quelle unité commune faut-il choisir pour répondre à la question ?',
        activitesEleves:
          '• Reformule le problème.\nR1 : Non, car les masses ne sont pas dans la même unité (il y a des kg et des g).\nR2 : Il faut tout convertir en grammes (g) avant d’additionner.',
        indicateursInclusifs:
          '• Indicateur pédagogique : prise de conscience de l’unité commune · Contrôle Q/R : Q « Quelles deux unités figurent dans l’énoncé ? » → R « Le kilogramme (kg) et le gramme (g) ».\n[Inclusion handicap] Auditif/DYS : écrire les 4 ingrédients en liste verticale avec unités surlignées.',
      },
      {
        etape: 'Travail collectif – Manipulation',
        sousTitreInvariable: 'Pesée sur balance à plateaux & découverte de g, dag, hg, kg',
        duree: '10 min',
        activitesMaitre:
          '• Fait peser un cahier, une boîte de craies ou un caillou sur la balance à plateaux.\n[Schématisation — Balance à l’équilibre & multiples du gramme] :\n    [ Objet ] ────▲──── [ Masses marquées ]    (aiguille au centre = égalité)\n                  │\n    1 dag = 10 g  ·  1 hg = 100 g  ·  1 kg = 1 000 g\nQ1 : À quoi reconnaît-on que la balance est exactement en équilibre ?\nQ2 : Quelles unités sont gravées sur les masses marquées et combien de grammes vaut chacune ?',
        activitesEleves:
          '• Manipule les plateaux, ajoute les masses marquées et soupèse 100 g puis 1 kg.\nR1 : Les deux plateaux sont à la même hauteur et l’aiguille pointe droit au milieu.\nR2 : Le gramme (g) et ses multiples : 1 dag = 10 g ; 1 hg = 100 g ; 1 kg = 1 000 g.',
        indicateursInclusifs:
          '• Indicateur pédagogique : ancrage sensoriel des unités et lecture d’équilibre · Contrôle Q/R : Q « Combien de paquets de 1 hg faut-il pour équilibrer 1 kg ? » → R « 10 paquets de 100 g ».\n[Inclusion handicap] Visuel/Moteur : faire soupeser les masses à la main et verbaliser la position verticale de l’aiguille.',
      },
      {
        etape: 'Travail collectif – Représentation / Abstraction',
        sousTitreInvariable: 'Tableau de conversion kg / hg / dag / g et résolution du problème d’Adjo',
        duree: '10 min',
        activitesMaitre:
          '• Trace le tableau au tableau et fait placer chaque achat d’Adjo :\n[Schématisation — Tableau de conversion des achats d’Adjo] :\n  | kg | hg | dag | g |   →  Fonio :   3 | 0 | 0 | 0  = 3 000 g\n                          →  Viande :  2 | 0 | 0 | 0  = 2 000 g\n                          →  Tomate :    | 5 | 0 | 0  =   500 g\n                          →  Sel :       |   | 2 | 0  =    20 g\n                          Total :      5 | 5 | 2 | 0  = 5 520 g\nQ1 : Comment place-t-on « 3 kg » dans le tableau pour lire sa masse en grammes ?\nQ2 : Quelle masse totale maman transporte-t-elle (en g et en kg g) ?',
        activitesEleves:
          '• Place un seul chiffre par colonne dans son tableau.\nR1 : On écrit 3 dans la colonne kg et on complète par des zéros jusqu’à la colonne g (= 3 000 g).\nR2 : 3 000 + 2 000 + 500 + 20 = 5 520 g (soit 5 kg 520 g).',
        indicateursInclusifs:
          '• Indicateur pédagogique : alignement rigoureux 1 chiffre par colonne · Contrôle Q/R : Q « Combien de hg valent 500 g ? » → R « 5 hg ».\n[Inclusion handicap] DYS/Dyscalculie : grille pré-imprimée 1 case par chiffre et zéros inscrits en bleu.',
      },
      {
        etape: 'Travail en petits groupes / individuel',
        sousTitreInvariable: 'Problème de la pâte de gari de Napo (580 g) & calcul individuel (2 835 g)',
        duree: '12 min',
        activitesMaitre:
          '• Petits groupes : Napo prépare de la pâte de gari avec 250 g de gari, 4 morceaux de viande de 7 dag chacun et 50 g de piment.\n• Individuel : Calcule la masse totale de 2 kg + 800 g + 35 g.\n[Schématisation — Pâte de gari de Napo] :\n  Viande : 4 × 7 dag = 28 dag ──(dans tableau)──▶ 280 g\n  Total  : 250 g (gari) + 280 g (viande) + 50 g (piment) = 580 g\nQ1 : Quelle étape préalable est indispensable pour les 4 morceaux de viande de 7 dag ?\nQ2 : Quelle masse totale obtient-on pour la pâte de Napo, puis pour l’exercice individuel ?',
        activitesEleves:
          '• Convertit dans le tableau en îlot puis calcule individuellement.\nR1 : Il faut calculer 4 × 7 dag = 28 dag puis convertir en grammes : 280 g.\nR2 : En groupe : 250 + 280 + 50 = 580 g ; individuel : 2 000 + 800 + 35 = 2 835 g.',
        indicateursInclusifs:
          '• Indicateur pédagogique : conversion avant addition + unité finale exacte · Contrôle Q/R : Q « 580 g est-il plus lourd ou plus léger que 1 kg ? » → R « Plus léger (1 kg = 1 000 g) ».\n[Inclusion handicap] TSA/DYS : décomposer Napo en 2 boîtes visuelles (1. Viande en g ; 2. Somme totale).',
      },
      {
        etape: 'Exercices de consolidation et de contrôle',
        sousTitreInvariable: 'Série de conversions rapides & écritures composées',
        duree: '8 min',
        activitesMaitre:
          '• Consigne : Convertissez dans le cahier :\n20 dag = … g ; 3 400 kg = … dag (et 3 400 g = … dag) ; 6 kg = … hg ;\n3 kg 150 g = … g ; 2 kg 2 hg = … g ; 1 kg 9 dag = … g.\nQ1 : Quel piège faut-il éviter pour convertir 1 kg 9 dag en grammes ?\nQ2 : Vérifions ensemble toutes les réponses.',
        activitesEleves:
          '• Utilise son tableau et résout dans le cahier.\nR1 : Il ne faut pas oublier de mettre un 0 dans la colonne vide des hectogrammes (hg) : 1 kg 9 dag = 1 090 g (et non 190 g).\nR2 : 20 dag = 200 g ; 3 400 kg = 340 000 dag (3 400 g = 340 dag) ; 6 kg = 60 hg ; 3 kg 150 g = 3 150 g ; 2 kg 2 hg = 2 200 g ; 1 kg 9 dag = 1 090 g.',
        indicateursInclusifs:
          '• Indicateur pédagogique : gestion du zéro intercalé maîtrisée · Contrôle Q/R : Q « Que vaut 4 kg 5 dag en g ? » → R « 4 050 g ».\n[Inclusion handicap] Dyscalculie : tableau plastique avec marqueur effaçable pour visualiser la case vide des hg.',
      },
      {
        etape: 'Prolongement',
        sousTitreInvariable: 'Transfert — Activité 3 (manuel p. 110)',
        duree: '4 min',
        activitesMaitre:
          'Q : Quels sont les trois multiples du gramme à retenir pour réussir l’activité 3 page 110 ?\n• Donne l’exercice p. 110 et félicite les élèves.',
        activitesEleves:
          'R : Le décagramme (10 g), l’hectogramme (100 g) et le kilogramme (1 000 g).\n• Note le devoir et range le matériel.',
        indicateursInclusifs:
          '• Indicateur pédagogique : règle retenue et consigne notée · Contrôle Q/R : Q « 1 kg vaut combien d’hg ? » → R « 10 hg ».\n[Inclusion handicap] Consigne écrite lisiblement et vérifiée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Combien de grammes y a-t-il dans 1 dag, dans 1 hg et dans 1 kg ?',
        reponseAttendue: '1 dag = 10 g ; 1 hg = 100 g ; 1 kg = 1 000 g.',
        indicePedagogique: 'Déca- veut dire 10, hecto- veut dire 100, kilo- veut dire 1 000.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Pourquoi 1 kg 9 dag est-il égal à 1 090 g et non à 190 g ?',
        reponseAttendue: 'Parce que la colonne des hectogrammes (hg) est vide et doit être remplie par un 0 : 1 kg = 1 000 g et 9 dag = 90 g, donc 1 090 g.',
        indicePedagogique: 'Écris 1 dans kg, 9 dans dag, puis mets 0 dans hg et 0 dans g.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Comment calculer la masse de la pâte de gari de Napo (250 g + 4 morceaux de 7 dag + 50 g) ?',
        reponseAttendue: 'On calcule d’abord la viande (4 × 7 dag = 28 dag = 280 g), puis on additionne : 250 + 280 + 50 = 580 g.',
        indicePedagogique: 'Convertis les décagrammes (dag) en grammes avant d’additionner.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle:
        'Pour comparer ou additionner des masses, on utilise la balance et le tableau du gramme et de ses multiples (dag, hg, kg) afin de tout convertir dans la même unité.',
      traceEcriteEleve:
        '1 dag = 10 g · 1 hg = 100 g · 1 kg = 1 000 g. Tableau : kg | hg | dag | g (un chiffre par colonne).',
      motsCles: ['Balance', 'Gramme (g)', 'Décagramme (dag)', 'Hectogramme (hg)', 'Kilogramme (kg)'],
      prolongement: 'Activité 3 page 110 du manuel CM1.',
    },
  },

  // FICHE 14 — MATHÉMATIQUES : Construire des polygones réguliers : le triangle
  {
    id: 'cm1-s9-fiche-14',
    nom: 'Fiche 14 · Mathématiques — Construire des polygones : le triangle',
    sousLabel: 'CM1 Semaine 9 · Géométrie : triangles rectangle, isocèle et équilatéral au compas/équerre (CB2)',
    collection: 'cm1_s9',
    ficheNumero: 14,
    disciplineSpecifiqueId: 'modele-mathematiques',
    origineModele: 'CM1 · Semaine 9 · Fiche 14',
    handicapsInclus: [...DEFAULT_HANDICAP_PROFILES],
    domaine: 'Mathématiques',
    matiere: 'Mathématiques',
    niveauParDefaut: 'CM1',
    dureeParDefaut: '70 min',
    description:
      'Modèle officiel CM1 (Semaine 9 – Fiche 14) : identification par tri tactile et construction rigoureuse des triangles (rectangle à l’équerre ; isocèle et équilatéral au compas), avec problèmes concrets (éventails, sac kenté, espace 8 m × 12 m) et inclusion handicap.',
    competenceDeBaseModele:
      'CB2 (Mathématiques CM1) — Identifier, décrire et construire des figures géométriques planes (triangles rectangle, isocèle, équilatéral) à l’aide de la règle, de l’équerre et du compas.',
    competenceViseeModele:
      'Reconnaître les différents triangles par leurs propriétés (angle droit, côtés égaux) et les construire avec précision au compas et à l’équerre.',
    titreSuggere: 'Construire des polygones : le triangle (rectangle, isocèle, équilatéral)',
    themeSuggere: 'Les fêtes et les loisirs',
    objectifsSpecifiques: [
      'Distinguer un triangle (3 côtés, 3 sommets, 3 angles) des autres polygones et classer triangle rectangle, isocèle et équilatéral.',
      'Construire un triangle rectangle à l’équerre et à la règle (côtés de l’angle droit donnés).',
      'Construire un triangle équilatéral (5 cm) et un triangle isocèle (8 cm ; 6 cm ; 6 cm) à l’aide du compas et de la règle.',
    ],
    prerequis: [
      'Reconnaître un rectangle (4 côtés, 4 angles droits) et utiliser l’équerre.',
      'Manipuler le compas pour reporter une longueur sur un arc de cercle.',
    ],
    materielSuggere: [
      'Mon livre de mathématiques CM1 (guide du maître p. 126-128, manuel p. 111-112)',
      'Règle, compas, équerre, crayon, ciseaux, papier kraft, ardoise, craie, chiffon',
      'Lot de polygones prédécoupés en carton rigide',
      'Compas de sécurité à molette bloquante, gabarits tactiles des 3 triangles et papier contrasté (inclusion handicap)',
    ],
    introduction: {
      accroche:
        'Pour la semaine artistique et culturelle de l’école, chaque classe fabrique des éventails triangulaires décoratifs : comment réussir des triangles parfaitement réguliers ?',
      miseEnSituation:
        'Tri d’un lot de polygones prédécoupés en carton pour isoler les figures à 3 côtés et observer leurs différences (angle droit, 2 côtés égaux, 3 côtés égaux).',
      consigneDepart:
        'Triez d’abord les polygones qui ont exactement 3 côtés puis vérifiez leurs angles et longueurs à l’équerre et au compas.',
    },
    includeManipulable: true,
    manipulableType: 'geometrie_aire',
    customIllustration: {
      titre: 'Les 3 triangles usuels & tracé au compas (sac kenté 5 cm et isocèle 8-6-6)',
      legende: 'Propriétés et codage des côtés égaux / angle droit : triangle rectangle (équerre), triangle équilatéral et isocèle (arcs de compas).',
      typeSchema: 'geometrie',
      svgCode: `<svg viewBox="0 0 640 245" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="640" height="245" fill="#F8FAFC" rx="8"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">Construire des triangles : équerre (angle droit) &amp; compas (côtés égaux)</text>
  <rect x="20" y="40" width="188" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="114" y="58" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0284C7">1. Triangle rectangle</text>
  <polygon points="48,184 48,86 174,184" fill="#DBEAFE" fill-opacity="0.55" stroke="#0F172A" stroke-width="2"/>
  <rect x="48" y="170" width="14" height="14" fill="none" stroke="#DC2626" stroke-width="1.6"/>
  <text x="36" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">A</text>
  <text x="36" y="88" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">C</text>
  <text x="180" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">B</text>
  <text x="114" y="212" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">1 angle droit en A (équerre)</text>

  <rect x="224" y="40" width="192" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="320" y="58" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#059669">2. Équilatéral (côté 5 cm)</text>
  <path d="M 294 84 A 110 110 0 0 1 346 84" fill="none" stroke="#059669" stroke-width="1.3" stroke-dasharray="4 3"/>
  <polygon points="262,184 378,184 320,84" fill="#D1FAE5" fill-opacity="0.55" stroke="#0F172A" stroke-width="2"/>
  <line x1="286" y1="130" x2="296" y2="136" stroke="#059669" stroke-width="2"/>
  <line x1="344" y1="136" x2="354" y2="130" stroke="#059669" stroke-width="2"/>
  <line x1="320" y1="178" x2="320" y2="190" stroke="#059669" stroke-width="2"/>
  <text x="250" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">A</text>
  <text x="382" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">B</text>
  <text x="316" y="77" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">C</text>
  <text x="320" y="212" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">3 côtés égaux = 5 cm (compas)</text>

  <rect x="432" y="40" width="188" height="190" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="526" y="58" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#D97706">3. Isocèle (8 cm ; 6 cm ; 6 cm)</text>
  <path d="M 502 96 A 88 88 0 0 1 550 96" fill="none" stroke="#D97706" stroke-width="1.3" stroke-dasharray="4 3"/>
  <polygon points="462,184 590,184 526,96" fill="#FEF3C7" fill-opacity="0.55" stroke="#0F172A" stroke-width="2"/>
  <line x1="488" y1="136" x2="498" y2="144" stroke="#D97706" stroke-width="2"/>
  <line x1="554" y1="144" x2="564" y2="136" stroke="#D97706" stroke-width="2"/>
  <text x="450" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">A</text>
  <text x="594" y="188" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">B</text>
  <text x="522" y="88" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">C</text>
  <text x="526" y="176" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#0F172A">AB = 8 cm</text>
  <text x="526" y="212" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">AC = BC = 6 cm (2 arcs compas)</text>
</svg>`,
      annotations: [
        {
          x: 18,
          y: 55,
          label: 'Triangle rectangle (équerre)',
          detail: 'On trace les deux côtés perpendiculaires [AB] et [AC] avec l’équerre, puis on relie B et C.',
        },
        {
          x: 50,
          y: 55,
          label: 'Triangle équilatéral (compas)',
          detail: 'On trace AB = 5 cm, puis deux arcs de rayon 5 cm centrés en A et B se coupent en C.',
        },
        {
          x: 82,
          y: 55,
          label: 'Triangle isocèle (compas)',
          detail: 'On trace la base AB = 8 cm, puis deux arcs de rayon 6 cm centrés en A et B pour placer C.',
        },
      ],
    },
    customSchematisationMath: CM1_S9_MATH_SCHEMATISATIONS['fiche-14'],
    etapes: [
      {
        etape: 'Prise en main',
        sousTitreInvariable: 'Chant court thématique & mise en disponibilité inclusive',
        duree: '3 min',
        activitesMaitre:
          'Q : Quel chant joyeux sur les fêtes allons-nous chanter ensemble ?\n• Lance un chant court et bat la mesure face aux élèves.',
        activitesEleves:
          'R : Nous chantons « … ».\n• Chante en chœur avec entrain (debout ou assis selon besoin).',
        indicateursInclusifs:
          '• Indicateur pédagogique : disponibilité immédiate de la classe · Contrôle Q/R : Q « Quel événement artistique préparons-nous ? » → R « La semaine artistique et culturelle ».\n[Inclusion handicap] Auditif/Moteur : rythme visible et posture libre.',
      },
      {
        etape: 'Contrôle du matériel',
        sousTitreInvariable: 'Vérification règle, compas, équerre & polygones carton',
        duree: '3 min',
        activitesMaitre:
          'Q1 : Montrez votre règle graduée, votre équerre, votre compas, votre crayon et votre ardoise.\nQ2 : Qui manque d’un instrument pour le partager en binôme ? Comment manipuler le compas en sécurité ?',
        activitesEleves:
          'R1 : Voici ma règle, mon équerre et mon compas.\nR2 : Je partage avec mon camarade et je garde la pointe du compas dirigée vers la feuille, jamais vers le voisin.',
        indicateursInclusifs:
          '• Indicateur pédagogique : sécurité du compas et partage complet · Contrôle Q/R : Q « Quels 3 instruments servent aujourd’hui ? » → R « Règle, équerre et compas ».\n[Inclusion handicap] Dyspraxie/Visuel : compas à molette bloquante et règle graduée contrastée.',
      },
      {
        etape: 'Éveil mathématique',
        sousTitreInvariable: 'Comptage de 50 en 50 de 0 à 500',
        duree: '4 min',
        activitesMaitre:
          '• Fait compter de 50 en 50 jusqu’à 500 puis à rebours.\nQ1 : Quel nombre suit 250 en avançant de 50 ?\nQ2 : Et juste avant 400 en reculant de 50 ?',
        activitesEleves:
          '• Compte collectivement : 0, 50, 100, …, 500 et de 500 à 0.\nR1 : 300.\nR2 : 350.',
        indicateursInclusifs:
          '• Indicateur pédagogique : rapidité de l’enchaînement oral · Contrôle Q/R : Q « Combien de bonds de 50 pour aller de 0 à 500 ? » → R « 10 bonds ».\n[Inclusion handicap] Dyscalculie : appui sur la bande des cinquantaines.',
      },
      {
        etape: 'Calcul mental',
        sousTitreInvariable: 'Division par 50 sur ardoise',
        duree: '5 min',
        activitesMaitre:
          '• Dicte (PLM) : 300 ÷ 50 ; 150 ÷ 50 ; 400 ÷ 50.\nQ1 : Quels résultats inscrivez-vous sur l’ardoise ?\nQ2 : Quelle opération vérifie 400 ÷ 50 = 8 ?',
        activitesEleves:
          '• Écrit sur ardoise au signal :\nR1 : 6 ; 3 ; 8.\nR2 : 8 × 50 = 400 (ou 400 ÷ 100 × 2 = 8).',
        indicateursInclusifs:
          '• Indicateur pédagogique : vérification instantanée PLM · Contrôle Q/R : Q « Que vaut 500 ÷ 50 ? » → R « 10 ».\n[Inclusion handicap] DYS/TDAH : temps de latence suffisant avant de lever l’ardoise.',
      },
      {
        etape: 'Révision',
        sousTitreInvariable: 'Propriétés du rectangle (4 côtés, 4 angles droits)',
        duree: '5 min',
        activitesMaitre:
          'Q1 : Combien de côtés, de sommets et d’angles possède un rectangle ?\nQ2 : Comment sont ses côtés opposés et ses 4 angles ?',
        activitesEleves:
          'R1 : Il a 4 côtés, 4 sommets et 4 angles.\nR2 : Ses côtés opposés sont égaux et parallèles, et ses 4 angles sont des angles droits (90°).',
        indicateursInclusifs:
          '• Indicateur pédagogique : maîtrise du vocabulaire côtés/sommets/angles · Contrôle Q/R : Q « Avec quel outil vérifie-t-on les 4 angles droits ? » → R « L’équerre ».\n[Inclusion handicap] Visuel/DYS : montrer un rectangle découpé et pointer les 4 angles droits.',
      },
      {
        etape: 'Situation problème',
        sousTitreInvariable: 'Semaine artistique : confectionner des éventails triangulaires',
        duree: '6 min',
        activitesMaitre:
          '• Présente la situation (p. 111) : Pour la semaine artistique, la classe fabrique des éventails décoratifs en papier kraft en forme de triangles réguliers.\n[Schématisation — Situation-problème des éventails] :\n  Lot de polygones (carrés, pentagones, triangles) ──Tri──▶ Figures à 3 côtés (triangles)\nQ1 : Quel polygone cherche-t-on pour fabriquer les éventails et comment le reconnaître ?\nQ2 : Comment réussir des triangles parfaitement réguliers sans tracer « au hasard » ?',
        activitesEleves:
          '• Observe le modèle d’éventail et reformule la tâche.\nR1 : Un triangle : une figure plane fermée qui a exactement 3 côtés, 3 sommets et 3 angles.\nR2 : Il faut utiliser l’équerre (pour l’angle droit) et le compas (pour reporter exactement les longueurs égales).',
        indicateursInclusifs:
          '• Indicateur pédagogique : compréhension du besoin d’instruments de géométrie · Contrôle Q/R : Q « Un cercle est-il un polygone ? » → R « Non, il n’a pas de côtés droits ».\n[Inclusion handicap] Auditif/TSA : montrer un vrai modèle d’éventail triangulaire déjà plié.',
      },
      {
        etape: 'Travail collectif – Manipulation',
        sousTitreInvariable: 'Tri de polygones prédécoupés & typologie des 3 triangles',
        duree: '10 min',
        activitesMaitre:
          '• Fait trier le lot de polygones prédécoupés en carton.\n[Schématisation — Tri tactile des 3 types de triangles] :\n  |\\          /\\  ← 2 côtés =       /\\  ← 3 côtés =\n  |_\\ (90°)  /__\\  (Isocèle)       /__\\  (Équilatéral)\n  Rectangle  (2 traits égaux)      (3 traits égaux)\nQ1 : Quels polygones appartiennent à la famille des triangles et lesquels écartes-tu ?\nQ2 : En vérifiant leurs angles à l’équerre et leurs côtés au compas, quelles trois sortes de triangles découvre-t-on ?',
        activitesEleves:
          '• Trie physiquement les pièces cartonnées, passe le doigt sur les 3 côtés et teste à l’équerre/au compas.\nR1 : On garde uniquement ceux qui ont 3 côtés, 3 sommets et 3 angles ; on écarte ceux à 4 ou 5 côtés.\nR2 : Le triangle rectangle (1 angle droit), le triangle isocèle (2 côtés égaux) et le triangle équilatéral (3 côtés égaux).',
        indicateursInclusifs:
          '• Indicateur pédagogique : tri exact + classification des 3 triangles · Contrôle Q/R : Q « Un triangle qui a ses 3 côtés différents s’appelle comment ? » → R « Triangle quelconque ».\n[Inclusion handicap] Visuel/Moteur : gabarit d’angle droit tactile et gommettes posées sur les côtés de même longueur.',
      },
      {
        etape: 'Travail collectif – Représentation / Abstraction',
        sousTitreInvariable: 'Programmes de construction à l’équerre et au compas',
        duree: '10 min',
        activitesMaitre:
          '• Modélise les 2 programmes de construction au tableau :\n[Schématisation — Programmes de tracé (Équerre & Compas)] :\n  A) Triangle rectangle : [AB] → Équerre en A → [AC] → Joindre [BC]\n  B) Équilatéral / Isocèle : Base [AB] → Arcs de compas depuis A et B → Sommet C = intersection → Relier [AC], [BC]\nQ1 : Dans quel ordre utilises-tu la règle et l’équerre pour construire le triangle rectangle ABC ?\nQ2 : Pourquoi le compas garantit-il que AC et BC ont exactement la longueur voulue ?',
        activitesEleves:
          '• Suit chaque geste sur ardoise/brouillon et verbalise l’étape.\nR1 : On trace [AB], on pose l’équerre en A pour tracer [AC] perpendiculaire, puis on relie B à C.\nR2 : Parce que tous les points d’un arc tracé depuis A (ou B) sont à la même distance du centre.',
        indicateursInclusifs:
          '• Indicateur pédagogique : respect séquentiel du programme de construction · Contrôle Q/R : Q « Que représente le croisement des deux arcs de compas ? » → R « Le troisième sommet C ».\n[Inclusion handicap] Dyspraxie/Moteur : montrer comment faire tourner la feuille sous le compas plutôt que de tordre le poignet.',
      },
      {
        etape: 'Travail en petits groupes / individuel',
        sousTitreInvariable: 'Motif sac kenté (équilatéral 5 cm) & isocèle (AB=8 cm, AC=BC=6 cm)',
        duree: '12 min',
        activitesMaitre:
          '• Petits groupes : Pour décorer un sac en tissu kenté, construisez un triangle équilatéral ABC de 5 cm de côté au compas.\n• Individuel : Construisez un triangle isocèle ABC tel que AB = 8 cm et AC = BC = 6 cm.\n[Schématisation — Sac kenté (5 cm) & Isocèle (8-6-6 cm)] :\n      C  ← intersection arcs 5 cm          C  ← intersection arcs 6 cm\n     / \\                                  /   \\\n  5 /   \\ 5  (3 traits =)              6 /     \\ 6  (2 traits =)\n   A──5──B                              A───8───B\nQ1 : Quelle ouverture de compas gardes-tu en A et en B pour le motif kenté ?\nQ2 : Pour l’isocèle, quelle base traces-tu d’abord à la règle et à quel rayon ouvres-tu le compas ?',
        activitesEleves:
          '• Construit en îlot le triangle équilatéral (5 cm) puis seul le triangle isocèle (8 cm ; 6 cm ; 6 cm) avec codage.\nR1 : On trace [AB] = 5 cm et on garde la même ouverture de 5 cm pour les deux arcs depuis A et B.\nR2 : Je trace d’abord la base AB = 8 cm à la règle, puis j’ouvre le compas à 6 cm pour tracer les deux arcs depuis A et B.',
        indicateursInclusifs:
          '• Indicateur pédagogique : arcs visibles, sommets nommés et codage des égalités exact · Contrôle Q/R : Q « Que vaut la longueur BC sur ton motif kenté ? » → R « 5 cm exactement ».\n[Inclusion handicap] Dyspraxie/Visuel : base [AB] pré-tracée sur fiche adaptée ou aide d’un pair pour tenir la règle.',
      },
      {
        etape: 'Exercices de consolidation et de contrôle',
        sousTitreInvariable: 'Plan à l’échelle d’un espace de manifestation (8 m × 12 m)',
        duree: '8 min',
        activitesMaitre:
          '• Problème (p. 112) : Un espace de manifestation a la forme d’un triangle rectangle dont les côtés de l’angle droit mesurent 8 m et 12 m. Représente-le à l’échelle 1 cm pour 1 m.\n[Schématisation — Plan à l’échelle 1 cm = 1 m] :\n  C\n  | \\   AC = 8 m → 8 cm\n  |  \\  AB = 12 m → 12 cm  (angle droit en A vérifié à l’équerre)\n  A───B\nQ1 : Quelles dimensions en centimètres traces-tu sur ton cahier pour 8 m et 12 m ?\nQ2 : Quel instrument assure l’angle droit entre les côtés de 8 cm et 12 cm ?',
        activitesEleves:
          '• Convertit et construit sur cahier à l’équerre et au double-décimètre.\nR1 : 8 m → 8 cm et 12 m → 12 cm.\nR2 : L’équerre posée en A, puis on trace l’hypoténuse [BC] (≈ 14,4 cm).',
        indicateursInclusifs:
          '• Indicateur pédagogique : angle droit précis + longueurs exactes à ± 1 mm · Contrôle Q/R : Q « Combien mesurerait un côté de 10 m à cette échelle ? » → R « 10 cm ».\n[Inclusion handicap] DYS/Visuel : papier quadrillé centimétré ou point A déjà repéré.',
      },
      {
        etape: 'Prolongement',
        sousTitreInvariable: 'Transfert — Activité 3 (manuel p. 112)',
        duree: '4 min',
        activitesMaitre:
          'Q : Comment résumes-tu la différence entre triangle rectangle, isocèle et équilatéral avant de faire l’activité 3 page 112 ?\n• Donne l’activité 3 page 112 et valorise les tracés soignés.',
        activitesEleves:
          'R : Rectangle = 1 angle droit ; isocèle = 2 côtés égaux ; équilatéral = 3 côtés égaux.\n• Note la référence de l’exercice et range ses outils.',
        indicateursInclusifs:
          '• Indicateur pédagogique : synthèse orale claire et référence notée · Contrôle Q/R : Q « Quel outil pour le triangle équilatéral ? » → R « Règle et compas ».\n[Inclusion handicap] Consigne écrite lisiblement au tableau et vérifiée.',
      },
    ],
    questionsReponses: [
      {
        question: 'Quelles sont les propriétés qui distinguent le triangle isocèle du triangle équilatéral ?',
        reponseAttendue: 'Le triangle isocèle a 2 côtés de même longueur (et 2 angles égaux), tandis que le triangle équilatéral a ses 3 côtés de même longueur.',
        indicePedagogique: 'Vérifie avec le compas combien de côtés gardent le même écartement.',
        difficulte: 'Fondamental',
      },
      {
        question: 'Pourquoi utilise-t-on le compas au lieu d’essayer à la règle seule pour construire un triangle équilatéral de 5 cm ?',
        reponseAttendue: 'Parce que l’intersection des deux arcs de rayon 5 cm centrés en A et B donne immédiatement le seul point C situé à exactement 5 cm des deux sommets à la fois.',
        indicePedagogique: 'Tous les points d’un arc tracé depuis A sont à la même distance de A.',
        difficulte: 'Approfondissement',
      },
      {
        question: 'Sur un plan à l’échelle 1 cm pour 1 m, quelles dimensions traces-tu pour un triangle rectangle de 8 m et 12 m ?',
        reponseAttendue: 'On trace deux côtés perpendiculaires (angle droit à l’équerre) de 8 cm et 12 cm, puis on relie leurs extrémités.',
        indicePedagogique: '1 m devient 1 cm : divise simplement les mètres par 1 pour lire en centimètres.',
        difficulte: 'Défi',
      },
    ],
    synthese: {
      resumeCle:
        'Un triangle est un polygone à 3 côtés, 3 sommets et 3 angles. On le construit à l’équerre s’il est rectangle, et au compas s’il est isocèle ou équilatéral.',
      traceEcriteEleve:
        'Triangle rectangle : 1 angle droit (équerre). Triangle isocèle : 2 côtés égaux (compas). Triangle équilatéral : 3 côtés égaux (compas).',
      motsCles: ['Polygone', 'Triangle rectangle', 'Triangle isocèle', 'Triangle équilatéral', 'Compas', 'Équerre'],
      prolongement: 'Activité 3 page 112 du manuel CM1.',
    },
  },
];
