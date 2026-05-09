"""Verify the CivicSuite suite-installer design contract."""

from __future__ import annotations

import json
import os
import shutil
import sys
import importlib.util
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "installer" / "modules.json"
CONTRACT = ROOT / "installer" / "README.md"
PLAN = ROOT / "docs" / "installer" / "suite-installer-plan.md"
PLANNER = ROOT / "scripts" / "plan-installer.py"
CLEANROOM_RUNNER = ROOT / "scripts" / "run-minimal-cleanroom.py"
SERVICE_CLEANROOM_RUNNER = ROOT / "scripts" / "run-civicrecords-cleanroom.py"
WINDOWS_LAUNCHER = ROOT / "installer" / "windows" / "plan-installer.ps1"
MACOS_LAUNCHER = ROOT / "installer" / "macos" / "plan-installer.sh"
LINUX_LAUNCHER = ROOT / "installer" / "linux" / "plan-installer.sh"
GENERATED_MINIMAL = ROOT / "installer" / "generated" / "minimal"

REQUIRED_PROFILES = {"minimal", "clerk-core", "land-use", "full-suite", "custom"}
REQUIRED_MODULES = {
    "civiccore",
    "civicrecords-ai",
    "civicclerk",
    "civiccode",
    "civiczone",
    "civicaccess",
    "civicplan",
    "civicpermit",
    "civicinspect",
    "civicgrants",
    "civicprocure",
    "civiccontracts",
    "civicboards",
    "civicnotice",
    "civic311",
    "civiccomms",
    "civicdata",
    "civichr",
    "civicbudget",
    "civiclegal",
    "civicelections",
    "civicutility",
    "civiccourt",
    "civicsafety",
    "civiclibrary",
    "civicparks",
}
REQUIRED_DOC_PHRASES = (
    "zero-baseline machine",
    "CivicCore",
    "module selector",
    "menu style",
    "readiness",
    "fix steps",
    "execution gate",
    "dependency detection",
    "executor state machine",
    "evidence schema",
    "report writer",
    "artifact/version resolver",
    "profile config",
    "health-check plan",
    "executor preflight",
    "install kit",
    "cleanroom",
    "cleanroom gate",
    "Playwright",
    "Windows",
    "macOS",
    "Linux",
    "design contract, not implementation",
)


def fail(message: str) -> str:
    return f"FAIL: {message}"


def load_manifest() -> dict[str, object]:
    with MANIFEST.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise AssertionError("manifest root must be a JSON object")
    return data


def has_local_civiccore_wheel() -> bool:
    if os.environ.get("CIVICSUITE_VERIFY_NO_LOCAL_CIVICCORE") == "1":
        return False
    dist = ROOT.parent / "civiccore" / "dist"
    return dist.is_dir() and any(dist.glob("civiccore-*.whl"))


def check_docs() -> list[str]:
    errors: list[str] = []
    for path in (CONTRACT, PLAN):
        if not path.is_file():
            errors.append(fail(f"missing {path.relative_to(ROOT)}"))
            continue
        text = path.read_text(encoding="utf-8")
        for phrase in REQUIRED_DOC_PHRASES:
            if phrase not in text:
                errors.append(fail(f"{path.relative_to(ROOT)} missing phrase: {phrase}"))
    return errors


