import { getApps, initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Keep app initialization tiny. Public Firestore Lite and private Auth/Firestore
// are imported from separate modules so dashboard code never enters the public
// critical path.
const app = getApps()[0] ?? initializeApp(firebaseConfig);

export default app;
