// ==============================================================================
// APNI ESTATE INTERIORS - DYNAMIC DAILY SITE REPORT (DPR) WITH LIVE PHOTO CAPTURE
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { DailyUpdate } from '../../types';
import { 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon,
  HardHat,
  CloudSun
} from 'lucide-react';

interface DailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  updateToEdit?: DailyUpdate | null;
}

export const DailyUpdateModal: React.FC<DailyUpdateModalProps> = ({
  isOpen,
  onClose,
  projectId,
  updateToEdit
}) => {
  const { addDailyUpdate, updateDailyUpdate, uploadProjectPhoto } = useApp();
  const isEdit = Boolean(updateToEdit);

  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [workCompleted, setWorkCompleted] = useState('');
  const [workPending, setWorkPending] = useState('');
  const [issues, setIssues] = useState('');
  const [nextDayTasks, setNextDayTasks] = useState('');
  const [progress, setProgress] = useState(15);
  const [siteCondition, setSiteCondition] = useState('Normal Operations');

  // Dynamic Labour Breakdown
  const [carpenters, setCarpenters] = useState(2);
  const [masons, setMasons] = useState(1);
  const [electricians, setElectricians] = useState(1);
  const [painters, setPainters] = useState(0);
  const [helpers, setHelpers] = useState(2);

  // Live Captured / Uploaded Photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalWorkers = carpenters + masons + electricians + painters + helpers;

  useEffect(() => {
    if (updateToEdit) {
      setUpdateDate(updateToEdit.update_date || new Date().toISOString().split('T')[0]);
      setWorkCompleted(updateToEdit.work_completed || '');
      setWorkPending(updateToEdit.work_pending || '');
      setIssues(updateToEdit.issues || '');
      setNextDayTasks(updateToEdit.next_day_tasks || '');
      setProgress(updateToEdit.progress || 15);
    } else {
      setUpdateDate(new Date().toISOString().split('T')[0]);
      setWorkCompleted('');
      setWorkPending('');
      setIssues('');
      setNextDayTasks('');
      setProgress(15);
      setPhotoFiles([]);
      setPhotoPreviews([]);
    }
    setErrorMessage(null);
  }, [updateToEdit, isOpen]);

  // Handle Photo File Selection / Camera Capture
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotoFiles(prev => [...prev, ...files]);

    // Create instant previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!workCompleted.trim()) {
      setErrorMessage('Work completed description is required.');
      return;
    }

    setLoading(true);
    try {
      const labourNote = `Workers on site: ${totalWorkers} (${carpenters} Carpenters, ${masons} Masons, ${electricians} Electricians, ${helpers} Helpers). Condition: ${siteCondition}.`;
      const combinedPending = workPending.trim() 
        ? `${workPending.trim()}\n[Note: ${labourNote}]` 
        : `[Note: ${labourNote}]`;

      let createdDpr: DailyUpdate;

      if (isEdit && updateToEdit) {
        createdDpr = await updateDailyUpdate(updateToEdit.id, {
          update_date: updateDate,
          work_completed: workCompleted.trim(),
          work_pending: combinedPending,
          issues: issues.trim() || undefined,
          next_day_tasks: nextDayTasks.trim() || undefined,
          workers_count: totalWorkers,
          progress: Number(progress)
        });
      } else {
        createdDpr = await addDailyUpdate({
          project_id: projectId,
          update_date: updateDate,
          work_completed: workCompleted.trim(),
          work_pending: combinedPending,
          issues: issues.trim() || undefined,
          next_day_tasks: nextDayTasks.trim() || undefined,
          workers_count: totalWorkers,
          progress: Number(progress)
        });
      }

      // If user uploaded real photos, attach them to the project gallery linked to this DPR
      if (photoFiles.length > 0 && createdDpr) {
        for (const file of photoFiles) {
          try {
            await uploadProjectPhoto(projectId, file, {
              title: `DPR Photo - ${updateDate}`,
              daily_update_id: createdDpr.id
            });
          } catch (photoErr) {
            console.warn('[DPR Modal] Photo upload fallback:', photoErr);
          }
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save daily progress report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Daily Progress Report (DPR)' : 'New Daily Site Report (DPR)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date, Condition & Overall Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4F6FA] p-3.5 rounded-xl border border-[#E5E7EB]">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                required
                className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-9 pr-2.5 py-1.5 font-semibold text-[#111827] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Site Conditions
            </label>
            <div className="relative">
              <CloudSun className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={siteCondition}
                onChange={(e) => setSiteCondition(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-9 pr-2 py-1.5 font-semibold text-[#111827] outline-none"
              >
                <option value="Normal Operations">Normal Operations</option>
                <option value="Heavy Rain / Moisture">Heavy Rain / Moisture</option>
                <option value="Material Delivery Delayed">Material Delayed</option>
                <option value="Power Outage on Site">Power Outage</option>
                <option value="Client Inspection Today">Client Inspection</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Overall Progress
              </label>
              <span className="font-bold text-[#1D4ED8] tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#1D4ED8] h-2 bg-slate-200 rounded-lg cursor-pointer mt-1.5"
            />
          </div>
        </div>

        {/* Dynamic Labour on Site Counter */}
        <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Labour on Site ({totalWorkers} Total Active)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Carpenters</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setCarpenters(Math.max(0, carpenters - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >-</button>
                <span className="font-bold text-sm text-[#111827]">{carpenters}</span>
                <button 
                  type="button" 
                  onClick={() => setCarpenters(carpenters + 1)}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >+</button>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Masons / Civil</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setMasons(Math.max(0, masons - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >-</button>
                <span className="font-bold text-sm text-[#111827]">{masons}</span>
                <button 
                  type="button" 
                  onClick={() => setMasons(masons + 1)}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >+</button>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Electricians</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setElectricians(Math.max(0, electricians - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >-</button>
                <span className="font-bold text-sm text-[#111827]">{electricians}</span>
                <button 
                  type="button" 
                  onClick={() => setElectricians(electricians + 1)}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >+</button>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Painters</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setPainters(Math.max(0, painters - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >-</button>
                <span className="font-bold text-sm text-[#111827]">{painters}</span>
                <button 
                  type="button" 
                  onClick={() => setPainters(painters + 1)}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >+</button>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Helpers</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setHelpers(Math.max(0, helpers - 1))}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >-</button>
                <span className="font-bold text-sm text-[#111827]">{helpers}</span>
                <button 
                  type="button" 
                  onClick={() => setHelpers(helpers + 1)}
                  className="w-5 h-5 rounded bg-white border border-slate-300 font-bold"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Photo Capture & Upload Box */}
        <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#1D4ED8]" />
              <span>Real-Time Site Photos ({photoFiles.length} attached)</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Mobile Camera direct trigger */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo</span>
              </button>

              {/* File upload trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
          </div>

          {/* Photo Previews Strip */}
          {photoPreviews.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {photoPreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB] group">
                  <img src={preview} alt="Site preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border border-dashed border-[#E5E7EB] rounded-lg text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Tap to take site photos with camera or drag images here.</p>
            </div>
          )}
        </div>

        {/* Work Completed Today */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
            Work Completed Today *
          </label>
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
            <textarea
              rows={3}
              value={workCompleted}
              onChange={(e) => setWorkCompleted(e.target.value)}
              placeholder="e.g. Master bedroom wardrobe carcass installed and leveled. Living room false ceiling perimeter gypsum board fixing completed."
              required
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] outline-none resize-none"
            />
          </div>
        </div>

        {/* In-Progress Tasks & Blockers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Pending / In-Progress Tasks
            </label>
            <textarea
              rows={2}
              value={workPending}
              onChange={(e) => setWorkPending(e.target.value)}
              placeholder="e.g. Kitchen plumbing points for dishwasher pending testing."
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl p-2.5 text-xs text-[#111827] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Site Issues / Blockers
            </label>
            <textarea
              rows={2}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="e.g. Awaiting client confirmation on electrical switch heights."
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl p-2.5 text-xs text-[#111827] outline-none resize-none"
            />
          </div>
        </div>

        {/* Tomorrow's Plan */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
            Tomorrow's Work Plan
          </label>
          <div className="relative">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] absolute left-3 top-2.5" />
            <textarea
              rows={2}
              value={nextDayTasks}
              onChange={(e) => setNextDayTasks(e.target.value)}
              placeholder="e.g. Applying primer coat on living room ceiling and delivery of quartz kitchen countertop."
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#1D4ED8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] outline-none resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Submitting Report...' : isEdit ? 'Update DPR' : 'Publish Daily Site Report (DPR)'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
