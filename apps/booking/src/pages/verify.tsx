import { useEffect, useState } from 'react';
import { isMagicLink, completeMagicLinkSignIn } from '@buenobrows/shared/authHelpers';

type Status = 'idle' | 'working' | 'done' | 'error';

export default function Verify() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    // Only prefill if this page was opened by an email-link flow
    if (!isMagicLink()) return;

    const stored = window.localStorage.getItem('bb_magic_email');
    if (stored) setEmail(stored);
  }, []);

  async function handleComplete() {
    try {
      setStatus('working');
      setErr('');

      await completeMagicLinkSignIn(email);

      // Optionally clear sensitive URL params after successful sign-in
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setStatus('done');
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : typeof e === 'string' ? e : 'Failed to verify';
      setErr(message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="font-serif text-2xl mb-2">Verify your email</h1>
      <p className="text-sm text-slate-600 mb-4">
        Click the button below to finish signing in. If we couldn&apos;t detect your email automatically,
        please enter it.
      </p>

      <div className="grid gap-3">
        <input
          className="border rounded-md p-2"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
          aria-label="Email address"
        />

        <button
          className="bg-terracotta text-white rounded-md px-4 py-2 disabled:opacity-60"
          onClick={() => void handleComplete()}
          disabled={status === 'working'}
          aria-busy={status === 'working'}
        >
          {status === 'working' ? 'Completing…' : 'Complete sign-in'}
        </button>

        {status === 'done' && (
          <div className="text-green-700 text-sm">
            You&apos;re signed in. We linked your previous bookings to your account.
          </div>
        )}

        {err && (
          <div className="text-red-600 text-sm" role="alert">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
