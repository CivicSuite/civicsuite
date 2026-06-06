# Tester Directive 024 - clean-machine proven-suite local integration gate

## Goal

Run the Stage 3A `proven-suite` clean-machine integration gate against the current `stage-3a-baremetal-windows` branch head. This is a special repo-channel test because the standing Stage 3A customer-artifact loop exercises the four-module city-core artifact, while this slice adds the seven source-pinned readiness modules to the repo-local proven-suite profile.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `dae54864c3c3e17cbb65781ff65fdbf42fd0e20a`
- Required commit subject: `feat(installer): prove local suite readiness modules`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at least `dae54864c3c3e17cbb65781ff65fdbf42fd0e20a`.
4. Do not edit source, generated artifacts, `installer/modules.json`, docs, or tests.
5. Run the standard clean-stack teardown from `test-comms/README.md` before starting.
6. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

7. Run repo-local readiness for the ten selected proven-suite services:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r1 --install-root installer\runtime\proven-suite-clean-machine-r1 --compose-project-suffix stage3a-proven-suite-clean-machine-r1 --port-offset 5200 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

8. Run repo-local install for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r1 --install-root installer\runtime\proven-suite-clean-machine-r1 --compose-project-suffix stage3a-proven-suite-clean-machine-r1 --port-offset 5200 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Run repo-local verify for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r1-verify --install-root installer\runtime\proven-suite-clean-machine-r1 --compose-project-suffix stage3a-proven-suite-clean-machine-r1 --port-offset 5200 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

10. Inspect the installed launcher config at `installer\runtime\proven-suite-clean-machine-r1\suite-launcher\civicsuite-launcher-config.json` and confirm every listed URL uses the offset ports from the verify report, including `CivicCode` opening `/civiccode` rather than the API JSON root.
11. If the launcher server is not already running, serve the installed launcher on its configured port and verify the launcher page plus all ten module links render nonblank pages.
12. Write `test-comms/TESTER-RESULT-024.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-024.md` must include:

- exact branch head tested,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total memory, and whether Docker/Ollama were already present,
- `proven-suite` plan result and selected module list,
- readiness result path and status,
- install lifecycle result path and status,
- verify lifecycle result path and status,
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

- the tested head is at or after `dae54864c3c3e17cbb65781ff65fdbf42fd0e20a`,
- the proven-suite plan includes exactly city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect, CivicGrants, and CivicProcure,
- readiness, install, and verify all pass,
- install provenance matches the current `installer/modules.json` hash and source commits,
- every selected service returns the expected health/readiness behavior,
- the suite launcher serves,
- all ten launcher module URLs point to the live offset ports,
- CivicCode opens the HTML `/civiccode` surface, not the API root,
- no source edits or status promotions are made during the test run.

## Constraints

No source edits during the test run. Push only `test-comms/TESTER-RESULT-024.md`. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
