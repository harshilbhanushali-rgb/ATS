# AI Hiring Management System (AI HMS)

A full-stack recruitment SaaS built for Joveo, managing the complete hiring funnel — requisition creation through confirmed hire — with Google Gemini AI powering resume analysis, candidate matching, outreach drafting, and interview debrief synthesis.

Access is restricted to `@joveo.com` accounts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6, react-router-dom 7 |
| Styling | Tailwind CSS, Lucide React, Recharts, Framer Motion |
| Backend | FastAPI (async), Python 3.11+, Uvicorn |
| ORM | SQLAlchemy 2.0 async + asyncpg |
| Database | PostgreSQL via Supabase |
| Auth | JWT in HttpOnly cookie (`hms_access_token`, 8 h expiry) |
| AI | Google Gemini `gemini-2.0-flash-lite` via `google-genai` SDK |
| Validation | Pydantic v2 |

---

## Project Structure

```
/
├── README.md
├── CLAUDE.md                   # AI agent instructions
├── vite.config.ts              # Frontend build (SWC, no proxy)
├── .env                        # VITE_API_URL=http://localhost:8000
├── frontend/src/
│   ├── App.tsx                 # Root: wires all hooks, passes props down
│   ├── types.ts                # All TypeScript interfaces and enums
│   ├── app/
│   │   ├── AppShell.tsx        # Layout + navigation shell
│   │   ├── AppModals.tsx       # Global modal renderer
│   │   └── AuthGate.tsx        # Login gate (shows spinner until auth resolves)
│   ├── components/             # Feature views and UI components
│   ├── components/ui/          # Shared animated primitives
│   ├── hooks/                  # All state lives here (11 custom hooks)
│   ├── services/
│   │   ├── apiClient.ts        # Base fetch (credentials: include, VITE_API_URL)
│   │   ├── crudApi.ts          # CRUD + camelCase↔snake_case mappers
│   │   ├── aiApi.ts            # AI endpoints
│   │   └── authApi.ts          # Login / logout / session
│   └── utils/
│       ├── viewUtils.ts        # Route↔View mapping, role default views
│       └── metadata.ts         # Metadata update helper
└── backend/
    ├── README.md               # Backend-specific setup and API reference
    ├── Dockerfile              # HF Spaces compliant (uid 1000, port 7860)
    ├── .env                    # Runtime secrets (never committed)
    └── app/
        ├── main.py             # FastAPI app, CORS, lifespan
        ├── core/config.py      # Pydantic Settings
        ├── core/security.py    # JWT + password hashing
        ├── db/                 # SQLAlchemy session + init/seed
        ├── models/             # ORM models (7 tables)
        ├── schemas/            # Pydantic v2 request/response schemas
        ├── services/           # Business logic (10 modules)
        ├── api/v1/endpoints/   # FastAPI routers (11 files)
        └── utils/prompts.py    # All Gemini prompt strings
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- A Supabase project (PostgreSQL)
- A Google AI Studio API key

### 1. Frontend

```bash
# Install dependencies
npm install

# Copy and configure root env
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start dev server (port 3000)
npm run dev
```

### 2. Backend

```bash
cd backend

# Install Python dependencies
pip install -r req.txt

# Copy and configure backend env
cp .env.example .env
# Fill in DATABASE_URL, SECRET_KEY, GEMINI_API_KEY, ADMIN_BOOTSTRAP_* (see below)

# Start server (port 8000)
uvicorn app.main:app --reload --port 8000
```

On first startup the backend automatically creates all tables and seeds the bootstrap admin account from `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`.

---

## Environment Variables

### Root `.env` (Vite reads this)

```env
VITE_API_URL=http://localhost:8000
```

### `backend/.env`

```env
# Database
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<db>

# Auth
SECRET_KEY=<256-bit random hex>
ACCESS_TOKEN_EXPIRE_MINUTES=480
ACCESS_TOKEN_COOKIE_NAME=hms_access_token

# Cookie security
# Local dev:  SAMESITE=lax   SECURE=false
# Cross-domain prod:  SAMESITE=none  SECURE=true
ACCESS_TOKEN_COOKIE_SAMESITE=lax
ACCESS_TOKEN_COOKIE_SECURE=false

# CORS — must exactly match the browser Origin header (no trailing slash)
FRONTEND_URL=http://localhost:3000

# Admin bootstrap (used once on first run)
ADMIN_BOOTSTRAP_EMAIL=admin@joveo.com
ADMIN_BOOTSTRAP_PASSWORD=<strong-password>
ADMIN_BOOTSTRAP_NAME=Admin User

