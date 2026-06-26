import { create } from 'zustand';
import type { MonitorRule, MonitorState } from '../shared/types';
import { DEFAULT_MONITOR_RULE } from '../shared/constants';
import { generateId } from '../shared/utils';
import { sendToBackground, sendToTab } from '../shared/messaging';
import { MsgType } from '../shared/types';

interface MonitorStore extends MonitorState {
  addRule:       (partial: Partial<MonitorRule> & { target: string }) => string;
  updateRule:    (id: string, patch: Partial<MonitorRule>) => void;
  removeRule:    (id: string) => void;
  toggleRule:    (id: string) => Promise<void>;
  setGlobal:     (active: boolean) => void;
  markMatched:   (id: string, matched: string) => void;
  clearMatches:  (id: string) => void;
  hydrate:       (state: Partial<MonitorState>) => void;
}

const defaultState: MonitorState = {
  rules:        [],
  globalActive: false,
};

export const useMonitorStore = create<MonitorStore>()((set, get) => ({
  ...defaultState,

  addRule: (partial) => {
    const id = generateId();
    const rule: MonitorRule = {
      ...DEFAULT_MONITOR_RULE,
      id,
      tabId:     null,
      url:       '',
      label:     partial.target.slice(0, 30),
      createdAt: Date.now(),
      status:    'idle',
      mode:      'text',
      ...partial,
    } as MonitorRule;
    set((s) => ({ rules: [...s.rules, rule] }));
    return id;
  },

  updateRule: (id, patch) =>
    set((s) => ({
      rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  removeRule: (id) => {
    // Stop monitoring before removal
    const rule = get().rules.find((r) => r.id === id);
    if (rule?.tabId) {
      sendToTab(rule.tabId, MsgType.STOP_MONITOR, { ruleId: id }).catch(() => {});
    }
    set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
  },

  toggleRule: async (id) => {
    const rule = get().rules.find((r) => r.id === id);
    if (!rule) return;
    const newActive = !rule.active;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tab?.id ?? null;

      set((s) => ({
        rules: s.rules.map((r) =>
          r.id === id
            ? { ...r, active: newActive, tabId, status: newActive ? 'watching' : 'idle' }
            : r,
        ),
      }));

      if (tabId) {
        const updatedRule = { ...rule, active: newActive, tabId };
        const msgType = newActive ? MsgType.START_MONITOR : MsgType.STOP_MONITOR;
        await sendToTab(tabId, msgType, { rule: updatedRule });
      }
    } catch (e) {
      console.error('[RefreshIQ] toggleRule failed', e);
    }
  },

  setGlobal: (active) => set({ globalActive: active }),

  markMatched: (id, matched) =>
    set((s) => ({
      rules: s.rules.map((r) =>
        r.id === id
          ? {
              ...r,
              status:     'matched',
              lastMatchAt: Date.now(),
              matchCount: r.matchCount + 1,
            }
          : r,
      ),
    })),

  clearMatches: (id) =>
    set((s) => ({
      rules: s.rules.map((r) =>
        r.id === id
          ? { ...r, status: 'watching', lastMatchAt: null, matchCount: 0 }
          : r,
      ),
    })),

  hydrate: (state) => set((s) => ({ ...s, ...state })),
}));
