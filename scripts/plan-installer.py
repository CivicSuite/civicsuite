"""Generate a non-mutating CivicSuite installer plan."""

from __future__ import annotations

import argparse
import ctypes
import json
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "installer" / "modules.json"


class PlannerError(RuntimeError):
    pass


READINESS_SCENARIOS = {
    "nominal": set(),
    "missing-docker": {"container-runtime"},
    "windows-missing-wsl": {"wsl2"},
    "low-resources": {"disk-memory"},
    "ollama-missing": {"ollama"},
    "civiccore-mismatch": {"civiccore-compatibility"},
}

EXECUTION_TOKEN = "I_UNDERSTAND_THIS_MUTATES_HOST"
MIN_FREE_DISK_BYTES = 20 * 1024 * 1024 * 1024
MIN_MEMORY_BYTES = 8 * 1024 * 1024 * 1024

EXECUTOR_PHASES = [
    {
        "id": "preflight",
        "label": "Preflight",
        "purpose": "Confirm manifest, profile, dependency order, host readiness, and required evidence paths.",
        "mutates_host": False,
        "required_inputs": ["manifest", "profile", "readiness"],
        "required_evidence": ["dry_run_plan", "readiness_report"],
        "blocks_on": ["blocked_readiness", "unknown_module", "dependency_cycle"],
    },
    {
        "id": "approval",
        "label": "Approval Gate",
        "purpose": "Require explicit operator approval before any future host mutation.",
        "mutates_host": False,
        "required_inputs": ["execution_token", "resolved_plan"],
        "required_evidence": ["approval_record", "planned_actions"],
        "blocks_on": ["missing_execution_token", "readiness_blocker"],
    },
    {
        "id": "execute",
        "label": "Execute Install",
        "purpose": "Future mutating phase that installs CivicCore first and then selected modules.",
        "mutates_host": True,
        "required_inputs": ["approved_plan", "module_artifacts"],
        "required_evidence": ["install_log", "artifact_versions", "service_config"],
        "blocks_on": ["executor_not_implemented", "artifact_missing", "version_mismatch"],
    },
    {
        "id": "verify",
        "label": "Verify Install",
        "purpose": "Verify selected services, health checks, restart behavior, and actionable failure output.",
        "mutates_host": False,
        "required_inputs": ["installed_profile"],
        "required_evidence": ["health_checks", "restart_check", "failure_copy_check"],
        "blocks_on": ["service_unhealthy", "restart_failed", "missing_evidence"],
    },
    {
        "id": "repair",
        "label": "Repair",
        "purpose": "Future mutating phase that repairs a failed or drifted local profile.",
        "mutates_host": True,
        "required_inputs": ["diagnostics", "approved_repair_plan"],
        "required_evidence": ["repair_log", "post_repair_health_checks"],
        "blocks_on": ["repair_not_approved", "unsafe_drift"],
    },
    {
        "id": "rollback",
        "label": "Rollback Or Uninstall",
        "purpose": "Future mutating phase that rolls back or removes selected services with evidence.",
        "mutates_host": True,
        "required_inputs": ["approved_rollback_plan", "installed_profile"],
        "required_evidence": ["rollback_log", "remaining_state_report"],
        "blocks_on": ["rollback_not_approved", "data_loss_risk_unacknowledged"],
    },
]

