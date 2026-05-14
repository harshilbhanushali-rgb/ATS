# AI HMS Backend

Python FastAPI backend for the AI Hiring Management System.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -e .`
3. Create a `.env` file in this folder using `.env.example`.
4. Run the server:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Notes

- Auth uses JWT stored in an HttpOnly cookie (SameSite=Lax).
- Admin bootstrap uses env vars (`ADMIN_BOOTSTRAP_*`).
- All endpoints are async and use Postgres via SQLAlchemy async.
