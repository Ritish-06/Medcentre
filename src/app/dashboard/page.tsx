'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  FileText,
  Search,
  Building2,
  Stethoscope,
  ShieldCheck,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Pill,
  ShoppingBag,
  Activity,
  User,
  Heart,
  ChevronRight,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  pharmacy: {
    name: string;
  };
  items: {
    quantity: number;
    medicine: {
      name: string;
    };
  }[];
}

interface Appointment {
  id: string;
  appointmentNumber: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  doctor: {
    name: string;
    speciality: string;
  };
}

interface Reminder {
  id: string;
  medicineName: string;
  dose: string;
  time: string;
  frequency: string;
  isActive: boolean;
}

export default function PatientDashboardPage() {
  const { user, loading, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ordersRes, aptsRes, remRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/appointments'),
          fetch('/api/reminders'),
        ]);

        const [ordersJson, aptsJson, remJson] = await Promise.all([
          ordersRes.json(),
          aptsRes.json(),
          remRes.json(),
        ]);

        if (ordersJson.success && ordersJson.data) {
          setRecentOrders(ordersJson.data.orders?.slice(0, 3) || []);
        }
        if (aptsJson.success && aptsJson.data) {
          setUpcomingAppointments(
            (aptsJson.data.appointments || []).filter(
              (a: Appointment) => a.status === 'CONFIRMED' || a.status === 'PENDING'
            ).slice(0, 2)
          );
        }
        if (remJson.success && remJson.data) {
          setReminders((remJson.data.reminders || []).slice(0, 3));
        }
      } catch (e) {
        console.error('Failed to load dashboard feeds', e);
      } finally {
        setDataLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your health portal..." fullPage />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Delivered
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
            <Truck className="w-3 h-3 text-sky-600" />
            Out for Delivery
          </span>
        );
      case 'PREPARING':
      case 'READY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            {status}
          </span>
        );
      case 'PRESCRIPTION_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Reviewing Rx
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block mb-2">
              Patient Overview
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-xl">
              Here’s your healthcare overview. Track prescriptions, monitor orders, and schedule upcoming clinical visits.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start sm:self-auto">
            <Link
              href="/health-records"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Health Vault
            </Link>
            <Link
              href="/prescriptions/scan"
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Scan Rx
            </Link>
          </div>
        </div>

        {/* ROW 1: 4 PROMINENT QUICK ACTIONS */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Healthcare Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Scan Prescription */}
            <Link
              href="/prescriptions/scan"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation group space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Scan Prescription
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Instant OCR parsing & pharmacy matching</p>
              </div>
              <span className="text-[11px] font-bold text-sky-600 flex items-center gap-1 pt-1">
                Upload Document <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Action 2: Find Medicine */}
            <Link
              href="/medicines"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation group space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Find Medicine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore catalog & active ingredients</p>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 pt-1">
                Search Catalog <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Action 3: Pharmacy Availability */}
            <Link
              href="/pharmacy/availability"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation group space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                  Pharmacy Stock
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time local inventory & prices</p>
              </div>
              <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1 pt-1">
                Check Availability <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Action 4: Book Doctor */}
            <Link
              href="/doctors"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation group space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Book Specialist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Certified physicians & instant slots</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                Find Physicians <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* ROW 2: ACTIVE ORDER LIVE TRACKER & UPCOMING APPOINTMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active / Recent Orders (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active & Recent Orders</h2>
              </div>
              <Link href="/orders" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5">
                View All ({recentOrders.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No active medication orders</p>
                <p className="text-xs text-slate-400">Find in-stock medicines or scan a prescription to begin.</p>
                <Link
                  href="/medicines"
                  className="inline-block px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100"
                >
                  Order Medicines
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">#{order.orderNumber}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-slate-500">
                        {order.pharmacy.name} • {order.items.length} item(s) •{' '}
                        <span className="font-bold text-slate-900">${order.finalAmount.toFixed(2)}</span>
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    >
                      <Activity className="w-3.5 h-3.5 text-sky-600" />
                      Track Live Status
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointment & Consultations (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Upcoming Appointments</h2>
              </div>
              <Link href="/appointments" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No appointments scheduled</p>
                <p className="text-xs text-slate-400">Book in-person or video consultations with specialists.</p>
                <Link
                  href="/doctors"
                  className="inline-block px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
                >
                  Book Doctor
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-card-elevation space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{apt.doctor.name}</p>
                          <p className="text-[11px] text-slate-500">{apt.doctor.speciality}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: DAILY MEDICATION REMINDERS & HEALTH RECORDS QUICK ACCESS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Daily Dose Schedule (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daily Dose Schedule</h2>
              </div>
              <Link href="/reminders" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                All Reminders <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center text-xs text-slate-400">
                No active medication alarms. Set one in <Link href="/reminders" className="text-sky-600 font-bold">Reminders</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 hover-card-elevation"
                  >
                    <div className="flex items-center justify-between">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                        {rem.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{rem.medicineName}</p>
                    <p className="text-[10px] text-slate-500">{rem.dose} • {rem.frequency.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Vault Quick Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Health Records Vault</h2>
              </div>
              <Link href="/health-records" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
                Open Vault <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl p-5 border border-purple-200/70 space-y-3">
              <p className="text-xs text-purple-900 font-medium leading-relaxed">
                Your medical prescriptions, lab reports, and doctor clinical summaries are protected with 256-bit HIPAA compliant storage.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/health-records"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
                >
                  View My Vault
                </Link>
                <Link
                  href="/health-records"
                  className="px-3.5 py-2 rounded-xl bg-white text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-50 transition-colors"
                >
                  Upload File
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
