# Security Policy

## Supported versions

This project does not yet publish tagged releases; security fixes are applied to the `main` branch only.

| Component | Supported |
|---|---|
| `roadmap-app` (main) | ✅ |
| `prioritization-studio/client` (main) | ✅ |
| `prioritization-studio/server` (main) | ✅ |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report it privately using [GitHub's private vulnerability reporting](https://github.com/KiranBabu729/feature-prioritization-suite/security/advisories/new) on this repository, or email **kiranbabu729@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept code or requests, if applicable)
- The affected component (`roadmap-app`, `prioritization-studio/client`, or `prioritization-studio/server`) and version/commit
- Any suggested remediation, if you have one

You should receive an acknowledgement within **5 business days**. We'll keep you updated as the issue is triaged and fixed, and will credit reporters (unless you'd prefer to stay anonymous) once a fix ships.

## Scope and known design constraints

Some behaviors are intentional trade-offs for a local development tool rather than bugs — please still report them if you believe the risk is understated, but be aware of this context:

- **`prioritization-studio/server` has no authentication of its own and permissive CORS.** It's designed to be run on `localhost` alongside its two React clients. It must **not** be deployed to a shared or internet-facing host without adding an origin allowlist, request authentication, and rate limiting in front of it. See [`prioritization-studio/server/README.md#security`](./prioritization-studio/server/README.md#security).
- **No server-side data persistence.** Both client apps store all workspace data (feedback, matrix configuration) in browser `localStorage`. There is no database to compromise, but anyone with access to a user's browser profile has access to that data.
- **Claude API access is delegated to the operator's personal OAuth session** (via the `ant` CLI), not a shared service credential. A compromised scoring server process can act with the credentials of whoever is currently logged in via `ant auth login` on that machine.

## Disclosure policy

We ask that you give us a reasonable window to fix a confirmed vulnerability before any public disclosure. We aim to resolve critical issues within 30 days of confirmation.
