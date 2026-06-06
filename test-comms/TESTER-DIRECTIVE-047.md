# Tester Directive 047 - free-memory floor and full gate rerun

## Goal

Rerun the Stage 3A proven-suite clean-machine gate after builder commit `54bd0986c5f949fd4d8d5c971e59dccca13c252c` added an available-RAM floor before host-Ollama model loading.

`TESTER-RESULT-046.md` began readiness with only about 3.7 GB free RAM, so all `gemma4:e4b` profiles failed before the readiness release/proof-reuse fix could be exercised. This directive must prove the installer either:

- fails fast before model probing when free RAM is below 6 GB, with clear evidence, or
- runs the full gate when free RAM is at or above 6 GB before readiness.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `54bd0986c5f949fd4d8d5c971e59dccca13c252c`
- Builder fix under test: `54bd0986c5f949fd4d8d5c971e59dccca13c252c`
- Prior result to read: `test-comms/TESTER-RESULT-046.md`
- Expected result file: `test-comms/TESTER-RESULT-047.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `54bd0986c5f949fd4d8d5c971e59dccca13c252c`.
4. Read `test-comms/TESTER-RESULT-046.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Record host facts, default-port stale `llama-server` state, port `11435` state, `ollama ps`, and available physical memory before readiness.
8. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

9. Run repo-local readiness with isolated host-Ollama port `11435`:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r23 --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

10. If readiness fails because available RAM is below the floor, stop and report that as a **blocked-by-host-memory** result, not a code failure. Do not run install.
11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r23 --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r23-verify --install-root installer\runtime\proven-suite-clean-machine-r23 --compose-project-suffix stage3a-proven-suite-clean-machine-r23 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-047.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-047.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-046.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness,
- default-port stale `llama-server` process state before readiness,
- port `11435` listener state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full readiness `host_ollama_model_load` check,
- if readiness failed on the new free-memory guard: `detected_available_memory_bytes`, `required_available_memory_bytes`, `attempts=[]`, `server=null`, and the fix steps,
- if readiness passed: selected profile, attempts, `release_after_probe`, and memory after release,
- install lifecycle path and status if readiness passed,
- install prewarm evidence for records and clerk if install reached,
- evidence that records prewarm released the model and clerk reused prior host-Ollama proof if install reached those steps,
- source-cache evidence for all seven readiness modules if install reached,
- runtime host-Ollama compose evidence showing `http://host.docker.internal:11435` if install reached,
- if install/verify fails, exact failing step and memory/process diagnostics,
- if install passes, verify lifecycle path and status,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live route checks if verify passed,
- final gate verdict.

## Pass criteria

Pass only if readiness passes through real host-Ollama HTTP generation with `gemma4:e4b`, install passes, verify passes, launcher serves, and all ten live route checks pass.

If the free-memory floor fails before model probing, mark the result **blocked-by-host-memory** and include the required evidence. If any later phase fails, report the exact failing phase and evidence. Do not mark the full gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-047.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
