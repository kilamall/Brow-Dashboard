import { useState } from 'react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function SignIn({ enableGoogle = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-semibold text-slate-800">Admin sign in</h1>
        <p className="text-sm text-slate-500 mt-1">Use your admin credentials to access the dashboard.</p>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">Email</span>
            <input type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Password</span>
            <div className="mt-1 flex gap-2">
              <input type={showPw ? 'text' : 'password'} className="flex-1 rounded-lg border border-slate-300 px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={()=>setShowPw(v=>!v)}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-500 text-white py-2.5 font-medium hover:bg-amber-600 disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>

        {enableGoogle && (
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="mt-3 w-full rounded-lg border border-slate-300 py-2.5 font-medium hover:bg-slate-50 disabled:opacity-50">Continue with Google</button>
        )}
      </div>
    </div>
  );
}
