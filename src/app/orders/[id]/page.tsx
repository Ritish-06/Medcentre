'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Package,
  Building2,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Truck,
  ShieldCheck,
  FileText,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Activity,
  Ban,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  finalAmount: number;
  deliveryType: string;
  shippingAddress: string;
  contactPhone: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
    openingHours: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    medicine: {
      id: string;
      name: string;
      brandName: string;
      strength: string;
      dosageForm: string;
    };
  }[];
  payment?: {
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
  };
}

const TIMELINE_STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', description: 'Pharmacy accepted prescription order' },
  { key: 'PREPARING', label: 'Preparing Medicines', description: 'Pharmacist packaging certified batches' },
  { key: 'READY', label: 'Ready for Dispatch', description: 'Package inspected and sealed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Courier dispatched to address' },
  { key: 'DELIVERED', label: 'Delivered', description: 'Package safely delivered to recipient' },
];

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data.order);
      } else {
        setError(json.error?.message || 'Order not found');
      }
    } catch (e) {
      setError('Network error loading order tracking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });

      const json = await res.json();

      if (json.success) {
        showToast('Order cancelled successfully', 'info');
        setOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
        setShowCancelModal(false);
      } else {
        showToast(json.error?.message || 'Failed to cancel order', 'error');
      }
    } catch (e) {
      showToast('Network error while cancelling order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching live order tracking telemetry..." fullPage />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState title="Order Not Found" message={error || 'Order record could not be loaded.'} />
          <div className="mt-4 text-center">
            <Link href="/orders" className="text-xs font-bold text-sky-600 hover:text-sky-800">
              ← View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 0;
      case 'PREPARING':
        return 1;
      case 'READY':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders History
          </Link>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 shadow-xs transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel Order
            </button>
          )}
        </div>

        {/* Hero Order Status Banner */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 border border-white/20 inline-block mb-1">
              Live Order Telemetry
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                order.status === 'CANCELLED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
              }`}
            >
              {order.status === 'CANCELLED' ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
              )}
              {order.status.replace(/_/g, ' ')}
            </span>

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols) — Live Timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Fulfillment Timeline
              </h2>

              {order.status === 'PRESCRIPTION_REVIEW' ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Prescription Under Pharmacist Review
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The fulfilling pharmacy is verifying the prescription dosage against clinical inventory records. Fulfilling steps will begin once accepted.
                  </p>
                </div>
              ) : order.status === 'CANCELLED' ? (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Order Cancelled
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    This order was cancelled. Any debited amount will be refunded to your original payment method, and pharmacy inventory has been restored.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h3
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-sky-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p className="text-[11px] text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items in Order */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Medication Items ({order.items.length})
              </h2>

              <div className="space-y-2.5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{item.medicine.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {item.medicine.dosageForm} ({item.medicine.strength}) • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-black text-slate-900">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) — Pharmacy & Delivery Specs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pharmacy Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Fulfilling Partner Pharmacy
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-bold text-slate-900">{order.pharmacy.name}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{order.pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hours: {order.pharmacy.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Delivery Destination
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-600">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{order.shippingAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Recipient Phone: {order.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Payment Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount</span>
                  <span className="font-bold text-slate-900">${order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900">Total Paid</span>
                  <span className="font-black text-slate-900">${order.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Option Card (if cancellable) */}
            {canCancel && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-5 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Need to cancel this order?
                </div>
                <p className="text-rose-700 text-[11px] leading-relaxed">
                  You can cancel your order prior to courier dispatch. Pharmacy stock will be released back to inventory.
                </p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel Order #{order.orderNumber}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Cancel Order #{order.orderNumber}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to cancel this order? The pharmacy will be notified and reserved items will be released back into available inventory.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelOrder}
                  className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
