# Tester Result 044 - cpu_mmap_default readiness passed, install failed on civicpermit MemoryError

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `946dc73e97143304d7d20808b0104688b3d68aed test(comms): rerun cpu mmap host ollama gate`
**Required minimum head satisfied:** `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721`
**Date/time (UTC):** 2026-06-06T10:55:00Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-044.md`, and prior result `test-comms/TESTER-RESULT-043.md`.

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
  "free_physical_memory_kb_before_readiness": 9231132,
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

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    7 hours ago
nomic-embed-text:latest    0a109f422b47    274 MB    7 hours ago
```

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 9241716
}
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 323661824, "CPU": 665.015625 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 104960000, "CPU": 496.765625 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29405184, "CPU": 1.21875 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14786560, "CPU": 34.1875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4820992, "CPU": 149.9375 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4194304, "CPU": 604 }
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r20 --install-root installer\runtime\proven-suite-clean-machine-r20 --compose-project-suffix stage3a-proven-suite-clean-machine-r20 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Readiness output was captured in `directive044-readiness.out`; the installer later reused the same lifecycle path for install. Readiness status from stdout JSON: `passed`.

Readiness started at: `2026-06-06T10:42:15.351931+00:00`

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

Status: `passed`

Base URL: `http://127.0.0.1:11435`

Container base URL: `http://host.docker.internal:11435`

Return code: `0`

Selected profile: `cpu_mmap_default`

Stdout: `OK`

Stderr: empty.

Server evidence:

```json
{
  "mode": "started",
  "pid": 15900,
  "port": 11435,
  "status": "passed",
  "checks": [
    { "returncode": 1, "status": "failed", "stderr": "<urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 0, "status": "passed", "url": "http://127.0.0.1:11435/api/tags", "stdout_contains_gemma4_e4b": true }
  ]
}
```

Initial cleanup recorded default-port access denial but did not prevent isolated-port model attempts:

```json
{
  "unload_returncode": 0,
  "stop_orphan_servers_returncode": 1,
  "llama_server_access_denied_pids": [9592, 13896, 24320, 7304],
  "ollama_llama_server_returncode": 128
}
```

First attempt evidence:

```json
{
  "attempt_index": 1,
  "profile": "native_default",
  "options": null,
  "returncode": 1,
  "stdout": "",
  "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5831117920\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5831117920\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
  "selected_profile": false
}
```

Second attempt evidence:

