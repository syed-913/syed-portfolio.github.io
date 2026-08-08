import { StrictMode } from 'react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

export default function Bootstrap() {
  return (
    <StrictMode>
      <AuthProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </AuthProvider>
    </StrictMode>
  );
}
