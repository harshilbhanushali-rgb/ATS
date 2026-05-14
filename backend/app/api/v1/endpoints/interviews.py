from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.interview import InterviewCreate, InterviewOut, InterviewUpdate
from app.services import interviews as interviews_service

router = APIRouter()


@router.get("/", response_model=list[InterviewOut])
async def list_interviews(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await interviews_service.list_interviews(db)


@router.post("/", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
async def create_interview(
    payload: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await interviews_service.create_interview(db, payload)


@router.patch("/{interview_id}", response_model=InterviewOut)
async def update_interview(
    interview_id: str,
    payload: InterviewUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    interview = await interviews_service.get_interview(db, interview_id)
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return await interviews_service.update_interview(db, interview, payload)


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    interview = await interviews_service.get_interview(db, interview_id)
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await interviews_service.delete_interview(db, interview)
    return None
