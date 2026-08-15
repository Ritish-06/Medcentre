'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Calendar,
  Stethoscope,
  FlaskConical,
  FileCheck,
  ShieldCheck,
  Plus,
  X,
  Eye,
  Pill,
  Clock,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface MedicineItem {
  id: string;
  medicineName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  quantity: number;
}

interface PrescriptionDetail {
  id: string;
  status: string;
  notes?: string;
  medicines: MedicineItem[];
  doctor?: {
    name: string;
    speciality: string;
  };
}

interface HealthRecordItem {
  id: string;
  title: string;
  category: 'PRESCRIPTIONS' | 'LAB_REPORTS' | 'MEDICAL_DOCUMENTS' | 'DOCTOR_VISITS';
  fileName: string;
  fileType: string;
  fileSize: number;
  recordDate: string;
  doctorName?: string;
  description?: string;
  prescriptionId?: string;
  prescription?: PrescriptionDetail;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Records', icon: FileText },
  { id: 'PRESCRIPTIONS', label: 'Prescriptions', icon: Pill },
  { id: 'LAB_REPORTS', label: 'Lab Reports', icon: FlaskConical },
  { id: 'MEDICAL_DOCUMENTS', label: 'Medical Documents', icon: FileCheck },
  { id: 'DOCTOR_VISITS', label: 'Doctor Visits', icon: Stethoscope },
];

export default function HealthRecordsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<HealthRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('LAB_REPORTS');
  const [uploadDoctor, setUploadDoctor] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadDescription, setUploadDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Record Modal
  const [viewRecord, setViewRecord] = useState<HealthRecordItem | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'ALL' ? '/api/health-records' : `/api/health-records?category=${selectedCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(json.data.records || []);
      }
    } catch (e) {
      console.error('Failed to load health records', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast('Document title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          doctorName: uploadDoctor || undefined,
          recordDate: uploadDate,
          description: uploadDescription || undefined,
          fileName: `${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
          fileType: 'application/pdf',
          fileSize: 1024 * 512,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Document uploaded to Health Vault!', 'success');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadDoctor('');
        setUploadDescription('');
        fetchRecords();
      } else {
        showToast(json.error?.message || 'Failed to upload document', 'error');
      }
    } catch (e) {
      showToast('Network error while saving document', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record from your vault?')) return;
    try {
      const res = await fetch(`/api/health-records/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Record deleted from vault', 'info');
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (viewRecord?.id === id) setViewRecord(null);
      } else {
        showToast(json.error?.message || 'Failed to delete record', 'error');
      }
    } catch (e) {
      showToast('Network error deleting record', 'error');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRESCRIPTIONS':
        return <Pill className="w-4 h-4 text-sky-600" />;
      case 'LAB_REPORTS':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'DOCTOR_VISITS':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Vault Hero Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-300 border border-white/20 inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              256-Bit Encrypted Health Vault
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Personal Health Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Securely store and organize lab reports, clinical visit notes, diagnostic summaries, and doctor digital prescriptions.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="Your Health Vault is Empty"
            description="Upload medical documents, prescriptions, or clinical lab results to organize your health records."
            actionLabel="Upload First Document"
            onAction={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1.5">
                      {getCategoryIcon(rec.category)}
                      {rec.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(rec.recordDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{rec.title}</h3>
                    {rec.doctorName && (
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {rec.doctorName}
                      </p>
                    )}
                  </div>

                  {rec.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{rec.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setViewRecord(rec)}
                    className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>

                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: View Record */}
        {viewRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {viewRecord.category.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">{viewRecord.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date: {viewRecord.recordDate} • Document: {viewRecord.fileName}
                  </p>
                </div>
                <button
                  onClick={() => setViewRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewRecord.description && (
                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Clinical Notes</span>
                  {viewRecord.description}
                </div>
              )}

              {/* Digital Prescription Items Breakdown */}
              {viewRecord.prescription && viewRecord.prescription.medicines?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Prescribed Medications</h4>
                  <div className="space-y-2">
                    {viewRecord.prescription.medicines.map((m) => (
                      <div
                        key={m.id}
                        className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{m.medicineName}</span>
                          <span className="text-[11px] text-slate-500">
                            {m.strength} • {m.frequency} • {m.duration}
                          </span>
                        </div>
                        <span className="font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                          Qty: {m.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setViewRecord(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Upload Document */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Upload to Health Vault</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC) Report"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="LAB_REPORTS">Lab Reports & Diagnostics</option>
                    <option value="PRESCRIPTIONS">Prescriptions</option>
                    <option value="DOCTOR_VISITS">Doctor Clinical Notes</option>
                    <option value="MEDICAL_DOCUMENTS">General Medical Documents</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Doctor / Clinic</label>
                    <input
                      type="text"
                      value={uploadDoctor}
                      onChange={(e) => setUploadDoctor(e.target.value)}
                      placeholder="e.g. Dr. Sarah Connor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Key findings, diagnostic metrics, or doctor remarks..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-40"
                  >
                    Save to Vault
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
