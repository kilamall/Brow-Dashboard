export default function Customers({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer, onViewCustomer }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Customers</h2>
        <button onClick={onAddCustomer} className="rounded-lg bg-amber-500 text-white px-3 py-2">Add customer</button>
      </div>
      <div className="divide-y border rounded-xl bg-white">
        {customers.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-slate-600">{c.email} • {c.phone}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => onViewCustomer(c)} className="text-sm rounded-lg border px-2 py-1">View</button>
              <button onClick={() => onEditCustomer(c)} className="text-sm rounded-lg border px-2 py-1">Edit</button>
              <button onClick={() => onDeleteCustomer(c.id)} className="text-sm rounded-lg border px-2 py-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
