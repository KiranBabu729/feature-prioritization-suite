# App Generation Prompt — Feature Prioritization Suite

Use the prompt below with an AI coding assistant to generate the Feature
Prioritization Suite application from scratch.

---

## Prompt

Build a full-stack toolkit called **Feature Prioritization Suite** that
converts unstructured client feedback into a scored, ranked, and scheduled
product roadmap. It replaces subjective, consensus-driven feature
prioritization with a transparent, configurable scoring matrix.

### Problem it solves

Product teams typically prioritize features through opinion and stakeholder
volume, which causes: loudest-voice bias (vocal clients get served over
high-revenue ones), undocumented rationale (decisions can't be defended or
revisited), and inconsistent criteria (the same feature scores differently
across review cycles). Solve this by separating **matrix design** (how
features are scored) from **matrix application** (scoring real feedback).

### Components to build

1. **Roadmap App** (`roadmap-app/`) — the primary workspace used by product
   managers. Responsibilities:
   - Feedback ingestion via CSV bulk import or manual single-feature entry
   - A Setup tab for importing a matrix (`matrix.json`), managing features,
     clearing seeded demo data, and triggering AI prioritization
   - Dashboard with score distributions and client-tier breakdowns
   - Effort/impact quadrant analysis view
   - Drag-and-drop roadmap board (columns by status/timeframe)
   - Exportable, stakeholder-ready reports (PDF)
   - Stack: React 19 + Vite + Tailwind CSS v4, `@hello-pangea/dnd` for
     drag-and-drop, `recharts` for charts, `papaparse` for CSV parsing,
     `jspdf` for PDF export. Runs on `localhost:5173` and proxies `/api`
     requests to the scoring server at `localhost:4001`.

2. **Prioritization Studio** (`prioritization-studio/client/`) — an
   administrative tool for a Product Development Lead (PDL) to design and
   validate the prioritization matrix. Responsibilities:
   - Matrix designer: configure client-tier weights (e.g. Top = 3.0,
     Regular = 1.0) and add 4–8 custom scoring factors
   - Each factor is marked either **AI-scored** (inferred from feedback
     text — good for qualitative signals like sentiment/urgency) or
     **manual** (human-entered — good for things like effort estimates)
   - Test-scoring against sample feedback before committing
   - Export the finished matrix to `matrix.json` for import into the
     Roadmap App
   - Stack: React 19 + Vite + Tailwind CSS v4. Runs on `localhost:5174`.

3. **Scoring Server** (`prioritization-studio/server/`) — shared backend
   that brokers AI-assisted scoring requests. Responsibilities:
   - `POST /api/score` — accepts features + active matrix, evaluates each
     AI-scored factor against the feedback text via the Anthropic Claude
     API, and returns normalized 1–10 values per factor; manually entered
     factor values pass through unchanged
   - `GET /api/health` — returns `{ "status": "ok", "authenticated": true }`
     reflecting whether Claude credentials are present
   - Request validation with `zod`
   - Uses personal OAuth credentials (via the `ant` CLI) stored outside the
     repo at `~/.config/anthropic/`, not static API keys
   - Stack: Node.js (ESM) + Express 5 + `@anthropic-ai/sdk` + `cors` +
     `dotenv` + `zod`. Runs on `localhost:4001`.

### Scoring model (implement identically in both clients and the server)

```
Score = Σ (factor_value × factor_weight) × tier_multiplier
```

- `factor_value`: normalized 1–10 score for a single factor (AI-generated
  or manually entered)
- `factor_weight`: relative importance of that factor, from the matrix
- `tier_multiplier`: client-tier weighting coefficient, from the matrix

Both apps must compute scores using an identical implementation so a
feature scored in Studio produces the same result in the Roadmap App.

### CSV import schema (Roadmap App)

| Column | Type | Required | Constraints |
| --- | --- | --- | --- |
| `Feature Name` | String | Yes | Non-empty, ≤ 200 characters |
| `Client Name` | String | Yes | Non-empty |
| `Client Tier` | Enum | Yes | Must match a tier defined in the active matrix |
| `Feedback Text` | String | Yes | Non-empty; source text for AI-scored factors |
| `Complexity` | Enum | Yes | `Low`, `Medium`, or `High` |

### Standard end-to-end workflow to support

1. **Matrix design** (occasional, PDL only): in Studio, configure tier
   weights and factors, test, then Export Matrix → `matrix.json`.
2. **Matrix activation** (once per matrix revision): in Roadmap App Setup
   tab, Import Matrix from `matrix.json`.
3. **Operation** (recurring): ingest feedback (CSV or manual) → Run AI
   Prioritization → review dashboard/quadrant/board views → export
   reports.

### Non-functional requirements

- The Roadmap App must be fully usable without the scoring server —
  CSV import, manual entry, dashboards, quadrant analysis, the roadmap
  board, and reporting all work against manually entered factor values.
  Only "Run AI Prioritization" requires the scoring server.
- No API keys committed to the repo; auth is via OAuth CLI login, and the
  server should expose whether it is authenticated via `/api/health`.
- "Run AI Prioritization" should be disabled until a matrix is imported
  and at least one feature exists, and should surface clear errors for a
  down scoring server (connection error) or missing auth (`401`).
- Ship a `.env.example` for the server documenting configurable variables
  (e.g. model name, port).
- Include top-level docs: `README.md` (architecture, quick start,
  installation, usage, configuration, API reference, security,
  troubleshooting, contributing, roadmap), `CONTRIBUTING.md`,
  `SECURITY.md`, `CHANGELOG.md`, and a `LICENSE` (MIT).

### Deliverable structure

```
feature-prioritization-suite/
├── roadmap-app/                  # React 19 + Vite client, port 5173
├── prioritization-studio/
│   ├── client/                   # React 19 + Vite client, port 5174
│   └── server/                   # Express scoring server, port 4001
├── docs/
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

Generate the code, configuration, and documentation for all three
components so that following the Quick Start (clone → install → `ant auth
login` → `npm run dev` in both the server and Roadmap App) produces a
working end-to-end system.
