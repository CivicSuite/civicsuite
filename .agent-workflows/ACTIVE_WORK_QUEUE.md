# CivicSuite Active Work Queue

Last updated: 2026-05-10

## Completed Target

1. **CivicCore v1.0.1 pin sweep and suite-truth reconciliation** - GREEN

Why it was first: the audit classified CivicCore as a real platform whose problem was release hygiene, not product falseness. Fixing CivicCore's post-v1.0 recovery tag and lockstep truth gave CivicClerk and the downstream modules a stable platform reference.

Completion evidence:

- CivicCore v1.0.1 release: `https://github.com/CivicSuite/civiccore/releases/tag/v1.0.1`
- Downstream pin PRs merged: CivicInspect #8, CivicZone #17, CivicGrants #7, CivicProcure #7, CivicCode #54, CivicPlan #9, CivicPermit #10, CivicClerk #155.
- Umbrella PR #116 merged at `82f4b51e89d12e8d6d9a5da10af80168cee18900`.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after merge.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-10_CIVICCORE_V101_PIN_SWEEP_COMPLETE.md`.

2. **CivicClerk B1 security default and v1.0.1 recovery patch** - GREEN

Why it was next: CivicClerk is a real product-shaped workflow, but the audit verified that fresh/default installs could allow anonymous writes. Fixing that default was the highest-trust blocker before CivicClerk could honestly receive a v1.0.1 recovery patch.

Completion evidence:

- CivicClerk PR #156 merged at `c25cded3e913f9d37eee6ac46734088c3573359d`.
- CivicClerk v1.0.1 release: `https://github.com/CivicSuite/civicclerk/releases/tag/v1.0.1`.
- CivicClerk wheel SHA256: `e6d9fd34406c1bad74c3400f1a32ae9f4d883bcf455f9c6a05f171d8869b76a7`.
- Browser/UX evidence: `docs/browser-qa-b1-default-protected-summary.md` plus desktop/mobile screenshots in the CivicClerk repo.
- Umbrella PR #117 merged at `6b4ad386b159b19ef5fb12eaeab585a73264c22f` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after merge.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-10_CIVICCLERK_B1_COMPLETE.md`.

## Active Target #1

1. **CivicRecords AI CivicCore migration and v1.5.0 release**

Why first now: CivicRecords AI is real and already beyond the v1 question, but it still pins CivicCore v0.22.1. Migrating it to CivicCore v1.0.1 unblocks the future full-suite installer profile and closes the next major release-truth gap.

Definition of Done: read `.agent-workflows/PROJECT_CONTROL_PLANE.md`, the audit punch-list, and CivicRecords AI's own release gates before starting.

Current status: YELLOW, not started in this sprint.

## Queued Targets

2. **Installer/macOS certification follow-up**

Why second: macOS full lifecycle proof still requires a real macOS host or runner. The installer remains YELLOW for macOS runtime certification until that exists or the published platform matrix is narrowed.

3. **Audit punch-list section B/C/D recovery**

Why third: after CivicRecords migration, the next recovery work should address security defaults, install path, and module honesty from the audit punch-list in order.

## Current Decision

Proceed with Active Target #1 when the next CivicSuite work session starts. Recommendation: start with CivicRecords AI CivicCore migration and v1.5.0, because it is the next release-truth blocker and it unblocks the future full-suite installer profile.
