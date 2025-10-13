import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

(function assertCfg() {
  const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    const masked = (cfg.apiKey || '').replace(/.(?=.{4})/g, '•');
    // eslint-disable-next-line no-console
    console.error('[Firebase config error]', { missing, sample: { ...cfg, apiKey: masked } });
    throw new Error('Missing env vars: ' + missing.join(', '));
  }
})();

export const app = initializeApp(cfg);
export const db = getFirestore(app);
export const auth = getAuth(app);

