from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.scorecard_template import (
    ScorecardTemplateCreate,
    ScorecardTemplateOut,
    ScorecardTemplateUpdate,
)
from app.services import scorecards as scorecards_service

router = APIRouter()


@router.get("/", response_model=list[ScorecardTemplateOut])
async def list_scorecards(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await scorecards_service.list_scorecards(db)


@router.post("/", response_model=ScorecardTemplateOut, status_code=status.HTTP_201_CREATED)
async def create_scorecard(
    payload: ScorecardTemplateCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await scorecards_service.create_scorecard(db, payload)


@router.patch("/{template_id}", response_model=ScorecardTemplateOut)
async def update_scorecard(
    template_id: str,
    payload: ScorecardTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    template = await scorecards_service.get_scorecard(db, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return await scorecards_service.update_scorecard(db, template, payload)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scorecard(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    template = await scorecards_service.get_scorecard(db, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await scorecards_service.delete_scorecard(db, template)
    return None
