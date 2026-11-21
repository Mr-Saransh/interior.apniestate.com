// ==============================================================================
// APNI ESTATE INTERIORS - SECURE ADMIN PORTAL (/login-admin)
// Passcode Protected (1221) User Management, Trial Approvals & Email Notifications
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  LogOut, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  Check,
  X,
  CreditCard,
  Crown
} from 'lucide-react';
import { userService, RegisteredUser } from '../services/userService';

const ADMIN_PASSCODE = '1221';
const SESSION_AUTH_KEY = 'apni_estate_admin_auth_unlocked';

export const AdminPortalPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // User directory state
  const [users, setUsers] = useState<RegisteredUser[]>(() => userService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'active_trial' | 'active' | 'rejected'>('all');
  
  // Action feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Refresh users list from service
  const refreshUsers = () => {
    setUsers(userService.getUsers());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(userService.getUsers());
    };
    window.addEventListener('apni_estate_users_updated', handleUpdate);
    return () => window.removeEventListener('apni_estate_users_updated', handleUpdate);
  }, []);

  // Passcode verification
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      } catch (e) {}
    } else {
      setPasscodeError('Invalid administrative passcode. Please enter 1221.');
    }
  };

  const handleAdminSignOut = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    } catch (e) {}
    setPasscode('');
  };

  // Approve 7-day free trial
  const handleApproveTrial = async (user: RegisteredUser) => {
    setActionLoadingId(user.id);
    setActionSuccess(null);

    try {
      const updated = await userService.approveFreeTrial(user.email);
      refreshUsers();
      setActionSuccess(`Successfully approved 7-day trial for "${updated.fullName || updated.email}". Confirmation email has been sent to ${updated.email}.`);
    } catch (err: any) {
      alert(`Approval error: ${err.message || 'Failed to approve'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick action: activate full paid subscription
  const handleActivatePaid = (user: RegisteredUser, plan: 'standard' | 'professional' | 'prime' = 'professional') => {
    userService.activateSubscription(user.email, plan);
    refreshUsers();
    setActionSuccess(`Activated ${plan.toUpperCase()} paid subscription for ${user.fullName || user.email}.`);
  };

  // Quick action: reject trial
  const handleReject = (user: RegisteredUser) => {
    if (confirm(`Reject trial request for ${user.fullName || user.email}?`)) {
      userService.rejectTrial(user.email, 'Rejected by Administrator');
      refreshUsers();
    }
  };

  // Quick action: delete record
  const handleDelete = (user: RegisteredUser) => {
    if (confirm(`Permanently delete record for ${user.email}? This cannot be undone.`)) {
      userService.deleteUser(user.email);
      refreshUsers();
    }
  };

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Tab filter
      if (filterTab === 'pending' && user.status !== 'pending_approval') return false;
      if (filterTab === 'active_trial' && user.status !== 'active_trial') return false;
      if (filterTab === 'active' && user.status !== 'active') return false;
      if (filterTab === 'rejected' && user.status !== 'rejected') return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.email.toLowerCase().includes(q) ||
        (user.fullName && user.fullName.toLowerCase().includes(q)) ||
        (user.studioName && user.studioName.toLowerCase().includes(q)) ||
        (user.city && user.city.toLowerCase().includes(q)) ||
        (user.phone && user.phone.includes(q))
      );
    });
  }, [users, filterTab, searchQuery]);

  // Statistics
  const pendingCount = users.filter(u => u.status === 'pending_approval').length;
  const trialCount = users.filter(u => u.status === 'active_trial').length;
  const paidCount = users.filter(u => u.status === 'active').length;

  // ──────────────────────────────────────────────────────────
  // SCREEN 1: PASSCODE GATE (1221)
  // ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
        <header className="max-w-md mx-auto w-full flex items-center justify-between pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase font-display text-white">
              APNI ESTATE ADMIN
            </span>
          </div>

          <a 
            href="/" 
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </a>
        </header>

        <main className="max-w-sm mx-auto w-full my-auto py-8">
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[#3B82F6] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                Admin Command Center
              </h1>
              <p className="text-xs text-slate-400">
                Enter the master administrator passcode to review trial requests and manage users.
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Master Passcode
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter 4-digit passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-[#0F172A] text-white text-center tracking-[0.4em] font-mono font-black text-xl py-3 rounded-xl border border-slate-700 focus:border-[#3B82F6] focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Admin Portal</span>
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-500">
              Passcode protected portal • Apni Estate Master System
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-600 pb-4">
          © {new Date().getFullYear()} Apni Estate Interiors. Administrative Security Gateway.
        </footer>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // SCREEN 2: ADMIN COMMAND CENTER (UNLOCKED)
  // ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans pb-16">
      {/* ── Top Navbar ── */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase font-display">
                  APNI ESTATE
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 px-2 py-0.5 rounded">
                  ADMIN PORTAL
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Master Approval &amp; Subscription Console</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <a
              href="/"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Workspace</span>
            </a>

            <button
              onClick={handleAdminSignOut}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Banner Alert for Actions */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button 
              onClick={() => setActionSuccess(null)}
              className="text-emerald-800 font-bold hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Users</span>
              <UserCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-display">
              {users.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Registered studios &amp; contractors</div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-300 p-5 shadow-xs">
            <div className="flex items-center justify-between text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-950 font-display">
              {pendingCount}
            </div>
            <div className="text-[11px] text-amber-800 font-semibold mt-1">
              {pendingCount > 0 ? 'Action required: Review & activate' : 'All requests processed'}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#1D4ED8] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Active 7-Day Trials</span>
              <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1D4ED8] font-display">
              {trialCount}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">Currently evaluating workspace</div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-300 p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Paid Subscribers</span>
              <Crown className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-950 font-display">
              {paidCount}
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-1">Standard, Pro &amp; Prime clients</div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterTab === 'pending' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('active_trial')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                filterTab === 'active_trial' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active 7-Day Trials ({trialCount})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                filterTab === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Plans ({paidCount})
            </button>
          </div>

          {/* Search Bar + Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, studio, email, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={refreshUsers}
              title="Refresh User Directory"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── User Directory Table ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Studio &amp; Owner</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Location &amp; Type</th>
                  <th className="py-3.5 px-4">Status &amp; Timeline</th>
                  <th className="py-3.5 px-4 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-600">No users found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search query or status filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isPending = u.status === 'pending_approval';
                    const isTrialActive = u.status === 'active_trial';
                    const isPaid = u.status === 'active';
                    const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');

                    // Remaining days calculation for active trial
                    let trialDaysRemaining = 0;
                    if (isTrialActive && u.trialEndsAt) {
                      const diff = new Date(u.trialEndsAt).getTime() - Date.now();
                      trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                    }

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* 1. Studio & Owner */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 text-sm">
                            {u.studioName || 'Studio Name Pending'}
                          </div>
                          <div className="font-medium text-slate-600 text-xs flex items-center gap-1.5 mt-0.5">
                            <span>{u.fullName || 'Studio Owner'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            ID: {u.id}
                          </div>
                        </td>

                        {/* 2. Contact Info */}
                        <td className="py-3.5 px-4 align-top space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a 
                              href={`mailto:${u.email}`} 
                              className="font-semibold text-slate-800 hover:text-[#1D4ED8] hover:underline"
                            >
                              {u.email}
                            </a>
                            {u.emailVerified && (
                              <span title="Email OTP Verified" className="text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                          {u.phone && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{u.phone}</span>
                              </span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${u.fullName || ''}, this is Apni Estate Interiors admin regarding your studio onboarding.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 3. Location & Business Focus */}
                        <td className="py-3.5 px-4 align-top space-y-1">
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.city || 'India'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.businessType || 'Turnkey Interior Contractor'}
                          </div>
                        </td>

                        {/* 4. Status & Timeline */}
                        <td className="py-3.5 px-4 align-top space-y-1.5">
                          {isPending && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pending 7-Day Trial Approval</span>
                            </div>
                          )}

                          {isTrialActive && (
                            <div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-[#1D4ED8] border border-blue-200 font-bold text-[11px]">
                                <Sparkles className="w-3 h-3 text-[#1D4ED8]" />
                                <span>Active 7-Day Trial ({trialDaysRemaining}d remaining)</span>
                              </div>
                              {u.trialEndsAt && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                  Expires: {new Date(u.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                              )}
                            </div>
                          )}

                          {isPaid && (
                            <div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
                                <Crown className="w-3 h-3 text-emerald-700" />
                                <span>Paid ({(u.plan || 'pro').toUpperCase()})</span>
                              </div>
                              {u.razorpayPaymentId && (
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {u.razorpayPaymentId}
                                </div>
                              )}
                            </div>
                          )}

                          {u.status === 'rejected' && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold">
                              <X className="w-3 h-3" />
                              <span>Rejected</span>
                            </div>
                          )}

                          {u.status === 'pending_profile' && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
                              <span>Profile Incomplete</span>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400">
                            Registered: {new Date(u.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* 5. Approval & Management Actions */}
                        <td className="py-3.5 px-4 align-top text-right space-y-2">
                          {isPending && (
                            <button
                              onClick={() => handleApproveTrial(u)}
                              disabled={actionLoadingId === u.id}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                            >
                              <Check className="w-4 h-4" />
                              <span>{actionLoadingId === u.id ? 'Approving...' : 'Approve 7-Day Trial'}</span>
                            </button>
                          )}

                          {isTrialActive && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveTrial(u)}
                                title="Renew / Extend 7-Day Trial"
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1D4ED8] hover:bg-blue-100 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Extend 7 Days
                              </button>
                              <button
                                onClick={() => handleActivatePaid(u, 'professional')}
                                title="Upgrade to Professional"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            {isPending && (
                              <button
                                onClick={() => handleReject(u)}
                                className="text-[11px] text-rose-600 hover:underline cursor-pointer font-semibold"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u)}
                              title="Delete Record"
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
