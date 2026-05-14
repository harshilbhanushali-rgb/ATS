from __future__ import annotations

from typing import Iterable
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


async def get_user_by_id(session: AsyncSession, user_id: str) -> User | None:
    try:
        parsed_id = uuid.UUID(user_id)
    except ValueError:
        return None
    result = await session.execute(select(User).where(User.id == parsed_id))
    return result.scalar_one_or_none()


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def list_users(session: AsyncSession) -> Iterable[User]:
    result = await session.execute(
        select(User)
        .where(User.is_active == True)
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()


async def create_user(session: AsyncSession, user_in: UserCreate) -> User:
    user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def update_user(session: AsyncSession, user: User, user_in: UserUpdate) -> User:
    if user_in.name is not None:
        user.name = user_in.name
    if user_in.email is not None:
        user.email = user_in.email.lower()
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user: User) -> None:
    await session.delete(user)
    await session.commit()


async def reset_user_password(session: AsyncSession, user: User, new_password: str) -> None:
    user.hashed_password = get_password_hash(new_password)
    session.add(user)
    await session.commit()
