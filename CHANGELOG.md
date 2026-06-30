# Changelog

All notable changes to the civicsuite umbrella repo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Release recovery notice (2026-05-09)

The block of entries below dated 2026-05-01 through 2026-05-08 referring to "compatibility publication," "shipping records product," "shipping flagship," "v1.0.0," and similar promotion-language are **doc-update entries against tags that are now frozen pending recovery gates** (see `docs/release-recovery-status.md`). They are preserved here as historical record but should not be read as ship signals.

The 2026-05-07 release-workflow-failure handoff (`HANDOFF_2026-05-07_CIVICSUITE_RELEASE_WORKFLOW_FAILURE_AND_SHUTDOWN.md`) explains the context: a lateral v1.0 sweep across multiple repos was halted by the project owner. Three of those repos (civicinspect, civicgrants, civicprocure) subsequently received v1.0.0 tags between 2026-05-07 and 2026-05-08 in a continuation of the same workflow violation. None of those tags constitute promotion.

This changelog will be split going forward: (a) doc / governance / spec changes go here; (b) per-module ship signals go in each module's own CHANGELOG. Inline version numbers in this file may be stale; the canonical pairing source is [docs/compatibility/index.md](docs/compatibility/index.md).

---

## [Unreleased]

### Changed

- **2026-06-30 (later3).** fix(citycore): close round-2 GauntletGate findings on PR #216 (4 new Major + ~16 Minor/Nit found by an independent re-audit of the round-1 fix; 0 Blocker/Critical both rounds). The round-1 fix patched TEST-10's newline-injection case in one caller; round 2 moved the sanitization into the shared `push_audit()` itself so every module's audit summaries are covered, not just civicaccess's. The new FIFO cap on `audit_events` had frozen the old timestamp+count id scheme into permanent collisions once the cap stabilized — switched to UUIDv4 (matching the precedent already set for review IDs) and added a boundary test. The new `civicaccess-delete-review` confirm dialog used a native `window.confirm()` inconsistent with the app's only other destructive-action pattern (`GUIDED_WORK_ACTIONS`) — rewired through that shared mechanism instead, including row-scoped payload passthrough into the confirm step. A shared help line claimed every required field "doesn't block saving," which was false for 4 of 7 forms (Plain-Language, Multilingual x2, ADA Title II) — softened the copy to be accurate for both behaviors and added the missing `aria-required`/`*` markers to the 3 fields that actually were hard-required but unmarked. Also: pagination on the saved-review list (20 at a time, "show all" toggle) since only the audit-events mirror had a cap, not the reviews themselves; a regression test proving a civicaccess-only profile can reach `search-city-knowledge` (TEST-3's prescribed test, never added even though its refutation held); per-row busy-state now keyed by action+reviewId so unrelated rows don't disable together; `:disabled` button styling; a Rust/JS disclaimer-string mismatch (the Rust constant was unused but worded differently — now byte-identical); a redundant "open the desktop app" phrase appearing twice in one message; the two remaining un-fixed disclaimer drafts (announcement + release notes) brought to the verbatim canonical sentence; release notes' unsupported "planned v1.0.3" claim softened to "not yet scheduled." Cargo 169/169, `npm test` PASS, Playwright 17/17. Full findings: `gauntletgate-civicaccess-module6-2026-06-30-round2/` (Cowork-local).
- **2026-06-30 (later2).** fix(citycore): close the GauntletGate full-lane punch list on PR #216 (5 Critical + 18 verified Major/Minor/Nit; one Test-role finding each on module guards and the search-city-knowledge allow-list was investigated and refuted against the actual source). Highlights: `aria-current="page"` on the active primary-nav item; per-field input-length caps on all 8 civicaccess handlers mirroring upstream Pydantic limits (title 500 / body+text 5000 / language 80 / list items 100-200, with a max-item-count cap) closing an unbounded-paste DoS surface; `main` branch protection now requires the MSI/integration/lifecycle checks in addition to `verify`; `records-export` renamed to `civicaccess-records-export` (collision-safe prefix) with a matching module guard, dispatcher arm, and UI button; review IDs switched from a predictable timestamp+counter scheme to UUIDv4; new `civicaccess-delete-review` action + UI button + module guard (with a confirm prompt) so saved reviews can be removed; FIFO cap on the per-module `audit_events` mirror at 5,000 entries; `next_steps` + `disclaimer` fields added to action results and populated for every civicaccess handler; form labels associated via `for`/`id` with `aria-required` + a top-of-section help line on every required field; a primary-action button on "Run Review & Save"; a single canonical advisory-disclaimer sentence used everywhere (in-UI banner + per-row + empty state + `USER-MANUAL.md` + `FAQ.md`); status pills mapped to clerk-readable labels; a loading/`aria-busy` state on in-flight workflow actions; clearer browser-preview "desktop app required" guidance across all city-work actions; new USER-MANUAL.md Part 1.6 walkthrough for the Accessibility tab; new FAQ.md entry on ADA Title II compliance; six additional Playwright assertions (one per remaining form-submit button) plus a malformed-payload-fallback assertion; five additional cargo assertions for previously-untested branches (tagged-PDF empty-payload, publishing-workflow and ADA happy paths, the `vi` multilingual sample, the 80-word long-copy finding) and full coverage of the jargon map plus its title-cased forms; a newline-injection adversarial test on the audit log; CI lifecycle job now also runs the civicaccess cargo suite and checks for real per-user-data leakage after uninstall. Cargo 167/167, `npm test` PASS, Playwright 17/17. Companion fixes pushed to PR #217 (reverse-direction `fallbackState` drift-guard check) and PR #215 (historical-snapshot callout on the 2026-06-29 deep-read audit). Full findings + fix paths: `gauntletgate-civicaccess-module6-2026-06-30/REPORT.md` (Cowork-local).

