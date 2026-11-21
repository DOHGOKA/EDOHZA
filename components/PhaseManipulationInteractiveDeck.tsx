'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  User,
  Users,
  UsersRound,
} from 'lucide-react';
import {
  ExerciceProgressifPhase,
  PhaseManipulationMath,
} from '@/lib/types';
import { evaluateExerciceResponse } from '@/lib/manipulation-phases';
import { sanitizeSvg } from '@/lib/svg-sanitize';

interface PhaseManipulationInteractiveDeckProps {
  ficheId: string;
  theme?: string;
  titre?: string;
  situationProbleme?: string;
  phases: PhaseManipulationMath[];
  compact?: boolean;
}

const PHASE_ICONS = {
  collective: Users,
  petits_groupes: UsersRound,
  individuelle: User,
};

interface ExerciseUiState {
  answer: string;
  checked: boolean;
  isCorrect: boolean;
  showHint: boolean;
}

function getPalierShortLabel(palier: ExerciceProgressifPhase['palier'], index: number): string {
  if (palier.includes('1') || index === 0) return 'Palier 1 · Découverte';
  if (palier.includes('2') || index === 1) return 'Palier 2 · Entraînement';
  return 'Palier 3 · Défi';
}

export default function PhaseManipulationInteractiveDeck({
  ficheId,
  theme,
  titre,
  situationProbleme,
  phases,
  compact = false,
}: PhaseManipulationInteractiveDeckProps) {
  const [activePalierByPhase, setActivePalierByPhase] = useState<Record<string, number>>({});
  const [exStates, setExStates] = useState<Record<string, ExerciseUiState>>({});
  const [revealedQrIds, setRevealedQrIds] = useState<Record<string, boolean>>({});
  const [revealedQrHintIds, setRevealedQrHintIds] = useState<Record<string, boolean>>({});

  if (!phases || phases.length === 0) return null;

  const getExKey = (phaseKey: string, exId: string) => `${ficheId}:${phaseKey}:${exId}`;
  const getQrKey = (phaseKey: string, qrId: string) => `${ficheId}:${phaseKey}:${qrId}`;

  const getExState = (key: string): ExerciseUiState =>
    exStates[key] || {
      answer: '',
      checked: false,
      isCorrect: false,
      showHint: false,
    };

  const updateExState = (key: string, patch: Partial<ExerciseUiState>) => {
    setExStates((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          answer: '',
          checked: false,
          isCorrect: false,
          showHint: false,
        }),
        ...patch,
      },
    }));
  };

  const handleVerifyExercise = (phaseKey: string, ex: ExerciceProgressifPhase) => {
    const key = getExKey(phaseKey, ex.id);
    const current = getExState(key);
    const ok = evaluateExerciceResponse(ex, current.answer);
    updateExState(key, {
      checked: true,
      isCorrect: ok,
    });
  };

  const handleResetPhase = (phase: PhaseManipulationMath) => {
    setExStates((prev) => {
      const next = { ...prev };
      for (const ex of phase.exercicesProgressifs || []) {
        delete next[getExKey(phase.phase, ex.id)];
      }
      return next;
    });
    setActivePalierByPhase((prev) => ({
      ...prev,
      [phase.phase]: 0,
    }));
  };

  return (
    <div className="space-y-3">
      {phases.map((phase) => {
        const Icon = PHASE_ICONS[phase.phase] || Users;
        const exercices = phase.exercicesProgressifs || [];
        const qrs = phase.questionsReponsesPhase || [];
        const activeIdx = Math.min(
          activePalierByPhase[phase.phase] ?? 0,
          Math.max(0, exercices.length - 1)
        );
        const activeEx = exercices[activeIdx];
        const validatedCount = exercices.filter((ex) => {
          const st = getExState(getExKey(phase.phase, ex.id));
          return st.checked && st.isCorrect;
        }).length;

        return (
          <div
            key={phase.phase}
            className="border border-slate-300 rounded bg-white p-3 space-y-3 break-inside-avoid text-slate-900"
          >
            {/* En-tête de phase */}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Icon className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                  <span>{phase.titrePhase}</span>
                </div>
                <p className="text-[11px] text-sky-800 font-medium">
                  {phase.modalite}
                </p>
              </div>

              {exercices.length > 0 && (
                <div className="no-print flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono tabular-nums font-semibold bg-slate-100 border border-slate-200 rounded text-slate-800">
                    <CheckCircle2
                      className={`w-3 h-3 ${
                        validatedCount === exercices.length
                          ? 'text-emerald-600'
                          : 'text-sky-600'
                      }`}
                    />
                    {validatedCount} / {exercices.length} validés
                  </span>
                  <button
                    type="button"
                    onClick={() => handleResetPhase(phase)}
                    title="Réinitialiser les exercices de cette phase"
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>

            {/* Schématisation SVG + Données concrètes */}
            <div
              className={`grid grid-cols-1 ${
                compact ? 'gap-2.5' : 'md:grid-cols-12 gap-3 items-start'
              }`}
            >
              {phase.svgSchemaCode && (
                <div
                  className={`${
                    compact ? '' : 'md:col-span-5'
                  } border border-slate-200 rounded bg-[#F8FAFC] p-1.5 [&>svg]:w-full [&>svg]:h-auto`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(phase.svgSchemaCode, '0 0 360 200'),
                  }}
                />
              )}

              <div
                className={`${
                  compact || !phase.svgSchemaCode ? '' : 'md:col-span-7'
                } space-y-1.5 text-[11px] leading-snug text-slate-800`}
              >
                <p>
                  <strong className="text-slate-900">Données concrètes : </strong>
                  {phase.donneesConcretes}
                </p>
                <p>
                  <strong className="text-slate-900">Matériel : </strong>
                  {phase.materielConcret}
                </p>
                <p>
                  <strong className="text-slate-900">Action &amp; schématisation élève : </strong>
                  {phase.actionSchemaEleve}
                </p>
                <p className="p-1.5 rounded bg-emerald-50/60 border border-emerald-200 text-slate-800">
                  <strong className="text-emerald-900">Étayage inclusif APC : </strong>
                  {phase.etayageInclusifAPC}
                </p>
              </div>
            </div>

            {/* Exercices progressifs interactifs (Paliers 1 → 3) */}
            {exercices.length > 0 && (
              <div className="border border-sky-200 rounded bg-sky-50/40 p-2.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-950">
                    <BookOpenCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    <span>Exercices progressifs interactifs ({phase.titrePhase})</span>
                  </div>
                  {(theme || titre) && (
                    <span className="text-[10px] text-slate-600">
                      Liés à : {titre || theme}
                    </span>
                  )}
                </div>

                {/* Screen interactive mode */}
                <div className="no-print space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {exercices.map((ex, idx) => {
                      const st = getExState(getExKey(phase.phase, ex.id));
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() =>
                            setActivePalierByPhase((prev) => ({
                              ...prev,
                              [phase.phase]: idx,
                            }))
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors ${
                            isActive
                              ? 'bg-slate-900 text-white border-slate-900'
                              : st.checked && st.isCorrect
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {st.checked && st.isCorrect && (
                            <CheckCircle2
                              className={`w-3 h-3 shrink-0 ${
                                isActive ? 'text-emerald-300' : 'text-emerald-600'
                              }`}
                            />
                          )}
                          <span>{getPalierShortLabel(ex.palier, idx)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activeEx && (() => {
                    const exKey = getExKey(phase.phase, activeEx.id);
                    const st = getExState(exKey);
                    return (
                      <div className="bg-white border border-slate-200 rounded p-2.5 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                          <span className="font-semibold text-sky-800">
                            {getPalierShortLabel(activeEx.palier, activeIdx)}
                          </span>
                          {activeEx.lienSituationProbleme && (
                            <span className="italic truncate max-w-full">
                              Situation : {activeEx.lienSituationProbleme}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {activeEx.consigne}
                        </p>
                        {activeEx.donneesConcretes && (
                          <p className="text-[11px] text-slate-600 font-mono tabular-nums">
                            Données : {activeEx.donneesConcretes}
                          </p>
                        )}

                        {activeEx.type === 'choix' && activeEx.choix && activeEx.choix.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {activeEx.choix.map((option) => {
                              const selected = st.answer === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    updateExState(exKey, {
                                      answer: option,
                                      checked: false,
                                    })
                                  }
                                  className={`px-2.5 py-1.5 text-left text-[11px] font-medium rounded border transition-colors ${
                                    selected
                                      ? 'bg-sky-50 border-sky-600 text-sky-950 font-semibold'
                                      : 'bg-slate-50/70 border-slate-300 text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              aria-label={`Réponse pour ${activeEx.palier}`}
                              value={st.answer}
                              onChange={(e) =>
                                updateExState(exKey, {
                                  answer: e.target.value,
                                  checked: false,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && st.answer.trim()) {
                                  e.preventDefault();
                                  handleVerifyExercise(phase.phase, activeEx);
                                }
                              }}
                              placeholder="Saisis ta réponse…"
                              className="w-44 px-2.5 py-1 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            {activeEx.unite && (
                              <span className="text-xs font-mono font-semibold text-slate-700">
                                {activeEx.unite}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            disabled={!st.answer.trim()}
                            onClick={() => handleVerifyExercise(phase.phase, activeEx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-45 rounded transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Vérifier
                          </button>

                          {activeEx.indice && (
                            <button
                              type="button"
                              onClick={() =>
                                updateExState(exKey, { showHint: !st.showHint })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                            >
                              <Lightbulb className="w-3 h-3" />
                              {st.showHint ? 'Masquer l’indice' : 'Indice'}
                            </button>
                          )}

                          {activeIdx < exercices.length - 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActivePalierByPhase((prev) => ({
                                  ...prev,
                                  [phase.phase]: activeIdx + 1,
                                }))
                              }
                              className="ml-auto text-[11px] font-semibold text-sky-700 hover:text-sky-900"
                            >
                              Palier suivant →
                            </button>
                          )}
                        </div>

                        {st.showHint && activeEx.indice && (
                          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Indice : </strong>
                              {activeEx.indice}
                            </span>
                          </div>
                        )}

                        {st.checked && (
                          <div
                            className={`p-2 rounded border text-[11px] space-y-0.5 ${
                              st.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-amber-50 border-amber-300 text-amber-950'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold">
                              {st.isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>Exact !</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>
                                    À revoir · Réponse attendue :{' '}
                                    <span className="font-mono tabular-nums">
                                      {activeEx.reponseAttendue}
                                      {activeEx.unite &&
                                      !activeEx.reponseAttendue
                                        .toLowerCase()
                                        .includes(activeEx.unite.toLowerCase())
                                        ? ` ${activeEx.unite}`
                                        : ''}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                            {activeEx.explication && (
                              <p className="leading-snug">{activeEx.explication}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Printable / Export static representation of all progressive tiers */}
                <div className="hidden print-only space-y-1.5 text-[10.5px]">
                  {exercices.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-1.5 border border-slate-200 bg-white rounded space-y-0.5"
                    >
                      <div className="font-bold text-slate-900">
                        {getPalierShortLabel(ex.palier, idx)} — {ex.consigne}
                      </div>
                      <div className="text-slate-700">
                        Données : {ex.donneesConcretes}
                        {ex.choix && ex.choix.length > 0
                          ? ` | Choix : ${ex.choix.join(' / ')}`
                          : ''}
                      </div>
                      <div className="text-slate-800">
                        <strong>Réponse attendue :</strong> {ex.reponseAttendue}
                        {ex.unite &&
                        !ex.reponseAttendue.toLowerCase().includes(ex.unite.toLowerCase())
                          ? ` ${ex.unite}`
                          : ''}{' '}
                        · <em>{ex.explication}</em>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions-Réponses liées au thème, au titre et à la situation-problème */}
            {qrs.length > 0 && (
              <div className="border border-slate-200 rounded bg-slate-50/70 p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    Questions–Réponses de la phase (Thème · Titre · Situation-problème)
                  </span>
                  {(theme || situationProbleme) && (
                    <span className="text-[10px] text-slate-600">
                      {theme ? `Thème : ${theme}` : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {qrs.map((qr, qIdx) => {
                    const qrKey = getQrKey(phase.phase, qr.id);
                    const isAnswerOpen = Boolean(revealedQrIds[qrKey]);
                    const isHintOpen = Boolean(revealedQrHintIds[qrKey]);

                    return (
                      <div
                        key={qr.id}
                        className="bg-white border border-slate-200 rounded p-2 space-y-1 text-[11px]"
                      >
                        <p className="font-semibold text-slate-900 leading-snug">
                          Q{qIdx + 1} : {qr.question}
                        </p>
                        {qr.ancrageThemeTitreSituation && (
                          <p className="text-[10px] text-slate-500">
                            Ancrage : {qr.ancrageThemeTitreSituation}
                          </p>
                        )}

                        <div className="no-print flex flex-wrap items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedQrIds((prev) => ({
                                ...prev,
                                [qrKey]: !prev[qrKey],
                              }))
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors"
                          >
                            {isAnswerOpen ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Masquer la réponse
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Voir la réponse attendue
                              </>
                            )}
                          </button>

                          {qr.indice && (
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedQrHintIds((prev) => ({
                                  ...prev,
                                  [qrKey]: !prev[qrKey],
                                }))
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                            >
                              <Lightbulb className="w-3 h-3" />
                              {isHintOpen ? 'Masquer l’indice' : 'Indice'}
                            </button>
                          )}
                        </div>

                        {isHintOpen && qr.indice && (
                          <p className="no-print text-[10.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            <strong>Indice :</strong> {qr.indice}
                          </p>
                        )}

                        {isAnswerOpen && (
                          <p className="no-print text-[11px] text-emerald-950 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                            <strong>R{qIdx + 1} :</strong> {qr.reponseAttendue}
                          </p>
                        )}

                        <p className="hidden print-only text-[10.5px] text-slate-800">
                          <strong>R{qIdx + 1} :</strong> {qr.reponseAttendue}
                          {qr.indice ? ` (Indice : ${qr.indice})` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
