# Threat Model

## Project Overview

This is a full-stack OSINT platform with a React frontend and an Express/Node.js backend backed by PostgreSQL through Drizzle ORM. The production server entry point is `server/index.ts`, and almost all backend functionality is exposed through `server/routes.ts` under `/api/*`.

Production authentication is implemented with `express-session` and PostgreSQL-backed session storage. Most sensitive OSINT, AI, chatbot, and intelligence routes now require a server-side session, but the security posture still depends on abuse controls, session lifecycle hygiene, and strict tenant isolation for any process-wide in-memory state.

## Assets

- **Stored OSINT queries and results** — domains, IPs, email addresses, people-search results, scan metadata, and generated reports. These are the main customer data set and may contain sensitive investigative material.
- **User accounts and authenticated sessions** — usernames, password hashes, live session cookies, and session records in PostgreSQL. Compromise enables access to stored investigations and AI features.
- **Chatbot conversations and AI prompts** — analyst questions, assistant answers, and any OSINT context included in prompts. This data can contain confidential customer workflows and targets.
- **Application secrets** — `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, and any future external API credentials. Misuse of these secrets can expose data or create direct financial impact.
- **Process-wide shared state** — in-memory intelligence alerts, behavioral data, knowledge-base state, and chatbot/session caches that live inside the Node process.

## Trust Boundaries

- **Browser to API** — every `/api/*` route crosses from an untrusted client into privileged backend code. The server must authenticate callers where required and treat all client data as untrusted.
- **Public to authenticated boundary** — `POST /api/auth/register` and `POST /api/auth/login` are intentionally public; most stored-data and AI routes are authenticated. Abuse controls on this boundary matter because internet attackers can hit auth endpoints directly.
- **API to PostgreSQL** — the backend has direct access to stored queries, reports, users, and session records. Broken ownership checks or injection at the API layer becomes database disclosure or tampering.
- **API to OpenAI** — multiple routes send prompts and investigation context to OpenAI using a server-side secret key. This boundary carries confidentiality, spend-risk, and availability concerns.
- **Request to process-memory boundary** — intelligence services and chatbot/history features use singleton in-memory structures. Per-user or per-tenant isolation must be enforced explicitly before shared state is returned to callers.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`
- **Highest-risk code areas:** auth routes in `server/routes.ts`, `server/storage.ts`, `server/services/ai-service.ts`, `server/services/chatbot-service.ts`, `server/services/real-time-intelligence.ts`, `server/services/threat-intelligence-kb.ts`
- **Public surface:** `POST /api/auth/register`, `POST /api/auth/login`, and a few low-sensitivity helper routes such as base64/dork generators; treat most other `/api/*` routes as authenticated but still attacker-controlled
- **Dev-only / lower-priority areas:** `server/vite.ts` and the Replit dev banner in `client/index.html` are development concerns; the simulated Kali/Metasploit/network-tool outputs in `server/routes.ts` and `server/services/osint.ts` are not real shell execution unless replaced with production implementations

## Threat Categories

### Spoofing

The application must prevent internet attackers from turning the public login surface into practical account takeover. Authentication endpoints must enforce rate limits or equivalent abuse controls, and session identifiers must be rotated when a user moves from anonymous to authenticated state so a known pre-login session cannot become the victim's logged-in session.

### Tampering

Stored OSINT records, reports, and intelligence state must only be writable by the owning user or an authorized admin path. Any process-wide cache or singleton that is influenced by one user's investigation data must not be writable in a way that changes what other tenants see.

### Information Disclosure

OSINT queries, reports, chatbot history, AI prompt context, and intelligence dashboards must never expose one tenant's targets or results to another. Shared in-memory alert lists or derived intelligence views must be scoped per user or per tenant before they are returned.

### Denial of Service

Public auth endpoints and authenticated AI/intelligence endpoints must enforce abuse controls that reflect both request volume and cost. Login must resist credential-stuffing attacks, and AI-backed routes must apply request-size or token-budget limits so one user cannot convert a small amount of traffic into disproportionate spend or degraded availability.

### Elevation of Privilege

Ownership checks must be enforced server-side for every route that reads or mutates stored data. Numeric IDs, session presence alone, or global singleton state must never act as implicit authorization across tenants or roles.
