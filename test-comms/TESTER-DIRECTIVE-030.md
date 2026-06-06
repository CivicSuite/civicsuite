# Tester Directive 030 - qualifying-host gate after memory-floor docs/artifact refresh

## Goal

Continue the Stage 3A `proven-suite` clean-machine gate after commit `e24a18cf64d4b27af22c6110dcda7a4e659b176e` synchronized the planner, package docs, operator docs, and artifact hashes with the proven `gemma4:e4b` memory floor.

`TESTER-RESULT-029.md` reported that the available tester machine has 16 GB host RAM and about 7.68 GiB Docker Desktop memory. That host also has 8 GB dedicated VRAM, but prior live evidence showed `gemma4:e4b` still failed on that machine with a `CUDA_Host` allocation error. Treat that host as non-qualifying unless the branch readiness check itself reports passed on the current head.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `e24a18cf64d4b27af22c6110dcda7a4e659b176e`
- Latest builder/doc fix under test: `e24a18cf64d4b27af22c6110dcda7a4e659b176e`
- Prior result to read: `test-comms/TESTER-RESULT-029.md`
- Expected result file: `test-comms/TESTER-RESULT-030.md`

## Host qualification

Use a Windows 11 Pro or Enterprise host with:

- at least 24 GB physical host RAM,
- Docker Desktop / WSL2 reporting at least 12 GB total memory,
- Docker Desktop running,
- Ollama present and usable,
- no OneDrive workspace path.

Dedicated VRAM does not replace the host RAM requirement for this gate because the observed blocker was `CUDA_Host` pinned host-memory allocation during `gemma4:e4b` load.

If no qualifying host is available, do not run install. Write `TESTER-RESULT-030.md` with verdict `BLOCKED - qualifying host unavailable`, including the host facts and exact missing qualification.

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `e24a18cf64d4b27af22c6110dcda7a4e659b176e`.
4. Read `test-comms/TESTER-RESULT-029.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md` only if the host qualifies.
7. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

8. Run repo-local readiness:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r6 --install-root installer\runtime\proven-suite-clean-machine-r6 --compose-project-suffix stage3a-proven-suite-clean-machine-r6 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. If readiness fails, stop and report the failed check. Do not run install.
10. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r6 --install-root installer\runtime\proven-suite-clean-machine-r6 --compose-project-suffix stage3a-proven-suite-clean-machine-r6 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

11. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r6-verify --install-root installer\runtime\proven-suite-clean-machine-r6 --compose-project-suffix stage3a-proven-suite-clean-machine-r6 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. If install and verify pass, inspect launcher config and live routes as in `TESTER-DIRECTIVE-029.md`.
13. Write `test-comms/TESTER-RESULT-030.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-030.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-029.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, and Docker Desktop reported total memory,
- qualification verdict for 24 GB host RAM and 12 GB Docker/WSL memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status if run,
- `ollama_model_memory` readiness check if run,
- source-cache evidence for all seven readiness modules if install is reached,
- install lifecycle path and status if readiness passed,
- verify lifecycle path and status if install passed,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live module route checks if verify passed,
- final gate verdict.

## Pass criteria

Pass only if a qualifying host runs readiness, install, verify, launcher, and all ten live route checks successfully.

If no qualifying host is available, report `BLOCKED - qualifying host unavailable`. Do not mark the Stage 3A full clean-machine gate passed.

## Constraints

Push only `test-comms/TESTER-RESULT-030.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
