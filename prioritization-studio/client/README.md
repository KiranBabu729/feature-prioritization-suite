# Prioritization Studio (client)

PDL admin tool for designing a prioritization matrix and testing AI-assisted scoring before deploying it to the [Roadmap App](../../roadmap-app).

## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Tabs](#tabs)
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
| `tailwindcss` | ^4.3.3 | Styling |

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5175` (or the next free port). Its dev server proxies `/api` to `http://localhost:4001` — start [`../server`](../server) first for AI scoring to work.

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

## Configuration

This app has no build-time environment variables of its own — the scoring server URL is fixed to the Vite dev proxy (`/api` → `http://localhost:4001`, see [`vite.config.js`](./vite.config.js)) and is not intended to be pointed at a different server for a production build; it's a local design/testing tool, not a deployed production surface.

## Tabs

- **Data** — import feedback (JSON export from the Roadmap App, or a bare JSON array) or add items manually, for testing a matrix against real-shaped data
- **Matrix** — set client tier weights, toggle/weight the built-in factors (feedback frequency, business impact), set an effort exponent, and add custom factors — each marked **AI-scored** or **manual**. Export the result as `prioritization-matrix.json`.
- **Prioritize** — run AI scoring against the configured factors and see ranked results with per-factor breakdowns and rationale

## Architecture

```
src/
├── App.jsx              Tab shell and top-level state
├── main.jsx               Entry point
├── components/             Shared presentational pieces (badges, icons, tab nav)
├── tabs/
│   ├── DataTab.jsx          Feedback import / manual entry
│   ├── MatrixTab.jsx        Matrix design and export
│   └── PrioritizeTab.jsx    Run scoring, view ranked results
└── utils/
    ├── storage.js          localStorage persistence for matrix + test data
    ├── matrix.js            Matrix scoring/aggregation logic
    ├── importItems.js        Parses imported JSON feedback into the app's item shape
    └── api.js                POST /api/score-batch client
```

No backend of its own — matrix and test-item state lives in the browser's `localStorage`; the only network call is to the shared scoring server for the **Prioritize** tab.

## API usage

This app is an API **consumer**, not a provider. It calls a single endpoint on the shared scoring server:

- `POST /api/score-batch` — see [`prioritization-studio/server/README.md#api-reference`](../server/README.md#api-reference) for the full, verified request/response contract. The call site is [`src/utils/api.js`](./src/utils/api.js).

## Security

- No credentials or API keys are stored or handled by this app — scoring is delegated entirely to the server, which owns authentication (see [`../server/README.md#security`](../server/README.md#security)).
- Matrix configuration and test feedback data persist only in the browser's `localStorage`. This tool is intended for occasional local matrix design, not for holding real client data long-term — real feedback should live in the Roadmap App.
- Imported feedback JSON is parsed client-side; treat imported files as you would any file from an external source before sharing a browser profile.
- See the repository-wide [SECURITY.md](../../SECURITY.md) for how to report a vulnerability.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **Prioritize** tab reports every item as failed | Scoring server not running or not authenticated | Start `../server` and confirm `ant auth status`; see its [Troubleshooting](../server/README.md#troubleshooting). |
| **Export Matrix** downloads a file that doesn't import cleanly into the Roadmap App | Matrix was edited after export, or an older/incompatible export file was used | Re-export from the Matrix tab after your latest edits, then re-import. |
| Imported feedback JSON doesn't show up in the Data tab | File isn't a Roadmap App export or a bare JSON array in the expected shape | Check `src/utils/importItems.js` for the accepted shapes; malformed input is dropped rather than partially imported. |
| `EADDRINUSE` on port 5175 | Another dev server already bound that port | Vite will automatically try the next free port and print the URL it used. |

## Contributing

See the repository-wide [CONTRIBUTING.md](../../CONTRIBUTING.md).
