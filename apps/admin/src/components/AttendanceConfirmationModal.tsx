import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Appointment, Service } from '@buenobrows/shared/types';

interface AttendanceConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  service: Service | null;
  onConfirmed: () => void;
}

export default function AttendanceConfirmationModal({
  open,
  onClose,
  appointment,
  service,
  onConfirmed
}: AttendanceConfirmationModalProps) {
  const { app } = useFirebase();
  const functions = getFunctions(app, 'us-central1');
  
  const [loading, setLoading] = useState(false);
  const [actualPrice, setActualPrice] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [appointmentIdForEmail, setAppointmentIdForEmail] = useState<string | null>(null);

  // Initialize values when appointment changes
  useEffect(() => {
    if (appointment && service) {
      setActualPrice((appointment.bookedPrice ?? service.price ?? 0).toString());
      setTipAmount((appointment.tip ?? 0).toString());
      setNotes(appointment.notes || '');
    }
  }, [appointment, service]);

  const handleConfirm = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      const markAttendanceFn = httpsCallable(functions, 'markAttendance');
      const result = await markAttendanceFn({ 
        appointmentId: appointment.id, 
        attendance: 'attended',
        actualPrice: parseFloat(actualPrice) || 0,
        tipAmount: parseFloat(tipAmount) || 0,
        notes: notes.trim() || undefined
      }) as any;
      
      const data = result.data;
      
      // Check if email is required
      if (data?.emailRequired) {
        setAppointmentIdForEmail(appointment.id);
        setShowEmailPrompt(true);
        setLoading(false);
        return;
      }
      
      onConfirmed();
      onClose();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(`Failed to mark attendance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceiptEmail = async () => {
    if (!appointmentIdForEmail || !receiptEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiptEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      const sendReceiptEmailFn = httpsCallable(functions, 'sendReceiptEmail');
      await sendReceiptEmailFn({
        appointmentId: appointmentIdForEmail,
        email: receiptEmail.trim()
      });
      
      alert('✅ Receipt email sent successfully!');
      setShowEmailPrompt(false);
      setReceiptEmail('');
      setAppointmentIdForEmail(null);
      onConfirmed();
      onClose();
    } catch (error: any) {
      console.error('Error sending receipt email:', error);
      alert(`Failed to send receipt email: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSkipEmail = () => {
    setShowEmailPrompt(false);
    setReceiptEmail('');
    setAppointmentIdForEmail(null);
    onConfirmed();
    onClose();
  };

  const expectedPrice = service?.price || 0;
  const actualPriceNum = parseFloat(actualPrice) || 0;
  const tipNum = parseFloat(tipAmount) || 0;
  const totalAmount = actualPriceNum + tipNum;
  const priceDifference = actualPriceNum - expectedPrice;

  if (!open || !appointment || !service) return null;

  // Email prompt modal
  if (showEmailPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Send Receipt Email
              </h2>
              <button
                onClick={handleSkipEmail}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={sendingEmail}
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Receipt Generated!</strong> The receipt has been created, but the customer doesn't have an email on file. 
                Please enter an email address to send the receipt.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email Address
              </label>
              <input
                type="email"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                placeholder="customer@example.com"
                disabled={sendingEmail}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSkipEmail}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={sendingEmail}
              >
                Skip
              </button>
              <button
                onClick={handleSendReceiptEmail}
                disabled={sendingEmail || !receiptEmail.trim()}
                className="flex-1 px-4 py-2 bg-terracotta text-white rounded-md hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? 'Sending...' : 'Send Receipt'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm Attendance & Payment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Appointment Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Appointment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Service:</strong> {service.name}</div>
              <div><strong>Customer:</strong> {appointment.customerName}</div>
              <div><strong>Date:</strong> {new Date(appointment.start).toLocaleDateString()}</div>
              <div><strong>Time:</strong> {new Date(appointment.start).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Price Verification */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Payment Verification</h3>
            
            {/* Expected vs Actual Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Price: ${expectedPrice.toFixed(2)}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="Actual amount charged"
                  disabled={loading}
                />
                <span className="text-sm text-gray-500">USD</span>
              </div>
              
              {/* Price difference indicator */}
              {priceDifference !== 0 && (
                <div className={`mt-1 text-sm ${
                  priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceDifference > 0 ? '+' : ''}${priceDifference.toFixed(2)} vs expected
                </div>
              )}
            </div>

            {/* Tip Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Amount
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="Tip amount (optional)"
                  disabled={loading}
                />
                <span className="text-sm text-gray-500">USD</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
              rows={3}
              placeholder="Any additional notes about the appointment..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !actualPrice}
              className="flex-1 px-4 py-2 bg-terracotta text-white rounded-md hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Confirming...' : 'Confirm Attendance'}
            </button>
          </div>

          {/* Financial Tracking Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">💡</div>
              <div className="text-sm text-yellow-800">
                <strong>Financial Tracking:</strong> This information will be used to track actual revenue vs. expected amounts and help ensure accurate financial metrics.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
