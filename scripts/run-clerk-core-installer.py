"""Run the CivicSuite clerk-core installer lifecycle from a release bundle."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
REPORT_ROOT = ROOT / "installer" / "reports"
DEFAULT_INSTALL_ROOT = Path(os.environ.get("CIVICSUITE_INSTALLER_INSTALL_ROOT", ROOT / "installer" / "runtime" / "clerk-core"))

DEFAULT_RECORDS_PORTS = {"api": 18000, "web": 18080}
DEFAULT_CLERK_PORTS = {"api": 18776, "web": 18081}
DEFAULT_CODE_PORTS = {"api": 18820}
MODULE_RECORDS = "civicrecords-ai"
MODULE_CLERK = "civicclerk"
MODULE_CODE = "civiccode"
SELECTABLE_MODULES = (MODULE_RECORDS, MODULE_CLERK, MODULE_CODE)
DEFAULT_SELECTED_MODULES = (MODULE_RECORDS, MODULE_CLERK)
EXPECTED_CIVICCORE_VERSION = "1.2.0"
EXPECTED_RECORDS_VERSION = "1.7.2"
EXPECTED_CLERK_VERSION = "1.0.3"
EXPECTED_CODE_VERSION = "1.0.8"
SELECTED_MODULES_FILE = "selected-modules.json"
BACKUPS_DIR = "backups"
CLERK_STAFF_MODE_PROTECTED = "protected"
CLERK_STAFF_MODE_OPEN = "open"
CLERK_STAFF_MODE_BEARER = "bearer"
CLERK_WORKFLOW_PROOF_BEARER = "clerk-core-workflow-proof"
WINDOWS_DOCKER_DESKTOP_BIN = Path("C:/Program Files/Docker/Docker/resources/bin")
CLERK_OPEN_MODE_WARNING = (
    "WARNING: --staff-mode open allows anonymous writes to civicclerk endpoints.\n"
    "WARNING: Use ONLY for local rehearsal. Never on a network-reachable host.\n"
    "WARNING: Re-run with --staff-mode protected for any deployment evaluation."
)


class InstallerError(RuntimeError):
    pass


def make_run_id() -> str:
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    return f"clerk-core-install-{stamp}-{uuid4().hex[:8]}"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9_-]+", "-", value.lower()).strip("-_")
    if not slug or not slug[0].isalnum():
        slug = f"run-{slug}"
    return slug[:48]


def derived_port_offset(run_id: str) -> int:
    digest = hashlib.sha256(run_id.encode("utf-8")).hexdigest()
    return int(digest[:4], 16) % 900


def resolve_isolation(
    *,
    run_id: str,
    records_api_port: int | None = None,
    records_web_port: int | None = None,
    clerk_api_port: int | None = None,
    clerk_web_port: int | None = None,
    port_offset: int | None = None,
    compose_project_suffix: str | None = None,
) -> dict[str, object]:
    env_offset = os.environ.get("CIVICSUITE_INSTALLER_PORT_OFFSET")
    resolved_offset = (
        port_offset
        if port_offset is not None
        else int(env_offset)
        if env_offset not in (None, "")
        else derived_port_offset(run_id)
    )
    if resolved_offset < 0 or resolved_offset > 5000:
        raise InstallerError("--port-offset must be between 0 and 5000.")
    suffix = slugify(compose_project_suffix or os.environ.get("CIVICSUITE_INSTALLER_PROJECT_SUFFIX") or run_id)
    records_ports = {
        "api": records_api_port or DEFAULT_RECORDS_PORTS["api"] + resolved_offset,
        "web": records_web_port or DEFAULT_RECORDS_PORTS["web"] + resolved_offset,
    }
    clerk_ports = {
        "api": clerk_api_port or DEFAULT_CLERK_PORTS["api"] + resolved_offset,
        "web": clerk_web_port or DEFAULT_CLERK_PORTS["web"] + resolved_offset,
    }
    code_ports = {
        "api": DEFAULT_CODE_PORTS["api"] + resolved_offset,
    }
    return {
        "isolation_id": suffix,
        "port_offset": resolved_offset,
        "ports": {
            "civicrecords-ai": records_ports,
            "civicclerk": clerk_ports,
            "civiccode": code_ports,
        },
        "compose_projects": {
            "civicrecords-ai": f"civicsuite-{suffix}-records",
            "civicclerk": f"civicsuite-{suffix}-clerk",
            "civiccode": f"civicsuite-{suffix}-code",
        },
    }


def is_within(child: Path, parent: Path) -> bool:
    try:
        child.resolve().relative_to(parent.resolve())
    except ValueError:
        return False
    return True


def run(command: list[str], *, cwd: Path, timeout: int = 900) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=cwd,
        env=installer_subprocess_env(),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        timeout=timeout,
    )


def run_binary_to_file(
    command: list[str],
    *,
    cwd: Path,
    output_path: Path,
    timeout: int = 900,
) -> subprocess.CompletedProcess[bytes]:
    with output_path.open("wb") as output:
        return subprocess.run(
            command,
            cwd=cwd,
            env=installer_subprocess_env(),
            stdout=output,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout,
        )


def run_binary_from_file(
    command: list[str],
    *,
    cwd: Path,
    input_path: Path,
    timeout: int = 900,
) -> subprocess.CompletedProcess[bytes]:
    with input_path.open("rb") as input_file:
        return subprocess.run(
            command,
            cwd=cwd,
            env=installer_subprocess_env(),
            stdin=input_file,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout,
        )


def binary_step(
    *,
    module: str,
    step: str,
    proc: subprocess.CompletedProcess[bytes],
    path: Path | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "module": module,
        "step": step,
        "returncode": proc.returncode,
        "stdout": proc.stdout[-4000:].decode("utf-8", errors="replace") if proc.stdout else "",
        "stderr": proc.stderr[-4000:].decode("utf-8", errors="replace") if proc.stderr else "",
    }
    if path is not None:
        payload["path"] = str(path)
    return payload


def known_command_path(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found
    if sys.platform.startswith("win") and name == "docker":
        docker_exe = WINDOWS_DOCKER_DESKTOP_BIN / "docker.exe"
        if docker_exe.is_file():
            return str(docker_exe)
    return None


def installer_subprocess_env() -> dict[str, str]:
    env = os.environ.copy()
    if sys.platform.startswith("win") and WINDOWS_DOCKER_DESKTOP_BIN.is_dir():
        docker_bin = str(WINDOWS_DOCKER_DESKTOP_BIN)
        current_path = env.get("PATH", "")
        path_parts = [part for part in current_path.split(os.pathsep) if part]
        if docker_bin.lower() not in {part.lower() for part in path_parts}:
            env["PATH"] = docker_bin + os.pathsep + current_path
    return env


def docker_command() -> str:
    return known_command_path("docker") or "docker"


def require_command(name: str) -> str:
    found = known_command_path(name)
    if not found:
        raise InstallerError(
            f"{name} was not found. Install Docker Desktop on Windows/macOS or Docker Engine on Linux, "
            "start it, and rerun the installer readiness check."
        )
    return found


def source_root(module_name: str) -> Path:
    bundled = ROOT / "modules" / module_name
    if bundled.is_dir():
        return bundled
    sibling = ROOT.parent / module_name
    if sibling.is_dir():
        return sibling
    raise InstallerError(
        f"Missing source for {module_name}. Expected bundled source at {bundled} or local checkout at {sibling}."
    )


def normalize_selected_modules(selected_modules: list[str] | tuple[str, ...] | None) -> list[str]:
    requested = list(selected_modules or DEFAULT_SELECTED_MODULES)
    if not requested:
        raise InstallerError(
            "Select at least one module: civicrecords-ai, civicclerk, or civiccode."
        )
    normalized: list[str] = []
    for module in requested:
        if module not in SELECTABLE_MODULES:
            raise InstallerError(
                f"Unsupported module {module!r}. Select one or more of: {', '.join(SELECTABLE_MODULES)}."
            )
        if module not in normalized:
            normalized.append(module)
    return normalized


def selected_modules_path(install_root: Path) -> Path:
    return install_root / SELECTED_MODULES_FILE


def backups_root(install_root: Path) -> Path:
    return install_root / BACKUPS_DIR


def latest_backup_dir(install_root: Path) -> Path:
    root = backups_root(install_root)
    if not root.is_dir():
        raise InstallerError(f"No backups found at {root}. Run backup before restore.")
    candidates = sorted(path for path in root.iterdir() if path.is_dir())
    if not candidates:
        raise InstallerError(f"No backups found at {root}. Run backup before restore.")
    return candidates[-1]


def persist_selected_modules(install_root: Path, modules: list[str]) -> None:
    install_root.mkdir(parents=True, exist_ok=True)
    selected_modules_path(install_root).write_text(
        json.dumps({"modules": modules}, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def load_selected_modules(install_root: Path, selected_modules: list[str] | tuple[str, ...] | None) -> list[str]:
    if selected_modules:
        return normalize_selected_modules(selected_modules)
    path = selected_modules_path(install_root)
    if not path.is_file():
        return list(DEFAULT_SELECTED_MODULES)
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise InstallerError(f"Invalid selected module record: {path}") from exc
    modules = payload.get("modules") if isinstance(payload, dict) else None
    if not isinstance(modules, list) or not all(isinstance(item, str) for item in modules):
        raise InstallerError(f"Invalid selected module record: {path}")
    return normalize_selected_modules(modules)


def copy_source(source: Path, target: Path) -> None:
    if target.exists():
        return
    ignore = shutil.ignore_patterns(
        ".git",
        ".env",
        ".claude",
        ".agents",
        ".agent-workflows",
        ".ruff_cache",
        ".pytest_cache",
        ".tmp-*",
        "__pycache__",
        "docs",
        "node_modules",
        "frontend/node_modules",
        "frontend/playwright-report",
        "frontend/test-results",
        "docs/playwright-report",
        "docs/superpowers",
        "superpowers",
        "run-civicclerk-cleanroom.sh",
        "dist",
        "build",
        ".venv",
        ".venv*",
        "backend/.venv",
        "backend/.venv*",
    )
    shutil.copytree(source, target, ignore=ignore)
    ledger = source / "docs" / "ops" / "tier1-retrofit-ledger.json"
    if ledger.is_file():
        ledger_target = target / "docs" / "ops" / "tier1-retrofit-ledger.json"
        ledger_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ledger, ledger_target)


def ensure_records_secret_files(source: Path, *, password_prefix: str = "ClerkCore") -> None:
    secret_dir = source / "data" / "secrets"
    secret_dir.mkdir(parents=True, exist_ok=True)
    secrets_to_write = {
        "jwt_secret": secrets.token_hex(32),
        "first_admin_password": f"{password_prefix}-{secrets.token_hex(16)}",
    }
    for name, value in secrets_to_write.items():
        path = secret_dir / name
        if not path.is_file():
            path.write_text(value + "\n", encoding="utf-8")
        try:
            path.chmod(0o400)
        except OSError:
            pass


def write_records_env(target: Path, ports: dict[str, int] | None = None) -> None:
    ensure_records_secret_files(target.parent)
    values = {
        "DATABASE_URL": "postgresql+asyncpg://civicrecords:civicrecords@postgres:5432/civicrecords",
        "FIRST_ADMIN_EMAIL": "admin@example.gov",
        "OLLAMA_BASE_URL": "http://ollama:11434",
        "REDIS_URL": "redis://redis:6379/0",
        "AUDIT_RETENTION_DAYS": "1095",
        "CONNECTOR_HOST_ALLOWLIST": "",
        "PORTAL_MODE": "private",
        "ENCRYPTION_KEY": base64.urlsafe_b64encode(os.urandom(32)).decode(),
        "CIVICRECORDS_SECRET_DIR": "./data/secrets",
    }
    if target.is_file():
        for raw_line in target.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    if ports is not None:
        values["CIVICRECORDS_API_PORT"] = str(ports["api"])
        values["CIVICRECORDS_WEB_PORT"] = str(ports["web"])
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def write_records_override(target: Path, ports: dict[str, int]) -> Path:
    path = target / "docker-compose.civicsuite.override.yml"
    path.write_text(
        f"""services:
  api:
    ports:
      - "{ports['api']}:8000"
  frontend:
    ports:
      - "{ports['web']}:80"
