// ==============================================================================
// APNI ESTATE INTERIORS - VENDORS DIRECTORY PAGE
// Multi-category supplier management, GST records, ratings & spend metrics
// ==============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Vendor, VendorCategory } from '../types';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Tag,
  Star,
  Edit2,
  Trash2,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Filter,
  UserRound
} from 'lucide-react';
import { VendorModal } from '../components/modals/VendorModal';
import { EmptyState } from '../components/common/EmptyState';
import { UnifiedFilterPopover } from '../components/common/UnifiedFilterPopover';
import { vendorScorecardService, VendorScorecard } from '../services/vendorScorecardService';
import { formatINR } from '../utils/formatters';

const CATEGORIES: ('All' | VendorCategory)[] = [
  'All',
  'Materials',
  'Furniture',
  'Electrical',
  'Plumbing',
  'Civil',
  'Hardware',
  'Fabric',
  'Lighting',
  'Glass',
  'Paint',
  'Other'
];

export const VendorsPage: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useApp();
  const { isDemoMode, organization } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | VendorCategory>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [scorecards, setScorecards] = useState<Record<string, VendorScorecard>>({});
  const [scorecardsLoading, setScorecardsLoading] = useState(!isDemoMode);
  const [scorecardsError, setScorecardsError] = useState('');

  useEffect(() => {
    if (isDemoMode || !organization?.id) {
      setScorecards({});
      setScorecardsError('');
      setScorecardsLoading(false);
      return;
    }
    let active = true;
    setScorecards({});
    setScorecardsError('');
    setScorecardsLoading(true);
    vendorScorecardService.getScorecards()
      .then(rows => {
        if (active) setScorecards(Object.fromEntries(rows.map(row => [row.vendor_id, row])));
      })
      .catch(err => {
        if (active) setScorecardsError(err instanceof Error ? err.message : 'Could not load vendor performance scorecards.');
      })
      .finally(() => { if (active) setScorecardsLoading(false); });
    return () => { active = false; };
  }, [isDemoMode, organization?.id]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.phone && v.phone.includes(searchQuery)) ||
        (v.gst_number && v.gst_number.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [vendors, selectedCategory, searchQuery]);

  const handleSave = async (vendorData: Partial<Vendor>) => {
    if (vendorToEdit) {
      await updateVendor(vendorToEdit.id, vendorData);
    } else {
      await addVendor(vendorData);
    }
  };

  const gstRegisteredCount = vendors.filter((v) => Boolean(v.gst_number?.trim())).length;
  const activeTradesCount = new Set(vendors.map((v) => v.category)).size;

  return (
    <div className="space-y-5 pb-10">
      {/* Header & Summary */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-editorial text-2xl font-medium text-[#111827]">
              Vendors & Suppliers
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Carpenters, plywood vendors, paint, and trade contacts.
            </p>
          </div>

          <button
            onClick={() => {
              setVendorToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <p className="text-[11px] font-semibold text-[#64748B]">Total Partners</p>
            <p className="text-lg font-bold text-[#111827] tabular-nums mt-0.5">{vendors.length}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <p className="text-[11px] font-semibold text-[#64748B]">GST Registered</p>
            <p className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">{gstRegisteredCount}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <p className="text-[11px] font-semibold text-[#64748B]">Trade Categories</p>
            <p className="text-lg font-bold text-[#1D4ED8] tabular-nums mt-0.5">{activeTradesCount}</p>
          </div>
        </div>
      </div>

      {scorecardsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">Vendor performance could not be loaded: {scorecardsError}</p>}

      {/* Search + Single Unified Filter Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor name, contact, phone, or GST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <UnifiedFilterPopover
          activeCount={selectedCategory !== 'All' ? 1 : 0}
          onReset={() => setSelectedCategory('All')}
          fields={[
            {
              id: 'category',
              label: 'Vendor Specialty',
              type: 'pills',
              value: selectedCategory,
              onChange: (val) => setSelectedCategory(val as any),
              options: CATEGORIES.map((cat) => ({ label: cat, value: cat }))
            }
          ]}
        />
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors found"
          description="Register suppliers for plywood, hardware, sanitaryware, fabric, and lighting fixtures."
          actionLabel="Add First Vendor"
          onAction={() => {
            setVendorToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => {
            return (
              <div
                key={vendor.id}
                className="bg-white p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#1D4ED8] transition-colors flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 flex items-center justify-center font-bold font-editorial text-base shrink-0">
                        {vendor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                          {vendor.name}
                        </h3>
                        {vendor.contact_person && (
                          <span className="text-xs text-slate-500 block">
                            <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-slate-400" />{vendor.contact_person}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {vendor.category}
                    </span>
                  </div>

                  {/* Rating Stars & GST */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#F1F5F9] text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{vendor.rating || 5}.0</span>
                    </div>

                    {vendor.gst_number ? (
                      <span className="text-[11px] font-mono text-[#475569] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>GST: {vendor.gst_number}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8]">No GST registered</span>
                    )}
                  </div>

                  {/* Vendor Performance Scorecard */}
                  <div className="mb-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Vendor Performance
                      </span>
                      {scorecardsLoading ? (
                        <span className="text-[10px] text-[#94A3B8]">Calculating…</span>
                      ) : scorecards[vendor.id] ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            scorecards[vendor.id].overall_score >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : scorecards[vendor.id].overall_score >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {scorecards[vendor.id].overall_score}/100
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8]">
                          {isDemoMode ? 'Requires recorded PO & GRN' : 'No PO history'}
                        </span>
                      )}
                    </div>
                    {scorecards[vendor.id] && (
                      <>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <p className="text-[#64748B]">Price</p>
                            <p className="font-bold text-[#111827] tabular-nums">
                              {scorecards[vendor.id].comparable_price_score}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-[#64748B]">Quality</p>
                            <p className="font-bold text-[#111827] tabular-nums">
                              {scorecards[vendor.id].quality_score}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-[#64748B]">Delivery</p>
                            <p className="font-bold text-[#111827] tabular-nums">
                              {scorecards[vendor.id].delivery_score}/100
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] text-[#64748B] tabular-nums">
                          {scorecards[vendor.id].order_count} orders · {scorecards[vendor.id].project_count} projects ·{' '}
                          {formatINR(scorecards[vendor.id].total_purchase_value)} ·{' '}
                          {scorecards[vendor.id].average_delivery_delay_days}d avg delay ·{' '}
                          {scorecards[vendor.id].rejected_quantity} rejected
                        </p>
                      </>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex items-center gap-2 hover:text-brand-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{vendor.phone}</span>
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-2 hover:text-brand-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </a>
                    )}
                    {vendor.address && (
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 italic border border-slate-100">
                      "{vendor.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Active Supplier
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setVendorToEdit(vendor);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete vendor "${vendor.name}"?`)) {
                          deleteVendor(vendor.id);
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

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        vendorToEdit={vendorToEdit}
      />
    </div>
  );
};
