import type { BusinessHours } from './types';

/**
 * Format business hours for display in a user-friendly way
 */
export function formatBusinessHoursForDate(date: Date, businessHours: BusinessHours | null): string {
  if (!businessHours) {
    return 'Business hours not available';
  }

  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()] as keyof BusinessHours['slots'];
  const daySlots = businessHours.slots?.[dayKey];

  if (!daySlots) {
    return 'Closed';
  }

  // Handle both old array format and new object format
  let ranges: Array<[string, string]> = [];
  if (Array.isArray(daySlots)) {
    ranges = daySlots as any;
  } else if (daySlots && 'ranges' in daySlots) {
    ranges = (daySlots as any).ranges.map((r: any) => [r.start, r.end]);
  }

  if (ranges.length === 0) {
    return 'Closed';
  }

  // Format time ranges
  const formattedRanges = ranges.map(([start, end]) => {
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    return `${startTime} - ${endTime}`;
  });

  return formattedRanges.join(', ');
}

/**
 * Format a time string (HH:MM) to a more readable format (H:MM AM/PM)
 */
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get a summary of business hours for the week
 */
export function getBusinessHoursSummary(businessHours: BusinessHours | null): string {
  if (!businessHours) {
    return 'Business hours not available';
  }

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  
  const summary: string[] = [];
  
  for (let i = 0; i < dayKeys.length; i++) {
    const dayKey = dayKeys[i];
    const dayLabel = dayLabels[i];
    const daySlots = businessHours.slots?.[dayKey];

    if (!daySlots) {
      summary.push(`${dayLabel}: Closed`);
      continue;
    }

    // Handle both old array format and new object format
    let ranges: Array<[string, string]> = [];
    if (Array.isArray(daySlots)) {
      ranges = daySlots as any;
    } else if (daySlots && 'ranges' in daySlots) {
      ranges = (daySlots as any).ranges.map((r: any) => [r.start, r.end]);
    }

    if (ranges.length === 0) {
      summary.push(`${dayLabel}: Closed`);
    } else {
      const formattedRanges = ranges.map(([start, end]) => {
        const startTime = formatTime(start);
        const endTime = formatTime(end);
        return `${startTime} - ${endTime}`;
      });
      summary.push(`${dayLabel}: ${formattedRanges.join(', ')}`);
    }
  }

  return summary.join('\n');
}

/**
 * Check if the business is currently open (within business hours today)
 */
export function isBusinessCurrentlyOpen(businessHours: BusinessHours | null): boolean {
  if (!businessHours) return false;

  const now = new Date();
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()] as keyof BusinessHours['slots'];
  const daySlots = businessHours.slots?.[dayKey];

  if (!daySlots) return false;

  // Handle both old array format and new object format
  let ranges: Array<[string, string]> = [];
  if (Array.isArray(daySlots)) {
    ranges = daySlots as any;
  } else if (daySlots && 'ranges' in daySlots) {
    ranges = (daySlots as any).ranges.map((r: any) => [r.start, r.end]);
  }

  if (ranges.length === 0) return false;

  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Check if current time falls within any of the ranges
  return ranges.some(([start, end]) => currentTime >= start && currentTime <= end);
}

