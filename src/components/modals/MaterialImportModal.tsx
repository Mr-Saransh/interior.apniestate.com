// ==============================================================================
// APNI ESTATE INTERIORS - MATERIAL LIST DOCUMENT EXTRACTOR & IMPORT MODAL
// Supports: Excel (.xlsx, .xls), CSV, Vector PDFs with Interactive Preview & Mapping
// ==============================================================================

import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import {
  parseSpreadsheetFile,
  parsePdfQuotationFile,
  ParsedQuoteItem
} from '../../utils/quotationImportParser';
import { formatINR } from '../../utils/formatters';

interface MaterialImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface EditableImportRow extends ParsedQuoteItem {
  selected: boolean;
}

const COMMON_CATEGORIES = [
  'Plywood & Boards',
  'Laminates & Veneer',
  'Hardware & Fittings',
  'Paints & Primers',
  'Electrical & Wire',
  'Tiles & Stone',
  'Sanitary & Plumbing',
  'Glass & Mirrors',
  'Adhesives & Chemicals',
  'Fabric & Upholstery',
  'Civil Materials',
  'Lighting',
  'General'
];

const COMMON_UNITS = [
  'Sheets',
  'Pcs',
  'Nos',
  'Sq.Ft',
  'R.Ft',
  'Litres',
  'Bags',
  'Boxes',
  'Rolls',
  'Kg',
  'Lot',
  'Set'
];

