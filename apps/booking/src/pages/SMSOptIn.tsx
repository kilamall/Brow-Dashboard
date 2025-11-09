import { useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export default function SMSOptIn() {
  const { db } = useFirebase();
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setStatus('loading');
    setError('');

    try {
      // Normalize phone number
      const normalizedPhone = phone.replace(/\D/g, '');
      
      // Check if already subscribed
      const q = query(
        collection(db, 'sms_consents'),
        where('phone', '==', normalizedPhone)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setError('This phone number is already subscribed!');
        setStatus('error');
        return;
      }

      // Add SMS consent
      await addDoc(collection(db, 'sms_consents'), {
        phone: normalizedPhone,
        consentMethod: 'qr_code',
        timestamp: serverTimestamp(),
        status: 'active',
        source: 'qr_code',
      });

      setStatus('success');
      setPhone('');
    } catch (error) {
      console.error('SMS subscription error:', error);
      setError('Failed to subscribe. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-terracotta mb-2">Get Exclusive Promotions via Text</h1>
          <p className="text-slate-600">Sign up to receive special offers, promotions, and appointment reminders</p>
        </div>

        {/* Disclosure */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Opt-in to SMS messages:</strong> By subscribing, you agree to receive automated text messages from Bueno Brows at <strong>(650) 613-8455</strong> for:
          </p>
          <ul className="text-sm text-slate-700 space-y-1 ml-4">
            <li>• <strong>Exclusive promotions and special offers</strong></li>
            <li>• Appointment confirmations & reminders</li>
            <li>• Booking assistance via AI-powered assistant</li>
            <li>• Store updates and information</li>
          </ul>
          <p className="text-xs text-slate-600 mt-3">
            <strong>Important:</strong> Message frequency varies based on your interaction. Responses may be automated by our AI assistant (Gemini API). Message and data rates may apply. Reply <strong>STOP</strong> to opt out anytime, <strong>HELP</strong> for assistance. Consent is never required as a condition of purchase.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(650) 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta"
              required
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <p className="text-xs text-slate-600 -mt-1">
            By subscribing, you agree to our{' '}
            <a href="/privacy" className="underline text-terracotta">Privacy Policy</a>.
            We do not share your mobile information with third parties or affiliates for marketing or promotional purposes.
          </p>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe to SMS'}
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium mb-2">✓ Successfully Subscribed!</p>
              <p className="text-sm text-green-700">
                You'll receive a welcome message shortly. Reply <strong>STOP</strong> anytime to unsubscribe.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Bueno Brows • 315 9th Ave, San Mateo, CA 94401
          </p>
          <p className="text-xs text-slate-500 mt-1">
            (650) 613-8455
          </p>
        </div>
      </div>
    </div>
  );
}

