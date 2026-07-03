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
| Frontend | React 19, TypeScript 5.8, Vite 6, react-router-dom 7, @tanstack/react-query 5 |
| Styling | Tailwind CSS, Lucide React, Recharts, framer-motion |
| Backend | FastAPI (async), Python 3.11+, Uvicorn |
| ORM | SQLAlchemy 2.0 async + asyncpg |
| Migrations | Alembic (async `env.py`, `backend/migrations/`) |
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
│   ├── data/
│   │   └── helpContent.ts  # Help drawer content — 9 sections, role-gated
│   ├── hooks/              # 11 custom hooks — all state lives here; 7 data hooks use React Query
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
│   │   ├── limiter.py      # slowapi Limiter instance (import here to avoid circular imports)
│   │   └── security.py     # JWT generation + password hashing
│   ├── db/
│   │   ├── session.py      # Async SQLAlchemy session dependency
│   │   └── init_db.py      # Table creation + seed data
│   ├── models/             # SQLAlchemy ORM models (7 tables + 4 normalized child tables)
│   │   ├── enums.py               # All Postgres enum Python classes (candidate_stage_enum, etc.)
│   │   ├── candidate_talent_pool.py   # Candidate <-> TalentPool join table
│   │   ├── candidate_stage_history.py # Normalized stage-change audit trail
│   │   ├── candidate_comment.py       # Normalized hiring-hub comments
│   │   └── offer.py                   # Normalized offer records
│   ├── schemas/            # Pydantic v2 request/response schemas
│   ├── services/           # Business logic (10 modules)
│   ├── api/v1/endpoints/   # FastAPI routers (11 files)
│   └── utils/prompts.py    # All Gemini prompt strings (edit here for AI tuning)
├── backend/migrations/     # Alembic migrations (async env.py, versions/)
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

**React Query** (`@tanstack/react-query` v5) is wired at the entry point (`frontend/src/index.tsx`) via `QueryClientProvider`. Default `staleTime: 30_000` (30s) — data is served from cache on revisit within that window, then refetched in the background. Triggers: component mount (if stale), window focus, network reconnect, explicit `invalidateQueries`.

**7 data hooks use `useQuery`** for the initial list fetch (`enabled: !!loggedInUserId`). Mutations use `queryClient.setQueryData` for immediate optimistic updates and `queryClient.invalidateQueries` after API calls to confirm with the server. The `set*` wrapper each hook exposes is a stable `useCallback` backed by `setQueryData` — same call signature as the old `useState` setter, so consumers are unchanged.

**4 hooks NOT on React Query** — they are on-demand AI/orchestration, not background server-state lists: `useAiMatches`, `useOutreachDraft`, `useHiringHub`, `useOffers`.

`useAuth` sets `isCheckingAuth=true` on mount until `fetchCurrentUser()` resolves; `AuthGate` shows a spinner until then (prevents login flash on reload). The users list in `useAuth` uses `useQuery` with `enabled: loggedInUser?.role === 'ADMIN'`.

**Context memoization:** Both `AppDataContext.Provider` and `ModalStateContext.Provider` values are wrapped in `useMemo` in `App.tsx`. This prevents all context consumers from re-rendering on every state change, significantly reducing re-renders during data updates.

**Code splitting:** All 9 view components in `AppShell.tsx` are loaded via `React.lazy` + `Suspense`. Vite emits a separate JS chunk per view. Initial bundle only includes the user's first view; other views load on first navigation.

### API call pattern

`services/crudApi.ts` owns all CRUD calls and field mapping:
- `fromCand()` — snake_case → camelCase (from server)
- `toCand()` — full payload (create/update only)
- `toCandPatch()` — sparse payload, only defined fields (PATCH only)

**Never use `toCand` for partial updates** — it sends `null` for undefined fields and wipes data like `resume_text`. Always use `toCandPatch` for `patchCandidate`.

All list functions (`listCandidates`, `listRequisitions`, `listInterviews`, `listTalentPools`, `listScorecards`, `listOutreachLogs`) accept `skip = 0, limit = 100`. Backend list endpoints also accept `?skip=&limit=` query params — pagination is live end-to-end.

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

