from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import users as users_service

router = APIRouter()


@router.get("", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    users = await users_service.list_users(db)
    return list(users)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    existing = await users_service.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    user = await users_service.create_user(db, user_in)
    return UserOut.model_validate(user)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    user = await users_service.get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updated = await users_service.update_user(db, user, user_in)
    return UserOut.model_validate(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    user = await users_service.get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await users_service.delete_user(db, user)
    return None
