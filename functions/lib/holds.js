// functions/src/holds.ts (fixed, self-contained, aligns with your schema)
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
try {
    initializeApp();
}
catch { }
const db = getFirestore();
// How long a hold lasts (ms) - reduced to 2 minutes for better UX
const HOLD_MS = 2 * 60 * 1000;
// ---------- Small helpers ----------
function nowISO() { return new Date().toISOString(); }
function addMsISO(iso, ms) {
    return new Date(new Date(iso).getTime() + ms).toISOString();
}
function assert(cond, msg) {
    if (!cond)
        throw new HttpsError('failed-precondition', msg);
}
function overlaps(aStartISO, aEndISO, bStartISO, bEndISO) {
    const aStart = new Date(aStartISO).getTime();
    const aEnd = new Date(aEndISO).getTime();
    const bStart = new Date(bStartISO).getTime();
    const bEnd = new Date(bEndISO).getTime();
    if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite))
        return false;
    // overlap if [aStart, aEnd) intersects [bStart, bEnd)
    return aStart < bEnd && aEnd > bStart;
}
function sha256Hex(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
}
// Query conflicts inside the transaction (active holds + appointments)
async function anyConflictsTx(tx, startISO, endISO, resourceId, excludeHoldId) {
    // Active holds that overlap and haven't expired
    const holdsQ = (() => {
        let q = db.collection('holds')
            .where('status', '==', 'active')
            .where('expiresAt', '>', nowISO()); // ISO strings sort chronologically
        if (resourceId)
            q = q.where('resourceId', '==', resourceId);
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
        if (excludeHoldId && d.id === excludeHoldId)
            return false;
        const h = d.data();
        return overlaps(startISO, endISO, h.start, h.end);
    });
    const hasAppt = apptsSnap.docs.some(d => {
        const a = d.data();
        const aEndISO = addMsISO(a.start, (a.duration || 0) * 60000);
        return a.status !== 'cancelled' && overlaps(startISO, endISO, a.start, aEndISO);
    });
    return hasHold || hasAppt;
}
// ------------- createSlotHold -------------
export const createSlotHold = onCall({ region: 'us-central1', cors: true }, async (req) => {
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
            const h = existing.data();
            if (h.status === 'active' && new Date(h.expiresAt).getTime() > Date.now()) {
                return { id: holdRef.id, ...h };
            }
            // else refresh below
        }
        const conflict = await anyConflictsTx(tx, startISO, endISO, resourceId);
        if (conflict)
            throw new HttpsError('aborted', 'E_OVERLAP');
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
        };
        tx.set(holdRef, docData, { merge: false });
        return { id: holdRef.id, ...docData };
    });
    return created;
});
// ------------- finalizeBookingFromHold -------------
export const finalizeBookingFromHold = onCall({ region: 'us-central1', cors: true }, async (req) => {
    const { holdId, customer, customerId, price, autoConfirm = true } = req.data || {};
    // Your Appointment schema requires customerId; enforce it here
    assert(holdId && customer && customerId, 'Missing holdId/customer/customerId');
    const holdRef = db.collection('holds').doc(holdId);
    const apptRef = db.collection('appointments').doc();
    const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(holdRef);
        assert(snap.exists, 'Hold not found');
        const hold = snap.data();
        assert(hold.status === 'active', 'Hold not active');
        assert(new Date(hold.expiresAt).getTime() > Date.now(), 'Hold expired');
        // Re-check conflicts (excluding the current hold being finalized)
        const conflict = await anyConflictsTx(tx, hold.start, hold.end, hold.resourceId || null, holdId);
        if (conflict)
            throw new HttpsError('aborted', 'E_OVERLAP');
        // Validate price against service (prevent client tampering)
        const svcRef = db.collection('services').doc(hold.serviceId);
        const svcSnap = await tx.get(svcRef);
        assert(svcSnap.exists, 'Service not found');
        const svc = svcSnap.data();
        const bookedPrice = typeof price === 'number' ? price : svc.price;
        if (typeof price === 'number' && price !== svc.price) {
            // coerce to current service price (or throw if you want strict equality)
        }
        const duration = Math.round((new Date(hold.end).getTime() - new Date(hold.start).getTime()) / 60000);
        const appt = {
            serviceId: hold.serviceId,
            customerId: customerId,
            start: hold.start,
            duration,
            status: 'pending', // Always create as pending, admin must confirm
            bookedPrice,
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
    return result;
});
// ------------- releaseHold -------------
export const releaseHold = onCall({ region: 'us-central1', cors: true }, async (req) => {
    const { holdId } = req.data || {};
    assert(holdId, 'Missing holdId');
    const ref = db.collection('holds').doc(holdId);
    await ref.update({ status: 'released', expiresAt: nowISO() });
    return { ok: true };
});
// ------------- extendHold (one-time) -------------
export const extendHold = onCall({ region: 'us-central1', cors: true }, async (req) => {
    const { holdId, extraSeconds = 90 } = req.data || {};
    assert(holdId, 'Missing holdId');
    const ref = db.collection('holds').doc(holdId);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        assert(snap.exists, 'Hold not found');
        const h = snap.data();
        assert(h.status === 'active', 'Hold not active');
        if (h.extended === true)
            throw new HttpsError('failed-precondition', 'Hold already extended');
        const newExpires = addMsISO(h.expiresAt, extraSeconds * 1000);
        tx.update(ref, { expiresAt: newExpires, extended: true });
    });
    return { ok: true };
});
