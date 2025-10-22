import { useEffect, useState, useMemo, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices, createService, updateService, deleteService } from '@buenobrows/shared/firestoreActions';
import type { Service } from '@buenobrows/shared/types';
import ServiceCategoryManager from '@/components/ServiceCategoryManager';
import DraggableServices from '@/components/DraggableServices';
import DraggableServicesGrid from '@/components/DraggableServicesGrid';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

export default function Services(){
  const { db } = useFirebase();
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [serviceOrders, setServiceOrders] = useState<Record<string, string[]>>({});
  const [imageUploadService, setImageUploadService] = useState<Service | null>(null);

  // Persist collapsedCategories state
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('servicesCollapsedCategories');
    if (savedCollapsed) {
      try {
        const parsed = JSON.parse(savedCollapsed);
        if (Array.isArray(parsed)) {
          setCollapsedCategories(new Set(parsed));
        }
      } catch (e) {
        console.error('Failed to parse collapsed categories:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('servicesCollapsedCategories', JSON.stringify([...collapsedCategories]));
  }, [collapsedCategories]);

  // Load category order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('servicesCategoryOrder');
    if (saved) {
      try {
        setCategoryOrder(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse category order:', e);
      }
    }
  }, []);

  // Load service orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('servicesServiceOrders');
    if (saved) {
      try {
        setServiceOrders(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse service orders:', e);
      }
    }
  }, []);

  // Save category order to localStorage
  const saveCategoryOrder = (order: string[]) => {
    setCategoryOrder(order);
    localStorage.setItem('servicesCategoryOrder', JSON.stringify(order));
  };

  // Save service order for a category to localStorage
  const saveServiceOrder = (category: string, order: string[]) => {
    const newServiceOrders = { ...serviceOrders, [category]: order };
    setServiceOrders(newServiceOrders);
    localStorage.setItem('servicesServiceOrders', JSON.stringify(newServiceOrders));
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  useEffect(()=> {
    if (!db) {
      setError('Database not initialized');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const unsubscribe = watchServices(db, undefined, (services) => {
        setRows(services || []);
        setError(null);
        setLoading(false);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Unable to load services. Please refresh the page.');
      setLoading(false);
    }
  }, [db]);

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    rows.forEach((service) => {
      const category = service.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
    });
    return groups;
  }, [rows]);

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-2xl text-slate-800">Services</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your service offerings and pricing</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={() => setShowCategoryManager(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Manage Categories
          </button>
          <button 
            className="bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors flex items-center gap-2"
            onClick={()=>setEditing({id:'', name:'', price:0, duration:60, active:true, category: ''})}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service
          </button>
        </div>
      </div>

      {/* Services by Category - Now Draggable! */}
      {rows.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No services yet</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first service</p>
          <button 
            className="bg-terracotta text-white rounded-lg px-6 py-3 hover:bg-terracotta/90 transition-colors inline-flex items-center gap-2"
            onClick={()=>setEditing({id:'', name:'', price:0, duration:60, active:true, category: ''})}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Service
          </button>
        </div>
      ) : (
        <DraggableServices
          items={Object.entries(servicesByCategory)
            .sort((a, b) => {
              const aIndex = categoryOrder.indexOf(a[0]);
              const bIndex = categoryOrder.indexOf(b[0]);
              if (aIndex === -1 && bIndex === -1) return 0;
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            })
            .map(([category, categoryServices]) => {
              const isCollapsed = collapsedCategories.has(category);
              return {
                id: category,
                content: (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Category Header with Icon - Clickable */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta to-terracotta/80 text-white shadow-lg">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-slate-800">{category}</h3>
                          <p className="text-sm text-slate-500">{categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''} available</p>
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-slate-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  
                  {/* Services Grid - Now Draggable! */}
                  {!isCollapsed && (
                    <div className="p-6">
                      <DraggableServicesGrid
                        items={categoryServices
                          .sort((a, b) => {
                            const order = serviceOrders[category] || [];
                            const aIndex = order.indexOf(a.id);
                            const bIndex = order.indexOf(b.id);
                            if (aIndex === -1 && bIndex === -1) return 0;
                            if (aIndex === -1) return 1;
                            if (bIndex === -1) return -1;
                            return aIndex - bIndex;
                          })
                          .map((s) => ({
                            id: s.id,
                            content: (
                              <div
                                className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                                  s.active 
                                    ? 'border-slate-200 bg-white hover:border-terracotta/40' 
                                    : 'border-slate-100 bg-slate-50 opacity-60'
                                }`}
                              >
                                {/* Service Image - Clickable */}
                                <div 
                                  onClick={() => setImageUploadService(s)}
                                  className="relative h-32 bg-gradient-to-br from-terracotta/20 to-terracotta/5 cursor-pointer hover:opacity-90 transition-opacity"
                                  title="Click to change image"
                                >
                                  {(s as any).imageUrl ? (
                                    <img 
                                      src={(s as any).imageUrl} 
                                      alt={s.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className={`absolute inset-0 flex items-center justify-center ${(s as any).imageUrl ? 'hidden' : 'flex'}`}
                                    style={{ display: (s as any).imageUrl ? 'none' : 'flex' }}
                                  >
                                    <div className="text-center">
                                      <div className="w-12 h-12 mx-auto mb-2 bg-terracotta/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs text-slate-500">Click to add image</p>
                                    </div>
                                  </div>
                                  {/* Camera icon overlay on hover */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-white text-center">
                                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <p className="text-xs font-medium">Change Photo</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Active/Inactive Badge */}
                                <div className="absolute top-36 right-4 z-10">
                                  {s.active ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium shadow-sm">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-slate-300 text-slate-600 px-2 py-1 rounded-full font-medium shadow-sm">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                
                                {/* Service Content */}
                                <div className="p-6 pt-4">
                                  <h4 className="mb-3 text-lg font-bold text-slate-800 group-hover:text-terracotta transition-colors">
                                    {s.name}
                                  </h4>
                                  
                                  {s.description && (
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                                      {s.description}
                                    </p>
                                  )}
                                  
                                  {/* Duration and Price */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>{s.duration} min</span>
                                    </div>
                                    <div className="text-lg font-bold text-terracotta">
                                      ${s.price.toFixed(2)}
                                    </div>
                                  </div>
                                
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                    <button
                                      onClick={() => setEditing(s)}
                                      className="flex-1 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete "${s.name}"?`)) {
                                          deleteService(db, s.id);
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          }))
                        }
                        onReorder={(items) => saveServiceOrder(category, items.map(item => item.id))}
                      />
                    </div>
                  )}
                  </div>
                )
              };
            })}
          onReorder={(items) => saveCategoryOrder(items.map(item => item.id))}
        />
      )}

      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} db={db} />}
      {showCategoryManager && <ServiceCategoryManager onClose={() => setShowCategoryManager(false)} />}
      {imageUploadService && <ImageUploadModal service={imageUploadService} onClose={() => setImageUploadService(null)} db={db} />}
    </div>
  );
}

