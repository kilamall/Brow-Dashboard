import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-terracotta text-white' : 'hover:bg-white/50'}`;

  return (
    <header className="bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl">
          <span className="font-brandBueno text-brand-bueno">BUENO</span>
          <span className="ml-2 font-brandBrows text-brand-brows">BROWS</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkCls} end>Home</NavLink>
          <NavLink to="/services" className={linkCls}>Services</NavLink>
          <NavLink to="/book" className={linkCls}>Book</NavLink>
          <NavLink to="/skin-analysis" className={linkCls}>Skin Analysis</NavLink>
          <NavLink to="/reviews" className={linkCls}>Reviews</NavLink>
          
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90"
            >
              My Bookings
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}