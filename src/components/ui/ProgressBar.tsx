import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  color,
  showLabel = false,
  className = '',
}) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  let fillColor = color;
  if (!fillColor) {
    if (safeValue >= 70) fillColor = 'bg-emerald-500';
    else if (safeValue >= 40) fillColor = 'bg-amber-500';
    else fillColor = 'bg-red-500';
  } else if (!fillColor.startsWith('bg-')) {
    fillColor = `bg-[${fillColor}]`; // fallback if they pass a hex
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${fillColor.startsWith('bg-') ? fillColor : ''}`}
          style={{ backgroundColor: fillColor.startsWith('bg-') ? undefined : fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-slate-600 min-w-[3ch]">{Math.round(safeValue)}%</span>
      )}
    </div>
  );
};
