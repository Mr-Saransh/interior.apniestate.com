import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import { LayoutGrid, DollarSign, Percent, FileText } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomToEdit?: Room | null;
}

const COMMON_ROOM_TYPES = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom',
  'Bathroom',
  'Dining Room',
  'Office',
  'Balcony',
  'Foyer',
  'Walk-in Wardrobe',
  'Pooja Room',
  'Other'
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  projectId,
  roomToEdit
}) => {
  const { addRoom, updateRoom } = useApp();
  const { organization } = useAuth();

  const isEdit = Boolean(roomToEdit);

  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [budget, setBudget] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roomToEdit) {
      setName(roomToEdit.name || '');
      setRoomType(roomToEdit.room_type || '');
      setBudget(roomToEdit.budget ? String(roomToEdit.budget) : '');
      setProgress(roomToEdit.progress || 0);
      setNotes(roomToEdit.notes || '');
    } else {
      setName('');
      setRoomType('');
      setBudget('');
      setProgress(0);
      setNotes('');
    }
    setErrorMessage(null);
  }, [roomToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Room name is required.');
      return;
    }

    const numBudget = Number(budget) || 0;
    if (numBudget < 0) {
      setErrorMessage('Budget must be greater than or equal to ₹0.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && roomToEdit) {
        await updateRoom(roomToEdit.id, {
          name: name.trim(),
          room_type: roomType || undefined,
          budget: numBudget,
          progress: Number(progress) || 0,
          notes: notes.trim() || undefined
        });
      } else {
        await addRoom({
          organization_id: organization?.id || 'demo-org',
          project_id: projectId,
          name: name.trim(),
          room_type: roomType || undefined,
          budget: numBudget,
          progress: Number(progress) || 0,
          notes: notes.trim() || undefined
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save room details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit room' : 'Add a room'}
      subtitle={isEdit ? 'Update this room’s details.' : 'Add a space now. You can add a budget and other details later.'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="project-room-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Room name <span className="text-rose-600">(required)</span>
          </label>
          <div className="relative">
            <LayoutGrid className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="project-room-name"
              required
              placeholder="For example, Living room"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>

        <details open={isEdit} className="rounded-xl border border-slate-200 bg-slate-50 px-4">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm font-semibold text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Add room details (optional)
          </summary>
          <div className="space-y-4 border-t border-slate-200 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              aria-label="Room type"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">Choose later</option>
              {COMMON_ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Allocated Budget (₹)
            </label>
            <div className="relative">
              <span className="text-slate-400 font-semibold absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Add later"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Work Progress ({progress}%)
            </label>
            <span className="text-xs font-bold text-brand-600">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-brand-600 bg-slate-200 rounded-lg cursor-pointer h-2"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Scope Notes & Specifications
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="e.g. Italian marble flooring, false ceiling with warm white cove lighting."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
          </div>
        </details>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <span>Saving...</span> : <span>{isEdit ? 'Save Changes' : 'Add Room'}</span>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
