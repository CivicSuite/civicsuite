# Tester Result 052 - CivicAccess gate retry after source pin correction

## Verdict

FAILED at install.

The corrected CivicAccess source pin was proved reachable and resolved into the install cache/runtime source:

- Archive URL final status: `HTTP/1.1 200 OK`
- `source-cache/civicaccess/SOURCE_COMMIT.txt`: `9576dd579575fe6555f92590912c7686e3521b9f`
- `sources/civicaccess/SOURCE_COMMIT.txt`: `9576dd579575fe6555f92590912c7686e3521b9f`

Readiness passed with host Ollama on isolated port `11435`, using `cpu_mmap_default`. Install then failed later while installing `civicplan`, because GitHub returned `504 Gateway Time-out` for the CivicCore wheel.

```text
ERROR: HTTP error 504 while getting https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7
```

Verify and live CivicAccess API/UI checks were not run after install failed.

## Branch Truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Exact branch head tested: `47989b503cf6d5dcc9b18bddcb6eddc6d6fcb586`
- Required minimum head: `1ef35d970b9e209cf4c69449dab3105e27776eb5`
- Minimum head ancestry check: passed, `1ef35d970b9e209cf4c69449dab3105e27776eb5` is an ancestor of the checked-out head.
- Prior result read: `test-comms/TESTER-RESULT-051.md`, 326 lines.
- Expected result file written: `test-comms/TESTER-RESULT-052.md`

## Edit Discipline

- No source files edited.
- No generated artifacts edited.
- No `installer/modules.json` edits.
- No docs outside `test-comms` edited.
- No tests edited.
- `git diff --name-status` after install failure: empty.
- Only `test-comms/TESTER-RESULT-052.md` was staged for commit.

## Module Pin And Source Resolution

- `installer/modules.json` SHA256: `19A6D390BA6698EF622E53B396E0013D1647D537B7FA33A90122058431D9DC54`
- Confirmed `installer/modules.json` declares `civicaccess` source commit `9576dd579575fe6555f92590912c7686e3521b9f`.
- Archive URL checked: `https://github.com/CivicSuite/civicaccess/archive/9576dd579575fe6555f92590912c7686e3521b9f.zip`
- Archive URL result: final status line `HTTP/1.1 200 OK`, not 404.
- Bundled source path existed before install: `false`
- Sibling checkout path existed before install: `false`
- Install source-cache existed after install: `true`
- Runtime source existed after install: `true`
- Resolution source: GitHub archive, inferred from no bundled source, no sibling checkout, reachable archive URL, and populated install source cache.

Source commit list from `installer/modules.json` / install provenance:

| Module | Source commit |
| --- | --- |
| civicrecords-ai | `cddc4d2be856badfbc7c6bdd26917a34ef535677` |
| civicclerk | `af8b989a8d64ba709d1b204ec231364484619f7b` |
| civiccode | `a960bba0a2249d118b593dd61bee3a65a69a9d77` |
| civiczone | `8ffa001b22138a526684153448100fadd7de5fd7` |
| civicplan | `ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab` |
| civicpermit | `877a13642d82afaca276f7b7107e7ec6ddbab7d1` |
| civicaccess | `9576dd579575fe6555f92590912c7686e3521b9f` |
| civicinspect | `d8af9fb3972592637e1622318afbc474eb3aa491` |
| civicgrants | `05804d589bf7c58b4d5b8d88745772a8e910f34b` |
| civicprocure | `0aa998feab3736db071920e3869462598758c23d` |

Source evidence:

