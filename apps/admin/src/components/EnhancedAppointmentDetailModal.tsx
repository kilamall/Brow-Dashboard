import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, getDoc, collection, query, where, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Appointment, Service, Customer, AppointmentEditRequest } from '@buenobrows/shared/types';
import { format, parseISO, addWeeks } from 'date-fns';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { addCustomerNote, updateCustomerNote, deleteCustomerNote } from '@buenobrows/shared/firestoreActions';
import EditRequestConfirmModal from './EditRequestConfirmModal';
import EditRequestsModal from './EditRequestsModal';

interface Props {
  appointment: Appointment;
  service?: Service;
  onClose: () => void;
  onEdit?: () => void;
}

export default function EnhancedAppointmentDetailModal({ appointment, service, onClose, onEdit }: Props) {
  const { db, auth } = useFirebase();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ category: 'general' as const, content: '' });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [editRequest, setEditRequest] = useState<AppointmentEditRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [approvingEdit, setApprovingEdit] = useState(false);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [showEditRequestsModal, setShowEditRequestsModal] = useState(false);
  const functions = getFunctions();

  // Load customer data
  useEffect(() => {
    if (appointment.customerId) {
      const loadCustomer = async () => {
        try {
          const customerDoc = await getDoc(doc(db, 'customers', appointment.customerId!));
          if (customerDoc.exists()) {
            setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
          }
        } catch (error) {
          console.error('Error loading customer:', error);
        }
      };
      loadCustomer();
    }
  }, [appointment.customerId, db]);

  // Load services
  useEffect(() => {
    if (!db) return;
    
    const ref = collection(db, 'services');
    return onSnapshot(ref, (snap) => {
      const map: Record<string, Service> = {};
      snap.forEach((d) => {
        const data = d.data();
        if (data) {
          map[d.id] = { id: d.id, ...data } as Service;
        }
      });
      setServices(map);
    });
  }, [db]);

  // Watch for pending edit requests for this appointment
  useEffect(() => {
    if (!db || !appointment.id) return;
    
    const ref = collection(db, 'appointmentEditRequests');
    const q = query(
      ref,
      where('appointmentId', '==', appointment.id),
      where('status', '==', 'pending')
    );
    
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const doc = snap.docs[0];
        setEditRequest({ id: doc.id, ...doc.data() } as AppointmentEditRequest);
      } else {
        setEditRequest(null);
      }
    });
  }, [db, appointment.id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      
      // Delete associated edit requests
      const editRequestsQuery = query(
        collection(db, 'appointmentEditRequests'),
        where('appointmentId', '==', appointment.id)
      );
      const editRequestsSnap = await getDocs(editRequestsQuery);
      const deletePromises = editRequestsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      if (editRequestsSnap.size > 0) {
        console.log(`Deleted ${editRequestsSnap.size} edit requests for appointment ${appointment.id}`);
      }
      
      alert('✅ Appointment cancelled successfully');
      onClose();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('❌ Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnSchedule = () => {
    const date = parseISO(appointment.start);
    nav('/schedule', { state: { highlightDate: date } });
    onClose();
  };

  const handleResendConfirmation = async () => {
    if (!confirm('Resend confirmation email to customer?')) return;
    
    setResending(true);
    try {
      const resendConfirmation = httpsCallable(functions, 'resendAppointmentConfirmation');
      await resendConfirmation({ appointmentId: appointment.id });
      alert('✅ Confirmation email sent successfully!');
    } catch (error: any) {
      console.error('Failed to resend confirmation:', error);
      alert(`❌ Failed to resend confirmation: ${error.message}`);
    } finally {
      setResending(false);
    }
  };

  const handleApproveEditRequest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!db || !editRequest) return;
    
    setApprovingEdit(true);
    try {
      // Update appointment in-place with only the changed fields
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        updatedForEdit: true,
        editRequestId: editRequest.id,
        editProcessedAt: new Date().toISOString(),
        editProcessedBy: auth.currentUser?.uid || 'admin'
      };

      // Only apply changed fields
      if (editRequest.requestedChanges.start) {
        updateData.start = editRequest.requestedChanges.start;
      }
      if (editRequest.requestedChanges.serviceIds && editRequest.requestedChanges.serviceIds.length > 0) {
        updateData.serviceId = editRequest.requestedChanges.serviceIds[0];
        updateData.selectedServices = editRequest.requestedChanges.serviceIds;
        
        // Calculate total duration from selected services
        const totalDuration = editRequest.requestedChanges.serviceIds.reduce((sum, id) => {
          const service = services[id];
          return sum + (service?.duration || 0);
        }, 0);
        updateData.duration = totalDuration;
        
        // Calculate total price from selected services
        const totalPrice = editRequest.requestedChanges.serviceIds.reduce((sum, id) => {
          const service = services[id];
          return sum + (service?.price || 0);
        }, 0);
        updateData.bookedPrice = totalPrice;
        updateData.totalPrice = totalPrice;
      }
      if (editRequest.requestedChanges.notes !== undefined) {
        updateData.notes = editRequest.requestedChanges.notes || '';
      }

      // ✅ ROBUST: Update appointment first, then edit request status
      let appointmentUpdateSuccess = false;
      let editRequestUpdateSuccess = false;
      
      try {
        // Step 1: Update the appointment
        await updateDoc(doc(db, 'appointments', appointment.id), updateData);
        appointmentUpdateSuccess = true;
        console.log('✅ Appointment updated successfully');
        
        // Step 2: Mark edit request as approved
        await updateDoc(doc(db, 'appointmentEditRequests', editRequest.id), {
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: auth.currentUser?.uid || 'admin'
        });
        editRequestUpdateSuccess = true;
        console.log('✅ Edit request status updated to approved');

        setShowConfirmModal(false);
        console.log('Edit request approved successfully');
        
      } catch (appointmentError) {
        const errorMsg = appointmentError instanceof Error ? appointmentError.message : 'Unknown error';
        
        // If appointment update failed, don't update edit request status
        if (!appointmentUpdateSuccess) {
          throw new Error(`Failed to update appointment: ${errorMsg}`);
        }
        
        // If edit request status update failed, try to rollback appointment
        if (appointmentUpdateSuccess && !editRequestUpdateSuccess) {
          try {
            // Rollback appointment to original state
            const rollbackData: Record<string, any> = {
              updatedAt: new Date().toISOString(),
              updatedForEdit: false,
              editRequestId: null,
              editProcessedAt: null,
              editProcessedBy: null,
            };
            
            // Restore original values if they were changed
            if (editRequest.requestedChanges.start) {
              rollbackData.start = appointment.start;
            }
            if (editRequest.requestedChanges.serviceIds) {
              rollbackData.serviceId = appointment.serviceId;
              rollbackData.selectedServices = (appointment as any).selectedServices;
              rollbackData.duration = appointment.duration;
              rollbackData.bookedPrice = appointment.bookedPrice;
              rollbackData.totalPrice = appointment.totalPrice;
            }
            if (editRequest.requestedChanges.notes !== undefined) {
              rollbackData.notes = appointment.notes;
            }
            
            await updateDoc(doc(db, 'appointments', appointment.id), rollbackData);
          } catch (rollbackError) {
            const rollbackMsg = rollbackError instanceof Error ? rollbackError.message : 'Unknown error';
            throw new Error(`Appointment updated but edit request status update failed. Manual intervention may be required. Rollback failed: ${rollbackMsg}`);
          }
        }
        
        throw appointmentError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Failed to approve edit request: ${errorMessage}. Please try again or contact support if the issue persists.`);
    } finally {
      setApprovingEdit(false);
    }
  };

  const handleDenyEditRequest = async () => {
    if (!db || !editRequest) return;
    
    const confirmed = window.confirm('Are you sure you want to deny this edit request?');
    if (!confirmed) return;

    setLoading(true);
    try {
      // Update edit request status
      await updateDoc(doc(db, 'appointmentEditRequests', editRequest.id), {
        status: 'denied',
        processedAt: new Date().toISOString(),
        processedBy: auth.currentUser?.uid || 'admin'
      });

      // ✅ NEW: Check if there's a pending appointment for this request
      // If so, cancel it
      if (appointment && appointment.status === 'pending') {
        await updateDoc(doc(db, 'appointments', appointment.id), {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Cancelled pending appointment for denied edit request');
      }

      console.log('Edit request denied successfully');
    } catch (error) {
      console.error('Error denying edit request:', error);
      alert('Failed to deny edit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRebook = () => {
    // Calculate date 2 weeks from today
    const twoWeeksFromNow = addWeeks(new Date(), 2);
    const dateStr = format(twoWeeksFromNow, 'yyyy-MM-dd');
    
    // Navigate to schedule with customer info and date
    nav('/schedule', {
      state: {
        quickRebook: {
          customerId: appointment.customerId,
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          customerPhone: appointment.customerPhone,
          serviceId: appointment.serviceId,
          date: dateStr
        }
      }
    });
    onClose();
  };

  const handleApprovePending = async () => {
    if (!db) return;
    
    const confirmed = window.confirm('Confirm this pending appointment?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });
      console.log('Appointment confirmed successfully');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDenyPending = async () => {
    if (!db) return;
    
    const confirmed = window.confirm('Deny this pending appointment?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      console.log('Appointment denied successfully');
    } catch (error) {
      console.error('Error denying appointment:', error);
      alert('Failed to deny appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim() || !appointment.customerId || !auth.currentUser?.uid) return;
    
    try {
      await addCustomerNote(db, appointment.customerId, {
        ...newNote,
        addedBy: auth.currentUser.uid
      });
      setNewNote({ category: 'general', content: '' });
      setShowAddNote(false);
      
      // Reload customer data
      const customerDoc = await getDoc(doc(db, 'customers', appointment.customerId!));
      if (customerDoc.exists()) {
        setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('❌ Failed to add note');
    }
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNote(noteId);
    setNoteContent(content);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!noteContent.trim() || !appointment.customerId) return;
    
    try {
      await updateCustomerNote(db, appointment.customerId, noteId, {
        content: noteContent
      });
      setEditingNote(null);
      setNoteContent('');
      
      // Reload customer data
      const customerDoc = await getDoc(doc(db, 'customers', appointment.customerId!));
      if (customerDoc.exists()) {
        setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('❌ Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?') || !appointment.customerId) return;
    
    try {
      await deleteCustomerNote(db, appointment.customerId, noteId);
      
      // Reload customer data
      const customerDoc = await getDoc(doc(db, 'customers', appointment.customerId!));
      if (customerDoc.exists()) {
        setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('❌ Failed to delete note');
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'allergies': return 'bg-red-50 text-red-700 border-red-200';
      case 'preferences': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'history': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'special_requests': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'allergies': return '⚠️';
      case 'preferences': return '⭐';
      case 'history': return '📋';
      case 'special_requests': return '💬';
      default: return '📝';
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-terracotta to-terracotta/90 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Appointment Details</h2>
            <p className="text-terracotta-100 text-sm mt-1">
              {format(parseISO(appointment.start), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Appointment Info */}
            <div className="space-y-6">
              {/* Status & Time */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}>
                    {appointment.status === 'confirmed' ? '✅ Confirmed' : 
                     appointment.status === 'pending' ? '⏳ Pending' : 
                     appointment.status === 'completed' ? '✅ Completed' :
                     appointment.status === 'no-show' ? '❌ No Show' :
                     appointment.status === 'cancelled' ? '❌ Cancelled' : 
                     `❌ ${appointment.status}`}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      {format(parseISO(appointment.start), 'h:mm a')}
                    </div>
                    <div className="text-sm text-slate-600">
                      {format(new Date(new Date(appointment.start).getTime() + appointment.duration * 60000), 'h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  Duration: {appointment.duration} minutes
                </div>
              </div>

              {/* Service */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💆‍♀️</span>
                  Service
                </h3>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-slate-800">{service?.name || 'Unknown Service'}</div>
                  {service?.description && (
                    <button
                      onClick={() => {
                        alert(service.description);
                      }}
                      className="text-xs text-terracotta hover:text-terracotta/80 underline"
                      title="View service description"
                    >
                      Read More
                    </button>
                  )}
                </div>
                {appointment.bookedPrice && (
                  <div className="text-sm text-slate-500 mt-2">
                    Price: ${appointment.bookedPrice}
                  </div>
                )}
              </div>

              {/* Customer Info */}
              {appointment.customerName && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    Customer
                  </h3>
                  <div className="space-y-2">
                    <div className="font-medium text-slate-800">{appointment.customerName}</div>
                    {appointment.customerEmail && (
                      <div className="text-sm text-slate-600">📧 {appointment.customerEmail}</div>
                    )}
                    {appointment.customerPhone && (
                      <div className="text-sm text-slate-600">📱 {appointment.customerPhone}</div>
                    )}
                    {appointment.customerId && (
                      <button
                        onClick={() => {
                          nav(`/customers/${appointment.customerId}`);
                          onClose();
                        }}
                        className="text-terracotta hover:text-terracotta/80 hover:underline transition-colors text-sm font-medium"
                      >
                        View Full Profile →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment-Specific Notes */}
              {appointment.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">📌</span>
                    Appointment-Specific Note
                  </h3>
                  <div className="text-sm text-slate-600 mb-2">
                    This note is specific to this appointment only
                  </div>
                  <div className="text-slate-700 bg-white rounded-lg p-3 border border-amber-200">
                    {appointment.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Customer Notes & Actions */}
            <div className="space-y-6">
              {/* Customer Notes */}
              {customer && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      Customer Notes
                    </h3>
                    <button
                      onClick={() => setShowAddNote(true)}
                      className="bg-terracotta text-white px-3 py-1.5 rounded-lg text-sm hover:bg-terracotta/90 transition-colors"
                    >
                      + Add Note
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mb-4">
                    Notes saved here apply to all appointments for {customer.name}
                  </div>

                  {/* Add Note Form */}
                  {showAddNote && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                          <select
                            value={newNote.category}
                            onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="general">📝 General</option>
                            <option value="preferences">⭐ Preferences</option>
                            <option value="allergies">⚠️ Allergies</option>
                            <option value="history">📋 History</option>
                            <option value="special_requests">💬 Special Requests</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                          <textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Add a note about this customer..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddNote}
                            disabled={!newNote.content.trim()}
                            className="bg-terracotta text-white px-4 py-2 rounded-lg text-sm hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Note
                          </button>
                          <button
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNote({ category: 'general', content: '' });
                            }}
                            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes List */}
                  <div className="space-y-3">
                    {customer.structuredNotes?.length ? (
                      customer.structuredNotes.map((note) => (
                        <div key={note.id} className={`border rounded-lg p-3 ${getCategoryColor(note.category)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{getCategoryIcon(note.category)}</span>
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {note.category.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {format(parseISO(note.addedAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {editingNote === note.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateNote(note.id)}
                                      className="bg-terracotta text-white px-3 py-1 rounded text-xs hover:bg-terracotta/90"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingNote(null);
                                        setNoteContent('');
                                      }}
                                      className="border border-slate-300 text-slate-700 px-3 py-1 rounded text-xs hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm">{note.content}</div>
                              )}
                            </div>
                            {editingNote !== note.id && (
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleEditNote(note.id, note.content)}
                                  className="text-slate-400 hover:text-slate-600 p-1"
                                  title="Edit note"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                  title="Delete note"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-2">📝</div>
                        <div className="text-sm font-medium">No customer notes yet</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Add notes about preferences, allergies, history, and special requests.<br/>
                          These notes will be available for all future appointments.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Request History Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowEditRequestsModal(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Edit History
                </button>
              </div>

              {/* Pending Edit Request Section */}
              {editRequest && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Pending Edit Request
                  </h3>
                  <div className="space-y-3 mb-4">
                    {editRequest.requestedChanges.start && editRequest.requestedChanges.start !== appointment.start && (
                      <div className="text-sm">
                        <span className="font-medium text-slate-700">New Date/Time:</span>
                        <div className="text-green-700 font-medium">
                          {format(parseISO(editRequest.requestedChanges.start), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    )}
                    {editRequest.requestedChanges.serviceIds && JSON.stringify(editRequest.requestedChanges.serviceIds.sort()) !== JSON.stringify([appointment.serviceId].sort()) && (
                      <div className="text-sm">
                        <span className="font-medium text-slate-700">New Service(s):</span>
                        <div className="text-green-700 font-medium">
                          {editRequest.requestedChanges.serviceIds.map(id => services[id]?.name || 'Unknown').join(', ')}
                        </div>
                      </div>
                    )}
                    {editRequest.reason && (
                      <div className="text-sm">
                        <span className="font-medium text-slate-700">Reason:</span>
                        <div className="text-slate-600 italic">
                          {editRequest.reason}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleApproveEditRequest}
                      disabled={approvingEdit}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingEdit ? 'Approving...' : 'Approve Changes'}
                    </button>
                    <button
                      onClick={handleDenyEditRequest}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Deny Request
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Quick Actions
                </h3>
                <div className="grid gap-3">
                  {/* Debug info - remove in production */}
                  {false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                      <p>Status: {appointment.status}</p>
                      <p>CustomerId: {appointment.customerId || 'none'}</p>
                      <p>CustomerEmail: {appointment.customerEmail || 'none'}</p>
                      <p>onEdit: {onEdit ? 'provided' : 'missing'}</p>
                    </div>
                  )}
                  
                  {/* Quick Rebook Button - only for confirmed appointments with customer ID */}
                  {appointment.customerId && appointment.status === 'confirmed' && (
                    <button
                      onClick={handleQuickRebook}
                      className="w-full bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors text-left flex items-center gap-3"
                      title="Book this customer again 2+ weeks from now"
                    >
                      <span className="text-lg">🔄</span>
                      <span>Quick Rebook (2+ Weeks)</span>
                    </button>
                  )}

                  {/* Conditional Approve/Deny for pending appointments */}
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApprovePending}
                        className="w-full bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors text-left flex items-center gap-3"
                      >
                        <span className="text-lg">✓</span>
                        <span>Confirm Appointment</span>
                      </button>
                      <button
                        onClick={handleDenyPending}
                        className="w-full bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 transition-colors text-left flex items-center gap-3"
                      >
                        <span className="text-lg">✗</span>
                        <span>Deny Appointment</span>
                      </button>
                    </>
                  )}

                  {/* Conditional Approve/Deny for edit requests */}
                  {editRequest && (
                    <>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="w-full bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors text-left flex items-center gap-3"
                      >
                        <span className="text-lg">✓</span>
                        <span>Approve Edit Request</span>
                      </button>
                      <button
                        onClick={handleDenyEditRequest}
                        className="w-full bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 transition-colors text-left flex items-center gap-3"
                      >
                        <span className="text-lg">✗</span>
                        <span>Deny Edit Request</span>
                      </button>
                    </>
                  )}
                  
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="w-full border border-terracotta text-terracotta rounded-lg px-4 py-3 hover:bg-terracotta/10 transition-colors text-left flex items-center gap-3"
                    >
                      <span className="text-lg">✏️</span>
                      <span>Edit Appointment</span>
                    </button>
                  )}
                  <button
                    onClick={handleViewOnSchedule}
                    className="w-full bg-terracotta text-white rounded-lg px-4 py-3 hover:bg-terracotta/90 transition-colors text-left flex items-center gap-3"
                  >
                    <span className="text-lg">📅</span>
                    <span>View on Schedule</span>
                  </button>
                  {/* Resend Email - show for any appointment with customer email */}
                  {appointment.customerEmail && (
                    <button
                      onClick={handleResendConfirmation}
                      disabled={resending}
                      className="w-full border border-blue-300 text-blue-600 rounded-lg px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 disabled:opacity-50"
                    >
                      <span className="text-lg">📧</span>
                      <span>{resending ? 'Sending...' : 'Resend Email'}</span>
                    </button>
                  )}
                  
                  {/* Cancel Appointment - show for any non-cancelled appointment */}
                  {appointment.status !== 'cancelled' && (
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="w-full border border-red-300 text-red-600 rounded-lg px-4 py-3 hover:bg-red-50 transition-colors text-left flex items-center gap-3 disabled:opacity-50"
                    >
                      <span className="text-lg">❌</span>
                      <span>{loading ? 'Cancelling...' : 'Cancel Appointment'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Edit Request Confirmation Modal */}
    {editRequest && (
      <EditRequestConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApproval}
        appointment={appointment}
        editRequest={editRequest}
        services={services}
        loading={approvingEdit}
      />
    )}

    {/* Edit Requests Modal */}
    <EditRequestsModal 
      isOpen={showEditRequestsModal} 
      onClose={() => setShowEditRequestsModal(false)} 
    />
    </>
  );
}
