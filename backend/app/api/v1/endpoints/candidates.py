from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.candidate import CandidateCreate, CandidateOut, CandidateUpdate
from app.services import candidates as candidates_service

router = APIRouter()


@router.get("/", response_model=list[CandidateOut])
async def list_candidates(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    candidates = await candidates_service.list_candidates(db, skip=skip, limit=limit)
    return [candidates_service.candidate_to_out(c) for c in candidates]


@router.post("/", response_model=CandidateOut, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    payload: CandidateCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    candidate = await candidates_service.create_candidate(db, payload, actor_user_id=user.id)
    return candidates_service.candidate_to_out(candidate)


@router.patch("/{candidate_id}", response_model=CandidateOut)
async def update_candidate(
    candidate_id: str,
    payload: CandidateUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    candidate = await candidates_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    updated = await candidates_service.update_candidate(db, candidate, payload, actor_user_id=user.id)
    return candidates_service.candidate_to_out(updated)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    candidate = await candidates_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await candidates_service.delete_candidate(db, candidate)
    return None
