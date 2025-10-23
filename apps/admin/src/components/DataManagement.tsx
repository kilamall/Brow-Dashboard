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
      const syncVisits = httpsCallable(functions, 'syncCustomerVisits');
      const result = await syncVisits();
      
      alert(`Success! Synced ${(result.data as any).updatedCount} customer visit counts.\n\nDetails:\n${JSON.stringify(result.data, null, 2)}`);
    } catch (error: any) {
      console.error('Sync failed:', error);
      
      let errorMessage = 'Sync failed: ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to perform this action.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again or contact support.';
      }
      
      alert(errorMessage);
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
      const result = await clearCancelled();
      alert(`✅ Successfully cleared ${(result.data as any)?.deleted || cancelledCount} cancelled appointments!`);
      await loadCancelledCount();
    } catch (error: any) {
      console.error('Clear cancelled failed:', error);
      
      let errorMessage = 'Clear cancelled failed: ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to perform this action.';
      } else if (error.code === 'not-found') {
        errorMessage += 'No cancelled appointments found to clear.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setClearing(false);
    }
  };

  const handleRunCleanup = async () => {
    setRunningCleanup(true);
    try {
      const functions = getFunctions();
      const runCleanup = httpsCallable(functions, 'manualCleanup');
      const result = await runCleanup();
      
      const data = result.data as any;
      const totalCleaned = (data?.cancelledAppointments || 0) + 
                          (data?.expiredHolds || 0) + 
                          (data?.expiredTokens || 0) + 
                          (data?.oldMessages || 0) + 
                          (data?.oldSkinAnalysisRequests || 0) + 
                          (data?.oldEditRequests || 0);
      
      alert(`✅ Database cleanup completed successfully!\n\nCleaned up ${totalCleaned} total items:\n• ${data?.cancelledAppointments || 0} cancelled appointments\n• ${data?.expiredHolds || 0} expired holds\n• ${data?.expiredTokens || 0} expired tokens\n• ${data?.oldMessages || 0} old messages\n• ${data?.oldSkinAnalysisRequests || 0} old skin requests\n• ${data?.oldEditRequests || 0} old edit requests`);
      
      await loadCleanupStats();
      await loadCancelledCount();
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      
      let errorMessage = 'Cleanup failed: ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to perform this action.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again in a few minutes.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setRunningCleanup(false);
    }
  };

  const handlePurgeData = async (collections: string[]) => {
    setPurgeLoading(true);
    try {
      const functions = getFunctions();
      const purgeData = httpsCallable(functions, 'adminPurgeData');
      const result = await purgeData({ collections, confirmPurge: true });
      
      const data = result.data as any;
      const totalDeleted = data?.totalDeleted || 0;
      const results = data?.results || {};
      
      let message = `✅ Data purged successfully!\n\nDeleted ${totalDeleted} total documents from:\n`;
      Object.entries(results).forEach(([collection, data]: [string, any]) => {
        if (data.deleted > 0) {
          message += `• ${collection}: ${data.deleted} documents\n`;
        }
      });
      
      alert(message);
      setShowPurgeModal(false);
      await loadCollectionCounts();
    } catch (error: any) {
      console.error('Purge failed:', error);
      
      let errorMessage = 'Purge failed: ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to perform this action.';
      } else if (error.code === 'invalid-argument') {
        errorMessage += 'Invalid collection selection. Please try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setPurgeLoading(false);
    }
  };

  // Smart recommendations logic
  const getCleanupRecommendations = () => {
    if (!cleanupStats) return [];
    
    const recommendations = [];
    
    if (cleanupStats.expiredHolds > 20) {
      recommendations.push({
        type: 'expiredHolds',
        message: `${cleanupStats.expiredHolds} expired holds taking up space`,
        action: 'Clean Now',
        priority: 'high'
      });
    }
    
    if (cleanupStats.oldEditRequests > 10) {
      recommendations.push({
        type: 'oldEditRequests',
        message: `${cleanupStats.oldEditRequests} old edit requests can be removed`,
        action: 'Clean Now',
        priority: 'medium'
      });
    }
    
    if (cleanupStats.cancelledAppointments > 5) {
      recommendations.push({
        type: 'cancelledAppointments',
        message: `${cleanupStats.cancelledAppointments} cancelled appointments`,
        action: 'Clean Now',
        priority: 'medium'
      });
    }
    
    return recommendations.sort((a, b) => 
      a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
    );
  };

  const handleQuickCleanup = async (type: string) => {
    try {
      const functions = getFunctions();
      const cleanup = httpsCallable(functions, 'manualCleanup');
      await cleanup({ cleanupTypes: [type] });
      alert(`Cleanup completed for ${type}`);
      await loadCleanupStats();
    } catch (error: any) {
      alert(`Cleanup failed: ${error.message}`);
    }
  };

  const getNextCleanupTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Smart Cleanup Center */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Smart Cleanup Center</h3>
            <p className="text-sm text-slate-600">Intelligent database maintenance and optimization</p>
          </div>
          <button onClick={loadCleanupStats} className="text-sm text-blue-600 hover:text-blue-700">
            Refresh Stats
          </button>
        </div>
        
        {/* Smart Recommendations Section */}
        {cleanupStats && getCleanupRecommendations().length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Smart Recommendations
            </h4>
            {getCleanupRecommendations().map(rec => (
              <div key={rec.type} className="flex items-center justify-between py-2">
                <span className="text-sm text-yellow-700">{rec.message}</span>
                <button onClick={() => handleQuickCleanup(rec.type)} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded">
                  {rec.action}
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={handleSyncCustomerVisits}
            disabled={syncing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Sync Visits</span>
            <span className="text-xs opacity-90">Update counts</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={handleClearCancelledAppointments}
            disabled={clearing || cancelledCount === 0}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium">Clear Old Data</span>
            <span className="text-xs opacity-90">{cancelledCount || 0} items</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={handleRunCleanup}
            disabled={runningCleanup}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Auto Cleanup</span>
            <span className="text-xs opacity-90">Run all tasks</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={() => {
              setShowPurgeModal(true);
              loadCollectionCounts();
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium">Purge Data</span>
            <span className="text-xs opacity-90">Advanced</span>
          </button>
        </div>
      </div>

      {/* Live Database Status */}
      {cleanupStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Live Database Status</h3>
            <div className="text-xs text-slate-500">
              Last updated: {cleanupStats.timestamp ? new Date(cleanupStats.timestamp).toLocaleString() : 'Never'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Cancelled Appointments */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.cancelledAppointments > 5 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.cancelledAppointments > 5 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {cleanupStats.cancelledAppointments || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Cancelled (30+ days)</div>
              {cleanupStats.cancelledAppointments > 0 && (
                <button onClick={() => handleQuickCleanup('cancelledAppointments')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
            
            {/* Expired Holds */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.expiredHolds > 20 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.expiredHolds > 20 ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {cleanupStats.expiredHolds || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Expired Holds</div>
              {cleanupStats.expiredHolds > 0 && (
                <button onClick={() => handleQuickCleanup('expiredHolds')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
            
            {/* Expired Tokens */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.expiredTokens > 10 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.expiredTokens > 10 ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {cleanupStats.expiredTokens || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Expired Tokens</div>
              {cleanupStats.expiredTokens > 0 && (
                <button onClick={() => handleQuickCleanup('expiredTokens')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
            
            {/* Old Messages */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.oldMessages > 50 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.oldMessages > 50 ? 'text-purple-600' : 'text-gray-600'
              }`}>
                {cleanupStats.oldMessages || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Old Messages</div>
              {cleanupStats.oldMessages > 0 && (
                <button onClick={() => handleQuickCleanup('oldMessages')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
            
            {/* Old Skin Requests */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.oldSkinAnalysisRequests > 5 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.oldSkinAnalysisRequests > 5 ? 'text-indigo-600' : 'text-gray-600'
              }`}>
                {cleanupStats.oldSkinAnalysisRequests || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Old Skin Requests</div>
              {cleanupStats.oldSkinAnalysisRequests > 0 && (
                <button onClick={() => handleQuickCleanup('oldSkinAnalysisRequests')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
            
            {/* Old Edit Requests */}
            <div className={`p-4 rounded-lg text-center ${
              cleanupStats.oldEditRequests > 10 ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                cleanupStats.oldEditRequests > 10 ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {cleanupStats.oldEditRequests || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Old Edit Requests</div>
              {cleanupStats.oldEditRequests > 0 && (
                <button onClick={() => handleQuickCleanup('oldEditRequests')} 
                        className="text-xs text-blue-600 underline mt-2">
                  Clean
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Auto-cleanup runs daily at 2 AM PST • Next run: {getNextCleanupTime()}
            </p>
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
