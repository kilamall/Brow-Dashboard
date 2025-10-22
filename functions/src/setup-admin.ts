// functions/src/setup-admin.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

/**
 * Set up admin email for notifications
 */
export const setupAdminEmail = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    try {
      const { email } = req.data || {};
      
      if (!email) {
        throw new HttpsError('invalid-argument', 'Email is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new HttpsError('invalid-argument', 'Invalid email format');
      }

      // Save admin email to settings
      await db.collection('settings').doc('admin').set({
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`✅ Admin email set to: ${email}`);
      
      return { success: true, message: 'Admin email configured successfully' };
    } catch (error: any) {
      console.error('❌ Error setting up admin email:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to set up admin email');
    }
  }
);
