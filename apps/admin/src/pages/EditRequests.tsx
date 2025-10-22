import { useEffect, useState, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, getDoc, addDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import type { AppointmentEditRequest, Appointment, Service, Customer } from '@buenobrows/shared/types';

export default function EditRequests() {
  const { db } = useFirebase();
  const [searchParams] = useSearchParams();
  const [editRequests, setEditRequests] = useState<AppointmentEditRequest[]>([]);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentEditRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Fetch edit requests
  useEffect(() => {
    if (!db) return;

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
            appointmentsMap[doc.id] = { id: doc.id, ...doc.data() } as Appointment;
          });
          setAppointments(appointmentsMap);
        }, (error) => {
          console.error('Error loading appointments:', error);
        });
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
  }, [db]);

  // Fetch services
  useEffect(() => {
    if (!db) return;

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

  // Handle URL highlighting
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && editRequests.length > 0) {
      // Find the request to highlight
      const requestToHighlight = editRequests.find(req => req.id === highlightId);
      if (requestToHighlight) {
        // Scroll to the highlighted request after a short delay
        setTimeout(() => {
          if (highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            highlightRef.current.style.backgroundColor = '#fef3c7';
            setTimeout(() => {
              if (highlightRef.current) {
                highlightRef.current.style.backgroundColor = '';
              }
            }, 3000);
          }
        }, 500);
      }
    }
  }, [searchParams, editRequests]);

  const handleApprove = async (request: AppointmentEditRequest) => {
    if (!confirm('Are you sure you want to approve this edit request? This will update the appointment.')) {
      return;
    }

    setProcessing(true);
    try {
      // Get the current appointment data first
      const appointmentDoc = await getDoc(doc(db, 'appointments', request.appointmentId));
      const currentAppointment = appointmentDoc.data();
      
      if (!currentAppointment) {
        throw new Error('Appointment not found');
      }

      // ✅ FIXED: Validate and update date
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        updatedForEdit: true,
        editRequestId: request.id,
        editProcessedAt: new Date().toISOString(),
        editProcessedBy: 'admin',
      };

      if (request.requestedChanges.start) {
        const newDate = new Date(request.requestedChanges.start);
        if (isNaN(newDate.getTime())) {
          throw new Error('Invalid date format in edit request');
        }
        updateData.start = request.requestedChanges.start;
      }
      
      // ✅ FIXED: Update services AND recalculate duration
      if (request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0) {
        updateData.serviceId = request.requestedChanges.serviceIds[0];
        updateData.serviceIds = request.requestedChanges.serviceIds;
        
        // Fetch services to calculate total duration
        const servicesSnap = await Promise.all(
          request.requestedChanges.serviceIds.map(id => getDoc(doc(db, 'services', id)))
        );
        const totalDuration = servicesSnap.reduce((sum, snap) => {
          const data = snap.data();
          return sum + (data?.duration || 0);
        }, 0);
        updateData.duration = totalDuration;
      }
      
      if (request.requestedChanges.notes !== undefined) {
        updateData.notes = request.requestedChanges.notes || '';
      }

      // ✅ ROBUST: Update appointment first, then edit request status
      let appointmentUpdateSuccess = false;
      let editRequestUpdateSuccess = false;
      
      try {
        // Step 1: Update the appointment
        await updateDoc(doc(db, 'appointments', request.appointmentId), updateData);
        appointmentUpdateSuccess = true;
        console.log('✅ Appointment updated successfully');
        
        // Step 2: Update the edit request status
        await updateDoc(doc(db, 'appointmentEditRequests', request.id), {
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: 'admin'
        });
        editRequestUpdateSuccess = true;
        console.log('✅ Edit request status updated to approved');

        // Step 3: Send confirmation email (non-critical)
        try {
          const functions = getFunctions();
          const sendConfirmation = httpsCallable(functions, 'sendEditApprovedEmail');
          await sendConfirmation({
            appointmentId: request.appointmentId,
            customerId: currentAppointment.customerId,
            customerEmail: currentAppointment.customerEmail,
            changes: {
              dateChanged: !!request.requestedChanges.start,
              servicesChanged: !!request.requestedChanges.serviceIds,
              newStart: updateData.start,
              newServiceIds: updateData.serviceIds
            }
          });
          console.log('✅ Edit approval email sent');
        } catch (emailError) {
          console.error('⚠️ Failed to send approval email (non-critical):', emailError);
          // Don't fail the whole operation for email issues
        }

        alert('Edit request approved! Appointment has been updated.');
        setSelectedRequest(null);
        
      } catch (appointmentError) {
        console.error('❌ Failed to update appointment:', appointmentError);
        
        // If appointment update failed, don't update edit request status
        if (!appointmentUpdateSuccess) {
          throw new Error(`Failed to update appointment: ${appointmentError.message}`);
        }
        
        // If edit request status update failed, try to rollback appointment
        if (appointmentUpdateSuccess && !editRequestUpdateSuccess) {
          console.log('🔄 Attempting to rollback appointment changes...');
          try {
            // Rollback appointment to original state
            const rollbackData = {
              updatedAt: new Date().toISOString(),
              updatedForEdit: false,
              editRequestId: null,
              editProcessedAt: null,
              editProcessedBy: null,
            };
            
            // Restore original values if they were changed
            if (request.requestedChanges.start) {
              rollbackData.start = currentAppointment.start;
            }
            if (request.requestedChanges.serviceIds) {
              rollbackData.serviceId = currentAppointment.serviceId;
              rollbackData.serviceIds = currentAppointment.serviceIds;
              rollbackData.duration = currentAppointment.duration;
            }
            if (request.requestedChanges.notes !== undefined) {
              rollbackData.notes = currentAppointment.notes;
            }
            
            await updateDoc(doc(db, 'appointments', request.appointmentId), rollbackData);
            console.log('✅ Appointment rollback successful');
          } catch (rollbackError) {
            console.error('❌ Failed to rollback appointment:', rollbackError);
            throw new Error(`Appointment updated but edit request status update failed. Manual intervention may be required. Rollback failed: ${rollbackError.message}`);
          }
        }
        
        throw appointmentError;
      }
    } catch (error) {
      console.error('Error approving edit request:', error);
      alert(`Failed to approve edit request: ${error.message}. Please try again or contact support if the issue persists.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async (request: AppointmentEditRequest) => {
    const reason = prompt('Please provide a reason for denying this request:');
    if (!reason) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'appointmentEditRequests', request.id), {
        status: 'denied',
        adminNotes: reason,
        processedAt: new Date().toISOString(),
        processedBy: 'admin', // You might want to get the actual admin user ID
        updatedAt: new Date(),
      });

      alert('Edit request denied.');
    } catch (error) {
      console.error('Error denying edit request:', error);
      alert('Failed to deny edit request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">Loading edit requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-slate-800">Edit Requests</h1>
        <p className="text-slate-600 mt-1">Review and manage customer appointment edit requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-semibold text-slate-900">
                {editRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-semibold text-slate-900">
                {editRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Denied</p>
              <p className="text-2xl font-semibold text-slate-900">
                {editRequests.filter(r => r.status === 'denied').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Requests List */}
      <div className="bg-white rounded-xl shadow-soft">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-serif text-xl">All Edit Requests</h2>
        </div>

        {editRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No edit requests found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {editRequests.map((request) => {
              const appointment = appointments[request.appointmentId];
              const service = services[appointment?.serviceId || ''];
              const customer = customers[request.customerId];
              const isHighlighted = searchParams.get('highlight') === request.id;

              return (
                <div 
                  key={request.id} 
                  ref={isHighlighted ? highlightRef : null}
                  className={`bg-white rounded-xl shadow-soft border border-slate-200 p-6 hover:shadow-md transition-shadow ${isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      {/* Customer and Appointment Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {customer?.name || 'Unknown Customer'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {customer?.email || customer?.phone || 'No contact info'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      {/* Current Appointment */}
                      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Current Appointment
                        </h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          {appointment ? (
                            <>
                              <p><strong>Service:</strong> {service?.name || 'Service not found'}</p>
                              <p><strong>Date:</strong> {format(parseISO(appointment.start), 'EEEE, MMMM d, yyyy')}</p>
                              <p><strong>Time:</strong> {format(parseISO(appointment.start), 'h:mm a')}</p>
                              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>{appointment.status}</span></p>
                              {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                            </>
                          ) : Object.keys(appointments).length === 0 ? (
                            <div className="text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="font-medium">🔄 Loading appointment data...</p>
                              <p className="text-xs mt-1">Fetching appointment details from database.</p>
                            </div>
                          ) : (
                            <div className="text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <p className="font-medium">⚠️ Appointment Not Found</p>
                              <p className="text-xs mt-1">The original appointment may have been deleted or the ID is incorrect.</p>
                              <p className="text-xs mt-1"><strong>Appointment ID:</strong> {request.appointmentId}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requested Changes */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Requested Changes
                        </h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          {request.requestedChanges.start && (
                            <p><strong>New Date/Time:</strong> {format(parseISO(request.requestedChanges.start), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                          )}
                          {request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0 && (
                            <div>
                              <p><strong>New Services:</strong></p>
                              <ul className="ml-4 list-disc">
                                {request.requestedChanges.serviceIds.map(serviceId => (
                                  <li key={serviceId}>{services[serviceId]?.name || 'Unknown Service'}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {request.requestedChanges.notes !== undefined && (
                            <p><strong>New Notes:</strong> {request.requestedChanges.notes || 'None'}</p>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      {request.reason && (
                        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Customer Reason
                          </h4>
                          <p className="text-sm text-amber-700">{request.reason}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {request.adminNotes && (
                        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Admin Notes
                          </h4>
                          <p className="text-sm text-red-700">{request.adminNotes}</p>
                        </div>
                      )}

                      {/* Request Date */}
                      <div className="text-xs text-slate-500">
                        Requested: {request.createdAt ? format(request.createdAt.toDate(), 'MMM d, yyyy \'at\' h:mm a') : 'Unknown'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex-shrink-0 ml-4 flex gap-2">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processing}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeny(request)}
                          disabled={processing}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Processing...' : 'Deny'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
