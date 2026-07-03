from __future__ import annotations

import uuid as uuid_module
from datetime import date as date_type
from decimal import Decimal, InvalidOperation

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.candidate import Candidate
from app.models.candidate_comment import CandidateComment
from app.models.candidate_stage_history import CandidateStageHistory
from app.models.candidate_talent_pool import CandidateTalentPool
from app.models.enums import CandidateStageEnum, CurrencyEnum, OfferStatusEnum
from app.models.offer import Offer
from app.schemas.candidate import CandidateCreate, CandidateOut, CandidateUpdate

_EAGER_LOAD = (
    selectinload(Candidate.talent_pool_links),
    selectinload(Candidate.stage_history_entries),
    selectinload(Candidate.comments),
    selectinload(Candidate.offers),
)


def _safe_uuid(value: object) -> uuid_module.UUID | None:
    try:
        return uuid_module.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def _safe_currency(value: object) -> CurrencyEnum | None:
    try:
        return CurrencyEnum(value)
    except ValueError:
        return None


def _safe_date(value: object) -> date_type | None:
    if isinstance(value, date_type):
        return value
    if isinstance(value, str):
        try:
            return date_type.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _safe_decimal(value: object) -> Decimal | None:
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError):
        return None


async def _sync_talent_pool_links(
    session: AsyncSession, candidate_id: str, pool_ids: list[str], actor_user_id: uuid_module.UUID | None
) -> None:
    existing = (
        await session.execute(select(CandidateTalentPool).where(CandidateTalentPool.candidate_id == candidate_id))
    ).scalars().all()
    existing_pool_ids = {link.talent_pool_id for link in existing}
    target_pool_ids = set(pool_ids or [])

    for link in existing:
        if link.talent_pool_id not in target_pool_ids:
            await session.delete(link)

    for pool_id in target_pool_ids - existing_pool_ids:
        session.add(
            CandidateTalentPool(candidate_id=candidate_id, talent_pool_id=pool_id, added_by_user_id=actor_user_id)
        )


def _sync_new_comments(candidate_id: str, comments_payload: list[dict], existing_ids: set[str], session: AsyncSession) -> None:
    for entry in comments_payload or []:
        comment_id = entry.get("id")
        if not comment_id or comment_id in existing_ids:
            continue
        session.add(
            CandidateComment(
                id=comment_id,
                candidate_id=candidate_id,
                author_user_id=_safe_uuid(entry.get("authorId")),
                author_name_snapshot=entry.get("authorName") or "",
                text=entry.get("text") or "",
            )
        )


async def _upsert_offer(session: AsyncSession, candidate_id: str, offer_details: dict) -> None:
    salary = offer_details.get("salary") or {}
    salary_amount = _safe_decimal(salary.get("amount"))
    start_date = _safe_date(offer_details.get("startDate"))
    if salary_amount is None or start_date is None:
        return  # incomplete payload from client - skip normalized dual-write, JSONB column still gets it

    fields = dict(
        salary_amount=salary_amount,
        salary_currency=_safe_currency(salary.get("currency")) or CurrencyEnum.INR,
        start_date=start_date,
        offer_letter_url=offer_details.get("offerLetterUrl"),
        offer_notes=offer_details.get("offerNotes"),
    )

    latest = (
        await session.execute(
            select(Offer).where(Offer.candidate_id == candidate_id).order_by(Offer.created_at.desc()).limit(1)
        )
    ).scalar_one_or_none()

    if latest is not None and latest.status == OfferStatusEnum.EXTENDED:
        for key, value in fields.items():
            setattr(latest, key, value)
    else:
        session.add(Offer(candidate_id=candidate_id, **fields))


async def _update_latest_offer_status(session: AsyncSession, candidate_id: str, status: OfferStatusEnum) -> None:
    latest = (
        await session.execute(
            select(Offer).where(Offer.candidate_id == candidate_id).order_by(Offer.created_at.desc()).limit(1)
        )
    ).scalar_one_or_none()
    if latest is not None:
        latest.status = status


