// ==============================================================================
// APNI ESTATE INTERIORS - BESPOKE VISUAL LANDING PAGE
// Simple, visual-first design for solo designers & small interior studios
// ==============================================================================

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Layers, 
  IndianRupee, 
  Calculator, 
  ChevronRight, 
  FileText, 
  PhoneCall, 
  Hammer, 
  Palette, 
  ShieldCheck, 
  Compass, 
  Sliders, 
  TrendingUp, 
  Maximize2, 
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface LandingPageProps {
  onStartTrial: () => void;
  onExploreDemo?: () => void;
  onOpenEstimator?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial
}) => {
  // Screenshot preview selector
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'navigation'>('overview');

  // Interactive Quote Estimator state
  const [calculatorBhk, setCalculatorBhk] = useState<'1bhk' | '2bhk' | '3bhk' | '4bhk' | 'villa'>('3bhk');
  const [calculatorArea, setCalculatorArea] = useState<number>(1400);
  const [calculatorTier, setCalculatorTier] = useState<'standard' | 'premium' | 'luxury'>('premium');

  // Rate calculation
  const rates = {
    standard: 1200,
    premium: 1850,
    luxury: 2600
  };
  const ratePerSqFt = rates[calculatorTier];
  const estimatedTotal = calculatorArea * ratePerSqFt;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#1D4ED8] selection:text-white overflow-x-hidden">
      
      {/* ── 1. Top Navigation Bar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/apni_estate_logo.png" 
              alt="Apni Estate" 
              className="w-9 h-9 rounded-xl object-contain shadow-xs border border-slate-100" 
            />
            <div>
              <span className="font-bold text-sm tracking-[0.18em] text-[#1D4ED8] uppercase block font-display leading-tight">
                APNI ESTATE
              </span>
              <span className="text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase leading-none block">
                INTERIORS
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#preview" className="hover:text-[#1D4ED8] transition-colors flex items-center gap-1">
              <span>App Preview</span>
            </a>
            <a href="#how-it-works" className="hover:text-[#1D4ED8] transition-colors flex items-center gap-1">
              <span>How It Works</span>
            </a>
            <a href="#estimator" className="hover:text-[#1D4ED8] transition-colors flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Cost Calculator</span>
            </a>
            <a href="#features" className="hover:text-[#1D4ED8] transition-colors">
              <span>Key Features</span>
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStartTrial}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-700 hover:text-[#1D4ED8] px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onStartTrial}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. Hero Section with Visual Diagrams & Surrounding Artifacts ── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 artistic-blueprint-grid">
        {/* Glow orb decorations */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-xs text-[#1D4ED8] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Made Simple for Interior Designers & Small Studios</span>
            </div>
          </div>

          {/* Hero Headline & Diagram Wrapper */}
          <div className="relative text-center max-w-4xl mx-auto space-y-6">
            
            {/* FLOATING DIAGRAM ARTIFACT: Left (Living Room BOQ Pill) */}
            <div className="hidden lg:flex absolute -left-20 top-6 animate-float-gentle flex-col items-start p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-card text-left max-w-[210px] z-20">
              <div className="flex items-center gap-2 mb-2 w-full border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold text-xs">
                  BOQ
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Master Bedroom</div>
                  <div className="text-[9px] text-slate-400">200 sq.ft @ ₹250/sqft</div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full text-[11px] font-bold text-[#1D4ED8]">
                <span>Cost:</span>
                <span className="tabular-nums font-semibold">₹50,000</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#1D4ED8] h-full w-4/5 rounded-full" />
              </div>
            </div>

            {/* FLOATING DIAGRAM ARTIFACT: Right (Site Progress & Alert) */}
            <div className="hidden lg:flex absolute -right-20 top-12 animate-float-delayed flex-col items-start p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-card text-left max-w-[210px] z-20">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Live Site Update</span>
              </div>
              <div className="text-[12px] font-bold text-slate-800">Carpentry & Joinery</div>
              <div className="text-[10px] text-slate-500 mt-0.5">3 workers on-site • Photos logged</div>
              <div className="mt-2 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                On Schedule (85%)
              </div>
            </div>

            {/* Main Headline (Simple & Clear, No Tech Jargon) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] tracking-tight leading-[1.18] font-editorial">
              Run Your Interior Projects <br className="hidden sm:inline" />
              <span className="text-[#1D4ED8] relative inline-block">
                Without The Chaos.
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-[#1D4ED8]/25" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Quotation maker, room cost templates, site photo updates, and expense tracking — 
              everything a single designer or contractor needs in one easy app.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartTrial}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#estimator"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-[#1D4ED8]" />
                <span>Calculate Project Cost</span>
              </a>
            </div>

            {/* Architectural Connecting Flow Diagram */}
            <div className="pt-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="text-xs font-bold text-slate-800">Room BOQ</div>
                  <div className="text-[10px] text-slate-500">Living, Bed, Kitchen</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="text-xs font-bold text-slate-800">Client Quote</div>
                  <div className="text-[10px] text-slate-500">1-Click Shareable Link</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="text-xs font-bold text-slate-800">Site Updates</div>
                  <div className="text-[10px] text-slate-500">Daily Photos & Progress</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div className="text-xs font-bold text-slate-800">Clear Profit</div>
                  <div className="text-[10px] text-slate-500">Budget vs Actual Spend</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Recognitions Section (White Background, Centered in Middle) ── */}
      <section className="py-10 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-6">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Government Recognition &amp; Startup Accreditations
            </span>
            <div className="w-12 h-0.5 bg-[#1D4ED8] mx-auto rounded-full mt-1"></div>
          </div>

          {/* Centered logos with clean cards */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16 pt-2">
            
            {/* Startup India */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/startup-india.png" 
                alt="#startupindia" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[200px]"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Recognized Startup
              </span>
            </div>

            {/* Directorate of Information Technology - Govt of Tripura */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/dit-tripura.jpg" 
                alt="Directorate of Information Technology, Govt. of Tripura" 
                className="h-16 sm:h-20 w-auto object-contain rounded-full shadow-xs border border-slate-100"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2 text-center max-w-[160px] leading-tight">
                Directorate of IT, Govt. of Tripura
              </span>
            </div>

            {/* Startup Tripura */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/startup-tripura.png" 
                alt="Startup Tripura" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[190px]"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Startup Tripura Initiative
              </span>
            </div>

          </div>

          <p className="text-xs text-slate-600 max-w-xl mx-auto pt-1 font-medium">
            Proudly recognized under national and state startup ecosystems fostering Indian architectural technology.
          </p>

        </div>
      </section>

      {/* ── 4. Real App Visual Showcase (Actual App Screenshots in Device Frames) ── */}
      <section id="preview" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Real App Interface
          </span>
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
            Clean, Intuitive &amp; Built for Your Phone
          </h2>
          <p className="text-sm text-slate-600">
            Designed for busy site visits and client meetings. Switch between your overview dashboard, 
            active project cards, and quick studio actions.
          </p>
        </div>

        {/* Tab Switcher for Screenshots */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Projects View
            </button>
            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'navigation'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quick Studio Navigation
            </button>
          </div>
        </div>

        {/* Device Frame Display */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-card p-4 sm:p-6 overflow-hidden">
          
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-xs font-medium text-slate-400 pl-2 font-mono hidden sm:inline">
                apniestate.com/{activeTab}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {activeTab === 'overview' && 'Live KPIs & Budget Spend'}
                {activeTab === 'projects' && 'Room-wise Status & Alert System'}
                {activeTab === 'navigation' && 'Streamlined Mobile Drawer'}
              </span>
            </div>
          </div>

          {/* Screenshot Display Area with Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 flex items-center justify-center min-h-[380px] sm:min-h-[500px]">
            {activeTab === 'overview' && (
              <div className="w-full flex flex-col items-center">
                <img 
                  src="/screenshots/app-overview.jpg" 
                  alt="Overview Dashboard" 
                  className="w-full max-w-2xl max-h-[600px] object-contain rounded-xl shadow-xs transition-opacity duration-300"
                />
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="w-full flex flex-col items-center">
                <img 
                  src="/screenshots/app-projects.jpg" 
                  alt="Projects List" 
                  className="w-full max-w-sm sm:max-w-md max-h-[600px] object-contain rounded-xl shadow-xs transition-opacity duration-300"
                />
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="w-full flex flex-col items-center">
                <img 
                  src="/screenshots/app-sidebar.jpg" 
                  alt="Studio Sidebar Navigation" 
                  className="w-full max-w-sm sm:max-w-md max-h-[600px] object-contain rounded-xl shadow-xs transition-opacity duration-300"
                />
              </div>
            )}
          </div>

          {/* Feature Highlights beneath screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-2 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">100% Mobile Ready</div>
                <div className="text-[11px] text-slate-500">Add expenses or capture photos directly on site</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">No Math Headaches</div>
                <div className="text-[11px] text-slate-500">Auto-calculates sqft rates, quantities and margins</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Zero Overspending</div>
                <div className="text-[11px] text-slate-500">Alerts you before site purchases exceed client budget</div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ── 5. Visual Feature Breakdown (Diagrams & Cards, Low Text) ── */}
      <section id="features" className="py-16 bg-white border-y border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Built for How You Work
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
              Everything You Need on Every Site
            </h2>
            <p className="text-sm text-slate-500">
              Forget heavy spreadsheets. Simple visual tools to stay organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Room-Wise BOQ */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1D4ED8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Room-Wise BOQ</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pre-filled templates for Living Room, Bedroom &amp; Kitchen. Just enter sqft &amp; rate.
                  </p>
                </div>
                
                {/* Visual diagram representation */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Living Room (250 sqft)</span>
                    <span className="text-[#1D4ED8]">₹62,500</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Kitchen Counter</span>
                    <span className="text-[#1D4ED8]">₹45,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 4-Step Status Control */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Clear Site Statuses</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Know exact progress across all jobs with clean status tags.
                  </p>
                </div>

                {/* Visual tags diagram */}
                <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-bold">
                  <span className="bg-slate-200/80 text-slate-700 py-1.5 rounded-lg">Not Started</span>
                  <span className="bg-amber-100 text-amber-800 py-1.5 rounded-lg">In Progress</span>
                  <span className="bg-emerald-100 text-emerald-800 py-1.5 rounded-lg">Completed</span>
                  <span className="bg-rose-100 text-rose-800 py-1.5 rounded-lg">On Hold</span>
                </div>
              </div>
            </div>

            {/* Card 3: Mobile Photo DPR */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daily Site Photos</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Snap photos on your phone. Keep visual proof of electrical, plumbing &amp; paint finishes.
                  </p>
                </div>

                {/* Visual photo badge */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-[10px]">
                    <div className="font-bold text-slate-800">Site Inspection #14</div>
                    <div className="text-slate-400">Master Bath Waterproofing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Client Portal Link */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">1-Link Client Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Clients can view progress, approve drawings &amp; request changes without WhatsApp confusion.
                  </p>
                </div>

                {/* Visual shareable link badge */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Client Approval</span>
                    <span className="text-emerald-600 font-bold">Approved ✓</span>
                  </div>
                  <div className="text-[#1D4ED8] font-mono truncate">apniestate.com/portal/dr-rao</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. Interactive 60-Second Instant Quotation Estimator Tool ── */}
      <section id="estimator" className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10 space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Interactive Estimator Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#0F172A]">
              Instant Interior Cost Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Estimate any project cost right now based on Indian standard material &amp; labour rates.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
            
            {/* Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. BHK Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Configuration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['1bhk', '2bhk', '3bhk', '4bhk', 'villa'] as const).map(bhk => (
                    <button
                      key={bhk}
                      onClick={() => {
                        setCalculatorBhk(bhk);
                        setCalculatorArea(
                          bhk === '1bhk' ? 650 : 
                          bhk === '2bhk' ? 1000 : 
                          bhk === '3bhk' ? 1400 : 
                          bhk === '4bhk' ? 2200 : 3200
                        );
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        calculatorBhk === bhk
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Carpet Area Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Carpet Area
                  </label>
                  <span className="font-bold text-sm text-[#1D4ED8] tabular-nums">
                    {calculatorArea} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4500"
                  step="50"
                  value={calculatorArea}
                  onChange={(e) => setCalculatorArea(Number(e.target.value))}
                  className="w-full accent-[#1D4ED8] h-2 bg-slate-200 rounded-lg cursor-pointer mt-3"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>500 sq.ft</span>
                  <span>4500 sq.ft</span>
                </div>
              </div>

              {/* 3. Specification Tier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Finish Quality
                </label>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  {(['standard', 'premium', 'luxury'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        calculatorTier === tier
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-500 mt-2 text-center">
                  ₹{ratePerSqFt} per sq.ft approximate rate
                </div>
              </div>

            </div>

            {/* Calculated Output Box */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Estimated Interior Cost:
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1D4ED8] tabular-nums font-editorial mt-1">
                  {formatINR(estimatedTotal)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Covers Modular Woodwork, False Ceiling, Paints &amp; Electricals.
                </div>
              </div>

              <button
                onClick={onStartTrial}
                className="px-6 py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Generate Official Quote in Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. Visual 3-Step Workflow Diagram ── */}
      <section id="how-it-works" className="py-16 bg-white border-t border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 3 Steps
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
              How Apni Estate Works
            </h2>
            <p className="text-sm text-slate-500">
              No complicated training needed. Get your first project set up in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Add Project &amp; Rooms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your client name, select BHK configuration, and customize room-wise sqft measurements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Share Client Quotation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send a neat branded quotation link or PDF. Get instant client sign-off without back-and-forth.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track Site &amp; Profits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log daily site photos, record material bills, and see your exact profit margin in real time.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. Call To Action Banner ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full">
              Ready to Upgrade Your Interior Studio?
            </span>
            <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
              Spend Less Time On Site Paperwork.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
              Join leading interior designers and contractors who manage their projects with Apni Estate.
            </p>

            <div className="pt-2">
              <button
                onClick={onStartTrial}
                className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#1D4ED8] font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>Request 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── 9. Clean Minimal Footer ── */}
      <footer className="py-12 bg-[#0F172A] text-slate-400 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          
          <div className="flex items-center gap-3">
            <img 
              src="/apni_estate_logo.png" 
              alt="Apni Estate" 
              className="w-8 h-8 rounded-xl object-contain bg-white p-0.5" 
            />
            <div>
              <span className="text-white font-bold tracking-widest uppercase block">
                APNI ESTATE INTERIORS
              </span>
              <span className="text-[10px] text-slate-500">
                Simple Interior Project Software
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#estimator" className="hover:text-white transition-colors">Cost Calculator</a>
            <span className="text-slate-600">•</span>
            <span>tech@apniestate.com</span>
          </div>

          <div className="text-center md:text-right text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Apni Estate Interiors. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
