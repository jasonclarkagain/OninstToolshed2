# Threat Model

## Project Overview

This is a full-stack OSINT platform with a React frontend and an Express/Node.js backend backed by PostgreSQL through Drizzle ORM. The production server entry point is `server/index.ts`, and almost all backend functionality is exposed through `server/routes.ts` under `/api/*`.

The highest-risk production behavior is not the simulated Kali/Metasploit UI, but the real server-side handling of stored OSINT queries, reports, chatbot conversations, and OpenAI-backed analysis features. The codebase defines user and role fields in the database schema, but there is currently no implemented authentication or authorization layer in the production server.

## Assets

- **Stored OSINT queries and results** — domains, IPs, email addresses, people-search results, scan metadata, and generated reports. These are the main customer data set and may contain sensitive investigative material.
- **Chatbot conversations and AI prompts** — analyst questions, assistant answers, and any OSINT context included in prompts. This data can contain confidential customer workflows and targets.
- **Application secrets** — `DATABASE_URL`, `OPENAI_API_KEY`, and any future external API credentials. Misuse of these secrets can expose data or create direct financial impact.
- **Process-wide shared state** — in-memory chatbot history, intelligence alerts, and knowledge-base state that is visible to all requests handled by the same server process.

## Trust Boundaries

- **Browser to API** — every `/api/*` route crosses from an untrusted client into privileged backend code. The server must authenticate callers and enforce ownership checks here.
- **API to PostgreSQL** — the backend has direct access to stored queries, reports, and user records. Any broken access control at the API layer becomes full database disclosure or tampering.
- **API to OpenAI** — multiple routes send stored query data or user prompts to OpenAI using a server-side secret key. This boundary carries both confidentiality and spend-risk concerns.
- **Public to authenticated boundary** — this boundary is intended by the schema (`users`, `role`, `userId`) but is currently absent in the running application.
- **Request to process-memory boundary** — chatbot history and several intelligence structures are global singleton state inside the Node process, so per-user isolation must be implemented explicitly.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`
- **Highest-risk code areas:** `server/routes.ts`, `server/storage.ts`, `server/services/ai-service.ts`, `server/services/chatbot-service.ts`, `server/services/real-time-intelligence.ts`, `server/services/threat-intelligence-kb.ts`
- **Public surface:** currently all `/api/*` routes should be treated as public unless auth is added server-side
- **Dev-only / lower-priority areas:** `server/vite.ts` and the Replit dev banner in `client/index.html` are development concerns; the simulated Kali/Metasploit/network-tool outputs in `server/routes.ts` and `server/services/osint.ts` are not real shell execution unless replaced with production implementations

## Threat Categories

### Spoofing

The application must not trust client identity implicitly. All routes that access stored queries, reports, chatbot conversations, or AI features must require a validated server-side session or equivalent identity, and any client-supplied `userId` must be treated as untrusted input rather than identity proof.

### Tampering

Stored OSINT records, reports, and process-wide investigation state must only be writable by the owning user or an authorized admin path. Endpoints that accept record IDs or mutate shared state must bind those actions to the authenticated user and reject cross-tenant access.

### Information Disclosure

OSINT queries, people-search results, reports, chatbot history, and AI prompt context must never be exposed across tenants. The backend must scope every read to the authenticated user, and any AI integration must only receive the minimum data required for that user's request.

### Denial of Service

Public endpoints that trigger expensive or slow work, especially OpenAI-backed analysis and large fan-out query processing, must enforce rate limits, quotas, and request-size boundaries. Otherwise attackers can cause financial damage or service degradation with low-cost repeated requests.

### Elevation of Privilege

Ownership and role checks must be enforced server-side for every route that reads or mutates stored data. Numeric IDs, optional `userId` fields, and global singleton state must never be used as implicit authorization mechanisms.
