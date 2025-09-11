import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages (Services/Customers are already added; the others are simple shells for now)
import AnalyticsHome from './AnalyticsHome';
import Schedule from './pages/Schedule';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthGate>
      <div className="min-h-screen grid grid-cols-[240px_1fr] bg-cream">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="p-6">
            <Routes>
              // Redirect root path "/" to "/home" for default landing page behavior
                            <Route path="/" element={<Navigate to="/home" />} />
                            <Route path="/home" element={<AnalyticsHome />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/services" element={<Services />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
