"""baseline - marks the schema as it exists in production before Alembic adoption

Revision ID: 0001_baseline
Revises:
Create Date: 2026-07-02

This revision is intentionally a no-op. It exists so `alembic stamp head` can
mark an already-existing, hand-created (Base.metadata.create_all()) database
as being at this point in migration history, without Alembic trying to
(re)create tables that are already there.

Do NOT run `alembic upgrade head` for this revision against the live Supabase
database - run `alembic stamp 0001_baseline` instead. Every actual schema
change starts from the next revision (0002_phase1_schema_normalization).
"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
