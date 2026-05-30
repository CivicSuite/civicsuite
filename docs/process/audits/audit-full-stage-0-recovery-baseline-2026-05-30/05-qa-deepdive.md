# QA Deep Dive - Stage 0 Recovery Baseline

## Scope

QA reviewed runtime behavior relevant to Stage 0: the recovered checkout state, hook execution path, suite-state verifier, and evidence honesty.

## Findings

No open findings.

## What Is Working

- The push path was exercised for real against GitHub and the pre-push gate ran before the branch was accepted.
- The suite-state verifier was run after the CivicCode source-pin restoration and passed.
- The installer-cleanroom workflow ref was aligned after PR #186 exposed a stale CivicCode checkout path.
- The recovery doc clearly distinguishes surviving failed r2 evidence from a passing live-assembled product proof.
- The preserved evidence location is outside the fragile OneDrive workspace at `C:\Users\scott\Documents\RECOVERY_civicsuite-live-assembled-np9lgjwm_2026-05-30`.

## Verification

- Local branch: `stage-0-recovery-baseline-2026-05-30`
- Pushed head: `96d684ee7b6d3d61108ec307b8c0943b1e7960b0`
- Remote branch: `origin/stage-0-recovery-baseline-2026-05-30`
- Verifier: `VERIFY-SUITE-STATE: PASSED`
- Hook runtime: `pre-push gate: passed for stage-0-recovery-baseline-2026-05-30 at 96d684ee7b6d3d61108ec307b8c0943b1e7960b0`
- Workflow-cost ledger: `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\.agent-runs\2026-05-30-stage-0-recovery-baseline\workflow-cost-ledger.md`

## Limitations

QA did not run the city-core product because Stage 0 does not claim product behavior. The preserved r2 live gate remains failed evidence and is not used as a readiness claim.
