// ==============================================================================
// APNI ESTATE INTERIORS - CINEMATIC FULL-PAGE ERP <-> CRM MODE TRANSITION
// Smooth mobile-optimized architectural curtain featuring Apni Estate logo.
// ==============================================================================

import React from 'react';
import { FolderKanban, Users } from 'lucide-react';
import { WorkspaceMode } from '../../context/AppContext';

interface ModeTransitionOverlayProps {
  targetMode: WorkspaceMode | null;
  phase: 'entering' | 'exiting' | null;
  onSkip?: () => void;
}

export const ModeTransitionOverlay: React.FC<ModeTransitionOverlayProps> = ({
  targetMode,
  phase,
  onSkip
}) => {
  if (!targetMode || !phase) return null;

  const isCrm = targetMode === 'crm';

  return (
    <div
      onClick={onSkip}
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 select-none transition-all duration-300 ease-out cursor-pointer ${
        phase === 'entering' ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03] pointer-events-none'
      }`}
      style={{
        backgroundColor: '#FFFFFF',
        backgroundImage:
          'radial-gradient(circle at 50% 35%, rgba(239, 246, 255, 0.95) 0%, rgba(244, 246, 250, 0.6) 60%, #FFFFFF 100%), linear-gradient(to right, rgba(229, 231, 235, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 231, 235, 0.45) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 36px 36px, 36px 36px'
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Elevated Apni Estate Logo Mark */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-3xl bg-[#EFF6FF] animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg flex items-center justify-center p-3">
            <img
              src="/apni_estate_logo.png"
              alt="Apni Estate Interiors"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Mode Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8] text-[11px] font-bold uppercase tracking-widest mb-3">
          {isCrm ? <Users className="w-3.5 h-3.5" /> : <FolderKanban className="w-3.5 h-3.5" />}
          <span>{isCrm ? 'Studio CRM Mode' : 'Interior ERP Mode'}</span>
        </div>

        {/* Brand + Editorial Title */}
        <div className="text-[11px] font-bold tracking-[0.22em] text-[#1D4ED8] uppercase mb-1">
          APNI ESTATE INTERIORS
        </div>
        <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#111827] tracking-tight">
          {isCrm ? 'Entering Client & Sales Studio' : 'Entering Project Operations'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
          {isCrm
            ? 'Lead Pipeline · Bespoke Quotations · Client Walkthroughs'
            : 'Active Sites · Room BOQs · Procurement & Cost Control'}
        </p>

        {/* Smooth Progress Sweep Bar */}
        <div className="w-56 h-1.5 rounded-full bg-slate-100 border border-[#E5E7EB] overflow-hidden mt-7">
          <div className="h-full rounded-full bg-[#1D4ED8] animate-mode-sweep" />
        </div>

        <span className="mt-4 text-[10px] font-medium text-slate-400">
          Tap anywhere or press Alt + S to toggle
        </span>
      </div>
    </div>
  );
};

