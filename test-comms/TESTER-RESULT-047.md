# Tester Result 047 - memory floor passed, proof reuse passed, post-verify launcher not listening

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `f447766c8d2689de003ca48347b2550b4519a9fe test(comms): rerun with host memory floor`
**Required minimum head satisfied:** `54bd0986c5f949fd4d8d5c971e59dccca13c252c`
**Date/time (UTC):** 2026-06-06T12:20:57Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `54bd0986c5f949fd4d8d5c971e59dccca13c252c`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-047.md`, and prior result `test-comms/TESTER-RESULT-046.md`.

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
  "free_physical_memory_kb_before_readiness": 8547596,
  "free_physical_memory_bytes_before_readiness": 8752738304,
  "required_available_memory_bytes": 6442450944,
  "docker_present": true,
  "ollama_present": true,
  "docker_mem_total_bytes": 8249237504,
  "gpus": [
    { "name": "Intel(R) UHD Graphics 630", "adapter_ram_bytes": 1073741824 },
    { "name": "NVIDIA GeForce GTX 1660 Ti", "adapter_ram_bytes": 4293918720 }
  ]
}
```

Docker Desktop reported `8249237504` bytes total memory, approximately `7.683GiB`. Free RAM was above the 6 GiB floor, so readiness proceeded into model probing.

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    9 hours ago
nomic-embed-text:latest    0a109f422b47    274 MB    9 hours ago
```

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 307384320, "CPU": 678.46875 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 88395776, "CPU": 509.90625 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 16093184, "CPU": 1.578125 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14430208, "CPU": 34.546875 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3760128, "CPU": 163.5 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 3674112, "CPU": 617.5625 }
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r23 --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r23\clerk-core-installer-lifecycle.json
```

Readiness status: `passed`

Started at: `2026-06-06T12:02:28.480046+00:00`

Finished at: `2026-06-06T12:03:11.580125+00:00`

### host_ollama_model_load

Status: `passed`

Base URL: `http://127.0.0.1:11435`

Container base URL expected by host-Ollama mode: `http://host.docker.internal:11435`

Selected profile: `cpu_mmap_default`

Server evidence:

```json
{
  "mode": "started",
  "pid": 11688,
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
    "stderr": "HTTP 500: failed to allocate CUDA_Host buffer of size 5831117920"
  },
  {
    "profile": "cpu_mmap_default",
    "returncode": 0,
    "options": { "num_gpu": 0, "use_mlock": false, "use_mmap": true },
    "stderr": ""
  }
]
```

`release_after_probe` ran and passed:

```json
{
  "returncode": 0,
  "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T12:03:11.5801259Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}",
  "stderr": ""
}
```

Memory and model state after readiness release:

```json
{
  "free_physical_memory_kb_after_readiness_release": 8905376,
  "ollama_ps_after_readiness_release": "NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL",
  "port_11435_before_install": "TCP 127.0.0.1:11435 LISTENING 11688"
}
```

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r23 --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Install lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r23\clerk-core-installer-lifecycle.json
```

Install status: `passed`

Started at: `2026-06-06T12:03:41.548545+00:00`

Finished at: `2026-06-06T12:17:41.471611+00:00`

Install lifecycle step count: `70`

Prewarm evidence:

```json
[
  {
    "step": "ollama_prewarm_model",
    "module": "civicrecords-ai",
    "status": "passed",
    "returncode": 0,
    "selected_profile": "cpu_mmap_default",
    "reused_prior_host_ollama_prewarm": false,
    "stdout": "OK"
  },
  {
    "step": "ollama_loaded_model_check",
    "module": "civicrecords-ai",
    "status": "passed",
    "stdout": "gemma4:e4b ... 11 GB ... 100% CPU ... 4096 ... 29 minutes from now"
  },
  {
    "step": "host_ollama_release_model_after_prewarm",
    "module": "civicrecords-ai",
    "status": "passed",
    "returncode": 0,
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T12:04:35.5045137Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  },
  {
    "step": "ollama_prewarm_model",
    "module": "civicclerk",
    "status": "passed",
    "returncode": 0,
    "selected_profile": "cpu_mmap_default",
    "reused_prior_host_ollama_prewarm": true,
    "stdout": "reused prior host-Ollama prewarm proof"
  }
]
```

This proves records prewarm loaded `gemma4:e4b`, records release ran with `done_reason=unload`, and clerk reused the prior host-Ollama proof instead of re-probing all profiles.

## Verify

Command:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r23-verify --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Verify lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r23-verify\clerk-core-installer-lifecycle.json
```

Verify status: `passed`

Started at: `2026-06-06T12:18:25.348913+00:00`

Finished at: `2026-06-06T12:18:34.198986+00:00`

The install lifecycle recorded suite launcher file/config checks and a `suite_launcher_http` check as passed:

```json
{
  "suite_launcher_runtime_files": "passed",
  "suite_launcher_port_config": { "status": "passed", "expected_port": 18082 },
  "suite_launcher_http": {
    "status": "passed",
    "mode": "python_http_server",
    "url": "http://127.0.0.1:18082/",
    "content_marker_present": true
  }
}
```

## Runtime / Source Evidence

Source-cache/source commits:

