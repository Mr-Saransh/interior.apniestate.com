import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  LogOut, 
  Settings, 
  CreditCard,
  ChevronDown,
  Building2,
  ExternalLink,
  Menu,
  Plus,
  FolderKanban,
  Users,
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const TopBar: React.FC = () => {
  const { 
    currentPage,
    globalSearch, 
    setGlobalSearch, 
    setIsPricingModalOpen,
    setIsNewProjectModalOpen,
    notifications,
    setIsNotificationsOpen,
    setIsMobileMenuOpen,
    setCurrentPage,
    workspaceMode,
    setWorkspaceMode,
    setIsGenericQuoteModalOpen,
    projects,
    selectedProjectId
  } = useApp();

  const { 
    user, 
    profile, 
    organization, 
    signOut, 
    daysRemaining, 
    trialStatus, 
    isDemoMode,
    setIsDemoMode
  } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile?.full_name || (isDemoMode ? 'Aarav Mehta' : 'Studio Owner');
  const userEmail = user?.email || (isDemoMode ? 'aarav@mehtadesign.in' : '');
  const studioName = organization?.name || (isDemoMode ? 'Apni Estate Interiors' : 'My Studio');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Page title calculation with interior design context
  const getPageTitle = () => {
    switch (currentPage) {
      case 'overview': return workspaceMode === 'crm' ? 'CRM Overview' : 'Studio Overview';
      case 'projects': return 'Projects & Rooms';
      case 'clients': return 'Client Directory';
      case 'leads': return 'Lead Pipeline';
      case 'quotations': return 'Design Proposals & Sign-offs';
      case 'change-requests': return 'Change Requests';
      case 'site-controls': return 'Site Controls & Contractor Bills';
      case 'client-portal': return 'Client Portal';
      case 'tasks': return 'Tasks & Follow-ups';
      case 'documents': return 'Drawings & Briefs';
      case 'vendors': return 'Vendor Directory';
      case 'payments': return 'Client Payments & Invoicing';
      case 'purchases': return 'Purchase Orders';
      case 'expenses': return 'Expense Ledger';
      case 'budget': return 'Budget Analytics';
      case 'reports': return 'Reports & Insights';
      case 'team': return 'Studio Team';
      case 'management': return 'Multi-Branch Management';
      case 'branches': return 'Branches';
      case 'approvals': return 'Approvals';
      case 'roles': return 'Roles & Permissions';
      case 'export': return 'Data Export';
      case 'settings': return 'Studio Settings';
      case 'project-detail': return selectedProject ? selectedProject.name : 'Project Workspace';
      case 'calendar': return 'Studio Calendar';
      case 'workspace': return 'Team Workspace';
      default: return 'Overview';
    }
  };

  const handleHeaderAction = () => {
    if (workspaceMode === 'erp') {
      setIsNewProjectModalOpen(true);
    } else {
      setCurrentPage('leads');
    }
  };

  return (
    <header className="app-topbar px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 bg-white border-b border-[#E5E7EB]">
      {/* Left: Mobile Drawer Trigger + Contextual Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-[#111827] truncate">
            {getPageTitle()}
          </h1>
          {currentPage === 'project-detail' && selectedProject && (
            <p className="text-[11px] text-slate-500 font-editorial italic truncate">
              Client: {selectedProject.client}
            </p>
          )}
        </div>

        {/* Mobile & Tablet Mode Switch Pill */}
        <div className="lg:hidden flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 ml-1">
          <button
            type="button"
            onClick={() => setWorkspaceMode('erp')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              workspaceMode === 'erp' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ERP
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('crm')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              workspaceMode === 'crm' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            CRM
          </button>
        </div>
      </div>

      {/* Center: Search Input */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, clients, expenses, BOQs..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#F4F6FA] hover:bg-slate-100 focus:bg-white text-xs text-[#111827] placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-[#E5E7EB] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Primary Action Button (Fitts's Law) + Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Quick Generic Estimator */}
        <button
          onClick={() => setIsGenericQuoteModalOpen(true)}
          title="Open Instant Interior Quotation Estimator"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#1D4ED8] border border-[#E5E7EB] hover:border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Quote Estimator</span>
        </button>

        {/* Pinned Primary Action Button */}
        <button
          onClick={handleHeaderAction}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{workspaceMode === 'erp' ? 'New Project' : 'New Lead'}</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Demo Mode Badge / Trial Pill */}
        {isDemoMode && !user ? (
          <button
            onClick={() => setIsDemoMode(false)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Demo</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 text-xs font-semibold hover:border-blue-300 transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>
              {trialStatus === 'active' ? 'Active' : `${daysRemaining}d Trial`}
            </span>
          </button>
        )}

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#EFF6FF] text-[10px] font-bold text-[#1D4ED8] ring-1 ring-blue-200">
              <span aria-hidden="true">{displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span>
              {profile?.avatar_url && <img
                src={profile.avatar_url}
                alt=""
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-[#E5E7EB] py-2 z-50 animate-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-xs text-[#111827] truncate">{displayName}</div>
                {userEmail && <div className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</div>}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-blue-200 truncate">
                    {studioName}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentPage('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Studio Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsPricingModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Plans & Invoicing</span>
                </button>

                {isDemoMode && !user && (
                  <button
                    onClick={() => {
                      setIsDemoMode(false);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-amber-700 hover:bg-amber-50 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-600" />
                    <span>Exit Demo & Sign Up</span>
                  </button>
                )}
              </div>

              {user && (
                <div className="pt-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
