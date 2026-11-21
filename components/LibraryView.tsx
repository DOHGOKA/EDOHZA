'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Accessibility,
  ArrowUpRight,
  BookOpen,
  BookTemplate,
  Brain,
  Check,
  CheckSquare,
  Clock,
  Copy,
  Download,
  FileDown,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Square,
  Trash2,
  Wand2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  FicheAPC,
  HandicapProfileId,
  ModeleFicheAPC,
  PreferenceApprentissage,
  ReasoningQuality,
  RetouchScope,
} from '@/lib/types';
import {
  applyBatchLocalAdaptationToFiche,
  normalizeFiche,
} from '@/lib/storage';
import { buildFicheFromTemplate, MODELE_FICHES } from '@/lib/templates';
import {
  DEFAULT_HANDICAP_PROFILES,
  HANDICAP_PROFILES,
} from '@/lib/inclusion';
import { postJson } from '@/lib/api-client';
import { slugifyFilename, triggerBlobDownload } from '@/lib/export-utils';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import type { PreviewExportAction } from './PrintPreviewModal';

interface LibraryViewProps {
  fiches: FicheAPC[];
  activeFicheId: string;
  preferences: PreferenceApprentissage[];
  isOnline?: boolean;
  onSelectFiche: (id: string) => void;
  onCreateFicheFromTemplate: (fiche: FicheAPC) => void;
  onRenameFiche: (id: string, newTitle: string) => void;
  onSaveFicheAsNew: (
    source: FicheAPC,
    customTitle?: string,
    openSaved?: boolean
  ) => void;
  onDuplicateFiche: (id: string) => void;
  onDeleteFiche: (id: string) => void;
  onBatchUpdateFiches?: (updated: FicheAPC[]) => void;
  onGoToGenerator: () => void;
  onExportDocx: (fiche: FicheAPC) => Promise<void>;
  onExportPdf: (fiche: FicheAPC) => Promise<void>;
  onExportCompilationDocx?: (fiches: FicheAPC[], title?: string) => Promise<void>;
  onExportCompilationPdf?: (fiches: FicheAPC[], title?: string) => Promise<void>;
  onOpenPrintPreview?: (fiche: FicheAPC, action: PreviewExportAction) => void;
  onAddPreference: (regle: string) => void;
  onDeletePreference: (id: string) => void;
}

type SortOrder = 'recent' | 'oldest' | 'alpha';

const BATCH_SCOPE_OPTIONS: { value: RetouchScope; label: string }[] = [
  {
    value: 'contenu_etapes',
    label: 'Contenu des étapes (Activités M/É & Indicateurs)',
  },
  {
    value: 'inclusion_handicap',
    label: 'Adaptations d’inclusion handicap',
  },
  {
    value: 'schematisation_math',
    label: 'Phases de manipulation, schémas, exercices & Q&R',
  },
  {
    value: 'qr_evaluation',
    label: 'Questions-réponses & évaluation',
  },
  {
    value: 'cadre_apc',
    label: 'En-tête & Cadre APC (CB, objectifs, mise en situation)',
  },
  {
    value: 'complet',
    label: 'Fiche complète (adaptation globale)',
  },
];

