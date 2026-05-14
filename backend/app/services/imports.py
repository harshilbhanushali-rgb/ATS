from __future__ import annotations

from typing import Iterable

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.imports import ImportError, ImportResult, UserImportRow
from app.services import users as users_service


async def import_users(
    session: AsyncSession,
    rows: Iterable[dict],
    dry_run: bool = True,
    allow_update: bool = False,
) -> ImportResult:
    result = ImportResult()

    for index, row in enumerate(rows, start=1):
        try:
            data = UserImportRow.model_validate(row)
        except ValidationError as exc:
            result.errors.append(
                ImportError(row=index, field=None, message=str(exc))
            )
            continue

        existing = await users_service.get_user_by_email(session, data.email)
        if existing:
            if allow_update:
                if not dry_run:
                    existing.name = data.name
                    existing.role = data.role
                    existing.is_active = True
                    if data.password:
                        existing.hashed_password = get_password_hash(data.password)
                    session.add(existing)
                result.updated += 1
            else:
                result.skipped += 1
            continue

        if not data.password:
            result.errors.append(
                ImportError(
                    row=index,
                    field="password",
                    message="Password is required for new users.",
                )
            )
            continue

        if not dry_run:
            user = User(
                name=data.name,
                email=data.email.lower(),
                role=data.role,
                hashed_password=get_password_hash(data.password),
                is_active=True,
            )
            session.add(user)

        result.created += 1

    if not dry_run:
        await session.commit()

    return result
