// ==============================================================================
// APNI ESTATE INTERIORS - CENTRAL USER REGISTRATION & APPROVAL SERVICE
// ==============================================================================

export interface RegisteredUser {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  studioName: string;
  phone: string;
  city: string;
  businessType?: string;
  emailVerified: boolean;
  status: 'pending_profile' | 'pending_approval' | 'active_trial' | 'active' | 'expired' | 'rejected';
  plan?: 'standard' | 'professional' | 'prime';
  trialRequestedAt?: string;
  trialApprovedAt?: string;
  trialEndsAt?: string;
  subscriptionStartedAt?: string;
  razorpayPaymentId?: string;
  registeredAt: string;
  notes?: string;
}

const STORAGE_KEY = 'apni_estate_registered_users';
const CURRENT_USER_EMAIL_KEY = 'apni_estate_current_user_email';

class UserService {
  private initialSeed(): RegisteredUser[] {
    return [
      {
        id: 'usr_demo_apni',
        email: 'apni@gmail.com',
        password: 'admin123',
        fullName: 'Aarav Mehta (Demo Studio)',
        studioName: 'Apni Estate Studio',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        businessType: 'Turnkey Luxury Interiors',
        emailVerified: true,
        status: 'active',
        plan: 'prime',
        registeredAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'usr_sample_1',
        email: 'priya.sharma@designcraft.in',
        password: 'password123',
        fullName: 'Priya Sharma',
        studioName: 'DesignCraft Studio',
        phone: '+91 98201 44556',
        city: 'Mumbai',
        businessType: 'Turnkey Interior Contractor',
        emailVerified: true,
        status: 'pending_approval',
        trialRequestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'usr_sample_2',
        email: 'rahul.verma@auraspaces.com',
        password: 'password123',
        fullName: 'Rahul Verma',
        studioName: 'Aura Spaces',
        phone: '+91 99887 76655',
        city: 'Bengaluru',
        businessType: 'Architecture & Interior Studio',
        emailVerified: true,
        status: 'active_trial',
        trialRequestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        trialApprovedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        trialEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'usr_sample_3',
        email: 'arjun.mehta@prestigeinterior.in',
        password: 'password123',
        fullName: 'Arjun Mehta',
        studioName: 'Prestige Living Interiors',
        phone: '+91 91234 56789',
        city: 'Delhi NCR',
        businessType: 'Turnkey Luxury Homes',
        emailVerified: true,
        status: 'active',
        plan: 'professional',
        razorpayPaymentId: 'pay_live_sample98231',
        subscriptionStartedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        registeredAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      }
    ];
  }

  public getUsers(): RegisteredUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: RegisteredUser[] = raw ? JSON.parse(raw) : this.initialSeed();

      // Ensure the official demo user apni@gmail.com always exists with password admin123
      const demoUser = list.find(u => u.email.toLowerCase() === 'apni@gmail.com');
      if (!demoUser) {
        list.unshift({
          id: 'usr_demo_apni',
          email: 'apni@gmail.com',
          password: 'admin123',
          fullName: 'Aarav Mehta (Demo Studio)',
          studioName: 'Apni Estate Studio',
          phone: '+91 98765 43210',
          city: 'Mumbai',
          businessType: 'Turnkey Luxury Interiors',
          emailVerified: true,
          status: 'active',
          plan: 'prime',
          registeredAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } else if (demoUser.password !== 'admin123') {
        demoUser.password = 'admin123';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }

      return list;
    } catch {
      return this.initialSeed();
    }
  }

  public saveUsers(users: RegisteredUser[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      window.dispatchEvent(new Event('apni_estate_users_updated'));
    } catch (err) {
      console.error('[UserService] Failed to save users:', err);
    }
  }

