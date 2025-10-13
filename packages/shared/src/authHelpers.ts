import { initFirebase } from './firebase';
import { getAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Send a passwordless magic link to the user's email using Firebase Email Link sign-in.
 * Requires VITE_AUTH_EMAIL_LINK_URL to be set to something like: https://your-domain.com/verify
 */
export async function sendMagicLink(email: string) {
  const { app } = initFirebase();
  const auth = getAuth(app);
  const url = import.meta.env.VITE_AUTH_EMAIL_LINK_URL;
  if (!url) throw new Error('Missing VITE_AUTH_EMAIL_LINK_URL env');

  const actionCodeSettings = {
    url, // where we'll complete sign-in
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // store for retrieval on the /verify page
  window.localStorage.setItem('bb_magic_email', email);
}

/**
 * Returns true if the current URL is an email-link sign-in link
 */
export function isMagicLink(url?: string) {
  const { app } = initFirebase();
  const auth = getAuth(app);
  return isSignInWithEmailLink(auth, url ?? window.location.href);
}

/**
 * Completes sign-in. If no email is known from localStorage, pass one.
 * After sign-in, calls the callable function to migrate guest records.
 */
export async function completeMagicLinkSignIn(emailFromUser?: string) {
  const { app } = initFirebase();
  const auth = getAuth(app);
  const functions = getFunctions(app);

  await setPersistence(auth, browserLocalPersistence);

  const email = emailFromUser || window.localStorage.getItem('bb_magic_email') || '';
  if (!email) throw new Error('Email required to complete sign-in');

  const href = window.location.href;
  const cred = await signInWithEmailLink(auth, email, href);

  // cleanup
  window.localStorage.removeItem('bb_magic_email');

  // server-side migration (no PII exposure in client rules)
  const migrate = httpsCallable(functions, 'migrateCustomerForEmail');
  await migrate({ email });

  return cred.user;
}
