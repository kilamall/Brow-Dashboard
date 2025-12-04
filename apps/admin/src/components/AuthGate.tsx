import { PropsWithChildren, useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  type MultiFactorResolver
} from 'firebase/auth';

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
  
  // Check if signed out due to idle session
  const searchParams = new URLSearchParams(window.location.search);
  const reason = searchParams.get('reason');
  
  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  
  const { auth } = useFirebase();
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    onError(''); // Clear previous errors
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      // Check if 2FA is required
      if (e.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, e);
        setMfaResolver(resolver);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }
      
      const errorMessage = e?.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : e?.message || 'Failed to sign in';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    onError(''); // Clear previous errors
    try {
      console.log('🔍 Starting Google sign-in...');
      console.log('🔍 Auth domain:', auth.app.options.authDomain);
      console.log('🔍 Project ID:', auth.app.options.projectId);
      
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🔍 Attempting sign-in with popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful:', result.user?.email);
    } catch (e: any) {
      console.error('❌ Google sign-in error:', e);
      console.error('❌ Error code:', e?.code);
      console.error('❌ Error message:', e?.message);
      console.error('❌ Full error:', e);
      
      // Check if 2FA is required for Google sign-in
      if (e.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, e);
        setMfaResolver(resolver);
        setNeeds2FA(true);
        setGoogleLoading(false);
        return;
      }
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to sign in with Google';
      
      if (e?.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (e?.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (e?.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (e?.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      } else if (e?.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (e?.code === 'auth/internal-error') {
        errorMessage = 'Internal error. Please try again or use email sign-in.';
      } else if (e?.message) {
        errorMessage = `${e.message} (Code: ${e.code || 'unknown'})`;
      }
      
      onError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function verify2FA() {
    if (!mfaResolver || !totpCode) return;
    
    setLoading(true);
    onError('');
    
    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        mfaResolver.hints[0].uid,
        totpCode
      );
      
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      // Success! User will be signed in automatically
    } catch (e: any) {
      console.error('2FA verification error:', e);
      onError(e?.message || 'Invalid verification code');
      setTotpCode(''); // Clear the code on error
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      onError('Please enter your email address first');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    onError(''); // Clear previous errors
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: true,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setResetMessage('Password reset email sent! Check your inbox and click the link to reset your password.');
    } catch (e: any) {
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

  // If 2FA is needed, show verification screen
  if (needs2FA) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream">
        <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-slate-800 mb-2 text-center">Two-Factor Authentication</h1>
          {error && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</p>}
          
          <p className="text-slate-600 text-sm mb-4 text-center">
            Enter the 6-digit code from your authenticator app
          </p>

          <input
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && totpCode.length === 6) {
                verify2FA();
              }
            }}
            className="w-full border rounded-md p-3 mb-4 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-terracotta focus:border-terracotta"
            maxLength={6}
            autoFocus
          />

          <button
            onClick={verify2FA}
            disabled={loading || totpCode.length !== 6}
            className="w-full bg-terracotta text-white rounded-md py-2.5 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-3"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            onClick={() => {
              setNeeds2FA(false);
              setMfaResolver(null);
              setTotpCode('');
              onError('');
            }}
            className="w-full text-sm text-terracotta hover:text-terracotta/80"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <h1 className="text-2xl font-serif text-slate-800 mb-4">Admin Sign In</h1>
        
        {/* Idle Session Message */}
        {reason === 'idle' && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-amber-800 font-medium">Session Expired</p>
                <p className="text-xs text-amber-700 mt-1">You were automatically signed out due to inactivity.</p>
              </div>
            </div>
          </div>
        )}
        
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
