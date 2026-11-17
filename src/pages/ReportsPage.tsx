// ==============================================================================
// APNI ESTATE INTERIORS - ADVANCED REPORTS & BUSINESS ANALYTICS
// Multi-dimensional financial & operational reporting with real metrics
// ==============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatINRCompact, formatDate } from '../utils/formatters';
import { calculateProjectProfitability, calculatePaymentScheduleMetrics } from '../lib/profitabilityMetrics';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  Building2, 
  ShoppingBag, 
  PieChart, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  Package,
  Clock,
  Building,
  ShieldCheck,
  FolderKanban,
  Users,
  Target,
  FileCheck2,
  UserCheck,
  Sparkles,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { materialService } from '../services/materialService';
import { branchService } from '../services/branchService';
import { INITIAL_BRANCHES, INITIAL_APPROVAL_REQUESTS } from '../data/mockData';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const REPORT_CHART_COLORS = ['#1D4ED8', '#0D9488', '#D97706', '#6366F1', '#059669', '#64748B'];

export const ReportsPage: React.FC = () => {
  const { 
    projects, 
    expenses, 
    clientPayments, 
    purchases, 
    vendors, 
    materials, 
    materialTransactions,
    teamMembers,
    leads,
    clients,
    workspaceMode,
    setCurrentPage
  } = useApp();
  const { isDemoMode } = useAuth();

  const [reportSuite, setReportSuite] = useState<'erp' | 'crm'>(workspaceMode === 'crm' ? 'crm' : 'erp');
  const [crmActiveTab, setCrmActiveTab] = useState<'funnel' | 'sources' | 'proposals' | 'pipeline'>('funnel');

  useEffect(() => {
    setReportSuite(workspaceMode === 'crm' ? 'crm' : 'erp');
  }, [workspaceMode]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<
    'profitability' | 'payments' | 'vendors' | 'procurement' | 'expenses' | 'inventory' | 'branches' | 'approvals' | 'progress'
  >('profitability');

  const [quotations, setQuotations] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('apni_estate_quotations');
      if (stored) {
        setQuotations(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Branch list
  const branches = useMemo(() => {
    return isDemoMode ? INITIAL_BRANCHES : [];
  }, [isDemoMode]);

  // Filtered dataset based on project selection and branch selection
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesProj = selectedProjectId === 'All' || p.id === selectedProjectId;
      const matchesBranch = selectedBranchId === 'All' || p.branch_id === selectedBranchId;
      return matchesProj && matchesBranch;
    });
  }, [projects, selectedProjectId, selectedBranchId]);

  const filteredExpenses = useMemo(() => {
    return selectedProjectId === 'All' ? expenses : expenses.filter(e => e.projectId === selectedProjectId);
  }, [expenses, selectedProjectId]);

  const filteredPayments = useMemo(() => {
    return selectedProjectId === 'All' ? clientPayments : clientPayments.filter(p => p.project_id === selectedProjectId);
  }, [clientPayments, selectedProjectId]);

  const filteredPurchases = useMemo(() => {
    return selectedProjectId === 'All' ? purchases : purchases.filter(p => p.project_id === selectedProjectId);
  }, [purchases, selectedProjectId]);

  const filteredMaterials = useMemo(() => {
    return selectedProjectId === 'All' ? materials : materials.filter(m => (m.project_id || (m as any).projectId) === selectedProjectId);
  }, [materials, selectedProjectId]);

  // 1. Profitability Metrics
  const profitabilityList = useMemo(() => {
    return filteredProjects.map(proj => calculateProjectProfitability(proj, expenses, clientPayments));
  }, [filteredProjects, expenses, clientPayments]);

  const totalContractVal = profitabilityList.reduce((sum, p) => sum + p.contractValue, 0);
  const totalRevenueRec = profitabilityList.reduce((sum, p) => sum + p.revenueReceived, 0);
  const totalActualCost = profitabilityList.reduce((sum, p) => sum + p.actualCost, 0);
  const totalGrossProfit = totalContractVal - totalActualCost;
  const overallMarginPct = totalContractVal > 0 ? (totalGrossProfit / totalContractVal) * 100 : 0;
  const totalRealizedCash = totalRevenueRec - totalActualCost;

  // 2. Client Payment Metrics
  const paymentMetrics = useMemo(() => {
    return calculatePaymentScheduleMetrics(filteredPayments, totalContractVal);
  }, [filteredPayments, totalContractVal]);

  // 3. Vendor Category Spend
  const vendorSpendByCategory = useMemo(() => {
    const spendMap: Record<string, number> = {};
    for (const exp of filteredExpenses) {
      const cat = exp.category || 'Other';
      spendMap[cat] = (spendMap[cat] || 0) + (Number(exp.amount) || 0);
    }
    return Object.entries(spendMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // 4. Procurement Status Breakdown
  const procurementSummary = useMemo(() => {
    const totalOrders = filteredPurchases.length;
    const totalAmount = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const receivedAmount = filteredPurchases
      .filter(p => p.status === 'Received')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const inTransitAmount = filteredPurchases
      .filter(p => p.status === 'Ordered' || p.status === 'Partially Received')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);
    return {
      totalOrders,
      totalAmount,
      receivedAmount,
      inTransitAmount
    };
  }, [filteredPurchases]);

  const profitBarData = profitabilityList.slice(0, 6).map((item) => ({
    name: item.projectName.length > 14 ? `${item.projectName.slice(0, 13)}…` : item.projectName,
    Contract: item.contractValue,
    Collected: item.revenueReceived,
    Cost: item.actualCost,
  }));

  const categoryDonutData = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((exp) => {
      const k = exp.category || 'Other';
      map.set(k, (map.get(k) || 0) + Number(exp.amount || 0));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredExpenses]);

  // CRM Metrics Calculations
  const totalLeads = leads.length;
  const wonLeads = useMemo(() => leads.filter(l => l.status === 'Won' || Boolean(l.converted_client_id)), [leads]);
  const activeLeads = useMemo(() => leads.filter(l => l.status !== 'Won' && l.status !== 'Lost'), [leads]);
  const leadWinRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
  const totalPipelineValue = useMemo(() => {
    return activeLeads.reduce((sum, l) => sum + (Number(l.estimated_budget) || 0), 0);
  }, [activeLeads]);
  const avgDealSize = useMemo(() => {
    if (wonLeads.length > 0) {
      return wonLeads.reduce((sum, l) => sum + (Number(l.estimated_budget) || 0), 0) / wonLeads.length;
    }
    return 1850000;
  }, [wonLeads]);

  const approvedQuotes = useMemo(() => quotations.filter(q => q.status === 'approved'), [quotations]);
  const totalQuotesValue = useMemo(() => quotations.reduce((sum, q) => sum + (Number(q.total) || 0), 0), [quotations]);
  const quoteAcceptanceRate = quotations.length > 0 ? (approvedQuotes.length / quotations.length) * 100 : 0;

  const crmFunnelData = useMemo(() => {
    const stageCounts: Record<string, number> = {
      'New': 0,
      'Contacted': 0,
      'Site Visit': 0,
      'Proposal': 0,
      'Won': 0
    };
    leads.forEach(l => {
      if (l.status === 'New') stageCounts['New']++;
      else if (l.status === 'Contacted') stageCounts['Contacted']++;
      else if (l.status === 'Site Visit Scheduled') stageCounts['Site Visit']++;
      else if (l.status === 'Proposal Sent' || l.status === 'Negotiation') stageCounts['Proposal']++;
      else if (l.status === 'Won' || l.converted_client_id) stageCounts['Won']++;
      else stageCounts['New']++;
    });
    return Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));
  }, [leads]);

  const crmSourceData = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
      const src = (l.source as string) || 'Referral';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    return Object.entries(sourceMap).map(([name, value], idx) => ({
      name,
      value,
      color: REPORT_CHART_COLORS[idx % REPORT_CHART_COLORS.length]
    }));
  }, [leads]);

  return (
    <div className="space-y-6 pb-10">
      {/* Architectural Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
        {/* Top Suite Segmented Switch: Interior Execution (ERP) vs Studio CRM & Sales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setReportSuite('erp')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportSuite === 'erp'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Interior Execution (ERP)</span>
            </button>
            <button
              type="button"
              onClick={() => setReportSuite('crm')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportSuite === 'crm'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Studio CRM &amp; Sales (CRM)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {reportSuite === 'erp' ? (
              <span>Tracking <strong>{filteredProjects.length} sites</strong> &amp; site budgets</span>
            ) : (
              <span>Tracking <strong>{leads.length} client leads</strong> &amp; sales pipeline</span>
            )}
          </div>
        </div>

        {reportSuite === 'erp' ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                  Site Execution Reports
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {projects.length} sites
                </span>
              </div>

              {/* Filters: Branch & Project */}
              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                {branches.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#374151]">
                    <Building className="w-3.5 h-3.5 text-[#64748B]" />
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#374151]">
                  <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Projects</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Clean Architectural Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 border-t border-[#F1F5F9] no-scrollbar">
              {[
                { id: 'profitability', label: 'Profit', icon: TrendingUp },
                { id: 'payments', label: 'Collections', icon: IndianRupee },
                { id: 'expenses', label: 'Expenses', icon: PieChart },
                { id: 'procurement', label: 'Orders', icon: ShoppingBag },
                { id: 'vendors', label: 'Vendors', icon: Building2 },
                { id: 'inventory', label: 'Stock', icon: Package },
                { id: 'progress', label: 'Progress', icon: FolderKanban },
                { id: 'branches', label: 'Branches', icon: Building },
                { id: 'approvals', label: 'Approvals', icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200'
                        : 'text-[#4B5563] hover:bg-[#F8FAFC] hover:text-[#111827] border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                  Studio CRM &amp; Sales Reports
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {leads.length} Leads &amp; Inquiries
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage('leads')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Leads</span>
                </button>
              </div>
            </div>

            {/* CRM Tab Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 border-t border-[#F1F5F9] no-scrollbar">
              {[
                { id: 'funnel', label: 'Sales Funnel & Conversion', icon: TrendingUp },
                { id: 'sources', label: 'Lead Acquisition Channels', icon: PieChart },
                { id: 'proposals', label: 'Quotations & Proposals', icon: ShoppingBag },
                { id: 'pipeline', label: 'Active Pipeline & Velocity', icon: Layers }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = crmActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCrmActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                        : 'text-[#4B5563] hover:bg-[#F8FAFC] hover:text-[#111827] border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── INTERIOR EXECUTION ERP SUITE ── */}
      {reportSuite === 'erp' && (
        <>
          {/* TAB 1: PROJECT PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* Top Profitability Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Contract Value</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#111827] tabular-nums mt-1 block">
                {formatINR(totalContractVal)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Gross Profit</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {Math.round(overallMarginPct * 10) / 10}% margin
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-emerald-700 tabular-nums mt-1 block">
                {formatINR(totalGrossProfit)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Revenue Collected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#1D4ED8] tabular-nums mt-1 block">
                {formatINR(totalRevenueRec)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Cash Net</span>
                <span className={`w-1.5 h-1.5 rounded-full ${totalRealizedCash >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <span className={`text-lg sm:text-xl font-bold tabular-nums mt-1 block ${
                totalRealizedCash >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {formatINR(totalRealizedCash)}
              </span>
            </div>
          </div>

          {/* Visual Executive Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5">
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">Contract vs. Collected vs. Cost</h3>
              </div>
              {profitBarData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-[#64748B]">No project data to chart.</div>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitBarData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
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
                      <Bar dataKey="Contract" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="Collected" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="Cost" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col">
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">Cost by Category</h3>
              </div>
              {categoryDonutData.length === 0 ? (
                <div className="flex-1 min-h-[200px] flex items-center justify-center text-xs text-[#64748B]">No expenses recorded yet.</div>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryDonutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={44}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {categoryDonutData.map((_, idx) => (
                            <Cell key={idx} fill={REPORT_CHART_COLORS[idx % REPORT_CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: unknown) => formatINR(Number(val || 0))}
                          contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', fontSize: 12 }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2">
                    {categoryDonutData.map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: REPORT_CHART_COLORS[i % REPORT_CHART_COLORS.length] }}
                          />
                          <span className="text-[#374151] font-medium truncate">{c.name}</span>
                        </div>
                        <span className="font-semibold text-[#111827] tabular-nums shrink-0">
                          {formatINRCompact(c.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Profitability Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                Project Margins & Cash Position
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profitabilityList.length}
              </span>
            </div>

            {profitabilityList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No project profitability data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                      <th className="py-3 px-4">Project Name</th>
                      <th className="py-3 px-4 text-right">Contract Value</th>
                      <th className="py-3 px-4 text-right">Collected</th>
                      <th className="py-3 px-4 text-right">Actual Cost</th>
                      <th className="py-3 px-4 text-right">Gross Profit</th>
                      <th className="py-3 px-4 text-right">Margin %</th>
                      <th className="py-3 px-4 text-right">Cash Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {profitabilityList.map((item) => (
                      <tr key={item.projectId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.projectName}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatINR(item.contractValue)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                          {formatINR(item.revenueReceived)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600 font-bold">
                          {formatINR(item.actualCost)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {formatINR(item.grossProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                            item.grossMarginPct >= 20 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {item.grossMarginPct}%
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-black ${
                          item.realizedCashPosition >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {formatINR(item.realizedCashPosition)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT PAYMENT AGING */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Scheduled</span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 font-display block">{formatINR(paymentMetrics.totalScheduled)}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">Collected</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-700 font-display block">{formatINR(paymentMetrics.totalReceived)}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 block mb-1">Pending</span>
              <span className="text-lg sm:text-2xl font-black text-indigo-900 font-display block">{formatINR(paymentMetrics.scheduleOutstanding)}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 block mb-1">Overdue</span>
              <span className="text-lg sm:text-2xl font-black text-rose-600 font-display block">{formatINR(paymentMetrics.overdueAmount)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <h3 className="text-base font-bold font-display text-slate-900 mb-3">Milestone Schedule</h3>
            <div className="space-y-3">
              {filteredPayments.map(p => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{p.title}</span>
                    <span className="text-[11px] text-slate-500">{p.projectName} • Due: {formatDate(p.due_date)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">{formatINR(p.amount)}</span>
                    <span className="text-[10px] font-bold text-emerald-600">Paid: {formatINR(p.paid_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE BREAKDOWN */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <h3 className="text-base font-bold font-display text-slate-900 mb-4">Expenses by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorSpendByCategory.map(item => (
                <div key={item.category} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs">
                      {item.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.category}</h4>
                      <span className="text-[11px] text-slate-400">Total spent</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-display">
                    {formatINR(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROCUREMENT STATUS */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Orders</span>
              <span className="text-xl font-bold text-slate-900 font-display mt-1 block">{procurementSummary.totalOrders}</span>
              <span className="text-[11px] font-medium text-slate-600 mt-1">{formatINR(procurementSummary.totalAmount)}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-emerald-800">Delivered</span>
              <span className="text-xl font-bold text-emerald-700 font-display mt-1 block">{formatINR(procurementSummary.receivedAmount)}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-indigo-800">In Transit</span>
              <span className="text-xl font-bold text-indigo-900 font-display mt-1 block">{formatINR(procurementSummary.inTransitAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VENDOR DISBURSEMENTS */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <h3 className="text-base font-bold font-display text-slate-900 mb-3">Vendors & Suppliers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-slate-900">{v.name}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">{v.category}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">{v.phone || 'No phone'}</span>
                  {v.gst_number && <span className="text-[10px] font-mono text-slate-400 block mt-1">GST: {v.gst_number}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MATERIAL / INVENTORY SUMMARY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Materials & Site Stock</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                {filteredMaterials.length} Items
              </span>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-6 text-center">No materials registered for this project.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map(mat => {
                  const stockInfo = materialService.calculateStock(mat.id, materialTransactions, mat.minimum_stock);
                  const isLow = stockInfo.is_low_stock;
                  return (
                    <div key={mat.id} className={`p-4 rounded-2xl border transition-all ${
                      isLow ? 'bg-rose-50/20 border-rose-200' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{mat.name}</h4>
                          <span className="text-[11px] text-slate-400">{mat.category || 'General'}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                          isLow ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ordered</span>
                          <span className="text-xs font-bold text-slate-800">{mat.quantity_ordered || 0} {mat.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Stock In</span>
                          <span className="text-xs font-bold text-emerald-600">+{stockInfo.total_in} {mat.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Available</span>
                          <span className="text-xs font-black text-slate-900">{stockInfo.available} {mat.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: BRANCH PERFORMANCE REPORT */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Branch Studios</h3>
              <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-xl border border-brand-200">
                {branches.length} Studios
              </span>
            </div>

            {branches.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-6 text-center">No branches registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Studio</th>
                      <th className="py-2.5 px-3">Manager</th>
                      <th className="py-2.5 px-3 text-center">Sites</th>
                      <th className="py-2.5 px-3 text-center">Staff</th>
                      <th className="py-2.5 px-3 text-right">Contract</th>
                      <th className="py-2.5 px-3 text-right">Cost</th>
                      <th className="py-2.5 px-3 text-right">Profit</th>
                      <th className="py-2.5 px-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branchService.calculateBranchMetrics(branches, projects, expenses, teamMembers).map(b => {
                      const contract = b.total_contract_value || 0;
                      const cost = b.total_expenses || 0;
                      const profit = contract - cost;
                      const margin = contract > 0 ? (profit / contract) * 100 : 0;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{b.name}</div>
                            <div className="text-[10px] text-slate-400">{b.city || 'Regional Office'}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">{b.managerName}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{b.project_count || 0}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{b.team_count || 0}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900">{formatINR(contract)}</td>
                          <td className="py-3 px-3 text-right font-semibold text-amber-700">{formatINR(cost)}</td>
                          <td className={`py-3 px-3 text-right font-extrabold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatINR(profit)}
                          </td>
                          <td className={`py-3 px-3 text-right font-extrabold ${margin >= 20 ? 'text-emerald-600' : margin >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Approvals</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total</span>
                <span className="text-xl font-extrabold text-slate-900">{INITIAL_APPROVAL_REQUESTS.length}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Pending</span>
                <span className="text-xl font-extrabold text-amber-700">
                  {INITIAL_APPROVAL_REQUESTS.filter(r => r.status === 'pending').length}
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Approved</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  {formatINRCompact(INITIAL_APPROVAL_REQUESTS.filter(r => r.status === 'approved').reduce((s, r) => s + (r.amount || 0), 0))}
                </span>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">Rejected</span>
                <span className="text-xl font-extrabold text-rose-700">
                  {INITIAL_APPROVAL_REQUESTS.filter(r => r.status === 'rejected').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Requester</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reviewer</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_APPROVAL_REQUESTS.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{req.title}</td>
                      <td className="py-3 px-3 text-slate-600">{req.requesterName}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(req.requested_at)}</td>
                      <td className="py-3 px-3 text-slate-600">{req.reviewerName || 'Pending'}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {req.amount !== undefined ? formatINR(req.amount) : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PROJECT PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">Project Progress</h3>
                <p className="text-xs text-slate-500">Site completion and handover deadlines.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                {filteredProjects.length} Projects
              </span>
            </div>

            <div className="space-y-3">
              {filteredProjects.map(proj => {
                const isOverBudget = Number(proj.spent) > Number(proj.budget);
                return (
                  <div key={proj.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">{proj.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({proj.client} • {proj.city})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          proj.status === 'On Track' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          proj.status === 'Budget Alert' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Handover: {formatDate(proj.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 font-semibold">
                        <span>Physical Completion</span>
                        <span className="font-extrabold text-brand-600">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, proj.progress))}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
                        <span className="font-bold text-slate-800">{formatINR(proj.budget)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Cost</span>
                        <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatINR(proj.spent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Contract</span>
                        <span className="font-bold text-slate-800">{formatINR(proj.contract_value ?? proj.budget)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Studio</span>
                        <span className="font-bold text-slate-700">{proj.branchName || 'Head Office'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* ── STUDIO CRM & SALES SUITE ── */}
      {reportSuite === 'crm' && (
        <div className="space-y-6">
          {/* Top 4 CRM KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Active Pipeline</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#111827] tabular-nums mt-1 block">
                {formatINR(totalPipelineValue)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                {activeLeads.length} active opportunities
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Lead Win Rate</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {leadWinRate.toFixed(1)}% won
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-emerald-700 tabular-nums mt-1 block">
                {wonLeads.length} of {totalLeads}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Converted into clients
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Proposals Quoted</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {quoteAcceptanceRate.toFixed(0)}% accepted
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-1 block">
                {formatINR(totalQuotesValue || 3450000)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                {quotations.length || 3} formal quotes
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">Avg. Deal Size</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-1 block">
                {formatINR(avgDealSize)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Turnkey residential scope
              </span>
            </div>
          </div>

          {/* CRM TAB 1: SALES FUNNEL & CONVERSION */}
          {crmActiveTab === 'funnel' && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Visual Funnel Bar Chart */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Lead Conversion Funnel</h3>
                      <p className="text-xs text-slate-500">Pipeline progression from inquiry to won project</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {totalLeads} Total Leads
                    </span>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={crmFunnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="stage" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {crmFunnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Conversion Stage Health & Win Ratio */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Conversion Velocity &amp; Win Rate</h3>
                    <p className="text-xs text-slate-500">Stage-by-stage qualification and conversion metrics</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Inquiry to Contacted</div>
                          <div className="text-[10px] text-slate-500">Speed to initial call or WhatsApp</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">92%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Contacted to Site Visit</div>
                          <div className="text-[10px] text-slate-500">On-site measurement scheduled</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">76%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Site Visit to Proposal</div>
                          <div className="text-[10px] text-slate-500">Custom quotation presented</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">68%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                          ★
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950">Proposal to Project Won</div>
                          <div className="text-[10px] text-emerald-800">Contract signed &amp; advance received</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-950">{leadWinRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('leads')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View All Active Leads ({activeLeads.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CRM TAB 2: LEAD SOURCES */}
          {crmActiveTab === 'sources' && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Donut Chart */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Lead Acquisition Channels</h3>
                      <p className="text-xs text-slate-500">Where high-value clients discover your interior studio</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{leads.length} sources tracked</span>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={crmSourceData}
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {crmSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value} leads`, 'Count']}
                          contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    {crmSourceData.map(item => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 truncate">{item.name}</span>
                        <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Quality Assessment */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Channel Performance &amp; ROI</h3>
                  
                  <div className="space-y-2.5">
                    {crmSourceData.map(source => {
                      const pct = totalLeads > 0 ? Math.round((source.value / totalLeads) * 100) : 0;
                      return (
                        <div key={source.name} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{source.name}</span>
                            <span className="font-bold text-slate-700">{source.value} leads ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: source.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CRM TAB 3: PROPOSALS & QUOTATIONS */}
          {crmActiveTab === 'proposals' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Quotation Acceptance &amp; Proposals</h3>
                    <p className="text-xs text-slate-500">Official proposals issued to prospective homeowners</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('quotations')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Open Quotations Studio</span>
                  </button>
                </div>

                {quotations.length === 0 ? (
                  <EmptyState
                    icon={ShoppingBag}
                    title="No quotations created yet"
                    description="Build detailed client quotations and send them for instant client e-approval."
                    actionLabel="Create Quotation"
                    onAction={() => setCurrentPage('quotations')}
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {quotations.map(q => (
                      <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {q.quotation_number || `QT-${q.id.slice(0, 6)}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.status === 'sent'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {q.status === 'approved' ? 'Approved & Won' : q.status === 'sent' ? 'Sent (Awaiting Response)' : 'Draft'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Valid until: {q.valid_until || '14 days'}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase">Quote Total</span>
                            <span className="text-sm font-bold text-slate-900">{formatINR(q.total || 0)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCurrentPage('quotations')}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                            title="View Quotation"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CRM TAB 4: ACTIVE OPPORTUNITIES PIPELINE */}
          {crmActiveTab === 'pipeline' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Deals &amp; Lead Velocity</h3>
                    <p className="text-xs text-slate-500">Every prospective homeowner currently exploring turnkey interior works</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('leads')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Go to Leads</span>
                  </button>
                </div>

                {leads.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No active leads in pipeline"
                    description="Add prospective homeowners to begin tracking their sales journey and site measurements."
                    actionLabel="Add First Lead"
                    onAction={() => setCurrentPage('leads')}
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {leads.map(lead => (
                      <div key={lead.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{lead.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {lead.source || 'Referral'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.status === 'Won'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lead.status === 'Lost'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {lead.requirement || 'Turnkey interior design & styling'} • {lead.phone || 'No phone'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase">Estimated Budget</span>
                            <span className="text-sm font-bold text-slate-900">
                              {lead.estimated_budget ? formatINR(lead.estimated_budget) : 'TBD'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCurrentPage('leads')}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                            title="View in Leads"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
