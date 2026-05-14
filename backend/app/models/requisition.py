from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Requisition(Base):
    __tablename__ = "requisitions"
    __table_args__ = (
        Index("ix_requisitions_role", "role"),
        Index("ix_requisitions_req_status", "req_status"),
        Index("ix_requisitions_hiring_manager_name", "hiring_manager_name"),
        Index("ix_requisitions_function", "function"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    req_approval_date: Mapped[str] = mapped_column(String(40))
    priority: Mapped[str] = mapped_column(String(40))
    role: Mapped[str] = mapped_column(String(200))
    hire_type: Mapped[str] = mapped_column(String(50))
    cost: Mapped[dict] = mapped_column(JSONB)
    req_status: Mapped[str] = mapped_column(String(40))
    location: Mapped[str] = mapped_column(String(40))
    function: Mapped[str] = mapped_column(String(80))
    new_or_backfill: Mapped[str] = mapped_column(String(40))
    backfill_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    hiring_manager_name: Mapped[str] = mapped_column(String(200))
    function_head_name: Mapped[str] = mapped_column(String(200))
    assigned_recruiter_name: Mapped[str] = mapped_column(String(200))
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
