import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config

# Ensures every model class is registered on Base.metadata before target_metadata
# is read below - importing app.models alone (without also referencing Base) would
# let a linter strip the "unused" import and silently produce an incomplete metadata.
import app.models  # noqa: F401
from app.core.config import settings
from app.db.base import Base

# this is the Alembic Config object, which provides access to values within the
# .ini file in use.
config = context.config

# NOTE: migrations must run against Supabase's direct connection (port 5432),
# not the pgBouncer transaction pooler (port 6543) - see CLAUDE.md DATABASE_URL
# guidance. DDL + Alembic's advisory locking do not behave correctly through the
# transaction-mode pooler.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
