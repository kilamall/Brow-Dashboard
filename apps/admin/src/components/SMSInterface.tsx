import React, { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, where } from 'firebase/firestore';

interface SMSConversation {
  id: string;
  customerId: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  timestamp: any;
  messageType?: string;
  sentBy?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
}

interface SMSInterfaceProps {
  className?: string;
}

export default function SMSInterface({ className = '' }: SMSInterfaceProps) {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { db, functions } = useFirebase();

  useEffect(() => {
    // Subscribe to SMS conversations
    const conversationsQuery = query(
      collection(db, 'sms_conversations'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SMSConversation));
      setConversations(convos);
      setLoading(false);
    });

    // Subscribe to customers
    const customersQuery = query(
      collection(db, 'customers'),
      where('phone', '!=', null)
    );

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const custs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Customer));
      setCustomers(custs);
    });

    return () => {
      unsubscribeConversations();
      unsubscribeCustomers();
    };
  }, [db]);

  const getCustomerByPhone = (phoneNumber: string): Customer | undefined => {
    return customers.find(customer => customer.phone === phoneNumber);
  };

  const getUniquePhoneNumbers = (): string[] => {
    const phoneNumbers = new Set<string>();
    conversations.forEach(conv => {
      if (conv.phoneNumber) {
        phoneNumbers.add(conv.phoneNumber);
      }
    });
    return Array.from(phoneNumbers);
  };

  const getConversationForPhone = (phoneNumber: string): SMSConversation[] => {
    return conversations
      .filter(conv => conv.phoneNumber === phoneNumber)
      .sort((a, b) => new Date(a.timestamp?.toDate?.() || a.timestamp).getTime() - 
                      new Date(b.timestamp?.toDate?.() || b.timestamp).getTime());
  };

  const handleSendSMS = async () => {
    if (!newMessage.trim() || !selectedCustomer || sending) return;

    setSending(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer?.phone) {
        throw new Error('Customer phone number not found');
      }

      // Call Cloud Function to send SMS
      const sendSMSFunction = functions.httpsCallable('sendSMSToCustomer');
      const result = await sendSMSFunction({
        phoneNumber: customer.phone,
        message: newMessage.trim(),
        customerId: selectedCustomer
      });

      if (result.data.success) {
        setNewMessage('');
        // The conversation will be updated automatically via the real-time listener
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-white rounded-lg shadow ${className}`}>
      {/* SMS Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">SMS Conversations</h2>
          <p className="text-sm text-gray-500">Customer text messages</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {getUniquePhoneNumbers().length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No SMS conversations yet
            </div>
          ) : (
            getUniquePhoneNumbers().map((phoneNumber) => {
              const customer = getCustomerByPhone(phoneNumber);
              const customerConversations = getConversationForPhone(phoneNumber);
              const lastMessage = customerConversations[customerConversations.length - 1];
              const unreadCount = customerConversations.filter(c => 
                c.direction === 'inbound' && !c.read
              ).length;

              return (
                <div
                  key={phoneNumber}
                  onClick={() => setSelectedCustomer(customer?.id || null)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedCustomer === customer?.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {customer?.name || 'SMS Customer'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {phoneNumber}
                      </p>
                      {lastMessage && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {lastMessage.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mt-1">
                        {lastMessage && formatMessageTime(lastMessage.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200">
              {(() => {
                const customer = customers.find(c => c.id === selectedCustomer);
                return customer ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(() => {
                const customer = customers.find(c => c.id === selectedCustomer);
                if (!customer) return null;
                
                const customerConversations = getConversationForPhone(customer.phone);
                
                if (customerConversations.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  );
                }

                return customerConversations.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendSMS()}
                  placeholder="Type your SMS message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendSMS}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 SMS messages are sent via Twilio. Standard messaging rates apply.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
