import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import type { Appointment, AppointmentEditRequest, AnalyticsTargets, BusinessHours, Customer, Service, BusinessInfo, HomePageContent } from './types';

export const E_OVERLAP = 'E_OVERLAP';

// ========================= Services =========================
function assertService(input: Partial<Service>) {
  if (!input.name || !input.name.trim()) throw new Error('Service name is required');
  if (input.price == null || input.price < 0) throw new Error('Price must be ≥ 0');
  if (input.duration == null || input.duration <= 0) throw new Error('Duration must be > 0');
}

export async function createService(
  db: Firestore,
  input: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  assertService(input);
  const ref = doc(collection(db, 'services'));
  await setDoc(ref, {
    name: input.name.trim(),
    price: Number(input.price),
    duration: Number(input.duration),
    category: input.category ?? null,
    description: input.description ?? null,
    active: input.active ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateService(db: Firestore, id: string, patch: Partial<Service>): Promise<void> {
  assertService({ ...patch, name: patch.name ?? 'x', price: patch.price ?? 0, duration: patch.duration ?? 1 });
  const ref = doc(db, 'services', id);
  await updateDoc(ref, {
    ...(patch.name != null ? { name: patch.name.trim() } : {}),
    ...(patch.price != null ? { price: Number(patch.price) } : {}),
    ...(patch.duration != null ? { duration: Number(patch.duration) } : {}),
    ...(patch.category !== undefined ? { category: patch.category ?? null } : {}),
    ...(patch.description !== undefined ? { description: patch.description ?? null } : {}),
    ...(patch.active !== undefined ? { active: !!patch.active } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
  // Prefer soft-delete? -> await updateService(db, id, { active: false });
}

export function watchServices(
  db: Firestore,
  opts: { activeOnly?: boolean } | undefined,
  cb: (rows: Service[]) => void
) {
  const base = collection(db, 'services');
  // Limit services query to 100 (most businesses have < 50 services)
  const qy = opts?.activeOnly
    ? query(base, where('active', '==', true), orderBy('name', 'asc'), limit(100))
    : query(base, orderBy('name', 'asc'), limit(100));
  return onSnapshot(qy, (snap) => {
    const rows: Service[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(rows);
  });
}

// ========================= Customers =========================
export async function createCustomer(db: Firestore, input: Partial<Customer>): Promise<string> {
  const ref = input.id ? doc(db, 'customers', input.id) : doc(collection(db, 'customers'));
  // Use merge: false for new customers to trigger 'create' rule, not 'update' rule
  await setDoc(
    ref,
    {
      name: input.name || 'Unnamed',
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      status: input.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: false }
  );
  return ref.id;
}

export async function updateCustomer(db: Firestore, id: string, patch: Partial<Customer>) {
  const ref = doc(db, 'customers', id);
  await updateDoc(ref, {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email ?? null } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone ?? null } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes ?? null } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.lastVisit !== undefined ? { lastVisit: patch.lastVisit ?? null } : {}),
    ...(patch.totalVisits !== undefined ? { totalVisits: patch.totalVisits ?? 0 } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCustomer(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'customers', id));
  // Soft-delete alternative -> await updateCustomer(db, id, { status: 'blocked' });
}

export async function findCustomerByEmail(db: Firestore, email: string): Promise<Customer | null> {
  const qy = query(collection(db, 'customers'), where('email', '==', email), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as Customer;
}

export async function findCustomerByPhone(db: Firestore, phone: string): Promise<Customer | null> {
  const qy = query(collection(db, 'customers'), where('phone', '==', phone), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as Customer;
}

export function watchCustomers(db: Firestore, term: string | undefined, cb: (rows: Customer[]) => void) {
  const base = collection(db, 'customers');
  const searchTerm = term?.trim().toLowerCase() || '';

  // Fetch limited customers and filter client-side for case-insensitive search
  // Limit to 500 to reduce read costs (configurable based on needs)
  const all = query(base, orderBy('name', 'asc'), limit(500));
  return onSnapshot(all, (snap) => {
    let customers = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as Customer);
    
    // Case-insensitive filtering
    if (searchTerm) {
      customers = customers.filter(c => 
        c.name?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.phone?.includes(searchTerm)
      );
    }
    
    cb(customers);
  });
}

// ========================= Appointments =========================
export async function listAppointmentsInRange(db: Firestore, startISO: string, endISO: string): Promise<Appointment[]> {
  // Limit appointment queries to 1000 (prevents excessive reads on large date ranges)
  const qy = query(collection(db, 'appointments'), where('start', '>=', startISO), where('start', '<', endISO), orderBy('start', 'asc'), limit(1000));
  const snap = await getDocs(qy);
  const out: Appointment[] = [];
  snap.forEach((d) => {
    const a = { id: d.id, ...(d.data() as any) } as Appointment;
    if (a.status !== 'cancelled') out.push(a);
  });
  return out;
}

export function watchAppointmentsByDay(db: Firestore, day: Date, cb: (rows: Appointment[]) => void) {
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);
  // Limit daily appointments to 200 (more than enough for a single day)
  const qy = query(collection(db, 'appointments'), where('start', '>=', start.toISOString()), where('start', '<=', end.toISOString()), orderBy('start', 'asc'), limit(200));
  return onSnapshot(qy, (snap) => {
    const out: Appointment[] = [];
    snap.forEach((d) => {
      const a = { id: d.id, ...(d.data() as any) } as Appointment;
      if (a.status !== 'cancelled') out.push(a);
    });
    cb(out);
  }, (error) => {
    // Handle permission errors gracefully - if user doesn't have permission, return empty array
    console.warn('Error watching appointments:', error);
    if (error.code === 'permission-denied') {
      console.log('Permission denied for appointments - returning empty array for availability calculation');
      cb([]);
    } else {
      // For other errors, still return empty array to prevent UI breaking
      cb([]);
    }
  });
}

export async function createAppointmentTx(
  db: Firestore,
  input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & { autoConfirm?: boolean }
): Promise<string> {
  // Compute range
  const startMs = new Date(input.start).getTime();
  if (!Number.isFinite(startMs)) throw new Error('Invalid start');
  const endMs = startMs + input.duration * 60_000;
  const startISO = new Date(startMs).toISOString();
  const endISO = new Date(endMs).toISOString();

  // ±duration window to catch neighbors
  const windowStartISO = new Date(startMs - input.duration * 60_000).toISOString();
  const windowEndISO = endISO;

  const base = collection(db, 'appointments');
  const q1 = query(base, where('start', '>=', windowStartISO), where('start', '<', windowEndISO));
  const q2 = query(base, where('start', '>=', startISO), where('start', '<', endISO));

  const candidateIds: Record<string, true> = {};

  return await runTransaction(db, async (tx) => {
    const s1 = await getDocs(q1); s1.forEach((d) => { candidateIds[d.id] = true; });
    const s2 = await getDocs(q2); s2.forEach((d) => { candidateIds[d.id] = true; });

    // Re-check inside tx to avoid race
    for (const id of Object.keys(candidateIds)) {
      const aref = doc(db, 'appointments', id);
      const snap = await tx.get(aref);
      if (!snap.exists()) continue;
      const a = snap.data() as any;
      if (a.status === 'cancelled') continue;
      const aStart = new Date(a.start).getTime();
      const aEnd = aStart + (a.duration || 0) * 60_000;
      if (aStart < endMs && aEnd > startMs) throw new Error(E_OVERLAP);
    }

    const newRef = doc(collection(db, 'appointments'));
    const payload: any = {
      customerId: input.customerId,
      serviceId: input.serviceId,
      start: startISO,
      duration: input.duration,
      status: input.status || 'pending',
      notes: input.notes || null,
      bookedPrice: input.bookedPrice ?? null,
      autoConfirm: (input as any).autoConfirm ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    tx.set(newRef, payload);
    return newRef.id;
  });
}

// ========================= Settings =========================
export function watchAnalyticsTargets(db: Firestore, cb: (v: AnalyticsTargets) => void) {
  const ref = doc(db, 'settings', 'analyticsTargets');
  return onSnapshot(ref, (d) => cb((d.data() as any) as AnalyticsTargets));
}

export async function setAnalyticsTargets(db: Firestore, v: AnalyticsTargets) {
  const ref = doc(db, 'settings', 'analyticsTargets');
  await setDoc(ref, { ...v, updatedAt: serverTimestamp() }, { merge: true });
}

export function watchBusinessHours(db: Firestore, cb: (v: BusinessHours) => void) {
  const ref = doc(db, 'settings', 'businessHours');
  return onSnapshot(ref, (d) => {
    const data = d.data();
    
    if (!data) {
      // Return default business hours if no data exists
      cb({
        timezone: 'America/Los_Angeles',
        slotInterval: 15,
        slots: {
          sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
        }
      });
      return;
    }
    
    // Convert Firestore format back to BusinessHours format
    const businessHours: BusinessHours = {
      timezone: data.timezone || 'America/Los_Angeles',
      slotInterval: data.slotInterval || 15,
      slots: {
        sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
      }
    };
    
    // Handle new format (with slots and ranges)
    if (data.slots) {
      Object.entries(data.slots).forEach(([day, dayData]: [string, any]) => {
        if (dayData && dayData.ranges && Array.isArray(dayData.ranges)) {
          businessHours.slots[day as keyof BusinessHours['slots']] = dayData.ranges.map((r: any) => [r.start, r.end] as [string, string]);
        }
      });
    }
    // Handle old format (with monday, tuesday, etc.)
    else if (data.monday !== undefined || data.tuesday !== undefined) {
      const dayMapping = {
        monday: 'mon',
        tuesday: 'tue',
        wednesday: 'wed',
        thursday: 'thu',
        friday: 'fri',
        saturday: 'sat',
        sunday: 'sun'
      };
      
      Object.entries(dayMapping).forEach(([oldDay, newDay]) => {
        const dayData = data[oldDay];
        if (dayData && dayData.open && dayData.close) {
          businessHours.slots[newDay as keyof BusinessHours['slots']] = [[dayData.open, dayData.close]];
        }
      });
    }
    
    cb(businessHours);
  });
}

export async function setBusinessHours(db: Firestore, v: BusinessHours) {
  const ref = doc(db, 'settings', 'businessHours');
  
  // Convert nested arrays to Firestore-compatible format
  const firestoreData = {
    timezone: v.timezone,
    slotInterval: v.slotInterval,
    slots: Object.fromEntries(
      Object.entries(v.slots).map(([day, ranges]) => [
        day,
        {
          ranges: ranges.map(([start, end]) => ({ start, end }))
        }
      ])
    ),
    updatedAt: serverTimestamp()
  };
  
  await setDoc(ref, firestoreData, { merge: true });
}

// ========================= Business Info =========================
export function watchBusinessInfo(db: Firestore, cb: (info: BusinessInfo) => void) {
  const ref = doc(db, 'settings', 'businessInfo');
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb({
        name: 'BUENO BROWS',
        address: '315 9th Ave',
        city: 'San Mateo',
        state: 'CA',
        zip: '94401',
        phone: '(650) 613-8455',
        email: 'hello@buenobrows.com',
        instagram: 'buenobrows',
        tiktok: 'buenobrows'
      });
      return;
    }
    cb(snap.data() as BusinessInfo);
  });
}

export async function setBusinessInfo(db: Firestore, info: BusinessInfo) {
  const ref = doc(db, 'settings', 'businessInfo');
  await setDoc(ref, { ...info, updatedAt: serverTimestamp() }, { merge: true });
}

// ========================= Homepage Content =========================
export function watchHomePageContent(db: Firestore, cb: (content: HomePageContent) => void) {
  const ref = doc(db, 'settings', 'homePageContent');
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb({
        heroTitle: 'Refined. Natural. You.',
        heroSubtitle: 'Filipino-inspired beauty studio specializing in brows & lashes. Thoughtfully scheduled, never rushed.',
        ctaPrimary: 'Book now',
        ctaSecondary: 'See services',
        aboutText: 'At BUENO BROWS, we believe beauty is personal. Our Filipino-inspired approach combines precision with warmth, creating results that enhance your natural features.',
        buenoCircleEnabled: true,
        buenoCircleTitle: 'Join the Bueno Circle',
        buenoCircleDescription: 'Get 10% off your first appointment and exclusive updates!',
        buenoCircleDiscount: 10
      });
      return;
    }
    cb(snap.data() as HomePageContent);
  });
}

