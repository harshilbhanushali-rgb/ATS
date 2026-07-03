"""phase 5 - drop dead legacy columns (contract)

Revision ID: 0003_phase5_drop_legacy_columns
Revises: 0002_phase1_schema_normalization
Create Date: 2026-07-03

Drops columns confirmed dead by code inspection + live-DB verification on
2026-07-03 (see backend/migrations verification notes / session transcript):

Candidates (Phase 4 dual-write cutover already moved these to normalized
tables - candidate_talent_pools, candidate_stage_history, candidate_comments,
offers - and candidate_to_out() sources exclusively from those):
    - candidates.talent_pool_ids
    - candidates.stage_history
    - candidates.hiring_hub_comments
    - candidates.offer_details
Verified: all 8 candidate rows had non-null values but the newest was last
written 2026-06-12, before the Phase 4 cutover - confirming nothing writes to
them anymore. Full column values were exported to a local backup file before
this revision was authored.

Requisitions (added by 0002 as future structured replacements for the `cost`
and `backfill_details` JSONB columns, but the dual-write/read-switch logic for
requisitions was never implemented - `cost` and `backfill_details` remain the
live, actively-read-and-written columns and are NOT touched by this
revision):
    - requisitions.cost_amount
    - requisitions.cost_currency
    - requisitions.backfill_employee_name
    - requisitions.backfill_previous_salary
Verified: 0 non-null values across all 4 requisition rows - never populated.

This is the one genuinely destructive, hard-to-reverse step in the schema
migration plan. Downgrade re-adds the columns as nullable but cannot restore
data - restoring dropped candidate JSONB values requires the local backup
file exported before this revision ran.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0003_phase5_drop_legacy_columns"
down_revision: Union[str, None] = "0002_phase1_schema_normalization"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("candidates", "talent_pool_ids")
    op.drop_column("candidates", "stage_history")
    op.drop_column("candidates", "hiring_hub_comments")
    op.drop_column("candidates", "offer_details")

    op.drop_column("requisitions", "cost_amount")
    op.drop_column("requisitions", "cost_currency")
    op.drop_column("requisitions", "backfill_employee_name")
    op.drop_column("requisitions", "backfill_previous_salary")


def downgrade() -> None:
    op.add_column("candidates", sa.Column("offer_details", postgresql.JSONB, nullable=True))
    op.add_column("candidates", sa.Column("hiring_hub_comments", postgresql.JSONB, nullable=True))
    op.add_column("candidates", sa.Column("stage_history", postgresql.JSONB, nullable=True))
    op.add_column("candidates", sa.Column("talent_pool_ids", postgresql.JSONB, nullable=True))

    op.add_column(
        "requisitions",
        sa.Column("backfill_previous_salary", sa.Numeric(14, 2), nullable=True),
    )
    op.add_column(
        "requisitions",
        sa.Column("backfill_employee_name", sa.String(200), nullable=True),
    )
    op.add_column(
        "requisitions",
        sa.Column(
            "cost_currency",
            postgresql.ENUM(name="currency_enum", create_type=False),
            nullable=True,
        ),
    )
    op.add_column(
        "requisitions",
        sa.Column("cost_amount", sa.Numeric(14, 2), nullable=True),
    )
