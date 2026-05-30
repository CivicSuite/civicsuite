# Engineering Deep Dive - Stage 0 Recovery Baseline

## Scope

Engineering reviewed the Stage 0 recovery branch for correctness, durability, source-pin consistency, hook runtime behavior, and risk of preserving known drift.

## Findings

No open findings.

## What Is Working

- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\installer\modules.json` now pins CivicCode to `a960bba0a2249d118b593dd61bee3a65a69a9d77`, matching the recovered local clone and remote default branch.
- The same CivicCode pin is mirrored in `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\docs\CivicSuiteUnifiedSpec.md`, `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\docs\release-recovery-status.md`, and `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\docs\release-lockstep\downstream-pins.md`.
- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\install-git-hooks.ps1` writes the generated hook as ASCII, avoiding the BOM that made Git unable to spawn the first attempt.
- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\hooks\pre-push.ps1` blocks direct pushes from `main` or `master`, blocks dirty pushes, and verifies a full 40-character HEAD SHA.

## Verification

- `python scripts\verify-suite-state.py --remote-only` returned `VERIFY-SUITE-STATE: PASSED`.
- `git diff --check` returned exit code 0 after the Stage 0 changes.
- `git push -u origin stage-0-recovery-baseline-2026-05-30` ran the pre-push gate and printed `pre-push gate: passed for stage-0-recovery-baseline-2026-05-30 at 96d684ee7b6d3d61108ec307b8c0943b1e7960b0`.

## Limitations

This Stage 0 branch does not reconstruct the lost live-install implementation. That work is intentionally deferred to Stage 1 and later slices.

