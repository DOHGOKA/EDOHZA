'use client';

import React, { useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ManipulableType, ObjetManipulable } from '@/lib/types';

interface MathManipulativeProps {
  manipulable: ObjetManipulable;
  onChange: (updated: ObjetManipulable) => void;
  readOnly?: boolean;
}

const MANIP_TYPES: { value: ManipulableType; label: string }[] = [
  { value: 'fractions', label: 'Fractions équivalentes' },
  { value: 'balance_algebre', label: 'Balance d’égalité' },
  { value: 'geometrie_aire', label: 'Grille d’aire & périmètre' },
  { value: 'droite_graduee', label: 'Droite graduée' },
  { value: 'proportionnalite', label: 'Jauge de proportionnalité' },
];

export default function MathManipulative({
  manipulable,
  onChange,
  readOnly = false,
}: MathManipulativeProps) {
  const [multFactor, setMultFactor] = useState(2);

  const rawA = Number(manipulable.parametres?.valeurA ?? 1);
  const rawB = Number(manipulable.parametres?.valeurB ?? 2);
  const rawDenom = Number(manipulable.parametres?.denominateur ?? 4);
  const valA = Number.isFinite(rawA) ? Math.max(0, Math.min(20, rawA)) : 1;
  const valB = Number.isFinite(rawB) ? Math.max(0, Math.min(20, rawB)) : 2;
  const denom = Number.isFinite(rawDenom)
    ? Math.max(1, Math.min(12, Math.round(rawDenom)))
    : 4;
  const unite = manipulable.parametres?.unite || 'unités';

  const updateParam = (key: 'valeurA' | 'valeurB' | 'denominateur', value: number) => {
    if (!Number.isFinite(value)) return;
    onChange({
      ...manipulable,
      parametres: {
        ...manipulable.parametres,
        [key]: value,
      },
    });
  };

  const resetParams = () => {
    setMultFactor(2);
    onChange({
      ...manipulable,
      parametres: {
        valeurA: 1,
        valeurB: 2,
        denominateur: 4,
        unite,
      },
    });
  };

  if (!manipulable.actif) {
    if (readOnly) return null;
    return (
      <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Objet manipulable interactif (Mathématiques / Sciences)
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Activez un outil de manipulation dynamique (fractions, balance, grille géométrique, droite graduée ou proportionnalité) sur cette fiche.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...manipulable, actif: true })}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          Activer l’outil manipulable
        </button>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <SlidersHorizontal className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {manipulable.titre || 'Objet manipulable interactif'}
            </h4>
            {manipulable.consigne && (
              <p className="text-xs text-slate-600 mt-0.5">{manipulable.consigne}</p>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Type d’objet manipulable"
              value={manipulable.type}
              onChange={(e) =>
                onChange({
                  ...manipulable,
                  type: e.target.value as ManipulableType,
                })
              }
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {MANIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetParams}
              title="Réinitialiser les valeurs"
              aria-label="Réinitialiser les valeurs"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...manipulable, actif: false })}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white whitespace-nowrap shrink-0"
            >
              Masquer
            </button>
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Visual Stage */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-md p-4">
          {manipulable.type === 'fractions' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Fraction initiale</span>
                  <span className="font-mono font-semibold text-sky-700">
                    {Math.min(valA, denom)} / {denom}
                  </span>
                </div>
                <div className="grid gap-1 h-10" style={{ gridTemplateColumns: `repeat(${denom}, minmax(0, 1fr))` }}>
                  {Array.from({ length: denom }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm border transition-colors ${
                        i < Math.min(valA, denom)
                          ? 'bg-sky-600 border-sky-700'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Fraction équivalente (×{multFactor})</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {Math.min(valA, denom) * multFactor} / {denom * multFactor}
                  </span>
                </div>
                <div
                  className="grid gap-0.5 h-10"
                  style={{
                    gridTemplateColumns: `repeat(${denom * multFactor}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: denom * multFactor }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm border transition-colors ${
                        i < Math.min(valA, denom) * multFactor
                          ? 'bg-emerald-600 border-emerald-700'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Valeur décimale conservée</span>
                <span className="font-mono font-semibold text-slate-900">
                  {(Math.min(valA, denom) / denom).toFixed(3)}
                </span>
              </div>
            </div>
          )}

          {manipulable.type === 'balance_algebre' && (
            <div className="space-y-3">
              <svg viewBox="0 0 420 170" className="w-full h-auto">
                <line x1="210" y1="30" x2="210" y2="145" stroke="#334155" strokeWidth="4" />
                <rect x="155" y="145" width="110" height="10" rx="3" fill="#0F172A" />
                {(() => {
                  const diff = Math.max(-10, Math.min(10, valA - valB));
                  const angle = diff * 1.4;
                  const balanced = valA === valB;
                  return (
                    <g transform={`rotate(${angle}, 210, 48)`}>
                      <line x1="70" y1="48" x2="350" y2="48" stroke="#0F172A" strokeWidth="4" />
                      <circle cx="210" cy="48" r="6" fill={balanced ? '#059669' : '#D97706'} />
                      <line x1="70" y1="48" x2="70" y2="95" stroke="#64748B" strokeWidth="2" />
                      <rect x="30" y="95" width="80" height="26" rx="4" fill="#0284C7" />
                      <text x="70" y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF">
                        {valA} {unite}
                      </text>
                      <line x1="350" y1="48" x2="350" y2="95" stroke="#64748B" strokeWidth="2" />
                      <rect x="310" y="95" width="80" height="26" rx="4" fill={balanced ? '#059669' : '#D97706'} />
                      <text x="350" y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF">
                        {valB} {unite}
                      </text>
                    </g>
                  );
                })()}
              </svg>
              <div className="text-center text-xs font-medium text-slate-700">
                {valA === valB ? (
                  <span className="text-emerald-700 font-semibold">
                    Équilibre exact : {valA} = {valB}
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    Déséquilibre : {valA} {valA > valB ? '>' : '<'} {valB} (écart de{' '}
                    <span className="font-mono">{Math.abs(valA - valB)}</span>)
                  </span>
                )}
              </div>
            </div>
          )}

          {manipulable.type === 'geometrie_aire' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center overflow-x-auto py-2">
                <div
                  className="grid gap-1 bg-slate-200 p-1.5 rounded border border-slate-300"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(12, Math.max(1, valA))}, 24px)`,
                  }}
                >
                  {Array.from({
                    length: Math.min(12, Math.max(1, valA)) * Math.min(8, Math.max(1, valB)),
                  }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 bg-sky-600/90 border border-sky-700 rounded-xs"
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div className="bg-white border border-slate-200 rounded px-3 py-2 flex justify-between">
                  <span className="text-slate-600">Aire (L × l)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {Math.min(12, Math.max(1, valA)) * Math.min(8, Math.max(1, valB))} u²
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded px-3 py-2 flex justify-between">
                  <span className="text-slate-600">Périmètre</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {2 * (Math.min(12, Math.max(1, valA)) + Math.min(8, Math.max(1, valB)))} u
                  </span>
                </div>
              </div>
            </div>
          )}

          {manipulable.type === 'droite_graduee' && (
            <div className="space-y-3 py-3">
              <svg viewBox="0 0 440 110" className="w-full h-auto">
                <line x1="25" y1="60" x2="415" y2="60" stroke="#0F172A" strokeWidth="2.5" />
                {Array.from({ length: 11 }).map((_, i) => {
                  const x = 35 + i * 37;
                  return (
                    <g key={i}>
                      <line x1={x} y1="52" x2={x} y2="68" stroke="#475569" strokeWidth="1.5" />
                      <text x={x} y="86" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#334155">
                        {i}
                      </text>
                    </g>
                  );
                })}
                {(() => {
                  const pA = 35 + Math.min(10, Math.max(0, valA)) * 37;
                  const pB = 35 + Math.min(10, Math.max(0, valB)) * 37;
                  return (
                    <>
                      <circle cx={pA} cy="60" r="7" fill="#0284C7" />
                      <text x={pA} y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284C7">
                        A ({Math.min(10, Math.max(0, valA))})
                      </text>
                      <circle cx={pB} cy="60" r="7" fill="#059669" />
                      <text x={pB} y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">
                        B ({Math.min(10, Math.max(0, valB))})
                      </text>
                    </>
                  );
                })()}
              </svg>
              <div className="text-xs text-center text-slate-600">
                Écart entre A et B :{' '}
                <span className="font-mono font-semibold text-slate-900">
                  {Math.abs(Math.min(10, Math.max(0, valA)) - Math.min(10, Math.max(0, valB)))}
                </span>{' '}
                {unite}
              </div>
            </div>
          )}

          {manipulable.type === 'proportionnalite' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Quantité de base (1 lot)</span>
                  <span className="font-mono font-semibold text-sky-700">
                    {valA} {unite}
                  </span>
                </div>
                <div className="h-5 bg-white border border-slate-300 rounded overflow-hidden">
                  <div
                    className="h-full bg-sky-600 transition-all"
                    style={{ width: `${Math.min(100, valA * 10)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Pour {valB} lots (coefficient ×{valB})</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {valA * valB} {unite}
                  </span>
                </div>
                <div className="h-5 bg-white border border-slate-300 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${Math.min(100, (valA * valB) * 2)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sliders Deck */}
        <div className="lg:col-span-5 space-y-4">
          {manipulable.type === 'fractions' ? (
            <>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="slider-num">Numérateur</label>
                  <span className="font-mono font-semibold text-slate-900">
                    {Math.min(valA, denom)}
                  </span>
                </div>
                <input
                  id="slider-num"
                  type="range"
                  min={1}
                  max={denom}
                  value={Math.min(valA, denom)}
                  onChange={(e) => updateParam('valeurA', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="slider-denom">Dénominateur</label>
                  <span className="font-mono font-semibold text-slate-900">{denom}</span>
                </div>
                <input
                  id="slider-denom"
                  type="range"
                  min={2}
                  max={10}
                  value={denom}
                  onChange={(e) => updateParam('denominateur', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="slider-mult">Facteur multiplicateur</label>
                  <span className="font-mono font-semibold text-emerald-700">×{multFactor}</span>
                </div>
                <input
                  id="slider-mult"
                  type="range"
                  min={1}
                  max={4}
                  value={multFactor}
                  onChange={(e) => setMultFactor(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="slider-a">
                    {manipulable.type === 'geometrie_aire'
                      ? 'Longueur (L)'
                      : manipulable.type === 'droite_graduee'
                      ? 'Position Point A'
                      : 'Valeur A'}
                  </label>
                  <span className="font-mono font-semibold text-slate-900">{valA}</span>
                </div>
                <input
                  id="slider-a"
                  type="range"
                  min={manipulable.type === 'droite_graduee' ? 0 : 1}
                  max={manipulable.type === 'geometrie_aire' ? 12 : 10}
                  value={valA}
                  onChange={(e) => updateParam('valeurA', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="slider-b">
                    {manipulable.type === 'geometrie_aire'
                      ? 'Largeur (l)'
                      : manipulable.type === 'droite_graduee'
                      ? 'Position Point B'
                      : manipulable.type === 'proportionnalite'
                      ? 'Nombre de lots'
                      : 'Valeur B'}
                  </label>
                  <span className="font-mono font-semibold text-slate-900">{valB}</span>
                </div>
                <input
                  id="slider-b"
                  type="range"
                  min={manipulable.type === 'droite_graduee' ? 0 : 1}
                  max={manipulable.type === 'geometrie_aire' ? 8 : 10}
                  value={valB}
                  onChange={(e) => updateParam('valeurB', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
