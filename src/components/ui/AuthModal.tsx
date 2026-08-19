'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lock, UserCheck, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Sign In Required',
  message = 'Please sign in or create an account to access this healthcare service and manage your cart.',
  onSuccess,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);

  if (!isOpen) return null;

  const currentUrl = `${pathname}${searchParams ? '?' + searchParams.toString() : ''}`;

  const handleQuickDemoLogin = async () => {
    setIsLoggingInDemo(true);
    try {
      const success = await login('patient@medcentre.com', 'Password123!');
      if (success) {
        showToast('Signed in as demo patient!', 'success');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      showToast('Demo login failed', 'error');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  const handleGoToLogin = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Secure MedCentre Session
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Quick Demo Login (1-Click) */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoggingInDemo}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm hover:from-sky-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            {isLoggingInDemo ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            {isLoggingInDemo ? 'Signing in...' : '1-Click Sign In (Demo Patient)'}
          </button>

          {/* Standard Login & Register */}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            Sign In with Email & Password
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose();
                router.push('/register');
              }}
              className="font-bold text-sky-600 hover:text-sky-800 underline underline-offset-2"
            >
              Create Free Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
