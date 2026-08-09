import { createRoot } from 'react-dom/client';
import './index.css';
import ConfigurationRequired from './components/system/ConfigurationRequired';

const requiredFirebaseEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = requiredFirebaseEnv.filter((key) => !import.meta.env[key]?.trim());
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Portfolio root element was not found.');
}

const root = createRoot(rootElement);

if (missing.length) {
  console.error('[portfolio] Missing local Firebase environment variables:', missing);
  root.render(<ConfigurationRequired missing={[...missing]} />);
} else {
  import('./Bootstrap')
    .then(({ default: Bootstrap }) => root.render(<Bootstrap />))
    .catch((error) => {
      console.error('[portfolio] Application bootstrap failed:', error);
      root.render(
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, background: '#0c0e11', color: '#eef0e8' }}>
          <section style={{ maxWidth: 720 }}>
            <p style={{ color: '#b9ff66', fontFamily: 'monospace' }}>Application startup error</p>
            <h1 style={{ fontSize: 48, letterSpacing: '-.04em' }}>The portfolio could not start.</h1>
            <p style={{ color: '#a6aba3', lineHeight: 1.7 }}>Open the browser developer console for the exact error. The startup failure is now surfaced here instead of leaving a blank page.</p>
          </section>
        </main>,
      );
    });
}
