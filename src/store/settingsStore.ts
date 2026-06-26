import { create } from 'zustand';
import type { AppSettings, NotificationConfig } from '../shared/types';
import { EXTENSION_NAME, EXTENSION_VERSION } from '../shared/constants';

const defaultNotifications: NotificationConfig = {
  browserEnabled: true,
  soundEnabled:   false,
  soundType:      'chime',
  webhooks:       [],
  telegram:       null,
};

const defaultSettings: AppSettings = {
  extensionName:  EXTENSION_NAME,
  theme:          'dark',
  accentColor:    '#22c55e',
  reducedMotion:  false,
  notifications:  defaultNotifications,
  automation:     [],
  profiles:       [],
  activeProfileId: null,
  wakeLock:       false,
  sessionRestore: true,
  redirectDetect: true,
  captchaDetect:  true,
  version:        EXTENSION_VERSION,
};

interface SettingsStore {
  settings: AppSettings;
  updateSettings:  (patch: Partial<AppSettings>) => void;
  updateNotifications: (patch: Partial<NotificationConfig>) => void;
  reset: () => void;
  hydrate: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  settings: defaultSettings,

  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  updateNotifications: (patch) =>
    set((s) => ({
      settings: {
        ...s.settings,
        notifications: { ...s.settings.notifications, ...patch },
      },
    })),

  reset: () => set({ settings: defaultSettings }),

  hydrate: (settings) => set({ settings }),
}));
