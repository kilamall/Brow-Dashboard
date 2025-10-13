export default function SettingsTab() {
  // Loads and saves analytics targets (daily/weekly/monthly) and default COGS rate
  // Uses firebaseActions.getAnalyticsTargets/saveAnalyticsTargets
  return <TargetsForm />;
}

import { useEffect, useState } from 'react';
import * as actions from '@/firebaseActions';

function TargetsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ dailyTarget: '', weeklyTarget: '', monthlyTarget: '', defaultCogsRate: '' });

  useEffect(() => {
    (async () => {
      try {
        const t = await actions.getAnalyticsTargets();
        if (t) setForm({
          dailyTarget: String(t.dailyTarget ?? ''),
          weeklyTarget: String(t.weeklyTarget ?? ''),
          monthlyTarget: String(t.monthlyTarget ?? ''),
          defaultCogsRate: String(t.defaultCogsRate ?? ''),
        });
      } finally { setLoading(false); }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await actions.saveAnalyticsTargets({
        dailyTarget: Number(form.dailyTarget || 0),
        weeklyTarget: Number(form.weeklyTarget || 0),
        monthlyTarget: Number(form.monthlyTarget || 0),
        defaultCogsRate: Number(form.defaultCogsRate || 0),
      });
      setMsg('Saved!');
    } catch (e) {
      setMsg(e?.message || 'Failed to save');
    } finally { setSaving(false); }
  }

  if (loading) return <section className="rounded-xl border border-slate-200 bg-white p-4">Loading…</section>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Analytics Targets</h2>
      <p className="text-sm text-slate-600">Set expected revenue targets and a default COGS rate (% of revenue).</p>
      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2">{msg}</div>}
      <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <label className="block">
          <span className="text-sm text-slate-700">Daily target ($)</span>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                 value={form.dailyTarget} onChange={(e)=>setForm({...form, dailyTarget:e.target.value})} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Weekly target ($)</span>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                 value={form.weeklyTarget} onChange={(e)=>setForm({...form, weeklyTarget:e.target.value})} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Monthly target ($)</span>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                 value={form.monthlyTarget} onChange={(e)=>setForm({...form, monthlyTarget:e.target.value})} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Default COGS rate (% of revenue)</span>
          <input type="number" step="0.01" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                 value={form.defaultCogsRate} onChange={(e)=>setForm({...form, defaultCogsRate:e.target.value})} />
        </label>
        <div className="sm:col-span-2 flex items-center gap-2">
          <button type="submit" disabled={saving}
                  className="rounded-lg bg-amber-500 text-white px-4 py-2 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </section>
  );
}
