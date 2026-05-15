from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate, CandidateUpdate


async def list_candidates(session: AsyncSession) -> list[Candidate]:
    result = await session.execute(select(Candidate).order_by(Candidate.created_at.desc()))
    return list(result.scalars().all())


async def get_candidate(session: AsyncSession, candidate_id: str) -> Candidate | None:
    result = await session.execute(select(Candidate).where(Candidate.id == candidate_id))
    return result.scalar_one_or_none()


async def create_candidate(session: AsyncSession, candidate_in: CandidateCreate) -> Candidate:
    data = candidate_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    try:
        candidate = Candidate(**data)
        session.add(candidate)
        await session.commit()
        await session.refresh(candidate)
        return candidate
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Candidate with this ID already exists")


async def update_candidate(
    session: AsyncSession, candidate: Candidate, candidate_in: CandidateUpdate
) -> Candidate:
    updates = candidate_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(candidate, field, value)
    session.add(candidate)
    await session.commit()
    await session.refresh(candidate)
    return candidate


async def delete_candidate(session: AsyncSession, candidate: Candidate) -> None:
    await session.delete(candidate)
    await session.commit()
