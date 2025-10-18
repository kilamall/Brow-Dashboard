import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

function assertEnv(name: string) {
  const v = import.meta.env[name as keyof ImportMetaEnv];
  if (!v) {
    const masked = name === 'VITE_FIREBASE_API_KEY' ? '***' : '';
    console.error(`[Firebase] Missing env: ${name}${masked ? ' (' + masked + ')' : ''}`);
    throw new Error(`Missing env ${name}`);
  }
  return v as string;
}

// Singleton instances
let _firebaseInstance: {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  functions: Functions;
  messaging?: Messaging;
} | null = null;

let _emulatorsAttached = false;

export function initFirebase(): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  functions: Functions;
  messaging?: Messaging;
} {
  // Return cached instance if already initialized
  if (_firebaseInstance) {
    return _firebaseInstance;
  }

  const config = {
    apiKey: assertEnv('VITE_FIREBASE_API_KEY'),
    authDomain: assertEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: assertEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: assertEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: assertEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: assertEnv('VITE_FIREBASE_APP_ID'),
  };

  // Initialize Firebase app (reuse existing if already initialized)
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0]! : initializeApp(config);

  console.log('[Firebase] App initialized:', app.name, app.options.projectId);

  // Initialize Firestore, Auth, and Functions  
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  console.log('[Firebase] Firestore and Auth initialized');

  const region =
    (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
  const functions = getFunctions(app, region);

  // Initialize messaging if supported (browser only)
  let messaging: Messaging | undefined;
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    });
  }

  // Connect to local emulators in dev when flag is set
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === '1' && !_emulatorsAttached) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    _emulatorsAttached = true;
    console.info('[Firebase] Connected to local emulators.');
  }

  // Cache the instance
  _firebaseInstance = { app, db, auth, functions, messaging };
  
  return _firebaseInstance;
}
