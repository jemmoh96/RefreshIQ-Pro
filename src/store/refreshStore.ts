import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { RefreshConfig, RefreshState } from '../shared/types';
import { DEFAULT_REFRESH_CONFIG } from '../shared/constants';
import { sendToBackground } from '../shared/messaging';
import { MsgType } from '../shared/types';

interface RefreshStore extends RefreshState {
  setConfig:      (patch: Partial<RefreshConfig>) => void;
  setStatus:      (status: RefreshState['status']) => void;
  startRefresh:   () => Promise<void>;
  stopRefresh:    () => Promise<void>;
  pauseRefresh:   () => Promise<void>;
  restartRefresh: () => Promise<void>;
  setNextRefresh: (at: number | null) => void;
  incrementCount: () => void;
  reset:          () => void;
  hydrate:        (state: Partial<RefreshState>) => void;
}

const defaultState: RefreshState = {
  status:        'idle',
  refreshCount:  0,
  nextRefreshAt: null,
  activeTabId:   null,
  config:        DEFAULT_REFRESH_CONFIG,
};

export const useRefreshStore = create<RefreshStore>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,

    setConfig: (patch) =>
      set((s) => ({ config: { ...s.config, ...patch } })),

    setStatus: (status) => set({ status }),

    startRefresh: async () => {
      const { config } = get();
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;
        set({ status: 'running', activeTabId: tab.id, refreshCount: 0 });
        await sendToBackground(MsgType.START_REFRESH, { tabId: tab.id, config });
      } catch (e) {
        console.error('[RefreshIQ] startRefresh failed', e);
        set({ status: 'error' });
      }
    },

    stopRefresh: async () => {
      const { activeTabId } = get();
      set({ status: 'idle', nextRefreshAt: null });
      if (activeTabId) {
        await sendToBackground(MsgType.STOP_REFRESH, { tabId: activeTabId });
      }
    },

    pauseRefresh: async () => {
      const { activeTabId } = get();
      set({ status: 'paused', nextRefreshAt: null });
      if (activeTabId) {
        await sendToBackground(MsgType.PAUSE_REFRESH, { tabId: activeTabId });
      }
    },

    restartRefresh: async () => {
      await get().stopRefresh();
      await get().startRefresh();
    },

    setNextRefresh: (at) => set({ nextRefreshAt: at }),

    incrementCount: () => set((s) => ({ refreshCount: s.refreshCount + 1 })),

    reset: () => set(defaultState),

    hydrate: (state) => set((s) => ({ ...s, ...state })),
  })),
);
