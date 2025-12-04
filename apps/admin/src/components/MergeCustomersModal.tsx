import React, { useState } from 'react';
import { mergeCustomersClient } from '@buenobrows/shared/functionsClient';
import type { Customer } from '@buenobrows/shared/types';

interface MergeCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onMergeComplete: () => void;
}

export default function MergeCustomersModal({ 
  isOpen, 
  onClose, 
  customers, 
  onMergeComplete 
}: MergeCustomersModalProps) {
  const [survivorId, setSurvivorId] = useState<string>('');
  const [duplicateId, setDuplicateId] = useState<string>('');
  const [merging, setMerging] = useState(false);

  if (!isOpen) return null;

  const survivor = customers.find(c => c.id === survivorId);
  const duplicate = customers.find(c => c.id === duplicateId);

  const handleMerge = async () => {
    if (!survivorId || !duplicateId) {
      alert('Please select both customers to merge');
      return;
    }

    if (survivorId === duplicateId) {
      alert('Cannot merge customer with itself');
      return;
    }

    if (!confirm(`Are you sure you want to merge "${duplicate?.name}" into "${survivor?.name}"? This action cannot be undone.`)) {
      return;
    }

    setMerging(true);
    try {
      // Check if duplicate has orphaned migratedTo before attempting merge
      if (duplicate?.migratedTo && duplicate.migratedTo !== survivorId) {
        const migratedToCustomer = customers.find(c => c.id === duplicate.migratedTo);
        if (!migratedToCustomer) {
          console.warn(`⚠️ Duplicate customer ${duplicate.name} has orphaned migratedTo field pointing to non-existent customer ${duplicate.migratedTo}. The merge will fix this.`);
        }
      }

      const result = await mergeCustomersClient(survivorId, duplicateId);
      const data = result.data as any;
      
      alert(`✅ Merge completed successfully!\n\nMoved ${data.subcollectionDocsMoved} subcollection documents\nUpdated ${data.appointmentsUpdated} appointments\nUpdated ${data.holdsUpdated} holds\nUpdated ${data.availabilityUpdated} availability records\nUpdated ${data.skinAnalysesUpdated} skin analyses\nUpdated ${data.consentFormsUpdated} consent forms\nUpdated ${data.uniqueContactsUpdated} unique contacts`);
      
      onMergeComplete();
      onClose();
    } catch (error: any) {
      console.error('Merge failed:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (error.code === 'not-found') {
        if (errorMessage.includes('Survivor customer')) {
          errorMessage = `The customer you selected to keep (survivor) no longer exists. Please refresh the customer list and try again.`;
        } else if (errorMessage.includes('Duplicate customer')) {
          errorMessage = `The customer you selected to merge (duplicate) no longer exists. Please refresh the customer list and try again.`;
        }
      } else if (error.code === 'failed-precondition') {
        errorMessage = `${errorMessage}\n\nThis customer may have an orphaned migration. Try running "Clean Orphaned Migrations" in Settings > Data Management first.`;
      }
      
      alert(`❌ Merge failed: ${errorMessage}`);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-slate-800">Merge Customers</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              Select which customer to keep (survivor) and which to merge into it (duplicate). 
              All data from the duplicate will be moved to the survivor, and the duplicate will be marked as merged.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-800">Warning</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    This action cannot be undone. All appointments, notes, files, and other data from the duplicate customer will be moved to the survivor customer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Survivor Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Keep This Customer (Survivor)
              </label>
              <select
                value={survivorId}
                onChange={(e) => setSurvivorId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select customer to keep...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email || customer.phone || 'No contact'})
                  </option>
                ))}
              </select>
              
              {survivor && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">Survivor Customer</h4>
                  <div className="text-sm text-green-700 mt-1">
                    <p><strong>Name:</strong> {survivor.name}</p>
                    <p><strong>Email:</strong> {survivor.email || 'None'}</p>
                    <p><strong>Phone:</strong> {survivor.phone || 'None'}</p>
                    <p><strong>Status:</strong> {survivor.status}</p>
                    <p><strong>Total Visits:</strong> {survivor.totalVisits || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merge Into Survivor (Duplicate)
              </label>
              <select
                value={duplicateId}
                onChange={(e) => setDuplicateId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select customer to merge...</option>
                {customers.filter(c => c.id !== survivorId).map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email || customer.phone || 'No contact'})
                  </option>
                ))}
              </select>
              
              {duplicate && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800">Duplicate Customer</h4>
                  <div className="text-sm text-red-700 mt-1">
                    <p><strong>Name:</strong> {duplicate.name}</p>
                    <p><strong>Email:</strong> {duplicate.email || 'None'}</p>
                    <p><strong>Phone:</strong> {duplicate.phone || 'None'}</p>
                    <p><strong>Status:</strong> {duplicate.status}</p>
                    <p><strong>Total Visits:</strong> {duplicate.totalVisits || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Merge Preview */}
          {survivor && duplicate && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Merge Preview</h4>
              <p className="text-sm text-slate-600">
                <strong>{duplicate.name}</strong> will be merged into <strong>{survivor.name}</strong>.
                All appointments, notes, files, and other data will be moved to {survivor.name}'s account.
                {duplicate.name} will be marked as "merged" and hidden from the customer list.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={!survivorId || !duplicateId || merging}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
            >
              {merging ? 'Merging...' : 'Merge Customers'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
