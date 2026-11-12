// ==============================================================================
// APNI ESTATE INTERIORS - BESPOKE ARCHITECTURAL LANDING PAGE (ERP + CRM)
// ==============================================================================

import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FolderKanban, 
  Users, 
  FileCheck2, 
  Layers, 
  Clock, 
  Camera, 
  ShieldCheck, 
  IndianRupee, 
  ChevronRight,
  Calculator,
  LayoutGrid,
  Zap,
  Building2,
  Phone,
  Mail,
  Star,
  Flag
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface LandingPageProps {
  onStartTrial: () => void;
  onExploreDemo: () => void;
  onOpenEstimator?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onExploreDemo,
  onOpenEstimator
}) => {
  const [heroMode, setHeroMode] = useState<'erp' | 'crm'>('erp');
  const [calculatorBhk, setCalculatorBhk] = useState<'2bhk' | '3bhk' | '4bhk' | 'villa'>('3bhk');
  const [calculatorArea, setCalculatorArea] = useState<number>(1450);
  const [calculatorTier, setCalculatorTier] = useState<'essential' | 'signature' | 'luxury'>('signature');

  // Estimate calculation
  const ratePerSqFt = calculatorTier === 'essential' ? 1250 : calculatorTier === 'signature' ? 1950 : 2850;
  const estimatedCost = calculatorArea * ratePerSqFt;

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans selection:bg-[#1D4ED8] selection:text-white">
      
      {/* ── 1. Top Architectural Navigation Bar ── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/apni_estate_logo.png" 
              alt="Apni Estate" 
              className="w-8 h-8 rounded-lg object-contain" 
            />
            <div>
              <span className="font-bold text-sm tracking-[0.2em] text-[#1D4ED8] uppercase block font-display">
                APNI ESTATE
              </span>
              <span className="text-[9px] font-extrabold tracking-[0.22em] text-slate-500 uppercase leading-none block">
                INTERIORS ERP + CRM
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#mode-switch" className="hover:text-[#1D4ED8] transition-colors">ERP ↔ CRM Dual Mode</a>
            <a href="#room-boq" className="hover:text-[#1D4ED8] transition-colors">Room BOQs</a>
            <a href="#estimator" className="hover:text-[#1D4ED8] transition-colors">Instant Estimator</a>
            <a href="#gantt" className="hover:text-[#1D4ED8] transition-colors">Gantt & DPR</a>
            <a href="#pricing" className="hover:text-[#1D4ED8] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onExploreDemo}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#1D4ED8] hover:bg-[#EFF6FF] border border-blue-200 transition-colors cursor-pointer"
            >
              Live Demo
            </button>
            <button
              onClick={onStartTrial}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>15-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. Hero Section with Interactive Mode Toggle ── */}
      <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Built Specifically for Indian Interior Studios & Designers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-editorial font-bold text-[#111827] tracking-tight leading-[1.12]">
            The Bespoke Operating System for <span className="text-[#1D4ED8] italic">Interior Design</span> Studios.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            One platform that unifies your <strong className="text-slate-900 font-semibold">Studio CRM</strong> (leads, proposals, client moodboards) and <strong className="text-slate-900 font-semibold">Interior ERP</strong> (room-wise BOQs, vendor purchasing, Gantt timelines & live site DPRs).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Your 15-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-[#E5E7EB] shadow-subtle transition-all cursor-pointer"
            >
              Explore Demo Sandbox
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>No credit card required</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private workspace</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zoho OTP verified login</span>
            </span>
          </div>
        </div>

        {/* ── 3. Interactive Hero UI Switcher (CRM ↔ ERP) ── */}
        <div id="mode-switch" className="mt-12 max-w-5xl mx-auto">
          {/* Segmented Mode Pill Control */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-1 rounded-2xl border border-[#E5E7EB] shadow-subtle inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHeroMode('erp')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  heroMode === 'erp'
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Interior ERP (Operations & Site)</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode('crm')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  heroMode === 'crm'
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Studio CRM (Client & Sales)</span>
              </button>
            </div>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card overflow-hidden">
            {/* Mock Window Top Bar */}
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-500 ml-2 font-mono">
                  {heroMode === 'erp' ? 'apniestate.com/erp/projects/3bhk-worli' : 'apniestate.com/crm/leads/pipeline'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-blue-200">
                {heroMode === 'erp' ? 'ERP EXECUTION MODE' : 'CRM PIPELINE MODE'}
              </span>
            </div>

            {/* Mockup Body Content */}
            {heroMode === 'erp' ? (
              /* ERP Interactive Preview */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#111827]">
                      Villa Sereno — 3BHK Penthouse
                    </h3>
                    <p className="text-xs text-slate-500">Worli Sea Face, Mumbai • Client: Dr. Siddharth Rao</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      Budget: ₹42,50,000
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                      Status: On Track (65%)
                    </span>
                  </div>
                </div>

                {/* Room-wise BOQ Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#1D4ED8]" />
                      <span>Room-Wise Cost Schedule & BOQ</span>
                    </span>
                    <span className="text-xs text-[#1D4ED8] font-bold">14 Line Items Approved</span>
                  </div>

                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Room & Scope</th>
                          <th className="py-2.5 px-3">Material Specification</th>
                          <th className="py-2.5 px-3 text-right">Qty</th>
                          <th className="py-2.5 px-3 text-right">Rate</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#111827]">Living Room: TV Console</td>
                          <td className="py-2.5 px-3 text-slate-600">Charcoal fluted louvers with PU matte painted carcase</td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-medium">1 Lot</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">₹95,000</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">₹95,000</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#111827]">Master Bed: Wardrobe & Loft</td>
                          <td className="py-2.5 px-3 text-slate-600">Century Marine Ply 710 + 1mm Merino Laminate + Hafele</td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-medium">85 sq.ft</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">₹1,950</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">₹1,65,750</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#111827]">Kitchen: Island Modular Setup</td>
                          <td className="py-2.5 px-3 text-slate-600">BWP Marine Ply, Kalinga Quartz Counter, Tandem Soft-Close</td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-medium">1 Lot</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">₹2,85,000</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111827] tabular-nums">₹2,85,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* CRM Interactive Preview */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#111827]">
                      Client Lead Pipeline (Kanban)
                    </h3>
                    <p className="text-xs text-slate-500">Active Consultations • ₹82,00,000 Pipeline Value</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-3 py-1 rounded-lg border border-blue-200">
                      7 Active Leads
                    </span>
                  </div>
                </div>

                {/* 3 Kanban Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                      <span>New Inquiries (3)</span>
                      <span>₹28L</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] shadow-xs space-y-1">
                      <div className="font-editorial text-sm font-bold text-[#111827]">Ananya & Vikram Deshmukh</div>
                      <div className="text-[11px] text-slate-500">3BHK Penthouse • Juhu, Mumbai</div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                        <span className="text-[#1D4ED8]">₹18,00,000</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Instagram</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                      <span>Proposal Sent (2)</span>
                      <span>₹34L</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] shadow-xs space-y-1">
                      <div className="font-editorial text-sm font-bold text-[#111827]">Rohan Singhania</div>
                      <div className="text-[11px] text-slate-500">Villa Interior • Golf Course Rd, Gurgaon</div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                        <span className="text-purple-700">₹24,00,000</span>
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Website</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>Won & Contracted (2)</span>
                      <span>₹48L</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] shadow-xs space-y-1">
                      <div className="font-editorial text-sm font-bold text-[#111827]">Siddharth Roy (Nexus Tech)</div>
                      <div className="text-[11px] text-slate-500">Studio Office • Indiranagar, Bangalore</div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                        <span className="text-emerald-700">₹32,00,000</span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Referral</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Interactive 60-Second Instant Quotation Estimator Widget ── */}
      <section id="estimator" className="py-16 bg-white border-y border-[#E5E7EB] px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-blue-200">
              Interactive Estimator Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#111827]">
              Instant Interior Cost Estimation
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Simulate room-wise estimation based on standard verified materials and Indian market labour rates.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-[#F4F6FA] rounded-2xl border border-[#E5E7EB] shadow-subtle space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Property Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['2bhk', '3bhk', '4bhk', 'villa'] as const).map(bhk => (
                    <button
                      key={bhk}
                      onClick={() => {
                        setCalculatorBhk(bhk);
                        setCalculatorArea(bhk === '2bhk' ? 950 : bhk === '3bhk' ? 1450 : bhk === '4bhk' ? 2200 : 3400);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        calculatorBhk === bhk
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-[#E5E7EB]'
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Carpet Area
                  </label>
                  <span className="font-bold text-sm text-[#1D4ED8] tabular-nums">{calculatorArea} sq.ft</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="4500"
                  step="50"
                  value={calculatorArea}
                  onChange={(e) => setCalculatorArea(Number(e.target.value))}
                  className="w-full accent-[#1D4ED8] h-2 bg-slate-200 rounded-lg cursor-pointer mt-3"
                />
              </div>

              {/* Quality Package */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Specification Package
                </label>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E7EB]">
                  {(['essential', 'signature', 'luxury'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        calculatorTier === tier
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Result Box */}
            <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Estimated Turnkey Interior Cost:</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1D4ED8] tabular-nums font-editorial">
                  {formatINR(estimatedCost)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Approx. ₹{ratePerSqFt}/sq.ft • Includes Woodwork, False Ceiling, Painting & Electrical
                </div>
              </div>

              <button
                onClick={onStartTrial}
                className="px-5 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Generate Official Quotation in App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Gantt Chart & Daily Progress (DPR) Feature Spotlight ── */}
      <section id="gantt" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-blue-200">
            Execution Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#111827]">
            Never Miss a Handover Deadline.
          </h2>
          <p className="text-sm text-slate-500">
            Keep carpenters, civil contractors, material suppliers, and clients synchronized from Demolition to Keys Handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gantt Feature Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-subtle space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Visual Gantt Timeline & Milestones</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track multi-week phase progressions: 3D render approvals, civil work, custom carpentry, and painting finishes. Set milestone triggers that unlock client stage payments automatically.
            </p>
            <div className="p-3 bg-[#F4F6FA] rounded-xl border border-[#E5E7EB] space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Carpentry & Modular Joinery (Week 11)</span>
                <span className="text-[#1D4ED8]">65%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1D4ED8] h-full rounded-full w-[65%]" />
              </div>
            </div>
          </div>

          {/* DPR Feature Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-subtle space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Live Site DPR & Photo Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Site supervisors can capture daily progress photos directly from mobile cameras, log on-site worker counts (carpenters, masons, painters), and report bottlenecks in real time. No spreadsheets required.
            </p>
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time photo upload & labour headcount logging</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing & Studio Trial ── */}
      <section id="pricing" className="py-16 bg-white border-t border-[#E5E7EB] px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#111827]">
              Simple, Transparent Studio Plans
            </h2>
            <p className="text-sm text-slate-500">
              Start with a 15-day unrestricted trial. Upgrade when your studio expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</div>
                <div className="text-2xl font-bold text-[#111827]">₹3,000 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                <p className="text-xs text-slate-600">For freelance interior designers and boutique studios.</p>
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div>✓ Up to 5 Active Projects</div>
                  <div>✓ Room-wise BOQs & Quotations</div>
                  <div>✓ Client Portal Link Sharing</div>
                </div>
              </div>
              <button onClick={onStartTrial} className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-50">
                Start Trial
              </button>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#1D4ED8] bg-[#EFF6FF]/40 space-y-4 flex flex-col justify-between relative shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D4ED8] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Studio Pro</div>
                <div className="text-2xl font-bold text-[#111827]">₹5,000 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                <p className="text-xs text-slate-600">For growing interior architecture firms & turnkey contractors.</p>
                <div className="pt-3 border-t border-blue-200 space-y-2 text-xs text-slate-700 font-medium">
                  <div>✓ Unlimited Projects & BOQs</div>
                  <div>✓ Gantt Timeline & Milestones</div>
                  <div>✓ Mobile DPR Photo Capture</div>
                  <div>✓ Vendor Purchase Orders & Invoicing</div>
                </div>
              </div>
              <button onClick={onStartTrial} className="w-full py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-xs hover:bg-[#1E40AF]">
                Start 15-Day Free Trial
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise</div>
                <div className="text-2xl font-bold text-[#111827]">₹7,000 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                <p className="text-xs text-slate-600">For multi-branch interior companies with multiple site teams.</p>
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div>✓ Multi-Branch Architecture</div>
                  <div>✓ Granular Roles & Access Controls</div>
                  <div>✓ Custom Role Approvals</div>
                  <div>✓ Priority 24/7 Support</div>
                </div>
              </div>
              <button onClick={onStartTrial} className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-50">
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="py-10 bg-[#0F172A] text-slate-400 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <img 
              src="/apni_estate_logo.png" 
              alt="Apni Estate" 
              className="w-7 h-7 rounded-lg object-contain bg-white p-0.5" 
            />
            <span className="text-white font-bold tracking-widest uppercase">
              APNI ESTATE INTERIORS
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>tech@apniestate.com</span>
            <span>Made with precision for Indian Interior Designers</span>
          </div>

          <div>
            © {new Date().getFullYear()} Apni Estate Interiors. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

