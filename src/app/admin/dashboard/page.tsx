'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  Building2,
  Pill,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  FileText,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'users'
  | 'doctors'
  | 'pharmacies'
  | 'medicines'
  | 'orders'
  | 'appointments';

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Overview Stats State
  const [stats, setStats] = useState<any>(null);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('ALL');

  // Doctors State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  // Pharmacies State
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [pharmacySearch, setPharmacySearch] = useState('');

  // Medicines State
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineCategory, setMedicineCategory] = useState('ALL');
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [medFormData, setMedFormData] = useState({
    name: '',
    genericName: '',
    brandName: '',
    strength: '',
    dosageForm: 'Tablet',
    category: 'Antibiotics',
    manufacturer: '',
    prescriptionRequired: false,
    activeIngredients: '',
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('ALL');

  // Appointments State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [aptSearch, setAptSearch] = useState('');
  const [aptStatus, setAptStatus] = useState('ALL');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Stats Overview
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set('q', userSearch);
      if (userRole !== 'ALL') params.set('role', userRole);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data.users || []);
      }
    } catch (e) {
      console.error('Failed to load users', e);
    }
  }, [userSearch, userRole]);

  // Fetch Doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (doctorSearch) params.set('q', doctorSearch);
      const res = await fetch(`/api/admin/doctors?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDoctors(json.data.doctors || []);
      }
    } catch (e) {
      console.error('Failed to load doctors', e);
    }
  }, [doctorSearch]);

  // Fetch Pharmacies
  const fetchPharmacies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (pharmacySearch) params.set('q', pharmacySearch);
      const res = await fetch(`/api/admin/pharmacies?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPharmacies(json.data.pharmacies || []);
      }
    } catch (e) {
      console.error('Failed to load pharmacies', e);
    }
  }, [pharmacySearch]);

  // Fetch Medicines
  const fetchMedicines = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (medicineSearch) params.set('q', medicineSearch);
      if (medicineCategory !== 'ALL') params.set('category', medicineCategory);
      const res = await fetch(`/api/admin/medicines?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMedicines(json.data.medicines || []);
      }
    } catch (e) {
      console.error('Failed to load medicines', e);
    }
  }, [medicineSearch, medicineCategory]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (orderSearch) params.set('q', orderSearch);
      if (orderStatus !== 'ALL') params.set('status', orderStatus);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  }, [orderSearch, orderStatus]);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (aptSearch) params.set('q', aptSearch);
      if (aptStatus !== 'ALL') params.set('status', aptStatus);
      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAppointments(json.data.appointments || []);
      }
    } catch (e) {
      console.error('Failed to load appointments', e);
    }
  }, [aptSearch, aptStatus]);

  // Load Tab Data
  useEffect(() => {
    setLoading(true);
    const loadCurrentTab = async () => {
      if (activeTab === 'overview') await fetchStats();
      else if (activeTab === 'users') await fetchUsers();
      else if (activeTab === 'doctors') await fetchDoctors();
      else if (activeTab === 'pharmacies') await fetchPharmacies();
      else if (activeTab === 'medicines') await fetchMedicines();
      else if (activeTab === 'orders') await fetchOrders();
      else if (activeTab === 'appointments') await fetchAppointments();
      setLoading(false);
    };
    loadCurrentTab();
  }, [
    activeTab,
    fetchStats,
    fetchUsers,
    fetchDoctors,
    fetchPharmacies,
    fetchMedicines,
    fetchOrders,
    fetchAppointments,
  ]);

  // Toggle Pharmacy Active
  const handleTogglePharmacy = async (pharmacyId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/pharmacies/${pharmacyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Pharmacy status updated', 'success');
        fetchPharmacies();
      } else {
        showToast(json.error?.message || 'Failed to update pharmacy', 'error');
      }
    } catch (e) {
      showToast('Network error updating pharmacy', 'error');
    }
  };

  // Medicine Add / Edit Submit
  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingMedicine
        ? `/api/admin/medicines/${editingMedicine.id}`
        : '/api/admin/medicines';
      const method = editingMedicine ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medFormData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Medicine saved successfully!', 'success');
        setShowAddMedicineModal(false);
        setEditingMedicine(null);
        setMedFormData({
          name: '',
          genericName: '',
          brandName: '',
          strength: '',
          dosageForm: 'Tablet',
          category: 'Antibiotics',
          manufacturer: '',
          prescriptionRequired: false,
          activeIngredients: '',
        });
        fetchMedicines();
      } else {
        showToast(json.error?.message || 'Failed to save medicine', 'error');
      }
    } catch (e) {
      showToast('Network error saving medicine', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${name}'?`)) return;
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Medicine deleted', 'info');
        fetchMedicines();
      } else {
        showToast(json.error?.message || 'Failed to delete medicine', 'error');
      }
    } catch (e) {
      showToast('Network error deleting medicine', 'error');
    }
  };

  if (authLoading) {
    return <LoadingState message="Authenticating Admin System Console..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-16">
      {/* Admin Subnav Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'doctors', label: 'Doctors', icon: Stethoscope },
            { id: 'pharmacies', label: 'Pharmacies', icon: Building2 },
            { id: 'medicines', label: 'Medicines', icon: Pill },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {loading ? (
          <LoadingState message={`Loading ${activeTab} data from database...`} />
        ) : (
          <>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Metric Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Registered Users
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.counts.users}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{stats.counts.patients} Patients</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                      Specialist Doctors
                    </span>
                    <h3 className="text-2xl font-black text-indigo-700 mt-1">{stats.counts.doctors}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{stats.counts.appointments} Consultations</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
                      Network Pharmacies
                    </span>
                    <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats.counts.pharmacies}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{stats.counts.medicines} Catalog Medicines</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">
                      Gross Order Volume
                    </span>
                    <h3 className="text-2xl font-black text-sky-700 mt-1">${stats.counts.revenue.toFixed(2)}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{stats.counts.orders} Total Orders</p>
                  </div>
                </div>

                {/* Recent Activity Feeds */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-sky-600" />
                        Recent Patient Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {stats.recentOrders?.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                            <span className="text-slate-500 block text-[11px]">
                              {ord.user?.name} • {ord.pharmacy?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 block">
                              ${ord.finalAmount.toFixed(2)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        Recent Doctor Consultations
                      </h3>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {stats.recentAppointments?.map((apt: any) => (
                        <div
                          key={apt.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{apt.doctor?.name}</span>
                            <span className="text-slate-500 block text-[11px]">
                              Patient: {apt.patient?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-700 block">
                              {apt.date} • {apt.time}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                    <p className="text-xs text-slate-500">Search and filter registered platform accounts.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search name, email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="p-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="PATIENT">Patients</option>
                      <option value="DOCTOR">Doctors</option>
                      <option value="PHARMACY">Pharmacies</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Activity</th>
                        <th className="pb-3">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 text-slate-600">{u.email}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'DOCTOR'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.role === 'PHARMACY'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500">{u.phone || '—'}</td>
                          <td className="py-3 text-slate-500">
                            {u._count?.orders || 0} orders • {u._count?.appointments || 0} appts
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Doctor Specialists Directory</h2>
                    <p className="text-xs text-slate-500">Verified clinical practitioners and consultation fees.</p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search doctor, speciality..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                              {doc.speciality}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-1">{doc.name}</h3>
                            <p className="text-slate-500">{doc.qualification}</p>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900">
                            ${doc.consultationFee.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-slate-600 text-[11px]">
                          <p>Location: {doc.location}</p>
                          <p>Experience: {doc.experience} Years</p>
                          <p>Languages: {doc.languages}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified Practitioner
                        </span>
                        <span className="text-slate-500">
                          {doc._count?.appointments || 0} Appointments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PHARMACIES TAB */}
            {activeTab === 'pharmacies' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Pharmacy Network Management</h2>
                    <p className="text-xs text-slate-500">Verify, approve, or deactivate partner pharmacies.</p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search pharmacy..."
                      value={pharmacySearch}
                      onChange={(e) => setPharmacySearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {pharmacies.map((pharm) => (
                    <div
                      key={pharm.id}
                      className="p-5 border border-slate-200 rounded-xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">{pharm.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              pharm.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {pharm.active ? 'Active & Approved' : 'Deactivated / Pending'}
                          </span>
                        </div>
                        <p className="text-slate-500">{pharm.address}</p>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Phone: {pharm.phone} • Hours: {pharm.openingHours}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                          <span className="font-bold text-slate-800 block">
                            {pharm._count?.inventories || 0} Items Stocked
                          </span>
                          <span>{pharm._count?.orders || 0} Orders Handled</span>
                        </div>

                        <button
                          onClick={() => handleTogglePharmacy(pharm.id, pharm.active)}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                            pharm.active
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {pharm.active ? 'Deactivate' : 'Approve & Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MEDICINES TAB */}
            {activeTab === 'medicines' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Medicines Catalog Master</h2>
                    <p className="text-xs text-slate-500">Create, edit, and curate pharmaceutical medicines.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setEditingMedicine(null);
                        setMedFormData({
                          name: '',
                          genericName: '',
                          brandName: '',
                          strength: '',
                          dosageForm: 'Tablet',
                          category: 'Antibiotics',
                          manufacturer: '',
                          prescriptionRequired: false,
                          activeIngredients: '',
                        });
                        setShowAddMedicineModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Medicine
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Medicine Name</th>
                        <th className="pb-3">Generic / Brand</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Strength & Form</th>
                        <th className="pb-3">Prescription</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-bold text-slate-900">{med.name}</td>
                          <td className="py-3 text-slate-600">
                            {med.genericName} ({med.brandName})
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {med.category}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">
                            {med.strength} • {med.dosageForm}
                          </td>
                          <td className="py-3">
                            {med.prescriptionRequired ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Rx Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingMedicine(med);
                                  setMedFormData({
                                    name: med.name,
                                    genericName: med.genericName,
                                    brandName: med.brandName,
                                    strength: med.strength,
                                    dosageForm: med.dosageForm,
                                    category: med.category,
                                    manufacturer: med.manufacturer,
                                    prescriptionRequired: med.prescriptionRequired,
                                    activeIngredients: med.activeIngredients,
                                  });
                                  setShowAddMedicineModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                                title="Edit medicine"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(med.id, med.name)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete medicine"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Platform Orders Ledger</h2>
                    <p className="text-xs text-slate-500">Monitor order disbursements, statuses, and revenue.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search order #, customer..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden"
                      />
                    </div>

                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="p-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Order #</th>
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Pharmacy</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-mono font-bold text-slate-900">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 font-medium text-slate-800">{ord.user?.name}</td>
                          <td className="py-3 text-slate-600">{ord.pharmacy?.name}</td>
                          <td className="py-3 text-slate-500">
                            {ord.items?.length || 0} medicines
                          </td>
                          <td className="py-3 font-extrabold text-slate-900">
                            ${ord.finalAmount.toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Doctor Consultations Schedule</h2>
                    <p className="text-xs text-slate-500">Global ledger of patient medical consultations.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search patient, doctor..."
                        value={aptSearch}
                        onChange={(e) => setAptSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden"
                      />
                    </div>

                    <select
                      value={aptStatus}
                      onChange={(e) => setAptStatus(e.target.value)}
                      className="p-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Apt #</th>
                        <th className="pb-3">Doctor</th>
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Date & Slot</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-mono font-bold text-slate-900">
                            {apt.appointmentNumber}
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            {apt.doctor?.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {apt.doctor?.speciality}
                            </span>
                          </td>
                          <td className="py-3 text-slate-800">{apt.patient?.name}</td>
                          <td className="py-3 font-semibold text-slate-700">
                            {apt.date} • {apt.time}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                apt.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'COMPLETED'
                                  ? 'bg-sky-100 text-sky-800'
                                  : apt.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 max-w-xs truncate">{apt.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add / Edit Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddMedicineModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingMedicine ? 'Edit Medicine Details' : 'Add New Pharmaceutical Medicine'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure catalog information, clinical category, strength, and prescription requirement.
            </p>

            <form onSubmit={handleMedicineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg Capsule"
                  value={medFormData.name}
                  onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin"
                    value={medFormData.genericName}
                    onChange={(e) => setMedFormData({ ...medFormData, genericName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxil"
                    value={medFormData.brandName}
                    onChange={(e) => setMedFormData({ ...medFormData, brandName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg"
                    value={medFormData.strength}
                    onChange={(e) => setMedFormData({ ...medFormData, strength: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage Form *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Capsule, Tablet"
                    value={medFormData.dosageForm}
                    onChange={(e) => setMedFormData({ ...medFormData, dosageForm: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Antibiotics"
                    value={medFormData.category}
                    onChange={(e) => setMedFormData({ ...medFormData, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GlaxoSmithKline"
                  value={medFormData.manufacturer}
                  onChange={(e) => setMedFormData({ ...medFormData, manufacturer: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="prescriptionCheck"
                  checked={medFormData.prescriptionRequired}
                  onChange={(e) =>
                    setMedFormData({ ...medFormData, prescriptionRequired: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
                <label htmlFor="prescriptionCheck" className="font-bold text-slate-800">
                  Prescription Required (Rx Only)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving Medicine...'
                  : editingMedicine
                  ? 'Update Medicine'
                  : 'Add to Medicine Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
