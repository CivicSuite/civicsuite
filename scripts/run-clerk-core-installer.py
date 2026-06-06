"""Run the CivicSuite clerk-core installer lifecycle from a release bundle."""

from __future__ import annotations

import argparse
import base64
import ctypes
import hashlib
import json
import os
import platform
import re
import secrets
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import UTC, datetime, timedelta
from pathlib import Path
from socket import timeout as SocketTimeout
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "installer" / "modules.json"
REPORT_ROOT = ROOT / "installer" / "reports"
DEFAULT_INSTALL_ROOT = Path(os.environ.get("CIVICSUITE_INSTALLER_INSTALL_ROOT", ROOT / "installer" / "runtime" / "clerk-core"))

DEFAULT_RECORDS_PORTS = {"api": 18000, "web": 18080}
DEFAULT_CLERK_PORTS = {"api": 18776, "web": 18081}
DEFAULT_CODE_PORTS = {"api": 18820}
DEFAULT_PYTHON_MODULE_PORTS = {
    "civiczone": 18830,
    "civicplan": 18840,
    "civicpermit": 18850,
    "civicaccess": 18860,
    "civicinspect": 18861,
    "civicgrants": 18862,
    "civicprocure": 18863,
}
DEFAULT_SUITE_LAUNCHER_PORT = 18082
DEFAULT_EMBEDDING_MODEL = "nomic-embed-text"
DEFAULT_LLM_MODEL = "gemma4:e4b"
MIN_LLM_HOST_MEMORY_GB = 16
MIN_LLM_HOST_MEMORY_BYTES = MIN_LLM_HOST_MEMORY_GB * 1000 * 1000 * 1000
MIN_DOCKER_MEMORY_GB = 8
MIN_DOCKER_MEMORY_BYTES = MIN_DOCKER_MEMORY_GB * 1000 * 1000 * 1000
RESPONSE_LETTER_TIMEOUT_SECONDS = 180
RESPONSE_LETTER_LLM_TIMEOUT_SECONDS = 120
OLLAMA_PREWARM_TIMEOUT_SECONDS = 300
OLLAMA_KEEP_ALIVE = "30m"
HOST_OLLAMA_NUM_CTX = 1024
HOST_OLLAMA_SMALL_NUM_CTX = 512
HOST_OLLAMA_TINY_NUM_CTX = 256
HOST_OLLAMA_PROBE_PROFILES = (
    {"name": "gpu_bounded", "options": {"num_ctx": HOST_OLLAMA_NUM_CTX}},
    {"name": "gpu_low_vram", "options": {"num_ctx": HOST_OLLAMA_NUM_CTX, "low_vram": True}},
    {
        "name": "gpu_8_layers_low_batch",
        "options": {"num_ctx": HOST_OLLAMA_NUM_CTX, "num_gpu": 8, "low_vram": True, "num_batch": 64},
    },
    {
        "name": "gpu_4_layers_low_batch",
        "options": {"num_ctx": HOST_OLLAMA_NUM_CTX, "num_gpu": 4, "low_vram": True, "num_batch": 32},
    },
    {
        "name": "gpu_1_layer_tiny_batch",
        "options": {"num_ctx": HOST_OLLAMA_SMALL_NUM_CTX, "num_gpu": 1, "low_vram": True, "num_batch": 16},
    },
    {"name": "cpu_bounded", "options": {"num_ctx": HOST_OLLAMA_NUM_CTX, "num_gpu": 0}},
    {"name": "cpu_small_context", "options": {"num_ctx": HOST_OLLAMA_SMALL_NUM_CTX, "num_gpu": 0}},
    {
        "name": "cpu_tiny_batch",
        "options": {
            "num_ctx": HOST_OLLAMA_TINY_NUM_CTX,
            "num_gpu": 0,
            "num_batch": 1,
            "use_mmap": True,
            "use_mlock": False,
        },
    },
)
HOST_OLLAMA_NATIVE_DEFAULT_PROFILE = {"name": "native_default", "options": None}
HOST_OLLAMA_MODEL_LOAD_PROFILES = (HOST_OLLAMA_NATIVE_DEFAULT_PROFILE, *HOST_OLLAMA_PROBE_PROFILES)
# Host-Ollama mode: use the Windows host's native (GPU) Ollama and the per-module
# docker-compose.host-ollama.yml variant (which disables the in-container CPU Ollama and
# routes api/worker to host.docker.internal) instead of the containerized CPU Ollama.
# Set from --host-ollama / --ollama-exe in main(). Default off: other install paths unchanged.
USE_HOST_OLLAMA = False
HOST_OLLAMA_EXE = "ollama"
HOST_OLLAMA_PORT = 11434
HOST_OLLAMA_SERVER_PROCESS: subprocess.Popen[bytes] | None = None
CODE_QA_TIMEOUT_SECONDS = 60
CIVICCODE_OLLAMA_TIMEOUT_SECONDS = 8
SUITE_LAUNCHER_SOURCE = ROOT / "installer" / "runtime" / "suite-launcher"
SUITE_LAUNCHER_DIR_NAME = "suite-launcher"
SUITE_SESSION_ENV = "CIVICCORE_SUITE_SESSION_SECRET"
SUITE_SESSION_REVOCATION_ENV = "CIVICCORE_SUITE_SESSION_REVOCATION_FILE"
SUITE_SESSION_FILE_NAME = "civiccore_suite_session_value"
SUITE_SESSION_REVOCATION_FILE_NAME = "civiccore_suite_session_revocations.json"
SUITE_SESSION_REVOCATION_CONTAINER_PATH = f"/civicsuite-shared/{SUITE_SESSION_REVOCATION_FILE_NAME}"
SUITE_SHARED_BIND = "../../shared:/civicsuite-shared"
MODULE_RECORDS = "civicrecords-ai"
MODULE_CLERK = "civicclerk"
MODULE_CODE = "civiccode"
PYTHON_SERVICE_MODULES = (
    "civiczone",
    "civicplan",
    "civicpermit",
    "civicaccess",
    "civicinspect",
    "civicgrants",
    "civicprocure",
)
SELECTABLE_MODULES = (MODULE_RECORDS, MODULE_CLERK, MODULE_CODE, *PYTHON_SERVICE_MODULES)
DEFAULT_SELECTED_MODULES = (MODULE_RECORDS, MODULE_CLERK)
EXPECTED_CIVICCORE_VERSION = "1.2.0"
EXPECTED_RECORDS_VERSION = "1.7.3"
EXPECTED_CLERK_VERSION = "1.0.3"
EXPECTED_CODE_VERSION = "1.0.8"
SELECTED_MODULES_FILE = "selected-modules.json"
INSTALL_PROVENANCE_FILE = "civicsuite-install-provenance.json"
BACKUPS_DIR = "backups"
CLERK_STAFF_MODE_PROTECTED = "protected"
CLERK_STAFF_MODE_OPEN = "open"
CLERK_STAFF_MODE_BEARER = "bearer"
CLERK_WORKFLOW_PROOF_BEARER = "clerk-core-workflow-proof"
WINDOWS_DOCKER_DESKTOP_BIN = Path("C:/Program Files/Docker/Docker/resources/bin")
COMPOSE_BUILD_RETRY_ATTEMPTS = 2
COMPOSE_BUILD_RETRY_DELAY_SECONDS = 15
TRANSIENT_DOCKER_BUILD_PATTERNS = (
    "failed to receive status",
    "rpc error: code = unavailable",
    "error reading from server: eof",
    "dockerdesktoplinuxengine",
    "500 internal server error",
)
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
    if len(slug) > 48:
        digest = hashlib.sha256(slug.encode("utf-8")).hexdigest()[:8]
        slug = f"{slug[:39].rstrip('-_')}-{digest}"
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
    python_module_ports = {
        module: {"api": port + resolved_offset}
        for module, port in DEFAULT_PYTHON_MODULE_PORTS.items()
    }
    launcher_ports = {
        "web": DEFAULT_SUITE_LAUNCHER_PORT,
    }
    return {
        "isolation_id": suffix,
        "port_offset": resolved_offset,
        "ports": {
            "civicrecords-ai": records_ports,
            "civicclerk": clerk_ports,
            "civiccode": code_ports,
            **python_module_ports,
            "suite-launcher": launcher_ports,
        },
        "compose_projects": {
            "civicrecords-ai": f"civicsuite-{suffix}-records",
            "civicclerk": f"civicsuite-{suffix}-clerk",
            "civiccode": f"civicsuite-{suffix}-code",
        },
        "shared_network": f"civicsuite-{suffix}-citycore",
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


def is_transient_docker_build_failure(proc: subprocess.CompletedProcess[str]) -> bool:
    if proc.returncode == 0:
        return False
    output = f"{proc.stdout}\n{proc.stderr}".lower()
    return any(pattern in output for pattern in TRANSIENT_DOCKER_BUILD_PATTERNS)


def run_compose_build_with_retry(
    project: str,
    source: Path,
    *services: str,
) -> tuple[subprocess.CompletedProcess[str], list[dict[str, object]]]:
    attempts: list[dict[str, object]] = []
    final = subprocess.CompletedProcess([], 1, stdout="", stderr="compose build did not run")
    for attempt in range(1, COMPOSE_BUILD_RETRY_ATTEMPTS + 1):
        final = run(
            compose(project, source, "build", "--pull", "--no-cache", *services),
            cwd=source,
            timeout=2400,
        )
        retryable = is_transient_docker_build_failure(final)
        attempt_record: dict[str, object] = {
            "attempt": attempt,
            "returncode": final.returncode,
            "stdout": final.stdout[-4000:],
            "stderr": final.stderr[-4000:],
            "transient_retryable": retryable,
        }
        attempts.append(attempt_record)
        if final.returncode == 0:
            break
        if not retryable or attempt == COMPOSE_BUILD_RETRY_ATTEMPTS:
            break
        attempt_record["retry_after_seconds"] = COMPOSE_BUILD_RETRY_DELAY_SECONDS
        time.sleep(COMPOSE_BUILD_RETRY_DELAY_SECONDS)
    return final, attempts


def compose_logs(project: str, source: Path, *services: str) -> dict[str, object]:
    proc = run(
        compose(project, source, "logs", "--no-color", "--tail", "200", *services),
        cwd=source,
        timeout=120,
    )
    return {
        "returncode": proc.returncode,
        "stdout": proc.stdout[-12000:],
        "stderr": proc.stderr[-4000:],
    }


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
    env.setdefault("COMPOSE_PARALLEL_LIMIT", "1")
    if USE_HOST_OLLAMA:
        env["OLLAMA_HOST"] = host_ollama_local_host()
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


def host_memory_bytes() -> int | None:
    system = platform.system().lower()
    if system == "windows":
        class MemoryStatusEx(ctypes.Structure):
            _fields_ = [
                ("dwLength", ctypes.c_ulong),
                ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]

        status = MemoryStatusEx()
        status.dwLength = ctypes.sizeof(MemoryStatusEx)
        if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):
            return int(status.ullTotalPhys)
        return None
    if system in {"linux", "darwin"}:
        try:
            pages = os.sysconf("SC_PHYS_PAGES")
            page_size = os.sysconf("SC_PAGE_SIZE")
        except (AttributeError, OSError, ValueError):
            return None
        if isinstance(pages, int) and isinstance(page_size, int) and pages > 0 and page_size > 0:
            return pages * page_size
    return None


def parse_memory_size_bytes(value: str) -> int | None:
    match = re.search(r"(?P<number>\d+(?:\.\d+)?)\s*(?P<unit>[kmgt]?i?b|bytes?)", value, re.IGNORECASE)
    if not match:
        return None
    number = float(match.group("number"))
    unit = match.group("unit").lower()
    multipliers = {
        "b": 1,
        "byte": 1,
        "bytes": 1,
        "kb": 1000,
        "kib": 1024,
        "mb": 1000**2,
        "mib": 1024**2,
        "gb": 1000**3,
        "gib": 1024**3,
        "tb": 1000**4,
        "tib": 1024**4,
    }
    multiplier = multipliers.get(unit)
    if multiplier is None:
        return None
    return int(number * multiplier)


