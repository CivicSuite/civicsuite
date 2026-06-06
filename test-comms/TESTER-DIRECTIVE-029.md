# Tester Directive 029 - qualifying-host proven-suite full clean-machine gate

## Goal

Run the remaining Stage 3A `proven-suite` clean-machine gate on a qualifying Windows host after `TESTER-RESULT-028.md` proved the low-memory fail-clean path.

`TESTER-RESULT-028.md` is green for the low-memory readiness criterion, but it does not complete the ship gate because install, verify, launcher, and live module routes were intentionally skipped on the 16 GB tester host. This directive is for a host that can actually run `gemma4:e4b`.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `2dd4aff37779dd0d1a0c6060e361b85f3430a68f`
- Latest builder fix under test: `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469`
- Prior result to read: `test-comms/TESTER-RESULT-028.md`
- Expected result file: `test-comms/TESTER-RESULT-029.md`

## Host qualification

Use a Windows 11 Pro or Enterprise host with:

- at least 24 GB physical RAM,
- Docker Desktop / WSL2 reporting at least 12 GB total memory,
- Docker Desktop running,
- Ollama present and usable,
- no OneDrive workspace path.

If no qualifying host is available, do not run install. Write `TESTER-RESULT-029.md` with verdict `BLOCKED - qualifying host unavailable`, including the host facts and exact missing qualification.

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `2dd4aff37779dd0d1a0c6060e361b85f3430a68f`.
4. Read `test-comms/TESTER-RESULT-028.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

8. Run repo-local readiness:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r5 --install-root installer\runtime\proven-suite-clean-machine-r5 --compose-project-suffix stage3a-proven-suite-clean-machine-r5 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. If readiness fails, stop and report the failed check. Do not run install.
10. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r5 --install-root installer\runtime\proven-suite-clean-machine-r5 --compose-project-suffix stage3a-proven-suite-clean-machine-r5 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

11. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r5-verify --install-root installer\runtime\proven-suite-clean-machine-r5 --compose-project-suffix stage3a-proven-suite-clean-machine-r5 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. Inspect the installed launcher config at `installer\runtime\proven-suite-clean-machine-r5\suite-launcher\civicsuite-launcher-config.json`.
13. Serve the installed launcher if needed and verify the launcher page plus all ten module links render nonblank pages.
14. Write `test-comms/TESTER-RESULT-029.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-029.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-028.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, Docker/Ollama presence, and Docker Desktop reported total memory,
- qualification verdict for 24 GB host RAM and 12 GB Docker/WSL memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- `ollama_model_memory` readiness check,
- source-cache evidence for all seven readiness modules,
- install lifecycle path and status if readiness passed,
- verify lifecycle path and status if install passed,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- live route evidence for:
  - CivicRecords AI,
  - CivicClerk,
  - CivicCode `/civiccode`,
  - CivicZone,
  - CivicPlan,
  - CivicPermit,
  - CivicAccess,
  - CivicInspect,
  - CivicGrants,
  - CivicProcure,
- expected not-ready blocker responses for readiness-only modules whose municipal databases are not configured,
- final gate verdict.

## Pass criteria

Pass only if a qualifying host runs readiness, install, verify, launcher, and all ten live route checks successfully.

If no qualifying host is available, report `BLOCKED - qualifying host unavailable`. Do not mark the Stage 3A full clean-machine gate passed.

## Constraints

Push only `test-comms/TESTER-RESULT-029.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
