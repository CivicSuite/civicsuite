# Tester Directive 033 - rerun with host-Ollama CPU fallback

## Goal

Rerun the Stage 3A `proven-suite` clean-machine gate on the available 16 GB / VRAM Windows tester after builder commit `cc7b4f57a5c4e24809ff6a4dc41bb68ca48d05e7` added a bounded host-Ollama probe ladder:

- first attempt: `gpu_bounded` with `num_ctx=1024`
- fallback attempt: `cpu_bounded` with `num_ctx=1024` and `num_gpu=0`

`TESTER-RESULT-032.md` proved the bounded GPU-only HTTP probe still failed with a CUDA_Host allocation error. This directive tests whether the explicit CPU fallback lets the same host load `gemma4:e4b`, then continue install/verify/live-route proof.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `cc7b4f57a5c4e24809ff6a4dc41bb68ca48d05e7`
- Builder fix under test: `cc7b4f57a5c4e24809ff6a4dc41bb68ca48d05e7`
- Prior result to read: `test-comms/TESTER-RESULT-032.md`
- Expected result file: `test-comms/TESTER-RESULT-033.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `cc7b4f57a5c4e24809ff6a4dc41bb68ca48d05e7`.
4. Read `test-comms/TESTER-RESULT-032.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

8. Run repo-local readiness:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r9 --install-root installer\runtime\proven-suite-clean-machine-r9 --compose-project-suffix stage3a-proven-suite-clean-machine-r9 --port-offset 4900 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Inspect the readiness lifecycle report. It must include:
   - `ollama_model_resources`
   - `host_ollama_model_load`
   - `host_ollama_model_load.num_ctx=1024`
   - `host_ollama_model_load.keep_alive=30m`
   - `host_ollama_model_load.attempts`
   - `host_ollama_model_load.selected_profile`
10. If `host_ollama_model_load` fails, stop and report the exact stdout/stderr/fix steps for every attempt. Do not install.
11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r9 --install-root installer\runtime\proven-suite-clean-machine-r9 --compose-project-suffix stage3a-proven-suite-clean-machine-r9 --port-offset 4900 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r9-verify --install-root installer\runtime\proven-suite-clean-machine-r9 --compose-project-suffix stage3a-proven-suite-clean-machine-r9 --port-offset 4900 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-033.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-033.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-032.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, and Docker Desktop reported total memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including stdout/stderr, return code, `num_ctx`, `keep_alive`, `attempts`, and `selected_profile`,
- explicit confirmation whether `gpu_bounded` failed and whether `cpu_bounded` was attempted,
- if `cpu_bounded` passed, evidence that the passing request included `num_gpu=0`,
- source-cache evidence for all seven readiness modules if install is reached,
- install lifecycle path and status if readiness passed,
- install prewarm evidence, including selected host-Ollama profile and attempts,
- verify lifecycle path and status if install passed,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live route checks if verify passed,
- final gate verdict.

## Pass criteria

Pass only if readiness passes through a real host-Ollama HTTP generation with `gemma4:e4b`, then install, verify, launcher, and all ten live route checks pass.

If the CPU fallback still fails, report the exact blocker and do not mark the gate passed. If readiness passes but install/verify/live routes fail, report the exact failing phase and evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-033.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
