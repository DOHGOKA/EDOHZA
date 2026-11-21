export type MatiereType =
  | 'Mathématiques'
  | 'Français'
  | 'Sciences humaines'
  | 'Sciences et Technologie'
  | 'Éducation Sociale'
  | 'Éducation Physique et Sportive'
  | 'Art Plastique'
  | 'Activité Manuelle'
  | 'Remédiation'
  | 'Histoire-Géographie'
  | 'Langues vivantes'
  | 'Éducation Civique et Morale'
  | 'Arts et Culture'
  | 'Autre';

export type NiveauType =
  | 'CP'
  | 'CE1'
  | 'CE2'
  | 'CM1'
  | 'CM2'
  | '6ème'
  | '5ème'
  | '4ème'
  | '3ème'
  | 'Lycée';

export type ManipulableType =
  | 'fractions'
  | 'balance_algebre'
  | 'geometrie_aire'
  | 'droite_graduee'
  | 'proportionnalite';

export type ReasoningQuality = 'rapide' | 'equilibre' | 'expert';

export type HandicapProfileId =
  | 'visuel'
  | 'auditif'
  | 'moteur'
  | 'dys_tdah'
  | 'tsa_cognitif';

export interface HandicapProfileSpec {
  id: HandicapProfileId;
  nom: string;
  court: string;
  description: string;
  amenagementsMateriel: string;
  amenagementsMaitre: string;
  amenagementsEleve: string;
  indicateursInclusifsCles: string;
}

export interface EtapePedagogique {
  id: string;
  etape: string;
  sousTitreInvariable?: string;
  duree: string;
  activitesMaitre: string;
  activitesEleves: string;
  indicateursInclusifs: string;
  indicateurValide?: boolean;
}

export interface QuestionReponse {
  id: string;
  question: string;
  reponseAttendue: string;
  indicePedagogique: string;
  difficulte: 'Fondamental' | 'Approfondissement' | 'Défi';
}

export interface AnnotationSchema {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}

export interface IllustrationFiche {
  titre: string;
  legende: string;
  typeSchema: 'svg' | 'graphique' | 'carte_mentale' | 'geometrie';
  svgCode: string;
  annotations: AnnotationSchema[];
}

export interface ObjetManipulable {
  actif: boolean;
  type: ManipulableType;
  titre: string;
  consigne: string;
  parametres: {
    valeurA: number;
    valeurB: number;
    denominateur?: number;
    unite?: string;
  };
}

export interface SuggestionIA {
  id: string;
  categorie: 'Clarté' | 'Inclusion' | 'Différenciation' | 'Évaluation' | 'Illustration';
  titre: string;
  constat: string;
  proposition: string;
  appliquee: boolean;
}

export interface HistoriqueRevision {
  id: string;
  date: string;
  action: string;
  resume: string;
  snapshot?: string;
}

export interface PreferenceApprentissage {
  id: string;
  date: string;
  regle: string;
  source: string;
}

export interface ChatAttachment {
  type: 'text' | 'image' | 'audio';
  name: string;
  previewText?: string;
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: ChatAttachment;
  actionType?: 'none' | 'create_fiche' | 'update_fiche';
  ficheTitle?: string;
  timestamp: string;
}

export type CbMathType = 'CB1' | 'CB2' | 'CB3';

export interface ExerciceProgressifPhase {
  id: string;
  palier: 'Palier 1 · Découverte' | 'Palier 2 · Entraînement' | 'Palier 3 · Défi';
  type: 'choix' | 'saisie';
  consigne: string;
  donneesConcretes: string;
  choix?: string[];
  reponseAttendue: string;
  unite?: string;
  indice: string;
  explication: string;
  lienSituationProbleme: string;
}

export interface QuestionReponsePhase {
  id: string;
  question: string;
  reponseAttendue: string;
  indice: string;
  ancrageThemeTitreSituation: string;
}

export interface PhaseManipulationMath {
  phase: 'collective' | 'petits_groupes' | 'individuelle';
  titrePhase: string;
  modalite: string;
  donneesConcretes: string;
  materielConcret: string;
  actionSchemaEleve: string;
  etayageInclusifAPC: string;
  svgSchemaCode: string;
  exercicesProgressifs?: ExerciceProgressifPhase[];
  questionsReponsesPhase?: QuestionReponsePhase[];
}

export type PhaseManipulation = PhaseManipulationMath;

export interface SchematisationMathPhases {
  actif: boolean;
  cbCode: CbMathType;
  cbLibelle: string;
  situationProblemeReference: string;
  titreLeconReference: string;
  phases: PhaseManipulationMath[];
  synthesePassageAbstraction: string;
}

