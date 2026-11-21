'use client';

export async function postJson<T = Record<string, any>>(
  url: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new Error(
      'Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.'
    );
  }

  const rawText = await res.text();
  let parsed: (T & { error?: string }) | null = null;
  if (rawText.trim()) {
    try {
      parsed = JSON.parse(rawText) as T & { error?: string };
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    if (parsed?.error) {
      throw new Error(parsed.error);
    }
    if (res.status === 413) {
      throw new Error(
        'Le document ou média envoyé est trop volumineux pour le serveur.'
      );
    }
    if (res.status === 429) {
      throw new Error(
        'Trop de requêtes simultanées. Patientez quelques secondes avant de réessayer.'
      );
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        'Le service IA est momentanément indisponible ou a expiré. Veuillez réessayer.'
      );
    }
    throw new Error(`Erreur serveur (${res.status}). Veuillez réessayer.`);
  }

  if (!parsed) {
    throw new Error('Réponse serveur invalide ou vide.');
  }

  return parsed;
}

export function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () =>
      reject(new Error('Impossible de lire les données du fichier.'));
    reader.readAsDataURL(blob);
  });
}

export function getPreferredAudioMimeType(): string | undefined {
  if (
    typeof MediaRecorder === 'undefined' ||
    typeof MediaRecorder.isTypeSupported !== 'function'
  ) {
    return undefined;
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}
