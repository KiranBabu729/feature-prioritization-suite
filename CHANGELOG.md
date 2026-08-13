# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once its first tagged release ships.

## [Unreleased]

### Added

- Documentation overhaul: every README in the repository rewritten to a consistent standard (table of contents, versioned prerequisites, architecture, API reference verified against the actual route handlers, security section, troubleshooting, contribution guide).
- `LICENSE` (MIT).
- `CONTRIBUTING.md` — development workflow, coding conventions, pull request process.
- `SECURITY.md` — vulnerability reporting process and known design constraints.
- `CHANGELOG.md` (this file).

## [0.1.0] - Initial commit

### Added

- **Roadmap App** (`roadmap-app/`) — Dashboard, Analysis, Roadmap, Reports, and Setup tabs; CSV/manual feedback import; drag-and-drop quarterly roadmap board; JSON/PDF report export.
- **Prioritization Studio client** (`prioritization-studio/client/`) — Data, Matrix, and Prioritize tabs for designing and test-scoring a prioritization matrix.
- **Prioritization Studio server** (`prioritization-studio/server/`) — Express API (`GET /api/health`, `POST /api/score-batch`) that scores feedback against weighted factors via the Claude API, authenticated through the `ant` CLI's OAuth flow.

[Unreleased]: https://github.com/KiranBabu729/feature-prioritization-suite/compare/main...HEAD
