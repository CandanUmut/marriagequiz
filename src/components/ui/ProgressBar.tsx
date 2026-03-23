'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const heightStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  color = 'bg-primary-500',
  height = 'md',
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm text-sand-600 dark:text-sand-400">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-sand-700 dark:text-sand-300">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightStyles[height]} bg-sand-200 dark:bg-sand-800 rounded-full overflow-hidden`}
      >
        <motion.div
          className={`${heightStyles[height]} rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
