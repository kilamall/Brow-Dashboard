import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import type { Appointment, AppointmentEditRequest, AnalyticsTargets, BusinessHours, Customer, Service, ServiceCategory, BusinessInfo, HomePageContent, Staff, DayClosure, SpecialHours, Promotion, PromotionUsage, BirthdayPromoUsage } from './types';

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
    imageUrl: input.imageUrl ?? null,
    isPopular: input.isPopular ?? false,
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
    ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl ?? null } : {}),
    ...(patch.isPopular !== undefined ? { isPopular: !!patch.isPopular } : {}),
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

// ========================= Service Categories =========================
function assertServiceCategory(input: Partial<ServiceCategory>) {
  if (!input.name || !input.name.trim()) throw new Error('Category name is required');
  if (!input.color || !input.color.trim()) throw new Error('Category color is required');
}

export async function createServiceCategory(
  db: Firestore,
  input: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  assertServiceCategory(input);
  
  const ref = doc(collection(db, 'serviceCategories'));
  await setDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateServiceCategory(
  db: Firestore,
  id: string,
  input: Partial<Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  if (input.name !== undefined || input.color !== undefined) {
    assertServiceCategory(input);
  }
  
  const ref = doc(db, 'serviceCategories', id);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteServiceCategory(db: Firestore, id: string): Promise<void> {
  const ref = doc(db, 'serviceCategories', id);
  await deleteDoc(ref);
}

export function watchServiceCategories(
  db: Firestore,
  cb: (categories: ServiceCategory[]) => void
): () => void {
  const q = query(collection(db, 'serviceCategories'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    const categories: ServiceCategory[] = [];
    snap.forEach((d) => categories.push({ id: d.id, ...(d.data() as any) }));
    cb(categories);
  });
}

// ========================= Promotions =========================

export async function createPromotion(
  db: Firestore,
  input: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = doc(collection(db, 'promotions'));
  await setDoc(ref, {
    ...input,
    usedCount: 0,
    totalDiscountGiven: 0,
    customerUsageCount: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePromotion(
  db: Firestore,
  id: string,
  patch: Partial<Promotion>
): Promise<void> {
  const ref = doc(db, 'promotions', id);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePromotion(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'promotions', id));
}

export function watchPromotions(
  db: Firestore,
  cb: (promotions: Promotion[]) => void
): () => void {
  const q = query(collection(db, 'promotions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const promotions: Promotion[] = [];
    snap.forEach((d) => promotions.push({ id: d.id, ...(d.data() as any) }));
    cb(promotions);
  });
}

export async function recordPromotionUsage(
  db: Firestore,
  input: Omit<PromotionUsage, 'id' | 'appliedAt'>
): Promise<string> {
  const ref = doc(collection(db, 'promotionUsage'));
  await setDoc(ref, {
    ...input,
    appliedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function recordBirthdayPromoUsage(
  db: Firestore,
  input: Omit<BirthdayPromoUsage, 'id'>
): Promise<string> {
  const ref = doc(collection(db, 'birthdayPromoUsage'));
  await setDoc(ref, input);
  return ref.id;
}

export async function getPromotionUsageCount(
  db: Firestore,
  promotionId: string
): Promise<number> {
  const q = query(
    collection(db, 'promotionUsage'),
    where('promotionId', '==', promotionId)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function getCustomerPromotionUsageCount(
  db: Firestore,
  promotionId: string,
  customerId: string
): Promise<number> {
  const q = query(
    collection(db, 'promotionUsage'),
    where('promotionId', '==', promotionId),
    where('customerId', '==', customerId)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function hasUsedBirthdayPromoThisYear(
  db: Firestore,
  promotionId: string,
  customerId: string,
  year: number
): Promise<boolean> {
  const q = query(
    collection(db, 'birthdayPromoUsage'),
    where('customerId', '==', customerId),
    where('promotionId', '==', promotionId),
    where('birthdayYear', '==', year)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
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
      birthday: input.birthday || null,
      profilePictureUrl: input.profilePictureUrl || null,
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
    ...(patch.birthday !== undefined ? { birthday: patch.birthday ?? null } : {}),
    ...(patch.profilePictureUrl !== undefined ? { profilePictureUrl: patch.profilePictureUrl ?? null } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes ?? null } : {}),
    ...(patch.structuredNotes !== undefined ? { structuredNotes: patch.structuredNotes } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.lastVisit !== undefined ? { lastVisit: patch.lastVisit ?? null } : {}),
    ...(patch.totalVisits !== undefined ? { totalVisits: patch.totalVisits ?? 0 } : {}),
    updatedAt: serverTimestamp(),
  });
}

// ========================= Customer Notes Management =========================
export async function addCustomerNote(
  db: Firestore,
  customerId: string,
  note: {
    category: 'general' | 'preferences' | 'allergies' | 'history' | 'special_requests';
    content: string;
    addedBy: string;
  }
): Promise<void> {
  const customerRef = doc(db, 'customers', customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) {
    throw new Error('Customer not found');
  }
  
  const customerData = customerDoc.data() as Customer;
  const existingNotes = customerData.structuredNotes || [];
  
  const newNote = {
    id: crypto.randomUUID(),
    category: note.category,
    content: note.content,
    addedBy: note.addedBy,
    addedAt: new Date().toISOString(),
  };
  
  await updateDoc(customerRef, {
    structuredNotes: [...existingNotes, newNote],
    updatedAt: serverTimestamp(),
  });
}

export async function updateCustomerNote(
  db: Firestore,
  customerId: string,
  noteId: string,
  updates: {
    content?: string;
    category?: 'general' | 'preferences' | 'allergies' | 'history' | 'special_requests';
  }
): Promise<void> {
  const customerRef = doc(db, 'customers', customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) {
    throw new Error('Customer not found');
  }
  
  const customerData = customerDoc.data() as Customer;
  const existingNotes = customerData.structuredNotes || [];
  
  const updatedNotes = existingNotes.map(note => 
    note.id === noteId 
      ? { ...note, ...updates, updatedAt: new Date().toISOString() }
      : note
  );
  
  await updateDoc(customerRef, {
    structuredNotes: updatedNotes,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCustomerNote(
  db: Firestore,
  customerId: string,
  noteId: string
): Promise<void> {
  const customerRef = doc(db, 'customers', customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) {
    throw new Error('Customer not found');
  }
  
  const customerData = customerDoc.data() as Customer;
  const existingNotes = customerData.structuredNotes || [];
  
  const updatedNotes = existingNotes.filter(note => note.id !== noteId);
  
  await updateDoc(customerRef, {
    structuredNotes: updatedNotes,
    updatedAt: serverTimestamp(),
  });
}

// ========================= Customer Data Sync =========================
export async function syncCustomerDataWithAppointment(
  db: Firestore,
  appointmentId: string
): Promise<void> {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  const appointmentDoc = await getDoc(appointmentRef);
  
  if (!appointmentDoc.exists()) {
    throw new Error('Appointment not found');
  }
  
  const appointment = appointmentDoc.data() as Appointment;
  
  if (!appointment.customerId) {
    return; // No customer to sync
  }
  
  const customerRef = doc(db, 'customers', appointment.customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) {
    console.warn('Customer not found for appointment:', appointmentId);
    return;
  }
  
  const customer = customerDoc.data() as Customer;
  
  // Update appointment with latest customer data
  const updates: Partial<Appointment> = {};
  
  if (appointment.customerName !== customer.name) {
    updates.customerName = customer.name;
  }
  
  if (appointment.customerEmail !== customer.email) {
    updates.customerEmail = customer.email;
  }
  
  if (appointment.customerPhone !== customer.phone) {
    updates.customerPhone = customer.phone;
  }
  
  // Only update if there are changes
  if (Object.keys(updates).length > 0) {
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }
}

export async function ensureCustomerDataConsistency(
  db: Firestore,
  customerId: string
): Promise<void> {
  // Get all appointments for this customer
  const appointmentsQuery = query(
    collection(db, 'appointments'),
    where('customerId', '==', customerId)
  );
  
  const appointmentsSnapshot = await getDocs(appointmentsQuery);
  const customerRef = doc(db, 'customers', customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) {
    throw new Error('Customer not found');
  }
  
  const customer = customerDoc.data() as Customer;
  
  // Update all appointments with current customer data
  const batch = [];
  for (const appointmentDoc of appointmentsSnapshot.docs) {
    const appointment = appointmentDoc.data() as Appointment;
    const updates: Partial<Appointment> = {};
    
    if (appointment.customerName !== customer.name) {
      updates.customerName = customer.name;
    }
    
    if (appointment.customerEmail !== customer.email) {
      updates.customerEmail = customer.email;
    }
    
    if (appointment.customerPhone !== customer.phone) {
      updates.customerPhone = customer.phone;
    }
    
    if (Object.keys(updates).length > 0) {
      batch.push(updateDoc(appointmentDoc.ref, {
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    }
  }
  
  // Execute all updates
  if (batch.length > 0) {
    await Promise.all(batch);
  }
}

export async function deleteCustomer(db: Firestore, id: string) {
  try {
    
    // Check if customer exists first
    const customerRef = doc(db, 'customers', id);
    const customerSnap = await getDoc(customerRef);
    
    if (!customerSnap.exists()) {
      throw new Error(`Customer with ID ${id} does not exist`);
    }
    
    // Delete the customer document
    await deleteDoc(customerRef);
    
    
    // Soft-delete alternative -> await updateCustomer(db, id, { status: 'blocked' });
  } catch (error) {
    console.error('❌ deleteCustomer: Error deleting customer:', error);
    throw error; // Re-throw to let the UI handle it
  }
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
    
    // Filter out migrated customers to prevent confusion in admin UI
    // Only show the "canonical" version of each customer (not the migrated duplicates)
    const beforeFilter = customers.length;
    customers = customers.filter(customer => {
      // Hide customers that have been migrated (they're duplicates/old versions)
      const isMigrated = customer.identityStatus === 'migrated' || customer.migratedTo;
      return !isMigrated;
    });
    
    
    
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

    // Fetch customer details to populate in the appointment
    let customerName = (input as any).customerName || null;
    let customerEmail = (input as any).customerEmail || null;
    let customerPhone = (input as any).customerPhone || null;
    
    if (input.customerId && !customerName) {
      const customerRef = doc(db, 'customers', input.customerId);
      const customerSnap = await tx.get(customerRef);
      if (customerSnap.exists()) {
        const customerData = customerSnap.data() as Customer;
        customerName = customerData.name || null;
        customerEmail = customerData.email || null;
        customerPhone = customerData.phone || null;
      }
    }

    const newRef = doc(collection(db, 'appointments'));
    const payload: any = {
      customerId: input.customerId,
      customerName,
      customerEmail,
      customerPhone,
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

    // Include additional fields if provided
    if ((input as any).serviceIds) {
      payload.serviceIds = (input as any).serviceIds;
    }
    if ((input as any).totalPrice !== undefined) {
      payload.totalPrice = (input as any).totalPrice;
    }
    if ((input as any).tip !== undefined) {
      payload.tip = (input as any).tip;
    }
    if ((input as any).isPriceEdited !== undefined) {
      payload.isPriceEdited = (input as any).isPriceEdited;
    }

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
        buenoCircleDiscount: 10,
        eventsHeroTitle: 'Premium Event Packages',
        eventsHeroDescription: 'Transform your corporate events, team gatherings, and special occasions with our curated experiential services. From permanent jewelry to professional makeup artistry, we deliver memorable experiences that elevate any event.',
        eventsFeaturedTitle1: 'Permanent Jewelry',
        eventsFeaturedDescription1: 'Seamless, custom jewelry installations for lasting memories.',
        eventsFeaturedTitle2: 'Professional Makeup',
        eventsFeaturedDescription2: 'Expert artistry for corporate headshots and events.',
        eventsFeaturedTitle3: 'Face Paint & Artistry',
        eventsFeaturedDescription3: 'Creative designs that add vibrancy to any occasion.',
        eventsFeaturedTitle4: 'Curated Experiences',
        eventsFeaturedDescription4: 'Bespoke packages tailored to your event vision.',
        eventsPackagesTitle: 'Available Packages',
        eventsPackagesDescription: 'Explore our curated event packages designed for corporate gatherings, team experiences, and special occasions.',
        eventsCTATitle: 'Elevate Your Next Corporate Event',
        eventsCTADescription: 'Our team specializes in creating memorable experiences for corporate gatherings, team building events, product launches, and networking occasions. Contact us to discuss custom package arrangements tailored to your needs.',
        eventsCTAButton1: 'Schedule Consultation',
        eventsCTAButton2: 'View All Services',
        skinAnalysisEnabled: false,
        skinAnalysisTitle: 'AI Skin Analysis',
        skinAnalysisSubtitle: 'Discover your skin\'s unique needs with our advanced AI technology',
        skinAnalysisDescription: 'Get personalized skincare recommendations based on AI analysis of your skin type and concerns.',
        skinAnalysisCTA: 'Try Skin Analysis'
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

// ========================= Staff Management =========================
function assertStaff(input: Partial<Staff>) {
  if (!input.name || !input.name.trim()) throw new Error('Staff name is required');
  if (!input.role || !input.role.trim()) throw new Error('Staff role is required');
}

export async function createStaff(
  db: Firestore,
  input: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  assertStaff(input);
  
  const ref = doc(collection(db, 'staff'));
  await setDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStaff(
  db: Firestore,
  id: string,
  input: Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  if (input.name !== undefined || input.role !== undefined) {
    assertStaff(input);
  }
  
  const ref = doc(db, 'staff', id);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStaff(db: Firestore, id: string): Promise<void> {
  const ref = doc(db, 'staff', id);
  await deleteDoc(ref);
}

export function watchStaff(
  db: Firestore,
  cb: (staff: Staff[]) => void
): () => void {
  const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    const staff: Staff[] = [];
    snap.forEach((d) => staff.push({ id: d.id, ...(d.data() as any) }));
    cb(staff);
  });
}

// ========================= Day Closures =========================
/**
 * Create a day closure (shop closed for entire day)
 */
export async function createDayClosure(
  db: Firestore,
  input: Omit<DayClosure, 'id' | 'createdAt'>
): Promise<string> {
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  
  const ref = doc(collection(db, 'dayClosures'));
  await setDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Delete a day closure
 */
export async function deleteDayClosure(db: Firestore, id: string): Promise<void> {
  const ref = doc(db, 'dayClosures', id);
  await deleteDoc(ref);
}

/**
 * Get closure for a specific date
 */
export async function getClosureForDate(db: Firestore, date: string): Promise<DayClosure | null> {
  const q = query(
    collection(db, 'dayClosures'),
    where('date', '==', date),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as any) };
}

/**
 * Watch day closures (sorted by date)
 */
export function watchDayClosures(
  db: Firestore,
  cb: (closures: DayClosure[]) => void
): () => void {
  const q = query(collection(db, 'dayClosures'), orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => {
    const closures: DayClosure[] = [];
    snap.forEach((d) => closures.push({ id: d.id, ...(d.data() as any) }));
    cb(closures);
  });
}

/**
 * Get closures for a date range
 */
export async function getClosuresInRange(
  db: Firestore,
  startDate: string,
  endDate: string
): Promise<DayClosure[]> {
  const q = query(
    collection(db, 'dayClosures'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  const closures: DayClosure[] = [];
  snap.forEach((d) => closures.push({ id: d.id, ...(d.data() as any) }));
  return closures;
}

// ========================= Special Hours =========================
/**
 * Set special hours for a specific date
 */
export async function setSpecialHours(
  db: Firestore,
  input: Omit<SpecialHours, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  
  // Check if special hours already exist for this date
  const existing = await getSpecialHoursForDate(db, input.date);
  
  // Convert ranges array to Firestore-compatible format
  const rangesForFirestore = input.ranges.map((range, index) => ({
    start: range[0],
    end: range[1],
    index: index
  }));

  if (existing) {
    // Update existing
    const ref = doc(db, 'specialHours', existing.id);
    await updateDoc(ref, {
      ranges: rangesForFirestore,
      reason: input.reason,
      modifiedBy: input.modifiedBy,
      modifiedAt: input.modifiedAt,
      updatedAt: serverTimestamp(),
    });
    return existing.id;
  } else {
    // Create new
    const ref = doc(collection(db, 'specialHours'));
    await setDoc(ref, {
      date: input.date,
      ranges: rangesForFirestore,
      reason: input.reason,
      modifiedBy: input.modifiedBy,
      modifiedAt: input.modifiedAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }
}

/**
 * Delete special hours for a date
 */
export async function deleteSpecialHours(db: Firestore, id: string): Promise<void> {
  const ref = doc(db, 'specialHours', id);
  await deleteDoc(ref);
}

/**
 * Get special hours for a specific date
 */
export async function getSpecialHoursForDate(db: Firestore, date: string): Promise<SpecialHours | null> {
  const q = query(
    collection(db, 'specialHours'),
    where('date', '==', date),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as any;
  
  // Convert Firestore ranges format back to [string, string][] format
  const ranges: [string, string][] = data.ranges
    ?.sort((a: any, b: any) => a.index - b.index)
    ?.map((range: any) => [range.start, range.end]) || [];
  
  return { 
    id: doc.id, 
    ...data,
    ranges: ranges
  };
}

/**
 * Watch special hours (sorted by date)
 */
export function watchSpecialHours(
  db: Firestore,
  cb: (specialHours: SpecialHours[]) => void
): () => void {
  const q = query(collection(db, 'specialHours'), orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => {
    const specialHours: SpecialHours[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      // Convert Firestore ranges format back to [string, string][] format
      const ranges: [string, string][] = data.ranges
        ?.sort((a: any, b: any) => a.index - b.index)
        ?.map((range: any) => [range.start, range.end]) || [];
      
      specialHours.push({ 
        id: d.id, 
        ...data,
        ranges: ranges
      });
    });
    cb(specialHours);
  });
}

/**
 * Get special hours for a date range
 */
export async function getSpecialHoursInRange(
  db: Firestore,
  startDate: string,
  endDate: string
): Promise<SpecialHours[]> {
  const q = query(
    collection(db, 'specialHours'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  const specialHours: SpecialHours[] = [];
  snap.forEach((d) => specialHours.push({ id: d.id, ...(d.data() as any) }));
  return specialHours;
}
