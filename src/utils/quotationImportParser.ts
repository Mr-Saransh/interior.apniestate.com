// ==============================================================================
// APNI ESTATE INTERIORS - EXCEL / CSV / PDF QUOTATION & BOQ IMPORT PARSER
// ==============================================================================

import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ParsedQuoteItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface ParsedQuotationImport {
  items: ParsedQuoteItem[];
  sourceName: string;
  sourceType: 'excel' | 'csv' | 'pdf';
  detectedClientName?: string;
  warnings: string[];
}

function cleanNumber(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val !== 'string') return 0;
  const cleaned = val.replace(/[₹$,\s]/g, '').replace(/\/-$/, '');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isSummaryOrHeaderRow(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return (
    !lower ||
    /^(total|sub-?total|grand total|gst|tax|discount|sr\.?\s*no|s\.?\s*no|sl\.?\s*no|item\s*name|description|particulars|amount|terms|notes|thank you)/.test(lower)
  );
}

function normalizeUnit(val: unknown): string {
  const s = String(val || '').trim();
  if (!s) return 'Lot';
  if (/sq\.?\s*ft|sft|sqft/i.test(s)) return 'Sq.Ft';
  if (/r\.?\s*ft|rft/i.test(s)) return 'R.Ft';
  if (/nos|pcs|unit|each|no\b/i.test(s)) return 'Nos';
  if (/lot|lumpsum|ls\b/i.test(s)) return 'Lot';
  if (/set/i.test(s)) return 'Set';
  if (/kg/i.test(s)) return 'Kg';
  return s.slice(0, 14);
}

/**
 * Parse an uploaded .xlsx, .xls, or .csv spreadsheet into editable QuoteLineItems
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedQuotationImport> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded spreadsheet has no readable worksheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

  // Locate the best header row in top 15 rows
  let headerRowIdx = -1;
  let colMap = {
    category: -1,
    name: -1,
    spec: -1,
    qty: -1,
    unit: -1,
    rate: -1,
    amount: -1,
  };

  for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
    const row = rawRows[i].map((cell) => String(cell || '').trim().toLowerCase());
    const nameIdx = row.findIndex((c) =>
      /(item|particular|scope|work|description|material|product|task)/.test(c)
    );
    const rateOrAmtIdx = row.findIndex((c) => /(rate|price|unit cost|amount|total|cost)/.test(c));

    if (nameIdx !== -1 && (rateOrAmtIdx !== -1 || row.some((c) => /(qty|quantity|nos|area)/.test(c)))) {
      headerRowIdx = i;
      colMap = {
        category: row.findIndex((c) => /(category|room|area|space|section|zone|head)/.test(c)),
        name: nameIdx,
        spec: row.findIndex((c, idx) => idx !== nameIdx && /(spec|detail|remark|finish|brand|note)/.test(c)),
        qty: row.findIndex((c) => /(qty|quantity|nos|count|sqft|area)/.test(c) && !/(rate|amount|total)/.test(c)),
        unit: row.findIndex((c) => /(unit|uom|measure)/.test(c)),
        rate: row.findIndex((c) => /(rate|unit price|price|per unit)/.test(c)),
        amount: row.findIndex((c) => /(amount|total|line total|cost|value)/.test(c)),
      };
      break;
    }
  }

  const items: ParsedQuoteItem[] = [];
  const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((c) => String(c || '').trim() === '')) continue;

    let name = '';
    let category = 'General';
    let spec = '';
    let qty = 1;
    let unit = 'Lot';
    let rate = 0;
    let amount = 0;

    if (headerRowIdx >= 0) {
      name = colMap.name >= 0 ? String(row[colMap.name] || '').trim() : '';
      category = colMap.category >= 0 ? String(row[colMap.category] || '').trim() || 'General' : 'General';
      spec = colMap.spec >= 0 ? String(row[colMap.spec] || '').trim() : '';
      qty = colMap.qty >= 0 ? cleanNumber(row[colMap.qty]) || 1 : 1;
      unit = colMap.unit >= 0 ? normalizeUnit(row[colMap.unit]) : 'Lot';
      rate = colMap.rate >= 0 ? cleanNumber(row[colMap.rate]) : 0;
      amount = colMap.amount >= 0 ? cleanNumber(row[colMap.amount]) : 0;
    } else {
      // Heuristic fallback for headerless sheets
      const strings = row.map((c) => String(c || '').trim()).filter(Boolean);
      const numbers = row.map((c) => cleanNumber(c)).filter((n) => n > 0);
      name = strings.find((s) => Number.isNaN(Number(s.replace(/[₹$,\s]/g, ''))) && s.length > 2) || '';
      if (numbers.length >= 2) {
        qty = numbers[0] < 10000 ? numbers[0] : 1;
        rate = numbers[numbers.length >= 3 ? 1 : numbers.length - 1];
        amount = numbers[numbers.length - 1];
      } else if (numbers.length === 1) {
        rate = numbers[0];
        amount = numbers[0];
      }
    }

    if (!name || isSummaryOrHeaderRow(name)) continue;

    if (rate === 0 && amount > 0) {
      rate = Math.round((amount / (qty || 1)) * 100) / 100;
    }
    if (amount === 0 && rate > 0) {
      amount = Math.round(qty * rate);
    }

    // Skip lines that look like pure headings with 0 cost unless they are valid descriptive items
    if (rate === 0 && amount === 0 && name.length < 4) continue;

    items.push({
      id: `imp-${Date.now()}-${r}`,
      category,
      name,
      spec,
      qty: qty > 0 ? qty : 1,
      unit,
      rate,
      amount: qty * rate,
    });
  }

  return {
    items,
    sourceName: file.name,
    sourceType: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'excel',
    warnings: items.length === 0 ? ['No tabular BOQ rows were detected in the first sheet. Try ensuring columns have Name, Qty, Unit, and Rate headers.'] : [],
  };
}

/**
 * Parse an uploaded .pdf quotation / BOQ into editable QuoteLineItems using pdfjs-dist text coordinates
 */
