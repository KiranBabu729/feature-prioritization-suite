# Prioritization Studio

Admin tool for designing a prioritization matrix and test-running AI-assisted scoring against it, before that matrix is deployed to the [Roadmap App](../roadmap-app) for day-to-day use.

## Table of contents

- [Prerequisites](#prerequisites)
- [Components](#components)
- [Architecture](#architecture)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20.x or later (tested on 22.16.0) |
| npm | 10.x or later |
| [`ant` CLI](https://github.com/anthropics/ant) | latest — required by the server for AI scoring |

## Components

Two parts, run together:

| Component | Folder | Role |
|---|---|---|
| **Server** | [`server/`](./server) | Express API that calls Claude to score feedback against PDL-defined factors. See its README for OAuth setup and the full [API reference](./server/README.md#api-reference) — this is the part that needs authentication. |
| **Client** | [`client/`](./client) | React UI for designing a prioritization matrix and testing it. See its README for usage and tab-by-tab detail. |

## Architecture

```
prioritization-studio/
├── server/     Express API — scores feedback via the Claude API (see server/README.md)
└── client/      React SPA — matrix design + test scoring UI (see client/README.md)
```

The client calls the server over `POST /api/score-batch`; there is no other integration point between them. See the [top-level README](../README.md#architecture) for how this fits alongside the Roadmap App.

## Security

Studio has no security surface beyond its two components — see [`server/README.md#security`](./server/README.md#security) (authentication, CORS, rate limiting) and [`client/README.md#security`](./client/README.md#security) (local data handling). Report vulnerabilities per the repository-wide [SECURITY.md](../SECURITY.md).

## Troubleshooting

See the [server's troubleshooting table](./server/README.md#troubleshooting) and the [client's troubleshooting table](./client/README.md#troubleshooting) — most issues in this app are one or the other.

## Contributing

See the repository-wide [CONTRIBUTING.md](../CONTRIBUTING.md).

---

See the [top-level README](../README.md) for the full end-to-end workflow across this app and the Roadmap App.
