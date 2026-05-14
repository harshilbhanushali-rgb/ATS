from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.schemas.imports import ImportResult
from app.services import imports as imports_service
from app.utils.imports import parse_users_import

router = APIRouter()


@router.post("/users", response_model=ImportResult)
async def import_users(
    dry_run: bool = True,
    allow_update: bool = False,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> ImportResult:
    try:
        file_bytes = await file.read()
        rows = parse_users_import(file_bytes, file.filename or "")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    result = await imports_service.import_users(
        db, rows, dry_run=dry_run, allow_update=allow_update
    )
    return result
