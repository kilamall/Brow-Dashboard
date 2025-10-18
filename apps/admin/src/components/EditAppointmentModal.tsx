import { useState, useEffect, useMemo } from 'react';
import { updateDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Appointment, Service, Customer } from '@buenobrows/shared/types';
import { format, parseISO } from 'date-fns';
import { useFirebase } from '@buenobrows/shared/useFirebase';

interface Props {
  appointment: Appointment | null;
  service: Service | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditAppointmentModal({ appointment, service, onClose, onUpdated }: Props) {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Form state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'confirmed' | 'pending' | 'cancelled'>('confirmed');
  const [notes, setNotes] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );
  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.duration, 0),
    [selectedServices]
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices]
  );

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    services.forEach((service) => {
      const category = service.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
    });
    return groups;
  }, [services]);

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

  // Load services and customers
  useEffect(() => {
    const loadData = async () => {
      const [servicesSnap, customersSnap] = await Promise.all([
        getDocs(query(collection(db, 'services'), where('active', '==', true))),
        getDocs(collection(db, 'customers'))
      ]);
      
      const servicesList: Service[] = [];
      servicesSnap.forEach(d => servicesList.push({ id: d.id, ...d.data() } as Service));
      setServices(servicesList);
      
      const customersList: Customer[] = [];
      customersSnap.forEach(d => customersList.push({ id: d.id, ...d.data() } as Customer));
      setCustomers(customersList);
    };
    
    loadData();
  }, [db]);

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      // Handle both single serviceId and multiple serviceIds
      if ((appointment as any).serviceIds && Array.isArray((appointment as any).serviceIds)) {
        setSelectedServiceIds((appointment as any).serviceIds);
      } else {
        setSelectedServiceIds(appointment.serviceId ? [appointment.serviceId] : []);
      }
      setSelectedCustomerId(appointment.customerId);
      const startDate = parseISO(appointment.start);
      setDate(format(startDate, 'yyyy-MM-dd'));
      setTime(format(startDate, 'HH:mm'));
      setNotes(appointment.notes || '');
      setStatus(appointment.status);
    }
  }, [appointment]);

  const handleSave = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const newStart = new Date(`${date}T${time}`);
      
      await updateDoc(doc(db, 'appointments', appointment.id), {
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0] || '', // Keep for backward compatibility
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || appointment.customerName,
        customerEmail: selectedCustomer?.email || appointment.customerEmail,
        customerPhone: selectedCustomer?.phone || appointment.customerPhone,
        start: newStart.toISOString(),
        duration: totalDuration,
        bookedPrice: totalPrice,
        notes: notes || null,
        status,
        updatedAt: new Date().toISOString(),
      });
      
      onUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Edit Appointment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Services {selectedServices.length > 0 && <span className="text-terracotta">({selectedServices.length} selected)</span>}
            </label>
            
            {/* Service Cards by Category */}
            <div className="max-h-64 overflow-y-auto border rounded-lg bg-slate-50">
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
                const isCollapsed = collapsedCategories.has(category);
                return (
                  <div key={category} className="border-b border-slate-200 last:border-b-0">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between hover:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {category}
                        </div>
                        <span className="text-xs bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded-full">
                          {categoryServices.length}
                        </span>
                      </div>
                      <svg 
                        className={`w-3 h-3 text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Category Services */}
                    {!isCollapsed && (
                      <div className="p-3 bg-white">
                        <div className="grid gap-2">
                          {categoryServices.map((s) => {
                            const isSelected = selectedServiceIds.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServiceIds(prev => prev.filter(id => id !== s.id));
                                  } else {
                                    setSelectedServiceIds(prev => [...prev, s.id]);
                                  }
                                }}
                                className={`
                                  relative p-3 rounded-lg border-2 text-left transition-all
                                  ${isSelected 
                                    ? 'border-terracotta bg-terracotta/5 shadow-sm' 
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                  }
                                `}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-800 mb-1">{s.name}</div>
                                    <div className="flex items-center gap-3 text-xs text-slate-600">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {s.duration} min
                                      </span>
                                      <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        ${s.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="flex-shrink-0">
                                      <div className="w-5 h-5 rounded-full bg-terracotta flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Selected Services Summary Bar */}
            {selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Selected Services</span>
                  <button
                    type="button"
                    onClick={() => setSelectedServiceIds([])}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs border border-slate-200"
                    >
                      <span className="font-medium">{service.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedServiceIds(prev => prev.filter(id => id !== service.id))}
                        className="ml-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-terracotta/20">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      <span className="font-medium text-slate-700">{totalDuration}</span> minutes
                    </span>
                    <span className="text-slate-600">
                      <span className="font-semibold text-terracotta text-base">${totalPrice.toFixed(2)}</span> total
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              required
            >
              <option value="">Select a customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'confirmed' | 'pending' | 'cancelled')}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
              placeholder="Add any notes about this appointment..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || selectedServiceIds.length === 0 || !selectedCustomerId || !date || !time}
              className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

