from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Candidate(Base):
    __tablename__ = "candidates"
    __table_args__ = (
        Index("ix_candidates_requisition_id", "requisition_id"),
        Index("ix_candidates_stage", "stage"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    requisition_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    application_date: Mapped[str] = mapped_column(String(40))
    stage: Mapped[str] = mapped_column(String(80))
    source: Mapped[str] = mapped_column(String(80))
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    offer_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    resume_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    talent_pool_ids: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    sourced_by_user_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    sourced_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stage_history: Mapped[list[dict] | None] = mapped_column(JSONB, nullable=True)
    hiring_hub_comments: Mapped[list[dict] | None] = mapped_column(JSONB, nullable=True)
    ai_debrief_summary: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
