import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import { format } from 'date-fns';

// Safe date formatter that won't crash
const safeFormatDate = (dateString: any, formatString: string, fallback: string = 'Invalid Date'): string => {
  try {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatString);
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return fallback;
  }
};

interface MyBookingsCardProps {
  className?: string;
}

export default function MyBookingsCard({ className = '' }: MyBookingsCardProps) {
  const { db } = useFirebase();
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [hasCustomerRecord, setHasCustomerRecord] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch customer's appointments
  useEffect(() => {
    if (!user?.uid) {
      setAppointments([]);
      setHasCustomerRecord(false);
      return;
    }

    let unsubscribeAppointments: (() => void) | null = null;

    // ✅ FIXED: Use auth.uid directly as customer ID (matches how we create customers in Login.tsx)
    const custId = user.uid;
    const customerRef = doc(db, 'customers', custId);

    const unsubscribeCustomer = onSnapshot(customerRef, (snapshot) => {
      if (!snapshot.exists()) {
        setAppointments([]);
        setHasCustomerRecord(false);
        return;
      }

      setHasCustomerRecord(true);

      // Fetch appointments for this customer
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('customerId', '==', custId),
        orderBy('start', 'desc')
      );

      unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const appts: Appointment[] = [];
        snapshot.forEach((doc) => {
          appts.push({ id: doc.id, ...doc.data() } as Appointment);
        });
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
    const unsubscribe = onSnapshot(query(servicesRef, where('active', '==', true)), (snapshot) => {
      const servicesMap: Record<string, Service> = {};
      snapshot.forEach((doc) => {
        servicesMap[doc.id] = { id: doc.id, ...doc.data() } as Service;
      });
      setServices(servicesMap);
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return null;
  }

  if (!user || !hasCustomerRecord) {
    return null;
  }

  // Helper function to check if date is valid - moved after early returns
  const isValidDate = (dateString: any): boolean => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch (e) {
      return false;
    }
  };

  // Safely filter appointments with error handling
  let upcomingAppointments: typeof appointments = [];
  let pastAppointments: typeof appointments = [];
  
  try {
    upcomingAppointments = appointments
      .filter((apt) => isValidDate(apt.start) && apt.status !== 'cancelled' && new Date(apt.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    pastAppointments = appointments
      .filter((apt) => isValidDate(apt.start) && new Date(apt.start) < new Date() && apt.status === 'confirmed')
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  } catch (error) {
    console.error('Error filtering appointments:', error);
  }

  const totalAppointments = appointments.length;
  const upcomingCount = upcomingAppointments.length;
  const pastCount = pastAppointments.length;

  return (
    <div className={`bg-white rounded-xl shadow-soft border border-slate-200 ${className}`}>
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-slate-800">My Bookings</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {upcomingCount} Upcoming
              </span>
              {pastCount > 0 && (
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                  {pastCount} Past
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dashboard');
              }}
              className="text-xs text-terracotta hover:text-terracotta/80 font-medium"
            >
              View All
            </button>
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {!collapsed && (
        <div className="border-t border-slate-200">
          {upcomingCount > 0 ? (
            <div className="p-4 space-y-3">
              {upcomingAppointments.slice(0, 2).map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div key={apt.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-800 text-sm">
                            {service?.name || 'Service'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p>📅 {safeFormatDate(apt.start, 'MMM d, yyyy', 'Date TBD')}</p>
                          <p>🕐 {safeFormatDate(apt.start, 'h:mm a', 'Time TBD')}</p>
                          {apt.totalPrice && (
                            <p>💰 ${apt.totalPrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {upcomingCount > 2 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-terracotta hover:text-terracotta/80 font-medium"
                  >
                    +{upcomingCount - 2} more appointments
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="text-slate-500 mb-3">
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-600">No upcoming appointments</p>
              </div>
              <button
                onClick={() => navigate('/book')}
                className="inline-flex items-center gap-2 bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
