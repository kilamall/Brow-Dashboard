import type { Appointment, BusinessHours } from './types';

/**
 * Generate available start-time ISO strings for a given date, duration, and business hours.
 * Excludes any slots that would overlap existing (non-cancelled) appointments.
 */
export function availableSlotsForDay(date: Date, durationMin: number, bh: BusinessHours, appts: Appointment[]): string[] {
  const tz = bh.timezone || 'America/Los_Angeles';
  const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] as keyof BusinessHours['slots'];
  const ranges = bh.slots[dayKey] || [];
  const step = Math.max(5, bh.slotInterval || 15);

  const slots: string[] = [];
  for (const [startHHMM, endHHMM] of ranges) {
    const start = wallToDate(date, startHHMM, tz);
    const end = wallToDate(date, endHHMM, tz);
    for (let t = start.getTime(); t + durationMin * 60_000 <= end.getTime(); t += step * 60_000) {
      const sIso = new Date(t).toISOString();
      const eMs = t + durationMin * 60_000;
      if (!overlapsAny(t, eMs, appts)) slots.push(sIso);
    }
  }
  return slots;
}

function overlapsAny(startMs: number, endMs: number, appts: Appointment[]): boolean {
  for (const a of appts) {
    if (a.status === 'cancelled') continue;
    const aStart = new Date(a.start).getTime();
    const aEnd = aStart + a.duration * 60_000;
    if (aStart < endMs && aEnd > startMs) return true;
  }
  return false;
}

// Convert a wall-clock HH:MM in a timezone on a given date to a Date UTC
function wallToDate(base: Date, hhmm: string, timeZone: string): Date {
  const [hh, mm] = hhmm.split(':').map((n) => parseInt(n, 10));
  // Build the parts in the target TZ, then reconstruct a local Date from them
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0));
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value || '0');
  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
}