def check_manifest(data: dict[str, object]) -> list[str]:
    errors: list[str] = []
    if data.get("schema_version") != 1:
        errors.append(fail("schema_version must be 1"))
    if data.get("installer_status") != "design_contract":
        errors.append(fail("installer_status must be design_contract"))

    menu_styles = data.get("menu_styles")
    profiles = data.get("profiles")
    modules = data.get("modules")
    if not isinstance(menu_styles, list):
        return errors + [fail("menu_styles must be a list")]
    if not isinstance(profiles, list):
        return errors + [fail("profiles must be a list")]
    if not isinstance(modules, list):
        return errors + [fail("modules must be a list")]

    style_ids = {str(style.get("id")) for style in menu_styles if isinstance(style, dict)}
    required_styles = {"guided", "department", "advanced"}
    missing_styles = required_styles - style_ids
    if missing_styles:
        errors.append(fail(f"missing menu styles: {', '.join(sorted(missing_styles))}"))

    profile_ids = {str(profile.get("id")) for profile in profiles if isinstance(profile, dict)}
    missing_profiles = REQUIRED_PROFILES - profile_ids
    if missing_profiles:
        errors.append(fail(f"missing profiles: {', '.join(sorted(missing_profiles))}"))

    module_by_id = {
        str(module.get("id")): module
        for module in modules
        if isinstance(module, dict) and module.get("id")
    }
    missing_modules = REQUIRED_MODULES - set(module_by_id)
    if missing_modules:
        errors.append(fail(f"missing modules: {', '.join(sorted(missing_modules))}"))
    extra_modules = set(module_by_id) - REQUIRED_MODULES
    if extra_modules:
        errors.append(fail(f"unexpected modules: {', '.join(sorted(extra_modules))}"))
    if len(module_by_id) != len(modules):
        errors.append(fail("module ids must be unique and every module must have an id"))

    civiccore = module_by_id.get("civiccore", {})
    if isinstance(civiccore, dict):
        if civiccore.get("selectable") is not False:
            errors.append(fail("civiccore must not be directly selectable"))
        if civiccore.get("required") is not True:
            errors.append(fail("civiccore must be required"))

    for module_id, module in module_by_id.items():
        if not isinstance(module, dict):
            continue
        dependencies = module.get("dependencies", [])
        if not isinstance(dependencies, list):
            errors.append(fail(f"{module_id} dependencies must be a list"))
            continue
        for dependency in dependencies:
            if dependency not in module_by_id:
                errors.append(fail(f"{module_id} depends on unknown module {dependency}"))
        proof = module.get("proof_required", [])
        if not isinstance(proof, list) or not proof:
            errors.append(fail(f"{module_id} must define proof_required"))

    for profile in profiles:
        if not isinstance(profile, dict):
            errors.append(fail("profile entry must be an object"))
            continue
        profile_modules = profile.get("modules", [])
        if not isinstance(profile_modules, list):
            errors.append(fail(f"profile {profile.get('id')} modules must be a list"))
            continue
        if profile.get("id") != "custom" and "civiccore" not in profile_modules:
            errors.append(fail(f"profile {profile.get('id')} must include civiccore"))
        for module_id in profile_modules:
            if module_id not in module_by_id:
                errors.append(fail(f"profile {profile.get('id')} references unknown module {module_id}"))

    return errors


