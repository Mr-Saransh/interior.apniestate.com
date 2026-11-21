// ==============================================================================
// APNI ESTATE INTERIORS - PROJECT FINANCE MANAGEMENT SECTION
// Complete lifecycle: Staged Obligations, Partial Payments, Transaction Ledger & Expenses
// ==============================================================================

import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  Calendar,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  FileText,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import {
  Project,
  ClientPayment,
  PaymentTransaction,
  Expense,
  Room,
  ProjectProfitabilitySummary
} from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

interface ProjectFinanceSectionProps {
  project: Project;
  profitability: ProjectProfitabilitySummary;
  projectPayments: ClientPayment[];
  projectPaymentTransactions: PaymentTransaction[];
  projectExpenses: Expense[];
  rooms: Room[];
  activeSubTab: 'obligations' | 'transactions' | 'expenses' | 'budget';
  onSubTabChange: (tab: 'obligations' | 'transactions' | 'expenses' | 'budget') => void;
  onOpenRecordPayment: (obligationId?: string) => void;
  onOpenAddMilestone: () => void;
  onEditPayment: (payment: ClientPayment) => void;
  onDeletePayment: (payment: ClientPayment) => void;
  onDeleteTransaction: (txId: string) => void;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

export const ProjectFinanceSection: React.FC<ProjectFinanceSectionProps> = ({
  project,
  profitability,
  projectPayments,
  projectPaymentTransactions,
  projectExpenses,
  rooms,
  activeSubTab,
  onSubTabChange,
  onOpenRecordPayment,
  onOpenAddMilestone,
  onEditPayment,
  onDeletePayment,
  onDeleteTransaction,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense
}) => {
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');

  const totalContract = Number(profitability.contractValue || project.budget || 0);
  const totalCollected = Number(profitability.revenueReceived || 0);
  const totalOutstanding = Math.max(0, totalContract - totalCollected);
  const totalExpenses = Number(profitability.actualCost || 0);
  const marginPct = Number(profitability.grossMarginPercentage || 0);

  const pendingObligationsCount = projectPayments.filter(p => {
    const bal = Math.max(0, Number(p.amount || 0) - Number(p.paid_amount || 0));
    return bal > 0;
  }).length;

  const filteredExpenses = projectExpenses.filter(exp => {
    if (expenseCategoryFilter !== 'All' && exp.category !== expenseCategoryFilter) return false;
    if (expenseSearch) {
      const q = expenseSearch.toLowerCase();
      return (
        exp.title.toLowerCase().includes(q) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(q)) ||
        (exp.category && exp.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── 1. FINANCE EXECUTIVE KPI DASHBOARD ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Contract Value</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              ₹
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-slate-900 mt-2 tabular-nums">
            {formatINR(totalContract)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Agreed project value</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Collected</span>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              {totalContract > 0 ? `${((totalCollected / totalContract) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-emerald-600 mt-2 tabular-nums">
            {formatINR(totalCollected)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Total receipts cleared</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Balance Due</span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-amber-600 mt-2 tabular-nums">
            {formatINR(totalOutstanding)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Pending from client</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Site Spend</span>
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-slate-800 mt-2 tabular-nums">
            {formatINR(totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Total recorded costs</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Gross Margin</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${marginPct >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {marginPct.toFixed(0)}%
            </span>
          </div>
          <div className={`text-xl font-extrabold font-display mt-2 tabular-nums ${marginPct >= 0 ? 'text-brand-700' : 'text-rose-600'}`}>
            {formatINR(totalCollected - totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Net realized cash</span>
        </div>
      </div>

      {/* ── 2. SUB-VIEW SEGMENTED SWITCHER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSubTabChange('obligations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'obligations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Staged Payments &amp; Milestones</span>
            {pendingObligationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
                {pendingObligationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('transactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'transactions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transaction Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {projectPaymentTransactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('expenses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span>Site Expenses &amp; Bills</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {projectExpenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('budget')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'budget'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Budget Analysis</span>
          </button>
        </div>

        {/* Action button corresponding to sub-tab */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'obligations' && (
            <>
              <button
                type="button"
                onClick={() => onOpenRecordPayment()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record Payment</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddMilestone}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>+ Add Payment Stage</span>
              </button>
            </>
          )}

          {activeSubTab === 'transactions' && (
            <button
              type="button"
              onClick={() => onOpenRecordPayment()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Transaction</span>
            </button>
          )}

          {activeSubTab === 'expenses' && (
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Site Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. SUB-VIEW: STAGED PAYMENTS & MILESTONES ── */}
      {activeSubTab === 'obligations' && (
        <div className="space-y-4">
          {projectPayments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payment stages or milestone obligations created yet"
              description="Break down the project contract into staged payments (e.g. 10% Advance, 40% Structure, 40% Woodwork, 10% Handover) to track partial receipts."
              actionLabel="+ Create First Payment Stage"
              onAction={onOpenAddMilestone}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Milestone / Stage</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Agreed Amount</th>
                      <th className="py-3 px-4 text-right">Paid to Date</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-center">Lifecycle Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectPayments.map((p) => {
                      const agreed = Number(p.amount || 0);
                      const paid = Number(p.paid_amount || 0);
                      const balance = Math.max(0, agreed - paid);
                      const isFullyPaid = paid >= agreed && agreed > 0;
                      const isPartial = paid > 0 && paid < agreed;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {p.title || (p as any).milestone_name}
                            </span>
                            {p.notes && (
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {p.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            {formatDate(p.due_date)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                            {formatINR(agreed)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                            {formatINR(paid)}
                            {agreed > 0 && (
                              <span className="text-[10px] text-slate-400 block">
                                {((paid / agreed) * 100).toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-amber-600 tabular-nums">
                            {formatINR(balance)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isFullyPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid</span>
                              </span>
                            ) : isPartial ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Partially Paid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                <span>Unpaid</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {balance > 0 && (
                                <button
                                  type="button"
                                  onClick={() => onOpenRecordPayment(p.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                                  title="Record partial or full payment"
                                >
                                  + Record Payment
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onEditPayment(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Edit Stage"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeletePayment(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Stage"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. SUB-VIEW: TRANSACTION HISTORY LEDGER ── */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Audit Ledger:</strong> Every cleared transaction recorded here automatically adjusts the milestone obligation balance.
              </span>
            </div>
            <span className="font-bold text-xs text-blue-950">
              Total Recorded: {formatINR(projectPaymentTransactions.reduce((s, t) => s + (Number(t.amount) || 0), 0))}
            </span>
          </div>

          {projectPaymentTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payment transactions logged in this project ledger"
              description="Click '+ Record Payment' above to log bank transfers, UPI receipts, or cheques against project milestones."
              actionLabel="+ Record First Transaction"
              onAction={() => onOpenRecordPayment()}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Stage / Obligation</th>
                      <th className="py-3 px-4 text-right">Amount Paid</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Reference / UTR</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectPaymentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {formatDate(tx.payment_date)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {tx.obligation_title || 'General Project Receipt'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 tabular-nums">
                          {formatINR(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {tx.payment_method || 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {tx.reference_number || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {tx.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove transaction of ${formatINR(tx.amount)}? This will restore the outstanding balance.`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. SUB-VIEW: SITE EXPENSES & BILLS ── */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses by title or vendor..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none w-64 bg-white"
                />
              </div>

              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-brand-500"
              >
                <option value="All">All Categories</option>
                {['Civil', 'Carpentry', 'Electrical', 'Painting', 'Plumbing', 'Labour', 'Material', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-900">{filteredExpenses.length}</strong> expense records (Total: <strong className="text-slate-900">{formatINR(filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0))}</strong>)
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={IndianRupee}
              title="No expenses found"
              description="Record site expenses, vendor payments, and daily material purchases."
              actionLabel="+ Add Site Expense"
              onAction={onOpenAddExpense}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Expense Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{exp.title}</span>
                          {exp.notes && <span className="text-[10px] text-slate-400">{exp.notes}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{exp.vendor || '—'}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(exp.date)}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                          {formatINR(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            exp.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {exp.paymentStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditExpense(exp)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteExpense(exp)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 6. SUB-VIEW: BUDGET VS ACTUAL ANALYSIS ── */}
      {activeSubTab === 'budget' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="premium-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Spend vs. Contract Budget
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Contract Utilization</span>
                    <span className="font-bold text-slate-900">
                      {totalContract > 0 ? `${((totalExpenses / totalContract) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <ProgressBar
                    value={totalContract > 0 ? (totalExpenses / totalContract) * 100 : 0}
                    height="md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Agreed Budget</span>
                    <span className="font-bold text-slate-900">{formatINR(totalContract)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Actual Spent</span>
                    <span className="font-bold text-brand-600">{formatINR(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Cash Flow Health
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Total Client Receipts:</span>
                  <strong className="text-emerald-600 font-bold">{formatINR(totalCollected)}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Total Site Outflows:</span>
                  <strong className="text-slate-800 font-bold">{formatINR(totalExpenses)}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-900 font-bold">Realized Site Cash Surplus:</span>
                  <strong className={`font-black text-sm ${totalCollected >= totalExpenses ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formatINR(totalCollected - totalExpenses)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
