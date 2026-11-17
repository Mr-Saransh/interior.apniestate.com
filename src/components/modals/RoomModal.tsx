// ==============================================================================
// APNI ESTATE INTERIORS - ROOM BUILDER & TEMPLATE ESTIMATOR MODAL
// Room-wise area (sqft), per-sqft rate, 4-status set & common pre-filled scope
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Room, RoomExecutionStatus } from '../../types';
import { 
  ROOM_TEMPLATES, 
  EXECUTION_STATUSES, 
  RoomTemplate,
  calculateRoomBudget 
} from '../../data/roomTemplates';
import { 
  LayoutGrid, 
  Ruler, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ListChecks, 
  Plus 
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomToEdit?: Room | null;
}

const COMMON_ROOM_TYPES = [
  'Living Room',
  'Master Bedroom',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Dining Room',
  'Balcony',
  'Office',
  'Foyer',
  'Pooja Room',
  'Walk-in Wardrobe',
  'Other'
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  projectId,
  roomToEdit
}) => {
  const { addRoom, updateRoom, addBOQItem } = useApp();
  const { organization } = useAuth();

  const isEdit = Boolean(roomToEdit);

  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Living Room');
  const [areaSqft, setAreaSqft] = useState<string>('200');
  const [ratePerSqft, setRatePerSqft] = useState<string>('250');
  const [budget, setBudget] = useState<string>('50000');
  const [status, setStatus] = useState<RoomExecutionStatus>('In Progress');
  const [progress, setProgress] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('living-room');
  const [includeTemplateItems, setIncludeTemplateItems] = useState(true);
  const [selectedItemIndices, setSelectedItemIndices] = useState<number[]>([]);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active template reference
  const currentTemplate = ROOM_TEMPLATES.find(t => t.id === selectedTemplateId) || ROOM_TEMPLATES[0];

  useEffect(() => {
    if (roomToEdit) {
      setName(roomToEdit.name || '');
      setRoomType(roomToEdit.room_type || 'Custom');
      const sqft = roomToEdit.area_sqft ? String(roomToEdit.area_sqft) : '200';
      const rate = roomToEdit.rate_per_sqft ? String(roomToEdit.rate_per_sqft) : '250';
      setAreaSqft(sqft);
      setRatePerSqft(rate);
      setBudget(roomToEdit.budget ? String(roomToEdit.budget) : String(Number(sqft) * Number(rate)));
      setStatus(roomToEdit.status || 'In Progress');
      setProgress(roomToEdit.progress || 0);
      setNotes(roomToEdit.notes || '');
      setSelectedTemplateId(null);
      setIncludeTemplateItems(false);
    } else {
      // Default to Living Room template
      const defaultTpl = ROOM_TEMPLATES[0];
      setName(defaultTpl.name);
      setRoomType(defaultTpl.room_type);
      setAreaSqft(String(defaultTpl.default_sqft));
      setRatePerSqft(String(defaultTpl.default_rate_per_sqft));
      setBudget(String(calculateRoomBudget(defaultTpl.default_sqft, defaultTpl.default_rate_per_sqft)));
      setStatus('In Progress');
      setProgress(0);
      setNotes('');
      setSelectedTemplateId(defaultTpl.id);
      setIncludeTemplateItems(true);
      setSelectedItemIndices(defaultTpl.items.map((_, i) => i));
    }
    setErrorMessage(null);
  }, [roomToEdit, isOpen]);

  // Handle template selection
  const handleSelectTemplate = (template: RoomTemplate) => {
    setSelectedTemplateId(template.id);
    setName(template.name);
    setRoomType(template.room_type);
    setAreaSqft(String(template.default_sqft));
    setRatePerSqft(String(template.default_rate_per_sqft));
    const calc = calculateRoomBudget(template.default_sqft, template.default_rate_per_sqft);
    setBudget(String(calc));
    setIncludeTemplateItems(true);
    setSelectedItemIndices(template.items.map((_, i) => i));
  };

  // Recalculate budget when sqft or rate changes
  const handleAreaChange = (val: string) => {
    setAreaSqft(val);
    const sqft = Number(val) || 0;
    const rate = Number(ratePerSqft) || 0;
    setBudget(String(calculateRoomBudget(sqft, rate)));
  };

  const handleRateChange = (val: string) => {
    setRatePerSqft(val);
    const sqft = Number(areaSqft) || 0;
    const rate = Number(val) || 0;
    setBudget(String(calculateRoomBudget(sqft, rate)));
  };

  // Toggle item in template scope
  const toggleItemIndex = (index: number) => {
    setSelectedItemIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide a room name.');
      return;
    }

    const numSqft = Math.max(0, Number(areaSqft) || 0);
    const numRate = Math.max(0, Number(ratePerSqft) || 0);
    const numBudget = Number(budget) || calculateRoomBudget(numSqft, numRate);

    setLoading(true);
    try {
      if (isEdit && roomToEdit) {
        await updateRoom(roomToEdit.id, {
          name: name.trim(),
          room_type: roomType || undefined,
          area_sqft: numSqft > 0 ? numSqft : undefined,
          rate_per_sqft: numRate > 0 ? numRate : undefined,
          status,
          budget: numBudget,
          progress: Number(progress) || 0,
          notes: notes.trim() || undefined
        });
      } else {
        const createdRoom = await addRoom({
          organization_id: organization?.id || 'demo-org',
          project_id: projectId,
          name: name.trim(),
          room_type: roomType || undefined,
          area_sqft: numSqft > 0 ? numSqft : undefined,
          rate_per_sqft: numRate > 0 ? numRate : undefined,
          status,
          budget: numBudget,
          progress: Number(progress) || 0,
          notes: notes.trim() || undefined
        });

        // Add pre-filled common items if enabled
        if (includeTemplateItems && currentTemplate && selectedItemIndices.length > 0) {
          const itemsToAdd = currentTemplate.items.filter((_, idx) => selectedItemIndices.includes(idx));
          for (const item of itemsToAdd) {
            try {
              await addBOQItem({
                project_id: projectId,
                room_id: createdRoom.id,
                item_name: item.item_name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                rate: item.rate,
                estimated_cost: item.quantity * item.rate,
                description: item.description
              });
            } catch (err) {
              console.warn('Error adding template BOQ item:', err);
            }
          }
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save room details.');
    } finally {
      setLoading(false);
    }
  };

  const calculatedPreview = (Number(areaSqft) || 0) * (Number(ratePerSqft) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Room' : 'Add Room'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {errorMessage}
          </div>
        )}

        {/* ── Room Templates Row (Only on New Room) ── */}
        {!isEdit && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                Room Cost Templates
              </span>
              <span className="text-[11px] text-slate-400">Pre-fills area, rate & items</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ROOM_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                  >
                    <div className="font-bold">{tpl.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {tpl.default_sqft} sqft · ₹{tpl.default_rate_per_sqft}/sqft
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Basic Room Details ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="room-name" className="block text-xs font-bold text-slate-700 mb-1">
              Room Name
            </label>
            <div className="relative">
              <LayoutGrid className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="room-name"
                type="text"
                required
                placeholder="e.g. Master Bedroom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4F6FA] focus:bg-white text-xs font-semibold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="room-type" className="block text-xs font-bold text-slate-700 mb-1">
              Space Category
            </label>
            <select
              id="room-type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-[#F4F6FA] focus:bg-white text-xs font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all"
            >
              {COMMON_ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Area & Per Sq.Ft Rate Calculator ── */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#1D4ED8]" />
              Area &amp; Rate Configuration
            </span>
            <div className="text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {formatINR(calculatedPreview)} Est. Cost
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="room-area" className="block text-[11px] font-bold text-slate-600 mb-1">
                Area (Sq.Ft)
              </label>
              <input
                id="room-area"
                type="number"
                min="0"
                step="5"
                placeholder="200"
                value={areaSqft}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-white text-xs font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="room-rate" className="block text-[11px] font-bold text-slate-600 mb-1">
                Rate (₹ / Sq.Ft)
              </label>
              <input
                id="room-rate"
                type="number"
                min="0"
                step="10"
                placeholder="250"
                value={ratePerSqft}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full bg-white text-xs font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="room-budget" className="block text-[11px] font-bold text-slate-600 mb-1">
                Total Budget (₹)
              </label>
              <input
                id="room-budget"
                type="number"
                min="0"
                step="1000"
                placeholder="50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white text-xs font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Formula: <span className="font-bold text-slate-700">{areaSqft || 0} sqft</span> × <span className="font-bold text-slate-700">₹{ratePerSqft || 0}/sqft</span> = <span className="font-bold text-emerald-700">{formatINR(calculatedPreview)}</span>
          </div>
        </div>

        {/* ── Status Selector: Not Started / In Progress / Completed / On Hold ── */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Execution Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXECUTION_STATUSES.map((st) => {
              const isSelected = status === st;
              let dotClass = 'bg-slate-400';
              let activeClass = 'bg-slate-800 text-white border-slate-800';

              if (st === 'In Progress') {
                dotClass = 'bg-blue-500';
                activeClass = 'bg-[#1D4ED8] text-white border-[#1D4ED8]';
              } else if (st === 'Completed') {
                dotClass = 'bg-emerald-500';
                activeClass = 'bg-emerald-600 text-white border-emerald-600';
              } else if (st === 'On Hold') {
                dotClass = 'bg-amber-500';
                activeClass = 'bg-amber-600 text-white border-amber-600';
              }

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? activeClass
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : dotClass}`} />
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Pre-filled Scope Items Checklist (when template selected) ── */}
        {!isEdit && currentTemplate && currentTemplate.items.length > 0 && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setIsItemsExpanded(!isItemsExpanded)}
              className="w-full flex items-center justify-between p-3 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#1D4ED8]" />
                <span className="text-xs font-bold text-slate-800">
                  Pre-filled Scope Items ({selectedItemIndices.length} / {currentTemplate.items.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#1D4ED8] font-bold">
                  {isItemsExpanded ? 'Hide' : 'Review'}
                </span>
                {isItemsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {isItemsExpanded && (
              <div className="p-3 space-y-2 border-t border-slate-200 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[11px]">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTemplateItems}
                      onChange={(e) => {
                        setIncludeTemplateItems(e.target.checked);
                        if (e.target.checked) {
                          setSelectedItemIndices(currentTemplate.items.map((_, i) => i));
                        } else {
                          setSelectedItemIndices([]);
                        }
                      }}
                      className="rounded text-[#1D4ED8]"
                    />
                    <span>Add to Project BOQ automatically</span>
                  </label>
                  <span className="text-slate-400">Common trade items</span>
                </div>

                {currentTemplate.items.map((item, idx) => {
                  const isChecked = selectedItemIndices.includes(idx);
                  return (
                    <div
                      key={item.item_name}
                      onClick={() => toggleItemIndex(idx)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50/50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded text-[#1D4ED8]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-bold truncate ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                            {item.item_name}
                          </span>
                          <span className="font-bold text-slate-700 shrink-0">
                            {formatINR(item.quantity * item.rate)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.quantity} {item.unit} @ ₹{item.rate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Work Progress Slider ── */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="room-progress" className="text-xs font-bold text-slate-700">
              Work Progress
            </label>
            <span className="text-xs font-bold text-[#1D4ED8]">{progress}%</span>
          </div>
          <input
            id="room-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[#1D4ED8] bg-slate-200 rounded-lg cursor-pointer h-2"
          />
        </div>

        {/* ── Scope Notes (Optional) ── */}
        <div>
          <label htmlFor="room-notes" className="block text-xs font-bold text-slate-700 mb-1">
            Notes &amp; Finishes (Optional)
          </label>
          <textarea
            id="room-notes"
            rows={2}
            placeholder="e.g. 1mm Merino high-gloss laminate, Hafele soft-close fittings."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#F4F6FA] focus:bg-white text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:border-[#1D4ED8] focus:outline-none transition-all leading-relaxed"
          />
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Changes' : 'Create Room'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
