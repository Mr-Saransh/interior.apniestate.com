// ==============================================================================
// APNI ESTATE INTERIORS - FULLY EDITABLE GENERIC QUOTATION STUDIO
// Supports blank custom quotes, starter presets, inline editing, and Excel/CSV/PDF import.
// ==============================================================================

import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Plus,
  Trash2,
  Copy,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Edit3,
  Eye,
  RotateCcw,
  Maximize2,
  Minimize2,
  PenTool
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { printQuotationById } from '../../utils/printQuotation';
import {
  SignaturePadField,
  QuotationSignatureBlock,
  DEFAULT_SIGNATORY,
  SignatoryConfig
} from './SignaturePadField';
import {
  parseSpreadsheetFile,
  parsePdfQuotationFile,
  exportQuotationToExcel,
  ParsedQuotationImport
} from '../../utils/quotationImportParser';

interface GenericQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsProject?: (projectData: any) => void;
}

type PropertyType =
  | 'Custom / Blank'
  | '1 BHK'
  | '2 BHK'
  | '3 BHK'
  | '4 BHK / Penthouse'
  | 'Villa'
  | 'Commercial Office';

type PackageTier = 'essential' | 'premium' | 'luxury';

interface QuoteLineItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
}

interface PaymentStage {
  id: string;
  title: string;
  percent: number;
  note: string;
}

const PROPERTY_CONFIGS: Record<PropertyType, { defaultArea: number }> = {
  'Custom / Blank': { defaultArea: 1000 },
  '1 BHK': { defaultArea: 650 },
  '2 BHK': { defaultArea: 950 },
  '3 BHK': { defaultArea: 1400 },
  '4 BHK / Penthouse': { defaultArea: 2200 },
  'Villa': { defaultArea: 3200 },
  'Commercial Office': { defaultArea: 1500 }
};

const UNIT_OPTIONS = ['Sq.Ft', 'R.Ft', 'Lot', 'Nos', 'Set', 'Kg', 'Lumpsum'];

const DEFAULT_STARTER_ITEMS: QuoteLineItem[] = [
  {
    id: 'item-1',
    category: 'Kitchen',
    name: 'Modular Island Kitchen',
    spec: 'BWP Marine Ply 710, Merino 1mm laminate, soft-close channels & bottle pullout',
    qty: 1,
    unit: 'Lot',
    rate: 285000
  },
  {
    id: 'item-2',
    category: 'Master Bedroom',
    name: 'Full-Height Wardrobe with Loft',
    spec: 'MR Grade Plywood with internal fabric laminate, soft-close hinges, profile LED',
    qty: 85,
    unit: 'Sq.Ft',
    rate: 1950
  },
  {
    id: 'item-3',
    category: 'Living Room',
    name: 'Designer TV Console & Fluted Acoustic Wall',
    spec: 'Charcoal fluted louvers with PU matte painted storage console and wiring conduit',
    qty: 1,
    unit: 'Lot',
    rate: 95000
  },
  {
    id: 'item-4',
    category: 'Ceiling & Lights',
    name: 'Gypsum False Ceiling & Cove Lighting',
    spec: 'Perimeter drop false ceiling with 3000K warm-white cove LED strips & recessed lights',
    qty: 1200,
    unit: 'Sq.Ft',
    rate: 145
  },
  {
    id: 'item-5',
    category: 'Painting',
    name: 'Luxury Interior Emulsion & Wall Putty',
    spec: '2-coat birla putty, 1-coat primer, 2-coat Royale luxury emulsion + 1 accent wall',
    qty: 3800,
    unit: 'Sq.Ft',
    rate: 45
  }
];

const DEFAULT_STAGES: PaymentStage[] = [
  { id: 'st-1', title: 'Booking Advance', percent: 10, note: 'Design brief & site measurement' },
  { id: 'st-2', title: 'Production Start', percent: 40, note: '3D renders & material sign-off' },
  { id: 'st-3', title: 'Site Delivery', percent: 40, note: 'Modular shell & carcass dispatch' },
  { id: 'st-4', title: 'Handover', percent: 10, note: 'Final snag clearance & keys' }
];

