export default function CustomerDetailsModal({ isOpen, onClose, customer, appointments, onDeleteAppointment }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Customer details</h3>
          <button className="border rounded px-3 py-2" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div><div className="font-medium">Name</div><div>{customer?.name}</div></div>
          <div><div className="font-medium">Email</div><div>{customer?.email}</div></div>
          <div><div className="font-medium">Phone</div><div>{customer?.phone}</div></div>
        </div>
        <div className="mt-3">
          <h4 className="font-medium mb-2">Appointments</h4>
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center justify-between border rounded p-2 text-sm">
                <div>{a.serviceName || a.serviceId} • {a.start || a.date}</div>
                <button className="border rounded px-2 py-1" onClick={()=>onDeleteAppointment(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
