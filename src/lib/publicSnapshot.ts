import type { BlogPost, Certificate, Experience, Project, SiteSettings } from '../types/database';

/** Only already-public records belong in the build-time page snapshot. */
export interface PublicSnapshot {
  settings: SiteSettings;
  projects: Project[];
  certificates: Certificate[];
  experience: Experience[];
  posts: BlogPost[];
}

let browserSnapshot: PublicSnapshot | null | undefined;

/** A first-paint fallback, never a replacement for the live data loaders. */
export function readPublicSnapshot(): PublicSnapshot | null {
  if (typeof document === 'undefined') return null;
  if (browserSnapshot !== undefined) return browserSnapshot;
  try {
    const element = document.getElementById('portfolio-public-data');
    const value = JSON.parse(element?.textContent || 'null');
    browserSnapshot = value && value.settings && ['projects', 'certificates', 'experience', 'posts'].every(key => Array.isArray(value[key])) ? value : null;
  } catch { browserSnapshot = null; }
  return browserSnapshot ?? null;
}
