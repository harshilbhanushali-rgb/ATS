from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import ARRAY, Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TalentPool(Base):
    __tablename__ = "talent_pools"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(500))
    created_date: Mapped[date] = mapped_column(Date)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String(80)), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    candidate_links: Mapped[list["CandidateTalentPool"]] = relationship(back_populates="talent_pool")
