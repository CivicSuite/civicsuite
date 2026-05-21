# CivicSuite Active Work Queue

Last updated: 2026-05-18

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

5. **Audit punch-list B2 security-secret handling recovery** - GREEN

Why it was next: D2/B3 closed the shared staff-key timing issue. B2 was the next highest-trust security-default gap: move JWT secret and first admin password material out of recoverable container environment variables.

Completion evidence:

- CivicRecords AI Phase 1 PR #74 merged at `902db173366359124e4d8e84f3c440df61aa62f4`.
- CivicRecords AI Phase 1B PR #76 merged at `5e7425dc7a226f63a4ba8a91aa76cb30491c03ef`.
- CivicRecords AI v1.6.0 release: `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.6.0`.
- v1.6.0 setup SHA256: `5d4d55edc4a030ab86068ff3ab578ea97f5e7b2a5982c90ba302752e0f1d9022`.
- Umbrella PR #128 merged at `07544e01ec285a2116e63c76075d224136b8c3c0` through green `release-lockstep-gate`.
- The literal B2 acceptance command `docker compose exec -T api env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` returns zero matching lines (`exit=1`) in the Phase 2 rehearsal artifact.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after merge, with CivicRecords AI at 1.6.0.
- Final handoff: `.agent-workflows/HANDOFF_2026-05-12_B2_COMPLETE.md`.

## Active Target #1

1. **Clerk-Core City Release - COMPLETE**

Why first now: the project owner explicitly reset the priority to the first real public-use CivicSuite product. CivicCore, CivicRecords AI, and CivicClerk must be installable and operable together before CivicContracts or any later module work continues.

Definition of Done: ship the clerk-core starter product as a Linux-first Docker/browser release with honest Windows/macOS wrappers, full internal install/start/health/repair/backup/restore/uninstall proof, module workflow proof for CivicRecords AI and CivicClerk, browser QA, docs, tests, release-truth lockstep, and no full-suite/procurement/airgap/macOS lifecycle certification claims.

Current status: GREEN, completed and published as the bounded Clerk-Core public-use starter.

Next action: continue the post-starter module queue one module at a time.

2. **CivicCode v1.0.0 - COMPLETE**

Why second: Tier 1 code dependency for land-use and permitting modules.

Current status: GREEN, completed with source release and suite installer/module-selection truth reconciliation.

3. **CivicAccess v1.0.0 - COMPLETE**

Why third: Tier 1 accessibility/plain-language layer for resident-facing modules.

Current status: GREEN, completed with source release and suite installer/module-selection truth reconciliation.

4. **CivicZone v1.0.0 - ACTIVE**

Why now: first major Tier 2 land-use module after CivicCode and CivicAccess.

Definition of Done: reconcile CivicZone v1.0.0 source release truth into CivicSuite installer/module-selection metadata, compatibility truth, release recovery docs, current-facing docs, release-lockstep evidence, verifier truth, PR/CI/main verification, and root queue advancement. This target does not promote CivicPlan, CivicPermit, CivicInspect, CivicGrants, CivicProcure, queued modules, the full suite, live cross-module records exchange, or macOS lifecycle certification.

Current status: RED, active.

Next action: run the `agent-pipeline-codex` v0.9.0 suite-truth run `2026-05-21-civiczone-v1-suite-truth`, verify locally, push a `release-tag` PR, merge after green CI, and verify main.

## Queued Targets

5. **Remaining 22 product modules in spec/dependency order**

Why next: `docs/CivicSuiteUnifiedSpec.md` is the source of truth and says the suite has 27 product modules plus CivicCore. After CivicRecords AI, CivicClerk, CivicCode, CivicAccess, and CivicZone, the remaining 22 product modules proceed one at a time.

6. **Deferred release-infrastructure follow-ups**

Why third: CivicRecords AI workflow-dispatch improvements, standalone macOS lifecycle certification, and other infrastructure refinements remain useful, but they cannot displace the clerk-core city release unless they directly block it.

## Current Decision

Proceed with Active Target #4 now. CivicPlan and later modules are paused until CivicZone passes its suite truth and installer/module-selection gate.
