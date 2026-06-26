import { randomInt, formatDuration, formatCountdown, clamp, generateId, truncateUrl } from '../../src/shared/utils';
import { parseCronToMinutes } from '../../src/background/alarms';

describe('utils', () => {
  describe('randomInt', () => {
    it('returns value within range inclusive', () => {
      for (let i = 0; i < 200; i++) {
        const n = randomInt(10, 20);
        expect(n).toBeGreaterThanOrEqual(10);
        expect(n).toBeLessThanOrEqual(20);
      }
    });
    it('handles equal min/max', () => expect(randomInt(7, 7)).toBe(7));
  });

  describe('formatDuration', () => {
    it('formats seconds', ()   => expect(formatDuration(5)).toBe('5s'));
    it('formats minutes',  ()  => expect(formatDuration(90)).toBe('1m 30s'));
    it('formats hours',    ()  => expect(formatDuration(3600)).toBe('1h'));
    it('formats h+m',      ()  => expect(formatDuration(3660)).toBe('1h 1m'));
  });

  describe('formatCountdown', () => {
    it('formats 0ms',   () => expect(formatCountdown(0)).toBe('00:00'));
    it('formats 65s',   () => expect(formatCountdown(65000)).toBe('01:05'));
    it('clamps negatives', () => expect(formatCountdown(-500)).toBe('00:00'));
  });

  describe('clamp', () => {
    it('clamps below min', () => expect(clamp(-5, 0, 10)).toBe(0));
    it('clamps above max', () => expect(clamp(20, 0, 10)).toBe(10));
    it('passes through',   () => expect(clamp(5, 0, 10)).toBe(5));
  });

  describe('generateId', () => {
    it('returns a non-empty string', () => expect(generateId()).toBeTruthy());
    it('returns unique IDs',         () => expect(generateId()).not.toBe(generateId()));
  });

  describe('truncateUrl', () => {
    it('truncates long URLs',    () => expect(truncateUrl('https://example.com/a/b/c/d/e/f/g/h', 20).length).toBeLessThanOrEqual(21));
    it('keeps short URLs whole', () => expect(truncateUrl('https://x.com/path', 40)).toContain('x.com'));
    it('handles invalid URLs',   () => expect(truncateUrl('not-a-url', 5)).toContain('…'));
  });
});

describe('parseCronToMinutes', () => {
  it('parses */5 as 5 minutes',    () => expect(parseCronToMinutes('*/5 * * * *')).toBe(5));
  it('parses */30 as 30 minutes',  () => expect(parseCronToMinutes('*/30 * * * *')).toBe(30));
  it('parses hourly cron',         () => expect(parseCronToMinutes('0 * * * *')).toBe(60));
  it('parses every 2 hours',       () => expect(parseCronToMinutes('0 */2 * * *')).toBe(120));
  it('defaults to 30 for unknown', () => expect(parseCronToMinutes('bad')).toBe(30));
});
