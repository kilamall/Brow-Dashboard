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
import { isValidBookingDate, getNextValidBookingDate, getNextValidBookingDateAfter, formatNextAvailableDate } from '@buenobrows/shared/businessHoursUtils';
import { formatBusinessHoursForDate, isBusinessCurrentlyOpen } from '@buenobrows/shared/businessHoursFormatter';

import {
  createSlotHoldClient,
  releaseHoldClient,
  finalizeBookingFromHoldClient,
  getOrCreateSessionId,
  findOrCreateCustomerClient,
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

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );
  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.duration, 0),
    [selectedServices]
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices]
  );

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    services.forEach((service) => {
      const category = service.category || 'Other Services';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
    });
    return groups;
  }, [services]);

  // Initialize with the next valid booking date
  const [dateStr, setDateStr] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });
  
  const dayDate = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);
  
  // Update to next valid date when business hours are loaded (only once)
  useEffect(() => {
    if (bh && selectedServices.length > 0) {
      const nextValidDate = getNextValidBookingDate(bh);
      if (nextValidDate) {
        const nextValidDateStr = nextValidDate.toISOString().slice(0, 10);
        setDateStr(nextValidDateStr);
      }
    }
  }, [bh, selectedServices]); // Removed dateStr from dependencies to prevent infinite loop

  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  useEffect(() => watchAppointmentsByDay(db, dayDate, setDayAppts), [dayDate]);

  // slots for this day
  const slots = useMemo<Slot[]>(
    () =>
      bh && selectedServices.length > 0
        ? availableSlotsForDay(dayDate, totalDuration, bh, dayAppts).map((startISO) => ({
            startISO,
            resourceId: null,
          }))
        : [],
    [bh, selectedServices, totalDuration, dayAppts, dayDate]
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
    
    try {
      // For multiple services, we'll use the first service ID for the hold
      // The actual services will be handled during finalization
      const h = await createSlotHoldClient({
        serviceId: selectedServices[0]!.id, // Use first service for hold
        startISO: slot.startISO,
        durationMinutes: totalDuration,
        sessionId,
        resourceId: slot.resourceId ?? null,
      });
      setHold({ id: h.id, expiresAt: h.expiresAt });
      console.log('Hold updated:', h.id);
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
  const [smsConsent, setSmsConsent] = useState(false);

  // ensure we use a Customers doc id (not auth uid)
  async function ensureCustomerId(): Promise<string> {
    // Signed in: use Cloud Function to find or create customer
    if (user?.email) {
      const result = await findOrCreateCustomerClient({
        email: user.email,
        name: user.displayName || 'Customer',
        phone: null,
      });
      return result.customerId;
    }
    // Guest path: use Cloud Function to find or create customer
    if (gEmail) {
      const result = await findOrCreateCustomerClient({
        email: gEmail,
        name: gName || 'Guest',
        phone: gPhone || null,
      });
      
      // Log SMS consent if opted in
      if (smsConsent && gPhone) {
        try {
          await db.collection('sms_consents').add({
            customerId: result.customerId,
            phone: gPhone,
            consentMethod: 'booking_form',
            timestamp: new Date().toISOString(),
            status: 'active',
            source: 'booking_form',
          });
        } catch (err) {
          console.error('Failed to log SMS consent:', err);
        }
      }
      
      return result.customerId;
    }
    throw new Error('Missing customer email.');
  }

  async function finalizeBooking() {
    if (!hold || selectedServiceIds.length === 0 || !chosen) return;
    setError('');
    
    // Check if user is signed in or guest form is filled
    if (!user && !gEmail) {
      setError('Please sign in or fill out the guest form below.');
      setGuestOpen(true); // Open guest form
      return;
    }
    
    try {
      console.log('Starting finalizeBooking...', { user: user?.email, gEmail, gName });
      
      // If email-link verify is present
      if (!user && linkFlow && verifyEmail) {
        console.log('Completing magic link sign in...');
        await completeMagicLinkSignIn(verifyEmail);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      console.log('Ensuring customer ID...');
      const customerId = await ensureCustomerId();
      console.log('Customer ID obtained:', customerId);
      
      console.log('Calling finalizeBookingFromHoldClient...', {
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || null,
          email: user?.email || gEmail || null,
          phone: gPhone || null,
        },
        price: totalPrice,
      });
      
      const out = await finalizeBookingFromHoldClient({
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || null,
          email: user?.email || gEmail || null,
          phone: gPhone || null,
        },
        price: totalPrice,
        autoConfirm: true,
      });
      
      console.log('Booking finalized successfully:', out);
      nav(`/confirmation?id=${encodeURIComponent(out.appointmentId)}`);
    } catch (e: any) {
      console.error('finalizeBooking error:', e);
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
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-serif text-xl">1. Choose Your Service(s)</h2>
        <p className="mb-6 text-sm text-slate-600">
          Select one or more services. You can combine multiple treatments in a single appointment.
        </p>
        
        <div className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category}>
              {/* Category Header */}
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span className="h-px flex-grow bg-gradient-to-r from-terracotta/40 to-transparent"></span>
                <span>{category}</span>
                <span className="h-px flex-grow bg-gradient-to-l from-terracotta/40 to-transparent"></span>
              </h3>
              
              {/* Services in Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                {categoryServices.map((s) => (
                  <label
                    key={s.id}
                    className={`group cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      selectedServiceIds.includes(s.id) 
                        ? 'border-terracotta bg-terracotta/5 shadow-md' 
                        : 'border-slate-200 hover:border-terracotta/40 hover:bg-cream/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServiceIds(prev => [...prev, s.id]);
                            } else {
                              setSelectedServiceIds(prev => prev.filter(id => id !== s.id));
                            }
                            setChosen(null);
                            setHold(null);
                            setError('');
                          }}
                          className="h-5 w-5 rounded border-slate-300 text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                      </div>
                      
                      {/* Service Info */}
                      <div className="flex-grow">
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900">{s.name}</h4>
                        </div>
                        
                        {s.description && (
                          <p className="mb-2 text-sm text-slate-600">{s.description}</p>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {s.duration} min
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-terracotta">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${s.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <div className="mt-6 rounded-xl bg-gradient-to-br from-terracotta/10 to-cream/50 p-5 border-2 border-terracotta/30">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="font-semibold text-slate-900">
                Your Selection ({selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'})
              </h4>
            </div>
            
            <div className="mb-4 space-y-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
                  <span className="font-medium text-slate-800">{service.name}</span>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>{service.duration}m</span>
                    <span className="font-semibold text-terracotta">${service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-lg bg-white/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Total Duration:</span>
                <span className="font-semibold text-slate-900">{totalDuration} minutes</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Total Price:</span>
                <span className="text-xl font-bold text-terracotta">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Date & time */}
      <div className="rounded-xl bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-medium">2. Pick date & time</h2>
        
        {/* Business Hours Display */}
        {bh && (
          <div className="mb-3 p-3 bg-slate-50 rounded-lg border-l-4 border-terracotta">
            <div className="text-sm text-slate-700">
              <div className="font-medium text-slate-900 mb-1">
                {dayDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-slate-600">
                {isValidBookingDate(dayDate, bh) ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Open: {formatBusinessHoursForDate(dayDate, bh)}
                    </span>
                    {dayDate.toDateString() === new Date().toDateString() && isBusinessCurrentlyOpen(bh) && (
                      <span className="ml-2 text-green-600 font-medium">• Currently Open</span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Closed
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600">
            Date
            <input
              type="date"
              className="ml-2 rounded-md border p-2"
              value={dateStr}
              min={new Date().toISOString().slice(0, 10)}
              max={(() => {
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + 90);
                return maxDate.toISOString().slice(0, 10);
              })()}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                // Always update the date string to show the selected date
                setDateStr(e.target.value);
                setChosen(null);
                if (hold) setHold(null);
                
                // Clear any previous errors - the top display will show the status
                setError('');
              }}
            />
          </label>
          {selectedServices.length > 0 && (
            <div className="text-sm text-slate-600">
              Duration: {totalDuration} min
              {selectedServices.length > 1 && (
                <span className="ml-2 text-xs text-slate-500">
                  ({selectedServices.length} services)
                </span>
              )}
            </div>
          )}
        </div>

        {/* time grid */}
        <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
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
              <div className="col-span-4 text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-sm">
                  {!bh ? 'Loading availability...' : 
                   selectedServices.length === 0 ? 'Please select at least one service first' :
                   !isValidBookingDate(dayDate, bh) ? (
                     <>
                       <span className="text-red-600">Sorry, we are closed on this date.</span>
                       {(() => {
                         const nextAvailable = getNextValidBookingDateAfter(dayDate, bh);
                         if (nextAvailable) {
                           const nextDateStr = formatNextAvailableDate(nextAvailable);
                           return (
                             <span className="block mt-1">
                               Our next available day is <span className="font-medium text-slate-700">{nextDateStr}</span>.
                             </span>
                           );
                         }
                         return null;
                       })()}
                     </>
                   ) : 'No available time slots for this date'}
                </p>
                {!isValidBookingDate(dayDate, bh) && (
                  <p className="text-xs mt-2 text-slate-400">
                    Please select a date when we are open for business
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* action bar */}
        {chosen && selectedServices.length > 0 && (
          <div className="mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-600">You’re holding</div>
                <div className="font-serif text-lg">
                  {selectedServices.length === 1 
                    ? `${selectedServices[0].name} • ${prettyTime(chosen.startISO)}`
                    : `${selectedServices.length} Services • ${prettyTime(chosen.startISO)}`
                  }
                </div>
                {selectedServices.length > 1 && (
                  <div className="text-xs text-slate-500 mt-1">
                    {selectedServices.map(s => s.name).join(', ')}
                  </div>
                )}
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
              <div className="mt-3 grid gap-3">
                <div className="grid gap-2 sm:grid-cols-3">
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
                </div>
                
                {/* SMS Consent */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-xs text-slate-700">
                      <strong>Opt-in to SMS messages:</strong> I agree to receive automated text messages from Bueno Brows at <strong>(650) 613-8455</strong> for appointment confirmations, reminders, and updates. Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> to opt out anytime, <strong>HELP</strong> for assistance. Responses may be automated by our AI assistant.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end">
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

      {/* Customer Messaging Widget - Only for authenticated users */}
      {user && (
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <CustomerMessaging
            customerId={user.uid}
            customerName={user.displayName || 'Customer'}
            customerEmail={user.email || ''}
            appointmentId={hold?.id}
          />
        </div>
      )}
    </div>
  );
}
