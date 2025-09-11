import { NavLink } from 'react-router-dom';

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
  return (
    <aside className="min-h-screen bg-white border-r p-4">
      <div className="text-2xl font-serif text-terracotta mb-6">BUENO BROWS</div>
      <nav className="space-y-2">
        <LinkItem to="/home">Home</LinkItem>
        <LinkItem to="/schedule">Schedule</LinkItem>
        <LinkItem to="/customers">Customers</LinkItem>
        <LinkItem to="/services">Services</LinkItem>
        <LinkItem to="/settings">Settings</LinkItem>
      </nav>
    </aside>
  );
}