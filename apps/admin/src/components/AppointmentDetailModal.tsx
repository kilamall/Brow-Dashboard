import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc } from 'firebase/firestore';
import type { Appointment, Service } from '@buenobrows/shared/types';
import { format, parseISO } from 'date-fns';
import { useFirebase } from '@buenobrows/shared/useFirebase';

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

  if (!appointment) return null;

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), { status: 'cancelled' });
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
            <div className="text-slate-600">{format(parseISO(appointment.start), 'h:mm a')}</div>
            <div className="text-xs text-slate-500 mt-1">Duration: {appointment.duration} minutes</div>
          </div>

          {/* Service */}
          <div>
            <div className="text-sm text-slate-500 mb-1">Service</div>
            <div className="font-medium">{service?.name || 'Unknown Service'}</div>
            {service?.description && (
              <div className="text-sm text-slate-600 mt-1">{service.description}</div>
            )}
          </div>

          {/* Customer */}
          {appointment.customerName && (
            <div>
              <div className="text-sm text-slate-500 mb-1">Customer</div>
              <div className="font-medium">{appointment.customerName}</div>
              {appointment.customerEmail && (
                <div className="text-sm text-slate-600">{appointment.customerEmail}</div>
              )}
              {appointment.customerPhone && (
                <div className="text-sm text-slate-600">{appointment.customerPhone}</div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="bg-terracotta/10 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Total Price</div>
            <div className="text-2xl font-bold text-terracotta">
              ${(appointment.bookedPrice ?? service?.price ?? 0).toFixed(2)}
            </div>
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
          <div className="flex gap-3 pt-4 border-t">
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
  );
}

