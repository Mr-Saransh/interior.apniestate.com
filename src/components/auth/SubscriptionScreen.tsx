// ==============================================================================
// APNI ESTATE INTERIORS - STEP 4: SUBSCRIPTION & 7-DAY TRIAL REQUEST SCREEN
// Exact replica of the official commercial pricing flyer with Razorpay
// ==============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  Zap, 
  Clock, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Mail, 
  Globe, 
  Lock,
  ChevronRight,
  LogOut,
  HelpCircle,
  Laptop
} from 'lucide-react';
import { RegisteredUser, userService } from '../../services/userService';
import { razorpayService, SUBSCRIPTION_PLANS, SETUP_COST_INR, PlanDetails } from '../../services/razorpayService';

interface SubscriptionScreenProps {
  currentUser: RegisteredUser;
  onRequestTrial: () => void;
  onPaymentSuccess: (plan: string, paymentId: string) => void;
  onSignOut: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  currentUser,
  onRequestTrial,
  onPaymentSuccess,
  onSignOut
}) => {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePay = (plan: PlanDetails) => {
    setProcessingPlanId(plan.id);
    setNotice(null);

    razorpayService.initiatePayment({
      plan,
      customerName: currentUser.fullName || 'Studio Owner',
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || '',
      onSuccess: (paymentId) => {
        setProcessingPlanId(null);
        userService.activateSubscription(currentUser.email, plan.id, paymentId);
        onPaymentSuccess(plan.name, paymentId);
      },
      onFailure: (err) => {
        setProcessingPlanId(null);
        setNotice('Payment could not be completed. You can also request a 7-day free trial below.');
      }
    });
  };

  const handleRequestTrialClick = () => {
    setTrialLoading(true);
    try {
      userService.requestFreeTrial(currentUser.email);
      onRequestTrial();
    } catch (err: any) {
      setNotice(err?.message || 'Failed to request trial.');
      setTrialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
      {/* ── Top Bar ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 font-display uppercase">
                APNI ESTATE
              </div>
              <div className="text-[10px] font-bold text-[#1D4ED8] tracking-widest uppercase">
                INTERIOR &amp; CONSTRUCTION SOFTWARE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="hidden sm:inline text-slate-600">
              Signed in as <strong className="text-slate-900">{currentUser.fullName || currentUser.email}</strong>
            </span>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Presentation Section ── */}
      <section className="pt-10 pb-8 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>AI-POWERED • Smarter Planning. Better Decisions. Higher Profitability.</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto uppercase leading-tight font-display">
          Manage Your Projects. <br />
          <span className="text-[#1D4ED8]">Control Costs. Maximize Profits.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          One powerful platform to manage your entire interior &amp; construction business from enquiry to execution.
        </p>

        {/* 4 Personas Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
          {[
            { label: 'INTERIOR DESIGNERS', icon: '🛋️' },
            { label: 'BUILDERS & CONTRACTORS', icon: '🏗️' },
            { label: 'PROJECT CONSULTANTS', icon: '👷' },
            { label: 'CP FIRMS & DEVELOPERS', icon: '🏢' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-2xs flex items-center justify-center gap-2 text-xs font-bold text-slate-800">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Features Ribbon */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-4">
          {[
            'Project Management',
            'BOQ & Costing',
            'Vendors & Purchase',
            'Inventory Management',
            'Expenses Tracking',
            'Payments Management',
            'Reports & Profitability'
          ].map((feat, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
              ✓ {feat}
            </span>
          ))}
        </div>
      </section>

      {notice && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-amber-800 font-bold hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      {/* ── 3 Main Commercial Plans Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* PLAN 1: STANDARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-7 flex flex-col justify-between transition-all hover:border-blue-300 hover:shadow-xl relative">
            <div>
              <div className="w-full py-1.5 px-3 rounded-xl bg-blue-50 text-[#1D4ED8] text-center font-black text-sm tracking-widest uppercase mb-4">
                STANDARD
              </div>
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-4xl font-extrabold text-slate-950 font-display">
                  ₹2,999
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Per Month</div>
                <div className="mt-3 py-1 px-3 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold inline-block">
                  Manage up to 1 PROJECT
                </div>
              </div>

              <div className="py-5 space-y-3 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Project &amp; Task Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>BOQ &amp; Basic Costing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Vendor &amp; Purchase Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Inventory Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Expenses Tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Basic Reports</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Email Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePay(SUBSCRIPTION_PLANS[0])}
              disabled={processingPlanId === 'standard'}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>{processingPlanId === 'standard' ? 'Processing...' : 'SUBSCRIBE STANDARD (₹2,999)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PLAN 2: PROFESSIONAL (MOST POPULAR) */}
          <div className="bg-white rounded-3xl border-2 border-[#1D4ED8] shadow-2xl p-6 sm:p-7 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md border border-amber-300">
              ★ MOST POPULAR
            </div>

            <div>
              <div className="w-full py-1.5 px-3 rounded-xl bg-blue-600 text-white text-center font-black text-sm tracking-widest uppercase mb-4 mt-1">
                PROFESSIONAL
              </div>
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-4xl font-extrabold text-slate-950 font-display">
                  ₹5,999
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Per Month</div>
                <div className="mt-3 py-1 px-3 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold inline-block">
                  Manage up to 3 PROJECTS
                </div>
              </div>

              <div className="py-5 space-y-3 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5 font-bold text-[#1D4ED8]">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Everything in Standard, plus:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Advanced BOQ &amp; Costing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Vendor &amp; Purchase Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Inventory &amp; Stock Control</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Payments &amp; Expense Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Detailed Reports &amp; Analytics</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Profitability Tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Priority Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePay(SUBSCRIPTION_PLANS[1])}
              disabled={processingPlanId === 'professional'}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>{processingPlanId === 'professional' ? 'Processing...' : 'SUBSCRIBE PROFESSIONAL (₹5,999)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PLAN 3: PRIME */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-7 flex flex-col justify-between transition-all hover:border-blue-300 hover:shadow-xl relative">
            <div>
              <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 text-white text-center font-black text-sm tracking-widest uppercase mb-4">
                PRIME
              </div>
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-4xl font-extrabold text-slate-950 font-display">
                  ₹8,999
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Per Month</div>
                <div className="mt-3 py-1 px-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-block">
                  Manage UNLIMITED PROJECTS
                </div>
              </div>

              <div className="py-5 space-y-3 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5 font-bold text-slate-900">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Everything in Professional, plus:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Advanced Costing &amp; Budget Control</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Multi-Site &amp; Resource Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Advanced Reports &amp; Dashboards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Profitability &amp; Margin Analysis</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Team &amp; Role Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>API Access &amp; Integrations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                  <span>Dedicated Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePay(SUBSCRIPTION_PLANS[2])}
              disabled={processingPlanId === 'prime'}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>{processingPlanId === 'prime' ? 'Processing...' : 'SUBSCRIBE PRIME (₹8,999)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── One-Time Setup Cost Banner ── */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Optional Professional Onboarding
              </div>
              <div className="text-base font-bold text-slate-900">
                ONE-TIME SETUP COST
              </div>
              <div className="text-xs text-slate-500">
                Includes onboarding, system configuration, data setup &amp; team training support.
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
              ₹11,999
            </div>
            <div className="text-[11px] font-semibold text-slate-500">One-Time Comprehensive Setup</div>
          </div>
        </div>

        {/* ── Value Proposition Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#1D4ED8] font-bold text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4" />
              <span>Real-Time Tracking</span>
            </div>
            <p className="text-xs text-slate-600">Track progress, tasks and live site updates in real time.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#1D4ED8] font-bold text-xs uppercase tracking-wide">
              <Target className="w-4 h-4" />
              <span>Accurate Cost Control</span>
            </div>
            <p className="text-xs text-slate-600">Track budgets, site expenses and profitability accurately.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#1D4ED8] font-bold text-xs uppercase tracking-wide">
              <TrendingUp className="w-4 h-4" />
              <span>Improved Efficiency</span>
            </div>
            <p className="text-xs text-slate-600">Automate BOQs, workflows and eliminate manual Excel chaos.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#1D4ED8] font-bold text-xs uppercase tracking-wide">
              <DollarSign className="w-4 h-4" />
              <span>Higher Profitability</span>
            </div>
            <p className="text-xs text-slate-600">Make data-driven procurement decisions and protect project margins.</p>
          </div>
        </div>

        {/* ── Request 7-Day Free Trial Section (After Scrolling Down) ── */}
        <div className="mt-12 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider shadow-sm">
              ★ Personalized Studio Evaluation
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Want to test Apni Estate on your active project first?
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
              Request a <strong>7-Day Free Trial</strong>. Our administrator reviews and approves requests to ensure dedicated configuration support for your interior studio. Once approved, your trial activates immediately and you will receive an email confirmation.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRequestTrialClick}
                disabled={trialLoading}
                className="py-3.5 px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span>{trialLoading ? 'Submitting Request...' : 'REQUEST 7-DAY FREE TRIAL'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-blue-200/80 pt-2">
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ Admin approved for verified studios</span>
              <span>•</span>
              <span>✓ 7 days full workspace access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer / Contact Info ── */}
      <footer className="max-w-6xl mx-auto px-4 border-t border-slate-200 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>www.apniestate.com</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>+91 12345 67890</span>
          </span>
        </div>

        <div>
          © {new Date().getFullYear()} Apni Estate Interiors. Powered by Razorpay Secure Payments.
        </div>
      </footer>
    </div>
  );
};
