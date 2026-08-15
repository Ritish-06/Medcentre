'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, Activity, Heart, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide on auth screens
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md pt-14 pb-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-200/80">
          {/* Brand Col (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                M
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 leading-none block">MedCentre</span>
                <span className="text-[10px] text-sky-600 font-semibold tracking-wider uppercase">Connected Healthcare</span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              An intelligent, unified healthcare technology platform connecting patients with verified pharmacies, digital prescriptions, specialist physicians, and secure health records.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                HIPAA & ISO 27001 Certified
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5 text-sky-600" />
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/medicines" className="hover:text-sky-600 transition-colors">
                  Medicine Catalog
                </Link>
              </li>
              <li>
                <Link href="/prescriptions/scan" className="hover:text-sky-600 transition-colors">
                  Prescription Scanner
                </Link>
              </li>
              <li>
                <Link href="/pharmacy/availability" className="hover:text-sky-600 transition-colors">
                  Pharmacy Availability
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-sky-600 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-sky-600 transition-colors">
                  Appointments
                </Link>
              </li>
            </ul>
          </div>

          {/* Health Vault & Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Health Tools</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/health-records" className="hover:text-sky-600 transition-colors">
                  Health Records Vault
                </Link>
              </li>
              <li>
                <Link href="/reminders" className="hover:text-sky-600 transition-colors">
                  Dose Reminders
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-sky-600 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-sky-600 transition-colors">
                  Medical Cart
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-600 transition-colors">
                  Patient Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Support & Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Clinical Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-900">24/7 Helpline: 1800-MED-CARE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>support@medcentre.com</span>
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>742 Evergreen Medical Blvd, District 4</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 MedCentre Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              All Systems Operational
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Built for Patients & Providers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
