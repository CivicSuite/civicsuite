# Tester Result 037 - host Ollama orphan cleanup blocked by access denied

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `52f56c50fd1d20c092e3c950887bf9000e551ec2 test(comms): rerun after host ollama orphan cleanup`
**Required minimum head satisfied:** `99a020ff08e185a8c4b6371fd86e6de7eaa30421`
**Date/time (UTC):** 2026-06-06T08:25:07.7077313Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `99a020ff08e185a8c4b6371fd86e6de7eaa30421`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-037.md`, and `test-comms/TESTER-RESULT-036.md`. `TESTER-RESULT-036.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 8164240,
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
  "FreePhysicalMemory": 8146796
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 326782976 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 108572672 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 33005568 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 15147008 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4775936 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3977216 }
]
```

`llama-server` existed before readiness: `true`.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r13 --install-root installer\runtime\proven-suite-clean-machine-r13 --compose-project-suffix stage3a-proven-suite-clean-machine-r13 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r13\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T08:23:08.851154+00:00`

Finished at: `2026-06-06T08:24:47.532206+00:00`

## Readiness Checks

### ollama_model_resources

Status: `passed`

```json
{
  "advisory_docker_memory_bytes": 8000000000,
  "advisory_docker_memory_gb": 8,
  "advisory_host_memory_bytes": 16000000000,
  "advisory_host_memory_gb": 16,
  "detected_docker_memory_bytes": 8249558433,
  "detected_host_memory_bytes": 17028345856,
  "host_ollama": true,
  "model": "gemma4:e4b",
  "name": "ollama_model_resources",
  "notes": [],
  "status": "passed"
}
```

### host_ollama_model_load

Status: `failed`

Return code: `1`

Selected profile: `null`

Stdout: empty.

Final stderr:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application.: GGML_ASSERT(n_tokens_all \u003c= cparams.n_batch) failed"}
```

Initial cleanup:

```json
{
  "unload": {
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T08:23:09.4108395Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  },
  "stop_orphan_servers": {
    "returncode": 1,
    "results": [
      {
        "command": ["taskkill", "/F", "/IM", "llama-server.exe"],
        "returncode": 1,
        "stderr": "ERROR: The process \"llama-server.exe\" with PID 9592 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 13896 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 24320 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 7304 could not be terminated.\nReason: Access is denied.\n\n"
      },
      {
        "command": ["taskkill", "/F", "/IM", "ollama_llama_server.exe"],
        "returncode": 128,
        "stderr": "ERROR: The process \"ollama_llama_server.exe\" not found.\n"
      }
    ]
  }
}
```

Initial cleanup verdict:

```text
stale_llama_server_existed_before_readiness=true
initial_unload_returncode=0
initial_taskkill_llama_server_returncode=1
initial_taskkill_llama_server_access_denied=true
initial_taskkill_ollama_llama_server_returncode=128
initial_taskkill_ollama_llama_server_not_found=true
stale_llama_server_remained_after_initial_cleanup=true
```

Attempts summary:

```json
[
  {
    "profile": "gpu_bounded",
    "options": { "num_ctx": 1024 },
    "returncode": 1,
    "stderr": "HTTP 500: CUDA_Host allocation failed for 5771621440 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "gpu_low_vram",
    "options": { "num_ctx": 1024, "low_vram": true },
    "returncode": 1,
    "stderr": "HTTP 500: CUDA_Host allocation failed for 5771621440 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "gpu_8_layers_low_batch",
    "options": { "num_ctx": 1024, "num_gpu": 8, "low_vram": true, "num_batch": 64 },
    "returncode": 1,
    "stderr": "HTTP 500: CUDA_Host allocation failed for 7630967904 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "gpu_4_layers_low_batch",
    "options": { "num_ctx": 1024, "num_gpu": 4, "low_vram": true, "num_batch": 32 },
    "returncode": 1,
    "stderr": "HTTP 500: CUDA_Host allocation failed for 7868556512 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "gpu_1_layer_tiny_batch",
    "options": { "num_ctx": 512, "num_gpu": 1, "low_vram": true, "num_batch": 16 },
    "returncode": 1,
    "stderr": "HTTP 500: CUDA_Host allocation failed for 8053744960 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "cpu_bounded",
    "options": { "num_ctx": 1024, "num_gpu": 0 },
    "returncode": 1,
    "stderr": "HTTP 500: CPU_REPACK allocation failed for 1941258240 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "cpu_small_context",
    "options": { "num_ctx": 512, "num_gpu": 0 },
    "returncode": 1,
    "stderr": "HTTP 500: CPU_REPACK allocation failed for 1941258240 bytes",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  },
  {
    "profile": "cpu_tiny_batch",
    "options": { "num_ctx": 256, "num_gpu": 0, "num_batch": 1, "use_mmap": true, "use_mlock": false },
    "returncode": 1,
    "stderr": "HTTP 500: exit status 0xc0000409 / GGML_ASSERT(n_tokens_all <= cparams.n_batch) failed",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  }
]
```

Per-attempt cleanup evidence:

```text
each_failed_profile_recorded_unload=true
each_failed_profile_unload_returncode=0
each_failed_profile_recorded_stop_orphan_servers=true
each_failed_profile_taskkill_llama_server_returncode=1
each_failed_profile_taskkill_llama_server_access_denied=true
each_failed_profile_taskkill_ollama_llama_server_returncode=128
each_failed_profile_taskkill_ollama_llama_server_not_found=true
```

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.
```

