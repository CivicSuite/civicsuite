"""Behavioral checks for the clerk-usable Windows progress wrapper."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROGRESS = ROOT / "installer" / "baremetal" / "windows" / "civicsuite-baremetal-progress.ps1"


def _powershell() -> str:
    for candidate in ("pwsh", "powershell"):
        try:
            subprocess.run(
                [candidate, "-NoProfile", "-Command", "$PSVersionTable.PSVersion.Major"],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            return candidate
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    raise AssertionError("PowerShell is required for Windows progress tests")


def _write_bootstrap_result(path: Path, status: str = "passed") -> None:
    payload = {
        "status": status,
        "log_path": str(path.parent / "bootstrap.log"),
        "stage0": {"status": "passed"},
        "stage1": {"status": "passed"},
        "stage2": {"status": "passed"},
        "stage3": {"status": "passed"},
        "stage4": {"status": "passed" if status == "passed" else "failed"},
        "failure": None
        if status == "passed"
        else {
            "message": "Stage4 proof failed",
            "actionable_message": "Review lifecycle evidence and rerun after Ollama proof is green.",
        },
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


def _run_progress(tmp_path: Path, bootstrap_result: Path) -> tuple[subprocess.CompletedProcess[str], dict, str]:
    log_root = tmp_path / "progress"
    completed = subprocess.run(
        [
            _powershell(),
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(PROGRESS),
            "-LogRoot",
            str(log_root),
            "-BootstrapResultPath",
            str(bootstrap_result),
        ],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=60,
    )
    result = json.loads((log_root / "civicsuite-baremetal-progress-result.json").read_text(encoding="utf-8"))
    summary = (log_root / "civicsuite-baremetal-progress.txt").read_text(encoding="utf-8-sig")
    return completed, result, summary


def test_progress_wrapper_renders_phase_statuses_logs_and_final_urls(tmp_path: Path) -> None:
    bootstrap_result = tmp_path / "bootstrap-result.json"
    _write_bootstrap_result(bootstrap_result)

    completed, result, summary = _run_progress(tmp_path, bootstrap_result)

    assert completed.returncode == 0, completed.stderr
    assert result["status"] == "passed"
    assert result["phases"]["stage4"] == "passed"
    assert "Stage0 target check: passed" in summary
    assert "Logs:" in summary
    assert "CivicSuite is ready when Stage4 is passed. Open it here:" in summary
    assert "http://127.0.0.1:18082/" in summary
    assert "http://127.0.0.1:18080/" in summary
    assert "http://127.0.0.1:18081/" in summary
    assert "http://127.0.0.1:18820/" in summary


def test_progress_wrapper_surfaces_actionable_failure_without_ready_urls(tmp_path: Path) -> None:
    bootstrap_result = tmp_path / "bootstrap-result.json"
    _write_bootstrap_result(bootstrap_result, status="failed")

    completed, result, summary = _run_progress(tmp_path, bootstrap_result)

    assert completed.returncode == 1
    assert result["status"] == "failed"
    assert "Status: failed" in summary
    assert "Review lifecycle evidence" in summary
    assert "CivicSuite is ready" not in summary
