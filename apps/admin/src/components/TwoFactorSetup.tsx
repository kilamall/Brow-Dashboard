import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  multiFactor, 
  TotpMultiFactorGenerator,
  type TotpSecret,
} from 'firebase/auth';
import QRCode from 'qrcode';

export default function TwoFactorSetup() {
  const { auth } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mfaEnrolled, setMfaEnrolled] = useState(false);

  const user = auth.currentUser;

  // Check if MFA is enrolled
  useEffect(() => {
    if (user) {
      const enrolled = multiFactor(user).enrolledFactors.length > 0;
      setMfaEnrolled(enrolled);
    }
  }, [user]);

  // Step 1: Generate QR code
  async function startEnrollment() {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const multiFactorSession = await multiFactor(user).getSession();
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      
      // Generate otpauth URL for authenticator apps
      const otpAuthUrl = totpSecret.generateQrCodeUrl(
        user.email || 'admin@buenobrows.com',
        'Bueno Brows Admin'
      );
      
      // Convert otpauth URL to actual QR code image (data URL)
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setSecret(totpSecret);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err: any) {
      console.error('2FA enrollment error:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify and finalize enrollment
  async function finishEnrollment() {
    if (!secret || !user) return;
    
    setLoading(true);
    setError('');
    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        secret,
        verificationCode
      );
      
      await multiFactor(user).enroll(multiFactorAssertion, 'Authenticator App');
      
      setSuccess('Two-factor authentication enabled successfully! 🎉');
      setQrCodeUrl(null);
      setSecret(null);
      setVerificationCode('');
      setMfaEnrolled(true);
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Unenroll (disable 2FA)
  async function disable2FA() {
    if (!user) return;
    
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length > 0) {
        await multiFactor(user).unenroll(enrolledFactors[0]);
        setSuccess('Two-factor authentication disabled');
        setMfaEnrolled(false);
      }
    } catch (err: any) {
      console.error('2FA disable error:', err);
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-xl font-serif text-slate-800 mb-2">Two-Factor Authentication (2FA)</h2>
        <p className="text-sm text-slate-600">
          Add an extra layer of security to your admin account by requiring a verification code from your phone.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {!mfaEnrolled && !qrCodeUrl && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How it works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
              <li>• Scan the QR code we'll show you</li>
              <li>• Enter the 6-digit code to verify</li>
              <li>• From now on, you'll need both your password AND a code from the app to sign in</li>
            </ul>
          </div>
          
          <button
            onClick={startEnrollment}
            disabled={loading}
            className="bg-terracotta text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}

      {qrCodeUrl && (
        <div className="space-y-4">
          <div className="border-l-4 border-terracotta bg-orange-50 p-4 rounded">
            <h3 className="font-medium text-slate-800 mb-2">Step 1: Scan this QR code</h3>
            <p className="text-sm text-slate-600 mb-4">
              Open your authenticator app and scan this QR code:
            </p>
            
            <div className="bg-white p-4 border rounded-lg mb-4 flex justify-center">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Can't scan? Enter this code manually:</p>
              <code className="text-sm bg-white px-3 py-1.5 rounded border border-slate-300 block font-mono">
                {secret?.secretKey}
              </code>
            </div>
          </div>

          <div className="border-l-4 border-terracotta bg-orange-50 p-4 rounded">
            <h3 className="font-medium text-slate-800 mb-2">Step 2: Enter the code</h3>
            <p className="text-sm text-slate-600 mb-3">
              Enter the 6-digit code shown in your authenticator app:
            </p>
            
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="border border-slate-300 rounded-lg px-4 py-2.5 w-full text-center text-2xl tracking-widest font-mono mb-4 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
              maxLength={6}
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={finishEnrollment}
                disabled={loading || verificationCode.length !== 6}
                className="bg-terracotta text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-1 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
              </button>
              <button
                onClick={() => {
                  setQrCodeUrl(null);
                  setSecret(null);
                  setVerificationCode('');
                  setError('');
                }}
                disabled={loading}
                className="border border-slate-300 px-6 py-2.5 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {mfaEnrolled && !qrCodeUrl && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-green-800 font-medium">Two-factor authentication is enabled</p>
              <p className="text-sm text-green-700 mt-1">
                Your account is protected with an extra layer of security. You'll need to enter a code from your authenticator app when signing in.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h3 className="font-medium text-slate-800 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Keep your authenticator app installed and accessible</li>
              <li>• If you lose access to your authenticator app, you may be locked out</li>
              <li>• Consider backing up your authenticator app's data</li>
            </ul>
          </div>

          <button
            onClick={disable2FA}
            disabled={loading}
            className="border-2 border-red-300 text-red-600 px-6 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );
}




