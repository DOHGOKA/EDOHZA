'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  FileDown,
  FileText,
  Moon,
  Printer,
  Ruler,
  SlidersHorizontal,
  Sun,
  Volume2,
} from 'lucide-react';
import { FicheAPC, PreferenceApprentissage, WorkspaceTab } from '@/lib/types';
import {
  cloneFicheDeep,
  createCompactSnapshot,
  loadActiveFicheId,
  loadFiches,
  loadPreferences,
  SAMPLE_FICHES,
  DEFAULT_PREFERENCES,
  saveActiveFicheId,
  saveFiches,
  savePreferences,
} from '@/lib/storage';
import { createUid } from '@/lib/utils';
import { exportCompilationToDocx, exportFicheToDocx } from '@/lib/export-docx';
import { exportCompilationToPdf, exportFicheToPdf } from '@/lib/export-pdf';
import LibraryView from './LibraryView';
import GeneratorView from './GeneratorView';
import EditorView from './EditorView';
import ImportExportView from './ImportExportView';
import PrintPreviewModal, { PreviewExportAction } from './PrintPreviewModal';
import WorkspaceSidebarForms from './WorkspaceSidebarForms';
import PreviewSheet, { PreviewZoom } from './PreviewSheet';
import FicheTtsPlayer from './FicheTtsPlayer';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getOnlineServerSnapshot() {
  return true;
}

const THEME_STORAGE_KEY = 'atelier-apc-theme-v1';

