import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scheduleIdle } from '../../lib/idle';

export const AnalyticsTracker = () => {
  const location = useLocation();
  const firstPage = useRef(true);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) return;

    let cancelIdle: (() => void) | undefined;
    let delayHandle = 0;

    const queueWrite = () => {
      const delay = firstPage.current ? 3200 : 500;
      firstPage.current = false;
      delayHandle = window.setTimeout(() => {
        cancelIdle = scheduleIdle(() => {
          import('../../services/analytics')
            .then(({ logVisit }) => logVisit(location.pathname))
            .catch(() => undefined);
        }, 1500);
      }, delay);
    };

    if (document.readyState === 'complete') queueWrite();
    else window.addEventListener('load', queueWrite, { once: true });

    return () => {
      window.removeEventListener('load', queueWrite);
      window.clearTimeout(delayHandle);
      cancelIdle?.();
    };
  }, [location.pathname]);

  return null;
};
