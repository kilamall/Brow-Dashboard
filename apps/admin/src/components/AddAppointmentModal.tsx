import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  createAppointmentTx,
  E_OVERLAP,
  findCustomerByEmail,
  watchBusinessHours,
  watchServices
} from '@buenobrows/shared/firestoreActions';
import type { Appointment, BusinessHours, Customer, Service } from '@buenobrows/shared/types';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';
import { addMinutes, format, parseISO } from 'date-fns';
import { collection, getDocs, limit, query, where, type Firestore } from 'firebase/firestore';


export default function AddAppointmentModal({ open, onClose, date, onCreated }: { open: boolean; onClose: () => void; date: Date; onCreated?: (id: string) => void; }) {
  const { db } = useFirebase();
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  useEffect(() => watchServices(db, { activeOnly: true }, setServices), []);
  useEffect(() => watchBusinessHours(db, setBh), []);

  // Form
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [customerTerm, setCustomerTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timeHHMM, setTimeHHMM] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

  // Suggestions for customers (name/email prefix search)
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      const t = customerTerm.trim();
      if (!t) { setSuggestions([]); return; }
      const out: Customer[] = [];
      // by email exact
      if (t.includes('@')) {
        const m = await findCustomerByEmail(db, t);
        if (m) out.push(m);
      }
      // by name prefix
      const byName = query(collection(db, 'customers'), where('name', '>=', t), where('name', '<=', t + '\uf8ff'), limit(5));
      const snap = await getDocs(byName);
      snap.forEach((d) => out.push({ id: d.id, ...(d.data() as any) }));
      if (alive) setSuggestions(out);
    })();
    return () => { alive = false; };
  }, [customerTerm]);

  // Slot helper (optional for admins, but useful)
  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  useEffect(() => {
    // lazy on-demand: only when open
    if (!open) return;
    // simple day fetch
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    import('firebase/firestore').then(({ onSnapshot, collection, query, where, orderBy }) => {
      const qy = query(collection(db, 'appointments'), where('start', '>=', start.toISOString()), where('start', '<=', end.toISOString()), orderBy('start', 'asc'));
      const unsub = onSnapshot(qy, (snap) => {
        const rows: Appointment[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        setDayAppts(rows);
      });
      return () => unsub();
    });
  }, [open, date]);

  const slots = useMemo(() => (bh ? availableSlotsForDay(date, totalDuration, bh, dayAppts) : []), [bh, date, totalDuration, dayAppts]);

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
      
      // Resolve customer
      let customerId: string;
      if (selectedCustomer) customerId = selectedCustomer.id;
      else {
        // create a guest/approved customer on the fly if email provided, else name-only
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const ref = doc(collection(db, 'customers'));
        await setDoc(ref, { name: name || customerTerm || 'Unnamed', email: email || null, phone: phone || null, status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        customerId = ref.id;
      }

      // Compose ISO from date + time
      const [hh, mm] = timeHHMM.split(':').map(Number);
      const start = new Date(date); start.setHours(hh, mm, 0, 0);

      const id = await createAppointmentTx(db, {
        customerId,
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0], // Keep for backward compatibility
        start: start.toISOString(),
        duration: totalDuration,
        status: 'confirmed',
        bookedPrice: totalPrice,
        notes,
      } as any);

      onCreated?.(id);
      onClose();
    } catch (e: any) {
      if (e?.message === E_OVERLAP) setErr('This time is already booked. Pick another slot.');
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
                <Dialog.Title className="font-serif text-xl mb-2">Add appointment — {format(date, 'PP')}</Dialog.Title>

                <div className="grid gap-4">
                  {/* Customer search/create */}
                  <div>
                    <label className="text-sm text-slate-600">Customer</label>
                    <input className="border rounded-md p-2 w-full" placeholder="Type name or email…" value={customerTerm} onChange={(e)=>{ setCustomerTerm(e.target.value); setSelectedCustomer(null); }} />
                    {suggestions.length > 0 && (
                      <div className="border rounded-md mt-1 max-h-40 overflow-auto">
                        {suggestions.map((c) => (
                          <button key={c.id} className="w-full text-left px-2 py-1 hover:bg-cream" onClick={()=>{ setSelectedCustomer(c); setCustomerTerm(c.name || c.email || ''); }}>
                            <div className="text-sm">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.email || c.phone || c.id}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedCustomer && (
                      <div className="grid sm:grid-cols-3 gap-2 mt-2">
                        <input className="border rounded-md p-2" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
                        <input className="border rounded-md p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                        <input className="border rounded-md p-2" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                      </div>
                    )}
                    {selectedCustomer && (
                      <div className="text-xs text-slate-600 mt-1">Selected: <span className="font-medium">{selectedCustomer.name}</span> ({selectedCustomer.email || selectedCustomer.phone || selectedCustomer.id})</div>
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
                      <label className="text-sm text-slate-600">Date</label>
                      <input type="date" className="border rounded-md p-2 w-full" value={format(date, 'yyyy-MM-dd')} onChange={(e)=>{ const d = new Date(e.target.value+'T00:00:00'); d.setHours(date.getHours(), date.getMinutes(), 0, 0); (date as any) = d; }} />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Time</label>
                      <input type="time" className="border rounded-md p-2 w-full" value={timeHHMM} onChange={(e)=>setTimeHHMM(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Duration (min)</label>
                      <input 
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
                      <div className="text-xs text-slate-600 mb-1">Available slots</div>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlotsForDay(date, totalDuration, bh, dayAppts).slice(0, 16).map((iso)=> (
                          <button key={iso} className="border rounded-md py-1 text-sm hover:bg-cream" onClick={()=> setTimeHHMM(format(parseISO(iso), 'HH:mm'))}>
                            {format(parseISO(iso), 'h:mm a')}
                          </button>
                        ))}
                        {!availableSlotsForDay(date, totalDuration, bh, dayAppts).length && <div className="text-xs text-slate-500">No slots under business hours.</div>}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="text-sm text-slate-600">Notes</label>
                    <textarea className="border rounded-md p-2 w-full" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
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
