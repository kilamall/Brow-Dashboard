import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import SignIn from '@/components/SignIn';

export default function AuthGate({ requireAdmin = true, children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (u) {
        try { const token = await getIdTokenResult(u, true); setClaims(token?.claims || {}); } catch { setClaims(null); }
      } else {
        setClaims(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return <div className="min-h-screen grid place-items-center text-slate-500">Loading…</div>;
  if (!user) return <SignIn />;

  if (requireAdmin && !(claims?.role === 'admin')) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Access pending</h1>
          <p className="mt-2 text-slate-600 text-sm">This account lacks admin permissions. Ask an owner to grant <code>role: "admin"</code>.</p>
          <button onClick={() => signOut(auth)} className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Sign out</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
