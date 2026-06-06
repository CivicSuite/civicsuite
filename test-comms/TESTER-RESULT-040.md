# Tester Result 040 - isolated host Ollama retry captured cleanup block

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `cac68f1566340494ccd8736c209f82930415a21f test(comms): rerun isolated host ollama startup retry`
**Required minimum head satisfied:** `0cc71aba436d9e46c2e6d7b651b42567ff31ea18`
**Date/time (UTC):** 2026-06-06T09:24:00Z

## Procedure

Fetched the explicit branch ref `refs/heads/stage-3a-baremetal-windows`, reset the TESTER worktree to the fetched branch head, and confirmed the checked-out commit is at or after `0cc71aba436d9e46c2e6d7b651b42567ff31ea18`.

Read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-040.md`, and `test-comms/TESTER-RESULT-039.md`. `TESTER-RESULT-039.md` was confirmed as read before this rerun.

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
  "free_physical_memory_kb_before_readiness": 8265880,
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

`ollama ps` before readiness:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

Available physical memory before readiness:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8195260
}
```

`ollama --version`:

```text
ollama version is 0.30.5
```

`ollama list` entry for `gemma4:e4b`:

```text
NAME                       ID              SIZE      MODIFIED
gemma4:e4b                 c6eb396dbd59    9.6 GB    6 hours ago
```

Default-port stale host-Ollama worker processes before readiness:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325763072, "CPU": 653.5625 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107360256, "CPU": 485.484375 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37519360, "CPU": 1.109375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 15224832, "CPU": 33.859375 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4812800, "CPU": 138.609375 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4222976, "CPU": 593.328125 }
]
```

`llama-server` existed before readiness: `true`.

`ollama_llama_server` existed before readiness: `false`.

Port `11435` listener state before readiness:

```text
netstat -ano | Select-String ':11435'
```

No rows were returned. Port `11435` was not already listening before readiness.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r16 --install-root installer\runtime\proven-suite-clean-machine-r16 --compose-project-suffix stage3a-proven-suite-clean-machine-r16 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Exit code: `1`

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r16\clerk-core-installer-lifecycle.json
```

Readiness status: `failed`

Started at: `2026-06-06T09:22:06.113719+00:00`

Finished at: `2026-06-06T09:22:13.408123+00:00`

## Readiness Checks

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

Base URL: `http://127.0.0.1:11435`

Container base URL: `http://host.docker.internal:11435`

Return code: `1`

Selected profile: `null`

Stdout: empty.

Stderr:

```text
Host Ollama cleanup could not terminate stale llama-server workers: access denied. Run the elevated Windows bootstrapper or reboot the tester so orphan model workers are cleared before readiness.
```

Server evidence:

```json
{
  "mode": "started",
  "pid": 15972,
  "port": 11435,
  "status": "passed",
  "checks": [
    {
      "returncode": 1,
      "status": "failed",
      "stderr": "<urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>",
      "url": "http://127.0.0.1:11435/api/tags"
    },
    {
      "returncode": 124,
      "status": "failed",
      "stderr": "Host Ollama tags probe timed out: timed out",
      "url": "http://127.0.0.1:11435/api/tags"
    },
    {
      "returncode": 0,
      "status": "passed",
      "url": "http://127.0.0.1:11435/api/tags",
      "stdout_contains_gemma4_e4b": true
    }
  ]
}
```

Initial cleanup:

```json
{
  "unload": {
    "request": {
      "keep_alive": 0,
      "model": "gemma4:e4b",
      "prompt": "",
      "stream": false
    },
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T09:22:13.2395875Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  },
  "stop_orphan_servers": {
    "returncode": 1,
    "results": [
      {
        "command": ["taskkill", "/F", "/IM", "llama-server.exe"],
        "returncode": 1,
        "stderr": "ERROR: The process \"llama-server.exe\" with PID 9592 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 13896 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 24320 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 7304 could not be terminated.\nReason: Access is denied.\n\n",
        "stdout": ""
      },
      {
        "command": ["taskkill", "/F", "/IM", "ollama_llama_server.exe"],
        "returncode": 128,
        "stderr": "ERROR: The process \"ollama_llama_server.exe\" not found.\n",
        "stdout": ""
      }
    ]
  }
}
```

Attempts:

```json
[]
```

The startup retry fix under test worked: readiness captured the refused connection and timeout as server check records, retried, and then passed `/api/tags` on isolated port `11435`. It failed afterward because cleanup still attempted to terminate stale default-port `llama-server.exe` workers and treated access denied as fatal before any model profile attempts.

Fix steps reported by readiness:

```text
Host Ollama did not load gemma4:e4b successfully.
Confirm the model runs in host Ollama on this machine, then rerun readiness before install.
If both GPU and CPU fallback probes fail, close memory-heavy apps or reduce other CPU memory pressure before retrying.
```

## Isolated Port 11435 Probe After Failure

