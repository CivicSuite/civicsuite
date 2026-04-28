# Changelog

All notable changes to the civicsuite umbrella repo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `docs/roadmap/civiccode-next-module-plan.md` as the historical CivicCode planning artifact that unblocked CivicZone runtime work.
- **CivicZone v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicZone runtime release pinned to `civiccore==0.2.0`.
- **CivicAccess v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicAccess runtime release pinned to `civiccore==0.2.0`.
- **CivicPlan v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicPlan runtime release pinned to `civiccore==0.2.0`.
- **CivicPermit v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicPermit runtime release pinned to `civiccore==0.2.0`.
- **CivicInspect v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicInspect runtime release pinned to `civiccore==0.2.0`.
- **CivicGrants v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicGrants runtime release pinned to `civiccore==0.2.0`.
- **CivicProcure v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicProcure runtime release pinned to `civiccore==0.2.0`.
- **CivicContracts v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicContracts runtime release pinned to `civiccore==0.2.0`.
- **CivicBoards v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicBoards runtime release pinned to `civiccore==0.2.0`.
- **CivicNotice v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicNotice runtime release pinned to `civiccore==0.2.0`.
- **Civic311 v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first Civic311 runtime release pinned to `civiccore==0.2.0`.
- **CivicComms v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicComms runtime release pinned to `civiccore==0.2.0`.
- **CivicData Bridge v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicData runtime release pinned to `civiccore==0.2.0`.
- **CivicHR v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicHR runtime release pinned to `civiccore==0.2.0`.
- **CivicBudget v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicBudget runtime release pinned to `civiccore==0.2.0`.
- **CivicLegal v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicLegal runtime release pinned to `civiccore==0.2.0`.
- **CivicElections v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicElections runtime release pinned to `civiccore==0.2.0`.
- **CivicCourt v0.1.0 compatibility update** (2026-04-27): README, README.txt, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicCourt runtime release pinned to `civiccore==0.2.0`.
- **CivicSafety v0.1.0 compatibility update** (2026-04-27): README, README.txt, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicSafety runtime release pinned to `civiccore==0.2.0`.
- **CivicLibrary v0.1.0 compatibility update** (2026-04-27): README, README.txt, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicLibrary runtime release pinned to `civiccore==0.2.0`.
- **CivicParks v0.1.0 compatibility update** (2026-04-27): README, README.txt, landing page, roadmap, unified spec current-state section, architecture diagram, and compatibility matrix now reflect the first CivicParks runtime release pinned to `civiccore==0.2.0`.
- **Post-foundation sequence correction** (2026-04-27): unified spec section 19 now describes post-foundation hardening instead of the completed next-module build lane.
- **Post-foundation hardening plan** (2026-04-27): roadmap now links the active suite hardening plan covering suite-state verification, deployment profile, shared shell boundaries, connector templates, CivicCore v0.3.0 extraction candidates, and the recommended first production-depth workflow.
- **Suite-state verifier** (2026-04-27): added `scripts/verify-suite-state.py` as the first post-foundation Lane 1 artifact for checking local repo state, version truth, CivicCore pins, docs artifacts, compatibility rows, and optional GitHub release assets.
- **Local demo deployment profile** (2026-04-27): added the first Lane 2 deployment profile for CivicRecords AI + CivicClerk + CivicCode + CivicZone, plus a verifier for compose shape, local-first defaults, and no-network module health smoke checks.
- **Shared shell boundary** (2026-04-27): added ADR-0004 and a shared shell UX inventory to define navigation, status, empty/error, citation, export, and browser-QA conventions before any shared frontend package extraction.
- **Connector import/export boundary** (2026-04-28): added ADR-0005 and the suite connector template for file drops, CSV imports, static export bundles, manifests, checksums, and the no-write-back-before-audit boundary.
- **CivicCore v0.3.0 extraction proposal** (2026-04-28): added ADR-0006 and a bounded proposal for audit primitives, source/provenance metadata, connector/export manifests, city profile configuration, and export-bundle utilities.
- **CivicClerk production-depth workflow plan** (2026-04-28): added ADR-0007 and the first integrated production-depth sprint plan for agenda packet and notice workflow across CivicClerk, CivicRecords AI, CivicCode, CivicZone, and CivicCore.
- Added `docs/CivicSuiteUnifiedSpec.md` as the canonical suite specification, consolidating the DOCX source set, current repo truth, Apache 2.0 licensing decision, 7-tier module catalog, CivicCore shipped/planned boundary, and CivicClerk/CivicZone module requirements.
- **CivicClerk scaffold registration** (2026-04-26): `CivicSuite/civicclerk` created as the next module repo; roadmap, compatibility matrix, and README updated to distinguish scaffolded-but-not-installable from planned-only modules.
- **Phase 2 documentation closeout** (2026-04-25): full set of community files (`SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`), GitHub issue templates (bug, feature, documentation), pull request template, and GitHub Discussions seed posts (`docs/github-discussions-seed.md`).
- Suite orientation manual `USER-MANUAL.md` (three parts: municipal decision-makers, developers/IT, architecture reference) plus `.txt`, `.pdf`, `.docx` companion formats.
- Plain-text `README.txt` companion to `README.md`.
- `scripts/verify-docs.sh` — required-artifact and stale-current-facing-string check. Run before every push.

