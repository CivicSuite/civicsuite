# CivicRecords AI v1.5.0 Migration - Paused Handoff

Date: 2026-05-10

## Active Target

CivicRecords AI CivicCore migration and v1.5.0 release.

## Status

RED - halted under directive section 4.7.

Reason: infrastructure failure in `civicrecords-ai/.github/workflows/release.yml`. The existing release workflow fails before any jobs start because the release-notes HEREDOC body is not indented inside the YAML `run: |` block.

## Completed Before Halt

- Section 0 cleanup PR landed: CivicSuite PR #119 corrected the CivicClerk B1 handoff tarball SHA.
- CivicRecords AI PR #69 merged at `a0b1c467c43ebc84cfda25c7dab77d2d4d832292`.
- CivicRecords AI tag `v1.5.0` was pushed and points at `a0b1c467c43ebc84cfda25c7dab77d2d4d832292`.
- Local `bash scripts/verify-release.sh` passed after the final diff:
  - recovery gates passed
  - tracked-file secret scan passed
  - compose sovereignty passed with warnings only
  - version lockstep showed all four surfaces at `1.5.0`
  - required docs gate passed
  - ruff passed
  - backend tests collected 633 and passed 633
  - frontend Vitest passed 36 tests
  - Playwright passed 4 desktop/mobile user-flow tests
  - runtime install proof installed `civicrecords-ai==1.5.0` with `civiccore==1.0.1` and `/health` returned version `1.5.0`
- PR #69 GitHub CI was green: Backend pytest, Frontend vitest/build, Release recovery gates, T2C bootstrap-failure smoke test, and ruff.

## Blocked Work

- GitHub Release `v1.5.0` does not exist yet because `release.yml` fails before jobs start.
- CivicRecords AI release artifacts are not published.
- Umbrella truth-reconciliation PR is not opened yet.
- Umbrella `docs/CivicSuiteUnifiedSpec.md`, `scripts/verify-suite-state.py`, `installer/modules.json`, `docs/release-recovery-status.md`, `CHANGELOG.md`, and `docs/release-lockstep/downstream-pins.md` still need the CivicRecords AI v1.5.0 / CivicCore v1.0.1 update.
- Full-suite installer profile is not re-enabled yet.

## Release Workflow Bug

Audit finding: TEST-022 in `audit-civicsuite-2026-05-09/04-test-deepdive.md`.

Affected file: `civicrecords-ai/.github/workflows/release.yml`.

Affected range: lines 247-264.

Failure shape:

```text
yaml.scanner.ScannerError: while scanning a simple key
  in ".github/workflows/release.yml", line 251, column 1
could not find expected ':'
```

Cause: the `cat >> release-notes.md <<EOF` HEREDOC body is at column 1 while the surrounding `run: |` block requires content indentation at the shell-script level. YAML exits the block scalar at the unindented markdown line and treats the fenced code marker as a malformed top-level key.

## Required Resume Sequence

1. Fix `civicrecords-ai/.github/workflows/release.yml` in a scope-bounded CI PR.
2. Verify the workflow YAML parses locally.
3. Merge the CI PR through green CivicRecords AI CI.
4. Re-trigger the `v1.5.0` release workflow without changing the v1.5.0 target SHA.
5. Verify the `v1.5.0` GitHub Release exists with expected assets.
6. Open the umbrella release-tag PR for CivicRecords AI v1.5.0 / CivicCore v1.0.1 truth reconciliation.
7. Merge after `release-lockstep-gate` passes.
8. Write the final CivicRecords AI v1.5.0 completion handoff and update the active queue.

## Scope Boundary

Do not manually create the `v1.5.0` release as a workaround. The release workflow is the integrity path and must be fixed.

Do not touch CivicCore, CivicClerk, the demoted releases, or other module repos.
