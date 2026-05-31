# Audit Lite - Stage 1 Slice 3 CI Policy Evidence
**Date:** 2026-05-30
**Scope:** Reviewed the Stage 1 CI/policy change that adds `check_stage_evidence.py`, wires it into `run_all.py`, and runs it from `.github/workflows/verify.yml`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice. The first pass exposed workflow-cost violations in the existing `verify.yml` once this slice touched it; those were fixed by adding concurrency, PR path filters, npm cache coverage, and removing duplicate push-to-main validation. The new stage evidence policy has a focused contract test and passed local execution.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings.

### Closed During Audit - Major: Workflow-cost gate failed after touching verify.yml
**Dimension:** Runtime / CI
**Evidence:** `python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-1-live-gate-policy-harness --base-ref origin/main` initially failed for `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\verify.yml` because the workflow lacked concurrency, duplicated PR and push-to-main validation, lacked path filters, and had no cache coverage for expensive installs.
**Why it matters:** Stage 1 is specifically about preventing uncontrolled release-work churn. Adding a CI policy step while leaving the workflow-cost gate red would make the harness contradict its own rules.
**Fix path:** Added the required concurrency block, PR path filters, `actions/setup-node` with npm cache coverage, and removed duplicate push-to-main validation.

### Closed During Audit - Major: New policy script needed contract coverage
**Dimension:** Tests
**Evidence:** `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\check_stage_evidence.py` is new enforcement code.
**Why it matters:** A policy script that silently skips stage branches would recreate the same disk-only failure mode Stage 1 is meant to prevent.
**Fix path:** Added `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\test_check_stage_evidence_contract.py`.

## What's Working
- `python scripts\policy\check_stage_evidence.py --branch stage-1-live-gate-policy-harness-2026-05-30` passed.
- `python -m pytest scripts\policy\test_check_stage_evidence_contract.py` passed: 2 tests.
- `python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-1-live-gate-policy-harness --base-ref origin/main` passed.
- `python scripts\policy\check_workflow_cost_ledger.py --run 2026-05-30-stage-1-live-gate-policy-harness` passed.
- `.github\workflows\verify.yml` parsed as valid YAML.
- `git diff --check` passed.

## Watch Items
- The next stage should use the new stage evidence gate before reconstructing the live installer harness, so live-install patches are pushed slice by slice instead of accumulating locally.

## Escalation Recommendation
No escalation needed for this slice. Stage-level audit-full remains required before merge.