# AI
GEMINI_API_KEY=<google-ai-studio-key>
GEMINI_MODEL=gemini-2.0-flash-lite

# Connection pool
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_RECYCLE=300
```

> **Cookie security note:** `SameSite=None` is only needed when the frontend and backend are on different registered domains (e.g. Vercel + Hugging Face Spaces). For localhost development both services share the `localhost` domain, so `SameSite=Lax` provides full CSRF protection without any extra configuration. Always pair `SameSite=None` with `Secure=true` and an `https://` `FRONTEND_URL`.

---

## User Roles

| Role | Default View | Key Capabilities |
|---|---|---|
| `ADMIN` | Admin Panel | User management, full visibility, archive reqs, switch sourcer KPIs |
| `LEAD_RECRUITER` | Requisition List | Create reqs, pipeline management, offers, archive reqs |
| `RECRUITER` | Recruiter Hub | Manage candidates, log interviews |
| `SOURCER` | Sourcer Hub | Talent pools, outreach campaigns, AI pool selector |
| `HIRING_MANAGER` | HM Hub | Interview feedback, scorecards, hiring decisions, Offer Hub (Confirm Joined) |

---

## Hiring Pipeline

```
Source → AI Match → Interview → Offer → Hired
```

| Stage | Owner | Key Action |
|---|---|---|
| Source | Sourcer | Add to talent pools, draft AI outreach |
| AI Match | Sourcer | Gemini scores pool candidates vs open req |
| Interview | Recruiter / HM | Scorecards, AI debrief synthesis |
| Offer | Lead Recruiter | Extend → Accept → Awaiting Joining |
| Hired | Hiring Manager | Confirm Joined |

---

## AI Features

All Gemini prompts are in `backend/app/utils/prompts.py`.

| Feature | Endpoint | Hook |
|---|---|---|
| Resume match analysis | `POST /api/v1/ai/resume-analysis` | `useCandidates → saveCandidateAnalysis` |
| Candidate matching from pools | `POST /api/v1/ai/matches` | `useAiMatches` |
| Outreach draft | `POST /api/v1/ai/outreach-draft` | `useOutreachDraft` |
| Interview debrief summary | `POST /api/v1/ai/debrief-summary` | `useHiringHub → generateAIDebriefSummary` |
| Requisition suggestions | `POST /api/v1/ai/requisition-suggestions` | Inline in `RequisitionForm` |

---

## Docker (Backend)

The Dockerfile is [Hugging Face Spaces](https://huggingface.co/docs/hub/spaces) compliant — runs as uid 1000, binds to port 7860.

```bash
# Build
docker build -t ai-hms-backend ./backend

# Run (secrets injected at runtime, never baked in)
docker run -p 7860:7860 --env-file backend/.env ai-hms-backend

# Remap to local port 8000
docker run -p 8000:7860 --env-file backend/.env ai-hms-backend
```

- Port is **7860** inside the container (HF Spaces requirement)
- `DATABASE_URL` must use `postgresql+asyncpg://` prefix
- No `--reload` in the Docker CMD (dev-only flag)

---

## Frontend Architecture

All state lives in `hooks/` (11 hooks). Components are display-only and receive data + callbacks as props. `App.tsx` is the single wiring point.

- Data hooks guard fetches with `if (!loggedInUserId) return` — prevents unauthenticated calls on mount
- `AuthGate` holds a spinner until `fetchCurrentUser()` resolves — prevents login flash on reload
- Context values in `App.tsx` are wrapped in `useMemo` to prevent unnecessary re-renders
- URL-based navigation via react-router-dom; `viewUtils.ts` maps `View` enum ↔ URL paths

---

## Design System

White + blue aesthetic (Linear/Stripe-inspired).

- **Background:** `bg-[#F0F4FF]` with `.page-mesh` overlay
- **Cards:** `bg-white border border-slate-200 rounded-2xl shadow-sm`
- **Primary button:** `bg-blue-600 hover:bg-blue-700 text-white rounded-xl`
- **Inputs:** `bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/30`
- **Text:** `text-slate-900` primary, `text-slate-500` muted, `text-blue-600` accent
- **Never use** dark glass tokens (`backdrop-blur-xl`, `white/10`, `slate-8xx`, `from-violet`)

---

## Linting

```bash
# Zero warnings enforced
npm run lint
```

No test runner is configured — there are no unit or integration tests in this repo.
