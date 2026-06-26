/**
 * RefreshIQ Pro — Content Script
 * Runs in every page. Receives messages from background SW to start/stop monitoring.
 */

import type { Message, MonitorRule } from '../shared/types';
import { MsgType } from '../shared/types';
import { MonitorEngine } from './monitor';

const engine = new MonitorEngine();
let activityTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Message listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse) => {
    handleMessage(msg, sendResponse);
    return true;
  },
);

function handleMessage(
  msg: Message,
  sendResponse: (r?: unknown) => void,
) {
  switch (msg.type) {
    case MsgType.START_MONITOR: {
      const { rules } = msg.payload as { rules: MonitorRule[] };
      rules.forEach((r) => engine.startRule(r));
      sendResponse({ ok: true, rulesStarted: rules.length });
      break;
    }
    case MsgType.STOP_MONITOR: {
      const payload = msg.payload as { ruleId?: string } | undefined;
      if (payload?.ruleId) engine.stopRule(payload.ruleId);
      else                 engine.stopAll();
      sendResponse({ ok: true });
      break;
    }
    case MsgType.PING:
      sendResponse({ pong: true, url: location.href });
      break;
    default:
      sendResponse({ ok: false, error: 'unknown type' });
  }
}

// ─── Activity detection: notify background to pause refresh ──────────────────
function notifyActivity() {
  if (activityTimer) return; // debounce
  activityTimer = setTimeout(() => {
    activityTimer = null;
    chrome.runtime.sendMessage({
      type:    MsgType.PAGE_REFRESHED,
      payload: { userActivity: true, url: location.href },
    }).catch(() => {});
  }, 500);
}

document.addEventListener('mousemove',  notifyActivity, { passive: true });
document.addEventListener('keydown',    notifyActivity, { passive: true });
document.addEventListener('scroll',     notifyActivity, { passive: true });
document.addEventListener('touchstart', notifyActivity, { passive: true });

// ─── Captcha detection ────────────────────────────────────────────────────────
function detectCaptcha() {
  const indicators = [
    'cf-challenge',      // Cloudflare
    'g-recaptcha',       // reCAPTCHA
    'h-captcha',         // hCaptcha
    'cf-im-under-attack', // Cloudflare under attack
  ];
  const found = indicators.some(
    (id) => document.getElementById(id) || document.querySelector(`[class*="${id}"]`),
  );
  if (found) {
    chrome.runtime.sendMessage({
      type:    MsgType.PAGE_REFRESHED,
      payload: { captchaDetected: true, url: location.href },
    }).catch(() => {});
    console.warn('[RefreshIQ] Captcha detected on', location.href);
  }
}

// Run captcha check after page fully loads
if (document.readyState === 'complete') {
  detectCaptcha();
} else {
  window.addEventListener('load', detectCaptcha);
}

// ─── HTTP error detection via page title ─────────────────────────────────────
function detectErrorPage() {
  const errorCodes = ['403', '404', '500', '502', '503'];
  const title = document.title;
  const found = errorCodes.find((code) => title.includes(code));
  if (found) {
    chrome.runtime.sendMessage({
      type:    MsgType.PAGE_REFRESHED,
      payload: { errorCode: found, url: location.href },
    }).catch(() => {});
  }
}

if (document.readyState === 'complete') {
  detectErrorPage();
} else {
  window.addEventListener('load', detectErrorPage);
}

console.log('[RefreshIQ] Content script ready on', location.href);