async def _find_pool_only_candidate(session: AsyncSession, email: str) -> Candidate | None:
    result = await session.execute(
        select(Candidate)
        .options(*_EAGER_LOAD)
        .where(Candidate.requisition_id.is_(None), func.lower(Candidate.email) == email.lower())
    )
    return result.scalar_one_or_none()


async def list_candidates(session: AsyncSession, skip: int = 0, limit: int = 100) -> list[Candidate]:
    result = await session.execute(
        select(Candidate)
        .options(*_EAGER_LOAD)
        .order_by(Candidate.created_at.desc())
        .offset(skip)
        .limit(limit)
        .execution_options(populate_existing=True)
    )
    return list(result.scalars().all())


async def get_candidate(session: AsyncSession, candidate_id: str) -> Candidate | None:
    result = await session.execute(
        select(Candidate)
        .options(*_EAGER_LOAD)
        .where(Candidate.id == candidate_id)
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def create_candidate(
    session: AsyncSession, candidate_in: CandidateCreate, actor_user_id: uuid_module.UUID | None = None
) -> Candidate:
    data = candidate_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)

    email = (data.get("email") or "")
    requisition_id = data.get("requisition_id") or None
    data["requisition_id"] = requisition_id

    if requisition_id:
        dup = await session.execute(
            select(Candidate.id).where(
                Candidate.requisition_id == requisition_id, func.lower(Candidate.email) == email.lower()
            )
        )
        if dup.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=409, detail="Candidate with this email already applied to this requisition"
            )
    else:
        pool_only = await _find_pool_only_candidate(session, email)
        if pool_only is not None:
            await _sync_talent_pool_links(session, pool_only.id, data.get("talent_pool_ids") or [], actor_user_id)
            await session.commit()
            return await get_candidate(session, pool_only.id)  # reload with eager-loaded relationships

    # Phase 4: talent_pool_ids/stage_history/hiring_hub_comments/offer_details are no
    # longer written to their legacy JSONB columns - the normalized tables below are
    # the source of truth and the read path (candidate_to_out) already sources from
    # them. The columns stay in the DB schema, unused, as a rollback safety net.
    talent_pool_ids = data.pop("talent_pool_ids", None)
    hiring_hub_comments = data.pop("hiring_hub_comments", None)
    offer_details = data.pop("offer_details", None)
    data.pop("stage_history", None)

    try:
        candidate = Candidate(**data)
        session.add(candidate)
        await session.flush()

        session.add(
            CandidateStageHistory(candidate_id=candidate.id, stage=candidate.stage, changed_by_user_id=actor_user_id)
        )
        for pool_id in talent_pool_ids or []:
            session.add(
                CandidateTalentPool(candidate_id=candidate.id, talent_pool_id=pool_id, added_by_user_id=actor_user_id)
            )
        _sync_new_comments(candidate.id, hiring_hub_comments or [], set(), session)
        if offer_details:
            await _upsert_offer(session, candidate.id, offer_details)

        await session.commit()
        return await get_candidate(session, candidate.id)  # reload with eager-loaded relationships
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Candidate with this ID already exists")


