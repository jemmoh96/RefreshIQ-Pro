import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RefreshCw, Code2, Bell, BellOff, Settings2, Mail, Webhook,
  Zap, Eye, EyeOff, Monitor, ChevronDown, ChevronUp, Play,
  X, Plus, Trash2, HelpCircle, AlertTriangle, Sparkles,
  MousePointerClick, ScanText, FileCode2, Clock, Volume2,
  ArrowUp, Copy, Download, Upload, CheckCircle2, Info,
} from 'lucide-react';
import Toggle from '../components/Toggle';
import { cn } from '../../shared/utils';
import { useMonitorStore } from '../../store/monitorStore';
import { useRefreshStore } from '../../store/refreshStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type RefreshType   = 'full' | 'xhr';
type MonitorLevel  = 'basic' | 'advanced';
type AlertMode     = 'found' | 'lost' | 'custom';

interface SettingsState {
  monitorArea:         boolean;
  emailAlerts:         boolean;
  webhookAlerts:       boolean;
  realTimeDetection:   boolean;
  continueAfterAlert:  boolean;
  waitForContent:      boolean;
  highlightKeyword:    boolean;
  windowFocus:         boolean;
  autoClickTargets:    boolean;
  matchVisibleText:    boolean;
  matchHtmlSource:     boolean;
  caseSensitive:       boolean;
  soundOnMatch:        boolean;
  newTabOnMatch:       boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-6 z-50 w-52 p-3 rounded-lg text-xs text-riq-text leading-relaxed"
            style={{
              background: '#1a2038',
              border: '1px solid #303d66',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({
  label, icon, badge, open, onToggle,
}: {
  label: string; icon?: React.ReactNode; badge?: React.ReactNode;
  open: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between group"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-riq-muted">{icon}</span>}
        <span className="section-label">{label}</span>
        {badge}
      </div>
      <motion.div
        animate={{ rotate: open ? 0 : -90 }}
        transition={{ duration: 0.15 }}
        className="text-riq-muted/60 group-hover:text-riq-muted transition-colors"
      >
        <ChevronDown size={13} />
      </motion.div>
    </button>
  );
}

function SettingRow({
  icon, iconColor = 'text-riq-muted', iconBg = 'bg-riq-elevated',
  label, desc, actionBtn, helpText, checked, onToggle,
  toggleColor = 'amber', badge, disabled = false,
}: {
  icon: React.ReactNode; iconColor?: string; iconBg?: string;
  label: string; desc: string; actionBtn?: React.ReactNode;
  helpText?: string; checked: boolean; onToggle: (v: boolean) => void;
  toggleColor?: 'amber' | 'green'; badge?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-3 rounded-lg bg-riq-elevated border border-riq-border',
      disabled && 'opacity-50 pointer-events-none',
    )}>
      {/* Icon box */}
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      {/* Label + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-riq-text">{label}</span>
          {badge}
        </div>
        <p className="text-2xs text-riq-muted mt-0.5 leading-snug">{desc}</p>
      </div>
      {/* Action button */}
      {actionBtn && <div className="shrink-0">{actionBtn}</div>}
      {/* Help icon */}
      {helpText && (
        <Tooltip text={helpText}>
          <HelpCircle size={13} className="text-riq-muted/50 hover:text-riq-muted transition-colors" />
        </Tooltip>
      )}
      {/* Toggle */}
      <Toggle checked={checked} onChange={onToggle} size="sm" color={toggleColor} />
    </div>
  );
}

function KeywordChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.35)',
        color: '#22c55e',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-riq-green/20 transition-colors"
      >
        <X size={9} />
      </button>
    </motion.span>
  );
}

function Badge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'amber' | 'blue' | 'red' }) {
  const colors = {
    green: 'bg-riq-green/15 text-riq-green border-riq-green/30',
    amber: 'bg-riq-amber/15 text-riq-amber border-riq-amber/30',
    blue:  'bg-riq-blue/15 text-riq-blue border-riq-blue/30',
    red:   'bg-riq-red/15 text-riq-red border-riq-red/30',
  };
  return (
    <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded border', colors[variant])}>
      {text}
    </span>
  );
}

