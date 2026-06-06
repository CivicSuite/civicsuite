# Tester Result 050 - CivicAccess standalone and suite integration gate

## Verdict

FAILED at readiness. The clean-stack proven-suite gate did not reach install or verify because the repo-local readiness run failed at `host_ollama_model_load`.

Readiness blocker:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application."}
```

Per `TESTER-DIRECTIVE-050.md`, I stopped after readiness failed and did not run install, verify, CivicAccess UI/API workflow checks, or route checks.

## Branch Truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Exact branch head tested: `257e994bdb8ea65803f003f7d3a8d3330c35b2eb`
- Required minimum head: `3ef6eb587a49355d34bf1bb36716ab8adc4948ee`
- Minimum head ancestry check: passed, `3ef6eb587a49355d34bf1bb36716ab8adc4948ee` is an ancestor of the checked-out head.
- Prior result read: `test-comms/TESTER-RESULT-049.md` read, 423 lines.
- Expected result file written: `test-comms/TESTER-RESULT-050.md`

## Edit Discipline

- No source files edited.
- No generated artifacts edited.
- No `installer/modules.json` edits.
- No docs outside `test-comms` edited.
- No tests edited.
- `git diff --name-status` after readiness failure: empty.
- Only this result file was staged for commit.

The worktree had pre-existing untracked scratch/runtime evidence from prior tester runs plus new untracked directive 050 evidence files. These were not staged.

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
- Evidence file: `directive050-teardown.out`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Docker networks after teardown: `bridge`, `host`, `none`

Before final pre-readiness capture, stale prior-run listeners were found and stopped:

- `127.0.0.1:11435` owned by `ollama.exe` PID `2504`
- `127.0.0.1:18082` owned by `python.exe` PID `22456`, command line `python.exe -m http.server 18082 --bind 127.0.0.1`

Cleanup evidence: `directive050-stale-process-cleanup.json`. After cleanup, both ports were free before readiness.

## Host Facts Before Readiness

Evidence file: `directive050-hostfacts-before-readiness.json`

- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- `Win32_ComputerSystem.HypervisorPresent`: `true`
- `Win32_Processor.VirtualizationFirmwareEnabled`: `false`
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `5302256` KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Ollama version: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty model table
- Port `11435` before readiness: no listener
- Port `18082` before readiness: no listener

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Result:

- Exit code: `0`
- Evidence file: `directive050-plan.out`
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r26 --install-root installer\runtime\proven-suite-clean-machine-r26 --compose-project-suffix stage3a-proven-suite-clean-machine-r26 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

Result:

- Exit code: `1`
- Evidence file: `directive050-readiness.out`
- Lifecycle path: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r26\clerk-core-installer-lifecycle.json`
- Lifecycle status: `failed`
- Started at: `2026-06-06T16:31:02.482577+00:00`
- Finished at: `2026-06-06T16:33:27.598883+00:00`
- Failed check: `host_ollama_model_load`
- Failed check return code: `1`
- Selected profile: null

Lifecycle failed-check stderr:

```text
HTTP 500: {"error":"llama-server process has terminated: exit status 0xc0000409: The system detected an overrun of a stack-based buffer in this application. This overrun could potentially allow a malicious user to gain control of this application."}
```

Readiness server evidence:

- Isolated host-Ollama server mode: `started`
- Isolated host-Ollama PID: `11168`
- Isolated host-Ollama port: `11435`
- `/api/tags` probes initially timed out, then passed and listed `gemma4:e4b` and `nomic-embed-text:latest`.
- Model unload request returned code `0`, with `done_reason` `unload`.
- The readiness lifecycle reported `release_after_probe`: null because model load failed.

Readiness port map from lifecycle:

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

## Diagnostics After Readiness Failure

Evidence file: `directive050-after-readiness-failure.json`

- Free physical memory after readiness failure: `7711980` KB
- `ollama ps` after readiness failure: empty model table
- Port `18082` after readiness failure: no listener
- Port `11435` after readiness failure: listener PID `11168` plus transient closed/time-wait entries
- Ollama-related processes after readiness failure:
  - `llama-server.exe` PID `9592`, working set `3592192`
  - `llama-server.exe` PID `13896`, working set `3883008`
  - `llama-server.exe` PID `24320`, working set `3055616`
  - `llama-server.exe` PID `7304`, working set `136970240`
  - `ollama app.exe` PID `2484`, working set `22417408`
  - `ollama.exe` PID `6600`, working set `7200768`
  - isolated `ollama.exe` PID `11168`, command `ollama serve`, working set `97759232`

Post-failure cleanup:

- Stopped isolated `ollama.exe` PID `11168`.
- Cleanup evidence file: `directive050-post-failure-cleanup.json`
- Port `18082` remained clear.
- Port `11435` had no listener after cleanup, only transient closed/time-wait entries.

## Install, Verify, And CivicAccess Evidence

Install was not run because readiness failed.

- Install lifecycle path/status: not produced.
- Verify lifecycle path/status: not produced.
- Install provenance path: not produced.
- CivicAccess API port from readiness plan: `23860`
- CivicAccess launcher URL expected from offset runtime: `http://127.0.0.1:23860/civicaccess`
- Launcher config entry for CivicAccess: not produced because install did not run.
- Independent `GET /civicaccess`: not run because install did not run.
- Independent `GET /civicaccess/staff`: not run because install did not run.
- Independent `GET /api/v1/civicaccess/readiness`: not run because install did not run.
- Independent `GET /api/v1/civicaccess/integration-contracts`: not run because install did not run.
- Independent `POST /api/v1/civicaccess/review`: not run because install did not run.
- Independent `GET /api/v1/civicaccess/reviews`: not run because install did not run.
- Independent `POST /api/v1/civicaccess/reviews/{review_id}/records-export`: not run because install did not run.
- Verify evidence `civicaccess_integration_contracts`: not produced because verify did not run.
- Live module route checks for all ten selected modules: not run because install did not run.

## Final Verdict

FAILED readiness gate. The CivicAccess suite integration gate cannot be marked passed because the required proven-suite readiness phase failed while loading `gemma4:e4b` through isolated host Ollama on port `11435`.
