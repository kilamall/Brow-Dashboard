import { useEffect, useState } from 'react';

export default function AddAppointmentModal({ isOpen, onClose, onSave, customers, services, appointments, initialDate, appointment }) {
  const [form, setForm] = useState({ customerId: '', serviceId: '', date: '', time: '', duration: 60, notes: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (appointment) {
      const dt = appointment.start || appointment.date;
      const d = dt ? new Date(dt) : (initialDate || new Date());
      setForm({
        customerId: appointment.customerId || '',
        serviceId: appointment.serviceId || '',
        date: d.toISOString().slice(0,10),
        time: d.toTimeString().slice(0,5),
        duration: appointment.duration || 60,
        notes: appointment.notes || '',
      });
    } else {
      const d = initialDate || new Date();
      setForm({ customerId: '', serviceId: '', date: d.toISOString().slice(0,10), time: d.toTimeString().slice(0,5), duration: 60, notes: '' });
    }
  }, [isOpen, appointment, initialDate]);

  if (!isOpen) return null;

  const canSave = form.customerId && form.serviceId && form.date && form.time;

  function handleSubmit() {
    const date = new Date(`${form.date}T${form.time}:00`);
    onSave({
      id: appointment?.id,
      customerId: form.customerId,
      customerName: customers.find(c=>c.id===form.customerId)?.name,
      serviceId: form.serviceId,
      serviceName: services.find(s=>s.id===form.serviceId)?.name,
      date,
      duration: Number(form.duration)||60,
      notes: form.notes,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">{appointment ? 'Edit appointment' : 'New appointment'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2" value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})}>
            <option value="">Select customer</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2" value={form.serviceId} onChange={e=>setForm({...form, serviceId:e.target.value})}>
            <option value="">Select service</option>
            {services.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="border rounded-lg px-3 py-2" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          <input className="border rounded-lg px-3 py-2" type="time" value={form.time} onChange={e=>setForm({...form, time:e.target.value})} />
          <input className="border rounded-lg px-3 py-2" type="number" placeholder="Duration" value={form.duration} onChange={e=>setForm({...form, duration:Number(e.target.value)})} />
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Notes" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
        <div className="flex items-center justify-end gap-2">
          <button className="border rounded px-3 py-2" onClick={onClose}>Cancel</button>
          <button disabled={!canSave} className="bg-amber-500 text-white rounded px-3 py-2 disabled:opacity-50" onClick={handleSubmit}>{appointment ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
