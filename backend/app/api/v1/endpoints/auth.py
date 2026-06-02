from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status

logger = logging.getLogger(__name__)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.email import send_password_reset_email
from app.core.security import create_access_token, create_password_reset_token, verify_password_reset_token
from app.db.session import get_db
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GenericMessageResponse,
    LoginRequest,
    ResetPasswordRequest,
)
from app.schemas.user import UserOut
from app.services import auth as auth_service
from app.services import users as users_service

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    user = await auth_service.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token, expires_at = create_access_token(subject=str(user.id))

    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        secure=settings.ACCESS_TOKEN_COOKIE_SECURE,
        max_age=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60),
        expires=int(expires_at.timestamp()),
        domain=settings.ACCESS_TOKEN_COOKIE_DOMAIN,
        path="/",
    )

    return AuthResponse(user=UserOut.model_validate(user), expires_at=expires_at)


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        httponly=True,
        samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        secure=settings.ACCESS_TOKEN_COOKIE_SECURE,
        domain=settings.ACCESS_TOKEN_COOKIE_DOMAIN,
        path="/",
    )
    return {"status": "ok"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> ForgotPasswordResponse:
    message = "If the email exists, a password reset message has been sent."
    user = await users_service.get_user_by_email(db, payload.email)
    if not user or not user.is_active:
        return ForgotPasswordResponse(message=message)

    token, _ = create_password_reset_token(payload.email)
    try:
        await asyncio.to_thread(send_password_reset_email, payload.email, token)
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", payload.email, exc)
    return ForgotPasswordResponse(message=message)


@router.post("/reset-password", response_model=GenericMessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> GenericMessageResponse:
    email = verify_password_reset_token(payload.token)
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    new_pw = payload.new_password
    if len(new_pw) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")
    if not new_pw.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must not consist only of whitespace")

    user = await users_service.get_user_by_email(db, email)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await users_service.reset_user_password(db, user, new_pw)
    return GenericMessageResponse(message="Password has been reset successfully.")


@router.get("/me", response_model=UserOut)
async def read_current_user(current_user=Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
