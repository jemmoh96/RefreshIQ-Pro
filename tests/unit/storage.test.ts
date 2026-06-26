import { generateId, truncate, relativeTime } from '../../src/shared/utils';

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('Hello world this is a long string', 10);
    expect(result).toBe('Hello worl…');
    expect(result.length).toBeLessThanOrEqual(11);
  });

  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('handles exactly max length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('relativeTime', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows "just now" for < 5s', () => {
    jest.setSystemTime(1000);
    expect(relativeTime(998)).toBe('just now');
  });

  it('shows seconds for < 60s', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    expect(relativeTime(now - 30000)).toContain('s ago');
  });

  it('shows minutes for < 1h', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    expect(relativeTime(now - 120000)).toContain('m ago');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, generateId));
    expect(ids.size).toBe(1000);
  });

  it('only contains alphanumeric chars', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});
