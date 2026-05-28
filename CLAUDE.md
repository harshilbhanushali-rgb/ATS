# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## MCP Tools: code-review-graph

**ALWAYS use code-review-graph MCP tools BEFORE Grep/Glob/Read to explore the codebase.** The graph is faster, cheaper, and gives structural context (callers, dependents) that file scanning cannot.

| Tool | Use when |
|------|----------|
| `semantic_search_nodes` / `query_graph` | Exploring code instead of Grep |
| `get_impact_radius` | Understanding blast radius of a change |
| `detect_changes` + `get_review_context` | Code review — token-efficient source snippets |
| `query_graph` callers_of/callees_of/imports_of/tests_for | Tracing relationships |
| `get_architecture_overview` + `list_communities` | Architecture questions |
| `get_affected_flows` | Which execution paths are impacted |
| `refactor_tool` | Planning renames, finding dead code |

Fall back to Grep/Glob/Read only when the graph doesn't cover what you need.

---

## Project Overview

Full-stack recruitment SaaS (Joveo internal) managing the entire hiring funnel — requisition → candidate → interview → offer — with Google Gemini AI for resume analysis, candidate matching, outreach drafting, and interview debrief synthesis. Restricted to `@joveo.com` accounts.

**Tech Stack**

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6, react-router-dom 7 |
| Styling | Tailwind CSS, Lucide React, Recharts, framer-motion |
| Backend | FastAPI (async), Python 3.11+, Uvicorn |
| ORM | SQLAlchemy 2.0 async + asyncpg |
| Database | PostgreSQL via Supabase |
| Auth | JWT (HttpOnly cookie `hms_access_token`, 8h expiry) |
| AI | Google Gemini `gemini-3.0-flash-lite` via `google-genai` SDK |
| Validation | Pydantic v2 |

---

## Dev Commands

```bash
# Frontend — port 3000
npm run dev

# Backend — port 8000
cd backend && uvicorn app.main:app --reload --port 8000

# Lint frontend (zero warnings enforced)
npm run lint

# Install deps
npm install
cd backend && pip install -r req.txt
```

No test runner is configured. There are no unit/integration tests in this repo.

---

## Docker (Backend)

Dockerfile is **Hugging Face Spaces compliant** — runs as uid 1000, binds to port 7860.

```bash
# Build
docker build -t ai-hms-backend ./backend

# Run locally (pass env vars at runtime — never bake secrets into the image)
docker run -p 7860:7860 \
  --env-file backend/.env \
  ai-hms-backend

# Run locally remapped to 8000
docker run -p 8000:7860 \
  --env-file backend/.env \
  ai-hms-backend
```

**Files:**

- `backend/Dockerfile` — `python:3.11-slim`, uid 1000 non-root user, port 7860, no `--reload`
- `backend/.dockerignore` — excludes `__pycache__`, `.pyc`, `.env` (secrets stay off the image)

**Notes:**

- Port is **7860** (HF Spaces requirement) — remap with `-p 8000:7860` for local use
- Container runs as uid 1000 (`user`) — required by HF Spaces
- `DATABASE_URL` must use `postgresql+asyncpg://` prefix (not `postgresql://`)
- Mount or inject `backend/.env` at runtime; do not `COPY .env` into the image
- No `--reload` in the Docker CMD — that is for local dev only

---

## Project Structure

