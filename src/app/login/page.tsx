'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, UserCheck, ShieldCheck, Stethoscope, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleQuickLogin = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Sign in to MedCentre</h2>
          <p className="mt-2 text-sm text-slate-500">Access your role-based healthcare portal</p>
        </div>

        {/* Quick Test Login Shortcuts */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('patient@medcentre.com')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-sky-500 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('doctor@medcentre.com')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-sky-500 transition-colors shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pharmacy@medcentre.com')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-sky-500 transition-colors shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Pharmacy
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@medcentre.com')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-sky-500 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Admin
            </button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@medcentre.com"
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
