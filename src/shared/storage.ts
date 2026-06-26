import { STORAGE_KEYS } from './constants';
import type { RefreshState, MonitorState, AppSettings, ScheduleConfig, TabGroup } from './types';

/** Read one key from chrome.storage.local */
async function get<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? null);
    });
  });
}

/** Write one key to chrome.storage.local */
async function set(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

/** Remove one key */
async function remove(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve);
  });
}

/** Get multiple keys at once */
async function getMultiple<T>(keys: string[]): Promise<Partial<T>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result as Partial<T>);
    });
  });
}

// ─── Typed accessors ──────────────────────────────────────────────────────────

export const storage = {
  // Refresh
  getRefreshState:   () => get<RefreshState>(STORAGE_KEYS.REFRESH_STATE),
  setRefreshState:   (v: RefreshState) => set(STORAGE_KEYS.REFRESH_STATE, v),

  // Monitor
  getMonitorState:   () => get<MonitorState>(STORAGE_KEYS.MONITOR_STATE),
  setMonitorState:   (v: MonitorState) => set(STORAGE_KEYS.MONITOR_STATE, v),

  // Settings
  getSettings:       () => get<AppSettings>(STORAGE_KEYS.SETTINGS),
  setSettings:       (v: AppSettings) => set(STORAGE_KEYS.SETTINGS, v),

  // Schedules
  getSchedules:      () => get<ScheduleConfig[]>(STORAGE_KEYS.SCHEDULES),
  setSchedules:      (v: ScheduleConfig[]) => set(STORAGE_KEYS.SCHEDULES, v),

  // Tab groups
  getTabGroups:      () => get<TabGroup[]>(STORAGE_KEYS.TAB_GROUPS),
  setTabGroups:      (v: TabGroup[]) => set(STORAGE_KEYS.TAB_GROUPS, v),

  // Clear all
  clearAll: async () => {
    await Promise.all(Object.values(STORAGE_KEYS).map(remove));
  },

  // Raw get/set for custom use
  get,
  set,
  remove,
};

/** Zustand-compatible storage adapter for persist middleware */
export const zustandChromeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await get<string>(name);
    return result;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await remove(name);
  },
};

/** Listen for storage changes from background or other contexts */
export function onStorageChange(
  key: string,
  callback: (newValue: unknown, oldValue: unknown) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string,
  ) => {
    if (area === 'local' && changes[key]) {
      callback(changes[key].newValue, changes[key].oldValue);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
