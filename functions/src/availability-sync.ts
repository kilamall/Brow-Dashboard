// functions/src/availability-sync.ts
// Sync availability collection when appointments change

import { onDocumentWritten, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Sync availability when appointments are updated
 * Creates/updates/deletes availability slots to match appointment status
 */
export const syncAvailabilityOnAppointmentChange = onDocumentWritten(
  { document: 'appointments/{appointmentId}', region: 'us-central1' },
  async (event) => {
    const appointmentId = event.params.appointmentId;
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    const availRef = db.collection('availability').doc(appointmentId);

    // Appointment deleted
    if (!after) {
      console.log(`Appointment ${appointmentId} deleted, removing availability slot`);
      await availRef.delete();
      return;
    }

    // Appointment cancelled
    if (after.status === 'cancelled') {
      console.log(`Appointment ${appointmentId} cancelled, removing availability slot`);
      await availRef.delete();
      return;
    }

    // Appointment created or updated
    const startMs = new Date(after.start).getTime();
    const endMs = startMs + (after.duration * 60 * 1000);
    const end = new Date(endMs).toISOString();

    const availSlot = {
      start: after.start,
      end,
      status: 'booked',
      createdAt: after.createdAt || new Date().toISOString(),
    };

    // If this is a new appointment (before doesn't exist), create the availability
    // If it already exists, update it
    if (!before) {
      console.log(`Creating availability slot for new appointment ${appointmentId}`);
    } else {
      console.log(`Updating availability slot for appointment ${appointmentId}`);
    }

    await availRef.set(availSlot, { merge: false });
  }
);

/**
 * Clean up availability when appointments are hard-deleted
 */
export const cleanupAvailabilityOnAppointmentDelete = onDocumentDeleted(
  { document: 'appointments/{appointmentId}', region: 'us-central1' },
  async (event) => {
    const appointmentId = event.params.appointmentId;
    const availRef = db.collection('availability').doc(appointmentId);
    
    console.log(`Hard delete of appointment ${appointmentId}, removing availability slot`);
    await availRef.delete();
  }
);


