import { useEffect, useMemo, useState } from 'react';
import { initFirebase } from '@shared/firebase';
import {
  watchAnalyticsTargets,
  setAnalyticsTargets,
  watchBusinessHours,
  setBusinessHours,
  watchAppointmentsByDay
} from '@shared/firestoreActions';
import type { AnalyticsTargets, BusinessHours, Appointment } from '@shared/types';
import { availableSlotsForDay } from '@shared/slotUtils';
import { format, parseISO } from 'date-fns';

const { db } = initFirebase();

export default function Settings() {
  const [targets, setTargetsState] = useState<AnalyticsTargets | null>(null);
  const [bh, setBhState] = useState<BusinessHours | null>(null);

  useEffect(() => watchAnalyticsTargets(db, setTargetsState), []);
  useEffect(() => watchBusinessHours(db, setBhState), []);

  return (
    <div className="grid gap-6">
      <section className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-4">Analytics Targets</h2>
        {targets ? <TargetsForm initial={targets} /> : <div className="text-slate-500 text-sm">Loading targets…</div>}
      </section>

      <section className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-4">Business Hours</h2>
        {bh ? <BusinessHoursEditor initial={bh} /> : <div className="text-slate-500 text-sm">Loading business hours…</div>}
      </section>
    </div>
  );
}

