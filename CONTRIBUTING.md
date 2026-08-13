# Contributing

Thank you for considering a contribution to Feature Prioritization Suite.

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [Development Workflow](#3-development-workflow)
4. [Commit Standards](#4-commit-standards)
5. [Pull Requests](#5-pull-requests)
6. [Coding Standards](#6-coding-standards)
7. [Documentation Standards](#7-documentation-standards)
8. [Reporting Issues](#8-reporting-issues)

---

## 1. Code of Conduct

Participants are expected to engage respectfully and constructively. Report unacceptable behavior through [GitHub Issues](https://github.com/KiranBabu729/feature-prioritization-suite/issues).

---

## 2. Getting Started

### 2.1 Fork and Clone

```bash
git clone https://github.com/<your-username>/feature-prioritization-suite.git
cd feature-prioritization-suite
git remote add upstream https://github.com/KiranBabu729/feature-prioritization-suite.git
```

### 2.2 Install

Install only the workspaces you intend to modify.

```bash
# Scoring server
cd prioritization-studio/server && npm install && cp .env.example .env

# Roadmap App
cd ../../roadmap-app && npm install

# Studio client
cd ../prioritization-studio/client && npm install
```

### 2.3 Authenticate

Required only for work touching AI scoring.

```bash
# macOS
brew install anthropics/tap/ant
xattr -d com.apple.quarantine "$(brew --prefix)/bin/ant"
ant auth login

# Linux
curl -fsSL https://claude.com/install.sh | sh
ant auth login
```

---

## 3. Development Workflow

### 3.1 Sync Before Branching

```bash
git checkout main
git pull upstream main
```

### 3.2 Branch

```bash
git checkout -b <type>/<short-description>
```

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feature/` | New functionality | `feature/csv-column-mapping` |
| `fix/` | Bug fix | `fix/quadrant-axis-scaling` |
| `docs/` | Documentation only | `docs/api-reference-examples` |
| `refactor/` | Restructuring, no behavior change | `refactor/scoring-module` |
| `test/` | Test additions or corrections | `test/matrix-validation` |
| `chore/` | Tooling, dependencies, build | `chore/bump-vite` |

Use lowercase and hyphens. Keep descriptions under five words.

### 3.3 Verify Before Pushing

| Check | Command |
| --- | --- |
| Server health | `curl http://localhost:4001/api/health` |
| Authentication | `ant auth status` |
| No secrets staged | `git status --porcelain \| grep -E "\.env$\|credentials\|\.pem$"` |
| Build passes | `npm run build` in each modified workspace |

---

## 4. Commit Standards

This project follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

### 4.1 Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 4.2 Types

| Type | Use |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting; no logic change |
| `refactor` | Restructuring; no behavior change |
| `perf` | Performance improvement |
| `test` | Tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Anything else not touching `src` or tests |

### 4.3 Scopes

| Scope | Area |
| --- | --- |
| `roadmap` | Roadmap App |
| `studio` | Studio client |
| `server` | Scoring server |
| `matrix` | Scoring model or matrix schema |
| `docs` | Documentation |

### 4.4 Subject Rules

- Imperative mood — "add", not "added" or "adds"
- No trailing period
- 72 characters or fewer
- Lowercase after the colon

### 4.5 Examples

```
feat(roadmap): add quarterly capacity indicator to the board

fix(server): handle empty feedback text in scoring requests

Previously an empty feedbackText produced an unhandled exception in
the factor normalizer. Empty values now score 0 and log a warning.

Closes #42
```

```
docs(server): correct field names in the /api/score reference
```

### 4.6 Breaking Changes

Append `!` after the scope and add a `BREAKING CHANGE:` footer.

```
feat(matrix)!: rename tierWeights to clientTierWeights

BREAKING CHANGE: matrix.json files exported before v2.0 must be
regenerated. The import parser rejects the old field name.
```

Matrix schema changes are breaking by definition — they invalidate every previously exported matrix.

---

## 5. Pull Requests

### 5.1 Before Opening

- [ ] Branch is current with `upstream/main`
- [ ] Commits follow Conventional Commits
- [ ] No `.env`, credentials, or key files staged
- [ ] Documentation updated for any behavior change
- [ ] Build passes in every modified workspace
- [ ] Verified locally against the checklist in the [root README §5.6](README.md#56-verification-checklist)

### 5.2 Description

State:

1. **Problem** — what was wrong or missing
2. **Approach** — how this change addresses it
3. **Verification** — how you confirmed it works
4. **Risk** — what could break, and what you checked
5. **Related issues** — `Closes #42`

### 5.3 Scope

One logical change per pull request. Split unrelated changes. A PR touching the scoring model and the CSS in the same commit is harder to review and harder to revert.

### 5.4 Review

Maintainers may request changes. Push additional commits to the same branch — do not force-push during active review, as it discards reviewer context.

---

## 6. Coding Standards

**`[VERIFY]`** — This project has no linter or formatter configuration documented. Either add ESLint and Prettier configs and document the commands here, or state explicitly that formatting is at contributor discretion. Ambiguity here produces noisy diffs.

### 6.1 Scoring Model Parity

Both client applications must compute scores identically. Any change to the scoring model requires:

1. Updating both implementations in the same pull request
2. Verifying the same feature scores identically in both
3. Documenting the change in [`CHANGELOG.md`](CHANGELOG.md)

Divergence between the two is a defect regardless of which is correct.

### 6.2 Data Handling

Do not add code that transmits client data beyond what is documented in [`SECURITY.md`](SECURITY.md). Any new outbound field must be documented there in the same pull request.

---

## 7. Documentation Standards

Documentation changes follow the same review process as code.

| Requirement | Standard |
| --- | --- |
| Structure | Numbered sections with a table of contents |
| Tables | Used for any enumerable set — options, errors, variables |
| Commands | Fenced code blocks with the language annotated |
| Links | Relative for in-repo targets |
| Unverified claims | Marked, not asserted |

Behavior changes require the corresponding README update in the same pull request. Documentation that lags code is worse than absent documentation, because it is trusted.

---

## 8. Reporting Issues

Use the templates under [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/). Include:

1. **Environment** — OS, Node.js version, affected component
2. **Steps to reproduce** — numbered and specific
3. **Expected result**
4. **Actual result** — with the complete error message
5. **Configuration** — with secrets redacted

Redact API responses, tokens, and client data before pasting logs.
