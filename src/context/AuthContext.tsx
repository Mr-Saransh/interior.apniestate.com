import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { Profile, Organization, SubscriptionStatus, PlanTier, UserRole } from '../types';
import { userService, RegisteredUser } from '../services/userService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  currentUser: RegisteredUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setIsDemoMode: (mode: boolean) => void;
  
  // Trial Entitlement
  trialStatus: SubscriptionStatus;
  isTrialExpired: boolean;
  daysRemaining: number;
  
  // Auth Operations
  signUp: (params: {
    email: string;
    password: string;
    fullName?: string;
    studioName?: string;
    phone?: string;
  }) => Promise<{ requiresEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(() => userService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(false);

  const setIsDemoMode = useCallback((mode: boolean) => {
    setIsDemoModeState(mode);
  }, []);

  // Sync with userService changes across components/tabs
  useEffect(() => {
    const syncUser = () => {
      const current = userService.getCurrentUser();
      setRegisteredUser(current);
      if (current) {
        // Build mock profile & org for local registered user
        const cleanName = current.fullName || current.email.split('@')[0];
        const orgName = current.studioName || `${cleanName}'s Studio`;
        
        setProfile({
          id: current.id,
          organization_id: `org_${current.id}`,
          full_name: cleanName,
          role: 'owner',
          created_at: current.registeredAt,
        } as Profile);

        setOrganization({
          id: `org_${current.id}`,
          name: orgName,
          subscription_status: current.status as any,
          trial_ends_at: current.trialEndsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          plan: (current.plan || 'professional') as any,
          created_at: current.registeredAt,
          updated_at: current.registeredAt,
        } as Organization);

        setUser({
          id: current.id,
          email: current.email,
          user_metadata: { full_name: current.fullName, studio_name: current.studioName },
          app_metadata: {},
          aud: 'authenticated',
          created_at: current.registeredAt,
        } as User);
      }
    };

    syncUser();
    window.addEventListener('apni_estate_users_updated', syncUser);
    return () => window.removeEventListener('apni_estate_users_updated', syncUser);
  }, []);

  // Dynamic Trial & Access Calculation
  const trialCalculations = useMemo(() => {
    if (!registeredUser) {
      return {
        trialStatus: 'trial' as SubscriptionStatus,
        isTrialExpired: false,
        daysRemaining: 7,
      };
    }

    const status = registeredUser.status;

    // Active paid subscription
    if (status === 'active') {
      return {
        trialStatus: 'active' as SubscriptionStatus,
        isTrialExpired: false,
        daysRemaining: 365,
      };
    }

    // Pending states
    if (status === 'pending_profile' || status === 'pending_approval') {
      return {
        trialStatus: status as SubscriptionStatus,
        isTrialExpired: false,
        daysRemaining: 7,
      };
    }

    // Expired or rejected
    if (status === 'expired' || status === 'rejected') {
      return {
        trialStatus: status as SubscriptionStatus,
        isTrialExpired: true,
        daysRemaining: 0,
      };
    }

    // Active 7-Day Free Trial
    if (status === 'active_trial') {
      if (!registeredUser.trialEndsAt) {
        return {
          trialStatus: 'active_trial' as SubscriptionStatus,
          isTrialExpired: false,
          daysRemaining: 7,
        };
      }
      const trialEnd = new Date(registeredUser.trialEndsAt).getTime();
      const now = Date.now();
      const diffMs = trialEnd - now;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const isExpired = diffMs <= 0;

      return {
        trialStatus: isExpired ? ('expired' as SubscriptionStatus) : ('active_trial' as SubscriptionStatus),
        isTrialExpired: isExpired,
        daysRemaining,
      };
    }

    return {
      trialStatus: 'trial' as SubscriptionStatus,
      isTrialExpired: false,
      daysRemaining: 7,
    };
  }, [registeredUser]);

  // Session Bootstrapper
  useEffect(() => {
    async function initAuth() {
      try {
        const stored = userService.getCurrentUser();
        if (stored) {
          setRegisteredUser(stored);
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Sign Up
  const signUp = async (params: {
    email: string;
    password: string;
    fullName?: string;
    studioName?: string;
    phone?: string;
  }): Promise<{ requiresEmailVerification: boolean }> => {
    setLoading(true);
    try {
      const reg = userService.registerUser(params.email, params.password);
      setRegisteredUser(reg);
      return { requiresEmailVerification: true };
    } finally {
      setLoading(false);
    }
  };

  // Sign In (Email + Password)
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const userRecord = userService.getUserByEmail(cleanEmail);

      if (!userRecord) {
        throw new Error('Account not found with this email. Please sign up first.');
      }

      if (userRecord.password && userRecord.password !== password) {
        throw new Error('Invalid password. Please check your credentials or sign in with OTP.');
      }

      userService.setCurrentUserEmail(cleanEmail);
      setRegisteredUser(userRecord);
    } finally {
      setLoading(false);
    }
  };

  // Sign In with OTP
  const signInWithOtp = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      let userRecord = userService.getUserByEmail(cleanEmail);

      if (!userRecord) {
        userRecord = userService.registerUser(cleanEmail);
      }

      userService.setCurrentUserEmail(cleanEmail);
      setRegisteredUser(userRecord);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      userService.setCurrentUserEmail(null);
      setRegisteredUser(null);
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganization(null);
      setIsDemoMode(false);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    // handled via OTP
  };

  const refreshProfile = async (): Promise<void> => {
    const current = userService.getCurrentUser();
    setRegisteredUser(current);
  };

  const isAuthenticated = Boolean(registeredUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        currentUser: registeredUser,
        loading,
        isAuthenticated,
        isDemoMode,
        setIsDemoMode,
        trialStatus: trialCalculations.trialStatus,
        isTrialExpired: trialCalculations.isTrialExpired,
        daysRemaining: trialCalculations.daysRemaining,
        signUp,
        signIn,
        signInWithOtp,
        signOut,
        resetPassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
