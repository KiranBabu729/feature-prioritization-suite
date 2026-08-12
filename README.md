# Feature Prioritization Suite

Two related apps for turning client feedback into a prioritized, AI-assisted product roadmap:

| App | Folder | What it does |
|---|---|---|
| **Roadmap App** | [`roadmap-app/`](./roadmap-app) | Day-to-day workspace: import feedback (CSV or manual), see dashboards, quadrant analysis, a drag-and-drop roadmap board, and exportable reports. Computes priority scores from an importable, configurable matrix. |
| **Prioritization Studio** | [`prioritization-studio/`](./prioritization-studio) | PDL admin tool for designing the prioritization matrix (client tier weights, custom weighted factors, which factors get AI-scored vs entered manually) and running AI-assisted scoring against real feedback via the Claude API. |

Both apps can compute scores using **the same configurable matrix**: design and test a matrix in Studio, export it, and import it into the Roadmap App — from then on the Roadmap App can run AI prioritization itself without going back to Studio.

## Quick Start

You need **three** processes running for the full experience (two are optional if you only want the Roadmap App's manual/CSV workflow without AI scoring).

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

Then restart the server so it picks up your credentials. Check `http://localhost:4001/api/health`.

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

## Typical workflow

1. **(Optional, occasional)** In Studio → **Matrix** tab, set client tier weights and add custom factors (mark each as AI-scored or manually entered) → **Export Matrix**.
2. In the Roadmap App → **Setup** tab → **Import Matrix**, pick the exported file. From here on the Roadmap App drives scoring itself.
3. Add real feedback via **Upload CSV** or **Add Feature** (or clear any leftover test data first with **Clear All Features** in the Setup tab).
4. Setup tab → **Run AI Prioritization** to score every feature against the AI-scored factors using the shared scoring server.
5. Browse **Dashboard**, **Analysis**, **Roadmap**, and **Reports** — all driven by the active matrix.

## Notes

- No API key is stored anywhere in this repo — auth is via `ant auth login` (OAuth), which stores credentials outside the project at `~/.config/anthropic/`.
- Each app's own README has more detail: [`roadmap-app/README.md`](./roadmap-app/README.md), [`prioritization-studio/client/README.md`](./prioritization-studio/client/README.md), [`prioritization-studio/server/README.md`](./prioritization-studio/server/README.md).
