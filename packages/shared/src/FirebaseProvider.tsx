import React, { createContext, useContext, useMemo } from 'react';
import { initFirebase } from './firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Functions } from 'firebase/functions';
import type { Messaging } from 'firebase/messaging';

interface FirebaseContextType {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  functions: Functions;
  messaging?: Messaging;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  // Initialize Firebase once at the provider level
  const firebase = useMemo(() => initFirebase(), []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
}

