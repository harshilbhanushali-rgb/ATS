from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CandidateStageEnum


class CandidateStageHistory(Base):
    __tablename__ = "candidate_stage_history"
    __table_args__ = (Index("ix_candidate_stage_history_candidate_id", "candidate_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"))
    stage: Mapped[CandidateStageEnum] = mapped_column(
        SqlEnum(CandidateStageEnum, name="candidate_stage_enum", values_callable=lambda x: [e.value for e in x])
    )
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    changed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    candidate: Mapped["Candidate"] = relationship(back_populates="stage_history_entries")
    changed_by: Mapped["User"] = relationship()
