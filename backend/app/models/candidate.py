from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CandidateSourceEnum, CandidateStageEnum


class Candidate(Base):
    __tablename__ = "candidates"
    __table_args__ = (
        Index("ix_candidates_requisition_id", "requisition_id"),
        Index("ix_candidates_stage", "stage"),
        Index("ix_candidates_sourced_by_user_id", "sourced_by_user_id"),
        Index("ix_candidates_email", "email"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    requisition_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("requisitions.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    application_date: Mapped[date] = mapped_column(Date)
    stage: Mapped[CandidateStageEnum] = mapped_column(
        SqlEnum(CandidateStageEnum, name="candidate_stage_enum", values_callable=lambda x: [e.value for e in x])
    )
    source: Mapped[CandidateSourceEnum] = mapped_column(
        SqlEnum(CandidateSourceEnum, name="candidate_source_enum", values_callable=lambda x: [e.value for e in x])
    )
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    sourced_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    sourced_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    ai_debrief_summary: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requisition: Mapped["Requisition"] = relationship(back_populates="candidates")
    sourced_by: Mapped["User"] = relationship()
    talent_pool_links: Mapped[list["CandidateTalentPool"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    stage_history_entries: Mapped[list["CandidateStageHistory"]] = relationship(
        back_populates="candidate", order_by="CandidateStageHistory.changed_at", cascade="all, delete-orphan"
    )
    comments: Mapped[list["CandidateComment"]] = relationship(
        back_populates="candidate", order_by="CandidateComment.created_at", cascade="all, delete-orphan"
    )
    offers: Mapped[list["Offer"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
