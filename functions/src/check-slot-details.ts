// functions/src/check-slot-details.ts
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const checkSlotDetails = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    try {
      const slotId = req.query.slotId as string;
      
      if (!slotId) {
        res.status(400).json({ error: 'slotId parameter required' });
        return;
      }
      
      console.log('🔍 Checking details for slot:', slotId);
      
      // Check availability collection
      const availabilityDoc = await db.collection('availability').doc(slotId).get();
      
      if (!availabilityDoc.exists) {
        res.status(404).json({ error: 'Slot not found in availability collection' });
        return;
      }
      
      const availabilityData = availabilityDoc.data();
      
      // Check if there's a corresponding appointment
      let appointmentData = null;
      try {
        const appointmentDoc = await db.collection('appointments').doc(slotId).get();
        if (appointmentDoc.exists) {
          appointmentData = appointmentDoc.data();
        }
      } catch (e) {
        console.log('No corresponding appointment found (this is normal for held slots)');
      }
      
      // Check if there's a corresponding hold
      let holdData = null;
      try {
        const holdsQuery = await db.collection('holds').where('idempotencyKey', '==', slotId).get();
        if (!holdsQuery.empty) {
          holdData = holdsQuery.docs[0].data();
        }
      } catch (e) {
        console.log('No corresponding hold found');
      }
      
      res.json({
        success: true,
        slotId,
        availability: availabilityData,
        appointment: appointmentData,
        hold: holdData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ Error checking slot details:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
