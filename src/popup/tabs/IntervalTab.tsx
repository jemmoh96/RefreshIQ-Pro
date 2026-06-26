import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCw, ChevronDown, ChevronUp, Shuffle, CalendarDays, Clock } from 'lucide-react';
import CountdownRing from '../components/CountdownRing';
import Toggle from '../components/Toggle';
import { useRefreshStore } from '../../store/refreshStore';
import { REFRESH_PRESETS } from '../../shared/constants';
import { cn, formatDuration } from '../../shared/utils';
import type { RefreshMode } from '../../shared/types';

const MODE_OPTIONS: Array<{ id: RefreshMode; label: string; icon: React.ElementType }> = [
  { id: 'fixed',     label: 'Fixed',    icon: Clock },
  { id: 'random',    label: 'Random',   icon: Shuffle },
  { id: 'scheduled', label: 'Schedule', icon: CalendarDays },
];

export default function IntervalTab() {
  const status         = useRefreshStore((s) => s.status);
  const refreshCount   = useRefreshStore((s) => s.refreshCount);
  const nextRefreshAt  = useRefreshStore((s) => s.nextRefreshAt);
  const config         = useRefreshStore((s) => s.config);
  const setConfig      = useRefreshStore((s) => s.setConfig);
  const startRefresh   = useRefreshStore((s) => s.startRefresh);
  const stopRefresh    = useRefreshStore((s) => s.stopRefresh);
  const pauseRefresh   = useRefreshStore((s) => s.pauseRefresh);
  const restartRefresh = useRefreshStore((s) => s.restartRefresh);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [remainingMs, setRemainingMs]   = useState(0);
  const [customSec, setCustomSec]       = useState('');
  const tickRef = useRef<number>();

  useEffect(() => {
    if (status !== 'running' || !nextRefreshAt) {
      setRemainingMs(0);
      return;
    }
    const tick = () => setRemainingMs(Math.max(0, nextRefreshAt - Date.now()));
    tick();
    tickRef.current = window.setInterval(tick, 250);
    return () => clearInterval(tickRef.current);
  }, [status, nextRefreshAt]);

  const totalMs  = config.fixedInterval * 1000;
  const isActive = status === 'running' || status === 'paused';

  const applyCustom = () => {
    const n = parseInt(customSec, 10);
    if (!isNaN(n) && n >= 1) { setConfig({ fixedInterval: n }); setCustomSec(''); }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Mode pills */}
      <div>
        <p className="section-label mb-2">Refresh Mode</p>
        <div className="grid grid-cols-3 gap-1.5">
          {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setConfig({ mode: id })}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150',
                config.mode === id
                  ? 'bg-riq-green/10 border-riq-green text-riq-green shadow-glow-green'
                  : 'bg-riq-elevated border-riq-border text-riq-muted hover:border-riq-border-light hover:text-riq-text',
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Countdown ring */}
      <div className="flex justify-center py-1">
        <CountdownRing totalMs={totalMs} remainingMs={remainingMs} status={status} size={148} />
      </div>

      {/* Mode config */}
      <AnimatePresence mode="wait">
        {config.mode === 'fixed' && (
          <motion.div key="fixed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-3">
            <p className="section-label">Interval Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {REFRESH_PRESETS.map(({ label, value }) => (
                <button key={value} onClick={() => setConfig({ fixedInterval: value })} className={cn('preset-chip', config.fixedInterval === value && 'active')}>{label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="number" min={1} placeholder="Custom seconds…" value={customSec} onChange={(e) => setCustomSec(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyCustom()} className="glass-input flex-1 px-3 py-2 text-sm" />
              <button onClick={applyCustom} className="px-3 py-2 rounded bg-riq-elevated border border-riq-border text-xs text-riq-muted hover:text-riq-text transition-colors">Set</button>
            </div>
            <p className="text-2xs text-riq-muted">Current: <span className="text-riq-text font-mono">{formatDuration(config.fixedInterval)}</span></p>
          </motion.div>
        )}
        {config.mode === 'random' && (
          <motion.div key="random" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-3">
            <p className="section-label">Random Range</p>
            <div className="grid grid-cols-2 gap-3">
              {([['randomMin','Min (sec)'],['randomMax','Max (sec)']] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-riq-muted block mb-1">{label}</label>
                  <input type="number" min={1} value={config[key]} onChange={(e) => setConfig({ [key]: parseInt(e.target.value,10)||1 })} className="glass-input w-full px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <p className="text-2xs text-riq-muted">Range: <span className="text-riq-text font-mono">{formatDuration(config.randomMin)} – {formatDuration(config.randomMax)}</span></p>
          </motion.div>
        )}
        {config.mode === 'scheduled' && (
          <motion.div key="sched" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-3">
            <p className="section-label">Cron Expression</p>
            <input type="text" placeholder="*/30 * * * *" value={config.cronExpression} onChange={(e) => setConfig({ cronExpression: e.target.value })} className="glass-input w-full px-3 py-2 text-sm font-mono" />
            <div className="grid grid-cols-2 gap-1.5">
              {[['Every 5 min','*/5 * * * *'],['Every 30 min','*/30 * * * *'],['Hourly','0 * * * *'],['Daily 8AM','0 8 * * *']].map(([l,v]) => (
                <button key={v} onClick={() => setConfig({ cronExpression: v })} className={cn('preset-chip text-center', config.cronExpression === v && 'active')}>{l}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced toggle */}
      <div className="glass-card overflow-hidden">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-riq-muted hover:text-riq-text transition-colors">
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden border-t border-riq-border">
              <div className="p-3 space-y-3">
                {([['hardRefresh','Hard Refresh','Clear cache on each load'],['cacheBypass','Bypass Cache','Append cache-bust param'],['stopOnActivity','Stop on User Activity','Pause when mouse/keyboard used']] as const).map(([k,l,d]) => (
                  <div key={k} className="flex items-center justify-between">
                    <div><p className="text-xs font-medium text-riq-text">{l}</p><p className="text-2xs text-riq-muted">{d}</p></div>
                    <Toggle checked={config[k as 'hardRefresh'|'cacheBypass'|'stopOnActivity']} onChange={(v) => setConfig({ [k]: v })} size="sm" color="amber" />
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-medium text-riq-text">Stop after N refreshes</p><p className="text-2xs text-riq-muted">0 = unlimited</p></div>
                  <input type="number" min={0} value={config.maxRefreshes ?? 0} onChange={(e) => setConfig({ maxRefreshes: parseInt(e.target.value,10)||null })} className="glass-input w-16 px-2 py-1 text-sm text-center" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={startRefresh} disabled={status === 'running'} className={cn('col-span-2 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all', status==='running'?'bg-riq-green/20 text-riq-green border border-riq-green/30':'btn-primary')}>
          <Play size={14} className={status==='running'?'animate-pulse':''} />
          {status === 'running' ? 'Running…' : 'Start'}
        </button>
        <button onClick={status==='paused'?startRefresh:pauseRefresh} disabled={status==='idle'||status==='error'} className="flex items-center justify-center gap-1 py-3 rounded-lg btn-ghost text-sm font-medium disabled:opacity-40">
          <Pause size={13}/>{status==='paused'?'Resume':'Pause'}
        </button>
        <button onClick={stopRefresh} disabled={status==='idle'} className="flex items-center justify-center py-3 rounded-lg btn-danger text-sm font-medium disabled:opacity-40">
          <Square size={13}/>
        </button>
      </div>

      {isActive && (
        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} onClick={restartRefresh} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg btn-ghost text-xs text-riq-muted">
          <RotateCw size={11}/> Restart with current settings
        </motion.button>
      )}

      {status !== 'idle' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="grid grid-cols-3 gap-2">
          {[['Refreshes', String(refreshCount)], ['Mode', config.mode.charAt(0).toUpperCase()+config.mode.slice(1)], ['Interval', formatDuration(config.fixedInterval)]].map(([l,v]) => (
            <div key={l} className="glass-card px-2 py-2 text-center">
              <p className="font-mono text-sm font-bold text-riq-text">{v}</p>
              <p className="text-2xs text-riq-muted mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
