import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useFirebase } from '@buenobrows/shared/useFirebase';
import SEO from '../components/SEO';
import type { Appointment, BusinessHours, Service, ConsentFormTemplate, DayClosure, SpecialHours, Promotion, Customer, Guest, ServiceAssignment } from '@buenobrows/shared/types';
import type { AvailabilitySlot } from '@buenobrows/shared/availabilityHelpers';
import {
  watchServices,
  watchBusinessHours,
  watchDayClosures,
  watchSpecialHours,
  findCustomerByEmail,
  createCustomer,
  updateCustomer,
  watchPromotions,
} from '@buenobrows/shared/firestoreActions';
import { findApplicablePromotions, calculateDiscount } from '@buenobrows/shared/promotionUtils';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';
import { watchAvailabilityByDay } from '@buenobrows/shared/availabilityHelpers';
import { isValidBookingDate, isValidBookingDateWithSpecialHours, getNextValidBookingDate, getNextValidBookingDateAfter, formatNextAvailableDate } from '@buenobrows/shared/businessHoursUtils';
import { formatBusinessHoursForDate, formatBusinessHoursForDateWithSpecialHours, isBusinessCurrentlyOpen } from '@buenobrows/shared/businessHoursFormatter';

import {
  createSlotHoldClient,
  releaseHoldClient,
  finalizeBookingFromHoldClient,
  getOrCreateSessionId,
  findOrCreateCustomerClient,
} from '@buenobrows/shared/functionsClient';
import { getFunctions, httpsCallable } from 'firebase/functions';

import {
  getActiveConsentForm,
  recordCustomerConsent,
  hasValidConsent,
  getRequiredConsentCategory,
  hasPreviousAppointments,
  recordQuickUpdateConsent,
} from '@buenobrows/shared/consentFormHelpers';

