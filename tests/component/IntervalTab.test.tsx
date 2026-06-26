/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRefreshStore } from '../../src/store/refreshStore';
import { REFRESH_PRESETS } from '../../src/shared/constants';

// Mock chrome APIs
const mockSendMessage = jest.fn().mockResolvedValue({ ok: true });
const mockQuery       = jest.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]);

(global as unknown as Record<string, unknown>).chrome = {
  runtime: { sendMessage: mockSendMessage },
  tabs:    { query: mockQuery },
};

// Minimal mock of IntervalTab to test store interactions
describe('useRefreshStore', () => {
  beforeEach(() => {
    useRefreshStore.getState().reset();
    jest.clearAllMocks();
  });

  it('starts with idle status', () => {
    expect(useRefreshStore.getState().status).toBe('idle');
  });

  it('setConfig updates interval correctly', () => {
    useRefreshStore.getState().setConfig({ fixedInterval: 60 });
    expect(useRefreshStore.getState().config.fixedInterval).toBe(60);
  });

  it('setConfig updates mode', () => {
    useRefreshStore.getState().setConfig({ mode: 'random' });
    expect(useRefreshStore.getState().config.mode).toBe('random');
  });

  it('stopRefresh returns to idle', async () => {
    useRefreshStore.setState({ status: 'running', activeTabId: 1 });
    await useRefreshStore.getState().stopRefresh();
    expect(useRefreshStore.getState().status).toBe('idle');
    expect(useRefreshStore.getState().nextRefreshAt).toBeNull();
  });

  it('pauseRefresh sets paused status', async () => {
    useRefreshStore.setState({ status: 'running', activeTabId: 1 });
    await useRefreshStore.getState().pauseRefresh();
    expect(useRefreshStore.getState().status).toBe('paused');
  });

  it('incrementCount increases count by 1', () => {
    useRefreshStore.setState({ refreshCount: 5 });
    useRefreshStore.getState().incrementCount();
    expect(useRefreshStore.getState().refreshCount).toBe(6);
  });

  it('hydrate merges partial state', () => {
    useRefreshStore.getState().hydrate({ refreshCount: 42, status: 'paused' });
    expect(useRefreshStore.getState().refreshCount).toBe(42);
    expect(useRefreshStore.getState().status).toBe('paused');
  });

  it('reset returns to default state', () => {
    useRefreshStore.setState({ refreshCount: 99, status: 'running' });
    useRefreshStore.getState().reset();
    expect(useRefreshStore.getState().refreshCount).toBe(0);
    expect(useRefreshStore.getState().status).toBe('idle');
  });
});

describe('useMonitorStore', () => {
  const { useMonitorStore } = require('../../src/store/monitorStore');

  beforeEach(() => {
    useMonitorStore.setState({ rules: [], globalActive: false });
    jest.clearAllMocks();
  });

  it('adds a rule with generated id', () => {
    const id = useMonitorStore.getState().addRule({ target: 'In Stock', mode: 'text' });
    expect(id).toBeTruthy();
    expect(useMonitorStore.getState().rules).toHaveLength(1);
    expect(useMonitorStore.getState().rules[0].target).toBe('In Stock');
  });

  it('removes a rule by id', () => {
    const id = useMonitorStore.getState().addRule({ target: 'Test', mode: 'text', tabId: null });
    useMonitorStore.getState().removeRule(id);
    expect(useMonitorStore.getState().rules).toHaveLength(0);
  });

  it('updates a rule by id', () => {
    const id = useMonitorStore.getState().addRule({ target: 'Old', mode: 'text' });
    useMonitorStore.getState().updateRule(id, { target: 'New' });
    expect(useMonitorStore.getState().rules[0].target).toBe('New');
  });

  it('marks a rule as matched', () => {
    const id = useMonitorStore.getState().addRule({ target: 'Test', mode: 'text' });
    useMonitorStore.getState().markMatched(id, 'Test');
    const rule = useMonitorStore.getState().rules[0];
    expect(rule.status).toBe('matched');
    expect(rule.matchCount).toBe(1);
  });

  it('clears match count on clearMatches', () => {
    const id = useMonitorStore.getState().addRule({ target: 'Test', mode: 'text' });
    useMonitorStore.getState().markMatched(id, 'Test');
    useMonitorStore.getState().clearMatches(id);
    expect(useMonitorStore.getState().rules[0].matchCount).toBe(0);
    expect(useMonitorStore.getState().rules[0].status).toBe('watching');
  });
});

describe('REFRESH_PRESETS', () => {
  it('are sorted by value ascending', () => {
    const values = REFRESH_PRESETS.map((p) => p.value);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it('contains common intervals', () => {
    const values = REFRESH_PRESETS.map((p) => p.value);
    expect(values).toContain(5);
    expect(values).toContain(30);
    expect(values).toContain(60);
    expect(values).toContain(3600);
  });
});
