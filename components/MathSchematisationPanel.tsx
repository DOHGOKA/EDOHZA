'use client';

import React, { useState } from 'react';
import {
  Check,
  Code2,
  Layers,
  Loader2,
  RefreshCw,
  Shapes,
  Sparkles,
  Users,
  User,
  UsersRound,
} from 'lucide-react';
import {
  CbMathType,
  FicheAPC,
  PhaseManipulationMath,
  ReasoningQuality,
  SchematisationMathPhases,
} from '@/lib/types';
import {
  buildFallbackMathSchematisation,
  CB_MATH_CATALOG,
  isMathContext,
  normalizeCbMathCode,
} from '@/lib/math-schematisation';
import { buildUniversalManipulationSchematisation } from '@/lib/manipulation-phases';
import { createCompactSnapshot } from '@/lib/storage';
import { createUid } from '@/lib/utils';
import { postJson } from '@/lib/api-client';
import { sanitizeSvg } from '@/lib/svg-sanitize';
import VoiceDictationButton from './VoiceDictationButton';

interface MathSchematisationPanelProps {
  fiche: FicheAPC;
  isOnline: boolean;
  quality: ReasoningQuality;
  onUpdateFiche: (updated: FicheAPC) => void;
}

const PHASE_ICONS = {
  collective: Users,
  petits_groupes: UsersRound,
  individuelle: User,
};

