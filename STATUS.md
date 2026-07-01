# CivicSuite Module Status

**Last verified:** 2026-06-28
**Program:** As of 2026-06-10 all module work runs under the [full-suite finishing program](docs/roadmap/full-suite-program.md). Modules reach done only through the clean-VM evidence gate defined there. The active city-core path is the portable-native Windows Local runtime of [ADR-0008](docs/architecture/ADR-0008-portable-native-windows-runtime.md) and [ADR-0009](docs/architecture/ADR-0009-postgres-backed-queue-windows-profile.md). Module labels below are unchanged by program adoption; promotions happen only with evidence kits. Older `C:\dev\Claude\...` references are historical.
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active City-Core Target (GA candidate / open public beta)

The active city-core promotion package is CivicCore, CivicRecords AI, CivicClerk, CivicCode, CivicNotice, and the Windows Local desktop installer shell. The current released module cars are CivicCore `v1.2.0`, CivicRecords AI `v1.7.3`, CivicClerk `v1.0.4`, CivicCode `v1.0.8`, and CivicNotice `v0.2.0`; PR #183 records predecessor evidence for the earlier wrapper profile. The current beta target is the Tauri/WebView2 Windows desktop app with portable PostgreSQL 17 + pgvector, bundled CPython city services, PostgreSQL-backed task queue, local file storage, local model setup, backup/restore, repair, support bundle, and Windows uninstall handoff. The clean-machine release gate is complete (QA-B1 end-to-end PASS on a fresh Windows Sandbox), so the package is a **GA candidate now open for public beta**, distributed as an unsigned beta until Authenticode code-signing (in progress via the SignPath Foundation) is issued; macOS remains beta-level readiness only until a matching-host macOS lifecycle is proven.

The operator path is local-only on Windows and does not require Docker, WSL, a terminal, or a browser URL. Verify the generated MSI checksum or release manifest from the active PR/release evidence, confirm the `installer/modules.json` `source_commit` pins for the six city-core repos, and use published module hashes/attestations where applicable. Do not treat old committed `installer/dist` files as canonical unless Scott explicitly confirms artifact restoration.

**Bundled source vs published releases (disclosure):** the MSI installs module source pinned by commit, not the published release tags, and for two modules the bundled commit is **ahead of** the latest published release — CivicRecords AI ships `e2208827` (ahead of `v1.7.3`) and CivicClerk ships `fa1874ed` (ahead of `v1.0.4`). The full bundled-commit-to-release mapping and the verification path are documented in [PROVENANCE.md](PROVENANCE.md). For those two modules the trust path is the `source_commit` pin plus the MSI checksum/manifest, not the release tag.

