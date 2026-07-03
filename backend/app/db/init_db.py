from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.user import User, UserRole
from app.models.requisition import Requisition
from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.talent_pool import TalentPool
from app.models.scorecard_template import ScorecardTemplate
from app.models.outreach_log import OutreachLog


async def init_db() -> None:
    async with engine.begin() as conn:
        # Once a database has been stamped by Alembic (see backend/migrations/),
        # schema changes must go through reviewed migrations - create_all() only
        # bootstraps a brand-new, never-migrated database (fresh local/test).
        alembic_owns_schema = (await conn.exec_driver_sql("SELECT to_regclass('alembic_version')")).scalar()
        if not alembic_owns_schema:
            await conn.run_sync(Base.metadata.create_all)

    await _bootstrap_admin()


async def _bootstrap_admin() -> None:
    if not settings.ADMIN_BOOTSTRAP_EMAIL or not settings.ADMIN_BOOTSTRAP_PASSWORD:
        return

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_BOOTSTRAP_EMAIL.lower())
        )
        existing = result.scalar_one_or_none()
        if existing:
            return

        admin = User(
            email=settings.ADMIN_BOOTSTRAP_EMAIL.lower(),
            name=settings.ADMIN_BOOTSTRAP_NAME,
            role=UserRole.ADMIN,
            hashed_password=get_password_hash(settings.ADMIN_BOOTSTRAP_PASSWORD),
            is_active=True,
        )
        session.add(admin)
        await session.commit()
