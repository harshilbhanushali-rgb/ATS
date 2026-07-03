"""phase 1 - additive schema normalization (new tables, FKs, indexes, enums, dates)

Revision ID: 0002_phase1_schema_normalization
Revises: 0001_baseline
Create Date: 2026-07-02

Implements Phase 1 ("Additive/expand") of the schema redesign plan. This
revision is purely additive/type-tightening: it does not drop or rename any
existing column, and every value being cast into a stricter type (enum, date,
uuid) is expected to already conform - see the pre-flight checks below.

RUN THESE PRE-FLIGHT CHECKS MANUALLY AGAINST PRODUCTION BEFORE APPLYING THIS
REVISION (per the plan's manual-verification process - there is no test
suite in this repo to automate it):

    -- 1) Orphan check for each new/tightened FK (must return 0 rows each):
    SELECT id FROM candidates WHERE requisition_id IS NOT NULL
        AND requisition_id NOT IN (SELECT id FROM requisitions);
    SELECT id FROM candidates WHERE sourced_by_user_id IS NOT NULL
        AND sourced_by_user_id NOT IN (SELECT id::text FROM users);
    SELECT id FROM interviews WHERE candidate_id NOT IN (SELECT id FROM candidates);
    SELECT id FROM interviews WHERE requisition_id NOT IN (SELECT id FROM requisitions);
    SELECT id FROM interviews WHERE scorecard_template_id IS NOT NULL
        AND scorecard_template_id NOT IN (SELECT id FROM scorecard_templates);
    SELECT id FROM outreach_logs WHERE candidate_id NOT IN (SELECT id FROM candidates);
    SELECT id FROM outreach_logs WHERE sourcer_user_id NOT IN (SELECT id::text FROM users);

    -- 2) UUID-castability check for the two String->UUID column conversions
    --    (must return 0 rows each):
    SELECT id FROM candidates WHERE sourced_by_user_id IS NOT NULL
        AND sourced_by_user_id !~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    SELECT id FROM outreach_logs WHERE sourcer_user_id !~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    -- 3) Date-parseability check for every String->Date column (must return
    --    0 rows each; repeat with the relevant table/column):
    SELECT id FROM candidates WHERE application_date IS NOT NULL
        AND application_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM candidates WHERE sourced_date IS NOT NULL
        AND sourced_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM requisitions WHERE req_approval_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM interviews WHERE interview_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM outreach_logs WHERE outreach_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM outreach_logs WHERE response_date IS NOT NULL
        AND response_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM scorecard_templates WHERE created_date !~ '^\\d{4}-\\d{2}-\\d{2}';
    SELECT id FROM talent_pools WHERE created_date !~ '^\\d{4}-\\d{2}-\\d{2}';

    -- 4) Categorical value check for every String->Enum column (must return
    --    0 rows each - any row here means the enum's value list above is
    --    missing a legitimate historical value and must be extended first):
    SELECT DISTINCT stage FROM candidates;       -- compare against candidate_stage_enum values
    SELECT DISTINCT source FROM candidates;      -- compare against candidate_source_enum values
    SELECT DISTINCT priority FROM requisitions;
    SELECT DISTINCT hire_type FROM requisitions;
    SELECT DISTINCT req_status FROM requisitions;
    SELECT DISTINCT location FROM requisitions;
    SELECT DISTINCT function FROM requisitions;
    SELECT DISTINCT new_or_backfill FROM requisitions;
    SELECT DISTINCT round FROM interviews;
    SELECT DISTINCT decision FROM interviews;
    SELECT DISTINCT channel FROM outreach_logs;

If any pre-flight query returns rows, STOP - fix or exclude those rows before
applying this revision. Must run against the Supabase direct connection
(port 5432), not the pgBouncer transaction pooler (port 6543).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002_phase1_schema_normalization"
down_revision: Union[str, None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CANDIDATE_STAGE_VALUES = [
    "Applied", "Talent Pool Prospect", "Screening", "Shortlisted", "AI Sourced (Pool)",
    "Interview - Round 1", "Interview - Round 2", "Interview - Round 3", "Interview - Round 4",
    "HM Decision Pending", "Offer Extended", "Offer Accepted", "Offer Declined",
    "Hired", "Rejected", "On Hold",
]
CANDIDATE_SOURCE_VALUES = [
    "LinkedIn", "Indeed", "Naukri.com", "Referral", "Direct Application",
    "Company Careers Page", "Other",
]
REQUISITION_STATUS_VALUES = ["Open", "Offered", "Joined", "Hold", "Cancelled", "Archived"]
PRIORITY_VALUES = ["P0: Very Critical", "P1: Critical"]
HIRE_TYPE_VALUES = ["Full Time", "Intern", "Contract"]
LOCATION_VALUES = ["India", "US", "Canada", "UK"]
FUNCTION_AREA_VALUES = [
    "Sales", "Customer Success", "Marketing", "Supply", "Finance & Legal",
    "People and Culture", "Product", "Engineering", "Operations & Strategy",
]
NEW_OR_BACKFILL_VALUES = ["New", "Backfill"]
INTERVIEW_ROUND_VALUES = [
    "Interview - Round 1", "Interview - Round 2", "Interview - Round 3", "Interview - Round 4",
]
INTERVIEW_DECISION_VALUES = [
    "Proceed to Next Stage", "Recommend for Hire", "Put On Hold", "Reject Candidate",
]
OUTREACH_CHANNEL_VALUES = ["LinkedIn InMail", "Email", "Phone Call", "Other"]
CURRENCY_VALUES = ["INR", "USD"]
OFFER_STATUS_VALUES = ["Extended", "Accepted", "Declined", "Rescinded"]


def _create_enum(name: str, values: list[str]) -> None:
    postgresql.ENUM(*values, name=name).create(op.get_bind(), checkfirst=True)


def _drop_enum(name: str) -> None:
    postgresql.ENUM(name=name).drop(op.get_bind(), checkfirst=True)


def _table_exists(name: str) -> bool:
    return sa.inspect(op.get_bind()).has_table(name)


def upgrade() -> None:
    # --- 1. Enum types -----------------------------------------------------
    _create_enum("candidate_stage_enum", CANDIDATE_STAGE_VALUES)
    _create_enum("candidate_source_enum", CANDIDATE_SOURCE_VALUES)
    _create_enum("requisition_status_enum", REQUISITION_STATUS_VALUES)
    _create_enum("priority_enum", PRIORITY_VALUES)
    _create_enum("hire_type_enum", HIRE_TYPE_VALUES)
    _create_enum("location_enum", LOCATION_VALUES)
    _create_enum("function_area_enum", FUNCTION_AREA_VALUES)
    _create_enum("new_or_backfill_enum", NEW_OR_BACKFILL_VALUES)
    _create_enum("interview_round_enum", INTERVIEW_ROUND_VALUES)
    _create_enum("interview_decision_enum", INTERVIEW_DECISION_VALUES)
    _create_enum("outreach_channel_enum", OUTREACH_CHANNEL_VALUES)
    _create_enum("currency_enum", CURRENCY_VALUES)
    _create_enum("offer_status_enum", OFFER_STATUS_VALUES)

    # --- 2. New tables -------------------------------------------------------
    # Guarded with _table_exists(): a dev server running `uvicorn --reload`
    # during model development can call Base.metadata.create_all() (via
    # init_db()) before this migration is stamped/applied, which would
    # already have created these tables with identical structure. Skipping
    # re-creation keeps this migration idempotent against that race.
    if not _table_exists("candidate_talent_pools"):
        op.create_table(
            "candidate_talent_pools",
            sa.Column("id", sa.String(64), primary_key=True),
            sa.Column("candidate_id", sa.String(64), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
            sa.Column("talent_pool_id", sa.String(64), sa.ForeignKey("talent_pools.id", ondelete="CASCADE"), nullable=False),
            sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("added_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.UniqueConstraint("candidate_id", "talent_pool_id", name="uq_candidate_talent_pool"),
        )
        op.create_index("ix_candidate_talent_pools_talent_pool_id", "candidate_talent_pools", ["talent_pool_id"])

    if not _table_exists("candidate_stage_history"):
        op.create_table(
            "candidate_stage_history",
            sa.Column("id", sa.String(64), primary_key=True),
            sa.Column("candidate_id", sa.String(64), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
            sa.Column("stage", postgresql.ENUM(name="candidate_stage_enum", create_type=False), nullable=False),
            sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("changed_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        )
        op.create_index("ix_candidate_stage_history_candidate_id", "candidate_stage_history", ["candidate_id"])

    if not _table_exists("candidate_comments"):
        op.create_table(
            "candidate_comments",
            sa.Column("id", sa.String(64), primary_key=True),
            sa.Column("candidate_id", sa.String(64), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
            sa.Column("author_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("author_name_snapshot", sa.String(200), nullable=False),
            sa.Column("text", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_candidate_comments_candidate_id", "candidate_comments", ["candidate_id"])

    if not _table_exists("offers"):
        op.create_table(
            "offers",
            sa.Column("id", sa.String(64), primary_key=True),
            sa.Column("candidate_id", sa.String(64), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
            sa.Column("salary_amount", sa.Numeric(14, 2), nullable=False),
            sa.Column("salary_currency", postgresql.ENUM(name="currency_enum", create_type=False), nullable=False),
            sa.Column("start_date", sa.Date(), nullable=False),
            sa.Column("status", postgresql.ENUM(name="offer_status_enum", create_type=False), nullable=False, server_default="Extended"),
            sa.Column("offer_letter_url", sa.String(500), nullable=True),
            sa.Column("offer_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_offers_candidate_id", "offers", ["candidate_id"])

    # --- 3. New nullable columns on existing tables ---------------------------
    op.add_column("requisitions", sa.Column("hiring_manager_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("requisitions", sa.Column("function_head_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("requisitions", sa.Column("assigned_recruiter_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("requisitions", sa.Column("cost_amount", sa.Numeric(14, 2), nullable=True))
    op.add_column("requisitions", sa.Column("cost_currency", postgresql.ENUM(name="currency_enum", create_type=False), nullable=True))
    op.add_column("requisitions", sa.Column("backfill_employee_name", sa.String(200), nullable=True))
    op.add_column("requisitions", sa.Column("backfill_previous_salary", sa.Numeric(14, 2), nullable=True))
    op.add_column("interviews", sa.Column("interviewer_user_id", postgresql.UUID(as_uuid=True), nullable=True))

    # --- 4. Type conversions: String -> UUID (pre-flight check #2 above) -----
    op.alter_column(
        "candidates", "sourced_by_user_id",
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using="sourced_by_user_id::uuid",
    )
    op.alter_column(
        "outreach_logs", "sourcer_user_id",
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using="sourcer_user_id::uuid",
    )

    # --- 5. FK additions on existing columns, NOT VALID -> VALIDATE ----------
    # (two-step avoids a long ACCESS EXCLUSIVE lock on large tables)
    fk_specs = [
        ("fk_candidates_requisition_id", "candidates", "requisition_id", "requisitions", "id", "SET NULL"),
        ("fk_candidates_sourced_by_user_id", "candidates", "sourced_by_user_id", "users", "id", "SET NULL"),
        ("fk_interviews_candidate_id", "interviews", "candidate_id", "candidates", "id", "CASCADE"),
        ("fk_interviews_requisition_id", "interviews", "requisition_id", "requisitions", "id", "CASCADE"),
        ("fk_interviews_scorecard_template_id", "interviews", "scorecard_template_id", "scorecard_templates", "id", "SET NULL"),
        ("fk_interviews_interviewer_user_id", "interviews", "interviewer_user_id", "users", "id", "SET NULL"),
        ("fk_outreach_logs_candidate_id", "outreach_logs", "candidate_id", "candidates", "id", "CASCADE"),
        ("fk_outreach_logs_sourcer_user_id", "outreach_logs", "sourcer_user_id", "users", "id", "RESTRICT"),
        ("fk_requisitions_hiring_manager_id", "requisitions", "hiring_manager_id", "users", "id", "SET NULL"),
        ("fk_requisitions_function_head_id", "requisitions", "function_head_id", "users", "id", "SET NULL"),
        ("fk_requisitions_assigned_recruiter_id", "requisitions", "assigned_recruiter_id", "users", "id", "SET NULL"),
    ]
    for fk_name, table, column, ref_table, ref_column, ondelete in fk_specs:
        op.execute(
            f"ALTER TABLE {table} ADD CONSTRAINT {fk_name} "
            f"FOREIGN KEY ({column}) REFERENCES {ref_table} ({ref_column}) "
            f"ON DELETE {ondelete} NOT VALID"
        )
        op.execute(f"ALTER TABLE {table} VALIDATE CONSTRAINT {fk_name}")

    # --- 6. Missing indexes ---------------------------------------------------
    op.create_index("ix_interviews_candidate_id", "interviews", ["candidate_id"])
    op.create_index("ix_interviews_requisition_id", "interviews", ["requisition_id"])
    op.create_index("ix_interviews_scorecard_template_id", "interviews", ["scorecard_template_id"])
    op.create_index("ix_outreach_logs_candidate_id", "outreach_logs", ["candidate_id"])
    op.create_index("ix_candidates_email", "candidates", ["email"])
    op.create_index("ix_candidates_sourced_by_user_id", "candidates", ["sourced_by_user_id"])
    op.create_index("ix_requisitions_hiring_manager_id", "requisitions", ["hiring_manager_id"])
    op.create_index("ix_requisitions_assigned_recruiter_id", "requisitions", ["assigned_recruiter_id"])

    # --- 7. Categorical String -> Enum conversions (pre-flight check #4) -----
    op.alter_column(
        "candidates", "stage",
        type_=postgresql.ENUM(name="candidate_stage_enum", create_type=False),
        postgresql_using="stage::candidate_stage_enum",
    )
    op.alter_column(
        "candidates", "source",
        type_=postgresql.ENUM(name="candidate_source_enum", create_type=False),
        postgresql_using="source::candidate_source_enum",
    )
    op.alter_column(
        "requisitions", "priority",
        type_=postgresql.ENUM(name="priority_enum", create_type=False),
        postgresql_using="priority::priority_enum",
    )
    op.alter_column(
        "requisitions", "hire_type",
        type_=postgresql.ENUM(name="hire_type_enum", create_type=False),
        postgresql_using="hire_type::hire_type_enum",
    )
    op.alter_column(
        "requisitions", "req_status",
        type_=postgresql.ENUM(name="requisition_status_enum", create_type=False),
        postgresql_using="req_status::requisition_status_enum",
    )
    op.alter_column(
        "requisitions", "location",
        type_=postgresql.ENUM(name="location_enum", create_type=False),
        postgresql_using="location::location_enum",
    )
    op.alter_column(
        "requisitions", "function",
        type_=postgresql.ENUM(name="function_area_enum", create_type=False),
        postgresql_using="function::function_area_enum",
    )
    op.alter_column(
        "requisitions", "new_or_backfill",
        type_=postgresql.ENUM(name="new_or_backfill_enum", create_type=False),
        postgresql_using="new_or_backfill::new_or_backfill_enum",
    )
    op.alter_column(
        "interviews", "round",
        type_=postgresql.ENUM(name="interview_round_enum", create_type=False),
        postgresql_using="round::interview_round_enum",
    )
    op.alter_column(
        "interviews", "decision",
        type_=postgresql.ENUM(name="interview_decision_enum", create_type=False),
        postgresql_using="decision::interview_decision_enum",
    )
    op.alter_column(
        "outreach_logs", "channel",
        type_=postgresql.ENUM(name="outreach_channel_enum", create_type=False),
        postgresql_using="channel::outreach_channel_enum",
    )

    # --- 8. String -> Date conversions (pre-flight check #3) ------------------
    op.alter_column("candidates", "application_date", type_=sa.Date(), postgresql_using="application_date::date")
    op.alter_column("candidates", "sourced_date", type_=sa.Date(), postgresql_using="sourced_date::date")
    op.alter_column("requisitions", "req_approval_date", type_=sa.Date(), postgresql_using="req_approval_date::date")
    op.alter_column("interviews", "interview_date", type_=sa.Date(), postgresql_using="interview_date::date")
    op.alter_column("outreach_logs", "outreach_date", type_=sa.Date(), postgresql_using="outreach_date::date")
    op.alter_column("outreach_logs", "response_date", type_=sa.Date(), postgresql_using="response_date::date")
    op.alter_column("scorecard_templates", "created_date", type_=sa.Date(), postgresql_using="created_date::date")
    op.alter_column("talent_pools", "created_date", type_=sa.Date(), postgresql_using="created_date::date")

    # --- 9. talent_pools.tags: JSONB -> text[] --------------------------------
    # Postgres disallows a subquery in an ALTER COLUMN ... USING transform
    # expression, so ARRAY(SELECT jsonb_array_elements_text(tags)) can't be
    # used directly there - go via a temp column + UPDATE (which does allow it).
    op.add_column("talent_pools", sa.Column("tags_new", postgresql.ARRAY(sa.String(80)), nullable=True))
    op.execute(
        "UPDATE talent_pools SET tags_new = ARRAY(SELECT jsonb_array_elements_text(tags)) "
        "WHERE tags IS NOT NULL AND jsonb_typeof(tags) = 'array'"
    )
    op.drop_column("talent_pools", "tags")
    op.alter_column("talent_pools", "tags_new", new_column_name="tags")


def downgrade() -> None:
    op.alter_column(
        "talent_pools", "tags",
        type_=postgresql.JSONB(),
        postgresql_using="to_jsonb(tags)",
    )

    op.alter_column("candidates", "application_date", type_=sa.String(40), postgresql_using="application_date::text")
    op.alter_column("candidates", "sourced_date", type_=sa.String(40), postgresql_using="sourced_date::text")
    op.alter_column("requisitions", "req_approval_date", type_=sa.String(40), postgresql_using="req_approval_date::text")
    op.alter_column("interviews", "interview_date", type_=sa.String(40), postgresql_using="interview_date::text")
    op.alter_column("outreach_logs", "outreach_date", type_=sa.String(40), postgresql_using="outreach_date::text")
    op.alter_column("outreach_logs", "response_date", type_=sa.String(40), postgresql_using="response_date::text")
    op.alter_column("scorecard_templates", "created_date", type_=sa.String(40), postgresql_using="created_date::text")
    op.alter_column("talent_pools", "created_date", type_=sa.String(40), postgresql_using="created_date::text")

    op.alter_column("candidates", "stage", type_=sa.String(80), postgresql_using="stage::text")
    op.alter_column("candidates", "source", type_=sa.String(80), postgresql_using="source::text")
    op.alter_column("requisitions", "priority", type_=sa.String(40), postgresql_using="priority::text")
    op.alter_column("requisitions", "hire_type", type_=sa.String(50), postgresql_using="hire_type::text")
    op.alter_column("requisitions", "req_status", type_=sa.String(40), postgresql_using="req_status::text")
    op.alter_column("requisitions", "location", type_=sa.String(40), postgresql_using="location::text")
    op.alter_column("requisitions", "function", type_=sa.String(80), postgresql_using="function::text")
    op.alter_column("requisitions", "new_or_backfill", type_=sa.String(40), postgresql_using="new_or_backfill::text")
    op.alter_column("interviews", "round", type_=sa.String(80), postgresql_using="round::text")
    op.alter_column("interviews", "decision", type_=sa.String(80), postgresql_using="decision::text")
    op.alter_column("outreach_logs", "channel", type_=sa.String(80), postgresql_using="channel::text")

    op.drop_index("ix_requisitions_assigned_recruiter_id", table_name="requisitions")
    op.drop_index("ix_requisitions_hiring_manager_id", table_name="requisitions")
    op.drop_index("ix_candidates_sourced_by_user_id", table_name="candidates")
    op.drop_index("ix_candidates_email", table_name="candidates")
    op.drop_index("ix_outreach_logs_candidate_id", table_name="outreach_logs")
    op.drop_index("ix_interviews_scorecard_template_id", table_name="interviews")
    op.drop_index("ix_interviews_requisition_id", table_name="interviews")
    op.drop_index("ix_interviews_candidate_id", table_name="interviews")

    for fk_name, table in [
        ("fk_requisitions_assigned_recruiter_id", "requisitions"),
        ("fk_requisitions_function_head_id", "requisitions"),
        ("fk_requisitions_hiring_manager_id", "requisitions"),
        ("fk_outreach_logs_sourcer_user_id", "outreach_logs"),
        ("fk_outreach_logs_candidate_id", "outreach_logs"),
        ("fk_interviews_interviewer_user_id", "interviews"),
        ("fk_interviews_scorecard_template_id", "interviews"),
        ("fk_interviews_requisition_id", "interviews"),
        ("fk_interviews_candidate_id", "interviews"),
        ("fk_candidates_sourced_by_user_id", "candidates"),
        ("fk_candidates_requisition_id", "candidates"),
    ]:
        op.execute(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {fk_name}")

    op.alter_column("outreach_logs", "sourcer_user_id", type_=sa.String(64), postgresql_using="sourcer_user_id::text")
    op.alter_column("candidates", "sourced_by_user_id", type_=sa.String(64), postgresql_using="sourced_by_user_id::text")

    op.drop_column("interviews", "interviewer_user_id")
    op.drop_column("requisitions", "backfill_previous_salary")
    op.drop_column("requisitions", "backfill_employee_name")
    op.drop_column("requisitions", "cost_currency")
    op.drop_column("requisitions", "cost_amount")
    op.drop_column("requisitions", "assigned_recruiter_id")
    op.drop_column("requisitions", "function_head_id")
    op.drop_column("requisitions", "hiring_manager_id")

    op.drop_index("ix_offers_candidate_id", table_name="offers")
    op.drop_table("offers")
    op.drop_index("ix_candidate_comments_candidate_id", table_name="candidate_comments")
    op.drop_table("candidate_comments")
    op.drop_index("ix_candidate_stage_history_candidate_id", table_name="candidate_stage_history")
    op.drop_table("candidate_stage_history")
    op.drop_index("ix_candidate_talent_pools_talent_pool_id", table_name="candidate_talent_pools")
    op.drop_table("candidate_talent_pools")

    for enum_name in [
        "offer_status_enum", "currency_enum", "outreach_channel_enum", "interview_decision_enum",
        "interview_round_enum", "new_or_backfill_enum", "function_area_enum", "location_enum",
        "hire_type_enum", "priority_enum", "requisition_status_enum", "candidate_source_enum",
        "candidate_stage_enum",
    ]:
        _drop_enum(enum_name)
