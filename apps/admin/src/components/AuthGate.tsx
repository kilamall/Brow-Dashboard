import { PropsWithChildren, useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';

type State = 'loading' | 'authed' | 'unauthed' | 'restricted';

export default function AuthGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<State>('loading');
  const [err, setErr] = useState('');
  const { auth } = useFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          setState('unauthed');
          return;
        }
        const token = await u.getIdTokenResult(true); // Force refresh to get latest claims
        const role = (token.claims as any).role;
        
        if (role === 'admin') {
          setState('authed');
        } else {
          setState('restricted');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setState('unauthed');
      }
    });
    
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'loading') return <div className="p-8">Loading…</div>;
  if (state === 'restricted') return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <h1 className="text-xl font-serif text-slate-800 mb-2">Access Restricted</h1>
        <p className="text-slate-600 text-sm">Your account is signed in, but does not have the <span className="font-mono">role: "admin"</span> claim.</p>
      </div>
    </div>
  );
  if (state === 'unauthed') return <SignIn onError={setErr} error={err}/>;
  return <>{children}</>;
}

function SignIn({ error, onError }: { error?: string; onError: (e: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const { auth } = useFirebase();
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      console.log('Attempting email/password sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Email/password sign in successful');
    } catch (e: any) {
      console.error('Email/password sign in error:', e);
      onError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      console.log('Attempting Google sign in...');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('Google sign in successful');
    } catch (e: any) {
      console.error('Google sign in error:', e);
      onError(e.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      onError('Please enter your email address first');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    try {
      // Configure password reset to redirect to admin app
      const actionCodeSettings = {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: true,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setResetMessage('Password reset email sent! Check your inbox and click the link to reset your password.');
    } catch (e: any) {
      console.error('Password reset error:', e);
      if (e.code === 'auth/user-not-found') {
        onError('No account found with this email address');
      } else if (e.code === 'auth/invalid-email') {
        onError('Invalid email address');
      } else {
        onError(e.message || 'Failed to send password reset email');
      }
    } finally {
      setResetLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <h1 className="text-2xl font-serif text-slate-800 mb-4">Admin Sign In</h1>
        {error && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</p>}
        
        {/* Google Sign In */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading || googleLoading}
          className="w-full border border-slate-300 text-slate-700 rounded-md py-2 mb-4 flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or sign in with email</span>
          </div>
        </div>

        {/* Email/Password Sign In */}
        <form onSubmit={onSubmit} noValidate>
          <input 
            id="admin-email"
            name="admin-email"
            autoComplete="email"
            className="w-full border rounded-md p-2 mb-3" 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            disabled={loading || googleLoading}
          />
          <input 
            id="admin-password"
            name="admin-password"
            autoComplete="current-password"
            className="w-full border rounded-md p-2 mb-4" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            disabled={loading || googleLoading}
          />
          <button 
            type="submit"
            disabled={loading || googleLoading || resetLoading}
            className="w-full bg-terracotta text-white rounded-md py-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>

        {/* Password Reset */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={resetPassword}
            disabled={loading || googleLoading || resetLoading || !email}
            className="text-sm text-terracotta hover:text-terracotta/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetLoading ? 'Sending...' : 'Forgot Password?'}
          </button>
          {resetMessage && (
            <p className="text-sm text-green-600 mt-2">{resetMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
