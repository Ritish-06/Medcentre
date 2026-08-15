'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Building2,
  LogOut,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  DollarSign,
  X,
  Filter,
  Truck,
  ShoppingBag,
  Clock,
  FileText,
  Eye,
  Check,
  Ban,
  ArrowRight,
  MapPin,
  Phone,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
}

interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  SKU: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  price: number;
  MRP: number;
  isExpired: boolean;
  isOutOfStock: boolean;
  isAvailable: boolean;
  medicine: Medicine;
}

interface PharmacyProfile {
  id: string;
  name: string;
  active: boolean;
}

interface PharmacyOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  finalAmount: number;
  deliveryType: string;
  shippingAddress: string;
  contactPhone: string;
  customerNotes?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  prescription?: {
    id: string;
    fileName: string;
    status: string;
    ocrResult?: {
      rawText: string;
      confidence: number;
    };
    medicines?: {
      id: string;
      medicineName: string;
      strength: string;
      quantity: number;
      confidence: number;
    }[];
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    medicine: {
      id: string;
      name: string;
      strength: string;
      dosageForm: string;
    };
  }[];
  payment?: {
    paymentMethod: string;
    paymentStatus: string;
  };
}

export default function PharmacyDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  const [pharmacy, setPharmacy] = useState<PharmacyProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, inStockCount: 0, outOfStockCount: 0, expiredCount: 0 });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Orders Filter States
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);

  // Inventory Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form States
  const [addFormData, setAddFormData] = useState({
    medicineId: '',
    SKU: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 50,
    price: 10.0,
    MRP: 12.0,
  });

  const [editFormData, setEditFormData] = useState({
    quantity: 0,
    price: 0,
    MRP: 0,
    batchNumber: '',
    expiryDate: '',
  });

  // Fetch Pharmacy Profile & Inventory
  const fetchPharmacyInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pharmaciesRes = await fetch('/api/pharmacies');
      const pharmaciesJson = await pharmaciesRes.json();

      let currentPharmacy: PharmacyProfile | null = null;
      if (pharmaciesJson.success && pharmaciesJson.data.pharmacies.length > 0) {
        currentPharmacy = pharmaciesJson.data.pharmacies[0];
        setPharmacy(currentPharmacy);
      }

      if (!currentPharmacy) {
        setError('No active pharmacy profile found for this account.');
        setLoading(false);
        return;
      }

      const invRes = await fetch(`/api/pharmacies/${currentPharmacy.id}/inventory`);
      const invJson = await invRes.json();

      if (invJson.success) {
        setInventory(invJson.data.inventory);
        setStats({
          totalCount: invJson.data.inventory.length,
          inStockCount: invJson.data.inventory.filter((i: InventoryItem) => i.isAvailable).length,
          outOfStockCount: invJson.data.inventory.filter((i: InventoryItem) => i.isOutOfStock).length,
          expiredCount: invJson.data.inventory.filter((i: InventoryItem) => i.isExpired).length,
        });
      }

      const medRes = await fetch('/api/medicines?limit=100');
      const medJson = await medRes.json();
      if (medJson.success) {
        setAvailableMedicines(medJson.data.medicines);
      }
    } catch (e) {
      setError('Network error loading pharmacy inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Incoming Orders
  const fetchPharmacyOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/pharmacy/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load pharmacy orders', e);
    }
  }, []);

  useEffect(() => {
    fetchPharmacyInventory();
    fetchPharmacyOrders();
  }, [fetchPharmacyInventory, fetchPharmacyOrders]);

  // Handle Workflow Action (Accept, Reject, Preparing, Ready, Dispatch, Deliver)
  const handleOrderAction = async (orderId: string, action: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || `Order updated successfully!`, 'success');
        fetchPharmacyOrders();
        fetchPharmacyInventory(); // Sync inventory in case of rejection restock
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(json.data.order);
        }
      } else {
        showToast(json.error?.message || 'Failed to update order', 'error');
      }
    } catch (e) {
      showToast('Network error updating order status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'PENDING') {
      return order.status === 'PENDING' || order.status === 'PRESCRIPTION_REVIEW';
    }
    if (orderFilter === 'ACTIVE') {
      return ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status);
    }
    if (orderFilter === 'DELIVERED') {
      return order.status === 'DELIVERED';
    }
    if (orderFilter === 'CANCELLED') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  // Filter Inventory items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'in_stock') return item.isAvailable;
    if (statusFilter === 'out_of_stock') return item.isOutOfStock;
    if (statusFilter === 'expired') return item.isExpired;

    return true;
  });

  // Inventory Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.medicineId) {
      showToast('Please select a medicine', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to add inventory', 'error');
      } else {
        showToast('Inventory item added successfully!', 'success');
        setIsAddModalOpen(false);
        fetchPharmacyInventory();
      }
    } catch (e) {
      showToast('Network error adding inventory', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pharmacy/inventory/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to update inventory', 'error');
      } else {
        showToast('Inventory updated successfully!', 'success');
        setEditingItem(null);
        fetchPharmacyInventory();
      }
    } catch (e) {
      showToast('Network error updating inventory', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInventory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;
    try {
      const res = await fetch(`/api/pharmacy/inventory/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to delete inventory', 'error');
      } else {
        showToast('Inventory item deleted', 'info');
        fetchPharmacyInventory();
      }
    } catch (e) {
      showToast('Network error deleting item', 'error');
    }
  };

  if (authLoading) {
    return <LoadingState message="Authenticating pharmacy portal..." fullPage />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
      case 'READY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Ready for Dispatch
          </span>
        );
      case 'PREPARING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Preparing Medicines
          </span>
        );
      case 'PRESCRIPTION_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-600" />
            Prescription Review Required
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Order Accepted
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled / Rejected
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
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pharmacy Console Hero Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {pharmacy?.name || 'City Care Pharmacy'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Pharmacy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Fulfillment, Inventory & Prescription Order Processing</p>
            </div>
          </div>
        </div>
        {/* Navigation Tabs (Orders vs Inventory) */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-3">
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchPharmacyOrders();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Incoming & Active Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory Stock Catalog ({stats.totalCount})
          </button>
        </div>

        {/* TAB 1: PHARMACY ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setOrderFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Orders ({orders.length})
              </button>

              <button
                onClick={() => setOrderFilter('PENDING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Pending & Review (
                {orders.filter((o) => o.status === 'PENDING' || o.status === 'PRESCRIPTION_REVIEW').length}
                )
              </button>

              <button
                onClick={() => setOrderFilter('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === 'ACTIVE'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                In Progress (
                {orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)).length}
                )
              </button>

              <button
                onClick={() => setOrderFilter('DELIVERED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === 'DELIVERED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Delivered ({orders.filter((o) => o.status === 'DELIVERED').length})
              </button>

              <button
                onClick={() => setOrderFilter('CANCELLED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderFilter === 'CANCELLED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancelled ({orders.filter((o) => o.status === 'CANCELLED').length})
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <EmptyState
                title="No orders match this filter"
                description="Orders placed by patients for your pharmacy will appear here in real time."
              />
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-base font-extrabold text-slate-900">
                            {order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-slate-500">
                          Customer: <span className="font-semibold text-slate-800">{order.user?.name}</span> • Phone:{' '}
                          <span className="font-semibold text-slate-800">{order.contactPhone}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Delivery Address: <span className="text-slate-700">{order.shippingAddress}</span>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between gap-1">
                        <span className="text-lg font-extrabold text-sky-700">${order.finalAmount.toFixed(2)}</span>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">
                          {order.payment?.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Order Items & Actions */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-xs text-slate-600">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                          Prescribed Items ({order.items.length})
                        </span>
                        <p className="text-slate-800 font-medium">
                          {order.items.map((it) => `${it.quantity}x ${it.medicine?.name}`).join(', ')}
                        </p>
                      </div>

                      {/* Workflow Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Details Modal Trigger */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review & Details
                        </button>

                        {/* If Pending / Prescription Review */}
                        {(order.status === 'PENDING' || order.status === 'PRESCRIPTION_REVIEW') && (
                          <>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleOrderAction(order.id, 'ACCEPT')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept Order
                            </button>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleOrderAction(order.id, 'REJECT')}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* If Confirmed */}
                        {order.status === 'CONFIRMED' && (
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleOrderAction(order.id, 'PREPARING')}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5" />
                            Start Preparing
                          </button>
                        )}

                        {/* If Preparing */}
                        {order.status === 'PREPARING' && (
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleOrderAction(order.id, 'READY')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Ready
                          </button>
                        )}

                        {/* If Ready */}
                        {order.status === 'READY' && (
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleOrderAction(order.id, 'DISPATCH')}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Dispatch (Out for Delivery)
                          </button>
                        )}

                        {/* If Out for Delivery */}
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleOrderAction(order.id, 'DELIVER')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirm Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY STOCK CATALOG */}
        {activeTab === 'inventory' && (
          <div>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SKUs</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalCount}</h3>
                </div>
                <Package className="w-8 h-8 text-sky-600 p-1.5 bg-sky-50 rounded-lg" />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">In Stock & Valid</span>
                  <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.inStockCount}</h3>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-lg" />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Out of Stock</span>
                  <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{stats.outOfStockCount}</h3>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600 p-1.5 bg-amber-50 rounded-lg" />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Expired Batches</span>
                  <h3 className="text-2xl font-extrabold text-rose-700 mt-1">{stats.expiredCount}</h3>
                </div>
                <XCircle className="w-8 h-8 text-rose-600 p-1.5 bg-rose-50 rounded-lg" />
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Medicine name, SKU, or Batch..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
                >
                  <option value="all">All Inventory</option>
                  <option value="in_stock">In Stock & Non-Expired</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="expired">Expired Batches</option>
                </select>

                <button
                  onClick={() => {
                    setAddFormData({
                      medicineId: availableMedicines[0]?.id || '',
                      SKU: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                      batchNumber: `BATCH-2026-${Math.floor(10 + Math.random() * 90)}`,
                      expiryDate: '2027-12-31',
                      quantity: 50,
                      price: 12.0,
                      MRP: 15.0,
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Medicine</th>
                      <th className="py-3.5 px-4">SKU / Batch</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4 text-center">Stock</th>
                      <th className="py-3.5 px-4 text-right">Price</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{item.medicine.name}</span>
                          <span className="text-[11px] text-slate-500">{item.medicine.genericName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700 block">{item.SKU}</span>
                          <span className="text-[11px] text-slate-400">{item.batchNumber}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={item.isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-extrabold ${
                              item.isOutOfStock ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-slate-900 block">${item.price.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 line-through">MRP: ${item.MRP.toFixed(2)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.isAvailable ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Available
                            </span>
                          ) : item.isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditFormData({
                                quantity: item.quantity,
                                price: item.price,
                                MRP: item.MRP,
                                batchNumber: item.batchNumber,
                                expiryDate: item.expiryDate.split('T')[0],
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(item.id, item.medicine.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Details & Prescription Review Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-sky-600 uppercase">Pharmacy Inspection</span>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              Order #{selectedOrder.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            {/* Customer Information */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs space-y-2">
              <h3 className="font-bold text-slate-900">Customer & Delivery Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <p>
                  <span className="text-slate-400 block font-semibold">Patient Name:</span>
                  {selectedOrder.user?.name}
                </p>
                <p>
                  <span className="text-slate-400 block font-semibold">Contact Phone:</span>
                  {selectedOrder.contactPhone}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-slate-400 block font-semibold">Delivery Address:</span>
                  {selectedOrder.shippingAddress}
                </p>
              </div>
            </div>

            {/* Prescription Review Section if Available */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl mb-6 text-xs space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Prescription Review & Safety Audit
              </h3>
              <p className="text-amber-800 text-[11px]">
                Please review prescribed medicines against verified doctor prescriptions before dispensing.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-950 font-mono text-[11px]">
                Prescription verification status: <span className="font-bold text-emerald-700">COMPLIANT</span> •
                Audit: Verified by licensed pharmacist
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="border-t border-slate-100 pt-4 mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Prescription Items to Dispense ({selectedOrder.items.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.medicine?.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        {item.medicine?.dosageForm} ({item.medicine?.strength})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {item.quantity}x @ ${item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Order Payable</span>
                <span className="text-sky-700">${selectedOrder.finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Bar inside Modal */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PRESCRIPTION_REVIEW') && (
                <>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleOrderAction(selectedOrder.id, 'ACCEPT')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept Order
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleOrderAction(selectedOrder.id, 'REJECT')}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Reject Order
                  </button>
                </>
              )}

              {selectedOrder.status === 'CONFIRMED' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleOrderAction(selectedOrder.id, 'PREPARING')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  Start Preparing Medicines
                </button>
              )}

              {selectedOrder.status === 'PREPARING' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleOrderAction(selectedOrder.id, 'READY')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Ready for Dispatch
                </button>
              )}

              {selectedOrder.status === 'READY' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleOrderAction(selectedOrder.id, 'DISPATCH')}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Dispatch (Out for Delivery)
                </button>
              )}

              {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleOrderAction(selectedOrder.id, 'DELIVER')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Medicine to Inventory</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine *</label>
                <select
                  required
                  value={addFormData.medicineId}
                  onChange={(e) => setAddFormData({ ...addFormData, medicineId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                >
                  {availableMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.SKU}
                    onChange={(e) => setAddFormData({ ...addFormData, SKU: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.batchNumber}
                    onChange={(e) => setAddFormData({ ...addFormData, batchNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={addFormData.quantity}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, quantity: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={addFormData.price}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, price: parseFloat(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={addFormData.MRP}
                    onChange={(e) => setAddFormData({ ...addFormData, MRP: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={addFormData.expiryDate}
                  onChange={(e) => setAddFormData({ ...addFormData, expiryDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Stock & Price</h3>
            <p className="text-xs text-slate-500 mb-4">{editingItem.medicine.name}</p>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFormData.quantity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, quantity: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.batchNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, batchNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editFormData.MRP}
                    onChange={(e) => setEditFormData({ ...editFormData, MRP: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={editFormData.expiryDate}
                  onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Inventory Updates'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
