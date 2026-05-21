"""Verify CivicSuite repo/version/docs/release state across the org.

This is the post-foundation pulse check for the current runtime repo lane. It
does not replace each repo's release gate; it verifies that the umbrella truth
source, local clones, package versions, docs artifacts, and GitHub releases
still agree.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
COMPATIBILITY_MATRIX = ROOT / "docs" / "compatibility" / "index.md"
UNIFIED_SPEC = ROOT / "docs" / "CivicSuiteUnifiedSpec.md"
INSTALLER_MODULES = ROOT / "installer" / "modules.json"
PUBLIC_USE_GATE = (
    ROOT / "docs" / "installer" / "starter-set-public-use-readiness-gate.md"
)
PUBLIC_USE_MATRIX = (
    ROOT
    / "docs"
    / "installer"
    / "browser-qa"
    / "2026-05-20-clerk-core-public-use-matrix.md"
)
PUBLIC_USE_MATRIX_JSON = (
    ROOT
    / "docs"
    / "installer"
    / "browser-qa"
    / "2026-05-20-clerk-core-public-use-matrix.json"
)
RESTORE_PRECONDITION = (
    ROOT
    / "docs"
    / "installer"
    / "browser-qa"
    / "2026-05-20-clerk-core-restore-precondition.md"
)
CURRENT_PLATFORM_CIVICCORE = "1.1.0"
RECOVERY_CIVICCORE = "1.0.1"
LEGACY_FOUNDATION_CIVICCORE = "0.3.0"
PLANNED_SPEC_MODULES = ("civicregwatch", "civicapi")
CURRENT_CLERK_CORE_INSTALLER_TAG = "installer-clerk-core-v0.1.0"
CLERK_CORE_WORKFLOW_PROOF_SCOPE = (
    "civicrecords-ai request/search-surface/review/response",
    "civicclerk agenda/packet/minutes/vote/notice/archive",
)

REQUIRED_ARTIFACTS = (
    "README.md",
    "README.txt",
    "USER-MANUAL.md",
    "USER-MANUAL.txt",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "SECURITY.md",
    "SUPPORT.md",
    ".gitignore",
    "docs/index.html",
    "docs/github-discussions-seed.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
)


@dataclass(frozen=True)
class RepoSpec:
    name: str
    repo: str
    local_dir: str
    version: str
    pyproject: str = "pyproject.toml"
    civiccore_required: str | None = LEGACY_FOUNDATION_CIVICCORE
    release_tag: str | None = None
    published_version: str | None = None
    published_civiccore_required: str | None = None

    def matrix_version(self, remote_only: bool) -> str:
        return (
            self.published_version
            if remote_only and self.published_version
            else self.version
        )

    def matrix_civiccore_required(self, remote_only: bool) -> str | None:
        if remote_only and self.published_civiccore_required is not None:
            return self.published_civiccore_required
        return self.civiccore_required

    def tag(self, remote_only: bool) -> str:
        if self.release_tag:
            return self.release_tag
        return f"v{self.matrix_version(remote_only)}"


REPOS: tuple[RepoSpec, ...] = (
    RepoSpec(
        "civiccore",
        "CivicSuite/civiccore",
        "civiccore",
        "1.1.0",
        civiccore_required=None,
        release_tag="v1.1.0",
    ),
    RepoSpec(
        "civicrecords-ai",
        "CivicSuite/civicrecords-ai",
        "civicrecords-ai",
        "1.6.1",
        "backend/pyproject.toml",
        civiccore_required=RECOVERY_CIVICCORE,
    ),
    RepoSpec(
        "civicclerk",
        "CivicSuite/civicclerk",
        "civicclerk",
        "1.0.1",
        civiccore_required=RECOVERY_CIVICCORE,
    ),
    RepoSpec(
        "civiccode",
        "CivicSuite/civiccode",
        "civiccode",
        "0.6.0",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civiczone",
        "CivicSuite/civiczone",
        "civiczone",
        "0.2.1",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicaccess",
        "CivicSuite/civicaccess",
        "civicaccess",
        "0.2.0",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicplan",
        "CivicSuite/civicplan",
        "civicplan",
        "0.2.1",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicpermit",
        "CivicSuite/civicpermit",
        "civicpermit",
        "0.2.1",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicinspect",
        "CivicSuite/civicinspect",
        "civicinspect",
        "0.2.1",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicgrants",
        "CivicSuite/civicgrants",
        "civicgrants",
        "0.2.0",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civicprocure",
        "CivicSuite/civicprocure",
        "civicprocure",
        "0.2.0",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civiccontracts",
        "CivicSuite/civiccontracts",
        "civiccontracts",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicboards",
        "CivicSuite/civicboards",
        "civicboards",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicnotice",
        "CivicSuite/civicnotice",
        "civicnotice",
        "0.1.2",
        civiccore_required="0.9.0",
        published_version="0.1.1",
        published_civiccore_required="0.3.0",
    ),
    RepoSpec(
        "civic311",
        "CivicSuite/civic311",
        "civic311",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civiccomms",
        "CivicSuite/civiccomms",
        "civiccomms",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicdata",
        "CivicSuite/civicdata",
        "civicdata",
        "0.1.2",
        civiccore_required="0.4.0",
    ),
    RepoSpec(
        "civichr",
        "CivicSuite/civichr",
        "civichr",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicbudget",
        "CivicSuite/civicbudget",
        "civicbudget",
        "0.1.2",
        civiccore_required="0.4.0",
    ),
    RepoSpec(
        "civiclegal",
        "CivicSuite/civiclegal",
        "civiclegal",
        "0.1.2",
        civiccore_required="0.11.0",
    ),
    RepoSpec(
        "civicelections",
        "CivicSuite/civicelections",
        "civicelections",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicutility",
        "CivicSuite/civicutility",
        "civicutility",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civiccourt",
        "CivicSuite/civiccourt",
        "civiccourt",
        "0.1.2",
        civiccore_required="0.4.0",
    ),
    RepoSpec(
        "civicsafety",
        "CivicSuite/civicsafety",
        "civicsafety",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civiclibrary",
        "CivicSuite/civiclibrary",
        "civiclibrary",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
    RepoSpec(
        "civicparks",
        "CivicSuite/civicparks",
        "civicparks",
        "0.1.1",
        civiccore_required=LEGACY_FOUNDATION_CIVICCORE,
    ),
)


def fail(message: str) -> str:
    return f"FAIL: {message}"


def read_pyproject(path: Path) -> dict[str, object]:
    with path.open("rb") as handle:
        return tomllib.load(handle)


def compatibility_text() -> str:
    return COMPATIBILITY_MATRIX.read_text(encoding="utf-8")


def spec_versions() -> dict[str, str]:
    text = UNIFIED_SPEC.read_text(encoding="utf-8")
    match = re.search(
        r"## 18\. Current Shipped State(?P<section>.*?)(?=## 19\. Post-Foundation Build Sequence)",
        text,
        flags=re.S,
    )
    if not match:
        return {}
    versions: dict[str, str] = {}
    row_pattern = re.compile(
        r"^\|\s*(civic[\w-]+)\s*\|\s*([0-9]+\.[0-9]+\.[0-9]+)\s*\|", re.M
    )
    for repo, version in row_pattern.findall(match.group("section")):
        versions[repo] = version
    return versions


def check_planned_spec_modules() -> list[str]:
    errors = []
    spec_text = UNIFIED_SPEC.read_text(encoding="utf-8")
    installer_data = json.loads(INSTALLER_MODULES.read_text(encoding="utf-8"))
    installer_modules = {
        str(module.get("id")): module
        for module in installer_data.get("modules", [])
        if isinstance(module, dict) and module.get("id")
    }
    for module_id in PLANNED_SPEC_MODULES:
        display = module_id.replace("civic", "Civic", 1)
        if module_id == "civicregwatch":
            display = "CivicRegWatch"
        elif module_id == "civicapi":
            display = "CivicAPI"
        if display not in spec_text:
            errors.append(
                fail(f"planned spec module {display} missing from unified spec")
            )
        installer_module = installer_modules.get(module_id)
        if not installer_module:
            errors.append(
                fail(
                    f"planned spec module {module_id} missing from installer/modules.json"
                )
            )
            continue
        if installer_module.get("selectable") is not False:
            errors.append(
                fail(
                    f"planned spec module {module_id} must remain non-selectable until runtime repo exists"
                )
            )
        if (
            installer_module.get("installer_status")
            != "planned_spec_module_no_runtime_repo"
        ):
            errors.append(
                fail(f"planned spec module {module_id} has unexpected installer_status")
            )
    return errors


def check_clerk_core_workflow_proof_truth() -> list[str]:
    errors = []
    spec_text = UNIFIED_SPEC.read_text(encoding="utf-8")
    installer_text = INSTALLER_MODULES.read_text(encoding="utf-8")
    required_phrases = (
        "request/search-surface/review/response",
        "agenda/packet/minutes/vote/notice/archive",
        "does not claim live cross-module record exchange",
        CURRENT_CLERK_CORE_INSTALLER_TAG,
    )
    for phrase in required_phrases:
        if phrase not in spec_text and phrase not in installer_text:
            errors.append(
                fail(f"clerk-core workflow proof truth missing phrase: {phrase}")
            )
    return errors


def check_public_use_matrix_json() -> list[str]:
    errors: list[str] = []
    try:
        matrix = json.loads(PUBLIC_USE_MATRIX_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [fail(f"clerk-core public-use matrix JSON is invalid: {exc}")]

    if not isinstance(matrix, dict):
        return [fail("clerk-core public-use matrix JSON must be an object")]

    if matrix.get("name") != "clerk-core-public-use-route-state-matrix":
        errors.append(fail("clerk-core public-use matrix JSON has unexpected name"))
    if matrix.get("status") != "capture_complete":
        errors.append(
            fail("clerk-core public-use matrix JSON must be capture_complete")
        )

    health = matrix.get("health")
    if not isinstance(health, dict):
        errors.append(fail("clerk-core public-use matrix JSON missing health object"))
    else:
        civicrecords = health.get("civicrecords")
        civicclerk = health.get("civicclerk")
        if not isinstance(civicrecords, dict) or civicrecords.get("version") != "1.6.1":
            errors.append(
                fail(
                    "clerk-core public-use matrix JSON must prove CivicRecords AI 1.6.1 health"
                )
            )
        if not isinstance(civicclerk, dict) or civicclerk.get("version") != "1.0.1":
            errors.append(
                fail(
                    "clerk-core public-use matrix JSON must prove CivicClerk 1.0.1 health"
                )
            )

    routes = matrix.get("route_inventory")
    if not isinstance(routes, list) or not routes:
        errors.append(fail("clerk-core public-use matrix JSON missing route_inventory"))
    else:
        route_keys: set[tuple[str, str]] = set()
        required_route_fields = {
            "product",
            "route",
            "audience",
            "auth_requirement",
            "desktop_mobile_qa",
            "states",
        }
        for index, route in enumerate(routes):
            if not isinstance(route, dict):
                errors.append(fail(f"route_inventory[{index}] must be an object"))
                continue
            missing = required_route_fields - set(route)
            if missing:
                errors.append(
                    fail(
                        f"route_inventory[{index}] missing fields: {', '.join(sorted(missing))}"
                    )
                )
                continue
            key = (str(route["product"]), str(route["route"]))
            if key in route_keys:
                errors.append(
                    fail(
                        "clerk-core public-use matrix JSON has duplicate route "
                        f"{key[0]} {key[1]}"
                    )
                )
            route_keys.add(key)
            if route.get("audience") not in {"public", "staff", "internal"}:
                errors.append(
                    fail(
                        f"route_inventory[{index}] has unknown audience {route.get('audience')}"
                    )
                )
        if len(routes) < 150:
            errors.append(
                fail(
                    "clerk-core public-use matrix JSON route inventory is unexpectedly small"
                )
            )

    browser_checks = matrix.get("browser_checks")
    if not isinstance(browser_checks, list):
        errors.append(fail("clerk-core public-use matrix JSON missing browser_checks"))
    else:
        states = {
            str(check.get("state"))
            for check in browser_checks
            if isinstance(check, dict)
        }
        if len(browser_checks) != 20:
            errors.append(
                fail("clerk-core public-use matrix JSON must contain 20 browser checks")
            )
        for required_state in {"loading", "success", "empty", "error", "partial"}:
            if required_state not in states:
                errors.append(
                    fail(
                        f"clerk-core public-use matrix JSON missing browser state {required_state}"
                    )
                )
        for index, check in enumerate(browser_checks):
            if not isinstance(check, dict):
                errors.append(fail(f"browser_checks[{index}] must be an object"))
                continue
            if check.get("status") == "failed":
                errors.append(fail(f"browser_checks[{index}] is failed"))
            if check.get("expected_copy_found") is not True:
                errors.append(
                    fail(f"browser_checks[{index}] did not find expected copy")
                )
            if check.get("horizontal_overflow") is True:
                errors.append(
                    fail(f"browser_checks[{index}] records horizontal overflow")
                )
            if check.get("page_errors"):
                errors.append(fail(f"browser_checks[{index}] records page errors"))
            failed_responses = check.get("failed_responses")
            allowed_failure_statuses = {
                status
                for status in check.get("allowed_failure_statuses", [])
                if isinstance(status, int)
            }
            has_only_allowed_failures = (
                bool(allowed_failure_statuses)
                and isinstance(failed_responses, list)
                and all(
                    isinstance(response, dict)
                    and response.get("status") in allowed_failure_statuses
                    for response in failed_responses
                )
            )
            if check.get("console_messages") and not has_only_allowed_failures:
                errors.append(
                    fail(f"browser_checks[{index}] records console warnings/errors")
                )

    adversarial = matrix.get("adversarial")
    if not isinstance(adversarial, dict):
        errors.append(
            fail("clerk-core public-use matrix JSON missing adversarial probes")
        )
    else:
        expected_statuses = {
            "bad_inputs": 422,
            "missing_staff_role": 401,
            "missing_record": 404,
            "unavailable_dependency": 200,
            "public_staff_boundary": 401,
        }
        for key, expected in expected_statuses.items():
            probe = adversarial.get(key)
            if not isinstance(probe, dict):
                errors.append(fail(f"adversarial probe {key} missing"))
                continue
            if probe.get("status") != expected:
                errors.append(
                    fail(
                        f"adversarial probe {key} expected HTTP {expected}, got {probe.get('status')}"
                    )
                )
        missing_record = adversarial.get("missing_record")
        if isinstance(missing_record, dict) and "uuid_parsing" in json.dumps(
            missing_record
        ):
            errors.append(
                fail(
                    "adversarial missing_record must prove lookup miss, not UUID parser failure"
                )
            )

    return errors


def check_clerk_core_public_use_gate_truth() -> list[str]:
    errors = []
    spec_text = UNIFIED_SPEC.read_text(encoding="utf-8")
    installer_data = json.loads(INSTALLER_MODULES.read_text(encoding="utf-8"))
    if not PUBLIC_USE_GATE.is_file():
        return [
            fail(
                f"missing clerk-core public-use gate at {PUBLIC_USE_GATE.relative_to(ROOT)}"
            )
        ]
    gate_text = PUBLIC_USE_GATE.read_text(encoding="utf-8")
    matrix_text = (
        PUBLIC_USE_MATRIX.read_text(encoding="utf-8")
        if PUBLIC_USE_MATRIX.is_file()
        else ""
    )
    restore_text = (
        RESTORE_PRECONDITION.read_text(encoding="utf-8")
        if RESTORE_PRECONDITION.is_file()
        else ""
    )
    status = installer_data.get("public_use_gate_status")
    if not isinstance(status, dict):
        errors.append(fail("installer/modules.json missing public_use_gate_status"))
    else:
        if status.get("profile") != "clerk-core":
            errors.append(fail("public_use_gate_status profile must be clerk-core"))
        if status.get("status") != "green":
            errors.append(
                fail(
                    "public_use_gate_status must be green for the promoted public-use starter release"
                )
            )
        if (
            status.get("path")
            != "docs/installer/starter-set-public-use-readiness-gate.md"
        ):
            errors.append(fail("public_use_gate_status path mismatch"))
        if (
            status.get("route_state_matrix")
            != "docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.md"
        ):
            errors.append(
                fail("public_use_gate_status route_state_matrix path mismatch")
            )
        if (
            status.get("restore_precondition_evidence")
            != "docs/installer/browser-qa/2026-05-20-clerk-core-restore-precondition.md"
        ):
            errors.append(
                fail(
                    "public_use_gate_status restore_precondition_evidence path mismatch"
                )
            )
    if not PUBLIC_USE_MATRIX.is_file():
        errors.append(
            fail(
                f"missing clerk-core public-use matrix at {PUBLIC_USE_MATRIX.relative_to(ROOT)}"
            )
        )
    if not PUBLIC_USE_MATRIX_JSON.is_file():
        errors.append(
            fail(
                f"missing clerk-core public-use matrix JSON at {PUBLIC_USE_MATRIX_JSON.relative_to(ROOT)}"
            )
        )
    else:
        errors.extend(check_public_use_matrix_json())
    if not RESTORE_PRECONDITION.is_file():
        errors.append(
            fail(
                f"missing clerk-core restore precondition evidence at {RESTORE_PRECONDITION.relative_to(ROOT)}"
            )
        )
    required_phrases = (
        "Status: GREEN - Clerk-Core starter public-use release approved",
        "`installer-clerk-core-v0.1.0` is the current public-use starter release",
        "Loading, success, empty, error, and partial states checked",
        "Adversarial mock validation completed for integration behavior",
        "Release-gate audit has no unresolved Blocker or Critical findings",
        "20 browser checks",
        "154 deduplicated installed routes",
        "missing backup manifest",
        "Windows matching-host lifecycle evidence exists",
        "macOS remains beta-level archive/readiness only",
    )
    combined = f"{gate_text}\n{spec_text}\n{matrix_text}\n{restore_text}"
    for phrase in required_phrases:
        if phrase not in combined:
            errors.append(
                fail(f"clerk-core public-use gate truth missing phrase: {phrase}")
            )
    return errors


def run_json(command: list[str]) -> tuple[int, dict[str, object] | None, str]:
    proc = subprocess.run(command, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        return proc.returncode, None, (proc.stderr or proc.stdout).strip()
    try:
        return proc.returncode, json.loads(proc.stdout), ""
    except json.JSONDecodeError as exc:
        return 1, None, f"invalid JSON from {' '.join(command)}: {exc}"


def check_required_artifacts(repo_path: Path) -> list[str]:
    errors = []
    for artifact in REQUIRED_ARTIFACTS:
        if not (repo_path / artifact).is_file():
            errors.append(fail(f"missing required artifact {artifact}"))
    if not (repo_path / ".github" / "ISSUE_TEMPLATE").is_dir():
        errors.append(fail("missing .github/ISSUE_TEMPLATE directory"))
    return errors


def check_pyproject(spec: RepoSpec, repo_path: Path) -> list[str]:
    errors = []
    pyproject_path = repo_path / spec.pyproject
    if not pyproject_path.is_file():
        return [fail(f"missing pyproject at {spec.pyproject}")]

    data = read_pyproject(pyproject_path)
    project = data.get("project", {})
    if not isinstance(project, dict):
        return [fail(f"{spec.pyproject} has no [project] table")]

    actual_name = project.get("name")
    actual_version = project.get("version")
    if actual_name != spec.name:
        errors.append(fail(f"pyproject name {actual_name!r} != {spec.name!r}"))
    if actual_version != spec.version:
        errors.append(fail(f"pyproject version {actual_version!r} != {spec.version!r}"))

    if spec.civiccore_required:
        deps = project.get("dependencies", [])
        dep_text = "\n".join(
            str(dep) for dep in deps if "civiccore" in str(dep).lower()
        )
        if (
            spec.civiccore_required not in dep_text
            and f"v{spec.civiccore_required}" not in dep_text
        ):
            errors.append(
                fail(
                    f"civiccore dependency does not reference {spec.civiccore_required}: {dep_text or '<missing>'}"
                )
            )
    return errors


def check_compatibility_matrix(
    spec: RepoSpec, matrix: str, remote_only: bool
) -> list[str]:
    errors = []
    row_pattern = re.compile(
        rf"^\|\s*{re.escape(spec.name)}\s*\|(?P<row>.+)$", re.MULTILINE
    )
    match = row_pattern.search(matrix)
    if not match:
        return [fail("missing compatibility matrix row")]
    row = match.group("row")
    version = spec.matrix_version(remote_only)
    civiccore_required = spec.matrix_civiccore_required(remote_only)
    if version not in row:
        errors.append(fail(f"compatibility row missing version {version}"))
    if spec.repo not in row:
        errors.append(fail(f"compatibility row missing repo {spec.repo}"))
    if civiccore_required and f"`=={civiccore_required}`" not in row:
        errors.append(
            fail(f"compatibility row missing civiccore pin =={civiccore_required}")
        )
    return errors


def check_unified_spec(spec: RepoSpec, versions: dict[str, str]) -> list[str]:
    if spec.name not in versions:
        return []
    if versions[spec.name] != spec.version:
        return [
            fail(
                f"UnifiedSpec section 18 version {versions[spec.name]!r} "
                f"!= RepoSpec version {spec.version!r}"
            )
        ]
    return []


def check_release(spec: RepoSpec, remote_only: bool) -> list[str]:
    tag = spec.tag(remote_only)
    code, data, message = run_json(
        [
            "gh",
            "release",
            "view",
            tag,
            "--repo",
            spec.repo,
            "--json",
            "tagName,isDraft,isPrerelease,assets",
        ]
    )
    if code != 0 or data is None:
        return [fail(f"release {tag} unavailable for {spec.repo}: {message}")]
    errors = []
    if data.get("tagName") != tag:
        errors.append(fail(f"release tagName {data.get('tagName')!r} != {tag!r}"))
    if data.get("isDraft"):
        errors.append(fail(f"release {tag} is still draft"))
    if data.get("isPrerelease"):
        errors.append(fail(f"release {tag} is marked prerelease"))
    assets = data.get("assets", [])
    if not isinstance(assets, list) or not assets:
        errors.append(fail(f"release {tag} has no assets"))
    return errors


def check_repo(
    spec: RepoSpec,
    matrix: str,
    spec_version_map: dict[str, str],
    remote: bool,
    remote_only: bool,
) -> list[str]:
    repo_path = WORKSPACE / spec.local_dir
    errors = []
    if not remote_only:
        if not repo_path.is_dir():
            return [fail(f"local repo path missing: {repo_path}")]
        errors.extend(check_required_artifacts(repo_path))
        errors.extend(check_pyproject(spec, repo_path))
    errors.extend(check_compatibility_matrix(spec, matrix, remote_only=remote_only))
    errors.extend(check_unified_spec(spec, spec_version_map))
    if remote:
        errors.extend(check_release(spec, remote_only=remote_only))
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--remote",
        action="store_true",
        help="also verify GitHub release tags and uploaded assets via gh",
    )
    parser.add_argument(
        "--remote-only",
        action="store_true",
        help="skip sibling-clone checks so this can run in umbrella-only CI",
    )
    args = parser.parse_args()
    if args.remote_only:
        args.remote = True

    matrix = compatibility_text()
    spec_version_map = spec_versions()
    any_failures = False
    print("==> CivicSuite suite-state verification")
    print(f"workspace: {WORKSPACE}")
    print(f"repos: {len(REPOS)}")
    print(f"planned spec-only modules: {', '.join(PLANNED_SPEC_MODULES)}")
    print(f"current clerk-core installer tag: {CURRENT_CLERK_CORE_INSTALLER_TAG}")
    print(
        f"clerk-core workflow proof scope: {'; '.join(CLERK_CORE_WORKFLOW_PROOF_SCOPE)}"
    )
    print(f"remote release checks: {'enabled' if args.remote else 'disabled'}")
    print(
        f"local sibling clone checks: {'disabled' if args.remote_only else 'enabled'}"
    )

    for spec in REPOS:
        errors = check_repo(
            spec,
            matrix,
            spec_version_map,
            remote=args.remote,
            remote_only=args.remote_only,
        )
        if errors:
            any_failures = True
            print(f"[{spec.name}] FAIL")
            for error in errors:
                print(f"  {error}")
        else:
            print(
                f"[{spec.name}] PASS {spec.matrix_version(args.remote_only)} ({spec.repo})"
            )

    planned_errors = check_planned_spec_modules()
    if planned_errors:
        any_failures = True
        print("[planned-spec-modules] FAIL")
        for error in planned_errors:
            print(f"  {error}")
    else:
        print("[planned-spec-modules] PASS civicregwatch,civicapi")

    workflow_errors = check_clerk_core_workflow_proof_truth()
    if workflow_errors:
        any_failures = True
        print("[clerk-core-workflow-proof] FAIL")
        for error in workflow_errors:
            print(f"  {error}")
    else:
        print(
            "[clerk-core-workflow-proof] PASS records_request_search_review_response,civicclerk_agenda_packet_minutes_vote_notice_archive"
        )

    public_use_errors = check_clerk_core_public_use_gate_truth()
    if public_use_errors:
        any_failures = True
        print("[clerk-core-public-use-gate] FAIL")
        for error in public_use_errors:
            print(f"  {error}")
    else:
        print("[clerk-core-public-use-gate] PASS green_public_use_starter_release")

    if any_failures:
        print("VERIFY-SUITE-STATE: FAILED")
        return 1
    print("VERIFY-SUITE-STATE: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
