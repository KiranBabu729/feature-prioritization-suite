# Security Policy

---

## Table of Contents

1. [Supported Versions](#1-supported-versions)
2. [Reporting a Vulnerability](#2-reporting-a-vulnerability)
3. [Credential Handling](#3-credential-handling)
4. [Data Handling](#4-data-handling)
5. [Known Limitations](#5-known-limitations)
6. [Contributor Practices](#6-contributor-practices)

---

## 1. Supported Versions

| Version | Supported |
| --- | --- |
| `main` (unreleased) | Yes |

This project is pre-release. Only the current `main` branch receives fixes.

---

## 2. Reporting a Vulnerability

**Do not open a public issue for a security vulnerability.**

Use GitHub's private reporting: repository → **Security** tab → **Report a vulnerability**.

### 2.1 What to Include

1. Component and file affected
2. Vulnerability class — credential exposure, injection, data leakage
3. Reproduction steps
4. Impact assessment
5. Suggested remediation, if any

### 2.2 Expected Response

| Stage | Target |
| --- | --- |
| Acknowledgement | 5 business days |
| Initial assessment | 10 business days |
| Fix or mitigation plan | Communicated after assessment |

This is a single-maintainer project. Targets are best-effort, not contractual.

---

## 3. Credential Handling

### 3.1 Design

| Practice | Implementation |
| --- | --- |
| No API keys in the repository | Authentication is OAuth-only, via `ant auth login` |
| Credentials stored outside the project | `~/.config/anthropic/` |
| `.env` excluded from version control | Listed in `.gitignore` |
| Only `.env.example` committed | Contains no secrets |
| Per-developer credentials | Each contributor authenticates individually; nothing is shared |

### 3.2 Verification

Confirm `.env` is ignored:

```bash
git check-ignore -v prioritization-studio/server/.env
```

A path in the output means it is correctly ignored. Empty output means it is **not** ignored — fix `.gitignore` before committing anything.

Confirm no secrets are staged:

```bash
git diff --cached --name-only | grep -E "\.env$|credentials|\.pem$|\.key$"
```

Empty output is the correct result.

### 3.3 If a Credential Is Committed

1. **Revoke it immediately** — rotation precedes cleanup
2. Remove it from history with `git filter-repo` or the BFG Repo-Cleaner
3. Force-push the rewritten history
4. Assume the credential is compromised regardless of how briefly it was exposed

Removing a secret in a later commit does **not** remove it from history. It remains retrievable until history is rewritten.

---

## 4. Data Handling

### 4.1 Where Data Lives

| Data | Location | Persisted server-side |
| --- | --- | --- |
| Feature records | Browser `localStorage` | No |
| Feedback text | Browser `localStorage` | No |
| Scoring matrix | Browser `localStorage`, plus exported `matrix.json` | No |
| Scoring requests | In-memory during the request | No |

The scoring server is stateless. It retains nothing after a response is returned.

### 4.2 What Is Transmitted to the Claude API

| Data | Transmitted | Notes |
| --- | --- | --- |
| Feature name | Yes | — |
| Feedback text | Yes | Input to AI-scored factors |
| Client name | **`[VERIFY]`** | Confirm whether included in the prompt |
| Client tier | **`[VERIFY]`** | Confirm whether the label or only the multiplier is sent |
| Manually entered factor values | No | Computed client-side |

Transmission occurs only when **Run AI Prioritization** or Studio test scoring is invoked. All other operation is local.

---

## 5. Known Limitations

### 5.1 No PII Redaction

**This application applies no redaction before transmitting feedback text to the Claude API.**

| Risk | Mitigation |
| --- | --- |
| Client names in feedback text | Pseudonymize before import; hold the mapping outside this repository |
| Email addresses or phone numbers in feedback | Strip during CSV preparation |
| Commercially sensitive detail in feedback | Assess against your data-processing obligations before use |

If your feedback contains data that must not leave your environment, do not run AI prioritization on it. Manual and matrix-driven modes are fully local and transmit nothing.

### 5.2 No Access Control

The application has no authentication. Anyone with access to the browser profile can read all stored feedback, and anyone who can reach the scoring server can spend against your Anthropic account.

**`[VERIFY]`** — Confirm whether the scoring server binds `127.0.0.1` or `0.0.0.0`. A broad bind exposes it to the local network.

### 5.3 No Encryption at Rest

`localStorage` is unencrypted. Feedback is readable by any process with access to the browser profile directory.

### 5.4 Single-Device Data

There is no synchronization or backup. Clearing site data destroys all stored feedback with no recovery path.

### 5.5 Not Production-Hardened

This is a local development tool. It is not suitable for deployment as a shared service without adding authentication, server-side storage, transport security, and access logging.

---

## 6. Contributor Practices

| Practice | Requirement |
| --- | --- |
| Never commit `.env` or credentials | Verify with §3.2 before every push |
| Redact logs before pasting into issues | Remove tokens, API responses, and client data |
| Document new outbound data | Any new field sent to the Claude API must be added to §4.2 in the same pull request |
| Use synthetic data in examples | No real client data in test fixtures, docs, or screenshots |
| Treat scoring divergence as a defect | Both applications must compute identical scores |
