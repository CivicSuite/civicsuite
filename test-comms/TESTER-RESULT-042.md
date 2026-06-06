# Tester Result 042 - native default fallback failed CUDA_Host allocation

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `1f6c3d61741a5260ec9e2296351a6d4cac344644 test(comms): rerun native host ollama fallback`
**Required minimum head satisfied:** `e997f508c7838c0b095a7ce66fbbad4f074e781a`
**Date/time (UTC):** 2026-06-06T10:08:00Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to the fetched branch head, and confirmed the checked-out commit is at or after `e997f508c7838c0b095a7ce66fbbad4f074e781a`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-042.md`, and `test-comms/TESTER-RESULT-041.md`. `TESTER-RESULT-041.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 8946456,
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

## Before-State Diagnostics

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8917980
}
```

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list` entry for `gemma4:e4b`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    7 hours ago
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 323756032, "CPU": 658.828125 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 104960000, "CPU": 490.46875 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37523456, "CPU": 1.125 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14827520, "CPU": 33.96875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4804608, "CPU": 143.75 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4173824, "CPU": 598.3125 }
]
```

Port `11435` listener state before readiness: no rows from `netstat -ano | Select-String ':11435'`.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r18 --install-root installer\runtime\proven-suite-clean-machine-r18 --compose-project-suffix stage3a-proven-suite-clean-machine-r18 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r18\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T10:02:28.376238+00:00`

Finished at: `2026-06-06T10:04:11.820765+00:00`

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

Base URL: `http://127.0.0.1:11435`

Container base URL: `http://host.docker.internal:11435`

Return code: `1`

Selected profile: `null`

Stdout: empty.

