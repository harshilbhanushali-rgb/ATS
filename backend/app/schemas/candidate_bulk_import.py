from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class ExistingCandidateWarning(BaseModel):
    candidate_id: str
    requisition_id: str | None = None
    talent_pool_ids: list[str] = Field(default_factory=list)


class BulkResumeExtractRow(BaseModel):
    filename: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    resume_text: str | None = None
    mime_type: str | None = None
    extraction_error: str | None = None
    existing_candidate_warning: ExistingCandidateWarning | None = None


class BulkResumeExtractResponse(BaseModel):
    rows: list[BulkResumeExtractRow] = Field(default_factory=list)


class BulkResumeCommitRow(BaseModel):
    filename: str
    name: str
    email: EmailStr
    phone: str | None = None
    resume_text: str | None = None


class BulkResumeCommitRequest(BaseModel):
    rows: list[BulkResumeCommitRow]
    source: str
    requisition_id: str | None = None
    talent_pool_id: str | None = None


class BulkImportRowResult(BaseModel):
    filename: str
    status: str  # "created" | "merged" | "duplicate" | "error"
    candidate_id: str | None = None
    message: str | None = None


class BulkResumeCommitResponse(BaseModel):
    created: int = 0
    merged: int = 0
    duplicate: int = 0
    errors: int = 0
    rows: list[BulkImportRowResult] = Field(default_factory=list)