### Changed
- Registered the new `CivicSuite/civiccode` scaffold and Milestone 0 completion across README, user manual, landing page, roadmap, and unified spec while preserving the no-runtime-shipped boundary.
- Updated the roadmap and canonical unified spec current-state sections after CivicClerk v0.1.0 and the `/staff` UI foundation shipped; CivicCode is now the next module lane.
- **CivicClerk staff workflow UI foundation reflected in suite docs** (2026-04-27): README, user manual, landing page, and compatibility matrix now mention the `/staff` browser UI foundation shipped after the v0.1.0 release while preserving the full-workflow-UI planned boundary.
- **CivicCode v0.1.0 compatibility update** (2026-04-27): README, user manual, landing page, roadmap, unified spec current-state section, and compatibility matrix now reflect the first CivicCode runtime release pinned to `civiccore==0.2.0`.
- **Compatibility matrix updated for CivicClerk v0.1.0** (2026-04-27): `CivicSuite/civicclerk` now records the published runtime-foundation release paired to `civiccore==0.2.0`.
- **Compatibility matrix updated to current truth** (`docs/compatibility/index.md`): civiccore now at `0.2.0`, civicrecords-ai now at `1.4.0` pinned to `==0.2.0`. Phase 1 entries (civiccore 0.1.0, records-ai v1.3.0 pending) replaced with the actual shipped versions and dates.
- **Landing page (`docs/index.html`) refreshed**: civiccore status changed from "Phase 0 scaffold" to "Shipping v0.2.0 (Phase 2 LLM module)"; the records-ai repo link now points at the transferred `CivicSuite/civicrecords-ai` home.
- README rewritten to lead with current suite status (what's shipping, what's planned but not started) instead of the workspace-bootstrap framing.

## [Phase 1] - 2026-04-24

### Added
- Initial scaffold of the civicsuite umbrella repository (Phase 0).
- Charter, consistency reference, and four canonical specs (catalog, CivicCore extraction, CivicClerk, CivicZone) imported from the workspace draft.
- Empty `docs/` skeleton with stub index files for catalog, principles, architecture, roadmap, governance, and compatibility.
- ADR-0001: extract CivicCore as a non-breaking refactor before any second module starts.
- LICENSE (CC BY 4.0) for documentation; LICENSE-CODE (Apache License 2.0) for example code snippets.
- CONTRIBUTING.md with the bug-routing decision tree from CivicCore Extraction Spec section 18.

### Changed
- License for code switched from MIT to Apache License 2.0 (LICENSE-CODE updated; CONSISTENCY.md section 6 and all four specs updated to match). Documentation license (CC BY 4.0 in LICENSE) is unchanged.
- Three doc-drift fixes flagged by audit review of Day-3 inventory: governance/index.md license bullet, CONTRIBUTING.md repo URLs, LICENSE snippets footer.
- Spec 02 sections 8 and 9 updated to match actual civicrecords-ai paths (LLM module, sovereignty verification, app-shell, letters/fees locations).
- CONSISTENCY.md drift-watch item 6 added.
- ADR-0002 (SQLAlchemy declarative Base lives in civiccore.models.base) and ADR-0003 (CivicCore Alembic baselines after 787207afc66a) added to the architecture index.
- ADR-0003 substantially rewritten same day after audit review (the original "baseline = revision after 787207afc66a, exact rev TBD" was underspecified and structurally wrong — records' migration graph already extends through `019_encrypt_connection_config`, well past `787207afc66a`). Replacement names the exact baseline migration (`civiccore_0001_baseline_v1.py`), enumerates the 14 records migrations that need idempotent guards, specifies the 6-line records env.py wiring, walks all three deployment scenarios (existing v1.2.x upgrade, fresh install, civiccore-first install), and defines the three CI integration gates that block Phase 1 PR merge.
- Compatibility matrix updated after Phase 1 ship: `civiccore` now recorded at `0.1.0`, and `civicrecords-ai` recorded as post-Phase-1 `master` consuming the `civiccore` `v0.1.0` release artifact while `v1.3.0` release hardening is in progress.
