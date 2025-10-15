import { useEffect, useState, useMemo } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices, createService, updateService, deleteService } from '@buenobrows/shared/firestoreActions';
import type { Service } from '@buenobrows/shared/types';

export default function Services(){
  const { db } = useFirebase();
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(()=> {
    return watchServices(db, undefined, setRows);
  }, []);

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

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-2xl text-slate-800">Services</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your service offerings and pricing</p>
        </div>
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

      {/* Services by Category */}
      <div className="space-y-4">
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
          const isCollapsed = collapsedCategories.has(category);
          return (
            <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {category}
                  </div>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <svg 
                  className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Category Services */}
              {!isCollapsed && (
                <div className="p-4 bg-white">
                  <div className="grid gap-3">
                    {categoryServices.map((s) => (
                      <div
                        key={s.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          s.active 
                            ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm' 
                            : 'border-slate-100 bg-slate-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-slate-800">{s.name}</h3>
                              {!s.active && (
                                <span className="text-xs bg-slate-300 text-slate-600 px-2 py-1 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            
                            {s.description && (
                              <p className="text-sm text-slate-600 mb-3">{s.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {s.duration} minutes
                              </span>
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ${s.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditing(s)}
                              className="px-3 py-1 text-sm border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteService(db, s.id)}
                              className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} db={db} />}
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
