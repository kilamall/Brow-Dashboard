import { getFunctions, httpsCallable } from 'firebase/functions';
import { initFirebase } from './firebase';

// Get session ID for booking flow
export function getOrCreateSessionId(): string {
  const KEY = 'bb_booking_session_id';
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// Create a slot hold
export async function createSlotHoldClient(data: {
  serviceId: string;
  startISO: string;
  endISO: string;
  sessionId: string;
  userId?: string;
}): Promise<{ id: string; expiresAt: string; status: string }> {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const createSlotHold = httpsCallable(functions, 'createSlotHold');
  
  // Calculate duration in minutes from start and end times
  const startTime = new Date(data.startISO).getTime();
  const endTime = new Date(data.endISO).getTime();
  const durationMinutes = Math.round((endTime - startTime) / 60000);
  
  console.log('🔍 Duration calculation:', {
    startISO: data.startISO,
    endISO: data.endISO,
    startTime,
    endTime,
    durationMinutes,
    isValid: durationMinutes > 0 && durationMinutes < 1440 // Less than 24 hours
  });
  
  // Validate required fields before sending
  if (!data.serviceId || !data.startISO || !data.sessionId || durationMinutes <= 0) {
    throw new Error(`Missing required fields: serviceId=${!!data.serviceId}, startISO=${!!data.startISO}, sessionId=${!!data.sessionId}, durationMinutes=${durationMinutes}`);
  }
  
  const requestData = {
    serviceId: data.serviceId,
    startISO: data.startISO,
    durationMinutes,
    sessionId: data.sessionId,
    userId: data.userId,
    resourceId: null, // Explicitly set resourceId to null as expected by Cloud Function
  };
  
  console.log('🚀 Sending hold creation request:', requestData);
  
  const result = await createSlotHold(requestData);
  return result.data as { id: string; expiresAt: string; status: string };
}

// Release a slot hold
export async function releaseHoldClient(holdId: string) {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const releaseHold = httpsCallable(functions, 'releaseHold');
  return await releaseHold({ holdId });
}

// Finalize booking from hold
export async function finalizeBookingFromHoldClient(data: {
  holdId: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  customerId: string;
  price?: number;
  autoConfirm?: boolean;
  serviceIds?: string[]; // Multi-service support
  servicePrices?: Record<string, number>; // Individual service prices
}): Promise<{ appointmentId: string; success: boolean }> {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const finalizeBookingFromHold = httpsCallable(functions, 'finalizeBookingFromHold');
  const result = await finalizeBookingFromHold(data);
  return result.data as { appointmentId: string; success: boolean };
}

// Find or create customer
export async function findOrCreateCustomerClient(data: {
  email?: string;
  name?: string;
  phone?: string;
  authUid?: string;
}): Promise<{ customerId: string; isNew: boolean; merged?: boolean; needsSignIn?: boolean }> {
  // Debounce multiple rapid calls across auth flows
  const KEY_TS = 'bb_find_or_create_last_success';
  const KEY_INFLIGHT = 'bb_find_or_create_inflight';
  try {
    const last = Number(sessionStorage.getItem(KEY_TS) || '0');
    const now = Date.now();
    if (last && now - last < 60_000) {
      // Return a noop result; caller generally only needs linkage
      return { customerId: data.authUid || '', isNew: false } as any;
    }
    if (sessionStorage.getItem(KEY_INFLIGHT) === '1') {
      // Another call in-flight; avoid spamming the backend
      return { customerId: data.authUid || '', isNew: false } as any;
    }
    sessionStorage.setItem(KEY_INFLIGHT, '1');

    const { app } = initFirebase();
    const functions = getFunctions(app, 'us-central1');
    const findOrCreateCustomer = httpsCallable(functions, 'findOrCreateCustomer');
    const result = await findOrCreateCustomer(data);
    sessionStorage.setItem(KEY_TS, String(Date.now()));
    return result.data as { customerId: string; isNew: boolean; merged?: boolean; needsSignIn?: boolean };
  } catch (e) {
    throw e;
  } finally {
    sessionStorage.removeItem(KEY_INFLIGHT);
  }
}

// Delete customer data (admin only)
export async function deleteCustomerDataClient(customerId: string) {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const deleteCustomerData = httpsCallable(functions, 'deleteCustomerData');
  return await deleteCustomerData({ customerId });
}

// Create customer with uniqueness enforcement
export async function createCustomerUniqueClient(data: {
  name: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  notes?: string;
  birthday?: string;
  authUid?: string;
}): Promise<{ customerId: string; alreadyExists: boolean; customer: any }> {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const createCustomerUnique = httpsCallable(functions, 'createCustomerUnique');
  const result = await createCustomerUnique(data);
  return result.data as { customerId: string; alreadyExists: boolean; customer: any };
}

// Send initial onboarding/invitation email to a customer
export async function sendInitialRequestClient(data: {
  customerId?: string;
  customerName?: string;
  customerEmail: string;
}): Promise<{ success: boolean }>{
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const sendInitialRequest = httpsCallable(functions, 'sendInitialRequest');
  const res = await sendInitialRequest(data);
  return res.data as { success: boolean };
}

// Run canonical fields migration (admin only)
export async function runCanonicalFieldsMigrationClient() {
  const { app } = initFirebase();
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const functions = getFunctions(app, 'us-central1');
  const runMigration = httpsCallable(functions, 'runCanonicalFieldsMigration');
  return await runMigration();
}

// Merge customers (admin only)
export async function mergeCustomersClient(survivorId: string, duplicateId: string) {
  const { app } = initFirebase();
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const functions = getFunctions(app, 'us-central1');
  const mergeCustomers = httpsCallable(functions, 'mergeCustomers');
  return await mergeCustomers({ survivorId, duplicateId });
}

// Create custom consent form (admin only)
export async function createCustomConsentFormClient(data: {
  name: string;
  version: string;
  category: string;
  title: string;
  content: string;
  sections: Array<{
    heading: string;
    content: string;
    required: boolean;
  }>;
  effectiveDate: string;
}) {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const createCustomConsentForm = httpsCallable(functions, 'createCustomConsentForm');
  return await createCustomConsentForm(data);
}

// Initialize consent forms (admin only)
export async function initializeConsentFormsClient() {
  const { app } = initFirebase();
  const functions = getFunctions(app, 'us-central1');
  const initializeConsentForms = httpsCallable(functions, 'initializeConsentForms');
  return await initializeConsentForms({});
}

