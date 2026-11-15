// ==============================================================================
// APNI ESTATE INTERIORS - TASKS & TEAM ASSIGNMENTS PAGE
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { formatDate } from '../utils/formatters';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Calendar, 
  FolderKanban, 
  UserCheck, 
  Flag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TaskModal } from '../components/modals/TaskModal';
import { EmptyState } from '../components/common/EmptyState';
import { UnifiedFilterPopover } from '../components/common/UnifiedFilterPopover';

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Urgent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  'To Do': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' }
};

export const TasksPage: React.FC = () => {
  const { tasks, projects, teamMembers, updateTask, deleteTask, openProjectDetail } = useApp();
  const { isDemoMode } = useAuth();

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.projectName && t.projectName.toLowerCase().includes(q)) ||
          (t.assigned_staff_name && t.assigned_staff_name.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (projectFilter !== 'All' && (t.project_id || t.projectId) !== projectFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'All' && t.assigned_to !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, search, projectFilter, statusFilter, priorityFilter, assigneeFilter]);

  // Metrics
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const urgentCount = tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Completed').length;

  const handleToggleCompleted = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tasks
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
              {tasks.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track site deliverables, drawings, and to-dos.
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto min-h-[40px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">To Do</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-slate-900">
            {todoCount}
          </div>
          <span className="text-[11px] text-slate-400">Pending</span>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">In Progress</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-indigo-700">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-slate-400">In progress</span>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Urgent</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-rose-700">
            {urgentCount}
          </div>
          <span className="text-[11px] text-slate-400">Needs attention</span>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-emerald-700">
            {completedCount}
          </div>
          <span className="text-[11px] text-slate-400">Completed</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, instructions, project, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Single Unified Side Filter Button */}
        <UnifiedFilterPopover
          activeCount={
            (projectFilter !== 'All' ? 1 : 0) +
            (statusFilter !== 'All' ? 1 : 0) +
            (priorityFilter !== 'All' ? 1 : 0) +
            (assigneeFilter !== 'All' ? 1 : 0)
          }
          onReset={() => {
            setProjectFilter('All');
            setStatusFilter('All');
            setPriorityFilter('All');
            setAssigneeFilter('All');
          }}
          fields={[
            {
              id: 'project',
              label: 'Project',
              type: 'select',
              value: projectFilter,
              onChange: setProjectFilter,
              options: [
                { label: 'All Projects', value: 'All' },
                ...projects.map((p) => ({ label: p.name, value: p.id }))
              ]
            },
            {
              id: 'status',
              label: 'Task Status',
              type: 'pills',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All', value: 'All' },
                ...(['To Do', 'In Progress', 'Completed', 'Cancelled'] as TaskStatus[]).map((s) => ({
                  label: s,
                  value: s
                }))
              ]
            },
            {
              id: 'priority',
              label: 'Priority',
              type: 'pills',
              value: priorityFilter,
              onChange: setPriorityFilter,
              options: [
                { label: 'All', value: 'All' },
                ...(['Low', 'Medium', 'High', 'Urgent'] as TaskPriority[]).map((p) => ({
                  label: p,
                  value: p
                }))
              ]
            },
            {
              id: 'assignee',
              label: 'Assigned Staff',
              type: 'select',
              value: assigneeFilter,
              onChange: setAssigneeFilter,
              options: [
                { label: 'All Staff', value: 'All' },
                ...teamMembers.map((m) => ({ label: m.full_name, value: m.id }))
              ]
            }
          ]}
        />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match your filters"
          description="Create checklist items for site supervisors, design cad drafting, or material samples."
          actionLabel="+ Create New Task"
          onAction={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
            const sStyle = STATUS_STYLES[task.status] || STATUS_STYLES['To Do'];
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted ? 'border-slate-200 bg-slate-50/40 opacity-75' : 'border-slate-200/90 shadow-xs hover:border-brand-300'
                }`}
              >
                {/* Left side: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleCompleted(task)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 hover:border-brand-500 bg-white'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                        {task.priority}
                      </span>

                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                        {task.status}
                      </span>

                      {task.projectName && (
                        <button
                          onClick={() => {
                            const pid = task.project_id || task.projectId;
                            if (pid) openProjectDetail(pid, 'Overview');
                          }}
                          className="text-[11px] font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
                        >
                          <FolderKanban className="w-3 h-3" />
                          <span>{task.projectName}</span>
                        </button>
                      )}
                    </div>

                    <h3 className={`font-bold text-xs sm:text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2.5">
                      {task.due_date || task.dueDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {formatDate(task.due_date || task.dueDate || '')}</span>
                        </span>
                      ) : null}

                      {task.assigned_staff_name && (
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.assigned_staff_name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setTaskToEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete task "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
