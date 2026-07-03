from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import InterviewDecisionEnum, InterviewRoundEnum


class Interview(Base):
    __tablename__ = "interviews"
    __table_args__ = (
        Index("ix_interviews_candidate_id", "candidate_id"),
        Index("ix_interviews_requisition_id", "requisition_id"),
        Index("ix_interviews_scorecard_template_id", "scorecard_template_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"))
    requisition_id: Mapped[str] = mapped_column(String(64), ForeignKey("requisitions.id", ondelete="CASCADE"))
    round: Mapped[InterviewRoundEnum] = mapped_column(
        SqlEnum(InterviewRoundEnum, name="interview_round_enum", values_callable=lambda x: [e.value for e in x])
    )
    interviewer_name: Mapped[str] = mapped_column(String(200))
    interviewer_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    interview_date: Mapped[date] = mapped_column(Date)
    decision: Mapped[InterviewDecisionEnum] = mapped_column(
        SqlEnum(InterviewDecisionEnum, name="interview_decision_enum", values_callable=lambda x: [e.value for e in x])
    )
    scorecard_template_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("scorecard_templates.id", ondelete="SET NULL"), nullable=True
    )
    results: Mapped[list[dict]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    candidate: Mapped["Candidate"] = relationship()
    requisition: Mapped["Requisition"] = relationship(back_populates="interviews")
    interviewer: Mapped["User"] = relationship()
    scorecard_template: Mapped["ScorecardTemplate"] = relationship()
