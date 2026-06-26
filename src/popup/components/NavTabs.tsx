import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Clock, LayoutGrid, Activity } from 'lucide-react';
import type { TabId } from '../App';
import { cn } from '../../shared/utils';
import { useMonitorStore } from '../../store/monitorStore';
import { useRefreshStore } from '../../store/refreshStore';

interface Props {
  active:   TabId;
  onChange: (id: TabId) => void;
}

const TABS: Array<{ id: TabId; label: string; Icon: React.ElementType }> = [
  { id: 'interval', label: 'Interval', Icon: Timer },
  { id: 'timer',    label: 'Timer',    Icon: Clock },
  { id: 'tabs',     label: 'Tabs',     Icon: LayoutGrid },
  { id: 'monitor',  label: 'Monitor',  Icon: Activity },
];

export default function NavTabs({ active, onChange }: Props) {
  const refreshStatus  = useRefreshStore((s) => s.status);
  const monitorRules   = useMonitorStore((s) => s.rules);
  const activeMonitors = monitorRules.filter((r) => r.active).length;

  const badges: Partial<Record<TabId, number | string>> = {};
  if (refreshStatus === 'running') badges.interval = '●';
  if (activeMonitors > 0)         badges.monitor   = activeMonitors;

  return (
    <nav className="relative flex border-b border-riq-border mx-4 mb-1">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const badge    = badges[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'tab-btn relative flex items-center justify-center gap-1.5',
              isActive && 'active',
            )}
            aria-selected={isActive}
            role="tab"
          >
            <Icon size={12} />
            <span>{label}</span>
            {badge !== undefined && (
              <span
                className={cn(
                  'absolute -top-0.5 right-1 text-2xs font-bold leading-none',
                  badge === '●'
                    ? 'text-riq-green animate-pulse-glow'
                    : 'bg-riq-green text-riq-bg px-1 py-0.5 rounded-full text-[9px]',
                )}
              >
                {badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-riq-green rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
