import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

import AuthGate from '@/components/AuthGate';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Services from '@/components/Services';
import Calendar from '@/components/Calendar';
import Customers from '@/components/Customers';
import BookingsView from '@/components/BookingsView';
import ServiceModal from '@/components/ServiceModal';
import AddAppointmentModal from '@/components/AddAppointmentModal';
import CustomerModal from '@/components/CustomerModal';
import CustomerDetailsModal from '@/components/CustomerDetailsModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Notification from '@/components/Notification';
import AnalyticsHome from '@/components/AnalyticsHome.jsx';
import SettingsTab from '@/components/SettingsTab.jsx';

// 👉 import root-level actions directly (no shims)
import * as actions from '@/firebaseActions';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const serviceCategories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => set.add((s?.category || '').trim() || 'Uncategorized'));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [initialDateForModal, setInitialDateForModal] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const [confirmation, setConfirmation] = useState({ message: '', onConfirm: null });

  // ─────────────────────────── Auth ───────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setIsAuthReady(!!u);
    });
    return () => unsub();
  }, []);

  // ─────────────────────── Firestore listeners ───────────────────────
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const svcRef = collection(db, 'services');
    const custRef = collection(db, 'customers');
    const apptRef = collection(db, 'appointments');

    const unsubServices = onSnapshot(svcRef, (snap) => setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubCustomers = onSnapshot(custRef, (snap) => setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubAppts = onSnapshot(apptRef, (snap) => setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

    return () => { unsubServices(); unsubCustomers(); unsubAppts(); };
  }, [isAuthReady, user]);

  // ───────────────────────── Handlers ─────────────────────────
  const notify = (message, type = 'info') => setNotification({ message, type });

  const openNewAppointment = (date = null) => {
    const base = date || selectedDate || new Date();
    setInitialDateForModal(base);
    setEditingAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  // APPOINTMENTS (shimless)
  const handleSaveAppointment = async ({
    customerId,
    customerName,
    serviceId,
    serviceName,
    date, // JS Date
    notes,
    status = 'confirmed',
    duration,
    bookedPrice,
    id = null,
  }) => {
    try {
      // Optimistic close to avoid overlap flash
      setIsAppointmentModalOpen(false);
      setInitialDateForModal(null);
      setEditingAppointment(null);

      const startISO = (date instanceof Date) ? date.toISOString() : String(date);

      if (id) {
        await actions.updateAppointment(id, {
          startISO,
          duration: duration || 60,
          notes: notes || '',
          serviceId,
          customerId,
          status,
          bookedPrice: typeof bookedPrice === 'number' ? bookedPrice : undefined,
        });
        notify('Appointment updated', 'success');
      } else {
        await actions.createAppointment({
          customerId,
          serviceId,
          startISO,
          duration: duration || 60,
          notes: notes || '',
          status,
          bookedPrice: typeof bookedPrice === 'number' ? bookedPrice : undefined,
        });
        notify('Appointment booked', 'success');
      }
    } catch (err) {
      setIsAppointmentModalOpen(true);
      notify(err?.message || 'Failed to save appointment', 'error');
    }
  };

  // CUSTOMERS (shimless)
  const handleSaveCustomer = async (payload, id = null) => {
    try {
      await actions.createOrUpdateCustomer({ ...(payload || {}), id: id || undefined });
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      notify(id ? 'Customer updated' : 'Customer added', 'success');
    } catch (e) {
      console.error(e);
      notify('Failed to save customer', 'error');
    }
  };

  // SERVICES (shimless)
  const handleSaveService = async (payload, id = null) => {
    try {
      await actions.upsertService({ ...(payload || {}), id: id || undefined });
      setIsServiceModalOpen(false);
      setEditingService(null);
      notify(id ? 'Service updated' : 'Service added', 'success');
    } catch (e) {
      console.error(e);
      notify('Failed to save service', 'error');
    }
  };

  // Deletes (shimless)
  const handleDeleteAppointment = async (appointmentId) => {
    try { await actions.realDeleteAppointment(appointmentId); notify('Appointment deleted', 'success'); }
    catch (e) { console.error(e); notify('Failed to delete appointment', 'error'); }
  };

  const handleDeleteCustomer = async (customerId) => {
    try { await actions.realDeleteCustomerAndAppointments(customerId); setSelectedCustomer(null); notify('Customer deleted', 'success'); }
    catch (e) { console.error(e); notify('Failed to delete customer', 'error'); }
  };

  const handleDeleteService = async (serviceId) => {
    try { await actions.realDeleteService(serviceId); setEditingService(null); notify('Service deleted', 'success'); }
    catch (e) { console.error(e); notify('Failed to delete service', 'error'); }
  };

  const onOpenCustomer = (customerId) => {
    const cust = customers.find((c) => String(c.id) === String(customerId));
    if (cust) setSelectedCustomer(cust);
    setActiveTab('customers');
  };

  const onOpenBooking = (appointmentId) => {
    const appt = appointments.find((a) => String(a.id) === String(appointmentId));
    if (!appt) return;
    setEditingAppointment(appt);
    const iso = appt.date || appt.start;
    setInitialDateForModal(iso ? new Date(iso) : new Date());
    setIsAppointmentModalOpen(true);
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setUser(null); setIsAuthReady(false); } catch (e) { console.error(e); }
  };

  // ─────────────────────────── UI ───────────────────────────
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleSignOut} />
        <div className="flex-1 flex flex-col">
          <Header user={user} onSignOut={handleSignOut} />
          <main className="p-4 md:p-6 space-y-6">
            {activeTab === 'home' && (
              <AnalyticsHome appointments={appointments} services={services} customers={customers} />
            )}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <Calendar
                  appointments={appointments}
                  customers={customers}
                  services={services}
                  onAddAppointment={openNewAppointment}
                  onOpenCustomer={onOpenCustomer}
                  onOpenBooking={onOpenBooking}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                <BookingsView
                  appointments={appointments}
                  selectedDate={selectedDate}
                  onDeleteAppointment={handleDeleteAppointment}
                  onEditAppointment={(appt) => onOpenBooking(appt.id)}
                />
              </div>
            )}
            {activeTab === 'services' && (
              <Services
                services={services}
                categories={serviceCategories}
                customersCount={customers.length}
                appointmentsCount={appointments.length}
                onAddService={() => { setEditingService(null); setIsServiceModalOpen(true); }}
                onEditService={(svc) => { setEditingService(svc); setIsServiceModalOpen(true); }}
                onDeleteService={handleDeleteService}
              />
            )}
            {activeTab === 'customers' && (
              <Customers
                customers={customers}
                onAddCustomer={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
                onEditCustomer={(cust) => { setEditingCustomer(cust); setIsCustomerModalOpen(true); }}
                onDeleteCustomer={handleDeleteCustomer}
                onViewCustomer={(cust) => setSelectedCustomer(cust)}
              />
            )}
            {activeTab === 'settings' && (<SettingsTab />)}
          </main>
        </div>

        {/* Modals */}
        {isServiceModalOpen && (
          <ServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => { setIsServiceModalOpen(false); setEditingService(null); }}
            onSave={(payload) => handleSaveService(payload, editingService?.id)}
            service={editingService}
            categories={serviceCategories}
          />
        )}

        {isCustomerModalOpen && (
          <CustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            initialData={editingCustomer}
            customers={customers}
            onSave={handleSaveCustomer}
          />
        )}

        {!!selectedCustomer && (
          <CustomerDetailsModal
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            customer={selectedCustomer}
            appointments={appointments.filter((a) => String(a.customerId) === String(selectedCustomer.id))}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {isAppointmentModalOpen && (
          <AddAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => { setIsAppointmentModalOpen(false); setInitialDateForModal(null); setEditingAppointment(null); }}
            onSave={handleSaveAppointment}
            customers={customers}
            services={services}
            appointments={appointments}
            initialDate={initialDateForModal}
            appointment={editingAppointment}
          />
        )}

        {confirmation.onConfirm && (
          <ConfirmationModal
            message={confirmation.message}
            onConfirm={() => { confirmation.onConfirm?.(); setConfirmation({ message: '', onConfirm: null }); }}
            onCancel={() => setConfirmation({ message: '', onConfirm: null })}
          />
        )}
        {!!notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            duration={3500}
            position="top-right"
            onClose={() => setNotification({ message: '', type: 'info' })}
          />
        )}
      </div>
    </AuthGate>
  );
}

export default App;