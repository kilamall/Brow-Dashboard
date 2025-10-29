import { useEffect, useMemo, useRef, useState } from 'react';
import { sendMagicLink, completeMagicLinkSignIn, isMagicLink } from '@buenobrows/shared/authHelpers';
import {
  createSlotHoldClient,
  releaseHoldClient,
  getOrCreateSessionId,
} from '@buenobrows/shared/functionsClient';
import type { Service } from '@buenobrows/shared/types';

type Status = 'idle' | 'delaying' | 'holding' | 'verifying' | 'error';
type Slot = { id: string; startISO: string; endISO: string; resourceId?: string };

interface Hold {
  id: string;
  expiresAt: string; // ISO string
  status: string;
}

interface Props {
  service: Service;
  slot: Slot;
  sessionId: string;          // anonymous/guest session id (e.g., from localStorage)
  userEmail?: string | null;  // if signed in, pass current email
  onBookSignedIn: (holdId: string) => Promise<void>;
  onBookGuest: (holdId: string) => Promise<void>;
  className?: string;
}

export default function BookingActionBar({
  service,
  slot,
  sessionId,
  userEmail,
  onBookSignedIn,
  onBookGuest,
  className
}: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState('');
  const [hold, setHold] = useState<Hold | null>(null);
  const [email, setEmail] = useState(userEmail ?? '');
  const [isLinkFlow, setIsLinkFlow] = useState(false);
  const [delayRemaining, setDelayRemaining] = useState(0);
  const timerRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const [, rerender] = useState(0);
  
  // Delay configuration (3 seconds before creating hold)
  const HOLD_DELAY_MS = 3000;

  // Format helpers
  const prettyTime = useMemo(() => {
    const start = new Date(slot.startISO);
    const end = new Date(slot.endISO);
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${fmt(start)}–${fmt(end)}`;
  }, [slot.startISO, slot.endISO]);

  const remaining = useMemo(() => {
    if (!hold) return 0;
    return Math.max(0, new Date(hold.expiresAt).getTime() - Date.now());
  }, [hold]);

  const remainingText = useMemo(() => {
    const secs = Math.ceil(remaining / 1000);
    const m = Math.floor(secs / 60).toString().padStart(1, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [remaining]);

  // Place/release hold when slot changes
  useEffect(() => {
    let cancelled = false;

    // Start delay countdown
    setStatus('delaying');
    setErr('');
    setDelayRemaining(HOLD_DELAY_MS);

    // Clear any existing delay timer
    if (delayTimerRef.current) {
      clearInterval(delayTimerRef.current);
    }

    // Start delay countdown
    delayTimerRef.current = window.setInterval(() => {
      setDelayRemaining(prev => {
        if (prev <= 1000) {
          // Delay finished, create hold
          if (!cancelled) {
            (async () => {
              try {
                setStatus('holding');
                const h = await createSlotHoldClient({
                  serviceId: service.id,
                  startISO: slot.startISO,
                  endISO: slot.endISO,
                  sessionId,
                });
                if (!cancelled) setHold(h as Hold);
                if (!cancelled) setStatus('idle');
              } catch (e: any) {
                if (!cancelled) {
                  setErr(e?.message ?? 'Could not hold this time. Please wait a moment before selecting another time, or try a different slot.');
                  setStatus('error');
                }
              }
            })();
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // cleanup: release hold if user changes slot or leaves component
    return () => {
      cancelled = true;
      if (delayTimerRef.current) {
        clearInterval(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (hold) void releaseHoldClient(hold.id).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot.id]);

  // Tick countdown each second
  useEffect(() => {
    if (!hold) return;
    timerRef.current = window.setInterval(() => rerender(x => x + 1), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [hold]);

  // Detect magic-link and prefill email
  useEffect(() => {
    const link = isMagicLink();
    setIsLinkFlow(link);
    if (link) {
      const stored = window.localStorage.getItem('bb_magic_email');
      if (stored) setEmail(stored);
    }
  }, []);

  // Expired hold guard
  const holdExpired = hold ? Date.now() >= new Date(hold.expiresAt).getTime() : false;


  async function handleVerifyAndBookNow() {
    if (!hold || holdExpired) return;
    setErr('');

    // If user already signed in upstream, just finalize
    if (userEmail) {
      await onBookSignedIn(hold.id);
      return;
    }

    // If they arrived via email link, finish sign-in inline
    if (isLinkFlow && email) {
      try {
        setStatus('verifying');
        await completeMagicLinkSignIn(email);
        window.history.replaceState({}, document.title, window.location.pathname);
        await onBookSignedIn(hold.id);
        return;
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to verify email');
        setStatus('error');
        return;
      }
    }

    // Otherwise trigger your normal auth modal / magic-link send flow upstream
    // (Parent should open auth UI and then call onBookSignedIn once signed in.)
    setErr('Please sign in to book with your account.');
  }

  async function handleBookGuest() {
    if (!hold || holdExpired) return;
    setErr('');
    await onBookGuest(hold.id);
  }

  if (status === 'delaying') {
    // Show delay countdown
    const delaySeconds = Math.ceil(delayRemaining / 1000);
    return (
      <div className={className}>
        <div className="mt-4 rounded-2xl border border-blue-300 bg-blue-50 p-4">
          <div className="text-center">
            <div className="text-sm text-blue-700">Preparing to hold your slot</div>
            <div className="font-serif text-lg">
              {service.name} • {prettyTime}
            </div>
            <div className="text-xs text-blue-600">
              Hold will start in {delaySeconds} second{delaySeconds !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hold) {
    // Subtle placeholder so layout doesn't jump
    return (
      <div className={className}>
        <div className="mt-4 rounded-2xl border border-terracotta/30 bg-white/70 p-4 text-sm text-slate-600">
          {status === 'holding' ? 'Creating hold…' : 'Preparing…'}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-slate-600">You’re holding</div>
            <div className="font-serif text-lg">
              {service.name} • {prettyTime}
            </div>
            <div className={`text-xs ${holdExpired ? 'text-red-600' : 'text-slate-500'}`}>
              {holdExpired ? 'Hold expired' : `Hold expires in ${remainingText}`}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!userEmail && isLinkFlow && (
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-md p-2 w-56"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                  aria-label="Email for verification"
                />
                <button
                  className="rounded-xl px-4 py-2 bg-terracotta text-white disabled:opacity-60"
                  onClick={() => void handleVerifyAndBookNow()}
                  disabled={!email || status === 'verifying' || holdExpired}
                  aria-busy={status === 'verifying'}
                >
                  {status === 'verifying' ? 'Verifying…' : 'Book now'}
                </button>
              </div>
            )}

            {(!isLinkFlow || userEmail) && (
              <button
                className="rounded-xl px-4 py-2 bg-terracotta text-white disabled:opacity-60"
                onClick={() => void handleVerifyAndBookNow()}
                disabled={holdExpired}
              >
                Book now
              </button>
            )}

            <button
              className="rounded-xl px-4 py-2 border border-terracotta/60 text-terracotta disabled:opacity-60"
              onClick={() => void handleBookGuest()}
              disabled={holdExpired}
            >
              Book as guest
            </button>
          </div>
        </div>

        {err && <div className="mt-2 text-sm text-red-600" role="alert">{err}</div>}
      </div>
    </div>
  );
}
