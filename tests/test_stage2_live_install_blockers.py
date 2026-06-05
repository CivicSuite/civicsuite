"""Regression checks for Stage 2 live-install blocker fixes."""

from __future__ import annotations

import importlib.util
import io
import json
import subprocess
import sys
import zipfile
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


def test_records_workflow_rejects_wrong_model_response_behaviorally(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()

    password_path = tmp_path / "data" / "secrets" / "first_admin_password"
    password_path.parent.mkdir(parents=True)
    password_path.write_text("first-admin-password", encoding="utf-8")
    monkeypatch.setattr(runner, "post_form", lambda _url, _payload: (200, {"access_token": "token"}))

    def fake_get_json(url, **_kwargs):
        if url.endswith("/users/me"):
            return 200, {"must_change_password": False}
        if url.endswith("/requests/1"):
            return 200, {"id": "1"}
        if url.endswith("/search/filters"):
            return 200, {"file_types": [], "source_names": [], "departments": []}
        return 200, {}

    def fake_patch_json(_url, payload, **_kwargs):
        return 200, {"status": payload["status"]}

    def fake_post_json(url, _payload, **_kwargs):
        if url.endswith("/requests/"):
            return 201, {"id": "1", "status": "submitted"}
        if url.endswith("/submit-review"):
            return 200, {"status": "in_review"}
        if url.endswith("/response-letter"):
            return 201, {
                "id": "letter-1",
                "status": "draft",
                "generation_source": "ollama",
                "generation_model": "wrong-model",
                "generated_content": "Draft requires human review.",
            }
        if url.endswith("/ready-for-release"):
            return 200, {"status": "ready_for_release"}
        raise AssertionError(f"unexpected POST {url}")

    monkeypatch.setattr(runner, "get_json", fake_get_json)
    monkeypatch.setattr(runner, "patch_json", fake_patch_json)
    monkeypatch.setattr(runner, "post_json", fake_post_json)

    result = runner.verify_records_workflow(tmp_path, {"api": 18000})

    assert result["status"] == "failed"
    letter_check = [check for check in result["checks"] if check["name"] == "draft_response_letter"][0]
    assert letter_check["generation_source"] == "ollama"
    assert letter_check["generation_model"] == "wrong-model"
    assert letter_check["expected_generation_model"] == runner.DEFAULT_LLM_MODEL


def test_records_workflow_admin_login_is_reentrant_after_rotation(monkeypatch, tmp_path: Path) -> None:
    """The bootstrapper runs the workflow proof twice (install mode, then verify
    mode). The first pass rotates the forced-first-login admin password, so the
    SECOND pass can no longer authenticate with the seeded secret (fastapi-users
    returns 400). The proof must re-derive the deterministic rotated password and
    still reach the draft_response_letter proof — otherwise the gate's verify-mode
    evidence (what Stage4 reads) is permanently missing the letter. This is the
    live-install blocker found in TESTER-RESULT-013/014 (must_change_password=f
    + admin_login 400 on a fresh stack)."""
    runner = _load_installer_runner()

    password = "first-admin-password"
    password_path = tmp_path / "data" / "secrets" / "first_admin_password"
    password_path.parent.mkdir(parents=True)
    password_path.write_text(password, encoding="utf-8")

    # Deterministic rotation target — must match the runner's derivation exactly.
    expected_rotated = f"Rotated-{password}-A1!"

    seen_logins: list[str] = []

    def fake_post_form(_url, payload):
        seen_logins.append(payload["password"])
        # The seeded secret no longer authenticates (a prior pass rotated it).
        if payload["password"] == password:
            return 400, {"detail": "LOGIN_BAD_CREDENTIALS"}
        # The deterministic rotated password DOES authenticate on re-entry.
        if payload["password"] == expected_rotated:
            return 200, {"access_token": "token"}
        return 400, {"detail": "LOGIN_BAD_CREDENTIALS"}

    def fake_get_json(url, **_kwargs):
        if url.endswith("/users/me"):
            # Already rotated by the prior pass — no re-rotation required.
            return 200, {"must_change_password": False}
        if url.endswith("/requests/1"):
            return 200, {"id": "1"}
        if url.endswith("/search/filters"):
            return 200, {"file_types": [], "source_names": [], "departments": []}
        return 200, {}

    def fake_patch_json(_url, payload, **_kwargs):
        return 200, {"status": payload["status"]}

    def fake_post_json(url, _payload, **_kwargs):
        if url.endswith("/requests/"):
            return 201, {"id": "1", "status": "submitted"}
        if url.endswith("/submit-review"):
            return 200, {"status": "in_review"}
        if url.endswith("/response-letter"):
            return 201, {
                "id": "letter-1",
                "status": "draft",
                "generation_source": "ollama",
                "generation_model": runner.DEFAULT_LLM_MODEL,
                "generated_content": "Draft requires human review.",
            }
        if url.endswith("/ready-for-release"):
            return 200, {"status": "ready_for_release"}
        raise AssertionError(f"unexpected POST {url}")

    monkeypatch.setattr(runner, "post_form", fake_post_form)
    monkeypatch.setattr(runner, "get_json", fake_get_json)
    monkeypatch.setattr(runner, "patch_json", fake_patch_json)
    monkeypatch.setattr(runner, "post_json", fake_post_json)

    result = runner.verify_records_workflow(tmp_path, {"api": 18000})

    # The seeded secret was tried first and 400'd, then the deterministic rotated
    # password was tried and succeeded — proving the re-entry fallback fired.
    assert seen_logins[0] == password
    assert expected_rotated in seen_logins
    admin_login = [c for c in result["checks"] if c["name"] == "admin_login"][0]
    assert admin_login["status_code"] == 200
    assert admin_login["has_access_token"] is True
    # The whole proof completes through the letter despite the stale seed.
    letter_check = [c for c in result["checks"] if c["name"] == "draft_response_letter"][0]
    assert letter_check["generation_source"] == "ollama"
    assert letter_check["generation_model"] == runner.DEFAULT_LLM_MODEL
    assert result["status"] == "passed"


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


def test_compose_build_retries_transient_docker_desktop_transport_failure(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()
    calls: list[list[str]] = []

    responses = iter(
        [
            subprocess.CompletedProcess(
                ["docker"],
                1,
                stdout="",
                stderr="failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF",
            ),
            subprocess.CompletedProcess(["docker"], 0, stdout="built", stderr=""),
        ]
    )

    def fake_run(command, **_kwargs):
        calls.append(command)
        return next(responses)

    monkeypatch.setattr(runner, "run", fake_run)
    monkeypatch.setattr(runner.time, "sleep", lambda _seconds: None)

    proc, attempts = runner.run_compose_build_with_retry("proj", tmp_path, "api")

    assert proc.returncode == 0
    assert len(attempts) == 2
    assert attempts[0]["transient_retryable"] is True
    assert attempts[0]["retry_after_seconds"] == runner.COMPOSE_BUILD_RETRY_DELAY_SECONDS
    assert all("build" in command for command in calls)


def test_compose_build_does_not_retry_deterministic_build_failure(monkeypatch, tmp_path: Path) -> None:
    runner = _load_installer_runner()
    calls: list[list[str]] = []

    def fake_run(command, **_kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 1, stdout="", stderr="Dockerfile: no such file")

    monkeypatch.setattr(runner, "run", fake_run)

    proc, attempts = runner.run_compose_build_with_retry("proj", tmp_path, "api")

    assert proc.returncode == 1
    assert len(attempts) == 1
    assert attempts[0]["transient_retryable"] is False
    assert len(calls) == 1


def test_installer_subprocess_env_reduces_compose_parallelism(monkeypatch) -> None:
    runner = _load_installer_runner()
    monkeypatch.delenv("COMPOSE_PARALLEL_LIMIT", raising=False)

    env = runner.installer_subprocess_env()

    assert env["COMPOSE_PARALLEL_LIMIT"] == "1"


def test_city_core_windows_release_bundle_contains_baremetal_installer(monkeypatch, tmp_path: Path) -> None:
    planner = _load_plan_installer()

    package_dir = tmp_path / "packages" / "city-core" / "windows"
    package_dir.mkdir(parents=True)
    (package_dir / "start-civicsuite-installer.ps1").write_text("# legacy launcher\n", encoding="utf-8")
    (package_dir / "install-plan.json").write_text(
        json.dumps({"modules": ["civiccore"]}) + "\n",
        encoding="utf-8",
    )

    bundle_root = tmp_path / "bundles"
    launcher_source = tmp_path / "suite-launcher-source"
    (launcher_source / "scripts").mkdir(parents=True)
    (launcher_source / "index.html").write_text("<main>CivicSuite</main>\n", encoding="utf-8")
    (launcher_source / "scripts" / "serve.mjs").write_text("console.log('serve')\n", encoding="utf-8")

    monkeypatch.setattr(planner, "BUNDLE_ROOT", bundle_root)
    monkeypatch.setattr(planner, "SUITE_LAUNCHER_SOURCE", launcher_source)

    bundle_dir = planner._stage_release_bundle(
        profile_id="city-core",
        platform_id="windows",
        package_dir=package_dir,
    )

    baremetal_root = bundle_dir / "installer" / "baremetal" / "windows"
    assert (baremetal_root / "civicsuite-baremetal-progress.ps1").is_file()
    assert (baremetal_root / "civicsuite-baremetal-bootstrap.ps1").is_file()
    assert (baremetal_root / "docker-desktop-spike.ps1").is_file()
    assert not (baremetal_root / "logs").exists()
    bundle_readme = (bundle_dir / "README.md").read_text(encoding="utf-8")
    assert "installer/baremetal/windows/civicsuite-baremetal-progress.ps1" in bundle_readme
    assert "installer/generated/packages/city-core/windows/start-civicsuite-installer.ps1" not in bundle_readme


def test_city_core_windows_one_click_launches_baremetal_progress_wrapper(tmp_path: Path) -> None:
    planner = _load_plan_installer()

    archive_path = tmp_path / "payload.zip"
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr(
            "CivicSuite-city-core-windows/installer/baremetal/windows/civicsuite-baremetal-progress.ps1",
            "# progress\n",
        )
    target_path = tmp_path / "CivicSuite-city-core-windows-0.1.2.cmd"

    planner._write_windows_one_click_installer(
        archive_path=archive_path,
        target_path=target_path,
        profile_id="city-core",
        version="0.1.2",
    )

    script = target_path.read_bytes().rsplit(b"\r\n__CIVICSUITE_ZIP_PAYLOAD_BELOW__\r\n", 1)[0].decode(
        "utf-8",
        errors="replace",
    )
    assert "civicsuite-baremetal-progress.ps1" in script
    assert "civicsuite-baremetal-bootstrap.ps1" in script
    assert "installer\\baremetal\\windows" in script
    assert "CivicSuite bare-metal wrapper smoke check passed." in script
    assert "PSParser" in script
    assert "-PlanOnly" not in script
    assert "-FirstRun" not in script


def test_city_core_windows_package_readme_points_to_baremetal_progress_wrapper() -> None:
    planner = _load_plan_installer()

    readme = planner._package_readme_text(
        profile_id="city-core",
        menu_style="guided",
        platform_id="windows",
        plan={"modules": ["civiccore", "civicrecords-ai", "civicclerk", "civiccode"]},
    )

    assert "civicsuite-baremetal-progress.ps1" in readme
    assert "self-elevating Stage 3A bootstrapper" in readme
    assert "generation_source=ollama" in readme
    assert "start from the Stage 3A progress wrapper" in readme
    assert ".\\start-civicsuite-installer.ps1 -FirstRun" not in readme


def test_test_comms_standing_run_uses_customer_artifact_and_real_host_facts() -> None:
    readme = (ROOT / "test-comms" / "README.md").read_text(encoding="utf-8")

    assert "CivicSuite-city-core-windows-0.1.2.cmd" in readme
    assert "not the repo-local bootstrapper" in readme
    assert "Stage0 must live-prove `Get-HostFacts`" in readme
    assert "corrected `-HostFactsJson`" not in readme


def test_stage3a_truth_docs_name_green_artifact_gate_and_refresh_regate_without_promotion() -> None:
    guide = (ROOT / "docs" / "installer" / "windows-baremetal-stage3a-guide.md").read_text(encoding="utf-8")
    status = (ROOT / "STATUS.md").read_text(encoding="utf-8")
    changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")

    for text in (guide, status, changelog):
        normalized = " ".join(text.lower().split())
        assert "tester result 017" in normalized
        assert "tester result 018" in normalized
        assert "tester result 021" in normalized
        assert "tester directive 022" in normalized
        assert "generation_source=ollama" in text
        assert "generation_model=gemma4:e4b" in text
        assert (
            "No merge, tag, status promotion" in text
            or "not a merge, tag, status promotion" in text
            or "does not merge, tag, status-promote" in text
        )

    assert "artifact-path gate was green" in status
    assert "tester directive 022 is pending" in status
    assert "tester directive 022 is pending" in guide
    assert "public-use/procurement/production/full-suite claim" in changelog


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


def test_resolve_staff_mode_forces_bearer_for_workflow_proof() -> None:
    """--workflow-proof authenticates CivicClerk via the bearer staff token, so the
    proof requires bearer mode. Without this the clerk install stays protected and
    the bearer workflow proof 401s at /staff/session (live-install blocker found in
    TESTER-RESULT-015: civicclerk_bearer_workflow + clerk_to_code_handoff 401)."""
    runner = _load_installer_runner()

    # A proof run forces bearer regardless of the requested default.
    assert runner.resolve_staff_mode(runner.CLERK_STAFF_MODE_PROTECTED, workflow_proof=True) == runner.CLERK_STAFF_MODE_BEARER
    assert runner.resolve_staff_mode(runner.CLERK_STAFF_MODE_OPEN, workflow_proof=True) == runner.CLERK_STAFF_MODE_BEARER
    assert runner.resolve_staff_mode(runner.CLERK_STAFF_MODE_BEARER, workflow_proof=True) == runner.CLERK_STAFF_MODE_BEARER
    # A non-proof run keeps the requested mode untouched.
    assert runner.resolve_staff_mode(runner.CLERK_STAFF_MODE_PROTECTED, workflow_proof=False) == runner.CLERK_STAFF_MODE_PROTECTED
    assert runner.resolve_staff_mode(runner.CLERK_STAFF_MODE_OPEN, workflow_proof=False) == runner.CLERK_STAFF_MODE_OPEN


def test_set_env_value_updates_existing_and_adds_missing(tmp_path: Path) -> None:
    runner = _load_installer_runner()
    env = tmp_path / ".env"
    env.write_text("A=1\nCIVICCLERK_STAFF_AUTH_MODE=protected\nB=2\n", encoding="utf-8")

    runner.set_env_value(env, "CIVICCLERK_STAFF_AUTH_MODE", "bearer")  # update existing
    runner.set_env_value(env, "C", "3")  # add missing

    parsed = runner.parse_env_file(env)
    assert parsed["CIVICCLERK_STAFF_AUTH_MODE"] == "bearer"
    assert parsed["A"] == "1"  # untouched
    assert parsed["B"] == "2"  # untouched
    assert parsed["C"] == "3"  # added
    # No duplicate key left behind.
    mode_lines = [ln for ln in env.read_text(encoding="utf-8").splitlines() if ln.startswith("CIVICCLERK_STAFF_AUTH_MODE=")]
    assert mode_lines == ["CIVICCLERK_STAFF_AUTH_MODE=bearer"]


def test_write_clerk_env_upgrades_stale_protected_env_to_bearer(tmp_path: Path) -> None:
    """A CivicClerk .env from a prior run persists (teardown clears Docker state, not
    the host runtime dir). write_clerk_env must UPGRADE a stale protected .env to the
    requested bearer mode + token-role allowlist, not silently keep the old value —
    otherwise the bearer workflow proof keeps 401ing on a box that has run before."""
    runner = _load_installer_runner()
    env = tmp_path / ".env"
    # Stale file from a prior protected-mode run: bearer mode + token roles absent.
    env.write_text(
        "CIVICCLERK_POSTGRES_USER=civicclerk\nCIVICCLERK_STAFF_AUTH_MODE=protected\n",
        encoding="utf-8",
    )

    runner.write_clerk_env(env, staff_mode=runner.CLERK_STAFF_MODE_BEARER)

    parsed = runner.parse_env_file(env)
    assert parsed["CIVICCLERK_STAFF_AUTH_MODE"] == runner.CLERK_STAFF_MODE_BEARER
    # The proof bearer token must be in the role allowlist or /staff/session 401s.
    roles = json.loads(parsed["CIVICCLERK_STAFF_AUTH_TOKEN_ROLES"])
    assert runner.CLERK_WORKFLOW_PROOF_BEARER in roles
    assert roles[runner.CLERK_WORKFLOW_PROOF_BEARER] == ["clerk_admin", "meeting_editor"]
    # Pre-existing unrelated values preserved.
    assert parsed["CIVICCLERK_POSTGRES_USER"] == "civicclerk"


def test_write_clerk_env_fresh_bearer_writes_token_roles(tmp_path: Path) -> None:
    runner = _load_installer_runner()
    env = tmp_path / ".env"  # does not exist yet

    runner.write_clerk_env(env, staff_mode=runner.CLERK_STAFF_MODE_BEARER)

    parsed = runner.parse_env_file(env)
    assert parsed["CIVICCLERK_STAFF_AUTH_MODE"] == runner.CLERK_STAFF_MODE_BEARER
    roles = json.loads(parsed["CIVICCLERK_STAFF_AUTH_TOKEN_ROLES"])
    assert roles[runner.CLERK_WORKFLOW_PROOF_BEARER] == ["clerk_admin", "meeting_editor"]
