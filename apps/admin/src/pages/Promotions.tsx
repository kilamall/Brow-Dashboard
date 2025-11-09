import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  watchPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion,
  watchServices,
  watchServiceCategories
} from '@buenobrows/shared/firestoreActions';
import type { Promotion, Service, ServiceCategory, DiscountType, ApplicationMethod, CustomerSegment } from '@buenobrows/shared/types';

export default function Promotions() {
  const { db } = useFirebase();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchPromotions(db, setPromotions);
    return unsubscribe;
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchServices(db, { activeOnly: false }, setServices);
    return unsubscribe;
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchServiceCategories(db, setCategories);
    return unsubscribe;
  }, [db]);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this promotion?')) return;
    try {
      setLoading(true);
      await deletePromotion(db, id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (promo: Promotion) => {
    if (!db) return;
    try {
      setLoading(true);
      const newStatus = promo.status === 'active' ? 'paused' : 'active';
      await updatePromotion(db, promo.id, { status: newStatus });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activePromotions = promotions.filter(p => p.status === 'active');
  const draftPromotions = promotions.filter(p => p.status === 'draft');
  const otherPromotions = promotions.filter(p => !['active', 'draft'].includes(p.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions & Campaigns</h1>
          <p className="text-slate-600 mt-1">Manage discounts, promo codes, and marketing campaigns</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Campaign
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <PromotionForm
          promotion={editing}
          services={services}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            if (!db) return;
            try {
              setLoading(true);
              if (editing) {
                await updatePromotion(db, editing.id, data);
              } else {
                await createPromotion(db, data);
              }
              setShowForm(false);
              setEditing(null);
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Campaigns</h2>
          <div className="grid gap-4">
            {activePromotions.map(promo => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                services={services}
                categories={categories}
              />
            ))}
          </div>
        </section>
      )}

      {/* Draft Promotions */}
      {draftPromotions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Drafts</h2>
          <div className="grid gap-4">
            {draftPromotions.map(promo => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                services={services}
                categories={categories}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Promotions */}
      {otherPromotions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Other Campaigns</h2>
          <div className="grid gap-4">
            {otherPromotions.map(promo => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                services={services}
                categories={categories}
              />
            ))}
          </div>
        </section>
      )}

      {promotions.length === 0 && !showForm && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-600 mb-4">No promotions created yet</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
          >
            Create Your First Campaign
          </button>
        </div>
      )}
    </div>
  );
}

function PromotionCard({
  promotion,
  onEdit,
  onDelete,
  onToggleStatus,
  services,
  categories,
}: {
  promotion: Promotion;
  onEdit: (p: Promotion) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (p: Promotion) => void;
  services: Service[];
  categories: ServiceCategory[];
}) {
  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDiscount = () => {
    switch (promotion.discountType) {
      case 'percentage':
        return `${promotion.discountValue}% off`;
      case 'fixed_amount':
        return `$${promotion.discountValue} off`;
      case 'free_service':
        const service = services.find(s => s.id === promotion.discountConfig?.freeServiceId);
        return `Free ${service?.name || 'Service'}`;
      case 'buy_x_get_y':
        return `Buy ${promotion.discountConfig?.buyQuantity || 2}, Get ${promotion.discountConfig?.getQuantity || 1}`;
      case 'bundle_discount':
        return `${promotion.discountValue}% off ${promotion.discountConfig?.bundleSize || 3}+ services`;
      default:
        return 'Discount';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{promotion.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
              {promotion.status}
            </span>
          </div>
          {promotion.description && (
            <p className="text-slate-600 text-sm mb-3">{promotion.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{formatDiscount()}</span>
            {promotion.promoCode && (
              <span>Code: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">{promotion.promoCode}</code></span>
            )}
            {promotion.applicationMethod === 'auto_apply' && (
              <span className="text-blue-600">Auto-apply</span>
            )}
            {promotion.usedCount !== undefined && (
              <span>Used {promotion.usedCount} times</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleStatus(promotion)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            {promotion.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          <button
            onClick={() => onEdit(promotion)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(promotion.id)}
            className="px-3 py-1.5 text-sm text-red-600 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionForm({
  promotion,
  services,
  categories,
  onClose,
  onSave,
}: {
  promotion: Promotion | null;
  services: Service[];
  categories: ServiceCategory[];
  onClose: () => void;
  onSave: (data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>>({
    name: promotion?.name || '',
    description: promotion?.description || '',
    status: promotion?.status || 'draft',
    discountType: promotion?.discountType || 'percentage',
    discountValue: promotion?.discountValue || 10,
    discountConfig: promotion?.discountConfig || {},
    applicationMethod: promotion?.applicationMethod || 'auto_apply',
    promoCode: promotion?.promoCode || '',
    appliesTo: promotion?.appliesTo || 'all',
    serviceIds: promotion?.serviceIds || [],
    categoryNames: promotion?.categoryNames || [],
    excludeServiceIds: promotion?.excludeServiceIds || [],
    excludeCategoryNames: promotion?.excludeCategoryNames || [],
    customerSegment: promotion?.customerSegment || 'all',
    segmentConfig: promotion?.segmentConfig || {},
    minPurchaseAmount: promotion?.minPurchaseAmount,
    maxUses: promotion?.maxUses,
    maxUsesPerCustomer: promotion?.maxUsesPerCustomer,
    stackable: promotion?.stackable ?? false,
    priority: promotion?.priority || 50,
    validFrom: promotion?.validFrom || '',
    validUntil: promotion?.validUntil || '',
    validDaysOfWeek: promotion?.validDaysOfWeek,
    validTimeRanges: promotion?.validTimeRanges,
    excludePromotionIds: promotion?.excludePromotionIds || [],
    usedCount: promotion?.usedCount || 0,
    totalDiscountGiven: promotion?.totalDiscountGiven || 0,
    customerUsageCount: promotion?.customerUsageCount || {},
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Remove undefined fields to avoid Firestore errors
      const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      await onSave(cleanData);
    } catch (err) {
      console.error('Error saving promotion:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {promotion ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Promotion['status'] })}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Discount Configuration</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type *</label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
            >
              <option value="percentage">Percentage Off</option>
              <option value="fixed_amount">Fixed Amount Off</option>
              <option value="free_service">Free Service</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
              <option value="bundle_discount">Bundle Discount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Discount Value * 
              {formData.discountType === 'percentage' && ' (%)'}
              {(formData.discountType === 'fixed_amount' || formData.discountType === 'bundle_discount') && ' ($)'}
            </label>
            <input
              type="number"
              required
              min="0"
              step={formData.discountType === 'percentage' ? '1' : '0.01'}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
            />
          </div>
          {formData.discountType === 'free_service' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Free Service *</label>
              <select
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.discountConfig?.freeServiceId || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  discountConfig: { ...formData.discountConfig, freeServiceId: e.target.value }
                })}
              >
                <option value="">Select a service</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          {(formData.discountType === 'buy_x_get_y' || formData.discountType === 'bundle_discount') && (
            <div className="grid grid-cols-2 gap-4">
              {formData.discountType === 'buy_x_get_y' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Buy Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      value={formData.discountConfig?.buyQuantity || 2}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountConfig: { ...formData.discountConfig, buyQuantity: parseInt(e.target.value) || 2 }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Get Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      value={formData.discountConfig?.getQuantity || 1}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountConfig: { ...formData.discountConfig, getQuantity: parseInt(e.target.value) || 1 }
                      })}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bundle Size (minimum services)</label>
                  <input
                    type="number"
                    min="2"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    value={formData.discountConfig?.bundleSize || 3}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      discountConfig: { ...formData.discountConfig, bundleSize: parseInt(e.target.value) || 3 }
                    })}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Application Method */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Application Method</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Method *</label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.applicationMethod}
              onChange={(e) => setFormData({ ...formData, applicationMethod: e.target.value as ApplicationMethod })}
            >
              <option value="auto_apply">Auto-Apply</option>
              <option value="promo_code">Promo Code</option>
              <option value="one_time_code">One-Time Code</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          {(formData.applicationMethod === 'promo_code' || formData.applicationMethod === 'one_time_code') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Promo Code *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent uppercase"
                value={formData.promoCode || ''}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                placeholder="SUMMER2025"
              />
            </div>
          )}
        </div>

        {/* Targeting - Services/Categories */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Service & Category Targeting</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Applies To</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.appliesTo}
              onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as 'all' | 'services' | 'categories' })}
            >
              <option value="all">All Services</option>
              <option value="services">Specific Services</option>
              <option value="categories">Specific Categories</option>
            </select>
          </div>
          {formData.appliesTo === 'services' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Services</label>
              <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 space-y-2">
                {services.map(s => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serviceIds?.includes(s.id) || false}
                      onChange={(e) => {
                        const currentIds = formData.serviceIds || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, serviceIds: [...currentIds, s.id] });
                        } else {
                          setFormData({ ...formData, serviceIds: currentIds.filter(id => id !== s.id) });
                        }
                      }}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {formData.appliesTo === 'categories' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Categories</label>
              <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categoryNames?.includes(cat.name) || false}
                      onChange={(e) => {
                        const currentNames = formData.categoryNames || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, categoryNames: [...currentNames, cat.name] });
                        } else {
                          setFormData({ ...formData, categoryNames: currentNames.filter(n => n !== cat.name) });
                        }
                      }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Segment */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Customer Targeting</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Segment *</label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.customerSegment}
              onChange={(e) => setFormData({ ...formData, customerSegment: e.target.value as CustomerSegment })}
            >
              <option value="all">All Customers</option>
              <option value="new_customers">New Customers (First Visit)</option>
              <option value="returning_customers">Returning Customers</option>
              <option value="loyalty_milestone">Loyalty Milestone (Xth Visit)</option>
              <option value="inactive_customers">Inactive Customers</option>
              <option value="birthday">Birthday Customers</option>
              <option value="specific_customers">Specific Customers</option>
            </select>
          </div>
          {formData.customerSegment === 'loyalty_milestone' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visit Count (e.g., 5 for 5th visit)</label>
              <input
                type="number"
                min="1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.segmentConfig?.visitCount || 5}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  segmentConfig: { ...formData.segmentConfig, visitCount: parseInt(e.target.value) || 5 }
                })}
              />
            </div>
          )}
          {formData.customerSegment === 'birthday' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days Before Birthday</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    value={formData.segmentConfig?.birthdayWindow?.daysBefore || 7}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      segmentConfig: { 
                        ...formData.segmentConfig, 
                        birthdayWindow: { 
                          ...formData.segmentConfig?.birthdayWindow,
                          daysBefore: parseInt(e.target.value) || 7 
                        }
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days After Birthday</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    value={formData.segmentConfig?.birthdayWindow?.daysAfter || 7}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      segmentConfig: { 
                        ...formData.segmentConfig, 
                        birthdayWindow: { 
                          ...formData.segmentConfig?.birthdayWindow,
                          daysAfter: parseInt(e.target.value) || 7 
                        }
                      }
                    })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.segmentConfig?.birthdayWindow?.sendEmail || false}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    segmentConfig: { 
                      ...formData.segmentConfig, 
                      birthdayWindow: { 
                        ...formData.segmentConfig?.birthdayWindow,
                        sendEmail: e.target.checked 
                      }
                    }
                  })}
                />
                <span className="text-sm text-slate-700">Automatically send birthday email</span>
              </label>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Conditions & Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Purchase ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.minPurchaseAmount || ''}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses (Total)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.maxUses || ''}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || undefined })}
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses Per Customer</label>
            <input
              type="number"
              min="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.maxUsesPerCustomer || ''}
              onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: parseInt(e.target.value) || undefined })}
              placeholder="Unlimited"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stackable}
                onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })}
              />
              <span className="text-sm text-slate-700">Stackable (can combine with other promos)</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority (1-100, higher = more priority)</label>
            <input
              type="number"
              min="1"
              max="100"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 50 })}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-slate-800">Date & Time Restrictions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid From</label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until</label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : promotion ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}