- **2026-06-30.** feat(citycore): CivicAccess v1.0.2 desktop UI integration — the clerk-facing Accessibility workflow tab now ships in the desktop shell, closing the v1.0.1 documentation/UI gap surfaced by the [2026-06-29 deep-read audit](docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md). Mirrors the CivicNotice integration shape: native Rust port of `access_review.py` + `plain_language.py` + `multilingual.py` + `workflows.py` into `desktop/src-tauri/src/workflows.rs` against a new `state.access` field on `CityWorkState`; `renderAccessibilityWorkflow()` panel with seven `data-work-action` forms (WCAG review, plain-language rewrite, multilingual variant, accessible form plan, publishing-workflow checklist, ADA Title II plan, tagged-PDF expectations) plus a saved-review list with a per-row records-ready export button; `Accessibility` primary-nav entry; `civicaccess` added to `MODULE_AREA_BY_ID` + `CITY_CORE_PRODUCT_MODULE_IDS` + `fallbackState.modules` + `installed_module_ids` + `search-city-knowledge` (CivicAccess reviews now surface in cross-module Search alongside meetings/records/code/notices). CivicCore audit chain extended with a per-module `audit_events` vec mirroring civicaccess's standalone Postgres `audit_events` table. Version bump `1.0.1 -> 1.0.2` in `Cargo.toml` + `tauri.conf.json`. Tests: cargo end-to-end (`civicaccess_actions_save_review_export_and_emit_deterministic_findings` + new `civicaccess_actions_reject_invalid_inputs` covering 11 trust-boundary error paths, 167/167 cargo pass) + Playwright spec (`civicaccess accessibility tab renders the seven workflow forms and refuses persistence from preview`, 17/17 pass). Phase B token + schema + role wiring is consumed as-is; no civicaccess re-cut needed (still v0.4.0, source_commit 7b24516). Companion fixes in the same PR (#216) sweep pre-existing module-count parity bugs in the fallbackState city-core profile description, `renderModuleSelection()` profile-choice strings, the Search-page lead text, and the civicaccess module-card metadata (route/service/task counts aligned with canonical `installer/modules.json`).

- **2026-06-29.** release/installer: promote **CivicAccess v0.4.0** (`source_commit 7b24516fd89584d84c12394b9385eddd1e8c6897`) to the **sixth city-core module** after a passing depth re-probe reversed the 2026-05-23 NEEDS-WORK demotion. The city-core profile is now `civiccore, civicrecords-ai, civicclerk, civiccode, civicnotice, civicaccess`; the registry, module contract, every hard-coded 5-module gate (`verify-suite-state.py`, `verify-installer-plan.py`, the desktop cargo tests, the contract test), the compatibility matrix, the UnifiedSpec, and the public truth surfaces were flipped to six in one lockstep changeset, and `verify` + the desktop cargo tests pass. This is a truth/registry milestone, **not** the program Definition of Done (clean-VM acceptance is Phase D). The current published v1.0.1 MSI bundles the first five city-core modules; the six-module MSI is the next build.

- **2026-06-28.** release: open CivicSuite Windows Local **1.0.1** as a **GA candidate / public beta**. The `civicsuite-windows-local-v1.0.1` release (Latest; MSI SHA-256 `5a1e5e2e4d2f3d7f77c52f108c4445c85db10ff3edc2c151d6bbae1cd97ce3ea`, 1,645,479,777 bytes) was validated end-to-end on a clean Windows Sandbox (QA-B1 PASS: install -> first-run -> 6.97 GB model download/verify/load -> real AI completion -> clerk records round-trip -> backup/restore -> uninstall) and closed two adversarial readiness audits at zero open Blocker or Critical findings (remaining items are documented, non-blocking follow-ups). The build is opened for public hands-on use now; the one remaining gate to General Availability is Authenticode code-signing, in progress via the SignPath Foundation (see `CODE_SIGNING_POLICY.md`), so the MSI ships unsigned for the beta. This is **not** a public-use, city-ready, procurement-ready, production-ready, macOS lifecycle, or full-suite promotion claim; CivicAccess remains out of city-core and Tier 2 modules remain queued. Public announcement copy in `ANNOUNCEMENT.md`.

