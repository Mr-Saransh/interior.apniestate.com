// ==============================================================================
// APNI ESTATE INTERIORS - BESPOKE ARCHITECTURAL AUTH SCREEN (EMAIL OTP + PASS)
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { otpService } from '../../services/otpService';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Building2, 
  Sparkles,
  KeyRound,
  RotateCcw
} from 'lucide-react';

type AuthTab = 'signin' | 'signup' | 'demo';
type SignInMethod = 'otp' | 'password';
type SignUpMethod = 'otp' | 'password';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithOtp, signUpWithOtp, setIsDemoMode, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('otp');
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>('otp');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle Tab Switch
  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpSent(false);
    setOtpCode(['', '', '', '', '', '']);
  };

  // Send OTP
  const handleSendOtp = async (type: 'signin' | 'signup') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (type === 'signup') {
      if (!fullName.trim() || !studioName.trim()) {
        setErrorMessage('Please fill in your name and studio name.');
        return;
      }
    }

    // Demo email intercept
    if (targetEmail.toLowerCase() === 'demo@apniestate.com') {
      setIsDemoMode(true);
      return;
    }

    setOtpLoading(true);
    try {
      const res = await otpService.sendOtp(targetEmail, type);
      if (res.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setSuccessMessage(res.message);
        if (res.previewCode) {
          setPreviewOtp(res.previewCode);
        }
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(res.error || 'Unable to send code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP digit entry with auto-advance
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    if (digit && index === 5 && newCode.every(d => d.trim() !== '')) {
      const fullCode = newCode.join('');
      submitOtpVerification(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
  const submitOtpVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setErrorMessage(null);
    setOtpLoading(true);
    try {
      const verifyRes = await otpService.verifyOtp(email, code);
      if (!verifyRes.success) {
        setErrorMessage(verifyRes.error || 'Invalid verification code.');
        setOtpLoading(false);
        return;
      }

      // Success! Sign in or Sign up
      if (activeTab === 'signup') {
        await signUpWithOtp({
          email: email.trim(),
          fullName: fullName.trim(),
          studioName: studioName.trim(),
          phone: phone.trim()
        });
      } else {
        await signInWithOtp(email.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Password Sign In Handler
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (cleanEmail.toLowerCase() === 'demo@apniestate.com' && password === 'demo123') {
      setIsDemoMode(true);
      return;
    }

    try {
      await signIn(cleanEmail, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    }
  };

  // Password Sign Up Handler
  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !studioName.trim() || !email.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      await signUp({
        fullName: fullName.trim(),
        studioName: studioName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: signUpPassword,
        plan: 'studio'
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex flex-col justify-between selection:bg-[#1D4ED8] selection:text-white">
      {/* ── Main Responsive Container ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full my-auto">
          
          {/* ── Left Column: Editorial Architectural Identity (Desktop) ── */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 space-y-8 text-left py-4">
            
            {/* Logo + Subtitle */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shrink-0 p-2 shadow-xs">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 15 L 180 15 L 180 135 L 135 75 L 95 125 L 95 90 L 60 90 L 60 145 L 20 200 Z" fill="#FFFFFF"/>
                  <rect x="123" y="115" width="10" height="10" rx="0.5" fill="#FFFFFF"/>
                  <rect x="137" y="115" width="10" height="10" rx="0.5" fill="#FFFFFF"/>
                  <rect x="123" y="129" width="10" height="10" rx="0.5" fill="#FFFFFF"/>
                  <rect x="137" y="129" width="10" height="10" rx="0.5" fill="#FFFFFF"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold text-base text-[#111827] tracking-tight block">
                  APNI ESTATE INTERIORS
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#1D4ED8] uppercase">
                  STUDIO OPERATING SYSTEM
                </span>
              </div>
            </div>

            {/* Editorial Value Headline */}
            <div className="space-y-4 max-w-lg">
              <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-[#111827] tracking-tight leading-[1.12]">
                Every interior project, <br />
                <span className="text-[#1D4ED8] italic">accurately estimated</span> and delivered.
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Connect your room-wise BOQs, client proposals, vendor purchasing, and daily site progress in one clean, bespoke workspace.
              </p>
            </div>

            {/* 3 Domain Pillars */}
            <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-subtle">
                <div className="text-xs font-semibold text-[#111827] mb-1">Room-Wise BOQs</div>
                <div className="text-[11px] text-slate-500">Itemized rates, materials & vendor margins.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-subtle">
                <div className="text-xs font-semibold text-[#111827] mb-1">Dual Mode Workspace</div>
                <div className="text-[11px] text-slate-500">Switch between Studio CRM & Interior ERP.</div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Built for interior designers, site supervisors, and studio owners.</span>
            </div>
          </div>

          {/* ── Right Column: Crisp White Card ── */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center lg:justify-end w-full">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex flex-col items-center text-center mb-5 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white shrink-0 p-2 shadow-xs mb-1">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 15 L 180 15 L 180 135 L 135 75 L 95 125 L 95 90 L 60 90 L 60 145 L 20 200 Z" fill="#FFFFFF"/>
                </svg>
              </div>
              <div className="font-bold text-base text-[#111827]">APNI ESTATE INTERIORS</div>
              <div className="text-[10px] font-semibold text-slate-500">Studio Operating System</div>
            </div>

            <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-7 shadow-card">
              
              {/* Segmented Tab Bar */}
              <div className="flex items-center p-1 bg-gray-100 rounded-xl mb-5 text-xs font-semibold border border-gray-200">
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className={`flex-1 py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white text-[#1D4ED8] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#1D4ED8] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Free Trial
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('demo')}
                  className={`flex-1 py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'demo'
                      ? 'bg-white text-[#1D4ED8] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Demo
                </button>
              </div>

              {/* Status Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Preview Code Alert if offline */}
              {previewOtp && (
                <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs flex items-center justify-between">
                  <span className="font-semibold">Verification Code:</span>
                  <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-blue-200">{previewOtp}</span>
                </div>
              )}

              {/* ────────────────────────────────────────────────
                  TAB 1: SIGN IN (OTP or Password)
                 ──────────────────────────────────────────────── */}
              {activeTab === 'signin' && (
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-editorial font-bold text-[#111827]">
                      Welcome to your studio
                    </h2>
                    <p className="text-xs text-slate-500">
                      {signInMethod === 'otp' ? 'Sign in with a 6-digit email verification code' : 'Sign in using your password'}
                    </p>
                  </div>

                  {/* Mode Toggle: OTP vs Password */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInMethod(prev => prev === 'otp' ? 'password' : 'otp');
                        setOtpSent(false);
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {signInMethod === 'otp' ? (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Use password instead</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Use Email OTP instead</span>
                        </>
                      )}
                    </button>
                  </div>

                  {signInMethod === 'otp' ? (
                    /* OTP FLOW */
                    <div className="space-y-4 text-left">
                      {!otpSent ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Work Email
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="email"
                                required
                                placeholder="you@studio.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 hover:bg-slate-100/60 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none transition-all"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={otpLoading}
                            onClick={() => handleSendOtp('signin')}
                            className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {otpLoading ? (
                              <span>Sending Code...</span>
                            ) : (
                              <>
                                <span>Send Verification Code</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* 6-DIGIT CODE INPUT */
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-xs text-slate-600">Enter code sent to </span>
                            <span className="text-xs font-semibold text-[#111827]">{email}</span>
                          </div>

                          <div className="flex justify-between gap-1.5 sm:gap-2">
                            {otpCode.map((digit, i) => (
                              <input
                                key={i}
                                ref={(el) => { otpInputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#1D4ED8] focus:bg-white rounded-xl outline-none"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={otpLoading}
                            onClick={() => submitOtpVerification()}
                            className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {otpLoading ? 'Verifying...' : 'Verify & Enter Workspace'}
                          </button>

                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              ← Change email
                            </button>
                            <button
                              type="button"
                              disabled={otpTimer > 0 || otpLoading}
                              onClick={() => handleSendOtp('signin')}
                              className={`flex items-center gap-1 font-semibold ${
                                otpTimer > 0 ? 'text-slate-400' : 'text-[#1D4ED8] hover:underline cursor-pointer'
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend code'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* PASSWORD FLOW */
                    <form onSubmit={handlePasswordSignIn} className="space-y-3.5 text-left">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="you@studio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────
                  TAB 2: SIGN UP (15-Day Free Trial)
                 ──────────────────────────────────────────────── */}
              {activeTab === 'signup' && (
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-editorial font-bold text-[#111827]">
                      Start 15-Day Studio Trial
                    </h2>
                    <p className="text-xs text-slate-500">
                      Create your private studio workspace in under a minute.
                    </p>
                  </div>

                  {!otpSent ? (
                    <div className="space-y-3 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Your Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              placeholder="Aarav Mehta"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Studio Name *
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              placeholder="Mehta Design Studio"
                              value={studioName}
                              onChange={(e) => setStudioName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Work Email *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              placeholder="aarav@studio.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Phone (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              placeholder="+91 98201 00000"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={() => handleSendOtp('signup')}
                        className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
                      >
                        {otpLoading ? (
                          <span>Sending Verification Code...</span>
                        ) : (
                          <>
                            <span>Verify Email & Start 15-Day Trial</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>15-day full access • No credit card required</span>
                      </div>
                    </div>
                  ) : (
                    /* OTP ENTRY FOR SIGNUP */
                    <div className="space-y-4 text-left">
                      <div className="text-center">
                        <span className="text-xs text-slate-600">Enter verification code sent to </span>
                        <span className="text-xs font-semibold text-[#111827]">{email}</span>
                      </div>

                      <div className="flex justify-between gap-1.5 sm:gap-2">
                        {otpCode.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpInputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#1D4ED8] focus:bg-white rounded-xl outline-none"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={() => submitOtpVerification()}
                        className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {otpLoading ? 'Creating Workspace...' : 'Confirm & Launch Studio'}
                      </button>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          ← Change details
                        </button>
                        <button
                          type="button"
                          disabled={otpTimer > 0 || otpLoading}
                          onClick={() => handleSendOtp('signup')}
                          className={`flex items-center gap-1 font-semibold ${
                            otpTimer > 0 ? 'text-slate-400' : 'text-[#1D4ED8] hover:underline cursor-pointer'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend code'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────
                  TAB 3: DEMO LOGIN (One Click Sandbox)
                 ──────────────────────────────────────────────── */}
              {activeTab === 'demo' && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h2 className="text-xl font-editorial font-bold text-[#111827]">
                      Explore Sample Studio
                    </h2>
                    <p className="text-xs text-slate-500">
                      Instantly test room BOQs, leads pipeline, and contractor bills with pre-filled mock data.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-blue-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instant Sandbox Access</span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      Includes 3 sample residential and commercial interior projects with itemized BOQ schedules and client leads.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDemoMode(true)}
                    className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
                  >
                    <span>Enter Demo Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* ── Minimal Footer ── */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-gray-200 bg-white">
        Apni Estate Interiors © {new Date().getFullYear()} • Bespoke Interior Design ERP & CRM
      </footer>
    </div>
  );
};