export default function AtelierWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('workspace');
  const [fiches, setFiches] = useState<FicheAPC[]>(SAMPLE_FICHES);
  const [activeFicheId, setActiveFicheId] = useState<string>(SAMPLE_FICHES[0].id);
  const [preferences, setPreferences] =
    useState<PreferenceApprentissage[]>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>(100);
  const [showPageGuides, setShowPageGuides] = useState<boolean>(true);
  const [showTtsPlayer, setShowTtsPlayer] = useState<boolean>(false);
  const [previewRequest, setPreviewRequest] = useState<{
    fiche: FicheAPC;
    initialAction: PreviewExportAction;
  } | null>(null);
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const storedFiches = loadFiches();
      const storedPrefs = loadPreferences();
      const storedActiveId = loadActiveFicheId();
      const storedTheme =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(THEME_STORAGE_KEY)
          : null;
      const isDark = storedTheme === 'dark';

      setFiches(storedFiches);
      setPreferences(storedPrefs);
      setDarkMode(isDark);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
      }
      if (storedActiveId && storedFiches.some((f) => f.id === storedActiveId)) {
        setActiveFicheId(storedActiveId);
      } else {
        setActiveFicheId(storedFiches[0].id);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage write failures
    }
  }, [darkMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const res = saveFiches(fiches);
    if (!res.ok && res.error) {
      queueMicrotask(() => setStorageWarning(res.error || null));
    } else if (res.trimmed) {
      queueMicrotask(() =>
        setStorageWarning(
          'Mémoire locale presque pleine : les anciens instantanés de révision ont été compactés automatiquement.'
        )
      );
    }
  }, [fiches, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePreferences(preferences);
  }, [preferences, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveActiveFicheId(activeFicheId);
  }, [activeFicheId, hydrated]);

  const activeFiche =
    fiches.find((f) => f.id === activeFicheId) || fiches[0] || SAMPLE_FICHES[0];

  const handleSelectFiche = (id: string, openTab: WorkspaceTab = 'workspace') => {
    setActiveFicheId(id);
    setActiveTab(openTab);
  };

  const handleUpdateFiche = (updated: FicheAPC) => {
    setFiches((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleSaveManualSnapshot = (source: FicheAPC) => {
    const cloned = cloneFicheDeep(source);
    const now = new Date().toISOString();
    const snap = createCompactSnapshot(cloned);
    const label = `Sauvegarde — ${cloned.titre.slice(0, 28)}`;
    handleUpdateFiche({
      ...cloned,
      updatedAt: now,
      historique: [
        {
          id: createUid('hist'),
          date: now,
          action: label,
          resume: `Fiche « ${cloned.titre} » sauvegardée (${(cloned.deroulement || []).length} étapes).`,
          snapshot: snap,
        },
        ...(Array.isArray(cloned.historique) ? cloned.historique.slice(0, 19) : []),
      ],
    });
  };

  const handleFicheCreated = (created: FicheAPC) => {
    setFiches((prev) => [created, ...prev]);
    setActiveFicheId(created.id);
    setActiveTab('workspace');
  };

  const handleMultipleFichesCreated = (
    createdList: FicheAPC[],
    targetTab?: WorkspaceTab
  ) => {
    if (!createdList || createdList.length === 0) return;
    setFiches((prev) => [...createdList, ...prev]);
    setActiveFicheId(createdList[0].id);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  const handleBatchUpdateFiches = (updatedList: FicheAPC[]) => {
    if (!updatedList || updatedList.length === 0) return;
    const byId = new Map(updatedList.map((f) => [f.id, f]));
    setFiches((prev) => prev.map((f) => byId.get(f.id) || f));
  };

  const handleRenameFiche = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setFiches((prev) =>
      prev.map((f) => {
        if (f.id !== id || f.titre === trimmed) return f;
        return {
          ...f,
          titre: trimmed,
          updatedAt: now,
          historique: [
            {
              id: createUid('hist'),
              date: now,
              action: 'Renommage',
              resume: `Fiche renommée en « ${trimmed} ».`,
            },
            ...(Array.isArray(f.historique) ? f.historique.slice(0, 19) : []),
          ],
        };
      })
    );
  };

  const handleSaveFicheAsNew = (
    source: FicheAPC,
    customTitle?: string,
    openSaved = true
  ) => {
    const cloned = cloneFicheDeep(source);
    const now = new Date().toISOString();
    const title = customTitle?.trim() || `${cloned.titre} (sauvegarde)`;
    const savedCopy: FicheAPC = {
      ...cloned,
      id: createUid('fiche-hist'),
      titre: title,
      createdAt: now,
      updatedAt: now,
      historique: [
        {
          id: createUid('hist'),
          date: now,
          action: 'Sauvegarde nommée',
          resume: `Fiche sauvegardée dans l’historique sous « ${title} ».`,
        },
        ...(Array.isArray(cloned.historique) ? cloned.historique.slice(0, 14) : []),
      ],
    };
    setFiches((prev) => [savedCopy, ...prev]);
    if (openSaved) {
      setActiveFicheId(savedCopy.id);
    }
  };

  const handleDuplicateFiche = (id: string) => {
    const source = fiches.find((f) => f.id === id);
    if (!source) return;
    const cloned = cloneFicheDeep(source);
    const now = new Date().toISOString();
    const copy: FicheAPC = {
      ...cloned,
      id: createUid('fiche-copy'),
      titre: `${cloned.titre} (copie)`,
      createdAt: now,
      updatedAt: now,
      historique: [
        {
          id: createUid('hist'),
          date: now,
          action: 'Duplication',
          resume: `Copie créée à partir de « ${cloned.titre} ».`,
        },
      ],
    };
    setFiches((prev) => [copy, ...prev]);
    setActiveFicheId(copy.id);
    setActiveTab('workspace');
  };

  const handleDeleteFiche = (id: string) => {
    if (fiches.length <= 1) return;
    const next = fiches.filter((f) => f.id !== id);
    setFiches(next);
    if (activeFicheId === id) {
      setActiveFicheId(next[0].id);
    }
  };

  const handleAddPreference = (regle: string, source = 'Directive enseignant') => {
    const exists = preferences.some(
      (p) => p.regle.toLowerCase() === regle.toLowerCase()
    );
    if (exists) return;
    const nextPref: PreferenceApprentissage = {
      id: createUid('pref'),
      date: new Date().toISOString(),
      regle,
      source,
    };
    setPreferences((prev) => [nextPref, ...prev]);
  };

  const handleDeletePreference = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  const navItems: { id: WorkspaceTab; label: string }[] = [
    { id: 'workspace', label: 'Atelier' },
    { id: 'library', label: 'Bibliothèque' },
    { id: 'generator', label: 'Générateur IA' },
    { id: 'editor', label: 'Éditeur' },
    { id: 'import-export', label: 'Import / Export' },
  ];

  const openPrintPreview = (
    ficheToPreview: FicheAPC,
    initialAction: PreviewExportAction = 'preview'
  ) => {
    setPreviewRequest({ fiche: ficheToPreview, initialAction });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen flex flex-col bg-slate-50 ${
          previewRequest ? 'no-print' : ''
        }`}
      >
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Single-element Brand Wordmark */}
            <button
              type="button"
              onClick={() => setActiveTab('workspace')}
              className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left"
            >
              Atelier APC
            </button>

            {/* Zone 2: 5 Clean Single-Line Nav Links */}
            <nav
              aria-label="Navigation principale"
              className="flex items-center gap-4 sm:gap-6 overflow-x-auto"
            >
              {navItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative py-5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'text-slate-900'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Theme Toggle + 1 Primary Action */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-pressed={darkMode}
                aria-label={
                  darkMode
                    ? 'Passer en mode clair'
                    : 'Passer en mode sombre pour le confort visuel'
                }
                title={
                  darkMode ? 'Passer en mode clair' : 'Activer le mode sombre'
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="hidden md:inline">
                  {darkMode ? 'Mode clair' : 'Mode sombre'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Nouvelle fiche
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1">
          {storageWarning && (
            <div className="no-print max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between gap-3">
                <span>{storageWarning}</span>
                <button
                  type="button"
                  onClick={() => setStorageWarning(null)}
                  className="font-semibold text-amber-800 hover:text-amber-950 shrink-0"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'workspace' && (
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sidebar: Input Forms (APC Details, Objectives, Students) */}
                    <aside
                      aria-label="Barre latérale des formulaires de saisie APC"
                      className="no-print w-full lg:w-[400px] xl:w-[420px] shrink-0 lg:sticky lg:top-20"
                    >
                      <WorkspaceSidebarForms
                        key={activeFiche.id}
                        fiche={activeFiche}
                        allFiches={fiches}
                        isOnline={isOnline}
                        onUpdateFiche={handleUpdateFiche}
                        onSelectFiche={(id) => setActiveFicheId(id)}
                        onOpenFullEditor={() => setActiveTab('editor')}
                        onSaveSnapshot={handleSaveManualSnapshot}
                      />
                    </aside>

                    {/* Main Preview Area: Pedagogical Sheet Document */}
                    <section
                      aria-label="Zone principale d’aperçu du document pédagogique"
                      className="flex-1 min-w-0 w-full space-y-4"
                    >
                      {/* Preview Toolbar */}
                      <div className="no-print bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-sky-700">
                              {activeFiche.matiere}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{activeFiche.niveau}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {activeFiche.duree}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {(activeFiche.deroulement || []).length} étapes
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {(activeFiche.eleves || []).length} élèves suivis
                            </span>
                          </div>
                          <h2 className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                            Aperçu en direct de la fiche pédagogique
                          </h2>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <div
                            className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-md"
                            aria-label="Zoom de l’aperçu du document"
                          >
                            {([85, 100, 110] as PreviewZoom[]).map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setPreviewZoom(level)}
                                className={`px-2 py-1 text-[11px] font-mono tabular-nums font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                                  previewZoom === level
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {level}%
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowPageGuides((v) => !v)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                              showPageGuides
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            Repères A4
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('editor')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                            Éditeur avancé
                          </button>

                          <button
                            type="button"
                            onClick={() => openPrintPreview(activeFiche, 'preview')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-600" />
                            Aperçu A4
                          </button>

                          <button
                            type="button"
                            onClick={() => openPrintPreview(activeFiche, 'docx')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            Word
                          </button>

                          <button
                            type="button"
                            onClick={() => openPrintPreview(activeFiche, 'pdf')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            PDF
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowTtsPlayer((v) => !v)}
                            aria-pressed={showTtsPlayer}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
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
                            onClick={() => openPrintPreview(activeFiche, 'print')}
                            aria-label="Imprimer la fiche pédagogique"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5" />
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

                      {/* Document Canvas */}
                      <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-4 sm:p-6 lg:p-8 overflow-x-auto">
                        <PreviewSheet
                          fiche={activeFiche}
                          zoom={previewZoom}
                          showPageGuides={showPageGuides}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'library' && (
                <LibraryView
                  fiches={fiches}
                  activeFicheId={activeFiche.id}
                  preferences={preferences}
                  isOnline={isOnline}
                  onSelectFiche={(id) => handleSelectFiche(id, 'workspace')}
                  onCreateFicheFromTemplate={handleFicheCreated}
                  onRenameFiche={handleRenameFiche}
                  onSaveFicheAsNew={handleSaveFicheAsNew}
                  onDuplicateFiche={handleDuplicateFiche}
                  onDeleteFiche={handleDeleteFiche}
                  onBatchUpdateFiches={handleBatchUpdateFiches}
                  onGoToGenerator={() => setActiveTab('generator')}
                  onExportDocx={exportFicheToDocx}
                  onExportPdf={exportFicheToPdf}
                  onExportCompilationDocx={exportCompilationToDocx}
                  onExportCompilationPdf={exportCompilationToPdf}
                  onOpenPrintPreview={openPrintPreview}
                  onAddPreference={(regle) => handleAddPreference(regle)}
                  onDeletePreference={handleDeletePreference}
                />
              )}

              {activeTab === 'generator' && (
                <GeneratorView
                  isOnline={isOnline}
                  fiches={fiches}
                  preferences={preferences}
                  onFicheGenerated={handleFicheCreated}
                  onLearnPreference={handleAddPreference}
                />
              )}

              {activeTab === 'editor' && (
                <EditorView
                  key={activeFiche.id}
                  fiche={activeFiche}
                  allFiches={fiches}
                  isOnline={isOnline}
                  preferences={preferences}
                  onUpdateFiche={handleUpdateFiche}
                  onSelectFiche={(id) => handleSelectFiche(id, 'editor')}
                  onRenameFiche={handleRenameFiche}
                  onSaveFicheAsNew={handleSaveFicheAsNew}
                  onFicheCreated={handleFicheCreated}
                  onLearnPreference={handleAddPreference}
                  onExportDocx={exportFicheToDocx}
                  onExportPdf={exportFicheToPdf}
                  onOpenPrintPreview={openPrintPreview}
                />
              )}

              {activeTab === 'import-export' && (
                <ImportExportView
                  activeFiche={activeFiche}
                  allFiches={fiches}
                  isOnline={isOnline}
                  preferences={preferences}
                  onFicheImported={handleFicheCreated}
                  onFichesImported={handleMultipleFichesCreated}
                  onUpdateFiche={handleUpdateFiche}
                  onSwitchToEditor={() => setActiveTab('editor')}
                  onSwitchToLibrary={() => setActiveTab('library')}
                  onExportDocx={exportFicheToDocx}
                  onExportPdf={exportFicheToPdf}
                  onExportCompilationDocx={exportCompilationToDocx}
                  onExportCompilationPdf={exportCompilationToPdf}
                  onOpenPrintPreview={openPrintPreview}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="no-print border-t border-slate-200 bg-white mt-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Atelier APC — Conception et export haute qualité pour Activités Pédagogiques Complémentaires
            </span>
            <span>
              Stockage local sécurisé · Formats Word (.docx) et PDF A4
            </span>
          </div>
        </footer>
      </div>

      {previewRequest && (
        <PrintPreviewModal
          key={`${previewRequest.fiche.id}-${previewRequest.initialAction}`}
          fiche={previewRequest.fiche}
          initialAction={previewRequest.initialAction}
          onClose={() => setPreviewRequest(null)}
          onExportDocx={exportFicheToDocx}
          onExportPdf={exportFicheToPdf}
        />
      )}
    </MotionConfig>
  );
}
