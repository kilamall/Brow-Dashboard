/**
 * Comprehensive Customer Data Deletion
 * 
 * This Cloud Function deletes all customer data across all collections
 * for GDPR compliance and data management.
 * 
 * Collections cleaned up:
 * - appointments
 * - availability (related slots)
 * - messages
 * - conversations
 * - sms_conversations
 * - ai_conversations
 * - ai_sms_conversations
 * - skinAnalyses
 * - skinAnalysisRequests
 * - customerConsents
 * - customer_tokens
 * - reviews
 * - Firebase Auth account (optional)
 * - customer record
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();

interface DeleteCustomerDataRequest {
  customerId: string;
  deleteAuthAccount?: boolean; // Optional: also delete Firebase Auth account (defaults to true for complete deletion)
}

interface DeleteCustomerDataResponse {
  success: boolean;
  deletedCollections: {
    [key: string]: number; // collection name -> count of deleted docs
  };
  message: string;
}

export const deleteCustomerData = onCall<DeleteCustomerDataRequest, Promise<DeleteCustomerDataResponse>>(
  async (request) => {
    // Security: Only admins can delete customer data
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated to delete customer data');
    }

    const isAdmin = request.auth.token.role === 'admin';
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Only admins can delete customer data');
    }

    const { customerId, deleteAuthAccount = true } = request.data; // Default to true for complete deletion

    if (!customerId) {
      throw new HttpsError('invalid-argument', 'customerId is required');
    }

    logger.info(`Starting comprehensive deletion for customer: ${customerId}`);

    const deletedCollections: { [key: string]: number } = {};

    try {
      // 1. Delete appointments
      logger.info('Deleting appointments...');
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('customerId', '==', customerId)
        .get();
      
      const appointmentIds: string[] = [];
      for (const doc of appointmentsSnapshot.docs) {
        appointmentIds.push(doc.id);
        await doc.ref.delete();
      }
      deletedCollections['appointments'] = appointmentsSnapshot.size;

      // 2. Delete availability slots for these appointments
      if (appointmentIds.length > 0) {
        logger.info('Deleting availability slots...');
        const availabilitySnapshot = await db
          .collection('availability')
          .where('appointmentId', 'in', appointmentIds.slice(0, 10)) // Firestore 'in' limit is 10
          .get();
        
        for (const doc of availabilitySnapshot.docs) {
          await doc.ref.delete();
        }
        deletedCollections['availability'] = availabilitySnapshot.size;

        // If more than 10 appointments, handle in batches
        if (appointmentIds.length > 10) {
          for (let i = 10; i < appointmentIds.length; i += 10) {
            const batch = appointmentIds.slice(i, i + 10);
            const moreAvailability = await db
              .collection('availability')
              .where('appointmentId', 'in', batch)
              .get();
            for (const doc of moreAvailability.docs) {
              await doc.ref.delete();
            }
            deletedCollections['availability'] += moreAvailability.size;
          }
        }
      }

      // 3. Delete messages
      logger.info('Deleting messages...');
      const messagesSnapshot = await db
        .collection('messages')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of messagesSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['messages'] = messagesSnapshot.size;

      // 4. Delete conversations
      logger.info('Deleting conversations...');
      const conversationsSnapshot = await db
        .collection('conversations')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of conversationsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['conversations'] = conversationsSnapshot.size;

      // 5. Delete SMS conversations
      logger.info('Deleting SMS conversations...');
      const smsConversationsSnapshot = await db
        .collection('sms_conversations')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of smsConversationsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['sms_conversations'] = smsConversationsSnapshot.size;

      // 6. Delete AI conversations
      logger.info('Deleting AI conversations...');
      const aiConversationsSnapshot = await db
        .collection('ai_conversations')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of aiConversationsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['ai_conversations'] = aiConversationsSnapshot.size;

      // 7. Delete AI SMS conversations
      logger.info('Deleting AI SMS conversations...');
      const aiSmsConversationsSnapshot = await db
        .collection('ai_sms_conversations')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of aiSmsConversationsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['ai_sms_conversations'] = aiSmsConversationsSnapshot.size;

      // 8. Delete skin analyses
      logger.info('Deleting skin analyses...');
      const skinAnalysesSnapshot = await db
        .collection('skinAnalyses')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of skinAnalysesSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['skinAnalyses'] = skinAnalysesSnapshot.size;

      // 9. Delete skin analysis requests
      logger.info('Deleting skin analysis requests...');
      const skinAnalysisRequestsSnapshot = await db
        .collection('skinAnalysisRequests')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of skinAnalysisRequestsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['skinAnalysisRequests'] = skinAnalysisRequestsSnapshot.size;

      // 10. Delete customer consents
      logger.info('Deleting customer consents...');
      const customerConsentsSnapshot = await db
        .collection('customerConsents')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of customerConsentsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['customerConsents'] = customerConsentsSnapshot.size;

      // 11. Delete customer tokens (push notifications)
      logger.info('Deleting customer tokens...');
      const customerTokensSnapshot = await db
        .collection('customer_tokens')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of customerTokensSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['customer_tokens'] = customerTokensSnapshot.size;

      // 12. Delete reviews
      logger.info('Deleting reviews...');
      const reviewsSnapshot = await db
        .collection('reviews')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of reviewsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['reviews'] = reviewsSnapshot.size;

      // 13. Delete holds (if any)
      logger.info('Deleting holds...');
      const holdsSnapshot = await db
        .collection('holds')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of holdsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['holds'] = holdsSnapshot.size;

      // 14. Delete appointment edit requests
      logger.info('Deleting appointment edit requests...');
      const editRequestsSnapshot = await db
        .collection('appointmentEditRequests')
        .where('customerId', '==', customerId)
        .get();
      
      for (const doc of editRequestsSnapshot.docs) {
        await doc.ref.delete();
      }
      deletedCollections['appointmentEditRequests'] = editRequestsSnapshot.size;

      // 15. Delete Firebase Auth account (if requested)
      let authAccountDeleted = false;
      if (deleteAuthAccount) {
        try {
          logger.info('Attempting to delete Firebase Auth account...');
          
          // First, get the customer data to find their email/phone
          const customerDoc = await db.collection('customers').doc(customerId).get();
          const customerData = customerDoc.data();
          
          if (customerData) {
            // Try to find the auth user by email or phone
            let authUser = null;
            
            if (customerData.email) {
              try {
                authUser = await getAuth().getUserByEmail(customerData.email);
              } catch (e) {
                logger.info(`No auth user found with email: ${customerData.email}`);
              }
            }
            
            if (!authUser && customerData.phone) {
              try {
                authUser = await getAuth().getUserByPhoneNumber(customerData.phone);
              } catch (e) {
                logger.info(`No auth user found with phone: ${customerData.phone}`);
              }
            }
            
            if (authUser) {
              // Revoke all refresh tokens to immediately terminate all sessions
              await getAuth().revokeRefreshTokens(authUser.uid);
              logger.info(`Revoked all refresh tokens for user: ${authUser.uid}`);
              
              // Delete the Firebase Auth account
              await getAuth().deleteUser(authUser.uid);
              authAccountDeleted = true;
              logger.info(`Deleted Firebase Auth account: ${authUser.uid}`);
            } else {
              logger.info('No Firebase Auth account found for this customer');
            }
          }
        } catch (error) {
          logger.warn('Failed to delete Firebase Auth account:', error);
          // Continue with customer deletion even if auth deletion fails
        }
      }

      // 16. Finally, delete the customer record itself
      logger.info('Deleting customer record...');
      await db.collection('customers').doc(customerId).delete();
      deletedCollections['customers'] = 1;

      // Calculate totals
      const totalDeleted = Object.values(deletedCollections).reduce((sum, count) => sum + count, 0);

      const message = deleteAuthAccount && authAccountDeleted
        ? `Successfully deleted customer ${customerId} and ${totalDeleted} related records, including Firebase Auth account`
        : `Successfully deleted customer ${customerId} and ${totalDeleted} related records`;

      logger.info(message);
      logger.info('Deleted collections breakdown:', deletedCollections);

      return {
        success: true,
        deletedCollections,
        message,
      };

    } catch (error) {
      logger.error('Error deleting customer data:', error);
      throw new HttpsError(
        'internal',
        `Failed to delete customer data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);

