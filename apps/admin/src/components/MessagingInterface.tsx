import React, { useState, useEffect } from 'react';
import { MessagingService, type Message, type Conversation } from '@buenobrows/shared/messaging';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { formatMessageTime } from '@buenobrows/shared/messaging';

interface MessagingInterfaceProps {
  className?: string;
}

export default function MessagingInterface({ className = '' }: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingService, setMessagingService] = useState<MessagingService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { db, app } = useFirebase();
    const service = new MessagingService(db, app);
    setMessagingService(service);

    // Subscribe to conversations
    const unsubscribeConversations = service.subscribeToConversations((convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => {
      unsubscribeConversations();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation || !messagingService) return;

    // Subscribe to messages for selected conversation
    const unsubscribeMessages = messagingService.subscribeToMessages(
      selectedConversation,
      (msgs) => {
        setMessages(msgs);
        // Mark messages as read
        messagingService.markMessagesAsRead(selectedConversation, 'admin');
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [selectedConversation, messagingService]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !messagingService) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    try {
      await messagingService.sendMessage({
        customerId: selectedConversation,
        customerName: conversation.customerName,
        customerEmail: conversation.customerEmail,
        adminId: 'admin',
        adminName: 'Admin',
        content: newMessage.trim(),
        type: 'admin',
        priority: 'medium'
      });

      // Update conversation
      await messagingService.updateConversation(selectedConversation, {
        content: newMessage.trim(),
        type: 'admin'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
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
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.customerName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.customerEmail}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {conversation.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 mt-1">
                      {conversation.lastMessageTime && formatMessageTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200">
              {(() => {
                const conversation = conversations.find(c => c.id === selectedConversation);
                return conversation ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {conversation.customerName}
                    </h3>
                    <p className="text-sm text-gray-500">{conversation.customerEmail}</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
