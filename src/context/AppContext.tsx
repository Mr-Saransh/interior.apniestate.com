// ==============================================================================
// APNI ESTATE INTERIORS - APP CONTEXT (REAL FINANCIAL ENGINE & MULTI-TENANT STATE)
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Project, 
  Client,
  Room,
  Expense, 
  BOQItem, 
  Material, 
  MaterialTransaction, 
  Milestone, 
  DailyUpdate, 
  ProjectPhoto, 
  AttentionItem, 
  CalendarEvent, 
  DocumentItem, 
  NotificationItem, 
  ExpenseCategory, 
  ProjectStatus, 
  ProjectNote,
  Lead,
  Task,
  StaffMember,
  UserRole,
  DocumentCategory,
  Vendor,
  ClientPayment,
  Purchase,
  MaterialWastage
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_EXPENSES, 
  INITIAL_BOQ_ITEMS, 
  CALENDAR_EVENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_LEADS,
  INITIAL_TASKS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_VENDORS,
  INITIAL_CLIENT_PAYMENTS,
  INITIAL_PURCHASES
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { clientService } from '../services/clientService';
import { projectService } from '../services/projectService';
import { roomService } from '../services/roomService';
import { expenseService } from '../services/expenseService';
import { boqService } from '../services/boqService';
import { materialService, CreateMaterialInput, CreateMaterialTransactionInput } from '../services/materialService';
import { wastageService } from '../services/wastageService';
import { milestoneService, CreateMilestoneInput } from '../services/milestoneService';
import { dailyUpdateService, CreateDailyUpdateInput } from '../services/dailyUpdateService';
import { photoService, UploadPhotoInput } from '../services/photoService';
import { leadService } from '../services/leadService';
import { taskService } from '../services/taskService';
import { documentService } from '../services/documentService';
import { teamService } from '../services/teamService';
import { vendorService } from '../services/vendorService';
import { paymentService } from '../services/paymentService';
import { purchaseService } from '../services/purchaseService';
import { 
  calculateProjectSpent, 
  calculateNeedsAttention, 
  calculateCategoryBreakdown, 
  calculateBudgetMetrics, 
  CATEGORY_COLORS 
} from '../lib/financialMetrics';

export type NavigationPage = 
  | 'overview' 
  | 'projects' 
  | 'clients'
  | 'leads'
  | 'quotations'
  | 'change-requests'
  | 'site-controls'
  | 'client-portal'
  | 'tasks'
  | 'team'
  | 'project-detail' 
  | 'expenses' 
  | 'budget' 
  | 'calendar' 
  | 'workspace' 
  | 'documents'
  | 'vendors'
  | 'payments'
  | 'purchases'
  | 'reports'
  | 'management'
  | 'branches'
  | 'approvals'
  | 'roles'
  | 'export'
  | 'settings';

export type WorkspaceMode = 'erp' | 'crm';

export type ProjectDetailTab = 
  | 'Overview' 
  | 'Rooms' 
  | 'BOQ' 
  | 'Expenses' 
  | 'Budget' 
  | 'Materials' 
  | 'Milestones' 
  | 'Daily Updates' 
  | 'Photos' 
  | 'Notes'
  | 'Tasks'
  | 'Documents'
  | 'Payments'
  | 'Purchases';

interface AppContextType {
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  toggleWorkspaceMode: () => void;
  modeTransitionTarget: WorkspaceMode | null;
  modeTransitionPhase: 'entering' | 'exiting' | null;
  dismissModeTransition: () => void;
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  openProjectDetail: (projectId: string, initialTab?: ProjectDetailTab) => void;
  initialProjectDetailTab?: ProjectDetailTab;
  
  // Search & Filters
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  
  // Data
  clients: Client[];
  leads: Lead[];
  tasks: Task[];
  teamMembers: StaffMember[];
  vendors: Vendor[];
  clientPayments: ClientPayment[];
  purchases: Purchase[];
  projects: Project[];
  expenses: Expense[];
  boqItems: BOQItem[];
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  milestones: Milestone[];
  dailyUpdates: DailyUpdate[];
  projectPhotos: ProjectPhoto[];
  attentionItems: AttentionItem[];
  calendarEvents: CalendarEvent[];
  documents: DocumentItem[];
  notifications: NotificationItem[];
  loadingData: boolean;
  
