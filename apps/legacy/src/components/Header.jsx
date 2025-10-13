export default function Header({ user, onSignOut }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-slate-800">Dashboard</div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{user?.email || user?.uid}</span>
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </header>
  );
}
