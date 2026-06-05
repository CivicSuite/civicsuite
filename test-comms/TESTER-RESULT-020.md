# Tester Result 020 - directive 019 re-gate on latest branch head

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `cac6d28 test(comms): add tester result 019`
**Date/time (UTC):** 2026-06-05T08:03:13Z

## Procedure

Pulled and hard-reset to `origin/stage-3a-baremetal-windows`, then read `test-comms/README.md` and newest directive `test-comms/TESTER-DIRECTIVE-019.md`.

Ran the required clean-stack teardown first:

```text
=== CivicSuite stack teardown ===
no civicsuite containers
no civicsuite volumes
no civicsuite networks
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Recorded the required live host facts without injecting or correcting them:

```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
```

Ran the regenerated customer artifact from the branch checkout:

```powershell
installer\dist\CivicSuite-city-core-windows-0.1.2.cmd
```

## Customer artifact wrapper result

The `.cmd` extracted to:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows
```

It launched the bare-metal bootstrap path under:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\
```

The `.cmd` exited nonzero and printed:

```text
CivicSuite Windows installer progress

Stage0 target check: passed
Stage1 WSL2/reboot resume: passed
Stage2 Docker/Ollama prerequisites: not_run
Stage3 CivicSuite install: not_run
Stage4 verification: not_run

Logs: C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap.log
Status: failed
What to do next: Fix the named Stage0/Stage1 prerequisite issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task.
CivicSuite installation did not pass.
Fix: read the readiness message above, resolve the listed item, and run this installer again.
Press any key to continue . . .
```

## Bootstrap result JSON

Bootstrap result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

Summary:

```json
{
  "status": "failed",
  "stage": "Stage0To4",
  "stage0_status": "passed",
  "stage1_status": "passed",
  "stage2_status": null,
  "stage3_status": null,
  "stage4_status": null,
  "completed_at": "2026-06-05T08:02:27.2417787Z",
  "duration_seconds": 657.891
}
```

Stage0 live facts from the JSON:

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

Stage0 hardware virtualization check passed with the current live facts:

```text
Hardware virtualization must be available for WSL2/Docker Desktop (firmware flag enabled, or a hypervisor already running).
```

The final structured bootstrap JSON was honestly rewritten after failure. Bootstrap log tail includes:

```text
2026-06-05T07:51:28.8201624Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T07:51:28.8359298Z [stage0] Requesting UAC elevation for CivicSuite bare-metal bootstrap
2026-06-05T07:51:29.0320466Z [result] Wrote structured result to C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
2026-06-05T07:51:29.3507485Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T07:51:31.0255352Z [stage0] Stage0 target inspection finished with status passed
2026-06-05T07:51:52.0179041Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-05T08:02:27.2360331Z [failure] Docker Desktop spike failed. Review C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\docker-desktop\docker-desktop-spike-result.json.
2026-06-05T08:02:27.2736875Z [result] Wrote structured result to C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

## Docker Desktop spike result

Docker spike result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-27537-4496\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\docker-desktop\docker-desktop-spike-result.json
```

Docker spike summary:

```json
{
  "phase": "docker_desktop_spike",
  "status": "failed",
  "docker_present": true,
  "installed": false,
  "wsl_integration": true,
  "engine_ready": false,
  "durations": {
    "wsl_integration_seconds": 0.074,
    "total_seconds": 634.174
  },
  "failure": {
    "message": "Docker engine was not ready within 600 seconds. Open Docker Desktop, confirm WSL2 integration is enabled, then rerun this spike. Logs: C:\\Users\\insty\\AppData\\Local\\Temp\\CivicSuite-27537-4496\\bundle\\CivicSuite-city-core-windows\\installer\\baremetal\\windows\\logs\\bootstrap\\docker-desktop\\docker-desktop-spike.log",
    "actionable_message": "Fix the named prerequisite phase, then rerun this idempotent spike. CivicSuite does not uninstall Docker Desktop, WSL, or Ollama on failure."
  }
}
```

The spike started Docker Desktop from:

```text
C:\Program Files\Docker\Docker\Docker Desktop.exe
```

Repeated engine polls failed with Docker Desktop Linux engine API 500 responses, for example:

```text
ERROR: request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.54/info, check if the server supports the requested API version
```

## Lifecycle and AI proof

No CivicSuite lifecycle result file was produced by this run. Only source lifecycle Python files existed in the extracted bundle; Stage3 never started because the Docker Desktop spike failed first.

The Stage4 records-letter gate was not reached.

```text
generation_source=null
generation_model=null
launcher_url_evidence=not_reached
```

## Gate verdict

Directive 019 customer-artifact re-gate: **failed before Stage3/Stage4**.

The customer artifact did extract and launch the bare-metal installer wrapper. Stage0 passed using live host facts where `virtualization_firmware_enabled=false` and `hypervisor_present=true`. Stage1 passed without requiring reboot. The terminal blocker is Stage2 prerequisite readiness: Docker Desktop was present and WSL integration was enabled, but the Linux engine never became ready within 600 seconds and repeatedly returned Docker API 500 errors.