def docker_memory_bytes_from_info(stdout: str) -> int | None:
    stripped = stdout.strip()
    if not stripped:
        return None
    if stripped.isdigit():
        return int(stripped)
    for line in stripped.splitlines():
        if "total memory" not in line.lower():
            continue
        parsed = parse_memory_size_bytes(line)
        if parsed is not None:
            return parsed
    return None


def model_resource_readiness_check(docker_info_stdout: str) -> dict[str, object]:
    detected_host_memory = host_memory_bytes()
    detected_docker_memory = docker_memory_bytes_from_info(docker_info_stdout)
    host_ok = detected_host_memory is not None and detected_host_memory >= MIN_LLM_HOST_MEMORY_BYTES
    docker_ok = detected_docker_memory is not None and detected_docker_memory >= MIN_DOCKER_MEMORY_BYTES
    notes: list[str] = []
    if not host_ok:
        notes.append(
            f"Host RAM is below the advisory {MIN_LLM_HOST_MEMORY_GB} GB floor for {DEFAULT_LLM_MODEL}; "
            "host-Ollama readiness will still use the actual model-load probe as the deciding check."
        )
    if not docker_ok:
        notes.append(
            f"Docker Desktop / WSL2 memory is below the advisory {MIN_DOCKER_MEMORY_GB} GB floor; "
            "this is not a blocker when --host-ollama keeps the LLM outside Docker."
        )
    return {
        "name": "ollama_model_resources",
        "status": "passed",
        "model": DEFAULT_LLM_MODEL,
        "host_ollama": USE_HOST_OLLAMA,
        "detected_host_memory_bytes": detected_host_memory,
        "advisory_host_memory_bytes": MIN_LLM_HOST_MEMORY_BYTES,
        "advisory_host_memory_gb": MIN_LLM_HOST_MEMORY_GB,
        "detected_docker_memory_bytes": detected_docker_memory,
        "advisory_docker_memory_bytes": MIN_DOCKER_MEMORY_BYTES,
        "advisory_docker_memory_gb": MIN_DOCKER_MEMORY_GB,
        "notes": notes,
    }


def host_ollama_local_host() -> str:
    return f"127.0.0.1:{HOST_OLLAMA_PORT}"


def host_ollama_local_base_url() -> str:
    return f"http://{host_ollama_local_host()}"


def host_ollama_container_base_url() -> str:
    return f"http://host.docker.internal:{HOST_OLLAMA_PORT}"


def host_ollama_tags_check() -> dict[str, object]:
    url = f"{host_ollama_local_base_url()}/api/tags"
    request = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=3) as response:
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return {"status": "failed", "url": url, "returncode": 1, "stderr": f"HTTP {exc.code}: {body}"}
    except urllib.error.URLError as exc:
        return {"status": "failed", "url": url, "returncode": 1, "stderr": str(exc)}
    except (TimeoutError, SocketTimeout) as exc:
        return {"status": "failed", "url": url, "returncode": 124, "stderr": f"Host Ollama tags probe timed out: {exc}"}
    return {"status": "passed", "url": url, "returncode": 0, "stdout": body[-2000:]}


def ensure_host_ollama_server() -> dict[str, object]:
    global HOST_OLLAMA_SERVER_PROCESS
    first_check = host_ollama_tags_check()
    if first_check["status"] == "passed":
        return {"status": "passed", "mode": "already_running", "port": HOST_OLLAMA_PORT, "check": first_check}
    env = installer_subprocess_env()
    env["OLLAMA_HOST"] = host_ollama_local_host()
    try:
        proc = subprocess.Popen(
            [HOST_OLLAMA_EXE, "serve"],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0,
        )
    except OSError as exc:
        return {"status": "failed", "mode": "start_failed", "port": HOST_OLLAMA_PORT, "stderr": str(exc)}
    HOST_OLLAMA_SERVER_PROCESS = proc
    deadline = time.time() + 60
    checks: list[dict[str, object]] = [first_check]
    while time.time() < deadline:
        check = host_ollama_tags_check()
        checks.append(check)
        if check["status"] == "passed":
            return {
                "status": "passed",
                "mode": "started",
                "port": HOST_OLLAMA_PORT,
                "pid": proc.pid,
                "checks": checks[-5:],
            }
        if proc.poll() is not None:
            return {
                "status": "failed",
                "mode": "exited",
                "port": HOST_OLLAMA_PORT,
                "pid": proc.pid,
                "returncode": proc.returncode,
                "checks": checks[-5:],
            }
        time.sleep(1)
    return {"status": "failed", "mode": "timeout", "port": HOST_OLLAMA_PORT, "pid": proc.pid, "checks": checks[-5:]}


