import { PropsWithChildren, useEffect, useState } from 'react';
import { initFirebase } from '../../../../packages/shared/src/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

const { auth } = initFirebase();

type State = 'loading' | 'authed' | 'unauthed' | 'restricted';

export default function AuthGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<State>('loading');
  const [err, setErr] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return setState('unauthed');
      const token = await u.getIdTokenResult(true);
      const role = (token.claims as any).role;
      if (role === 'admin') setState('authed');
      else setState('restricted');
    });
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
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      onError(e.message);
    }
  }
  return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <form onSubmit={onSubmit} className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <h1 className="text-2xl font-serif text-slate-800 mb-4">Admin Sign In</h1>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <input className="w-full border rounded-md p-2 mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-md p-2 mb-4" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-terracotta text-white rounded-md py-2">Sign In</button>
      </form>
    </div>
  );
}
