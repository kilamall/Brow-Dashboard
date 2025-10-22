import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function DataManagement() {
  const [collectionCounts, setCollectionCounts] = useState<any>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cancelledCount, setCancelledCount] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<any>(null);
  const [runningCleanup, setRunningCleanup] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCancelledCount();
    loadCleanupStats();
  }, []);

  const loadCancelledCount = async () => {
    try {
      const functions = getFunctions();
      const getCount = httpsCallable(functions, 'getCancelledAppointmentsCount');
      const result = await getCount();
      setCancelledCount((result.data as any).count);
    } catch (error) {
      console.error('Failed to load cancelled count:', error);
    }
  };

  const loadCleanupStats = async () => {
    try {
      const functions = getFunctions();
      const getStats = httpsCallable(functions, 'getCleanupStats');
      const result = await getStats();
      setCleanupStats(result.data);
    } catch (error) {
      console.error('Failed to load cleanup stats:', error);
    }
  };

  const loadCollectionCounts = async () => {
    try {
      const functions = getFunctions();
      const getCounts = httpsCallable(functions, 'getCollectionCounts');
      const result = await getCounts();
      setCollectionCounts(result.data);
    } catch (error) {
      console.error('Failed to load collection counts:', error);
    }
  };

  const handleSyncCustomerVisits = async () => {
    setSyncing(true);
    try {
      const functions = getFunctions();
      const syncVisits = httpsCallable(functions, 'syncCustomerVisitCounts');
      await syncVisits();
      alert('✅ Visit counts synced successfully!');
    } catch (error: any) {
      console.error('Sync failed:', error);
      alert(`❌ Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCancelledAppointments = async () => {
    if (!cancelledCount || cancelledCount === 0) {
      alert('No cancelled appointments to clear.');
      return;
    }

    if (!confirm(`Are you sure you want to clear ${cancelledCount} cancelled appointments? This action cannot be undone.`)) {
      return;
    }

    setClearing(true);
    try {
      const functions = getFunctions();
      const clearCancelled = httpsCallable(functions, 'clearCancelledAppointments');
      await clearCancelled();
      alert('✅ Cancelled appointments cleared successfully!');
      await loadCancelledCount();
    } catch (error: any) {
      console.error('Clear cancelled failed:', error);
      alert(`❌ Clear cancelled failed: ${error.message}`);
    } finally {
      setClearing(false);
    }
  };

  const handleRunCleanup = async () => {
    setRunningCleanup(true);
    try {
      const functions = getFunctions();
      const runCleanup = httpsCallable(functions, 'runDatabaseCleanup');
      await runCleanup();
      alert('✅ Database cleanup completed successfully!');
      await loadCleanupStats();
      await loadCancelledCount();
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      alert(`❌ Cleanup failed: ${error.message}`);
    } finally {
      setRunningCleanup(false);
    }
  };

  const handlePurgeData = async (collections: string[]) => {
    setPurgeLoading(true);
    try {
      const functions = getFunctions();
      const purgeData = httpsCallable(functions, 'purgeCollectionData');
      await purgeData({ collections });
      alert('✅ Data purged successfully!');
      setShowPurgeModal(false);
      await loadCollectionCounts();
    } catch (error: any) {
      console.error('Purge failed:', error);
      alert(`❌ Purge failed: ${error.message}`);
    } finally {
      setPurgeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Management Tools */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-lg mb-4">Data Management Tools</h3>
        <p className="text-sm text-slate-600 mb-6">Manage your database and perform maintenance operations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={handleSyncCustomerVisits}
            disabled={syncing}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync Visit Counts'}
          </button>

          <button 
            className="bg-orange-600 text-white rounded-lg px-4 py-3 hover:bg-orange-700 transition-colors flex items-center gap-2"
            onClick={handleClearCancelledAppointments}
            disabled={clearing || cancelledCount === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {clearing ? 'Clearing...' : `Clear Cancelled (${cancelledCount || 0})`}
          </button>

          <button 
            className="bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={handleRunCleanup}
            disabled={runningCleanup}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {runningCleanup ? 'Cleaning...' : 'Auto Cleanup'}
          </button>

          <button 
            className="bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 transition-colors flex items-center gap-2"
            onClick={() => setShowPurgeModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Purge Data
          </button>
        </div>
      </div>

      {/* Database Cleanup Stats */}
      {cleanupStats && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg">Database Cleanup Status</h3>
            <button 
              onClick={loadCleanupStats}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{cleanupStats.cancelled30Days || 0}</div>
              <div className="text-xs text-slate-600">Cancelled (30+ days)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{cleanupStats.expiredHolds || 0}</div>
              <div className="text-xs text-slate-600">Expired Holds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{cleanupStats.expiredTokens || 0}</div>
              <div className="text-xs text-slate-600">Expired Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{cleanupStats.oldMessages || 0}</div>
              <div className="text-xs text-slate-600">Old Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{cleanupStats.oldSkinRequests || 0}</div>
              <div className="text-xs text-slate-600">Old Skin Requests</div>
            </div>
          </div>
          
          <div className="text-xs text-slate-500">
            Auto-cleanup runs daily at 2 AM • Last updated: {cleanupStats.lastUpdated || 'Never'}
          </div>
        </div>
      )}

      {/* Purge Data Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-serif text-lg mb-4">Purge Collection Data</h3>
            <p className="text-sm text-slate-600 mb-6">
              ⚠️ This will permanently delete all data from the selected collections. This action cannot be undone.
            </p>
            
            {collectionCounts && (
              <div className="space-y-3 mb-6">
                {Object.entries(collectionCounts).map(([collection, count]) => (
                  <label key={collection} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      value={collection}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{collection}</div>
                      <div className="text-sm text-slate-600">{count as number} documents</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                  const collections = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value);
                  if (collections.length === 0) {
                    alert('Please select at least one collection to purge.');
                    return;
                  }
                  handlePurgeData(collections);
                }}
                disabled={purgeLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {purgeLoading ? 'Purging...' : 'Purge Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
