export function sanitizeSvg(svg: string, defaultViewBox = '0 0 640 280'): string {
  const parts = defaultViewBox.split(/\s+/);
  const w = parts[2] || '640';
  const h = parts[3] || '280';
  const cx = Math.round(Number(w) / 2) || 320;
  const cy = Math.round(Number(h) / 2) || 140;
  const fallbackSvg = `<svg viewBox="${defaultViewBox}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#F8FAFC" rx="8"/><text x="${cx}" y="${cy}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#475569">Schéma pédagogique prêt pour édition</text></svg>`;

  if (!svg || typeof svg !== 'string') {
    return fallbackSvg;
  }

  const cleaned = svg
    // Strip dangerous container tags (with content)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?(?:<\/embed>|\/?>)/gi, '')
    // Strip self-closing or unclosed dangerous tags
    .replace(/<(?:script|foreignObject|iframe|object|link|meta|base)\b[^>]*\/?>/gi, '')
    // Strip inline event handlers (quoted and unquoted)
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Strip javascript:, vbscript:, data:text/html URIs in href/src/xlink:href/style
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, 'blocked:')
    .replace(/\s(?:xlink:)?href\s*=\s*(?:"\s*blocked:[^"]*"|'\s*blocked:[^']*')/gi, '')
    // Strip animate/set targeting href attributes
    .replace(/<(?:animate|set)\b[^>]*attributeName\s*=\s*["'](?:xlink:)?href["'][^>]*\/?>/gi, '')
    .trim();

  const match = cleaned.match(/<svg\b[\s\S]*<\/svg>/i);
  if (!match) {
    return fallbackSvg;
  }

  let result = match[0];
  if (!/\bviewBox\s*=/i.test(result)) {
    result = result.replace(/<svg\b/i, `<svg viewBox="${defaultViewBox}"`);
  }
  if (!/\bxmlns\s*=/i.test(result)) {
    result = result.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return result;
}
