# Tester Directive 045 - host-Ollama release after prewarm full gate rerun

## Goal

Rerun the Stage 3A proven-suite clean-machine gate after builder commit `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea` added host-Ollama model release after successful prewarm.

`TESTER-RESULT-044.md` proved `cpu_mmap_default` passes readiness and install prewarm, then install failed later when `civicpermit` editable install hit `MemoryError` while the CPU-loaded `gemma4:e4b` worker occupied about 5.86 GB. This directive must prove the installer records the prewarm proof, unloads the host model before memory-heavy Python service installs, and continues the full install/verify/live-route gate.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea`
- Builder fix under test: `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea`
- Prior result to read: `test-comms/TESTER-RESULT-044.md`
- Expected result file: `test-comms/TESTER-RESULT-045.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `ff4ce38e1d5e0095493ad0bc54d6dec39dbb28ea`.
4. Read `test-comms/TESTER-RESULT-044.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Record default-port stale `llama-server` state before readiness, but do not require cleanup of port `11434`.
7. Confirm port `11435` is not already listening before readiness, or record the process if it is.
8. Run the standard clean-stack teardown from `test-comms/README.md`.
9. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

10. Run repo-local readiness with isolated host-Ollama port `11435`:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r21 --install-root installer\runtime\proven-suite-clean-machine-r21 --compose-project-suffix stage3a-proven-suite-clean-machine-r21 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r21 --install-root installer\runtime\proven-suite-clean-machine-r21 --compose-project-suffix stage3a-proven-suite-clean-machine-r21 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r21-verify --install-root installer\runtime\proven-suite-clean-machine-r21 --compose-project-suffix stage3a-proven-suite-clean-machine-r21 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-045.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-045.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-044.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness and before Python service installs,
- default-port stale `llama-server` process state before readiness,
- port `11435` listener state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full readiness `host_ollama_model_load` check, including selected profile and attempts,
- install lifecycle path and status,
- install prewarm evidence for records and clerk,
- explicit `host_ollama_release_model_after_prewarm` evidence for every host-Ollama prewarm target, including status, return code, stdout/stderr, and whether the step occurred before Python service install steps,
- `ollama ps` after release and before Python service install steps, if possible,
- memory before and after release, if possible,
- source-cache evidence for all seven readiness modules,
- runtime host-Ollama compose evidence showing `http://host.docker.internal:11435`,
- if install fails, exact failing step and memory/process diagnostics,
- if install passes, verify lifecycle path and status,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live route checks if verify passed,
- final gate verdict.

## Required diagnostics if install fails again

If install fails, include:

- exact failing lifecycle step,
- whether `host_ollama_release_model_after_prewarm` ran and passed before the failure,
- `ollama ps` after failure,
- port `11435` listener state after failure,
- available physical memory before install, before Python service install steps if known, and after failure,
- top memory-consuming processes after failure,
- Docker Desktop reported memory after failure,
- whether any `ollama_llama_server` or `llama-server` process remains after failure.

## Pass criteria

Pass only if readiness passes through real host-Ollama HTTP generation with `gemma4:e4b`, install passes, verify passes, launcher serves, and all ten live route checks pass.

If readiness/install/verify/live routes fail, report the exact failing phase and evidence. Do not mark the gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-045.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
