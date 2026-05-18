# AI HMS — Backend

FastAPI async backend for the AI Hiring Management System. Handles authentication, all CRUD operations, and Google Gemini AI integrations.

---

## Stack

| Component | Technology |
|---|---|
| Framework | FastAPI (async) |
| Language | Python 3.11+ |
| Server | Uvicorn |
| ORM | SQLAlchemy 2.0 async |
| Driver | asyncpg (PostgreSQL) |
| Database | PostgreSQL via Supabase |
| Auth | JWT in HttpOnly cookie |
| AI | Google Gemini via `google-genai` SDK |
| Validation | Pydantic v2 |
| Config | pydantic-settings (reads `backend/.env`) |

---

## Setup

```bash
# From repo root
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r req.txt

# 3. Create backend/.env (see Environment Variables section below)

# 4. Start the dev server
uvicorn app.main:app --reload --port 8000
```

On first startup, `app/db/init_db.py` creates all tables and seeds the bootstrap admin account from `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`.

---

## Environment Variables (`backend/.env`)

```env
# ── Core ──────────────────────────────────────────────────────────────────────
ENVIRONMENT=development
PROJECT_NAME=AI HMS Backend

# ── Database ──────────────────────────────────────────────────────────────────
# Must use postgresql+asyncpg:// prefix — not postgresql://
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<db>

# Connection pool
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_RECYCLE=300

# ── Auth / JWT ─────────────────────────────────────────────────────────────────
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=<256-bit random hex>

ACCESS_TOKEN_EXPIRE_MINUTES=480
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=15
ACCESS_TOKEN_COOKIE_NAME=hms_access_token

# Cookie security — choose one profile:
#
#   Local dev (both services on localhost):
#     ACCESS_TOKEN_COOKIE_SAMESITE=lax
#     ACCESS_TOKEN_COOKIE_SECURE=false
#
#   Cross-domain production (e.g. Vercel frontend + HF Spaces backend):
#     ACCESS_TOKEN_COOKIE_SAMESITE=none
#     ACCESS_TOKEN_COOKIE_SECURE=true
#     FRONTEND_URL=https://your-app.vercel.app
#
# Note: SameSite=None requires Secure=true — the server validates this at
# startup and will refuse to start if misconfigured.
ACCESS_TOKEN_COOKIE_SAMESITE=lax
ACCESS_TOKEN_COOKIE_SECURE=false

# ── CORS ──────────────────────────────────────────────────────────────────────
# Must exactly match the browser Origin header — no trailing slash, no path
FRONTEND_URL=http://localhost:3000

# ── Admin bootstrap ───────────────────────────────────────────────────────────
# Used once on first run to seed the admin account. Use a strong password.
ADMIN_BOOTSTRAP_EMAIL=admin@joveo.com
ADMIN_BOOTSTRAP_PASSWORD=<strong-password>
ADMIN_BOOTSTRAP_NAME=Admin User

# ── AI ────────────────────────────────────────────────────────────────────────
GEMINI_API_KEY=<google-ai-studio-key>
GEMINI_MODEL=gemini-2.0-flash-lite

# ── SMTP (optional — for password reset emails) ───────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USER=you@joveo.com
SMTP_PASSWORD=<app-password>
SMTP_FROM_EMAIL=you@joveo.com
SMTP_FROM_NAME=AI HMS
```

---

## Project Structure

```
backend/app/
├── main.py                     # FastAPI app, CORS middleware, lifespan
├── core/
│   ├── config.py               # Pydantic Settings (reads backend/.env)
│   ├── security.py             # JWT generation + password hashing
│   └── email.py                # SMTP password reset emails
├── db/
│   ├── session.py              # Async SQLAlchemy engine + session dep
│   └── init_db.py              # Table creation + bootstrap admin seed
├── models/                     # SQLAlchemy ORM models (7 tables)
│   ├── user.py
│   ├── requisition.py
│   ├── candidate.py
│   ├── talent_pool.py
│   ├── interview.py
│   ├── scorecard.py
│   └── outreach_log.py
├── schemas/                    # Pydantic v2 request/response schemas
├── services/                   # Business logic (10 modules)
├── api/
│   ├── deps.py                 # get_current_user, get_db dependencies
│   └── v1/
│       ├── router.py           # Mounts all endpoint routers
│       └── endpoints/          # 11 router files
│           ├── auth.py         # Login, logout, forgot/reset password, /me
│           ├── users.py
│           ├── requisitions.py
│           ├── candidates.py
│           ├── talent_pools.py
│           ├── interviews.py
│           ├── scorecards.py
│           ├── outreach_logs.py
│           ├── imports.py
│           ├── ai.py           # All Gemini AI endpoints
│           └── dashboard.py
└── utils/
    └── prompts.py              # All Gemini prompt strings — edit here to tune AI
```

---

## API Reference

