from __future__ import annotations

import asyncio
import base64
import uuid as uuid_module
from dataclasses import dataclass
from datetime import date as date_type

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.candidate import Candidate
from app.models.enums import CandidateStageEnum
from app.schemas.candidate import CandidateCreate
from app.schemas.candidate_bulk_import import (
    BulkImportRowResult,
    BulkResumeCommitRow,
    BulkResumeExtractRow,
    ExistingCandidateWarning,
)
from app.services import ai as ai_service
from app.services.candidates import _find_pool_only_candidate, create_candidate

MAX_BULK_FILES = 25
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

_UNSUPPORTED_DOC_MIME_TYPES = {
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
_ACCEPTED_MIME_TYPES = {"application/pdf", "text/plain"}


@dataclass
class RawUpload:
    filename: str
    content: bytes
    mime_type: str


class BulkImportError(ValueError):
    pass


async def _extract_text_only(upload: RawUpload) -> BulkResumeExtractRow:
    if upload.mime_type in _UNSUPPORTED_DOC_MIME_TYPES:
        return BulkResumeExtractRow(
            filename=upload.filename,
            extraction_error=(
                "Microsoft Word files (.doc, .docx) are not supported. "
                "Please convert to PDF or .txt and re-upload."
            ),
        )
    if upload.mime_type not in _ACCEPTED_MIME_TYPES:
        return BulkResumeExtractRow(
            filename=upload.filename,
            extraction_error=f"Unsupported file type: {upload.mime_type or 'unknown'}. Only PDF and .txt are supported.",
        )
    if len(upload.content) > MAX_FILE_SIZE_BYTES:
        return BulkResumeExtractRow(
            filename=upload.filename,
            extraction_error="File is too large. Maximum size is 10MB.",
        )

    file_base64 = base64.b64encode(upload.content).decode("ascii")
    try:
        result = await ai_service.extract_text_from_file(file_base64, upload.mime_type, extract_contact_info=True)
    except Exception as error:  # noqa: BLE001 - surfaced per-row, must not fail the whole batch
        return BulkResumeExtractRow(filename=upload.filename, extraction_error=str(error))

    return BulkResumeExtractRow(
        filename=upload.filename,
        name=result.get("name"),
        email=result.get("email"),
        phone=result.get("phone"),
        resume_text=result.get("text"),
        mime_type=upload.mime_type,
    )


async def _find_any_candidate_by_email(session: AsyncSession, email: str) -> Candidate | None:
    """Broadens `_find_pool_only_candidate`'s email match to ALL candidates (not just
    pool-only ones), so the review step can warn about an existing requisition-linked
    candidate that `create_candidate`'s merge logic would otherwise silently miss."""
    result = await session.execute(
        select(Candidate)
        .options(selectinload(Candidate.talent_pool_links))
        .where(func.lower(Candidate.email) == email.lower())
        .order_by(Candidate.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def extract_resumes(session: AsyncSession, uploads: list[RawUpload]) -> list[BulkResumeExtractRow]:
    if not uploads:
        raise BulkImportError("No files provided.")
    if len(uploads) > MAX_BULK_FILES:
        raise BulkImportError(f"Cannot process more than {MAX_BULK_FILES} files in a single batch.")

    # Gemini calls only, no DB access - safe to run concurrently (bounded by the
    # existing global Gemini semaphore in ai_service).
    rows = list(await asyncio.gather(*[_extract_text_only(u) for u in uploads]))

    # Existing-candidate lookup is a DB read, so it must stay sequential - a single
    # AsyncSession is not safe for concurrent use across coroutines.
    for row in rows:
        if row.extraction_error or not row.email:
            continue
        existing = await _find_any_candidate_by_email(session, row.email)
        if existing is not None:
            row.existing_candidate_warning = ExistingCandidateWarning(
                candidate_id=existing.id,
                requisition_id=existing.requisition_id,
                talent_pool_ids=[link.talent_pool_id for link in existing.talent_pool_links],
            )

    return rows


async def commit_resumes(
    session: AsyncSession,
    rows: list[BulkResumeCommitRow],
    source: str,
    requisition_id: str | None,
    talent_pool_id: str | None,
    actor_user_id: uuid_module.UUID | None,
) -> list[BulkImportRowResult]:
    results: list[BulkImportRowResult] = []
    today = date_type.today()
    stage = CandidateStageEnum.APPLIED.value if requisition_id else CandidateStageEnum.POOLED.value
    talent_pool_ids = [talent_pool_id] if talent_pool_id else None

    for row in rows:
        pre_existing_pool_only_id = None
        if not requisition_id:
            pool_only = await _find_pool_only_candidate(session, row.email)
            pre_existing_pool_only_id = pool_only.id if pool_only else None

        candidate_in = CandidateCreate(
            name=row.name,
            email=row.email,
            phone=row.phone,
            application_date=today,
            stage=stage,
            source=source,
            resume_text=row.resume_text,
            requisition_id=requisition_id,
            talent_pool_ids=talent_pool_ids,
        )
        try:
            candidate = await create_candidate(session, candidate_in, actor_user_id=actor_user_id)
        except HTTPException as exc:
            results.append(
                BulkImportRowResult(
                    filename=row.filename,
                    status="duplicate" if exc.status_code == 409 else "error",
                    message=str(exc.detail),
                )
            )
            continue

        if pre_existing_pool_only_id and candidate.id == pre_existing_pool_only_id:
            results.append(BulkImportRowResult(filename=row.filename, status="merged", candidate_id=candidate.id))
        else:
            results.append(BulkImportRowResult(filename=row.filename, status="created", candidate_id=candidate.id))

    return results
