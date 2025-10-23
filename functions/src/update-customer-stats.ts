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

    const { customerId } = appointmentData;

    try {
      await recalculateCustomerStats(customerId);
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
      await recalculateCustomerStats(customerId);
    } catch (error) {
      console.error('Error updating customer stats on status change:', error);
    }
  }
);

// Helper function to recalculate customer stats using the same logic as CustomerProfile
async function recalculateCustomerStats(customerId: string) {
  const customerRef = db.collection('customers').doc(customerId);
  const customerDoc = await customerRef.get();
  
  if (!customerDoc.exists) {
    console.log('Customer not found:', customerId);
    return;
  }

  // Get all appointments for this customer
  const appointmentsSnapshot = await db.collection('appointments')
    .where('customerId', '==', customerId)
    .get();

  const appointments = appointmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as any));

  // Calculate total visits using the same logic as CustomerProfile
  // Count only completed appointments OR confirmed appointments in the past
  const now = new Date();
  const completedVisits = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start);
    return (
      (appointment.status === 'completed') ||
      (appointment.status === 'confirmed' && appointmentDate < now)
    );
  });

  const totalVisits = completedVisits.length;
  let lastVisit = null;

  if (completedVisits.length > 0) {
    // Find the most recent completed visit
    const sortedCompletedVisits = completedVisits.sort((a, b) => 
      new Date(b.start).getTime() - new Date(a.start).getTime()
    );
    lastVisit = new Date(sortedCompletedVisits[0].start);
  }

  // Update customer with correct stats
  await customerRef.update({
    totalVisits,
    lastVisit: lastVisit ? lastVisit.toISOString() : null,
    updatedAt: new Date().toISOString()
  });

  console.log(`Recalculated customer ${customerId} stats: ${totalVisits} total visits`);
}