```
/
├── CLAUDE.md
├── .claude/plans/
├── vite.config.ts          # Frontend build config (SWC plugin, no proxy, no env injection)
├── .env                    # VITE_API_URL=http://localhost:8000
├── frontend/src/
│   ├── App.tsx             # Root: wires all hooks, passes props to AppShell + AppModals
│   ├── types.ts            # All TypeScript interfaces and enums (source of truth)
│   ├── app/
│   │   ├── AppShell.tsx    # Layout + navigation shell
│   │   ├── AppModals.tsx   # Global modal renderer
│   │   └── AuthGate.tsx    # Shows login screen or children based on auth state
│   ├── components/
│   │   ├── dashboard/      # Dashboard.tsx
│   │   ├── requisitions/   # RequisitionList.tsx, RequisitionForm.tsx
│   │   ├── recruiter/      # RecruiterView.tsx
│   │   ├── sourcer/        # SourcerHubView.tsx, SourcerDashboardView.tsx
│   │   ├── hmhub/          # HiringManagerView.tsx, HiringHubView.tsx
│   │   ├── offerhub/       # OfferHubView.tsx, OfferCard.tsx
│   │   ├── talentpools/    # TalentPoolListView.tsx, TalentPoolForm.tsx
│   │   ├── admin/          # AdminView.tsx, AdminImportView.tsx, UserManagementView.tsx, ScorecardTemplateBuilder.tsx
│   │   ├── reporting/      # SourcePerformanceTab.tsx, PipelineStatusTab.tsx, VelocityTab.tsx, ApplicationsTab.tsx, ProductivityTab.tsx, reportingUtils.ts
│   │   ├── ui/             # Shared animated primitives (AnimatedCounter, MagneticButton, PageTransition)
│   │   └── (root)          # Shared: Card, Modal, Navigation, HelpDrawer, CandidateForm, CandidateList, CandidateInterviewProgressCard, InterviewForm, OfferForm, OutreachDraftModal, LogOutreachForm, ResumeAnalysisDisplay, AIRecommendationsDisplay, CandidateAIDashboardModal, LoginScreen, ReportingView
│   ├── hooks/              # 11 custom hooks — all state lives here
│   ├── services/
│   │   ├── apiClient.ts    # Base fetch client (credentials: include, VITE_API_URL)
│   │   ├── crudApi.ts      # CRUD for all entities, camelCase↔snake_case mappers
│   │   ├── aiApi.ts        # AI endpoints
│   │   └── authApi.ts      # Login/logout/session
│   └── utils/
│       ├── viewUtils.ts    # Route↔View mapping, role-based default views
│       └── metadata.ts     # Metadata update helper
├── backend/app/
│   ├── main.py             # FastAPI app, CORS, lifespan
│   ├── core/
│   │   ├── config.py       # Pydantic Settings (reads backend/.env)
│   │   └── security.py     # JWT generation + password hashing
│   ├── db/
│   │   ├── session.py      # Async SQLAlchemy session dependency
│   │   └── init_db.py      # Table creation + seed data
│   ├── models/             # SQLAlchemy ORM models (7 tables)
│   ├── schemas/            # Pydantic v2 request/response schemas
│   ├── services/           # Business logic (10 modules)
│   ├── api/v1/endpoints/   # FastAPI routers (11 files)
│   └── utils/prompts.py    # All Gemini prompt strings (edit here for AI tuning)
```

---

## Design System

**White + blue (Linear/Stripe aesthetic)** — adopted 2026-05-16.

- **Page background:** `bg-[#F0F4FF]` with `.page-mesh` subtle gradient overlay (fixed, `z-0`)
- **Cards:** `bg-white border border-slate-200 rounded-2xl shadow-sm` — hover lifts via framer-motion `whileHover={{ y: -3 }}`
- **Primary button:** `bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-200`
- **Inputs:** `bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400`
- **Badge pattern:** `bg-{color}-50 text-{color}-700 border border-{color}-200 rounded-full text-[10px] font-bold uppercase tracking-wider`
- **Text:** primary `text-slate-900`, muted `text-slate-500`, accent `text-blue-600`
- **Never use** dark glass tokens (`backdrop-blur-xl`, `white/10`, `slate-8xx/xx`, `from-violet`) in new components

---

## Architecture

### Frontend state pattern

All state lives in `hooks/` (11 hooks). Components are display-only and receive data + callbacks as props. `App.tsx` is the **single wiring point** — it calls every hook and passes everything down through `AppShell` and `AppModals`.

