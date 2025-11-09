import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-3 rounded-md text-base font-medium ${isActive ? 'bg-terracotta text-white' : 'hover:bg-white/50 text-slate-700'}`;

  const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-base font-medium ${isActive ? 'bg-terracotta text-white' : 'text-slate-700 hover:bg-slate-50'}`;

  return (
    <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between p-4">
          <Link to="/" className="text-2xl">
            <span className="font-brandBueno text-brand-bueno">BUENO</span>
            <span className="ml-2 font-brandBrows text-brand-brows">BROWS</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={linkCls} end>Home</NavLink>
            <NavLink to="/services" className={linkCls}>Services</NavLink>
            <NavLink to="/events" className={linkCls}>Events</NavLink>
            <NavLink to="/book" className={linkCls}>Book</NavLink>
            <NavLink to="/skin-analysis" className={linkCls}>Skin Analysis</NavLink>
            <NavLink to="/reviews" className={linkCls}>Reviews</NavLink>
            
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-md text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90 font-medium flex items-center gap-2"
                  title="My Profile"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90 font-medium"
              >
                Login
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="text-xl">
              <span className="font-brandBueno text-brand-bueno">BUENO</span>
              <span className="ml-1 font-brandBrows text-brand-brows">BROWS</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t bg-white">
              <nav className="py-2">
                <NavLink to="/" className={mobileLinkCls} end onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
                <NavLink to="/services" className={mobileLinkCls} onClick={() => setIsMobileMenuOpen(false)}>Services</NavLink>
                <NavLink to="/events" className={mobileLinkCls} onClick={() => setIsMobileMenuOpen(false)}>Events</NavLink>
                <NavLink to="/book" className={mobileLinkCls} onClick={() => setIsMobileMenuOpen(false)}>Book</NavLink>
                <NavLink to="/skin-analysis" className={mobileLinkCls} onClick={() => setIsMobileMenuOpen(false)}>Skin Analysis</NavLink>
                <NavLink to="/reviews" className={mobileLinkCls} onClick={() => setIsMobileMenuOpen(false)}>Reviews</NavLink>
                
                <div className="px-4 py-3 border-t space-y-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-md text-base bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                      >
                        My Bookings
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-md text-base bg-terracotta text-white hover:bg-terracotta/90 font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-md text-base bg-terracotta text-white hover:bg-terracotta/90 font-medium"
                    >
                      Login
                    </button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}