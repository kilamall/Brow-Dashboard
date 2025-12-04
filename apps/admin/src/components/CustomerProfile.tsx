import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Customer, Appointment, Service } from '@buenobrows/shared/types';
import { formatMessageTime } from '@buenobrows/shared/messaging';
import type { Message } from '@buenobrows/shared/messaging';
import { updateCustomer } from '@buenobrows/shared/firestoreActions';

interface CustomerProfileProps {
  customer: Customer;
  onClose: () => void;
  db: any;
}

export default function CustomerProfile({ customer, onClose, db }: CustomerProfileProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'receipts' | 'communications' | 'analytics'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState(customer.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();
  
  // Real-time customer data to stay updated
  const [currentCustomer, setCurrentCustomer] = useState<Customer>(customer);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    birthday: customer.birthday || '',
    status: customer.status || 'pending'
  });
  const [saving, setSaving] = useState(false);

  // Load customer data
  useEffect(() => {
    if (!customer.id) return;

    // Subscribe to real-time customer updates
    const customerDocRef = doc(db, 'customers', customer.id);
    const unsubscribeCustomer = onSnapshot(customerDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const customerData = { id: snapshot.id, ...snapshot.data() } as Customer;
        setCurrentCustomer(customerData);
        setNotes(customerData.notes || '');
        // Update editedCustomer if not currently editing
        if (!isEditing) {
          setEditedCustomer({
            name: customerData.name,
            email: customerData.email || '',
            phone: customerData.phone || '',
            birthday: customerData.birthday || '',
            status: customerData.status || 'pending'
          });
        }
      }
    });

    // Load appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('customerId', '==', customer.id),
      orderBy('start', 'desc')
    );

    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appts: Appointment[] = [];
      snapshot.forEach((doc) => {
        appts.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appts);
    });

    // Load services
    const servicesQuery = query(collection(db, 'services'), where('active', '==', true));
    const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
      const svcs: Service[] = [];
      snapshot.forEach((doc) => {
        svcs.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(svcs);
    });

    return () => {
      unsubscribeCustomer();
      unsubscribeAppointments();
      unsubscribeServices();
    };
  }, [customer.id, db, isEditing]);

  // Load messages when chat is shown
  useEffect(() => {
    if (!showChat || !customer.id) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('customerId', '==', customer.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [showChat, currentCustomer.id, db]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      // Check if customer document exists first
      const customerRef = doc(db, 'customers', currentCustomer.id);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        throw new Error(`Customer document ${currentCustomer.id} does not exist. This may be an orphaned customer.`);
      }
      
      // Update with timestamp
      await updateDoc(customerRef, { 
        notes,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Notes saved successfully');
    } catch (error: any) {
      console.error('Failed to save notes:', error);
      const errorMessage = error.message || error.code || 'Unknown error';
      alert(`Failed to save notes: ${errorMessage}\n\nIf this persists, the customer may be orphaned. Try running "Clean Orphaned Migrations" in Settings > Data Management.`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!editedCustomer.name?.trim()) {
      alert('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      await updateCustomer(db, currentCustomer.id, editedCustomer as Customer);
      setIsEditing(false);
      // Customer data will auto-update via the real-time listener
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedCustomer({
      name: currentCustomer.name,
      email: currentCustomer.email || '',
      phone: currentCustomer.phone || '',
      birthday: currentCustomer.birthday || '',
      status: currentCustomer.status || 'pending'
    });
    setIsEditing(false);
  };

  // Calculate completed visits (only past appointments with completed/confirmed status)
  const getCompletedVisits = () => {
    const now = new Date();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      return (
        (appointment.status === 'completed') ||
        (appointment.status === 'confirmed' && appointmentDate < now)
      );
    });
  };

  const completedVisits = getCompletedVisits();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const adminId = auth.currentUser?.uid || 'admin';
      const adminName = auth.currentUser?.displayName || 'Admin';

      await addDoc(collection(db, 'messages'), {
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email || '',
        adminId,
        adminName,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        type: 'admin',
        priority: 'medium',
        isAI: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getServicePrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  const calculateTotalSpent = () => {
    return appointments
      .filter(apt => apt.status === 'confirmed' || apt.status === 'completed' || apt.status === 'pending')
      .reduce((total, apt) => {
        return total + (apt.totalPrice || apt.bookedPrice || getServicePrice(apt.serviceId) || 0);
      }, 0);
  };

  const calculateAverageSpending = () => {
    if (completedVisits.length === 0) return 0;
    const completedSpending = completedVisits.reduce((total, apt) => {
      return total + (apt.totalPrice || apt.bookedPrice || getServicePrice(apt.serviceId) || 0);
    }, 0);
    return completedSpending / completedVisits.length;
  };

  const getCustomerAvatar = () => {
    // If customer has a profile picture, show it
    if (currentCustomer.profilePictureUrl) {
      return (
        <img 
          src={currentCustomer.profilePictureUrl} 
          alt={currentCustomer.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const initials = (currentCustomer.name && typeof currentCustomer.name === 'string') ? currentCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
              parent.innerHTML = `<div class="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center"><span class="text-lg font-semibold text-terracotta">${initials}</span></div>`;
            }
          }}
        />
      );
    }
    
    // Fallback to initials if no profile picture
    const initials = (currentCustomer.name && typeof currentCustomer.name === 'string') ? currentCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    return (
      <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
        <span className="text-lg font-semibold text-terracotta">{initials}</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'receipts', label: 'Receipts', icon: '📄' },
    { id: 'communications', label: 'Messages', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {getCustomerAvatar()}
            <div>
              <h2 className="font-serif text-2xl text-slate-800">{currentCustomer.name}</h2>
              <p className="text-sm text-slate-600">
                Customer since {currentCustomer.createdAt ? new Date(currentCustomer.createdAt.toMillis?.() || currentCustomer.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-sm bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={editedCustomer.name || ''}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editedCustomer.email || ''}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editedCustomer.phone || ''}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Birthday</label>
                      <input
                        type="date"
                        value={editedCustomer.birthday || ''}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, birthday: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        value={editedCustomer.status || 'pending'}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, status: e.target.value as any })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveCustomer}
                        disabled={saving || !editedCustomer.name?.trim()}
                        className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-slate-700 font-medium">{currentCustomer.name}</span>
                    </div>
                    {currentCustomer.email && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <span className="text-sm text-slate-700 break-all">{currentCustomer.email}</span>
                    </div>
                  )}
                  {currentCustomer.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-slate-700">{currentCustomer.phone}</span>
                    </div>
                  )}
                  {currentCustomer.birthday && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-slate-700">
                        {new Date(currentCustomer.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(currentCustomer.status || 'pending')}`}>
                        {currentCustomer.status || 'pending'}
                      </span>
                    </div>
                </div>
                )}
              </div>

              {/* Quick Stats */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                    <div className="text-xs text-slate-600">Total Bookings</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(currentCustomer.status || 'pending')}`}>
                        {currentCustomer.status || 'pending'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Status</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${calculateTotalSpent().toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-600">Total Spent</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {appointments.length > 0 ? new Date(appointments[0].start).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600">Last Visit</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3>
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this customer..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes || notes === (currentCustomer.notes || '')}
                      className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Booking History</h3>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No bookings found for this customer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-800">
                          {getServiceName(appointment.serviceId)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(appointment.start).toLocaleDateString()} at {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Price:</span>
                          <span className="ml-2 font-medium">
                            ${appointment.totalPrice || appointment.bookedPrice || getServicePrice(appointment.serviceId)}
                          </span>
                        </div>
                      </div>
                      {appointment.receiptUrl && (
                        <div className="mt-2">
                          <a 
                            href={appointment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-terracotta hover:text-terracotta/80 hover:underline"
                          >
                            📄 View Receipt
                          </a>
                          {appointment.receiptGeneratedAt && (
                            <span className="ml-2 text-xs text-slate-500">
                              Generated {new Date(appointment.receiptGeneratedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Payment History</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">${calculateTotalSpent().toFixed(2)}</div>
                  <div className="text-xs text-slate-600">Total Spent</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">${calculateAverageSpending().toFixed(2)}</div>
                  <div className="text-xs text-slate-600">Average per Visit</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{completedVisits.length}</div>
                  <div className="text-xs text-slate-600">Total Visits</div>
                </div>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No payment history available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800">{getServiceName(appointment.serviceId)}</div>
                          <div className="text-sm text-slate-600">
                            {new Date(appointment.start).toLocaleDateString()} at {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600">
                            Service: ${appointment.bookedPrice || ((appointment.totalPrice || 0) - (appointment.tip || 0)) || getServicePrice(appointment.serviceId)}
                          </div>
                          {appointment.tip && appointment.tip > 0 && (
                            <div className="text-sm text-slate-600">
                              Tip: ${appointment.tip}
                            </div>
                          )}
                          <div className="font-semibold text-slate-800">
                            Total: ${appointment.totalPrice || appointment.bookedPrice || getServicePrice(appointment.serviceId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Receipts</h3>
              <div className="text-sm text-slate-600 mb-4">
                All receipts for completed appointments are automatically generated and stored here.
              </div>
              
              {(() => {
                // Show receipts for completed appointments OR any appointment with a receiptUrl
                // This handles cases where receipt was generated but status might not be 'completed' yet
                const receiptsWithData = appointments
                  .filter(apt => apt.receiptUrl && (apt.status === 'completed' || apt.attendance === 'attended'))
                  .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
                
                if (receiptsWithData.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-500">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm">No receipts available yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Receipts are automatically generated when appointments are marked as attended
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {receiptsWithData.map((appointment) => {
                      const serviceIds = (appointment as any).serviceIds || (appointment as any).selectedServices || [appointment.serviceId];
                      const serviceNames = serviceIds.map((serviceId: string) => {
                        const service = services.find(s => s.id === serviceId);
                        return service?.name || 'Unknown Service';
                      }).join(', ');
                      
                      return (
                        <div key={appointment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-slate-900">
                                  Receipt #{appointment.receiptNumber || `RCP-${appointment.id.substring(0, 8).toUpperCase()}`}
                                </h4>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  Completed
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(appointment.start).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div>
                                  <span className="font-medium">Services:</span> {serviceNames}
                                </div>
                                <div>
                                  <span className="font-medium">Total:</span> ${appointment.totalPrice || appointment.bookedPrice || 0}
                                </div>
                              </div>
                              
                              {appointment.receiptGeneratedAt && (
                                <div className="text-xs text-slate-500 mt-2">
                                  Generated: {new Date(appointment.receiptGeneratedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <a
                                href={appointment.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors text-sm"
                              >
                                <span>📄</span>
                                View Receipt
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Messages</h3>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors text-sm"
                >
                  {showChat ? 'Hide Chat' : 'Show Chat'}
                </button>
              </div>

              {showChat && (
                <div className="bg-slate-50 rounded-lg overflow-hidden">
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No messages yet. Start a conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-xs">
                            <div
                              className={`px-3 py-2 rounded-lg ${
                                message.type === 'admin'
                                  ? message.isAI
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              {message.type === 'admin' && (
                                <p className={`text-xs mb-1 ${message.isAI ? 'text-purple-200' : 'text-blue-200'}`}>
                                  {message.adminName || 'Admin'}
                                  {message.isAI && ' 🤖'}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${
                              message.type === 'admin' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Customer Analytics</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-3">Visit Patterns</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Visits:</span>
                      <span className="font-medium">{completedVisits.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average per Month:</span>
                      <span className="font-medium">
                        {currentCustomer.createdAt ? 
                          (completedVisits.length / Math.max(1, Math.floor((Date.now() - (currentCustomer.createdAt.toMillis?.() || currentCustomer.createdAt)) / (1000 * 60 * 60 * 24 * 30)))).toFixed(1) : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last Visit:</span>
                      <span className="font-medium">
                        {appointments.length > 0 ? new Date(appointments[0].start).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-3">Spending Patterns</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Spent:</span>
                      <span className="font-medium">${calculateTotalSpent().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average per Visit:</span>
                      <span className="font-medium">${calculateAverageSpending().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Highest Single Visit:</span>
                      <span className="font-medium">
                        ${Math.max(...appointments.map(a => a.totalPrice || a.bookedPrice || getServicePrice(a.serviceId) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Preferences */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-3">Service Preferences</h4>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500">No service history available.</p>
                ) : (
                  <div className="space-y-2">
                    {services.map(service => {
                      const serviceAppointments = appointments.filter(a => a.serviceId === service.id);
                      if (serviceAppointments.length === 0) return null;
                      
                      return (
                        <div key={service.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{serviceAppointments.length} times</span>
                            <span className="text-slate-500">
                              (${serviceAppointments.reduce((sum, a) => sum + (a.totalPrice || a.bookedPrice || service.price || 0), 0).toFixed(2)})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
