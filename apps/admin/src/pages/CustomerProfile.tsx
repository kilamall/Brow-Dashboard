import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import type { Customer, Appointment, Service } from '@buenobrows/shared/types';
import { format, parseISO } from 'date-fns';

export default function CustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { db } = useFirebase();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);

  // Load customer data
  useEffect(() => {
    if (!customerId) return;
    
    const unsubscribe = onSnapshot(doc(db, 'customers', customerId), (doc) => {
      if (doc.exists()) {
        setCustomer({ id: doc.id, ...doc.data() } as Customer);
      } else {
        setCustomer(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [customerId, db]);

  // Load customer appointments
  useEffect(() => {
    if (!customerId) return;
    
    const q = query(
      collection(db, 'appointments'),
      where('customerId', '==', customerId),
      orderBy('start', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const appts: Appointment[] = [];
      snap.forEach((d) => appts.push({ id: d.id, ...d.data() } as Appointment));
      setAppointments(appts);
    });

    return unsubscribe;
  }, [customerId, db]);

  // Load services
  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const servicesMap: Record<string, Service> = {};
      snap.forEach((d) => {
        servicesMap[d.id] = { id: d.id, ...d.data() } as Service;
      });
      setServices(servicesMap);
    });

    return unsubscribe;
  }, [db]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-500">Loading customer profile...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-slate-500 mb-4">Customer not found</div>
          <button
            onClick={() => navigate('/customers')}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-serif text-2xl">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status || 'pending')}`}>
                {customer.status === 'active' ? 'Active' : customer.status === 'blocked' ? 'Blocked' : 'Pending'}
              </span>
              {customer.totalVisits && customer.totalVisits > 0 && (
                <span className="text-sm text-slate-500">
                  {customer.totalVisits} visit{customer.totalVisits !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-4">Customer Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-500 mb-1">Name</div>
            <div className="font-medium">{customer.name}</div>
          </div>
          {customer.email && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Email</div>
              <div className="font-medium">{customer.email}</div>
            </div>
          )}
          {customer.phone && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Phone</div>
              <div className="font-medium">{customer.phone}</div>
            </div>
          )}
          {customer.createdAt && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Member Since</div>
              <div className="font-medium">
                {format(
                  customer.createdAt?.toDate 
                    ? customer.createdAt.toDate() 
                    : new Date(customer.createdAt || new Date()), 
                  'MMMM d, yyyy'
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment History */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-4">Appointment History</h2>
        {appointments.length === 0 ? (
          <div className="text-slate-500 text-center py-8">No appointments found</div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-medium">
                      {format(parseISO(appointment.start), 'MMM d, yyyy')}
                    </div>
                    <div className="text-slate-600">
                      {format(parseISO(appointment.start), 'h:mm a')}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {services[appointment.serviceId]?.name || 'Unknown Service'}
                  </div>
                  {appointment.notes && (
                    <div className="text-sm text-slate-500 mt-1 italic">
                      "{appointment.notes}"
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-terracotta">
                    ${(appointment.bookedPrice ?? services[appointment.serviceId]?.price ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {appointment.duration} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
