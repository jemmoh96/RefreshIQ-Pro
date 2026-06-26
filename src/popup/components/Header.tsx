import React, { useState, useEffect } from 'react';
import { Settings, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRefreshStore } from '../../store/refreshStore';
import { cn } from '../../shared/utils';

export default function Header() {
  const status       = useRefreshStore((s) => s.status);
  const refreshCount = useRefreshStore((s) => s.refreshCount);
  const [currentUrl, setCurrentUrl] = useState('');
  const [tabTitle, setTabTitle]     = useState('');

  useEffect(() => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) {
          setCurrentUrl(tab.url ?? '');
          setTabTitle(tab.title ?? '');
        }
      });
    } catch {
      setCurrentUrl('http://localhost:3000');
      setTabTitle('Dev Mode');
    }
  }, []);

  const statusColor = {
    idle:    'bg-riq-muted/40',
    running: 'bg-riq-green animate-pulse-glow',
    paused:  'bg-riq-amber',
    error:   'bg-riq-red',
  }[status];

  const statusLabel = {
    idle:    'Inactive',
    running: 'Monitoring',
    paused:  'Paused',
    error:   'Error',
  }[status];

  function openOptions() {
    try {
      chrome.runtime.openOptionsPage();
    } catch {
      window.open('/src/options/index.html');
    }
  }

  const host = (() => {
    try { return new URL(currentUrl).hostname || 'No active tab'; }
    catch { return currentUrl || 'No active tab'; }
  })();

  return (
    <header className="relative flex items-center justify-between px-4 pt-4 pb-3">
      {/* Logo + name */}
      <div className="flex items-center gap-2.5">
        {/* Logo mark */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-riq-green/10 border border-riq-green/30" />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2C5.134 2 2 5.134 2 9s3.134 7 7 7 7-3.134 7-7"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13 2.5L16 5.5M16 5.5L13 8.5M16 5.5H10"
              stroke="#22c55e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {status === 'running' && (
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-riq-green"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-riq-text tracking-tight">
              RefreshIQ
            </span>
            <span className="text-2xs font-semibold text-riq-green bg-riq-green/10 px-1.5 py-0.5 rounded-full border border-riq-green/20">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn('status-dot', statusColor)} />
            <span className="text-2xs text-riq-muted">{statusLabel}</span>
            {status === 'running' && (
              <span className="text-2xs text-riq-muted">
                · {refreshCount} refresh{refreshCount !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: current tab + actions */}
      <div className="flex items-center gap-2">
        {/* Current tab pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-riq-elevated border border-riq-border rounded-full px-2.5 py-1 max-w-[120px]">
          <Zap size={9} className="text-riq-muted shrink-0" />
          <span className="text-2xs text-riq-muted truncate">{host}</span>
        </div>

        {/* Settings */}
        <button
          onClick={openOptions}
          className="w-7 h-7 flex items-center justify-center rounded text-riq-muted hover:text-riq-text hover:bg-riq-elevated transition-colors"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
