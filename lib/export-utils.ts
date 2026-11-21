import { sanitizeSvg } from './svg-sanitize';

export function slugifyFilename(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'fiche-apc'
  );
}

export async function svgToPngDataUrl(
  svgCode: string,
  width = 1280,
  height = 560
): Promise<string | null> {
  if (typeof window === 'undefined' || !svgCode) return null;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: string | null) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timer = window.setTimeout(() => finish(null), 3000);

    try {
      let normalizedSvg = sanitizeSvg(svgCode).trim();
      if (!normalizedSvg.includes('xmlns=')) {
        normalizedSvg = normalizedSvg.replace(
          '<svg',
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      // Extract viewBox dimensions so browsers always know intrinsic SVG dimensions
      const vbMatch = normalizedSvg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
      let vbW = 640;
      let vbH = 280;
      if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          vbW = parts[2];
          vbH = parts[3];
        }
      }

      normalizedSvg = normalizedSvg
        .replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
          const cleanedAttrs = attrs
            .replace(/\sclass\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\swidth\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\sheight\s*=\s*["'][^"']*["']/gi, '');
          return `<svg${cleanedAttrs} width="${vbW}" height="${vbH}">`;
        });

      const blob = new Blob([normalizedSvg], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        window.clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const ratio = vbH / vbW || height / width;
          canvas.width = width;
          canvas.height = Math.round(width * ratio);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            finish(null);
            return;
          }
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          finish(dataUrl);
        } catch {
          URL.revokeObjectURL(url);
          finish(null);
        }
      };

      img.onerror = () => {
        window.clearTimeout(timer);
        URL.revokeObjectURL(url);
        finish(null);
      };

      img.src = url;
    } catch {
      window.clearTimeout(timer);
      finish(null);
    }
  });
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
