"""Database migration runner for the CivicSuite Windows local runtime."""

from __future__ import annotations

import importlib
import os
from pathlib import Path

from alembic import command
from alembic.config import Config

from civicsuite_runtime.services import _set_local_defaults


def _sync_database_url(url: str) -> str:
    sync_url = (
        url.replace("postgresql+asyncpg", "postgresql+psycopg2")
        .replace("postgres+asyncpg", "postgresql+psycopg2")
        .replace("postgresql://", "postgresql+psycopg2://", 1)
        .replace("postgres://", "postgresql+psycopg2://", 1)
    )
    return sync_url


def _package_root(package_name: str) -> Path:
    package = importlib.import_module(package_name)
    package_file = getattr(package, "__file__", None)
    if not package_file:
        raise RuntimeError(f"Could not resolve package path for {package_name}")
    return Path(package_file).resolve().parent


def _run_alembic(label: str, config_path: Path, script_location: Path, database_url: str) -> None:
    if not config_path.is_file():
        raise RuntimeError(f"{label} migration config is missing: {config_path}")
    if not script_location.is_dir():
        raise RuntimeError(f"{label} migration scripts are missing: {script_location}")
    cfg = Config(str(config_path))
    cfg.set_main_option("script_location", str(script_location))
    cfg.set_main_option("sqlalchemy.url", database_url)
    previous_database_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = database_url
    try:
        command.upgrade(cfg, "head")
    finally:
        if previous_database_url is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = previous_database_url


def upgrade_all() -> None:
    _set_local_defaults()
    database_url = os.environ["DATABASE_URL"]
    runtime_root = Path(__file__).resolve().parent
    core_root = _package_root("civiccore") / "migrations"
    records_root = runtime_root / "civicrecords_alembic"
    clerk_root = _package_root("civicclerk") / "migrations"
    code_root = _package_root("civiccode") / "migrations"

    sync_url = _sync_database_url(database_url)
    _run_alembic("CivicCore", core_root / "alembic.ini", core_root, sync_url)
    _run_alembic(
        "CivicRecords AI",
        records_root / "alembic.ini",
        records_root / "alembic",
        database_url,
    )
    _run_alembic("CivicClerk", clerk_root / "alembic.ini", clerk_root, sync_url)
    _run_alembic("CivicCode", code_root / "alembic.ini", code_root, sync_url)


def main() -> int:
    upgrade_all()
    print("CivicSuite city-core database migrations verified", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
