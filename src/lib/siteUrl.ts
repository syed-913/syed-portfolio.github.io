export const SITE_ORIGIN = 'https://syedammar.engineer';

export function canonicalPath(input = '/'): string {
  const path = input.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '');
  return path ? `/${path}/` : '/';
}

/** Normalize public page links; leave files, external URLs and anchors intact. */
export function publicPageLink(input: string): string {
  const match = input.match(/^(\/[^?#]*)([?#].*)?$/);
  if (!match || !/^\/(?:about|projects|experience|credentials|writing(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?|contact)\/?$/.test(match[1])) return input;
  return canonicalPath(match[1]) + (match[2] || '');
}
