// ==============================================================================
// APNI ESTATE INTERIORS - PROJECT PLANS & BLUEPRINTS MANAGEMENT SECTION
// Complete organization: Architectural drawings, Revisions, Rooms & Client Scope
// ==============================================================================

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  FileText,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Eye,
  CheckSquare,
  Search,
  Filter
} from 'lucide-react';
import { DocumentItem, Room, BOQItem, Project } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ProgressBar } from '../common/ProgressBar';

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

interface ProjectPlansSectionProps {
  project: Project;
  documents: DocumentItem[];
  rooms: Room[];
  boqItems: BOQItem[];
  clientRequests: ClientRequirement[];
  activeSubTab: 'blueprints' | 'rooms' | 'client_requests';
  onSubTabChange: (tab: 'blueprints' | 'rooms' | 'client_requests') => void;
  onOpenUploadDocument: () => void;
  onDownloadDocument: (doc: DocumentItem) => Promise<void>;
  onDeleteDocument: (docId: string, storagePath?: string) => void;
  onOpenAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  onOpenAddBOQItem: (roomId?: string) => void;
  onApproveClientRequest: (reqId: string) => void;
}

const BLUEPRINT_CATEGORIES = [
  'All',
  'Architectural',
  '2D Floor Plan',
  '3D Render',
  'Drawing',
  'Site Plan',
  'Contract',
  'Estimate'
];

export const ProjectPlansSection: React.FC<ProjectPlansSectionProps> = ({
  project,
  documents,
  rooms,
  boqItems,
  clientRequests,
  activeSubTab,
  onSubTabChange,
  onOpenUploadDocument,
  onDownloadDocument,
  onDeleteDocument,
  onOpenAddRoom,
  onEditRoom,
  onDeleteRoom,
  onOpenAddBOQItem,
  onApproveClientRequest
}) => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const pendingRequestsCount = clientRequests.filter(r => r.status === 'Under Review').length;

  const filteredDocs = documents.filter(doc => {
    const docCat = doc.category || doc.type || 'Drawing';
    if (categoryFilter !== 'All' && docCat.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        (doc.file_name && doc.file_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownload = async (doc: DocumentItem) => {
    setDownloadingDocId(doc.id);
    try {
      await onDownloadDocument(doc);
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. SUB-VIEW SEGMENTED SWITCHER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSubTabChange('blueprints')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'blueprints'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Architectural Drawings &amp; Blueprints</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('rooms')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rooms'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Room Layouts &amp; Specifications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {rooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('client_requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'client_requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Client Scope &amp; Portal Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-2xs">
                {pendingRequestsCount} new
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'blueprints' && (
            <button
              type="button"
              onClick={onOpenUploadDocument}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-brand-400" />
              <span>+ Upload Blueprint</span>
            </button>
          )}

          {activeSubTab === 'rooms' && (
            <>
              <button
                type="button"
                onClick={onOpenAddRoom}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Add Room</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAddBOQItem()}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add BOQ Item</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 2. SUB-VIEW: ARCHITECTURAL BLUEPRINTS & DRAWINGS ── */}
      {activeSubTab === 'blueprints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search drawings by title or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/60"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/60 focus:ring-2 focus:ring-brand-500"
              >
                {BLUEPRINT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Document Categories' : c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-900">{filteredDocs.length}</strong> drawings &amp; specs
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No drawings or blueprints found"
              description="Upload architectural CAD drawings, 2D floor plans, 3D photorealistic renders, and structural layouts."
              actionLabel="+ Upload First Blueprint"
              onAction={onOpenUploadDocument}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc, idx) => {
                const revision = doc.revision || `Rev 1.${idx}`;
                const approvalStatus = doc.approval_status || 'Approved';

                return (
                  <div key={doc.id} className="premium-card p-5 flex flex-col justify-between group hover:border-brand-400 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 group-hover:scale-105 transition-transform">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {revision}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {approvalStatus}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">{doc.category || doc.type || 'Drawing'}</span>
                        <span>•</span>
                        <span>{doc.size || 'CAD / PDF'}</span>
                        <span>•</span>
                        <span>{formatDate(doc.updatedAt || doc.created_at || '')}</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={downloadingDocId === doc.id}
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingDocId === doc.id ? 'Opening...' : 'Download / Preview'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete blueprint "${doc.title}"?`)) onDeleteDocument(doc.id, doc.storage_path);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. SUB-VIEW: ROOM LAYOUTS & SPECIFICATIONS ── */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-4">
          {rooms.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No rooms configured for this project"
              description="Add rooms (e.g., Living Room, Master Bedroom, Modular Kitchen) to partition budgets and allocate BOQ items."
              actionLabel="+ Add First Room"
              onAction={onOpenAddRoom}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const roomBOQ = boqItems.filter(b => b.room_id === room.id);
                const roomBOQCost = roomBOQ.reduce((sum, b) => sum + (Number(b.estimated_cost) || (Number(b.quantity) * Number(b.rate))), 0);

                return (
                  <div key={room.id} className="premium-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{room.name}</h4>
                        {room.area_sqft && (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {room.area_sqft} sq.ft
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Allocated Budget</span>
                        <span className="font-bold text-slate-900">{formatINR(room.budget)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">BOQ Est. Cost</span>
                        <span className="font-bold text-brand-700">{formatINR(roomBOQCost)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">{roomBOQ.length} BOQ items in scope</span>
                      <button
                        type="button"
                        onClick={() => onOpenAddBOQItem(room.id)}
                        className="text-brand-600 hover:text-brand-700 font-bold underline"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. SUB-VIEW: CLIENT SCOPE & PORTAL REQUESTS ── */}
      {activeSubTab === 'client_requests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Client Collaboration:</strong> These scope changes were submitted directly by the client via their generated portal link. Review specs and approve them into the project.
              </span>
            </div>
          </div>

          {clientRequests.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No client requests pending"
              description="When clients submit space preferences or design modifications via the client portal link, they will appear here for review."
            />
          ) : (
            <div className="space-y-3">
              {clientRequests.map((req) => (
                <div key={req.id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                        {req.space}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{req.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved & In Scope'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Declined'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{req.details}</p>
                    <span className="text-[11px] text-slate-400 block">
                      Submitted on {formatDate(req.submitted_at)}
                    </span>
                  </div>

                  {req.status === 'Under Review' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onApproveClientRequest(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve into Scope</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