function Editor({ initial, onClose, db }:{ initial: Service; onClose: ()=>void; db: any }){
  const [s, setS] = useState<Service>(initial as Service);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      if (s.id) await updateService(db, s.id, s);
      else await createService(db, s);
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-slate-800">
            {s.id ? 'Edit Service' : 'Add New Service'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
            <input 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="e.g., Brow Shaping, Lash Extensions" 
              value={s.name} 
              onChange={e=>setS({...s, name:e.target.value})} 
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="e.g., Brows, Lashes, Facials" 
              value={s.category||''} 
              onChange={e=>setS({...s, category:e.target.value})} 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="Brief description of the service..." 
              value={s.description||''} 
              onChange={e=>setS({...s, description:e.target.value})} 
              rows={3}
            />
          </div>

          {/* Service Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Image URL</label>
            <input 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="https://example.com/service-image.jpg" 
              value={s.imageUrl||''} 
              onChange={e=>setS({...s, imageUrl:e.target.value})} 
            />
            <p className="text-xs text-slate-500 mt-1">
              Add a URL to an image that represents this service. This will be displayed on the booking page.
            </p>
            
            {/* Image Preview */}
            {s.imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-slate-600 mb-2">Preview:</p>
                <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden">
                  <img 
                    src={s.imageUrl} 
                    alt="Service preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm" style={{ display: 'none' }}>
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Invalid image URL</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input 
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={s.price} 
                  onChange={e=>setS({...s, price: parseFloat(e.target.value||'0')})} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration *</label>
              <div className="relative">
                <input 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                  type="number" 
                  placeholder="60" 
                  value={s.duration} 
                  onChange={e=>setS({...s, duration: parseInt(e.target.value||'0')})} 
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">min</span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input 
              type="checkbox" 
              id="active"
              checked={s.active} 
              onChange={e=>setS({...s, active: e.target.checked})}
              className="w-4 h-4 text-terracotta border-slate-300 rounded focus:ring-terracotta"
            />
            <label htmlFor="active" className="text-sm font-medium text-slate-700">
              Service is active and available for booking
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50" 
              onClick={save}
              disabled={loading || !s.name.trim() || s.price <= 0 || s.duration <= 0}
            >
              {loading ? 'Saving...' : (s.id ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Image Upload Modal --------------------
function ImageUploadModal({ service, onClose, db }: { service: Service; onClose: () => void; db: any }) {
  const [imageUrl, setImageUrl] = useState(service.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
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
      const storageReference = storageRef(storage, fileName);

      await uploadBytes(storageReference, file);
      setUploadProgress('Getting download URL...');

      const downloadURL = await getDownloadURL(storageReference);
      setImageUrl(downloadURL);
      setUploadProgress('Image uploaded successfully!');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'services', service.id), {
        imageUrl: imageUrl || null,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to update service image:', error);
      alert('Failed to update service image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'services', service.id), {
        imageUrl: null,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to remove service image:', error);
      alert('Failed to remove service image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-slate-800 mb-1">Change Service Image</h2>
            <p className="text-slate-600">{service.name}</p>
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
          {/* Current/New Image Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Image Preview</label>
            <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
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
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">No image</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Upload New Image</label>
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
                <div className="bg-terracotta text-white hover:bg-terracotta/90 rounded-lg px-5 py-2.5 inline-flex items-center gap-2 transition-colors disabled:opacity-50">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose File
                    </>
                  )}
                </div>
              </label>
              <span className="text-xs text-slate-500">PNG, JPG, WebP, GIF (max 5MB)</span>
            </div>

            {uploadProgress && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                {uploadProgress}
              </div>
            )}
          </div>

          {/* Manual URL Input (alternative) */}
          <div className="border-t pt-6 space-y-3">
            <label className="block text-sm font-medium text-slate-700">Or Enter Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/service-image.jpg"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
            />
            <p className="text-xs text-slate-500">Paste a direct link to an image hosted elsewhere</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
          <div>
            {service.imageUrl && (
              <button
                onClick={handleRemoveImage}
                disabled={saving || uploading}
                className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Current Image
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving || uploading}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading || imageUrl === (service.imageUrl || '')}
              className="px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
