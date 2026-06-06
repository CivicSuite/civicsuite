# Tester Directive 034 - rerun with low-memory host-Ollama probe ladder

## Goal

Rerun the Stage 3A `proven-suite` clean-machine gate on the available 16 GB / VRAM Windows tester after builder commit `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce` expanded the host-Ollama `gemma4:e4b` probe ladder and unloads failed profiles before trying the next one.

`TESTER-RESULT-033.md` proved:

- `gpu_bounded` failed with CUDA_Host allocation.
- `cpu_bounded` was attempted with `num_gpu=0`.
- `cpu_bounded` failed with CPU_REPACK allocation.

This directive tests the new four-profile ladder:

1. `gpu_bounded`: `num_ctx=1024`
2. `gpu_low_vram`: `num_ctx=1024`, `low_vram=true`
3. `cpu_bounded`: `num_ctx=1024`, `num_gpu=0`
4. `cpu_small_context`: `num_ctx=512`, `num_gpu=0`

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce`
- Builder fix under test: `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce`
- Prior result to read: `test-comms/TESTER-RESULT-033.md`
- Expected result file: `test-comms/TESTER-RESULT-034.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `58a6a2a5c2b327fa592bb68c9d72bb10877b75ce`.
4. Read `test-comms/TESTER-RESULT-033.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

8. Run repo-local readiness:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r10 --install-root installer\runtime\proven-suite-clean-machine-r10 --compose-project-suffix stage3a-proven-suite-clean-machine-r10 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Inspect the readiness lifecycle report. It must include:
   - `ollama_model_resources`
   - `host_ollama_model_load`
   - `host_ollama_model_load.num_ctx=1024`
   - `host_ollama_model_load.small_num_ctx=512`
   - `host_ollama_model_load.keep_alive=30m`
   - `host_ollama_model_load.attempts`
   - `host_ollama_model_load.selected_profile`
10. If `host_ollama_model_load` fails, stop and report the exact stdout/stderr/fix steps for every attempt. Do not install.
11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r10 --install-root installer\runtime\proven-suite-clean-machine-r10 --compose-project-suffix stage3a-proven-suite-clean-machine-r10 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r10-verify --install-root installer\runtime\proven-suite-clean-machine-r10 --compose-project-suffix stage3a-proven-suite-clean-machine-r10 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-034.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-034.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-033.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, and Docker Desktop reported total memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including stdout/stderr, return code, `num_ctx`, `small_num_ctx`, `keep_alive`, `attempts`, and `selected_profile`,
- for each failed profile, evidence that an unload attempt was recorded before the next profile,
- explicit confirmation whether `gpu_low_vram` was attempted and whether its request included `low_vram=true`,
- explicit confirmation whether `cpu_small_context` was attempted and whether its request included `num_ctx=512` and `num_gpu=0`,
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

If all four profiles fail, report the exact blocker and do not mark the gate passed. If readiness passes but install/verify/live routes fail, report the exact failing phase and evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-034.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
