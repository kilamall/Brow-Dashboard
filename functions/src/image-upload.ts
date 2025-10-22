// functions/src/image-upload.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
// import { v4 as uuidv4 } from 'uuid';

try { initializeApp(); } catch {}
const storage = getStorage();

// Upload image to Firebase Storage
export const uploadImage = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can upload images');
    }

    const { imageData, fileName, contentType } = req.data;

    if (!imageData || !fileName || !contentType) {
      throw new HttpsError('invalid-argument', 'Image data, filename, and content type are required');
    }

    try {
      // Generate unique filename
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `slideshow/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, 'base64');
      
      // Upload to Firebase Storage
      const bucket = storage.bucket();
      const file = bucket.file(uniqueFileName);
      
      await file.save(imageBuffer, {
        metadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

      return {
        success: true,
        imageUrl: publicUrl,
        fileName: uniqueFileName,
        message: 'Image uploaded successfully'
      };

    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new HttpsError('internal', `Failed to upload image: ${error.message}`);
    }
  }
);

// Delete image from Firebase Storage
export const deleteImage = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can delete images');
    }

    const { imageUrl } = req.data;

    if (!imageUrl) {
      throw new HttpsError('invalid-argument', 'Image URL is required');
    }

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fullPath = `slideshow/${fileName}`;

      const bucket = storage.bucket();
      const file = bucket.file(fullPath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        return { success: true, message: 'Image already deleted or does not exist' };
      }

      // Delete the file
      await file.delete();

      return {
        success: true,
        message: 'Image deleted successfully'
      };

    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new HttpsError('internal', `Failed to delete image: ${error.message}`);
    }
  }
);
