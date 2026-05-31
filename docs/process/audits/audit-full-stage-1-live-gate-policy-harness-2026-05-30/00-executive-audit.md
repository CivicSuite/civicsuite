# Audit Full - Stage 1 Live Gate Policy Harness
**Date:** 2026-05-30
**Scope:** Stage 1 branch `stage-1-live-gate-policy-harness-2026-05-30` in `CivicSuite/civicsuite`.
**Reviewer:** Codex audit-full self-check. This is not an independent `audit-team-claude` gate.

## Executive Summary

Stage 1 satisfies its scoped purpose: city-core work now has a tracked stage process, a tracked Stage 1 ledger, local pre-push protection for stage evidence, and a CI policy check that enforces durable stage evidence on pull requests. The implementation keeps the work recoverable from GitHub by requiring stage ledgers and stage-specific audit-lite reports before pushes and during `verify`. The workflow-cost issue introduced by touching `verify.yml` was fixed in-scope with concurrency, PR path filters, npm cache coverage, and removal of duplicate push-to-main validation. No open Blocker, Critical, Major, Minor, or Nit findings remain for the Stage 1 scope.

## Severity Roll-Up

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Top Findings

No open findings.

Closed during the stage:

1. Workflow-cost violations in `.github/workflows/verify.yml` after adding a CI step. Fixed with concurrency, path filters, npm cache coverage, and no duplicate push-to-main validation.
2. Missing contract coverage for the new stage-evidence policy script. Fixed with `scripts/policy/test_check_stage_evidence_contract.py`.
3. Pre-push hook accepted historical audit-lite reports instead of current-stage reports. Fixed by requiring `audit-lite-stage-<number>-*.md`.
4. Stage ledger process initially required self-referential commit SHAs. Fixed by recording pushed SHAs in the following slice or closeout.

## What's Working Well

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\city-core-stage-execution-process.md` defines a GitHub-first stage process.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\hooks\pre-push.ps1` blocks dirty pushes, default-branch pushes, missing stage ledgers, and missing stage-specific audit-lite evidence.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\check_stage_evidence.py` gives CI the same stage-evidence invariant.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\verify.yml` runs the new policy before heavier Node/browser setup.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.agent-runs\2026-05-30-stage-1-live-gate-policy-harness\workflow-cost-ledger.md` records the workflow-cost decision trail.

## Verification Evidence

- `python scripts\policy\check_stage_evidence.py --branch stage-1-live-gate-policy-harness-2026-05-30` passed.
- `python -m pytest scripts\policy\test_check_stage_evidence_contract.py` passed: 2 tests.
- `python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-1-live-gate-policy-harness --base-ref origin/main` passed.
- `python scripts\policy\check_workflow_cost_ledger.py --run 2026-05-30-stage-1-live-gate-policy-harness` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts\verify-secret-scan.py` passed.
- `python scripts\verify-suite-state.py --remote-only` passed.
- `.github\workflows\verify.yml` parsed as valid YAML.
- `git diff --check` passed.

`python scripts\verify-release-lockstep.py` was not applicable for Stage 1 because this branch does not change release truth artifacts and should not be labeled `release-tag`.

## This-Sprint Punch List

No Stage 1 punch-list items remain open.

## Next-Sprint Watchlist

- Stage 2 should reconstruct the live installer gate in the same pushed-slice model.
- Stage 2 should treat any hook or CI stage-evidence failure as a real halt until the ledger and audit-lite evidence are repaired.
- The Stage 1 harness does not prove the product install path; it only protects the recovery and evidence workflow used before product changes resume.

## Blast-Radius Notes

The only workflow behavior change is in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\verify.yml`: verification now runs on pull requests matching repository-relevant paths, with concurrency cancellation, and no longer duplicates the same validation on every push to `main`. Required PR checks remain the merge-time protection point for Stage 1.