All routes are prefixed `/api/v1`. Every route except `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, and `/health` requires a valid JWT cookie.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate; sets `hms_access_token` HttpOnly cookie |
| `POST` | `/auth/logout` | Clears the auth cookie |
| `GET` | `/auth/me` | Returns the current user |
| `POST` | `/auth/forgot-password` | Sends password reset email |
| `POST` | `/auth/reset-password` | Resets password via token |

### Core Resources

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/users` | List / create users (Admin only) |
| `GET/PATCH/DELETE` | `/users/{id}` | Read / update / delete user |
| `GET/POST` | `/requisitions` | List / create requisitions |
| `GET/PATCH/DELETE` | `/requisitions/{id}` | Read / update / delete requisition |
| `GET/POST` | `/candidates` | List / create candidates |
| `GET/PATCH/DELETE` | `/candidates/{id}` | Read / update / delete candidate |
| `GET/POST` | `/talent-pools` | List / create talent pools |
| `GET/PATCH/DELETE` | `/talent-pools/{id}` | Read / update / delete pool |
| `GET/POST` | `/interviews` | List / create interviews |
| `GET/PATCH/DELETE` | `/interviews/{id}` | Read / update / delete interview |
| `GET/POST` | `/scorecards` | List / create scorecards |
| `GET/POST` | `/outreach-logs` | List / create outreach log entries |

### AI Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/resume-analysis` | Gemini resume ↔ requisition match score |
| `POST` | `/ai/matches` | Find best pool candidates for a requisition |
| `POST` | `/ai/outreach-draft` | Draft personalised outreach email |
| `POST` | `/ai/debrief-summary` | Synthesise interview scorecards |
| `POST` | `/ai/requisition-suggestions` | AI job description suggestions |
| `POST` | `/ai/extract-text` | Extract text from uploaded file (PDF/image) |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status":"ok","db":"ok"}` or 503 if DB is unreachable |

---

## Authentication Details

- JWT is stored in an **HttpOnly cookie** (`hms_access_token`) — inaccessible to JavaScript
- Token expiry: controlled by `ACCESS_TOKEN_EXPIRE_MINUTES` (default 8 hours)
- `get_current_user` dependency (`api/deps.py`) reads the cookie, validates the JWT, and fetches the user from the DB on every request
- Password hashing uses bcrypt via `passlib`

### CORS

CORS is restricted to the exact origin in `FRONTEND_URL`. The allowed methods are `GET POST PATCH DELETE OPTIONS` and allowed headers are `Content-Type Authorization Accept X-Requested-With`. Credentials are allowed.

The previous configuration used `allow_origin_regex=".*"` (any origin with credentials) — this was replaced with the specific `FRONTEND_URL` allowlist.

### Cookie SameSite Configuration

| Deployment | `SAMESITE` | `SECURE` | `FRONTEND_URL` |
|---|---|---|---|
| Local dev (same host, different ports) | `lax` | `false` | `http://localhost:3000` |
| Cross-domain production | `none` | `true` | `https://your-app.example.com` |

`SameSite=None` requires `Secure=true` — the server validates this at startup via a Pydantic model validator and will refuse to start if misconfigured.

---

## Backend PATCH Pattern

Services use `model_dump(exclude_unset=True)` — only fields explicitly present in the request body are written to the DB. This prevents partial updates from wiping unrelated fields.

**Never use `toCand` (full payload) for partial candidate updates** — use `toCandPatch` (sparse payload). Using the full payload sends `null` for undefined fields and wipes data like `resume_text`.

---

## AI Tuning

Edit `app/utils/prompts.py` to tune any Gemini prompt. The file is the single source of truth for all prompt strings. No code changes needed elsewhere.

Models are configured via `GEMINI_MODEL` in `.env`. Default: `gemini-2.0-flash-lite`.

---

## Docker

The Dockerfile is [Hugging Face Spaces](https://huggingface.co/docs/hub/spaces) compliant.

```bash
# Build
docker build -t ai-hms-backend .

# Run on HF Spaces port
docker run -p 7860:7860 --env-file .env ai-hms-backend

# Run remapped to local port 8000
docker run -p 8000:7860 --env-file .env ai-hms-backend
```

- Runs as uid 1000 (non-root, required by HF Spaces)
- Binds to port **7860** inside the container
- `.env` is excluded from the image via `.dockerignore` — inject at runtime
- No `--reload` flag in the Dockerfile CMD

---

## Key Gotchas

- `DATABASE_URL` must use `postgresql+asyncpg://` — not `postgresql://`
- Never add `validation_alias="metadata"` to `*Out` schemas with `from_attributes=True` — `Base.metadata` conflicts with SQLAlchemy's class-level `metadata`
- `ADMIN_BOOTSTRAP_EMAIL` seeds only on first run (when the users table is empty)
- `SameSite=None` startup guard: the server raises `ValueError` at boot if `Secure` is not also `true`
- Offer KPIs: always call `patchCandidate({ offerDetails })` after `updateCandidateStage` — local state only causes KPIs to vanish on reload