CivicAccess is now the sixth city-core module at v0.4.0 (accessibility + records-ready export) on CivicCore v1.2.0, following a passing depth re-probe (2026-06-29; see [docs/audits/civicaccess-citycore-reprobe-2026-06-29.md](docs/audits/civicaccess-citycore-reprobe-2026-06-29.md)) that reversed the 2026-05-23 NEEDS-WORK demotion. The city-core profile, registry, contract, gates, and compatibility/spec truth all reflect six modules; the current published v1.0.1 MSI bundles the first five, and the six-module MSI is the next build. **UI integration status (disclosure):** the next 6-module MSI bundles the CivicAccess module code, database schema, and write-token secret — Phase B ([PR #213](https://github.com/CivicSuite/civicsuite/pull/213)) wired the runtime; Phase C ([PR #214](https://github.com/CivicSuite/civicsuite/pull/214)) flipped the registry truth 5→6. Neither phase added UI panels in `desktop/src/main.js` or `city_work_action` handler arms in `desktop/src-tauri/src/workflows.rs`; **the on-screen Accessibility workflow tab lands in v1.0.2** (a forward-fix PR mirroring the [CivicNotice precedent #193](https://github.com/CivicSuite/civicsuite/pull/193)). Until v1.0.2, a clerk sees the same eight nav tabs as v1.0.1. Full evidence: [docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md](docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md).

The four false post-starter module labels for CivicZone, CivicPlan, CivicPermit, and CivicInspect have been displaced by narrow `v0.2.2` truth-repair releases. Those releases are no-functional-upgrade demotion labels and do not promote Tier 2. The reconciled unified spec, installer metadata, and live GitHub org state enumerate 27 product modules plus CivicCore.

## Status Legend

- **Recovery patch required:** real code exists, but the current public label needs a corrective patch before promotion.
- **Developer preview:** meaningful product-shaped runtime exists, but municipal procurement readiness has not been proven.
- **Demoted recovery label:** a previous v1.0.0 label was false and is being superseded by a lower honest version.
- **Foundation surface:** package/schema/sample API/sample UI depth only; not product-ready.
- **Planned:** spec exists, no runtime repo yet.

## Corrective Release Decision

As of 2026-05-14, the release-integrity decision is:

| Repo | Correct label | Status |
|---|---:|---|
| civiccore | v1.2.0 shipped | Real shared platform; v1.2.0 shipped the shared document-ingestion pipeline and now includes the Windows-local platform contracts plus PostgreSQL-backed task queue/worker. |
| civicclerk | v1.0.4 shipped | Real meeting workflow release car pinned to CivicCore v1.2.0; protected staff auth defaults remain required. |
| civicrecords-ai | v1.7.3 shipped | Developer preview records release car pinned to CivicCore v1.2.0 and consuming shared CivicCore ingestion; v1.7.3 adds release-asset convention bring-up without functional installer behavior changes. |
| civiccode | v1.0.8 shipped | City-core release car pinned to CivicCore v1.2.0; v1.0.8 supersedes the earlier v1.0.0 posture and carries release attestation. |
| civicnotice | v0.2.0 shipped | City-core public-notice workflow release car pinned to CivicCore v1.2.0; installed through the Windows Local city-core profile with checklist, posting proof, archive export, backup/restore, and search wiring. |
| civicaccess | v0.4.0 city-core release car | Sixth city-core module on CivicCore v1.2.0; accessibility + records-ready export (ships in the next MSI build). |
| civiczone | v0.2.2 | Narrow truth-repair demotion release; no functional upgrade; queued for Tier 2 real work. |
| civicplan | v0.2.2 | Narrow truth-repair demotion release; no functional upgrade; queued for Tier 2 real work. |
| civicpermit | v0.2.2 | Narrow truth-repair demotion release; no functional upgrade; queued for Tier 2 real work. |
| civicinspect | v0.2.2 | Narrow truth-repair demotion release; no functional upgrade; queued for Tier 2 real work. |
| civicgrants | v0.2.0 | Demoted from false v1.0.0; scaffold-depth grants support. |
| civicprocure | v0.2.0 | Demoted from false v1.0.0; scaffold-depth procurement support. |

All other modules remain foundation surfaces unless their own repo evidence says otherwise and the compatibility matrix agrees.

## What Works Today

- `civiccore` v1.2.0 is the current shared platform release and includes the shared document-ingestion pipeline, Windows-local platform contracts, and PostgreSQL-backed local task queue/worker used by the city-core release cars.
- `civicrecords-ai` v1.7.3 remains developer preview, consumes CivicCore v1.2.0 shared ingestion, and keeps the city-core installer on the vendored-source path.
- `civicclerk` v1.0.4 is the current meeting workflow release car for city-core.
- `civiccode` v1.0.8 is the current municipal-code release car for city-core.
- `civicnotice` v0.2.0 is the current public-notice workflow release car for city-core.
- The active Windows Local city-core desktop path now covers installer trust copy, SmartScreen guidance, first-run local folders, module profile selection, city profile, first local administrator sign-in, Gemma 4 12B QAT model setup, local users/RBAC, city-core workflows, task queue health, local file evidence, exports, backup/restore, repair, support bundle, and uninstall handoff. The clean-machine Windows Local lifecycle walkthrough (QA-B1) passed end-to-end on a fresh Windows Sandbox for the current 1.0.1 MSI artifact.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- CivicAccess is the sixth city-core module at v0.4.0 (module code/schema/token bundled in the next MSI build; clerk-facing Accessibility workflow tab in the desktop UI lands in v1.0.2 — see the disclosure above).
- CivicZone, CivicPlan, CivicPermit, and CivicInspect are at v0.2.2 demotion-truth state, not public-use release state.
- `civicgrants` and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality should not treat CivicSuite as a finished full-suite procurement product today. The immediate beta target is the Windows Local city-core package only: CivicCore, CivicRecords AI, CivicClerk, CivicCode, CivicNotice, and the desktop installer shell. Missing proof is module-by-module feature completion for the rest of the unified spec; the clean-machine Windows Local walkthrough (QA-B1) for the current 1.0.1 MSI artifact has passed.
