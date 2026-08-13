# Prioritization Studio — Scoring Server

A small Express API that scores feedback items against weighted, PDL-defined factors using the Claude API, returning structured JSON output (a 0–10 score per factor, plus a short rationale). Used by both the [Roadmap App](../../roadmap-app) and the [Studio client](../client).

## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Authentication](#authentication)
- [Running](#running)
- [Architecture](#architecture)
- [API reference](#api-reference)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20.x or later (ESM + top-level `dotenv/config` import; tested on 22.16.0) |
| npm | 10.x or later |
| [`ant` CLI](https://github.com/anthropics/ant) | latest — provides the OAuth session this server authenticates with |

Key dependencies (see [`package.json`](./package.json) for the full, version-pinned list):

| Package | Version | Role |
|---|---|---|
| `express` | ^5.1.0 | HTTP server and routing |
| `@anthropic-ai/sdk` | ^0.70.0 | Claude API client, structured output parsing, typed error classes |
| `zod` | ^4.0.0 | Runtime schema for per-factor score validation |
| `cors` | ^2.8.5 | Cross-origin support for the dev-server clients |
| `dotenv` | ^17.2.3 | Loads `.env` into `process.env` |

## Setup

```bash
npm install
cp .env.example .env
```

`.env` only needs two variables — there is no API key to configure:

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_MODEL` | `claude-opus-5` | Model used for scoring calls. |
| `PORT` | `4001` | Port the Express server listens on. |

## Authentication

This server authenticates as **you**, via the `ant` CLI's OAuth login, rather than a static service API key.

```bash
brew install anthropics/tap/ant
xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"
ant auth login
```

That opens a browser to sign in and stores credentials at `~/.config/anthropic/` — nothing is written into this repository. Verify it worked:

```bash
ant auth status
```

This should show `Logged in to ... as <your email>` with an active credential.

## Running

```bash
npm run dev     # node --watch src/index.js — restarts on file changes
npm start       # node src/index.js — no watch, for production-like runs
```

On startup the server checks for a valid OAuth token and logs whether scoring is ready. Confirm it's up:

```bash
curl http://localhost:4001/api/health
```

## Architecture

```
src/
├── index.js            Express app: routes, request validation, error shaping
├── auth.js              OAuth token acquisition/caching via the `ant` CLI
├── anthropicClient.js   Anthropic SDK client instance (apiKey/authToken forced null)
├── scoring.js            Builds the per-request Zod schema and calls the Claude API
└── batch.js              Bounded-concurrency runner for scoring multiple items
```

Request flow for `POST /api/score-batch`:

1. `index.js` validates the request body (`items`, `factors`, optional `concurrency`).
2. `batch.js`'s `runBatch` fans the items out across `min(max(concurrency, 1), 8)` concurrent lanes (default 4), calling `scoring.js`'s `scoreFeedbackItem` for each one. Each item's outcome is captured independently (`Promise.allSettled` semantics), so one item failing — e.g. a rate limit — never aborts the rest of the batch.
3. `scoring.js` builds a Zod schema on the fly from the requested `factors` (one `0–10` numeric field per factor id, plus a `rationale` string), and calls the Claude API via `anthropic.beta.messages.parse(...)` with that schema as the structured `output_format`.
4. `auth.js` supplies the bearer token for that call (see [Authentication](#authentication)); on a 401 mid-session the cached token is dropped and the request is retried once with a freshly fetched one (`scoring.js`, `callModel`).
5. `index.js` maps each settled/rejected result back to `{ id, ok, ... }` and returns the batch as a single JSON response.

## API reference

Verified directly against the route handlers in [`src/index.js`](./src/index.js).

### `GET /api/health`

Liveness/readiness check. No request body.

**Response `200`:**

```json
{ "ok": true, "model": "claude-opus-5" }
```

`model` reflects `process.env.ANTHROPIC_MODEL`, falling back to `"claude-opus-5"` if unset.

### `POST /api/score-batch`

Scores a batch of feedback items against a set of weighted factors.

**Request body:**

```json
{
  "items": [
    {
      "id": "string, required",
      "name": "string",
      "clientName": "string",
      "clientTier": "string, e.g. \"Top Tier\"",
      "feedbackText": "string, required"
    }
  ],
  "factors": [
    {
      "id": "string — used as the score's JSON key",
      "name": "string",
      "description": "string — shown to the model as scoring guidance"
    }
  ],
  "concurrency": 4
}
```

- `items` must be a non-empty array; every item must have `id` and `feedbackText` (`400` otherwise).
- `factors` must be an array (may be empty — an empty array returns `{ scores: {}, rationale: "No AI-scored factors configured." }` for every item without calling the model). Only factors with `source: "ai"` should be included; manually scored factors are the PDL's responsibility in the UI, not the model's.
- `concurrency` is optional, defaults to `4`, and is clamped to the range `[1, 8]` regardless of what's sent.

**Response `200`:**

```json
{
  "results": [
    {
      "id": "matches the request item's id",
      "ok": true,
      "scores": { "factorId1": 7.5, "factorId2": 3 },
      "rationale": "One or two sentences justifying the scores."
    },
    {
      "id": "some-other-id",
      "ok": false,
      "error": "human-readable message",
      "retryable": true,
      "retryAfterSeconds": 20
    }
  ]
}
```

- One result per input item, in input order.
- Failed items (`ok: false`) include `error` and a `retryable` flag — `true` for `Anthropic.RateLimitError`, `Anthropic.APIConnectionError`, `Anthropic.InternalServerError`, or any error with an HTTP status `>= 500`. `retryAfterSeconds` is present only when the upstream error carried a `retry-after` header.

**Error responses:**

| Status | Condition | Body |
|---|---|---|
| `400` | `items` missing, not an array, or empty | `{ "error": "items must be a non-empty array" }` |
| `400` | `factors` missing or not an array | `{ "error": "factors must be an array" }` |
| `400` | Any item missing `id` or `feedbackText` | `{ "error": "each item requires id and feedbackText" }` |
| `500` | Unexpected failure in the batch runner itself (not an individual item failure, which is reported per-item with `ok: false` instead) | `{ "error": "Batch scoring failed unexpectedly" }` |

## Security

- **No API key ever touches this repo or process environment as a secret.** `src/anthropicClient.js` explicitly constructs the Anthropic SDK client with `apiKey: null, authToken: null` so a stray blank `ANTHROPIC_API_KEY` in `.env` can never silently shadow the intended OAuth flow (an empty string is falsy but not `null`, which the SDK's own env-var fallback would otherwise pick up).
- **Bearer token, not stored, short cache window.** `src/auth.js` shells out to `ant auth print-credentials --access-token` and caches the result in memory for 4 minutes; the token is never written to disk by this server. The `ant` CLI itself is responsible for the underlying credential's refresh.
- **Required OAuth beta header.** Every request to the Claude API sends `anthropic-beta: oauth-2025-04-20` alongside the `Authorization: Bearer <token>` header — some endpoints, including `/v1/messages`, reject bearer auth without it.
- **CORS is fully open** (`app.use(cors())` with no options in `src/index.js`) and there is **no authentication on the server's own endpoints** — any origin that can reach `http://localhost:4001` can call `/api/score-batch` and consume your Claude quota. This is intentional for local development (both React dev servers run on different ports and need cross-origin access) but is **not safe to expose beyond localhost** as-is. Before deploying this server anywhere reachable by other users, add an origin allowlist to the `cors()` call and put your own auth/rate-limiting in front of it.
- **Body size is capped** at 5 MB (`express.json({ limit: "5mb" })`) to bound request payloads, but there is no per-client rate limiting — add one before exposing this server outside a trusted local network.
- See the repository-wide [SECURITY.md](../../SECURITY.md) for how to report a vulnerability.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Startup log shows a warning instead of "OAuth credentials found" | `ant` isn't installed or you haven't logged in | Run `ant auth login`, then restart the server. |
| Every `/api/score-batch` item comes back with `ok: false` and an authentication error | Cached OAuth token expired and the retry also failed, or `ant auth login` session expired | Run `ant auth status` to confirm you're logged in; re-run `ant auth login` if not. |
| `400 items must be a non-empty array` | Client sent an empty or missing `items` array | Check the caller — this is a client-side request bug, not a server issue. |
| `500 Batch scoring failed unexpectedly` | An error was thrown outside the per-item error handling in `runBatch` (e.g. a bug in `scoring.js` itself) | Check the server's stderr log — the underlying error is logged via `console.error` before the generic message is returned. |
| `EADDRINUSE: address already in use :::4001` | Another process (often a previous `npm run dev`) still holds the port | Stop the other process, or set a different `PORT` in `.env`. |
| Model responses come back empty / `Model did not return parseable output` | The model didn't produce output matching the generated Zod schema for the given `factors` | Check that `factors` have sensible `id`/`name`/`description` values; retry — this can also be transient. |

## Contributing

See the repository-wide [CONTRIBUTING.md](../../CONTRIBUTING.md).