// -------------------- Analytics Targets --------------------
function TargetsForm({ initial }: { initial: AnalyticsTargets }) {
  const [dailyTarget, setDailyTarget] = useState<number>(initial.dailyTarget);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(initial.weeklyTarget);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(initial.monthlyTarget);
  const [defaultCogsRate, setDefaultCogsRate] = useState<number>(initial.defaultCogsRate);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      await setAnalyticsTargets(db, { dailyTarget, weeklyTarget, monthlyTarget, defaultCogsRate });
      setMsg('Saved');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 max-w-xl">
      <label className="grid grid-cols-[160px_1fr] items-center gap-2">
        <span className="text-sm text-slate-600">Daily target ($)</span>
        <input type="number" min={0} className="border rounded-md p-2" value={dailyTarget} onChange={(e)=>setDailyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[160px_1fr] items-center gap-2">
        <span className="text-sm text-slate-600">Weekly target ($)</span>
        <input type="number" min={0} className="border rounded-md p-2" value={weeklyTarget} onChange={(e)=>setWeeklyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[160px_1fr] items-center gap-2">
        <span className="text-sm text-slate-600">Monthly target ($)</span>
        <input type="number" min={0} className="border rounded-md p-2" value={monthlyTarget} onChange={(e)=>setMonthlyTarget(parseFloat(e.target.value||'0'))} />
      </label>
      <label className="grid grid-cols-[160px_1fr] items-center gap-2">
        <span className="text-sm text-slate-600">Default COGS rate (%)</span>
        <input type="number" min={0} max={100} step={0.1} className="border rounded-md p-2" value={defaultCogsRate} onChange={(e)=>setDefaultCogsRate(parseFloat(e.target.value||'0'))} />
      </label>
      <div className="flex items-center gap-3 pt-2">
        <button className="bg-terracotta text-white rounded-md px-4 py-2" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save targets'}</button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}

// -------------------- Business Hours --------------------
const dayKeys = ['sun','mon','tue','wed','thu','fri','sat'] as const;
const dayLabels: Record<typeof dayKeys[number], string> = { sun:'Sunday', mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday' };

function BusinessHoursEditor({ initial }: { initial: BusinessHours }) {
  const [timezone, setTimezone] = useState<string>(initial.timezone);
  const [slotInterval, setSlotInterval] = useState<number>(initial.slotInterval);
  const [slots, setSlots] = useState<BusinessHours['slots']>(() => JSON.parse(JSON.stringify(initial.slots)));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function addRange(day: typeof dayKeys[number]) {
    const next = structuredClone(slots);
    (next[day] ||= []).push(['09:00','17:00']);
    setSlots(next);
  }
  function removeRange(day: typeof dayKeys[number], idx: number) {
    const next = structuredClone(slots);
    next[day].splice(idx,1);
    setSlots(next);
  }
  function updateCell(day: typeof dayKeys[number], idx: number, col: 0|1, value: string) {
    const v = value.trim();
    const next = structuredClone(slots);
    next[day][idx][col] = v;
    setSlots(next);
  }

  async function save() {
    try {
      setSaving(true); setMsg('');
      validateAll({ timezone, slotInterval, slots });
      await setBusinessHours(db, { timezone, slotInterval, slots });
      setMsg('Saved');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
        <label className="grid grid-cols-[140px_1fr] items-center gap-2">
          <span className="text-sm text-slate-600">Timezone (IANA)</span>
          <input className="border rounded-md p-2" placeholder="America/Los_Angeles" value={timezone} onChange={(e)=>setTimezone(e.target.value)} />
        </label>
        <label className="grid grid-cols-[160px_1fr] items-center gap-2">
          <span className="text-sm text-slate-600">Slot interval (min)</span>
          <input type="number" min={5} step={5} className="border rounded-md p-2" value={slotInterval} onChange={(e)=>setSlotInterval(parseInt(e.target.value||'15'))} />
        </label>
      </div>

      <div className="grid gap-4">
        {dayKeys.map((k) => (
          <div key={k} className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg">{dayLabels[k]}</h3>
              <button className="text-terracotta" onClick={()=>addRange(k)}>+ Add range</button>
            </div>
            {(slots[k] || []).length === 0 && (
              <div className="text-slate-500 text-sm">Closed</div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(slots[k] || []).map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="border rounded-md p-2 w-28"
                    placeholder="09:00"
                    value={pair[0]}
                    onChange={(e)=>updateCell(k, idx, 0, e.target.value)}
                    aria-label={`${dayLabels[k]} start ${idx+1}`}
                  />
                  <span>—</span>
                  <input
                    className="border rounded-md p-2 w-28"
                    placeholder="17:00"
                    value={pair[1]}
                    onChange={(e)=>updateCell(k, idx, 1, e.target.value)}
                    aria-label={`${dayLabels[k]} end ${idx+1}`}
                  />
                  <button className="text-red-600" onClick={()=>removeRange(k, idx)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="bg-terracotta text-white rounded-md px-4 py-2" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save business hours'}</button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>

      <SlotPreview bh={{ timezone, slotInterval, slots }} />
    </div>
  );
}

// -------------------- Slot Preview --------------------
function SlotPreview({ bh }: { bh: BusinessHours }) {
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [duration, setDuration] = useState<number>(60);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const d = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);

  useEffect(() => {
    return watchAppointmentsByDay(db, d, setAppts);
  }, [d]);

  const slots = useMemo(() => availableSlotsForDay(d, duration, bh, appts), [d, duration, bh, appts]);

  return (
    <div className="border rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <div className="text-sm text-slate-600">Preview date</div>
          <input type="date" className="border rounded-md p-2" value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
        </div>
        <label className="grid grid-cols-[160px_1fr] items-center gap-2">
          <span className="text-sm text-slate-600">Service duration (min)</span>
          <input type="number" min={5} step={5} className="border rounded-md p-2" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value||'0'))} />
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((iso)=> (
          <div key={iso} className="border rounded-md py-2 text-center text-sm">{format(parseISO(iso), 'h:mm a')}</div>
        ))}
        {!slots.length && <div className="text-slate-500 text-sm">No slots under current hours.</div>}
      </div>
    </div>
  );
}

// -------------------- Validation --------------------
function validateAll(v: { timezone: string; slotInterval: number; slots: BusinessHours['slots'] }) {
  if (!v.timezone || !v.timezone.includes('/')) throw new Error('Timezone must be a valid IANA zone, e.g. "America/Los_Angeles"');
  if (!Number.isFinite(v.slotInterval) || v.slotInterval <= 0) throw new Error('Slot interval must be a positive number');
  const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
  (['sun','mon','tue','wed','thu','fri','sat'] as const).forEach((day) => {
    for (const [start, end] of v.slots[day] || []) {
      if (!re.test(start) || !re.test(end)) throw new Error(`Invalid time on ${day}: use HH:MM`);
      if (start >= end) throw new Error(`${day}: start must be before end`);
    }
  });
}
