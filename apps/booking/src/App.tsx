import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from '@/pages/Home';
import ServicesPage from '@/pages/Services';
import Book from '@/pages/Book';
import Reviews from '@/pages/Reviews';
import ConfirmationPage from '@/pages/Confirmation';
import Login from '@/pages/Login';
import ClientDashboard from '@/pages/ClientDashboard';
import SMSOptIn from '@/pages/SMSOptIn';
import SkinAnalysis from '@/pages/SkinAnalysis';


export default function App() {
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/book" element={<Book />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/skin-analysis" element={<SkinAnalysis />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/sms-optin" element={<SMSOptIn />} />
        </Routes>
      </main>
      <footer className="border-t bg-white/60 mt-12">
        <div className="max-w-6xl mx-auto p-6 text-xs text-slate-600">
          © {new Date().getFullYear()} 
          <span className="ml-2 font-brandBueno text-brand-bueno">BUENO</span>
          <span className="ml-1 font-brandBrows text-brand-brows">BROWS</span>
        </div>
      </footer>
    </div>
  );
}
