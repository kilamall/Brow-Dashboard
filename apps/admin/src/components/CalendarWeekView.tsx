import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, addHours, startOfDay } from 'date-fns';
import type { Appointment, Service, ServiceCategory, BusinessHours, DayClosure, SpecialHours } from '@buenobrows/shared/types';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServiceCategories, watchBusinessHours, watchDayClosures, watchSpecialHours } from '@buenobrows/shared/firestoreActions';
import { getEffectiveHoursForDate } from '@buenobrows/shared/slotUtils';

interface Props {
  weekStartDate: Date;
  appointments: Appointment[];
  services: Record<string, Service>;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (date: Date, time: Date) => void;
}

export default function CalendarWeekView({ 
  weekStartDate, 
  appointments, 
  services, 
  onAppointmentClick, 
  onTimeSlotClick 
}: Props) {
  const { db } = useFirebase();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);

  // Load service categories and business hours
  useEffect(() => {
    if (!db) return;
    
    const unsubCategories = watchServiceCategories(db, setCategories);
    const unsubBusinessHours = watchBusinessHours(db, setBusinessHours);
    const unsubClosures = watchDayClosures(db, setClosures);
    const unsubSpecial = watchSpecialHours(db, setSpecialHours);
    
    return () => {
      unsubCategories();
      unsubBusinessHours();
      unsubClosures();
      unsubSpecial();
    };
  }, [db]);

  // Create a map of category names to colors
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);

  // Generate 7 days starting from weekStartDate (Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(weekStartDate, { weekStartsOn: 0 }), i));

  // Generate hourly time slots (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => addHours(startOfDay(new Date()), i + 6));

  // Check if a day is open
  const isDayOpen = (date: Date): boolean => {
    if (!businessHours) return false;
    
    try {
      const effectiveHours = getEffectiveHoursForDate(date, businessHours, closures, specialHours);
      return effectiveHours !== null && effectiveHours.length > 0;
    } catch (error) {
      console.error('Error determining if day is open:', error);
      return false;
    }
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appt => {
      try {
        const apptDate = new Date(appt.start);
        return !isNaN(apptDate.getTime()) && 
               isSameDay(apptDate, date) && 
               appt.status !== 'cancelled';
      } catch {
        return false;
      }
    });
  };

  // Calculate appointment position within the time slot
  const getAppointmentPosition = (appointment: Appointment) => {
    try {
      const start = new Date(appointment.start);
      if (isNaN(start.getTime())) {
        return { top: 0, height: 20 };
      }
      
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      
      // Calculate position (top offset from 6 AM)
      const topOffset = ((startHour - 6) * 60 + startMinute) * (64 / 60); // 64px per hour
      const height = appointment.duration * (64 / 60);
      
      return {
        top: Math.max(0, topOffset),
        height: Math.max(20, height), // Minimum height of 20px
      };
    } catch {
      return { top: 0, height: 20 };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      {/* Week Header */}
      <div className="bg-slate-50 border-b px-6 py-4">
        <h3 className="font-semibold text-lg text-slate-800">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} this week
        </p>
      </div>

      {/* Calendar Grid - Fixed Width Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full min-w-[1200px]">
          {/* Day Headers */}
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="w-16 p-3 border-r bg-slate-50 text-right text-xs text-slate-500 font-medium">
                Time
              </th>
              {weekDays.map((day, index) => {
                const isOpen = isDayOpen(day);
                const isToday = isSameDay(day, new Date());
                const dayAppointments = getAppointmentsForDay(day);
                
                return (
                  <th 
                    key={index} 
                    className={`w-[calc((100%-4rem)/7)] px-3 py-3 border-r transition-colors ${
                      isOpen 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    } ${isToday ? 'ring-2 ring-terracotta ring-inset' : ''}`}
                  >
                    <div className="text-center">
                      <div className={`text-xs font-medium ${
                        isOpen ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg font-semibold ${
                        isToday ? 'text-terracotta' : isOpen ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      {dayAppointments.length > 0 && (
                        <div className="text-xs text-slate-600 mt-1">
                          {dayAppointments.length} appt{dayAppointments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Time Slots and Appointments */}
          <tbody className="relative">
            {timeSlots.map((time, timeIndex) => (
              <tr key={timeIndex} className="border-b border-slate-100">
                {/* Time Label */}
                <td className="w-16 p-2 border-r bg-slate-50 text-right">
                  <span className="text-xs text-slate-500 font-medium">
                    {format(time, 'h a')}
                  </span>
                </td>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const isOpen = isDayOpen(day);
                  const timeSlotDate = new Date(day);
                  timeSlotDate.setHours(time.getHours(), 0, 0, 0);
                  
                  return (
                    <td
                      key={dayIndex}
                      className={`w-[calc((100%-4rem)/7)] h-16 border-r relative transition-colors ${
                        isOpen 
                          ? 'bg-white hover:bg-green-50 cursor-pointer' 
                          : 'bg-red-50/30 cursor-not-allowed'
                      }`}
                      onClick={() => isOpen && onTimeSlotClick(day, timeSlotDate)}
                    >
                      {/* Quarter hour markers */}
                      <div className="absolute left-0 right-0 top-4 h-px bg-slate-50" />
                      <div className="absolute left-0 right-0 top-8 h-px bg-slate-50" />
                      <div className="absolute left-0 right-0 top-12 h-px bg-slate-50" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Appointments Overlay - Positioned relative to table body */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ top: '64px' }}>
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            
            return (
              <div
                key={dayIndex}
                className="absolute top-0"
                style={{
                  left: `calc(64px + ${dayIndex * (100 / 7)}%)`,
                  width: `calc(100% / 7)`,
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                {dayAppointments.map((appointment) => {
                  const service = services[appointment.serviceId];
                  const categoryName = service?.category;
                  const categoryColor = categoryName ? categoryColors[categoryName] : null;
                  
                  // Use category color or fallback to default colors
                  const backgroundColor = categoryColor ? `${categoryColor}20` : '#E0E7FF';
                  const borderColor = categoryColor || '#6366F1';
                  const textColor = categoryColor || '#4338CA';
                  
                  const position = getAppointmentPosition(appointment);
                  
                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 rounded-md border-2 cursor-pointer transition-all hover:shadow-md hover:z-10"
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        backgroundColor,
                        borderColor,
                        color: textColor,
                        pointerEvents: 'auto',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="p-1 h-full flex flex-col overflow-hidden">
                        <div className="font-semibold text-[10px] truncate">
                          {(() => {
                            try {
                              const startDate = new Date(appointment.start);
                              return !isNaN(startDate.getTime()) 
                                ? format(startDate, 'h:mm a') 
                                : 'Invalid';
                            } catch {
                              return 'Invalid';
                            }
                          })()}
                        </div>
                        {position.height > 40 && (
                          <>
                            <div className="text-[10px] font-medium truncate">
                              {service?.name || 'Service'}
                            </div>
                            {position.height > 60 && (
                              <div className="text-[9px] truncate opacity-75">
                                {appointment.customerName}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const todayIndex = weekDays.findIndex(day => isSameDay(day, now));
            
            if (todayIndex === -1) return null;
            
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            if (currentHour < 6 || currentHour >= 23) return null;
            
            const topOffset = ((currentHour - 6) * 60 + currentMinute) * (64 / 60);
            
            return (
              <div
                className="absolute h-0.5 bg-red-500 z-20"
                style={{
                  top: `${topOffset}px`,
                  left: `calc(64px + ${todayIndex * (100 / 7)}%)`,
                  width: `calc(100% / 7)`,
                }}
              >
                <div className="absolute left-0 top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1 -translate-y-0.5" />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 border-t px-6 py-3">
        <div className="flex items-center gap-6 text-xs flex-wrap">
          {/* Day Status Legend */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Day Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 bg-green-50 border-green-300" />
              <span className="text-slate-600">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 bg-red-50 border-red-300" />
              <span className="text-slate-600">Closed</span>
            </div>
          </div>

          {/* Service Categories Legend */}
          <div className="flex items-center gap-3">
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
        
        {/* Scroll hint */}
        <div className="mt-2 text-xs text-slate-500 text-center">
          💡 Tip: Scroll horizontally to see all days of the week
        </div>
      </div>
    </div>
  );
}