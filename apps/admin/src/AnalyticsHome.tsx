import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { onSnapshot, collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { AnalyticsTargets, Appointment, Service, BusinessHours } from '@buenobrows/shared/types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth, parseISO, differenceInDays, } from 'date-fns';
import { formatInBusinessTZ, formatAppointmentTimeRange, getBusinessTimezone } from '@buenobrows/shared/timezoneUtils';
import { watchBusinessHours } from '@buenobrows/shared/firestoreActions';
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
  const [growthModeKpiOrder, setGrowthModeKpiOrder] = useState<string[]>([]); // Store the order of Growth Mode KPIs
  const [detailedModeKpiOrder, setDetailedModeKpiOrder] = useState<string[]>([]); // Store the order of Detailed Mode KPIs
  const [kpiOrdersLoaded, setKpiOrdersLoaded] = useState(false); // Track if KPI orders have been loaded
  const [sectionOrder, setSectionOrder] = useState<string[]>([]); // Store the order of sections
  const [bh, setBh] = useState<BusinessHours | null>(null); // Business hours for timezone-aware formatting

  // Get memoized Firebase instance
  const { db } = useFirebase();

  // Load business hours for timezone-aware formatting
  useEffect(() => {
    if (!db) return;
    const unsubscribe = watchBusinessHours(db, setBh);
    return unsubscribe;
  }, [db]);

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

  // Load KPI orders from localStorage
  useEffect(() => {
    const savedGrowth = localStorage.getItem('growthModeKpiOrder');
    const savedDetailed = localStorage.getItem('detailedModeKpiOrder');
    
    console.log('Loading Growth Mode KPI order from localStorage:', savedGrowth);
    console.log('Loading Detailed Mode KPI order from localStorage:', savedDetailed);
    
    if (savedGrowth) {
      try {
        const parsed = JSON.parse(savedGrowth);
        console.log('Parsed Growth Mode KPI order:', parsed);
        setGrowthModeKpiOrder(parsed);
      } catch (e) {
        console.error('Failed to parse Growth Mode KPI order:', e);
      }
    }
    
    if (savedDetailed) {
      try {
        const parsed = JSON.parse(savedDetailed);
        console.log('Parsed Detailed Mode KPI order:', parsed);
        setDetailedModeKpiOrder(parsed);
      } catch (e) {
        console.error('Failed to parse Detailed Mode KPI order:', e);
      }
    }
    
    // Mark as loaded after attempting to load both
    setKpiOrdersLoaded(true);
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

  // Debug KPI order changes
  useEffect(() => {
    console.log('Growth Mode KPI order changed:', growthModeKpiOrder);
  }, [growthModeKpiOrder]);
  
  useEffect(() => {
    console.log('Detailed Mode KPI order changed:', detailedModeKpiOrder);
  }, [detailedModeKpiOrder]);

  // Save KPI order to localStorage based on current mode
  const saveKpiOrder = (order: string[]) => {
    console.log('Saving KPI order for mode:', growthMode ? 'Growth' : 'Detailed', order);
    
    if (growthMode) {
      setGrowthModeKpiOrder(order);
      localStorage.setItem('growthModeKpiOrder', JSON.stringify(order));
      console.log('Growth Mode KPI order saved to localStorage');
    } else {
      setDetailedModeKpiOrder(order);
      localStorage.setItem('detailedModeKpiOrder', JSON.stringify(order));
      console.log('Detailed Mode KPI order saved to localStorage');
    }
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
    if (!db) return;
    const ref = collection(db, 'appointments');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
    console.log('📊 [ANALYTICS] Querying all appointments from:', thirtyDaysAgoISO);
    const qy = query(ref, where('start', '>=', thirtyDaysAgoISO), orderBy('start', 'asc'));
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      console.log(`📊 [ANALYTICS] Loaded ${rows.length} appointments (last 30 days + future)`);
      setAllAppts(rows);
    }, (error) => {
      console.error('❌ [ANALYTICS] Error loading all appointments:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  // Compute range based on period
  const { fromISO, toISO } = useMemo(() => computeRange(period), [period]);

  // Watch appointments for the selected period (for metrics only)
  useEffect(() => {
    if (!db) return;
    const ref = collection(db, 'appointments');
    console.log(`📊 [ANALYTICS] Querying appointments for period: ${fromISO} to ${toISO}`);
    const qy = query(ref, where('start', '>=', fromISO), where('start', '<=', toISO), orderBy('start', 'asc'));
    return onSnapshot(qy, (snap) => {
      const rows: Appointment[] = [];
      let earliestDate: string | null = null;
      let latestDate: string | null = null;
      snap.forEach((d) => {
        const data = d.data();
        const appt = { id: d.id, ...(data as any) };
        rows.push(appt);
        if (appt.start) {
          if (!earliestDate || appt.start < earliestDate) earliestDate = appt.start;
          if (!latestDate || appt.start > latestDate) latestDate = appt.start;
        }
      });
      console.log(`📊 [ANALYTICS] Loaded ${rows.length} appointments for selected period`);
      if (earliestDate && latestDate) {
        console.log(`📊 [ANALYTICS] Date range in results: ${earliestDate} to ${latestDate}`);
      }
      
      // Check if query was limited or had issues
      if (snap.metadata.fromCache) {
        console.warn('⚠️ [ANALYTICS] Query results came from cache');
      }
      
      // Check for potential query issues
      if (period === 'all' && rows.length > 0) {
        // Verify we're getting appointments from the full range
        const has2025Data = rows.some(a => a.start && a.start.startsWith('2025'));
        const has2024Data = rows.some(a => a.start && a.start.startsWith('2024'));
        if (!has2025Data && !has2024Data) {
          console.warn('⚠️ [ANALYTICS] "All" query returned results but no 2024/2025 data - possible date range issue');
        }
      }
      
      // Check if we got fewer results than expected for "All"
      if (period === 'all' && rows.length < 40) {
        console.warn(`⚠️ [ANALYTICS] "All" period returned only ${rows.length} appointments - this seems low. Check if query is complete.`);
      }
      
      setAppts(rows);
    }, (error: any) => {
      console.error('❌ [ANALYTICS] Error loading period appointments:', error);
      console.error('❌ [ANALYTICS] Error code:', error.code);
      console.error('❌ [ANALYTICS] Error message:', error.message);
      // Set empty array on error to prevent stale data
      setAppts([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, fromISO, toISO, period]);

  // Current year metrics (for "Next Steps" - always shows current business stage)
  const currentYearMetrics = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Filter allAppts for current calendar year only
    const currentYearAppts = allAppts.filter(a => {
      if (!a.start) return false;
      const apptDate = parseISO(a.start);
      return apptDate >= yearStart && apptDate <= yearEnd;
    });
    
    const confirmed = currentYearAppts.filter((a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed');
    const uniqueCustomers = new Set(confirmed.map((a) => a.customerId)).size || 0;
    
    const monthlyBreakEven = 34; // Based on your overhead analysis
    const yearlyBreakEven = monthlyBreakEven * 12; // 408 clients per year
    const servicesToBreakEven = Math.max(0, yearlyBreakEven - uniqueCustomers);
    
    // Calculate how many months into the year we are
    const currentMonth = now.getMonth() + 1; // 1-12
    const expectedByNow = monthlyBreakEven * currentMonth; // Expected clients by this month (34 per month)
    
    // Determine focus based on progress
    const progressVsExpected = uniqueCustomers - expectedByNow;
    const progressPercent = (uniqueCustomers / yearlyBreakEven) * 100;
    const monthsRemaining = 12 - currentMonth;
    const neededPerMonth = servicesToBreakEven / Math.max(1, monthsRemaining);
    
    let focus: string;
    let focusReason: string;
    
    if (uniqueCustomers >= yearlyBreakEven) {
      focus = "Scaling & Optimization";
      focusReason = "Goal achieved! Focus on growth and efficiency";
    } else if (progressPercent >= 90) {
      focus = "Final Push";
      focusReason = "Almost there! Push to reach your goal";
    } else if (progressVsExpected >= 10) {
      focus = "Customer Retention";
      focusReason = "Ahead of schedule! Focus on keeping customers";
    } else if (progressVsExpected >= -5) {
      focus = "Steady Growth";
      focusReason = "On track! Maintain momentum";
    } else if (neededPerMonth <= monthlyBreakEven) {
      focus = "Customer Acquisition";
      focusReason = "Need to pick up pace to reach goal";
    } else {
      focus = "Urgent: Customer Acquisition";
      focusReason = "Significantly behind - need aggressive growth";
    }
    
    return {
      uniqueCustomers,
      servicesToBreakEven,
      yearlyBreakEven,
      expectedByNow,
      currentMonth,
      focus,
      focusReason,
      progressVsExpected,
      progressPercent,
      neededPerMonth
    };
  }, [allAppts]);

  // Metrics
  const { revenue, cancelledValue, uniqueCustomers, avgCustomerValue, expectedCogs, targetValue, progressPct, topServices, netProfit, grossProfit, margin, breakEvenStatus, growthMetrics } = useMemo(() => {
    const confirmed = appts.filter((a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'completed');
    // Exclude appointments cancelled for edits from cancellation metrics
    const cancelled = appts.filter((a) => a.status === 'cancelled' && !a.cancelledForEdit);

    console.log(`📊 [ANALYTICS] Calculating metrics from ${appts.length} appointments:`);
    console.log(`  - Confirmed/Pending/Completed: ${confirmed.length}`);
    console.log(`  - Cancelled: ${cancelled.length}`);

    const sum = (rows: Appointment[]) => rows.reduce((acc, a) => acc + (a.totalPrice ?? a.bookedPrice ?? services[a.serviceId]?.price ?? 0), 0);
    const revenue = sum(confirmed);
    const cancelledValue = sum(cancelled);

    const uniqueCustomers = new Set(confirmed.map((a) => a.customerId)).size || 0;
    const avgCustomerValue = uniqueCustomers ? revenue / uniqueCustomers : 0;
    
    console.log(`📊 [ANALYTICS] Metrics calculated:`);
    console.log(`  - Revenue: $${revenue.toFixed(2)}`);
    console.log(`  - Unique customers: ${uniqueCustomers}`);
    console.log(`  - Avg customer value: $${avgCustomerValue.toFixed(2)}`);

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

    // Growth-focused metrics (for current period display)
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


  // Create the items arrays outside of JSX for cleaner code
  const growthModeItems = [
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
                    {format(parseISO(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration, getBusinessTimezone(bh))}
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
                    {format(parseISO(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration, getBusinessTimezone(bh))}
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
  ];

  const detailedModeItems = [
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
    
    // Appointment Cards (same as growth mode)
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
                    {format(parseISO(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration, getBusinessTimezone(bh))}
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
                    {format(parseISO(a.start), 'MMM d')}: {formatAppointmentTimeRange(a.start, a.duration, getBusinessTimezone(bh))}
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
  ];

  // Sort the items based on the current mode's order
  const sortedItems = (growthMode ? growthModeItems : detailedModeItems).sort((a, b) => {
    const currentOrder = growthMode ? growthModeKpiOrder : detailedModeKpiOrder;
    const aIndex = currentOrder.indexOf(a.id);
    const bIndex = currentOrder.indexOf(b.id);
    console.log(`Sorting ${growthMode ? 'Growth' : 'Detailed'} Mode: ${a.id} (index: ${aIndex}) vs ${b.id} (index: ${bIndex})`);
    console.log('Current order array:', currentOrder);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });


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
      {kpiOrdersLoaded && (
        <DraggableKPIGrid
          key={`kpi-grid-${growthMode ? 'growth' : 'detailed'}`}
          items={sortedItems}
          onReorder={(items) => {
            console.log('onReorder called with items:', items);
            const newOrder = items.map(item => item.id);
            console.log('New order:', newOrder);
            saveKpiOrder(newOrder);
          }}
          colorAccessibility={colorAccessibility}
        />
      )}

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
                    <span className="font-semibold">{currentYearMetrics.focus}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {currentYearMetrics.focusReason}
                  </div>
                  <div className="flex justify-between">
                    <span>Goal this year:</span>
                    <span className="font-semibold">{currentYearMetrics.servicesToBreakEven} more clients</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current progress ({new Date().getFullYear()}):</span>
                    <span className="font-semibold">{currentYearMetrics.uniqueCustomers}/{currentYearMetrics.yearlyBreakEven} clients</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Expected by now:</span>
                    <span className={currentYearMetrics.progressVsExpected >= 0 ? 'text-green-600' : 'text-orange-600'}>
                      {currentYearMetrics.expectedByNow} clients 
                      {currentYearMetrics.progressVsExpected !== 0 && (
                        <span> ({currentYearMetrics.progressVsExpected > 0 ? '+' : ''}{currentYearMetrics.progressVsExpected})</span>
                      )}
                    </span>
                  </div>
                  {currentYearMetrics.servicesToBreakEven > 0 && (
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Needed per month:</span>
                      <span>{Math.ceil(currentYearMetrics.neededPerMonth)} clients/month</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-3 pt-3 border-t">
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
                <h4 className="font-semibold mb-3">Revenue Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed appointments:</span>
                    <span className="font-semibold">{appts.filter(a => a.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confirmed/Pending:</span>
                    <span>{appts.filter(a => a.status === 'confirmed' || a.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total revenue:</span>
                    <span className="font-semibold text-green-600">{fmtCurrency(revenue)}</span>
                  </div>
                  {cancelledValue > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Cancelled (excluded):</span>
                      <span>{fmtCurrency(cancelledValue)}</span>
                    </div>
                  )}
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

              {period !== 'all' && targetValue > 0 ? (
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
              ) : (
                <div>
                  <h4 className="font-semibold mb-3">Period Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span className="font-semibold capitalize">{period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total appointments:</span>
                      <span>{appts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{appts.filter(a => a.status === 'completed').length}</span>
                    </div>
                    {period === 'all' && (
                      <div className="text-xs text-slate-500 mt-2 pt-2 border-t">
                        Targets are not applicable for the "All" period. Switch to a specific period (Day, Week, Month, Year) to see target progress.
                      </div>
                    )}
                  </div>
                </div>
              )}

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
      // "All" means ALL data - use a date far in the past to get everything
      // Using 2020-01-01 as a safe starting point (before most businesses started)
      // Use a date far in the future (2099) to include all future appointments
      from = new Date('2020-01-01T00:00:00.000Z');
      to = new Date('2099-12-31T23:59:59.999Z');
      console.log(`📊 [ANALYTICS] "All" period: from ${from.toISOString()} to ${to.toISOString()}`);
      break;
  }
  const result = { fromISO: from.toISOString(), toISO: to.toISOString(), from, to };
  console.log(`📊 [ANALYTICS] Period "${period}": ${result.fromISO} to ${result.toISO}`);
  return result as any;
}

function computeTargetForPeriod(period: Period, t: AnalyticsTargets | null, fromISO: string, toISO: string) {
  if (!t) return 0;
  if (period === 'day') return t.dailyTarget;
  if (period === 'week') return t.weeklyTarget;
  if (period === 'month') return t.monthlyTarget;
  if (period === 'year') return t.monthlyTarget * 12; // simple approx
  // "All" period doesn't have a meaningful target - return 0 to hide target progress
  if (period === 'all') return 0;
  // Fallback: prorate daily target across range length
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
