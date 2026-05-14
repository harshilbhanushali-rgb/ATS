from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TalentPoolBase(BaseModel):
    name: str
    description: str
    created_date: str
    tags: list[str] | None = None


class TalentPoolCreate(TalentPoolBase):
    id: str | None = None


class TalentPoolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    created_date: str | None = None
    tags: list[str] | None = None


class TalentPoolOut(TalentPoolBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
