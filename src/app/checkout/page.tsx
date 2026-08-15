'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Package,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, totalAmount, loading: cartLoading, refreshCart } = useCart();
  const { showToast } = useToast();

  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Sector 4, Springfield');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+1 555-0199');
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CARD' | 'UPI'>('CASH_ON_DELIVERY');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user]);

  if (cartLoading) {
    return <LoadingState message="Preparing checkout..." fullPage />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <EmptyState
            title="Your Cart is Empty"
            description="Add medicines to your cart before proceeding to checkout."
            actionLabel="Browse Medicines"
            onAction={() => router.push('/medicines')}
          />
        </div>
      </div>
    );
  }

  const estimatedTax = Math.round(totalAmount * 0.05 * 100) / 100;
  const finalTotal = Math.round((totalAmount + estimatedTax) * 100) / 100;
  const pharmacyName = items[0]?.pharmacy?.name || 'Local Partner Pharmacy';

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          contactPhone,
          deliveryType,
          paymentMethod,
          customerNotes,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setCheckoutError(json.error?.message || 'Checkout failed');
        showToast(json.error?.message || 'Order failed', 'error');
        setIsSubmitting(false);
      } else {
        showToast('Order placed successfully! Redirecting to tracking...', 'success');
        await refreshCart();
        router.push(`/orders/${json.data.order.id}`);
      }
    } catch (e) {
      setCheckoutError('Network error processing checkout.');
      showToast('Network error during checkout', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Back Navigation */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols) — 4-Step Checkout Accordion Cards */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-block mb-1">
                Secure Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Review & Confirm Prescription Order
              </h1>
            </div>

            {checkoutError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* STEP 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  01
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Delivery Address & Contact</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium bg-slate-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recipient Phone</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Special Delivery Notes (Optional)</label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Ring buzzer 402, leave at front desk"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium bg-slate-50 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Delivery Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  02
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Fulfillment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('DELIVERY')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    deliveryType === 'DELIVERY'
                      ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Truck className="w-5 h-5 text-sky-600 mb-2" />
                    {deliveryType === 'DELIVERY' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Doorstep Delivery</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Estimated 25–40 min courier fulfillment</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    deliveryType === 'PICKUP'
                      ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-5 h-5 text-amber-600 mb-2" />
                    {deliveryType === 'PICKUP' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">In-Store Pharmacy Pickup</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ready for pickup in 15 minutes at {pharmacyName}</p>
                </button>
              </div>
            </div>

            {/* STEP 3: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  03
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Payment Option</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-500">Pay upon receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Credit / Debit Card</span>
                  <span className="text-[10px] text-slate-500">Visa, MC, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Direct UPI</span>
                  <span className="text-[10px] text-slate-500">Instant transfer</span>
                </button>
              </div>
            </div>

            {/* STEP 4: Items in Order */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  04
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Medicines in this Order ({itemCount})</h2>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{item.medicine?.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Qty: {item.quantity} • Fulfilling: {item.pharmacy?.name}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) — Order Total & Submit Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Payment Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Medicines Subtotal</span>
                  <span className="font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%)</span>
                  <span className="font-bold text-slate-900">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-900">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Placing Transactional Order...' : `Confirm & Place Order ($${finalTotal.toFixed(2)})`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted Transactional Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
