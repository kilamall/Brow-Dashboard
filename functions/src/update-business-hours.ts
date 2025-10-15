import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}

export const updateBusinessHours = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const db = getFirestore();
    
    // Set business hours in correct format
    await db.collection('settings').doc('businessHours').set({
      timezone: 'America/Los_Angeles',
      slotInterval: 15,
      slots: {
        sun: { ranges: [{ start: '10:00', end: '16:00' }] },
        mon: { ranges: [] },
        tue: { ranges: [{ start: '09:00', end: '18:00' }] },
        wed: { ranges: [{ start: '09:00', end: '18:00' }] },
        thu: { ranges: [{ start: '09:00', end: '19:00' }] },
        fri: { ranges: [{ start: '09:00', end: '19:00' }] },
        sat: { ranges: [{ start: '09:00', end: '17:00' }] }
      }
    });
    
    res.json({ success: true, message: 'Business hours updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

