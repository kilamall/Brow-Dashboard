export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'services', label: 'Services' },
    { id: 'customers', label: 'Customers' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <aside className="w-56 border-r border-slate-200 bg-white min-h-screen p-4 space-y-3">
      <div className="font-semibold">Bueno Brows Admin</div>
      <nav className="space-y-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`block w-full text-left px-3 py-2 rounded-lg ${
              activeTab === t.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >{t.label}</button>
        ))}
      </nav>
      <div className="pt-4">
        <button onClick={onLogout} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Sign out</button>
      </div>
    </aside>
  );
}
