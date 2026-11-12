import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Receipt, 
  Users, 
  UserPlus, 
  FileCheck2, 
  Plus, 
  Menu
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    workspaceMode, 
    currentPage, 
    setCurrentPage, 
    setIsNewProjectModalOpen,
    setIsMobileMenuOpen 
  } = useApp();

  const handleMobilePrimaryAction = () => {
    if (workspaceMode === 'erp') {
      setIsNewProjectModalOpen(true);
    } else {
      setCurrentPage('leads');
    }
  };

  return (
    <div className="app-shell flex h-screen w-full overflow-hidden bg-[#F4F6FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <TopBar />
        <main className="app-main flex-1 p-3.5 sm:p-5 md:p-7 xl:p-8 mx-auto min-w-0 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Friendly Bottom Navigation Bar ── */}
      <nav 
        aria-label="Mobile Navigation" 
        className="mobile-bottom-nav lg:hidden shadow-lg border-t border-[#E5E7EB] bg-white"
      >
        {workspaceMode === 'erp' ? (
          <>
            <button
              type="button"
              onClick={() => setCurrentPage('overview')}
              className={`mobile-bottom-nav-btn ${currentPage === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard className="nav-icon" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('projects')}
              className={`mobile-bottom-nav-btn ${currentPage === 'projects' || currentPage === 'project-detail' ? 'active' : ''}`}
            >
              <FolderKanban className="nav-icon" />
              <span>Projects</span>
            </button>

            {/* Quick Action (+) button in center */}
            <button
              type="button"
              onClick={handleMobilePrimaryAction}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1D4ED8] text-white shadow-md active:scale-95 transition-transform -mt-3.5 border-2 border-white"
              aria-label="Add New Project"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('expenses')}
              className={`mobile-bottom-nav-btn ${currentPage === 'expenses' ? 'active' : ''}`}
            >
              <Receipt className="nav-icon" />
              <span>Expenses</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-bottom-nav-btn"
            >
              <Menu className="nav-icon" />
              <span>More</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setCurrentPage('leads')}
              className={`mobile-bottom-nav-btn ${currentPage === 'leads' ? 'active' : ''}`}
            >
              <UserPlus className="nav-icon" />
              <span>Leads</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('clients')}
              className={`mobile-bottom-nav-btn ${currentPage === 'clients' ? 'active' : ''}`}
            >
              <Users className="nav-icon" />
              <span>Clients</span>
            </button>

            {/* Quick Action (+) button in center */}
            <button
              type="button"
              onClick={handleMobilePrimaryAction}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1D4ED8] text-white shadow-md active:scale-95 transition-transform -mt-3.5 border-2 border-white"
              aria-label="New Lead"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('quotations')}
              className={`mobile-bottom-nav-btn ${currentPage === 'quotations' ? 'active' : ''}`}
            >
              <FileCheck2 className="nav-icon" />
              <span>Proposals</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-bottom-nav-btn"
            >
              <Menu className="nav-icon" />
              <span>More</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