EVIDENCE_SCHEMA_VERSION = 1
EVIDENCE_REPORTS = [
    {
        "id": "dry_run_plan",
        "phase": "preflight",
        "path_template": "installer/reports/{run_id}/dry-run-plan.json",
        "required_fields": ["run_id", "profile", "modules", "actions", "mutates_host"],
        "redaction": "no secrets expected; reject environment dumps",
    },
    {
        "id": "readiness_report",
        "phase": "preflight",
        "path_template": "installer/reports/{run_id}/readiness.json",
        "required_fields": ["run_id", "status", "checks", "next_action", "detection_source"],
        "redaction": "allow executable paths and resource totals; reject tokens and env vars",
    },
    {
        "id": "approval_record",
        "phase": "approval",
        "path_template": "installer/reports/{run_id}/approval.json",
        "required_fields": ["run_id", "approval_required", "approval_received", "operator_action"],
        "redaction": "record token presence only, never persist raw approval token",
    },
    {
        "id": "install_log",
        "phase": "execute",
        "path_template": "installer/reports/{run_id}/install-log.jsonl",
        "required_fields": ["run_id", "timestamp", "module", "step", "status"],
        "redaction": "scrub secrets, local usernames in URLs, and auth headers",
    },
    {
        "id": "artifact_versions",
        "phase": "execute",
        "path_template": "installer/reports/{run_id}/artifact-versions.json",
        "required_fields": ["run_id", "module", "repo", "version", "civiccore_requirement"],
        "redaction": "public version metadata only",
    },
    {
        "id": "service_config",
        "phase": "execute",
        "path_template": "installer/reports/{run_id}/service-config.json",
        "required_fields": ["run_id", "module", "service_name", "ports", "data_paths"],
        "redaction": "record paths and ports; reject secret values",
    },
    {
        "id": "health_checks",
        "phase": "verify",
        "path_template": "installer/reports/{run_id}/health-checks.json",
        "required_fields": ["run_id", "module", "endpoint", "status", "actionable_failure"],
        "redaction": "response summaries only, no full records or sensitive payloads",
    },
    {
        "id": "restart_check",
        "phase": "verify",
        "path_template": "installer/reports/{run_id}/restart-check.json",
        "required_fields": ["run_id", "module", "restart_attempted", "status", "duration_seconds"],
        "redaction": "timing and status only",
    },
    {
        "id": "failure_copy_check",
        "phase": "verify",
        "path_template": "installer/reports/{run_id}/failure-copy-check.json",
        "required_fields": ["run_id", "scenario", "message", "fix_steps"],
        "redaction": "operator-facing copy only",
    },
    {
        "id": "repair_log",
        "phase": "repair",
        "path_template": "installer/reports/{run_id}/repair-log.jsonl",
        "required_fields": ["run_id", "timestamp", "module", "diagnostic", "repair_step", "status"],
        "redaction": "scrub secrets and local account identifiers",
    },
    {
        "id": "post_repair_health_checks",
        "phase": "repair",
        "path_template": "installer/reports/{run_id}/post-repair-health-checks.json",
        "required_fields": ["run_id", "module", "status", "remaining_failures"],
        "redaction": "summaries only",
    },
    {
        "id": "rollback_log",
        "phase": "rollback",
        "path_template": "installer/reports/{run_id}/rollback-log.jsonl",
        "required_fields": ["run_id", "timestamp", "module", "rollback_step", "status"],
        "redaction": "scrub secrets and local account identifiers",
    },
    {
        "id": "remaining_state_report",
        "phase": "rollback",
        "path_template": "installer/reports/{run_id}/remaining-state.json",
        "required_fields": ["run_id", "remaining_services", "remaining_data_paths", "operator_next_action"],
        "redaction": "paths allowed; no credentials or data payloads",
    },
]


def load_manifest(path: Path = MANIFEST) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise PlannerError("Manifest root must be an object.")
    return data


