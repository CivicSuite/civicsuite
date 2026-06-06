# Tester Result 046 - readiness release/proof-reuse rerun failed before install

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `035f33893882b300fdc14fc8833f5d92d4bb5bf6 test(comms): rerun with host ollama proof reuse`
**Required minimum head satisfied:** `9f0ea521113192fbe074a8b98a66bb3fa8108c37`
**Date/time (UTC):** 2026-06-06T11:47:24Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `9f0ea521113192fbe074a8b98a66bb3fa8108c37`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-046.md`, and prior result `test-comms/TESTER-RESULT-045.md`.

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
  "free_physical_memory_kb_before_readiness": 3643864,
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

## Before-State Diagnostics

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 310628352, "CPU": 674.75 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 91815936, "CPU": 506.171875 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14512128, "CPU": 34.46875 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 10248192, "CPU": 1.453125 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3731456, "CPU": 159.640625 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3649536, "CPU": 613.734375 }
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r22 --install-root installer\runtime\proven-suite-clean-machine-r22 --compose-project-suffix stage3a-proven-suite-clean-machine-r22 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r22\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T11:43:34.131606+00:00`

Finished at: `2026-06-06T11:46:01.624322+00:00`

### ollama_model_resources

Status: `passed`

Docker readiness output reported Docker Desktop total memory `7.683GiB`.

### Readiness host_ollama_model_load

Status: `failed`

Base URL: `http://127.0.0.1:11435`

Container base URL expected by this host-Ollama mode: `http://host.docker.internal:11435`

Selected profile: `null`

`release_after_probe`: not run because no generation profile passed.

Isolated host-Ollama server evidence:

```json
{
  "mode": "started",
  "pid": 8500,
  "port": 11435,
  "status": "passed",
  "checks": [
    { "returncode": 1, "status": "failed", "stderr": "<urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 124, "status": "failed", "stderr": "Host Ollama tags probe timed out: timed out", "url": "http://127.0.0.1:11435/api/tags" },
    { "returncode": 0, "status": "passed", "url": "http://127.0.0.1:11435/api/tags", "stdout_contains_gemma4_e4b": true }
  ]
}
```

Attempts:

```json
[
  {
    "profile": "native_default",
    "returncode": 1,
    "stderr": "HTTP 500: llama-server reported out-of-memory during startup: cudaMalloc failed: out of memory; alloc_tensor_range: failed to allocate CUDA0 buffer of size 2773153408; error loading model: unable to allocate CUDA0 buffer"
  },
  {
    "profile": "cpu_mmap_default",
    "returncode": 1,
    "options": { "num_gpu": 0, "use_mlock": false, "use_mmap": true },
    "stderr": "HTTP 500: llama-server reported out-of-memory during startup: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 122705952; graph_reserve: failed to allocate compute buffers; llama_init_from_model: failed to initialize the context"
  },
  {
    "profile": "gpu_bounded",
    "returncode": 1,
    "options": { "num_ctx": 1024 },
    "stderr": "HTTP 500: cudaMalloc failed: out of memory; unable to allocate CUDA0 buffer"
  },
  {
    "profile": "gpu_low_vram",
    "returncode": 1,
    "options": { "low_vram": true, "num_ctx": 1024 },
    "stderr": "HTTP 500: cudaMalloc failed: out of memory; unable to allocate CUDA0 buffer"
  },
  {
    "profile": "gpu_8_layers_low_batch",
    "returncode": 1,
    "options": { "low_vram": true, "num_batch": 64, "num_ctx": 1024, "num_gpu": 8 },
    "stderr": "HTTP 500: failed to allocate CUDA_Host buffer of size 7630967904"
  },
  {
    "profile": "gpu_4_layers_low_batch",
    "returncode": 1,
    "options": { "low_vram": true, "num_batch": 32, "num_ctx": 1024, "num_gpu": 4 },
    "stderr": "HTTP 500: failed to allocate CUDA_Host buffer of size 7868556512"
  },
  {
    "profile": "gpu_1_layer_tiny_batch",
    "returncode": 1,
    "options": { "low_vram": true, "num_batch": 16, "num_ctx": 512, "num_gpu": 1 },
    "stderr": "HTTP 500: failed to allocate CUDA_Host buffer of size 8053744960"
  },
  {
    "profile": "cpu_bounded",
    "returncode": 1,
    "options": { "num_ctx": 1024, "num_gpu": 0 },
    "stderr": "HTTP 500: failed to allocate CPU buffer of size 7213501760"
  },
  {
    "profile": "cpu_small_context",
    "returncode": 1,
    "options": { "num_ctx": 512, "num_gpu": 0 },
    "stderr": "HTTP 500: failed to allocate CPU buffer of size 7213501760"
  },
  {
    "profile": "cpu_tiny_batch",
    "returncode": 1,
    "options": { "num_batch": 1, "num_ctx": 256, "num_gpu": 0, "use_mlock": false, "use_mmap": true },
    "stderr": "HTTP 500: llama-server reported out-of-memory during startup: failed to allocate CPU buffer of size 371400704"
  }
]
```

