'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Pill,
  ArrowLeft,
  ShieldAlert,
  Building,
  CheckCircle2,
  Check,
  FileText,
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  manufacturer: string;
  prescriptionRequired: boolean;
  activeIngredients: string;
  createdAt: string;
  updatedAt: string;
}

export default function MedicineDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicineDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/medicines/${params.id}`);
        const json = await res.json();
        if (json.success && json.data?.medicine) {
          setMedicine(json.data.medicine);
        } else {
          setError(json.error?.message || `Medicine with ID '${params.id}' was not found.`);
        }
      } catch (e) {
        setError('Network error loading medicine details.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMedicineDetail();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingState message="Loading medicine detail records..." fullPage />;
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState
            title="Medicine Not Found"
            message={error || 'Invalid or missing medicine identifier.'}
            onRetry={() => router.push('/medicines')}
          />
          <div className="mt-4 text-center">
            <Link
              href="/medicines"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Medicine Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  {medicine.category}
                </span>
                {medicine.prescriptionRequired ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Prescription Required (Rx)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Over-the-Counter (OTC)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{medicine.name}</h1>
              <p className="text-sm font-semibold text-sky-600 mt-1">Brand Name: {medicine.brandName}</p>
            </div>

            <button
              onClick={() => router.push(`/pharmacy/availability?medicineId=${medicine.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Check Availability
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-600" />
                Active Pharmaceutical Info
              </h3>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Generic Name</span>
                <span className="text-sm font-bold text-slate-800">{medicine.genericName}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Active Ingredients</span>
                <span className="text-sm font-bold text-slate-800">{medicine.activeIngredients}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Manufacturing & Specifications
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Dosage Form</span>
                  <span className="text-sm font-bold text-slate-800">{medicine.dosageForm}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Strength</span>
                  <span className="text-sm font-bold text-slate-800">{medicine.strength}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Manufacturer</span>
                <span className="text-sm font-bold text-slate-800">{medicine.manufacturer}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
