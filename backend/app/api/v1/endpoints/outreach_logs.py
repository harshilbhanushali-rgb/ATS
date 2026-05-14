from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.outreach_log import OutreachLogCreate, OutreachLogOut, OutreachLogUpdate
from app.services import outreach_logs as outreach_logs_service

router = APIRouter()


@router.get("/", response_model=list[OutreachLogOut])
async def list_outreach_logs(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await outreach_logs_service.list_outreach_logs(db)


@router.post("/", response_model=OutreachLogOut, status_code=status.HTTP_201_CREATED)
async def create_outreach_log(
    payload: OutreachLogCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await outreach_logs_service.create_outreach_log(db, payload)


@router.patch("/{log_id}", response_model=OutreachLogOut)
async def update_outreach_log(
    log_id: str,
    payload: OutreachLogUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    log = await outreach_logs_service.get_outreach_log(db, log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return await outreach_logs_service.update_outreach_log(db, log, payload)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_outreach_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    log = await outreach_logs_service.get_outreach_log(db, log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await outreach_logs_service.delete_outreach_log(db, log)
    return None
