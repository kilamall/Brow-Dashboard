import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import AddAppointmentModal from '@/components/AddAppointmentModal';
import CalendarDayHighlighting from '@/components/CalendarDayHighlighting';
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
  const popupRef = useRef<HTMLDivElement>(null);

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
    return onSnapshot(query(ref, where('active', '==', true), orderBy('name', 'asc')), (snap) => {
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
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate popup position to avoid viewport cutoff
  const calculatePopupPosition = (cellElement: HTMLDivElement) => {
    const rect = cellElement.getBoundingClientRect();
    const popupWidth = 256; // w-64 = 16rem = 256px
    const popupHeight = 200; // Approximate height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = rect.left + (rect.width / 2) - (popupWidth / 2);
    let y = rect.bottom + 4; // 4px gap below cell
    
    // Adjust if popup would go off the right edge
    if (x + popupWidth > viewportWidth - 16) {
      x = viewportWidth - popupWidth - 16;
    }
    
    // Adjust if popup would go off the left edge
    if (x < 16) {
      x = 16;
    }
    
    // Adjust if popup would go off the bottom edge
    if (y + popupHeight > viewportHeight - 16) {
      y = rect.top - popupHeight - 4; // Show above the cell instead
    }
    
    return { x, y };
  };

  const handleMouseEnter = (d: Date, idx: number) => {
    setHoverDate(d);
    const cellElement = cellRefs.current[idx];
    if (cellElement) {
      const position = calculatePopupPosition(cellElement);
      setPopupPosition(position);
    }
  };

  const handleMouseLeave = (d: Date) => {
    setHoverDate((prev) => (prev && isSameDay(prev, d) ? null : prev));
    setPopupPosition(null);
  };

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
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl">
        {days.map((d, idx) => {
          const inMonth = isSameMonth(d, month);
          const todaysAppts = appts.filter((a) => isSameDay(new Date(a.start), d) && a.status !== 'cancelled');
          return (
            <CalendarDayHighlighting
              key={idx}
              date={d}
              className={`relative min-h-[108px] ${inMonth ? '' : 'bg-slate-50 text-slate-400'}`}
            >
              <div
                ref={(el) => (cellRefs.current[idx] = el)}
                onMouseEnter={() => handleMouseEnter(d, idx)}
                onMouseLeave={() => handleMouseLeave(d)}
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
              </div>
            </CalendarDayHighlighting>
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

      {/* Portal-based popup */}
      {hoverDate && popupPosition && (() => {
        const todaysAppts = appts.filter((a) => isSameDay(new Date(a.start), hoverDate) && a.status !== 'cancelled');
        if (todaysAppts.length === 0) return null;
        
        return createPortal(
          <div 
            className="fixed z-50 w-64 bg-white border rounded-xl shadow-lg p-2"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`
            }}
          >
            <div className="text-xs font-medium mb-1">{format(hoverDate, 'PP')}</div>
            <ul className="max-h-48 overflow-auto space-y-1">
              {todaysAppts.map((a) => (
                <li key={a.id} className="text-xs flex justify-between gap-2">
                  <span className="truncate">
                    {format(new Date(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                  </span>
                  <span className="truncate text-right">{services[a.serviceId]?.name || 'Service'}</span>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