Final stderr:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5831117920\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5831117920\nerror loading model: unable to allocate CUDA_Host buffer"}
```

Server evidence:

```json
{
  "mode": "started",
  "pid": 13636,
  "port": 11435,
  "status": "passed",
  "checks": [
    { "returncode": 1, "status": "failed", "stderr": "<urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 0, "status": "passed", "url": "http://127.0.0.1:11435/api/tags", "stdout_contains_gemma4_e4b": true }
  ]
}
```

Initial cleanup:

```json
{
  "unload": {
    "request": { "keep_alive": 0, "model": "gemma4:e4b", "prompt": "", "stream": false },
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T10:02:37.9821871Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  },
  "stop_orphan_servers": {
    "returncode": 1,
    "results": [
      {
        "command": ["taskkill", "/F", "/IM", "llama-server.exe"],
        "returncode": 1,
        "stderr": "ERROR: The process \"llama-server.exe\" with PID 9592 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 13896 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 24320 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 7304 could not be terminated.\nReason: Access is denied.\n\n",
        "stdout": ""
      },
      {
        "command": ["taskkill", "/F", "/IM", "ollama_llama_server.exe"],
        "returncode": 128,
        "stderr": "ERROR: The process \"ollama_llama_server.exe\" not found.\n",
        "stdout": ""
      }
    ]
  }
}
```

Explicit cleanup-denial handling verdict:

```text
default_port_cleanup_access_denied_present=true
default_port_cleanup_access_denied_recorded=true
default_port_cleanup_access_denied_prevented_isolated_model_attempts=false
isolated_port_model_attempts_reached=true
attempt_count=9
```

## Native Default Evidence

The new fallback was present in the lifecycle.

```json
{
  "attempt_index": 9,
  "profile": "native_default",
  "options": null,
  "returncode": 1,
  "stdout": "",
  "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5831117920\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5831117920\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
  "selected_profile": false
}
```

`host_ollama_model_load.selected_profile` was `null`; readiness did not select `native_default`.

## Attempts Summary

```json
[
  { "profile": "gpu_bounded", "options": { "num_ctx": 1024 }, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 5771621440 bytes" },
  { "profile": "gpu_low_vram", "options": { "num_ctx": 1024, "low_vram": true }, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 5771621440 bytes" },
  { "profile": "gpu_8_layers_low_batch", "options": { "num_ctx": 1024, "num_gpu": 8, "low_vram": true, "num_batch": 64 }, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 7630967904 bytes" },
  { "profile": "gpu_4_layers_low_batch", "options": { "num_ctx": 1024, "num_gpu": 4, "low_vram": true, "num_batch": 32 }, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 7868556512 bytes" },
  { "profile": "gpu_1_layer_tiny_batch", "options": { "num_ctx": 512, "num_gpu": 1, "low_vram": true, "num_batch": 16 }, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 8053744960 bytes" },
  { "profile": "cpu_bounded", "options": { "num_ctx": 1024, "num_gpu": 0 }, "returncode": 1, "stderr": "HTTP 500: CPU_REPACK allocation failed for 1941258240 bytes" },
  { "profile": "cpu_small_context", "options": { "num_ctx": 512, "num_gpu": 0 }, "returncode": 1, "stderr": "HTTP 500: CPU_REPACK allocation failed for 1941258240 bytes" },
  { "profile": "cpu_tiny_batch", "options": { "num_ctx": 256, "num_gpu": 0, "num_batch": 1, "use_mmap": true, "use_mlock": false }, "returncode": 1, "stderr": "HTTP 500: exit status 0xc0000409 stack-buffer-overrun" },
  { "profile": "native_default", "options": null, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 5831117920 bytes" }
]
```

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.
```

## Required Post-Failure Probes

`/api/tags` on isolated port `11435` after failure:

```text
HTTP 200; response listed gemma4:e4b and nomic-embed-text:latest.
```

Direct no-options generate probe after failure:

```powershell
POST http://127.0.0.1:11435/api/generate
{"model":"gemma4:e4b","prompt":"Respond with OK.","stream":false}
```

Result:

```json
{
  "error": "System.Net.WebException",
  "message": "The remote server returned an error: (500) Internal Server Error.",
  "status_code": 500,
  "response": ""
}
```

`netstat` after failure and before cleanup showed `127.0.0.1:11435` listening on PID `13636`. It was stopped with `Stop-Process -Id 13636 -Force`; a small generated `llama-server` PID `7976` from the direct probe was also stopped. After cleanup, only `TIME_WAIT` rows remained for `11435`.

## After-Failure Diagnostics

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 9061680
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 323076096, "CPU": 659.109375 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 104222720, "CPU": 490.875 },
  { "ProcessName": "ollama", "Id": 13636, "WorkingSet64": 93421568, "CPU": 12.3125 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 22847488, "CPU": 1.140625 },
  { "ProcessName": "llama-server", "Id": 7976, "WorkingSet64": 8093696, "CPU": 0.046875 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 5427200, "CPU": 34.0 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4870144, "CPU": 144.078125 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4218880, "CPU": 598.59375 }
]
```

`ollama_llama_server` or `llama-server` process remains after failure: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 541913088 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 422338560 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 365170688 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 323076096 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 278540288 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 238956544 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 202539008 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 130707456 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 123338752 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 117301248 },
  { "ProcessName": "chrome", "Id": 16456, "WorkingSet64": 115798016 },
  { "ProcessName": "nordvpn-service", "Id": 4932, "WorkingSet64": 115113984 }
]
```

## Install / Verify / Route Evidence

Directive 042 says to run install only if readiness passes. Because readiness failed, the following were not run:

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

Directive 042 result: **FAILED - native default fallback was attempted but did not load `gemma4:e4b`**.

The new `native_default` fallback appeared as attempt 9 with `options=null`, but it failed with HTTP 500 / CUDA_Host allocation failure for `5831117920` bytes and was not selected. A direct no-options `/api/generate` probe against the same isolated `11435` server also returned HTTP 500. The full gate is still not passed, so install, verify, launcher, and live-route checks were correctly not run.
