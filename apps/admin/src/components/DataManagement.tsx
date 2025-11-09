import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export default function DataManagement() {
  const { db } = useFirebase();
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number> | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cancelledCount, setCancelledCount] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<any>(null);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [homepageContent, setHomepageContent] = useState<any>(null);
  const [undoBackup, setUndoBackup] = useState<any>(null);
  const [undoTimestamp, setUndoTimestamp] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadCancelledCount();
    loadCleanupStats();
  }, []);

  // Update countdown timer and clear expired backups
  useEffect(() => {
    if (!undoBackup || !undoTimestamp) return;

    const interval = setInterval(() => {
      if (!isBackupValid()) {
        clearBackup();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [undoBackup, undoTimestamp]);

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
      const data = result.data as any;
      // Extract the counts object from the response
      setCollectionCounts(data?.counts || {});
      setSelectedCollections(new Set()); // Reset selections when loading
    } catch (error) {
      console.error('Failed to load collection counts:', error);
      setCollectionCounts({});
    }
  };

  const handleCollectionToggle = (collection: string) => {
    setSelectedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collection)) {
        newSet.delete(collection);
      } else {
        newSet.add(collection);
      }
      return newSet;
    });
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
      setSelectedCollections(new Set()); // Clear selections after successful purge
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

  // Backup Management Functions
  const createBackup = (content: any) => {
    const backup = {
      ...content,
      backedUpAt: new Date().toISOString()
    };
    setUndoBackup(backup);
    setUndoTimestamp(new Date());
    console.log('📦 Created backup for undo:', backup);
  };

  const isBackupValid = () => {
    if (!undoTimestamp) return false;
    const now = new Date();
    const backupAge = now.getTime() - undoTimestamp.getTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    return backupAge < fiveMinutes;
  };

  const clearBackup = () => {
    setUndoBackup(null);
    setUndoTimestamp(null);
  };

  const undoLastClear = async () => {
    if (!undoBackup || !isBackupValid()) {
      alert('❌ No valid backup available to undo.\n\nBackups expire after 5 minutes.');
      return;
    }

    try {
      // Restore the backup content
      await setDoc(doc(db, 'settings', 'homePageContent'), undoBackup, { merge: true });
      
      // Update local state
      setHomepageContent(undoBackup);
      
      // Clear the backup since it's been used
      clearBackup();
      
      alert('✅ Content restored successfully!\n\nYour previous homepage content has been restored.');
      console.log('🔄 Restored content from backup:', undoBackup);
    } catch (error) {
      console.error('Error undoing clear:', error);
      alert('Error restoring content: ' + error);
    }
  };

  // Homepage Content Management Functions
  const loadHomepageContent = async () => {
    try {
      const docRef = doc(db, 'settings', 'homePageContent');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomepageContent(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading homepage content:', error);
      return null;
    }
  };

  const checkHomepageContent = async () => {
    try {
      const data = await loadHomepageContent();
      
      if (data) {
        console.log('📄 Current homepage content:', JSON.stringify(data, null, 2));
        alert('✅ Homepage content loaded!\n\nCheck the console for full data structure.');
      } else {
        alert('❌ No homepage content found.');
      }
    } catch (error) {
      console.error('Error checking homepage content:', error);
      alert('Error checking homepage content: ' + error);
    }
  };

  const clearHomepageContent = async () => {
    if (!confirm('Are you sure you want to clear all homepage content? This will remove all photo assignments.')) return;
    
    try {
      console.log('🧹 Clearing homepage content...');
      
      // First, get the current document to see what's in it
      const docRef = doc(db, 'settings', 'homePageContent');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Current data before clearing:', data);
        
        // Create backup before clearing
        createBackup(data);
        
        // Clear only the photo-related fields, keep other content
        const clearedData = {
          ...data,
          galleryPhotos: [],
          heroImageUrl: null,
          hero2ImageUrl: null,
          skinAnalysisImageUrl: null
        };
        
        await setDoc(doc(db, 'settings', 'homePageContent'), clearedData, { merge: true });
        console.log('✅ Cleared photo assignments from homepage content');
        alert('✅ Homepage content cleared!\n\nAll photo assignments have been removed.\n\n💡 You can undo this action within 5 minutes using the Undo button.');
      } else {
        alert('No homepage content found to clear.');
      }
      
      await loadHomepageContent();
    } catch (error) {
      console.error('Error clearing homepage content:', error);
      alert('Error clearing homepage content: ' + error);
    }
  };

  const clearAllHomepageData = async () => {
    if (!confirm('⚠️ This will DELETE ALL homepage data and start completely fresh. Are you sure?')) return;
    
    try {
      console.log('🧹 Clearing ALL homepage data...');
      
      // Create backup before clearing everything
      if (homepageContent) {
        createBackup(homepageContent);
      }
      
      // Delete the entire document
      await deleteDoc(doc(db, 'settings', 'homePageContent'));
      console.log('✅ Deleted settings/homePageContent document');
      
      // Also delete the old collection if it exists
      try {
        const oldCollectionRef = collection(db, 'homePageContent');
        const oldDocs = await getDocs(oldCollectionRef);
        
        if (!oldDocs.empty) {
          console.log('Found old homePageContent collection, clearing...');
          // Note: We can't delete the collection directly, but we can clear its documents
          // This is just for logging purposes
        }
      } catch (error) {
        console.log('No old collection found or error accessing it:', error);
      }
      
      alert('✅ ALL homepage data cleared!\n\nThe system will start fresh with default content.\n\n💡 You can undo this action within 5 minutes using the Undo button.');
      setHomepageContent(null);
    } catch (error) {
      console.error('Error clearing all homepage data:', error);
      alert('Error clearing all homepage data: ' + error);
    }
  };

  const refreshHomepageContent = async () => {
    try {
      // Load photos from photos collection
      const photosQuery = collection(db, 'photos');
      const photosSnapshot = await getDocs(photosQuery);
      
      const photos = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const aboutPhotos = photos.filter((p: any) => p.homepageElements?.aboutSlideshow);
      const galleryPhotos = photos.filter((p: any) => p.homepageElements?.gallery);
      const heroPhotos = photos.filter((p: any) => p.homepageElements?.heroImage);
      
      const dataToSave: any = {
        galleryPhotos: galleryPhotos.map((p: any) => p.url)
      };
      
      // Only include hero images if they exist
      if (heroPhotos.length > 0) {
        dataToSave.heroImageUrl = heroPhotos[0].url;
      }
      
      // Save to Firestore (only include fields that have values)
      await setDoc(doc(db, 'settings', 'homePageContent'), dataToSave, { merge: true });
      
      console.log('✅ Refreshed homepage content with current photo assignments');
      alert('✅ Homepage content refreshed!\n\nUpdated with current photo assignments from the photos collection.');
      
      await loadHomepageContent();
    } catch (error) {
      console.error('Error refreshing homepage content:', error);
      alert('Error refreshing homepage content: ' + error);
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
      {/* Warning Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-red-800 font-semibold mb-1">⚠️ Data Management Warning</h4>
            <p className="text-sm text-red-700">Actions in this section can permanently delete data. Always review what you're deleting before confirming. Some actions cannot be undone.</p>
          </div>
        </div>
      </div>

      {/* Safe Operations Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Safe Operations
            </h3>
            <p className="text-sm text-green-700 mt-1">These actions are safe and won't delete any data</p>
          </div>
          <button onClick={loadCleanupStats} className="text-sm text-green-700 hover:text-green-800 font-medium px-3 py-1 bg-white rounded-lg hover:bg-green-100 transition-colors">
            🔄 Refresh Stats
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            onClick={handleSyncCustomerVisits}
            disabled={syncing}
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-slate-800">Sync Customer Visits</div>
              <div className="text-xs text-slate-600">Update visit counts from appointments</div>
            </div>
            {syncing && <div className="text-green-600">⏳</div>}
          </button>
          
          <button 
            className="bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            onClick={loadCleanupStats}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-slate-800">View Database Stats</div>
              <div className="text-xs text-slate-600">Check current database status</div>
            </div>
          </button>
        </div>
      </div>

      {/* Smart Cleanup Center */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Automated Cleanup
            </h3>
            <p className="text-sm text-blue-700 mt-1">Safe cleanup of old expired data (30+ days old)</p>
          </div>
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
        
        {/* Cleanup Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="bg-white hover:bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            onClick={handleClearCancelledAppointments}
            disabled={clearing || cancelledCount === 0}
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-slate-800">Clear Cancelled Appointments</div>
              <div className="text-xs text-slate-600">{cancelledCount || 0} items older than 30 days</div>
            </div>
            {clearing && <div className="text-orange-600">⏳</div>}
          </button>
          
          <button 
            className="bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            onClick={handleRunCleanup}
            disabled={runningCleanup}
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-slate-800">Run Auto Cleanup</div>
              <div className="text-xs text-slate-600">Clean all old expired data</div>
            </div>
            {runningCleanup && <div className="text-green-600">⏳</div>}
          </button>
        </div>
      </div>

      {/* Dangerous Operations Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Dangerous Operations
            </h3>
            <p className="text-sm text-red-700 mt-1">⚠️ These actions permanently delete data. Use with extreme caution!</p>
          </div>
        </div>
        
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 font-medium">⚠️ Warning: The operations below will permanently delete data from your database. This cannot be undone. Only use these if you're absolutely sure.</p>
        </div>

        <button 
          className="w-full bg-white hover:bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          onClick={() => {
            setShowPurgeModal(true);
            loadCollectionCounts();
            setSelectedCollections(new Set()); // Reset selections when opening modal
          }}
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="text-left flex-1">
            <div className="font-medium text-slate-800">Purge Collection Data</div>
            <div className="text-xs text-slate-600">Permanently delete entire collections (IRREVERSIBLE)</div>
          </div>
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Homepage Content Management */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-purple-800">Homepage Content Management</h3>
            <p className="text-sm text-purple-600">Manage homepage photo assignments and content data</p>
          </div>
          <button onClick={loadHomepageContent} className="text-sm text-purple-600 hover:text-purple-700">
            Refresh Content
          </button>
        </div>
        
        {/* Homepage Content Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button 
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={checkHomepageContent}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-sm">Check Content</span>
            <span className="text-xs opacity-90">Inspect data</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={clearHomepageContent}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium text-sm">Clear Photos</span>
            <span className="text-xs opacity-90">Remove assignments</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={refreshHomepageContent}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium text-sm">Refresh</span>
            <span className="text-xs opacity-90">Sync photos</span>
          </button>
          
          <button 
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg"
            onClick={clearAllHomepageData}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium text-sm">Clear ALL</span>
            <span className="text-xs opacity-90">Reset everything</span>
          </button>
          
          <button 
            className={`rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-md hover:shadow-lg ${
              undoBackup && isBackupValid() 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={undoLastClear}
            disabled={!undoBackup || !isBackupValid()}
            title={undoBackup && isBackupValid() 
              ? `Undo last clear (expires in ${Math.max(0, Math.ceil((5 * 60 * 1000 - (new Date().getTime() - (undoTimestamp?.getTime() || 0))) / 1000))}s)`
              : 'No undo available'
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="font-medium text-sm">Undo</span>
            <span className="text-xs opacity-90">
              {undoBackup && isBackupValid() 
                ? `${Math.max(0, Math.ceil((5 * 60 * 1000 - (new Date().getTime() - (undoTimestamp?.getTime() || 0))) / 1000))}s left`
                : 'Not available'
              }
            </span>
          </button>
        </div>
        
        {/* Homepage Content Status */}
        {homepageContent && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Current Homepage Content Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-600">Gallery Photos:</span>
                <span className="ml-2 font-medium">{homepageContent.galleryPhotos?.length || 0}</span>
              </div>
              <div>
                <span className="text-purple-600">Hero Image:</span>
                <span className="ml-2 font-medium">{homepageContent.heroImageUrl ? '✅' : '❌'}</span>
              </div>
              <div>
                <span className="text-purple-600">Hero 2 Image:</span>
                <span className="ml-2 font-medium">{homepageContent.hero2ImageUrl ? '✅' : '❌'}</span>
              </div>
              <div>
                <span className="text-purple-600">Skin Analysis Image:</span>
                <span className="ml-2 font-medium">{homepageContent.skinAnalysisImageUrl ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border-4 border-red-300">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <h3 className="font-bold text-red-800 text-xl mb-2 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                ⚠️ DANGER: Purge Collection Data
              </h3>
              <p className="text-sm text-red-700 font-medium mb-2">
                This will PERMANENTLY DELETE all data from the selected collections.
              </p>
              <p className="text-sm text-red-600">
                ⚠️ This action CANNOT be undone. All data will be lost forever. Make sure you have backups if needed.
              </p>
            </div>
            
            {collectionCounts && Object.keys(collectionCounts).length > 0 ? (
              <div className="space-y-3 mb-6">
                <p className="text-sm text-slate-600 mb-3">Select collections to purge (check the boxes):</p>
                {Object.entries(collectionCounts).map(([collection, count]) => {
                  const countValue = typeof count === 'number' ? count : 0;
                  const isSelected = selectedCollections.has(collection);
                  return (
                    <label 
                      key={collection} 
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'border-red-400 bg-red-50' : 'border-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleCollectionToggle(collection)}
                        className="rounded w-5 h-5 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{collection}</div>
                        <div className="text-sm text-slate-600">
                          {countValue.toLocaleString()} {countValue === 1 ? 'document' : 'documents'}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  );
                })}
                {selectedCollections.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedCollections.size}</strong> collection{selectedCollections.size !== 1 ? 's' : ''} selected for purging
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">Loading collection counts...</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowPurgeModal(false);
                  setSelectedCollections(new Set()); // Clear selections when closing
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (selectedCollections.size === 0) {
                    alert('⚠️ Please select at least one collection to purge by checking the boxes above.');
                    return;
                  }
                  const collections = Array.from(selectedCollections);
                  // Double confirmation
                  const confirmMessage = `⚠️ FINAL CONFIRMATION\n\nYou are about to PERMANENTLY DELETE all data from:\n${collections.join('\n')}\n\nThis CANNOT be undone!\n\nType "DELETE" to confirm:`;
                  const userInput = prompt(confirmMessage);
                  if (userInput === 'DELETE') {
                    handlePurgeData(collections);
                    setSelectedCollections(new Set()); // Clear selections after purge
                  } else {
                    alert('Purge cancelled. Data was not deleted.');
                  }
                }}
                disabled={purgeLoading || selectedCollections.size === 0}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
              >
                {purgeLoading ? '⏳ Purging...' : `⚠️ Purge ${selectedCollections.size} Selected Collection${selectedCollections.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
