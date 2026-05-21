# CivicSuite Project Control Plane

Last updated: 2026-05-18

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

Completed: CivicRecords AI CivicCore migration and v1.5.0 release.

Evidence:

- CivicRecords AI PR #69 migrated the product to CivicCore v1.0.1 and bumped CivicRecords AI to v1.5.0 at `a0b1c467c43ebc84cfda25c7dab77d2d4d832292`.
- CivicRecords AI v1.5.0 release exists: `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.5.0`.
- CivicRecords AI v1.5.0 setup SHA256: `b48e4591c6d7bde3476078ee648d89e8e6a4e18b24ff0487ec9762af690b8ac5`.
- Release workflow fixes landed in CivicRecords AI PRs #70, #71, #72, and #73.
- CivicSuite umbrella PR #121 merged at `3cf9f8289f1090b1c6dd9270d7e184793870df2d` through green `release-lockstep-gate`.
- Full-suite installer profile is re-enabled after the CivicRecords AI / CivicCore pin alignment.
- `python scripts/verify-suite-state.py --remote-only` passed after PR #121 merged.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-11_CIVICRECORDS_AI_V150_COMPLETE.md`.

Completed: D2/B3 shared staff-key gate extraction and rollout.

Evidence:

- CivicCore PR #56 merged at `411a4f4a833c91a787dacf1485f643f564e174c2`, adding `civiccore.auth.staff_key_gate` with timing-safe staff-key comparison and unit tests.
- CivicCore v1.1.0 release exists: `https://github.com/CivicSuite/civiccore/releases/tag/v1.1.0`.
- CivicCore v1.1.0 wheel SHA256: `3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87`.
- Downstream D2/B3 rollout PRs merged: CivicCode #55, CivicPlan #10, CivicPermit #11, CivicInspect #9, CivicGrants #8, and CivicProcure #8.
- CivicSuite umbrella PR #123 merged at `63528de` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed after PR #123 merged.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-11_D2_B3_STAFF_KEY_GATE_COMPLETE.md`.

Completed: Audit punch-list B2 security-secret handling recovery.

Evidence:

- CivicRecords AI PR #74 moved raw JWT and first-admin-password material into Docker secret files at `902db173366359124e4d8e84f3c440df61aa62f4`.
- CivicRecords AI PR #76 removed the `_FILE` pointer env names from the container env and tightened the release verifier/test predicate at `5e7425dc7a226f63a4ba8a91aa76cb30491c03ef`.
- CivicRecords AI v1.6.0 release exists: `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.6.0`.
- CivicRecords AI v1.6.0 setup SHA256: `5d4d55edc4a030ab86068ff3ab578ea97f5e7b2a5982c90ba302752e0f1d9022`.
- CivicSuite umbrella PR #128 merged at `07544e01ec285a2116e63c76075d224136b8c3c0` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed after PR #128 merged, with CivicRecords AI at 1.6.0.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-12_B2_COMPLETE.md`.

## Current Scope Boundary

Active target: CivicPermit v1.0.0 suite-truth reconciliation.

State on resume: the Clerk-Core public-use starter, CivicCode v1.0.0, CivicAccess v1.0.0, CivicZone v1.0.0, and CivicPlan v1.0.0 have already passed their suite truth gates. The root active release queue now names CivicPermit as the active module. CivicPermit source PR #12 has merged, release `v1.0.0` is published, and this suite run reconciles installer/module-selection truth, compatibility truth, release recovery docs, and verifier truth for CivicPermit only. `docs/CivicSuiteUnifiedSpec.md` remains the source of truth for the 27 product modules plus CivicCore.

Why next: CivicPermit is the active post-starter module after CivicPlan. It cannot satisfy the module Definition of Done until the umbrella suite truth and installer/module-selection path agree with the published CivicPermit v1.0.0 release.

Allowed now:

- Read the unified spec, release recovery status, installer docs, CivicPermit source release evidence, and current module truth artifacts.
- Make scoped CivicPermit suite-truth fixes in CivicSuite verifier inputs, installer/module-selection metadata, compatibility docs, release recovery docs, current-facing docs, and control-plane evidence.
- Use the release-lockstep gate for any release-truth PR.
- Keep CivicInspect, CivicGrants, CivicProcure, later-module, and standalone macOS lifecycle certification work outside this target unless a direct CivicPermit release blocker is named first.

Not allowed now:

- Revisit, move, delete, or retag historical demotion releases outside the already repaired CivicPermit v1.0.0 source tag.
- Modify CivicCore release artifacts; v1.1.0 is final for the D2/B3 helper release.
- Reopen CivicClerk B1 unless a regression is found; CivicClerk v1.0.1 is shipped.
- Reopen CivicRecords AI v1.5.0 migration unless a regression is found; CivicRecords AI v1.5.0 is shipped.
- Reopen the D2/B3 staff-key gate rollout unless a regression is found; CivicCore v1.1.0 and the six downstream PRs are shipped.
- Reopen B2 unless a regression is found; CivicRecords AI v1.6.0 is shipped.
- Advance CivicInspect, CivicGrants, CivicProcure, CivicContracts, or any later module before CivicPermit passes its suite truth and installer/module-selection gate.
- Tag any module as v1.0 or higher unless its full recovery gate and installer integration are satisfied.
- Bypass release-lockstep-gate, admin-merge around it, force-push, delete tags, or rewrite history.
- Use unauthorized skills or plugins.

## Definition Of Done For Current Target

The CivicPermit suite-truth target is satisfied only when:

1. The active queue and project control plane name CivicPermit v1.0.0 suite-truth reconciliation as the only active target.
2. `installer/modules.json` records CivicPermit v1.0.0, CivicCore v1.1.0, and public-use module release proof requirements.
3. `scripts/verify-suite-state.py --remote-only` prints `[civicpermit] PASS 1.0.0`.
4. Current-facing README, STATUS, FAQ, user manual, compatibility, recovery, lockstep, and unified spec docs no longer describe CivicPermit as a current demoted v0.2.0 module.
5. `verify-docs`, `verify-installer-plan`, `verify-release-lockstep`, suite verifier, and `git diff --check` pass.
6. The branch is pushed with the `release-tag` PR label, CI is green, the PR is merged, and main verify confirms CivicPermit v1.0.0 without macOS lifecycle certification claims.
7. Local tests, lint/static checks, suite verifier, docs verifier, installer verifier, release scripts where present, and release-lockstep gate pass with recorded proof.
8. Release docs and artifacts avoid full-suite, procurement, airgap, and macOS lifecycle certification claims.
9. Handoff/update evidence is written before any remaining module queue begins.

## Stop Conditions

Stop and report before continuing if:

- The fix would require changing already-published release artifacts.
- A test failure indicates a behavior change outside the selected audit punch-list scope.
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
