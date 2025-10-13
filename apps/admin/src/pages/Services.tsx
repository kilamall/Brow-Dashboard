import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices, createService, updateService, deleteService } from '@buenobrows/shared/firestoreActions';
import type { Service } from '@buenobrows/shared/types';

export default function Services(){
  const { db } = useFirebase();
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  useEffect(()=> {
    return watchServices(db, undefined, setRows);
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-xl">Services</h2>
        <button className="bg-terracotta text-white rounded-md px-3 py-2" onClick={()=>setEditing({id:'', name:'', price:0, duration:60, active:true})}>Add</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-600">
          <th className="py-2">Name</th><th>Price</th><th>Duration</th><th>Active</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map(s => (
            <tr key={s.id} className="border-t">
              <td className="py-2">{s.name}</td>
              <td>${s.price.toFixed(2)}</td>
              <td>{s.duration}m</td>
              <td>{s.active ? 'Yes' : 'No'}</td>
              <td className="text-right">
                <button className="mr-2 text-terracotta" onClick={()=>setEditing(s)}>Edit</button>
                <button className="text-red-600" onClick={()=>deleteService(db, s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} />}
    </div>
  );
}

function Editor({ initial, onClose }:{ initial: Service; onClose: ()=>void }){
  const [s, setS] = useState<Service>(initial as Service);
  async function save() {
    if (s.id) await updateService(db, s.id, s);
    else await createService(db, s);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[460px]" onClick={e=>e.stopPropagation()}>
        <h3 className="font-serif text-xl mb-3">{s.id ? 'Edit Service' : 'Add Service'}</h3>
        <div className="grid gap-3">
          <input className="border rounded-md p-2" placeholder="Name" value={s.name} onChange={e=>setS({...s, name:e.target.value})} />
          <div className="flex gap-2">
            <input className="border rounded-md p-2 flex-1" type="number" placeholder="Price" value={s.price} onChange={e=>setS({...s, price: parseFloat(e.target.value||'0')})} />
            <input className="border rounded-md p-2 w-40" type="number" placeholder="Duration (min)" value={s.duration} onChange={e=>setS({...s, duration: parseInt(e.target.value||'0')})} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={s.active} onChange={e=>setS({...s, active: e.target.checked})} />
            <span>Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose}>Cancel</button>
            <button className="bg-terracotta text-white rounded-md px-4 py-2" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
