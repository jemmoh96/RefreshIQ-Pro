import type { MonitorRule } from '../shared/types';
import { MsgType } from '../shared/types';
import { escapeRegex } from '../shared/utils';
import { highlightElements, scrollToFirst, ensureStyles } from './highlighter';

type CleanupFn = () => void;

export class MonitorEngine {
  private rules      = new Map<string, MonitorRule>();
  private cleanupFns = new Map<string, CleanupFn>();
  private observer:  MutationObserver | null = null;
  private delayTimers = new Map<string, ReturnType<typeof setTimeout>>();

  startRule(rule: MonitorRule): void {
    this.stopRule(rule.id);
    this.rules.set(rule.id, rule);

    const delay = (rule.postLoadDelay ?? 0) * 1000;

    const timer = setTimeout(() => {
      this.attachObserver(rule);
      // Run once immediately
      this.check(rule);
    }, delay);

    this.delayTimers.set(rule.id, timer);
  }

  stopRule(id: string): void {
    const timer = this.delayTimers.get(id);
    if (timer) { clearTimeout(timer); this.delayTimers.delete(id); }
    const cleanup = this.cleanupFns.get(id);
    if (cleanup) { cleanup(); this.cleanupFns.delete(id); }
    this.rules.delete(id);
    if (this.rules.size === 0) this.disconnectObserver();
  }

  stopAll(): void {
    this.rules.forEach((_, id) => this.stopRule(id));
  }

  // ─── Core check ────────────────────────────────────────────────────────────

  private check(rule: MonitorRule): void {
    const matched = this.evaluate(rule);
    if (matched.elements.length > 0) {
      this.onMatch(rule, matched);
    }
  }

  private evaluate(rule: MonitorRule): { elements: Element[]; text: string } {
    try {
      switch (rule.mode) {
        case 'text':  return this.evalText(rule);
        case 'regex': return this.evalRegex(rule);
        case 'css':   return this.evalCss(rule);
        case 'xpath': return this.evalXpath(rule);
        case 'dom':   return this.evalDom(rule);
        default:      return { elements: [], text: '' };
      }
    } catch (e) {
      console.warn('[RefreshIQ Monitor] evaluate error', rule.mode, e);
      return { elements: [], text: '' };
    }
  }

  private evalText(rule: MonitorRule) {
    const needle  = rule.caseSensitive ? rule.target : rule.target.toLowerCase();
    const body    = document.body;
    const walker  = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const matches: Element[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const content = rule.caseSensitive ? node.textContent ?? '' : (node.textContent ?? '').toLowerCase();
      if (content.includes(needle) && node.parentElement) {
        matches.push(node.parentElement);
      }
    }
    return { elements: matches, text: rule.target };
  }

  private evalRegex(rule: MonitorRule) {
    const flags   = rule.caseSensitive ? 'g' : 'gi';
    const re      = new RegExp(rule.target, flags);
    const body    = document.body;
    const walker  = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const matches: Element[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      re.lastIndex = 0;
      if (re.test(node.textContent ?? '') && node.parentElement) {
        matches.push(node.parentElement);
      }
    }
    return { elements: matches, text: rule.target };
  }

  private evalCss(rule: MonitorRule) {
    const elements = [...document.querySelectorAll(rule.target)];
    return { elements, text: rule.target };
  }

  private evalXpath(rule: MonitorRule) {
    const result  = document.evaluate(rule.target, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const elements: Element[] = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (node instanceof Element) elements.push(node);
      else if (node instanceof Text && node.parentElement) elements.push(node.parentElement);
    }
    return { elements, text: rule.target };
  }

  private evalDom(rule: MonitorRule) {
    // DOM mode: just check if the element exists
    const elements = [...document.querySelectorAll(rule.target)];
    return { elements, text: rule.target };
  }

  // ─── Observer ──────────────────────────────────────────────────────────────

  private attachObserver(rule: MonitorRule): void {
    if (!this.observer) {
      this.observer = new MutationObserver(this.onMutation.bind(this));
      this.observer.observe(document.body, {
        childList:    true,
        subtree:      true,
        characterData: true,
        attributes:   false,
      });
    }
  }

  private disconnectObserver(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private onMutation(_mutations: MutationRecord[]): void {
    // Re-check all active rules on any DOM mutation
    this.rules.forEach((rule) => this.check(rule));
  }

  // ─── On match ──────────────────────────────────────────────────────────────

  private onMatch(rule: MonitorRule, matched: { elements: Element[]; text: string }): void {
    console.log(`[RefreshIQ Monitor] Match: rule=${rule.id} target="${rule.target}"`);

    if (rule.highlightMatches) {
      ensureStyles();
      highlightElements(matched.elements);
    }
    if (rule.scrollToMatch) {
      scrollToFirst(matched.elements);
    }
    if (rule.autoClickSelector) {
      this.autoClick(rule.autoClickSelector);
    }

    // Notify background
    chrome.runtime.sendMessage({
      type: MsgType.MONITOR_MATCH,
      payload: {
        ruleId:    rule.id,
        matched:   matched.text,
        url:       location.href,
        timestamp: Date.now(),
      },
    }).catch(() => {});

    // Stop watching after first match (rule-level: continue or stop based on settings)
    this.stopRule(rule.id);
  }

  private autoClick(selector: string): void {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        el.click();
        console.log(`[RefreshIQ] Auto-clicked: ${selector}`);
      }
    } catch (e) {
      console.warn('[RefreshIQ] autoClick failed', e);
    }
  }
}
