<div align="center">

# Feature Prioritization Suite

**Transform client feedback into a defensible, AI-assisted product roadmap.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/status-alpha-orange.svg)]()

[Overview](#1-overview) •
[Quick Start](#4-quick-start) •
[Usage](#6-usage) •
[Configuration](#7-configuration) •
[API](#8-api-reference) •
[Contributing](#11-contributing)

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Quick Start](#4-quick-start)
5. [Installation](#5-installation)
6. [Usage](#6-usage)
7. [Configuration](#7-configuration)
8. [API Reference](#8-api-reference)
9. [Security](#9-security)
10. [Troubleshooting](#10-troubleshooting)
11. [Contributing](#11-contributing)
12. [Roadmap](#12-roadmap)
13. [License](#13-license)
14. [Support](#14-support)

---

## 1. Overview

### 1.1 Purpose

Feature Prioritization Suite is a two-application toolkit that converts unstructured client feedback into a scored, ranked, and scheduled product roadmap. It replaces subjective prioritization debates with a transparent, configurable scoring matrix that any stakeholder can inspect and audit.

### 1.2 Problem Statement

Product teams routinely prioritize features through consensus meetings, opinion, and stakeholder volume. This produces three failure modes:

| Failure Mode | Consequence |
| --- | --- |
| Loudest-voice bias | High-revenue clients under-served relative to vocal ones |
| Undocumented rationale | Prioritization decisions cannot be defended or revisited |
| Inconsistent criteria | The same feature scores differently across review cycles |

### 1.3 Solution

The suite separates **matrix design** (how features are scored) from **matrix application** (scoring real feedback). A Product Development Lead defines the weighting model once; the day-to-day workspace then applies it consistently, with AI assistance for qualitative factors.

### 1.4 Components

| Component | Directory | Role | Audience |
| --- | --- | --- | --- |
| **Roadmap App** | `roadmap-app/` | Primary workspace. Feedback ingestion, dashboards, quadrant analysis, drag-and-drop roadmap board, exportable reports. | Product managers, product ops |
| **Prioritization Studio** | `prioritization-studio/` | Administrative tool for designing and validating the prioritization matrix. | Product Development Lead (PDL) |
| **Scoring Server** | `prioritization-studio/server/` | Backend service that brokers AI-assisted scoring requests. | Shared infrastructure |

### 1.5 Key Capabilities

- **Configurable scoring matrix** — client tier weights and arbitrary custom factors
- **Hybrid scoring** — designate each factor as AI-scored or manually entered
- **Matrix portability** — design in Studio, export, import into Roadmap App
- **Multiple ingestion paths** — CSV bulk import or single-feature manual entry
- **Visual analysis** — effort/impact quadrants, distribution charts, tier breakdowns
- **Exportable reporting** — stakeholder-ready outputs from live data

---

## 2. System Architecture

### 2.1 Component Topology

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  Prioritization Studio   │         │       Roadmap App        │
│         (client)         │         │        (client)          │
│      localhost:5174      │         │     localhost:5173       │
│                          │         │                          │
│  • Matrix designer       │         │  • Feedback ingestion    │
│  • Weight configuration  │         │  • Dashboard             │
│  • Factor definition     │         │  • Quadrant analysis     │
│  • Test scoring          │         │  • Roadmap board         │
└────────────┬─────────────┘         └────────────┬─────────────┘
             │                                    │
             │   matrix.json (export → import)    │
             └──────────────►─────────────────────┘
                                    │
                                    │ POST /api/score
                                    ▼
                      ┌──────────────────────────┐
                      │      Scoring Server      │
                      │      localhost:4001      │
                      │                          │
                      │  • Request validation    │
                      │  • Claude API broker     │
                      │  • Score normalization   │
                      └────────────┬─────────────┘
                                   │
                                   ▼
                      ┌──────────────────────────┐
                      │   Anthropic Claude API   │
                      │   (OAuth credentials)    │
                      └──────────────────────────┘
```

### 2.2 Data Flow

| Stage | Input | Process | Output |
| --- | --- | --- | --- |
| 1. Matrix design | PDL configuration | Studio matrix designer | `matrix.json` |
| 2. Matrix load | `matrix.json` | Roadmap App import | Active scoring model |
| 3. Feedback ingestion | CSV or form entry | Validation and normalization | Feature records |
| 4. Scoring | Features + matrix | Scoring server → Claude API | Weighted priority scores |
| 5. Presentation | Scored features | Dashboard, analysis, roadmap views | Ranked roadmap and reports |

### 2.3 Scoring Model

The composite priority score is calculated as:

```
Score = Σ (factor_value × factor_weight) × tier_multiplier
```

Where:

| Term | Definition | Source |
| --- | --- | --- |
| `factor_value` | Normalized 1–10 score for a single factor | AI-generated or manually entered |
| `factor_weight` | Relative importance of that factor | Matrix configuration |
| `tier_multiplier` | Client tier weighting coefficient | Matrix configuration |

Both applications compute scores using an identical implementation of this model, guaranteeing that a feature scored in Studio produces the same result in the Roadmap App.

---

## 3. Prerequisites

### 3.1 Required Software

| Requirement | Minimum Version | Verification Command |
| --- | --- | --- |
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Git | 2.30.0 | `git --version` |

### 3.2 Optional — AI Scoring Only

| Requirement | Purpose | Verification Command |
| --- | --- | --- |
| Homebrew (macOS) | Installs the `ant` CLI | `brew --version` |
| `ant` CLI | Anthropic OAuth authentication | `ant --version` |
| Anthropic account | Claude API access | — |

> **Note:** The Roadmap App is fully functional without AI scoring. CSV import, manual entry, dashboards, quadrant analysis, the roadmap board, and reporting all operate against manually entered factor values. Only the **Run AI Prioritization** action requires the scoring server.

### 3.3 Supported Platforms

| Platform | Status |
| --- | --- |
| macOS 13+ | Fully supported |
| Linux (Ubuntu 22.04+) | Supported — install `ant` via the Linux instructions |
| Windows 11 (WSL2) | Supported |
| Windows 11 (native) | Untested |

---

## 4. Quick Start

For a working installation with AI scoring enabled:

```bash
# 1. Clone the repository
git clone https://github.com/KiranBabu729/feature-prioritization-suite.git
cd feature-prioritization-suite

# 2. Start the scoring server
cd prioritization-studio/server
npm install
cp .env.example .env
npm run dev

# 3. In a new terminal — start the Roadmap App
cd roadmap-app
npm install
npm run dev
```

Open the URL printed by the Roadmap App (typically `http://localhost:5173`).

**Estimated time:** 5 minutes.

For AI scoring, complete [section 5.3](#53-authentication-setup) before running **Run AI Prioritization**.

---

## 5. Installation

### 5.1 Repository Setup

```bash
git clone https://github.com/KiranBabu729/feature-prioritization-suite.git
cd feature-prioritization-suite
```

### 5.2 Scoring Server

Required only for AI-assisted scoring.

```bash
cd prioritization-studio/server
npm install
cp .env.example .env
```

Edit `.env` if you need a model other than the default. See [section 7.1](#71-scoring-server-environment-variables) for available variables.

```bash
npm run dev
```

Verify the service is healthy:

```bash
curl http://localhost:4001/api/health
```

Expected response:

```json
{ "status": "ok", "authenticated": true }
```

### 5.3 Authentication Setup

This project uses **personal OAuth authentication** rather than static API keys. Credentials are stored outside the repository at `~/.config/anthropic/` and are never committed.

**macOS**

```bash
brew install anthropics/tap/ant
xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"
ant auth login
```

**Linux**

```bash
curl -fsSL https://claude.com/install.sh | sh
ant auth login
```

The `xattr` command removes the macOS Gatekeeper quarantine attribute from the Homebrew-installed binary. Omit it on Linux.

After authenticating, **restart the scoring server** so it picks up the new credentials.

### 5.4 Roadmap App

```bash
cd roadmap-app
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:4001`. No additional CORS or proxy configuration is required.

### 5.5 Prioritization Studio Client

Required only when designing or revising a matrix.

```bash
cd prioritization-studio/client
npm install
npm run dev
```

### 5.6 Verification Checklist

| Check | Command or Action | Expected Result |
| --- | --- | --- |
| Server health | `curl http://localhost:4001/api/health` | `{"status":"ok"}` |
| Authentication | `ant auth status` | Logged-in account displayed |
| Roadmap App | Open `http://localhost:5173` | Dashboard renders |
| Studio client | Open `http://localhost:5174` | Matrix tab renders |
| End-to-end | Run **AI Prioritization** on one feature | Score populates |

---

## 6. Usage

### 6.1 Standard Workflow

```
  ┌─────────────────────────────────────────────────────────────┐
  │  PHASE 1 — MATRIX DESIGN (occasional, PDL only)             │
  └─────────────────────────────────────────────────────────────┘
      Studio → Matrix tab
      → Configure client tier weights
      → Add custom factors, mark AI-scored or manual
      → Export Matrix → matrix.json
                          │
  ┌───────────────────────▼─────────────────────────────────────┐
  │  PHASE 2 — MATRIX ACTIVATION (once per matrix revision)     │
  └─────────────────────────────────────────────────────────────┘
      Roadmap App → Setup tab → Import Matrix → matrix.json
                          │
  ┌───────────────────────▼─────────────────────────────────────┐
  │  PHASE 3 — OPERATION (recurring)                            │
  └─────────────────────────────────────────────────────────────┘
      Ingest feedback → Run AI Prioritization → Review and act
```

### 6.2 Phase 1 — Designing a Matrix

Perform in the **Prioritization Studio** client.

| Step | Action | Notes |
| --- | --- | --- |
| 1 | Open the **Matrix** tab | — |
| 2 | Set client tier weights | Typical: Top = 3.0, Regular = 1.0 |
| 3 | Add custom factors | Each requires a name and a weight |
| 4 | Mark each factor AI-scored or manual | AI-scored factors are inferred from feedback text; manual factors require human input |
| 5 | Test against sample feedback | Validates weighting before committing |
| 6 | Click **Export Matrix** | Produces `matrix.json` |

**Factor design guidance**

| Guideline | Rationale |
| --- | --- |
| Keep total factors between 4 and 8 | Fewer loses nuance; more dilutes signal |
| Weights should sum to a round number | Simplifies interpretation of raw scores |
| Reserve AI scoring for qualitative factors | Sentiment and urgency infer well from text; effort estimates do not |
| Document each factor's definition | Prevents drift when multiple people enter manual values |

### 6.3 Phase 2 — Importing a Matrix

Perform in the **Roadmap App**.

1. Navigate to the **Setup** tab.
2. Select **Import Matrix**.
3. Choose the exported `matrix.json`.

Once imported, the Roadmap App runs AI prioritization independently. Studio is not required again until the matrix itself changes.

### 6.4 Phase 3 — Ingesting Feedback

**Option A — CSV bulk import**

Setup tab → **Upload CSV**. Required schema:

| Column | Type | Required | Constraints |
| --- | --- | --- | --- |
| `Feature Name` | String | Yes | Non-empty, ≤ 200 characters |
| `Client Name` | String | Yes | Non-empty |
| `Client Tier` | Enum | Yes | Must match a tier defined in the active matrix |
| `Feedback Text` | String | Yes | Non-empty; source text for AI-scored factors |
| `Complexity` | Enum | Yes | `Low`, `Medium`, or `High` |

Example:

```csv
Feature Name,Client Name,Client Tier,Feedback Text,Complexity
Mobile notifications,Acme Corp,Top,Users miss time-sensitive alerts,Medium
Dark mode,StartupX,Regular,Requested for low-light usage,Low
```

**Option B — Manual entry**

Setup tab → **Add Feature**. Use for single features or when no source CSV exists.

> **Before your first real import:** clear seeded demo data with **Clear All Features** in the Setup tab. This action is irreversible.

### 6.5 Phase 4 — Running Prioritization

Setup tab → **Run AI Prioritization**.

The Roadmap App submits every feature to the scoring server, which evaluates each AI-scored factor against the feedback text and returns normalized values. Manually entered factors are preserved unchanged.

| Precondition | Consequence if unmet |
| --- | --- |
| Scoring server running | Request fails with a connection error |
| Authenticated via `ant auth login` | Request fails with `401 Unauthorized` |
| Matrix imported | Action is disabled |
| At least one feature present | Action is disabled |

### 6.6 Phase 5 — Analysis and Reporting

| View | Contents | Primary Use |
| --- | --- | --- |
| **Dashboard** | Aggregate metrics, top-ranked features, recent feedback | Daily status review |
| **Analysis** | Effort/impact quadrant, distribution charts, client tier breakdown | Identifying quick wins and strategic bets |
| **Roadmap** | Quarterly board with drag-and-drop scheduling | Capacity planning and sequencing |
| **Reports** | Executive summary, exportable outputs | Stakeholder communication |

All views derive from the active matrix. Re-importing a revised matrix updates every view.

---

## 7. Configuration

### 7.1 Scoring Server Environment Variables

Location: `prioritization-studio/server/.env`

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `ANTHROPIC_MODEL` | String | `claude-sonnet-4-5` | Claude model identifier used for scoring |
| `PORT` | Integer | `4001` | Server listening port |
| `NODE_ENV` | String | `development` | Runtime environment |

> **Important:** No API key variable exists. Authentication is handled exclusively through OAuth via `ant auth login`.

### 7.2 Model Selection

| Model | Relative Cost | Relative Latency | Recommended For |
| --- | --- | --- | --- |
| `claude-haiku-4-5` | Lowest | Fastest | High-volume batches, cost-sensitive workloads |
| `claude-sonnet-4-5` | Moderate | Moderate | Default; balanced quality and cost |
| `claude-opus-4-1` | Highest | Slowest | Nuanced qualitative factors, small batches |

### 7.3 Port Configuration

| Service | Default Port | Override Method |
| --- | --- | --- |
| Scoring server | 4001 | `PORT` in `.env` |
| Roadmap App | 5173 | `--port` flag or `vite.config.js` |
| Studio client | 5174 | `--port` flag or `vite.config.js` |

If you change the scoring server port, update the proxy target in the Roadmap App's `vite.config.js` accordingly.

---

## 8. API Reference

Base URL: `http://localhost:4001`

### 8.1 Health Check

```http
GET /api/health
```

**Response — 200 OK**

```json
{
  "status": "ok",
  "authenticated": true,
  "model": "claude-sonnet-4-5"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `status` | String | `ok` when the service is operational |
| `authenticated` | Boolean | Whether valid OAuth credentials were found |
| `model` | String | Active Claude model identifier |

### 8.2 Score Features

```http
POST /api/score
Content-Type: application/json
```

**Request body**

```json
{
  "features": [
    {
      "id": "FB001",
      "name": "Mobile notifications",
      "feedbackText": "Users miss time-sensitive alerts",
      "clientTier": "Top"
    }
  ],
  "matrix": {
    "tierWeights": { "Top": 3.0, "Regular": 1.0 },
    "factors": [
      { "name": "Urgency", "weight": 0.4, "aiScored": true },
      { "name": "Effort", "weight": 0.3, "aiScored": false }
    ]
  }
}
```

**Response — 200 OK**

```json
{
  "results": [
    {
      "id": "FB001",
      "factorScores": { "Urgency": 8 },
      "compositeScore": 24.0
    }
  ]
}
```

### 8.3 Error Responses

| Status | Condition | Response Body |
| --- | --- | --- |
| `400` | Malformed request or invalid matrix | `{ "error": "Invalid matrix schema" }` |
| `401` | Missing or expired OAuth credentials | `{ "error": "Not authenticated. Run: ant auth login" }` |
| `429` | Upstream rate limit exceeded | `{ "error": "Rate limited", "retryAfter": 30 }` |
| `500` | Unhandled server error | `{ "error": "Internal server error" }` |

---

## 9. Security

### 9.1 Credential Handling

| Practice | Implementation |
| --- | --- |
| No API keys in the repository | Authentication is OAuth-only via `ant auth login` |
| Credentials stored outside the project | `~/.config/anthropic/` |
| `.env` excluded from version control | Listed in `.gitignore` |
| Only `.env.example` is committed | Contains no secrets |

### 9.2 Data Handling

| Consideration | Current Behavior |
| --- | --- |
| Feedback storage | Browser `localStorage`; never transmitted except during scoring |
| Data transmitted to Claude | Feature names and feedback text for AI-scored factors only |
| Client PII | **Not** protected by this application — see below |
| Server-side persistence | None; the scoring server is stateless |

> **Warning — Personally identifiable information**
>
> This application applies no PII redaction. Do not enter client names, email addresses, or other identifying details into the `Feedback Text` field if that data must not leave your environment. Text in that field is transmitted to the Claude API during AI scoring.
>
> If your feedback contains PII, pseudonymize client identifiers before import and maintain the mapping outside this repository.

### 9.3 Pre-Commit Verification

Confirm no secrets are staged before pushing:

```bash
git diff --cached --name-only | grep -E "\.env$|credentials|\.pem$"
```

An empty result indicates no sensitive files are staged.

---

## 10. Troubleshooting

### 10.1 Scoring Server

| Symptom | Probable Cause | Resolution |
| --- | --- | --- |
| `EADDRINUSE: address already in use :::4001` | Port occupied by another process | `lsof -ti:4001 \| xargs kill -9` |
| `/api/health` returns `authenticated: false` | OAuth credentials absent or expired | Run `ant auth login`, then restart the server |
| `401 Unauthorized` on scoring requests | Server started before authentication completed | Restart the server |
| `429 Rate limited` | Upstream API rate limit reached | Reduce batch size or wait for the window to reset |

### 10.2 Authentication

| Symptom | Probable Cause | Resolution |
| --- | --- | --- |
| `"ant" cannot be opened because the developer cannot be verified` | macOS Gatekeeper quarantine | `xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"` |
| `ant: command not found` | Binary not on `PATH` | Confirm with `brew --prefix`; reopen the terminal |
| Login succeeds but the server reports unauthenticated | Server holds a stale process environment | Restart the scoring server |

### 10.3 Client Applications

| Symptom | Probable Cause | Resolution |
| --- | --- | --- |
| `/api` requests return 404 | Scoring server not running | Start the server; verify with `/api/health` |
| **Run AI Prioritization** is disabled | No matrix imported, or no features present | Import a matrix and add at least one feature |
| CSV import rejects the file | Header row does not match the required schema | Compare against [section 6.4](#64-phase-3--ingesting-feedback) |
| Charts render empty | Features exist but are unscored | Run AI prioritization or enter manual factor values |
| Data disappears after a browser refresh | `localStorage` cleared, or private browsing mode | Disable private browsing; export data before clearing site data |

### 10.4 Installation

| Symptom | Probable Cause | Resolution |
| --- | --- | --- |
| `npm install` fails with peer dependency errors | Node.js version below 18 | Upgrade Node.js; verify with `node --version` |
| Corrupted `node_modules` | Interrupted install | `rm -rf node_modules package-lock.json && npm install` |

---

## 11. Contributing

### 11.1 Development Setup

```bash
git clone https://github.com/KiranBabu729/feature-prioritization-suite.git
cd feature-prioritization-suite
git checkout -b feature/your-feature-name
```

Install dependencies for each workspace you intend to modify, following [section 5](#5-installation).

### 11.2 Branch Naming

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feature/` | New functionality | `feature/csv-column-mapping` |
| `fix/` | Bug fix | `fix/quadrant-axis-scaling` |
| `docs/` | Documentation only | `docs/api-reference-examples` |
| `refactor/` | Restructuring without behavior change | `refactor/scoring-module` |

### 11.3 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>
```

| Type | Use |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code restructuring |
| `test` | Test additions or corrections |
| `chore` | Build process or tooling |

Examples:

```
feat(roadmap): add quarterly capacity indicator
fix(server): handle empty feedback text in scoring request
docs(readme): document CSV schema constraints
```

### 11.4 Pull Request Checklist

- [ ] Branch is current with `main`
- [ ] Commits follow Conventional Commits
- [ ] No secrets, `.env` files, or credentials are staged
- [ ] Documentation updated for any behavior change
- [ ] Changes verified locally against the checklist in [section 5.6](#56-verification-checklist)
- [ ] PR description states the problem addressed and the approach taken

---

## 12. Roadmap

| Status | Item | Notes |
| --- | --- | --- |
| Shipped | Configurable scoring matrix | — |
| Shipped | CSV and manual feedback ingestion | — |
| Shipped | AI-assisted factor scoring | — |
| Shipped | Quadrant analysis and roadmap board | — |
| Planned | Automated test coverage | Unit tests for the scoring module |
| Planned | Persistent storage backend | Replace `localStorage` for multi-user use |
| Planned | PII redaction before API transmission | Addresses the limitation in [section 9.2](#92-data-handling) |
| Planned | PDF report export | Currently JSON only |
| Under consideration | Direct integration with issue trackers | Jira, Linear |

---

## 13. License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for the full text.

---

## 14. Support

| Channel | Use For | Link |
| --- | --- | --- |
| GitHub Issues | Bug reports, feature requests | [Open an issue](https://github.com/KiranBabu729/feature-prioritization-suite/issues) |
| Component READMEs | Application-specific detail | [`roadmap-app/`](roadmap-app/README.md) · [`prioritization-studio/client/`](prioritization-studio/client/README.md) · [`prioritization-studio/server/`](prioritization-studio/server/README.md) |

### Filing an Effective Issue

Include the following:

1. Environment — operating system, Node.js version, affected component
2. Reproduction steps — numbered and specific
3. Expected result
4. Actual result — with the complete error message
5. Relevant configuration — with secrets redacted

---

<div align="center">

**Feature Prioritization Suite** · MIT License

</div>
