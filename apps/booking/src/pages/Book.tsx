import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFirebase } from '@buenobrows/shared/useFirebase';
import type { Appointment, BusinessHours, Service, ConsentFormTemplate } from '@buenobrows/shared/types';
import type { AvailabilitySlot } from '@buenobrows/shared/availabilityHelpers';
import {
  watchServices,
  watchBusinessHours,
  findCustomerByEmail,
  createCustomer,
} from '@buenobrows/shared/firestoreActions';
import { availableSlotsFromAvailability } from '@buenobrows/shared/slotUtils';
import { watchAvailabilityByDay } from '@buenobrows/shared/availabilityHelpers';
import { isValidBookingDate, getNextValidBookingDate, getNextValidBookingDateAfter, formatNextAvailableDate } from '@buenobrows/shared/businessHoursUtils';
import { formatBusinessHoursForDate, isBusinessCurrentlyOpen } from '@buenobrows/shared/businessHoursFormatter';

import {
  createSlotHoldClient,
  releaseHoldClient,
  finalizeBookingFromHoldClient,
  getOrCreateSessionId,
  findOrCreateCustomerClient,
} from '@buenobrows/shared/functionsClient';

import {
  getActiveConsentForm,
  recordCustomerConsent,
  hasValidConsent,
} from '@buenobrows/shared/consentFormHelpers';

