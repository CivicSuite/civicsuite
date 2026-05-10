# CivicSuite Project Control Plane

Last updated: 2026-05-10

## Project Goal

Recover CivicSuite from prior fragmented release work, restore public release truth, then complete the real platform/product recovery sequence until the suite can ship as municipal software.

## Operating Model

- Work from durable state, not memory.
- Keep exactly one active target unless the user explicitly authorizes parallel implementation.
- Batch related work and verification to avoid dragging the user through tiny approval loops.
- Continue within an authorized sprint until a real blocker, destructive action, failed scope boundary, failed release gate, or explicit pause.
- Every recommendation must include the recommendation, the decision, and why.
- Write a handoff before pause, compaction, or long-run transfer.
- The release-lockstep gate is the merge-blocking truth source for every release-tag PR. If it blocks, fix the artifacts; do not bypass it.
- A product cannot be called v1.0.0 unless it is integrated into the CivicSuite installer path for its supported profile.

## Completed Target

Completed: CivicCore v1.0.1 pin sweep and suite-truth reconciliation.

Evidence:

- CivicCore v1.0.1 release exists with wheel, sdist, and SHA256SUMS.
- Downstream CivicCore v1.0.1 pin PRs merged for CivicInspect, CivicZone, CivicGrants, CivicProcure, CivicCode, CivicPlan, CivicPermit, and CivicClerk.
- CivicSuite umbrella PR #116 merged at `82f4b51e89d12e8d6d9a5da10af80168cee18900` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed after PR #116 merged.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-10_CIVICCORE_V101_PIN_SWEEP_COMPLETE.md`.

Completed: CivicClerk B1 security default and v1.0.1 recovery patch.

Evidence:

- CivicClerk PR #156 merged at `c25cded3e913f9d37eee6ac46734088c3573359d`.
- CivicClerk v1.0.1 release exists with wheel, sdist, and SHA256SUMS.
- CivicClerk v1.0.0 release is marked superseded with a v1.0.1 security-hardening pointer.
- Browser/UX evidence exists in the CivicClerk repo: `docs/browser-qa-b1-default-protected-summary.md`, `docs/browser-qa-b1-default-protected-desktop.png`, and `docs/browser-qa-b1-default-protected-mobile.png`.
- CivicSuite umbrella PR #117 merged at `6b4ad386b159b19ef5fb12eaeab585a73264c22f` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed after PR #117 merged.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-10_CIVICCLERK_B1_COMPLETE.md`.

## Current Scope Boundary

Active target: CivicRecords AI CivicCore migration and v1.5.0 release.

Why next: CivicRecords AI is the remaining real product with a legacy CivicCore v0.22.1 pin. Migrating it to CivicCore v1.0.1 and releasing v1.5.0 unblocks future full-suite installer truth.

Allowed now:

- Read CivicRecords AI, CivicCore, the audit package, and the unified spec for the CivicCore migration.
- Change CivicRecords AI dependency pins, compatibility code, tests, docs, release evidence, and installer truth needed for v1.5.0.
- Run CivicRecords AI local verification, browser/UX checks where applicable, and GitHub CI.
- Open and merge CivicRecords AI PRs required for the migration and v1.5.0 release.
- Update umbrella release-truth artifacts through the release-lockstep gate if CivicRecords AI's recovery label changes.

Not allowed now:

- Revisit, move, delete, or retag the seven demoted releases from PR #115.
- Modify CivicCore release artifacts; v1.0.1 is final.
- Reopen CivicClerk B1 unless a regression is found; CivicClerk v1.0.1 is shipped.
- Tag any module as v1.0 or higher unless its full recovery gate and installer integration are satisfied.
- Bypass release-lockstep-gate, admin-merge around it, force-push, delete tags, or rewrite history.
- Use unauthorized skills or plugins.

## Definition Of Done For Current Target

The CivicRecords AI migration target is complete only when:

1. CivicRecords AI depends on CivicCore v1.0.1 using the authorized package pin pattern.
2. Compatibility code and tests pass against CivicCore v1.0.1 without silently weakening behavior.
3. User-facing docs explain the migration and any operator-visible compatibility changes.
4. Browser/UX evidence is captured for relevant request/search/admin surfaces if frontend behavior changes.
5. The repo's full local release verifier passes.
6. GitHub CI is green after push/merge.
7. CivicRecords AI v1.5.0 release artifacts exist and the umbrella truth files move through `release-lockstep-gate`.
8. Handoff/update evidence is written before advancing to the next queued target.

## Stop Conditions

Stop and report before continuing if:

- The fix would require changing CivicCore release artifacts.
- A test failure indicates a behavior change outside CivicRecords AI's CivicCore migration scope.
- `release-lockstep-gate` or required CI fails for a non-trivial reason.
- A destructive action, force-push, tag deletion, history rewrite, signing key, paid service, or production secret is requested.

## Reporting Format

- Active target:
- Goal:
- Status: RED / YELLOW / GREEN
- Completed:
- Remaining:
- Evidence:
- Next action:
- Scope boundary:
