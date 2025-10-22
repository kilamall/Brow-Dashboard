import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, getDoc } from 'firebase/firestore';
import type { Customer, Appointment, Service } from '@buenobrows/shared/types';
import { format, parseISO, addWeeks } from 'date-fns';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { addCustomerNote, updateCustomerNote, deleteCustomerNote, updateCustomer } from '@buenobrows/shared/firestoreActions';

interface Props {
  customer: Customer;
  onClose: () => void;
}

export default function EnhancedCustomerDetailModal({ customer, onClose }: Props) {
  const { db, auth } = useFirebase();
  const nav = useNavigate();
  const [customerData, setCustomerData] = useState<Customer>(customer);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ category: 'general' as const, content: '' });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [editingInfo, setEditingInfo] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Load fresh customer data
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'customers', customer.id), (doc) => {
      if (doc.exists()) {
        const updatedCustomer = { id: doc.id, ...doc.data() } as Customer;
        setCustomerData(updatedCustomer);
        setEditedCustomer({
          name: updatedCustomer.name,
          email: updatedCustomer.email || '',
          phone: updatedCustomer.phone || ''
        });
      }
    });

    return unsubscribe;
  }, [customer.id, db]);

  // Load customer appointments
  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      where('customerId', '==', customer.id),
      orderBy('start', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const appts: Appointment[] = [];
      snap.forEach((d) => appts.push({ id: d.id, ...d.data() } as Appointment));
      setAppointments(appts);
    });

    return unsubscribe;
  }, [customer.id, db]);

  // Load services
  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const servicesMap: Record<string, Service> = {};
      snap.forEach((d) => {
        servicesMap[d.id] = { id: d.id, ...d.data() } as Service;
      });
      setServices(servicesMap);
    });

    return unsubscribe;
  }, [db]);

  const handleAddNote = async () => {
    if (!newNote.content.trim() || !customer.id || !auth.currentUser?.uid) return;
    
    setSaving(true);
    try {
      await addCustomerNote(db, customer.id, {
        ...newNote,
        addedBy: auth.currentUser.uid
      });
      setNewNote({ category: 'general', content: '' });
      setShowAddNote(false);
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('❌ Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNote(noteId);
    setNoteContent(content);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!noteContent.trim() || !customer.id) return;
    
    setSaving(true);
    try {
      await updateCustomerNote(db, customer.id, noteId, {
        content: noteContent
      });
      setEditingNote(null);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('❌ Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?') || !customer.id) return;
    
    setSaving(true);
    try {
      await deleteCustomerNote(db, customer.id, noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('❌ Failed to delete note');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomerInfo = async () => {
    if (!customer.id || !editedCustomer.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      await updateCustomer(db, customer.id, {
        name: editedCustomer.name,
        email: editedCustomer.email || undefined,
        phone: editedCustomer.phone || undefined
      });
      setEditingInfo(false);
      alert('✅ Customer information updated');
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('❌ Failed to update customer information');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRebook = () => {
    // Calculate date 2 weeks from today
    const twoWeeksFromNow = addWeeks(new Date(), 2);
    const dateStr = format(twoWeeksFromNow, 'yyyy-MM-dd');
    
    // Get most recent service or let admin choose
    const recentServiceId = pastAppointments.length > 0 ? pastAppointments[0].serviceId : undefined;
    
    // Navigate to schedule with customer info and date
    nav('/schedule', {
      state: {
        quickRebook: {
          customerId: customer.id,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          serviceId: recentServiceId,
          date: dateStr
        }
      }
    });
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'allergies': return 'bg-red-50 text-red-700 border-red-200';
      case 'preferences': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'history': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'special_requests': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'allergies': return '⚠️';
      case 'preferences': return '⭐';
      case 'history': return '📋';
      case 'special_requests': return '💬';
      default: return '📝';
    }
  };

  const upcomingAppointments = appointments.filter(a => 
    a.status !== 'cancelled' && new Date(a.start) > new Date()
  );
  
  const pastAppointments = appointments.filter(a => 
    a.status === 'confirmed' && new Date(a.start) <= new Date()
  );

  const totalSpent = pastAppointments.reduce((sum, appt) => 
    sum + (appt.totalPrice ?? appt.bookedPrice ?? services[appt.serviceId]?.price ?? 0), 0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-terracotta to-terracotta/90 text-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {(customerData.name && typeof customerData.name === 'string') ? customerData.name.split(' ').map(n => n[0]).join('') : '?'}
                </span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">{customerData.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(customerData.status || 'pending')}`}>
                    {customerData.status === 'active' ? '✅ Active' : 
                     customerData.status === 'blocked' ? '🚫 Blocked' : '⏳ Pending'}
                  </span>
                  {customerData.totalVisits && customerData.totalVisits > 0 && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                      🎯 {customerData.totalVisits} visit{customerData.totalVisits !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Lifetime Value</div>
              <div className="text-xl font-bold">${totalSpent.toFixed(2)}</div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Quick Rebook Button */}
          <button
            onClick={handleQuickRebook}
            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm border border-white/30"
            title="Book this customer again 2+ weeks from now"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Quick Rebook (2+ Weeks Ahead)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Info & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    Contact Information
                  </h3>
                  <button
                    onClick={() => setEditingInfo(!editingInfo)}
                    disabled={saving}
                    className="text-terracotta hover:text-terracotta/80 text-sm font-medium disabled:opacity-50"
                  >
                    {editingInfo ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editingInfo ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={editedCustomer.name}
                        onChange={(e) => setEditedCustomer({...editedCustomer, name: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editedCustomer.email}
                        onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editedCustomer.phone}
                        onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleUpdateCustomerInfo}
                      disabled={saving}
                      className="w-full bg-terracotta text-white py-2 rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">📧</span>
                      <div>
                        <div className="text-xs text-slate-500">Email</div>
                        <div className="text-sm font-medium">{customerData.email || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">📱</span>
                      <div>
                        <div className="text-xs text-slate-500">Phone</div>
                        <div className="text-sm font-medium">{customerData.phone || 'Not provided'}</div>
                      </div>
                    </div>
                    {customerData.createdAt && (
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">📅</span>
                        <div>
                          <div className="text-xs text-slate-500">Member Since</div>
                          <div className="text-sm font-medium">
                            {format(
                              customerData.createdAt.toDate ? 
                                customerData.createdAt.toDate() : 
                                new Date(customerData.createdAt), 
                              'MMM d, yyyy'
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Visits</span>
                    <span className="font-semibold text-lg">{customerData.totalVisits || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Upcoming</span>
                    <span className="font-semibold text-lg text-terracotta">{upcomingAppointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Spent</span>
                    <span className="font-semibold text-lg text-green-600">${totalSpent.toFixed(2)}</span>
                  </div>
                  {customerData.lastVisit && (
                    <div className="pt-3 border-t">
                      <div className="text-xs text-slate-500 mb-1">Last Visit</div>
                      <div className="text-sm font-medium">{format(parseISO(customerData.lastVisit), 'MMM d, yyyy')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              {upcomingAppointments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">🗓️</span>
                    Upcoming Appointments
                  </h3>
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appt) => (
                      <div key={appt.id} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="font-medium text-sm text-slate-800">
                          {format(parseISO(appt.start), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {format(parseISO(appt.start), 'h:mm a')} • {services[appt.serviceId]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Notes & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Notes */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Customer Notes
                  </h3>
                  <button
                    onClick={() => setShowAddNote(true)}
                    disabled={saving}
                    className="bg-terracotta text-white px-4 py-2 rounded-lg text-sm hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                  >
                    + Add Note
                  </button>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  Track preferences, allergies, history, and special requests for {customerData.name}
                </div>

                {/* Add Note Form */}
                {showAddNote && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={newNote.category}
                          onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="general">📝 General</option>
                          <option value="preferences">⭐ Preferences</option>
                          <option value="allergies">⚠️ Allergies</option>
                          <option value="history">📋 History</option>
                          <option value="special_requests">💬 Special Requests</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                        <textarea
                          value={newNote.content}
                          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                          placeholder="Add a note about this customer..."
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.content.trim() || saving}
                          className="bg-terracotta text-white px-4 py-2 rounded-lg text-sm hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Adding...' : 'Add Note'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddNote(false);
                            setNewNote({ category: 'general', content: '' });
                          }}
                          disabled={saving}
                          className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                <div className="space-y-3">
                  {customerData.structuredNotes?.length ? (
                    customerData.structuredNotes.map((note) => (
                      <div key={note.id} className={`border rounded-lg p-4 ${getCategoryColor(note.category)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">{getCategoryIcon(note.category)}</span>
                              <span className="text-xs font-medium uppercase tracking-wide">
                                {note.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {format(parseISO(note.addedAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            {editingNote === note.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={noteContent}
                                  onChange={(e) => setNoteContent(e.target.value)}
                                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateNote(note.id)}
                                    disabled={saving}
                                    className="bg-terracotta text-white px-3 py-1 rounded text-xs hover:bg-terracotta/90 disabled:opacity-50"
                                  >
                                    {saving ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNote(null);
                                      setNoteContent('');
                                    }}
                                    disabled={saving}
                                    className="border border-slate-300 text-slate-700 px-3 py-1 rounded text-xs hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm leading-relaxed">{note.content}</div>
                            )}
                          </div>
                          {editingNote !== note.id && (
                            <div className="flex gap-1 ml-3">
                              <button
                                onClick={() => handleEditNote(note.id, note.content)}
                                disabled={saving}
                                className="text-slate-400 hover:text-slate-600 p-1.5 disabled:opacity-50"
                                title="Edit note"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={saving}
                                className="text-red-400 hover:text-red-600 p-1.5 disabled:opacity-50"
                                title="Delete note"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <div className="text-5xl mb-3">📝</div>
                      <div className="text-base font-medium mb-1">No customer notes yet</div>
                      <div className="text-sm text-slate-400">
                        Add notes to track preferences, allergies, history, and special requests
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  Recent Appointments ({appointments.length} total)
                </h3>
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-5xl mb-3">📅</div>
                    <div className="text-base font-medium">No appointments yet</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment) => {
                      const isPast = new Date(appointment.start) <= new Date();
                      return (
                        <div
                          key={appointment.id}
                          className={`border rounded-lg p-4 transition-colors ${
                            isPast ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-slate-800">
                                  {format(parseISO(appointment.start), 'MMM d, yyyy')}
                                </div>
                                <div className="text-slate-600">
                                  {format(parseISO(appointment.start), 'h:mm a')}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {services[appointment.serviceId]?.name || 'Unknown Service'}
                              </div>
                              {appointment.notes && (
                                <div className="mt-2 text-sm text-slate-600 italic bg-white rounded p-2 border border-slate-200">
                                  📌 {appointment.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-xl text-terracotta">
                                ${(appointment.totalPrice ?? appointment.bookedPrice ?? services[appointment.serviceId]?.price ?? 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