export interface EleveSuiviAPC {
  id: string;
  prenom: string;
  besoinSpecifique: string;
  objectifIndividuel: string;
  statut: 'en_cours' | 'acquis' | 'a_consolider';
}

export type RetouchScope =
  | 'contenu_etapes'
  | 'cadre_apc'
  | 'inclusion_handicap'
  | 'qr_evaluation'
  | 'schematisation_math'
  | 'complet';

export interface FichierSourceMetadata {
  nom: string;
  format: 'docx' | 'pdf' | 'text' | 'image' | 'json';
  importeLe: string;
  action: 'creation' | 'retouche';
  tailleOctets?: number;
}

export interface DerniereRetoucheMetadata {
  date: string;
  scope: RetouchScope;
  resume: string;
  sectionsModifiees: string[];
  fichierAppui?: string;
}

export interface FicheAPC {
  id: string;
  disciplineId?: string;
  origineModele?: string;
  fichierSource?: FichierSourceMetadata;
  derniereRetouche?: DerniereRetoucheMetadata;
  handicapsInclus?: HandicapProfileId[];
  titre: string;
  theme: string;
  matiere: MatiereType | string;
  niveau: NiveauType | string;
  duree: string;
  effectif: string;
  competenceDeBase?: string;
  competenceVisee: string;
  objectifsSpecifiques: string[];
  prerequis: string[];
  materiel: string[];
  introduction: {
    accroche: string;
    miseEnSituation: string;
    consigneDepart: string;
  };
  deroulement: EtapePedagogique[];
  questionsReponses: QuestionReponse[];
  illustration: IllustrationFiche;
  objetManipulable: ObjetManipulable;
  schematisationMath?: SchematisationMathPhases;
  phasesManipulation?: SchematisationMathPhases;
  synthese: {
    resumeCle: string;
    traceEcriteEleve: string;
    motsCles: string[];
    prolongement: string;
  };
  eleves?: EleveSuiviAPC[];
  observations?: string;
  suggestionsIA: SuggestionIA[];
  historique: HistoriqueRevision[];
  modeCreation: 'ia' | 'import' | 'manuel';
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceTab =
  | 'workspace'
  | 'library'
  | 'generator'
  | 'editor'
  | 'import-export';

export type DomaineModele =
  | 'Mathématiques'
  | 'Français'
  | 'Sciences humaines'
  | 'Sciences & Technologie'
  | 'Éducation & Vie sociale'
  | 'Arts, EPS & Activité manuelle'
  | 'Remédiation'
  | 'Langues';

export interface DisciplineStepSpec {
  etape: string;
  sousTitreInvariable: string;
  duree: string;
  focusInclusif: string;
}

export interface DisciplineProfileAPC {
  id: string;
  nom: string;
  sousLabel: string;
  domaine: DomaineModele;
  matiere: MatiereType;
  cbPrefixe: string;
  piliersInclusifsAPC: string[];
  etapesCanoniques: DisciplineStepSpec[];
}

export interface ModeleFicheAPC {
  id: string;
  nom: string;
  sousLabel?: string;
  collection?: 'general' | 'cm1_s9';
  ficheNumero?: number;
  disciplineSpecifiqueId?: string;
  origineModele?: string;
  handicapsInclus?: HandicapProfileId[];
  domaine: DomaineModele;
  matiere: MatiereType;
  niveauParDefaut: NiveauType;
  dureeParDefaut: string;
  description: string;
  competenceDeBaseModele: string;
  competenceViseeModele: string;
  titreSuggere: string;
  themeSuggere: string;
  objectifsSpecifiques: string[];
  prerequis: string[];
  materielSuggere: string[];
  introduction: {
    accroche: string;
    miseEnSituation: string;
    consigneDepart: string;
  };
  includeManipulable: boolean;
  manipulableType?: ManipulableType;
  etapes: Array<{
    etape: string;
    sousTitreInvariable: string;
    duree: string;
    activitesMaitre: string;
    activitesEleves: string;
    indicateursInclusifs: string;
  }>;
  questionsReponses: Array<{
    question: string;
    reponseAttendue: string;
    indicePedagogique: string;
    difficulte: 'Fondamental' | 'Approfondissement' | 'Défi';
  }>;
  customIllustration?: {
    titre: string;
    legende: string;
    typeSchema: 'svg' | 'graphique' | 'carte_mentale' | 'geometrie';
    svgCode: string;
    annotations: Array<{
      x: number;
      y: number;
      label: string;
      detail: string;
    }>;
  };
  customSchematisationMath?: SchematisationMathPhases;
  synthese: {
    resumeCle: string;
    traceEcriteEleve: string;
    motsCles: string[];
    prolongement: string;
  };
}


