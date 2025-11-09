import { Firestore, collection, doc, writeBatch, query, where, orderBy, limit, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';

/**
 * Availability slot - minimal data for showing which time slots are taken
 * No customer information exposed
 */
export interface AvailabilitySlot {
  id: string;
  start: string;       // ISO timestamp
  end: string;         // ISO timestamp (calculated from start + duration)
  status: 'booked' | 'held' | 'available';
  createdAt: string;
  expiresAt?: string;  // For held slots
}

/**
 * Create an availability slot when an appointment is booked
 */
export async function createAvailabilitySlot(
  db: Firestore,
  appointmentId: string,
  start: string,
  durationMinutes: number
): Promise<void> {
  const startMs = new Date(start).getTime();
  const endMs = startMs + (durationMinutes * 60 * 1000);
  const end = new Date(endMs).toISOString();

  const availRef = doc(db, 'availability', appointmentId);
  const batch = writeBatch(db);

  batch.set(availRef, {
    start,
    end,
    status: 'booked',
    createdAt: new Date().toISOString(),
  });

  await batch.commit();
}

/**
 * Remove an availability slot when an appointment is cancelled or deleted
 */
export async function removeAvailabilitySlot(
  db: Firestore,
  appointmentId: string
): Promise<void> {
  const availRef = doc(db, 'availability', appointmentId);
  await deleteDoc(availRef);
}

/**
 * Update availability slot status
 */
export async function updateAvailabilitySlot(
  db: Firestore,
  appointmentId: string,
  updates: Partial<Pick<AvailabilitySlot, 'status' | 'expiresAt'>>
): Promise<void> {
  const availRef = doc(db, 'availability', appointmentId);
  const batch = writeBatch(db);
  batch.update(availRef, updates as any);
  await batch.commit();
}

/**
 * Watch availability slots for a specific day
 * Returns slots that are 'booked' status (not cancelled)
 */
export function watchAvailabilityByDay(
  db: Firestore,
  day: Date,
  cb: (slots: AvailabilitySlot[]) => void
): () => void {
  // Use UTC methods to create the query range
  // IMPORTANT: Query wider range to catch appointments that span UTC days
  // e.g., 4 PM PST on Nov 9 = midnight UTC on Nov 10
  const year = day.getUTCFullYear();
  const month = day.getUTCMonth();
  const dayOfMonth = day.getUTCDate();
  
  // Query from 12 hours before to 12 hours after to catch all possible timezones
  const start = new Date(Date.UTC(year, month, dayOfMonth, 0, 0, 0, 0));
  start.setHours(start.getHours() - 12);
  
  const end = new Date(Date.UTC(year, month, dayOfMonth, 23, 59, 59, 999));
  end.setHours(end.getHours() + 12);

  console.log('🔍 Availability query range:', {
    day: day.toISOString(),
    start: start.toISOString(),
    end: end.toISOString(),
    startLocal: start.toString(),
    endLocal: end.toString()
  });

  // Try a simpler query first - just get all availability for the day, filter in JavaScript
  const qy = query(
    collection(db, 'availability'),
    where('start', '>=', start.toISOString()),
    where('start', '<=', end.toISOString())
    // Removed status filter to avoid index issues - we'll filter in JavaScript
  );

  return onSnapshot(
    qy,
    (snap) => {
      const slots: AvailabilitySlot[] = [];
      const targetDateStr = day.toISOString().slice(0, 10); // e.g., "2025-11-09"
      
      snap.forEach((d) => {
        const slot = { id: d.id, ...d.data() } as AvailabilitySlot;
        
        // Filter for 'booked' status in JavaScript to avoid index issues
        if (slot.status !== 'booked') return;
        
        // Also filter by Pacific timezone date - appointment might be stored on different UTC day
        const aptDate = new Date(slot.start);
        const aptDatePST = aptDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'America/Los_Angeles'
        });
        // Convert from "MM/DD/YYYY" to "YYYY-MM-DD"
        const [mo, da, yr] = aptDatePST.split('/');
        const aptDateStr = `${yr}-${mo}-${da}`;
        
        if (aptDateStr === targetDateStr) {
          slots.push(slot);
        }
      });
      
      // Sort by start time since we removed orderBy from query
      slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      console.log(`Loaded ${slots.length} availability slots for ${targetDateStr} (filtered by PST date)`);
      cb(slots);
    },
    (error) => {
      console.error('Error watching availability:', error);
      // Return empty array on error to prevent UI breaking
      cb([]);
    }
  );
}

/**
 * Fetch availability slots for a specific day (one-time fetch)
 * Returns slots that are 'booked' status (not cancelled)
 */
export async function fetchAvailabilityForDay(
  db: Firestore,
  day: Date
): Promise<AvailabilitySlot[]> {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  console.log('🔍 Fetching availability for day:', {
    day: day.toISOString(),
    start: start.toISOString(),
    end: end.toISOString()
  });

  const qy = query(
    collection(db, 'availability'),
    where('start', '>=', start.toISOString()),
    where('start', '<=', end.toISOString())
  );

  try {
    const snap = await getDocs(qy);
    const slots: AvailabilitySlot[] = [];
    
    snap.forEach((d) => {
      const slot = { id: d.id, ...d.data() } as AvailabilitySlot;
      // Filter for 'booked' status
      if (slot.status === 'booked') {
        slots.push(slot);
      }
    });
    
    // Sort by start time
    slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    console.log(`Fetched ${slots.length} availability slots for ${day.toISOString().slice(0, 10)}`);
    
    return slots;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
}

/**
 * Clean up expired held slots (run periodically)
 */
export async function cleanupExpiredHolds(db: Firestore): Promise<number> {
  const now = new Date().toISOString();
  const qy = query(
    collection(db, 'availability'),
    where('status', '==', 'held'),
    where('expiresAt', '<=', now)
  );

  const snap = await getDocs(qy);
  const batch = writeBatch(db);
  let count = 0;

  snap.forEach((d) => {
    batch.delete(d.ref);
    count++;
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

