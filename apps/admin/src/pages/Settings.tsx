import { useEffect, useMemo, useState, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  watchAnalyticsTargets,
  setAnalyticsTargets,
  watchBusinessHours,
  setBusinessHours,
  watchBusinessInfo,
  setBusinessInfo,
  watchHomePageContent,
  setHomePageContent,
  watchAppointmentsByDay
} from '@buenobrows/shared/firestoreActions';
import type { AnalyticsTargets, BusinessHours, BusinessInfo, HomePageContent, Appointment, CustomerConsent, ConsentFormTemplate, Service } from '@buenobrows/shared/types';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';
import { format, parseISO } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, onSnapshot, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import DataManagement from '../components/DataManagement';
import VerificationSettings from '../components/VerificationSettings';
import AdminEmailSetup from '../components/AdminEmailSetup';
import BusinessHoursManager from '../components/BusinessHoursManager';
import AITrainingPanel from '../components/AITrainingPanel';

type Tab = 'business' | 'content' | 'media' | 'serviceimages' | 'skinanalysis' | 'hours' | 'analytics' | 'consent' | 'verifications' | 'accessibility' | 'datamanagement' | 'adminemail' | 'aitraining';

export default function Settings() {
  const { db } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [targets, setTargetsState] = useState<AnalyticsTargets | null>(null);
  const [bh, setBhState] = useState<BusinessHours | null>(null);
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo | null>(null);
  const [homeContent, setHomeContentState] = useState<HomePageContent | null>(null);

  // Persist activeTab state
  useEffect(() => {
    const savedTab = localStorage.getItem('settingsActiveTab');
    if (savedTab) {
      const validTabs: Tab[] = ['business', 'content', 'media', 'serviceimages', 'skinanalysis', 'hours', 'analytics', 'consent', 'verifications', 'accessibility', 'datamanagement', 'adminemail', 'aitraining'];
      if (validTabs.includes(savedTab as Tab)) {
        setActiveTab(savedTab as Tab);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settingsActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => watchAnalyticsTargets(db, setTargetsState), []);
  useEffect(() => watchBusinessHours(db, setBhState), []);
  useEffect(() => watchBusinessInfo(db, setBusinessInfoState), []);
  useEffect(() => watchHomePageContent(db, setHomeContentState), []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'business', label: 'Business Info', icon: '🏢' },
    { id: 'content', label: 'Website Content', icon: '📝' },
    { id: 'media', label: 'Media Gallery', icon: '📸' },
    { id: 'serviceimages', label: 'Service Images', icon: '🎨' },
    { id: 'skinanalysis', label: 'Skin Analysis', icon: '✨' },
    { id: 'hours', label: 'Business Hours & Operations', icon: '🕐' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'consent', label: 'Consent Forms', icon: '📋' },
    { id: 'verifications', label: 'Customer Verifications', icon: '🔐' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'adminemail', label: 'Admin Notifications', icon: '📧' },
    { id: 'aitraining', label: 'AI Messaging', icon: '🤖' },
    { id: 'datamanagement', label: 'Data Management', icon: '🗄️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your business settings and website content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-terracotta text-terracotta font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'business' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Business Information</h2>
            <p className="text-sm text-slate-600 mb-6">Manage your business contact details and social media links</p>
            {businessInfo ? <BusinessInfoForm initial={businessInfo} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'content' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Website Content</h2>
            <p className="text-sm text-slate-600 mb-6">Customize your homepage text and promotional sections</p>
            {homeContent ? <HomePageContentForm initial={homeContent} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'media' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Media Gallery</h2>
            <p className="text-sm text-slate-600 mb-6">Upload and manage your hero image and shop gallery photos</p>
            {homeContent ? <MediaGalleryManager initial={homeContent} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'serviceimages' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Service Images</h2>
            <p className="text-sm text-slate-600 mb-6">Manage images for your services displayed on the booking page</p>
            <ServiceImagesManager />
          </section>
        )}

        {activeTab === 'skinanalysis' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">AI Skin Analysis Settings</h2>
            <p className="text-sm text-slate-600 mb-6">Customize the AI Skin Analysis section on your homepage</p>
            {homeContent ? <SkinAnalysisContentForm initial={homeContent} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'hours' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <BusinessHoursManager />
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Analytics Targets</h2>
            <p className="text-sm text-slate-600 mb-6">Set your revenue goals and performance targets</p>
            {targets ? <TargetsForm initial={targets} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'consent' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Customer Consent Forms</h2>
            <p className="text-sm text-slate-600 mb-6">View all customer consent forms and signatures</p>
            <ConsentFormsManager />
          </section>
        )}

        {activeTab === 'verifications' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Customer Verifications</h2>
            <p className="text-sm text-slate-600 mb-6">Configure how guests verify their contact information during booking</p>
            <VerificationSettings />
          </section>
        )}

        {activeTab === 'accessibility' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Accessibility Settings</h2>
            <p className="text-sm text-slate-600 mb-6">Customize the interface for better accessibility and reduced stress</p>
            <AccessibilitySettings />
          </section>
        )}

        {activeTab === 'adminemail' && (
          <AdminEmailSetup />
        )}

        {activeTab === 'aitraining' && (
          <AITrainingPanel />
        )}

        {activeTab === 'datamanagement' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Data Management</h2>
            <p className="text-sm text-slate-600 mb-6">Manage your database and perform maintenance operations</p>
            <DataManagement />
          </section>
        )}
      </div>
    </div>
  );
}

// -------------------- Business Info --------------------
function BusinessInfoForm({ initial }: { initial: BusinessInfo }) {
  const { db } = useFirebase();
  const [info, setInfo] = useState<BusinessInfo>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    setInfo(initial);
  }, [initial]);

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setBusinessInfo(db, info);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <label htmlFor="business-name" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Business Name</span>
          <input 
            id="business-name"
            name="business-name"
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.name} 
            onChange={(e)=>setInfo({...info, name: e.target.value})} 
          />
        </label>
        <label htmlFor="business-phone" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Phone Number</span>
          <input 
            id="business-phone"
            name="business-phone"
            type="tel" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.phone} 
            onChange={(e)=>setInfo({...info, phone: e.target.value})} 
          />
        </label>
      </div>

      <label htmlFor="business-email" className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Email Address</span>
        <input 
          id="business-email"
          name="business-email"
          type="email" 
          className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
          value={info.email} 
          onChange={(e)=>setInfo({...info, email: e.target.value})} 
        />
      </label>

      <label htmlFor="business-address" className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Street Address</span>
        <input 
          id="business-address"
          name="business-address"
          type="text" 
          className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
          value={info.address} 
          onChange={(e)=>setInfo({...info, address: e.target.value})} 
        />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label htmlFor="business-city" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input 
            id="business-city"
            name="business-city"
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.city} 
            onChange={(e)=>setInfo({...info, city: e.target.value})} 
          />
        </label>
        <label htmlFor="business-state" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">State</span>
          <input 
            id="business-state"
            name="business-state"
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.state} 
            onChange={(e)=>setInfo({...info, state: e.target.value})} 
          />
        </label>
        <label htmlFor="business-zip" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">ZIP Code</span>
          <input 
            id="business-zip"
            name="business-zip"
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.zip} 
            onChange={(e)=>setInfo({...info, zip: e.target.value})} 
          />
        </label>
      </div>

      <div className="border-t pt-4 mt-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Social Media (usernames only)</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <label htmlFor="business-instagram" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Instagram</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">@</span>
              <input 
                id="business-instagram"
                name="business-instagram"
                type="text" 
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="buenobrows"
                value={info.instagram || ''} 
                onChange={(e)=>setInfo({...info, instagram: e.target.value})} 
              />
            </div>
          </label>
          <label htmlFor="business-tiktok" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">TikTok</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">@</span>
              <input 
                id="business-tiktok"
                name="business-tiktok"
                type="text" 
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="buenobrows"
                value={info.tiktok || ''} 
                onChange={(e)=>setInfo({...info, tiktok: e.target.value})} 
              />
            </div>
          </label>
          <label htmlFor="business-facebook" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Facebook</span>
            <input 
              id="business-facebook"
              name="business-facebook"
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="buenobrows"
              value={info.facebook || ''} 
              onChange={(e)=>setInfo({...info, facebook: e.target.value})} 
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button 
          className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50" 
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Business Info'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Media Gallery Manager --------------------
function MediaGalleryManager({ initial }: { initial: HomePageContent }) {
  const { db } = useFirebase();
  const [content, setContent] = useState<HomePageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setHomePageContent(db, content);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, heroType: 'hero1' | 'hero2' = 'hero1') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Uploading image...');
      setMsg('');

      const storage = getStorage();
      const timestamp = Date.now();
      const fileName = `hero-images/${heroType}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      setUploadProgress('Getting download URL...');

      const downloadURL = await getDownloadURL(storageRef);
      
      if (heroType === 'hero1') {
        setContent({ ...content, heroImageUrl: downloadURL });
      } else {
        setContent({ ...content, hero2ImageUrl: downloadURL });
      }
      
      setUploadProgress('Image uploaded successfully!');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (e: any) {
      console.error('Upload error:', e);
      setMsg(e?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setMsg('All files must be images');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMsg(`${file.name} is too large (max 5MB)`);
        return;
      }
    }

    try {
      setUploadingGallery(true);
      setMsg('');

      const storage = getStorage();
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const timestamp = Date.now();
        const fileName = `gallery/${timestamp}-${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }

      const currentGallery = content.galleryPhotos || [];
      setContent({ ...content, galleryPhotos: [...currentGallery, ...uploadedUrls] });
      
      setMsg(`Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      console.error('Gallery upload error:', e);
      setMsg(e?.message || 'Failed to upload photos');
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryPhoto(index: number) {
    const currentGallery = content.galleryPhotos || [];
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setContent({ ...content, galleryPhotos: newGallery });
  }

  return (
    <div className="grid gap-8 max-w-4xl">
      {/* First Hero Image Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
          <span className="text-xl">🖼️</span>
          First Hero Image (Top Banner)
        </h3>
        <p className="text-sm text-slate-600">Upload the main banner image that appears at the very top of your homepage</p>
        
        {/* Current Image Preview */}
        {content.heroImageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-slate-200">
            <img 
              src={content.heroImageUrl} 
              alt="First Hero preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setContent({ ...content, heroImageUrl: '' })}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              title="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'hero1')}
              className="hidden"
              disabled={uploading}
            />
            <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? 'Uploading...' : content.heroImageUrl ? 'Change First Hero Image' : 'Upload First Hero Image'}
            </div>
          </label>
          {uploadProgress && <span className="text-sm text-green-600">{uploadProgress}</span>}
        </div>
        <span className="text-xs text-slate-500">Recommended: 1200x600px, max 5MB (JPG, PNG, WebP)</span>
      </div>

      {/* Second Hero Image Section */}
      <div className="space-y-4 border-t pt-8">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
          <span className="text-xl">🖼️</span>
          Second Hero Image (Content Section)
        </h3>
        <p className="text-sm text-slate-600">Upload the second hero image that appears in the content section below the main banner</p>
        
        {/* Current Image Preview */}
        {content.hero2ImageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-slate-200">
            <img 
              src={content.hero2ImageUrl} 
              alt="Second Hero preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setContent({ ...content, hero2ImageUrl: '' })}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              title="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'hero2')}
              className="hidden"
              disabled={uploading}
            />
            <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? 'Uploading...' : content.hero2ImageUrl ? 'Change Second Hero Image' : 'Upload Second Hero Image'}
            </div>
          </label>
          {uploadProgress && <span className="text-sm text-green-600">{uploadProgress}</span>}
        </div>
        <span className="text-xs text-slate-500">Recommended: 1200x600px, max 5MB (JPG, PNG, WebP)</span>
      </div>

      {/* Gallery Photos Section */}
      <div className="space-y-4 border-t pt-8">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
          <span className="text-xl">📸</span>
          Shop Photo Gallery
        </h3>
        <p className="text-sm text-slate-600">Upload beautiful photos of your shop, workspace, or work samples to showcase on the homepage</p>
        
        {/* Gallery Grid */}
        {content.galleryPhotos && content.galleryPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {content.galleryPhotos.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group">
                <img 
                  src={url} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeGalleryPhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  title="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {!content.galleryPhotos?.length && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
            <svg className="w-16 h-16 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-600 font-medium">No gallery photos yet</p>
            <p className="text-slate-500 text-sm">Upload your first photos to create a beautiful gallery</p>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={uploadingGallery}
            />
            <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploadingGallery ? 'Uploading...' : 'Add Gallery Photos'}
            </div>
          </label>
          <span className="text-xs text-slate-500">Select multiple photos (max 5MB each)</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-6 border-t">
        <button 
          className="bg-terracotta text-white rounded-lg px-6 py-2.5 hover:bg-terracotta/90 transition-colors disabled:opacity-50 font-medium" 
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.includes('Success') || msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Homepage Content --------------------
function HomePageContentForm({ initial }: { initial: HomePageContent }) {
  const { db } = useFirebase();
  const [content, setContent] = useState<HomePageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setHomePageContent(db, content);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          Hero Section
        </h3>
        <p className="text-sm text-slate-600">The main heading and subtitle for your homepage. To change the hero image, go to the Media Gallery tab.</p>
        
        <div className="grid gap-4">
          <label htmlFor="hero-title" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Hero Title</span>
            <input 
              id="hero-title"
              name="hero-title"
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.heroTitle} 
              onChange={(e)=>setContent({...content, heroTitle: e.target.value})} 
            />
          </label>

          <label htmlFor="hero-subtitle" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Hero Subtitle</span>
            <textarea 
              id="hero-subtitle"
              name="hero-subtitle"
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              rows={2}
              value={content.heroSubtitle} 
              onChange={(e)=>setContent({...content, heroSubtitle: e.target.value})} 
            />
          </label>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">🔘</span>
          Call-to-Action Buttons
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <label htmlFor="cta-primary" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Primary Button Text</span>
            <input 
              id="cta-primary"
              name="cta-primary"
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.ctaPrimary} 
              onChange={(e)=>setContent({...content, ctaPrimary: e.target.value})} 
            />
          </label>
          <label htmlFor="cta-secondary" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Secondary Button Text</span>
            <input 
              id="cta-secondary"
              name="cta-secondary"
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.ctaSecondary} 
              onChange={(e)=>setContent({...content, ctaSecondary: e.target.value})} 
            />
          </label>
        </div>
      </div>

      {/* Second Hero Section Content */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          Second Hero Section Content
        </h3>
        <p className="text-sm text-slate-600">Customize the text content for your second hero section (appears below the main banner)</p>
        
        <div className="grid gap-4">
          <label htmlFor="hero2-title" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Second Hero Title (optional)</span>
            <input 
              id="hero2-title"
              name="hero2-title"
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.hero2Title || ''} 
              onChange={(e)=>setContent({...content, hero2Title: e.target.value})} 
              placeholder="Leave empty to use main hero title"
            />
          </label>
          <label htmlFor="hero2-subtitle" className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Second Hero Subtitle (optional)</span>
            <textarea 
              id="hero2-subtitle"
              name="hero2-subtitle"
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              rows={2}
              value={content.hero2Subtitle || ''} 
              onChange={(e)=>setContent({...content, hero2Subtitle: e.target.value})} 
              placeholder="Leave empty to use main hero subtitle"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label htmlFor="hero2-cta-primary" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Second Hero Primary Button (optional)</span>
              <input 
                id="hero2-cta-primary"
                name="hero2-cta-primary"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                value={content.hero2CtaPrimary || ''} 
                onChange={(e)=>setContent({...content, hero2CtaPrimary: e.target.value})} 
                placeholder="Leave empty to use main CTA button"
              />
            </label>
            <label htmlFor="hero2-cta-secondary" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Second Hero Secondary Button (optional)</span>
              <input 
                id="hero2-cta-secondary"
                name="hero2-cta-secondary"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                value={content.hero2CtaSecondary || ''} 
                onChange={(e)=>setContent({...content, hero2CtaSecondary: e.target.value})} 
                placeholder="Leave empty to use main secondary button"
              />
            </label>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">📖</span>
          About Section
        </h3>
        
        <label htmlFor="about-text" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">About Text</span>
          <textarea 
            id="about-text"
            name="about-text"
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            rows={3}
            value={content.aboutText} 
            onChange={(e)=>setContent({...content, aboutText: e.target.value})} 
          />
        </label>
      </div>

      {/* Bueno Circle */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-lg">🎁</span>
            Bueno Circle (Loyalty Program)
          </h3>
          <label htmlFor="bueno-circle-enabled" className="flex items-center gap-2">
            <input 
              id="bueno-circle-enabled"
              name="bueno-circle-enabled"
              type="checkbox" 
              className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
              checked={content.buenoCircleEnabled} 
              onChange={(e)=>setContent({...content, buenoCircleEnabled: e.target.checked})} 
            />
            <span className="text-sm font-medium text-slate-600">Enabled</span>
          </label>
        </div>

        {content.buenoCircleEnabled && (
          <div className="grid gap-4 pl-6 border-l-2 border-terracotta/30">
            <label htmlFor="bueno-circle-title" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Section Title</span>
              <input 
                id="bueno-circle-title"
                name="bueno-circle-title"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                value={content.buenoCircleTitle} 
                onChange={(e)=>setContent({...content, buenoCircleTitle: e.target.value})} 
              />
            </label>

            <label htmlFor="bueno-circle-description" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea 
                id="bueno-circle-description"
                name="bueno-circle-description"
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                rows={2}
                value={content.buenoCircleDescription} 
                onChange={(e)=>setContent({...content, buenoCircleDescription: e.target.value})} 
              />
            </label>

            <label htmlFor="bueno-circle-discount" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Discount Percentage</span>
              <input 
                id="bueno-circle-discount"
                name="bueno-circle-discount"
                type="number" 
                min={0}
                max={100}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent w-32" 
                value={content.buenoCircleDiscount} 
                onChange={(e)=>setContent({...content, buenoCircleDiscount: parseInt(e.target.value || '0')})} 
              />
            </label>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-6 border-t">
        <button 
          className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50" 
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Website Content'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Skin Analysis Content Form --------------------
function SkinAnalysisContentForm({ initial }: { initial: HomePageContent }) {
  const { db } = useFirebase();
  const [content, setContent] = useState<HomePageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setHomePageContent(db, content);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Uploading image...');
      setMsg('');

      const storage = getStorage();
      const timestamp = Date.now();
      const fileName = `skin-analysis/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      setUploadProgress('Getting download URL...');

      const downloadURL = await getDownloadURL(storageRef);
      setContent({ ...content, skinAnalysisImageUrl: downloadURL });
      setUploadProgress('Image uploaded successfully!');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (e: any) {
      console.error('Upload error:', e);
      setMsg(e?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-lg">✨</span>
            Display AI Skin Analysis Section
          </h3>
          <p className="text-sm text-slate-600 mt-1">Show or hide the skin analysis feature on your homepage</p>
        </div>
        <label htmlFor="skin-analysis-enabled" className="flex items-center gap-2">
          <input 
            id="skin-analysis-enabled"
            name="skin-analysis-enabled"
            type="checkbox" 
            className="rounded border-slate-300 text-purple-600 focus:ring-purple-600 w-5 h-5"
            checked={content.skinAnalysisEnabled || false} 
            onChange={(e)=>setContent({...content, skinAnalysisEnabled: e.target.checked})} 
          />
          <span className="text-sm font-medium text-slate-600">
            {content.skinAnalysisEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {content.skinAnalysisEnabled && (
        <div className="space-y-6 pl-6 border-l-4 border-purple-200">
          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Section Content
            </h3>
            
            <label htmlFor="skin-analysis-title" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Main Title</span>
              <input 
                id="skin-analysis-title"
                name="skin-analysis-title"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                placeholder="Discover Your Perfect Look with AI"
                value={content.skinAnalysisTitle || ''} 
                onChange={(e)=>setContent({...content, skinAnalysisTitle: e.target.value})} 
              />
            </label>

            <label htmlFor="skin-analysis-subtitle" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Subtitle</span>
              <input 
                id="skin-analysis-subtitle"
                name="skin-analysis-subtitle"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                placeholder="Get personalized beauty recommendations powered by AI"
                value={content.skinAnalysisSubtitle || ''} 
                onChange={(e)=>setContent({...content, skinAnalysisSubtitle: e.target.value})} 
              />
            </label>

            <label htmlFor="skin-analysis-description" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea 
                id="skin-analysis-description"
                name="skin-analysis-description"
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                rows={3}
                placeholder="Upload a photo and let our advanced AI analyze your skin type, tone, and facial features to recommend the perfect services and products tailored just for you."
                value={content.skinAnalysisDescription || ''} 
                onChange={(e)=>setContent({...content, skinAnalysisDescription: e.target.value})} 
              />
            </label>

            <label htmlFor="skin-analysis-cta" className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Button Text</span>
              <input 
                id="skin-analysis-cta"
                name="skin-analysis-cta"
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                placeholder="Try Free Skin Analysis"
                value={content.skinAnalysisCTA || ''} 
                onChange={(e)=>setContent({...content, skinAnalysisCTA: e.target.value})} 
              />
            </label>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🖼️</span>
              Feature Image
            </h3>
            <p className="text-sm text-slate-600">Upload an image to showcase the AI skin analysis feature</p>
            
            {/* Current Image Preview */}
            {content.skinAnalysisImageUrl && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-purple-200">
                <img 
                  src={content.skinAnalysisImageUrl} 
                  alt="Skin Analysis preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setContent({ ...content, skinAnalysisImageUrl: '' })}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Uploading...' : content.skinAnalysisImageUrl ? 'Change Image' : 'Upload Image'}
                </div>
              </label>
              {uploadProgress && <span className="text-sm text-green-600">{uploadProgress}</span>}
            </div>
            <span className="text-xs text-slate-500">Recommended: 800x600px, max 5MB (JPG, PNG, WebP)</span>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-6 border-t">
        <button 
          className="bg-purple-600 text-white rounded-lg px-6 py-2 hover:bg-purple-700 transition-colors disabled:opacity-50" 
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Skin Analysis Settings'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Analytics Targets --------------------
function TargetsForm({ initial }: { initial: AnalyticsTargets }) {
  const { db } = useFirebase();
  const [dailyTarget, setDailyTarget] = useState<number>(initial.dailyTarget);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(initial.weeklyTarget);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(initial.monthlyTarget);
  const [defaultCogsRate, setDefaultCogsRate] = useState<number>(initial.defaultCogsRate);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setAnalyticsTargets(db, { dailyTarget, weeklyTarget, monthlyTarget, defaultCogsRate });
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-2xl">
      <label htmlFor="daily-target" className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Daily target ($)</span>
        <input id="daily-target" name="daily-target" type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={dailyTarget} onChange={(e)=>setDailyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label htmlFor="weekly-target" className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Weekly target ($)</span>
        <input id="weekly-target" name="weekly-target" type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={weeklyTarget} onChange={(e)=>setWeeklyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label htmlFor="monthly-target" className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Monthly target ($)</span>
        <input id="monthly-target" name="monthly-target" type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={monthlyTarget} onChange={(e)=>setMonthlyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label htmlFor="default-cogs-rate" className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Default COGS rate (%)</span>
        <input id="default-cogs-rate" name="default-cogs-rate" type="number" min={0} max={100} step={0.1} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={defaultCogsRate} onChange={(e)=>setDefaultCogsRate(parseFloat(e.target.value||'0'))} />
      </label>
      <div className="flex items-center gap-3 pt-4">
        <button className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Targets'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Business Hours --------------------
const dayKeys = ['sun','mon','tue','wed','thu','fri','sat'] as const;
const dayLabels: Record<typeof dayKeys[number], string> = { sun:'Sunday', mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday' };

function BusinessHoursEditor({ initial }: { initial: BusinessHours }) {
  const { db } = useFirebase();
  const [timezone, setTimezone] = useState<string>(initial.timezone);
  const [slotInterval, setSlotInterval] = useState<number>(initial.slotInterval);
  const [slots, setSlots] = useState<BusinessHours['slots']>(() => JSON.parse(JSON.stringify(initial.slots)));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function addRange(day: typeof dayKeys[number]) {
    const next = structuredClone(slots);
    (next[day] ||= []).push(['09:00','17:00']);
    setSlots(next);
  }
  function removeRange(day: typeof dayKeys[number], idx: number) {
    const next = structuredClone(slots);
    next[day].splice(idx,1);
    setSlots(next);
  }
  function updateCell(day: typeof dayKeys[number], idx: number, col: 0|1, value: string) {
    const v = value.trim();
    const next = structuredClone(slots);
    next[day][idx][col] = v;
    setSlots(next);
  }

  async function save() {
    try {
      setSaving(true); setMsg('');
      validateAll({ timezone, slotInterval, slots });
      await setBusinessHours(db, { timezone, slotInterval, slots });
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 max-w-4xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <label htmlFor="timezone" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Timezone (IANA)</span>
          <input id="timezone" name="timezone" className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" placeholder="America/Los_Angeles" value={timezone} onChange={(e)=>setTimezone(e.target.value)} />
        </label>
        <label htmlFor="slot-interval" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Slot interval (minutes)</span>
          <input id="slot-interval" name="slot-interval" type="number" min={5} step={5} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={slotInterval} onChange={(e)=>setSlotInterval(parseInt(e.target.value||'15'))} />
        </label>
      </div>

      <div className="grid gap-4">
        {dayKeys.map((k) => (
          <div key={k} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg text-slate-800">{dayLabels[k]}</h3>
              <button className="text-terracotta hover:text-terracotta/80 text-sm font-medium" onClick={()=>addRange(k)}>+ Add hours</button>
            </div>
            {(slots[k] || []).length === 0 && (
              <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-3 text-center">Closed</div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(slots[k] || []).map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <input
                    className="border border-slate-300 rounded-md p-2 w-24 text-sm"
                    placeholder="09:00"
                    value={pair[0]}
                    onChange={(e)=>updateCell(k, idx, 0, e.target.value)}
                    aria-label={`${dayLabels[k]} start ${idx+1}`}
                  />
                  <span className="text-slate-500">—</span>
                  <input
                    className="border border-slate-300 rounded-md p-2 w-24 text-sm"
                    placeholder="17:00"
                    value={pair[1]}
                    onChange={(e)=>updateCell(k, idx, 1, e.target.value)}
                    aria-label={`${dayLabels[k]} end ${idx+1}`}
                  />
                  <button 
                    className="text-red-600 hover:text-red-700 p-1" 
                    onClick={()=>removeRange(k, idx)}
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <button className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Business Hours'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>

      <SlotPreview bh={{ timezone, slotInterval, slots }} />
    </div>
  );
}

// -------------------- Slot Preview --------------------
function SlotPreview({ bh }: { bh: BusinessHours }) {
  const { db } = useFirebase();
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [duration, setDuration] = useState<number>(60);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const d = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);

  useEffect(() => {
    return watchAppointmentsByDay(db, d, setAppts);
  }, [d]);

  const slots = useMemo(() => availableSlotsForDay(d, duration, bh, appts), [d, duration, bh, appts]);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
      <h4 className="font-medium text-slate-800 mb-3">Preview Available Slots</h4>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label htmlFor="preview-date" className="text-sm text-slate-600 mb-1 block">Preview date</label>
          <input id="preview-date" name="preview-date" type="date" className="border border-slate-300 rounded-lg p-2 text-sm" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
        </div>
        <div>
          <label htmlFor="preview-duration" className="text-sm text-slate-600 mb-1 block">Service duration (minutes)</label>
          <input id="preview-duration" name="preview-duration" type="number" min={5} step={5} className="border border-slate-300 rounded-lg p-2 text-sm w-32" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value||'0'))} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((iso)=> (
          <div key={iso} className="border border-slate-300 bg-white rounded-md py-2 text-center text-sm">{format(parseISO(iso), 'h:mm a')}</div>
        ))}
        {!slots.length && <div className="col-span-4 text-slate-500 text-sm text-center py-4">No available slots for this date/duration.</div>}
      </div>
    </div>
  );
}

// -------------------- Validation --------------------
function validateAll(v: { timezone: string; slotInterval: number; slots: BusinessHours['slots'] }) {
  if (!v.timezone || !v.timezone.includes('/')) throw new Error('Timezone must be a valid IANA zone, e.g. "America/Los_Angeles"');
  if (!Number.isFinite(v.slotInterval) || v.slotInterval <= 0) throw new Error('Slot interval must be a positive number');
  const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
  (['sun','mon','tue','wed','thu','fri','sat'] as const).forEach((day) => {
    for (const [start, end] of v.slots[day] || []) {
      if (!re.test(start) || !re.test(end)) throw new Error(`Invalid time on ${day}: use HH:MM`);
      if (start >= end) throw new Error(`${day}: start must be before end`);
    }
  });
}

// -------------------- Consent Forms Manager --------------------
function ConsentFormsManager() {
  const { db } = useFirebase();
  const [consents, setConsents] = useState<CustomerConsent[]>([]);
  const [templates, setTemplates] = useState<Record<string, ConsentFormTemplate>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsent, setSelectedConsent] = useState<CustomerConsent | null>(null);

  // Watch all customer consents
  useEffect(() => {
    const consentsRef = collection(db, 'customerConsents');
    const q = query(consentsRef, orderBy('consentedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const consentsList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as CustomerConsent));
      setConsents(consentsList);
      setLoading(false);
      
      // Fetch all unique consent form templates
      const uniqueFormIds = [...new Set(consentsList.map(c => c.consentFormId))];
      uniqueFormIds.forEach(async (formId) => {
        if (!templates[formId]) {
          const formDoc = await getDoc(doc(db, 'consentFormTemplates', formId));
          if (formDoc.exists()) {
            setTemplates(prev => ({
              ...prev,
              [formId]: { id: formDoc.id, ...formDoc.data() } as ConsentFormTemplate
            }));
          }
        }
      });
    }, (error) => {
      console.error('Error watching consents:', error);
      setLoading(false);
    });
  }, [db]);

  const filteredConsents = useMemo(() => {
    if (!searchTerm) return consents;
    const term = searchTerm.toLowerCase();
    return consents.filter(c => 
      c.customerName?.toLowerCase().includes(term) ||
      c.customerEmail?.toLowerCase().includes(term) ||
      c.customerPhone?.includes(term) ||
      c.consentFormCategory?.toLowerCase().includes(term)
    );
  }, [consents, searchTerm]);

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading consent forms...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or category..."
            className="w-full border border-slate-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-terracotta focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-sm text-slate-600 whitespace-nowrap">
          {filteredConsents.length} consent{filteredConsents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Consents List */}
      {filteredConsents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600 font-medium">No consent forms found</p>
          <p className="text-slate-500 text-sm">
            {searchTerm ? 'Try a different search term' : 'Customer consent forms will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConsents.map((consent) => {
            const template = templates[consent.consentFormId];
            return (
              <div 
                key={consent.id} 
                className="border border-slate-200 rounded-lg p-4 hover:border-terracotta transition-colors cursor-pointer"
                onClick={() => setSelectedConsent(consent)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      {consent.customerName}
                      {consent.agreed ? (
                        <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">✓ Signed</span>
                      ) : (
                        <span className="text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded-full">✗ Declined</span>
                      )}
                      {consent.needsRenewal && (
                        <span className="text-orange-600 text-xs bg-orange-50 px-2 py-0.5 rounded-full">⚠ Needs Renewal</span>
                      )}
                    </h3>
                    <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                      {consent.customerEmail && <div>📧 {consent.customerEmail}</div>}
                      {consent.customerPhone && <div>📱 {consent.customerPhone}</div>}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-500">
                      {format(parseISO(consent.consentedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {format(parseISO(consent.consentedAt), 'h:mm a')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium">Category:</span>
                    <span className="capitalize">{consent.consentFormCategory?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium">Version:</span>
                    <span>{consent.consentFormVersion}</span>
                  </div>
                  {template && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-medium">Form:</span>
                      <span>{template.name}</span>
                    </div>
                  )}
                </div>

                {consent.signature && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Signature:</div>
                    {consent.signature.startsWith('data:image') ? (
                      <img src={consent.signature} alt="Signature" className="h-12 border border-slate-200 rounded px-2 bg-white" />
                    ) : (
                      <div className="font-cursive text-2xl text-slate-700">{consent.signature}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Consent Detail Modal */}
      {selectedConsent && (
        <ConsentDetailModal 
          consent={selectedConsent} 
          template={templates[selectedConsent.consentFormId]}
          onClose={() => setSelectedConsent(null)} 
        />
      )}
    </div>
  );
}

// -------------------- Consent Detail Modal --------------------
function ConsentDetailModal({ 
  consent, 
  template,
  onClose 
}: { 
  consent: CustomerConsent; 
  template?: ConsentFormTemplate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-slate-800 mb-1">Consent Form Details</h2>
            <p className="text-slate-600">{consent.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Customer Information</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Name:</span>
                <span className="ml-2 font-medium text-slate-800">{consent.customerName}</span>
              </div>
              {consent.customerEmail && (
                <div>
                  <span className="text-slate-500">Email:</span>
                  <span className="ml-2 font-medium text-slate-800">{consent.customerEmail}</span>
                </div>
              )}
              {consent.customerPhone && (
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <span className="ml-2 font-medium text-slate-800">{consent.customerPhone}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Signed:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {format(parseISO(consent.consentedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {consent.ipAddress && (
                <div>
                  <span className="text-slate-500">IP Address:</span>
                  <span className="ml-2 font-medium text-slate-800">{consent.ipAddress}</span>
                </div>
              )}
              {consent.appointmentId && (
                <div>
                  <span className="text-slate-500">Appointment ID:</span>
                  <span className="ml-2 font-medium text-slate-800">{consent.appointmentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Consent Status */}
          <div className="flex items-center gap-4">
            <div className={`flex-1 rounded-lg p-4 ${consent.agreed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-sm font-medium mb-1">Status</div>
              <div className={`text-lg font-semibold ${consent.agreed ? 'text-green-700' : 'text-red-700'}`}>
                {consent.agreed ? '✓ Agreed' : '✗ Declined'}
              </div>
            </div>
            {consent.needsRenewal && (
              <div className="flex-1 rounded-lg p-4 bg-orange-50 border border-orange-200">
                <div className="text-sm font-medium mb-1 text-orange-700">Renewal Required</div>
                <div className="text-sm text-orange-600">Form has been updated</div>
              </div>
            )}
            {consent.expiresAt && (
              <div className="flex-1 rounded-lg p-4 bg-blue-50 border border-blue-200">
                <div className="text-sm font-medium mb-1 text-blue-700">Expires</div>
                <div className="text-sm text-blue-600">
                  {format(parseISO(consent.expiresAt), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          {consent.signature && (
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Digital Signature</h3>
              {consent.signature.startsWith('data:image') ? (
                <div className="bg-white border border-slate-300 rounded p-4 inline-block">
                  <img src={consent.signature} alt="Customer signature" className="h-20" />
                </div>
              ) : (
                <div className="bg-white border border-slate-300 rounded p-4 inline-block">
                  <div className="font-cursive text-4xl text-slate-700">{consent.signature}</div>
                </div>
              )}
            </div>
          )}

          {/* Form Template Details */}
          {template && (
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Form Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Form Name:</span>
                  <span className="ml-2 font-medium text-slate-800">{template.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Version:</span>
                  <span className="ml-2 font-medium text-slate-800">{template.version}</span>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>
                  <span className="ml-2 font-medium text-slate-800 capitalize">
                    {template.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Title:</span>
                  <span className="ml-2 font-medium text-slate-800">{template.title}</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2">Form Content</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-600 mb-4">{template.content}</p>
                  
                  {template.sections && template.sections.length > 0 && (
                    <div className="space-y-4">
                      {template.sections.map((section, idx) => (
                        <div key={idx} className="bg-slate-50 rounded p-3">
                          <h5 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            {section.heading}
                            {section.required && (
                              <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                            )}
                          </h5>
                          <div className="text-slate-600 whitespace-pre-line text-sm">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Agent */}
          {consent.userAgent && (
            <div className="text-xs text-slate-400 bg-slate-50 rounded p-3">
              <span className="font-medium">User Agent:</span> {consent.userAgent}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Service Images Manager --------------------
function ServiceImagesManager() {
  const { db } = useFirebase();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const servicesList: Service[] = [];
      snapshot.forEach((doc) => {
        servicesList.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(servicesList);
      setLoading(false);
    });
  }, [db]);

  const handleImageUpdate = async (serviceId: string, imageUrl: string) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        imageUrl: imageUrl || null,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update service image:', error);
      alert('Failed to update service image. Please try again.');
    }
  };

  const handleDescriptionUpdate = async (serviceId: string, description: string) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        description: description || null,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update service description:', error);
      alert('Failed to update service description. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-800">Service Images</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload photos to make your services more appealing on the booking page. 
              Images should be at least 400x300 pixels for best quality.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              <strong>Supported formats:</strong> PNG, JPG, WebP, GIF (max 5MB)
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <ServiceImageCard 
            key={service.id} 
            service={service} 
            onImageUpdate={handleImageUpdate}
            onDescriptionUpdate={handleDescriptionUpdate}
          />
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No services found</h3>
          <p className="text-slate-600 mb-6">Create your first service to add images</p>
          <a 
            href="/services"
            className="bg-terracotta text-white rounded-lg px-6 py-3 hover:bg-terracotta/90 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Go to Services
          </a>
        </div>
      )}
    </div>
  );
}

function ServiceImageCard({ service, onImageUpdate, onDescriptionUpdate }: { service: Service; onImageUpdate: (serviceId: string, imageUrl: string) => void; onDescriptionUpdate: (serviceId: string, description: string) => void }) {
  const [imageUrl, setImageUrl] = useState(service.imageUrl || '');
  const [description, setDescription] = useState(service.description || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onImageUpdate(service.id, imageUrl);
    } finally {
      setSaving(false);
    }
  };

  const handleDescriptionSave = async () => {
    setSaving(true);
    try {
      await onDescriptionUpdate(service.id, description);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setImageUrl('');
    setSaving(true);
    try {
      await onImageUpdate(service.id, '');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - support regular images only
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select an image file (PNG, JPG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File must be smaller than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Uploading image...');

      const storage = getStorage();
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `service-images/${service.id}/${timestamp}-${service.name.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      setUploadProgress('Getting download URL...');

      const downloadURL = await getDownloadURL(storageRef);
      setImageUrl(downloadURL);
      setUploadProgress('Image uploaded successfully!');
      
      // Auto-save after upload
      await onImageUpdate(service.id, downloadURL);
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6">
      <div className="flex items-start gap-6">
        {/* Service Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold text-lg text-slate-800">{service.name}</h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {service.category || 'Service'}
            </span>
          </div>
          
          {/* Description Editor */}
          <div className="mb-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Service Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description for this service..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm min-h-[80px]"
              rows={3}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleDescriptionSave}
                disabled={saving || description === (service.description || '') || uploading}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Saving...' : 'Save Description'}
              </button>
              {description !== (service.description || '') && (
                <button
                  onClick={() => setDescription(service.description || '')}
                  disabled={saving || uploading}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-4 py-2 inline-flex items-center gap-2 transition-colors disabled:opacity-50 text-sm">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Photo
                    </>
                  )}
                </div>
              </label>
              <span className="text-xs text-slate-500">PNG, JPG, WebP, GIF</span>
            </div>

            {uploadProgress && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                {uploadProgress}
              </div>
            )}

            {/* Manual URL Input (fallback) */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Or enter image URL manually
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/service-image.jpg"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || imageUrl === (service.imageUrl || '') || uploading}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Saving...' : 'Save Image'}
              </button>
              
              {service.imageUrl && (
                <button
                  onClick={handleClear}
                  disabled={saving || uploading}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Image Preview */}
        <div className="w-48 flex-shrink-0">
          <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-slate-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500">No image</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Preview (192x128px)
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------- Accessibility Settings --------------------
function AccessibilitySettings() {
  const [colorAccessibility, setColorAccessibility] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('colorAccessibility');
    if (saved) setColorAccessibility(JSON.parse(saved));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      localStorage.setItem('colorAccessibility', JSON.stringify(colorAccessibility));
      setMsg('Settings saved successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      setMsg('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">Color Accessibility</h3>
        <p className="text-sm text-slate-600 mb-4">
          Reduce stress-inducing colors and improve accessibility for users with color sensitivity or anxiety.
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={colorAccessibility}
              onChange={(e) => setColorAccessibility(e.target.checked)}
              className="w-4 h-4 text-terracotta focus:ring-terracotta border-gray-300 rounded"
            />
            <div>
              <div className="font-medium">Disable Stress-Inducing Colors</div>
              <div className="text-sm text-slate-600">
                Replace bright reds, oranges, and other potentially stressful colors with neutral grays
              </div>
            </div>
          </label>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium mb-2">What this affects:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Progress bars and status indicators</li>
              <li>• Button colors (sync, clear holds, etc.)</li>
              <li>• Alert and warning colors</li>
              <li>• Chart and graph colors</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button 
          className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50" 
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Accessibility Settings'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Settings saved successfully' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}
