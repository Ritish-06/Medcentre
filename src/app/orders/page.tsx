'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Package,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  ShoppingBag,
  Activity,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  finalAmount: number;
  deliveryType: string;
  shippingAddress: string;
  createdAt: string;
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
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
    };
  }[];
  payment?: {
    paymentMethod: string;
    paymentStatus: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data.orders || []);
        }
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your orders history..." fullPage />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            Out for Delivery
          </span>
        );
      case 'PREPARING':
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            {status}
          </span>
        );
      case 'PRESCRIPTION_REVIEW':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Reviewing Rx
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block">
              Fulfillment History
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              My Orders & Prescription Deliveries
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-xl">
              Track live delivery progress, check fulfilling pharmacy details, and review order receipts.
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center self-start sm:self-auto shrink-0">
            <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-white">{orders.length}</span>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You haven’t placed any medicine orders yet. Explore our catalog or upload a prescription."
            actionLabel="Browse Medicine Catalog"
            onAction={() => router.push('/medicines')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover-card-elevation flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-black text-slate-900">#{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Fulfilling Pharmacy: <span className="font-bold text-slate-800">{order.pharmacy.name}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-900">{order.items.length} item(s):</span>
                    {order.items.map((item, i) => (
                      <span key={item.id} className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {item.medicine.name} (x{item.quantity})
                        {i < order.items.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                    <span className="text-xl font-black text-slate-900">${order.finalAmount.toFixed(2)}</span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Activity className="w-4 h-4 text-sky-400" />
                    Track Order
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
