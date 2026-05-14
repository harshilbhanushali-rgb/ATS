from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64))
    sourcer_user_id: Mapped[str] = mapped_column(String(64))
    channel: Mapped[str] = mapped_column(String(80))
    outreach_date: Mapped[str] = mapped_column(String(40))
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    responded: Mapped[bool] = mapped_column(Boolean, default=False)
    response_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    clicked_link: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
