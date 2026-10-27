import type { SiteSettings } from '../types/database';

export const SETTINGS_REVISION_KEY = 'portfolio:settings-revision:v1';

/** The other tab receives only an invalidation marker, never unpublished content. */
export const announceSettingsSave = (patch: Partial<SiteSettings>) => {
  window.dispatchEvent(new CustomEvent('portfolio:site-copy-updated', { detail: patch }));
  try { localStorage.setItem(SETTINGS_REVISION_KEY, `${Date.now()}:${Math.random().toString(36).slice(2)}`); } catch { /* Focus/pageshow still refresh when storage is unavailable. */ }
};
