'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';
import {
  getPreferredAudioMimeType,
  postJson,
  readBlobAsBase64,
} from '@/lib/api-client';

interface WebSpeechAlternative {
  transcript: string;
  confidence: number;
}

interface WebSpeechResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: WebSpeechAlternative;
}

interface WebSpeechResultList {
  readonly length: number;
  [index: number]: WebSpeechResult;
}

interface WebSpeechEvent extends Event {
  readonly resultIndex: number;
  readonly results: WebSpeechResultList;
}

interface WebSpeechErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: WebSpeechEvent) => void) | null;
  onerror: ((event: WebSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type WebSpeechConstructor = new () => WebSpeechRecognition;

function getSpeechRecognitionConstructor(): WebSpeechConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: WebSpeechConstructor;
    webkitSpeechRecognition?: WebSpeechConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

const emptySubscribe = () => () => {};

function useWebSpeechSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => getSpeechRecognitionConstructor() !== null,
    () => false
  );
}

interface VoiceDictationButtonProps {
  isOnline?: boolean;
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
  label?: string;
  lang?: string;
  compact?: boolean;
  className?: string;
  title?: string;
  engine?: 'auto' | 'webspeech' | 'audio';
}

function formatSpeechError(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Accès au microphone refusé. Autorisez le micro dans les réglages du navigateur.';
    case 'audio-capture':
      return 'Aucun microphone détecté sur cet appareil.';
    case 'no-speech':
      return 'Aucune voix détectée. Rapprochez-vous du microphone et réessayez.';
    case 'network':
      return 'La reconnaissance vocale réseau nécessite une connexion active.';
    default:
      return 'Erreur de reconnaissance vocale Web Speech.';
  }
}

export default function VoiceDictationButton({
  isOnline = true,
  onTranscript,
  onError,
  label = 'Dicter (Web Speech)',
  lang = 'fr-FR',
  compact = false,
  className = '',
  title,
  engine = 'auto',
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'webspeech' | 'audio' | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const manualStopRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isListening) return;
    const id = window.setInterval(() => {
      setRecordingSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isListening]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore abort errors on unmount
      }
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore recorder stop errors on unmount
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const reportError = (msg: string) => {
    if (onErrorRef.current) {
      onErrorRef.current(msg);
    } else {
      setLocalError(msg);
    }
  };

  const transcribeBlob = async (blob: Blob, mimeType: string) => {
    setTranscribing(true);
    setLocalError(null);
    try {
      const audioBase64 = await readBlobAsBase64(blob);
      const data = await postJson<{ transcript?: string }>('/api/apc/transcribe', {
        audioBase64,
        mimeType,
      });
      if (data.transcript && typeof data.transcript === 'string') {
        const cleaned = data.transcript.trim();
        if (cleaned) onTranscriptRef.current(cleaned);
      }
    } catch (err: unknown) {
      reportError(
        err instanceof Error
          ? err.message
          : 'Impossible de transcrire la dictée vocale.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const startAudioFallback = async () => {
    if (!isOnline) {
      reportError('La transcription audio nécessite une connexion internet active.');
      return;
    }
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      reportError(
        'Le microphone et l’API Web Speech ne sont pas disponibles dans ce navigateur.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredMime = getPreferredAudioMimeType();
      const recorder = new MediaRecorder(
        stream,
        preferredMime ? { mimeType: preferredMime } : undefined
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const resolvedMime = recorder.mimeType || preferredMime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: resolvedMime });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setActiveEngine(null);
        if (blob.size > 0) {
          await transcribeBlob(blob, resolvedMime);
        }
      };

      setRecordingSec(0);
      setActiveEngine('audio');
      setIsListening(true);
      recorder.start();
    } catch {
      reportError(
        'Accès au microphone refusé ou indisponible. Vérifiez les permissions du navigateur.'
      );
    }
  };

  const startWebSpeech = () => {
    const SpeechRecCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecCtor) {
      if (engine === 'webspeech') {
        reportError(
          'L’API Web Speech (SpeechRecognition) n’est pas prise en charge par ce navigateur.'
        );
        return;
      }
      void startAudioFallback();
      return;
    }

    try {
      const recognition = new SpeechRecCtor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      manualStopRef.current = false;

      recognition.onstart = () => {
        setRecordingSec(0);
        setInterimText('');
        setActiveEngine('webspeech');
        setIsListening(true);
      };

      recognition.onresult = (event: WebSpeechEvent) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalChunk += `${text} `;
          } else {
            interimChunk += text;
          }
        }

        setInterimText(interimChunk.trim());
        const cleanedFinal = finalChunk.trim();
        if (cleanedFinal) {
          onTranscriptRef.current(cleanedFinal);
        }
      };

      recognition.onerror = (event: WebSpeechErrorEvent) => {
        if (event.error === 'aborted' && manualStopRef.current) {
          return;
        }
        if (event.error === 'network' && engine === 'auto' && isOnline) {
          try {
            recognition.abort();
          } catch {
            // ignore
          }
          setIsListening(false);
          setInterimText('');
          setActiveEngine(null);
          void startAudioFallback();
          return;
        }
        reportError(formatSpeechError(event.error));
        setIsListening(false);
        setInterimText('');
        setActiveEngine(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        setActiveEngine(null);
        setRecordingSec(0);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      if (engine === 'auto' && isOnline) {
        void startAudioFallback();
      } else {
        reportError('Impossible de démarrer la saisie vocale Web Speech.');
      }
    }
  };

  const startListening = () => {
    setLocalError(null);
    if (engine === 'audio') {
      void startAudioFallback();
    } else {
      startWebSpeech();
    }
  };

  const stopListening = () => {
    manualStopRef.current = true;
    if (activeEngine === 'webspeech' && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      setIsListening(false);
      setInterimText('');
      setActiveEngine(null);
      setRecordingSec(0);
      return;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setRecordingSec(0);
  };

  const webSpeechSupported = useWebSpeechSupported();
  const isDisabled =
    transcribing || (engine === 'audio' && !isOnline) || (!webSpeechSupported && !isOnline);

  return (
    <div className={`inline-flex flex-col items-end ${className}`}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={isDisabled}
        title={
          title ||
          (isListening
            ? 'Arrêter la dictée vocale'
            : webSpeechSupported
            ? 'Saisie vocale instantanée via l’API Web Speech (fr-FR)'
            : 'Dicter au microphone')
        }
        className={`inline-flex items-center gap-1.5 font-medium rounded border transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        } ${
          isListening
            ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
      >
        {transcribing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            <span>Transcription…</span>
          </>
        ) : isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {activeEngine === 'webspeech'
                ? `Écoute (${recordingSec}s) · Arrêter`
                : `Arrêter (${recordingSec}s)`}
            </span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-sky-600" />
            <span>{label}</span>
          </>
        )}
      </button>
      {isListening && interimText && (
        <span className="text-[11px] italic text-sky-700 mt-1 text-right max-w-xs truncate">
          {interimText}…
        </span>
      )}
      {!onError && localError && (
        <span className="text-[11px] text-rose-700 mt-1 text-right max-w-xs">
          {localError}
        </span>
      )}
    </div>
  );
}
