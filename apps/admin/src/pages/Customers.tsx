import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  watchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '@buenobrows/shared/firestoreActions';
import type { Customer } from '@buenobrows/shared/types';
import CustomerProfile from '../components/CustomerProfile';


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
        // Active customers are further segmented by visit count
        if ((customer.totalVisits || 0) >= 10) {
          groups['VIP Customers'].push(customer);
        } else if ((customer.totalVisits || 0) >= 3) {
          groups['Regular Customers'].push(customer);
        } else {
          groups['Active Customers'].push(customer);
        }
      }
    });

    // Remove empty segments
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
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

  const getCustomerAvatar = (customer: Customer) => {
    // Debug: Log customer data to see if profilePictureUrl exists
    console.log('Customer data:', customer.name, 'Profile picture URL:', customer.profilePictureUrl);
    
    // If customer has a profile picture, show it
    if (customer.profilePictureUrl) {
      console.log('Showing profile picture for:', customer.name);
      return (
        <img 
          src={customer.profilePictureUrl} 
          alt={customer.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            console.log('Image failed to load for:', customer.name);
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const initials = (customer.name && typeof customer.name === 'string') ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
              parent.innerHTML = `<div class="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center"><span class="text-sm font-semibold text-terracotta">${initials}</span></div>`;
            }
          }}
        />
      );
    }
    
    console.log('No profile picture for:', customer.name, 'showing initials');
    // Fallback to initials if no profile picture
    const initials = (customer.name && typeof customer.name === 'string') ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    return (
      <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-terracotta">{initials}</span>
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

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
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
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="date">Sort: Newest First</option>
            <option value="visits">Sort: Most Visits</option>
          </select>
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
                  className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Segment Customers */}
              {!isCollapsed && (
                <div className="p-4 bg-white">
                  <div className="grid gap-4">
                    {segmentCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-4 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Customer Avatar */}
                            <div className="flex-shrink-0">
                              {getCustomerAvatar(customer)}
                            </div>
                            
                            {/* Customer Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <button 
                                  className="font-medium text-slate-800 hover:text-terracotta transition-colors"
                                  onClick={()=>setViewing(customer)}
                                >
                                  {customer.name}
                                </button>
                                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(customer.status || 'pending')}`}>
                                  {customer.status || 'pending'}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-slate-600">
                                {customer.email && (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    {customer.email}
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {customer.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Customer Stats & Actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-slate-800">{customer.totalVisits || 0}</div>
                              <div className="text-xs text-slate-500">visits</div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditing(customer)}
                                className="px-3 py-1 text-sm border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete ${customer.name}?\n\nThis action cannot be undone and will remove:\n• Customer profile and contact information\n• All booking history\n• All related data`)) {
                                    deleteCustomer(db, customer.id);
                                  }
                                }}
                                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && <Editor initial={editing} onClose={()=>setEditing(null)} db={db} />}
      {viewing && <CustomerProfile customer={viewing} onClose={()=>setViewing(null)} db={db} />}
    </div>
  );
}


function Editor({ initial, onClose, db }:{ initial: Customer; onClose: ()=>void; db: any }){
  const [c, setC] = useState<Customer>(initial);
  const [loading, setLoading] = useState(false);

  // Sync state with prop changes
  useEffect(() => {
    setC(initial);
  }, [initial]);

  async function save(){
    setLoading(true);
    try {
      if (c.id) await updateCustomer(db, c.id, c);
      else await createCustomer(db, c);
      onClose();
    } catch (error) {
      console.error('Failed to save customer:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-slate-800">
            {c.id ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="Customer name" 
              value={c.name} 
              onChange={e=>setC({...c, name:e.target.value})} 
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="email@example.com" 
                value={c.email||''} 
                onChange={e=>setC({...c, email:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
                placeholder="(555) 123-4567" 
                value={c.phone||''} 
                onChange={e=>setC({...c, phone:e.target.value})} 
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              value={c.status||'pending'} 
              onChange={e=>setC({...c, status: e.target.value as any})}
            >
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
              placeholder="Add any notes about this customer..." 
              value={c.notes||''} 
              onChange={e=>setC({...c, notes:e.target.value})} 
              rows={3}
            />
          </div>

          {/* Send Initial Request - Only for existing customers */}
          {c.id && c.email && (
            <div className="border-t border-slate-200 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Send Initial Request</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Send a welcome message and booking invitation to this customer.
                </p>
                <button 
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={async () => {
                    if (confirm(`Send initial request to ${c.name} at ${c.email}?`)) {
                      try {
                        // TODO: Implement sendInitialRequest function
                        alert('Initial request sent! (Feature coming soon)');
                      } catch (error) {
                        console.error('Failed to send initial request:', error);
                        alert('Failed to send initial request');
                      }
                    }
                  }}
                >
                  📧 Send Initial Request
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-terracotta text-white rounded-lg px-4 py-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50" 
              onClick={save}
              disabled={loading || !c.name.trim()}
            >
              {loading ? 'Saving...' : (c.id ? 'Update Customer' : 'Create Customer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}