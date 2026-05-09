"""Verify the CivicSuite suite-installer design contract."""

from __future__ import annotations

import json
import sys
import importlib.util
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "installer" / "modules.json"
CONTRACT = ROOT / "installer" / "README.md"
PLAN = ROOT / "docs" / "installer" / "suite-installer-plan.md"
PLANNER = ROOT / "scripts" / "plan-installer.py"
WINDOWS_LAUNCHER = ROOT / "installer" / "windows" / "plan-installer.ps1"
MACOS_LAUNCHER = ROOT / "installer" / "macos" / "plan-installer.sh"
LINUX_LAUNCHER = ROOT / "installer" / "linux" / "plan-installer.sh"

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

    if WINDOWS_LAUNCHER.is_file():
        ok, output = run_launcher(
            [
                "powershell",
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
                "powershell",
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
