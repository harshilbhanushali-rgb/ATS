from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.requisition import Requisition
from app.schemas.requisition import RequisitionCreate, RequisitionUpdate


async def list_requisitions(
    session: AsyncSession,
    search: str | None = None,
    status: str | None = None,
    hiring_manager: str | None = None,
    function_area: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Requisition]:
    stmt = select(Requisition).order_by(Requisition.created_at.desc())
    if search:
        stmt = stmt.where(
            Requisition.role.ilike(f"%{search}%") | Requisition.id.ilike(f"%{search}%")
        )
    if status:
        stmt = stmt.where(Requisition.req_status == status)
    if hiring_manager:
        stmt = stmt.where(Requisition.hiring_manager_name == hiring_manager)
    if function_area:
        stmt = stmt.where(Requisition.function == function_area)
    result = await session.execute(stmt.offset(skip).limit(limit))
    return list(result.scalars().all())


async def get_requisition(session: AsyncSession, requisition_id: str) -> Requisition | None:
    result = await session.execute(select(Requisition).where(Requisition.id == requisition_id))
    return result.scalar_one_or_none()


async def create_requisition(session: AsyncSession, requisition_in: RequisitionCreate) -> Requisition:
    data = requisition_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    try:
        requisition = Requisition(**data)
        session.add(requisition)
        await session.commit()
        await session.refresh(requisition)
        return requisition
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Requisition with this ID already exists")


async def update_requisition(
    session: AsyncSession, requisition: Requisition, requisition_in: RequisitionUpdate
) -> Requisition:
    updates = requisition_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(requisition, field, value)
    session.add(requisition)
    await session.commit()
    await session.refresh(requisition)
    return requisition


async def delete_requisition(session: AsyncSession, requisition: Requisition) -> None:
    await session.delete(requisition)
    await session.commit()
