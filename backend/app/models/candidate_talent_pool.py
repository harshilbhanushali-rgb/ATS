from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CandidateTalentPool(Base):
    __tablename__ = "candidate_talent_pools"
    __table_args__ = (
        UniqueConstraint("candidate_id", "talent_pool_id", name="uq_candidate_talent_pool"),
        Index("ix_candidate_talent_pools_talent_pool_id", "talent_pool_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"))
    talent_pool_id: Mapped[str] = mapped_column(String(64), ForeignKey("talent_pools.id", ondelete="CASCADE"))
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    added_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    candidate: Mapped["Candidate"] = relationship(back_populates="talent_pool_links")
    talent_pool: Mapped["TalentPool"] = relationship(back_populates="candidate_links")
