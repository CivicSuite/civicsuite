# Tester Result 039 - isolated host Ollama port startup timeout

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `0a92cdeb23596212d4561cfc5674253c95d7b29f test(comms): rerun on isolated host ollama port`
**Required minimum head satisfied:** `d5ca7081dba1c87aac67c97cca58030fd7c847bf`
**Date/time (UTC):** 2026-06-06T09:05:00Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `d5ca7081dba1c87aac67c97cca58030fd7c847bf`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-039.md`, and `test-comms/TESTER-RESULT-038.md`. `TESTER-RESULT-038.md` was confirmed as read before this rerun.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited.

## Host Facts

```json
{
  "windows_edition": "Microsoft Windows 11 Pro",
  "windows_version": "10.0.26200",
  "windows_build": "26200",
  "cpu": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
  "hypervisor_present": true,
  "virtualization_firmware_enabled": false,
  "total_physical_memory_bytes": 17028345856,
  "free_physical_memory_kb_before_readiness": 8204396,
  "docker_present": true,
  "ollama_present": true,
  "docker_mem_total_bytes": 8249237504,
  "gpus": [
    { "name": "Intel(R) UHD Graphics 630", "adapter_ram_bytes": 1073741824 },
    { "name": "NVIDIA GeForce GTX 1660 Ti", "adapter_ram_bytes": 4293918720 }
  ]
}
```

Docker Desktop reported `8249237504` bytes total memory, approximately `7.683GiB`.

Workspace path checked:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite
```

The workspace path is not under OneDrive.

## Default-Port Stale Process State Before Readiness

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8174952
}
```

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list` entry for `gemma4:e4b`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    6 hours ago
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325640192, "CPU": 650.84375 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107053056, "CPU": 483.046875 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37675008, "CPU": 1.0625 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 15159296, "CPU": 33.859375 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4775936, "CPU": 136.21875 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4161536, "CPU": 590.875 }
]
```

`llama-server` existed before readiness: `true`.

`ollama_llama_server` existed before readiness: `false`.

Per directive 039, default-port stale workers on `11434` were recorded but were not treated as a prerequisite failure.

## Clean Stack Teardown

Command:

```powershell
powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1
```

Exit code: `0`

Tail output:

```text
=== CivicSuite stack teardown ===
no civicsuite containers
no civicsuite volumes
no civicsuite networks
=== teardown complete - stack state cleared; prerequisites preserved ===
```

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Exit code: `0`

Selected modules:

```json
[
  "civiccore",
  "civicrecords-ai",
  "civicclerk",
  "civiccode",
  "civiczone",
  "civicplan",
  "civicpermit",
  "civicaccess",
  "civicinspect",
  "civicgrants",
  "civicprocure"
]
```

The plan was non-mutating: `"mutates_host": false`.

## Readiness

Command:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r15 --install-root installer\runtime\proven-suite-clean-machine-r15 --compose-project-suffix stage3a-proven-suite-clean-machine-r15 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r15\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T09:02:39.848584+00:00`

Finished at: `2026-06-06T09:02:45.855590+00:00`

The lifecycle JSON was written, but it contains no `checks` array because the script raised a Python `TimeoutError` while probing isolated port `11435` before it could append `ollama_model_resources` or `host_ollama_model_load` check records.

Lifecycle summary:

```json
{
  "mode": "readiness",
  "mutates_host": false,
  "run_id": "stage3a-proven-suite-clean-machine-r15",
  "install_root": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r15",
  "isolation_id": "stage3a-proven-suite-clean-machine-r15",
  "status": "failed",
  "port_offset": 5000,
  "selected_modules": [
    "civicrecords-ai",
    "civicclerk",
    "civiccode",
    "civiczone",
    "civicplan",
    "civicpermit",
    "civicaccess",
    "civicinspect",
    "civicgrants",
    "civicprocure"
  ]
}
```

## Readiness Failure

Failure phase: isolated host-Ollama server startup / `/api/tags` probe on port `11435`.

Traceback excerpt:

```text
File "scripts\run-clerk-core-installer.py", line 4067, in main
  checks.append(host_ollama_model_load_readiness_check())
File "scripts\run-clerk-core-installer.py", line 578, in host_ollama_model_load_readiness_check
  result = host_ollama_generate_with_fallback("Respond with OK.")
File "scripts\run-clerk-core-installer.py", line 747, in host_ollama_generate_with_fallback
  server = ensure_host_ollama_server()
File "scripts\run-clerk-core-installer.py", line 549, in ensure_host_ollama_server
  check = host_ollama_tags_check()
File "scripts\run-clerk-core-installer.py", line 518, in host_ollama_tags_check
  with urllib.request.urlopen(request, timeout=3) as response:
TimeoutError: timed out
```

