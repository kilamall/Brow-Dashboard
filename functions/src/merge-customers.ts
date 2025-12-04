// functions/src/merge-customers.ts
// Merge duplicate customers with full transaction safety and audit trail
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const mergeCustomers = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users to merge customers
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can merge customers');
    }

    const { survivorId, duplicateId } = req.data || {};
    
    if (!survivorId || !duplicateId) {
      throw new HttpsError('invalid-argument', 'Both survivorId and duplicateId are required');
    }

    if (survivorId === duplicateId) {
      throw new HttpsError('invalid-argument', 'Cannot merge customer with itself');
    }

    console.log(`🔄 Starting customer merge: ${duplicateId} → ${survivorId}`);

    try {
      const result = await db.runTransaction(async (tx) => {
        // Step 1: Verify both customers exist
        const survivorRef = db.doc(`customers/${survivorId}`);
        const duplicateRef = db.doc(`customers/${duplicateId}`);
        
        const [survivorDoc, duplicateDoc] = await Promise.all([
          tx.get(survivorRef),
          tx.get(duplicateRef)
        ]);

        if (!survivorDoc.exists) {
          throw new HttpsError('not-found', `Survivor customer ${survivorId} not found`);
        }
        if (!duplicateDoc.exists) {
          throw new HttpsError('not-found', `Duplicate customer ${duplicateId} not found`);
        }

        const survivor = survivorDoc.data();
        const duplicate = duplicateDoc.data();

        // Step 2: Check if duplicate is already merged
        // Allow merge even if already marked as merged (to fix orphaned states)
        if (duplicate?.status === 'merged' && duplicate?.mergedInto === survivorId) {
          // Already merged to the same survivor - this is a no-op
          console.log(`ℹ️ Customer ${duplicateId} is already merged into ${survivorId}. Skipping merge.`);
          return {
            success: true,
            survivorId,
            duplicateId,
            subcollectionDocsMoved: 0,
            appointmentsUpdated: 0,
            holdsUpdated: 0,
            availabilityUpdated: 0,
            skinAnalysesUpdated: 0,
            consentFormsUpdated: 0,
            uniqueContactsUpdated: 0,
            mergeRecordId: null,
            message: 'Customer already merged to this survivor'
          };
        }
        
        // If merged to a different customer, allow override to fix orphaned states
        if (duplicate?.status === 'merged' && duplicate?.mergedInto !== survivorId) {
          console.log(`⚠️ Customer ${duplicateId} is marked as merged to ${duplicate.mergedInto}, but merging to ${survivorId}. This will fix orphaned state.`);
        }

        // Step 2.5: Validate customer documents are in a valid state for merging
        // Check if duplicate has orphaned migratedTo field (points to non-existent customer)
        if (duplicate?.migratedTo) {
          const migratedToRef = db.doc(`customers/${duplicate.migratedTo}`);
          const migratedToDoc = await tx.get(migratedToRef);
          
          if (!migratedToDoc.exists) {
            console.log(`⚠️ Duplicate customer ${duplicateId} has orphaned migratedTo field pointing to non-existent customer ${duplicate.migratedTo}. Clearing it before merge.`);
            // Clear the orphaned migratedTo field as part of the merge
            // This will be handled in Step 11 when we update the duplicate
          } else if (duplicate.migratedTo !== survivorId) {
            // If migratedTo points to a different customer, warn but allow merge
            console.log(`⚠️ Duplicate customer ${duplicateId} has migratedTo pointing to ${duplicate.migratedTo}, but merging to ${survivorId}. This will override the previous migration.`);
          }
        }

        // Step 2.6: Check if duplicate is already marked as merged (status: 'merged')
        if (duplicate?.status === 'merged' || duplicate?.identityStatus === 'migrated') {
          console.log(`⚠️ Duplicate customer ${duplicateId} is already marked as merged (status: ${duplicate.status}, identityStatus: ${duplicate.identityStatus}). Proceeding with merge to clear orphaned state.`);
        }

        // Step 2.7: Validate that both customer documents have required fields
        if (!survivor?.name && !survivor?.email && !survivor?.phone) {
          console.warn(`⚠️ Survivor customer ${survivorId} appears to be missing all identifying information (name, email, phone). Proceeding with merge.`);
        }
        if (!duplicate?.name && !duplicate?.email && !duplicate?.phone) {
          console.warn(`⚠️ Duplicate customer ${duplicateId} appears to be missing all identifying information (name, email, phone). Proceeding with merge.`);
        }

        // Step 3: Copy subcollections from duplicate to survivor
        const subcollections = ['contacts', 'notes', 'files', 'interactions'];
        let totalSubcollectionDocs = 0;

        for (const subcollection of subcollections) {
          const subcollectionRef = db.collection(`customers/${duplicateId}/${subcollection}`);
          const subcollectionDocs = await subcollectionRef.get();
          
          for (const doc of subcollectionDocs.docs) {
            const newDocRef = db.doc(`customers/${survivorId}/${subcollection}/${doc.id}`);
            tx.set(newDocRef, doc.data());
            totalSubcollectionDocs++;
          }
        }

        // Step 4: Update all appointments to point to survivor
        const appointmentsQuery = db.collection('appointments').where('customerId', '==', duplicateId);
        const appointmentsSnapshot = await appointmentsQuery.get();
        
        for (const appointmentDoc of appointmentsSnapshot.docs) {
          tx.update(appointmentDoc.ref, { customerId: survivorId });
        }

        // Step 5: Update all holds to point to survivor
        const holdsQuery = db.collection('holds').where('customerId', '==', duplicateId);
        const holdsSnapshot = await holdsQuery.get();
        
        for (const holdDoc of holdsSnapshot.docs) {
          tx.update(holdDoc.ref, { customerId: survivorId });
        }

        // Step 6: Update all availability records to point to survivor
        const availabilityQuery = db.collection('availability').where('customerId', '==', duplicateId);
        const availabilitySnapshot = await availabilityQuery.get();
        
        for (const availabilityDoc of availabilitySnapshot.docs) {
          tx.update(availabilityDoc.ref, { customerId: survivorId });
        }

        // Step 7: Update all skin analyses to point to survivor
        const skinAnalysesQuery = db.collection('skinAnalyses').where('customerId', '==', duplicateId);
        const skinAnalysesSnapshot = await skinAnalysesQuery.get();
        
        for (const skinAnalysisDoc of skinAnalysesSnapshot.docs) {
          tx.update(skinAnalysisDoc.ref, { customerId: survivorId });
        }

        // Step 8: Update all consent forms to point to survivor
        const consentFormsQuery = db.collection('consentForms').where('customerId', '==', duplicateId);
        const consentFormsSnapshot = await consentFormsQuery.get();
        
        for (const consentFormDoc of consentFormsSnapshot.docs) {
          tx.update(consentFormDoc.ref, { customerId: survivorId });
        }

        // Step 9: Update uniqueContacts reservations
        const uniqueContactsQuery = db.collection('uniqueContacts').where('customerId', '==', duplicateId);
        const uniqueContactsSnapshot = await uniqueContactsQuery.get();
        
        for (const uniqueContactDoc of uniqueContactsSnapshot.docs) {
          tx.update(uniqueContactDoc.ref, { customerId: survivorId });
        }

        // Step 10: Create audit record
        const mergeRecordRef = db.collection('merges').doc();
        tx.set(mergeRecordRef, {
          survivorId,
          duplicateId,
          mergedBy: req.auth?.uid,
          mergedAt: new Date(),
          survivorName: survivor?.name,
          duplicateName: duplicate?.name,
          subcollectionDocsMoved: totalSubcollectionDocs,
          appointmentsUpdated: appointmentsSnapshot.size,
          holdsUpdated: holdsSnapshot.size,
          availabilityUpdated: availabilitySnapshot.size,
          skinAnalysesUpdated: skinAnalysesSnapshot.size,
          consentFormsUpdated: consentFormsSnapshot.size,
          uniqueContactsUpdated: uniqueContactsSnapshot.size
        });

        // Step 11: Mark duplicate as merged
        // Clear any orphaned migratedTo field and set proper merge status
        const duplicateUpdate: any = {
          status: 'merged',
          mergedInto: survivorId,
          mergedAt: new Date(),
          mergedBy: req.auth?.uid,
          identityStatus: 'migrated',
          migratedTo: survivorId // Set migratedTo to the survivor (valid customer)
        };
        
        // If duplicate had an orphaned migratedTo, we're already clearing it by setting it to survivorId
        tx.update(duplicateRef, duplicateUpdate);

        // Step 12: Update survivor's last updated timestamp
        tx.update(survivorRef, {
          updatedAt: new Date(),
          lastMergedAt: new Date()
        });

        return {
          success: true,
          survivorId,
          duplicateId,
          subcollectionDocsMoved: totalSubcollectionDocs,
          appointmentsUpdated: appointmentsSnapshot.size,
          holdsUpdated: holdsSnapshot.size,
          availabilityUpdated: availabilitySnapshot.size,
          skinAnalysesUpdated: skinAnalysesSnapshot.size,
          consentFormsUpdated: consentFormsSnapshot.size,
          uniqueContactsUpdated: uniqueContactsSnapshot.size,
          mergeRecordId: mergeRecordRef.id
        };
      });

      console.log(`✅ Customer merge completed successfully: ${duplicateId} → ${survivorId}`);
      console.log(`📊 Merge stats:`, result);

      return result;

    } catch (error: any) {
      console.error('❌ Customer merge failed:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Merge failed: ${error.message}`);
    }
  }
);
