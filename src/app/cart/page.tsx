'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Building2,
  ShieldCheck,
  AlertCircle,
  Lock,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, totalAmount, loading, updateQuantity, removeFromCart, clearCart } =
    useCart();

  if (loading) {
    return <LoadingState message="Loading your medical shopping cart..." fullPage />;
  }

  const estimatedTax = Math.round(totalAmount * 0.05 * 100) / 100;
  const finalTotal = Math.round((totalAmount + estimatedTax) * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-block mb-1">
              Prescription & Medicine Cart
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Medical Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Explore our pharmaceutical catalog or scan a prescription to add medicine items."
            actionLabel="Browse Medicine Catalog"
            onAction={() => router.push('/medicines')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs hover-card-elevation transition-all ${
                    !item.isAvailable ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{item.medicine?.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.medicine?.dosageForm} ({item.medicine?.strength})
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Fulfilling Pharmacy: <span className="font-bold text-slate-800">{item.pharmacy?.name}</span>
                      </p>

                      {!item.isAvailable && (
                        <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {item.isExpired ? 'Inventory Expired' : 'Out of Stock'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-extrabold text-xs text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-base font-black text-slate-900 block">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">${item.unitPrice.toFixed(2)}/ea</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/medicines"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping Medicines
                </Link>
              </div>
            </div>

            {/* Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Medicines Subtotal</span>
                    <span className="font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Healthcare Tax (5%)</span>
                    <span className="font-bold text-slate-900">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Standard Doorstep Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between text-sm">
                    <span className="font-extrabold text-slate-900">Total</span>
                    <span className="text-xl font-black text-slate-900">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>256-bit Encrypted Transaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
