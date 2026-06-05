# Tester Result 018 - standing re-run after Stage0 hypervisor hardening
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `3dca9a8 fix(installer): accept running hypervisor in Stage0 virtualization gate; close deferred-hardening pass`
**Date/time (UTC):** 2026-06-05T06:07:17.8945145Z

## Procedure
Pulled and hard-reset to `origin/stage-3a-baremetal-windows`.

Ran the required clean-stack teardown first:
```text
=== CivicSuite stack teardown ===
removed containers: 10
removed volumes: 8
removed networks: 4
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Confirmed the host is Hyper-V present and used corrected host facts:
```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
corrected virtualization_firmware_enabled=true
```

Corrected host facts file used:
```json
{
  "os_caption": "Microsoft Windows 11 Pro",
  "os_version": "10.0.26200",
  "os_build": "26200",
  "edition": "Microsoft Windows 11 Pro",
  "edition_id": "Professional",
  "is_admin": true,
  "hypervisor_present": true,
  "virtualization_firmware_enabled": true,
  "internet_available": true,
  "total_memory_bytes": 17028345856,
  "total_physical_memory_kb": 16629244,
  "cpu_name": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
  "logical_processors": 12,
  "corrected_note": "HypervisorPresent True; corrected virtualization_firmware_enabled for installer false-negative; is_admin true for self-elevated child"
}
```

## Bootstrap result summary
The elevated run started and Stage0 passed, proving the branch's hypervisor gate accepted the corrected/running-hypervisor facts:
```text
2026-06-05T05:57:31.8135734Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T05:57:31.8349101Z [stage0] Loading injected host facts from C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json
2026-06-05T05:57:31.9747833Z [stage0] Stage0 target inspection finished with status passed
2026-06-05T05:58:00.6939826Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-05T05:58:20.8028546Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-05T05:58:20.9071646Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe
2026-06-05T05:58:20.9071646Z [stage2] Stage2 prerequisite orchestration finished
2026-06-05T06:02:37.9590157Z [stage3] Stage3 warm-first installer handoff status failed
```

`installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json` was not rewritten after the initial non-elevated launcher handoff; it still shows:
```json
{
  "status": "elevation_requested",
  "stage0_status": null,
  "stage1_status": null,
  "stage2_status": null,
  "stage3_status": null,
  "stage4_status": null,
  "generation_source": null,
  "generation_model": null,
  "completed_at": "2026-06-05T05:57:31.1481639Z"
}
```

## Lifecycle evidence
`installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json` was rewritten and shows the terminal installer lifecycle failure:
```json
{
  "lifecycle_status": "failed",
  "civicclerk_staff_mode": "protected",
  "finished_at": "2026-06-05T06:02:37.430651+00:00",
  "failing_step": "compose_build",
  "failing_module": "civiccode",
  "failing_returncode": 1,
  "failing_stderr": " Image civicsuite-stage3a-baremetal-code-api Building \nfailed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF\n\n"
}
```

There was no `starter_set_runtime_workflows` proof object in the lifecycle output for this run. The lifecycle top-level status is `failed`, and workflow checks did not run.

## Docker evidence
While polling after the Stage3 failure, Docker Desktop returned:
```text
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.54/containers/json, check if the server supports the requested API version
```

## Gate verdict
Full install: FAIL. Stage0/Stage1/Stage2 passed, but Stage3 failed during CivicCode image build with Docker RPC EOF, followed by Docker Desktop 500s.

Records letter gate: NOT REACHED. No `draft_response_letter` evidence was generated for this run, so no `generation_source`/`generation_model` proof is available.

Overall bootstrapper status: BLOCKED/FAIL for this run. The final structured bootstrap JSON remained stale at `elevation_requested`, while the current lifecycle JSON records the actual Stage3 installer failure.
