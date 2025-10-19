import React, { useState, useEffect, useRef } from 'react';
import { MessagingService, type Message } from '@buenobrows/shared/messaging';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { formatMessageTime } from '@buenobrows/shared/messaging';

interface CustomerMessagingProps {
  customerId: string;
  customerName: string;
  customerEmail: string;
  appointmentId?: string;
  className?: string;
}

export default function CustomerMessaging({ 
  customerId, 
  customerName, 
  customerEmail, 
  appointmentId,
  className = '' 
}: CustomerMessagingProps) {
  const { db, app } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingService, setMessagingService] = useState<MessagingService | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = new MessagingService(db, app);
    setMessagingService(service);

    // Request notification permission
    service.requestNotificationPermission().then((token) => {
      if (token) {
        service.saveCustomerToken(customerId, token);
      }
    });

    // Subscribe to messages
    const unsubscribeMessages = service.subscribeToMessages(
      customerId,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      }
    );

    // Listen for foreground messages
    const unsubscribeForeground = service.onMessage((payload) => {
      console.log('Message received:', payload);
      // You can show a toast notification here
    });

    return () => {
      unsubscribeMessages();
      unsubscribeForeground();
    };
  }, [customerId, db, app]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !messagingService) return;

    try {
      const messageData: any = {
        customerId,
        customerName,
        customerEmail,
        content: newMessage.trim(),
        type: 'customer',
        priority: 'medium',
        read: false,
      };

      // Only include appointmentId if it exists
      if (appointmentId) {
        messageData.appointmentId = appointmentId;
      }

      await messagingService.sendMessage(messageData);

      // Update conversation
      const conversationData: any = {
        customerId,
        customerName,
        customerEmail,
        content: newMessage.trim(),
        type: 'customer',
      };

      if (appointmentId) {
        conversationData.appointmentId = appointmentId;
      }

      await messagingService.updateConversation(customerId, conversationData);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div 
        className="p-4 bg-blue-600 text-white rounded-t-lg cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Message Support</h3>
            <p className="text-sm text-blue-100">We're here to help!</p>
          </div>
          <div className="flex items-center space-x-2">
            {messages.some(m => m.type === 'admin' && !m.read) && (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
            <svg 
              className={`w-5 h-5 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.type === 'customer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'customer' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                id="customer-message-input"
                name="customer-message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Ask about appointments, services, or any questions you have!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