Manual probe after readiness failure:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:11435/api/tags -TimeoutSec 10
```

Result: HTTP `200`.

Content excerpt:

```json
{
  "models": [
    {
      "name": "gemma4:e4b",
      "model": "gemma4:e4b",
      "size": 9608350718,
      "digest": "c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb"
    },
    {
      "name": "nomic-embed-text:latest",
      "model": "nomic-embed-text:latest",
      "size": 274302450
    }
  ]
}
```

`netstat` after failure and before cleanup:

```text
TCP    127.0.0.1:11435        0.0.0.0:0              LISTENING       15972
TCP    127.0.0.1:11435        127.0.0.1:57511        TIME_WAIT       0
TCP    127.0.0.1:11435        127.0.0.1:57512        TIME_WAIT       0
TCP    127.0.0.1:11435        127.0.0.1:58046        ESTABLISHED     15972
TCP    127.0.0.1:58046        127.0.0.1:11435        ESTABLISHED     11288
```

The helper `ollama` process listening on `11435` was stopped with `Stop-Process -Id 15972 -Force`. After cleanup, only `TIME_WAIT` entries remained and process `15972` no longer existed.

## After-Failure Diagnostics

Available physical memory after failure:

```json
{
  "TotalVisibleMemorySize": 16629244,
  "FreePhysicalMemory": 8165944
}
```

Docker Desktop reported memory after failure:

```text
MemTotal=8249237504 OperatingSystem=Docker Desktop OSType=linux Architecture=x86_64 NCPU=12
```

`ollama ps` after failure:

```text
NAME    ID    SIZE    PROCESSOR    CONTEXT    UNTIL
```

`ollama_llama_server` / `llama-server` process check after failure:

```json
[
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325853184, "CPU": 653.703125 },
  { "ProcessName": "llama-server", "Id": 7304, "WorkingSet64": 107458560, "CPU": 485.703125 },
  { "ProcessName": "ollama", "Id": 15972, "WorkingSet64": 82866176, "CPU": 0.484375 },
  { "ProcessName": "ollama app", "Id": 2484, "WorkingSet64": 37576704, "CPU": 1.109375 },
  { "ProcessName": "ollama", "Id": 6600, "WorkingSet64": 15552512, "CPU": 33.859375 },
  { "ProcessName": "llama-server", "Id": 13896, "WorkingSet64": 4866048, "CPU": 138.84375 },
  { "ProcessName": "llama-server", "Id": 9592, "WorkingSet64": 4308992, "CPU": 593.5625 }
]
```

`ollama_llama_server` or `llama-server` process remains after failure: `true`.

Top memory-consuming processes after failure:

```json
[
  { "ProcessName": "Memory Compression", "Id": 3820, "WorkingSet64": 1092231168 },
  { "ProcessName": "vmmemWSL", "Id": 12536, "WorkingSet64": 442667008 },
  { "ProcessName": "Codex", "Id": 22712, "WorkingSet64": 385339392 },
  { "ProcessName": "llama-server", "Id": 24320, "WorkingSet64": 325853184 },
  { "ProcessName": "MsMpEng", "Id": 6124, "WorkingSet64": 307499008 },
  { "ProcessName": "EpicWebHelper", "Id": 16628, "WorkingSet64": 238776320 },
  { "ProcessName": "Codex", "Id": 10888, "WorkingSet64": 233410560 },
  { "ProcessName": "PhoneExperienceHost", "Id": 12612, "WorkingSet64": 159666176 },
  { "ProcessName": "explorer", "Id": 11292, "WorkingSet64": 142815232 },
  { "ProcessName": "Codex", "Id": 17968, "WorkingSet64": 134103040 },
  { "ProcessName": "codex", "Id": 3388, "WorkingSet64": 123707392 },
  { "ProcessName": "com.docker.backend", "Id": 19556, "WorkingSet64": 123211776 }
]
```

## Install / Verify / Route Evidence

Directive 040 says to run install only if readiness passes. Because readiness failed, the following were not run:

```text
runtime docker-compose.host-ollama.yml evidence=not_reached_due_to_readiness_failure
source-cache evidence=not_reached_due_to_readiness_failure
install_lifecycle_path=not_reached_due_to_readiness_failure
install_status=not_reached_due_to_readiness_failure
install_prewarm_evidence=not_reached_due_to_readiness_failure
verify_lifecycle_path=not_reached_due_to_readiness_failure
verify_status=not_reached_due_to_readiness_failure
install_provenance=not_reached_due_to_readiness_failure
installer/modules.json hash=not_reached_due_to_readiness_failure
source commits=not_reached_due_to_readiness_failure
launcher config module URLs=not_reached_due_to_readiness_failure
live launcher URL evidence=not_reached_due_to_readiness_failure
ten live route checks=not_reached_due_to_readiness_failure
```

## Final Verdict

Directive 040 result: **FAILED - startup retry fixed, but readiness still blocks on stale worker cleanup access denied**.

The Stage 3A proven-suite clean-machine gate is not passed. The isolated host-Ollama server on `11435` started and `/api/tags` eventually passed after captured refused/timeout retries, confirming the uncaught timeout gap from result 039 is fixed. However, `host_ollama_model_load` then failed before any model profile attempts because initial cleanup tried to terminate stale `llama-server.exe` workers and hit access denied for PIDs `9592`, `13896`, `24320`, and `7304`. Install, verify, launcher, and live-route checks were correctly not run.
