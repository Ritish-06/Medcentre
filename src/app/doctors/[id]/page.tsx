'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Stethoscope,
  MapPin,
  Clock,
  DollarSign,
  Award,
  Globe,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Star,
  Sparkles,
} from 'lucide-react';

interface DoctorDetail {
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

interface SlotInfo {
  time: string;
  date: string;
  available?: boolean;
  isAvailable?: boolean;
}

export default function DoctorBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('General health consultation and check-up');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Doctor Profile
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/doctors/${params.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDoctor(json.data.doctor);
        } else {
          setError(json.error?.message || 'Doctor profile not found');
        }
      } catch (e) {
        setError('Network error loading doctor profile.');
      } finally {
        setLoadingDoctor(false);
      }
    }

    fetchDoctor();
  }, [params.id]);

  // Fetch Live Slots when Date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!params.id || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/doctors/${params.id}/slots?date=${selectedDate}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSlots(json.data.slots || []);
        }
      } catch (e) {
        console.error('Failed to load slots', e);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
  }, [params.id, selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      showToast('Please choose an available appointment slot.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: params.id,
          date: selectedDate,
          time: selectedSlot,
          reason,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showToast('Appointment booked successfully!', 'success');
        router.push('/appointments');
      } else {
        showToast(json.error?.message || 'Failed to book appointment', 'error');
      }
    } catch (e) {
      showToast('Network error while booking appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return <LoadingState message="Loading physician clinical profile..." fullPage />;
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState title="Doctor Not Found" message={error || 'Profile could not be retrieved.'} />
          <div className="mt-4 text-center">
            <Link href="/doctors" className="text-xs font-bold text-sky-600 hover:text-sky-800">
              ← Return to Doctors Directory
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
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols) — Clinical Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Doctor Avatar & Identity */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
                  {doctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-extrabold text-slate-900">{doctor.name}</h1>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-emerald-700">{doctor.speciality}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
                </div>
              </div>

              {/* Consultation Fee Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Consultation Fee
                  </span>
                  <span className="text-2xl font-black text-slate-900">${doctor.consultationFee}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  Includes Follow-up
                </span>
              </div>

              {/* About & Clinical Focus */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">About Doctor</h3>
                <p className="text-slate-600 leading-relaxed">
                  {doctor.about ||
                    `${doctor.name} is a board-certified specialist with ${doctor.experience} years of clinical excellence in ${doctor.speciality}.`}
                </p>
              </div>

              {/* Specs Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{doctor.experience} Years</strong> Clinical Experience
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span>
                    <strong className="text-slate-900">4.9 / 5.0</strong> Patient Satisfaction Score
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Languages: {doctor.languages}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Available: {doctor.availableDays}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols) — 3-Step Slot Booking Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-block mb-2">
                  Instant Appointment Scheduler
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Book Your Consultation
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your preferred date, select an open time slot, and confirm your clinical reason.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* STEP 1: Select Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">
                      1
                    </span>
                    Select Consultation Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    required
                  />
                </div>

                {/* STEP 2: Select Time Slot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">
                        2
                      </span>
                      Select Available Time Slot
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {slots.filter((s) => (s.available ?? (s as any).isAvailable)).length} slots open
                    </span>
                  </div>

                  {slotsLoading ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                      Querying live slot availability...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
                      No consultation slots open for this date. Please pick another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {slots.map((s) => {
                        const isAvailable = s.available ?? (s as any).isAvailable ?? true;
                        const isSelected = selectedSlot === s.time;
                        return (
                          <button
                            type="button"
                            key={s.time}
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(s.time)}
                            className={`p-3 rounded-2xl text-xs font-bold text-center border transition-all ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300'
                                : isAvailable
                                ? 'bg-white text-slate-800 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            {s.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* STEP 3: Consultation Reason & Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">
                      3
                    </span>
                    Clinical Reason for Visit
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms, follow-up requirements, or medical questions..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={!selectedSlot || isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Securing Appointment Slot...' : `Confirm Appointment for $${doctor.consultationFee}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
