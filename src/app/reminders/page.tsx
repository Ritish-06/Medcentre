'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell,
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react';

interface AdherenceLogItem {
  id: string;
  action: 'TAKEN' | 'SKIPPED' | 'SNOOZED';
  actionDate: string;
  actionTime: string;
  notes?: string;
}

interface MedicationReminderItem {
  id: string;
  medicineName: string;
  dose: string;
  time: string;
  frequency: string;
  startDate: string;
  endDate: string;
  instructions?: string;
  isActive: boolean;
  snoozedUntil?: string;
  adherenceLogs: AdherenceLogItem[];
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reminders, setReminders] = useState<MedicationReminderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Reminder Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('1 Tablet (500mg)');
  const [time, setTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState('ONCE_DAILY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [instructions, setInstructions] = useState('Take post-meals with water');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reminders');
      const json = await res.json();
      if (json.success && json.data) {
        setReminders(json.data.reminders || []);
      }
    } catch (e) {
      console.error('Failed to load reminders', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAction = async (reminderId: string, action: 'TAKEN' | 'SKIPPED' | 'SNOOZED') => {
    try {
      const res = await fetch(`/api/reminders/${reminderId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || `Dose recorded as ${action}!`, 'success');
        fetchReminders();
      } else {
        showToast(json.error?.message || 'Failed to record dose', 'error');
      }
    } catch (e) {
      showToast('Network error while logging dose', 'error');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medication reminder?')) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Medication reminder removed', 'info');
        setReminders((prev) => prev.filter((r) => r.id !== id));
      } else {
        showToast(json.error?.message || 'Failed to delete reminder', 'error');
      }
    } catch (e) {
      showToast('Network error deleting reminder', 'error');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      showToast('Please enter a medicine name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName,
          dose,
          time,
          frequency,
          startDate,
          endDate,
          instructions,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Medication reminder created!', 'success');
        setShowAddModal(false);
        setMedicineName('');
        fetchReminders();
      } else {
        showToast(json.error?.message || 'Failed to create reminder', 'error');
      }
    } catch (e) {
      showToast('Network error creating reminder', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate adherence score
  const totalLogs = reminders.reduce((acc, r) => acc + (r.adherenceLogs?.length || 0), 0);
  const takenLogs = reminders.reduce(
    (acc, r) => acc + (r.adherenceLogs?.filter((l) => l.action === 'TAKEN').length || 0),
    0
  );
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/20 inline-block">
              Daily Dose Schedule
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Medication Reminders & Adherence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Stay on track with your prescription regimen. Log doses, snooze upcoming schedules, and track long-term adherence.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Adherence Rate</span>
              <span className="text-xl font-black text-white">{adherenceRate}%</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>
        </div>

        {/* Reminders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState
            title="No Active Medication Reminders"
            description="Set daily dosage alarms and schedules to never miss a prescribed medicine."
            actionLabel="Create First Reminder"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {rem.time}
                    </span>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{rem.medicineName}</h3>
                    <p className="text-xs text-sky-700 font-semibold mt-0.5">
                      {rem.dose} • {rem.frequency.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {rem.instructions && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      {rem.instructions}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>From: {rem.startDate}</span>
                    <span>To: {rem.endDate}</span>
                  </div>
                </div>

                {/* Micro-Interaction Quick Actions */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(rem.id, 'TAKEN')}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Taken
                  </button>

                  <button
                    onClick={() => handleAction(rem.id, 'SNOOZED')}
                    className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1 border border-amber-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Snooze
                  </button>

                  <button
                    onClick={() => handleAction(rem.id, 'SKIPPED')}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Reminder */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Set Medication Reminder</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Metformin 500mg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dose</label>
                    <input
                      type="text"
                      value={dose}
                      onChange={(e) => setDose(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take with food"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-40"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
