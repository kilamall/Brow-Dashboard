import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';

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
  analytics?: Analytics;
} | null = null;

let _emulatorsAttached = false;

export function initFirebase(): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  functions: Functions;
  messaging?: Messaging;
  analytics?: Analytics;
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

  // Initialize Analytics (browser only, not in emulators)
  let analytics: Analytics | undefined;
  if (typeof window !== 'undefined' && !import.meta.env.DEV) {
    // Use Firebase's recommended approach to check if Analytics is supported
    isAnalyticsSupported().then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
          console.log('[Firebase] Analytics initialized');
        } catch (error) {
          console.warn('[Firebase] Analytics initialization failed:', error);
        }
      } else {
        console.log('[Firebase] Analytics not supported in this environment');
      }
    }).catch((error) => {
      console.warn('[Firebase] Analytics support check failed:', error);
    });
  }

  // Connect to local emulators in dev when flag is set
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === '1' && !_emulatorsAttached) {
    // Only connect functions to emulator, keep Firestore and Auth on production
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    _emulatorsAttached = true;
    console.info('[Firebase] Connected to local functions emulator, using production Firestore and Auth.');
  }

  // Cache the instance
  _firebaseInstance = { app, db, auth, functions, messaging, analytics };
  
  return _firebaseInstance;
}
