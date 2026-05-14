from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OutreachLogBase(BaseModel):
    candidate_id: str
    sourcer_user_id: str
    channel: str
    outreach_date: str
    notes: str | None = None
    responded: bool = False
    response_date: str | None = None
    clicked_link: bool = False


class OutreachLogCreate(OutreachLogBase):
    id: str | None = None


class OutreachLogUpdate(BaseModel):
    candidate_id: str | None = None
    sourcer_user_id: str | None = None
    channel: str | None = None
    outreach_date: str | None = None
    notes: str | None = None
    responded: bool | None = None
    response_date: str | None = None
    clicked_link: bool | None = None


class OutreachLogOut(OutreachLogBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
