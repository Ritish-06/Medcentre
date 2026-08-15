'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-rose-200 shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
        <p className="text-sm text-slate-600 mb-6">
          You do not have permission to view this section with your role ({user?.role || 'Guest'}).
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login / Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
}
