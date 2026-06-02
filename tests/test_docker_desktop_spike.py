"""Behavioral checks for the Stage 3A Docker Desktop spike."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPIKE = ROOT / "installer" / "baremetal" / "windows" / "docker-desktop-spike.ps1"


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
    raise AssertionError("PowerShell is required for Docker Desktop spike tests")


def _run_spike(tmp_path: Path, docker_cli: Path, extra_env: dict[str, str] | None = None) -> tuple[subprocess.CompletedProcess[str], dict]:
    log_root = tmp_path / "logs"
    env = os.environ.copy()
    env.update(extra_env or {})
    completed = subprocess.run(
        [
            _powershell(),
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(SPIKE),
            "-LogRoot",
            str(log_root),
            "-DockerCliPath",
            str(docker_cli),
            "-DockerDesktopPath",
            str(tmp_path / "Docker Desktop.exe"),
            "-DockerSettingsPath",
            str(tmp_path / "settings-store.json"),
            "-EngineTimeoutSeconds",
            "20",
            "-PollIntervalSeconds",
            "1",
            "-NoDownload",
            "-SkipDesktopStart",
            "-UseOnlyExplicitPaths",
        ],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=60,
    )
    result_path = log_root / "docker-desktop-spike-result.json"
    assert result_path.exists(), completed.stderr
    return completed, json.loads(result_path.read_text(encoding="utf-8"))


def _write_mock_docker(path: Path, fail_count: int) -> None:
    state_path = path.with_suffix(".state")
    path.write_text(
        "\n".join(
            [
                "param([string]$Command)",
                f"$StatePath = '{state_path.as_posix()}'",
                "if (-not (Test-Path -LiteralPath $StatePath)) { Set-Content -LiteralPath $StatePath -Value '0' }",
                "$Count = [int](Get-Content -LiteralPath $StatePath -Raw)",
                "$Count += 1",
                "Set-Content -LiteralPath $StatePath -Value ([string]$Count)",
                "if ($Command -ne 'info') { Write-Error 'unexpected docker command'; exit 64 }",
                f"if ($Count -le {fail_count}) {{ [Console]::Error.WriteLine('engine not ready yet'); exit 1 }}",
                "Write-Output 'Server: Docker Desktop'",
                "exit 0",
            ]
        ),
        encoding="utf-8",
    )


def test_spike_polls_until_docker_engine_ready_and_writes_phase_result(tmp_path: Path) -> None:
    docker_cli = tmp_path / "docker.ps1"
    desktop = tmp_path / "Docker Desktop.exe"
    desktop.write_text("", encoding="utf-8")
    _write_mock_docker(docker_cli, fail_count=2)

    completed, result = _run_spike(tmp_path, docker_cli)

    assert completed.returncode == 0, completed.stderr
    assert result["status"] == "passed"
    assert result["docker_present"] is True
    assert result["installed"] is False
    assert result["wsl_integration"] is True
    assert result["engine_ready"] is True
    assert result["durations"]["engine_ready_seconds"] >= 2
    log_text = (tmp_path / "logs" / "docker-desktop-spike.log").read_text(encoding="utf-8")
    assert "Poll 1" in log_text
    assert "Poll 2" in log_text
    assert "Docker engine ready" in log_text


def test_spike_fails_with_actionable_result_when_engine_never_reports_ready(tmp_path: Path) -> None:
    docker_cli = tmp_path / "docker.ps1"
    desktop = tmp_path / "Docker Desktop.exe"
    desktop.write_text("", encoding="utf-8")
    _write_mock_docker(docker_cli, fail_count=999)

    completed, result = _run_spike(tmp_path, docker_cli)

    assert completed.returncode == 1
    assert result["status"] == "failed"
    assert result["docker_present"] is True
    assert result["wsl_integration"] is True
    assert result["engine_ready"] is False
    assert "not ready within 20 seconds" in result["failure"]["message"]
    assert "does not uninstall Docker Desktop, WSL, or Ollama" in result["failure"]["actionable_message"]


def test_spike_rejects_zero_exit_docker_info_without_server_section(tmp_path: Path) -> None:
    docker_cli = tmp_path / "docker.ps1"
    desktop = tmp_path / "Docker Desktop.exe"
    desktop.write_text("", encoding="utf-8")
    docker_cli.write_text(
        "\n".join(
            [
                "param([string]$Command)",
                "if ($Command -ne 'info') { exit 64 }",
                "Write-Output 'Client: Docker Desktop'",
                "exit 0",
            ]
        ),
        encoding="utf-8",
    )

    completed, result = _run_spike(tmp_path, docker_cli)

    assert completed.returncode == 1
    assert result["status"] == "failed"
    assert result["engine_ready"] is False
    log_text = (tmp_path / "logs" / "docker-desktop-spike.log").read_text(encoding="utf-8")
    assert "no Docker server section" in log_text


def test_spike_uses_installer_when_docker_is_absent_without_grep_only_assertions(tmp_path: Path) -> None:
    installer = tmp_path / "installer.ps1"
    docker_cli = tmp_path / "docker.ps1"
    desktop = tmp_path / "Docker Desktop.exe"
    installer.write_text(
        "\n".join(
            [
                "param([string]$Verb, [string]$Quiet, [string]$License)",
                f"Set-Content -LiteralPath '{desktop.as_posix()}' -Value ''",
                f"Set-Content -LiteralPath '{docker_cli.as_posix()}' -Value \"param([string]`$Command)`nWrite-Output 'Server: Docker Desktop'`nexit 0\"",
                "exit 0",
            ]
        ),
        encoding="utf-8",
    )

    log_root = tmp_path / "logs"
    completed = subprocess.run(
        [
            _powershell(),
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(SPIKE),
            "-LogRoot",
            str(log_root),
            "-DockerCliPath",
            str(docker_cli),
            "-DockerDesktopPath",
            str(desktop),
            "-DockerSettingsPath",
            str(tmp_path / "settings-store.json"),
            "-DockerInstallerPath",
            str(installer),
            "-EngineTimeoutSeconds",
            "20",
            "-PollIntervalSeconds",
            "1",
            "-NoDownload",
            "-SkipDesktopStart",
            "-UseOnlyExplicitPaths",
        ],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=60,
    )

    result = json.loads((log_root / "docker-desktop-spike-result.json").read_text(encoding="utf-8"))
    assert completed.returncode == 0, completed.stderr
    assert result["installed"] is True
    assert result["engine_ready"] is True
    assert docker_cli.exists()
    settings = json.loads((tmp_path / "settings-store.json").read_text(encoding="utf-8-sig"))
    assert settings["wslEngineEnabled"] is True
