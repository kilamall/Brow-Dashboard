import React from 'react';
import MessagingInterface from '../components/MessagingInterface';

export default function Messages() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
        <p className="text-gray-600 mt-1">
          Communicate with your customers and provide support
        </p>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <MessagingInterface />
      </div>
    </div>
  );
}
