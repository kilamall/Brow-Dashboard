import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, addDoc } from 'firebase/firestore';
import type { Appointment, Service, SkinAnalysis, CustomerConsent, AppointmentEditRequest } from '@buenobrows/shared/types';
import { watchCustomerConsents } from '@buenobrows/shared/consentFormHelpers';
import { format } from 'date-fns';
import EditRequestModal from '../components/EditRequestModal';

export default function ClientDashboard() {
  const { db } = useFirebase();
  const auth = getAuth();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [skinAnalyses, setSkinAnalyses] = useState<SkinAnalysis[]>([]);
  const [consents, setConsents] = useState<CustomerConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCustomerRecord, setHasCustomerRecord] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [editRequestModal, setEditRequestModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
  }>({ open: false, appointment: null });
  const [editRequestLoading, setEditRequestLoading] = useState(false);
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<{
    upcoming: boolean;
    past: boolean;
    cancelled: boolean;
    editRequests: boolean;
    skinAnalysis: boolean;
    consentForms: boolean;
  }>({
    upcoming: false,
    past: false,
    cancelled: true, // Collapsed by default
    editRequests: false,
    skinAnalysis: false,
    consentForms: true, // Collapsed by default
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  console.log('[ClientDashboard] Rendered, user:', user?.email, 'loading:', loading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        nav('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, nav]);

  // Fetch customer's appointments
  useEffect(() => {
    // Need either email or phone number
    if (!user?.email && !user?.phoneNumber) return;

    let unsubscribeAppointments: (() => void) | null = null;

    // Find customer by email OR phone number
    const customersRef = collection(db, 'customers');
    
    // Try to find by email first (if available)
    const searchField = user.email ? 'email' : 'phone';
    const searchValue = user.email || user.phoneNumber;
    
    console.log(`🔍 Looking for customer by ${searchField}:`, searchValue);
    const customerQuery = query(customersRef, where(searchField, '==', searchValue));

    const unsubscribeCustomer = onSnapshot(customerQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log(`No customer found for ${searchField}:`, searchValue);
        setAppointments([]);
        setHasCustomerRecord(false);
        setCustomerId(null);
        return;
      }

      const custId = snapshot.docs[0].id;
      console.log('✅ Found customer:', custId);
      setHasCustomerRecord(true);
      setCustomerId(custId);

      // Fetch appointments for this customer
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('customerId', '==', custId)
      );

      unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const appts: Appointment[] = [];
        snapshot.forEach((doc) => {
          appts.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        console.log(`✅ Fetched ${appts.length} appointments for customer ${custId}`, appts);
        setAppointments(appts);
      });
    });

    return () => {
      unsubscribeCustomer();
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
    };
  }, [user, db]);

  // Fetch services
  useEffect(() => {
    const servicesRef = collection(db, 'services');
    const unsubscribe = onSnapshot(query(servicesRef, where('active', '==', true)), (snapshot) => {
      const servicesMap: Record<string, Service> = {};
      snapshot.forEach((doc) => {
        servicesMap[doc.id] = { id: doc.id, ...doc.data() } as Service;
      });
      setServices(servicesMap);
    });

    return () => unsubscribe();
  }, [db]);

  // Fetch user's skin analyses
  useEffect(() => {
    if (!customerId) {
      console.log('🔍 Skin analyses: No customerId yet, skipping fetch');
      return;
    }

    console.log('🔍 Fetching skin analyses for customerId:', customerId);
    const skinAnalysesRef = collection(db, 'skinAnalyses');
    const skinAnalysesQuery = query(
      skinAnalysesRef,
      where('customerId', '==', customerId), // Changed from user.uid to customerId
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      skinAnalysesQuery,
      (snapshot) => {
        const analyses: SkinAnalysis[] = [];
        snapshot.forEach((doc) => {
          analyses.push({ id: doc.id, ...doc.data() } as SkinAnalysis);
        });
        console.log('✅ Fetched skin analyses:', analyses.length);
        setSkinAnalyses(analyses);
      },
      (error) => {
        console.error('❌ Error fetching skin analyses:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      }
    );

    return () => unsubscribe();
  }, [customerId, db]); // Changed dependency from user to customerId

  // Fetch user's consent records
  useEffect(() => {
    if (!customerId) return; // Use customerId for consistency

    const unsubscribe = watchCustomerConsents(db, customerId, (customerConsents) => {
      console.log('Fetched consents:', customerConsents.length);
      setConsents(customerConsents);
    });

    return () => unsubscribe();
  }, [customerId, db]); // Changed dependency from user to customerId

  // Fetch user's edit requests
  useEffect(() => {
    if (!customerId) {
      console.log('🔍 Edit requests: No customerId, skipping fetch');
      return;
    }

    console.log('🔍 Edit requests: Starting fetch for customerId:', customerId);

    const editRequestsRef = collection(db, 'appointmentEditRequests');
    const editRequestsQuery = query(
      editRequestsRef,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(editRequestsQuery, (snapshot) => {
      const requests: any[] = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ Fetched edit requests:', requests.length, requests);
      setEditRequests(requests);
    }, (error) => {
      console.error('❌ Error fetching edit requests:', error);
    });

    return () => unsubscribe();
  }, [customerId, db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      nav('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const requestNewAnalysis = async () => {
    if (!user) return;

    setRequestLoading(true);
    try {
      const functions = getFunctions();
      const requestNewSkinAnalysis = httpsCallable(functions, 'requestNewSkinAnalysis');
      
      const result = await requestNewSkinAnalysis({
        reason: 'Customer requested new skin analysis'
      });

      alert('Analysis request submitted successfully! An admin will review your request.');
      console.log('Analysis request submitted:', result.data);
    } catch (error: any) {
      console.error('Error requesting analysis:', error);
      alert(error.message || 'Failed to submit analysis request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleEditRequest = async (appointment: Appointment, requestedChanges: {
    start?: string;
    serviceIds?: string[];
    notes?: string;
    reason?: string;
  }) => {
    if (!customerId) {
      alert('Customer ID not found. Please try again.');
      return;
    }

    setEditRequestLoading(true);
    try {
      // Filter out undefined values to prevent Firebase errors
      const editRequestData: any = {
        appointmentId: appointment.id,
        customerId: customerId,
        requestedChanges,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only include reason if it's not undefined/empty
      if (requestedChanges.reason && requestedChanges.reason.trim()) {
        editRequestData.reason = requestedChanges.reason.trim();
      }

      await addDoc(collection(db, 'appointmentEditRequests'), editRequestData);
      
      setEditRequestModal({ open: false, appointment: null });
      alert('Edit request submitted successfully! We will review your request and get back to you soon.');
    } catch (error) {
      console.error('Error submitting edit request:', error);
      alert('Failed to submit edit request. Please try again.');
    } finally {
      setEditRequestLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter((apt) => apt.start && apt.status !== 'cancelled' && new Date(apt.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Past appointments should only include confirmed/attended appointments (not cancelled)
  const pastAppointments = appointments
    .filter((apt) => apt.start && new Date(apt.start) < new Date() && apt.status === 'confirmed')
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  // Cancelled appointments should only appear in cancelled section
  const cancelledAppointments = appointments.filter((apt) => apt.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h1 className="text-xl font-semibold text-slate-800">My Bookings</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {upcomingAppointments.length} Upcoming
                </span>
                {pastAppointments.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                    {pastAppointments.length} Past
                  </span>
                )}
                {cancelledAppointments.length > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {cancelledAppointments.length} Cancelled
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => nav('/book')}
                className="px-3 py-1.5 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium"
              >
                Book New
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif text-terracotta">Upcoming</h2>
            <button
              onClick={() => toggleSection('upcoming')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={collapsedSections.upcoming ? "Expand upcoming appointments" : "Collapse upcoming appointments"}
            >
              <svg 
                className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.upcoming ? '' : 'rotate-180'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {!collapsedSections.upcoming && (!hasCustomerRecord ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-slate-600 mb-4">You haven't made a booking yet</p>
              <button
                onClick={() => nav('/book')}
                className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-slate-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border-2 border-terracotta/30 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-cream/30"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        {/* Service Name & Status */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xl text-slate-900">
                            {service?.name || 'Service'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Service Name with Read More */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-slate-600">
                            {service?.name || 'Service'}
                          </span>
                          {service?.description && (
                            <button
                              onClick={() => {
                                // You could implement a modal or expand functionality here
                                alert(service.description);
                              }}
                              className="text-xs text-terracotta hover:text-terracotta/80 underline"
                            >
                              Read More
                            </button>
                          )}
                        </div>

                        {/* Date & Time */}
                        <div className="mb-3">
                          <p className="text-slate-700 font-medium">
                            📅 {format(new Date(apt.start), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-slate-600 text-sm mt-1">
                            🕐 {format(new Date(apt.start), 'h:mm a')} - {format(new Date(new Date(apt.start).getTime() + apt.duration * 60000), 'h:mm a')}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-terracotta">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${apt.totalPrice?.toFixed(2) || apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <button
                          onClick={() => {
                            console.log('Edit button clicked for appointment:', apt.id);
                            setEditRequestModal({ open: true, appointment: apt });
                          }}
                          className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors font-medium flex-shrink-0"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="px-4 py-2 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors font-medium flex-shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Past Appointments */}
        {hasCustomerRecord && pastAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-terracotta">Past Appointments</h2>
              <button
                onClick={() => toggleSection('past')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={collapsedSections.past ? "Expand past appointments" : "Collapse past appointments"}
              >
                <svg 
                  className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.past ? '' : 'rotate-180'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {!collapsedSections.past && (
            <div className="space-y-4">
              {pastAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border border-slate-300 rounded-xl p-5 bg-slate-50/50"
                  >
                    <div className="flex-grow">
                      {/* Service Name with Read More */}
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {service?.name || 'Service'}
                        </h3>
                        {service?.description && (
                          <button
                            onClick={() => {
                              alert(service.description);
                            }}
                            className="text-xs text-terracotta hover:text-terracotta/80 underline"
                          >
                            Read More
                          </button>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div className="mb-3">
                        <p className="text-slate-700 font-medium">
                          📅 {format(new Date(apt.start), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          🕐 {format(new Date(apt.start), 'h:mm a')} - {format(new Date(new Date(apt.start).getTime() + apt.duration * 60000), 'h:mm a')}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Cancelled Appointments */}
        {hasCustomerRecord && cancelledAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-terracotta">Cancelled</h2>
              <button
                onClick={() => toggleSection('cancelled')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={collapsedSections.cancelled ? "Expand cancelled appointments" : "Collapse cancelled appointments"}
              >
                <svg 
                  className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.cancelled ? '' : 'rotate-180'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {!collapsedSections.cancelled && (
            <div className="space-y-4">
              {cancelledAppointments.map((apt) => {
                const service = services[apt.serviceId];
                return (
                  <div
                    key={apt.id}
                    className="border border-red-200 rounded-xl p-5 bg-red-50/30 opacity-75"
                  >
                    <div className="flex-grow">
                      {/* Service Name & Cancelled Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {service?.name || 'Service'}
                          </h3>
                          {service?.description && (
                            <button
                              onClick={() => {
                                alert(service.description);
                              }}
                              className="text-xs text-terracotta hover:text-terracotta/80 underline"
                            >
                              Read More
                            </button>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="mb-3">
                        <p className="text-slate-700 font-medium">
                          📅 {format(new Date(apt.start), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          🕐 {format(new Date(apt.start), 'h:mm a')} - {format(new Date(new Date(apt.start).getTime() + apt.duration * 60000), 'h:mm a')}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${apt.bookedPrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Debug: Edit Requests State */}
        {import.meta.env.DEV && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug: Edit Requests State</h3>
            <p className="text-sm text-yellow-700">hasCustomerRecord: {hasCustomerRecord.toString()}</p>
            <p className="text-sm text-yellow-700">editRequests.length: {editRequests.length}</p>
            <p className="text-sm text-yellow-700">customerId: {customerId || 'null'}</p>
            <p className="text-sm text-yellow-700">editRequests: {JSON.stringify(editRequests, null, 2)}</p>
          </div>
        )}

        {/* Edit Requests */}
        {hasCustomerRecord && editRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-terracotta">Edit Requests</h2>
              <button
                onClick={() => toggleSection('editRequests')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={collapsedSections.editRequests ? "Expand edit requests" : "Collapse edit requests"}
              >
                <svg 
                  className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.editRequests ? '' : 'rotate-180'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {!collapsedSections.editRequests && (
            <div className="space-y-4">
              {editRequests.map((request) => {
                const appointment = appointments.find(apt => apt.id === request.appointmentId);
                const service = appointment ? services[appointment.serviceId] : null;
                
                return (
                  <div
                    key={request.id}
                    className="border border-blue-200 rounded-xl p-5 bg-blue-50/30"
                  >
                    <div className="flex-grow">
                      {/* Service Name & Status Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {service?.name || 'Service'} - Edit Request
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status || 'Pending'}
                        </span>
                      </div>

                      {/* Original Appointment Details */}
                      {appointment && (
                        <div className="mb-3">
                          <p className="text-slate-700 font-medium">
                            📅 Original: {format(new Date(appointment.start), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-slate-600 text-sm mt-1">
                            🕐 {format(new Date(appointment.start), 'h:mm a')} - {format(new Date(new Date(appointment.start).getTime() + appointment.duration * 60000), 'h:mm a')}
                          </p>
                        </div>
                      )}

                      {/* Requested Changes */}
                      {request.requestedChanges && (
                        <div className="mb-3 p-3 bg-white rounded-lg border">
                          <h4 className="font-medium text-slate-700 mb-2">Requested Changes:</h4>
                          {request.requestedChanges.start && (
                            <p className="text-sm text-slate-600">
                              📅 New Date: {format(new Date(request.requestedChanges.start), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                            </p>
                          )}
                          {request.requestedChanges.serviceIds && request.requestedChanges.serviceIds.length > 0 && (
                            <p className="text-sm text-slate-600">
                              🔧 New Services: {request.requestedChanges.serviceIds.join(', ')}
                            </p>
                          )}
                          {request.requestedChanges.notes && (
                            <p className="text-sm text-slate-600">
                              📝 Notes: {request.requestedChanges.notes}
                            </p>
                          )}
                          {request.reason && (
                            <p className="text-sm text-slate-600">
                              💭 Reason: {request.reason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Submitted Date */}
                      <div className="text-xs text-slate-500">
                        Submitted: {format(new Date(request.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Skin Analysis History */}
        {skinAnalyses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-terracotta">Skin Analysis History</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={requestNewAnalysis}
                  disabled={requestLoading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestLoading ? 'Submitting Request...' : 'Request New Analysis'}
                </button>
                <button
                  onClick={() => toggleSection('skinAnalysis')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={collapsedSections.skinAnalysis ? "Expand skin analysis history" : "Collapse skin analysis history"}
                >
                  <svg 
                    className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.skinAnalysis ? '' : 'rotate-180'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {!collapsedSections.skinAnalysis && (
            <div className="space-y-4">
              {skinAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border border-slate-300 rounded-xl p-5 bg-gradient-to-br from-white to-cream/30"
                >
                  <div className="flex items-start gap-4">
                    {/* Analysis Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={analysis.imageUrl}
                        alt="Skin analysis"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                      />
                    </div>
                    
                    {/* Analysis Details */}
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {analysis.type === 'skin' ? 'Skin Analysis' : 'Product Analysis'}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {analysis.status}
                        </span>
                      </div>
                      
                      {analysis.createdAt && (
                        <p className="text-sm text-slate-600 mb-3">
                          📅 {format(analysis.createdAt.toDate(), 'MMMM d, yyyy')}
                        </p>
                      )}
                      
                      {analysis.analysis && (
                        <div className="text-sm text-slate-700">
                          <p className="font-medium mb-1">Analysis Summary:</p>
                          <div className="space-y-2">
                            {analysis.analysis.summary && (
                              <p>{analysis.analysis.summary}</p>
                            )}
                            {analysis.analysis.recommendations && (
                              <div>
                                <p className="font-medium">Recommendations:</p>
                                <p>{analysis.analysis.recommendations}</p>
                              </div>
                            )}
                            {analysis.analysis.skinType && (
                              <div>
                                <p className="font-medium">Skin Type:</p>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  {analysis.analysis.skinType}
                                </span>
                              </div>
                            )}
                            {analysis.analysis.skinTone && (
                              <div>
                                <p className="font-medium">Skin Tone:</p>
                                <p>{analysis.analysis.skinTone.category} ({analysis.analysis.skinTone.undertone} undertone)</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* No Skin Analysis Message */}
        {skinAnalyses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Skin Analysis Yet</h3>
            <p className="text-slate-600 mb-4">Get personalized skin care recommendations with our AI-powered analysis.</p>
            <button
              onClick={() => nav('/skin-analysis')}
              className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
            >
              Start Skin Analysis
            </button>
          </div>
        )}

        {/* Consent Forms Section */}
        {hasCustomerRecord && consents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-grow">
                <h2 className="text-2xl font-serif text-terracotta">Consent Forms</h2>
                <p className="text-sm text-slate-600 mt-1">Your signed consent forms and agreements</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    {consents.filter(c => c.agreed && !c.needsRenewal).length} Active
                  </span>
                </div>
                <button
                  onClick={() => toggleSection('consentForms')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={collapsedSections.consentForms ? "Expand consent forms" : "Collapse consent forms"}
                >
                  <svg 
                    className={`w-6 h-6 text-slate-600 transition-transform duration-200 ${collapsedSections.consentForms ? '' : 'rotate-180'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {!collapsedSections.consentForms && (
            <div className="space-y-3">
              {consents.map((consent) => (
                <div
                  key={consent.id}
                  className={`border rounded-xl p-5 ${
                    consent.needsRenewal
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-green-200 bg-green-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {consent.consentFormCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        {consent.needsRenewal && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Renewal Required
                          </span>
                        )}
                        {consent.agreed && !consent.needsRenewal && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>
                          <span className="font-medium">Version:</span> {consent.consentFormVersion}
                        </p>
                        <p>
                          <span className="font-medium">Signed:</span>{' '}
                          {format(new Date(consent.consentedAt), 'MMMM d, yyyy')} at{' '}
                          {format(new Date(consent.consentedAt), 'h:mm a')}
                        </p>
                        {consent.signature && (
                          <p>
                            <span className="font-medium">Signature:</span>{' '}
                            <span className="font-serif italic">{consent.signature}</span>
                          </p>
                        )}
                        {consent.expiresAt && (
                          <p>
                            <span className="font-medium">Expires:</span>{' '}
                            {format(new Date(consent.expiresAt), 'MMMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      
                      {consent.needsRenewal && (
                        <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                          <p className="text-sm text-amber-900">
                            ⚠️ This consent form has been updated. Please review and sign the new version before your next appointment.
                          </p>
                          <button
                            onClick={() => nav('/book')}
                            className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                          >
                            Review & Sign New Version
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      {consent.agreed && !consent.needsRenewal ? (
                        <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Edit Request Modal */}
        {editRequestModal.open && editRequestModal.appointment && (
          <EditRequestModal
            appointment={editRequestModal.appointment}
            services={services}
            onClose={() => setEditRequestModal({ open: false, appointment: null })}
            onSubmit={handleEditRequest}
            loading={editRequestLoading}
          />
        )}
      </div>
    </div>
  );
}

