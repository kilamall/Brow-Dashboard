import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import type { Appointment, Service, BusinessHours } from '@buenobrows/shared/types';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchBusinessHours } from '@buenobrows/shared/firestoreActions';
import { watchAvailabilityByDay, fetchAvailabilityForDay } from '@buenobrows/shared/availabilityHelpers';
import { availableSlotsFromAvailability } from '@buenobrows/shared/slotUtils';
import { getNextValidBookingDateAfter, formatNextAvailableDate, isValidBookingDate } from '@buenobrows/shared/businessHoursUtils';
import type { AvailabilitySlot } from '@buenobrows/shared/availabilityHelpers';

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
  services: Record<string, Service>;
  onClose: () => void;
  onSubmit: (appointment: Appointment, changes: {
    start?: string;
    serviceId?: string;
    notes?: string;
    reason?: string;
  }) => void;
  loading: boolean;
}

export default function EditRequestModal({ 
  appointment, 
  services, 
  onClose, 
  onSubmit, 
  loading 
}: Props) {
  const { db } = useFirebase();
  const [requestedDate, setRequestedDate] = useState(() => {
    // Start with appointment's existing date as default
    return appointment.start ? new Date(appointment.start).toISOString().split('T')[0] : '';
  });
  const [requestedTime, setRequestedTime] = useState(() => {
    // Extract time from existing appointment
    if (appointment.start) {
      const date = new Date(appointment.start);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    return '';
  });
  const [requestedServiceIds, setRequestedServiceIds] = useState<string[]>([appointment.serviceId]);
  const [requestedNotes, setRequestedNotes] = useState(appointment.notes || '');
  const [reason, setReason] = useState('');
  
  // Availability state
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [bookedSlots, setBookedSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [findingNextDate, setFindingNextDate] = useState(false);
  const [nextAvailableDay, setNextAvailableDay] = useState<Date | null>(null);
  const [nextAvailableSlots, setNextAvailableSlots] = useState<string[]>([]);
  const [loadingNextDay, setLoadingNextDay] = useState(false);

  // Calculate total duration for selected services
  const totalDuration = useMemo(() => {
    const selectedServices = requestedServiceIds.map(id => services[id]).filter(Boolean);
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  }, [requestedServiceIds, services]);

  // Load business hours
  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchBusinessHours(db, setBusinessHours);
    return unsubscribe;
  }, [db]);

  // Find next available date when component loads or services change
  useEffect(() => {
    if (!db || !businessHours || requestedDate || totalDuration === 0) return;
    
    const findNextAvailableDate = async () => {
      setFindingNextDate(true);
      
      try {
        // Start from the day after the current appointment, or today if appointment is in the past
        const currentAppointmentDate = new Date(appointment.start);
        const today = new Date();
        const startDate = currentAppointmentDate > today ? 
          new Date(currentAppointmentDate.getTime() + 24 * 60 * 60 * 1000) : // Day after appointment
          new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        
        console.log('🔍 Finding next available date starting from:', startDate.toISOString());
        
        // Check up to 30 days ahead
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          
          // Fetch availability for this day
          const daySlots = await fetchAvailabilityForDay(db, checkDate);
          
          // Check if there are any available slots for this duration
          const availableSlots = availableSlotsFromAvailability(checkDate, totalDuration, businessHours, daySlots);
          
          if (availableSlots.length > 0) {
            console.log('✅ Found next available date:', checkDate.toISOString());
            setRequestedDate(checkDate.toISOString().split('T')[0]);
            break;
          }
        }
      } catch (error) {
        console.error('Error finding next available date:', error);
      } finally {
        setFindingNextDate(false);
      }
    };

    findNextAvailableDate();
  }, [db, businessHours, appointment.start, totalDuration]);

  // Function to find next available day with actual slots
  const findNextAvailableDayWithSlots = async (startDate: Date) => {
    if (!db || !businessHours || totalDuration === 0) return null;
    
    setLoadingNextDay(true);
    
    try {
      // First try to find next business day with actual available slots
      let nextBusinessDay = getNextValidBookingDateAfter(startDate, businessHours);
      
      // Check up to 30 days ahead for actual available slots
      for (let i = 0; i < 30 && nextBusinessDay; i++) {
        const checkDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        // Skip if this date is not a valid business day
        if (!isValidBookingDate(checkDate, businessHours)) continue;
        
        // Fetch availability for this day
        const daySlots = await fetchAvailabilityForDay(db, checkDate);
        
        // Check if there are any available slots for this duration
        const availableSlots = availableSlotsFromAvailability(checkDate, totalDuration, businessHours, daySlots);
        
        if (availableSlots.length > 0) {
          console.log('✅ Found next available day with slots:', checkDate.toISOString());
          setNextAvailableDay(checkDate);
          setNextAvailableSlots(availableSlots);
          setLoadingNextDay(false);
          
          // Auto-populate the date field with the next available day
          setRequestedDate(checkDate.toISOString().split('T')[0]);
          
          return checkDate;
        }
      }
      
      // If no slots found in 30 days, fall back to next business day
      if (nextBusinessDay) {
        setNextAvailableDay(nextBusinessDay);
        setNextAvailableSlots([]);
        
        // Auto-populate the date field with the next business day
        setRequestedDate(nextBusinessDay.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error finding next available day:', error);
    } finally {
      setLoadingNextDay(false);
    }
    
    return null;
  };

  // Load availability when date changes
  useEffect(() => {
    if (!requestedDate || !db || !businessHours) return;
    
    setLoadingAvailability(true);
    // Create date in local timezone to avoid timezone issues
    const dayDate = new Date(requestedDate + 'T00:00:00');
    
    console.log('🔍 Loading availability for date:', {
      requestedDate,
      dayDate: dayDate.toISOString(),
      dayDateLocal: dayDate.toLocaleDateString(),
      dayOfWeek: dayDate.getDay()
    });
    
    const unsubscribe = watchAvailabilityByDay(db, dayDate, (slots) => {
      console.log('📅 Received availability slots:', slots.length);
      setBookedSlots(slots);
      setLoadingAvailability(false);
      
      // If no slots available, find next available day
      const availableSlots = availableSlotsFromAvailability(dayDate, totalDuration, businessHours, slots);
      if (availableSlots.length === 0) {
        findNextAvailableDayWithSlots(dayDate);
      } else {
        // Clear next available day if current date has slots
        setNextAvailableDay(null);
        setNextAvailableSlots([]);
      }
    });
    
    return () => {
      unsubscribe();
      setLoadingAvailability(false);
    };
  }, [requestedDate, db, businessHours, totalDuration]);

  // Calculate available time slots
  const availableSlots = useMemo(() => {
    if (!businessHours || !requestedDate) return [];
    
    if (totalDuration === 0) return [];
    
    // Create date in local timezone to avoid timezone issues
    const dayDate = new Date(requestedDate + 'T00:00:00');
    console.log('🔍 EditRequestModal - Calculating slots for:', {
      requestedDate,
      dayDate: dayDate.toISOString(),
      dayDateLocal: dayDate.toLocaleDateString(),
      dayOfWeek: dayDate.getDay(),
      totalDuration,
      bookedSlotsCount: bookedSlots.length
    });
    
    try {
      const slots = availableSlotsFromAvailability(dayDate, totalDuration, businessHours, bookedSlots);
      console.log('✅ EditRequestModal - Generated slots:', slots.length, 'slots');
      console.log('📊 EditRequestModal - Booked slots:', bookedSlots.map(s => ({ start: s.start, end: s.end, status: s.status })));
      return slots;
    } catch (error) {
      console.error('❌ Error calculating available slots:', error);
      return [];
    }
  }, [businessHours, requestedDate, bookedSlots, totalDuration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // CRITICAL: Prevent submission if date/time not selected
    if (!requestedDate || !requestedTime) {
      alert('Please select both a date and time for your appointment');
      return;
    }
    
    // Construct ISO string properly with timezone handling
    const dateTime = new Date(`${requestedDate}T${requestedTime}:00`);
    
    // Double-check validity
    if (isNaN(dateTime.getTime())) {
      alert('Invalid date/time selected. Please choose a valid date and time.');
      return;
    }
    
    const changes: {
      start?: string;
      serviceIds?: string[];
      notes?: string;
      reason?: string;
    } = {};

    // Only include changes that are different from the original
    if (requestedDate && requestedTime) {
      const originalDateTime = new Date(appointment.start);
      
      if (dateTime.getTime() !== originalDateTime.getTime()) {
        changes.start = dateTime.toISOString(); // ✅ Always valid ISO string
      }
    }

    // Check if services have changed
    const originalServiceIds = [appointment.serviceId];
    const servicesChanged = JSON.stringify(requestedServiceIds.sort()) !== JSON.stringify(originalServiceIds.sort());
    if (servicesChanged) {
      changes.serviceIds = requestedServiceIds;
    }

    if (requestedNotes !== (appointment.notes || '')) {
      changes.notes = requestedNotes;
    }

    // Reason is now optional - only include if provided
    if (reason.trim()) {
      changes.reason = reason.trim();
    }

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      alert('No changes detected. Please make some changes before submitting.');
      return;
    }

    onSubmit(appointment, changes);
  };

  const currentService = services[appointment.serviceId];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Request Appointment Edit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Current Appointment Info */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Current Appointment</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><strong>Service:</strong> {currentService?.name || 'Unknown Service'}</p>
              <p><strong>Date:</strong> {safeFormatDate(appointment.start, 'EEEE, MMMM d, yyyy', 'Date TBD', `EditRequestModal ${appointment.id}`)}</p>
              <p><strong>Time:</strong> {safeFormatDate(appointment.start, 'h:mm a', 'Time TBD', `EditRequestModal ${appointment.id}`)} - {appointment.start && !isNaN(new Date(appointment.start).getTime()) ? format(new Date(new Date(appointment.start).getTime() + appointment.duration * 60000), 'h:mm a') : 'End Time TBD'}</p>
              {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Requested Changes */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Requested Changes</h3>
              
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Date {findingNextDate && <span className="text-sm text-slate-500">(Finding next available...)</span>}
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    disabled={findingNextDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Time
                  </label>
                  <input
                    type="time"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                  />
                </div>
              </div>

               {/* Available Time Slots */}
               {requestedDate && (
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-slate-700 mb-2">
                     Available Times for {format(new Date(requestedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                   </label>
                  {loadingAvailability ? (
                    <div className="text-sm text-slate-500 p-4 text-center">
                      Loading available times...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3">
                      {availableSlots.map((slot, index) => {
                        try {
                          // Handle both string and object formats
                          const slotISO = typeof slot === 'string' ? slot : (slot as any).startISO;
                          const slotDate = new Date(slotISO);
                          if (isNaN(slotDate.getTime())) {
                            console.error('Invalid date for slot:', slot, 'ISO:', slotISO);
                            return null;
                          }
                          
                          const slotTime = format(slotDate, 'h:mm a');
                          const timeString = format(slotDate, 'HH:mm');
                          const isSelected = requestedTime === timeString;
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setRequestedTime(timeString);
                              }}
                              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                isSelected
                                  ? 'bg-terracotta text-white border-terracotta'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {slotTime}
                            </button>
                          );
                        } catch (error) {
                          console.error('Error formatting slot time:', error, slot);
                          return null;
                        }
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-red-600 p-4 text-center border border-red-200 rounded-lg bg-red-50">
                        No available times for this date.
                      </div>
                      
                      {/* Next Available Day Section */}
                      {loadingNextDay ? (
                        <div className="text-sm text-blue-600 p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Finding next available day...
                          </div>
                        </div>
                      ) : nextAvailableDay ? (
                        <div className="border border-green-200 rounded-lg bg-green-50 p-4">
                          <div className="text-sm text-green-800 mb-3">
                            <strong>Next available day:</strong> {formatNextAvailableDate(nextAvailableDay)}
                          </div>
                          
                          {nextAvailableSlots.length > 0 ? (
                            <div>
                              <div className="text-sm text-green-700 mb-2">Available times:</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                {nextAvailableSlots.slice(0, 8).map((slot, index) => {
                                  try {
                                    const slotDate = new Date(slot);
                                    if (isNaN(slotDate.getTime())) return null;
                                    
                                    const slotTime = format(slotDate, 'h:mm a');
                                    
                                    return (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                          setRequestedDate(nextAvailableDay.toISOString().split('T')[0]);
                                          const timeString = format(slotDate, 'HH:mm');
                                          setRequestedTime(timeString);
                                        }}
                                        className="px-2 py-1 text-xs rounded border bg-white text-green-700 border-green-300 hover:bg-green-100 transition-colors"
                                      >
                                        {slotTime}
                                      </button>
                                    );
                                  } catch (error) {
                                    console.error('Error formatting next day slot:', error);
                                    return null;
                                  }
                                }).filter(Boolean)}
                              </div>
                              <div className="text-xs text-green-600 mt-2">
                                Click a time to select this day and time
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-green-700">
                              We're open this day - please select a time above
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-amber-600 p-4 text-center border border-amber-200 rounded-lg bg-amber-50">
                          Unable to find next available day. Please try a different date.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Service Selection - Multiple */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Services (You can choose multiple)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3">
                  {Object.values(services).map((service) => (
                    <label key={service.id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={requestedServiceIds.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequestedServiceIds([...requestedServiceIds, service.id]);
                          } else {
                            setRequestedServiceIds(requestedServiceIds.filter(id => id !== service.id));
                          }
                        }}
                        className="h-4 w-4 text-terracotta focus:ring-terracotta border-slate-300 rounded"
                      />
                      <div className="flex-grow">
                        <span className="text-sm font-medium text-slate-900">{service.name}</span>
                        <span className="text-sm text-slate-600 ml-2">${service.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {requestedServiceIds.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one service.</p>
                )}
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={requestedNotes}
                  onChange={(e) => setRequestedNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional notes for your appointment..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                />
              </div>

              {/* Reason for Change - Optional */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Change (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Please explain why you need to change this appointment (optional)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                />
              </div>
            </div>

            {/* Summary */}
            {(requestedDate || requestedTime || JSON.stringify(requestedServiceIds.sort()) !== JSON.stringify([appointment.serviceId].sort()) || requestedNotes !== (appointment.notes || '')) && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Change Summary</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  {requestedDate && requestedTime && (
                    <p><strong>New Date/Time:</strong> {format(new Date(`${requestedDate}T${requestedTime}`), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                  )}
                  {JSON.stringify(requestedServiceIds.sort()) !== JSON.stringify([appointment.serviceId].sort()) && (
                    <div>
                      <p><strong>New Services:</strong></p>
                      <ul className="ml-4 list-disc">
                        {requestedServiceIds.map(serviceId => (
                          <li key={serviceId}>{services[serviceId]?.name || 'Unknown Service'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {requestedNotes !== (appointment.notes || '') && (
                    <p><strong>New Notes:</strong> {requestedNotes || 'None'}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || requestedServiceIds.length === 0 || !requestedDate || !requestedTime}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Edit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
