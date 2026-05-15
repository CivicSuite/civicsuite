"""Extract a CivicSuite release archive and run the installer lifecycle."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tarfile
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
REPORT_ROOT = ROOT / "installer" / "reports"
PLATFORM_LAUNCHERS = {
    "linux": Path("installer/generated/packages/clerk-core/linux/start-civicsuite-installer.sh"),
    "macos": Path("installer/generated/packages/clerk-core/macos/start-civicsuite-installer.sh"),
    "windows": Path("installer/generated/packages/clerk-core/windows/start-civicsuite-installer.ps1"),
}


def make_run_id() -> str:
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    return f"installer-package-cleanroom-{stamp}-{uuid4().hex[:8]}"


def run(command: list[str], *, cwd: Path, timeout: int) -> subprocess.CompletedProcess[str]:
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


def extract(archive: Path, target: Path) -> Path:
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


def infer_platform(archive: Path) -> str:
    name = archive.name.lower()
    for platform in PLATFORM_LAUNCHERS:
        if platform in name:
            return platform
    raise RuntimeError(
        f"Could not infer package platform from {archive.name}. "
        f"Pass --platform with one of: {', '.join(sorted(PLATFORM_LAUNCHERS))}."
    )


def launcher_command(platform: str, launcher: Path, mode: str, bundle_root: Path) -> list[str]:
    launcher_arg = launcher.relative_to(bundle_root).as_posix()
    if platform == "windows":
        switches = {
            "readiness": [],
            "plan": ["-Plan"],
            "install": ["-Install"],
            "repair": ["-Repair"],
            "verify": ["-Verify"],
            "uninstall": ["-Uninstall"],
            "gate": ["-Gate"],
        }
        return [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            launcher_arg,
            *switches[mode],
        ]
    return ["bash", launcher_arg, mode]


def mode_timeout(mode: str) -> int:
    if mode in {"install", "repair", "gate"}:
        return 3600
    return 900


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a cleanroom installer package lifecycle.")
    parser.add_argument("--archive", default=str(ROOT / "installer" / "dist" / "CivicSuite-clerk-core-linux-0.1.0.tar.gz"))
    parser.add_argument("--platform", choices=sorted(PLATFORM_LAUNCHERS), default=None)
    parser.add_argument("--run-id", default=None)
    parser.add_argument("--skip-install", action="store_true", help="Only verify archive extraction, readiness, and plan.")
    parser.add_argument("--gate", action="store_true", help="Run the cleanroom gate after readiness and plan.")
    args = parser.parse_args()

    archive = Path(args.archive).resolve()
    if not archive.is_file():
        print(f"ERROR: release archive not found: {archive}", file=sys.stderr)
        return 2
    platform = args.platform or infer_platform(archive)
    run_id = args.run_id or make_run_id()
    report_dir = REPORT_ROOT / run_id
    extract_root = report_dir / "extracted"
    bundle_root = extract(archive, extract_root)
    launcher = bundle_root / PLATFORM_LAUNCHERS[platform]
    if not launcher.is_file():
        print(f"ERROR: extracted launcher missing: {launcher}", file=sys.stderr)
        return 2
    try:
        launcher.chmod(0o755)
    except OSError:
        pass

    steps: list[dict[str, object]] = []
    modes = ["readiness", "plan"]
    if not args.skip_install:
        modes.extend(["install", "repair", "verify", "uninstall"])
    if args.gate:
        modes.append("gate")
    status = "passed"
    for mode in modes:
        command = launcher_command(platform, launcher, mode, bundle_root)
        proc = run(command, cwd=bundle_root, timeout=mode_timeout(mode))
        steps.append(
            {
                "mode": mode,
                "command": command,
                "returncode": proc.returncode,
                "stdout": proc.stdout[-8000:],
                "stderr": proc.stderr[-8000:],
            }
        )
        if proc.returncode != 0:
            status = "failed"
            if mode != "uninstall":
                cleanup_command = launcher_command(platform, launcher, "uninstall", bundle_root)
                cleanup = run(cleanup_command, cwd=bundle_root, timeout=900)
                steps.append(
                    {
                        "mode": "cleanup_after_failure",
                        "command": cleanup_command,
                        "returncode": cleanup.returncode,
                        "stdout": cleanup.stdout[-8000:],
                        "stderr": cleanup.stderr[-8000:],
                    }
                )
            break

    proof = {
        "run_id": run_id,
        "archive": str(archive),
        "platform": platform,
        "host_platform": sys.platform,
        "bundle_root": str(bundle_root),
        "extracted_bundle_retained": False,
        "status": status,
        "mutates_host": not args.skip_install,
        "steps": steps,
    }
    if extract_root.exists():
        shutil.rmtree(extract_root)
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "installer-package-cleanroom.json").write_text(
        json.dumps(proof, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(proof, indent=2, sort_keys=True))
    return 0 if status == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
