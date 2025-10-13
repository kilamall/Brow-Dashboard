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
  const [serviceId, setServiceId] = useState('');
  const [customerTerm, setCustomerTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timeHHMM, setTimeHHMM] = useState('10:00');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const s = services.find((s) => s.id === serviceId);
    if (s) setDuration(s.duration);
  }, [serviceId, services]);

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

  const slots = useMemo(() => (bh ? availableSlotsForDay(date, duration, bh, dayAppts) : []), [bh, date, duration, dayAppts]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleCreate() {
    try {
      setSaving(true); setErr('');
      // Resolve customer
      let customerId: string;
      if (selectedCustomer) customerId = selectedCustomer.id;
      else {
        // create a guest/approved customer on the fly if email provided, else name-only
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const ref = doc(collection(db, 'customers'));
        await setDoc(ref, { name: name || customerTerm || 'Unnamed', email: email || null, phone: phone || null, status: 'approved', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        customerId = ref.id;
      }

      // Compose ISO from date + time
      const [hh, mm] = timeHHMM.split(':').map(Number);
      const start = new Date(date); start.setHours(hh, mm, 0, 0);

      const id = await createAppointmentTx(db, {
        customerId,
        serviceId,
        start: start.toISOString(),
        duration,
        status: 'confirmed',
        bookedPrice: services.find((s) => s.id === serviceId)?.price ?? 0,
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

                  {/* Service */}
                  <div>
                    <label className="text-sm text-slate-600">Service</label>
                    <select className="border rounded-md p-2 w-full" value={serviceId} onChange={(e)=>setServiceId(e.target.value)}>
                      <option value="">Select service…</option>
                      {services.map((s)=> (
                        <option key={s.id} value={s.id}>{s.name} — {s.duration}m · ${s.price.toFixed(2)}</option>
                      ))}
                    </select>
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
                      <input type="number" min={5} step={5} className="border rounded-md p-2 w-full" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value||'0'))} />
                    </div>
                  </div>

                  {/* Optional slot suggestions */}
                  {bh && (
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Available slots</div>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlotsForDay(date, duration, bh, dayAppts).slice(0, 16).map((iso)=> (
                          <button key={iso} className="border rounded-md py-1 text-sm hover:bg-cream" onClick={()=> setTimeHHMM(format(parseISO(iso), 'HH:mm'))}>
                            {format(parseISO(iso), 'h:mm a')}
                          </button>
                        ))}
                        {!availableSlotsForDay(date, duration, bh, dayAppts).length && <div className="text-xs text-slate-500">No slots under business hours.</div>}
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
                    <button className="px-4 py-2 rounded-md bg-terracotta text-white" onClick={handleCreate} disabled={saving || !serviceId}>{saving ? 'Saving…' : 'Create appointment'}</button>
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