**Add Existing Candidate to Pool:** The "Add Existing" button in `SourcerHubView`/`TalentPoolListView` opens `AddExistingCandidateForm.tsx` — a searchable picker over the already-loaded `candidates` list (excludes candidates already linked to the target pool) — not `CandidateForm`. Selecting a candidate calls `addCandidateToPool(candidateId, poolId)` in `useCandidates`, which does a sparse `patchCandidate` on `talentPoolIds` only. This is distinct from `saveCandidate(candidate, poolId)` (used by the "New Candidate" button), which creates a brand-new candidate row and defers to the backend's email-based dedup/merge logic — that logic only merges pool-only candidates, so it must never be used to attach an *existing, requisition-linked* candidate to another pool.

---

## Database Schema Migration

The schema was audited 2026-07-02 (score 21/100 — no FKs, no migration tooling, JSONB blobs
standing in for normalized tables) and was migrated table-by-table via Alembic, expand→contract
style. Plan: `.claude/plans/okay-use-senior-backend-skill-reflective-abelson.md`.

**Done (Candidate entity, Phases 0-5, 2026-07-03):**
- Alembic adopted (`backend/alembic.ini`, `backend/migrations/`). `init_db()`'s `create_all()` only
  fires when the DB has no `alembic_version` table — once stamped, all schema changes are migrations.
- FKs added to every previously-unconstrained reference column; categorical strings and
  date strings converted to real Postgres enums/`Date` columns (all 7 tables).
- Source of truth for candidate talent-pool membership, stage history, Hiring Hub comments, and
  offers is `candidate_talent_pools`, `candidate_stage_history`, `candidate_comments`, and `offers`
  respectively.
- `backend/app/services/candidates.py::candidate_to_out()` computes the API response from the
  normalized tables, reproducing the exact old JSON shape — **always return candidates through
  this function**, never the raw ORM object, or the JSON contract breaks.
- `create_candidate` dedupes by `(email, requisition_id)`: same-req resubmit → 409; pool-only
  resubmit (`requisition_id IS NULL`) → merges into the existing candidate instead of duplicating.
- **Phase 5 (contract) complete:** the legacy JSONB columns `candidates.talent_pool_ids`,
  `stage_history`, `hiring_hub_comments`, `offer_details` and the never-wired
  `requisitions.cost_amount`, `cost_currency`, `backfill_employee_name`, `backfill_previous_salary`
  columns were dropped via `backend/migrations/versions/0003_phase5_drop_legacy_columns.py`. They
  no longer exist on the ORM models or in the DB. `requisitions.cost`/`backfill_details` (JSONB)
  were **not** touched — those remain the live, actively-read-and-written columns for requisition
  cost/backfill data. Before dropping any column that looks like a Phase-4-style legacy pair,
  verify at every layer (model, schema, service, frontend) — the naming pattern alone is not proof
  of which side is dead; on this table it was the opposite of what the naming suggested.

**Not yet done:** `Requisition`/`Interview`/`OutreachLog`/`TalentPool`/`ScorecardTemplate` only got
the Phase 1 FK/enum/date treatment — no normalized child tables or dual-write/read-switch logic
exists for them, so there is no Phase 5 contract step to run for those tables yet.

**Migration gotchas:**
- Never run `uvicorn --reload` while editing SQLAlchemy models before `alembic stamp`/`upgrade` —
  a reload before `alembic_version` exists lets `create_all()` race ahead and create tables/enums
  outside migration control (with wrong enum labels — see next point).
- Any `SqlEnum(SomeEnum, name="...")` column **must** pass
  `values_callable=lambda x: [e.value for e in x]` — without it, SQLAlchemy persists the Python
  enum member's `.name` (`"APPLIED"`) instead of `.value` (`"Applied"`), silently diverging from
  every string value already used across the app (this bit `UserRole`/`users.role` too, harmlessly,
  since nothing queries that raw DB value directly — but any new enum column will NOT get that pass).
- Postgres rejects a subquery inside `ALTER COLUMN ... USING` (e.g. `ARRAY(SELECT ...)`) — use
  add-column → `UPDATE ... SET` → drop-old → rename instead.
- When reloading an ORM object with eager-loaded relationships after mutating its children in the
  same session, add `.execution_options(populate_existing=True)` to the query — otherwise
  SQLAlchemy's identity map returns the stale, previously-loaded collection.
- Migrations must run against Supabase's direct connection (port 5432), never the pgBouncer
  transaction pooler (port 6543).