import { format } from 'date-fns';
import { getAuth, onAuthStateChanged, type User, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { isMagicLink, completeMagicLinkSignIn } from '@buenobrows/shared/authHelpers';
import CustomerMessaging from '../components/CustomerMessaging';
import ConsentForm from '../components/ConsentForm';
import QuickUpdateConsentForm from '../components/QuickUpdateConsentForm';

type Slot = { startISO: string; endISO?: string; resourceId?: string | null };
type Hold = { id: string; expiresAt: string; status?: string }; // from Cloud Function

export default function Book() {
  const { db } = useFirebase();
  const nav = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  
  // Get prepopulated data from navigation state
  const locationState = location.state as {
    preselectedServiceId?: string;
    prefillCustomer?: { name?: string; email?: string; phone?: string };
    initialDate?: string;
  } | null;
  
  // Clear old holds from sessionStorage that don't have status field
  useEffect(() => {
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        if (cart.hold && cart.hold.status === undefined) {
          console.log('Clearing old hold without status field');
          const updatedCart = { ...cart, hold: null };
          sessionStorage.setItem('bb_booking_cart', JSON.stringify(updatedCart));
        }
      } catch (e) {
        console.error('Failed to clean old holds:', e);
      }
    }
  }, []);

  // ---------- Data ----------
  const [services, setServices] = useState<Service[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  const [bhError, setBhError] = useState<string | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  // Restore promo code from sessionStorage on mount
  const [enteredPromoCode, setEnteredPromoCode] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('bb_booking_cart');
      if (saved) {
        const cart = JSON.parse(saved);
        return cart.enteredPromoCode || '';
      }
    } catch (e) {
      console.error('Failed to restore promo code:', e);
    }
    return '';
  });
  
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  
  // Save promo code to sessionStorage whenever it changes
  useEffect(() => {
    const saved = sessionStorage.getItem('bb_booking_cart');
    try {
      const cart = saved ? JSON.parse(saved) : {};
      cart.enteredPromoCode = enteredPromoCode;
      sessionStorage.setItem('bb_booking_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save promo code:', e);
    }
  }, [enteredPromoCode]);
  
  // Verification settings
  const [verificationSettings, setVerificationSettings] = useState<{
    emailVerificationEnabled: boolean;
    smsVerificationEnabled: boolean;
    requireVerification: boolean;
    useFirebasePhoneAuth: boolean;
  } | null>(null);
  
  useEffect(() => {
    if (!db) {
      setServicesError('Unable to connect to database');
      return;
    }
    try {
      const unsubscribe = watchServices(db, { activeOnly: true }, (servicesList) => {
        // Filter out "Events" category services from the Book page
        const bookableServices = (servicesList || []).filter(
          (s) => !s.category || s.category.toLowerCase() !== 'events'
        );
        setServices(bookableServices);
        setServicesError(null);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('Error loading services:', error);
      setServicesError('Unable to load services. Please refresh the page.');
    }
  }, [db]);
  
  useEffect(() => {
    if (!db) {
      setBhError('Unable to connect to database');
      return;
    }
    try {
      const unsubscribe = watchBusinessHours(db, (businessHours) => {
        setBh(businessHours);
        setBhError(null);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('Error loading business hours:', error);
      setBhError('Unable to load booking schedule. Please refresh the page.');
    }
  }, [db]);

  // Load closures and special hours
  useEffect(() => {
    if (!db) return;
    const unsubClosures = watchDayClosures(db, setClosures);
    const unsubSpecialHours = watchSpecialHours(db, setSpecialHours);
    return () => {
      unsubClosures();
      unsubSpecialHours();
    };
  }, [db]);

  // Debug logging for closures and special hours
  useEffect(() => {
    console.log('[Book] Closures loaded:', closures);
    console.log('[Book] Special hours loaded:', specialHours);
  }, [closures, specialHours]);

  // Load verification settings
  useEffect(() => {
    if (!db) return;
    
    const loadVerificationSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'verification'));
        if (settingsDoc.exists()) {
          setVerificationSettings(settingsDoc.data() as any);
        } else {
          // Default settings if not configured
          setVerificationSettings({
            emailVerificationEnabled: true,
            smsVerificationEnabled: true,
            requireVerification: true,
            useFirebasePhoneAuth: false
          });
        }
      } catch (error) {
        console.error('Error loading verification settings:', error);
        // Default settings on error
        setVerificationSettings({
          emailVerificationEnabled: true,
          smsVerificationEnabled: true,
          requireVerification: true,
          useFirebasePhoneAuth: false
        });
      }
    };

    loadVerificationSettings();
  }, [db]);

  // Multi-guest booking state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [serviceAssignments, setServiceAssignments] = useState<Record<string, ServiceAssignment>>({});
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showGuestAssignment, setShowGuestAssignment] = useState(false);
  const [pendingServiceAssignment, setPendingServiceAssignment] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');

  // Initialize "self" guest for authenticated users
  useEffect(() => {
    if (user && guests.length === 0) {
      setGuests([{
        id: 'self',
        name: user.displayName || user.email || 'You',
        email: user.email || undefined,
        phone: user.phoneNumber || undefined,
        isSelf: true
      }]);
    }
  }, [user, guests.length]);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    // Check for preselected service from navigation state first
    if (locationState?.preselectedServiceId) {
      return [locationState.preselectedServiceId];
    }
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  // Legacy: selected services based on selectedServiceIds (for backwards compatibility)
  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );
  
  // New: Calculate totals based on serviceAssignments (with quantities)
  const hasAssignments = Object.keys(serviceAssignments).length > 0;
  
  const totalDuration = useMemo(() => {
    if (hasAssignments) {
      // Use quantity-based calculation
      return Object.values(serviceAssignments).reduce((sum, assignment) => {
        const service = services.find(s => s.id === assignment.serviceId);
        return sum + (service ? service.duration * assignment.quantity : 0);
      }, 0);
    } else {
      // Fall back to legacy calculation
      return selectedServices.reduce((sum, service) => sum + service.duration, 0);
    }
  }, [hasAssignments, serviceAssignments, services, selectedServices]);
  
  const subtotalPrice = useMemo(() => {
    if (hasAssignments) {
      // Use quantity-based calculation
      return Object.values(serviceAssignments).reduce((sum, assignment) => {
        const service = services.find(s => s.id === assignment.serviceId);
        return sum + (service ? service.price * assignment.quantity : 0);
      }, 0);
    } else {
      // Fall back to legacy calculation
      return selectedServices.reduce((sum, service) => sum + service.price, 0);
    }
  }, [hasAssignments, serviceAssignments, services, selectedServices]);

  // Watch promotions
  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchPromotions(db, setPromotions);
    return unsubscribe;
  }, [db]);

  // Calculate applicable promotions (state only, useEffect moved below after gEmail/gPhone declared)
  const [appliedPromotions, setAppliedPromotions] = useState<Promotion[]>([]);

  // Calculate total discount
  const totalDiscount = useMemo(() => {
    return appliedPromotions.reduce((sum, promo) => {
      const discount = calculateDiscount(promo, subtotalPrice, selectedServices);
      return sum + discount;
    }, 0);
  }, [appliedPromotions, subtotalPrice, selectedServices]);

  const totalPrice = useMemo(
    () => Math.max(0, subtotalPrice - totalDiscount),
    [subtotalPrice, totalDiscount]
  );

  // Helper function to truncate description for mobile
  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (!description) return 'Beautiful brows, tailored to you.';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  // Handle service details modal
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setSelectedService(null);
  };

  // Multi-guest booking: Quantity and assignment functions
  function increaseQuantity(serviceId: string) {
    // Read CURRENT state first
    const current = serviceAssignments[serviceId] || {
      serviceId,
      quantity: 0,
      guestAssignments: []
    };
    
    // Calculate what the NEW quantity will be
    const newQuantity = current.quantity + 1;
    
    // Case 1: First selection and user is authenticated -> assign to self
    if (newQuantity === 1 && user) {
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          serviceId,
          quantity: 1,
          guestAssignments: [{ guestId: 'self', serviceId }]
        }
      });
      return;
    }
    
    // Case 2: Additional quantity -> need guest assignment
    if (newQuantity > 1) {
      // Check which guests are already assigned to this service
      const assignedGuestIds = current.guestAssignments.map(ga => ga.guestId);
      const availableGuests = guests.filter(g => !assignedGuestIds.includes(g.id));
      
      if (availableGuests.length === 1) {
        // Only one available guest, auto-assign
        setServiceAssignments({
          ...serviceAssignments,
          [serviceId]: {
            serviceId,
            quantity: newQuantity,
            guestAssignments: [
              ...current.guestAssignments,
              { guestId: availableGuests[0].id, serviceId }
            ]
          }
        });
      } else {
        // Multiple options or no guests available, show assignment prompt
        // First, update quantity without assignment
        setServiceAssignments({
          ...serviceAssignments,
          [serviceId]: {
            ...current,
            quantity: newQuantity,
            guestAssignments: current.guestAssignments // Keep existing assignments
          }
        });
        // Then show prompt for the unassigned slot
        setPendingServiceAssignment(serviceId);
        setShowGuestAssignment(true);
      }
    }
    
    // Case 3: First selection, not authenticated (guest user)
    if (newQuantity === 1 && !user) {
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          serviceId,
          quantity: 1,
          guestAssignments: [{ guestId: 'guest', serviceId }]
        }
      });
    }
  }

  function decreaseQuantity(serviceId: string) {
    const current = serviceAssignments[serviceId];
    if (!current || current.quantity <= 0) return;
    
    const newQuantity = current.quantity - 1;
    
    if (newQuantity === 0) {
      // Remove service entirely
      const { [serviceId]: removed, ...rest } = serviceAssignments;
      setServiceAssignments(rest);
    } else {
      // Remove last guest assignment
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          ...current,
          quantity: newQuantity,
          guestAssignments: current.guestAssignments.slice(0, -1)
        }
      });
    }
  }

  function assignServiceToGuest(serviceId: string, guestId: string) {
    const current = serviceAssignments[serviceId];
    if (!current) return;
    
    // Add assignment for this guest
    setServiceAssignments({
      ...serviceAssignments,
      [serviceId]: {
        ...current,
        guestAssignments: [
          ...current.guestAssignments,
          { guestId, serviceId }
        ]
      }
    });
    
    // Close assignment modal
    setShowGuestAssignment(false);
    setPendingServiceAssignment(null);
  }

  function removeGuest(guestId: string) {
    // Don't allow removing self
    if (guestId === 'self') return;
    
    // Remove guest from list
    setGuests(guests.filter(g => g.id !== guestId));
    
    // Remove all service assignments for this guest
    const updatedAssignments: Record<string, ServiceAssignment> = {};
    Object.entries(serviceAssignments).forEach(([sId, assignment]) => {
      const filteredAssignments = assignment.guestAssignments.filter(ga => ga.guestId !== guestId);
      if (filteredAssignments.length > 0) {
        updatedAssignments[sId] = {
          ...assignment,
          quantity: filteredAssignments.length,
          guestAssignments: filteredAssignments
        };
      }
    });
    setServiceAssignments(updatedAssignments);
  }

  function addGuest() {
    if (!newGuestName.trim()) return;
    
    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuestName.trim(),
      email: newGuestEmail.trim() || undefined,
      phone: newGuestPhone.trim() || undefined,
      isSelf: false
    };
    
    setGuests([...guests, newGuest]);
    setShowAddGuestModal(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    
    // If there's a pending service assignment, assign it to this guest
    if (pendingServiceAssignment) {
      assignServiceToGuest(pendingServiceAssignment, newGuest.id);
    }
  }

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
    // Check for initial date from navigation state first
    if (locationState?.initialDate) {
      return locationState.initialDate;
    }
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
  
  // Create date as UTC noon to ensure consistent date regardless of viewer's timezone
  const dayDate = useMemo(() => new Date(dateStr + 'T12:00:00Z'), [dateStr]);
  
  // Track if we've initialized the date from business hours
  const [hasInitializedDate, setHasInitializedDate] = useState(() => {
    // If we restored a date from storage, consider it initialized
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        return !!cart.dateStr;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  // Update to next valid date when business hours are loaded (only once, and only if not restored from storage)
  useEffect(() => {
    if (bh && selectedServices.length > 0 && !hasInitializedDate) {
      // Use getNextValidBookingDateAfter starting from today/of yesterday to respect special hours
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const nextValidDate = getNextValidBookingDateAfter(yesterday, bh, closures, specialHours);
      if (nextValidDate) {
        const nextValidDateStr = nextValidDate.toISOString().slice(0, 10);
        setDateStr(nextValidDateStr);
        setHasInitializedDate(true);
      }
    }
  }, [bh, selectedServices, hasInitializedDate, closures, specialHours]); // Now we track initialization

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
      
      console.log('[Book] Calculating slots for date:', dayDate.toISOString());
      console.log('[Book] Business hours:', bh);
      console.log('[Book] Closures:', closures);
      console.log('[Book] Special hours:', specialHours);
      console.log('[Book] Booked slots:', bookedSlots.length);
      
      const availableSlots = availableSlotsForDay(dayDate, totalDuration, bh, bookedSlots, closures, specialHours);
      console.log(`[Book] Calculated ${availableSlots.length} available slots (${bookedSlots.length} booked slots)`);
      console.log('[Book] Available slots:', availableSlots);
      console.log('[Book] Day date:', dayDate.toISOString());
      console.log('[Book] Total duration:', totalDuration);
      
      return availableSlots.map((startISO) => ({
        startISO,
        resourceId: null,
      }));
    },
    [bh, selectedServices, totalDuration, bookedSlots, dayDate, closures, specialHours]
  );

  // ---------- Hold state (server-backed) ----------
  const sessionId = useMemo(getOrCreateSessionId, []);
  const [isCreatingHold, setIsCreatingHold] = useState(false);
  const [lastHoldAttempt, setLastHoldAttempt] = useState<number>(0);
  const isFinalizingRef = useRef(false);
  const lastHoldCreationRef = useRef<number>(0);
  const isCreatingHoldRef = useRef<boolean>(false);
  const [chosen, setChosen] = useState<Slot | null>(() => {
    // Try to restore chosen slot from cart, but only if recent enough to be valid
    const HOLD_TTL_MS = 2 * 60 * 1000; // keep in sync with server hold duration
    const RESTORE_GRACE_MS = 30 * 1000; // do not restore if near-expiry
    const saved = sessionStorage.getItem('bb_booking_cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        if (cart.chosenSlot) {
          const ts = typeof cart.timestamp === 'number' ? cart.timestamp : 0;
          const age = Date.now() - ts;
          // Only restore chosen slot if cart is recent enough so auto-recreate won't race on an expired hold
          if (age < (HOLD_TTL_MS - RESTORE_GRACE_MS)) {
            return cart.chosenSlot;
          } else {
            // Clear stale chosen/hold from storage so UI doesn't try to remount it
            const updatedCart = { ...cart, chosenSlot: null, hold: null };
            sessionStorage.setItem('bb_booking_cart', JSON.stringify(updatedCart));
          }
        }
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
          // Only restore if not expired AND has at least 30 seconds left AND status is active
          const holdExpiry = new Date(cart.hold.expiresAt).getTime();
          const now = Date.now();
          const timeLeft = holdExpiry - now;
          const isActive = !cart.hold.status || cart.hold.status === 'active';
          
          // Don't restore if expired, about to expire (< 30 seconds), or not active
          if (timeLeft > 30000 && isActive) {
            console.log('Restoring hold with', Math.round(timeLeft/1000), 'seconds remaining');
            return cart.hold;
          } else {
            console.log('Hold expired, expiring soon, or not active - not restoring');
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Toggle category collapse state
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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

  // Cleanup hold when component unmounts (but not during finalization)
  useEffect(() => {
    return () => {
      if (hold && !isFinalizingRef.current) {
        console.log('Component unmounting, releasing hold:', hold.id);
        releaseHoldClient(hold.id).catch(e => console.warn('Failed to release hold on unmount:', e));
      } else if (hold && isFinalizingRef.current) {
        console.log('Component unmounting during finalization, keeping hold:', hold.id);
      }
    };
  }, [hold]);

  // reserve (create server hold) when a time is clicked
  async function pickSlot(slot: Slot) {
    // CRITICAL: Check ref-based lock FIRST before any async operations
    if (isCreatingHoldRef.current) {
      console.log('🚫 Hold creation already in progress (ref check), ignoring duplicate request');
      return;
    }
    
    // Prevent rapid-fire hold creation (debounce)
    const now = Date.now();
    if (now - lastHoldCreationRef.current < 1000) {
      console.log('🚫 Hold creation too soon after last one, ignoring');
      return;
    }
    
    // Prevent multiple simultaneous hold creation attempts
    if (isCreatingHold) {
      console.log('🚫 Hold creation already in progress (state check), ignoring duplicate request');
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
    
    // SET LOCK IMMEDIATELY before any async operations
    isCreatingHoldRef.current = true;
    lastHoldCreationRef.current = now;
    setIsCreatingHold(true);
    
    try {
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
      
      // Rate limiting: prevent too many hold creation attempts
      const now = Date.now();
      if (now - lastHoldAttempt < 2000) { // 2 second cooldown
        console.log('🚫 Hold creation too soon after last one, ignoring');
        return;
      }
      setLastHoldAttempt(now);
      
      // Check if slot is already booked in availability data
      const slotStartMs = new Date(slot.startISO).getTime();
      const slotEndMs = slotStartMs + totalDuration * 60000;
      const isAlreadyBooked = bookedSlots.some(bs => {
        const bsStart = new Date(bs.start).getTime();
        const bsEnd = new Date(bs.end).getTime();
        return bs.status === 'booked' && bsStart < slotEndMs && bsEnd > slotStartMs;
      });
      
      if (isAlreadyBooked) {
        console.log('❌ Slot is already booked in availability data');
        setError('This time is no longer available. Please select another time.');
        setChosen(null);
        return;
      }
      
      console.log('🚀 Creating new hold for slot:', slot.startISO);
      console.log('🚀 Session ID:', sessionId);
      console.log('🚀 Service ID:', selectedServices[0]!.id);
      console.log('🚀 Slot details:', {
        startISO: slot.startISO,
        endISO: slot.endISO,
        totalDuration,
        calculatedEndISO: slot.endISO || new Date(new Date(slot.startISO).getTime() + totalDuration * 60000).toISOString()
      });
      
      // For multiple services, we'll use the first service ID for the hold
      // The actual services will be handled during finalization
      const h = await createSlotHoldClient({
        serviceId: selectedServices[0]!.id, // Use first service for hold
        startISO: slot.startISO,
        endISO: slot.endISO || new Date(new Date(slot.startISO).getTime() + totalDuration * 60000).toISOString(),
        sessionId,
        userId: user?.uid || undefined, // ✅ CRITICAL: Link hold to authenticated user
      });
      setHold({ id: h.id, expiresAt: h.expiresAt, status: h.status });
      console.log('✅ Hold created/updated:', h.id, 'status:', h.status);
    } catch (e: any) {
      console.error('Hold creation error:', e);
      // 409 errors might mean the hold already exists - this can happen after auth return
      // Don't treat this as a fatal error
      if (e?.message?.includes('409') || e?.code === 409 || e?.message === 'E_OVERLAP') {
        console.log('❌ Time slot conflict - slot is already held or booked');
        setError('This time slot is no longer available. Please wait a moment before selecting another time, or try a different slot.');
        setChosen(null);
      } else if (e?.message?.includes('Too many requests')) {
        console.log('🚫 Rate limited - too many hold creation attempts');
        setError('Please wait a moment before selecting another time. You\'re creating holds too quickly.');
        setChosen(null);
      } else {
        setError(e?.message || 'Failed to hold slot. Please try again.');
        setChosen(null);
      }
    } finally {
      // ALWAYS clear locks in finally block
      isCreatingHoldRef.current = false;
      setIsCreatingHold(false);
    }
  }

  // Track if we've already attempted to auto-recreate the hold
  const [hasAttemptedAutoRecreate, setHasAttemptedAutoRecreate] = useState(false);
  const [isRestoringHold, setIsRestoringHold] = useState(false);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  
  // Auto-recreate hold if we have a chosen slot but no valid hold (e.g., after auth return)
  useEffect(() => {
    // Only run once on mount if we have a chosen slot from sessionStorage but no hold
    // and we haven't already attempted this
    if (chosen && !hold && !isCreatingHold && !isRestoringHold && !hasAttemptedAutoRecreate && selectedServices.length > 0 && slots.length > 0) {
      // Guard: if the saved cart is older than hold TTL, skip restoration to avoid freezing UI
      const HOLD_TTL_MS = 2 * 60 * 1000;
      const RESTORE_GRACE_MS = 30 * 1000;
      try {
        const saved = sessionStorage.getItem('bb_booking_cart');
        if (saved) {
          const cart = JSON.parse(saved);
          const ts = typeof cart.timestamp === 'number' ? cart.timestamp : 0;
          const age = Date.now() - ts;
          if (age >= (HOLD_TTL_MS - RESTORE_GRACE_MS)) {
            console.log('⏱️ Saved booking cart is stale; skipping hold restoration');
            setError('Your previous hold expired while you were away. Please select the time again. Your promotion code will still apply.');
            // Keep promotions intact - don't clear them when hold expires
            setChosen(null);
            setIsRestoringHold(false);
            const updatedCart = { ...cart, chosenSlot: null, hold: null };
            sessionStorage.setItem('bb_booking_cart', JSON.stringify(updatedCart));
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to read cart for restoration guard:', e);
      }
      console.log('🔄 Restoring hold for previously selected slot after navigation');
      setHasAttemptedAutoRecreate(true);
      setIsRestoringHold(true);
      
      // Check if the chosen slot is still available in the current slots list
      const slotStillAvailable = slots.some(s => s.startISO === chosen.startISO);
      
      if (slotStillAvailable) {
        // Small delay to avoid race conditions with other initializations
        const timer = setTimeout(async () => {
          console.log('🔄 Auto-restoring hold for slot:', chosen.startISO);
          try {
            await pickSlot(chosen);
            console.log('✅ Hold restoration completed successfully');
          } catch (error) {
            console.error('❌ Hold restoration failed:', error);
            setError('Failed to restore your booking. Please select the time again.');
            setChosen(null);
          } finally {
            setIsRestoringHold(false);
            // Scroll to the booking form after a short delay
            setTimeout(() => {
              bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }, 500); // Reduced delay to 500ms for better UX
        
        // Safety timeout to ensure loading state is cleared
        const safetyTimer = setTimeout(() => {
          console.log('⚠️ Safety timeout: clearing restoration loading state');
          setIsRestoringHold(false);
        }, 10000); // 10 second safety timeout
        return () => {
          clearTimeout(timer);
          clearTimeout(safetyTimer);
          setIsRestoringHold(false);
        };
      } else {
        console.log('❌ Previously chosen slot is no longer available');
        setError('Your previously selected time is no longer available. Please choose another time.');
        setChosen(null);
        setIsRestoringHold(false);
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
  }, [slots, chosen, hold, isCreatingHold, hasAttemptedAutoRecreate, selectedServices]); // Added selectedServices dependency

  // ---------- Auth / magic-link ----------
  const [user, setUser] = useState<User | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const prevUserRef = useRef<User | null>(null);
  
  // Profile completion modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    birthday: '',
    phone: '',
    email: ''
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const prevUser = prevUserRef.current;
      
      // Detect if user signed in mid-booking (went from null to authenticated)
      if (!prevUser && currentUser && hold) {
        console.log('⚠️ User signed in mid-booking, clearing hold to prevent conflicts');
        // Clear the hold since it was created under guest session
        if (hold?.id) {
          releaseHoldClient(hold.id).catch(e => console.warn('Failed to release hold after auth:', e));
        }
        setHold(null);
        // Show a message to user to re-select the time
        setError('Please select your time slot again to continue with your booking.');
      }
      
      prevUserRef.current = currentUser;
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, [auth, hold]);

  // Get customer ID when user changes
  useEffect(() => {
    if (user?.email || user?.phoneNumber) {
      // IMPORTANT: Always pass authUid for authenticated users to prevent duplicate profiles
      findOrCreateCustomerClient({
        email: user.email || undefined,
        name: user.displayName || 'Customer',
        phone: user.phoneNumber || undefined,
        authUid: user.uid, // Always pass authUid for authenticated users
      }).then(result => {
        setCustomerId(result.customerId);
      }).catch(err => {
        console.error('Failed to get customer ID:', err);
        // Don't retry on rate limit errors
        if (err.code !== 'functions/too-many-requests') {
          console.log('Will retry on next user change');
        }
      });
    } else {
      setCustomerId(null);
    }
  }, [user?.uid, user?.email, user?.phoneNumber, user?.displayName]); // More specific dependencies

  // Get customer data for promotions (real-time listener)
  useEffect(() => {
    if (!db || !user) {
      setCustomer(null);
      return;
    }
    
    const customerRef = doc(db, 'customers', user.uid);
    const unsubscribe = onSnapshot(customerRef, (snapshot) => {
      if (snapshot.exists()) {
        const customerData = { id: snapshot.id, ...snapshot.data() } as Customer;
        setCustomer(customerData);
      } else {
        setCustomer(null);
      }
    }, (error) => {
      console.error('Error watching customer:', error);
      setCustomer(null);
    });
    
    return unsubscribe;
  }, [db, user]);

  // Initialize "self" guest for authenticated users
  useEffect(() => {
    if (user && guests.length === 0) {
      // Initialize with self as first guest
      setGuests([{
        id: 'self',
        name: user.displayName || user.email || 'You',
        email: user.email || undefined,
        phone: user.phoneNumber || undefined,
        isSelf: true
      }]);
    } else if (!user && guests.some(g => g.id === 'self')) {
      // Remove self guest if user logs out
      setGuests(guests.filter(g => g.id !== 'self'));
    }
  }, [user, user?.displayName, user?.email, user?.phoneNumber]);

  // Check if customer profile is complete and show prompt if missing fields
  useEffect(() => {
    if (!customerId || !db || !user) return;
    
    const checkProfileCompleteness = async () => {
      try {
        // Check if we've already shown the modal in this session
        const shownKey = `bb_profile_completion_shown_${customerId}`;
        if (sessionStorage.getItem(shownKey)) {
          return;
        }

        // Get customer data
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (customerDoc.exists()) {
          const data = customerDoc.data() as Customer;
          setCustomerData(data);
          
          // Determine which fields are missing
          const missing: string[] = [];
          if (!data.birthday) missing.push('birthday');
          // For authenticated users, check if they need to add missing contact info
          if (!data.phone && !user.phoneNumber) missing.push('phone');
          if (!data.email && !user.email) missing.push('email');
          
          if (missing.length > 0) {
            setMissingFields(missing);
            setProfileFormData({
              birthday: data.birthday || '',
              phone: data.phone || user.phoneNumber || '',
              email: data.email || user.email || ''
            });
            setShowProfileModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking customer profile:', error);
      }
    };

    checkProfileCompleteness();
  }, [customerId, db, user]);

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
  const [userManuallyClosed, setUserManuallyClosed] = useState(false);
  const [gName, setGName] = useState(locationState?.prefillCustomer?.name || '');
  const [gEmail, setGEmail] = useState(locationState?.prefillCustomer?.email || '');
  const [gPhone, setGPhone] = useState(locationState?.prefillCustomer?.phone || '');
  const [smsConsent, setSmsConsent] = useState(false);

  // Check if there are new customer promotions available (for messaging)
  const hasNewCustomerPromo = useMemo(() => {
    return promotions.some(p => 
      p.status === 'active' && 
      p.customerSegment === 'new_customers' &&
      p.applicationMethod === 'auto_apply'
    );
  }, [promotions]);

  // Calculate applicable promotions (moved here after gEmail/gPhone declared)
  useEffect(() => {
    if (!db || selectedServices.length === 0 || promotions.length === 0) {
      setAppliedPromotions([]);
      // Clear saved promotions if no services selected
      const saved = sessionStorage.getItem('bb_booking_cart');
      if (saved) {
        try {
          const cart = JSON.parse(saved);
          delete cart.appliedPromotionIds;
          sessionStorage.setItem('bb_booking_cart', JSON.stringify(cart));
        } catch (e) {
          console.error('Failed to clear saved promotions:', e);
        }
      }
      return;
    }
    
    findApplicablePromotions(
      db,
      promotions,
      customer,
      selectedServices,
      subtotalPrice,
      enteredPromoCode || undefined,
      gEmail || undefined,
      gPhone || undefined
    ).then((applicable) => {
      setAppliedPromotions(applicable);
      // Save applied promotion IDs to sessionStorage so they persist across hold expiration
      const saved = sessionStorage.getItem('bb_booking_cart');
      try {
        const cart = saved ? JSON.parse(saved) : {};
        cart.appliedPromotionIds = applicable.map(p => p.id);
        sessionStorage.setItem('bb_booking_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save applied promotions:', e);
      }
    }).catch((err) => {
      console.error('Error calculating promotions:', err);
      setAppliedPromotions([]);
    });
  }, [db, promotions, customer, selectedServices, subtotalPrice, enteredPromoCode, gEmail, gPhone]);
  
  // Verification state for guest bookings
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [sentEmailCode, setSentEmailCode] = useState('');
  
  // Firebase Phone Auth state
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [firebasePhoneAuthLoading, setFirebasePhoneAuthLoading] = useState(false);
  const [sentPhoneCode, setSentPhoneCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Authentication prompt state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);

  // Check for existing customer when email/phone is entered
  const checkExistingCustomer = async (email?: string, phone?: string) => {
    if (!email && !phone) return;
    
    setCheckingCustomer(true);
    try {
      const { findOrCreateCustomerClient } = await import('@buenobrows/shared/functionsClient');
      const result = await findOrCreateCustomerClient({
        email: email || undefined,
        phone: phone || undefined,
        name: gName || 'Guest',
        authUid: undefined // Check mode - not authenticated
      });
      
      if (result.needsSignIn) {
        setExistingCustomer(result);
        setShowAuthPrompt(true);
      }
    } catch (error) {
      console.error('Error checking existing customer:', error);
    } finally {
      setCheckingCustomer(false);
    }
  };

  // Auto-populate guest form from authenticated user
  useEffect(() => {
    if (user) {
      // Populate name from displayName
      if (user.displayName && !gName) {
        setGName(user.displayName);
      }
      // Populate email from user email
      if (user.email && !gEmail) {
        setGEmail(user.email);
      }
      // Populate phone from phoneNumber (for phone auth users)
      if (user.phoneNumber && !gPhone) {
        setGPhone(user.phoneNumber);
      }
      // If user has verified email or phone, mark as verified
      if (user.emailVerified) {
        setEmailVerified(true);
      }
      if (user.phoneNumber) {
        setPhoneVerified(true);
      }
      // Auto-open form for authenticated users when they have a hold
      // But only if the user hasn't manually closed it
      if (hold && !guestOpen && !userManuallyClosed) {
        setGuestOpen(true);
      }
    }
  }, [user, gName, gEmail, gPhone, hold, guestOpen, userManuallyClosed]);

  // Check for existing customer when email is entered (debounced)
  useEffect(() => {
    if (!user && gEmail && gEmail.includes('@')) {
      const timeoutId = setTimeout(() => {
        checkExistingCustomer(gEmail, undefined);
      }, 1000); // 1 second debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [gEmail, user]);

  // Check for existing customer when phone is entered (debounced)
  useEffect(() => {
    if (!user && gPhone && gPhone.length >= 10) {
      const timeoutId = setTimeout(() => {
        checkExistingCustomer(undefined, gPhone);
      }, 1000); // 1 second debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [gPhone, user]);
  
  // Send email verification code for guest booking
  const sendGuestEmailVerification = async () => {
    if (!gEmail) {
      setError('Please enter an email address first.');
      return;
    }
    
    setVerificationLoading(true);
    setError('');
    
    try {
      const functions = getFunctions();
      const sendEmailVerificationCode = httpsCallable(functions, 'sendEmailVerificationCode');
      
      const result = await sendEmailVerificationCode({ email: gEmail });
      
      if ((result.data as any).success) {
        setError('');
        setSentEmailCode('sent'); // Mark as sent to show input field
      } else {
        setError('Failed to send verification email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Verify email code for guest booking
  const verifyEmailCode = async () => {
    if (!emailVerificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    
    setVerificationLoading(true);
    setError('');
    
    try {
      const functions = getFunctions();
      const verifyEmailCode = httpsCallable(functions, 'verifyEmailCode');
      
      const result = await verifyEmailCode({ 
        email: gEmail, 
        code: emailVerificationCode 
      });
      
      if ((result.data as any).success) {
        setEmailVerified(true);
        setError('');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email code');
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Send SMS verification code for guest booking
  const sendGuestPhoneVerification = async () => {
    if (!gPhone) {
      setError('Please enter a phone number first.');
      return;
    }
    
    setVerificationLoading(true);
    setError('');
    
    try {
      const functions = getFunctions();
      const sendSMSVerificationCode = httpsCallable(functions, 'sendSMSVerificationCode');
      
      const result = await sendSMSVerificationCode({ phoneNumber: gPhone });
      
      if ((result.data as any).success) {
        setError('');
        setSentPhoneCode('sent'); // Mark as sent to show input field
      } else {
        setError('Failed to send verification SMS');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification SMS');
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Verify phone code for guest booking
  const verifyPhoneCode = async () => {
    if (!phoneVerificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    
    setVerificationLoading(true);
    setError('');
    
    try {
      const functions = getFunctions();
      const verifySMSCode = httpsCallable(functions, 'verifySMSCode');
      
      const result = await verifySMSCode({ 
        phoneNumber: gPhone, 
        code: phoneVerificationCode 
      });
      
      if ((result.data as any).success) {
        setPhoneVerified(true);
        setError('');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify SMS code');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Initialize Firebase Phone Auth reCAPTCHA
  const initializeRecaptcha = () => {
    if (recaptchaVerifier) return recaptchaVerifier;
    
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
    
    setRecaptchaVerifier(verifier);
    return verifier;
  };

  // Send Firebase Phone Auth verification code
  const sendFirebasePhoneVerification = async () => {
    if (!gPhone) {
      setError('Please enter a phone number first.');
      return;
    }

    setFirebasePhoneAuthLoading(true);
    setError('');

    try {
      const verifier = initializeRecaptcha();
      const phoneNumber = gPhone.startsWith('+') ? gPhone : `+1${gPhone}`;
      
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setSentPhoneCode(gPhone);
      setError('');
    } catch (err: any) {
      console.error('Firebase Phone Auth error:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setFirebasePhoneAuthLoading(false);
    }
  };

  // Verify Firebase Phone Auth code
  const verifyFirebasePhoneCode = async () => {
    if (!phoneVerificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    if (!confirmationResult) {
      setError('No verification session found. Please request a new code.');
      return;
    }

    setFirebasePhoneAuthLoading(true);
    setError('');

    try {
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, phoneVerificationCode);
      await signInWithCredential(auth, credential);
      
      // Sign out immediately after verification to keep user as guest
      await auth.signOut();
      
      setPhoneVerified(true);
      setError('');
    } catch (err: any) {
      console.error('Firebase Phone Auth verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setFirebasePhoneAuthLoading(false);
    }
  };

  // ---------- Consent form ----------
  const [consentForm, setConsentForm] = useState<ConsentFormTemplate | null>(null);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [showQuickUpdateForm, setShowQuickUpdateForm] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasExistingConsent, setHasExistingConsent] = useState(false);
  const [consentCategory, setConsentCategory] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [isNewService, setIsNewService] = useState<boolean>(false);

  // Load active consent form based on selected services
  useEffect(() => {
    if (selectedServices.length === 0) {
      // No services selected yet, load default
      getActiveConsentForm(db, 'brow_services').then(form => {
        setConsentForm(form);
        setConsentCategory('brow_services');
      }).catch(error => {
        console.warn('Failed to load consent form:', error);
        setConsentForm(null);
      });
      return;
    }

    // Determine consent category from selected services
    const category = selectedServices[0]?.category 
      ? (selectedServices[0].category.toLowerCase() === 'lash services' ? 'lash_services' : 'brow_services')
      : 'brow_services';
    
    setConsentCategory(category);
    getActiveConsentForm(db, category).then(form => {
      setConsentForm(form);
    }).catch(error => {
      console.warn('Failed to load consent form:', error);
      setConsentForm(null);
    });
  }, [db, selectedServices]);

  // Check consent status when customerId or selected services change
  useEffect(() => {
    if (customerId && selectedServices.length > 0 && consentCategory) {
      // Check if customer has previous appointments
      hasPreviousAppointments(db, customerId).then(hasPrevious => {
        setIsFirstVisit(!hasPrevious);
        
        // Check if customer has consent for this category
        hasValidConsent(db, customerId, consentCategory).then(hasConsent => {
          setHasExistingConsent(hasConsent);
          
          // Determine if this is a new service (returning customer but no consent for this category)
          const newService = hasPrevious && !hasConsent;
          setIsNewService(newService);
          
          // If they have consent, they don't need to fill out forms again
          setConsentGiven(hasConsent);
        }).catch(error => {
          if (error?.code !== 'permission-denied') {
            console.error('Error checking consent:', error);
          }
          setHasExistingConsent(false);
          setConsentGiven(false);
        });
      }).catch(error => {
        if (error?.code !== 'permission-denied') {
          console.error('Error checking previous appointments:', error);
        }
        setIsFirstVisit(null);
      });
    } else {
      setHasExistingConsent(false);
      setConsentGiven(false);
      setIsFirstVisit(null);
      setIsNewService(false);
    }
  }, [customerId, db, selectedServices, consentCategory]);

  // ensure we use a Customers doc id (not auth uid)
  async function ensureCustomerId(): Promise<string> {
    try {
      // Signed in: use Cloud Function to find or create customer
      if (user) {
        console.log('Finding/creating customer for authenticated user:', { 
          email: user.email, 
          phone: user.phoneNumber,
          uid: user.uid 
        });
        const result = await findOrCreateCustomerClient({
          email: user.email || undefined,
          name: user.displayName || 'Customer',
          phone: user.phoneNumber || undefined,
          authUid: user.uid,
        });
        console.log('Customer result for authenticated user:', result);
        
        if (!result?.customerId) {
          throw new Error('Failed to get customer ID for authenticated user');
        }
        return result.customerId;
      }
      
      // Guest path: use Cloud Function to find or create customer
      // Either email OR phone is required for guests
      if (gEmail || gPhone) {
        console.log('Finding/creating customer for guest:', { gEmail, gPhone, gName });
        const result = await findOrCreateCustomerClient({
          email: gEmail || undefined,
          name: gName || 'Guest',
          phone: gPhone || undefined,
        });
        console.log('Customer result for guest:', result);
        
        if (!result?.customerId) {
          throw new Error('Failed to get customer ID for guest');
        }
        
        // Log SMS consent if opted in and phone was provided
        if (smsConsent && gPhone) {
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
      
      throw new Error('Missing customer contact information. Please provide email or phone number.');
    } catch (error) {
      console.error('Error in ensureCustomerId:', error);
      throw error;
    }
  }

  async function handleConsentAgree(signature: string) {
    if (!consentForm || !consentCategory) return;
    
    try {
      // Get customer ID first (create guest customer if needed)
      console.log('Getting customer ID for consent...');
      const custId = await ensureCustomerId();
      console.log('Customer ID for consent:', custId);
      
      if (!custId) {
        throw new Error('Customer ID is required for consent');
      }
      
      // Record full consent
      const consentData: any = {
        customerId: custId,
        customerName: user?.displayName || gName || 'Guest',
        consentFormId: consentForm.id,
        consentFormVersion: consentForm.version,
        consentFormCategory: consentCategory,
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
      
      console.log('Recording full consent with data:', consentData);
      await recordCustomerConsent(db, consentData);
      console.log('Consent recorded successfully');
      
      setConsentGiven(true);
      setShowConsentForm(false);
      
      // Now proceed with booking
      await proceedWithBooking(custId);
    } catch (error: any) {
      console.error('Error recording consent:', error);
      setError('Failed to record consent. Please try again.');
    }
  }

  async function handleQuickUpdateAgree(initials: string) {
    if (!consentCategory) return;
    
    try {
      // Get customer ID first (create guest customer if needed)
      console.log('Getting customer ID for quick update consent...');
      const custId = await ensureCustomerId();
      console.log('Customer ID for quick update:', custId);
      
      if (!custId) {
        throw new Error('Customer ID is required for consent');
      }
      
      // Record quick update consent
      await recordQuickUpdateConsent(
        db,
        custId,
        consentCategory,
        user?.displayName || gName || 'Guest',
        initials,
        user?.email || gEmail,
        gPhone
      );
      
      console.log('Quick update consent recorded successfully');
      
      setConsentGiven(true);
      setShowQuickUpdateForm(false);
      
      // Now proceed with booking
      await proceedWithBooking(custId);
    } catch (error: any) {
      console.error('Error recording quick update consent:', error);
      setError('Failed to record consent. Please try again.');
    }
  }

  async function proceedWithBooking(customerId: string) {
    if (!hold || selectedServiceIds.length === 0 || !chosen) return;
    
    try {
      // Check hold status before finalizing
      const now = Date.now();
      const expiresAt = new Date(hold.expiresAt).getTime();
      const timeRemaining = expiresAt - now;
      
      console.log('🔍 Hold status before finalization:', {
        holdId: hold.id,
        status: hold.status,
        expiresAt: hold.expiresAt,
        timeRemaining: `${Math.round(timeRemaining / 1000)}s`,
        isExpired: timeRemaining <= 0,
        isFinalizing: isFinalizingRef.current
      });
      
      if (timeRemaining <= 0) {
        throw new Error('Hold has expired. Please select the time slot again.');
      }
      
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
      
      // Calculate discount per promotion for tracking
      const promotionDiscounts = appliedPromotions.map(promo => ({
        promotionId: promo.id,
        promoCode: promo.promoCode || undefined,
        discountAmount: calculateDiscount(promo, subtotalPrice, selectedServices),
      }));

      const out = await finalizeBookingFromHoldClient({
        holdId: hold.id,
        customerId,
        customer: {
          name: user?.displayName || gName || 'Guest',
          email: user?.email || gEmail || undefined,
          phone: gPhone || undefined,
        },
        price: totalPrice, // Already discounted price
        autoConfirm: true,
        serviceIds: selectedServiceIds, // Pass multi-service data
        servicePrices: selectedServices.reduce((acc, service) => {
          acc[service.id] = service.price;
          return acc;
        }, {} as Record<string, number>),
        // Pass promotion data for tracking
        appliedPromotions: promotionDiscounts,
        originalSubtotal: subtotalPrice, // Original price before discount
        totalDiscount: totalDiscount, // Total discount applied
      });
      
      console.log('Booking finalized successfully:', out);
      // Don't reset finalizing flag here - let the navigation handle cleanup
      nav(`/confirmation?id=${encodeURIComponent(out.appointmentId)}`);
    } catch (e: any) {
      console.error('finalizeBooking error:', e);
      setError(e?.message === 'E_OVERLAP' ? 'This time slot is no longer available. Please wait a moment before selecting another time, or try a different slot.' : e?.message || 'Failed to finalize booking.');
      // try to free the hold
      try {
        if (hold) await releaseHoldClient(hold.id);
      } catch {}
      setHold(null);
      isFinalizingRef.current = false;
    }
  }

  async function finalizeBooking() {
    if (!hold || selectedServiceIds.length === 0 || !chosen) return;
    setError('');
    isFinalizingRef.current = true;
    
    // Check verification requirements
    if (user) {
      // Authenticated users need verified email OR phone
      const hasVerifiedEmail = user.email && user.emailVerified;
      const hasVerifiedPhone = user.phoneNumber; // Phone auth users are already verified
      
      if (!hasVerifiedEmail && !hasVerifiedPhone) {
        setError('Please verify your email or phone number before booking. Go to your profile to verify.');
        isFinalizingRef.current = false;
        return;
      }
    } else {
      // Guest users must provide at least one contact method (email OR phone)
      if (!gEmail && !gPhone) {
        setError('Please provide either an email address or phone number to complete your booking.');
        setGuestOpen(true);
        isFinalizingRef.current = false;
        return;
      }
      
      // Guest users need to verify the contact method they provided (if verification is required)
      if (verificationSettings?.requireVerification) {
        const hasEmail = !!gEmail;
        const hasPhone = !!gPhone;
        
        // Check if user has provided contact methods that require verification
        const hasEmailToVerify = hasEmail && verificationSettings.emailVerificationEnabled;
        const hasPhoneToVerify = hasPhone && verificationSettings.smsVerificationEnabled;
        
        
        // If user provided contact methods that require verification, they must verify at least one
        if (hasEmailToVerify || hasPhoneToVerify) {
          const hasAtLeastOneVerified = emailVerified || phoneVerified;
          
          if (!hasAtLeastOneVerified) {
            setError('Please verify your contact information before booking. Use the verification buttons below.');
            setGuestOpen(true);
            isFinalizingRef.current = false;
            return;
          }
        }
      }
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
        // Determine which form to show based on customer history
        // Show quick update form if:
        // - Customer is NOT on first visit (has previous appointments)
        // - Customer has existing consent for this category
        // - This is NOT a new service category
        if (isFirstVisit === false && hasExistingConsent && !isNewService) {
          // Returning customer with existing consent - show quick update form
          console.log('Showing quick update form for returning customer');
          setShowQuickUpdateForm(true);
        } else {
          // First visit OR new service category - show full consent form
          console.log('Showing full consent form (first visit or new service)', {
            isFirstVisit,
            hasExistingConsent,
            isNewService
          });
          setShowConsentForm(true);
        }
        return;
      }
      
      // Proceed with booking if consent is already given or not required
      await proceedWithBooking(custId);
    } catch (e: any) {
      console.error('finalizeBooking error:', e);
      setError(e?.message === 'E_OVERLAP' ? 'This time slot is no longer available. Please wait a moment before selecting another time, or try a different slot.' : e?.message || 'Failed to finalize booking.');
      // try to free the hold
      try {
        if (hold) await releaseHoldClient(hold.id);
      } catch {}
      setHold(null);
      isFinalizingRef.current = false;
    }
  }

  // Multi-guest booking: Smart assignment logic
  function handleIncreaseQuantity(serviceId: string) {
    const current = serviceAssignments[serviceId] || {
      serviceId,
      quantity: 0,
      guestAssignments: []
    };
    
    const newQuantity = current.quantity + 1;
    
    // Case 1: First selection and user is authenticated -> assign to self
    if (newQuantity === 1 && user) {
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          serviceId,
          quantity: 1,
          guestAssignments: [{ guestId: 'self', serviceId }]
        }
      });
      return;
    }
    
    // Case 2: First selection for guest user -> assign to guest-self
    if (newQuantity === 1 && !user) {
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          serviceId,
          quantity: 1,
          guestAssignments: [{ guestId: 'guest-self', serviceId }]
        }
      });
      return;
    }
    
    // Case 3: Additional quantity -> need guest assignment
    if (newQuantity > 1) {
      const assignedGuestIds = current.guestAssignments.map(ga => ga.guestId);
      const availableGuests = guests.filter(g => !assignedGuestIds.includes(g.id));
      
      if (availableGuests.length === 1) {
        // Only one available guest, auto-assign
        setServiceAssignments({
          ...serviceAssignments,
          [serviceId]: {
            serviceId,
            quantity: newQuantity,
            guestAssignments: [
              ...current.guestAssignments,
              { guestId: availableGuests[0].id, serviceId }
            ]
          }
        });
      } else {
        // Multiple options or no guests available, show assignment prompt
        setServiceAssignments({
          ...serviceAssignments,
          [serviceId]: {
            ...current,
            quantity: newQuantity,
            guestAssignments: current.guestAssignments
          }
        });
        setPendingServiceAssignment(serviceId);
        if (availableGuests.length === 0) {
          setShowAddGuestModal(true);
        } else {
          setShowGuestAssignment(true);
        }
      }
    }
  }

  function handleDecreaseQuantity(serviceId: string) {
    const current = serviceAssignments[serviceId];
    if (!current || current.quantity <= 0) return;
    
    const newQuantity = current.quantity - 1;
    
    if (newQuantity === 0) {
      // Remove service entirely
      const { [serviceId]: removed, ...rest } = serviceAssignments;
      setServiceAssignments(rest);
    } else {
      // Remove last guest assignment
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          ...current,
          quantity: newQuantity,
          guestAssignments: current.guestAssignments.slice(0, -1)
        }
      });
    }
  }

  function assignServiceToGuest(serviceId: string, guestId: string) {
    const current = serviceAssignments[serviceId];
    if (!current) return;
    
    // Add guest assignment for the unassigned slot
    setServiceAssignments({
      ...serviceAssignments,
      [serviceId]: {
        ...current,
        guestAssignments: [
          ...current.guestAssignments,
          { guestId, serviceId }
        ]
      }
    });
    
    // Close modals and clear pending
    setShowGuestAssignment(false);
    setPendingServiceAssignment(null);
  }

  function removeGuest(guestId: string) {
    // Remove guest from list
    setGuests(guests.filter(g => g.id !== guestId));
    
    // Remove all assignments for this guest
    const updatedAssignments = { ...serviceAssignments };
    Object.keys(updatedAssignments).forEach(serviceId => {
      updatedAssignments[serviceId].guestAssignments = 
        updatedAssignments[serviceId].guestAssignments.filter(ga => ga.guestId !== guestId);
      updatedAssignments[serviceId].quantity = updatedAssignments[serviceId].guestAssignments.length;
      
      // Remove service if no assignments left
      if (updatedAssignments[serviceId].quantity === 0) {
        delete updatedAssignments[serviceId];
      }
    });
    setServiceAssignments(updatedAssignments);
  }

  const prettyTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: bh?.timezone || 'America/Los_Angeles'
    });
  };
  const holdExpired = hold ? new Date(hold.expiresAt).getTime() <= Date.now() : false;

  // ---------- UI ----------
  return (
    <div className="relative">
      <SEO 
        title="Book Appointment - Professional Eyebrow Services | Bueno Brows"
        description="Book your professional eyebrow services appointment online. Choose from microblading, brow shaping, and other beauty treatments. Easy online booking in San Mateo, CA."
        keywords="book appointment, eyebrow services, microblading appointment, brow shaping, online booking, San Mateo, California"
        url="https://buenobrows.com/book"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Book Appointment",
          "description": "Book your professional eyebrow services appointment online",
          "url": "https://buenobrows.com/book",
          "mainEntity": {
            "@type": "BeautySalon",
            "name": "Bueno Brows",
            "description": "Professional eyebrow services including microblading, brow shaping, and beauty treatments"
          }
        }}
      />
      
      {/* Error Messages */}
      {(servicesError || bhError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              {servicesError && <p className="text-sm text-red-800 font-medium mb-1">{servicesError}</p>}
              {bhError && <p className="text-sm text-red-800 font-medium mb-1">{bhError}</p>}
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
      
      <section className="grid gap-6">
        <h1 className="font-serif text-2xl">Book an appointment</h1>

      {/* Step 1: Service */}
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="mb-2 font-serif text-2xl text-slate-800">1. Choose Your Service(s)</h2>
          <p className="text-slate-600">
            Select one or more services. You can combine multiple treatments in a single appointment.
          </p>
        </div>
        
        {/* Modern Category Widgets */}
        <div className="space-y-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="group">
              {/* Category Header with Icon */}
              <div 
                className="mb-6 flex items-center gap-4 cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => toggleCategoryCollapse(category)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta to-terracotta/80 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{category}</h3>
                  <p className="text-sm text-slate-500">{categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''} available</p>
                </div>
                <div className="flex items-center justify-center">
                  <svg 
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      collapsedCategories.has(category) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Services Grid */}
              <div 
                className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300 overflow-hidden ${
                  collapsedCategories.has(category) 
                    ? 'max-h-0 opacity-0' 
                    : 'max-h-[2000px] opacity-100'
                }`}
              >
                {categoryServices.map((s) => (
                  <div
                    key={s.id}
                    className={`group relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-[1.02] ${
                      selectedServiceIds.includes(s.id) 
                        ? 'border-terracotta bg-gradient-to-br from-terracotta/10 to-terracotta/5 shadow-lg ring-2 ring-terracotta/20' 
                        : 'border-slate-200 bg-white hover:border-terracotta/40 hover:shadow-md'
                    }`}
                    onClick={() => {
                      if (selectedServiceIds.includes(s.id)) {
                        setSelectedServiceIds(prev => prev.filter(id => id !== s.id));
                      } else {
                        setSelectedServiceIds(prev => [...prev, s.id]);
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
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedServiceIds.includes(s.id)
                          ? 'border-terracotta bg-terracotta'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {selectedServiceIds.includes(s.id) && (
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Service Content */}
                    <div className="pr-8">
                      <h4 className="mb-3 text-lg font-bold text-slate-800 group-hover:text-terracotta transition-colors">
                        {s.name}
                      </h4>
                      
                      {s.description && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {truncateDescription(s.description)}
                          </p>
                          {s.description.length > 100 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleServiceClick(s);
                              }}
                              className="mt-2 text-terracotta text-sm font-medium hover:text-terracotta/80 transition-colors"
                            >
                              Read full description →
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Service Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{s.duration} minutes</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-terracotta">${s.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-terracotta/5 to-terracotta/10 border-2 border-terracotta/20 p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  Your Selection ({selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'})
                </h4>
                <p className="text-sm text-slate-600">Review your selected services below</p>
              </div>
            </div>
            
            <div className="mb-6 space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-terracotta"></div>
                    <span className="font-semibold text-slate-800">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">{service.duration}m</span>
                    <span className="font-bold text-terracotta text-lg">${service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-xl bg-white/90 p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Total Duration:</span>
                <span className="font-bold text-slate-800 text-lg">{totalDuration} minutes</span>
              </div>
              
              {/* Promo Code Input */}
              {selectedServices.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Have a promo code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={enteredPromoCode}
                      onChange={(e) => {
                        setEnteredPromoCode(e.target.value.toUpperCase());
                        setPromoCodeError(null);
                      }}
                      placeholder="Enter code"
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent uppercase"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!enteredPromoCode.trim()) return;
                        // Check if code exists
                        const codePromo = promotions.find(
                          p => p.promoCode?.toUpperCase() === enteredPromoCode.toUpperCase()
                        );
                        if (!codePromo) {
                          setPromoCodeError('Invalid promo code');
                          return;
                        }
                        // Eligibility check happens automatically via useMemo
                        setPromoCodeError(null);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {promoCodeError && (
                    <p className="text-red-600 text-sm mt-1">{promoCodeError}</p>
                  )}
                  {!user && hasNewCustomerPromo && appliedPromotions.length === 0 && selectedServices.length > 0 && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            🎉 First-time customers save! Create an account to unlock your discount.
                          </p>
                          <button
                            onClick={() => {
                              // Save current booking state
                              const bookingState = {
                                selectedServiceIds,
                                dateStr,
                                gName,
                                gEmail,
                                gPhone,
                              };
                              sessionStorage.setItem('bb_booking_state', JSON.stringify(bookingState));
                              // Redirect to login/signup
                              nav('/login?returnTo=/book');
                            }}
                            className="mt-2 text-xs text-blue-700 hover:text-blue-900 underline font-medium"
                          >
                            Sign up or log in →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {appliedPromotions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {appliedPromotions.map(promo => (
                        <div key={promo.id} className="flex items-center justify-between text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                          <span>
                            {promo.name}
                            {promo.promoCode && <span className="ml-2 font-mono text-xs">({promo.promoCode})</span>}
                          </span>
                          <span className="font-semibold">
                            -${calculateDiscount(promo, subtotalPrice, selectedServices).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-slate-300 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${subtotalPrice.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <span>Discount:</span>
                    <span className="font-semibold">-${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-800 text-lg">Total Price:</span>
                  <span className="text-3xl font-bold text-terracotta">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You saved ${totalDiscount.toFixed(2)}!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email/Phone Verification Notice for Authenticated Users */}
      {user && !user.emailVerified && !user.phoneNumber && (
        <div className="rounded-xl bg-red-50 border-2 border-red-300 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">⚠️ Verification Required</h3>
              <p className="text-sm text-red-800 mb-3">
                You must verify your email or phone number before making a booking. This ensures you receive appointment confirmations and reminders.
              </p>
              <button
                onClick={() => nav('/profile')}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Go to Profile & Verify
              </button>
            </div>
          </div>
        </div>
      )}

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
                {isValidBookingDateWithSpecialHours(dayDate, bh, closures, specialHours) ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Open: {formatBusinessHoursForDateWithSpecialHours(dayDate, bh, closures, specialHours)}
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
            <div className="ml-2 flex items-center gap-2">
              {/* Navigation buttons */}
              <button
                type="button"
                onClick={() => {
                  if (dateStr) {
                    const currentDate = new Date(dateStr + 'T00:00:00');
                    const prevDate = new Date(currentDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevDateStr = prevDate.toISOString().slice(0, 10);
                    setDateStr(prevDateStr);
                    
                    // Release hold when date changes
                    if (hold) {
                      console.log('Date changed, releasing hold:', hold.id);
                      releaseHoldClient(hold.id)
                        .then(() => console.log('Successfully released hold on date change'))
                        .catch(e => console.warn('Failed to release hold:', e));
                    }
                    
                    setChosen(null);
                    setHold(null);
                    setError('');
                  }
                }}
                className="p-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                title="Previous day"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setDateStr(today);
                  
                  // Release hold when date changes
                  if (hold) {
                    console.log('Date changed, releasing hold:', hold.id);
                    releaseHoldClient(hold.id)
                      .then(() => console.log('Successfully released hold on date change'))
                      .catch(e => console.warn('Failed to release hold:', e));
                  }
                  
                  setChosen(null);
                  setHold(null);
                  setError('');
                }}
                className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium"
                title="Go to today"
              >
                Today
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (dateStr) {
                    const currentDate = new Date(dateStr + 'T00:00:00');
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    const nextDateStr = nextDate.toISOString().slice(0, 10);
                    setDateStr(nextDateStr);
                    
                    // Release hold when date changes
                    if (hold) {
                      console.log('Date changed, releasing hold:', hold.id);
                      releaseHoldClient(hold.id)
                        .then(() => console.log('Successfully released hold on date change'))
                        .catch(e => console.warn('Failed to release hold:', e));
                    }
                    
                    setChosen(null);
                    setHold(null);
                    setError('');
                  }
                }}
                className="p-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                title="Next day"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Date input with calendar picker */}
              <input
                type="date"
                id="appointment-date"
                name="appointment-date"
                className="rounded-md border p-2"
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
            </div>
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

        {/* Loading indicator for hold creation */}
        {isCreatingHold && (
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Reserving your time slot...</p>
                <p className="text-xs text-amber-700">Please wait, do not click again</p>
              </div>
            </div>
          </div>
        )}

        {/* time grid */}
        <div className={`max-h-96 overflow-y-auto border rounded-lg p-2 ${(isCreatingHold || isRestoringHold) ? 'pointer-events-none' : ''}`}>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.startISO}
                onClick={() => pickSlot(slot)}
                disabled={isCreatingHold || isRestoringHold}
                className={`rounded-md border py-2 text-sm transition-colors ${
                  chosen?.startISO === slot.startISO 
                    ? 'bg-terracotta text-white' 
                    : (isCreatingHold || isRestoringHold)
                    ? 'opacity-50 cursor-not-allowed bg-slate-100' 
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
                   !isValidBookingDateWithSpecialHours(dayDate, bh, closures, specialHours) ? (
                     <>
                       <span className="text-red-600">Sorry, we are closed on this date.</span>
                       {(() => {
                         const nextAvailable = getNextValidBookingDateAfter(dayDate, bh, closures, specialHours);
                         if (nextAvailable) {
                           const nextDateStr = formatNextAvailableDate(nextAvailable);
                           const nextDateISO = nextAvailable.toISOString().slice(0, 10);
                           return (
                             <span className="block mt-1">
                               Our next available day is{' '}
                               <button
                                 onClick={() => setDateStr(nextDateISO)}
                                 className="font-medium text-terracotta hover:text-terracotta-dark underline cursor-pointer"
                               >
                                 {nextDateStr}
                               </button>.
                             </span>
                           );
                         }
                         return null;
                       })()}
                     </>
                   ) : (
                     <>
                       <span className="text-slate-600">No available time slots for this date.</span>
                       {(() => {
                         const nextAvailable = getNextValidBookingDateAfter(dayDate, bh, closures, specialHours);
                         if (nextAvailable) {
                           const nextDateStr = formatNextAvailableDate(nextAvailable);
                           const nextDateISO = nextAvailable.toISOString().slice(0, 10);
                           return (
                             <span className="block mt-1">
                               Our next available day is{' '}
                               <button
                                 onClick={() => setDateStr(nextDateISO)}
                                 className="font-medium text-terracotta hover:text-terracotta-dark underline cursor-pointer"
                               >
                                 {nextDateStr}
                               </button>.
                             </span>
                           );
                         }
                         return null;
                       })()}
                     </>
                   )}
                </p>
                {!isValidBookingDateWithSpecialHours(dayDate, bh, closures, specialHours) && (
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
          <div ref={bookingFormRef} className="mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4">
            {/* Show restoration progress bar */}
            {isRestoringHold && !hold && (
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Restoring your selection...</p>
                    <p className="text-xs text-blue-700">Please wait while we secure your time slot</p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('🔄 Manual reset of restoration loading state');
                      setIsRestoringHold(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-600">You're holding</div>
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
                    : isRestoringHold 
                      ? 'Restoring your booking…'
                      : 'Creating hold…'}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* inline verify only for magic-link flow */}
                {!user && linkFlow && (
                  <input
                    type="email"
                    id="verify-email"
                    name="verify-email"
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
                      disabled={!hold}
                    >
                      Book as guest
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60 hover:bg-terracotta/90"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Hide details button clicked:', { guestOpen, hold: !!hold, holdExpired });
                      if (guestOpen) {
                        setUserManuallyClosed(true);
                        setGuestOpen(false);
                      } else {
                        setUserManuallyClosed(false);
                        setGuestOpen(true);
                      }
                    }}
                    disabled={!hold}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    {guestOpen ? 'Hide details' : 'Review & Book'}
                  </button>
                )}
              </div>
            </div>

            {/* Sleek Booking Information Form */}
            {guestOpen && hold && !holdExpired && (
              <div className="mt-4 space-y-4">
                {/* Dynamic Banner based on admin settings */}
                {!user && verificationSettings && (
                  <div className={`rounded-lg p-3 ${
                    verificationSettings.requireVerification 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        verificationSettings.requireVerification 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                      }`}>
                        <svg className={`w-3 h-3 ${
                          verificationSettings.requireVerification 
                            ? 'text-blue-600' 
                            : 'text-green-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          verificationSettings.requireVerification 
                            ? 'text-blue-900' 
                            : 'text-green-900'
                        }`}>
                          {verificationSettings.requireVerification 
                            ? 'Contact verification required'
                            : 'Contact verification optional'
                          }
                        </p>
                        <p className={`text-xs mt-1 ${
                          verificationSettings.requireVerification 
                            ? 'text-blue-700' 
                            : 'text-green-700'
                        }`}>
                          {verificationSettings.requireVerification 
                            ? `Provide ${verificationSettings.emailVerificationEnabled && verificationSettings.smsVerificationEnabled 
                                ? 'email or phone' 
                                : verificationSettings.emailVerificationEnabled 
                                  ? 'email' 
                                  : 'phone'} and verify to book.`
                            : 'You can book without verification, but we recommend providing contact info for confirmations.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sleek Contact Form */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="guest-name" className="text-sm font-medium text-slate-700">
                        {user ? "Full name" : "Full name (optional)"}
                      </label>
                      <input
                        type="text"
                        id="guest-name"
                        name="guest-name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-colors"
                        placeholder="Enter your name"
                        value={gName}
                        onChange={(e) => setGName(e.target.value)}
                        autoComplete="name"
                        aria-label={user ? "Full name" : "Full name (optional)"}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="guest-email" className="text-sm font-medium text-slate-700">
                        Email address
                        {verificationSettings?.emailVerificationEnabled && (
                          <span className="text-xs text-slate-500 ml-1">(will be verified)</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="guest-email"
                          name="guest-email"
                          className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-terracotta/20 transition-colors ${
                            emailVerified 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-slate-300 focus:border-terracotta'
                          }`}
                          placeholder="your@email.com"
                          value={gEmail}
                          onChange={(e) => setGEmail(e.target.value)}
                          inputMode="email"
                          autoComplete="email"
                          disabled={emailVerified}
                          aria-label="Email address"
                          aria-describedby={emailVerified ? "email-verified" : undefined}
                        />
                        {emailVerified && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {emailVerified && (
                        <span id="email-verified" className="sr-only">Email verified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="guest-phone" className="text-sm font-medium text-slate-700">
                      Phone number
                      {verificationSettings?.smsVerificationEnabled && (
                        <span className="text-xs text-slate-500 ml-1">(will be verified)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="guest-phone"
                        name="guest-phone"
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-terracotta/20 transition-colors ${
                          phoneVerified 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-slate-300 focus:border-terracotta'
                        }`}
                        placeholder="(555) 123-4567"
                        value={gPhone}
                        onChange={(e) => setGPhone(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        disabled={phoneVerified}
                        aria-label="Phone number"
                        aria-describedby={phoneVerified ? "phone-verified" : undefined}
                      />
                      {phoneVerified && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {phoneVerified && (
                      <span id="phone-verified" className="sr-only">Phone verified</span>
                    )}
                  </div>
                </div>
                
                {/* Sleek Verification Section */}
                {!user && (gEmail || gPhone) && verificationSettings && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">Verify Your Contact Information</h4>
                    </div>
                    <p className="text-xs text-slate-600">We'll send you a verification code to confirm your contact details.</p>
                    
                    <div className="space-y-3">
                      {/* Email Verification */}
                      {gEmail && verificationSettings.emailVerificationEnabled && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-700">Email verification</span>
                            </div>
                            {emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            ) : (sentEmailCode || sentEmailCode === 'sent') ? (
                              <div className="flex gap-2">
                                <input
                                  id="email-verification-code"
                                  name="emailVerificationCode"
                                  type="text"
                                  placeholder="Enter 6-digit code"
                                  value={emailVerificationCode}
                                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                                  maxLength={6}
                                  aria-label="Email verification code"
                                  inputMode="numeric"
                                  pattern="[0-9]{6}"
                                />
                                <button
                                  onClick={verifyEmailCode}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Verify
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={sendGuestEmailVerification}
                                disabled={!gEmail || verificationLoading}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {verificationLoading ? 'Sending...' : 'Send Code'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Phone Verification */}
                      {gPhone && verificationSettings.smsVerificationEnabled && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-700">Phone verification</span>
                            </div>
                            {phoneVerified ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            ) : (sentPhoneCode || sentPhoneCode === 'sent') ? (
                              <div className="flex gap-2">
                                <input
                                  id="phone-verification-code"
                                  name="phoneVerificationCode"
                                  type="text"
                                  placeholder="Enter 6-digit code"
                                  value={phoneVerificationCode}
                                  onChange={(e) => setPhoneVerificationCode(e.target.value)}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                                  maxLength={6}
                                  aria-label="Phone verification code"
                                  inputMode="numeric"
                                  pattern="[0-9]{6}"
                                />
                                <button
                                  onClick={verificationSettings.useFirebasePhoneAuth ? verifyFirebasePhoneCode : verifyPhoneCode}
                                  disabled={firebasePhoneAuthLoading || verificationLoading}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                  {firebasePhoneAuthLoading || verificationLoading ? 'Verifying...' : 'Verify'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={verificationSettings.useFirebasePhoneAuth ? sendFirebasePhoneVerification : sendGuestPhoneVerification}
                                disabled={!gPhone || firebasePhoneAuthLoading || verificationLoading}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {firebasePhoneAuthLoading || verificationLoading ? 'Sending...' : 'Send Code'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* SMS Consent */}
                {gPhone && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="sms-consent"
                        name="sms-consent"
                        checked={smsConsent}
                        onChange={(e) => setSmsConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-terracotta border-slate-300 rounded focus:ring-terracotta/20"
                        aria-describedby="sms-consent-description"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700">SMS notifications</span>
                        <p id="sms-consent-description" className="text-xs text-slate-600 mt-1">
                          I agree to receive automated text messages from Bueno Brows at (650) 613-8455 for appointment confirmations, reminders, and updates. Message and data rates may apply. Reply STOP to opt out anytime.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Dynamic Status Messages */}
                {!user && verificationSettings && (
                  <div className="space-y-2">
                    {(() => {
                      const hasEmail = !!gEmail;
                      const hasPhone = !!gPhone;
                      const hasEmailToVerify = hasEmail && verificationSettings.emailVerificationEnabled;
                      const hasPhoneToVerify = hasPhone && verificationSettings.smsVerificationEnabled;
                      const hasAtLeastOneVerified = emailVerified || phoneVerified;
                      
                      if (verificationSettings.requireVerification && (hasEmailToVerify || hasPhoneToVerify) && !hasAtLeastOneVerified) {
                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-amber-800">
                                Please verify your contact information to continue
                              </span>
                            </div>
                          </div>
                        );
                      }
                      
                      if (!hasEmail && !hasPhone) {
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-blue-800">
                                Please provide at least one contact method
                              </span>
                            </div>
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                  </div>
                )}

                {/* Sleek Booking Button */}
                <div className="flex justify-end pt-2">
                  <button
                    className="rounded-xl bg-terracotta px-6 py-3 text-white font-medium disabled:opacity-50 hover:bg-terracotta/90 transition-colors shadow-sm"
                    onClick={() => void finalizeBooking()}
                    disabled={user ? false : ((!gEmail && !gPhone) || (!emailVerified && !phoneVerified))}
                  >
                    {user ? 'Confirm booking' : 'Confirm guest booking'}
                  </button>
                </div>
                
                {/* Verification reminder for guests */}
                {!user && (!gEmail && !gPhone) && (
                  <p className="text-xs text-amber-700 text-right">
                    ⚠️ Please provide at least one contact method (email or phone)
                  </p>
                )}
                {!user && (gEmail || gPhone) && verificationSettings?.requireVerification && (
                  (() => {
                    const hasEmail = !!gEmail;
                    const hasPhone = !!gPhone;
                    const hasEmailToVerify = hasEmail && verificationSettings.emailVerificationEnabled;
                    const hasPhoneToVerify = hasPhone && verificationSettings.smsVerificationEnabled;
                    const hasAtLeastOneVerified = emailVerified || phoneVerified;
                    
                    // Show warning if user has contact methods that require verification but hasn't verified any
                    return (hasEmailToVerify || hasPhoneToVerify) && !hasAtLeastOneVerified;
                  })() && (
                    <p className="text-xs text-amber-700 text-right">
                      ⚠️ Please verify your contact information above to enable booking
                    </p>
                  )
                )}
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

      {/* Quick Update Consent Form Modal */}
      <QuickUpdateConsentForm
        customerName={user?.displayName || gName || 'Guest'}
        onAgree={handleQuickUpdateAgree}
        onDecline={() => {
          setShowQuickUpdateForm(false);
          setError('Consent confirmation is required to proceed with booking.');
        }}
        isOpen={showQuickUpdateForm}
      />

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && existingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAuthPrompt(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">We found your account!</h3>
              <p className="text-slate-600">
                We found an existing account with this {gEmail ? 'email' : 'phone number'}. 
                Sign in to continue with your booking history, or proceed as a guest.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Store booking state before redirecting
                  const bookingState = {
                    selectedServiceIds,
                    dateStr,
                    gName,
                    gEmail,
                    gPhone,
                    hold
                  };
                  sessionStorage.setItem('bb_booking_state', JSON.stringify(bookingState));
                  
                  // Redirect to login with prefill
                  const prefill = gEmail ? `email=${encodeURIComponent(gEmail)}` : `phone=${encodeURIComponent(gPhone)}`;
                  window.location.href = `/login?returnTo=/book&prefill=${prefill}`;
                }}
                className="w-full bg-terracotta text-white rounded-xl px-6 py-3 font-semibold hover:bg-terracotta/90 transition-colors"
              >
                Sign In to Continue
              </button>
              
              <button
                onClick={() => {
                  setShowAuthPrompt(false);
                  setExistingCustomer(null);
                }}
                className="w-full border-2 border-slate-300 text-slate-700 rounded-xl px-6 py-3 font-semibold hover:bg-slate-50 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Modal */}
      {showProfileModal && customerData && missingFields.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Complete Your Profile</h3>
              <p className="text-slate-600 text-sm">
                Help us provide you with the best experience! Please add the following information to your profile.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              {missingFields.includes('birthday') && (
                <div>
                  <label htmlFor="profile-birthday" className="block text-sm font-medium text-slate-700 mb-2">
                    Birthday *
                  </label>
                  <input
                    id="profile-birthday"
                    type="date"
                    value={profileFormData.birthday}
                    onChange={(e) => setProfileFormData({...profileFormData, birthday: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
              )}

              {missingFields.includes('phone') && (
                <div>
                  <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={profileFormData.phone}
                    onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">We'll use this to send appointment reminders</p>
                </div>
              )}

              {missingFields.includes('email') && (
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileFormData.email}
                    onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">We'll use this to send booking confirmations</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (!customerId || !db) return;
                  
                  // Prepare update data - only include fields that have values
                  const updates: any = {};
                  if (missingFields.includes('birthday') && profileFormData.birthday) {
                    updates.birthday = profileFormData.birthday;
                  }
                  if (missingFields.includes('phone') && profileFormData.phone) {
                    updates.phone = profileFormData.phone;
                  }
                  if (missingFields.includes('email') && profileFormData.email) {
                    updates.email = profileFormData.email;
                  }

                  // Check if at least one field was filled
                  if (Object.keys(updates).length === 0) {
                    alert('Please fill in at least one field to save.');
                    return;
                  }
                  
                  try {
                    // Update customer profile with whatever fields were filled
                    await updateCustomer(db, customerId, updates);
                    
                    // Mark as shown for this session
                    const shownKey = `bb_profile_completion_shown_${customerId}`;
                    sessionStorage.setItem(shownKey, 'true');
                    
                    setShowProfileModal(false);
                    setProfileFormData({ birthday: '', phone: '', email: '' });
                  } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Failed to update profile. Please try again.');
                  }
                }}
                className="w-full bg-terracotta text-white rounded-xl px-6 py-3 font-semibold hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Profile
              </button>
              
              <button
                onClick={() => {
                  // Mark as dismissed for this session
                  const shownKey = `bb_profile_completion_shown_${customerId}`;
                  sessionStorage.setItem(shownKey, 'true');
                  setShowProfileModal(false);
                }}
                className="w-full border-2 border-slate-300 text-slate-700 rounded-xl px-6 py-3 font-semibold hover:bg-slate-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* reCAPTCHA Container for Firebase Phone Auth */}
      <div id="recaptcha-container" className="hidden"></div>

      {/* Service Details Modal */}
      {showServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeServiceModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">{selectedService.category || 'Service'}</div>
                  <h3 className="font-serif text-2xl text-slate-800">{selectedService.name}</h3>
                </div>
                <button
                  onClick={closeServiceModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Service Details</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedService.description || 'Beautiful brows, tailored to you.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Duration</div>
                    <div className="font-semibold text-slate-800 text-lg">{selectedService.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Price</div>
                    <div className="font-bold text-terracotta text-2xl">${selectedService.price.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (selectedServiceIds.includes(selectedService.id)) {
                        setSelectedServiceIds(prev => prev.filter(id => id !== selectedService.id));
                      } else {
                        setSelectedServiceIds(prev => [...prev, selectedService.id]);
                      }
                      closeServiceModal();
                    }}
                    className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all ${
                      selectedServiceIds.includes(selectedService.id)
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300'
                        : 'bg-terracotta text-white hover:bg-terracotta/90'
                    }`}
                  >
                    {selectedServiceIds.includes(selectedService.id) ? 'Remove from Selection' : 'Add to Selection'}
                  </button>
                  <button
                    onClick={closeServiceModal}
                    className="flex-1 border-2 border-slate-300 text-slate-700 rounded-xl px-6 py-3 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
