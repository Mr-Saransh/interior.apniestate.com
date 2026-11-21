// ==============================================================================
// APNI ESTATE INTERIORS - COMMERCIAL PRICING & PLAN TIERS MODAL (RAZORPAY INTEGRATED)
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Check, Sparkles, Zap, Building2, Crown, Settings, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { razorpayService, SUBSCRIPTION_PLANS, SETUP_COST_INR, PlanDetails } from '../../services/razorpayService';
import { userService } from '../../services/userService';

export const PricingModal: React.FC = () => {
  const { isPricingModalOpen, setIsPricingModalOpen } = useApp();
  const { currentUser, refreshProfile } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

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
        setSuccessPlan(plan.name);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        setTimeout(() => {
          setSuccessPlan(null);
          setIsPricingModalOpen(false);
        }, 2500);
      },
      onFailure: (err) => {
        setProcessingPlanId(null);
        alert('Payment could not be completed. Please try again or contact support.');
      }
    });
  };

  return (
    <Modal
      isOpen={isPricingModalOpen}
      onClose={() => setIsPricingModalOpen(false)}
      title="Studio Plans & Pricing"
      subtitle="One powerful platform to manage your entire interior & construction business."
      maxWidth="3xl"
    >
      {successPlan ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold font-display text-slate-900">
            Subscription Activated!
          </h3>
          <p className="text-slate-600 max-w-md mx-auto text-sm">
            Thank you for subscribing to the <strong className="text-slate-900">{successPlan} Plan</strong>. Your workspace is fully unlocked.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPopular = plan.isPopular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'border-2 border-[#1D4ED8] bg-blue-50/20 shadow-xl'
                      : 'border border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
                      ★ MOST POPULAR
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        isPopular ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {plan.name}
                      </span>
                      <span className="text-[11px] font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {plan.projectsLimit}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-3xl font-extrabold font-display text-slate-900">₹{plan.priceINR.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
                    </div>

                    <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-xs text-slate-700">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
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
                        ? 'bg-[#1D4ED8] hover:bg-blue-700 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{processingPlanId === plan.id ? 'Processing...' : `Subscribe ${plan.name} (₹${plan.priceINR.toLocaleString('en-IN')})`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Setup & Implementation Package Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">ONE-TIME SETUP COST</span>
                  <span className="text-xs font-extrabold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ₹{SETUP_COST_INR.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Includes onboarding, system configuration, custom room-wise data setup &amp; training support.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 shrink-0 self-start sm:self-auto uppercase tracking-wider">
              Comprehensive Setup
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};
