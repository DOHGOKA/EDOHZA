'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  ChatbotMessage,
  FicheAPC,
  PreferenceApprentissage,
  ReasoningQuality,
} from '@/lib/types';
import { createUid } from '@/lib/utils';
import {
  getPreferredAudioMimeType,
  postJson,
  readBlobAsBase64,
} from '@/lib/api-client';
import { normalizeFiche } from '@/lib/storage';
import { readAnyUploadedFile, TEXT_FILE_ACCEPT } from '@/lib/file-reader';

interface PedagogicalChatbotProps {
  isOnline: boolean;
  activeFiche?: FicheAPC | null;
  referenceFiche?: FicheAPC | null;
  allFiches?: FicheAPC[];
  preferences: PreferenceApprentissage[];
  quality: ReasoningQuality;
  onQualityChange: (q: ReasoningQuality) => void;
  defaultIntent?: 'auto' | 'create_identical' | 'update_active';
  onFicheCreated: (fiche: FicheAPC) => void;
  onFicheUpdated?: (fiche: FicheAPC) => void;
  onLearnPreference?: (regle: string, source: string) => void;
  compact?: boolean;
}

export default function PedagogicalChatbot({
  isOnline,
  activeFiche = null,
  referenceFiche = null,
  allFiches = [],
  preferences,
  quality,
  onQualityChange,
  defaultIntent = 'auto',
  onFicheCreated,
  onFicheUpdated,
  onLearnPreference,
  compact = false,
}: PedagogicalChatbotProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: 'chat-welcome',
      role: 'assistant',
      content:
        'Bonjour ! Décrivez votre séance par écrit ou par message vocal, importez un texte ou une photo de manuel : je crée une fiche APC complète (identique au modèle choisi) ou je retouche la fiche active.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [intent, setIntent] = useState<'auto' | 'create_identical' | 'update_active'>(
    defaultIntent
  );
  const [selectedRefId, setSelectedRefId] = useState<string>(
    referenceFiche?.id || ''
  );
  const [attachedText, setAttachedText] = useState('');
  const [attachedTextName, setAttachedTextName] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{
    name: string;
    mimeType: string;
    data: string;
    previewUrl: string;
  } | null>(null);

  const [sending, setSending] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setRecordingSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sending]);

  useEffect(() => {
    return () => {
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

  const resolvedRefFiche =
    allFiches.find((f) => f.id === selectedRefId) || referenceFiche || null;

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setTranscribing(true);
    setError(null);
    try {
      const audioBase64 = await readBlobAsBase64(blob);
      const data = await postJson<{ transcript?: string }>('/api/apc/transcribe', {
        audioBase64,
        mimeType,
      });
      const transcript = data.transcript?.trim() || '';
      if (transcript) {
        setInputText((prev) =>
          prev.trim() ? `${prev.trim()} ${transcript}` : transcript
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de transcrire l’enregistrement vocal.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    if (!isOnline) {
      setError('La transcription audio nécessite une connexion internet active.');
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Votre navigateur ne prend pas en charge le microphone. Importez un fichier audio.');
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
        if (blob.size > 0) {
          await transcribeAudioBlob(blob, resolvedMime);
        }
      };

      setRecordingSec(0);
      setIsRecording(true);
      recorder.start();
    } catch {
      setError(
        'Accès au microphone refusé ou indisponible. Vous pouvez importer un fichier audio ou écrire votre demande.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSec(0);
  };

  const handleImagePick = async (file: File) => {
    setError(null);
    if (file.size > 8 * 1024 * 1024) {
      setError('L’image dépasse 8 Mo.');
      return;
    }
    try {
      const base64 = await readBlobAsBase64(file);
      const previewUrl = `data:${file.type || 'image/png'};base64,${base64}`;
      setAttachedImage({
        name: file.name,
        mimeType: file.type || 'image/png',
        data: base64,
        previewUrl,
      });
    } catch {
      setError('Impossible de charger cette image.');
    }
  };

  const handleTextFilePick = async (file: File) => {
    setError(null);
    try {
      const parsed = await readAnyUploadedFile(file);
      if (parsed.textContent) {
        setAttachedText(parsed.textContent);
        setAttachedTextName(parsed.fileName);
        setShowTextBox(true);
      } else {
        setError('Veuillez choisir un document texte (.docx, .txt, .md, .csv, .html, .rtf).');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de lire le document texte sélectionné.'
      );
    }
  };

  const handleAudioFilePick = async (file: File) => {
    if (!isOnline) {
      setError('La transcription audio nécessite une connexion internet.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Le fichier audio dépasse 15 Mo.');
      return;
    }
    await transcribeAudioBlob(file, file.type || 'audio/mp3');
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isOnline) {
      setError('Le chatbot IA nécessite une connexion internet active.');
      return;
    }
    if (!inputText.trim() && !attachedText.trim() && !attachedImage) {
      return;
    }

    setError(null);
    const userMsg: ChatbotMessage = {
      id: createUid('msg'),
      role: 'user',
      content:
        inputText.trim() ||
        'Crée une fiche pédagogique APC structurée à partir de la pièce jointe.',
      attachment: attachedImage
        ? { type: 'image', name: attachedImage.name }
        : attachedText.trim()
        ? {
            type: 'text',
            name: attachedTextName || 'Texte collé',
            previewText: attachedText.slice(0, 90),
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setSending(true);

    const payloadMessage = userMsg.content;
    const payloadText = attachedText;
    const payloadImage = attachedImage
      ? { mimeType: attachedImage.mimeType, data: attachedImage.data }
      : null;

    setInputText('');
    setAttachedText('');
    setAttachedTextName('');
    setAttachedImage(null);
    setShowTextBox(false);

    try {
      const data = await postJson<{
        actionType: 'create_fiche' | 'update_fiche' | 'none';
        fiche?: FicheAPC;
        reply?: string;
        regleApprentissage?: string;
      }>('/api/apc/chatbot', {
        message: payloadMessage,
        history: nextHistory
          .filter((m) => m.id !== 'chat-welcome')
          .map((m) => ({ role: m.role, content: m.content })),
        activeFiche,
        referenceFiche: resolvedRefFiche,
        intent,
        sourceText: payloadText,
        sourceImage: payloadImage,
        quality,
        preferences,
        handicapProfiles:
          activeFiche?.handicapsInclus ||
          resolvedRefFiche?.handicapsInclus ||
          undefined,
      });

      if (data.actionType === 'create_fiche' && data.fiche) {
        onFicheCreated(normalizeFiche(data.fiche));
      } else if (data.actionType === 'update_fiche' && data.fiche && onFicheUpdated) {
        onFicheUpdated(normalizeFiche(data.fiche));
      }

      if (data.regleApprentissage && data.regleApprentissage.trim().length > 8 && onLearnPreference) {
        onLearnPreference(
          data.regleApprentissage.trim(),
          'Recommandation Chatbot APC'
        );
      }

      const botMsg: ChatbotMessage = {
        id: createUid('msg'),
        role: 'assistant',
        content: data.reply || 'C’est fait.',
        actionType: data.actionType,
        ficheTitle: data.fiche?.titre,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la réponse du chatbot.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[11px] font-medium text-slate-500 mb-1">
            Action du chatbot
          </span>
          <select
            value={intent}
            onChange={(e) =>
              setIntent(e.target.value as 'auto' | 'create_identical' | 'update_active')
            }
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="auto">Automatique (conseil, retouche ou création)</option>
            <option value="create_identical">Créer une fiche identique au modèle</option>
            {activeFiche && (
              <option value="update_active">Retoucher la fiche active</option>
            )}
          </select>
        </label>

        <label className="block">
          <span className="block text-[11px] font-medium text-slate-500 mb-1">
            Niveau d’intelligence IA
          </span>
          <select
            value={quality}
            onChange={(e) => onQualityChange(e.target.value as ReasoningQuality)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="rapide">Rapide (Faible latence)</option>
            <option value="equilibre">Équilibré (Recommandé)</option>
            <option value="expert">Expert Approfondi (Raisonnement max)</option>
          </select>
        </label>
      </div>

      {allFiches.length > 0 && intent !== 'update_active' && (
        <label className="block">
          <span className="block text-[11px] font-medium text-slate-500 mb-1">
            Modèle de référence à cloner (nouvelle fiche)
          </span>
          <select
            value={selectedRefId}
            onChange={(e) => setSelectedRefId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Structure APC automatique selon la matière demandée</option>
            {allFiches.map((f) => (
              <option key={f.id} value={f.id}>
                {f.matiere} ({f.niveau}) — {f.titre.slice(0, 46)}
              </option>
            ))}
          </select>
        </label>
      )}

      {intent === 'update_active' && activeFiche && (
        <p className="text-[11px] text-sky-800 bg-sky-50 border border-sky-200 rounded px-2.5 py-1.5">
          Cible active : <strong>{activeFiche.titre}</strong> ({activeFiche.matiere} · {activeFiche.niveau})
        </p>
      )}

      {/* Conversation Feed */}
      <div
        className={`border border-slate-200 rounded-md bg-slate-50/70 p-3 space-y-3 overflow-y-auto ${
          compact ? 'max-h-64' : 'max-h-96'
        }`}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.role === 'user' ? 'flex-row-reverse text-right' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-sky-600 text-white'
              }`}
            >
              {m.role === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed space-y-1.5 ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
              {m.attachment && (
                <p className="text-[11px] opacity-80 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {m.attachment.name}
                </p>
              )}
              {m.actionType && m.actionType !== 'none' && m.ficheTitle && (
                <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  {m.actionType === 'create_fiche'
                    ? `Nouvelle fiche créée : « ${m.ficheTitle} »`
                    : `Fiche mise à jour : « ${m.ficheTitle} »`}
                </p>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            <span>Traitement pédagogique IA en cours…</span>
          </div>
        )}
        <div ref={feedEndRef} />
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Attachments Previews */}
      {attachedImage && (
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate font-medium text-slate-700">
              Image : {attachedImage.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            aria-label="Retirer l’image jointe"
            className="p-1 text-slate-400 hover:text-rose-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showTextBox && (
        <div className="space-y-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span>
              Texte importé {attachedTextName ? `(${attachedTextName})` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowTextBox(false);
                setAttachedText('');
                setAttachedTextName('');
              }}
              className="text-slate-500 hover:text-rose-600"
            >
              Retirer
            </button>
          </div>
          <textarea
            rows={3}
            value={attachedText}
            onChange={(e) => setAttachedText(e.target.value)}
            placeholder="Collez ici un texte, une leçon ou un exercice à transformer en fiche APC..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      )}

      {/* Hidden Media Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImagePick(f);
          e.target.value = '';
        }}
      />
      <input
        ref={textFileInputRef}
        type="file"
        accept={TEXT_FILE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleTextFilePick(f);
          e.target.value = '';
        }}
      />
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleAudioFilePick(f);
          e.target.value = '';
        }}
      />

      {/* Composer */}
      <form onSubmit={sendMessage} className="space-y-2">
        <textarea
          rows={compact ? 2 : 3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Écrivez ou dictez une recommandation (Ctrl+Entrée pour envoyer)…"
          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribing || !isOnline}
              title={isRecording ? 'Arrêter la dictée vocale' : 'Dicter au microphone'}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              } disabled:opacity-50`}
            >
              {transcribing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transcription…
                </>
              ) : isRecording ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="tabular-nums">Stop ({recordingSec}s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-600" />
                  Audio
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              disabled={transcribing || !isOnline}
              title="Importer un fichier audio (.mp3, .wav, .m4a)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded whitespace-nowrap"
            >
              <Paperclip className="w-3.5 h-3.5" />
              Fichier audio
            </button>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Joindre l’image d’un texte ou manuel"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded whitespace-nowrap"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              Image texte
            </button>

            <button
              type="button"
              onClick={() => setShowTextBox((v) => !v)}
              title="Coller ou importer un texte"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              Texte
            </button>

            <button
              type="button"
              onClick={() => textFileInputRef.current?.click()}
              title="Charger un fichier .txt ou .docx"
              className="px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 underline"
            >
              .txt/.docx
            </button>
          </div>

          <button
            type="submit"
            disabled={
              sending ||
              !isOnline ||
              (!inputText.trim() && !attachedText.trim() && !attachedImage)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
