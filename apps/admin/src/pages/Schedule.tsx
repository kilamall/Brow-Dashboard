import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import AddAppointmentModal from '@/components/AddAppointmentModal';
import AppointmentDetailModal from '@/components/AppointmentDetailModal';
import EditAppointmentModal from '@/components/EditAppointmentModal';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export default function Schedule() {
  const { db } = useFirebase();
  const [month, setMonth] = useState<Date>(() => new Date()); // current visible month

  // Build grid range (start Sunday..Sat end) covering the current month
  const gridStart = useMemo(() => startOfWeek(startOfMonth(month), { weekStartsOn: 0 }), [month]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(month), { weekStartsOn: 0 }), [month]);

  // Live appts in this grid range
  const [appts, setAppts] = useState<Appointment[]>([]);
  useEffect(() => {
    const qy = query(
      collection(db, 'appointments'),
      where('start', '>=', gridStart.toISOString()),
      where('start', '<=', gridEnd.toISOString()),
      orderBy('start', 'asc')
    );
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setAppts(rows);
    });
  }, [gridStart, gridEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  // Services map for names
  const [services, setServices] = useState<Record<string, Service>>({});
  useEffect(() => {
    const ref = collection(db, 'services');
    return onSnapshot(query(ref, orderBy('name', 'asc')), (snap) => {
      const map: Record<string, Service> = {};
      snap.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
      setServices(map);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const days: Date[] = useMemo(() => {
    const list: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) list.push(new Date(d));
    return list;
  }, [gridStart, gridEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [openAdd, setOpenAdd] = useState<{ open: boolean; date: Date | null }>({ open: false, date: null });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  return (
    <div className="grid gap-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div className="font-serif text-2xl">{format(month, 'MMMM yyyy')}</div>
        <div className="flex items-center gap-2">
          <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(addMonths(month, -1))}>Prev</button>
          <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(new Date())}>Today</button>
          <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(addMonths(month, 1))}>Next</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-xs text-slate-500">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
        {days.map((d, idx) => {
          const inMonth = isSameMonth(d, month);
          const todaysAppts = appts.filter((a) => isSameDay(new Date(a.start), d) && a.status !== 'cancelled');
          return (
            <div
              key={idx}
              className={`relative min-h-[108px] bg-white ${inMonth ? '' : 'bg-slate-50 text-slate-400'}`}
              onMouseEnter={() => setHoverDate(d)}
              onMouseLeave={() => setHoverDate((prev) => (prev && isSameDay(prev, d) ? null : prev))}
              onClick={() => setOpenAdd({ open: true, date: d })}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs">{format(d, 'd')}</span>
                {!!todaysAppts.length && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta text-white">{todaysAppts.length}</span>
                )}
              </div>
              {/* small list preview */}
              <div className="px-2 pb-2 space-y-1">
                {todaysAppts.slice(0, 3).map((a) => (
                  <div 
                    key={a.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(a);
                    }}
                    className="text-[11px] truncate border rounded px-1 py-0.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    {format(new Date(a.start), 'h:mma')}-{format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mma')} · {services[a.serviceId]?.name || 'Service'}
                  </div>
                ))}
                {todaysAppts.length > 3 && (
                  <div className="text-[10px] text-slate-500">+{todaysAppts.length - 3} more…</div>
                )}
              </div>
              {/* Hover popover */}
              {hoverDate && isSameDay(hoverDate, d) && todaysAppts.length > 0 && (
                <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 w-64 bg-white border rounded-xl shadow-lg p-3">
                  <div className="text-xs font-medium mb-2">{format(d, 'PP')}</div>
                  <ul className="max-h-48 overflow-auto space-y-2">
                    {todaysAppts.map((a) => (
                      <li 
                        key={a.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(a);
                        }}
                        className="text-xs flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-md hover:bg-slate-100 group cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {format(new Date(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                          </div>
                          <div className="text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                          {a.customerName && (
                            <div className="text-slate-500 truncate text-[10px]">{a.customerName}</div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Cancel this appointment?')) {
                              updateDoc(doc(db, 'appointments', a.id), { status: 'cancelled' });
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-1"
                          title="Cancel appointment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Appointment Confirmation Section */}
      <section className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-4">Appointment Confirmations</h3>
        {appts.filter(a => a.status === 'pending').length === 0 ? (
          <div className="text-slate-500 text-sm">No pending appointments to confirm.</div>
        ) : (
          <div className="space-y-3">
            {appts
              .filter(a => a.status === 'pending')
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .map((a) => (
                <div 
                  key={a.id} 
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{format(new Date(a.start), 'MMM d, h:mm a')}</div>
                    <div className="text-xs text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                    {a.customerName && (
                      <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                    )}
                    {a.customerEmail && (
                      <div className="text-xs text-slate-500 truncate">{a.customerEmail}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-terracotta">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(a.bookedPrice ?? services[a.serviceId]?.price ?? 0)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Confirm this appointment?')) {
                            updateDoc(doc(db, 'appointments', a.id), { 
                              status: 'confirmed',
                              confirmedAt: new Date().toISOString(),
                              confirmedBy: 'admin'
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Cancel this appointment?')) {
                            updateDoc(doc(db, 'appointments', a.id), { 
                              status: 'cancelled',
                              cancelledAt: new Date().toISOString(),
                              cancelledBy: 'admin'
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Add appointment modal */}
      <AddAppointmentModal
        open={openAdd.open}
        date={openAdd.date || new Date()}
        onClose={() => setOpenAdd({ open: false, date: null })}
        onCreated={() => setOpenAdd({ open: false, date: null })}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        service={selectedAppointment ? services[selectedAppointment.serviceId] : null}
        onClose={() => setSelectedAppointment(null)}
        onEdit={() => {
          setEditingAppointment(selectedAppointment);
          setSelectedAppointment(null);
        }}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        appointment={editingAppointment}
        service={editingAppointment ? services[editingAppointment.serviceId] : null}
        onClose={() => setEditingAppointment(null)}
        onUpdated={() => {
          setEditingAppointment(null);
          // Data will auto-refresh from Firestore listener
        }}
      />
    </div>
  );
}
