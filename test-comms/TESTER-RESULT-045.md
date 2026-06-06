# Tester Result 045 - release ran after records prewarm, install failed on clerk prewarm reload

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `aa49625a50d75382a60eb10895ec016c40e447b8 test(comms): rerun after host ollama release`
**Required minimum head satisfied:** `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea`
**Date/time (UTC):** 2026-06-06T11:31:00Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-045.md`, and prior result `test-comms/TESTER-RESULT-044.md`.

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
  "free_physical_memory_kb_before_readiness": 5739968,
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
gemma4:e4b                 c6eb396dbd59    9.6 GB    8 hours ago
nomic-embed-text:latest    0a109f422b47    274 MB    8 hours ago
```

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 5760824
}
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 314208256, "CPU": 670.578125 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 96534528, "CPU": 502.078125 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14200832, "CPU": 34.359375 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 11128832, "CPU": 1.40625 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3608576, "CPU": 155.59375 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3579904, "CPU": 609.484375 }
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
removed containers: 10
removed volumes: 8
removed networks: 4
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r21 --install-root installer\runtime\proven-suite-clean-machine-r21 --compose-project-suffix stage3a-proven-suite-clean-machine-r21 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Readiness output was captured in `directive045-readiness.out`; readiness status from stdout JSON: `passed`.

Readiness started at: `2026-06-06T11:19:15.360784+00:00`

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

### Readiness host_ollama_model_load

Status: `passed`

Base URL: `http://127.0.0.1:11435`

Container base URL: `http://host.docker.internal:11435`

Selected profile: `cpu_mmap_default`

Stdout: `OK.`

Return code: `0`

Attempts:

```json
[
  {
    "profile": "native_default",
    "options": null,
    "returncode": 1,
    "stderr": "HTTP 500: llama-server reported out-of-memory during startup: failed to allocate CUDA_Host buffer of size 5831117920"
  },
  {
    "profile": "cpu_mmap_default",
    "options": { "num_gpu": 0, "use_mmap": true, "use_mlock": false },
    "returncode": 0,
    "stderr": ""
  }
]
```

Server evidence:

```json
{
  "mode": "started",
  "pid": 17196,
  "port": 11435,
  "status": "passed",
  "checks": [
    { "returncode": 1, "status": "failed", "stderr": "connection refused", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 0, "status": "passed", "url": "http://127.0.0.1:11435/api/tags", "stdout_contains_gemma4_e4b": true }
  ]
}
```

Readiness left the isolated listener running on PID `17196`. Before install, `ollama ps` showed no loaded models, but process inspection showed a large r21 CPU `llama-server` worker:

