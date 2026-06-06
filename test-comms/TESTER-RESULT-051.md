# Tester Result 051 - CivicAccess gate retry after host-Ollama crash recovery

## Verdict

FAILED at install.

The readiness fix was exercised successfully: the previous `0xc0000409` crash from `TESTER-RESULT-050.md` did not recur. Readiness passed using `cpu_mmap_default`, with two bounded attempts and `release_after_probe` passing.

The gate then failed during install because the required CivicAccess source commit could not be resolved from a bundled source, local checkout, or GitHub archive URL:

```text
Missing source for civicaccess. Expected bundled source at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\modules\civicaccess or local checkout at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicaccess. Also failed to fetch source into install cache at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\runtime\proven-suite-clean-machine-r27\source-cache\civicaccess: Failed to fetch source for civicaccess from https://github.com/CivicSuite/civicaccess/archive/9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3.zip: HTTP Error 404: Not Found
```

Per directive, verify and live CivicAccess API/UI checks were not run after install failed.

## Branch Truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Exact branch head tested: `4acd184550e17d76eb7778912bede8b01169ca3d`
- Required minimum head: `3661ff32d1ebfa25686a160a6713fbb8aa549f98`
- Minimum head ancestry check: passed, `3661ff32d1ebfa25686a160a6713fbb8aa549f98` is an ancestor of the checked-out head.
- Prior result read: `test-comms/TESTER-RESULT-050.md`, 233 lines.
- Expected result file written: `test-comms/TESTER-RESULT-051.md`

## Edit Discipline

- No source files edited.
- No generated artifacts edited.
- No `installer/modules.json` edits.
- No docs outside `test-comms` edited.
- No tests edited.
- `git diff --name-status` after install failure: empty.
- Only `test-comms/TESTER-RESULT-051.md` was staged for commit.

## Module Pin And Hash

- `installer/modules.json` SHA256: `93420FC0A88B1CE1CDA575CE24C054B6568E6F1EA60CFD451995322B5AD2359E`
- Confirmed `installer/modules.json` declares `civicaccess` source commit `9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3`.

Source commit list from `installer/modules.json`:

| Module | Source commit |
| --- | --- |
| civicrecords-ai | `cddc4d2be856badfbc7c6bdd26917a34ef535677` |
| civicclerk | `af8b989a8d64ba709d1b204ec231364484619f7b` |
| civiccode | `a960bba0a2249d118b593dd61bee3a65a69a9d77` |
| civiczone | `8ffa001b22138a526684153448100fadd7de5fd7` |
| civicplan | `ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab` |
| civicpermit | `877a13642d82afaca276f7b7107e7ec6ddbab7d1` |
| civicaccess | `9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3` |
| civicinspect | `d8af9fb3972592637e1622318afbc474eb3aa491` |
| civicgrants | `05804d589bf7c58b4d5b8d88745772a8e910f34b` |
| civicprocure | `0aa998feab3736db071920e3869462598758c23d` |

## Clean-Stack Teardown

Command:

```powershell
powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1
```

Result:

- Exit code: `0`
- Evidence file: `directive051-teardown.out`
- Cleanup evidence file: `directive051-teardown-and-stale-cleanup.json`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Ports before readiness cleanup: no listeners on `11435` or `18082`
- Stale `llama-server.exe` processes existed from host Ollama state, but not as listeners on the isolated port.

## Host Facts Before Readiness

Evidence file: `directive051-hostfacts-before-readiness.json`

- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- `Win32_ComputerSystem.HypervisorPresent`: `true`
- `Win32_Processor.VirtualizationFirmwareEnabled`: `false`
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `7482684` KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Ollama version: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty model table
- Port `11435` before readiness: no listener
- Port `18082` before readiness: no listener

Ollama/llama process state before readiness:

- `llama-server.exe` PID `9592`, working set `3809280`
- `llama-server.exe` PID `13896`, working set `3899392`
- `llama-server.exe` PID `24320`, working set `3780608`
- `llama-server.exe` PID `7304`, working set `138084352`
- `ollama app.exe` PID `2484`, working set `37404672`
- `ollama.exe` PID `6600`, working set `14118912`

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Result:

- Exit code: `0`
- Evidence file: `directive051-plan.out`
- `dry_run`: `true`
- `mutates_host`: `false`

Selected module list:

```text
civiccore
civicrecords-ai
civicclerk
civiccode
civiczone
civicplan
civicpermit
civicaccess
civicinspect
civicgrants
civicprocure
```

Plan launcher entry for CivicAccess before port offset:

- CivicAccess launcher href: `http://127.0.0.1:18860/civicaccess`
- CivicAccess port: `18860`
- Suite launcher URL: `http://127.0.0.1:18082/`

## Readiness

Command:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r27 --install-root installer\runtime\proven-suite-clean-machine-r27 --compose-project-suffix stage3a-proven-suite-clean-machine-r27 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Result:

