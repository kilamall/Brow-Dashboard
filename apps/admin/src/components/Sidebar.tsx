import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchDayClosures, createDayClosure, deleteDayClosure } from '@buenobrows/shared/firestoreActions';
import type { DayClosure } from '@buenobrows/shared/types';
import { format } from 'date-fns';

const LinkItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-md ${isActive ? 'bg-terracotta text-white' : 'text-slate-800 hover:bg-cream'}`
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  const { db } = useFirebase();
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Watch day closures
  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchDayClosures(db, setClosures);
    return unsubscribe;
  }, [db]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isTodayClosed = closures.some(c => c.date === today);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleShopStatus = async () => {
    if (!db) return;

    if (isTodayClosed) {
      // Reopen shop
      const confirmed = window.confirm(
        `Reopen the shop for today (${format(new Date(), 'MMMM d, yyyy')})?\n\n` +
        'This will restore normal business hours for today.'
      );

      if (!confirmed) return;

      try {
        setLoading(true);
        const closure = closures.find(c => c.date === today);
        if (closure) {
          await deleteDayClosure(db, closure.id);
          showMessage('Shop reopened for today', 'success');
        }
      } catch (error: any) {
        console.error('Error reopening shop:', error);
        showMessage(error?.message || 'Failed to reopen shop', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Close shop
      const confirmed = window.confirm(
        `Close the shop for today (${format(new Date(), 'MMMM d, yyyy')})?\n\n` +
        'This will:\n' +
        '• Mark today as closed\n' +
        '• Cancel all pending appointments for today\n' +
        '• Remove all available time slots\n\n' +
        'Existing appointments will be marked as cancelled.'
      );

      if (!confirmed) return;

      try {
        setLoading(true);
        await createDayClosure(db, {
          date: today,
          reason: 'Shop closed',
          closedBy: 'admin',
          closedAt: new Date().toISOString(),
        });
        showMessage('Shop closed for today', 'success');
      } catch (error: any) {
        console.error('Error closing shop:', error);
        showMessage(error?.message || 'Failed to close shop', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <aside className="min-h-screen bg-white border-r p-4 flex flex-col">
      <div className="text-2xl mb-6">
        <span className="font-brandBueno text-brand-bueno">BUENO</span>
        <span className="ml-2 font-brandBrows text-brand-brows">BROWS</span>
      </div>
      
      <nav className="space-y-2 flex-1">
        <LinkItem to="/home">Home</LinkItem>
        <LinkItem to="/schedule">Schedule</LinkItem>
        <LinkItem to="/customers">Customers</LinkItem>
        <LinkItem to="/services">Services</LinkItem>
        <LinkItem to="/reviews">Reviews</LinkItem>
        <LinkItem to="/messages">Messages</LinkItem>
        <LinkItem to="/sms">SMS Support</LinkItem>
        <LinkItem to="/ai-conversations">AI Conversations</LinkItem>
        <LinkItem to="/skin-analyses">Skin Analyses</LinkItem>
        <LinkItem to="/consent-forms">Consent Forms</LinkItem>
        <LinkItem to="/settings">Settings</LinkItem>
      </nav>

      {/* Quick Shop Status Button */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="space-y-2">
          {/* Status Message */}
          {message && (
            <div
              className={`p-2 rounded text-xs ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Shop Status Button */}
          <button
            onClick={handleToggleShopStatus}
            disabled={loading}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isTodayClosed
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isTodayClosed ? 'Reopening...' : 'Closing...'}
              </>
            ) : (
              <>
                {isTodayClosed ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Open Shop Today
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Close Shop Today
                  </>
                )}
              </>
            )}
          </button>

          {/* Current Status Indicator */}
          <div className={`text-xs text-center px-2 py-1 rounded ${
            isTodayClosed 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {isTodayClosed ? '🔴 Shop Closed Today' : '🟢 Shop Open Today'}
          </div>
        </div>
      </div>
    </aside>
  );
}