import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, Task, TaskPriority } from '../types';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Truck,
  Users,
  Compass,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckSquare,
  X,
  Building2
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

type UnifiedCalendarItem =
  | {
      id: string;
      kind: 'task';
      title: string;
      date: string;
      completed: boolean;
      priority: TaskPriority;
      projectId?: string;
      projectName?: string;
      task: Task;
    }
  | {
      id: string;
      kind: 'event';
      title: string;
      date: string;
      time?: string;
      type: CalendarEvent['type'];
      projectId?: string;
      projectName?: string;
      location?: string;
      event: CalendarEvent;
    }
  | {
      id: string;
      kind: 'milestone';
      title: string;
      date: string;
      projectId?: string;
      projectName?: string;
    };

export const CalendarPage: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    projects,
    milestones,
    openProjectDetail
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'visits' | 'deliveries'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<'task' | 'event'>('task');

  // Selected date filter (null = all upcoming in view)
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);

  // Calendar month state
  const initialDate = new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

  // Form states
  const [itemTitle, setItemTitle] = useState('');
  const [itemDate, setItemDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [itemProjectId, setItemProjectId] = useState(projects[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('site_visit');
  const [eventTime, setEventTime] = useState('11:00 AM');
  const [eventLocation, setEventLocation] = useState('');

  // Combine calendarEvents + tasks with dates + milestones
  const allItems: UnifiedCalendarItem[] = useMemo(() => {
    const list: UnifiedCalendarItem[] = [];

    // 1. Tasks
    tasks.forEach((t) => {
      const d = t.due_date || t.dueDate;
      if (d) {
        list.push({
          id: `task-${t.id}`,
          kind: 'task',
          title: t.title,
          date: d,
          completed: t.status === 'Completed',
          priority: t.priority || 'Medium',
          projectId: t.project_id || t.projectId,
          projectName: t.projectName,
          task: t
        });
      }
    });

    // 2. Events
    calendarEvents.forEach((e) => {
      list.push({
        id: e.id,
        kind: 'event',
        title: e.title,
        date: e.date,
        time: e.time,
        type: e.type,
        projectId: e.projectId,
        projectName: e.projectName,
        location: e.location,
        event: e
      });
    });

    // 3. Milestones
    milestones.forEach((m) => {
      if (m.due_date) {
        const proj = projects.find((p) => p.id === m.project_id);
        list.push({
          id: `ms-${m.id}`,
          kind: 'milestone',
          title: `Milestone: ${m.title}`,
          date: m.due_date,
          projectId: m.project_id,
          projectName: proj?.name
        });
      }
    });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, calendarEvents, milestones, projects]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedDayIso && item.date !== selectedDayIso) return false;

      if (activeFilter === 'tasks') return item.kind === 'task';
      if (activeFilter === 'visits') return item.kind === 'event' && (item.type === 'site_visit' || item.type === 'meeting');
      if (activeFilter === 'deliveries') return item.kind === 'event' && item.type === 'delivery';

      return true;
    });
  }, [allItems, selectedDayIso, activeFilter]);

  // Handle Form Submission
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    const proj = projects.find((p) => p.id === itemProjectId);

    if (addMode === 'task') {
      await addTask({
        title: itemTitle.trim(),
        project_id: proj?.id,
        projectId: proj?.id,
        projectName: proj?.name,
        due_date: itemDate,
        dueDate: itemDate,
        priority: taskPriority,
        status: 'To Do'
      });
    } else {
      addCalendarEvent({
        title: itemTitle.trim(),
        date: itemDate,
        time: eventTime.trim() || undefined,
        type: eventType,
        projectId: proj?.id,
        projectName: proj?.name,
        location: eventLocation.trim() || proj?.location || 'Studio'
      });
    }

    setItemTitle('');
    setIsAddOpen(false);
  };

  // Toggle task completed
  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    await updateTask(task.id, { status: nextStatus });
  };

  // Delete item handler
  const handleDeleteItem = async (item: UnifiedCalendarItem) => {
    if (item.kind === 'task') {
      if (confirm(`Delete task "${item.title}"?`)) {
        await deleteTask(item.task.id);
      }
    } else if (item.kind === 'event') {
      if (confirm(`Remove event "${item.title}"?`)) {
        deleteCalendarEvent(item.id);
      }
    }
  };

  // Month Math
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
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-editorial text-2xl font-medium text-[#111827]">
            Schedule & Tasks
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Site visits, client walkthroughs, and pending to-dos.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAddOpen && selectedDayIso) {
              setItemDate(selectedDayIso);
            }
            setIsAddOpen(!isAddOpen);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task / Event</span>
        </button>
      </div>

      {/* Add Task / Event Drawer */}
      {isAddOpen && (
        <form
          onSubmit={handleSaveItem}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1D4ED8]/30 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            {/* Segmented Mode: Task vs Event */}
            <div className="inline-flex bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setAddMode('task')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  addMode === 'task' ? 'bg-[#1D4ED8] text-white' : 'text-[#64748B]'
                }`}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setAddMode('event')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  addMode === 'event' ? 'bg-[#1D4ED8] text-white' : 'text-[#64748B]'
                }`}
              >
                Site Event
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="p-1 rounded-lg text-[#64748B] hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                {addMode === 'task' ? 'Task Title *' : 'Event Title *'}
              </label>
              <input
                type="text"
                required
                placeholder={addMode === 'task' ? 'e.g. Verify kitchen counter height' : 'e.g. Italian marble delivery'}
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#374151] mb-1">Date</label>
              <input
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#374151] mb-1">Project</label>
              <select
                value={itemProjectId}
                onChange={(e) => setItemProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {addMode === 'task' ? (
              <div>
                <label className="block text-[11px] font-semibold text-[#374151] mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                  >
                    <option value="site_visit">Site Visit</option>
                    <option value="meeting">Client Meeting</option>
                    <option value="delivery">Material Delivery</option>
                    <option value="deadline">Handover Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold"
            >
              Save {addMode === 'task' ? 'Task' : 'Event'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Calendar Mini Grid (7 cols) + Actionable Activity Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Month View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#111827]">
              {monthNames[viewMonth]} {viewYear}
            </h2>

            <div className="flex items-center gap-1 text-[#64748B]">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100"
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
                  setSelectedDayIso(null);
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-[#EFF6FF] text-[#1D4ED8]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] mb-1.5 text-[#94A3B8] font-semibold">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {leadingEmptyDays.map((idx) => (
              <div key={`empty-${idx}`} className="p-1 min-h-[44px] opacity-0" />
            ))}

            {monthDays.map((d) => {
              const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayItems = allItems.filter((item) => item.date === dayStr);
              const isToday = dayStr === todayIso;
              const isSelected = dayStr === selectedDayIso;

              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setSelectedDayIso(isSelected ? null : dayStr);
                    setItemDate(dayStr);
                  }}
                  className={`p-1.5 min-h-[46px] sm:min-h-[52px] rounded-xl border flex flex-col items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                      : isToday
                      ? 'bg-[#EFF6FF] border-[#1D4ED8] font-bold text-[#1D4ED8]'
                      : dayItems.length > 0
                      ? 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827] hover:border-blue-300'
                      : 'border-transparent hover:bg-slate-50 text-[#475569]'
                  }`}
                >
                  <span className="text-[11px] tabular-nums font-semibold">{d}</span>

                  {dayItems.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-full">
                      {dayItems.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : item.kind === 'task'
                              ? item.completed
                                ? 'bg-emerald-400'
                                : 'bg-amber-500'
                              : item.kind === 'event'
                              ? item.type === 'delivery'
                                ? 'bg-emerald-500'
                                : item.type === 'meeting'
                                ? 'bg-[#1D4ED8]'
                                : 'bg-purple-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDayIso && (
            <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                Filtered to: <strong className="text-[#111827]">{formatDate(selectedDayIso)}</strong>
              </span>
              <button
                onClick={() => setSelectedDayIso(null)}
                className="text-[#1D4ED8] hover:underline font-semibold"
              >
                Show All Days
              </button>
            </div>
          )}
        </div>

        {/* Actionable Activity Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col">
          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[#111827]">
              {selectedDayIso ? formatDate(selectedDayIso) : 'Upcoming Schedule'}
            </h2>
            <span className="text-xs text-[#64748B] tabular-nums">{filteredItems.length} items</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#F1F5F9] mb-3 no-scrollbar">
            {(['all', 'tasks', 'visits', 'deliveries'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
                  activeFilter === tab
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200'
                    : 'text-[#64748B] hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>

          {/* Items Feed */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                No items scheduled. Tap &ldquo;Add Task / Event&rdquo; to create one.
              </div>
            ) : (
              filteredItems.map((item) => {
                if (item.kind === 'task') {
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                        item.completed
                          ? 'bg-[#F8FAFC] border-[#E5E7EB] opacity-60'
                          : 'bg-white border-[#E5E7EB] hover:border-blue-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(item.task)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                        title={item.completed ? 'Mark to do' : 'Mark completed'}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-semibold truncate ${
                              item.completed ? 'line-through text-[#64748B]' : 'text-[#111827]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              item.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700'
                                : item.priority === 'High'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                          {item.projectName && <span>{item.projectName}</span>}
                          <span>•</span>
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded shrink-0 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                if (item.kind === 'event') {
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-blue-200 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="mt-0.5 p-1 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] shrink-0">
                        {item.type === 'delivery' ? (
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : item.type === 'meeting' ? (
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                        ) : item.type === 'deadline' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Compass className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#111827] truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                          {item.projectName && <span>{item.projectName}</span>}
                          {item.time && <span>• {item.time}</span>}
                          <span>• {formatDate(item.date)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded shrink-0 transition-colors"
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Milestone
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {item.projectName} • {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