- Archive URL evidence file: `directive052-archive-url-check.json`
- Source-origin check evidence file: `directive052-source-origin-check.json`
- Source-cache path: `installer\runtime\proven-suite-clean-machine-r28\source-cache\civicaccess`
- Runtime source path: `installer\runtime\proven-suite-clean-machine-r28\sources\civicaccess`
- Source-cache `SOURCE_COMMIT.txt`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Runtime source `SOURCE_COMMIT.txt`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r28\civicsuite-install-provenance.json`

## Clean-Stack Teardown

Command:

```powershell
powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1
```

Result:

- Exit code: `0`
- Evidence file: `directive052-teardown.out`
- Cleanup evidence file: `directive052-teardown-and-stale-cleanup.json`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Ports before readiness cleanup: no listeners on `11435` or `18082`
- Stale `llama-server.exe` processes existed from host Ollama state, but not as listeners on the isolated port.

## Host Facts Before Readiness

Evidence file: `directive052-hostfacts-before-readiness.json`

- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- `Win32_ComputerSystem.HypervisorPresent`: `true`
- `Win32_Processor.VirtualizationFirmwareEnabled`: `false`
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `9595540` KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Ollama version: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty model table
- Port `11435` before readiness: no listener
- Port `18082` before readiness: no listener

Ollama/llama process state before readiness:

- `llama-server.exe` PID `9592`, working set `3686400`
- `llama-server.exe` PID `13896`, working set `3751936`
- `llama-server.exe` PID `24320`, working set `3715072`
- `llama-server.exe` PID `7304`, working set `95993856`
- `ollama app.exe` PID `2484`, working set `32751616`
- `ollama.exe` PID `6600`, working set `14159872`

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Result:

- Exit code: `0`
- Evidence file: `directive052-plan.out`
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r28 --install-root installer\runtime\proven-suite-clean-machine-r28 --compose-project-suffix stage3a-proven-suite-clean-machine-r28 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Result:

- Exit code: `0`
- Evidence file: `directive052-readiness.out` (UTF-16 PowerShell capture)
- Extracted summary: `directive052-extracted-summary.json`
- Lifecycle path at readiness time: `installer\reports\stage3a-proven-suite-clean-machine-r28\clerk-core-installer-lifecycle.json`
- Lifecycle status at readiness time: `passed`
- Started at: `2026-06-06T17:24:01.235695+00:00`
- Finished at: `2026-06-06T17:25:12.532885+00:00`

Full `host_ollama_model_load` evidence:

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
  "release_after_probe": {
    "returncode": 0,
    "stderr": "",
    "stdout": "{\"model\":\"gemma4:e4b\",\"created_at\":\"2026-06-06T17:25:12.5323502Z\",\"response\":\"\",\"done\":true,\"done_reason\":\"unload\"}"
  }
}
```

Crash-specific findings:

- `crash_detected=true` attempts: none.
- The prior `0xc0000409` crash did not recur.
- `release_after_probe`: present and returned `0` with `done_reason` `unload`.

Post-readiness diagnostics:

- Evidence file: `directive052-after-readiness.json`
- Free physical memory after readiness: `9774636` KB
- `ollama ps` after readiness: empty model table
- Port `11435` after readiness: listener PID `10088` plus transient closed/time-wait entries
- Port `18082` after readiness: no listener
- Isolated managed server process: `ollama.exe` PID `10088`, command `ollama serve`, working set `93466624`

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

## Install

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r28 --install-root installer\runtime\proven-suite-clean-machine-r28 --compose-project-suffix stage3a-proven-suite-clean-machine-r28 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Result:

- Exit code: `1`
- Evidence file: `directive052-install.out`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r28\clerk-core-installer-lifecycle.json`
- Lifecycle status: `failed`
- Started at: `2026-06-06T17:25:41.600350+00:00`
- Finished at: `2026-06-06T17:32:28.603594+00:00`
- Failure phase: `civicplan` `python_service_install_editable`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r28\civicsuite-install-provenance.json`

Single nonzero install step:

```text
module: civicplan
step: python_service_install_editable
returncode: 1
stderr:
  ERROR: HTTP error 504 while getting https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7
ERROR: Could not install requirement civiccore @ https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7 from https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7 (from civicplan==0.2.2) because of HTTP error 504 Server Error: Gateway Time-out for url: https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl for URL https://github.com/CivicSuite/civiccore/releases/download/v1.2.0/civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7
```

Post-install-failure diagnostics:

- Evidence file: `directive052-after-install-failure.json`
- Free physical memory after install failure: `4758484` KB
- `ollama ps` after install failure: empty model table
- Port `11435` after install failure: listener PID `10088`
- Port `18082` after install failure: no listener
- Partial Docker containers before cleanup:
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-code-api-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-code-postgres-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-clerk-frontend-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-clerk-api-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-clerk-redis-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-clerk-postgres-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-records-frontend-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-records-api-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-records-postgres-1`
  - `civicsuite-stage3a-proven-suite-clean-machine-r28-records-redis-1`

Post-failure cleanup:

- Evidence file: `directive052-post-failure-cleanup.json`
- Teardown exit code: `0`
- Stopped isolated `ollama.exe` PID `10088`.
- Docker containers after cleanup: none
- Ports `11435` and `18082` had no listeners after cleanup.

## Verify And CivicAccess Live Evidence

Verify was not run because install failed.

- Verify lifecycle path/status: not produced.
- CivicAccess API port from lifecycle plan: `23860`
- CivicAccess launcher URL expected from runtime port map: `http://127.0.0.1:23860/civicaccess`
- Launcher config entry for CivicAccess: not produced because install failed before suite launcher config completion.
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

FAILED install gate. The source pin correction was effective for CivicAccess: the corrected archive URL returned 200 and source cache/runtime source contain `SOURCE_COMMIT.txt` for `9576dd579575fe6555f92590912c7686e3521b9f`. The full CivicAccess suite integration gate still cannot pass because install failed later on `civicplan` dependency installation due to an HTTP 504 fetching the CivicCore wheel from GitHub.
