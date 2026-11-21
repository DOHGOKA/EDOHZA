'use client';

import React, { useRef, useState } from 'react';
import {
  Accessibility,
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Bot,
  Check,
  CheckSquare,
  Edit3,
  Eye,
  FileDown,
  FileText,
  FolderOpen,
  History,
  Lightbulb,
  Loader2,
  Lock,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Square,
  Trash2,
  Unlock,
  Volume2,
  Wand2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  EtapePedagogique,
  FicheAPC,
  HandicapProfileId,
  PreferenceApprentissage,
  QuestionReponse,
  ReasoningQuality,
  RetouchScope,
  SuggestionIA,
} from '@/lib/types';
import {
  createCompactSnapshot,
  inferInvariantSubtitle,
  normalizeFiche,
} from '@/lib/storage';
import {
  DISCIPLINE_DOMAINS,
  DISCIPLINE_PROFILES,
  alignFicheToDisciplineSubtitles,
  findDisciplineProfile,
} from '@/lib/disciplines';
import {
  HANDICAP_PROFILES,
  applyLocalHandicapInclusion,
  formatHandicapSummary,
  normalizeHandicapProfiles,
} from '@/lib/inclusion';
import { applyFullDisciplineTemplateToFiche } from '@/lib/templates';
import {
  getEffectiveManipulationSchematisation,
  mapPhasesToDeroulementSteps,
} from '@/lib/manipulation-phases';
import { createUid } from '@/lib/utils';
import { postJson } from '@/lib/api-client';
import { readAnyUploadedFile, UNIVERSAL_FILE_ACCEPT } from '@/lib/file-reader';
import { sanitizeSvg } from '@/lib/svg-sanitize';
import MathManipulative from './MathManipulative';
import MathSchematisationPanel from './MathSchematisationPanel';
import PhaseManipulationInteractiveDeck from './PhaseManipulationInteractiveDeck';
import PedagogicalChatbot from './PedagogicalChatbot';
import VoiceDictationButton from './VoiceDictationButton';
import FicheTtsPlayer from './FicheTtsPlayer';
import type { PreviewExportAction } from './PrintPreviewModal';

interface EditorViewProps {
  fiche: FicheAPC;
  allFiches: FicheAPC[];
  isOnline: boolean;
  preferences: PreferenceApprentissage[];
  onUpdateFiche: (updated: FicheAPC) => void;
  onSelectFiche: (id: string) => void;
  onRenameFiche: (id: string, newTitle: string) => void;
  onSaveFicheAsNew: (
    source: FicheAPC,
    customTitle?: string,
    openSaved?: boolean
  ) => void;
  onFicheCreated: (created: FicheAPC) => void;
  onLearnPreference: (regle: string, source: string) => void;
  onExportDocx: (fiche: FicheAPC) => Promise<void>;
  onExportPdf: (fiche: FicheAPC) => Promise<void>;
  onOpenPrintPreview?: (fiche: FicheAPC, action: PreviewExportAction) => void;
}

const QUICK_RETOUCHES = [
  'Renforcer les adaptations DYS et TDAH dans les indicateurs inclusifs',
  'Simplifier les consignes du maître en phrases courtes numérotées',
  'Ajouter une étape de pause active / manipulation concrète de 5 min',
  'Enrichir les questions-réponses interactives et les relier aux étapes',
];

const RETOUCH_SCOPE_OPTIONS: { value: RetouchScope; label: string; hint: string }[] = [
  {
    value: 'contenu_etapes',
    label: 'Contenu des étapes (Activités M/É & Indicateurs)',
    hint: 'Protège l’en-tête, la CB, le titre et la structure.',
  },
  {
    value: 'cadre_apc',
    label: 'En-tête & Cadre APC (CB, objectifs, mise en situation)',
    hint: 'Protège les étapes du déroulement et les Q&R.',
  },
  {
    value: 'inclusion_handicap',
    label: 'Adaptations d’inclusion handicap',
    hint: 'Renforce matériel adapté, gestes et indicateurs inclusifs.',
  },
  {
    value: 'qr_evaluation',
    label: 'Questions-réponses & évaluation interactive',
    hint: 'Met à jour uniquement les paliers de Q&R.',
  },
  {
    value: 'schematisation_math',
    label: 'Schématisation Mathématiques (3 phases)',
    hint: 'Actualise uniquement les schémas et manipulations Math.',
  },
  {
    value: 'complet',
    label: 'Fiche complète (toutes sections)',
    hint: 'Autorise la mise à jour cohérente de toute la fiche.',
  },
];

