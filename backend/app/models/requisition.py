from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import (
    FunctionAreaEnum,
    HireTypeEnum,
    LocationEnum,
    NewOrBackfillEnum,
    PriorityEnum,
    RequisitionStatusEnum,
)


class Requisition(Base):
    __tablename__ = "requisitions"
    __table_args__ = (
        Index("ix_requisitions_role", "role"),
        Index("ix_requisitions_req_status", "req_status"),
        Index("ix_requisitions_hiring_manager_name", "hiring_manager_name"),
        Index("ix_requisitions_function", "function"),
        Index("ix_requisitions_hiring_manager_id", "hiring_manager_id"),
        Index("ix_requisitions_assigned_recruiter_id", "assigned_recruiter_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    req_approval_date: Mapped[date] = mapped_column(Date)
    priority: Mapped[PriorityEnum] = mapped_column(
        SqlEnum(PriorityEnum, name="priority_enum", values_callable=lambda x: [e.value for e in x])
    )
    role: Mapped[str] = mapped_column(String(200))
    hire_type: Mapped[HireTypeEnum] = mapped_column(
        SqlEnum(HireTypeEnum, name="hire_type_enum", values_callable=lambda x: [e.value for e in x])
    )
    cost: Mapped[dict] = mapped_column(JSONB)
    req_status: Mapped[RequisitionStatusEnum] = mapped_column(
        SqlEnum(RequisitionStatusEnum, name="requisition_status_enum", values_callable=lambda x: [e.value for e in x])
    )
    location: Mapped[LocationEnum] = mapped_column(
        SqlEnum(LocationEnum, name="location_enum", values_callable=lambda x: [e.value for e in x])
    )
    function: Mapped[FunctionAreaEnum] = mapped_column(
        SqlEnum(FunctionAreaEnum, name="function_area_enum", values_callable=lambda x: [e.value for e in x])
    )
    new_or_backfill: Mapped[NewOrBackfillEnum] = mapped_column(
        SqlEnum(NewOrBackfillEnum, name="new_or_backfill_enum", values_callable=lambda x: [e.value for e in x])
    )
    backfill_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    hiring_manager_name: Mapped[str] = mapped_column(String(200))
    function_head_name: Mapped[str] = mapped_column(String(200))
    assigned_recruiter_name: Mapped[str] = mapped_column(String(200))
    hiring_manager_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    function_head_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    assigned_recruiter_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    hiring_manager: Mapped["User"] = relationship(foreign_keys=[hiring_manager_id])
    function_head: Mapped["User"] = relationship(foreign_keys=[function_head_id])
    assigned_recruiter: Mapped["User"] = relationship(foreign_keys=[assigned_recruiter_id])
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="requisition")
    interviews: Mapped[list["Interview"]] = relationship(back_populates="requisition")
