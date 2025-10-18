/**
 * Image compression utilities for reducing file sizes before upload
 * Helps reduce Firebase Storage costs and improve upload speeds
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const maxWidth = opts.maxWidth || DEFAULT_OPTIONS.maxWidth!;
          const maxHeight = opts.maxHeight || DEFAULT_OPTIONS.maxHeight!;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Create new file from blob
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                {
                  type: opts.mimeType || DEFAULT_OPTIONS.mimeType!,
                  lastModified: Date.now(),
                }
              );
              
              console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`);
              
              resolve(compressedFile);
            },
            opts.mimeType || DEFAULT_OPTIONS.mimeType!,
            opts.quality || DEFAULT_OPTIONS.quality!
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate image hash for deduplication
 * Uses a simple perceptual hash algorithm
 */
export async function calculateImageHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Create small canvas for hash calculation
          const size = 8;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Draw image to small canvas (downsampled)
          ctx.drawImage(img, 0, 0, size, size);
          
          // Get pixel data
          const imageData = ctx.getImageData(0, 0, size, size);
          const pixels = imageData.data;
          
          // Calculate average grayscale value
          let sum = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            sum += gray;
          }
          const avg = sum / (size * size);
          
          // Create hash based on whether each pixel is above or below average
          let hash = '';
          for (let i = 0; i < pixels.length; i += 4) {
            const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            hash += gray > avg ? '1' : '0';
          }
          
          // Convert binary string to hex
          const hexHash = parseInt(hash, 2).toString(16).padStart(16, '0');
          
          resolve(hexHash);
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get estimated compression savings
 */
export function getCompressionStats(originalSize: number, compressedSize: number) {
  const savings = originalSize - compressedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
  const originalMB = (originalSize / (1024 * 1024)).toFixed(2);
  const compressedMB = (compressedSize / (1024 * 1024)).toFixed(2);
  
  return {
    originalSize,
    compressedSize,
    savings,
    savingsPercent: parseFloat(savingsPercent),
    originalMB: parseFloat(originalMB),
    compressedMB: parseFloat(compressedMB),
  };
}