function formatDateFr(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getOriginLabel(mode: FicheAPC['modeCreation']): string {
  if (mode === 'ia') return 'Générée par IA';
  if (mode === 'import') return 'Importée';
  return 'Manuelle';
}

export default function LibraryView({
  fiches,
  activeFicheId,
  preferences,
  isOnline = true,
  onSelectFiche,
  onCreateFicheFromTemplate,
  onRenameFiche,
  onSaveFicheAsNew,
  onDuplicateFiche,
  onDeleteFiche,
  onBatchUpdateFiches,
  onGoToGenerator,
  onExportDocx,
  onExportPdf,
  onExportCompilationDocx,
  onExportCompilationPdf,
  onOpenPrintPreview,
  onAddPreference,
  onDeletePreference,
}: LibraryViewProps) {
  const [query, setQuery] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState<string>('Toutes');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);

  // Compilation & Batch Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [compilationTitle, setCompilationTitle] = useState(
    'Compilation de fiches pédagogiques APC'
  );
  const [batchMode, setBatchMode] = useState<'local' | 'ai'>('local');
  const [batchHandicaps, setBatchHandicaps] = useState<HandicapProfileId[]>([
    ...DEFAULT_HANDICAP_PROFILES,
  ]);
  const [batchRefreshPhases, setBatchRefreshPhases] = useState(true);
  const [batchAlignSubtitles, setBatchAlignSubtitles] = useState(true);
  const [batchScope, setBatchScope] = useState<RetouchScope>('contenu_etapes');
  const [batchQuality, setBatchQuality] = useState<ReasoningQuality>('equilibre');
  const [batchInstruction, setBatchInstruction] = useState(
    'Enrichir les Activités du maître et des élèves avec des Q&R interactives, adapter les indicateurs inclusifs et actualiser les phases de manipulation en respectant la discipline de chaque fiche.'
  );
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);
  const batchAbortRef = useRef<AbortController | null>(null);

  const handleLibraryExport = async (fiche: FicheAPC, format: 'docx' | 'pdf') => {
    if (onOpenPrintPreview) {
      onOpenPrintPreview(fiche, format);
      return;
    }
    const key = `${fiche.id}-${format}`;
    setExportingKey(key);
    setExportError(null);
    try {
      if (format === 'docx') {
        await onExportDocx(fiche);
      } else {
        await onExportPdf(fiche);
      }
    } catch (err: unknown) {
      setExportError(
        err instanceof Error
          ? err.message
          : 'Impossible de générer le fichier d’export.'
      );
    } finally {
      setExportingKey(null);
    }
  };

  const matieres = useMemo(() => {
    const set = new Set(fiches.map((f) => f.matiere));
    return ['Toutes', ...Array.from(set)];
  }, [fiches]);

  const filteredFiches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = fiches.filter((f) => {
      const matchMatiere = selectedMatiere === 'Toutes' || f.matiere === selectedMatiere;
      const matchQuery =
        !q ||
        f.titre.toLowerCase().includes(q) ||
        f.theme.toLowerCase().includes(q) ||
        f.niveau.toLowerCase().includes(q) ||
        f.matiere.toLowerCase().includes(q);
      return matchMatiere && matchQuery;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'alpha') {
        return a.titre.localeCompare(b.titre, 'fr');
      }
      const timeA = new Date(a.updatedAt || a.createdAt).getTime() || 0;
      const timeB = new Date(b.updatedAt || b.createdAt).getTime() || 0;
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
    });
  }, [fiches, query, selectedMatiere, sortOrder]);

  const validSelectedIds = useMemo(() => {
    const existing = new Set(fiches.map((f) => f.id));
    return selectedIds.filter((id) => existing.has(id));
  }, [fiches, selectedIds]);

  const targetCompilationFiches = useMemo(() => {
    if (validSelectedIds.length > 0) {
      const set = new Set(validSelectedIds);
      return fiches.filter((f) => set.has(f.id));
    }
    return filteredFiches.length > 0 ? filteredFiches : fiches;
  }, [fiches, filteredFiches, validSelectedIds]);

  const toggleSelectFiche = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredFiches.map((f) => f.id));
  };

  const toggleBatchHandicap = (id: HandicapProfileId) => {
    setBatchHandicaps((prev) => {
      const exists = prev.includes(id);
      if (exists && prev.length <= 1) return prev;
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleCompilationExport = async (format: 'docx' | 'pdf' | 'json') => {
    if (targetCompilationFiches.length === 0) return;
    setExportError(null);
    const title = compilationTitle.trim() || 'Compilation de fiches pédagogiques APC';

    if (format === 'json') {
      const bundle = {
        kind: 'atelier_apc_compilation',
        titreCompilation: title,
        exporteLe: new Date().toISOString(),
        nombreFiches: targetCompilationFiches.length,
        fiches: targetCompilationFiches,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });
      triggerBlobDownload(blob, `${slugifyFilename(title)}.json`);
      setHistoryNotice(
        `Compilation JSON exportée (${targetCompilationFiches.length} fiche${targetCompilationFiches.length > 1 ? 's' : ''}).`
      );
      return;
    }

    setExportingKey(`compilation-${format}`);
    try {
      if (format === 'docx' && onExportCompilationDocx) {
        await onExportCompilationDocx(targetCompilationFiches, title);
      } else if (format === 'pdf' && onExportCompilationPdf) {
        await onExportCompilationPdf(targetCompilationFiches, title);
      }
      setHistoryNotice(
        `Compilation ${format.toUpperCase()} générée (${targetCompilationFiches.length} fiche${targetCompilationFiches.length > 1 ? 's' : ''}).`
      );
    } catch (err: unknown) {
      setExportError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la génération de la compilation.'
      );
    } finally {
      setExportingKey(null);
    }
  };

  const handleRunBatchAdaptation = async () => {
    if (!onBatchUpdateFiches || targetCompilationFiches.length === 0) return;
    setExportError(null);
    setHistoryNotice(null);

    if (batchMode === 'local') {
      const updatedList = targetCompilationFiches.map((f) =>
        applyBatchLocalAdaptationToFiche(f, {
          handicapProfiles: batchHandicaps,
          refreshManipulationPhases: batchRefreshPhases,
          alignDisciplineSubtitles: batchAlignSubtitles,
        })
      );
      onBatchUpdateFiches(updatedList);
      setHistoryNotice(
        `${updatedList.length} fiche${updatedList.length > 1 ? 's' : ''} adaptée${updatedList.length > 1 ? 's' : ''} en lot (instantané sauvegardé avant chaque modification).`
      );
      return;
    }

    if (!isOnline) {
      setExportError(
        'La retouche IA en lot nécessite une connexion internet active. Utilisez l’adaptation instantanée locale hors-ligne.'
      );
      return;
    }

    if (!batchInstruction.trim()) {
      setExportError('Veuillez indiquer une consigne pédagogique pour la retouche IA en lot.');
      return;
    }

    const controller = new AbortController();
    batchAbortRef.current = controller;
    setBatchRunning(true);

    const updatedResults: FicheAPC[] = [];
    const failedTitles: string[] = [];

    try {
      for (let i = 0; i < targetCompilationFiches.length; i++) {
        if (controller.signal.aborted) break;
        const target = targetCompilationFiches[i];
        setBatchProgress({
          current: i + 1,
          total: targetCompilationFiches.length,
          label: `${target.matiere} · ${target.titre}`,
        });

        try {
          const data = await postJson<{ fiche: FicheAPC }>(
            '/api/apc/retouch',
            {
              mode: 'modify',
              fiche: target,
              instruction: batchInstruction.trim(),
              handicapProfiles: batchHandicaps,
              retouchScope: batchScope,
              quality: batchQuality,
              preferences,
              preserveInvariantSubtitles: batchAlignSubtitles,
            },
            controller.signal
          );
          if (data.fiche) {
            updatedResults.push(normalizeFiche(data.fiche));
          }
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            break;
          }
          failedTitles.push(target.titre);
        }
      }

      if (updatedResults.length > 0) {
        onBatchUpdateFiches(updatedResults);
      }

      if (failedTitles.length > 0) {
        setExportError(
          `Retouche partielle : ${updatedResults.length} réussie(s), ${failedTitles.length} échouée(s) (${failedTitles.slice(0, 2).join(', ')}).`
        );
      } else if (updatedResults.length > 0) {
        setHistoryNotice(
          `Retouche IA différenciée terminée sur ${updatedResults.length} fiche${updatedResults.length > 1 ? 's' : ''} (instantané pré-retouche conservé sur chacune).`
        );
      }
    } finally {
      batchAbortRef.current = null;
      setBatchRunning(false);
      setBatchProgress(null);
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    onAddPreference(newRule.trim());
    setNewRule('');
  };

  const startRename = (fiche: FicheAPC) => {
    setSavingId(null);
    setEditingId(fiche.id);
    setEditingTitle(fiche.titre);
  };

  const commitRename = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onRenameFiche(id, trimmed);
      setHistoryNotice(`Fiche renommée en « ${trimmed} ».`);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const startSaveAs = (fiche: FicheAPC) => {
    setEditingId(null);
    setSavingId(fiche.id);
    setSaveAsTitle(`${fiche.titre} (archive)`);
  };

  const commitSaveAs = (fiche: FicheAPC) => {
    const trimmed = saveAsTitle.trim() || `${fiche.titre} (sauvegarde)`;
    onSaveFicheAsNew(fiche, trimmed, false);
    setSavingId(null);
    setSaveAsTitle('');
    setHistoryNotice(`Sauvegarde ajoutée à l’historique : « ${trimmed} ».`);
  };

  const activeFiche = fiches.find((f) => f.id === activeFicheId) || fiches[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-sky-700 tracking-wide">
            Bibliothèque, Compilations &amp; Historique · {fiches.length} fiche{fiches.length > 1 ? 's' : ''} enregistrée{fiches.length > 1 ? 's' : ''}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
            Vos fiches pédagogiques APC sauvegardées
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Gérez vos fiches individuellement ou par compilation : retouchez et adaptez plusieurs fiches en lot avec différenciation, puis exportez un recueil Word, PDF ou JSON complet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowBatchPanel((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 ${
              showBatchPanel
                ? 'bg-sky-600 text-white border-sky-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Compilations &amp; Retouche en lot
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 ${
              showTemplates
                ? 'bg-sky-50 text-sky-800 border-sky-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <BookTemplate className="w-4 h-4 text-sky-600" />
            Modèles disciplinaires ({MODELE_FICHES.length})
          </button>
          {activeFiche && (
            <button
              type="button"
              onClick={() => startSaveAs(activeFiche)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4 text-sky-600" />
              Sauvegarder l’active
            </button>
          )}
          <button
            type="button"
            onClick={onGoToGenerator}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Générer une fiche IA
          </button>
        </div>
      </div>

      {showTemplates && (
        <TemplateLibraryPanel
          onCreateFromTemplate={(tpl: ModeleFicheAPC) => {
            onCreateFicheFromTemplate(buildFicheFromTemplate(tpl));
            setShowTemplates(false);
          }}
        />
      )}

      {/* Batch & Compilation Studio */}
      {showBatchPanel && (
        <section
          aria-label="Gestion des compilations et retouche en lot"
          className="bg-white border border-sky-200 rounded-lg p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Atelier Compilation &amp; Retouche multi-fiches
              </h2>
              <p className="text-xs text-slate-600">
                {validSelectedIds.length > 0
                  ? `${validSelectedIds.length} fiche(s) cochée(s) ci-dessous ciblée(s) — chaque fiche conserve son identité, sa matière et un instantané avant modification.`
                  : `Aucune fiche cochée : l’opération portera sur les ${targetCompilationFiches.length} fiche(s) actuellement affichée(s).`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded transition-colors"
              >
                Cocher filtrées ({filteredFiches.length})
              </button>
              {validSelectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Tout décocher
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Compilation Export */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3.5">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                1. Exporter la compilation ({targetCompilationFiches.length} fiches)
              </h3>
              <label className="block">
                <span className="block text-[11px] font-medium text-slate-600 mb-1">
                  Titre du recueil compilé
                </span>
                <input
                  type="text"
                  value={compilationTitle}
                  onChange={(e) => setCompilationTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={exportingKey !== null || targetCompilationFiches.length === 0}
                  onClick={() => handleCompilationExport('docx')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
                >
                  {exportingKey === 'compilation-docx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  Recueil Word (.docx)
                </button>
                <button
                  type="button"
                  disabled={exportingKey !== null || targetCompilationFiches.length === 0}
                  onClick={() => handleCompilationExport('pdf')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
                >
                  {exportingKey === 'compilation-pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  Recueil PDF A4
                </button>
                <button
                  type="button"
                  disabled={targetCompilationFiches.length === 0}
                  onClick={() => handleCompilationExport('json')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Bundle JSON
                </button>
              </div>
            </div>

            {/* Right: Batch Retouch & Adaptation */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  2. Retoucher &amp; adapter les fiches en lot
                </h3>
                <div className="inline-flex p-0.5 bg-slate-200/70 rounded-md">
                  <button
                    type="button"
                    onClick={() => setBatchMode('local')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                      batchMode === 'local'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Adaptation instantanée
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchMode('ai')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                      batchMode === 'ai'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Retouche IA différenciée
                  </button>
                </div>
              </div>

              {/* Handicap profiles selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-sky-600" />
                  Profils d’inclusion handicap à appliquer au lot ({batchHandicaps.length}/{HANDICAP_PROFILES.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {HANDICAP_PROFILES.map((p) => {
                    const checked = batchHandicaps.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-[11px] cursor-pointer transition-colors ${
                          checked
                            ? 'bg-white border-sky-500 text-slate-900 font-medium'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBatchHandicap(p.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="truncate">{p.nom}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {batchMode === 'local' ? (
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchRefreshPhases}
                      onChange={(e) => setBatchRefreshPhases(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600"
                    />
                    <span>
                      Actualiser les 3 phases de manipulation (schémas SVG, données concrètes, 3 paliers d’exercices et Q&amp;R par phase)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchAlignSubtitles}
                      onChange={(e) => setBatchAlignSubtitles(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600"
                    />
                    <span>
                      Aligner les sous-titres invariables selon la discipline propre à chaque fiche
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {!isOnline && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-center gap-2">
                      <WifiOff className="w-3.5 h-3.5 shrink-0" />
                      Connexion requise pour la retouche IA en lot.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="block">
                      <span className="block text-[11px] font-medium text-slate-600 mb-1">
                        Portée de retouche sur chaque fiche
                      </span>
                      <select
                        value={batchScope}
                        onChange={(e) => setBatchScope(e.target.value as RetouchScope)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                      >
                        {BATCH_SCOPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-medium text-slate-600 mb-1">
                        Niveau d’analyse IA
                      </span>
                      <select
                        value={batchQuality}
                        onChange={(e) => setBatchQuality(e.target.value as ReasoningQuality)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                      >
                        <option value="rapide">Rapide</option>
                        <option value="equilibre">Équilibré (Recommandé)</option>
                        <option value="expert">Expert Approfondi</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-[11px] font-medium text-slate-600 mb-1">
                      Directive pédagogique différenciée appliquée fiche par fiche
                    </span>
                    <textarea
                      rows={2}
                      value={batchInstruction}
                      onChange={(e) => setBatchInstruction(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </label>
                </div>
              )}

              {batchProgress && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-sky-900">
                    <span className="truncate">
                      Retouche {batchProgress.current}/{batchProgress.total} : {batchProgress.label}
                    </span>
                    <span className="font-mono shrink-0">
                      {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-sky-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all"
                      style={{
                        width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2">
                {batchRunning && (
                  <button
                    type="button"
                    onClick={() => batchAbortRef.current?.abort()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Interrompre
                  </button>
                )}
                <button
                  type="button"
                  disabled={
                    batchRunning ||
                    targetCompilationFiches.length === 0 ||
                    (batchMode === 'ai' && !isOnline)
                  }
                  onClick={handleRunBatchAdaptation}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
                >
                  {batchRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Retouche en lot en cours…
                    </>
                  ) : batchMode === 'local' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Adapter les {targetCompilationFiches.length} fiche(s) instantanément
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-sky-400" />
                      Lancer la retouche IA sur {targetCompilationFiches.length} fiche(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter, Sort & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, thème, matière ou niveau..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Trier l’historique des fiches"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="recent">Plus récentes d’abord</option>
              <option value="oldest">Plus anciennes d’abord</option>
              <option value="alpha">Ordre alphabétique (A → Z)</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
          {matieres.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMatiere(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedMatiere === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {historyNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center justify-between gap-3">
          <span>{historyNotice}</span>
          <button
            type="button"
            onClick={() => setHistoryNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {exportError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between gap-3">
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-rose-700 hover:text-rose-900 font-semibold shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Content Split: Fiches History + Continuous Learning Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filteredFiches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-4">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  Aucune fiche ne correspond à votre recherche
                </h3>
                <p className="text-sm text-slate-600">
                  Modifiez votre filtre ou générez immédiatement une nouvelle fiche APC sur ce thème.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {(query || selectedMatiere !== 'Toutes') && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSelectedMatiere('Toutes');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
                <button
                  type="button"
                  onClick={onGoToGenerator}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer une fiche sur ce thème
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-lg overflow-hidden">
              {filteredFiches.map((fiche) => {
                const isActive = fiche.id === activeFicheId;
                const isEditing = editingId === fiche.id;
                const isSavingAs = savingId === fiche.id;
                const isSelected = validSelectedIds.includes(fiche.id);
                return (
                  <div
                    key={fiche.id}
                    className={`p-5 sm:p-6 transition-colors space-y-3 ${
                      isSelected
                        ? 'bg-sky-50/70'
                        : isActive
                        ? 'bg-sky-50/40'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleSelectFiche(fiche.id)}
                          aria-pressed={isSelected}
                          aria-label={`Sélectionner « ${fiche.titre} » pour la compilation`}
                          className="mt-1 p-0.5 text-slate-400 hover:text-sky-600 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-sky-700">{fiche.matiere}</span>
                            <span aria-hidden="true">·</span>
                            <span>{fiche.niveau}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{fiche.duree}</span>
                            <span aria-hidden="true">·</span>
                            <span>{getOriginLabel(fiche.modeCreation)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[11px]">
                              Sauvegardée le {formatDateFr(fiche.updatedAt || fiche.createdAt)}
                            </span>
                            {isActive && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-emerald-700">Fiche active</span>
                              </>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 pt-0.5">
                              <input
                                type="text"
                                autoFocus
                                aria-label="Nouveau titre de la fiche"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitRename(fiche.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingId(null);
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white border border-sky-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                              <button
                                type="button"
                                onClick={() => commitRename(fiche.id)}
                                title="Valider le nouveau nom"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Valider
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                title="Annuler"
                                aria-label="Annuler le renommage"
                                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectFiche(fiche.id)}
                              className="text-left group"
                            >
                              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                                {fiche.titre}
                              </h3>
                            </button>
                          )}

                          <p className="text-sm text-slate-600 line-clamp-2">{fiche.theme}</p>
                          {(fiche.fichierSource || fiche.derniereRetouche) && (
                            <p className="text-[11px] text-slate-500">
                              {fiche.fichierSource
                                ? `Source : ${fiche.fichierSource.nom} [${fiche.fichierSource.format.toUpperCase()}]`
                                : ''}
                              {fiche.fichierSource && fiche.derniereRetouche ? ' · ' : ''}
                              {fiche.derniereRetouche
                                ? `Retouchée (${fiche.derniereRetouche.sectionsModifiees.slice(0, 2).join(', ') || 'APC'})`
                                : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectFiche(fiche.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          Charger
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startRename(fiche)}
                          title="Renommer cette fiche"
                          className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                          Renommer
                        </button>
                        <button
                          type="button"
                          onClick={() => startSaveAs(fiche)}
                          title="Sauvegarder sous un nouveau nom dans l’historique"
                          aria-label="Sauvegarder sous un nouveau nom dans l’historique"
                          className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLibraryExport(fiche, 'docx')}
                          disabled={exportingKey !== null}
                          title="Télécharger en Word (.docx)"
                          className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          {exportingKey === `${fiche.id}-docx` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-sky-600" />
                          )}
                          Word
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLibraryExport(fiche, 'pdf')}
                          disabled={exportingKey !== null}
                          title="Télécharger en PDF"
                          className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          {exportingKey === `${fiche.id}-pdf` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateFiche(fiche.id)}
                          title="Dupliquer cette fiche"
                          aria-label="Dupliquer cette fiche"
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {fiches.length > 1 && (
                          confirmDeleteId === fiche.id ? (
                            <div className="inline-flex items-center gap-1 pl-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteFiche(fiche.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors whitespace-nowrap"
                              >
                                Confirmer
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 rounded-md"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(fiche.id)}
                              title="Supprimer cette fiche"
                              aria-label="Supprimer cette fiche"
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {isSavingAs && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitSaveAs(fiche);
                        }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={saveAsTitle}
                          onChange={(e) => setSaveAsTitle(e.target.value)}
                          placeholder="Nom de la sauvegarde dans l’historique..."
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Enregistrer dans l’historique
                          </button>
                          <button
                            type="button"
                            onClick={() => setSavingId(null)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Continuous AI Learning Preferences Panel */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Apprentissage continu de l’IA
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Vos directives et retouches pédagogiques sont mémorisées localement et réinjectées automatiquement dans chaque future génération ou retouche en lot.
              </p>
            </div>
          </div>

          <ul className="divide-y divide-slate-100 border-t border-b border-slate-100">
            {preferences.length === 0 ? (
              <li className="py-4 text-xs text-slate-500">
                Aucune directive enregistrée pour le moment.
              </li>
            ) : (
              preferences.map((pref) => (
                <li key={pref.id} className="py-3 flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs text-slate-800 leading-relaxed">{pref.regle}</p>
                    <p className="text-[11px] text-slate-400">{pref.source}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeletePreference(pref.id)}
                    title="Retirer cette règle"
                    aria-label="Retirer cette règle"
                    className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))
            )}
          </ul>

          <form onSubmit={handleAddRule} className="space-y-2.5">
            <label
              htmlFor="new-pref-input"
              className="block text-xs font-medium text-slate-700"
            >
              Ajouter une préférence pédagogique permanente
            </label>
            <textarea
              id="new-pref-input"
              rows={2}
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Ex : Toujours prévoir une manipulation concrète de 10 min avant le passage à l’écrit."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!newRule.trim()}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors"
            >
              Mémoriser cette préférence
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
