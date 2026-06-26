/**
 * RefreshIQ Pro — Background Service Worker (MV3)
 * Handles: alarms, tab refresh, monitor coordination, notifications
 */

import { MsgType } from '../shared/types';
import type { Message, TabRefreshPayload, MonitorPayload, RefreshConfig } from '../shared/types';
import { storage } from '../shared/storage';
import { ALARM_REFRESH, ALARM_SCHEDULE } from '../shared/constants';
import { randomInt, isWithinTimeWindow } from '../shared/utils';
import { RefreshManager } from './refresh';
import { AlarmManager } from './alarms';

// ─── State (ephemeral; persisted in storage) ─────────────────────────────────
const refreshManager = new RefreshManager();
const alarmManager   = new AlarmManager();

// ─── Lifecycle: re-register alarms on service worker wakeup ──────────────────
self.addEventListener('activate', () => {
  console.log('[RefreshIQ] Service worker activated');
  restoreState();
});

async function restoreState() {
  try {
    const refreshState = await storage.getRefreshState();
    if (refreshState?.status === 'running' && refreshState.activeTabId) {
      console.log('[RefreshIQ] Restoring refresh for tab', refreshState.activeTabId);
      refreshManager.schedule(refreshState.activeTabId, refreshState.config);
    }
    const schedules = await storage.getSchedules();
    if (schedules) {
      schedules.filter((s) => s.active).forEach((s) => alarmManager.addSchedule(s));
    }
  } catch (e) {
    console.error('[RefreshIQ] restoreState failed', e);
  }
}

// ─── Message handler ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (msg: Message, sender, sendResponse) => {
    handleMessage(msg, sender, sendResponse);
    return true; // keep channel open for async
  },
);

async function handleMessage(
  msg: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (r?: unknown) => void,
) {
  try {
    switch (msg.type) {
      case MsgType.PING:
        sendResponse({ pong: true, ts: Date.now() });
        break;

      case MsgType.START_REFRESH: {
        const { tabId, config } = msg.payload as TabRefreshPayload;
        refreshManager.schedule(tabId, config);
        await persistRefreshStatus('running', tabId, config);
        sendResponse({ ok: true });
        break;
      }

      case MsgType.STOP_REFRESH: {
        const { tabId } = msg.payload as { tabId: number };
        refreshManager.cancel(tabId);
        await persistRefreshStatus('idle', null, null);
        sendResponse({ ok: true });
        break;
      }

      case MsgType.PAUSE_REFRESH: {
        const { tabId } = msg.payload as { tabId: number };
        refreshManager.pause(tabId);
        await persistRefreshStatus('paused', tabId, null);
        sendResponse({ ok: true });
        break;
      }

      case MsgType.START_MONITOR: {
        const { tabId, rules } = msg.payload as { tabId: number; rules: MonitorPayload['rules'] };
        if (tabId) {
          await chrome.tabs.sendMessage(tabId, { type: MsgType.START_MONITOR, payload: { rules } });
        }
        sendResponse({ ok: true });
        break;
      }

      case MsgType.STOP_MONITOR: {
        const { tabId } = msg.payload as { tabId: number };
        if (tabId) {
          await chrome.tabs.sendMessage(tabId, { type: MsgType.STOP_MONITOR });
        }
        sendResponse({ ok: true });
        break;
      }

      case MsgType.MONITOR_MATCH: {
        const payload = msg.payload as { ruleId: string; matched: string; url: string };
        await sendNotification(`Match found!`, `"${payload.matched}" detected on ${payload.url}`);
        sendResponse({ ok: true });
        break;
      }

      default:
        sendResponse({ ok: false, error: 'Unknown message type' });
    }
  } catch (e) {
    console.error('[RefreshIQ] handleMessage error', e);
    sendResponse({ ok: false, error: String(e) });
  }
}

// ─── Alarm handler ────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('[RefreshIQ] Alarm fired:', alarm.name);

  if (alarm.name.startsWith('riq_alarm_refresh_')) {
    const tabId = parseInt(alarm.name.replace('riq_alarm_refresh_', ''), 10);
    if (isNaN(tabId)) return;
    await handleRefreshTick(tabId);
  } else if (alarm.name.startsWith('riq_alarm_schedule_')) {
    const scheduleId = alarm.name.replace('riq_alarm_schedule_', '');
    await handleScheduleTick(scheduleId);
  }
});