async def update_candidate(
    session: AsyncSession,
    candidate: Candidate,
    candidate_in: CandidateUpdate,
    actor_user_id: uuid_module.UUID | None = None,
) -> Candidate:
    updates = candidate_in.model_dump(exclude_unset=True)

    new_stage = updates.get("stage")
    if new_stage is not None and new_stage != candidate.stage:
        session.add(
            CandidateStageHistory(candidate_id=candidate.id, stage=new_stage, changed_by_user_id=actor_user_id)
        )
        if new_stage == CandidateStageEnum.OFFER_ACCEPTED.value:
            await _update_latest_offer_status(session, candidate.id, OfferStatusEnum.ACCEPTED)
        elif new_stage == CandidateStageEnum.OFFER_DECLINED.value:
            await _update_latest_offer_status(session, candidate.id, OfferStatusEnum.DECLINED)

    if "talent_pool_ids" in updates:
        await _sync_talent_pool_links(session, candidate.id, updates.get("talent_pool_ids") or [], actor_user_id)

    if "hiring_hub_comments" in updates:
        existing_comment_ids = {c.id for c in candidate.comments}
        _sync_new_comments(candidate.id, updates.get("hiring_hub_comments") or [], existing_comment_ids, session)

    if updates.get("offer_details"):
        await _upsert_offer(session, candidate.id, updates["offer_details"])

    # Phase 4: the 4 legacy JSONB fields are handled above via the normalized
    # tables and are no longer written to their old columns (see create_candidate).
    _legacy_jsonb_fields = {"talent_pool_ids", "stage_history", "hiring_hub_comments", "offer_details"}
    for field, value in updates.items():
        if field in _legacy_jsonb_fields:
            continue
        setattr(candidate, field, value)
    session.add(candidate)
    await session.commit()
    return await get_candidate(session, candidate.id)  # reload with eager-loaded relationships


async def delete_candidate(session: AsyncSession, candidate: Candidate) -> None:
    await session.delete(candidate)
    await session.commit()


def _offer_to_dict(offer: Offer) -> dict:
    return {
        "salary": {"amount": float(offer.salary_amount), "currency": offer.salary_currency.value},
        "startDate": offer.start_date.isoformat(),
        "offerLetterUrl": offer.offer_letter_url,
        "offerNotes": offer.offer_notes,
    }


def _stage_entry_to_dict(entry: CandidateStageHistory) -> dict:
    return {
        "stage": entry.stage.value if hasattr(entry.stage, "value") else entry.stage,
        "date": entry.changed_at.isoformat(),
        "changedByUserId": str(entry.changed_by_user_id) if entry.changed_by_user_id else None,
    }


def _comment_to_dict(comment: CandidateComment) -> dict:
    return {
        "id": comment.id,
        "authorId": str(comment.author_user_id) if comment.author_user_id else "",
        "authorName": comment.author_name_snapshot,
        "timestamp": comment.created_at.isoformat(),
        "text": comment.text,
    }


def candidate_to_out(candidate: Candidate) -> CandidateOut:
    """Serializes a Candidate ORM object (with relationships eager-loaded via
    _EAGER_LOAD) into the CandidateOut shape, sourcing talent_pool_ids/
    stage_history/hiring_hub_comments/offer_details from the normalized
    tables instead of the legacy JSONB columns - Phase 3 read switch."""
    latest_offer = max(candidate.offers, key=lambda o: o.created_at) if candidate.offers else None
    return CandidateOut(
        id=candidate.id,
        requisition_id=candidate.requisition_id,
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone,
        application_date=candidate.application_date,
        stage=candidate.stage.value if hasattr(candidate.stage, "value") else candidate.stage,
        source=candidate.source.value if hasattr(candidate.source, "value") else candidate.source,
        resume_url=candidate.resume_url,
        resume_text=candidate.resume_text,
        notes=candidate.notes,
        offer_details=_offer_to_dict(latest_offer) if latest_offer else None,
        resume_analysis=candidate.resume_analysis,
        talent_pool_ids=[link.talent_pool_id for link in candidate.talent_pool_links] or None,
        sourced_by_user_id=str(candidate.sourced_by_user_id) if candidate.sourced_by_user_id else None,
        sourced_date=candidate.sourced_date,
        stage_history=[_stage_entry_to_dict(e) for e in candidate.stage_history_entries] or None,
        hiring_hub_comments=[_comment_to_dict(c) for c in candidate.comments] or None,
        ai_debrief_summary=candidate.ai_debrief_summary,
        metadata_=candidate.metadata_,
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
    )
