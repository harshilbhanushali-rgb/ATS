from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.scorecard_template import ScorecardTemplate
from app.models.user import User, UserRole
from app.schemas.scorecard_template import ScorecardTemplateCreate, ScorecardTemplateUpdate


def _can_edit(template: ScorecardTemplate, current_user: User) -> bool:
    return current_user.role == UserRole.ADMIN or template.created_by == current_user.id


async def list_scorecards(session: AsyncSession) -> list[ScorecardTemplate]:
    result = await session.execute(
        select(ScorecardTemplate)
        .options(selectinload(ScorecardTemplate.creator))
        .order_by(ScorecardTemplate.created_at.desc())
    )
    return list(result.scalars().all())


async def get_scorecard(session: AsyncSession, template_id: str) -> ScorecardTemplate | None:
    result = await session.execute(
        select(ScorecardTemplate)
        .options(selectinload(ScorecardTemplate.creator))
        .where(ScorecardTemplate.id == template_id)
    )
    return result.scalar_one_or_none()


async def create_scorecard(
    session: AsyncSession, template_in: ScorecardTemplateCreate, current_user: User
) -> ScorecardTemplate:
    data = template_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    data["created_by"] = current_user.id
    try:
        template = ScorecardTemplate(**data)
        session.add(template)
        await session.commit()
        await session.refresh(template)
        return await get_scorecard(session, template.id)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Scorecard template with this ID already exists")


async def update_scorecard(
    session: AsyncSession,
    template: ScorecardTemplate,
    template_in: ScorecardTemplateUpdate,
    current_user: User,
) -> ScorecardTemplate:
    if not _can_edit(template, current_user):
        raise HTTPException(status_code=403, detail="Only the creator or an admin can edit this template")
    updates = template_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(template, field, value)
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return await get_scorecard(session, template.id)


async def delete_scorecard(session: AsyncSession, template: ScorecardTemplate, current_user: User) -> None:
    if not _can_edit(template, current_user):
        raise HTTPException(status_code=403, detail="Only the creator or an admin can delete this template")
    await session.delete(template)
    await session.commit()