```json
[
  { "module": "civicaccess", "source_commit": "d9c1a7cf55a905d8c46cffd43d831d874e198ede" },
  { "module": "civicclerk", "source_commit": "af8b989a8d64ba709d1b204ec231364484619f7b" },
  { "module": "civiccode", "source_commit": "a960bba0a2249d118b593dd61bee3a65a69a9d77" },
  { "module": "civicgrants", "source_commit": "05804d589bf7c58b4d5b8d88745772a8e910f34b" },
  { "module": "civicinspect", "source_commit": "d8af9fb3972592637e1622318afbc474eb3aa491" },
  { "module": "civicpermit", "source_commit": "877a13642d82afaca276f7b7107e7ec6ddbab7d1" },
  { "module": "civicplan", "source_commit": "ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab" },
  { "module": "civicprocure", "source_commit": "0aa998feab3736db071920e3869462598758c23d" },
  { "module": "civicrecords-ai", "source_commit": "cddc4d2be856badfbc7c6bdd26917a34ef535677" },
  { "module": "civiczone", "source_commit": "8ffa001b22138a526684153448100fadd7de5fd7" }
]
```

Install provenance path:

```text
installer\runtime\proven-suite-clean-machine-r23\civicsuite-install-provenance.json
```

`installer/modules.json` SHA256:

```text
1B9B1AE4EF8EBCA81C399CAB2F68E97937B30173092055753DF72473B884C4ED
```

Runtime host-Ollama compose evidence:

```yaml
api:
  environment:
    - OLLAMA_BASE_URL=http://host.docker.internal:11435
    - CIVICRECORDS_GPU_ENABLED=true
    - CIVICRECORDS_USE_HOST_OLLAMA=true

worker:
  environment:
    - OLLAMA_BASE_URL=http://host.docker.internal:11435
    - CIVICRECORDS_GPU_ENABLED=true
```

Launcher config module URLs:

```json
[
  { "id": "records", "href": "http://127.0.0.1:23080/", "port": 23080 },
  { "id": "clerk", "href": "http://127.0.0.1:23081/", "port": 23081 },
  { "id": "code", "href": "http://127.0.0.1:23820/civiccode", "port": 23820 },
  { "id": "zone", "href": "http://127.0.0.1:23830/civiczone", "port": 23830 },
  { "id": "plan", "href": "http://127.0.0.1:23840/civicplan", "port": 23840 },
  { "id": "permit", "href": "http://127.0.0.1:23850/civicpermit", "port": 23850 },
  { "id": "access", "href": "http://127.0.0.1:23860/civicaccess", "port": 23860 },
  { "id": "inspect", "href": "http://127.0.0.1:23861/civicinspect", "port": 23861 },
  { "id": "grants", "href": "http://127.0.0.1:23862/civicgrants", "port": 23862 },
  { "id": "procure", "href": "http://127.0.0.1:23863/civicprocure", "port": 23863 }
]
```

## Independent Live Route Checks After Verify

Independent route checks after verify:

```json
[
  { "name": "launcher", "url": "http://127.0.0.1:18082/", "status_code": "ERROR", "sample": "Unable to connect to the remote server" },
  { "name": "records_frontend", "url": "http://127.0.0.1:23080/", "status_code": 200 },
  { "name": "records_api_health", "url": "http://127.0.0.1:23000/health", "status_code": 200, "sample": "{\"status\":\"ok\",\"version\":\"1.7.3\"}" },
  { "name": "clerk_frontend", "url": "http://127.0.0.1:23081/", "status_code": 200 },
  { "name": "clerk_api_health", "url": "http://127.0.0.1:23776/health", "status_code": 200, "sample": "{\"status\":\"ok\",\"service\":\"civicclerk\",\"version\":\"1.0.3\",\"civiccore\":\"1.2.0\"}" },
  { "name": "code_api_health", "url": "http://127.0.0.1:23820/health", "status_code": 200 },
  { "name": "zone_api_health", "url": "http://127.0.0.1:23830/health", "status_code": 200 },
  { "name": "plan_api_health", "url": "http://127.0.0.1:23840/health", "status_code": 200 },
  { "name": "permit_api_health", "url": "http://127.0.0.1:23850/health", "status_code": 200 },
  { "name": "access_api_health", "url": "http://127.0.0.1:23860/health", "status_code": 200 },
  { "name": "inspect_api_health", "url": "http://127.0.0.1:23861/health", "status_code": 200 },
  { "name": "grants_api_health", "url": "http://127.0.0.1:23862/health", "status_code": 200 },
  { "name": "procure_api_health", "url": "http://127.0.0.1:23863/health", "status_code": 200 }
]
```

Port state after verify:

```text
TCP 127.0.0.1:11435 LISTENING 11688
TCP 127.0.0.1:62362 127.0.0.1:18082 TIME_WAIT 0
```

No current listener was present on `18082` during my independent post-verify check. The verify lifecycle did prove launcher content via `suite_launcher_http` using `python_http_server`, but the launcher was not persistently serving when checked immediately afterward.

Memory and model state after verify:

```json
{
  "free_physical_memory_kb_after_verify": 4196396,
  "ollama_ps_after_verify": "NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL"
}
```

## Final Verdict

Directive 047 result: **FAILED full gate on independent post-verify launcher availability.**

The host-memory floor did not block this run because free RAM before readiness was above 6 GiB. Readiness passed real host-Ollama HTTP generation with `gemma4:e4b`; `release_after_probe` passed with `done_reason=unload`; install passed; records prewarm loaded and released the model; clerk prewarm reused the prior host-Ollama proof; verify passed; and all selected module health routes checked after verify returned 200.

The remaining gap is launcher serving persistence: the verify lifecycle recorded `suite_launcher_http` as passed, but an independent live check immediately afterward found no listener on `http://127.0.0.1:18082/`. I therefore did not mark the full gate passed.
