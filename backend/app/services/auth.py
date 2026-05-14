from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.models.user import User
from app.services import users as users_service


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
    user = await users_service.get_user_by_email(session, email)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
