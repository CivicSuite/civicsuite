# CivicSuite Module Status

**Last verified:** 2026-05-28
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active City-Core Beta Target

The active city-core promotion package is CivicCore, CivicRecords AI, CivicClerk, CivicCode, and the suite installer. The current released module cars are CivicCore `v1.2.0`, CivicRecords AI `v1.7.3`, CivicClerk `v1.0.3`, and CivicCode `v1.0.8`; PR #183 records predecessor beta-ready truth-reconciled evidence for the four-module non-technical Windows/Linux installer path. The 2026-05-28 engagement is closing the full independent audit-team finding set before the beta-ready truth-reconciled label can be treated as current. Current run evidence lives at `C:\dev\Claude\CivicSuite-city-core-caboose-item1\.agent-runs\2026-05-28-city-core-real-non-technical-release\`. The package remains bounded to unsigned vendored-source installer artifacts; macOS remains beta-level readiness only until a matching-host macOS lifecycle is proven.

The operator path uses live regenerated artifacts. Verify the generated `SHA256SUMS` or release manifest from the active run evidence, confirm the `installer/modules.json` `source_commit` pins for the four city-core repos, and use published module hashes/attestations where applicable. Do not treat old committed `installer/dist` files as canonical unless Scott explicitly confirms artifact restoration. The suite launcher is the local browser front door for city-core; its shared browser session is local runtime state, not a completed municipal SSO or managed cloud-session claim.

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
| civiccore | v1.2.0 shipped | Real shared platform; v1.2.0 shipped the shared document-ingestion pipeline and retains the earlier platform hardening. |
| civicclerk | v1.0.3 shipped | Real meeting workflow release car pinned to CivicCore v1.2.0; protected staff auth defaults remain required. |
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

- `civiccore` v1.2.0 is the current shared platform release and includes the shared document-ingestion pipeline used by the city-core release cars.
- `civicrecords-ai` v1.7.3 remains developer preview, consumes CivicCore v1.2.0 shared ingestion, and keeps the city-core installer on the vendored-source path.
- `civicclerk` v1.0.3 is the current meeting workflow release car for city-core.
- `civiccode` v1.0.8 is the current municipal-code release car for city-core.
- The suite-level `city-core` installer evidence for PR #183 records Windows and Linux one-click wrapper smoke, Guided/Manual Docker prerequisite setup paths, Linux Docker signed-repository bootstrap behavior where supported, first-run wizard smoke, 60 GB cleanroom hygiene, local matching-host install/repair/verify/backup/restore/uninstall lifecycle evidence, first-run browser QA evidence, green PR CI, and audit-full evidence under `C:\dev\Claude\CivicSuite-city-core-caboose-item1\.agent-runs\2026-05-26-city-core-non-technical-installable\`. This is beta-ready truth-reconciled, not public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, or full-suite release.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- CivicAccess is OUT of city-core pending gap closure and re-probe.
- CivicZone, CivicPlan, CivicPermit, and CivicInspect are at v0.2.2 demotion-truth state, not public-use release state.
- `civicgrants` and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality cannot run itself end-to-end on CivicSuite today. Clerk-core now has suite-level Linux lifecycle, Windows lifecycle, backup/restore, installed workflow, installed browser-QA evidence, release-gate evidence, and final artifact checksums for the starter profile. Missing proof still includes module-by-module feature completion for the rest of the unified spec.
