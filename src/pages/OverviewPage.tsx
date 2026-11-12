import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderKanban,
  Plus,
  IndianRupee,
  Receipt,
  Users,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { formatINRCompact } from '../utils/formatters';
import { quotationService } from '../services/quotationService';

type AttentionItem = {
  id: string;
  title: string;
  context: string;
  label: string;
  onSelect: () => void;
};

const getToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`));

export const OverviewPage: React.FC = () => {
  const {
    projects,
    tasks,
    purchases,
    expenses,
    leads,
    workspaceMode,
    setWorkspaceMode,
    setCurrentPage,
    setIsNewProjectModalOpen,
    setIsAddExpenseModalOpen,
    openProjectDetail,
    globalSearch,
    stats
  } = useApp();
  const { profile, organization, isDemoMode } = useAuth();
  const [pendingClientApprovals, setPendingClientApprovals] = useState(0);
  const [approvalDataError, setApprovalDataError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPendingClientApprovals = async () => {
      try {
        if (isDemoMode) {
          const saved = localStorage.getItem('apni_estate_quotations');
          const quotes = saved ? JSON.parse(saved) : [];
          if (active) {
            setPendingClientApprovals(
              quotes.filter((quote: { status?: string }) => quote.status === 'sent').length,
            );
          }
        } else if (organization?.id) {
          const quotes = await quotationService.getQuotations(organization.id);
          if (active) setPendingClientApprovals(quotes.filter(quote => quote.status === 'sent').length);
        } else if (active) {
          setPendingClientApprovals(0);
        }
        if (active) setApprovalDataError('');
      } catch (error) {
        if (active) {
          setApprovalDataError(error instanceof Error ? error.message : 'Client approvals could not be loaded.');
        }
      }
    };

    loadPendingClientApprovals();
    return () => {
      active = false;
    };
  }, [organization?.id, isDemoMode]);

  const userFirstName = profile?.full_name?.trim().split(' ')[0] || (isDemoMode ? 'Aarav' : 'there');
  const studioName = organization?.name || (isDemoMode ? 'Apni Estate Interiors' : 'My Studio');
  const activeProjects = projects.filter(project => project.status !== 'Completed');
  const today = getToday();
  const overdueTasks = tasks
    .filter(task => {
      const dueDate = task.due_date || task.dueDate;
      return Boolean(dueDate && dueDate < today && task.status !== 'Completed' && task.status !== 'Cancelled');
    })
    .sort((a, b) => (a.due_date || a.dueDate || '').localeCompare(b.due_date || b.dueDate || ''));
  const overduePurchases = purchases.filter(purchase =>
    Boolean(
      purchase.expected_delivery &&
      purchase.expected_delivery < today &&
      !['Received', 'Delivered', 'Cancelled', 'received', 'delivered', 'cancelled'].includes(purchase.status),
    ),
  );
  const projectsNeedingAttention = activeProjects.filter(project => project.status !== 'On Track');

  const attentionItems: AttentionItem[] = [
    ...overdueTasks.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      context: task.projectName || projects.find(project => project.id === (task.project_id || task.projectId))?.name || 'Project task',
      label: `Due ${formatDate(task.due_date || task.dueDate || today)}`,
      onSelect: () => setCurrentPage('tasks'),
    })),
    ...overduePurchases.map(purchase => ({
      id: `purchase-${purchase.id}`,
      title: `${purchase.po_number} · ${purchase.vendorName || 'Vendor'}`,
      context: purchase.projectName || projects.find(project => project.id === (purchase.project_id || purchase.projectId))?.name || 'Project purchase',
      label: 'Delivery overdue',
      onSelect: () => setCurrentPage('purchases'),
    })),
    ...projectsNeedingAttention.map(project => ({
      id: `project-${project.id}`,
      title: project.name,
      context: `${project.city || project.location} · ${Math.round(project.progress)}% complete`,
      label: project.status,
      onSelect: () => openProjectDetail(project.id),
    })),
    ...(pendingClientApprovals > 0
      ? [{
          id: 'client-approvals',
          title: `${pendingClientApprovals} quotation${pendingClientApprovals === 1 ? '' : 's'} awaiting client response`,
          context: 'Proposals sent to clients',
          label: 'Client decision',
          onSelect: () => setCurrentPage('quotations'),
        }]
      : []),
  ].slice(0, 4);

  const query = globalSearch.trim().toLowerCase();
  const visibleProjects = activeProjects
    .filter(project =>
      !query ||
      [project.name, project.client, project.city, project.location]
        .some(value => value?.toLowerCase().includes(query)),
    )
    .slice(0, 4);

  const totalCommittedBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpentExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const activeLeadsCount = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* ── Studio Header Banner ── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
              {studioName}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {workspaceMode === 'erp' ? 'Interior ERP Workspace' : 'Studio CRM Pipeline'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#111827]">
            Good day, {userFirstName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
            Here is your studio's operational pulse across active site deliveries and client engagements.
          </p>
        </div>

        {/* Quick Mode Toggle on Page */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-[#E5E7EB] p-1 rounded-xl shadow-subtle">
            <button
              onClick={() => setWorkspaceMode('erp')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                workspaceMode === 'erp' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ERP View
            </button>
            <button
              onClick={() => setWorkspaceMode('crm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                workspaceMode === 'crm' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CRM View
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </section>

      {/* ── Studio Pulse Metric Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setCurrentPage('projects')}
          className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-slate-300 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-[#1D4ED8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">
            {activeProjects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeProjects.filter(p => p.status === 'On Track').length} on track
          </div>
        </div>

        <div 
          onClick={() => setCurrentPage('budget')}
          className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-slate-300 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Committed Budget</span>
            <IndianRupee className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">
            {formatINRCompact(totalCommittedBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {activeProjects.length} client sites
          </div>
        </div>

        <div 
          onClick={() => setCurrentPage('expenses')}
          className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-slate-300 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Spent</span>
            <Receipt className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">
            {formatINRCompact(totalSpentExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Expenses & material ledger
          </div>
        </div>

        <div 
          onClick={() => setCurrentPage('leads')}
          className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-slate-300 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sales Pipeline</span>
            <Users className="w-4 h-4 text-[#1D4ED8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111827] tabular-nums">
            {activeLeadsCount} <span className="text-xs font-normal text-slate-400">Leads</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingClientApprovals} pending quotes
          </div>
        </div>
      </section>

      {/* ── Main Content Split Grid ── */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        
        {/* Left Column: Active Projects with Editorial Details */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Active Projects & Rooms</h2>
              <p className="text-xs text-slate-500">Pick up room-wise BOQs, progress, and photos</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('projects')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {visibleProjects.length > 0 ? (
            <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white shadow-subtle overflow-hidden">
              {visibleProjects.map(project => {
                const roomCount = project.rooms ? project.rooms.length : 0;
                const progressVal = Math.round(project.progress || 0);

                return (
                  <div
                    key={project.id}
                    onClick={() => openProjectDetail(project.id)}
                    className="p-4 sm:p-4.5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-editorial text-base sm:text-lg font-bold text-[#111827] truncate">
                          {project.name}
                        </h3>
                        <Badge status={project.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">{project.client}</span>
                        <span>•</span>
                        <span>{project.city || project.location || 'India'}</span>
                        {roomCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400" />
                              <span>{roomCount} {roomCount === 1 ? 'room' : 'rooms'}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-xs font-bold text-[#111827] tabular-nums">
                        {formatINRCompact(project.budget || 0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 sm:w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#1D4ED8] h-full rounded-full transition-all" 
                            style={{ width: `${Math.min(progressVal, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                          {progressVal}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-[#E5E7EB] bg-white">
              <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-[#111827]">No active projects found</div>
              <p className="text-xs text-slate-500 mt-1">Create your first project to start building room-wise BOQs.</p>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs"
              >
                + Create Project
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Attention Feed & Quick Actions */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Needs Your Attention</h2>
            <p className="text-xs text-slate-500">Overdue site tasks, POs, and quotes</p>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-subtle divide-y divide-[#E5E7EB] overflow-hidden">
            {approvalDataError && (
              <p role="alert" className="bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
                {approvalDataError}
              </p>
            )}

            {attentionItems.length > 0 ? (
              attentionItems.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={item.onSelect}
                  className="flex w-full items-center gap-3 p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-[#111827]">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.context}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                    {item.label}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-[#111827]">All Caught Up</div>
                <div className="text-[11px] text-slate-500 mt-0.5">No overdue site tasks or pending purchase orders.</div>
              </div>
            )}
          </div>

          {/* Quick Studio Shortcuts */}
          <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white shadow-subtle space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="p-2.5 rounded-lg bg-[#F4F6FA] hover:bg-slate-100 text-left font-medium text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>+ Add Expense</span>
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setCurrentPage('quotations')}
                className="p-2.5 rounded-lg bg-[#F4F6FA] hover:bg-slate-100 text-left font-medium text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>+ Proposal</span>
                <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setCurrentPage('leads')}
                className="p-2.5 rounded-lg bg-[#F4F6FA] hover:bg-slate-100 text-left font-medium text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>+ New Lead</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setCurrentPage('site-controls')}
                className="p-2.5 rounded-lg bg-[#F4F6FA] hover:bg-slate-100 text-left font-medium text-slate-800 transition-colors flex items-center justify-between"
              >
                <span>Site Controls</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
