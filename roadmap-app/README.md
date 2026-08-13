# Roadmap App

**Component of [Feature Prioritization Suite](../README.md)**

The primary operational workspace. Ingests client feedback, applies an imported scoring matrix, and presents the result as dashboards, quadrant analysis, a quarterly roadmap board, and exportable reports.

> **Verification required before publishing.** Fields marked **`[VERIFY]`** were derived from the root README rather than read from source. Confirm each against the codebase and correct as needed. See [`../docs/VERIFICATION.md`](../docs/VERIFICATION.md) for the full checklist.

---

## Table of Contents

1. [Scope](#1-scope)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Feature Reference](#5-feature-reference)
6. [Data Model](#6-data-model)
7. [CSV Import Specification](#7-csv-import-specification)
8. [Project Structure](#8-project-structure)
9. [Scripts](#9-scripts)
10. [Troubleshooting](#10-troubleshooting)
11. [Related Documentation](#11-related-documentation)

---

## 1. Scope

### 1.1 Responsibilities

| In scope | Out of scope |
| --- | --- |
| Feedback ingestion (CSV and manual) | Matrix design — see [Prioritization Studio](../prioritization-studio/README.md) |
| Applying an imported scoring matrix | AI inference — delegated to the [Scoring Server](../prioritization-studio/server/README.md) |
| Dashboard, analysis, and roadmap views | Persistent multi-user storage |
| Report generation and export | Authentication and user management |

### 1.2 Operating Modes

| Mode | Requires scoring server | Requires matrix | Capability |
| --- | --- | --- | --- |
| **Manual** | No | No | CSV import, manual entry, manual factor values, all views |
| **Matrix-driven** | No | Yes | Above, plus weighted composite scoring |
| **AI-assisted** | Yes | Yes | Above, plus automated scoring of AI-designated factors |

The application is fully usable in Manual mode. AI assistance is additive, not required.

---

## 2. Prerequisites

| Requirement | Minimum version | Verification |
| --- | --- | --- |
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Scoring server | — | Required for AI-assisted mode only |

---

## 3. Installation

```bash
cd roadmap-app
npm install
npm run dev
```

The development server prints its URL, conventionally `http://localhost:5173`.

### 3.1 Verification

| Check | Expected result |
| --- | --- |
| Application loads at the printed URL | Dashboard renders |
| **Setup** tab is reachable | Import and ingestion controls visible |
| `/api` proxy resolves | Only relevant in AI-assisted mode — see §4.2 |

---

## 4. Configuration

### 4.1 Environment Variables

**`[VERIFY]`** — The root README documents no environment variables for this component. Confirm whether a `.env` or `.env.example` exists in this directory. If it does, document each variable in the table below; if it does not, state that explicitly.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| _None documented_ | — | — | — |

### 4.2 Development Proxy

The Vite development server proxies `/api` requests to the scoring server, so no CORS configuration is required.

| Setting | Value | Location |
| --- | --- | --- |
| Proxy path | `/api` | `vite.config.js` |
| Target | `http://localhost:4001` | `vite.config.js` |

If you change the scoring server's port, update the target here to match.

### 4.3 Production Build

**`[VERIFY]`** — The proxy above is a development-server feature and does not apply to a production build. Document the intended production configuration, or state that production deployment is not currently supported.

---

## 5. Feature Reference

### 5.1 Setup Tab

| Control | Function | Preconditions |
| --- | --- | --- |
| **Import Matrix** | Loads a `matrix.json` exported from Studio | Valid matrix file |
| **Upload CSV** | Bulk feedback import | File conforms to §7 |
| **Add Feature** | Single-feature manual entry | — |
| **Run AI Prioritization** | Scores all features via the scoring server | Matrix imported; ≥1 feature present; scoring server reachable and authenticated |
| **Clear All Features** | Removes all feature records | **Irreversible** |

> Clear seeded demo data with **Clear All Features** before your first production import. This action cannot be undone and there is no confirmation-recovery path.

### 5.2 Dashboard Tab

Aggregate metrics, top-ranked features by composite score, and recent feedback. Intended for daily status review.

### 5.3 Analysis Tab

| View | Contents | Decision it supports |
| --- | --- | --- |
| Effort/impact quadrant | Features plotted on two axes | Identifying quick wins versus strategic bets |
| Distribution charts | Score, effort, and priority spread | Detecting matrix skew |
| Client tier breakdown | Feature counts and scores by tier | Verifying tier weighting behaves as intended |

### 5.4 Roadmap Tab

Quarterly board with drag-and-drop scheduling. Supports capacity planning and sequencing.

**`[VERIFY]`** — Confirm whether board placements persist to `localStorage` and whether re-running AI prioritization preserves or resets them.

### 5.5 Reports Tab

Executive summary generated from live data, with export.

**`[VERIFY]`** — Confirm supported export formats. The root README implies JSON; PDF is listed as planned.

---

## 6. Data Model

### 6.1 Feature Record

**`[VERIFY]`** — Field names below are inferred from the CSV schema and the scoring model. Reconcile against the actual state shape.

| Field | Type | Source | Notes |
| --- | --- | --- | --- |
| `id` | String | Generated | Unique per feature |
| `name` | String | CSV / form | ≤ 200 characters |
| `clientName` | String | CSV / form | — |
| `clientTier` | Enum | CSV / form | Must match a tier in the active matrix |
| `feedbackText` | String | CSV / form | Input to AI-scored factors |
| `complexity` | Enum | CSV / form | `Low` \| `Medium` \| `High` |
| `factorScores` | Object | AI or manual | Keyed by factor name |
| `compositeScore` | Number | Computed | See root README §2.3 |

### 6.2 Persistence

| Property | Value |
| --- | --- |
| Mechanism | Browser `localStorage` |
| Scope | Single browser profile on a single device |
| Survives | Page refresh, browser restart |
| Does not survive | Cleared site data, private browsing sessions, a different browser or machine |

> **Operational risk.** There is no server-side persistence and no automatic backup. Export your data before clearing site data, switching browsers, or reinstalling. Treat this component as single-user until a storage backend is added.

---

## 7. CSV Import Specification

### 7.1 Schema

| Column | Type | Required | Constraints |
| --- | --- | --- | --- |
| `Feature Name` | String | Yes | Non-empty, ≤ 200 characters |
| `Client Name` | String | Yes | Non-empty |
| `Client Tier` | Enum | Yes | Must match a tier defined in the active matrix |
| `Feedback Text` | String | Yes | Non-empty; source text for AI-scored factors |
| `Complexity` | Enum | Yes | `Low` \| `Medium` \| `High` |

### 7.2 Format Requirements

| Requirement | Detail |
| --- | --- |
| Encoding | UTF-8 |
| Header row | Required; column names must match exactly, including case |
| Delimiter | Comma |
| Quoting | Wrap any field containing a comma in double quotes |
| Line endings | LF or CRLF |

### 7.3 Example

```csv
Feature Name,Client Name,Client Tier,Feedback Text,Complexity
Mobile notifications,Acme Corp,Top,"Users miss time-sensitive alerts, especially overnight",Medium
Dark mode,StartupX,Regular,Requested for low-light usage,Low
Bulk export,Northwind,Top,"Manual export of 400+ records takes hours",High
```

### 7.4 Validation Behavior

**`[VERIFY]`** — Confirm and document the following:

| Question | Answer |
| --- | --- |
| Are malformed rows skipped or does the whole import fail? | — |
| Are validation errors surfaced to the user? | — |
| Does import append to existing features or replace them? | — |
| Is there a row-count limit? | — |

---

## 8. Project Structure

**`[VERIFY]`** — Replace the structure below with the actual tree. Generate it with:

```bash
tree -L 2 -I 'node_modules|dist|.git'
```

```
roadmap-app/
├── src/
│   ├── components/
│   ├── views/
│   ├── lib/
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## 9. Scripts

**`[VERIFY]`** — Confirm against `package.json`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Produce a production bundle |
| `npm run preview` | Serve the production bundle locally |

---

## 10. Troubleshooting

| Symptom | Probable cause | Resolution |
| --- | --- | --- |
| **Run AI Prioritization** is disabled | No matrix imported, or no features present | Import a matrix and add at least one feature |
| `/api` requests return 404 | Scoring server not running | Start it; verify `http://localhost:4001/api/health` |
| Scoring returns `401` | Scoring server started before OAuth login completed | Run `ant auth login`, then restart the server |
| CSV import rejected | Header row does not match §7.1 exactly | Compare column names character by character, including case |
| Charts render empty | Features exist but carry no scores | Run AI prioritization or enter factor values manually |
| Data lost after refresh | `localStorage` cleared, or private browsing | Disable private browsing; export before clearing site data |
| Client tier not recognized | Tier value absent from the active matrix | Align the CSV value with a tier defined in `matrix.json` |

---

## 11. Related Documentation

| Document | Contents |
| --- | --- |
| [Root README](../README.md) | Architecture, scoring model, API reference, security |
| [Prioritization Studio](../prioritization-studio/README.md) | Matrix design |
| [Scoring Server](../prioritization-studio/server/README.md) | Backend service and endpoints |
| [CONTRIBUTING](../CONTRIBUTING.md) | Development workflow |
| [SECURITY](../SECURITY.md) | Data handling and PII constraints |
