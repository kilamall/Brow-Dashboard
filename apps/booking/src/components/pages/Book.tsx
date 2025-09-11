// apps/booking/src/pages/Book.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { initFirebase } from '@shared/firebase';
import { useNavigate } from 'react-router-dom';
import {
  E_OVERLAP,
  createAppointmentTx,
  watchServices,
  watchBusinessHours,
  watchAppointmentsByDay,
} from '@shared/firestoreActions';
import type { Appointment, BusinessHours, Service } from '@shared/types';
import { availableSlotsForDay } from '@shared/slotUtils';
import { format, parseISO } from 'date-fns';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { isMagicLink, completeMagicLinkSignIn } from '@shared/authHelpers';

const { db } = initFirebase();

function getOrCreateSessionId(): string {
  let id = localStorage.getItem('bb_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('bb_session', id);
  }
  return id;
}

export default function Book() {
  const nav = useNavigate();
  const auth = getAuth();

  // ---------- Step/Data ----------
  const [services, setServices] = useState<Service[]>([]);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  useEffect(() => watchServices(db, { activeOnly: true }, setServices), []);
  useEffect(() => watchBusinessHours(db, setBh), []);

  // ---------- Form: service/date/slot ----------
  const [serviceId, setServiceId] = useState<string>('');
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );
  const duration = selectedService?.duration || 60;

  const [dateStr, setDateStr] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const dayDate = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);

  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  useEffect(() => watchAppointmentsByDay(db, dayDate, setDayAppts), [dayDate]);

  const slots = useMemo(
    () => (bh ? availableSlotsForDay(dayDate, duration, bh, dayAppts) : []),
    [bh, dayDate, duration, dayAppts]
  );

  const [slotISO, setSlotISO] = useState<string>('');

  // ---------- Hold + countdown ----------
  const HOLD_MS = 5 * 60 * 1000; // 5 minutes
  const [holdUntil, setHoldUntil] = useState<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!slotISO) {
      setHoldUntil(null);
      if (tickRef.current) window.clearInterval(tickRef.current);
      return;
    }
    const until = Date.now() + HOLD_MS;
    setHoldUntil(until);
    tickRef.current = window.setInterval(() => forceTick((x) => x + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [slotISO]);

  const remainingMs = useMemo(
    () => (holdUntil ? Math.max(0, holdUntil - Date.now()) : 0),
    [holdUntil]
  );
  const holdExpired = holdUntil !== null && remainingMs <= 0;

  const remainingText = useMemo(() => {
    const secs = Math.ceil(remainingMs / 1000);
    const m = Math.floor(secs / 60).toString();
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [remainingMs]);

  // ---------- Auth context + email-link inline verify ----------
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), [auth]);

  const [linkFlow, setLinkFlow] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  useEffect(() => {
    const isLink = isMagicLink();
    setLinkFlow(isLink);
    if (isLink) {
      const stored = window.localStorage.getItem('bb_magic_email');
      if (stored) setVerifyEmail(stored);
    }
  }, []);

  // ---------- Guest inline form ----------
  const [guestOpen, setGuestOpen] = useState(false);
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gPhone, setGPhone] = useState('');

  // ---------- Misc ----------
  const [err, setErr] = useState('');
  const sessionId = useMemo(getOrCreateSessionId, []);

  // ---------- Actions ----------
  async function bookAsSignedIn() {
    if (!selectedService || !slotISO) return;
    setErr('');
    try {
      // Create appointment (server checks overlap; shows E_OVERLAP if lost)
      await createAppointmentTx(db, {
        customerId: user?.uid || 'user', // prefer UID when signed in
        serviceId: selectedService.id,
        start: slotISO,
        duration,
        status: 'pending',
        autoConfirm: true,
        bookedPrice: selectedService.price ?? 0,
        notes: `session:${sessionId}`,
      } as any);

      nav('/confirmation', {
        state: {
          when: format(parseISO(slotISO), 'PP p'),
          serviceName: selectedService.name,
        },
      });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === 'string' ? e : 'Failed to book.';
      if (msg === E_OVERLAP) {
        setErr('This time is no longer available. Please pick another slot.');
      } else {
        setErr(msg);
      }
    }
  }

  async function bookAsGuest() {
    if (!selectedService || !slotISO) return;
    setErr('');
    try {
      if (!gName || !gEmail) {
        setErr('Please enter your name and email.');
        return;
      }
      await createAppointmentTx(db, {
        customerId: 'guest', // you can upsert a customer by email server-side if desired
        serviceId: selectedService.id,
        start: slotISO,
        duration,
        status: 'pending',
        autoConfirm: true,
        bookedPrice: selectedService.price ?? 0,
        notes: `${gName} | ${gPhone} | ${gEmail} | session:${sessionId}`,
      } as any);

      nav('/confirmation', {
        state: {
          when: format(parseISO(slotISO), 'PP p'),
          serviceName: selectedService.name,
        },
      });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === 'string' ? e : 'Failed to book.';
      if (msg === E_OVERLAP) {
        setErr('This time is no longer available. Please pick another slot.');
      } else {
        setErr(msg);
      }
    }
  }

  async function handleBookNowClick() {
    // If already signed in → book
    if (user) {
      await bookAsSignedIn();
      return;
    }
    // If email-link flow present → complete inline, then book
    if (linkFlow && verifyEmail) {
      try {
        setErr('');
        await completeMagicLinkSignIn(verifyEmail);
        window.history.replaceState({}, document.title, window.location.pathname);
        await bookAsSignedIn();
        return;
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : typeof e === 'string' ? e : 'Failed to verify email.';
        setErr(msg);
        return;
      }
    }
    // Otherwise, prompt user to sign in via your usual auth screen/modal
    setErr('Please sign in or use “Book as guest.”');
  }

  // ---------- UI ----------
  return (
    <section className="grid gap-6">
      <h1 className="font-serif text-2xl">Book an appointment</h1>

      {/* Step 1: Service */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <h2 className="font-medium mb-2">1. Choose a service</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => (
            <label
              key={s.id}
              className={`border rounded-lg p-3 cursor-pointer ${
                serviceId === s.id ? 'ring-2 ring-terracotta' : 'hover:bg-cream'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {s.duration}m · ${s.price.toFixed(2)}
                  </div>
                </div>
                <input
                  type="radio"
                  name="svc"
                  checked={serviceId === s.id}
                  onChange={() => {
                    setServiceId(s.id);
                    // reset downstream state
                    setSlotISO('');
                    setGuestOpen(false);
                    setErr('');
                  }}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: Date & time */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <h2 className="font-medium mb-2">2. Pick date & time</h2>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <label className="text-sm text-slate-600">
            Date
            <input
              type="date"
              className="border rounded-md p-2 ml-2"
              value={dateStr}
              onChange={(e) => {
                setDateStr(e.target.value);
                setSlotISO('');
                setGuestOpen(false);
                setErr('');
              }}
            />
          </label>
          {selectedService && (
            <div className="text-sm text-slate-600">Duration: {duration} min</div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {slots.map((iso) => (
            <button
              key={iso}
              className={`border rounded-md py-2 text-sm ${
                slotISO === iso ? 'bg-terracotta text-white' : 'hover:bg-cream'
              }`}
              onClick={() => {
                setSlotISO(iso);
                setGuestOpen(false);
                setErr('');
              }}
            >
              {format(parseISO(iso), 'h:mm a')}
            </button>
          ))}
          {!slots.length && (
            <div className="text-slate-500 text-sm col-span-4">
              No slots available under current business hours.
            </div>
          )}
        </div>

        {/* Action bar appears after a timeslot is chosen */}
        {slotISO && selectedService && (
          <div className="mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-600">You’re holding</div>
                <div className="font-serif text-lg">
                  {selectedService.name} • {format(parseISO(slotISO), 'h:mm a')}
                </div>
                <div
                  className={`text-xs ${
                    holdExpired ? 'text-red-600' : 'text-slate-500'
                  }`}
                >
                  {holdExpired
                    ? 'Hold expired'
                    : `Hold expires in ${remainingText}`}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Inline email-verify only when in magic-link flow and not signed in */}
                {!user && linkFlow && (
                  <input
                    className="border rounded-md p-2 w-56"
                    placeholder="your@email.com"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    inputMode="email"
                    autoComplete="email"
                    aria-label="Email for verification"
                  />
                )}

                <button
                  className="rounded-xl px-4 py-2 bg-terracotta text-white disabled:opacity-60"
                  onClick={() => void handleBookNowClick()}
                  disabled={holdExpired}
                >
                  Book now
                </button>

                <button
                  className="rounded-xl px-4 py-2 border border-terracotta/60 text-terracotta disabled:opacity-60"
                  onClick={() => setGuestOpen((x) => !x)}
                  disabled={holdExpired}
                >
                  Book as guest
                </button>
              </div>
            </div>

            {/* Guest quick form */}
            {guestOpen && !holdExpired && (
              <div className="mt-3 grid sm:grid-cols-3 gap-2">
                <input
                  className="border rounded-md p-2"
                  placeholder="Full name"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                />
                <input
                  className="border rounded-md p-2"
                  placeholder="Email"
                  value={gEmail}
                  onChange={(e) => setGEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                />
                <input
                  className="border rounded-md p-2"
                  placeholder="Phone"
                  value={gPhone}
                  onChange={(e) => setGPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    className="bg-terracotta text-white rounded-md px-4 py-2 disabled:opacity-60"
                    onClick={() => void bookAsGuest()}
                    disabled={!gName || !gEmail}
                  >
                    Confirm guest booking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Errors */}
      {err && (
        <div className="text-red-600 text-sm" role="alert" aria-live="polite">
          {err}
        </div>
      )}
    </section>
  );
}