const DEFAULT_TERMS = [
  'Quotation is valid for 15 days from issue date; raw material prices subject to confirmation at sign-off.',
  'Electrical, plumbing civil chases, and building society permissions are excluded unless specifically listed above.',
  '10-year warranty applies on BWP Marine Ply structural modules against borer & termite damage.'
].join('\n');

export const GenericQuotationModal: React.FC<GenericQuotationModalProps> = ({
  isOpen,
  onClose,
  onSaveAsProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio & Quotation Metadata (Editable)
  const [studioTitle, setStudioTitle] = useState('APNI ESTATE INTERIORS');
  const [studioSubtitle, setStudioSubtitle] = useState('Studio Architecture & Turnkey Interiors • tech@apniestate.com');
  const [quoteNumber, setQuoteNumber] = useState(() => `AE-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState<number>(15);

  // Client & Project Fields (Editable)
  const [clientName, setClientName] = useState('Dr. Siddharth & Aditi Rao');
  const [clientPhone, setClientPhone] = useState('+91 98201 55432');
  const [clientEmail, setClientEmail] = useState('siddharth.rao@example.com');
  const [projectLocation, setProjectLocation] = useState('Bandra West, Mumbai');
  const [propertyType, setPropertyType] = useState<PropertyType>('3 BHK');
  const [carpetArea, setCarpetArea] = useState<number>(1400);
  const [packageTier, setPackageTier] = useState<PackageTier>('premium');

  // Commercial & Tax Controls
  const [gstRate, setGstRate] = useState<number>(18);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'edit' | 'proposal'>('edit');
  const [isFullView, setIsFullView] = useState<boolean>(false);
  const [showPreviewSignatory, setShowPreviewSignatory] = useState<boolean>(false);
  const [signatory, setSignatory] = useState<SignatoryConfig>(DEFAULT_SIGNATORY);

  // Editable Line Items, Payment Milestones & Terms
  const [items, setItems] = useState<QuoteLineItem[]>(DEFAULT_STARTER_ITEMS);
  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>(DEFAULT_STAGES);
  const [termsText, setTermsText] = useState<string>(DEFAULT_TERMS);

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ParsedQuotationImport | null>(null);

  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);
    setCarpetArea(PROPERTY_CONFIGS[type].defaultArea);
    if (type === 'Custom / Blank') {
      setItems([
        {
          id: `item-${Date.now()}`,
          category: 'Living Room',
          name: 'Custom Interior Work Item',
          spec: 'Enter material specifications, brand, and finish details',
          qty: 1,
          unit: 'Lot',
          rate: 0
        }
      ]);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setProjectLocation('');
    }
  };

  // Explicit item mutations
  const updateItem = (id: string, patch: Partial<QuoteLineItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category: 'Custom Scope',
        name: 'New Scope Item',
        spec: 'Material & finish details',
        qty: 1,
        unit: 'Sq.Ft',
        rate: 0
      }
    ]);
  };

  const duplicateItem = (item: QuoteLineItem) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: `${item.name} (Copy)`
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const applyTierAdjustment = (targetTier: PackageTier) => {
    const oldFactor = packageTier === 'essential' ? 1.0 : packageTier === 'premium' ? 1.15 : 1.4;
    const newFactor = targetTier === 'essential' ? 1.0 : targetTier === 'premium' ? 1.15 : 1.4;
    const ratio = newFactor / oldFactor;
    setPackageTier(targetTier);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        rate: Math.round(it.rate * ratio)
      }))
    );
  };

  const updateStage = (id: string, patch: Partial<PaymentStage>) => {
    setPaymentStages((prev) => prev.map((st) => (st.id === id ? { ...st, ...patch } : st)));
  };

  // Handle Excel / CSV / PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImportError(null);
    setPendingImport(null);
    setIsImporting(true);

    try {
      const lower = file.name.toLowerCase();
      let parsed: ParsedQuotationImport;

      if (lower.endsWith('.pdf')) {
        parsed = await parsePdfQuotationFile(file);
      } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        parsed = await parseSpreadsheetFile(file);
      } else {
        throw new Error('Unsupported file format. Upload .xlsx, .xls, .csv, or .pdf.');
      }

      if (parsed.items.length === 0) {
        setImportError(parsed.warnings[0] || 'No valid line items detected in the uploaded file.');
      } else {
        setPendingImport(parsed);
      }
    } catch (err: any) {
      setImportError(err?.message || 'Failed to read the uploaded file.');
    } finally {
      setIsImporting(false);
    }
  };

  const commitImport = (mode: 'replace' | 'append') => {
    if (!pendingImport) return;
    const mapped: QuoteLineItem[] = pendingImport.items.map((it) => ({
      id: it.id,
      category: it.category,
      name: it.name,
      spec: it.spec,
      qty: it.qty,
      unit: it.unit,
      rate: it.rate
    }));

    if (mode === 'replace') {
      setItems(mapped);
      if (pendingImport.detectedClientName && !clientName.trim()) {
        setClientName(pendingImport.detectedClientName);
      }
    } else {
      setItems((prev) => [...prev, ...mapped]);
    }
    setPendingImport(null);
  };

  // Calculations (transparent exact Qty × Rate — no silent multipliers)
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return (subtotal * (Number(discountPercent) || 0)) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = (taxableAmount * (Number(gstRate) || 0)) / 100;
  const grandTotal = taxableAmount + gstAmount;
  const milestonePercentTotal = paymentStages.reduce((s, st) => s + (Number(st.percent) || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs animate-in fade-in duration-150 ${
        isFullView ? 'p-0 sm:p-2' : 'p-2 sm:p-5'
      }`}
    >
      <div
        className={`bg-white flex flex-col shadow-2xl border border-[#E5E7EB] overflow-hidden transition-all duration-200 ${
          isFullView
            ? 'w-full h-full sm:rounded-2xl max-w-none max-h-none'
            : 'rounded-2xl w-full max-w-6xl max-h-[94vh]'
        }`}
      >
        {/* Top Modal Header — Single Clean Segmented Switch + Actions */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/apni_estate_logo.png"
              alt="Apni Estate"
              className="w-8 h-8 rounded-lg object-contain shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#111827] truncate">
                Quotation Builder
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Customize items, pricing, or import Excel/PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Single Edit / Preview Segmented Toggle */}
            <div className="flex items-center bg-[#F4F6FA] p-1 rounded-xl border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'edit' ? 'bg-white text-[#1D4ED8] shadow-xs' : 'text-slate-600 hover:text-[#111827]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Quote</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('proposal')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'proposal' ? 'bg-white text-[#1D4ED8] shadow-xs' : 'text-slate-600 hover:text-[#111827]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Proposal</span>
              </button>
            </div>

            {viewMode === 'proposal' && (
              <button
                type="button"
                onClick={() => printQuotationById('generic-quotation-sheet', `Quotation-${quoteNumber || 'Proposal'}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullView((prev) => !prev)}
              className="p-2 rounded-xl text-slate-500 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              title={isFullView ? 'Exit Full View' : 'View Full Screen'}
              aria-label={isFullView ? 'Exit Full View' : 'View Full Screen'}
            >
              {isFullView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Quotation Builder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F6FA]">
          {viewMode === 'edit' ? (
            <div className="space-y-5">
              {/* Top Import & Preset Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                    Template:
                  </span>
                  {(Object.keys(PROPERTY_CONFIGS) as PropertyType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handlePropertyTypeChange(type)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        propertyType === type
                          ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]'
                          : 'bg-[#F8FAFC] border-[#E5E7EB] text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] border border-blue-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isImporting ? 'Reading file...' : 'Import Excel / CSV / PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportQuotationToExcel(
                        quoteNumber,
                        clientName || 'Client',
                        items.map((it) => ({ ...it, amount: it.qty * it.rate })),
                        { subtotal, discountAmount, gstAmount, grandTotal }
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export .xlsx</span>
                  </button>
                </div>
              </div>

              {/* Import Feedback Banners */}
              {importError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportError(null)}
                    className="text-xs font-semibold underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {pendingImport && (
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#111827]">
                    {pendingImport.sourceType === 'pdf' ? (
                      <FileText className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        Extracted {pendingImport.items.length} line item{pendingImport.items.length === 1 ? '' : 's'} from "{pendingImport.sourceName}"
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        Choose whether to replace your current scope rows or append the imported rows to the table below.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => commitImport('append')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-[#1D4ED8] text-xs font-semibold hover:bg-blue-50 cursor-pointer"
                    >
                      Append Rows
                    </button>
                    <button
                      type="button"
                      onClick={() => commitImport('replace')}
                      className="px-3 py-1.5 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] cursor-pointer"
                    >
                      Replace Scope
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingImport(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label="Cancel import"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Studio & Client Metadata Grid (Fully Editable) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Client & Site Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Client Name</label>
                      <input
                        type="text"
                        placeholder="Client full name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Phone / Contact</label>
                      <input
                        type="text"
                        placeholder="+91 98..."
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="client@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Site Location</label>
                        <input
                          type="text"
                          placeholder="City / Locality"
                          value={projectLocation}
                          onChange={(e) => setProjectLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Area (Sq.Ft)</label>
                        <input
                          type="number"
                          min={0}
                          value={carpetArea}
                          onChange={(e) => setCarpetArea(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#1D4ED8] tabular-nums focus:border-[#1D4ED8] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Proposal Header & Spec Tier
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Issuing Studio / Letterhead</label>
                      <input
                        type="text"
                        value={studioTitle}
                        onChange={(e) => setStudioTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Quote No.</label>
                      <input
                        type="text"
                        value={quoteNumber}
                        onChange={(e) => setQuoteNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-mono text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Scale all rates by finish:</span>
                    <div className="flex gap-1">
                      {(['essential', 'premium', 'luxury'] as PackageTier[]).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => applyTierAdjustment(tier)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold capitalize border cursor-pointer ${
                            packageTier === tier
                              ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]'
                              : 'bg-white border-[#E5E7EB] text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {tier === 'premium' ? 'Signature' : tier === 'luxury' ? 'Architectural' : 'Essential'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fully Editable Scope of Work Table */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Editable Scope of Work ({items.length} items)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setItems(DEFAULT_STARTER_ITEMS)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Sample</span>
                    </button>
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item Row</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 border-b border-[#E5E7EB] text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-36">Room / Category</th>
                        <th className="py-2.5 px-3 min-w-[260px]">Item Name & Specification</th>
                        <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                        <th className="py-2.5 px-2 w-24">Unit</th>
                        <th className="py-2.5 px-2 w-28 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                        <th className="py-2.5 px-2 w-16 text-right">Row</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-500">
                            No scope items added yet. Click <strong>Add Item Row</strong> or import an Excel/CSV/PDF file above.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => {
                          const rowAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/60 align-top">
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                  placeholder="Room / Head"
                                  className="w-full px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[11px] font-semibold text-slate-700 focus:border-[#1D4ED8] focus:outline-none"
                                />
                              </td>
                              <td className="py-2.5 px-3 space-y-1.5">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                  placeholder="Item title"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={item.spec}
                                  onChange={(e) => updateItem(item.id, { spec: e.target.value })}
                                  placeholder="Material, finish, hardware details..."
                                  className="w-full px-2.5 py-1 rounded-lg border border-transparent hover:border-[#E5E7EB] focus:border-[#1D4ED8] bg-slate-50/70 focus:bg-white text-[11px] text-slate-600 focus:outline-none"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={item.qty}
                                  onChange={(e) => updateItem(item.id, { qty: Math.max(0, Number(e.target.value)) })}
                                  className="w-full px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-right text-xs font-semibold tabular-nums focus:border-[#1D4ED8] focus:outline-none"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <select
                                  value={UNIT_OPTIONS.includes(item.unit) ? item.unit : 'Lot'}
                                  onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                                  className="w-full px-1.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs text-slate-700 focus:border-[#1D4ED8] focus:outline-none cursor-pointer"
                                >
                                  {UNIT_OPTIONS.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-2">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={item.rate}
                                  onChange={(e) => updateItem(item.id, { rate: Math.max(0, Number(e.target.value)) })}
                                  className="w-full px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-right text-xs font-semibold tabular-nums focus:border-[#1D4ED8] focus:outline-none"
                                />
                              </td>
                              <td className="py-3.5 px-3 text-right font-bold text-[#111827] tabular-nums whitespace-nowrap">
                                {formatINR(rowAmount)}
                              </td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="inline-flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => duplicateItem(item)}
                                    title="Duplicate row"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    title="Delete row"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editable Commercials, Payment Schedule & Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Milestones & Terms */}
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Editable Payment Milestones
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded tabular-nums ${
                        milestonePercentTotal === 100
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      Total: {milestonePercentTotal}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {paymentStages.map((stage) => (
                      <div key={stage.id} className="p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={stage.title}
                            onChange={(e) => updateStage(stage.id, { title: e.target.value })}
                            className="flex-1 px-2 py-1 rounded border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827]"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={stage.percent}
                              onChange={(e) => updateStage(stage.id, { percent: Number(e.target.value) || 0 })}
                              className="w-12 px-1.5 py-1 rounded border border-[#E5E7EB] bg-white text-right text-xs font-bold text-[#1D4ED8] tabular-nums"
                            />
                            <span className="text-[11px] font-bold text-slate-500">%</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={stage.note}
                          onChange={(e) => updateStage(stage.id, { note: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-transparent hover:border-[#E5E7EB] bg-white text-[11px] text-slate-600"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Terms, Exclusions & Warranty Notes
                    </label>
                    <textarea
                      rows={3}
                      value={termsText}
                      onChange={(e) => setTermsText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-slate-700 focus:border-[#1D4ED8] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary Box */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Taxes & Commercials
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">GST Tax Rate (%)</span>
                      <select
                        value={gstRate}
                        onChange={(e) => setGstRate(Number(e.target.value))}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] font-semibold text-[#111827] cursor-pointer"
                      >
                        <option value={0}>0% (No GST)</option>
                        <option value={5}>5% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST</option>
                        <option value={28}>28% GST</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Discount (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                        className="w-28 px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-right font-bold text-[#111827] tabular-nums"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Quote Validity (Days)</span>
                      <input
                        type="number"
                        min={1}
                        value={validityDays}
                        onChange={(e) => setValidityDays(Math.max(1, Number(e.target.value) || 15))}
                        className="w-28 px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-right font-semibold text-[#111827] tabular-nums"
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
                    {gstRate > 0 && (
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>GST @ {gstRate}%</span>
                        <span className="font-semibold tabular-nums">+ {formatINR(gstAmount)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline">
                      <span className="font-bold text-sm text-[#111827]">Grand Total</span>
                      <span className="font-bold text-xl text-[#1D4ED8] tabular-nums">{formatINR(grandTotal)}</span>
                    </div>
                    {carpetArea > 0 && (
                      <div className="text-[11px] text-right text-slate-500 tabular-nums">
                        ₹{Math.round(grandTotal / carpetArea).toLocaleString('en-IN')} / sq.ft approx.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Signatory Name, Designation & E-Sign */}
              <SignaturePadField value={signatory} onChange={setSignatory} />
            </div>
          ) : (
            /* ==========================================================
               MODE 2: ARCHITECTURAL CLIENT PROPOSAL VIEW (FULL SCROLL + ISOLATED PRINT)
               ========================================================== */
            <div className="space-y-4 max-w-4xl mx-auto pb-8">
              {/* Compact Preview Controls (never printed) */}
              <div className="no-print bg-white px-4 py-2.5 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-600">
                  Showing full quotation ({items.length} scope item{items.length === 1 ? '' : 's'})
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewSignatory((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      showPreviewSignatory
                        ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]'
                        : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{showPreviewSignatory ? 'Hide Signatory / E-Sign' : 'Add Signatory / E-Sign'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullView((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {isFullView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span>{isFullView ? 'Compact Modal' : 'Full Page View'}</span>
                  </button>
                </div>
              </div>

              {showPreviewSignatory && (
                <div className="no-print">
                  <SignaturePadField value={signatory} onChange={setSignatory} compact />
                </div>
              )}

              <div
                id="generic-quotation-sheet"
                className="quotation-sheet bg-white p-6 sm:p-10 rounded-xl border border-[#E5E7EB] shadow-sm space-y-7 font-sans"
              >
              {/* Proposal Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#1D4ED8]">
                <div className="flex items-center gap-3">
                  <img
                    src="/apni_estate_logo.png"
                    alt={studioTitle}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold tracking-[0.18em] text-[#1D4ED8] uppercase">
                      {studioTitle}
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium">{studioSubtitle}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                    Official Quotation
                  </div>
                  <div className="font-mono text-sm font-bold text-[#111827]">{quoteNumber}</div>
                  <div className="text-xs text-slate-500">
                    Date: {quoteDate ? new Date(quoteDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500">Validity: {validityDays} Days</div>
                </div>
              </div>

              {/* Client & Site Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F6FA] p-4 rounded-xl border border-[#E5E7EB] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Prepared For
                  </span>
                  <div className="font-serif font-bold text-base text-[#111827]">
                    {clientName || 'Valued Client'}
                  </div>
                  {clientPhone && <div className="text-slate-600 mt-0.5">{clientPhone}</div>}
                  {clientEmail && <div className="text-slate-600">{clientEmail}</div>}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Project Scope & Site
                  </span>
                  <div className="font-bold text-sm text-[#111827]">
                    {propertyType === 'Custom / Blank' ? 'Bespoke Interior Proposal' : `${propertyType} Interior Works`}
                  </div>
                  {projectLocation && <div className="text-slate-600 mt-0.5">{projectLocation}</div>}
                  <div className="text-slate-600">
                    Carpet Area: {carpetArea} sq.ft • Spec:{' '}
                    {packageTier === 'premium' ? 'Signature' : packageTier === 'luxury' ? 'Architectural' : 'Essential'}
                  </div>
                </div>
              </div>

              {/* Scope Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-[#111827] uppercase tracking-wider">
                  Scope of Work & Specification Schedule
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 font-semibold text-slate-700">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Space / Item & Specifications</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {items.map((item, idx) => {
                      const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-slate-400 tabular-nums">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] block">
                              {item.category}
                            </span>
                            <div className="font-semibold text-[#111827]">{item.name}</div>
                            {item.spec && <div className="text-[11px] text-slate-500 mt-0.5">{item.spec}</div>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium tabular-nums whitespace-nowrap">
                            {item.qty} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                            {formatINR(item.rate)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums whitespace-nowrap">
                            {formatINR(amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="print-avoid-break flex justify-end pt-2">
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
                  {gstRate > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST ({gstRate}%):</span>
                      <span className="font-semibold tabular-nums">+ {formatINR(gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#111827]">Grand Total:</span>
                    <span className="font-bold text-lg text-[#1D4ED8] tabular-nums">{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="print-avoid-break space-y-2">
                <h4 className="font-bold text-xs text-[#111827] uppercase tracking-wider">
                  Payment Schedule
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {paymentStages.map((st, idx) => (
                    <div key={st.id} className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {idx + 1}. {st.title}
                      </div>
                      <div className="font-bold text-[#1D4ED8] text-sm tabular-nums">{st.percent}%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{st.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              {termsText.trim() && (
                <div className="print-avoid-break space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-[#E5E7EB]">
                  <div className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">
                    Terms &amp; Conditions
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {termsText
                      .split('\n')
                      .filter((l) => l.trim())
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Optional Signatures */}
              <QuotationSignatureBlock
                signatory={signatory}
                studioTitle={studioTitle}
                clientName={clientName}
              />
              </div>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block tabular-nums">
            {items.length} item{items.length === 1 ? '' : 's'} • Grand Total:{' '}
            <strong className="text-[#111827]">{formatINR(grandTotal)}</strong>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onSaveAsProject && (
              <button
                type="button"
                onClick={() => {
                  const todayIso = new Date().toISOString().split('T')[0];
                  const targetDeadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  onSaveAsProject({
                    name: `${(clientName || 'Client').split(' ')[0]}'s ${
                      propertyType === 'Custom / Blank' ? 'Interior' : propertyType
                    } Project`,
                    client: clientName || 'New Client',
                    clientPhone,
                    type: propertyType === 'Commercial Office' ? 'Commercial' : 'Residential',
                    budget: grandTotal,
                    contract_value: grandTotal,
                    startDate: todayIso,
                    deadline: targetDeadline,
                    city: projectLocation || 'Mumbai',
                    location: projectLocation || 'Mumbai'
                  });
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Convert to Project</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === 'edit' ? 'proposal' : 'edit'))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {viewMode === 'edit' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preview Proposal</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Back to Editor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