// ─── Template keyword sets ────────────────────────────────────────────────────
const KEYWORD_TEMPLATES = [
  {
    label: '🛒 In Stock',
    keywords: ['In Stock', 'Add to Cart', 'Add to Basket', 'Buy Now', 'Available'],
  },
  {
    label: '📅 Appointments',
    keywords: ['Book Now', 'Book Appointment', 'Available', 'Schedule', 'Open Slot'],
  },
  {
    label: '💼 Jobs',
    keywords: ['Apply Now', 'Apply Today', 'View Job', 'Open Position', 'Hiring'],
  },
  {
    label: '🎫 Tickets',
    keywords: ['Tickets Available', 'Buy Tickets', 'Get Tickets', 'On Sale'],
  },
  {
    label: '💰 Price Drop',
    keywords: ['Sale', 'Discount', 'Off', 'Deal', 'Clearance', 'Reduced'],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MonitorTab() {
  const startRefresh = useRefreshStore((s) => s.startRefresh);
  const stopRefresh  = useRefreshStore((s) => s.stopRefresh);
  const status       = useRefreshStore((s) => s.status);

  const [refreshType,   setRefreshType]   = useState<RefreshType>('full');
  const [monitorLevel,  setMonitorLevel]  = useState<MonitorLevel>('basic');
  const [alertMode,     setAlertMode]     = useState<AlertMode>('found');
  const [keywords,      setKeywords]      = useState<string[]>([]);
  const [inputVal,      setInputVal]      = useState('');
  const [showTip,       setShowTip]       = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [regexError,    setRegexError]    = useState('');
  const [copyDone,      setCopyDone]      = useState(false);
  const [showGoTop,     setShowGoTop]     = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Collapsible section states
  const [open, setOpen] = useState({
    monitoredArea:     true,
    alertSettings:     true,
    detectionBehavior: true,
    clickAutomation:   true,
    scanMethod:        true,
  });

  // All toggle settings
  const [s, setS] = useState<SettingsState>({
    monitorArea:        false,
    emailAlerts:        false,
    webhookAlerts:      true,
    realTimeDetection:  true,
    continueAfterAlert: true,
    waitForContent:     true,
    highlightKeyword:   true,
    windowFocus:        false,
    autoClickTargets:   false,
    matchVisibleText:   true,
    matchHtmlSource:    false,
    caseSensitive:      false,
    soundOnMatch:       false,
    newTabOnMatch:      false,
  });

  const toggleSection = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const patch = (key: keyof SettingsState, val: boolean) =>
    setS((prev) => ({ ...prev, [key]: val }));

  const isRunning = status === 'running';

  // Scroll listener for GO TOP button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setShowGoTop(el.scrollTop > 120);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  // Keyword management
  const addKeyword = useCallback(() => {
    const val = inputVal.trim();
    if (!val || keywords.includes(val)) return;
    // Validate regex if advanced mode
    if (monitorLevel === 'advanced') {
      try { new RegExp(val); setRegexError(''); }
      catch (e) { setRegexError('Invalid regex pattern'); return; }
    }
    setKeywords((k) => [...k, val]);
    setInputVal('');
    inputRef.current?.focus();
  }, [inputVal, keywords, monitorLevel]);

  const removeKeyword = (kw: string) =>
    setKeywords((k) => k.filter((x) => x !== kw));

  const clearAll = () => setKeywords([]);

  const addDefaults = () => {
    const defaults = ['In Stock', 'Add to Cart', 'Available', 'Buy Now'];
    setKeywords((k) => [...new Set([...k, ...defaults])]);
  };

  const applyTemplate = (kwds: string[]) => {
    setKeywords((k) => [...new Set([...k, ...kwds])]);
    setShowTemplates(false);
  };

  const copyKeywords = () => {
    navigator.clipboard.writeText(keywords.join('\n')).catch(() => {});
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 1500);
  };

  const alertModeDesc: Record<AlertMode, string> = {
    found:  'Get notified when your keyword appears.',
    lost:   'Get notified when your keyword disappears.',
    custom: 'Define your own trigger condition.',
  };

  const refreshTypeDesc: Record<RefreshType, string> = {
    full: 'Reload the entire page to check for changes',
    xhr:  'Fire background XHR requests only — faster, no full reload',
  };

  const inputPlaceholder = monitorLevel === 'basic'
    ? 'Enter keyword, regex, XPath, or CSS selector'
    : 'CSS selector, XPath, or regex pattern…';

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Scrollable body */}
      <div
        ref={scrollRef}
        className="overflow-y-auto space-y-3 pb-20"
        style={{ maxHeight: 'calc(580px - 130px)' }}
      >

        {/* ── REFRESH TYPE ──────────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="section-label">Refresh Type</span>
            <Tooltip text="How the page is reloaded before each scan. Full Page reloads the entire URL — reliable but heavier. XHR fires the page's background AJAX/XHR requests — faster and lighter, ideal for dynamic pages that update without reloading.">
              <HelpCircle size={13} className="text-riq-muted/50 hover:text-riq-muted transition-colors cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'full' as RefreshType, label: 'Full Page Refresh', icon: <RefreshCw size={13}/> },
              { id: 'xhr'  as RefreshType, label: 'XHR Refresh',       icon: <Code2 size={13}/> },
            ] as const).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setRefreshType(id)}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-150',
                  refreshType === id
                    ? 'bg-riq-elevated border-riq-green text-riq-green shadow-glow-green'
                    : 'bg-riq-elevated border-riq-border text-riq-muted hover:border-riq-border-light hover:text-riq-text',
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <p className="text-2xs text-riq-muted">{refreshTypeDesc[refreshType]}</p>
        </div>

        {/* ── MONITORING MODE ───────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-3">
          {/* Mode row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="section-label">Monitoring Mode</span>
              {/* Basic / Advanced pill */}
              <div className="flex bg-riq-elevated border border-riq-border rounded-full p-0.5 ml-1">
                {(['basic','advanced'] as MonitorLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setMonitorLevel(lvl)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-150',
                      monitorLevel === lvl
                        ? 'bg-riq-text text-riq-bg'
                        : 'text-riq-muted hover:text-riq-text',
                    )}
                  >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    {lvl === 'advanced' && (
                      <span className="ml-1 text-2xs font-bold text-riq-green bg-riq-green/15 px-1 rounded">BETA</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Templates button */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 text-2xs text-riq-muted hover:text-riq-green transition-colors font-medium"
              >
                <Sparkles size={11}/> Templates
              </button>
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-6 z-50 w-52 rounded-lg overflow-hidden"
                    style={{ background: '#1a2038', border: '1px solid #303d66', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  >
                    <div className="p-2 border-b border-riq-border">
                      <p className="text-2xs font-semibold text-riq-muted uppercase tracking-wider">Keyword Templates</p>
                    </div>
                    {KEYWORD_TEMPLATES.map(({ label, keywords: kwds }) => (
                      <button
                        key={label}
                        onClick={() => applyTemplate(kwds)}
                        className="w-full text-left px-3 py-2 text-xs text-riq-text hover:bg-riq-elevated transition-colors"
                      >
                        <p className="font-medium">{label}</p>
                        <p className="text-2xs text-riq-muted mt-0.5 truncate">{kwds.slice(0,3).join(', ')}…</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Alert mode: Found / Lost / Custom */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { id: 'found'  as AlertMode, label: 'Found',  icon: <Bell size={12}/> },
              { id: 'lost'   as AlertMode, label: 'Lost',   icon: <BellOff size={12}/> },
              { id: 'custom' as AlertMode, label: 'Custom', icon: <Settings2 size={12}/> },
            ]).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setAlertMode(id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all duration-150',
                  alertMode === id
                    ? 'bg-riq-elevated border-riq-green text-riq-green'
                    : 'bg-riq-elevated border-riq-border text-riq-muted hover:border-riq-border-light hover:text-riq-text',
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <p className="text-2xs text-riq-muted">{alertModeDesc[alertMode]}</p>

          {/* Advanced mode options */}
          <AnimatePresence>
            {monitorLevel === 'advanced' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-2xs text-riq-muted">Input type:</span>
                  {['Keyword', 'Regex', 'CSS', 'XPath'].map((t) => (
                    <button key={t} className="preset-chip text-2xs px-2 py-0.5">{t}</button>
                  ))}
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-2xs text-riq-muted">Case sensitive</span>
                    <Toggle checked={s.caseSensitive} onChange={(v) => patch('caseSensitive', v)} size="sm" color="amber" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyword input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={inputPlaceholder}
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setRegexError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              className="glass-input flex-1 px-3 py-2.5 text-sm"
            />
            <button
              onClick={addKeyword}
              disabled={!inputVal.trim()}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg btn-primary text-sm font-semibold disabled:opacity-40 shrink-0"
            >
              <Plus size={13}/> Add
            </button>
          </div>
          {regexError && (
            <p className="text-2xs text-riq-red flex items-center gap-1"><AlertTriangle size={10}/>{regexError}</p>
          )}

          {/* Keyword chips or empty state */}
          {keywords.length === 0 ? (
            <div className="flex items-center justify-center py-3 rounded-lg border border-dashed border-riq-border">
              <p className="text-2xs text-riq-muted italic">No keywords yet — add at least one to start monitoring.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {keywords.map((kw) => (
                  <KeywordChip key={kw} label={kw} onRemove={() => removeKeyword(kw)} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={addDefaults} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-riq-border text-2xs text-riq-muted hover:text-riq-text hover:border-riq-border-light transition-colors font-mono">
              Add Default Target Keywords
            </button>
            {keywords.length > 0 && (
              <>
                <button onClick={copyKeywords} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-riq-border text-2xs text-riq-muted hover:text-riq-text transition-colors">
                  {copyDone ? <><CheckCircle2 size={10} className="text-riq-green"/> Copied</> : <><Copy size={10}/> Copy</>}
                </button>
                <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-riq-red/30 text-2xs text-riq-red hover:bg-riq-red/10 transition-colors">
                  <Trash2 size={10}/> Clear All
                </button>
              </>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                id="autoclick-cb"
                checked={s.autoClickTargets}
                onChange={(e) => patch('autoClickTargets', e.target.checked)}
                className="w-3 h-3 accent-riq-green cursor-pointer"
              />
              <label htmlFor="autoclick-cb" className="flex items-center gap-1 text-2xs text-riq-muted cursor-pointer hover:text-riq-text transition-colors">
                <MousePointerClick size={10}/> Auto-click on keyword match
              </label>
              {s.newTabOnMatch && (
                <button className="text-2xs text-riq-blue hover:underline">↗ New tab</button>
              )}
            </div>
          </div>

          {/* Tip banner */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Info size={12} className="text-riq-blue shrink-0"/>
                <p className="text-2xs text-riq-text flex-1">
                  <span className="font-semibold text-riq-blue">Tip:</span> Need more actions? Try{' '}
                  <button className="text-riq-blue hover:underline font-medium">Multi-Click Automation.</button>
                </p>
                <button onClick={() => setShowTip(false)} className="text-riq-muted/60 hover:text-riq-muted transition-colors shrink-0">
                  <X size={12}/>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MONITORED AREA ────────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2">
          <SectionHeader
            label="Monitored Area"
            icon={<Monitor size={12}/>}
            open={open.monitoredArea}
            onToggle={() => toggleSection('monitoredArea')}
          />
          <AnimatePresence>
            {open.monitoredArea && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <SettingRow
                    icon={<Monitor size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Monitor Area"
                    desc="Limit the search to one region of the page"
                    helpText="Enable to specify a custom area of the page for monitoring or search. Draw a rectangle to define the region."
                    checked={s.monitorArea}
                    onToggle={(v) => patch('monitorArea', v)}
                  />
                  <AnimatePresence>
                    {s.monitorArea && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <button className="w-full py-2 rounded-lg border border-dashed border-riq-green/40 text-xs text-riq-green hover:bg-riq-green/5 transition-colors font-medium">
                          ✚ Click to select page region
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── ALERT SETTINGS ────────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2">
          <SectionHeader
            label="Alert Settings"
            icon={<Bell size={12}/>}
            open={open.alertSettings}
            onToggle={() => toggleSection('alertSettings')}
          />
          <AnimatePresence>
            {open.alertSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <SettingRow
                    icon={<Mail size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Receive Email Alerts"
                    desc="Email you when the monitor triggers"
                    actionBtn={
                      <button className="px-2.5 py-1 rounded border border-riq-green/40 text-2xs text-riq-green hover:bg-riq-green/10 transition-colors font-medium">
                        Add Email
                      </button>
                    }
                    checked={s.emailAlerts}
                    onToggle={(v) => patch('emailAlerts', v)}
                  />
                  <SettingRow
                    icon={<Webhook size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Receive Webhook Alerts"
                    desc="POST a payload to your endpoint"
                    actionBtn={
                      <button className="px-2.5 py-1 rounded text-2xs font-semibold transition-colors"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                        Webhooks
                      </button>
                    }
                    checked={s.webhookAlerts}
                    onToggle={(v) => patch('webhookAlerts', v)}
                  />
                  <SettingRow
                    icon={<Volume2 size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Sound on Match"
                    desc="Play a sound when a keyword is detected"
                    helpText="Plays an audio alert in the browser when the monitor finds a match. Requires the browser tab to be open."
                    checked={s.soundOnMatch}
                    onToggle={(v) => patch('soundOnMatch', v)}
                    toggleColor="green"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── DETECTION BEHAVIOR ────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2">
          <SectionHeader
            label="Detection Behavior"
            icon={<Eye size={12}/>}
            open={open.detectionBehavior}
            onToggle={() => toggleSection('detectionBehavior')}
          />
          <AnimatePresence>
            {open.detectionBehavior && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <SettingRow
                    icon={<Zap size={14}/>}
                    iconBg="bg-riq-amber/10 border border-riq-amber/20"
                    iconColor="text-riq-amber"
                    label="Real-Time Detection"
                    desc="Check continuously without full reloads"
                    helpText="Uses MutationObserver to watch for DOM changes instantly — without needing a full page refresh. Ideal for SPAs and live-updating pages."
                    checked={s.realTimeDetection}
                    onToggle={(v) => patch('realTimeDetection', v)}
                  />
                  <SettingRow
                    icon={<RefreshCw size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Continue Refreshing After Alert"
                    desc="Keep refreshing once an alert fires"
                    helpText="By default, monitoring stops after the first match. Enable this to keep refreshing and re-alert on each subsequent match."
                    checked={s.continueAfterAlert}
                    onToggle={(v) => patch('continueAfterAlert', v)}
                  />
                  <SettingRow
                    icon={<Clock size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Wait for Content to Load"
                    desc="Delay the scan after each refresh"
                    helpText="Waits for dynamic content to finish loading before scanning. Useful for JavaScript-heavy pages that render content asynchronously."
                    checked={s.waitForContent}
                    onToggle={(v) => patch('waitForContent', v)}
                  />
                  <SettingRow
                    icon={<Eye size={14}/>}
                    iconBg="bg-riq-green/10 border border-riq-green/20"
                    iconColor="text-riq-green"
                    label="Highlight Keyword on Page"
                    desc="Outline the matched keyword visually"
                    checked={s.highlightKeyword}
                    onToggle={(v) => patch('highlightKeyword', v)}
                    toggleColor="green"
                  />
                  <SettingRow
                    icon={<Monitor size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Window Focus on Keyword Detection"
                    desc="Bring the tab forward when matched"
                    helpText="Enable window focus when Page Monitor finds or loses a keyword. This feature ensures the window automatically comes to the forefront of your screen whenever the specified keyword is detected or lost."
                    checked={s.windowFocus}
                    onToggle={(v) => patch('windowFocus', v)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CLICK AUTOMATION ─────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2">
          <SectionHeader
            label="Click Automation"
            icon={<MousePointerClick size={12}/>}
            badge={<Badge text="NEW" variant="green" />}
            open={open.clickAutomation}
            onToggle={() => toggleSection('clickAutomation')}
          />
          <AnimatePresence>
            {open.clickAutomation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <SettingRow
                    icon={<MousePointerClick size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Auto Click Targets"
                    desc="Click elements after each refresh or when keyword matches"
                    helpText="Automatically clicks a specified element on the page when your keyword is detected. Set up CSS selectors for the elements to click."
                    checked={s.autoClickTargets}
                    onToggle={(v) => patch('autoClickTargets', v)}
                  />
                  <AnimatePresence>
                    {s.autoClickTargets && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          <label className="text-2xs text-riq-muted">Target element (CSS selector)</label>
                          <div className="flex gap-2">
                            <input type="text" placeholder="e.g. #add-to-cart, .buy-now-btn" className="glass-input flex-1 px-3 py-2 text-xs font-mono" />
                            <button className="px-3 py-2 rounded btn-primary text-xs font-semibold shrink-0">
                              <Plus size={11}/>
                            </button>
                          </div>
                          <SettingRow
                            icon={<EyeOff size={12}/>}
                            iconBg="bg-riq-elevated border border-riq-border"
                            label="Open Match in New Tab"
                            desc="Open a link when keyword is found"
                            checked={s.newTabOnMatch}
                            onToggle={(v) => patch('newTabOnMatch', v)}
                            toggleColor="amber"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SCAN METHOD ───────────────────────────────────────────────── */}
        <div className="glass-card p-3 space-y-2">
          <SectionHeader
            label="Scan Method"
            icon={<ScanText size={12}/>}
            open={open.scanMethod}
            onToggle={() => toggleSection('scanMethod')}
          />
          <AnimatePresence>
            {open.scanMethod && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <SettingRow
                    icon={<ScanText size={14}/>}
                    iconBg="bg-riq-green/10 border border-riq-green/20"
                    iconColor="text-riq-green"
                    label="Match Visible Text"
                    desc="Scan rendered, on-screen text"
                    helpText="Scans only the visible text rendered on the page — the same text you can see and select with your cursor."
                    checked={s.matchVisibleText}
                    onToggle={(v) => patch('matchVisibleText', v)}
                    toggleColor="green"
                  />
                  <SettingRow
                    icon={<FileCode2 size={14}/>}
                    iconBg="bg-riq-elevated border border-riq-border"
                    label="Match HTML Source"
                    desc="Scan raw source — slower, use with caution"
                    badge={<Badge text="CAUTION" variant="amber"/>}
                    helpText="Scans the raw HTML source code of the page. This can find keywords hidden in HTML attributes, comments, or script tags — but is significantly slower and may cause performance issues."
                    checked={s.matchHtmlSource}
                    onToggle={(v) => patch('matchHtmlSource', v)}
                    disabled={!s.matchVisibleText && !s.matchHtmlSource}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>{/* end scroll */}

      {/* ── Floating GO TOP ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollTop}
            className="absolute right-4 bottom-20 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-2xs font-semibold text-riq-text shadow-card z-10 transition-colors hover:border-riq-border-light"
            style={{ background: '#1a2038', border: '1px solid #303d66' }}
          >
            <ArrowUp size={11}/> GO TOP
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Start Refreshing CTA ──────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0b0f1a 60%, transparent)' }}
      >
        <button
          onClick={isRunning ? stopRefresh : startRefresh}
          disabled={keywords.length === 0}
          className={cn(
            'w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 pointer-events-auto transition-all duration-150',
            keywords.length === 0
              ? 'opacity-40 cursor-not-allowed bg-riq-green text-riq-bg'
              : isRunning
              ? 'bg-riq-red/20 text-riq-red border border-riq-red/40 hover:bg-riq-red/30'
              : 'btn-primary shadow-glow-green hover:brightness-110',
          )}
        >
          <Play size={15} className={isRunning ? 'animate-pulse' : ''} />
          {isRunning ? 'Stop Monitoring' : 'Start Refreshing'}
        </button>
      </div>
    </div>
  );
}
