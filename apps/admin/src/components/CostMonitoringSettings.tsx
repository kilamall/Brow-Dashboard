import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { CostMonitoringSettings } from '@buenobrows/shared/types';

export default function CostMonitoringSettings() {
  const { db, app } = useFirebase();
  const [settings, setSettings] = useState<CostMonitoringSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'settings', 'costMonitoring'));
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as CostMonitoringSettings);
      } else {
        // Create default settings
        const defaultSettings: CostMonitoringSettings = {
          projectId: 'bueno-brows-7cce7',
          budgetThresholds: {
            warning: 25,
            critical: 40,
            max: 50
          },
          alertEmails: [],
          autoSync: true,
          currency: 'USD',
          lastSyncAt: new Date().toISOString()
        };
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await setDoc(doc(db, 'settings', 'costMonitoring'), {
        ...settings,
        lastUpdated: new Date().toISOString()
      });
      
      setTestResult('Settings saved successfully!');
      setTimeout(() => setTestResult(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings) return;
    
    try {
      setTesting(true);
      setTestResult(null);
      setError(null);
      
      const functions = getFunctions(app, 'us-central1');
      const getCurrentUsage = httpsCallable(functions, 'getCurrentUsage');
      const result = await getCurrentUsage();
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        setTestResult('✅ Connection successful! Cost monitoring is working properly.');
      } else {
        setTestResult('⚠️ Connection successful but no data returned.');
      }
    } catch (err: any) {
      console.error('Error testing connection:', err);
      setError(err.message || 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestAlert = async () => {
    if (!settings || !settings.alertEmails.length) {
      setError('Please add at least one email address for alerts');
      return;
    }
    
    try {
      setTesting(true);
      setTestResult(null);
      setError(null);
      
      const functions = getFunctions(app, 'us-central1');
      const sendCostAlert = httpsCallable(functions, 'sendCostAlert');
      const result = await sendCostAlert({
        alertType: 'warning',
        currentCost: 15.50,
        threshold: settings.budgetThresholds.warning,
        emails: settings.alertEmails
      });
      
      if (result.data && typeof result.data === 'object' && 'message' in result.data) {
        setTestResult(`✅ Test alert sent successfully! ${result.data.message}`);
      }
    } catch (err: any) {
      console.error('Error sending test alert:', err);
      setError(err.message || 'Failed to send test alert');
    } finally {
      setTesting(false);
    }
  };

  const updateSettings = (updates: Partial<CostMonitoringSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const addEmail = (email: string) => {
    if (email && !settings?.alertEmails.includes(email)) {
      updateSettings({
        alertEmails: [...(settings?.alertEmails || []), email]
      });
    }
  };

  const removeEmail = (email: string) => {
    if (settings) {
      updateSettings({
        alertEmails: settings.alertEmails.filter(e => e !== email)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cost monitoring settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Configuration */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-6">Project Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Firebase Project ID
            </label>
            <input
              type="text"
              value={settings?.projectId || ''}
              onChange={(e) => updateSettings({ projectId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
              placeholder="bueno-brows-7cce7"
            />
            <p className="text-sm text-slate-500 mt-1">
              Your Firebase project identifier
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency
            </label>
            <select
              value={settings?.currency || 'USD'}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget Thresholds */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-6">Budget Thresholds</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Warning Threshold ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings?.budgetThresholds.warning || 0}
              onChange={(e) => updateSettings({
                budgetThresholds: {
                  warning: parseFloat(e.target.value) || 0,
                  critical: settings?.budgetThresholds.critical || 0,
                  max: settings?.budgetThresholds.max || 0
                }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
            />
            <p className="text-sm text-slate-500 mt-1">
              Send warning alerts at this cost
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Critical Threshold ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings?.budgetThresholds.critical || 0}
              onChange={(e) => updateSettings({
                budgetThresholds: {
                  warning: settings?.budgetThresholds.warning || 0,
                  critical: parseFloat(e.target.value) || 0,
                  max: settings?.budgetThresholds.max || 0
                }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
            />
            <p className="text-sm text-slate-500 mt-1">
              Send critical alerts at this cost
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Budget ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings?.budgetThresholds.max || 0}
              onChange={(e) => updateSettings({
                budgetThresholds: {
                  warning: settings?.budgetThresholds.warning || 0,
                  critical: settings?.budgetThresholds.critical || 0,
                  max: parseFloat(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
            />
            <p className="text-sm text-slate-500 mt-1">
              Maximum allowed monthly cost
            </p>
          </div>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-6">Alert Configuration</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alert Email Addresses
            </label>
            <div className="space-y-3">
              {settings?.alertEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...(settings?.alertEmails || [])];
                      newEmails[index] = e.target.value;
                      updateSettings({ alertEmails: newEmails });
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                  />
                  <button
                    onClick={() => removeEmail(email)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSettings({ alertEmails: [...(settings?.alertEmails || []), ''] })}
                className="flex items-center gap-2 px-3 py-2 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Email
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Email addresses to receive cost alerts
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings?.autoSync || false}
                onChange={(e) => updateSettings({ autoSync: e.target.checked })}
                className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
              />
              <span className="text-sm font-medium text-slate-700">
                Enable automatic daily cost sync
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Test & Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="font-serif text-xl mb-6">Test & Actions</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={handleSendTestAlert}
              disabled={testing || !settings?.alertEmails.length}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Test Alert
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{testResult}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
