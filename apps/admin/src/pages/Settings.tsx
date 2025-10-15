import { useEffect, useMemo, useState } from 'react';
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
import type { AnalyticsTargets, BusinessHours, BusinessInfo, HomePageContent, Appointment } from '@buenobrows/shared/types';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';
import { format, parseISO } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type Tab = 'business' | 'content' | 'media' | 'hours' | 'analytics';

export default function Settings() {
  const { db } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [targets, setTargetsState] = useState<AnalyticsTargets | null>(null);
  const [bh, setBhState] = useState<BusinessHours | null>(null);
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo | null>(null);
  const [homeContent, setHomeContentState] = useState<HomePageContent | null>(null);

  useEffect(() => watchAnalyticsTargets(db, setTargetsState), []);
  useEffect(() => watchBusinessHours(db, setBhState), []);
  useEffect(() => watchBusinessInfo(db, setBusinessInfoState), []);
  useEffect(() => watchHomePageContent(db, setHomeContentState), []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'business', label: 'Business Info', icon: '🏢' },
    { id: 'content', label: 'Website Content', icon: '📝' },
    { id: 'media', label: 'Media Gallery', icon: '📸' },
    { id: 'hours', label: 'Business Hours', icon: '🕐' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
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

        {activeTab === 'hours' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Business Hours</h2>
            <p className="text-sm text-slate-600 mb-6">Set your operating hours and availability</p>
            {bh ? <BusinessHoursEditor initial={bh} /> : <div className="text-slate-500 text-sm">Loading…</div>}
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-xl mb-2">Analytics Targets</h2>
            <p className="text-sm text-slate-600 mb-6">Set your revenue goals and performance targets</p>
            {targets ? <TargetsForm initial={targets} /> : <div className="text-slate-500 text-sm">Loading…</div>}
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
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Business Name</span>
          <input 
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.name} 
            onChange={(e)=>setInfo({...info, name: e.target.value})} 
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Phone Number</span>
          <input 
            type="tel" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.phone} 
            onChange={(e)=>setInfo({...info, phone: e.target.value})} 
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Email Address</span>
        <input 
          type="email" 
          className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
          value={info.email} 
          onChange={(e)=>setInfo({...info, email: e.target.value})} 
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Street Address</span>
        <input 
          type="text" 
          className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
          value={info.address} 
          onChange={(e)=>setInfo({...info, address: e.target.value})} 
        />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input 
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.city} 
            onChange={(e)=>setInfo({...info, city: e.target.value})} 
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">State</span>
          <input 
            type="text" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={info.state} 
            onChange={(e)=>setInfo({...info, state: e.target.value})} 
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">ZIP Code</span>
          <input 
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
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Instagram</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">@</span>
              <input 
                type="text" 
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="buenobrows"
                value={info.instagram || ''} 
                onChange={(e)=>setInfo({...info, instagram: e.target.value})} 
              />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">TikTok</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">@</span>
              <input 
                type="text" 
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="buenobrows"
                value={info.tiktok || ''} 
                onChange={(e)=>setInfo({...info, tiktok: e.target.value})} 
              />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Facebook</span>
            <input 
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
      const fileName = `hero-images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      setUploadProgress('Getting download URL...');

      const downloadURL = await getDownloadURL(storageRef);
      setContent({ ...content, heroImageUrl: downloadURL });
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
      {/* Hero Image Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
          <span className="text-xl">🖼️</span>
          Hero Image
        </h3>
        <p className="text-sm text-slate-600">Upload the main image that appears at the top of your homepage</p>
        
        {/* Current Image Preview */}
        {content.heroImageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-slate-200">
            <img 
              src={content.heroImageUrl} 
              alt="Hero preview" 
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
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? 'Uploading...' : content.heroImageUrl ? 'Change Hero Image' : 'Upload Hero Image'}
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
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Hero Title</span>
            <input 
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.heroTitle} 
              onChange={(e)=>setContent({...content, heroTitle: e.target.value})} 
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Hero Subtitle</span>
            <textarea 
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
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Primary Button Text</span>
            <input 
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.ctaPrimary} 
              onChange={(e)=>setContent({...content, ctaPrimary: e.target.value})} 
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Secondary Button Text</span>
            <input 
              type="text" 
              className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={content.ctaSecondary} 
              onChange={(e)=>setContent({...content, ctaSecondary: e.target.value})} 
            />
          </label>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">📖</span>
          About Section
        </h3>
        
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">About Text</span>
          <textarea 
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
          <label className="flex items-center gap-2">
            <input 
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
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Section Title</span>
              <input 
                type="text" 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                value={content.buenoCircleTitle} 
                onChange={(e)=>setContent({...content, buenoCircleTitle: e.target.value})} 
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea 
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                rows={2}
                value={content.buenoCircleDescription} 
                onChange={(e)=>setContent({...content, buenoCircleDescription: e.target.value})} 
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Discount Percentage</span>
              <input 
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
      <label className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Daily target ($)</span>
        <input type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={dailyTarget} onChange={(e)=>setDailyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Weekly target ($)</span>
        <input type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={weeklyTarget} onChange={(e)=>setWeeklyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Monthly target ($)</span>
        <input type="number" min={0} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={monthlyTarget} onChange={(e)=>setMonthlyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[200px_1fr] items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Default COGS rate (%)</span>
        <input type="number" min={0} max={100} step={0.1} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={defaultCogsRate} onChange={(e)=>setDefaultCogsRate(parseFloat(e.target.value||'0'))} />
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
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Timezone (IANA)</span>
          <input className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" placeholder="America/Los_Angeles" value={timezone} onChange={(e)=>setTimezone(e.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Slot interval (minutes)</span>
          <input type="number" min={5} step={5} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" value={slotInterval} onChange={(e)=>setSlotInterval(parseInt(e.target.value||'15'))} />
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
          <div className="text-sm text-slate-600 mb-1">Preview date</div>
          <input type="date" className="border border-slate-300 rounded-lg p-2 text-sm" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
        </div>
        <div>
          <div className="text-sm text-slate-600 mb-1">Service duration (minutes)</div>
          <input type="number" min={5} step={5} className="border border-slate-300 rounded-lg p-2 text-sm w-32" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value||'0'))} />
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
