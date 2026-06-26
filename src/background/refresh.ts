import type { RefreshConfig } from '../shared/types';
import { ALARM_REFRESH } from '../shared/constants';
import { randomInt } from '../shared/utils';

/**
 * RefreshManager — coordinates per-tab alarm-based refresh scheduling.
 * MV3 service workers are ephemeral; all state lives in chrome.alarms + chrome.storage.
 */
export class RefreshManager {
  private activeTabIds = new Set<number>();
  private pausedTabIds = new Set<number>();

  schedule(tabId: number, config: RefreshConfig): void {
    this.cancel(tabId); // clear existing
    this.pausedTabIds.delete(tabId);
    this.activeTabIds.add(tabId);

    const intervalSec = this.computeInterval(config);
    chrome.alarms.create(ALARM_REFRESH(tabId), {
      delayInMinutes: intervalSec / 60,
    });
    console.log(`[RefreshIQ] Scheduled tab ${tabId} every ${intervalSec}s`);
  }

  /** Schedule the NEXT alarm after a tick (allows dynamic interval changes) */
  scheduleNext(tabId: number, config: RefreshConfig, overrideInterval?: number): void {
    if (!this.activeTabIds.has(tabId)) return;
    const intervalSec = overrideInterval ?? this.computeInterval(config);
    chrome.alarms.create(ALARM_REFRESH(tabId), {
      delayInMinutes: intervalSec / 60,
    });
  }

  pause(tabId: number): void {
    this.pausedTabIds.add(tabId);
    chrome.alarms.clear(ALARM_REFRESH(tabId));
    console.log(`[RefreshIQ] Paused tab ${tabId}`);
  }

  resume(tabId: number, config: RefreshConfig): void {
    if (!this.pausedTabIds.has(tabId)) return;
    this.pausedTabIds.delete(tabId);
    this.schedule(tabId, config);
    console.log(`[RefreshIQ] Resumed tab ${tabId}`);
  }

  cancel(tabId: number): void {
    this.activeTabIds.delete(tabId);
    this.pausedTabIds.delete(tabId);
    chrome.alarms.clear(ALARM_REFRESH(tabId));
    console.log(`[RefreshIQ] Cancelled tab ${tabId}`);
  }

  cancelAll(): void {
    for (const tabId of this.activeTabIds) {
      chrome.alarms.clear(ALARM_REFRESH(tabId));
    }
    this.activeTabIds.clear();
    this.pausedTabIds.clear();
  }

  isActive(tabId: number): boolean  { return this.activeTabIds.has(tabId); }
  isPaused(tabId: number): boolean  { return this.pausedTabIds.has(tabId); }
  getActiveTabs(): number[]         { return [...this.activeTabIds]; }

  private computeInterval(config: RefreshConfig): number {
    switch (config.mode) {
      case 'random':
        return randomInt(
          Math.max(1, config.randomMin),
          Math.max(2, config.randomMax),
        );
      case 'fixed':
      default:
        return Math.max(5, config.fixedInterval);
    }
  }
}
