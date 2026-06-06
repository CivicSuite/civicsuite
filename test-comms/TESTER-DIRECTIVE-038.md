# Tester Directive 038 - elevated or reboot-clean host-Ollama rerun

## Goal

Rerun the Stage 3A host-Ollama readiness gate after builder commit `a7a06c82b2f1ce02bce0c925820477f3265a5484` made the installer fail fast when stale `llama-server` workers cannot be terminated due to Windows access denial.

`TESTER-RESULT-037.md` proved the previous non-elevated run could not terminate stale `llama-server.exe` processes. This directive must run from one of these valid host states:

- elevated Windows context that can terminate stale `llama-server.exe` workers, or
- freshly rebooted host with no stale `llama-server.exe` workers before readiness.

Do not rerun the expensive model ladder while stale inaccessible workers remain.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `a7a06c82b2f1ce02bce0c925820477f3265a5484`
- Builder fix under test: `a7a06c82b2f1ce02bce0c925820477f3265a5484`
- Prior result to read: `test-comms/TESTER-RESULT-037.md`
- Expected result file: `test-comms/TESTER-RESULT-038.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `a7a06c82b2f1ce02bce0c925820477f3265a5484`.
4. Read `test-comms/TESTER-RESULT-037.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Establish either an elevated shell or a reboot-clean host state before readiness.
7. Before readiness, record whether any `llama-server` or `ollama_llama_server` processes exist.
8. Run the standard clean-stack teardown from `test-comms/README.md`.
9. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

10. Run repo-local readiness:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r14 --install-root installer\runtime\proven-suite-clean-machine-r14 --compose-project-suffix stage3a-proven-suite-clean-machine-r14 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

11. Inspect the readiness lifecycle report. It must include:
   - `ollama_model_resources`
   - `host_ollama_model_load`
   - `host_ollama_model_load.initial_cleanup`
   - `host_ollama_model_load.attempts`
   - `host_ollama_model_load.selected_profile`
12. If readiness fails because initial cleanup reports access denied, stop and report that as an elevation/reboot-clean prerequisite failure. Do not install.
13. If `host_ollama_model_load` fails after successful initial cleanup, stop and report exact stdout/stderr/fix steps for every attempt. Also include diagnostics listed below. Do not install.
14. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r14 --install-root installer\runtime\proven-suite-clean-machine-r14 --compose-project-suffix stage3a-proven-suite-clean-machine-r14 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

15. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r14-verify --install-root installer\runtime\proven-suite-clean-machine-r14 --compose-project-suffix stage3a-proven-suite-clean-machine-r14 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

16. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
17. Write `test-comms/TESTER-RESULT-038.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-038.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-037.md` was read,
- whether the run used elevated context or reboot-clean state,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness,
- stale `llama-server` / `ollama_llama_server` process state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including stdout/stderr, return code, `initial_cleanup`, `attempts`, and `selected_profile`,
- explicit verdict on whether initial cleanup was blocked by access denied,
- source-cache evidence for all seven readiness modules if install is reached,
- install lifecycle path and status if readiness passed,
- install prewarm evidence, including selected host-Ollama profile and cleanup/attempts,
- verify lifecycle path and status if install passed,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live route checks if verify passed,
- final gate verdict.

## Required diagnostics if readiness fails

If readiness fails, include:

- `ollama --version` output,
- `ollama list` output for `gemma4:e4b`,
- `ollama ps` output before and after readiness,
- available physical memory before readiness and after failure,
- top memory-consuming processes after failure,
- Docker Desktop reported memory after failure,
- whether any `ollama_llama_server` or `llama-server` process remains after failure.

## Pass criteria

Pass only if readiness passes through a real host-Ollama HTTP generation with `gemma4:e4b`, then install, verify, launcher, and all ten live route checks pass.

If initial cleanup is blocked by access denied, report the elevation/reboot-clean prerequisite failure and do not mark the gate passed. If readiness passes but install/verify/live routes fail, report the exact failing phase and evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-038.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
