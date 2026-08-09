import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { publicDb as db } from '../lib/publicFirebase';

const sessionId = () => {
  const key = 'portfolio:session-id';
  const value = sessionStorage.getItem(key);
  if (value) return value;
  const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(key, id);
  return id;
};

const sessionSource = () => {
  const key = 'portfolio:session-source';
  const value = sessionStorage.getItem(key);
  if (value) return value;
  let source = 'Direct';
  try {
    if (document.referrer) {
      const referrer = new URL(document.referrer);
      if (referrer.origin !== location.origin) {
        const host = referrer.hostname.replace(/^www\./, '').toLowerCase();
        source = host.includes('linkedin') ? 'LinkedIn' : host.includes('google') ? 'Google' : host.includes('github') ? 'GitHub' : host.includes('bing') ? 'Bing' : host;
      }
    }
  } catch { /* malformed referrer */ }
  sessionStorage.setItem(key, source);
  return source;
};

export const logVisit = async (path: string) => {
  try {
    const key = `visit:${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    await addDoc(collection(db, 'visits'), {
      path,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      sessionId: sessionId(),
      referrer: document.referrer || '',
      source: sessionSource(),
    });
  } catch (error) {
    console.warn('Visit analytics unavailable.', error);
  }
};
