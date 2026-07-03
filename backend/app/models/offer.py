from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import DateTime, Date, Enum as SqlEnum, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CurrencyEnum, OfferStatusEnum


class Offer(Base):
    __tablename__ = "offers"
    __table_args__ = (Index("ix_offers_candidate_id", "candidate_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"))
    salary_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    salary_currency: Mapped[CurrencyEnum] = mapped_column(
        SqlEnum(CurrencyEnum, name="currency_enum", values_callable=lambda x: [e.value for e in x])
    )
    start_date: Mapped[date] = mapped_column(Date)
    status: Mapped[OfferStatusEnum] = mapped_column(
        SqlEnum(OfferStatusEnum, name="offer_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=OfferStatusEnum.EXTENDED,
    )
    offer_letter_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    offer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    candidate: Mapped["Candidate"] = relationship(back_populates="offers")
