'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  UserCheck,
  Ban,
  Plus,
  AlertTriangle,
} from 'lucide-react';

interface AppointmentItem {
  id: string;
  appointmentNumber: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  notes?: string;
  rescheduledToDate?: string;
  rescheduledToTime?: string;
  createdAt: string;
  doctor: {
    id: string;
    name: string;
    speciality: string;
    qualification: string;
    location: string;
    consultationFee: number;
  };
}

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentItem | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const json = await res.json();
      if (json.success && json.data) {
        setAppointments(json.data.appointments || []);
      }
    } catch (e) {
      console.error('Failed to load appointments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const confirmCancelAppointment = async () => {
    if (!cancellingAppointment) return;
    setIsSubmittingCancel(true);

    try {
      const res = await fetch(`/api/appointments/${cancellingAppointment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      const json = await res.json();

      if (json.success) {
        showToast('Appointment successfully cancelled', 'info');
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === cancellingAppointment.id ? { ...a, status: 'CANCELLED' } : a
          )
        );
        setCancellingAppointment(null);
      } else {
        showToast(json.error?.message || 'Failed to cancel appointment', 'error');
      }
    } catch (e) {
      showToast('Network error cancelling appointment', 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your doctor appointments..." fullPage />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Doctor Acceptance
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Rescheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20 inline-block">
              Clinical Consultations
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              My Appointments & Consultations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage your upcoming visits, view specialist details, and cancel or reschedule clinical appointments.
            </p>
          </div>

          <Link
            href="/doctors"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            Book Specialist
          </Link>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <EmptyState
            title="No Appointments Scheduled"
            description="You don't have any upcoming or past medical appointments."
            actionLabel="Find Medical Specialist"
            onAction={() => router.push('/doctors')}
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-slate-900">#{apt.appointmentNumber}</span>
                    {getStatusBadge(apt.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      Booked on {new Date(apt.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{apt.doctor.name}</h3>
                      <p className="text-xs font-semibold text-emerald-700">{apt.doctor.speciality} • {apt.doctor.qualification}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{apt.doctor.location}</p>
                    </div>
                  </div>

                  {apt.reason && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <strong className="text-slate-900">Reason:</strong> {apt.reason}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:items-end justify-between gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {/* Date & Time Badge */}
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 text-right space-y-1">
                    <div className="flex items-center sm:justify-end gap-1.5 text-xs font-black text-sky-900">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      {apt.date}
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-sky-700">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {apt.time}
                    </div>
                  </div>

                  {/* Actions */}
                  {apt.status === 'PENDING' || apt.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => setCancellingAppointment(apt)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Visit
                    </button>
                  ) : (
                    <Link
                      href={`/doctors/${apt.doctor.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      Book Follow-up
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingAppointment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Cancel Appointment #{cancellingAppointment.appointmentNumber}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to cancel your consultation with <strong className="text-slate-800">{cancellingAppointment.doctor.name}</strong> scheduled for <strong className="text-slate-800">{cancellingAppointment.date} at {cancellingAppointment.time}</strong>?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={() => setCancellingAppointment(null)}
                  className="py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={confirmCancelAppointment}
                  className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Yes, Cancel Visit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
