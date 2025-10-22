import { useEffect, useState } from 'react';
import { isMagicLink, completeMagicLinkSignIn } from '@buenobrows/shared/authHelpers';
import { getAuth, applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

type Status = 'idle' | 'working' | 'done' | 'error';
type ActionType = 'email-verification' | 'password-reset' | 'magic-link' | 'unknown';

export default function Verify() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState('');
  const [actionType, setActionType] = useState<ActionType>('unknown');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Detect the type of action from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    console.log('Verify page - URL params:', { mode, oobCode });
    
    if ((mode === 'verifyEmail' || mode === 'verifyAndChangeEmail') && oobCode) {
      console.log('Setting action type: email-verification');
      setActionType('email-verification');
    } else if (mode === 'resetPassword' && oobCode) {
      console.log('Setting action type: password-reset');
      setActionType('password-reset');
    } else if (isMagicLink()) {
      console.log('Setting action type: magic-link');
      setActionType('magic-link');
      const stored = window.localStorage.getItem('bb_magic_email');
      if (stored) setEmail(stored);
    } else {
      console.log('No valid action type detected, mode:', mode, 'oobCode:', oobCode);
      // Set a default action type if we have mode but no oobCode
      if (mode === 'resetPassword') {
        console.log('Setting password-reset without oobCode');
        setActionType('password-reset');
      }
    }
  }, []);

  async function handleComplete() {
    try {
      setStatus('working');
      setErr('');

      const auth = getAuth();
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');

      if (actionType === 'email-verification' && oobCode) {
        // Handle email verification (both verifyEmail and verifyAndChangeEmail modes)
        await applyActionCode(auth, oobCode);
        setStatus('done');
      } else if (actionType === 'password-reset' && oobCode) {
        // Handle password reset
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await confirmPasswordReset(auth, oobCode, newPassword);
        setStatus('done');
      } else if (actionType === 'magic-link') {
        // Handle magic link sign-in
        await completeMagicLinkSignIn(email);
        setStatus('done');
      } else {
        throw new Error('Invalid verification link');
      }

      // Clear sensitive URL params after successful completion
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : typeof e === 'string' ? e : 'Failed to complete action';
      setErr(message);
      setStatus('error');
    }
  }

  const getTitle = () => {
    switch (actionType) {
      case 'email-verification':
        return 'Verify your email for Access to the Bueno Brows App';
      case 'password-reset':
        return 'Reset your password';
      case 'magic-link':
        return 'Complete your sign-in';
      default:
        return 'Complete your action';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'email-verification':
        return 'Click the button below to verify your email address.';
      case 'password-reset':
        return 'Enter your new password below.';
      case 'magic-link':
        return 'Click the button below to finish signing in. If we couldn\'t detect your email automatically, please enter it.';
      default:
        return 'Complete the action below.';
    }
  };

  const getButtonText = () => {
    switch (actionType) {
      case 'email-verification':
        return status === 'working' ? 'Verifying…' : 'Verify Email';
      case 'password-reset':
        return status === 'working' ? 'Resetting…' : 'Reset Password';
      case 'magic-link':
        return status === 'working' ? 'Completing…' : 'Complete sign-in';
      default:
        return status === 'working' ? 'Working…' : 'Complete';
    }
  };

  const getSuccessMessage = () => {
    switch (actionType) {
      case 'email-verification':
        return 'Your email has been verified! You can now sign in to your account.';
      case 'password-reset':
        return 'Your password has been reset! You can now sign in with your new password.';
      case 'magic-link':
        return 'You\'re signed in. We linked your previous bookings to your account.';
      default:
        return 'Action completed successfully!';
    }
  };

  console.log('Verify page render - actionType:', actionType, 'status:', status);

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="font-serif text-2xl mb-2">{getTitle()}</h1>
      <p className="text-sm text-slate-600 mb-4">
        {getDescription()}
      </p>
      

      <div className="grid gap-3">
        {/* Email input for magic link */}
        {actionType === 'magic-link' && (
          <input
            className="border rounded-md p-2"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            aria-label="Email address"
          />
        )}

        {/* Password inputs for password reset */}
        {actionType === 'password-reset' && (
          <>
            <input
              className="border rounded-md p-2"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              aria-label="New password"
            />
            <input
              className="border rounded-md p-2"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              aria-label="Confirm new password"
            />
          </>
        )}

        {/* Fallback for unknown action type */}
        {actionType === 'unknown' && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Unknown action type. URL params: {JSON.stringify({
              mode: new URLSearchParams(window.location.search).get('mode'),
              oobCode: new URLSearchParams(window.location.search).get('oobCode')
            })}
          </div>
        )}

        <button
          className="bg-terracotta text-white rounded-md px-4 py-2 disabled:opacity-60"
          onClick={() => void handleComplete()}
          disabled={status === 'working'}
          aria-busy={status === 'working'}
        >
          {getButtonText()}
        </button>

        {status === 'done' && (
          <div className="text-green-700 text-sm">
            {getSuccessMessage()}
          </div>
        )}

        {err && (
          <div className="text-red-600 text-sm" role="alert">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
