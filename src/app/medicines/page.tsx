'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Pill,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
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
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const POPULAR_SEARCHES = ['Amoxicillin', 'Paracetamol', 'Metformin', 'Atorvastatin', 'Ibuprofen', 'Cetirizine'];
const CATEGORIES = [
  'All',
  'Antibiotics',
  'Analgesics',
  'Cardiovascular',
  'Antidiabetics',
  'Antihistamines',
  'Gastrointestinal',
  'Respiratory',
  'Vitamins',
  'Endocrinology',
  'Neurology',
];

export default function MedicinesCatalogPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 8, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [strengthFilter, setStrengthFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Selected Medicine for Modal View Details
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter && categoryFilter !== 'All') params.set('category', categoryFilter);
      if (strengthFilter) params.set('strength', strengthFilter);
      params.set('page', page.toString());
      params.set('limit', '8');

      const res = await fetch(`/api/medicines?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setMedicines(json.data.medicines);
        setPagination(json.data.pagination);
      } else {
        setError(json.error?.message || 'Failed to retrieve medicines list');
      }
    } catch (e) {
      setError('Network connection error while fetching medicines');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, strengthFilter, page]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMedicines();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStrengthFilter('');
    setPage(1);
  };

  const handleCheckAvailability = (medicineId: string) => {
    router.push(`/pharmacy/availability?medicineId=${medicineId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Marketplace Search Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block">
              Pharmaceutical Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Search Medicines & Therapeutics
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-2xl leading-relaxed">
              Verify authentic active ingredients, check clinical dosage forms, and query real-time stock across local verified partner pharmacies.
            </p>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name, generic name, or active ingredient..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md font-medium"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-md transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
              Search Database
            </button>
          </form>

          {/* Popular Searches Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
            <span className="font-semibold text-slate-300">Popular:</span>
            {POPULAR_SEARCHES.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => {
                  setSearchQuery(query);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/10 transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar & Quick Filter Controls */}
        <div className="space-y-4">
          {/* Horizontal Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = (categoryFilter === '' && cat === 'All') || categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat === 'All' ? '' : cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-sky-600" />
                Filters:
              </div>

              {/* Strength Filter Dropdown */}
              <select
                value={strengthFilter}
                onChange={(e) => {
                  setStrengthFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Strengths</option>
                <option value="500mg">500mg</option>
                <option value="400mg">400mg</option>
                <option value="850mg">850mg</option>
                <option value="20mg">20mg</option>
                <option value="10mg">10mg</option>
                <option value="5mg">5mg</option>
                <option value="250mg">250mg</option>
              </select>

              {(searchQuery || categoryFilter || strengthFilter) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{medicines.length}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.totalCount}</span> medicines
            </div>
          </div>
        </div>

        {/* Results Body */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-9 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMedicines} />
        ) : medicines.length === 0 ? (
          <EmptyState
            title="No medicines match your search criteria"
            description="Try changing the category, clearing keyword filters, or verifying spelling."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Category & Rx Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                      {medicine.category}
                    </span>
                    {medicine.prescriptionRequired ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-500" />
                        Rx Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        OTC
                      </span>
                    )}
                  </div>

                  {/* Medicine Brand & Name */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {medicine.name}
                    </h3>
                    <p className="text-xs text-sky-600 font-semibold mt-0.5">Brand: {medicine.brandName}</p>
                  </div>

                  {/* Metadata Specs */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <p>
                      <span className="font-semibold text-slate-700">Generic:</span> {medicine.genericName}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Form & Strength:</span> {medicine.dosageForm} ({medicine.strength})
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Building className="w-3.5 h-3.5" />
                      {medicine.manufacturer}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedMedicine(medicine)}
                    className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    View Details
                  </button>

                  <button
                    onClick={() => handleCheckAvailability(medicine.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Check Availability
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-semibold text-slate-600">
              Page <span className="font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.totalPages}</span>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal: Medicine Details */}
        {selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {selectedMedicine.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">{selectedMedicine.name}</h3>
                  <p className="text-xs text-sky-600 font-semibold">Brand Name: {selectedMedicine.brandName}</p>
                </div>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 text-xs">
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="font-medium text-slate-500">Generic Name</span>
                  <span className="font-bold text-slate-900">{selectedMedicine.genericName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="font-medium text-slate-500">Strength & Dosage Form</span>
                  <span className="font-bold text-slate-900">
                    {selectedMedicine.strength} • {selectedMedicine.dosageForm}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="font-medium text-slate-500">Manufacturer</span>
                  <span className="font-bold text-slate-900">{selectedMedicine.manufacturer}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="font-medium text-slate-500">Active Ingredients</span>
                  <span className="font-bold text-slate-900">{selectedMedicine.activeIngredients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Prescription Status</span>
                  <span
                    className={`font-bold ${
                      selectedMedicine.prescriptionRequired ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedMedicine.prescriptionRequired ? 'Mandatory Prescription' : 'Over the Counter (OTC)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const id = selectedMedicine.id;
                    setSelectedMedicine(null);
                    handleCheckAvailability(id);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check Pharmacy Availability
                </button>
                <Link
                  href={`/medicines/${selectedMedicine.id}`}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Full Page
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
