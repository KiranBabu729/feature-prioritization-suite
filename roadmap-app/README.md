# Roadmap App

The day-to-day workspace for a Product Delivery Lead: bring in client feedback, see it prioritized, plan it onto a quarterly roadmap, and export reports.

## Features

- **Dashboard** — metric cards, top-prioritized features table, recent feedback feed
- **Analysis** — effort-vs-impact quadrant chart, quick wins / strategic bets, client tier and effort breakdowns
- **Roadmap** — drag-and-drop quarterly board with team capacity bars and a dependency list
- **Reports** — executive summary, quadrant breakdown, client sentiment, JSON/PDF export
- **Setup** — import a prioritization matrix (built in [Prioritization Studio](../prioritization-studio)), run AI-assisted scoring, and manage workspace data

CSV upload accepts both a plain feature-request format (`Feature Name, Client Name, Client Tier, Feedback Text, Complexity`) and a governance/feedback export format (`ID, Text, Category, Priority, Sentiment, Department, ...`) — the importer auto-detects which one you're using.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` (or the next free port). Sample-free by default — use **Upload CSV** or **Add Feature**, or **Clear All Features** in the Setup tab if you ever load sample/test data you want to remove.

### AI Prioritization

The **Run AI Prioritization** button in the Setup tab calls a scoring server over `/api/score-batch`. In dev, `vite.config.js` proxies `/api` to `http://localhost:4001` — start the server in [`../prioritization-studio/server`](../prioritization-studio/server) first (see its README for auth setup). Without it running, everything else in this app still works — AI scoring just reports each item as failed.

To point at a scoring server somewhere other than `localhost:4001`, set `VITE_SCORING_API_BASE` in a `.env` file before building.

## Build

```bash
npm run build
```
