# Tester Result 038 - host Ollama rerun prerequisite blocked

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `b887108805d79e2bbbe8913c5db1695bb1e19421 test(comms): rerun host ollama after cleanup denial`
**Required minimum head satisfied:** `a7a06c82b2f1ce02bce0c925820477f3265a5484`
**Date/time (UTC):** 2026-06-06T08:44:00Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to the fetched branch head, and confirmed the checked-out commit is at or after `a7a06c82b2f1ce02bce0c925820477f3265a5484`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-038.md`, and `test-comms/TESTER-RESULT-037.md`. `TESTER-RESULT-037.md` was confirmed as read before this rerun decision.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited.

Directive 038 requires one of these valid host states before readiness:

```text
elevated Windows context that can terminate stale llama-server.exe workers
or
freshly rebooted host with no stale llama-server.exe workers before readiness
```

This session was not elevated and the host was not reboot-clean. Stale `llama-server.exe` workers were present and could not be terminated due to access denied. Per directive 038, I did not rerun the expensive model ladder while stale inaccessible workers remained.

## Elevation / Reboot-Clean State

Current Codex worker context:

```json
{
  "user": "DESKTOP-LOOTB7M\\insty",
  "is_admin": false
}
```

Run used elevated context: `false`.

Run used reboot-clean host state: `false`.

Stale inaccessible workers remained before readiness: `true`.

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
  "free_physical_memory_kb_before_readiness": 8338756,
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

## Before-State Diagnostics

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8327084
}
```

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list` entry for `gemma4:e4b`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    5 hours ago
```

Stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325640192, "CPU": 648.890625 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107053056, "CPU": 481.0 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29822976, "CPU": 0.984375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14970880, "CPU": 33.796875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4775936, "CPU": 134.0 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4161536, "CPU": 588.953125 }
]
```

`llama-server` existed before readiness: `true`.

`ollama_llama_server` existed before readiness: `false`.

## Cleanup Attempt Before Readiness

Command:

```powershell
taskkill /F /IM llama-server.exe
taskkill /F /IM ollama_llama_server.exe
```

Result:

```text
ERROR: The process "llama-server.exe" with PID 9592 could not be terminated.
Reason: Access is denied.

ERROR: The process "llama-server.exe" with PID 13896 could not be terminated.
Reason: Access is denied.

ERROR: The process "llama-server.exe" with PID 24320 could not be terminated.
Reason: Access is denied.

ERROR: The process "llama-server.exe" with PID 7304 could not be terminated.
Reason: Access is denied.

ERROR: The process "ollama_llama_server.exe" not found.
```

Processes after cleanup attempt:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325640192, "CPU": 648.9375 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107053056, "CPU": 481.0 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29822976, "CPU": 0.984375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14970880, "CPU": 33.796875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4775936, "CPU": 134.0625 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4161536, "CPU": 588.984375 }
]
```

Explicit initial-cleanup verdict:

```text
initial_cleanup_blocked_by_access_denied=true
stale_llama_server_existed_before_readiness=true
stale_llama_server_remained_after_cleanup_attempt=true
valid_host_state_for_directive_038=false
```

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

Readiness was not run.

Reason:

```text
Directive 038 says not to rerun the expensive model ladder while stale inaccessible workers remain.
The host was neither elevated nor reboot-clean.
The stale llama-server.exe workers remained after an explicit cleanup attempt, and taskkill returned access denied.
```

Readiness lifecycle path: `not_created_due_to_elevation_or_reboot_clean_prerequisite_failure`

Readiness status: `not_run_due_to_elevation_or_reboot_clean_prerequisite_failure`

## Readiness Checks

Because readiness was not run, the lifecycle checks below were not generated for this directive:

```text
ollama_model_resources=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load.initial_cleanup=blocked_before_readiness_by_access_denied
host_ollama_model_load.attempts=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load.selected_profile=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load.stdout=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load.stderr=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
host_ollama_model_load.returncode=not_run_due_to_elevation_or_reboot_clean_prerequisite_failure
```

## After-Failure Diagnostics

Available physical memory after the prerequisite failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8301416
}
```

Docker Desktop reported memory after the prerequisite failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama ps` after the prerequisite failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

`ollama_llama_server` / `llama-server` process check after the prerequisite failure:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325640192, "CPU": 649.0 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107053056, "CPU": 481.046875 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29822976, "CPU": 0.984375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 15020032, "CPU": 33.796875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4775936, "CPU": 134.125 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4161536, "CPU": 589.015625 }
]
```

`ollama_llama_server` or `llama-server` process remains after prerequisite failure: `true`.

Top memory-consuming processes after prerequisite failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 1089179648 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 438784000 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 387170304 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325640192 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 305741824 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 233066496 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 217366528 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 162402304 },
  { "ProcessName": "PhoneExperienceHost", "Id": 12612, "WorkingSet64": 158556160 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 142618624 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 133472256 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 118161408 }
]
```

## Install / Verify / Route Evidence

Directive 038 says to run install only if readiness passes. Because readiness was blocked by the required elevation/reboot-clean prerequisite, the following were not run:

```text
source-cache evidence=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
install_lifecycle_path=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
install_status=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
install_prewarm_evidence=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
verify_lifecycle_path=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
verify_status=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
install_provenance=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
installer/modules.json hash=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
source commits=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
launcher config module URLs=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
live launcher URL evidence=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
ten live route checks=not_reached_due_to_elevation_or_reboot_clean_prerequisite_failure
```

## Final Verdict

Directive 038 result: **BLOCKED - elevation/reboot-clean prerequisite not met**.

The Stage 3A proven-suite clean-machine gate is not passed. This worker is not elevated, the machine is not reboot-clean, stale `llama-server.exe` workers from the prior failure remain, and an explicit cleanup attempt failed with `Access is denied` for PIDs `9592`, `13896`, `24320`, and `7304`. `ollama_llama_server.exe` was not found. Per directive 038, readiness, install, verify, launcher, and live-route checks were correctly not run.
