from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64))
    requisition_id: Mapped[str] = mapped_column(String(64))
    round: Mapped[str] = mapped_column(String(80))
    interviewer_name: Mapped[str] = mapped_column(String(200))
    interview_date: Mapped[str] = mapped_column(String(40))
    decision: Mapped[str] = mapped_column(String(80))
    scorecard_template_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    results: Mapped[list[dict]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