def _profiles_by_id(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    profiles = manifest.get("profiles", [])
    if not isinstance(profiles, list):
        raise PlannerError("Manifest profiles must be a list.")
    return {
        str(profile.get("id")): profile
        for profile in profiles
        if isinstance(profile, dict) and profile.get("id")
    }


def _modules_by_id(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    modules = manifest.get("modules", [])
    if not isinstance(modules, list):
        raise PlannerError("Manifest modules must be a list.")
    return {
        str(module.get("id")): module
        for module in modules
        if isinstance(module, dict) and module.get("id")
    }


def _menu_styles_by_id(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    styles = manifest.get("menu_styles", [])
    if not isinstance(styles, list):
        raise PlannerError("Manifest menu_styles must be a list.")
    return {
        str(style.get("id")): style
        for style in styles
        if isinstance(style, dict) and style.get("id")
    }


def _resolve_module_order(module_ids: list[str], modules: dict[str, dict[str, Any]]) -> list[str]:
    resolved: list[str] = []
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(module_id: str) -> None:
        if module_id in visited:
            return
        if module_id in visiting:
            raise PlannerError(f"Dependency cycle detected at {module_id}.")
        if module_id not in modules:
            raise PlannerError(f"Unknown module: {module_id}")
        visiting.add(module_id)
        dependencies = modules[module_id].get("dependencies", [])
        if not isinstance(dependencies, list):
            raise PlannerError(f"Module {module_id} dependencies must be a list.")
        for dependency in dependencies:
            visit(str(dependency))
        visiting.remove(module_id)
        visited.add(module_id)
        resolved.append(module_id)

    for module_id in module_ids:
        visit(module_id)
    return resolved


def _host_platform() -> dict[str, str]:
    return {
        "system": platform.system() or "unknown",
        "release": platform.release() or "unknown",
        "machine": platform.machine() or "unknown",
    }


def _baseline_checks(system: str) -> list[dict[str, str]]:
    checks = [
        {
            "id": "container-runtime",
            "description": "Docker Desktop or Docker Engine is installed and running.",
            "mode": "detect_or_guide",
        },
        {
            "id": "disk-memory",
            "description": "Host has enough RAM and disk for the selected profile.",
            "mode": "detect",
        },
        {
            "id": "ollama",
            "description": "Ollama is available when the selected profile enables local LLM features.",
            "mode": "optional",
        },
    ]
    if system.lower() == "windows":
        checks.insert(
            1,
            {
                "id": "wsl2",
                "description": "WSL 2 and Virtual Machine Platform are enabled when Docker Desktop requires them.",
                "mode": "detect_or_guide",
            },
        )
    return checks


def _run_probe(command: list[str], timeout: int = 5) -> dict[str, Any]:
    try:
        proc = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
    except FileNotFoundError:
        return {"ok": False, "detail": f"{command[0]} was not found."}
    except subprocess.TimeoutExpired:
        return {"ok": False, "detail": f"{' '.join(command)} timed out after {timeout} seconds."}
    output = (proc.stdout or proc.stderr).replace("\x00", "").strip()
    return {
        "ok": proc.returncode == 0,
        "detail": output.splitlines()[0] if output else f"exit code {proc.returncode}",
    }


def _memory_bytes() -> int | None:
    if platform.system().lower() == "windows":
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
    try:
        page_size = int(getattr(__import__("os"), "sysconf")("SC_PAGE_SIZE"))
        page_count = int(getattr(__import__("os"), "sysconf")("SC_PHYS_PAGES"))
        return page_size * page_count
    except (AttributeError, OSError, ValueError):
        return None


def detect_host_dependencies(host: dict[str, str] | None = None) -> dict[str, Any]:
    host_info = host or _host_platform()
    system = str(host_info.get("system", "")).lower()
    docker_path = shutil.which("docker")
    ollama_path = shutil.which("ollama")
    docker_probe = _run_probe(["docker", "info", "--format", "{{.ServerVersion}}"]) if docker_path else None
    root_usage = shutil.disk_usage(ROOT)
    memory_total = _memory_bytes()

    checks: dict[str, dict[str, Any]] = {}
    checks["container-runtime"] = {
        "detected": bool(docker_path and docker_probe and docker_probe["ok"]),
        "evidence": {
            "docker_path": docker_path,
            "probe": docker_probe,
        },
    }
    checks["disk-memory"] = {
        "detected": root_usage.free >= MIN_FREE_DISK_BYTES
        and (memory_total is None or memory_total >= MIN_MEMORY_BYTES),
        "evidence": {
            "free_disk_bytes": root_usage.free,
            "required_free_disk_bytes": MIN_FREE_DISK_BYTES,
            "memory_bytes": memory_total,
            "required_memory_bytes": MIN_MEMORY_BYTES,
        },
    }
    checks["ollama"] = {
        "detected": bool(ollama_path),
        "evidence": {
            "ollama_path": ollama_path,
        },
    }
    if system == "windows":
        wsl_path = shutil.which("wsl.exe") or shutil.which("wsl")
        wsl_probe = _run_probe([wsl_path, "--status"]) if wsl_path else None
        checks["wsl2"] = {
            "detected": bool(wsl_path and wsl_probe and wsl_probe["ok"]),
            "evidence": {
                "wsl_path": wsl_path,
                "probe": wsl_probe,
            },
        }
    checks["civiccore-compatibility"] = {
        "detected": True,
        "evidence": {
            "source": "installer/modules.json",
            "note": "Compatibility is manifest-based in this dry-run slice.",
        },
    }
    return {
        "dry_run": True,
        "mutates_host": False,
        "detection_source": "host_read_only",
        "host": host_info,
        "checks": checks,
    }


def _readiness_messages() -> dict[str, dict[str, Any]]:
    return {
        "container-runtime": {
            "ok": "Container runtime is available for CivicSuite services.",
            "fail": "Docker Desktop or Docker Engine is not available.",
            "severity": "blocker",
            "fix_steps": [
                "Install Docker Desktop on Windows/macOS or Docker Engine on Linux.",
                "Start Docker and wait until it reports that the engine is running.",
                "Run the dry-run readiness check again before installing modules.",
            ],
        },
        "wsl2": {
            "ok": "WSL 2 support is available for Docker Desktop on Windows.",
            "fail": "WSL 2 or Virtual Machine Platform is missing on Windows.",
            "severity": "blocker",
            "fix_steps": [
                "Enable WSL 2 and Virtual Machine Platform from Windows Features.",
                "Reboot Windows if the feature installer asks for it.",
                "Open Docker Desktop and confirm it is using the WSL 2 backend.",
            ],
        },
        "disk-memory": {
            "ok": "Host resources are sufficient for the selected profile.",
            "fail": "The selected profile may not have enough disk or memory.",
            "severity": "blocker",
            "fix_steps": [
                "Free disk space or choose a smaller installer profile.",
                "Close memory-heavy applications before starting local services.",
                "Re-run readiness after changing the profile or host resources.",
            ],
        },
        "ollama": {
            "ok": "Ollama is available when local LLM features are selected.",
            "fail": "Ollama is not available; local LLM features may be disabled.",
            "severity": "warning",
            "fix_steps": [
                "Install Ollama if this profile will use local LLM features.",
                "Start Ollama and confirm models are available.",
                "Continue without Ollama only if local LLM behavior is not required.",
            ],
        },
        "civiccore-compatibility": {
            "ok": "Selected modules are compatible with their recorded CivicCore requirements.",
            "fail": "One or more selected modules require a different CivicCore version.",
            "severity": "blocker",
            "fix_steps": [
                "Review the selected module list and CivicCore requirement in installer/modules.json.",
                "Choose a compatible profile or update the compatibility matrix before install.",
                "Do not install a module against an unverified CivicCore version.",
            ],
        },
    }


def build_menu_model(*, manifest: dict[str, Any], menu_style: str = "guided") -> dict[str, Any]:
    profiles = _profiles_by_id(manifest)
    modules = _modules_by_id(manifest)
    menu_styles = _menu_styles_by_id(manifest)
    if menu_style not in menu_styles:
        raise PlannerError(f"Unknown menu style: {menu_style}")

    selectable_modules = [
        {
            "id": module_id,
            "display_name": module.get("display_name"),
            "role": module.get("role"),
            "tier": module.get("tier"),
            "dependencies": module.get("dependencies", []),
            "civiccore_requirement": module.get("civiccore_requirement"),
        }
        for module_id, module in modules.items()
        if module.get("selectable") is True
    ]

    profile_choices = [
        {
            "id": profile_id,
            "label": profile.get("label"),
            "description": profile.get("description"),
            "modules": profile.get("modules", []),
        }
        for profile_id, profile in profiles.items()
    ]

    return {
        "dry_run": True,
        "mutates_host": False,
        "menu_style": menu_styles[menu_style],
        "default_profile": "clerk-core",
        "profile_choices": profile_choices,
        "module_selector": {
            "source": "installer/modules.json",
            "civiccore_is_required": True,
            "selectable_modules": selectable_modules,
        },
    }


def build_readiness_model(
    *,
    manifest: dict[str, Any],
    profile_id: str,
    selected_modules: list[str] | None = None,
    menu_style: str = "guided",
    host: dict[str, str] | None = None,
    scenario: str = "nominal",
    detected: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if scenario not in READINESS_SCENARIOS:
        raise PlannerError(f"Unknown readiness scenario: {scenario}")
    plan = build_install_plan(
        manifest=manifest,
        profile_id=profile_id,
        selected_modules=selected_modules,
        menu_style=menu_style,
        host=host,
    )
    failed_checks = READINESS_SCENARIOS[scenario]
    messages = _readiness_messages()
    checks: list[dict[str, Any]] = []

    check_ids = [action["id"] for action in plan["actions"] if action.get("type") == "check"]
    check_ids.append("civiccore-compatibility")
    for check_id in check_ids:
        message = messages[check_id]
        detected_check = None
        if detected:
            detected_checks = detected.get("checks", {})
            if isinstance(detected_checks, dict):
                detected_check = detected_checks.get(check_id)
        failed = check_id in failed_checks
        if detected_check is not None:
            failed = not bool(detected_check.get("detected"))
        checks.append(
            {
                "id": check_id,
                "status": "failed" if failed else "passed",
                "severity": message["severity"] if failed else "info",
                "message": message["fail"] if failed else message["ok"],
                "fix_steps": message["fix_steps"] if failed else [],
                "evidence": detected_check.get("evidence", {}) if isinstance(detected_check, dict) else {},
            }
        )

    blockers = [check for check in checks if check["status"] == "failed" and check["severity"] == "blocker"]
    warnings = [check for check in checks if check["status"] == "failed" and check["severity"] == "warning"]
    return {
        "dry_run": True,
        "mutates_host": False,
        "profile": profile_id,
        "menu_style": plan["menu_style"],
        "host": plan["host"],
        "scenario": scenario,
        "detection_source": detected.get("detection_source") if detected else "synthetic",
        "readiness": {
            "status": "blocked" if blockers else "warning" if warnings else "ready",
            "checks": checks,
            "next_action": (
                "Resolve blocker fix steps, then run readiness again."
                if blockers
                else "Review warning fix steps or continue if the limitation is acceptable."
                if warnings
                else "Continue to dry-run install planning; no host changes have been made."
            ),
        },
    }


def build_execution_gate(
    *,
    manifest: dict[str, Any],
    profile_id: str,
    selected_modules: list[str] | None = None,
    menu_style: str = "guided",
    approval_token: str | None = None,
) -> dict[str, Any]:
    plan = build_install_plan(
        manifest=manifest,
        profile_id=profile_id,
        selected_modules=selected_modules,
        menu_style=menu_style,
    )
    approved = approval_token == EXECUTION_TOKEN
    return {
        "dry_run": True,
        "mutates_host": False,
        "execution_requested": True,
        "execution_status": "not_implemented",
        "gate_status": "approved_but_executor_missing" if approved else "blocked",
        "approval_required": EXECUTION_TOKEN,
        "approval_received": approved,
        "message": (
            "Execution approval token was provided, but no mutating executor exists in this slice."
            if approved
            else "Install execution is blocked. Re-run with dry-run planning, or provide the explicit approval token only after a mutating executor is reviewed and authorized."
        ),
        "next_action": (
            "Build and review the real executor in a separate guarded slice before allowing host mutation."
            if approved
            else "Review the dry-run plan and readiness output; do not install until the execution gate is intentionally implemented."
        ),
        "planned_modules": plan["modules"],
        "planned_action_count": len(plan["actions"]),
    }


def build_executor_design(
    *,
    manifest: dict[str, Any],
    profile_id: str,
    selected_modules: list[str] | None = None,
    menu_style: str = "guided",
) -> dict[str, Any]:
    plan = build_install_plan(
        manifest=manifest,
        profile_id=profile_id,
        selected_modules=selected_modules,
        menu_style=menu_style,
    )
    return {
        "dry_run": True,
        "mutates_host": False,
        "executor_status": "design_only",
        "profile": profile_id,
        "menu_style": plan["menu_style"],
        "planned_modules": plan["modules"],
        "state_machine": {
            "entry_phase": "preflight",
            "terminal_phases": ["verify", "rollback"],
            "phases": EXECUTOR_PHASES,
            "transition_order": ["preflight", "approval", "execute", "verify", "repair", "rollback"],
        },
        "implementation_boundary": {
            "allowed_now": [
                "render executor design",
                "validate required phases",
                "verify mutating phases are marked future-only",
            ],
            "forbidden_now": [
                "install dependencies",
                "start services",
                "start containers",
                "write host configuration",
                "run module installers",
            ],
        },
        "next_action": "Review executor design before any mutating executor implementation is created.",
    }


def build_evidence_schema(
    *,
    manifest: dict[str, Any],
    profile_id: str,
    selected_modules: list[str] | None = None,
    menu_style: str = "guided",
) -> dict[str, Any]:
    executor = build_executor_design(
        manifest=manifest,
        profile_id=profile_id,
        selected_modules=selected_modules,
        menu_style=menu_style,
    )
    phase_ids = {phase["id"] for phase in EXECUTOR_PHASES}
    report_phase_ids = {report["phase"] for report in EVIDENCE_REPORTS}
    missing_phase_reports = sorted(phase_ids - report_phase_ids)
    return {
        "dry_run": True,
        "mutates_host": False,
        "schema_version": EVIDENCE_SCHEMA_VERSION,
        "profile": profile_id,
        "planned_modules": executor["planned_modules"],
        "report_root": "installer/reports/{run_id}",
        "run_id_format": "UTC timestamp plus short random suffix",
        "reports": EVIDENCE_REPORTS,
        "validation_rules": [
            "Every executor phase must have at least one evidence report.",
            "Every evidence report must include run_id and required_fields.",
            "Mutating phases must write append-only logs before and after each mutating step.",
            "Reports must record operator-facing next actions for failures.",
            "Reports must not persist secrets, raw environment dumps, auth headers, or data payloads.",
        ],
        "missing_phase_reports": missing_phase_reports,
        "next_action": "Review evidence schema before implementing report writers or mutating executor phases.",
    }


def build_install_plan(
    *,
    manifest: dict[str, Any],
    profile_id: str,
    selected_modules: list[str] | None = None,
    menu_style: str = "guided",
    host: dict[str, str] | None = None,
) -> dict[str, Any]:
    profiles = _profiles_by_id(manifest)
    modules = _modules_by_id(manifest)
    menu_styles = _menu_styles_by_id(manifest)
    if profile_id not in profiles:
        raise PlannerError(f"Unknown profile: {profile_id}")
    if menu_style not in menu_styles:
        raise PlannerError(f"Unknown menu style: {menu_style}")

    profile = profiles[profile_id]
    if profile_id == "custom":
        requested = selected_modules or []
        if not requested:
            raise PlannerError("Custom profile requires at least one selected module.")
        requested_modules = ["civiccore", *requested]
    else:
        profile_modules = profile.get("modules", [])
        if not isinstance(profile_modules, list):
            raise PlannerError(f"Profile {profile_id} modules must be a list.")
        requested_modules = [str(module_id) for module_id in profile_modules]

    ordered_ids = _resolve_module_order(requested_modules, modules)
    host_info = host or _host_platform()
    baseline_checks = _baseline_checks(str(host_info.get("system", "")))

    actions: list[dict[str, Any]] = []
    for check in baseline_checks:
        actions.append({"type": "check", **check})
    for module_id in ordered_ids:
        module = modules[module_id]
        actions.append(
            {
                "type": "install_module",
                "module": module_id,
                "display_name": module.get("display_name"),
                "repo": module.get("repo"),
                "civiccore_requirement": module.get("civiccore_requirement"),
                "proof_required": module.get("proof_required", []),
            }
        )
    actions.append(
        {
            "type": "verify_profile",
            "profile": profile_id,
            "proof": ["health_checks", "restart", "actionable_failure_copy"],
        }
    )

    return {
        "dry_run": True,
        "mutates_host": False,
        "profile": profile_id,
        "profile_label": profile.get("label"),
        "menu_style": menu_styles[menu_style],
        "host": host_info,
        "modules": ordered_ids,
        "actions": actions,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a non-mutating CivicSuite installer plan.")
    parser.add_argument("--profile", required=True, help="Profile id from installer/modules.json.")
    parser.add_argument(
        "--module",
        action="append",
        default=[],
        help="Module id for custom profile. May be passed more than once.",
    )
    parser.add_argument("--manifest", default=str(MANIFEST))
    parser.add_argument(
        "--menu-style",
        default="guided",
        help="Menu style id from installer/modules.json.",
    )
    parser.add_argument(
        "--show-menu",
        action="store_true",
        help="Print the non-mutating profile/module selector model.",
    )
    parser.add_argument(
        "--show-readiness",
        action="store_true",
        help="Print the non-mutating readiness/error-state model.",
    )
    parser.add_argument(
        "--detect-host",
        action="store_true",
        help="Use read-only host dependency detection for readiness output.",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Request install execution. This slice always returns a non-mutating gate result.",
    )
    parser.add_argument(
        "--show-executor-design",
        action="store_true",
        help="Print the future executor state machine without implementing host mutation.",
    )
    parser.add_argument(
        "--show-evidence-schema",
        action="store_true",
        help="Print the future installer evidence/report schema without writing reports.",
    )
    parser.add_argument(
        "--approval-token",
        default=None,
        help="Explicit approval token for future mutating execution gates.",
    )
    parser.add_argument(
        "--readiness-scenario",
        default="nominal",
        choices=sorted(READINESS_SCENARIOS),
        help="Synthetic dry-run readiness state to render.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Required; planner does not mutate host state.")
    args = parser.parse_args()

    if not args.dry_run:
        print("ERROR: --dry-run is required. This planner is non-mutating.", file=sys.stderr)
        return 2

    try:
        manifest = load_manifest(Path(args.manifest))
        if args.show_menu:
            plan = build_menu_model(manifest=manifest, menu_style=args.menu_style)
        elif args.show_readiness:
            detected = detect_host_dependencies() if args.detect_host else None
            plan = build_readiness_model(
                manifest=manifest,
                profile_id=args.profile,
                selected_modules=[str(module) for module in args.module],
                menu_style=args.menu_style,
                scenario=args.readiness_scenario,
                detected=detected,
            )
        elif args.execute:
            plan = build_execution_gate(
                manifest=manifest,
                profile_id=args.profile,
                selected_modules=[str(module) for module in args.module],
                menu_style=args.menu_style,
                approval_token=args.approval_token,
            )
        elif args.show_executor_design:
            plan = build_executor_design(
                manifest=manifest,
                profile_id=args.profile,
                selected_modules=[str(module) for module in args.module],
                menu_style=args.menu_style,
            )
        elif args.show_evidence_schema:
            plan = build_evidence_schema(
                manifest=manifest,
                profile_id=args.profile,
                selected_modules=[str(module) for module in args.module],
                menu_style=args.menu_style,
            )
        else:
            plan = build_install_plan(
                manifest=manifest,
                profile_id=args.profile,
                selected_modules=[str(module) for module in args.module],
                menu_style=args.menu_style,
            )
    except PlannerError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    print(json.dumps(plan, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
