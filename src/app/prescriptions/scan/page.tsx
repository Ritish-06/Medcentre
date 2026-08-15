'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  UploadCloud,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  FileCheck,
  X,
  Sparkles,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ExtractedMedicine {
  id: string;
  prescriptionId: string;
  medicineId?: string;
  medicineName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  quantity: number;
  confidence: number;
  isVerified: boolean;
}

interface PrescriptionRecord {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING_VERIFICATION' | 'VERIFIED';
  verifiedAt?: string;
  createdAt: string;
  ocrResult?: {
    rawText: string;
    confidence: number;
  };
  medicines: ExtractedMedicine[];
}

export default function PrescriptionScannerPage() {
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(1);
  const [prescription, setPrescription] = useState<PrescriptionRecord | null>(null);

  // Edit / Add Modal States
  const [editingMedicine, setEditingMedicine] = useState<ExtractedMedicine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form States
  const [medicineForm, setMedicineForm] = useState({
    medicineName: '',
    strength: '500mg',
    dosageForm: 'Tablet',
    frequency: 'Twice daily',
    duration: '7 days',
    quantity: 14,
  });

  // Client-Side File Validation
  const handleFileSelect = (file: File) => {
    setFileError(null);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (file.size > maxBytes) {
      const err = `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Please choose a smaller file.`;
      setFileError(err);
      showToast(err, 'error');
      return;
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const err = `Unsupported file format '${file.type}'. Allowed formats are JPG, JPEG, PNG, and PDF.`;
      setFileError(err);
      showToast(err, 'error');
      return;
    }

    setSelectedFile(file);
  };

  // Upload & Run OCR Processing
  const handleUploadAndScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setFileError(null);
    setScanStep(1);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('prescriptionFile', selectedFile);

      const res = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setPrescription(json.data.prescription);
        showToast('Prescription scanned & verified!', 'success');
      } else {
        setFileError(json.error?.message || 'OCR parsing failed');
        showToast(json.error?.message || 'OCR parsing failed', 'error');
      }
    } catch (e) {
      setFileError('Network error uploading prescription document.');
      showToast('Network error uploading prescription', 'error');
    } finally {
      clearInterval(stepInterval);
      setIsScanning(false);
    }
  };

  // Add Item to Prescription
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescription) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineForm),
      });

      const json = await res.json();

      if (json.success) {
        showToast('Medicine item added successfully', 'success');
        setIsAddModalOpen(false);
        setMedicineForm({
          medicineName: '',
          strength: '500mg',
          dosageForm: 'Tablet',
          frequency: 'Twice daily',
          duration: '7 days',
          quantity: 14,
        });
        refreshPrescription(prescription.id);
      } else {
        showToast(json.error?.message || 'Failed to add medicine', 'error');
      }
    } catch (e) {
      showToast('Network error adding medicine', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edit Item
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine || !prescription) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}/medicines`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: editingMedicine.id,
          medicineName: editingMedicine.medicineName,
          strength: editingMedicine.strength,
          dosageForm: editingMedicine.dosageForm,
          frequency: editingMedicine.frequency,
          duration: editingMedicine.duration,
          quantity: Number(editingMedicine.quantity),
          isVerified: true,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showToast('Medicine item updated', 'success');
        setEditingMedicine(null);
        refreshPrescription(prescription.id);
      } else {
        showToast(json.error?.message || 'Failed to update medicine', 'error');
      }
    } catch (e) {
      showToast('Network error updating medicine', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteMedicine = async (medicineId: string) => {
    if (!prescription) return;
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}/medicines?medicineId=${medicineId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        showToast('Medicine item deleted', 'info');
        refreshPrescription(prescription.id);
      } else {
        showToast(json.error?.message || 'Failed to delete medicine', 'error');
      }
    } catch (e) {
      showToast('Network error deleting medicine', 'error');
    }
  };

  // Confirm Prescription Verification
  const handleConfirmPrescription = async () => {
    if (!prescription) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}/confirm`, {
        method: 'POST',
      });
      const json = await res.json();

      if (json.success) {
        setPrescription(json.data.prescription);
        showToast('Prescription verified and confirmed!', 'success');
      } else {
        showToast(json.error?.message || 'Verification confirmation failed', 'error');
      }
    } catch (e) {
      showToast('Network error confirming prescription', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshPrescription = async (id: string) => {
    try {
      const res = await fetch(`/api/prescriptions/${id}`);
      const json = await res.json();
      if (json.success) {
        setPrescription(json.data.prescription);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Form Section (Shown when no prescription scanned yet) */}
        {!prescription && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-100/80 text-sky-800 border border-sky-200/70 inline-block">
                Clinical OCR Intelligence
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Upload & Scan Prescription
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Upload your medical prescription in JPG, PNG, or PDF format. Our neural engine automatically extracts medications, strengths, and matches nearby pharmacy stock.
              </p>
            </div>

            <div className="bg-white border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-3xl p-8 sm:p-10 text-center transition-all shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Drag & drop your prescription</h3>
                <p className="text-xs text-slate-400 mt-1">Accepts high-resolution JPG, PNG, or PDF files (Max 5MB)</p>
              </div>

              <input
                type="file"
                id="prescriptionUploadInput"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <label
                htmlFor="prescriptionUploadInput"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
              >
                Choose File
              </label>

              {selectedFile && (
                <div className="mt-4 p-4 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center justify-between text-xs text-sky-950">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-6 h-6 text-sky-600 shrink-0" />
                    <div>
                      <span className="font-bold block">{selectedFile.name}</span>
                      <span className="text-[11px] text-sky-700">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-sky-700 hover:text-sky-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {fileError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {fileError}
                </div>
              )}
            </div>

            {/* Scan Progress Indicator */}
            {isScanning && (
              <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
                    Scanning Document...
                  </span>
                  <span>Step {scanStep} of 4</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${(scanStep / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {scanStep === 1 && '1. Uploading encrypted prescription file...'}
                  {scanStep === 2 && '2. Reading text and handwritten notations...'}
                  {scanStep === 3 && '3. Matching pharmaceutical compounds in database...'}
                  {scanStep === 4 && '4. Verifying dosage forms & partner availability...'}
                </p>
              </div>
            )}

            <div>
              <button
                disabled={!selectedFile || isScanning}
                onClick={handleUploadAndScan}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-sm hover:shadow-lg hover:shadow-sky-600/20 transition-all shadow-md disabled:opacity-40"
              >
                {isScanning ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Processing OCR Pipeline...
                  </>
                ) : (
                  <>
                    Scan Prescription Document
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen (Shown after scanning) */}
        {prescription && (
          <div className="space-y-6">
            {/* Medical Safety Disclaimer Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">Medical Safety & OCR Human Review</h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Please review the extracted medication items below against your original prescription. You can edit dosages, add missing medicines, or confirm before querying pharmacies.
                </p>
              </div>
            </div>

            {/* Document Header Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base font-extrabold text-slate-900">{prescription.fileName}</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Uploaded on {new Date(prescription.createdAt).toLocaleDateString()} • {prescription.medicines.length} medicine(s) detected
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>

                <button
                  onClick={() => setPrescription(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </div>

            {/* Extracted Medicine Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recognized Medication Items ({prescription.medicines.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescription.medicines.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">{med.medicineName}</span>
                        {med.confidence >= 0.85 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ✓ High Confidence ({Math.round(med.confidence * 100)}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            ⚠ Needs Verification
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Strength & Form</span>
                          <span className="font-bold text-slate-800">{med.strength} • {med.dosageForm}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Frequency</span>
                          <span className="font-bold text-slate-800">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Duration</span>
                          <span className="font-bold text-slate-800">{med.duration}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Units</span>
                          <span className="font-bold text-slate-800">{med.quantity} count</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setEditingMedicine(med)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">Ready to find local inventory?</span>
                <span className="text-xs text-slate-500">Confirm medications to rank pharmacies with stock and lowest pricing.</span>
              </div>

              <div className="flex items-center gap-3">
                {prescription.status !== 'VERIFIED' && (
                  <button
                    onClick={handleConfirmPrescription}
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Items
                  </button>
                )}

                <Link
                  href={`/prescriptions/${prescription.id}/pharmacies`}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Find Matching Pharmacies
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Medicine */}
        {editingMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Edit Medicine Details</h3>
                <button onClick={() => setEditingMedicine(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={editingMedicine.medicineName}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, medicineName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Strength</label>
                    <input
                      type="text"
                      value={editingMedicine.strength}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, strength: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
                    <input
                      type="text"
                      value={editingMedicine.dosageForm}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, dosageForm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={editingMedicine.frequency}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, frequency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingMedicine.duration}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editingMedicine.quantity}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMedicine(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-40"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Medicine */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Add Medicine Item</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMedicine} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={medicineForm.medicineName}
                    onChange={(e) => setMedicineForm({ ...medicineForm, medicineName: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Strength</label>
                    <input
                      type="text"
                      value={medicineForm.strength}
                      onChange={(e) => setMedicineForm({ ...medicineForm, strength: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
                    <input
                      type="text"
                      value={medicineForm.dosageForm}
                      onChange={(e) => setMedicineForm({ ...medicineForm, dosageForm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={medicineForm.frequency}
                      onChange={(e) => setMedicineForm({ ...medicineForm, frequency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={medicineForm.duration}
                      onChange={(e) => setMedicineForm({ ...medicineForm, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={medicineForm.quantity}
                    onChange={(e) => setMedicineForm({ ...medicineForm, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-40"
                  >
                    Add Medicine
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
