// ==============================================================================
// APNI ESTATE INTERIORS - PROJECT DETAIL PAGE (OPERATIONAL SITE MVP & FINANCIALS)
// ==============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Project, Room, BOQItem, Expense, Material, Milestone, DailyUpdate, ProjectPhoto } from '../types';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Phone,
  IndianRupee,
  Layers,
  Clock,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Edit3,
  Share2,
  Camera,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  Edit2,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Package,
  Flag,
  ArrowDownLeft,
  ArrowUpRight,
  UploadCloud,
  Users,
  UserRound,
  ArrowRight,
  X,
  AlertTriangle,
  History,
  Eye,
  ZoomIn,
  Download,
  CheckSquare,
  CreditCard,
  ShoppingBag,
  Receipt,
  DollarSign,
  FileCheck2
} from 'lucide-react';
import { formatINR, formatINRCompact, calculateDaysRemaining, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { AddPhotoModal } from '../components/modals/AddPhotoModal';
import { AddNoteModal } from '../components/modals/AddNoteModal';
import { RoomModal } from '../components/modals/RoomModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { MaterialModal } from '../components/modals/MaterialModal';
import { MaterialTransactionModal } from '../components/modals/MaterialTransactionModal';
import { MilestoneModal } from '../components/modals/MilestoneModal';
import { DailyUpdateModal } from '../components/modals/DailyUpdateModal';
import { UploadPhotoModal } from '../components/modals/UploadPhotoModal';
import { TaskModal } from '../components/modals/TaskModal';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';
import { ClientPaymentModal } from '../components/modals/ClientPaymentModal';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { MaterialImportModal } from '../components/modals/MaterialImportModal';
import { PurchaseModal } from '../components/modals/PurchaseModal';
import {
  calculateProjectSpent,
  calculateRoomSpent,
  calculateProjectBOQ,
  calculateRoomBOQ,
  calculateBudgetMetrics,
  calculateCategoryBreakdown,
  getBudgetHealth
} from '../lib/financialMetrics';
import { calculateProjectProfitability } from '../lib/profitabilityMetrics';
import { materialService } from '../services/materialService';
import { milestoneService } from '../services/milestoneService';
import { documentService } from '../services/documentService';
import { quotationService } from '../services/quotationService';
import { GanttChart } from '../components/project/GanttChart';
import { ProjectFinanceSection } from '../components/project/ProjectFinanceSection';
import { ProjectMaterialsSection } from '../components/project/ProjectMaterialsSection';
import { ProjectMilestonesSection } from '../components/project/ProjectMilestonesSection';
import { ProjectPlansSection } from '../components/project/ProjectPlansSection';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Task, DocumentItem, DocumentCategory, TaskStatus, TaskPriority, ClientPayment, Purchase, Vendor } from '../types';

interface ClientRequirement {
  id: string;
  space: string;
  title: string;
  details: string;
  priority: 'Standard' | 'High';
  status: 'Approved & In Scope' | 'Under Review' | 'Declined';
  submitted_at: string;
  estimated_cost?: number;
}

export type PrimaryProjectTab = 'Overview' | 'Finance' | 'Materials' | 'Milestones' | 'Plans';

export const PRIMARY_PROJECT_TABS: { id: PrimaryProjectTab; label: string; icon: any }[] = [
  { id: 'Overview', label: 'Overview', icon: LayoutGrid },
  { id: 'Finance', label: 'Finance', icon: IndianRupee },
  { id: 'Materials', label: 'Materials', icon: Package },
  { id: 'Milestones', label: 'Milestones & Site', icon: Flag },
  { id: 'Plans', label: 'Plans & Blueprints', icon: Layers }
];

