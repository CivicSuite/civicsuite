"""Behavioral checks for Stage0/Stage1 Windows bare-metal bootstrap."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BOOTSTRAP = ROOT / "installer" / "baremetal" / "windows" / "civicsuite-baremetal-bootstrap.ps1"


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
    raise AssertionError("PowerShell is required for Windows bootstrap tests")


def _write_facts(path: Path, **overrides: object) -> None:
    facts = {
        "os_caption": "Microsoft Windows 11 Pro",
        "os_version": "10.0.22631",
        "edition": "Windows 11 Pro",
        "is_admin": True,
        "virtualization_firmware_enabled": True,
        "internet_available": True,
        "total_memory_bytes": 32 * 1024 * 1024 * 1024,
    }
    facts.update(overrides)
    path.write_text(json.dumps(facts), encoding="utf-8")


def _run_bootstrap(
    tmp_path: Path,
    stage: str,
    facts_path: Path,
    extra_args: list[str] | None = None,
    plan_only: bool = True,
) -> tuple[subprocess.CompletedProcess[str], dict]:
    log_root = tmp_path / "logs"
    args = [
        _powershell(),
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(BOOTSTRAP),
        "-Stage",
        stage,
        "-LogRoot",
        str(log_root),
        "-HostFactsJson",
        str(facts_path),
        "-SkipElevation",
        "-ResumeCommand",
        "powershell.exe -File civicsuite-baremetal-bootstrap.ps1 -Stage Stage1",
    ]
    if plan_only:
        args.append("-PlanOnly")
    args.extend(extra_args or [])
    completed = subprocess.run(
        args,
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=60,
    )
    result_path = log_root / "civicsuite-baremetal-bootstrap-result.json"
    assert result_path.exists(), completed.stderr
    return completed, json.loads(result_path.read_text(encoding="utf-8"))


def test_stage0_passes_only_when_defined_stage3a_target_is_met(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    _write_facts(facts)

    completed, result = _run_bootstrap(tmp_path, "Stage0", facts)

    assert completed.returncode == 0, completed.stderr
    assert result["status"] == "passed"
    assert result["stage0"]["status"] == "passed"
    check_statuses = {check["id"]: check["status"] for check in result["stage0"]["checks"]}
    assert check_statuses == {
        "windows-version": "passed",
        "windows-edition": "passed",
        "local-admin": "passed",
        "hardware-virtualization": "passed",
        "internet": "passed",
    }


def test_stage0_fails_with_actionable_checks_for_unsupported_host(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    _write_facts(
        facts,
        os_caption="Microsoft Windows 11 Home",
        edition="Windows 11 Home",
        is_admin=False,
        virtualization_firmware_enabled=False,
        internet_available=False,
    )

    completed, result = _run_bootstrap(tmp_path, "Stage0", facts)

    assert completed.returncode == 1
    assert result["status"] == "failed"
    failed = {check["id"]: check for check in result["stage0"]["checks"] if check["status"] == "failed"}
    assert failed["windows-edition"]["action"].startswith("Use Windows 11 Pro or Enterprise")
    assert failed["local-admin"]["action"].startswith("Sign in as a local admin")
    assert failed["hardware-virtualization"]["action"].startswith("Enable virtualization")
    assert failed["internet"]["action"].startswith("Connect to the internet")


def test_stage1_plan_enables_wsl_features_and_registers_resume(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    _write_facts(facts)

    completed, result = _run_bootstrap(tmp_path, "Stage1", facts)

    assert completed.returncode == 0, completed.stderr
    assert result["status"] == "passed"
    assert result["stage1"]["restart_needed"] is True
    assert [feature["feature"] for feature in result["stage1"]["features"]] == [
        "Microsoft-Windows-Subsystem-Linux",
        "VirtualMachinePlatform",
    ]
    assert all(feature["status"] == "planned" for feature in result["stage1"]["features"])
    assert all(isinstance(feature["status"], str) for feature in result["stage1"]["features"])
    assert result["stage1"]["wsl_default_version"]["command"] == "wsl --set-default-version 2"
    assert result["stage1"]["resume"]["registered"] is True
    assert result["stage1"]["resume"]["mechanism"] == "scheduled_task"


def test_stage1_resume_run_self_unregisters_resume_task(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    task_registry = tmp_path / "resume-task.txt"
    task_registry.write_text("registered", encoding="utf-8")
    _write_facts(facts)

    completed, result = _run_bootstrap(
        tmp_path,
        "Stage1",
        facts,
        [
            "-ResumeRun",
            "-MockWindowsFeatures",
            "-TaskRegistryPath",
            str(task_registry),
        ],
        plan_only=False,
    )

    assert completed.returncode == 0, completed.stderr
    assert result["stage1"]["resume_cleanup"]["unregistered"] is True
    assert result["stage1"]["resume_cleanup"]["mechanism"] == "simulated_registry"
    assert all(feature["status"] == "passed" for feature in result["stage1"]["features"])
    assert not task_registry.exists()


def test_stage2_plan_orchestrates_docker_spike_and_ollama_without_host_mutation(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    _write_facts(facts)

    completed, result = _run_bootstrap(tmp_path, "Stage2", facts)

    assert completed.returncode == 0, completed.stderr
    assert result["status"] == "passed"
    assert result["stage2"]["docker_desktop"]["status"] == "planned"
    assert result["stage2"]["docker_desktop"]["expected_result"].startswith("docker_present")
    assert "docker-desktop-spike.ps1" in result["stage2"]["docker_desktop"]["script"]
    assert result["stage2"]["ollama"]["present"] in {True, False}
    if not result["stage2"]["ollama"]["present"]:
        assert result["stage2"]["ollama"]["install"]["status"] == "planned"


def test_stage3_and_stage4_plan_chain_to_existing_warm_first_installer(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    _write_facts(facts)

    stage3_completed, stage3_result = _run_bootstrap(tmp_path, "Stage3", facts)
    stage4_completed, stage4_result = _run_bootstrap(tmp_path, "Stage4", facts)

    assert stage3_completed.returncode == 0, stage3_completed.stderr
    assert stage4_completed.returncode == 0, stage4_completed.stderr
    assert stage3_result["stage3"]["status"] == "planned"
    assert "run-clerk-core-installer.py install" in stage3_result["stage3"]["command"]
    assert "--workflow-proof" in stage3_result["stage3"]["command"]
    assert stage4_result["stage4"]["status"] == "planned"
    assert "run-clerk-core-installer.py verify" in stage4_result["stage4"]["verify"]["command"]
    assert stage4_result["stage4"]["required_generation_source"] == "ollama"
    assert stage4_result["stage4"]["required_model"] == "gemma4:e4b"


def _write_lifecycle_evidence(path: Path, source: str, model: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "status": "passed",
        "checks": [
            {
                "name": "starter_set_runtime_workflows",
                "status": "passed",
                "checks": [
                    {
                        "name": "civicrecords_workflow",
                        "status": "passed",
                        "checks": [
                            {
                                "name": "draft_response_letter",
                                "status_code": 201,
                                "letter_id_present": True,
                                "status": "draft",
                                "generation_source": source,
                                "generation_model": model,
                            }
                        ],
                    }
                ],
            }
        ],
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


def test_stage4_fails_template_fallback_lifecycle_evidence(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    evidence = tmp_path / "clerk-core-installer-lifecycle.json"
    _write_facts(facts)
    _write_lifecycle_evidence(evidence, source="template", model="")

    completed, result = _run_bootstrap(
        tmp_path,
        "Stage4",
        facts,
        ["-LifecycleEvidencePath", str(evidence)],
    )

    assert completed.returncode == 1
    assert result["status"] == "failed"
    assert result["stage4"]["status"] == "failed"
    assert result["stage4"]["evidence_assertion"]["status"] == "failed"
    assert result["stage4"]["evidence_assertion"]["generation_source"] == "template"


def test_stage4_passes_only_ollama_gemma4_lifecycle_evidence(tmp_path: Path) -> None:
    facts = tmp_path / "facts.json"
    evidence = tmp_path / "clerk-core-installer-lifecycle.json"
    _write_facts(facts)
    _write_lifecycle_evidence(evidence, source="ollama", model="gemma4:e4b")

    completed, result = _run_bootstrap(
        tmp_path,
        "Stage4",
        facts,
        ["-LifecycleEvidencePath", str(evidence)],
    )

    assert completed.returncode == 0, completed.stderr
    assert result["stage4"]["status"] == "planned"
    assert result["stage4"]["evidence_assertion"]["status"] == "passed"
    assert result["stage4"]["evidence_assertion"]["generation_model"] == "gemma4:e4b"
