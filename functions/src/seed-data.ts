import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}

/**
 * One-time function to seed initial data
 * Call via: curl -X POST https://us-central1-bueno-brows-7cce7.cloudfunctions.net/seedInitialData
 * 
 * ⚠️ REMOVE THIS FUNCTION AFTER RUNNING!
 */
export const seedInitialData = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
  // CORS is handled by the function configuration

  try {
    const db = getFirestore();
    const results = [];

    // Add sample services
    const services = [
      {
        name: 'Brow Shaping',
        description: 'Professional eyebrow shaping and styling',
        price: 45,
        duration: 45,
        category: 'Brows',
        active: true
      },
      {
        name: 'Brow Tinting',
        description: 'Natural brow tinting for enhanced definition',
        price: 35,
        duration: 30,
        category: 'Brows',
        active: true
      },
      {
        name: 'Lash Lift',
        description: 'Semi-permanent lash curl treatment',
        price: 75,
        duration: 60,
        category: 'Lashes',
        active: true
      },
      {
        name: 'Lash Extensions - Full Set',
        description: 'Full set of classic lash extensions',
        price: 150,
        duration: 120,
        category: 'Lashes',
        active: true
      },
      {
        name: 'Lash Fill',
        description: '2-3 week lash extension refill',
        price: 75,
        duration: 75,
        category: 'Lashes',
        active: true
      }
    ];

    for (const service of services) {
      const ref = await db.collection('services').add(service);
      results.push(`Added service: ${service.name} (${ref.id})`);
    }

    // Add business hours
    await db.collection('settings').doc('businessHours').set({
      monday: { open: null, close: null },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '19:00' },
      friday: { open: '09:00', close: '19:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' }
    });
    results.push('Added business hours');

    // Add analytics targets
    await db.collection('settings').doc('analyticsTargets').set({
      dailyTarget: 500,
      weeklyTarget: 3000,
      monthlyTarget: 12000,
      defaultCogsRate: 30
    });
    results.push('Added analytics targets');

    res.json({
      success: true,
      message: 'Initial data seeded successfully!',
      results,
      warning: '⚠️ Remove this function after running!'
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
  }
);

