import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminEmailSetupProps {
  className?: string;
}

export default function AdminEmailSetup({ className = '' }: AdminEmailSetupProps) {
  const { db, app } = useFirebase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  // Load current admin email on component mount
  useState(() => {
    const loadCurrentEmail = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setCurrentEmail(data?.email || null);
          setEmail(data?.email || '');
        }
      } catch (error) {
        console.error('Error loading current admin email:', error);
      }
    };
    loadCurrentEmail();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const functions = getFunctions(app, 'us-central1');
      const setupAdminEmail = httpsCallable(functions, 'setupAdminEmail');
      
      const result = await setupAdminEmail({ email: email.trim() });
      
      setMessage('Admin email configured successfully! You will now receive notifications for new appointment requests.');
      setMessageType('success');
      setCurrentEmail(email.trim());
      
    } catch (error: any) {
      console.error('Error setting up admin email:', error);
      setMessage(error.message || 'Failed to configure admin email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!currentEmail) {
      setMessage('Please configure an admin email first');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Send a test notification email
      const functions = getFunctions(app, 'us-central1');
      const sendTestEmail = httpsCallable(functions, 'sendTestAdminNotification');
      
      await sendTestEmail({ 
        adminEmail: currentEmail,
        testData: {
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          serviceName: 'Test Service',
          date: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          duration: 60,
          price: 100,
          appointmentId: 'test-' + Date.now()
        }
      });
      
      setMessage('Test email sent successfully! Check your inbox.');
      setMessageType('success');
      
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setMessage(error.message || 'Failed to send test email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">📧 Admin Email Setup</h2>
        <p className="text-slate-600">
          Configure the email address that will receive notifications for new appointment requests.
        </p>
      </div>

      {currentEmail && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">✅</span>
            <span className="font-semibold text-green-800">Admin Email Configured</span>
          </div>
          <p className="text-green-700">
            Current admin email: <strong>{currentEmail}</strong>
          </p>
          <p className="text-sm text-green-600 mt-1">
            You will receive email notifications for all new appointment requests.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-700 mb-2">
            Admin Email Address
          </label>
          <input
            type="email"
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@buenobrows.com"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
            required
          />
          <p className="text-sm text-slate-500 mt-1">
            This email will receive notifications for new appointment requests.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Configuring...
              </>
            ) : (
              <>
                {currentEmail ? 'Update Admin Email' : 'Configure Admin Email'}
              </>
            )}
          </button>

          {currentEmail && (
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={loading}
              className="px-6 py-3 border-2 border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Send Test Email
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {messageType === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 How It Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You'll receive an email notification whenever a customer books an appointment</li>
          <li>• Each notification includes customer details, service info, and a direct link to confirm</li>
          <li>• Use the "Send Test Email" button to verify your email setup is working</li>
          <li>• You can update your email address at any time</li>
        </ul>
      </div>
    </div>
  );
}
