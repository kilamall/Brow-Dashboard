import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { useFirebase } from '@buenobrows/shared/useFirebase';


interface AIConversation {
  id: string;
  customerId: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  timestamp: any;
  aiContext?: any;
  smsSent?: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
}

const AIConversationManager: React.FC = () => {
  const { db } = useFirebase();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');

  useEffect(() => {
    // Listen to AI SMS conversations
    const conversationsQuery = query(
      collection(db, 'ai_sms_conversations'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIConversation[];
      
      setConversations(conversationData);
      setLoading(false);
    });

    // Listen to customers
    const customersQuery = query(collection(db, 'customers'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      
      setCustomers(customerData);
    });

    return () => {
      unsubscribeConversations();
      unsubscribeCustomers();
    };
  }, []);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getCustomerPhone = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.phone || 'Unknown Phone';
  };

  const filteredConversations = conversations.filter(conv => {
    if (selectedCustomer && conv.customerId !== selectedCustomer) return false;
    if (filter !== 'all' && conv.direction !== filter) return false;
    return true;
  });

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const key = conv.customerId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, AIConversation[]>);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getMessageStatus = (conv: AIConversation) => {
    if (conv.direction === 'outbound') {
      return conv.smsSent ? '✅ Sent' : '❌ Failed';
    }
    return '📱 Received';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI SMS Conversations</h2>
          <p className="text-gray-600">Monitor AI-powered customer interactions</p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Messages</option>
            <option value="inbound">Inbound Only</option>
            <option value="outbound">Outbound Only</option>
          </select>
          
          <select
            value={selectedCustomer || ''}
            onChange={(e) => setSelectedCustomer(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
          <div className="text-gray-600">Total Messages</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {conversations.filter(c => c.direction === 'inbound').length}
          </div>
          <div className="text-gray-600">Inbound</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {conversations.filter(c => c.direction === 'outbound').length}
          </div>
          <div className="text-gray-600">AI Responses</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(groupedConversations).length}
          </div>
          <div className="text-gray-600">Active Customers</div>
        </div>
      </div>

      {/* Conversations */}
      <div className="space-y-4">
        {Object.entries(groupedConversations).map(([customerId, customerConversations]) => (
          <div key={customerId} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getCustomerName(customerId)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getCustomerPhone(customerId)} • {customerConversations.length} messages
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last: {formatTimestamp(customerConversations[0]?.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {customerConversations
                .sort((a, b) => a.timestamp?.toDate?.()?.getTime() - b.timestamp?.toDate?.()?.getTime())
                .map((conv) => (
                <div
                  key={conv.id}
                  className={`flex ${conv.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      conv.direction === 'inbound'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="text-sm">{conv.message}</div>
                    <div className={`text-xs mt-1 ${
                      conv.direction === 'inbound' ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {formatTimestamp(conv.timestamp)} • {getMessageStatus(conv)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedConversations).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No AI conversations found</div>
          <div className="text-gray-400 text-sm mt-2">
            AI conversations will appear here when customers text your business number
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConversationManager;
