import React, { ReactNode } from 'react';
import { MasteryLevel } from '../../types';

export interface BadgeProps {
  variant: MasteryLevel | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'md',
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses: Record<BadgeProps['variant'], string> = {
    mastered: 'bg-emerald-50 text-emerald-700',
    success: 'bg-emerald-50 text-emerald-700',
    proficient: 'bg-indigo-50 text-indigo-700',
    info: 'bg-indigo-50 text-indigo-700',
    developing: 'bg-amber-50 text-amber-700',
    novice: 'bg-slate-100 text-slate-600',
    'needs-attention': 'bg-red-50 text-red-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};
