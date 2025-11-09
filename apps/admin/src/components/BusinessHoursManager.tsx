import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import {
  watchDayClosures,
  watchSpecialHours,
  createDayClosure,
  deleteDayClosure,
  setSpecialHours as saveSpecialHours,
  deleteSpecialHours,
  watchBusinessHours,
  setBusinessHours
} from '@buenobrows/shared/firestoreActions';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import type { DayClosure, SpecialHours, BusinessHours } from '@buenobrows/shared/types';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { formatDateYYYYMMDD } from '@buenobrows/shared/slotUtils';

export default function BusinessHoursManager() {
  const { db } = useFirebase();
  const [businessHours, setBusinessHoursState] = useState<BusinessHours | null>(null);
  const [closures, setClosures] = useState<DayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewDays, setViewDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeView, setActiveView] = useState<'weekly' | 'daily'>('weekly');

  // Generate next 14 days for view
  useEffect(() => {
    const today = startOfDay(new Date());
    const days: Date[] = [];
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    setViewDays(days);
  }, []);

  // Watch business hours, closures and special hours
  useEffect(() => {
    if (!db) return;
    const unsubBusinessHours = watchBusinessHours(db, setBusinessHoursState);
    const unsubClosures = watchDayClosures(db, setClosures);
    const unsubSpecial = watchSpecialHours(db, setSpecialHours);
    return () => {
      unsubBusinessHours();
      unsubClosures();
      unsubSpecial();
    };
  }, [db]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const getStatusForDate = (date: Date): 'closed' | 'special' | 'normal' => {
    const dateStr = formatDateYYYYMMDD(date);
    if (Array.isArray(closures) && closures.some(c => c.date === dateStr)) return 'closed';
    if (Array.isArray(specialHours) && specialHours.some(s => s.date === dateStr)) return 'special';
    return 'normal';
  };

  const handleCloseShop = async (date: Date) => {
    if (!db) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to close the shop on ${format(date, 'MMMM d, yyyy')}?\n\n` +
      'This will:\n' +
      '• Mark the day as closed\n' +
      '• Cancel all pending appointments for this day\n' +
      '• Remove all available time slots\n\n' +
      'Existing appointments will be marked as cancelled.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const dateStr = formatDateYYYYMMDD(date);

      // Create day closure
      await createDayClosure(db, {
        date: dateStr,
        reason: 'Shop closed',
        closedBy: 'admin',
        closedAt: new Date().toISOString(),
      });

      showMessage(`Shop closed for ${format(date, 'MMMM d')}`, 'success');
    } catch (error: any) {
      console.error('Error closing shop:', error);
      showMessage(error?.message || 'Failed to close shop', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReopenShop = async (date: Date) => {
    if (!db) return;
    
    const confirmed = window.confirm(
      `Reopen the shop on ${formatDateYYYYMMDD(date)}?\n\n` +
      'This will restore normal business hours for this day.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const dateStr = formatDateYYYYMMDD(date);
      
      const closure = Array.isArray(closures) ? closures.find(c => c.date === dateStr) : undefined;
      if (closure) {
        await deleteDayClosure(db, closure.id);
        showMessage(`Shop reopened for ${format(date, 'MMMM d')}`, 'success');
      }
    } catch (error: any) {
      console.error('Error reopening shop:', error);
      showMessage(error?.message || 'Failed to reopen shop', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSpecialHours = async (date: Date, ranges: [string, string][]) => {
    if (!db) return;

    try {
      setLoading(true);
      const dateStr = formatDateYYYYMMDD(date);
      
      console.log('[BusinessHoursManager] Setting special hours for date:', dateStr);
      console.log('[BusinessHoursManager] Ranges:', ranges);
      console.log('[BusinessHoursManager] Input data:', {
        date: dateStr,
        ranges,
        reason: 'Special hours',
        modifiedBy: 'admin',
        modifiedAt: new Date().toISOString(),
      });

      const result = await saveSpecialHours(db, {
        date: dateStr,
        ranges,
        reason: 'Special hours',
        modifiedBy: 'admin',
        modifiedAt: new Date().toISOString(),
      });

      console.log('[BusinessHoursManager] Special hours saved with ID:', result);
      console.log('[BusinessHoursManager] After save, checking special hours again...');
      
      // Wait a moment for the data to propagate
      setTimeout(() => {
        const checkAgain = getSpecialHoursForDate(date);
        console.log('[BusinessHoursManager] Re-check after save:', checkAgain);
      }, 1000);

      showMessage(`Special hours set for ${format(date, 'MMMM d')}`, 'success');
      setSelectedDate('');
    } catch (error: any) {
      console.error('Error setting special hours:', error);
      showMessage(error?.message || 'Failed to set special hours', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSpecialHours = async (date: Date) => {
    if (!db) return;

    const confirmed = window.confirm(
      `Remove special hours for ${format(date, 'MMMM d, yyyy')}?\n\n` +
      'This will restore normal weekly business hours for this day.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const dateStr = formatDateYYYYMMDD(date);
      
      const special = Array.isArray(specialHours) ? specialHours.find(s => s.date === dateStr) : undefined;
      if (special) {
        await deleteSpecialHours(db, special.id);
        showMessage(`Special hours removed for ${format(date, 'MMMM d')}`, 'success');
      }
    } catch (error: any) {
      console.error('Error removing special hours:', error);
      showMessage(error?.message || 'Failed to remove special hours', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialHoursForDate = (date: Date): SpecialHours | undefined => {
    const dateStr = formatDateYYYYMMDD(date);
    console.log('[BusinessHoursManager] Looking for special hours for date:', dateStr);
    console.log('[BusinessHoursManager] Available special hours:', specialHours);
    const found = Array.isArray(specialHours) ? specialHours.find(s => s.date === dateStr) : undefined;
    console.log('[BusinessHoursManager] Found special hours:', found);
    return found;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-slate-800 mb-2">Business Hours & Operations</h2>
        <p className="text-slate-600">
          Manage your weekly schedule and daily operations in one place
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveView('weekly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'weekly'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveView('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'daily'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily Operations
        </button>
      </div>

      {/* Weekly Schedule View */}
      {activeView === 'weekly' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-serif text-lg text-slate-800 mb-4">Weekly Business Hours</h3>
          <p className="text-sm text-slate-600 mb-6">Set your regular operating hours for each day of the week</p>
          {businessHours ? (
            <WeeklyHoursEditor 
              initial={businessHours} 
              onSave={async (newHours) => {
                try {
                  setLoading(true);
                  await setBusinessHours(db!, newHours);
                  showMessage('Weekly hours saved successfully', 'success');
                } catch (error: any) {
                  showMessage(error?.message || 'Failed to save hours', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          ) : (
            <div className="text-slate-500 text-sm">Loading…</div>
          )}
        </div>
      )}

      {/* Daily Operations View */}
      {activeView === 'daily' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-serif text-lg text-slate-800 mb-4">Daily Operations</h3>
          <p className="text-sm text-slate-600 mb-6">Override weekly hours for specific dates</p>
          
          <div className="grid gap-3">
            {viewDays.map((date) => {
              const status = getStatusForDate(date);
              const dateStr = formatDateYYYYMMDD(date);
              const special = getSpecialHoursForDate(date);
              const isSelected = selectedDate === dateStr;
              const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    status === 'closed'
                      ? 'border-red-300 bg-red-50'
                      : status === 'special'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  } ${isSelected ? 'ring-2 ring-terracotta' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Date Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-serif text-lg text-slate-800">
                          {format(date, 'EEEE, MMMM d')}
                          {isToday && (
                            <span className="ml-2 text-xs font-sans font-medium text-terracotta bg-terracotta/10 px-2 py-1 rounded">
                              Today
                            </span>
                          )}
                        </h4>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        {status === 'closed' && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Closed
                          </span>
                        )}
                        {status === 'special' && special && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Special Hours
                          </span>
                        )}
                        {status === 'normal' && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Normal Hours
                          </span>
                        )}
                      </div>

                      {/* Special Hours Display */}
                      {status === 'special' && special && (
                        <div className="text-sm text-slate-600 mt-2">
                          <div className="font-medium mb-1">Hours for this day:</div>
                          {special.ranges.length === 0 ? (
                            <span className="text-slate-500 italic">Closed</span>
                          ) : (
                            <div className="space-y-1">
                              {special.ranges.map((range, idx) => (
                                <div key={idx} className="text-slate-700">
                                  {range[0]} — {range[1]}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {status === 'closed' ? (
                        <button
                          onClick={() => handleReopenShop(date)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                        >
                          Reopen Shop
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCloseShop(date)}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                          >
                            Close Shop
                          </button>
                          <button
                            onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            {status === 'special' ? 'Edit Hours' : 'Set Hours'}
                          </button>
                          {status === 'special' && (
                            <button
                              onClick={() => handleRemoveSpecialHours(date)}
                              disabled={loading}
                              className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                            >
                              Remove Special
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Special Hours Editor */}
                  {isSelected && status !== 'closed' && (
                    <SpecialHoursEditor
                      date={date}
                      existingHours={special}
                      onSave={handleSetSpecialHours}
                      onCancel={() => setSelectedDate('')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="font-medium text-slate-800 mb-3">Legend</h4>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-slate-700">Normal Hours - Uses weekly schedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span className="text-slate-700">Special Hours - Custom hours for this day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-slate-700">Closed - Shop not operating</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Weekly Hours Editor Component (extracted from original BusinessHoursEditor)
function WeeklyHoursEditor({ 
  initial, 
  onSave, 
  loading 
}: { 
  initial: BusinessHours; 
  onSave: (hours: BusinessHours) => Promise<void>;
  loading: boolean;
}) {
  const [timezone, setTimezone] = useState<string>(initial.timezone);
  const [slotInterval, setSlotInterval] = useState<number>(initial.slotInterval);
  const [slots, setSlots] = useState<BusinessHours['slots']>(() => JSON.parse(JSON.stringify(initial.slots)));
  const [msg, setMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const dayKeys = ['sun','mon','tue','wed','thu','fri','sat'] as const;
  const dayLabels = {
    sun: 'Sunday',
    mon: 'Monday', 
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday'
  };

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      setMsg('');
      await onSave({ timezone, slotInterval, slots });
      setMsg('Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    }
  }

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isDifferentTimezone = userTimezone !== timezone;

  return (
    <div className="grid gap-6 max-w-4xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <label htmlFor="timezone" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Timezone (IANA)</span>
          <input 
            id="timezone" 
            name="timezone" 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            placeholder="America/Los_Angeles" 
            value={timezone} 
            onChange={(e)=>setTimezone(e.target.value)} 
          />
        </label>
        <label htmlFor="slot-interval" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Slot interval (minutes)</span>
          <input 
            id="slot-interval" 
            name="slot-interval" 
            type="number" 
            min={5} 
            step={5} 
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-terracotta focus:border-transparent" 
            value={slotInterval} 
            onChange={(e)=>setSlotInterval(parseInt(e.target.value||'15'))} 
          />
        </label>
      </div>

      {/* Timezone Warning Banner */}
      {isDifferentTimezone && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">⚠️ Timezone Alert</h4>
              <p className="text-sm text-amber-800 mb-3">
                <strong>All times below are in {timezone} time.</strong>
              </p>
              
              {/* Live Clock Comparison */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-amber-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-amber-600 font-medium mb-1">Your Time ({userTimezone})</div>
                    <div className="text-lg font-mono text-amber-900">
                      {currentTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: userTimezone 
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-terracotta font-medium mb-1">Business Time ({timezone})</div>
                    <div className="text-lg font-mono text-terracotta font-bold">
                      {currentTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: timezone 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-amber-700">
                When you enter times below, make sure they represent <strong>{timezone}</strong> hours, NOT your local time.
              </p>
              <p className="text-xs text-amber-600 mt-2 italic">
                Example: To close at 8:00 PM {timezone.split('/')[1]} time, enter "20:00" regardless of your local timezone.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {dayKeys.map((k) => (
          <div key={k} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg text-slate-800">{dayLabels[k]}</h3>
              <button 
                className="text-terracotta hover:text-terracotta/80 text-sm font-medium" 
                onClick={()=>addRange(k)}
              >
                + Add hours
              </button>
            </div>
            {(slots[k] || []).length === 0 && (
              <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-3 text-center">Closed</div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(slots[k] || []).map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <input
                    className="border border-slate-300 rounded-md p-2 w-24 text-sm"
                    placeholder="09:00"
                    value={pair[0]}
                    onChange={(e)=>updateCell(k, idx, 0, e.target.value)}
                    aria-label={`${dayLabels[k]} start ${idx+1}`}
                  />
                  <span className="text-slate-500">—</span>
                  <input
                    className="border border-slate-300 rounded-md p-2 w-24 text-sm"
                    placeholder="17:00"
                    value={pair[1]}
                    onChange={(e)=>updateCell(k, idx, 1, e.target.value)}
                    aria-label={`${dayLabels[k]} end ${idx+1}`}
                  />
                  <button 
                    className="text-red-600 hover:text-red-700 p-1" 
                    onClick={()=>removeRange(k, idx)}
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <button 
          className="bg-terracotta text-white rounded-lg px-6 py-2 hover:bg-terracotta/90 transition-colors" 
          onClick={save} 
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Weekly Hours'}
        </button>
        {msg && (
          <span className={`text-sm ${msg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

// Special Hours Editor Component
function SpecialHoursEditor({
  date,
  existingHours,
  onSave,
  onCancel,
}: {
  date: Date;
  existingHours?: SpecialHours;
  onSave: (date: Date, ranges: [string, string][]) => Promise<void>;
  onCancel: () => void;
}) {
  const [ranges, setRanges] = useState<[string, string][]>(
    existingHours?.ranges || [['09:00', '17:00']]
  );
  const [saving, setSaving] = useState(false);

  // FIXED: Add useEffect to update ranges when existingHours changes
  useEffect(() => {
    console.log('[SpecialHoursEditor] existingHours changed:', existingHours);
    if (existingHours?.ranges) {
      console.log('[SpecialHoursEditor] Setting ranges to:', existingHours.ranges);
      setRanges(existingHours.ranges);
    } else {
      console.log('[SpecialHoursEditor] No existing hours, using default');
      setRanges([['09:00', '17:00']]);
    }
  }, [existingHours]);

  const addRange = () => {
    setRanges([...ranges, ['09:00', '17:00']]);
  };

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, col: 0 | 1, value: string) => {
    const newRanges = [...ranges];
    newRanges[index][col] = value;
    setRanges(newRanges);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(date, ranges);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-300">
      <h4 className="font-medium text-slate-800 mb-3">Set Hours for {format(date, 'MMMM d')}</h4>
      
      <div className="space-y-3 mb-4">
        {ranges.map((range, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="time"
              value={range[0]}
              onChange={(e) => updateRange(idx, 0, e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-slate-500">—</span>
            <input
              type="time"
              value={range[1]}
              onChange={(e) => updateRange(idx, 1, e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => removeRange(idx)}
              className="text-red-600 hover:text-red-700 p-2"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={addRange}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Time Range
        </button>
        <div className="flex-1"></div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm text-white bg-terracotta rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Hours'}
        </button>
      </div>
    </div>
  );
}
