import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import type { AnalyticsTargets, Appointment, Service } from '@buenobrows/shared/types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth, parseISO, differenceInDays, } from 'date-fns';

type Period = 'day' | 'week' | 'month' | 'year' | 'all';

export default function AnalyticsHome() {
  const [period, setPeriod] = useState<Period>('day');
  const [targets, setTargets] = useState<AnalyticsTargets | null>(null);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [appts, setAppts] = useState<Appointment[]>([]);

  // Get memoized Firebase instance
  const { db } = useFirebase();

  // Watch targets
  useEffect(() => {
    const ref = collection(db, 'settings');
    return onSnapshot(ref, (snap) => {
      const doc = snap.docs.find((d) => d.id === 'analyticsTargets');
      if (doc?.exists()) setTargets(doc.data() as any);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch services (for names & pricing fallback)
  useEffect(() => {
    const ref = collection(db, 'services');
    return onSnapshot(query(ref), (snap) => {
      const map: Record<string, Service> = {};
      snap.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
      setServices(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute range based on period
  const { fromISO, toISO } = useMemo(() => computeRange(period), [period]);

  // Watch appointments for the selected period
  useEffect(() => {
    const ref = collection(db, 'appointments');
    const qy = query(ref, where('start', '>=', fromISO), where('start', '<=', toISO), orderBy('start', 'asc'));
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setAppts(rows);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromISO, toISO]);

  // Metrics
  const { revenue, cancelledValue, uniqueCustomers, avgCustomerValue, expectedCogs, targetValue, progressPct, topServices } = useMemo(() => {
    const confirmed = appts.filter((a) => a.status === 'confirmed');
    const cancelled = appts.filter((a) => a.status === 'cancelled');

    const sum = (rows: Appointment[]) => rows.reduce((acc, a) => acc + (a.bookedPrice ?? services[a.serviceId]?.price ?? 0), 0);
    const revenue = sum(confirmed);
    const cancelledValue = sum(cancelled);

    const uniqueCustomers = new Set(confirmed.map((a) => a.customerId)).size || 0;
    const avgCustomerValue = uniqueCustomers ? revenue / uniqueCustomers : 0;

    const cogsRate = (targets?.defaultCogsRate ?? 0) / 100;
    const expectedCogs = revenue * cogsRate;

    const targetValue = computeTargetForPeriod(period, targets, fromISO, toISO);
    const progressPct = targetValue > 0 ? Math.min(100, Math.round((revenue / targetValue) * 100)) : 0;

    // Top services for the current month (ignore cancelled)
    const inThisMonth = confirmed.filter((a) => isSameMonth(parseISO(a.start), new Date()));
    const counts: Record<string, { name: string; count: number; value: number }> = {};
    for (const a of inThisMonth) {
      const s = services[a.serviceId];
      const name = s?.name || 'Unknown';
      const val = a.bookedPrice ?? s?.price ?? 0;
      counts[a.serviceId] ||= { name, count: 0, value: 0 };
      counts[a.serviceId].count += 1;
      counts[a.serviceId].value += val;
    }
    const topServices = Object.values(counts).sort((a, b) => b.value - a.value).slice(0, 5);

    return { revenue, cancelledValue, uniqueCustomers, avgCustomerValue, expectedCogs, targetValue, progressPct, topServices };
  }, [appts, services, targets, period, fromISO, toISO]);

  return (
    <div className="grid gap-6">
      {/* Period tabs */}
      <div className="flex flex-wrap gap-2">
        {(['day','week','month','year','all'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md border text-sm ${p===period ? 'bg-terracotta text-white border-terracotta' : 'bg-white hover:bg-cream'}`}>
            {labelFor(p)}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Revenue" value={fmtCurrency(revenue)} subtitle={formatRange(fromISO, toISO)} />
        <KPI title="Target vs Actual" value={`${progressPct}%`} subtitle={targets ? `Target ${fmtCurrency(targetValue)}` : 'Set targets in Settings'}>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-terracotta" style={{ width: `${progressPct}%` }} />
          </div>
        </KPI>
        <KPI title="Avg customer value" value={fmtCurrency(avgCustomerValue)} subtitle={`${uniqueCustomers} unique customers`} />
        <KPI title="Cancelled value" value={fmtCurrency(cancelledValue)} subtitle="Excluded from revenue" />
        <KPI title="Expected COGS" value={fmtCurrency(expectedCogs)} subtitle={`${targets?.defaultCogsRate ?? 0}% of revenue`} className="sm:col-span-2 lg:col-span-1" />
      </section>

      {/* Top services this month */}
      <section className="bg-white rounded-xl shadow-soft p-4">
        <h3 className="font-serif text-xl mb-2">Top services this month</h3>
        {!topServices.length && <div className="text-slate-500 text-sm">No data yet.</div>}
        <ul className="divide-y">
          {topServices.map((s, i) => (
            <li key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-500">{s.count} bookings</div>
              </div>
              <div className="font-semibold">{fmtCurrency(s.value)}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KPI({ title, value, subtitle, children, className="" }: { title: string; value: string; subtitle?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-soft p-4 ${className}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function labelFor(p: Period) {
  return p === 'day' ? 'Day' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'year' ? 'Year' : 'All';
}

function computeRange(period: Period) {
  const now = new Date();
  let from: Date, to: Date;
  switch (period) {
    case 'day':
      from = startOfDay(now); to = endOfDay(now); break;
    case 'week':
      from = startOfWeek(now, { weekStartsOn: 0 }); to = endOfWeek(now, { weekStartsOn: 0 }); break;
    case 'month':
      from = startOfMonth(now); to = endOfMonth(now); break;
    case 'year':
      from = startOfYear(now); to = endOfYear(now); break;
    case 'all':
    default:
      // show last 365 days as "All" by default (tunable)
      from = startOfDay(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
      to = endOfDay(now);
  }
  return { fromISO: from.toISOString(), toISO: to.toISOString(), from, to } as any;
}

function computeTargetForPeriod(period: Period, t: AnalyticsTargets | null, fromISO: string, toISO: string) {
  if (!t) return 0;
  if (period === 'day') return t.dailyTarget;
  if (period === 'week') return t.weeklyTarget;
  if (period === 'month') return t.monthlyTarget;
  if (period === 'year') return t.monthlyTarget * 12; // simple approx
  // All = prorate daily target across range length
  const days = Math.max(1, differenceInDays(new Date(toISO), new Date(fromISO)) + 1);
  return t.dailyTarget * days;
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
}

function formatRange(fromISO: string, toISO: string) {
  const f = new Date(fromISO); const t = new Date(toISO);
  const sameDay = startOfDay(f).getTime() === startOfDay(t).getTime();
  if (sameDay) return format(f, 'PP');
  return `${format(f, 'PP')} – ${format(t, 'PP')}`;
}
