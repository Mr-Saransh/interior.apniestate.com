// ==============================================================================
// APNI ESTATE INTERIORS - RECORD PARTIAL PAYMENT MODAL
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { IndianRupee, Calendar, CreditCard, Hash, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultObligationId?: string;
}

const PAYMENT_METHODS = [
  'Bank Transfer / NEFT / RTGS',
  'UPI / GPay / PhonePe',
  'Cheque',
  'Cash',
  'Credit Card / Debit Card',
  'Other'
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultObligationId
}) => {
  const { clientPayments, addPaymentTransaction, addClientPayment, projects } = useApp();

  const projectPayments = clientPayments.filter(p => p.project_id === projectId || (p as any).projectId === projectId);
  const currentProject = projects.find(p => p.id === projectId);

  const [obligationId, setObligationId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer / NEFT / RTGS');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('Project Milestone Payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultObligationId && projectPayments.some(p => p.id === defaultObligationId)) {
        setObligationId(defaultObligationId);
        const sel = projectPayments.find(p => p.id === defaultObligationId);
        if (sel) {
          const balance = Math.max(0, Number(sel.amount || 0) - Number(sel.paid_amount || 0));
          setAmount(balance > 0 ? balance.toString() : '');
        }
      } else if (projectPayments.length > 0) {
        // Find first partially paid or unpaid
        const pending = projectPayments.find(p => {
          const bal = Math.max(0, Number(p.amount || 0) - Number(p.paid_amount || 0));
          return bal > 0;
        }) || projectPayments[0];
        setObligationId(pending.id);
        const bal = Math.max(0, Number(pending.amount || 0) - Number(pending.paid_amount || 0));
        setAmount(bal > 0 ? bal.toString() : '');
      } else {
        setObligationId('__new__');
        setAmount('');
      }
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer / NEFT / RTGS');
      setReferenceNumber('');
      setNotes('');
      setError(null);
    }
  }, [isOpen, defaultObligationId, projectId, projectPayments.length]);

  const selectedObligation = projectPayments.find(p => p.id === obligationId);
  const obligationAmount = selectedObligation ? Number(selectedObligation.amount || 0) : 0;
  const currentPaid = selectedObligation ? Number(selectedObligation.paid_amount || 0) : 0;
  const currentBalance = Math.max(0, obligationAmount - currentPaid);

  const numAmount = Number(amount) || 0;
  const newBalance = selectedObligation ? Math.max(0, currentBalance - numAmount) : 0;
  const newStatus = selectedObligation
    ? (currentPaid + numAmount >= obligationAmount && obligationAmount > 0
        ? 'Fully Paid'
        : currentPaid + numAmount > 0
        ? 'Partially Paid'
        : 'Unpaid')
    : 'Received';

  const handleObligationChange = (newId: string) => {
    setObligationId(newId);
    if (newId === '__new__') {
      setAmount('');
    } else {
      const found = projectPayments.find(p => p.id === newId);
      if (found) {
        const bal = Math.max(0, Number(found.amount || 0) - Number(found.paid_amount || 0));
        setAmount(bal > 0 ? bal.toString() : '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (!paymentDate) {
      setError('Please select a payment date.');
      return;
    }

    setLoading(true);
    try {
      let targetObligationId = obligationId;
      let targetTitle = selectedObligation?.title || customTitle;

      if (obligationId === '__new__' || projectPayments.length === 0) {
        // Create an obligation on the fly
        const created = await addClientPayment({
          project_id: projectId,
          client_id: (currentProject as any)?.client_id || (currentProject as any)?.clientId,
          title: customTitle.trim() || 'Project Payment',
          amount: numAmount,
          due_date: paymentDate,
          paid_amount: numAmount,
          paid_date: paymentDate,
          status: 'Paid',
          payment_method: paymentMethod,
          payment_reference: referenceNumber,
          notes: notes
        });
        targetObligationId = created.id;
        targetTitle = created.title;
      }

      await addPaymentTransaction({
        project_id: projectId,
        obligation_id: targetObligationId,
        obligation_title: targetTitle,
        amount: numAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment / Staged Partial Payment"
      subtitle={currentProject ? `Project: ${currentProject.name}` : undefined}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Obligation / Milestone Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Payment Stage / Obligation
          </label>
          <select
            value={obligationId}
            onChange={(e) => handleObligationChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {projectPayments.map((p) => {
              const bal = Math.max(0, Number(p.amount || 0) - Number(p.paid_amount || 0));
              const statusLabel = bal <= 0 ? 'Fully Paid' : p.paid_amount > 0 ? `Partial (Due: ${formatINR(bal)})` : `Unpaid (Due: ${formatINR(bal)})`;
              return (
                <option key={p.id} value={p.id}>
                  {p.title} • {formatINR(p.amount)} ({statusLabel})
                </option>
              );
            })}
            <option value="__new__">+ New Staged Payment / Ad-hoc Advance</option>
          </select>
        </div>

        {obligationId === '__new__' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Stage / Description
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Booking Advance, Milestone 2, Final Settlement"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>
        )}

        {/* Selected Obligation Context Card */}
        {selectedObligation && obligationId !== '__new__' && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Agreed</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{formatINR(obligationAmount)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid to Date</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600">{formatINR(currentPaid)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Balance</span>
                <span className="text-xs sm:text-sm font-bold text-amber-600">{formatINR(currentBalance)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amount to Record (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
            {selectedObligation && currentBalance > 0 && numAmount !== currentBalance && (
              <button
                type="button"
                onClick={() => setAmount(currentBalance.toString())}
                className="mt-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Pay full balance ({formatINR(currentBalance)})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Method & UTR / Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ref / Transaction / UTR No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR49281948 or Cheque #102938"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes / Receipt Remarks
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cleared via HDFC Bank, receipt shared with client via WhatsApp"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Live Calculation Impact Banner */}
        {selectedObligation && numAmount > 0 && (
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-semibold block">After this payment:</span>
              <span className="text-[11px] text-blue-700">
                New remaining balance: <strong className="font-bold">{formatINR(newBalance)}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
              newBalance === 0 ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
            }`}>
              {newStatus}
            </span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Recording...' : 'Confirm & Record Payment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
