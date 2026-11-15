// ==============================================================================
// APNI ESTATE INTERIORS - SPECIFIC PROJECT BOQ QUOTATION GENERATOR
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  FileCheck2, 
  IndianRupee, 
  Layers, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  Share2,
  Calendar,
  Send,
  Maximize2,
  Minimize2,
  PenTool
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { printQuotationById } from '../../utils/printQuotation';
import {
  SignaturePadField,
  QuotationSignatureBlock,
  DEFAULT_SIGNATORY,
  SignatoryConfig
} from './SignaturePadField';
import { Project, Room, BOQItem } from '../../types';

interface SpecificQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const SpecificQuotationModal: React.FC<SpecificQuotationModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId
}) => {
  const { projects, boqItems, clients } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || (projects[0]?.id || '')
  );
  const [includeGst, setIncludeGst] = useState(true);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [markupPercent, setMarkupPercent] = useState<number>(15);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [isFullView, setIsFullView] = useState<boolean>(false);
  const [showSignatoryPanel, setShowSignatoryPanel] = useState<boolean>(false);
  const [signatory, setSignatory] = useState<SignatoryConfig>(DEFAULT_SIGNATORY);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const linkedClient = clients.find(c => c.id === selectedProject?.client_id || c.name === selectedProject?.client);

  // Project BOQ items
  const projectItems = useMemo(() => {
    if (!selectedProject) return [];
    return boqItems.filter(item => item.project_id === selectedProject.id);
  }, [selectedProject, boqItems]);

  // Group by room
  const itemsByRoom = useMemo(() => {
    const map = new Map<string, BOQItem[]>();
    projectItems.forEach(item => {
      const roomKey = item.room_id || 'General Scope';
      const existing = map.get(roomKey) || [];
      existing.push(item);
      map.set(roomKey, existing);
    });
    return map;
  }, [projectItems]);

  // Financials
  const baseTotal = useMemo(() => {
    return projectItems.reduce((acc, item) => {
      const rate = Number(item.selling_rate || item.rate || 0);
      return acc + (rate * Number(item.quantity || 1));
    }, 0);
  }, [projectItems]);

  const markedUpTotal = baseTotal * (1 + markupPercent / 100);
  const discountAmount = (markedUpTotal * discountPercent) / 100;
  const taxableSubtotal = markedUpTotal - discountAmount;
  const gstAmount = includeGst ? taxableSubtotal * 0.18 : 0;
  const grandTotal = taxableSubtotal + gstAmount;

  const quoteNumber = useMemo(() => {
    return `AE-PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  if (!isOpen || !selectedProject) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 ${
        isFullView ? 'p-0 sm:p-2' : 'p-3 sm:p-6'
      }`}
    >
      <div
        className={`bg-white flex flex-col shadow-2xl border border-[#E5E7EB] overflow-hidden transition-all duration-200 ${
          isFullView
            ? 'w-full h-full sm:rounded-2xl max-w-none max-h-none'
            : 'rounded-2xl w-full max-w-5xl max-h-[92vh]'
        }`}
      >
        
        {/* Header */}
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
                  Project Quotation
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  BOQ Linked
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Room-by-room proposal generated from project BOQ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printQuotationById('specific-quotation-sheet', `Quotation-${quoteNumber}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullView((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
              title={isFullView ? 'Exit Full View' : 'View Full Screen'}
              aria-label={isFullView ? 'Exit Full View' : 'View Full Screen'}
            >
              {isFullView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Specific Quotation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Selector & Margin Controls */}
        <div className="bg-[#F4F6FA] px-5 py-3 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Select Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg font-bold text-[#111827] outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Studio Margin:</span>
              <input
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white border border-[#E5E7EB] rounded text-right font-bold text-[#111827]"
              />
              <span className="text-slate-500">%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Discount:</span>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white border border-[#E5E7EB] rounded text-right font-bold text-[#111827]"
              />
              <span className="text-slate-500">%</span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
                className="w-4 h-4 rounded text-[#1D4ED8]"
              />
              <span className="text-slate-700 font-semibold">Include GST (18%)</span>
            </label>

            <button
              type="button"
              onClick={() => setShowSignatoryPanel((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                showSignatoryPanel
                  ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]'
                  : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{showSignatoryPanel ? 'Hide Signatory & E-Sign' : 'Signatory & E-Sign'}</span>
            </button>
          </div>
        </div>

        {/* Printable Proposal Document */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#F4F6FA] space-y-4">
          {showSignatoryPanel && (
            <div className="max-w-4xl mx-auto">
              <SignaturePadField value={signatory} onChange={setSignatory} compact />
            </div>
          )}

          <div
            id="specific-quotation-sheet"
            className="quotation-sheet bg-white p-6 sm:p-10 rounded-xl border border-[#E5E7EB] max-w-4xl mx-auto shadow-sm space-y-7"
          >
            
            {/* Letterhead */}
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
                    INTERIOR DESIGN & BUILD CONTRACTING
                  </p>
                  <p className="text-[10px] text-slate-400">
                    tech@apniestate.com • GSTIN: 27AABCA1234F1Z5
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <div className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                  Detailed Project Quotation
                </div>
                <div className="font-mono text-sm font-bold text-[#111827]">{quoteNumber}</div>
                <div className="text-xs text-slate-500">Project: {selectedProject.name}</div>
                <div className="text-xs text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Client & Site Grid */}
            <div className="grid grid-cols-2 gap-4 bg-[#F4F6FA] p-4 rounded-xl border border-[#E5E7EB] text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Client Details
                </span>
                <div className="font-bold text-sm text-[#111827]">{selectedProject.client}</div>
                <div className="text-slate-600">{selectedProject.clientPhone || linkedClient?.phone || 'On File'}</div>
                <div className="text-slate-600">{linkedClient?.email || 'client@studio.in'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Site & Scope
                </span>
                <div className="font-bold text-sm text-[#111827]">{selectedProject.name}</div>
                <div className="text-slate-600">{selectedProject.location || 'India'}</div>
                <div className="text-slate-600">
                  {selectedProject.rooms?.length || itemsByRoom.size} Active Rooms • {projectItems.length} BOQ Line Items
                </div>
              </div>
            </div>

            {/* Room-wise Schedule */}
            {projectItems.length > 0 ? (
              <div className="space-y-6">
                {Array.from(itemsByRoom.entries()).map(([roomId, items]) => {
                  const room = selectedProject.rooms?.find(r => r.id === roomId);
                  const roomName = room ? room.name : roomId === 'General Scope' ? 'General & Civil Scope' : 'Room Scope';
                  const roomTotal = items.reduce((sum, it) => sum + ((it.selling_rate || it.rate || 0) * (it.quantity || 1)), 0) * (1 + markupPercent / 100);

                  return (
                    <div key={roomId} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-[#E5E7EB] flex items-center justify-between">
                        <span className="font-bold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#1D4ED8]" />
                          <span>{roomName}</span>
                        </span>
                        <span className="text-xs font-bold text-[#1D4ED8] tabular-nums">
                          {formatINR(roomTotal)}
                        </span>
                      </div>

                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5E7EB] bg-white text-slate-500 font-semibold">
                            <th className="py-2 px-3">Item Description</th>
                            <th className="py-2 px-3 text-right">Qty</th>
                            <th className="py-2 px-3 text-center">Unit</th>
                            <th className="py-2 px-3 text-right">Rate</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                          {items.map(item => {
                            const effectiveRate = Math.round((item.selling_rate || item.rate || 0) * (1 + markupPercent / 100));
                            const lineAmount = effectiveRate * (item.quantity || 1);

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-[#111827]">{item.item_name}</div>
                                  {item.description && (
                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.description}</div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-medium tabular-nums">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-center text-slate-500">{item.unit || 'Nos'}</td>
                                <td className="py-2.5 px-3 text-right font-semibold text-slate-700 tabular-nums">
                                  {formatINR(effectiveRate)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">
                                  {formatINR(lineAmount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-[#E5E7EB] text-slate-500 text-xs">
                No items in this project's BOQ yet. Add items in the project rooms or use the Generic Estimator.
              </div>
            )}

            {/* Total Block */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-[#E5E7EB]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross BOQ Subtotal:</span>
                  <span className="font-semibold tabular-nums">{formatINR(markedUpTotal)}</span>
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
                  <span className="font-bold text-sm text-[#111827]">Final Proposal Total:</span>
                  <span className="font-bold text-lg text-[#1D4ED8] tabular-nums">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <QuotationSignatureBlock
              signatory={signatory}
              studioTitle="APNI ESTATE INTERIORS"
              clientName={selectedProject.client}
              clientSubtitle="Client Approval & Work Order Sign-off"
            />

          </div>
        </div>

      </div>
    </div>
  );
};

