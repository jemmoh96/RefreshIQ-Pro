# RefreshIQ Pro

> Enterprise auto-refresh and website monitoring — free, privacy-first, local-only.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Features

| Feature | Status |
|---|---|
| Fixed / Random / Cron refresh | ✅ |
| Animated countdown ring | ✅ |
| Text, Regex, CSS, XPath, DOM monitoring | ✅ |
| Multi-tab manager with groups | ✅ |
| Scheduling with day/time windows | ✅ |
| Browser notifications + sound | ✅ |
| Discord / Slack / Telegram webhooks | ✅ |
| Auto-click on match | ✅ |
| Hard refresh + cache bypass | ✅ |
| Stop on user activity | ✅ |
| Stop after N refreshes | ✅ |
| Captcha detection | ✅ |
| HTTP error detection | ✅ |
| Dark SaaS UI / glassmorphism | ✅ |
| Import / Export settings | ✅ |
| Session recovery | ✅ |
| Manifest V3 | ✅ |
| Chrome, Edge, Brave, Opera, Arc | ✅ |
| WCAG AA accessible | ✅ |
| Zero telemetry / no cloud | ✅ |
| Visual workflow builder | 🔜 v1.1 |
| AI assistant | 🔜 v1.2 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Install & Build

```bash
git clone https://github.com/your-org/refreshiq-pro
cd refreshiq-pro
npm install
npm run build
```

### Load in Chrome / Edge / Brave

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Click the puzzle icon in Chrome toolbar → pin **RefreshIQ Pro**

### Development

```bash
npm run dev         # Vite dev server with HMR
npm test            # Unit + component tests
npm run test:e2e    # Playwright E2E (requires build)
npm run type-check  # TypeScript check
npm run lint        # ESLint
```

---

## Architecture

```
src/
├── popup/              # React popup (460px)
│   ├── App.tsx         # Root + tab routing
│   ├── components/     # Shared UI components
│   │   ├── Header.tsx
│   │   ├── NavTabs.tsx
│   │   ├── CountdownRing.tsx  ← Animated SVG ring
│   │   ├── Toggle.tsx
│   │   └── StatusBadge.tsx
│   └── tabs/
│       ├── IntervalTab.tsx    ← Fixed/Random/Cron refresh
│       ├── TimerTab.tsx       ← Schedule with day/time window
│       ├── TabsTab.tsx        ← Multi-tab manager
│       └── MonitorTab.tsx     ← Change detection rules
│
├── background/
│   ├── service-worker.ts   ← MV3 SW: alarms, refresh, messages
│   ├── refresh.ts          ← RefreshManager (per-tab alarm scheduling)
│   └── alarms.ts           ← AlarmManager (schedule ticks)
│
├── content/
│   ├── content.ts          ← Content script entry
│   ├── monitor.ts          ← MonitorEngine (MutationObserver)
│   └── highlighter.ts      ← DOM highlight injection
│
├── options/
│   └── Options.tsx         ← Full settings page
│
├── store/                  ← Zustand state
│   ├── refreshStore.ts
│   ├── monitorStore.ts
│   ├── tabsStore.ts
│   └── settingsStore.ts
│
└── shared/
    ├── types.ts            ← All TypeScript types
    ├── constants.ts        ← Presets, keys, defaults
    ├── storage.ts          ← chrome.storage abstraction
    ├── messaging.ts        ← Type-safe chrome.runtime messaging
    └── utils.ts            ← Pure utility functions
```

### State flow

```
Popup (Zustand) ──write──► chrome.storage.local ◄──read── Service Worker
     ▲                           │
     │                           │ onChanged
     └──── hydrate ──────────────┘
```

Messages flow:
- **Popup → Background**: `chrome.runtime.sendMessage(START_REFRESH | STOP_REFRESH | ...)`
- **Background → Popup**: `chrome.runtime.sendMessage(REFRESH_TICK)`
- **Background → Content**: `chrome.tabs.sendMessage(START_MONITOR | STOP_MONITOR)`
- **Content → Background**: `chrome.runtime.sendMessage(MONITOR_MATCH | PAGE_REFRESHED)`

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--riq-bg` | `#0b0f1a` | Page background |
| `--riq-surface` | `#141929` | Cards |
| `--riq-elevated` | `#1a2038` | Inputs, elevated cards |
| `--riq-border` | `#252d4a` | Borders |
| `--riq-green` | `#22c55e` | Primary accent, active states |
| `--riq-amber` | `#f59e0b` | Toggles, warnings |
| `--riq-text` | `#e2e8ff` | Primary text |
| `--riq-muted` | `#6b7ab8` | Secondary text, labels |

---

## Security

- **Manifest V3** — no persistent background pages, strict CSP
- **Least-privilege permissions** — only what's needed
- **No remote code** — all logic bundled locally
- **No telemetry** — zero outbound requests (except user-configured webhooks)
- **Content script sandboxing** — CSP-compliant, no privilege escalation
- **OWASP** checklist reviewed

### Permissions justification

| Permission | Reason |
|---|---|
| `tabs` | Read URL/title for tab manager |
| `alarms` | Schedule refresh timers (MV3 requires alarms, not setInterval) |
| `storage` | Persist settings and state locally |
| `notifications` | Send OS notifications on match |
| `scripting` | Inject monitor content script on demand |
| `webNavigation` | Detect redirects and SPA navigation |
| `contextMenus` | Right-click → start monitoring selected text |

---

## Performance Targets

| Metric | Target | Achieved |
|---|---|---|
| Popup open time | < 100ms | ✅ (lazy loaded) |
| CPU at idle | < 0.1% | ✅ (alarm-based, no polling) |
| CPU monitoring | < 1% | ✅ (MutationObserver) |
| Memory | < 50MB | ✅ |
| Bundle size | < 500KB | ✅ |

---

## Testing

```bash
npm test                    # All unit + component tests
npm run test:coverage       # With coverage report
npm run test:e2e            # Playwright E2E (build first)
```

Coverage targets: 80%+ for core logic (utils, stores, monitor engine).

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push and open a PR

---

## License

MIT © RefreshIQ Pro contributors
