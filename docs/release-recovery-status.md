# CivicSuite Release Recovery Status

Status date: 2026-05-21

## Current Rule

Public "shipping", "product-ready", "city-ready", and "v1.0.0 proves release maturity" claims are blocked unless the module appears below with an explicit recovery-passed status. The 2026-05-09 external audit found that multiple v1.0.0 labels were false.

## Corrective Decision

The project owner selected Option 1: yank/demote false v1.0 releases, but do not re-tag v1.0.0 at a different SHA.

Demotion pattern:

- Delete or supersede the false GitHub v1.0.0 release page.
- Publish a new honest version label instead of rewriting v1.0.0 history.
- Publish wheels using the honest version filename.
- Keep CivicCore URL pins hash-locked with `#sha256=`.
- Update the unified spec, this recovery doc, the compatibility matrix, `scripts/verify-suite-state.py`, `installer/modules.json`, downstream `pyproject.toml`, and changelog together.

## Module Decision Table

| Repo | Previous public label | Corrective label | Decision |
|---|---:|---:|---|
| civiccore | v1.0.0 / v1.0 | v1.1.0 shipped | Real platform; v1.1.0 shipped 2026-05-11 with shared `staff_key_gate` and timing-safe staff-key comparison. v1.0.1 auth-error-payload hardening remains included; v1.0 superseded. |
| civicclerk | v1.0.0 | v1.0.1 shipped | Real product-shaped workflow; v1.0.1 shipped 2026-05-10 with QA-001 security default change. Fresh installs deny anonymous staff writes by default; open mode is explicit local-rehearsal opt-in. |
| civicrecords-ai | v1.4.10 | v1.6.1 shipped | CivicCore v1.0.1 migration shipped 2026-05-11 as v1.5.0; B2 audit punch-list closed 2026-05-12 as v1.6.0 (JWT secret and first-admin password material moved to Docker secret files; container env no longer exposes any `JWT_SECRET*` or `FIRST_ADMIN_PASSWORD*` name). v1.6.1 shipped 2026-05-15 with the ingestion worker event-loop recovery patch. |
| civiccode | v1.0.0 false label | v0.6.0 corrective demotion | Functional-partial: real backend and migrations exist, but real AI, real frontend, real municipal data/search proof, installer/run proof, and independent Section 2 sign-off remain pending. The v1.0.0 release was published in error. |
| civicaccess | v1.0.0 false label | v0.2.0 corrective demotion | Scaffold: deterministic support exists, but real AI, real municipal data/search, production-grade frontend, and independent Section 2 sign-off remain pending. The v1.0.0 release was published in error. |
| civiczone | v1.0.0 false label | v0.2.1 corrective demotion | Scaffold with partial persistence/workflow plumbing; no real AI, full frontend, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicplan | v1.0.0 false label | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, real municipal data/search, migrations, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicpermit | v1.0.0 false label | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, Alembic migrations, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicinspect | v1.0.0 false label | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, Alembic migrations, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicgrants | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |
| civicprocure | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |

## Recovery Gates Before Any Future v1 Claim

1. Unified spec scope checked for the module.
2. Required features implemented or intentionally deferred in release notes.
3. Browser-verified UX at desktop and mobile widths for every user-facing path.
4. Loading, success, empty, error, and partial states checked where applicable.
5. Browser console, keyboard/focus, accessibility, and copy review recorded.
6. Adversarial mock validation completed for integration behavior.
7. Full local tests and lint/static checks pass.
8. `scripts/verify-release.sh` passes if present.
9. Documentation updated: README, CHANGELOG, user manual, security/release notes, docs index, and module docs.
10. Independent release-gate audit has no unresolved Blocker or Critical findings.
11. Installer/module-selection integration is proven for the module.
12. CI is green after push/merge/release.

## Drift Incident Log

