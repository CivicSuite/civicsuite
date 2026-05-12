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

4. **D2/B3 shared staff-key gate extraction and rollout** - GREEN

Why it was next: audit D2 and B3 shared one root problem: six modules carried bespoke staff-key checks instead of a shared CivicCore helper, leaving timing-safe comparison discipline scattered across repos.

Completion evidence:

- CivicCore PR #56 merged at `411a4f4a833c91a787dacf1485f643f564e174c2`, adding `civiccore.auth.staff_key_gate`.
- CivicCore v1.1.0 release: `https://github.com/CivicSuite/civiccore/releases/tag/v1.1.0`.
- CivicCore v1.1.0 wheel SHA256: `3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87`.
- Six downstream rollout PRs merged: CivicCode #55, CivicPlan #10, CivicPermit #11, CivicInspect #9, CivicGrants #8, CivicProcure #8.
- Umbrella PR #123 merged at `63528de` through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after merge.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-11_D2_B3_STAFF_KEY_GATE_COMPLETE.md`.

## Active Target #1

1. **Audit punch-list B2 security-secret handling recovery**

Why first now: D2/B3 closed the shared staff-key timing issue. B2 is the next highest-trust security-default gap: move JWT secret and first admin password material out of recoverable container environment variables.

Definition of Done: inventory every JWT secret and first-admin password path in the targeted deployment stack, move secret material to Docker secrets or bind-mounted secret files where in scope, update docs/tests, and preserve release-lockstep truth if installer metadata changes.

Current status: Phase 2 GREEN, pre-tag approval gate. Phase 0 inventory, Phase 1 PR #74 (merge SHA 902db173366359124e4d8e84f3c440df61aa62f4), and Phase 1B PR #76 (merge SHA 5e7425dc7a226f63a4ba8a91aa76cb30491c03ef) are landed; the directive's literal acceptance command `docker compose exec -T api env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` returns zero matching lines (`exit=1`) in the Phase 2 rehearsal artifact.

Next action: halt for Scott v1.6.0 tag-push approval; on approval, push the v1.6.0 tag, wait for release workflow success, then open the umbrella release-truth PR (`modules.json`, spec §18, compatibility/index.md, release-recovery-status, downstream-pins, CHANGELOG, verify-suite-state.py) with the `release-tag` label.

## Queued Targets

2. **Installer/macOS certification follow-up**

Why second: macOS full lifecycle proof still requires a real macOS host or runner. The installer remains YELLOW for macOS runtime certification until that exists or the published platform matrix is narrowed.

3. **CivicRecords AI release workflow_dispatch follow-up**

Why third: the v1.5.0 recovery exposed that tag-triggered releases are hard to rerun safely. Adding `workflow_dispatch` to `civicrecords-ai/.github/workflows/release.yml` is a low-priority release-infrastructure improvement now that v1.5.0 has shipped.

4. **Remaining audit punch-list C/D recovery**

Why fourth: after B2, the remaining install-path and module-honesty gaps should continue one bounded manifest at a time: C4/C6 and D1/D3/D4/D5/D6.

## Current Decision

Proceed with Active Target #1 when the next CivicSuite work session starts. Recommendation: start with audit punch-list B2 because D2/B3 is now GREEN and B2 is the next direct security-default trust blocker.
