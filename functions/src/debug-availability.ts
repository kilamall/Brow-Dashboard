import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const debugAvailability = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    console.log('🔍 Debugging availability for October 19, 2025...');
    
    try {
      // Check appointments for October 19, 2025
      const startDate = new Date('2025-10-19T00:00:00.000Z');
      const endDate = new Date('2025-10-19T23:59:59.999Z');
      
      console.log('📅 Checking appointments between:', startDate.toISOString(), 'and', endDate.toISOString());
      
      const appointmentsRef = db.collection('appointments');
      const appointmentsQuery = appointmentsRef
        .where('start', '>=', startDate.toISOString())
        .where('start', '<=', endDate.toISOString());
      
      const appointmentsSnap = await appointmentsQuery.get();
      const appointments: any[] = [];
      
      appointmentsSnap.forEach(doc => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          start: data.start,
          duration: data.duration,
          status: data.status,
          customerName: data.customerName,
          serviceId: data.serviceId
        });
      });
      
      console.log(`📋 Found ${appointments.length} appointments for October 19, 2025`);
      
      // Check availability collection for October 19, 2025
      const availabilityRef = db.collection('availability');
      const availabilityQuery = availabilityRef
        .where('start', '>=', startDate.toISOString())
        .where('start', '<=', endDate.toISOString());
      
      const availabilitySnap = await availabilityQuery.get();
      const availability: any[] = [];
      
      availabilitySnap.forEach(doc => {
        const data = doc.data();
        availability.push({
          id: doc.id,
          start: data.start,
          end: data.end,
          status: data.status,
          createdAt: data.createdAt
        });
      });
      
      console.log(`📊 Found ${availability.length} availability slots for October 19, 2025`);
      
      // Check for any holds
      const holdsRef = db.collection('holds');
      const holdsQuery = holdsRef.where('status', '==', 'active');
      const holdsSnap = await holdsQuery.get();
      const holds: any[] = [];
      
      holdsSnap.forEach(doc => {
        const data = doc.data();
        holds.push({
          id: doc.id,
          start: data.start,
          end: data.end,
          status: data.status,
          expiresAt: data.expiresAt
        });
      });
      
      console.log(`🔒 Found ${holds.length} active holds`);
      
      return {
        success: true,
        date: '2025-10-19',
        appointments,
        availability,
        holds,
        summary: {
          appointmentsCount: appointments.length,
          availabilityCount: availability.length,
          holdsCount: holds.length
        }
      };
      
    } catch (error: any) {
      console.error('❌ Error debugging availability:', error);
      throw new HttpsError('internal', `Failed to debug availability: ${error.message}`);
    }
  }
);
