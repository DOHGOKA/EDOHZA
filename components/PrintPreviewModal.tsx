'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Loader2,
  Printer,
  Ruler,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FicheAPC } from '@/lib/types';
import { formatHandicapSummary } from '@/lib/inclusion';
import {
  getEffectiveManipulationSchematisation,
  mapPhasesToDeroulementSteps,
} from '@/lib/manipulation-phases';
import { sanitizeSvg } from '@/lib/svg-sanitize';
import PhaseManipulationInteractiveDeck from './PhaseManipulationInteractiveDeck';

export type PreviewExportAction = 'preview' | 'docx' | 'pdf' | 'print';

interface PrintPreviewModalProps {
  fiche: FicheAPC;
  initialAction: PreviewExportAction;
  onClose: () => void;
  onExportDocx: (fiche: FicheAPC) => Promise<void>;
  onExportPdf: (fiche: FicheAPC) => Promise<void>;
}

type ZoomLevel = 75 | 100 | 115;

export default function PrintPreviewModal({
  fiche,
  initialAction,
  onClose,
  onExportDocx,
  onExportPdf,
}: PrintPreviewModalProps) {
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [showPageGuides, setShowPageGuides] = useState<boolean>(true);
  const [exportingType, setExportingType] = useState<'docx' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const diagnostics = useMemo(() => {
    const objectifs = fiche.objectifsSpecifiques || [];
    const deroulement = fiche.deroulement || [];
    const questions = fiche.questionsReponses || [];
    const hasCb = Boolean(fiche.competenceDeBase?.trim());
    const hasObjectifs = objectifs.some((o) => o.trim().length > 0);
    const hasAllStepsFilled =
      deroulement.length > 0 &&
      deroulement.every(
        (s) =>
          s.etape.trim() &&
          s.activitesMaitre.trim() &&
          s.activitesEleves.trim() &&
          s.indicateursInclusifs.trim()
      );
    const hasTraceEcrite = Boolean(fiche.synthese?.traceEcriteEleve?.trim());
    const activeManip = getEffectiveManipulationSchematisation(fiche);
    const hasMathPhases = Boolean(
      activeManip && (activeManip.phases || []).length > 0
    );
    const hasSvgIllustration = Boolean(fiche.illustration?.svgCode?.trim());

    const warnings: string[] = [];
    if (!hasCb) warnings.push('CB (Compétence de Base) non renseignée');
    if (!hasObjectifs) warnings.push('Aucun objectif spécifique saisi');
    if (!hasAllStepsFilled) warnings.push('Certaines cellules du déroulement sont vides');
    if (!hasTraceEcrite) warnings.push('Trace écrite élève manquante');

    return {
      hasCb,
      hasObjectifs,
      hasAllStepsFilled,
      hasTraceEcrite,
      hasMathPhases,
      hasSvgIllustration,
      warnings,
      stepsCount: deroulement.length,
      qrCount: questions.length,
    };
  }, [fiche]);

  const activeManipulation = useMemo(
    () => getEffectiveManipulationSchematisation(fiche),
    [fiche]
  );
  const { stepPhaseMap, unmappedPhases } = useMemo(
    () =>
      mapPhasesToDeroulementSteps(
        fiche.deroulement || [],
        activeManipulation?.phases || []
      ),
    [fiche.deroulement, activeManipulation]
  );
  const situationRef =
    activeManipulation?.situationProblemeReference ||
    fiche.introduction?.accroche ||
    fiche.introduction?.miseEnSituation ||
    '';

  const handleConfirmExport = async (type: 'docx' | 'pdf') => {
    setExportingType(type);
    setExportError(null);
    setExportSuccess(null);
    try {
      if (type === 'docx') {
        await onExportDocx(fiche);
        setExportSuccess('Document Word (.docx) généré et téléchargé avec succès.');
      } else {
        await onExportPdf(fiche);
        setExportSuccess('Document PDF (.pdf) généré et téléchargé avec succès.');
      }
    } catch (err: unknown) {
      setExportError(
        err instanceof Error
          ? err.message
          : 'Impossible de finaliser le téléchargement du document.'
      );
    } finally {
      setExportingType(null);
    }
  };

  const handleConfirmPrint = () => {
    setExportError(null);
    window.print();
  };

  const paperWidthClass =
    zoom === 75
      ? 'max-w-[620px] text-[11px]'
      : zoom === 115
        ? 'max-w-[920px] text-[13.5px]'
        : 'max-w-[794px] text-xs';

  const getPrimaryLabel = (type: 'docx' | 'pdf' | 'print') => {
    if (type === 'docx') {
      return initialAction === 'docx'
        ? 'Confirmer et exporter Word (.docx)'
        : 'Word (.docx)';
    }
    if (type === 'pdf') {
      return initialAction === 'pdf'
        ? 'Confirmer et exporter PDF (.pdf)'
        : 'PDF (.pdf)';
    }
    return initialAction === 'print'
      ? 'Confirmer et imprimer A4'
      : 'Imprimer A4';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-modal-title"
      className="print-modal-root fixed inset-0 z-50 flex flex-col bg-slate-900/65 backdrop-blur-xs"
    >
      {/* Modal Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Eye className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold text-sky-700">
              Aperçu avant export et impression A4
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{fiche.matiere}</span>
            <span aria-hidden="true">·</span>
            <span>{fiche.niveau}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{fiche.duree}</span>
          </div>
          <h2
            id="print-preview-modal-title"
            className="text-base sm:text-lg font-display font-semibold text-slate-900 truncate mt-0.5"
          >
            {fiche.titre}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Zoom Controls */}
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200"
            aria-label="Zoom de l'aperçu"
          >
            <button
              type="button"
              onClick={() =>
                setZoom((z) => (z === 115 ? 100 : 75))
              }
              disabled={zoom === 75}
              title="Réduire l’aperçu"
              aria-label="Réduire l’aperçu"
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-35 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {([75, 100, 115] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setZoom(level)}
                className={`px-2 py-1 text-[11px] font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  zoom === level
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level}%
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setZoom((z) => (z === 75 ? 100 : 115))
              }
              disabled={zoom === 115}
              title="Agrandir l’aperçu"
              aria-label="Agrandir l’aperçu"
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-35 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPageGuides((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
              showPageGuides
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Repères A4
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l’aperçu avant export"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Fermer
          </button>
        </div>
      </div>

      {/* Formatting Verification Strip (Hidden when printing) */}
      <div className="no-print bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {diagnostics.warnings.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Mise en page vérifiée — tous les blocs APC essentiels sont complets
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Points à vérifier : {diagnostics.warnings.join(' · ')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-mono">
          <span>{diagnostics.stepsCount} étapes</span>
          <span aria-hidden="true">·</span>
          <span>
            {diagnostics.hasSvgIllustration ? 'Schéma inclus' : 'Sans schéma'}
          </span>
          {diagnostics.hasMathPhases && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {activeManipulation?.phases.length || 3} phases manipul.
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{diagnostics.qrCount} Q&amp;R</span>
        </div>
      </div>

      {/* Feedback Banner if export succeeds or fails */}
      {(exportError || exportSuccess) && (
        <div className="no-print px-4 sm:px-6 pt-3 shrink-0">
          {exportError && (
            <div className="max-w-[794px] mx-auto px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between gap-3">
              <span>{exportError}</span>
              <button
                type="button"
                onClick={() => setExportError(null)}
                className="font-semibold text-rose-700 hover:text-rose-900 shrink-0"
              >
                Fermer
              </button>
            </div>
          )}
          {exportSuccess && (
            <div className="max-w-[794px] mx-auto px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {exportSuccess}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-emerald-800 hover:text-emerald-950 shrink-0 whitespace-nowrap"
              >
                Retour à l’atelier
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scrollable Desk Area with A4 Sheet Preview */}
      <div
        className="print-modal-scroll flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <article
          className={`print-sheet mx-auto w-full ${paperWidthClass} bg-white text-slate-900 border border-slate-300 shadow-lg px-7 py-8 sm:px-11 sm:py-10 space-y-6 transition-all ${
            showPageGuides ? 'a4-page-guides' : ''
          }`}
        >
          {/* Document Header */}
          <header className="border-b-2 border-slate-900 pb-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
              Fiche pédagogique APC · Activités Pédagogiques Complémentaires
            </p>
            <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight text-balance">
              {fiche.titre || 'Fiche APC sans titre'}
            </h1>
            {fiche.theme && (
              <p className="text-sm text-slate-600 italic">
                Thème : {fiche.theme}
              </p>
            )}
          </header>

          {/* Identification Grid */}
          <section className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-400 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-slate-50/70">
              <div className="p-2.5">
                <span className="text-[10px] uppercase tracking-wide text-slate-500 block">
                  Matière
                </span>
                <strong className="text-slate-900">{fiche.matiere || '—'}</strong>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] uppercase tracking-wide text-slate-500 block">
                  Niveau scolaire
                </span>
                <strong className="text-slate-900">{fiche.niveau || '—'}</strong>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] uppercase tracking-wide text-slate-500 block">
                  Durée
                </span>
                <strong className="font-mono text-slate-900">
                  {fiche.duree || '—'}
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] uppercase tracking-wide text-slate-500 block">
                  Effectif / Groupe
                </span>
                <strong className="text-slate-900">{fiche.effectif || '—'}</strong>
              </div>
            </div>

            {fiche.competenceDeBase && (
              <div className="p-3 border border-sky-300 bg-sky-50/60 text-slate-900">
                <span className="font-bold text-sky-900">
                  CB (Compétence de Base) :{' '}
                </span>
                <span>{fiche.competenceDeBase}</span>
              </div>
            )}

            <div className="p-3 border border-slate-300 bg-white">
              <span className="font-bold text-slate-900">Compétence visée : </span>
              <span className="text-slate-800">{fiche.competenceVisee || '—'}</span>
            </div>

            {fiche.handicapsInclus && fiche.handicapsInclus.length > 0 && (
              <div className="p-3 border border-emerald-300 bg-emerald-50/50 text-slate-900">
                <span className="font-bold text-emerald-900">
                  Inclusion des enfants en situation de handicap :{' '}
                </span>
                <span>{formatHandicapSummary(fiche.handicapsInclus)}</span>
                {fiche.origineModele && (
                  <span className="text-slate-600">
                    {' '}
                    · Source : {fiche.origineModele}
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Section 1: Objectifs, prérequis & introduction */}
          <section className="space-y-2 border-t border-slate-200 pt-4">
            <h2 className="text-sm font-display font-bold text-slate-900">
              1. Objectifs, prérequis et mise en situation
            </h2>
            <div className="space-y-1.5 leading-relaxed text-slate-800">
              <p>
                <strong className="text-slate-900">Objectifs spécifiques : </strong>
                {(fiche.objectifsSpecifiques || []).filter(Boolean).join(' · ') || '—'}
              </p>
              {(fiche.prerequis || []).filter(Boolean).length > 0 && (
                <p>
                  <strong className="text-slate-900">Prérequis : </strong>
                  {(fiche.prerequis || []).filter(Boolean).join(' · ')}
                </p>
              )}
              <p>
                <strong className="text-slate-900">Matériel &amp; supports : </strong>
                {(fiche.materiel || []).filter(Boolean).join(' · ') || '—'}
              </p>
              <p>
                <strong className="text-slate-900">Accroche : </strong>
                {fiche.introduction?.accroche || '—'}
              </p>
              <p>
                <strong className="text-slate-900">Mise en situation : </strong>
                {fiche.introduction?.miseEnSituation || '—'}
              </p>
              <p>
                <strong className="text-slate-900">Consigne de départ : </strong>
                {fiche.introduction?.consigneDepart || '—'}
              </p>
            </div>
          </section>

          {/* Section 2: Déroulement pédagogique en 4 colonnes */}
          <section className="space-y-2.5 border-t border-slate-200 pt-4">
            <h2 className="text-sm font-display font-bold text-slate-900">
              2. Déroulement pédagogique structuré
            </h2>
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-900 text-white text-left">
                  <th className="p-2.5 border border-slate-700 w-[19%] font-semibold">
                    Étapes
                  </th>
                  <th className="p-2.5 border border-slate-700 w-[27%] font-semibold">
                    Activités du maître
                  </th>
                  <th className="p-2.5 border border-slate-700 w-[27%] font-semibold">
                    Activités des élèves
                  </th>
                  <th className="p-2.5 border border-slate-700 w-[27%] font-semibold">
                    Indicateurs pédagogiques inclusifs
                  </th>
                </tr>
              </thead>
              <tbody>
                {(fiche.deroulement || []).map((step, idx) => {
                  const matchedPhases = stepPhaseMap.get(step.id) || [];
                  return (
                    <React.Fragment key={step.id}>
                      <tr
                        className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="p-2.5 border border-slate-300 align-top">
                          <div className="font-semibold text-slate-900">
                            {step.etape}
                          </div>
                          {step.sousTitreInvariable && (
                            <div className="text-[11px] italic text-slate-600 mt-0.5">
                              {step.sousTitreInvariable}
                            </div>
                          )}
                          <div className="font-mono text-[11px] text-sky-700 font-semibold mt-1">
                            {step.duree}
                          </div>
                        </td>
                        <td className="p-2.5 border border-slate-300 align-top whitespace-pre-line leading-relaxed text-slate-800">
                          {step.activitesMaitre || '—'}
                        </td>
                        <td className="p-2.5 border border-slate-300 align-top whitespace-pre-line leading-relaxed text-slate-800">
                          {step.activitesEleves || '—'}
                        </td>
                        <td className="p-2.5 border border-slate-300 align-top whitespace-pre-line leading-relaxed text-slate-800">
                          {step.indicateursInclusifs || '—'}
                        </td>
                      </tr>
                      {matchedPhases.length > 0 && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={4} className="p-2.5 border border-slate-300">
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
          </section>

          {/* Section 2b: Synthèse des phases de manipulation & passage à l’abstraction */}
          {activeManipulation && (activeManipulation.phases || []).length > 0 && (
            <section className="space-y-3 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-display font-bold text-slate-900">
                {fiche.schematisationMath?.actif
                  ? `2b. Synthèse des manipulations & passage à l’abstraction (Mathématiques — ${activeManipulation.cbCode})`
                  : `2b. Synthèse des manipulations & transfert (${fiche.matiere || 'Discipline'})`}
              </h2>
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
                <p className="p-2.5 border border-sky-200 bg-sky-50/50 text-slate-800">
                  <strong className="text-sky-950">
                    Situation-problème de référence :{' '}
                  </strong>
                  {activeManipulation.situationProblemeReference}
                </p>
              )}
              {activeManipulation.synthesePassageAbstraction && (
                <p className="p-2.5 border border-slate-300 bg-slate-50 text-slate-800">
                  <strong>Passage à l’abstraction : </strong>
                  {activeManipulation.synthesePassageAbstraction}
                </p>
              )}
            </section>
          )}

          {/* Section 3: Illustration & Repères */}
          {fiche.illustration?.svgCode && (
            <section className="space-y-2.5 border-t border-slate-200 pt-4 break-inside-avoid">
              <h2 className="text-sm font-display font-bold text-slate-900">
                3. Illustration pédagogique : {fiche.illustration.titre}
              </h2>
              <div
                className="border border-slate-300 p-3 bg-slate-50/50 [&>svg]:w-full [&>svg]:max-h-[260px] [&>svg]:mx-auto"
                dangerouslySetInnerHTML={{
                  __html: sanitizeSvg(fiche.illustration.svgCode),
                }}
              />
              {fiche.illustration.legende && (
                <p className="text-[11px] italic text-center text-slate-600">
                  {fiche.illustration.legende}
                </p>
              )}
              {(fiche.illustration.annotations || []).length > 0 && (
                <ul className="space-y-1 text-[11px] text-slate-700 pt-1">
                  {(fiche.illustration.annotations || []).map((ann, idx) => (
                    <li key={ann.id}>
                      <strong>
                        Repère {idx + 1} ({ann.label}) :{' '}
                      </strong>
                      {ann.detail}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Section 4: Questions-réponses interactives */}
          {(fiche.questionsReponses || []).length > 0 && (
            <section className="space-y-2.5 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-display font-bold text-slate-900">
                4. Questions-réponses interactives ({(fiche.questionsReponses || []).length})
              </h2>
              <table className="w-full border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-sky-700 text-white text-left">
                    <th className="p-2 border border-sky-800 w-[18%] font-semibold">
                      Niveau
                    </th>
                    <th className="p-2 border border-sky-800 w-[36%] font-semibold">
                      Question
                    </th>
                    <th className="p-2 border border-sky-800 w-[46%] font-semibold">
                      Réponse attendue &amp; Indice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(fiche.questionsReponses || []).map((qr, idx) => (
                    <tr
                      key={qr.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                    >
                      <td className="p-2 border border-slate-300 align-top font-semibold text-slate-900">
                        {qr.difficulte}
                      </td>
                      <td className="p-2 border border-slate-300 align-top text-slate-800">
                        {qr.question}
                      </td>
                      <td className="p-2 border border-slate-300 align-top text-slate-800 space-y-1">
                        <div>{qr.reponseAttendue}</div>
                        {qr.indicePedagogique && (
                          <div className="text-[11px] italic text-slate-600">
                            Indice : {qr.indicePedagogique}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Section 5: Synthèse et trace écrite */}
          <section className="space-y-2 border-t border-slate-200 pt-4 break-inside-avoid">
            <h2 className="text-sm font-display font-bold text-slate-900">
              5. Synthèse et trace écrite
            </h2>
            <div className="space-y-1.5 leading-relaxed text-slate-800">
              <p className="whitespace-pre-line">
                <strong className="text-slate-900">Idée clé : </strong>
                {fiche.synthese?.resumeCle || '—'}
              </p>
              <p className="p-2.5 border border-slate-300 bg-slate-50/70 whitespace-pre-line">
                <strong className="text-slate-900">Trace écrite élève : </strong>
                {fiche.synthese?.traceEcriteEleve || '—'}
              </p>
              {(fiche.synthese?.motsCles || []).filter(Boolean).length > 0 && (
                <p>
                  <strong className="text-slate-900">Mots-clés : </strong>
                  {(fiche.synthese?.motsCles || []).filter(Boolean).join(' · ')}
                </p>
              )}
              <p>
                <strong className="text-slate-900">Prolongement : </strong>
                {fiche.synthese?.prolongement || '—'}
              </p>
              {fiche.observations?.trim() && (
                <p className="p-2.5 border border-slate-300 bg-slate-50/70 whitespace-pre-line">
                  <strong className="text-slate-900">Observations de la séance : </strong>
                  {fiche.observations}
                </p>
              )}
            </div>
          </section>

          {(fiche.eleves || []).length > 0 && (
            <section className="space-y-2 border-t border-slate-200 pt-4 break-inside-avoid">
              <h2 className="text-sm font-display font-bold text-slate-900">
                6. Suivi individualisé des élèves ({(fiche.eleves || []).length})
              </h2>
              <table className="w-full border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-left">
                    <th className="p-2 border border-slate-300 w-[18%] font-semibold">
                      Élève
                    </th>
                    <th className="p-2 border border-slate-300 w-[32%] font-semibold">
                      Besoin / Adaptation
                    </th>
                    <th className="p-2 border border-slate-300 w-[34%] font-semibold">
                      Objectif individualisé
                    </th>
                    <th className="p-2 border border-slate-300 w-[16%] font-semibold">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(fiche.eleves || []).map((el, idx) => (
                    <tr
                      key={el.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                    >
                      <td className="p-2 border border-slate-300 align-top font-semibold text-slate-900">
                        {el.prenom || `Élève ${idx + 1}`}
                      </td>
                      <td className="p-2 border border-slate-300 align-top text-slate-700">
                        {el.besoinSpecifique || '—'}
                      </td>
                      <td className="p-2 border border-slate-300 align-top text-slate-800">
                        {el.objectifIndividuel || '—'}
                      </td>
                      <td className="p-2 border border-slate-300 align-top font-semibold text-slate-900">
                        {el.statut === 'acquis'
                          ? 'Acquis'
                          : el.statut === 'a_consolider'
                          ? 'À consolider'
                          : 'En cours'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Printable Footer */}
          <footer className="border-t border-slate-300 pt-3 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              Atelier APC · {fiche.matiere} ({fiche.niveau})
            </span>
            <span className="font-mono">Format A4 · Prêt pour export</span>
          </footer>
        </article>
      </div>

      {/* Modal Bottom Action Bar (Hidden when printing) */}
      <div className="no-print bg-white border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          Retour à l’édition
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleConfirmExport('docx')}
            disabled={exportingType !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 ${
              initialAction === 'docx'
                ? 'text-white bg-sky-600 hover:bg-sky-700'
                : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            {exportingType === 'docx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            {getPrimaryLabel('docx')}
          </button>

          <button
            type="button"
            onClick={() => handleConfirmExport('pdf')}
            disabled={exportingType !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 ${
              initialAction === 'pdf'
                ? 'text-white bg-slate-900 hover:bg-slate-800'
                : 'text-slate-800 bg-white hover:bg-slate-50 border border-slate-300'
            }`}
          >
            {exportingType === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            {getPrimaryLabel('pdf')}
          </button>

          <button
            type="button"
            onClick={handleConfirmPrint}
            disabled={exportingType !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 ${
              initialAction === 'print' || initialAction === 'preview'
                ? 'text-white bg-slate-900 hover:bg-slate-800'
                : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            {getPrimaryLabel('print')}
          </button>
        </div>
      </div>
    </div>
  );
}
