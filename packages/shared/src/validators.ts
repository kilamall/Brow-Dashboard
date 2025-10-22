import type { Service, Customer, Appointment, BusinessHours, Staff } from './types';

/**
 * Safe data accessors with defaults
 */

export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) return value;
  return defaultValue;
}

export function safeObject<T extends Record<string, any>>(
  value: unknown, 
  defaultValue: T
): T {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as T;
  }
  return defaultValue;
}

export function safeDate(value: unknown, defaultValue: Date = new Date()): Date {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return defaultValue;
}

/**
 * Type guards for Firestore data
 */

export function isValidService(data: any): data is Service {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    typeof data.duration === 'number' &&
    typeof data.price === 'number'
  );
}

export function isValidCustomer(data: any): data is Customer {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    (typeof data.email === 'string' || data.email === undefined) &&
    (typeof data.phone === 'string' || data.phone === undefined)
  );
}

export function isValidAppointment(data: any): data is Appointment {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.customerId === 'string' &&
    typeof data.serviceId === 'string' &&
    typeof data.start === 'string'
  );
}

export function isValidBusinessHours(data: any): data is BusinessHours {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.timezone === 'string' &&
    typeof data.hours === 'object'
  );
}

export function isValidStaff(data: any): data is Staff {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    typeof data.email === 'string'
  );
}

/**
 * Sanitize and validate Firestore documents
 */

export function sanitizeService(data: any): Service | null {
  if (!data || typeof data !== 'object') return null;
  
  try {
    return {
      id: safeString(data.id),
      name: safeString(data.name),
      description: data.description ? safeString(data.description) : undefined,
      duration: safeNumber(data.duration, 30),
      price: safeNumber(data.price, 0),
      category: data.category ? safeString(data.category) : undefined,
      active: safeBoolean(data.active, true),
      imageUrl: data.imageUrl ? safeString(data.imageUrl) : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('Failed to sanitize service:', error);
    return null;
  }
}

export function sanitizeCustomer(data: any): Customer | null {
  if (!data || typeof data !== 'object') return null;
  
  try {
    return {
      id: safeString(data.id),
      name: safeString(data.name),
      email: data.email ? safeString(data.email) : undefined,
      phone: data.phone ? safeString(data.phone) : undefined,
      notes: data.notes ? safeString(data.notes) : undefined,
      structuredNotes: data.structuredNotes ? safeArray(data.structuredNotes) : undefined,
      lastVisit: data.lastVisit ? safeString(data.lastVisit) : undefined,
      totalVisits: data.totalVisits !== undefined ? safeNumber(data.totalVisits, 0) : undefined,
      status: data.status as 'pending' | 'active' | 'blocked' | undefined,
      consentFormsSigned: data.consentFormsSigned ? safeArray(data.consentFormsSigned) : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('Failed to sanitize customer:', error);
    return null;
  }
}

export function sanitizeAppointment(data: any): Appointment | null {
  if (!data || typeof data !== 'object') return null;
  
  try {
    // Ensure status is one of the valid values
    let status: 'confirmed' | 'pending' | 'cancelled' = 'pending';
    if (data.status === 'confirmed' || data.status === 'cancelled') {
      status = data.status;
    }
    
    return {
      id: safeString(data.id),
      customerId: safeString(data.customerId),
      customerName: data.customerName ? safeString(data.customerName) : undefined,
      customerEmail: data.customerEmail ? safeString(data.customerEmail) : undefined,
      customerPhone: data.customerPhone ? safeString(data.customerPhone) : undefined,
      serviceId: safeString(data.serviceId),
      start: safeString(data.start),
      duration: safeNumber(data.duration, 30),
      end: data.end ? safeString(data.end) : undefined,
      status,
      notes: data.notes ? safeString(data.notes) : undefined,
      bookedPrice: data.bookedPrice !== undefined ? safeNumber(data.bookedPrice, 0) : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      confirmedAt: data.confirmedAt ? safeString(data.confirmedAt) : undefined,
      confirmedBy: data.confirmedBy ? safeString(data.confirmedBy) : undefined,
      cancelledAt: data.cancelledAt ? safeString(data.cancelledAt) : undefined,
      cancelledBy: data.cancelledBy ? safeString(data.cancelledBy) : undefined
    };
  } catch (error) {
    console.error('Failed to sanitize appointment:', error);
    return null;
  }
}

/**
 * Array validation helpers
 */

export function filterValidItems<T>(
  items: any[],
  validator: (item: any) => item is T
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(validator);
}

export function sanitizeArray<T>(
  items: any[],
  sanitizer: (item: any) => T | null
): T[] {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizer).filter((item): item is T => item !== null);
}

/**
 * Safe property access
 */

export function getProperty<T>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current as T;
}

/**
 * Email validation
 */

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation (US format)
 */

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^\+?1?\d{10,}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Date validation
 */

export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Price validation
 */

export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price) && isFinite(price);
}

/**
 * Duration validation (in minutes)
 */

export function isValidDuration(duration: number): boolean {
  return typeof duration === 'number' && duration > 0 && duration <= 1440 && !isNaN(duration);
}

/**
 * Safe JSON parsing
 */

export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Check if object has required fields
 */

export function hasRequiredFields<T extends Record<string, any>>(
  obj: any,
  requiredFields: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  return requiredFields.every(field => field in obj && obj[field] !== undefined && obj[field] !== null);
}

