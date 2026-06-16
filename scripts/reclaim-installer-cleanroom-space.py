"""Reclaim disposable installer build inputs before hosted cleanroom lifecycle runs."""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORT_ROOT = ROOT / "installer" / "reports"
RECLAIM_TARGETS = (
    ROOT / "installer" / "generated",
    ROOT / "modules" / "civicrecords-ai",
    ROOT / "modules" / "civicclerk",
    ROOT / "modules" / "civiccode",
)


def disk_snapshot() -> dict[str, object]:
    usage = shutil.disk_usage(ROOT)
    return {
        "path": str(ROOT),
        "total_bytes": usage.total,
        "used_bytes": usage.used,
        "free_bytes": usage.free,
    }


def ensure_inside_root(path: Path) -> Path:
    root = ROOT.resolve()
    resolved = path.resolve()
    if not resolved.is_relative_to(root):
        raise RuntimeError(f"Refusing to reclaim path outside repository root: {resolved}")
    return resolved


def path_size(path: Path) -> int:
    if not path.exists():
        return 0
    if path.is_file():
        return path.stat().st_size
    total = 0
    for child in path.rglob("*"):
        try:
            if child.is_file():
                total += child.stat().st_size
        except OSError:
            continue
    return total


def reclaim_target(path: Path) -> dict[str, object]:
    resolved = ensure_inside_root(path)
    evidence: dict[str, object] = {
        "path": str(resolved),
        "relative_path": str(resolved.relative_to(ROOT.resolve())),
    }
    if not resolved.exists():
        evidence["status"] = "absent"
        evidence["bytes_before"] = 0
        return evidence
    evidence["bytes_before"] = path_size(resolved)
    if resolved.is_dir():
        shutil.rmtree(resolved)
    else:
        resolved.unlink()
    evidence["status"] = "removed"
    evidence["exists_after"] = resolved.exists()
    return evidence


def main() -> int:
    parser = argparse.ArgumentParser(description="Reclaim disposable hosted-runner installer workspace artifacts.")
    parser.add_argument("--run-id", required=True)
    parser.add_argument(
        "--approved",
        action="store_true",
        help="Confirm this cleanup is running in a disposable hosted-runner workspace.",
    )
    args = parser.parse_args()
    if not args.approved:
        print("ERROR: refusing cleanup without --approved", flush=True)
        return 2

    report_dir = REPORT_ROOT / args.run_id
    report_dir.mkdir(parents=True, exist_ok=True)
    before = disk_snapshot()
    targets = [reclaim_target(path) for path in RECLAIM_TARGETS]
    after = disk_snapshot()
    evidence = {
        "run_id": args.run_id,
        "created_at": datetime.now(UTC).isoformat(),
        "status": "passed",
        "purpose": (
            "Remove generated bundle sources after release archives are created so the "
            "hosted cleanroom lifecycle has enough free disk to extract and run the archive."
        ),
        "disk_before": before,
        "disk_after": after,
        "free_bytes_reclaimed": int(after["free_bytes"]) - int(before["free_bytes"]),
        "targets": targets,
    }
    (report_dir / "hosted-runner-workspace-reclaim.json").write_text(
        json.dumps(evidence, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(evidence, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
