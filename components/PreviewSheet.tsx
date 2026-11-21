'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { EleveSuiviAPC, FicheAPC } from '@/lib/types';
import { formatHandicapSummary } from '@/lib/inclusion';
import {
  getEffectiveManipulationSchematisation,
  mapPhasesToDeroulementSteps,
} from '@/lib/manipulation-phases';
import { sanitizeSvg } from '@/lib/svg-sanitize';
import PhaseManipulationInteractiveDeck from './PhaseManipulationInteractiveDeck';

export type PreviewZoom = 85 | 100 | 110;

export interface PreviewSheetProps {
  fiche: FicheAPC;
  zoom?: PreviewZoom;
  showPageGuides?: boolean;
}

function StudentStatusLabel({ statut }: { statut: EleveSuiviAPC['statut'] }) {
  if (statut === 'acquis') {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        Acquis
      </span>
    );
  }
  if (statut === 'a_consolider') {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        À consolider
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      En cours
    </span>
  );
}

export function PreviewSheet({
  fiche,
  zoom = 100,
  showPageGuides = true,
}: PreviewSheetProps) {
  const paperDimensionsClass =
    zoom === 85
      ? 'max-w-[680px] min-h-[960px] text-[11px]'
      : zoom === 110
      ? 'max-w-[875px] min-h-[1235px] text-[13px]'
      : 'max-w-[794px] min-h-[1123px] text-xs';

  const objectifs = (fiche.objectifsSpecifiques || []).filter(Boolean);
  const prerequis = (fiche.prerequis || []).filter(Boolean);
  const materiel = (fiche.materiel || []).filter(Boolean);
  const deroulement = fiche.deroulement || [];
  const questions = fiche.questionsReponses || [];
  const motsCles = (fiche.synthese?.motsCles || []).filter(Boolean);
  const eleves = fiche.eleves || [];
  const activeManipulation = getEffectiveManipulationSchematisation(fiche);
  const { stepPhaseMap, unmappedPhases } = mapPhasesToDeroulementSteps(
    deroulement,
    activeManipulation?.phases || []
  );
  const situationRef =
    activeManipulation?.situationProblemeReference ||
    fiche.introduction?.accroche ||
    fiche.introduction?.miseEnSituation ||
    '';

  return (
    <article
      aria-label="Aperçu A4 de la fiche pédagogique APC"
      className={`print-sheet mx-auto w-full ${paperDimensionsClass} bg-white text-slate-900 border border-slate-300 shadow-sm px-6 py-7 sm:px-11 sm:py-10 flex flex-col justify-between gap-6 transition-all ${
        showPageGuides ? 'a4-page-guides' : ''
      }`}
    >
      <div className="space-y-6">
        {/* En-tête documentaire A4 */}
        <header className="border-b-2 border-slate-900 pb-4 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold tracking-wide text-sky-700">
            <span>
              Fiche pédagogique APC · Activités Pédagogiques Complémentaires
            </span>
            <span className="font-mono tabular-nums text-slate-500 font-medium">
              A4 · {fiche.niveau || 'Cycle'}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight text-balance">
            {fiche.titre || 'Séance APC sans titre'}
          </h1>
          {fiche.theme && (
            <p className="text-sm text-slate-600 italic">
              Thème : {fiche.theme}
            </p>
          )}
        </header>

        {/* Grille d'identification APC */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-300 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-slate-50/70">
            <div className="p-2.5">
              <span className="text-[10px] font-medium text-slate-500 block">
                Matière
              </span>
              <strong className="text-slate-900">{fiche.matiere || '—'}</strong>
            </div>
            <div className="p-2.5">
              <span className="text-[10px] font-medium text-slate-500 block">
                Niveau scolaire
              </span>
              <strong className="text-slate-900">{fiche.niveau || '—'}</strong>
            </div>
            <div className="p-2.5">
              <span className="text-[10px] font-medium text-slate-500 block">
                Durée prévue
              </span>
              <strong className="font-mono tabular-nums text-slate-900">
                {fiche.duree || '—'}
              </strong>
            </div>
            <div className="p-2.5">
              <span className="text-[10px] font-medium text-slate-500 block">
                Effectif / Groupe
              </span>
              <strong className="text-slate-900">{fiche.effectif || '—'}</strong>
            </div>
          </div>

          {fiche.competenceDeBase && (
            <div className="p-3 border border-sky-200 bg-sky-50/50 text-slate-900">
              <span className="font-semibold text-sky-900">
                Compétence de base (CB) :{' '}
              </span>
              <span>{fiche.competenceDeBase}</span>
            </div>
          )}

          <div className="p-3 border border-slate-200 bg-white">
            <span className="font-semibold text-slate-900">
              Compétence visée :{' '}
            </span>
            <span className="text-slate-800">
              {fiche.competenceVisee || '—'}
            </span>
          </div>

          {fiche.handicapsInclus && fiche.handicapsInclus.length > 0 && (
            <div className="p-3 border border-emerald-200 bg-emerald-50/40 text-slate-900">
              <span className="font-semibold text-emerald-900">
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

          {(fiche.fichierSource || fiche.derniereRetouche) && (
            <div className="px-3 py-2 border border-slate-200 bg-slate-50/60 text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {fiche.fichierSource && (
                <span>
                  <strong className="text-slate-800">
                    Fichier ({fiche.fichierSource.action === 'retouche' ? 'retouche' : 'création'}) :
                  </strong>{' '}
                  {fiche.fichierSource.nom}
                </span>
              )}
              {fiche.fichierSource && fiche.derniereRetouche && (
                <span aria-hidden="true">·</span>
              )}
              {fiche.derniereRetouche &&
                fiche.derniereRetouche.sectionsModifiees.length > 0 && (
                  <span>
                    <strong className="text-slate-800">Sections retouchées :</strong>{' '}
                    {fiche.derniereRetouche.sectionsModifiees.join(', ')}
                  </span>
                )}
            </div>
          )}
        </section>

        {/* Section 1: Objectifs, Prérequis, Matériel & Mise en situation */}
        <section className="space-y-2.5 border-t border-slate-200 pt-4">
          <h2 className="text-sm font-display font-bold text-slate-900">
            1. Objectifs, prérequis et mise en situation
          </h2>
          <div className="space-y-2 leading-relaxed text-slate-800">
            <div>
              <strong className="text-slate-900">Objectifs spécifiques : </strong>
              {objectifs.length > 0 ? (
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  {objectifs.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              ) : (
                <span>—</span>
              )}
            </div>
            {prerequis.length > 0 && (
              <p>
                <strong className="text-slate-900">Prérequis : </strong>
                {prerequis.join(' · ')}
              </p>
            )}
            <p>
              <strong className="text-slate-900">Matériel &amp; supports : </strong>
              {materiel.length > 0 ? materiel.join(' · ') : '—'}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
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
                {deroulement.map((step, idx) => {
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
                          <div className="font-mono tabular-nums text-[11px] text-sky-700 font-semibold mt-1">
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
          </div>
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
              <p className="p-2.5 border border-slate-200 bg-slate-50 text-slate-800">
                <strong>Passage à l’abstraction : </strong>
                {activeManipulation.synthesePassageAbstraction}
              </p>
            )}
          </section>
        )}

        {/* Section 3: Illustration pédagogique */}
        {fiche.illustration?.svgCode && (
          <section className="space-y-2.5 border-t border-slate-200 pt-4 break-inside-avoid">
            <h2 className="text-sm font-display font-bold text-slate-900">
              3. Illustration pédagogique : {fiche.illustration.titre}
            </h2>
            <div
              className="border border-slate-200 p-3 bg-slate-50/50 [&>svg]:w-full [&>svg]:max-h-[260px] [&>svg]:mx-auto"
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
        {questions.length > 0 && (
          <section className="space-y-2.5 border-t border-slate-200 pt-4">
            <h2 className="text-sm font-display font-bold text-slate-900">
              4. Questions-réponses interactives ({questions.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
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
                  {questions.map((qr, idx) => (
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
            </div>
          </section>
        )}

        {/* Section 5: Synthèse et trace écrite */}
        <section className="space-y-2 border-t border-slate-200 pt-4 break-inside-avoid">
          <h2 className="text-sm font-display font-bold text-slate-900">
            5. Synthèse et trace écrite
          </h2>
          <div className="space-y-2 leading-relaxed text-slate-800">
            <p className="whitespace-pre-line">
              <strong className="text-slate-900">Idée clé : </strong>
              {fiche.synthese?.resumeCle || '—'}
            </p>
            <p className="p-2.5 border border-slate-200 bg-slate-50/70 whitespace-pre-line">
              <strong className="text-slate-900">Trace écrite élève : </strong>
              {fiche.synthese?.traceEcriteEleve || '—'}
            </p>
            {motsCles.length > 0 && (
              <p>
                <strong className="text-slate-900">Mots-clés : </strong>
                {motsCles.join(' · ')}
              </p>
            )}
            <p>
              <strong className="text-slate-900">Prolongement : </strong>
              {fiche.synthese?.prolongement || '—'}
            </p>
          </div>
        </section>

        {/* Section 6: Groupe d'élèves & Observations de l'enseignant */}
        {(eleves.length > 0 || fiche.observations?.trim()) && (
          <section className="space-y-2.5 border-t border-slate-200 pt-4 break-inside-avoid">
            <h2 className="text-sm font-display font-bold text-slate-900">
              6. Suivi des élèves et observations de séance
            </h2>
            {eleves.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
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
                        Validation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map((el, idx) => (
                      <tr
                        key={el.id}
                        className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
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
                        <td className="p-2 border border-slate-300 align-top">
                          <StudentStatusLabel statut={el.statut} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {fiche.observations?.trim() && (
              <p className="p-2.5 border border-slate-200 bg-slate-50/70 leading-relaxed text-slate-800 whitespace-pre-line">
                <strong className="text-slate-900">
                  Observations de l’enseignant :{' '}
                </strong>
                {fiche.observations}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Pied de page A4 */}
      <footer className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Atelier APC · {fiche.matiere} ({fiche.niveau})
        </span>
        <span className="font-mono tabular-nums">
          Format A4 · {deroulement.length} étapes
        </span>
      </footer>
    </article>
  );
}

export default PreviewSheet;
