# Contributing

Thanks for your interest in improving the Feature Prioritization Suite. This guide covers how the repository is organized, how to get a change tested locally, and what we look for in a pull request.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Coding conventions](#coding-conventions)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Reporting bugs](#reporting-bugs)
- [Reporting security issues](#reporting-security-issues)

## Code of conduct

Be respectful and constructive. Disagreements about approach are fine; personal attacks, harassment, or bad-faith reviews are not.

## Repository layout

This is a small multi-app repository, not a monorepo with shared tooling — each app has its own `package.json`, dependencies, and dev server:

```
.
├── roadmap-app/                       Day-to-day PDL workspace (React SPA)
├── prioritization-studio/
│   ├── client/                         Matrix design/test UI (React SPA)
│   └── server/                          Scoring API (Express)
├── LICENSE, CONTRIBUTING.md, SECURITY.md, CHANGELOG.md
└── README.md                           Suite-level overview and quick start
```

See the [top-level README's architecture section](./README.md#architecture) for how the pieces fit together, and each app's own README for its internals.

## Getting started

1. Fork and clone the repository.
2. Install dependencies per app (there is no root-level `npm install`):
   ```bash
   cd roadmap-app && npm install && cd ..
   cd prioritization-studio/client && npm install && cd ../..
   cd prioritization-studio/server && npm install && cp .env.example .env && cd ../..
   ```
3. Follow the [Quick start](./README.md#quick-start) in the top-level README to run all three processes.
4. If your change touches AI scoring, you'll need `ant auth login` — see [`prioritization-studio/server/README.md#authentication`](./prioritization-studio/server/README.md#authentication).

## Development workflow

- Create a branch off `main` named for the change, e.g. `fix/csv-import-header-detection` or `feat/roadmap-export-filters`.
- Keep changes scoped to one app where possible — cross-cutting changes (e.g. to the shared matrix export/import format) should call that out explicitly in the PR description, since both `roadmap-app` and `prioritization-studio/client` depend on that format staying compatible.
- Run the relevant app's linter before opening a PR:
  ```bash
  npm run lint   # oxlint, run from within roadmap-app/ or prioritization-studio/client/
  ```
- There is no automated test suite in this repository yet. Manually verify your change using the affected app's dev server (`npm run dev`), and note in the PR description what you tested and how.
- If you touch `prioritization-studio/server`, verify both `GET /api/health` and `POST /api/score-batch` still behave as documented in [its API reference](./prioritization-studio/server/README.md#api-reference) — including the validation and error-response paths, not just the happy path.

## Coding conventions

- **JavaScript/JSX, ESM throughout** (`"type": "module"` in every `package.json`) — no CommonJS `require`.
- **No inline code comments unless the *why* is non-obvious.** This codebase favors self-explanatory naming over prose; comments here are reserved for hidden constraints or workarounds (see existing examples in `prioritization-studio/server/src/auth.js` and `anthropicClient.js`).
- **Match existing file structure**: one component per file in `components/`, one tab per file in `tabs/`, pure helper logic in `utils/`.
- **Client apps stay backend-agnostic beyond the scoring API.** Don't add new server-side dependencies to `roadmap-app` or `prioritization-studio/client` — they're static SPAs by design.
- **Server stays a thin, stateless API.** Don't add persistence (databases, file writes of user data) to `prioritization-studio/server` without discussing it first — statelessness is a deliberate security property (see [SECURITY.md](./SECURITY.md)).
- Run `npm run lint` (oxlint) in the app you changed and fix reported issues before requesting review.

## Commit messages

Write commit messages that explain **why**, not just what — the diff already shows what changed. Keep the summary line under ~72 characters where practical.

## Pull requests

1. Update or add documentation for any user-facing or API-visible change — including the relevant README's [API reference](./prioritization-studio/server/README.md#api-reference) if you change a route handler's request/response shape.
2. Add an entry under `[Unreleased]` in [CHANGELOG.md](./CHANGELOG.md), following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions (`Added` / `Changed` / `Fixed` / `Removed`).
3. Describe what you tested and how (which app, which dev server, manual steps) in the PR description — this repo has no CI test suite, so this is the primary record of verification.
4. Keep PRs focused — prefer several small PRs over one large one spanning unrelated apps.
5. A maintainer will review and may request changes before merging.

## Reporting bugs

Open a GitHub issue with:

- Which app (`roadmap-app`, `prioritization-studio/client`, or `prioritization-studio/server`)
- Steps to reproduce
- Expected vs. actual behavior
- Browser/Node version if relevant

## Reporting security issues

Do not open a public issue — see [SECURITY.md](./SECURITY.md) for the private reporting process.