""",
        encoding="utf-8",
        newline="\n",
    )
    return path


def normalize_records_compose_ports(target: Path, ports: dict[str, int] | None = None) -> None:
    resolved_ports = ports or DEFAULT_RECORDS_PORTS
    compose_file = target / "docker-compose.yml"
    if not compose_file.is_file():
        return
    text = compose_file.read_text(encoding="utf-8")
    replacements = {
        '"8000:8000"': f'"{resolved_ports["api"]}:8000"',
        "'8000:8000'": f"'{resolved_ports['api']}:8000'",
        '"8080:80"': f'"{resolved_ports["web"]}:80"',
        "'8080:80'": f"'{resolved_ports['web']}:80'",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    compose_file.write_text(text, encoding="utf-8", newline="\n")


def normalize_records_frontend_dockerfile(target: Path) -> None:
    dockerfile = target / "Dockerfile.frontend"
    if not dockerfile.is_file():
        return
    text = dockerfile.read_text(encoding="utf-8")
    heredoc = """# SPA fallback + API proxy
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINX'
server {
    listen 80;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX
"""
    if heredoc not in text:
        return
    config = """server {
    listen 80;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
"""
    (target / "nginx-civicsuite.conf").write_text(config, encoding="utf-8", newline="\n")
    dockerfile.write_text(
        text.replace(heredoc, "# SPA fallback + API proxy\nCOPY nginx-civicsuite.conf /etc/nginx/conf.d/default.conf\n"),
        encoding="utf-8",
        newline="\n",
    )


def write_clerk_env(
    target: Path,
    *,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
    ports: dict[str, int] | None = None,
    civiccode_intake_url: str | None = None,
    civiccode_intake_secret: str | None = None,
) -> None:
    resolved_ports = ports or DEFAULT_CLERK_PORTS
    if target.is_file():
        return
    values = {
        "CIVICCLERK_POSTGRES_USER": "civicclerk",
        "CIVICCLERK_POSTGRES_PASSWORD": secrets.token_hex(24),
        "CIVICCLERK_POSTGRES_DB": "civicclerk",
        "CIVICCLERK_API_PORT": str(resolved_ports["api"]),
        "CIVICCLERK_WEB_PORT": str(resolved_ports["web"]),
        "CIVICCLERK_STAFF_AUTH_MODE": staff_mode,
        "CIVICCLERK_DEMO_SEED": "1",
        "CIVICCLERK_CONNECTOR_SYNC_ENABLED": "false",
        "CIVICCLERK_CONNECTOR_SYNC_PAYLOAD_DIR_HOST": "./connector-imports",
        "CIVICCLERK_CONNECTOR_SYNC_LEDGER_PATH": "/data/exports/connector-import-ledger.json",
        "CIVICCLERK_CONNECTOR_SYNC_CONNECTORS": "",
        "CIVICCLERK_CONNECTOR_SYNC_INTERVAL_SECONDS": "900",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_ENABLED": "false",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_SCHEDULE_ENABLED": "false",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_SOURCE_IDS": "",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_AUTH_SECRET_ENV": "CIVICCLERK_VENDOR_NETWORK_SYNC_SHARED_SECRET",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_AUTH_SECRET_ENV_PREFIX": "CIVICCLERK_VENDOR_SECRET_",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_SHARED_SECRET": "",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_REPORT_DIR": "/data/exports/vendor-network-sync",
        "CIVICCLERK_VENDOR_NETWORK_SYNC_INTERVAL_SECONDS": "900",
        "CIVICCODE_INTAKE_URL": civiccode_intake_url or "",
        "CIVICCODE_INTAKE_SECRET": civiccode_intake_secret or "",
        "CIVICCODE_INTAKE_ACTOR": "civicclerk-handoff@citycore.example.gov",
    }
    if staff_mode == CLERK_STAFF_MODE_BEARER:
        values["CIVICCLERK_STAFF_AUTH_TOKEN_ROLES"] = json.dumps(
            {CLERK_WORKFLOW_PROOF_BEARER: ["clerk_admin", "meeting_editor"]},
            separators=(",", ":"),
        )
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def write_code_env(target: Path, ports: dict[str, int], *, civiccode_intake_secret: str | None = None) -> None:
    if target.is_file():
        return
    password = secrets.token_hex(24)
    db_url = f"postgresql+psycopg2://civiccode:{password}@postgres:5432/civiccode"
    values = {
        "POSTGRES_DB": "civiccode",
        "POSTGRES_USER": "civiccode",
        "POSTGRES_PASSWORD": password,
        "CIVICCODE_PORT": str(ports["api"]),
        "DATABASE_URL": db_url,
        "CIVICCODE_SOURCE_REGISTRY_DB_URL": db_url,
        "CIVICCODE_DEMO_SEED": "1",
        "CIVICCODE_DEMO_ACTOR": "demo-seed@citycore.example.gov",
        "CIVICCODE_STAFF_TRUSTED_PROXY_CIDRS": "127.0.0.1/32,::1/128",
        "CIVICCODE_INTAKE_SECRET": civiccode_intake_secret or "",
    }
    target.write_text(
        "\n".join(f"{key}={value}" for key, value in values.items()) + "\n",
        encoding="utf-8",
    )


def compose(project: str, source: Path, *args: str) -> list[str]:
    command = [docker_command(), "compose", "-p", project, "-f", "docker-compose.yml"]
    override = source / "docker-compose.civicsuite.override.yml"
    if override.is_file():
        command.extend(["-f", override.name])
    command.extend(args)
    return command


def remove_tree_allowing_readonly(path: Path) -> None:
    def _on_error(function, target, exc_info):  # type: ignore[no-untyped-def]
        try:
            Path(target).chmod(0o700)
        except OSError:
            pass
        function(target)

    shutil.rmtree(path, onerror=_on_error)


def wait_for_url(url: str, *, timeout_seconds: int = 360) -> dict[str, object]:
    deadline = time.time() + timeout_seconds
    attempts: list[dict[str, object]] = []
    while time.time() < deadline:
        proc = run(["curl", "-fsS", url], cwd=ROOT, timeout=20)
        attempts.append({"returncode": proc.returncode, "stdout": proc.stdout[:400], "stderr": proc.stderr[:400]})
        if proc.returncode == 0:
            return {"status": "passed", "attempts": attempts[-5:]}
        time.sleep(5)
    return {"status": "failed", "attempts": attempts[-10:]}


def decode_json(body: str) -> dict[str, object]:
    return json.loads(body) if body else {}


def get_json(
    url: str,
    *,
    headers: dict[str, str] | None = None,
    timeout_seconds: int = 10,
) -> tuple[int, dict[str, object]]:
    request = urllib.request.Request(url, headers=headers or {}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, decode_json(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, decode_json(exc.read().decode("utf-8"))


def post_json(
    url: str,
    payload: dict[str, object],
    *,
    headers: dict[str, str] | None = None,
    timeout_seconds: int = 10,
) -> tuple[int, dict[str, object]]:
    resolved_headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        resolved_headers.update(headers)
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=resolved_headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, decode_json(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, decode_json(exc.read().decode("utf-8"))


def patch_json(
    url: str,
    payload: dict[str, object],
    *,
    headers: dict[str, str] | None = None,
    timeout_seconds: int = 10,
) -> tuple[int, dict[str, object]]:
    resolved_headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        resolved_headers.update(headers)
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=resolved_headers,
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, decode_json(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, decode_json(exc.read().decode("utf-8"))


def post_form(
    url: str,
    payload: dict[str, str],
    *,
    timeout_seconds: int = 10,
) -> tuple[int, dict[str, object]]:
    request = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(payload).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, decode_json(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, decode_json(exc.read().decode("utf-8"))


def verify_clerk_protected_default(ports: dict[str, int]) -> dict[str, object]:
    base = f"http://127.0.0.1:{ports['api']}"
    checks: list[dict[str, object]] = []
    try:
        status, readiness = get_json(f"{base}/staff/auth-readiness")
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "civicclerk_protected_default", "status": "failed", "error": str(exc), "checks": checks}
    checks.append({"name": "auth_readiness", "status_code": status, "payload": readiness})
    if status != 200 or readiness.get("mode") != CLERK_STAFF_MODE_PROTECTED:
        return {"name": "civicclerk_protected_default", "status": "failed", "checks": checks}

    write_probes = [
        ("meeting_bodies", "/meeting-bodies", {"name": "City Council", "body_type": "city_council"}),
        ("meetings", "/meetings", {"title": "Council Meeting", "meeting_type": "regular"}),
        ("motions", "/meetings/not-a-meeting/motions", {"text": "Move to approve.", "actor": "clerk@example.gov"}),
        ("votes", "/motions/not-a-motion/votes", {"voter_name": "Council Member Rivera", "vote": "aye", "actor": "clerk@example.gov"}),
    ]
    for name, path, payload in write_probes:
        status_code, body = post_json(f"{base}{path}", payload)
        checks.append({"name": name, "path": path, "status_code": status_code, "payload": body})
        if status_code != 401:
            return {"name": "civicclerk_protected_default", "status": "failed", "checks": checks}
    return {"name": "civicclerk_protected_default", "status": "passed", "checks": checks}


def verify_civiccore_contract(
    records_ports: dict[str, int],
    clerk_ports: dict[str, int],
    code_ports: dict[str, int] | None = None,
    *,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> dict[str, object]:
    modules = normalize_selected_modules(selected_modules)
    checks: list[dict[str, object]] = []
    try:
        records_status, records_health = (
            get_json(f"http://127.0.0.1:{records_ports['api']}/health")
            if MODULE_RECORDS in modules
            else (None, {})
        )
        clerk_status, clerk_health = (
            get_json(f"http://127.0.0.1:{clerk_ports['api']}/health")
            if MODULE_CLERK in modules
            else (None, {})
        )
        code_status, code_health = (
            get_json(f"http://127.0.0.1:{code_ports['api']}/health")
            if MODULE_CODE in modules and code_ports is not None
            else (None, {})
        )
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "starter_set_civiccore_contract", "status": "failed", "error": str(exc), "checks": checks}

    records_ok = True
    clerk_ok = True
    code_ok = True
    if MODULE_RECORDS in modules:
        checks.append({"name": "civicrecords_health", "status_code": records_status, "payload": records_health})
        records_ok = records_status == 200 and records_health.get("version") == EXPECTED_RECORDS_VERSION
    if MODULE_CLERK in modules:
        checks.append({"name": "civicclerk_health", "status_code": clerk_status, "payload": clerk_health})
        clerk_ok = (
            clerk_status == 200
            and clerk_health.get("service") == "civicclerk"
            and clerk_health.get("version") == EXPECTED_CLERK_VERSION
            and clerk_health.get("civiccore") == EXPECTED_CIVICCORE_VERSION
        )
    if MODULE_CODE in modules:
        checks.append({"name": "civiccode_health", "status_code": code_status, "payload": code_health})
        code_ok = (
            code_status == 200
            and code_health.get("service") == "civiccode"
            and code_health.get("version") == EXPECTED_CODE_VERSION
            and code_health.get("civiccore") == EXPECTED_CIVICCORE_VERSION
        )
    expected: dict[str, object] = {}
    if MODULE_RECORDS in modules:
        expected[MODULE_RECORDS] = {"version": EXPECTED_RECORDS_VERSION}
    if MODULE_CLERK in modules:
        expected[MODULE_CLERK] = {"version": EXPECTED_CLERK_VERSION, "civiccore": EXPECTED_CIVICCORE_VERSION}
    if MODULE_CODE in modules:
        expected[MODULE_CODE] = {"version": EXPECTED_CODE_VERSION, "civiccore": EXPECTED_CIVICCORE_VERSION}
    expected["civiccore"] = {
        "role": "base dependency installed before selected modules through the installer plan"
    }
    status = "passed" if records_ok and clerk_ok and code_ok else "failed"
    return {
        "name": "starter_set_civiccore_contract",
        "status": status,
        "selected_modules": modules,
        "expected": expected,
        "checks": checks,
    }


def verify_records_workflow(records_source: Path, ports: dict[str, int]) -> dict[str, object]:
    base = f"http://127.0.0.1:{ports['api']}"
    checks: list[dict[str, object]] = []
    password_path = records_source / "data" / "secrets" / "first_admin_password"
    try:
        password = password_path.read_text(encoding="utf-8").strip()
    except OSError as exc:
        return {"name": "civicrecords_workflow", "status": "failed", "error": str(exc), "checks": checks}

    login_status, login_body = post_form(
        f"{base}/auth/jwt/login",
        {"username": "admin@example.gov", "password": password},
    )
    checks.append(
        {
            "name": "admin_login",
            "status_code": login_status,
            "has_access_token": bool(login_body.get("access_token")),
        }
    )
    token = str(login_body.get("access_token") or "")
    if login_status != 200 or not token:
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    headers = {"Authorization": f"Bearer {token}"}
    marker = f"starter-set workflow proof {uuid4().hex[:8]}"
    create_status, created = post_json(
        f"{base}/requests/",
        {
            "requester_name": "Starter Set Workflow Proof",
            "requester_email": None,
            "requester_type": "outside-test",
            "description": f"{marker}: request for the adopted agenda packet and minutes.",
            "priority": "normal",
            "scope_assessment": "narrow",
        },
        headers=headers,
    )
    request_id = created.get("id")
    checks.append(
        {
            "name": "create_records_request",
            "status_code": create_status,
            "request_id_present": bool(request_id),
            "status": created.get("status"),
        }
    )
    if create_status != 201 or not request_id:
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    get_status, fetched = get_json(f"{base}/requests/{request_id}", headers=headers)
    checks.append(
        {
            "name": "fetch_records_request",
            "status_code": get_status,
            "id_matches": fetched.get("id") == request_id,
        }
    )
    if get_status != 200 or fetched.get("id") != request_id:
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    search_status, search_body = get_json(f"{base}/search/filters", headers=headers)
    checks.append(
        {
            "name": "search_records",
            "status_code": search_status,
            "file_types_present": isinstance(search_body.get("file_types"), list),
            "source_names_present": isinstance(search_body.get("source_names"), list),
            "departments_present": isinstance(search_body.get("departments"), list),
        }
    )
    if search_status != 200 or not isinstance(search_body.get("file_types"), list):
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    searching_status, searching_body = patch_json(
        f"{base}/requests/{request_id}",
        {"status": "searching"},
        headers=headers,
    )
    checks.append(
        {
            "name": "mark_request_searching",
            "status_code": searching_status,
            "status": searching_body.get("status"),
        }
    )
    if searching_status != 200 or searching_body.get("status") != "searching":
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    review_status, review_body = post_json(f"{base}/requests/{request_id}/submit-review", {}, headers=headers)
    checks.append(
        {
            "name": "submit_request_review",
            "status_code": review_status,
            "status": review_body.get("status"),
        }
    )
    if review_status != 200 or review_body.get("status") != "in_review":
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    letter_status, letter = post_json(f"{base}/requests/{request_id}/response-letter", {}, headers=headers)
    checks.append(
        {
            "name": "draft_response_letter",
            "status_code": letter_status,
            "letter_id_present": bool(letter.get("id")),
            "status": letter.get("status"),
            "human_review_required": letter.get("status") == "draft",
            "contains_ai_disclaimer": "requires human review" in str(letter.get("generated_content", "")).lower(),
        }
    )
    if letter_status != 201 or not letter.get("id") or letter.get("status") != "draft":
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    ready_status, ready_body = post_json(f"{base}/requests/{request_id}/ready-for-release", {}, headers=headers)
    checks.append(
        {
            "name": "mark_ready_for_release",
            "status_code": ready_status,
            "status": ready_body.get("status"),
        }
    )
    if ready_status != 200 or ready_body.get("status") != "ready_for_release":
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}

    return {"name": "civicrecords_workflow", "status": "passed", "checks": checks}


def verify_clerk_bearer_workflow(ports: dict[str, int]) -> dict[str, object]:
    base = f"http://127.0.0.1:{ports['api']}"
    headers = {"Authorization": f"Bearer {CLERK_WORKFLOW_PROOF_BEARER}"}
    checks: list[dict[str, object]] = []

    def append_check(name: str, status_code: int, body: dict[str, object], **extra: object) -> bool:
        check = {"name": name, "status_code": status_code, **extra}
        checks.append(check)
        return 200 <= status_code < 300

    session_status, session = get_json(f"{base}/staff/session", headers=headers)
    checks.append(
        {
            "name": "staff_session",
            "status_code": session_status,
            "mode": session.get("mode"),
            "roles": session.get("roles"),
            "token_fingerprint_present": bool(session.get("token_fingerprint")),
        }
    )
    if session_status != 200 or session.get("mode") != CLERK_STAFF_MODE_BEARER:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    marker = f"Starter set workflow proof {uuid4().hex[:8]}"
    actor = "clerk@example.gov"
    create_status, created = post_json(
        f"{base}/agenda-intake",
        {
            "title": marker,
            "department_name": "Clerk",
            "submitted_by": actor,
            "summary": "Runtime proof that CivicClerk can accept a protected staff agenda intake item.",
            "source_references": [{"label": "Starter-set proof", "url": "https://civicsuite.org/starter-set"}],
        },
        headers=headers,
    )
    item_id = created.get("id")
    checks.append(
        {
            "name": "create_agenda_intake",
            "status_code": create_status,
            "item_id_present": bool(item_id),
            "title_matches": created.get("title") == marker,
        }
    )
    if create_status != 201 or not item_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    review_status, reviewed = post_json(
        f"{base}/agenda-intake/{item_id}/review",
        {"reviewer": actor, "ready": True, "notes": "Starter-set workflow proof marks this intake ready."},
        headers=headers,
    )
    if not append_check("review_agenda_intake", review_status, reviewed, readiness_status=reviewed.get("readiness_status")):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if str(reviewed.get("readiness_status", "")).lower() != "ready":
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    promote_status, promoted = post_json(
        f"{base}/agenda-intake/{item_id}/promote",
        {"reviewer": actor, "notes": "Promoted by installed-stack starter-set proof."},
        headers=headers,
    )
    agenda_item = promoted.get("agenda_item") if isinstance(promoted.get("agenda_item"), dict) else {}
    agenda_item_id = agenda_item.get("id") if isinstance(agenda_item, dict) else None
    if not append_check(
        "promote_agenda_intake",
        promote_status,
        promoted,
        agenda_item_id_present=bool(agenda_item_id),
        next_step=promoted.get("next_step"),
    ):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not agenda_item_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    list_status, listed = get_json(f"{base}/agenda-intake", headers=headers)
    items = listed.get("items") if isinstance(listed.get("items"), list) else []
    found = any(isinstance(item, dict) and item.get("id") == item_id for item in items)
    checks.append(
        {
            "name": "list_agenda_intake",
            "status_code": list_status,
            "created_item_listed": found,
        }
    )
    if list_status != 200 or not found:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    body_status, body = post_json(
        f"{base}/meeting-bodies",
        {"name": f"{marker} City Council", "body_type": "city_council"},
        headers=headers,
    )
    meeting_body_id = body.get("id")
    if not append_check("create_meeting_body", body_status, body, meeting_body_id_present=bool(meeting_body_id)):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not meeting_body_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    scheduled_start = (datetime.now(UTC) + timedelta(days=5)).replace(microsecond=0).isoformat()
    meeting_status, meeting = post_json(
        f"{base}/meetings",
        {
            "title": f"{marker} regular meeting",
            "meeting_type": "regular",
            "scheduled_start": scheduled_start,
            "meeting_body_id": meeting_body_id,
            "location": "Council Chambers",
        },
        headers=headers,
    )
    meeting_id = meeting.get("id")
    if not append_check("create_meeting", meeting_status, meeting, meeting_id_present=bool(meeting_id)):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not meeting_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    packet_status, packet = post_json(
        f"{base}/meetings/{meeting_id}/packet-assemblies",
        {
            "title": f"{marker} packet",
            "agenda_item_ids": [agenda_item_id],
            "actor": actor,
            "source_references": [{"label": "Promoted agenda intake", "id": item_id}],
            "citations": [{"label": "Agenda item", "id": agenda_item_id}],
        },
        headers=headers,
    )
    packet_id = packet.get("id")
    if not append_check("create_packet_assembly", packet_status, packet, packet_id_present=bool(packet_id)):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not packet_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    finalize_status, finalized = post_json(
        f"{base}/packet-assemblies/{packet_id}/finalize",
        {"actor": actor},
        headers=headers,
    )
    if not append_check("finalize_packet_assembly", finalize_status, finalized, status=finalized.get("status")):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    posted_at = datetime.now(UTC).replace(microsecond=0).isoformat()
    notice_payload = {
        "notice_type": "regular",
        "posted_at": posted_at,
        "minimum_notice_hours": 72,
        "statutory_basis": "Starter-set proof: regular meetings require at least 72 hours of public notice.",
        "approved_by": actor,
        "actor": actor,
    }
    notice_status, notice = post_json(f"{base}/meetings/{meeting_id}/notice-checklists", notice_payload, headers=headers)
    notice_id = notice.get("id")
    if not append_check("create_notice_checklist", notice_status, notice, notice_id_present=bool(notice_id), compliant=notice.get("compliant")):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not notice_id or notice.get("compliant") is not True:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    proof_status, proof = post_json(
        f"{base}/notice-checklists/{notice_id}/posting-proof",
        {
            "actor": actor,
            "posting_proof": {
                "location": "City Hall bulletin board",
                "posted_at": posted_at,
                "proof_id": marker,
            },
        },
        headers=headers,
    )
    if not append_check("attach_notice_posting_proof", proof_status, proof, posting_proof_present=bool(proof.get("posting_proof"))):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    motion_status, motion = post_json(
        f"{base}/meetings/{meeting_id}/motions",
        {
            "text": f"Move to approve the {marker} packet.",
            "actor": actor,
            "agenda_item_id": agenda_item_id,
            "seconded_by": "councilmember@example.gov",
        },
        headers=headers,
    )
    motion_id = motion.get("id")
    if not append_check("capture_motion", motion_status, motion, motion_id_present=bool(motion_id)):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not motion_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    vote_status, vote = post_json(
        f"{base}/motions/{motion_id}/votes",
        {"voter_name": "Council Member Rivera", "vote": "aye", "actor": actor},
        headers=headers,
    )
    if not append_check("capture_vote", vote_status, vote, vote_id_present=bool(vote.get("id"))):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not vote.get("id"):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    minutes_status, minutes = post_json(
        f"{base}/meetings/{meeting_id}/minutes/drafts",
        {
            "model": "local-template",
            "prompt_version": "minutes_draft@0.1.0",
            "human_approver": actor,
            "source_materials": [
                {
                    "source_id": str(motion_id),
                    "label": "Captured motion and vote",
                    "text": f"Motion {motion_id} approved the packet with an aye vote.",
                }
            ],
            "sentences": [
                {
                    "text": "Council approved the packet after a recorded motion and vote.",
                    "citations": [str(motion_id)],
                }
            ],
        },
        headers=headers,
    )
    minute_id = minutes.get("id")
    if not append_check(
        "create_minutes_draft",
        minutes_status,
        minutes,
        minute_id_present=bool(minute_id),
        human_review_required=bool(minutes.get("human_approver")),
    ):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not minute_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    post_minutes_status, post_minutes = post_json(f"{base}/minutes/{minute_id}/post", {}, headers=headers)
    checks.append(
        {
            "name": "reject_auto_minutes_post",
            "status_code": post_minutes_status,
            "guardrail_triggered": post_minutes_status == 409,
            "payload": post_minutes,
        }
    )
    if post_minutes_status != 409:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    archive_status, archive = post_json(
        f"{base}/meetings/{meeting_id}/public-record",
        {
            "title": f"{marker} public archive",
            "visibility": "public",
            "posted_agenda": f"Agenda for {marker}: approve packet.",
            "posted_packet": f"Packet for {marker}: staff report and agenda item.",
            "approved_minutes": f"Approved minutes for {marker}: packet approved by recorded vote.",
            "plain_language_summary": "Starter-set proof archive record for public search.",
            "minutes_adopted_at": datetime.now(UTC).replace(microsecond=0).isoformat(),
            "minutes_signed_by": "City Clerk",
        },
        headers=headers,
    )
    archive_id = archive.get("id")
    if not append_check("publish_public_archive_record", archive_status, archive, archive_id_present=bool(archive_id)):
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}
    if not archive_id:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    calendar_status, calendar = get_json(f"{base}/public/meetings")
    meetings = calendar.get("meetings") if isinstance(calendar.get("meetings"), list) else []
    calendar_found = any(isinstance(record, dict) and record.get("id") == archive_id for record in meetings)
    checks.append(
        {
            "name": "public_meeting_calendar",
            "status_code": calendar_status,
            "archive_record_listed": calendar_found,
        }
    )
    if calendar_status != 200 or not calendar_found:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    query = urllib.parse.quote(marker)
    search_status, archive_search = get_json(f"{base}/public/archive/search?q={query}")
    results = archive_search.get("results") if isinstance(archive_search.get("results"), list) else []
    search_found = any(isinstance(record, dict) and record.get("id") == archive_id for record in results)
    checks.append(
        {
            "name": "public_archive_search",
            "status_code": search_status,
            "archive_record_found": search_found,
            "total_count": archive_search.get("total_count"),
        }
    )
    if search_status != 200 or not search_found:
        return {"name": "civicclerk_bearer_workflow", "status": "failed", "checks": checks}

    return {"name": "civicclerk_bearer_workflow", "status": "passed", "checks": checks}


def verify_code_workflow(ports: dict[str, int]) -> dict[str, object]:
    base = f"http://127.0.0.1:{ports['api']}"
    checks: list[dict[str, object]] = []
    try:
        health_status, health = get_json(f"{base}/health")
        checks.append({"name": "health", "status_code": health_status, "payload": health})
        if (
            health_status != 200
            or health.get("service") != "civiccode"
            or health.get("version") != EXPECTED_CODE_VERSION
            or health.get("civiccore") != EXPECTED_CIVICCORE_VERSION
        ):
            return {"name": "civiccode_workflow", "status": "failed", "checks": checks}
        public_status, _public = get_json(f"{base}/api/v1/civiccode/sections/lookup?section_number=13.40.020")
        checks.append({"name": "seeded_section_lookup", "status_code": public_status})
        if public_status != 200:
            return {"name": "civiccode_workflow", "status": "failed", "checks": checks}
        forged_status, forged = get_json(
            f"{base}/api/v1/civiccode/staff/audit-events",
            headers={
                "X-CivicCode-Role": "staff",
                "X-CivicCode-Actor": "installer-proof@example.gov",
            },
        )
        checks.append({"name": "forged_staff_header_boundary", "status_code": forged_status, "payload": forged})
        if forged_status != 403:
            return {"name": "civiccode_workflow", "status": "failed", "checks": checks}
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "civiccode_workflow", "status": "failed", "error": str(exc), "checks": checks}
    return {"name": "civiccode_workflow", "status": "passed", "checks": checks}


def verify_clerk_to_code_handoff(ctx: dict[str, object]) -> dict[str, object]:
    ports = ctx["ports"]
    if not isinstance(ports, dict):
        return {"name": "clerk_to_code_handoff", "status": "failed", "error": "invalid ports"}
    clerk_ports = ports["civicclerk"]
    code_ports = ports["civiccode"]
    clerk_base = f"http://127.0.0.1:{clerk_ports['api']}"
    code_base = f"http://127.0.0.1:{code_ports['api']}"
    clerk_headers = {"Authorization": f"Bearer {CLERK_WORKFLOW_PROOF_BEARER}"}
    code_env = parse_env_file(Path(ctx["code_source"]) / ".env")  # type: ignore[arg-type]
    intake_auth = code_env.get("CIVICCODE_INTAKE_SECRET", "")
    code_headers = {
        "X-CivicCode-Role": "staff",
        "X-CivicCode-Actor": "installer-handoff-proof@example.gov",
        "X-CivicCode-Intake-Secret": intake_auth,
    }
    checks: list[dict[str, object]] = []
    try:
        marker = f"city-core-handoff-{int(time.time())}"
        meeting_status, meeting = post_json(
            f"{clerk_base}/meetings",
            {
                "title": f"City-core handoff proof {marker}",
                "meeting_type": "regular",
                "scheduled_start": datetime.now(UTC).replace(microsecond=0).isoformat(),
                "location": "Council Chambers",
            },
            headers=clerk_headers,
        )
        meeting_id = meeting.get("id")
        checks.append({"name": "clerk_create_meeting", "status_code": meeting_status, "id_present": bool(meeting_id)})
        if meeting_status != 201 or not meeting_id:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        motion_status, motion = post_json(
            f"{clerk_base}/meetings/{meeting_id}/motions",
            {
                "text": "Move to adopt ordinance 2026-041 amending backyard livestock permits.",
                "actor": "clerk@example.gov",
                "agenda_item_id": f"agenda-{marker}",
                "seconded_by": "councilmember@example.gov",
            },
            headers=clerk_headers,
        )
        motion_id = motion.get("id")
        checks.append({"name": "clerk_capture_adoption_motion", "status_code": motion_status, "id_present": bool(motion_id)})
        if motion_status != 201 or not motion_id:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        handoff_status, handoff = post_json(
            f"{clerk_base}/meetings/{meeting_id}/ordinance-resolution-handoff",
            {
                "item_type": "ordinance",
                "title": "Ordinance 2026-041 amending backyard livestock permits",
                "actor": "clerk@example.gov",
                "legal_reviewer": "attorney@example.gov",
                "text": "An ordinance amending Section 13.40.020 to allow up to eight backyard chickens with a city permit.",
                "source_motion_id": motion_id,
                "ordinance_number": "2026-041",
                "affected_sections": ["13.40.020"],
                "source_document_url": f"https://city.example.gov/ordinances/{marker}.pdf",
                "source_document_hash": "sha256:" + hashlib.sha256(marker.encode("utf-8")).hexdigest(),
                "source_references": [{"agenda_item_id": f"agenda-{marker}", "motion_id": motion_id}],
            },
            headers=clerk_headers,
        )
        code_event_id = handoff.get("civiccode_event_id")
        checks.append(
            {
                "name": "clerk_emits_to_code",
                "status_code": handoff_status,
                "handoff_status": handoff.get("civiccode_handoff_status"),
                "civiccode_event_id_present": bool(code_event_id),
            }
        )
        if handoff_status != 201 or handoff.get("civiccode_handoff_status") != "EMIT_DELIVERED" or not code_event_id:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        warning_status, warning_lookup = get_json(f"{code_base}/api/v1/civiccode/sections/lookup?section_number=13.40.020")
        warnings = warning_lookup.get("handoff_warnings") if isinstance(warning_lookup.get("handoff_warnings"), list) else []
        checks.append({"name": "code_pending_warning_visible", "status_code": warning_status, "warning_count": len(warnings)})
        if warning_status != 200 or not warnings:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        version_id = f"version_{marker.replace('-', '_')}"
        version_status, version = post_json(
            f"{code_base}/api/v1/civiccode/sections/sec_portland_13_40_020/versions",
            {
                "version_id": version_id,
                "section_id": "sec_portland_13_40_020",
                "source_id": "src_portland_code_13_40",
                "version_label": "Codified ordinance 2026-041",
                "body": "Residents may keep up to eight backyard chickens with a city permit under the city-core handoff proof.",
                "effective_start": "2026-05-23",
                "status": "adopted",
                "is_current": True,
                "adoption_event_id": str(code_event_id),
                "amendment_event_id": str(code_event_id),
                "amendment_summary": "Codifies the CivicClerk adopted ordinance handoff.",
            },
            headers=code_headers,
        )
        checks.append({"name": "code_create_codified_version", "status_code": version_status, "version_id": version.get("version_id")})
        if version_status != 201 or version.get("version_id") != version_id:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        resolve_status, resolved = post_json(
            f"{code_base}/api/v1/civiccode/staff/civicclerk/ordinance-events/{code_event_id}/resolve",
            {"section_version_id": version_id},
            headers=code_headers,
        )
        checks.append({"name": "code_resolve_handoff", "status_code": resolve_status, "handoff_state": resolved.get("handoff_state")})
        if resolve_status != 200 or resolved.get("handoff_state") != "codified":
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        final_status, final_lookup = get_json(f"{code_base}/api/v1/civiccode/sections/lookup?section_number=13.40.020")
        final_warnings = final_lookup.get("handoff_warnings") if isinstance(final_lookup.get("handoff_warnings"), list) else []
        final_body = str(final_lookup.get("version", {}).get("body", ""))
        checks.append(
            {
                "name": "code_lookup_after_resolution",
                "status_code": final_status,
                "warning_count": len(final_warnings),
                "body_contains_eight_chickens": "eight backyard chickens" in final_body,
            }
        )
        if final_status != 200 or final_warnings or "eight backyard chickens" not in final_body:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        answer_status, answer = post_json(
            f"{code_base}/api/v1/civiccode/questions/answer",
            {"question": "How many backyard chickens can residents keep?", "section_number": "13.40.020"},
        )
        answer_text = str(answer.get("answer") or "")
        citations = answer.get("citations") if isinstance(answer.get("citations"), list) else []
        checks.append(
            {
                "name": "code_qa_after_handoff",
                "status_code": answer_status,
                "status": answer.get("status"),
                "matched_section_number": answer.get("matched_section_number"),
                "citation_count": len(citations),
                "answer_mentions_eight": "eight" in answer_text.lower(),
            }
        )
        if answer_status != 200 or answer.get("matched_section_number") != "13.40.020" or not citations:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "clerk_to_code_handoff", "status": "failed", "error": str(exc), "checks": checks}
    return {"name": "clerk_to_code_handoff", "status": "passed", "checks": checks}


def verify_starter_set_workflow_contract(
    ctx: dict[str, object],
    *,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> dict[str, object]:
    modules = normalize_selected_modules(selected_modules)
    ports = ctx["ports"]
    if not isinstance(ports, dict):
        return {"name": "starter_set_runtime_workflows", "status": "failed", "error": "invalid ports"}
    checks: list[dict[str, object]] = []
    if MODULE_RECORDS in modules:
        records_ports = ports["civicrecords-ai"]
        checks.append(verify_records_workflow(Path(ctx["records_source"]), records_ports))  # type: ignore[arg-type]
    if MODULE_CLERK in modules:
        clerk_ports = ports["civicclerk"]
        checks.append(verify_clerk_bearer_workflow(clerk_ports))  # type: ignore[arg-type]
    if MODULE_CODE in modules:
        code_ports = ports["civiccode"]
        checks.append(verify_code_workflow(code_ports))  # type: ignore[arg-type]
    if MODULE_CLERK in modules and MODULE_CODE in modules:
        checks.append(verify_clerk_to_code_handoff(ctx))
    status = "passed" if checks and all(check.get("status") == "passed" for check in checks) else "failed"
    return {
        "name": "starter_set_runtime_workflows",
        "status": status,
        "selected_modules": modules,
        "auth_contract": "CivicRecords uses first-admin JWT login; CivicClerk uses bearer staff auth.",
        "checks": checks,
    }


def lifecycle_context(
    install_root: Path,
    isolation: dict[str, object],
    *,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> dict[str, object]:
    if not is_within(install_root, ROOT):
        raise InstallerError(f"Install root must stay inside this bundle/repo: {install_root}")
    ports = isolation["ports"]
    compose_projects = isolation["compose_projects"]
    if not isinstance(ports, dict) or not isinstance(compose_projects, dict):
        raise InstallerError("Invalid isolation model.")
    modules = load_selected_modules(install_root, selected_modules)
    return {
        "install_root": install_root,
        "selected_modules": modules,
        "records_source": install_root / "sources" / "civicrecords-ai",
        "clerk_source": install_root / "sources" / "civicclerk",
        "code_source": install_root / "sources" / "civiccode",
        "records_project": compose_projects["civicrecords-ai"],
        "clerk_project": compose_projects["civicclerk"],
        "code_project": compose_projects["civiccode"],
        "ports": ports,
        "compose_projects": compose_projects,
        "isolation_id": isolation["isolation_id"],
        "port_offset": isolation["port_offset"],
    }


def prepare_sources(
    install_root: Path,
    *,
    isolation: dict[str, object],
    selected_modules: list[str] | tuple[str, ...] | None = None,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
) -> dict[str, object]:
    modules = normalize_selected_modules(selected_modules)
    persist_selected_modules(install_root, modules)
    ctx = lifecycle_context(install_root, isolation, selected_modules=modules)
    ports = ctx["ports"]  # type: ignore[assignment]
    records_ports = ports["civicrecords-ai"]  # type: ignore[index]
    clerk_ports = ports["civicclerk"]  # type: ignore[index]
    code_ports = ports["civiccode"]  # type: ignore[index]
    civiccode_intake_secret = secrets.token_urlsafe(32) if MODULE_CLERK in modules and MODULE_CODE in modules else ""
    civiccode_intake_url = (
        f"http://host.docker.internal:{code_ports['api']}/api/v1/civiccode/staff/civicclerk/ordinance-events"
        if civiccode_intake_secret
        else ""
    )
    install_root.mkdir(parents=True, exist_ok=True)
    if MODULE_RECORDS in modules:
        copy_source(source_root(MODULE_RECORDS), ctx["records_source"])  # type: ignore[arg-type]
        normalize_records_compose_ports(ctx["records_source"], records_ports)  # type: ignore[arg-type]
        normalize_records_frontend_dockerfile(ctx["records_source"])  # type: ignore[arg-type]
        write_records_env(ctx["records_source"] / ".env", records_ports)  # type: ignore[operator]
        write_records_override(ctx["records_source"], records_ports)  # type: ignore[arg-type]
    if MODULE_CLERK in modules:
        copy_source(source_root(MODULE_CLERK), ctx["clerk_source"])  # type: ignore[arg-type]
        write_clerk_env(
            ctx["clerk_source"] / ".env",
            staff_mode=staff_mode,
            ports=clerk_ports,  # type: ignore[arg-type]
            civiccode_intake_url=civiccode_intake_url,
            civiccode_intake_secret=civiccode_intake_secret,
        )  # type: ignore[operator]
    if MODULE_CODE in modules:
        copy_source(source_root(MODULE_CODE), ctx["code_source"])  # type: ignore[arg-type]
        write_code_env(
            ctx["code_source"] / ".env",
            code_ports,  # type: ignore[arg-type]
            civiccode_intake_secret=civiccode_intake_secret,
        )  # type: ignore[operator]
    return ctx


def install(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
    workflow_proof: bool = False,
) -> dict[str, object]:
    require_command("docker")
    docker_info = run([docker_command(), "info"], cwd=ROOT, timeout=30)
    if docker_info.returncode != 0:
        raise InstallerError(
            "Docker is installed but not running. Start Docker Desktop or Docker Engine, wait for it to be ready, "
            "then rerun install."
        )
    ctx = prepare_sources(
        install_root,
        isolation=isolation,
        selected_modules=selected_modules,
        staff_mode=staff_mode,
    )
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    steps: list[dict[str, object]] = []
    for name, source_key, project_key, services in (
        ("civicrecords-ai", "records_source", "records_project", ("api", "frontend")),
        ("civicclerk", "clerk_source", "clerk_project", ("api", "frontend")),
        ("civiccode", "code_source", "code_project", ("api",)),
    ):
        if name not in modules:
            steps.append({"module": name, "step": "compose_build", "status": "skipped_not_selected"})
            continue
        source = ctx[source_key]  # type: ignore[index]
        project = str(ctx[project_key])
        build = run(compose(project, source, "build", "--pull", "--no-cache", *services), cwd=source, timeout=2400)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_build", "returncode": build.returncode, "stdout": build.stdout[-4000:], "stderr": build.stderr[-4000:]})
        if build.returncode != 0:
            return {"status": "failed", "steps": steps}
        up = run(compose(project, source, "up", "-d", *services), cwd=source, timeout=900)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_up", "returncode": up.returncode, "stdout": up.stdout[-4000:], "stderr": up.stderr[-4000:]})
        if up.returncode != 0:
            return {"status": "failed", "steps": steps}
    result = verify(
        install_root,
        isolation=isolation,
        report_dir=report_dir,
        selected_modules=modules,
        workflow_proof=workflow_proof,
    )  # type: ignore[arg-type]
    steps.extend(result["checks"])  # type: ignore[arg-type]
    status = "passed" if result["status"] == "passed" else "failed"
    return {"status": status, "selected_modules": modules, "steps": steps}


def verify(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    workflow_proof: bool = False,
) -> dict[str, object]:
    ctx = lifecycle_context(install_root, isolation, selected_modules=selected_modules)
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    ports = ctx["ports"]  # type: ignore[assignment]
    records_ports = ports["civicrecords-ai"]  # type: ignore[index]
    clerk_ports = ports["civicclerk"]  # type: ignore[index]
    code_ports = ports["civiccode"]  # type: ignore[index]
    checks: list[dict[str, object]] = []
    records_api_passed = False
    clerk_api_passed = False
    code_api_passed = False
    if MODULE_RECORDS in modules:
        records_api = {"name": "civicrecords_api", "url": f"http://127.0.0.1:{records_ports['api']}/health", **wait_for_url(f"http://127.0.0.1:{records_ports['api']}/health", timeout_seconds=180)}
        checks.append(records_api)
        checks.append({"name": "civicrecords_web", "url": f"http://127.0.0.1:{records_ports['web']}/", **wait_for_url(f"http://127.0.0.1:{records_ports['web']}/", timeout_seconds=120)})
        records_api_passed = records_api["status"] == "passed"
    if MODULE_CLERK in modules:
        clerk_api = {"name": "civicclerk_api", "url": f"http://127.0.0.1:{clerk_ports['api']}/health", **wait_for_url(f"http://127.0.0.1:{clerk_ports['api']}/health", timeout_seconds=180)}
        checks.append(clerk_api)
        checks.append({"name": "civicclerk_web", "url": f"http://127.0.0.1:{clerk_ports['web']}/", **wait_for_url(f"http://127.0.0.1:{clerk_ports['web']}/", timeout_seconds=120)})
        clerk_api_passed = clerk_api["status"] == "passed"
    if MODULE_CODE in modules:
        code_api = {"name": "civiccode_api", "url": f"http://127.0.0.1:{code_ports['api']}/health", **wait_for_url(f"http://127.0.0.1:{code_ports['api']}/health", timeout_seconds=180)}
        checks.append(code_api)
        checks.append({"name": "civiccode_public_lookup", "url": f"http://127.0.0.1:{code_ports['api']}/civiccode/search?q=13.40.020", **wait_for_url(f"http://127.0.0.1:{code_ports['api']}/civiccode/search?q=13.40.020", timeout_seconds=120)})
        code_api_passed = code_api["status"] == "passed"
    if clerk_api_passed and not workflow_proof:
        checks.append(verify_clerk_protected_default(clerk_ports))  # type: ignore[arg-type]
    if records_api_passed or clerk_api_passed:
        checks.append(verify_civiccore_contract(records_ports, clerk_ports, code_ports, selected_modules=modules))  # type: ignore[arg-type]
    elif code_api_passed:
        checks.append(verify_civiccore_contract(records_ports, clerk_ports, code_ports, selected_modules=modules))  # type: ignore[arg-type]
    if workflow_proof:
        checks.append(verify_starter_set_workflow_contract(ctx, selected_modules=modules))
    status = "passed" if all(check["status"] == "passed" for check in checks) else "failed"
    return {"status": status, "selected_modules": modules, "checks": checks}


def uninstall(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    remove_files: bool = False,
) -> dict[str, object]:
    ctx = lifecycle_context(install_root, isolation, selected_modules=selected_modules)
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    steps: list[dict[str, object]] = []
    for name, source_key, project_key in (
        ("civicrecords-ai", "records_source", "records_project"),
        ("civicclerk", "clerk_source", "clerk_project"),
        ("civiccode", "code_source", "code_project"),
    ):
        if name not in modules:
            steps.append({"module": name, "step": "compose_down", "status": "skipped_not_selected"})
            continue
        source = ctx[source_key]  # type: ignore[index]
        if not Path(source).exists():
            steps.append({"module": name, "step": "compose_down", "status": "skipped_missing_source"})
            continue
        if not (Path(source) / "docker-compose.yml").is_file():
            steps.append({"module": name, "step": "compose_down", "status": "skipped_missing_compose_file"})
            continue
        down = run(compose(str(ctx[project_key]), source, "down", "-v"), cwd=source, timeout=600)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_down", "returncode": down.returncode, "stdout": down.stdout[-4000:], "stderr": down.stderr[-4000:]})
        if down.returncode != 0:
            return {"status": "failed", "steps": steps}
    if remove_files and install_root.exists():
        if not is_within(install_root, ROOT / "installer" / "runtime"):
            raise InstallerError(f"Refusing to remove files outside installer/runtime: {install_root}")
        remove_tree_allowing_readonly(install_root)
        steps.append({"step": "remove_install_root", "path": str(install_root.relative_to(ROOT)), "status": "removed"})
    return {"status": "passed", "selected_modules": modules, "steps": steps}


def module_database_contract(ctx: dict[str, object], module: str) -> dict[str, str | Path]:
    if module == MODULE_RECORDS:
        return {
            "module": module,
            "source": ctx["records_source"],  # type: ignore[dict-item]
            "project": str(ctx["records_project"]),
            "postgres_service": "postgres",
            "postgres_user": "civicrecords",
            "postgres_db": "civicrecords",
        }
    if module == MODULE_CLERK:
        source = ctx["clerk_source"]  # type: ignore[assignment]
        env_values = parse_env_file(Path(source) / ".env")
        return {
            "module": module,
            "source": source,
            "project": str(ctx["clerk_project"]),
            "postgres_service": "postgres",
            "postgres_user": env_values.get("CIVICCLERK_POSTGRES_USER", "civicclerk"),
            "postgres_db": env_values.get("CIVICCLERK_POSTGRES_DB", "civicclerk"),
        }
    if module == MODULE_CODE:
        source = ctx["code_source"]  # type: ignore[assignment]
        env_values = parse_env_file(Path(source) / ".env")
        return {
            "module": module,
            "source": source,
            "project": str(ctx["code_project"]),
            "postgres_service": "postgres",
            "postgres_user": env_values.get("POSTGRES_USER", "civiccode"),
            "postgres_db": env_values.get("POSTGRES_DB", "civiccode"),
        }
    raise InstallerError(f"Unsupported module for backup/restore: {module}")


def backup(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> dict[str, object]:
    require_command("docker")
    ctx = lifecycle_context(install_root, isolation, selected_modules=selected_modules)
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    backup_dir = backups_root(install_root) / datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    backup_dir.mkdir(parents=True, exist_ok=False)
    steps: list[dict[str, object]] = []
    manifest: dict[str, object] = {
        "created_at": datetime.now(UTC).isoformat(),
        "selected_modules": modules,
        "backup_dir": str(backup_dir),
        "artifacts": [],
    }
    for module in modules:
        contract = module_database_contract(ctx, str(module))
        source = Path(contract["source"])  # type: ignore[arg-type]
        dump_path = backup_dir / f"{module}-postgres.dump"
        dump = run_binary_to_file(
            compose(str(contract["project"]), source, "exec", "-T", str(contract["postgres_service"]), "pg_dump", "-U", str(contract["postgres_user"]), "-d", str(contract["postgres_db"]), "-Fc"),
            cwd=source,
            output_path=dump_path,
            timeout=900,
        )
        steps.append(binary_step(module=str(module), step="postgres_backup_dump", proc=dump, path=dump_path))
        if dump.returncode != 0 or dump_path.stat().st_size == 0:
            return {"status": "failed", "selected_modules": modules, "backup_dir": str(backup_dir), "steps": steps}
        digest = hashlib.sha256(dump_path.read_bytes()).hexdigest()
        manifest["artifacts"].append(
            {
                "module": module,
                "type": "postgres_custom_dump",
                "path": dump_path.name,
                "sha256": digest,
                "bytes": dump_path.stat().st_size,
                "postgres_service": contract["postgres_service"],
                "postgres_user": contract["postgres_user"],
                "postgres_db": contract["postgres_db"],
            }
        )
    selected_path = selected_modules_path(install_root)
    if selected_path.is_file():
        shutil.copy2(selected_path, backup_dir / selected_path.name)
    manifest_path = backup_dir / "backup-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    steps.append({"step": "write_backup_manifest", "path": str(manifest_path), "status": "passed"})
    return {"status": "passed", "selected_modules": modules, "backup_dir": str(backup_dir), "steps": steps}


def restore(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    backup_dir: Path | None = None,
) -> dict[str, object]:
    require_command("docker")
    ctx = lifecycle_context(install_root, isolation, selected_modules=selected_modules)
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    resolved_backup = backup_dir or latest_backup_dir(install_root)
    manifest_path = resolved_backup / "backup-manifest.json"
    if not manifest_path.is_file():
        raise InstallerError(f"Backup manifest missing: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    artifacts = manifest.get("artifacts") if isinstance(manifest, dict) else None
    if not isinstance(artifacts, list):
        raise InstallerError(f"Backup manifest has no artifacts list: {manifest_path}")
    artifact_by_module = {
        str(item.get("module")): item
        for item in artifacts
        if isinstance(item, dict) and item.get("type") == "postgres_custom_dump"
    }
    steps: list[dict[str, object]] = []
    for module in modules:
        artifact = artifact_by_module.get(str(module))
        if not artifact:
            return {"status": "failed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps, "error": f"missing backup artifact for {module}"}
        dump_path = resolved_backup / str(artifact["path"])
        if not dump_path.is_file():
            return {"status": "failed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps, "error": f"missing backup dump for {module}: {dump_path}"}
        digest = hashlib.sha256(dump_path.read_bytes()).hexdigest()
        if digest != artifact.get("sha256"):
            return {"status": "failed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps, "error": f"sha256 mismatch for {module} backup dump"}
        contract = module_database_contract(ctx, str(module))
        source = Path(contract["source"])  # type: ignore[arg-type]
        restore_db = f"{contract['postgres_db']}_restore_probe"
        for step_name, command in (
            ("drop_restore_probe_before", compose(str(contract["project"]), source, "exec", "-T", str(contract["postgres_service"]), "dropdb", "-U", str(contract["postgres_user"]), "--if-exists", restore_db)),
            ("create_restore_probe", compose(str(contract["project"]), source, "exec", "-T", str(contract["postgres_service"]), "createdb", "-U", str(contract["postgres_user"]), restore_db)),
        ):
            proc = run(command, cwd=source, timeout=300)
            steps.append({"module": module, "step": step_name, "returncode": proc.returncode, "stdout": proc.stdout[-4000:], "stderr": proc.stderr[-4000:]})
            if proc.returncode != 0:
                return {"status": "failed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps}
        restored = run_binary_from_file(
            compose(str(contract["project"]), source, "exec", "-T", str(contract["postgres_service"]), "pg_restore", "-U", str(contract["postgres_user"]), "-d", restore_db),
            cwd=source,
            input_path=dump_path,
            timeout=900,
        )
        steps.append(binary_step(module=str(module), step="restore_probe_pg_restore", proc=restored, path=dump_path))
        cleanup = run(
            compose(str(contract["project"]), source, "exec", "-T", str(contract["postgres_service"]), "dropdb", "-U", str(contract["postgres_user"]), "--if-exists", restore_db),
            cwd=source,
            timeout=300,
        )
        steps.append({"module": module, "step": "drop_restore_probe_after", "returncode": cleanup.returncode, "stdout": cleanup.stdout[-4000:], "stderr": cleanup.stderr[-4000:]})
        if restored.returncode != 0 or cleanup.returncode != 0:
            return {"status": "failed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps}
    return {"status": "passed", "selected_modules": modules, "backup_dir": str(resolved_backup), "steps": steps}


def write_report(report_dir: Path, payload: dict[str, object]) -> None:
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "clerk-core-installer-lifecycle.json").write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Run CivicSuite clerk-core installer lifecycle.")
    parser.add_argument("mode", choices=("readiness", "install", "verify", "repair", "backup", "restore", "uninstall"))
    parser.add_argument("--install-root", default=str(DEFAULT_INSTALL_ROOT))
    parser.add_argument("--run-id", default=None)
    parser.add_argument("--records-api-port", type=int, default=None)
    parser.add_argument("--records-web-port", type=int, default=None)
    parser.add_argument("--clerk-api-port", type=int, default=None)
    parser.add_argument("--clerk-web-port", type=int, default=None)
    parser.add_argument("--port-offset", type=int, default=None)
    parser.add_argument("--compose-project-suffix", default=None)
    parser.add_argument("--remove-files", action="store_true")
    parser.add_argument("--backup-dir", default=None, help="Restore from a specific backup directory. Defaults to the latest installer backup.")
    parser.add_argument(
        "--module",
        action="append",
        choices=SELECTABLE_MODULES,
        default=None,
        help="Install or verify one selectable module. Repeat for both. Defaults to civicrecords-ai and civicclerk.",
    )
    parser.add_argument(
        "--staff-mode",
        choices=(CLERK_STAFF_MODE_PROTECTED, CLERK_STAFF_MODE_OPEN, CLERK_STAFF_MODE_BEARER),
        default=CLERK_STAFF_MODE_PROTECTED,
        help="CivicClerk staff auth default for install/repair. Open mode is explicit local-rehearsal opt-in.",
    )
    parser.add_argument(
        "--workflow-proof",
        action="store_true",
        help="Run mutating starter-set workflow proof checks after health/version verification.",
    )
    args = parser.parse_args()
    if args.staff_mode == CLERK_STAFF_MODE_OPEN:
        print(CLERK_OPEN_MODE_WARNING, file=sys.stderr)

    run_id = args.run_id or os.environ.get("CIVICSUITE_INSTALLER_RUN_ID") or make_run_id()
    report_dir = REPORT_ROOT / run_id
    install_root = Path(args.install_root).resolve()
    selected_modules = (
        normalize_selected_modules(args.module)
        if args.mode in {"install", "repair"} or args.module
        else load_selected_modules(install_root, None)
    )
    isolation = resolve_isolation(
        run_id=run_id,
        records_api_port=args.records_api_port,
        records_web_port=args.records_web_port,
        clerk_api_port=args.clerk_api_port,
        clerk_web_port=args.clerk_web_port,
        port_offset=args.port_offset,
        compose_project_suffix=args.compose_project_suffix,
    )
    payload: dict[str, object] = {
        "run_id": run_id,
        "mode": args.mode,
        "install_root": str(install_root),
        "mutates_host": args.mode in {"install", "repair", "backup", "restore", "uninstall"} or args.workflow_proof,
        "civicclerk_staff_mode": args.staff_mode,
        "status": "failed",
        "started_at": datetime.now(UTC).isoformat(),
        "ports": isolation["ports"],
        "compose_projects": isolation["compose_projects"],
        "isolation_id": isolation["isolation_id"],
        "port_offset": isolation["port_offset"],
        "selected_modules": selected_modules,
    }
    try:
        if args.mode == "readiness":
            require_command("docker")
            info = run([docker_command(), "info"], cwd=ROOT, timeout=30)
            payload["docker"] = {"returncode": info.returncode, "stdout": info.stdout[-1000:], "stderr": info.stderr[-1000:]}
            payload["status"] = "passed" if info.returncode == 0 else "failed"
        elif args.mode == "install":
            payload.update(
                install(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    staff_mode=args.staff_mode,
                    workflow_proof=args.workflow_proof,
                )
            )
        elif args.mode == "verify":
            payload.update(
                verify(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    workflow_proof=args.workflow_proof,
                )
            )
        elif args.mode == "repair":
            payload.update(
                install(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    staff_mode=args.staff_mode,
                    workflow_proof=args.workflow_proof,
                )
            )
        elif args.mode == "backup":
            payload.update(
                backup(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                )
            )
        elif args.mode == "restore":
            payload.update(
                restore(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    backup_dir=Path(args.backup_dir).resolve() if args.backup_dir else None,
                )
            )
        elif args.mode == "uninstall":
            payload.update(
                uninstall(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    remove_files=args.remove_files,
                )
            )
    except (InstallerError, subprocess.TimeoutExpired) as exc:
        payload["status"] = "failed"
        payload["error"] = str(exc)
        payload["fix_steps"] = [
            "Confirm Docker is installed, open, and reports a running engine.",
            "Confirm the resolved ports in the report are free, or rerun with --port-offset / explicit port flags.",
            "Run uninstall, then rerun install if a previous partial stack is present.",
        ]
    finally:
        payload["finished_at"] = datetime.now(UTC).isoformat()
        write_report(report_dir, payload)
        print(json.dumps(payload, indent=2, sort_keys=True))
    return 0 if payload.get("status") == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
