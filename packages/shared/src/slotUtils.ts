import type { Appointment, BusinessHours, DayClosure, SpecialHours } from './types';
import type { AvailabilitySlot } from './availabilityHelpers';
import { formatDateYYYYMMDD } from './dateUtils';

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
  if (Array.isArray(closures) && closures.some(c => c.date === dateStr)) {
    return null;
  }
  
  // Check for special hours
  const special = Array.isArray(specialHours) ? specialHours.find(s => s.date === dateStr) : undefined;
  if (special) {
    return special.ranges;
  }
  
  // Use regular business hours
  const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] as keyof BusinessHours['slots'];
  return bh.slots[dayKey] || [];
}

// Re-export the centralized date formatter for use in other components
export { formatDateYYYYMMDD } from './dateUtils';

/**
 * Union type for booked slots - can be either Appointment or AvailabilitySlot
 */
type BookedSlot = Appointment | AvailabilitySlot;

/**
 * Generate available start-time ISO strings for a given date, duration, and business hours.
 * Excludes any slots that would overlap existing booked slots (appointments or availability slots).
 * Respects day closures and special hours.
 * 
 * This single function handles both Appointment[] and AvailabilitySlot[] types.
 */
export function availableSlotsForDay(
  date: Date,
  durationMin: number,
  bh: BusinessHours,
  bookedSlots: BookedSlot[],
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
    // Allow appointments to START before closing, even if they extend past closing time
    for (let t = start.getTime(); t < end.getTime(); t += step * 60_000) {
      const sIso = new Date(t).toISOString();
      const eMs = t + durationMin * 60_000;
      if (!overlapsAnyBookedSlot(t, eMs, bookedSlots)) slots.push(sIso);
    }
  }
  return slots;
}

/**
 * Check if a time slot overlaps with any booked slot (appointment or availability).
 * Handles both Appointment and AvailabilitySlot types.
 */
function overlapsAnyBookedSlot(startMs: number, endMs: number, bookedSlots: BookedSlot[]): boolean {
  for (const slot of bookedSlots) {
    const slotStart = new Date(slot.start).getTime();
    
    // Type guard to determine which type of slot we're dealing with
    const isAvailabilitySlot = (slot: BookedSlot): slot is AvailabilitySlot => {
      return 'end' in slot && typeof (slot as any).status === 'string';
    };
    
    const isAppointment = (slot: BookedSlot): slot is Appointment => {
      return 'duration' in slot && typeof slot.duration === 'number';
    };
    
    // Determine if this slot is booked/cancelled based on type
    if (isAvailabilitySlot(slot)) {
      // AvailabilitySlot type
      if (slot.status !== 'booked' && slot.status !== 'held') {
        continue; // Skip non-blocking slots
      }
      // Skip expired held slots
      if (slot.status === 'held' && slot.expiresAt && new Date(slot.expiresAt).getTime() < Date.now()) {
        continue;
      }
    } else if (isAppointment(slot)) {
      // Appointment type
      if (slot.status === 'cancelled') {
        continue; // Skip cancelled appointments
      }
    }
    
    // Calculate slot end time
    let slotEnd: number;
    if (isAvailabilitySlot(slot) && slot.end) {
      // AvailabilitySlot has explicit end time
      slotEnd = new Date(slot.end).getTime();
    } else if (isAppointment(slot)) {
      // Appointment has duration
      slotEnd = slotStart + slot.duration * 60_000;
    } else {
      continue; // Can't determine end time, skip
    }
    
    // Check for overlap
    if (slotStart < endMs && slotEnd > startMs) {
      return true; // Overlap detected
    }
  }
  
  return false;
}

// Convert a wall-clock HH:MM in a timezone on a given date to a Date UTC
function wallToDate(base: Date, hhmm: string, timeZone: string): Date {
  const [hh, mm] = hhmm.split(':').map((n) => parseInt(n, 10));
  
  // Get the calendar date (year, month, day) from base using UTC methods
  // This ensures we get the intended date regardless of the user's local timezone
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  const day = base.getUTCDate();
  
  // For America/Los_Angeles timezone:
  // PST (Nov-Mar): UTC-8, PDT (Mar-Nov): UTC-7
  // Determine DST: DST ends first Sunday of November
  let offsetHours = 8; // Default to PST
  if (month === 10) { // November (0-indexed)
    const nov1 = new Date(Date.UTC(year, 10, 1));
    const firstSunday = 1 + ((7 - nov1.getUTCDay()) % 7);
    if (day < firstSunday) {
      offsetHours = 7; // Still in PDT
    }
  } else if (month >= 3 && month <= 9) {
    // April through October are always PDT
    offsetHours = 7;
  } else if (month === 2) {
    // March - DST starts second Sunday
    const mar1 = new Date(Date.UTC(year, 2, 1));
    const firstSunday = 1 + ((7 - mar1.getUTCDay()) % 7);
    const secondSunday = firstSunday + 7;
    if (day >= secondSunday) {
      offsetHours = 7;
    }
  }
  
  // Create UTC date: Pacific time + offset = UTC
  // Example: 4 PM Pacific + 8 hours = midnight UTC (next day)
  return new Date(Date.UTC(year, month, day, hh + offsetHours, mm, 0));
}

/**
 * Generate available slots using availability collection (more efficient, no customer data)
 * Respects day closures and special hours.
 * 
 * @deprecated Use availableSlotsForDay() instead - this function is kept for backward compatibility
 */
export function availableSlotsUsingAvailability(
  date: Date,
  durationMin: number,
  bh: BusinessHours,
  bookedSlots: AvailabilitySlot[],
  closures: DayClosure[] = [],
  specialHours: SpecialHours[] = []
): string[] {
  return availableSlotsForDay(date, durationMin, bh, bookedSlots, closures, specialHours);
}