```json
{
  "attempt_index": 2,
  "profile": "cpu_mmap_default",
  "options": { "num_gpu": 0, "use_mmap": true, "use_mlock": false },
  "returncode": 0,
  "stdout": "",
  "stderr": "",
  "selected_profile": true
}
```

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r20 --install-root installer\runtime\proven-suite-clean-machine-r20 --compose-project-suffix stage3a-proven-suite-clean-machine-r20 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Install lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r20\clerk-core-installer-lifecycle.json
```

Install status: `failed`

Started at: `2026-06-06T10:43:17.527901+00:00`

Finished at: `2026-06-06T10:52:27.513383+00:00`

### Install prewarm evidence

Install reached host-Ollama prewarm for both `civicrecords-ai` and `civicclerk`. Both selected `cpu_mmap_default`.

`civicrecords-ai` prewarm:

```json
{
  "module": "civicrecords-ai",
  "returncode": 0,
  "status": "passed",
  "selected_profile": "cpu_mmap_default",
  "stdout": "OK",
  "server": { "mode": "already_running", "port": 11435, "status": "passed" },
  "attempts": [
    { "profile": "native_default", "options": null, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 5831117920 bytes" },
    { "profile": "cpu_mmap_default", "options": { "num_gpu": 0, "use_mmap": true, "use_mlock": false }, "returncode": 0, "stderr": "" }
  ]
}
```

`civicclerk` prewarm:

```json
{
  "module": "civicclerk",
  "returncode": 0,
  "status": "passed",
  "selected_profile": "cpu_mmap_default",
  "stdout": "OK",
  "server": { "mode": "already_running", "port": 11435, "status": "passed" },
  "attempts": [
    { "profile": "native_default", "options": null, "returncode": 1, "stderr": "HTTP 500: CUDA_Host allocation failed for 5831117920 bytes" },
    { "profile": "cpu_mmap_default", "options": { "num_gpu": 0, "use_mmap": true, "use_mlock": false }, "returncode": 0, "stderr": "" }
  ]
}
```

`ollama_loaded_model_check` passed for both records and clerk:

```text
NAME          ID              SIZE     PROCESSOR    CONTEXT    UNTIL
gemma4:e4b    c6eb396dbd59    11 GB    100% CPU     4096       29 minutes from now
```

### Runtime host-Ollama compose evidence

The copied source override existed at:

```text
installer\runtime\proven-suite-clean-machine-r20\sources\civicrecords-ai\docker-compose.host-ollama.yml
```

It points service containers at the isolated host port:

```yaml
api:
  environment:
    - OLLAMA_BASE_URL=http://host.docker.internal:11435
    - CIVICRECORDS_GPU_ENABLED=true
    - CIVICRECORDS_USE_HOST_OLLAMA=true
  extra_hosts:
    - "host.docker.internal:host-gateway"

worker:
  environment:
    - OLLAMA_BASE_URL=http://host.docker.internal:11435
    - CIVICRECORDS_GPU_ENABLED=true
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

No root-level `installer\runtime\proven-suite-clean-machine-r20\docker-compose.host-ollama.yml` was present before the install failed.

### Source-cache evidence

Install reached source-cache creation for the seven Python/static modules:

```json
[
  { "module": "civicaccess", "source_commit": "d9c1a7cf55a905d8c46cffd43d831d874e198ede" },
  { "module": "civicgrants", "source_commit": "05804d589bf7c58b4d5b8d88745772a8e910f34b" },
  { "module": "civicinspect", "source_commit": "d8af9fb3972592637e1622318afbc474eb3aa491" },
  { "module": "civicpermit", "source_commit": "877a13642d82afaca276f7b7107e7ec6ddbab7d1" },
  { "module": "civicplan", "source_commit": "ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab" },
  { "module": "civicprocure", "source_commit": "0aa998feab3736db071920e3869462598758c23d" },
  { "module": "civiczone", "source_commit": "8ffa001b22138a526684153448100fadd7de5fd7" }
]
```

`installer/modules.json` SHA256:

```text
1B9B1AE4EF8EBCA81C399CAB2F68E97937B30173092055753DF72473B884C4ED
```

### Install failure

The failing install step was `python_service_install_editable` for `civicpermit`.

```json
{
  "module": "civicpermit",
  "step": "python_service_install_editable",
  "returncode": 2,
  "stderr_tail": "File \"...\\pip\\_internal\\utils\\hashes.py\", line 83, in check_against_chunks\\n    for chunk in chunks:\\n                 ^^^^^^\\n  File \"...\\pip\\_internal\\utils\\misc.py\", line 309, in read_chunks\\n    chunk = file.read(size)\\n            ^^^^^^^^^^^^^^^\\nMemoryError"
}
```

Memory at the time of post-failure diagnostics was low:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 722324
}
```

Top memory-consuming processes after install failure:

```json
[
  { "ProcessName": "llama-server", "Id": 13096, "WorkingSet64": 5863518208 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 4444905472 },
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 372715520 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 313417728 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 289910784 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 249634816 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 130297856 },
  { "ProcessName": "python", "Id": 7296, "WorkingSet64": 112652288 },
  { "ProcessName": "python", "Id": 22080, "WorkingSet64": 112496640 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 96378880 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 96280576 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 84324352 }
]
```

Docker Desktop reported memory after install failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama ps` after install failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Processes after install failure included the r20 isolated listener and a large CPU llama-server:

```json
[
  { "ProcessName": "llama-server", "Id": 13096, "WorkingSet64": 5863518208, "CPU": 19.328125 },
  { "ProcessName": "ollama", "Id": 15900, "WorkingSet64": 47616000, "CPU": 8.09375 }
]
```

I stopped isolated PID `15900` and its large worker PID `13096` after collecting evidence. After cleanup, port `11435` had no listener and free physical memory recovered to `6414476` KB. The older default-port stale llama-server processes remained:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 313417728 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 96280576 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3616768 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3366912 }
]
```

## Verify / Launcher / Live Routes

Verify was not run because install failed.

```text
verify_lifecycle_path=not_reached_due_to_install_failure
verify_status=not_reached_due_to_install_failure
launcher config module URLs=not_reached_due_to_install_failure
live launcher URL evidence=not_reached_due_to_install_failure
ten live route checks=not_reached_due_to_install_failure
```

## Final Verdict

Directive 044 result: **FAILED full gate, but the CPU mmap host-Ollama fallback itself passed readiness.**

The new fallback behavior is proven:

- readiness attempt 1 was `native_default` with `options=null` and failed with CUDA_Host allocation,
- readiness attempt 2 was `cpu_mmap_default` with `{ "num_gpu": 0, "use_mmap": true, "use_mlock": false }`,
- readiness selected `cpu_mmap_default`,
- readiness returned `OK`,
- install prewarm also selected `cpu_mmap_default` for records and clerk.

The full gate did not pass because install failed later in `civicpermit` editable install with Python `MemoryError` while pip was reading cached metadata, under low remaining physical memory while the CPU-loaded `gemma4:e4b` worker occupied about 5.86 GB and Docker/WSL occupied about 4.44 GB.
