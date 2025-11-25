// packages/shared/src/useIdleSession.ts
// Hook to automatically sign out users after idle session timeout
import { useEffect, useRef, useCallback, useState } from 'react';
import { getAuth, signOut, type User } from 'firebase/auth';

export interface IdleSessionOptions {
  /** Timeout in milliseconds (default: 30 minutes) */
  timeoutMs?: number;
  /** Warning time in milliseconds before sign out (default: 5 minutes before) */
  warningTimeMs?: number;
  /** Callback when warning is shown */
  onWarning?: (remainingMs: number) => void;
  /** Callback when user is signed out */
  onSignOut?: () => void;
  /** Whether to enable idle detection (default: true) */
  enabled?: boolean;
  /** Events to track for activity (default: all common events) */
  events?: string[];
}

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING_TIME_MS = 5 * 60 * 1000; // 5 minutes before timeout
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown'
];

/**
 * Hook to automatically sign out users after idle session timeout
 * 
 * @param user - Firebase user object (null if not signed in)
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const user = useAuthState();
 * useIdleSession(user, {
 *   timeoutMs: 15 * 60 * 1000, // 15 minutes
 *   onWarning: (remaining) => console.log(`You'll be signed out in ${remaining}ms`),
 *   onSignOut: () => navigate('/login')
 * });
 * ```
 */
export function useIdleSession(
  user: User | null,
  options: IdleSessionOptions = {}
): {
  /** Remaining time in milliseconds until sign out */
  remainingTime: number | null;
  /** Whether warning is currently shown */
  isWarning: boolean;
  /** Manually reset the idle timer */
  resetTimer: () => void;
} {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    warningTimeMs = DEFAULT_WARNING_TIME_MS,
    onWarning,
    onSignOut,
    enabled = true,
    events = DEFAULT_EVENTS
  } = options;

  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isWarning, setIsWarning] = useState(false);

  // Reset the idle timer
  const resetTimer = useCallback(() => {
    if (!user || !enabled) return;
    
    lastActivityRef.current = Date.now();
    setIsWarning(false);
    setRemainingTime(null);

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    // Set warning timeout
    warningTimeoutRef.current = window.setTimeout(() => {
      const remaining = timeoutMs - warningTimeMs;
      setIsWarning(true);
      setRemainingTime(remaining);
      onWarning?.(remaining);
    }, timeoutMs - warningTimeMs);

    // Set sign out timeout
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        setIsWarning(false);
        setRemainingTime(null);
        onSignOut?.();
      } catch (error) {
        console.error('Error signing out idle user:', error);
      }
    }, timeoutMs);
  }, [user, enabled, timeoutMs, warningTimeMs, onWarning, onSignOut]);

  // Track user activity
  useEffect(() => {
    if (!user || !enabled) return;

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, enabled, events, resetTimer]);

  // Update remaining time display
  useEffect(() => {
    if (!isWarning || !enabled) {
      setRemainingTime(null);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, timeoutMs - elapsed);
      setRemainingTime(remaining);

      if (remaining <= 0) {
        setIsWarning(false);
        setRemainingTime(null);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isWarning, enabled, timeoutMs]);

  return {
    remainingTime,
    isWarning,
    resetTimer
  };
}