Required `host_ollama_model_load` evidence:

```text
base_url=http://127.0.0.1:11435
container_base_url=http://host.docker.internal:11435
server=started but initial /api/tags probe timed out before lifecycle check record was appended
stdout=not_recorded_due_to_uncaught_timeout_before_check_record
stderr=Python TimeoutError during urllib.request.urlopen(..., timeout=3)
returncode=1
attempts=not_recorded_due_to_uncaught_timeout_before_attempt_record
selected_profile=not_recorded_due_to_uncaught_timeout_before_profile_attempt
```

`ollama_model_resources` evidence:

```text
not_recorded_due_to_uncaught_timeout_before_check_record
```

Fix step indicated by the observed failure:

```text
The isolated host-Ollama server on 11435 needs a bounded startup wait/retry for /api/tags, and the timeout path should be captured as a failed lifecycle check rather than escaping as an uncaught Python TimeoutError.
```

## Isolated Port 11435 Probe After Readiness Failure

Manual probe immediately after the failed readiness run:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:11435/api/tags -TimeoutSec 10
```

Result: HTTP `200`.

Content excerpt:

```json
{
  "models": [
    {
      "name": "gemma4:e4b",
      "model": "gemma4:e4b",
      "size": 9608350718,
      "digest": "c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb"
    },
    {
      "name": "nomic-embed-text:latest",
      "model": "nomic-embed-text:latest",
      "size": 274302450
    }
  ]
}
```

This suggests the isolated server came up, but not quickly enough for the installer readiness probe's 3-second timeout.

`netstat` after failure and before cleanup:

```text
TCP    127.0.0.1:11435        0.0.0.0:0              LISTENING       24272
TCP    127.0.0.1:11435        127.0.0.1:51786        ESTABLISHED     24272
TCP    127.0.0.1:51786        127.0.0.1:11435        ESTABLISHED     21384
```

The helper `ollama` process listening on `11435` was then stopped with `Stop-Process -Id 24272 -Force`. After cleanup, `netstat -ano | Select-String ':11435'` returned no rows.

## After-Failure Diagnostics

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8297208
}
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

`ollama_llama_server` / `llama-server` process check after failure:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325746688, "CPU": 650.9375 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107311104, "CPU": 483.171875 },
  { "ProcessName": "ollama", "Id": 24272, "WorkingSet64": 53207040, "CPU": 0.375 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37126144, "CPU": 1.0625 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14458880, "CPU": 33.859375 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4820992, "CPU": 136.296875 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4272128, "CPU": 591.0625 }
]
```

`ollama_llama_server` or `llama-server` process remains after failure: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 1090351104 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 438616064 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 388091904 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325746688 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 300007424 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 232464384 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 227860480 },
  { "ProcessName": "PhoneExperienceHost", "Id": 12612, "WorkingSet64": 157515776 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 142909440 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 131817472 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 123056128 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 120033280 }
]
```

## Install / Verify / Route Evidence

Directive 039 says to run install only if readiness passes. Because readiness failed, the following were not run:

```text
runtime docker-compose.host-ollama.yml evidence=not_reached_due_to_readiness_failure
source-cache evidence=not_reached_due_to_readiness_failure
install_lifecycle_path=not_reached_due_to_readiness_failure
install_status=not_reached_due_to_readiness_failure
install_prewarm_evidence=not_reached_due_to_readiness_failure
verify_lifecycle_path=not_reached_due_to_readiness_failure
verify_status=not_reached_due_to_readiness_failure
install_provenance=not_reached_due_to_readiness_failure
installer/modules.json hash=not_reached_due_to_readiness_failure
source commits=not_reached_due_to_readiness_failure
launcher config module URLs=not_reached_due_to_readiness_failure
live launcher URL evidence=not_reached_due_to_readiness_failure
ten live route checks=not_reached_due_to_readiness_failure
```

## Final Verdict

Directive 039 result: **FAILED - isolated host-Ollama readiness timed out during startup probe**.

The Stage 3A proven-suite clean-machine gate is not passed. The default poisoned port `11434` was not treated as a prerequisite failure, as requested. The isolated server path on `11435` did start, but readiness failed with an uncaught Python `TimeoutError` during the initial `/api/tags` probe before model-load attempts or selected-profile evidence were recorded. A manual `/api/tags` probe immediately after failure returned HTTP `200` and listed `gemma4:e4b`, so the likely product gap is startup wait/retry and lifecycle error capture for the isolated host-Ollama endpoint. Install, verify, launcher, and live-route checks were correctly not run.
