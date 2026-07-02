from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.services import admin as admin_service

router = APIRouter()


@router.delete("/clear-data", status_code=204)
async def clear_all_data(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    await admin_service.clear_all_data(db)
