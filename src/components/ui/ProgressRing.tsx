import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientId?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  children?: ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color,
  gradientId,
  gradientFrom = '#6366F1',
  gradientTo = '#10B981',
  className = '',
  children,
}) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  let strokeValue = color;
  if (gradientId) {
    strokeValue = `url(#${gradientId})`;
  } else if (!strokeValue) {
    if (safeValue >= 70) strokeValue = '#10B981'; // emerald-500
    else if (safeValue >= 40) strokeValue = '#F59E0B'; // amber-500
    else strokeValue = '#EF4444'; // red-500
  }

  const effectiveGradientId = gradientId || `progress-ring-grad-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={effectiveGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradientId ? `url(#${effectiveGradientId})` : strokeValue}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center select-none">
          {children}
        </div>
      )}
    </div>
  );
};
