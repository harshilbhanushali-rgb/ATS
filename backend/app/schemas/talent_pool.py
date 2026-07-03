from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TalentPoolBase(BaseModel):
    name: str
    description: str
    created_date: date
    tags: list[str] | None = None


class TalentPoolCreate(TalentPoolBase):
    id: str | None = None


class TalentPoolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    created_date: date | None = None
    tags: list[str] | None = None


class TalentPoolOut(TalentPoolBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