```json
{
  "mem_before_install": { "TotalVisibleMemorySize": 16629244, "FreePhysicalMemory": 852684 },
  "ollama_ps_before_install": "NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL",
  "port_11435_before_install": ["TCP 127.0.0.1:11435 LISTENING 17196"],
  "llama_worker_before_install": { "ProcessName": "llama-server", "Id": 23144, "WorkingSet64": 6135644160, "CPU": 19.78125 }
}
```

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r21 --install-root installer\runtime\proven-suite-clean-machine-r21 --compose-project-suffix stage3a-proven-suite-clean-machine-r21 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Install lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r21\clerk-core-installer-lifecycle.json
```

Install status: `failed`

Started at: `2026-06-06T11:20:34.303751+00:00`

Finished at: `2026-06-06T11:26:16.380762+00:00`

### Install step order

```json
[
  { "index": 0, "step": "ensure_shared_handoff_network", "module": "city-core", "returncode": 0 },
  { "index": 1, "step": "ollama_pull_model", "module": "civicrecords-ai", "returncode": 0 },
  { "index": 2, "step": "ollama_pull_model", "module": "civicrecords-ai", "returncode": 0 },
  { "index": 3, "step": "ollama_prewarm_model", "module": "civicrecords-ai", "status": "passed", "returncode": 0 },
  { "index": 4, "step": "ollama_loaded_model_check", "module": "civicrecords-ai", "status": "passed", "returncode": 0 },
  { "index": 5, "step": "host_ollama_release_model_after_prewarm", "module": "civicrecords-ai", "status": "passed", "returncode": 0 },
  { "index": 6, "step": "compose_build", "module": "civicrecords-ai", "returncode": 0 },
  { "index": 7, "step": "compose_up", "module": "civicrecords-ai", "returncode": 0 },
  { "index": 8, "step": "compose_build", "module": "civicclerk", "returncode": 0 },
  { "index": 9, "step": "compose_up", "module": "civicclerk", "returncode": 0 },
  { "index": 10, "step": "compose_build", "module": "civiccode", "returncode": 0 },
  { "index": 11, "step": "compose_up", "module": "civiccode", "returncode": 0 },
  { "index": 12, "step": "ollama_pull_model", "module": "civicclerk", "returncode": 0 },
  { "index": 13, "step": "ollama_pull_model", "module": "civicclerk", "returncode": 0 },
  { "index": 14, "step": "ollama_prewarm_model", "module": "civicclerk", "status": "failed", "returncode": 1 }
]
```

No Python service install steps were reached, so there is no before-Python memory point from the lifecycle. The only release step occurred before any Python service install step would have run.

### Records prewarm and release evidence

`civicrecords-ai` install prewarm:

```json
{
  "module": "civicrecords-ai",
  "status": "passed",
  "returncode": 0,
  "selected_profile": "cpu_mmap_default",
  "stdout": "OK",
  "stderr": "",
  "attempt_profiles": ["native_default", "cpu_mmap_default"],
  "attempt_returncodes": [1, 0]
}
```

`host_ollama_release_model_after_prewarm`:

```json
{
  "module": "civicrecords-ai",
  "status": "passed",
  "returncode": 0,
  "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T11:21:30.3362309Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}",
  "stderr": ""
}
```

The lifecycle did not include `ollama_ps_after_release`, `memory_before`, or `memory_after` fields on the release step.

### Clerk prewarm failure

`civicclerk` install prewarm failed after records release:

```json
{
  "module": "civicclerk",
  "status": "failed",
  "returncode": 1,
  "selected_profile": null,
  "stdout": "",
  "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 161405824\\nggml_gallocr_reserve_n_impl: failed to allocate CPU buffer of size 161405824\\nggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\\nerror loading model: unable to allocate CPU_REPACK buffer\"}",
  "attempt_profiles": [
    "native_default",
    "cpu_mmap_default",
    "gpu_bounded",
    "gpu_low_vram",
    "gpu_8_layers_low_batch",
    "gpu_4_layers_low_batch",
    "gpu_1_layer_tiny_batch",
    "cpu_bounded",
    "cpu_small_context",
    "cpu_tiny_batch"
  ],
  "attempt_returncodes": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  "fix_steps": [
    "The selected response-letter model gemma4:e4b did not load successfully.",
    "Increase Docker Desktop / WSL2 memory above the model requirement and rerun repair/verify, or select a supported smaller model.",
    "Review the Ollama container logs for the exact model-load error."
  ]
}
```

This failure occurred before install reached Python service install steps, so the previous directive's `civicpermit` editable-install `MemoryError` was not reached in this r21 run.

## Runtime / Source Evidence

Runtime host-Ollama compose evidence existed at:

```text
installer\runtime\proven-suite-clean-machine-r21\sources\civicrecords-ai\docker-compose.host-ollama.yml
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

Source-cache evidence:

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

Install provenance path: not reached due to install failure.

## Failure Diagnostics

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Port `11435` after failure:

```text
TCP 127.0.0.1:11435 LISTENING 17196
```

Available physical memory:

```json
{
  "before_readiness_kb": 5760824,
  "before_install_kb": 852684,
  "after_failure_kb": 3746900
}
```

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 6893375488 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 329121792 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 310607872 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 288960512 },
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 180432896 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 133799936 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 112103424 },
  { "ProcessName": "python", "Id": 22080, "WorkingSet64": 109133824 },
  { "ProcessName": "python", "Id": 7296, "WorkingSet64": 107302912 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 99368960 },
  { "ProcessName": "ollama", "Id": 17196, "WorkingSet64": 98103296 },
  { "ProcessName": "Docker Desktop", "Id": 12364, "WorkingSet64": 92700672 }
]
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama_llama_server` or `llama-server` remained after failure: `true`. The large r21 worker from readiness was gone after failed clerk prewarm, but older stale default-port workers remained:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 310607872 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 91766784 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3772416 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3620864 }
]
```

I stopped isolated Ollama listener PID `17196` after collecting evidence. After cleanup, port `11435` had no listener and only `TIME_WAIT` rows remained.

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

Directive 045 result: **FAILED full gate.**

The builder fix is partially proven: after successful `civicrecords-ai` prewarm, the installer recorded `host_ollama_release_model_after_prewarm`, the step passed with `done_reason=unload`, and it occurred before any Python service install step.

The full gate did not pass because install failed later at `civicclerk` `ollama_prewarm_model`. After the records release, clerk prewarm attempted all ten host-Ollama profiles and none loaded `gemma4:e4b`; `cpu_mmap_default` failed with CPU/CPU_REPACK allocation errors. Install stopped before Python service installs, verify, launcher, or live-route checks.
