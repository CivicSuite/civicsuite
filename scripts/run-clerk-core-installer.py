"""Run the CivicSuite clerk-core installer lifecycle from a release bundle."""

from __future__ import annotations

import argparse
import base64
import json
import os
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
DEFAULT_INSTALL_ROOT = ROOT / "installer" / "runtime" / "clerk-core"

RECORDS_PORTS = {"api": 18000, "web": 18080}
CLERK_PORTS = {"api": 18776, "web": 18081}
CLERK_STAFF_MODE_PROTECTED = "protected"
CLERK_STAFF_MODE_OPEN = "open"
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
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        timeout=timeout,
    )


def require_command(name: str) -> str:
    found = shutil.which(name)
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
        "backend/.venv",
    )
    shutil.copytree(source, target, ignore=ignore)
    ledger = source / "docs" / "ops" / "tier1-retrofit-ledger.json"
    if ledger.is_file():
        ledger_target = target / "docs" / "ops" / "tier1-retrofit-ledger.json"
        ledger_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ledger, ledger_target)


def write_records_env(target: Path) -> None:
    if target.is_file():
        return
    values = {
        "DATABASE_URL": "postgresql+asyncpg://civicrecords:civicrecords@postgres:5432/civicrecords",
        "JWT_SECRET": secrets.token_hex(32),
        "FIRST_ADMIN_EMAIL": "admin@example.gov",
        "FIRST_ADMIN_PASSWORD": f"ClerkCore-{secrets.token_hex(16)}",
        "OLLAMA_BASE_URL": "http://ollama:11434",
        "REDIS_URL": "redis://redis:6379/0",
        "AUDIT_RETENTION_DAYS": "1095",
        "CONNECTOR_HOST_ALLOWLIST": "",
        "PORTAL_MODE": "private",
        "ENCRYPTION_KEY": base64.urlsafe_b64encode(os.urandom(32)).decode(),
    }
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def write_records_override(target: Path) -> Path:
    path = target / "docker-compose.civicsuite.override.yml"
    path.write_text(
        f"""services:
  api:
    ports:
      - "{RECORDS_PORTS['api']}:8000"
  frontend:
    ports:
      - "{RECORDS_PORTS['web']}:80"
""",
        encoding="utf-8",
        newline="\n",
    )
    return path


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


