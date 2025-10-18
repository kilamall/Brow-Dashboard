import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Request new skin analysis (customer function)
export const requestNewSkinAnalysis = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    // SECURITY: Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = request.auth.uid;
    const { reason } = request.data || {};

    try {
      // Check if customer already has a pending request
      const existingRequestQuery = await db.collection('skinAnalysisRequests')
        .where('customerId', '==', userId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!existingRequestQuery.empty) {
        throw new HttpsError('already-exists', 'You already have a pending analysis request. Please wait for admin approval.');
      }

      // Create analysis request
      const requestData = {
        customerId: userId,
        customerEmail: request.auth.token.email,
        reason: reason || 'Customer requested new skin analysis',
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date()
      };

      const requestRef = await db.collection('skinAnalysisRequests').add(requestData);

      return {
        success: true,
        message: 'Analysis request submitted successfully. An admin will review your request.',
        requestId: requestRef.id
      };

    } catch (error: any) {
      console.error('Error requesting skin analysis:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to submit analysis request');
    }
  }
);

// Get analysis requests (admin function)
export const getSkinAnalysisRequests = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    // SECURITY: Require admin authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userToken = request.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    try {
      const requestsQuery = await db.collection('skinAnalysisRequests')
        .orderBy('requestedAt', 'desc')
        .get();

      const requests = requestsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { requests };

    } catch (error: any) {
      console.error('Error fetching analysis requests:', error);
      throw new HttpsError('internal', 'Failed to fetch analysis requests');
    }
  }
);

// Approve analysis request (admin function)
export const approveSkinAnalysisRequest = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    // SECURITY: Require admin authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userToken = request.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { requestId } = request.data || {};

    if (!requestId) {
      throw new HttpsError('invalid-argument', 'Request ID is required');
    }

    try {
      // Update request status
      await db.collection('skinAnalysisRequests').doc(requestId).update({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: request.auth.uid
      });

      return {
        success: true,
        message: 'Analysis request approved. Customer can now create a new analysis.'
      };

    } catch (error: any) {
      console.error('Error approving analysis request:', error);
      throw new HttpsError('internal', 'Failed to approve analysis request');
    }
  }
);

// Delete customer skin analysis (admin function)
export const deleteCustomerSkinAnalysis = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    // SECURITY: Require admin authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userToken = request.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { customerId } = request.data || {};

    if (!customerId) {
      throw new HttpsError('invalid-argument', 'Customer ID is required');
    }

    try {
      // Find and delete customer's skin analyses
      const analysesQuery = await db.collection('skinAnalyses')
        .where('customerId', '==', customerId)
        .get();

      if (analysesQuery.empty) {
        throw new HttpsError('not-found', 'No skin analysis found for this customer');
      }

      // Delete all analyses for this customer
      const batch = db.batch();
      analysesQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return {
        success: true,
        message: `Deleted ${analysesQuery.size} skin analysis(es) for customer.`,
        deletedCount: analysesQuery.size
      };

    } catch (error: any) {
      console.error('Error deleting customer skin analysis:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to delete skin analysis');
    }
  }
);
