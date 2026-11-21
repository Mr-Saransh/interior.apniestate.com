// ==============================================================================
// APNI ESTATE INTERIORS - STEP 3: STUDIO & USER PROFILE SETUP
// ==============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { userService, RegisteredUser } from '../../services/userService';

interface ProfileSetupScreenProps {
  currentUser: RegisteredUser;
  onComplete: (updatedUser: RegisteredUser) => void;
  onSignOut: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  currentUser,
  onComplete,
  onSignOut
}) => {
  const [studioName, setStudioName] = useState(currentUser.studioName || '');
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [businessType, setBusinessType] = useState(currentUser.businessType || 'Turnkey Interior Contractor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studioName.trim() || !fullName.trim() || !phone.trim() || !city.trim()) {
      setError('Please fill in all required fields to configure your studio workspace.');
      return;
    }

    setLoading(true);
    try {
      const updated = userService.updateUserProfile(currentUser.email, {
        studioName: studioName.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        businessType
      });
      onComplete(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-wider uppercase font-display">
                APNI ESTATE
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-[#1D4ED8] uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                SETUP WIZARD
              </span>
            </div>
            <div className="text-xs text-slate-500">Step 2 of 3 • Studio Profile Configuration</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          Sign Out ({currentUser.email})
        </button>
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Email Verified ({currentUser.email})</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Tell us about your studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Configure your business details so your quotations, BOQ estimates, and client reports carry your brand.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company / Studio Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Spaces Interior Studio"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98201 55432"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Delhi, Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Business Focus
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Turnkey Interior Contractor">Turnkey Interior Contractor & Build</option>
                  <option value="Architecture & Interior Studio">Architecture & Interior Design Studio</option>
                  <option value="Modular Kitchen & Wardrobe Specialist">Modular Kitchen & Wardrobe Specialist</option>
                  <option value="Project Management Consultant (PMC)">Project Management Consultant (PMC)</option>
                  <option value="Commercial & Office Fitout Contractor">Commercial & Office Fitout Contractor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Saving Profile...' : 'Continue to Subscription & Trial'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        © {new Date().getFullYear()} Apni Estate Interiors. Professional Turnkey Construction & Design Software.
      </footer>
    </div>
  );
};
