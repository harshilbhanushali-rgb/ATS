"""add created_by ownership column to scorecard_templates

Revision ID: 0004_scorecard_template_owner
Revises: 0003_phase5_drop_legacy_columns
Create Date: 2026-07-08

Adds a nullable `created_by` FK (users.id, ON DELETE SET NULL) to
scorecard_templates so templates can be edited/deleted by their creator (or an
Admin) once template management opens up beyond Admin-only access. Existing
rows predate this concept and are backfilled to the oldest Admin user so they
have a real, editable owner rather than sitting in a permanently
admin-only-editable NULL state.

The column stays nullable at the DB level (required for ON DELETE SET NULL to
be legal) - the application always populates it on create. A NULL value can
only reoccur if a template's creator user is later deleted, which the service
layer treats as "only an Admin can edit this template" - not an error.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0004_scorecard_template_owner"
down_revision: Union[str, None] = "0003_phase5_drop_legacy_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "scorecard_templates",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_scorecard_templates_created_by_users",
        "scorecard_templates",
        "users",
        ["created_by"],
        ["id"],
        ondelete="SET NULL",
    )
    op.execute(
        """
        UPDATE scorecard_templates
        SET created_by = (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1)
        WHERE created_by IS NULL
        """
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_scorecard_templates_created_by_users", "scorecard_templates", type_="foreignkey"
    )
    op.drop_column("scorecard_templates", "created_by")
