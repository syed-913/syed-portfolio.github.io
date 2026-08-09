import { browserSessionPersistence, getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import app from './firebase';

// Dashboard authentication is intentionally session-only and does not include
// popup/redirect dependencies. This module is lazy-loaded only on /dashboard.
let adminAuth: Auth;
try {
  adminAuth = initializeAuth(app, { persistence: browserSessionPersistence });
} catch (error) {
  // Vite HMR can re-evaluate this module in development after Auth already exists.
  adminAuth = getAuth(app);
}

export const auth = adminAuth;
export const adminDb = getFirestore(app);
