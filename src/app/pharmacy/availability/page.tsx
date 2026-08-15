'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Building2,
  Pill,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Truck,
  ShoppingBag,
  ShoppingCart,
  Star,
  ShieldCheck,
  Zap,
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
}

interface PharmacyStockMatch {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
    openingHours: string;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
  };
  inventory: {
    id: string;
    SKU: string;
    batchNumber: string;
    quantity: number;
    price: number;
    MRP: number;
    expiryDate: string;
  };
  distanceKm: number | null;
}

function MedicineAvailabilityContent() {
  const searchParams = useSearchParams();
  const medicineId = searchParams.get('medicineId');
  const { addToCart } = useCart();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyStockMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPharmacyId, setAddingPharmacyId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicineAvailability() {
      if (!medicineId) {
        setError('No medicine specified.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pharmacy/availability?medicineId=${medicineId}`);
        const json = await res.json();
        if (json.success) {
          setMedicine(json.data.medicine);
          setPharmacies(json.data.pharmacies);
        } else {
          setError(json.error?.message || 'Failed to check pharmacy availability');
        }
      } catch (e) {
        setError('Network error loading availability.');
      } finally {
        setLoading(false);
      }
    }

    fetchMedicineAvailability();
  }, [medicineId]);

  const handleAddToCart = async (match: PharmacyStockMatch) => {
    if (!medicine) return;
    setAddingPharmacyId(match.pharmacy.id);
    try {
      await addToCart(medicine.id, match.pharmacy.id, 1);
    } finally {
      setAddingPharmacyId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Querying live pharmacy inventories..." fullPage />;
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState title="Medicine Unavailable" message={error || 'Could not load medicine availability.'} />
          <div className="mt-4 text-center">
            <Link href="/medicines" className="text-xs font-bold text-sky-600 hover:text-sky-800">
              ← Return to Medicine Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Back Navigation */}
        <Link
          href="/medicines"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Medicines Catalog
        </Link>

        {/* Selected Medicine Info Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block">
            {medicine.category}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            {medicine.name}
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/90 max-w-xl">
            Brand: <strong className="text-white">{medicine.brandName}</strong> • Generic: <strong className="text-white">{medicine.genericName}</strong> • Form: <strong className="text-white">{medicine.dosageForm} ({medicine.strength})</strong>
          </p>
        </div>

        {/* Available Pharmacies Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verified Partner Pharmacies with Active Stock ({pharmacies.length})
          </h2>

          {pharmacies.length === 0 ? (
            <EmptyState
              title="Out of Stock in Local Network"
              description="No partner pharmacies currently hold active inventory for this medicine item."
              actionLabel="Explore Alternative Medicines"
              onAction={() => window.location.href = '/medicines'}
            />
          ) : (
            <div className="space-y-4">
              {pharmacies.map((match) => (
                <div
                  key={match.pharmacy.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">{match.pharmacy.name}</h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        In Stock ({match.inventory.quantity} units)
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {match.pharmacy.address}
                      {match.distanceKm !== null && (
                        <span className="font-bold text-sky-700 ml-1">({match.distanceKm} km away)</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Batch: <strong className="text-slate-700 font-mono">{match.inventory.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Expires: <strong className="text-slate-700">{new Date(match.inventory.expiryDate).toLocaleDateString()}</strong></span>
                      <span>•</span>
                      <span>Hours: <strong className="text-slate-700">{match.pharmacy.openingHours}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Unit Price</span>
                      <span className="text-2xl font-black text-slate-900">${match.inventory.price.toFixed(2)}</span>
                      {match.inventory.MRP > match.inventory.price && (
                        <span className="text-[10px] text-slate-400 line-through block">
                          MRP: ${match.inventory.MRP.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(match)}
                      disabled={addingPharmacyId === match.pharmacy.id}
                      className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-40"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {addingPharmacyId === match.pharmacy.id ? 'Adding to Cart...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MedicineAvailabilityPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading pharmacy availability..." fullPage />}>
      <MedicineAvailabilityContent />
    </Suspense>
  );
}
