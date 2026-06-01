"""Regression checks for Stage 2 live-install blocker fixes."""

from __future__ import annotations

import importlib.util
import io
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


def _load_package_cleanroom():
    path = ROOT / "scripts" / "run-installer-package-cleanroom.py"
    spec = importlib.util.spec_from_file_location("stage2_package_cleanroom", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_plan_installer():
    path = ROOT / "scripts" / "plan-installer.py"
    spec = importlib.util.spec_from_file_location("stage2_plan_installer", path)
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

    runner.write_records_env(records / ".env", {"api": 18000, "web": 18080})
    records_env = (records / ".env").read_text(encoding="utf-8")
    assert "RESPONSE_LETTER_LLM_TIMEOUT_SECONDS=120" in records_env
    assert "OLLAMA_KEEP_ALIVE=30m" in records_env


def test_ollama_model_prepare_prewarm_timeout_is_required_failure(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()

    calls: list[list[str]] = []

    def fake_run(command, **_kwargs):
        calls.append(command)
        if "run" in command:
            raise subprocess.TimeoutExpired(command, timeout=runner.OLLAMA_PREWARM_TIMEOUT_SECONDS)
        return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

    monkeypatch.setattr(runner, "run", fake_run)
    ctx = {
        "selected_modules": [runner.MODULE_RECORDS],
        "records_project": "records-proj",
        "records_source": tmp_path,
    }

    steps = runner.ensure_ollama_models(ctx)

    assert any(step["step"] == "ollama_pull_model" and step["required"] is True for step in steps)
    prewarm = [step for step in steps if step["step"] == "ollama_prewarm_model"][0]
    assert prewarm["status"] == "failed"
    assert prewarm["required"] is True
    assert prewarm["returncode"] == 124
    assert prewarm["timeout_seconds"] == 300
    assert "must not run against a cold model" in prewarm["stderr"]
    assert any("Respond with OK." in command for command in calls)


def test_ollama_prewarm_model_load_failure_is_required_failure(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()

    def fake_run(command, **_kwargs):
        if "run" in command:
            return subprocess.CompletedProcess(command, 1, stdout="", stderr="requires more system memory")
        return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

    monkeypatch.setattr(runner, "run", fake_run)
    ctx = {
        "selected_modules": [runner.MODULE_RECORDS],
        "records_project": "records-proj",
        "records_source": tmp_path,
    }

    steps = runner.ensure_ollama_models(ctx)

    prewarm = [step for step in steps if step["step"] == "ollama_prewarm_model"][0]
    assert prewarm["status"] == "failed"
    assert prewarm["required"] is True
    assert "Increase Docker Desktop / WSL2 memory" in " ".join(prewarm["fix_steps"])


def test_ollama_prewarm_success_requires_resident_model_check(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()

    def fake_run(command, **_kwargs):
        if command[-2:] == ["ollama", "ps"]:
            return subprocess.CompletedProcess(command, 0, stdout="gemma4:e4b 123 MB 100% 30 minutes\n", stderr="")
        return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

    monkeypatch.setattr(runner, "run", fake_run)
    ctx = {
        "selected_modules": [runner.MODULE_RECORDS],
        "records_project": "records-proj",
        "records_source": tmp_path,
    }

    steps = runner.ensure_ollama_models(ctx)

    loaded = [step for step in steps if step["step"] == "ollama_loaded_model_check"][0]
    assert loaded["status"] == "passed"
    assert loaded["required"] is True


def test_install_warms_records_ollama_before_module_stack(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()
    calls: list[list[str]] = []
    install_root = tmp_path / "install"
    records_source = tmp_path / "records"
    clerk_source = tmp_path / "clerk"
    code_source = tmp_path / "code"
    for source in (records_source, clerk_source, code_source):
        source.mkdir(parents=True)

    def fake_run(command, **_kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

    monkeypatch.setattr(runner, "run", fake_run)
    monkeypatch.setattr(runner, "require_command", lambda _command: None)
    monkeypatch.setattr(
        runner,
        "prepare_sources",
        lambda *_args, **_kwargs: {
            "selected_modules": [runner.MODULE_RECORDS],
            "records_project": "records-proj",
            "records_source": records_source,
            "clerk_project": "clerk-proj",
            "clerk_source": clerk_source,
            "code_project": "code-proj",
            "code_source": code_source,
        },
    )
    monkeypatch.setattr(
        runner,
        "ensure_ollama_models",
        lambda _ctx, selected_modules=None: [
            {
                "module": runner.MODULE_RECORDS,
                "step": "ollama_prewarm_model",
                "required": True,
                "returncode": 0,
                "selected_modules": selected_modules,
            }
        ],
    )
    monkeypatch.setattr(
        runner,
        "verify",
        lambda *_args, **_kwargs: {"status": "passed", "checks": []},
    )

    result = runner.install(
        install_root,
        isolation={"ports": {}, "project_suffix": "test"},
        report_dir=tmp_path / "reports",
        selected_modules=[runner.MODULE_RECORDS],
    )

    assert result["status"] == "passed"
    command_text = [" ".join(command) for command in calls]
    warm_first_index = next(index for index, command in enumerate(command_text) if "up -d ollama" in command)
    records_stack_index = next(index for index, command in enumerate(command_text) if "up -d api frontend" in command)
    assert warm_first_index < records_stack_index


def test_records_response_letter_workflow_requires_model_generation() -> None:
    runner = _load_installer_runner()
    text = Path(runner.__file__).read_text(encoding="utf-8")

    assert "RESPONSE_LETTER_TIMEOUT_SECONDS = 180" in text
    assert "RESPONSE_LETTER_LLM_TIMEOUT_SECONDS = 120" in text
    assert 'OLLAMA_KEEP_ALIVE = "30m"' in text
    assert "timeout_seconds=RESPONSE_LETTER_TIMEOUT_SECONDS" in text
    assert 'letter.get("generation_source") != "ollama"' in text
    assert 'letter.get("generation_model") != DEFAULT_LLM_MODEL' in text


def test_readiness_fails_closed_when_memory_is_undetectable(monkeypatch) -> None:
    planner = _load_plan_installer()

    class FakeUsage:
        free = planner.MIN_FREE_DISK_BYTES + 1

    monkeypatch.setattr(planner.shutil, "disk_usage", lambda _root: FakeUsage())
    monkeypatch.setattr(planner, "_memory_bytes", lambda: None)
    monkeypatch.setattr(planner, "_known_command_path", lambda command: f"/usr/bin/{command}")
    monkeypatch.setattr(planner, "_run_probe", lambda *_args, **_kwargs: {"ok": True})

    deps = planner.detect_host_dependencies({"system": "linux"})
    disk_memory = deps["checks"]["disk-memory"]

    assert disk_memory["detected"] is False
    assert disk_memory["evidence"]["memory_bytes"] == 0
    assert disk_memory["evidence"]["memory_detected"] is False


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


def test_run_streaming_timeout_kills_waits_and_returns_124(tmp_path: Path) -> None:
    cleanroom = _load_package_cleanroom()

    proc = cleanroom.run_streaming(
        [sys.executable, "-c", "import time; time.sleep(10)"],
        cwd=ROOT,
        timeout=1,
        output_path=tmp_path / "timeout.log",
    )

    assert proc.returncode == 124
    assert "TIMEOUT: command exceeded 1 seconds" in proc.stdout
    assert "combined stdout/stderr streamed to" in proc.stderr


def test_run_streaming_unknown_returncode_is_failure(monkeypatch, tmp_path: Path) -> None:
    cleanroom = _load_package_cleanroom()

    class FakeProcess:
        returncode = None

        def __init__(self, *_args, **_kwargs):
            self.poll_count = 0

        def poll(self):
            self.poll_count += 1
            return 0

        def kill(self):
            raise AssertionError("should not kill a completed fake process")

    monkeypatch.setattr(cleanroom.subprocess, "Popen", FakeProcess)

    proc = cleanroom.run_streaming(
        ["fake"],
        cwd=ROOT,
        timeout=30,
        output_path=tmp_path / "unknown.log",
    )

    assert proc.returncode == 1
    assert "unknown exit code" in proc.stdout


def test_package_cleanroom_streams_launcher_output_and_supports_existing_stack_proof() -> None:
    runner = ROOT / "scripts" / "run-installer-package-cleanroom.py"
    text = runner.read_text(encoding="utf-8")

    assert "shutil.rmtree(target)" in text
    assert "Refusing to clear extraction target outside installer reports" in text
    assert "def run_streaming" in text
    assert "launcher-output" in text
    assert "streamed_output" in text
    assert "--verify-existing-install-root" in text
    assert "existing_stack_workflow_proof" in text


def test_existing_stack_provenance_binds_to_manifest_hash(tmp_path: Path) -> None:
    runner = _load_installer_runner()
    modules = [runner.MODULE_RECORDS, runner.MODULE_CLERK]

    path = runner.write_install_provenance(tmp_path, modules)
    proof = runner.verify_install_provenance(tmp_path, modules)

    assert path.name == runner.INSTALL_PROVENANCE_FILE
    assert proof["status"] == "passed"

    payload = json.loads(path.read_text(encoding="utf-8"))
    payload["manifest_sha256"] = "not-current"
    path.write_text(json.dumps(payload), encoding="utf-8")

    failed = runner.verify_install_provenance(tmp_path, modules)
    assert failed["status"] == "failed"
    assert "manifest_sha256" in failed["mismatches"]


def test_generated_package_readme_uses_25_gb_disk_floor() -> None:
    planner = ROOT / "scripts" / "plan-installer.py"
    text = planner.read_text(encoding="utf-8")

    assert "MIN_FREE_DISK_GB = 25" in text
    assert "MIN_LLM_MEMORY_GB = 12" in text
    assert "25 GB free disk" in text
    assert "60 * 1024 * 1024 * 1024" not in text
    assert "60 GB free disk" not in text


def test_plan_installer_can_use_module_source_override() -> None:
    planner = ROOT / "scripts" / "plan-installer.py"
    text = planner.read_text(encoding="utf-8")

    assert "CIVICSUITE_SOURCE_ROOT_" in text
    assert 're.sub(r"[^A-Z0-9]+", "_", module_name.upper()).strip("_")' in text


def test_wait_for_url_timeout_records_124_and_fails(monkeypatch) -> None:
    runner = _load_installer_runner()

    clock = {"now": 0.0}

    def fake_time():
        clock["now"] += 0.6
        return clock["now"]

    def fake_run(command, **_kwargs):
        raise subprocess.TimeoutExpired(command, timeout=8)

    monkeypatch.setattr(runner.time, "time", fake_time)
    monkeypatch.setattr(runner.time, "sleep", lambda _seconds: None)
    monkeypatch.setattr(runner, "run", fake_run)

    proof = runner.wait_for_url("http://127.0.0.1:18082/", timeout_seconds=1)

    assert proof["status"] == "failed"
    assert proof["attempts"][0]["returncode"] == 124
    assert "timed out" in proof["attempts"][0]["stderr"]


def test_verify_suite_launcher_http_probe_fails_on_early_exit(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()
    (tmp_path / runner.SUITE_LAUNCHER_DIR_NAME).mkdir()
    monkeypatch.setattr(runner, "wait_for_url", lambda *_args, **_kwargs: {"status": "failed", "attempts": []})

    class FakeProcess:
        returncode = 98
        stderr = io.StringIO("address already in use")

        def poll(self):
            return self.returncode

        def terminate(self):
            pass

        def wait(self, timeout=None):
            return self.returncode

    monkeypatch.setattr(runner.subprocess, "Popen", lambda *_args, **_kwargs: FakeProcess())

    proof = runner.verify_suite_launcher_serves({"install_root": tmp_path})

    assert proof["status"] == "failed"
    assert proof["error"] == "address already in use"
    assert any("netstat -ano" in step for step in proof["fix_steps"])


def test_verify_suite_launcher_http_probe_requires_launcher_content(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()
    (tmp_path / runner.SUITE_LAUNCHER_DIR_NAME).mkdir()
    responses = iter(
        [
            {"status": "failed", "attempts": []},
            {"status": "passed", "attempts": [{"returncode": 0, "stdout": "<html>wrong app</html>", "stderr": ""}]},
        ]
    )
    monkeypatch.setattr(runner, "wait_for_url", lambda *_args, **_kwargs: next(responses))

    class FakeProcess:
        returncode = None
        stderr = io.StringIO("")

        def poll(self):
            return None

        def terminate(self):
            pass

        def wait(self, timeout=None):
            return 0

    monkeypatch.setattr(runner.subprocess, "Popen", lambda *_args, **_kwargs: FakeProcess())

    proof = runner.verify_suite_launcher_serves({"install_root": tmp_path})

    assert proof["status"] == "failed"
    assert proof["content_marker_present"] is False
    assert proof["fix_steps"]


def test_warning_steps_bubble_to_top_level_summary() -> None:
    runner = _load_installer_runner()
    warnings = runner.collect_status_warnings(
        [
            {"step": "ollama_prewarm_model", "module": "civicrecords-ai", "status": "warning", "stderr": "first request slower"},
            {"step": "compose_up", "module": "civicrecords-ai", "status": "passed"},
        ]
    )

    assert warnings == [
        {
            "name": "ollama_prewarm_model",
            "module": "civicrecords-ai",
            "message": "first request slower",
            "fix_steps": [],
        }
    ]


def test_portal_mode_route_check_retries_slow_openapi_schema() -> None:
    runner = _load_installer_runner()

    calls = {"count": 0}

    def fake_get_json(url, **_kwargs):
        if url.endswith("/config/portal-mode"):
            return 200, {"mode": "public"}
        calls["count"] += 1
        return 598, {"detail": {"message": "timeout"}}

    runner.get_json = fake_get_json
    runner.time.sleep = lambda _seconds: None

    proof = runner.verify_records_portal_mode({"api": 18080}, expected_mode="public")

    assert proof["status"] == "failed"
    public_routes = [check for check in proof["checks"] if check["name"] == "public_route_mounts"][0]
    assert calls["count"] == 6
    assert public_routes["attempts"] == [{"status_code": 598}] * 6


def test_generated_launcher_has_python_fallback_for_suite_launcher() -> None:
    planner = ROOT / "scripts" / "plan-installer.py"
    text = planner.read_text(encoding="utf-8")

    assert "python -m http.server {SUITE_LAUNCHER_PORT} --bind 127.0.0.1" in text
    assert "python3 -m http.server {SUITE_LAUNCHER_PORT} --bind 127.0.0.1" in text
