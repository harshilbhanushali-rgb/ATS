from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.outreach_log import OutreachLog
from app.schemas.outreach_log import OutreachLogCreate, OutreachLogUpdate


async def list_outreach_logs(session: AsyncSession) -> list[OutreachLog]:
    result = await session.execute(select(OutreachLog).order_by(OutreachLog.created_at.desc()))
    return list(result.scalars().all())


async def get_outreach_log(session: AsyncSession, log_id: str) -> OutreachLog | None:
    result = await session.execute(select(OutreachLog).where(OutreachLog.id == log_id))
    return result.scalar_one_or_none()


async def create_outreach_log(session: AsyncSession, log_in: OutreachLogCreate) -> OutreachLog:
    data = log_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    try:
        log = OutreachLog(**data)
        session.add(log)
        await session.commit()
        await session.refresh(log)
        return log
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Outreach log with this ID already exists")


async def update_outreach_log(
    session: AsyncSession, log: OutreachLog, log_in: OutreachLogUpdate
) -> OutreachLog:
    updates = log_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(log, field, value)
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log


async def delete_outreach_log(session: AsyncSession, log: OutreachLog) -> None:
    await session.delete(log)
    await session.commit()
