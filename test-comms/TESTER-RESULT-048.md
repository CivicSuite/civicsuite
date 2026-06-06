# Tester Result 048 - readiness blocked by host memory before launcher rerun

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `244ae0b52c96b3310fdd7a13406e081bd95406e3 test(comms): rerun with persistent suite launcher`
**Required minimum head satisfied:** `684b8f9eae75b5eda7db30d802241c1220307844`
**Date/time (UTC):** 2026-06-06T12:36:24Z

## Procedure

Fetched `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `684b8f9eae75b5eda7db30d802241c1220307844`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-048.md`, and prior result `test-comms/TESTER-RESULT-047.md`.

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
  "free_physical_memory_kb_before_readiness": 4610428,
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
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 304164864, "CPU": 683.1875 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 85028864, "CPU": 514.921875 },
  { "ProcessName": "ollama", "Id": 11688, "WorkingSet64": 37683200, "CPU": 6.09375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14135296, "CPU": 34.78125 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 7843840, "CPU": 1.640625 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3629056, "CPU": 168.53125 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 2867200, "CPU": 622.46875 }
]
```

Port state before readiness:

```text
11435: TCP 127.0.0.1:11435 LISTENING 11688
18082: no rows
```

PID `11688` was the stale isolated r23 Ollama listener left from the prior run. After recording it, I stopped PID `11688` before starting r24 readiness so the r24 run would own port `11435`. After cleanup, port `11435` had no listener and free physical memory was `4770932` KB.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r24 --install-root installer\runtime\proven-suite-clean-machine-r24 --compose-project-suffix stage3a-proven-suite-clean-machine-r24 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r24\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T12:35:50.712259+00:00`

Finished at: `2026-06-06T12:35:51.108856+00:00`

### host_ollama_model_load

Status: `failed`

Failure type: `blocked-by-host-memory`

```json
{
  "base_url": "http://127.0.0.1:11435",
  "container_base_url": "http://host.docker.internal:11435",
  "detected_available_memory_bytes": 4868968448,
  "required_available_memory_bytes": 6000000000,
  "required_available_memory_gb": 6,
  "attempts": [],
  "server": null,
  "selected_profile": null,
  "release_after_probe": null,
  "returncode": 1,
  "stderr": "Host has only 4868968448 bytes of available RAM before model load; gemma4:e4b host-Ollama readiness requires at least 6000000000 bytes free on this supported 16 GB profile.",
  "fix_steps": [
    "Close memory-heavy applications and stop stale Ollama workers, then rerun readiness.",
    "Rerun the clean-machine gate immediately after teardown/reboot so gemma4:e4b can load before Docker and Python installs contend for RAM."
  ]
}
```

The new guard fired before model probing. There were no host-Ollama profile attempts, no server start, and no `release_after_probe`.

## Install / Verify / Launcher

Install was not run because readiness failed on the host-memory guard.

```text
install_lifecycle_path=not_reached_due_to_readiness_host_memory_guard
install_status=not_reached_due_to_readiness_host_memory_guard
suite_launcher_start=not_reached_due_to_readiness_host_memory_guard
records_prewarm_evidence=not_reached_due_to_readiness_host_memory_guard
clerk_reused_prior_host_ollama_prewarm=not_reached_due_to_readiness_host_memory_guard
source_cache_evidence=not_reached_due_to_readiness_host_memory_guard
runtime_host_ollama_compose_evidence=not_reached_due_to_readiness_host_memory_guard
```

Verify was not run because install was not run.

```text
verify_lifecycle_path=not_reached_due_to_readiness_host_memory_guard
verify_status=not_reached_due_to_readiness_host_memory_guard
suite_launcher_http_persistent_launcher=not_reached_due_to_readiness_host_memory_guard
launcher_config_module_urls=not_reached_due_to_readiness_host_memory_guard
independent_post_verify_launcher_url=not_reached_due_to_readiness_host_memory_guard
independent_post_verify_port_18082_listener=not_reached_due_to_readiness_host_memory_guard
ten_live_module_route_checks=not_reached_due_to_readiness_host_memory_guard
```

`installer/modules.json` SHA256:

```text
1B9B1AE4EF8EBCA81C399CAB2F68E97937B30173092055753DF72473B884C4ED
```

## Failure Diagnostics

Exact failing lifecycle step: `host_ollama_model_load` during readiness.

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Port state after failure:

```text
no rows for :11435 or :18082
```

Available physical memory:

```json
{
  "before_readiness_kb": 4610428,
  "after_stale_11435_cleanup_kb": 4770932,
  "detected_by_guard_bytes": 4868968448,
  "required_by_guard_bytes": 6000000000,
  "after_readiness_failure_kb": 4610112
}
```

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 4779388928 },
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 467320832 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 322142208 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 320569344 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 304164864 },
  { "ProcessName": "PhoneExperienceHost", "Id": 10992, "WorkingSet64": 158040064 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 150704128 },
  { "ProcessName": "python", "Id": 5056, "WorkingSet64": 110022656 },
  { "ProcessName": "python", "Id": 23860, "WorkingSet64": 110006272 },
  { "ProcessName": "python", "Id": 18304, "WorkingSet64": 109940736 },
  { "ProcessName": "python", "Id": 4036, "WorkingSet64": 109527040 },
  { "ProcessName": "python", "Id": 8308, "WorkingSet64": 109498368 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 107606016 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 105111552 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 92798976 }
]
```

Ollama/llama processes after failure:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 304164864 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 85028864 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 14589952 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 7843840 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 3629056 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 2867200 }
]
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

## Final Verdict

Directive 048 result: **BLOCKED BY HOST MEMORY before model probing.**

The persistent launcher fix under test was not reached. The new readiness free-memory guard worked as designed: it failed fast with `attempts=[]`, `server=null`, `release_after_probe=null`, detected `4868968448` bytes available, and required `6000000000` bytes before loading `gemma4:e4b`.

Install, `suite_launcher_start`, verify, persistent launcher HTTP mode, independent launcher URL, active `18082` listener, and live module route checks were not reached. I did not mark the full gate passed.
