// ==============================================================================
// APNI ESTATE INTERIORS - STEP 5: TRIAL PENDING APPROVAL SCREEN
// Displayed when a user requests a 7-day free trial awaiting admin approval
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  LogOut, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { RegisteredUser, userService } from '../../services/userService';

interface TrialPendingScreenProps {
  currentUser: RegisteredUser;
  onCheckStatus: () => void;
  onOpenSubscription: () => void;
  onSignOut: () => void;
}

export const TrialPendingScreen: React.FC<TrialPendingScreenProps> = ({
  currentUser,
  onCheckStatus,
  onOpenSubscription,
  onSignOut
}) => {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Auto poll every 15 seconds to check if admin approved the trial
  useEffect(() => {
    const timer = setInterval(() => {
      onCheckStatus();
      setLastChecked(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, [onCheckStatus]);

  const handleManualCheck = () => {
    setChecking(true);
    setTimeout(() => {
      onCheckStatus();
      setLastChecked(new Date());
      setChecking(false);
    }, 600);
  };

  const handleCopySupport = () => {
    navigator.clipboard.writeText('tech@apniestate.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex flex-col justify-between font-sans">
      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <button
              onClick={onSignOut}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Review Container ── */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 my-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Status Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 sm:p-8 text-white relative">
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Request Under Review</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                  7-Day Free Trial Request Submitted
                </h1>
                <p className="text-xs sm:text-sm text-amber-50 max-w-xl leading-relaxed">
                  Your request has been forwarded to our administrator. We review each application to ensure tailored room templates and BOQ database configuration for your studio.
                </p>
              </div>

              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 border border-white/25 items-center justify-center shrink-0">
                <ShieldCheck className="w-9 h-9 text-white" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* User Submission Summary Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Application Summary</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Email Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Studio / Business Name</span>
                  <span className="font-bold text-slate-900 text-sm">{currentUser.studioName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registered Owner</span>
                  <span className="font-bold text-slate-900 text-sm">{currentUser.fullName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registered Email</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone / WhatsApp</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-semibold text-slate-800">{currentUser.city || 'India'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Business Focus</span>
                  <span className="font-semibold text-slate-800">{currentUser.businessType || 'Turnkey Interior Contractor'}</span>
                </div>
              </div>
            </div>

            {/* What happens next steps */}
            <div className="space-y-3 text-xs text-slate-600">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">What happens next?</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span><strong>Administrator Verification:</strong> Our team checks your studio details and activates your 7-day trial.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span><strong>Email Confirmation:</strong> You will receive an official approval email with your direct workspace launch link.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span><strong>Instant Workspace Access:</strong> Once approved, refreshing this screen immediately unlocks your full interior ERP &amp; CRM workspace.</span>
                </div>
              </div>
            </div>

            {/* Live Check Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checking}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                Auto-refreshing every 15 seconds • Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            </div>

            {/* Skip Waiting & Subscribe Box */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Want to skip waiting for approval?</div>
                  <div className="text-[11px] text-slate-600">Activate instantly with a Standard, Professional or Prime subscription via Razorpay.</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSubscription}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <span>View Plans &amp; Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Need Urgent Activation? */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Need urgent trial activation for an upcoming client pitch? </span>
              <button 
                onClick={handleCopySupport}
                className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                <span>{copiedEmail ? 'Copied tech@apniestate.com!' : 'Email tech@apniestate.com'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Apni Estate Interiors © {new Date().getFullYear()} • Secure Turnkey Construction &amp; Design Software
      </footer>
    </div>
  );
};
