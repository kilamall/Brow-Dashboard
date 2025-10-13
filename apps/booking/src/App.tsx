import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from '@/pages/Home';
import ServicesPage from '@/pages/Services';
import Book from '@/pages/Book';
import ConfirmationPage from '@/pages/Confirmation';


export default function App() {
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/book" element={<Book />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </main>
      <footer className="border-t bg-white/60 mt-12">
        <div className="max-w-6xl mx-auto p-6 text-xs text-slate-600">© {new Date().getFullYear()} BUENO BROWS</div>
      </footer>
    </div>
  );
}
