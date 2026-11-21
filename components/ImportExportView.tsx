'use client';

import React, { useState, useRef } from 'react';
import {
  Accessibility,
  CheckCircle2,
  CheckSquare,
  Download,
  Eye,
  FileDown,
  FileText,
  FileUp,
  Layers,
  Loader2,
  Printer,
  SlidersHorizontal,
  Sparkles,
  Square,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import {
  FicheAPC,
  HandicapProfileId,
  PreferenceApprentissage,
  ReasoningQuality,
  RetouchScope,
  WorkspaceTab,
} from '@/lib/types';
import {
  applyBatchLocalAdaptationToFiche,
  buildImportedCompilationsFromText,
  normalizeFiche,
} from '@/lib/storage';
import {
  DEFAULT_HANDICAP_PROFILES,
  HANDICAP_PROFILES,
} from '@/lib/inclusion';
import { postJson } from '@/lib/api-client';
import {
  readAnyUploadedFile,
  UNIVERSAL_FILE_ACCEPT,
} from '@/lib/file-reader';
import { slugifyFilename, triggerBlobDownload } from '@/lib/export-utils';
import type { PreviewExportAction } from './PrintPreviewModal';
import PreviewSheet from './PreviewSheet';
import FicheTtsPlayer from './FicheTtsPlayer';

interface ImportExportViewProps {
  activeFiche: FicheAPC;
  allFiches?: FicheAPC[];
  isOnline: boolean;
  preferences: PreferenceApprentissage[];
  onFicheImported: (fiche: FicheAPC) => void;
  onFichesImported?: (fiches: FicheAPC[], targetTab?: WorkspaceTab) => void;
  onUpdateFiche?: (fiche: FicheAPC) => void;
  onSwitchToEditor?: () => void;
  onSwitchToLibrary?: () => void;
  onExportDocx: (fiche: FicheAPC) => Promise<void>;
  onExportPdf: (fiche: FicheAPC) => Promise<void>;
  onExportCompilationDocx?: (fiches: FicheAPC[], title?: string) => Promise<void>;
  onExportCompilationPdf?: (fiches: FicheAPC[], title?: string) => Promise<void>;
  onOpenPrintPreview?: (fiche: FicheAPC, action: PreviewExportAction) => void;
}

const RETOUCH_SCOPE_OPTIONS: { value: RetouchScope; label: string }[] = [
  {
    value: 'contenu_etapes',
    label: 'Contenu des étapes (Activités M/É & Indicateurs)',
  },
  {
    value: 'cadre_apc',
    label: 'En-tête & Cadre APC (CB, objectifs, mise en situation)',
  },
  {
    value: 'inclusion_handicap',
    label: 'Adaptations d’inclusion handicap',
  },
  {
    value: 'qr_evaluation',
    label: 'Questions-réponses interactives & évaluation',
  },
  {
    value: 'schematisation_math',
    label: 'Phases de manipulation, schémas, exercices & Q&R',
  },
  {
    value: 'complet',
    label: 'Fiche complète (tout aligner avec le fichier)',
  },
];

export default function ImportExportView({
  activeFiche,
  allFiches = [],
  isOnline,
  preferences,
  onFicheImported,
  onFichesImported,
  onUpdateFiche,
  onSwitchToEditor,
  onSwitchToLibrary,
  onExportDocx,
  onExportPdf,
  onExportCompilationDocx,
  onExportCompilationPdf,
  onOpenPrintPreview,
}: ImportExportViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exportingType, setExportingType] = useState<
    'docx' | 'pdf' | 'comp-docx' | 'comp-pdf' | null
  >(null);
  const [fileActionMode, setFileActionMode] = useState<'create_new' | 'retouch_active'>(
    'create_new'
  );
  const [extractMode, setExtractMode] = useState<'auto' | 'compilation' | 'single'>(
    'auto'
  );
  const [retouchScope, setRetouchScope] = useState<RetouchScope>('contenu_etapes');
  const [retouchInstruction, setRetouchInstruction] = useState('');
  const [adaptationInstruction, setAdaptationInstruction] = useState('');
  const [selectedHandicaps, setSelectedHandicaps] = useState<HandicapProfileId[]>([
    ...DEFAULT_HANDICAP_PROFILES,
  ]);
  const [pastedText, setPastedText] = useState('');
  const [referenceFicheId, setReferenceFicheId] = useState<string>('');
  const [quality, setQuality] = useState<ReasoningQuality>('equilibre');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modifiedSections, setModifiedSections] = useState<string[]>([]);
  const [showTtsPlayer, setShowTtsPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staged Compilation Extraction State
  const [stagedCompilation, setStagedCompilation] = useState<{
    title: string;
    sourceFileName: string;
    fiches: FicheAPC[];
    selectedIds: string[];
  } | null>(null);

  const selectedReferenceFiche =
    allFiches.find((f) => f.id === referenceFicheId) || null;

  const isRetouchActiveMode =
    fileActionMode === 'retouch_active' && Boolean(onUpdateFiche);

  const toggleHandicap = (id: HandicapProfileId) => {
    setSelectedHandicaps((prev) => {
      const exists = prev.includes(id);
      if (exists && prev.length <= 1) return prev;
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleExtractionOutcome = (
    extracted: FicheAPC[],
    sourceFileName: string,
    compilationTitle?: string
  ) => {
    const normalizedList = extracted.map(normalizeFiche);
    if (normalizedList.length === 0) {
      throw new Error('Aucune fiche valide n’a pu être extraite.');
    }

    if (normalizedList.length === 1) {
      onFicheImported(normalizedList[0]);
      setStagedCompilation(null);
      setStatusMessage(
        `Document « ${sourceFileName} » converti en nouvelle fiche APC : « ${normalizedList[0].titre} ».`
      );
      return;
    }

    // Multiple fiches extracted (compilation) -> display review & batch adaptation panel
    setStagedCompilation({
      title:
        compilationTitle ||
        `Compilation — ${sourceFileName.replace(/\.[a-z0-9]+$/i, '')}`,
      sourceFileName,
      fiches: normalizedList,
      selectedIds: normalizedList.map((f) => f.id),
    });
    setStatusMessage(
      `Compilation détectée dans « ${sourceFileName} » : ${normalizedList.length} fiches distinctes prêtes à être adaptées, exportées ou importées.`
    );
  };

  const runRetouchWithSourceFile = async (sourceFile: {
    format: 'docx' | 'pdf' | 'text' | 'image';
    fileName: string;
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    tailleOctets?: number;
  }) => {
    if (!onUpdateFiche) return;
    if (!isOnline) {
      throw new Error(
        'La retouche d’une fiche à partir d’un fichier externe nécessite une connexion internet active.'
      );
    }

    const data = await postJson<{
      fiche: FicheAPC;
      resumeModifications?: string;
      sectionsModifiees?: string[];
    }>('/api/apc/retouch', {
      mode: 'modify',
      fiche: activeFiche,
      instruction: retouchInstruction.trim(),
      retouchScope,
      handicapProfiles: selectedHandicaps,
      sourceFile,
      quality,
      preferences,
      preserveInvariantSubtitles: true,
    });

    onUpdateFiche(normalizeFiche(data.fiche));
    setModifiedSections(
      Array.isArray(data.sectionsModifiees) ? data.sectionsModifiees : []
    );
    setStatusMessage(
      data.resumeModifications ||
        `Fiche active « ${activeFiche.titre} » retouchée à partir du fichier « ${sourceFile.fileName} ».`
    );
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setStatusMessage(null);
    setModifiedSections([]);
    setImporting(true);

    try {
      const parsed = await readAnyUploadedFile(file, {
        isRetouchMode: isRetouchActiveMode,
        activeFiche,
      });

      if (parsed.kind === 'json' && parsed.jsonFiches) {
        if (isRetouchActiveMode && onUpdateFiche) {
          onUpdateFiche(normalizeFiche(parsed.jsonFiches[0]));
          setStatusMessage(
            `Fiche active « ${activeFiche.titre} » mise à jour depuis « ${file.name} ».`
          );
          return;
        }
        handleExtractionOutcome(
          parsed.jsonFiches,
          file.name,
          parsed.jsonCompilationTitle
        );
        return;
      }

      if (isRetouchActiveMode) {
        await runRetouchWithSourceFile({
          format:
            parsed.apiFormat === 'json' ? 'text' : parsed.apiFormat,
          fileName: parsed.fileName,
          textContent: parsed.textContent,
          base64Data: parsed.base64Data,
          mimeType: parsed.mimeType,
          tailleOctets: parsed.fileSize,
        });
        return;
      }

      if (parsed.apiFormat === 'pdf' || parsed.apiFormat === 'image') {
        if (!isOnline) {
          throw new Error(
            'L’analyse multimodale des fichiers PDF et images nécessite une connexion internet active.'
          );
        }
        const data = await postJson<{
          fiche: FicheAPC;
          fiches?: FicheAPC[];
          compilationTitle?: string;
        }>('/api/apc/import', {
          format: parsed.apiFormat,
          fileName: parsed.fileName,
          fileSize: parsed.fileSize,
          base64Data: parsed.base64Data,
          mimeType: parsed.mimeType,
          referenceFiche: selectedReferenceFiche,
          handicapProfiles: selectedHandicaps,
          extractMode,
          adaptationInstruction: adaptationInstruction.trim(),
          quality,
          preferences,
        });
        const list =
          Array.isArray(data.fiches) && data.fiches.length > 0
            ? data.fiches
            : [data.fiche];
        handleExtractionOutcome(list, parsed.fileName, data.compilationTitle);
        return;
      }

      const textContent = parsed.textContent || '';
      const apiTextFormat = parsed.apiFormat === 'docx' ? 'docx' : 'text';

      if (!isOnline) {
        const offlineList =
          extractMode === 'single'
            ? [
                ...buildImportedCompilationsFromText(parsed.fileName, textContent, {
                  format: apiTextFormat,
                  tailleOctets: parsed.fileSize,
                  handicapProfiles: selectedHandicaps,
                  referenceFiche: selectedReferenceFiche,
                }).slice(0, 1),
              ]
            : buildImportedCompilationsFromText(parsed.fileName, textContent, {
                format: apiTextFormat,
                tailleOctets: parsed.fileSize,
                handicapProfiles: selectedHandicaps,
                referenceFiche: selectedReferenceFiche,
              });
        handleExtractionOutcome(offlineList, parsed.fileName);
        return;
      }

      const data = await postJson<{
        fiche: FicheAPC;
        fiches?: FicheAPC[];
        compilationTitle?: string;
      }>('/api/apc/import', {
        format: apiTextFormat,
        fileName: parsed.fileName,
        fileSize: parsed.fileSize,
        textContent,
        referenceFiche: selectedReferenceFiche,
        handicapProfiles: selectedHandicaps,
        extractMode,
        adaptationInstruction: adaptationInstruction.trim(),
        quality,
        preferences,
      });

      const list =
        Array.isArray(data.fiches) && data.fiches.length > 0
          ? data.fiches
          : [data.fiche];
      handleExtractionOutcome(list, parsed.fileName, data.compilationTitle);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors du traitement du fichier.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handlePasteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    setError(null);
    setStatusMessage(null);
    setModifiedSections([]);
    setImporting(true);

    try {
      if (isRetouchActiveMode) {
        await runRetouchWithSourceFile({
          format: 'text',
          fileName: 'Texte externe collé',
          textContent: pastedText,
        });
        setPastedText('');
        return;
      }

      if (!isOnline) {
        const offlineList = buildImportedCompilationsFromText(
          'Texte collé',
          pastedText,
          {
            format: 'text',
            handicapProfiles: selectedHandicaps,
            referenceFiche: selectedReferenceFiche,
          }
        );
        handleExtractionOutcome(offlineList, 'Texte collé');
        setPastedText('');
        return;
      }

      const data = await postJson<{
        fiche: FicheAPC;
        fiches?: FicheAPC[];
        compilationTitle?: string;
      }>('/api/apc/import', {
        format: 'text',
        fileName: 'Texte collé',
        textContent: pastedText,
        referenceFiche: selectedReferenceFiche,
        handicapProfiles: selectedHandicaps,
        extractMode,
        adaptationInstruction: adaptationInstruction.trim(),
        quality,
        preferences,
      });

      const list =
        Array.isArray(data.fiches) && data.fiches.length > 0
          ? data.fiches
          : [data.fiche];
      handleExtractionOutcome(list, 'Texte collé', data.compilationTitle);
      setPastedText('');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Impossible de convertir le texte saisi.'
      );
    } finally {
      setImporting(false);
    }
  };

  const adaptStagedCompilationLocally = () => {
    if (!stagedCompilation) return;
    const adapted = stagedCompilation.fiches.map((f) =>
      stagedCompilation.selectedIds.includes(f.id)
        ? applyBatchLocalAdaptationToFiche(f, {
            handicapProfiles: selectedHandicaps,
            refreshManipulationPhases: true,
            alignDisciplineSubtitles: true,
          })
        : f
    );
    setStagedCompilation({
      ...stagedCompilation,
      fiches: adapted,
    });
    setStatusMessage(
      `${stagedCompilation.selectedIds.length} fiche(s) de la compilation adaptée(s) (inclusion handicap, phases, exercices & sous-titres disciplinaires).`
    );
  };

  const commitStagedCompilation = (targetTab: WorkspaceTab) => {
    if (!stagedCompilation) return;
    const chosen = stagedCompilation.fiches.filter((f) =>
      stagedCompilation.selectedIds.includes(f.id)
    );
    if (chosen.length === 0) return;

    if (onFichesImported) {
      onFichesImported(chosen, targetTab);
    } else {
      chosen.forEach((f) => onFicheImported(f));
    }
    setStatusMessage(
      `${chosen.length} fiche(s) ajoutée(s) à votre bibliothèque APC.`
    );
    setStagedCompilation(null);
  };

  const requestExportWithPreview = async (type: PreviewExportAction) => {
    if (onOpenPrintPreview) {
      onOpenPrintPreview(activeFiche, type);
      return;
    }
    if (type === 'print') {
      window.print();
      return;
    }
    if (type === 'preview') return;
    setExportingType(type);
    setError(null);
    try {
      if (type === 'docx') {
        await onExportDocx(activeFiche);
      } else {
        await onExportPdf(activeFiche);
      }
      setStatusMessage(
        `Export ${type === 'docx' ? 'Word (.docx)' : 'PDF (.pdf)'} généré et téléchargé.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la génération du fichier.'
      );
    } finally {
      setExportingType(null);
    }
  };

  const handleLibraryCompilationExport = async (
    format: 'docx' | 'pdf' | 'json',
    sourceFiches?: FicheAPC[],
    customTitle?: string
  ) => {
    const list = sourceFiches && sourceFiches.length > 0 ? sourceFiches : allFiches;
    if (list.length === 0) return;
    const title = customTitle || 'Compilation complète Atelier APC';

    if (format === 'json') {
      const bundle = {
        kind: 'atelier_apc_compilation',
        titreCompilation: title,
        exporteLe: new Date().toISOString(),
        nombreFiches: list.length,
        fiches: list,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });
      triggerBlobDownload(blob, `${slugifyFilename(title)}.json`);
      setStatusMessage(`Recueil JSON exporté (${list.length} fiches).`);
      return;
    }

    setExportingType(format === 'docx' ? 'comp-docx' : 'comp-pdf');
    setError(null);
    try {
      if (format === 'docx' && onExportCompilationDocx) {
        await onExportCompilationDocx(list, title);
      } else if (format === 'pdf' && onExportCompilationPdf) {
        await onExportCompilationPdf(list, title);
      }
      setStatusMessage(
        `Compilation ${format.toUpperCase()} générée (${list.length} fiches).`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’export de la compilation.'
      );
    } finally {
      setExportingType(null);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(activeFiche, null, 2)], {
      type: 'application/json',
    });
    triggerBlobDownload(blob, `${slugifyFilename(activeFiche.titre)}.json`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header + Export Actions */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-sky-700 tracking-wide">
            Tous fichiers (.docx, .pdf, .txt, .md, .csv, .html, .rtf, image, .json) &amp; Compilations APC
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Importation, compilations, retouche &amp; Export
          </h1>
          <p className="text-sm text-slate-600">
            Extrayez une fiche unique ou séparez automatiquement une compilation multi-fiches, adaptez-les avec différenciation, ou retouchez la fiche active à partir de tout fichier externe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onSwitchToEditor && (
            <button
              type="button"
              onClick={onSwitchToEditor}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              Retouche fine
            </button>
          )}
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
            PDF (.pdf)
          </button>
          <button
            type="button"
            onClick={() => requestExportWithPreview('print')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Quick Global Compilation Bar */}
      {allFiches.length > 1 && (
        <div className="no-print bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Layers className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Compilation de toute la bibliothèque</strong> ({allFiches.length} fiches disponibles avec sommaire et sauts de page)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToLibrary && (
              <button
                type="button"
                onClick={onSwitchToLibrary}
                className="px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:text-sky-800"
              >
                Sélectionner / retoucher en lot →
              </button>
            )}
            {onExportCompilationDocx && (
              <button
                type="button"
                disabled={exportingType !== null}
                onClick={() => handleLibraryCompilationExport('docx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors whitespace-nowrap"
              >
                {exportingType === 'comp-docx' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                Exporter recueil Word ({allFiches.length})
              </button>
            )}
            {onExportCompilationPdf && (
              <button
                type="button"
                disabled={exportingType !== null}
                onClick={() => handleLibraryCompilationExport('pdf')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
              >
                {exportingType === 'comp-pdf' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                Exporter recueil PDF ({allFiches.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => handleLibraryCompilationExport('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Recueil JSON
            </button>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="no-print p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5 text-sm text-emerald-900">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {modifiedSections.length > 0 && (
            <p className="text-xs text-emerald-800 pl-6">
              Sections modifiées : {modifiedSections.join(' · ')}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="no-print p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Staged Compilation Extraction Review */}
      {stagedCompilation && (
        <section
          aria-label="Aperçu de la compilation extraite"
          className="no-print bg-white border border-sky-300 rounded-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Compilation extraite : {stagedCompilation.title} ({stagedCompilation.fiches.length} fiches)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Vérifiez les fiches séparées depuis « {stagedCompilation.sourceFileName} », adaptez-les si besoin, puis ajoutez la sélection à votre bibliothèque.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStagedCompilation(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 self-start"
              aria-label="Fermer l’aperçu de compilation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {stagedCompilation.fiches.map((f, idx) => {
              const checked = stagedCompilation.selectedIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() =>
                    setStagedCompilation((prev) => {
                      if (!prev) return null;
                      const exists = prev.selectedIds.includes(f.id);
                      return {
                        ...prev,
                        selectedIds: exists
                          ? prev.selectedIds.filter((id) => id !== f.id)
                          : [...prev.selectedIds, f.id],
                      };
                    })
                  }
                  className={`p-3 rounded-md border cursor-pointer transition-colors space-y-1 ${
                    checked
                      ? 'bg-sky-50/60 border-sky-400'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {idx + 1}. {f.titre}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {f.matiere} · {f.niveau} · {f.duree} · {f.deroulement.length} étapes
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6 line-clamp-1">
                    {f.competenceDeBase || f.theme}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={adaptStagedCompilationLocally}
                disabled={stagedCompilation.selectedIds.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Adapter inclusion &amp; phases ({stagedCompilation.selectedIds.length})
              </button>
              {onExportCompilationDocx && (
                <button
                  type="button"
                  disabled={stagedCompilation.selectedIds.length === 0 || exportingType !== null}
                  onClick={() =>
                    handleLibraryCompilationExport(
                      'docx',
                      stagedCompilation.fiches.filter((f) =>
                        stagedCompilation.selectedIds.includes(f.id)
                      ),
                      stagedCompilation.title
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-sky-600" />
                  Exporter compilation Word
                </button>
              )}
              {onExportCompilationPdf && (
                <button
                  type="button"
                  disabled={stagedCompilation.selectedIds.length === 0 || exportingType !== null}
                  onClick={() =>
                    handleLibraryCompilationExport(
                      'pdf',
                      stagedCompilation.fiches.filter((f) =>
                        stagedCompilation.selectedIds.includes(f.id)
                      ),
                      stagedCompilation.title
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Exporter PDF
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={stagedCompilation.selectedIds.length === 0}
                onClick={() => commitStagedCompilation('library')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded transition-colors"
              >
                Importer dans la Bibliothèque ({stagedCompilation.selectedIds.length})
              </button>
              <button
                type="button"
                disabled={stagedCompilation.selectedIds.length === 0}
                onClick={() => commitStagedCompilation('workspace')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded transition-colors"
              >
                Importer &amp; ouvrir dans l’Atelier
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="no-print lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          {/* Distinction Fiche active vs Action sur Fichier */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                Fiche active en mémoire
              </span>
              <span className="font-mono text-slate-600">
                {activeFiche.matiere} · {activeFiche.niveau}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate">
              {activeFiche.titre}
            </p>
            {activeFiche.fichierSource && (
              <p className="text-[11px] text-slate-500 truncate">
                Dernier fichier associé ({activeFiche.fichierSource.action === 'retouche' ? 'retouche' : 'création'}) : {activeFiche.fichierSource.nom}
              </p>
            )}
          </div>

          {/* Action Selector */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Action lors du chargement du fichier
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFileActionMode('create_new')}
                className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition-colors ${
                  fileActionMode === 'create_new'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="block font-semibold">Nouvelle(s) fiche(s)</span>
                <span
                  className={`block text-[10px] mt-0.5 ${
                    fileActionMode === 'create_new' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Fichier / compilation → fiche(s)
                </span>
              </button>
              <button
                type="button"
                disabled={!onUpdateFiche}
                onClick={() => setFileActionMode('retouch_active')}
                className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition-colors disabled:opacity-50 ${
                  isRetouchActiveMode
                    ? 'bg-sky-600 text-white border-sky-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="block font-semibold">Retoucher la fiche active</span>
                <span
                  className={`block text-[10px] mt-0.5 ${
                    isRetouchActiveMode ? 'text-sky-100' : 'text-slate-500'
                  }`}
                >
                  Fichier → mise à jour ciblée
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-sky-600" />
              {isRetouchActiveMode
                ? 'Fichier d’appui pour retoucher la fiche active'
                : 'Importer un fichier ou une compilation'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isRetouchActiveMode
                ? 'Tout fichier (.docx, .pdf, .txt, .md, .csv, .html, .rtf, image) sert uniquement de source d’enrichissement : seules les couches sélectionnées seront retouchées sur la fiche active.'
                : 'Chargez Word (.docx), PDF, image, HTML, RTF, CSV/TSV, Markdown, Texte ou recueil JSON (12 Mo max).'}
            </p>
          </div>

          {isRetouchActiveMode ? (
            <div className="space-y-3 p-3 bg-sky-50/70 border border-sky-200 rounded-md">
              <label className="block">
                <span className="block text-[11px] font-semibold text-sky-900 mb-1">
                  Portée de contenu à retoucher
                </span>
                <select
                  value={retouchScope}
                  onChange={(e) => setRetouchScope(e.target.value as RetouchScope)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-sky-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {RETOUCH_SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold text-sky-900 mb-1">
                  Consigne spécifique (optionnelle)
                </span>
                <input
                  type="text"
                  value={retouchInstruction}
                  onChange={(e) => setRetouchInstruction(e.target.value)}
                  placeholder="Ex : Intègre l’exercice 2 et adapte les indicateurs inclusifs…"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-sky-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <label className="block">
                <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Traitement des compilations multi-fiches
                </span>
                <select
                  value={extractMode}
                  onChange={(e) =>
                    setExtractMode(
                      e.target.value as 'auto' | 'compilation' | 'single'
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="auto">
                    Détection automatique (1 fiche ou compilation multi-fiches)
                  </option>
                  <option value="compilation">
                    Forcer la séparation en compilation de fiches
                  </option>
                  <option value="single">
                    Convertir tout le document en 1 seule fiche
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Adaptation à appliquer dès l’importation (optionnelle)
                </span>
                <input
                  type="text"
                  value={adaptationInstruction}
                  onChange={(e) => setAdaptationInstruction(e.target.value)}
                  placeholder="Ex : Adapter au CM2, enrichir en Q&R et renforcer l’étayage DYS…"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            </div>
          )}

          {/* Handicap Profiles Compact Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-sky-600" />
              Profils handicap inclus ({selectedHandicaps.length}/{HANDICAP_PROFILES.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {HANDICAP_PROFILES.map((p) => {
                const checked = selectedHandicaps.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleHandicap(p.id)}
                    className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                      checked
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {p.court}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {!isRetouchActiveMode && allFiches.length > 0 && (
              <label className="block">
                <span className="block text-[11px] font-medium text-slate-600 mb-1">
                  Modèle identique (optionnel)
                </span>
                <select
                  value={referenceFicheId}
                  onChange={(e) => setReferenceFicheId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Structure APC standard</option>
                  {allFiches.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.matiere} — {f.titre.slice(0, 32)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className={`block ${isRetouchActiveMode ? 'sm:col-span-2' : ''}`}>
              <span className="block text-[11px] font-medium text-slate-600 mb-1">
                Qualité d’analyse IA
              </span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ReasoningQuality)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="rapide">Rapide</option>
                <option value="equilibre">Équilibré (Recommandé)</option>
                <option value="expert">Expert Approfondi</option>
              </select>
            </label>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt ou sélection de tout fichier pédagogique"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors space-y-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              isRetouchActiveMode
                ? 'border-sky-300 hover:border-sky-600 bg-sky-50/40'
                : 'border-slate-300 hover:border-sky-500 bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={UNIVERSAL_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
            />
            {importing ? (
              <div className="space-y-2">
                <Loader2 className="w-7 h-7 text-sky-600 animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-800">
                  {isRetouchActiveMode
                    ? 'Extraction du fichier et retouche ciblée de la fiche active…'
                    : 'Analyse multi-formats et extraction des fiches APC…'}
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-800">
                  {isRetouchActiveMode
                    ? 'Déposez un fichier pour retoucher « ' +
                      activeFiche.titre.slice(0, 28) +
                      (activeFiche.titre.length > 28 ? '…' : '') +
                      ' »'
                    : 'Déposez Word, PDF, Image, CSV, HTML, RTF, Markdown ou JSON'}
                </p>
                <p className="text-xs text-slate-500">
                  {isRetouchActiveMode
                    ? 'Les sections hors portée choisie restent protégées'
                    : 'Gère aussi bien 1 fiche isolée qu’une compilation de plusieurs séances'}
                </p>
              </>
            )}
          </div>

          <form onSubmit={handlePasteImport} className="space-y-2.5 pt-2 border-t border-slate-100">
            <label
              htmlFor="paste-import"
              className="block text-xs font-medium text-slate-700"
            >
              {isRetouchActiveMode
                ? 'Ou coller un extrait externe pour retoucher la fiche active'
                : 'Ou coller le texte brut d’une fiche ou d’une compilation'}
            </label>
            <textarea
              id="paste-import"
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={
                isRetouchActiveMode
                  ? 'Collez ici un exercice, texte d’appui ou consigne à injecter dans la fiche active…'
                  : 'Collez ici une séance isolée ou plusieurs fiches/séances (ex: Fiche 1…, Fiche 2…)…'
              }
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={importing || !pastedText.trim()}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors"
            >
              {isRetouchActiveMode
                ? 'Retoucher la fiche active avec cet extrait'
                : isOnline
                ? 'Analyser et importer avec l’IA'
                : 'Importer localement (hors-ligne)'}
            </button>
          </form>
        </div>

        {/* Live A4 Print-Ready Preview using unified PreviewSheet */}
        <div className="lg:col-span-7 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Aperçu complet de la fiche active (rendu unifié A4)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {activeFiche.matiere} · {activeFiche.niveau} · {activeFiche.duree}
              </span>
              <button
                type="button"
                onClick={() => setShowTtsPlayer((v) => !v)}
                aria-pressed={showTtsPlayer}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  showTtsPlayer
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                Écouter
              </button>
            </div>
          </div>

          {showTtsPlayer && (
            <FicheTtsPlayer
              key={activeFiche.id}
              fiche={activeFiche}
              autoStart
              onClose={() => setShowTtsPlayer(false)}
            />
          )}

          <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 sm:p-5 overflow-x-auto">
            <PreviewSheet fiche={activeFiche} zoom={85} showPageGuides={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
