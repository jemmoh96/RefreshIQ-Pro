import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

interface Props {
  checked:   boolean;
  onChange:  (v: boolean) => void;
  label?:    string;
  size?:     'sm' | 'md';
  color?:    'green' | 'amber';
  disabled?: boolean;
  className?: string;
}

export default function Toggle({
  checked, onChange, label, size = 'md', color = 'amber', disabled = false, className,
}: Props) {
  const trackW = size === 'sm' ? 28 : 36;
  const trackH = size === 'sm' ? 16 : 20;
  const knobS  = size === 'sm' ? 11 : 14;
  const knobX  = checked ? trackW - knobS - 3 : 3;

  const trackBg = checked
    ? color === 'green' ? '#22c55e' : '#f59e0b'
    : '#252d4a';

  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        style={{ width: trackW, height: trackH, backgroundColor: trackBg }}
        className="relative rounded-full transition-colors duration-200 cursor-pointer shrink-0"
      >
        {checked && color === 'green' && (
          <div className="absolute inset-0 rounded-full shadow-glow-green opacity-50" />
        )}
        <motion.div
          animate={{ x: knobX }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ width: knobS, height: knobS, top: (trackH - knobS) / 2 }}
          className="absolute bg-white rounded-full shadow-sm"
        />
      </div>
      {label && (
        <span className="text-sm text-riq-muted">{label}</span>
      )}
    </label>
  );
}
