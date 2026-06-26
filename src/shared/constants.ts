export const EXTENSION_NAME = 'RefreshIQ Pro';
export const EXTENSION_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  REFRESH_STATE:  'riq_refresh_state',
  MONITOR_STATE:  'riq_monitor_state',
  SETTINGS:       'riq_settings',
  SCHEDULES:      'riq_schedules',
  TAB_GROUPS:     'riq_tab_groups',
  PROFILES:       'riq_profiles',
  SESSION:        'riq_session',
} as const;

// Alarm names
export const ALARM_PREFIX = 'riq_alarm_';
export const ALARM_REFRESH = (tabId: number) => `${ALARM_PREFIX}refresh_${tabId}`;
export const ALARM_MONITOR  = (tabId: number) => `${ALARM_PREFIX}monitor_${tabId}`;
export const ALARM_SCHEDULE = (id: string)    => `${ALARM_PREFIX}schedule_${id}`;

// Refresh interval presets (in seconds)
export const REFRESH_PRESETS = [
  { label: '5s',   value: 5 },
  { label: '10s',  value: 10 },
  { label: '15s',  value: 15 },
  { label: '30s',  value: 30 },
  { label: '1m',   value: 60 },
  { label: '5m',   value: 300 },
  { label: '10m',  value: 600 },
  { label: '15m',  value: 900 },
  { label: '30m',  value: 1800 },
  { label: '1h',   value: 3600 },
] as const;

// Monitor post-load delays
export const MONITOR_DELAYS = [
  { label: 'Instant', value: 0 },
  { label: '3s',      value: 3 },
  { label: '5s',      value: 5 },
  { label: '10s',     value: 10 },
  { label: '15s',     value: 15 },
  { label: '30s',     value: 30 },
] as const;

// Timezones (abbreviated list — full list in options)
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

// Days of week
export const DAYS_OF_WEEK = [
  { label: 'Su', full: 'Sunday',    value: 0 },
  { label: 'Mo', full: 'Monday',    value: 1 },
  { label: 'Tu', full: 'Tuesday',   value: 2 },
  { label: 'We', full: 'Wednesday', value: 3 },
  { label: 'Th', full: 'Thursday',  value: 4 },
  { label: 'Fr', full: 'Friday',    value: 5 },
  { label: 'Sa', full: 'Saturday',  value: 6 },
] as const;

// Monitor mode labels
export const MONITOR_MODE_META = {
  text:   { label: 'Text',    icon: 'type',        desc: 'Match keywords or phrases' },
  regex:  { label: 'Regex',   icon: 'code-2',      desc: 'Regular expression pattern' },
  css:    { label: 'CSS',     icon: 'hash',        desc: 'CSS selector change' },
  xpath:  { label: 'XPath',   icon: 'brackets',    desc: 'XPath expression' },
  dom:    { label: 'DOM',     icon: 'layers',      desc: 'Node added / removed' },
  visual: { label: 'Visual',  icon: 'scan-eye',    desc: 'Pixel-level page change' },
} as const;

// Webhook platform templates
export const WEBHOOK_TEMPLATES = {
  discord: '{"username":"RefreshIQ","content":"🔔 {{event}} on {{url}}"}',
  slack:   '{"text":"🔔 {{event}} on {{url}}"}',
  teams:   '{"@type":"MessageCard","text":"🔔 {{event}} on {{url}}"}',
  custom:  '{"event":"{{event}}","url":"{{url}}","matched":"{{matched}}","timestamp":"{{timestamp}}"}',
} as const;

// Default refresh config
export const DEFAULT_REFRESH_CONFIG = {
  mode:             'fixed' as const,
  fixedInterval:    30,
  randomMin:        10,
  randomMax:        60,
  cronExpression:   '*/30 * * * *',
  hardRefresh:      false,
  cacheBypass:      false,
  maxRefreshes:     null,
  stopOnActivity:   false,
  postLoadDelay:    0,
  timeWindowActive: false,
  timeWindowStart:  '08:00',
  timeWindowEnd:    '18:00',
};

// Default monitor rule
export const DEFAULT_MONITOR_RULE = {
  mode:              'text' as const,
  caseSensitive:     false,
  active:            false,
  notifyOnMatch:     true,
  autoClickSelector: '',
  highlightMatches:  true,
  scrollToMatch:     true,
  postLoadDelay:     5,
  webhookUrl:        '',
  matchCount:        0,
  lastChecked:       null,
  lastMatchAt:       null,
};

// Highlight style injected into pages
export const HIGHLIGHT_CSS = `
.riq-highlight {
  background: rgba(34,197,94,0.25) !important;
  outline: 2px solid #22c55e !important;
  outline-offset: 2px !important;
  border-radius: 3px !important;
  animation: riq-blink 1.5s ease-in-out 3 !important;
}
@keyframes riq-blink {
  0%,100% { background: rgba(34,197,94,0.25); }
  50%      { background: rgba(34,197,94,0.45); }
}
.riq-changed {
  background: rgba(245,158,11,0.2) !important;
  outline: 2px solid #f59e0b !important;
  outline-offset: 2px !important;
  border-radius: 3px !important;
}
`;
