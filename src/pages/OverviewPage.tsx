import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  Circle,
  FolderPlus,
  IndianRupee,
  Layers,
  Plus,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  ExternalLink,
  FileText
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
import { Quotation, Task } from '../types';
import { formatINR, formatINRCompact, formatDate } from '../utils/formatters';

const CHART_PALETTE = ['#1D4ED8', '#0D9488', '#D97706', '#6366F1', '#059669', '#64748B'];

export const OverviewPage: React.FC = () => {
  const {
    projects,
    tasks,
    updateTask,
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

  const firstName = profile?.full_name?.split(' ')[0] || 'Designer';

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
  // ERP COMPUTED METRICS
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

  const openOrdersCount = purchases.filter(
    (po) => !['Received', 'Delivered', 'Cancelled', 'received', 'delivered', 'cancelled'].includes(po.status)
  ).length;

  const projectBudgetChartData = useMemo(
    () =>
      projects.slice(0, 6).map((p) => ({
        name: p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name,
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
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled')
    .slice(0, 4);

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    await updateTask(task.id, { status: nextStatus });
  };

  const upcomingSiteEvents = calendarEvents
    .filter((ev) => !ev.completed)
    .slice(0, 3);

  // -----------------------------
  // CRM COMPUTED METRICS
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

  const crmFunnelData = useMemo(() => {
    const stages = ['New', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Negotiation', 'Won'];
    return stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.status === stage);
      return {
        stage: stage === 'Site Visit Scheduled' ? 'Visit' : stage === 'Proposal Sent' ? 'Quote' : stage,
        Value: stageLeads.reduce((s, l) => s + Number(l.estimated_budget || 0), 0),
      };
    });
  }, [leads]);

  const leadSourceData = useMemo(() => {
    const bucket = new Map<string, number>();
    leads.forEach((l) => {
      const src = l.source?.trim() || 'Direct';
      bucket.set(src, (bucket.get(src) || 0) + 1);
    });
    return Array.from(bucket.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
  // CRM MODE DASHBOARD
  // ============================================================================
  if (workspaceMode === 'crm') {
    return (
      <div className="space-y-5 pb-10">
        {/* Crisp Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-editorial text-2xl font-medium text-[#111827]">
              CRM Pipeline
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">Inquiries, proposals &amp; client walkthroughs</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWorkspaceMode('erp')}
              className="px-3 py-1.5 text-xs font-semibold text-[#475569] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
            >
              ERP Mode
            </button>
            <button
              onClick={() => setIsGenericQuoteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Quote</span>
            </button>
            <button
              onClick={() => setCurrentPage('leads')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* 1-Line Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setCurrentPage('leads')}
            className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#1D4ED8]" />
            <span>Leads ({activeLeads.length})</span>
          </button>
          <button
            onClick={() => setIsGenericQuoteModalOpen(true)}
            className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Estimator</span>
          </button>
          <button
            onClick={() => setCurrentPage('quotations')}
            className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Proposals ({recentQuotations.length})</span>
          </button>
          <button
            onClick={() => setCurrentPage('client-portal')}
            className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span>Client Portal</span>
          </button>
        </div>

        {/* 4 CRM KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => setCurrentPage('leads')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span>Active Inquiries</span>
              <Users className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="text-xl font-bold text-[#111827] tabular-nums">{activeLeads.length}</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">of {leads.length} total</p>
          </div>

          <div
            onClick={() => setCurrentPage('leads')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span>Pipeline Value</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-[#111827] tabular-nums">
              {formatINRCompact(activePipelineValue)}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Open budget</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span>Win Rate</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-[#111827] tabular-nums">{winRatePct}%</div>
            <p className="text-[11px] text-emerald-700 mt-0.5">{wonLeads.length} won deals</p>
          </div>

          <div
            onClick={() => setCurrentPage('quotations')}
            className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span>Proposals Sent</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-[#111827] tabular-nums">
              {formatINRCompact(quotesTotalValue)}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">{recentQuotations.length} quotes</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-[#111827]">Pipeline by Stage</h2>
              <button
                onClick={() => setCurrentPage('leads')}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                Pipeline →
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crmFunnelData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatINRCompact(Number(v))}
                  />
                  <Tooltip
                    formatter={(val: unknown) => formatINR(Number(val || 0))}
                    contentStyle={{ borderRadius: 10, borderColor: '#E5E7EB', fontSize: 11 }}
                  />
                  <Bar dataKey="Value" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col">
            <h2 className="text-xs font-semibold text-[#111827] mb-2">Inquiry Sources</h2>
            {leadSourceData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[#94A3B8]">
                No lead sources recorded
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <div className="w-1/2 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={3}
                      >
                        {leadSourceData.map((_, i) => (
                          <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E5E7EB', fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1.5 text-xs">
                  {leadSourceData.map((row, idx) => (
                    <div key={row.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                        />
                        <span className="text-[#374151] truncate">{row.name}</span>
                      </div>
                      <span className="font-semibold text-[#111827] tabular-nums ml-1">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Priority Inquiries + Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#111827]">Priority Inquiries</h3>
              <button
                onClick={() => setCurrentPage('leads')}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                All Leads →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {priorityLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94A3B8]">No active leads</div>
              ) : (
                priorityLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setCurrentPage('leads')}
                    className="px-4 py-2.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-sm font-medium text-[#111827] truncate">
                          {lead.name}
                        </span>
                        <Badge status={lead.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {lead.requirement || 'Interior consultation'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#111827] tabular-nums">
                        {lead.estimated_budget ? formatINRCompact(lead.estimated_budget) : '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#111827]">Recent Proposals</h3>
              <button
                onClick={() => setCurrentPage('quotations')}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                All Quotes →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9] flex-1">
              {recentQuotations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94A3B8]">No proposals created yet</div>
              ) : (
                recentQuotations.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setCurrentPage('quotations')}
                    className="px-4 py-2.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {q.client_snapshot?.name || 'Client Quote'}
                      </p>
                      <p className="text-[11px] text-[#64748B] truncate">{q.quote_number}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#111827] tabular-nums">{formatINRCompact(q.total)}</p>
                      <span className="text-[10px] text-[#1D4ED8] font-medium">{q.status}</span>
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
  // ERP MODE DASHBOARD
  // ============================================================================
  return (
    <div className="space-y-5 pb-10">
      {/* Clean Studio Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-editorial text-2xl font-medium text-[#111827]">
            Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">Welcome back, {firstName}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWorkspaceMode('crm')}
            className="px-3 py-1.5 text-xs font-semibold text-[#475569] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
          >
            CRM Mode
          </button>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-blue-200 rounded-xl transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>+ Expense</span>
          </button>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 1-Line Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-[#1D4ED8]" />
          <span>New Project</span>
        </button>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-amber-600" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => setCurrentPage('purchases')}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-emerald-600" />
          <span>Orders ({openOrdersCount})</span>
        </button>

        <button
          onClick={() => setIsGenericQuoteModalOpen(true)}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl text-xs font-semibold text-[#111827] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-indigo-600" />
          <span>Estimator</span>
        </button>
      </div>

      {/* 4 ERP KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setCurrentPage('projects')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span>Active Projects</span>
            <Building2 className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <div className="text-xl font-bold text-[#111827] tabular-nums">{activeProjectsCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{onTrackCount} on schedule</p>
        </div>

        <div
          onClick={() => setCurrentPage('budget')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span>Total Budget</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalBudget)}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">{projects.length} sites</p>
        </div>

        <div
          onClick={() => setCurrentPage('expenses')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span>Total Spent</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalSpent)}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Site ledger</p>
        </div>

        <div
          onClick={() => setCurrentPage('payments')}
          className="bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span>Collections</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-[#111827] tabular-nums">{formatINRCompact(totalCollected)}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Received</p>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#111827]">Budget vs. Actual Spend</h2>
            <button
              onClick={() => setCurrentPage('budget')}
              className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
            >
              Budget Health →
            </button>
          </div>

          {projectBudgetChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#94A3B8]">
              No projects created yet
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectBudgetChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatINRCompact(Number(v))}
                  />
                  <Tooltip
                    formatter={(val: unknown) => formatINR(Number(val || 0))}
                    contentStyle={{ borderRadius: 10, borderColor: '#E5E7EB', fontSize: 11 }}
                  />
                  <Bar dataKey="Budget" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Spent" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#111827]">Spend by Trade</h2>
            <button
              onClick={() => setCurrentPage('expenses')}
              className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
            >
              Expenses →
            </button>
          </div>

          {spendCategoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-[#94A3B8]">
              No expenses recorded
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3">
              <div className="w-1/2 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendCategoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={3}
                    >
                      {spendCategoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => formatINR(Number(val || 0))}
                      contentStyle={{ borderRadius: 10, borderColor: '#E5E7EB', fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-1.5 text-xs">
                {spendCategoryData.map((row, idx) => (
                  <div key={row.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                      />
                      <span className="text-[#374151] truncate">{row.name}</span>
                    </div>
                    <span className="font-semibold text-[#111827] tabular-nums shrink-0 ml-1">
                      {formatINRCompact(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Split: Active Sites + Tasks & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#111827]">Active Sites</h3>
            <button
              onClick={() => setCurrentPage('projects')}
              className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
            >
              All Projects →
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">No projects found</div>
            ) : (
              filteredProjects.slice(0, 5).map((project) => {
                const actualSpent = projectSpendMap.get(project.id) ?? Number(project.spent || 0);
                return (
                  <div
                    key={project.id}
                    onClick={() => openProjectDetail(project.id)}
                    className="px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-sm font-medium text-[#111827] truncate">
                          {project.name}
                        </span>
                        <Badge status={project.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        {project.client} • {project.city || 'Site'}
                      </p>
                    </div>

                    <div className="w-28 sm:w-36 shrink-0 text-right">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#111827] tabular-nums">
                          {formatINRCompact(actualSpent)}
                        </span>
                        <span className="text-[#64748B] tabular-nums text-[11px]">{project.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full"
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

        <div className="lg:col-span-5 space-y-4">
          {/* Tasks & Punch List */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#111827]">Pending Tasks</h3>
              <button
                onClick={() => setCurrentPage('calendar')}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                Calendar &amp; Tasks →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {urgentTasks.length === 0 ? (
                <div className="px-4 py-4 flex items-center gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All site tasks completed</span>
                </div>
              ) : (
                urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => handleToggleTask(t)}
                        className="text-slate-300 hover:text-emerald-600 shrink-0"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{t.title}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{t.projectName || 'Studio'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#111827]">Upcoming Schedule</h3>
              <button
                onClick={() => setCurrentPage('calendar')}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                View →
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {upcomingSiteEvents.length === 0 ? (
                <div className="px-4 py-4 text-xs text-[#94A3B8] text-center">
                  No upcoming site events
                </div>
              ) : (
                upcomingSiteEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setCurrentPage('calendar')}
                    className="px-4 py-2.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{ev.title}</p>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {ev.projectName || 'Studio'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-[#64748B] tabular-nums shrink-0">
                      {formatDate(ev.date)}
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
