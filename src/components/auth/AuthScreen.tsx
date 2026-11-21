// ==============================================================================
// APNI ESTATE INTERIORS - AUTHENTICATION SCREEN (EMAIL & PASS + OTP VERIFY)
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { otpService } from '../../services/otpService';
import { userService } from '../../services/userService';
import { 
  Lock, 
  Mail, 
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

type AuthTab = 'signin' | 'signup';
type SignInMethod = 'password' | 'otp';

export const AuthScreen: React.FC = () => {
  const { signIn, signInWithOtp, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signup');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    setPreviewOtp(null);
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
      if (!password) {
        setErrorMessage('Please choose a secure password (at least 6 characters).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      // Pre-register user in userService
      userService.registerUser(targetEmail, password);
    }

    setOtpLoading(true);
    try {
      const res = await otpService.sendOtp(targetEmail, type);
      if (res.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setSuccessMessage(res.message || 'Verification code sent to your email.');
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

    // Auto verify if all 6 digits entered
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

      // Mark email verified in userService and establish session
      userService.verifyEmail(email);
      await signInWithOtp(email.trim());
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

    try {
      await signIn(cleanEmail, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
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
                <div className="text-[11px] text-slate-500">Itemized rates, materials &amp; vendor margins.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-subtle">
                <div className="text-xs font-semibold text-[#111827] mb-1">Dual Mode Workspace</div>
                <div className="text-[11px] text-slate-500">Switch between Studio CRM &amp; Interior ERP.</div>
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
              
              {/* Segmented Tab Bar (Sign In / Sign Up) */}
              <div className="flex items-center p-1 bg-gray-100 rounded-xl mb-5 text-xs font-semibold border border-gray-200">
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#1D4ED8] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className={`flex-1 py-2 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white text-[#1D4ED8] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
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

              {/* Preview Code Alert if offline/dev */}
              {previewOtp && (
                <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs flex items-center justify-between">
                  <span className="font-semibold">Dev Verification Code:</span>
                  <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-blue-200">{previewOtp}</span>
                </div>
              )}

              {/* ────────────────────────────────────────────────
                  TAB 1: SIGN UP (Email + Password -> OTP -> Profile)
                 ──────────────────────────────────────────────── */}
              {activeTab === 'signup' && (
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-editorial font-bold text-[#111827]">
                      Join Apni Estate
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sign up with your email to configure your interior studio workspace.
                    </p>
                  </div>

                  {!otpSent ? (
                    <div className="space-y-3.5 text-left">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="you@interiorstudio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Create Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none transition-all"
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

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 focus:bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl text-xs text-[#111827] outline-none transition-all"
                          />
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
                            <span>Continue with Email OTP</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Zoho secure OTP verification</span>
                      </div>
                    </div>
                  ) : (
                    /* 6-DIGIT OTP ENTRY FOR SIGNUP */
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
                        {otpLoading ? 'Verifying Code...' : 'Verify & Setup Studio Profile'}
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
                  TAB 2: SIGN IN (Password or OTP)
                 ──────────────────────────────────────────────── */}
              {activeTab === 'signin' && (
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-editorial font-bold text-[#111827]">
                      Welcome back
                    </h2>
                    <p className="text-xs text-slate-500">
                      {signInMethod === 'password' ? 'Sign in using your password' : 'Sign in with a 6-digit email verification code'}
                    </p>
                  </div>

                  {/* Mode Toggle: Password vs OTP */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInMethod(prev => prev === 'password' ? 'otp' : 'password');
                        setOtpSent(false);
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {signInMethod === 'password' ? (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Use Email OTP instead</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Use password instead</span>
                        </>
                      )}
                    </button>
                  </div>

                  {signInMethod === 'password' ? (
                    /* PASSWORD FORM */
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
                            placeholder="you@interiorstudio.com"
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
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </form>
                  ) : (
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
                                placeholder="you@interiorstudio.com"
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
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* ── Minimal Footer ── */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-gray-200 bg-white">
        Apni Estate Interiors © {new Date().getFullYear()} • Bespoke Interior Design ERP &amp; CRM
      </footer>
    </div>
  );
};
