import { initFirebase } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ---------------- Types ----------------
export type SlotHold = {
  id: string;
  serviceId: string;
  resourceId?: string | null;
  start: string;       // ISO
  end: string;         // ISO
  status: 'active' | 'finalized' | 'canceled';
  createdAt: string;   // ISO
  expiresAt: string;   // ISO
  userId?: string | null;
  idempotencyKey?: string;
};

export type CreateHoldInput = {
  serviceId: string;
  startISO: string;
  durationMinutes: number;
  sessionId: string;        // per-tab/session id for idempotency
  resourceId?: string | null;
};

export type FinalizeHoldInput = {
  holdId: string;
  customer: { name?: string; email?: string; phone?: string };
  price?: number;             // optional; server will coerce to service price if mismatched
  autoConfirm?: boolean;      // default true
};

export type FinalizeHoldResult = { appointmentId: string };

// -------------- internals --------------
function getFns() {
  const { app } = initFirebase();
  const region = (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
  return getFunctions(app, region);
}

function mapError(e: any): Error {
  const msg: string = e?.message || '';
  // Cloud Functions throws HttpsError with .message and sometimes .details
  if (msg.includes('E_OVERLAP') || e?.details === 'E_OVERLAP') return new Error('E_OVERLAP');
  return new Error(e?.message || 'Function call failed');
}

// -------------- API wrappers --------------
export async function createSlotHoldClient(input: CreateHoldInput): Promise<SlotHold> {
  try {
    const fn = httpsCallable(getFns(), 'createSlotHold');
    const res = await fn(input);
    return res.data as SlotHold;
  } catch (e: any) {
    throw mapError(e);
  }
}

export async function finalizeBookingFromHoldClient(input: FinalizeHoldInput): Promise<FinalizeHoldResult> {
  try {
    const fn = httpsCallable(getFns(), 'finalizeBookingFromHold');
    const res = await fn(input);
    return res.data as FinalizeHoldResult;
  } catch (e: any) {
    throw mapError(e);
  }
}

export async function releaseHoldClient(holdId: string): Promise<{ ok: true }> {
  try {
    const fn = httpsCallable(getFns(), 'releaseHold');
    const res = await fn({ holdId });
    return res.data as { ok: true };
  } catch (e: any) {
    throw mapError(e);
  }
}

export async function extendHoldClient(holdId: string, extraSeconds = 90): Promise<{ ok: true }> {
  try {
    const fn = httpsCallable(getFns(), 'extendHold');
    const res = await fn({ holdId, extraSeconds });
    return res.data as { ok: true };
  } catch (e: any) {
    throw mapError(e);
  }
}

// -------------- session helper --------------
export function getOrCreateSessionId(key = 'bb_session'): string {
  // SSR / tests
  if (typeof window === 'undefined') return cryptoRandom();

  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing; // string

  const newId = cryptoRandom();  // string
  window.sessionStorage.setItem(key, newId);
  return newId;
}

function cryptoRandom(): string {
  // Modern browsers
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  // Fallback (not a UUID, but good enough for a session key)
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
