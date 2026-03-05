
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logVisit } from '../../services/analytics';

export const AnalyticsTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Don't track dashboard visits
        if (!location.pathname.startsWith('/dashboard')) {
            logVisit(location.pathname);
        }
    }, [location]);

    return null;
};
