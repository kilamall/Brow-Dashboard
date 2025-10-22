import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface VerificationSettings {
  emailVerificationEnabled: boolean;
  smsVerificationEnabled: boolean;
  requireVerification: boolean;
}

export default function VerificationSettings() {
  const { db } = useFirebase();
  const [settings, setSettings] = useState<VerificationSettings>({
    emailVerificationEnabled: true,
    smsVerificationEnabled: true,
    requireVerification: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'verification'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as VerificationSettings);
        }
      } catch (error) {
        console.error('Error loading verification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [db]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateDoc(doc(db, 'settings', 'verification'), {
        ...settings,
        updatedAt: new Date()
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving verification settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof VerificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading verification settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-slate-800">Email Verification</h3>
            <p className="text-sm text-slate-600">Allow guests to verify their email address with a code</p>
          </div>
          <button
            onClick={() => handleToggle('emailVerificationEnabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailVerificationEnabled ? 'bg-terracotta' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailVerificationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {!settings.emailVerificationEnabled && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <p className="text-sm text-slate-600">
              <strong>Email verification is disabled.</strong> Guests will not be able to verify their email addresses during booking.
            </p>
          </div>
        )}
      </div>

      {/* SMS Verification */}
      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-slate-800">SMS Verification</h3>
            <p className="text-sm text-slate-600">Allow guests to verify their phone number with a text message code</p>
          </div>
          <button
            onClick={() => handleToggle('smsVerificationEnabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.smsVerificationEnabled ? 'bg-terracotta' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.smsVerificationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {!settings.smsVerificationEnabled && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <p className="text-sm text-slate-600">
              <strong>SMS verification is disabled.</strong> Guests will not be able to verify their phone numbers during booking.
            </p>
          </div>
        )}
      </div>

      {/* Require Verification */}
      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-slate-800">Require Verification</h3>
            <p className="text-sm text-slate-600">Force guests to verify at least one contact method before booking</p>
          </div>
          <button
            onClick={() => handleToggle('requireVerification')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.requireVerification ? 'bg-terracotta' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.requireVerification ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {!settings.requireVerification && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Verification is optional.</strong> Guests can book without verifying their contact information.
            </p>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-800 mb-2">Current Configuration</h4>
        <div className="space-y-1 text-sm text-slate-600">
          <p>• Email verification: {settings.emailVerificationEnabled ? 'Enabled' : 'Disabled'}</p>
          <p>• SMS verification: {settings.smsVerificationEnabled ? 'Enabled' : 'Disabled'}</p>
          <p>• Verification required: {settings.requireVerification ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
