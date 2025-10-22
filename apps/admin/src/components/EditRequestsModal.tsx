import { useEffect, useState, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, getDoc, addDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format, parseISO } from 'date-fns';
import type { AppointmentEditRequest, Appointment, Service, Customer } from '@buenobrows/shared/types';

// Helper function to safely parse dates
function safeParseDate(dateString: string): Date {
  try {
    const parsed = parseISO(dateString);
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : new Date(dateString);
  } catch {
    return new Date();
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditRequestsModal({ isOpen, onClose }: Props) {
  const { db } = useFirebase();
  const [editRequests, setEditRequests] = useState<AppointmentEditRequest[]>([]);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentEditRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch edit requests
  useEffect(() => {
    if (!db || !isOpen) return;

    const editRequestsRef = collection(db, 'appointmentEditRequests');
    const editRequestsQuery = query(editRequestsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(editRequestsQuery, async (snapshot) => {
      const requests: AppointmentEditRequest[] = [];
      const appointmentIds: string[] = [];
      const customerIds: string[] = [];

      snapshot.forEach((doc) => {
        const request = { id: doc.id, ...doc.data() } as AppointmentEditRequest;
        requests.push(request);
        appointmentIds.push(request.appointmentId);
        customerIds.push(request.customerId);
      });

      setEditRequests(requests);

      // Fetch related appointments
      if (appointmentIds.length > 0) {
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(appointmentsRef, where('__name__', 'in', appointmentIds));
        
        onSnapshot(appointmentsQuery, (appointmentSnapshot) => {
          const appointmentsMap: Record<string, Appointment> = {};
          appointmentSnapshot.forEach((doc) => {
            const appointmentData = { id: doc.id, ...doc.data() } as Appointment;
            appointmentsMap[doc.id] = appointmentData;
          });
          setAppointments(appointmentsMap);
          setAppointmentsLoading(false);
        }, (error) => {
          console.error('Error loading appointments:', error);
          setAppointments({});
          setAppointmentsLoading(false);
        });
      } else {
        setAppointments({});
        setAppointmentsLoading(false);
      }

      // Fetch related customers
      if (customerIds.length > 0) {
        const customersRef = collection(db, 'customers');
        const customersQuery = query(customersRef, where('__name__', 'in', customerIds));
        
        onSnapshot(customersQuery, (customerSnapshot) => {
          const customersMap: Record<string, Customer> = {};
          customerSnapshot.forEach((doc) => {
            customersMap[doc.id] = { id: doc.id, ...doc.data() } as Customer;
          });
          setCustomers(customersMap);
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, isOpen]);

  // Fetch services
  useEffect(() => {
    if (!db || !isOpen) return;

    const servicesRef = collection(db, 'services');
    const unsubscribe = onSnapshot(servicesRef, (snapshot) => {
      const servicesMap: Record<string, Service> = {};
      snapshot.forEach((doc) => {
        servicesMap[doc.id] = { id: doc.id, ...doc.data() } as Service;
      });
      setServices(servicesMap);
    });

    return () => unsubscribe();
  }, [db, isOpen]);

  const handleApprove = async (request: AppointmentEditRequest) => {
    if (!db) return;
    
    setProcessing(true);
    try {
      // Update appointment with requested changes
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        updatedForEdit: true,
        editRequestId: request.id,
        editProcessedAt: new Date().toISOString(),
        editProcessedBy: 'admin'
      };

      if (request.requestedChanges.start) {
        updateData.start = request.requestedChanges.start;
      }
      if (request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0) {
        updateData.serviceId = request.requestedChanges.serviceIds[0];
        updateData.selectedServices = request.requestedChanges.serviceIds;
        
        const totalDuration = request.requestedChanges.serviceIds.reduce((sum, id) => {
          const service = services[id];
          return sum + (service?.duration || 0);
        }, 0);
        updateData.duration = totalDuration;
        
        const totalPrice = request.requestedChanges.serviceIds.reduce((sum, id) => {
          const service = services[id];
          return sum + (service?.price || 0);
        }, 0);
        updateData.bookedPrice = totalPrice;
        updateData.totalPrice = totalPrice;
      }
      if (request.requestedChanges.notes !== undefined) {
        updateData.notes = request.requestedChanges.notes || '';
      }

      await updateDoc(doc(db, 'appointments', request.appointmentId), updateData);
      
      // Mark edit request as approved
      await updateDoc(doc(db, 'appointmentEditRequests', request.id), {
        status: 'approved',
        processedAt: new Date().toISOString(),
        processedBy: 'admin'
      });

      alert('✅ Edit request approved successfully');
    } catch (error) {
      console.error('Error approving edit request:', error);
      alert('❌ Failed to approve edit request');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async (request: AppointmentEditRequest) => {
    if (!db) return;
    
    const confirmed = window.confirm('Are you sure you want to deny this edit request?');
    if (!confirmed) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'appointmentEditRequests', request.id), {
        status: 'denied',
        processedAt: new Date().toISOString(),
        processedBy: 'admin'
      });

      alert('✅ Edit request denied');
    } catch (error) {
      console.error('Error denying edit request:', error);
      alert('❌ Failed to deny edit request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-terracotta to-terracotta/90 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Edit Requests History</h2>
            <p className="text-terracotta-100 text-sm mt-1">
              Review and manage customer appointment edit requests
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-800">
                        {editRequests.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800">
                        {editRequests.filter(r => r.status === 'approved').length}
                      </div>
                      <div className="text-sm text-green-600">Approved</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-800">
                        {editRequests.filter(r => r.status === 'denied').length}
                      </div>
                      <div className="text-sm text-red-600">Denied</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Requests List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800">All Edit Requests</h3>
                {editRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-5xl mb-3">📝</div>
                    <div className="text-base font-medium mb-1">No edit requests yet</div>
                    <div className="text-sm text-slate-400">
                      Customer edit requests will appear here
                    </div>
                  </div>
                ) : (
                  editRequests.map((request) => {
                    const appointment = appointments[request.appointmentId];
                    const customer = customers[request.customerId];
                    
                    return (
                      <div key={request.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-slate-800">
                                {customer?.name || 'Unknown Customer'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {customer?.email || 'No contact info.'}
                            </p>
                          </div>
                          <div className="text-sm text-slate-500">
                            {format(safeParseDate(request.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Current Appointment */}
                          <div className="bg-slate-50 rounded-lg p-4">
                            <h5 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Current Appointment
                            </h5>
                            {appointment ? (
                              <>
                                <p><strong>Date:</strong> {format(safeParseDate(appointment.start), 'EEEE, MMMM d, yyyy')}</p>
                                <p><strong>Time:</strong> {format(safeParseDate(appointment.start), 'h:mm a')}</p>
                                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>{appointment.status}</span></p>
                                {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                              </>
                            ) : appointmentsLoading ? (
                              <div className="text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="font-medium">🔄 Loading appointment data...</p>
                                <p className="text-xs mt-1">Fetching appointment details from database.</p>
                              </div>
                            ) : (
                              <div className="text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <p className="font-medium">⚠️ Appointment Not Found</p>
                                <p className="text-xs mt-1">The original appointment may have been deleted, cancelled, or the ID is incorrect.</p>
                                <p className="text-xs mt-1"><strong>Appointment ID:</strong> {request.appointmentId}</p>
                                <p className="text-xs mt-1"><strong>Status:</strong> This edit request may be for a cancelled or deleted appointment.</p>
                              </div>
                            )}
                          </div>

                          {/* Requested Changes */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Requested Changes
                            </h5>
                            {request.requestedChanges.start && (
                              <div className="text-sm mb-2">
                                <span className="font-medium text-blue-700">New Date/Time:</span>
                                <div className="text-blue-800 font-medium">
                                  {format(safeParseDate(request.requestedChanges.start), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                                </div>
                              </div>
                            )}
                            {request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0 && (
                              <div className="text-sm mb-2">
                                <span className="font-medium text-blue-700">New Services:</span>
                                <div className="text-blue-800 font-medium">
                                  {request.requestedChanges.serviceIds.map(id => services[id]?.name || 'Unknown').join(', ')}
                                </div>
                              </div>
                            )}
                            {request.requestedChanges.notes !== undefined && (
                              <div className="text-sm mb-2">
                                <span className="font-medium text-blue-700">New Notes:</span>
                                <div className="text-blue-800 font-medium">
                                  {request.requestedChanges.notes || 'No notes'}
                                </div>
                              </div>
                            )}
                            {request.reason && (
                              <div className="text-sm">
                                <span className="font-medium text-blue-700">Reason:</span>
                                <div className="text-blue-800 italic">
                                  {request.reason}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {request.status === 'pending' && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeny(request)}
                              disabled={processing}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
