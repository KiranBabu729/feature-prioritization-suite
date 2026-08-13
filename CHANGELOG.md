# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Documentation set restructured to international standards: root README with
  architecture, API reference, and security sections; component READMEs for the
  Roadmap App, Prioritization Studio, Studio client, and scoring server
- `LICENSE` (MIT)
- `CONTRIBUTING.md` with Conventional Commits and pull request standards
- `SECURITY.md` documenting credential handling, data flow, and the PII limitation
- `CHANGELOG.md`
- GitHub issue and pull request templates
- `docs/VERIFICATION.md` tracking documentation claims pending source verification

### Notes

- The PII limitation in `SECURITY.md` §5.1 documents pre-existing behavior; it is
  not a change in behavior

---

## [0.1.0] — 2026-08-11

### Added

- Roadmap App: CSV and manual feedback ingestion, dashboard, quadrant analysis,
  quarterly roadmap board, exportable reports
- Prioritization Studio client: matrix designer with client tier weights,
  configurable weighted factors, AI-scored and manual factor designation, and
  matrix export
- Scoring server: Claude API broker with OAuth authentication and health endpoint
- Portable `matrix.json` contract shared between both applications

---

<!--
MAINTENANCE

Add entries under [Unreleased] as work merges. On release, replace the heading
with the version and date, and open a fresh [Unreleased] section.

Categories, in order: Added, Changed, Deprecated, Removed, Fixed, Security.

Version increments:
  MAJOR  breaking change - includes any matrix.json schema change
  MINOR  backward-compatible functionality
  PATCH  backward-compatible fixes

VERIFY: the 0.1.0 date above is the repository's first commit date. Confirm with
  git log --reverse --format=%ad --date=short | head -1
-->

[Unreleased]: https://github.com/KiranBabu729/feature-prioritization-suite/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KiranBabu729/feature-prioritization-suite/releases/tag/v0.1.0
