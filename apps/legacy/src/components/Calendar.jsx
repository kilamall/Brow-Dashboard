import React, { useMemo, useRef, useState } from 'react';


export default function Calendar({
  appointments = [],
  customers = [],
  services = [],
  onAddAppointment = () => {},
  onOpenCustomer = () => {},
  onOpenBooking = () => {},
  selectedDate = null,
  onSelectDate = null,
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hovered, setHovered] = useState(null); // { date: Date, rect: DOMRect, locked?: boolean }

  // Helpers
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const toKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const fmtTime = (iso) => {
    const d = new Date(iso);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${pad2(m)} ${ampm}`;
  };

  // Normalize appointment date field
  const getApptISO = (a) => a?.date || a?.start;

  // Index appointments by day key
  const byDay = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const iso = getApptISO(a);
      if (!iso) continue;
      const d = new Date(iso);
      const k = toKey(d);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(a);
    }
    // sort by start time
    for (const k of map.keys()) {
      map.get(k).sort((x, y) => new Date(getApptISO(x)) - new Date(getApptISO(y)));
    }
    return map;
  }, [appointments]);

  // Build 6-week grid (42 cells) starting on Sunday
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - startWeekday);
  const days = [...Array(42)].map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  // Hover popover placement logic
  const gridRef = useRef(null);
  const getPopoverPlacement = () => {
    if (!hovered || !gridRef.current) return { side: 'bottom', align: 'left' };
    const gridRect = gridRef.current.getBoundingClientRect();
    const r = hovered.rect;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top - gridRect.top;
    const side = spaceBelow < 220 && spaceAbove > spaceBelow ? 'top' : 'bottom';
    const relLeft = r.left - gridRect.left;
    const align =
      relLeft > gridRect.width * 0.66 ? 'right' : relLeft > gridRect.width * 0.33 ? 'center' : 'left';
    return { side, align };
  };
  const placement = getPopoverPlacement();

  const handleDayEnter = (e, date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHovered({ date, rect, locked: false });
  };
  const handleDayLeave = () => {
    // delay slightly to allow moving into the card
    setTimeout(() => setHovered((h) => (h && !h.locked ? null : h)), 80);
  };

  const handleDayClick = (d) => {
    onSelectDate?.(new Date(d));
    onAddAppointment(new Date(d));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Prev
          </button>
          <div className="font-semibold text-slate-900">{monthLabel}</div>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
        <button
          onClick={() => onAddAppointment(new Date())}
          className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 font-semibold"
        >
          Book appointment
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-xs font-semibold uppercase tracking-wide text-slate-500 px-4 pt-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="pb-2 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div ref={gridRef} className="grid grid-cols-7 grid-rows-6 gap-px bg-slate-200">
        {days.map((d) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const k = toKey(d);
          const items = byDay.get(k) || [];
          const isSelected = selectedDate && isSameDay(new Date(selectedDate), d);
          return (
            <div
              key={k}
              onMouseEnter={(e) => handleDayEnter(e, d)}
              onMouseLeave={handleDayLeave}
              onClick={() => handleDayClick(d)}
              className={[
                'relative min-h-[100px] bg-white',
                inMonth ? 'hover:bg-slate-50 cursor-pointer' : 'bg-slate-50 text-slate-400',
                isSelected ? 'ring-2 ring-purple-600' : '',
              ].join(' ')}
            >
              <div className="absolute top-2 left-2 text-xs font-semibold">{d.getDate()}</div>

              {/* appointments preview */}
              <div className="mt-6 px-2 space-y-1">
                {items.slice(0, 3).map((a) => {
                  const iso = getApptISO(a);
                  return (
                    <div key={a.id} className="group flex items-center gap-2 text-xs truncate">
                      <span className="text-slate-500 whitespace-nowrap">{fmtTime(iso)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <button
                        className="truncate text-slate-700 hover:underline"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenBooking?.(a.id);
                        }}
                      >
                        {a.serviceName || 'Booking'}
                      </button>
                      <span className="text-slate-400">·</span>
                      <button
                        className="truncate text-slate-700 hover:underline"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (a.customerId) onOpenCustomer?.(a.customerId);
                        }}
                      >
                        {a.customerName || 'Customer'}
                      </button>
                    </div>
                  );
                })}
                {items.length > 3 && (
                  <div className="text-[11px] text-slate-500">+{items.length - 3} more</div>
                )}
              </div>

              {/* Hover card */}
              {hovered && isSameDay(hovered.date, d) && (
                <HoverCard
                  date={d}
                  items={items}
                  placement={placement}
                  onLock={(locked) => setHovered((h) => (h ? { ...h, locked } : h))}
                  onAdd={() => onAddAppointment(new Date(d))}
                  onOpenCustomer={onOpenCustomer}
                  onOpenBooking={onOpenBooking}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoverCard({ date, items, placement, onLock, onAdd, onOpenCustomer, onOpenBooking }) {
  const label = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const posClass = useMemo(() => {
    const base = 'absolute z-40 w-80 pointer-events-none';
    const side = placement.side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
    const align =
      placement.align === 'right'
        ? 'right-0'
        : placement.align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0';
    return `${base} ${side} ${align}`;
  }, [placement]);

  return (
    <div
      className={posClass}
      onMouseEnter={() => onLock(true)}
      onMouseLeave={() => onLock(false)}
    >
      <div className="pointer-events-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            className="text-xs bg-purple-700 text-white px-3 py-1.5 rounded-md hover:bg-purple-800"
          >
            Book appointment
          </button>
        </div>
        <ul className="max-h-64 overflow-auto divide-y divide-slate-100">
          {items.length === 0 && (
            <li className="px-4 py-6 text-sm text-slate-500 text-center">No appointments</li>
          )}
          {items.map((a) => {
            const iso = a.date || a.start;
            return (
              <li key={a.id} className="px-4 py-3 text-sm flex items-start gap-3">
                <div className="mt-0.5 text-slate-500 shrink-0 w-16">{timeFromISO(iso)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">
                    <button
                      className="hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBooking?.(a.id);
                      }}
                    >
                      {a.serviceName || 'Booking'}
                    </button>
                  </div>
                  <div className="text-slate-600 truncate">
                    with{' '}
                    <button
                      className="hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (a.customerId) onOpenCustomer?.(a.customerId);
                      }}
                    >
                      {a.customerName || 'Customer'}
                    </button>
                  </div>
                  {a.notes && <div className="text-xs text-slate-500 mt-1 line-clamp-2">{a.notes}</div>}
                </div>
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${statusChip(a.status)}`}>
                  {a.status || 'confirmed'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function statusChip(status) {
  switch ((status || 'confirmed').toLowerCase()) {
    case 'canceled':
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

function timeFromISO(iso) {
  const d = new Date(iso);
  const m = d.getMinutes();
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${h}:${pad2(m)} ${ampm}`;
}
