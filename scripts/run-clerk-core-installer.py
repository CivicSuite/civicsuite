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
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
REPORT_ROOT = ROOT / "installer" / "reports"
DEFAULT_INSTALL_ROOT = Path(os.environ.get("CIVICSUITE_INSTALLER_INSTALL_ROOT", ROOT / "installer" / "runtime" / "clerk-core"))

DEFAULT_RECORDS_PORTS = {"api": 18000, "web": 18080}
DEFAULT_CLERK_PORTS = {"api": 18776, "web": 18081}
MODULE_RECORDS = "civicrecords-ai"
MODULE_CLERK = "civicclerk"
SELECTABLE_MODULES = (MODULE_RECORDS, MODULE_CLERK)
DEFAULT_SELECTED_MODULES = (MODULE_RECORDS, MODULE_CLERK)
SELECTED_MODULES_FILE = "selected-modules.json"
CLERK_STAFF_MODE_PROTECTED = "protected"
CLERK_STAFF_MODE_OPEN = "open"
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
    return {
        "isolation_id": suffix,
        "port_offset": resolved_offset,
        "ports": {"civicrecords-ai": records_ports, "civicclerk": clerk_ports},
        "compose_projects": {
            "civicrecords-ai": f"civicsuite-{suffix}-records",
            "civicclerk": f"civicsuite-{suffix}-clerk",
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
        raise InstallerError("Select at least one module: civicrecords-ai or civicclerk.")
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


def persist_selected_modules(install_root: Path, modules: list[str]) -> None:
    install_root.mkdir(parents=True, exist_ok=True)
    selected_modules_path(install_root).write_text(
        json.dumps({"modules": modules}, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


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


def write_records_env(target: Path) -> None:
    ensure_records_secret_files(target.parent)
    if target.is_file():
        return
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
    }
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def compose(project: str, source: Path, *args: str) -> list[str]:
    command = [docker_command(), "compose", "-p", project, "-f", "docker-compose.yml"]
    override = source / "docker-compose.civicsuite.override.yml"
    if override.is_file():
        command.extend(["-f", override.name])
    command.extend(args)
    return command


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


def get_json(url: str, *, timeout_seconds: int = 10) -> tuple[int, dict[str, object]]:
    with urllib.request.urlopen(url, timeout=timeout_seconds) as response:
        payload = json.loads(response.read().decode("utf-8"))
        return response.status, payload


def post_json(url: str, payload: dict[str, object], *, timeout_seconds: int = 10) -> tuple[int, dict[str, object]]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        return exc.code, json.loads(body) if body else {}


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
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "starter_set_civiccore_contract", "status": "failed", "error": str(exc), "checks": checks}

    records_ok = True
    clerk_ok = True
    if MODULE_RECORDS in modules:
        checks.append({"name": "civicrecords_health", "status_code": records_status, "payload": records_health})
        records_ok = records_status == 200 and records_health.get("version") == "1.6.1"
    if MODULE_CLERK in modules:
        checks.append({"name": "civicclerk_health", "status_code": clerk_status, "payload": clerk_health})
        clerk_ok = (
            clerk_status == 200
            and clerk_health.get("service") == "civicclerk"
            and clerk_health.get("version") == "1.0.1"
            and clerk_health.get("civiccore") == "1.0.1"
        )
    expected: dict[str, object] = {}
    if MODULE_RECORDS in modules:
        expected[MODULE_RECORDS] = {"version": "1.6.1"}
    if MODULE_CLERK in modules:
        expected[MODULE_CLERK] = {"version": "1.0.1", "civiccore": "1.0.1"}
    expected["civiccore"] = {
        "role": "base dependency installed before selected modules through the installer plan"
    }
    status = "passed" if records_ok and clerk_ok else "failed"
    return {
        "name": "starter_set_civiccore_contract",
        "status": status,
        "selected_modules": modules,
        "expected": expected,
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
        "records_project": compose_projects["civicrecords-ai"],
        "clerk_project": compose_projects["civicclerk"],
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
    install_root.mkdir(parents=True, exist_ok=True)
    if MODULE_RECORDS in modules:
        copy_source(source_root(MODULE_RECORDS), ctx["records_source"])  # type: ignore[arg-type]
        normalize_records_compose_ports(ctx["records_source"], records_ports)  # type: ignore[arg-type]
        normalize_records_frontend_dockerfile(ctx["records_source"])  # type: ignore[arg-type]
        write_records_env(ctx["records_source"] / ".env")  # type: ignore[operator]
        write_records_override(ctx["records_source"], records_ports)  # type: ignore[arg-type]
    if MODULE_CLERK in modules:
        copy_source(source_root(MODULE_CLERK), ctx["clerk_source"])  # type: ignore[arg-type]
        write_clerk_env(ctx["clerk_source"] / ".env", staff_mode=staff_mode, ports=clerk_ports)  # type: ignore[operator,arg-type]
    return ctx


def install(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
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
    result = verify(install_root, isolation=isolation, report_dir=report_dir, selected_modules=modules)  # type: ignore[arg-type]
    steps.extend(result["checks"])  # type: ignore[arg-type]
    status = "passed" if result["status"] == "passed" else "failed"
    return {"status": status, "selected_modules": modules, "steps": steps}


def verify(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> dict[str, object]:
    ctx = lifecycle_context(install_root, isolation, selected_modules=selected_modules)
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    ports = ctx["ports"]  # type: ignore[assignment]
    records_ports = ports["civicrecords-ai"]  # type: ignore[index]
    clerk_ports = ports["civicclerk"]  # type: ignore[index]
    checks: list[dict[str, object]] = []
    records_api_passed = False
    clerk_api_passed = False
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
    if clerk_api_passed:
        checks.append(verify_clerk_protected_default(clerk_ports))  # type: ignore[arg-type]
    if records_api_passed or clerk_api_passed:
        checks.append(verify_civiccore_contract(records_ports, clerk_ports, selected_modules=modules))  # type: ignore[arg-type]
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
    ):
        if name not in modules:
            steps.append({"module": name, "step": "compose_down", "status": "skipped_not_selected"})
            continue
        source = ctx[source_key]  # type: ignore[index]
        if not Path(source).exists():
            steps.append({"module": name, "step": "compose_down", "status": "skipped_missing_source"})
            continue
        down = run(compose(str(ctx[project_key]), source, "down", "-v"), cwd=source, timeout=600)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_down", "returncode": down.returncode, "stdout": down.stdout[-4000:], "stderr": down.stderr[-4000:]})
        if down.returncode != 0:
            return {"status": "failed", "steps": steps}
    if remove_files and install_root.exists():
        if not is_within(install_root, ROOT / "installer" / "runtime"):
            raise InstallerError(f"Refusing to remove files outside installer/runtime: {install_root}")
        shutil.rmtree(install_root)
        steps.append({"step": "remove_install_root", "path": str(install_root.relative_to(ROOT)), "status": "removed"})
    return {"status": "passed", "selected_modules": modules, "steps": steps}


def write_report(report_dir: Path, payload: dict[str, object]) -> None:
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "clerk-core-installer-lifecycle.json").write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Run CivicSuite clerk-core installer lifecycle.")
    parser.add_argument("mode", choices=("readiness", "install", "verify", "repair", "uninstall"))
    parser.add_argument("--install-root", default=str(DEFAULT_INSTALL_ROOT))
    parser.add_argument("--run-id", default=None)
    parser.add_argument("--records-api-port", type=int, default=None)
    parser.add_argument("--records-web-port", type=int, default=None)
    parser.add_argument("--clerk-api-port", type=int, default=None)
    parser.add_argument("--clerk-web-port", type=int, default=None)
    parser.add_argument("--port-offset", type=int, default=None)
    parser.add_argument("--compose-project-suffix", default=None)
    parser.add_argument("--remove-files", action="store_true")
    parser.add_argument(
        "--module",
        action="append",
        choices=SELECTABLE_MODULES,
        default=None,
        help="Install or verify one selectable module. Repeat for both. Defaults to civicrecords-ai and civicclerk.",
    )
    parser.add_argument(
        "--staff-mode",
        choices=(CLERK_STAFF_MODE_PROTECTED, CLERK_STAFF_MODE_OPEN),
        default=CLERK_STAFF_MODE_PROTECTED,
        help="CivicClerk staff auth default for install/repair. Open mode is explicit local-rehearsal opt-in.",
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
        "mutates_host": args.mode in {"install", "repair", "uninstall"},
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
                )
            )
        elif args.mode == "verify":
            payload.update(
                verify(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
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
