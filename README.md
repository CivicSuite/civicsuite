# CivicSuite

**An open-source, sovereignly deployable municipal product suite that runs on the city's own hardware.**

This `civicsuite` repository is the umbrella repo for the CivicSuite product family. It holds suite-wide documentation, governance, the roadmap, ADRs, and the compatibility matrix. It does **not** contain runtime code; each product module lives in its own repo.

## Suite Status

Status snapshot: **2026-04-29**

| Tier | Count | What it means today |
|---|---:|---|
| Shipping | 1 of 26 catalog modules | `civicrecords-ai` is the one product currently positioned as production-usable today. |
| Productizing | 1 of 26 catalog modules | `civicclerk` has real workflow depth and live staff surfaces, but still needs full auth, installer, and deployment hardening. |
| Foundation | 24 of 26 catalog modules | The rest of the catalog has real runtime foundations, release gates, and honest shipped/not-shipped boundaries, but they are not yet end-to-end products. |

`civiccore` is not a catalog module; it is the shared platform package used by every module. The latest published shared-platform release is **`civiccore v0.11.0`**.

The most important distinction in this repo is simple: **"all repos have releases" is not the same thing as "a city can run on this suite."** The roadmap in [docs/roadmap/index.md](docs/roadmap/index.md) is the plan to close that gap.

## What Ships Today

- **`civicrecords-ai v1.4.1`** is the flagship shipping product for FOIA/public-records management. Repo: <https://github.com/CivicSuite/civicrecords-ai>
- **`civiccore v0.11.0`** is the shipping shared platform package. It currently ships migrations, shared SQLAlchemy baselines, the LLM abstraction layer, audit/provenance primitives, export/manifest helpers, city profiles, shared auth/RBAC primitives, shared notice-compliance helpers, onboarding profile helpers, and permission-aware search/access helpers. Repo: <https://github.com/CivicSuite/civiccore>
- **`civicclerk v0.1.4`** is the clear second-product candidate. It already ships meetings/agendas/minutes workflow depth, public-archive safeguards, connector imports, browser QA gates, live `/staff` screens, and shared `civiccore` notice/search/access reuse, but it is still in the productizing tier. Repo: <https://github.com/CivicSuite/civicclerk>

The rest of the catalog is real foundation work, not vapor. Those modules ship schemas, sample workflow slices, accessible sample UI, tests, and release gates. They do **not** yet all ship the workflow, security, identity, connector, and operational depth required to call them full products.

## Current Priorities

The canonical roadmap lives at [docs/roadmap/index.md](docs/roadmap/index.md). The immediate sequence is:

1. Use the shared extraction consumer rollout playbook for the next `civiccore` fan-out work.
2. Extract the next `civiccore` capabilities that unblock `civicclerk`, including security-related extractions.
3. Drive `civicclerk` to second-product status with a real deployment story, including `SSO/IdP`.
4. Define the shared upgrade-path pattern before broadening more shared-platform fan-out.
5. Formalize cross-module integration ownership for the first deployable starter set.

The current shared rollout pattern is documented in [docs/roadmap/shared-extraction-consumer-rollout.md](docs/roadmap/shared-extraction-consumer-rollout.md).

## Continuity

Continuity is now an explicit gate, not a "later" governance item.

- Continuity plan: [SUCCESSION.md](SUCCESSION.md)
- Governance index: [docs/governance/index.md](docs/governance/index.md)
- Charter: [CHARTER.md](CHARTER.md)

Current state as of 2026-04-29: the `CivicSuite` GitHub org now has two active owners (`scottconverse` and `APirateMonk`), and the continuity baseline is documented in [SUCCESSION.md](SUCCESSION.md).

## Quick Start

There is nothing to install from the umbrella repo itself. Start with the module that matches your need:

- FOIA / public records management: [civicrecords-ai](https://github.com/CivicSuite/civicrecords-ai)
- Shared platform/library work: [civiccore](https://github.com/CivicSuite/civiccore)
- Suite orientation and roadmap: [docs/index.html](docs/index.html) and [docs/roadmap/index.md](docs/roadmap/index.md)

If you are orienting yourself for the first time, read in this order:

1. [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)
2. [USER-MANUAL.md](USER-MANUAL.md)
3. [CHARTER.md](CHARTER.md)
4. [docs/roadmap/index.md](docs/roadmap/index.md)
5. [docs/compatibility/index.md](docs/compatibility/index.md)

## Repo Map

| Repo | Role |
|---|---|
| `civicsuite` | Umbrella repo: roadmap, governance, specs, ADRs, compatibility truth source |
| `civiccore` | Shared platform package consumed by every module |
| `civicrecords-ai` | Shipping flagship product |
| `civicclerk` | Productizing second-product candidate |
| `civiccode` through `civicparks` | Foundation-tier module repos with bounded shipped surfaces |

See [docs/compatibility/index.md](docs/compatibility/index.md) for the canonical module-to-platform version pairings.

## Architecture

![CivicSuite suite architecture](docs/diagrams/suite-architecture.svg)

Every module inherits the same deliberately boring stack: FastAPI, PostgreSQL 17 with `pgvector`, Redis 7.2, Celery, Ollama, and React behind nginx. The dependency rule is one-way: modules depend on `civiccore`; `civiccore` never depends on modules. Cities run the stack on their own hardware. No cloud, no telemetry, no per-seat pricing.

The suite is aiming for a first deployable "city starter set," not for all 26 modules to become equally deep at the same time. That distinction is intentional and load-bearing.

## Documentation

- Landing page: [docs/index.html](docs/index.html)
- Roadmap: [docs/roadmap/index.md](docs/roadmap/index.md)
- Shared rollout playbook: [docs/roadmap/shared-extraction-consumer-rollout.md](docs/roadmap/shared-extraction-consumer-rollout.md)
- Governance: [docs/governance/index.md](docs/governance/index.md)
- Compatibility matrix: [docs/compatibility/index.md](docs/compatibility/index.md)
- Unified spec: [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)
- User manual: [USER-MANUAL.md](USER-MANUAL.md)

## Licensing

- Documentation in this repo: CC BY 4.0
- Code snippets in this repo: Apache License 2.0
- Module repos generally follow Apache 2.0 for code and CC BY 4.0 for docs

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree and contribution process. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Support

See [SUPPORT.md](SUPPORT.md) for support paths and [SECURITY.md](SECURITY.md) for vulnerability reporting.
