import type { ScheduleConfig } from '../shared/types';
import { ALARM_SCHEDULE } from '../shared/constants';

/**
 * AlarmManager — manages cron-like schedules for the timer tab.
 * Schedules chrome.alarms on a minutely basis and checks conditions on tick.
 */
export class AlarmManager {
  private schedules = new Map<string, ScheduleConfig>();

  addSchedule(schedule: ScheduleConfig): void {
    this.schedules.set(schedule.id, schedule);
    // Fire every minute, condition checked at tick
    chrome.alarms.create(ALARM_SCHEDULE(schedule.id), {
      periodInMinutes: 1,
      delayInMinutes:  0,
    });
    console.log(`[RefreshIQ] Added schedule ${schedule.id}`);
  }

  removeSchedule(id: string): void {
    this.schedules.delete(id);
    chrome.alarms.clear(ALARM_SCHEDULE(id));
    console.log(`[RefreshIQ] Removed schedule ${id}`);
  }

  getSchedule(id: string): ScheduleConfig | undefined {
    return this.schedules.get(id);
  }

  /** Check if right now matches the schedule config */
  shouldFire(schedule: ScheduleConfig): boolean {
    const now     = new Date();
    const day     = now.getDay();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    if (!schedule.days.includes(day)) return false;
    if (timeStr < schedule.startTime)  return false;
    if (timeStr >= schedule.stopTime)  return false;
    return true;
  }

  listActive(): ScheduleConfig[] {
    return [...this.schedules.values()].filter((s) => s.active);
  }
}

/** Parse a simplified cron expression into delayInMinutes.
 *  Supports: * /N N patterns for minute and hour fields only.
 *  Full cron engine would use croner library in a non-SW context.
 */
export function parseCronToMinutes(expr: string): number {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 2) return 30;

  const [minute, hour] = parts;
  // Every N minutes: "*/N * * * *"
  if (minute.startsWith('*/')) {
    return parseInt(minute.slice(2), 10) || 30;
  }
  // Every hour at minute 0: "0 * * * *"
  if (minute === '0' && hour === '*') {
    return 60;
  }
  // Every N hours: "0 */N * * *"
  if (minute === '0' && hour.startsWith('*/')) {
    return (parseInt(hour.slice(2), 10) || 1) * 60;
  }
  return 30;
}
