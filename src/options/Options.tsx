import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Webhook, Shield, Zap, Database, Download, Upload,
  RotateCw, ChevronRight, ExternalLink, Trash2, Save,
} from 'lucide-react';
import Toggle from '../popup/components/Toggle';
import { useSettingsStore } from '../store/settingsStore';
import { storage } from '../shared/storage';
import { cn } from '../shared/utils';
import { EXTENSION_VERSION } from '../shared/constants';

type Section = 'notifications' | 'webhooks' | 'security' | 'automation' | 'data' | 'about';

const NAV_ITEMS: Array<{ id: Section; label: string; icon: React.ElementType }> = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'webhooks',      label: 'Webhooks',      icon: Webhook },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'automation',    label: 'Automation',     icon: Zap },
  { id: 'data',          label: 'Data & Sync',    icon: Database },
  { id: 'about',         label: 'About',          icon: ExternalLink },
];

export default function Options() {
  const [section, setSection]   = useState<Section>('notifications');
  const [saved, setSaved]       = useState(false);
  const { settings, updateSettings, updateNotifications, hydrate } = useSettingsStore();

  useEffect(() => {
    storage.getSettings().then((s) => { if (s) hydrate(s); }).catch(() => {});
  }, [hydrate]);

  const handleSave = async () => {
    await storage.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = {
      version:  EXTENSION_VERSION,
      exported: new Date().toISOString(),
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'refreshiq-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.settings) { hydrate(data.settings); await storage.setSettings(data.settings); }
      } catch { alert('Invalid settings file'); }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm('Clear all RefreshIQ data? This cannot be undone.')) return;
    await storage.clearAll();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-riq-bg flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-riq-border flex flex-col py-6 px-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-riq-green/10 border border-riq-green/30">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C5.134 2 2 5.134 2 9s3.134 7 7 7 7-3.134 7-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
              <path d="M13 2.5L16 5.5M16 5.5L13 8.5M16 5.5H10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-riq-text">RefreshIQ</p>
            <p className="text-2xs text-riq-muted">Settings</p>
          </div>
        </div>

        <nav className="space-y-0.5 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                section === id
                  ? 'bg-riq-green/10 text-riq-green font-medium'
                  : 'text-riq-muted hover:text-riq-text hover:bg-riq-elevated',
              )}
            >
              <Icon size={14} />
              {label}
              {section === id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 px-1">
          <button onClick={handleSave} className={cn('w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all', saved ? 'bg-riq-green/20 text-riq-green border border-riq-green/30' : 'btn-primary')}>
            <Save size={13} />{saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-6">

            {section === 'notifications' && (
              <>
                <SectionHeader title="Notifications" desc="Configure how RefreshIQ alerts you when something changes." />
                <SettingsCard title="Browser Notifications">
                  <SettingRow label="Enable browser notifications" desc="Show OS-level notifications on match">
                    <Toggle checked={settings.notifications.browserEnabled} onChange={(v) => updateNotifications({ browserEnabled: v })} />
                  </SettingRow>
                  <SettingRow label="Sound alerts" desc="Play a sound when a match is found">
                    <Toggle checked={settings.notifications.soundEnabled} onChange={(v) => updateNotifications({ soundEnabled: v })} />
                  </SettingRow>
                  {settings.notifications.soundEnabled && (
                    <div className="pt-1">
                      <label className="text-xs text-riq-muted block mb-1.5">Sound type</label>
                      <select value={settings.notifications.soundType} onChange={(e) => updateNotifications({ soundType: e.target.value as 'chime'|'ping'|'alert'|'none' })} className="glass-input px-3 py-2 text-sm w-40">
                        {['chime','ping','alert','none'].map((s) => <option key={s} value={s} className="bg-riq-surface">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </div>
                  )}
                </SettingsCard>
                <SettingsCard title="Telegram Bot">
                  <SettingRow label="Enable Telegram alerts" desc="Send matches to a Telegram chat">
                    <Toggle checked={settings.notifications.telegram?.enabled ?? false} onChange={(v) => updateNotifications({ telegram: { ...(settings.notifications.telegram ?? { botToken:'',chatId:'' }), enabled: v } })} />
                  </SettingRow>
                  {settings.notifications.telegram?.enabled && (
                    <div className="space-y-2 pt-1">
                      {[['Bot Token','botToken','Enter your bot token…'],['Chat ID','chatId','Enter chat or channel ID…']].map(([l,k,p]) => (
                        <div key={k}>
                          <label className="text-xs text-riq-muted block mb-1">{l}</label>
                          <input type="text" placeholder={p} value={(settings.notifications.telegram as Record<string,string>)?.[k]??''} onChange={(e) => updateNotifications({ telegram: { ...(settings.notifications.telegram ?? { botToken:'',chatId:'',enabled:false }), [k]: e.target.value } })} className="glass-input w-full px-3 py-2 text-sm font-mono" />
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsCard>
              </>
            )}

            {section === 'webhooks' && (
              <>
                <SectionHeader title="Webhooks" desc="Send HTTP requests to external services when a match is found." />
                <SettingsCard title="Add Webhook">
                  <p className="text-xs text-riq-muted">Supports Discord, Slack, Teams, Zapier, Make, n8n, and generic HTTP endpoints.</p>
                  <div className="space-y-2 mt-3">
                    <input type="url" placeholder="https://hooks.slack.com/…" className="glass-input w-full px-3 py-2 text-sm" />
                    <select className="glass-input px-3 py-2 text-sm w-full">
                      {['discord','slack','teams','zapier','custom'].map((p) => <option key={p} value={p} className="bg-riq-surface">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                    </select>
                    <button className="btn-primary px-4 py-2 text-sm rounded-lg">Add Webhook</button>
                  </div>
                </SettingsCard>
                {settings.notifications.webhooks.length === 0 && (
                  <div className="text-center py-8 text-riq-muted text-sm">No webhooks configured yet.</div>
                )}
              </>
            )}

            {section === 'security' && (
              <>
                <SectionHeader title="Security" desc="RefreshIQ is fully local — no data leaves your device." />
                <SettingsCard title="Privacy Guarantees">
                  {['No cloud dependency','No telemetry or analytics','No user tracking','No data collection','All processing runs locally','Open source & auditable'].map((item) => (
                    <div key={item} className="flex items-center gap-2 py-1.5 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-riq-green shrink-0"/>
                      <span className="text-riq-text">{item}</span>
                    </div>
                  ))}
                </SettingsCard>
                <SettingsCard title="Permissions Used">
                  {[['tabs','Access tab URLs and titles'],['alarms','Schedule refresh timers'],['storage','Save settings locally'],['notifications','Send OS notifications'],['scripting','Inject monitor scripts'],['webNavigation','Detect page changes']].map(([p,d]) => (
                    <div key={p} className="flex items-start gap-2 py-1.5">
                      <code className="text-xs text-riq-amber font-mono mt-0.5 shrink-0">{p}</code>
                      <span className="text-xs text-riq-muted">{d}</span>
                    </div>
                  ))}
                </SettingsCard>
              </>
            )}

            {section === 'automation' && (
              <>
                <SectionHeader title="Automation" desc="Create IF/THEN rules that trigger actions on page events." />
                <div className="glass-card p-6 text-center">
                  <Zap size={32} className="mx-auto text-riq-green/40 mb-3"/>
                  <p className="text-sm font-medium text-riq-text mb-1">Visual Workflow Builder</p>
                  <p className="text-xs text-riq-muted">Create node-based automation rules — coming in v1.1</p>
                </div>
              </>
            )}

            {section === 'data' && (
              <>
                <SectionHeader title="Data & Sync" desc="Export, import, or reset all extension data." />
                <SettingsCard title="Backup & Restore">
                  <div className="flex gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                      <Download size={13}/> Export settings.json
                    </button>
                    <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                      <Upload size={13}/> Import settings
                    </button>
                  </div>
                </SettingsCard>
                <SettingsCard title="Session Recovery">
                  <SettingRow label="Restore on browser restart" desc="Resume monitoring after browser restarts">
                    <Toggle checked={settings.sessionRestore} onChange={(v) => updateSettings({ sessionRestore: v })} />
                  </SettingRow>
                </SettingsCard>
                <SettingsCard title="Danger Zone">
                  <button onClick={handleClearData} className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-danger text-sm">
                    <Trash2 size={13}/> Clear all data
                  </button>
                </SettingsCard>
              </>
            )}

            {section === 'about' && (
              <>
                <SectionHeader title="About RefreshIQ Pro" desc={`Version ${EXTENSION_VERSION}`} />
                <SettingsCard title="What is RefreshIQ Pro?">
                  <p className="text-sm text-riq-muted leading-relaxed">
                    RefreshIQ Pro is a free, open-source, privacy-first browser extension combining auto-refresh,
                    website monitoring, keyword detection, and automation — all running locally with zero cloud dependency.
                  </p>
                </SettingsCard>
                <SettingsCard title="Links">
                  {[['GitHub Repository','https://github.com/'],['Report a Bug','https://github.com/'],['Request a Feature','https://github.com/'],['Privacy Policy','#']].map(([l,u]) => (
                    <a key={l} href={u} target="_blank" rel="noopener" className="flex items-center gap-2 py-1.5 text-sm text-riq-muted hover:text-riq-text transition-colors">
                      <ExternalLink size={12}/>{l}
                    </a>
                  ))}
                </SettingsCard>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-riq-text mb-1">{title}</h1>
      <p className="text-sm text-riq-muted">{desc}</p>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-riq-text border-b border-riq-border pb-2 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-riq-text">{label}</p>
        {desc && <p className="text-xs text-riq-muted mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
