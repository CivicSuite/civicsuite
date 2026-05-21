# CivicSuite Module Status

**Last verified:** 2026-05-20
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active Public-Use Target

The active target is the clerk-core starter product: CivicCore, CivicRecords AI, CivicClerk, and the suite installer. The target is Linux-first Docker/browser operation with Windows and macOS wrappers. As of main CI runs `26134412418` and `26134412420`, suite verifier truth, installer-plan verification, installed-stack workflow proof, Linux install/repair/verify/backup/restore/uninstall lifecycle proof, Windows/macOS archive readiness proof, and installed browser QA evidence are recorded. The 2026-05-21 final package branch also records regenerated package checksums, Windows matching-host install/repair/verify/workflow/backup/restore/uninstall proof, CivicClerk main source fix `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d`, and current CivicRecords AI/CivicClerk release-verifier passes. The target is still not a public-use or city-ready release; `installer-clerk-core-v0.1.0-beta.4` is the current published unsigned OSS beta for outside testing of the starter profile.

All later modules are paused until this starter target passes its gate. The reconciled unified spec, installer metadata, and live GitHub org state enumerate 27 product modules plus CivicCore. After the starter target clears its gate, the remaining-module queue contains the other 25 product modules.

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
| civiccore | v1.1.0 shipped | Real shared platform; v1.1.0 shipped with shared `staff_key_gate` and includes the earlier auth-error-payload hardening. |
| civicclerk | v1.0.1 shipped | Real meeting workflow recovery patch with protected staff auth defaults, not demoted. |
| civicrecords-ai | v1.6.1 shipped | Developer preview; B2 secret-handling recovery shipped in v1.6.0 and the ingestion worker event-loop recovery patch shipped in v1.6.1. |
| civiccode | v0.5.0 | Demoted from false v1.0.0; meaningful runtime depth, not v1.0 product-ready. |
| civiczone | v0.2.0 | Demoted from false v1.0.0; scaffold-depth zoning support. |
| civicplan | v0.2.0 | Demoted from false v1.0.0; scaffold-depth planning support. |
| civicpermit | v0.2.0 | Demoted from false v1.0.0; scaffold-depth permit support. |
| civicinspect | v0.2.0 | Demoted from false v1.0.0; scaffold-depth inspection support. |
| civicgrants | v0.2.0 | Demoted from false v1.0.0; scaffold-depth grants support. |
| civicprocure | v0.2.0 | Demoted from false v1.0.0; scaffold-depth procurement support. |

All other modules remain foundation surfaces unless their own repo evidence says otherwise and the compatibility matrix agrees.

## What Works Today

- `civicrecords-ai` is the most mature product-shaped module, but remains developer preview until full promotion evidence is captured.
- `civicclerk` has substantial meeting workflow code and a first React staff workspace; v1.0.1 shipped the protected-default staff auth fix, but production deployment proof is still missing.
- `civiccore` has real shared platform primitives; v1.1.0 is the current shared platform release.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- `civiccode` has meaningful runtime depth, Docker/PostgreSQL demo work, seed data, and citation-grounded behavior, but not enough to keep a v1.0.0 label.
- `civiczone`, `civicplan`, `civicpermit`, `civicinspect`, `civicgrants`, and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality cannot run itself end-to-end on CivicSuite today. Clerk-core now has suite-level Linux lifecycle, backup/restore, installed workflow, installed browser-QA evidence, release-lockstep PR evidence, and published beta.4 artifact checksums. Missing proof still includes module-by-module feature completion for the rest of the unified spec.
