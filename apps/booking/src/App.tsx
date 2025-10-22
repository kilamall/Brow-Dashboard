import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@buenobrows/shared/ErrorBoundary';
import { FeatureError } from '@buenobrows/shared/FallbackUI';
import { ErrorCategory } from '@buenobrows/shared/errorHandling';
import Navbar from './components/Navbar';
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate';
import Home from '@/pages/Home';
import ServicesPage from '@/pages/Services';
import Book from '@/pages/Book';
import Reviews from '@/pages/Reviews';
import ConfirmationPage from '@/pages/Confirmation';
import Login from '@/pages/Login';
import ClientDashboard from '@/pages/ClientDashboard';
import SMSOptIn from '@/pages/SMSOptIn';
import SkinAnalysis from '@/pages/SkinAnalysis';
import Profile from '@/pages/Profile';
import Verify from '@/pages/verify';


export default function App() {
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Navbar />
      <ServiceWorkerUpdate />
      <main className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        <Routes>
          <Route path="/" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Home Page Error" />} category={ErrorCategory.UNKNOWN}>
              <Home />
            </ErrorBoundary>
          } />
          <Route path="/services" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Services Error" />} category={ErrorCategory.SERVICE}>
              <ServicesPage />
            </ErrorBoundary>
          } />
          <Route path="/book" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Booking Error" />} category={ErrorCategory.BOOKING}>
              <Book />
            </ErrorBoundary>
          } />
          <Route path="/reviews" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Reviews Error" />} category={ErrorCategory.UNKNOWN}>
              <Reviews />
            </ErrorBoundary>
          } />
          <Route path="/skin-analysis" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Skin Analysis Error" />} category={ErrorCategory.SKIN_ANALYSIS}>
              <SkinAnalysis />
            </ErrorBoundary>
          } />
          <Route path="/confirmation" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Confirmation Error" />} category={ErrorCategory.BOOKING}>
              <ConfirmationPage />
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Login Error" />} category={ErrorCategory.AUTHENTICATION}>
              <Login />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Dashboard Error" />} category={ErrorCategory.CUSTOMER}>
              <ClientDashboard />
            </ErrorBoundary>
          } />
          <Route path="/profile" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Profile Error" />} category={ErrorCategory.CUSTOMER}>
              <Profile />
            </ErrorBoundary>
          } />
          <Route path="/sms-optin" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="SMS Opt-in Error" />} category={ErrorCategory.MESSAGING}>
              <SMSOptIn />
            </ErrorBoundary>
          } />
          <Route path="/verify" element={
            <ErrorBoundary fallback={(error, reset) => <FeatureError error={error} reset={reset} title="Verification Error" />} category={ErrorCategory.AUTHENTICATION}>
              <Verify />
            </ErrorBoundary>
          } />
        </Routes>
      </main>
      <footer className="border-t bg-white/60 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 text-sm text-slate-600">
          © {new Date().getFullYear()} 
          <span className="ml-2 font-brandBueno text-brand-bueno">BUENO</span>
          <span className="ml-1 font-brandBrows text-brand-brows">BROWS</span>
        </div>
      </footer>
    </div>
  );
}
