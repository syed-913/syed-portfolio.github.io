import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logVisit } from '../../services/analytics';

export const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/dashboard')) logVisit(location.pathname);
  }, [location.pathname]);
  return null;
};
