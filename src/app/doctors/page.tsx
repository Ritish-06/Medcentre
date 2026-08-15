'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Stethoscope,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Award,
  ArrowRight,
  Globe,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  location: string;
  languages: string;
  about?: string;
  availableDays: string;
}

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('ALL');
  const [maxFee, setMaxFee] = useState<number>(100);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('q', searchQuery);
        if (selectedSpeciality !== 'ALL') queryParams.set('speciality', selectedSpeciality);
        if (maxFee < 100) queryParams.set('maxFee', maxFee.toString());

        const res = await fetch(`/api/doctors?${queryParams.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDoctors(json.data.doctors || []);
          if (json.data.specialities) {
            setSpecialities(json.data.specialities);
          }
        }
      } catch (e) {
        console.error('Failed to load doctors', e);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [searchQuery, selectedSpeciality, maxFee]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Search Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block">
              Physicians & Clinical Specialists
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Find & Consult Certified Doctors
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-2xl leading-relaxed">
              Schedule in-person clinic appointments or instant teleconsultation sessions with licensed medical practitioners.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, clinical focus, or clinic..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md font-medium"
            />
          </div>
        </div>

        {/* Speciality Filter Pills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['ALL', ...specialities].map((spec) => {
              const active = selectedSpeciality === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setSelectedSpeciality(spec)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {spec === 'ALL' ? 'All Specialities' : spec}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{doctors.length}</span> verified practitioners
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No Doctors Found"
            description="No medical specialists matched your selected filters. Try searching for another name or speciality."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedSpeciality('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Doctor Avatar & Identity Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                        {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900">{doc.name}</h3>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs font-bold text-emerald-700">{doc.speciality}</p>
                        <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                      ${doc.consultationFee}
                    </span>
                  </div>

                  {/* Badges & Clinical Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-semibold">Experience</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {doc.experience} Years
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-semibold">Rating</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        4.9 (500+ visits)
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.location}</span>
                    </div>
                  </div>

                  {/* Languages & Schedule */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                      {doc.languages}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {doc.availableDays}
                    </span>
                  </div>
                </div>

                {/* Direct Action */}
                <Link
                  href={`/doctors/${doc.id}`}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  View Profile & Book Slot
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