export const MaterialImportModal: React.FC<MaterialImportModalProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const { addMaterial, projects } = useApp();
  const currentProject = projects.find(p => p.id === projectId);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [items, setItems] = useState<EditableImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const resetState = () => {
    setFile(null);
    setParsing(false);
    setParseError(null);
    setWarnings([]);
    setItems([]);
    setImporting(false);
    setImportSuccess(false);
    setSearchTerm('');
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setParsing(true);
    setParseError(null);
    setWarnings([]);
    setImportSuccess(false);

    try {
      const lower = uploadedFile.name.toLowerCase();
      let result;

      if (lower.endsWith('.pdf')) {
        result = await parsePdfQuotationFile(uploadedFile);
      } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        result = await parseSpreadsheetFile(uploadedFile);
      } else {
        throw new Error('Unsupported format. Please upload an Excel (.xlsx, .xls), CSV, or PDF file.');
      }

      if (!result.items || result.items.length === 0) {
        setParseError('No tabular material or BOQ rows could be extracted from this file. You can add items manually below or check file formatting.');
      }

      setWarnings(result.warnings || []);
      setItems(
        result.items.map(item => ({
          ...item,
          selected: true
        }))
      );
    } catch (err: any) {
      console.error('Document parsing error:', err);
      setParseError(err?.message || 'Failed to parse file. Please verify file integrity.');
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const updateItem = (index: number, updates: Partial<EditableImportRow>) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const addNewRow = () => {
    const newRow: EditableImportRow = {
      id: `manual-${Date.now()}`,
      category: 'General',
      name: '',
      spec: '',
      qty: 1,
      unit: 'Nos',
      rate: 0,
      amount: 0,
      selected: true
    };
    setItems(prev => [newRow, ...prev]);
  };

  const toggleSelectAll = () => {
    const allSelected = items.every(i => i.selected);
    setItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  const selectedCount = items.filter(i => i.selected).length;
  const totalEstimatedCost = items
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (Number(i.qty || 0) * Number(i.rate || 0)), 0);

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.unit.toLowerCase().includes(term)
    );
  });

  const handleConfirmImport = async () => {
    const toImport = items.filter(i => i.selected && i.name.trim().length > 0);
    if (toImport.length === 0) {
      setParseError('Please select at least one item with a valid name to import.');
      return;
    }

    setImporting(true);
    setParseError(null);

    try {
      for (const item of toImport) {
        await addMaterial({
          project_id: projectId,
          name: item.name.trim(),
          category: item.category || 'General',
          unit: item.unit || 'Nos',
          quantity_required: Number(item.qty) || 1,
          quantity_ordered: Number(item.qty) || 1,
          quantity_received: 0,
          estimated_rate: Number(item.rate) || 0,
          delivery_status: 'Pending',
          notes: item.spec ? `${item.spec} (Extracted from ${file?.name || 'document'})` : `Extracted from ${file?.name || 'document'}`
        });
      }

      setImportSuccess(true);
      setTimeout(() => {
        handleModalClose();
      }, 1200);
    } catch (err: any) {
      setParseError(err?.message || 'Failed to import materials.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Import Materials from Quotation / BOQ Document"
      subtitle={currentProject ? `Project: ${currentProject.name}` : undefined}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Upload Zone when no items loaded or user re-uploads */}
        {(!file || items.length === 0) && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 hover:bg-brand-50/20"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.pdf"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-brand-50 text-brand-600 mb-3 shadow-inner">
                {parsing ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-brand-600" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {parsing ? 'Extracting Material Rows...' : 'Choose or Drag Quotation / BOQ File'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                Supports Excel (.xlsx, .xls), CSV spreadsheets, and vector PDF estimate documents.
                Auto-extracts material names, specifications, quantities, units, and rates.
              </p>
              <button
                type="button"
                disabled={parsing}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Browse Files</span>
              </button>
            </div>
          </div>
        )}

        {/* Parsing Error or Warnings */}
        {parseError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{parseError}</span>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{warnings[0]}</span>
          </div>
        )}

        {importSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Successfully imported {selectedCount} materials into this project! Updating list...</span>
          </div>
        )}

        {/* Extracted Items Interactive Review Table */}
        {items.length > 0 && (
          <div className="space-y-3">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-slate-100/70 border border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  {items.every(i => i.selected) ? (
                    <CheckSquare className="w-4 h-4 text-brand-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All ({items.length})</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-600 font-semibold">
                  Selected: <strong className="text-brand-600">{selectedCount}</strong> / {items.length}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-600 font-semibold">
                  Total Value: <strong className="text-emerald-700">{formatINR(totalEstimatedCost)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search extracted rows..."
                    className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-1 focus:ring-brand-500 focus:outline-none w-44"
                  />
                </div>
                <button
                  type="button"
                  onClick={addNewRow}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-600" />
                  <span>Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Upload another file"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-upload</span>
                </button>
              </div>
            </div>

            {/* Scrollable Editable Table */}
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="p-2.5 w-10 text-center">Sel</th>
                    <th className="p-2.5">Material Name & Spec</th>
                    <th className="p-2.5 w-36">Category</th>
                    <th className="p-2.5 w-20 text-right">Required Qty</th>
                    <th className="p-2.5 w-24">Unit</th>
                    <th className="p-2.5 w-24 text-right">Rate (₹)</th>
                    <th className="p-2.5 w-24 text-right">Total (₹)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredItems.map((item) => {
                    const originalIdx = items.findIndex(i => i.id === item.id);
                    const lineAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${!item.selected ? 'opacity-40 bg-slate-50/30' : ''}`}>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => updateItem(originalIdx, { selected: e.target.checked })}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(originalIdx, { name: e.target.value })}
                            placeholder="Material name"
                            className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none font-semibold text-slate-900 bg-transparent"
                          />
                          {item.spec && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-xs px-2">
                              {item.spec}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <select
                            value={item.category || 'General'}
                            onChange={(e) => updateItem(originalIdx, { category: e.target.value })}
                            className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-700 focus:ring-1 focus:ring-brand-500"
                          >
                            {COMMON_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.qty}
                            onChange={(e) => {
                              const q = parseFloat(e.target.value) || 0;
                              updateItem(originalIdx, { qty: q, amount: q * (Number(item.rate) || 0) });
                            }}
                            className="w-16 px-1.5 py-1 text-right rounded border border-slate-200 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="p-2.5">
                          <select
                            value={item.unit || 'Nos'}
                            onChange={(e) => updateItem(originalIdx, { unit: e.target.value })}
                            className="w-full px-1.5 py-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
                          >
                            {COMMON_UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.rate}
                            onChange={(e) => {
                              const r = parseFloat(e.target.value) || 0;
                              updateItem(originalIdx, { rate: r, amount: (Number(item.qty) || 0) * r });
                            }}
                            className="w-20 px-1.5 py-1 text-right rounded border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-800">
                          {formatINR(lineAmount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(originalIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Extracted from <strong className="font-semibold text-slate-700">{file?.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importing || selectedCount === 0}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {importing ? 'Importing Materials...' : `Import ${selectedCount} Materials`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
