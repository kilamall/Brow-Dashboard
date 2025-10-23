import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { AnalyticsTargets, Appointment, Service } from '@buenobrows/shared/types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth, parseISO, differenceInDays, } from 'date-fns';
import AppointmentDetailModal from '@/components/AppointmentDetailModal';
import EditAppointmentModal from '@/components/EditAppointmentModal';
import DraggableKPIGrid from '@/components/DraggableKPIGrid';
import DraggableSections from '@/components/DraggableSections';

type Period = 'day' | 'week' | 'month' | 'year' | 'all';

export default function AnalyticsHome() {
  const [period, setPeriod] = useState<Period>('day');
  const [targets, setTargets] = useState<AnalyticsTargets | null>(null);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [allAppts, setAllAppts] = useState<Appointment[]>([]); // For displaying appointments list
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [colorAccessibility, setColorAccessibility] = useState(false);
  const [growthMode, setGrowthMode] = useState(true); // Default to Growth Mode
  const [kpiOrder, setKpiOrder] = useState<string[]>([]); // Store the order of KPIs
  const [sectionOrder, setSectionOrder] = useState<string[]>([]); // Store the order of sections

  // Get memoized Firebase instance
  const { db, app } = useFirebase();
  const functions = getFunctions(app, 'us-central1');

  // Watch targets
  useEffect(() => {
    const ref = collection(db, 'settings');
    return onSnapshot(ref, (snap) => {
      const doc = snap.docs.find((d) => d.id === 'analyticsTargets');
      if (doc?.exists()) setTargets(doc.data() as any);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load color accessibility setting
  useEffect(() => {
    const saved = localStorage.getItem('colorAccessibility');
    if (saved) setColorAccessibility(JSON.parse(saved));
  }, []);

  // Load growth mode setting
  useEffect(() => {
    const saved = localStorage.getItem('growthMode');
    if (saved !== null) setGrowthMode(JSON.parse(saved));
  }, []);

  // Load KPI order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kpiOrder');
    if (saved) {
      try {
        setKpiOrder(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse KPI order:', e);
      }
    }
  }, []);

  // Load color accessibility setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colorAccessibility');
    if (saved) {
      try {
        setColorAccessibility(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse color accessibility setting:', e);
      }
    }
  }, []);

  // Load section order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sectionOrder');
    if (saved) {
      try {
        setSectionOrder(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse section order:', e);
      }
    }
  }, []);

  // Save KPI order to localStorage
  const saveKpiOrder = (order: string[]) => {
    setKpiOrder(order);
    localStorage.setItem('kpiOrder', JSON.stringify(order));
  };

  // Save section order to localStorage
  const saveSectionOrder = (order: string[]) => {
    setSectionOrder(order);
    localStorage.setItem('sectionOrder', JSON.stringify(order));
  };

  // Save color accessibility setting
  const toggleColorAccessibility = () => {
    const newValue = !colorAccessibility;
    setColorAccessibility(newValue);
    localStorage.setItem('colorAccessibility', JSON.stringify(newValue));
  };

  // Save growth mode setting
  const toggleGrowthMode = () => {
    const newValue = !growthMode;
    setGrowthMode(newValue);
    localStorage.setItem('growthMode', JSON.stringify(newValue));
  };

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

  // Watch ALL appointments (past 30 days + future) for the appointment lists
  useEffect(() => {
    const ref = collection(db, 'appointments');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const qy = query(ref, where('start', '>=', thirtyDaysAgo.toISOString()), orderBy('start', 'asc'));
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setAllAppts(rows);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute range based on period
  const { fromISO, toISO } = useMemo(() => computeRange(period), [period]);

  // Watch appointments for the selected period (for metrics only)
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
  const { revenue, cancelledValue, uniqueCustomers, avgCustomerValue, expectedCogs, targetValue, progressPct, topServices, netProfit, grossProfit, margin, breakEvenStatus, growthMetrics } = useMemo(() => {
    const confirmed = appts.filter((a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed');
    // Exclude appointments cancelled for edits from cancellation metrics
    const cancelled = appts.filter((a) => a.status === 'cancelled' && !a.cancelledForEdit);

    const sum = (rows: Appointment[]) => rows.reduce((acc, a) => acc + (a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0), 0);
    const revenue = sum(confirmed);
    const cancelledValue = sum(cancelled);

    const uniqueCustomers = new Set(confirmed.map((a) => a.customerId)).size || 0;
    const avgCustomerValue = uniqueCustomers ? revenue / uniqueCustomers : 0;

    const cogsRate = (targets?.defaultCogsRate ?? 0) / 100;
    const expectedCogs = revenue * cogsRate;
    const netProfit = revenue - expectedCogs;
    const grossProfit = revenue; // Assuming no direct costs for services
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const targetValue = computeTargetForPeriod(period, targets, fromISO, toISO);
    const progressPct = targetValue > 0 ? Math.min(100, Math.round((revenue / targetValue) * 100)) : 0;

    // Break-even calculation
    const breakEvenNeeded = expectedCogs > 0 ? Math.ceil(expectedCogs / avgCustomerValue) : 0;
    const breakEvenStatus = {
      isProfitable: netProfit > 0,
      needed: breakEvenNeeded,
      above: netProfit > 0 ? Math.floor(netProfit / avgCustomerValue) : 0
    };

    // Growth-focused metrics
    const monthlyBreakEven = 34; // Based on your overhead analysis
    const servicesToBreakEven = Math.max(0, monthlyBreakEven - uniqueCustomers);
    const profitPerService = avgCustomerValue > 0 ? avgCustomerValue - (expectedCogs / Math.max(1, uniqueCustomers)) : 0;
    const weeksToBreakEven = servicesToBreakEven > 0 ? Math.ceil(servicesToBreakEven / Math.max(1, uniqueCustomers)) : 0;
    
    const growthMetrics = {
      servicesCompleted: confirmed.length,
      servicesToBreakEven,
      profitPerService,
      weeksToBreakEven,
      monthlyBreakEven,
      isOnTrack: uniqueCustomers > 0,
      growthPhase: uniqueCustomers < monthlyBreakEven
    };

    // Top services for the current month (ignore cancelled)
    const inThisMonth = confirmed.filter((a) => isSameMonth(parseISO(a.start), new Date()));
    const counts: Record<string, { name: string; count: number; value: number }> = {};
    for (const a of inThisMonth) {
      const s = services[a.serviceId];
      const name = s?.name || 'Unknown';
      const val = a.totalPrice ?? a.bookedPrice ?? s?.price ?? 0;
      counts[a.serviceId] ||= { name, count: 0, value: 0 };
      counts[a.serviceId].count += 1;
      counts[a.serviceId].value += val;
    }
    const topServices = Object.values(counts).sort((a, b) => b.value - a.value).slice(0, 5);

    return { revenue, cancelledValue, uniqueCustomers, avgCustomerValue, expectedCogs, targetValue, progressPct, topServices, netProfit, grossProfit, margin, breakEvenStatus, growthMetrics };
  }, [appts, services, targets, period, fromISO, toISO]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="grid gap-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['day','week','month','year','all'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${p===period ? 'bg-gradient-to-r from-terracotta to-orange-500 text-white border-terracotta shadow-lg' : 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
              {labelFor(p)}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Growth Mode Toggle */}
          <button 
            onClick={toggleGrowthMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
              growthMode 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-lg hover:shadow-xl' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:shadow-md'
            }`}
          >
            {growthMode ? '🌱 Growth Mode' : '📊 Detailed View'}
          </button>

          {/* Color Accessibility Toggle */}
          <button 
            onClick={toggleColorAccessibility}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
              colorAccessibility 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-600 shadow-lg hover:shadow-xl' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            {colorAccessibility ? '🎨 Colors Off' : '🎨 Colors On'}
          </button>

        </div>
        </div>
      </div>

      {/* Unified Dashboard - All Cards Draggable Together */}
      <DraggableKPIGrid
        items={growthMode ? [
          // Growth Mode Cards
          { id: 'services-completed', title: "Services Completed", value: `${growthMetrics.servicesCompleted}`, subtitle: "This period" },
          { id: 'building-momentum', title: "Building Momentum", value: "🌱 Growth Phase", subtitle: `${growthMetrics.servicesToBreakEven} more to monthly break-even` },
          { id: 'value-per-service', title: "Value per Service", value: fmtCurrency(avgCustomerValue), subtitle: `${uniqueCustomers} clients served` },
          {
            id: 'progress-to-goal',
            title: "Progress to Goal",
            value: `${Math.round((uniqueCustomers / growthMetrics.monthlyBreakEven) * 100)}%`,
            subtitle: `${uniqueCustomers}/${growthMetrics.monthlyBreakEven} monthly target`,
            children: (
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${colorAccessibility ? 'bg-gray-600' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (uniqueCustomers / growthMetrics.monthlyBreakEven) * 100)}%` }} />
              </div>
            )
          },
          { id: 'revenue-generated', title: "Revenue Generated", value: fmtCurrency(revenue), subtitle: formatRange(fromISO, toISO) },
          { id: 'growth-investment', title: "Growth Investment", value: fmtCurrency(Math.abs(netProfit)), subtitle: "Building your business" },
          { id: 'break-even-timeline', title: "Break-Even Timeline", value: growthMetrics.weeksToBreakEven > 0 ? `${growthMetrics.weeksToBreakEven} weeks` : "🎉 Achieved!", subtitle: "At current pace" },
          { id: 'switch-to-detailed', title: "Switch to Detailed", value: "📊 View Details", subtitle: "Click for financial breakdown", className: "cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-terracotta/30 hover:border-terracotta/60", onClick: () => setShowBreakdown(!showBreakdown) },
          
          // Appointment Cards
          {
            id: 'upcoming-appointments',
            title: "Upcoming Appointments",
            value: allAppts.filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) > new Date()).length,
            subtitle: "Scheduled appointments",
            children: (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAppts
                  .filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) > new Date())
                  .slice(0, 10)
                  .map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {format(parseISO(a.start), 'MMM d')}: {format(parseISO(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                        {a.customerName && (
                          <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                        )}
                        {a.status === 'pending' && (
                          <div className="text-xs text-orange-600 font-medium">Pending Confirmation</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-terracotta">
                        {fmtCurrency(a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0)}
                      </div>
                    </div>
                  ))}
              </div>
            )
          },
          {
            id: 'past-appointments',
            title: "Recent Past Appointments",
            value: allAppts.filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) <= new Date()).length,
            subtitle: "Completed appointments",
            children: (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAppts
                  .filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) <= new Date())
                  .reverse()
                  .slice(0, 10)
                  .map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {format(parseISO(a.start), 'MMM d')}: {format(parseISO(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                        {a.customerName && (
                          <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                        )}
                        {a.status === 'pending' && (
                          <div className="text-xs text-orange-600 font-medium">Pending Confirmation</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-terracotta">
                        {fmtCurrency(a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0)}
                      </div>
                    </div>
                  ))}
              </div>
            )
          },
          {
            id: 'top-services',
            title: "Top Services This Month",
            value: topServices.length,
            subtitle: "Most booked services",
            children: (
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
            )
          }
        ] : [
          // Detailed Mode Cards
          { id: 'revenue', title: "Revenue", value: fmtCurrency(revenue), subtitle: formatRange(fromISO, toISO) },
          {
            id: 'target-vs-actual',
            title: "Target vs Actual",
            value: `${progressPct}%`,
            subtitle: targets ? `Target ${fmtCurrency(targetValue)}` : 'Set targets in Settings',
            children: (
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${colorAccessibility ? 'bg-gray-600' : 'bg-terracotta'}`} style={{ width: `${progressPct}%` }} />
              </div>
            )
          },
          { id: 'avg-customer-value', title: "Avg customer value", value: fmtCurrency(avgCustomerValue), subtitle: `${uniqueCustomers} unique customers` },
          { id: 'cancelled-value', title: "Cancelled value", value: fmtCurrency(cancelledValue), subtitle: "Excluded from revenue" },
          { id: 'expected-cogs', title: "Expected COGS", value: fmtCurrency(expectedCogs), subtitle: `${targets?.defaultCogsRate ?? 0}% of revenue` },
          { id: 'net-profit', title: "Net Profit", value: fmtCurrency(netProfit), subtitle: `${margin.toFixed(1)}% margin` },
          { id: 'break-even-status', title: "Break-Even Status", value: breakEvenStatus.isProfitable ? "✓ Profitable" : "⚠ Needs Work", subtitle: breakEvenStatus.isProfitable ? `${breakEvenStatus.above} above B/E` : `${breakEvenStatus.needed} needed` },
          { id: 'gross-profit', title: "Gross Profit", value: fmtCurrency(grossProfit), subtitle: "100.0% gross margin" },
          { id: 'detailed-breakdown', title: "Detailed Breakdown", value: "📊 Show Details", subtitle: "Click to expand", className: "cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-terracotta/30 hover:border-terracotta/60", onClick: () => setShowBreakdown(!showBreakdown) },
          
          // Appointment Cards
          {
            id: 'upcoming-appointments',
            title: "Upcoming Appointments",
            value: allAppts.filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) > new Date()).length,
            subtitle: "Scheduled appointments",
            children: (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAppts
                  .filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) > new Date())
                  .slice(0, 10)
                  .map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {format(parseISO(a.start), 'MMM d')}: {format(parseISO(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                        {a.customerName && (
                          <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                        )}
                        {a.status === 'pending' && (
                          <div className="text-xs text-orange-600 font-medium">Pending Confirmation</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-terracotta">
                        {fmtCurrency(a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0)}
                      </div>
                    </div>
                  ))}
              </div>
            )
          },
          {
            id: 'past-appointments',
            title: "Recent Past Appointments",
            value: allAppts.filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) <= new Date()).length,
            subtitle: "Completed appointments",
            children: (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAppts
                  .filter(a => (a.status === 'confirmed' || a.status === 'pending') && parseISO(a.start) <= new Date())
                  .reverse()
                  .slice(0, 10)
                  .map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {format(parseISO(a.start), 'MMM d')}: {format(parseISO(a.start), 'h:mm a')} - {format(new Date(new Date(a.start).getTime() + a.duration * 60000), 'h:mm a')}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{services[a.serviceId]?.name || 'Service'}</div>
                        {a.customerName && (
                          <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                        )}
                        {a.status === 'pending' && (
                          <div className="text-xs text-orange-600 font-medium">Pending Confirmation</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-terracotta">
                        {fmtCurrency(a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0)}
                      </div>
                    </div>
                  ))}
              </div>
            )
          },
          {
            id: 'top-services',
            title: "Top Services This Month",
            value: topServices.length,
            subtitle: "Most booked services",
            children: (
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
            )
          }
        ].sort((a, b) => {
          const aIndex = kpiOrder.indexOf(a.id);
          const bIndex = kpiOrder.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        })}
        onReorder={(items) => saveKpiOrder(items.map(item => item.id))}
        colorAccessibility={colorAccessibility}
      />

      {/* Detailed Analytics Breakdown */}
      {showBreakdown && (
        <section className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-serif text-xl mb-4">
            {growthMode ? "🌱 Growth Journey Details" : "📊 Analytics Breakdown"}
          </h3>
          
          {growthMode ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Your Progress</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Services completed:</span>
                    <span className="font-semibold">{growthMetrics.servicesCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue generated:</span>
                    <span className="font-semibold">{fmtCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly progress:</span>
                    <span className="font-semibold">{uniqueCustomers}/{growthMetrics.monthlyBreakEven} clients</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Growth Path</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Services to break-even:</span>
                    <span className="font-semibold">{growthMetrics.servicesToBreakEven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline at current pace:</span>
                    <span className="font-semibold">{growthMetrics.weeksToBreakEven > 0 ? `${growthMetrics.weeksToBreakEven} weeks` : "🎉 Achieved!"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value per service:</span>
                    <span className="font-semibold">{fmtCurrency(avgCustomerValue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Business Investment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Growth investment:</span>
                    <span className="font-semibold">{fmtCurrency(Math.abs(netProfit))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Building toward:</span>
                    <span className="font-semibold">Monthly profitability</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phase:</span>
                    <span className="font-semibold">🌱 Growth & Development</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Next Steps</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Focus on:</span>
                    <span className="font-semibold">Customer acquisition</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal this month:</span>
                    <span className="font-semibold">{growthMetrics.servicesToBreakEven} more clients</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Switch to detailed view:</span>
                    <button 
                      onClick={() => setGrowthMode(false)}
                      className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      📊 See Financial Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Revenue Calculation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confirmed appointments:</span>
                    <span>{appts.filter(a => a.status === 'confirmed' || a.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total revenue:</span>
                    <span className="font-semibold">{fmtCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled value (excluded):</span>
                    <span>{fmtCurrency(cancelledValue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Profit & Margin</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gross profit:</span>
                    <span>{fmtCurrency(grossProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected COGS ({targets?.defaultCogsRate ?? 0}%):</span>
                    <span>{fmtCurrency(expectedCogs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net profit:</span>
                    <span className="font-semibold">{fmtCurrency(netProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net margin:</span>
                    <span className="font-semibold">{margin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Target Progress</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Target for {period}:</span>
                    <span>{fmtCurrency(targetValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span className="font-semibold">{progressPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining to target:</span>
                    <span>{fmtCurrency(Math.max(0, targetValue - revenue))}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Customer Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Unique customers:</span>
                    <span>{uniqueCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average value:</span>
                    <span className="font-semibold">{fmtCurrency(avgCustomerValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break-even needed:</span>
                    <span>{breakEvenStatus.needed} appointments</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}


      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        service={selectedAppointment ? services[selectedAppointment.serviceId] : null}
        onClose={() => setSelectedAppointment(null)}
        onEdit={() => {
          setEditingAppointment(selectedAppointment);
          setSelectedAppointment(null);
        }}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        appointment={editingAppointment}
        service={editingAppointment ? services[editingAppointment.serviceId] : null}
        onClose={() => setEditingAppointment(null)}
        onUpdated={() => {
          setEditingAppointment(null);
          // Data will auto-refresh from Firestore listener
        }}
      />

              </div>
    </div>
  );
}

function KPI({ title, value, subtitle, children, className="", onClick }: { title: string; value: string; subtitle?: string; children?: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bg-white rounded-xl shadow-soft p-4 ${onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`} onClick={onClick}>
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
