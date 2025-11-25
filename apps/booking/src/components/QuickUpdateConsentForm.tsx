import { useState } from 'react';

interface QuickUpdateConsentFormProps {
  customerName: string;
  onAgree: (initials: string) => void;
  onDecline?: () => void;
  isOpen: boolean;
}

export default function QuickUpdateConsentForm({
  customerName,
  onAgree,
  onDecline,
  isOpen,
}: QuickUpdateConsentFormProps) {
  const [initials, setInitials] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Reset state when form is opened
  if (isOpen && !initials && !confirmed) {
    // This will be handled by useEffect in parent if needed
  }

  if (!isOpen) return null;

  const canSubmit = confirmed && initials.trim().length >= 2;

  const handleSubmit = () => {
    if (canSubmit) {
      onAgree(initials.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-2 sm:my-8 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif text-terracotta mb-1">
                Medical History Update
              </h2>
              <p className="text-sm text-slate-600">
                Quick confirmation for returning customers
              </p>
            </div>
            {onDecline && (
              <button
                onClick={onDecline}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <p className="text-slate-700 leading-relaxed text-lg mb-4">
              <strong>I confirm there have been no changes to my medical history, medications, allergies, or conditions since my last visit.</strong>
            </p>
            
            <div className="flex items-start gap-3 mt-4">
              <input
                id="confirm-no-changes"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
              />
              <label htmlFor="confirm-no-changes" className="cursor-pointer text-slate-700">
                I confirm the above statement
              </label>
            </div>
          </div>

          {/* Initials Input */}
          <div className="space-y-2">
            <label htmlFor="initials" className="block text-sm font-medium text-slate-700">
              Your Initials <span className="text-terracotta">*</span>
            </label>
            <input
              id="initials"
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              placeholder="Enter your initials"
              maxLength={10}
              className="w-full rounded-lg border-2 border-slate-300 p-3 font-serif text-lg uppercase focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              disabled={!confirmed}
            />
            <p className="text-xs text-slate-500">
              Please enter at least 2 characters (e.g., "JD" for John Doe)
            </p>
          </div>

          {/* Date Display */}
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50 flex-shrink-0 space-y-3">
          {/* Agreement Statement */}
          {canSubmit && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="text-green-800">
                <strong>{customerName}</strong> ({initials.trim()}) confirms no changes to medical history as of {new Date().toLocaleDateString()}.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            {onDecline && (
              <button
                onClick={onDecline}
                className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-8 py-3 rounded-lg bg-terracotta text-white font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-1 sm:order-2"
            >
              Confirm & Continue
            </button>
          </div>

          {/* Validation Messages */}
          {!confirmed && (
            <p className="text-xs text-center text-amber-600">
              ⚠ Please confirm that there have been no changes to your medical history
            </p>
          )}
          {confirmed && initials.trim().length < 2 && (
            <p className="text-xs text-center text-amber-600">
              ⚠ Please enter your initials (at least 2 characters)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

