import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

/**
 * Cloud Function to close shop for a specific date
 * This will:
 * 1. Create a day closure record
 * 2. Cancel all pending/confirmed appointments for that day
 * 3. Remove any holds for that day
 */
export const closeShopForDate = onCall(
  { region: 'us-central1' },
  async (request) => {
    // Verify admin authentication
    if (!request.auth || request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can close the shop');
    }

    const { date, reason } = request.data;

    // Validate date format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpsError('invalid-argument', 'Invalid date format. Use YYYY-MM-DD');
    }

    try {
      // 1. Create day closure record
      const closureRef = db.collection('dayClosures').doc();
      await closureRef.set({
        date,
        reason: reason || 'Shop closed',
        closedBy: request.auth.uid,
        closedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });

      // 2. Get start and end of day in ISO format
      const startOfDay = new Date(date + 'T00:00:00.000Z').toISOString();
      const endOfDay = new Date(date + 'T23:59:59.999Z').toISOString();

      // 3. Find and cancel all pending/confirmed appointments for this day
      const appointmentsQuery = db.collection('appointments')
        .where('start', '>=', startOfDay)
        .where('start', '<=', endOfDay);

      const appointmentsSnapshot = await appointmentsQuery.get();
      let cancelledCount = 0;

      const batch = db.batch();
      for (const doc of appointmentsSnapshot.docs) {
        const appt = doc.data();
        if (appt.status === 'pending' || appt.status === 'confirmed') {
          batch.update(doc.ref, {
            status: 'cancelled',
            cancelledAt: FieldValue.serverTimestamp(),
            cancelledBy: request.auth.uid,
            notes: (appt.notes || '') + '\n[Shop closed for the day]'
          });
          cancelledCount++;
        }
      }

      await batch.commit();

      // 4. Remove any holds for this day
      const holdsQuery = db.collection('holds')
        .where('start', '>=', startOfDay)
        .where('start', '<=', endOfDay);

      const holdsSnapshot = await holdsQuery.get();
      const holdsBatch = db.batch();
      
      for (const doc of holdsSnapshot.docs) {
        holdsBatch.delete(doc.ref);
      }

      await holdsBatch.commit();

      return {
        success: true,
        message: `Shop closed for ${date}. ${cancelledCount} appointment(s) cancelled.`,
        closureId: closureRef.id,
        cancelledCount,
        holdsRemoved: holdsSnapshot.size
      };

    } catch (error: any) {
      console.error('Error closing shop:', error);
      throw new HttpsError('internal', error?.message || 'Failed to close shop');
    }
  }
);

/**
 * Cloud Function to reopen shop for a specific date
 * This will remove the day closure record
 */
export const reopenShopForDate = onCall(
  { region: 'us-central1' },
  async (request) => {
    // Verify admin authentication
    if (!request.auth || request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can reopen the shop');
    }

    const { date } = request.data;

    // Validate date format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpsError('invalid-argument', 'Invalid date format. Use YYYY-MM-DD');
    }

    try {
      // Find and delete the closure record
      const closuresQuery = db.collection('dayClosures')
        .where('date', '==', date)
        .limit(1);

      const snapshot = await closuresQuery.get();

      if (snapshot.empty) {
        throw new HttpsError('not-found', `No closure found for ${date}`);
      }

      await snapshot.docs[0].ref.delete();

      return {
        success: true,
        message: `Shop reopened for ${date}`,
      };

    } catch (error: any) {
      console.error('Error reopening shop:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', error?.message || 'Failed to reopen shop');
    }
  }
);

/**
 * Cloud Function to set special hours for a specific date
 */
export const setSpecialHoursForDate = onCall(
  { region: 'us-central1' },
  async (request) => {
    // Verify admin authentication
    if (!request.auth || request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can set special hours');
    }

    const { date, ranges, reason } = request.data;

    // Validate date format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpsError('invalid-argument', 'Invalid date format. Use YYYY-MM-DD');
    }

    // Validate ranges
    if (!Array.isArray(ranges)) {
      throw new HttpsError('invalid-argument', 'Ranges must be an array');
    }

    try {
      // Check if special hours already exist for this date
      const existingQuery = db.collection('specialHours')
        .where('date', '==', date)
        .limit(1);

      const snapshot = await existingQuery.get();

      if (!snapshot.empty) {
        // Update existing
        const docRef = snapshot.docs[0].ref;
        await docRef.update({
          ranges,
          reason: reason || 'Special hours',
          modifiedBy: request.auth.uid,
          modifiedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          message: `Special hours updated for ${date}`,
          specialHoursId: docRef.id,
        };
      } else {
        // Create new
        const docRef = db.collection('specialHours').doc();
        await docRef.set({
          date,
          ranges,
          reason: reason || 'Special hours',
          modifiedBy: request.auth.uid,
          modifiedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          message: `Special hours set for ${date}`,
          specialHoursId: docRef.id,
        };
      }

    } catch (error: any) {
      console.error('Error setting special hours:', error);
      throw new HttpsError('internal', error?.message || 'Failed to set special hours');
    }
  }
);

