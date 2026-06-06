# Tester Directive 048 - persistent launcher full gate rerun

## Goal

Rerun the Stage 3A proven-suite clean-machine gate after builder commit `684b8f9eae75b5eda7db30d802241c1220307844` fixed the TESTER-RESULT-047 launcher persistence blocker.

`TESTER-RESULT-047.md` proved readiness, install, verify, and selected module routes, but the independent post-verify launcher check failed because verify had used a temporary `python_http_server` mode. This rerun must prove the installer starts the copied suite launcher as a persistent local process and verify requires that persistent listener.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `684b8f9eae75b5eda7db30d802241c1220307844`
- Builder fix under test: `684b8f9eae75b5eda7db30d802241c1220307844`
- Prior result to read: `test-comms/TESTER-RESULT-047.md`
- Expected result file: `test-comms/TESTER-RESULT-048.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `684b8f9eae75b5eda7db30d802241c1220307844`.
4. Read `test-comms/TESTER-RESULT-047.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Record host facts, default-port stale `llama-server` state, port `11435` state, port `18082` state, `ollama ps`, and available physical memory before readiness.
8. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

9. Run repo-local readiness with isolated host-Ollama port `11435`:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r24 --install-root installer\runtime\proven-suite-clean-machine-r24 --compose-project-suffix stage3a-proven-suite-clean-machine-r24 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

10. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics.
11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r24 --install-root installer\runtime\proven-suite-clean-machine-r24 --compose-project-suffix stage3a-proven-suite-clean-machine-r24 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r24-verify --install-root installer\runtime\proven-suite-clean-machine-r24 --compose-project-suffix stage3a-proven-suite-clean-machine-r24 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-048.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-048.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-047.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness,
- default-port stale `llama-server` process state before readiness,
- port `11435` listener state before readiness,
- port `18082` listener state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full readiness `host_ollama_model_load` check,
- selected profile, attempts, `release_after_probe`, and memory after release if readiness reaches host-Ollama probing,
- install lifecycle path and status if readiness passed,
- install lifecycle evidence for `suite_launcher_start`, including status, mode, URL, pid if started, stdout/stderr log paths, and content marker status,
- install prewarm evidence for records and clerk if install reached,
- evidence that records prewarm released the model and clerk reused prior host-Ollama proof if install reached those steps,
- source-cache evidence for all selected readiness modules if install reached,
- runtime host-Ollama compose evidence showing `http://host.docker.internal:11435` if install reached,
- if install/verify fails, exact failing step and memory/process diagnostics,
- if install passes, verify lifecycle path and status,
- verify `suite_launcher_http` evidence proving `mode=persistent_launcher`, `status=passed`, URL `http://127.0.0.1:18082/`, and content marker present,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- independent post-verify live launcher URL evidence for `http://127.0.0.1:18082/`,
- independent post-verify port `18082` listener state showing an active listener, not only `TIME_WAIT`,
- ten live module route checks if verify passed,
- final gate verdict.

## Pass criteria

Pass only if readiness passes through real host-Ollama HTTP generation with `gemma4:e4b`, install passes, `suite_launcher_start` passes, verify passes with `suite_launcher_http.mode=persistent_launcher`, the independent post-verify launcher URL returns 200, port `18082` has an active listener after verify, and all ten live module route checks pass.

If any phase fails, report the exact failing phase and evidence. Do not mark the full gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-048.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
