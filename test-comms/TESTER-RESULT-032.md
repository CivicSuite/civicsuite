# Tester Result 032 - bounded host Ollama HTTP probe failed

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `81afac6bd7cd67cd7522c79ec3e9f850c62a589a test(comms): rerun bounded host ollama probe`
**Required minimum head satisfied:** `6a27adb690fafedfea0457acf39446aeff0eaa99`
**Date/time (UTC):** 2026-06-06T06:42:33.8283514Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `6a27adb690fafedfea0457acf39446aeff0eaa99`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-032.md`, and `test-comms/TESTER-RESULT-031.md`. `TESTER-RESULT-031.md` was confirmed as read before this rerun.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r8 --install-root installer\runtime\proven-suite-clean-machine-r8 --compose-project-suffix stage3a-proven-suite-clean-machine-r8 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r8\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T06:42:08.240365+00:00`

Finished at: `2026-06-06T06:42:19.929890+00:00`

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

Probe parameters:

```json
{
  "num_ctx": 1024,
  "keep_alive": "30m",
  "timeout_seconds": 300
}
```

Stdout: empty.

Stderr:

```text
HTTP 500: {"error":"llama-server reported out-of-memory during startup: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5771621440\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5771621440\nerror loading model: unable to allocate CUDA_Host buffer"}
```

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If the error mentions CUDA_Host or allocation failure, close memory-heavy apps or reduce other GPU/CPU memory pressure before retrying.
```

## Install / Verify / Route Evidence

Directive 032 says to stop and not install if `host_ollama_model_load` fails. Because the bounded host-Ollama HTTP model-load probe failed, the following were not run:

```text
source-cache evidence=not_reached_due_to_bounded_host_ollama_model_load_failure
install_lifecycle_path=not_reached_due_to_bounded_host_ollama_model_load_failure
install_status=not_reached_due_to_bounded_host_ollama_model_load_failure
verify_lifecycle_path=not_reached_due_to_bounded_host_ollama_model_load_failure
verify_status=not_reached_due_to_bounded_host_ollama_model_load_failure
install_provenance=not_reached_due_to_bounded_host_ollama_model_load_failure
installer/modules.json hash=not_reached_due_to_bounded_host_ollama_model_load_failure
source commits=not_reached_due_to_bounded_host_ollama_model_load_failure
launcher config module URLs=not_reached_due_to_bounded_host_ollama_model_load_failure
live launcher URL evidence=not_reached_due_to_bounded_host_ollama_model_load_failure
ten live route checks=not_reached_due_to_bounded_host_ollama_model_load_failure
```

## Final Verdict

Directive 032 result: **BLOCKED - bounded host Ollama `gemma4:e4b` HTTP model-load probe failed**.

The Stage 3A proven-suite clean-machine gate is not passed. The branch now records the bounded production-style host-Ollama probe parameters (`num_ctx=1024`, `keep_alive=30m`), but the actual probe still failed with HTTP 500 and a CUDA_Host allocation error while trying to allocate `5771621440` bytes.
