# CivicSuite Module Status

**Last verified:** 2026-06-13
**Program:** As of 2026-06-10 all module work runs under the [full-suite finishing program](docs/roadmap/full-suite-program.md). Modules reach done only through the clean-VM evidence gate defined there. The active city-core path is the portable-native Windows Local runtime of [ADR-0008](docs/architecture/ADR-0008-portable-native-windows-runtime.md) and [ADR-0009](docs/architecture/ADR-0009-postgres-backed-queue-windows-profile.md). Module labels below are unchanged by program adoption; promotions happen only with evidence kits. Older `C:\dev\Claude\...` references are historical.
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active City-Core Beta Target

The active city-core promotion package is CivicCore, CivicRecords AI, CivicClerk, CivicCode, and the Windows Local desktop installer shell. The current released module cars are CivicCore `v1.2.0`, CivicRecords AI `v1.7.3`, CivicClerk `v1.0.4`, and CivicCode `v1.0.8`; PR #183 records predecessor evidence for the earlier wrapper profile. The current beta target is the Tauri/WebView2 Windows desktop app with portable PostgreSQL 17 + pgvector, bundled CPython city services, PostgreSQL-backed task queue, local file storage, local model setup, backup/restore, repair, support bundle, and Windows uninstall handoff. The package remains unsigned beta software until the final clean-machine release gate is complete; macOS remains beta-level readiness only until a matching-host macOS lifecycle is proven.

The operator path is local-only on Windows and does not require Docker, WSL, a terminal, or a browser URL. Verify the generated MSI checksum or release manifest from the active PR/release evidence, confirm the `installer/modules.json` `source_commit` pins for the four city-core repos, and use published module hashes/attestations where applicable. Do not treat old committed `installer/dist` files as canonical unless Scott explicitly confirms artifact restoration.

CivicAccess is explicitly OUT of city-core for this sprint after the 2026-05-23 depth probe on branch `probe/civicaccess-depth-2026-05-23` recorded `PROBE-PROGRESS.md` with a NEEDS-WORK verdict. CivicAccess requires gap closure and a fresh re-probe before it can be added to the city-core profile.

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
| civicaccess | OUT / v0.2.0 source truth | Excluded from city-core after NEEDS-WORK depth probe; no public-use promotion claim. |
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
- The active Windows Local city-core desktop path now covers installer trust copy, SmartScreen guidance, first-run local folders, module profile selection, city profile, first local administrator sign-in, Gemma 4 12B QAT model setup, local users/RBAC, city-core workflows, task queue health, local file evidence, exports, backup/restore, repair, support bundle, and uninstall handoff. Final city beta testing still depends on a fresh Windows clean-machine install/reboot/uninstall walkthrough for the current MSI artifact.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- CivicAccess is OUT of city-core pending gap closure and re-probe.
- CivicZone, CivicPlan, CivicPermit, and CivicInspect are at v0.2.2 demotion-truth state, not public-use release state.
- `civicgrants` and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality should not treat CivicSuite as a finished full-suite procurement product today. The immediate beta target is the Windows Local city-core package only: CivicCore, CivicRecords AI, CivicClerk, CivicCode, and the desktop installer shell. Missing proof still includes the final clean-machine Windows Local walkthrough for the current MSI artifact and module-by-module feature completion for the rest of the unified spec.
