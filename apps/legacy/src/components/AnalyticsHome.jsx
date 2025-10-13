export default function AnalyticsHome({ appointments, services, customers }) {
  // Compute KPIs by selected period with Expected vs Actual using targets from Firestore (via actions)
  return <AnalyticsPanel appointments={appointments} services={services} customers={customers} />;
}

import { useEffect, useMemo, useState } from 'react';
import * as actions from '@/firebaseActions';

const PERIODS = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
  { id: 'all', label: 'All time' },
];

function startOfWeek(d) { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - x.getDay()); return x; }
function endOfWeek(d) { const x = startOfWeek(d); x.setDate(x.getDate() + 7); return x; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth()+1, 1); }
function startOfYear(d) { return new Date(d.getFullYear(), 0, 1); }
function endOfYear(d) { return new Date(d.getFullYear()+1, 0, 1); }
function inRange(date, a, b) { return date >= a && date < b; }

function priceFor(appt, serviceMap) {
  if (typeof appt?.bookedPrice === 'number') return appt.bookedPrice;
  const svc = serviceMap.get(appt?.serviceId);
  return Number(svc?.price || 0);
}

function AnalyticsPanel({ appointments = [], services = [], customers = [] }) {
  const [period, setPeriod] = useState('day');
  const [targets, setTargets] = useState({ dailyTarget: 0, weeklyTarget: 0, monthlyTarget: 0, defaultCogsRate: 0 });

  useEffect(() => {
    (async () => {
      const t = await actions.getAnalyticsTargets();
      if (t) setTargets({
        dailyTarget: Number(t.dailyTarget || 0),
        weeklyTarget: Number(t.weeklyTarget || 0),
        monthlyTarget: Number(t.monthlyTarget || 0),
        defaultCogsRate: Number(t.defaultCogsRate || 0),
      });
    })();
  }, []);

  const serviceMap = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);

  const now = new Date();
  const windowRange = useMemo(() => {
    switch (period) {
      case 'day': return [new Date(now.getFullYear(), now.getMonth(), now.getDate()), new Date(now.getFullYear(), now.getMonth(), now.getDate()+1)];
      case 'week': return [startOfWeek(now), endOfWeek(now)];
      case 'month': return [startOfMonth(now), endOfMonth(now)];
      case 'year': return [startOfYear(now), endOfYear(now)];
      case 'all': default: return [new Date(0), new Date(now.getFullYear()+1, 0, 1)];
    }
  }, [period]);

  const filtered = useMemo(() => {
    const [a, b] = windowRange;
    return appointments.filter(appt => {
      const iso = appt?.date || appt?.start; if (!iso) return false;
      const d = new Date(iso);
      return inRange(d, a, b);
    });
  }, [appointments, windowRange]);

  const kpis = useMemo(() => {
    let revenue = 0, cancelledValue = 0;
    const uniqueCustomers = new Set();
    const monthlyOnly = appointments.filter(appt => {
      const iso = appt?.date || appt?.start; if (!iso) return false;
      const d = new Date(iso);
      const a = startOfMonth(now), b = endOfMonth(now);
      return inRange(d, a, b);
    });
    const serviceCount = new Map();

    for (const a of filtered) {
      const price = priceFor(a, serviceMap);
      if ((a.status || 'confirmed').toLowerCase().startsWith('cancel')) {
        cancelledValue += price;
      } else {
        revenue += price;
      }
      if (a.customerId) uniqueCustomers.add(String(a.customerId));
    }

    for (const a of monthlyOnly) {
      if ((a.status || 'confirmed').toLowerCase().startsWith('cancel')) continue;
      const key = a.serviceId || 'unknown';
      serviceCount.set(key, (serviceCount.get(key) || 0) + 1);
    }

    const expectedCogs = revenue * (Number(targets.defaultCogsRate || 0) / 100);

    const targetMap = {
      day: targets.dailyTarget || 0,
      week: targets.weeklyTarget || 0,
      month: targets.monthlyTarget || 0,
      year: 0,
      all: 0,
    };
    const expected = targetMap[period] || 0;
    const progress = expected > 0 ? Math.min(100, Math.round((revenue / expected) * 100)) : null;

    const top = Array.from(serviceCount.entries())
      .map(([sid, count]) => ({ id: sid, name: serviceMap.get(sid)?.name || 'Unknown', count }))
      .sort((a,b)=> b.count - a.count)
      .slice(0,5);

    const avgCustomerValue = uniqueCustomers.size > 0 ? revenue / uniqueCustomers.size : 0;

    return { revenue, cancelledValue, expectedCogs, expected, progress, avgCustomerValue, top, uniqueCount: uniqueCustomers.size };
  }, [filtered, appointments, serviceMap, targets, period]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {PERIODS.map(p => (
          <button key={p.id} onClick={()=>setPeriod(p.id)}
                  className={`rounded-lg px-3 py-1.5 border text-sm ${period===p.id ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 hover:bg-slate-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <KPI title={`Actual revenue (${PERIODS.find(x=>x.id===period)?.label})`} value={fmtCurrency(kpis.revenue)}>
          {kpis.progress != null && (
            <ProgressBar percent={kpis.progress} label={`Target ${fmtCurrency(kpis.expected)} • ${kpis.progress}%`} />
          )}
        </KPI>
        <KPI title="Avg customer value" value={fmtCurrency(kpis.avgCustomerValue)}>
          <div className="text-xs text-slate-500">{kpis.uniqueCount} unique customers</div>
        </KPI>
        <KPI title="Cancelled bookings value" value={fmtCurrency(kpis.cancelledValue)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <KPI title="Expected COGS" value={fmtCurrency(kpis.expectedCogs)}>
          <div className="text-xs text-slate-500">{Number(targets.defaultCogsRate||0)}% of revenue</div>
        </KPI>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-slate-500">Top services (this month)</div>
          <ul className="mt-2 space-y-2">
            {kpis.top.length === 0 && <li className="text-sm text-slate-500">No data</li>}
            {kpis.top.map(s => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{s.name}</span>
                <span className="text-slate-600">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function KPI({ title, value, children }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {children}
    </div>
  );
}
function ProgressBar({ percent, label }) {
  return (
    <div className="mt-2">
      <div className="h-2 rounded bg-slate-100 overflow-hidden">
        <div className="h-full bg-amber-500" style={{ width: `${percent}%` }} />
      </div>
      {label && <div className="mt-1 text-xs text-slate-600">{label}</div>}
    </div>
  );
}
function fmtCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    .format(Number(n||0));
}