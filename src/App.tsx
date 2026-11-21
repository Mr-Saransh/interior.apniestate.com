// ==============================================================================
// APNI ESTATE INTERIORS - MAIN APPLICATION ROUTER & MODAL MOUNT
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthScreen } from './components/auth/AuthScreen';
import { ProfileSetupScreen } from './components/auth/ProfileSetupScreen';
import { SubscriptionScreen } from './components/auth/SubscriptionScreen';
import { TrialPendingScreen } from './components/auth/TrialPendingScreen';
import { TrialExpiredScreen } from './components/auth/TrialExpiredScreen';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ClientsPage } from './pages/ClientsPage';
import { LeadsPage } from './pages/LeadsPage';
import { TasksPage } from './pages/TasksPage';
import { TeamPage } from './pages/TeamPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPage } from './pages/BudgetPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { VendorsPage } from './pages/VendorsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { CalendarPage } from './pages/CalendarPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { BranchesPage } from './pages/BranchesPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { EnterpriseManagementPage } from './pages/EnterpriseManagementPage';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { DataExportPage } from './pages/DataExportPage';
import { QuotationsPage, SharedQuotationPage } from './pages/QuotationsPage';
import { ChangeRequestsPage, SharedChangeRequestPage } from './pages/ChangeRequestsPage';
import { ClientPortalPage, SharedClientPortalPage } from './pages/ClientPortalPage';
import { SiteControlsPage } from './pages/SiteControlsPage';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { PricingModal } from './components/modals/PricingModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { BOQModal } from './components/modals/BOQModal';
import { GenericQuotationModal } from './components/quotations/GenericQuotationModal';
import { SpecificQuotationModal } from './components/quotations/SpecificQuotationModal';
import { Building2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    currentPage, 
    isBOQModalOpen, 
    setIsBOQModalOpen, 
    boqModalProjectId, 
    boqModalDefaultRoomId, 
    boqItemToEdit,
    isGenericQuoteModalOpen,
    setIsGenericQuoteModalOpen,
    isSpecificQuoteModalOpen,
    setIsSpecificQuoteModalOpen,
    specificQuoteProjectId,
    addProject
  } = useApp();

  const { 
    loading, 
    isAuthenticated, 
    currentUser, 
    isTrialExpired, 
    signOut, 
    refreshProfile 
  } = useAuth();

  const [unauthView, setUnauthView] = useState<'landing' | 'auth'>('landing');
  const [activeScreenOverride, setActiveScreenOverride] = useState<'subscription' | null>(null);

  // Check URL routes & tokens
  const urlPath = window.location.pathname;
  const urlSearch = window.location.search;
  const urlHash = window.location.hash;

  const isAdminRoute = urlPath.includes('/login-admin') || 
                       urlSearch.includes('login-admin') || 
                       urlHash.includes('login-admin');

  const sharedQuotationToken = new URLSearchParams(window.location.search).get('quote');
  const sharedChangeRequestToken = new URLSearchParams(window.location.search).get('change');
  const sharedPortalToken = new URLSearchParams(window.location.search).get('portal');

  // 1. Admin Portal Gate (/login-admin)
  if (isAdminRoute) {
    return <AdminPortalPage />;
  }

  // 2. Client Shared Pages
  if (sharedQuotationToken) {
    return <SharedQuotationPage token={sharedQuotationToken} />;
  }
  if (sharedChangeRequestToken) {
    return <SharedChangeRequestPage token={sharedChangeRequestToken} />;
  }
  if (sharedPortalToken) {
    return <SharedClientPortalPage token={sharedPortalToken} />;
  }

  // 3. Initial Auth Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="font-display font-extrabold text-xl tracking-tight text-[#111827] mb-1">
          APNI ESTATE INTERIORS
        </h2>
        <p className="text-xs text-slate-500">Loading your studio workspace...</p>
      </div>
    );
  }

  // 4. Unauthenticated User Flow: Landing Page ↔ Auth Screen
  if (!isAuthenticated || !currentUser) {
    if (unauthView === 'landing') {
      return (
        <LandingPage 
          onStartTrial={() => setUnauthView('auth')}
          onExploreDemo={() => setUnauthView('auth')}
        />
      );
    }
    return (
      <div className="relative">
        <button
          onClick={() => setUnauthView('landing')}
          className="absolute top-4 left-4 z-50 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs cursor-pointer"
        >
          ← Back to Overview
        </button>
        <AuthScreen />
      </div>
    );
  }

  // 5. Authenticated Step 2: Incomplete Studio Profile Setup
  if (currentUser.status === 'pending_profile') {
    return (
      <ProfileSetupScreen
        currentUser={currentUser}
        onComplete={() => {
          refreshProfile();
          setActiveScreenOverride('subscription');
        }}
        onSignOut={signOut}
      />
    );
  }

  // 6. Subscription Screen (Explicitly opened or post-profile setup)
  if (activeScreenOverride === 'subscription') {
    return (
      <SubscriptionScreen
        currentUser={currentUser}
        onRequestTrial={() => {
          refreshProfile();
          setActiveScreenOverride(null);
        }}
        onPaymentSuccess={() => {
          refreshProfile();
          setActiveScreenOverride(null);
        }}
        onSignOut={signOut}
      />
    );
  }

  // 7. Authenticated Step 3: 7-Day Free Trial Pending Approval
  if (currentUser.status === 'pending_approval') {
    return (
      <TrialPendingScreen
        currentUser={currentUser}
        onCheckStatus={refreshProfile}
        onOpenSubscription={() => setActiveScreenOverride('subscription')}
        onSignOut={signOut}
      />
    );
  }

  // 8. Authenticated User with Expired Trial
  if (currentUser.status === 'expired' || isTrialExpired) {
    return <TrialExpiredScreen />;
  }

  // 9. Authenticated with Active 7-Day Trial OR Paid Subscription
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'clients':
        return <ClientsPage />;
      case 'leads':
        return <LeadsPage />;
      case 'quotations':
        return <QuotationsPage />;
      case 'change-requests':
        return <ChangeRequestsPage />;
      case 'site-controls':
        return <SiteControlsPage />;
      case 'client-portal':
        return <ClientPortalPage />;
      case 'tasks':
        return <TasksPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'vendors':
        return <VendorsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'team':
        return <TeamPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'management':
        return <EnterpriseManagementPage />;
      case 'branches':
        return <BranchesPage />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'roles':
        return <RolesPermissionsPage />;
      case 'export':
        return <DataExportPage />;
      case 'settings':
        return <SettingsPage />;
      case 'project-detail':
        return <ProjectDetailPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'workspace':
        return <WorkspacePage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <AppLayout>
      {renderCurrentPage()}

      {/* Global Application Modals */}
      <NewProjectModal />
      <AddExpenseModal />
      <BOQModal
        isOpen={isBOQModalOpen}
        onClose={() => setIsBOQModalOpen(false)}
        projectId={boqModalProjectId}
        defaultRoomId={boqModalDefaultRoomId}
        itemToEdit={boqItemToEdit}
      />
      <GenericQuotationModal
        isOpen={isGenericQuoteModalOpen}
        onClose={() => setIsGenericQuoteModalOpen(false)}
        onSaveAsProject={async (data) => {
          try {
            await addProject(data);
          } catch (e) {
            console.error('Save project error:', e);
          }
        }}
      />
      <SpecificQuotationModal
        isOpen={isSpecificQuoteModalOpen}
        onClose={() => setIsSpecificQuoteModalOpen(false)}
        defaultProjectId={specificQuoteProjectId}
      />
      <PricingModal />
      <NotificationsDrawer />
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
