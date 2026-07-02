from __future__ import annotations

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.outreach_log import OutreachLog
from app.models.requisition import Requisition
from app.models.scorecard_template import ScorecardTemplate
from app.models.talent_pool import TalentPool


async def clear_all_data(db: AsyncSession) -> None:
    await db.execute(delete(Interview))
    await db.execute(delete(OutreachLog))
    await db.execute(delete(Candidate))
    await db.execute(delete(Requisition))
    await db.execute(delete(TalentPool))
    await db.execute(delete(ScorecardTemplate))
    await db.commit()
