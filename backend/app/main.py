from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.db.session import AsyncSessionLocal


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # FRONTEND_URL must exactly match the Origin header (no trailing slash, no path)
    allow_origins=[settings.FRONTEND_URL.rstrip("/")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check() -> dict:
    try:
        async with AsyncSessionLocal() as session:
            await asyncio.wait_for(session.execute(text("SELECT 1")), timeout=3.0)
        return {"status": "ok", "db": "ok"}
    except Exception:
        raise HTTPException(status_code=503, detail={"status": "degraded", "db": "unreachable"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
