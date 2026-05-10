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
CURRENT_PLATFORM_CIVICCORE = "1.0.1"
LEGACY_FOUNDATION_CIVICCORE = "0.3.0"

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
        return self.published_version if remote_only and self.published_version else self.version

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
        "1.0.1",
        civiccore_required=None,
        release_tag="v1.0.1",
    ),
    RepoSpec(
        "civicrecords-ai",
        "CivicSuite/civicrecords-ai",
        "civicrecords-ai",
        "1.4.10",
        "backend/pyproject.toml",
        civiccore_required="0.22.1",
    ),
    RepoSpec(
        "civicclerk",
        "CivicSuite/civicclerk",
        "civicclerk",
        "1.0.1",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec(
        "civiccode",
        "CivicSuite/civiccode",
        "civiccode",
        "0.5.0",
        civiccore_required=CURRENT_PLATFORM_CIVICCORE,
    ),
    RepoSpec("civiczone", "CivicSuite/civiczone", "civiczone", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civicaccess", "CivicSuite/civicaccess", "civicaccess", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicplan", "CivicSuite/civicplan", "civicplan", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civicpermit", "CivicSuite/civicpermit", "civicpermit", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civicinspect", "CivicSuite/civicinspect", "civicinspect", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civicgrants", "CivicSuite/civicgrants", "civicgrants", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civicprocure", "CivicSuite/civicprocure", "civicprocure", "0.2.0", civiccore_required=CURRENT_PLATFORM_CIVICCORE),
    RepoSpec("civiccontracts", "CivicSuite/civiccontracts", "civiccontracts", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicboards", "CivicSuite/civicboards", "civicboards", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec(
        "civicnotice",
        "CivicSuite/civicnotice",
        "civicnotice",
        "0.1.2",
        civiccore_required="0.9.0",
        published_version="0.1.1",
        published_civiccore_required="0.3.0",
    ),
    RepoSpec("civic311", "CivicSuite/civic311", "civic311", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civiccomms", "CivicSuite/civiccomms", "civiccomms", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicdata", "CivicSuite/civicdata", "civicdata", "0.1.2", civiccore_required="0.4.0"),
    RepoSpec("civichr", "CivicSuite/civichr", "civichr", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicbudget", "CivicSuite/civicbudget", "civicbudget", "0.1.2", civiccore_required="0.4.0"),
    RepoSpec("civiclegal", "CivicSuite/civiclegal", "civiclegal", "0.1.2", civiccore_required="0.11.0"),
    RepoSpec("civicelections", "CivicSuite/civicelections", "civicelections", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicutility", "CivicSuite/civicutility", "civicutility", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civiccourt", "CivicSuite/civiccourt", "civiccourt", "0.1.2", civiccore_required="0.4.0"),
    RepoSpec("civicsafety", "CivicSuite/civicsafety", "civicsafety", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civiclibrary", "CivicSuite/civiclibrary", "civiclibrary", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
    RepoSpec("civicparks", "CivicSuite/civicparks", "civicparks", "0.1.1", civiccore_required=LEGACY_FOUNDATION_CIVICCORE),
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
    row_pattern = re.compile(r"^\|\s*(civic[\w-]+)\s*\|\s*([0-9]+\.[0-9]+\.[0-9]+)\s*\|", re.M)
    for repo, version in row_pattern.findall(match.group("section")):
        versions[repo] = version
    return versions


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
        dep_text = "\n".join(str(dep) for dep in deps if "civiccore" in str(dep).lower())
        if spec.civiccore_required not in dep_text and f"v{spec.civiccore_required}" not in dep_text:
            errors.append(
                fail(
                    f"civiccore dependency does not reference {spec.civiccore_required}: {dep_text or '<missing>'}"
                )
            )
    return errors


def check_compatibility_matrix(spec: RepoSpec, matrix: str, remote_only: bool) -> list[str]:
    errors = []
    row_pattern = re.compile(rf"^\|\s*{re.escape(spec.name)}\s*\|(?P<row>.+)$", re.MULTILINE)
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
        errors.append(fail(f"compatibility row missing civiccore pin =={civiccore_required}"))
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
    print(f"remote release checks: {'enabled' if args.remote else 'disabled'}")
    print(f"local sibling clone checks: {'disabled' if args.remote_only else 'enabled'}")

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
            print(f"[{spec.name}] PASS {spec.matrix_version(args.remote_only)} ({spec.repo})")

    if any_failures:
        print("VERIFY-SUITE-STATE: FAILED")
        return 1
    print("VERIFY-SUITE-STATE: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