Readiness failed before `release_after_probe`; therefore there was no `ollama ps` and memory after readiness release. `ollama ps` immediately after readiness failure showed no loaded model:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory after readiness failure: `5597692` KB.

## Install / Verify

Install was not run because readiness failed.

```text
install_lifecycle_path=not_reached_due_to_readiness_failure
install_status=not_reached_due_to_readiness_failure
records_prewarm_evidence=not_reached_due_to_readiness_failure
records_host_ollama_release_model_after_prewarm=not_reached_due_to_readiness_failure
clerk_reused_prior_host_ollama_prewarm=not_reached_due_to_readiness_failure
free_physical_memory_kb_before_install=not_reached_due_to_readiness_failure
free_physical_memory_kb_before_python_service_install_steps=not_reached_due_to_readiness_failure
```

Verify was not run because install was not run.

```text
verify_lifecycle_path=not_reached_due_to_readiness_failure
verify_status=not_reached_due_to_readiness_failure
launcher_config_module_urls=not_reached_due_to_readiness_failure
live_launcher_url_evidence=not_reached_due_to_readiness_failure
ten_live_route_checks=not_reached_due_to_readiness_failure
```

## Runtime / Source Evidence

Readiness failed before source caches or runtime host-Ollama compose files were created for r22.

```text
installer\runtime\proven-suite-clean-machine-r22\sources=not_created_due_to_readiness_failure
source_cache_evidence_for_seven_readiness_modules=not_reached_due_to_readiness_failure
runtime_host_ollama_compose_evidence=not_reached_due_to_readiness_failure
install_provenance_path=not_reached_due_to_readiness_failure
```

`installer/modules.json` SHA256:

```text
1B9B1AE4EF8EBCA81C399CAB2F68E97937B30173092055753DF72473B884C4ED
```

## Failure Diagnostics

Exact failing lifecycle step: `host_ollama_model_load` during readiness.

Readiness `release_after_probe` ran and passed: `false`; no model-load profile passed.

Records `host_ollama_release_model_after_prewarm` ran and passed: `not_reached_due_to_readiness_failure`.

Clerk prewarm reused prior proof: `not_reached_due_to_readiness_failure`.

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Port `11435` after failure before cleanup:

```text
TCP 127.0.0.1:11435 LISTENING 8500
```

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 5343137792 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 312111104 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 306503680 },
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 261201920 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 223395840 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 132722688 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 104890368 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 103780352 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 101154816 },
  { "ProcessName": "ollama", "Id": 8500, "WorkingSet64": 97542144 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 87449600 },
  { "ProcessName": "powershell", "Id": 17476, "WorkingSet64": 85757952 },
  { "ProcessName": "Docker Desktop", "Id": 12364, "WorkingSet64": 84656128 },
  { "ProcessName": "powershell", "Id": 22940, "WorkingSet64": 82599936 },
  { "ProcessName": "powershell", "Id": 14692, "WorkingSet64": 81383424 }
]
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama_llama_server` or `llama-server` remained after failure: `true`; stale default-port workers remained:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 306503680 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 87449600 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3735552 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 2646016 }
]
```

I stopped isolated Ollama listener PID `8500` after collecting evidence. After cleanup, port `11435` had no listener and only `TIME_WAIT` rows remained.

## Final Verdict

Directive 046 result: **FAILED full gate.**

The builder fixes under test were not reached. Readiness failed at `host_ollama_model_load` before any successful host-Ollama generation proof, before `release_after_probe`, before install, before records prewarm/release, before clerk proof reuse, before verify, launcher, or live-route checks.
