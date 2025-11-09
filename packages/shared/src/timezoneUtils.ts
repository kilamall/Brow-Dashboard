/**
 * Timezone utilities for consistent time display across the admin dashboard.
 * 
 * All appointment times are stored in UTC in the database.
 * These utilities ensure times are always displayed in the BUSINESS timezone,
 * not the admin's local timezone (critical for traveling admins).
 */

import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import type { BusinessHours } from './types';

/**
 * Format a date/time string or Date object in the business timezone.
 * 
 * @param date - ISO string, Date object, or timestamp to format
 * @param formatStr - date-fns format string (e.g., 'h:mm a', 'MMM d, yyyy')
 * @param businessTimezone - IANA timezone (e.g., 'America/Los_Angeles')
 * @returns Formatted string in business timezone
 * 
 * @example
 * // User in Hawaii, business in California
 * // Database has: "2024-11-09T22:00:00.000Z" (10 PM UTC = 2 PM PST)
 * formatInBusinessTZ("2024-11-09T22:00:00.000Z", "h:mm a", "America/Los_Angeles")
 * // Returns: "2:00 PM" (correct California time, not 12:00 PM Hawaii time)
 */
export function formatInBusinessTZ(
  date: string | Date | number,
  formatStr: string,
  businessTimezone: string = 'America/Los_Angeles'
): string {
  try {
    // Convert date to Date object if needed
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatInBusinessTZ:', date);
      return 'Invalid Date';
    }
    
    // Format in business timezone
    return formatInTimeZone(dateObj, businessTimezone, formatStr);
  } catch (error) {
    console.error('Error formatting date in business timezone:', error, { date, formatStr, businessTimezone });
    return 'Error';
  }
}

/**
 * Convert a UTC date to a Date object in the business timezone.
 * Useful when you need to do date calculations in business time.
 * 
 * @param date - ISO string, Date object, or timestamp
 * @param businessTimezone - IANA timezone
 * @returns Date object adjusted to business timezone
 */
export function toBusinessTZ(
  date: string | Date | number,
  businessTimezone: string = 'America/Los_Angeles'
): Date {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to toBusinessTZ:', date);
      return new Date();
    }
    
    return toZonedTime(dateObj, businessTimezone);
  } catch (error) {
    console.error('Error converting to business timezone:', error);
    return new Date();
  }
}

/**
 * Format an appointment time range (start - end) in business timezone.
 * 
 * @param start - Appointment start time (ISO string, Date, or timestamp)
 * @param duration - Duration in minutes
 * @param businessTimezone - IANA timezone
 * @returns Formatted time range (e.g., "2:00 PM - 3:30 PM")
 */
export function formatAppointmentTimeRange(
  start: string | Date | number,
  duration: number,
  businessTimezone: string = 'America/Los_Angeles'
): string {
  try {
    const startDate = typeof start === 'string' || typeof start === 'number' ? new Date(start) : start;
    
    if (isNaN(startDate.getTime())) {
      return 'Time TBD';
    }
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    const startFormatted = formatInBusinessTZ(startDate, 'h:mm a', businessTimezone);
    const endFormatted = formatInBusinessTZ(endDate, 'h:mm a', businessTimezone);
    
    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.error('Error formatting appointment time range:', error);
    return 'Time TBD';
  }
}

/**
 * Helper to get timezone from BusinessHours object with fallback.
 */
export function getBusinessTimezone(bh: BusinessHours | null | undefined): string {
  return bh?.timezone || 'America/Los_Angeles';
}


