from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.talent_pool import TalentPoolCreate, TalentPoolOut, TalentPoolUpdate
from app.services import talent_pools as talent_pools_service

router = APIRouter()


@router.get("/", response_model=list[TalentPoolOut])
async def list_talent_pools(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await talent_pools_service.list_talent_pools(db, skip=skip, limit=limit)


@router.post("/", response_model=TalentPoolOut, status_code=status.HTTP_201_CREATED)
async def create_talent_pool(
    payload: TalentPoolCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await talent_pools_service.create_talent_pool(db, payload)


@router.patch("/{pool_id}", response_model=TalentPoolOut)
async def update_talent_pool(
    pool_id: str,
    payload: TalentPoolUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    pool = await talent_pools_service.get_talent_pool(db, pool_id)
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return await talent_pools_service.update_talent_pool(db, pool, payload)


@router.delete("/{pool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_talent_pool(
    pool_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    pool = await talent_pools_service.get_talent_pool(db, pool_id)
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await talent_pools_service.delete_talent_pool(db, pool)
    return None
