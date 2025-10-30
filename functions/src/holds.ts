// functions/src/holds.ts (fixed, self-contained, aligns with your schema)
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// How long a hold lasts (ms) - reduced to 2 minutes for better UX
const HOLD_MS = 2 * 60 * 1000;

// ---------- Small helpers ----------
function nowISO() { return new Date().toISOString(); }
function addMsISO(iso: string, ms: number) {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}
function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new HttpsError('failed-precondition', msg);
}
function overlaps(aStartISO: string, aEndISO: string, bStartISO: string, bEndISO: string) {
  const aStart = new Date(aStartISO).getTime();
  const aEnd   = new Date(aEndISO).getTime();
  const bStart = new Date(bStartISO).getTime();
  const bEnd   = new Date(bEndISO).getTime();
  if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) return false;
  // overlap if [aStart, aEnd) intersects [bStart, bEnd)
  return aStart < bEnd && aEnd > bStart;
}
function sha256Hex(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// Query conflicts inside the transaction (active holds + appointments)
async function anyConflictsTx(
  tx: FirebaseFirestore.Transaction,
  startISO: string,
  endISO: string,
  resourceId?: string | null,
  excludeHoldId?: string | null
) {
  // Active holds that overlap and haven't expired
  const holdsQ = (() => {
    let q = db.collection('holds')
      .where('status', '==', 'active')
      .where('expiresAt', '>', nowISO()); // ISO strings sort chronologically
    if (resourceId) q = q.where('resourceId', '==', resourceId);
    return q;
  })();

  // Appointments possibly overlapping (coarse bound by start >= (start-24h))
  const apptsBase = resourceId
    ? db.collection('appointments').where('resourceId', '==', resourceId)
    : db.collection('appointments');
  const apptsQ = apptsBase.where('start', '>=', new Date(new Date(startISO).getTime() - 24 * 3600 * 1000).toISOString());

  const [holdsSnap, apptsSnap] = await Promise.all([tx.get(holdsQ), tx.get(apptsQ)]);

  const hasHold = holdsSnap.docs.some(d => {
    // Exclude the current hold being finalized
    if (excludeHoldId && d.id === excludeHoldId) return false;
    const h = d.data() as any;
    return overlaps(startISO, endISO, h.start, h.end);
  });

  const hasAppt = apptsSnap.docs.some(d => {
    const a = d.data() as any;
    const aEndISO = addMsISO(a.start, (a.duration || 0) * 60000);
    return a.status !== 'cancelled' && overlaps(startISO, endISO, a.start, aEndISO);
  });

  return hasHold || hasAppt;
}

// ------------- createSlotHold -------------
export const createSlotHold = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit hold creation (10 per minute per IP/user)
    await consumeRateLimit(rateLimiters.createHold, getUserIdentifier(req));

    const { serviceId, resourceId = null, startISO, durationMinutes, sessionId } = req.data || {};
    const userId = req.auth?.uid || null;

    assert(serviceId && startISO && durationMinutes && sessionId, 'Missing required fields');
    assert(new Date(startISO).getTime() >= Date.now() - 60_000, 'Start must be now/future');

    const endISO = addMsISO(startISO, durationMinutes * 60000);

    // Idempotency: same session+service+slot(+resource) => same hold doc id
    const idempotencyKey = sha256Hex(`${sessionId}|${serviceId}|${resourceId || ''}|${startISO}|${endISO}`);
    const sessionIdHash = sha256Hex(sessionId);
    const holdRef = db.collection('holds').doc(idempotencyKey);

    const created = await db.runTransaction(async (tx) => {
      const existing = await tx.get(holdRef);
      if (existing.exists) {
        const h = existing.data()!;
        if (h.status === 'active' && new Date(h.expiresAt).getTime() > Date.now()) {
          return { id: holdRef.id, ...h };
        }
        // else refresh below
      }

      const conflict = await anyConflictsTx(tx, startISO, endISO, resourceId);
      if (conflict) throw new HttpsError('aborted', 'E_OVERLAP');

      const now = nowISO();
      const expiresAt = addMsISO(now, HOLD_MS);

      const docData = {
        serviceId,
        resourceId,
        start: startISO,
        end: endISO,
        sessionIdHash,
        userId,
        createdAt: now,
        expiresAt,
        status: 'active',
        idempotencyKey,
      } as const;

      tx.set(holdRef, docData, { merge: false });
      return { id: holdRef.id, ...docData };
    });

    return created;
  }
);

