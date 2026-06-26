import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import IntervalTab from './tabs/IntervalTab';
import TimerTab from './tabs/TimerTab';
import TabsTab from './tabs/TabsTab';
import MonitorTab from './tabs/MonitorTab';
import { useRefreshStore, useMonitorStore, useTabsStore } from '../store';
import { storage, onStorageChange } from '../shared/storage';
import { MsgType } from '../shared/types';
import type { RefreshState, MonitorState } from '../shared/types';

export type TabId = 'interval' | 'timer' | 'tabs' | 'monitor';

const tabVariants = {
  enter:  { opacity: 0, y: 5 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -3 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('interval');
  const [ready, setReady]         = useState(false);

  const hydrateRefresh = useRefreshStore((s) => s.hydrate);
  const hydrateMonitor = useMonitorStore((s) => s.hydrate);
  const loadTabs       = useTabsStore((s)   => s.loadTabs);

  useEffect(() => {
    async function init() {
      try {
        const [refreshState, monitorState] = await Promise.all([
          storage.getRefreshState(),
          storage.getMonitorState(),
          loadTabs(),
        ]);
        if (refreshState) hydrateRefresh(refreshState);
        if (monitorState) hydrateMonitor(monitorState);
      } catch { /* dev mode */ }
      finally { setReady(true); }
    }
    init();
  }, [hydrateRefresh, hydrateMonitor, loadTabs]);

  useEffect(() => {
    try {
      const off1 = onStorageChange('riq_refresh_state', (v) => { if (v) hydrateRefresh(v as RefreshState); });
      const off2 = onStorageChange('riq_monitor_state', (v) => { if (v) hydrateMonitor(v as MonitorState); });
      return () => { off1(); off2(); };
    } catch { return () => {}; }
  }, [hydrateRefresh, hydrateMonitor]);

  useEffect(() => {
    const handler = (msg: { type: string; payload?: { nextRefreshAt?: number; refreshCount?: number } }) => {
      if (msg.type === MsgType.REFRESH_TICK && msg.payload) {
        useRefreshStore.setState({
          nextRefreshAt: msg.payload.nextRefreshAt ?? null,
          refreshCount:  msg.payload.refreshCount  ?? 0,
        });
      }
    };
    try {
      chrome.runtime.onMessage.addListener(handler);
      return () => chrome.runtime.onMessage.removeListener(handler);
    } catch { return () => {}; }
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center w-[460px] h-[580px] bg-riq-bg">
        <div className="w-6 h-6 border-2 border-riq-green/30 border-t-riq-green rounded-full animate-spin" />
      </div>
    );
  }

  // Monitor tab gets special layout (sticky CTA, internal scroll)
  const isMonitor = activeTab === 'monitor';

  return (
    <div className="flex flex-col w-[460px] bg-riq-bg select-none" style={{ height: 580 }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, #22c55e33, transparent)' }} />

      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ overflowY: isMonitor ? 'hidden' : 'auto' }}
          >
            {/* Monitor tab: no outer padding (manages its own layout) */}
            {isMonitor ? (
              <div className="relative h-full px-4 pt-3">
                <MonitorTab />
              </div>
            ) : (
              <div className="p-4 pb-6">
                {activeTab === 'interval' && <IntervalTab />}
                {activeTab === 'timer'    && <TimerTab />}
                {activeTab === 'tabs'     && <TabsTab />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
