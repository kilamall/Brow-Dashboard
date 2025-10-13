import React from 'react';
import SMSInterface from '../components/SMSInterface';

export default function SMS() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SMS Customer Support</h1>
        <p className="text-gray-600 mt-1">
          Manage customer text messages and send SMS responses
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">SMS Features:</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Customers can text your business number for availability</li>
            <li>• Automated responses to common questions</li>
            <li>• Manual SMS responses from admin interface</li>
            <li>• Conversation history and tracking</li>
            <li>• Integration with appointment booking system</li>
          </ul>
        </div>
      </div>
      
      <div className="h-[calc(100vh-300px)]">
        <SMSInterface />
      </div>
    </div>
  );
}
