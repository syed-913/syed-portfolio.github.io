import { StrictMode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import App from './App';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

export default function Bootstrap() {
  return (
    <StrictMode>
      <LazyMotion features={domAnimation}>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </LazyMotion>
    </StrictMode>
  );
}
