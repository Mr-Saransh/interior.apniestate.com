// ==============================================================================
// APNI ESTATE INTERIORS - INTERACTIVE PROJECT TIMELINE & GANTT CHART
// ==============================================================================

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Flag,
  ChevronRight,
  Filter,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Milestone } from '../../types';

interface GanttPhase {
  id: string;
  name: string;
  category: string;
  startWeek: number;
  durationWeeks: number;
  progress: number;
  status: 'completed' | 'in_progress' | 'scheduled' | 'delayed';
  leadPerson: string;
  milestone?: string;
}

interface GanttChartProps {
  projectId: string;
  projectName: string;
  startDate?: string;
  deadline?: string;
  milestones?: Milestone[];
  onAddMilestone?: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  projectName,
  startDate = '2026-09-01',
  deadline = '2026-12-15',
  milestones = [],
  onAddMilestone
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  const defaultPhases: GanttPhase[] = [
    {
      id: 'ph-1',
      name: 'Client Brief & Moodboard Concept',
      category: 'Design',
      startWeek: 1,
      durationWeeks: 2,
      progress: 100,
      status: 'completed',
      leadPerson: 'Ananya (Designer)',
      milestone: 'Design Brief Signed'
    },
    {
      id: 'ph-2',
      name: '2D Floor Plans & 3D Photorealistic Renders',
      category: 'Design',
      startWeek: 3,
      durationWeeks: 2,
      progress: 100,
      status: 'completed',
      leadPerson: 'Siddharth (3D Lead)',
      milestone: '3D Render Freeze'
    },
    {
      id: 'ph-3',
      name: 'Civil Demolition, Partition Removal & Tiling',
      category: 'Civil',
      startWeek: 5,
      durationWeeks: 3,
      progress: 100,
      status: 'completed',
      leadPerson: 'Ramesh (Site Lead)'
    },
    {
      id: 'ph-4',
      name: 'Electrical Rewiring, Plumbing & False Ceiling',
      category: 'Services',
      startWeek: 7,
      durationWeeks: 3,
      progress: 75,
      status: 'in_progress',
      leadPerson: 'Vikram (Supervisor)',
      milestone: 'Ceiling Framing Sign-off'
    },
    {
      id: 'ph-5',
      name: 'Custom Carpentry & Modular Carcass Assembly',
      category: 'Woodwork',
      startWeek: 9,
      durationWeeks: 4,
      progress: 40,
      status: 'in_progress',
      leadPerson: 'Ramesh (Site Lead)',
      milestone: 'Shell Delivery to Site'
    },
    {
      id: 'ph-6',
      name: 'Countertops, Wall Tiling & Glass Partitions',
      category: 'Finishes',
      startWeek: 12,
      durationWeeks: 2,
      progress: 10,
      status: 'in_progress',
      leadPerson: 'Vikram (Supervisor)'
    },
    {
      id: 'ph-7',
      name: 'Painting (Royale Emulsion) & Wallpaper Trim',
      category: 'Finishes',
      startWeek: 14,
      durationWeeks: 2,
      progress: 0,
      status: 'scheduled',
      leadPerson: 'Asian Paints Team'
    },
    {
      id: 'ph-8',
      name: 'Deep Cleaning, Styling & Handover Walkthrough',
      category: 'Delivery',
      startWeek: 16,
      durationWeeks: 1,
      progress: 0,
      status: 'scheduled',
      leadPerson: 'Ananya (Designer)',
      milestone: 'Final Snagging & Keys'
    }
  ];

  const totalWeeks = 18;

  // Dynamically map real project milestones onto the Gantt chart if provided; fall back cleanly to standard turnkey schedule
  const projectPhases: GanttPhase[] =
    milestones && milestones.length > 0
      ? milestones.map((ms, idx) => {
        const span = Math.max(2, Math.floor(totalWeeks / Math.max(milestones.length, 3)));
        const startWeek = Math.min(totalWeeks - 1, idx * span + 1);
        const durationWeeks = Math.min(totalWeeks - startWeek + 1, span);
        const mappedStatus: GanttPhase['status'] =
          ms.status === 'completed' || ms.progress === 100
            ? 'completed'
            : ms.status === 'delayed'
              ? 'delayed'
              : ms.progress > 0 || ms.status === 'in_progress'
                ? 'in_progress'
                : 'scheduled';

        return {
          id: ms.id,
          name: ms.title,
          category: 'Milestone',
          startWeek,
          durationWeeks,
          progress: ms.progress ?? (mappedStatus === 'completed' ? 100 : 0),
          status: mappedStatus,
          leadPerson: ms.due_date ? `Due ${ms.due_date}` : projectName,
          milestone: ms.description || `Stage ${idx + 1}`
        };
      })
      : defaultPhases;

