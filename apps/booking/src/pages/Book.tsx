import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFirebase } from '@buenobrows/shared/useFirebase';
import type { Appointment, BusinessHours, Service } from '@buenobrows/shared/types';
import {
  watchServices,
  watchBusinessHours,
  watchAppointmentsByDay,
  findCustomerByEmail,
  createCustomer,
} from '@buenobrows/shared/firestoreActions';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';

import {
  createSlotHoldClient,
  releaseHoldClient,
  finalizeBookingFromHoldClient,
  getOrCreateSessionId,
} from '@buenobrows/shared/functionsClient';

import { format, parseISO } from 'date-fns';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { isMagicLink, completeMagicLinkSignIn } from '@buenobrows/shared/authHelpers';
import CustomerMessaging from '../components/CustomerMessaging';


type Slot = { startISO: string; endISO?: string; resourceId?: string | null };
type Hold = { id: string; expiresAt: string }; // from Cloud Function

export default function Book() {
  const { db } = useFirebase();
  const nav = useNavigate();
  const auth = getAuth();

  // ---------- Data ----------
  const [services, setServices] = useState<Service[]>([]);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  useEffect(() => watchServices(db, { activeOnly: true }, setServices), []);
  useEffect(() => watchBusinessHours(db, setBh), []);

  const [serviceId, setServiceId] = useState<string>('');
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );
  const duration = selectedService?.duration ?? 60;

  const [dateStr, setDateStr] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const dayDate = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);

  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  useEffect(() => watchAppointmentsByDay(db, dayDate, setDayAppts), [dayDate]);

  // slots for this day
  const slots = useMemo<Slot[]>(
    () =>
      bh && selectedService
        ? availableSlotsForDay(dayDate, duration, bh, dayAppts).map((startISO) => ({
            startISO,
            resourceId: null,
          }))
        : [],
    [bh, selectedService, duration, dayAppts, dayDate]
  );

  // ---------- Hold state (server-backed) ----------
  const sessionId = useMemo(getOrCreateSessionId, []);
  const [chosen, setChosen] = useState<Slot | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [error, setError] = useState('');

  // countdown from server `expiresAt`
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hold) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setCountdown('');
      return;
    }
    const tick = () => {
      const ms = new Date(hold.expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setCountdown('0:00');
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000)
        .toString()
        .padStart(2, '0');
      setCountdown(`${m}:${s}`);
    };
    tick();
    timerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [hold]);

  // reserve (create server hold) when a time is clicked
  async function pickSlot(slot: Slot) {
    setError('');
    setChosen(slot);
    // release old hold if any
    if (hold) {
      try {
        await releaseHoldClient(hold.id);
      } catch {}
      setHold(null);
    }
    try {
      const h = await createSlotHoldClient({
        serviceId: selectedService!.id,
        startISO: slot.startISO,
        durationMinutes: duration,
        sessionId,
        resourceId: slot.resourceId ?? null,
      });
      setHold({ id: h.id, expiresAt: h.expiresAt });
    } catch (e: any) {
      setError(e?.message === 'E_OVERLAP' ? 'This time is no longer available.' : e?.message || 'Failed to hold slot.');
      setChosen(null);
    }
  }

  // ---------- Auth / magic-link ----------
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

  // ---------- Guest form ----------
  const [guestOpen, setGuestOpen] = useState(false);
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gPhone, setGPhone] = useState('');

  // ensure we use a Customers doc id (not auth uid)
  async function ensureCustomerId(): Promise<string> {
    // Signed in: try to match on email
    if (user?.email) {
      const existing = await findCustomerByEmail(db, user.email);
      if (existing) return existing.id;
      return await createCustomer(db, {
        name: user.displayName || 'Customer',
        email: user.email,
        phone: null,
        status: 'approved',
      });
    }
    // Guest path: need at least name+email
    if (gEmail) {
      const existing = await findCustomerByEmail(db, gEmail);
      if (existing) return existing.id;
      return await createCustomer(db, {
        name: gName || 'Guest',
        email: gEmail,
        phone: gPhone || null,
        status: 'guest',
      });
    }
    throw new Error('Missing customer email.');
  }

  async function finalizeBooking() {
    if (!hold || !selectedService || !chosen) return;
    setError('');
    try {
      // If email-link verify is present
      if (!user && linkFlow && verifyEmail) {
        await completeMagicLinkSignIn(verifyEmail);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const customerId = await ensureCustomerId();
      const out = await finalizeBookingFromHoldClient({
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || null,
          email: user?.email || gEmail || null,
          phone: gPhone || null,
        },
        price: selectedService.price,
        autoConfirm: true,
      });
      nav(`/confirmation?id=${encodeURIComponent(out.appointmentId)}`);
    } catch (e: any) {
      setError(e?.message === 'E_OVERLAP' ? 'This time is no longer available.' : e?.message || 'Failed to finalize booking.');
      // try to free the hold
      try {
        if (hold) await releaseHoldClient(hold.id);
      } catch {}
      setHold(null);
    }
  }

  const prettyTime = (iso: string) => format(parseISO(iso), 'h:mm a');
  const holdExpired = hold ? new Date(hold.expiresAt).getTime() <= Date.now() : false;

  // ---------- UI ----------
  return (
    <div className="relative">
      <section className="grid gap-6">
        <h1 className="font-serif text-2xl">Book an appointment</h1>

      {/* Step 1: Service */}
      <div className="rounded-xl bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-medium">1. Choose a service</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <label
              key={s.id}
              className={`cursor-pointer rounded-lg border p-3 ${
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
                    setChosen(null);
                    setHold(null);
                    setError('');
                  }}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: Date & time */}
      <div className="rounded-xl bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-medium">2. Pick date & time</h2>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600">
            Date
            <input
              type="date"
              className="ml-2 rounded-md border p-2"
              value={dateStr}
              onChange={(e) => {
                setDateStr(e.target.value);
                setChosen(null);
                if (hold) setHold(null);
                setError('');
              }}
            />
          </label>
          {selectedService && (
            <div className="text-sm text-slate-600">Duration: {duration} min</div>
          )}
        </div>

        {/* time grid */}
        <div className="grid grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.startISO}
              onClick={() => pickSlot(slot)}
              className={`rounded-md border py-2 text-sm ${
                chosen?.startISO === slot.startISO ? 'bg-terracotta text-white' : 'hover:bg-cream'
              }`}
            >
              {prettyTime(slot.startISO)}
            </button>
          ))}
          {!slots.length && (
            <div className="col-span-4 text-sm text-slate-500">
              No slots available under current business hours.
            </div>
          )}
        </div>

        {/* action bar */}
        {chosen && selectedService && (
          <div className="mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-600">You’re holding</div>
                <div className="font-serif text-lg">
                  {selectedService.name} • {prettyTime(chosen.startISO)}
                </div>
                <div className={`text-xs ${holdExpired ? 'text-red-600' : 'text-slate-500'}`}>
                  {hold
                    ? holdExpired
                      ? 'Hold expired'
                      : `Hold expires in ${countdown}`
                    : 'Creating hold…'}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* inline verify only for magic-link flow */}
                {!user && linkFlow && (
                  <input
                    className="w-56 rounded-md border p-2"
                    placeholder="your@email.com"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    inputMode="email"
                    autoComplete="email"
                    aria-label="Email for verification"
                  />
                )}

                <button
                  className="rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60"
                  onClick={() => void finalizeBooking()}
                  disabled={!hold || holdExpired}
                >
                  Book now
                </button>

                <button
                  className="rounded-xl border border-terracotta/60 px-4 py-2 text-terracotta disabled:opacity-60"
                  onClick={() => setGuestOpen((x) => !x)}
                  disabled={!hold || holdExpired}
                >
                  Book as guest
                </button>
              </div>
            </div>

            {/* Guest quick form */}
            {guestOpen && hold && !holdExpired && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input
                  className="rounded-md border p-2"
                  placeholder="Full name"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                />
                <input
                  className="rounded-md border p-2"
                  placeholder="Email"
                  value={gEmail}
                  onChange={(e) => setGEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                />
                <input
                  className="rounded-md border p-2"
                  placeholder="Phone"
                  value={gPhone}
                  onChange={(e) => setGPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    className="rounded-md bg-terracotta px-4 py-2 text-white disabled:opacity-60"
                    onClick={() => void finalizeBooking()}
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

        {/* errors */}
        {error && (
          <div className="text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </section>

      {/* Customer Messaging Widget */}
      <div className="fixed bottom-4 right-4 w-80 z-50">
        <CustomerMessaging
          customerId={user?.uid || gEmail || 'guest'}
          customerName={user?.displayName || gName || 'Guest'}
          customerEmail={user?.email || gEmail || ''}
          appointmentId={hold?.id}
        />
      </div>
    </div>
  );
}