export default function MathSchematisationPanel({
  fiche,
  isOnline,
  quality,
  onUpdateFiche,
}: MathSchematisationPanelProps) {
  const mathRelevant = isMathContext(fiche.matiere, fiche.disciplineId);

  const detectedCb = normalizeCbMathCode(
    fiche.schematisationMath?.cbCode,
    fiche.competenceDeBase,
    fiche.titre,
    fiche.theme
  );

  const [selectedCb, setSelectedCb] = useState<CbMathType>(detectedCb);
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [activePhaseTab, setActivePhaseTab] = useState<
    'collective' | 'petits_groupes' | 'individuelle'
  >('collective');
  const [customNote, setCustomNote] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [editingSvgPhase, setEditingSvgPhase] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const situationSource =
    fiche.introduction?.accroche?.trim() ||
    fiche.introduction?.miseEnSituation?.trim() ||
    fiche.theme;

  const currentSchem: SchematisationMathPhases = mathRelevant
    ? fiche.schematisationMath?.actif &&
      Array.isArray(fiche.schematisationMath.phases) &&
      fiche.schematisationMath.phases.length >= 3
      ? fiche.schematisationMath
      : buildFallbackMathSchematisation({
          cbCode: selectedCb,
          competenceDeBase: fiche.competenceDeBase,
          titre: fiche.titre,
          theme: fiche.theme,
          situationProbleme: situationSource,
          niveau: fiche.niveau,
        })
    : fiche.phasesManipulation?.actif &&
      Array.isArray(fiche.phasesManipulation.phases) &&
      fiche.phasesManipulation.phases.length >= 3
    ? fiche.phasesManipulation
    : buildUniversalManipulationSchematisation({
        matiere: fiche.matiere,
        disciplineId: fiche.disciplineId,
        competenceDeBase: fiche.competenceDeBase,
        titre: fiche.titre,
        theme: fiche.theme,
        situationProbleme: situationSource,
        niveau: fiche.niveau,
        deroulement: fiche.deroulement,
      });

  const activeSchem = currentSchem;
  const effectiveCb = activeSchem.cbCode || selectedCb;

  const commitSchem = (nextSchem: SchematisationMathPhases, nextCb?: string) => {
    if (mathRelevant) {
      onUpdateFiche({
        ...fiche,
        competenceDeBase: nextCb ?? fiche.competenceDeBase,
        schematisationMath: nextSchem,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onUpdateFiche({
        ...fiche,
        competenceDeBase: nextCb ?? fiche.competenceDeBase,
        phasesManipulation: nextSchem,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleSelectCb = (cb: CbMathType) => {
    if (!mathRelevant) return;
    setSelectedCb(cb);
    setFeedback(null);
    setError(null);
    const updatedLibelle = CB_MATH_CATALOG[cb].libelle;
    const rebuilt = buildFallbackMathSchematisation({
      cbCode: cb,
      competenceDeBase: updatedLibelle,
      titre: fiche.titre,
      theme: fiche.theme,
      situationProbleme: situationSource,
      niveau: fiche.niveau,
    });
    commitSchem(
      {
        ...activeSchem,
        cbCode: cb,
        cbLibelle: updatedLibelle,
        phases: rebuilt.phases,
        synthesePassageAbstraction: rebuilt.synthesePassageAbstraction,
        situationProblemeReference: situationSource,
        titreLeconReference: fiche.titre,
      },
      `${cb} (Mathématiques ${fiche.niveau}) — ${CB_MATH_CATALOG[cb].court}`
    );
  };

  const handleUpdatePhaseField = (
    phaseKey: PhaseManipulationMath['phase'],
    field: keyof PhaseManipulationMath,
    value: string
  ) => {
    const nextPhases = activeSchem.phases.map((p) =>
      p.phase === phaseKey ? { ...p, [field]: value } : p
    );
    commitSchem({
      ...activeSchem,
      phases: nextPhases,
    });
  };

  const handleUpdatePhaseExercice = (
    phaseKey: PhaseManipulationMath['phase'],
    exId: string,
    field: 'consigne' | 'reponseAttendue' | 'explication' | 'indice',
    value: string
  ) => {
    const nextPhases = activeSchem.phases.map((p) => {
      if (p.phase !== phaseKey) return p;
      return {
        ...p,
        exercicesProgressifs: (p.exercicesProgressifs || []).map((ex) =>
          ex.id === exId ? { ...ex, [field]: value } : ex
        ),
      };
    });
    commitSchem({
      ...activeSchem,
      phases: nextPhases,
    });
  };

  const handleUpdatePhaseQr = (
    phaseKey: PhaseManipulationMath['phase'],
    qrId: string,
    field: 'question' | 'reponseAttendue' | 'indice',
    value: string
  ) => {
    const nextPhases = activeSchem.phases.map((p) => {
      if (p.phase !== phaseKey) return p;
      return {
        ...p,
        questionsReponsesPhase: (p.questionsReponsesPhase || []).map((qr) =>
          qr.id === qrId ? { ...qr, [field]: value } : qr
        ),
      };
    });
    commitSchem({
      ...activeSchem,
      phases: nextPhases,
    });
  };

  const handleGenerateAiSchematisation = async () => {
    setError(null);
    setFeedback(null);

    if (!mathRelevant) {
      const rebuilt = buildUniversalManipulationSchematisation({
        matiere: fiche.matiere,
        disciplineId: fiche.disciplineId,
        competenceDeBase: fiche.competenceDeBase,
        titre: fiche.titre,
        theme: fiche.theme,
        situationProbleme: customNote.trim()
          ? `${situationSource} — ${customNote.trim()}`
          : situationSource,
        niveau: fiche.niveau,
        deroulement: fiche.deroulement,
      });
      commitSchem(rebuilt);
      setFeedback(
        `Phases de manipulation, schémas, exercices progressifs et Q&R actualisés pour « ${fiche.titre} ».`
      );
      setCustomNote('');
      return;
    }

    if (!isOnline) {
      const offline = buildFallbackMathSchematisation({
        cbCode: effectiveCb,
        competenceDeBase: fiche.competenceDeBase,
        titre: fiche.titre,
        theme: fiche.theme,
        situationProbleme: customNote.trim()
          ? `${situationSource} — ${customNote.trim()}`
          : situationSource,
        niveau: fiche.niveau,
      });
      commitSchem(offline);
      setFeedback(
        `Schématisation locale (${effectiveCb}) actualisée avec les données de la leçon.`
      );
      return;
    }

    setLoadingAi(true);
    try {
      const data = await postJson<{
        schematisationMath: SchematisationMathPhases;
        resume?: string;
      }>('/api/apc/schematize-math', {
        fiche,
        cbCode: effectiveCb,
        titre: fiche.titre,
        situationProbleme: situationSource,
        instruction: customNote.trim(),
        quality,
      });
      const now = new Date().toISOString();
      const snapshot = createCompactSnapshot(fiche);
      onUpdateFiche({
        ...fiche,
        schematisationMath: data.schematisationMath,
        historique: [
          {
            id: createUid('hist'),
            date: now,
            action: `Schématisation Math IA (${effectiveCb})`,
            resume:
              data.resume ||
              `3 phases de manipulation schématisées pour ${effectiveCb} — ${fiche.titre}.`,
            snapshot,
          },
          ...(Array.isArray(fiche.historique) ? fiche.historique.slice(0, 14) : []),
        ],
        updatedAt: now,
      });
      setFeedback(
        data.resume ||
          `Schématisation IA (${effectiveCb} · Collective, Petits groupes, Individuelle) générée.`
      );
      setCustomNote('');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la schématisation mathématique.'
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const phasesToDisplay =
    viewMode === 'grid'
      ? activeSchem.phases
      : activeSchem.phases.filter((p) => p.phase === activePhaseTab);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shapes className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold text-sky-700">
              {mathRelevant ? 'Mathématiques APC' : `${fiche.matiere || 'Discipline'} APC`}
            </span>
            {mathRelevant && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-slate-800">{effectiveCb}</span>
                <span aria-hidden="true">·</span>
                <span>{CB_MATH_CATALOG[effectiveCb].court}</span>
              </>
            )}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Éditeur des schématisations, exercices progressifs &amp; Q&amp;R par phase
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Personnalisez les schémas SVG, les données concrètes, les exercices progressifs (Paliers 1 à 3) et les questions–réponses intégrés directement dans la fiche pédagogique.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            3 phases
          </button>
          <button
            type="button"
            onClick={() => setViewMode('focus')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              viewMode === 'focus'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phase par phase
          </button>
        </div>
      </div>

      {/* CB1 / CB2 / CB3 Segmented Selector & Live Reference Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {mathRelevant ? (
          <div className="lg:col-span-5 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-600">
              Compétence de Base Mathématiques (CB1, CB2, CB3)
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-md">
              {(['CB1', 'CB2', 'CB3'] as CbMathType[]).map((cb) => {
                const active = effectiveCb === cb;
                return (
                  <button
                    key={cb}
                    type="button"
                    onClick={() => handleSelectCb(cb)}
                    className={`py-2 px-2 rounded text-left transition-colors ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-sky-700">{cb}</div>
                    <div className="text-[11px] truncate">{CB_MATH_CATALOG[cb].court}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {CB_MATH_CATALOG[effectiveCb].libelle}
            </p>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
            <span className="block text-[11px] font-semibold text-slate-700">
              Ancrage disciplinaire ({fiche.matiere})
            </span>
            <p className="text-xs font-medium text-slate-900">
              {fiche.theme || 'Thème APC'}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {fiche.competenceDeBase || fiche.competenceVisee}
            </p>
          </div>
        )}

        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2.5">
          <div className="text-xs text-slate-700 space-y-1">
            <div>
              <strong className="text-slate-900">Leçon ciblée :</strong>{' '}
              {fiche.titre}
            </div>
            <div>
              <strong className="text-slate-900">Situation-problème source :</strong>{' '}
              {situationSource}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Préciser des données concrètes ou du matériel (ex: billes, 24 cm, 3/4)..."
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <VoiceDictationButton
              compact
              isOnline={isOnline}
              label="Dicter"
              onError={setError}
              onTranscript={(text) =>
                setCustomNote((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
              }
            />
            <button
              type="button"
              disabled={loadingAi}
              onClick={handleGenerateAiSchematisation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded transition-colors whitespace-nowrap shrink-0"
            >
              {loadingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Schématisation IA...
                </>
              ) : mathRelevant && isOnline ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Schématiser les 3 phases par IA
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser les 3 phases
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
          {error}
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {viewMode === 'focus' && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-md">
          {activeSchem.phases.map((p) => {
            const Icon = PHASE_ICONS[p.phase];
            const active = activePhaseTab === p.phase;
            return (
              <button
                key={p.phase}
                type="button"
                onClick={() => setActivePhaseTab(p.phase)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-sky-600" />
                {p.titrePhase}
              </button>
            );
          })}
        </div>
      )}

      {/* 3 Manipulation Phases */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }
      >
        {phasesToDisplay.map((phase) => {
          const Icon = PHASE_ICONS[phase.phase];
          const isEditingSvg = editingSvgPhase === phase.phase;
          return (
            <div
              key={phase.phase}
              className="border border-slate-200 rounded-lg bg-slate-50/40 p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{phase.titrePhase}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {phase.modalite}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSvgPhase(isEditingSvg ? null : phase.phase)
                    }
                    title="Afficher ou modifier le code SVG de cette phase"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 shrink-0"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {isEditingSvg ? 'Aperçu' : 'SVG'}
                  </button>
                </div>

                {/* SVG Visual Schema */}
                <div className="bg-white border border-slate-200 rounded-md p-2 overflow-hidden">
                  {isEditingSvg ? (
                    <textarea
                      rows={6}
                      aria-label={`Code SVG pour ${phase.titrePhase}`}
                      value={phase.svgSchemaCode}
                      onChange={(e) =>
                        handleUpdatePhaseField(
                          phase.phase,
                          'svgSchemaCode',
                          e.target.value
                        )
                      }
                      className="w-full font-mono text-[11px] text-slate-800 bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  ) : (
                    <div
                      className="w-full [&>svg]:w-full [&>svg]:h-auto"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeSvg(phase.svgSchemaCode || '', '0 0 360 200'),
                      }}
                    />
                  )}
                </div>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Données concrètes (situation &amp; leçon)
                  </span>
                  <textarea
                    rows={2}
                    value={phase.donneesConcretes}
                    onChange={(e) =>
                      handleUpdatePhaseField(
                        phase.phase,
                        'donneesConcretes',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full px-2.5 py-1.5 text-xs leading-relaxed bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Matériel concret manipulé
                  </span>
                  <input
                    type="text"
                    value={phase.materielConcret}
                    onChange={(e) =>
                      handleUpdatePhaseField(
                        phase.phase,
                        'materielConcret',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Action de manipulation &amp; schématisation
                  </span>
                  <textarea
                    rows={2}
                    value={phase.actionSchemaEleve}
                    onChange={(e) =>
                      handleUpdatePhaseField(
                        phase.phase,
                        'actionSchemaEleve',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full px-2.5 py-1.5 text-xs leading-relaxed bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Étayage inclusif APC
                  </span>
                  <textarea
                    rows={2}
                    value={phase.etayageInclusifAPC}
                    onChange={(e) =>
                      handleUpdatePhaseField(
                        phase.phase,
                        'etayageInclusifAPC',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full px-2.5 py-1.5 text-xs leading-relaxed bg-emerald-50/40 border border-emerald-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </label>

                {(phase.exercicesProgressifs || []).length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="block text-[11px] font-semibold text-sky-900">
                      Exercices progressifs ({phase.exercicesProgressifs?.length} paliers)
                    </span>
                    {(phase.exercicesProgressifs || []).map((ex) => (
                      <div
                        key={ex.id}
                        className="p-2 bg-white border border-slate-200 rounded space-y-1.5"
                      >
                        <div className="text-[10px] font-bold text-sky-700">
                          {ex.palier}
                        </div>
                        <input
                          type="text"
                          aria-label={`Consigne ${ex.palier}`}
                          value={ex.consigne}
                          onChange={(e) =>
                            handleUpdatePhaseExercice(
                              phase.phase,
                              ex.id,
                              'consigne',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-900"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            aria-label={`Réponse attendue ${ex.palier}`}
                            value={ex.reponseAttendue}
                            onChange={(e) =>
                              handleUpdatePhaseExercice(
                                phase.phase,
                                ex.id,
                                'reponseAttendue',
                                e.target.value
                              )
                            }
                            placeholder="Réponse attendue"
                            className="px-2 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded text-slate-900"
                          />
                          <input
                            type="text"
                            aria-label={`Indice ${ex.palier}`}
                            value={ex.indice || ''}
                            onChange={(e) =>
                              handleUpdatePhaseExercice(
                                phase.phase,
                                ex.id,
                                'indice',
                                e.target.value
                              )
                            }
                            placeholder="Indice"
                            className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(phase.questionsReponsesPhase || []).length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-800">
                      Questions–Réponses de la phase ({phase.questionsReponsesPhase?.length})
                    </span>
                    {(phase.questionsReponsesPhase || []).map((qr, qIdx) => (
                      <div
                        key={qr.id}
                        className="p-2 bg-white border border-slate-200 rounded space-y-1.5"
                      >
                        <input
                          type="text"
                          aria-label={`Question ${qIdx + 1}`}
                          value={qr.question}
                          onChange={(e) =>
                            handleUpdatePhaseQr(
                              phase.phase,
                              qr.id,
                              'question',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded text-slate-900"
                        />
                        <input
                          type="text"
                          aria-label={`Réponse ${qIdx + 1}`}
                          value={qr.reponseAttendue}
                          onChange={(e) =>
                            handleUpdatePhaseQr(
                              phase.phase,
                              qr.id,
                              'reponseAttendue',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-[11px] bg-emerald-50/40 border border-emerald-200 rounded text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Concrete -> Semi-Concrete -> Abstract Synthesis */}
      <label className="block pt-2 border-t border-slate-200">
        <span className="text-xs font-semibold text-slate-700">
          Progression vers l’abstraction (Concret → Schéma → Écriture mathématique)
        </span>
        <input
          type="text"
          value={activeSchem.synthesePassageAbstraction}
          onChange={(e) =>
            commitSchem({
              ...activeSchem,
              synthesePassageAbstraction: e.target.value,
            })
          }
          className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </label>
    </section>
  );
}
