// ==============================================================================
// APNI ESTATE INTERIORS - PROJECT MILESTONES & SITE EXECUTION SECTION
// Complete tracking: Chronological Stages, Statuses, Actual Dates & DPR/Tasks
// ==============================================================================

import React, { useState } from 'react';
import {
  Flag,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Camera,
  CheckSquare,
  Users,
  ChevronDown
} from 'lucide-react';
import { Milestone, DailyUpdate, Task, MilestoneStatus, Project } from '../../types';
import { formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ProgressBar } from '../common/ProgressBar';
import { GanttChart } from './GanttChart';

interface ProjectMilestonesSectionProps {
  project: Project;
  milestones: Milestone[];
  dailyUpdates: DailyUpdate[];
  tasks: Task[];
  activeSubTab: 'timeline' | 'dpr' | 'tasks';
  onSubTabChange: (tab: 'timeline' | 'dpr' | 'tasks') => void;
  onOpenAddMilestone: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => Promise<any>;
  onOpenAddDailyUpdate: () => void;
  onEditDailyUpdate: (update: DailyUpdate) => void;
  onDeleteDailyUpdate: (updateId: string) => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskComplete: (task: Task) => void;
}

const MILESTONE_STATUS_OPTIONS: Array<{ key: MilestoneStatus; label: string; color: string }> = [
  { key: 'not_started', label: 'Not Started', color: 'bg-slate-100 text-slate-700' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { key: 'on_hold', label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  { key: 'delayed', label: 'Delayed', color: 'bg-rose-100 text-rose-800' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' }
];

export const ProjectMilestonesSection: React.FC<ProjectMilestonesSectionProps> = ({
  project,
  milestones,
  dailyUpdates,
  tasks,
  activeSubTab,
  onSubTabChange,
  onOpenAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onUpdateMilestone,
  onOpenAddDailyUpdate,
  onEditDailyUpdate,
  onDeleteDailyUpdate,
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskComplete
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalMilestones = milestones.length;
  const completedCount = milestones.filter(m => m.status === 'completed' || m.status === 'Completed' || m.progress === 100).length;
  const inProgressCount = milestones.filter(m => m.status === 'in_progress' || m.status === 'In Progress').length;
  const delayedCount = milestones.filter(m => m.status === 'delayed' || m.status === 'Delayed').length;
  const averageProgress = totalMilestones > 0
    ? Math.round(milestones.reduce((s, m) => s + (Number(m.progress) || 0), 0) / totalMilestones)
    : 0;

  const handleQuickMarkComplete = async (ms: Milestone) => {
    setUpdatingId(ms.id);
    try {
      await onUpdateMilestone(ms.id, {
        status: 'completed',
        progress: 100,
        actual_date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickProgressAdjust = async (ms: Milestone, newProgress: number) => {
    setUpdatingId(ms.id);
    try {
      const isComplete = newProgress >= 100;
      await onUpdateMilestone(ms.id, {
        progress: newProgress,
        status: isComplete ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started',
        actual_date: isComplete ? (ms.actual_date || new Date().toISOString().split('T')[0]) : undefined
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusSelect = async (ms: Milestone, newStatus: MilestoneStatus) => {
    setUpdatingId(ms.id);
    try {
      const isComplete = newStatus === 'completed' || newStatus === 'Completed';
      await onUpdateMilestone(ms.id, {
        status: newStatus,
        progress: isComplete ? 100 : ms.progress === 100 ? 50 : ms.progress,
        actual_date: isComplete ? (ms.actual_date || new Date().toISOString().split('T')[0]) : undefined
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. PROGRESSION SUMMARY BAR ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Milestones</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Flag className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-slate-900 mt-2 tabular-nums">
            {completedCount} <span className="text-xs font-semibold text-slate-400">of {totalMilestones} done</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">{averageProgress}% overall execution</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">In Progress</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-blue-600 mt-2 tabular-nums">
            {inProgressCount} <span className="text-xs font-semibold text-slate-400">active</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Currently under site work</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-emerald-600 mt-2 tabular-nums">
            {completedCount} <span className="text-xs font-semibold text-slate-400">checkpoints</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Verified &amp; signed off</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">At Risk / Delayed</span>
            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-rose-600 mt-2 tabular-nums">
            {delayedCount} <span className="text-xs font-semibold text-slate-400">delayed</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Past target completion date</span>
        </div>
      </div>

      {/* ── 2. SUB-VIEW SEGMENTED SWITCHER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSubTabChange('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-brand-600" />
            <span>Milestone Timeline &amp; Stages</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('dpr')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'dpr'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Site Updates (DPR)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {dailyUpdates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'tasks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Site Checklist &amp; Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {tasks.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'timeline' && (
            <button
              type="button"
              onClick={onOpenAddMilestone}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              <span>+ Add Milestone</span>
            </button>
          )}

          {activeSubTab === 'dpr' && (
            <button
              type="button"
              onClick={onOpenAddDailyUpdate}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>+ Post Daily Update</span>
            </button>
          )}

          {activeSubTab === 'tasks' && (
            <button
              type="button"
              onClick={onOpenAddTask}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. SUB-VIEW: TIMELINE & STAGE PROGRESSION ── */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <GanttChart
            projectId={project.id}
            projectName={project.name}
            startDate={project.startDate}
            deadline={project.deadline}
            milestones={milestones}
            onAddMilestone={onOpenAddMilestone}
          />

          {milestones.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No execution milestones configured"
              description="Define key stage milestones (e.g., Design Sign-off, Civil Masonry, False Ceiling, Woodwork, Handover) to track deterministic progress."
              actionLabel="+ Add First Milestone"
              onAction={onOpenAddMilestone}
            />
          ) : (
            <div className="space-y-3.5">
              {milestones.map((ms, index) => {
                const isComplete = ms.status === 'completed' || ms.status === 'Completed' || ms.progress === 100;
                const isDelayed = ms.status === 'delayed' || ms.status === 'Delayed';
                const isOnHold = ms.status === 'on_hold' || ms.status === 'On Hold';
                const isInProgress = ms.status === 'in_progress' || ms.status === 'In Progress';

                const statusColor = isComplete
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : isDelayed
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : isOnHold
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : isInProgress
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

                const statusLabel = isComplete
                  ? 'Completed'
                  : isDelayed
                  ? 'Delayed'
                  : isOnHold
                  ? 'On Hold'
                  : isInProgress
                  ? 'In Progress'
                  : 'Not Started';

                return (
                  <div
                    key={ms.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isComplete
                        ? 'bg-emerald-50/30 border-emerald-200/70'
                        : isDelayed
                        ? 'bg-rose-50/30 border-rose-200/70'
                        : 'bg-white border-slate-200/90 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{ms.title}</h4>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          {ms.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ms.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Dates and Quick Mark Complete */}
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            Target: {ms.due_date ? formatDate(ms.due_date) : 'Not scheduled'}
                          </span>
                          {ms.actual_date && (
                            <span className="text-[11px] font-bold text-emerald-600 block">
                              Completed: {formatDate(ms.actual_date)}
                            </span>
                          )}
                        </div>

                        {!isComplete && (
                          <button
                            type="button"
                            disabled={updatingId === ms.id}
                            onClick={() => handleQuickMarkComplete(ms)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Done</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Interactive Slider / Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Stage Completion</span>
                        <span className="font-extrabold text-brand-700">{ms.progress}%</span>
                      </div>
                      <ProgressBar value={ms.progress} height="sm" />

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick adjust:</span>
                          {[25, 50, 75, 100].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleQuickProgressAdjust(ms, pct)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                ms.progress === pct
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <select
                            value={ms.status}
                            onChange={(e) => handleStatusSelect(ms, e.target.value as MilestoneStatus)}
                            className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="not_started">Status: Not Started</option>
                            <option value="in_progress">Status: In Progress</option>
                            <option value="on_hold">Status: On Hold</option>
                            <option value="delayed">Status: Delayed</option>
                            <option value="completed">Status: Completed</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => onEditMilestone(ms)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit Milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete milestone "${ms.title}"?`)) onDeleteMilestone(ms.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. SUB-VIEW: DAILY SITE UPDATES (DPR) ── */}
      {activeSubTab === 'dpr' && (
        <div className="space-y-4">
          {dailyUpdates.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No daily site updates posted yet"
              description="Post daily progress reports (DPR) detailing on-site worker count, work completed, pending issues, and progress photos."
              actionLabel="+ Post First DPR Update"
              onAction={onOpenAddDailyUpdate}
            />
          ) : (
            <div className="space-y-3.5">
              {dailyUpdates.map((update) => (
                <div key={update.id} className="premium-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatDate(update.update_date)}
                      </span>
                      {update.workers_count !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{update.workers_count} workers on site</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditDailyUpdate(update)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this daily update?')) onDeleteDailyUpdate(update.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {update.work_completed && (
                      <div>
                        <span className="font-bold text-slate-700">Work Completed: </span>
                        <span className="text-slate-600">{update.work_completed}</span>
                      </div>
                    )}
                    {update.next_day_tasks && (
                      <div>
                        <span className="font-bold text-slate-700">Next Day Plan: </span>
                        <span className="text-slate-600">{update.next_day_tasks}</span>
                      </div>
                    )}
                    {update.issues && (
                      <div className="text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                        <strong className="font-bold">Issues / Blockers: </strong>
                        <span>{update.issues}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. SUB-VIEW: SITE TASKS CHECKLIST ── */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No site tasks logged"
              description="Add site punch-list items, vendor assignments, and supervisor tasks."
              actionLabel="+ Add First Task"
              onAction={onOpenAddTask}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const isDone = task.status === 'Completed';

                  return (
                    <div key={task.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => onToggleTaskComplete(task)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <div>
                          <span className={`text-xs sm:text-sm font-bold block ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            {task.assigned_staff_name && <span>Assigned to: {task.assigned_staff_name}</span>}
                            {(task.due_date || task.dueDate) && (
                              <span>Due: {formatDate(task.due_date || task.dueDate || '')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete task "${task.title}"?`)) onDeleteTask(task.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
