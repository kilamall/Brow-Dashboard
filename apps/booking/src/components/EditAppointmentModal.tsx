import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import type { Appointment, Service, BusinessHours } from '@buenobrows/shared/types';
import { format, addDays } from 'date-fns';
import { watchBusinessHours } from '@buenobrows/shared/firestoreActions';
import { availableSlotsForDay } from '@buenobrows/shared/slotUtils';

// Safe date formatter that won't crash - with enhanced logging
const safeFormatDate = (dateString: any, formatString: string, fallback: string = 'Invalid Date', context?: string): string => {
  try {
    if (!dateString) {
      console.warn(`⚠️ ${context || 'Date'}: No date value provided`);
      return fallback;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error(`❌ ${context || 'Date'}: Invalid date value:`, {
        rawValue: dateString,
        type: typeof dateString,
        stringValue: String(dateString)
      });
      return fallback;
    }
    return format(date, formatString);
  } catch (e) {
    console.error(`❌ ${context || 'Date'}: Error formatting date:`, {
      rawValue: dateString,
      error: e
    });
    return fallback;
  }
};

interface Props {
  appointment: Appointment;
  service: Service;
  allAppointments: Appointment[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditAppointmentModal({ appointment, service, allAppointments, onClose, onUpdated }: Props) {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [bh, setBh] = useState<BusinessHours | null>(null);
  
  // Get current appointment date and time
  const currentDate = new Date(appointment.start);
  const [selectedDate, setSelectedDate] = useState(format(currentDate, 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState(format(currentDate, 'HH:mm'));
  const [error, setError] = useState('');

  // Load business hours
  useEffect(() => {
    const unsubscribe = watchBusinessHours(db, setBh);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [db]);

  // Calculate available slots when date changes
  useEffect(() => {
    if (!bh || !selectedDate) return;
    
    const date = new Date(selectedDate + 'T00:00:00');
    // Filter out the current appointment when checking availability
    const otherAppointments = allAppointments.filter(apt => apt.id !== appointment.id && apt.status !== 'cancelled');
    const slots = availableSlotsForDay(date, appointment.duration, bh, otherAppointments);
    setAvailableSlots(slots);
    
    // If selected time is not available on new date, clear it
    if (slots.length > 0 && !slots.some(s => format(new Date(s), 'HH:mm') === selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate, bh, appointment, allAppointments]);

  const handleSave = async () => {
    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newStartISO = `${selectedDate}T${selectedTime}:00.000Z`;
      
      await updateDoc(doc(db, 'appointments', appointment.id), {
        start: newStartISO,
        updatedAt: new Date().toISOString()
      });

      alert('✅ Appointment updated successfully!');
      onUpdated();
      onClose();
    } catch (error: any) {
      console.error('Failed to update appointment:', error);
      setError(error.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  // Generate next 60 days for date selection
  const availableDates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    availableDates.push(format(date, 'yyyy-MM-dd'));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-slate-800">Edit Appointment</h2>
              <p className="text-sm text-slate-600 mt-1">{service.name}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Appointment</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>📅 {safeFormatDate(appointment.start, 'EEEE, MMMM d, yyyy', 'Date TBD', `EditAppointmentModal ${appointment.id}`)}</p>
              <p>🕐 {safeFormatDate(appointment.start, 'h:mm a', 'Time TBD', `EditAppointmentModal ${appointment.id}`)}</p>
              <p>⏱️ Duration: {appointment.duration} minutes</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select New Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select New Time
            </label>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <p className="text-slate-600">No available times on this date</p>
                <p className="text-sm text-slate-500 mt-1">Please select a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {availableSlots.map((slotISO) => {
                  const slotTime = format(new Date(slotISO), 'HH:mm');
                  const displayTime = format(new Date(slotISO), 'h:mm a');
                  return (
                    <button
                      key={slotISO}
                      onClick={() => setSelectedTime(slotTime)}
                      className={`rounded-md border py-2 text-sm transition-colors ${
                        selectedTime === slotTime
                          ? 'bg-terracotta text-white border-terracotta'
                          : 'hover:bg-cream border-slate-300'
                      }`}
                    >
                      {displayTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="bg-terracotta/10 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Note:</span> You can only change the date and time. 
              To change the service, please cancel this appointment and book a new one.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedTime}
            className="flex-1 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

