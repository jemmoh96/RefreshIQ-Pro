import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge tailwind classes cleanly */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds into human-readable string */
export function formatDuration(seconds: number): string {
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format ms countdown as mm:ss */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format epoch timestamp as relative time */
export function relativeTime(epoch: number): string {
  const delta = (Date.now() - epoch) / 1000;
  if (delta < 5)    return 'just now';
  if (delta < 60)   return `${Math.round(delta)}s ago`;
  if (delta < 3600) return `${Math.round(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.round(delta / 3600)}h ago`;
  return `${Math.round(delta / 86400)}d ago`;
}

/** Generate a short random ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Get a random int between min and max inclusive */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Truncate URL for display */
export function truncateUrl(url: string, max = 40): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > max ? display.slice(0, max) + '…' : display;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

/** Truncate a string */
export function truncate(str: string, max = 30): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/** Parse HH:mm time string to today's epoch ms */
export function timeToEpochToday(time: string, tz?: string): number {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  return d.getTime();
}

/** Check if current time is within a window */
export function isWithinTimeWindow(startTime: string, endTime: string): boolean {
  const now    = Date.now();
  const start  = timeToEpochToday(startTime);
  let   end    = timeToEpochToday(endTime);
  if (end < start) end += 86400000; // overnight window
  return now >= start && now <= end;
}

/** Escape string for use in regex */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Validate a CSS selector */
export function isValidSelector(selector: string): boolean {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

/** Deep-merge two objects */
export function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const val = override[key];
    if (val !== undefined) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        result[key] = deepMerge(base[key] as object, val as object) as T[typeof key];
      } else {
        result[key] = val as T[typeof key];
      }
    }
  }
  return result;
}

/** Get the favicon URL for a page URL */
export function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/favicon.ico`;
  } catch {
    return '';
  }
}