  // Modals state
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean, defaultProjectId?: string, expenseToEdit?: Expense | null) => void;
  expenseToEdit: Expense | null;
  defaultExpenseProjectId: string | null;
  isBOQModalOpen: boolean;
  setIsBOQModalOpen: (open: boolean, projectId?: string, defaultRoomId?: string, itemToEdit?: BOQItem | null) => void;
  boqModalProjectId: string;
  boqModalDefaultRoomId?: string;
  boqItemToEdit: BOQItem | null;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Quotation Modals (Generic & Specific)
  isGenericQuoteModalOpen: boolean;
  setIsGenericQuoteModalOpen: (open: boolean) => void;
  isSpecificQuoteModalOpen: boolean;
  setIsSpecificQuoteModalOpen: (open: boolean, projectId?: string) => void;
  specificQuoteProjectId?: string;

  // Material Modals
  isMaterialModalOpen: boolean;
  setIsMaterialModalOpen: (open: boolean, matToEdit?: Material | null) => void;
  materialToEdit: Material | null;
  isMaterialTransactionModalOpen: boolean;
  setIsMaterialTransactionModalOpen: (open: boolean, mat?: Material | null, type?: 'in' | 'out') => void;
  selectedMaterialForTransaction: Material | null;
  materialTransactionType: 'in' | 'out';

  // Milestone Modals
  isMilestoneModalOpen: boolean;
  setIsMilestoneModalOpen: (open: boolean, msToEdit?: Milestone | null) => void;
  milestoneToEdit: Milestone | null;

  // DPR Modals
  isDailyUpdateModalOpen: boolean;
  setIsDailyUpdateModalOpen: (open: boolean, dprToEdit?: DailyUpdate | null) => void;
  dailyUpdateToEdit: DailyUpdate | null;

  // Photo Modals
  isUploadPhotoModalOpen: boolean;
  setIsUploadPhotoModalOpen: (open: boolean, defaultDprId?: string) => void;
  defaultPhotoDailyUpdateId?: string;
  
  // Client Actions
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;

  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToClient: (leadId: string) => Promise<{ client: Client; updatedLead: Lead }>;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (input: { organizationId: string; projectId?: string; projectName?: string; title: string; category: DocumentCategory; file: File; userId?: string }) => Promise<DocumentItem>;
  deleteDocument: (id: string, storagePath?: string) => Promise<void>;

  // Team Actions
  updateMemberRole: (profileId: string, newRole: UserRole) => Promise<void>;

  // Vendor Actions
  addVendor: (vendor: Partial<Vendor>) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<Vendor>;
  deleteVendor: (id: string) => Promise<void>;

  // Client Payment Actions
  addClientPayment: (payment: Partial<ClientPayment>) => Promise<ClientPayment>;
  updateClientPayment: (id: string, updates: Partial<ClientPayment>) => Promise<ClientPayment>;
  deleteClientPayment: (id: string) => Promise<void>;

  // Purchase Actions
  addPurchase: (purchase: any) => Promise<Purchase>;
  updatePurchase: (id: string, updates: any) => Promise<Purchase>;
  deletePurchase: (id: string) => Promise<void>;
  
  // Project Actions
  addProject: (newProject: Omit<Project, 'id' | 'spent' | 'progress'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Room Actions
  addRoom: (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => Promise<Room>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;
  
  // BOQ Actions
  addBOQItem: (itemData: {
    project_id: string;
    room_id?: string;
    item_name: string;
    description?: string;
    category?: string;
    quantity: number;
    unit?: string;
    rate: number;
    estimated_cost?: number;
    material_rate?: number;
    labour_rate?: number;
    selling_rate?: number;
    gst_percent?: number;
  }) => Promise<BOQItem>;
  updateBOQItem: (id: string, updates: Partial<BOQItem>) => Promise<BOQItem>;
  deleteBOQItem: (id: string) => Promise<void>;
  approveProjectBOQ: (projectId: string) => Promise<void>;

  // Expense Actions
  addExpense: (newExpense: Omit<Expense, 'id'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Material Actions
  addMaterial: (input: CreateMaterialInput) => Promise<Material>;
  updateMaterial: (id: string, updates: Partial<CreateMaterialInput>) => Promise<Material>;
  deleteMaterial: (id: string) => Promise<void>;
  addMaterialTransaction: (input: CreateMaterialTransactionInput) => Promise<MaterialTransaction>;
  recordMaterialWastage: (input: { materialId: string; quantity: number; reason: string; wastageDate: string }) => Promise<MaterialWastage>;

  // Milestone Actions
  addMilestone: (input: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestone: (id: string, updates: Partial<CreateMilestoneInput>) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;

  // Daily Update Actions
  addDailyUpdate: (input: CreateDailyUpdateInput) => Promise<DailyUpdate>;
  updateDailyUpdate: (id: string, updates: Partial<CreateDailyUpdateInput>) => Promise<DailyUpdate>;
  deleteDailyUpdate: (id: string) => Promise<void>;

  // Photo Actions
  uploadProjectPhoto: (projectId: string, file: File, metadata?: { title?: string; category?: any; daily_update_id?: string }) => Promise<ProjectPhoto>;
  deleteProjectPhoto: (photoId: string, storagePath?: string) => Promise<void>;

  // Aux Actions
  addProjectNote: (projectId: string, content: string, tag?: ProjectNote['tag']) => void;
  addProjectPhoto: (projectId: string, photo: Omit<ProjectPhoto, 'id' | 'projectId' | 'uploadedAt'>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
  refreshData: () => Promise<void>;
  
  // Computed stats
  stats: {
    activeProjectsCount: number;
    needAttentionCount: number;
    totalProjectValue: number;
    totalBudget: number;
    totalBOQEstimate: number;
    totalSpent: number;
    totalRemaining: number;
    spentPercentage: number;
    categorySpending: { category: ExpenseCategory; amount: number; percentage: number; color: string }[];
    recentExpenses: Expense[];
    selectedProject: Project | null;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock clients for demo mode
const INITIAL_DEMO_CLIENTS: Client[] = [
  {
    id: 'client-1',
    organization_id: 'demo-org',
    name: 'Vikram & Ananya Kapoor',
    phone: '+91 98201 44521',
    email: 'vikram.kapoor@gmail.com',
    address: 'Worli Sea Face, Mumbai',
    notes: 'Prefers contemporary Italian aesthetics, minimal clutter.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'client-2',
    organization_id: 'demo-org',
    name: 'Siddharth Roy',
    phone: '+91 98450 11234',
    email: 'siddharth.roy@nexustech.io',
    address: 'Koramangala 4th Block, Bangalore',
    notes: 'Fast turnaround needed for 50-seater engineering office.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'client-3',
    organization_id: 'demo-org',
    name: 'Kavita Singhania',
    phone: '+91 99100 88765',
    email: 'kavita.singhania@heritage.in',
    address: 'Golf Course Road, Gurgaon',
    notes: 'Warm natural tones, brass hardware, custom veneer finishes.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEMO_PROJECT_IDS = new Set(INITIAL_PROJECTS.map(p => p.id));
const DEMO_CLIENT_NAMES = new Set(INITIAL_DEMO_CLIENTS.map(c => c.name.toLowerCase()));
const DEMO_CLIENT_IDS = new Set(INITIAL_DEMO_CLIENTS.map(c => c.id));
const DEMO_EXPENSE_TITLES = new Set(INITIAL_EXPENSES.map(e => e.title.toLowerCase()));
const DEMO_EXPENSE_IDS = new Set(INITIAL_EXPENSES.map(e => e.id));
const DEMO_LEAD_IDS = new Set(INITIAL_LEADS.map(l => l.id));
const DEMO_TASK_IDS = new Set(INITIAL_TASKS.map(t => t.id));
const DEMO_STAFF_IDS = new Set(INITIAL_STAFF_MEMBERS.map(s => s.id));
const DEMO_VENDOR_IDS = new Set(INITIAL_VENDORS.map(v => v.id));
const DEMO_PURCHASE_IDS = new Set(INITIAL_PURCHASES.map(p => p.id));
const DEMO_PAYMENT_IDS = new Set(INITIAL_CLIENT_PAYMENTS.map(p => p.id));

export const isDemoProjectItem = (p: any): boolean => {
  if (!p || typeof p !== 'object') return false;
  return (
    DEMO_PROJECT_IDS.has(p.id) ||
    (typeof p.id === 'string' && (p.id.startsWith('proj-') || p.id.startsWith('demo-'))) ||
    p.organization_id === 'org-demo-1' ||
    p.organization_id === 'demo-org' ||
    p.organization_id === 'demo' ||
    p.name === 'Mehta Residence' ||
    p.name === 'Godrej Woodsville 3BHK' ||
    p.name === 'Kapoor Apartment' ||
    p.name === 'Arora Villa' ||
    p.name === 'Birla House' ||
    p.name === 'Singhania Villa' ||
    p.name === 'Oberoi Sky City' ||
    p.name === 'Lodha Park 4BHK' ||
    p.client === 'Sameer & Divya Joshi' ||
    p.client === 'Vikram Kapoor' ||
    p.client === 'Rohan Mehta' ||
    p.client === 'Pooja Malhotra'
  );
};

export const isDemoExpenseItem = (e: any): boolean => {
  if (!e || typeof e !== 'object') return false;
  return (
    DEMO_EXPENSE_IDS.has(e.id) ||
    (typeof e.id === 'string' && e.id.startsWith('exp-demo-')) ||
    DEMO_EXPENSE_TITLES.has((e.title || '').toLowerCase()) ||
    DEMO_PROJECT_IDS.has(e.projectId) ||
    (typeof e.projectId === 'string' && e.projectId.startsWith('proj-'))
  );
};

export const isDemoClientItem = (c: any): boolean => {
  if (!c || typeof c !== 'object') return false;
  return (
    DEMO_CLIENT_IDS.has(c.id) ||
    DEMO_CLIENT_NAMES.has((c.name || '').toLowerCase()) ||
    (typeof c.id === 'string' && c.id.startsWith('cli-demo-')) ||
    c.organization_id === 'org-demo-1' ||
    c.organization_id === 'demo'
  );
};

export const isDemoLeadItem = (l: any): boolean => {
  if (!l || typeof l !== 'object') return false;
  return DEMO_LEAD_IDS.has(l.id) || (typeof l.id === 'string' && l.id.startsWith('lead-demo-'));
};

export const isDemoTaskItem = (t: any): boolean => {
  if (!t || typeof t !== 'object') return false;
  return DEMO_TASK_IDS.has(t.id) || (typeof t.id === 'string' && t.id.startsWith('task-demo-')) || DEMO_PROJECT_IDS.has(t.project_id || t.projectId);
};

export const isDemoStaffItem = (s: any): boolean => {
  if (!s || typeof s !== 'object') return false;
  return DEMO_STAFF_IDS.has(s.id) || s.full_name === 'Aarav Mehta' || s.full_name === 'Priya Sharma';
};

export const isDemoVendorItem = (v: any): boolean => {
  if (!v || typeof v !== 'object') return false;
  return DEMO_VENDOR_IDS.has(v.id);
};

export const isDemoPurchaseItem = (p: any): boolean => {
  if (!p || typeof p !== 'object') return false;
  return DEMO_PURCHASE_IDS.has(p.id) || DEMO_PROJECT_IDS.has(p.project_id || p.projectId);
};

export const isDemoPaymentItem = (p: any): boolean => {
  if (!p || typeof p !== 'object') return false;
  return DEMO_PAYMENT_IDS.has(p.id) || DEMO_PROJECT_IDS.has(p.project_id || p.projectId);
};

export const getTenantStorageKey = (
  entity: string,
  isDemo: boolean,
  tenantId?: string | null
): string => {
  if (isDemo || tenantId === 'demo') {
    return `apni_estate_demo_${entity}`;
  }
  if (!tenantId) {
    return `apni_estate_unauth_${entity}`;
  }
  return `apni_estate_tenant_${tenantId}_${entity}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organization, profile, currentUser, user, isAuthenticated, isDemoMode } = useAuth();

  // Exactly one demo account: apni@gmail.com
  const isDemoAccount = Boolean(isDemoMode || (currentUser && currentUser.email.toLowerCase() === 'apni@gmail.com'));
  const activeTenantId = isDemoAccount 
    ? 'demo' 
    : (currentUser?.id || organization?.id || profile?.organization_id || user?.id || null);
  const isRealTenant = !isDemoAccount && Boolean(activeTenantId && activeTenantId !== 'demo');

  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>(() => {
    try {
      const saved = localStorage.getItem('apni_estate_workspace_mode');
      return (saved === 'crm' || saved === 'erp') ? saved : 'erp';
    } catch {
      return 'erp';
    }
  });

  const [modeTransitionTarget, setModeTransitionTarget] = useState<WorkspaceMode | null>(null);
  const [modeTransitionPhase, setModeTransitionPhase] = useState<'entering' | 'exiting' | null>(null);
  const transitionTimersRef = React.useRef<number[]>([]);

  const dismissModeTransition = useCallback(() => {
    transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
    transitionTimersRef.current = [];
    setModeTransitionPhase(null);
    setModeTransitionTarget(null);
  }, []);

  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');

  const triggerModeTransition = useCallback((targetMode: WorkspaceMode) => {
    transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
    transitionTimersRef.current = [];

    setModeTransitionTarget(targetMode);
    setModeTransitionPhase('entering');

    const swapTimer = window.setTimeout(() => {
      setWorkspaceModeState(targetMode);
      try {
        localStorage.setItem('apni_estate_workspace_mode', targetMode);
      } catch (e) {
        // ignore
      }
      setCurrentPage((prevPage) => {
        if (targetMode === 'crm') {
          if (['overview', 'projects', 'project-detail', 'expenses', 'purchases', 'site-controls', 'budget'].includes(prevPage)) {
            return 'overview';
          }
        } else {
          if (['overview', 'leads', 'clients', 'quotations', 'client-portal', 'tasks', 'documents'].includes(prevPage)) {
            return 'overview';
          }
        }
        return prevPage;
      });
    }, 240);

    const exitTimer = window.setTimeout(() => {
      setModeTransitionPhase('exiting');
    }, 560);

    const clearTimer = window.setTimeout(() => {
      setModeTransitionPhase(null);
      setModeTransitionTarget(null);
    }, 840);

    transitionTimersRef.current = [swapTimer, exitTimer, clearTimer];
  }, []);

  const setWorkspaceMode = useCallback((mode: WorkspaceMode) => {
    if (mode === workspaceMode && !modeTransitionTarget) return;
    triggerModeTransition(mode);
  }, [workspaceMode, modeTransitionTarget, triggerModeTransition]);

  const toggleWorkspaceMode = useCallback(() => {
    const next = workspaceMode === 'erp' ? 'crm' : 'erp';
    triggerModeTransition(next);
  }, [workspaceMode, triggerModeTransition]);

  // Alt + S or Ctrl+S mode toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 's') || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        toggleWorkspaceMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWorkspaceMode]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [initialProjectDetailTab, setInitialProjectDetailTab] = useState<ProjectDetailTab>('Overview');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(false);
  
  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpenState] = useState<boolean>(false);
  const [defaultExpenseProjectId, setDefaultExpenseProjectId] = useState<string | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // BOQ Modal state
  const [isBOQModalOpen, setIsBOQModalOpenState] = useState<boolean>(false);
  const [boqModalProjectId, setBOQModalProjectId] = useState<string>('');
  const [boqModalDefaultRoomId, setBOQModalDefaultRoomId] = useState<string | undefined>(undefined);
  const [boqItemToEdit, setBOQItemToEdit] = useState<BOQItem | null>(null);

  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Generic & Specific Quotation Modals
  const [isGenericQuoteModalOpen, setIsGenericQuoteModalOpen] = useState<boolean>(false);
  const [isSpecificQuoteModalOpen, setIsSpecificQuoteModalOpenState] = useState<boolean>(false);
  const [specificQuoteProjectId, setSpecificQuoteProjectId] = useState<string | undefined>(undefined);

  const handleOpenSpecificQuoteModal = (open: boolean, projectId?: string) => {
    setSpecificQuoteProjectId(projectId || selectedProjectId || (projects[0]?.id || undefined));
    setIsSpecificQuoteModalOpenState(open);
  };

  // Phase 6 Modals State
  const [isMaterialModalOpen, setIsMaterialModalOpenState] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  const [isMaterialTransactionModalOpen, setIsMaterialTransactionModalOpenState] = useState(false);
  const [selectedMaterialForTransaction, setSelectedMaterialForTransaction] = useState<Material | null>(null);
  const [materialTransactionType, setMaterialTransactionType] = useState<'in' | 'out'>('in');

  const [isMilestoneModalOpen, setIsMilestoneModalOpenState] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);

  const [isDailyUpdateModalOpen, setIsDailyUpdateModalOpenState] = useState(false);
  const [dailyUpdateToEdit, setDailyUpdateToEdit] = useState<DailyUpdate | null>(null);

  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpenState] = useState(false);
  const [defaultPhotoDailyUpdateId, setDefaultPhotoDailyUpdateId] = useState<string | undefined>(undefined);

  // Core Data States (Tenant-Isolated & Offline-Resilient)
  const [clients, setClients] = useState<Client[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_clients');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_CLIENTS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_clients`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((c: any) => !isDemoClientItem(c));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_leads');
      return saved ? JSON.parse(saved) : INITIAL_LEADS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_leads`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((l: any) => !isDemoLeadItem(l));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_tasks`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((t: any) => !isDemoTaskItem(t));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [teamMembers, setTeamMembers] = useState<StaffMember[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_team');
      return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS;
    }
    if (isRealTenant && activeTenantId) {
      const defaultOwner: StaffMember = {
        id: currentUser?.id || profile?.id || 'owner-1',
        organization_id: activeTenantId,
        full_name: currentUser?.fullName || profile?.full_name || currentUser?.email.split('@')[0] || 'Studio Owner',
        role: 'owner',
        status: 'Active',
        created_at: currentUser?.registeredAt || new Date().toISOString()
      };
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_team`);
      if (!saved) return [defaultOwner];
      try {
        const parsed = (JSON.parse(saved) || []).filter((m: any) => !isDemoStaffItem(m));
        return parsed.length > 0 ? parsed : [defaultOwner];
      } catch {
        return [defaultOwner];
      }
    }
    return [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_vendors');
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_vendors`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((v: any) => !isDemoVendorItem(v));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [clientPayments, setClientPayments] = useState<ClientPayment[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_client_payments');
      return saved ? JSON.parse(saved) : INITIAL_CLIENT_PAYMENTS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_client_payments`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((p: any) => !isDemoPaymentItem(p));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_purchases`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((p: any) => !isDemoPurchaseItem(p));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_projects`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((p: any) => !isDemoProjectItem(p));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_expenses`);
      if (!saved) return [];
      try {
        return (JSON.parse(saved) || []).filter((e: any) => !isDemoExpenseItem(e));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [boqItems, setBoqItems] = useState<BOQItem[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_boq_items');
      return saved ? JSON.parse(saved) : (INITIAL_BOQ_ITEMS as BOQItem[]);
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_boq_items`);
      if (!saved) return [];
      try {
        const demoBoqIds = new Set(INITIAL_BOQ_ITEMS.map((b: any) => b.id));
        return (JSON.parse(saved) || []).filter((b: any) => !demoBoqIds.has(b.id));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const key = isDemoAccount ? 'apni_estate_demo_materials' : (activeTenantId ? `apni_estate_tenant_${activeTenantId}_materials` : null);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });
  const [materialTransactions, setMaterialTransactions] = useState<MaterialTransaction[]>(() => {
    const key = isDemoAccount ? 'apni_estate_demo_material_tx' : (activeTenantId ? `apni_estate_tenant_${activeTenantId}_material_tx` : null);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const key = isDemoAccount ? 'apni_estate_demo_milestones' : (activeTenantId ? `apni_estate_tenant_${activeTenantId}_milestones` : null);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>(() => {
    const key = isDemoAccount ? 'apni_estate_demo_daily_updates' : (activeTenantId ? `apni_estate_tenant_${activeTenantId}_daily_updates` : null);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });
  const [projectPhotos, setProjectPhotos] = useState<ProjectPhoto[]>(() => {
    const key = isDemoAccount ? 'apni_estate_demo_project_photos' : (activeTenantId ? `apni_estate_tenant_${activeTenantId}_project_photos` : null);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_calendar');
      return saved ? JSON.parse(saved) : CALENDAR_EVENTS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_calendar`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_documents');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_documents`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (isDemoAccount) {
      const saved = localStorage.getItem('apni_estate_demo_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    }
    if (isRealTenant && activeTenantId) {
      const saved = localStorage.getItem(`apni_estate_tenant_${activeTenantId}_notifications`);
      return saved ? JSON.parse(saved) : [
        {
          id: `welcome-${activeTenantId}`,
          title: 'Welcome to Apni Estate',
          description: 'Your studio workspace is ready. Click "+ New Project" to create your first site.',
          time: 'Just now',
          read: false,
          type: 'update'
        }
      ];
    }
    return [];
  });

  // Dynamically switch and sanitize workspace data whenever active tenant / auth state changes
  useEffect(() => {
    if (isDemoAccount) {
      // Dedicated Demo account: apni@gmail.com
      const rawProjects = localStorage.getItem('apni_estate_demo_projects');
      setProjects(rawProjects ? JSON.parse(rawProjects) : INITIAL_PROJECTS);
      const rawExpenses = localStorage.getItem('apni_estate_demo_expenses');
      setExpenses(rawExpenses ? JSON.parse(rawExpenses) : INITIAL_EXPENSES);
      const rawClients = localStorage.getItem('apni_estate_demo_clients');
      setClients(rawClients ? JSON.parse(rawClients) : INITIAL_DEMO_CLIENTS);
      const rawBoq = localStorage.getItem('apni_estate_demo_boq_items');
      setBoqItems(rawBoq ? JSON.parse(rawBoq) : (INITIAL_BOQ_ITEMS as BOQItem[]));
      const rawLeads = localStorage.getItem('apni_estate_demo_leads');
      setLeads(rawLeads ? JSON.parse(rawLeads) : INITIAL_LEADS);
      const rawTasks = localStorage.getItem('apni_estate_demo_tasks');
      setTasks(rawTasks ? JSON.parse(rawTasks) : INITIAL_TASKS);
      const rawTeam = localStorage.getItem('apni_estate_demo_team');
      setTeamMembers(rawTeam ? JSON.parse(rawTeam) : INITIAL_STAFF_MEMBERS);
      const rawVendors = localStorage.getItem('apni_estate_demo_vendors');
      setVendors(rawVendors ? JSON.parse(rawVendors) : INITIAL_VENDORS);
      const rawPayments = localStorage.getItem('apni_estate_demo_client_payments');
      setClientPayments(rawPayments ? JSON.parse(rawPayments) : INITIAL_CLIENT_PAYMENTS);
      const rawPurchases = localStorage.getItem('apni_estate_demo_purchases');
      setPurchases(rawPurchases ? JSON.parse(rawPurchases) : INITIAL_PURCHASES);
      const rawDocs = localStorage.getItem('apni_estate_demo_documents');
      setDocuments(rawDocs ? JSON.parse(rawDocs) : INITIAL_DOCUMENTS);
      const rawCalendar = localStorage.getItem('apni_estate_demo_calendar');
      setCalendarEvents(rawCalendar ? JSON.parse(rawCalendar) : CALENDAR_EVENTS);
      const rawNotifs = localStorage.getItem('apni_estate_demo_notifications');
      setNotifications(rawNotifs ? JSON.parse(rawNotifs) : INITIAL_NOTIFICATIONS);
      setSelectedProjectId('proj-1');
    } else if (isRealTenant && activeTenantId) {
      // Fresh real tenant account (e.g. saranshagrahari589@gmail.com, 7-day trial or paid)
      const prefix = `apni_estate_tenant_${activeTenantId}_`;

      // Wipe legacy global un-scoped demo keys so they never cross-contaminate
      localStorage.removeItem('apni_estate_projects');
      localStorage.removeItem('apni_estate_expenses');
      localStorage.removeItem('apni_estate_clients');
      localStorage.removeItem('apni_estate_boq_items');
      localStorage.removeItem('apni_estate_leads');
      localStorage.removeItem('apni_estate_tasks');
      localStorage.removeItem('apni_estate_team');
      localStorage.removeItem('apni_estate_vendors');
      localStorage.removeItem('apni_estate_client_payments');
      localStorage.removeItem('apni_estate_purchases');

      // Projects
      const rawProjects = localStorage.getItem(`${prefix}projects`);
      let loadedProjects: Project[] = [];
      if (rawProjects) {
        try {
          loadedProjects = (JSON.parse(rawProjects) || []).filter((p: any) => !isDemoProjectItem(p));
        } catch {}
      }
      setProjects(loadedProjects);
      localStorage.setItem(`${prefix}projects`, JSON.stringify(loadedProjects));
      setSelectedProjectId(loadedProjects.length > 0 ? loadedProjects[0].id : null);

      // Expenses
      const rawExpenses = localStorage.getItem(`${prefix}expenses`);
      let loadedExpenses: Expense[] = [];
      if (rawExpenses) {
        try {
          loadedExpenses = (JSON.parse(rawExpenses) || []).filter((e: any) => !isDemoExpenseItem(e));
        } catch {}
      }
      setExpenses(loadedExpenses);
      localStorage.setItem(`${prefix}expenses`, JSON.stringify(loadedExpenses));

      // Clients
      const rawClients = localStorage.getItem(`${prefix}clients`);
      let loadedClients: Client[] = [];
      if (rawClients) {
        try {
          loadedClients = (JSON.parse(rawClients) || []).filter((c: any) => !isDemoClientItem(c));
        } catch {}
      }
      setClients(loadedClients);
      localStorage.setItem(`${prefix}clients`, JSON.stringify(loadedClients));

      // BOQ
      const rawBoq = localStorage.getItem(`${prefix}boq_items`);
      let loadedBoq: BOQItem[] = [];
      if (rawBoq) {
        try {
          const demoBoqIds = new Set(INITIAL_BOQ_ITEMS.map((b: any) => b.id));
          loadedBoq = (JSON.parse(rawBoq) || []).filter((b: any) => !demoBoqIds.has(b.id));
        } catch {}
      }
      setBoqItems(loadedBoq);
      localStorage.setItem(`${prefix}boq_items`, JSON.stringify(loadedBoq));

      // Leads
      const rawLeads = localStorage.getItem(`${prefix}leads`);
      let loadedLeads: Lead[] = [];
      if (rawLeads) {
        try {
          loadedLeads = (JSON.parse(rawLeads) || []).filter((l: any) => !isDemoLeadItem(l));
        } catch {}
      }
      setLeads(loadedLeads);
      localStorage.setItem(`${prefix}leads`, JSON.stringify(loadedLeads));

      // Tasks
      const rawTasks = localStorage.getItem(`${prefix}tasks`);
      let loadedTasks: Task[] = [];
      if (rawTasks) {
        try {
          loadedTasks = (JSON.parse(rawTasks) || []).filter((t: any) => !isDemoTaskItem(t));
        } catch {}
      }
      setTasks(loadedTasks);
      localStorage.setItem(`${prefix}tasks`, JSON.stringify(loadedTasks));

      // Team: Authenticated owner ONLY
      const defaultOwner: StaffMember = {
        id: currentUser?.id || profile?.id || 'owner-1',
        organization_id: activeTenantId,
        full_name: currentUser?.fullName || profile?.full_name || currentUser?.email.split('@')[0] || 'Studio Owner',
        role: 'owner',
        status: 'Active',
        created_at: currentUser?.registeredAt || new Date().toISOString()
      };
      const rawTeam = localStorage.getItem(`${prefix}team`);
      let loadedTeam: StaffMember[] = [defaultOwner];
      if (rawTeam) {
        try {
          const parsed = (JSON.parse(rawTeam) || []).filter((m: any) => !isDemoStaffItem(m));
          if (parsed.length > 0) loadedTeam = parsed;
        } catch {}
      }
      setTeamMembers(loadedTeam);
      localStorage.setItem(`${prefix}team`, JSON.stringify(loadedTeam));

      // Vendors
      const rawVen = localStorage.getItem(`${prefix}vendors`);
      let loadedVen: Vendor[] = [];
      if (rawVen) {
        try {
          loadedVen = (JSON.parse(rawVen) || []).filter((v: any) => !isDemoVendorItem(v));
        } catch {}
      }
      setVendors(loadedVen);
      localStorage.setItem(`${prefix}vendors`, JSON.stringify(loadedVen));

      // Payments
      const rawPay = localStorage.getItem(`${prefix}client_payments`);
      let loadedPay: ClientPayment[] = [];
      if (rawPay) {
        try {
          loadedPay = (JSON.parse(rawPay) || []).filter((p: any) => !isDemoPaymentItem(p));
        } catch {}
      }
      setClientPayments(loadedPay);
      localStorage.setItem(`${prefix}client_payments`, JSON.stringify(loadedPay));

      // Purchases
      const rawPo = localStorage.getItem(`${prefix}purchases`);
      let loadedPo: Purchase[] = [];
      if (rawPo) {
        try {
          loadedPo = (JSON.parse(rawPo) || []).filter((p: any) => !isDemoPurchaseItem(p));
        } catch {}
      }
      setPurchases(loadedPo);
      localStorage.setItem(`${prefix}purchases`, JSON.stringify(loadedPo));

      // Materials, tx, milestones, dpr, photos, docs, calendar, notifs
      const getSafeList = (subKey: string) => {
        const raw = localStorage.getItem(`${prefix}${subKey}`);
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch { return []; }
      };
      setMaterials(getSafeList('materials'));
      setMaterialTransactions(getSafeList('material_tx'));
      setMilestones(getSafeList('milestones'));
      setDailyUpdates(getSafeList('daily_updates'));
      setProjectPhotos(getSafeList('project_photos'));
      setDocuments(getSafeList('documents'));
      setCalendarEvents(getSafeList('calendar'));

      const rawNotifs = localStorage.getItem(`${prefix}notifications`);
      if (rawNotifs) {
        try { setNotifications(JSON.parse(rawNotifs)); } catch { setNotifications([]); }
      } else {
        const welcomeNotif = [
          {
            id: `welcome-${activeTenantId}`,
            title: 'Welcome to Apni Estate',
            description: 'Your studio workspace is ready. Click "+ New Project" to create your first site.',
            time: 'Just now',
            read: false,
            type: 'update' as const
          }
        ];
        setNotifications(welcomeNotif);
        localStorage.setItem(`${prefix}notifications`, JSON.stringify(welcomeNotif));
      }
    } else {
      // Unauthenticated state: completely clear in-memory state
      setProjects([]);
      setExpenses([]);
      setClients([]);
      setBoqItems([]);
      setLeads([]);
      setTasks([]);
      setTeamMembers([]);
      setVendors([]);
      setClientPayments([]);
      setPurchases([]);
      setMaterials([]);
      setMaterialTransactions([]);
      setMilestones([]);
      setDailyUpdates([]);
      setProjectPhotos([]);
      setDocuments([]);
      setCalendarEvents([]);
      setNotifications([]);
      setSelectedProjectId(null);
    }
  }, [isRealTenant, activeTenantId, isDemoAccount, profile?.id, profile?.full_name, currentUser?.id, currentUser?.fullName, currentUser?.email]);

  // Load Remote Data from Supabase only when Supabase is explicitly configured & active
  const loadRemoteData = useCallback(async () => {
    if (!isSupabaseConfigured || !isAuthenticated || !organization?.id) {
      return;
    }

    setLoadingData(true);
    try {
      const [
        remoteClients, 
        remoteProjects, 
        remoteExpenses, 
        remoteBOQ, 
        remoteLeads, 
        remoteTasks, 
        remoteTeam, 
        remoteDocs,
        remoteVendors,
        remotePayments,
        remotePurchases
      ] = await Promise.all([
        clientService.getClients(organization.id).catch(() => []),
        projectService.getProjects(organization.id).catch(() => []),
        expenseService.getExpenses(organization.id).catch(() => []),
        boqService.getBOQItems(organization.id).catch(() => []),
        leadService.getLeads(organization.id).catch(() => []),
        taskService.getTasks({ organizationId: organization.id }).catch(() => []),
        teamService.getTeamMembers(organization.id).catch(() => []),
        documentService.getDocuments({ organizationId: organization.id }).catch(() => []),
        vendorService.getVendors(organization.id).catch(() => []),
        paymentService.getPayments(organization.id).catch(() => []),
        purchaseService.getPurchases(organization.id).catch(() => [])
      ]);

      // Only override local cache if remote actually has records
      if (remoteProjects && remoteProjects.length > 0) {
        const projectsWithAuthoritativeFinancials = remoteProjects.map(p => {
          const spent = calculateProjectSpent(p.id, remoteExpenses);
          
          const updatedRooms = (p.rooms || []).map(r => {
            const roomSpent = remoteExpenses
              .filter(e => e.room_id === r.id)
              .reduce((sum, e) => sum + e.amount, 0);
            return {
              ...r,
              spent: roomSpent
            };
          });

          return {
            ...p,
            spent,
            rooms: updatedRooms,
            boq_items: remoteBOQ.filter(b => b.project_id === p.id)
          };
        });

        setClients(remoteClients);
        setProjects(projectsWithAuthoritativeFinancials);
        setExpenses(remoteExpenses);
        setBoqItems(remoteBOQ);
        setLeads(remoteLeads);
        setTasks(remoteTasks);
        setTeamMembers(remoteTeam);
        setDocuments(remoteDocs);
        setVendors(remoteVendors);
        setClientPayments(remotePayments);
        setPurchases(remotePurchases);

        const activeProjId = selectedProjectId || projectsWithAuthoritativeFinancials[0]?.id;
        if (activeProjId) {
          try {
            const [remoteMats, remoteTx, remoteMilestones, remoteDpr, remotePhotos] = await Promise.all([
              materialService.getMaterials(activeProjId).catch(() => []),
              materialService.getMaterialTransactions(activeProjId).catch(() => []),
              milestoneService.getMilestones(activeProjId).catch(() => []),
              dailyUpdateService.getDailyUpdates(activeProjId).catch(() => []),
              photoService.getProjectPhotos(activeProjId).catch(() => [])
            ]);
            setMaterials(remoteMats);
            setMaterialTransactions(remoteTx);
            setMilestones(remoteMilestones);
            setDailyUpdates(remoteDpr);
            setProjectPhotos(remotePhotos);
          } catch (opErr) {
            console.warn('[AppContext] Operational data load note:', opErr);
          }
        }

        if (!selectedProjectId || !projectsWithAuthoritativeFinancials.some(p => p.id === selectedProjectId)) {
          setSelectedProjectId(projectsWithAuthoritativeFinancials[0].id);
        }
      }
    } catch (err) {
      console.warn('[AppContext] Supabase remote sync skipped (using local cache):', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated, organization?.id, selectedProjectId]);

  useEffect(() => {
    if (isSupabaseConfigured && isAuthenticated && organization?.id) {
      loadRemoteData();
    }
  }, [isAuthenticated, organization?.id, loadRemoteData]);

  // Continuously sync all application state to tenant-scoped LocalStorage so data is never lost
  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('clients', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(clients));
  }, [clients, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('projects', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(projects));
  }, [projects, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('expenses', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(expenses));
  }, [expenses, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('boq_items', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(boqItems));
  }, [boqItems, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('calendar', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(calendarEvents));
  }, [calendarEvents, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('documents', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(documents));
  }, [documents, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('leads', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(leads));
  }, [leads, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('tasks', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('team', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(teamMembers));
  }, [teamMembers, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('vendors', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(vendors));
  }, [vendors, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('client_payments', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(clientPayments));
  }, [clientPayments, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('purchases', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(purchases));
  }, [purchases, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('notifications', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(notifications));
  }, [notifications, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('materials', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(materials));
  }, [materials, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('material_tx', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(materialTransactions));
  }, [materialTransactions, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('milestones', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(milestones));
  }, [milestones, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('daily_updates', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(dailyUpdates));
  }, [dailyUpdates, isDemoAccount, activeTenantId, isRealTenant]);

  useEffect(() => {
    if (!isDemoAccount && (!isRealTenant || !activeTenantId)) return;
    const key = getTenantStorageKey('project_photos', isDemoAccount, activeTenantId);
    localStorage.setItem(key, JSON.stringify(projectPhotos));
  }, [projectPhotos, isDemoAccount, activeTenantId, isRealTenant]);

  // Open Project Detail Page
  const openProjectDetail = (
    projectId: string, 
    initialTab: ProjectDetailTab = 'Overview'
  ) => {
    setSelectedProjectId(projectId);
    setInitialProjectDetailTab(initialTab);
    setCurrentPage('project-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddExpense = (open: boolean, defaultProjId?: string, editExp?: Expense | null) => {
    setDefaultExpenseProjectId(defaultProjId || null);
    setExpenseToEdit(editExp || null);
    setIsAddExpenseModalOpenState(open);
  };

  const handleOpenBOQModal = (open: boolean, projId?: string, defaultRoomId?: string, itemToEdit?: BOQItem | null) => {
    setBOQModalProjectId(projId || selectedProjectId || (projects.length > 0 ? projects[0].id : ''));
    setBOQModalDefaultRoomId(defaultRoomId);
    setBOQItemToEdit(itemToEdit || null);
    setIsBOQModalOpenState(open);
  };

  // ============================================================================
  // CLIENT CRUD
  // ============================================================================
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    let created: Client | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await clientService.createClient({
          organization_id: organization.id,
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          address: clientData.address,
          notes: clientData.notes
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase client creation fallback:', e?.message);
      }
    }

    const finalClient: Client = created || {
      ...clientData,
      id: `client-${Date.now()}`,
      organization_id: organization?.id || 'default-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClients(prev => [finalClient, ...prev]);
    return finalClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await clientService.updateClient(id, updates);
      } catch (e: any) {
        console.warn('[AppContext] Supabase client update fallback:', e?.message);
      }
    }

    let updatedClient: Client | undefined;
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        updatedClient = { ...c, ...updates, updated_at: new Date().toISOString() };
        return updatedClient;
      }
      return c;
    }));
    return updatedClient || ({ ...updates, id } as Client);
  };

  const deleteClient = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await clientService.deleteClient(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase client delete fallback:', e?.message);
      }
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // ============================================================================
  // LEAD CRUD & CONVERSION
  // ============================================================================
  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
    let created: Lead | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await leadService.createLead({
          organization_id: organization.id,
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          source: leadData.source,
          requirement: leadData.requirement,
          estimated_budget: leadData.estimated_budget,
          status: leadData.status,
          notes: leadData.notes,
          assigned_to: leadData.assigned_to
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase lead creation fallback:', e?.message);
      }
    }

    const finalLead: Lead = created || {
      ...leadData,
      id: `lead-${Date.now()}`,
      organization_id: organization?.id || 'default-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLeads(prev => [finalLead, ...prev]);
    return finalLead;
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await leadService.updateLead(id, updates);
      } catch (e: any) {
        console.warn('[AppContext] Supabase lead update fallback:', e?.message);
      }
    }

    let updatedLead: Lead | undefined;
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        updatedLead = { ...l, ...updates, updated_at: new Date().toISOString() };
        return updatedLead;
      }
      return l;
    }));
    return updatedLead || ({ ...updates, id } as Lead);
  };

  const deleteLead = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await leadService.deleteLead(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase lead delete fallback:', e?.message);
      }
    }
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convertLeadToClient = async (leadId: string): Promise<{ client: Client; updatedLead: Lead }> => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) throw new Error('Lead not found.');
    if (targetLead.converted_client_id) throw new Error('Lead already converted.');

    const newClient: Client = {
      id: `client-${Date.now()}`,
      organization_id: organization?.id || 'default-org',
      name: targetLead.name,
      phone: targetLead.phone || '',
      email: targetLead.email || '',
      notes: `Converted from Lead (Requirement: ${targetLead.requirement || 'N/A'})${targetLead.notes ? `\n\nNotes: ${targetLead.notes}` : ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedLead: Lead = {
      ...targetLead,
      status: 'Won',
      converted_client_id: newClient.id,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && organization?.id) {
      try {
        await leadService.convertToClient(leadId, organization.id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase convertLeadToClient fallback:', e?.message);
      }
    }

    setClients(prev => [newClient, ...prev]);
    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
    return { client: newClient, updatedLead };
  };

  // ============================================================================
  // TASK CRUD
  // ============================================================================
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    let created: Task | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await taskService.createTask({
          organization_id: organization.id,
          project_id: taskData.project_id || taskData.projectId,
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assigned_to,
          due_date: taskData.due_date || taskData.dueDate,
          priority: taskData.priority,
          status: taskData.status
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase task creation fallback:', e?.message);
      }
    }

    const newTask: Task = created || {
      ...taskData,
      id: `task-${Date.now()}`,
      organization_id: organization?.id || 'default-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await taskService.updateTask(id, {
          project_id: updates.project_id || updates.projectId,
          title: updates.title,
          description: updates.description,
          assigned_to: updates.assigned_to,
          due_date: updates.due_date || updates.dueDate,
          priority: updates.priority,
          status: updates.status
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase task update fallback:', e?.message);
      }
    }

    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        updatedTask = { ...t, ...updates, updated_at: new Date().toISOString() };
        return updatedTask;
      }
      return t;
    }));
    return updatedTask || ({ ...updates, id } as Task);
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await taskService.deleteTask(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase task delete fallback:', e?.message);
      }
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================
  const addDocument = async (input: {
    organizationId: string;
    projectId?: string;
    projectName?: string;
    title: string;
    category: DocumentCategory;
    file: File;
    userId?: string;
  }): Promise<DocumentItem> => {
    let created: DocumentItem | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await documentService.uploadDocument({
          organizationId: organization.id,
          projectId: input.projectId,
          title: input.title,
          category: input.category,
          file: input.file,
          userId: input.userId
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase document upload fallback:', e?.message);
      }
    }

    const mockDoc: DocumentItem = created || {
      id: `doc-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: input.projectId,
      projectId: input.projectId || '',
      projectName: input.projectName || 'General Studio Vault',
      title: input.title,
      category: input.category,
      type: input.category,
      file_name: input.file.name,
      file_size: input.file.size,
      size: `${(input.file.size / (1024 * 1024)).toFixed(1)} MB`,
      file_type: input.file.type,
      updatedAt: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    setDocuments(prev => [mockDoc, ...prev]);
    return mockDoc;
  };

  const deleteDocument = async (id: string, storagePath?: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await documentService.deleteDocument(id, storagePath);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteDocument fallback:', e?.message);
      }
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // ============================================================================
  // TEAM ROLE ACTIONS
  // ============================================================================
  const updateMemberRole = async (profileId: string, newRole: UserRole): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await teamService.updateMemberRole(profileId, newRole);
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateMemberRole fallback:', e?.message);
      }
    }
    setTeamMembers(prev => prev.map(m => m.id === profileId ? { ...m, role: newRole } : m));
  };

  // ============================================================================
  // VENDOR CRUD ACTIONS
  // ============================================================================
  const addVendor = async (vendorData: Partial<Vendor>): Promise<Vendor> => {
    let created: Vendor | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await vendorService.createVendor(organization.id, vendorData as any);
      } catch (e: any) {
        console.warn('[AppContext] Supabase addVendor fallback:', e?.message);
      }
    }

    const mockVendor: Vendor = created || {
      id: `ven-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      name: vendorData.name || 'New Supplier',
      contact_person: vendorData.contact_person,
      phone: vendorData.phone,
      email: vendorData.email,
      address: vendorData.address,
      category: vendorData.category || 'Materials',
      gst_number: vendorData.gst_number,
      rating: vendorData.rating || 5,
      notes: vendorData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setVendors(prev => [mockVendor, ...prev]);
    return mockVendor;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<Vendor> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await vendorService.updateVendor(id, updates as any);
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateVendor fallback:', e?.message);
      }
    }

    let updatedVendor: Vendor | undefined;
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        updatedVendor = { ...v, ...updates, updated_at: new Date().toISOString() };
        return updatedVendor;
      }
      return v;
    }));
    return updatedVendor || ({ ...updates, id } as Vendor);
  };

  const deleteVendor = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await vendorService.deleteVendor(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteVendor fallback:', e?.message);
      }
    }
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  // ============================================================================
  // CLIENT PAYMENT CRUD ACTIONS
  // ============================================================================
  const addClientPayment = async (paymentData: Partial<ClientPayment>): Promise<ClientPayment> => {
    let created: ClientPayment | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await paymentService.createPayment(organization.id, paymentData as any);
      } catch (e: any) {
        console.warn('[AppContext] Supabase addClientPayment fallback:', e?.message);
      }
    }

    const foundProj = projects.find(p => p.id === paymentData.project_id);
    const foundCli = clients.find(c => c.id === paymentData.client_id || c.id === foundProj?.client_id);
    
    const mockPayment: ClientPayment = created || {
      id: `pay-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: paymentData.project_id || '',
      projectName: foundProj?.name || 'Interior Project',
      client_id: paymentData.client_id || foundProj?.client_id,
      clientName: foundCli?.name || foundProj?.client || 'Client',
      title: paymentData.title || 'Milestone Payment',
      amount: Number(paymentData.amount) || 0,
      due_date: paymentData.due_date || new Date().toISOString().split('T')[0],
      paid_amount: Number(paymentData.paid_amount) || 0,
      paid_date: paymentData.paid_date,
      status: paymentData.status || 'Pending',
      payment_method: paymentData.payment_method || 'Bank Transfer / NEFT',
      payment_reference: paymentData.payment_reference,
      notes: paymentData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setClientPayments(prev => [mockPayment, ...prev]);
    return mockPayment;
  };

  const updateClientPayment = async (id: string, updates: Partial<ClientPayment>): Promise<ClientPayment> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await paymentService.updatePayment(id, updates as any);
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateClientPayment fallback:', e?.message);
      }
    }

    let updatedPayment: ClientPayment | undefined;
    setClientPayments(prev => prev.map(p => {
      if (p.id === id) {
        updatedPayment = { ...p, ...updates, updated_at: new Date().toISOString() };
        return updatedPayment;
      }
      return p;
    }));
    return updatedPayment || ({ ...updates, id } as ClientPayment);
  };

  const deleteClientPayment = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await paymentService.deletePayment(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteClientPayment fallback:', e?.message);
      }
    }
    setClientPayments(prev => prev.filter(p => p.id !== id));
  };

  // ============================================================================
  // PURCHASE CRUD ACTIONS
  // ============================================================================
  const addPurchase = async (purchaseData: any): Promise<Purchase> => {
    let created: Purchase | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await purchaseService.savePurchaseOrder(organization.id, purchaseData);
      } catch (e: any) {
        console.warn('[AppContext] Supabase addPurchase fallback:', e?.message);
      }
    }

    const foundProj = projects.find(p => p.id === purchaseData.project_id);
    const foundVen = vendors.find(v => v.id === purchaseData.vendor_id);
    
    const items = (purchaseData.items || []).map((it: any, idx: number) => ({
      id: `poi-${Date.now()}-${idx}`,
      purchase_id: `po-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      item_name: it.item_name,
      description: it.description || '',
      quantity: Number(it.quantity) || 1,
      unit: it.unit || 'pcs',
      rate: Number(it.rate) || 0,
      total: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
      created_at: new Date().toISOString()
    }));

    const derivedTotal = items.reduce((sum: number, it: any) => sum + it.total, 0);

    const mockPurchase: Purchase = created || {
      id: `po-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: purchaseData.project_id,
      projectName: foundProj?.name || 'Project Site',
      vendor_id: purchaseData.vendor_id,
      vendorName: foundVen?.name || 'Supplier',
      po_number: purchaseData.po_number || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      order_date: purchaseData.order_date || new Date().toISOString().split('T')[0],
      expected_delivery: purchaseData.expected_delivery,
      status: purchaseData.status || 'Draft',
      payment_status: purchaseData.payment_status || 'Pending',
      notes: purchaseData.notes,
      total_amount: derivedTotal,
      items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPurchases(prev => [mockPurchase, ...prev]);
    return mockPurchase;
  };

  const updatePurchase = async (id: string, updates: any): Promise<Purchase> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await purchaseService.savePurchaseOrder(organization.id, { ...updates, id });
      } catch (e: any) {
        console.warn('[AppContext] Supabase updatePurchase fallback:', e?.message);
      }
    }

    let resultPurchase: Purchase | null = null;
    setPurchases(prev => prev.map(p => {
      if (p.id === id) {
        const items = updates.items ? updates.items.map((it: any, idx: number) => ({
          id: it.id || `poi-${Date.now()}-${idx}`,
          purchase_id: id,
          item_name: it.item_name,
          description: it.description || '',
          quantity: Number(it.quantity) || 1,
          unit: it.unit || 'pcs',
          rate: Number(it.rate) || 0,
          total: (Number(it.quantity) || 1) * (Number(it.rate) || 0)
        })) : p.items;

        const total = items ? items.reduce((sum: number, it: any) => sum + it.total, 0) : p.total_amount;

        const updated: Purchase = {
          ...p,
          ...updates,
          items,
          total_amount: total,
          updated_at: new Date().toISOString()
        };
        resultPurchase = updated;
        return updated;
      }
      return p;
    }));
    return resultPurchase || ({ ...updates, id } as Purchase);
  };

  const deletePurchase = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await purchaseService.deletePurchase(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deletePurchase fallback:', e?.message);
      }
    }
    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  // ============================================================================
  // PROJECT CRUD
  // ============================================================================
  const addProject = async (newProjectData: Omit<Project, 'id' | 'spent' | 'progress'>): Promise<Project> => {
    const budget = Number(newProjectData.budget) || 0;
    const todayIso = new Date().toISOString().split('T')[0];
    const defaultDeadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fallbackId = `proj-${Date.now()}`;

    let createdDbProject: any = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        createdDbProject = await projectService.createProject({
          organization_id: organization.id,
          client_id: newProjectData.client_id,
          name: newProjectData.name,
          location: newProjectData.location,
          project_type: newProjectData.type,
          budget,
          contract_value: newProjectData.contract_value,
          start_date: newProjectData.startDate,
          deadline: newProjectData.deadline,
          description: newProjectData.description,
          cover_image_url: newProjectData.coverImage
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase project creation fallback:', e?.message);
      }
    }

    const finalProject: Project = {
      ...newProjectData,
      id: createdDbProject?.id || fallbackId,
      organization_id: organization?.id || 'default-org',
      client_id: createdDbProject?.client_id || newProjectData.client_id,
      name: createdDbProject?.name || newProjectData.name,
      client: createdDbProject?.client?.name || newProjectData.client || 'Private Client',
      clientPhone: createdDbProject?.client?.phone || newProjectData.clientPhone || '',
      location: createdDbProject?.location || newProjectData.location || 'Site Location',
      city: newProjectData.city || newProjectData.location || 'Mumbai',
      type: newProjectData.type || 'Residential',
      budget,
      spent: 0,
      progress: 0,
      status: 'On Track',
      startDate: createdDbProject?.start_date || newProjectData.startDate || todayIso,
      deadline: createdDbProject?.deadline || newProjectData.deadline || defaultDeadline,
      coverImage: createdDbProject?.cover_image_url || newProjectData.coverImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      contract_value: createdDbProject?.contract_value ? Number(createdDbProject.contract_value) : newProjectData.contract_value,
      description: createdDbProject?.description || newProjectData.description || 'Custom interior design project with turnkey execution.',
      rooms: newProjectData.rooms || [],
      boq_items: newProjectData.boq_items || [],
      notes: [],
      photos: []
    };

    setProjects(prev => [finalProject, ...prev]);
    setSelectedProjectId(finalProject.id);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    return finalProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await projectService.updateProject(id, {
          name: updates.name,
          client_id: updates.client_id,
          location: updates.location,
          project_type: updates.type,
          budget: updates.budget,
          contract_value: updates.contract_value,
          start_date: updates.startDate,
          deadline: updates.deadline,
          progress: updates.progress,
          status: updates.status,
          description: updates.description,
          cover_image_url: updates.coverImage
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase project update fallback:', e?.message);
      }
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await projectService.deleteProject(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase project delete fallback:', e?.message);
      }
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    setExpenses(prev => prev.filter(e => e.projectId !== id));
    setBoqItems(prev => prev.filter(b => b.project_id !== id));

    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setCurrentPage('projects');
    }
  };

  // ============================================================================
  // ROOM CRUD
  // ============================================================================
  const addRoom = async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> => {
    let createdRoom: Room | null = null;

    if (isSupabaseConfigured && organization?.id) {
      try {
        createdRoom = await roomService.createRoom({
          organization_id: organization.id,
          project_id: roomData.project_id,
          name: roomData.name,
          room_type: roomData.room_type,
          budget: roomData.budget,
          progress: roomData.progress,
          notes: roomData.notes
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase room creation fallback:', e?.message);
      }
    }

    const finalRoom: Room = createdRoom || {
      ...roomData,
      id: `room-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProjects(prev => prev.map(p => {
      if (p.id === roomData.project_id) {
        return {
          ...p,
          rooms: [...(p.rooms || []), finalRoom]
        };
      }
      return p;
    }));

    return finalRoom;
  };

  const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
    let updatedRoom: Room | null = null;

    if (isSupabaseConfigured && organization?.id) {
      try {
        updatedRoom = await roomService.updateRoom(id, {
          name: updates.name,
          room_type: updates.room_type,
          budget: updates.budget,
          progress: updates.progress,
          notes: updates.notes
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase room update fallback:', e?.message);
      }
    }

    const finalRoom: Room = updatedRoom || ({
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as Room);

    setProjects(prev => prev.map(p => {
      if (p.rooms?.some(r => r.id === id)) {
        return {
          ...p,
          rooms: p.rooms.map(r => r.id === id ? { ...r, ...finalRoom } : r)
        };
      }
      return p;
    }));

    return finalRoom;
  };

  const deleteRoom = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await roomService.deleteRoom(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase room delete fallback:', e?.message);
      }
    }

    setProjects(prev => prev.map(p => {
      if (p.rooms?.some(r => r.id === id)) {
        return {
          ...p,
          rooms: p.rooms.filter(r => r.id !== id)
        };
      }
      return p;
    }));

    // Update affected BOQ and expenses that had this room_id to null
    setBoqItems(prev => prev.map(b => b.room_id === id ? { ...b, room_id: undefined } : b));
    setExpenses(prev => prev.map(e => e.room_id === id ? { ...e, room_id: undefined } : e));
  };

  // ============================================================================
  // BOQ CRUD
  // ============================================================================
  const addBOQItem = async (itemData: {
    project_id: string;
    room_id?: string;
    item_name: string;
    description?: string;
    category?: string;
    quantity: number;
    unit?: string;
    rate: number;
    estimated_cost?: number;
    material_rate?: number;
    labour_rate?: number;
    selling_rate?: number;
    gst_percent?: number;
  }): Promise<BOQItem> => {
    let createdItem: BOQItem | null = null;

    if (isSupabaseConfigured && organization?.id) {
      try {
        createdItem = await boqService.createBOQItem({
          organization_id: organization.id,
          project_id: itemData.project_id,
          room_id: itemData.room_id,
          item_name: itemData.item_name,
          description: itemData.description,
          category: itemData.category,
          quantity: itemData.quantity,
          unit: itemData.unit,
          rate: itemData.rate,
          estimated_cost: itemData.estimated_cost,
          material_rate: itemData.material_rate,
          labour_rate: itemData.labour_rate,
          selling_rate: itemData.selling_rate,
          gst_percent: itemData.gst_percent
        });
      } catch (e: any) {
        console.warn('[AppContext] Supabase BOQ creation fallback:', e?.message);
      }
    }

    const qty = Number(itemData.quantity) || 0;
    const rate = Number(itemData.rate) || 0;
    const finalItem: BOQItem = createdItem || {
      id: `boq-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: itemData.project_id,
      room_id: itemData.room_id,
      item_name: itemData.item_name,
      description: itemData.description,
      category: itemData.category || 'Civil Work',
      quantity: qty,
      unit: itemData.unit || 'Nos',
      rate: rate,
      estimated_cost: itemData.estimated_cost !== undefined ? itemData.estimated_cost : qty * rate,
      material_rate: itemData.material_rate,
      labour_rate: itemData.labour_rate,
      selling_rate: itemData.selling_rate,
      gst_percent: itemData.gst_percent ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBoqItems(prev => [...prev, finalItem]);
    return finalItem;
  };

  const updateBOQItem = async (id: string, updates: Partial<BOQItem>): Promise<BOQItem> => {
    let updatedItem: BOQItem | null = null;

    if (isSupabaseConfigured && organization?.id) {
      try {
        updatedItem = await boqService.updateBOQItem(id, updates);
      } catch (e: any) {
        console.warn('[AppContext] Supabase BOQ update fallback:', e?.message);
      }
    }

    const existing = boqItems.find(b => b.id === id);
    const qty = updates.quantity !== undefined ? Number(updates.quantity) : (existing?.quantity || 0);
    const rate = updates.rate !== undefined ? Number(updates.rate) : (existing?.rate || 0);
    const finalItem: BOQItem = updatedItem || ({
      ...(existing || {}),
      ...updates,
      id,
      quantity: qty,
      rate: rate,
      estimated_cost: updates.estimated_cost !== undefined ? updates.estimated_cost : qty * rate,
      approved_at: undefined,
      approved_by: undefined,
      updated_at: new Date().toISOString()
    } as BOQItem);

    setBoqItems(prev => prev.map(b => b.id === id ? finalItem : b));
    return finalItem;
  };

  const deleteBOQItem = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await boqService.deleteBOQItem(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase BOQ delete fallback:', e?.message);
      }
    }
    setBoqItems(prev => prev.filter(b => b.id !== id));
  };

  const approveProjectBOQ = async (projectId: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        const approvedItems = await boqService.approveProjectBOQ(projectId);
        setBoqItems(prev => prev.map(item =>
          item.project_id === projectId
            ? approvedItems.find(approved => approved.id === item.id) || item
            : item
        ));
        return;
      } catch (e: any) {
        console.warn('[AppContext] Supabase BOQ approval fallback:', e?.message);
      }
    }
    const approvedAt = new Date().toISOString();
    setBoqItems(prev => prev.map(item => item.project_id === projectId
      ? { ...item, approved_at: approvedAt, approved_by: profile?.id || 'demo-approver' }
      : item
    ));
  };

  // ============================================================================
  // EXPENSE CRUD (REAL FINANCIAL LEDGER)
  // ============================================================================
  const addExpense = async (newExpenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    let createdExpense: Expense | null = null;

    const targetProj = projects.find(p => p.id === newExpenseData.projectId);
    const projectName = targetProj ? targetProj.name : newExpenseData.projectName || 'Project';

    if (isSupabaseConfigured && organization?.id) {
      try {
        createdExpense = await expenseService.createExpense({
          organization_id: organization.id,
          project_id: newExpenseData.projectId,
          room_id: newExpenseData.room_id,
          title: newExpenseData.title,
          category: newExpenseData.category,
          amount: Number(newExpenseData.amount),
          vendor: newExpenseData.vendor,
          expense_date: newExpenseData.date,
          payment_status: newExpenseData.paymentStatus,
          notes: newExpenseData.notes,
          receipt_url: newExpenseData.receiptUrl
        });
        createdExpense.projectName = projectName;
      } catch (e: any) {
        console.warn('[AppContext] Supabase expense creation fallback:', e?.message);
      }
    }

    const finalExpense: Expense = createdExpense || {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      projectName,
      amount: Number(newExpenseData.amount) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update expense ledger in state
    setExpenses(prev => {
      const nextExpenses = [finalExpense, ...prev];

      // Update project and room totals immediately
      setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === finalExpense.projectId) {
          const newSpent = calculateProjectSpent(p.id, nextExpenses);
          return {
            ...p,
            spent: newSpent
          };
        }
        return p;
      }));

      return nextExpenses;
    });

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Expense Added: ${finalExpense.title}`,
        description: `₹${finalExpense.amount.toLocaleString('en-IN')} added under ${finalExpense.category} for ${projectName}.`,
        time: 'Just now',
        read: false,
        type: 'update',
        projectId: finalExpense.projectId
      },
      ...prev
    ]);

    return finalExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    let updatedExpense: Expense | null = null;

    const targetProj = projects.find(p => p.id === (updates.projectId || selectedProjectId));
    const projectName = targetProj ? targetProj.name : updates.projectName || 'Project';

    if (isSupabaseConfigured && organization?.id) {
      try {
        updatedExpense = await expenseService.updateExpense(id, {
          project_id: updates.projectId,
          room_id: updates.room_id,
          title: updates.title,
          category: updates.category,
          amount: updates.amount,
          vendor: updates.vendor,
          expense_date: updates.date,
          payment_status: updates.paymentStatus,
          notes: updates.notes,
          receipt_url: updates.receiptUrl
        });
        updatedExpense.projectName = projectName;
      } catch (e: any) {
        console.warn('[AppContext] Supabase expense update fallback:', e?.message);
      }
    }

    const existing = expenses.find(e => e.id === id);
    const finalExpense: Expense = updatedExpense || ({
      ...(existing || {}),
      ...updates,
      id,
      projectName,
      amount: updates.amount !== undefined ? Number(updates.amount) : (existing?.amount || 0),
      updated_at: new Date().toISOString()
    } as Expense);

    setExpenses(prev => {
      const nextExpenses = prev.map(e => e.id === id ? finalExpense : e);

      // Recalculate project spending totals immediately
      setProjects(prevProjects => prevProjects.map(p => {
        const newSpent = calculateProjectSpent(p.id, nextExpenses);
        return {
          ...p,
          spent: newSpent
        };
      }));

      return nextExpenses;
    });

    return finalExpense;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await expenseService.deleteExpense(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase expense delete fallback:', e?.message);
      }
    }

    setExpenses(prev => {
      const nextExpenses = prev.filter(e => e.id !== id);

      // Recalculate project spending totals immediately
      setProjects(prevProjects => prevProjects.map(p => {
        const newSpent = calculateProjectSpent(p.id, nextExpenses);
        return {
          ...p,
          spent: newSpent
        };
      }));

      return nextExpenses;
    });
  };

  // ============================================================================
  // MATERIAL ACTIONS
  // ============================================================================
  const handleOpenMaterialModal = (open: boolean, matToEdit?: Material | null) => {
    setMaterialToEdit(matToEdit || null);
    setIsMaterialModalOpenState(open);
  };

  const handleOpenMaterialTxModal = (open: boolean, mat?: Material | null, type: 'in' | 'out' = 'in') => {
    setSelectedMaterialForTransaction(mat || null);
    setMaterialTransactionType(type);
    setIsMaterialTransactionModalOpenState(open);
  };

  const addMaterial = async (input: CreateMaterialInput): Promise<Material> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        const { material, initialTransaction } = await materialService.createMaterial(input);
        setMaterials(prev => [...prev, material]);
        if (initialTransaction) {
          setMaterialTransactions(prev => [initialTransaction, ...prev]);
        }
        return material;
      } catch (e: any) {
        console.warn('[AppContext] Supabase addMaterial fallback:', e?.message);
      }
    }

    const newMat: Material = {
      id: `mat-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: input.project_id,
      room_id: input.room_id,
      name: input.name,
      category: input.category,
      unit: input.unit || 'pcs',
      quantity_ordered: input.quantity_ordered || 0,
      minimum_stock: input.minimum_stock || 0,
      notes: input.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setMaterials(prev => [...prev, newMat]);

    if (input.initial_quantity && input.initial_quantity > 0) {
      const initialTx: MaterialTransaction = {
        id: `tx-${Date.now()}`,
        organization_id: organization?.id || 'demo-org',
        material_id: newMat.id,
        project_id: input.project_id,
        room_id: input.room_id,
        transaction_type: 'in',
        quantity: input.initial_quantity,
        transaction_date: new Date().toISOString().split('T')[0],
        notes: 'Initial / Opening Stock',
        created_at: new Date().toISOString()
      };
      setMaterialTransactions(prev => [initialTx, ...prev]);
    }
    return newMat;
  };

  const updateMaterial = async (id: string, updates: Partial<CreateMaterialInput>): Promise<Material> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        const updated = await materialService.updateMaterial(id, updates);
        setMaterials(prev => prev.map(m => m.id === id ? updated : m));
        return updated;
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateMaterial fallback:', e?.message);
      }
    }

    const existing = materials.find(m => m.id === id);
    const updated: Material = {
      ...(existing || {}),
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as Material;
    setMaterials(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  };

  const deleteMaterial = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await materialService.deleteMaterial(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteMaterial fallback:', e?.message);
      }
    } else {
      const hasTx = materialTransactions.some(t => t.material_id === id);
      if (hasTx) {
        throw new Error('Cannot delete material with existing stock transaction history. Use Stock OUT to adjust balance.');
      }
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addMaterialTransaction = async (input: CreateMaterialTransactionInput): Promise<MaterialTransaction> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        const newTx = await materialService.createTransaction(input);
        setMaterialTransactions(prev => [newTx, ...prev]);
        return newTx;
      } catch (e: any) {
        console.warn('[AppContext] Supabase addMaterialTransaction fallback:', e?.message);
      }
    }

    // Local stock calculation & validation
    const summary = materialService.calculateStock(input.material_id, materialTransactions, 0);
    if (input.transaction_type === 'out' && input.quantity > summary.available) {
      throw new Error(`Only ${summary.available} available. Cannot stock out ${input.quantity}.`);
    }
    const newTx: MaterialTransaction = {
      id: `tx-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      material_id: input.material_id,
      project_id: input.project_id,
      room_id: input.room_id,
      transaction_type: input.transaction_type,
      quantity: input.quantity,
      transaction_date: input.transaction_date || new Date().toISOString().split('T')[0],
      notes: input.notes,
      created_at: new Date().toISOString()
    };
    setMaterialTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const recordMaterialWastage = async (input: {
    materialId: string;
    quantity: number;
    reason: string;
    wastageDate: string;
  }): Promise<MaterialWastage> => {
    const material = materials.find(item => item.id === input.materialId);
    if (!material) throw new Error('Select a material that belongs to a project in this workspace.');

    if (isSupabaseConfigured && organization?.id) {
      try {
        const recorded = await wastageService.recordWastage(input);
        const transaction: MaterialTransaction = {
          id: recorded.material_transaction_id,
          organization_id: recorded.organization_id,
          material_id: recorded.material_id,
          project_id: recorded.project_id,
          room_id: material.room_id,
          transaction_type: 'out',
          quantity: recorded.quantity,
          transaction_date: recorded.wastage_date,
          notes: `Wastage: ${recorded.reason}`,
          created_at: recorded.created_at
        };
        setMaterialTransactions(previous => [transaction, ...previous]);
        return {
          ...recorded,
          material_name: material.name,
          material_unit: material.unit,
          recorded_by_name: profile?.full_name
        };
      } catch (e: any) {
        console.warn('[AppContext] Supabase recordMaterialWastage fallback:', e?.message);
      }
    }

    const stock = materialService.calculateStock(input.materialId, materialTransactions);
    if (input.quantity > stock.available) {
      throw new Error(`Only ${stock.available} ${material.unit} is available; wastage cannot exceed stock on hand.`);
    }
    if (!input.reason.trim()) throw new Error('A reason is required to record wastage.');
    const now = new Date().toISOString();
    const transaction: MaterialTransaction = {
      id: `wastage-tx-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      material_id: material.id,
      project_id: material.project_id,
      room_id: material.room_id,
      transaction_type: 'out',
      quantity: input.quantity,
      transaction_date: input.wastageDate,
      notes: `Wastage: ${input.reason.trim()}`,
      created_at: now
    };
    setMaterialTransactions(previous => [transaction, ...previous]);
    return {
      id: `wastage-${Date.now()}`,
      organization_id: material.organization_id,
      project_id: material.project_id,
      material_id: material.id,
      material_name: material.name,
      material_unit: material.unit,
      material_transaction_id: transaction.id,
      quantity: input.quantity,
      reason: input.reason.trim(),
      wastage_date: input.wastageDate,
      recorded_by: profile?.id,
      recorded_by_name: profile?.full_name || 'Demo user',
      created_at: now
    };
  };

  // ============================================================================
  // MILESTONE ACTIONS
  // ============================================================================
  const handleOpenMilestoneModal = (open: boolean, msToEdit?: Milestone | null) => {
    setMilestoneToEdit(msToEdit || null);
    setIsMilestoneModalOpenState(open);
  };

  const addMilestone = async (input: CreateMilestoneInput): Promise<Milestone> => {
    let created: Milestone | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await milestoneService.createMilestone(input);
      } catch (e: any) {
        console.warn('[AppContext] Supabase addMilestone fallback:', e?.message);
      }
    }

    let status = input.status || 'pending';
    let progress = Math.min(100, Math.max(0, input.progress ?? 0));
    if (status === 'completed') progress = 100;
    else if (progress === 100) status = 'completed';

    const newMs: Milestone = created || {
      id: `ms-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: input.project_id,
      title: input.title,
      description: input.description,
      start_date: input.start_date,
      due_date: input.due_date,
      status,
      progress,
      sort_order: input.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setMilestones(prev => [...prev, newMs]);
    return newMs;
  };

  const updateMilestone = async (id: string, updates: Partial<CreateMilestoneInput>): Promise<Milestone> => {
    let updated: Milestone | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        updated = await milestoneService.updateMilestone(id, updates);
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateMilestone fallback:', e?.message);
      }
    }

    const existing = milestones.find(m => m.id === id);
    const finalMs: Milestone = updated || ({
      ...(existing || {}),
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as Milestone);
    setMilestones(prev => prev.map(m => m.id === id ? finalMs : m));
    return finalMs;
  };

  const deleteMilestone = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await milestoneService.deleteMilestone(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteMilestone fallback:', e?.message);
      }
    }
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  // ============================================================================
  // DAILY SITE UPDATES (DPR) ACTIONS
  // ============================================================================
  const handleOpenDailyUpdateModal = (open: boolean, dprToEdit?: DailyUpdate | null) => {
    setDailyUpdateToEdit(dprToEdit || null);
    setIsDailyUpdateModalOpenState(open);
  };

  const addDailyUpdate = async (input: CreateDailyUpdateInput): Promise<DailyUpdate> => {
    let created: DailyUpdate | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        created = await dailyUpdateService.createDailyUpdate(input);
      } catch (e: any) {
        console.warn('[AppContext] Supabase addDailyUpdate fallback:', e?.message);
      }
    }

    const newDpr: DailyUpdate = created || {
      id: `dpr-${Date.now()}`,
      organization_id: organization?.id || 'demo-org',
      project_id: input.project_id,
      update_date: input.update_date || new Date().toISOString().split('T')[0],
      work_completed: input.work_completed,
      work_pending: input.work_pending,
      issues: input.issues,
      next_day_tasks: input.next_day_tasks,
      workers_count: input.workers_count,
      progress: input.progress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDailyUpdates(prev => [newDpr, ...prev]);
    return newDpr;
  };

  const updateDailyUpdate = async (id: string, updates: Partial<CreateDailyUpdateInput>): Promise<DailyUpdate> => {
    let updated: DailyUpdate | null = null;
    if (isSupabaseConfigured && organization?.id) {
      try {
        updated = await dailyUpdateService.updateDailyUpdate(id, updates);
      } catch (e: any) {
        console.warn('[AppContext] Supabase updateDailyUpdate fallback:', e?.message);
      }
    }

    const existing = dailyUpdates.find(d => d.id === id);
    const finalDpr: DailyUpdate = updated || ({
      ...(existing || {}),
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as DailyUpdate);
    setDailyUpdates(prev => prev.map(d => d.id === id ? finalDpr : d));
    return finalDpr;
  };

  const deleteDailyUpdate = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await dailyUpdateService.deleteDailyUpdate(id);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteDailyUpdate fallback:', e?.message);
      }
    }
    setDailyUpdates(prev => prev.filter(d => d.id !== id));
  };

  // ============================================================================
  // PROJECT PHOTO ACTIONS
  // ============================================================================
  const handleOpenUploadPhotoModal = (open: boolean, defaultDprId?: string) => {
    setDefaultPhotoDailyUpdateId(defaultDprId);
    setIsUploadPhotoModalOpenState(open);
  };

  const uploadProjectPhoto = async (
    projectId: string, 
    file: File, 
    metadata?: { title?: string; category?: any; daily_update_id?: string }
  ): Promise<ProjectPhoto> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        const photo = await photoService.uploadPhoto({
          projectId,
          file,
          title: metadata?.title,
          category: metadata?.category,
          daily_update_id: metadata?.daily_update_id
        });
        setProjectPhotos(prev => [photo, ...prev]);
        return photo;
      } catch (e: any) {
        console.warn('[AppContext] Supabase uploadProjectPhoto fallback:', e?.message);
      }
    }

    const previewUrl = URL.createObjectURL(file);
    const newPhoto: ProjectPhoto = {
      id: `photo-${Date.now()}`,
      projectId,
      daily_update_id: metadata?.daily_update_id,
      url: previewUrl,
      title: metadata?.title || file.name,
      category: metadata?.category || 'Site Progress',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Studio Member'
    };
    setProjectPhotos(prev => [newPhoto, ...prev]);
    return newPhoto;
  };

  const deleteProjectPhoto = async (photoId: string, storagePath?: string): Promise<void> => {
    if (isSupabaseConfigured && organization?.id) {
      try {
        await photoService.deletePhoto(photoId, storagePath);
      } catch (e: any) {
        console.warn('[AppContext] Supabase deleteProjectPhoto fallback:', e?.message);
      }
    }
    setProjectPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // ============================================================================
  // AUXILIARY ACTIONS
  // ============================================================================
  const addProjectNote = (projectId: string, content: string, tag: ProjectNote['tag'] = 'General') => {
    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      projectId,
      content,
      createdAt: new Date().toISOString(),
      author: 'Studio Member',
      tag
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          notes: [newNote, ...(p.notes || [])]
        };
      }
      return p;
    }));
  };

  const addProjectPhoto = (projectId: string, photoData: Omit<ProjectPhoto, 'id' | 'projectId' | 'uploadedAt'>) => {
    const newPhoto: ProjectPhoto = {
      ...photoData,
      id: `photo-${Date.now()}`,
      projectId,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          photos: [newPhoto, ...(p.photos || [])]
        };
      }
      return p;
    }));
  };

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `ev-${Date.now()}`
    };
    setCalendarEvents(prev => [newEvent, ...prev]);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    localStorage.removeItem('apni_estate_demo_clients');
    localStorage.removeItem('apni_estate_demo_projects');
    localStorage.removeItem('apni_estate_demo_expenses');
    localStorage.removeItem('apni_estate_demo_boq_items');
    localStorage.removeItem('apni_estate_demo_calendar');
    localStorage.removeItem('apni_estate_demo_documents');
    localStorage.removeItem('apni_estate_demo_notifications');
    localStorage.removeItem('apni_estate_demo_leads');
    localStorage.removeItem('apni_estate_demo_tasks');
    localStorage.removeItem('apni_estate_demo_team');
    localStorage.removeItem('apni_estate_demo_vendors');
    localStorage.removeItem('apni_estate_demo_client_payments');
    localStorage.removeItem('apni_estate_demo_purchases');
    localStorage.removeItem('apni_estate_demo_materials');
    localStorage.removeItem('apni_estate_demo_material_tx');
    localStorage.removeItem('apni_estate_demo_milestones');
    localStorage.removeItem('apni_estate_demo_daily_updates');
    localStorage.removeItem('apni_estate_demo_project_photos');

    // Legacy un-scoped keys
    localStorage.removeItem('apni_estate_clients');
    localStorage.removeItem('apni_estate_projects');
    localStorage.removeItem('apni_estate_expenses');
    localStorage.removeItem('apni_estate_boq_items');
    localStorage.removeItem('apni_estate_calendar');
    localStorage.removeItem('apni_estate_documents');
    localStorage.removeItem('apni_estate_notifications');
    localStorage.removeItem('apni_estate_leads');
    localStorage.removeItem('apni_estate_tasks');
    localStorage.removeItem('apni_estate_team');

    if (isDemoAccount) {
      setClients(INITIAL_DEMO_CLIENTS);
      setProjects(INITIAL_PROJECTS);
      setExpenses(INITIAL_EXPENSES);
      setBoqItems(INITIAL_BOQ_ITEMS as BOQItem[]);
      setCalendarEvents(CALENDAR_EVENTS);
      setDocuments(INITIAL_DOCUMENTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setLeads(INITIAL_LEADS);
      setTasks(INITIAL_TASKS);
      setTeamMembers(INITIAL_STAFF_MEMBERS);
      setVendors(INITIAL_VENDORS);
      setClientPayments(INITIAL_CLIENT_PAYMENTS);
      setPurchases(INITIAL_PURCHASES);
      setMaterials([]);
      setMaterialTransactions([]);
      setMilestones([]);
      setDailyUpdates([]);
      setProjectPhotos([]);
      setSelectedProjectId('proj-1');
    }
  };

  // Dynamic Attention Items derived deterministically from real project & financial data
  const attentionItems = useMemo(() => {
    return calculateNeedsAttention(projects, expenses);
  }, [projects, expenses]);

  // ============================================================================
  // COMPUTED STATS (AUTHENTICATED & ACCURATE FINANCIALS)
  // ============================================================================
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Completed');
    const activeProjectsCount = activeProjects.length;
    const needAttentionCount = attentionItems.length;

    // Total Project Value: Sum of contract_value or budget (authoritative real values)
    const totalProjectValue = activeProjects.reduce(
      (acc, p) => acc + (p.contract_value !== undefined && p.contract_value !== null ? Number(p.contract_value) : Number(p.budget)),
      0
    );

    const totalBudget = activeProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
    
    // Total spent is derived authoritative sum of all expense records
    const totalSpent = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    
    // Total BOQ estimate sum
    const totalBOQEstimate = boqItems.reduce((acc, b) => acc + (Number(b.estimated_cost) || (Number(b.quantity) * Number(b.rate)) || 0), 0);

    // Remaining budget CAN be negative when over budget (Do NOT clamp to 0)
    const totalRemaining = totalBudget - totalSpent;
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Spending breakdown by Category
    const categorySpending = calculateCategoryBreakdown(expenses, boqItems).map(item => ({
      category: item.category,
      amount: item.spent,
      percentage: item.percentageOfTotalSpend,
      color: item.color
    })).filter(i => i.amount > 0);

    const recentExpenses = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    const selectedProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

    return {
      activeProjectsCount,
      needAttentionCount,
      totalProjectValue,
      totalBudget,
      totalBOQEstimate,
      totalSpent,
      totalRemaining,
      spentPercentage,
      categorySpending,
      recentExpenses,
      selectedProject
    };
  }, [projects, expenses, boqItems, attentionItems, selectedProjectId]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedProjectId,
        setSelectedProjectId,
        openProjectDetail,
        initialProjectDetailTab,
        globalSearch,
        setGlobalSearch,
        clients,
        leads,
        tasks,
        teamMembers,
        vendors,
        clientPayments,
        purchases,
        projects,
        expenses,
        boqItems,
        materials,
        materialTransactions,
        milestones,
        dailyUpdates,
        projectPhotos,
        attentionItems,
        calendarEvents,
        documents,
        notifications,
        loadingData,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen: handleOpenAddExpense,
        expenseToEdit,
        defaultExpenseProjectId,
        isBOQModalOpen,
        setIsBOQModalOpen: handleOpenBOQModal,
        boqModalProjectId,
        boqModalDefaultRoomId,
        boqItemToEdit,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isMaterialModalOpen,
        setIsMaterialModalOpen: handleOpenMaterialModal,
        materialToEdit,
        isMaterialTransactionModalOpen,
        setIsMaterialTransactionModalOpen: handleOpenMaterialTxModal,
        selectedMaterialForTransaction,
        materialTransactionType,
        isMilestoneModalOpen,
        setIsMilestoneModalOpen: handleOpenMilestoneModal,
        milestoneToEdit,
        isDailyUpdateModalOpen,
        setIsDailyUpdateModalOpen: handleOpenDailyUpdateModal,
        dailyUpdateToEdit,
        isUploadPhotoModalOpen,
        setIsUploadPhotoModalOpen: handleOpenUploadPhotoModal,
        defaultPhotoDailyUpdateId,
        addClient,
        updateClient,
        deleteClient,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToClient,
        addTask,
        updateTask,
        deleteTask,
        addDocument,
        deleteDocument,
        updateMemberRole,
        addVendor,
        updateVendor,
        deleteVendor,
        addClientPayment,
        updateClientPayment,
        deleteClientPayment,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addProject,
        updateProject,
        deleteProject,
        addRoom,
        updateRoom,
        deleteRoom,
        addBOQItem,
        updateBOQItem,
        deleteBOQItem,
        approveProjectBOQ,
        addExpense,
        updateExpense,
        deleteExpense,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addMaterialTransaction,
        recordMaterialWastage,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addDailyUpdate,
        updateDailyUpdate,
        deleteDailyUpdate,
        uploadProjectPhoto,
        deleteProjectPhoto,
        addProjectNote,
        addProjectPhoto,
        addCalendarEvent,
        deleteCalendarEvent,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        refreshData: loadRemoteData,
        stats,
        workspaceMode,
        setWorkspaceMode,
        toggleWorkspaceMode,
        modeTransitionTarget,
        modeTransitionPhase,
        dismissModeTransition,
        isGenericQuoteModalOpen,
        setIsGenericQuoteModalOpen,
        isSpecificQuoteModalOpen,
        setIsSpecificQuoteModalOpen: handleOpenSpecificQuoteModal,
        specificQuoteProjectId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
