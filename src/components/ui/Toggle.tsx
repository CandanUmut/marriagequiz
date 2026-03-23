'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const dimensions = size === 'sm' ? { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 16 } : { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        className={`${dimensions.track} rounded-full relative transition-colors duration-200 ${
          checked
            ? 'bg-primary-600'
            : 'bg-sand-300 dark:bg-sand-600'
        }`}
      >
        <motion.div
          className={`${dimensions.thumb} rounded-full bg-white shadow-sm absolute top-0.5 left-0.5`}
          animate={{ x: checked ? dimensions.translate : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      {label && (
        <span className="text-sm text-sand-700 dark:text-sand-300">{label}</span>
      )}
    </button>
  );
}
