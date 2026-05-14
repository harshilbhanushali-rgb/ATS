from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scorecard_template import ScorecardTemplate
from app.schemas.scorecard_template import ScorecardTemplateCreate, ScorecardTemplateUpdate


async def list_scorecards(session: AsyncSession) -> list[ScorecardTemplate]:
    result = await session.execute(select(ScorecardTemplate).order_by(ScorecardTemplate.created_at.desc()))
    return list(result.scalars().all())


async def get_scorecard(session: AsyncSession, template_id: str) -> ScorecardTemplate | None:
    result = await session.execute(
        select(ScorecardTemplate).where(ScorecardTemplate.id == template_id)
    )
    return result.scalar_one_or_none()


async def create_scorecard(
    session: AsyncSession, template_in: ScorecardTemplateCreate
) -> ScorecardTemplate:
    data = template_in.model_dump()
    template = ScorecardTemplate(**data)
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template


async def update_scorecard(
    session: AsyncSession, template: ScorecardTemplate, template_in: ScorecardTemplateUpdate
) -> ScorecardTemplate:
    updates = template_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(template, field, value)
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template


async def delete_scorecard(session: AsyncSession, template: ScorecardTemplate) -> None:
    await session.delete(template)
    await session.commit()
