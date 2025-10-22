// functions/src/upload-profile-picture.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp } from 'firebase-admin/app';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';

try { initializeApp(); } catch {}
const storage = getStorage();

export const uploadProfilePicture = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit uploads (5 per hour per IP)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    const { imageData, fileName, contentType } = req.data || {};
    
    // Validate required fields
    if (!imageData || !fileName || !contentType) {
      throw new HttpsError('invalid-argument', 'Missing required fields: imageData, fileName, contentType');
    }
    
    // SECURITY: Validate file type
    if (!contentType.startsWith('image/')) {
      throw new HttpsError('invalid-argument', 'Only image files are allowed');
    }
    
    // SECURITY: Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageData.length > maxSize) {
      throw new HttpsError('invalid-argument', 'File size must be less than 5MB');
    }
    
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(imageData, 'base64');
      
      // Generate secure filename
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `profile-images/temp/${timestamp}_${sanitizedFileName}`;
      
      // Upload to Firebase Storage
      const bucket = storage.bucket();
      const file = bucket.file(storagePath);
      
      await file.save(buffer, {
        metadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=3600', // 1 hour cache
        },
      });
      
      // Make file publicly readable
      await file.makePublic();
      
      // Get download URL
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      
      return {
        success: true,
        downloadUrl,
        storagePath,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
      
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new HttpsError('internal', 'Failed to upload image');
    }
  }
);
