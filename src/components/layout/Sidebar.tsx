// ==============================================================================
// APNI ESTATE INTERIORS - COLLAPSIBLE ARCHITECTURAL SIDEBAR (ERP ↔ CRM SWITCH)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserPlus,
  CheckSquare,
  FileText,
  Receipt,
  PieChart,
  Settings,
  Crown,
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronDown,
  X,
  UserCheck,
  Building2,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  Building,
  ShieldCheck,
  Shield,
  FileSpreadsheet,
  FileCheck2,
  Layers,
  Briefcase,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal
} from 'lucide-react';
import { useApp, NavigationPage, WorkspaceMode } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getPlanDetails, canUseFeature } from '../../lib/entitlements';

interface SidebarNavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: 'default' | 'amber' | 'blue';
}

const COLLAPSE_STORAGE_KEY = 'apni_estate_sidebar_collapsed';

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    workspaceMode,
    setWorkspaceMode,
    setIsPricingModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    stats,
    leads,
    tasks,
    documents,
    teamMembers,
    vendors,
    purchases
  } = useApp();

  const { user, profile, organization, currentUser, daysRemaining, trialStatus, signOut } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const activeLeadsCount = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const activeOrdersCount = purchases.filter(p => p.status === 'Ordered' || p.status === 'Partially Received').length;

  const hasEnterpriseAccess = canUseFeature(organization, 'multi_branch');
  const hasExportAccess = canUseFeature(organization, 'data_export');

  // 1. Primary ERP Mode Navigation
  const erpNavItems: SidebarNavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: stats.activeProjectsCount },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'purchases', label: 'Orders', icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { id: 'calendar', label: 'Schedule & Tasks', icon: CalendarDays },
  ];

  // 2. Primary CRM Mode Navigation
  const crmNavItems: SidebarNavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserPlus, badge: activeLeadsCount > 0 ? activeLeadsCount : undefined, badgeVariant: 'blue' },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'quotations', label: 'Quotations', icon: FileCheck2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'calendar', label: 'Schedule', icon: CalendarDays },
  ];

  // 3. Secondary Tools & Studio Management
  const secondaryNavItems: SidebarNavItem[] = workspaceMode === 'erp'
    ? [
        { id: 'site-controls', label: 'Site Bills', icon: Layers },
        { id: 'vendors', label: 'Vendors', icon: Building2, badge: vendors.length > 0 ? vendors.length : undefined },
        { id: 'budget', label: 'Budget', icon: PieChart },
      ]
    : [
        { id: 'client-portal', label: 'Client Portal', icon: Briefcase },
        { id: 'documents', label: 'Documents', icon: FileText, badge: documents.length > 0 ? documents.length : undefined },
      ];

  const adminNavItems: SidebarNavItem[] = [
    ...secondaryNavItems,
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    ...(hasExportAccess ? [{ id: 'export' as NavigationPage, label: 'Export', icon: FileSpreadsheet }] : []),
    { id: 'team', label: 'Team', icon: UserCheck, badge: teamMembers.length },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(hasEnterpriseAccess ? [
      { id: 'management' as NavigationPage, label: 'Analytics HQ', icon: TrendingUp },
      { id: 'branches' as NavigationPage, label: 'Branches', icon: Building },
      { id: 'approvals' as NavigationPage, label: 'Approvals', icon: ShieldCheck },
      { id: 'roles' as NavigationPage, label: 'Permissions', icon: Shield }
    ] : [])
  ];

  const isSecondaryActive = adminNavItems.some((item) => item.id === currentPage);
  const [isMoreExpanded, setIsMoreExpanded] = useState(false);

  const roleDisplay = () => {
    if (!profile) return 'Studio Owner';
    switch (profile.role) {
      case 'owner': return 'Studio Owner';
      case 'designer': return 'Lead Designer';
      case 'supervisor': return 'Site Supervisor';
      default: return 'Studio Owner';
    }
  };

  const displayName = profile?.full_name || currentUser?.fullName || 'Studio Owner';
  const studioName = organization?.name || currentUser?.studioName || 'My Studio';
  const planInfo = getPlanDetails(organization?.plan);
  const planDisplayName = planInfo?.name ? planInfo.name.toUpperCase() : 'PROFESSIONAL';

  const handleNavClick = (pageId: NavigationPage) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleModeSwitch = (mode: WorkspaceMode) => {
    if (mode === workspaceMode) return;
    setIsMobileMenuOpen(false);
    setWorkspaceMode(mode);
  };

  const currentModeItems = workspaceMode === 'erp' ? erpNavItems : crmNavItems;

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full select-none bg-[#1D4ED8] text-white">
        {/* ── Brand Header & Collapse Control ── */}
        <div className={`${collapsed ? 'p-3 pb-3' : 'p-4 sm:p-5 pb-3'} border-b border-blue-800/60`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src="/apni_estate_logo.png"
                alt="Apni Estate"
                className="w-8 h-8 rounded-lg object-contain shrink-0 bg-white p-0.5 shadow-xs"
                title={studioName}
              />
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
                className="w-9 h-8 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/apni_estate_logo.png"
                  alt="Apni Estate"
                  className="w-8 h-8 rounded-lg object-contain shrink-0 bg-white p-0.5 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-amber-300 tracking-[0.16em] uppercase truncate font-display">
                      {studioName.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] font-extrabold tracking-widest text-amber-950 uppercase bg-amber-400 px-1.5 py-0.5 rounded">
                      INTERIORS
                    </span>
                  </div>
                </div>
              </div>

              {isMobile ? (
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                  className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ── Compact Segmented Mode Switch ── */}
          {collapsed ? (
            <div className="mt-3 flex flex-col gap-1 p-1 rounded-xl bg-blue-950/70 border border-blue-400/30">
              <button
                type="button"
                onClick={() => handleModeSwitch('erp')}
                title="Interior ERP Mode (Alt+S)"
                className={`py-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  workspaceMode === 'erp'
                    ? 'bg-amber-400 text-amber-950 shadow-xs font-bold'
                    : 'text-amber-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('crm')}
                title="Studio CRM Mode (Alt+S)"
                className={`py-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  workspaceMode === 'crm'
                    ? 'bg-amber-400 text-amber-950 shadow-xs font-bold'
                    : 'text-amber-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-3 px-1">
              <div className="max-w-[196px] mx-auto p-1 rounded-xl bg-blue-950/80 border border-blue-400/40 flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('erp')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    workspaceMode === 'erp'
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'text-amber-200/90 hover:text-white hover:bg-white/10'
                  }`}
                  title="Interior ERP: Operations, BOQs, Site & Budgets (Alt+S)"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>ERP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeSwitch('crm')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    workspaceMode === 'crm'
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'text-amber-200/90 hover:text-white hover:bg-white/10'
                  }`}
                  title="Studio CRM: Clients, Proposals & Leads (Alt+S)"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>CRM</span>
                </button>
              </div>

              <div className="flex items-center justify-between px-2.5 mt-1.5 text-[10px] text-amber-200/80">
                <span className="font-semibold">
                  {workspaceMode === 'erp' ? 'Interior ERP' : 'Studio CRM'}
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-blue-950/60 text-amber-200 font-mono text-[9px] border border-blue-400/25">
                  Alt+S
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Links ── */}
        <div className={`flex-1 ${collapsed ? 'px-2.5 py-3' : 'px-3 py-3'} space-y-4 overflow-y-auto no-scrollbar`}>
          {/* Active Mode Nav */}
          <div key={workspaceMode} className="space-y-1 animate-mode-slide">
            {!collapsed && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-amber-200/90 uppercase tracking-wider">
                {workspaceMode === 'erp' ? 'Core Operations' : 'Client & Pipeline'}
              </div>
            )}

            {currentModeItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'projects' && currentPage === 'project-detail');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={`sidebar-nav-item relative ${collapsed ? 'collapsed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" aria-hidden="true" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#1D4ED8]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Collapsible Studio & Admin Tools */}
          <div className="pt-2 border-t border-blue-800/60 space-y-1">
            {collapsed ? (
              <button
                type="button"
                onClick={() => setIsMoreExpanded((prev) => !prev)}
                title="Studio & Admin Tools"
                aria-label="Toggle Studio & Admin Tools"
                className={`sidebar-nav-item collapsed ${isMoreExpanded || isSecondaryActive ? 'bg-amber-400/25 text-amber-200' : ''}`}
              >
                <MoreHorizontal className="nav-icon" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMoreExpanded((prev) => !prev)}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="uppercase tracking-wider">Studio &amp; Admin Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-150 ${
                    isMoreExpanded || isSecondaryActive ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
            )}

            {(isMoreExpanded || isSecondaryActive) && (
              <div className="space-y-0.5 pt-1 animate-in fade-in duration-150">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                      className={`sidebar-nav-item ${collapsed ? 'collapsed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="nav-icon" aria-hidden="true" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                          isActive ? 'bg-amber-950 text-amber-300' : 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subscription / Trial Status Card (expanded view only) */}
          {!collapsed && (
            <div className="pt-2 px-1">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPricingModalOpen(true);
                }}
                className="p-3 rounded-xl bg-blue-900/40 border border-white/15 hover:bg-blue-900/60 hover:border-white/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>{planDisplayName} Plan</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      trialStatus === 'active'
                        ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
                        : 'bg-white/20 text-white border-white/30'
                    }`}
                  >
                    {trialStatus === 'active' ? 'Active' : `${daysRemaining}d Trial`}
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/80 leading-relaxed mb-1">
                  {trialStatus === 'active' ? 'Active studio subscription' : `7-day trial • ${daysRemaining} days left`}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-white group-hover:underline">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Plans &amp; Invoicing →</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile Footer ── */}
        <div className={`${collapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3'} border-t border-blue-800/60 bg-blue-900/40`}>
          {collapsed ? (
            <>
              <div className="relative" title={`${displayName} (${roleDisplay()})`}>
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white text-[11px] font-bold text-[#1D4ED8] ring-2 ring-white/30">
                  <span aria-hidden="true">
                    {displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#1D4ED8]" />
              </div>
              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-blue-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white text-[11px] font-bold text-[#1D4ED8] ring-2 ring-white/30">
                    <span aria-hidden="true">
                      {displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    {profile?.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#1D4ED8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-amber-200 truncate">{displayName}</div>
                  <div className="text-[10px] text-amber-300/80 truncate">{roleDisplay()}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-amber-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Collapsible Fixed Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-[74px]' : 'w-64'
        } bg-[#1D4ED8] text-white flex-col h-full border-r border-blue-800/60 select-none z-30 shrink-0 shadow-subtle transition-[width] duration-200 ease-out`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile & Tablet Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-[#1D4ED8] text-white shadow-2xl border-r border-blue-800/60 z-50 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
