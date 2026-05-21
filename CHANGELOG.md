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