  // Estimate current project week dynamically from startDate..deadline
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(deadline).getTime();
  const nowMs = Date.now();
  const currentWeek =
    !Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs > startMs
      ? Math.min(totalWeeks, Math.max(1, Math.round(((nowMs - startMs) / (endMs - startMs)) * totalWeeks)))
      : 6;

  const filteredPhases = projectPhases.filter(ph => {
    if (activeFilter === 'active') return ph.status === 'in_progress' || ph.status === 'delayed';
    if (activeFilter === 'completed') return ph.status === 'completed';
    return true;
  });

  const completedCount = projectPhases.filter(p => p.status === 'completed').length;
  const activePhase = projectPhases.find(p => p.status === 'in_progress' || p.status === 'delayed') || projectPhases[0];
  const nextMilestone = projectPhases.find(p => p.status === 'scheduled' || p.status === 'in_progress');

  const getStatusBadge = (status: GanttPhase['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">Done</span>;
      case 'in_progress':
        return <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>;
      case 'delayed':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">Delayed</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">Upcoming</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E5E7EB] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#111827]">
              Project Execution Timeline & Gantt Schedule
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              18 WEEKS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase progression, dependency tracking, and site delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'all' ? 'bg-white text-[#111827] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              All Phases
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'active' ? 'bg-white text-[#1D4ED8] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Completed
            </button>
          </div>

          {onAddMilestone && (
            <button
              onClick={onAddMilestone}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Gantt Chart Grid */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-subtle overflow-hidden">

        {/* Timeline Header (Weeks 1 to 18) */}
        <div className="border-b border-[#E5E7EB] bg-slate-50/80 grid grid-cols-12 lg:grid-cols-[280px_repeat(18,1fr)] text-[10px] font-bold text-slate-500 overflow-x-auto">
          <div className="p-3 border-r border-[#E5E7EB] uppercase tracking-wider text-slate-700">
            Phase / Milestone Scope
          </div>
          <div className="hidden lg:contents">
            {Array.from({ length: totalWeeks }, (_, i) => (
              <div
                key={i}
                className={`py-3 text-center border-r border-slate-200/60 ${i + 1 === currentWeek ? 'bg-blue-100/60 text-[#1D4ED8]' : ''
                  }`}
              >
                W{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Rows */}
        <div className="divide-y divide-[#E5E7EB] text-xs">
          {filteredPhases.map((phase) => {
            const leftPercent = ((phase.startWeek - 1) / totalWeeks) * 100;
            const widthPercent = (phase.durationWeeks / totalWeeks) * 100;

            return (
              <div
                key={phase.id}
                className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-center hover:bg-slate-50/50 transition-colors"
              >
                {/* Left: Phase Info */}
                <div className="p-3.5 border-r border-[#E5E7EB] flex flex-col justify-center space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#111827] truncate">
                      {phase.name}
                    </span>
                    {getStatusBadge(phase.status)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{phase.leadPerson}</span>
                    <span className="font-bold text-slate-700 tabular-nums">{phase.progress}%</span>
                  </div>
                  {phase.milestone && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded w-fit">
                      <Flag className="w-3 h-3" />
                      <span>{phase.milestone}</span>
                    </div>
                  )}
                </div>

                {/* Right: Interactive Timeline Bar */}
                <div className="p-3 relative h-14 hidden lg:flex items-center bg-slate-50/30">
                  {/* Current week vertical guideline */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500/40 z-10 pointer-events-none"
                    style={{ left: `${((currentWeek - 0.5) / totalWeeks) * 100}%` }}
                    title="Current Week"
                  />

                  {/* Gantt Bar */}
                  <div
                    className="absolute h-7 rounded-lg transition-all flex items-center px-2.5 overflow-hidden shadow-xs cursor-pointer group"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: phase.status === 'completed'
                        ? '#10B981'
                        : phase.status === 'in_progress'
                          ? '#1D4ED8'
                          : '#94A3B8'
                    }}
                  >
                    {/* Inner Progress Fill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-black/15"
                      style={{ width: `${phase.progress}%` }}
                    />
                    <span className="relative z-10 text-[10px] font-bold text-white truncate drop-shadow-xs">
                      {phase.durationWeeks}w • {phase.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Completed Milestones</div>
            <div className="text-base font-bold text-[#111827] tabular-nums">
              {completedCount} of {projectPhases.length} Phases
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">Current Focus</div>
            <div className="text-sm font-bold text-[#111827] truncate">
              {activePhase ? `${activePhase.name} (W${currentWeek})` : `Week ${currentWeek}`}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">Next Scheduled Stage</div>
            <div className="text-sm font-bold text-[#111827] truncate">
              {nextMilestone ? `${nextMilestone.name} (W${nextMilestone.startWeek})` : 'Handover Ready'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

