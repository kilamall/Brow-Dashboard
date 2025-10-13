import { useEffect, useState } from 'react';

export default function ServiceModal({ isOpen, onClose, onSave, service, categories }) {
  const [form, setForm] = useState({ name: '', price: 0, duration: 60, category: '', description: '', active: true });

  useEffect(() => {
    if (service) setForm({ name: service.name||'', price: service.price||0, duration: service.duration||60, category: service.category||'', description: service.description||'', active: service.active??true });
    else setForm({ name: '', price: 0, duration: 60, category: '', description: '', active: true });
  }, [service]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">{service ? 'Edit service' : 'New service'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="border rounded-lg px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} />
          <input className="border rounded-lg px-3 py-2" type="number" placeholder="Duration (min)" value={form.duration} onChange={e=>setForm({...form, duration:Number(e.target.value)})} />
          <select className="border rounded-lg px-3 py-2" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
            <option value="">Select category</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <div className="flex items-center justify-end gap-2">
          <button className="border rounded px-3 py-2" onClick={onClose}>Cancel</button>
          <button className="bg-amber-500 text-white rounded px-3 py-2" onClick={()=>onSave(form)}>{service ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