def write_clerk_env(target: Path, *, staff_mode: str = CLERK_STAFF_MODE_PROTECTED) -> None:
    if target.is_file():
        return
    values = {
        "CIVICCLERK_POSTGRES_USER": "civicclerk",
        "CIVICCLERK_POSTGRES_PASSWORD": secrets.token_hex(24),
        "CIVICCLERK_POSTGRES_DB": "civicclerk",
        "CIVICCLERK_API_PORT": str(CLERK_PORTS["api"]),
        "CIVICCLERK_WEB_PORT": str(CLERK_PORTS["web"]),
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
    command = ["docker", "compose", "-p", project, "-f", "docker-compose.yml"]
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


def verify_clerk_protected_default() -> dict[str, object]:
    base = f"http://127.0.0.1:{CLERK_PORTS['api']}"
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


def lifecycle_context(install_root: Path) -> dict[str, Path | str]:
    if not is_within(install_root, ROOT):
        raise InstallerError(f"Install root must stay inside this bundle/repo: {install_root}")
    return {
        "install_root": install_root,
        "records_source": install_root / "sources" / "civicrecords-ai",
        "clerk_source": install_root / "sources" / "civicclerk",
        "records_project": "civicsuite-clerk-core-records",
        "clerk_project": "civicsuite-clerk-core-clerk",
    }


def prepare_sources(
    install_root: Path,
    *,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
) -> dict[str, Path | str]:
    ctx = lifecycle_context(install_root)
    install_root.mkdir(parents=True, exist_ok=True)
    copy_source(source_root("civicrecords-ai"), ctx["records_source"])  # type: ignore[arg-type]
    copy_source(source_root("civicclerk"), ctx["clerk_source"])  # type: ignore[arg-type]
    normalize_records_frontend_dockerfile(ctx["records_source"])  # type: ignore[arg-type]
    write_records_env(ctx["records_source"] / ".env")  # type: ignore[operator]
    write_records_override(ctx["records_source"])  # type: ignore[arg-type]
    write_clerk_env(ctx["clerk_source"] / ".env", staff_mode=staff_mode)  # type: ignore[operator]
    return ctx


def install(
    install_root: Path,
    *,
    report_dir: Path,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
) -> dict[str, object]:
    require_command("docker")
    docker_info = run(["docker", "info"], cwd=ROOT, timeout=30)
    if docker_info.returncode != 0:
        raise InstallerError(
            "Docker is installed but not running. Start Docker Desktop or Docker Engine, wait for it to be ready, "
            "then rerun install."
        )
    ctx = prepare_sources(install_root, staff_mode=staff_mode)
    steps: list[dict[str, object]] = []
    for name, source_key, project_key, services in (
        ("civicrecords-ai", "records_source", "records_project", ("api", "frontend")),
        ("civicclerk", "clerk_source", "clerk_project", ("api", "frontend")),
    ):
        source = ctx[source_key]  # type: ignore[index]
        project = str(ctx[project_key])
        build = run(compose(project, source, "build", *services), cwd=source, timeout=1800)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_build", "returncode": build.returncode, "stdout": build.stdout[-4000:], "stderr": build.stderr[-4000:]})
        if build.returncode != 0:
            return {"status": "failed", "steps": steps}
        up = run(compose(project, source, "up", "-d", *services), cwd=source, timeout=900)  # type: ignore[arg-type]
        steps.append({"module": name, "step": "compose_up", "returncode": up.returncode, "stdout": up.stdout[-4000:], "stderr": up.stderr[-4000:]})
        if up.returncode != 0:
            return {"status": "failed", "steps": steps}
    result = verify(install_root, report_dir=report_dir)
    steps.extend(result["checks"])  # type: ignore[arg-type]
    status = "passed" if result["status"] == "passed" else "failed"
    return {"status": status, "steps": steps}


def verify(install_root: Path, *, report_dir: Path) -> dict[str, object]:
    lifecycle_context(install_root)
    checks = [
        {"name": "civicrecords_api", "url": f"http://127.0.0.1:{RECORDS_PORTS['api']}/health", **wait_for_url(f"http://127.0.0.1:{RECORDS_PORTS['api']}/health", timeout_seconds=180)},
        {"name": "civicrecords_web", "url": f"http://127.0.0.1:{RECORDS_PORTS['web']}/", **wait_for_url(f"http://127.0.0.1:{RECORDS_PORTS['web']}/", timeout_seconds=120)},
        {"name": "civicclerk_api", "url": f"http://127.0.0.1:{CLERK_PORTS['api']}/health", **wait_for_url(f"http://127.0.0.1:{CLERK_PORTS['api']}/health", timeout_seconds=180)},
        {"name": "civicclerk_web", "url": f"http://127.0.0.1:{CLERK_PORTS['web']}/", **wait_for_url(f"http://127.0.0.1:{CLERK_PORTS['web']}/", timeout_seconds=120)},
    ]
    if checks[2]["status"] == "passed":
        checks.append(verify_clerk_protected_default())
    status = "passed" if all(check["status"] == "passed" for check in checks) else "failed"
    return {"status": status, "checks": checks}


def uninstall(install_root: Path, *, report_dir: Path, remove_files: bool = False) -> dict[str, object]:
    ctx = lifecycle_context(install_root)
    steps: list[dict[str, object]] = []
    for name, source_key, project_key in (
        ("civicrecords-ai", "records_source", "records_project"),
        ("civicclerk", "clerk_source", "clerk_project"),
    ):
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
    return {"status": "passed", "steps": steps}


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
    parser.add_argument("--remove-files", action="store_true")
    parser.add_argument(
        "--staff-mode",
        choices=(CLERK_STAFF_MODE_PROTECTED, CLERK_STAFF_MODE_OPEN),
        default=CLERK_STAFF_MODE_PROTECTED,
        help="CivicClerk staff auth default for install/repair. Open mode is explicit local-rehearsal opt-in.",
    )
    args = parser.parse_args()
    if args.staff_mode == CLERK_STAFF_MODE_OPEN:
        print(CLERK_OPEN_MODE_WARNING, file=sys.stderr)

    run_id = args.run_id or make_run_id()
    report_dir = REPORT_ROOT / run_id
    install_root = Path(args.install_root).resolve()
    payload: dict[str, object] = {
        "run_id": run_id,
        "mode": args.mode,
        "install_root": str(install_root),
        "mutates_host": args.mode in {"install", "repair", "uninstall"},
        "civicclerk_staff_mode": args.staff_mode,
        "status": "failed",
        "started_at": datetime.now(UTC).isoformat(),
        "ports": {"civicrecords-ai": RECORDS_PORTS, "civicclerk": CLERK_PORTS},
    }
    try:
        if args.mode == "readiness":
            require_command("docker")
            info = run(["docker", "info"], cwd=ROOT, timeout=30)
            payload["docker"] = {"returncode": info.returncode, "stdout": info.stdout[-1000:], "stderr": info.stderr[-1000:]}
            payload["status"] = "passed" if info.returncode == 0 else "failed"
        elif args.mode == "install":
            payload.update(install(install_root, report_dir=report_dir, staff_mode=args.staff_mode))
        elif args.mode == "verify":
            payload.update(verify(install_root, report_dir=report_dir))
        elif args.mode == "repair":
            payload.update(install(install_root, report_dir=report_dir, staff_mode=args.staff_mode))
        elif args.mode == "uninstall":
            payload.update(uninstall(install_root, report_dir=report_dir, remove_files=args.remove_files))
    except (InstallerError, subprocess.TimeoutExpired) as exc:
        payload["status"] = "failed"
        payload["error"] = str(exc)
        payload["fix_steps"] = [
            "Confirm Docker is installed, open, and reports a running engine.",
            "Confirm ports 18000, 18080, 18776, and 18081 are free.",
            "Run uninstall, then rerun install if a previous partial stack is present.",
        ]
    finally:
        payload["finished_at"] = datetime.now(UTC).isoformat()
        write_report(report_dir, payload)
        print(json.dumps(payload, indent=2, sort_keys=True))
    return 0 if payload.get("status") == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
