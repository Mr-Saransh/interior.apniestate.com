// ==============================================================================
// APNI ESTATE INTERIORS - CLIENT PAYMENTS & RECEIVABLES PAGE
// Real client milestone revenue tracking, partial collections, and overdue aging
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClientPayment, ClientPaymentStatus } from '../types';
import { formatINR, formatINRCompact, formatDate } from '../utils/formatters';
import { calculatePaymentScheduleMetrics } from '../lib/profitabilityMetrics';
import {
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ClientPaymentModal } from '../components/modals/ClientPaymentModal';
import { EmptyState } from '../components/common/EmptyState';
import { UnifiedFilterPopover } from '../components/common/UnifiedFilterPopover';

const STATUS_FILTERS: ('All' | ClientPaymentStatus)[] = [
  'All',
  'Pending',
  'Partially Paid',
  'Paid',
  'Overdue'
];

export const PaymentsPage: React.FC = () => {
  const { clientPayments, projects, clients, addClientPayment, updateClientPayment, deleteClientPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ClientPaymentStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<ClientPayment | null>(null);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return clientPayments.filter(p => {
      const matchesProject = selectedProjectId === 'All' || p.project_id === selectedProjectId;
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.projectName && p.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.payment_reference && p.payment_reference.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [clientPayments, selectedProjectId, selectedStatus, searchQuery]);

  // Overall Financial Metrics using authoritative engine
  const metrics = useMemo(() => {
    return calculatePaymentScheduleMetrics(clientPayments);
  }, [clientPayments]);

  const handleSave = async (paymentData: Partial<ClientPayment>) => {
    if (paymentToEdit) {
      await updateClientPayment(paymentToEdit.id, paymentData);
    } else {
      await addClientPayment(paymentData);
    }
  };

  const handleQuickMarkPaid = async (payment: ClientPayment) => {
    await updateClientPayment(payment.id, {
      paid_amount: payment.amount,
      paid_date: new Date().toISOString().split('T')[0],
      status: 'Paid'
    });
  };

  const paymentBreakdownChart = useMemo(
    () => [
      { stage: 'Collected', amount: metrics.totalReceived, fill: '#059669' },
      { stage: 'Pending Due', amount: Math.max(metrics.scheduleOutstanding - metrics.overdueAmount, 0), fill: '#1D4ED8' },
      { stage: 'Overdue', amount: metrics.overdueAmount, fill: '#E11D48' },
    ],
    [metrics]
  );

  return (
    <div className="space-y-5 pb-10">
      {/* Header & 4 KPI Cards */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-editorial text-2xl font-medium text-[#111827]">
              Client Payments
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Milestone invoices, stage advances, and payment receipts.
            </p>
          </div>

          <button
            onClick={() => {
              setPaymentToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Scheduled</span>
            <div className="text-lg font-bold text-[#111827] tabular-nums mt-0.5">
              {formatINR(metrics.totalScheduled)}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">{clientPayments.length} milestones</div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Received</span>
            <div className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
              {formatINR(metrics.totalReceived)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">{metrics.paidCount} collected</div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Pending</span>
            <div className="text-lg font-bold text-[#1D4ED8] tabular-nums mt-0.5">
              {formatINR(metrics.scheduleOutstanding)}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">{metrics.pendingCount} awaiting</div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <span className="text-[11px] font-semibold text-[#64748B]">Overdue</span>
            <div className="text-lg font-bold text-rose-600 tabular-nums mt-0.5">
              {formatINR(metrics.overdueAmount)}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">{metrics.overdueCount} overdue</div>
          </div>
        </div>
      </div>

      {/* Collections Breakdown Chart */}
      {clientPayments.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-[#111827]">Collection & Aging Health</h2>
            <p className="text-xs text-[#64748B]">Comparison of realized collections, upcoming dues, and overdue amounts</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentBreakdownChart} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatINRCompact(Number(v))}
                />
                <YAxis type="category" dataKey="stage" width={92} tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => formatINR(Number(val || 0))}
                  contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {paymentBreakdownChart.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search + Single Unified Filter Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search milestone, project, client, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <UnifiedFilterPopover
          activeCount={(selectedProjectId !== 'All' ? 1 : 0) + (selectedStatus !== 'All' ? 1 : 0)}
          onReset={() => {
            setSelectedProjectId('All');
            setSelectedStatus('All');
          }}
          fields={[
            {
              id: 'project',
              label: 'Project',
              type: 'select',
              value: selectedProjectId,
              onChange: setSelectedProjectId,
              options: [
                { label: 'All Projects', value: 'All' },
                ...projects.map((p) => ({ label: p.name, value: p.id }))
              ]
            },
            {
              id: 'status',
              label: 'Payment Status',
              type: 'pills',
              value: selectedStatus,
              onChange: (val) => setSelectedStatus(val as any),
              options: STATUS_FILTERS.map((st) => ({ label: st, value: st }))
            }
          ]}
        />
      </div>

      {/* Payments List / Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={IndianRupee}
          title="No client payments match your filters"
          description="Record milestone stages (e.g. 50% on booking, 30% on carpentry, 20% on handover)."
          actionLabel="Record New Payment"
          onAction={() => {
            setPaymentToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((p) => {
            const isFullyPaid = p.status === 'Paid';
            const isOverdue = p.status === 'Overdue';
            const isPartial = p.status === 'Partially Paid';
            const pctCollected = p.amount > 0 ? Math.min(100, Math.round((p.paid_amount / p.amount) * 100)) : 0;

            return (
              <div
                key={p.id}
                className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${isOverdue
                  ? 'border-rose-300 bg-rose-50/10 shadow-xs'
                  : isFullyPaid
                    ? 'border-slate-200/90 shadow-xs'
                    : 'border-slate-200/90 shadow-xs hover:border-brand-300'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Status Badge */}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${isFullyPaid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isOverdue
                        ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                        : isPartial
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                      {p.status}
                    </span>

                    {p.projectName && (
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.projectName}</span>
                      </span>
                    )}

                    {p.clientName && (
                      <span className="text-xs text-slate-400">
                        • {p.clientName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 mb-1">
                    {p.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Due: {formatDate(p.due_date)}</span>
                    {p.paid_date && (
                      <span className="text-emerald-600 font-semibold">
                        Received: {formatDate(p.paid_date)}
                      </span>
                    )}
                    {p.payment_method && (
                      <span>Mode: {p.payment_method}</span>
                    )}
                    {p.payment_reference && (
                      <span className="font-mono text-slate-600">Ref: {p.payment_reference}</span>
                    )}
                  </div>

                  {/* Progress Bar for Partial Collections */}
                  <div className="mt-2.5 max-w-md flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isFullyPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-brand-500'
                          }`}
                        style={{ width: `${pctCollected}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">
                      {pctCollected}% Paid ({formatINR(p.paid_amount)} of {formatINR(p.amount)})
                    </span>
                  </div>
                </div>

                {/* Amounts & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-display block">
                      {formatINR(p.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFullyPaid
                        ? 'Fully Settled'
                        : `Pending: ${formatINR(Math.max(p.amount - p.paid_amount, 0))}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isFullyPaid && (
                      <button
                        onClick={() => handleQuickMarkPaid(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                        title="Mark as fully received"
                      >
                        Mark Paid
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setPaymentToEdit(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete milestone "${p.title}"?`)) {
                          deleteClientPayment(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Payment Modal */}
      <ClientPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        paymentToEdit={paymentToEdit}
        projects={projects}
        clients={clients}
      />
    </div>
  );
};
