import { useContext } from 'react';
import { SiteSettingsContext } from '../context/SiteSettingsContext';

export const useSiteSettings = () => useContext(SiteSettingsContext);
