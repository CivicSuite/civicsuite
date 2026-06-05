# Tester Result 021 - directive 019 standing re-run success

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `bb10be178b72b646f93b3273d2ed9ce84d106b3d test(comms): add tester result 020`
**Latest non-result head in tested branch history:** `8980aae4fce6515fa64836aee739f1bea4a0432c docs(installer): refresh Stage 3A artifact gate truth`
**Date/time (UTC):** 2026-06-05T18:09:44Z

## Procedure

Pulled and hard-reset to `origin/stage-3a-baremetal-windows`, read `test-comms/README.md`, and treated the still-active standing procedure plus `TESTER-DIRECTIVE-019.md` as unsatisfied because the latest result had failed before Stage3/Stage4.

Ran the required clean-stack teardown first.

Recorded live host facts from the completed bootstrap JSON:

```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
```

Ran the regenerated customer artifact from the branch checkout:

```powershell
installer\dist\CivicSuite-city-core-windows-0.1.2.cmd
```

The `.cmd` extracted to:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows
```

It launched the bare-metal bootstrap path under:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\
```

## Bootstrap result JSON

Bootstrap result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

Summary:

```json
{
  "status": "passed",
  "stage0_status": "passed",
  "stage1_status": "passed",
  "stage2_status": "passed",
  "stage3_status": "passed",
  "stage4_status": "passed",
  "completed_at": "2026-06-05T18:09:44.8363719Z",
  "duration_seconds": 434.669
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

Bootstrap log tail:

```text
2026-06-05T18:02:30.1867753Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T18:02:32.2211633Z [stage0] Stage0 target inspection finished with status passed
2026-06-05T18:02:58.3117679Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-05T18:03:20.6257463Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-05T18:03:20.9032878Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe
2026-06-05T18:03:20.9106461Z [stage2] Stage2 prerequisite orchestration finished
2026-06-05T18:08:50.0490892Z [stage3] Stage3 warm-first installer handoff status passed
2026-06-05T18:09:44.8226044Z [stage4] Stage4 verification shell status passed
2026-06-05T18:09:44.8685537Z [result] Wrote structured result to C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

## Docker/Ollama prerequisite evidence

Docker spike result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\docker-desktop\docker-desktop-spike-result.json
```

Docker spike summary:

```json
{
  "status": "passed",
  "docker_present": true,
  "installed": false,
  "wsl_integration": true,
  "engine_ready": true,
  "engine_ready_seconds": 0.422,
  "total_seconds": 0.642
}
```

Ollama bind evidence from Stage2:

```json
{
  "present": true,
  "path": "C:\\Users\\insty\\AppData\\Local\\Programs\\Ollama\\ollama.exe",
  "ollama_host": "0.0.0.0",
  "firewall": true,
  "restarted": true,
  "ready": true
}
```

## Lifecycle and AI proof

Lifecycle evidence path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-16161-6920\bundle\CivicSuite-city-core-windows\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json
```

Stage4 evidence assertion:

```json
{
  "status": "passed",
  "evidence_path": "C:\\Users\\insty\\AppData\\Local\\Temp\\CivicSuite-16161-6920\\bundle\\CivicSuite-city-core-windows\\installer\\reports\\stage3a-baremetal\\clerk-core-installer-lifecycle.json",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b",
  "expected_generation_source": "ollama",
  "expected_generation_model": "gemma4:e4b"
}
```

Launcher URL evidence:

```text
http://127.0.0.1:18082/
```

Critical values:

```text
generation_source=ollama
generation_model=gemma4:e4b
```

## Gate verdict

Directive 019 customer-artifact Stage 3A re-gate: **passed**.

The customer artifact extracted and launched the bare-metal installer wrapper. Stage0, Stage1, Stage2, Stage3, and Stage4 all passed. The Stage4 records-letter evidence assertion passed with the required local Ollama values: `generation_source=ollama` and `generation_model=gemma4:e4b`.
