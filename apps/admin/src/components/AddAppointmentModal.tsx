import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  createAppointmentTx,
  E_OVERLAP,
  findCustomerByEmail,
  watchBusinessHours,
  watchServices,
  watchDayClosures,
  watchSpecialHours
} from '@buenobrows/shared/firestoreActions';
import type { Appointment, BusinessHours, Customer, Service, DayClosure, SpecialHours } from '@buenobrows/shared/types';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';
import { addMinutes, format, parseISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { collection, getDocs, limit, query, where, type Firestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';


interface AddAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  date: Date;
  onCreated?: (id: string) => void;
  prefillData?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    serviceId?: string;
  };
}

export default function AddAppointmentModal({ open, onClose, date, onCreated, prefillData }: AddAppointmentModalProps) {
  const { db } = useFirebase();
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  useEffect(() => watchServices(db, { activeOnly: true }, setServices), [db]);
  useEffect(() => watchBusinessHours(db, setBh), [db]);
  useEffect(() => watchDayClosures(db, setClosures), [db]);
  useEffect(() => watchSpecialHours(db, setSpecialHours), [db]);

  // Debug logging removed for production cleanliness

  // Form - Initialize with prefilled data if provided
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [customerTerm, setCustomerTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timeHHMM, setTimeHHMM] = useState('10:00');
  const [selectedDate, setSelectedDate] = useState(format(date, 'yyyy-MM-dd')); // ✅ NEW: Editable date state
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Load all customers for dropdown
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Initialize form with prefilled data
  useEffect(() => {
    if (prefillData) {
      if (prefillData.customerName) setName(prefillData.customerName);
      if (prefillData.customerEmail) setEmail(prefillData.customerEmail);
      if (prefillData.customerPhone) setPhone(prefillData.customerPhone);
      if (prefillData.serviceId) setSelectedServiceIds([prefillData.serviceId]);
      
      // If customerId is provided, try to load the customer
      if (prefillData.customerId && db) {
        const loadCustomer = async () => {
          try {
            const { doc: getDocRef, getDoc } = await import('firebase/firestore');
            const customerDoc = await getDoc(getDocRef(db, 'customers', prefillData.customerId!));
            if (customerDoc.exists()) {
              setSelectedCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
            }
          } catch (error) {
            console.error('Failed to load customer:', error);
          }
        };
        loadCustomer();
      }
    }
  }, [prefillData, db]);

  // ✅ NEW: Reset form when modal opens
  useEffect(() => {
    if (open) {
      // Reset form to clean state
      setCustomerTerm('');
      setSelectedCustomer(null);
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setSelectedServiceIds([]);
      setTimeHHMM('09:00'); // Default time
      setSelectedDate(format(date, 'yyyy-MM-dd')); // Reset to prop date
      setErr('');
      setSaving(false);
      setShowDropdown(false);
      
      // Apply prefill data if provided (from clicking on customer)
      if (prefillData) {
        if (prefillData.customerId) {
          const customer = allCustomers.find(c => c.id === prefillData.customerId);
          if (customer) {
            setSelectedCustomer(customer);
            setName(customer.name);
            setEmail(customer.email || '');
            setPhone(customer.phone || '');
          }
        }
        if (prefillData.serviceId) {
          setSelectedServiceIds([prefillData.serviceId]);
        }
      }
    }
  }, [open, prefillData, allCustomers]);

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

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      const q = query(collection(db, 'customers'), limit(100));
      const snap = await getDocs(q);
      const customers: Customer[] = [];
      snap.forEach((d) => customers.push({ id: d.id, ...(d.data() as any) }));
      if (alive) setAllCustomers(customers.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    })();
    return () => { alive = false; };
  }, [open, db]);

  // Suggestions for customers (name/email prefix search)
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  useEffect(() => {
    const t = customerTerm.trim().toLowerCase();
    if (!t) { 
      // Show all customers when empty
      setSuggestions(allCustomers); 
      return; 
    }
    
    // Filter existing customers by name or email
    const filtered = allCustomers.filter(c => 
      (c.name || '').toLowerCase().includes(t) || 
      (c.email || '').toLowerCase().includes(t) ||
      (c.phone || '').includes(t)
    ).slice(0, 10);
    
    setSuggestions(filtered);
  }, [customerTerm, allCustomers]);

  // Slot helper (optional for admins, but useful)
  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  useEffect(() => {
    // lazy on-demand: only when open
    if (!open) return;
    // simple day fetch using selectedDate
    const start = new Date(selectedDate + 'T00:00:00');
    const end = new Date(selectedDate + 'T23:59:59');
    import('firebase/firestore').then(({ onSnapshot, collection, query, where, orderBy }) => {
      const qy = query(collection(db, 'appointments'), where('start', '>=', start.toISOString()), where('start', '<=', end.toISOString()), orderBy('start', 'asc'));
      const unsub = onSnapshot(qy, (snap) => {
        const rows: Appointment[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        setDayAppts(rows);
      });
      return () => unsub();
    });
  }, [open, selectedDate, db]);

  const currentDateObj = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate]);
  const slots = useMemo(() => (bh ? availableSlotsForDay(currentDateObj, totalDuration, bh, dayAppts, closures, specialHours) : []), [bh, currentDateObj, totalDuration, dayAppts, closures, specialHours]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleCreate() {
    try {
      setSaving(true); setErr('');
      
      // Validate that at least one service is selected
      if (selectedServiceIds.length === 0) {
        setErr('Please select at least one service');
        return;
      }
      
      // Resolve customer using enhanced identity system
      let customerId: string;
      if (selectedCustomer) {
        customerId = selectedCustomer.id;
      } else {
        // Use Cloud Function to find or create customer with canonical identifiers
        const findOrCreate = httpsCallable(getFunctions(), 'findOrCreateCustomer');
        
        const result = await findOrCreate({
          email: email || null,
          phone: phone || null,
          name: name || customerTerm || 'Unnamed',
          authUid: null // Admin doesn't have user's Auth UID yet
        }) as { data: { customerId: string; isNew: boolean; merged: boolean } };
        
        customerId = result.data.customerId;
        
        if (result.data.merged) {
          console.log('✅ Linked appointment to existing customer account');
        } else if (result.data.isNew) {
          console.log('✅ Created new customer record');
        } else {
          console.log('✅ Found existing customer record');
        }
      }

      // Compose ISO from selectedDate + time in business timezone
      // This ensures appointments are created in the business timezone, 
      // not the admin's local timezone (critical for traveling admins)
      const businessTimezone = bh?.timezone || 'America/Los_Angeles';
      const timeString = typeof timeHHMM === 'string' ? timeHHMM : '10:00';
      const [hh, mm] = (timeString && typeof timeString === 'string') ? timeString.split(':').map(Number) : [10, 0];
      
      // Create a date string in the format expected by the business timezone
      // The time entered by admin is interpreted as business time, not their local time
      const localTimeStr = `${selectedDate}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
      
      // Convert from business timezone to UTC for storage
      const start = fromZonedTime(localTimeStr, businessTimezone);

      const id = await createAppointmentTx(db, {
        customerId,
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0], // Keep for backward compatibility
        start: start.toISOString(),
        duration: totalDuration,
        status: 'confirmed',
        bookedPrice: totalPrice, // Legacy field - total price for all services
        servicePrices: selectedServices.reduce((acc, service) => {
          acc[service.id] = service.price; // Store individual service prices
          return acc;
        }, {} as Record<string, number>),
        totalPrice: totalPrice, // Initially same as bookedPrice
        tip: 0, // Default tip amount
        isPriceEdited: false, // Not edited initially
        notes,
      } as any);

      // ✅ NEW: Send confirmation email
      try {
        const functions = getFunctions();
        const sendConfirmation = httpsCallable(functions, 'sendAppointmentConfirmation');
        await sendConfirmation({
          appointmentId: id,
          customerId: customerId,
          customerEmail: email || selectedCustomer?.email,
          customerName: name || selectedCustomer?.name || customerTerm,
          start: start.toISOString(),
          duration: totalDuration,
          serviceNames: selectedServices.map(s => s.name).join(', '),
          totalPrice: totalPrice
        });
        // Confirmation email sent
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }

      onCreated?.(id);
      onClose();
    } catch (e: any) {
      if (e?.message === E_OVERLAP) setErr('This time slot is already booked. Please wait a moment before selecting another time, or try a different slot.');
      else setErr(e?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/20" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="mx-auto max-w-2xl">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
              <Dialog.Panel className="bg-white rounded-xl shadow-xl p-4">
                <Dialog.Title className="font-serif text-xl mb-2">
                  Add appointment — {format(date, 'PP')}
                </Dialog.Title>
                
                {/* Timezone indicator - critical for traveling admins */}
                {bh?.timezone && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-800">
                      <strong>Business Timezone:</strong> {bh.timezone}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone !== bh.timezone && (
                        <span className="ml-2 text-blue-600">
                          (Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="grid gap-4">
                  {/* Customer search/create */}
                  <div className="relative">
                    <label htmlFor="customer-search" className="text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span>Customer {allCustomers.length > 0 && <span className="text-xs font-normal text-slate-500">({allCustomers.length} in database)</span>}</span>
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={() => { setSelectedCustomer(null); setCustomerTerm(''); }}
                          className="text-xs text-terracotta hover:text-terracotta/80"
                        >
                          Clear selection
                        </button>
                      )}
                    </label>
                    <input 
                      id="customer-search" 
                      name="customer-search" 
                      className="border border-slate-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                      placeholder="Search existing customers or type name for new customer…" 
                      value={customerTerm} 
                      onChange={(e)=>{ setCustomerTerm(e.target.value); setSelectedCustomer(null); }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    {showDropdown && suggestions.length > 0 && !selectedCustomer && (
                      <div className="absolute z-10 w-full border border-slate-300 rounded-lg mt-1 max-h-60 overflow-auto bg-white shadow-lg">
                        <div className="p-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-medium">
                          {customerTerm ? `${suggestions.length} customer${suggestions.length !== 1 ? 's' : ''} found` : 'Select from existing customers'}
                        </div>
                        {suggestions.map((c) => (
                          <button 
                            key={c.id} 
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-terracotta/5 border-b border-slate-100 last:border-b-0 transition-colors" 
                            onClick={()=>{ 
                              setSelectedCustomer(c); 
                              setCustomerTerm(c.name || c.email || ''); 
                              setShowDropdown(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-800">{c.name}</div>
                                <div className="text-xs text-slate-500">
                                  {c.email && <span>{c.email}</span>}
                                  {c.email && c.phone && <span className="mx-1">•</span>}
                                  {c.phone && <span>{c.phone}</span>}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400">
                                {c.totalVisits || 0} visit{c.totalVisits !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedCustomer && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-medium text-slate-700 mb-2">Or create new customer</div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input id="new-customer-name" name="new-customer-name" className="border border-slate-300 rounded-md p-2 text-sm" placeholder="Name *" value={name} onChange={(e)=>setName(e.target.value)} />
                          <input id="new-customer-email" name="new-customer-email" className="border border-slate-300 rounded-md p-2 text-sm" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                          <input id="new-customer-phone" name="new-customer-phone" className="border border-slate-300 rounded-md p-2 text-sm" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                        </div>
                      </div>
                    )}
                    {selectedCustomer && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800">{selectedCustomer.name}</div>
                            <div className="text-xs text-slate-600">
                              {selectedCustomer.email || selectedCustomer.phone || selectedCustomer.id}
                              {selectedCustomer.totalVisits && <span className="ml-2">• {selectedCustomer.totalVisits} previous visits</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
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

                  {/* Date/time */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="appointment-date" className="text-sm text-slate-600">Date</label>
                      <input 
                        id="appointment-date" 
                        name="appointment-date" 
                        type="date" 
                        className="border rounded-md p-2 w-full" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={(new Date().toISOString() && typeof new Date().toISOString() === 'string') ? new Date().toISOString().split('T')[0] : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="appointment-time" className="text-sm text-slate-600">Time</label>
                      <input 
                        id="appointment-time" 
                        name="appointment-time" 
                        type="time" 
                        className="border rounded-md p-2 w-full" 
                        value={timeHHMM} 
                        onChange={(e)=>setTimeHHMM(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label htmlFor="appointment-duration" className="text-sm text-slate-600">Duration (min)</label>
                      <input 
                        id="appointment-duration"
                        name="appointment-duration"
                        type="number" 
                        min={5} 
                        step={5} 
                        className="border rounded-md p-2 w-full bg-slate-50" 
                        value={totalDuration} 
                        readOnly
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Auto-calculated from selected services
                      </div>
                    </div>
                  </div>

                  {/* Optional slot suggestions */}
                  {bh && (
                    <div>
                      <div className="text-xs text-slate-600 mb-1">
                        Available slots for {format(currentDateObj, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                        {slots.slice(0, 24).map((iso)=> {
                          const slotTime = format(parseISO(iso), 'h:mm a');
                          const slotTimeHHMM = format(parseISO(iso), 'HH:mm');
                          const isSelected = timeHHMM === slotTimeHHMM;
                          
                          return (
                            <button 
                              key={iso} 
                              type="button"
                              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                isSelected
                                  ? 'bg-terracotta text-white border-terracotta'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                              onClick={()=> setTimeHHMM(slotTimeHHMM)}
                            >
                              {slotTime}
                            </button>
                          );
                        })}
                        {!slots.length && (
                          <div className="col-span-4 text-xs text-slate-500 py-2 text-center">
                            No available slots under business hours for this date.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label htmlFor="appointment-notes" className="text-sm text-slate-600">
                      Appointment-Specific Notes (optional)
                    </label>
                    <p className="text-xs text-slate-500 mb-1">
                      For appointment-specific info only (e.g., "running late", "first-time client"). 
                      Use Customer Notes for preferences, allergies, etc.
                    </p>
                    <textarea 
                      id="appointment-notes" 
                      name="appointment-notes" 
                      className="border rounded-md p-2 w-full" 
                      rows={3} 
                      value={notes} 
                      onChange={(e)=>setNotes(e.target.value)}
                      placeholder="e.g., Customer running 10 minutes late..."
                    />
                  </div>

                  {err && <div className="text-red-600 text-sm">{err}</div>}

                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded-md border" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="px-4 py-2 rounded-md bg-terracotta text-white" onClick={handleCreate} disabled={saving || selectedServiceIds.length === 0}>{saving ? 'Saving…' : 'Create appointment'}</button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