export default function EditorView({
  fiche,
  allFiches,
  isOnline,
  preferences,
  onUpdateFiche,
  onSelectFiche,
  onRenameFiche,
  onSaveFicheAsNew,
  onFicheCreated,
  onLearnPreference,
  onExportDocx,
  onExportPdf,
  onOpenPrintPreview,
}: EditorViewProps) {
  const [assistantTab, setAssistantTab] = useState<'retouch' | 'chatbot' | 'suggestions' | 'history'>('retouch');
  const [retouchSubMode, setRetouchSubMode] = useState<'discipline' | 'targeted'>('discipline');
  const [disciplineDomainFilter, setDisciplineDomainFilter] = useState<string>('Tous');
  const [selectedRetouchDisciplineId, setSelectedRetouchDisciplineId] = useState<string>(
    () => findDisciplineProfile(fiche.disciplineId || fiche.matiere, fiche.titre).id
  );
  const [disciplineRetouchInstruction, setDisciplineRetouchInstruction] = useState('');
  const [regenerateSchemaOnDiscipline, setRegenerateSchemaOnDiscipline] = useState(false);
  const [quality, setQuality] = useState<ReasoningQuality>('expert');
  const [lockInvariantSubtitles, setLockInvariantSubtitles] = useState(true);
  const [retouchScope, setRetouchScope] = useState<RetouchScope>('contenu_etapes');
  const [instruction, setInstruction] = useState('');
  const [retouchFile, setRetouchFile] = useState<{
    format: 'docx' | 'pdf' | 'text' | 'image';
    fileName: string;
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    tailleOctets?: number;
  } | null>(null);
  const retouchFileInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [retouchingStepIdx, setRetouchingStepIdx] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [enrichingQr, setEnrichingQr] = useState(false);
  const [exportingType, setExportingType] = useState<'docx' | 'pdf' | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [lastModifiedSections, setLastModifiedSections] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    fiche.illustration?.annotations?.[0]?.id || null
  );
  const [qrFilter, setQrFilter] = useState<string>('Toutes');
  const [qrMode, setQrMode] = useState<'interactif' | 'edition'>('interactif');
  const [qrSessionState, setQrSessionState] = useState<
    Record<
      string,
      {
        studentAnswer: string;
        showHint: boolean;
        showAnswer: boolean;
        status?: 'acquis' | 'revoir';
      }
    >
  >({});
  const [showSaveAsBar, setShowSaveAsBar] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [snapshotNameInput, setSnapshotNameInput] = useState('');
  const [renamingHistId, setRenamingHistId] = useState<string | null>(null);
  const [renamingHistText, setRenamingHistText] = useState('');
  const [renamingFicheId, setRenamingFicheId] = useState<string | null>(null);
  const [renamingFicheTitle, setRenamingFicheTitle] = useState('');
  const [showTtsPlayer, setShowTtsPlayer] = useState(false);

  const activeDiscipline = findDisciplineProfile(
    fiche.disciplineId || fiche.matiere,
    fiche.titre
  );
  const targetRetouchDiscipline = findDisciplineProfile(
    selectedRetouchDisciplineId
  );

  const selectedHandicaps = normalizeHandicapProfiles(fiche.handicapsInclus);
  const activeManipulation = getEffectiveManipulationSchematisation(fiche);
  const { stepPhaseMap, unmappedPhases } = mapPhasesToDeroulementSteps(
    fiche.deroulement || [],
    activeManipulation?.phases || []
  );
  const situationRef =
    activeManipulation?.situationProblemeReference ||
    fiche.introduction?.accroche ||
    fiche.introduction?.miseEnSituation ||
    '';

  const touch = (patch: Partial<FicheAPC>) => {
    onUpdateFiche({
      ...fiche,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleHandicapProfile = (id: HandicapProfileId) => {
    const exists = selectedHandicaps.includes(id);
    if (exists && selectedHandicaps.length <= 1) {
      return;
    }
    const next = exists
      ? selectedHandicaps.filter((p) => p !== id)
      : [...selectedHandicaps, id];
    touch({ handicapsInclus: next });
  };

  const applyLocalInclusion = () => {
    const updated = applyLocalHandicapInclusion(fiche, selectedHandicaps);
    onUpdateFiche(updated);
    setAiFeedback(
      `Adaptations handicap (${selectedHandicaps.length} profils) intégrées localement dans les indicateurs inclusifs.`
    );
  };

  const updateStep = (
    stepId: string,
    field: keyof EtapePedagogique,
    value: string | boolean
  ) => {
    const next = fiche.deroulement.map((s) =>
      s.id === stepId ? { ...s, [field]: value } : s
    );
    touch({ deroulement: next });
  };

  const moveStep = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= fiche.deroulement.length) return;
    const copy = [...fiche.deroulement];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    touch({ deroulement: copy });
  };

  const removeStep = (stepId: string) => {
    if (fiche.deroulement.length <= 1) return;
    touch({ deroulement: fiche.deroulement.filter((s) => s.id !== stepId) });
  };

  const addStep = () => {
    const idx = fiche.deroulement.length;
    const canonical = activeDiscipline.etapesCanoniques[idx];
    const etapeLabel = canonical?.etape || `${idx + 1}. Nouvelle étape`;
    const newStep: EtapePedagogique = {
      id: createUid('step'),
      etape: etapeLabel,
      sousTitreInvariable: inferInvariantSubtitle(
        etapeLabel,
        idx,
        activeDiscipline.id
      ),
      duree: canonical?.duree || '8 min',
      activitesMaitre: 'Consigne et étayage du maître.',
      activitesEleves: 'Tâche active et manipulation des élèves.',
      indicateursInclusifs:
        canonical?.focusInclusif ||
        'Critère de réussite observable et adaptation prévue.',
      indicateurValide: false,
    };
    touch({ deroulement: [...fiche.deroulement, newStep] });
  };

  const updateQuestion = (
    qrId: string,
    field: keyof QuestionReponse,
    value: string
  ) => {
    const next = fiche.questionsReponses.map((q) =>
      q.id === qrId ? { ...q, [field]: value } : q
    );
    touch({ questionsReponses: next });
  };

  const addQuestion = () => {
    const next: QuestionReponse = {
      id: createUid('qr'),
      question: 'Nouvelle question de vérification',
      reponseAttendue: 'Réponse attendue formulée par l’élève.',
      indicePedagogique: 'Indice d’étayage oral ou visuel.',
      difficulte: 'Fondamental',
    };
    touch({ questionsReponses: [...fiche.questionsReponses, next] });
  };

  const removeQuestion = (qrId: string) => {
    touch({
      questionsReponses: fiche.questionsReponses.filter((q) => q.id !== qrId),
    });
  };

  const saveManualSnapshot = (customLabel?: string) => {
    const now = new Date().toISOString();
    const snap = createCompactSnapshot(fiche);
    const label = customLabel?.trim() || 'Point de sauvegarde';
    touch({
      historique: [
        {
          id: createUid('hist'),
          date: now,
          action: label,
          resume: `Fiche « ${fiche.titre} » sauvegardée (${fiche.deroulement.length} étapes).`,
          snapshot: snap,
        },
        ...fiche.historique.slice(0, 19),
      ],
    });
    setSnapshotNameInput('');
    setAiFeedback(`Version « ${label} » sauvegardée dans l’historique.`);
  };

  const renameHistoryItem = (histId: string, newAction: string) => {
    const trimmed = newAction.trim();
    if (!trimmed) return;
    touch({
      historique: fiche.historique.map((h) =>
        h.id === histId ? { ...h, action: trimmed } : h
      ),
    });
    setRenamingHistId(null);
    setRenamingHistText('');
    setAiFeedback(`Sauvegarde renommée en « ${trimmed} ».`);
  };

  const deleteHistoryItem = (histId: string) => {
    touch({
      historique: fiche.historique.filter((h) => h.id !== histId),
    });
  };

  const restoreSnapshot = (snapshotJson: string, label: string) => {
    try {
      const restored = JSON.parse(snapshotJson) as Omit<FicheAPC, 'historique'>;
      const now = new Date().toISOString();
      const currentSnapshot = createCompactSnapshot(fiche);
      onUpdateFiche({
        ...restored,
        id: fiche.id,
        historique: [
          {
            id: createUid('hist'),
            date: now,
            action: 'Restauration',
            resume: `Version restaurée depuis « ${label} ».`,
            snapshot: currentSnapshot,
          },
          ...fiche.historique.slice(0, 14),
        ],
        updatedAt: now,
      });
      setAiFeedback(`Version « ${label} » restaurée avec succès.`);
    } catch {
      setAiError('Impossible de restaurer cette version.');
    }
  };

  const handleRetouchFilePick = async (file: File) => {
    setAiError(null);
    try {
      const parsed = await readAnyUploadedFile(file, {
        maxBytes: 10 * 1024 * 1024,
      });
      if (parsed.kind === 'json' && parsed.jsonFiches?.[0]) {
        const jf = parsed.jsonFiches[0];
        setRetouchFile({
          format: 'text',
          fileName: parsed.fileName,
          textContent: `Titre: ${jf.titre}\nThème: ${jf.theme}\nCB: ${jf.competenceDeBase || ''}\n${jf.deroulement
            .map((s) => `${s.etape}: ${s.activitesMaitre} / ${s.activitesEleves}`)
            .join('\n')}`,
          tailleOctets: parsed.fileSize,
        });
        return;
      }
      if (parsed.apiFormat === 'pdf' || parsed.apiFormat === 'image') {
        setRetouchFile({
          format: parsed.apiFormat,
          fileName: parsed.fileName,
          base64Data: parsed.base64Data,
          mimeType: parsed.mimeType,
          tailleOctets: parsed.fileSize,
        });
        return;
      }
      setRetouchFile({
        format: parsed.apiFormat === 'docx' ? 'docx' : 'text',
        fileName: parsed.fileName,
        textContent: parsed.textContent || '',
        tailleOctets: parsed.fileSize,
      });
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Impossible de lire le fichier d’appui sélectionné.'
      );
    }
  };

  const runAiRetouch = async (
    promptText: string,
    appliedSuggestionId?: string,
    targetStepIndex?: number,
    scopeOverride?: RetouchScope
  ) => {
    const activeSourceFile =
      typeof targetStepIndex === 'number' ? null : retouchFile;
    if ((!promptText.trim() && !activeSourceFile) || !isOnline) return;
    setAiError(null);
    setAiFeedback(null);
    setLastModifiedSections([]);
    setAiLoading(true);
    if (typeof targetStepIndex === 'number') {
      setRetouchingStepIdx(targetStepIndex);
    }

    const effectiveScope: RetouchScope =
      typeof targetStepIndex === 'number'
        ? 'contenu_etapes'
        : scopeOverride || retouchScope;

    try {
      const data = await postJson<{
        fiche: FicheAPC;
        resumeModifications?: string;
        sectionsModifiees?: string[];
        regleApprentissage?: string;
      }>('/api/apc/retouch', {
        mode: 'modify',
        fiche,
        disciplineId: activeDiscipline.id,
        instruction: promptText.trim(),
        retouchScope: effectiveScope,
        appliedSuggestionId,
        sourceFile: activeSourceFile,
        preferences,
        quality,
        preserveInvariantSubtitles: lockInvariantSubtitles,
        targetStepIndex,
        handicapProfiles: selectedHandicaps,
        hauteGamme: quality === 'expert',
      });

      const updatedFiche: FicheAPC = normalizeFiche(data.fiche);
      if (appliedSuggestionId) {
        updatedFiche.suggestionsIA = (updatedFiche.suggestionsIA || []).map((s) =>
          s.id === appliedSuggestionId ? { ...s, appliquee: true } : s
        );
      }

      onUpdateFiche(updatedFiche);
      setLastModifiedSections(
        Array.isArray(data.sectionsModifiees) ? data.sectionsModifiees : []
      );
      setAiFeedback(data.resumeModifications || 'Fiche mise à jour.');
      if (data.regleApprentissage && data.regleApprentissage.trim().length > 8) {
        onLearnPreference(
          data.regleApprentissage.trim(),
          `Retouche sur « ${fiche.titre.slice(0, 28)} »`
        );
      }
      if (!appliedSuggestionId && typeof targetStepIndex !== 'number') {
        setInstruction('');
        setRetouchFile(null);
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Erreur lors de la retouche IA.'
      );
    } finally {
      setAiLoading(false);
      setRetouchingStepIdx(null);
    }
  };

  const runDisciplineFullRetouch = async () => {
    if (!isOnline) return;
    setAiError(null);
    setAiFeedback(null);
    setLastModifiedSections([]);
    setAiLoading(true);

    try {
      const data = await postJson<{
        fiche: FicheAPC;
        resumeModifications?: string;
        sectionsModifiees?: string[];
        regleApprentissage?: string;
      }>('/api/apc/retouch', {
        mode: 'retouch_discipline',
        fiche,
        disciplineId: targetRetouchDiscipline.id,
        instruction: disciplineRetouchInstruction.trim(),
        preferences,
        quality,
        preserveInvariantSubtitles: lockInvariantSubtitles,
        regenerateDiagram: regenerateSchemaOnDiscipline,
        handicapProfiles: selectedHandicaps,
        hauteGamme: true,
      });
      onUpdateFiche(normalizeFiche(data.fiche));
      setSelectedRetouchDisciplineId(targetRetouchDiscipline.id);
      setLastModifiedSections(
        Array.isArray(data.sectionsModifiees) ? data.sectionsModifiees : []
      );
      setAiFeedback(
        data.resumeModifications ||
          `Fiche complète retouchée pour « ${targetRetouchDiscipline.nom} ».`
      );
      if (data.regleApprentissage && data.regleApprentissage.trim().length > 8) {
        onLearnPreference(
          data.regleApprentissage.trim(),
          `Retouche ${targetRetouchDiscipline.nom}`
        );
      }
      setDisciplineRetouchInstruction('');
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la retouche disciplinaire complète.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const applyLocalDisciplineSubtitles = (
    profile = activeDiscipline,
    updateStepTitles = false
  ) => {
    const aligned = alignFicheToDisciplineSubtitles(fiche, profile, {
      updateStepTitles,
    });
    onUpdateFiche(aligned);
    setSelectedRetouchDisciplineId(profile.id);
    setAiFeedback(
      `Sous-titres d’étapes alignés sur le référentiel « ${profile.nom} ».`
    );
  };

  const applyFullDisciplineContent = (profile = targetRetouchDiscipline) => {
    const templated = applyFullDisciplineTemplateToFiche(fiche, profile.id);
    const withInclusion =
      selectedHandicaps.length > 0
        ? applyLocalHandicapInclusion(templated, selectedHandicaps)
        : templated;
    onUpdateFiche(withInclusion);
    setSelectedRetouchDisciplineId(profile.id);
    setAiFeedback(
      `Trame complète appliquée pour « ${profile.nom} » : Activités du maître, Activités de l’élève, Indicateurs pédagogiques inclusifs et Questions-Réponses (3 paliers).`
    );
  };

  const runHauteGammeInclusionRetouch = async () => {
    if (!isOnline) {
      applyLocalInclusion();
      return;
    }
    setAiError(null);
    setAiFeedback(null);
    setAiLoading(true);
    try {
      const data = await postJson<{
        fiche: FicheAPC;
        resumeModifications?: string;
        regleApprentissage?: string;
      }>('/api/apc/retouch', {
        mode: 'retouch_discipline',
        fiche,
        disciplineId: activeDiscipline.id,
        instruction:
          'Retouche qualité haute gamme : enrichir chaque étape (Activités du maître, Activités des élèves, Indicateurs pédagogiques inclusifs), les Q&R et la synthèse pour inclure les enfants en situation de handicap sélectionnés tout en respectant strictement la discipline spécifique.',
        preferences,
        quality: 'expert',
        preserveInvariantSubtitles: lockInvariantSubtitles,
        handicapProfiles: selectedHandicaps,
        hauteGamme: true,
      });
      onUpdateFiche(normalizeFiche(data.fiche));
      setAiFeedback(
        data.resumeModifications ||
          `Fiche retouchée en qualité haute gamme avec inclusion handicap (${activeDiscipline.nom}).`
      );
      if (data.regleApprentissage && data.regleApprentissage.trim().length > 8) {
        onLearnPreference(
          data.regleApprentissage.trim(),
          `Inclusion Haute Gamme (${activeDiscipline.nom})`
        );
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la retouche inclusion Haute Gamme.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const runEnrichQr = async () => {
    if (!isOnline) return;
    setAiError(null);
    setAiFeedback(null);
    setEnrichingQr(true);

    try {
      const data = await postJson<{
        fiche: FicheAPC;
        resumeModifications?: string;
      }>('/api/apc/retouch', {
        mode: 'enrich_qr',
        fiche,
        preferences,
        quality,
        handicapProfiles: selectedHandicaps,
      });
      onUpdateFiche(normalizeFiche(data.fiche));
      setAiFeedback(data.resumeModifications || 'Questions-réponses enrichies.');
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Erreur lors de l’enrichissement Q&R.'
      );
    } finally {
      setEnrichingQr(false);
    }
  };

  const runAiAnalyze = async () => {
    if (!isOnline) return;
    setAiError(null);
    setAnalyzing(true);

    try {
      const data = await postJson<{
        diagnosticGlobal?: string;
        suggestions?: SuggestionIA[];
      }>('/api/apc/retouch', {
        mode: 'analyze',
        fiche,
        preferences,
        quality,
        handicapProfiles: selectedHandicaps,
        hauteGamme: true,
      });
      setDiagnostic(data.diagnosticGlobal || null);
      touch({ suggestionsIA: Array.isArray(data.suggestions) ? data.suggestions : [] });
      setAssistantTab('suggestions');
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Erreur lors de l’analyse.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const requestExportWithPreview = async (type: PreviewExportAction) => {
    if (onOpenPrintPreview) {
      onOpenPrintPreview(fiche, type);
      return;
    }
    if (type === 'print') {
      window.print();
      return;
    }
    if (type === 'preview') return;
    setExportingType(type);
    setAiError(null);
    try {
      if (type === 'docx') {
        await onExportDocx(fiche);
      } else {
        await onExportPdf(fiche);
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Erreur lors de l’export.'
      );
    } finally {
      setExportingType(null);
    }
  };

  const applySuggestion = (sug: SuggestionIA) => {
    runAiRetouch(
      `Applique cette amélioration pédagogique (${sug.categorie}) : ${sug.titre}. ${sug.proposition}`,
      sug.id,
      undefined,
      'complet'
    );
  };

  const ignoreSuggestion = (sugId: string) => {
    touch({
      suggestionsIA: (fiche.suggestionsIA || []).filter((s) => s.id !== sugId),
    });
  };

  const questionsList = fiche.questionsReponses || [];
  const filteredQuestions =
    qrFilter === 'Toutes'
      ? questionsList
      : questionsList.filter((q) => q.difficulte === qrFilter);

  const annotationsList = fiche.illustration?.annotations || [];
  const activeAnnotation =
    annotationsList.find((a) => a.id === activeAnnotationId) ||
    annotationsList[0] ||
    null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Editor Sub-Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-lg px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-sky-700">{fiche.matiere}</span>
            <span aria-hidden="true">·</span>
            <span>{fiche.niveau}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{fiche.duree}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{fiche.deroulement.length} étapes</span>
            {fiche.origineModele && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700 font-medium">{fiche.origineModele}</span>
              </>
            )}
          </div>
          <h1 className="text-lg font-semibold text-slate-900 truncate mt-0.5">
            {fiche.titre}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => saveManualSnapshot(`Sauvegarde — ${fiche.titre.slice(0, 28)}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={() => {
              setSaveAsName(`${fiche.titre} (copie)`);
              setShowSaveAsBar((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-sky-600" />
            Enregistrer sous…
          </button>
          <button
            type="button"
            onClick={runAiAnalyze}
            disabled={analyzing || !isOnline}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {analyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Analyser avec l’IA
          </button>
          <button
            type="button"
            onClick={() => requestExportWithPreview('preview')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            Aperçu A4
          </button>
          <button
            type="button"
            onClick={() => requestExportWithPreview('docx')}
            disabled={exportingType !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {exportingType === 'docx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            Word (.docx)
          </button>
          <button
            type="button"
            onClick={() => requestExportWithPreview('pdf')}
            disabled={exportingType !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {exportingType === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            PDF
          </button>
          <button
            type="button"
            onClick={() => setShowTtsPlayer((v) => !v)}
            aria-pressed={showTtsPlayer}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showTtsPlayer
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            Écouter
          </button>
          <button
            type="button"
            onClick={() => requestExportWithPreview('print')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
        </div>
      </div>

      {showTtsPlayer && (
        <FicheTtsPlayer
          key={fiche.id}
          fiche={fiche}
          autoStart
          onClose={() => setShowTtsPlayer(false)}
        />
      )}

      {showSaveAsBar && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const targetName = saveAsName.trim() || `${fiche.titre} (sauvegarde)`;
            onSaveFicheAsNew(fiche, targetName, true);
            setShowSaveAsBar(false);
            setSaveAsName('');
            setAiFeedback(`Nouvelle fiche sauvegardée dans l’historique sous « ${targetName} ».`);
          }}
          className="no-print bg-white border border-sky-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <span className="text-xs font-semibold text-slate-700 shrink-0">
            Sauvegarder dans l’historique sous :
          </span>
          <input
            type="text"
            autoFocus
            value={saveAsName}
            onChange={(e) => setSaveAsName(e.target.value)}
            placeholder="Nom de la nouvelle fiche sauvegardée..."
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowSaveAsBar(false)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Dedicated Clean A4 Print Layout (Visible only on print, prevents textarea clipping) */}
      <div className="hidden print-only print-sheet space-y-5 text-slate-900">
        <div className="border-b border-slate-300 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
            Fiche pédagogique APC · {fiche.matiere} · {fiche.niveau}
          </p>
          <h1 className="text-2xl font-display font-bold mt-1">{fiche.titre}</h1>
          <p className="text-sm text-slate-600 italic mt-0.5">{fiche.theme}</p>
        </div>
        <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 p-3 bg-slate-50">
          <div><span className="text-slate-500 block">Matière</span><strong>{fiche.matiere}</strong></div>
          <div><span className="text-slate-500 block">Niveau</span><strong>{fiche.niveau}</strong></div>
          <div><span className="text-slate-500 block">Durée</span><strong className="font-mono">{fiche.duree}</strong></div>
          <div><span className="text-slate-500 block">Effectif</span><strong>{fiche.effectif}</strong></div>
        </div>
        <div className="text-xs space-y-1.5">
          {fiche.origineModele && (
            <p><strong>Référentiel modèle :</strong> {fiche.origineModele}</p>
          )}
          {fiche.competenceDeBase && (
            <p><strong>CB (Compétence de Base) :</strong> {fiche.competenceDeBase}</p>
          )}
          <p>
            <strong>Inclusion handicap (APC) :</strong>{' '}
            {formatHandicapSummary(fiche.handicapsInclus)}
          </p>
          <p><strong>Compétence visée :</strong> {fiche.competenceVisee}</p>
          <p><strong>Objectifs :</strong> {fiche.objectifsSpecifiques.filter(Boolean).join(' · ')}</p>
          {fiche.prerequis.length > 0 && (
            <p><strong>Prérequis :</strong> {fiche.prerequis.filter(Boolean).join(' · ')}</p>
          )}
          <p><strong>Matériel :</strong> {fiche.materiel.filter(Boolean).join(' · ')}</p>
          <p><strong>Accroche :</strong> {fiche.introduction.accroche}</p>
          <p><strong>Mise en situation :</strong> {fiche.introduction.miseEnSituation}</p>
          <p><strong>Consigne de départ :</strong> {fiche.introduction.consigneDepart}</p>
        </div>
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-900 text-white text-left">
              <th className="p-2 border border-slate-700 w-[18%]">Étapes</th>
              <th className="p-2 border border-slate-700 w-[28%]">Activités du maître</th>
              <th className="p-2 border border-slate-700 w-[27%]">Activités des élèves</th>
              <th className="p-2 border border-slate-700 w-[27%]">Indicateurs pédagogiques inclusifs</th>
            </tr>
          </thead>
          <tbody>
            {fiche.deroulement.map((s) => {
              const matchedPhases = stepPhaseMap.get(s.id) || [];
              return (
                <React.Fragment key={s.id}>
                  <tr>
                    <td className="p-2 border border-slate-300 align-top">
                      <div className="font-semibold">{s.etape}</div>
                      {s.sousTitreInvariable && (
                        <div className="text-[11px] italic text-slate-600 mt-0.5">
                          {s.sousTitreInvariable}
                        </div>
                      )}
                      <div className="font-mono text-[11px] text-sky-700 mt-0.5">{s.duree}</div>
                    </td>
                    <td className="p-2 border border-slate-300 align-top whitespace-pre-line">{s.activitesMaitre}</td>
                    <td className="p-2 border border-slate-300 align-top whitespace-pre-line">{s.activitesEleves}</td>
                    <td className="p-2 border border-slate-300 align-top whitespace-pre-line">{s.indicateursInclusifs}</td>
                  </tr>
                  {matchedPhases.length > 0 && (
                    <tr className="bg-slate-50/40">
                      <td colSpan={4} className="p-2 border border-slate-300">
                        <PhaseManipulationInteractiveDeck
                          ficheId={fiche.id}
                          theme={fiche.theme}
                          titre={fiche.titre}
                          situationProbleme={situationRef}
                          phases={matchedPhases}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {activeManipulation && (activeManipulation.phases || []).length > 0 && (
          <div className="space-y-2 border-t border-slate-300 pt-3">
            <h3 className="text-xs font-bold">
              {fiche.schematisationMath?.actif
                ? `Synthèse des manipulations & passage à l’abstraction (Mathématiques — ${activeManipulation.cbCode})`
                : `Synthèse des manipulations & transfert (${fiche.matiere || 'Discipline'})`}
            </h3>
            {unmappedPhases.length > 0 && (
              <PhaseManipulationInteractiveDeck
                ficheId={fiche.id}
                theme={fiche.theme}
                titre={fiche.titre}
                situationProbleme={situationRef}
                phases={unmappedPhases}
              />
            )}
            {activeManipulation.situationProblemeReference && (
              <p className="text-[11px]">
                <strong>Situation-problème de référence :</strong>{' '}
                {activeManipulation.situationProblemeReference}
              </p>
            )}
            {activeManipulation.synthesePassageAbstraction && (
              <p className="text-[11px]">
                <strong>Passage à l’abstraction :</strong>{' '}
                {activeManipulation.synthesePassageAbstraction}
              </p>
            )}
          </div>
        )}
        {fiche.illustration?.svgCode && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold">Illustration : {fiche.illustration.titre}</h3>
            <div
              className="border border-slate-300 p-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeSvg(fiche.illustration.svgCode),
              }}
            />
            <p className="text-[11px] italic text-center text-slate-600">{fiche.illustration.legende}</p>
          </div>
        )}
        <div className="text-xs space-y-1.5 border-t border-slate-300 pt-3">
          <p><strong>Synthèse :</strong> {fiche.synthese.resumeCle}</p>
          <p><strong>Trace écrite élève :</strong> {fiche.synthese.traceEcriteEleve}</p>
          <p><strong>Prolongement :</strong> {fiche.synthese.prolongement}</p>
          {fiche.observations?.trim() && (
            <p><strong>Observations de l’enseignant :</strong> {fiche.observations}</p>
          )}
        </div>
      </div>

      {/* Main Interactive Workspace (Screen only) */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left/Center Editable Sheet (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. Cadre & Metadata */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="border-b border-slate-200 pb-4 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                  Titre de la fiche APC
                </span>
                <input
                  type="text"
                  value={fiche.titre}
                  onChange={(e) => touch({ titre: e.target.value })}
                  className="mt-1 w-full text-2xl font-display font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-600 focus:outline-none pb-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Thème du programme</span>
                <input
                  type="text"
                  value={fiche.theme}
                  onChange={(e) => touch({ theme: e.target.value })}
                  className="mt-0.5 w-full text-sm text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-600 focus:outline-none pb-1"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <label className="block lg:col-span-2">
                <span className="text-xs font-medium text-slate-500">
                  Discipline spécifique APC (sous-titres &amp; inclusion)
                </span>
                <select
                  value={activeDiscipline.id}
                  onChange={(e) => {
                    const nextProfile = findDisciplineProfile(e.target.value);
                    applyLocalDisciplineSubtitles(nextProfile, false);
                  }}
                  className="mt-1 w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {DISCIPLINE_DOMAINS.map((dom) => {
                    const items = DISCIPLINE_PROFILES.filter(
                      (p) => p.domaine === dom
                    );
                    if (items.length === 0) return null;
                    return (
                      <optgroup key={dom} label={dom}>
                        {items.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nom}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Matière</span>
                <input
                  type="text"
                  value={fiche.matiere}
                  onChange={(e) => touch({ matiere: e.target.value })}
                  className="mt-1 w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Niveau</span>
                <input
                  type="text"
                  value={fiche.niveau}
                  onChange={(e) => touch({ niveau: e.target.value })}
                  className="mt-1 w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Durée</span>
                  <input
                    type="text"
                    value={fiche.duree}
                    onChange={(e) => touch({ duree: e.target.value })}
                    className="mt-1 w-full px-2.5 py-1.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Effectif</span>
                  <input
                    type="text"
                    value={fiche.effectif}
                    onChange={(e) => touch({ effectif: e.target.value })}
                    className="mt-1 w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5 leading-relaxed">
              <strong className="text-slate-900">
                Pédagogie inclusive APC ({activeDiscipline.nom}) :
              </strong>{' '}
              {activeDiscipline.piliersInclusifsAPC.join(' · ')}
            </div>

            <div className="border border-sky-200 bg-sky-50/40 rounded-md p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-sky-700 shrink-0" />
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900">
                      Inclusion des enfants en situation de handicap (Qualité Haute Gamme)
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      Cochez les profils à intégrer dans les activités et indicateurs inclusifs sans altérer la discipline spécifique.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={applyLocalInclusion}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors whitespace-nowrap"
                  >
                    Appliquer localement
                  </button>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={runHauteGammeInclusionRetouch}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Retouche Haute Gamme…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Retouche Haute Gamme IA (Discipline + Handicap)
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {HANDICAP_PROFILES.map((profile) => {
                  const active = selectedHandicaps.includes(profile.id);
                  return (
                    <label
                      key={profile.id}
                      title={profile.amenagementsMaitre}
                      className={`flex items-start gap-2 p-2 rounded border text-left cursor-pointer transition-colors ${
                        active
                          ? 'bg-white border-sky-500 text-slate-900'
                          : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleHandicapProfile(profile.id)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold leading-tight">
                          {profile.nom}
                        </span>
                        <span className="block text-[10px] text-slate-500 leading-snug mt-0.5">
                          {profile.indicateursInclusifsCles.slice(0, 58)}…
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block">
                <span className="text-xs font-semibold text-sky-800">
                  CB (Compétence de Base — En-tête APC)
                </span>
                <input
                  type="text"
                  value={fiche.competenceDeBase || ''}
                  onChange={(e) => touch({ competenceDeBase: e.target.value })}
                  placeholder="Ex : CB1 — Mobiliser les écritures fractionnaires dans des situations de partage..."
                  className="mt-1 w-full px-3 py-2 text-sm font-medium bg-sky-50/50 border border-sky-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Compétence visée</span>
                <textarea
                  rows={2}
                  value={fiche.competenceVisee}
                  onChange={(e) => touch({ competenceVisee: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="editor-objectifs-specifiques"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Objectifs spécifiques (1 par ligne)
                    </label>
                    <VoiceDictationButton
                      compact
                      isOnline={isOnline}
                      label="Dicter objectif"
                      title="Dicter rapidement un objectif de la séance via l’API Web Speech"
                      onError={setAiError}
                      onTranscript={(text) => {
                        const existing = fiche.objectifsSpecifiques
                          .map((s) => s.trim())
                          .filter(Boolean);
                        touch({
                          objectifsSpecifiques: [...existing, text],
                        });
                      }}
                    />
                  </div>
                  <textarea
                    id="editor-objectifs-specifiques"
                    rows={3}
                    value={fiche.objectifsSpecifiques.join('\n')}
                    onChange={(e) =>
                      touch({
                        objectifsSpecifiques: e.target.value.split('\n'),
                      })
                    }
                    className="w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">
                    Prérequis (1 par ligne)
                  </span>
                  <textarea
                    rows={3}
                    value={fiche.prerequis.join('\n')}
                    onChange={(e) =>
                      touch({
                        prerequis: e.target.value.split('\n'),
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">
                    Matériel &amp; supports (1 par ligne)
                  </span>
                  <textarea
                    rows={3}
                    value={fiche.materiel.join('\n')}
                    onChange={(e) =>
                      touch({
                        materiel: e.target.value.split('\n'),
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* 2. Introduction */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Introduction &amp; Mise en situation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Accroche</span>
                <textarea
                  rows={3}
                  value={fiche.introduction.accroche}
                  onChange={(e) =>
                    touch({
                      introduction: { ...fiche.introduction, accroche: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Mise en situation</span>
                <textarea
                  rows={3}
                  value={fiche.introduction.miseEnSituation}
                  onChange={(e) =>
                    touch({
                      introduction: {
                        ...fiche.introduction,
                        miseEnSituation: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="editor-consigne-depart"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Consigne de départ
                  </label>
                  <VoiceDictationButton
                    compact
                    isOnline={isOnline}
                    label="Dicter"
                    onError={setAiError}
                    onTranscript={(text) =>
                      touch({
                        introduction: {
                          ...fiche.introduction,
                          consigneDepart: fiche.introduction.consigneDepart.trim()
                            ? `${fiche.introduction.consigneDepart.trim()} ${text}`
                            : text,
                        },
                      })
                    }
                  />
                </div>
                <textarea
                  id="editor-consigne-depart"
                  rows={3}
                  value={fiche.introduction.consigneDepart}
                  onChange={(e) =>
                    touch({
                      introduction: {
                        ...fiche.introduction,
                        consigneDepart: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </section>

          {/* 3. Tableau Interactif du Déroulement Pédagogique (4 Colonnes) */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  2. Déroulement pédagogique en tableau interactif
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Trame : <strong className="text-slate-800">{activeDiscipline.nom}</strong> · Sous-titres d’étapes selon la matière · Indicateurs validés ({fiche.deroulement.filter((s) => s.indicateurValide).length}/{fiche.deroulement.length}).
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyLocalDisciplineSubtitles(activeDiscipline, false)}
                  title="Réappliquer exactement les sous-titres invariables de cette matière"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Harmoniser sous-titres
                </button>
                <button
                  type="button"
                  onClick={() => setLockInvariantSubtitles((v) => !v)}
                  title="Protéger les titres et sous-titres des étapes contre la réécriture IA"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                    lockInvariantSubtitles
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {lockInvariantSubtitles ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  {lockInvariantSubtitles
                    ? 'Sous-titres invariables verrouillés'
                    : 'Sous-titres déverrouillés'}
                </button>
                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une étape
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-semibold">
                    <th className="p-3 border-r border-slate-800 w-[20%]">
                      Étapes (Sous-titres invariables)
                    </th>
                    <th className="p-3 border-r border-slate-800 w-[26%]">Activités du maître</th>
                    <th className="p-3 border-r border-slate-800 w-[27%]">Activités des élèves</th>
                    <th className="p-3 w-[27%]">Indicateurs pédagogiques inclusifs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fiche.deroulement.map((step, index) => {
                    const matchedPhases = stepPhaseMap.get(step.id) || [];
                    return (
                      <React.Fragment key={step.id}>
                        <tr className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                          <td className="p-3 border-r border-slate-200 align-top space-y-2">
                            <input
                              type="text"
                              readOnly={lockInvariantSubtitles}
                              aria-label={`Nom de l'étape ${index + 1}`}
                              value={step.etape}
                              onChange={(e) => updateStep(step.id, 'etape', e.target.value)}
                              className={`w-full text-xs font-semibold text-slate-900 rounded px-1.5 py-1 focus:outline-none ${
                                lockInvariantSubtitles
                                  ? 'bg-slate-100/70 border border-transparent cursor-default'
                                  : 'bg-transparent border border-slate-200 focus:border-sky-500 focus:bg-white'
                              }`}
                            />
                            <input
                              type="text"
                              readOnly={lockInvariantSubtitles}
                              aria-label={`Sous-titre invariable de l'étape ${index + 1}`}
                              value={
                                step.sousTitreInvariable ||
                                inferInvariantSubtitle(step.etape, index, activeDiscipline.id)
                              }
                              onChange={(e) =>
                                updateStep(step.id, 'sousTitreInvariable', e.target.value)
                              }
                              className={`w-full text-[11px] italic text-slate-600 rounded px-1.5 py-0.5 focus:outline-none ${
                                lockInvariantSubtitles
                                  ? 'bg-transparent border border-transparent cursor-default'
                                  : 'bg-white border border-slate-200 focus:border-sky-500'
                              }`}
                            />
                            <input
                              type="text"
                              aria-label={`Durée de l'étape ${index + 1}`}
                              value={step.duree}
                              onChange={(e) => updateStep(step.id, 'duree', e.target.value)}
                              className="w-24 text-xs font-mono font-medium text-sky-700 bg-sky-50/70 border border-sky-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                            <div className="flex items-center justify-between gap-1 pt-1">
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveStep(index, -1)}
                                  disabled={index === 0}
                                  title="Monter cette étape"
                                  aria-label={`Monter l’étape ${index + 1}`}
                                  className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveStep(index, 1)}
                                  disabled={index === fiche.deroulement.length - 1}
                                  title="Descendre cette étape"
                                  aria-label={`Descendre l’étape ${index + 1}`}
                                  className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                {fiche.deroulement.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeStep(step.id)}
                                    title="Supprimer cette étape"
                                    aria-label={`Supprimer l’étape ${index + 1}`}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={aiLoading || !isOnline}
                                onClick={() =>
                                  runAiRetouch(
                                    `Améliore uniquement l'étape ${index + 1} (${step.etape}) : Activités du maître, Activités des élèves et Indicateurs pédagogiques inclusifs, sans modifier les autres étapes.`,
                                    undefined,
                                    index,
                                    'contenu_etapes'
                                  )
                                }
                                title="Retoucher uniquement cette étape avec l’IA"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded disabled:opacity-50"
                              >
                                {retouchingStepIdx === index ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                IA
                              </button>
                            </div>
                          </td>

                          <td className="p-2 border-r border-slate-200 align-top space-y-1.5">
                            <textarea
                              rows={4}
                              aria-label={`Activités du maître pour ${step.etape}`}
                              value={step.activitesMaitre}
                              onChange={(e) =>
                                updateStep(step.id, 'activitesMaitre', e.target.value)
                              }
                              className="w-full min-h-[78px] text-xs leading-relaxed text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white rounded p-1.5 focus:outline-none resize-y"
                            />
                            <div className="flex justify-end">
                              <VoiceDictationButton
                                compact
                                isOnline={isOnline}
                                label="Dicter"
                                title={`Dicter la consigne du maître pour ${step.etape}`}
                                onError={setAiError}
                                onTranscript={(text) =>
                                  updateStep(
                                    step.id,
                                    'activitesMaitre',
                                    step.activitesMaitre.trim()
                                      ? `${step.activitesMaitre.trim()} ${text}`
                                      : text
                                  )
                                }
                              />
                            </div>
                          </td>

                          <td className="p-2 border-r border-slate-200 align-top">
                            <textarea
                              rows={4}
                              aria-label={`Activités des élèves pour ${step.etape}`}
                              value={step.activitesEleves}
                              onChange={(e) =>
                                updateStep(step.id, 'activitesEleves', e.target.value)
                              }
                              className="w-full h-full min-h-[96px] text-xs leading-relaxed text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white rounded p-1.5 focus:outline-none resize-y"
                            />
                          </td>

                          <td className="p-2 align-top space-y-2">
                            <textarea
                              rows={4}
                              aria-label={`Indicateurs pédagogiques inclusifs pour ${step.etape}`}
                              value={step.indicateursInclusifs}
                              onChange={(e) =>
                                updateStep(step.id, 'indicateursInclusifs', e.target.value)
                              }
                              className="w-full min-h-[78px] text-xs leading-relaxed text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white rounded p-1.5 focus:outline-none resize-y"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateStep(
                                    step.id,
                                    'indicateurValide',
                                    !step.indicateurValide
                                  )
                                }
                                className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                                  step.indicateurValide
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {step.indicateurValide ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                {step.indicateurValide
                                  ? 'Indicateur observé'
                                  : 'Marquer observé'}
                              </button>
                              <VoiceDictationButton
                                compact
                                isOnline={isOnline}
                                label="Dicter obs."
                                title={`Dicter une observation ou un indicateur pour ${step.etape} (Web Speech)`}
                                onError={setAiError}
                                onTranscript={(text) =>
                                  updateStep(
                                    step.id,
                                    'indicateursInclusifs',
                                    step.indicateursInclusifs.trim()
                                      ? `${step.indicateursInclusifs.trim()} ${text}`
                                      : text
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                        {matchedPhases.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={4} className="p-3 border-t border-slate-200">
                              <PhaseManipulationInteractiveDeck
                                ficheId={fiche.id}
                                theme={fiche.theme}
                                titre={fiche.titre}
                                situationProbleme={situationRef}
                                phases={matchedPhases}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3b. Schématisation IA par phases de manipulation (Mathématiques CB1/CB2/CB3) */}
          <MathSchematisationPanel
            key={fiche.id}
            fiche={fiche}
            isOnline={isOnline}
            quality={quality}
            onUpdateFiche={onUpdateFiche}
          />

          {/* 4. Illustration / Schéma annoté */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  3. Illustration &amp; Schéma annoté
                </h2>
                <p className="text-xs text-slate-600">
                  Schéma vectoriel haute définition intégré aux exports Word et PDF.
                </p>
              </div>
              <button
                type="button"
                disabled={aiLoading || !isOnline}
                onClick={() =>
                  runAiRetouch(
                    'Régénère et améliore le schéma SVG annoté de la fiche pour le rendre encore plus clair et visuellement pédagogique pour des élèves.'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5 text-sky-600" />
                Régénérer le schéma par IA
              </button>
            </div>

            <div className="relative border border-slate-200 rounded-md bg-slate-50 p-3 overflow-hidden">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{
                  __html: sanitizeSvg(fiche.illustration?.svgCode || ''),
                }}
              />
              {annotationsList.map((ann, idx) => (
                <button
                  key={ann.id}
                  type="button"
                  onClick={() => setActiveAnnotationId(ann.id)}
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  title={ann.label}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-xs font-mono font-bold transition-transform hover:scale-110 shadow-sm ${
                    activeAnnotation?.id === ann.id
                      ? 'bg-sky-600 text-white ring-2 ring-white'
                      : 'bg-slate-900 text-white/95'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {activeAnnotation && (
              <div className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-xs text-slate-700 flex items-start justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-900">
                    {activeAnnotation.label} :{' '}
                  </span>
                  {activeAnnotation.detail}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Titre du schéma</span>
                <input
                  type="text"
                  value={fiche.illustration.titre}
                  onChange={(e) =>
                    touch({
                      illustration: { ...fiche.illustration, titre: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Légende</span>
                <input
                  type="text"
                  value={fiche.illustration.legende}
                  onChange={(e) =>
                    touch({
                      illustration: { ...fiche.illustration, legende: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </label>
            </div>
          </section>

          {/* 5. Objet manipulable interactif */}
          <section>
            <MathManipulative
              manipulable={fiche.objetManipulable}
              onChange={(updated) => touch({ objetManipulable: updated })}
            />
          </section>

          {/* 6. Questions-réponses interactives */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  4. Questions-réponses interactives
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Testez les acquis en direct avec indices gradués ou modifiez le questionnaire.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQrMode('interactif')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                      qrMode === 'interactif'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Play className="w-3 h-3 text-sky-600" />
                    Interactif
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode('edition')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                      qrMode === 'edition'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    Édition
                  </button>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                  {['Toutes', 'Fondamental', 'Approfondissement', 'Défi'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setQrFilter(lvl)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        qrFilter === lvl
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={enrichingQr || !isOnline}
                  onClick={runEnrichQr}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 disabled:opacity-50 rounded-md whitespace-nowrap shrink-0"
                >
                  {enrichingQr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Générer Q&amp;R par IA
                </button>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
            </div>

            {qrMode === 'interactif' && fiche.questionsReponses.length > 0 && (
              <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5">
                <span className="text-slate-600">
                  Suivi formatif en séance :{' '}
                  <strong className="text-slate-900 font-mono">
                    {
                      Object.values(qrSessionState).filter((s) => s.status === 'acquis')
                        .length
                    }{' '}
                    / {fiche.questionsReponses.length}
                  </strong>{' '}
                  questions validées
                </span>
                <button
                  type="button"
                  onClick={() => setQrSessionState({})}
                  className="text-sky-700 hover:text-sky-800 font-semibold"
                >
                  Réinitialiser la session
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {filteredQuestions.map((qr, i) => {
                const session = qrSessionState[qr.id] || {
                  studentAnswer: '',
                  showHint: false,
                  showAnswer: false,
                };
                const setSessionPatch = (patch: Partial<typeof session>) =>
                  setQrSessionState((prev) => ({
                    ...prev,
                    [qr.id]: { ...session, ...patch },
                  }));

                return (
                  <div key={qr.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-500">
                          Q{i + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        {qrMode === 'edition' ? (
                          <select
                            aria-label="Difficulté de la question"
                            value={qr.difficulte}
                            onChange={(e) =>
                              updateQuestion(qr.id, 'difficulte', e.target.value)
                            }
                            className="text-xs font-semibold text-sky-700 bg-transparent focus:outline-none"
                          >
                            <option value="Fondamental">Fondamental</option>
                            <option value="Approfondissement">Approfondissement</option>
                            <option value="Défi">Défi</option>
                          </select>
                        ) : (
                          <span className="font-semibold text-sky-700">{qr.difficulte}</span>
                        )}
                      </div>

                      {qrMode === 'interactif' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSessionPatch({ status: 'acquis' })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors ${
                              session.status === 'acquis'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-emerald-50'
                            }`}
                          >
                            Acquis
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionPatch({ status: 'revoir' })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors ${
                              session.status === 'revoir'
                                ? 'bg-amber-600 text-white border-amber-700'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-amber-50'
                            }`}
                          >
                            À consolider
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qr.id)}
                          title="Supprimer cette question"
                          aria-label={`Supprimer la question ${i + 1}`}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {qrMode === 'interactif' ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {qr.question}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-slate-500">
                              Prise de note / observation en séance
                            </span>
                            <VoiceDictationButton
                              compact
                              isOnline={isOnline}
                              label="Dicter observation"
                              title="Dicter une observation ou la réponse orale de l’élève via Web Speech"
                              onError={setAiError}
                              onTranscript={(text) =>
                                setSessionPatch({
                                  studentAnswer: session.studentAnswer.trim()
                                    ? `${session.studentAnswer.trim()} ${text}`
                                    : text,
                                })
                              }
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={session.studentAnswer}
                            onChange={(e) =>
                              setSessionPatch({ studentAnswer: e.target.value })
                            }
                            placeholder="Réponse formulée par l’élève (ou prise de note orale en direct)..."
                            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSessionPatch({ showHint: !session.showHint })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            {session.showHint ? 'Masquer l’indice' : 'Afficher l’indice pédagogique'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSessionPatch({ showAnswer: !session.showAnswer })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {session.showAnswer
                              ? 'Masquer la réponse attendue'
                              : 'Révéler la réponse attendue'}
                          </button>
                        </div>

                        {session.showHint && (
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900">
                            <strong>Indice d’étayage : </strong>
                            {qr.indicePedagogique}
                          </div>
                        )}
                        {session.showAnswer && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-xs text-emerald-900">
                            <strong>Réponse attendue : </strong>
                            {qr.reponseAttendue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={qr.question}
                          onChange={(e) =>
                            updateQuestion(qr.id, 'question', e.target.value)
                          }
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="block">
                            <span className="text-[11px] font-medium text-slate-500">
                              Réponse attendue
                            </span>
                            <textarea
                              rows={2}
                              value={qr.reponseAttendue}
                              onChange={(e) =>
                                updateQuestion(
                                  qr.id,
                                  'reponseAttendue',
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-medium text-slate-500">
                              Indice / Étayage pédagogique
                            </span>
                            <textarea
                              rows={2}
                              value={qr.indicePedagogique}
                              onChange={(e) =>
                                updateQuestion(
                                  qr.id,
                                  'indicePedagogique',
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. Synthèse */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              5. Synthèse et trace écrite
            </h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Idée clé à retenir</span>
                <textarea
                  rows={2}
                  value={fiche.synthese.resumeCle}
                  onChange={(e) =>
                    touch({
                      synthese: { ...fiche.synthese, resumeCle: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">
                  Trace écrite de l’élève
                </span>
                <textarea
                  rows={2}
                  value={fiche.synthese.traceEcriteEleve}
                  onChange={(e) =>
                    touch({
                      synthese: {
                        ...fiche.synthese,
                        traceEcriteEleve: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">
                    Mots-clés (séparés par des virgules)
                  </span>
                  <input
                    type="text"
                    value={fiche.synthese.motsCles.join(', ')}
                    onChange={(e) =>
                      touch({
                        synthese: {
                          ...fiche.synthese,
                          motsCles: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Prolongement</span>
                  <input
                    type="text"
                    value={fiche.synthese.prolongement}
                    onChange={(e) =>
                      touch({
                        synthese: { ...fiche.synthese, prolongement: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                  />
                </label>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="editor-observations-seance"
                    className="text-xs font-semibold text-slate-800"
                  >
                    Observations de l’enseignant &amp; bilan de la séance
                  </label>
                  <VoiceDictationButton
                    compact
                    isOnline={isOnline}
                    label="Dicter observations"
                    title="Dicter vos observations de séance via l’API Web Speech"
                    onError={setAiError}
                    onTranscript={(text) =>
                      touch({
                        observations: fiche.observations?.trim()
                          ? `${fiche.observations.trim()} ${text}`
                          : text,
                      })
                    }
                  />
                </div>
                <textarea
                  id="editor-observations-seance"
                  rows={3}
                  value={fiche.observations || ''}
                  onChange={(e) => touch({ observations: e.target.value })}
                  placeholder="Dictez ou notez vos observations après la séance (réussites des élèves, obstacles constatés, besoins de remédiation ou aménagements handicap)…"
                  className="w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Sticky AI Retouch, Chatbot & Suggestions Sidebar (4 cols) */}
        <aside className="xl:col-span-4 xl:sticky xl:top-20 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-1.5 bg-slate-100 border-b border-slate-200 grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => setAssistantTab('retouch')}
              className={`py-2 px-1.5 text-[11px] font-semibold rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                assistantTab === 'retouch'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Retouche
            </button>
            <button
              type="button"
              onClick={() => setAssistantTab('chatbot')}
              className={`py-2 px-1.5 text-[11px] font-semibold rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                assistantTab === 'chatbot'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Chatbot
            </button>
            <button
              type="button"
              onClick={() => setAssistantTab('suggestions')}
              className={`py-2 px-1.5 text-[11px] font-semibold rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                assistantTab === 'suggestions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Audit ({(fiche.suggestionsIA || []).filter((s) => !s.appliquee).length})
            </button>
            <button
              type="button"
              onClick={() => setAssistantTab('history')}
              className={`py-2 px-1.5 text-[11px] font-semibold rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                assistantTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historique
            </button>
          </div>

          <div className="p-5 space-y-5">
            {!isOnline && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Mode hors-ligne : l’édition directe, l’objet manipulable, l’historique et l’export Word/PDF restent disponibles. Reconnectez-vous pour les retouches IA.
                </span>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                {aiError}
              </div>
            )}

            {aiFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 space-y-1">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{aiFeedback}</span>
                </div>
                {lastModifiedSections.length > 0 && (
                  <p className="text-[11px] text-emerald-800 pl-6">
                    Sections modifiées : {lastModifiedSections.join(' · ')}
                  </p>
                )}
              </div>
            )}

            {assistantTab === 'retouch' && (
              <div className="space-y-4">
                {/* Identity & Source Strip: Fiche active vs Contenu vs Fichier */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="font-semibold text-slate-900 truncate">
                      Fiche active : {fiche.titre}
                    </span>
                    <span className="font-mono text-sky-700 shrink-0">
                      {fiche.matiere}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500">
                    <span>Origine : {fiche.modeCreation}</span>
                    {fiche.fichierSource && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">
                          Fichier ({fiche.fichierSource.action === 'retouche' ? 'retouche' : 'création'}) : {fiche.fichierSource.nom}
                        </span>
                      </>
                    )}
                    {fiche.derniereRetouche && fiche.derniereRetouche.sectionsModifiees.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700">
                          Dernière retouche : {fiche.derniereRetouche.sectionsModifiees[0]}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Clean Segmented Separation: Full Sheet by Specific Discipline vs Targeted */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setRetouchSubMode('discipline')}
                    className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                      retouchSubMode === 'discipline'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fiche par discipline
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetouchSubMode('targeted')}
                    className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                      retouchSubMode === 'targeted'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Retouche ciblée
                  </button>
                </div>

                <label className="block">
                  <span className="block text-[11px] font-medium text-slate-500 mb-1">
                    Niveau d’intelligence IA
                  </span>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as ReasoningQuality)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="rapide">Rapide (Faible latence)</option>
                    <option value="equilibre">Équilibré (Recommandé)</option>
                    <option value="expert">Expert Approfondi (Raisonnement max)</option>
                  </select>
                </label>

                {retouchSubMode === 'discipline' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Retouche complète par discipline spécifique
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Sélectionnez une discipline séparée pour retoucher toute la fiche (CB, activités, Q&amp;R, synthèse) en respectant ses sous-titres d’étapes et la pédagogie inclusive en APC.
                      </p>
                    </div>

                    {/* Domain Separation Selector */}
                    <div className="space-y-2">
                      <label className="block">
                        <span className="block text-[11px] font-medium text-slate-500 mb-1">
                          Filtrer par pôle disciplinaire
                        </span>
                        <select
                          value={disciplineDomainFilter}
                          onChange={(e) => setDisciplineDomainFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="Tous">Tous les pôles ({DISCIPLINE_PROFILES.length} disciplines)</option>
                          {DISCIPLINE_DOMAINS.map((dom) => (
                            <option key={dom} value={dom}>
                              {dom}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* Separated Disciplines Selector List */}
                      <div className="border border-slate-200 rounded-md max-h-56 overflow-y-auto divide-y divide-slate-200 bg-white">
                        {DISCIPLINE_DOMAINS.filter(
                          (dom) =>
                            disciplineDomainFilter === 'Tous' ||
                            disciplineDomainFilter === dom
                        ).map((dom) => {
                          const domProfiles = DISCIPLINE_PROFILES.filter(
                            (p) => p.domaine === dom
                          );
                          if (domProfiles.length === 0) return null;
                          return (
                            <div key={dom} className="p-2.5 space-y-1.5">
                              <p className="text-[11px] font-semibold text-slate-500 px-1">
                                {dom}
                              </p>
                              <div className="space-y-1">
                                {domProfiles.map((prof) => {
                                  const selected =
                                    targetRetouchDiscipline.id === prof.id;
                                  return (
                                    <button
                                      key={prof.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedRetouchDisciplineId(prof.id)
                                      }
                                      className={`w-full text-left px-2.5 py-2 rounded border transition-colors ${
                                        selected
                                          ? 'bg-sky-50 border-sky-500 text-slate-900'
                                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold truncate">
                                          {prof.nom}
                                        </span>
                                        {selected && (
                                          <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {prof.sousLabel}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview of Discipline Step Subtitles & Inclusive APC Pedagogy */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            Trame : {targetRetouchDiscipline.nom}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              applyLocalDisciplineSubtitles(
                                targetRetouchDiscipline,
                                true
                              )
                            }
                            className="text-[11px] font-semibold text-slate-600 hover:text-sky-800 whitespace-nowrap shrink-0"
                          >
                            Titres seuls
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            applyFullDisciplineContent(targetRetouchDiscipline)
                          }
                          className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200/80 border border-sky-300 rounded transition-colors text-center"
                        >
                          Appliquer trame complète (Activités + Indicateurs + Q&amp;R)
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-600">
                          Sous-titres des étapes selon la matière :
                        </p>
                        <ol className="space-y-1 text-[11px] text-slate-700">
                          {targetRetouchDiscipline.etapesCanoniques.map(
                            (st, idx) => (
                              <li key={idx} className="leading-snug">
                                <strong className="text-slate-900">
                                  {idx + 1}.
                                </strong>{' '}
                                {st.sousTitreInvariable}
                              </li>
                            )
                          )}
                        </ol>
                      </div>

                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <p className="text-[11px] font-semibold text-slate-600">
                          Pédagogie inclusive APC intégrée :
                        </p>
                        <ul className="space-y-1 text-[11px] text-slate-600 leading-relaxed">
                          {targetRetouchDiscipline.piliersInclusifsAPC.map(
                            (pilier, idx) => (
                              <li key={idx}>· {pilier}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="discipline-retouch-note"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Précisions optionnelles (ou dictée)
                        </label>
                        <VoiceDictationButton
                          compact
                          isOnline={isOnline}
                          label="Dicter"
                          onError={setAiError}
                          onTranscript={(text) =>
                            setDisciplineRetouchInstruction((prev) =>
                              prev.trim() ? `${prev.trim()} ${text}` : text
                            )
                          }
                        />
                      </div>
                      <textarea
                        id="discipline-retouch-note"
                        rows={2}
                        value={disciplineRetouchInstruction}
                        onChange={(e) =>
                          setDisciplineRetouchInstruction(e.target.value)
                        }
                        placeholder="Ex : Adapter pour un groupe CE1 avec 2 élèves DYS, renforcer la manipulation..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regenerateSchemaOnDiscipline}
                        onChange={(e) =>
                          setRegenerateSchemaOnDiscipline(e.target.checked)
                        }
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        Régénérer aussi le schéma SVG selon la nouvelle discipline
                      </span>
                    </label>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 bg-sky-50/60 border border-sky-200 rounded px-2.5 py-1.5">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Accessibility className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                        Inclusion handicap Haute Gamme ({selectedHandicaps.length}/5 profils)
                      </span>
                      <button
                        type="button"
                        onClick={applyLocalInclusion}
                        className="font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
                      >
                        Injecter
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={aiLoading || !isOnline}
                      onClick={runDisciplineFullRetouch}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-md transition-colors"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Retouche complète en cours...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          Retoucher toute la fiche ({targetRetouchDiscipline.nom})
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Retouche ciblée par couche de contenu
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Isolez précisément la partie du contenu à retoucher sur « {fiche.titre} » et joignez si besoin un fichier externe d’appui.
                      </p>
                    </div>

                    {/* Content-Layer Scope Selector */}
                    <div className="space-y-1.5">
                      <label className="block">
                        <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Portée de contenu à retoucher
                        </span>
                        <select
                          value={retouchScope}
                          onChange={(e) => setRetouchScope(e.target.value as RetouchScope)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {RETOUCH_SCOPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        {
                          RETOUCH_SCOPE_OPTIONS.find((o) => o.value === retouchScope)
                            ?.hint
                        }
                      </p>
                    </div>

                    {/* Optional External File Attachment for Retouch */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-700">
                          Fichier externe d’appui (optionnel)
                        </span>
                        <input
                          ref={retouchFileInputRef}
                          type="file"
                          accept={UNIVERSAL_FILE_ACCEPT}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleRetouchFilePick(f);
                            e.target.value = '';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => retouchFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                        >
                          <Paperclip className="w-3 h-3" />
                          {retouchFile ? 'Changer de fichier' : 'Joindre tout fichier (.docx, .pdf, .csv, image…)'}
                        </button>
                      </div>
                      {retouchFile ? (
                        <div className="flex items-center justify-between gap-2 bg-white border border-sky-200 rounded px-2 py-1 text-[11px] text-slate-800">
                          <span className="truncate font-medium">
                            {retouchFile.fileName} ({retouchFile.format.toUpperCase()})
                          </span>
                          <button
                            type="button"
                            onClick={() => setRetouchFile(null)}
                            aria-label="Retirer le fichier d’appui"
                            className="text-slate-400 hover:text-rose-600 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Sert uniquement de source pour enrichir la fiche active sans créer une autre fiche.
                        </p>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        runAiRetouch(instruction);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="retouch-instruction"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Consigne pédagogique à l’IA
                        </label>
                        <VoiceDictationButton
                          compact
                          isOnline={isOnline}
                          label="Dicter la consigne"
                          onError={setAiError}
                          onTranscript={(text) =>
                            setInstruction((prev) =>
                              prev.trim() ? `${prev.trim()} ${text}` : text
                            )
                          }
                        />
                      </div>
                      <textarea
                        id="retouch-instruction"
                        rows={4}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Ex : Enrichis les Activités du maître/élèves avec des Q&R, ou intègre les exercices du fichier joint…"
                        className="w-full px-3 py-2.5 text-xs leading-relaxed bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={
                          aiLoading ||
                          (!instruction.trim() && !retouchFile) ||
                          !isOnline
                        }
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-md transition-colors"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Application de la retouche...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Appliquer la modification
                          </>
                        )}
                      </button>
                    </form>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500">
                        Retouches fréquentes en 1 clic
                      </span>
                      <div className="space-y-1.5">
                        {QUICK_RETOUCHES.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={aiLoading || !isOnline}
                            onClick={() => runAiRetouch(q)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {assistantTab === 'chatbot' && (
              <PedagogicalChatbot
                isOnline={isOnline}
                activeFiche={fiche}
                referenceFiche={fiche}
                allFiches={allFiches}
                preferences={preferences}
                quality={quality}
                onQualityChange={setQuality}
                defaultIntent="auto"
                onFicheCreated={onFicheCreated}
                onFicheUpdated={onUpdateFiche}
                onLearnPreference={onLearnPreference}
                compact
              />
            )}

            {assistantTab === 'suggestions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Audit sémantique &amp; inclusion
                  </h3>
                  <button
                    type="button"
                    onClick={runAiAnalyze}
                    disabled={analyzing || !isOnline}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 disabled:opacity-50"
                  >
                    {analyzing ? 'Analyse...' : 'Relancer'}
                  </button>
                </div>

                {diagnostic && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-3 leading-relaxed">
                    {diagnostic}
                  </p>
                )}

                {fiche.suggestionsIA.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Cliquez sur « Analyser avec l’IA » pour obtenir des pistes d’amélioration ciblées.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fiche.suggestionsIA.map((sug) => (
                      <div
                        key={sug.id}
                        className="border border-slate-200 rounded-md p-3.5 space-y-2 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-sky-700">{sug.categorie}</span>
                          {sug.appliquee && (
                            <span className="font-semibold text-emerald-700">Appliquée</span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900">{sug.titre}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{sug.constat}</p>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          <strong className="font-semibold">Action : </strong>
                          {sug.proposition}
                        </p>
                        {!sug.appliquee && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              disabled={aiLoading || !isOnline}
                              onClick={() => applySuggestion(sug)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded transition-colors"
                            >
                              Appliquer par l’IA
                            </button>
                            <button
                              type="button"
                              onClick={() => ignoreSuggestion(sug.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                            >
                              Ignorer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {assistantTab === 'history' && (
              <div className="space-y-5">
                {/* Section 1: Save & Manage Versions of Current Fiche */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Sauvegardes de cette fiche
                    </h3>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveManualSnapshot(snapshotNameInput);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={snapshotNameInput}
                      onChange={(e) => setSnapshotNameInput(e.target.value)}
                      placeholder="Nom de la version (ex : Avant DYS)..."
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Sauvegarder
                    </button>
                  </form>

                  <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {(fiche.historique || []).map((h) => {
                      const isRenaming = renamingHistId === h.id;
                      return (
                        <li key={h.id} className="py-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                            {isRenaming ? (
                              <div className="flex items-center gap-1 flex-1">
                                <input
                                  type="text"
                                  autoFocus
                                  aria-label="Nouveau nom de la version sauvegardée"
                                  value={renamingHistText}
                                  onChange={(e) => setRenamingHistText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      renameHistoryItem(h.id, renamingHistText);
                                    } else if (e.key === 'Escape') {
                                      setRenamingHistId(null);
                                    }
                                  }}
                                  className="flex-1 min-w-0 px-2 py-0.5 text-xs font-semibold text-slate-900 bg-white border border-sky-500 rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => renameHistoryItem(h.id, renamingHistText)}
                                  className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                  title="Valider"
                                  aria-label="Valider le renommage"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRenamingHistId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                  title="Annuler"
                                  aria-label="Annuler le renommage"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold text-slate-800 truncate">
                                  {h.action}
                                </span>
                                <span className="font-mono shrink-0">
                                  {new Date(h.date).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{h.resume}</p>
                          <div className="flex items-center gap-3">
                            {h.snapshot && (
                              <button
                                type="button"
                                onClick={() => restoreSnapshot(h.snapshot!, h.action)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Charger cette version
                              </button>
                            )}
                            {!isRenaming && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingHistId(h.id);
                                  setRenamingHistText(h.action);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
                              >
                                <Pencil className="w-3 h-3" />
                                Renommer
                              </button>
                            )}
                            {h.snapshot && (fiche.historique || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteHistoryItem(h.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600"
                                title="Supprimer cette version"
                                aria-label="Supprimer cette version"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Section 2: All Previous Generated / Saved Fiches */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Fiches précédentes ({allFiches.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSaveAsName(`${fiche.titre} (archive)`);
                        setShowSaveAsBar(true);
                      }}
                      className="text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                    >
                      + Sauvegarder sous
                    </button>
                  </div>

                  <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                    {allFiches.map((f) => {
                      const isCurrent = f.id === fiche.id;
                      const isRenaming = renamingFicheId === f.id;
                      return (
                        <li
                          key={f.id}
                          className={`py-2.5 space-y-1.5 ${
                            isCurrent ? 'bg-sky-50/50 -mx-2 px-2 rounded' : ''
                          }`}
                        >
                          {isRenaming ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={renamingFicheTitle}
                                onChange={(e) => setRenamingFicheTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (renamingFicheTitle.trim()) {
                                      onRenameFiche(f.id, renamingFicheTitle.trim());
                                      setAiFeedback(
                                        `Fiche renommée en « ${renamingFicheTitle.trim()} ».`
                                      );
                                    }
                                    setRenamingFicheId(null);
                                  } else if (e.key === 'Escape') {
                                    setRenamingFicheId(null);
                                  }
                                }}
                                className="flex-1 min-w-0 px-2 py-1 text-xs font-semibold text-slate-900 bg-white border border-sky-500 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (renamingFicheTitle.trim()) {
                                    onRenameFiche(f.id, renamingFicheTitle.trim());
                                    setAiFeedback(
                                      `Fiche renommée en « ${renamingFicheTitle.trim()} ».`
                                    );
                                  }
                                  setRenamingFicheId(null);
                                }}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                title="Valider"
                                aria-label="Valider le renommage de la fiche"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingFicheId(null)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                title="Annuler"
                                aria-label="Annuler le renommage de la fiche"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {f.titre}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {f.matiere} · {f.niveau} ·{' '}
                                  {new Date(f.updatedAt || f.createdAt).toLocaleDateString(
                                    'fr-FR',
                                    { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
                                  )}
                                </p>
                              </div>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold text-emerald-700 shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => onSelectFiche(f.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                              >
                                <FolderOpen className="w-3 h-3" />
                                Charger
                              </button>
                            )}
                            {!isRenaming && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingFicheId(f.id);
                                  setRenamingFicheTitle(f.titre);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
                              >
                                <Pencil className="w-3 h-3" />
                                Renommer
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
