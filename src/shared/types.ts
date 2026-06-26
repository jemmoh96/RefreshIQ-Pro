// ─── Refresh ──────────────────────────────────────────────────────────────────

export type RefreshMode = 'fixed' | 'random' | 'scheduled';
export type RefreshStatus = 'idle' | 'running' | 'paused' | 'error';

export interface RefreshConfig {
  mode: RefreshMode;
  fixedInterval: number;       // seconds
  randomMin: number;
  randomMax: number;
  cronExpression: string;
  hardRefresh: boolean;
  cacheBypass: boolean;
  maxRefreshes: number | null;
  stopOnActivity: boolean;
  postLoadDelay: number;       // ms
  timeWindowActive: boolean;
  timeWindowStart: string;     // HH:mm
  timeWindowEnd: string;       // HH:mm
}

export interface RefreshState {
  status: RefreshStatus;
  refreshCount: number;
  nextRefreshAt: number | null; // epoch ms
  activeTabId: number | null;
  config: RefreshConfig;
}

// ─── Monitor ──────────────────────────────────────────────────────────────────

export type MonitorMode = 'text' | 'regex' | 'css' | 'xpath' | 'dom' | 'visual';
export type MonitorStatus = 'idle' | 'watching' | 'matched' | 'error';

export interface MonitorRule {
  id: string;
  tabId: number | null;
  url: string;
  label: string;
  mode: MonitorMode;
  target: string;              // keyword, regex, CSS selector, XPath
  caseSensitive: boolean;
  status: MonitorStatus;
  active: boolean;
  notifyOnMatch: boolean;
  autoClickSelector: string;
  highlightMatches: boolean;
  scrollToMatch: boolean;
  postLoadDelay: number;       // seconds
  webhookUrl: string;
  lastChecked: number | null;
  lastMatchAt: number | null;
  matchCount: number;
  createdAt: number;
}

export interface MonitorState {
  rules: MonitorRule[];
  globalActive: boolean;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduleConfig {
  id: string;
  label: string;
  startTime: string;           // HH:mm
  stopTime: string;            // HH:mm
  timezone: string;
  days: number[];              // 0=Sun, 1=Mon ... 6=Sat
  active: boolean;
  targetTabId: number | null;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  tabIds: number[];
}

export interface ManagedTab {
  id: number;
  title: string;
  url: string;
  favicon: string;
  refreshActive: boolean;
  refreshInterval: number;
  monitorActive: boolean;
  pinned: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationConfig {
  browserEnabled: boolean;
  soundEnabled: boolean;
  soundType: 'chime' | 'ping' | 'alert' | 'none';
  webhooks: WebhookConfig[];
  telegram: TelegramConfig | null;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'GET';
  platform: 'discord' | 'slack' | 'teams' | 'zapier' | 'custom';
  template: string;
  headers: Record<string, string>;
  enabled: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

// ─── Automation ───────────────────────────────────────────────────────────────

export type TriggerType = 'keyword_found' | 'price_drop' | 'element_appears'
  | 'dom_change' | 'page_load' | 'status_error';

export type ActionType = 'notify' | 'click_element' | 'send_webhook'
  | 'increase_refresh' | 'stop_refresh' | 'run_script';

export interface AutomationTrigger {
  type: TriggerType;
  config: Record<string, string | number | boolean>;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  config: Record<string, string | number | boolean>;
  delay: number; // ms
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  runCount: number;
  lastRunAt: number | null;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  extensionName: string;
  theme: 'dark' | 'system';
  accentColor: string;
  reducedMotion: boolean;
  notifications: NotificationConfig;
  automation: AutomationRule[];
  profiles: Profile[];
  activeProfileId: string | null;
  wakeLock: boolean;
  sessionRestore: boolean;
  redirectDetect: boolean;
  captchaDetect: boolean;
  version: string;
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  refreshConfig: Partial<RefreshConfig>;
  monitors: Partial<MonitorRule>[];
  schedule: Partial<ScheduleConfig> | null;
  createdAt: number;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export enum MsgType {
  // Refresh control
  START_REFRESH   = 'START_REFRESH',
  STOP_REFRESH    = 'STOP_REFRESH',
  PAUSE_REFRESH   = 'PAUSE_REFRESH',
  RESTART_REFRESH = 'RESTART_REFRESH',
  GET_TAB_STATE   = 'GET_TAB_STATE',
  TAB_STATE_UPDATE = 'TAB_STATE_UPDATE',
  REFRESH_TICK    = 'REFRESH_TICK',
  PAGE_REFRESHED  = 'PAGE_REFRESHED',

  // Monitor control
  START_MONITOR   = 'START_MONITOR',
  STOP_MONITOR    = 'STOP_MONITOR',
  MONITOR_MATCH   = 'MONITOR_MATCH',
  MONITOR_TICK    = 'MONITOR_TICK',

  // Automation
  RUN_AUTOMATION  = 'RUN_AUTOMATION',
  SCRIPT_EXEC     = 'SCRIPT_EXEC',

  // System
  PING            = 'PING',
  PONG            = 'PONG',
}

export interface Message<T = unknown> {
  type: MsgType;
  payload?: T;
  tabId?: number;
  timestamp?: number;
}

export interface TabRefreshPayload {
  tabId: number;
  config: RefreshConfig;
}

export interface MonitorPayload {
  tabId: number;
  rules: MonitorRule[];
}

export interface MonitorMatchPayload {
  tabId: number;
  ruleId: string;
  matched: string;
  url: string;
  timestamp: number;
}
