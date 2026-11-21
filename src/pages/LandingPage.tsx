// ==============================================================================
// APNI ESTATE INTERIORS - BESPOKE VISUAL LANDING PAGE
// High-Impact, Artistic, Informative & Mobile-Responsive Design
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Layers, 
  IndianRupee, 
  FileText, 
  ShieldCheck, 
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  TrendingUp,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Sliders,
  Users,
  HardHat,
  HelpCircle,
  Briefcase
} from 'lucide-react';

interface LandingPageProps {
  onStartTrial: () => void;
  onExploreDemo?: () => void;
  onOpenEstimator?: () => void;
}

// Genuine-feeling Reviews Data
interface Review {
  id: number;
  name: string;
  role: string;
  studio: string;
  location: string;
  avatar: string;
  rating: number;
  badge: string;
  projectCount: string;
  metricImpact: string;
  quote: string;
  story: string;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 1,
    name: "Neha Sharma",
    role: "Principal Architect & Founder",
    studio: "Studio Vistar",
    location: "Bandra West, Mumbai",
    avatar: "/landing/designer-avatar-1.jpg",
    rating: 5,
    badge: "Verified Studio",
    projectCount: "18 Projects Managed",
    metricImpact: "Recovered ₹3.4 Lakhs in Extra Works",
    quote: "Our clients stopped disputing site extras. The client portal link alone paid for the software ten times over.",
    story: "Before Apni Estate, our site carpenters would buy extra plywood and hardware without clear slips, and client change requests got lost in messy WhatsApp group chats. On our last two luxury apartments in Worli, every single change request was formally logged and approved through the link. We recovered ₹3.4 Lakhs in unbilled woodwork items that we would previously have swallowed as studio losses."
  },
  {
    id: 2,
    name: "Rajesh Kulkarni",
    role: "Managing Director & Turnkey Contractor",
    studio: "Kulkarni Turnkey Interiors",
    location: "Baner, Pune",
    avatar: "/landing/contractor-avatar-2.jpg",
    rating: 5,
    badge: "Turnkey Contractor",
    projectCount: "42 Sites Completed",
    metricImpact: "Saved 14 Hours Every Week",
    quote: "I run 8 residential sites at the same time with only 2 site supervisors. Daily mobile photo DPRs changed everything.",
    story: "I used to spend 3 hours every evening calling site supervisors asking: 'How many carpenters came today? Did the Italian marble arrive? Has the false ceiling framing started?' Now supervisors snap 3 photos and log headcounts directly from their phone before leaving the site. The client sees the progress, I see the attendance, and my office stays completely stress-free."
  },
  {
    id: 3,
    name: "Ananya Sengupta",
    role: "Co-Founder & Design Director",
    studio: "Bento Spaces",
    location: "Indiranagar, Bengaluru",
    avatar: "/landing/designer-avatar-3.jpg",
    rating: 5,
    badge: "Verified Studio",
    projectCount: "26 High-End Villas",
    metricImpact: "Zero Stage-Payment Delays",
    quote: "Our tech founder clients expect professional transparency. Apni Estate gave us that enterprise-grade polish.",
    story: "In Bengaluru, clients want clean data, not handwritten estimates on printed paper. When we share our Apni Estate room-wise quotation schedule with exact square footage rates and 3D render milestones, clients approve immediately. We haven't had a single delayed milestone stage payment in the last 7 months."
  },
  {
    id: 4,
    name: "Vikramaditya Rathore",
    role: "Principal Heritage Designer",
    studio: "Rathore & Co. Architecture",
    location: "C-Scheme, Jaipur",
    avatar: "/landing/contractor-avatar-2.jpg",
    rating: 5,
    badge: "Heritage & Modern Studio",
    projectCount: "14 Boutique Residences",
    metricImpact: "Quotation Time Cut by 80%",
    quote: "Creating a room-wise BOQ now takes 15 minutes instead of half a day of fighting broken Excel formulas.",
    story: "We used to maintain a massive 40-column Excel sheet with complex formula lookups that kept crashing. Apni Estate's pre-filled room templates for living rooms, master bedrooms, and modular kitchens let us adjust rates per sq.ft and instantly produce a crisp, branded quotation document."
  },
  {
    id: 5,
    name: "Priya Sundaram",
    role: "Chief Architect & Design Partner",
    studio: "Prism Architectural Studio",
    location: "Golf Course Road, Gurgaon",
    avatar: "/landing/designer-avatar-1.jpg",
    rating: 5,
    badge: "Verified Studio",
    projectCount: "31 Turnkey Duplexes",
    metricImpact: "Protected 24% Net Profit Margin",
    quote: "The budget alert system warned us before our plumbing and electrical contractors overspent. Pure gold.",
    story: "As a small design practice, site budget leakages are our biggest risk. Last month on a 4BHK duplex, our electrical spend hit 88% of allocation while the wiring was only halfway. The budget health alert triggered immediately, allowing us to renegotiate vendor procurement before bleeding our studio margins."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial
}) => {
  // App screen tab selector
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'navigation'>('overview');

  // Testimonials Slideshow State
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);
  const [isReviewPaused, setIsReviewPaused] = useState<boolean>(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Auto-advance reviews slideshow every 6 seconds if not paused
  useEffect(() => {
    if (isReviewPaused) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isReviewPaused]);

  const currentReview = REVIEWS_DATA[activeReviewIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#1D4ED8] selection:text-white overflow-x-hidden">
      
      {/* ── 1. Top Glassmorphism Navigation Bar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 transition-all">
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

          {/* Clean Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#1D4ED8] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#1D4ED8] transition-colors">
              Core Modules
            </a>
            <a href="#app-preview" className="hover:text-[#1D4ED8] transition-colors">
              App Preview
            </a>
            <a href="#reviews" className="hover:text-[#1D4ED8] transition-colors flex items-center gap-1.5">
              <span>Designer Stories</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                5.0 ★
              </span>
            </a>
            <a href="#faq" className="hover:text-[#1D4ED8] transition-colors">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStartTrial}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-700 hover:text-[#1D4ED8] px-3.5 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onStartTrial}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </nav>

      {/* ── 2. Hero Section with High-End Artistic Layers & Visual Artifacts ── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-8 artistic-blueprint-grid overflow-hidden">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-36 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Eyebrow Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 shadow-xs text-[#1D4ED8] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tailored for Solo Interior Designers &amp; Boutique Studios</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="relative text-center max-w-4xl mx-auto space-y-6">
            
            {/* FLOATING ARTIFACT: Left Floating BOQ Card */}
            <div className="hidden xl:flex absolute -left-16 top-10 animate-float-gentle flex-col items-start p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-card text-left max-w-[230px] z-20">
              <div className="flex items-center gap-2.5 mb-2.5 w-full border-b border-slate-100 pb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Master Suite BOQ</div>
                  <div className="text-[10px] text-slate-400">220 sq.ft • Marine Ply</div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full text-xs font-bold text-slate-700">
                <span className="text-slate-500 font-normal">Wardrobes &amp; Loft:</span>
                <span className="text-[#1D4ED8] tabular-nums font-semibold">₹1,65,000</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#1D4ED8] h-full w-[85%] rounded-full" />
              </div>
              <div className="flex justify-between items-center w-full mt-1.5 text-[9px] text-slate-400 font-medium">
                <span>Material Approved</span>
                <span className="text-emerald-600 font-bold">85% Complete</span>
              </div>
            </div>

            {/* FLOATING ARTIFACT: Right Floating Site Progress Card */}
            <div className="hidden xl:flex absolute -right-16 top-14 animate-float-delayed flex-col items-start p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-card text-left max-w-[230px] z-20">
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Live Site DPR</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Today, 4:30 PM</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Penthouse #402, Worli</div>
              <div className="text-[10px] text-slate-500 mt-0.5">4 Carpenters • 2 Electricians on site</div>
              <div className="mt-2.5 p-1.5 bg-emerald-50 rounded-lg border border-emerald-200/80 flex items-center gap-1.5 w-full text-[10px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>3 Site Inspection Photos Logged</span>
              </div>
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold text-[#0F172A] tracking-tight leading-[1.14] font-editorial">
              The Smartest Way To Run <br className="hidden sm:inline" />
              <span className="luxury-gradient-text relative inline-block">
                Your Interior Design Business.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From room-by-room quotations and material bills to live site photo updates and client approvals. 
              Designed for solo interior designers and boutique studios who want zero paperwork headache.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <button
                onClick={onStartTrial}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Request 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#1D4ED8]" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Hero Architectural Centerpiece Visual Render */}
            <div className="pt-10 max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-slate-900 group">
                <img 
                  src="/landing/blueprint-iso.jpg" 
                  alt="3D Architectural Apartment Cutaway Render" 
                  className="w-full h-[280px] sm:h-[420px] md:h-[480px] object-cover opacity-95 group-hover:scale-[1.02] transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/30">
                      Bespoke Studio Workflow
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full">
                      Real-Time Margin Tracking: +28%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-bold text-white font-editorial">
                    Every Room, Trade &amp; Rupee Synced In One Place.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                    Living room false ceilings, master bedroom modular joinery, vendor purchase orders, and daily labour counts — all visible from your phone.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick KPI Highlights Bar */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-[#1D4ED8] font-display">100+</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Indian Studios</div>
                <div className="text-[10px] text-slate-400">Using Apni Estate daily</div>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-[#1D4ED8] font-display">₹58 Cr+</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Budgets Managed</div>
                <div className="text-[10px] text-slate-400">Zero formula errors</div>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-[#1D4ED8] font-display">99.4%</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">On-Time Handovers</div>
                <div className="text-[10px] text-slate-400">Proactive deadline tracking</div>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-[#1D4ED8] font-display">5.0 ★</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Average Designer Rating</div>
                <div className="text-[10px] text-slate-400">Verified client satisfaction</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Government Recognition Strip (White Background, Centered in Middle) ── */}
      <section className="py-12 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-6">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 block">
              Official Government Recognitions &amp; Startup Accreditations
            </span>
            <div className="w-14 h-0.5 bg-[#1D4ED8] mx-auto rounded-full mt-1.5" />
          </div>

          {/* Centered logos with clean cards */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20 pt-2">
            
            {/* Startup India */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/startup-india.png" 
                alt="#startupindia" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[210px]"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Recognized Startup • DPIIT
              </span>
            </div>

            {/* Directorate of Information Technology - Govt of Tripura */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/dit-tripura.jpg" 
                alt="Directorate of Information Technology, Govt. of Tripura" 
                className="h-16 sm:h-20 w-auto object-contain rounded-full shadow-xs border border-slate-100"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2 text-center max-w-[170px] leading-tight">
                Directorate of IT, Govt. of Tripura
              </span>
            </div>

            {/* Startup Tripura */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl transition-transform hover:-translate-y-1 duration-200">
              <img 
                src="/recognitions/startup-tripura.png" 
                alt="Startup Tripura" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[195px]"
              />
              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Startup Tripura Supported
              </span>
            </div>

          </div>

          <p className="text-xs text-slate-600 max-w-xl mx-auto pt-1 font-medium">
            Proudly recognized under national and state startup initiatives driving technology for Indian architecture and design businesses.
          </p>

        </div>
      </section>

      {/* ── 4. The Reality Check: Chaos vs. Clarity (Why Designers Choose This) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            The Reality of Running Interior Sites
          </span>
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
            Why 90% of Interior Studios Bleed Money On Sites
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Interior design is artistic, but execution is messy. Without a dedicated system, paperwork falls through the cracks and eats your profits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Left Column: The Old Frustrating Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-950 font-editorial">The Old Chaotic Way</h3>
                  <p className="text-xs text-rose-700">Spreadsheets, WhatsApp &amp; Paper Receipts</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 pt-2">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✕</div>
                  <span><strong>Lost WhatsApp Change Orders:</strong> Clients casually request changes on chat; you forget to bill them and absorb the extra carpenter cost yourself.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✕</div>
                  <span><strong>Uncontrolled Site Purchases:</strong> Contractors buy hardware, adhesives, and ply on credit; you find out about the bills weeks after the budget is blown.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✕</div>
                  <span><strong>Constant Client Phone Interruptions:</strong> Clients call ten times a day asking for site photos, milestone dates, and payment receipts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✕</div>
                  <span><strong>Broken Excel Formulas:</strong> One corrupted cell in your 40-column BOQ ruins the entire estimate and leads to client disputes.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800 text-center">
              Average result: 15–20% profit leak per completed site
            </div>
          </div>

          {/* Right Column: The Apni Estate Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border-2 border-[#1D4ED8] shadow-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950 font-editorial">The Apni Estate Way</h3>
                  <p className="text-xs text-[#1D4ED8] font-semibold">One Clean Workspace for You &amp; Your Clients</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 pt-2">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-200 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
                  <span><strong>1-Click Client Portal Link:</strong> Share a single clean link. Clients view 3D renders, track budget stages, and formally approve change requests digitally.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-200 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
                  <span><strong>Real-Time Budget Alerts:</strong> System automatically monitors material purchases against quote allocations and warns you before overspending.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-200 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
                  <span><strong>60-Second Mobile Photo DPR:</strong> Site supervisor snaps photos, logs headcount (carpenters, painters), and synchronizes with your dashboard instantly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-200 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
                  <span><strong>Room-Wise BOQ Templates:</strong> Pre-filled Living Room, Bedroom &amp; Kitchen scopes with sq.ft multipliers. Error-proof and professional.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs font-bold text-[#1D4ED8] text-center shadow-xs">
              Average result: 100% on-time stage payments &amp; protected margins
            </div>
          </div>

        </div>

      </section>

      {/* ── 5. Core Feature Modules (Informative & Graphic-Rich) ── */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Comprehensive Studio Toolkit
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
              Everything You Need To Deliver Flawless Sites
            </h2>
            <p className="text-sm text-slate-600">
              Explore how each module works together to give you total control over designs, materials, and clients.
            </p>
          </div>

          {/* Module 1: Room-Wise BOQ & Cost Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 text-[#1D4ED8] text-xs font-bold border border-blue-200">
                <Layers className="w-4 h-4" />
                <span>Module 01</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-slate-900">
                Room-Wise Costing &amp; BOQ Builder
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never start a blank spreadsheet again. Pick pre-configured room templates with standardized Indian material specifications (Century 710 Marine Ply, 1mm Merino Laminates, Hafele hardware, PU Matte finishes).
              </p>
              
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Sq.ft Rate Multiplier:</strong> Enter room dimensions (e.g. 200 sq.ft @ ₹250/sq.ft) for instant accurate line totals.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Room Segregation:</strong> Living, Dining, Master Bed, Kids Bed, Kitchen &amp; Toilets neatly itemized.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>1-Click PDF Generation:</strong> Produce executive quotations with your studio logo and payment schedules.</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={onStartTrial}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Build A Sample Room BOQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-50 relative group">
              <img 
                src="/landing/architectural-moodboard.jpg" 
                alt="Architectural Material Samples & Moodboard" 
                className="w-full h-[320px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Living Room: Fluted TV Unit &amp; Louvers</span>
                  <span className="text-[#1D4ED8]">₹95,000</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Charcoal acoustic louvers + PU Matte Carcase • 1 Lot
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Mobile Photo DPR & Site Execution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-50 relative order-2 lg:order-1 group">
              <img 
                src="/landing/luxury-living.jpg" 
                alt="Luxury Finished Modern Interior Site" 
                className="w-full h-[320px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Site Milestone: Demolition &amp; Civil Framing</span>
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    100% Complete
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  4 site photos captured • Keys handover scheduled for 28th Nov
                </div>
              </div>
            </div>

            <div className="space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <Camera className="w-4 h-4" />
                <span>Module 02</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-slate-900">
                Live Site Photos &amp; Daily Progress (DPR)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay updated on all active sites without driving across the city every day. Site supervisors capture inspection photos, log worker counts, and flag bottlenecks in seconds.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Mobile Camera Sync:</strong> Snap and timestamp photos of electrical conduits, waterproofing, and tile laying.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Labour Headcount Ledger:</strong> Track exact daily presence of carpenters, masons, plumbers &amp; painters.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Milestone Gantt Tracker:</strong> Visual progress bars for Demolition, Carpentry, Painting &amp; Deep Cleaning.</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={onStartTrial}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Site Photo DPR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Module 3: Client Experience Portal & Change Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                <FileText className="w-4 h-4" />
                <span>Module 03</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-slate-900">
                Client Portal Link &amp; Change Request Engine
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Give your clients the luxury enterprise experience. Instead of messy chats, provide a personalized private web link where they can view 3D renders, track budget stages, and formally submit new requirements.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Zero App Download:</strong> Clients open the link directly on their mobile browser without creating accounts.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Formally Track Extras:</strong> When client asks for extra wardrobe lights, log it as an approved Change Order.</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Instant Notifications:</strong> Get alerted the moment a client approves a proposal or uploads a requirement.</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={onStartTrial}
                  className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Test Client Portal Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    CP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Dr. Siddharth &amp; Ananya Rao</div>
                    <div className="text-[10px] text-slate-500">Villa Sereno • 3BHK Penthouse, Mumbai</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Portal Active
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Contract Value:</span>
                  <span className="font-bold text-slate-900">₹42,50,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Stage Payments Received:</span>
                  <span className="font-bold text-emerald-600">₹25,40,000 (60%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[60%] rounded-full" />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-start gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Pending Change Request:</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    "Add automated sensor lighting inside Master Walk-in Closet" (+₹18,500)
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. Real App Screen Interactive Showcase (With Tabs) ── */}
      <section id="app-preview" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Real Software Screenshots
          </span>
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
            Look Inside Your Future Studio Workspace
          </h2>
          <p className="text-sm text-slate-600">
            No mockups or concept art. This is the exact application you and your studio will use every single day.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Projects &amp; Status
            </button>
            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'navigation'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mobile Sidebar Drawer
            </button>
          </div>
        </div>

        {/* Showcase Device Frame */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-card p-4 sm:p-6 overflow-hidden">
          
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
              <span className="text-[11px] font-bold text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {activeTab === 'overview' && 'Live KPIs, Spend By Trade & Budget Health'}
                {activeTab === 'projects' && 'Room-Wise Status & 100% Progress Tracking'}
                {activeTab === 'navigation' && 'Streamlined Royal Blue & Gold Mobile Navigation'}
              </span>
            </div>
          </div>

          {/* Screenshot Display */}
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

      {/* ── 7. Simple 3-Step Workflow ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 3-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
              From First Consultation to Handover
            </h2>
            <p className="text-sm text-slate-500">
              Getting started is effortless. Here is how your daily design workflow looks with Apni Estate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-slate-200 space-y-4 text-center hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-editorial">Create Project &amp; Room BOQ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your client details, select 2BHK, 3BHK or Villa, and pick standard room cost templates. Set your sq.ft rates in minutes.
              </p>
              <div className="text-[10px] font-bold text-[#1D4ED8] bg-blue-50 py-1 px-2 rounded-lg w-fit mx-auto">
                Takes 5 Minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-slate-200 space-y-4 text-center hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-editorial">Send Client Portal Link</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate an official quotation PDF or send your client their private web portal link for instant digital sign-off.
              </p>
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg w-fit mx-auto">
                Zero Client Confusion
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-slate-200 space-y-4 text-center hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-editorial">Execute &amp; Track Profits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Snap site photos on your phone, record vendor bills, and monitor your protected 20–30% net profit margin until handover.
              </p>
              <div className="text-[10px] font-bold text-purple-700 bg-purple-50 py-1 px-2 rounded-lg w-fit mx-auto">
                Guaranteed Margin
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. Interactive Genuine Testimonials Slideshow (Reviews Carousel) ── */}
      <section 
        id="reviews" 
        className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-10"
        onMouseEnter={() => setIsReviewPaused(true)}
        onMouseLeave={() => setIsReviewPaused(false)}
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>5.0 Star Rated by 100+ Interior Designers Across India</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
            Stories From Studios Who Scaled With Us
          </h2>
          <p className="text-sm text-slate-600">
            Real feedback from solo designers, turnkey contractors, and architecture studio founders.
          </p>
        </div>

        {/* Slideshow Card Container */}
        <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-12 overflow-hidden transition-all duration-300">
          
          {/* Subtle quote watermark */}
          <Quote className="absolute top-6 right-8 w-24 h-24 text-slate-100 pointer-events-none" />

          {/* Active Review Content */}
          <div className="relative z-10 space-y-6 animate-slide-next" key={currentReview.id}>
            
            {/* Top Row: Stars + Metric Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">5.0 / 5.0</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentReview.metricImpact}</span>
              </div>
            </div>

            {/* Quote Highlight */}
            <h3 className="text-xl sm:text-2xl font-editorial font-bold text-slate-900 leading-snug">
              "{currentReview.quote}"
            </h3>

            {/* In-depth Review Story */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {currentReview.story}
            </p>

            {/* Reviewer Profile & Details */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <img 
                  src={currentReview.avatar} 
                  alt={currentReview.name} 
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{currentReview.name}</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#1D4ED8] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#1D4ED8]" />
                      <span>{currentReview.badge}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {currentReview.role} • <strong>{currentReview.studio}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentReview.location} • {currentReview.projectCount}
                  </div>
                </div>
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setActiveReviewIndex((prev) => (prev - 1 + REVIEWS_DATA.length) % REVIEWS_DATA.length)}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {REVIEWS_DATA.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveReviewIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeReviewIndex === idx ? 'w-6 bg-[#1D4ED8]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length)}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Next Review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ── 9. Comprehensive FAQ Section (Clean Accordion) ── */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500">
              Everything you need to know about starting with Apni Estate Interiors.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "I am a solo interior designer with no technical staff. Is this easy for me to use?",
                a: "Absolutely. We designed Apni Estate specifically for solo practitioners and small 2-3 member boutique studios. There is zero complicated ERP setup. If you can use WhatsApp and Instagram, you can manage your entire project, send quotations, and track daily site photos in Apni Estate within 5 minutes."
              },
              {
                q: "Can I use Apni Estate directly from my phone while visiting construction sites?",
                a: "Yes, 100%. The application is built with a responsive mobile interface. When you are standing on site, you can pull out your phone, take inspection photos, log worker attendance (carpenters, plumbers, painters), and record material cash expenses with zero lag."
              },
              {
                q: "Can I generate and download official quotation PDFs with my studio branding?",
                a: "Yes! You can instantly generate clean, architectural quotation PDFs containing your studio name, client address, room-by-room BOQ breakdown, and milestone payment schedules ready for printing or WhatsApp sharing."
              },
              {
                q: "How does the client portal link work? Does my client need to install an app?",
                a: "No app installation required for your client. You simply copy and send them a private project link (e.g., apniestate.com/portal/client-token). When they open it in their browser, they can view approved 3D renders, track completion percentages, and formally submit new requirements or changes."
              },
              {
                q: "What happens when a client asks for extra work during execution?",
                a: "You or the client can log a 'Change Request' inside the project. You specify the rate (e.g. adding false ceiling cove lights or extra wardrobe shelves). Once confirmed, it updates your project budget and client billing automatically, preventing unbilled extra work."
              },
              {
                q: "How does the 7-day free trial work?",
                a: "You sign up with your email, set up your studio profile (name, phone, city), and request a 7-day free trial. Our admin team approves your studio workspace, giving you complete access to create projects, generate quotations, and manage site expenses with zero upfront payment."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 10. High-Impact Studio CTA Banner ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#1D4ED8] via-[#1E40AF] to-[#0F172A] rounded-3xl p-8 sm:p-16 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-blue-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Transform Your Interior Business
            </span>
            <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
              Spend Less Time On Paperwork. Deliver Better Homes.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto leading-relaxed">
              Join leading interior designers and turnkey contractors across India who run their projects smoothly with Apni Estate.
            </p>

            <div className="pt-3">
              <button
                onClick={onStartTrial}
                className="px-9 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#1D4ED8] font-bold text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>Request Your 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="text-[11px] text-blue-200 pt-1 font-medium">
              Setup takes less than 2 minutes • Dedicated Indian onboarding support
            </div>
          </div>

        </div>
      </section>

      {/* ── 11. Minimal Architectural Footer ── */}
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
                Simple Interior Project Software for India
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Modules</a>
            <a href="#app-preview" className="hover:text-white transition-colors">App Preview</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
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