Data hooks guard their `useEffect` with `if (!loggedInUserId) return` — intentional, prevents unauthenticated fetches. `useAuth` sets `isCheckingAuth=true` on mount until `fetchCurrentUser()` resolves; `AuthGate` shows a spinner until then (prevents login flash on reload).

**Context memoization:** Both `AppDataContext.Provider` and `ModalStateContext.Provider` values are wrapped in `useMemo` in `App.tsx`. This prevents all context consumers from re-rendering on every state change, significantly reducing re-renders during data updates.

### API call pattern

`services/crudApi.ts` owns all CRUD calls and field mapping:
- `fromCand()` — snake_case → camelCase (from server)
- `toCand()` — full payload (create/update only)
- `toCandPatch()` — sparse payload, only defined fields (PATCH only)

**Never use `toCand` for partial updates** — it sends `null` for undefined fields and wipes data like `resume_text`. Always use `toCandPatch` for `patchCandidate`.

### Navigation

URL-based via react-router-dom. `utils/viewUtils.ts` maps between the `View` enum and URL paths. `getViewForRole()` determines the post-login default per role.

### Backend PATCH pattern

Use `model_dump(exclude_unset=True)` in service layer — only update fields explicitly present in the request body.

### Backend create pattern

Strip `None` IDs before insert; catch `IntegrityError` → HTTP 409. Frontend reconciles with the server-assigned ID from the response.

### SQLAlchemy `metadata_` conflict

SQLAlchemy `Base` has a class-level `metadata = MetaData()`. Our ORM models use a `metadata_` column. In Pydantic `*Out` schemas, use `serialization_alias="metadata"` only — **never** `validation_alias="metadata"` — so Pydantic reads from `metadata_` on the ORM object, not `Base.metadata`.

### Feature patterns

**Offer persistence:** When saving offer details (via `useOffers.saveOffer`), always call `crudApi.patchCandidate(candidateId, { offerDetails })` after updating local state. This ensures offer KPIs in the dashboard survive page reloads.

**Archive status:** Use `RequisitionStatus.ARCHIVED` enum value (`"Archived"`). Archived requisitions disable the Edit button and show an amber banner. Archive action is gated to ADMIN and LEAD_RECRUITER via `archiveRequisition` in `AppDataContext`.

**AI pool selector:** Component-level state in `SourcerHubView` tracks `selectedPoolIds`, `pendingMatchRequisition`, `isPoolSelectorOpen`. On confirm, passes `poolIds` to `findAiCandidateMatches`. Empty/null array defaults to all pools.

**Sourcer view merge:** `mainTab: 'hub' | 'kpis'` state at `SourcerHubView` level. `mainTab === 'kpis'` renders `<SourcerDashboardView />`. Admin-only sourcer selector in `SourcerDashboardView` uses `selectedSourcerId` — regular sourcers always see their own KPIs.

**On-demand AI report:** Dashboard uses `handleGenerateReport` callback instead of auto-fetch `useEffect`. Modal opens immediately; insights populate once the API resolves. Insight strings are split on `:` for bold label rendering.

**Offer Hub hired transition:** `OfferHubView` has two tabs (`activeTab: 'extended' | 'accepted'`). The "Offers Extended" tab shows `OFFER_EXTENDED` candidates with Mark Accepted / Mark Declined / Edit Offer buttons; the "Awaiting Joining" tab shows `OFFER_ACCEPTED` candidates with a "Confirm Joined" button that transitions them to `CandidateStage.HIRED`. `confirmJoined` in `useOffers` calls `updateCandidateStage(candidateId, CandidateStage.HIRED)`. Switching tabs resets both filter states (`offerSearchTerm`, `offerRequisitionFilter`). No auto-transition — `HIRED` status only set by explicit recruiter or HM action.

---

## Key Gotchas