export async function parsePdfQuotationFile(file: File): Promise<ParsedQuotationImport> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const allRows: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group positioned text items into visual lines by Y coordinate
    const lineBuckets: Array<{ y: number; cells: Array<{ x: number; text: string }> }> = [];

    for (const item of textContent.items as Array<{ str?: string; transform?: number[] }>) {
      const str = (item.str || '').trim();
      if (!str || !item.transform) continue;
      const x = item.transform[4];
      const y = item.transform[5];

      const existing = lineBuckets.find((b) => Math.abs(b.y - y) < 4.5);
      if (existing) {
        existing.cells.push({ x, text: str });
      } else {
        lineBuckets.push({ y, cells: [{ x, text: str }] });
      }
    }

    lineBuckets.sort((a, b) => b.y - a.y);
    for (const bucket of lineBuckets) {
      bucket.cells.sort((a, b) => a.x - b.x);
      const lineText = bucket.cells.map((c) => c.text).join('  ').trim();
      if (lineText) allRows.push(lineText);
    }
  }

  const items: ParsedQuoteItem[] = [];
  let currentCategory = 'Imported PDF';
  let detectedClientName: string | undefined;

  for (let i = 0; i < allRows.length; i++) {
    const line = allRows[i];

    // Detect client name hints if present
    const clientMatch = line.match(/^(?:client|prepared for|to|mr\.|mrs\.|ms\.|dr\.)\s*[:\-]?\s*(.+)$/i);
    if (!detectedClientName && clientMatch && clientMatch[1].length > 2 && clientMatch[1].length < 55) {
      detectedClientName = clientMatch[1].trim();
    }

    // Detect section headers (e.g., "KITCHEN", "MASTER BEDROOM", "LIVING ROOM")
    if (
      /^[A-Z0-9\s&\/\-]{4,36}$/.test(line) &&
      !/\d{3,}/.test(line) &&
      !isSummaryOrHeaderRow(line)
    ) {
      currentCategory = line
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      continue;
    }

    if (isSummaryOrHeaderRow(line)) continue;

    // Match rows ending with currency/number columns: e.g. "Wardrobe  85  Sq.Ft  1,950  1,65,750"
    const numericTokens = Array.from(line.matchAll(/(?:₹|Rs\.?\s*)?(\d[\d,]*(?:\.\d{1,2})?)/g)).map((m) => ({
      raw: m[0],
      val: cleanNumber(m[1]),
      index: m.index ?? 0,
    }));

    if (numericTokens.length >= 2) {
      const firstNumIdx = numericTokens[0].index;
      const labelPart = line.slice(0, firstNumIdx).replace(/^[\d.\s\-\)]+/, '').trim();
      if (!labelPart || labelPart.length < 3 || isSummaryOrHeaderRow(labelPart)) continue;

      const unitMatch = line.match(/\b(Sq\.?\s*Ft|Sqft|Sft|R\.?\s*Ft|Rft|Lot|Nos|Set|Kg|Pcs|Unit|Lumpsum)\b/i);
      const unit = unitMatch ? normalizeUnit(unitMatch[1]) : 'Lot';

      const vals = numericTokens.map((t) => t.val);
      let qty = 1;
      let rate = vals[vals.length - 1];

      if (vals.length >= 3) {
        qty = vals[vals.length - 3] > 0 && vals[vals.length - 3] < 50000 ? vals[vals.length - 3] : 1;
        rate = vals[vals.length - 2];
      } else if (vals.length === 2) {
        if (vals[0] < 5000 && vals[1] >= vals[0]) {
          qty = vals[0];
          rate = Math.round(vals[1] / (qty || 1));
        } else {
          rate = vals[0];
        }
      }

      if (rate <= 0) continue;

      items.push({
        id: `pdf-${Date.now()}-${i}`,
        category: currentCategory,
        name: labelPart.slice(0, 90),
        spec: 'Imported from PDF quotation',
        qty,
        unit,
        rate,
        amount: Math.round(qty * rate),
      });
    }
  }

  return {
    items,
    sourceName: file.name,
    sourceType: 'pdf',
    detectedClientName,
    warnings:
      items.length === 0
        ? ['Could not auto-extract priced rows from this PDF layout (it may be scanned as an image). You can add items directly below or export to Excel/CSV and import.']
        : [],
  };
}

export function exportQuotationToExcel(
  quoteNumber: string,
  clientName: string,
  items: ParsedQuoteItem[],
  summary: { subtotal: number; discountAmount: number; gstAmount: number; grandTotal: number }
) {
  const rows = [
    ['APNI ESTATE INTERIORS - QUOTATION'],
    ['Quotation No', quoteNumber, 'Client', clientName],
    [],
    ['Category', 'Item Name', 'Specification', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)'],
    ...items.map((item) => [
      item.category,
      item.name,
      item.spec,
      item.qty,
      item.unit,
      item.rate,
      item.qty * item.rate,
    ]),
    [],
    ['', '', '', '', '', 'Subtotal', summary.subtotal],
    ['', '', '', '', '', 'Discount', -summary.discountAmount],
    ['', '', '', '', '', 'GST', summary.gstAmount],
    ['', '', '', '', '', 'Grand Total', summary.grandTotal],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
  XLSX.writeFile(wb, `${quoteNumber}_${clientName.replace(/[^a-zA-Z0-9]+/g, '_')}.xlsx`);
}

