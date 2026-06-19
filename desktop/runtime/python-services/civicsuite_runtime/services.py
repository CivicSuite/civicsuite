"""Local service host for CivicSuite Windows desktop module checks."""

from __future__ import annotations

import importlib
import json
import os
import secrets
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text

from civicsuite_runtime import __version__

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 15480
MODULE_IMPORTS = [
    ("civiccore", "civiccore"),
    ("civicrecords-ai", "app.main"),
    ("civicclerk", "civicclerk.main"),
    ("civiccode", "civiccode.main"),
]


def _profile_root() -> Path:
    data_dir = os.environ.get("CIVICSUITE_DATA_DIR")
    if data_dir:
        return Path(data_dir).parent
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        return Path(local_app_data) / "CivicSuite"
    return Path.home() / "AppData" / "Local" / "CivicSuite"


def _ensure_secret_file(file_name: str, value_factory: Any) -> Path:
    secret_dir = _profile_root() / "config" / "secrets"
    secret_dir.mkdir(parents=True, exist_ok=True)
    path = secret_dir / file_name
    if not path.exists():
        path.write_text(value_factory(), encoding="utf-8")
    return path


def _fernet_key() -> str:
    import base64

    return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("ascii")


def _set_local_secrets() -> None:
    jwt_path = _ensure_secret_file("jwt_secret.txt", lambda: secrets.token_urlsafe(48))
    admin_path = _ensure_secret_file(
        "first_admin_password.txt",
        lambda: f"CivicSuite-{secrets.token_urlsafe(24)}!1",
    )
    encryption_path = _ensure_secret_file("encryption_key.txt", _fernet_key)
    os.environ.setdefault("JWT_SECRET_FILE", str(jwt_path))
    os.environ.setdefault("FIRST_ADMIN_PASSWORD_FILE", str(admin_path))
    os.environ.setdefault("ENCRYPTION_KEY", encryption_path.read_text(encoding="utf-8").strip())


def _set_local_defaults() -> None:
    os.environ.setdefault("PORTAL_MODE", "private")
    os.environ.setdefault("OLLAMA_BASE_URL", "http://127.0.0.1:15434")
    os.environ.setdefault("CIVICCLERK_OLLAMA_BASE_URL", "http://127.0.0.1:15434")
    os.environ.setdefault("CIVICCORE_LLM_PROVIDER", "ollama")
    os.environ.setdefault(
        "DATABASE_URL",
        "postgresql+asyncpg://civicsuite:civicsuite@127.0.0.1:15432/civicsuite",
    )
    if not os.environ.get("TESTING"):
        _set_local_secrets()


def _module_status(module_id: str, import_name: str) -> dict[str, Any]:
    try:
        module = importlib.import_module(import_name)
    except Exception as exc:  # pragma: no cover - surfaced through /health
        return {
            "id": module_id,
            "ok": False,
            "import": import_name,
            "error": f"{type(exc).__name__}: {exc}",
        }
    version = getattr(module, "__version__", None)
    package_name = import_name.split(".", 1)[0]
    package = importlib.import_module(package_name)
    return {
        "id": module_id,
        "ok": True,
        "import": import_name,
        "version": version or getattr(package, "__version__", "unknown"),
    }


def _sync_database_url(url: str) -> str:
    return (
        url.replace("postgresql+asyncpg", "postgresql+psycopg2")
        .replace("postgres+asyncpg", "postgresql+psycopg2")
        .replace("postgresql://", "postgresql+psycopg2://", 1)
        .replace("postgres://", "postgresql+psycopg2://", 1)
    )


def _database_status() -> dict[str, Any]:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        return {
            "ok": False,
            "status": "missing",
            "message": "DATABASE_URL is not configured for the local runtime.",
        }
    engine = create_engine(_sync_database_url(database_url), pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            task_table = connection.execute(
                text("SELECT to_regclass('public.civiccore_local_tasks')")
            ).scalar()
    except Exception as exc:  # pragma: no cover - surfaced through /health
        return {
            "ok": False,
            "status": "unavailable",
            "message": f"{type(exc).__name__}: {exc}",
        }
    finally:
        engine.dispose()
    return {
        "ok": task_table == "civiccore_local_tasks",
        "status": "ready" if task_table == "civiccore_local_tasks" else "migrations-needed",
        "message": (
            "Local database and task queue schema are ready."
            if task_table == "civiccore_local_tasks"
            else "Local database is reachable but task queue migrations are not applied."
        ),
    }


def health_payload() -> dict[str, Any]:
    _set_local_defaults()
    modules = [_module_status(module_id, import_name) for module_id, import_name in MODULE_IMPORTS]
    database = _database_status()
    return {
        "status": "ok" if all(item["ok"] for item in modules) and database["ok"] else "degraded",
        "service": "civicsuite-runtime",
        "version": __version__,
        "modules": modules,
        "database": database,
        "local_only": True,
    }


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - stdlib handler API
        if self.path not in {"/health", "/modules"}:
            self.send_error(404, "Not Found")
            return
        payload = health_payload()
        body = json.dumps(payload, sort_keys=True).encode("utf-8")
        self.send_response(200 if payload["status"] == "ok" else 503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - stdlib signature
        return


def main() -> int:
    host = os.environ.get("CIVICSUITE_RUNTIME_HOST", DEFAULT_HOST)
    port = int(os.environ.get("CIVICSUITE_RUNTIME_PORT", str(DEFAULT_PORT)))
    server = ThreadingHTTPServer((host, port), HealthHandler)
    print(f"CivicSuite runtime services listening on http://{host}:{port}", flush=True)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
