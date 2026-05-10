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

- **2026-05-10.** chore: civiccore v1.0.1 suite-truth reconciliation. The umbrella truth surface now records CivicCore [v1.0.1](https://github.com/CivicSuite/civiccore/releases/tag/v1.0.1) as the current shared-platform recovery patch, including auth-error-payload hardening documented by [`docs/audits/civiccore-audit-full-2026-05-07.md`](docs/audits/civiccore-audit-full-2026-05-07.md). Downstream CivicCore pins for CivicClerk, CivicCode, CivicZone, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure now reconcile to the v1.0.1 wheel.
- **2026-05-10.** chore: civicclerk v1.0.1 suite-truth reconciliation. CivicClerk [v1.0.1](https://github.com/CivicSuite/civicclerk/releases/tag/v1.0.1) is now the current recovery label after the QA-001 security-default fix. Fresh installs deny anonymous staff writes by default, `open` mode is explicit opt-in for local rehearsal, and installer truth now records the protected default.

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
