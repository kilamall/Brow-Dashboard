import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  watchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '@buenobrows/shared/firestoreActions';
import { deleteCustomerDataClient } from '@buenobrows/shared/functionsClient';
import type { Customer } from '@buenobrows/shared/types';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatMessageTime } from '@buenobrows/shared/messaging';
import type { Message } from '@buenobrows/shared/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EnhancedCustomerDetailModal from '../components/EnhancedCustomerDetailModal';


export default function Customers(){
  const { db } = useFirebase();
  const [rows, setRows] = useState<Customer[]>([]);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'name'|'date'|'visits'>('name');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [collapsedSegments, setCollapsedSegments] = useState<Set<string>>(new Set());
  
  useEffect(()=> {
    return watchCustomers(db, q, setRows);
  }, [q]);

  // Sort customers based on selected option
  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    switch(sortBy) {
      case 'name':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'date':
        return sorted.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime; // Newest first
        });
      case 'visits':
        return sorted.sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0));
      default:
        return sorted;
    }
  }, [rows, sortBy]);

  // Group customers by status/segment
  const customersBySegment = useMemo(() => {
    const groups: Record<string, Customer[]> = {
      'VIP Customers': [],
      'Regular Customers': [],
      'Active Customers': [],
      'Pending Approval': [],
      'Blocked Customers': []
    };

    sortedRows.forEach((customer) => {
      if (customer.status === 'blocked') {
        groups['Blocked Customers'].push(customer);
      } else if (customer.status === 'pending') {
        groups['Pending Approval'].push(customer);
      } else if (customer.status === 'active') {
        if ((customer.totalVisits || 0) >= 10) {
          groups['VIP Customers'].push(customer);
        } else if ((customer.totalVisits || 0) >= 5) {
          groups['Regular Customers'].push(customer);
        } else {
          groups['Active Customers'].push(customer);
        }
      }
    });

    return groups;
  }, [sortedRows]);

  const toggleSegment = (segment: string) => {
    setCollapsedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(segment)) {
        newSet.delete(segment);
      } else {
        newSet.add(segment);
      }
      return newSet;
    });
  };

  const getSegmentIcon = (segment: string) => {
    switch(segment) {
      case 'VIP Customers': return '👑';
      case 'Regular Customers': return '⭐';
      case 'Active Customers': return '✅';
      case 'Pending Approval': return '⏳';
      case 'Blocked Customers': return '🚫';
      default: return '👤';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-2xl text-slate-800">Customers</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your customer relationships and track their journey</p>
        </div>
        <div className="flex gap-3">
          <input 
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            placeholder="Search customers..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
          />
          <button 
            className="bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors flex items-center gap-2"
            onClick={()=>setEditing({id:'', name:'', email:'', phone:'', status:'pending', totalVisits:0})}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{sortedRows.length}</div>
          <div className="text-xs text-slate-600">Total Customers</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedRows.filter(c => c.status === 'active').length}
          </div>
          <div className="text-xs text-slate-600">Active</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {sortedRows.filter(c => (c.totalVisits || 0) >= 5).length}
          </div>
          <div className="text-xs text-slate-600">Regulars</div>
        </div>
        <div className="bg-terracotta/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-terracotta">
            {sortedRows.reduce((sum, c) => sum + (c.totalVisits || 0), 0)}
          </div>
          <div className="text-xs text-slate-600">Total Visits</div>
        </div>
      </div>

      {/* Customers by Segment */}
      <div className="space-y-4">
        {Object.entries(customersBySegment).map(([segment, segmentCustomers]) => {
          const isCollapsed = collapsedSegments.has(segment);
          return (
            <div key={segment} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Segment Header */}
              <button
                onClick={() => toggleSegment(segment)}
                className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getSegmentIcon(segment)}</span>
                  <div className="text-sm font-semibold text-slate-700">
                    {segment}
                  </div>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {segmentCustomers.length} customer{segmentCustomers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <svg 
                  className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Segment Content */}
              {!isCollapsed && (
                <div className="p-4">
                  {segmentCustomers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <div className="text-4xl mb-2">📭</div>
                      <div className="text-sm">No customers in this segment</div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {segmentCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-terracotta/20 rounded-full flex items-center justify-center text-sm font-semibold text-terracotta">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                          </div>

                          {/* Customer Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-slate-800 truncate">
                                {customer.name || 'Unnamed Customer'}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                customer.status === 'active' ? 'bg-green-100 text-green-700' :
                                customer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {customer.status}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                              {customer.email && (
                                <div className="truncate">{customer.email}</div>
                              )}
                              {customer.phone && (
                                <div className="truncate">{customer.phone}</div>
                              )}
                            </div>
                          </div>

                          {/* Visit Count */}
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-800">
                              {customer.totalVisits || 0} visits
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewing(customer)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setEditing(customer)}
                              className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete all data for ${customer.name || 'this customer'}? This action cannot be undone.`)) {
                                  try {
                                    await deleteCustomerDataClient(customer.id);
                                    alert('Customer data deleted successfully');
                                  } catch (error) {
                                    console.error('Delete failed:', error);
                                    alert('Failed to delete customer data');
                                  }
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete All Data
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} db={db} />}
      {viewing && <EnhancedCustomerDetailModal customer={viewing} onClose={()=>setViewing(null)} />}
      
    </div>
  );
}

function CustomerDetails({ customer, onClose, db }: { customer: Customer; onClose: () => void; db: any }) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (showChat) {
      loadMessages();
    }
  }, [showChat, customer.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('customerId', '==', customer.id), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(messages);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await addDoc(collection(db, 'messages'), {
        customerId: customer.id,
        senderId: user.uid,
        senderName: 'Admin',
        content: newMessage,
        timestamp: new Date(),
        isFromCustomer: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Customer Details</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Basic Information</h4>
              <div className="space-y-2">
                <div><span className="text-slate-600">Name:</span> {customer.name || 'N/A'}</div>
                <div><span className="text-slate-600">Email:</span> {customer.email || 'N/A'}</div>
                <div><span className="text-slate-600">Phone:</span> {customer.phone || 'N/A'}</div>
                <div><span className="text-slate-600">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700' :
                    customer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Visit Statistics</h4>
              <div className="space-y-2">
                <div><span className="text-slate-600">Total Visits:</span> {customer.totalVisits || 0}</div>
                <div><span className="text-slate-600">Member Since:</span> {
                  customer.createdAt ? new Date(customer.createdAt.toMillis()).toLocaleDateString() : 'N/A'
                }</div>
                <div><span className="text-slate-600">Last Visit:</span> {
                  customer.lastVisit ? new Date(customer.lastVisit.toMillis()).toLocaleDateString() : 'N/A'
                }</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Messages</h4>
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>

            {showChat && (
              <div className="border border-slate-200 rounded-lg h-64 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                    <div className="text-center text-slate-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500">No messages yet</div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.isFromCustomer 
                            ? 'bg-slate-100 text-slate-800' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          <div className="text-sm">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.isFromCustomer ? 'text-slate-500' : 'text-blue-100'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-200 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Editor({ initial, onClose, db }:{ initial: Customer; onClose: ()=>void; db: any }){
  const [customer, setCustomer] = useState<Customer>(initial);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (customer.id) {
        await updateCustomer(db, customer);
      } else {
        await createCustomer(db, customer);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              {customer.id ? 'Edit Customer' : 'Add Customer'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={customer.name || ''}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={customer.email || ''}
              onChange={(e) => setCustomer({...customer, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={customer.phone || ''}
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={customer.status || 'pending'}
              onChange={(e) => setCustomer({...customer, status: e.target.value as 'active' | 'pending' | 'blocked'})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Total Visits</label>
            <input
              type="number"
              value={customer.totalVisits || 0}
              onChange={(e) => setCustomer({...customer, totalVisits: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

