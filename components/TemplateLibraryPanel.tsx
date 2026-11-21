'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookTemplate,
  Check,
  Layers,
  Search,
  Wand2,
} from 'lucide-react';
import { DomaineModele, ModeleFicheAPC } from '@/lib/types';
import { DOMAINE_MODELES, MODELE_FICHES } from '@/lib/templates';

interface TemplateLibraryPanelProps {
  selectedTemplateId?: string | null;
  onSelectForForm?: (template: ModeleFicheAPC) => void;
  onCreateFromTemplate: (template: ModeleFicheAPC) => void;
}

export default function TemplateLibraryPanel({
  selectedTemplateId = null,
  onSelectForForm,
  onCreateFromTemplate,
}: TemplateLibraryPanelProps) {
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'cm1_s9' | 'general'>('all');
  const [domaineFilter, setDomaineFilter] = useState<'Tous' | DomaineModele>('Tous');
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const cm1S9Count = useMemo(
    () => MODELE_FICHES.filter((t) => t.collection === 'cm1_s9').length,
    []
  );
  const generalCount = MODELE_FICHES.length - cm1S9Count;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MODELE_FICHES.filter((t) => {
      const matchCollection =
        collectionFilter === 'all' ||
        (collectionFilter === 'cm1_s9'
          ? t.collection === 'cm1_s9'
          : t.collection !== 'cm1_s9');
      const matchDomain = domaineFilter === 'Tous' || t.domaine === domaineFilter;
      const matchQuery =
        !q ||
        t.nom.toLowerCase().includes(q) ||
        (t.sousLabel || '').toLowerCase().includes(q) ||
        (t.origineModele || '').toLowerCase().includes(q) ||
        t.titreSuggere.toLowerCase().includes(q) ||
        t.themeSuggere.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.matiere.toLowerCase().includes(q);
      return matchCollection && matchDomain && matchQuery;
    });
  }, [collectionFilter, domaineFilter, search]);

  const previewTemplate =
    MODELE_FICHES.find((t) => t.id === previewId) || null;

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BookTemplate className="w-4 h-4 text-sky-600" />
            Bibliothèque de modèles de fiches pédagogiques ({MODELE_FICHES.length} modèles)
          </h2>
          <p className="text-xs text-slate-600">
            Modèles spécifiques par discipline avec inclusion des enfants en situation de handicap : sélectionnez un modèle pour l’ouvrir ou le cloner avec l’IA haute gamme.
          </p>
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer (ex : Fiche 10, angles, phrases, EPS)..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Collection & Domain Filter Strips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: `Tous (${MODELE_FICHES.length})` },
              { id: 'cm1_s9', label: `CM1 – Semaine 9 (${cm1S9Count})` },
              { id: 'general', label: `Trames générales (${generalCount})` },
            ] as const
          ).map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setCollectionFilter(col.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                collectionFilter === col.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['Tous', ...DOMAINE_MODELES] as const).map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => setDomaineFilter(dom)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                domaineFilter === dom
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          Aucun modèle ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            const isPreviewed = previewId === tpl.id;
            const handicapCount = tpl.handicapsInclus?.length || 5;
            return (
              <div
                key={tpl.id}
                className={`border rounded-lg p-4 flex flex-col justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-sky-700 truncate">
                      {tpl.domaine}
                      {tpl.origineModele ? ` · ${tpl.origineModele}` : ''}
                    </span>
                    <span className="font-mono shrink-0">
                      {tpl.niveauParDefaut} · {tpl.dureeParDefaut}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {tpl.nom}
                  </h3>
                  {tpl.sousLabel && (
                    <p className="text-[11px] font-medium text-slate-600">
                      {tpl.sousLabel}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Inclusion handicap : {handicapCount} profils adaptés · {tpl.themeSuggere}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {tpl.etapes.length} étapes · {tpl.questionsReponses.length} Q&amp;R
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewId(isPreviewed ? null : tpl.id)}
                      className="font-semibold text-slate-600 hover:text-sky-700"
                    >
                      {isPreviewed ? 'Masquer la trame' : 'Voir trame & Q&R'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {onSelectForForm && (
                      <button
                        type="button"
                        onClick={() => onSelectForForm(tpl)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        {isSelected ? 'Sélectionné (IA)' : 'Pré-remplir IA'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCreateFromTemplate(tpl)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                    >
                      Ouvrir le modèle
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Drawer of Selected Template Structure */}
      {previewTemplate && (
        <div className="border border-slate-200 rounded-lg bg-slate-50/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Trame complète : {previewTemplate.nom}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                <strong>CB :</strong> {previewTemplate.competenceDeBaseModele}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewId(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Fermer l’aperçu
            </button>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Déroulement détaillé ({previewTemplate.etapes.length} étapes · Activités du maître, Activités de l’élève &amp; Indicateurs inclusifs)
            </h5>
            <ol className="space-y-2.5">
              {previewTemplate.etapes.map((st, idx) => (
                <li
                  key={idx}
                  className="bg-white border border-slate-200 rounded-md p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <div>
                      <span className="text-xs font-semibold text-slate-900">
                        {st.etape}
                      </span>
                      <p className="text-[11px] italic text-slate-500">
                        {st.sousTitreInvariable}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-sky-700 shrink-0">
                      {st.duree}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
                      <span className="block text-[11px] font-semibold text-slate-800">
                        Activités du maître
                      </span>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                        {st.activitesMaitre}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
                      <span className="block text-[11px] font-semibold text-slate-800">
                        Activités de l’élève
                      </span>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                        {st.activitesEleves}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2.5 space-y-1">
                      <span className="block text-[11px] font-semibold text-emerald-900">
                        Indicateurs pédagogiques inclusifs
                      </span>
                      <p className="text-[11px] text-emerald-950 whitespace-pre-line leading-relaxed">
                        {st.indicateursInclusifs}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Questions-Réponses interactives ({previewTemplate.questionsReponses.length} paliers)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {previewTemplate.questionsReponses.map((qr, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-white border border-slate-200 rounded-md p-3 space-y-1.5"
                >
                  <span className="block text-[11px] font-semibold text-sky-700">
                    Palier {qr.difficulte}
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    Q{qIdx + 1} : {qr.question}
                  </p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Réponse attendue :</strong> {qr.reponseAttendue}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Indice :</strong> {qr.indicePedagogique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
