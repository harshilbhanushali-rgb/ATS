from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum as SqlEnum, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import OutreachChannelEnum


class OutreachLog(Base):
    __tablename__ = "outreach_logs"
    __table_args__ = (Index("ix_outreach_logs_candidate_id", "candidate_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"))
    sourcer_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")
    )
    channel: Mapped[OutreachChannelEnum] = mapped_column(
        SqlEnum(OutreachChannelEnum, name="outreach_channel_enum", values_callable=lambda x: [e.value for e in x])
    )
    outreach_date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    responded: Mapped[bool] = mapped_column(Boolean, default=False)
    response_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    clicked_link: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    candidate: Mapped["Candidate"] = relationship()
    sourcer: Mapped["User"] = relationship()