## After-Failure Diagnostics

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8415696
}
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504
OperatingSystem=Docker Desktop
OSType=linux
Architecture=x86_64
NCPU=12
```

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

`ollama_llama_server` / `llama-server` process check after failure:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 324784128 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 106381312 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 57569280 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29396992 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4829184 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3960832 }
]
```

`ollama_llama_server` or `llama-server` process remains after failed ladder: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 1087504384 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 438505472 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 379817984 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 324784128 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 290205696 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 230629376 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 206684160 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 166051840 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 142888960 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 134660096 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 129339392 },
  { "ProcessName": "nordvpn-service", "Id": 4932, "WorkingSet64": 113209344 }
]
```

## Install / Verify / Route Evidence

Directive 037 says to run install only if readiness passes. Because all eight host-Ollama profiles still failed after attempted orphan cleanup, the following were not run:

```text
source-cache evidence=not_reached_due_to_host_ollama_orphan_cleanup_failure
install_lifecycle_path=not_reached_due_to_host_ollama_orphan_cleanup_failure
install_status=not_reached_due_to_host_ollama_orphan_cleanup_failure
install_prewarm_evidence=not_reached_due_to_host_ollama_orphan_cleanup_failure
verify_lifecycle_path=not_reached_due_to_host_ollama_orphan_cleanup_failure
verify_status=not_reached_due_to_host_ollama_orphan_cleanup_failure
install_provenance=not_reached_due_to_host_ollama_orphan_cleanup_failure
installer/modules.json hash=not_reached_due_to_host_ollama_orphan_cleanup_failure
source commits=not_reached_due_to_host_ollama_orphan_cleanup_failure
launcher config module URLs=not_reached_due_to_host_ollama_orphan_cleanup_failure
live launcher URL evidence=not_reached_due_to_host_ollama_orphan_cleanup_failure
ten live route checks=not_reached_due_to_host_ollama_orphan_cleanup_failure
```

## Final Verdict

Directive 037 result: **BLOCKED - orphan cleanup could not terminate stale `llama-server.exe` processes**.

The Stage 3A proven-suite clean-machine gate is not passed. The branch now records initial cleanup and per-attempt cleanup, and the model unload call returned `0`. However, both initial and per-attempt `taskkill /F /IM llama-server.exe` calls failed with `Access is denied` for PIDs `9592`, `13896`, `24320`, and `7304`; `ollama_llama_server.exe` was not found. Stale `llama-server` processes existed before readiness and remained after failure. All eight host-Ollama profiles still failed, so install, verify, launcher, and live-route checks were correctly not run.
