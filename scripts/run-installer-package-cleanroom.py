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


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a cleanroom installer package lifecycle.")
    parser.add_argument("--archive", default=str(ROOT / "installer" / "dist" / "CivicSuite-clerk-core-linux-0.1.0.tar.gz"))
    parser.add_argument("--run-id", default=None)
    parser.add_argument("--skip-install", action="store_true", help="Only verify archive extraction, readiness, and plan.")
    args = parser.parse_args()

    archive = Path(args.archive).resolve()
    if not archive.is_file():
        print(f"ERROR: release archive not found: {archive}", file=sys.stderr)
        return 2
    run_id = args.run_id or make_run_id()
    report_dir = REPORT_ROOT / run_id
    extract_root = report_dir / "extracted"
    bundle_root = extract(archive, extract_root)
    launcher = bundle_root / "installer" / "generated" / "packages" / "clerk-core" / "linux" / "start-civicsuite-installer.sh"
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
    launcher_arg = launcher.relative_to(bundle_root).as_posix()
    status = "passed"
    for mode in modes:
        proc = run(["bash", launcher_arg, mode], cwd=bundle_root, timeout=3600 if mode in {"install", "repair"} else 900)
        steps.append(
            {
                "mode": mode,
                "returncode": proc.returncode,
                "stdout": proc.stdout[-8000:],
                "stderr": proc.stderr[-8000:],
            }
        )
        if proc.returncode != 0:
            status = "failed"
            if mode != "uninstall":
                cleanup = run(["bash", launcher_arg, "uninstall"], cwd=bundle_root, timeout=900)
                steps.append(
                    {
                        "mode": "cleanup_after_failure",
                        "returncode": cleanup.returncode,
                        "stdout": cleanup.stdout[-8000:],
                        "stderr": cleanup.stderr[-8000:],
                    }
                )
            break

    proof = {
        "run_id": run_id,
        "archive": str(archive),
        "bundle_root": str(bundle_root),
        "status": status,
        "mutates_host": not args.skip_install,
        "steps": steps,
    }
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "installer-package-cleanroom.json").write_text(
        json.dumps(proof, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(proof, indent=2, sort_keys=True))
    return 0 if status == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
