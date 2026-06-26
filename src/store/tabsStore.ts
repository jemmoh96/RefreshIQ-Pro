import { create } from 'zustand';
import type { ManagedTab, TabGroup } from '../shared/types';
import { generateId } from '../shared/utils';

interface TabsStore {
  tabs:         ManagedTab[];
  groups:       TabGroup[];
  selectedIds:  number[];
  loading:      boolean;

  loadTabs:        () => Promise<void>;
  selectTab:       (id: number) => void;
  deselectTab:     (id: number) => void;
  selectAll:       () => void;
  deselectAll:     () => void;
  refreshTab:      (id: number) => Promise<void>;
  refreshSelected: () => Promise<void>;
  refreshAll:      () => Promise<void>;
  addGroup:        (name: string, color: string) => string;
  removeGroup:     (id: string) => void;
  addTabToGroup:   (groupId: string, tabId: number) => void;
  removeTabFromGroup: (groupId: string, tabId: number) => void;
  setTabRefresh:   (tabId: number, active: boolean, interval: number) => void;
}

export const useTabsStore = create<TabsStore>()((set, get) => ({
  tabs:        [],
  groups:      [],
  selectedIds: [],
  loading:     false,

  loadTabs: async () => {
    set({ loading: true });
    try {
      const chromeTabs = await chrome.tabs.query({});
      const tabs: ManagedTab[] = chromeTabs
        .filter((t) => t.id && t.url && !t.url.startsWith('chrome://'))
        .map((t) => ({
          id:              t.id!,
          title:           t.title ?? 'Untitled',
          url:             t.url ?? '',
          favicon:         t.favIconUrl ?? '',
          refreshActive:   false,
          refreshInterval: 30,
          monitorActive:   false,
          pinned:          t.pinned ?? false,
        }));
      set({ tabs, loading: false });
    } catch (e) {
      console.error('[RefreshIQ] loadTabs failed', e);
      set({ loading: false });
    }
  },

  selectTab:   (id) => set((s) => ({ selectedIds: [...new Set([...s.selectedIds, id])] })),
  deselectTab: (id) => set((s) => ({ selectedIds: s.selectedIds.filter((i) => i !== id) })),
  selectAll:   () => set((s) => ({ selectedIds: s.tabs.map((t) => t.id) })),
  deselectAll: () => set({ selectedIds: [] }),

  refreshTab: async (id) => {
    await chrome.tabs.reload(id, { bypassCache: false });
  },

  refreshSelected: async () => {
    const { selectedIds } = get();
    await Promise.all(selectedIds.map((id) => chrome.tabs.reload(id)));
  },

  refreshAll: async () => {
    const { tabs } = get();
    await Promise.all(tabs.map((t) => chrome.tabs.reload(t.id)));
  },

  addGroup: (name, color) => {
    const id = generateId();
    set((s) => ({
      groups: [...s.groups, { id, name, color, tabIds: [] }],
    }));
    return id;
  },

  removeGroup: (id) =>
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),

  addTabToGroup: (groupId, tabId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, tabIds: [...new Set([...g.tabIds, tabId])] }
          : g,
      ),
    })),

  removeTabFromGroup: (groupId, tabId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, tabIds: g.tabIds.filter((id) => id !== tabId) }
          : g,
      ),
    })),

  setTabRefresh: (tabId, active, interval) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId
          ? { ...t, refreshActive: active, refreshInterval: interval }
          : t,
      ),
    })),
}));
