# Tester Directive 025 - clean-machine proven-suite local integration gate retry

## Goal

Retry the Stage 3A `proven-suite` clean-machine integration gate after `TESTER-RESULT-024.md` exposed a directive-only blocker: directive 024 used `--port-offset 5200`, but the installer CLI correctly rejects offsets above `5000`. This directive is identical in intent and evidence requirements, but uses `--port-offset 4800`.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `44e586a9e5708d688b624326d12fd4147cc63ef9`
- Prior blocked result: `test-comms/TESTER-RESULT-024.md`
- Reason for retry: directive command validation failure only; no source failure was reached.

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at least `44e586a9e5708d688b624326d12fd4147cc63ef9`.
4. Do not edit source, generated artifacts, `installer/modules.json`, docs, or tests.
5. Run the standard clean-stack teardown from `test-comms/README.md` before starting.
6. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

7. Run repo-local readiness for the ten selected proven-suite services:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r2 --install-root installer\runtime\proven-suite-clean-machine-r2 --compose-project-suffix stage3a-proven-suite-clean-machine-r2 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

8. Run repo-local install for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r2 --install-root installer\runtime\proven-suite-clean-machine-r2 --compose-project-suffix stage3a-proven-suite-clean-machine-r2 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Run repo-local verify for the same selected services:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r2-verify --install-root installer\runtime\proven-suite-clean-machine-r2 --compose-project-suffix stage3a-proven-suite-clean-machine-r2 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

10. Inspect the installed launcher config at `installer\runtime\proven-suite-clean-machine-r2\suite-launcher\civicsuite-launcher-config.json` and confirm every listed URL uses the offset ports from the verify report, including `CivicCode` opening `/civiccode` rather than the API JSON root.
11. If the launcher server is not already running, serve the installed launcher on its configured port and verify the launcher page plus all ten module links render nonblank pages.
12. Write `test-comms/TESTER-RESULT-025.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-025.md` must include:

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

- the tested head is at or after `44e586a9e5708d688b624326d12fd4147cc63ef9`,
- the proven-suite plan includes exactly city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect, CivicGrants, and CivicProcure,
- readiness, install, and verify all pass,
- install provenance matches the current `installer/modules.json` hash and source commits,
- every selected service returns the expected health/readiness behavior,
- the suite launcher serves,
- all ten launcher module URLs point to the live offset ports,
- CivicCode opens the HTML `/civiccode` surface, not the API root,
- no source edits or status promotions are made during the test run.

## Constraints

No source edits during the test run. Push only `test-comms/TESTER-RESULT-025.md`. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
