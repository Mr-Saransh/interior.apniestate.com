// ==============================================================================
// APNI ESTATE INTERIORS - BUDGET CONTROL & HEALTH PAGE (REAL FINANCIAL ENGINE)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatINR, formatINRCompact } from '../utils/formatters';
import { ProgressBar } from '../components/common/ProgressBar';
import { UnifiedFilterPopover } from '../components/common/UnifiedFilterPopover';
import {
  calculateProjectSpent,
  calculateProjectBOQ,
  calculateBudgetMetrics,
  BudgetHealthStatus,
} from '../lib/financialMetrics';

export const BudgetPage: React.FC = () => {
  const { projects, expenses, boqItems, stats, openProjectDetail } = useApp();
  const [filterHealth, setFilterHealth] = useState<'All' | BudgetHealthStatus>('All');

  const projectsWithFinancials = projects.map(p => {
    const spent = calculateProjectSpent(p.id, expenses);
    const boqEstimate = calculateProjectBOQ(p.id, boqItems);
    const metrics = calculateBudgetMetrics(p.budget, spent);
    return {
      ...p,
      spent,
      boqEstimate,
      metrics
    };
  });

  const filtered = projectsWithFinancials.filter(p => {
    if (filterHealth === 'All') return true;
    return p.metrics.health.status === filterHealth;
  });

  const healthyCount = projectsWithFinancials.filter(p => p.metrics.health.status === 'Healthy').length;
  const watchCount = projectsWithFinancials.filter(p => p.metrics.health.status === 'Watch').length;
  const riskCount = projectsWithFinancials.filter(p => p.metrics.health.status === 'Risk').length;
  const overBudgetCount = projectsWithFinancials.filter(p => p.metrics.health.status === 'Over Budget').length;

  const chartData = projectsWithFinancials.slice(0, 7).map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 13)}…` : p.name,
    Budget: Number(p.budget || 0),
    BOQ: Number(p.boqEstimate || 0),
    Spent: Number(p.spent || 0),
  }));

  return (
    <div className="space-y-5 pb-10">
      {/* Header & Filter */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Budget Health
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {healthyCount} healthy
            </span>
          </div>

          <UnifiedFilterPopover
            activeCount={filterHealth !== 'All' ? 1 : 0}
            onReset={() => setFilterHealth('All')}
            fields={[
              {
                id: 'health',
                label: 'Health Filter',
                type: 'pills',
                value: filterHealth,
                onChange: (val) => setFilterHealth(val as 'All' | BudgetHealthStatus),
                options: [
                  { label: `All (${projectsWithFinancials.length})`, value: 'All' },
                  { label: `Healthy (${healthyCount})`, value: 'Healthy' },
                  { label: `Watch (${watchCount})`, value: 'Watch' },
                  { label: `Risk (${riskCount})`, value: 'Risk' },
                  { label: `Over Budget (${overBudgetCount})`, value: 'Over Budget' },
                ],
              },
            ]}
          />
        </div>

        {/* Portfolio Summary 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Total Budget</span>
            <div className="text-lg font-bold text-[#111827] tabular-nums mt-0.5">
              {formatINRCompact(stats.totalBudget)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>{projects.length} sites</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">BOQ Total</span>
            <div className="text-lg font-bold text-indigo-700 tabular-nums mt-0.5">
              {formatINRCompact(stats.totalBOQEstimate)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Estimated</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Actual Spent</span>
            <div className="text-lg font-bold text-[#1D4ED8] tabular-nums mt-0.5">
              {formatINRCompact(stats.totalSpent)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
              <span>{stats.spentPercentage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Cushion</span>
            <div
              className={`text-lg font-bold tabular-nums mt-0.5 ${
                stats.totalRemaining < 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {formatINRCompact(stats.totalRemaining)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${stats.totalRemaining < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className={stats.totalRemaining < 0 ? 'text-rose-600 font-medium' : 'text-emerald-700 font-medium'}>
                {stats.totalRemaining < 0 ? 'Overrun' : 'Balance'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Chart + Threshold Guide */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">Portfolio Budget vs. BOQ vs. Spent</h2>
            <p className="text-xs text-[#64748B]">Site-by-site financial alignment comparison</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#4B5563]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 0–70% Healthy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 71–85% Watch
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 86–100% Risk
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700" /> &gt;100% Overrun
            </span>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatINRCompact(Number(v))}
                />
                <Tooltip
                  formatter={(val: unknown) => formatINR(Number(val || 0))}
                  contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="Budget" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="BOQ" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="Spent" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Project Budget Health Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">No projects match the selected health filter.</p>
          </div>
        ) : (
          filtered.map((project) => {
            const metrics = project.metrics;
            const percent = metrics.utilization !== null ? Math.round(metrics.utilization) : 0;

            return (
              <div
                key={project.id}
                onClick={() => openProjectDetail(project.id, 'Budget')}
                className="premium-card p-5 cursor-pointer hover:border-brand-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={project.coverImage}
                      alt={project.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base font-display text-slate-900">{project.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {project.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{project.location} • Client: {project.client}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${metrics.health.badgeBg} ${metrics.health.textColor}`}>
                      {metrics.health.label} {metrics.utilization !== null ? `(${percent}%)` : ''}
                    </span>
                    <button className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
                      <span>View Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Budget</div>
                    <div className="text-sm font-extrabold text-slate-900">{formatINR(project.budget)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">BOQ Estimate</div>
                    <div className="text-sm font-extrabold text-indigo-600">{formatINR(project.boqEstimate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Actual Spent</div>
                    <div className="text-sm font-extrabold text-brand-600">{formatINR(project.spent)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Remaining Cushion</div>
                    <div className={`text-sm font-black ${metrics.isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatINR(metrics.remaining)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <ProgressBar 
                    value={Math.min(100, percent)} 
                    height="md" 
                    color={metrics.health.color} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
