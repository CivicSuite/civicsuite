# Tester Directive 026 - correct verdict for proven-suite missing-source blocker

## Goal

Correct the gate state after `TESTER-RESULT-025.md`.

This is not a rerun request. This is a reporting/verdict correction request.

`TESTER-RESULT-025.md` is useful evidence, but it is not a green gate and does not mean the proven-suite clean-machine work is done. It proves the opposite: the clean-machine proven-suite install is blocked before verify because the selected readiness module sources are missing from the clean tester checkout.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `007a5986b4e09982158f0022a8097a0e478f0dec`
- Required source result to read: `test-comms/TESTER-RESULT-025.md`
- Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.

## What TESTER-RESULT-025 actually means

The result is **blocked / failed**, not passed.

Evidence from `TESTER-RESULT-025.md`:

- Proven-suite dry-run plan passed.
- Readiness passed with `--port-offset 4800`.
- Install failed before verify.
- Verify was not run.
- Launcher config was not verified.
- Live launcher URL was not proven.
- Live route evidence for the ten modules was not gathered.
- Expected not-ready blocker responses for readiness-only modules were not observed.
- The clean tester checkout had bundled source directories only for:
  - `civicrecords-ai`
  - `civicclerk`
  - `civiccode`
- Missing selected source directories:
  - `civiczone`
  - `civicplan`
  - `civicpermit`
  - `civicaccess`
  - `civicinspect`
  - `civicgrants`
  - `civicprocure`
- First hard blocker:
  - `Missing source for civiczone`

Therefore the correct gate verdict is:

```text
Stage 3A proven-suite clean-machine gate: BLOCKED / FAILED.
Reason: selected readiness module sources are absent from the clean-machine repo checkout/bundle.
Builder action required before rerun: make the proven-suite module sources available to the installer on a clean machine, either bundled under modules\ or otherwise fetched/staged by the installer contract.
```

## Required action

Write `test-comms/TESTER-RESULT-026.md` and push it to `stage-3a-baremetal-windows`.

Do not rerun the install unless a newer builder directive explicitly changes the source-availability contract first.

## Required report contents

`TESTER-RESULT-026.md` must include all of the following:

1. Exact branch head read.
2. Confirmation that `TESTER-RESULT-025.md` was read.
3. Corrected final verdict:
   - `BLOCKED / FAILED`, not passed.
4. Short explanation that the gate is not complete because install failed before verify.
5. The exact missing-source blocker:
   - `Missing source for civiczone`
6. The complete list of missing readiness module sources:
   - `civiczone`
   - `civicplan`
   - `civicpermit`
   - `civicaccess`
   - `civicinspect`
   - `civicgrants`
   - `civicprocure`
7. The list of source directories that were present under `modules\`:
   - `civicrecords-ai`
   - `civicclerk`
   - `civiccode`
8. Explicit statement that these required acceptance checks were not reached:
   - install passed
   - verify passed
   - install provenance verified
   - suite launcher served
   - ten launcher module URLs verified
   - CivicCode `/civiccode` HTML route verified
   - readiness-only module blocker responses observed
9. Explicit statement that builder action is required before another clean-machine rerun.
10. Confirmation that no source files or status files were edited during this correction.

## Constraints

Push only `test-comms/TESTER-RESULT-026.md`. No merge, tag, status promotion, or source edits. Never touch any OneDrive path.
