import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald-600',
    error: 'bg-rose-50 border-rose-200 text-rose-900 icon-rose-600',
    info: 'bg-sky-50 border-sky-200 text-sky-900 icon-sky-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 icon-amber-600',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform animate-in slide-in-from-top-2 max-w-md w-full bg-white ${styles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{toast.title}</h4>
        {toast.description && <p className="text-xs mt-1 text-slate-600">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
