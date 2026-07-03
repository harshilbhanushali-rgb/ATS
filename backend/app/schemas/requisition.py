from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class RequisitionBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    req_approval_date: date
    priority: str
    role: str
    hire_type: str
    cost: dict
    req_status: str
    location: str
    function: str
    new_or_backfill: str
    backfill_details: dict | None = None
    hiring_manager_name: str
    function_head_name: str
    assigned_recruiter_name: str
    job_description: str | None = None
    metadata_: dict | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class RequisitionCreate(RequisitionBase):
    id: str | None = None


class RequisitionUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    req_approval_date: date | None = None
    priority: str | None = None
    role: str | None = None
    hire_type: str | None = None
    cost: dict | None = None
    req_status: str | None = None
    location: str | None = None
    function: str | None = None
    new_or_backfill: str | None = None
    backfill_details: dict | None = None
    hiring_manager_name: str | None = None
    function_head_name: str | None = None
    assigned_recruiter_name: str | None = None
    job_description: str | None = None
    metadata_: dict | None = Field(default=None, validation_alias="metadata", serialization_alias="metadata")


class RequisitionOut(RequisitionBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    metadata_: dict | None = Field(default=None, serialization_alias="metadata")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
