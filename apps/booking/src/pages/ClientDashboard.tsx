import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import { format, parseISO } from 'date-fns';

export default function ClientDashboard() {
  const { db } = useFirebase();
  const auth = getAuth();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);
  const [hasCustomerRecord, setHasCustomerRecord] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        nav('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, nav]);

  // Fetch customer's appointments
  useEffect(() => {
    if (!user?.email) return;

    let unsubscribeAppointments: (() => void) | null = null;

    // Find customer by email
    const customersRef = collection(db, 'customers');
    const customerQuery = query(customersRef, where('email', '==', user.email));

    const unsubscribeCustomer = onSnapshot(customerQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log('No customer found for email:', user.email);
        setAppointments([]);
        setHasCustomerRecord(false);
        return;
      }

      const customerId = snapshot.docs[0].id;
      console.log('Found customer:', customerId);
      setHasCustomerRecord(true);

      // Fetch appointments for this customer
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('customerId', '==', customerId)
      );

      unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const appts: Appointment[] = [];
        snapshot.forEach((doc) => {
          appts.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        console.log('Fetched appointments:', appts.length);
        setAppointments(appts);
      });
    });

    return () => {
      unsubscribeCustomer();
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, [user, db]);

  // Fetch services
  useEffect(() => {
    const servicesRef = collection(db, 'services');
    const unsubscribe = onSnapshot(servicesRef, (snapshot) => {
      const servicesMap: Record<string, Service> = {};
      snapshot.forEach((doc) => {
        servicesMap[doc.id] = { id: doc.id, ...doc.data() } as Service;
      });
      setServices(servicesMap);
    });

    return () => unsubscribe();
  }, [db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      nav('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const upcomingAppointments = appointments
    .filter((apt) => apt.status !== 'cancelled' && new Date(apt.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const pastAppointments = appointments
    .filter((apt) => new Date(apt.start) < new Date())
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const cancelledAppointments = appointments.filter((apt) => apt.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif text-terracotta">My Appointments</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {user?.displayName || user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => nav('/book')}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Book New
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-serif text-terracotta mb-4">Upcoming</h2>
          {!hasCustomerRecord ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-slate-600 mb-4">You haven't made a booking yet</p>
              <button
                onClick={() => nav('/book')}
                className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-slate-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border-2 border-terracotta/30 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-cream/30"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        {/* Service Name & Status */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xl text-slate-900">
                            {service?.name || 'Service'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Service Description */}
                        {service?.description && (
                          <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                        )}

                        {/* Date & Time */}
                        <div className="mb-3">
                          <p className="text-slate-700 font-medium">
                            📅 {format(parseISO(apt.start), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-slate-600 text-sm mt-1">
                            🕐 {format(parseISO(apt.start), 'h:mm a')}
                          </p>
                        </div>

                        {/* Duration & Price */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {service?.duration || 0} min
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-terracotta">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-4 py-2 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors font-medium flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {hasCustomerRecord && pastAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-serif text-terracotta mb-4">Past Appointments</h2>
            <div className="space-y-4">
              {pastAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border border-slate-300 rounded-xl p-5 bg-slate-50/50"
                  >
                    <div className="flex-grow">
                      {/* Service Name */}
                      <h3 className="font-semibold text-lg text-slate-800 mb-2">
                        {service?.name || 'Service'}
                      </h3>

                      {/* Service Description */}
                      {service?.description && (
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                      )}

                      {/* Date & Time */}
                      <div className="mb-3">
                        <p className="text-slate-700 font-medium">
                          📅 {format(parseISO(apt.start), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          🕐 {format(parseISO(apt.start), 'h:mm a')}
                        </p>
                      </div>

                      {/* Duration & Price */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service?.duration || 0} min
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Appointments */}
        {hasCustomerRecord && cancelledAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-serif text-terracotta mb-4">Cancelled</h2>
            <div className="space-y-4">
              {cancelledAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border border-red-200 rounded-xl p-5 bg-red-50/30 opacity-75"
                  >
                    <div className="flex-grow">
                      {/* Service Name & Cancelled Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {service?.name || 'Service'}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      </div>

                      {/* Service Description */}
                      {service?.description && (
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                      )}

                      {/* Date & Time */}
                      <div className="mb-3">
                        <p className="text-slate-700 font-medium">
                          📅 {format(parseISO(apt.start), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          🕐 {format(parseISO(apt.start), 'h:mm a')}
                        </p>
                      </div>

                      {/* Duration & Price */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service?.duration || 0} min
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

