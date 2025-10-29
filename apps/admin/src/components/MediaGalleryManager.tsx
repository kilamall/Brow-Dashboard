import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, deleteDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import type { HomePageContent } from '@buenobrows/shared/types';

interface MediaGalleryManagerProps {
  initial: HomePageContent;
}

interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  category: 'about' | 'hero' | 'gallery';
  uploadedAt: Date;
  homepageElements?: {
    heroImage?: boolean;
    hero2Image?: boolean;
    aboutSlideshow?: boolean;
    gallery?: boolean;
  };
}

export default function MediaGalleryManager({ initial }: MediaGalleryManagerProps) {
  const { db } = useFirebase();
  const storage = getStorage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomePageContent>(initial);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'about' | 'hero' | 'gallery'>('about');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist selected category in localStorage
  useEffect(() => {
    const savedCategory = localStorage.getItem('mediaGalleryActiveCategory');
    if (savedCategory && ['about', 'hero', 'gallery'].includes(savedCategory)) {
      setSelectedCategory(savedCategory as any);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mediaGalleryActiveCategory', selectedCategory);
  }, [selectedCategory]);

  // Helper function to refresh homepage content assignments
  const refreshHomepageContentAssignments = async (photosData: GalleryPhoto[]) => {
    try {
      // Update homepage content based on current photo assignments
      const heroPhotos = photosData.filter(p => p.homepageElements?.heroImage);
      const aboutPhotos = photosData.filter(p => p.homepageElements?.aboutSlideshow);
      const galleryPhotos = photosData.filter(p => p.homepageElements?.gallery);
      
      const dataToSave: any = {
        galleryPhotos: galleryPhotos.map(p => p.url)
      };
      
      // Only include hero images if they exist
      if (heroPhotos.length > 0) {
        dataToSave.heroImageUrl = heroPhotos[0].url;
      }
      
      // Save to Firestore
      await setDoc(doc(db, 'settings', 'homePageContent'), dataToSave, { merge: true });
      
      console.log('Refreshed homepage content assignments');
    } catch (error) {
      console.error('Error refreshing homepage content assignments:', error);
    }
  };

  // Load photos from Firestore
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        // Load photos from dedicated photos collection
        const photosQuery = query(collection(db, 'photos'), orderBy('uploadedAt', 'desc'));
        const photosSnapshot = await getDocs(photosQuery);
        
        const photosData = photosSnapshot.docs.map(doc => {
          const data = doc.data();
          let uploadedAt: Date;
          
          if (data.uploadedAt) {
            // Handle Firestore Timestamp
            if (data.uploadedAt.toDate) {
              uploadedAt = data.uploadedAt.toDate();
            } else if (data.uploadedAt instanceof Date) {
              uploadedAt = data.uploadedAt;
            } else {
              uploadedAt = new Date(data.uploadedAt);
            }
          } else {
            uploadedAt = new Date();
          }
          
          return {
            id: doc.id,
            ...data,
            uploadedAt
          };
        }) as GalleryPhoto[];
        
        console.log('Loaded photos from photos collection:', photosData.length, 'photos');
        setPhotos(photosData);
        
        // Also load homepage content to sync assignments
        const docRef = doc(db, 'settings', 'homePageContent');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHomepageContent(data as HomePageContent);
          
          // Refresh homepage content assignments based on loaded photos
          refreshHomepageContentAssignments(photosData);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
        setPhotos([]);
      }
    };


    loadPhotos();
  }, [db]);

  // Helper function to safely format dates
  const formatDate = (date: Date | string | any | undefined) => {
    if (!date) return 'Unknown date';
    try {
      let dateObj: Date;
      
      // Handle Firestore Timestamp
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate files first
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.name);
        return false;
      }
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        console.error('HEIC files are not supported by web browsers. Please convert to JPG or PNG:', file.name);
        alert(`HEIC files are not supported by web browsers. Please convert "${file.name}" to JPG or PNG format.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        console.error('File too large:', file.name);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      console.error('No valid files to upload');
      return;
    }

    setUploading(true);
    
    try {
      const uploadedPhotos: GalleryPhoto[] = [];
      
      // Upload files one by one to avoid overwhelming the system
      for (const file of validFiles) {
        try {
          // Create a unique filename with proper sanitization
          const timestamp = Date.now();
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${selectedCategory}_${timestamp}_${sanitizedName}`;
          
          // Ensure storage is properly initialized
          if (!storage) {
            throw new Error('Storage not initialized');
          }
          
          const storageRef = ref(storage, `gallery/${fileName}`);
          
          // Upload file with proper error handling
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          // Create photo object with homepage element assignments
          const newPhoto: GalleryPhoto = {
            id: `photo_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            url: downloadURL,
            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            category: selectedCategory,
            uploadedAt: new Date(), // Ensure this is always a valid Date object
            homepageElements: {
              heroImage: selectedCategory === 'hero',
              hero2Image: false,
              aboutSlideshow: selectedCategory === 'about',
              gallery: selectedCategory === 'gallery'
            }
          };
          
          uploadedPhotos.push(newPhoto);
        } catch (error) {
          console.error('Error uploading individual file:', file.name, error);
          // Continue with other files even if one fails
        }
      }
      
      if (uploadedPhotos.length > 0) {
        // Save photos to photos collection
        for (const photo of uploadedPhotos) {
          try {
            await addDoc(collection(db, 'photos'), {
              url: photo.url,
              alt: photo.alt,
              category: photo.category,
              uploadedAt: serverTimestamp(),
              homepageElements: photo.homepageElements
            });
            console.log('Saved photo to photos collection');
          } catch (error) {
            console.error('Error saving photo to photos collection:', error);
          }
        }
        
        const updatedPhotos = [...photos, ...uploadedPhotos];
        setPhotos(updatedPhotos);
        
        // Update homepage content with assigned photos
        const updatedHomepageContent = { ...homepageContent };
        
        // Update hero images - look at ALL photos, not just newly uploaded ones
        const heroPhotos = updatedPhotos.filter(p => p.homepageElements?.heroImage);
        if (heroPhotos.length > 0) {
          updatedHomepageContent.heroImageUrl = heroPhotos[0].url;
        }
        
        // Update about slideshow photos - look at ALL photos
        const aboutPhotos = updatedPhotos.filter(p => p.homepageElements?.aboutSlideshow);
        const galleryPhotos = updatedPhotos.filter(p => p.homepageElements?.gallery);
        
        // Update galleryPhotos as array of URL strings (for homepage display)
        updatedHomepageContent.galleryPhotos = galleryPhotos.map(p => p.url);
        
        setHomepageContent(updatedHomepageContent);
        
        // Save to Firestore (create document if it doesn't exist)
        const dataToSave: any = {
          galleryPhotos: galleryPhotos.map(p => p.url) // Convert to array of URL strings
        };
        
        // Only include hero images if they exist
        if (updatedHomepageContent.heroImageUrl) {
          dataToSave.heroImageUrl = updatedHomepageContent.heroImageUrl;
        }
        if (updatedHomepageContent.hero2ImageUrl) {
          dataToSave.hero2ImageUrl = updatedHomepageContent.hero2ImageUrl;
        }
        
        await setDoc(doc(db, 'settings', 'homePageContent'), dataToSave, { merge: true });
        
        console.log(`Successfully uploaded ${uploadedPhotos.length} photos`);
      }
    } catch (error) {
      console.error('Error in file upload process:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Extract file path from URL for Firebase Storage deletion
      try {
        const url = new URL(photo.url);
        const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const photoRef = ref(storage, filePath);
          await deleteObject(photoRef);
        }
      } catch (storageError) {
        console.warn('Could not delete from storage (file may not exist):', storageError);
        // Continue with Firestore deletion even if storage deletion fails
      }

      // Delete from photos collection
      try {
        await deleteDoc(doc(db, 'photos', photoId));
        console.log('Deleted photo from photos collection');
      } catch (firestoreError) {
        console.warn('Could not delete from photos collection:', firestoreError);
        // Continue with other operations even if photos collection deletion fails
      }

      // Remove from photos array
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      setPhotos(updatedPhotos);

      // Update homepage content based on remaining photos
      const updatedHomepageContent = { ...homepageContent };
      
      // Update hero images - if deleted photo was assigned, clear the assignment
      if (photo.homepageElements?.heroImage) {
        const remainingHeroPhoto = updatedPhotos.find(p => p.homepageElements?.heroImage);
        updatedHomepageContent.heroImageUrl = remainingHeroPhoto ? remainingHeroPhoto.url : undefined;
      }
      
      if (photo.homepageElements?.hero2Image) {
        const remainingHero2Photo = updatedPhotos.find(p => p.homepageElements?.hero2Image);
        updatedHomepageContent.hero2ImageUrl = remainingHero2Photo ? remainingHero2Photo.url : undefined;
      }
      
      // Update about slideshow photos
      const aboutPhotos = updatedPhotos.filter(p => p.homepageElements?.aboutSlideshow);
      const galleryPhotos = updatedPhotos.filter(p => p.homepageElements?.gallery);
      
      // Update galleryPhotos as array of URL strings (for homepage display)
      updatedHomepageContent.galleryPhotos = galleryPhotos.map(p => p.url);
      
      setHomepageContent(updatedHomepageContent);

      // Update Firestore with both photos and homepage content
      const dataToSave: any = {
        galleryPhotos: galleryPhotos.map(p => p.url) // Convert to array of URL strings
      };
      
      // Only include hero images if they exist
      if (updatedHomepageContent.heroImageUrl) {
        dataToSave.heroImageUrl = updatedHomepageContent.heroImageUrl;
      }
      if (updatedHomepageContent.hero2ImageUrl) {
        dataToSave.hero2ImageUrl = updatedHomepageContent.hero2ImageUrl;
      }
      
      await setDoc(doc(db, 'settings', 'homePageContent'), dataToSave, { merge: true });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleAssignToHomepageElement = async (photoId: string, element: 'heroImage' | 'hero2Image' | 'aboutSlideshow' | 'gallery') => {
    console.log('🎯 handleAssignToHomepageElement called:', { photoId, element });
    try {
      const updatedPhotos = photos.map(photo => {
        if (photo.id === photoId) {
          const updatedHomepageElements = { ...photo.homepageElements };
          updatedHomepageElements[element] = !updatedHomepageElements[element];
          
          return {
            ...photo,
            homepageElements: updatedHomepageElements
          };
        }
        return photo;
      });
      
      setPhotos(updatedPhotos);
      
      // Update homepage content based on assignments
      const updatedHomepageContent = { ...homepageContent };
      
      // Update hero images
      const heroPhoto = updatedPhotos.find(p => p.homepageElements?.heroImage);
      if (heroPhoto) {
        updatedHomepageContent.heroImageUrl = heroPhoto.url;
      }
      
      const hero2Photo = updatedPhotos.find(p => p.homepageElements?.hero2Image);
      if (hero2Photo) {
        updatedHomepageContent.hero2ImageUrl = hero2Photo.url;
      }
      
      // Update about slideshow photos
      const aboutPhotos = updatedPhotos.filter(p => p.homepageElements?.aboutSlideshow);
      const galleryPhotos = updatedPhotos.filter(p => p.homepageElements?.gallery);
      
      // Update galleryPhotos as array of URL strings (for homepage display)
      updatedHomepageContent.galleryPhotos = galleryPhotos.map(p => p.url);
      
      setHomepageContent(updatedHomepageContent);
      
      // Save to Firestore
      const dataToSave: any = {
        galleryPhotos: galleryPhotos.map(p => p.url) // Convert to array of URL strings
      };
      
      // Only include hero images if they exist
      if (updatedHomepageContent.heroImageUrl) {
        dataToSave.heroImageUrl = updatedHomepageContent.heroImageUrl;
      }
      if (updatedHomepageContent.hero2ImageUrl) {
        dataToSave.hero2ImageUrl = updatedHomepageContent.hero2ImageUrl;
      }
      
      await setDoc(doc(db, 'settings', 'homePageContent'), dataToSave, { merge: true });
      
      console.log('✅ Successfully saved gallery photos to Firestore:', dataToSave);
      
    } catch (error) {
      console.error('Error assigning photo to homepage element:', error);
    }
  };

  const handleUpdatePhoto = async (updatedPhoto: GalleryPhoto) => {
    try {
      // Update the photo document in the photos collection
      await setDoc(doc(db, 'photos', updatedPhoto.id), {
        url: updatedPhoto.url,
        alt: updatedPhoto.alt,
        caption: updatedPhoto.caption || '',
        category: updatedPhoto.category,
        uploadedAt: updatedPhoto.uploadedAt || serverTimestamp(),
        homepageElements: updatedPhoto.homepageElements || {}
      });

      // Update local state
      const updatedPhotos = photos.map(p => 
        p.id === updatedPhoto.id ? updatedPhoto : p
      );
      setPhotos(updatedPhotos);

      // Update homepage content assignments
      await refreshHomepageContentAssignments(updatedPhotos);

      setEditingPhoto(null);
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  const filteredPhotos = photos.filter(photo => photo.category === selectedCategory);
  
  // Debug logging
  console.log('All photos:', photos);
  console.log('Selected category:', selectedCategory);
  console.log('Filtered photos:', filteredPhotos);

  const categories = [
    { 
      id: 'hero', 
      label: 'Hero Images', 
      description: 'Main banner images for the top of your homepage',
      icon: '🏠',
      homepageElements: ['heroImage', 'hero2Image']
    },
    { 
      id: 'about', 
      label: 'About Me Slideshow', 
      description: 'Photos for the circular slideshow in the "Our Story" section',
      icon: '🎠',
      homepageElements: ['aboutSlideshow']
    },
    { 
      id: 'gallery', 
      label: 'Gallery Photos', 
      description: 'General gallery photos for showcasing your work throughout the site',
      icon: '📸',
      homepageElements: ['gallery']
    }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Category Description & Homepage Preview */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-xl">{categories.find(c => c.id === selectedCategory)?.icon}</span>
              {categories.find(c => c.id === selectedCategory)?.label}
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
            
            {/* Homepage Element Preview */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <h4 className="font-medium text-slate-800 mb-2 text-sm">📍 Where these photos will appear:</h4>
              <div className="flex flex-wrap gap-2">
                {categories.find(c => c.id === selectedCategory)?.homepageElements.map((element) => (
                  <span key={element} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta border border-terracotta/20">
                    {element === 'heroImage' && '🏠 Main Hero Banner'}
                    {element === 'hero2Image' && '🖼️ Second Hero Section'}
                    {element === 'aboutSlideshow' && '🎠 About Me Slideshow'}
                    {element === 'gallery' && '📸 Gallery Sections'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Current Assignment Status */}
          <div className="ml-4 text-right">
            <div className="text-xs text-slate-500 mb-1">Currently Assigned:</div>
            <div className="text-sm font-medium text-slate-700">
              {filteredPhotos.filter(p => p.homepageElements && Object.values(p.homepageElements).some(Boolean)).length} photos
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-terracotta/5 to-terracotta/10 border-2 border-dashed border-terracotta/30 rounded-xl p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Upload Photos to {categories.find(c => c.id === selectedCategory)?.label}
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Drag and drop images here, or click the button below to select files
          </p>
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-terracotta/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose Photos to Upload
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          
          <div className="mt-4 text-xs text-slate-500">
            Supports PNG, JPG, GIF up to 10MB each • Multiple files allowed • HEIC files not supported
          </div>
          
          
          {uploading && (
            <div className="mt-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-terracotta/20 rounded-lg shadow-sm">
                <svg className="animate-spin h-5 w-5 text-terracotta" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-terracotta font-medium">Uploading photos...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Controls */}
      {filteredPhotos.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photos Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="relative group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', photo.url, photo.alt);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', photo.url, photo.alt);
                  }}
                />
              </div>
              
              {/* Photo Info */}
              <div className="p-3">
                <h4 className="font-medium text-sm text-slate-900 truncate">{photo.alt}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(photo.uploadedAt)}
                </p>
                
                {/* Homepage Element Assignments */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {photo.homepageElements?.heroImage && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🏠 Hero
                    </span>
                  )}
                  {photo.homepageElements?.hero2Image && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🖼️ Hero 2
                    </span>
                  )}
                  {photo.homepageElements?.aboutSlideshow && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎠 Slideshow
                    </span>
                  )}
                  {photo.homepageElements?.gallery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      📸 Gallery
                    </span>
                  )}
                </div>
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 shadow-lg"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 shadow-lg"
                      title="Edit Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                      title="Delete Photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Homepage Assignment Buttons */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    <button
                      onClick={() => handleAssignToHomepageElement(photo.id, 'heroImage')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        photo.homepageElements?.heroImage 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Assign to Hero Image"
                    >
                      🏠 Hero
                    </button>
                    <button
                      onClick={() => handleAssignToHomepageElement(photo.id, 'hero2Image')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        photo.homepageElements?.hero2Image 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white text-purple-600 hover:bg-purple-50'
                      }`}
                      title="Assign to Hero 2 Image"
                    >
                      🖼️ Hero 2
                    </button>
                    <button
                      onClick={() => handleAssignToHomepageElement(photo.id, 'aboutSlideshow')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        photo.homepageElements?.aboutSlideshow 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-green-600 hover:bg-green-50'
                      }`}
                      title="Assign to About Slideshow"
                    >
                      🎠 Slideshow
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🔥 Simple Gallery button clicked!', photo.id);
                        try {
                          // Get current gallery photos from Firestore
                          const docRef = doc(db, 'settings', 'homePageContent');
                          const docSnap = await getDoc(docRef);
                          const currentData = docSnap.exists() ? docSnap.data() : {};
                          const currentGalleryPhotos = currentData.galleryPhotos || [];
                          
                          // Add this photo URL if not already present
                          if (!currentGalleryPhotos.includes(photo.url)) {
                            const updatedGalleryPhotos = [...currentGalleryPhotos, photo.url];
                            
                            // Save to Firestore
                            await setDoc(doc(db, 'settings', 'homePageContent'), {
                              ...currentData,
                              galleryPhotos: updatedGalleryPhotos
                            }, { merge: true });
                            
                            console.log('✅ Photo added to gallery:', photo.url);
                            alert('Photo added to gallery!');
                          } else {
                            console.log('ℹ️ Photo already in gallery');
                            alert('Photo is already in gallery!');
                          }
                        } catch (error) {
                          console.error('❌ Error adding photo to gallery:', error);
                          alert('Error adding photo to gallery');
                        }
                      }}
                      className="px-2 py-1 rounded text-xs font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600"
                      title="Add to Gallery"
                    >
                      📸 Add to Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', photo.url, photo.alt);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', photo.url, photo.alt);
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">{photo.alt}</h4>
                <p className="text-sm text-slate-500">
                  {photo.caption && <span className="truncate block">{photo.caption}</span>}
                  <span className="text-xs">Uploaded {formatDate(photo.uploadedAt)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="View Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => setEditingPhoto(photo)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Edit Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Delete Photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No photos</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by uploading some photos.</p>
        </div>
      )}

      {/* Photo View Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-slate-900">Photo Details</h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.alt}
                    className="w-full rounded-lg"
                    onError={(e) => {
                      console.error('Modal image failed to load:', selectedPhoto.url, selectedPhoto.alt);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Modal image loaded successfully:', selectedPhoto.url, selectedPhoto.alt);
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Alt Text</label>
                    <p className="mt-1 text-sm text-slate-900">{selectedPhoto.alt}</p>
                  </div>
                  {selectedPhoto.caption && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Caption</label>
                      <p className="mt-1 text-sm text-slate-900">{selectedPhoto.caption}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <p className="mt-1 text-sm text-slate-900 capitalize">{selectedPhoto.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Uploaded</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {formatDate(selectedPhoto.uploadedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-slate-900">Edit Photo</h3>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingPhoto) {
                    handleUpdatePhoto(editingPhoto);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700">Alt Text</label>
                  <input
                    type="text"
                    value={editingPhoto.alt}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, alt: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Caption</label>
                  <input
                    type="text"
                    value={editingPhoto.caption || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value as any })}
                    className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-terracotta rounded-md hover:bg-terracotta/90"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
