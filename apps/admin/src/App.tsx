import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import AuthGate from './components/AuthGate';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import IdleSessionWarning from './components/IdleSessionWarning';

import AnalyticsHome from './AnalyticsHome';        // lives at src/AnalyticsHome.tsx
import Schedule from './pages/Schedule';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Services from './pages/Services';
import Reviews from './pages/Reviews';
import Messages from './pages/Messages';
import Conversations from './pages/Conversations';
import AIConversations from './pages/AIConversations';
import SkinAnalyses from './pages/SkinAnalyses';
import ConsentForms from './pages/ConsentForms';
import PastAppointments from './pages/PastAppointments';
import CostMonitoring from './pages/CostMonitoring';
import MonetizedProducts from './pages/MonetizedProducts';
import MonetizationAnalytics from './pages/MonetizationAnalytics';
import Settings from './pages/Settings';
import Promotions from './pages/Promotions';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <AuthGate>
      <IdleSessionWarning user={user} timeoutMinutes={15} warningMinutes={3} />
      <div className="min-h-screen grid" style={{ gridTemplateRows: '56px 1fr' }}>
        {/* Top bar */}
        <Header />

        {/* Left nav + content */}
        <div className="grid" style={{ gridTemplateColumns: '224px 1fr' }}>
          <Sidebar />
          <main className="p-6">
            <Routes>
              {/* Redirect the root to /home */}
              <Route index element={<Navigate to="/home" replace />} />

              {/* Use absolute paths to match Sidebar navigation */}
              <Route path="/home" element={<AnalyticsHome />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:customerId" element={<CustomerProfile />} />
              <Route path="/services" element={<Services />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/messages" element={<Conversations initialTab={'messages'} />} />
              <Route path="/sms" element={<Conversations initialTab={'sms'} />} />
              <Route path="/ai-conversations" element={<AIConversations />} />
              <Route path="/skin-analyses" element={<SkinAnalyses />} />
              <Route path="/consent-forms" element={<ConsentForms />} />
              <Route path="/past-appointments" element={<PastAppointments />} />
              <Route path="/cost-monitoring" element={<CostMonitoring />} />
              <Route path="/monetized-products" element={<MonetizedProducts />} />
              <Route path="/monetization-analytics" element={<MonetizationAnalytics />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/settings" element={<Settings />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
