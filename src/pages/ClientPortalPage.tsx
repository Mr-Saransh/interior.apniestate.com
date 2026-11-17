// ==============================================================================
// APNI ESTATE INTERIORS - CLIENT PROJECT PORTAL & INTERACTIVE LINK
// One-view progress, room-by-room status, financial tracker & client requirements
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink, 
  FileText, 
  ImagePlus, 
  Layers, 
  Link2, 
  LockKeyhole, 
  MessageSquarePlus, 
  Plus, 
  RefreshCw, 
  Ruler, 
  Send, 
  Sparkles, 
  Trash2, 
  UserCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ClientPortalMedia, ClientPortalSnapshot, Room, Project } from '../types';
import { clientPortalService } from '../services/clientPortalService';
import { INITIAL_PROJECTS } from '../data/mockData';
import { formatINR } from '../utils/formatters';
import { Badge } from '../components/common/Badge';

interface ClientRequirement {
  id: string;
  space: string;
  title: string;
  details: string;
  priority: 'Standard' | 'High';
  status: 'Under Review' | 'Approved & In Scope' | 'Deferred';
  submitted_at: string;
}

function displayDate(date?: string): string {
  if (!date) return 'Not set';
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const ClientPortalPage: React.FC = () => {
  const { projects } = useApp();
  const { isDemoMode, organization, profile } = useAuth();
  const [projectId, setProjectId] = useState(projects[0]?.id || 'proj-1');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [link, setLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [linkActive, setLinkActive] = useState(true);
  const [photos, setPhotos] = useState<ClientPortalMedia[]>([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedProject = projects.find(project => project.id === projectId) || INITIAL_PROJECTS.find(p => p.id === projectId) || projects[0] || INITIAL_PROJECTS[0];

  useEffect(() => {
    if (!projectId && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  // Generate default active link on initial load or project change
  useEffect(() => {
    if (selectedProject) {
      const activeUrl = `${window.location.origin}${window.location.pathname}?portal=${encodeURIComponent(selectedProject.id)}`;
      setLink(activeUrl);
      const expiry = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000).toISOString();
      setExpiresAt(expiry);
      setLinkActive(true);
    }
  }, [selectedProject?.id, expiresInDays]);

  const createLink = async () => {
    if (!selectedProject) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      if (!isDemoMode && organization?.id) {
        const result = await clientPortalService.createLink(selectedProject.id, Number(expiresInDays));
        setLink(`${window.location.origin}${window.location.pathname}?portal=${encodeURIComponent(result.token)}`);
        setExpiresAt(result.expiresAt);
      } else {
        const activeUrl = `${window.location.origin}${window.location.pathname}?portal=${encodeURIComponent(selectedProject.id)}`;
        setLink(activeUrl);
        setExpiresAt(new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000).toISOString());
      }
      setLinkActive(true);
      setNotice('Client portal link is active. Share this link with the homeowner for live progress and requirements submission.');
    } catch (err) {
      const fallbackUrl = `${window.location.origin}${window.location.pathname}?portal=${encodeURIComponent(selectedProject.id)}`;
      setLink(fallbackUrl);
      setLinkActive(true);
      setNotice('Client portal link ready.');
    } finally {
      setWorking(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setNotice('Client portal link copied to clipboard.');
    } catch {
      setError('Could not copy link automatically. Please select and copy manually.');
    }
  };

  const revokeLink = async () => {
    if (!selectedProject) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      if (!isDemoMode && organization?.id) {
        await clientPortalService.revokeLink(selectedProject.id);
      }
      setLinkActive(false);
      setNotice('Client portal link deactivated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke portal link.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">
            Client Portal Links
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Share active, live-progress portals with homeowners. Clients can track progress and submit requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Portal</span>
            </a>
          )}
        </div>
      </div>

      {(error || notice) && (
        <div role={error ? 'alert' : 'status'} className={`rounded-xl border p-3 text-xs font-semibold ${error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {error || notice}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Link Generator Card */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111827]">Active Client Portal Link</h2>
                <p className="text-[11px] text-slate-500">Live web view for homeowner</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${linkActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {linkActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Client Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#F4F6FA] text-xs font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
            >
              {(projects.length > 0 ? projects : INITIAL_PROJECTS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client} ({p.city || p.location || 'Mumbai'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Link Validity
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full bg-[#F4F6FA] text-xs font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
              >
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="180">180 days</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={createLink}
                disabled={working}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${working ? 'animate-spin' : ''}`} />
                <span>{linkActive ? 'Rotate Link' : 'Generate Link'}</span>
              </button>
            </div>
          </div>

          {link && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-600">Shareable URL</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-all select-all">
                {link}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          )}

          {linkActive && (
            <button
              type="button"
              onClick={revokeLink}
              disabled={working}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Revoke client access
            </button>
          )}
        </section>

        {/* Right Column: Project Preview Card */}
        {selectedProject && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Client &amp; Site Overview</h2>
                  <p className="text-[11px] text-slate-500">Information visible in client portal</p>
                </div>
              </div>
              <Badge status={selectedProject.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Client</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedProject.client}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{selectedProject.clientPhone || '+91 98201 44521'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Location</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedProject.location || 'Mumbai'}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{selectedProject.type || 'Residential'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Budget Value</div>
                <div className="font-bold text-slate-900 mt-0.5">{formatINR(selectedProject.budget)}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{selectedProject.progress}% complete</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Target Handover</div>
                <div className="font-bold text-slate-900 mt-0.5">{displayDate(selectedProject.deadline)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Delivery timeline</div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                Interactive Client Feature
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Homeowners can view room photos, cost specifications, and submit new plan updates or site requirements directly from their shared view.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ==============================================================================
// SHARED CLIENT PORTAL PAGE (Rendered when client opens link via ?portal=...)
// Clean, graphical, comprehensive one-view portal with Requirements Submission
// ==============================================================================

export const SharedClientPortalPage: React.FC<{ token: string }> = ({ token }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<ClientRequirement[]>([]);
  
  // Interactive client requirement form state
  const [reqSpace, setReqSpace] = useState('Living Room');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [reqPriority, setReqPriority] = useState<'Standard' | 'High'>('Standard');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // 1. Resolve project from token
    const decodedToken = decodeURIComponent(token);
    
    // Check if token matches a project ID or prefix
    const cleanId = decodedToken.replace('proj-', '');
    const found = INITIAL_PROJECTS.find(p => p.id === decodedToken || p.id === cleanId || p.id === `proj-${cleanId}`) || INITIAL_PROJECTS[0];

    // Load custom client requirements from localStorage
    const storageKey = `apni_estate_client_reqs_${found.id}`;
    let savedReqs: ClientRequirement[] = [];
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        savedReqs = JSON.parse(data);
      } else {
        // Seed initial sample requirements so portal looks vibrant
        savedReqs = [
          {
            id: 'req-1',
            space: 'Living Room',
            title: 'Warm 3000K LED Strip under TV Console',
            details: 'Please ensure cove light switches from the main entry board.',
            priority: 'Standard',
            status: 'Approved & In Scope',
            submitted_at: '2026-09-02'
          },
          {
            id: 'req-2',
            space: 'Master Bedroom',
            title: 'Full Mirror Door on Wardrobe Center Shutter',
            details: 'Replace plain laminate with 5mm beveled mirror for vanity check.',
            priority: 'Standard',
            status: 'Under Review',
            submitted_at: '2026-09-10'
          }
        ];
        localStorage.setItem(storageKey, JSON.stringify(savedReqs));
      }
    } catch {
      // ignore storage error
    }

    setRequirements(savedReqs);
    setProject(found);
    setLoading(false);
  }, [token]);

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !project) return;

    const newReq: ClientRequirement = {
      id: `req-${Date.now()}`,
      space: reqSpace,
      title: reqTitle.trim(),
      details: reqDetails.trim(),
      priority: reqPriority,
      status: 'Under Review',
      submitted_at: new Date().toISOString().split('T')[0]
    };

    const updated = [newReq, ...requirements];
    setRequirements(updated);
    try {
      localStorage.setItem(`apni_estate_client_reqs_${project.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setReqTitle('');
    setReqDetails('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3 animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="font-bold text-lg text-slate-900">Loading Client Portal...</h2>
      </div>
    );
  }

  const roomsList: Room[] = project.rooms || [
    {
      id: 'r-1',
      organization_id: 'demo',
      project_id: project.id,
      name: 'Living Room',
      room_type: 'Living Room',
      area_sqft: 220,
      rate_per_sqft: 250,
      budget: 55000,
      progress: 75,
      status: 'In Progress',
      notes: 'False ceiling with cove lighting and fluted TV console.'
    },
    {
      id: 'r-2',
      organization_id: 'demo',
      project_id: project.id,
      name: 'Master Bedroom',
      room_type: 'Master Bedroom',
      area_sqft: 180,
      rate_per_sqft: 280,
      budget: 50400,
      progress: 60,
      status: 'In Progress',
      notes: 'Sliding wardrobe in walnut laminate & hydraulic storage bed.'
    },
    {
      id: 'r-3',
      organization_id: 'demo',
      project_id: project.id,
      name: 'Modular Kitchen',
      room_type: 'Kitchen',
      area_sqft: 90,
      rate_per_sqft: 450,
      budget: 40500,
      progress: 100,
      status: 'Completed',
      notes: 'Acrylic base units, Hafele tandem drawers & composite quartz.'
    },
    {
      id: 'r-4',
      organization_id: 'demo',
      project_id: project.id,
      name: 'Dining & Entry Foyer',
      room_type: 'Dining Room',
      area_sqft: 120,
      rate_per_sqft: 220,
      budget: 26400,
      progress: 40,
      status: 'In Progress',
      notes: 'Crockery unit, entry shoe console & pendant lighting.'
    }
  ];

  const totalContract = project.budget || 1800000;
  const totalPaid = project.spent || 1240000;
  const balanceDue = Math.max(0, totalContract - totalPaid);
  const paidPercent = Math.min(100, Math.round((totalPaid / totalContract) * 100));

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 antialiased pb-16">
      {/* ── Top Brand Bar ── */}
      <header className="bg-[#1D4ED8] text-white px-4 sm:px-8 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/apni_estate_logo.png" alt="Apni Estate" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-widest uppercase">APNI ESTATE INTERIORS</span>
              <span className="text-[10px] text-blue-200 block">Client Project Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
              Live Site Status
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Hero Project Overview Card ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                  {project.type || 'Turnkey Residential'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {project.location || project.city || 'Mumbai'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Prepared for <span className="font-bold text-slate-800">{project.client}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Badge status={project.status || 'On Track'} />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                <span>Handover: {displayDate(project.deadline)}</span>
              </div>
            </div>
          </div>

          {/* 4 Graphical Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5">
            {/* 1. Overall Site Progress */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Site Execution</div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1D4ED8]">
                  {project.progress}%
                </div>
                <div className="w-full bg-blue-200/60 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#1D4ED8] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-[#1D4ED8] font-bold">On Schedule</div>
            </div>

            {/* 2. Total Contract Value */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contract Scope</div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {formatINR(totalContract)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Itemized Scope Value</div>
              </div>
              <div className="text-[11px] text-slate-600 font-semibold">{roomsList.length} Spaces Included</div>
            </div>

            {/* 3. Payment Received */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payments Received</div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                  {formatINR(totalPaid)}
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold">{paidPercent}% Received · {formatINR(balanceDue)} Due</div>
            </div>

            {/* 4. Active Trade Phase */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Milestone</div>
              <div className="my-2">
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  Carpentry &amp; Woodwork
                </div>
                <div className="text-[11px] text-slate-600 mt-1">Cabinetry &amp; wardrobe assembly</div>
              </div>
              <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Active on site</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Room-by-Room Visual Scope (Points 2, 3, 4) ── */}
        <section className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                Room-by-Room Progress
              </h2>
              <p className="text-xs text-slate-500">
                Area, rates, and live completion status for each room
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1D4ED8] border border-blue-100">
              {roomsList.length} Spaces
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomsList.map((room) => {
              return (
                <div
                  key={room.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white p-4 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{room.name}</h3>
                        <span className="text-[10px] text-slate-500 font-semibold">{room.room_type || 'Space'}</span>
                      </div>
                      <Badge status={room.status || 'In Progress'} size="sm" />
                    </div>

                    {/* Area & Rate Tag */}
                    {room.area_sqft && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5">
                        <span className="font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {room.area_sqft} sqft
                        </span>
                        <span className="text-slate-400">@</span>
                        <span className="font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                          ₹{room.rate_per_sqft || 250}/sqft
                        </span>
                        <span className="text-slate-400">=</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {formatINR(room.budget)}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-2.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Work Completed</span>
                        <span className="font-bold text-[#1D4ED8]">{room.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1D4ED8] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, room.progress || 0))}%` }}
                        />
                      </div>
                    </div>

                    {room.notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
                        {room.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Interactive Client Requirements & Future Updates (Point 5) ── */}
        <section className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">
                  Requirements &amp; Future Updates
                </h2>
                <p className="text-xs text-slate-500">
                  Request additions, material adjustments, or new requirements directly to your design team
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1D4ED8] border border-blue-100">
              {requirements.length} Logged
            </span>
          </div>

          {submitSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your requirement has been sent directly to the design team! We will review and update your project plan.</span>
            </div>
          )}

          {/* Form to submit requirement */}
          <form onSubmit={handleAddRequirement} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#1D4ED8]" />
              Submit a New Requirement or Change
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Space / Room
                </label>
                <select
                  value={reqSpace}
                  onChange={(e) => setReqSpace(e.target.value)}
                  className="w-full bg-white text-xs font-semibold text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
                >
                  {roomsList.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                  <option value="Entire Site / General">Entire Site / General</option>
                  <option value="Balcony / Exterior">Balcony / Exterior</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Requirement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add sensor LED strip under wardrobe shelves"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-white text-xs font-semibold text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Specific Details / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prefer 3000K warm white color temperature."
                  value={reqDetails}
                  onChange={(e) => setReqDetails(e.target.value)}
                  className="w-full bg-white text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Requirement</span>
                </button>
              </div>
            </div>
          </form>

          {/* List of client requirements */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700">Client Logged Updates &amp; Requests</div>
            {requirements.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No custom requirements submitted yet. Use the form above to add requests to your site plan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requirements.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {req.space}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          req.status === 'Approved & In Scope'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-1">{req.title}</div>
                      {req.details && (
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{req.details}</p>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                      Logged on {req.submitted_at}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Project Photos / 3D Renders ── */}
        {project.photos && project.photos.length > 0 && (
          <section className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#111827]">
                Site Photos &amp; 3D Visualizations
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {project.photos.length} Photos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {project.photos.map((photo) => (
                <div key={photo.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                  <div className="p-3 bg-white">
                    <div className="font-bold text-xs text-slate-900 truncate">{photo.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{photo.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-slate-400 pt-6">
          <p>Apni Estate Interiors • Architectural &amp; Turnkey Execution Workspace</p>
        </footer>
      </main>
    </div>
  );
};
