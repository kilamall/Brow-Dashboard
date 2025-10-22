// functions/src/update-customer-stats.ts
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Update customer stats when appointment is created
export const onAppointmentCreatedUpdateStats = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const appointmentData = event.data?.data();
    if (!appointmentData) return;

    const { customerId, start, status } = appointmentData;
    
    // Only update stats for confirmed appointments
    if (status !== 'confirmed') return;

    try {
      const customerRef = db.collection('customers').doc(customerId);
      const customerDoc = await customerRef.get();
      
      if (!customerDoc.exists) {
        console.log('Customer not found:', customerId);
        return;
      }

      const customerData = customerDoc.data();
      const currentVisits = customerData?.totalVisits || 0;
      const appointmentDate = new Date(start);

      // Update customer stats
      await customerRef.update({
        totalVisits: currentVisits + 1,
        lastVisit: appointmentDate,
        updatedAt: new Date().toISOString()
      });

      console.log(`Updated customer ${customerId} stats: ${currentVisits + 1} total visits`);
    } catch (error) {
      console.error('Error updating customer stats:', error);
    }
  }
);

// Update customer stats when appointment status changes
export const onAppointmentStatusChangedUpdateStats = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;

    const { customerId } = afterData;
    const oldStatus = beforeData.status;
    const newStatus = afterData.status;

    // Only process if status actually changed
    if (oldStatus === newStatus) return;

    try {
      const customerRef = db.collection('customers').doc(customerId);
      const customerDoc = await customerRef.get();
      
      if (!customerDoc.exists) {
        console.log('Customer not found:', customerId);
        return;
      }

      const customerData = customerDoc.data();
      const currentVisits = customerData?.totalVisits || 0;

      // If appointment was cancelled, decrement visits
      if (oldStatus === 'confirmed' && newStatus === 'cancelled') {
        await customerRef.update({
          totalVisits: Math.max(0, currentVisits - 1),
          updatedAt: new Date().toISOString()
        });
        console.log(`Decremented visits for customer ${customerId}: ${Math.max(0, currentVisits - 1)} total visits`);
      }
      // If appointment was confirmed, increment visits
      else if (oldStatus !== 'confirmed' && newStatus === 'confirmed') {
        const appointmentDate = new Date(afterData.start);
        await customerRef.update({
          totalVisits: currentVisits + 1,
          lastVisit: appointmentDate,
          updatedAt: new Date().toISOString()
        });
        console.log(`Incremented visits for customer ${customerId}: ${currentVisits + 1} total visits`);
      }
    } catch (error) {
      console.error('Error updating customer stats on status change:', error);
    }
  }
);
