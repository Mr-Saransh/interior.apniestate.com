// ==============================================================================
// APNI ESTATE INTERIORS - PROJECT MATERIAL MANAGEMENT SECTION
// Complete tracking: Required vs. Ordered vs. Received + PDF/Excel Extractor Import
// ==============================================================================

import React, { useState } from 'react';
import {
  Package,
  Plus,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  History,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Material, MaterialTransaction, Room } from '../../types';
import { formatINR } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { materialService } from '../../services/materialService';

interface ProjectMaterialsSectionProps {
  projectId: string;
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  rooms: Room[];
  onOpenAddMaterial: () => void;
  onOpenImportMaterials: () => void;
  onOpenReceiveStock: (material: Material) => void;
  onOpenStockHistory: (material: Material) => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (material: Material) => void;
}

const COMMON_CATEGORIES = [
  'All',
  'Plywood & Boards',
  'Laminates & Veneer',
  'Hardware & Fittings',
  'Paints & Primers',
  'Electrical & Wire',
  'Tiles & Stone',
  'Sanitary & Plumbing',
  'Glass & Mirrors',
  'Civil Materials',
  'Other'
];

export const ProjectMaterialsSection: React.FC<ProjectMaterialsSectionProps> = ({
  projectId,
  materials,
  materialTransactions,
  rooms,
  onOpenAddMaterial,
  onOpenImportMaterials,
  onOpenReceiveStock,
  onOpenStockHistory,
  onEditMaterial,
  onDeleteMaterial
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const totalMaterialsCount = materials.length;
  const fullyReceivedCount = materials.filter(m => {
    const req = Number(m.quantity_required ?? m.quantity_ordered ?? 0);
    const rec = Number(m.quantity_received ?? 0);
    return m.delivery_status === 'Received' || (rec >= req && req > 0);
  }).length;

  const partiallyReceivedCount = materials.filter(m => {
    const req = Number(m.quantity_required ?? m.quantity_ordered ?? 0);
    const rec = Number(m.quantity_received ?? 0);
    return m.delivery_status === 'Partially Received' || (rec > 0 && rec < req);
  }).length;

  const pendingCount = Math.max(0, totalMaterialsCount - (fullyReceivedCount + partiallyReceivedCount));

  const filteredMaterials = materials.filter(m => {
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.unit && m.unit.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalEstimatedCost = materials.reduce((sum, m) => {
    const qty = Number(m.quantity_required ?? m.quantity_ordered ?? 0);
    const rate = Number(m.estimated_rate ?? 0);
    return sum + (qty * rate);
  }, 0);

  return (
    <div className="space-y-6">
      {/* ── 1. MATERIAL PROCUREMENT STATUS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Materials</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-slate-900 mt-2 tabular-nums">
            {totalMaterialsCount} <span className="text-xs font-semibold text-slate-400">items</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Est. value: {formatINR(totalEstimatedCost)}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Fully Received</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-emerald-600 mt-2 tabular-nums">
            {fullyReceivedCount} <span className="text-xs font-semibold text-slate-400">items</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {totalMaterialsCount > 0 ? `${((fullyReceivedCount / totalMaterialsCount) * 100).toFixed(0)}% delivered to site` : '0%'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Partially Received</span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-amber-600 mt-2 tabular-nums">
            {partiallyReceivedCount} <span className="text-xs font-semibold text-slate-400">items</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Staged in-transit / partial</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Delivery</span>
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
              0%
            </span>
          </div>
          <div className="text-xl font-extrabold font-display text-slate-700 mt-2 tabular-nums">
            {pendingCount} <span className="text-xs font-semibold text-slate-400">items</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Awaiting order / dispatch</span>
        </div>
      </div>

      {/* ── 2. ACTIONS & FILTERS HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search material name or spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/60"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/60 focus:ring-2 focus:ring-brand-500"
          >
            {COMMON_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* HIGH-PRIORITY DOCUMENT IMPORTER BUTTON */}
          <button
            type="button"
            onClick={onOpenImportMaterials}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import material lists directly from Excel spreadsheets or PDF estimate quotation documents"
          >
            <UploadCloud className="w-4 h-4 text-brand-200" />
            <span>+ Import PDF / Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddMaterial}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Material</span>
          </button>
        </div>
      </div>

      {/* ── 3. MATERIALS INVENTORY & DELIVERY TABLE ── */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No materials logged for this project"
          description="Upload an Excel quotation or PDF estimate to auto-extract items, or add items manually."
          actionLabel="+ Import from PDF / Excel"
          onAction={onOpenImportMaterials}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Material Name &amp; Category</th>
                  <th className="py-3 px-4 text-right">Required Qty</th>
                  <th className="py-3 px-4 text-right">Ordered Qty</th>
                  <th className="py-3 px-4 text-right">Received to Site</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Estimated Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const required = Number(mat.quantity_required ?? mat.quantity_ordered ?? 0);
                  const ordered = Number(mat.quantity_ordered || 0);
                  const received = Number(mat.quantity_received || 0);
                  const rate = Number(mat.estimated_rate || 0);

                  const isFullyDelivered = mat.delivery_status === 'Received' || (received >= required && required > 0);
                  const isPartiallyDelivered = mat.delivery_status === 'Partially Received' || (received > 0 && received < required);

                  const stockSummary = materialService.calculateStock(mat.id, materialTransactions, mat.minimum_stock);

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                          {mat.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                            {mat.category || 'General'}
                          </span>
                          {mat.notes && (
                            <span className="text-[11px] text-slate-400 truncate max-w-xs">
                              {mat.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 tabular-nums">
                        {required}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700 tabular-nums">
                        {ordered}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                        {received}
                        {required > 0 && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {((received / required) * 100).toFixed(0)}%
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {mat.unit || 'Nos'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isFullyDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Received</span>
                          </span>
                        ) : isPartiallyDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Partially Received</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 tabular-nums">
                        {rate > 0 ? formatINR(rate) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenReceiveStock(mat)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                            title="Record incoming stock delivery"
                          >
                            + Stock IN
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenStockHistory(mat)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Audit Stock History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditMaterial(mat)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMaterial(mat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Material"
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
  );
};
