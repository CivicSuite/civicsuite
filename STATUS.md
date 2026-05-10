# CivicSuite Module Status

**Last verified:** 2026-05-10
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Status Legend

- **Recovery patch required:** real code exists, but the current public label needs a corrective patch before promotion.
- **Developer preview:** meaningful product-shaped runtime exists, but municipal procurement readiness has not been proven.
- **Demoted recovery label:** a previous v1.0.0 label was false and is being superseded by a lower honest version.
- **Foundation surface:** package/schema/sample API/sample UI depth only; not product-ready.
- **Planned:** spec exists, no runtime repo yet.

## Corrective Release Decision

As of 2026-05-10, the release-integrity decision is:

| Repo | Correct label | Status |
|---|---:|---|
| civiccore | v1.0.1 shipped | Real shared platform; recovery patch shipped with auth-error-payload hardening, not demoted. |
| civicclerk | v1.0.1 next | Real meeting workflow; patch after the open-mode default fix, not demoted. |
| civicrecords-ai | v1.5.0 next | Developer preview; upgrade to CivicCore v1.0.1 before next release. |
| civiccode | v0.5.0 | Demoted from false v1.0.0; meaningful runtime depth, not v1.0 product-ready. |
| civiczone | v0.2.0 | Demoted from false v1.0.0; scaffold-depth zoning support. |
| civicplan | v0.2.0 | Demoted from false v1.0.0; scaffold-depth planning support. |
| civicpermit | v0.2.0 | Demoted from false v1.0.0; scaffold-depth permit support. |
| civicinspect | v0.2.0 | Demoted from false v1.0.0; scaffold-depth inspection support. |
| civicgrants | v0.2.0 | Demoted from false v1.0.0; scaffold-depth grants support. |
| civicprocure | v0.2.0 | Demoted from false v1.0.0; scaffold-depth procurement support. |

All other modules remain foundation surfaces unless their own repo evidence says otherwise and the compatibility matrix agrees.

## What Works Today

- `civicrecords-ai` is the most mature product-shaped module, but remains developer preview until the CivicCore upgrade and recovery release.
- `civicclerk` has substantial meeting workflow code and a first React staff workspace, but needs the open-mode default security fix before v1.0.1.
- `civiccore` has real shared platform primitives; v1.0.1 reconciles release hygiene and downstream truth with auth-error-payload hardening.
- `civiccode` has meaningful runtime depth, Docker/PostgreSQL demo work, seed data, and citation-grounded behavior, but not enough to keep a v1.0.0 label.
- `civiczone`, `civicplan`, `civicpermit`, `civicinspect`, `civicgrants`, and `civicprocure` contain useful scaffolds and local mocks, but they are not city-ready products.

## What Does Not Work Yet

A municipality cannot run itself end-to-end on CivicSuite today. Missing proof includes installer completeness, cross-module runtime integration, real user-flow QA for product paths, security-default repair, production-vs-mock labeling, and module-by-module feature completion against the unified spec.