- **`patchCandidate` must use `toCandPatch`** (sparse), never `toCand` (full) — using `toCand` wipes `resume_text` and other unrelated fields.
- **`Base.metadata` conflict** — never add `validation_alias="metadata"` to `*Out` schemas that use `from_attributes=True`.
- **Data hooks guard with `if (!loggedInUserId) return`** — intentional, prevents unauthenticated fetches on mount.
- **`isCheckingAuth` must stay `true`** until `fetchCurrentUser` fully resolves — removing this causes login flash on reload.
- **Supabase `DATABASE_URL`** must use `postgresql+asyncpg://` prefix, not `postgresql://`.
- **Offer persistence** — persist via `crudApi.patchCandidate({ offerDetails })` after `updateCandidateStage`. Local state only causes KPIs to vanish on reload.
- **Pool selector state** (`selectedPoolIds`) is component-local; resets on modal close. Pass `poolIds` to `findAiCandidateMatches` on confirm, not on state change.
- **Sourcer switcher** is admin-only — regular sourcers always see their own KPIs via `loggedInUser.id`. Don't remove the role gate.
- **Archive enum value** must be exactly `"Archived"` to match `RequisitionStatus.ARCHIVED` on the backend.
- **Offer Hub access** — `HIRING_MANAGER` has access to Offer Hub to confirm joining. Do not remove `UserRole.HIRING_MANAGER` from the `offerhub` nav roles in `Navigation.tsx`.
- **`CandidateSource` has no default** — `CandidateForm` intentionally starts with `source: '' as CandidateSource` and a disabled placeholder option. Do not restore `CandidateSource.OTHER` as a default — it causes all candidates to land in "Others" in the Reporting channel ledger, masking real sourcing data.

---

## Environment Variables

**`.env`** (project root — Vite reads this):
```
VITE_API_URL=http://localhost:8000
```

**`backend/.env`**:
```
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<db>
SECRET_KEY=<random-256-bit>
GEMINI_API_KEY=<google-ai-studio-key>
ADMIN_EMAIL=<bootstrap-admin@joveo.com>
ADMIN_PASSWORD=<initial-password>
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:3000
```

`vite.config.ts` has no proxy and does not inject env vars — `VITE_API_URL` is read via `import.meta.env.VITE_API_URL` in `services/apiClient.ts`.

---

## User Roles

| Role | Default View | Key Capabilities |
|---|---|---|
| `ADMIN` | Admin | User management, full visibility, archive reqs, switch sourcer KPIs |
| `LEAD_RECRUITER` | Requisition List | Create reqs, pipeline management, offers, archive reqs |
| `RECRUITER` | Recruiter View | Manage candidates, log interviews |
| `SOURCER` | Sourcer Hub | Talent pools, outreach campaigns, AI pool selector |
| `HIRING_MANAGER` | HM Hub | Interview feedback, scorecard review, hiring decisions, Offer Hub (Confirm Joined) |

Admin account is bootstrapped via `ADMIN_EMAIL` env var on first run (`backend/app/db/init_db.py`).

---

## AI Features

All Gemini prompts are in `backend/app/utils/prompts.py` — edit there to tune AI output.

| Feature | Endpoint | Wired in |
|---|---|---|
| Resume match analysis | `POST /api/v1/ai/resume-analysis` | `useCandidates → saveCandidateAnalysis` |
| Candidate matching | `POST /api/v1/ai/matches` | `useAiMatches` |
| Outreach draft | `POST /api/v1/ai/outreach-draft` | `useOutreachDraft` |
| Debrief summary | `POST /api/v1/ai/debrief-summary` | `useHiringHub → generateAIDebriefSummary` |
| Requisition suggestions | `POST /api/v1/ai/requisition-suggestions` | inline in `RequisitionForm` |

---

## Preferred Skills

- **`engineering-skills:senior-fullstack`** — features spanning frontend + backend
- **`engineering-skills:senior-frontend`** — React/TypeScript component work
- **`engineering-skills:senior-backend`** — FastAPI/SQLAlchemy/Supabase work
- **`engineering-skills:senior-security`** — JWT auth, cookie handling, RBAC
- **`engineering-skills:code-reviewer`** — before committing a batch of changes
- **`engineering-skills:senior-prompt-engineer`** — tuning Gemini prompts
- **`engineering-skills:epic-design`** — cinematic UI, scroll animations, premium frontend effects

