'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingCart,
  LogOut,
  Stethoscope,
  ShieldCheck,
  FileText,
  Pill,
  Calendar,
  Clock,
  Menu,
  X,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function HeaderNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide header on login/register pages to keep forms clean
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navLinks = [
    { href: '/medicines', label: 'Medicines', icon: Pill },
    { href: '/prescriptions/scan', label: 'Prescription Scanner', icon: FileText },
    { href: '/doctors', label: 'Find Doctors', icon: Stethoscope },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
    { href: '/health-records', label: 'Health Records', icon: ShieldCheck },
    { href: '/reminders', label: 'Reminders', icon: Clock },
    { href: '/orders', label: 'My Orders', icon: Package },
  ];

  const dashboardHref =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'DOCTOR'
      ? '/doctor/dashboard'
      : user?.role === 'PHARMACY'
      ? '/pharmacy/dashboard'
      : '/dashboard';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              M
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 leading-none block">MedCentre</span>
              <span className="text-[10px] text-sky-600 font-semibold tracking-wider uppercase">Healthcare Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Account State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Shopping Cart Button */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account State */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold hover:bg-sky-100 max-w-[120px] sm:max-w-none truncate"
                title={`${user.name} (${user.role})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Sign Out"
                id="header-signout-button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition-colors shadow-sm shrink-0"
            >
              Sign In
            </Link>
          )}

          {/* Mobile / Tablet Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors ml-0.5"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {user && (
            <div className="px-3 py-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email} • <span className="font-semibold text-sky-600">{user.role}</span></p>
              </div>
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Console
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    isActive ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
