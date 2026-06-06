# Tester Directive 031 - rerun proven-suite on available host with host-Ollama probe

## Goal

Rerun the Stage 3A `proven-suite` clean-machine gate on the available 16 GB Windows tester after builder commit `6bde91a4a1bf6abd4f5edc628b55c9984b310dba` replaced the static 24 GB RAM exclusion with an actual bounded host-Ollama `gemma4:e4b` model-load readiness probe.

The available tester has 16 GB system RAM and dedicated VRAM. Product direction is that `gemma4:e4b` runs on this machine, so this gate must use the actual host-Ollama probe as the authority. Do not block merely because the host is below the old 24 GB static floor.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `6bde91a4a1bf6abd4f5edc628b55c9984b310dba`
- Builder fix under test: `6bde91a4a1bf6abd4f5edc628b55c9984b310dba`
- Prior result to read: `test-comms/TESTER-RESULT-030.md`
- Expected result file: `test-comms/TESTER-RESULT-031.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `6bde91a4a1bf6abd4f5edc628b55c9984b310dba`.
4. Read `test-comms/TESTER-RESULT-030.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Run the standard clean-stack teardown from `test-comms/README.md`.
7. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

8. Run repo-local readiness on the available host:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r7 --install-root installer\runtime\proven-suite-clean-machine-r7 --compose-project-suffix stage3a-proven-suite-clean-machine-r7 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

9. Inspect the readiness lifecycle report. It must include:
   - `ollama_model_resources`
   - `host_ollama_model_load`
10. If `host_ollama_model_load` fails, stop and report the exact stderr/stdout/fix steps. Do not install.
11. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r7 --install-root installer\runtime\proven-suite-clean-machine-r7 --compose-project-suffix stage3a-proven-suite-clean-machine-r7 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

12. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r7-verify --install-root installer\runtime\proven-suite-clean-machine-r7 --compose-project-suffix stage3a-proven-suite-clean-machine-r7 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

13. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
14. Write `test-comms/TESTER-RESULT-031.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-031.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-030.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, and Docker Desktop reported total memory,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including stdout/stderr and return code,
- source-cache evidence for all seven readiness modules if install is reached,
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

Pass only if readiness passes with `host_ollama_model_load`, then install, verify, launcher, and all ten live route checks pass.

If the actual host-Ollama model-load probe fails, report the exact blocker. Do not mark the gate passed.

## Constraints

Push only `test-comms/TESTER-RESULT-031.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
