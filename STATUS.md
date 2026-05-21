# CivicSuite Module Status

**Last verified:** 2026-05-21
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active Public-Use Target

The clerk-core starter product is CivicCore, CivicRecords AI, CivicClerk, and the suite installer. The target is Linux-first Docker/browser operation with Windows and macOS wrappers. As of main CI runs `26210542980` and `26210542979`, suite verifier truth, installer-plan verification, installed-stack workflow proof, Linux install/repair/verify/backup/restore/uninstall lifecycle proof, Windows matching-host lifecycle evidence, macOS archive/readiness proof, installed browser QA evidence, regenerated package checksums, CivicClerk main source fix `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d`, and current CivicRecords AI/CivicClerk release-verifier passes are recorded. `installer-clerk-core-v0.1.0` is the bounded public-use starter release for the Clerk-Core profile. This is not a city-ready full-suite release, procurement certification, production hosting certification, live cross-module records exchange claim, airgap claim, or macOS lifecycle certification.

The starter target is under independent re-audit because the same release machinery later produced false post-starter v1.0.0 labels. CivicCode, CivicAccess, CivicZone, CivicPlan, CivicPermit, and CivicInspect are not shipped public-use modules. The reconciled unified spec, installer metadata, and live GitHub org state enumerate 27 product modules plus CivicCore. After CivicRecords AI and CivicClerk, the remaining-module queue is frozen until release-integrity recovery phases are independently signed off.

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
| civiccode | v0.6.0 corrective demotion | Functional-partial: real backend and migrations exist, but real AI, real frontend, real municipal data/search proof, installer/run proof, and independent Section 2 sign-off remain pending. The v1.0.0 release was published in error. |
| civicaccess | v0.2.0 corrective demotion | Scaffold: deterministic support exists, but real AI, real municipal data/search, production-grade frontend, and independent Section 2 sign-off remain pending. The v1.0.0 release was published in error. |
| civiczone | v0.2.1 corrective demotion | Scaffold with partial persistence/workflow plumbing; no real AI, full frontend, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicplan | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, real municipal data/search, migrations, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicpermit | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, Alembic migrations, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicinspect | v0.2.1 corrective demotion | Scaffold; no real AI, full frontend, Alembic migrations, real municipal data/search, or independent Section 2 sign-off. The v1.0.0 release was published in error. |
| civicgrants | v0.2.0 | Demoted from false v1.0.0; scaffold-depth grants support. |
| civicprocure | v0.2.0 | Demoted from false v1.0.0; scaffold-depth procurement support. |

All other modules remain foundation surfaces unless their own repo evidence says otherwise and the compatibility matrix agrees.

## What Works Today

- `civicrecords-ai` is the most mature product-shaped module, but remains developer preview until full promotion evidence is captured.
- `civicclerk` has substantial meeting workflow code and a first React staff workspace; v1.0.1 shipped the protected-default staff auth fix, but production deployment proof is still missing.
- `civiccore` has real shared platform primitives; v1.1.0 is the current shared platform release.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- `civiccode`, `civicaccess`, `civiczone`, `civicplan`, `civicpermit`, and `civicinspect` are not shipped public-use modules. Their 2026-05-21 v1.0.0 releases were published in error and must be superseded by corrective demotion releases before module work resumes.
- `civicgrants` and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality cannot run itself end-to-end on CivicSuite today. Clerk-core now has suite-level Linux lifecycle, Windows lifecycle, backup/restore, installed workflow, installed browser-QA evidence, release-gate evidence, and final artifact checksums for the starter profile. Missing proof still includes module-by-module feature completion for the rest of the unified spec.
