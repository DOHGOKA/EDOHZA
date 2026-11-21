import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  GEMINI_TRANSCRIBE_MODEL,
  callGeminiWithRetry,
  parseRequestJson,
  validateBase64Payload,
  getHttpStatusFromError,
} from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson(req);
    const { audioBase64 = '', mimeType = 'audio/webm' } = body as {
      audioBase64?: string;
      mimeType?: string;
    };

    if (!audioBase64) {
      return NextResponse.json(
        { error: 'Données audio manquantes pour la transcription.' },
        { status: 400 }
      );
    }

    validateBase64Payload(audioBase64, 16 * 1024 * 1024, 'Le fichier audio');

    const ai = getGeminiClient();

    const response = await callGeminiWithRetry(ai, {
      model: GEMINI_TRANSCRIBE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: 'Transcris fidèlement en français cet enregistrement vocal pédagogique d’un enseignant (sans commentaire ajouté).',
          },
        ],
      },
    });

    const transcript = (response.text || '').trim();
    if (!transcript) {
      return NextResponse.json(
        { error: 'Aucun texte détecté dans l’enregistrement audio.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la transcription audio.';
    return NextResponse.json(
      { error: message },
      { status: getHttpStatusFromError(err) }
    );
  }
}
