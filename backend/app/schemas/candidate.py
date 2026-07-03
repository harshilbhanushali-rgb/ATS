from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CandidateBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    requisition_id: str | None = None
    name: str
    email: EmailStr
    phone: str | None = None
    application_date: date
    stage: str
    source: str
    resume_url: str | None = None
    resume_text: str | None = None
    notes: str | None = None
    offer_details: dict | None = None
    resume_analysis: dict | None = None
    talent_pool_ids: list[str] | None = None
    sourced_by_user_id: str | None = None
    sourced_date: date | None = None
    stage_history: list[dict] | None = None
    hiring_hub_comments: list[dict] | None = None
    ai_debrief_summary: dict | None = None
    metadata_: dict | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class CandidateCreate(CandidateBase):
    id: str | None = None


class CandidateUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    requisition_id: str | None = None
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    application_date: date | None = None
    stage: str | None = None
    source: str | None = None
    resume_url: str | None = None
    resume_text: str | None = None
    notes: str | None = None
    offer_details: dict | None = None
    resume_analysis: dict | None = None
    talent_pool_ids: list[str] | None = None
    sourced_by_user_id: str | None = None
    sourced_date: date | None = None
    stage_history: list[dict] | None = None
    hiring_hub_comments: list[dict] | None = None
    ai_debrief_summary: dict | None = None
    metadata_: dict | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class CandidateOut(CandidateBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    metadata_: dict | None = Field(default=None, serialization_alias="metadata")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
