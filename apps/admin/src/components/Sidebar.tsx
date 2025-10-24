import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchDayClosures, createDayClosure, deleteDayClosure } from '@buenobrows/shared/firestoreActions';
import type { DayClosure } from '@buenobrows/shared/types';
import { format } from 'date-fns';

// Navigation Groups
const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/home', icon: '🏠', label: 'Dashboard' },
      { to: '/schedule', icon: '📅', label: 'Schedule' }
    ]
  },
  {
    label: 'Business',
    items: [
      { to: '/customers', icon: '👥', label: 'Customers' },
      { to: '/services', icon: '✨', label: 'Services' }
    ]
  },
  {
    label: 'Communications',
    items: [
      { to: '/messages', icon: '💬', label: 'Messages' },
      { to: '/sms', icon: '📱', label: 'SMS Support' },
      { to: '/ai-conversations', icon: '🤖', label: 'AI Conversations' }
    ]
  },
  {
    label: 'Analytics',
    items: [
      { to: '/cost-monitoring', icon: '💰', label: 'Cost Monitoring' },
      { to: '/reviews', icon: '⭐', label: 'Reviews' }
    ]
  },
  {
    label: 'Settings',
    items: [
      { to: '/settings', icon: '⚙️', label: 'Settings' }
    ]
  }
];

const LinkItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'border-l-3 border-terracotta bg-terracotta/10 text-terracotta font-medium' 
          : 'border-l-3 border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900'
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    <span className="font-medium">{label}</span>
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
    <aside className="min-h-screen bg-white shadow-sm border-r border-slate-200 p-6 flex flex-col">
      {/* Logo */}
      <div className="text-2xl mb-8">
        <span className="font-brandBueno text-brand-bueno">BUENO</span>
        <span className="ml-2 font-brandBrows text-brand-brows">BROWS</span>
      </div>
      
      {/* Navigation Groups */}
      <nav className="space-y-6 flex-1">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <LinkItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Shop Status Section */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="space-y-3">
          {/* Status Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Shop Status Button */}
          <button
            onClick={handleToggleShopStatus}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm ${
              isTodayClosed
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
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