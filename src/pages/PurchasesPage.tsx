// ==============================================================================
// APNI ESTATE INTERIORS - PURCHASES & PROCUREMENT ORDERS PAGE
// Multi-item purchase orders, vendor tracking, line item breakdowns & fulfillment
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BOQItem, Purchase, PurchaseStatus, PurchasePaymentStatus } from '../types';
import { formatINR, formatINRCompact, formatDate } from '../utils/formatters';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2,
  Package,
  Layers,
  AlertCircle
} from 'lucide-react';
import { PurchaseModal } from '../components/modals/PurchaseModal';
import { EmptyState } from '../components/common/EmptyState';
import { GoodsReceiptModal } from '../components/modals/GoodsReceiptModal';
import { UnifiedFilterPopover } from '../components/common/UnifiedFilterPopover';

const FULFILLMENT_FILTERS: ('All' | PurchaseStatus)[] = [
  'All',
  'Draft',
  'Ordered',
  'Partially Received',
  'Received',
  'Cancelled'
];

export const PurchasesPage: React.FC = () => {
  const { purchases, projects, vendors, boqItems, addPurchase, updatePurchase, deletePurchase, refreshData } = useApp();
  const { isDemoMode } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | PurchaseStatus>('All');
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);
  const [goodsReceiptPurchase, setGoodsReceiptPurchase] = useState<Purchase | null>(null);
  const [actionError, setActionError] = useState('');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesProject = selectedProjectId === 'All' || p.project_id === selectedProjectId;
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
      const matchesSearch = 
        p.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.projectName && p.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.vendorName && p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.items && p.items.some(it => it.item_name.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [purchases, selectedProjectId, selectedStatus, searchQuery]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalSpend = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const activeOrders = purchases.filter(p => p.status === 'Ordered' || p.status === 'Partially Received').length;
    const fulfilled = purchases.filter(p => p.status === 'Received').length;
    const draftCount = purchases.filter(p => p.status === 'Draft').length;

    return {
      totalSpend,
      activeOrders,
      fulfilled,
      draftCount
    };
  }, [purchases]);

  const materialRequirements = useMemo(() => {
    const rows = new Map<string, {
      name: string;
      unit: string;
      required: number;
      ordered: number;
      received: number;
      plannedCost: number;
      committedCost: number;
    }>();
    const selectedProjects = selectedProjectId === 'All'
      ? projects.map(project => project.id)
      : [selectedProjectId];
    const keyFor = (name: string, unit: string) => `${name.trim().toLocaleLowerCase()}|${unit.trim().toLocaleLowerCase()}`;

    boqItems.filter((item: BOQItem) => selectedProjects.includes(item.project_id) && item.approved_at).forEach(item => {
      const unit = item.unit || 'Nos';
      const key = keyFor(item.item_name, unit);
      const row = rows.get(key) || {
        name: item.item_name,
        unit,
        required: 0,
        ordered: 0,
        received: 0,
        plannedCost: 0,
        committedCost: 0
      };
      row.required += Number(item.quantity) || 0;
      row.plannedCost += Number(item.estimated_cost) || 0;
      rows.set(key, row);
    });

    purchases.filter(purchase =>
      selectedProjects.includes(purchase.project_id) &&
      (purchase.status === 'Ordered' || purchase.status === 'Partially Received' ||
       purchase.status === 'Received' || purchase.status === 'Delivered')
    ).forEach(purchase => {
      (purchase.items || []).forEach(item => {
        const key = keyFor(item.item_name, item.unit || 'Nos');
        const row = rows.get(key);
        if (!row) return;
        row.ordered += Number(item.quantity) || 0;
        row.received += Number(item.received_quantity) || 0;
        row.committedCost += Number(item.total) || (Number(item.quantity) * Number(item.rate)) || 0;
      });
    });

    return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [boqItems, projects, purchases, selectedProjectId]);

  const handleSave = async (purchaseData: any) => {
    if (purchaseToEdit) {
      await updatePurchase(purchaseToEdit.id, purchaseData);
    } else {
      await addPurchase(purchaseData);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPoId(prev => prev === id ? null : id);
  };

  const handleDelete = async (purchase: Purchase) => {
    if (!confirm(`Delete purchase order "${purchase.po_number}"?`)) return;
    setActionError('');
    try {
      await deletePurchase(purchase.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the purchase order.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Purchase Orders
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {purchases.length}
          </span>
        </div>

        <button
          onClick={() => {
            setPurchaseToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</p>}

      {/* Procurement Metrics — Compact & Visual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Orders Total</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {formatINRCompact(metrics.totalSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{purchases.length} orders</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">In Transit</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-900 tabular-nums">
            {metrics.activeOrders}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Expected</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Fulfilled</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">
            {metrics.fulfilled}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Delivered</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Drafts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700 tabular-nums">
            {metrics.draftCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Unsent</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col gap-1 border-b border-slate-100 p-4 sm:p-5">
          <h2 className="text-sm font-extrabold text-slate-900">Approved BOQ material requirements</h2>
          <p className="text-xs text-slate-500">Matches PO lines by item name and unit. PO committed cost is not treated as a paid expense.</p>
        </div>
        {materialRequirements.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Approve project BOQs to compare required quantities with ordered and received materials.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr><th className="px-4 py-3">Material / item</th><th className="px-4 py-3 text-right">Required</th><th className="px-4 py-3 text-right">Ordered</th><th className="px-4 py-3 text-right">Received</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3 text-right">Planned cost</th><th className="px-4 py-3 text-right">PO committed</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materialRequirements.map(row => {
                  const excess = row.ordered > row.required;
                  return (
                    <tr key={`${row.name}-${row.unit}`}>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.name}<span className="ml-1.5 text-[10px] font-medium text-slate-400">{row.unit}</span></td>
                      <td className="px-4 py-3 text-right">{row.required}</td>
                      <td className={`px-4 py-3 text-right font-bold ${excess ? 'text-rose-700' : ''}`}>{row.ordered}{excess && <span className="block text-[10px] font-semibold">Over by {(row.ordered - row.required).toFixed(2)}</span>}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{row.received}</td>
                      <td className="px-4 py-3 text-right">{Math.max(row.required - row.received, 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{formatINR(row.plannedCost)}</td>
                      <td className="px-4 py-3 text-right">{formatINR(row.committedCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Search + Single Unified Filter Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search PO number, item, project, or vendor..."
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
              label: 'Fulfillment Status',
              type: 'pills',
              value: selectedStatus,
              onChange: (val) => setSelectedStatus(val as any),
              options: FULFILLMENT_FILTERS.map((st) => ({ label: st, value: st }))
            }
          ]}
        />
      </div>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchase orders found"
          description="Create structured procurement orders for plywood, paint, sanitaryware, or lighting."
          actionLabel="+ Create Purchase Order"
          onAction={() => {
            setPurchaseToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => {
            const isExpanded = expandedPoId === purchase.id;
            const isReceived = purchase.status === 'Received';
            const isCancelled = purchase.status === 'Cancelled';
            const itemCount = purchase.items?.length || 0;
            const hasGoodsReceipt = (purchase.items || []).some(item =>
              Number(item.received_quantity) > 0 || Number(item.rejected_quantity) > 0
            );

            return (
              <div
                key={purchase.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-brand-300 transition-all overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-black font-mono text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {purchase.po_number}
                      </span>

                      {/* Status Badges */}
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                        isReceived
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isCancelled
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : purchase.status === 'Ordered'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {purchase.status}
                      </span>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                        Payment: {purchase.payment_status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-1.5">
                      {purchase.projectName && (
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{purchase.projectName}</span>
                        </span>
                      )}

                      {purchase.vendorName && (
                        <span className="font-semibold text-brand-700">
                          Supplier: {purchase.vendorName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span>Ordered: {formatDate(purchase.order_date)}</span>
                      {purchase.expected_delivery && (
                        <span>Delivery: {formatDate(purchase.expected_delivery)}</span>
                      )}
                      <span>{itemCount} line {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  {/* Amounts & Expand Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-base sm:text-xl font-black text-slate-900 font-display block">
                        {formatINR(purchase.total_amount)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Total Order Cost
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleExpand(purchase.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Items' : 'View Items'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setPurchaseToEdit(purchase);
                          setIsModalOpen(true);
                        }}
                        disabled={hasGoodsReceipt}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 p-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title={hasGoodsReceipt ? 'Purchase orders with receipts cannot be edited.' : 'Edit PO'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(purchase)}
                        disabled={hasGoodsReceipt}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                        title={hasGoodsReceipt ? 'Purchase orders with receipts cannot be deleted.' : 'Delete PO'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Line Items Table */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-4 border-t border-slate-200/80 animate-in fade-in duration-200">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <Package className="w-4 h-4 text-brand-600" />
                        <span>Line Items &amp; Receipt Progress</span>
                      </h4>
                      {!isDemoMode && (purchase.status === 'Ordered' || purchase.status === 'Partially Received') && (
                        <button onClick={() => setGoodsReceiptPurchase(purchase)}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                          <Truck className="h-3.5 w-3.5" /> Record goods receipt
                        </button>
                      )}
                    </div>
                    {isDemoMode && (purchase.status === 'Ordered' || purchase.status === 'Partially Received') && (
                      <p className="mb-2 text-[10px] text-slate-500">Goods receipt entry is available in a connected workspace.</p>
                    )}

                    {(!purchase.items || purchase.items.length === 0) ? (
                      <div className="text-xs text-slate-400 italic">No line item details available.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-1.5 px-2">#</th>
                              <th className="py-1.5 px-2">Item Name & Description</th>
                              <th className="py-1.5 px-2 text-center">Qty</th>
                              <th className="py-1.5 px-2 text-center">Accepted</th>
                              <th className="py-1.5 px-2 text-center">Remaining</th>
                              <th className="py-1.5 px-2 text-center">Unit</th>
                              <th className="py-1.5 px-2 text-right">Unit Rate</th>
                              <th className="py-1.5 px-2 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                            {purchase.items.map((it, idx) => (
                              <tr key={it.id || idx} className="hover:bg-white/60">
                                <td className="py-2 px-2 text-slate-400 font-mono">{idx + 1}</td>
                                <td className="py-2 px-2">
                                  <span className="font-bold text-slate-900 block">{it.item_name}</span>
                                  {it.description && <span className="text-[11px] text-slate-400">{it.description}</span>}
                                </td>
                                <td className="py-2 px-2 text-center font-bold">{it.quantity}</td>
                                <td className="py-2 px-2 text-center font-bold text-emerald-700">{it.received_quantity || 0}</td>
                                <td className="py-2 px-2 text-center text-slate-500">{Math.max(it.quantity - (it.received_quantity || 0), 0)}</td>
                                <td className="py-2 px-2 text-center text-slate-500">{it.unit}</td>
                                <td className="py-2 px-2 text-right">{formatINR(it.rate)}</td>
                                <td className="py-2 px-2 text-right font-bold text-slate-900">{formatINR(it.total || (it.quantity * it.rate))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {purchase.notes && (
                      <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <strong className="font-semibold text-slate-700">Procurement Notes:</strong> {purchase.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        purchaseToEdit={purchaseToEdit}
        projects={projects}
        vendors={vendors}
      />
      <GoodsReceiptModal
        isOpen={Boolean(goodsReceiptPurchase)}
        purchase={goodsReceiptPurchase}
        projectLocation={projects.find(project => project.id === goodsReceiptPurchase?.project_id)?.location}
        onClose={() => setGoodsReceiptPurchase(null)}
        onSaved={refreshData}
      />
    </div>
  );
};
