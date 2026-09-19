import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Medicine, MedicineStatus } from '../types';
import {
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const MedicinesView: React.FC = () => {
  const {
    medicines,
    markMedicineStatus,
    addMedicine,
    deleteMedicine,
    setCurrentView,
    speakText,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    time: '09:00 AM',
    frequency: 'Once daily after breakfast',
    instructions: '',
  });
  const [formError, setFormError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      setFormError('Please provide both the medicine name and dosage.');
      return;
    }
    setFormError('');
    await addMedicine({
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      time: formData.time.trim(),
      frequency: formData.frequency.trim(),
      instructions: formData.instructions.trim(),
    });
    setFormData({
      name: '',
      dosage: '',
      time: '09:00 AM',
      frequency: 'Once daily after breakfast',
      instructions: '',
    });
    setIsAdding(false);
  };

  const pendingCount = medicines.filter((m) => m.status === 'pending').length;
  const takenCount = medicines.filter((m) => m.status === 'taken').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Day</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <Pill className="w-10 h-10 text-emerald-600" />
            <span>Medicine Reminder</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            {pendingCount === 0
              ? 'All medicines have been taken today! Excellent.'
              : `You have ${pendingCount} medicine${pendingCount === 1 ? '' : 's'} scheduled for today.`}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-md transition-transform active:scale-95 border-2 border-emerald-700 min-h-[48px]"
        >
          <Plus className="w-6 h-6" />
          <span>{isAdding ? 'Cancel' : 'Add New Medicine'}</span>
        </button>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
        <AlertTriangle className="w-7 h-7 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
            Important Health Note
          </h2>
          <p className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-300 leading-relaxed mt-0.5">
            This schedule is based solely on information provided by you or your caregiver. Saathi is a daily organizer and does not provide medical advice or prescribe treatments. Always consult your doctor or pharmacist with questions about your medication.
          </p>
        </div>
      </div>

      {/* Add Medicine Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-stone-900 border-3 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <h2 className="text-2xl font-black text-stone-950 dark:text-white">
            Add a Medicine to Your Schedule
          </h2>

          {formError && (
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-bold text-base">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-name" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                Medicine Name *
              </label>
              <input
                id="med-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Metformin, Aspirin, Blood Pressure Tablet"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="med-dosage" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                Dosage / Strength *
              </label>
              <input
                id="med-dosage"
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500 mg, 1 tablet, 5 ml"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="med-time" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                Time of Day *
              </label>
              <input
                id="med-time"
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 09:00 AM, After Lunch, 8:00 PM"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="med-frequency" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                Frequency *
              </label>
              <input
                id="med-frequency"
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g. Daily after breakfast, Every evening"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="med-instructions" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                Optional Instructions / Notes
              </label>
              <input
                id="med-instructions"
                type="text"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g. Take with warm water, avoid dairy"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-md min-h-[48px]"
            >
              Save Medicine
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-white font-bold text-lg min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Medicines List */}
      <div className="space-y-4" role="list" aria-label="Today's medicines">
        {medicines.map((med) => {
          const isTaken = med.status === 'taken';
          const isSkipped = med.status === 'skipped';

          return (
            <div
              key={med.id}
              role="listitem"
              className={`border-3 rounded-3xl p-6 sm:p-7 shadow-sm transition-all ${
                isTaken
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 opacity-90'
                  : isSkipped
                  ? 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-700 opacity-80'
                  : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 hover:border-amber-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                      {med.name}
                    </span>
                    <span className="text-lg font-extrabold px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                      {med.dosage}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`text-sm font-black px-3 py-1 rounded-full ${
                        isTaken
                          ? 'bg-emerald-200 text-emerald-900'
                          : isSkipped
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {isTaken ? '✓ Taken' : isSkipped ? 'Skipped' : 'Pending'}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-stone-700 dark:text-stone-300 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{med.time} &bull; {med.frequency}</span>
                  </div>

                  {med.instructions && (
                    <p className="text-base font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                      📝 {med.instructions}
                    </p>
                  )}

                  {/* AI Explanation / Assistance */}
                  {med.aiExplanation && (
                    <div className="flex items-start gap-2 bg-amber-100/60 dark:bg-stone-800/80 p-3 rounded-xl border border-amber-300 dark:border-stone-700 mt-2">
                      <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-base font-bold text-stone-900 dark:text-stone-200">
                        <span>{med.aiExplanation}</span>
                        <button
                          onClick={() => speakText(med.aiExplanation || '')}
                          className="ml-2 text-xs font-black text-amber-800 dark:text-amber-300 underline"
                          aria-label={`Read instruction for ${med.name} out loud`}
                        >
                          (Read aloud)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0">
                  {!isTaken && (
                    <button
                      onClick={() => markMedicineStatus(med.id, 'taken')}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-sm transition-transform active:scale-95 border-2 border-emerald-700 min-h-[48px]"
                      aria-label={`Mark ${med.name} as taken`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Mark as Taken</span>
                    </button>
                  )}

                  {!isSkipped && !isTaken && (
                    <button
                      onClick={() => markMedicineStatus(med.id, 'skipped')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-base transition-colors min-h-[48px]"
                      aria-label={`Mark ${med.name} as skipped`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Skip</span>
                    </button>
                  )}

                  {(isTaken || isSkipped) && (
                    <button
                      onClick={() => markMedicineStatus(med.id, 'pending')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base min-h-[48px]"
                      aria-label={`Reset ${med.name} to pending`}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Undo</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${med.name}?`)) {
                        deleteMedicine(med.id);
                      }
                    }}
                    className="p-3 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors min-h-[48px]"
                    aria-label={`Delete ${med.name}`}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {medicines.length === 0 && (
          <div className="bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-12 text-center">
            <Pill className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <p className="text-xl font-bold text-stone-600 dark:text-stone-400">
              You haven't added any medicines yet.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-lg"
            >
              Add First Medicine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
