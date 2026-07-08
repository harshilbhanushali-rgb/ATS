from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ScorecardTemplateBase(BaseModel):
    name: str
    competencies: list[dict]
    created_date: date


class ScorecardTemplateCreate(ScorecardTemplateBase):
    id: str | None = None


class ScorecardTemplateUpdate(BaseModel):
    name: str | None = None
    competencies: list[dict] | None = None
    created_date: date | None = None


class ScorecardTemplateOut(ScorecardTemplateBase):
    id: str
    created_by: UUID | None = None
    created_by_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
