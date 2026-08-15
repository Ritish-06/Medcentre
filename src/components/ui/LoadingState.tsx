import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading MedCentre records...',
  className = '',
  fullPage = false,
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-600 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return content;
};
