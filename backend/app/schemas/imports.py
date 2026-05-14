from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserImportRow(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.RECRUITER
    password: str | None = None


class ImportError(BaseModel):
    row: int | None = None
    field: str | None = None
    message: str


class ImportResult(BaseModel):
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list[ImportError] = Field(default_factory=list)
