export type ID = string;


export interface Service {
id: ID;
name: string;
price: number;
duration: number; // minutes
category?: string;
description?: string;
active: boolean;
createdAt?: any;
updatedAt?: any;
}


export interface Customer {
id: ID;
name: string;
email?: string;
phone?: string;
notes?: string;
lastVisit?: string;
totalVisits?: number;
status?: 'approved'|'blocked'|'guest';
createdAt?: any;
updatedAt?: any;
}


export interface Appointment {
id: ID;
customerId: ID;
serviceId: ID;
start: string; // ISO
duration: number; // minutes
status: 'confirmed'|'pending'|'cancelled';
notes?: string;
bookedPrice?: number;
createdAt?: any;
updatedAt?: any;
// Optional convenience to speed overlap queries
end?: string; // ISO (computed from start + duration)
}


export interface AnalyticsTargets {
dailyTarget: number;
weeklyTarget: number;
monthlyTarget: number;
defaultCogsRate: number; // % 0..1
}


export interface BusinessHours {
timezone: string; // e.g. "America/Los_Angeles"
slotInterval: number; // minutes
slots: Record<'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat', [string,string][]>; // [["09:00","17:00"]]
}