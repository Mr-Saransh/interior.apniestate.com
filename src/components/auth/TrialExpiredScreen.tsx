// ==============================================================================
// APNI ESTATE INTERIORS - TRIAL EXPIRED SCREEN (RAZORPAY INTEGRATED)
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Check, 
  Building2, 
  LogOut, 
  Mail, 
  PhoneCall, 
  Sparkles,
  ArrowRight,
  Settings
} from 'lucide-react';
import { razorpayService, SUBSCRIPTION_PLANS, SETUP_COST_INR, PlanDetails } from '../../services/razorpayService';
import { userService } from '../../services/userService';

export const TrialExpiredScreen: React.FC = () => {
  const { currentUser, organization, signOut, refreshProfile } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const handlePay = (plan: PlanDetails) => {
    setProcessingPlanId(plan.id);

    razorpayService.initiatePayment({
      plan,
      customerName: currentUser?.fullName || 'Studio Owner',
      customerEmail: currentUser?.email || 'studio@apniestate.com',
      customerPhone: currentUser?.phone || '',
      onSuccess: (paymentId) => {
        setProcessingPlanId(null);
        if (currentUser?.email) {
          userService.activateSubscription(currentUser.email, plan.id, paymentId);
        }
        refreshProfile();
      },
      onFailure: (err) => {
        setProcessingPlanId(null);
        alert('Payment could not be completed. Please try again or contact support.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative font-sans">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg text-white">APNI ESTATE</div>
            <div className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/50 w-fit">
              INTERIORS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{currentUser?.fullName || 'Studio Owner'}</div>
            <div className="text-[11px] text-slate-400">{currentUser?.studioName || organization?.name || 'Studio'}</div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Center Notice & Upgrade Cards */}
      <main className="max-w-6xl mx-auto w-full my-8 relative z-10 space-y-8 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Your 7-day trial has ended
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your projects, BOQs, client proposals, and expense records for <strong className="text-white">{currentUser?.studioName || 'your studio'}</strong> are safely preserved in our database. Choose a plan below to immediately resume full studio operations.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-slate-900/90 backdrop-blur-xl ${
                  isPopular
                    ? 'border-2 border-[#1D4ED8] shadow-2xl shadow-blue-500/10'
                    : 'border border-slate-800'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black tracking-widest uppercase shadow-md">
                    ★ MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{plan.name}</span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800/60">
                      {plan.projectsLimit}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-extrabold font-display text-white">₹{plan.priceINR.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                  </div>

                  <div className="space-y-2.5 mb-6 border-t border-slate-800 pt-4 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePay(plan)}
                  disabled={processingPlanId === plan.id}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-[#1D4ED8] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <span>{processingPlanId === plan.id ? 'Processing...' : `Select ${plan.name} (₹${plan.priceINR.toLocaleString('en-IN')})`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Setup Cost Strip */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400 shrink-0" />
            <span>One-Time Setup Cost (₹{SETUP_COST_INR.toLocaleString('en-IN')}) for assisted onboarding &amp; data configuration.</span>
          </div>
          <a href="mailto:tech@apniestate.com" className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Billing</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 relative z-10">
        © {new Date().getFullYear()} Apni Estate Interiors. Your data is encrypted and permanently preserved.
      </footer>
    </div>
  );
};
