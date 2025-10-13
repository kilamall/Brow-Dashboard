import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import AddAppointmentModal from '@/components/AddAppointmentModal';
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
  }, [gridStart, gridEnd]);

  // Services map for names
  const [services, setServices] = useState<Record<string, Service>>({});
  useEffect(() => {
    const ref = collection(db, 'services');
    return onSnapshot(query(ref, orderBy('name', 'asc')), (snap) => {
      const map: Record<string, Service> = {};
      snap.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
      setServices(map);
    });
  }, []);

  const days: Date[] = useMemo(() => {
    const list: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) list.push(new Date(d));
    return list;
  }, [gridStart, gridEnd]);

  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [openAdd, setOpenAdd] = useState<{ open: boolean; date: Date | null }>({ open: false, date: null });

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
                  <div key={a.id} className="text-[11px] truncate border rounded px-1 py-0.5">
                    {format(new Date(a.start), 'h:mma')} · {services[a.serviceId]?.name || 'Service'}
                  </div>
                ))}
                {todaysAppts.length > 3 && (
                  <div className="text-[10px] text-slate-500">+{todaysAppts.length - 3} more…</div>
                )}
              </div>
              {/* Hover popover */}
              {hoverDate && isSameDay(hoverDate, d) && todaysAppts.length > 0 && (
                <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 w-56 bg-white border rounded-xl shadow-lg p-2">
                  <div className="text-xs font-medium mb-1">{format(d, 'PP')}</div>
                  <ul className="max-h-48 overflow-auto space-y-1">
                    {todaysAppts.map((a) => (
                      <li key={a.id} className="text-xs flex justify-between gap-2">
                        <span className="truncate">{format(new Date(a.start), 'h:mm a')}</span>
                        <span className="truncate text-right">{services[a.serviceId]?.name || 'Service'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add appointment modal */}
      <AddAppointmentModal
        open={openAdd.open}
        date={openAdd.date || new Date()}
        onClose={() => setOpenAdd({ open: false, date: null })}
        onCreated={() => setOpenAdd({ open: false, date: null })}
      />
    </div>
  );
}
