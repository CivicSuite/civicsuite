"""Extract a CivicSuite release archive and run the installer lifecycle."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tarfile
import time
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
REPORT_ROOT = ROOT / "installer" / "reports"
MIN_CLEANROOM_FREE_DISK_GB = 25
BYTES_PER_GB = 1024 * 1024 * 1024
MIN_CLEANROOM_FREE_DISK_BYTES = MIN_CLEANROOM_FREE_DISK_GB * BYTES_PER_GB
PLATFORM_LAUNCHERS = {
    "linux": Path("installer/generated/packages/clerk-core/linux/start-civicsuite-installer.sh"),
    "macos": Path("installer/generated/packages/clerk-core/macos/start-civicsuite-installer.sh"),
    "windows": Path("installer/generated/packages/clerk-core/windows/start-civicsuite-installer.ps1"),
}
LAUNCHER_NAMES = {
    "linux": "start-civicsuite-installer.sh",
    "macos": "start-civicsuite-installer.sh",
    "windows": "start-civicsuite-installer.ps1",
}


def make_run_id() -> str:
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    return f"installer-package-cleanroom-{stamp}-{uuid4().hex[:8]}"


def run(command: list[str], *, cwd: Path, timeout: int, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        timeout=timeout,
    )


def run_streaming(
    command: list[str],
    *,
    cwd: Path,
    timeout: int,
    output_path: Path,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    started = time.time()
    with output_path.open("w", encoding="utf-8", errors="replace") as output:
        output.write(f"$ {' '.join(command)}\n")
        output.flush()
        proc = subprocess.Popen(
            command,
            cwd=cwd,
            env=env,
            stdout=output,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        timed_out = False
        while proc.poll() is None:
            if time.time() - started > timeout:
                timed_out = True
                proc.kill()
                output.write(f"\nTIMEOUT: command exceeded {timeout} seconds\n")
                output.flush()
                break
            time.sleep(1)
        returncode = 124 if timed_out else int(proc.returncode or 0)
    tail = output_path.read_text(encoding="utf-8", errors="replace")[-12000:]
    return subprocess.CompletedProcess(command, returncode, stdout=tail, stderr="")


def disk_snapshot(path: Path = ROOT) -> dict[str, object]:
    usage = shutil.disk_usage(path)
    return {
        "path": str(path),
        "total_bytes": usage.total,
        "used_bytes": usage.used,
        "free_bytes": usage.free,
        "required_free_gb": MIN_CLEANROOM_FREE_DISK_GB,
        "required_free_bytes": MIN_CLEANROOM_FREE_DISK_BYTES,
        "passed": usage.free >= MIN_CLEANROOM_FREE_DISK_BYTES,
    }


def run_cleanup_command(command: list[str], *, timeout: int = 900) -> dict[str, object]:
    proc = run(command, cwd=ROOT, timeout=timeout)
    return {
        "command": command,
        "returncode": proc.returncode,
        "stdout": proc.stdout[-8000:],
        "stderr": proc.stderr[-8000:],
    }


def cleanroom_hygiene(*, report_dir: Path, allow_host_cleanup: bool) -> tuple[bool, dict[str, object]]:
    before = disk_snapshot()
    evidence: dict[str, object] = {
        "minimum_free_disk_gb": MIN_CLEANROOM_FREE_DISK_GB,
        "minimum_free_disk_bytes": MIN_CLEANROOM_FREE_DISK_BYTES,
        "before": before,
        "cleanup_approved": allow_host_cleanup,
        "cleanup_steps": [],
    }
    if before["passed"]:
        evidence["status"] = "passed"
        evidence["after"] = before
        return True, evidence

    if not allow_host_cleanup:
        evidence["status"] = "blocked"
        evidence["message"] = (
            f"Cleanroom lifecycle requires at least {MIN_CLEANROOM_FREE_DISK_GB} GB free. Global Docker/WSL cleanup "
            "is destructive and requires a dedicated cleanroom host or explicit approval."
        )
        evidence["after"] = before
        return False, evidence

    steps: list[dict[str, object]] = []
    docker = shutil.which("docker")
    if docker:
        steps.append(run_cleanup_command([docker, "system", "prune", "-af"], timeout=1800))
    else:
        steps.append({"command": ["docker", "system", "prune", "-af"], "returncode": 127, "stdout": "", "stderr": "docker was not found"})

    if sys.platform.startswith("win"):
        wsl = shutil.which("wsl.exe") or shutil.which("wsl")
        if wsl:
            steps.append(run_cleanup_command([wsl, "--shutdown"], timeout=300))
        powershell = shutil.which("powershell") or shutil.which("pwsh")
        if powershell:
            steps.append(
                run_cleanup_command(
                    [
                        powershell,
                        "-NoProfile",
                        "-ExecutionPolicy",
                        "Bypass",
                        "-Command",
                        "$vhd = Get-ChildItem $env:LOCALAPPDATA\\Packages -Recurse -Filter ext4.vhdx -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 1; if ($vhd) { Optimize-VHD -Path $vhd.FullName -Mode Full } else { Write-Output 'No WSL ext4.vhdx found.' }",
                    ],
                    timeout=1800,
                )
            )

    after = disk_snapshot()
    evidence["cleanup_steps"] = steps
    evidence["after"] = after
    evidence["status"] = "passed" if after["passed"] else "blocked"
    if not after["passed"]:
        evidence["message"] = f"Cleanroom lifecycle remains below {MIN_CLEANROOM_FREE_DISK_GB} GB free after approved cleanup."
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "cleanroom-hygiene-evidence.json").write_text(
        json.dumps(evidence, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return bool(after["passed"]), evidence


def extract(archive: Path, target: Path) -> Path:
    if target.exists():
        resolved_target = target.resolve()
        resolved_report_root = REPORT_ROOT.resolve()
        if resolved_target == resolved_report_root or resolved_report_root not in resolved_target.parents:
            raise RuntimeError(f"Refusing to clear extraction target outside installer reports: {target}")
        shutil.rmtree(target)
    target.mkdir(parents=True, exist_ok=True)
    if archive.suffix == ".zip":
        with zipfile.ZipFile(archive) as handle:
            handle.extractall(target)
    else:
        with tarfile.open(archive, "r:gz") as handle:
            handle.extractall(target)
    roots = [path for path in target.iterdir() if path.is_dir()]
    if len(roots) != 1:
        raise RuntimeError(f"Expected one extracted bundle root in {target}, found {len(roots)}.")
    return roots[0]


def remove_tree_with_retry(path: Path) -> None:
    last_error: OSError | None = None
    for attempt in range(8):
        try:
            for child in path.rglob("*"):
                try:
                    child.chmod(0o700 if child.is_dir() else 0o600)
                except OSError:
                    pass
            try:
                path.chmod(0o700)
            except OSError:
                pass
            shutil.rmtree(path)
            return
        except OSError as exc:
            last_error = exc
            time.sleep(0.25 * (attempt + 1))
    if last_error is not None:
        raise last_error


def infer_platform(archive: Path) -> str:
    name = archive.name.lower()
    for platform in PLATFORM_LAUNCHERS:
        if platform in name:
            return platform
    raise RuntimeError(
        f"Could not infer package platform from {archive.name}. "
        f"Pass --platform with one of: {', '.join(sorted(PLATFORM_LAUNCHERS))}."
    )


def find_launcher(bundle_root: Path, platform: str) -> Path:
    expected = LAUNCHER_NAMES[platform]
    matches = sorted(
        bundle_root.glob(f"installer/generated/packages/*/{platform}/{expected}")
    )
    if len(matches) == 1:
        return matches[0]
    legacy = bundle_root / PLATFORM_LAUNCHERS[platform]
    if legacy.is_file():
        return legacy
    raise RuntimeError(
        f"Expected one {platform} launcher named {expected} in {bundle_root}; found {len(matches)}."
    )


def launcher_command(
    platform: str,
    launcher: Path,
    mode: str,
    bundle_root: Path,
    *,
    staff_mode: str = "protected",
    workflow_proof: bool = False,
) -> list[str]:
    launcher_arg = launcher.relative_to(bundle_root).as_posix()
    if platform == "windows":
        switches = {
            "readiness": [],
            "plan": ["-Plan"],
            "install": ["-Install"],
            "repair": ["-Repair"],
            "verify": ["-Verify"],
            "uninstall": ["-Uninstall"],
            "backup": ["-Backup"],
            "restore": ["-Restore"],
            "gate": ["-Gate"],
        }
        lifecycle_args: list[str] = []
        if mode in {"install", "repair", "verify"}:
            lifecycle_args.extend(["-StaffMode", staff_mode])
            if workflow_proof:
                lifecycle_args.append("-WorkflowProof")
        return [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            launcher_arg,
            *switches[mode],
            *lifecycle_args,
        ]
    lifecycle_args = []
    if mode in {"install", "repair", "verify"}:
        lifecycle_args.extend(["--staff-mode", staff_mode])
        if workflow_proof:
            lifecycle_args.append("--workflow-proof")
    return ["bash", launcher_arg, mode, *lifecycle_args]


def mode_timeout(mode: str) -> int:
    if mode in {"install", "repair", "gate"}:
        return 3600
    return 900


def parse_json_from_output(output: str) -> dict[str, object] | None:
    decoder = json.JSONDecoder()
    for index, char in enumerate(output):
        if char != "{":
            continue
        try:
            parsed, end = decoder.raw_decode(output[index:])
        except json.JSONDecodeError:
            continue
        if output[index + end :].strip():
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


def lifecycle_summary(mode: str, payload: dict[str, object] | None) -> dict[str, object] | None:
    if not payload:
        return None
    summary: dict[str, object] = {"mode": mode}
    for key in (
        "run_id",
        "status",
        "mutates_host",
        "ports",
        "compose_projects",
        "isolation_id",
        "port_offset",
        "error",
        "fix_steps",
    ):
        if key in payload:
            summary[key] = payload[key]
    return summary


def retain_lifecycle_evidence(bundle_root: Path, report_dir: Path) -> list[str]:
    evidence_root = report_dir / "retained-lifecycle-evidence"
    retained: list[str] = []
    patterns = (
        "installer/reports/**/*.json",
        "installer/runtime/**/backups/**/backup-manifest.json",
        "installer/runtime/**/backups/**/record-survival-ledger.json",
    )
    for pattern in patterns:
        for source in sorted(bundle_root.glob(pattern)):
            if not source.is_file():
                continue
            target = evidence_root / source.relative_to(bundle_root)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            retained.append(str(target))
    return retained


def normalized_host_platform() -> str:
    if sys.platform.startswith("win"):
        return "windows"
    if sys.platform == "darwin":
        return "macos"
    if sys.platform.startswith("linux"):
        return "linux"
    return sys.platform


def classify_evidence(
    *,
    platform: str,
    host_platform: str,
    skip_install: bool,
    status: str,
    lifecycle_blocked: bool,
) -> str:
    if skip_install:
        return "archive_readiness_only"
    if lifecycle_blocked:
        if platform == "macos" and host_platform != "macos":
            return "unsupported_lifecycle"
        return "host_platform_mismatch"
    if platform == host_platform and status == "passed":
        return "matching_host_lifecycle"
    if platform == host_platform:
        return "matching_host_lifecycle_failed"
    return "host_platform_mismatch"


def certification_scope(classification: str) -> str:
    scopes = {
        "archive_readiness_only": "Archive extraction, readiness, and dry-run plan only; not lifecycle certification.",
        "matching_host_lifecycle": "Matching-host install, repair, verify, backup, restore, and uninstall lifecycle evidence.",
        "matching_host_lifecycle_failed": "Matching-host lifecycle was attempted but did not pass.",
        "host_platform_mismatch": "Host platform did not match package target; not lifecycle certification.",
        "unsupported_lifecycle": "Requested lifecycle is unsupported on this host; not lifecycle certification.",
    }
    return scopes[classification]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a cleanroom installer package lifecycle.")
    parser.add_argument("--archive", default=str(ROOT / "installer" / "dist" / "CivicSuite-clerk-core-linux-0.1.0.tar.gz"))
    parser.add_argument("--platform", choices=sorted(PLATFORM_LAUNCHERS), default=None)
    parser.add_argument("--run-id", default=None)
    parser.add_argument(
        "--verify-existing-install-root",
        default=None,
        help="Run workflow proof against an already-running installer root instead of reinstalling the package.",
    )
    parser.add_argument(
        "--verify-existing-run-id",
        default=None,
        help="Run id for --verify-existing-install-root; defaults to --run-id.",
    )
    parser.add_argument("--skip-install", action="store_true", help="Only verify archive extraction, readiness, and plan.")
    parser.add_argument("--gate", action="store_true", help="Run the cleanroom gate after readiness and plan.")
    parser.add_argument("--staff-mode", choices=("protected", "bearer", "open"), default="protected")
    parser.add_argument(
        "--workflow-proof",
        action="store_true",
        help=(
            "Run the mutating starter-set workflow proof during install. Repair/verify keep service checks "
            "only because first-admin password rotation consumes the one-time setup secret."
        ),
    )
    parser.add_argument(
        "--allow-host-cleanup",
        action="store_true",
        help=f"Authorize global Docker prune and WSL shutdown/compaction when the cleanroom host has less than {MIN_CLEANROOM_FREE_DISK_GB} GB free.",
    )
    args = parser.parse_args()

    run_id = args.run_id or make_run_id()
    report_dir = REPORT_ROOT / run_id
    if args.verify_existing_install_root:
        install_root = Path(args.verify_existing_install_root).resolve()
        if not install_root.is_dir():
            print(f"ERROR: existing install root not found: {install_root}", file=sys.stderr)
            return 2
        proof_run_id = args.verify_existing_run_id or args.run_id
        if not proof_run_id:
            print("ERROR: --verify-existing-install-root requires --run-id or --verify-existing-run-id.", file=sys.stderr)
            return 2
        env = os.environ.copy()
        env["CIVICSUITE_INSTALLER_INSTALL_ROOT"] = str(install_root)
        env["CIVICSUITE_INSTALLER_RUN_ID"] = proof_run_id
        command = [
            sys.executable,
            str(ROOT / "scripts" / "run-clerk-core-installer.py"),
            "verify",
            "--staff-mode",
            args.staff_mode,
            "--workflow-proof",
            "--module",
            "civicrecords-ai",
            "--module",
            "civicclerk",
            "--module",
            "civiccode",
        ]
        output_path = report_dir / "launcher-output" / "verify-existing-workflow-proof.log"
        proc = run_streaming(command, cwd=ROOT, timeout=900, env=env, output_path=output_path)
        parsed_output = parse_json_from_output(proc.stdout)
        status = "passed" if proc.returncode == 0 and parsed_output and parsed_output.get("status") == "passed" else "failed"
        proof = {
            "run_id": run_id,
            "existing_run_id": proof_run_id,
            "install_root": str(install_root),
            "status": status,
            "evidence_classification": "existing_stack_workflow_proof",
            "certification_scope": "Workflow proof against an already-running installer stack; not install lifecycle certification.",
            "steps": [
                {
                    "mode": "verify_existing_workflow_proof",
                    "command": command,
                    "returncode": proc.returncode,
                    "stdout": proc.stdout[-8000:],
                    "stderr": proc.stderr[-8000:],
                    "streamed_output": str(output_path),
                }
            ],
            "parsed_output": parsed_output,
        }
        report_dir.mkdir(parents=True, exist_ok=True)
        (report_dir / "installer-package-cleanroom.json").write_text(
            json.dumps(proof, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(proof, indent=2, sort_keys=True))
        return 0 if status == "passed" else 1

    archive = Path(args.archive).resolve()
    if not archive.is_file():
        print(f"ERROR: release archive not found: {archive}", file=sys.stderr)
        return 2
    platform = args.platform or infer_platform(archive)
    hygiene_ok, hygiene = cleanroom_hygiene(
        report_dir=report_dir,
        allow_host_cleanup=args.allow_host_cleanup
        or os.environ.get("CIVICSUITE_CLEANROOM_HOST_CLEANUP_APPROVED") == "1",
    )
    if not hygiene_ok:
        proof = {
            "run_id": run_id,
            "archive": str(archive),
            "status": "blocked",
            "evidence_classification": "cleanroom_hygiene_blocked",
            "certification_scope": "Cleanroom lifecycle did not run because host hygiene failed before extraction.",
            "cleanroom_hygiene": hygiene,
        }
        report_dir.mkdir(parents=True, exist_ok=True)
        (report_dir / "installer-package-cleanroom.json").write_text(
            json.dumps(proof, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(proof, indent=2, sort_keys=True))
        return 1
    extract_root = report_dir / "extracted"
    bundle_root = extract(archive, extract_root)
    launcher = find_launcher(bundle_root, platform)
    if not launcher.is_file():
        print(f"ERROR: extracted launcher missing: {launcher}", file=sys.stderr)
        return 2
    try:
        launcher.chmod(0o755)
    except OSError:
        pass

    steps: list[dict[str, object]] = []
    host_platform = normalized_host_platform()
    host_platform_matches_target = platform == host_platform
    lifecycle_requested = (not args.skip_install) or args.gate
    lifecycle_blocked = lifecycle_requested and not host_platform_matches_target
    launcher_env = os.environ.copy()
    launcher_env["CIVICSUITE_INSTALLER_RUN_ID"] = run_id
    if platform == "windows" and host_platform_matches_target:
        launcher_env["CIVICSUITE_INSTALLER_INSTALL_ROOT"] = str(bundle_root / "r")
    modes = ["readiness", "plan"]
    if lifecycle_requested and not lifecycle_blocked:
        modes.extend(["preclean", "install", "repair", "verify", "backup", "restore", "uninstall"])
    if args.gate and not lifecycle_blocked:
        modes.append("gate")
    status = "passed"
    lifecycle_summaries: list[dict[str, object]] = []
    workflow_proof_modes: list[str] = []
    for mode in modes:
        mode_workflow_proof = args.workflow_proof and mode == "install"
        if mode_workflow_proof:
            workflow_proof_modes.append(mode)
        launcher_mode = "uninstall" if mode == "preclean" else mode
        command = launcher_command(
            platform,
            launcher,
            launcher_mode,
            bundle_root,
            staff_mode=args.staff_mode,
            workflow_proof=mode_workflow_proof,
        )
        output_path = report_dir / "launcher-output" / f"{mode}.log"
        proc = run_streaming(
            command,
            cwd=bundle_root,
            timeout=mode_timeout(launcher_mode),
            env=launcher_env,
            output_path=output_path,
        )
        parsed_output = parse_json_from_output(proc.stdout)
        summary = lifecycle_summary(mode, parsed_output)
        if summary is not None and "ports" in summary:
            lifecycle_summaries.append(summary)
        steps.append(
            {
                "mode": mode,
                "command": command,
                "returncode": proc.returncode,
                "stdout": proc.stdout[-8000:],
                "stderr": proc.stderr[-8000:],
                "streamed_output": str(output_path),
            }
        )
        if proc.returncode != 0:
            status = "failed"
            if mode in {"install", "repair", "verify", "backup", "restore", "gate"}:
                cleanup_command = launcher_command(platform, launcher, "uninstall", bundle_root)
                cleanup_output_path = report_dir / "launcher-output" / "cleanup_after_failure.log"
                cleanup = run_streaming(
                    cleanup_command,
                    cwd=bundle_root,
                    timeout=900,
                    env=launcher_env,
                    output_path=cleanup_output_path,
                )
                steps.append(
                    {
                        "mode": "cleanup_after_failure",
                        "command": cleanup_command,
                        "returncode": cleanup.returncode,
                        "stdout": cleanup.stdout[-8000:],
                        "stderr": cleanup.stderr[-8000:],
                        "streamed_output": str(cleanup_output_path),
                    }
                )
            break
    if lifecycle_blocked:
        status = "blocked"
        steps.append(
            {
                "mode": "lifecycle_blocked",
                "returncode": 2,
                "stdout": "",
                "stderr": (
                    f"Lifecycle certification for {platform} requires a matching host. "
                    f"Current host is {host_platform} ({sys.platform})."
                ),
            }
        )

    classification = classify_evidence(
        platform=platform,
        host_platform=host_platform,
        skip_install=args.skip_install,
        status=status,
        lifecycle_blocked=lifecycle_blocked,
    )

    retained_evidence = retain_lifecycle_evidence(bundle_root, report_dir)

    cleanup_error: str | None = None
    extracted_bundle_retained = False
    if extract_root.exists():
        try:
            remove_tree_with_retry(extract_root)
        except OSError as exc:
            cleanup_error = str(exc)
            extracted_bundle_retained = True

    proof = {
        "run_id": run_id,
        "archive": str(archive),
        "platform": platform,
        "host_platform": sys.platform,
        "normalized_host_platform": host_platform,
        "host_platform_matches_target": host_platform_matches_target,
        "bundle_root": str(bundle_root),
        "extracted_bundle_retained": extracted_bundle_retained,
        "status": status,
        "mutates_host": lifecycle_requested and not lifecycle_blocked,
        "requested_mutating_lifecycle": lifecycle_requested,
        "workflow_proof_requested": args.workflow_proof,
        "workflow_proof_modes": workflow_proof_modes,
        "civicclerk_staff_mode": args.staff_mode,
        "lifecycle_isolation": {
            "run_id": run_id,
            "environment": {
                "CIVICSUITE_INSTALLER_RUN_ID": run_id,
                "CIVICSUITE_INSTALLER_INSTALL_ROOT": launcher_env.get("CIVICSUITE_INSTALLER_INSTALL_ROOT"),
            },
            "resolved_modes": lifecycle_summaries,
        },
        "evidence_classification": classification,
        "certification_scope": certification_scope(classification),
        "cleanroom_hygiene": hygiene,
        "retained_lifecycle_evidence": retained_evidence,
        "steps": steps,
    }
    if cleanup_error:
        proof["cleanup_error"] = cleanup_error
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "installer-package-cleanroom.json").write_text(
        json.dumps(proof, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(proof, indent=2, sort_keys=True))
    return 0 if status == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
