import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Appointment, Service } from '@buenobrows/shared/types';
import { format, parseISO, addWeeks } from 'date-fns';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import EditRequestsModal from './EditRequestsModal';

interface Props {
  appointment: Appointment | null;
  service: Service | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function AppointmentDetailModal({ appointment, service, onClose, onEdit }: Props) {
  const { db } = useFirebase();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [showEditRequestsModal, setShowEditRequestsModal] = useState(false);
  const functions = getFunctions();

  // Initialize price and tip values when appointment changes
  useEffect(() => {
    if (appointment) {
      setEditedPrice((appointment.bookedPrice ?? service?.price ?? 0).toString());
      setTipAmount((appointment.tip ?? 0).toString());
    }
  }, [appointment, service]);

  if (!appointment) return null;

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
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
      
      onClose();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnSchedule = () => {
    const date = parseISO(appointment.start);
    // Navigate to schedule and highlight the date
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

  const handleSavePrice = async () => {
    if (!appointment) return;
    
    const newPrice = parseFloat(editedPrice);
    const newTip = parseFloat(tipAmount) || 0;
    const newTotal = newPrice + newTip;
    
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (newTip < 0) {
      alert('Tip amount cannot be negative');
      return;
    }
    
    setSavingPrice(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        bookedPrice: newPrice,
        tip: newTip,
        totalPrice: newTotal,
        isPriceEdited: true,
        priceEditedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setIsEditingPrice(false);
      // Trigger a refresh by calling onClose and reopening or using a callback
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Failed to update price');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleCancelPriceEdit = () => {
    setEditedPrice((appointment.bookedPrice ?? service?.price ?? 0).toString());
    setTipAmount((appointment.tip ?? 0).toString());
    setIsEditingPrice(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Appointment Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {appointment.status === 'confirmed' ? 'Confirmed' : appointment.status === 'pending' ? 'Pending' : 'Cancelled'}
            </span>
          </div>

          {/* Date & Time */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-500 mb-1">Date & Time</div>
            <div className="font-semibold text-lg">{format(parseISO(appointment.start), 'EEEE, MMMM d, yyyy')}</div>
            <div className="text-slate-600">
              {format(parseISO(appointment.start), 'h:mm a')} - {format(new Date(new Date(appointment.start).getTime() + appointment.duration * 60000), 'h:mm a')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Duration: {appointment.duration} minutes</div>
          </div>

          {/* Service */}
          <div>
            <div className="text-sm text-slate-500 mb-1">Service</div>
            <div className="font-medium">{service?.name || 'Unknown Service'}</div>
          </div>

          {/* Customer */}
          {appointment.customerName && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Customer</div>
              {appointment.customerId ? (
                <button
                  onClick={() => {
                    nav(`/customers/${appointment.customerId}`);
                    onClose();
                  }}
                  className="font-medium text-terracotta hover:text-terracotta/80 hover:underline transition-colors text-left"
                >
                  {appointment.customerName}
                </button>
              ) : (
                <div className="font-medium">{appointment.customerName}</div>
              )}
              {appointment.customerEmail && (
                <div className="text-sm text-slate-600">{appointment.customerEmail}</div>
              )}
              {appointment.customerPhone && (
                <div className="text-sm text-slate-600">{appointment.customerPhone}</div>
              )}
            </div>
          )}

          {/* Edit Request History Button */}
          <div className="mt-4">
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

          {/* Price */}
          <div className="bg-terracotta/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Total Price</div>
              {!isEditingPrice && (
                <button
                  onClick={() => setIsEditingPrice(true)}
                  className="text-xs text-terracotta hover:text-terracotta/80 hover:underline transition-colors"
                >
                  Edit Price
                </button>
              )}
            </div>
            
            {isEditingPrice ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Service Price</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedPrice}
                      onChange={(e) => setEditedPrice(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tip Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded p-2 border">
                  <div className="text-xs text-slate-600 mb-1">Total</div>
                  <div className="text-lg font-bold text-terracotta">
                    ${(parseFloat(editedPrice) + (parseFloat(tipAmount) || 0)).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePrice}
                    disabled={savingPrice}
                    className="flex-1 bg-terracotta text-white rounded px-3 py-1 text-sm hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                  >
                    {savingPrice ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelPriceEdit}
                    className="flex-1 border border-slate-300 text-slate-700 rounded px-3 py-1 text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-terracotta">
                  ${(appointment.totalPrice ?? appointment.bookedPrice ?? service?.price ?? 0).toFixed(2)}
                </div>
                {appointment.tip && appointment.tip > 0 && (
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-500">Service:</span> ${(appointment.bookedPrice ?? service?.price ?? 0).toFixed(2)} 
                    <span className="text-slate-500 ml-2">Tip:</span> ${appointment.tip.toFixed(2)}
                  </div>
                )}
                {appointment.isPriceEdited && (
                  <div className="text-xs text-slate-500 italic">
                    Price manually edited
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Notes</div>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                {appointment.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            {/* Quick Rebook Button */}
            {appointment.customerId && appointment.status === 'confirmed' && (
              <button
                onClick={handleQuickRebook}
                className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                title="Book this customer again 2+ weeks from now"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Quick Rebook (2+ Weeks)
              </button>
            )}
            
            <div className="flex gap-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex-1 border border-terracotta text-terracotta rounded-lg px-4 py-2 hover:bg-terracotta/10 transition-colors"
                >
                  Edit Appointment
                </button>
              )}
              <button
                onClick={handleViewOnSchedule}
                className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors"
              >
                View on Schedule
              </button>
            </div>
            
            <div className="flex gap-3">
              {appointment.status === 'confirmed' && appointment.customerEmail && (
                <button
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="flex-1 border border-blue-300 text-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Email'}
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 border border-red-300 text-red-600 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Requests Modal */}
      <EditRequestsModal 
        isOpen={showEditRequestsModal} 
        onClose={() => setShowEditRequestsModal(false)} 
      />
    </div>
  );
}