def host_ollama_model_load_readiness_check() -> dict[str, object]:
    attempts: list[dict[str, object]] = []
    selected_profile: object = None
    initial_cleanup: object = None
    server: object = None
    try:
        result = host_ollama_generate_with_fallback("Respond with OK.")
        returncode = int(result["returncode"])
        stdout = str(result["stdout"])[-4000:]
        stderr = str(result["stderr"])[-4000:]
        attempts = list(result.get("attempts", []))  # type: ignore[arg-type]
        selected_profile = result.get("selected_profile") if returncode == 0 else None
        server = result.get("server")
        initial_cleanup = result.get("initial_cleanup")
    except subprocess.TimeoutExpired as exc:
        returncode = 124
        stdout = (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else ""
        stderr = (
            f"Host Ollama model readiness probe exceeded {OLLAMA_PREWARM_TIMEOUT_SECONDS}s."
        )
    status = "passed" if returncode == 0 else "failed"
    return {
        "name": "host_ollama_model_load",
        "status": status,
        "model": DEFAULT_LLM_MODEL,
        "base_url": host_ollama_local_base_url(),
        "container_base_url": host_ollama_container_base_url(),
        "server": server,
        "timeout_seconds": OLLAMA_PREWARM_TIMEOUT_SECONDS,
        "num_ctx": HOST_OLLAMA_NUM_CTX,
        "small_num_ctx": HOST_OLLAMA_SMALL_NUM_CTX,
        "tiny_num_ctx": HOST_OLLAMA_TINY_NUM_CTX,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "selected_profile": selected_profile,
        "initial_cleanup": initial_cleanup,
        "attempts": attempts,
        "returncode": returncode,
        "stdout": stdout,
        "stderr": stderr,
        "fix_steps": []
        if status == "passed"
        else [
            f"Host Ollama did not load {DEFAULT_LLM_MODEL} successfully.",
            "Confirm the model runs in host Ollama on this machine, then rerun readiness before install.",
            "If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.",
        ],
    }


def host_ollama_generate(prompt: str, profile: dict[str, object] | None = None) -> dict[str, object]:
    selected_profile = profile or HOST_OLLAMA_PROBE_PROFILES[0]
    payload = {
        "model": DEFAULT_LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": OLLAMA_KEEP_ALIVE,
    }
    if selected_profile["options"] is not None:
        payload["options"] = dict(selected_profile["options"])  # type: ignore[arg-type]
    request = urllib.request.Request(
        f"{host_ollama_local_base_url()}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=OLLAMA_PREWARM_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return {
            "returncode": 1,
            "stdout": "",
            "stderr": f"HTTP {exc.code}: {body}",
            "profile": selected_profile["name"],
            "request": payload,
        }
    except urllib.error.URLError as exc:
        return {
            "returncode": 1,
            "stdout": "",
            "stderr": str(exc),
            "profile": selected_profile["name"],
            "request": payload,
        }
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {
            "returncode": 1,
            "stdout": body,
            "stderr": "Invalid JSON response from Ollama.",
            "profile": selected_profile["name"],
            "request": payload,
        }
    return {
        "returncode": 0,
        "stdout": str(data.get("response", "")),
        "stderr": "",
        "profile": selected_profile["name"],
        "request": payload,
    }


def host_ollama_unload() -> dict[str, object]:
    payload = {
        "model": DEFAULT_LLM_MODEL,
        "prompt": "",
        "stream": False,
        "keep_alive": 0,
    }
    request = urllib.request.Request(
        f"{host_ollama_local_base_url()}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return {"returncode": 1, "stdout": "", "stderr": f"HTTP {exc.code}: {body}", "request": payload}
    except urllib.error.URLError as exc:
        return {"returncode": 1, "stdout": "", "stderr": str(exc), "request": payload}
    return {"returncode": 0, "stdout": body[-2000:], "stderr": "", "request": payload}


def host_ollama_stop_orphan_servers() -> dict[str, object]:
    if os.name == "nt":
        commands = [
            ["taskkill", "/F", "/IM", "llama-server.exe"],
            ["taskkill", "/F", "/IM", "ollama_llama_server.exe"],
        ]
    else:
        commands = [
            ["pkill", "-f", "llama-server"],
            ["pkill", "-f", "ollama_llama_server"],
        ]
    results: list[dict[str, object]] = []
    for command in commands:
        proc = subprocess.run(command, capture_output=True, text=True, timeout=30)
        results.append(
            {
                "command": command,
                "returncode": proc.returncode,
                "stdout": proc.stdout[-2000:],
                "stderr": proc.stderr[-2000:],
            }
        )
    return {"returncode": 0 if any(int(result["returncode"]) == 0 for result in results) else 1, "results": results}


def host_ollama_cleanup_runtime() -> dict[str, object]:
    unload = host_ollama_unload()
    stop = host_ollama_stop_orphan_servers()
    return {"unload": unload, "stop_orphan_servers": stop}


def host_ollama_cleanup_access_denied(cleanup: dict[str, object]) -> bool:
    stop = cleanup.get("stop_orphan_servers")
    if not isinstance(stop, dict):
        return False
    results = stop.get("results")
    if not isinstance(results, list):
        return False
    for result in results:
        if isinstance(result, dict) and "access is denied" in str(result.get("stderr", "")).lower():
            return True
    return False


def host_ollama_generate_with_fallback(prompt: str) -> dict[str, object]:
    attempts: list[dict[str, object]] = []
    last_result: dict[str, object] | None = None
    server = ensure_host_ollama_server()
    if server["status"] != "passed":
        return {
            "returncode": 1,
            "stdout": "",
            "stderr": "Host Ollama server did not become ready on the configured endpoint.",
            "attempts": attempts,
            "selected_profile": None,
            "server": server,
        }
    initial_cleanup = host_ollama_cleanup_runtime()
    if HOST_OLLAMA_PORT == 11434 and host_ollama_cleanup_access_denied(initial_cleanup):
        return {
            "returncode": 1,
            "stdout": "",
            "stderr": (
                "Host Ollama cleanup could not terminate stale llama-server workers: access denied. "
                "Run the elevated Windows bootstrapper or reboot the tester so orphan model workers are cleared before readiness."
            ),
            "attempts": attempts,
            "selected_profile": None,
            "server": server,
            "initial_cleanup": initial_cleanup,
            "cleanup_failed": True,
        }
    for profile in HOST_OLLAMA_MODEL_LOAD_PROFILES:
        result = host_ollama_generate(prompt, profile)
        last_result = result
        options = profile["options"]
        attempts.append(
            {
                "profile": profile["name"],
                "options": dict(options) if options is not None else None,  # type: ignore[arg-type]
                "returncode": int(result["returncode"]),
                "stderr": str(result["stderr"])[-2000:],
            }
        )
        if int(result["returncode"]) == 0:
            result["attempts"] = attempts
            result["selected_profile"] = profile["name"]
            result["server"] = server
            result["initial_cleanup"] = initial_cleanup
            return result
        cleanup = host_ollama_cleanup_runtime()
        unload = cleanup["unload"]  # type: ignore[index]
        stop = cleanup["stop_orphan_servers"]  # type: ignore[index]
        attempts[-1]["unload_returncode"] = int(unload["returncode"])  # type: ignore[index]
        attempts[-1]["unload_stderr"] = str(unload["stderr"])[-1000:]  # type: ignore[index]
        attempts[-1]["stop_orphan_servers"] = stop
    assert last_result is not None
    last_result["attempts"] = attempts
    last_result["selected_profile"] = None
    last_result["server"] = server
    last_result["initial_cleanup"] = initial_cleanup
    return last_result


def source_root(module_name: str) -> Path:
    bundled = ROOT / "modules" / module_name
    if bundled.is_dir():
        return enforce_source_commit(module_name, bundled)
    sibling = ROOT.parent / module_name
    if sibling.is_dir():
        return enforce_source_commit(module_name, sibling)
    raise InstallerError(
        f"Missing source for {module_name}. Expected bundled source at {bundled} or local checkout at {sibling}."
    )


def module_repo(module_name: str) -> str | None:
    if not MANIFEST.is_file():
        return None
    try:
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise InstallerError(f"Invalid installer manifest: {MANIFEST}") from exc
    modules = payload.get("modules", []) if isinstance(payload, dict) else []
    if not isinstance(modules, list):
        raise InstallerError("Installer manifest modules must be a list.")
    for module in modules:
        if isinstance(module, dict) and module.get("id") == module_name:
            repo = module.get("repo")
            return str(repo) if repo else None
    return None


def fetch_source_archive(module_name: str, target: Path) -> Path:
    declared = declared_source_commit(module_name)
    repo = module_repo(module_name)
    if not declared or not repo:
        raise InstallerError(
            f"Cannot fetch source for {module_name}: installer/modules.json must declare repo and source_commit."
        )
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_dir():
        return enforce_source_commit(module_name, target)
    archive_url = f"https://github.com/{repo}/archive/{urllib.parse.quote(declared)}.zip"
    archive_path = target.parent / f"{module_name}-{declared}.zip"
    extract_root = target.parent / f".{module_name}-{declared}-extract"
    if extract_root.exists():
        shutil.rmtree(extract_root)
    try:
        with urllib.request.urlopen(archive_url, timeout=120) as response:
            archive_path.write_bytes(response.read())
        with zipfile.ZipFile(archive_path) as archive:
            archive.extractall(extract_root)
    except (urllib.error.URLError, zipfile.BadZipFile, OSError) as exc:
        raise InstallerError(
            f"Failed to fetch source for {module_name} from {archive_url}: {exc}"
        ) from exc
    extracted_dirs = [path for path in extract_root.iterdir() if path.is_dir()]
    if len(extracted_dirs) != 1:
        raise InstallerError(
            f"Unexpected source archive layout for {module_name}: expected one root directory, found {len(extracted_dirs)}."
        )
    shutil.move(str(extracted_dirs[0]), str(target))
    (target / "SOURCE_COMMIT.txt").write_text(declared + "\n", encoding="utf-8")
    shutil.rmtree(extract_root, ignore_errors=True)
    try:
        archive_path.unlink()
    except OSError:
        pass
    return enforce_source_commit(module_name, target)


def source_root_for_install(module_name: str, install_root: Path) -> Path:
    try:
        return source_root(module_name)
    except InstallerError as exc:
        bundled = ROOT / "modules" / module_name
        sibling = ROOT.parent / module_name
        cache = install_root / "source-cache" / module_name
        try:
            return fetch_source_archive(module_name, cache)
        except InstallerError as fetch_exc:
            raise InstallerError(
                f"{exc} Also failed to fetch source into install cache at {cache}: {fetch_exc}"
            ) from fetch_exc


def declared_source_commit(module_name: str) -> str | None:
    if not MANIFEST.is_file():
        return None
    try:
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise InstallerError(f"Invalid installer manifest: {MANIFEST}") from exc
    modules = payload.get("modules", []) if isinstance(payload, dict) else []
    if not isinstance(modules, list):
        raise InstallerError("Installer manifest modules must be a list.")
    for module in modules:
        if isinstance(module, dict) and module.get("id") == module_name:
            value = module.get("source_commit")
            return str(value) if value else None
    return None


def read_source_commit(source: Path) -> str:
    marker = source / "SOURCE_COMMIT.txt"
    if marker.is_file():
        return marker.read_text(encoding="utf-8").strip()
    proc = subprocess.run(
        ["git", "-C", str(source), "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout).strip()
        raise InstallerError(f"Cannot read source commit for {source}: {detail}")
    return proc.stdout.strip()


def enforce_source_commit(module_name: str, source: Path) -> Path:
    declared = declared_source_commit(module_name)
    if not declared:
        return source
    actual = read_source_commit(source)
    if actual != declared:
        raise InstallerError(
            f"Source commit mismatch for {module_name}: modules.json declares {declared}, "
            f"but {source} is at {actual}. Checkout the declared commit, or update "
            "installer/modules.json to reflect the current source-root state."
        )
    return source


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


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def install_provenance_path(install_root: Path) -> Path:
    return install_root / INSTALL_PROVENANCE_FILE


def expected_install_provenance(modules: list[str]) -> dict[str, object]:
    return {
        "schema": "civicsuite.install-provenance.v1",
        "modules": modules,
        "manifest_path": str(MANIFEST.relative_to(ROOT)),
        "manifest_sha256": sha256_file(MANIFEST) if MANIFEST.is_file() else None,
        "module_source_commits": {module: declared_source_commit(module) for module in modules},
    }


def write_install_provenance(install_root: Path, modules: list[str]) -> Path:
    payload = expected_install_provenance(modules)
    payload["created_at"] = datetime.now(UTC).isoformat()
    path = install_provenance_path(install_root)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path


def verify_install_provenance(install_root: Path, modules: list[str]) -> dict[str, object]:
    path = install_provenance_path(install_root)
    if not path.is_file():
        return {
            "name": "install_provenance",
            "status": "failed",
            "path": str(path),
            "fix_steps": ["Run install or repair with the current package so the install provenance file is written."],
        }
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return {"name": "install_provenance", "status": "failed", "path": str(path), "error": str(exc)}
    expected = expected_install_provenance(modules)
    mismatches = {
        key: {"expected": expected[key], "actual": payload.get(key)}
        for key in ("schema", "modules", "manifest_sha256", "module_source_commits")
        if payload.get(key) != expected[key]
    }
    return {
        "name": "install_provenance",
        "status": "passed" if not mismatches else "failed",
        "path": str(path),
        "expected": expected,
        "actual": payload,
        "mismatches": mismatches,
        "fix_steps": [
            "This install root was not created from the current package manifest. Reinstall or repair from the current package, then rerun verify."
        ]
        if mismatches
        else [],
    }


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


def ensure_env_value(path: Path, name: str, value: str) -> None:
    values = parse_env_file(path)
    if values.get(name):
        return
    existing = path.read_text(encoding="utf-8") if path.is_file() else ""
    line_prefix = "" if not existing or existing.endswith("\n") else "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(f"{line_prefix}{name}={value}\n")


def set_env_value(path: Path, name: str, value: str) -> None:
    """Update-or-add an env var in a KEY=VALUE file.

    Unlike ensure_env_value (which only adds when the key is absent), this rewrites
    an existing key to the new value. Used to upgrade a stale .env from a prior run
    (e.g. a CivicClerk .env written in the default protected mode before a workflow
    proof requested bearer) instead of silently keeping the old value.
    """
    lines = path.read_text(encoding="utf-8").splitlines() if path.is_file() else []
    out: list[str] = []
    found = False
    for raw in lines:
        stripped = raw.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            if stripped.split("=", 1)[0].strip() == name:
                out.append(f"{name}={value}")
                found = True
                continue
        out.append(raw)
    if not found:
        out.append(f"{name}={value}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(out) + "\n", encoding="utf-8")


def suite_session_value_path(install_root: Path) -> Path:
    return install_root / "shared" / SUITE_SESSION_FILE_NAME


def suite_session_revocation_path(install_root: Path) -> Path:
    return install_root / "shared" / SUITE_SESSION_REVOCATION_FILE_NAME


def ensure_suite_session_value(install_root: Path) -> tuple[Path, str]:
    path = suite_session_value_path(install_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file():
        value = path.read_text(encoding="utf-8").strip()
        if value:
            return path, value
    value = base64.urlsafe_b64encode(os.urandom(48)).decode("ascii").rstrip("=")
    path.write_text(value + "\n", encoding="utf-8")
    try:
        path.chmod(0o400)
    except OSError:
        pass
    return path, value


def ensure_suite_session_revocation_file(install_root: Path) -> Path:
    path = suite_session_revocation_path(install_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.is_file():
        path.write_text("{}\n", encoding="utf-8")
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return path


def copy_suite_launcher_runtime(
    install_root: Path,
    modules: list[str] | tuple[str, ...],
    ports: dict[str, dict[str, int]] | None = None,
) -> Path:
    if not SUITE_LAUNCHER_SOURCE.is_dir():
        raise InstallerError(f"Suite launcher runtime source missing: {SUITE_LAUNCHER_SOURCE}")
    target = install_root / SUITE_LAUNCHER_DIR_NAME
    shutil.copytree(
        SUITE_LAUNCHER_SOURCE,
        target,
        dirs_exist_ok=True,
        ignore=shutil.ignore_patterns("node_modules", "playwright-report", "test-results"),
    )
    effective_ports = ports or {}

    def module_port(module_name: str, port_name: str, fallback: int) -> int:
        module_ports = effective_ports.get(module_name, {})
        value = module_ports.get(port_name, fallback)
        return int(value)

    launcher_modules = []
    if MODULE_RECORDS in modules:
        records_web_port = module_port(MODULE_RECORDS, "web", DEFAULT_RECORDS_PORTS["web"])
        launcher_modules.append(
            {
                "id": "records",
                "name": "CivicRecords AI",
                "port": records_web_port,
                "href": f"http://127.0.0.1:{records_web_port}/",
                "staffAction": "Review requests",
                "residentAction": "Submit or track records requests",
                "adminAction": "Check index and queue health",
            }
        )
    if MODULE_CLERK in modules:
        clerk_web_port = module_port(MODULE_CLERK, "web", DEFAULT_CLERK_PORTS["web"])
        launcher_modules.append(
            {
                "id": "clerk",
                "name": "CivicClerk",
                "port": clerk_web_port,
                "href": f"http://127.0.0.1:{clerk_web_port}/",
                "staffAction": "Prepare agendas and minutes",
                "residentAction": "View meetings and notices",
                "adminAction": "Check meeting service health",
            }
        )
    if MODULE_CODE in modules:
        code_api_port = module_port(MODULE_CODE, "api", DEFAULT_CODE_PORTS["api"])
        launcher_modules.append(
            {
                "id": "code",
                "name": "CivicCode",
                "port": code_api_port,
                "href": f"http://127.0.0.1:{code_api_port}/civiccode",
                "staffAction": "Codify adopted ordinances",
                "residentAction": "Search municipal code",
                "adminAction": "Check code search service health",
            }
        )
    module_copy = {
        "civiczone": ("zone", "CivicZone", "Answer zoning and parcel questions", "Lookup zoning guidance"),
        "civicplan": ("plan", "CivicPlan", "Review planning policy context", "Lookup adopted plan policy"),
        "civicpermit": ("permit", "CivicPermit", "Review permit intake readiness", "Check permit requirements"),
        "civicaccess": ("access", "CivicAccess", "Review accessibility/plain-language work", "Request accessible public information"),
        "civicinspect": ("inspect", "CivicInspect", "Draft inspection support work", "Check inspection support status"),
        "civicgrants": ("grants", "CivicGrants", "Triage grant opportunities", "Check grant opportunity support"),
        "civicprocure": ("procure", "CivicProcure", "Draft procurement workpapers", "Review procurement support"),
    }
    for module_name, (launcher_id, display_name, staff_action, resident_action) in module_copy.items():
        if module_name not in modules:
            continue
        port = module_port(module_name, "api", DEFAULT_PYTHON_MODULE_PORTS[module_name])
        launcher_modules.append(
            {
                "id": launcher_id,
                "name": display_name,
                "port": port,
                "href": f"http://127.0.0.1:{port}/{module_name}",
                "staffAction": staff_action,
                "residentAction": resident_action,
                "adminAction": f"Check {display_name} service health",
            }
        )
    config = {
        "component": "suite-launcher",
        "port": DEFAULT_SUITE_LAUNCHER_PORT,
        "url": f"http://127.0.0.1:{DEFAULT_SUITE_LAUNCHER_PORT}/",
        "modules": launcher_modules,
        "shared_staff_session": {
            "env_var": SUITE_SESSION_ENV,
            "value_source": "installer runtime generated value",
            "value_persisted_in_report": False,
        },
    }
    (target / "civicsuite-launcher-config.json").write_text(
        json.dumps(config, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (target / "civicsuite-launcher-config.js").write_text(
        "window.CIVICSUITE_LAUNCHER_CONFIG = "
        + json.dumps(config, indent=2, sort_keys=True)
        + ";\n",
        encoding="utf-8",
    )
    return target


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
    # Always materialize the module source into the runtime dir. Merge into any existing
    # (possibly stale/partial) dir from a prior run rather than skipping on existence: a
    # leftover dir holding only generated files (.env / override / data) must still receive
    # docker-compose.yml + Dockerfiles + app source, or compose_build fails "file not found".
    # dirs_exist_ok merges — it does not delete runtime data/ or the generated files (which
    # are written after this call), and re-copied pristine source is re-normalized idempotently.
    shutil.copytree(source, target, ignore=ignore, dirs_exist_ok=True)
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


def records_portal_mode_for_modules(modules: list[str] | tuple[str, ...]) -> str:
    return "public" if MODULE_CODE in modules else "private"


def uses_suite_runtime(modules: list[str] | tuple[str, ...]) -> bool:
    return (
        MODULE_RECORDS in modules
        and MODULE_CLERK in modules
        and MODULE_CODE in modules
    )


def python_service_source_key(module_name: str) -> str:
    return f"{module_name.replace('-', '_')}_source"


def python_service_dir(install_root: Path, module_name: str) -> Path:
    return install_root / "python-services" / module_name


def python_service_pid_path(install_root: Path, module_name: str) -> Path:
    return python_service_dir(install_root, module_name) / "service.pid"


def python_service_log_path(install_root: Path, module_name: str) -> Path:
    return python_service_dir(install_root, module_name) / "service.log"


def python_service_python(install_root: Path, module_name: str) -> Path:
    service_dir = python_service_dir(install_root, module_name)
    if os.name == "nt":
        return service_dir / ".venv" / "Scripts" / "python.exe"
    return service_dir / ".venv" / "bin" / "python"


def run_python_service_step(
    command: list[str | Path],
    *,
    cwd: Path,
    timeout: int,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(item) for item in command],
        cwd=cwd,
        timeout=timeout,
        text=True,
        capture_output=True,
        check=False,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0,
    )


def install_python_service_dependencies(
    install_root: Path, module_name: str, source: Path
) -> list[dict[str, object]]:
    service_dir = python_service_dir(install_root, module_name)
    service_dir.mkdir(parents=True, exist_ok=True)
    python_path = python_service_python(install_root, module_name)
    steps: list[dict[str, object]] = []
    if not python_path.is_file():
        venv = run_python_service_step(
            [sys.executable, "-m", "venv", service_dir / ".venv"],
            cwd=source,
            timeout=180,
        )
        steps.append(
            {
                "module": module_name,
                "step": "python_service_create_venv",
                "returncode": venv.returncode,
                "stdout": venv.stdout[-4000:],
                "stderr": venv.stderr[-4000:],
            }
        )
        if venv.returncode != 0:
            return steps
    upgrade = run_python_service_step(
        [python_path, "-m", "pip", "install", "--upgrade", "pip"],
        cwd=source,
        timeout=300,
    )
    steps.append(
        {
            "module": module_name,
            "step": "python_service_pip_upgrade",
            "returncode": upgrade.returncode,
            "stdout": upgrade.stdout[-4000:],
            "stderr": upgrade.stderr[-4000:],
        }
    )
    if upgrade.returncode != 0:
        return steps
    install_pkg = run_python_service_step(
        [python_path, "-m", "pip", "install", "-e", str(source)],
        cwd=source,
        timeout=900,
    )
    steps.append(
        {
            "module": module_name,
            "step": "python_service_install_editable",
            "returncode": install_pkg.returncode,
            "stdout": install_pkg.stdout[-4000:],
            "stderr": install_pkg.stderr[-4000:],
        }
    )
    return steps


def stop_python_service(install_root: Path, module_name: str) -> dict[str, object]:
    pid_path = python_service_pid_path(install_root, module_name)
    if not pid_path.is_file():
        return {"module": module_name, "step": "python_service_stop", "status": "skipped_no_pid"}
    try:
        pid = int(pid_path.read_text(encoding="utf-8").strip())
    except ValueError:
        pid_path.unlink(missing_ok=True)
        return {"module": module_name, "step": "python_service_stop", "status": "removed_invalid_pid"}
    if os.name == "nt":
        result = subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            capture_output=True,
            text=True,
            check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        pid_path.unlink(missing_ok=True)
        return {
            "module": module_name,
            "step": "python_service_stop",
            "returncode": result.returncode,
            "stdout": result.stdout[-4000:],
            "stderr": result.stderr[-4000:],
            "status": "stopped" if result.returncode == 0 else "not_running_or_stopped",
        }
    try:
        os.kill(pid, 15)
    except ProcessLookupError:
        status = "not_running"
    else:
        status = "stopped"
    pid_path.unlink(missing_ok=True)
    return {"module": module_name, "step": "python_service_stop", "status": status, "pid": pid}


def start_python_service(
    install_root: Path,
    module_name: str,
    source: Path,
    *,
    port: int,
) -> dict[str, object]:
    stop_step = stop_python_service(install_root, module_name)
    service_dir = python_service_dir(install_root, module_name)
    service_dir.mkdir(parents=True, exist_ok=True)
    log_path = python_service_log_path(install_root, module_name)
    python_path = python_service_python(install_root, module_name)
    log_handle = log_path.open("ab")
    try:
        proc = subprocess.Popen(
            [
                str(python_path),
                "-m",
                "uvicorn",
                f"{module_name.replace('-', '_')}.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(port),
            ],
            cwd=source,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0,
        )
    finally:
        log_handle.close()
    python_service_pid_path(install_root, module_name).write_text(
        f"{proc.pid}\n", encoding="utf-8"
    )
    health = wait_for_url(f"http://127.0.0.1:{port}/health", timeout_seconds=120)
    return {
        "module": module_name,
        "step": "python_service_start",
        "pid": proc.pid,
        "port": port,
        "log": str(log_path),
        "pre_stop": stop_step,
        "status": health["status"],
        "health": health,
    }


def write_records_env(
    target: Path,
    ports: dict[str, int] | None = None,
    *,
    portal_mode: str = "private",
    suite_session_value: str | None = None,
) -> None:
    if portal_mode not in {"private", "public"}:
        raise InstallerError("CivicRecords PORTAL_MODE must be either 'private' or 'public'.")
    ensure_records_secret_files(target.parent)
    values = {
        "DATABASE_URL": "postgresql+asyncpg://civicrecords:civicrecords@postgres:5432/civicrecords",
        "FIRST_ADMIN_EMAIL": os.environ.get("CIVICSUITE_FIRST_ADMIN_EMAIL", "admin@example.gov"),
        "OLLAMA_BASE_URL": "http://ollama:11434",
        "OLLAMA_KEEP_ALIVE": OLLAMA_KEEP_ALIVE,
        "RESPONSE_LETTER_LLM_TIMEOUT_SECONDS": str(RESPONSE_LETTER_LLM_TIMEOUT_SECONDS),
        "REDIS_URL": "redis://redis:6379/0",
        "AUDIT_RETENTION_DAYS": "1095",
        "CONNECTOR_HOST_ALLOWLIST": "",
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
    values["PORTAL_MODE"] = portal_mode
    if suite_session_value:
        values[SUITE_SESSION_ENV] = suite_session_value
        values[SUITE_SESSION_REVOCATION_ENV] = SUITE_SESSION_REVOCATION_CONTAINER_PATH
    if ports is not None:
        values["CIVICRECORDS_API_PORT"] = str(ports["api"])
        values["CIVICRECORDS_WEB_PORT"] = str(ports["web"])
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def write_records_override(target: Path, ports: dict[str, int]) -> Path:
    path = target / "docker-compose.civicsuite.override.yml"
    path.write_text(
        f"""services:
  api:
    environment:
      {SUITE_SESSION_ENV}: ${{{SUITE_SESSION_ENV}:-}}
      {SUITE_SESSION_REVOCATION_ENV}: {SUITE_SESSION_REVOCATION_CONTAINER_PATH}
    volumes:
      - {SUITE_SHARED_BIND}
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


def write_clerk_handoff_override(target: Path, shared_network: str) -> Path:
    path = target / "docker-compose.civicsuite.override.yml"
    path.write_text(
        f"""services:
  ollama:
    environment:
      OLLAMA_KEEP_ALIVE: {OLLAMA_KEEP_ALIVE}
    networks:
      default: {{}}
      citycore_handoff:
        aliases:
          - citycore-ollama
  api:
    environment:
      {SUITE_SESSION_ENV}: ${{{SUITE_SESSION_ENV}:-}}
      {SUITE_SESSION_REVOCATION_ENV}: {SUITE_SESSION_REVOCATION_CONTAINER_PATH}
    volumes:
      - {SUITE_SHARED_BIND}
    networks:
      default: {{}}
      citycore_handoff: {{}}
networks:
  citycore_handoff:
    external: true
    name: {shared_network}
""",
        encoding="utf-8",
        newline="\n",
    )
    return path


def write_code_handoff_override(target: Path, shared_network: str) -> Path:
    path = target / "docker-compose.civicsuite.override.yml"
    path.write_text(
        f"""services:
  api:
    environment:
      {SUITE_SESSION_ENV}: ${{{SUITE_SESSION_ENV}:-}}
      {SUITE_SESSION_REVOCATION_ENV}: {SUITE_SESSION_REVOCATION_CONTAINER_PATH}
      CIVICCODE_OLLAMA_URL: http://citycore-ollama:11434
      CIVICCODE_OLLAMA_MODEL: {DEFAULT_LLM_MODEL}
      CIVICCODE_OLLAMA_EMBEDDING_URL: http://citycore-ollama:11434
      CIVICCODE_OLLAMA_EMBEDDING_MODEL: {DEFAULT_EMBEDDING_MODEL}
      CIVICCODE_OLLAMA_TIMEOUT_SECONDS: "{CIVICCODE_OLLAMA_TIMEOUT_SECONDS}"
    volumes:
      - {SUITE_SHARED_BIND}
    networks:
      default: {{}}
      citycore_handoff:
        aliases:
          - civiccode-api
networks:
  citycore_handoff:
    external: true
    name: {shared_network}
""",
        encoding="utf-8",
        newline="\n",
    )
    return path


def ensure_shared_network(shared_network: str) -> subprocess.CompletedProcess[str]:
    inspect = run([docker_command(), "network", "inspect", shared_network], cwd=ROOT, timeout=30)
    if inspect.returncode == 0:
        return inspect
    return run([docker_command(), "network", "create", shared_network], cwd=ROOT, timeout=60)


def remove_shared_network(shared_network: str) -> subprocess.CompletedProcess[str]:
    return run([docker_command(), "network", "rm", shared_network], cwd=ROOT, timeout=60)


def ensure_ollama_models(
    ctx: dict[str, object],
    *,
    selected_modules: list[str] | tuple[str, ...] | None = None,
) -> list[dict[str, object]]:
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    requested_modules = set(selected_modules or modules)
    steps: list[dict[str, object]] = []
    targets: list[tuple[str, str, Path]] = []
    if MODULE_RECORDS in modules and MODULE_RECORDS in requested_modules:
        targets.append(
            (
                MODULE_RECORDS,
                str(ctx["records_project"]),
                Path(ctx["records_source"]),  # type: ignore[arg-type]
            )
        )
    if MODULE_CLERK in modules and MODULE_CLERK in requested_modules:
        targets.append(
            (
                MODULE_CLERK,
                str(ctx["clerk_project"]),
                Path(ctx["clerk_source"]),  # type: ignore[arg-type]
            )
        )
    for module, project, source in targets:
        for model in (DEFAULT_EMBEDDING_MODEL, DEFAULT_LLM_MODEL):
            proc = run(
                ollama_command(project, source, "pull", model),
                cwd=source,
                timeout=3600,
            )
            steps.append(
                {
                    "module": module,
                    "step": "ollama_pull_model",
                    "model": model,
                    "required": True,
                    "returncode": proc.returncode,
                    "stdout": proc.stdout[-4000:],
                    "stderr": proc.stderr[-4000:],
                }
            )
            if proc.returncode != 0:
                return steps
        try:
            selected_profile = None
            attempts: list[dict[str, object]] = []
            if USE_HOST_OLLAMA:
                prewarm = host_ollama_generate_with_fallback("Respond with OK.")
                returncode = int(prewarm["returncode"])
                stdout = str(prewarm["stdout"])[-4000:]
                stderr = str(prewarm["stderr"])[-4000:]
                selected_profile = prewarm.get("selected_profile") if returncode == 0 else None
                server = prewarm.get("server")
                attempts = list(prewarm.get("attempts", []))  # type: ignore[arg-type]
                initial_cleanup = prewarm.get("initial_cleanup")
            else:
                server = None
                initial_cleanup = None
                proc = run(
                    ollama_command(project, source, "run", DEFAULT_LLM_MODEL, "Respond with OK."),
                    cwd=source,
                    timeout=OLLAMA_PREWARM_TIMEOUT_SECONDS,
                )
                returncode = proc.returncode
                stdout = proc.stdout[-4000:]
                stderr = proc.stderr[-4000:]
        except subprocess.TimeoutExpired as exc:
            returncode = 124
            stdout = (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else ""
            stderr = (
                f"Ollama prewarm exceeded {OLLAMA_PREWARM_TIMEOUT_SECONDS}s. "
                "The response-letter workflow proof must not run against a cold model."
            )
            required = True
            status = "failed"
            fix_steps = [
                "Rerun install or repair when the host is less contended so Ollama can warm the model before the workflow proof.",
                "If this repeats, increase Docker Desktop / WSL2 memory or choose a smaller supported LLM model.",
            ]
        else:
            required = returncode != 0
            status = "passed" if returncode == 0 else "failed"
            fix_steps = []
            if returncode != 0:
                fix_steps = [
                    f"The selected response-letter model {DEFAULT_LLM_MODEL} did not load successfully.",
                    "Increase Docker Desktop / WSL2 memory above the model requirement and rerun repair/verify, or select a supported smaller model.",
                    "Review the Ollama container logs for the exact model-load error.",
                ]
        steps.append(
            {
                "module": module,
                "step": "ollama_prewarm_model",
                "model": DEFAULT_LLM_MODEL,
                "required": required,
                "timeout_seconds": OLLAMA_PREWARM_TIMEOUT_SECONDS,
                "status": status,
                "returncode": returncode,
                "stdout": stdout,
                "stderr": stderr,
                "selected_profile": selected_profile,
                "server": server,
                "initial_cleanup": initial_cleanup,
                "attempts": attempts,
                "fix_steps": fix_steps,
            }
        )
        if returncode == 0:
            loaded = run(
                ollama_command(project, source, "ps"),
                cwd=source,
                timeout=60,
            )
            loaded_stdout = loaded.stdout[-4000:]
            loaded_ok = loaded.returncode == 0 and DEFAULT_LLM_MODEL in loaded_stdout
            steps.append(
                {
                    "module": module,
                    "step": "ollama_loaded_model_check",
                    "model": DEFAULT_LLM_MODEL,
                    "required": True,
                    "status": "passed" if loaded_ok else "failed",
                    "returncode": loaded.returncode if loaded_ok else loaded.returncode or 1,
                    "stdout": loaded_stdout,
                    "stderr": loaded.stderr[-4000:],
                    "fix_steps": []
                    if loaded_ok
                    else [
                        f"Ollama warmed {DEFAULT_LLM_MODEL} but did not report it as resident.",
                        "Rerun install or repair and confirm OLLAMA_KEEP_ALIVE keeps the model loaded before workflow proof.",
                    ],
                }
            )
    return steps


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


def resolve_staff_mode(requested_mode: str, *, workflow_proof: bool) -> str:
    """Resolve the effective CivicClerk staff-auth mode for a lifecycle run.

    The starter-set workflow proof authenticates CivicClerk via the bearer staff
    token (verify_clerk_bearer_workflow / clerk_to_code_handoff), so --workflow-proof
    REQUIRES bearer mode. Force it on over the default protected so the install and
    verify passes agree; otherwise clerk installs protected and every bearer proof
    call 401s at /staff/session. A non-proof run keeps the requested mode.
    """
    if workflow_proof and requested_mode != CLERK_STAFF_MODE_BEARER:
        return CLERK_STAFF_MODE_BEARER
    return requested_mode


def write_clerk_env(
    target: Path,
    *,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
    ports: dict[str, int] | None = None,
    civiccode_intake_url: str | None = None,
    civiccode_intake_secret: str | None = None,
    suite_session_value: str | None = None,
) -> None:
    resolved_ports = ports or DEFAULT_CLERK_PORTS
    bearer_token_roles = json.dumps(
        {CLERK_WORKFLOW_PROOF_BEARER: ["clerk_admin", "meeting_editor"]},
        separators=(",", ":"),
    )
    if target.is_file():
        # A .env from a prior run persists (teardown clears Docker state, not the
        # host runtime dir). Still ENFORCE the staff-auth contract so a stale file —
        # e.g. written in the default protected mode before a workflow proof asked
        # for bearer — is upgraded, not silently kept (ensure_env_value only adds
        # when missing, so use set_env_value to overwrite the existing value).
        set_env_value(target, "CIVICCLERK_STAFF_AUTH_MODE", staff_mode)
        if staff_mode == CLERK_STAFF_MODE_BEARER:
            set_env_value(target, "CIVICCLERK_STAFF_AUTH_TOKEN_ROLES", bearer_token_roles)
        if suite_session_value:
            ensure_env_value(target, SUITE_SESSION_ENV, suite_session_value)
            ensure_env_value(target, SUITE_SESSION_REVOCATION_ENV, SUITE_SESSION_REVOCATION_CONTAINER_PATH)
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
    if suite_session_value:
        values[SUITE_SESSION_ENV] = suite_session_value
        values[SUITE_SESSION_REVOCATION_ENV] = SUITE_SESSION_REVOCATION_CONTAINER_PATH
    if staff_mode == CLERK_STAFF_MODE_BEARER:
        values["CIVICCLERK_STAFF_AUTH_TOKEN_ROLES"] = bearer_token_roles
    target.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")


def write_code_env(
    target: Path,
    ports: dict[str, int],
    *,
    civiccode_intake_secret: str | None = None,
    suite_session_value: str | None = None,
) -> None:
    if target.is_file():
        if suite_session_value:
            ensure_env_value(target, SUITE_SESSION_ENV, suite_session_value)
            ensure_env_value(target, SUITE_SESSION_REVOCATION_ENV, SUITE_SESSION_REVOCATION_CONTAINER_PATH)
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
    if suite_session_value:
        values[SUITE_SESSION_ENV] = suite_session_value
        values[SUITE_SESSION_REVOCATION_ENV] = SUITE_SESSION_REVOCATION_CONTAINER_PATH
    target.write_text(
        "\n".join(f"{key}={value}" for key, value in values.items()) + "\n",
        encoding="utf-8",
    )


def compose(project: str, source: Path, *args: str) -> list[str]:
    command = [docker_command(), "compose", "-p", project, "-f", "docker-compose.yml"]
    override = source / "docker-compose.civicsuite.override.yml"
    if override.is_file():
        command.extend(["-f", override.name])
    # Host-Ollama mode: layer the module's host-ollama variant LAST so its api/worker
    # environment (OLLAMA_BASE_URL=host.docker.internal) wins and the in-container Ollama
    # service is disabled.
    if USE_HOST_OLLAMA:
        host_ollama = source / "docker-compose.host-ollama.yml"
        if host_ollama.is_file():
            command.extend(["-f", host_ollama.name])
    command.extend(args)
    return command


def ollama_command(project: str, source: Path, *ollama_args: str) -> list[str]:
    # In host-Ollama mode the in-container Ollama is disabled, so model pull/run/ps must
    # target the host's native (GPU) Ollama directly — which also means subprocess timeouts
    # reliably terminate it (no lingering `docker compose exec` pipe).
    if USE_HOST_OLLAMA:
        return [HOST_OLLAMA_EXE, *ollama_args]
    return compose(project, source, "exec", "-T", "ollama", "ollama", *ollama_args)


def harden_host_ollama_overrides(runtime_source: Path) -> None:
    # A module's docker-compose.host-ollama.yml disables the in-container `ollama` service
    # and tries to drop it from api/worker depends_on -- but Docker Compose MERGES depends_on
    # across -f files (it does not replace), so the base's `ollama` dependency survives and,
    # with the service disabled, the project becomes invalid ("depends on undefined service
    # ollama"). Patch the runtime working copy so the variant's depends_on uses the Compose
    # Spec `!override` merge tag (replace, not merge). Runtime copy only -- the bundled/pinned
    # module source is untouched; the same fix is tracked as a finding for the module repo.
    host_override = runtime_source / "docker-compose.host-ollama.yml"
    if not host_override.is_file():
        return
    text = host_override.read_text(encoding="utf-8")
    patched = text.replace("    depends_on:\n", "    depends_on: !override\n")
    patched = patched.replace("http://host.docker.internal:11434", host_ollama_container_base_url())
    if patched != text:
        host_override.write_text(patched, encoding="utf-8", newline="\n")


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
        try:
            proc = run(["curl", "--max-time", "5", "-fsS", url], cwd=ROOT, timeout=8)
            attempts.append({"returncode": proc.returncode, "stdout": proc.stdout[:400], "stderr": proc.stderr[:400]})
        except subprocess.TimeoutExpired as exc:
            attempts.append(
                {
                    "returncode": 124,
                    "stdout": (exc.stdout or "")[:400] if isinstance(exc.stdout, str) else "",
                    "stderr": f"curl probe timed out after {exc.timeout} seconds",
                }
            )
            time.sleep(1)
            continue
        if proc.returncode == 0:
            return {"status": "passed", "attempts": attempts[-5:]}
        time.sleep(5)
    return {"status": "failed", "attempts": attempts[-10:]}


def collect_status_warnings(items: list[dict[str, object]]) -> list[dict[str, object]]:
    warnings: list[dict[str, object]] = []
    for item in items:
        if item.get("status") == "warning":
            warnings.append(
                {
                    "name": item.get("name", item.get("step", "warning")),
                    "module": item.get("module"),
                    "message": item.get("stderr") or item.get("message") or "Installer step completed with a warning.",
                    "fix_steps": item.get("fix_steps", []),
                }
            )
    return warnings


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
            body = response.read().decode("utf-8")
            try:
                return response.status, decode_json(body)
            except json.JSONDecodeError as exc:
                return 599, {
                    "detail": {
                        "message": "JSON GET returned a response, but the body was not valid JSON.",
                        "status_code": response.status,
                        "error": str(exc),
                        "body_preview": body[:400],
                    }
                }
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            return exc.code, decode_json(body)
        except json.JSONDecodeError:
            return exc.code, {"detail": {"message": body[:400]}}
    except (TimeoutError, SocketTimeout, urllib.error.URLError) as exc:
        reason = getattr(exc, "reason", exc)
        return 598, {
            "detail": {
                "message": "The installer could not get a JSON response before the timeout.",
                "timeout_seconds": timeout_seconds,
                "error": str(reason),
            }
        }


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


def post_json_from_compose_service(
    *,
    project: str,
    source: Path,
    service: str,
    path: str,
    payload: dict[str, object],
    headers: dict[str, str] | None = None,
    timeout_seconds: int = 30,
) -> tuple[int, dict[str, object]]:
    script = (
        "import json, os, urllib.error, urllib.request\n"
        "url = os.environ['REQUEST_URL']\n"
        "payload = os.environ['REQUEST_JSON'].encode('utf-8')\n"
        "headers = json.loads(os.environ.get('REQUEST_HEADERS') or '{}')\n"
        "headers.setdefault('Content-Type', 'application/json')\n"
        "headers.setdefault('Accept', 'application/json')\n"
        "request = urllib.request.Request(url, data=payload, headers=headers, method='POST')\n"
        "try:\n"
        "    with urllib.request.urlopen(request, timeout=30) as response:\n"
        "        body = response.read().decode('utf-8')\n"
        "        print(json.dumps({'status': response.status, 'body': json.loads(body) if body else {}}))\n"
        "except urllib.error.HTTPError as exc:\n"
        "    body = exc.read().decode('utf-8')\n"
        "    print(json.dumps({'status': exc.code, 'body': json.loads(body) if body else {}}))\n"
    )
    command = compose(
        project,
        source,
        "exec",
        "-T",
        "-e",
        f"REQUEST_URL=http://127.0.0.1:8000{path}",
        "-e",
        f"REQUEST_JSON={json.dumps(payload)}",
        "-e",
        f"REQUEST_HEADERS={json.dumps(headers or {})}",
        service,
        "python",
        "-c",
        script,
    )
    proc = run(command, cwd=source, timeout=timeout_seconds)
    if proc.returncode != 0:
        return 599, {"detail": {"message": "Container-local JSON POST failed.", "stderr": proc.stderr[-1000:]}}
    response = decode_json(proc.stdout.strip())
    return int(response.get("status", 599)), response.get("body", {}) if isinstance(response.get("body"), dict) else {}


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


def verify_records_portal_mode(ports: dict[str, int], *, expected_mode: str) -> dict[str, object]:
    base = f"http://127.0.0.1:{ports['api']}"
    checks: list[dict[str, object]] = []
    try:
        mode_status, mode_payload = get_json(f"{base}/config/portal-mode")
        checks.append({"name": "portal_mode_config", "status_code": mode_status, "payload": mode_payload})
        openapi_status = 598
        openapi_payload: dict[str, object] = {}
        openapi_attempts: list[dict[str, object]] = []
        for _ in range(6):
            openapi_status, openapi_payload = get_json(f"{base}/openapi.json", timeout_seconds=30)
            openapi_attempts.append({"status_code": openapi_status})
            if openapi_status != 598:
                break
            time.sleep(5)
        paths = openapi_payload.get("paths", {}) if isinstance(openapi_payload, dict) else {}
        public_request_path_mounted = "/public/requests" in paths
        register_path_mounted = "/auth/register" in paths
        checks.append(
            {
                "name": "public_route_mounts",
                "status_code": openapi_status,
                "attempts": openapi_attempts,
                "public_request_path_mounted": public_request_path_mounted,
                "register_path_mounted": register_path_mounted,
            }
        )
    except (OSError, json.JSONDecodeError) as exc:
        return {"name": "civicrecords_portal_mode", "status": "failed", "error": str(exc), "checks": checks}

    expected_public_routes = expected_mode == "public"
    mode_ok = mode_status == 200 and mode_payload.get("mode") == expected_mode
    routes_ok = (
        openapi_status == 200
        and public_request_path_mounted is expected_public_routes
        and register_path_mounted is expected_public_routes
    )
    return {
        "name": "civicrecords_portal_mode",
        "status": "passed" if mode_ok and routes_ok else "failed",
        "expected_mode": expected_mode,
        "checks": checks,
    }


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
    first_admin_email = os.environ.get("CIVICSUITE_FIRST_ADMIN_EMAIL", "admin@example.gov")
    password_path = records_source / "data" / "secrets" / "first_admin_password"
    try:
        password = password_path.read_text(encoding="utf-8").strip()
    except OSError as exc:
        return {"name": "civicrecords_workflow", "status": "failed", "error": str(exc), "checks": checks}

    # The forced first-login rotation is one-way: the first proof pass (install
    # mode) logs in with the seeded secret, rotates the admin password, and clears
    # must_change_password. The bootstrapper then runs the proof AGAIN in verify
    # mode, so the second pass can no longer authenticate with the now-stale seed
    # (fastapi-users returns 400 LOGIN_BAD_CREDENTIALS). Derive the rotation target
    # deterministically from the stable seeded secret so any later pass can
    # re-derive it and authenticate without persisted state — making the proof
    # idempotent / re-runnable (also the real-world re-install/re-verify case).
    rotated_password = f"Rotated-{password}-A1!"

    login_status, login_body = post_form(
        f"{base}/auth/jwt/login",
        {"username": first_admin_email, "password": password},
    )
    if login_status != 200 or not login_body.get("access_token"):
        # Re-entry: a prior pass already rotated the seeded password, so the seed
        # no longer authenticates. Fall back to the deterministic rotated value.
        reentry_status, reentry_body = post_form(
            f"{base}/auth/jwt/login",
            {"username": first_admin_email, "password": rotated_password},
        )
        if reentry_status == 200 and reentry_body.get("access_token"):
            login_status, login_body = reentry_status, reentry_body
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
    me_status, me_body = get_json(f"{base}/users/me", headers=headers)
    must_rotate = me_body.get("must_change_password") is True
    checks.append(
        {
            "name": "first_admin_rotation_required",
            "status_code": me_status,
            "must_change_password": must_rotate,
        }
    )
    if me_status != 200:
        return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}
    if must_rotate:
        rotate_status, rotate_body = patch_json(
            f"{base}/users/me",
            {"password": rotated_password},
            headers=headers,
        )
        checks.append(
            {
                "name": "rotate_first_admin_password",
                "status_code": rotate_status,
                "must_change_password": rotate_body.get("must_change_password"),
            }
        )
        if rotate_status != 200 or rotate_body.get("must_change_password") is not False:
            return {"name": "civicrecords_workflow", "status": "failed", "checks": checks}
        rotated_login_status, rotated_login_body = post_form(
            f"{base}/auth/jwt/login",
            {"username": first_admin_email, "password": rotated_password},
        )
        checks.append(
            {
                "name": "relogin_after_password_rotation",
                "status_code": rotated_login_status,
                "has_access_token": bool(rotated_login_body.get("access_token")),
            }
        )
        token = str(rotated_login_body.get("access_token") or "")
        if rotated_login_status != 200 or not token:
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

    letter_status, letter = post_json(
        f"{base}/requests/{request_id}/response-letter",
        {},
        headers=headers,
        timeout_seconds=RESPONSE_LETTER_TIMEOUT_SECONDS,
    )
    checks.append(
        {
            "name": "draft_response_letter",
            "status_code": letter_status,
            "letter_id_present": bool(letter.get("id")),
            "status": letter.get("status"),
            "generation_source": letter.get("generation_source"),
            "generation_model": letter.get("generation_model"),
            "expected_generation_source": "ollama",
            "expected_generation_model": DEFAULT_LLM_MODEL,
            "human_review_required": letter.get("status") == "draft",
            "contains_ai_disclaimer": "requires human review" in str(letter.get("generated_content", "")).lower(),
        }
    )
    if (
        letter_status != 201
        or not letter.get("id")
        or letter.get("status") != "draft"
        or letter.get("generation_source") != "ollama"
        or letter.get("generation_model") != DEFAULT_LLM_MODEL
    ):
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
                "handoff_last_error": handoff.get("civiccode_handoff_last_error"),
                "civiccode_event_id_present": bool(code_event_id),
            }
        )
        if handoff_status != 201 or handoff.get("civiccode_handoff_status") != "EMIT_DELIVERED" or not code_event_id:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        warning_status, warning_lookup = get_json(f"{code_base}/api/v1/civiccode/sections/lookup?section_number=13.40.020")
        warnings = warning_lookup.get("handoff_warnings") if isinstance(warning_lookup.get("handoff_warnings"), list) else []
        target_warning_visible = any(
            isinstance(warning, dict) and warning.get("ordinance_number") == "2026-041" for warning in warnings
        )
        checks.append(
            {
                "name": "code_pending_warning_visible",
                "status_code": warning_status,
                "warning_count": len(warnings),
                "target_warning_visible": target_warning_visible,
            }
        )
        if warning_status != 200 or not target_warning_visible:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        version_id = f"version_{marker.replace('-', '_')}"
        version_status, version = post_json_from_compose_service(
            project=str(ctx["code_project"]),
            source=Path(ctx["code_source"]),  # type: ignore[arg-type]
            service="api",
            path="/api/v1/civiccode/sections/sec_portland_13_40_020/versions",
            payload={
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
        target_warning_cleared = not any(
            isinstance(warning, dict) and warning.get("ordinance_number") == "2026-041" for warning in final_warnings
        )
        final_body = str(final_lookup.get("version", {}).get("body", ""))
        checks.append(
            {
                "name": "code_lookup_after_resolution",
                "status_code": final_status,
                "warning_count": len(final_warnings),
                "target_warning_cleared": target_warning_cleared,
                "body_contains_eight_chickens": "eight backyard chickens" in final_body,
            }
        )
        if final_status != 200 or not target_warning_cleared or "eight backyard chickens" not in final_body:
            return {"name": "clerk_to_code_handoff", "status": "failed", "checks": checks}

        answer_status, answer = post_json(
            f"{code_base}/api/v1/civiccode/questions/answer",
            {"question": "How many backyard chickens can residents keep?", "section_number": "13.40.020"},
            timeout_seconds=CODE_QA_TIMEOUT_SECONDS,
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
    context = {
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
        "shared_network": isolation["shared_network"],
    }
    for module_name in PYTHON_SERVICE_MODULES:
        context[python_service_source_key(module_name)] = (
            install_root / "sources" / module_name
        )
    return context


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
    shared_network = str(ctx["shared_network"])
    civiccode_intake_secret = secrets.token_urlsafe(32) if MODULE_CLERK in modules and MODULE_CODE in modules else ""
    civiccode_intake_url = (
        "http://civiccode-api:8000/api/v1/civiccode/staff/civicclerk/ordinance-events"
        if civiccode_intake_secret
        else ""
    )
    install_root.mkdir(parents=True, exist_ok=True)
    suite_session_path = None
    suite_session_revocation_path = None
    suite_session_value = None
    launcher_target = None
    if uses_suite_runtime(modules):
        suite_session_path, suite_session_value = ensure_suite_session_value(install_root)
        suite_session_revocation_path = ensure_suite_session_revocation_file(install_root)
        launcher_target = copy_suite_launcher_runtime(install_root, modules, ports)
    if MODULE_RECORDS in modules:
        copy_source(source_root_for_install(MODULE_RECORDS, install_root), ctx["records_source"])  # type: ignore[arg-type]
        if USE_HOST_OLLAMA:
            harden_host_ollama_overrides(ctx["records_source"])  # type: ignore[arg-type]
        normalize_records_compose_ports(ctx["records_source"], records_ports)  # type: ignore[arg-type]
        normalize_records_frontend_dockerfile(ctx["records_source"])  # type: ignore[arg-type]
        write_records_env(
            ctx["records_source"] / ".env",
            records_ports,
            portal_mode=records_portal_mode_for_modules(modules),
            suite_session_value=suite_session_value,
        )  # type: ignore[operator]
        write_records_override(ctx["records_source"], records_ports)  # type: ignore[arg-type]
    if MODULE_CLERK in modules:
        copy_source(source_root_for_install(MODULE_CLERK, install_root), ctx["clerk_source"])  # type: ignore[arg-type]
        if USE_HOST_OLLAMA:
            harden_host_ollama_overrides(ctx["clerk_source"])  # type: ignore[arg-type]
        write_clerk_env(
            ctx["clerk_source"] / ".env",
            staff_mode=staff_mode,
            ports=clerk_ports,  # type: ignore[arg-type]
            civiccode_intake_url=civiccode_intake_url,
            civiccode_intake_secret=civiccode_intake_secret,
            suite_session_value=suite_session_value,
        )  # type: ignore[operator]
        if civiccode_intake_secret:
            write_clerk_handoff_override(ctx["clerk_source"], shared_network)  # type: ignore[arg-type]
    if MODULE_CODE in modules:
        copy_source(source_root_for_install(MODULE_CODE, install_root), ctx["code_source"])  # type: ignore[arg-type]
        if USE_HOST_OLLAMA:
            harden_host_ollama_overrides(ctx["code_source"])  # type: ignore[arg-type]
        write_code_env(
            ctx["code_source"] / ".env",
            code_ports,  # type: ignore[arg-type]
            civiccode_intake_secret=civiccode_intake_secret,
            suite_session_value=suite_session_value,
        )  # type: ignore[operator]
        if civiccode_intake_secret:
            write_code_handoff_override(ctx["code_source"], shared_network)  # type: ignore[arg-type]
    for module_name in PYTHON_SERVICE_MODULES:
        if module_name not in modules:
            continue
        copy_source(
            source_root_for_install(module_name, install_root),
            ctx[python_service_source_key(module_name)],  # type: ignore[arg-type]
        )
    ctx["install_provenance_path"] = write_install_provenance(install_root, modules)
    if suite_session_path is not None:
        ctx["suite_session_path"] = suite_session_path
    if suite_session_revocation_path is not None:
        ctx["suite_session_revocation_path"] = suite_session_revocation_path
    if launcher_target is not None:
        ctx["suite_launcher_source"] = launcher_target
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
    if MODULE_CLERK in modules and MODULE_CODE in modules:
        network = ensure_shared_network(str(ctx["shared_network"]))
        steps.append(
            {
                "module": "city-core",
                "step": "ensure_shared_handoff_network",
                "network": str(ctx["shared_network"]),
                "returncode": network.returncode,
                "stdout": network.stdout[-4000:],
                "stderr": network.stderr[-4000:],
            }
        )
        if network.returncode != 0:
            return {"status": "failed", "steps": steps}
    if MODULE_RECORDS in modules:
        records_source = Path(ctx["records_source"])  # type: ignore[arg-type]
        records_project = str(ctx["records_project"])
        # Warm-first only applies to the in-container Ollama. In host-Ollama mode the host's
        # native Ollama is already serving, so skip bringing up the (disabled) container service.
        if not USE_HOST_OLLAMA:
            warm_up = run(compose(records_project, records_source, "up", "-d", "ollama"), cwd=records_source, timeout=900)
            steps.append(
                {
                    "module": MODULE_RECORDS,
                    "step": "compose_up_ollama_warm_first",
                    "returncode": warm_up.returncode,
                    "stdout": warm_up.stdout[-4000:],
                    "stderr": warm_up.stderr[-4000:],
                }
            )
            if warm_up.returncode != 0:
                return {"status": "failed", "selected_modules": modules, "steps": steps}
        records_model_steps = ensure_ollama_models(ctx, selected_modules=[MODULE_RECORDS])
        steps.extend(records_model_steps)
        if any(step.get("required", True) and step.get("returncode") != 0 for step in records_model_steps):
            return {"status": "failed", "selected_modules": modules, "steps": steps}
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
        build, build_attempts = run_compose_build_with_retry(project, source, *services)  # type: ignore[arg-type]
        build_step: dict[str, object] = {
            "module": name,
            "step": "compose_build",
            "returncode": build.returncode,
            "stdout": build.stdout[-4000:],
            "stderr": build.stderr[-4000:],
            "compose_parallel_limit": installer_subprocess_env().get("COMPOSE_PARALLEL_LIMIT"),
        }
        if len(build_attempts) > 1:
            build_step["attempts"] = build_attempts
            build_step["retry_policy"] = "transient_docker_desktop_transport_failure"
        steps.append(build_step)
        if build.returncode != 0:
            return {"status": "failed", "steps": steps}
        up = run(compose(project, source, "up", "-d", *services), cwd=source, timeout=900)  # type: ignore[arg-type]
        if up.returncode != 0 and (
            "dependency failed to start" in up.stderr or "is unhealthy" in up.stderr
        ):
            steps.append(
                {
                    "module": name,
                    "step": "compose_up_transient_health_retry",
                    "returncode": up.returncode,
                    "stdout": up.stdout[-4000:],
                    "stderr": up.stderr[-4000:],
                    "retry_after_seconds": 20,
                }
            )
            time.sleep(20)
            up = run(compose(project, source, "up", "-d", *services), cwd=source, timeout=900)  # type: ignore[arg-type]
        compose_up_step: dict[str, object] = {
            "module": name,
            "step": "compose_up",
            "returncode": up.returncode,
            "stdout": up.stdout[-4000:],
            "stderr": up.stderr[-4000:],
        }
        if up.returncode != 0:
            compose_up_step["logs"] = compose_logs(project, source, *services)  # type: ignore[arg-type]
        steps.append(compose_up_step)
        if up.returncode != 0:
            return {"status": "failed", "steps": steps}
    model_steps = ensure_ollama_models(ctx, selected_modules=[module for module in modules if module != MODULE_RECORDS])
    steps.extend(model_steps)
    if any(step.get("required", True) and step.get("returncode") != 0 for step in model_steps):
        return {"status": "failed", "steps": steps}
    ports = ctx.get("ports", {})  # type: ignore[assignment]
    for module_name in PYTHON_SERVICE_MODULES:
        if module_name not in modules:
            steps.append(
                {
                    "module": module_name,
                    "step": "python_service_install",
                    "status": "skipped_not_selected",
                }
            )
            continue
        source = Path(ctx[python_service_source_key(module_name)])  # type: ignore[arg-type]
        dependency_steps = install_python_service_dependencies(
            install_root, module_name, source
        )
        steps.extend(dependency_steps)
        if any(step.get("returncode") not in (None, 0) for step in dependency_steps):
            return {"status": "failed", "selected_modules": modules, "steps": steps}
        port = ports[module_name]["api"]  # type: ignore[index]
        start_step = start_python_service(
            install_root,
            module_name,
            source,
            port=int(port),
        )
        steps.append(start_step)
        if start_step.get("status") != "passed":
            return {"status": "failed", "selected_modules": modules, "steps": steps}
    result = verify(
        install_root,
        isolation=isolation,
        report_dir=report_dir,
        selected_modules=modules,
        staff_mode=staff_mode,
        workflow_proof=workflow_proof,
    )  # type: ignore[arg-type]
    steps.extend(result["checks"])  # type: ignore[arg-type]
    status = "passed" if result["status"] == "passed" else "failed"
    return {"status": status, "selected_modules": modules, "steps": steps, "warnings": collect_status_warnings(steps)}


def verify_suite_runtime_wiring(ctx: dict[str, object]) -> list[dict[str, object]]:
    install_root = Path(ctx["install_root"])  # type: ignore[arg-type]
    modules = ctx["selected_modules"]  # type: ignore[assignment]
    launcher_root = install_root / SUITE_LAUNCHER_DIR_NAME
    config_path = launcher_root / "civicsuite-launcher-config.json"
    config: dict[str, object] = {}
    if config_path.is_file():
        try:
            loaded = json.loads(config_path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                config = loaded
        except json.JSONDecodeError:
            config = {}
    launcher_files_ok = all(
        (launcher_root / relative).is_file()
        for relative in (
            "index.html",
            "civicsuite-launcher-config.js",
            "package.json",
            "scripts/serve.mjs",
            "src/app.js",
            "src/styles.css",
        )
    )
    checks: list[dict[str, object]] = [
        {
            "name": "suite_launcher_runtime_files",
            "status": "passed" if launcher_files_ok else "failed",
            "path": str(launcher_root),
            "fix_steps": [
                "Run install or repair so the city-core package copies the suite launcher runtime.",
                "Confirm installer/runtime/suite-launcher contains index.html, package.json, scripts/serve.mjs, and src assets.",
            ]
            if not launcher_files_ok
            else [],
        },
        {
            "name": "suite_launcher_port_config",
            "status": "passed"
            if config.get("port") == DEFAULT_SUITE_LAUNCHER_PORT
            and config.get("url") == f"http://127.0.0.1:{DEFAULT_SUITE_LAUNCHER_PORT}/"
            else "failed",
            "path": str(config_path),
            "expected_port": DEFAULT_SUITE_LAUNCHER_PORT,
            "fix_steps": [
                "Regenerate or repair the city-core runtime so civicsuite-launcher-config.json names the suite launcher port.",
                f"Expected localhost:{DEFAULT_SUITE_LAUNCHER_PORT} for the suite launcher.",
            ]
            if config.get("port") != DEFAULT_SUITE_LAUNCHER_PORT
            else [],
        },
    ]
    value_path = suite_session_value_path(install_root)
    revocation_path = suite_session_revocation_path(install_root)
    value_present = value_path.is_file() and bool(value_path.read_text(encoding="utf-8").strip())
    revocation_present = revocation_path.is_file()
    env_checks: list[dict[str, object]] = []
    source_by_module = {
        MODULE_RECORDS: Path(ctx["records_source"]),  # type: ignore[arg-type]
        MODULE_CLERK: Path(ctx["clerk_source"]),  # type: ignore[arg-type]
        MODULE_CODE: Path(ctx["code_source"]),  # type: ignore[arg-type]
    }
    for module in modules if isinstance(modules, list) else []:
        source = source_by_module.get(str(module))
        if source is None:
            continue
        env_path = source / ".env"
        env_checks.append(
            {
                "module": module,
                "env_path": str(env_path),
                "present": bool(parse_env_file(env_path).get(SUITE_SESSION_ENV)),
                "revocation_file_env_present": parse_env_file(env_path).get(SUITE_SESSION_REVOCATION_ENV)
                == SUITE_SESSION_REVOCATION_CONTAINER_PATH,
            }
        )
    shared_ok = (
        value_present
        and revocation_present
        and all(check["present"] for check in env_checks)
        and all(check["revocation_file_env_present"] for check in env_checks)
    )
    checks.append(
        {
            "name": "shared_staff_session_presence",
            "status": "passed" if shared_ok else "failed",
            "env_var": SUITE_SESSION_ENV,
            "value_file": str(value_path),
            "revocation_env_var": SUITE_SESSION_REVOCATION_ENV,
            "revocation_file": str(revocation_path),
            "module_env_checks": env_checks,
            "fix_steps": [
                "Run install or repair so the installer creates the shared staff session value.",
                f"Confirm each selected service .env contains {SUITE_SESSION_ENV}.",
                f"Confirm each selected service .env contains {SUITE_SESSION_REVOCATION_ENV}={SUITE_SESSION_REVOCATION_CONTAINER_PATH}.",
                "Rerun verify after the runtime wiring check is present.",
            ]
            if not shared_ok
            else [],
        }
    )
    return checks


def verify_suite_launcher_serves(ctx: dict[str, object]) -> dict[str, object]:
    launcher_root = Path(ctx["install_root"]) / SUITE_LAUNCHER_DIR_NAME  # type: ignore[arg-type]
    url = f"http://127.0.0.1:{DEFAULT_SUITE_LAUNCHER_PORT}/"
    launcher_fix_steps = [
        f"Free localhost port {DEFAULT_SUITE_LAUNCHER_PORT}: close the program using it or run `netstat -ano | findstr :{DEFAULT_SUITE_LAUNCHER_PORT}` and stop that PID.",
        f"Confirm the suite launcher runtime directory exists at {launcher_root}.",
        "Review the matching lifecycle launcher-output/*.log file; the cleanroom runner prints that path on failure.",
    ]
    if not launcher_root.is_dir():
        return {
            "name": "suite_launcher_http",
            "status": "failed",
            "url": url,
            "path": str(launcher_root),
            "fix_steps": [
                "Run install or repair so the suite launcher runtime is copied before verification.",
                *launcher_fix_steps,
            ],
        }

    already_running = wait_for_url(url, timeout_seconds=3)
    if already_running["status"] == "passed":
        body = str(already_running.get("attempts", [{}])[-1].get("stdout", ""))
        marker_ok = "CivicSuite Launcher" in body or "civicsuite-launcher-config" in body
        return {
            "name": "suite_launcher_http",
            "status": "passed" if marker_ok else "failed",
            "url": url,
            "mode": "already_running",
            "content_marker_present": marker_ok,
            "attempts": already_running.get("attempts", []),
            "fix_steps": launcher_fix_steps if not marker_ok else [],
        }

    proc = subprocess.Popen(  # noqa: S603 - local verification server, no shell.
        [sys.executable, "-m", "http.server", str(DEFAULT_SUITE_LAUNCHER_PORT), "--bind", "127.0.0.1"],
        cwd=launcher_root,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        time.sleep(1)
        if proc.poll() is not None:
            stderr = proc.stderr.read()[-1000:] if proc.stderr else ""
            return {
                "name": "suite_launcher_http",
                "status": "failed",
                "url": url,
                "mode": "python_http_server",
                "error": stderr or f"server exited with code {proc.returncode}",
                "fix_steps": launcher_fix_steps,
            }
        proof = wait_for_url(url, timeout_seconds=20)
        body = str(proof.get("attempts", [{}])[-1].get("stdout", "")) if proof.get("attempts") else ""
        marker_ok = "CivicSuite Launcher" in body or "civicsuite-launcher-config" in body
        status = "passed" if proof["status"] == "passed" and marker_ok else "failed"
        return {
            "name": "suite_launcher_http",
            "status": status,
            "url": url,
            "mode": "python_http_server",
            "content_marker_present": marker_ok,
            "attempts": proof.get("attempts", []),
            "fix_steps": launcher_fix_steps
            if status != "passed"
            else [],
        }
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


def verify(
    install_root: Path,
    *,
    isolation: dict[str, object],
    report_dir: Path,
    selected_modules: list[str] | tuple[str, ...] | None = None,
    staff_mode: str = CLERK_STAFF_MODE_PROTECTED,
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
    checks.append(verify_install_provenance(install_root, modules))
    if uses_suite_runtime(modules):
        checks.extend(verify_suite_runtime_wiring(ctx))
        checks.append(verify_suite_launcher_serves(ctx))
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
    for module_name in PYTHON_SERVICE_MODULES:
        if module_name not in modules:
            continue
        module_ports = ports[module_name]  # type: ignore[index]
        health_url = f"http://127.0.0.1:{module_ports['api']}/health"
        health = wait_for_url(health_url, timeout_seconds=120)
        checks.append(
            {
                "name": f"{module_name}_api",
                "url": health_url,
                **health,
            }
        )
        ready_url = f"http://127.0.0.1:{module_ports['api']}/ready"
        if module_name != "civiczone":
            checks.append(
                {
                    "name": f"{module_name}_readiness",
                    "url": ready_url,
                    **wait_for_url(ready_url, timeout_seconds=60),
                }
            )
    if clerk_api_passed and not workflow_proof and staff_mode == CLERK_STAFF_MODE_PROTECTED:
        checks.append(verify_clerk_protected_default(clerk_ports))  # type: ignore[arg-type]
    if records_api_passed or clerk_api_passed:
        checks.append(verify_civiccore_contract(records_ports, clerk_ports, code_ports, selected_modules=modules))  # type: ignore[arg-type]
    elif code_api_passed:
        checks.append(verify_civiccore_contract(records_ports, clerk_ports, code_ports, selected_modules=modules))  # type: ignore[arg-type]
    if workflow_proof:
        checks.append(verify_starter_set_workflow_contract(ctx, selected_modules=modules))
    if records_api_passed:
        checks.append(
            verify_records_portal_mode(
                records_ports,
                expected_mode=records_portal_mode_for_modules(modules),
            )
        )
    status = "passed" if all(check["status"] == "passed" for check in checks) else "failed"
    return {"status": status, "selected_modules": modules, "checks": checks, "warnings": collect_status_warnings(checks)}


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
    for module_name in PYTHON_SERVICE_MODULES:
        if module_name not in modules:
            steps.append(
                {
                    "module": module_name,
                    "step": "python_service_stop",
                    "status": "skipped_not_selected",
                }
            )
            continue
        steps.append(stop_python_service(install_root, module_name))
    if MODULE_CLERK in modules and MODULE_CODE in modules:
        network = remove_shared_network(str(ctx["shared_network"]))
        steps.append(
            {
                "module": "city-core",
                "step": "remove_shared_handoff_network",
                "network": str(ctx["shared_network"]),
                "returncode": network.returncode,
                "stdout": network.stdout[-4000:],
                "stderr": network.stderr[-4000:],
                "status": "removed" if network.returncode == 0 else "skipped_or_in_use",
            }
        )
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


def capture_row_survival_snapshot(contract: dict[str, str | Path], *, database: str | None = None) -> dict[str, object]:
    source = Path(contract["source"])  # type: ignore[arg-type]
    db_name = database or str(contract["postgres_db"])
    sql = r"""
CREATE OR REPLACE FUNCTION pg_temp.table_fingerprint(p_schema text, p_table text) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE format(
    'SELECT jsonb_build_object(
       ''row_count'', count(*),
       ''fingerprint'', coalesce(md5(string_agg(md5(row_to_json(t)::text), '','' ORDER BY md5(row_to_json(t)::text))), '''')
     ) FROM %I.%I t',
    p_schema,
    p_table
  )
  INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
SELECT coalesce(jsonb_object_agg(schemaname || '.' || tablename, pg_temp.table_fingerprint(schemaname, tablename)), '{}'::jsonb)
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
"""
    proc = run(
        compose(
            str(contract["project"]),
            source,
            "exec",
            "-T",
            str(contract["postgres_service"]),
            "psql",
            "-U",
            str(contract["postgres_user"]),
            "-d",
            db_name,
            "-q",
            "-tA",
            "-c",
            sql,
        ),
        cwd=source,
        timeout=300,
    )
    if proc.returncode != 0:
        raise InstallerError(
            f"Failed to capture row survival snapshot for {contract['module']} "
            f"database {db_name}: {proc.stderr[-1000:]}"
        )
    payload = proc.stdout.strip()
    return json.loads(payload or "{}")


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
        "row_survival": {},
    }
    for module in modules:
        contract = module_database_contract(ctx, str(module))
        source = Path(contract["source"])  # type: ignore[arg-type]
        before_snapshot = capture_row_survival_snapshot(contract)
        row_survival = manifest["row_survival"]
        if isinstance(row_survival, dict):
            row_survival[str(module)] = {"before": before_snapshot}
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
    ledger_path = backup_dir / "record-survival-ledger.json"
    ledger_path.write_text(json.dumps(manifest["row_survival"], indent=2, sort_keys=True) + "\n", encoding="utf-8")
    steps.append({"step": "write_backup_manifest", "path": str(manifest_path), "status": "passed"})
    steps.append({"step": "write_record_survival_ledger", "path": str(ledger_path), "status": "passed"})
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
    row_survival = manifest.get("row_survival") if isinstance(manifest, dict) else {}
    if not isinstance(row_survival, dict):
        row_survival = {}
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
        if restored.returncode == 0:
            after_snapshot = capture_row_survival_snapshot(contract, database=restore_db)
            module_survival = row_survival.get(str(module))
            before_snapshot = module_survival.get("before") if isinstance(module_survival, dict) else None
            survival_passed = before_snapshot == after_snapshot
            if isinstance(module_survival, dict):
                module_survival["after"] = after_snapshot
                module_survival["status"] = "passed" if survival_passed else "failed"
            else:
                row_survival[str(module)] = {
                    "after": after_snapshot,
                    "status": "failed",
                    "error": "missing backup-time row survival snapshot",
                }
                survival_passed = False
            ledger_path = resolved_backup / "record-survival-ledger.json"
            ledger_path.write_text(json.dumps(row_survival, indent=2, sort_keys=True) + "\n", encoding="utf-8")
            steps.append(
                {
                    "module": module,
                    "step": "record_survival_probe",
                    "path": str(ledger_path),
                    "status": "passed" if survival_passed else "failed",
                }
            )
            if not survival_passed:
                return {
                    "status": "failed",
                    "selected_modules": modules,
                    "backup_dir": str(resolved_backup),
                    "steps": steps,
                    "error": f"row survival mismatch for {module}",
                }
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


def print_failure_summary(payload: dict[str, object], report_dir: Path) -> None:
    if payload.get("status") == "passed":
        return
    print("\nCivicSuite installer did not finish successfully.", file=sys.stderr)
    print(f"Full machine-readable report: {report_dir / 'clerk-core-installer-lifecycle.json'}", file=sys.stderr)
    print(f"Lifecycle logs, when present: {report_dir / 'launcher-output'}", file=sys.stderr)
    for key in ("checks", "steps"):
        items = payload.get(key)
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict) or item.get("status") not in {"failed", "warning"}:
                continue
            print(f"- {item.get('name', item.get('step', 'check'))}: {item.get('status')}", file=sys.stderr)
            fix_steps = item.get("fix_steps")
            if isinstance(fix_steps, list):
                for fix in fix_steps:
                    print(f"  * {fix}", file=sys.stderr)


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
    parser.add_argument(
        "--host-ollama",
        action="store_true",
        help="Use the host's native (GPU) Ollama and the per-module docker-compose.host-ollama.yml variant instead of the in-container CPU Ollama.",
    )
    parser.add_argument(
        "--ollama-exe",
        default="ollama",
        help="Path to the host Ollama executable (used with --host-ollama).",
    )
    parser.add_argument(
        "--host-ollama-port",
        type=int,
        default=11434,
        help="Host Ollama TCP port used by readiness and host-ollama compose overrides.",
    )
    args = parser.parse_args()
    global USE_HOST_OLLAMA, HOST_OLLAMA_EXE, HOST_OLLAMA_PORT
    USE_HOST_OLLAMA = bool(args.host_ollama)
    if args.ollama_exe:
        HOST_OLLAMA_EXE = args.ollama_exe
    if args.host_ollama_port < 1 or args.host_ollama_port > 65535:
        raise InstallerError("--host-ollama-port must be between 1 and 65535.")
    HOST_OLLAMA_PORT = int(args.host_ollama_port)
    if args.staff_mode == CLERK_STAFF_MODE_OPEN:
        print(CLERK_OPEN_MODE_WARNING, file=sys.stderr)

    # --workflow-proof authenticates CivicClerk via the bearer staff token, so it
    # requires bearer mode (see resolve_staff_mode). Resolve once and use for the
    # install, verify, and repair passes so they all agree.
    staff_mode = resolve_staff_mode(args.staff_mode, workflow_proof=args.workflow_proof)

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
            checks: list[dict[str, object]] = [
                {
                    "name": "docker_info",
                    "status": "passed" if info.returncode == 0 else "failed",
                    "returncode": info.returncode,
                    "stdout": info.stdout[-1000:],
                    "stderr": info.stderr[-1000:],
                    "fix_steps": []
                    if info.returncode == 0
                    else [
                        "Start Docker Desktop or Docker Engine and wait for it to report ready.",
                        "Rerun readiness before install.",
                    ],
                }
            ]
            if info.returncode == 0:
                checks.append(model_resource_readiness_check(info.stdout))
                if USE_HOST_OLLAMA:
                    checks.append(host_ollama_model_load_readiness_check())
            payload["checks"] = checks
            payload["status"] = "passed" if all(check.get("status") == "passed" for check in checks) else "failed"
        elif args.mode == "install":
            payload.update(
                install(
                    install_root,
                    isolation=isolation,
                    report_dir=report_dir,
                    selected_modules=selected_modules,
                    staff_mode=staff_mode,
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
                    staff_mode=staff_mode,
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
                    staff_mode=staff_mode,
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
        print_failure_summary(payload, report_dir)
    return 0 if payload.get("status") == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
