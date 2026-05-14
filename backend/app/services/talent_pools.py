from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.talent_pool import TalentPool
from app.schemas.talent_pool import TalentPoolCreate, TalentPoolUpdate


async def list_talent_pools(session: AsyncSession) -> list[TalentPool]:
    result = await session.execute(select(TalentPool).order_by(TalentPool.created_at.desc()))
    return list(result.scalars().all())


async def get_talent_pool(session: AsyncSession, pool_id: str) -> TalentPool | None:
    result = await session.execute(select(TalentPool).where(TalentPool.id == pool_id))
    return result.scalar_one_or_none()


async def create_talent_pool(session: AsyncSession, pool_in: TalentPoolCreate) -> TalentPool:
    data = pool_in.model_dump()
    pool = TalentPool(**data)
    session.add(pool)
    await session.commit()
    await session.refresh(pool)
    return pool


async def update_talent_pool(
    session: AsyncSession, pool: TalentPool, pool_in: TalentPoolUpdate
) -> TalentPool:
    updates = pool_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(pool, field, value)
    session.add(pool)
    await session.commit()
    await session.refresh(pool)
    return pool


async def delete_talent_pool(session: AsyncSession, pool: TalentPool) -> None:
    await session.delete(pool)
    await session.commit()