- **2026-05-07:** the owner halted lateral release sweeping and required active-module locking.
- **2026-05-08 to 2026-05-10:** CivicInspect, CivicGrants, CivicProcure, and other scaffold-depth repos were treated as v1.0.0 despite insufficient product depth.
- **2026-05-09:** external audit identified 154 findings and confirmed the false-label pattern.
- **2026-05-10:** corrective decision recorded: CivicCode -> v0.5.0; CivicZone/CivicPlan/CivicPermit/CivicInspect/CivicGrants/CivicProcure -> v0.2.0; CivicCore/CivicClerk/CivicRecords AI split into recovery releases.
- **2026-05-10:** CivicCore v1.0.1 shipped as a recovery patch with auth-error-payload hardening. The auth hardening removes `token_roles`, `principal`, `principal_roles`, `client_host`, and `trusted_proxy_cidrs` from CivicCore auth error responses; CivicCore v1.0 is superseded.
- **2026-05-10:** CivicClerk v1.0.1 shipped as a recovery patch for QA-001. The default staff auth mode is now `protected`; anonymous writes to `/meeting-bodies`, `/meetings`, `/motions`, and `/votes` return 401 by default. `open` mode remains available only as an explicit local-rehearsal opt-in.
- **2026-05-11:** CivicRecords AI v1.5.0 shipped after migrating from CivicCore v0.22.1 to v1.0.1. The v1.5.0 release workflow exposed and fixed three latent release-infrastructure defects: release-notes YAML parsing, Windows runner attempting Linux Docker Compose verification, and a hermetic CI admin email using the `.local` reserved domain. The full-suite profile is re-enabled after this unified CivicCore pin alignment.
- **2026-05-11:** CivicCore v1.1.0 shipped with the shared `staff_key_gate` helper. CivicCode, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure now consume the hash-locked v1.1.0 wheel for the D2/B3 timing-safe staff-key rollout; CivicRecords AI and CivicClerk remain on the v1.0.1 recovery pin.
- **2026-05-21:** CivicZone v1.0.0 was published in error. The release workflow and suite truth passed release-plumbing checks, but the module did not meet the Section 2 FINISHED and SHIPPING bar. It is superseded by v0.2.1 corrective demotion.
- **2026-05-21:** CivicPlan v1.0.0 was published in error. The release workflow and suite truth passed release-plumbing checks, but the module did not meet the Section 2 FINISHED and SHIPPING bar. It is superseded by v0.2.1 corrective demotion.
- **2026-05-21:** CivicPermit v1.0.0 was published in error. The release workflow and suite truth passed release-plumbing checks, but the module did not meet the Section 2 FINISHED and SHIPPING bar. It is superseded by v0.2.1 corrective demotion.
- **2026-05-21:** CivicInspect v1.0.0 was published in error. The release workflow and suite truth passed release-plumbing checks, but the module did not meet the Section 2 FINISHED and SHIPPING bar. It is superseded by v0.2.1 corrective demotion.
- **2026-05-12:** CivicRecords AI v1.6.0 shipped after closing audit punch-list B2. The Phase 1 (#74) move into Docker secret files left `JWT_SECRET_FILE` and `FIRST_ADMIN_PASSWORD_FILE` pointer env names visible to the container env, which would have failed the directive's literal `docker compose exec -T api env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` acceptance command. Phase 1B (#76) removed the pointer env names and tightened the release verifier and contract test to the literal predicate. Phase 2 GREEN rehearsal at civicrecords-ai/.agent-runs/b2-phase2-rehearsal.md.
- **2026-05-15:** CivicRecords AI v1.6.1 shipped the Celery ingestion worker event-loop recovery patch. The records module remains developer preview until full promotion evidence is captured.
- **2026-05-18:** suite-truth verifier drift corrected after live GitHub showed CivicRecords AI v1.6.1 while `scripts/verify-suite-state.py` and the unified spec still treated v1.6.0 as current. The resolved state is that v1.6.1 is current and v1.6.0 appears only as historical B2 context.
- **2026-05-18:** active target reset to the Clerk-Core City Release. CivicCore, CivicRecords AI, CivicClerk, and the suite installer are the only active productization target; CivicContracts and later modules are paused. CivicRegWatch and CivicAPI are recorded as planned, non-selectable installer modules with no runtime repos, and this setup does not make a product-ready or city-ready claim.
- **2026-05-18:** clerk-core installed workflow proof added to the extracted-package lifecycle path. The optional proof exercises CivicRecords AI request/search-surface/review/response handling and CivicClerk agenda/packet/minutes/vote/notice/archive handling from an installed package. This is starter-profile workflow evidence only; it does not claim public-use readiness, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-19:** CivicSuite PR #150 fixed Clerk-Core installer CivicRecords port isolation by writing resolved `CIVICRECORDS_API_PORT` and `CIVICRECORDS_WEB_PORT` values into the copied runtime `.env`. Main verify run `26111415775` passed with `[civicrecords-ai] PASS 1.6.1`, `[clerk-core-workflow-proof] PASS`, `VERIFY-INSTALLER-PLAN: PASSED`, and `VERIFY-SUITE-STATE: PASSED`. Main installer-cleanroom run `26111415779` passed Linux matching-host install/repair/verify/backup/restore/uninstall lifecycle with workflow proof, `postgres_backup_dump`, and `restore_probe_pg_restore` evidence. This updates lifecycle and workflow evidence only; it does not claim public-use readiness, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-19:** CivicSuite PR #153 preserved Windows package-cleanroom evidence when archive extraction cleanup hits a Windows file-lock. Main verify run `26115385258` passed with `[civicrecords-ai] PASS 1.6.1`, `[clerk-core-workflow-proof] PASS`, `VERIFY-INSTALLER-PLAN: PASSED`, and `VERIFY-SUITE-STATE: PASSED`. Main installer-cleanroom run `26115385070` passed Linux matching-host install/repair/verify/backup/restore/uninstall lifecycle with workflow proof, `postgres_backup_dump`, and `restore_probe_pg_restore` evidence, plus Linux, Windows, and macOS archive readiness/plan jobs. Windows readiness now records `cleanup_error` and `extracted_bundle_retained=true` when host cleanup is blocked after a passed plan. This updates CI evidence handling only; it does not claim public-use readiness, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-19:** The clerk-core beta.3 release-gate package recorded the artifact decision after main verify run `26116871355` and installer-cleanroom run `26116871385`: publish `installer-clerk-core-v0.1.0-beta.3` only through a `release-tag` PR with updated SHA256 artifacts and green release-lockstep. Beta.3 may be described as an unsigned OSS beta for outside testing only; it must not be described as public-use ready, city-ready, procurement-ready, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-19:** `installer-clerk-core-v0.1.0-beta.3` was published from main SHA `a3ca9d75dc51f7e0928671b30c1693eca3a3fcae` after PR #156 passed release-lockstep run `26120937776`, main verify run `26121483231`, and main installer-cleanroom run `26121483212`. The release includes the Windows, macOS, and Linux clerk-core installer archives, `SHA256SUMS`, and release manifest. It remains an unsigned OSS beta for outside testing only; it is not public-use ready, city-ready, procurement-ready, production-ready, a full-suite release, a live cross-module records exchange claim, or a macOS lifecycle certification.
- **2026-05-20:** `installer-clerk-core-v0.1.0-beta.4` was published from synced main SHA `4aee5355e4a9bdb56850a16d3a10693e706f9278` and supersedes beta.3 without rewriting the public beta.3 tag. Beta.4 carries the same clerk-core starter package lineage and release evidence from PR #156/#157, including main verify run `26134412418`, installer-cleanroom run `26134412420`, and release-lockstep run `26134059097`. It remains an unsigned OSS beta for outside testing only; it is not public-use ready, city-ready, procurement-ready, production-ready, a full-suite release, a live cross-module records exchange claim, or a macOS lifecycle certification.
- **2026-05-20:** the Clerk-Core public-use readiness gate was recorded at `docs/installer/starter-set-public-use-readiness-gate.md`. At creation, the gate mapped beta.4 evidence to the recovery checklist and stayed RED pending audit, per-repo checks, final promotion docs/release-truth, release-gate audit, and fresh CI evidence.
- **2026-05-20/21:** installed Clerk-Core route/state evidence was added under `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.md` and `.json`, with screenshots for CivicRecords AI login/dashboard/search/request paths and CivicClerk public/staff/protected-state paths. The current regenerated matrix records 20 browser checks, 154 deduplicated installed routes, desktop/mobile coverage, loading/success/empty/error/partial state checks where supported, adversarial local integration probes, and restore-precondition behavior for a missing backup manifest. This is audit evidence for the public-use starter gate; it does not promote queued modules, city-ready full-suite status, production hosting certification, procurement readiness, live cross-module exchange, or macOS lifecycle certification.
- **2026-05-21:** the final package evidence branch regenerated unsigned Clerk-Core `0.1.0` archives after CivicClerk main `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d` merged the staff-session-gated protected API loading fix. Local Windows matching-host package lifecycle passed install, repair, verify, workflow proof, backup, restore, and uninstall; macOS remains beta-level archive/readiness only; CivicClerk and CivicRecords AI release verifiers passed locally. Final suite CI and release-gate audit later cleared the public-use starter gate.
- **2026-05-21:** `installer-clerk-core-v0.1.0` promoted the bounded Clerk-Core public-use starter release after final gate evidence cleared. Main verify run `26210542980` passed, main installer-cleanroom run `26210542979` passed after a transient Linux npm-network rerun, Windows matching-host lifecycle evidence exists for the regenerated package, and `docs/installer/clerk-core-public-use-release-gate-audit-2026-05-21.md` records no unresolved Blocker or Critical findings. This promotes only CivicCore + CivicRecords AI + CivicClerk through the Clerk-Core installer profile; it does not promote the full suite, procurement readiness, production hosting certification, airgap readiness, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-21:** CivicCode v1.0.0 was repaired and shipped as the first post-starter active module. PR #56 merged the v1 public-use module release line, PR #57 fixed the release workflow Playwright gate, main verify run `26219229208` passed, and release workflow run `26219395141` published `v1.0.0` with wheel, sdist, SHA256SUMS, release attestation, and attestation bundle assets. The repaired `v1.0.0` tag peels to `cb5f23eb437863b602df2ba2825bb72fd26e1154`; the old false-tag object `6dfd625cf895c6e0a9fc4038cc317adf58ce724c` is historical only. This promotes only CivicCode, not queued modules, the full suite, procurement readiness, production hosting certification, airgap readiness, or macOS lifecycle certification.
- **2026-05-21:** CivicAccess v1.0.0 was published in error. The release workflow and suite truth passed release-plumbing checks, but the module did not meet the Section 2 FINISHED and SHIPPING bar. It is superseded by v0.2.0 corrective demotion.

## Language Rules

Use: "demoted recovery label", "developer preview", "foundation surface", "mock integration", "recovery patch required".

Do not use for demoted modules: "v1.0.0", "product-ready", "city-ready", "shipping product", "production-usable", or "done". CivicCode, CivicAccess, CivicZone, CivicPlan, CivicPermit, and CivicInspect are no longer in the demoted-module set after their 2026-05-21 v1.0.0 release gates.
