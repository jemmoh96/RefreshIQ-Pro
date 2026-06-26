import { escapeRegex, isWithinTimeWindow, deepMerge } from '../../src/shared/utils';
import { DEFAULT_MONITOR_RULE, DEFAULT_REFRESH_CONFIG } from '../../src/shared/constants';

describe('escapeRegex', () => {
  it('escapes special chars', () => {
    const escaped = escapeRegex('price: $10.99 (sale)');
    expect(escaped).toBe('price: \\$10\\.99 \\(sale\\)');
  });
  it('passes safe strings through', () => {
    expect(escapeRegex('hello world')).toBe('hello world');
  });
});

describe('isWithinTimeWindow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true when now is inside window', () => {
    // Set time to 10:00
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    expect(isWithinTimeWindow('08:00', '18:00')).toBe(true);
  });

  it('returns false when now is outside window', () => {
    // Set time to 20:00
    jest.setSystemTime(new Date('2024-01-15T20:00:00'));
    expect(isWithinTimeWindow('08:00', '18:00')).toBe(false);
  });

  it('handles overnight windows', () => {
    // Set time to 22:00
    jest.setSystemTime(new Date('2024-01-15T22:00:00'));
    expect(isWithinTimeWindow('20:00', '06:00')).toBe(true);
  });
});

describe('deepMerge', () => {
  it('merges top-level properties', () => {
    const base     = { a: 1, b: 2 };
    const override = { b: 3, c: 4 };
    expect(deepMerge(base, override)).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('deep-merges nested objects', () => {
    const base     = { config: { a: 1, b: 2 } };
    const override = { config: { b: 99 } };
    expect(deepMerge(base, override)).toEqual({ config: { a: 1, b: 99 } });
  });

  it('does not mutate base object', () => {
    const base = { x: 1 };
    deepMerge(base, { x: 2 });
    expect(base.x).toBe(1);
  });
});

describe('DEFAULT_MONITOR_RULE constants', () => {
  it('has correct default mode', ()       => expect(DEFAULT_MONITOR_RULE.mode).toBe('text'));
  it('notifies on match by default', ()   => expect(DEFAULT_MONITOR_RULE.notifyOnMatch).toBe(true));
  it('highlights matches by default', ()  => expect(DEFAULT_MONITOR_RULE.highlightMatches).toBe(true));
  it('has 5s post-load delay', ()         => expect(DEFAULT_MONITOR_RULE.postLoadDelay).toBe(5));
});

describe('DEFAULT_REFRESH_CONFIG constants', () => {
  it('defaults to fixed mode',   () => expect(DEFAULT_REFRESH_CONFIG.mode).toBe('fixed'));
  it('defaults to 30s interval', () => expect(DEFAULT_REFRESH_CONFIG.fixedInterval).toBe(30));
  it('no hard refresh by default', () => expect(DEFAULT_REFRESH_CONFIG.hardRefresh).toBe(false));
});
