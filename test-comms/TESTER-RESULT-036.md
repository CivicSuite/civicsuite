# Tester Result 036 - valid-offset batch/layer host Ollama ladder failed

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `206b571a61e63321ce2e92342ea915c6e86ddec0 test(comms): rerun batch layer ladder with valid offset`
**Required minimum head satisfied:** `ad41b674941d231b863df9f77df4bc30ea43611f`
**Date/time (UTC):** 2026-06-06T08:04:22.9070971Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `ad41b674941d231b863df9f77df4bc30ea43611f`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-036.md`, and `test-comms/TESTER-RESULT-035.md`. `TESTER-RESULT-035.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 8100432,
  "docker_present": true,
  "ollama_present": true,
  "docker_mem_total_bytes": 8249237504,
  "gpus": [
    {
      "name": "Intel(R) UHD Graphics 630",
      "adapter_ram_bytes": 1073741824
    },
    {
      "name": "NVIDIA GeForce GTX 1660 Ti",
      "adapter_ram_bytes": 4293918720
    }
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
  "FreePhysicalMemory": 8070080
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r12 --install-root installer\runtime\proven-suite-clean-machine-r12 --compose-project-suffix stage3a-proven-suite-clean-machine-r12 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r12\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T08:02:22.961971+00:00`

Finished at: `2026-06-06T08:04:01.402782+00:00`

## Readiness Checks

### docker_info

Status: `passed`

Return code: `0`

Docker stdout included:

```text
Operating System: Docker Desktop
OSType: linux
Architecture: x86_64
CPUs: 12
Total Memory: 7.683GiB
Runtimes: io.containerd.runc.v2 nvidia runc
Default Runtime: runc
```

Stderr: empty.

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

Model: `gemma4:e4b`

Return code: `1`

Overall probe parameters:

```json
{
  "num_ctx": 1024,
  "small_num_ctx": 512,
  "tiny_num_ctx": 256,
  "keep_alive": "30m",
  "selected_profile": null,
  "timeout_seconds": 300
}
```

Stdout: empty.

Final stderr:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application.: GGML_ASSERT(n_toke"}
```

Attempts:

```json
[
  {
    "profile": "gpu_bounded",
    "options": { "num_ctx": 1024 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server reported out-of-memory during startup: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5771621440\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5771621440\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "gpu_low_vram",
    "options": { "num_ctx": 1024, "low_vram": true },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5771621440\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5771621440\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "gpu_8_layers_low_batch",
    "options": { "num_ctx": 1024, "num_gpu": 8, "low_vram": true, "num_batch": 64 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 7630967904\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 7630967904\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "gpu_4_layers_low_batch",
    "options": { "num_ctx": 1024, "num_gpu": 4, "low_vram": true, "num_batch": 32 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 7868556512\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 7868556512\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "gpu_1_layer_tiny_batch",
    "options": { "num_ctx": 512, "num_gpu": 1, "low_vram": true, "num_batch": 16 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 8053744960\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 8053744960\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "cpu_bounded",
    "options": { "num_ctx": 1024, "num_gpu": 0 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\\nerror loading model: unable to allocate CPU_REPACK buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "cpu_small_context",
    "options": { "num_ctx": 512, "num_gpu": 0 },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\\nerror loading model: unable to allocate CPU_REPACK buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "cpu_tiny_batch",
    "options": { "num_ctx": 256, "num_gpu": 0, "num_batch": 1, "use_mmap": true, "use_mlock": false },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application.: GGML_ASSERT(n_toke\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  }
]
```

Unload evidence:

```text
all_failed_profiles_recorded_unload=true
gpu_bounded_unload_returncode=0
gpu_low_vram_unload_returncode=0
gpu_8_layers_low_batch_unload_returncode=0
gpu_4_layers_low_batch_unload_returncode=0
gpu_1_layer_tiny_batch_unload_returncode=0
cpu_bounded_unload_returncode=0
cpu_small_context_unload_returncode=0
cpu_tiny_batch_unload_returncode=0
```

Batch/layer profile option confirmations:

```text
gpu_8_layers_low_batch_attempted=true
gpu_8_layers_low_batch_options_match=true
gpu_4_layers_low_batch_attempted=true
gpu_4_layers_low_batch_options_match=true
gpu_1_layer_tiny_batch_attempted=true
gpu_1_layer_tiny_batch_options_match=true
cpu_tiny_batch_attempted=true
cpu_tiny_batch_options_match=true
selected_profile=null
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
  "FreePhysicalMemory": 8281984
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 326131712 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107638784 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 61480960 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 29941760 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4820992 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3211264 }
]
```

`ollama_llama_server` or `llama-server` process remains after failed ladder: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 1103687680 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 447942656 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 396636160 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 326131712 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 291246080 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 244625408 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 222461952 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 167256064 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 160755712 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 157057024 },
  { "ProcessName": "NVIDIA Overlay", "Id": 15184, "WorkingSet64": 133636096 },
  { "ProcessName": "SnippingTool", "Id": 7320, "WorkingSet64": 130457600 }
]
```

## Install / Verify / Route Evidence

Directive 036 says to run install only if readiness passes. Because all eight host-Ollama profiles failed, the following were not run:

```text
source-cache evidence=not_reached_due_to_eight_profile_host_ollama_ladder_failure
install_lifecycle_path=not_reached_due_to_eight_profile_host_ollama_ladder_failure
install_status=not_reached_due_to_eight_profile_host_ollama_ladder_failure
install_prewarm_evidence=not_reached_due_to_eight_profile_host_ollama_ladder_failure
verify_lifecycle_path=not_reached_due_to_eight_profile_host_ollama_ladder_failure
verify_status=not_reached_due_to_eight_profile_host_ollama_ladder_failure
install_provenance=not_reached_due_to_eight_profile_host_ollama_ladder_failure
installer/modules.json hash=not_reached_due_to_eight_profile_host_ollama_ladder_failure
source commits=not_reached_due_to_eight_profile_host_ollama_ladder_failure
launcher config module URLs=not_reached_due_to_eight_profile_host_ollama_ladder_failure
live launcher URL evidence=not_reached_due_to_eight_profile_host_ollama_ladder_failure
ten live route checks=not_reached_due_to_eight_profile_host_ollama_ladder_failure
```

## Final Verdict

Directive 036 result: **BLOCKED - all eight host Ollama probe profiles failed**.

The Stage 3A proven-suite clean-machine gate is not passed. The corrected valid-offset command exercised all eight profiles. GPU profiles failed with CUDA_Host allocation errors, CPU profiles failed with CPU_REPACK allocation errors, and the final `cpu_tiny_batch` profile failed with `exit status 0xc0000409` / stack-buffer-overrun text from `llama-server`. Install, verify, launcher, and live-route checks were correctly not run.