---

## Key Gotchas

- **`patchCandidate` must use `toCandPatch`** (sparse), never `toCand` (full) — using `toCand` wipes `resume_text` and other unrelated fields.
- **`Base.metadata` conflict** — never add `validation_alias="metadata"` to `*Out` schemas that use `from_attributes=True`.
- **Data hooks use `enabled: !!loggedInUserId`** in `useQuery` — intentional, prevents unauthenticated fetches. Do not remove this guard.
- **`isCheckingAuth` must stay `true`** until `fetchCurrentUser` fully resolves — removing this causes login flash on reload.
- **Supabase `DATABASE_URL`** must use `postgresql+asyncpg://` prefix, not `postgresql://`.
- **Local dev on Windows** — The direct Supabase host (`db.<project>.supabase.co`) may resolve to IPv6-only, causing `getaddrinfo failed` on Windows. Use the **Session Pooler URL** from Supabase Dashboard → Settings → Database → Session mode (port 5432): `postgresql+asyncpg://postgres.<project>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres`. No `statement_cache_size=0` needed for session pooler.
- **Do NOT add `statement_cache_size=0` to `connect_args`** unless switching to Supabase's Transaction Pooler (pgBouncer transaction mode, port 6543). It disables PG's prepared-statement cache and is only needed for pgBouncer in transaction mode.
- **Offer persistence** — persist via `crudApi.patchCandidate({ offerDetails })` after `updateCandidateStage`. Local state only causes KPIs to vanish on reload.
- **Pool selector state** (`selectedPoolIds`) is component-local; resets on modal close. Pass `poolIds` to `findAiCandidateMatches` on confirm, not on state change.
- **Sourcer switcher** is admin-only — regular sourcers always see their own KPIs via `loggedInUser.id`. Don't remove the role gate.
- **Archive enum value** must be exactly `"Archived"` to match `RequisitionStatus.ARCHIVED` on the backend.
- **Offer Hub access** — `HIRING_MANAGER` has access to Offer Hub to confirm joining. Do not remove `UserRole.HIRING_MANAGER` from the `offerhub` nav roles in `Navigation.tsx`.
- **`CandidateSource` has no default** — `CandidateForm` intentionally starts with `source: '' as CandidateSource` and a disabled placeholder option. Do not restore `CandidateSource.OTHER` as a default — it causes all candidates to land in "Others" in the Reporting channel ledger, masking real sourcing data.
- **Use `??` not `||` for numeric fallbacks** — `daysBetween()` returns `0` for same-day dates and `null` for missing data. Using `|| N` treats `0` as falsy and substitutes the fallback, showing wrong values. Always use `?? N` so only `null`/`undefined` triggers the fallback.
- **Productivity tab has no sim data** — `ProductivityTab` shows only real counts from the DB. Do not re-add simulated fallback numbers (`sim` object) or fake users — they mask real outreach/sourcing activity in reporting.
- **`Modal.tsx`'s scrollable body div needs BOTH `min-h-0` and `transform-gpu`** on the `overflow-y-auto flex-grow` element. `min-h-0` fixes a flexbox sizing bug; `transform-gpu` works around a real Chromium paint bug where `overflow-hidden` + `rounded-2xl` on the modal panel (ancestor) wrapping a scrolling child causes scrolled-in content to stop being painted — DOM layout stays correct (`getBoundingClientRect` is right) but the screen shows blank gaps. Never remove either class, and never give a modal's footer buttons `position: sticky` inside this scroll area (same bug) — use a plain trailing element instead, matching `CandidateForm.tsx`'s footer.
- **Layout-correct but visually-wrong UI bugs** (reproducible every time, survives window resize, persists until remount, happens in multiple Chromium-based browsers) — before assuming a data/state bug, compare `getBoundingClientRect()`/DevTools "Computed" values against what's actually painted on screen. A mismatch means it's a browser paint/compositing bug, not app logic; `transform-gpu` on the affected element is often the fix.
- **No browser automation MCP tool works headlessly in this environment** (Playwright MCP requires a browser extension bridge that isn't installed). To drive the live app for debugging, run `npx --yes playwright install chromium` once, then script it directly with a throwaway `node script.mjs` using `import { chromium } from 'playwright'` — login via the email/password inputs, then click nav links by text (e.g. `page.getByText('HM Hub', { exact: true })`) rather than `page.goto()`-ing role-specific routes directly.
- **Any DB column type change (e.g. `String`→`Date`, `String`→`Enum`) must be paired with the matching
  Pydantic schema field type.** A migration that changes the model layer but leaves the schema typed
  `str` will pass Alembic cleanly but breaks every create/update at runtime with an asyncpg `DataError` —
  this happened for 6 tables in the 2026-07 migration and wasn't caught until manual testing.
- **`backend/req.txt` is the dependency file actually used** (Dockerfile, dev setup) — `backend/pyproject.toml`
  is a secondary/stale manifest (e.g. missing `slowapi`); update both when adding a backend dependency.
- **Backend `date`-typed fields (not `datetime`) reject any timestamp whose time-of-day isn't exactly
  midnight UTC** (Pydantic raises `date_from_datetime_inexact`). Never default a "today" value with
  `new Date().toISOString()` on a field that maps to a `date` column — always `.split('T')[0]`. This bit
  four separate places in one sweep: `RequisitionForm.tsx` (`reqApprovalDate`), `ScorecardTemplateBuilder.tsx`
  and `TalentPoolForm.tsx` (`createdDate`), and `useCandidates.ts` (`sourcedDate`). Fields that convert an
  already-date-only input via `new Date(dateOnlyString).toISOString()` (CandidateForm, InterviewForm,
  OfferForm) are safe since that yields zero time.
- **Nullable string FKs (e.g. `requisitionId`) must never be sent as `''`** — only `null`/`undefined`.
  `crudApi.ts`'s `?? null` mapping pattern does not catch empty string. An empty string passes Pydantic
  (plain `str` type) but violates the Postgres FK constraint at insert time, and the generic
  `except IntegrityError` handler mislabels it as a 409 "already exists" instead of the real cause. Fixed
  at both ends: `CandidateForm.tsx` now sends `undefined` for an unselected requisition, and
  `create_candidate` normalizes `requisition_id` to `None` if falsy as a boundary defense.
- **Candidate dedup is by email, scoped by `requisition_id`** (`create_candidate` in
  `backend/app/services/candidates.py`): same email + same `requisition_id` → hard 409 reject; same email +
  `requisition_id IS NULL` (pool-only) → merges into the existing row instead of creating a duplicate. This
  merge only covers the pool-only case — an existing candidate already tied to a requisition cannot be
  merged this way, so **use `addCandidateToPool` (PATCH `talentPoolIds`) to add an existing candidate to a
  different pool, never `CandidateForm`'s create flow** (see `AddExistingCandidateForm.tsx`), or it 409s.
- **After mutating a session-loaded ORM object's children and committing, `session.refresh()` expires
  (does not reload) its relationships.** Serializing it synchronously right after (e.g. via
  `candidate_to_out()`) can hit `MissingGreenlet` on an `AsyncSession`. Always re-query through a function
  that eager-loads (like `get_candidate`) before returning/serializing — this is what the pool-only merge
  branch of `create_candidate` does now.
- **When the backend returns a merged/existing record with a different `id` than the client's optimistic
  id** (e.g. the candidate-dedup-by-email case above), frontend cache updates must dedupe by the returned
  `id`, not just swap the optimistic entry in place — otherwise two objects share the same `id` in local
  state, which breaks React's list-key reconciliation and makes the record appear to silently vanish on
  the next render or reload. See `useCandidates.ts`'s `saveCandidate` create-path handler.

---

## Known Issues (Unresolved)

- **Reporting → Applications tab may be missing candidates rejected via Offer Hub.** Reported 2026-07-03:
  a candidate rejected earlier in the pipeline (e.g. by HM) shows up correctly under Reporting →
  Applications, but one rejected/declined via Offer Hub does not. `ApplicationsTab.tsx` itself does not
  filter by stage (it renders whatever `allCandidates` it's given, same array as every other reporting
  tab) — so the cause is upstream of that component and was not found before the investigation was cut
  short on cost grounds. Also unconfirmed: whether "reject" in Offer Hub actually sets `CandidateStage.REJECTED`
  or `CandidateStage.OFFER_DECLINED` (Offer Hub's documented actions are Mark Accepted / Mark Declined /
  Edit Offer / Confirm Joined — there's no button literally labeled "Reject" per the Offer Hub feature
  pattern below, so confirm which action the user means before assuming a stage-value bug). Next step:
  trace where `allCandidates` is assembled before reaching `ReportingView`, and check the exact stage
  value written by whatever Offer Hub action the user calls "rejected."

---

## Environment Variables

**`.env`** (project root — Vite reads this):
```
VITE_API_URL=http://localhost:8000
```

**`backend/.env`**:
```
# Use Session Pooler URL for local dev on Windows (IPv6 DNS issue with direct host)
DATABASE_URL=postgresql+asyncpg://postgres.<project>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres
SECRET_KEY=<random-256-bit>
GEMINI_API_KEY=<google-ai-studio-key>
ADMIN_BOOTSTRAP_EMAIL=<bootstrap-admin@joveo.com>
ADMIN_BOOTSTRAP_PASSWORD=<initial-password>
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:3000
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
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

- `pool_size=10`, `max_overflow=20` → up to **30 live connections** at any moment (raised in Plan B).
- At 40–50 users doing typical CRUD (not all simultaneously hitting DB), this is adequate. PostgreSQL on Supabase supports hundreds of connections; the bottleneck is the pool, not the server.
- If all 50 users trigger a DB call at the exact same instant, requests beyond 30 will queue inside SQLAlchemy (timeout=30 s). In normal interactive use this never happens.
- PG prepared-statement cache is enabled (`statement_cache_size=0` removed in Plan B — was only needed for pgBouncer transaction mode).

### AI Endpoints — Gemini (blocking thread offload)

All Gemini calls use `anyio.to_thread.run_sync()` to offload the synchronous `google-genai` SDK to a thread pool. AnyIO's default thread pool is **40 threads**, which matches the target user count. However:

- Each AI call can take **2–8 seconds** and blocks one thread for that duration.
- If 40 users each trigger an AI call simultaneously, the thread pool saturates.
- In practice, AI calls are user-initiated (resume upload, "Find Matches" button) — not background polling — so simultaneous saturation is unlikely at this scale.
- **Plan B complete:** `asyncio.Semaphore(8)` guards `_generate_text` and `extract_text_from_file` — 9th concurrent Gemini call queues instead of exhausting the thread pool. All 8 active AI endpoints are rate-limited at `10/minute` per IP via `slowapi`.

### Database — Supabase (hosted PostgreSQL)

- All ORM operations use `async`/`await` — no blocking calls in the request path.
- `pool_pre_ping=True` recovers from idle connection drops (Supabase has a 5-min idle timeout on the free tier).
- `pool_recycle=300` (5 min) proactively refreshes connections before Supabase drops them.
- No N+1 query patterns observed in the service layer; each endpoint issues a bounded number of queries.
- Supabase free tier: 60 direct connections max. At `pool_size=5` + `max_overflow=10`, the app consumes at most 15 — well within limits.

### Frontend — React SPA (Vite)

Static assets served by Vite dev server (dev) or any CDN (prod). Zero server state — no SSR, no sessions on the frontend server. Scales independently of backend concurrency.

**Plan A complete (2026-06-01):** React Query installed, all 9 views code-split via `React.lazy`, 7 data hooks migrated to `useQuery` with 30s stale cache, all list API calls pagination-ready (`skip`/`limit` params). Redundant fetches eliminated; initial bundle reduced.

**Plan B complete (2026-06-01):** Gemini semaphore (8 slots), slowapi rate limiting (10/minute on all AI endpoints), skip/limit pagination on all 4 list endpoints (candidates, requisitions, talent pools, interviews), DB pool raised to 10/20, PG prepared-statement cache re-enabled.

### JWT Auth

Stateless HttpOnly cookie JWT. No session store, no Redis. Each request validates the token in-process (CPU-only). 50 concurrent auth checks: negligible.

### What is NOT production-ready (beyond 50 users)

| Gap | Impact | Fix |
|---|---|---|
| Single Uvicorn worker | CPU-bound tasks would block the event loop | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker` (Plan C) |
| No response caching | Dashboard insights & AI reports re-query Gemini on every click | Cache with `functools.lru_cache` + TTL or Redis |

### Summary

For **40–50 internal Joveo users** doing normal recruiter workflows, the current architecture is sound. Plans A and B are complete. The only remaining gap before production-scale deployment is Plan C (Gunicorn multi-worker).
