'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Accessibility,
  BookTemplate,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
  Image as ImageIcon,
  Loader2,
  SlidersHorizontal,
  Upload,
  Wand2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  CbMathType,
  FicheAPC,
  HandicapProfileId,
  MatiereType,
  ModeleFicheAPC,
  NiveauType,
  PreferenceApprentissage,
  ReasoningQuality,
} from '@/lib/types';
import { buildOfflineFiche, normalizeFiche } from '@/lib/storage';
import { buildFicheFromTemplate, MODELE_FICHES } from '@/lib/templates';
import { postJson, readBlobAsBase64 } from '@/lib/api-client';
import { readAnyUploadedFile, TEXT_FILE_ACCEPT } from '@/lib/file-reader';
import {
  DEFAULT_HANDICAP_PROFILES,
  HANDICAP_PROFILES,
} from '@/lib/inclusion';
import {
  CB_MATH_CATALOG,
  isMathContext,
  normalizeCbMathCode,
} from '@/lib/math-schematisation';
import PedagogicalChatbot from './PedagogicalChatbot';
import VoiceDictationButton from './VoiceDictationButton';
import TemplateLibraryPanel from './TemplateLibraryPanel';

interface GeneratorViewProps {
  isOnline: boolean;
  fiches: FicheAPC[];
  preferences: PreferenceApprentissage[];
  onFicheGenerated: (fiche: FicheAPC) => void;
  onLearnPreference?: (regle: string, source: string) => void;
}

type CreationSourceMode = 'theme' | 'modeles' | 'texte' | 'image' | 'chatbot';

const MATIERES: MatiereType[] = [
  'Mathématiques',
  'Français',
  'Sciences humaines',
  'Sciences et Technologie',
  'Éducation Sociale',
  'Éducation Physique et Sportive',
  'Art Plastique',
  'Activité Manuelle',
  'Remédiation',
  'Histoire-Géographie',
  'Langues vivantes',
  'Éducation Civique et Morale',
  'Arts et Culture',
  'Autre',
];

const NIVEAUX: NiveauType[] = [
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Lycée',
];

const PRESETS = [
  {
    titre: 'Résoudre des problèmes de proportionnalité par passage à l’unité',
    theme: 'Grandeurs, mesures et proportionnalité au cycle 3',
    competenceDeBase:
      'CB3 (Mathématiques CM2) — Résoudre des problèmes relevant de la proportionnalité en mobilisant le passage à l’unité.',
    matiere: 'Mathématiques' as MatiereType,
    niveau: 'CM2' as NiveauType,
    duree: '45 min',
    contexteInclusif: 'Groupe de 6 élèves dont 1 élève dyscalculique et 1 élève TDAH.',
    includeManipulable: true,
  },
  {
    titre: 'Inférer l’implicite dans un récit court',
    theme: 'Compréhension de lecture et stratégies d’inférence',
    competenceDeBase:
      'CB2 (Français CE2) — Identifier les informations implicites d’un texte en croisant indices textuels et connaissances.',
    matiere: 'Français' as MatiereType,
    niveau: 'CE2' as NiveauType,
    duree: '40 min',
    contexteInclusif: 'Petit groupe de besoin lecture fluide, soutien lexical nécessaire.',
    includeManipulable: false,
  },
  {
    titre: 'Comprendre la nutrition et les besoins de la plante verte',
    theme: 'Le vivant, sa diversité et ses fonctions',
    competenceDeBase:
      'CB1 (Sciences 6ème) — Expliquer les besoins nutritifs d’un végétal chlorophyllien à partir d’expériences simples.',
    matiere: 'Sciences et Technologie' as MatiereType,
    niveau: '6ème' as NiveauType,
    duree: '50 min',
    contexteInclusif: 'Démarche d’investigation guidée avec schéma annoté.',
    includeManipulable: true,
  },
];

