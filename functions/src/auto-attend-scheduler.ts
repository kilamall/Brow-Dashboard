// functions/src/auto-attend-scheduler.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const autoMarkAttendedEndOfDay = onSchedule({
  schedule: '0 21 * * *', // 9 PM daily
  timeZone: 'America/Los_Angeles',
  memory: '1GiB',
  timeoutSeconds: 300, // 5 minutes
}, async (event) => {
  console.log('🕘 Running end-of-day auto-attendance check...');
  
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Find all confirmed/pending appointments from today with no attendance marked
    const appointmentsQuery = await db.collection('appointments')
      .where('start', '>=', today.toISOString())
      .where('start', '<', tomorrow.toISOString())
      .where('status', 'in', ['confirmed', 'pending'])
      .get();
    
    console.log(`Found ${appointmentsQuery.size} appointments from today`);
    
    const results = {
      autoAttended: 0,
      errors: 0,
      timestamp: new Date().toISOString()
    };
    
    for (const doc of appointmentsQuery.docs) {
      const appointment: any = { id: doc.id, ...doc.data() };
      
      // Skip if already marked
      if (appointment.attendance && appointment.attendance !== 'pending') {
        console.log(`Skipping ${appointment.id} - already marked as ${appointment.attendance}`);
        continue;
      }
      
      try {
        // Auto-mark as attended and completed
        await doc.ref.update({
          attendance: 'attended',
          attendanceMarkedAt: new Date().toISOString(),
          attendanceMarkedBy: 'auto-scheduler',
          status: 'completed',
          completedAt: new Date().toISOString(),
          completedBy: 'auto-scheduler',
          updatedAt: new Date().toISOString()
        });
        
        // Send post-service receipt
        try {
          const { sendPostServiceReceipt } = await import('./post-service-receipt.js');
          await sendPostServiceReceipt(appointment.id);
          console.log(`📧 Post-service receipt sent for auto-attended appointment: ${appointment.id}`);
        } catch (error) {
          console.error(`⚠️ Error sending post-service receipt for ${appointment.id}:`, error);
          // Don't fail the auto-attendance if receipt fails
        }
        
        results.autoAttended++;
        console.log(`✅ Auto-marked as attended: ${appointment.id}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error auto-marking attendance for ${appointment.id}:`, error);
        results.errors++;
      }
    }
    
    console.log('✅ End-of-day auto-attendance completed:', results);
    
  } catch (error) {
    console.error('❌ Error in auto-attend-scheduler:', error);
  }
});
