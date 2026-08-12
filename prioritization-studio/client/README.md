# Prioritization Studio (client)

PDL admin tool for designing a prioritization matrix and testing AI-assisted scoring before deploying it to the [Roadmap App](../../roadmap-app).

## Tabs

- **Data** — import feedback (JSON export from the Roadmap App, or a bare JSON array) or add items manually, for testing a matrix against real-shaped data
- **Matrix** — set client tier weights, toggle/weight the built-in factors (feedback frequency, business impact), set an effort exponent, and add custom factors — each marked **AI-scored** or **manual**. Export the result as `prioritization-matrix.json`.
- **Prioritize** — run AI scoring against the configured factors and see ranked results with per-factor breakdowns and rationale

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5175` (or the next free port). Its dev server proxies `/api` to `http://localhost:4001` — start [`../server`](../server) first for AI scoring to work.

## Typical use

Design and test a matrix here, **Export Matrix**, then import that file into the Roadmap App's Setup tab. Day-to-day scoring after that happens in the Roadmap App directly — this app is for occasional matrix design/testing, not daily use.

## Build

```bash
npm run build
```
