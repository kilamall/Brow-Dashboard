/**
 * Script to seed initial data for testing
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

async function seedData() {
  console.log('🌱 Seeding initial data...\n');

  // Add sample services
  console.log('Adding services...');
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
    await db.collection('services').add(service);
    console.log(`  ✅ Added: ${service.name}`);
  }

  // Add business hours
  console.log('\nAdding business hours...');
  await db.collection('settings').doc('businessHours').set({
    monday: { open: null, close: null }, // Closed
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '19:00' },
    friday: { open: '09:00', close: '19:00' },
    saturday: { open: '09:00', close: '17:00' },
    sunday: { open: '10:00', close: '16:00' }
  });
  console.log('  ✅ Business hours set');

  // Add analytics targets
  console.log('\nAdding analytics targets...');
  await db.collection('settings').doc('analyticsTargets').set({
    dailyTarget: 500,
    weeklyTarget: 3000,
    monthlyTarget: 12000,
    defaultCogsRate: 30 // 30% cost of goods sold
  });
  console.log('  ✅ Analytics targets set');

  console.log('\n🎉 Seed data complete!');
  console.log('\nYou can now:');
  console.log('  1. View services at: https://bueno-brows-admin.web.app/services');
  console.log('  2. Create appointments at: https://bueno-brows-admin.web.app/schedule');
  console.log('  3. View analytics at: https://bueno-brows-admin.web.app/home');
  
  process.exit(0);
}

seedData().catch(err => {
  console.error('❌ Error seeding data:', err);
  process.exit(1);
});

