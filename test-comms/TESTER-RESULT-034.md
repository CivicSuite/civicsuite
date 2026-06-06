# Tester Result 034 - low-memory host Ollama probe ladder failed

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `e6f83c595d49d49a32b2bed1b901401b55d75b45 test(comms): rerun host ollama low memory ladder`
**Required minimum head satisfied:** `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce`
**Date/time (UTC):** 2026-06-06T07:22:53.8177345Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-034.md`, and `test-comms/TESTER-RESULT-033.md`. `TESTER-RESULT-033.md` was confirmed as read before this rerun.

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

Docker Desktop readiness reported `Total Memory: 7.683GiB`.

Workspace path checked:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite
```

The workspace path is not under OneDrive.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r10 --install-root installer\runtime\proven-suite-clean-machine-r10 --compose-project-suffix stage3a-proven-suite-clean-machine-r10 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r10\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T07:22:05.887917+00:00`

Finished at: `2026-06-06T07:22:40.360932+00:00`

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
  "keep_alive": "30m",
  "selected_profile": null,
  "timeout_seconds": 300
}
```

Stdout: empty.

Final stderr:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\nerror loading model: unable to allocate CPU_REPACK buffer"}
```

Attempts:

```json
[
  {
    "profile": "gpu_bounded",
    "options": {
      "num_ctx": 1024
    },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5771621440\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5771621440\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "gpu_low_vram",
    "options": {
      "num_ctx": 1024,
      "low_vram": true
    },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server reported out-of-memory during startup: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5771621440\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5771621440\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "cpu_bounded",
    "options": {
      "num_ctx": 1024,
      "num_gpu": 0
    },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\\nerror loading model: unable to allocate CPU_REPACK buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  },
  {
    "profile": "cpu_small_context",
    "options": {
      "num_ctx": 512,
      "num_gpu": 0
    },
    "returncode": 1,
    "stderr": "HTTP 500: {\"error\":\"llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 1941258240\\nalloc_tensor_range: failed to allocate CPU_REPACK buffer of size 1941258240\\nerror loading model: unable to allocate CPU_REPACK buffer\"}",
    "unload_returncode": 0,
    "unload_stderr": ""
  }
]
```

Unload evidence:

```text
gpu_bounded_failed=true
gpu_bounded_unload_recorded_before_next_profile=true
gpu_bounded_unload_returncode=0
gpu_low_vram_failed=true
gpu_low_vram_unload_recorded_before_next_profile=true
gpu_low_vram_unload_returncode=0
cpu_bounded_failed=true
cpu_bounded_unload_recorded_before_next_profile=true
cpu_bounded_unload_returncode=0
cpu_small_context_failed=true
cpu_small_context_unload_recorded=true
cpu_small_context_unload_returncode=0
```

Explicit low-memory ladder findings:

```text
gpu_low_vram_attempted=true
gpu_low_vram_request_included_low_vram_true=true
cpu_small_context_attempted=true
cpu_small_context_request_included_num_ctx_512=true
cpu_small_context_request_included_num_gpu_0=true
selected_profile=null
```

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.
```

## Install / Verify / Route Evidence

Directive 034 says to stop and not install if `host_ollama_model_load` fails. Because all four profiles failed, the following were not run:

```text
source-cache evidence=not_reached_due_to_four_profile_host_ollama_ladder_failure
install_lifecycle_path=not_reached_due_to_four_profile_host_ollama_ladder_failure
install_status=not_reached_due_to_four_profile_host_ollama_ladder_failure
install_prewarm_evidence=not_reached_due_to_four_profile_host_ollama_ladder_failure
verify_lifecycle_path=not_reached_due_to_four_profile_host_ollama_ladder_failure
verify_status=not_reached_due_to_four_profile_host_ollama_ladder_failure
install_provenance=not_reached_due_to_four_profile_host_ollama_ladder_failure
installer/modules.json hash=not_reached_due_to_four_profile_host_ollama_ladder_failure
source commits=not_reached_due_to_four_profile_host_ollama_ladder_failure
launcher config module URLs=not_reached_due_to_four_profile_host_ollama_ladder_failure
live launcher URL evidence=not_reached_due_to_four_profile_host_ollama_ladder_failure
ten live route checks=not_reached_due_to_four_profile_host_ollama_ladder_failure
```

## Final Verdict

Directive 034 result: **BLOCKED - all four host Ollama probe profiles failed**.

The Stage 3A proven-suite clean-machine gate is not passed. The ladder did attempt `gpu_bounded`, `gpu_low_vram`, `cpu_bounded`, and `cpu_small_context`; each failed profile recorded an unload with return code `0`. `gpu_low_vram` included `low_vram=true`, and `cpu_small_context` included `num_ctx=512` and `num_gpu=0`. The final blocker remains a host Ollama memory allocation failure: GPU profiles failed on CUDA_Host allocation of `5771621440` bytes, while CPU profiles failed on CPU_REPACK allocation of `1941258240` bytes. Install, verify, launcher, and live-route checks were correctly not run.
