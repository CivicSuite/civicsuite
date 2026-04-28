"""Verify CivicSuite repo/version/docs/release state across the org.

This is the post-foundation pulse check for the 26-module foundation lane. It
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
EXPECTED_CIVICCORE = "0.2.0"

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
    civiccore_required: str | None = EXPECTED_CIVICCORE
    release_tag: str | None = None

    @property
    def tag(self) -> str:
        return self.release_tag or f"v{self.version}"


REPOS: tuple[RepoSpec, ...] = (
    RepoSpec("civiccore", "CivicSuite/civiccore", "civiccore", "0.2.0", civiccore_required=None),
    RepoSpec("civicrecords-ai", "CivicSuite/civicrecords-ai", "civicrecords-ai", "1.4.0", "backend/pyproject.toml"),
    RepoSpec("civicclerk", "CivicSuite/civicclerk", "civicclerk", "0.1.0"),
    RepoSpec("civiccode", "CivicSuite/civiccode", "civiccode", "0.1.0"),
    RepoSpec("civiczone", "CivicSuite/civiczone", "civiczone", "0.1.0"),
    RepoSpec("civicaccess", "CivicSuite/civicaccess", "civicaccess", "0.1.0"),
    RepoSpec("civicplan", "CivicSuite/civicplan", "civicplan", "0.1.0"),
    RepoSpec("civicpermit", "CivicSuite/civicpermit", "civicpermit", "0.1.0"),
    RepoSpec("civicinspect", "CivicSuite/civicinspect", "civicinspect", "0.1.0"),
    RepoSpec("civicgrants", "CivicSuite/civicgrants", "civicgrants", "0.1.0"),
    RepoSpec("civicprocure", "CivicSuite/civicprocure", "civicprocure", "0.1.0"),
    RepoSpec("civiccontracts", "CivicSuite/civiccontracts", "civiccontracts", "0.1.0"),
    RepoSpec("civicboards", "CivicSuite/civicboards", "civicboards", "0.1.0"),
    RepoSpec("civicnotice", "CivicSuite/civicnotice", "civicnotice", "0.1.0"),
    RepoSpec("civic311", "CivicSuite/civic311", "civic311", "0.1.0"),
    RepoSpec("civiccomms", "CivicSuite/civiccomms", "civiccomms", "0.1.0"),
    RepoSpec("civicdata", "CivicSuite/civicdata", "civicdata", "0.1.0"),
    RepoSpec("civichr", "CivicSuite/civichr", "civichr", "0.1.0"),
    RepoSpec("civicbudget", "CivicSuite/civicbudget", "civicbudget", "0.1.0"),
    RepoSpec("civiclegal", "CivicSuite/civiclegal", "civiclegal", "0.1.0"),
    RepoSpec("civicelections", "CivicSuite/civicelections", "civicelections", "0.1.0"),
    RepoSpec("civicutility", "CivicSuite/civicutility", "civicutility", "0.1.0"),
    RepoSpec("civiccourt", "CivicSuite/civiccourt", "civiccourt", "0.1.0"),
    RepoSpec("civicsafety", "CivicSuite/civicsafety", "civicsafety", "0.1.0"),
    RepoSpec("civiclibrary", "CivicSuite/civiclibrary", "civiclibrary", "0.1.0"),
    RepoSpec("civicparks", "CivicSuite/civicparks", "civicparks", "0.1.0"),
)


def fail(message: str) -> str:
    return f"FAIL: {message}"


def read_pyproject(path: Path) -> dict[str, object]:
    with path.open("rb") as handle:
        return tomllib.load(handle)


def compatibility_text() -> str:
    return COMPATIBILITY_MATRIX.read_text(encoding="utf-8")


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


def check_compatibility_matrix(spec: RepoSpec, matrix: str) -> list[str]:
    errors = []
    row_pattern = re.compile(rf"^\|\s*{re.escape(spec.name)}\s*\|(?P<row>.+)$", re.MULTILINE)
    match = row_pattern.search(matrix)
    if not match:
        return [fail("missing compatibility matrix row")]
    row = match.group("row")
    if spec.version not in row:
        errors.append(fail(f"compatibility row missing version {spec.version}"))
    if spec.repo not in row:
        errors.append(fail(f"compatibility row missing repo {spec.repo}"))
    if spec.civiccore_required and f"`=={spec.civiccore_required}`" not in row:
        errors.append(fail(f"compatibility row missing civiccore pin =={spec.civiccore_required}"))
    return errors


def check_release(spec: RepoSpec) -> list[str]:
    code, data, message = run_json(
        [
            "gh",
            "release",
            "view",
            spec.tag,
            "--repo",
            spec.repo,
            "--json",
            "tagName,isDraft,isPrerelease,assets",
        ]
    )
    if code != 0 or data is None:
        return [fail(f"release {spec.tag} unavailable for {spec.repo}: {message}")]
    errors = []
    if data.get("tagName") != spec.tag:
        errors.append(fail(f"release tagName {data.get('tagName')!r} != {spec.tag!r}"))
    if data.get("isDraft"):
        errors.append(fail(f"release {spec.tag} is still draft"))
    if data.get("isPrerelease"):
        errors.append(fail(f"release {spec.tag} is marked prerelease"))
    assets = data.get("assets", [])
    if not isinstance(assets, list) or not assets:
        errors.append(fail(f"release {spec.tag} has no assets"))
    return errors


def check_repo(spec: RepoSpec, matrix: str, remote: bool) -> list[str]:
    repo_path = WORKSPACE / spec.local_dir
    errors = []
    if not repo_path.is_dir():
        return [fail(f"local repo path missing: {repo_path}")]
    errors.extend(check_required_artifacts(repo_path))
    errors.extend(check_pyproject(spec, repo_path))
    errors.extend(check_compatibility_matrix(spec, matrix))
    if remote:
        errors.extend(check_release(spec))
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--remote",
        action="store_true",
        help="also verify GitHub release tags and uploaded assets via gh",
    )
    args = parser.parse_args()

    matrix = compatibility_text()
    any_failures = False
    print("==> CivicSuite suite-state verification")
    print(f"workspace: {WORKSPACE}")
    print(f"repos: {len(REPOS)}")
    print(f"remote release checks: {'enabled' if args.remote else 'disabled'}")

    for spec in REPOS:
        errors = check_repo(spec, matrix, remote=args.remote)
        if errors:
            any_failures = True
            print(f"[{spec.name}] FAIL")
            for error in errors:
                print(f"  {error}")
        else:
            print(f"[{spec.name}] PASS {spec.version} ({spec.repo})")

    if any_failures:
        print("VERIFY-SUITE-STATE: FAILED")
        return 1
    print("VERIFY-SUITE-STATE: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