async function handleRefreshTick(tabId: number) {
  try {
    const refreshState = await storage.getRefreshState();
    if (!refreshState || refreshState.status !== 'running') return;

    const config = refreshState.config;

    // Check time window
    if (config.timeWindowActive) {
      if (!isWithinTimeWindow(config.timeWindowStart, config.timeWindowEnd)) {
        console.log('[RefreshIQ] Outside time window, skipping refresh');
        return;
      }
    }

    // Check max refreshes
    const newCount = refreshState.refreshCount + 1;
    if (config.maxRefreshes && newCount > config.maxRefreshes) {
      refreshManager.cancel(tabId);
      await persistRefreshStatus('idle', null, null);
      await sendNotification('RefreshIQ Pro', `Stopped after ${config.maxRefreshes} refreshes`);
      return;
    }

    // Perform the refresh
    const bypassCache = config.hardRefresh || config.cacheBypass;
    await chrome.tabs.reload(tabId, { bypassCache });

    // Calculate next refresh time
    const interval  = computeInterval(config);
    const nextAt    = Date.now() + interval * 1000;

    // Update state
    await storage.setRefreshState({
      ...refreshState,
      refreshCount:  newCount,
      nextRefreshAt: nextAt,
    });

    // Reschedule
    refreshManager.scheduleNext(tabId, config, interval);

    // Notify popup
    try {
      await chrome.runtime.sendMessage({
        type:    MsgType.REFRESH_TICK,
        payload: { nextRefreshAt: nextAt, refreshCount: newCount, tabId },
      });
    } catch { /* popup may be closed */ }

  } catch (e) {
    console.error('[RefreshIQ] handleRefreshTick error', e);
  }
}

async function handleScheduleTick(scheduleId: string) {
  const schedules = await storage.getSchedules();
  const schedule  = schedules?.find((s) => s.id === scheduleId);
  if (!schedule?.active) return;

  const dayOfWeek = new Date().getDay();
  if (!schedule.days.includes(dayOfWeek)) return;

  if (schedule.targetTabId) {
    await chrome.tabs.reload(schedule.targetTabId, { bypassCache: false });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeInterval(config: RefreshConfig): number {
  if (config.mode === 'random') {
    return randomInt(config.randomMin, config.randomMax);
  }
  return config.fixedInterval;
}

async function persistRefreshStatus(
  status: 'idle' | 'running' | 'paused',
  tabId:  number | null,
  config: RefreshConfig | null,
) {
  const current = await storage.getRefreshState();
  await storage.setRefreshState({
    status,
    refreshCount:  current?.refreshCount ?? 0,
    nextRefreshAt: status === 'running' ? (current?.nextRefreshAt ?? null) : null,
    activeTabId:   tabId,
    config:        config ?? current?.config ?? {} as RefreshConfig,
  });
}

async function sendNotification(title: string, body: string) {
  try {
    const settings = await storage.getSettings();
    if (settings && !settings.notifications.browserEnabled) return;

    chrome.notifications.create({
      type:     'basic',
      iconUrl:  chrome.runtime.getURL('src/assets/icons/icon48.png'),
      title,
      message:  body,
      priority: 2,
    });
  } catch (e) {
    console.error('[RefreshIQ] sendNotification failed', e);
  }
}

// ─── Context menu ─────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id:       'riq-refresh-tab',
    title:    'RefreshIQ: Start Auto Refresh',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id:       'riq-monitor-text',
    title:    'RefreshIQ: Monitor selected text',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'riq-refresh-tab') {
    const config = (await storage.getRefreshState())?.config;
    if (config) refreshManager.schedule(tab.id, config);
  }
  if (info.menuItemId === 'riq-monitor-text' && info.selectionText) {
    console.log('[RefreshIQ] Monitor text:', info.selectionText);
    // Would open popup with pre-filled monitor rule
  }
});

// ─── Tab removed: cleanup ────────────────────────────────────────────────────
chrome.tabs.onRemoved.addListener((tabId) => {
  refreshManager.cancel(tabId);
});
