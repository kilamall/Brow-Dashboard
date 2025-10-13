export default function BookingsView({ appointments, selectedDate, onDeleteAppointment, onEditAppointment }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">Bookings on {selectedDate?.toDateString?.() || String(selectedDate)}</h3>
      <div className="mt-3 space-y-2">
        {appointments.map((a) => (
          <div key={a.id} className="text-sm flex items-center justify-between border rounded-lg p-2">
            <div>
              <div className="font-medium">{a.serviceName || a.serviceId}</div>
              <div className="text-slate-600">{a.customerName || a.customerId} • {a.start || a.date}</div>
            </div>
            <div className="space-x-2">
              <button className="border rounded px-2 py-1" onClick={() => onEditAppointment(a)}>Edit</button>
              <button className="border rounded px-2 py-1" onClick={() => onDeleteAppointment(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
