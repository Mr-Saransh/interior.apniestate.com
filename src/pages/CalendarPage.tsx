import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  Users,
  Compass,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const CalendarPage: React.FC = () => {
  const { calendarEvents, addCalendarEvent, projects, milestones, openProjectDetail } = useApp();
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Dynamic calendar month navigation (defaults to today's month or first scheduled event month)
  const initialDate = calendarEvents[0]?.date ? new Date(calendarEvents[0].date) : new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [type, setType] = useState<CalendarEvent['type']>('site_visit');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [location, setLocation] = useState('');

  // Merge stored calendarEvents with project milestones so milestones always reflect on the studio calendar
  const combinedEvents: CalendarEvent[] = [
    ...calendarEvents,
    ...milestones
      .filter((m) => !!m.due_date)
      .map((m) => {
        const proj = projects.find((p) => p.id === m.project_id);
        return {
          id: `ms-${m.id}`,
          title: `Milestone: ${m.title}`,
          date: m.due_date!,
          type: 'deadline' as const,
          projectId: m.project_id,
          projectName: proj?.name,
          location: proj?.location
        };
      })
  ];

  const filteredEvents = combinedEvents
    .filter((e) => {
      if (eventTypeFilter !== 'All' && e.type !== eventTypeFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const proj = projects.find(p => p.id === projectId);
    addCalendarEvent({
      title: title.trim(),
      date,
      time,
      type,
      projectId: proj ? proj.id : undefined,
      projectName: proj ? proj.name : undefined,
      location: location.trim() || (proj ? proj.location : 'Studio')
    });

    setTitle('');
    setIsAddEventOpen(false);
  };

  const getEventIcon = (t: CalendarEvent['type']) => {
    switch (t) {
      case 'delivery': return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'meeting': return <Users className="w-4 h-4 text-blue-600" />;
      case 'site_visit': return <Compass className="w-4 h-4 text-purple-600" />;
      case 'deadline': return <AlertCircle className="w-4 h-4 text-rose-600" />;
    }
  };

  const getEventBadge = (t: CalendarEvent['type']) => {
    switch (t) {
      case 'delivery': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'meeting': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'site_visit': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'deadline': return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  // Dynamic calendar month calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon=0 .. Sun=6
  const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayIso = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Schedule & Deliveries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep site visits, client design walkthroughs, and material delivery dates in sync.
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(!isAddEventOpen)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Schedule Event</span>
        </button>
      </div>

      {/* Add event form popup/collapsible */}
      {isAddEventOpen && (
        <form onSubmit={handleAddEvent} className="p-5 rounded-2xl bg-white border border-brand-200 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Add New Calendar Event</h3>
            <button type="button" onClick={() => setIsAddEventOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Italian marble delivery, Kitchen final inspection"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Event Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="site_visit">Site Visit / Inspection</option>
                <option value="meeting">Client Meeting</option>
                <option value="delivery">Material Delivery</option>
                <option value="deadline">Project Handover Target</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Associated Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Time</label>
              <input
                type="text"
                placeholder="11:00 AM"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Calendar Month Preview + Upcoming Events Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Mini Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-serif text-[#111827]">
                {monthNames[viewMonth]} {viewYear}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                (Click any day to schedule)
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-[#E5E7EB]"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                }}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg hover:bg-[#EFF6FF] text-[#1D4ED8]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-[#E5E7EB]"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 font-semibold uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {leadingEmptyDays.map((idx) => (
              <div key={`empty-${idx}`} className="p-2 opacity-0">0</div>
            ))}
            {monthDays.map((d) => {
              const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const hasEvents = filteredEvents.filter(e => e.date === dayStr);
              const isToday = dayStr === todayIso;

              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setDate(dayStr);
                    setIsAddEventOpen(true);
                  }}
                  className={`p-2 min-h-[56px] rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${isToday
                      ? 'bg-[#EFF6FF] border-[#1D4ED8] font-bold text-[#1D4ED8]'
                      : hasEvents.length > 0
                        ? 'bg-slate-50 border-[#E5E7EB] font-semibold text-[#111827] hover:border-blue-300'
                        : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <span className="text-[11px] tabular-nums">{d}</span>
                  {hasEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {hasEvents.slice(0, 4).map((ev, idx) => (
                        <span
                          key={idx}
                          title={ev.title}
                          className={`w-1.5 h-1.5 rounded-full ${ev.type === 'delivery'
                              ? 'bg-emerald-500'
                              : ev.type === 'meeting'
                                ? 'bg-[#1D4ED8]'
                                : ev.type === 'deadline'
                                  ? 'bg-rose-500'
                                  : 'bg-purple-500'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Feed (5 cols) */}
        <div className="lg:col-span-5 premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold font-display text-slate-900">Upcoming Activities</h2>
              <span className="text-xs text-slate-400">{filteredEvents.length} scheduled</span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
              {(['All', 'delivery', 'meeting', 'site_visit', 'deadline'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setEventTypeFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 capitalize ${eventTypeFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {f === 'site_visit' ? 'Site Visits' : f}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => ev.projectId && openProjectDetail(ev.projectId)}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                      {getEventIcon(ev.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                          {ev.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventBadge(ev.type)} shrink-0`}>
                          {ev.type}
                        </span>
                      </div>

                      {ev.projectName && (
                        <div className="text-[11px] font-semibold text-slate-700 truncate mb-1">
                          {ev.projectName}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(ev.date)}
                        </span>
                        {ev.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ev.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
