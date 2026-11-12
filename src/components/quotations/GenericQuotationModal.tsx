// ==============================================================================
// APNI ESTATE INTERIORS - GENERIC QUOTATION & ESTIMATION GENERATOR
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  FileCheck2, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Sparkles, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Share2, 
  ArrowRight,
  Download
} from 'lucide-react';
import { formatINR, formatINRCompact } from '../../utils/formatters';

interface GenericQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsProject?: (projectData: any) => void;
}

type PropertyType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK / Penthouse' | 'Villa' | 'Commercial Office';
type PackageTier = 'essential' | 'premium' | 'luxury';

interface QuoteLineItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

const PROPERTY_CONFIGS: Record<PropertyType, { defaultArea: number }> = {
  '1 BHK': { defaultArea: 650 },
  '2 BHK': { defaultArea: 950 },
  '3 BHK': { defaultArea: 1400 },
  '4 BHK / Penthouse': { defaultArea: 2200 },
  'Villa': { defaultArea: 3200 },
  'Commercial Office': { defaultArea: 1500 }
};

export const GenericQuotationModal: React.FC<GenericQuotationModalProps> = ({
  isOpen,
  onClose,
  onSaveAsProject
}) => {
  const [clientName, setClientName] = useState('Dr. Siddharth & Aditi Rao');
  const [clientPhone, setClientPhone] = useState('+91 98201 55432');
  const [clientEmail, setClientEmail] = useState('siddharth.rao@example.com');
  const [projectLocation, setProjectLocation] = useState('Bandra West, Mumbai');
  const [propertyType, setPropertyType] = useState<PropertyType>('3 BHK');
  const [carpetArea, setCarpetArea] = useState<number>(1400);
  const [packageTier, setPackageTier] = useState<PackageTier>('premium');
  const [includeGst, setIncludeGst] = useState(true);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'configure' | 'proposal'>('configure');

  // Rate Multipliers based on tier
  const tierMultiplier = packageTier === 'essential' ? 1.0 : packageTier === 'premium' ? 1.45 : 2.15;

  // Dynamic Item List
  const [customItems, setCustomItems] = useState<QuoteLineItem[]>([
    {
      id: 'item-1',
      category: 'Kitchen',
      name: 'Modular Island Kitchen',
      spec: 'BWP Marine Ply 710, Merino 1mm High-Gloss Laminate, Hafele Tandem soft-close drawers & bottle pullout',
      qty: 1,
      unit: 'Lot',
      rate: 285000,
      amount: 285000
    },
    {
      id: 'item-2',
      category: 'Master Bedroom',
      name: 'Full-Height Wardrobe with Loft',
      spec: 'Commercial MR Grade Plywood with inside fabric laminate, soft-close hinges, integrated profile LED',
      qty: 85,
      unit: 'Sq.Ft',
      rate: 1950,
      amount: 165750
    },
    {
      id: 'item-3',
      category: 'Living Room',
      name: 'Designer TV Console & Fluted Acoustic Wall',
      spec: 'Charcoal fluted louvers with PU matte painted storage console and hidden wiring conduit',
      qty: 1,
      unit: 'Lot',
      rate: 95000,
      amount: 95000
    },
    {
      id: 'item-4',
      category: 'Ceiling & Lights',
      name: 'Saint-Gobain Gyproc False Ceiling & Cove Lighting',
      spec: 'Perimeter drop false ceiling with Philips 3000K warm-white cove LED strips and magnetic track points',
      qty: 1200,
      unit: 'Sq.Ft',
      rate: 145,
      amount: 174000
    },
    {
      id: 'item-5',
      category: 'Painting',
      name: 'Asian Paints Royale Luxury Emulsion',
      spec: 'Full putty preparation, 1 coat primer, 2 coats Royale luxury interior emulsion with 1 accent wall',
      qty: 3800,
      unit: 'Sq.Ft',
      rate: 45,
      amount: 171000
    },
    {
      id: 'item-6',
      category: 'Electrical & Automation',
      name: 'Modular Switchboards & Circuit Rewiring',
      spec: 'Schneider/Legrand modular switches, Polycab FR wiring, heavy appliance points',
      qty: 1,
      unit: 'Lot',
      rate: 85000,
      amount: 85000
    }
  ]);

  // Adjust area when property type changes
  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);
    setCarpetArea(PROPERTY_CONFIGS[type].defaultArea);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return customItems.reduce((acc, item) => acc + (item.qty * item.rate), 0) * (packageTier === 'premium' ? 1.15 : packageTier === 'luxury' ? 1.4 : 1.0);
  }, [customItems, packageTier]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = subtotal - discountAmount;
  const gstAmount = includeGst ? taxableAmount * 0.18 : 0;
  const grandTotal = taxableAmount + gstAmount;

  const quoteNumber = useMemo(() => {
    return `AE-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E7EB] overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/apni_estate_logo.png" 
              alt="Apni Estate" 
              className="w-8 h-8 rounded-lg object-contain shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  {viewMode === 'configure' ? 'Interior Quotation Estimator' : 'Architectural Client Quotation'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-blue-200">
                  GENERIC ESTIMATOR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate professional itemized interior proposals with verified rates and payment milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'proposal' && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Proposal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'configure' ? 'proposal' : 'configure')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {viewMode === 'configure' ? (
                <>
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Preview Client Proposal</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Back to Parameters</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {viewMode === 'configure' ? (
            /* ==========================================================
               MODE 1: CONFIGURE SCOPE & ESTIMATE PARAMETERS
               ========================================================== */
            <div className="space-y-6">
              
              {/* Project & Client Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F4F6FA] p-4 rounded-xl border border-[#E5E7EB]">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Site Location / Address
                  </label>
                  <input
                    type="text"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Carpet Area (Sq.Ft)
                  </label>
                  <input
                    type="number"
                    value={carpetArea}
                    onChange={(e) => setCarpetArea(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#1D4ED8] outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Property Configuration & Quality Package Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Type Selection */}
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                    1. Select Property Configuration
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PROPERTY_CONFIGS) as PropertyType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handlePropertyTypeChange(type)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                          propertyType === type
                            ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] shadow-xs'
                            : 'border-[#E5E7EB] text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Quality Tier */}
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                    2. Interior Specification Tier
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPackageTier('essential')}
                      className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                        packageTier === 'essential'
                          ? 'bg-[#EFF6FF] border-[#1D4ED8] shadow-xs'
                          : 'border-[#E5E7EB] hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#111827]">Essential</div>
                      <div className="text-[10px] text-slate-500">Commercial Ply + 0.8mm Mica</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPackageTier('premium')}
                      className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                        packageTier === 'premium'
                          ? 'bg-[#EFF6FF] border-[#1D4ED8] shadow-xs'
                          : 'border-[#E5E7EB] hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1D4ED8]">Signature ★</div>
                      <div className="text-[10px] text-slate-500">Marine Ply + 1mm + Hafele</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPackageTier('luxury')}
                      className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                        packageTier === 'luxury'
                          ? 'bg-[#EFF6FF] border-[#1D4ED8] shadow-xs'
                          : 'border-[#E5E7EB] hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#111827]">Architectural</div>
                      <div className="text-[10px] text-slate-500">Century Prime + PU / Veneer</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Line Items Schedule Table */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-3 bg-[#F4F6FA] border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Itemized Scope of Work ({customItems.length} items)
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Tier Multiplier: {packageTier === 'premium' ? '1.15x' : packageTier === 'luxury' ? '1.40x' : '1.0x'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-slate-50/60 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Item Name & Specifications</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {customItems.map((item) => {
                        const effectiveRate = Math.round(item.rate * (packageTier === 'premium' ? 1.15 : packageTier === 'luxury' ? 1.4 : 1.0));
                        const effectiveAmount = effectiveRate * item.qty;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-sm">
                              <div className="font-semibold text-[#111827]">{item.name}</div>
                              <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.spec}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium tabular-nums">{item.qty}</td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{item.unit}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-700 tabular-nums">
                              {formatINR(effectiveRate)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">
                              {formatINR(effectiveAmount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Commercial Conditions & Taxes
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Apply GST (18%)</span>
                    <input
                      type="checkbox"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1D4ED8]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Studio Goodwill Discount %</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-[#E5E7EB] rounded text-right font-bold text-[#111827]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F4F6FA] space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold tabular-nums">{formatINR(subtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-semibold tabular-nums">- {formatINR(discountAmount)}</span>
                    </div>
                  )}
                  {includeGst && (
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>GST @ 18%</span>
                      <span className="font-semibold tabular-nums">+ {formatINR(gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#111827]">Estimated Grand Total</span>
                    <span className="font-bold text-xl text-[#1D4ED8] tabular-nums">{formatINR(grandTotal)}</span>
                  </div>
                  <div className="text-[11px] text-right text-slate-400">
                    Approx. ₹{Math.round(grandTotal / (carpetArea || 1)).toLocaleString('en-IN')}/sq.ft
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ==========================================================
               MODE 2: ARCHITECTURAL CLIENT PROPOSAL VIEW (PRINTABLE)
               ========================================================== */
            <div className="bg-white p-6 sm:p-10 rounded-xl border border-[#E5E7EB] max-w-4xl mx-auto shadow-sm space-y-8 font-sans">
              
              {/* Proposal Header & Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#1D4ED8]">
                <div className="flex items-center gap-3">
                  <img 
                    src="/apni_estate_logo.png" 
                    alt="Apni Estate Interiors" 
                    className="w-12 h-12 object-contain" 
                  />
                  <div>
                    <h1 className="text-xl font-bold tracking-[0.2em] text-[#1D4ED8] uppercase">
                      APNI ESTATE INTERIORS
                    </h1>
                    <p className="text-[10px] tracking-wider text-slate-500 font-semibold uppercase">
                      STUDIO ARCHITECTURE & TURNKEY INTERIORS
                    </p>
                    <p className="text-[10px] text-slate-400">
                      tech@apniestate.com • GSTIN: 27AABCA1234F1Z5
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                    Official Quotation
                  </div>
                  <div className="font-mono text-sm font-bold text-[#111827]">{quoteNumber}</div>
                  <div className="text-xs text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
                  <div className="text-xs text-slate-500">Validity: 15 Days</div>
                </div>
              </div>

              {/* Client & Site Details Box */}
              <div className="grid grid-cols-2 gap-4 bg-[#F4F6FA] p-4 rounded-xl border border-[#E5E7EB] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Client Details
                  </span>
                  <div className="font-bold text-sm text-[#111827]">{clientName}</div>
                  <div className="text-slate-600">{clientPhone}</div>
                  <div className="text-slate-600">{clientEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Project & Property
                  </span>
                  <div className="font-bold text-sm text-[#111827]">{propertyType} Residence</div>
                  <div className="text-slate-600">{projectLocation}</div>
                  <div className="text-slate-600">Carpet Area: {carpetArea} sq.ft • {packageTier.toUpperCase()} Spec</div>
                </div>
              </div>

              {/* Scope Schedule */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#111827] uppercase tracking-wider">
                  Scope of Work & Specification Schedule
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 font-semibold text-slate-700">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item & Specifications</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {customItems.map((item, idx) => {
                      const effectiveRate = Math.round(item.rate * (packageTier === 'premium' ? 1.15 : packageTier === 'luxury' ? 1.4 : 1.0));
                      const effectiveAmount = effectiveRate * item.qty;

                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#111827]">{item.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.spec}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                            {item.qty} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-700 tabular-nums">
                            {formatINR(effectiveRate)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">
                            {formatINR(effectiveAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commercial Summary Table */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-[#E5E7EB]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold tabular-nums">{formatINR(subtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({discountPercent}%):</span>
                      <span className="font-semibold tabular-nums">- {formatINR(discountAmount)}</span>
                    </div>
                  )}
                  {includeGst && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span className="font-semibold tabular-nums">+ {formatINR(gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#111827]">Grand Total:</span>
                    <span className="font-bold text-lg text-[#1D4ED8] tabular-nums">{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Milestones Schedule */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs text-[#111827] uppercase tracking-wider">
                  Payment Milestones
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">1. Booking</div>
                    <div className="font-bold text-[#1D4ED8]">10%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Design Brief Sign-off</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">2. Factory Start</div>
                    <div className="font-bold text-[#1D4ED8]">40%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">3D Render & Material Freeze</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">3. Site Assembly</div>
                    <div className="font-bold text-[#1D4ED8]">40%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Shell & Carcass Delivery</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">4. Handover</div>
                    <div className="font-bold text-[#1D4ED8]">10%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Final Snagging & Keys</div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-[#E5E7EB] flex justify-between items-end text-xs text-slate-500">
                <div>
                  <div className="h-10 border-b border-slate-300 w-44 mb-1"></div>
                  <div className="font-semibold text-slate-800">For Apni Estate Interiors</div>
                  <div>Authorized Studio Signatory</div>
                </div>

                <div className="text-right">
                  <div className="h-10 border-b border-slate-300 w-44 mb-1 ml-auto"></div>
                  <div className="font-semibold text-slate-800">{clientName}</div>
                  <div>Client Approval & Signature</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onSaveAsProject && (
              <button
                type="button"
                onClick={() => {
                  onSaveAsProject({
                    name: `${clientName.split(' ')[0]}'s ${propertyType} Interior`,
                    client: clientName,
                    clientPhone: clientPhone,
                    budget: grandTotal,
                    location: projectLocation
                  });
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-blue-200 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
              >
                + Create Project from This Estimate
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'configure' ? 'proposal' : 'configure')}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {viewMode === 'configure' ? 'Generate Client Proposal →' : 'Edit Parameters'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

