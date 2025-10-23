import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchBusinessHours, watchDayClosures, watchSpecialHours } from '@buenobrows/shared/firestoreActions';
import { getEffectiveHoursForDate } from '@buenobrows/shared/slotUtils';
import type { BusinessHours, DayClosure, SpecialHours } from '@buenobrows/shared/types';
import { isSameDay } from 'date-fns';

interface CalendarDayHighlightingProps {
  date: Date;
  className?: string;
  children: React.ReactNode;
}

export default function CalendarDayHighlighting({ 
  date, 
  className = '', 
  children 
}: CalendarDayHighlightingProps) {
  const { db } = useFirebase();
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Watch business hours, closures, and special hours
  useEffect(() => {
    if (!db) return;
    
    const unsubBusinessHours = watchBusinessHours(db, setBusinessHours);
    const unsubClosures = watchDayClosures(db, setClosures);
    const unsubSpecial = watchSpecialHours(db, setSpecialHours);
    
    return () => {
      unsubBusinessHours();
      unsubClosures();
      unsubSpecial();
    };
  }, [db]);

  // Determine if the day is open
  useEffect(() => {
    if (!businessHours) {
      setIsOpen(false);
      return;
    }

    try {
      const effectiveHours = getEffectiveHoursForDate(date, businessHours, closures, specialHours);
      setIsOpen(effectiveHours !== null && effectiveHours.length > 0);
    } catch (error) {
      console.error('Error determining if day is open:', error);
      setIsOpen(false);
    }
  }, [date, businessHours, closures, specialHours]);

  // Determine highlighting classes
  const getHighlightingClasses = () => {
    if (!isOpen) {
      return 'border-red-200 bg-red-50'; // Closed day - red border
    }
    
    // Open day - green border
    return 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100';
  };

  return (
    <div className={`${getHighlightingClasses()} ${className} transition-all duration-200`}>
      {children}
    </div>
  );
}

// Hook for checking if a specific date is open
export function useIsDayOpen(date: Date) {
  const { db } = useFirebase();
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Watch business hours, closures, and special hours
  useEffect(() => {
    if (!db) return;
    
    const unsubBusinessHours = watchBusinessHours(db, setBusinessHours);
    const unsubClosures = watchDayClosures(db, setClosures);
    const unsubSpecial = watchSpecialHours(db, setSpecialHours);
    
    return () => {
      unsubBusinessHours();
      unsubClosures();
      unsubSpecial();
    };
  }, [db]);

  // Determine if the day is open
  useEffect(() => {
    if (!businessHours) {
      setIsOpen(false);
      setLoading(false);
      return;
    }

    try {
      const effectiveHours = getEffectiveHoursForDate(date, businessHours, closures, specialHours);
      setIsOpen(effectiveHours !== null && effectiveHours.length > 0);
    } catch (error) {
      console.error('Error determining if day is open:', error);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, [date, businessHours, closures, specialHours]);

  return { isOpen, loading };
}

