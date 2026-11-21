'use client';

import React, { useState } from 'react';
import {
  Accessibility,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  EleveSuiviAPC,
  EtapePedagogique,
  FicheAPC,
  HandicapProfileId,
} from '@/lib/types';
import {
  DISCIPLINE_DOMAINS,
  DISCIPLINE_PROFILES,
  alignFicheToDisciplineSubtitles,
  findDisciplineProfile,
} from '@/lib/disciplines';
import {
  HANDICAP_PROFILES,
  applyLocalHandicapInclusion,
  normalizeHandicapProfiles,
} from '@/lib/inclusion';
import { inferInvariantSubtitle } from '@/lib/storage';
import { createUid } from '@/lib/utils';
import VoiceDictationButton from './VoiceDictationButton';

export type SidebarFormTab = 'details' | 'objectives' | 'students';

interface WorkspaceSidebarFormsProps {
  fiche: FicheAPC;
  allFiches: FicheAPC[];
  isOnline: boolean;
  onUpdateFiche: (updated: FicheAPC) => void;
  onSelectFiche: (id: string) => void;
  onOpenFullEditor: () => void;
  onSaveSnapshot: (fiche: FicheAPC) => void;
}

export default function WorkspaceSidebarForms({
  fiche,
  allFiches,
  isOnline,
  onUpdateFiche,
  onSelectFiche,
  onOpenFullEditor,
  onSaveSnapshot,
}: WorkspaceSidebarFormsProps) {
  const [formTab, setFormTab] = useState<SidebarFormTab>('details');
  const [newObjective, setNewObjective] = useState('');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    fiche.deroulement?.[0]?.id || null
  );
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const activeDiscipline = findDisciplineProfile(
    fiche.disciplineId || fiche.matiere,
    fiche.titre
  );
  const selectedHandicaps = normalizeHandicapProfiles(fiche.handicapsInclus);
  const objectifs = fiche.objectifsSpecifiques || [];
  const deroulement = fiche.deroulement || [];
  const eleves = fiche.eleves || [];

  const touch = (patch: Partial<FicheAPC>) => {
    onUpdateFiche({
      ...fiche,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddObjective = (textToAdd?: string) => {
    const clean = (textToAdd ?? newObjective).trim();
    if (!clean) return;
    touch({ objectifsSpecifiques: [...objectifs, clean] });
    if (!textToAdd) setNewObjective('');
  };

  const handleUpdateObjective = (index: number, value: string) => {
    const next = objectifs.map((item, idx) => (idx === index ? value : item));
    touch({ objectifsSpecifiques: next });
  };

  const handleRemoveObjective = (index: number) => {
    touch({ objectifsSpecifiques: objectifs.filter((_, idx) => idx !== index) });
  };

  const handleUpdateStep = (
    stepId: string,
    field: keyof EtapePedagogique,
    value: string
  ) => {
    touch({
      deroulement: deroulement.map((s) =>
        s.id === stepId ? { ...s, [field]: value } : s
      ),
    });
  };

  const handleAddStep = () => {
    const idx = deroulement.length;
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
    touch({ deroulement: [...deroulement, newStep] });
    setExpandedStepId(newStep.id);
  };

  const handleRemoveStep = (stepId: string) => {
    if (deroulement.length <= 1) return;
    touch({ deroulement: deroulement.filter((s) => s.id !== stepId) });
  };

  const toggleHandicapProfile = (id: HandicapProfileId) => {
    const exists = selectedHandicaps.includes(id);
    if (exists && selectedHandicaps.length <= 1) return;
    const next = exists
      ? selectedHandicaps.filter((item) => item !== id)
      : [...selectedHandicaps, id];
    touch({ handicapsInclus: next });
  };

  const handleInjectInclusion = () => {
    const updated = applyLocalHandicapInclusion(fiche, selectedHandicaps);
    onUpdateFiche(updated);
    setSavedNotice('Adaptations inclusives injectées dans les étapes.');
  };

  const handleAddStudent = () => {
    const nextStudent: EleveSuiviAPC = {
      id: createUid('eleve'),
      prenom: `Élève ${eleves.length + 1}`,
      besoinSpecifique: 'Soutien guidé APC',
      objectifIndividuel: objectifs[0] || 'Consolider la notion de la séance.',
      statut: 'en_cours',
    };
    touch({ eleves: [...eleves, nextStudent] });
  };

  const handleUpdateStudent = (
    studentId: string,
    field: keyof EleveSuiviAPC,
    value: string
  ) => {
    touch({
      eleves: eleves.map((el) =>
        el.id === studentId ? { ...el, [field]: value } : el
      ),
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    touch({ eleves: eleves.filter((el) => el.id !== studentId) });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      {/* Sidebar Sheet Switcher & Quick Save */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-900">
            Paramètres de la fiche APC
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSaveSnapshot(fiche);
                setSavedNotice('Instantané enregistré dans l’historique.');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={onOpenFullEditor}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Retouche IA
            </button>
          </div>
        </div>

        <label className="block">
          <span className="sr-only">Fiche active</span>
          <select
            aria-label="Sélectionner la fiche APC active"
            value={fiche.id}
            onChange={(e) => onSelectFiche(e.target.value)}
            className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {allFiches.map((f) => (
              <option key={f.id} value={f.id}>
                {f.matiere} ({f.niveau}) — {f.titre}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
          <span>
            Origine : <strong className="text-slate-700 font-medium">{fiche.modeCreation}</strong>
          </span>
          {fiche.fichierSource && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[220px]">
                Fichier : {fiche.fichierSource.nom}
              </span>
            </>
          )}
          {fiche.derniereRetouche && fiche.derniereRetouche.sectionsModifiees.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-sky-700 truncate max-w-[240px]">
                Retouché : {fiche.derniereRetouche.sectionsModifiees[0]}
              </span>
            </>
          )}
        </div>

        {/* Segmented Sidebar Section Tabs */}
        <div
          role="tablist"
          aria-label="Sections du formulaire de la fiche"
          className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-md"
        >
          {(
            [
              { id: 'details', label: 'Détails APC' },
              { id: 'objectives', label: 'Objectifs' },
              { id: 'students', label: 'Élèves' },
            ] as const
          ).map((tab) => {
            const active = formTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFormTab(tab.id)}
                className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices */}
      {(voiceError || savedNotice) && (
        <div className="px-4 pt-3 space-y-2">
          {voiceError && (
            <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center justify-between gap-2">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="font-semibold text-rose-700 shrink-0"
              >
                Fermer
              </button>
            </div>
          )}
          {savedNotice && (
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between gap-2">
              <span>{savedNotice}</span>
              <button
                type="button"
                onClick={() => setSavedNotice(null)}
                className="font-semibold text-emerald-800 shrink-0"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scrollable Sidebar Form Body */}
      <div className="p-4 space-y-5 lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto">
        {formTab === 'details' && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Titre de la fiche APC
              </span>
              <input
                type="text"
                value={fiche.titre}
                onChange={(e) => touch({ titre: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Thème du programme
              </span>
              <input
                type="text"
                value={fiche.theme}
                onChange={(e) => touch({ theme: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Discipline spécifique APC
              </span>
              <select
                value={activeDiscipline.id}
                onChange={(e) => {
                  const nextProfile = findDisciplineProfile(e.target.value);
                  onUpdateFiche(
                    alignFicheToDisciplineSubtitles(fiche, nextProfile, {
                      updateStepTitles: false,
                    })
                  );
                }}
                className="mt-1 w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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

            <div className="grid grid-cols-3 gap-2.5">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Matière
                </span>
                <input
                  type="text"
                  value={fiche.matiere}
                  onChange={(e) => touch({ matiere: e.target.value })}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Niveau
                </span>
                <input
                  type="text"
                  value={fiche.niveau}
                  onChange={(e) => touch({ niveau: e.target.value })}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Durée
                </span>
                <input
                  type="text"
                  value={fiche.duree}
                  onChange={(e) => touch({ duree: e.target.value })}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-sky-800">
                CB (Compétence de Base)
              </span>
              <input
                type="text"
                value={fiche.competenceDeBase || ''}
                onChange={(e) => touch({ competenceDeBase: e.target.value })}
                placeholder="Ex : CB1 — Mobiliser les écritures fractionnaires..."
                className="mt-1 w-full px-3 py-2 text-xs bg-sky-50/50 border border-sky-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Compétence visée
              </span>
              <textarea
                rows={2}
                value={fiche.competenceVisee}
                onChange={(e) => touch({ competenceVisee: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Prérequis (1 par ligne)
              </span>
              <textarea
                rows={3}
                value={(fiche.prerequis || []).join('\n')}
                onChange={(e) =>
                  touch({
                    prerequis: e.target.value
                      .split(/\r?\n/)
                      .map((line) => line.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Matériel &amp; supports (1 par ligne)
              </span>
              <textarea
                rows={3}
                value={(fiche.materiel || []).join('\n')}
                onChange={(e) =>
                  touch({
                    materiel: e.target.value
                      .split(/\r?\n/)
                      .map((line) => line.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
          </div>
        )}

        {formTab === 'objectives' && (
          <div className="space-y-5">
            {/* Objectifs spécifiques */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Objectifs spécifiques ({objectifs.length})
                </span>
                <VoiceDictationButton
                  compact
                  isOnline={isOnline}
                  label="Dicter objectif"
                  title="Dicter un objectif pédagogique via Web Speech"
                  onError={setVoiceError}
                  onTranscript={(text) => handleAddObjective(text)}
                />
              </div>

              <div className="space-y-2">
                {objectifs.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 pt-2 w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <textarea
                      rows={2}
                      aria-label={`Objectif spécifique ${idx + 1}`}
                      value={obj}
                      onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(idx)}
                      aria-label={`Supprimer l’objectif ${idx + 1}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                  placeholder="Ajouter un objectif mesurable…"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddObjective()}
                  aria-label="Ajouter l’objectif"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Mise en situation */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <span className="block text-xs font-semibold text-slate-900">
                Situation de départ
              </span>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">
                  Accroche / Situation-problème
                </span>
                <textarea
                  rows={2}
                  value={fiche.introduction?.accroche || ''}
                  onChange={(e) =>
                    touch({
                      introduction: {
                        ...fiche.introduction,
                        accroche: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">
                  Mise en situation
                </span>
                <textarea
                  rows={2}
                  value={fiche.introduction?.miseEnSituation || ''}
                  onChange={(e) =>
                    touch({
                      introduction: {
                        ...fiche.introduction,
                        miseEnSituation: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">
                  Consigne de départ
                </span>
                <textarea
                  rows={2}
                  value={fiche.introduction?.consigneDepart || ''}
                  onChange={(e) =>
                    touch({
                      introduction: {
                        ...fiche.introduction,
                        consigneDepart: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            </div>

            {/* Étapes du déroulement */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Étapes du déroulement ({deroulement.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  Étape
                </button>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                {deroulement.map((step, idx) => {
                  const isOpen = expandedStepId === step.id;
                  return (
                    <div key={step.id} className="bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStepId(isOpen ? null : step.id)
                        }
                        className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {step.etape}
                          </div>
                          {step.sousTitreInvariable && (
                            <div className="text-[11px] italic text-slate-500 truncate">
                              {step.sousTitreInvariable}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono tabular-nums text-sky-700">
                            {step.duree}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              aria-label={`Titre étape ${idx + 1}`}
                              value={step.etape}
                              onChange={(e) =>
                                handleUpdateStep(step.id, 'etape', e.target.value)
                              }
                              className="col-span-2 px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded text-slate-900"
                            />
                            <input
                              type="text"
                              aria-label={`Durée étape ${idx + 1}`}
                              value={step.duree}
                              onChange={(e) =>
                                handleUpdateStep(step.id, 'duree', e.target.value)
                              }
                              className="px-2 py-1 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded text-slate-900"
                            />
                          </div>
                          <label className="block">
                            <span className="text-[11px] font-medium text-slate-600">
                              Activités du maître
                            </span>
                            <textarea
                              rows={2}
                              value={step.activitesMaitre}
                              onChange={(e) =>
                                handleUpdateStep(
                                  step.id,
                                  'activitesMaitre',
                                  e.target.value
                                )
                              }
                              className="mt-0.5 w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-medium text-slate-600">
                              Activités des élèves
                            </span>
                            <textarea
                              rows={2}
                              value={step.activitesEleves}
                              onChange={(e) =>
                                handleUpdateStep(
                                  step.id,
                                  'activitesEleves',
                                  e.target.value
                                )
                              }
                              className="mt-0.5 w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-medium text-slate-600">
                              Indicateurs pédagogiques inclusifs
                            </span>
                            <textarea
                              rows={2}
                              value={step.indicateursInclusifs}
                              onChange={(e) =>
                                handleUpdateStep(
                                  step.id,
                                  'indicateursInclusifs',
                                  e.target.value
                                )
                              }
                              className="mt-0.5 w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900"
                            />
                          </label>
                          {deroulement.length > 1 && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(step.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 hover:text-rose-800"
                              >
                                <Trash2 className="w-3 h-3" />
                                Supprimer cette étape
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Synthèse */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <span className="block text-xs font-semibold text-slate-900">
                Synthèse &amp; trace écrite
              </span>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">
                  Idée clé à retenir
                </span>
                <textarea
                  rows={2}
                  value={fiche.synthese?.resumeCle || ''}
                  onChange={(e) =>
                    touch({
                      synthese: { ...fiche.synthese, resumeCle: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">
                  Trace écrite de l’élève
                </span>
                <textarea
                  rows={2}
                  value={fiche.synthese?.traceEcriteEleve || ''}
                  onChange={(e) =>
                    touch({
                      synthese: {
                        ...fiche.synthese,
                        traceEcriteEleve: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900"
                />
              </label>
            </div>
          </div>
        )}

        {formTab === 'students' && (
          <div className="space-y-5">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Effectif &amp; constitution du groupe APC
              </span>
              <input
                type="text"
                value={fiche.effectif}
                onChange={(e) => touch({ effectif: e.target.value })}
                placeholder="Ex : 6 élèves (groupe de besoin APC)"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            {/* Inclusion Handicap */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <Accessibility className="w-3.5 h-3.5 text-sky-700" />
                  Besoins éducatifs &amp; inclusion
                </span>
                <button
                  type="button"
                  onClick={handleInjectInclusion}
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
                >
                  Injecter dans les étapes
                </button>
              </div>
              <div className="space-y-1.5">
                {HANDICAP_PROFILES.map((profile) => {
                  const checked = selectedHandicaps.includes(profile.id);
                  return (
                    <label
                      key={profile.id}
                      className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'bg-sky-50/50 border-sky-300 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleHandicapProfile(profile.id)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-[11px]">
                          {profile.nom}
                        </span>
                        <span className="block text-[10px] text-slate-500 leading-snug">
                          {profile.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Suivi des élèves du groupe */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Suivi des élèves ({eleves.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-3 h-3" />
                  Ajouter un élève
                </button>
              </div>

              {eleves.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  Aucun élève renseigné pour cette séance. Ajoutez les élèves du groupe APC pour suivre leurs objectifs et adaptations.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                  {eleves.map((el, idx) => (
                    <div key={el.id} className="p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          aria-label={`Prénom de l’élève ${idx + 1}`}
                          value={el.prenom}
                          onChange={(e) =>
                            handleUpdateStudent(el.id, 'prenom', e.target.value)
                          }
                          placeholder="Prénom / Initiale"
                          className="flex-1 px-2 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <select
                          aria-label={`Statut de ${el.prenom || `élève ${idx + 1}`}`}
                          value={el.statut}
                          onChange={(e) =>
                            handleUpdateStudent(el.id, 'statut', e.target.value)
                          }
                          className="px-2 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="en_cours">En cours</option>
                          <option value="acquis">Acquis</option>
                          <option value="a_consolider">À consolider</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(el.id)}
                          aria-label={`Retirer ${el.prenom || `élève ${idx + 1}`}`}
                          className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        aria-label={`Besoin spécifique de ${el.prenom || `élève ${idx + 1}`}`}
                        value={el.besoinSpecifique}
                        onChange={(e) =>
                          handleUpdateStudent(
                            el.id,
                            'besoinSpecifique',
                            e.target.value
                          )
                        }
                        placeholder="Besoin particulier / aménagement..."
                        className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />

                      <input
                        type="text"
                        aria-label={`Objectif individualisé de ${el.prenom || `élève ${idx + 1}`}`}
                        value={el.objectifIndividuel}
                        onChange={(e) =>
                          handleUpdateStudent(
                            el.id,
                            'objectifIndividuel',
                            e.target.value
                          )
                        }
                        placeholder="Objectif ciblé pendant la séance..."
                        className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observations enseignant */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="workspace-observations"
                  className="text-xs font-semibold text-slate-900"
                >
                  Observations sur les élèves
                </label>
                <VoiceDictationButton
                  compact
                  isOnline={isOnline}
                  label="Dicter observations"
                  title="Dicter vos observations sur les élèves via Web Speech"
                  onError={setVoiceError}
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
                id="workspace-observations"
                rows={3}
                value={fiche.observations || ''}
                onChange={(e) => touch({ observations: e.target.value })}
                placeholder="Notez ou dictez les réussites, obstacles et pistes de remédiation..."
                className="w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
