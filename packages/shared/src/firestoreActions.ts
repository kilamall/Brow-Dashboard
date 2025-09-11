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
import type { Appointment, AnalyticsTargets, BusinessHours, Customer, Service } from './types';

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
  const qy = opts?.activeOnly
    ? query(base, where('active', '==', true), orderBy('name', 'asc'))
    : query(base, orderBy('name', 'asc'));
  return onSnapshot(qy, (snap) => {
    const rows: Service[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(rows);
  });
}

// ========================= Customers =========================
export async function createCustomer(db: Firestore, input: Partial<Customer>): Promise<string> {
  const ref = input.id ? doc(db, 'customers', input.id) : doc(collection(db, 'customers'));
  await setDoc(
    ref,
    {
      name: input.name || 'Unnamed',
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      status: input.status || 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
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

export function watchCustomers(db: Firestore, term: string | undefined, cb: (rows: Customer[]) => void) {
  const base = collection(db, 'customers');

  // Email exact
  if (term && term.includes('@')) {
    const byEmail = query(base, where('email', '==', term));
    return onSnapshot(byEmail, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
  }

  // Name prefix
  if (term && term.trim().length >= 2) {
    const t = term.trim();
    const byName = query(base, where('name', '>=', t), where('name', '<=', t + '\uf8ff'), orderBy('name', 'asc'), limit(50));
    return onSnapshot(byName, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
  }

  // Default list (cap length)
  const all = query(base, orderBy('name', 'asc'), limit(200));
  return onSnapshot(all, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
}

// ========================= Appointments =========================
export async function listAppointmentsInRange(db: Firestore, startISO: string, endISO: string): Promise<Appointment[]> {
  const qy = query(collection(db, 'appointments'), where('start', '>=', startISO), where('start', '<', endISO), orderBy('start', 'asc'));
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
  const qy = query(collection(db, 'appointments'), where('start', '>=', start.toISOString()), where('start', '<=', end.toISOString()), orderBy('start', 'asc'));
  return onSnapshot(qy, (snap) => {
    const out: Appointment[] = [];
    snap.forEach((d) => {
      const a = { id: d.id, ...(d.data() as any) } as Appointment;
      if (a.status !== 'cancelled') out.push(a);
    });
    cb(out);
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
      status: input.status || 'confirmed',
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
  return onSnapshot(ref, (d) => cb((d.data() as any) as BusinessHours));
}

export async function setBusinessHours(db: Firestore, v: BusinessHours) {
  const ref = doc(db, 'settings', 'businessHours');
  await setDoc(ref, { ...v, updatedAt: serverTimestamp() }, { merge: true });
}