---

## Scalability Analysis — 40–50 Concurrent Users

**Verdict: Yes, the stack handles 40–50 concurrent users comfortably with one caveat (Gemini thread pool).**

### Backend — FastAPI + asyncpg

FastAPI on a single Uvicorn worker is fully async. Each HTTP request holds a DB connection only for the duration of the query, not the entire request lifecycle. I/O-bound workloads (DB reads/writes, auth checks) scale well without adding workers.

**DB connection pool** (`session.py`):
- `pool_size=5`, `max_overflow=10` → up to **15 live connections** at any moment.
- At 40–50 users doing typical CRUD (not all simultaneously hitting DB), this is adequate. PostgreSQL on Supabase supports hundreds of connections; the bottleneck is the pool, not the server.
- If all 50 users trigger a DB call at the exact same instant, requests beyond 15 will queue inside SQLAlchemy (timeout=30 s). In normal interactive use this never happens.
- **Action if needed:** raise `DB_POOL_SIZE=10`, `DB_MAX_OVERFLOW=20` via env var — zero code change.

### AI Endpoints — Gemini (blocking thread offload)

All Gemini calls use `anyio.to_thread.run_sync()` to offload the synchronous `google-genai` SDK to a thread pool. AnyIO's default thread pool is **40 threads**, which matches the target user count. However:

- Each AI call can take **2–8 seconds** and blocks one thread for that duration.
- If 40 users each trigger an AI call simultaneously, the thread pool saturates.
- In practice, AI calls are user-initiated (resume upload, "Find Matches" button) — not background polling — so simultaneous saturation is unlikely at this scale.
- **Action if needed:** add a per-user rate limit or a `Semaphore(10)` guard around `_generate_text` to cap concurrent Gemini calls and return a friendly "busy" error rather than silently queuing.

### Database — Supabase (hosted PostgreSQL)

- All ORM operations use `async`/`await` — no blocking calls in the request path.
- `pool_pre_ping=True` recovers from idle connection drops (Supabase has a 5-min idle timeout on the free tier).
- `pool_recycle=300` (5 min) proactively refreshes connections before Supabase drops them.
- No N+1 query patterns observed in the service layer; each endpoint issues a bounded number of queries.
- Supabase free tier: 60 direct connections max. At `pool_size=5` + `max_overflow=10`, the app consumes at most 15 — well within limits.

### Frontend — React SPA (Vite)

Static assets served by Vite dev server (dev) or any CDN (prod). Zero server state — no SSR, no sessions on the frontend server. Scales independently of backend concurrency.

### JWT Auth

Stateless HttpOnly cookie JWT. No session store, no Redis. Each request validates the token in-process (CPU-only). 50 concurrent auth checks: negligible.

### What is NOT production-ready (beyond 50 users)

| Gap | Impact | Fix |
|---|---|---|
| Single Uvicorn worker | CPU-bound tasks would block the event loop | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker` |
| No response caching | Dashboard insights & AI reports re-query Gemini on every click | Cache with `functools.lru_cache` + TTL or Redis |
| No Gemini concurrency cap | Thread pool exhaustion under sustained AI load | `asyncio.Semaphore(10)` guard in `_generate_text` |
| No request rate limiting | A single user can spam AI endpoints | FastAPI middleware or `slowapi` |
| `statement_cache_size=0` | Required for pgBouncer but disables PG's prepared-statement cache | Remove if not using pgBouncer |

### Summary

For **40–50 internal Joveo users** doing normal recruiter workflows, the current architecture is sound. The only realistic risk is **simultaneous AI calls** — if a batch action (e.g., bulk resume analysis) triggers many Gemini requests at once, the anyio thread pool can fill. Add a `Semaphore` guard and bump the pool env vars if that pattern emerges.