  public getUserByEmail(email: string): RegisteredUser | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
  }

  public getCurrentUser(): RegisteredUser | null {
    try {
      const email = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
      if (!email) return null;
      return this.getUserByEmail(email) || null;
    } catch {
      return null;
    }
  }

  public setCurrentUserEmail(email: string | null): void {
    if (email) {
      localStorage.setItem(CURRENT_USER_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
    }
  }

  public registerUser(email: string, password?: string): RegisteredUser {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    let existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (password) {
        existing.password = password;
      }
      this.saveUsers(users);
      this.setCurrentUserEmail(cleanEmail);
      return existing;
    }

    const newUser: RegisteredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: cleanEmail,
      password: password || 'defaultPass123',
      fullName: '',
      studioName: '',
      phone: '',
      city: '',
      emailVerified: false,
      status: 'pending_profile',
      registeredAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    this.saveUsers(users);
    this.setCurrentUserEmail(cleanEmail);
    return newUser;
  }

  public verifyEmail(email: string): RegisteredUser {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = this.registerUser(cleanEmail);
    }
    user.emailVerified = true;
    this.saveUsers(users);
    return user;
  }

  public updateUserProfile(
    email: string, 
    data: { fullName: string; studioName: string; phone: string; city: string; businessType?: string }
  ): RegisteredUser {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = this.registerUser(cleanEmail);
    }

    user.fullName = data.fullName.trim();
    user.studioName = data.studioName.trim();
    user.phone = data.phone.trim();
    user.city = data.city.trim();
    if (data.businessType) user.businessType = data.businessType;
    user.emailVerified = true;
    
    // If user has not yet requested a trial or subscribed, mark as pending_approval or keep pending_approval
    if (user.status === 'pending_profile') {
      user.status = 'pending_approval';
    }

    this.saveUsers(users);
    return user;
  }

  public requestFreeTrial(email: string): RegisteredUser {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('User not found.');
    }

    user.status = 'pending_approval';
    user.trialRequestedAt = new Date().toISOString();
    this.saveUsers(users);
    return user;
  }

  public async approveFreeTrial(emailOrId: string): Promise<RegisteredUser> {
    const users = this.getUsers();
    const target = emailOrId.trim().toLowerCase();
    const user = users.find(u => u.id === target || u.email.toLowerCase() === target);
    if (!user) {
      throw new Error('User not found.');
    }

    user.status = 'active_trial';
    user.trialApprovedAt = new Date().toISOString();
    // 7-day free trial exact duration
    user.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    this.saveUsers(users);

    // Send real approval email via SMTP
    try {
      await fetch('/api/auth/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName || 'Studio Owner',
          studioName: user.studioName || 'Your Studio',
          trialEndsAt: user.trialEndsAt
        })
      });
    } catch (e) {
      console.warn('[UserService] Approval email endpoint call notice:', e);
    }

    return user;
  }

  public activateSubscription(
    emailOrId: string, 
    plan: 'standard' | 'professional' | 'prime', 
    razorpayPaymentId?: string
  ): RegisteredUser {
    const users = this.getUsers();
    const target = emailOrId.trim().toLowerCase();
    const user = users.find(u => u.id === target || u.email.toLowerCase() === target);
    if (!user) {
      throw new Error('User not found.');
    }

    user.status = 'active';
    user.plan = plan;
    user.razorpayPaymentId = razorpayPaymentId || `pay_live_${Date.now()}`;
    user.subscriptionStartedAt = new Date().toISOString();
    this.saveUsers(users);
    return user;
  }

  public rejectTrial(emailOrId: string, reason?: string): RegisteredUser {
    const users = this.getUsers();
    const target = emailOrId.trim().toLowerCase();
    const user = users.find(u => u.id === target || u.email.toLowerCase() === target);
    if (!user) {
      throw new Error('User not found.');
    }

    user.status = 'rejected';
    if (reason) user.notes = reason;
    this.saveUsers(users);
    return user;
  }

  public deleteUser(emailOrId: string): void {
    const target = emailOrId.trim().toLowerCase();
    const users = this.getUsers().filter(u => u.id !== target && u.email.toLowerCase() !== target);
    this.saveUsers(users);
  }
}

export const userService = new UserService();
