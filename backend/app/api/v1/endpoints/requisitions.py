from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.requisition import RequisitionCreate, RequisitionOut, RequisitionUpdate
from app.services import requisitions as requisitions_service

router = APIRouter()


@router.get("/", response_model=list[RequisitionOut])
async def list_requisitions(
    search: str | None = None,
    status: str | None = None,
    hiring_manager: str | None = None,
    function_area: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await requisitions_service.list_requisitions(
        db,
        search=search,
        status=status,
        hiring_manager=hiring_manager,
        function_area=function_area,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=RequisitionOut, status_code=status.HTTP_201_CREATED)
async def create_requisition(
    payload: RequisitionCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await requisitions_service.create_requisition(db, payload)


@router.patch("/{requisition_id}", response_model=RequisitionOut)
async def update_requisition(
    requisition_id: str,
    payload: RequisitionUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    requisition = await requisitions_service.get_requisition(db, requisition_id)
    if not requisition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return await requisitions_service.update_requisition(db, requisition, payload)


@router.delete("/{requisition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requisition(
    requisition_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    requisition = await requisitions_service.get_requisition(db, requisition_id)
    if not requisition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await requisitions_service.delete_requisition(db, requisition)
    return None
