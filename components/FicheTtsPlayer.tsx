'use client';

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { FicheAPC } from '@/lib/types';
import { buildFicheTtsSegments, splitSpeechChunks } from '@/lib/tts';

interface FicheTtsPlayerProps {
  fiche: FicheAPC;
  onClose?: () => void;
  autoStart?: boolean;
}

const emptySubscribe = () => () => {};

function useSpeechSynthesisSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    () => false
  );
}

export default function FicheTtsPlayer({
  fiche,
  onClose,
  autoStart = false,
}: FicheTtsPlayerProps) {
  const supported = useSpeechSynthesisSupported();
  const segments = useMemo(() => buildFicheTtsSegments(fiche), [fiche]);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [segmentIndex, setSegmentIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);

  const sessionTokenRef = useRef<number>(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const rateRef = useRef<number>(rate);
  const selectedVoiceUriRef = useRef<string>(selectedVoiceUri);
  const segmentsRef = useRef(segments);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    selectedVoiceUriRef.current = selectedVoiceUri;
  }, [selectedVoiceUri]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices() || [];
      const french = all.filter((v) => v.lang.toLowerCase().startsWith('fr'));
      const list = french.length > 0 ? french : all;
      voicesRef.current = list;
      setVoices(list);
      setSelectedVoiceUri((prev) => {
        if (prev && list.some((v) => v.voiceURI === prev)) return prev;
        const preferred =
          list.find((v) => v.lang.toLowerCase() === 'fr-fr') || list[0];
        return preferred?.voiceURI || '';
      });
    };

    queueMicrotask(loadVoices);
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [supported]);

  const stopPlayback = () => {
    sessionTokenRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
  };

  const speakFromSegment = React.useCallback(
    (startIdx: number) => {
      if (!supported) {
        setTtsError(
          'La synthèse vocale n’est pas prise en charge par ce navigateur.'
        );
        return;
      }
      const list = segmentsRef.current;
      if (list.length === 0) return;

      const safeIdx = Math.max(0, Math.min(startIdx, list.length - 1));
      const token = ++sessionTokenRef.current;

      window.speechSynthesis.cancel();
      setTtsError(null);
      setSegmentIndex(safeIdx);
      setStatus('playing');

      const playSegment = (idx: number) => {
        if (token !== sessionTokenRef.current) return;
        const seg = segmentsRef.current[idx];
        if (!seg) {
          setStatus('idle');
          setSegmentIndex(0);
          return;
        }

        setSegmentIndex(idx);
        const chunks = splitSpeechChunks(seg.text, 210);
        if (chunks.length === 0) {
          playSegment(idx + 1);
          return;
        }

        const playChunk = (cIdx: number) => {
          if (token !== sessionTokenRef.current) return;
          if (cIdx >= chunks.length) {
            playSegment(idx + 1);
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[cIdx]);
          utterance.lang = 'fr-FR';
          utterance.rate = rateRef.current;
          const chosenVoice = voicesRef.current.find(
            (v) => v.voiceURI === selectedVoiceUriRef.current
          );
          if (chosenVoice) {
            utterance.voice = chosenVoice;
          }

          utterance.onend = () => {
            if (token !== sessionTokenRef.current) return;
            playChunk(cIdx + 1);
          };

          utterance.onerror = (ev) => {
            if (token !== sessionTokenRef.current) return;
            if (ev.error === 'interrupted' || ev.error === 'canceled') return;
            setTtsError('Lecture vocale interrompue par le navigateur.');
            setStatus('idle');
          };

          window.speechSynthesis.speak(utterance);
        };

        playChunk(0);
      };

      playSegment(safeIdx);
    },
    [supported]
  );

  const didAutoStartRef = useRef(false);
  useEffect(() => {
    if (autoStart && supported && !didAutoStartRef.current) {
      didAutoStartRef.current = true;
      const timer = window.setTimeout(() => {
        speakFromSegment(0);
      }, 60);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [autoStart, supported, speakFromSegment]);

  useEffect(() => {
    return () => {
      sessionTokenRef.current += 1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlayPause = () => {
    if (!supported) return;
    if (status === 'playing') {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setStatus('paused');
      } else {
        stopPlayback();
      }
      return;
    }

    if (status === 'paused') {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setStatus('playing');
      } else {
        speakFromSegment(segmentIndex);
      }
      return;
    }

    speakFromSegment(segmentIndex);
  };

  const handleJumpToSegment = (idx: number) => {
    setSegmentIndex(idx);
    if (status === 'playing' || status === 'paused') {
      speakFromSegment(idx);
    }
  };

  const activeSegment = segments[segmentIndex] || segments[0];
  const progressPct =
    segments.length > 0
      ? Math.round(((segmentIndex + 1) / segments.length) * 100)
      : 0;

  return (
    <div
      role="region"
      aria-label="Lecteur vocal de relecture de la fiche APC"
      className="no-print bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <span>Lecture vocale de relecture</span>
              <span className="font-mono tabular-nums text-[11px] font-medium text-slate-500">
                {segmentIndex + 1} / {segments.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {activeSegment?.label || 'Prêt pour la lecture'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={!supported || segmentIndex <= 0}
            onClick={() => speakFromSegment(segmentIndex - 1)}
            title="Section précédente"
            aria-label="Section précédente"
            className="p-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded disabled:opacity-40 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!supported || segments.length === 0}
            onClick={handleTogglePlayPause}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
          >
            {status === 'playing' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            ) : status === 'paused' ? (
              <>
                <Play className="w-3.5 h-3.5" />
                Reprendre
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Lire la fiche
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!supported || status === 'idle'}
            onClick={stopPlayback}
            title="Arrêter la lecture"
            aria-label="Arrêter la lecture"
            className="p-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded disabled:opacity-40 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!supported || segmentIndex >= segments.length - 1}
            onClick={() => speakFromSegment(segmentIndex + 1)}
            title="Section suivante"
            aria-label="Section suivante"
            className="p-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                stopPlayback();
                onClose();
              }}
              aria-label="Fermer le lecteur vocal"
              title="Fermer le lecteur vocal"
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Controls: Section jump, Speed, Voice */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-slate-100">
        <label className="sm:col-span-6 block">
          <span className="sr-only">Section à lire</span>
          <select
            aria-label="Choisir la section de la fiche à lire"
            value={segmentIndex}
            onChange={(e) => handleJumpToSegment(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {segments.map((seg, idx) => (
              <option key={seg.id} value={idx}>
                {idx + 1}. {seg.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2 block">
          <span className="sr-only">Vitesse de lecture</span>
          <select
            aria-label="Vitesse de lecture vocale"
            value={rate}
            onChange={(e) => {
              const nextRate = Number(e.target.value);
              setRate(nextRate);
              rateRef.current = nextRate;
              if (status === 'playing') {
                speakFromSegment(segmentIndex);
              }
            }}
            className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={0.85}>0.85×</option>
            <option value={1}>1.0×</option>
            <option value={1.15}>1.15×</option>
            <option value={1.3}>1.3×</option>
          </select>
        </label>

        <label className="sm:col-span-4 block">
          <span className="sr-only">Voix française</span>
          <select
            aria-label="Voix de synthèse"
            value={selectedVoiceUri}
            onChange={(e) => {
              const uri = e.target.value;
              setSelectedVoiceUri(uri);
              selectedVoiceUriRef.current = uri;
              if (status === 'playing') {
                speakFromSegment(segmentIndex);
              }
            }}
            disabled={voices.length === 0}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
          >
            {voices.length === 0 ? (
              <option value="">Voix par défaut (fr-FR)</option>
            ) : (
              voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {/* Hairline Progress Bar */}
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-600 transition-all duration-200"
          style={{ width: `${status === 'idle' ? 0 : progressPct}%` }}
        />
      </div>

      {!supported && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
          La synthèse vocale Web Speech n’est pas disponible dans ce navigateur.
        </p>
      )}

      {ttsError && (
        <p className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded px-2.5 py-1.5">
          {ttsError}
        </p>
      )}
    </div>
  );
}
