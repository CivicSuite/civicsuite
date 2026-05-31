"""Regression checks for Stage 2 live-install blocker fixes."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _load_installer_runner():
    path = ROOT / "scripts" / "run-clerk-core-installer.py"
    spec = importlib.util.spec_from_file_location("stage2_installer_runner", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_suite_session_secret_is_injected_into_api_overrides(tmp_path: Path) -> None:
    runner = _load_installer_runner()

    records = tmp_path / "records"
    clerk = tmp_path / "clerk"
    code = tmp_path / "code"
    for path in (records, clerk, code):
        path.mkdir()

    runner.write_records_override(records, {"api": 18000, "web": 18080})
    runner.write_clerk_handoff_override(clerk, "city-core-net")
    runner.write_code_handoff_override(code, "city-core-net")

    for path in (
        records / "docker-compose.civicsuite.override.yml",
        clerk / "docker-compose.civicsuite.override.yml",
        code / "docker-compose.civicsuite.override.yml",
    ):
        text = path.read_text(encoding="utf-8")
        assert "CIVICCORE_SUITE_SESSION_SECRET" in text
        assert "CIVICCORE_SUITE_SESSION_REVOCATION_FILE" in text

    code_text = (code / "docker-compose.civicsuite.override.yml").read_text(encoding="utf-8")
    assert "CIVICCODE_OLLAMA_MODEL: gemma4:e4b" in code_text
    assert "CIVICCODE_OLLAMA_EMBEDDING_MODEL: nomic-embed-text" in code_text
    assert 'CIVICCODE_OLLAMA_TIMEOUT_SECONDS: "8"' in code_text

    clerk_text = (clerk / "docker-compose.civicsuite.override.yml").read_text(encoding="utf-8")
    assert "citycore-ollama" in clerk_text


def test_ollama_model_prepare_pulls_and_prewarms_llm() -> None:
    runner = _load_installer_runner()
    text = Path(runner.__file__).read_text(encoding="utf-8")

    assert '"pull", model' in text
    assert '"required": True' in text
    assert '"run",\n                DEFAULT_LLM_MODEL' in text
    assert "ollama_prewarm_model" in text
    assert '"required": False' in text
    assert "Respond with OK." in text
    assert 'step.get("required", True) and step.get("returncode") != 0' in text


def test_records_response_letter_workflow_allows_llm_fallback_timeout() -> None:
    runner = _load_installer_runner()
    text = Path(runner.__file__).read_text(encoding="utf-8")

    assert "RESPONSE_LETTER_TIMEOUT_SECONDS = 180" in text
    assert "timeout_seconds=RESPONSE_LETTER_TIMEOUT_SECONDS" in text


def test_civiccode_qa_workflow_allows_deterministic_fallback_timeout() -> None:
    runner = _load_installer_runner()
    text = Path(runner.__file__).read_text(encoding="utf-8")

    assert "CODE_QA_TIMEOUT_SECONDS = 60" in text
    assert "CIVICCODE_OLLAMA_TIMEOUT_SECONDS = 8" in text
    assert "timeout_seconds=CODE_QA_TIMEOUT_SECONDS" in text


def test_blocked_readiness_exits_nonzero() -> None:
    proc = subprocess.run(
        [
            sys.executable,
            "scripts/plan-installer.py",
            "--profile",
            "city-core",
            "--dry-run",
            "--show-readiness",
            "--readiness-scenario",
            "missing-docker",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    assert proc.returncode == 1
    payload = json.loads(proc.stdout)
    assert payload["readiness"]["status"] == "blocked"


def test_cleanroom_disk_floor_is_25_gb() -> None:
    runner = ROOT / "scripts" / "run-installer-package-cleanroom.py"
    text = runner.read_text(encoding="utf-8")
    assert "MIN_CLEANROOM_FREE_DISK_GB = 25" in text
    assert "60 GB free" not in text


def test_generated_package_readme_uses_25_gb_disk_floor() -> None:
    planner = ROOT / "scripts" / "plan-installer.py"
    text = planner.read_text(encoding="utf-8")

    assert "MIN_FREE_DISK_GB = 25" in text
    assert "25 GB free disk" in text
    assert "60 * 1024 * 1024 * 1024" not in text
    assert "60 GB free disk" not in text


def test_generated_launcher_has_python_fallback_for_suite_launcher() -> None:
    planner = ROOT / "scripts" / "plan-installer.py"
    text = planner.read_text(encoding="utf-8")

    assert "python -m http.server {SUITE_LAUNCHER_PORT} --bind 127.0.0.1" in text
    assert "python3 -m http.server {SUITE_LAUNCHER_PORT} --bind 127.0.0.1" in text
