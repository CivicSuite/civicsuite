# Tester Result 049 - machine-fit floor passed and persistent launcher gate passed

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `ff396866e8a949a3e3d2efbce6fc5c5eb6bece90 test(comms): rerun with machine-fit memory floor`
**Required minimum head satisfied:** `7209b94fabfbc2c46e536faa0a8fa3d7363268e8`
**Date/time (UTC):** 2026-06-06T13:12:26Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `7209b94fabfbc2c46e536faa0a8fa3d7363268e8`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-049.md`, and prior result `test-comms/TESTER-RESULT-048.md`.

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
  "free_physical_memory_kb_before_readiness": 7631396,
  "docker_present": true,
  "docker_mem_total_bytes": 8249237504,
  "ollama_present": true,
  "gpus": [
    { "name": "Intel(R) UHD Graphics 630", "adapter_ram_bytes": 1073741824 },
    { "name": "NVIDIA GeForce GTX 1660 Ti", "adapter_ram_bytes": 4293918720 }
  ]
}
```

Docker Desktop reported `8249237504` bytes total memory, approximately `7.683GiB`.

Before readiness:

```text
ollama version is 0.30.5
ollama ps: NAME ID SIZE PROCESSOR CONTEXT UNTIL
port 11435: no rows
port 18082: no rows
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 16248832, "CPU": 1.734375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14172160, "CPU": 34.890625 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 5328896, "CPU": 686.53125 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3547136, "CPU": 171.6875 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 3493888, "CPU": 518.015625 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 2867200, "CPU": 625.375 }
]
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r25 --install-root installer\runtime\proven-suite-clean-machine-r25 --compose-project-suffix stage3a-proven-suite-clean-machine-r25 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r25\clerk-core-installer-lifecycle.json
```

Readiness status: `passed`

Started at: `2026-06-06T12:55:42.633138+00:00`

Finished at: `2026-06-06T12:56:23.578962+00:00`

Readiness did **not** return `blocked-by-host-memory` at the TESTER-RESULT-048 memory level; it proceeded into real host-Ollama probing and passed.

### host_ollama_model_load

Status: `passed`

Selected profile: `cpu_mmap_default`

Server: started PID `2504` on port `11435`; `/api/tags` eventually passed and included `gemma4:e4b`.

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

`release_after_probe`:

```json
{
  "returncode": 0,
  "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T12:56:23.5784535Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}",
  "stderr": ""
}
```

After readiness release:

```json
{
  "free_physical_memory_kb_after_readiness_release": 8639144,
  "ollama_ps_after_readiness_release": "NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL",
  "port_state_after_readiness": "TCP 127.0.0.1:11435 LISTENING 2504"
}
```

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r25 --install-root installer\runtime\proven-suite-clean-machine-r25 --compose-project-suffix stage3a-proven-suite-clean-machine-r25 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Install lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r25\clerk-core-installer-lifecycle.json
```

Install status: `passed`

Started at: `2026-06-06T12:56:56.360343+00:00`

Finished at: `2026-06-06T13:10:40.458785+00:00`

### suite_launcher_start

```json
{
  "step": "suite_launcher_start",
  "module": "city-core",
  "status": "passed",
  "mode": "python_http_server",
  "url": "http://127.0.0.1:18082/",
  "pid": 22456,
  "returncode": 0,
  "stdout_log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\reports\\stage3a-proven-suite-clean-machine-r25\\launcher-output\\suite-launcher.stdout.log",
  "stderr_log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\reports\\stage3a-proven-suite-clean-machine-r25\\launcher-output\\suite-launcher.stderr.log",
  "content_marker_present": true
}
```

Before verify, port `18082` had an active listener:

```text
TCP 127.0.0.1:18082 0.0.0.0:0 LISTENING 22456
```

### Prewarm / Reuse Evidence

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
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T12:57:50.80749Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
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

## Verify

Command:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r25-verify --install-root installer\runtime\proven-suite-clean-machine-r25 --compose-project-suffix stage3a-proven-suite-clean-machine-r25 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `0`

Verify lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r25-verify\clerk-core-installer-lifecycle.json
```

Verify status: `passed`

Started at: `2026-06-06T13:11:20.868153+00:00`

Finished at: `2026-06-06T13:11:21.544382+00:00`

Verify `suite_launcher_http` evidence:

```json
{
  "name": "suite_launcher_http",
  "status": "passed",
  "mode": "persistent_launcher",
  "url": "http://127.0.0.1:18082/",
  "content_marker_present": true,
  "attempts": [
    { "returncode": 0, "stderr": "", "stdout_starts_with": "<!doctype html>...<title>CivicSuite Launcher</title>" }
  ]
}
```

## Runtime / Source Evidence

Source commits:

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
installer\runtime\proven-suite-clean-machine-r25\civicsuite-install-provenance.json
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

## Independent Post-Verify Live Checks

Independent post-verify launcher URL:

```json
{
  "name": "launcher",
  "url": "http://127.0.0.1:18082/",
  "status_code": 200,
  "sample_starts_with": "<!doctype html>...<title>CivicSuite Launcher</title>"
}
```

Independent post-verify port `18082` listener state:

```text
TCP 127.0.0.1:18082 0.0.0.0:0 LISTENING 22456
```

Launcher process:

```json
{ "ProcessName": "python", "Id": 22456, "Path": "C:\\Program Files\\Python312\\python.exe", "WorkingSet64": 21843968 }
```

Independent route checks:

```json
[
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

Post-verify memory/model state:

```json
{
  "free_physical_memory_kb_after_verify": 4790064,
  "ollama_ps_after_verify": "NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL",
  "port_11435_after_verify": "TCP 127.0.0.1:11435 LISTENING 2504"
}
```

## Final Verdict

Directive 049 result: **PASSED full gate.**

Readiness passed through real host-Ollama HTTP generation with `gemma4:e4b` and did not block at the TESTER-RESULT-048 memory level. Install passed. `suite_launcher_start` passed. Records prewarm loaded and released `gemma4:e4b`. Clerk reused the prior host-Ollama proof. Verify passed with `suite_launcher_http.mode=persistent_launcher`. The independent post-verify launcher URL returned 200, port `18082` had an active listener, and all selected module live route checks passed.
