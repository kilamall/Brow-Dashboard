// Diagnostic function to check reminder and receipt system status
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const diagnoseRemindersAndReceipts = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const now = new Date();
    const results: any = {
      timestamp: now.toISOString(),
      reminderSystem: {
        scheduledFunction: 'sendAppointmentReminders',
        status: 'unknown',
        lastRun: null,
        nextRun: null,
        issues: []
      },
      receipts: {
        recentReceipts: [],
        issues: []
      },
      upcomingAppointments: {
        total: 0,
        needReminders: {
          sevenDay: 0,
          twentyFourHour: 0,
          twoHour: 0
        }
      }
    };

    try {
      // Check for upcoming appointments that need reminders
      const eightDaysFromNow = new Date(now.getTime() + (8 * 24 * 60 * 60 * 1000));
      const upcomingAppointments = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', now.toISOString())
        .where('start', '<=', eightDaysFromNow.toISOString())
        .limit(100)
        .get();

      results.upcomingAppointments.total = upcomingAppointments.size;

      for (const doc of upcomingAppointments.docs) {
        const appointment: any = { id: doc.id, ...doc.data() };
        const appointmentTime = new Date(appointment.start);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const hoursUntil = timeDiff / (1000 * 60 * 60);
        const daysUntil = hoursUntil / 24;

        // Check which reminders are needed
        if (daysUntil >= 6.5 && daysUntil <= 7.5 && !appointment.sevenDayReminderSent) {
          results.upcomingAppointments.needReminders.sevenDay++;
        }
        if (hoursUntil >= 23 && hoursUntil <= 25 && !appointment.reminderSent) {
          results.upcomingAppointments.needReminders.twentyFourHour++;
        }
        if (hoursUntil >= 1.5 && hoursUntil <= 3 && !appointment.twoHourReminderSent) {
          results.upcomingAppointments.needReminders.twoHour++;
        }
      }

      // Check recent receipts (last 7 days)
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const recentAppointments = await db.collection('appointments')
        .where('status', '==', 'completed')
        .where('completedAt', '>=', sevenDaysAgo.toISOString())
        .orderBy('completedAt', 'desc')
        .limit(20)
        .get();

      for (const doc of recentAppointments.docs) {
        const appointment: any = { id: doc.id, ...doc.data() };
        const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
        const customer = customerDoc.exists ? customerDoc.data() : null;

        results.receipts.recentReceipts.push({
          appointmentId: appointment.id,
          completedAt: appointment.completedAt,
          receiptGenerated: !!appointment.receiptUrl,
          receiptUrl: appointment.receiptUrl || null,
          customerEmail: customer?.email || null,
          customerPhone: customer?.phone || customer?.phoneNumber || null,
          hasContactInfo: !!(customer?.email || customer?.phone || customer?.phoneNumber)
        });

        // Check for issues
        if (appointment.status === 'completed' && !appointment.receiptUrl) {
          results.receipts.issues.push({
            type: 'missing_receipt',
            appointmentId: appointment.id,
            message: 'Appointment completed but no receipt generated'
          });
        }

        if (appointment.receiptUrl && !customer?.email && !customer?.phone && !customer?.phoneNumber) {
          results.receipts.issues.push({
            type: 'receipt_not_sent',
            appointmentId: appointment.id,
            message: 'Receipt generated but customer has no email or phone'
          });
        }
      }

      // Check Firestore index status (we can't directly check, but we can test a query)
      try {
        const testQuery = await db.collection('appointments')
          .where('status', '==', 'confirmed')
          .where('start', '>=', now.toISOString())
          .limit(1)
          .get();
        results.reminderSystem.indexStatus = 'working';
      } catch (error: any) {
        if (error.message?.includes('index')) {
          results.reminderSystem.issues.push({
            type: 'index_missing',
            message: 'Firestore index may be missing. Deploy indexes with: firebase deploy --only firestore:indexes'
          });
          results.reminderSystem.indexStatus = 'error';
        }
      }

      // Check for appointments that should have received reminders but didn't
      const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const pastAppointments = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', oneDayAgo.toISOString())
        .where('start', '<=', now.toISOString())
        .limit(50)
        .get();

      for (const doc of pastAppointments.docs) {
        const appointment: any = { id: doc.id, ...doc.data() };
        const appointmentTime = new Date(appointment.start);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const hoursUntil = Math.abs(timeDiff / (1000 * 60 * 60));

        // If appointment was in the last 24 hours and no reminder was sent
        if (hoursUntil <= 24 && !appointment.reminderSent && !appointment.twoHourReminderSent) {
          results.reminderSystem.issues.push({
            type: 'missed_reminder',
            appointmentId: appointment.id,
            message: `Appointment ${hoursUntil.toFixed(1)} hours ago but no reminder sent`
          });
        }
      }

      return results;

    } catch (error: any) {
      console.error('Error in diagnoseRemindersAndReceipts:', error);
      throw new HttpsError('internal', `Diagnostic failed: ${error.message}`);
    }
  }
);




