'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Stethoscope,
  LogOut,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Check,
  Ban,
  Phone,
  Mail,
  X,
  FileText,
  Plus,
  Trash2,
  Pill,
} from 'lucide-react';

interface AppointmentRecord {
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
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctor: {
    id: string;
    name: string;
    speciality: string;
  };
}

interface PatientOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PrescribedMedRow {
  medicineName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

const STANDARD_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
];

export default function DoctorDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Reschedule Modal State
  const [reschedulingAppointment, setReschedulingAppointment] = useState<AppointmentRecord | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState<string>('09:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Digital Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedRow[]>([
    {
      medicineName: 'Amoxicillin 500mg Capsule',
      strength: '500mg',
      dosageForm: 'Capsule',
      frequency: 'Three times daily after meals',
      duration: '5 days',
      quantity: 15,
      instructions: 'Take with full glass of water',
    },
  ]);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  const fetchDoctorAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/appointments');
      const json = await res.json();
      if (json.success && json.data) {
        setAppointments(json.data.appointments || []);
      }
    } catch (e) {
      console.error('Failed to load doctor appointments', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientsList = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor/patients');
      const json = await res.json();
      if (json.success && json.data) {
        setPatients(json.data.patients || []);
        if (json.data.patients?.length > 0 && !selectedPatientId) {
          setSelectedPatientId(json.data.patients[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load patients', e);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    fetchDoctorAppointments();
    fetchPatientsList();
  }, [fetchDoctorAppointments, fetchPatientsList]);

  const handleAction = async (
    appointmentId: string,
    action: string,
    extraBody?: Record<string, any>
  ) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraBody }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || `Appointment updated!`, 'success');
        setReschedulingAppointment(null);
        fetchDoctorAppointments();
      } else {
        showToast(json.error?.message || 'Failed to update appointment', 'error');
      }
    } catch (e) {
      showToast('Network error updating appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment) return;
    handleAction(reschedulingAppointment.id, 'RESCHEDULE', {
      newDate: rescheduleDate,
      newTime: rescheduleTime,
    });
  };

  const handleAddMedicineRow = () => {
    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        medicineName: 'Paracetamol 650mg Tablet',
        strength: '650mg',
        dosageForm: 'Tablet',
        frequency: 'Twice daily as needed',
        duration: '3 days',
        quantity: 6,
        instructions: 'Take for fever or body ache',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (prescribedMedicines.length === 1) {
      showToast('Prescription must have at least one medication.', 'error');
      return;
    }
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      showToast('Please select a patient', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          medicines: prescribedMedicines,
          clinicalNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Digital prescription issued and synced to Patient Health Records!', 'success');
        setShowPrescriptionModal(false);
        setClinicalNotes('');
      } else {
        showToast(json.error?.message || 'Failed to issue prescription', 'error');
      }
    } catch (e) {
      showToast('Network error issuing prescription', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingState message="Authenticating doctor workspace..." fullPage />;
  }

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'PENDING') return apt.status === 'PENDING';
    if (filter === 'CONFIRMED') return apt.status === 'CONFIRMED' || apt.status === 'RESCHEDULED';
    if (filter === 'COMPLETED') return apt.status === 'COMPLETED';
    if (filter === 'CANCELLED') return apt.status === 'CANCELLED' || apt.status === 'REJECTED';
    return true;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'RESCHEDULED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Rescheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            Completed
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Title & Action Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {user?.name || 'Dr. Sarah Connor'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Doctor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Clinical Appointments & Teleconsultation Workspace</p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchPatientsList();
              setShowPrescriptionModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Pill className="w-4 h-4" />
            Issue Digital Prescription
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Consultations</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <Calendar className="w-8 h-8 text-sky-600 p-1.5 bg-sky-50 rounded-xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{stats.pending}</h3>
            </div>
            <Clock className="w-8 h-8 text-amber-600 p-1.5 bg-amber-50 rounded-xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed</span>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.confirmed}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Completed</span>
              <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">{stats.completed}</h3>
            </div>
            <UserCheck className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-50 rounded-xl" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Consultations ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pending Review ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancelled / Rejected
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <LoadingState message="Loading doctor consultation schedules..." />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments match this filter"
            description="Patient booking requests will appear here in real time."
          />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-slate-900">
                        Patient: {apt.patient?.name}
                      </h3>
                      {getStatusBadge(apt.status)}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {apt.patient?.email}
                      </span>
                      {apt.patient?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {apt.patient?.phone}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Slot Time
                      </span>
                      <span className="text-sm font-extrabold text-sky-700">
                        {apt.date} • {apt.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 font-semibold block mb-0.5">Clinical Reason:</span>
                    <p className="font-semibold text-slate-800">{apt.reason}</p>
                  </div>

                  {/* Doctor Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* If Pending */}
                    {apt.status === 'PENDING' && (
                      <>
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleAction(apt.id, 'ACCEPT')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleAction(apt.id, 'REJECT')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Quick Prescribe button for this patient */}
                    <button
                      onClick={() => {
                        setSelectedPatientId(apt.patient.id);
                        setShowPrescriptionModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 font-bold text-xs hover:bg-sky-100 transition-colors flex items-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      Prescribe
                    </button>

                    {/* Reschedule Button */}
                    {apt.status !== 'CANCELLED' && apt.status !== 'REJECTED' && apt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setReschedulingAppointment(apt);
                          setRescheduleDate(apt.date);
                          setRescheduleTime(apt.time);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reschedule
                      </button>
                    )}

                    {/* If Confirmed/Rescheduled -> Complete */}
                    {(apt.status === 'CONFIRMED' || apt.status === 'RESCHEDULED') && (
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleAction(apt.id, 'COMPLETE')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Digital Prescription Builder Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative my-8">
            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Pill className="w-4 h-4" />
              Doctor Clinical Portal
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Issue Verified Digital Prescription</h3>
            <p className="text-xs text-slate-500 mb-6">
              Prescription will be automatically verified, signed with your doctor credentials, and saved to the patient&apos;s Health Records.
            </p>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-5 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl font-semibold bg-slate-50 text-slate-900"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine Item Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Prescribed Medications *</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medication
                  </button>
                </div>

                <div className="space-y-3">
                  {prescribedMedicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-xs">Medication #{idx + 1}</span>
                        {prescribedMedicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Amoxicillin)"
                            required
                            value={med.medicineName}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].medicineName = e.target.value;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Strength (e.g. 500mg)"
                            required
                            value={med.strength}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].strength = e.target.value;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Form (Tablet/Capsule)"
                            value={med.dosageForm}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].dosageForm = e.target.value;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Frequency (Twice daily)"
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].frequency = e.target.value;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Duration (5 days)"
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].duration = e.target.value;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={med.quantity}
                            onChange={(e) => {
                              const updated = [...prescribedMedicines];
                              updated[idx].quantity = parseInt(e.target.value, 10) || 1;
                              setPrescribedMedicines(updated);
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Instructions & Dietary Advice
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with plenty of fluids. Avoid alcohol during the antibiotic course. Follow up in 7 days."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Issuing Digital Prescription...' : 'Sign & Issue Digital Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setReschedulingAppointment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Reschedule Consultation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: {reschedulingAppointment.patient?.name}
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Consultation Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Time Slot *</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-800"
                >
                  {STANDARD_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Rescheduling...' : 'Confirm Rescheduled Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
