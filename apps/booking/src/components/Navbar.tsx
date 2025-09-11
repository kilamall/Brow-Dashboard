import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-terracotta text-white' : 'hover:bg-white/50'}`;

  return (
    <header className="bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-serif text-2xl text-terracotta">BUENO BROWS</Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkCls} end>Home</NavLink>
          <NavLink to="/services" className={linkCls}>Services</NavLink>
          <NavLink to="/book" className={linkCls}>Book</NavLink>
          <a href="#reviews" className="px-3 py-2 rounded-md text-sm hover:bg-white/50">Reviews</a>
        </nav>
      </div>
    </header>
  );
}