export default function GeneratorView({
  isOnline,
  fiches,
  preferences,
  onFicheGenerated,
  onLearnPreference,
}: GeneratorViewProps) {
  const [sourceMode, setSourceMode] = useState<CreationSourceMode>('theme');
  const [titre, setTitre] = useState('');
  const [theme, setTheme] = useState('');
  const [competenceDeBase, setCompetenceDeBase] = useState('');
  const [cbMath, setCbMath] = useState<CbMathType>('CB1');
  const [matiere, setMatiere] = useState<MatiereType>('Mathématiques');
  const [niveau, setNiveau] = useState<NiveauType>('CM2');
  const [duree, setDuree] = useState('45 min');
  const [contexteInclusif, setContexteInclusif] = useState('');
  const [includeManipulable, setIncludeManipulable] = useState(true);
  const [handicapProfiles, setHandicapProfiles] = useState<HandicapProfileId[]>([
    ...DEFAULT_HANDICAP_PROFILES,
  ]);
  const [quality, setQuality] = useState<ReasoningQuality>('expert');
  const [referenceFicheId, setReferenceFicheId] = useState<string>('');

  const [sourceText, setSourceText] = useState('');
  const [sourceTextName, setSourceTextName] = useState('');
  const [sourceImage, setSourceImage] = useState<{
    name: string;
    mimeType: string;
    data: string;
    previewUrl: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const loadingStage =
    elapsedSec < 3
      ? 'Analyse du thème, des CB et du support…'
      : elapsedSec < 7
      ? 'Structuration du tableau à 4 colonnes avec sous-titres invariables…'
      : elapsedSec < 12
      ? 'Création du schéma annoté et des Q&R interactives…'
      : 'Finalisation de la synthèse et des indicateurs inclusifs…';

  const selectedTemplateObj = referenceFicheId.startsWith('tpl:')
    ? MODELE_FICHES.find((t) => `tpl:${t.id}` === referenceFicheId) || null
    : null;

  const selectedReferenceFiche: FicheAPC | null = selectedTemplateObj
    ? buildFicheFromTemplate(selectedTemplateObj)
    : fiches.find((f) => f.id === referenceFicheId) || null;

  const applyTemplateToForm = (tpl: ModeleFicheAPC) => {
    setTitre(tpl.titreSuggere);
    setTheme(tpl.themeSuggere);
    setCompetenceDeBase(tpl.competenceDeBaseModele);
    if (isMathContext(tpl.matiere, tpl.id)) {
      setCbMath(
        normalizeCbMathCode(
          undefined,
          tpl.competenceDeBaseModele,
          tpl.titreSuggere,
          tpl.themeSuggere
        )
      );
    }
    setMatiere(tpl.matiere);
    setNiveau(tpl.niveauParDefaut);
    setDuree(tpl.dureeParDefaut);
    setIncludeManipulable(tpl.includeManipulable);
    if (tpl.handicapsInclus && tpl.handicapsInclus.length > 0) {
      setHandicapProfiles([...tpl.handicapsInclus]);
    }
    setReferenceFicheId(`tpl:${tpl.id}`);
    setTemplateNotice(
      `Modèle « ${tpl.nom} » chargé dans le formulaire : ajustez le titre/thème si besoin puis lancez la génération IA.`
    );
    setError(null);
    setSourceMode('theme');
  };

  const toggleHandicapProfile = (id: HandicapProfileId) => {
    setHandicapProfiles((prev) => {
      const exists = prev.includes(id);
      if (exists && prev.length <= 1) return prev;
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setTitre(p.titre);
    setTheme(p.theme);
    setCompetenceDeBase(p.competenceDeBase);
    if (isMathContext(p.matiere)) {
      setCbMath(
        normalizeCbMathCode(undefined, p.competenceDeBase, p.titre, p.theme)
      );
    }
    setMatiere(p.matiere);
    setNiveau(p.niveau);
    setDuree(p.duree);
    setContexteInclusif(p.contexteInclusif);
    setIncludeManipulable(p.includeManipulable);
    setError(null);
  };

  const handleLoadTextFile = async (file: File) => {
    setError(null);
    try {
      const parsed = await readAnyUploadedFile(file);
      if (parsed.textContent) {
        setSourceText(parsed.textContent);
        setSourceTextName(parsed.fileName);
      } else if (parsed.jsonFiches?.[0]) {
        const f = parsed.jsonFiches[0];
        setSourceText(`${f.titre}\n${f.theme}\n${f.deroulement.map((s) => `${s.etape}: ${s.activitesMaitre}`).join('\n')}`);
        setSourceTextName(parsed.fileName);
      } else {
        setError('Ce format doit être importé via l’onglet Import / Export ou Image.');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’extraire le texte de ce fichier.'
      );
    }
  };

  const handleLoadImageFile = async (file: File) => {
    setError(null);
    if (file.size > 8 * 1024 * 1024) {
      setError('L’image dépasse la limite de 8 Mo.');
      return;
    }
    try {
      const data = await readBlobAsBase64(file);
      const mimeType = file.type || 'image/png';
      setSourceImage({
        name: file.name,
        mimeType,
        data,
        previewUrl: `data:${mimeType};base64,${data}`,
      });
    } catch {
      setError('Impossible de charger l’image sélectionnée.');
    }
  };

  const handleCancelGenerate = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setElapsedSec(0);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceMode === 'theme' && (!titre.trim() || !theme.trim())) {
      setError('Veuillez renseigner un titre et un thème pour lancer la génération.');
      return;
    }
    if (sourceMode === 'texte' && !sourceText.trim()) {
      setError('Veuillez coller un texte ou charger un document (.txt / .docx).');
      return;
    }
    if (sourceMode === 'image' && !sourceImage?.data) {
      setError('Veuillez importer la photo ou capture d’un texte ou d’un manuel.');
      return;
    }

    setElapsedSec(0);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isOnline) {
        if (sourceMode === 'image') {
          throw new Error(
            'L’analyse d’une image nécessite une connexion internet active.'
          );
        }
        const fallbackTitle =
          titre.trim() ||
          sourceText.split(/\r?\n/).find((l) => l.trim())?.slice(0, 80) ||
          'Fiche APC depuis texte importé';
        const mathFormActive = isMathContext(matiere, selectedTemplateObj?.id);
        const offlineFiche = buildOfflineFiche({
          titre: fallbackTitle,
          theme: theme.trim() || sourceText.slice(0, 140) || 'Consolidation APC',
          competenceDeBase: competenceDeBase.trim(),
          cbCode: mathFormActive ? cbMath : undefined,
          disciplineId:
            selectedTemplateObj?.disciplineSpecifiqueId ||
            selectedTemplateObj?.id ||
            undefined,
          matiere,
          niveau,
          duree,
          includeManipulable,
          referenceFiche: selectedReferenceFiche,
          handicapProfiles,
        });
        onFicheGenerated(offlineFiche);
        return;
      }

      const mathFormActive = isMathContext(matiere, selectedTemplateObj?.id);
      const data = await postJson<{ fiche: FicheAPC }>(
        '/api/apc/generate',
        {
          titre: titre.trim(),
          theme: theme.trim(),
          competenceDeBase: competenceDeBase.trim(),
          cbCode: mathFormActive ? cbMath : undefined,
          disciplineId:
            selectedTemplateObj?.disciplineSpecifiqueId ||
            selectedTemplateObj?.id ||
            undefined,
          matiere,
          niveau,
          duree,
          contexteInclusif: contexteInclusif.trim(),
          includeManipulable,
          handicapProfiles,
          sourceText: sourceMode === 'texte' ? sourceText.trim() : '',
          sourceImage:
            sourceMode === 'image' && sourceImage
              ? { mimeType: sourceImage.mimeType, data: sourceImage.data }
              : null,
          referenceFiche: selectedReferenceFiche,
          quality,
          preferences,
        },
        controller.signal
      );

      onFicheGenerated(normalizeFiche(data.fiche));
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la génération.'
      );
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2 max-w-3xl">
        <p className="text-xs font-medium text-sky-700 tracking-wide">
          Génération 100% IA multi-sources &amp; clonage à l’identique
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight text-balance">
          Concevoir une fiche pédagogique APC complète
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Créez depuis un thème, un texte importé, l’image d’un manuel ou via le chatbot IA (recommandation écrite ou dictée vocale). Chaque fiche inclut les CB en en-tête, les sous-titres invariables des étapes, des indicateurs inclusifs et des Q&amp;R interactives.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {(
          [
            {
              id: 'theme',
              label: 'Par Thème & Titre',
              desc: 'Requête directe ou modèle',
              icon: Wand2,
            },
            {
              id: 'modeles',
              label: `Modèles (${MODELE_FICHES.length})`,
              desc: 'CM1 S9 & disciplines APC',
              icon: BookTemplate,
            },
            {
              id: 'texte',
              label: 'Texte importé',
              desc: 'Texte collé, .txt ou .docx',
              icon: FileText,
            },
            {
              id: 'image',
              label: 'Image d’un texte',
              desc: 'Photo de manuel ou page',
              icon: ImageIcon,
            },
            {
              id: 'chatbot',
              label: 'Chatbot IA (Écrit / Audio)',
              desc: 'Dialogue & dictée vocale',
              icon: Bot,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = sourceMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSourceMode(tab.id);
                setError(null);
              }}
              className={`p-3 rounded-lg border text-left transition-colors ${
                active
                  ? 'bg-sky-50 border-sky-500 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Icon
                  className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-500'}`}
                />
                <span>{tab.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {templateNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between gap-3">
          <span>{templateNotice}</span>
          <button
            type="button"
            onClick={() => setTemplateNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-sm text-amber-900">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Mode hors-ligne détecté : la création par thème, modèle ou texte utilisera le générateur local structuré sans connexion. L’analyse d’image et le chatbot audio requièrent internet.
          </span>
        </div>
      )}

      {sourceMode === 'modeles' ? (
        <TemplateLibraryPanel
          selectedTemplateId={selectedTemplateObj?.id || null}
          onSelectForForm={applyTemplateToForm}
          onCreateFromTemplate={(tpl) => onFicheGenerated(buildFicheFromTemplate(tpl))}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {sourceMode === 'chatbot' ? (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Assistant conversationnel APC (Écrit, Audio, Image &amp; Texte)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Dictez ou rédigez votre recommandation, joignez l’image d’un texte ou un extrait, puis sélectionnez un modèle à cloner à l’identique.
              </p>
            </div>
            <PedagogicalChatbot
              isOnline={isOnline}
              allFiches={fiches}
              referenceFiche={selectedReferenceFiche}
              preferences={preferences}
              quality={quality}
              onQualityChange={setQuality}
              defaultIntent="create_identical"
              onFicheCreated={onFicheGenerated}
              onLearnPreference={onLearnPreference}
            />
          </div>
        ) : (
          <form
            onSubmit={handleGenerate}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-6"
          >
            {sourceMode === 'theme' && (
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-slate-500">
                  Exemples rapides pour démarrer
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors text-left"
                    >
                      {p.matiere} · {p.niveau} — {p.titre.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sourceMode === 'texte' && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="gen-source-text"
                    className="text-sm font-medium text-slate-900"
                  >
                    Texte source à transformer en fiche APC
                  </label>
                  <div className="flex items-center gap-2">
                    <VoiceDictationButton
                      compact
                      isOnline={isOnline}
                      label="Dicter"
                      onError={setError}
                      onTranscript={(text) =>
                        setSourceText((prev) =>
                          prev.trim() ? `${prev.trim()} ${text}` : text
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => textFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Charger fichier (.docx, .txt, .csv, .html…)
                    </button>
                  </div>
                  <input
                    ref={textFileInputRef}
                    type="file"
                    accept={TEXT_FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLoadTextFile(f);
                      e.target.value = '';
                    }}
                  />
                </div>
                {sourceTextName && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Fichier chargé : {sourceTextName}
                  </p>
                )}
                <textarea
                  id="gen-source-text"
                  rows={5}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Collez ici un texte de lecture, une leçon, une fiche brute ou un énoncé d’exercice. L’IA en déduit le contenu APC complet..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {sourceMode === 'image' && (
              <div className="space-y-3">
                <span className="block text-sm font-medium text-slate-900">
                  Image d’un texte, d’un manuel ou d’une fiche papier
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLoadImageFile(f);
                    e.target.value = '';
                  }}
                />
                {sourceImage ? (
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate">
                        {sourceImage.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSourceImage(null)}
                        className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-medium"
                      >
                        <X className="w-3.5 h-3.5" />
                        Retirer
                      </button>
                    </div>
                    <div className="overflow-hidden rounded border border-slate-200 bg-white flex justify-center">
                      <Image
                        src={sourceImage.previewUrl}
                        alt={`Aperçu de ${sourceImage.name}`}
                        width={600}
                        height={340}
                        referrerPolicy="no-referrer"
                        className="max-h-56 w-auto object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50/70 rounded-lg p-6 text-center transition-colors space-y-2"
                  >
                    <ImageIcon className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-800">
                      Importer la photo ou capture d’un texte (.png, .jpg, .webp)
                    </p>
                    <p className="text-xs text-slate-500">
                      L’IA lit automatiquement le texte de l’image pour créer la fiche APC complète
                    </p>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label
                  htmlFor="gen-titre"
                  className="block text-sm font-medium text-slate-900 mb-1.5"
                >
                  Titre de la fiche / séance APC
                  {sourceMode !== 'theme' && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      (optionnel — déduit automatiquement si vide)
                    </span>
                  )}
                </label>
                <input
                  id="gen-titre"
                  type="text"
                  required={sourceMode === 'theme'}
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex : Additionner des fractions de même dénominateur"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="gen-theme"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Thème, notion ou objectif de la séance
                    {sourceMode !== 'theme' && (
                      <span className="text-xs font-normal text-slate-500 ml-1.5">
                        (optionnel)
                      </span>
                    )}
                  </label>
                  <VoiceDictationButton
                    compact
                    isOnline={isOnline}
                    label="Dicter objectif"
                    title="Dicter l’objectif ou le thème de la séance via l’API Web Speech"
                    onError={setError}
                    onTranscript={(text) =>
                      setTheme((prev) =>
                        prev.trim() ? `${prev.trim()} ${text}` : text
                      )
                    }
                  />
                </div>
                <input
                  id="gen-theme"
                  type="text"
                  required={sourceMode === 'theme'}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex : Nombres et calculs — Consolidation des fractions simples"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {isMathContext(matiere, selectedTemplateObj?.id) && (
                <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Compétence de Base Mathématiques (Schématisation 3 phases)
                    </span>
                    <span className="text-[11px] font-mono text-sky-700 font-semibold">
                      {cbMath} · {CB_MATH_CATALOG[cbMath].court}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-md">
                    {(['CB1', 'CB2', 'CB3'] as CbMathType[]).map((code) => {
                      const active = cbMath === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCbMath(code);
                            if (!competenceDeBase.trim() || /^CB[123]\b/i.test(competenceDeBase.trim())) {
                              setCompetenceDeBase(
                                `${code} (Mathématiques ${niveau}) — ${CB_MATH_CATALOG[code].court}`
                              );
                            }
                          }}
                          className={`py-2 px-2.5 rounded text-left transition-colors ${
                            active
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold text-sky-700">
                            {code}
                          </div>
                          <div className="text-[11px] truncate">
                            {CB_MATH_CATALOG[code].court}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Génère automatiquement la schématisation IA concrète en 3 phases (Manipulation collective, en petits groupes et individuelle) selon la situation-problème et le titre de la leçon.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="gen-cb"
                  className="block text-sm font-medium text-slate-900 mb-1.5"
                >
                  CB (Compétence de Base — En-tête de la fiche)
                </label>
                <input
                  id="gen-cb"
                  type="text"
                  value={competenceDeBase}
                  onChange={(e) => setCompetenceDeBase(e.target.value)}
                  placeholder="Ex : CB1 — Résoudre des situations concrètes mobilisant la notion travaillée (auto-générée si vide)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="gen-matiere"
                    className="block text-sm font-medium text-slate-900 mb-1.5"
                  >
                    Matière
                  </label>
                  <select
                    id="gen-matiere"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value as MatiereType)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {MATIERES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gen-niveau"
                    className="block text-sm font-medium text-slate-900 mb-1.5"
                  >
                    Niveau scolaire
                  </label>
                  <select
                    id="gen-niveau"
                    value={niveau}
                    onChange={(e) => setNiveau(e.target.value as NiveauType)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {NIVEAUX.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gen-duree"
                    className="block text-sm font-medium text-slate-900 mb-1.5"
                  >
                    Durée prévue
                  </label>
                  <select
                    id="gen-duree"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="30 min">30 min</option>
                    <option value="40 min">40 min</option>
                    <option value="45 min">45 min</option>
                    <option value="50 min">50 min</option>
                    <option value="60 min">60 min</option>
                  </select>
                </div>
              </div>

              {/* Identical Clone + AI Intelligence Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label
                    htmlFor="gen-ref-fiche"
                    className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-600" />
                    Créer à l’identique d’un modèle (optionnel)
                  </label>
                  <select
                    id="gen-ref-fiche"
                    value={referenceFicheId}
                    onChange={(e) => setReferenceFicheId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Structure APC standard (auto)</option>
                    <optgroup label={`Modèles disciplinaires (${MODELE_FICHES.length})`}>
                      {MODELE_FICHES.map((tpl) => (
                        <option key={tpl.id} value={`tpl:${tpl.id}`}>
                          {tpl.nom} ({tpl.niveauParDefaut})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Fiches enregistrées">
                      {fiches.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.matiere} ({f.niveau}) — {f.titre.slice(0, 42)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gen-quality"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Niveau de raisonnement IA
                  </label>
                  <select
                    id="gen-quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as ReasoningQuality)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="rapide">Rapide (Faible latence)</option>
                    <option value="equilibre">Équilibré (Recommandé)</option>
                    <option value="expert">Expert Approfondi (Raisonnement max)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="gen-contexte"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Observations, objectifs complémentaires ou besoins spécifiques (optionnel)
                  </label>
                  <VoiceDictationButton
                    compact
                    isOnline={isOnline}
                    label="Dicter observation / objectif"
                    title="Dicter rapidement vos observations ou objectifs via l’API Web Speech"
                    onError={setError}
                    onTranscript={(text) =>
                      setContexteInclusif((prev) =>
                        prev.trim() ? `${prev.trim()} ${text}` : text
                      )
                    }
                  />
                </div>
                <textarea
                  id="gen-contexte"
                  rows={2}
                  value={contexteInclusif}
                  onChange={(e) => setContexteInclusif(e.target.value)}
                  placeholder="Ex : Groupe hétérogène de 5 élèves avec 1 élève dyslexique, privilégier l’étayage visuel et des Q&R interactives."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeManipulable}
                  onChange={(e) => setIncludeManipulable(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                    Inclure un objet manipulable interactif
                  </span>
                  <p className="text-xs text-slate-600">
                    Génère un simulateur manipulable en direct (fractions, balance, géométrie, droite graduée ou proportionnalité) adapté au sujet.
                  </p>
                </div>
              </label>

              <div className="p-3.5 bg-sky-50/40 border border-sky-200 rounded-md space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-sky-700" />
                    Inclusion des enfants en situation de handicap (Qualité Haute Gamme)
                  </span>
                  <span className="text-[11px] font-mono text-sky-700">
                    {handicapProfiles.length}/{HANDICAP_PROFILES.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HANDICAP_PROFILES.map((profile) => {
                    const checked = handicapProfiles.includes(profile.id);
                    return (
                      <label
                        key={profile.id}
                        title={profile.description}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-white border-sky-500 text-slate-900 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleHandicapProfile(profile.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="truncate">{profile.nom}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {loading ? (
                <span className="text-xs text-slate-600">
                  {loadingStage}{' '}
                  <span className="font-mono tabular-nums text-slate-400">
                    ({elapsedSec}s)
                  </span>
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                {loading && (
                  <button
                    type="button"
                    onClick={handleCancelGenerate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Structuration IA en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      {selectedReferenceFiche
                        ? 'Générer une fiche identique'
                        : isOnline
                        ? 'Générer la fiche complète'
                        : 'Créer la fiche hors-ligne'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Architecture Checklist */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Structure garantie de la fiche générée
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Chaque fiche produite respecte rigoureusement le référentiel APC et reste 100% modifiable après génération.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-700">
            {[
              'En-tête avec CB (Compétence de Base), compétence visée, objectifs mesurables, prérequis et matériel.',
              'Tableau à 4 colonnes avec intitulés d’étapes et sous-titres pédagogiques invariables verrouillables.',
              'En Mathématiques (CB1, CB2, CB3) : schématisation IA en 3 phases de manipulation (collective, petits groupes, individuelle) avec données concrètes.',
              'Activités du maître, Activités de l’élève et Indicateurs pédagogiques inclusifs interactifs (cochables en séance).',
              'Questions-réponses interactives graduées (Fondamental, Approfondissement, Défi) avec indices d’étayage et suivi élève.',
              'Clonage à l’identique depuis un modèle existant, un texte importé, une image ou une dictée vocale.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          {preferences.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h3 className="text-xs font-semibold text-slate-900">
                Préférences apprises appliquées ({preferences.length})
              </h3>
              <ul className="space-y-1.5">
                {preferences.slice(0, 4).map((p) => (
                  <li key={p.id} className="text-xs text-slate-600 leading-relaxed">
                    · {p.regle}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
