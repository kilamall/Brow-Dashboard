import type { Appointment, BusinessHours, DayClosure, SpecialHours } from './types';
import type { AvailabilitySlot } from './availabilityHelpers';

/**
 * Get effective hours for a date, considering special hours and closures.
 * Returns null if the shop is closed for that date.
 */
export function getEffectiveHoursForDate(
  date: Date,
  bh: BusinessHours,
  closures: DayClosure[],
  specialHours: SpecialHours[]
): [string, string][] | null {
  const dateStr = formatDateYYYYMMDD(date);
  
  // Check if shop is closed for this date
  if (closures.some(c => c.date === dateStr)) {
    return null;
  }
  
  // Check for special hours
  const special = specialHours.find(s => s.date === dateStr);
  if (special) {
    return special.ranges;
  }
  
  // Use regular business hours
  const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] as keyof BusinessHours['slots'];
  return bh.slots[dayKey] || [];
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate available start-time ISO strings for a given date, duration, and business hours.
 * Excludes any slots that would overlap existing (non-cancelled) appointments.
 * Respects day closures and special hours.
 */
export function availableSlotsForDay(
  date: Date,
  durationMin: number,
  bh: BusinessHours,
  appts: Appointment[],
  closures: DayClosure[] = [],
  specialHours: SpecialHours[] = []
): string[] {
  const tz = bh.timezone || 'America/Los_Angeles';
  
  // Get effective hours (considering closures and special hours)
  const ranges = getEffectiveHoursForDate(date, bh, closures, specialHours);
  
  // If shop is closed, return no slots
  if (ranges === null || ranges.length === 0) {
    return [];
  }
  
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

/**
 * Generate available slots using availability collection (more efficient, no customer data)
 * Respects day closures and special hours.
 */
export function availableSlotsFromAvailability(
  date: Date,
  durationMin: number,
  bh: BusinessHours,
  bookedSlots: AvailabilitySlot[],
  closures: DayClosure[] = [],
  specialHours: SpecialHours[] = []
): string[] {
  const tz = bh.timezone || 'America/Los_Angeles';
  
  // Get effective hours (considering closures and special hours)
  const ranges = getEffectiveHoursForDate(date, bh, closures, specialHours);
  
  // If shop is closed, return no slots
  if (ranges === null || ranges.length === 0) {
    return [];
  }
  
  const step = Math.max(5, bh.slotInterval || 15);

  const slots: string[] = [];
  for (const [startHHMM, endHHMM] of ranges) {
    const start = wallToDate(date, startHHMM, tz);
    const end = wallToDate(date, endHHMM, tz);
    for (let t = start.getTime(); t + durationMin * 60_000 <= end.getTime(); t += step * 60_000) {
      const sIso = new Date(t).toISOString();
      const eMs = t + durationMin * 60_000;
      if (!overlapsAvailability(t, eMs, bookedSlots)) slots.push(sIso);
    }
  }
  return slots;
}

function overlapsAvailability(startMs: number, endMs: number, slots: AvailabilitySlot[]): boolean {
  const now = Date.now();
  
  for (const slot of slots) {
    // Skip slots that are not actually blocking
    if (slot.status !== 'booked' && slot.status !== 'held') {
      continue;
    }
    
    // Skip expired slots (if they have an expiration)
    if (slot.expiresAt && new Date(slot.expiresAt).getTime() < now) {
      continue;
    }
    
    const slotStart = new Date(slot.start).getTime();
    const slotEnd = new Date(slot.end).getTime();
    const overlaps = slotStart < endMs && slotEnd > startMs;
    
    // Enhanced debug logging
    console.log('🔍 Checking overlap:', {
      slotId: slot.id,
      slotStatus: slot.status,
      slotStart: new Date(slotStart).toISOString(),
      slotEnd: new Date(slotEnd).toISOString(),
      requestedStart: new Date(startMs).toISOString(),
      requestedEnd: new Date(endMs).toISOString(),
      overlaps,
      slotDuration: `${Math.round((slotEnd - slotStart) / 60000)} min`,
      requestedDuration: `${Math.round((endMs - startMs) / 60000)} min`,
      isExpired: slot.expiresAt ? new Date(slot.expiresAt).getTime() < now : false
    });
    
    if (overlaps) {
      console.log(`❌ OVERLAP DETECTED with slot ${slot.id} (${slot.status})`);
      return true;
    }
  }
  return false;
}
