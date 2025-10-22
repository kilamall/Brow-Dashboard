import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Appointment, Service } from '@buenobrows/shared/types';
import { format } from 'date-fns';

interface UpcomingAppointmentsProps {
  className?: string;
}

export default function UpcomingAppointments({ className = '' }: UpcomingAppointmentsProps) {
  const { db } = useFirebase();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load services
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

  // Load upcoming appointments (next 7 days)
  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('start', '>=', now.toISOString()),
      where('start', '<=', nextWeek.toISOString()),
      orderBy('start', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsList: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appointmentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to confirm this appointment?')) return;

    setConfirmingIds(prev => new Set(prev).add(appointmentId));

    try {
      const functions = getFunctions();
      const confirmAppointment = httpsCallable(functions, 'confirmAppointment');
      
      await confirmAppointment({ appointmentId });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' }
            : apt
        )
      );

      alert('Appointment confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      alert(error.message || 'Failed to confirm appointment. Please try again.');
    } finally {
      setConfirmingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'cancelled' });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );

      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          📅 Upcoming Appointments
        </h3>
        <p className="text-slate-600">No upcoming appointments in the next 7 days.</p>
        <div className="mt-4">
          <a 
            href="/book" 
            className="inline-flex items-center gap-2 bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors"
          >
            Book an Appointment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        📅 Upcoming Appointments ({appointments.length})
      </h3>
      
      <div className="space-y-4">
        {appointments.map((appointment) => {
          const service = services[appointment.serviceId];
          const appointmentDate = new Date(appointment.start);
          const isConfirming = confirmingIds.has(appointment.id);
          
          return (
            <div 
              key={appointment.id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getStatusIcon(appointment.status)}</span>
                    <h4 className="font-semibold text-slate-800">
                      {service?.name || 'Unknown Service'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><strong>Date:</strong> {format(appointmentDate, 'EEEE, MMMM d, yyyy')}</p>
                    <p><strong>Time:</strong> {format(appointmentDate, 'h:mm a')}</p>
                    <p><strong>Duration:</strong> {appointment.duration} minutes</p>
                    {appointment.totalPrice && (
                      <p><strong>Price:</strong> ${appointment.totalPrice.toFixed(2)}</p>
                    )}
                    {appointment.customerName && (
                      <p><strong>Customer:</strong> {appointment.customerName}</p>
                    )}
                  </div>
                </div>
              </div>

              {appointment.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleConfirmAppointment(appointment.id)}
                    disabled={isConfirming}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isConfirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Confirming...
                      </>
                    ) : (
                      <>
                        ✅ Confirm Appointment
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ This appointment has been confirmed and is ready to go!
                  </p>
                </div>
              )}

              {appointment.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">
                    ❌ This appointment has been cancelled.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <a 
          href="/book" 
          className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 font-semibold"
        >
          Book Another Appointment
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