- Exit code: `0`
- Evidence file: `directive051-readiness.out` (UTF-16 PowerShell capture)
- Extracted summary: `directive051-extracted-summary.json`
- Lifecycle path at readiness time: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r27\clerk-core-installer-lifecycle.json`
- Lifecycle status at readiness time: `passed`
- Started at: `2026-06-06T16:54:18.808339+00:00`
- Finished at: `2026-06-06T16:55:06.874681+00:00`

Readiness port map:

| Component | Port |
| --- | ---: |
| civicrecords-ai API | 23000 |
| civicrecords-ai web | 23080 |
| civicclerk API | 23776 |
| civicclerk web | 23081 |
| civiccode API | 23820 |
| civiczone API | 23830 |
| civicplan API | 23840 |
| civicpermit API | 23850 |
| civicaccess API | 23860 |
| civicinspect API | 23861 |
| civicgrants API | 23862 |
| civicprocure API | 23863 |
| suite-launcher web | 18082 |

## Crash-Recovery Evidence

Full `host_ollama_model_load` check from readiness:

```json
{
  "selected_profile": "cpu_mmap_default",
  "returncode": 0,
  "status": "passed",
  "attempts": [
    {
      "options": null,
      "profile": "native_default",
      "returncode": 1,
      "stderr": "HTTP 500: {\"error\":\"llama-server reported out-of-memory during startup: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5831117920\\nalloc_tensor_range: failed to allocate CUDA_Host buffer of size 5831117920\\nerror loading model: unable to allocate CUDA_Host buffer\"}",
      "stop_orphan_servers": {
        "results": [
          {
            "command": [
              "taskkill",
              "/F",
              "/IM",
              "llama-server.exe"
            ],
            "returncode": 1,
            "stderr": "ERROR: The process \"llama-server.exe\" with PID 9592 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 13896 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 24320 could not be terminated.\nReason: Access is denied.\n\nERROR: The process \"llama-server.exe\" with PID 7304 could not be terminated.\nReason: Access is denied.\n\n",
            "stdout": ""
          },
          {
            "command": [
              "taskkill",
              "/F",
              "/IM",
              "ollama_llama_server.exe"
            ],
            "returncode": 128,
            "stderr": "ERROR: The process \"ollama_llama_server.exe\" not found.\n",
            "stdout": ""
          }
        ],
        "returncode": 1
      },
      "unload_returncode": 0,
      "unload_stderr": ""
    },
    {
      "options": {
        "num_gpu": 0,
        "use_mlock": false,
        "use_mmap": true
      },
      "profile": "cpu_mmap_default",
      "returncode": 0,
      "stderr": ""
    }
  ],
  "crash_cleanup": null,
  "managed_server_stop": null,
  "server_after_crash_restart": null,
  "release_after_probe": {
    "request": {
      "keep_alive": 0,
      "model": "gemma4:e4b",
      "prompt": "",
      "stream": false
    },
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T16:55:06.8746814Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  }
}
```

Crash-specific findings:

- `crash_detected=true` attempts: none.
- The prior `0xc0000409` crash did not recur.
- `crash_cleanup`: not present because no crash was detected.
- `managed_server_stop`: not present because no crash was detected.
- `server_after_crash_restart`: not present because no crash restart was needed.
- `release_after_probe`: present and returned `0` with `done_reason` `unload`.

Post-readiness diagnostics:

- Evidence file: `directive051-after-readiness.json`
- Free physical memory after readiness: `8124748` KB
- `ollama ps` after readiness: empty model table
- Port `11435` after readiness: listener PID `18840` plus transient closed/time-wait entries
- Port `18082` after readiness: no listener
- Isolated managed server process: `ollama.exe` PID `18840`, command `ollama serve`, working set `96518144`

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r27 --install-root installer\runtime\proven-suite-clean-machine-r27 --compose-project-suffix stage3a-proven-suite-clean-machine-r27 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Result:

- Exit code: `1`
- Evidence file: `directive051-install.out`
- Lifecycle path: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r27\clerk-core-installer-lifecycle.json`
- Lifecycle status: `failed`
- Started at: `2026-06-06T16:55:37.571721+00:00`
- Finished at: `2026-06-06T16:55:47.792704+00:00`
- Failure phase: source resolution before stack launch
- Docker containers after install failure: none

Install error:

```text
Missing source for civicaccess. Expected bundled source at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\modules\civicaccess or local checkout at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicaccess. Also failed to fetch source into install cache at C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\runtime\proven-suite-clean-machine-r27\source-cache\civicaccess: Failed to fetch source for civicaccess from https://github.com/CivicSuite/civicaccess/archive/9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3.zip: HTTP Error 404: Not Found
```

Post-install-failure diagnostics:

- Evidence file: `directive051-after-install-failure.json`
- Free physical memory after install failure: `7894708` KB
- `ollama ps` after install failure: empty model table
- Port `11435` after install failure: listener PID `18840` plus transient closed/time-wait entries
- Port `18082` after install failure: no listener
- Docker containers after install failure: none

Post-failure cleanup:

- Evidence file: `directive051-post-failure-cleanup.json`
- Stopped isolated `ollama.exe` PID `18840`.
- Ports `11435` and `18082` had no listeners after cleanup.

## Verify And CivicAccess Live Evidence

Verify was not run because install failed.

- Verify lifecycle path/status: not produced.
- Install provenance path: not produced.
- CivicAccess API port from lifecycle plan: `23860`
- CivicAccess launcher URL expected from runtime port map: `http://127.0.0.1:23860/civicaccess`
- Launcher config entry for CivicAccess: not produced because install failed before launcher config generation.
- Independent `GET /civicaccess`: not run because install failed.
- Independent `GET /civicaccess/staff`: not run because install failed.
- Independent `GET /api/v1/civicaccess/readiness`: not run because install failed.
- Independent `GET /api/v1/civicaccess/integration-contracts`: not run because install failed.
- Independent `POST /api/v1/civicaccess/review`: not run because install failed.
- Independent `GET /api/v1/civicaccess/reviews`: not run because install failed.
- Independent `POST /api/v1/civicaccess/reviews/{review_id}/records-export`: not run because install failed.
- Verify evidence `civicaccess_integration_contracts`: not produced.
- Live module route checks for all ten selected modules: not run because install failed.

## Final Verdict

FAILED install gate. Readiness passed and the `0xc0000409` crash from `TESTER-RESULT-050.md` did not recur, but the full CivicAccess suite integration gate cannot pass because install could not resolve source for `civicaccess` commit `9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3`.
