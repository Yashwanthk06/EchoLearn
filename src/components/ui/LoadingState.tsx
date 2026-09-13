import React from 'react';

export interface LoadingStateProps {
  variant: 'card' | 'list' | 'text';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ variant, count = 3 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] h-48 animate-pulse flex flex-col gap-4">
             <div className="h-6 bg-slate-200 rounded w-2/3"></div>
             <div className="h-4 bg-slate-200 rounded w-1/2"></div>
             <div className="mt-auto h-10 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {items.map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  // text
  return (
    <div className="flex flex-col gap-2 w-full">
      {items.map((i) => (
        <div 
          key={i} 
          className="h-4 bg-slate-200 rounded animate-pulse"
          style={{ width: `${Math.max(40, 100 - (i % 3) * 15)}%` }}
        ></div>
      ))}
    </div>
  );
};