export async function setHomePageContent(db: Firestore, content: HomePageContent) {
  const ref = doc(db, 'settings', 'homePageContent');
  await setDoc(ref, { ...content, updatedAt: serverTimestamp() }, { merge: true });
}

// ========================= Appointment Edit Requests =========================

export async function createAppointmentEditRequest(
  db: Firestore,
  input: Omit<AppointmentEditRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = doc(collection(db, 'appointmentEditRequests'));
  await setDoc(ref, {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAppointmentEditRequest(
  db: Firestore,
  id: string,
  updates: Partial<AppointmentEditRequest>
): Promise<void> {
  const ref = doc(db, 'appointmentEditRequests', id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export function watchAppointmentEditRequests(
  db: Firestore,
  cb: (requests: AppointmentEditRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'appointmentEditRequests'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const requests: AppointmentEditRequest[] = [];
    snap.forEach((d) => {
      requests.push({ id: d.id, ...(d.data() as any) });
    });
    cb(requests);
  });
}

export function watchAppointmentEditRequestsByCustomer(
  db: Firestore,
  customerId: string,
  cb: (requests: AppointmentEditRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'appointmentEditRequests'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const requests: AppointmentEditRequest[] = [];
    snap.forEach((d) => {
      requests.push({ id: d.id, ...(d.data() as any) });
    });
    cb(requests);
  });
}
