# Tester Directive 027 - rerun proven-suite clean-machine gate after source-fetch fix

## Goal

Rerun the Stage 3A `proven-suite` clean-machine integration gate after builder commit `f19a12591c961803648ed4e1a642ff4338e912ce` fixed the clean-machine missing-source blocker reported in `TESTER-RESULT-025.md` and corrected in `TESTER-RESULT-026.md`.

The installer now stages missing selected module sources into the install root source cache from the pinned GitHub source commits declared in `installer/modules.json`. This rerun must prove that behavior on the clean Windows tester machine and then complete install, verify, launcher, and module-route evidence.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `f19a12591c961803648ed4e1a642ff4338e912ce`
- Builder fix under test: `f19a12591c961803648ed4e1a642ff4338e912ce`
- Prior blocked result: `test-comms/TESTER-RESULT-026.md`
- Expected result file: `test-comms/TESTER-RESULT-027.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `f19a12591c961803648ed4e1a642ff4338e912ce`.
4. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
5. Run the standard clean-stack teardown from `test-comms/README.md` before starting.
6. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

7. Run repo-local readiness for the ten selected proven-suite services:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r3 --install-root installer\runtime\proven-suite-clean-machine-r3 --compose-project-suffix stage3a-proven-suite-clean-machine-r3 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

8. Run repo-local install for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r3 --install-root installer\runtime\proven-suite-clean-machine-r3 --compose-project-suffix stage3a-proven-suite-clean-machine-r3 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Run repo-local verify for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r3-verify --install-root installer\runtime\proven-suite-clean-machine-r3 --compose-project-suffix stage3a-proven-suite-clean-machine-r3 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

10. Inspect `installer\runtime\proven-suite-clean-machine-r3\source-cache\` and record whether the installer fetched/staged these missing clean-machine module sources:
    - `civiczone`
    - `civicplan`
    - `civicpermit`
    - `civicaccess`
    - `civicinspect`
    - `civicgrants`
    - `civicprocure`
11. For each staged source-cache module, record whether `SOURCE_COMMIT.txt` exists and matches the source commit declared for that module in `installer/modules.json`.
12. Inspect the installed launcher config at `installer\runtime\proven-suite-clean-machine-r3\suite-launcher\civicsuite-launcher-config.json` and confirm every listed URL uses the offset ports from the verify report, including `CivicCode` opening `/civiccode` rather than the API JSON root.
13. If the launcher server is not already running, serve the installed launcher on its configured port and verify the launcher page plus all ten module links render nonblank pages.
14. Write `test-comms/TESTER-RESULT-027.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-027.md` must include:

- exact branch head tested,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total memory, and whether Docker/Ollama were already present,
- `proven-suite` plan result and selected module list,
- readiness result path and status,
- install lifecycle result path and status,
- verify lifecycle result path and status,
- source-cache evidence for all seven previously missing modules,
- `SOURCE_COMMIT.txt` match/mismatch evidence for every fetched/staged source-cache module,
- install provenance path, `installer/modules.json` hash, and source commits,
- launcher config module URLs,
- live launcher URL evidence,
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

Pass only if:

- the tested head is at or after `f19a12591c961803648ed4e1a642ff4338e912ce`,
- the proven-suite plan includes exactly city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect, CivicGrants, and CivicProcure,
- readiness, install, and verify all pass,
- the seven previously missing selected module sources are available in `installer\runtime\proven-suite-clean-machine-r3\source-cache\`,
- every fetched/staged source cache has a matching `SOURCE_COMMIT.txt`,
- install provenance matches the current `installer/modules.json` hash and source commits,
- every selected service returns the expected health/readiness behavior,
- the suite launcher serves,
- all ten launcher module URLs point to the live offset ports,
- CivicCode opens the HTML `/civiccode` surface, not the API root,
- no source edits or status promotions are made during the test run.

## Constraints

Push only `test-comms/TESTER-RESULT-027.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
