import { createContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { siteDefaults } from '../data/siteDefaults';
import { scheduleAfterPaint } from '../lib/idle';
import type { SiteSettings } from '../types/database';
import { SETTINGS_REVISION_KEY } from '../lib/settingsSync';
import { readPublicSnapshot } from '../lib/publicSnapshot';

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
}

const SETTINGS_CACHE_KEY = 'portfolio:site-settings-render:v12';

const readWarmSettings = (): SiteSettings => {
  try {
    const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
    return cached ? ({ ...siteDefaults, ...JSON.parse(cached) } as SiteSettings) : readPublicSnapshot()?.settings ?? siteDefaults;
  } catch {
    return readPublicSnapshot()?.settings ?? siteDefaults;
  }
};

export const SiteSettingsContext = createContext<SiteSettingsContextValue>({ settings: siteDefaults, loading: true });

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(readWarmSettings);
  const [loading, setLoading] = useState(true);
  const revision = useRef(0);

  useEffect(() => {
    try { sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings)); } catch { /* Optional storage. */ }
  }, [settings]);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    let refreshId = 0;
    const updateCopy = (event: Event) => {
      const patch = (event as CustomEvent<Partial<SiteSettings>>).detail;
      revision.current += 1;
      setSettings(previous => ({ ...previous, ...patch }));
    };
    window.addEventListener('portfolio:site-copy-updated', updateCopy);
    const refresh = (force = false) => {
      if (!active) return;
      if (refreshing && !force) return;
      refreshing = true;
      const requestId = ++refreshId;
      const startedAtRevision = ++revision.current;
      import('../services/db')
        .then(({ getSiteSettings, invalidatePublicCache }) => {
          invalidatePublicCache('settings');
          return getSiteSettings({ strict: true });
        })
        .then((next) => {
          if (!active || revision.current !== startedAtRevision) return;
          setSettings(next);
        })
        .catch(() => undefined)
        .finally(() => {
          if (refreshId === requestId) refreshing = false;
          if (active) setLoading(false);
        });
    };
    const storage = (event: StorageEvent) => { if (event.key === SETTINGS_REVISION_KEY) refresh(true); };
    const focus = () => refresh();
    const pageshow = (event: PageTransitionEvent) => { if (event.persisted) refresh(); };
    window.addEventListener('storage', storage);
    window.addEventListener('focus', focus);
    window.addEventListener('pageshow', pageshow);
    const cancel = scheduleAfterPaint(() => refresh());

    return () => { active = false; cancel(); window.removeEventListener('portfolio:site-copy-updated', updateCopy); window.removeEventListener('storage', storage); window.removeEventListener('focus', focus); window.removeEventListener('pageshow', pageshow); };
  }, []);

  return <SiteSettingsContext.Provider value={{ settings, loading }}>{children}</SiteSettingsContext.Provider>;
};
