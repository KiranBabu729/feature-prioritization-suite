# Feature Prioritization Suite

Two related web apps for turning client feedback into a prioritized, AI-assisted product roadmap.

| App | Folder | Purpose |
|---|---|---|
| **Roadmap App** | [`roadmap-app/`](./roadmap-app) | Day-to-day workspace: import feedback (CSV or manual), view dashboards and quadrant analysis, plan a drag-and-drop roadmap board, and export reports. |
| **Prioritization Studio** | [`prioritization-studio/`](./prioritization-studio) | Admin tool for designing the prioritization matrix (client tier weights, custom weighted factors, AI-scored vs. manually entered) and test-running AI-assisted scoring. |

Both apps share **the same configurable scoring matrix**: design and test it in Studio, export it, then import it into the Roadmap App — from that point on the Roadmap App can run AI prioritization on its own without going back to Studio.

## Table of contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Typical workflow](#typical-workflow)
- [API reference](#api-reference)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  Prioritization Studio  │        │       Roadmap App         │
│  (client, Vite/React)   │        │     (client, Vite/React)  │
│  localhost:5175         │        │     localhost:5173        │
│                          │        │                            │
│  design + test matrix ──┼───export/import (JSON file)────────►│
└─────────────┬────────────┘        └─────────────┬──────────────┘
              │ POST /api/score-batch              │ POST /api/score-batch
              ▼                                     ▼
              ┌─────────────────────────────────────┐
              │   Prioritization Studio — Server     │
              │   Express API · localhost:4001       │
              │   prioritization-studio/server/      │
              └─────────────────┬─────────────────────┘
                                 │ Bearer OAuth token (via `ant` CLI)
                                 ▼
                        Claude API (Anthropic)
```

- **Roadmap App** and **Prioritization Studio client** are independent Vite/React single-page apps with no server-side persistence of their own — workspace data (features, matrix config) lives in the browser's `localStorage`.
- Both clients talk to the **same** scoring server (`prioritization-studio/server/`) over `/api/score-batch`, proxied by Vite in development.
- The scoring server is the only backend process. It holds no client feedback in memory beyond a single request/response cycle, and stores no data on disk — it exists purely to broker scoring calls to the Claude API using the operator's own OAuth session.
- Component-level detail is in each app's own README: [`roadmap-app/README.md`](./roadmap-app/README.md), [`prioritization-studio/client/README.md`](./prioritization-studio/client/README.md), [`prioritization-studio/server/README.md`](./prioritization-studio/server/README.md).

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20.x or later (tested on 22.16.0) | Required by Vite 8 and the Express 5 / ESM server. |
| npm | 10.x or later (bundled with Node 20+) | Any npm compatible with `package-lock.json` v3 lockfiles works. |
| [`ant` CLI](https://github.com/anthropics/ant) (Anthropic's OAuth CLI) | latest | Required only for AI-assisted scoring — the scoring server authenticates as you, not with a static API key. |
| A modern evergreen browser | — | Chrome, Firefox, Safari, or Edge, current release. No IE/legacy support. |

Verify your toolchain before starting:

```bash
node -v   # v20.0.0 or later
npm -v    # 10.0.0 or later
```

## Quick start

You need up to **three** processes running, depending on what you're doing. The scoring server and Studio client are optional if you only want the Roadmap App's manual/CSV workflow without AI scoring.

### 1. Scoring server (required only for AI-assisted scoring)

```bash
cd prioritization-studio/server
npm install
cp .env.example .env   # edit ANTHROPIC_MODEL if you want a different model
npm run dev
```

Authenticate with Claude — this app uses personal OAuth login, not a static API key:

```bash
brew install anthropics/tap/ant
xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"
ant auth login
```

Restart the server so it picks up your credentials, then confirm it's healthy:

```bash
curl http://localhost:4001/api/health
```

### 2. Roadmap App (the app you use day-to-day)

```bash
cd roadmap-app
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). Its dev server proxies `/api` to `http://localhost:4001`, so AI scoring works out of the box once the scoring server above is running.

### 3. Prioritization Studio client (optional — only needed to design/test a matrix before exporting it)

```bash
cd prioritization-studio/client
npm install
npm run dev
```

Opens at `http://localhost:5175` (or the next free port).

## Typical workflow

1. **(Optional, occasional)** In Studio → **Matrix** tab, set client tier weights and add custom factors (mark each as AI-scored or manually entered) → **Export Matrix**.
2. In the Roadmap App → **Setup** tab → **Import Matrix**, pick the exported file. From here on the Roadmap App drives scoring itself.
3. Add real feedback via **Upload CSV** or **Add Feature** (or clear any leftover test data first with **Clear All Features** in the Setup tab).
4. Setup tab → **Run AI Prioritization** to score every feature against the AI-scored factors using the shared scoring server.
5. Browse **Dashboard**, **Analysis**, **Roadmap**, and **Reports** — all driven by the active matrix.

## API reference

The suite exposes exactly one backend, `prioritization-studio/server/`, verified directly against its route handlers in [`prioritization-studio/server/src/index.js`](./prioritization-studio/server/src/index.js). Full request/response schemas, error semantics, and internals are documented in [`prioritization-studio/server/README.md`](./prioritization-studio/server/README.md#api-reference). Summary:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness/readiness check; reports the configured model. |
| `POST` | `/api/score-batch` | Scores a batch of feedback items against a set of weighted factors via the Claude API. |

## Security

- **No API keys in the repo.** The scoring server authenticates via `ant auth login` (OAuth), which stores credentials outside this project at `~/.config/anthropic/`. Nothing secret is ever written into this repository.
- **No server-side persistence.** The scoring server does not write feedback content, scores, or matrix configuration to disk or a database — everything lives in the requesting browser's `localStorage`, scoped to that origin.
- **CORS is open by default.** The scoring server (`prioritization-studio/server/src/index.js`) enables `cors()` with no origin restriction, which is appropriate for local development but **must not** be used as-is on a shared or internet-facing host — see [`prioritization-studio/server/README.md#security`](./prioritization-studio/server/README.md#security) before deploying it anywhere but `localhost`.
- **Report a vulnerability:** see [SECURITY.md](./SECURITY.md).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Run AI Prioritization` reports every item as failed | Scoring server isn't running, or `ant` isn't authenticated | Start the server (`prioritization-studio/server`) and run `ant auth status`; see its README's [Troubleshooting](./prioritization-studio/server/README.md#troubleshooting) section. |
| Roadmap App / Studio client shows a blank page or stale UI after `git pull` | Stale `node_modules` or Vite cache after a dependency bump | `rm -rf node_modules && npm install` in the affected app, then restart `npm run dev`. |
| `EADDRINUSE` on port 4001, 5173, or 5175 | Another process (often a previous `npm run dev`) still holds the port | Stop the other process, or let Vite pick the next free port automatically (it will print the URL it actually used). |
| Imported matrix has no effect in the Roadmap App | Wrong file, or the file wasn't exported from Studio's **Matrix** tab | Re-export from Studio → **Matrix** → **Export Matrix**, then re-import via Roadmap App → **Setup** → **Import Matrix**. |
| AI scoring works locally but fails once the scoring server is deployed elsewhere | `VITE_SCORING_API_BASE` not set, so the client still points at `localhost:4001` | Set `VITE_SCORING_API_BASE` in the client's `.env` before building — see [`roadmap-app/README.md`](./roadmap-app/README.md#configuration). |

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow, coding conventions, and pull request process before opening one.

## License

Released under the [MIT License](./LICENSE).
