import { publicPageLink, SITE_ORIGIN } from './siteUrl.ts';

/** Public navigation only. No executable schemes, protocol-relative URLs or credentials. */
export const safeLink = (input: string | undefined): string | undefined => {
  const value = input?.trim();
  if (!value || Array.from(value).some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127 || character === '\\')) return undefined;
  if (value.startsWith('#')) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return publicPageLink(value);
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
    return url.origin === SITE_ORIGIN ? `${SITE_ORIGIN}${publicPageLink(url.pathname + url.search + url.hash)}` : url.href;
  } catch { return undefined; }
};
