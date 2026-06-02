from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview
from app.schemas.interview import InterviewCreate, InterviewUpdate


async def list_interviews(session: AsyncSession, skip: int = 0, limit: int = 100) -> list[Interview]:
    result = await session.execute(
        select(Interview).order_by(Interview.created_at.desc()).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


async def get_interview(session: AsyncSession, interview_id: str) -> Interview | None:
    result = await session.execute(select(Interview).where(Interview.id == interview_id))
    return result.scalar_one_or_none()


async def create_interview(session: AsyncSession, interview_in: InterviewCreate) -> Interview:
    data = interview_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    try:
        interview = Interview(**data)
        session.add(interview)
        await session.commit()
        await session.refresh(interview)
        return interview
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Interview with this ID already exists")


async def update_interview(
    session: AsyncSession, interview: Interview, interview_in: InterviewUpdate
) -> Interview:
    updates = interview_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(interview, field, value)
    session.add(interview)
    await session.commit()
    await session.refresh(interview)
    return interview


async def delete_interview(session: AsyncSession, interview: Interview) -> None:
    await session.delete(interview)
    await session.commit()