- **2026-06-13.** chore(installer): advance the CivicCore city-core `source_commit` pin to merged main head `1a53f0680fffce34efeb939cbeb9915b6e208d6c`. The package version remains `v1.2.0`; this source pin adds the Windows-local platform contracts and PostgreSQL-backed task queue/worker needed by the Tauri/WebView2 desktop runtime supervisor.
- **2026-06-13.** chore(ledger): record CivicClerk v1.0.4 as the current city-core meeting workflow release car while preserving the suite boundary. CivicClerk v1.0.4 was published from tag commit `9f63ab79a0a75611ec3221d77e8577a95501e4c7`; the release workflow preflight and verify-build jobs passed in run `27451630904`, and PR #176 repaired the draft-release asset upload workflow for future tags. The suite installer vendored-source pin advances to CivicClerk `main` head `dae807ec9d1370dd22cf6aba88e4c6fc6b4168d5`, which includes the workflow-only release repair. The same lockstep pass also refreshes CivicRecords AI's source pin to post-PR-#102 `master` head `538766523ad90ee7553b0ffa75b626d3d4850b17` without changing the published v1.7.3 release object. This does not create a new city-ready, procurement-ready, production-ready, macOS lifecycle, public-use, or full-suite promotion claim.
- **2026-05-28.** fix(audit): continue the all-findings audit-team closure pass for run `2026-05-28-city-core-real-non-technical-release`. The closure batch now records shared suite-session revocation persistence, bounded fallback revocation caches, Records AI prototype-token shell work, launcher discoverability/config cleanup, audit-gate authority policy, audit artifact completeness policy, workflow-cost replay policy, user-manual artifact currency policy, naming-honesty policy, and refreshed source-pin lockstep evidence. Final status promotion remains blocked until independent `audit-team-claude` reruns against the final five heads.
- **2026-05-30.** chore(recovery): restore the post-deletion Stage 0 recovery baseline and installable local pre-push hook source so city-core work is committed and pushed slice-by-slice instead of accumulating as a dirty worktree.
- **2026-05-30.** chore(installer): restore the recovered CivicCode city-core `source_commit` pin to post-PR-#76 `main` head `a960bba0a2249d118b593dd61bee3a65a69a9d77`, preserving the already-published module release objects while matching the live module default-branch state.
- **2026-05-29.** test(auth): add a city-core suite-session contract test that issues one CivicCore token, validates it through Records AI, CivicClerk, and CivicCode adapters, then revokes it once through the shared revocation file. The CivicCode fixture now uses the searchable `CIVICCORE_SUITE_SESSION_SECRET` literal, and the CivicCode source pin advances to the post-PR-#75 `main` head `9284fd1a0704541b3422e5dd0ba47bea3713825a`.
- **2026-05-29.** chore(installer): update city-core `source_commit` pins for the merged real non-technical-release module heads. CivicCore now pins to `9f7e3a5a0156fca779b48076d49c13181d15151c`, CivicRecords AI to `ae34a499c1e0794d3322146369f798f19bd0a146`, CivicClerk to `f39d0eeccc6804b86c542b4cdffe4fab0665d503`, and CivicCode to `9284fd1a0704541b3422e5dd0ba47bea3713825a` for local vendored-source verification without changing the already-published release objects. The installer-cleanroom workflow checks out those same source roots so CI packaging and `installer/modules.json` stay in lockstep.
- **2026-05-27.** docs: clean city-core operator truth surfaces. FAQ now frames forbidden public-use/procurement/production/full-suite/macOS claims only as negated boundaries and keeps CivicAccess out of the city-core path. README, STATUS, USER-MANUAL, docs index, troubleshooting, unified spec, recovery status, and downstream pins now point operators at the suite launcher, Linux Docker signed-repository bootstrap, local shared launcher session boundary, and live regenerated hash/source-pin/attestation trust path instead of restored `installer/dist` artifacts.
- **2026-05-27.** chore(installer): add explicit `source_commit` fields to `installer/modules.json` and enforce them in `scripts/plan-installer.py`, `scripts/run-clerk-core-installer.py`, `scripts/verify-suite-state.py`, and the installer-cleanroom workflow source checkouts. This keeps the vendored-source installer path reproducible without switching to published wheels. CivicRecords AI now pins to `59cabcbe5072d0c843fd57356a7d113bf90537f1`, the post-PR-#100 merge commit carrying the CRIT-1 mobile skip-link fix.
- **2026-05-27.** docs: reconcile city-core beta-ready truth after audit-full. PR #183 has green verify, release-lockstep-gate, and installer-cleanroom checks on head `5654f5e`; local Windows and Linux first-run browser QA evidence is preserved under `C:\dev\Claude\CivicSuite-city-core-caboose-item1\.agent-runs\2026-05-26-city-core-non-technical-installable\`, and audit-full records zero unresolved Blocker or Critical findings. The honest state is beta-ready truth-reconciled; this still does not claim public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, or full-suite release.
- **2026-05-27.** ci: close city-core PR evidence loop. PR #183 has green verify, release-lockstep-gate, and installer-cleanroom checks, including Linux lifecycle for clerk-core and city-core archives plus Windows readiness and macOS beta readiness; exact volatile PR run IDs are recorded in the PR body and run evidence. CivicRecords AI PR #100 is green at `d7f84a3` for CI run `26487863170`. At this checkpoint the remaining promotion caveat is audit-full; this still does not claim public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, or full-suite release.
- **2026-05-27.** fix: close city-core wrapper first-run browser QA. Windows `.cmd` and Linux `.run` one-click artifacts now have local first-run browser evidence through wizard, lifecycle install, forced Records AI admin password rotation, old generated credential rejection, rotated credential login, Records AI dashboard, CivicClerk staff surface, and CivicCode search at desktop and mobile widths. Windows WSL lifecycle forwarding now preserves `CIVICSUITE_FIRST_ADMIN_EMAIL`, `CIVICSUITE_INSTALLER_PORT_OFFSET`, `CIVICSUITE_INSTALLER_PROJECT_SUFFIX`, and `DOCKER_CONFIG`; the lifecycle runner retries transient Docker Compose dependency-health races. Remaining promotion caveat is audit-full; this still does not claim public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, or full-suite release.
- **2026-05-26.** chore: record city-core non-technical installability truth. The city-core profile now has regenerated vendored-source Windows and Linux one-click artifacts at installer version `0.1.2`, Guided/Manual Docker prerequisite setup paths, first-run wizard smoke evidence, 60 GB matching-host cleanroom hygiene, and local Windows/Linux install-repair-verify-backup-restore-uninstall lifecycle evidence. The initial honest status required CI and audit evidence; the 2026-05-27 entry records CI closure. This does not claim public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, or full-suite release.
- **2026-05-25.** v0.1.2 - city-core profile defaults records-ai to PORTAL_MODE=public. A records system without public submission is not a city records system. Smaller profiles retain the private default unless explicitly flipped.
- **2026-05-25.** chore: align city-core installer truth with CivicRecords AI v1.7.3. The release-asset convention bring-up did not change installer behavior, but the rebuilt vendored-source city-core installer now expects the v1.7.3 Records health version and records the current module-car version consistently.
- **2026-05-23.** docs: add module-extensibility checklist and scaffold template. New module work now has a suite-level checklist, copyable baseline files, and a warning-only scaffold layout check in `verify-suite-state.py`.
- **2026-05-23.** chore: city-core release-train truth reconciliation. CivicCore v1.2.0, CivicRecords AI v1.7.2, CivicClerk v1.0.3, and CivicCode v1.0.8 are the city-core release cars; CivicRecords AI v1.7.2 supersedes v1.7.1 after the clean installer lifecycle exposed and repaired a bad frontend lockfile tarball reference. CivicAccess is excluded after a NEEDS-WORK depth probe; CivicZone, CivicPlan, CivicPermit, and CivicInspect are recorded as no-functional-upgrade v0.2.2 demotion releases queued for Tier 2 real work. This prepares the umbrella truth for the city-core installer and integration-proof caboose without claiming city-core is released beyond beta-ready status.
- **2026-05-21.** chore: CivicPermit v1.0.0 suite-truth reconciliation. Superseded by the 2026-05-23 v0.2.2 no-functional-upgrade demotion truth; queued for Tier 2 real work.
- **2026-05-21.** chore: CivicInspect v1.0.0 suite-truth reconciliation. Superseded by the 2026-05-23 v0.2.2 no-functional-upgrade demotion truth; queued for Tier 2 real work.
- **2026-05-21.** chore: CivicPlan v1.0.0 suite-truth reconciliation. Superseded by the 2026-05-23 v0.2.2 no-functional-upgrade demotion truth; queued for Tier 2 real work.
- **2026-05-21.** chore: CivicZone v1.0.0 suite-truth reconciliation. Superseded by the 2026-05-23 v0.2.2 no-functional-upgrade demotion truth; queued for Tier 2 real work.
- **2026-05-21.** chore: CivicCode v1.0.0 suite-truth reconciliation. Superseded by CivicCode v1.0.8 in the 2026-05-23 city-core release train.
- **2026-05-21.** chore: CivicAccess v1.0.0 suite-truth reconciliation. Superseded by the 2026-05-23 NEEDS-WORK depth probe; CivicAccess is OUT of city-core until gap closure and re-probe.
- **2026-05-21.** release: promoted the bounded Clerk-Core public-use starter release. The final release truth points at `installer-clerk-core-v0.1.0`, main verify run `26210542980`, main installer-cleanroom run `26210542979`, Windows matching-host lifecycle evidence, macOS beta-level archive/readiness evidence, and the Clerk-Core release-gate audit with no unresolved Blocker or Critical findings. Scope remains CivicCore + CivicRecords AI + CivicClerk only; this is not a full-suite, procurement, production hosting, airgap, live cross-module records exchange, or macOS lifecycle certification claim.
- **2026-05-20.** docs: added Clerk-Core installed route/state matrix evidence. The new evidence records CivicRecords AI and CivicClerk public/staff/API route inventory, desktop/mobile browser QA, UI state checks, adversarial local integration mocks, and missing-backup restore-precondition behavior while keeping the public-use gate RED pending independent audit and final promotion evidence.
- **2026-05-21.** docs: recorded regenerated Clerk-Core final package evidence after CivicClerk main `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d`. The evidence records new unsigned Windows/macOS/Linux archive checksums, Windows matching-host install/repair/verify/workflow/backup/restore/uninstall proof, macOS beta-level archive/readiness proof, and a hardened structured public-use matrix verifier while keeping the public-use gate RED.
- **2026-05-20.** docs: added the Clerk-Core public-use readiness gate. The new gate maps beta.4 evidence to the release-recovery checklist, records RED/YELLOW blockers before any promotion beyond outside-test beta, refreshes the docs landing page, and adds a docs verifier check for current-facing starter-product overclaims.
- **2026-05-20.** release: published clerk-core beta.4 installer artifacts. GitHub prerelease `installer-clerk-core-v0.1.0-beta.4` points at synced main SHA `4aee5355e4a9bdb56850a16d3a10693e706f9278` and supersedes beta.3 without rewriting the public beta.3 tag. This remains an unsigned OSS beta outside-test release only; it is not a public-use, city-ready, procurement-ready, production-ready, full-suite, live cross-module exchange, or macOS lifecycle certification claim.
- **2026-05-19.** release: published clerk-core beta.3 installer artifacts. GitHub prerelease `installer-clerk-core-v0.1.0-beta.3` now points at main SHA `a3ca9d75dc51f7e0928671b30c1693eca3a3fcae` and includes Windows, macOS, and Linux clerk-core installer archives, `SHA256SUMS`, and the release manifest. This is an unsigned OSS beta outside-test release only; it is not a public-use, city-ready, procurement-ready, production-ready, full-suite, live cross-module exchange, or macOS lifecycle certification claim.
- **2026-05-19.** docs: clerk-core beta.3 release gate package. The release-gate package prepared `installer-clerk-core-v0.1.0-beta.3` after PR #150/#153/#155 evidence, requiring a `release-tag` PR, release-lockstep, and main CI before publication; this was an unsigned OSS beta decision, not a public-use, city-ready, procurement-ready, live cross-module exchange, or macOS lifecycle certification claim.
- **2026-05-19.** fix: clerk-core package cleanroom evidence baseline. PR #153 preserves Windows readiness/plan evidence when extraction cleanup hits a Windows file lock, and PR #155 syncs the public docs to main verify run `26116871355` plus installer-cleanroom run `26116871385`.
- **2026-05-19.** fix: clerk-core CivicRecords port isolation. PR #150 writes resolved CivicRecords AI API/web ports into the copied runtime `.env`, keeping installed package lifecycle runs on isolated CI ports.
- **2026-05-18.** chore: clerk-core installed workflow proof. The extracted-package cleanroom lifecycle can now request optional installed-stack workflow proof for CivicRecords AI request/search-surface/review/response handling and CivicClerk agenda/packet/minutes/vote/notice/archive handling. This remains lifecycle and workflow evidence for the starter profile only; it does not claim public-use readiness, live cross-module records exchange, or macOS lifecycle certification.
- **2026-05-18.** chore: clerk-core city release target setup. The active control-plane target is now the CivicCore + CivicRecords AI + CivicClerk starter product, the v0.9.0 agent-pipeline scope-lock plumbing is present, CivicRegWatch and CivicAPI are recorded as planned non-selectable installer modules, and no public-use/product-ready claim is made.
- **2026-05-18.** fix: civicrecords-ai v1.6.1 suite-truth verifier alignment. The suite-state verifier and unified spec now treat CivicRecords AI [v1.6.1](https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.6.1) as the current developer-preview records release, while preserving v1.6.0 as the historical B2 Docker secret-file recovery.
- **2026-05-15.** chore: installer cleanroom certification truth. Package cleanroom reports now carry explicit evidence classification, host/platform matching, mutability, and certification-scope fields; the clerk-core lifecycle runner resolves run-id/CLI-controlled ports and Compose project names; the installer workflow drops the daily cron and keeps concurrency plus short artifact retention. Linux remains the matching-host lifecycle proof path; Windows and macOS wrapper evidence remains bounded until matching-host lifecycle evidence is recorded on those hosts.
- **2026-05-14.** chore: installer truth-hygiene ledger. Recorded the prior installer truth-hygiene work in the umbrella changelog without promoting the suite: the clerk-core package remains an unsigned OSS beta, macOS remains archive/readiness only, and native installer/signing plus procurement-readiness claims remain future gates.
- **2026-05-12.** chore: civicrecords-ai v1.6.0 B2 audit punch-list closure. CivicRecords AI [v1.6.0](https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.6.0) closes audit punch-list B2 by moving `JWT_SECRET` and `FIRST_ADMIN_PASSWORD` material into Docker Compose secret files and removing the `_FILE` pointer env names from the container env. The literal `docker compose exec -T api env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` acceptance command now returns zero lines. CivicCore pin remains at v1.0.1.
- **2026-05-10.** chore: civiccore v1.0.1 suite-truth reconciliation. The umbrella truth surface now records CivicCore [v1.0.1](https://github.com/CivicSuite/civiccore/releases/tag/v1.0.1) as the current shared-platform recovery patch, including auth-error-payload hardening documented by [`docs/audits/civiccore-audit-full-2026-05-07.md`](docs/audits/civiccore-audit-full-2026-05-07.md). Downstream CivicCore pins for CivicClerk, CivicCode, CivicZone, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure now reconcile to the v1.0.1 wheel.
- **2026-05-10.** chore: civicclerk v1.0.1 suite-truth reconciliation. CivicClerk [v1.0.1](https://github.com/CivicSuite/civicclerk/releases/tag/v1.0.1) is now the current recovery label after the QA-001 security-default fix. Fresh installs deny anonymous staff writes by default, `open` mode is explicit opt-in for local rehearsal, and installer truth now records the protected default.
- **2026-05-11.** chore: civicrecords-ai v1.5.0 / civiccore v1.0.1 alignment. CivicRecords AI [v1.5.0](https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.5.0) now consumes CivicCore v1.0.1, restoring a unified active-suite CivicCore pin and re-enabling the full-suite installer profile.
- **2026-05-11.** chore: civiccore v1.1.0 staff-key gate suite-truth reconciliation. CivicCore [v1.1.0](https://github.com/CivicSuite/civiccore/releases/tag/v1.1.0) adds `staff_key_gate`, a shared timing-safe staff-key helper that closes audit D2/B3 for the six downstream modules in this rollout: CivicCode, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure.

### Added

- **2026-05-09.** Drafted umbrella documentation rewrite suite at `audit-civicsuite-2026-05-09/doc-rewrites/`: refreshed README, new STATUS.md (module-by-module honest status), new FAQ.md (civic-operator FAQ), new ARCHITECTURE.md (with Mermaid suite diagram), refreshed USER-MANUAL.md with "Your first task" walkthrough, and updated release-recovery-status.md with drift incident log for the three v1.0.0 drift repos.
- **2026-05-09.** Documented the three v1.0.0 drift repos (civicinspect, civicgrants, civicprocure) in the recovery-status doc.

### Changed

- **2026-05-09.** Reframed the 2026-05-01 → 2026-05-08 changelog cluster as doc-update entries (release recovery notice above).

---

## [civicsuite-windows-local-v1.0.1] - 2026-06-26

Security-critical patch to the Windows-local beta desktop build, published as
`civicsuite-windows-local-v1.0.1` (built from `bae1111a`) and promoted to Latest.
It supersedes `civicsuite-windows-local-v1.0.0` and retires the
`windows-local-msi-firstrun-fix-rc1` candidate, whose MSI predated these fixes.

This remains a **beta** build. It does not claim public-use readiness, city-ready
status, procurement/production readiness, macOS lifecycle certification, or
full-suite release.

### Hardening (post-criticals beta pass)

- Build/installer version raised `0.1.0` → `1.0.1` to match the release label
  (ARP / ProductVersion now read `1.0.1`; the same-version-upgrade WiX contract is
  unchanged).
- Defense-in-depth: remaining backend-origin strings are `escapeHtml`-escaped at
  the app-chrome / setup / model / module render sinks (city-work surfaces were
  already escaped by C1).
- Local sign-in passcode throttle/lockout (5 failures → 60s cooldown, reset on
  success; constant-time compare preserved).
- External Windows system binaries are spawned by absolute `%SystemRoot%` paths
  instead of bare names (PATH-hijack hardening) across the renderer/model paths
  (`model.rs`, `local_shell.rs`) and the service supervisor (`supervisor.rs`:
  `powershell.exe`, `compact.exe`, `tasklist.exe`, `taskkill.exe`).
- The MSI unsigned-beta install notice lists all five city-core modules
  (adds CivicNotice), matching the documented set.
- First-run model step now states the ~6.97 GB download size, a rough time
  estimate, and that it resumes if interrupted; a non-fatal low-RAM preflight
  warning mirrors the existing low-disk preflight.

### Security

- **C1** — stored/reflected XSS hardening across the desktop (Tauri/WebView2)
  renderer surfaces, with an added browser XSS backstop test
  (`desktop/tests/browser/xss-backstop.spec.mjs`, `desktop/tests/xss-and-state.mjs`).
- **C2** — atomic state writes, eliminating torn/partial state files on a crash
  or power loss mid-save.
- **C3** — single-instance enforcement, preventing concurrent instances from
  corrupting shared local state.
- **ENG01/ENG02/ENG03** — supporting engineering hardening landed alongside the
  criticals.

### Added (CI)

- **T-C1** — the desktop↔CivicCore real-runtime integration test now actually
  runs (prepares the portable PostgreSQL/worker payload and exercises the wired
  contract) instead of being a silent no-op when its env gate was unset.
- **T-C2** — the Windows MSI is now installed, exercised through
  first-run/backup-restore lifecycle logic, and uninstalled in CI. The main
  binary is discovered by scan (`civicsuite-desktop.exe`, the Cargo binary name)
  rather than a hardcoded `CivicSuite.exe`, and the install dir is resolved from
  the ARP `DisplayIcon` when `InstallLocation` is empty.

### Validated (QA-B1, clean machine)

- The **shipped `CivicSuite_1.0.1_x64_en-US.msi`** was validated **end-to-end** on a
  **fresh Windows Sandbox with no prior CivicSuite install** (20 GB RAM, disposable
  Windows): install (`msiexec /i` exit 0) → app launches and the WebView2 window
  renders → single-instance holds on a 2nd launch → full first-run wizard (city
  profile, first admin, modules) → **6.97 GB Gemma model download + checksum +
  Ollama load → a real local AI completion** → a clerk **records-intake workflow**
  (submit + look up a public records request, round-trip through PostgreSQL) →
  **backup + restore** → uninstall. Verdict: **PASS** (all checks). An earlier
  install/verify/uninstall-only pass also covered the 0.1.0-internal pre-bump build.

### Artifacts

- `CivicSuite_1.0.1_x64_en-US.msi` — SHA-256
  `5a1e5e2e4d2f3d7f77c52f108c4445c85db10ff3edc2c151d6bbae1cd97ce3ea`
  (1,645,479,777 bytes); ARP/installer version reads **1.0.1**. This is the exact
  artifact clean-machine-validated end-to-end above and attached to the
  `civicsuite-windows-local-v1.0.1` release. Unsigned beta MSI; SmartScreen
  guidance is "More info → Run anyway"; no Docker or WSL prerequisite.
- Retired `windows-local-msi-firstrun-fix-rc1` MSI for the record:
  SHA-256 `2f5038298a1ff36a901b885010243ab36c30e068ba36ac225907b1f98d4955cb`,
  built `2026-06-25T23:50:50Z` (pre-fix); the unpatched installer was removed
  from that release.

---

## Historical entries (preserved; framing reset by 2026-05-09 recovery notice above)

The following entries are kept as historical record. Their inline "shipping," "compatibility publication," "v1.0.0," and similar promotion language refers to release labels that are currently **frozen pending recovery**. Do not read these as ship signals.

### Added (pre-recovery)

- **Deployment profile wheel-contract fix** (2026-05-06): the post-foundation
  Docker demo now pins CivicCode `v0.1.18` to the published `civiccore v0.22.0`
  wheel required by that release artifact, and the deployment-profile verifier
  now inspects module wheel metadata so CI catches compose/package dependency
  mismatches before runtime boot.
- **CivicSuite truth-source refresh after audit-full** (2026-05-06): compatibility
  matrix, suite-state verifier, deployment-profile verifier, demo compose pins,
  README, README.txt, user manual, roadmap, and landing page now record
  CivicCore `v1.0.0`, CivicClerk `v1.0.0`, CivicCode `v0.1.18`, and the
  current local CivicNotice `v0.1.2` split instead of stale pre-1.0 values.

  *(Recovery note: these label changes are doc reflections of release tags now under recovery freeze.)*

- **CO-7 CivicCore freeze lockstep** (2026-05-05): compatibility matrix,
  suite-state verifier, and unified spec now record CivicCore `v0.22.1` as the
  attested baseline and document the placeholder-namespace audit before the
  freeze-line tag.

  *(This entry is real and is the most defensible "shipping" claim in the cluster — v0.22.1 is the attested baseline. v1.0 carries that attestation forward but has not re-earned it under the recovery gates.)*

- **CivicCode v0.1.17 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.16 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.15 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.14 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.13 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.12 compatibility publication** (2026-05-04) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.7 compatibility publication** (2026-05-03) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCode v0.1.6 compatibility publication** (2026-05-03) — *doc-update entry; CivicCode tag frozen pending recovery.*
- **CivicCore v0.21.0 / CivicRecords AI v1.4.8 / CivicClerk v0.1.19 compatibility publication** (2026-05-03) — *doc-update entry; tags frozen.*
- **CivicCore v0.20.0 / CivicRecords AI v1.4.7 / CivicClerk v0.1.18 compatibility publication** (2026-05-02) — *doc-update entry; tags frozen.*
- **CivicCode v0.1.5 compatibility publication** (2026-05-02) — *doc-update entry; tag frozen.*
- **CivicCode v0.1.4 compatibility publication** (2026-05-02) — *doc-update entry; tag frozen.*
- **CivicCode v0.1.2 compatibility publication** (2026-05-02) — *doc-update entry; tag frozen.*
- **CivicCore v0.19.0 / CivicRecords AI v1.4.6 / CivicClerk v0.1.17 compatibility publication** (2026-05-02) — *doc-update entry; tags frozen.*
- **CivicCore v0.18.1 / CivicRecords AI v1.4.5 / CivicClerk v0.1.16 compatibility publication** (2026-05-02) — *doc-update entry; tags frozen.*
- **Roadmap precision after CivicClerk OIDC/live-sync completion** (2026-05-02) — *the roadmap-precision entry is real; the underlying claim that "OIDC browser-session support and vendor-network live sync" are shipped foundations is mock-validated, not production-validated. See STATUS.md and DOC-024 in audit-civicsuite-2026-05-09.*
- **CivicRecords AI v1.4.4 compatibility publication** (2026-05-01) — *doc-update entry. The phrase "the published shipping records product" used in the original entry is overstated; civicrecords-ai's own README labels v1.4.10 as "do-not-promote."*
- **CivicClerk v0.1.13 compatibility publication** (2026-05-01) — *doc-update entry; tag frozen.*
- **CivicRegWatch and CivicAPI planning specs** (2026-04-30) — *real entry. Specs added; no runtime work yet.*
- **Compatibility matrix catch-up for active CivicCore rollout lines** (2026-04-29) — *real entry.*
- **Continuity gate and canonical roadmap reset** (2026-04-29) — *real entry. SUCCESSION.md added; this is the original honesty-framing intervention.*
- **Phase 0 continuity closeout** (2026-04-29) — *real entry. Second org owner added.*

- **CivicRecords AI v1.4.1 compatibility update** (2026-04-28): compatibility matrix and downstream docs updated to reflect the records patch release. *Real entry, but the "shipping" framing predates the recovery freeze.*
- The **2026-04-27 to 2026-04-28 cluster** of v0.1.0 → v0.1.1 module-foundation publications represents real foundation-tier release work across the catalog. These tags exist and are not under recovery freeze (v0.1.x is the foundation tier, which has not been claimed as product-ready). They are best read as: "this module repo now exists with the minimum scaffolding."
- **Post-foundation sequence correction** (2026-04-27) — *real entry.*
- **Post-foundation hardening plan** (2026-04-27) — *real entry.*
- **Suite-state verifier** (2026-04-27): `scripts/verify-suite-state.py` added. *Real entry.*
- **Local demo deployment profile** (2026-04-27) — *real entry.*
- **Shared shell boundary** (2026-04-27): ADR-0004 + shared shell UX inventory added. *Real entry.*
- **Connector import/export boundary** (2026-04-28): ADR-0005 + suite connector template added. *Real entry.*
- **CivicCore v0.3.0 extraction proposal** (2026-04-28): ADR-0006 + bounded proposal added. *Real entry.*
- **CivicClerk production-depth workflow plan** (2026-04-28): ADR-0007 + first integrated production-depth sprint plan added. *Real entry.*

- Added `docs/CivicSuiteUnifiedSpec.md` as the canonical suite specification.
- **CivicClerk scaffold registration** (2026-04-26): `CivicSuite/civicclerk` created.
- **Phase 2 documentation closeout** (2026-04-25): full set of community files, GitHub issue templates, PR template, GitHub Discussions seed posts.
- Suite orientation manual `USER-MANUAL.md` (three parts).
- Plain-text `README.txt` companion.
- `scripts/verify-docs.sh` — required-artifact and stale-current-facing-string check.

### Changed (pre-recovery)

- Registered `CivicSuite/civiccode` scaffold and Milestone 0 completion across umbrella docs while preserving the no-runtime-shipped boundary.
- Updated roadmap and unified spec current-state sections after CivicClerk v0.1.0 and `/staff` UI foundation shipped.
- **CivicClerk staff workflow UI foundation reflected in suite docs** (2026-04-27): umbrella docs now mention the `/staff` browser UI foundation while preserving the full-workflow-UI planned boundary.
- **CivicCode v0.1.0 compatibility update** (2026-04-27).
- **Compatibility matrix updated for CivicClerk v0.1.0** (2026-04-27).
- **Compatibility matrix updated to current truth.**
- **Landing page (`docs/index.html`) refreshed.**
- README rewritten to lead with current suite status (this was the original honesty-framing pass).

## [Phase 1] - 2026-04-24

### Added
- Initial scaffold of the civicsuite umbrella repository (Phase 0).
- Charter, consistency reference, and four canonical specs (catalog, CivicCore extraction, CivicClerk, CivicZone) imported from the workspace draft.
- Empty `docs/` skeleton with stub index files for catalog, principles, architecture, roadmap, governance, and compatibility.
- ADR-0001: extract CivicCore as a non-breaking refactor before any second module starts.
- LICENSE (CC BY 4.0) for documentation; LICENSE-CODE (Apache License 2.0) for example code snippets.
- CONTRIBUTING.md with the bug-routing decision tree from CivicCore Extraction Spec section 18.

### Changed
- License for code switched from MIT to Apache License 2.0.
- Three doc-drift fixes flagged by audit review of Day-3 inventory.
- Spec 02 sections 8 and 9 updated to match actual civicrecords-ai paths.
- CONSISTENCY.md drift-watch item 6 added.
- ADR-0002 and ADR-0003 added; ADR-0003 substantially rewritten.
- Compatibility matrix updated after Phase 1 ship: `civiccore` recorded at `0.1.0`.
