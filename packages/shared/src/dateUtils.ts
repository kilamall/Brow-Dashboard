/**
 * Centralized date formatting utilities
 * Ensures consistent date formatting across the application
 */

/**
 * Format a Date object as YYYY-MM-DD string
 * Uses local timezone to avoid timezone conversion issues
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}