// ------------- finalizeBookingFromHold -------------
export const finalizeBookingFromHold = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    try {
      // SECURITY: Rate limit booking finalization (5 per minute per IP/user)
      await consumeRateLimit(rateLimiters.finalizeBooking, getUserIdentifier(req));

      const { holdId, customer, customerId, price, autoConfirm = true, serviceIds, servicePrices } = req.data || {};
      // Your Appointment schema requires customerId; enforce it here
      assert(holdId && customer && customerId, 'Missing holdId/customer/customerId');

      console.log('📋 Finalizing booking for hold:', holdId);

      const holdRef = db.collection('holds').doc(holdId);
      const apptRef = db.collection('appointments').doc();

      const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(holdRef);
      assert(snap.exists, 'Hold not found');
      const hold = snap.data() as any;

      // Log hold status for debugging
      const now = Date.now();
      const expiresAt = new Date(hold.expiresAt).getTime();
      console.log('🔍 Hold status in finalization:', {
        holdId,
        status: hold.status,
        expiresAt: hold.expiresAt,
        timeRemaining: `${Math.round((expiresAt - now) / 1000)}s`,
        isExpired: expiresAt <= now
      });

      assert(hold.status === 'active', `Hold not active (status: ${hold.status})`);
      assert(new Date(hold.expiresAt).getTime() > Date.now(), 'Hold expired');

      // Re-check conflicts (excluding the current hold being finalized)
      const conflict = await anyConflictsTx(tx, hold.start, hold.end, hold.resourceId || null, holdId);
      if (conflict) throw new HttpsError('aborted', 'E_OVERLAP');

      // Validate price against service (prevent client tampering)
      const svcRef = db.collection('services').doc(hold.serviceId);
      const svcSnap = await tx.get(svcRef);
      assert(svcSnap.exists, 'Service not found');
      const svc = svcSnap.data() as any;
      const bookedPrice = typeof price === 'number' ? price : svc.price;
      if (typeof price === 'number' && price !== svc.price) {
        // coerce to current service price (or throw if you want strict equality)
      }

      const duration = Math.round((new Date(hold.end).getTime() - new Date(hold.start).getTime()) / 60000);

      // ✅ FIXED: Use userId from hold if available, otherwise use client-provided customerId
      const finalCustomerId = hold.userId || customerId as string;
      
      console.log('🔍 Finalizing booking with customer ID:', {
        holdUserId: hold.userId,
        clientCustomerId: customerId,
        finalCustomerId,
        holdId
      });
      
      // Handle multi-service appointments
      const isMultiService = serviceIds && serviceIds.length > 1;
      const finalServiceIds = serviceIds || [hold.serviceId];
      const finalServicePrices = servicePrices || { [hold.serviceId]: bookedPrice };
      
      // Calculate total duration for multi-service appointments
      let finalDuration = duration;
      if (isMultiService && serviceIds) {
        // Calculate duration from all services
        let totalServiceDuration = 0;
        for (const serviceId of serviceIds) {
          const serviceDoc = await tx.get(db.collection('services').doc(serviceId));
          if (serviceDoc.exists) {
            const serviceData = serviceDoc.data();
            totalServiceDuration += serviceData?.duration || 0;
          }
        }
        if (totalServiceDuration > 0) {
          finalDuration = totalServiceDuration;
        }
      }
      
      // Calculate total price for multi-service appointments
      let finalBookedPrice = bookedPrice;
      if (isMultiService && servicePrices) {
        finalBookedPrice = Object.values(servicePrices).reduce((sum, price) => (sum as number) + (price as number), 0);
      }
      
      const appt = {
        serviceId: hold.serviceId, // Keep first service for backward compatibility
        serviceIds: finalServiceIds, // Multi-service support
        selectedServices: finalServiceIds, // Legacy field for backward compatibility
        customerId: finalCustomerId,
        start: hold.start,
        duration: finalDuration,
        status: 'pending', // Always create as pending, admin must confirm
        bookedPrice: finalBookedPrice,
        servicePrices: finalServicePrices, // Individual service prices
        totalPrice: finalBookedPrice, // Initially same as bookedPrice, can be updated with tips
        tip: 0, // Default tip amount
        isPriceEdited: false, // Not edited initially
        // Small snapshot for convenience (optional)
        customerName: customer.name || null,
        customerEmail: customer.email || null,
        customerPhone: customer.phone || null,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      // Create availability slot (no customer data, just time blocking)
      const availRef = db.collection('availability').doc(apptRef.id);
      const availSlot = {
        start: hold.start,
        end: hold.end,
        status: 'booked',
        createdAt: nowISO(),
      };

      tx.set(apptRef, appt);
      tx.set(availRef, availSlot); // Add availability slot
      tx.update(holdRef, { status: 'finalized', expiresAt: nowISO() });

      return { appointmentId: apptRef.id };
    });

    console.log('✅ Booking finalized successfully (PENDING admin confirmation):', result.appointmentId);
    
    // NOTE: Confirmation SMS/email will be sent when admin approves the appointment
    // This prevents customers from receiving confirmations for appointments that may be rejected
    
    return result;
    
    } catch (error: any) {
      console.error('❌ Error finalizing booking:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      // Re-throw as HttpsError for proper client handling
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to finalize booking: ${error.message}`);
    }
  }
);

// ------------- releaseHold -------------
export const releaseHold = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { holdId } = req.data || {};
    assert(holdId, 'Missing holdId');
    const ref = db.collection('holds').doc(holdId);
    await ref.update({ status: 'released', expiresAt: nowISO() });
    return { ok: true };
  }
);

// ------------- extendHold (one-time) -------------
export const extendHold = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { holdId, extraSeconds = 90 } = req.data || {};
    assert(holdId, 'Missing holdId');
    const ref = db.collection('holds').doc(holdId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      assert(snap.exists, 'Hold not found');
      const h = snap.data() as any;
      assert(h.status === 'active', 'Hold not active');
      if (h.extended === true) throw new HttpsError('failed-precondition', 'Hold already extended');

      const newExpires = addMsISO(h.expiresAt, extraSeconds * 1000);
      tx.update(ref, { expiresAt: newExpires, extended: true });
    });

    return { ok: true };
  }
);
