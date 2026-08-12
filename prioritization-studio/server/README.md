# Prioritization Studio — Scoring Server

A small Express API that scores feedback items against PDL-defined weighted factors using the Claude API, with structured JSON output (0–10 per factor, plus a short rationale). Used by both the [Roadmap App](../../roadmap-app) and [Studio client](../client).

## Setup

```bash
npm install
cp .env.example .env
```

`.env` only needs `ANTHROPIC_MODEL` (defaults to `claude-opus-5`) and `PORT` (defaults to `4001`) — there is no API key to configure.

### Authentication (OAuth, not an API key)

This server authenticates as **you**, via the `ant` CLI's OAuth login, rather than a static service API key:

```bash
brew install anthropics/tap/ant
xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"
ant auth login
```

That opens a browser to sign in and stores credentials at `~/.config/anthropic/` — nothing is written into this repo. Verify it worked:

```bash
ant auth status
```

should show `Logged in to ... as <your email>` with an active credential.

### Run

```bash
npm run dev
```

On startup it checks for a valid OAuth token and logs whether scoring is ready. Check `http://localhost:4001/api/health`.

## How auth works internally

`src/auth.js` shells out to `ant auth print-credentials --access-token` (cached ~4 minutes; the `ant` CLI itself handles refresh), and `src/scoring.js` attaches that token as a `Bearer` header plus the `anthropic-beta: oauth-2025-04-20` header on every request to the Claude API — the SDK's own `apiKey`/`authToken` resolution is explicitly disabled in `src/anthropicClient.js` so a blank `.env` value can never silently break auth. On a 401 mid-session, the cached token is dropped and the request is retried once with a freshly fetched one.

## API

`POST /api/score-batch`

```json
{
  "items": [{ "id": "...", "name": "...", "clientName": "...", "clientTier": "Top Tier", "feedbackText": "..." }],
  "factors": [{ "id": "...", "name": "...", "description": "..." }],
  "concurrency": 4
}
```

Returns `{ "results": [{ "id", "ok", "scores", "rationale" }] }` per item; failed items include `error` and a `retryable` flag.
