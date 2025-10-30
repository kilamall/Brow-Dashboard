import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { createStaff, updateStaff, deleteStaff, watchStaff, watchBusinessHours, watchDayClosures, watchSpecialHours } from '@buenobrows/shared/firestoreActions';
import type { Appointment, Service, Staff, AppointmentEditRequest, BusinessHours, DayClosure, SpecialHours } from '@buenobrows/shared/types';
import AddAppointmentModal from '@/components/AddAppointmentModal';
import EnhancedAppointmentDetailModal from '@/components/EnhancedAppointmentDetailModal';
import EditAppointmentModal from '@/components/EditAppointmentModal';
import CalendarDayView from '@/components/CalendarDayView';
import CalendarWeekView from '@/components/CalendarWeekView';
import EditRequestConfirmModal from '@/components/EditRequestConfirmModal';
import EditRequestsModal from '@/components/EditRequestsModal';
import AttendanceConfirmationModal from '@/components/AttendanceConfirmationModal';
import NoShowConfirmationModal from '@/components/NoShowConfirmationModal';
import CalendarDayHighlighting from '@/components/CalendarDayHighlighting';
import {
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  parseISO,
} from 'date-fns';

// Helper function to safely parse dates
function safeParseDate(dateString: string): Date {
  try {
    const parsed = parseISO(dateString);
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : new Date(dateString);
  } catch {
    return new Date();
  }
}

// Helper function to safely format appointment time range
function formatAppointmentTimeRange(start: string, duration: number): string {
  try {
    const startDate = safeParseDate(start);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  } catch {
    return 'Time TBD';
  }
}

