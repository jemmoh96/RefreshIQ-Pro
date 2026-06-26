import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCountdown } from '../../shared/utils';
import { cn } from '../../shared/utils';

interface Props {
  totalMs:    number;   // total interval in ms
  remainingMs: number;  // remaining ms until refresh
  status:     'idle' | 'running' | 'paused' | 'error';
  size?:      number;
}

const STROKE  = 6;
const GAP     = 4;

export default function CountdownRing({ totalMs, remainingMs, status, size = 140 }: Props) {
  const radius = (size - STROKE * 2 - GAP * 2) / 2;
  const cx     = size / 2;
  const cy     = size / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMemo(() => {
    if (status !== 'running' || totalMs <= 0) return 0;
    return Math.max(0, Math.min(1, remainingMs / totalMs));
  }, [remainingMs, totalMs, status]);

  const dashOffset  = circumference * (1 - progress);
  const isUrgent    = remainingMs < 5000 && status === 'running';
  const displayTime = status === 'idle' || status === 'error'
    ? '00:00'
    : formatCountdown(remainingMs);

  const ringColor = {
    idle:    '#252d4a',
    running: isUrgent ? '#f59e0b' : '#22c55e',
    paused:  '#f59e0b',
    error:   '#ef4444',
  }[status];

  const glowColor = {
    idle:    'none',
    running: isUrgent
      ? 'drop-shadow(0 0 6px rgba(245,158,11,0.8))'
      : 'drop-shadow(0 0 6px rgba(34,197,94,0.6))',
    paused:  'drop-shadow(0 0 6px rgba(245,158,11,0.5))',
    error:   'drop-shadow(0 0 6px rgba(239,68,68,0.6))',
  }[status];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#1a2038"
            strokeWidth={STROKE}
          />
          {/* Progress ring */}
          <motion.circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: dashOffset,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: glowColor,
              transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease',
            }}
          />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360 - 90;
            const rad   = (angle * Math.PI) / 180;
            const inner = radius - 10;
            const outer = radius - 5;
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * inner}
                y1={cy + Math.sin(rad) * inner}
                x2={cx + Math.cos(rad) * outer}
                y2={cy + Math.sin(rad) * outer}
                stroke="#252d4a"
                strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {status === 'idle' ? (
            <>
              <span className="text-2xs font-medium text-riq-muted uppercase tracking-widest mb-1">
                Ready
              </span>
              <span className="font-mono text-lg font-bold text-riq-muted/50">
                00:00
              </span>
            </>
          ) : (
            <>
              <span className="text-2xs font-medium uppercase tracking-widest mb-0.5" style={{ color: ringColor }}>
                {status === 'paused' ? 'PAUSED' : status === 'error' ? 'ERROR' : 'NEXT'}
              </span>
              <motion.span
                key={displayTime}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1,   opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-2xl font-bold"
                style={{ color: ringColor }}
              >
                {displayTime}
              </motion.span>
              {status === 'running' && (
                <span className="text-2xs text-riq-muted mt-0.5">refresh</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
