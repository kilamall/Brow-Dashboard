import { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { compressImage, getCompressionStats } from '@buenobrows/shared/imageUtils';
import { initFirebase } from '@buenobrows/shared/firebase';

interface ProfilePictureUploadProps {
  userId?: string; // Optional: if provided, uploads to user's folder
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  showPreview?: boolean;
  className?: string;
  compact?: boolean; // For smaller display in forms
}

export default function ProfilePictureUpload({
  userId,
  onUploadComplete,
  currentImageUrl,
  label = "Profile Picture",
  showPreview = true,
  className = "",
  compact = false,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Compress image to reduce storage costs
      const compressedFile = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });

      const stats = getCompressionStats(file.size, compressedFile.size);
      console.log(`Profile picture compressed: ${stats.savingsPercent}% reduction (${stats.originalMB}MB → ${stats.compressedMB}MB)`);

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      let downloadUrl: string;

      if (userId) {
        // User is authenticated - direct upload to their folder
        const storage = getStorage();
        const timestamp = Date.now();
        const storagePath = `profile-images/${userId}/${timestamp}_${compressedFile.name}`;
        
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedFile);
        downloadUrl = await getDownloadURL(storageRef);
      } else {
        // User not authenticated - use secure Cloud Function
        const { functions } = initFirebase();
        const uploadFn = httpsCallable(functions, 'uploadProfilePicture');
        
        // Convert file to base64 for secure upload
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(compressedFile);
        const base64Data = await base64Promise;
        const base64 = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        const result = await uploadFn({
          imageData: base64,
          fileName: compressedFile.name,
          contentType: compressedFile.type,
        });
        
        downloadUrl = (result.data as any).downloadUrl;
      }

      // Notify parent component
      onUploadComplete(downloadUrl);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreviewUrl(''); // Clear preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-4">
          {/* Preview Circle */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {label} <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="profile-pic-upload"
            />
            <div className="flex gap-2">
              <label
                htmlFor="profile-pic-upload"
                className={`px-3 py-1.5 text-sm border rounded cursor-pointer transition-colors ${
                  uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-terracotta text-terracotta hover:bg-terracotta/10'
                }`}
              >
                {uploading ? 'Uploading...' : previewUrl ? 'Change' : 'Choose Photo'}
              </label>
              {previewUrl && !uploading && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-terracotta transition-colors">
        {showPreview && previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
            />
            {!uploading && (
              <div className="flex justify-center gap-3">
                <label
                  htmlFor="profile-pic-upload-full"
                  className="text-sm text-terracotta hover:underline cursor-pointer"
                >
                  Change Photo
                </label>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add a profile picture (optional)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="profile-pic-upload-full"
            />
            <label
              htmlFor="profile-pic-upload-full"
              className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-terracotta text-white hover:bg-terracotta/90'
              }`}
            >
              {uploading ? 'Uploading...' : 'Choose Photo'}
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Recommended: Square image, at least 400x400px. Max 10MB.
      </p>
    </div>
  );
}

