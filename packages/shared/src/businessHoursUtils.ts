import type { BusinessHours } from './types';

/**
 * Check if the business is open on a specific date
 */
export function isBusinessOpenOnDate(date: Date, businessHours: BusinessHours | null): boolean {
  if (!businessHours) return false;
  
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()] as keyof BusinessHours['slots'];
  const daySlots = businessHours.slots?.[dayKey];
  
  if (!daySlots) return false;
  
  // Handle both old array format and new object format
  let ranges: Array<[string, string]> = [];
  if (Array.isArray(daySlots)) {
    ranges = daySlots as any;
  } else if (daySlots && 'ranges' in daySlots) {
    ranges = (daySlots as any).ranges.map((r: any) => [r.start, r.end]);
  }
  
  // Return true if there are any time ranges for this day
  return ranges.length > 0;
}

/**
 * Get the minimum number of days in advance that can be booked
 * (e.g., can't book same day, need 24 hours notice, etc.)
 */
export function getMinimumAdvanceDays(): number {
  return 0; // Allow same-day booking for now
}

/**
 * Get the maximum number of days in advance that can be booked
 */
export function getMaximumAdvanceDays(): number {
  return 90; // Allow booking up to 90 days in advance
}

/**
 * Check if a date is valid for booking (within range and business is open)
 */
export function isValidBookingDate(date: Date, businessHours: BusinessHours | null): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0); // Reset to start of day
  
  const daysDifference = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if date is within booking range
  if (daysDifference < getMinimumAdvanceDays() || daysDifference > getMaximumAdvanceDays()) {
    return false;
  }
  
  // Check if business is open on this date
  return isBusinessOpenOnDate(date, businessHours);
}

/**
 * Get all valid booking dates within the booking range
 */
export function getValidBookingDates(businessHours: BusinessHours | null): Date[] {
  const validDates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDays = getMaximumAdvanceDays();
  
  for (let i = 0; i <= maxDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (isValidBookingDate(date, businessHours)) {
      validDates.push(date);
    }
  }
  
  return validDates;
}

/**
 * Get the next valid booking date
 */
export function getNextValidBookingDate(businessHours: BusinessHours | null): Date | null {
  const validDates = getValidBookingDates(businessHours);
  return validDates.length > 0 ? validDates[0] : null;
}

/**
 * Get the next valid booking date after a specific date
 */
export function getNextValidBookingDateAfter(date: Date, businessHours: BusinessHours | null): Date | null {
  if (!businessHours) return null;
  
  const validDates = getValidBookingDates(businessHours);
  return validDates.find(d => d > date) || null;
}

/**
 * Format a date for display in error messages
 */
export function formatNextAvailableDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  
  if (targetDate.getTime() === today.getTime()) {
    return 'today';
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
