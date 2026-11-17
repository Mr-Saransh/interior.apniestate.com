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
      case 'overview': return 'Overview';
      case 'projects': return 'Projects';
      case 'clients': return 'Clients';
      case 'leads': return 'Leads';
      case 'quotations': return 'Quotations';
      case 'change-requests': return 'Change Requests';
      case 'site-controls': return 'Site Bills';
      case 'client-portal': return 'Client Portal';
      case 'tasks': return 'Tasks';
      case 'documents': return 'Documents';
      case 'vendors': return 'Vendors';
      case 'payments': return 'Payments';
      case 'purchases': return 'Orders';
      case 'expenses': return 'Expenses';
      case 'budget': return 'Budget';
      case 'reports': return 'Reports';
      case 'team': return 'Team';
      case 'management': return 'Analytics';
      case 'branches': return 'Branches';
      case 'approvals': return 'Approvals';
      case 'roles': return 'Permissions';
      case 'export': return 'Export';
      case 'settings': return 'Settings';
      case 'project-detail': return selectedProject ? selectedProject.name : 'Project Workspace';
      case 'calendar': return 'Schedule & Tasks';
      case 'workspace': return 'Workspace';
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
    <header className="app-topbar px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 bg-[#1D4ED8] border-b border-blue-800/60 text-white shadow-xs">
      {/* Left: Mobile Drawer Trigger + Contextual Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-white truncate">
            {getPageTitle()}
          </h1>
          {currentPage === 'project-detail' && selectedProject && (
            <p className="text-[11px] text-blue-100 font-editorial italic truncate">
              Client: {selectedProject.client}
            </p>
          )}
        </div>

        {/* Mobile & Tablet Mode Switch Pill */}
        <div className="lg:hidden flex items-center bg-blue-950/70 p-0.5 rounded-lg border border-blue-400/30 ml-1">
          <button
            type="button"
            onClick={() => setWorkspaceMode('erp')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
              workspaceMode === 'erp' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-amber-200 hover:text-white'
            }`}
          >
            ERP
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('crm')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
              workspaceMode === 'crm' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-amber-200 hover:text-white'
            }`}
          >
            CRM
          </button>
        </div>
      </div>

      {/* Center: Search Input */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-blue-200 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, clients, expenses, BOQs..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-blue-800/50 hover:bg-blue-800/70 focus:bg-white text-xs text-white focus:text-[#111827] placeholder-blue-200/70 focus:placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-blue-400/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-100 hover:text-white bg-blue-900/70 rounded px-1.5 py-0.5"
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
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Quote Estimator</span>
        </button>

        {/* Pinned Primary Action Button */}
        <button
          onClick={handleHeaderAction}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#1D4ED8] text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{workspaceMode === 'erp' ? 'New Project' : 'New Lead'}</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#1D4ED8]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Demo Mode Badge / Trial Pill */}
        {isDemoMode && !user ? (
          <button
            onClick={() => setIsDemoMode(false)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs transition-all cursor-pointer border border-amber-300"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-950" />
            <span>Demo</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-white" />
            <span>
              {trialStatus === 'active' ? 'Active' : `${daysRemaining}d Trial`}
            </span>
          </button>
        )}

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
          >
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white text-[10px] font-bold text-[#1D4ED8] ring-2 ring-white/30">
              <span aria-hidden="true">{displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span>
              {profile?.avatar_url && <img
                src={profile.avatar_url}
                alt=""
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-200 transition-transform ${isProfileMenuOpen ? 'rotate-180 text-white' : ''}`} />
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
