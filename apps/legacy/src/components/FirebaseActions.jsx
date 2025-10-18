// src/firebaseActions.js (shimless)
// Root collections: services, customers, appointments
// Settings: settings/analyticsTargets

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';

const C = {
  services: 'services',
  customers: 'customers',
  appointments: 'appointments',
};

// ───────────────────────── SERVICES ─────────────────────────
export async function listServices() {
  const snap = await getDocs(collection(db, C.services));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function upsertService(service) {
  const payload = {
    name: service.name || '',
    price: Number(service.price ?? 0),
    duration: Number(service.duration ?? 60),
    category: service.category || '',
    description: service.description || '',
    active: service.active ?? true,
    updatedAt: serverTimestamp(),
  };
  if (service.id) {
    await setDoc(doc(db, C.services, service.id), payload, { merge: true });
    return service.id;
  }
  const ref = await addDoc(collection(db, C.services), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function realDeleteService(id) {
  await deleteDoc(doc(db, C.services, id));
}

// ───────────────────────── CUSTOMERS ─────────────────────────
export async function listCustomers() {
  const snap = await getDocs(collection(db, C.customers));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createOrUpdateCustomer(customer) {
  const payload = {
    name: (customer.name || '').trim(),
    email: customer.email || '',
    phone: customer.phone || '',
    status: customer.status || 'pending',
    notes: customer.notes || '',
    updatedAt: serverTimestamp(),
  };
  if (customer.id) {
    await setDoc(doc(db, C.customers, customer.id), payload, { merge: true });
    return customer.id;
  }
  const ref = await addDoc(collection(db, C.customers), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function realDeleteCustomerAndAppointments(customerId) {
  await deleteDoc(doc(db, C.customers, customerId));
  const q1 = query(collection(db, C.appointments), where('customerId', '==', customerId));
  const snap = await getDocs(q1);
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, C.appointments, d.id))));
}

// ───────────────────────── APPOINTMENTS ─────────────────────────
export async function listAppointments() {
  const snap = await getDocs(collection(db, C.appointments));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAppointment({ customerId, serviceId, startISO, duration, notes, status = 'confirmed', bookedPrice }) {
  const ref = await addDoc(collection(db, C.appointments), {
    customerId,
    serviceId,
    start: startISO,
    duration: Number(duration) || 60,
    status,
    notes: notes || '',
    bookedPrice: typeof bookedPrice === 'number' ? bookedPrice : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAppointment(id, patch) {
  const payload = { ...patch, updatedAt: serverTimestamp() };
  // normalize: allow callers to pass `startISO` or `start`
  if (payload.startISO) { payload.start = payload.startISO; delete payload.startISO; }
  await updateDoc(doc(db, C.appointments, id), payload);
}

export async function realDeleteAppointment(id) {
  await deleteDoc(doc(db, C.appointments, id));
}

// ───────────────────────── SETTINGS: Analytics Targets ─────────────────────────
// Firestore doc: settings/analyticsTargets
// Shape: { dailyTarget: number, weeklyTarget: number, monthlyTarget: number, defaultCogsRate?: number }
export async function getAnalyticsTargets() {
  const ref = doc(db, 'settings', 'analyticsTargets');
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveAnalyticsTargets({ dailyTarget = 0, weeklyTarget = 0, monthlyTarget = 0, defaultCogsRate = 0 }) {
  const ref = doc(db, 'settings', 'analyticsTargets');
  await setDoc(
    ref,
    {
      dailyTarget: Number(dailyTarget) || 0,
      weeklyTarget: Number(weeklyTarget) || 0,
      monthlyTarget: Number(monthlyTarget) || 0,
      defaultCogsRate: Number(defaultCogsRate) || 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return true;
}
