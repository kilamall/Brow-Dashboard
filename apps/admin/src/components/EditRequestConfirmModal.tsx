import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { Appointment, AppointmentEditRequest, Service } from '@buenobrows/shared/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: Appointment;
  editRequest: AppointmentEditRequest;
  services: Record<string, Service>;
  loading?: boolean;
}

export default function EditRequestConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  editRequest,
  services,
  loading = false
}: Props) {
  // Determine what fields are actually changing
  const changes = useMemo(() => {
    const hasTimeChange = editRequest.requestedChanges.start && 
      editRequest.requestedChanges.start !== appointment.start;

    const hasServiceChange = editRequest.requestedChanges.serviceIds && 
      JSON.stringify(editRequest.requestedChanges.serviceIds.sort()) !== JSON.stringify([appointment.serviceId].sort());

    const hasNotesChange = editRequest.requestedChanges.notes !== undefined &&
      editRequest.requestedChanges.notes !== appointment.notes;

    return {
      hasTimeChange,
      hasServiceChange,
      hasNotesChange,
      hasAnyChange: hasTimeChange || hasServiceChange || hasNotesChange
    };
  }, [editRequest, appointment]);

  if (!isOpen) return null;

  const originalService = services[appointment.serviceId];
  const newServices = editRequest.requestedChanges.serviceIds?.map(id => services[id]).filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-serif font-semibold text-slate-800">
            Approve Edit Request?
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Customer Name */}
          <div className="text-lg font-medium text-slate-800">
            Customer: {appointment.customerName || 'Unknown'}
          </div>

          {/* Changes Section */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">
              Changes to be applied:
            </div>

            {/* Date & Time Change */}
            {changes.hasTimeChange && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="text-lg">📅</span>
                  Date & Time
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <div className="text-slate-600">
                    <span className="font-medium">From:</span> {format(parseISO(appointment.start), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="text-green-700 font-medium">
                    <span className="font-medium">To:</span> {format(parseISO(editRequest.requestedChanges.start!), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}

            {/* Service Change */}
            {changes.hasServiceChange && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="text-lg">💅</span>
                  Service
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <div className="text-slate-600">
                    <span className="font-medium">From:</span> {originalService?.name || 'Unknown'} 
                    {originalService?.price && <span className="text-slate-500"> (${originalService.price})</span>}
                  </div>
                  <div className="text-green-700 font-medium">
                    <span className="font-medium">To:</span> {newServices.map(s => s.name).join(' + ') || 'Unknown'}
                    {newServices.length > 0 && (
                      <span className="text-green-600">
                        {' '}(${newServices.reduce((sum, s) => sum + (s.price || 0), 0)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Change */}
            {changes.hasNotesChange && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="text-lg">📝</span>
                  Reason for Change
                </div>
                <div className="ml-7 text-sm text-slate-600">
                  {editRequest.reason || editRequest.requestedChanges.notes || 'No reason provided'}
                </div>
              </div>
            )}

            {/* No changes warning */}
            {!changes.hasAnyChange && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⚠️ No significant changes detected in this edit request.
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            ⚠️ The original appointment will be updated with these changes.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Approving...' : 'Approve Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}


