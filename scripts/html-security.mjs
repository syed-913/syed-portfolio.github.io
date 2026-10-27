import { createHash } from 'node:crypto';

/** Meta CSP works on GitHub Pages; framing protection still needs a response header. */
export function secureHtml(html) {
  if (!/<meta\s+charset=["'][^"']+["']\s*\/?>/i.test(html)) throw new Error('A charset declaration is required before the content security policy.');
  const hashes = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
  const policy = [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(hashes)].join(' ')}`.trim(),
    // Motion applies inline styles. Existing public API and ImageKit URLs remain supported.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:",
    "font-src 'self'",
    "connect-src 'self' https: wss:",
    "frame-src https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
  const tags = `<meta http-equiv="Content-Security-Policy" content="${policy}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`;
  // Place the policy before scripts, preload links and the document body.
  return html.replace(/(<meta\s+charset=["'][^"']+["']\s*\/?>)/i, (_, charset) => `${charset}\n    ${tags}`);
}
