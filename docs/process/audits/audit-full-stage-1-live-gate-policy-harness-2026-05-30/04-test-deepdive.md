# Test Deep Dive - Stage 1 Live Gate Policy Harness

## Scope

Reviewed Stage 1 test coverage for the new policy enforcement and changed workflow behavior.

## Findings

No open findings.

## What Works

- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\test_check_stage_evidence_contract.py` covers the two most important policy paths: non-stage branches skip stage evidence, and stage branches without durable evidence fail.
- `python -m pytest scripts\policy\test_check_stage_evidence_contract.py` passed: 2 tests.
- The local pre-push hook was exercised by actual `git push` calls on Stage 1 after each slice.
- `python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-1-live-gate-policy-harness --base-ref origin/main` passed after the workflow-cost fix.

## Test Limits

- No product tests were run because Stage 1 did not alter product runtime behavior.
- The GitHub Actions workflow itself still needs GitHub CI confirmation on the PR head after the audit package is pushed.

## Residual Risk

The policy test uses local filesystem fixtures and does not spin up a full Git repository for a tracked-file success case. The live branch itself provides the tracked-file success evidence through `check_stage_evidence.py --branch stage-1-live-gate-policy-harness-2026-05-30`.

## Test Design Review

The new contract test intentionally covers the two behavior classes most likely to regress:

1. Non-stage branches should not be forced into stage-ledger rules.
2. Stage branches without durable evidence should fail.

The success path with tracked files is harder to fixture without creating a temporary Git repository. For this stage, that path is covered by running the policy script against the actual Stage 1 branch. That is acceptable for this scope because the branch itself is the primary integration fixture.

The test file lives beside the policy scripts rather than under a separate top-level test tree because existing policy contract tests in this repository use that pattern:

- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\test_audit_gate_authority_contract.py`
- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\test_check_test_naming_honesty_contract.py`

## Commands Run

The Stage 1 verification set included:

```text
python -m pytest scripts\policy\test_check_stage_evidence_contract.py
python scripts\policy\check_stage_evidence.py --branch stage-1-live-gate-policy-harness-2026-05-30
python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-1-live-gate-policy-harness --base-ref origin/main
python scripts\policy\check_workflow_cost_ledger.py --run 2026-05-30-stage-1-live-gate-policy-harness
bash scripts/verify-docs.sh
python scripts\verify-secret-scan.py
python scripts\verify-suite-state.py --remote-only
git diff --check
```

## Test Honesty

No test here claims product integration. The policy test is a policy unit/contract test, and the report names it that way. Product install, shared auth, installer lifecycle, and browser QA are outside Stage 1 and remain for later stages.

## Recommended Future Test

If Stage 2 expands the stage policy further, add a temporary-Git integration test that verifies a tracked stage ledger plus tracked audit-lite report passes end to end. That would reduce reliance on the live branch as the success fixture.

## CI Test Coverage

The `verify` workflow now calls `python scripts/policy/check_stage_evidence.py` directly. That means a pull request from a stage branch can fail before expensive Node/browser setup if it lacks the durable evidence record. This is the correct placement: it makes missing evidence cheap to discover.

The test suite does not currently run all policy contract tests as a group in this slice. That is acceptable for Stage 1 because the new behavior's direct contract test was run, and broader workflow execution will occur in GitHub CI. If Stage 2 changes more policy scripts, a dedicated policy-test command should be added to the stage ledger.

## Regression Surface

The main regression risk is false positives on non-stage branches. The first contract test covers that. A second risk is false negatives on stage branches with missing evidence. The second contract test covers the missing evidence path. A full success fixture can be added later if the policy grows.
