// functions/src/sync-customer-visits.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// One-time function to sync customer visit counts
export const syncCustomerVisits = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can sync customer visits');
    }

    try {
      console.log('Starting customer visit sync...');
      
      // Get all customers
      const customersSnapshot = await db.collection('customers').get();
      const customers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${customers.length} customers to process`);

      let updatedCount = 0;
      let errorCount = 0;

      // Process each customer
      for (const customer of customers) {
        try {
          // Get all confirmed appointments for this customer
          const appointmentsSnapshot = await db.collection('appointments')
            .where('customerId', '==', customer.id)
            .where('status', '==', 'confirmed')
            .get();

          const appointments = appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as any));

          // Calculate total visits and last visit
          const totalVisits = appointments.length;
          let lastVisit = null;

          if (appointments.length > 0) {
            // Find the most recent appointment
            const sortedAppointments = appointments.sort((a, b) => 
              new Date(b.start).getTime() - new Date(a.start).getTime()
            );
            lastVisit = new Date(sortedAppointments[0].start);
          }

          // Update customer with correct stats
          await db.collection('customers').doc(customer.id).update({
            totalVisits,
            lastVisit: lastVisit ? lastVisit.toISOString() : null,
            updatedAt: new Date().toISOString()
          });

          console.log(`Updated customer ${(customer as any).name} (${customer.id}): ${totalVisits} visits`);
          updatedCount++;

        } catch (error) {
          console.error(`Error updating customer ${customer.id}:`, error);
          errorCount++;
        }
      }

      const result = {
        message: `Customer visit sync completed`,
        totalCustomers: customers.length,
        updatedCount,
        errorCount,
        timestamp: new Date().toISOString()
      };

      console.log('Sync completed:', result);
      return result;

    } catch (error: any) {
      console.error('Error in syncCustomerVisits:', error);
      throw new HttpsError('internal', `Sync failed: ${error.message}`);
    }
  }
);
