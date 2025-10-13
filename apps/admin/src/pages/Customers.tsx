import React, { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  watchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '@buenobrows/shared/firestoreActions';
import type { Customer } from '@buenobrows/shared/types';


export default function Customers(){
  const { db } = useFirebase();
  const [rows, setRows] = useState<Customer[]>([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  useEffect(()=> {
    return watchCustomers(db, q, setRows);
  }, [q]);
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex justify-between mb-4">
        <h2 className="font-serif text-xl">Customers</h2>
        <div className="flex gap-2">
          <input className="border rounded-md p-2" placeholder="Search name…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="bg-terracotta text-white rounded-md px-3 py-2" onClick={()=>setEditing({id:'', name:'', email:'', phone:'', status:'approved'})}>Add</button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-600">
          <th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className="border-t">
              <td className="py-2">{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.status}</td>
              <td className="text-right">
                <button className="mr-2 text-terracotta" onClick={()=>setEditing(c)}>Edit</button>
                <button className="text-red-600" onClick={()=>deleteCustomer(db, c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} />}
    </div>
  );
}

function Editor({ initial, onClose }:{ initial: Customer; onClose: ()=>void }){
  const [c, setC] = useState<Customer>(initial);

  // Sync state with prop changes
  useEffect(() => {
    setC(initial);
  }, [initial]);

  async function save(){
    if (c.id) await updateCustomer(db, c.id, c);
    else await createCustomer(db, c);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[520px]" onClick={e=>e.stopPropagation()}>
        <h3 className="font-serif text-xl mb-3">{c.id ? 'Edit Customer' : 'Add Customer'}</h3>
        <div className="grid gap-3">
          <input className="border rounded-md p-2" placeholder="Name" value={c.name} onChange={e=>setC({...c, name:e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded-md p-2" placeholder="Email" value={c.email||''} onChange={e=>setC({...c, email:e.target.value})} />
            <input className="border rounded-md p-2" placeholder="Phone" value={c.phone||''} onChange={e=>setC({...c, phone:e.target.value})} />
          </div>
          <label className="grid grid-cols-[100px_1fr] items-center gap-2">
            <span>Status</span>
            <select className="border rounded-md p-2" value={c.status||'approved'} onChange={e=>setC({...c, status: e.target.value as any})}>
              <option value="approved">approved</option>
              <option value="blocked">blocked</option>
              <option value="guest">guest</option>
            </select>
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
