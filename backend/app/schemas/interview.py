from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class InterviewBase(BaseModel):
    candidate_id: str
    requisition_id: str
    round: str
    interviewer_name: str
    interview_date: date
    decision: str
    scorecard_template_id: str | None = None
    results: list[dict]


class InterviewCreate(InterviewBase):
    id: str | None = None


class InterviewUpdate(BaseModel):
    candidate_id: str | None = None
    requisition_id: str | None = None
    round: str | None = None
    interviewer_name: str | None = None
    interview_date: date | None = None
    decision: str | None = None
    scorecard_template_id: str | None = None
    results: list[dict] | None = None


class InterviewOut(InterviewBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
