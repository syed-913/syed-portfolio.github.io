import { createContext, useEffect, useState, type ReactNode } from 'react';
import { siteDefaults } from '../data/siteDefaults';
import { scheduleAfterPaint } from '../lib/idle';
import type { SiteSettings } from '../types/database';

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
}

const SETTINGS_CACHE_KEY = 'portfolio:site-settings-render:v11';

const readWarmSettings = (): SiteSettings => {
  try {
    const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
    return cached ? ({ ...siteDefaults, ...JSON.parse(cached) } as SiteSettings) : siteDefaults;
  } catch {
    return siteDefaults;
  }
};

export const SiteSettingsContext = createContext<SiteSettingsContextValue>({ settings: siteDefaults, loading: true });

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(readWarmSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const cancel = scheduleAfterPaint(() => {
      import('../services/db')
        .then(({ getSiteSettings }) => getSiteSettings())
        .then((next) => {
          if (!active) return;
          setSettings(next);
          try { sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(next)); } catch { /* no-op */ }
        })
        .catch(() => undefined)
        .finally(() => active && setLoading(false));
    });

    return () => { active = false; cancel(); };
  }, []);

  return <SiteSettingsContext.Provider value={{ settings, loading }}>{children}</SiteSettingsContext.Provider>;
};
