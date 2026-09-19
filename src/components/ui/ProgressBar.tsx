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

  /*
   * Determine fill style.
   *
   * If a custom color is passed, use it.
   * Otherwise, use a gradient matched to the score range.
   */
  let fillStyle: React.CSSProperties;
  let fillClass = '';

  if (color) {
    /* Caller supplied an explicit color */
    if (color.startsWith('bg-')) {
      fillClass = color;
      fillStyle = {};
    } else {
      fillStyle = { background: color };
    }
  } else if (safeValue >= 75) {
    fillStyle = {
      background: 'linear-gradient(90deg, #10B981, #06D6A0)',
    };
  } else if (safeValue >= 45) {
    fillStyle = {
      background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
    };
  } else {
    fillStyle = {
      background: 'linear-gradient(90deg, #EF4444, #F87171)',
    };
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <motion.div
          className={`h-full rounded-full ${fillClass}`}
          style={fillStyle}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-slate-600 min-w-[3ch]">
          {Math.round(safeValue)}%
        </span>
      )}
    </div>
  );
};
