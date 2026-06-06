# Tester Directive 028 - rerun after gemma4:e4b memory readiness gate

## Goal

Rerun the Stage 3A `proven-suite` clean-machine gate after builder commit `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469` fixed the blocker found in `TESTER-RESULT-027.md`.

`TESTER-RESULT-027.md` proved the source-cache fix worked, then exposed the next defect: lifecycle readiness passed on a tester host where install later failed loading `gemma4:e4b` because Ollama could not allocate a 5,831,117,920 byte CUDA_Host buffer. Readiness must now fail before install on hosts below the model memory floor, with clear fix steps.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469`
- Builder fix under test: `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469`
- Prior blocked result: `test-comms/TESTER-RESULT-027.md`
- Expected result file: `test-comms/TESTER-RESULT-028.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469`.
4. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
5. Run the standard clean-stack teardown from `test-comms/README.md` before starting.
6. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

7. Run repo-local readiness for the ten selected proven-suite services:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r4 --install-root installer\runtime\proven-suite-clean-machine-r4 --compose-project-suffix stage3a-proven-suite-clean-machine-r4 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

8. Inspect the readiness lifecycle report at `installer\reports\stage3a-proven-suite-clean-machine-r4\clerk-core-installer-lifecycle.json`.
9. If readiness fails with `ollama_model_memory`, do not run install or verify on that host. This is the expected fail-clean result for a host below the memory floor.
10. If readiness passes because the tester host has at least 24 GB host RAM and at least 12 GB Docker/WSL memory, continue with install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r4 --install-root installer\runtime\proven-suite-clean-machine-r4 --compose-project-suffix stage3a-proven-suite-clean-machine-r4 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

11. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r4-verify --install-root installer\runtime\proven-suite-clean-machine-r4 --compose-project-suffix stage3a-proven-suite-clean-machine-r4 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. If install and verify pass, inspect launcher config and live routes as in `TESTER-DIRECTIVE-027.md`.
13. Write `test-comms/TESTER-RESULT-028.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-028.md` must include:

- exact branch head tested,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, Docker/Ollama presence, and Docker Desktop reported total memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- the full `ollama_model_memory` readiness check, including:
  - `detected_host_memory_bytes`,
  - `required_host_memory_bytes`,
  - `required_host_memory_gb`,
  - `detected_docker_memory_bytes`,
  - `required_docker_memory_bytes`,
  - `required_docker_memory_gb`,
  - `fix_steps`,
- whether install was correctly skipped because readiness failed,
- if readiness passed on a qualifying host, install lifecycle path/status,
- if install passed, verify lifecycle path/status,
- if verify passed, launcher URL evidence and ten live module route checks,
- final verdict.

## Pass criteria

Pass this directive if either:

1. On the current low-memory tester host, readiness fails before install with `ollama_model_memory`, clear fix steps, and install/verify are not run.
2. On a qualifying host with at least 24 GB host RAM and at least 12 GB Docker/WSL memory, readiness passes and the full install/verify/launcher/module-route gate passes.

Fail if readiness passes on a host with less than 24 GB host RAM or less than 12 GB Docker/WSL memory.

## Constraints

Push only `test-comms/TESTER-RESULT-028.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
