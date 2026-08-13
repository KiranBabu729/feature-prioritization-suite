# Roadmap App

The day-to-day workspace for a Product Delivery Lead: bring in client feedback, see it prioritized, plan it onto a quarterly roadmap, and export reports.

## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Features](#features)
- [Architecture](#architecture)
- [API usage](#api-usage)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20.x or later (tested on 22.16.0) |
| npm | 10.x or later |

Key dependencies (see [`package.json`](./package.json) for the full, version-pinned list):

| Package | Version | Role |
|---|---|---|
| `react` / `react-dom` | ^19.2.8 | UI |
| `vite` | ^8.2.0 | Dev server / build |
| `@hello-pangea/dnd` | ^18.0.1 | Drag-and-drop roadmap board |
| `recharts` | ^3.10.1 | Dashboard and analysis charts |
| `papaparse` | ^5.5.4 | CSV import parsing |
| `jspdf` | ^4.2.1 | PDF report export |
| `tailwindcss` | ^4.3.3 | Styling |

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` (or the next free port — Vite prints the actual URL). Sample-free by default — use **Upload CSV** or **Add Feature**, or **Clear All Features** in the Setup tab if you ever load sample/test data you want to remove.

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

### AI Prioritization

The **Run AI Prioritization** button in the Setup tab calls a scoring server over `/api/score-batch`. In dev, [`vite.config.js`](./vite.config.js) proxies `/api` to `http://localhost:4001` — start the server in [`../prioritization-studio/server`](../prioritization-studio/server) first (see its README for auth setup). Without it running, everything else in this app still works — AI scoring just reports each item as failed.

## Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `VITE_SCORING_API_BASE` | `.env` (create one; not checked in) | `""` (same-origin, relies on the dev proxy) | Base URL of the scoring server. Set this before `npm run build` if the deployed scoring server isn't reachable at the same origin — see [`src/utils/scoringApi.js`](./src/utils/scoringApi.js). |

## Features

- **Dashboard** — metric cards, top-prioritized features table, recent feedback feed
- **Analysis** — effort-vs-impact quadrant chart, quick wins / strategic bets, client tier and effort breakdowns
- **Roadmap** — drag-and-drop quarterly board with team capacity bars and a dependency list
- **Reports** — executive summary, quadrant breakdown, client sentiment, JSON/PDF export
- **Setup** — import a prioritization matrix (built in [Prioritization Studio](../prioritization-studio)), run AI-assisted scoring, and manage workspace data

CSV upload accepts both a plain feature-request format (`Feature Name, Client Name, Client Tier, Feedback Text, Complexity`) and a governance/feedback export format (`ID, Text, Category, Priority, Sentiment, Department, ...`) — the importer in [`src/utils/csv.js`](./src/utils/csv.js) auto-detects which one you're using.

## Architecture

```
src/
├── App.jsx                 Tab shell and top-level state
├── main.jsx                 Entry point
├── components/               Shared presentational pieces (badges, modals, forms, icons)
├── tabs/                      One component per top-level tab (Dashboard, Analysis, Roadmap, Reports, SetupTab)
├── data/sampleData.js         Optional sample dataset, never loaded by default
└── utils/
    ├── storage.js              localStorage read/write for the feature list (key: "roadmap-features")
    ├── matrixConfig.js          Import/apply a matrix exported from Prioritization Studio
    ├── prioritization.js        Score aggregation and quadrant/priority math
    ├── scoringApi.js            POST /api/score-batch client
    ├── csv.js                   CSV import/format auto-detection
    ├── pdf.js                    PDF report generation
    └── sentiment.js              Lightweight client-side sentiment scoring for feedback text
```

There is no backend of its own — this is a static single-page app. All workspace state (features, imported matrix) is held in the browser's `localStorage`; the only network call it makes is to the shared scoring server for AI prioritization.

## API usage

This app is an API **consumer**, not a provider. It calls a single endpoint on the shared scoring server:

- `POST /api/score-batch` — see [`prioritization-studio/server/README.md#api-reference`](../prioritization-studio/server/README.md#api-reference) for the full, verified request/response contract. The call site is [`src/utils/scoringApi.js`](./src/utils/scoringApi.js).

## Security

- No credentials or API keys are stored or handled by this app — scoring is delegated entirely to the server, which owns authentication (see [`prioritization-studio/server/README.md#security`](../prioritization-studio/server/README.md#security)).
- Feature and feedback data persist only in the browser's `localStorage`, scoped to the app's own origin — clearing site data or using a different browser/profile removes it. Nothing is sent anywhere except the scoring server, and only when you explicitly run AI Prioritization.
- CSV import and matrix import both parse untrusted, user-supplied files client-side; treat imported files as you would any file from an external source before sharing a browser profile.
- See the repository-wide [SECURITY.md](../SECURITY.md) for how to report a vulnerability.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| AI Prioritization marks every item as failed | Scoring server not running or not authenticated | Start `prioritization-studio/server` and confirm `ant auth status`; see its [Troubleshooting](../prioritization-studio/server/README.md#troubleshooting). |
| Imported matrix seems to have no effect | Wrong or stale export file | Re-export from Studio → Matrix → **Export Matrix**, then re-import here via Setup → **Import Matrix**. |
| CSV import silently skips rows or fields look wrong | File doesn't match either supported CSV shape | Check the two accepted formats above; `src/utils/csv.js` auto-detects by header, so an unrecognized header set falls through unmapped. |
| Old sample/test data keeps appearing | Sample data was loaded manually or from a stale `localStorage` entry | Setup tab → **Clear All Features**. |
| Changes to `.env` (`VITE_SCORING_API_BASE`) don't take effect | Vite only reads `.env` at server/build start | Restart `npm run dev`, or rebuild with `npm run build`. |

## Contributing

See the repository-wide [CONTRIBUTING.md](../CONTRIBUTING.md).
