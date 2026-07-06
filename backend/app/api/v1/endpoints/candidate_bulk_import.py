from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.limiter import limiter
from app.db.session import get_db
from app.schemas.candidate_bulk_import import (
    BulkResumeCommitRequest,
    BulkResumeCommitResponse,
    BulkResumeExtractResponse,
)
from app.services import candidate_bulk_import as bulk_import_service

router = APIRouter()


@router.post("/extract", response_model=BulkResumeExtractResponse)
@limiter.limit("5/minute")
async def bulk_extract_resumes(
    request: Request,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    uploads = []
    for file in files:
        content = await file.read()
        uploads.append(
            bulk_import_service.RawUpload(
                filename=file.filename or "unnamed",
                content=content,
                mime_type=file.content_type or "",
            )
        )

    try:
        rows = await bulk_import_service.extract_resumes(db, uploads)
    except bulk_import_service.BulkImportError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return BulkResumeExtractResponse(rows=rows)


@router.post("/commit", response_model=BulkResumeCommitResponse)
async def bulk_commit_resumes(
    payload: BulkResumeCommitRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    results = await bulk_import_service.commit_resumes(
        db,
        payload.rows,
        source=payload.source,
        requisition_id=payload.requisition_id or None,
        talent_pool_id=payload.talent_pool_id or None,
        actor_user_id=user.id,
    )

    counts = {"created": 0, "merged": 0, "duplicate": 0, "error": 0}
    for row in results:
        counts[row.status] = counts.get(row.status, 0) + 1

    return BulkResumeCommitResponse(
        created=counts["created"],
        merged=counts["merged"],
        duplicate=counts["duplicate"],
        errors=counts["error"],
        rows=results,
    )
