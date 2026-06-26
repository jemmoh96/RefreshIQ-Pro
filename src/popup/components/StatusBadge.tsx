import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

type Status = 'idle' | 'running' | 'paused' | 'matched' | 'watching' | 'error';

const META: Record<Status, { label: string; dot: string; text: string }> = {
  idle:     { label: 'Idle',     dot: 'bg-riq-muted/40', text: 'text-riq-muted' },
  running:  { label: 'Running',  dot: 'bg-riq-green animate-pulse', text: 'text-riq-green' },
  paused:   { label: 'Paused',   dot: 'bg-riq-amber', text: 'text-riq-amber' },
  watching: { label: 'Watching', dot: 'bg-riq-blue animate-pulse', text: 'text-riq-blue' },
  matched:  { label: 'Match!',   dot: 'bg-riq-green animate-ping-once', text: 'text-riq-green' },
  error:    { label: 'Error',    dot: 'bg-riq-red', text: 'text-riq-red' },
};

interface Props {
  status: Status;
  compact?: boolean;
}

export default function StatusBadge({ status, compact }: Props) {
  const { label, dot, text } = META[status] ?? META.idle;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      className={cn(
        'flex items-center gap-1.5',
        compact
          ? 'px-1.5 py-0.5 rounded bg-riq-elevated border border-riq-border'
          : 'px-2 py-1 rounded-full bg-riq-elevated border border-riq-border',
      )}
    >
      <div className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {!compact && (
        <span className={cn('text-xs font-medium', text)}>{label}</span>
      )}
    </motion.div>
  );
}
