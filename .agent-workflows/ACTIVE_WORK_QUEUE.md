# CivicSuite Active Work Queue

Last updated: 2026-05-11

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

3. **CivicRecords AI CivicCore migration and v1.5.0 release** - GREEN

Why it was next: CivicRecords AI was real and already beyond the v1 question, but it still pinned CivicCore v0.22.1. Migrating it to CivicCore v1.0.1 unblocked the full-suite installer profile and closed the next major release-truth gap.

Completion evidence:

- CivicRecords AI PR #69 merged at `a0b1c467c43ebc84cfda25c7dab77d2d4d832292`.
- CivicRecords AI v1.5.0 release: `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.5.0`.
- CivicRecords AI v1.5.0 setup SHA256: `b48e4591c6d7bde3476078ee648d89e8e6a4e18b24ff0487ec9762af690b8ac5`.
- Release workflow hardening PRs merged: #70 YAML parse fix, #71 Linux/Windows job split, #72 container-log diagnostics, #73 `.local` admin email fix.
- Umbrella PR #121 merged at `3cf9f8289f1090b1c6dd9270d7e184793870df2d` through green `release-lockstep-gate`.
- Full-suite installer profile is re-enabled.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after merge.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-11_CIVICRECORDS_AI_V150_COMPLETE.md`.

## Active Target #1

1. **Audit punch-list section B/C/D recovery**

Why first now: CivicCore v1.0.1, CivicClerk v1.0.1, and CivicRecords AI v1.5.0 are now reconciled in suite truth. The next work should close the audit's remaining security-default, install-path, and module-honesty gaps instead of reopening completed release plumbing.

Definition of Done: read `.agent-workflows/PROJECT_CONTROL_PLANE.md`, `audit-civicsuite-2026-05-09/sprint-punchlist.md`, and relevant release-recovery docs before selecting the first B/C/D fix scope.

Current status: YELLOW, queued and ready for scoped execution.

Next action: select the first B/C/D punch-list item, state the active scope boundary, and execute with tests/docs/QA evidence.

## Queued Targets

2. **Installer/macOS certification follow-up**

Why second: macOS full lifecycle proof still requires a real macOS host or runner. The installer remains YELLOW for macOS runtime certification until that exists or the published platform matrix is narrowed.

3. **CivicRecords AI release workflow_dispatch follow-up**

Why third: the v1.5.0 recovery exposed that tag-triggered releases are hard to rerun safely. Adding `workflow_dispatch` to `civicrecords-ai/.github/workflows/release.yml` is a low-priority release-infrastructure improvement now that v1.5.0 has shipped.

## Current Decision

Proceed with Active Target #1 when the next CivicSuite work session starts. Recommendation: start with audit punch-list section B/C/D recovery, because the platform/product release-truth blockers are now closed and the remaining audit issues are the next trust blockers.
