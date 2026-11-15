// ==============================================================================
// APNI ESTATE INTERIORS - ENTERPRISE DATA EXPORT CENTER
// Secure CSV and JSON export for current tenant datasets with strict audit isolation
// Note: Application data export is separate from platform infrastructure backups.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import { checkRateLimit } from '../utils/rateLimit';
import { 
  Download, 
  Database,  
  ShieldCheck, 
  CheckCircle2, 
  FolderKanban, 
  Users, 
  UserPlus, 
  Receipt, 
  Layers, 
  Building, 
  ShoppingBag, 
  IndianRupee, 
  Package, 
  CheckSquare,
  AlertCircle
} from 'lucide-react';

export const DataExportPage: React.FC = () => {
  const { 
    clients, 
    leads, 
    projects, 
    expenses, 
    boqItems, 
    vendors, 
    purchases, 
    clientPayments, 
    materials, 
    tasks 
  } = useApp();
  const { organization, isDemoMode } = useAuth();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (name: string, fn: () => void) => {
    if (!checkRateLimit(`export-${name}`, 3, 5000)) {
      setDownloadSuccess(`Please wait a few seconds before re-exporting.`);
      setTimeout(() => setDownloadSuccess(null), 2500);
      return;
    }
    fn();
    setDownloadSuccess(`Exported ${name} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const datasets = [
    {
      id: 'projects',
      title: 'Projects & Sites',
      count: projects.length,
      icon: FolderKanban,
      description: 'Projects, budgets, timelines, and progress.',
      action: () => handleExport('Projects', () => exportService.exportProjects(projects))
    },
    {
      id: 'clients',
      title: 'Clients',
      count: clients.length,
      icon: Users,
      description: 'Client directory, phone numbers, and addresses.',
      action: () => handleExport('Clients', () => exportService.exportClients(clients))
    },
    {
      id: 'leads',
      title: 'Leads',
      count: leads.length,
      icon: UserPlus,
      description: 'Active inquiries and pipeline status.',
      action: () => handleExport('Leads', () => exportService.exportLeads(leads))
    },
    {
      id: 'expenses',
      title: 'Expenses',
      count: expenses.length,
      icon: Receipt,
      description: 'Project expense logs and receipts.',
      action: () => handleExport('Expenses', () => exportService.exportExpenses(expenses, projects))
    },
    {
      id: 'boq',
      title: 'BOQ Estimations',
      count: boqItems.length,
      icon: Layers,
      description: 'Itemized specifications and estimates.',
      action: () => handleExport('BOQ Items', () => exportService.exportBOQ(boqItems, projects))
    },
    {
      id: 'purchases',
      title: 'Purchase Orders',
      count: purchases.length,
      icon: ShoppingBag,
      description: 'Material orders and delivery status.',
      action: () => handleExport('Purchases', () => exportService.exportPurchases(purchases))
    },
    {
      id: 'vendors',
      title: 'Vendors',
      count: vendors.length,
      icon: Building,
      description: 'Suppliers, contractors, and contact details.',
      action: () => handleExport('Vendors', () => exportService.exportVendors(vendors))
    },
    {
      id: 'payments',
      title: 'Client Payments',
      count: clientPayments.length,
      icon: IndianRupee,
      description: 'Payment milestones and receipts.',
      action: () => handleExport('Client Payments', () => exportService.exportClientPayments(clientPayments))
    },
    {
      id: 'materials',
      title: 'Materials Stock',
      count: materials.length,
      icon: Package,
      description: 'Material items and stock levels.',
      action: () => handleExport('Materials', () => exportService.exportMaterials(materials, projects))
    },
    {
      id: 'tasks',
      title: 'Tasks',
      count: tasks.length,
      icon: CheckSquare,
      description: 'Project tasks and deliverables.',
      action: () => handleExport('Tasks', () => exportService.exportTasks(tasks))
    }
  ];

  const handleFullJSONExport = () => {
    if (!checkRateLimit('export-full-json', 2, 10000)) {
      setDownloadSuccess('Please wait a few seconds before re-exporting.');
      setTimeout(() => setDownloadSuccess(null), 2500);
      return;
    }
    exportService.exportFullOrganizationJSON({
      organizationName: organization?.name || (isDemoMode ? 'Apni Estate Interiors' : 'My Studio'),
      clients,
      leads,
      projects,
      expenses,
      boqItems,
      vendors,
      purchases,
      clientPayments,
      materials,
      tasks
    });
    setDownloadSuccess('Exported Full Organization JSON successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const totalRecordsCount = datasets.reduce((sum, d) => sum + Number(d.count || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Architectural Header & Export Summary */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Data Export
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
              Download CSV or JSON copies of your studio records.
            </p>
          </div>

          <button
            onClick={handleFullJSONExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Database className="w-4 h-4" />
            <span>Export All (JSON)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Modules</p>
            <p className="text-xl font-bold text-[#111827] tabular-nums mt-0.5">{datasets.length}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Total Records</p>
            <p className="text-xl font-bold text-[#1D4ED8] tabular-nums mt-0.5">{totalRecordsCount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Formats</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">CSV & JSON</p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess} Check your browser's download folder.</span>
        </div>
      )}

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map(dataset => {
          const Icon = dataset.icon;
          return (
            <div 
              key={dataset.id}
              className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dataset.count} Records
                  </span>
                </div>

                <h3 className="text-base font-bold font-display text-slate-900 mb-1">
                  {dataset.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {dataset.description}
                </p>
              </div>

              <button
                type="button"
                onClick={dataset.action}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold transition-all duration-200 cursor-pointer group"
              >
                <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                <span>Download CSV</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
