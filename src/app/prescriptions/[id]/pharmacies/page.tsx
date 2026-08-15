'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  Truck,
  ShoppingBag,
  DollarSign,
  FileCheck,
  ShoppingCart,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PharmacyMatch {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
    openingHours: string;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    latitude: number | null;
    longitude: number | null;
  };
  availableCount: number;
  totalCount: number;
  isFullyAvailable: boolean;
  totalPrice: number;
  distanceKm: number | null;
  availableMedicines: {
    prescriptionMedicineId: string;
    medicineName: string;
    requiredQuantity: number;
    unitPrice: number;
    totalItemPrice: number;
    inStockQuantity: number;
  }[];
  unavailableMedicines: {
    medicineName: string;
    strength: string;
    requiredQuantity: number;
  }[];
}

export default function PrescriptionPharmaciesPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [prescription, setPrescription] = useState<any>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPharmacyId, setAddingPharmacyId] = useState<string | null>(null);

  const handleAddAllToCart = async (match: PharmacyMatch) => {
    if (match.availableMedicines.length === 0) {
      showToast('No available medicines to add to cart.', 'error');
      return;
    }

    setAddingPharmacyId(match.pharmacy.id);
    try {
      for (const item of match.availableMedicines) {
        // Find matching medicine id from prescription
        const presMed = prescription?.medicines?.find(
          (m: any) => m.id === item.prescriptionMedicineId
        );
        const medId = presMed?.medicineId || presMed?.id;
        if (medId) {
          await addToCart(medId, match.pharmacy.id, item.requiredQuantity);
        }
      }
      showToast(`Added ${match.availableMedicines.length} medicines to cart!`, 'success');
      router.push('/cart');
    } catch (e) {
      showToast('Failed to add some medicines to cart.', 'error');
    } finally {
      setAddingPharmacyId(null);
    }
  };

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pharmacies/find-availability?prescriptionId=${params.id}`);
        const json = await res.json();
        if (json.success) {
          setPrescription(json.data.prescription);
          setPharmacies(json.data.pharmacies);
        } else {
          setError(json.error?.message || 'Failed to match prescription against pharmacy inventories.');
        }
      } catch (e) {
        setError('Network error searching pharmacy availability.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchAvailability();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingState message="Matching prescription medicines against local pharmacy inventories..." fullPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState title="Pharmacy Matching Error" message={error} />
          <div className="mt-4 text-center">
            <Link
              href="/prescriptions/scan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Prescription Scanner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/prescriptions/scan"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scanner
          </Link>
          <span className="text-xs text-slate-500 font-medium">
            Prescription ID: <span className="font-mono font-bold text-slate-900">{params.id.slice(0, 8)}...</span>
          </span>
        </div>

        {/* Hero Title Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block">
            Pharmacy Inventory Matcher
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pharmacy Availability & Price Comparison
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/90 max-w-xl">
            Ranked comparison matching {prescription?.medicinesCount || prescription?.medicines?.length || 0} required prescription medications across verified local pharmacy stock.
          </p>
        </div>

        {/* Ranked Pharmacies List */}
        {pharmacies.length === 0 ? (
          <EmptyState
            title="No Pharmacies Available"
            description="No active partner pharmacies currently have all required prescription medicines in stock."
            actionLabel="Try Searching General Catalog"
            onAction={() => router.push('/medicines')}
          />
        ) : (
          <div className="space-y-6">
            {pharmacies.map((match, idx) => (
              <div
                key={match.pharmacy.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-xs hover-card-elevation space-y-6 transition-all ${
                  match.isFullyAvailable
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Rank #{idx + 1}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">{match.pharmacy.name}</h3>
                      {match.isFullyAvailable && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          100% In Stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {match.pharmacy.address}
                      {match.distanceKm !== null && (
                        <span className="font-bold text-sky-700 ml-1">({match.distanceKm} km away)</span>
                      )}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-1 text-right">
                    <span className="text-xs text-slate-400">Total Prescription Price</span>
                    <span className="text-2xl font-black text-slate-900">${match.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Available vs Unavailable Items Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Medicine Availability Breakdown ({match.availableCount} of {match.totalCount} in stock)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {match.availableMedicines.map((item) => (
                      <div
                        key={item.prescriptionMedicineId}
                        className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                          <span className="text-[11px] text-slate-500">
                            Qty: {item.requiredQuantity} • In Stock: {item.inStockQuantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 block">${item.totalItemPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">(${item.unitPrice.toFixed(2)}/ea)</span>
                        </div>
                      </div>
                    ))}

                    {match.unavailableMedicines.map((item, i) => (
                      <div
                        key={i}
                        className="bg-rose-50/50 rounded-2xl p-3.5 border border-rose-100 flex items-center justify-between text-xs text-rose-900"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold block">{item.medicineName}</span>
                          <span className="text-[11px] text-rose-700">{item.strength} • Qty: {item.requiredQuantity}</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                          Out of Stock
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pharmacy Capabilities & Order Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {match.pharmacy.openingHours}
                    </span>
                    {match.pharmacy.deliveryAvailable && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        Doorstep Delivery Available
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddAllToCart(match)}
                    disabled={addingPharmacyId === match.pharmacy.id || match.availableMedicines.length === 0}
                    className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addingPharmacyId === match.pharmacy.id
                      ? 'Adding Items to Cart...'
                      : `Add ${match.availableCount} Medicines to Cart ($${match.totalPrice.toFixed(2)})`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
