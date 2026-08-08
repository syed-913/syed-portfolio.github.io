import { createContext, useEffect, useState, type ReactNode } from 'react';
import { siteDefaults } from '../data/siteDefaults';
import { getSiteSettings } from '../services/db';
import type { SiteSettings } from '../types/database';

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
}

export const SiteSettingsContext = createContext<SiteSettingsContextValue>({ settings: siteDefaults, loading: true });

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  return <SiteSettingsContext.Provider value={{ settings, loading }}>{children}</SiteSettingsContext.Provider>;
};
