# Audit Lite - Stage 3A Stale Result JSON
**Date:** 2026-06-05
**Scope:** Reviewed the Stage 3A bootstrap fix that makes a failed Stage3 warm-first lifecycle handoff write a terminal failed bootstrap result JSON instead of continuing with stale/non-terminal state.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the feature branch. The Stage3 branch now calls `Complete-Bootstrap "failed"` and exits nonzero when the lifecycle runner reports failure, closing the failure class seen in tester result 018 where the top-level bootstrap JSON remained stale. No audit-lite findings remain for this slice.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's Working
- `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1:756` now treats a Stage3 status other than `passed` or `planned` as terminal failure, writes the structured bootstrap result, and exits with code 1.
- `tests/test_windows_baremetal_bootstrap.py:367` simulates a child lifecycle runner failure by using a fake Python executable that exits 7, then asserts the bootstrap result JSON contains `status=failed`, `stage3.status=failed`, `stage3.exit_code=7`, and `completed_at`.
- The fix is narrowly scoped to Stage3 failure handling and does not alter Stage0, Stage1 reboot behavior, Stage2 prerequisite orchestration, or Stage4 evidence assertion semantics.

## Verification
- Targeted suite: `46 passed in 14.41s` for `tests/test_windows_baremetal_bootstrap.py` and `tests/test_stage2_live_install_blockers.py`.
- Diff review confirmed only `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1` and `tests/test_windows_baremetal_bootstrap.py` changed before this audit report.

## Escalation Recommendation
No escalation needed for this slice. The separate tester re-gate still needs to prove the elevated artifact path writes honest final JSON on a real Windows failure or success.
