// apps/admin/src/components/IdleSessionWarning.tsx
// Warning banner shown before automatic sign out due to idle session (Admin)
import { useIdleSession } from '@buenobrows/shared/useIdleSession';
import { getAuth, type User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface IdleSessionWarningProps {
  user: User | null;
  /** Timeout in minutes (default: 15 for admin) */
  timeoutMinutes?: number;
  /** Warning time in minutes before sign out (default: 3) */
  warningMinutes?: number;
}

export default function IdleSessionWarning({ 
  user, 
  timeoutMinutes = 15,
  warningMinutes = 3 
}: IdleSessionWarningProps) {
  const navigate = useNavigate();
  const { remainingTime, isWarning, resetTimer } = useIdleSession(user, {
    timeoutMs: timeoutMinutes * 60 * 1000,
    warningTimeMs: warningMinutes * 60 * 1000,
    onSignOut: () => {
      navigate('/login?reason=idle');
    }
  });

  if (!isWarning || !remainingTime) return null;

  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Admin Session Timeout Warning</p>
            <p className="text-sm opacity-90">
              You'll be automatically signed out in {minutes}:{seconds.toString().padStart(2, '0')} due to inactivity.
            </p>
          </div>
        </div>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors whitespace-nowrap"
        >
          Stay Signed In
        </button>
      </div>
    </div>
  );
}

