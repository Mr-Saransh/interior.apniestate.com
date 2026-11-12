import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  FolderPlus,
  IndianRupee,
  Layers,
  Plus,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { quotationService } from '../services/quotationService';
import { Quotation } from '../types';
import { formatINR, formatINRCompact } from '../utils/formatters';

const CHART_PALETTE = ['#1D4ED8', '#0D9488', '#D97706', '#6366F1', '#059669', '#64748B'];

export const OverviewPage: React.FC = () => {
  const {
    projects,
    tasks,
    purchases,
    expenses,
    leads,
    clientPayments,
    calendarEvents,
    workspaceMode,
    setWorkspaceMode,
    setCurrentPage,
    setIsNewProjectModalOpen,
    setIsAddExpenseModalOpen,
    setIsGenericQuoteModalOpen,
    openProjectDetail,
    globalSearch,
  } = useApp();
  const { profile, organization } = useAuth();
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Team';

  useEffect(() => {
    let active = true;
    quotationService
      .getQuotations(organization?.id || 'org-demo-1')
      .then((list) => {
        if (active) setRecentQuotations(list);
      })
      .catch(() => {
        if (active) setRecentQuotations([]);
      });
    return () => {
      active = false;
    };
  }, [organization?.id]);

  const searchQ = globalSearch.trim().toLowerCase();

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (!searchQ) return true;
        return (
          project.name.toLowerCase().includes(searchQ) ||
          project.client.toLowerCase().includes(searchQ) ||
          (project.city || '').toLowerCase().includes(searchQ)
        );
      }),
    [projects, searchQ]
  );

  // -----------------------------
  // ERP COMPUTED METRICS & CHARTS
  // -----------------------------
  const activeProjectsCount = projects.filter((p) => p.status !== 'Completed').length;
  const onTrackCount = projects.filter((p) => p.status === 'On Track').length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);

  const projectSpendMap = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((exp) => {
      map.set(exp.projectId, (map.get(exp.projectId) || 0) + Number(exp.amount || 0));
    });
    return map;
  }, [expenses]);

  const totalSpent = useMemo(() => {
    const ledgerTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    if (ledgerTotal > 0) return ledgerTotal;
    return projects.reduce((sum, p) => sum + Number(p.spent || 0), 0);
  }, [expenses, projects]);

  const totalCollected = useMemo(
    () => clientPayments.reduce((sum, cp) => sum + Number(cp.paid_amount || 0), 0),
    [clientPayments]
  );
  const totalScheduled = useMemo(
    () => clientPayments.reduce((sum, cp) => sum + Number(cp.amount || 0), 0),
    [clientPayments]
  );

  const openOrdersCount = purchases.filter(
    (po) => !['Received', 'Delivered', 'Cancelled', 'received', 'delivered', 'cancelled'].includes(po.status)
  ).length;

  const projectBudgetChartData = useMemo(
    () =>
      projects.slice(0, 6).map((p) => ({
        name: p.name.length > 15 ? `${p.name.slice(0, 14)}…` : p.name,
        Budget: Number(p.budget || 0),
        Spent: projectSpendMap.get(p.id) ?? Number(p.spent || 0),
      })),
    [projects, projectSpendMap]
  );

  const spendCategoryData = useMemo(() => {
    const bucket = new Map<string, number>();
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      bucket.set(cat, (bucket.get(cat) || 0) + Number(exp.amount || 0));
    });
    const rows = Array.from(bucket.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (rows.length <= 5) return rows;
    const top5 = rows.slice(0, 5);
    const otherTotal = rows.slice(5).reduce((s, r) => s + r.value, 0);
    return [...top5, { name: 'Other', value: otherTotal }];
  }, [expenses]);

  const urgentTasks = tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled' && (t.priority === 'Urgent' || t.priority === 'High'))
    .slice(0, 4);
  const flaggedProjects = projects
    .filter((p) => p.status === 'Budget Alert' || p.status === 'Delayed' || p.status === 'Needs Attention')
    .slice(0, 3);
  const upcomingSiteEvents = calendarEvents
    .filter((ev) => !ev.completed)
    .slice(0, 4);

  // -----------------------------
  // CRM COMPUTED METRICS & CHARTS
  // -----------------------------
  const filteredLeads = useMemo(
    () =>
      leads.filter((l) => {
        if (!searchQ) return true;
        return (
          l.name.toLowerCase().includes(searchQ) ||
          (l.requirement || '').toLowerCase().includes(searchQ) ||
          (l.source || '').toLowerCase().includes(searchQ) ||
          (l.phone || '').toLowerCase().includes(searchQ)
        );
      }),
    [leads, searchQ]
  );

  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const closedLeadsCount = wonLeads.length + leads.filter((l) => l.status === 'Lost').length;
  const winRatePct = closedLeadsCount > 0 ? Math.round((wonLeads.length / closedLeadsCount) * 100) : 0;

  const activePipelineValue = activeLeads.reduce((sum, l) => sum + Number(l.estimated_budget || 0), 0);
  const quotesTotalValue = recentQuotations.reduce((sum, q) => sum + Number(q.total || 0), 0);
  const pendingQuotesCount = recentQuotations.filter((q) => ['draft', 'sent'].includes(q.status)).length;

  const crmFunnelData = useMemo(() => {
    const stages = ['New', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Negotiation', 'Won'];
    return stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.status === stage);
      return {
        stage: stage === 'Site Visit Scheduled' ? 'Site Visit' : stage === 'Proposal Sent' ? 'Proposal' : stage,
        Count: stageLeads.length,
        Value: stageLeads.reduce((s, l) => s + Number(l.estimated_budget || 0), 0),
      };
    });
  }, [leads]);

  const leadSourceData = useMemo(() => {
    const bucket = new Map<string, number>();
    leads.forEach((l) => {
      const src = l.source?.trim() || 'Direct Inquiry';
      bucket.set(src, (bucket.get(src) || 0) + 1);
    });
    return Array.from(bucket.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [leads]);

  const priorityLeads = useMemo(
    () =>
      [...filteredLeads]
        .filter((l) => l.status !== 'Lost')
        .sort((a, b) => Number(b.estimated_budget || 0) - Number(a.estimated_budget || 0))
        .slice(0, 5),
    [filteredLeads]
  );

  // ============================================================================
  // CRM DASHBOARD MODE
  // ============================================================================
  if (workspaceMode === 'crm') {
    return (
      <div className="space-y-6 pb-10">
        {/* Welcome Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1.5">
              <span>Apni Estate Interiors</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#64748B]">Studio CRM Workspace</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-medium text-[#111827] tracking-tight">
              Good day, {firstName}
            </h1>
            <p className="text-sm text-[#4B5563] mt-1">
              Track client inquiries, scheduled walkthroughs, proposals sent, and deal conversion velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setWorkspaceMode('erp')}
              className="px-3.5 py-2.5 text-xs font-semibold text-[#475569] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] border border-[#E5E7EB] rounded-xl transition-colors"
            >
              Switch to ERP
            </button>
            <button
              onClick={() => setIsGenericQuoteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-blue-100/70 border border-blue-200 rounded-xl transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Quote Estimator</span>
            </button>
            <button
              onClick={() => setCurrentPage('leads')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Open Lead Pipeline</span>
            </button>
          </div>
        </div>

        {/* Beginner-Friendly Quick Action Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentPage('leads')}
            className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Manage Leads</p>
              <p className="text-[11px] text-[#64748B] truncate">Kanban & follow-ups</p>
            </div>
          </button>

          <button
            onClick={() => setIsGenericQuoteModalOpen(true)}
            className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Quick Estimate</p>
              <p className="text-[11px] text-[#64748B] truncate">1BHK to Villa BOQ</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('quotations')}
            className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Client Proposals</p>
              <p className="text-[11px] text-[#64748B] truncate">{recentQuotations.length} quotations saved</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('client-portal')}
            className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Client Portal</p>
              <p className="text-[11px] text-[#64748B] truncate">Share live site links</p>
            </div>
          </button>
        </div>

        {/* 4 CRM KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div
            onClick={() => setCurrentPage('leads')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#64748B]">Active Inquiries</span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#111827] tabular-nums">{activeLeads.length}</span>
              <span className="text-xs text-[#64748B]">of {leads.length} total leads</span>
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              {leads.filter((l) => l.status === 'Site Visit Scheduled').length} site visits booked
            </p>
          </div>

          <div
            onClick={() => setCurrentPage('leads')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#64748B]">Pipeline Value</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] tabular-nums">
              {formatINRCompact(activePipelineValue)}
            </div>
            <p className="text-xs text-[#64748B] mt-2">Estimated open opportunity value</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#64748B]">Conversion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#111827] tabular-nums">{winRatePct}%</span>
              <span className="text-xs font-medium text-emerald-700">{wonLeads.length} won</span>
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              {closedLeadsCount > 0 ? `Across ${closedLeadsCount} closed deals` : 'Log won or lost deals to track'}
            </p>
          </div>

          <div
            onClick={() => setCurrentPage('quotations')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#64748B]">Client Proposals</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] tabular-nums">
              {formatINRCompact(quotesTotalValue)}
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              {recentQuotations.length} quotes ({pendingQuotesCount} awaiting sign-off)
            </p>
          </div>
        </div>

        {/* CRM Analytics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">Pipeline Value by Stage</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Estimated interior budget across your CRM funnel</p>
              </div>
              <button
                onClick={() => setCurrentPage('leads')}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
              >
                Kanban <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {leads.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-xl p-6">
                <Users className="w-7 h-7 text-[#94A3B8] mb-2" />
                <p className="text-sm font-semibold text-[#111827]">No leads recorded yet</p>
                <p className="text-xs text-[#64748B] mt-1">Add inquiries in Lead Pipeline to see your stage funnel.</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={crmFunnelData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
                    <Bar dataKey="Value" name="Estimated Budget" fill="#1D4ED8" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[#111827]">Lead Source Mix</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Where your studio inquiries originate</p>
            </div>
            {leadSourceData.length === 0 ? (
              <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-xl p-6">
                <Target className="w-7 h-7 text-[#94A3B8] mb-2" />
                <p className="text-xs text-[#64748B]">Lead sources will chart here once inquiries are captured.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={76}
                        paddingAngle={3}
                      >
                        {leadSourceData.map((_, i) => (
                          <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  {leadSourceData.map((row, idx) => (
                    <div key={row.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                        />
                        <span className="text-[#374151] font-medium truncate">{row.name}</span>
                      </div>
                      <span className="font-semibold text-[#111827] tabular-nums ml-2">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CRM Operational Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Priority Inquiries</h3>
                <p className="text-xs text-[#64748B]">Top active client prospects ranked by estimated budget</p>
              </div>
              <button
                onClick={() => setCurrentPage('leads')}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {priorityLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-[#111827]">No matching inquiries</p>
                  <button
                    onClick={() => setCurrentPage('leads')}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-xl"
                  >
                    Go to Lead Pipeline
                  </button>
                </div>
              ) : (
                priorityLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setCurrentPage('leads')}
                    className="px-5 py-3.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-editorial text-base font-medium text-[#111827] truncate">
                          {lead.name}
                        </span>
                        <Badge status={lead.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 truncate">
                        {lead.requirement || 'Turnkey Interior Consultation'}
                        {lead.phone ? ` • ${lead.phone}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#111827] tabular-nums">
                        {lead.estimated_budget ? formatINRCompact(lead.estimated_budget) : '—'}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{lead.source || 'Direct'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Recent Client Quotations</h3>
                <p className="text-xs text-[#64748B]">Latest generated & shared proposals</p>
              </div>
              <button
                onClick={() => setCurrentPage('quotations')}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                All Quotes →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9] flex-1">
              {recentQuotations.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-7 h-7 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-xs text-[#64748B]">Create your first proposal in seconds using Quote Estimator.</p>
                  <button
                    onClick={() => setIsGenericQuoteModalOpen(true)}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] rounded-xl"
                  >
                    Launch Estimator
                  </button>
                </div>
              ) : (
                recentQuotations.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setCurrentPage('quotations')}
                    className="px-5 py-3.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {q.client_snapshot?.name || 'Client Proposal'}
                      </p>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {q.quote_number} • {q.project_snapshot?.name || 'Custom Interiors'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#111827] tabular-nums">{formatINRCompact(q.total)}</p>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full mt-0.5">
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERP DASHBOARD MODE
  // ============================================================================
  return (
    <div className="space-y-6 pb-10">
      {/* Studio Welcome & Quick Actions Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1.5">
            <span>Apni Estate Interiors</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-[#64748B]">Interior ERP Workspace</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-medium text-[#111827] tracking-tight">
            Good day, {firstName}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Monitor site budgets, room-wise progress, purchase orders, and financial health from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setWorkspaceMode('crm')}
            className="px-3.5 py-2.5 text-xs font-semibold text-[#475569] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] border border-[#E5E7EB] rounded-xl transition-colors"
          >
            Switch to CRM
          </button>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-blue-100/70 border border-blue-200 rounded-xl transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Beginner-Friendly Quick Action Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <FolderPlus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Start Project</p>
            <p className="text-[11px] text-[#64748B] truncate">Set budget & rooms</p>
          </div>
        </button>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Log Expense</p>
            <p className="text-[11px] text-[#64748B] truncate">Vendor or site cost</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentPage('purchases')}
          className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Purchase Orders</p>
            <p className="text-[11px] text-[#64748B] truncate">{openOrdersCount} open deliveries</p>
          </div>
        </button>

        <button
          onClick={() => setIsGenericQuoteModalOpen(true)}
          className="flex items-center gap-3 p-3.5 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-left transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] group-hover:text-[#1D4ED8] truncate">Quote Estimator</p>
            <p className="text-[11px] text-[#64748B] truncate">Generate client PDF</p>
          </div>
        </button>
      </div>

      {/* 4 ERP KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => setCurrentPage('projects')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#111827] tabular-nums">{activeProjectsCount}</span>
            <span className="text-xs text-[#64748B]">active of {projects.length}</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-2">{onTrackCount} running on schedule</p>
        </div>

        <div
          onClick={() => setCurrentPage('budget')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Committed Portfolio</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalBudget)}</div>
          <p className="text-xs text-[#64748B] mt-2">Across {projects.length} interior sites</p>
        </div>

        <div
          onClick={() => setCurrentPage('expenses')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Expenses Logged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalSpent)}</div>
          <p className="text-xs text-[#64748B] mt-2">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% of total portfolio` : 'Verified expense ledger'}
          </p>
        </div>

        <div
          onClick={() => setCurrentPage('payments')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-2xl p-5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Client Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalCollected)}</div>
          <p className="text-xs text-[#64748B] mt-2">
            {totalScheduled > 0
              ? `of ${formatINRCompact(totalScheduled)} milestone schedule`
              : `${openOrdersCount} open PO deliveries`}
          </p>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">Project Budget vs. Actual Spend</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Comparing sanctioned site budgets with logged expenses</p>
            </div>
            <button
              onClick={() => setCurrentPage('budget')}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
            >
              Budget Control <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {projectBudgetChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-xl p-6">
              <Building2 className="w-7 h-7 text-[#94A3B8] mb-2" />
              <p className="text-sm font-semibold text-[#111827]">No projects created yet</p>
              <p className="text-xs text-[#64748B] mt-1">Create a project to compare budget vs. execution costs.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectBudgetChartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
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
                  <Bar dataKey="Budget" fill="#CBD5E1" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Spent" fill="#1D4ED8" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">Spend by Trade Category</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Live breakdown across materials, labour & vendors</p>
            </div>
            <button
              onClick={() => setCurrentPage('reports')}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline"
            >
              Reports →
            </button>
          </div>

          {spendCategoryData.length === 0 ? (
            <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-xl p-6">
              <Receipt className="w-7 h-7 text-[#94A3B8] mb-2" />
              <p className="text-xs text-[#64748B]">Log your first expense to visualize trade spend share.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendCategoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                    >
                      {spendCategoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => formatINR(Number(val || 0))}
                      contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2.5">
                {spendCategoryData.map((row, idx) => (
                  <div key={row.name} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                      />
                      <span className="text-[#374151] font-medium truncate">{row.name}</span>
                    </div>
                    <span className="font-semibold text-[#111827] tabular-nums shrink-0">
                      {formatINRCompact(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Operational Split: Active Sites + Attention & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">Active Projects & Site Rooms</h3>
              <p className="text-xs text-[#64748B]">Click any project to manage rooms, BOQ, DPR photos & budget</p>
            </div>
            <button
              onClick={() => setCurrentPage('projects')}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline"
            >
              All Projects →
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-[#111827]">No projects found</p>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-xl"
                >
                  Create Project
                </button>
              </div>
            ) : (
              filteredProjects.slice(0, 5).map((project) => {
                const actualSpent = projectSpendMap.get(project.id) ?? Number(project.spent || 0);
                return (
                  <div
                    key={project.id}
                    onClick={() => openProjectDetail(project.id)}
                    className="px-5 py-4 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-editorial text-base font-medium text-[#111827] truncate">
                          {project.name}
                        </span>
                        <Badge status={project.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 truncate">
                        {project.client} • {project.city || project.location || 'Site'}
                      </p>
                    </div>

                    <div className="w-36 sm:w-44 shrink-0 text-right">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#111827] tabular-nums">
                          {formatINRCompact(actualSpent)}
                        </span>
                        <span className="text-[#64748B] tabular-nums">{project.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {/* Priority Attention */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Priority Attention</h3>
                <p className="text-xs text-[#64748B]">Site alerts, urgent tasks & budget flags</p>
              </div>
              <button
                onClick={() => setCurrentPage('tasks')}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                Tasks →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {flaggedProjects.length === 0 && urgentTasks.length === 0 ? (
                <div className="px-5 py-6 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-[#4B5563]">All active sites and high-priority tasks are running smoothly.</p>
                </div>
              ) : (
                <>
                  {flaggedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openProjectDetail(p.id)}
                      className="px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#111827] truncate">{p.name}</p>
                          <p className="text-[11px] text-[#64748B]">{p.progress || 0}% complete</p>
                        </div>
                      </div>
                      <Badge status={p.status} size="sm" />
                    </div>
                  ))}
                  {urgentTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setCurrentPage('tasks')}
                      className="px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ClipboardList className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#111827] truncate">{t.title}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{t.projectName || 'Studio Task'}</p>
                        </div>
                      </div>
                      <Badge status={t.priority} size="sm" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Upcoming Schedule</h3>
                <p className="text-xs text-[#64748B]">Site visits, deliveries & deadlines</p>
              </div>
              <button
                onClick={() => setCurrentPage('calendar')}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                Calendar →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {upcomingSiteEvents.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-[#64748B]">
                  No upcoming site events scheduled.
                </div>
              ) : (
                upcomingSiteEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setCurrentPage('calendar')}
                    className="px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Calendar className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{ev.title}</p>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {ev.projectName || ev.location || 'Studio'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#4B5563] tabular-nums shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      {ev.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
