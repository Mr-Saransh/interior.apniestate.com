// ==============================================================================
// APNI ESTATE INTERIORS - OPTIONAL SIGNATORY, DESIGNATION & E-SIGNATURE CONTROL
// Captures portable PNG data URLs today (drop-in ready for Cloudinary URLs later).
// ==============================================================================

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Eraser, Check, UserCheck } from 'lucide-react';

export interface SignatoryConfig {
  enabled: boolean;
  name: string;
  designation: string;
  /** Stores PNG DataURL currently; ready to store Cloudinary secure_url directly */
  signatureUrl: string;
}

export const DEFAULT_SIGNATORY: SignatoryConfig = {
  enabled: true,
  name: '',
  designation: '',
  signatureUrl: '',
};

interface SignaturePadFieldProps {
  value: SignatoryConfig;
  onChange: (next: SignatoryConfig) => void;
  compact?: boolean;
}

export const SignaturePadField: React.FC<SignaturePadFieldProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const [inputMode, setInputMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync clear state when signatureUrl is emptied externally
  useEffect(() => {
    if (!value.signatureUrl && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [value.signatureUrl]);

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPointerPos(e);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finalizeStroke = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange({
      ...value,
      signatureUrl: canvas.toDataURL('image/png'),
    });
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setUploadError(null);
    onChange({ ...value, signatureUrl: '' });
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a PNG, JPG, or WEBP signature image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Signature image must be under 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ ...value, signatureUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] ${compact ? 'p-3.5' : 'p-4'} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1D4ED8]" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Authorized Signatory &amp; E-Sign (Optional)
            </span>
            {!compact && (
              <span className="text-[11px] text-slate-500">
                Add person name, designation &amp; optional e-signature, or leave blank for physical signing.
              </span>
            )}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
            className="w-4 h-4 rounded text-[#1D4ED8] border-slate-300 cursor-pointer"
          />
          <span>Show on Quotation</span>
        </label>
      </div>

      {value.enabled && (
        <div className="space-y-3 pt-1 border-t border-[#E5E7EB]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                Signatory Person Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Mehta"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                Designation / Role (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Principal Architect / Studio Director"
                value={value.designation}
                onChange={(e) => onChange({ ...value, designation: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center bg-[#F4F6FA] p-0.5 rounded-lg border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setInputMode('draw')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    inputMode === 'draw' ? 'bg-white text-[#1D4ED8] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Draw E-Sign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    inputMode === 'upload' ? 'bg-white text-[#1D4ED8] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Image</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {value.signatureUrl && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    <Check className="w-3 h-3" /> E-Sign Added
                  </span>
                )}
                {value.signatureUrl && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E5E7EB] text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear Sign</span>
                  </button>
                )}
              </div>
            </div>

            {inputMode === 'draw' ? (
              <div className="relative rounded-xl border border-dashed border-slate-300 bg-[#FAFCFF] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={110}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finalizeStroke}
                  onPointerLeave={finalizeStroke}
                  onPointerCancel={finalizeStroke}
                  className="w-full h-24 sm:h-28 touch-none cursor-crosshair block"
                />
                {!value.signatureUrl && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">
                    Sign here with mouse, stylus, or finger (optional)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-[#FAFCFF]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{value.signatureUrl ? 'Replace Signature PNG/JPG' : 'Choose Signature Image'}</span>
                </button>
                {value.signatureUrl && (
                  <img
                    src={value.signatureUrl}
                    alt="Uploaded E-Sign Preview"
                    className="h-10 max-w-[140px] object-contain bg-white px-2 py-1 rounded border border-[#E5E7EB]"
                  />
                )}
                <span className="text-[11px] text-slate-500">Transparent PNG works best.</span>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface QuotationSignatureBlockProps {
  signatory: SignatoryConfig;
  studioTitle: string;
  clientName?: string;
  clientSubtitle?: string;
}

export const QuotationSignatureBlock: React.FC<QuotationSignatureBlockProps> = ({
  signatory,
  studioTitle,
  clientName,
  clientSubtitle = 'Client Approval & Signature',
}) => {
  if (!signatory.enabled) return null;

  return (
    <div className="print-avoid-break pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-500">
      <div>
        <div className="h-14 w-48 flex items-end pb-1 border-b border-slate-300 mb-1.5">
          {signatory.signatureUrl && (
            <img
              src={signatory.signatureUrl}
              alt={signatory.name ? `Signature of ${signatory.name}` : 'Authorized Signature'}
              className="max-h-12 max-w-full object-contain object-left"
            />
          )}
        </div>
        <div className="font-bold text-slate-900">
          {signatory.name.trim() || `For ${studioTitle}`}
        </div>
        <div className="text-[11px] text-slate-600">
          {signatory.designation.trim()
            ? signatory.name.trim()
              ? `${signatory.designation.trim()} • ${studioTitle}`
              : signatory.designation.trim()
            : `Authorized Signatory${signatory.name.trim() ? ` • ${studioTitle}` : ''}`}
        </div>
      </div>

      <div className="sm:text-right">
        <div className="h-14 w-48 border-b border-slate-300 mb-1.5 sm:ml-auto" />
        <div className="font-bold text-slate-900">{clientName || 'Client Name'}</div>
        <div className="text-[11px] text-slate-600">{clientSubtitle}</div>
      </div>
    </div>
  );
};

