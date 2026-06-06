# Tester Result 035 - readiness command blocked by invalid port offset

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `f40f1860b0e032294f9222813d3ac940792e1812 test(comms): rerun host ollama batch layer ladder`
**Required minimum head satisfied:** `ad41b674941d231b863df9f77df4bc30ea43611f`
**Date/time (UTC):** 2026-06-06T07:42:33.0085026Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to `origin/stage-3a-baremetal-windows`, and confirmed the checked-out commit is at or after `ad41b674941d231b863df9f77df4bc30ea43611f`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-035.md`, and `test-comms/TESTER-RESULT-034.md`. `TESTER-RESULT-034.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 7919400,
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
  "FreePhysicalMemory": 7906968
}
```

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list` entry for `gemma4:e4b`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    4 hours ago
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

Directive 035 requested this exact command:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r11 --install-root installer\runtime\proven-suite-clean-machine-r11 --compose-project-suffix stage3a-proven-suite-clean-machine-r11 --port-offset 5100 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Exit code: `1`

The command failed before readiness execution because the installer rejected the requested port offset:

```text
Traceback (most recent call last):
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 3975, in <module>
    raise SystemExit(main())
                     ^^^^^^
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 3847, in main
    isolation = resolve_isolation(
                ^^^^^^^^^^^^^^^^^^
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 188, in resolve_isolation
    raise InstallerError("--port-offset must be between 0 and 5000.")
InstallerError: --port-offset must be between 0 and 5000.
```

Readiness lifecycle path:

```text
not_created_due_to_invalid_port_offset
```

Lifecycle file check:

```text
installer\reports\stage3a-proven-suite-clean-machine-r11\clerk-core-installer-lifecycle.json exists=false
```

Readiness status:

```text
not_started_due_to_invalid_port_offset
```

## Readiness Checks

Because argument validation failed before readiness started, the lifecycle checks were not created:

```text
ollama_model_resources=not_created_due_to_invalid_port_offset
host_ollama_model_load=not_created_due_to_invalid_port_offset
host_ollama_model_load.num_ctx=not_created_due_to_invalid_port_offset
host_ollama_model_load.small_num_ctx=not_created_due_to_invalid_port_offset
host_ollama_model_load.tiny_num_ctx=not_created_due_to_invalid_port_offset
host_ollama_model_load.keep_alive=not_created_due_to_invalid_port_offset
host_ollama_model_load.attempts=not_created_due_to_invalid_port_offset
host_ollama_model_load.selected_profile=not_created_due_to_invalid_port_offset
```

No host-Ollama ladder profiles were attempted. Therefore there is no per-profile unload evidence from readiness:

```text
gpu_bounded_attempted=false
gpu_low_vram_attempted=false
gpu_8_layers_low_batch_attempted=false
gpu_4_layers_low_batch_attempted=false
gpu_1_layer_tiny_batch_attempted=false
cpu_bounded_attempted=false
cpu_small_context_attempted=false
cpu_tiny_batch_attempted=false
```

Expected new profile option confirmations could not be evaluated because readiness did not start:

```text
gpu_8_layers_low_batch_expected_options=not_evaluated_due_to_invalid_port_offset
gpu_4_layers_low_batch_expected_options=not_evaluated_due_to_invalid_port_offset
gpu_1_layer_tiny_batch_expected_options=not_evaluated_due_to_invalid_port_offset
cpu_tiny_batch_expected_options=not_evaluated_due_to_invalid_port_offset
```

## After-Failure Diagnostics

Although all profiles did not fail because no profiles were attempted, diagnostic collection was performed after the failed readiness invocation.

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 7951596
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

`ollama_llama_server` process check after failure:

```json
[
  {
    "ProcessName": "llama-server",
    "Id": 24320,
    "WorkingSet64": 328818688
  },
  {
    "ProcessName": "llama-server",
    "Id": 7304,
    "WorkingSet64": 110542848
  },
  {
    "ProcessName": "llama-server",
    "Id": 13896,
    "WorkingSet64": 4775936
  },
  {
    "ProcessName": "llama-server",
    "Id": 9592,
    "WorkingSet64": 4009984
  }
]
```

`ollama_llama_server` process remains after failed invocation: `true`.

Top memory-consuming processes after failure:

```json
[
  {
    "ProcessName": "Memory Compression",
    "Id": 3820,
    "WorkingSet64": 1103798272
  },
  {
    "ProcessName": "vmmemWSL",
    "Id": 12536,
    "WorkingSet64": 473722880
  },
  {
    "ProcessName": "Codex",
    "Id": 22712,
    "WorkingSet64": 392675328
  },
  {
    "ProcessName": "llama-server",
    "Id": 24320,
    "WorkingSet64": 328818688
  },
  {
    "ProcessName": "MsMpEng",
    "Id": 6124,
    "WorkingSet64": 308760576
  },
  {
    "ProcessName": "Codex",
    "Id": 10888,
    "WorkingSet64": 246161408
  },
  {
    "ProcessName": "EpicWebHelper",
    "Id": 16628,
    "WorkingSet64": 209870848
  },
  {
    "ProcessName": "PhoneExperienceHost",
    "Id": 2440,
    "WorkingSet64": 171638784
  },
  {
    "ProcessName": "com.docker.backend",
    "Id": 19556,
    "WorkingSet64": 165699584
  },
  {
    "ProcessName": "explorer",
    "Id": 11292,
    "WorkingSet64": 156934144
  },
  {
    "ProcessName": "Codex",
    "Id": 17968,
    "WorkingSet64": 153636864
  },
  {
    "ProcessName": "codex",
    "Id": 3388,
    "WorkingSet64": 137981952
  }
]
```

## Install / Verify / Route Evidence

Directive 035 says to run install only if readiness passes. Readiness did not start because the requested command used an invalid port offset, so the following were not run:

```text
source-cache evidence=not_reached_due_to_invalid_port_offset
install_lifecycle_path=not_reached_due_to_invalid_port_offset
install_status=not_reached_due_to_invalid_port_offset
install_prewarm_evidence=not_reached_due_to_invalid_port_offset
verify_lifecycle_path=not_reached_due_to_invalid_port_offset
verify_status=not_reached_due_to_invalid_port_offset
install_provenance=not_reached_due_to_invalid_port_offset
installer/modules.json hash=not_reached_due_to_invalid_port_offset
source commits=not_reached_due_to_invalid_port_offset
launcher config module URLs=not_reached_due_to_invalid_port_offset
live launcher URL evidence=not_reached_due_to_invalid_port_offset
ten live route checks=not_reached_due_to_invalid_port_offset
```

## Final Verdict

Directive 035 result: **BLOCKED - requested readiness command is invalid**.

The Stage 3A proven-suite clean-machine gate is not passed. The eight-profile host-Ollama ladder was not exercised because `scripts\run-clerk-core-installer.py` rejects `--port-offset 5100` with `InstallerError: --port-offset must be between 0 and 5000.` The directive-requested command must use an allowed port offset before the ladder can be tested.