def check_planner(data: dict[str, object]) -> list[str]:
    errors: list[str] = []
    if not PLANNER.is_file():
        return [fail(f"missing {PLANNER.relative_to(ROOT)}")]
    if not CLEANROOM_RUNNER.is_file():
        errors.append(fail(f"missing {CLEANROOM_RUNNER.relative_to(ROOT)}"))
    if not SERVICE_CLEANROOM_RUNNER.is_file():
        errors.append(fail(f"missing {SERVICE_CLEANROOM_RUNNER.relative_to(ROOT)}"))

    spec = importlib.util.spec_from_file_location("plan_installer", PLANNER)
    if spec is None or spec.loader is None:
        return [fail("could not load planner module")]
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    scenarios = {
        "minimal": ["civiccore"],
        "clerk-core": ["civiccore", "civicrecords-ai", "civicclerk"],
        "land-use": ["civiccore", "civicclerk", "civiccode", "civiczone", "civicplan", "civicpermit"],
        "full-suite": [
            "civiccore",
            "civicrecords-ai",
            "civicclerk",
            "civiccode",
            "civiczone",
            "civicaccess",
            "civicplan",
            "civicpermit",
            "civicinspect",
            "civicgrants",
            "civicprocure",
            "civiccontracts",
            "civicboards",
            "civicnotice",
            "civic311",
            "civiccomms",
            "civicdata",
            "civichr",
            "civicbudget",
            "civiclegal",
            "civicelections",
            "civicutility",
            "civiccourt",
            "civicsafety",
            "civiclibrary",
            "civicparks",
        ],
    }
    for profile, expected_modules in scenarios.items():
        plan = module.build_install_plan(
            manifest=data,
            profile_id=profile,
            menu_style="guided",
            host={"system": "Windows", "release": "test", "machine": "x86_64"},
        )
        if plan.get("mutates_host") is not False:
            errors.append(fail(f"{profile} plan must be non-mutating"))
        if plan.get("dry_run") is not True:
            errors.append(fail(f"{profile} plan must be marked dry_run"))
        if plan.get("modules") != expected_modules:
            errors.append(fail(f"{profile} module order {plan.get('modules')} != {expected_modules}"))
        action_types = [action.get("type") for action in plan.get("actions", []) if isinstance(action, dict)]
        if "check" not in action_types:
            errors.append(fail(f"{profile} plan missing baseline checks"))
        if "install_module" not in action_types:
            errors.append(fail(f"{profile} plan missing install_module actions"))
        if action_types[-1:] != ["verify_profile"]:
            errors.append(fail(f"{profile} plan must end with verify_profile"))
        if plan.get("menu_style", {}).get("id") != "guided":
            errors.append(fail(f"{profile} plan missing guided menu style"))

    menu_model = module.build_menu_model(manifest=data, menu_style="department")
    if menu_model.get("mutates_host") is not False:
        errors.append(fail("menu model must be non-mutating"))
    if menu_model.get("menu_style", {}).get("id") != "department":
        errors.append(fail("menu model must preserve selected menu style"))
    profile_ids = {
        profile.get("id")
        for profile in menu_model.get("profile_choices", [])
        if isinstance(profile, dict)
    }
    if not REQUIRED_PROFILES.issubset(profile_ids):
        errors.append(fail("menu model must expose all required profiles"))
    selector = menu_model.get("module_selector", {})
    selectable = selector.get("selectable_modules", []) if isinstance(selector, dict) else []
    if not isinstance(selectable, list) or len(selectable) != len(REQUIRED_MODULES) - 1:
        errors.append(fail("menu model must expose every selectable non-CivicCore module"))

    readiness_scenarios = {
        "nominal": "ready",
        "missing-docker": "blocked",
        "windows-missing-wsl": "blocked",
        "low-resources": "blocked",
        "ollama-missing": "warning",
        "civiccore-mismatch": "blocked",
    }
    for scenario, expected_status in readiness_scenarios.items():
        readiness = module.build_readiness_model(
            manifest=data,
            profile_id="clerk-core",
            menu_style="guided",
            host={"system": "Windows", "release": "test", "machine": "x86_64"},
            scenario=scenario,
        )
        if readiness.get("mutates_host") is not False:
            errors.append(fail(f"{scenario} readiness must be non-mutating"))
        readiness_block = readiness.get("readiness", {})
        if readiness_block.get("status") != expected_status:
            errors.append(fail(f"{scenario} readiness status {readiness_block.get('status')} != {expected_status}"))
        if not readiness_block.get("next_action"):
            errors.append(fail(f"{scenario} readiness missing next_action"))
        checks = readiness_block.get("checks", [])
        failed_checks = [
            check
            for check in checks
            if isinstance(check, dict) and check.get("status") == "failed"
        ]
        for check in failed_checks:
            if not check.get("message"):
                errors.append(fail(f"{scenario} failed check missing message"))
            fix_steps = check.get("fix_steps")
            if not isinstance(fix_steps, list) or len(fix_steps) < 2:
                errors.append(fail(f"{scenario} failed check missing actionable fix_steps"))

    detected = module.detect_host_dependencies(host={"system": "Windows", "release": "test", "machine": "x86_64"})
    if detected.get("mutates_host") is not False:
        errors.append(fail("host dependency detection must be non-mutating"))
    if detected.get("detection_source") != "host_read_only":
        errors.append(fail("host dependency detection must identify host_read_only source"))
    detected_readiness = module.build_readiness_model(
        manifest=data,
        profile_id="clerk-core",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
        detected=detected,
    )
    readiness_block = detected_readiness.get("readiness", {})
    if detected_readiness.get("mutates_host") is not False:
        errors.append(fail("detected readiness must be non-mutating"))
    if detected_readiness.get("detection_source") != "host_read_only":
        errors.append(fail("detected readiness must preserve host_read_only source"))
    if readiness_block.get("status") not in {"ready", "warning", "blocked"}:
        errors.append(fail(f"detected readiness has invalid status {readiness_block.get('status')}"))
    for check in readiness_block.get("checks", []):
        if isinstance(check, dict) and "evidence" not in check:
            errors.append(fail("detected readiness checks must include evidence"))

    blocked_gate = module.build_execution_gate(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
    )
    if blocked_gate.get("mutates_host") is not False:
        errors.append(fail("blocked execution gate must be non-mutating"))
    if blocked_gate.get("gate_status") != "blocked":
        errors.append(fail("execution gate without token must be blocked"))
    if not blocked_gate.get("next_action"):
        errors.append(fail("blocked execution gate missing next_action"))

    approved_gate = module.build_execution_gate(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
        approval_token=module.EXECUTION_TOKEN,
    )
    if approved_gate.get("mutates_host") is not False:
        errors.append(fail("approved execution gate must still be non-mutating"))
    if approved_gate.get("execution_status") != "not_implemented":
        errors.append(fail("approved execution gate must not imply execution exists"))

    executor_design = module.build_executor_design(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
    )
    if executor_design.get("mutates_host") is not False:
        errors.append(fail("executor design must be non-mutating"))
    if executor_design.get("executor_status") != "design_only":
        errors.append(fail("executor design must be design_only"))
    phases = executor_design.get("state_machine", {}).get("phases", [])
    phase_ids = {phase.get("id") for phase in phases if isinstance(phase, dict)}
    required_phases = {"preflight", "approval", "execute", "verify", "repair", "rollback"}
    if phase_ids != required_phases:
        errors.append(fail(f"executor design phases {sorted(phase_ids)} != {sorted(required_phases)}"))
    mutating_phases = [
        phase for phase in phases if isinstance(phase, dict) and phase.get("mutates_host") is True
    ]
    if {phase.get("id") for phase in mutating_phases} != {"execute", "repair", "rollback"}:
        errors.append(fail("executor design must mark only execute/repair/rollback as future mutating phases"))
    for phase in phases:
        if not isinstance(phase, dict):
            continue
        if not phase.get("required_evidence"):
            errors.append(fail(f"executor phase {phase.get('id')} missing required_evidence"))
        if not phase.get("blocks_on"):
            errors.append(fail(f"executor phase {phase.get('id')} missing blocks_on"))

    evidence_schema = module.build_evidence_schema(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
    )
    if evidence_schema.get("mutates_host") is not False:
        errors.append(fail("evidence schema must be non-mutating"))
    if evidence_schema.get("schema_version") != 1:
        errors.append(fail("evidence schema version must be 1"))
    if evidence_schema.get("missing_phase_reports"):
        errors.append(fail(f"evidence schema missing phase reports: {evidence_schema.get('missing_phase_reports')}"))
    reports = evidence_schema.get("reports", [])
    report_ids = set()
    for report in reports:
        if not isinstance(report, dict):
            errors.append(fail("evidence report entries must be objects"))
            continue
        report_id = report.get("id")
        if not report_id:
            errors.append(fail("evidence report missing id"))
        if report_id in report_ids:
            errors.append(fail(f"duplicate evidence report id {report_id}"))
        report_ids.add(report_id)
        required_fields = report.get("required_fields")
        if not isinstance(required_fields, list) or "run_id" not in required_fields:
            errors.append(fail(f"evidence report {report_id} must require run_id"))
        if "installer/reports/{run_id}/" not in str(report.get("path_template")):
            errors.append(fail(f"evidence report {report_id} must live under installer/reports/{{run_id}}"))
        if not report.get("redaction"):
            errors.append(fail(f"evidence report {report_id} missing redaction rule"))

    run_id = "verify-installer-report-writer"
    dry_run_plan = module.build_install_plan(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
    )
    report_result = module.write_report_for_plan(plan=dry_run_plan, mode="plan", run_id=run_id)
    report_paths = report_result.get("reports_written", [])
    if report_result.get("mutates_host") is not False:
        errors.append(fail("report writer must be non-mutating to host"))
    if report_paths != ["installer\\reports\\verify-installer-report-writer\\dry-run-plan.json"] and report_paths != [
        "installer/reports/verify-installer-report-writer/dry-run-plan.json"
    ]:
        errors.append(fail(f"unexpected dry-run report paths: {report_paths}"))
    dry_run_report = ROOT / "installer" / "reports" / run_id / "dry-run-plan.json"
    if not dry_run_report.is_file():
        errors.append(fail("dry-run report writer did not create dry-run-plan.json"))
    else:
        report_data = json.loads(dry_run_report.read_text(encoding="utf-8"))
        for field in ("run_id", "profile", "modules", "actions", "mutates_host"):
            if field not in report_data:
                errors.append(fail(f"dry-run report missing {field}"))
        if report_data.get("mutates_host") is not False:
            errors.append(fail("dry-run report must record mutates_host false"))

    readiness = module.build_readiness_model(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
        scenario="missing-docker",
    )
    module.write_report_for_plan(plan=readiness, mode="readiness", run_id=run_id)
    readiness_report = ROOT / "installer" / "reports" / run_id / "readiness.json"
    if not readiness_report.is_file():
        errors.append(fail("readiness report writer did not create readiness.json"))
    else:
        readiness_data = json.loads(readiness_report.read_text(encoding="utf-8"))
        if readiness_data.get("status") != "blocked":
            errors.append(fail("readiness report should record blocked missing-docker scenario"))
        if not readiness_data.get("next_action"):
            errors.append(fail("readiness report missing next_action"))

    gate = module.build_execution_gate(manifest=data, profile_id="minimal", menu_style="guided")
    module.write_report_for_plan(plan=gate, mode="approval", run_id=run_id)
    approval_report = ROOT / "installer" / "reports" / run_id / "approval.json"
    if not approval_report.is_file():
        errors.append(fail("approval report writer did not create approval.json"))
    else:
        approval_data = json.loads(approval_report.read_text(encoding="utf-8"))
        if approval_data.get("approval_received") is not False:
            errors.append(fail("approval report should record no approval token by default"))
        if "approval_required" not in approval_data:
            errors.append(fail("approval report missing approval_required"))

    try:
        module._write_json_report("approval_record", {"run_id": "bad", "token": "secret"})
    except Exception as exc:
        if "secret" not in str(exc) and "required field" not in str(exc):
            errors.append(fail(f"secret-shaped report failed with wrong error: {exc}"))
    else:
        errors.append(fail("secret-shaped report should be rejected"))

    artifacts = module.build_artifact_resolution(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
    )
    if artifacts.get("mutates_host") is not False:
        errors.append(fail("artifact resolver must be non-mutating"))
    if not artifacts.get("artifacts"):
        errors.append(fail("artifact resolver must return artifact rows"))
    if artifacts.get("status") not in {"ready", "warning", "blocked"}:
        errors.append(fail(f"artifact resolver invalid status {artifacts.get('status')}"))
    module.write_report_for_plan(plan=artifacts, mode="artifacts", run_id=run_id)
    artifact_report = ROOT / "installer" / "reports" / run_id / "artifact-versions.json"
    if not artifact_report.is_file():
        errors.append(fail("artifact report writer did not create artifact-versions.json"))
    else:
        artifact_data = json.loads(artifact_report.read_text(encoding="utf-8"))
        if artifact_data.get("mutates_host") is not False or not artifact_data.get("artifacts"):
            errors.append(fail("artifact report must be non-mutating and include artifacts"))

    profile_config = module.build_profile_config(
        manifest=data,
        profile_id="clerk-core",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
    )
    if profile_config.get("mutates_host") is not False:
        errors.append(fail("profile config planner must be non-mutating"))
    if not profile_config.get("services") or not profile_config.get("data_paths"):
        errors.append(fail("profile config planner must include services and data paths"))
    module.write_report_for_plan(plan=profile_config, mode="profile_config", run_id=run_id)
    service_report = ROOT / "installer" / "reports" / run_id / "service-config.json"
    if not service_report.is_file():
        errors.append(fail("profile config report writer did not create service-config.json"))

    health_plan = module.build_health_check_plan(
        manifest=data,
        profile_id="clerk-core",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
    )
    if health_plan.get("mutates_host") is not False or health_plan.get("starts_service") is not False:
        errors.append(fail("health-check plan must not mutate or start services"))
    if not health_plan.get("checks"):
        errors.append(fail("health-check plan must include checks"))
    module.write_report_for_plan(plan=health_plan, mode="health_checks", run_id=run_id)
    health_report = ROOT / "installer" / "reports" / run_id / "health-checks.json"
    if not health_report.is_file():
        errors.append(fail("health-check report writer did not create health-checks.json"))

    preflight = module.build_executor_preflight(
        manifest=data,
        profile_id="minimal",
        menu_style="guided",
        host={"system": "Windows", "release": "test", "machine": "x86_64"},
    )
    if preflight.get("mutates_host") is not False:
        errors.append(fail("executor preflight must be non-mutating"))
    if preflight.get("status") != "blocked" or "executor_not_implemented" not in preflight.get("blockers", []):
        errors.append(fail("executor preflight must remain blocked while executor is not implemented"))

    if not hasattr(module, "run_clerk_core_cleanroom_proof"):
        errors.append(fail("planner must expose clerk-core cleanroom proof runner"))
    if not hasattr(module, "run_clerk_core_cleanroom_gate"):
        errors.append(fail("planner must expose clerk-core cleanroom gate runner"))
    if not hasattr(module, "summarize_clerk_core_cleanroom_gate"):
        errors.append(fail("planner must expose clerk-core cleanroom gate summarizer"))
    else:
        gate_summary = module.summarize_clerk_core_cleanroom_gate(
            {
                "status": "passed",
                "run_id": "verify-summary-only",
                "proof_path": "installer/reports/verify-summary-only/service-ui-proof.json",
                "api_health": "passed",
                "frontend_health": "passed",
                "playwright_live_ui": "passed",
            }
        )
        if gate_summary.get("gate") != "clerk-core-cleanroom" or gate_summary.get("status") != "passed":
            errors.append(fail("cleanroom gate summary must expose a named passed gate"))
        if gate_summary.get("dry_run") is not False or gate_summary.get("mutates_host") is not True:
            errors.append(fail("cleanroom gate summary must clearly mark mutating non-dry-run scope"))
        if len(gate_summary.get("checks", [])) != 3:
            errors.append(fail("cleanroom gate summary must include API, frontend, and Playwright checks"))
        failed_summary = module.summarize_clerk_core_cleanroom_gate(
            {
                "status": "failed",
                "run_id": "verify-summary-only",
                "proof_path": "installer/reports/verify-summary-only/service-ui-proof.json",
                "api_health": "passed",
                "frontend_health": "failed",
                "playwright_live_ui": None,
            }
        )
        if failed_summary.get("status") != "failed" or "Gate failed" not in failed_summary.get("next_action", ""):
            errors.append(fail("cleanroom gate summary must provide actionable failure output"))

    for flag in ("--run-cleanroom-proof", "--run-cleanroom-gate"):
        proc = subprocess.run(
            [
                sys.executable,
                str(PLANNER),
                "--profile",
                "clerk-core",
                flag,
                "--dry-run",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0:
            errors.append(fail(f"{flag} must reject --dry-run because it mutates Docker/evidence state"))
        if "cannot be combined" not in proc.stderr:
            errors.append(fail(f"{flag} dry-run rejection must explain the operator fix"))

    if has_local_civiccore_wheel():
        install_kit = module.generate_minimal_install_kit(manifest=data)
        if install_kit.get("mutates_host") is not False:
            errors.append(fail("minimal install kit generator must not mutate host state"))
        if install_kit.get("installer_scripts_mutate_when_run") is not True:
            errors.append(fail("minimal install kit must clearly label installer scripts as mutating when run"))
    expected_generated = {
        "README.md",
        "requirements.txt",
        "civiccore-install-plan.json",
        "install-civiccore.ps1",
        "install-civiccore.sh",
        "verify-civiccore.ps1",
        "verify-civiccore.sh",
        "reset-civiccore.ps1",
        "reset-civiccore.sh",
    }
    missing_generated = [name for name in expected_generated if not (GENERATED_MINIMAL / name).is_file()]
    if missing_generated:
        errors.append(fail(f"minimal install kit missing files: {', '.join(sorted(missing_generated))}"))
    plan_path = GENERATED_MINIMAL / "civiccore-install-plan.json"
    if plan_path.is_file():
        generated_plan = json.loads(plan_path.read_text(encoding="utf-8"))
        if generated_plan.get("profile") != "minimal" or generated_plan.get("modules") != ["civiccore"]:
            errors.append(fail("minimal install kit plan must install CivicCore only"))
        boundary = generated_plan.get("operator_boundary", {})
        if boundary.get("does_not_install_system_dependencies") is not True:
            errors.append(fail("minimal install kit must not claim to install system dependencies"))
        if boundary.get("does_not_start_services") is not True:
            errors.append(fail("minimal install kit must not start services"))
    requirements = GENERATED_MINIMAL / "requirements.txt"
    if requirements.is_file() and "civiccore-1.0.0-py3-none-any.whl" not in requirements.read_text(encoding="utf-8"):
        errors.append(fail("minimal install kit requirements must point to the CivicCore wheel"))

    try:
        module.build_install_plan(manifest=data, profile_id="custom", selected_modules=[])
    except Exception as exc:
        if "Custom profile requires" not in str(exc):
            errors.append(fail(f"custom profile failed with wrong error: {exc}"))
    else:
        errors.append(fail("custom profile without modules should fail"))

    return errors


def run_launcher(command: list[str]) -> tuple[bool, str]:
    proc = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    output = "\n".join(part for part in (proc.stdout.strip(), proc.stderr.strip()) if part)
    return proc.returncode == 0, output


def powershell_command() -> str | None:
    if os.environ.get("CIVICSUITE_VERIFY_NO_POWERSHELL") == "1":
        return None
    return shutil.which("powershell") or shutil.which("pwsh")


def check_launchers() -> list[str]:
    errors: list[str] = []
    launchers = {
        "windows": WINDOWS_LAUNCHER,
        "macos": MACOS_LAUNCHER,
        "linux": LINUX_LAUNCHER,
    }
    for name, path in launchers.items():
        if not path.is_file():
            errors.append(fail(f"missing launcher {path.relative_to(ROOT)}"))
            continue
        text = path.read_text(encoding="utf-8")
        if "--dry-run" not in text:
            errors.append(fail(f"{name} launcher must force --dry-run"))
        forbidden_phrases = (
            "docker compose up",
            "docker run",
            "pip install",
            "npm install",
            "Start-Service",
            "apt install",
            "brew install",
        )
        for phrase in forbidden_phrases:
            if phrase in text:
                errors.append(fail(f"{name} launcher contains mutating phrase: {phrase}"))

    powershell = powershell_command()
    if WINDOWS_LAUNCHER.is_file() and powershell:
        ok, output = run_launcher(
            [
                powershell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(WINDOWS_LAUNCHER),
                "-Profile",
                "minimal",
                "-ShowReadiness",
                "-DetectHost",
                "-ReadinessScenario",
                "missing-docker",
            ]
        )
        if not ok:
            errors.append(fail(f"windows launcher failed: {output}"))
        elif '"mutates_host": false' not in output or '"detection_source": "host_read_only"' not in output:
            errors.append(fail("windows launcher output did not prove mutates_host false"))

        ok, output = run_launcher(
            [
                powershell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(WINDOWS_LAUNCHER),
                "-Profile",
                "minimal",
                "-Execute",
            ]
        )
        if not ok:
            errors.append(fail(f"windows execution gate failed: {output}"))
        elif '"mutates_host": false' not in output or '"gate_status": "blocked"' not in output:
            errors.append(fail("windows execution gate did not stay blocked and non-mutating"))

        ok, output = run_launcher(
            [
                powershell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(WINDOWS_LAUNCHER),
                "-Profile",
                "minimal",
                "-ShowExecutorDesign",
            ]
        )
        if not ok:
            errors.append(fail(f"windows executor design failed: {output}"))
        elif '"mutates_host": false' not in output or '"executor_status": "design_only"' not in output:
            errors.append(fail("windows executor design did not stay design-only and non-mutating"))

        ok, output = run_launcher(
            [
                powershell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(WINDOWS_LAUNCHER),
                "-Profile",
                "minimal",
                "-ShowEvidenceSchema",
            ]
        )
        if not ok:
            errors.append(fail(f"windows evidence schema failed: {output}"))
        elif '"mutates_host": false' not in output or '"schema_version": 1' not in output:
            errors.append(fail("windows evidence schema did not stay non-mutating"))

        ok, output = run_launcher(
            [
                powershell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(WINDOWS_LAUNCHER),
                "-Profile",
                "minimal",
                "-WriteReport",
                "-RunId",
                "verify-windows-launcher-report",
            ]
        )
        if not ok:
            errors.append(fail(f"windows report writer failed: {output}"))
        elif '"evidence_report"' not in output or '"mutates_host": false' not in output:
            errors.append(fail("windows report writer did not return non-mutating evidence_report"))

        for switch, marker in (
            ("-ShowArtifacts", '"artifacts"'),
            ("-ShowProfileConfig", '"services"'),
            ("-ShowHealthChecks", '"checks"'),
            ("-ShowPreflight", '"executor_not_implemented"'),
        ):
            ok, output = run_launcher(
                [
                    powershell,
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(WINDOWS_LAUNCHER),
                    "-Profile",
                    "minimal",
                    switch,
                ]
            )
            if not ok:
                errors.append(fail(f"windows launcher {switch} failed: {output}"))
            elif '"mutates_host": false' not in output or marker not in output:
                errors.append(fail(f"windows launcher {switch} did not return expected non-mutating model"))
        if has_local_civiccore_wheel():
            ok, output = run_launcher(
                [
                    powershell,
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(WINDOWS_LAUNCHER),
                    "-Profile",
                    "minimal",
                    "-GenerateInstallKit",
                ]
            )
            if not ok:
                errors.append(fail(f"windows launcher -GenerateInstallKit failed: {output}"))
            elif '"mutates_host": false' not in output or '"generated_root"' not in output:
                errors.append(fail("windows launcher -GenerateInstallKit did not return expected non-mutating model"))
        launcher_text = WINDOWS_LAUNCHER.read_text(encoding="utf-8")
        if "RunCleanroomProof" not in launcher_text or "--run-cleanroom-proof" not in launcher_text:
            errors.append(fail("windows launcher missing cleanroom proof switch"))
        if "RunCleanroomGate" not in launcher_text or "--run-cleanroom-gate" not in launcher_text:
            errors.append(fail("windows launcher missing cleanroom gate switch"))

    for name, path in (("macos", MACOS_LAUNCHER), ("linux", LINUX_LAUNCHER)):
        if not path.is_file():
            continue
        launcher_path = path.relative_to(ROOT).as_posix()
        ok, output = run_launcher(
            [
                "bash",
                launcher_path,
                "--profile",
                "minimal",
                "--show-readiness",
                "--detect-host",
                "--readiness-scenario",
                "missing-docker",
            ]
        )
        if not ok:
            errors.append(fail(f"{name} launcher failed: {output}"))
        elif '"mutates_host": false' not in output or '"detection_source": "host_read_only"' not in output:
            errors.append(fail(f"{name} launcher output did not prove mutates_host false"))
        ok, output = run_launcher(["bash", launcher_path, "--profile", "minimal", "--execute"])
        if not ok:
            errors.append(fail(f"{name} execution gate failed: {output}"))
        elif '"mutates_host": false' not in output or '"gate_status": "blocked"' not in output:
            errors.append(fail(f"{name} execution gate did not stay blocked and non-mutating"))
        ok, output = run_launcher(["bash", launcher_path, "--profile", "minimal", "--show-executor-design"])
        if not ok:
            errors.append(fail(f"{name} executor design failed: {output}"))
        elif '"mutates_host": false' not in output or '"executor_status": "design_only"' not in output:
            errors.append(fail(f"{name} executor design did not stay design-only and non-mutating"))
        ok, output = run_launcher(["bash", launcher_path, "--profile", "minimal", "--show-evidence-schema"])
        if not ok:
            errors.append(fail(f"{name} evidence schema failed: {output}"))
        elif '"mutates_host": false' not in output or '"schema_version": 1' not in output:
            errors.append(fail(f"{name} evidence schema did not stay non-mutating"))
        ok, output = run_launcher(
            [
                "bash",
                launcher_path,
                "--profile",
                "minimal",
                "--write-report",
                "--run-id",
                f"verify-{name}-launcher-report",
            ]
        )
        if not ok:
            errors.append(fail(f"{name} report writer failed: {output}"))
        elif '"evidence_report"' not in output or '"mutates_host": false' not in output:
            errors.append(fail(f"{name} report writer did not return non-mutating evidence_report"))
        for flag, marker in (
            ("--show-artifacts", '"artifacts"'),
            ("--show-profile-config", '"services"'),
            ("--show-health-checks", '"checks"'),
            ("--show-preflight", '"executor_not_implemented"'),
        ):
            ok, output = run_launcher(["bash", launcher_path, "--profile", "minimal", flag])
            if not ok:
                errors.append(fail(f"{name} launcher {flag} failed: {output}"))
            elif '"mutates_host": false' not in output or marker not in output:
                errors.append(fail(f"{name} launcher {flag} did not return expected non-mutating model"))
        if has_local_civiccore_wheel():
            ok, output = run_launcher(["bash", launcher_path, "--profile", "minimal", "--generate-install-kit"])
            if not ok:
                errors.append(fail(f"{name} launcher --generate-install-kit failed: {output}"))
            elif '"mutates_host": false' not in output or '"generated_root"' not in output:
                errors.append(fail(f"{name} launcher --generate-install-kit did not return expected non-mutating model"))
        launcher_text = path.read_text(encoding="utf-8")
        if "--run-cleanroom-proof" not in launcher_text:
            errors.append(fail(f"{name} launcher missing cleanroom proof flag"))
        if "--run-cleanroom-gate" not in launcher_text:
            errors.append(fail(f"{name} launcher missing cleanroom gate flag"))

    return errors


def main() -> int:
    print("==> CivicSuite installer plan verification")
    errors = []
    if not MANIFEST.is_file():
        errors.append(fail(f"missing {MANIFEST.relative_to(ROOT)}"))
    else:
        try:
            manifest = load_manifest()
            errors.extend(check_manifest(manifest))
            errors.extend(check_planner(manifest))
            errors.extend(check_launchers())
        except Exception as exc:
            errors.append(fail(f"could not parse manifest: {exc}"))
    errors.extend(check_docs())

    if errors:
        for error in errors:
            print(error)
        print("VERIFY-INSTALLER-PLAN: FAILED")
        return 1
    print("VERIFY-INSTALLER-PLAN: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
