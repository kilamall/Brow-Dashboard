import React, { useState, useRef, useEffect } from 'react';
import { format, startOfDay, addHours, isSameHour, isWithinInterval } from 'date-fns';
import type { Appointment, Service, ServiceCategory } from '@buenobrows/shared/types';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServiceCategories } from '@buenobrows/shared/firestoreActions';

interface Props {
  date: Date;
  appointments: Appointment[];
  services: Record<string, Service>;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (time: Date) => void;
}

export default function CalendarDayView({ date, appointments, services, onAppointmentClick, onTimeSlotClick }: Props) {
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
    const apptDate = new Date(appt.start);
    return format(apptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && appt.status !== 'cancelled';
  });

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = new Date(appointment.start);
    const end = new Date(start.getTime() + appointment.duration * 60000);
    
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    // Calculate position (top offset)
    const topOffset = ((startHour - 6) * 60 + startMinute) * (80 / 60); // 80px per hour
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (80 / 60);
    
    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 20)}px`, // Minimum height of 20px
    };
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
    console.log('Dragging to hour:', newHour);
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
            const service = services[appointment.serviceId];
            const categoryName = service?.category;
            const categoryColor = categoryName ? categoryColors[categoryName] : null;
            
            // Use category color or fallback to default colors
            const backgroundColor = categoryColor ? `${categoryColor}20` : '#E0E7FF'; // 20 = 12.5% opacity
            const borderColor = categoryColor || '#6366F1';
            const textColor = categoryColor || '#4338CA';
            
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
                    {format(new Date(appointment.start), 'h:mm a')}
                  </div>
                  {appointment.duration < 60 ? (
                    // Compact layout for short appointments
                    <>
                      <div className="text-xs font-medium truncate">
                        {service?.name || 'Service'} · {appointment.customerName}
                      </div>
                      <div className="text-xs opacity-75">{appointment.duration} min</div>
                    </>
                  ) : (
                    // Full layout for longer appointments
                    <>
                      <div className="text-xs font-medium truncate">
                        {service?.name || 'Unknown Service'}
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