export const ProjectDetailPage: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setCurrentPage,
    setIsNewProjectModalOpen,
    initialProjectDetailTab,
    expenses,
    boqItems,
    materials,
    materialTransactions,
    milestones,
    dailyUpdates,
    projectPhotos,
    tasks,
    documents,
    teamMembers,
    clientPayments,
    paymentTransactions,
    purchases,
    vendors,
    clients,
    updateTask,
    deleteTask,
    deleteDocument,
    deleteClientPayment,
    deletePurchase,
    addPaymentTransaction,
    deletePaymentTransaction,
    setIsAddExpenseModalOpen,
    setIsBOQModalOpen,
    setIsSpecificQuoteModalOpen,
    approveProjectBOQ,
    deleteExpense,
    deleteBOQItem,
    addBOQItem,
    updateProject,
    deleteProject,
    deleteRoom,
    isMaterialModalOpen,
    setIsMaterialModalOpen,
    materialToEdit,
    isMaterialTransactionModalOpen,
    setIsMaterialTransactionModalOpen,
    selectedMaterialForTransaction,
    materialTransactionType,
    isMilestoneModalOpen,
    setIsMilestoneModalOpen,
    milestoneToEdit,
    isDailyUpdateModalOpen,
    setIsDailyUpdateModalOpen,
    dailyUpdateToEdit,
    isUploadPhotoModalOpen,
    setIsUploadPhotoModalOpen,
    defaultPhotoDailyUpdateId,
    deleteMaterial,
    deleteMilestone,
    updateMilestone,
    deleteDailyUpdate,
    deleteProjectPhoto
  } = useApp();

  const { isDemoMode, profile, organization } = useAuth();

  const [activeTab, setActiveTab] = useState<PrimaryProjectTab>('Overview');
  const [financeSubTab, setFinanceSubTab] = useState<'obligations' | 'transactions' | 'expenses' | 'budget'>('obligations');
  const [milestoneSubTab, setMilestoneSubTab] = useState<'timeline' | 'dpr' | 'tasks'>('timeline');
  const [plansSubTab, setPlansSubTab] = useState<'blueprints' | 'rooms' | 'client_requests'>('blueprints');

  // Partial Payment and Document Import Modals
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [recordPaymentDefaultObligationId, setRecordPaymentDefaultObligationId] = useState<string | undefined>(undefined);
  const [isMaterialImportModalOpen, setIsMaterialImportModalOpen] = useState(false);
  const [blueprintCategoryFilter, setBlueprintCategoryFilter] = useState<string>('All');

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<string>('All');

  // Tasks & Documents Project Modals
  const [isProjectTaskModalOpen, setIsProjectTaskModalOpen] = useState(false);
  const [projectTaskToEdit, setProjectTaskToEdit] = useState<Task | null>(null);
  const [isProjectUploadDocModalOpen, setIsProjectUploadDocModalOpen] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Client Payments & Purchases Project Modals
  const [isProjectPaymentModalOpen, setIsProjectPaymentModalOpen] = useState(false);
  const [projectPaymentToEdit, setProjectPaymentToEdit] = useState<ClientPayment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<ClientPayment | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  const [isProjectPurchaseModalOpen, setIsProjectPurchaseModalOpen] = useState(false);
  const [projectPurchaseToEdit, setProjectPurchaseToEdit] = useState<Purchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);

  // Room modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  // BOQ Item deletion confirmation
  const [boqToDelete, setBOQToDelete] = useState<BOQItem | null>(null);
  const [isDeletingBOQ, setIsDeletingBOQ] = useState(false);

  // Expense deletion confirmation
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);

  // Material Deletion confirmation & History Drawer
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
  const [materialDeleteError, setMaterialDeleteError] = useState<string | null>(null);
  const [historyMaterial, setHistoryMaterial] = useState<Material | null>(null);

  // Milestone Deletion confirmation
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(null);
  const [isDeletingMilestone, setIsDeletingMilestone] = useState(false);

  // Daily Update Deletion confirmation
  const [dailyUpdateToDelete, setDailyUpdateToDelete] = useState<DailyUpdate | null>(null);
  const [isDeletingDailyUpdate, setIsDeletingDailyUpdate] = useState(false);

  // Photo Deletion confirmation & Lightbox
  const [photoToDelete, setPhotoToDelete] = useState<ProjectPhoto | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ProjectPhoto | null>(null);

  // Edit Project modal state
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Filters
  const [boqSearch, setBOQSearch] = useState('');
  const [boqRoomFilter, setBOQRoomFilter] = useState('All');
  const [boqCategoryFilter, setBOQCategoryFilter] = useState('All');

  const [materialSearch, setMaterialSearch] = useState('');
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState('All');
  const [materialRoomFilter, setMaterialRoomFilter] = useState('All');
  const [isApprovingBOQ, setIsApprovingBOQ] = useState(false);
  const [boqApprovalError, setBOQApprovalError] = useState('');
  const [pendingQuotationCount, setPendingQuotationCount] = useState(0);
  const [quotationLoadError, setQuotationLoadError] = useState('');

  useEffect(() => {
    if (initialProjectDetailTab) {
      if (['Expenses', 'Budget', 'Payments', 'Purchases'].includes(initialProjectDetailTab as any)) {
        setActiveTab('Finance');
        if (initialProjectDetailTab === 'Expenses') setFinanceSubTab('expenses');
        else if (initialProjectDetailTab === 'Budget') setFinanceSubTab('budget');
        else setFinanceSubTab('obligations');
      } else if (initialProjectDetailTab === 'Materials') {
        setActiveTab('Materials');
      } else if (['Milestones', 'Daily Updates', 'Tasks'].includes(initialProjectDetailTab as any)) {
        setActiveTab('Milestones');
        if (initialProjectDetailTab === 'Daily Updates') setMilestoneSubTab('dpr');
        else if (initialProjectDetailTab === 'Tasks') setMilestoneSubTab('tasks');
        else setMilestoneSubTab('timeline');
      } else if (['Rooms', 'BOQ', 'Documents', 'Notes', 'Client Requests'].includes(initialProjectDetailTab as any)) {
        setActiveTab('Plans');
        if ((initialProjectDetailTab as string) === 'Rooms' || (initialProjectDetailTab as string) === 'BOQ') setPlansSubTab('rooms');
        else if ((initialProjectDetailTab as string) === 'Client Requests') setPlansSubTab('client_requests');
        else setPlansSubTab('blueprints');
      } else {
        setActiveTab('Overview');
      }
    }
  }, [initialProjectDetailTab]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);
  const project: Project = activeProject || {
    id: '',
    name: 'No Project Selected',
    client: 'N/A',
    location: '',
    city: '',
    type: 'Residential',
    budget: 0,
    spent: 0,
    progress: 0,
    status: 'On Track',
    startDate: '',
    deadline: '',
    coverImage: '',
    rooms: [],
    boq_items: [],
    notes: [],
    photos: []
  };

  // Client Portal Requirements State & Sync
  const [clientRequests, setClientRequests] = useState<ClientRequirement[]>([]);
  const [clientReqFilter, setClientReqFilter] = useState<'All' | 'Under Review' | 'Approved & In Scope' | 'Declined'>('All');
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [newReqSpace, setNewReqSpace] = useState('Living Room');
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDetails, setNewReqDetails] = useState('');
  const [newReqPriority, setNewReqPriority] = useState<'Standard' | 'High'>('Standard');
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const loadClientRequests = useCallback(() => {
    if (!project?.id) return;
    const storageKey = `apni_estate_client_reqs_${project.id}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setClientRequests(JSON.parse(raw));
      } else if (isDemoMode && project.id.startsWith('proj-')) {
        const initial: ClientRequirement[] = [
          {
            id: `req-${project.id}-1`,
            space: 'Living Room',
            title: 'Warm 3000K LED Strip under TV Console',
            details: 'Please ensure cove light switches from the main entry board.',
            priority: 'Standard',
            status: 'Under Review',
            submitted_at: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]
          },
          {
            id: `req-${project.id}-2`,
            space: 'Master Bedroom',
            title: 'Full Mirror Door on Wardrobe Center Shutter',
            details: 'Replace plain laminate with 5mm beveled mirror for vanity check.',
            priority: 'High',
            status: 'Under Review',
            submitted_at: new Date(Date.now() - 86400000).toISOString().split('T')[0]
          }
        ];
        localStorage.setItem(storageKey, JSON.stringify(initial));
        setClientRequests(initial);
      } else {
        setClientRequests([]);
      }
    } catch {
      setClientRequests([]);
    }
  }, [project?.id, isDemoMode]);

  useEffect(() => {
    loadClientRequests();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `apni_estate_client_reqs_${project?.id}`) {
        loadClientRequests();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadClientRequests, project?.id]);

  const pendingRequests = useMemo(() => {
    return clientRequests.filter(r => r.status === 'Under Review');
  }, [clientRequests]);

  const handleApproveAndAddToBOQ = async (req: ClientRequirement) => {
    try {
      const roomsList = project.rooms || [];
      const matchingRoom = roomsList.find(r =>
        r.name.toLowerCase().includes(req.space.toLowerCase()) ||
        req.space.toLowerCase().includes(r.name.toLowerCase())
      ) || roomsList[0];

      await addBOQItem({
        project_id: project.id,
        room_id: matchingRoom?.id,
        item_name: req.title,
        description: req.details ? `${req.details} (Client Portal Request for ${req.space})` : `Client Portal Request for ${req.space}`,
        category: 'Carpentry / Loose',
        quantity: 1,
        unit: 'Lot',
        rate: req.estimated_cost || 12000,
        selling_rate: req.estimated_cost || 12000,
        material_rate: Math.round((req.estimated_cost || 12000) * 0.65),
        labour_rate: Math.round((req.estimated_cost || 12000) * 0.35)
      });

      const updated = clientRequests.map(r => r.id === req.id ? { ...r, status: 'Approved & In Scope' as const } : r);
      setClientRequests(updated);
      localStorage.setItem(`apni_estate_client_reqs_${project.id}`, JSON.stringify(updated));

      setActionToast({
        message: `"${req.title}" approved and added to Cost Estimate (BOQ)!`,
        type: 'success'
      });
      setTimeout(() => setActionToast(null), 4000);
    } catch (err) {
      console.error('Failed to add client request to BOQ:', err);
    }
  };

  const handleApproveClientRequest = (reqId: string) => {
    const req = clientRequests.find(r => r.id === reqId);
    if (req) handleApproveAndAddToBOQ(req);
  };

  const handleUpdateReqStatus = (reqId: string, newStatus: ClientRequirement['status']) => {
    const updated = clientRequests.map(r => r.id === reqId ? { ...r, status: newStatus } : r);
    setClientRequests(updated);
    localStorage.setItem(`apni_estate_client_reqs_${project.id}`, JSON.stringify(updated));
    setActionToast({
      message: `Requirement status updated to "${newStatus}".`,
      type: 'info'
    });
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleCreateManualRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !project) return;
    const newReq: ClientRequirement = {
      id: `req-${Date.now()}`,
      space: newReqSpace.trim() || 'General',
      title: newReqTitle.trim(),
      details: newReqDetails.trim(),
      priority: newReqPriority,
      status: 'Under Review',
      submitted_at: new Date().toISOString().split('T')[0]
    };
    const updated = [newReq, ...clientRequests];
    setClientRequests(updated);
    localStorage.setItem(`apni_estate_client_reqs_${project.id}`, JSON.stringify(updated));
    setNewReqTitle('');
    setNewReqDetails('');
    setIsAddReqModalOpen(false);
    setActionToast({
      message: 'New client requirement recorded.',
      type: 'success'
    });
    setTimeout(() => setActionToast(null), 3000);
  };

  useEffect(() => {
    if (!project?.id) {
      setPendingQuotationCount(0);
      setQuotationLoadError('');
      return;
    }
    let active = true;
    setQuotationLoadError('');
    const loadPendingQuotes = async () => {
      try {
        if (isDemoMode) {
          const stored = localStorage.getItem('apni_estate_quotations');
          const quotes = stored ? JSON.parse(stored) : [];
          if (active) setPendingQuotationCount(quotes.filter((quote: { project_id?: string; status?: string }) =>
            quote.project_id === project.id && quote.status === 'sent'
          ).length);
        } else if (organization?.id) {
          const quotes = await quotationService.getQuotations(organization.id);
          if (active) setPendingQuotationCount(quotes.filter(quote =>
            quote.project_id === project.id && quote.status === 'sent'
          ).length);
        } else if (active) {
          setPendingQuotationCount(0);
        }
      } catch (err) {
        if (active) setQuotationLoadError(err instanceof Error ? err.message : 'Client approval status could not be loaded.');
      }
    };
    loadPendingQuotes();
    return () => { active = false; };
  }, [project?.id, isDemoMode, organization?.id]);

  if (!project) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Project not found"
        description="The project you are looking for does not exist or has been removed."
        actionLabel="Back to Projects"
        onAction={() => setCurrentPage('projects')}
      />
    );
  }

  // Authoritative dynamic financial rollups from Expense Ledger & BOQ
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectBOQItems = boqItems.filter(b => b.project_id === project.id);
  const approvedBOQCount = projectBOQItems.filter(item => Boolean(item.approved_at)).length;
  const canApproveBOQ = isDemoMode || profile?.role === 'owner' || profile?.role === 'admin';

  const projectSpent = calculateProjectSpent(project.id, expenses);
  const projectBOQ = calculateProjectBOQ(project.id, boqItems);
  const projectMetrics = calculateBudgetMetrics(project.budget, projectSpent);

  const daysInfo = calculateDaysRemaining(project.deadline);
  const rooms = project.rooms || [];

  // Phase 6 Operational Data
  const projectMaterials = materials.filter(m => m.project_id === project.id);
  const projectMilestones = milestones.filter(m => m.project_id === project.id);
  const projectDailyUpdates = dailyUpdates.filter(d => d.project_id === project.id);
  const authenticatedPhotos = projectPhotos.filter(p => p.projectId === project.id);
  const allPhotos = isDemoMode ? (project.photos || []) : authenticatedPhotos;

  // Milestone-derived deterministic project progress
  const derivedMilestoneProgress = milestoneService.calculateProjectMilestoneProgress(projectMilestones);
  const displayProgressText = derivedMilestoneProgress !== null ? `${derivedMilestoneProgress}%` : 'No milestones configured';
  const progressNumericValue = derivedMilestoneProgress !== null ? derivedMilestoneProgress : 0;

  // Filtered Materials
  const filteredMaterials = projectMaterials.filter(m => {
    if (materialCategoryFilter !== 'All' && m.category !== materialCategoryFilter) return false;
    if (materialRoomFilter !== 'All') {
      if (materialRoomFilter === 'General' && m.room_id) return false;
      if (materialRoomFilter !== 'General' && m.room_id !== materialRoomFilter) return false;
    }
    if (materialSearch.trim()) {
      const q = materialSearch.toLowerCase();
      const match = m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered BOQ items
  const filteredBOQItems = projectBOQItems.filter(b => {
    if (boqRoomFilter !== 'All') {
      if (boqRoomFilter === 'General' && b.room_id) return false;
      if (boqRoomFilter !== 'General' && b.room_id !== boqRoomFilter) return false;
    }
    if (boqCategoryFilter !== 'All' && b.category !== boqCategoryFilter) return false;
    if (boqSearch.trim()) {
      const q = boqSearch.toLowerCase();
      const match = b.item_name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered Photos & Notes
  const filteredPhotos = photoFilter === 'All'
    ? allPhotos
    : allPhotos.filter(p => p.category === photoFilter);
  const notes = project.notes || [];

  // Project Tasks & Documents
  const projectTasks = tasks.filter(t => (t.project_id || t.projectId) === project.id);
  const projectDocuments = documents.filter(d => (d.project_id || d.projectId) === project.id);

  // Project Payments & Purchases
  const projectPayments = clientPayments.filter(p => (p.project_id || p.projectId) === project.id);
  const projectPaymentTransactions = paymentTransactions.filter(t => (t.project_id || (t as any).projectId) === project.id);
  const projectPurchases = purchases.filter(p => (p.project_id || p.projectId) === project.id);

  // Authoritative Project Profitability
  const profitability = calculateProjectProfitability(project, projectExpenses, projectPayments);

  // Category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(projectExpenses, projectBOQItems, project.id);
  const today = new Date().toISOString().slice(0, 10);
  const delayedTasks = projectTasks.filter(task =>
    Boolean(task.due_date || task.dueDate) &&
    (task.due_date || task.dueDate || '') < today &&
    task.status !== 'Completed' && task.status !== 'Cancelled'
  );
  const delayedPurchases = projectPurchases.filter(purchase =>
    Boolean(purchase.expected_delivery) &&
    (purchase.expected_delivery || '') < today &&
    purchase.status !== 'Received' && purchase.status !== 'Delivered' && purchase.status !== 'Cancelled'
  );
  const overduePayments = projectPayments.filter(payment =>
    Boolean(payment.due_date) && payment.due_date < today &&
    Math.max(Number(payment.amount) - Number(payment.paid_amount || 0), 0) > 0
  );
  const overduePaymentAmount = overduePayments.reduce(
    (total, payment) => total + Math.max(Number(payment.amount) - Number(payment.paid_amount || 0), 0), 0
  );
  const costOverrun = Math.max(projectSpent - projectBOQ, 0);
  const costOverrunPercent = projectBOQ > 0 ? costOverrun / projectBOQ * 100 : 0;
  const projectOverdueDays = project.deadline && project.deadline < today
    ? Math.ceil((new Date(`${today}T00:00:00`).getTime() - new Date(`${project.deadline}T00:00:00`).getTime()) / 86400000)
    : 0;
  const healthReasons = [
    ...(costOverrun > 0 ? [`Recorded expenses are ${formatINR(costOverrun)} above the BOQ cost estimate.`] : []),
    ...(projectOverdueDays > 0 && Number(project.progress) < 100 ? [`Project handover is ${projectOverdueDays} day${projectOverdueDays === 1 ? '' : 's'} past its deadline.`] : []),
    ...(project.status === 'Delayed' && projectOverdueDays === 0 ? ['Project is marked delayed and should be reviewed against its current schedule.'] : []),
    ...(delayedTasks.length > 0 ? [`${delayedTasks.length} task${delayedTasks.length === 1 ? '' : 's'} are past due, including ${delayedTasks[0].title}.`] : []),
    ...(delayedPurchases.length > 0 ? [`${delayedPurchases.length} purchase order${delayedPurchases.length === 1 ? '' : 's'} missed the expected delivery date.`] : []),
    ...(overduePaymentAmount > 0 ? [`${formatINR(overduePaymentAmount)} in scheduled client payments is overdue.`] : []),
    ...(pendingQuotationCount > 0 ? [`${pendingQuotationCount} client quotation approval${pendingQuotationCount === 1 ? '' : 's'} are awaiting response.`] : []),
    ...(profitability.contractValue > 0 && profitability.grossMarginPercentage < 15 ? [`Current gross margin is ${profitability.grossMarginPercentage.toFixed(1)}%, below the 15% watch threshold.`] : [])
  ];
  const projectHealth = profitability.grossMarginPercentage < 0 || costOverrunPercent > 10 || projectOverdueDays > 14
    ? 'Red'
    : healthReasons.length > 0 ? 'Amber' : 'Green';
  const taskCompletion = projectTasks.length
    ? Math.round(projectTasks.filter(task => task.status === 'Completed').length / projectTasks.length * 100)
    : null;
  const purchaseCompletion = projectPurchases.length
    ? Math.round(projectPurchases.filter(purchase => purchase.status === 'Received' || purchase.status === 'Delivered').length / projectPurchases.length * 100)
    : null;

  // Handlers
  const handleApproveBOQ = async () => {
    setBOQApprovalError('');
    setIsApprovingBOQ(true);
    try {
      await approveProjectBOQ(project.id);
    } catch (err) {
      setBOQApprovalError(err instanceof Error ? err.message : 'Could not approve the BOQ.');
    } finally {
      setIsApprovingBOQ(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setRoomToEdit(room);
    setIsRoomModalOpen(true);
  };

  const handleAddRoom = () => {
    setRoomToEdit(null);
    setIsRoomModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsDeletingRoom(true);
    try {
      await deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
    } finally {
      setIsDeletingRoom(false);
    }
  };

  const confirmDeleteBOQItem = async () => {
    if (!boqToDelete) return;
    setIsDeletingBOQ(true);
    try {
      await deleteBOQItem(boqToDelete.id);
      setBOQToDelete(null);
    } catch (err) {
      console.error('Failed to delete BOQ item:', err);
    } finally {
      setIsDeletingBOQ(false);
    }
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setIsDeletingExpense(true);
    try {
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setIsDeletingExpense(false);
    }
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    setIsDeletingMaterial(true);
    setMaterialDeleteError(null);
    try {
      await deleteMaterial(materialToDelete.id);
      setMaterialToDelete(null);
    } catch (err: any) {
      setMaterialDeleteError(err.message || 'Cannot delete material with existing stock transaction history.');
    } finally {
      setIsDeletingMaterial(false);
    }
  };

  const confirmDeleteMilestone = async () => {
    if (!milestoneToDelete) return;
    setIsDeletingMilestone(true);
    try {
      await deleteMilestone(milestoneToDelete.id);
      setMilestoneToDelete(null);
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    } finally {
      setIsDeletingMilestone(false);
    }
  };

  const confirmDeleteDailyUpdate = async () => {
    if (!dailyUpdateToDelete) return;
    setIsDeletingDailyUpdate(true);
    try {
      await deleteDailyUpdate(dailyUpdateToDelete.id);
      setDailyUpdateToDelete(null);
    } catch (err) {
      console.error('Failed to delete daily update:', err);
    } finally {
      setIsDeletingDailyUpdate(false);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    setIsDeletingPhoto(true);
    try {
      await deleteProjectPhoto(photoToDelete.id, photoToDelete.storage_path);
      setPhotoToDelete(null);
      if (lightboxPhoto?.id === photoToDelete.id) {
        setLightboxPhoto(null);
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeletingPayment(true);
    try {
      await deleteClientPayment(paymentToDelete.id);
      setPaymentToDelete(null);
    } catch (err) {
      console.error('Failed to delete client payment:', err);
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    setIsDeletingPurchase(true);
    try {
      await deletePurchase(purchaseToDelete.id);
      setPurchaseToDelete(null);
    } catch (err) {
      console.error('Failed to delete purchase order:', err);
    } finally {
      setIsDeletingPurchase(false);
    }
  };

  const confirmDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      await deleteProject(project.id);
      setIsDeleteProjectOpen(false);
      setCurrentPage('projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="space-y-6 pb-12 animate-fadeIn">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('projects')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-editorial font-bold text-slate-900 tracking-tight">
              Project Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select or create a project to manage specifications, BOQs, and site progress.
            </p>
          </div>
        </div>
        <EmptyState
          icon={Package}
          title="No Project Selected"
          description="You don't have any projects in your studio yet. Create your first project to start managing rooms, BOQs, site expenses, milestones, and daily updates."
          actionLabel="+ Add New Project"
          onAction={() => setIsNewProjectModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('projects')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs transition-all"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-editorial font-bold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <Badge status={project.status} />
              <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100">
                {project.type}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-editorial italic font-semibold">{project.client}</span> {project.clientPhone ? `(${project.clientPhone})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="relative">
            <select
              value={project.status}
              onChange={(e) => updateProject(project.id, { status: e.target.value as any })}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="On Track">Status: On Track</option>
              <option value="Needs Attention">Status: Needs Attention</option>
              <option value="Budget Alert">Status: Budget Alert</option>
              <option value="Delayed">Status: Delayed</option>
              <option value="Completed">Status: Completed</option>
            </select>
          </div>

          <button
            onClick={() => setIsEditProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteProjectOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-SECTION PRIMARY NAVIGATION */}
      <nav aria-label="Project sections" className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {PRIMARY_PROJECT_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const hasPendingPortal = tab.id === 'Plans' && pendingRequests.length > 0;
            const hasDuePayments = tab.id === 'Finance' && overduePayments.length > 0;
            const Icon = tab.icon;

            return (
              <button
                type="button"
                key={tab.id}
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-12 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${isActive
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {hasPendingPortal && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-2xs">
                    {pendingRequests.length}
                  </span>
                )}
                {hasDuePayments && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? 'bg-amber-300 text-amber-950' : 'bg-rose-100 text-rose-700'}`}>
                    {overduePayments.length} due
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (() => {
        const CHART_PALETTE = ['#1D4ED8', '#059669', '#D97706', '#6366F1', '#0891B2'];

        const roomBarData = rooms.map((room) => ({
          name: room.name.length > 14 ? `${room.name.slice(0, 14)}…` : room.name,
          Budget: Number(room.budget || 0),
          Spent: calculateRoomSpent(room.id, expenses),
        }));

        const pillarBarData = [
          { name: 'Contract', Amount: Number(profitability.contractValue || 0), fill: '#1D4ED8' },
          { name: 'BOQ Est.', Amount: Number(projectBOQ || 0), fill: '#4F46E5' },
          { name: 'Collected', Amount: Number(profitability.revenueReceived || 0), fill: '#059669' },
          { name: 'Actual Cost', Amount: Number(profitability.actualCost || 0), fill: '#D97706' },
        ];

        const expenseByCategoryMap: Record<string, number> = {};
        projectExpenses.forEach((exp) => {
          const cat = exp.category || 'Other';
          expenseByCategoryMap[cat] = (expenseByCategoryMap[cat] || 0) + Number(exp.amount || 0);
        });
        const sortedCategories = Object.entries(expenseByCategoryMap)
          .sort((a, b) => b[1] - a[1]);

        const donutData = sortedCategories.length > 0
          ? sortedCategories.slice(0, 4).map(([name, value], idx) => ({
            name,
            value,
            color: CHART_PALETTE[idx % CHART_PALETTE.length],
          })).concat(
            sortedCategories.length > 4
              ? [{
                name: 'Other',
                value: sortedCategories.slice(4).reduce((s, [, v]) => s + v, 0),
                color: '#94A3B8',
              }]
              : []
          )
          : [
            ...(projectSpent > 0 ? [{ name: 'Actual Spend', value: projectSpent, color: '#D97706' }] : []),
            {
              name: 'Remaining Budget',
              value: Math.max(Number(project.budget || 0) - projectSpent, projectSpent > 0 ? 0 : 1),
              color: '#1D4ED8',
            },
          ].filter((d) => d.value > 0);

        return (
          <div className="space-y-5">
            {/* ── REAL-TIME ALERT: PENDING CLIENT PORTAL REQUIREMENTS ── */}
            {pendingRequests.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950 bg-amber-300 px-2 py-0.5 rounded shadow-2xs">
                        Portal Update
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {pendingRequests.length} New Space Requirement{pendingRequests.length > 1 ? 's' : ''} Received from Homeowner
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      The client submitted changes via their live portal link. Review specs and approve them directly into your BOQ cost estimate.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('Plans'); setPlansSubTab('client_requests'); }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Review &amp; Approve ({pendingRequests.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS BAR */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-400 block">Fast Site Actions</span>
                <h4 className="text-sm font-bold text-white">Record site progress, staged payments, and material deliveries</h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>+ Record Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaterialImportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Import Materials (PDF/Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDailyUpdateModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Post DPR Update</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-blue-400" />
                  <span>+ Add Milestone</span>
                </button>
              </div>
            </div>

            {/* ROW 1: 4 UNIFORM ARCHITECTURAL KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Budget</span>
                  <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
                    <DollarSign className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-xl font-bold font-display text-slate-900 tabular-nums mt-1">
                  {formatINR(project.budget)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>BOQ</span>
                  <span className="font-semibold text-slate-700">{formatINR(projectBOQ)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Actual Spend</span>
                  <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded tabular-nums">
                    {projectMetrics.utilization !== null ? `${projectMetrics.utilization.toFixed(0)}%` : '0%'}
                  </span>
                </div>
                <div className="text-xl font-bold font-display text-[#1D4ED8] tabular-nums mt-1">
                  {formatINR(projectSpent)}
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={projectMetrics.utilization || 0} height="sm" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Remaining</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${projectMetrics.isOverBudget ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                    {profitability.grossMarginPercentage.toFixed(0)}% margin
                  </span>
                </div>
                <div className={`text-xl font-bold font-display tabular-nums mt-1 ${projectMetrics.isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                  {formatINR(projectMetrics.remaining)}
                </div>
                {projectMetrics.isOverBudget && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">
                    Over by {formatINR(projectMetrics.overBudgetAmount)}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Progress</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {derivedMilestoneProgress !== null ? `${derivedMilestoneProgress}%` : '0%'}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={progressNumericValue} height="sm" />
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mt-1.5">
                  <span className="truncate">{displayProgressText}</span>
                  <span className="font-semibold text-slate-700 shrink-0">{formatDate(project.deadline)}</span>
                </div>
              </div>
            </div>

            {/* ROW 2: ANALYTICS CHARTS & HEALTH SIGNALS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Chart 1: Financial & Room Cost Comparison */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                      {rooms.length > 0 ? 'Room Budget vs Spend' : 'Financial Position'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 shrink-0">
                    {rooms.length > 0 ? (
                      <>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" /> Budget
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Spent
                        </span>
                      </>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-[#F4F6FA] border border-[#E5E7EB] text-slate-600">
                        Rollup
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-[235px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    {rooms.length > 0 ? (
                      <BarChart data={roomBarData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatINRCompact(Number(v))}
                          tick={{ fill: '#64748B', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={58}
                        />
                        <Tooltip
                          formatter={(value: unknown) => formatINR(Number(value || 0))}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E5E7EB',
                            borderRadius: '12px',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                          }}
                        />
                        <Bar dataKey="Budget" fill="#1D4ED8" radius={[6, 6, 0, 0]} maxBarSize={34} />
                        <Bar dataKey="Spent" fill="#D97706" radius={[6, 6, 0, 0]} maxBarSize={34} />
                      </BarChart>
                    ) : (
                      <BarChart data={pillarBarData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatINRCompact(Number(v))}
                          tick={{ fill: '#64748B', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={58}
                        />
                        <Tooltip
                          formatter={(value: unknown) => [formatINR(Number(value || 0)), 'Amount']}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E5E7EB',
                            borderRadius: '12px',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                          }}
                        />
                        <Bar dataKey="Amount" radius={[8, 8, 0, 0]} maxBarSize={48}>
                          {pillarBarData.map((entry, idx) => (
                            <Cell key={`pillar-${idx}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 & Compact Health Pulse */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Spend Mix &amp; Health</h3>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0 ${projectHealth === 'Red' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    projectHealth === 'Amber' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${projectHealth === 'Red' ? 'bg-rose-600' : projectHealth === 'Amber' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`} />
                    {projectHealth}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4">
                  <div className="h-[136px] w-[140px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={donutData.length > 1 ? 3 : 0}
                          stroke="none"
                        >
                          {donutData.map((entry, idx) => (
                            <Cell key={`slice-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => formatINR(Number(value || 0))}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E5E7EB',
                            borderRadius: '10px',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-[#F4F6FA] border border-[#E5E7EB] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">BOQ Approved</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {approvedBOQCount}/{projectBOQItems.length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#F4F6FA] border border-[#E5E7EB] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">PO Fulfilled</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {purchaseCompletion === null ? 'No POs' : `${purchaseCompletion}%`}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#F4F6FA] border border-[#E5E7EB] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Site Updates</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {projectDailyUpdates.length} reports
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#F4F6FA] border border-[#E5E7EB] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Client Quotes</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {pendingQuotationCount} pending
                      </span>
                    </div>
                  </div>
                </div>

                {healthReasons.length === 0 ? (
                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/70 px-3.5 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No cost, schedule, purchase, or client payment risks detected.</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 space-y-1.5">
                    {healthReasons.slice(0, 2).map((reason) => (
                      <div key={reason} className="flex items-start gap-2 text-xs text-slate-700">
                        <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${projectHealth === 'Red' ? 'text-rose-600' : 'text-amber-600'}`} />
                        <span>{reason}</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {delayedTasks.length > 0 && (
                        <button onClick={() => setCurrentPage('tasks')} className="rounded-lg bg-white border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                          Review Tasks
                        </button>
                      )}
                      {delayedPurchases.length > 0 && (
                        <button onClick={() => setActiveTab('Materials')} className="rounded-lg bg-white border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                          Follow Up POs
                        </button>
                      )}
                      {overduePayments.length > 0 && (
                        <button onClick={() => { setActiveTab('Finance'); setFinanceSubTab('obligations'); }} className="rounded-lg bg-white border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                          Review Dues
                        </button>
                      )}
                      {projectBOQItems.length > approvedBOQCount && (
                        <button onClick={() => { setActiveTab('Plans'); setPlansSubTab('rooms'); }} className="rounded-lg bg-white border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                          Approve BOQ
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {quotationLoadError && (
                  <p role="alert" className="text-[11px] text-rose-700">
                    Approval status could not be refreshed: {quotationLoadError}
                  </p>
                )}
              </div>
            </div>

            {/* ROW 3: SCHEDULE, PROFITABILITY & ROOM BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Crisp White Architectural Card for Profitability & Timeline (Fixes contrast) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Schedule &amp; Cash</h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setActiveTab('Finance'); setFinanceSubTab('obligations'); }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] text-xs font-semibold transition-colors"
                      >
                        Payments ({projectPayments.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('Materials')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F4F6FA] hover:bg-slate-200 text-slate-700 border border-[#E5E7EB] text-xs font-semibold transition-colors"
                      >
                        Materials ({projectMaterials.length})
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#F4F6FA] border border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-semibold">Start Date</div>
                        <div className="text-xs font-bold text-slate-900">{formatDate(project.startDate)}</div>
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-[11px] text-slate-500 font-semibold">Timeline</div>
                      <div className={`text-xs font-extrabold ${daysInfo.isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {daysInfo.text}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-semibold">Handover</div>
                      <div className="text-xs font-bold text-slate-900">{formatDate(project.deadline)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3.5">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contract Value</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums mt-1 block">
                        {formatINR(profitability.contractValue)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Received</span>
                      <span className="text-sm font-extrabold text-emerald-700 tabular-nums mt-1 block">
                        {formatINR(profitability.revenueReceived)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Actual Cost</span>
                      <span className="text-sm font-extrabold text-amber-700 tabular-nums mt-1 block">
                        {formatINR(profitability.actualCost)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Profit</span>
                      <span className={`text-sm font-extrabold tabular-nums mt-1 block ${profitability.grossProfit >= 0 ? 'text-[#1D4ED8]' : 'text-rose-600'}`}>
                        {formatINR(profitability.grossProfit)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Realized Cash</span>
                      <span className={`text-sm font-extrabold tabular-nums mt-1 block ${profitability.realizedCashPosition >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                        {formatINR(profitability.realizedCashPosition)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Client Dues</span>
                      <span className={`text-sm font-extrabold tabular-nums mt-1 block ${overduePaymentAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatINR(overduePaymentAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room-by-Room Breakdown Card */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Room Breakdown</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {rooms.length}
                    </span>
                  </div>
                  <button
                    onClick={handleAddRoom}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8] text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room</span>
                  </button>
                </div>

                {rooms.length === 0 ? (
                  <EmptyState
                    icon={LayoutGrid}
                    title="No rooms created yet"
                    description="Add rooms like Living Room, Kitchen, and Master Bedroom to track space-level budgets and expenses."
                    actionLabel="Add First Room"
                    onAction={handleAddRoom}
                  />
                ) : (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {rooms.map((room) => {
                      const roomSpent = calculateRoomSpent(room.id, expenses);
                      const roomMetrics = calculateBudgetMetrics(room.budget, roomSpent);

                      return (
                        <div key={room.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F4F6FA] transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{room.name}</span>
                              {room.room_type && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] font-semibold text-slate-600">
                                  {room.room_type}
                                </span>
                              )}
                              {room.area_sqft && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-[#1D4ED8] font-semibold border border-blue-100">
                                  {room.area_sqft} sqft · ₹{room.rate_per_sqft || 250}/sqft
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge status={room.status || roomMetrics.health.status} size="sm" />
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                                title="Edit Room"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs mb-2 tabular-nums">
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Budget</span>
                              <div className="font-bold text-slate-800">{formatINR(room.budget)}</div>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Spent</span>
                              <div className="font-bold text-[#1D4ED8]">{formatINR(roomSpent)}</div>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Remaining</span>
                              <div className={`font-bold ${roomMetrics.isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {formatINR(roomMetrics.remaining)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <ProgressBar value={roomMetrics.utilization || 0} height="sm" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                              {roomMetrics.utilization !== null ? `${roomMetrics.utilization.toFixed(0)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── TAB 2: FINANCE MANAGEMENT ── */}
      {activeTab === 'Finance' && (
        <ProjectFinanceSection
          project={project}
          profitability={profitability}
          projectPayments={projectPayments}
          projectPaymentTransactions={projectPaymentTransactions}
          projectExpenses={projectExpenses}
          rooms={rooms}
          activeSubTab={financeSubTab}
          onSubTabChange={setFinanceSubTab}
          onOpenRecordPayment={(obligationId) => {
            setRecordPaymentDefaultObligationId(obligationId);
            setIsRecordPaymentModalOpen(true);
          }}
          onOpenAddMilestone={() => {
            setProjectPaymentToEdit(null);
            setIsProjectPaymentModalOpen(true);
          }}
          onEditPayment={(payment) => {
            setProjectPaymentToEdit(payment);
            setIsProjectPaymentModalOpen(true);
          }}
          onDeletePayment={(payment) => {
            setPaymentToDelete(payment);
          }}
          onDeleteTransaction={deletePaymentTransaction}
          onOpenAddExpense={() => setIsAddExpenseModalOpen(true, project.id)}
          onEditExpense={(exp) => setIsAddExpenseModalOpen(true, project.id, exp)}
          onDeleteExpense={(exp) => setExpenseToDelete(exp)}
        />
      )}

      {/* ── TAB 3: MATERIAL MANAGEMENT ── */}
      {activeTab === 'Materials' && (
        <ProjectMaterialsSection
          projectId={project.id}
          materials={projectMaterials}
          materialTransactions={materialTransactions}
          rooms={rooms}
          onOpenAddMaterial={() => setIsMaterialModalOpen(true)}
          onOpenImportMaterials={() => setIsMaterialImportModalOpen(true)}
          onOpenReceiveStock={(mat) => setIsMaterialTransactionModalOpen(true, mat, 'in')}
          onOpenStockHistory={(mat) => setHistoryMaterial(mat)}
          onEditMaterial={(mat) => setIsMaterialModalOpen(true, mat)}
          onDeleteMaterial={(mat) => setMaterialToDelete(mat)}
        />
      )}

      {/* ── TAB 4: MILESTONES & SITE EXECUTION ── */}
      {activeTab === 'Milestones' && (
        <ProjectMilestonesSection
          project={project}
          milestones={projectMilestones}
          dailyUpdates={projectDailyUpdates}
          tasks={projectTasks}
          activeSubTab={milestoneSubTab}
          onSubTabChange={setMilestoneSubTab}
          onOpenAddMilestone={() => setIsMilestoneModalOpen(true)}
          onEditMilestone={(ms) => setIsMilestoneModalOpen(true, ms)}
          onDeleteMilestone={(id) => deleteMilestone(id)}
          onUpdateMilestone={updateMilestone}
          onOpenAddDailyUpdate={() => setIsDailyUpdateModalOpen(true)}
          onEditDailyUpdate={(u) => setIsDailyUpdateModalOpen(true, u)}
          onDeleteDailyUpdate={(id) => deleteDailyUpdate(id)}
          onOpenAddTask={() => {
            setProjectTaskToEdit(null);
            setIsProjectTaskModalOpen(true);
          }}
          onEditTask={(t) => {
            setProjectTaskToEdit(t);
            setIsProjectTaskModalOpen(true);
          }}
          onDeleteTask={(id) => deleteTask(id)}
          onToggleTaskComplete={(t) => updateTask(t.id, { status: t.status === 'Completed' ? 'To Do' : 'Completed' })}
        />
      )}

      {/* ── TAB 5: PLANS & BLUEPRINTS ── */}
      {activeTab === 'Plans' && (
        <ProjectPlansSection
          project={project}
          documents={projectDocuments}
          rooms={rooms}
          boqItems={projectBOQItems}
          clientRequests={clientRequests}
          activeSubTab={plansSubTab}
          onSubTabChange={setPlansSubTab}
          onOpenUploadDocument={() => setIsProjectUploadDocModalOpen(true)}
          onDownloadDocument={async (doc) => {
            if (doc.storage_path && !isDemoMode) {
              const url = await documentService.getSignedUrl(doc.storage_path);
              window.open(url, '_blank');
            } else if (doc.fileUrl) {
              window.open(doc.fileUrl, '_blank');
            } else {
              alert(`Downloaded blueprint: "${doc.title}"`);
            }
          }}
          onDeleteDocument={(id, storagePath) => deleteDocument(id, storagePath)}
          onOpenAddRoom={() => handleAddRoom()}
          onEditRoom={(r) => handleEditRoom(r)}
          onDeleteRoom={(r) => setRoomToDelete(r)}
          onOpenAddBOQItem={(roomId) => setIsBOQModalOpen(true, project.id, roomId)}
          onApproveClientRequest={(id) => handleApproveClientRequest(id)}
        />
      )}

      {/* ========================================================================= */}
      {/* ALL MODALS & DRAWERS */}
      {/* ========================================================================= */}

      {/* Project Task Modal */}
      <TaskModal
        isOpen={isProjectTaskModalOpen}
        onClose={() => {
          setIsProjectTaskModalOpen(false);
          setProjectTaskToEdit(null);
        }}
        defaultProjectId={project.id}
        taskToEdit={projectTaskToEdit}
      />

      {/* Project Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isProjectUploadDocModalOpen}
        onClose={() => setIsProjectUploadDocModalOpen(false)}
        defaultProjectId={project.id}
      />

      {/* Record Partial Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => {
          setIsRecordPaymentModalOpen(false);
          setRecordPaymentDefaultObligationId(undefined);
        }}
        projectId={project.id}
        defaultObligationId={recordPaymentDefaultObligationId}
      />

      {/* Material Document Importer Modal */}
      <MaterialImportModal
        isOpen={isMaterialImportModalOpen}
        onClose={() => setIsMaterialImportModalOpen(false)}
        projectId={project.id}
      />

      {/* Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        projectId={project.id}
        roomToEdit={roomToEdit}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        projectId={project.id}
      />

      {/* Phase 6 Material Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        projectId={project.id}
        rooms={rooms}
        materialToEdit={materialToEdit}
      />

      {/* Phase 6 Material Transaction Modal (Stock IN / OUT) */}
      <MaterialTransactionModal
        isOpen={isMaterialTransactionModalOpen}
        onClose={() => setIsMaterialTransactionModalOpen(false)}
        material={selectedMaterialForTransaction}
        availableStock={
          selectedMaterialForTransaction
            ? materialService.calculateStock(selectedMaterialForTransaction.id, materialTransactions, selectedMaterialForTransaction.minimum_stock).available
            : 0
        }
        rooms={rooms}
        defaultType={materialTransactionType}
      />

      {/* Phase 6 Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        projectId={project.id}
        milestoneToEdit={milestoneToEdit}
      />

      {/* Phase 6 Daily Update Modal */}
      <DailyUpdateModal
        isOpen={isDailyUpdateModalOpen}
        onClose={() => setIsDailyUpdateModalOpen(false)}
        projectId={project.id}
        updateToEdit={dailyUpdateToEdit}
      />

      {/* Phase 6 Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isUploadPhotoModalOpen}
        onClose={() => setIsUploadPhotoModalOpen(false)}
        projectId={project.id}
        dailyUpdates={projectDailyUpdates}
        defaultDailyUpdateId={defaultPhotoDailyUpdateId}
      />

      {/* Material Stock Transaction History Drawer / Modal */}
      {historyMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock History: {historyMaterial.name}</h3>
                <p className="text-xs text-slate-500">Full audit log of receipts (IN) and consumption (OUT).</p>
              </div>
              <button
                onClick={() => setHistoryMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {materialTransactions.filter(t => t.material_id === historyMaterial.id).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No stock transactions recorded yet for this material.
                </div>
              ) : (
                materialTransactions
                  .filter(t => t.material_id === historyMaterial.id)
                  .map(tx => (
                    <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg font-black text-xs ${tx.transaction_type === 'in'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}>
                          {tx.transaction_type === 'in' ? '+ IN' : '- OUT'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {tx.transaction_type === 'in' ? '+' : '-'}{tx.quantity} {historyMaterial.unit}
                          </div>
                          {tx.notes && <div className="text-[11px] text-slate-500">{tx.notes}</div>}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(tx.transaction_date)}</span>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryMaterial(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Viewer */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 text-center text-white">
              <h4 className="font-bold text-sm">{lightboxPhoto.title}</h4>
              <p className="text-xs text-white/60 mt-0.5">{lightboxPhoto.category} • Uploaded {formatDate(lightboxPhoto.uploadedAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation Modal */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Room: {roomToDelete.name}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to delete this room scope? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoom}
                disabled={isDeletingRoom}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingRoom ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete BOQ Confirmation Modal */}
      {boqToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete BOQ Item: {boqToDelete.item_name}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to remove this estimate line ({formatINR(boqToDelete.estimated_cost)})? This will recalculate project and room BOQ totals immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setBOQToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBOQItem}
                disabled={isDeletingBOQ}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingBOQ ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Expense: {expenseToDelete.title}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to remove this ledger entry of {formatINR(expenseToDelete.amount)}? Project, room, and dashboard spending will be recalculated immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                disabled={isDeletingExpense}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingExpense ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Modal */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Material: {materialToDelete.name}?
            </h3>
            {materialDeleteError ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs mb-4">
                {materialDeleteError}
              </div>
            ) : (
              <p className="text-xs text-slate-600 font-medium mb-4">
                Are you sure you want to delete this material? If transactions exist, deletion will be safely blocked to preserve stock audit logs.
              </p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setMaterialToDelete(null);
                  setMaterialDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                {materialDeleteError ? 'Close' : 'Cancel'}
              </button>
              {!materialDeleteError && (
                <button
                  onClick={confirmDeleteMaterial}
                  disabled={isDeletingMaterial}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isDeletingMaterial ? 'Deleting...' : 'Delete Material'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation Modal */}
      {milestoneToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Milestone: {milestoneToDelete.title}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to delete this milestone? Project progress percentage will be recalculated across remaining milestones.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMilestoneToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMilestone}
                disabled={isDeletingMilestone}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingMilestone ? 'Deleting...' : 'Delete Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Daily Update Confirmation Modal */}
      {dailyUpdateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Daily Report ({formatDate(dailyUpdateToDelete.update_date)})?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to remove this daily site update?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDailyUpdateToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDailyUpdate}
                disabled={isDeletingDailyUpdate}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingDailyUpdate ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Photo: {photoToDelete.title}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              This will permanently delete this image from your private storage and project gallery.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePhoto}
                disabled={isDeletingPhoto}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingPhoto ? 'Deleting...' : 'Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Milestone: {paymentToDelete.title || paymentToDelete.milestone_name}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to remove this client payment entry of {formatINR(paymentToDelete.amount)}? Revenue collected and project cash flow calculations will be updated immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePayment}
                disabled={isDeletingPayment}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingPayment ? 'Deleting...' : 'Delete Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Purchase Order Confirmation Modal */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete PO: {purchaseToDelete.po_number || 'Purchase Order'}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to delete this purchase order of {formatINR(purchaseToDelete.total_amount)} and its associated line items?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPurchaseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePurchase}
                disabled={isDeletingPurchase}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingPurchase ? 'Deleting...' : 'Delete PO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Payment Modal */}
      <ClientPaymentModal
        isOpen={isProjectPaymentModalOpen}
        onClose={() => {
          setIsProjectPaymentModalOpen(false);
          setProjectPaymentToEdit(null);
        }}
        defaultProjectId={project.id}
        paymentToEdit={projectPaymentToEdit}
      />

      {/* Purchase Order Modal */}
      <PurchaseModal
        isOpen={isProjectPurchaseModalOpen}
        onClose={() => {
          setIsProjectPurchaseModalOpen(false);
          setProjectPurchaseToEdit(null);
        }}
        defaultProjectId={project.id}
        purchaseToEdit={projectPurchaseToEdit}
      />

      {/* Delete Project Confirmation Modal */}
      {isDeleteProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Project: {project.name}?
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Are you sure you want to delete this project? All associated rooms, BOQ lines, expenses, and scope records will also be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteProjectOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                disabled={isDeletingProject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingProject ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Record Client Requirement Modal */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Client Requirement</h3>
                  <p className="text-[11px] text-slate-500">Capture client scope requests directly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReqModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room / Space</label>
                <select
                  value={newReqSpace}
                  onChange={(e) => setNewReqSpace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-brand-600"
                >
                  {(project.rooms && project.rooms.length > 0) ? (
                    project.rooms.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Living Room">Living Room</option>
                      <option value="Master Bedroom">Master Bedroom</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Dining Area">Dining Area</option>
                      <option value="Balcony / Utility">Balcony / Utility</option>
                      <option value="General Scope">General Scope</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fluted Charcoal Panelling behind TV"
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details &amp; Specifications</label>
                <textarea
                  rows={3}
                  placeholder="Enter specifications, material preference, dimensions or special notes..."
                  value={newReqDetails}
                  onChange={(e) => setNewReqDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-brand-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewReqPriority('Standard')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${newReqPriority === 'Standard'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewReqPriority('High')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${newReqPriority === 'High'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    High Priority
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddReqModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionToast.message}</span>
        </div>
      )}
    </div>
  );
};