export default function Schedule() {
  const { db, auth } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const functions = getFunctions();
  const [month, setMonth] = useState<Date>(() => new Date()); // current visible month
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [markingAttendanceIds, setMarkingAttendanceIds] = useState<Set<string>>(new Set());
  const [attendanceModal, setAttendanceModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
    service: Service | null;
  }>({ open: false, appointment: null, service: null });
  const [noShowModal, setNoShowModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
    service: Service | null;
  }>({ open: false, appointment: null, service: null });

  const handleMarkAttended = (appointmentId: string) => {
    const appointment = appts.find(a => a.id === appointmentId);
    const service = appointment ? services[appointment.serviceId] : null;
    
    if (!appointment || !service) {
      alert('Appointment or service not found');
      return;
    }
    
    setAttendanceModal({
      open: true,
      appointment,
      service
    });
  };

  const handleAttendanceConfirmed = () => {
    setAttendanceModal({ open: false, appointment: null, service: null });
    // Data will auto-refresh from Firestore listener
  };

  const handleMarkNoShow = (appointmentId: string) => {
    const appointment = appts.find(a => a.id === appointmentId);
    const service = appointment ? services[appointment.serviceId] : null;
    
    if (!appointment || !service) {
      alert('Appointment or service not found');
      return;
    }
    
    setNoShowModal({
      open: true,
      appointment,
      service
    });
  };

  const handleNoShowConfirmed = async () => {
    if (!noShowModal.appointment) return;
    
    const appointmentId = noShowModal.appointment.id;
    const customerName = noShowModal.appointment.customerName || 'Customer';
    
    setMarkingAttendanceIds(prev => new Set(prev).add(appointmentId));
    try {
      const markAttendanceFn = httpsCallable(functions, 'markAttendance');
      await markAttendanceFn({ appointmentId, attendance: 'no-show' });
      alert(`✅ ${customerName} marked as no-show. Email notification sent.`);
    } catch (error: any) {
      console.error('Error marking no-show:', error);
      alert(`Failed to mark no-show: ${error.message}`);
    } finally {
      setMarkingAttendanceIds(prev => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
      setNoShowModal({ open: false, appointment: null, service: null });
    }
  };

  const handleQuickConfirm = async (appointmentId: string) => {
    if (!confirm('Confirm this appointment?')) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { 
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    }
  };

  const handleQuickDeny = async (appointmentId: string) => {
    if (!confirm('Deny this appointment?')) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { 
        status: 'cancelled',
        cancelledBy: 'admin',
        updatedAt: new Date().toISOString()
      });
      
      // Delete associated edit requests
      const editRequestsQuery = query(
        collection(db, 'appointmentEditRequests'),
        where('appointmentId', '==', appointmentId)
      );
      const editRequestsSnap = await getDocs(editRequestsQuery);
      const deletePromises = editRequestsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error denying appointment:', error);
      alert('Failed to deny appointment. Please try again.');
    }
  };

  const handleChangeAttendance = async (appointmentId: string, newAttendance: 'attended' | 'no-show') => {
    const appointment = appts.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const currentStatus = appointment.attendance || 'pending';
    const customerName = appointment.customerName || 'Customer';
    
    // Prompt for override reason
    const reason = prompt(
      `Change attendance from "${currentStatus}" to "${newAttendance}"?\n\n` +
      `Customer: ${customerName}\n` +
      `Please provide a reason for this change:\n` +
      `(e.g., "Customer arrived late", "Marked by mistake", etc.)`
    );
    
    if (!reason || reason.trim() === '') {
      alert('Override reason is required to change attendance status.');
      return;
    }
    
    if (!confirm(
      `Change attendance for ${customerName}?\n\n` +
      `From: ${currentStatus}\n` +
      `To: ${newAttendance}\n` +
      `Reason: ${reason}\n\n` +
      `${currentStatus === 'no-show' && newAttendance === 'attended' ? 'Note: This will decrement their no-show count.' : ''}`
    )) {
      return;
    }
    
    setMarkingAttendanceIds(prev => new Set(prev).add(appointmentId));
    
    try {
      const functions = getFunctions();
      const markAttendance = httpsCallable(functions, 'markAttendance');
      
      const result = await markAttendance({
        appointmentId,
        attendance: newAttendance,
        overrideReason: reason.trim()
      });
      
      console.log('✅ Attendance changed:', result.data);
      alert(`✅ ${customerName} marked as ${newAttendance}. Email notification sent.`);
    } catch (error: any) {
      console.error('❌ Error changing attendance:', error);
      alert(`Failed to change attendance: ${error.message}`);
    } finally {
      setMarkingAttendanceIds(prev => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };

  const [layout, setLayout] = useState<'grid' | 'week' | 'day'>('grid');
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [multiEmployee, setMultiEmployee] = useState(false);
  const [showStaffManager, setShowStaffManager] = useState(false);
  const [allAppts, setAllAppts] = useState<Appointment[]>([]);
  const [editRequests, setEditRequests] = useState<AppointmentEditRequest[]>([]);
  const [confirmingRequest, setConfirmingRequest] = useState<AppointmentEditRequest | null>(null);
  const [approvingEdit, setApprovingEdit] = useState(false);
  const [showEditRequestsModal, setShowEditRequestsModal] = useState(false);
  const [showScrollToCalendar, setShowScrollToCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Business hours data for week view
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);

  // Scroll to calendar function
  const scrollToCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Helper function to get button state
  const getButtonState = (buttonLayout: 'grid' | 'week' | 'day') => {
    return buttonLayout === layout;
  };

  // Check if calendar is in view
  useEffect(() => {
    const handleScroll = () => {
      if (calendarRef.current) {
        const rect = calendarRef.current.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.top <= window.innerHeight * 0.5;
        setShowScrollToCalendar(!isInView && (layout === 'grid' || layout === 'week' || layout === 'day'));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [layout]);
  
  // Get quick rebook data from navigation state
  const locationState = location.state as {
    quickRebook?: {
      customerId?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      serviceId?: string;
      date?: string;
    };
  } | null;

  // Build grid range (start Sunday..Sat end) covering the current month
  const gridStart = useMemo(() => startOfWeek(startOfMonth(month), { weekStartsOn: 0 }), [month]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(month), { weekStartsOn: 0 }), [month]);
  
  // For day view, use the selected day's month
  const effectiveMonth = useMemo(() => {
    if (layout === 'day') {
      return selectedDay;
    }
    return month;
  }, [layout, selectedDay, month]);
  
  // Build range based on current view
  const queryStart = useMemo(() => {
    if (layout === 'day') {
      return startOfDay(selectedDay);
    }
    return gridStart;
  }, [layout, selectedDay, gridStart]);
  
  const queryEnd = useMemo(() => {
    if (layout === 'day') {
      return endOfDay(selectedDay);
    }
    return gridEnd;
  }, [layout, selectedDay, gridEnd]);

  // Live appts in this grid range
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [apptsError, setApptsError] = useState<string | null>(null);
  useEffect(() => {
    if (!db) {
      setApptsError('Database not initialized');
      return;
    }
    
    try {
      const qy = query(
        collection(db, 'appointments'),
        where('start', '>=', queryStart.toISOString()),
        where('start', '<=', queryEnd.toISOString()),
        orderBy('start', 'asc')
      );
      return onSnapshot(
        qy, 
        (snap) => {
          try {
            const rows: Appointment[] = [];
            snap.forEach((d) => {
              const data = d.data();
              if (data) {
                rows.push({ id: d.id, ...data } as Appointment);
              }
            });
            setAppts(rows);
            setApptsError(null);
          } catch (error) {
            console.error('Error processing appointments:', error);
            setApptsError('Error loading appointments');
          }
        },
        (error) => {
          console.error('Error fetching appointments:', error);
          setApptsError('Unable to load appointments. Please refresh the page.');
        }
      );
    } catch (error) {
      console.error('Error setting up appointments query:', error);
      setApptsError('Error initializing appointments');
      return;
    }
  }, [queryStart, queryEnd, db]); // eslint-disable-line react-hooks/exhaustive-deps

  // Services map for names
  const [services, setServices] = useState<Record<string, Service>>({});
  const [servicesError, setServicesError] = useState<string | null>(null);
  useEffect(() => {
    if (!db) {
      setServicesError('Database not initialized');
      return;
    }
    
    try {
      const ref = collection(db, 'services');
      return onSnapshot(
        query(ref, orderBy('name', 'asc')), 
        (snap) => {
          try {
            const map: Record<string, Service> = {};
            snap.forEach((d) => {
              const data = d.data();
              if (data) {
                map[d.id] = { id: d.id, ...data } as Service;
              }
            });
            setServices(map);
            setServicesError(null);
          } catch (error) {
            console.error('Error processing services:', error);
            setServicesError('Error loading services');
          }
        },
        (error) => {
          console.error('Error fetching services:', error);
          setServicesError('Unable to load services. Please refresh the page.');
        }
      );
    } catch (error) {
      console.error('Error setting up services query:', error);
      setServicesError('Error initializing services');
      return;
    }
  }, [db]); // eslint-disable-line react-hooks/exhaustive-deps

  const days: Date[] = useMemo(() => {
    const list: Date[] = [];
    const current = new Date(gridStart);
    const end = new Date(gridEnd);
    
    // Add safety check to prevent infinite loops
    let iterations = 0;
    const maxIterations = 50; // Should never need more than 6 weeks
    
    // Use date-fns addDays to handle DST transitions properly
    while (current <= end && iterations < maxIterations) {
      list.push(new Date(current));
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    
    // Debug logging for calendar issues
    if (iterations >= maxIterations) {
      console.error('Calendar days calculation hit max iterations:', {
        gridStart: gridStart.toISOString(),
        gridEnd: gridEnd.toISOString(),
        current: current.toISOString(),
        listLength: list.length
      });
    }
    
    return list;
  }, [gridStart, gridEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; position: 'above' | 'below' } | null>(null);
  const [openAdd, setOpenAdd] = useState<{ open: boolean; date: Date | null; prefillData?: any }>({ open: false, date: null });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Handle opening appointment from URL query parameter (e.g., from email link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get('appointmentId');
    
    if (appointmentId && allAppts.length > 0) {
      const appointment = allAppts.find(apt => apt.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        
        // Navigate to the appointment's date
        const appointmentDate = safeParseDate(appointment.start);
        setMonth(appointmentDate);
        setSelectedDay(appointmentDate);
        
        // Clear the query parameter to prevent reopening on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [location.search, allAppts]);

  // Handle quick rebook from location state
  useEffect(() => {
    if (locationState?.quickRebook) {
      const { quickRebook } = locationState;
      // Parse the date and set the month view
      const rebookDate = quickRebook.date ? parseISO(quickRebook.date) : new Date();
      setMonth(rebookDate);
      setSelectedDay(rebookDate);
      
      // Open the add appointment modal with prefilled data
      setOpenAdd({
        open: true,
        date: rebookDate,
        prefillData: {
          customerId: quickRebook.customerId,
          customerName: quickRebook.customerName,
          customerEmail: quickRebook.customerEmail,
          customerPhone: quickRebook.customerPhone,
          serviceId: quickRebook.serviceId
        }
      });
      
      // Clear the location state to prevent reopening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  // Calculate smart positioning for hover popup
  const calculateHoverPosition = (cellElement: HTMLElement): { x: number; y: number; position: 'above' | 'below' } => {
    try {
      const rect = cellElement.getBoundingClientRect();
      const popupHeight = 200; // Approximate height
      const popupWidth = 256; // w-64 = 256px
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Determine if popup should go above or below
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const position: 'above' | 'below' = spaceBelow < popupHeight + 16 && spaceAbove > spaceBelow ? 'above' : 'below';
      
      // Calculate horizontal position
      let x = rect.left + rect.width / 2 - popupWidth / 2;
      
      // Adjust if popup would go off the left edge
      if (x < 16) {
        x = 16;
      }
      
      // Adjust if popup would go off the right edge
      if (x + popupWidth > viewportWidth - 16) {
        x = viewportWidth - popupWidth - 16;
      }
      
      // Calculate vertical position
      const y = position === 'above' ? rect.top - 8 : rect.bottom + 8;
      
      return { x, y, position };
    } catch (error) {
      console.error('Error calculating hover position:', error);
      // Return a safe default position
      return { x: 100, y: 100, position: 'below' as const };
    }
  };

  // Persist layout and multiEmployee state
  useEffect(() => {
    const savedLayout = localStorage.getItem('scheduleLayout');
    const savedMultiEmployee = localStorage.getItem('scheduleMultiEmployee');
    if (savedLayout && (savedLayout === 'grid' || savedLayout === 'week' || savedLayout === 'day')) {
      setLayout(savedLayout as 'grid' | 'week' | 'day');
    }
    if (savedMultiEmployee) {
      setMultiEmployee(savedMultiEmployee === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleLayout', layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('scheduleMultiEmployee', String(multiEmployee));
  }, [multiEmployee]);


  // Load all appointments for the appointment cards
  useEffect(() => {
    if (!db) return;
    
    const ref = collection(db, 'appointments');
    const qy = query(ref, orderBy('start', 'desc'));
    
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setAllAppts(rows);
    });
  }, [db]);

  // Fetch pending edit requests
  useEffect(() => {
    if (!db) return;
    
    const ref = collection(db, 'appointmentEditRequests');
    const qy = query(ref, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    
    return onSnapshot(qy, (snap) => {
      const rows: AppointmentEditRequest[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setEditRequests(rows);
    });
  }, [db]);

  // Load business hours data for week view
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

  const fmtCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Handle edit request approval
  const handleApproveEditRequest = (request: AppointmentEditRequest) => {
    setConfirmingRequest(request);
  };

  const handleConfirmApproval = async () => {
    if (!db || !confirmingRequest) {
      return;
    }
    
    setApprovingEdit(true);
    try {
      const appointment = allAppts.find(a => a.id === confirmingRequest.appointmentId);
      if (!appointment) {
        console.error('Appointment not found');
        return;
      }

      // Update appointment in-place
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        updatedForEdit: true,
        editRequestId: confirmingRequest.id,
        editProcessedAt: new Date().toISOString(),
        editProcessedBy: auth.currentUser?.uid || 'admin'
      };

      // Apply requested changes
      if (confirmingRequest.requestedChanges.start) {
        updateData.start = confirmingRequest.requestedChanges.start;
      }
      if (confirmingRequest.requestedChanges.serviceIds && confirmingRequest.requestedChanges.serviceIds.length > 0) {
        // Set serviceIds field for multi-service support
        updateData.serviceIds = confirmingRequest.requestedChanges.serviceIds;
        
        // Backward compatibility
        updateData.serviceId = confirmingRequest.requestedChanges.serviceIds[0];
        updateData.selectedServices = confirmingRequest.requestedChanges.serviceIds;
        
        // Calculate total duration
        const totalDuration = confirmingRequest.requestedChanges.serviceIds.reduce((sum, id) => {
          const service = services[id];
          return sum + (service?.duration || 0);
        }, 0);
        updateData.duration = totalDuration;
        
        // Build individual service prices
        const servicePricesData: Record<string, number> = {};
        let totalPrice = 0;
        
        confirmingRequest.requestedChanges.serviceIds.forEach((serviceId) => {
          const service = services[serviceId];
          const servicePrice = service?.price || 0;
          servicePricesData[serviceId] = servicePrice;
          totalPrice += servicePrice;
        });
        
        // Store individual prices (enables per-service editing)
        updateData.servicePrices = servicePricesData;
        updateData.bookedPrice = totalPrice;
        
        // Calculate final total including any existing tip
        const existingTip = appointment.tip || 0;
        updateData.totalPrice = totalPrice + existingTip;
        
        // Mark as price edited (enables price editor UI)
        updateData.isPriceEdited = true;
        updateData.priceEditedAt = new Date().toISOString();
      }
      if (confirmingRequest.requestedChanges.notes !== undefined) {
        updateData.notes = confirmingRequest.requestedChanges.notes || '';
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
        await updateDoc(doc(db, 'appointmentEditRequests', confirmingRequest.id), {
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: auth.currentUser?.uid || 'admin'
        });
        editRequestUpdateSuccess = true;
        console.log('✅ Edit request status updated to approved');

        setConfirmingRequest(null);
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
            if (confirmingRequest.requestedChanges.start) {
              rollbackData.start = appointment.start;
            }
            if (confirmingRequest.requestedChanges.serviceIds) {
              rollbackData.serviceId = appointment.serviceId;
              rollbackData.serviceIds = (appointment as any).serviceIds || [appointment.serviceId];
              rollbackData.selectedServices = (appointment as any).selectedServices;
              rollbackData.servicePrices = (appointment as any).servicePrices;
              rollbackData.duration = appointment.duration;
              rollbackData.bookedPrice = appointment.bookedPrice;
              rollbackData.totalPrice = appointment.totalPrice;
            }
            if (confirmingRequest.requestedChanges.notes !== undefined) {
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

  // Handle edit request denial
  const handleDenyEditRequest = async (request: AppointmentEditRequest) => {
    if (!db) return;
    
    try {
      const confirmed = window.confirm('Deny this edit request?');
      if (!confirmed) return;

      // Update edit request status
      await updateDoc(doc(db, 'appointmentEditRequests', request.id), {
        status: 'denied',
        processedAt: new Date().toISOString(),
        processedBy: 'admin'
      });

      // ✅ NEW: Check if there's a pending appointment for this request
      // If so, cancel it
      const appointment = appts.find((a: any) => a.id === request.appointmentId);
      if (appointment && appointment.status === 'pending') {
        await updateDoc(doc(db, 'appointments', request.appointmentId), {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Cancelled pending appointment for denied edit request');
      }

      console.log('Edit request denied successfully');
    } catch (error) {
      console.error('Error denying edit request:', error);
    }
  };

  // Handle edit request deletion
  const handleDeleteEditRequest = async (request: AppointmentEditRequest) => {
    if (!db) return;
    
    try {
      const confirmed = window.confirm('Delete this edit request? This action cannot be undone.');
      if (!confirmed) return;

      // Delete the edit request document
      await deleteDoc(doc(db, 'appointmentEditRequests', request.id));

      console.log('✅ Edit request deleted');
    } catch (error) {
      console.error('❌ Error deleting edit request:', error);
      alert('Failed to delete edit request. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Messages */}
      {(apptsError || servicesError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              {apptsError && <p className="text-sm text-red-800 font-medium">{apptsError}</p>}
              {servicesError && <p className="text-sm text-red-800 font-medium">{servicesError}</p>}
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
      

      {/* Appointment Cards for Schedule Page */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <section className="bg-white rounded-xl shadow-soft p-4">
          <h3 className="font-serif text-xl mb-3">Upcoming Appointments</h3>
          {allAppts.filter(a => (a.status === 'confirmed' || a.status === 'pending') && safeParseDate(a.start) > new Date()).length === 0 ? (
            <div className="text-slate-500 text-sm">No upcoming appointments.</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allAppts
                .filter(a => (a.status === 'confirmed' || a.status === 'pending') && safeParseDate(a.start) > new Date())
                .slice(0, 10)
                .map((a) => (
                  <div 
                    key={a.id} 
                    onClick={() => setSelectedAppointment(a)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {format(safeParseDate(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration)}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {(() => {
                          // Handle multiple services
                          const serviceIds = (a as any).serviceIds || (a as any).selectedServices || [];
                          if (serviceIds.length > 1) {
                            const serviceNames = serviceIds.map((serviceId: string) => services[serviceId]?.name || 'Service').filter(Boolean);
                            return serviceNames.slice(0, 2).join(', ') + (serviceNames.length > 2 ? ` +${serviceNames.length - 2}` : '');
                          }
                          return services[a.serviceId]?.name || 'Service';
                        })()}
                      </div>
                      {a.customerName && (
                        <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                      )}
                      {a.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-orange-600 font-medium">Pending</div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickConfirm(a.id);
                              }}
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                              title="Confirm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickDeny(a.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Cancel"
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-terracotta">
                      {fmtCurrency(a.bookedPrice ?? a.totalPrice ?? services[a.serviceId]?.price ?? 0)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Past Appointments */}
        <section className="bg-white rounded-xl shadow-soft p-4">
          <h3 className="font-serif text-xl mb-3">Recent Past Appointments</h3>
          {allAppts.filter(a => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return (a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed' || a.status === 'no-show') 
              && safeParseDate(a.start) <= new Date()
              && safeParseDate(a.start) >= sevenDaysAgo;
          }).length === 0 ? (
            <div className="text-slate-500 text-sm">No past appointments in the last 7 days.</div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAppts
                  .filter(a => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return (a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed' || a.status === 'no-show') 
                      && safeParseDate(a.start) <= new Date()
                      && safeParseDate(a.start) >= sevenDaysAgo;
                  })
                  .sort((a, b) => {
                    const dateA = safeParseDate(a.start).getTime();
                    const dateB = safeParseDate(b.start).getTime();
                    return dateB - dateA; // Most recent first
                  })
                  .slice(0, 5)
                .map((a) => (
                  <div 
                    key={a.id} 
                    onClick={() => setSelectedAppointment(a)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {format(safeParseDate(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration)}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {(() => {
                          // Handle multiple services
                          const serviceIds = (a as any).serviceIds || (a as any).selectedServices || [];
                          if (serviceIds.length > 1) {
                            const serviceNames = serviceIds.map((serviceId: string) => services[serviceId]?.name || 'Service').filter(Boolean);
                            return serviceNames.slice(0, 2).join(', ') + (serviceNames.length > 2 ? ` +${serviceNames.length - 2}` : '');
                          }
                          return services[a.serviceId]?.name || 'Service';
                        })()}
                      </div>
                      {a.customerName && (
                        <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                      )}
                      {a.status === 'pending' && (
                        <div className="text-xs text-orange-600 font-medium">Pending Confirmation</div>
                      )}
                      {a.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeAttendance(a.id, 'no-show');
                          }}
                          className="text-xs text-green-600 font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors cursor-pointer border border-transparent hover:border-green-200"
                          title="Click to change to no-show"
                        >
                          ✓ Completed
                        </button>
                      )}
                      {a.status === 'no-show' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeAttendance(a.id, 'attended');
                          }}
                          className="text-xs text-red-600 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Click to change to attended"
                        >
                          ✗ No-Show
                        </button>
                      )}
                      {a.status === 'confirmed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Attended:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAttended(a.id);
                            }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Mark as attended"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkNoShow(a.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600 border border-red-300 hover:border-red-400 transition-all duration-200 font-bold"
                            title="⚠️ Mark as no-show - Requires confirmation"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-terracotta">
                      {fmtCurrency(a.bookedPrice ?? a.totalPrice ?? services[a.serviceId]?.price ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate('/past-appointments')}
                  className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                >
                  View All Past Appointments →
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Pending Edit Requests Card */}
      <section className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl">Pending Edit Requests</h3>
          <button
            onClick={() => setShowEditRequestsModal(true)}
            className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
          >
            View All Edit Requests →
          </button>
        </div>
        {editRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No pending edit requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {editRequests.slice(0, 3).map((request) => {
              const appointment = allAppts.find(a => a.id === request.appointmentId);
              return (
                <div key={request.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-800">
                      {appointment?.customerName || 'Unknown Customer'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {appointment ? format(safeParseDate(appointment.start), 'MMM d, h:mm a') : 'Unknown Date'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 mb-3">
                    <div>Service: {services[appointment?.serviceId || '']?.name || 'Unknown Service'}</div>
                    {request.requestedChanges.start && (
                      <div>Time: {format(safeParseDate(request.requestedChanges.start), 'MMM d, h:mm a')}</div>
                    )}
                    {request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0 && (
                      <div>New Service: {request.requestedChanges.serviceIds.map(id => services[id]?.name).join(', ')}</div>
                    )}
                    {request.reason && (
                      <div>Reason: {request.reason}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveEditRequest(request)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenyEditRequest(request)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleDeleteEditRequest(request)}
                      className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                      title="Delete this edit request"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {editRequests.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setShowEditRequestsModal(true)}
                  className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                >
                  See all history ({editRequests.length} total) →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Calendar View */}
      {layout === 'grid' && (
      <div className="grid gap-4" ref={calendarRef}>
          {/* Calendar Controls */}
          <div className="bg-white rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl text-slate-800">Calendar View</h3>
                <p className="text-sm text-slate-600 mt-1">Manage your calendar display and settings</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Multi-Employee Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={multiEmployee}
                      onChange={(e) => setMultiEmployee(e.target.checked)}
                      className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
                    />
                    <span className="text-slate-700">Multi-Employee</span>
                  </label>
                  {multiEmployee && (
                    <button
                      onClick={() => setShowStaffManager(true)}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                    >
                      Manage Staff
                    </button>
                  )}
                </div>
                
                {/* Layout Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('grid') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('grid')}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setLayout('week')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('week') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('week')}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setLayout('day')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('day') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('day')}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Month header */}
          <div className="flex items-center justify-between">
            <div className="font-serif text-2xl">{format(month, 'MMMM yyyy')}</div>
            <div className="flex items-center gap-2">
              <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(addMonths(month, -1))}>Prev</button>
              <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(new Date())}>Today</button>
              <button className="border rounded-md px-3 py-1 hover:bg-cream" onClick={() => setMonth(addMonths(month, 1))}>Next</button>
            </div>
          </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-xs text-slate-500">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
        {days.map((d, idx) => {
          const inMonth = isSameMonth(d, month);
          const todaysAppts = appts.filter((a) => {
            try {
              const appointmentDate = safeParseDate(a.start);
              return isSameDay(appointmentDate, d) && a.status !== 'cancelled';
            } catch (error) {
              console.error('Error filtering appointment for date:', {
                appointmentId: a.id,
                start: a.start,
                targetDate: d.toISOString(),
                error
              });
              return false;
            }
          });
          return (
            <CalendarDayHighlighting
              key={idx}
              date={d}
              className={`relative min-h-[108px] ${inMonth ? '' : 'bg-slate-50 text-slate-400'} cursor-pointer transition-colors`}
            >
              <div
                onMouseEnter={(e) => {
                  setHoverDate(d);
                  if (todaysAppts.length > 0) {
                    const position = calculateHoverPosition(e.currentTarget);
                    setHoverPosition(position);
                  }
                }}
                onMouseLeave={() => {
                  setHoverDate((prev) => (prev && isSameDay(prev, d) ? null : prev));
                  setHoverPosition(null);
                }}
                onClick={() => setOpenAdd({ open: true, date: d })}
              >
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs">{format(d, 'd')}</span>
                {!!todaysAppts.length && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta text-white">{todaysAppts.length}</span>
                )}
              </div>
              {/* Enhanced appointment preview with better visibility */}
              <div className="px-2 pb-2 space-y-1">
                {(() => {
                  // Group appointments by customer for better visibility
                  const appointmentsByCustomer = todaysAppts.reduce((acc, appointment) => {
                    const customerKey = appointment.customerId || appointment.customerEmail || 'unknown';
                    if (!acc[customerKey]) {
                      acc[customerKey] = [];
                    }
                    acc[customerKey].push(appointment);
                    return acc;
                  }, {} as Record<string, Appointment[]>);

                  const customerGroups = Object.entries(appointmentsByCustomer);
                  const displayGroups = customerGroups.slice(0, 2); // Show up to 2 customer groups
                  const remainingGroups = customerGroups.length - displayGroups.length;

                  return (
                    <>
                      {displayGroups.map(([customerKey, customerAppts]) => (
                        <div key={customerKey} className="space-y-1">
                          {customerAppts.slice(0, 2).map((a) => {
                            // Check if this appointment has multiple services
                            // Check for both selectedServices (old) and serviceIds (new) for backward compatibility
                            const serviceIds = (a as any).serviceIds || (a as any).selectedServices || [];
                            const hasMultipleServices = serviceIds.length > 1;
                            
                            // Get service names - prioritize serviceIds array if it exists and has items
                            let serviceNames = '';
                            if (serviceIds.length > 0) {
                              serviceNames = serviceIds.map((id: string) => services[id]?.name).filter(Boolean).join(', ') || '';
                            } else if (a.serviceId) {
                              serviceNames = services[a.serviceId]?.name || 'Service';
                            } else {
                              serviceNames = 'Service';
                            }
                            
                            return (
                              <div 
                                key={a.id} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(a);
                                }}
                                className={`text-[10px] truncate border rounded px-1 py-0.5 cursor-pointer hover:bg-slate-100 transition-colors ${
                                  hasMultipleServices ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                title={hasMultipleServices ? `Multiple services: ${serviceNames}` : serviceNames}
                              >
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500">
                                    {format(safeParseDate(a.start), 'h:mma')}-{format(new Date(safeParseDate(a.start).getTime() + a.duration * 60000), 'h:mma')}
                                  </span>
                                  {hasMultipleServices && (
                                    <span className="text-blue-600 font-medium">+</span>
                                  )}
                                </div>
                                <div className="text-slate-600 truncate">
                                  {hasMultipleServices ? (
                                    <span className="text-blue-700 font-medium">
                                      {serviceNames.length > 20 ? serviceNames.substring(0, 20) + '...' : serviceNames}
                                    </span>
                                  ) : (
                                    serviceNames
                                  )}
                                </div>
                                {a.customerName && (
                                  <div className="text-slate-500 text-[9px] truncate">
                                    {a.customerName}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {customerAppts.length > 2 && (
                            <div className="text-[9px] text-slate-500 ml-2">
                              +{customerAppts.length - 2} more for {customerAppts[0].customerName || 'customer'}
                            </div>
                          )}
                        </div>
                      ))}
                      {remainingGroups > 0 && (
                        <div className="text-[9px] text-slate-500">
                          +{remainingGroups} more customer{todaysAppts.length > 1 ? 's' : ''}…
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              </div>
            </CalendarDayHighlighting>
          );
        })}
      </div>

      {/* Smart-positioned hover popup */}
      {hoverDate && hoverPosition && (
        <div 
          className="fixed z-50 w-64 bg-white border rounded-xl shadow-lg p-3"
          style={{
            left: `${hoverPosition.x}px`,
            top: hoverPosition.position === 'above' ? 'auto' : `${hoverPosition.y}px`,
            bottom: hoverPosition.position === 'above' ? `${window.innerHeight - hoverPosition.y}px` : 'auto',
            transform: hoverPosition.position === 'above' ? 'translateY(-100%)' : 'none'
          }}
          onMouseEnter={() => {
            // Keep the popup visible when hovering over it
            setHoverDate(hoverDate);
          }}
        >
          {(() => {
            const todaysAppts = appts.filter((a) => {
              try {
                const appointmentDate = safeParseDate(a.start);
                return isSameDay(appointmentDate, hoverDate) && a.status !== 'cancelled';
              } catch (error) {
                console.error('Error filtering appointment in hover popup:', {
                  appointmentId: a.id,
                  start: a.start,
                  hoverDate: hoverDate.toISOString(),
                  error
                });
                return false;
              }
            });
            return (
              <>
                <div className="text-xs font-medium mb-2">{format(hoverDate, 'PP')}</div>
                <ul className="max-h-48 overflow-auto space-y-2">
                  {(() => {
                    // Group appointments by customer for better organization
                    const appointmentsByCustomer = todaysAppts.reduce((acc, appointment) => {
                      const customerKey = appointment.customerId || appointment.customerEmail || 'unknown';
                      if (!acc[customerKey]) {
                        acc[customerKey] = [];
                      }
                      acc[customerKey].push(appointment);
                      return acc;
                    }, {} as Record<string, Appointment[]>);

                    return Object.entries(appointmentsByCustomer).map(([customerKey, customerAppts]) => (
                      <div key={customerKey} className="space-y-1">
                        {customerAppts.length > 1 && (
                          <div className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {customerAppts[0].customerName || 'Customer'} ({customerAppts.length} appointments)
                          </div>
                        )}
                        {customerAppts.map((a) => {
                          // Check for both selectedServices (old) and serviceIds (new) for backward compatibility
                          const serviceIds = (a as any).serviceIds || (a as any).selectedServices || [];
                          const hasMultipleServices = serviceIds.length > 1;
                          
                          // Get service names - prioritize serviceIds array if it exists and has items
                          let serviceNames = '';
                          if (serviceIds.length > 0) {
                            serviceNames = serviceIds.map((id: string) => services[id]?.name).filter(Boolean).join(', ') || '';
                          } else if (a.serviceId) {
                            serviceNames = services[a.serviceId]?.name || 'Service';
                          } else {
                            serviceNames = 'Service';
                          }
                          
                          return (
                            <li 
                              key={a.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(a);
                                setHoverDate(null);
                                setHoverPosition(null);
                              }}
                              className={`text-xs flex items-center justify-between gap-2 p-2 rounded-md hover:bg-slate-100 group cursor-pointer ${
                                hasMultipleServices ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {format(safeParseDate(a.start), 'h:mm a')} - {format(new Date(safeParseDate(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                                </div>
                                <div className="text-slate-600 truncate text-left">
                                  {hasMultipleServices ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-700 font-medium">+</span>
                                      <span className="text-blue-700">
                                        {serviceNames.length > 30 ? serviceNames.substring(0, 30) + '...' : serviceNames}
                                      </span>
                                    </div>
                                  ) : (
                                    serviceNames
                                  )}
                                </div>
                                {a.customerName && customerAppts.length === 1 && (
                                  <div className="text-slate-500 truncate text-[10px]">{a.customerName}</div>
                                )}
                                {hasMultipleServices && (
                                  <div className="text-[10px] text-blue-600 font-medium">
                                    {serviceIds.length} services
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Cancel this appointment?')) {
                                    updateDoc(doc(db, 'appointments', a.id), { status: 'cancelled' });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                                title="Cancel appointment"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </ul>
              </>
            );
          })()}
        </div>
      )}
      </div>
      )}

      {/* Scroll to Calendar Button */}
      {showScrollToCalendar && (
        <button
          onClick={scrollToCalendar}
          className="fixed bottom-6 right-6 bg-terracotta text-white px-4 py-3 rounded-full shadow-lg hover:bg-terracotta/90 transition-all duration-200 z-50 flex items-center gap-2"
          title="Scroll to Calendar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">
            {layout === 'grid' ? 'Calendar' : layout === 'week' ? 'Week View' : 'Day View'}
          </span>
        </button>
      )}

      {/* Week View */}
      {layout === 'week' && (
        <div className="space-y-4" ref={calendarRef}>
          {/* Calendar Controls */}
          <div className="bg-white rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl text-slate-800">Week View</h3>
                <p className="text-sm text-slate-600 mt-1">Modern weekly schedule with color-coded categories</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Multi-Employee Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={multiEmployee}
                      onChange={(e) => setMultiEmployee(e.target.checked)}
                      className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
                    />
                    <span className="text-slate-700">Multi-Employee</span>
                  </label>
                  {multiEmployee && (
                    <button
                      onClick={() => setShowStaffManager(true)}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                    >
                      Manage Staff
                    </button>
                  )}
                </div>
                
                {/* Layout Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('grid') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('grid')}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setLayout('week')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('week') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('week')}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setLayout('day')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      getButtonState('day') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={getButtonState('day')}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                onClick={() => setMonth(addWeeks(month, -1))}
              >
                ← Previous Week
              </button>
              <button 
                className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                onClick={() => setMonth(new Date())}
              >
                This Week
              </button>
              <button 
                className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                onClick={() => setMonth(addWeeks(month, 1))}
              >
                Next Week →
              </button>
            </div>
            <button
              className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium"
              onClick={() => setOpenAdd({ open: true, date: month })}
            >
              + Add Appointment
            </button>
          </div>

          {/* Week Calendar View */}
          <CalendarWeekView
            weekStartDate={startOfWeek(month, { weekStartsOn: 0 })}
            appointments={appts}
            services={services}
            onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
            onTimeSlotClick={(date, time) => {
              // Set the time on the date
              const appointmentDate = new Date(date);
              appointmentDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
              setOpenAdd({ open: true, date: appointmentDate });
            }}
          />
        </div>
      )}

      {/* Appointment Confirmation Section */}
      <section className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-4">Appointment Confirmations</h3>
        {appts.filter(a => a.status === 'pending').length === 0 ? (
          <div className="text-slate-500 text-sm">No pending appointments to confirm.</div>
        ) : (
          <div className="space-y-3">
            {appts
              .filter(a => a.status === 'pending')
              .sort((a, b) => safeParseDate(a.start).getTime() - safeParseDate(b.start).getTime())
              .map((a) => (
                <div 
                  key={a.id} 
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{format(safeParseDate(a.start), 'MMM d, h:mm a')}</div>
                    <span className="text-xs text-slate-600 truncate text-left">
                      {services[a.serviceId]?.name || 'Service'}
                    </span>
                    {a.customerName && (
                      <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                    )}
                    {a.customerEmail && (
                      <div className="text-xs text-slate-500 truncate">{a.customerEmail}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-terracotta">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(a.bookedPrice ?? a.totalPrice ?? services[a.serviceId]?.price ?? 0)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (confirm('Confirm this appointment? This will send a confirmation email/SMS to the customer.')) {
                            setConfirmingIds(prev => new Set(prev).add(a.id));
                            try {
                              const confirmFn = httpsCallable(functions, 'confirmAppointment');
                              await confirmFn({ appointmentId: a.id, action: 'confirm' });
                              alert('Appointment confirmed and customer notified!');
                            } catch (error: any) {
                              console.error('Error confirming appointment:', error);
                              alert(`Failed to confirm appointment: ${error.message}`);
                            } finally {
                              setConfirmingIds(prev => {
                                const next = new Set(prev);
                                next.delete(a.id);
                                return next;
                              });
                            }
                          }
                        }}
                        disabled={confirmingIds.has(a.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {confirmingIds.has(a.id) ? 'Confirming...' : 'Confirm & Notify'}
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Why reject this appointment? (optional)');
                          if (reason !== null) { // null means cancelled
                            setConfirmingIds(prev => new Set(prev).add(a.id));
                            try {
                              const confirmFn = httpsCallable(functions, 'confirmAppointment');
                              await confirmFn({ 
                                appointmentId: a.id, 
                                action: 'reject',
                                rejectionReason: reason || 'No reason provided'
                              });
                              alert('Appointment rejected.');
                            } catch (error: any) {
                              console.error('Error rejecting appointment:', error);
                              alert(`Failed to reject appointment: ${error.message}`);
                            } finally {
                              setConfirmingIds(prev => {
                                const next = new Set(prev);
                                next.delete(a.id);
                                return next;
                              });
                            }
                          }
                        }}
                        disabled={confirmingIds.has(a.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {confirmingIds.has(a.id) ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

        {/* Day View */}
        {layout === 'day' && (
          <div className="space-y-4" ref={calendarRef}>
            {/* Calendar Controls */}
            <div className="bg-white rounded-xl shadow-soft p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl text-slate-800">Day View</h3>
                  <p className="text-sm text-slate-600 mt-1">Detailed daily schedule view</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Multi-Employee Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={multiEmployee}
                        onChange={(e) => setMultiEmployee(e.target.checked)}
                        className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                      <span className="text-slate-700">Multi-Employee</span>
                    </label>
                    {multiEmployee && (
                      <button
                        onClick={() => setShowStaffManager(true)}
                        className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      >
                        Manage Staff
                      </button>
                    )}
                  </div>
                  
                  {/* Layout Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLayout('grid')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        getButtonState('grid') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      aria-pressed={getButtonState('grid')}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setLayout('week')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        getButtonState('week') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      aria-pressed={getButtonState('week')}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setLayout('day')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        getButtonState('day') ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      aria-pressed={getButtonState('day')}
                    >
                      Day
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Day navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                  onClick={() => setSelectedDay(new Date(selectedDay.getTime() - 24 * 60 * 60 * 1000))}
                >
                  ← Previous
                </button>
                <button 
                  className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                  onClick={() => setSelectedDay(new Date())}
                >
                  Today
                </button>
                <button 
                  className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-medium" 
                  onClick={() => setSelectedDay(new Date(selectedDay.getTime() + 24 * 60 * 60 * 1000))}
                >
                  Next →
                </button>
              </div>
              <button
                className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium"
                onClick={() => setOpenAdd({ open: true, date: selectedDay })}
              >
                + Add Appointment
              </button>
            </div>

            {/* Google Calendar-style day view */}
            <CalendarDayView
              date={selectedDay}
              appointments={appts}
              services={services}
              businessHours={businessHours}
              closures={closures}
              specialHours={specialHours}
              onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
              onTimeSlotClick={(time) => {
                // Open add appointment modal with the selected time
                setOpenAdd({ open: true, date: time });
              }}
            />
          </div>
        )}

      {/* Add appointment modal */}
      <AddAppointmentModal
        open={openAdd.open}
        date={openAdd.date || new Date()}
        onClose={() => setOpenAdd({ open: false, date: null })}
        onCreated={() => setOpenAdd({ open: false, date: null })}
        prefillData={openAdd.prefillData}
      />

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <EnhancedAppointmentDetailModal
          appointment={selectedAppointment}
          service={selectedAppointment ? services[selectedAppointment.serviceId] : undefined}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => {
            setEditingAppointment(selectedAppointment);
            setSelectedAppointment(null);
          }}
          onSelectAppointment={(appointment) => setSelectedAppointment(appointment)}
          relatedAppointments={(() => {
            if (!selectedAppointment.customerId) return [];
            
            const appointmentDate = safeParseDate(selectedAppointment.start);
            return appts.filter(a => 
              a.id !== selectedAppointment.id && 
              a.customerId === selectedAppointment.customerId &&
              isSameDay(safeParseDate(a.start), appointmentDate) &&
              a.status !== 'cancelled'
            );
          })()}
        />
      )}

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        appointment={editingAppointment}
        service={editingAppointment ? (services[editingAppointment.serviceId] ?? null) : null}
        onClose={() => setEditingAppointment(null)}
        onUpdated={() => {
          setEditingAppointment(null);
          // Data will auto-refresh from Firestore listener
        }}
      />

      {/* Staff Management Modal */}
      {showStaffManager && (
        <StaffManagerModal onClose={() => setShowStaffManager(false)} />
      )}

      {/* Edit Request Confirmation Modal */}
      {confirmingRequest && (
        <EditRequestConfirmModal
          isOpen={!!confirmingRequest}
          onClose={() => setConfirmingRequest(null)}
          onConfirm={handleConfirmApproval}
          appointment={allAppts.find(a => a.id === confirmingRequest.appointmentId)!}
          editRequest={confirmingRequest}
          services={services}
          loading={approvingEdit}
        />
      )}

      {/* Edit Requests Modal */}
      <EditRequestsModal 
        isOpen={showEditRequestsModal} 
        onClose={() => setShowEditRequestsModal(false)} 
      />

      {/* Attendance Confirmation Modal */}
      <AttendanceConfirmationModal
        open={attendanceModal.open}
        onClose={() => setAttendanceModal({ open: false, appointment: null, service: null })}
        appointment={attendanceModal.appointment}
        service={attendanceModal.service}
        onConfirmed={handleAttendanceConfirmed}
      />

      {/* No-Show Confirmation Modal */}
      <NoShowConfirmationModal
        open={noShowModal.open}
        onClose={() => setNoShowModal({ open: false, appointment: null, service: null })}
        appointment={noShowModal.appointment}
        service={noShowModal.service}
        onConfirm={handleNoShowConfirmed}
        loading={markingAttendanceIds.size > 0}
      />
    </div>
  );
}

// Staff Manager Component with Database Integration
function StaffManagerModal({ onClose }: { onClose: () => void }) {
  const { db } = useFirebase();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newStaff, setNewStaff] = useState({ name: '', role: '', email: '', phone: '' });
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load staff from database
  useEffect(() => {
    const unsubscribe = watchStaff(db, setStaff);
    return unsubscribe;
  }, [db]);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role) {
      setError('Name and role are required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createStaff(db, {
        name: newStaff.name,
        role: newStaff.role,
        email: newStaff.email || undefined,
        phone: newStaff.phone || undefined,
        active: true
      });
      
      setNewStaff({ name: '', role: '', email: '', phone: '' });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !editingStaff.name || !editingStaff.role) {
      setError('Name and role are required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await updateStaff(db, editingStaff.id, {
        name: editingStaff.name,
        role: editingStaff.role,
        email: editingStaff.email || undefined,
        phone: editingStaff.phone || undefined,
        active: editingStaff.active
      });
      
      setEditingStaff(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (confirm('Remove this staff member?')) {
      setLoading(true);
      setError('');
      
      try {
        await deleteStaff(db, id);
      } catch (err: any) {
        setError(err.message || 'Failed to remove staff member');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-slate-800 mb-1">Staff Management</h2>
            <p className="text-slate-600">Manage your team members and their roles</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Add Staff Button */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-800">Team Members</h3>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={loading}
              className="bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Staff Member
            </button>
          </div>

          {/* Add Staff Form */}
          {showAddForm && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-slate-800">Add New Staff Member</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <input
                    type="text"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="e.g., Senior Stylist, Brow Specialist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="email@buenobrows.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddStaff}
                  className="bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors"
                >
                  Add Staff Member
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStaff({ name: '', role: '', email: '', phone: '' });
                  }}
                  className="border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Staff Form */}
          {editingStaff && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-slate-800">Edit Staff Member</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <input
                    type="text"
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="e.g., Senior Stylist, Brow Specialist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="email@buenobrows.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateStaff}
                  disabled={loading}
                  className="bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Staff Member'}
                </button>
                <button
                  onClick={() => setEditingStaff(null)}
                  disabled={loading}
                  className="border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Staff List */}
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center">
                        <span className="text-terracotta font-semibold text-sm">
                          {member.name && typeof member.name === 'string' ? member.name.split(' ').map(n => n[0]).join('') : '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{member.name}</h4>
                        <p className="text-sm text-slate-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      {member.email && <div>📧 {member.email}</div>}
                      {member.phone && <div>📱 {member.phone}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStaff(member)}
                      className="text-blue-600 hover:text-blue-700 p-2 transition-colors"
                      title="Edit staff member"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveStaff(member.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove staff member"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600 font-medium">No staff members yet</p>
              <p className="text-slate-500 text-sm">Add your first team member to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
