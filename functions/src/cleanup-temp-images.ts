// functions/src/cleanup-temp-images.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp } from 'firebase-admin/app';

try { initializeApp(); } catch {}
const storage = getStorage();

export const cleanupTempImages = onSchedule(
  {
    schedule: '0 2 * * *', // Run daily at 2 AM
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('Starting cleanup of temporary profile images...');
    
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: 'profile-images/temp/',
      });
      
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours ago
      let deletedCount = 0;
      
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const created = new Date(metadata.timeCreated || 0).getTime();
        
        // Delete files older than 24 hours
        if (created < oneDayAgo) {
          await file.delete();
          deletedCount++;
          console.log(`Deleted old temp file: ${file.name}`);
        }
      }
      
      console.log(`Cleanup complete. Deleted ${deletedCount} old temporary files.`);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
);
