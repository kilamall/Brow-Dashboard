import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format, parseISO } from 'date-fns';
import type { Appointment, Service } from '@buenobrows/shared/types';
import EnhancedAppointmentDetailModal from '@/components/EnhancedAppointmentDetailModal';
import AttendanceConfirmationModal from '@/components/AttendanceConfirmationModal';
import NoShowConfirmationModal from '@/components/NoShowConfirmationModal';

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

function fmtCurrency(num: number): string {
  return `$${num.toFixed(2)}`;
}

export default function PastAppointments() {
  const { db } = useFirebase();
  const navigate = useNavigate();
  const functions = getFunctions();
  const [allAppts, setAllAppts] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch appointments
  useEffect(() => {
    if (!db) return;
    
    const q = query(collection(db, 'appointments'), orderBy('start', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAllAppts(appointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Fetch services
  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesMap: Record<string, Service> = {};
      snapshot.docs.forEach((doc) => {
        servicesMap[doc.id] = { id: doc.id, ...doc.data() } as Service;
      });
      setServices(servicesMap);
    });

    return () => unsubscribe();
  }, [db]);

  // Filter to show only past appointments
  const pastAppointments = allAppts.filter(a => 
    (a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed' || a.status === 'no-show') 
    && safeParseDate(a.start) <= new Date()
  );

  const handleMarkAttended = (appointmentId: string) => {
    const appointment = allAppts.find(a => a.id === appointmentId);
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
    const appointment = allAppts.find(a => a.id === appointmentId);
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

  const handleChangeAttendance = async (appointmentId: string, newAttendance: 'attended' | 'no-show') => {
    const appointment = allAppts.find(a => a.id === appointmentId);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">✓ Completed</span>;
      case 'no-show':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">✗ No-Show</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Past Appointments</h1>
          <p className="text-slate-600 mt-1">View all completed and past appointments</p>
        </div>
        <button
          onClick={() => navigate('/schedule')}
          className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          ← Back to Schedule
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading appointments...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && pastAppointments.length === 0 && (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 mb-2">No Past Appointments</h2>
          <p className="text-slate-600">There are no past appointments to display.</p>
        </div>
      )}

      {/* Appointments List */}
      {!loading && pastAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pastAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {format(safeParseDate(apt.start), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatAppointmentTimeRange(apt.start, apt.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{apt.customerName || 'N/A'}</div>
                      {apt.customerEmail && (
                        <div className="text-sm text-slate-500">{apt.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {services[apt.serviceId]?.name || 'Unknown Service'}
                      </div>
                      {apt.duration && (
                        <div className="text-sm text-slate-500">{apt.duration} min</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.status === 'confirmed' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Confirmed</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAttended(apt.id);
                            }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Mark as attended"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkNoShow(apt.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600 border border-red-300 hover:border-red-400 transition-all duration-200 font-bold"
                            title="⚠️ Mark as no-show - Requires confirmation"
                          >
                            ✗
                          </button>
                        </div>
                      ) : apt.status === 'completed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeAttendance(apt.id, 'no-show');
                          }}
                          className="text-xs text-green-600 font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors cursor-pointer border border-transparent hover:border-green-200"
                          title="Click to change to no-show"
                        >
                          ✓ Completed
                        </button>
                      ) : apt.status === 'no-show' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeAttendance(apt.id, 'attended');
                          }}
                          className="text-xs text-red-600 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Click to change to attended"
                        >
                          ✗ No-Show
                        </button>
                      ) : (
                        getStatusBadge(apt.status)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                      {fmtCurrency(apt.totalPrice ?? apt.bookedPrice ?? services[apt.serviceId]?.price ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <EnhancedAppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Attendance Confirmation Modal */}
      <AttendanceConfirmationModal
        open={attendanceModal.open}
        appointment={attendanceModal.appointment}
        service={attendanceModal.service}
        onClose={() => setAttendanceModal({ open: false, appointment: null, service: null })}
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


