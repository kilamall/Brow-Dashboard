import { useState } from 'react';
import type { Appointment, Service } from '@buenobrows/shared/types';

interface NoShowConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  service: Service | null;
  onConfirm: () => void;
  loading?: boolean;
}

export default function NoShowConfirmationModal({
  open,
  onClose,
  appointment,
  service,
  onConfirm,
  loading = false
}: NoShowConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const handleConfirm = () => {
    if (confirmationText !== 'NO-SHOW') {
      alert('❌ Confirmation text did not match. Please type "NO-SHOW" exactly.');
      return;
    }
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = () => {
    onConfirm();
    setConfirmationText('');
    setShowFinalConfirm(false);
  };

  const handleClose = () => {
    setConfirmationText('');
    setShowFinalConfirm(false);
    onClose();
  };

  if (!open || !appointment || !service) return null;

  const appointmentDate = new Date(appointment.start);
  const customerName = appointment.customerName || 'Customer';
  const serviceName = service.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              ⚠️ Mark as No-Show
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {!showFinalConfirm ? (
            <>
              {/* Appointment Details */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-800 mb-2">Appointment Details</h3>
                <div className="space-y-1 text-sm text-red-700">
                  <div><strong>Customer:</strong> {customerName}</div>
                  <div><strong>Service:</strong> {serviceName}</div>
                  <div><strong>Date:</strong> {appointmentDate.toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {appointmentDate.toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-yellow-600 mr-2 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> This action will mark the customer as a no-show, 
                    send them an email notification, and update their no-show count. 
                    This cannot be easily undone.
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "NO-SHOW" to confirm this action:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type NO-SHOW here"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || confirmationText !== 'NO-SHOW'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Final Confirmation */}
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-start">
                  <div className="text-red-600 mr-2 text-lg">🚨</div>
                  <div className="text-sm text-red-800">
                    <strong>FINAL CONFIRMATION</strong><br />
                    You are about to mark <strong>{customerName}</strong> as NO-SHOW for their 
                    <strong> {serviceName}</strong> appointment on{' '}
                    <strong>{appointmentDate.toLocaleDateString()}</strong>.
                  </div>
                </div>
              </div>

              {/* Consequences */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">This action will:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Mark the appointment as no-show</li>
                  <li>• Send a no-show email to {customerName}</li>
                  <li>• Update their no-show count in the system</li>
                  <li>• Log this action for tracking purposes</li>
                </ul>
              </div>

              {/* Final Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFinalConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  onClick={handleFinalConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm No-Show'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
