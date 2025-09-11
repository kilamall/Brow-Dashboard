import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function assertEnv(name: string) {
  const v = import.meta.env[name as keyof ImportMetaEnv];
  if (!v) {
    const masked = name === 'VITE_FIREBASE_API_KEY' ? '***' : '';
    console.error(`[Firebase] Missing env: ${name}${masked ? ' (' + masked + ')' : ''}`);
    throw new Error(`Missing env ${name}`);
  }
  return v as string;
}

export function initFirebase(): {
  app: FirebaseApp;
  db: ReturnType<typeof getFirestore>;
  auth: ReturnType<typeof getAuth>;
} {
  const config = {
    apiKey: assertEnv('VITE_FIREBASE_API_KEY'),
    authDomain: assertEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: assertEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: assertEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: assertEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: assertEnv('VITE_FIREBASE_APP_ID'),
  };

  const app = getApps().length ? getApps()[0]! : initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app);
  return { app, db, auth };
}