import { format, parseISO } from 'date-fns';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { isMagicLink, completeMagicLinkSignIn } from '@buenobrows/shared/authHelpers';
import CustomerMessaging from '../components/CustomerMessaging';
import ConsentForm from '../components/ConsentForm';

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

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    // Restore selected services from sessionStorage on mount
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        return cart.selectedServiceIds || [];
      } catch (e) {
        console.error('Failed to restore cart:', e);
      }
    }
    return [];
  });
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
    // Try to restore date from cart
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        if (cart.dateStr) return cart.dateStr;
      } catch (e) {
        console.error('Failed to restore date:', e);
      }
    }
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

  // Use availability collection instead of appointments for privacy
  const [bookedSlots, setBookedSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  
  useEffect(() => {
    setSlotsLoading(true);
    console.log('🔍 Querying availability for dayDate:', dayDate.toISOString());
    console.log('🔍 Day date local:', dayDate.toString());
    const unsubscribe = watchAvailabilityByDay(db, dayDate, (slots) => {
      console.log(`Loaded ${slots.length} booked slots for ${dayDate.toISOString().slice(0, 10)}`);
      console.log('Raw availability data:', slots);
      setBookedSlots(slots);
      setSlotsLoading(false);
    });
    return unsubscribe;
  }, [dayDate, db]);

  // slots for this day
  const slots = useMemo<Slot[]>(
    () => {
      if (!bh || selectedServices.length === 0) {
        return [];
      }
      
      const availableSlots = availableSlotsFromAvailability(dayDate, totalDuration, bh, bookedSlots);
      console.log(`Calculated ${availableSlots.length} available slots (${bookedSlots.length} booked slots)`);
      console.log('Booked slots:', bookedSlots.map(s => ({ start: s.start, end: s.end, status: s.status })));
      console.log('Available slots:', availableSlots);
      console.log('Day date:', dayDate.toISOString());
      console.log('Total duration:', totalDuration);
      
      return availableSlots.map((startISO) => ({
        startISO,
        resourceId: null,
      }));
    },
    [bh, selectedServices, totalDuration, bookedSlots, dayDate]
  );

  // ---------- Hold state (server-backed) ----------
  const sessionId = useMemo(getOrCreateSessionId, []);
  const [isCreatingHold, setIsCreatingHold] = useState(false);
  const lastHoldCreationRef = useRef<number>(0);
  const [chosen, setChosen] = useState<Slot | null>(() => {
    // Try to restore chosen slot from cart
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        if (cart.chosenSlot) return cart.chosenSlot;
      } catch (e) {
        console.error('Failed to restore chosen slot:', e);
      }
    }
    return null;
  });
  const [hold, setHold] = useState<Hold | null>(() => {
    // Try to restore hold from cart
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        if (cart.hold) {
          // Only restore if not expired AND has at least 30 seconds left
          const holdExpiry = new Date(cart.hold.expiresAt).getTime();
          const now = Date.now();
          const timeLeft = holdExpiry - now;
          
          // Don't restore if expired or about to expire (< 30 seconds)
          if (timeLeft > 30000) {
            console.log('Restoring hold with', Math.round(timeLeft/1000), 'seconds remaining');
            return cart.hold;
          } else {
            console.log('Hold expired or expiring soon, not restoring');
            // Clear the expired hold from storage
            const updatedCart = { ...cart, hold: null };
            sessionStorage.setItem('bb_booking_cart', JSON.stringify(updatedCart));
          }
        }
      } catch (e) {
        console.error('Failed to restore hold:', e);
      }
    }
    return null;
  });
  const [error, setError] = useState('');

  // Save booking cart to sessionStorage whenever selections change
  useEffect(() => {
    if (selectedServiceIds.length > 0 || dateStr || chosen || hold) {
      const cart = {
        selectedServiceIds,
        dateStr,
        chosenSlot: chosen,
        hold: hold, // Save hold so it persists through auth flow
        timestamp: Date.now(),
      };
      sessionStorage.setItem('bb_booking_cart', JSON.stringify(cart));
    }
  }, [selectedServiceIds, dateStr, chosen, hold]);

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

  // Cleanup hold when component unmounts
  useEffect(() => {
    return () => {
      if (hold) {
        console.log('Component unmounting, releasing hold:', hold.id);
        releaseHoldClient(hold.id).catch(e => console.warn('Failed to release hold on unmount:', e));
      }
    };
  }, [hold]);

  // reserve (create server hold) when a time is clicked
  async function pickSlot(slot: Slot) {
    // Prevent rapid-fire hold creation (debounce)
    const now = Date.now();
    if (now - lastHoldCreationRef.current < 1000) {
      console.log('🚫 Hold creation too soon after last one, ignoring');
      return;
    }
    
    // Prevent multiple simultaneous hold creation attempts
    if (isCreatingHold) {
      console.log('🚫 Hold creation already in progress, ignoring duplicate request');
      return;
    }
    
    // If we already have a valid hold for this exact slot, don't recreate
    if (hold && chosen?.startISO === slot.startISO && new Date(hold.expiresAt).getTime() > Date.now()) {
      console.log('🚫 Valid hold already exists for this slot');
      return;
    }
    
    // If we're clicking the same slot that's already chosen, don't recreate
    if (chosen?.startISO === slot.startISO) {
      console.log('🚫 Same slot already chosen, not recreating hold');
      return;
    }
    
    // Additional check: if we're already holding this exact slot, don't recreate
    if (hold && hold.id && slot.startISO === chosen?.startISO) {
      console.log('🚫 Already holding this exact slot, not recreating');
      return;
    }
    
    // If switching to a different slot, release the old hold first
    if (hold && chosen && chosen.startISO !== slot.startISO) {
      console.log('🔄 Switching slots, releasing old hold:', hold.id);
      console.log('🔄 Old slot:', chosen.startISO, '→ New slot:', slot.startISO);
      try {
        const releaseResult = await releaseHoldClient(hold.id);
        console.log('✅ Successfully released old hold:', releaseResult);
        setHold(null);
        // Small delay to ensure the hold is fully released
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('⏳ Waited 200ms for hold release to propagate');
      } catch (e) {
        console.warn('❌ Failed to release old hold:', e);
        setHold(null);
      }
    }
    
    setError('');
    setChosen(slot);
    setIsCreatingHold(true);
    
    try {
      console.log('🚀 Creating new hold for slot:', slot.startISO);
      console.log('🚀 Session ID:', sessionId);
      console.log('🚀 Service ID:', selectedServices[0]!.id);
      
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
      lastHoldCreationRef.current = Date.now();
      console.log('✅ Hold created/updated:', h.id);
    } catch (e: any) {
      console.error('Hold creation error:', e);
      // 409 errors might mean the hold already exists - this can happen after auth return
      // Don't treat this as a fatal error
      if (e?.message?.includes('409') || e?.code === 409) {
        console.log('Hold might already exist (409), will retry on next interaction');
        setError('Refreshing hold status...');
        // Don't clear chosen slot on 409, let user retry
      } else {
        setError(e?.message === 'E_OVERLAP' ? 'This time is no longer available.' : e?.message || 'Failed to hold slot.');
        setChosen(null);
      }
    } finally {
      setIsCreatingHold(false);
    }
  }

  // Track if we've already attempted to auto-recreate the hold
  const [hasAttemptedAutoRecreate, setHasAttemptedAutoRecreate] = useState(false);
  
  // Auto-recreate hold if we have a chosen slot but no valid hold (e.g., after auth return)
  useEffect(() => {
    // Only run once on mount if we have a chosen slot from sessionStorage but no hold
    // and we haven't already attempted this
    if (chosen && !hold && !isCreatingHold && !hasAttemptedAutoRecreate && selectedServices.length > 0 && slots.length > 0) {
      console.log('🔄 Restoring hold for previously selected slot after navigation');
      setHasAttemptedAutoRecreate(true);
      
      // Check if the chosen slot is still available in the current slots list
      const slotStillAvailable = slots.some(s => s.startISO === chosen.startISO);
      
      if (slotStillAvailable) {
        // Small delay to avoid race conditions with other initializations
        const timer = setTimeout(() => {
          console.log('🔄 Auto-restoring hold for slot:', chosen.startISO);
          pickSlot(chosen);
        }, 1000); // Increased delay to 1 second
        return () => clearTimeout(timer);
      } else {
        console.log('❌ Previously chosen slot is no longer available');
        setError('Your previously selected time is no longer available. Please choose another time.');
        setChosen(null);
        // Clear from storage
        const saved = sessionStorage.getItem('bb_booking_cart');
        if (saved) {
          try {
            const cart = JSON.parse(saved);
            const updatedCart = { ...cart, chosenSlot: null, hold: null };
            sessionStorage.setItem('bb_booking_cart', JSON.stringify(updatedCart));
          } catch (e) {
            console.error('Failed to clear unavailable slot:', e);
          }
        }
      }
    }
  }, [slots, chosen, hold, isCreatingHold, hasAttemptedAutoRecreate]); // Only run when these change

  // ---------- Auth / magic-link ----------
  const [user, setUser] = useState<User | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), [auth]);

  // Get customer ID when user changes
  useEffect(() => {
    if (user?.email) {
      findOrCreateCustomerClient({
        email: user.email,
        name: user.displayName || 'Customer',
        phone: undefined,
      }).then(result => {
        setCustomerId(result.customerId);
      }).catch(err => {
        console.error('Failed to get customer ID:', err);
      });
    } else {
      setCustomerId(null);
    }
  }, [user]);

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

  // ---------- Consent form ----------
  const [consentForm, setConsentForm] = useState<ConsentFormTemplate | null>(null);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasExistingConsent, setHasExistingConsent] = useState(false);

  // Load active consent form
  useEffect(() => {
    getActiveConsentForm(db, 'brow_services').then(form => {
      setConsentForm(form);
    }).catch(error => {
      console.warn('Failed to load consent form:', error);
      // Set to null so booking can proceed without consent form
      setConsentForm(null);
    });
  }, [db]);

  // Check if customer already has consent when customerId changes
  useEffect(() => {
    if (customerId) {
      hasValidConsent(db, customerId, 'brow_services').then(valid => {
        setHasExistingConsent(valid);
        setConsentGiven(valid);
      }).catch(error => {
        console.warn('Failed to check existing consent:', error);
        // Default to no existing consent
        setHasExistingConsent(false);
        setConsentGiven(false);
      });
    } else {
      setHasExistingConsent(false);
    }
  }, [customerId, db]);

  // ensure we use a Customers doc id (not auth uid)
  async function ensureCustomerId(): Promise<string> {
    // Signed in: use Cloud Function to find or create customer
    if (user?.email) {
      const result = await findOrCreateCustomerClient({
        email: user.email,
        name: user.displayName || 'Customer',
        phone: undefined,
      });
      return result.customerId;
    }
    // Guest path: use Cloud Function to find or create customer
    // Only phone number is required for guests
    if (gPhone) {
      const result = await findOrCreateCustomerClient({
        email: gEmail || undefined,
        name: gName || 'Guest',
        phone: gPhone,
      });
      
      // Log SMS consent if opted in
      if (smsConsent) {
        try {
          await addDoc(collection(db, 'sms_consents'), {
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
    throw new Error('Missing customer phone number.');
  }

  async function handleConsentAgree(signature: string) {
    if (!consentForm) return;
    
    try {
      // Get customer ID first (create guest customer if needed)
      const custId = await ensureCustomerId();
      
      // Record consent
      const consentData: any = {
        customerId: custId,
        customerName: user?.displayName || gName || 'Guest',
        consentFormId: consentForm.id,
        consentFormVersion: consentForm.version,
        consentFormCategory: consentForm.category,
        agreed: true,
        signature,
        userAgent: navigator.userAgent,
        consentedAt: new Date().toISOString(),
      };
      
      // Only include optional fields if they have values
      if (user?.email || gEmail) {
        consentData.customerEmail = user?.email || gEmail;
      }
      if (gPhone) {
        consentData.customerPhone = gPhone;
      }
      
      await recordCustomerConsent(db, consentData);
      
      setConsentGiven(true);
      setShowConsentForm(false);
      
      // Now proceed with booking
      await proceedWithBooking(custId);
    } catch (error: any) {
      console.error('Error recording consent:', error);
      setError('Failed to record consent. Please try again.');
    }
  }

  async function proceedWithBooking(customerId: string) {
    if (!hold || selectedServiceIds.length === 0 || !chosen) return;
    
    try {
      console.log('Calling finalizeBookingFromHoldClient...', {
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || undefined,
          email: user?.email || gEmail || undefined,
          phone: gPhone || undefined,
        },
        price: totalPrice,
      });
      
      const out = await finalizeBookingFromHoldClient({
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || undefined,
          email: user?.email || gEmail || undefined,
          phone: gPhone || undefined,
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

  async function finalizeBooking() {
    if (!hold || selectedServiceIds.length === 0 || !chosen) return;
    setError('');
    
    // Check if user is signed in or guest form is filled (only phone required for guests)
    if (!user && !gPhone) {
      setError('Please sign in or provide your phone number in the guest form below.');
      setGuestOpen(true); // Open guest form
      return;
    }
    
    try {
      console.log('Starting finalizeBooking...', { user: user?.email, gEmail, gName, gPhone });
      
      // If email-link verify is present
      if (!user && linkFlow && verifyEmail) {
        console.log('Completing magic link sign in...');
        await completeMagicLinkSignIn(verifyEmail);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      console.log('Ensuring customer ID...');
      const custId = await ensureCustomerId();
      console.log('Customer ID obtained:', custId);
      
      // Check if consent is required and not yet given
      const needsConsent = consentForm && !consentGiven;
      
      if (needsConsent) {
        // Show consent form instead of booking immediately
        setShowConsentForm(true);
        return;
      }
      
      // Proceed with booking if consent is already given or not required
      await proceedWithBooking(custId);
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
                            
                            // Release hold when services change
                            if (hold) {
                              console.log('Services changed, releasing hold:', hold.id);
                              releaseHoldClient(hold.id)
                                .then(() => console.log('Successfully released hold on service change'))
                                .catch(e => console.warn('Failed to release hold:', e));
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
                
                // Release hold when date changes
                if (hold) {
                  console.log('Date changed, releasing hold:', hold.id);
                  releaseHoldClient(hold.id)
                    .then(() => console.log('Successfully released hold on date change'))
                    .catch(e => console.warn('Failed to release hold:', e));
                }
                
                setChosen(null);
                setHold(null);
                
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
                disabled={isCreatingHold}
                className={`rounded-md border py-2 text-sm transition-colors ${
                  chosen?.startISO === slot.startISO 
                    ? 'bg-terracotta text-white' 
                    : isCreatingHold 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-cream'
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

                {!user ? (
                  <>
                    <button
                      className="rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60 hover:bg-terracotta/90"
                      onClick={() => nav('/login?returnTo=/book')}
                      disabled={!hold || holdExpired}
                    >
                      Sign in to book
                    </button>

                    <button
                      className="rounded-xl border border-terracotta/60 px-4 py-2 text-terracotta disabled:opacity-60 hover:bg-terracotta/10"
                      onClick={() => setGuestOpen((x) => !x)}
                      disabled={!hold || holdExpired}
                    >
                      Book as guest
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60 hover:bg-terracotta/90"
                    onClick={() => void finalizeBooking()}
                    disabled={!hold || holdExpired}
                  >
                    Book now
                  </button>
                )}
              </div>
            </div>

            {/* Guest quick form */}
            {guestOpen && hold && !holdExpired && (
              <div className="mt-3 grid gap-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    className="rounded-md border p-2"
                    placeholder="Full name (optional)"
                    value={gName}
                    onChange={(e) => setGName(e.target.value)}
                  />
                  <input
                    className="rounded-md border p-2"
                    placeholder="Email (optional)"
                    value={gEmail}
                    onChange={(e) => setGEmail(e.target.value)}
                    inputMode="email"
                    autoComplete="email"
                  />
                  <input
                    className="rounded-md border p-2 border-terracotta/50 bg-terracotta/5"
                    placeholder="Phone (required)*"
                    value={gPhone}
                    onChange={(e) => setGPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    required
                  />
                </div>
                
                <p className="text-xs text-slate-600 -mt-2">
                  * Phone number is required to confirm your booking and send you appointment reminders
                </p>
                
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
                    disabled={!gPhone}
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
      {user && customerId && (
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <CustomerMessaging
            customerId={customerId}
            customerName={user.displayName || 'Customer'}
            customerEmail={user.email || ''}
            appointmentId={hold?.id}
          />
        </div>
      )}

      {/* Consent Form Modal */}
      {consentForm && (
        <ConsentForm
          template={consentForm}
          customerName={user?.displayName || gName || 'Guest'}
          onAgree={handleConsentAgree}
          onDecline={() => {
            setShowConsentForm(false);
            setError('Consent is required to proceed with booking. Please review and accept the consent form.');
          }}
          isOpen={showConsentForm}
        />
      )}
    </div>
  );
}
