// functions/src/slideshow-management.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Get all slides
export const getSlides = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can manage slides');
    }

    try {
      const slidesSnapshot = await db.collection('slideshow')
        .orderBy('order', 'asc')
        .get();

      const slides = slidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { slides };
    } catch (error: any) {
      console.error('Error getting slides:', error);
      throw new HttpsError('internal', `Failed to get slides: ${error.message}`);
    }
  }
);

// Get public slides (for website display)
export const getPublicSlides = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    try {
      const slidesSnapshot = await db.collection('slideshow')
        .where('active', '==', true)
        .orderBy('order', 'asc')
        .get();

      const slides = slidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { slides };
    } catch (error: any) {
      console.error('Error getting public slides:', error);
      throw new HttpsError('internal', `Failed to get public slides: ${error.message}`);
    }
  }
);

// Create or update a slide
export const saveSlide = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can manage slides');
    }

    const { slideData, slideId } = req.data;

    if (!slideData) {
      throw new HttpsError('invalid-argument', 'Slide data is required');
    }

    try {
      const slideRef = slideId 
        ? db.collection('slideshow').doc(slideId)
        : db.collection('slideshow').doc();

      const slideToSave = {
        ...slideData,
        updatedAt: new Date().toISOString(),
        ...(slideId ? {} : { createdAt: new Date().toISOString() })
      };

      await slideRef.set(slideToSave, { merge: true });

      return { 
        success: true, 
        slideId: slideRef.id,
        message: slideId ? 'Slide updated successfully' : 'Slide created successfully'
      };
    } catch (error: any) {
      console.error('Error saving slide:', error);
      throw new HttpsError('internal', `Failed to save slide: ${error.message}`);
    }
  }
);

// Delete a slide
export const deleteSlide = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can manage slides');
    }

    const { slideId } = req.data;

    if (!slideId) {
      throw new HttpsError('invalid-argument', 'Slide ID is required');
    }

    try {
      await db.collection('slideshow').doc(slideId).delete();
      return { success: true, message: 'Slide deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      throw new HttpsError('internal', `Failed to delete slide: ${error.message}`);
    }
  }
);

// Reorder slides
export const reorderSlides = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can manage slides');
    }

    const { slideOrders } = req.data;

    if (!slideOrders || !Array.isArray(slideOrders)) {
      throw new HttpsError('invalid-argument', 'Slide orders array is required');
    }

    try {
      const batch = db.batch();
      
      slideOrders.forEach(({ slideId, order }) => {
        const slideRef = db.collection('slideshow').doc(slideId);
        batch.update(slideRef, { order, updatedAt: new Date().toISOString() });
      });

      await batch.commit();
      return { success: true, message: 'Slides reordered successfully' };
    } catch (error: any) {
      console.error('Error reordering slides:', error);
      throw new HttpsError('internal', `Failed to reorder slides: ${error.message}`);
    }
  }
);
