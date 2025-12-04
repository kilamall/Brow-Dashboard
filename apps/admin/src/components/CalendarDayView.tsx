import React, { useState, useRef, useEffect } from 'react';
import { format, startOfDay, addHours, isSameHour, isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { Appointment, Service, ServiceCategory, BusinessHours, DayClosure, SpecialHours } from '@buenobrows/shared/types';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServiceCategories } from '@buenobrows/shared/firestoreActions';
import { formatInBusinessTZ, getBusinessTimezone } from '@buenobrows/shared/timezoneUtils';

interface Props {
  date: Date;
  appointments: Appointment[];
  services: Record<string, Service>;
  businessHours: BusinessHours | null;
  closures: DayClosure[];
  specialHours: SpecialHours[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (time: Date) => void;
}

export default function CalendarDayView({ date, appointments, services, businessHours, closures, specialHours, onAppointmentClick, onTimeSlotClick }: Props) {
  const { db } = useFirebase();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [dragStart, setDragStart] = useState<{ appointment: Appointment; offsetY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load service categories
  useEffect(() => {
    const unsubscribe = watchServiceCategories(db, setCategories);
    return unsubscribe;
  }, [db]);

  // Create a map of category names to colors
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);

  // Generate hourly time slots (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => addHours(startOfDay(date), i + 6));

  // Filter appointments for this day
  const dayAppointments = appointments.filter(appt => {
    try {
      const apptDate = new Date(appt.start);
      return !isNaN(apptDate.getTime()) && format(apptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && appt.status !== 'cancelled';
    } catch {
      return false;
    }
  });

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    try {
      const start = new Date(appointment.start);
      if (isNaN(start.getTime())) {
        return { top: '0px', height: '20px' };
      }
      const end = new Date(start.getTime() + appointment.duration * 60000);
    
      // CRITICAL: Convert to business timezone for position calculation
      // Otherwise appointments show at wrong position when admin is traveling
      const businessTZ = getBusinessTimezone(businessHours);
      const startInBusinessTZ = toZonedTime(start, businessTZ);
      const endInBusinessTZ = toZonedTime(end, businessTZ);
    
    const startHour = startInBusinessTZ.getHours();
    const startMinute = startInBusinessTZ.getMinutes();
    const endHour = endInBusinessTZ.getHours();
    const endMinute = endInBusinessTZ.getMinutes();
    
    // Calculate position (top offset)
    const topOffset = ((startHour - 6) * 60 + startMinute) * (80 / 60); // 80px per hour
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (80 / 60);
    
      return {
        top: `${topOffset}px`,
        height: `${Math.max(height, 20)}px`, // Minimum height of 20px
      };
    } catch {
      return { top: '0px', height: '20px' };
    }
  };

  const handleMouseDown = (e: React.MouseEvent, appointment: Appointment) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragStart({
      appointment,
      offsetY: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const y = e.clientY - rect.top;
    const hourHeight = 80; // 80px per hour
    const newHour = Math.max(6, Math.min(22, Math.floor((y - dragStart.offsetY) / hourHeight) + 6));
    
    // Update appointment time (this would need to be implemented with proper backend calls)
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b px-6 py-4">
        <h3 className="font-semibold text-lg text-slate-800">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Business Hours Display */}
      {businessHours && (
        <div className="bg-slate-50 border-l-4 border-terracotta rounded-lg p-3 mx-6 my-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">
              {(() => {
                const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] as keyof typeof businessHours.slots;
                const ranges = businessHours.slots[dayKey];
                if (ranges && ranges.length > 0) {
                  const hours = ranges.map(([s, e]) => {
                    const formatTime = (t: string) => {
                      const [h, m] = t.split(':');
                      const hour = parseInt(h);
                      if (hour === 0) return '12:' + m + ' AM';
                      if (hour < 12) return hour + ':' + m + ' AM';
                      if (hour === 12) return '12:' + m + ' PM';
                      return (hour - 12) + ':' + m + ' PM';
                    };
                    return `${formatTime(s)} - ${formatTime(e)}`;
                  }).join(', ');
                  return `Open: ${hours}`;
                }
                return 'Closed Today';
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="relative">
        {/* Time Labels */}
        <div className="absolute left-0 top-0 w-16 bg-slate-50 border-r">
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className="h-20 border-b border-slate-200 flex items-start justify-end pr-2 pt-1"
            >
              <span className="text-xs text-slate-500 font-medium">
                {format(time, 'h:mm a')}
              </span>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div 
          ref={containerRef}
          className="ml-16 relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className="h-20 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative"
              onClick={() => onTimeSlotClick(time)}
            >
              {/* Hour marker line */}
              <div className="absolute left-0 right-0 top-0 h-px bg-slate-200" />
              
              {/* 15-minute markers */}
              <div className="absolute left-0 right-0 top-5 h-px bg-slate-100" />
              <div className="absolute left-0 right-0 top-10 h-px bg-slate-100" />
              <div className="absolute left-0 right-0 top-15 h-px bg-slate-100" />
            </div>
          ))}

          {/* Appointments */}
          {dayAppointments.map((appointment) => {
            // Handle both single serviceId and multiple serviceIds
            const serviceIds = (appointment as any).serviceIds || (appointment as any).selectedServices || [];
            const hasMultipleServices = serviceIds.length > 1;
            
            // Get all services
            const allServices = serviceIds.length > 0 
              ? serviceIds.map((serviceId: string) => services[serviceId]).filter(Boolean)
              : [services[appointment.serviceId]].filter(Boolean);
            
            // Use first service for category color
            const firstService = allServices[0];
            const categoryName = firstService?.category;
            const categoryColor = categoryName ? categoryColors[categoryName] : null;
            
            // Use category color or fallback to default colors
            const backgroundColor = categoryColor ? `${categoryColor}20` : '#E0E7FF'; // 20 = 12.5% opacity
            const borderColor = categoryColor || '#6366F1';
            const textColor = categoryColor || '#4338CA';
            
            // Create service display string with quantities
            const serviceDisplay = (() => {
              if (!hasMultipleServices) {
                return firstService?.name || 'Service';
              }
              
              // Count occurrences of each service for multi-guest bookings
              const serviceCounts: Record<string, number> = {};
              serviceIds.forEach((id: string) => {
                serviceCounts[id] = (serviceCounts[id] || 0) + 1;
              });
              
              const uniqueServiceIds = Object.keys(serviceCounts);
              
              // If we have quantities (same service multiple times)
              if (uniqueServiceIds.length < serviceIds.length) {
                return uniqueServiceIds.map((id, idx) => {
                  const svc = services[id];
                  const count = serviceCounts[id];
                  return `${svc?.name || 'Service'}${count > 1 ? ` ×${count}` : ''}`;
                }).join(', ');
              }
              
              // Otherwise show first two + count
              return `${allServices[0]?.name || 'Service'}, ${allServices[1]?.name || ''}${allServices.length > 2 ? ` +${allServices.length - 2}` : ''}`;
            })();
            
            return (
              <div
                key={appointment.id}
                className="absolute left-1 right-1 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                style={{
                  ...getAppointmentStyle(appointment),
                  backgroundColor,
                  borderColor,
                  color: textColor,
                }}
                onClick={() => onAppointmentClick(appointment)}
                onMouseDown={(e) => handleMouseDown(e, appointment)}
              >
                <div className="p-2 h-full flex flex-col justify-between">
                  <div className="font-semibold text-xs truncate">
                    {(() => {
                      try {
                        const startDate = new Date(appointment.start);
                        return !isNaN(startDate.getTime()) ? formatInBusinessTZ(startDate, 'h:mm a', getBusinessTimezone(businessHours)) : 'Invalid time';
                      } catch {
                        return 'Invalid time';
                      }
                    })()}
                  </div>
                  {appointment.duration < 60 ? (
                    // Compact layout for short appointments
                    <>
                      <div className="text-xs font-medium truncate">
                        {serviceDisplay} · {appointment.customerName}
                        {appointment.isGroupBooking && (
                          <span className="ml-1 inline-flex items-center text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                            👥
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-75">{appointment.duration} min</div>
                    </>
                  ) : (
                    // Full layout for longer appointments
                    <>
                      <div className="text-xs font-medium truncate flex items-center gap-1">
                        <span className="truncate">{serviceDisplay}</span>
                        {appointment.isGroupBooking && (
                          <span className="inline-flex items-center text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                            👥 Multi
                          </span>
                        )}
                      </div>
                      <div className="text-xs truncate opacity-75">
                        {appointment.customerName}
                      </div>
                      <div className="text-xs opacity-75">{appointment.duration} min</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const isToday = format(now, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            if (!isToday) return null;
            
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const topOffset = ((currentHour - 6) * 60 + currentMinute) * (80 / 60);
            
            return (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                style={{ top: `${topOffset}px` }}
              >
                <div className="absolute left-0 top-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1.5 -translate-y-1" />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Legend - Service Categories */}
      <div className="bg-slate-50 border-t px-6 py-3">
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span className="text-slate-600 font-medium">Service Categories:</span>
          {categories.filter(cat => cat.active).map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded border-2" 
                style={{ 
                  backgroundColor: `${category.color}20`,
                  borderColor: category.color 
                }}
              />
              <span className="text-slate-600">{category.name}</span>
            </div>
          ))}
          {categories.filter(cat => cat.active).length === 0 && (
            <span className="text-slate-400 italic">No categories defined yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
