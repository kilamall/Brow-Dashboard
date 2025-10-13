export default function Services({ services, categories, customersCount, appointmentsCount, onAddService, onEditService, onDeleteService }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Services</h2>
        <button onClick={onAddService} className="rounded-lg bg-amber-500 text-white px-3 py-2">Add service</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-slate-600">{s.category || 'Uncategorized'} • {s.duration || 60}m</div>
                <div className="text-sm text-slate-600">${Number(s.price || 0).toFixed(2)}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => onEditService(s)} className="text-sm rounded-lg border px-2 py-1">Edit</button>
                <button onClick={() => onDeleteService(s.id)} className="text-sm rounded-lg border px-2 py-1">Delete</button>
              </div>
            </div>
            {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
