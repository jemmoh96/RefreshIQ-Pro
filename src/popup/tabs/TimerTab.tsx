import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Calendar } from 'lucide-react';
import Toggle from '../components/Toggle';
import { DAYS_OF_WEEK, COMMON_TIMEZONES } from '../../shared/constants';
import { cn } from '../../shared/utils';
import type { ScheduleConfig } from '../../shared/types';
import { generateId } from '../../shared/utils';

const DEFAULT_SCHEDULE: ScheduleConfig = {
  id:          '',
  label:       'My Schedule',
  startTime:   '08:00',
  stopTime:    '18:00',
  timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  days:        [1, 2, 3, 4, 5],
  active:      false,
  targetTabId: null,
};

export default function TimerTab() {
  const [schedule, setSchedule] = useState<ScheduleConfig>({ ...DEFAULT_SCHEDULE, id: generateId() });
  const [durationMode, setDurationMode] = useState(false);
  const [duration, setDuration]         = useState('3');

  const patch = (p: Partial<ScheduleConfig>) => setSchedule((s) => ({ ...s, ...p }));

  const toggleDay = (day: number) => {
    const days = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day].sort();
    patch({ days });
  };

  const handleStart = async () => {
    patch({ active: true });
    try {
      const { storage } = await import('../../shared/storage');
      const existing = (await storage.getSchedules()) ?? [];
      await storage.setSchedules([...existing.filter((s) => s.id !== schedule.id), schedule]);
    } catch {
      console.warn('[RefreshIQ] Storage not available in dev mode');
    }
  };

  const handleStop = async () => {
    patch({ active: false });
    try {
      const { storage } = await import('../../shared/storage');
      const existing = (await storage.getSchedules()) ?? [];
      await storage.setSchedules(existing.filter((s) => s.id !== schedule.id));
    } catch {}
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Schedule label */}
      <div>
        <p className="section-label mb-2">Schedule Name</p>
        <input
          type="text"
          value={schedule.label}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder="My Schedule"
          className="glass-input w-full px-3 py-2 text-sm"
        />
      </div>

      {/* Duration vs window toggle */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-riq-text">Duration Mode</p>
            <p className="text-2xs text-riq-muted">Run for X hours instead of time window</p>
          </div>
          <Toggle checked={durationMode} onChange={setDurationMode} size="sm" />
        </div>

        {durationMode ? (
          <div>
            <label className="text-xs text-riq-muted block mb-1">Run for (hours)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="glass-input w-24 px-3 py-2 text-sm"
              />
              <div className="flex gap-1.5">
                {['1','2','3','6','12','24'].map((h) => (
                  <button key={h} onClick={() => setDuration(h)} className={cn('preset-chip', duration === h && 'active')}>{h}h</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-riq-muted block mb-1">Start Time</label>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => patch({ startTime: e.target.value })}
                className="glass-input w-full px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-riq-muted block mb-1">Stop Time</label>
              <input
                type="time"
                value={schedule.stopTime}
                onChange={(e) => patch({ stopTime: e.target.value })}
                className="glass-input w-full px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Day picker */}
      <div>
        <p className="section-label mb-2">Active Days</p>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map(({ label, value, full }) => (
            <button
              key={value}
              onClick={() => toggleDay(value)}
              title={full}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150',
                schedule.days.includes(value)
                  ? 'bg-riq-green/15 border-riq-green text-riq-green'
                  : 'bg-riq-elevated border-riq-border text-riq-muted hover:border-riq-border-light',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-2xs text-riq-muted mt-1.5">
          {schedule.days.length === 0
            ? 'No days selected'
            : schedule.days.length === 7
            ? 'Every day'
            : `${schedule.days.length} day${schedule.days.length > 1 ? 's' : ''} selected`}
        </p>
      </div>

      {/* Timezone */}
      <div>
        <p className="section-label mb-2">Timezone</p>
        <select
          value={schedule.timezone}
          onChange={(e) => patch({ timezone: e.target.value })}
          className="glass-input w-full px-3 py-2 text-sm appearance-none cursor-pointer"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-riq-surface">{tz}</option>
          ))}
        </select>
      </div>

      {/* Summary card */}
      <div className="glass-card p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={13} className="text-riq-green" />
          <span className="text-xs font-semibold text-riq-text">Schedule Summary</span>
        </div>
        {[
          ['Window',   durationMode ? `${duration}h duration` : `${schedule.startTime} → ${schedule.stopTime}`],
          ['Days',     schedule.days.length === 7 ? 'Every day' : schedule.days.map((d) => DAYS_OF_WEEK[d].label).join(', ') || 'None'],
          ['Timezone', schedule.timezone],
          ['Status',   schedule.active ? 'Active' : 'Inactive'],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs">
            <span className="text-riq-muted">{l}</span>
            <span className="text-riq-text font-mono font-medium">{v}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleStart}
          disabled={schedule.active || schedule.days.length === 0}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all',
            schedule.active ? 'bg-riq-green/20 text-riq-green border border-riq-green/30' : 'btn-primary',
            'disabled:opacity-50',
          )}
        >
          <Play size={14} />
          {schedule.active ? 'Scheduled' : 'Schedule'}
        </button>
        <button
          onClick={handleStop}
          disabled={!schedule.active}
          className="flex items-center justify-center gap-2 py-3 rounded-lg btn-danger text-sm font-medium disabled:opacity-40"
        >
          <Square size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}
