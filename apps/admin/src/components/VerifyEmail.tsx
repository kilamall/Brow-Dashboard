import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { auth } = useFirebase();

  useEffect(() => {
    // Check if this is a password reset confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      // This is a password reset confirmation
      setStatus('success');
      setMessage('Password reset email sent! Check your email for the reset link.');
    } else if (mode === 'verifyEmail' && oobCode) {
      // This is an email verification
      setStatus('success');
      setMessage('Email verification successful! You can now sign in.');
    } else {
      // No specific action, just show success
      setStatus('success');
      setMessage('Email verification complete! You can now sign in.');
    }
  }, []);

  const handleContinue = () => {
    // Redirect to the admin sign-in page
    window.location.href = '/';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-cream">
        <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-4"></div>
          <h1 className="text-xl font-serif text-slate-800 mb-2 text-center">Verifying...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <div className="text-center mb-6">
          {status === 'success' ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <h1 className="text-xl font-serif text-slate-800 mb-2 text-center">
          {status === 'success' ? 'Success!' : 'Error'}
        </h1>
        
        <p className="text-slate-600 text-sm text-center mb-6">
          {message}
        </p>
        
        <button 
          onClick={handleContinue}
          className="w-full bg-terracotta text-white rounded-md py-2 hover:bg-opacity-90 transition-colors"
        >
          Continue to Sign In
        </button>
        
        {status === 'success' && (
          <p className="text-xs text-slate-500 text-center mt-4">
            You will be redirected to the admin sign-in page.
          </p>
        )}
      </div>
    </div>
  );
}
