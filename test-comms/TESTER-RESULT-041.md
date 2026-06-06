# Tester Result 041 - isolated port reached model attempts

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `fdf1c678e8078b75fa1349089cd74e54737210af test(comms): rerun isolated ollama past cleanup denial`
**Required minimum head satisfied:** `20df53fc64f13e2f348f592754f1020be3adb690`
**Date/time (UTC):** 2026-06-06T09:47:00Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to the fetched branch head, and confirmed the checked-out commit is at or after `20df53fc64f13e2f348f592754f1020be3adb690`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-041.md`, and `test-comms/TESTER-RESULT-040.md`. `TESTER-RESULT-040.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 8191412,
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
  "FreePhysicalMemory": 8145372
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325799936, "CPU": 656.15625 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107458560, "CPU": 488.015625 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37494784, "CPU": 1.109375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 19521536, "CPU": 33.890625 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4816896, "CPU": 141.0625 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4296704, "CPU": 595.859375 }
]
```

`llama-server` existed before readiness: `true`.

`ollama_llama_server` existed before readiness: `false`.

Port `11435` listener state before readiness:

```text
netstat -ano | Select-String ':11435'
```

No rows were returned. Port `11435` was not already listening before readiness.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r17 --install-root installer\runtime\proven-suite-clean-machine-r17 --compose-project-suffix stage3a-proven-suite-clean-machine-r17 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r17\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T09:42:19.457266+00:00`

Finished at: `2026-06-06T09:43:54.469307+00:00`

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
HTTP 500: {"error":"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application."}
```

Server evidence:

```json
{
  "mode": "started",
  "pid": 20008,
  "port": 11435,
  "status": "passed",
  "checks": [
    {
      "returncode": 1,
      "status": "failed",
      "stderr": "<urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>",
      "url": "http://127.0.0.1:11435/api/tags"
    },
    {
      "returncode": 124,
      "status": "failed",
      "stderr": "Host Ollama tags probe timed out: timed out",
      "url": "http://127.0.0.1:11435/api/tags"
    },
    {
      "returncode": 0,
      "status": "passed",
      "url": "http://127.0.0.1:11435/api/tags",
      "stdout_contains_gemma4_e4b": true
    }
  ]
}
```

Initial cleanup:

```json
{
  "unload": {
    "request": {
      "keep_alive": 0,
      "model": "gemma4:e4b",
      "prompt": "",
      "stream": false
    },
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T09:42:26.6062587Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
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
attempt_count=8
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
    "stderr": "HTTP 500: exit status 0xc0000409 stack-buffer-overrun",
    "unload_returncode": 0,
    "stop_orphan_servers_returncode": 1
  }
]
```

All per-attempt `stop_orphan_servers` calls still recorded access denied for default-port stale `llama-server.exe` PIDs `9592`, `13896`, `24320`, and `7304`, plus `ollama_llama_server.exe` not found. Those cleanup failures did not stop the ladder from progressing through all eight profiles.

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.
```

## Isolated Port 11435 Probe After Failure

Manual probe after readiness failure:

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

`netstat` after failure and before cleanup:

```text
TCP    127.0.0.1:11435        0.0.0.0:0              LISTENING       20008
TCP    127.0.0.1:11435        127.0.0.1:63843        ESTABLISHED     20008
TCP    127.0.0.1:63843        127.0.0.1:11435        ESTABLISHED     21584
```

There were also multiple `TIME_WAIT` rows from the eight profile attempts. The helper `ollama` process listening on `11435` was stopped with `Stop-Process -Id 20008 -Force`. After cleanup, process `20008` no longer existed and only `TIME_WAIT` rows remained for `11435`.

## After-Failure Diagnostics

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 9119648
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 322965504, "CPU": 656.4375 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 104108032, "CPU": 488.296875 },
  { "ProcessName": "ollama", "Id": 20008, "WorkingSet64": 99016704, "CPU": 9.828125 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 27213824, "CPU": 1.109375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 12144640, "CPU": 33.90625 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4866048, "CPU": 141.390625 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4214784, "CPU": 596.296875 }
]
```

`ollama_llama_server` or `llama-server` process remains after failure: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 542048256 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 424599552 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 351502336 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 322965504 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 278380544 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 227299328 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 201994240 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 130621440 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 124604416 },
  { "ProcessName": "nordvpn-service", "Id": 4932, "WorkingSet64": 117526528 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 117329920 },
  { "ProcessName": "chrome", "Id": 16456, "WorkingSet64": 115277824 }
]
```

## Install / Verify / Route Evidence

Directive 041 says to run install only if readiness passes. Because readiness failed, the following were not run:

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

Directive 041 result: **FAILED - isolated path now reaches model attempts, but all profiles fail to load `gemma4:e4b`**.

The specific fix under test is proven: default-port cleanup access denial was recorded but did not prevent isolated-port model attempts. The isolated `11435` server started, `/api/tags` passed, and the ladder reached all eight model-load profiles. The full gate is still not passed because every profile failed: five GPU profiles failed CUDA_Host allocation, two CPU profiles failed CPU_REPACK allocation, and `cpu_tiny_batch` ended with `0xc0000409` stack-buffer-overrun. Install, verify, launcher, and live-route checks were correctly not run.
