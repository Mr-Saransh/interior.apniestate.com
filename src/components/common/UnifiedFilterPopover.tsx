// ==============================================================================
// UNIFIED ARCHITECTURAL FILTER POPOVER
// Single compact side filter button consolidating all filters & sort controls.
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export interface FilterGroupOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  id: string;
  label: string;
  type: 'select' | 'pills';
  value: string;
  options: FilterGroupOption[];
  onChange: (value: string) => void;
}

interface UnifiedFilterPopoverProps {
  fields: FilterFieldConfig[];
  activeCount: number;
  onReset: () => void;
  buttonLabel?: string;
}

export const UnifiedFilterPopover: React.FC<UnifiedFilterPopoverProps> = ({
  fields,
  activeCount,
  onReset,
  buttonLabel = 'Filters'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
          isOpen || activeCount > 0
            ? 'bg-[#EFF6FF] border-[#1D4ED8]/40 text-[#1D4ED8]'
            : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[310px] sm:w-[340px] rounded-2xl bg-white border border-[#E5E7EB] shadow-xl z-40 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span className="text-xs font-bold text-[#111827]">Filter & Sort</span>
            </div>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-0.5">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {field.label}
                </label>

                {field.type === 'pills' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {field.options.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                              : 'bg-[#F8FAFC] border-[#E5E7EB] text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#1D4ED8] focus:outline-none cursor-pointer"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

