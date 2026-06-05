# Tester Result 019 - customer artifact run after failed-result hardening
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `a47599b fix(installer): write failed result on Stage3 handoff failure`
**Date/time (UTC):** 2026-06-05T07:45:16.0116901Z

## Procedure
Pulled and hard-reset to `origin/stage-3a-baremetal-windows`.

Ran the required clean-stack teardown first:
```text
=== CivicSuite stack teardown ===
no civicsuite containers
no civicsuite volumes
no civicsuite networks
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Recorded live host virtualization values, per the updated README:
```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
```

Ran the regenerated customer artifact from the branch checkout:
```powershell
installer\dist\CivicSuite-city-core-windows-0.1.2.cmd
```

## Installer progress output
The `.cmd` exited nonzero and printed:
```text
CivicSuite Windows installer progress

Stage0 target check: passed
Stage1 WSL2/reboot resume: passed
Stage2 Docker/Ollama prerequisites: not_run
Stage3 CivicSuite install: not_run
Stage4 verification: not_run

Logs: C:\Users\insty\AppData\Local\Temp\CivicSuite-23879-24905\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap.log
Status: failed
What to do next: Fix the named Stage0/Stage1 prerequisite issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task.
CivicSuite installation did not pass.
```

## Bootstrap result
From the extracted customer bundle result JSON:
`C:\Users\insty\AppData\Local\Temp\CivicSuite-23879-24905\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json`

Summary:
```json
{
  "status": "failed",
  "stage0_status": "passed",
  "stage1_status": "passed",
  "stage2_status": null,
  "stage3_status": null,
  "stage4_status": null,
  "generation_source": null,
  "generation_model": null,
  "completed_at": "2026-06-05T07:43:58.8792257Z"
}
```

Stage0 live facts from the same JSON:
```json
{
  "os_caption": "Microsoft Windows 11 Pro",
  "os_version": "10.0.26200",
  "edition": "Microsoft Windows 11 Pro",
  "is_admin": true,
  "virtualization_firmware_enabled": false,
  "hypervisor_present": true,
  "internet_available": true,
  "total_memory_bytes": 17028345856
}
```

Stage0 hardware virtualization check passed with message:
```text
Hardware virtualization must be available for WSL2/Docker Desktop (firmware flag enabled, or a hypervisor already running).
```

## Docker Desktop spike
From:
`C:\Users\insty\AppData\Local\Temp\CivicSuite-23879-24905\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\docker-desktop\docker-desktop-spike-result.json`

```json
{
  "phase": "docker_desktop_spike",
  "status": "failed",
  "docker_present": true,
  "installed": false,
  "wsl_integration": true,
  "engine_ready": false,
  "durations": {
    "wsl_integration_seconds": 0.108,
    "total_seconds": 634.324
  },
  "failure": {
    "message": "Docker engine was not ready within 600 seconds. Open Docker Desktop, confirm WSL2 integration is enabled, then rerun this spike. Logs: C:\\Users\\insty\\AppData\\Local\\Temp\\CivicSuite-23879-24905\\bundle\\CivicSuite-city-core-windows\\installer\\baremetal\\windows\\logs\\bootstrap\\docker-desktop\\docker-desktop-spike.log",
    "actionable_message": "Fix the named prerequisite phase, then rerun this idempotent spike. CivicSuite does not uninstall Docker Desktop, WSL, or Ollama on failure."
  }
}
```

## Gate verdict
Stage0 hypervisor hardening: PASS. The customer artifact used live facts, saw `virtualization_firmware_enabled=false` and `hypervisor_present=true`, and passed the hardware virtualization check.

Full install: FAIL/BLOCKED. Stage2 did not complete because Docker Desktop's engine was not ready within 600 seconds.

Records letter gate: NOT REACHED. No `draft_response_letter` evidence was generated, so no `generation_source`/`generation_model` proof is available.
