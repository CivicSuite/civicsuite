# CivicSuite

**An open-source, sovereignly deployable municipal product suite that runs on the city's own hardware.**

This `civicsuite` repository is the umbrella repo for the CivicSuite product family. It holds suite-wide documentation, governance, the roadmap, ADRs, and the compatibility matrix. It does **not** contain runtime code; each product module lives in its own repo.

## Suite Status

Status snapshot: **2026-05-07**

**Recovery status:** public "shipping", "product-ready", and "v1.0.0 proves
city-ready" claims are frozen while the suite is re-audited. Existing public
tags remain historical artifacts unless and until each repo re-earns release
status through the recovery gates in
[docs/release-recovery-status.md](docs/release-recovery-status.md).

| Tier | Count | What it means today |
|---|---:|---|
| Provisional / under recovery audit | 7 repos | `civicrecords-ai`, `civiccore`, `civicclerk`, `civiccode`, `civiczone`, `civicplan`, and `civicpermit` have public release tags or substantial work, but those labels are provisional until real user-flow QA, install proof, consistency gates, security scans, docs-source enforcement, and mock-vs-production labeling pass. |
| Foundation / planned | 21 of 28 product modules | The rest of the catalog has bounded runtime foundations or implementation specs. These are not city-ready products. `CivicRegWatch` and `CivicAPI` are planned modules with detailed specs but no runtime repos yet. |

`civiccore` is not a product module; it is the shared platform package used by every module. The public **`civiccore v1.0`** tag is also provisional until the recovery audit confirms the platform contract.

The most important distinction in this repo is simple: **"all repos have releases" is not the same thing as "a city can run on this suite."** The roadmap in [docs/roadmap/index.md](docs/roadmap/index.md) is the plan to close that gap.

## What Is Available Today

- **`civicrecords-ai`** has the most mature product shape in the org, but its latest public tag is under recovery review and must not be promoted as production-ready until the recovery gates pass. Repo: <https://github.com/CivicSuite/civicrecords-ai>
- **`civiccore`** contains real shared-platform subsystems, but the public v1 line is provisional until version, release, and downstream compatibility truth are re-verified. Repo: <https://github.com/CivicSuite/civiccore>
- **`civicclerk`** contains substantial meeting-workflow code and mock-city test fixtures, but the public v1.0.0 label is provisional. It must not be described as a city-ready product until the frontend, user-flow QA, accessibility, install, security, and mock-vs-production gaps are closed. Repo: <https://github.com/CivicSuite/civicclerk>
- **`civiccode`, `civiczone`, `civicplan`, and `civicpermit`** have recent release work, but their v1 labels are provisional until repo-specific recovery audits and stronger runtime/user-flow gates pass.
- **`CivicRegWatch`** and **`CivicAPI`** are newly added planned modules. CivicRegWatch is federal regulatory intelligence for municipal operators; CivicAPI is the public read-only data gateway over human-approved CivicSuite publication records. Detailed specs live in `specs/05_civicregwatch.md` and `specs/06_civicapi.md`.

The rest of the catalog is foundation work, not vapor and not full product. Those modules may include schemas, sample workflow slices, tests, and release gates. They do **not** yet ship the workflow, security, identity, connector, and operational depth required to call them full products.

## Current Priorities

The canonical roadmap lives at [docs/roadmap/index.md](docs/roadmap/index.md). The immediate sequence is:

1. Freeze public product-ready claims until the recovery gates pass.
2. Replace docs-render smoke checks with real user-flow Playwright evidence where a frontend exists.
3. Add install/runtime proof, consistency gates, security scans, docs-source enforcement, and mock-vs-production labels.
4. Re-audit and remediate repos one at a time.
5. Re-earn release status only after the repo-specific recovery gate passes.

The current shared rollout pattern is documented in [docs/roadmap/shared-extraction-consumer-rollout.md](docs/roadmap/shared-extraction-consumer-rollout.md).

## Continuity

Continuity is now an explicit gate, not a "later" governance item.

- Continuity plan: [SUCCESSION.md](SUCCESSION.md)
- Governance index: [docs/governance/index.md](docs/governance/index.md)
- Charter: [CHARTER.md](CHARTER.md)

Current state as of 2026-04-30: the `CivicSuite` GitHub org has two active owners (`scottconverse` and `APirateMonk`), and the continuity baseline is documented in [SUCCESSION.md](SUCCESSION.md).

## Quick Start

There is no suite-level installer binary yet. The required installer contract is
now tracked in [installer/README.md](installer/README.md) and
[docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md).
Until that work ships, start with the module that matches your need:

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
| `civicrecords-ai` | Most mature product-shaped repo; release status under recovery review |
| `civicclerk` | Meeting-workflow repo with public v1.0.0 tag under recovery review |
| `civiccode` | Municipal-code repo with recent release work under recovery review |
| `civiczone` through `civicparks` | Foundation-tier module repos with bounded shipped surfaces |
| `civicregwatch` | Planned federal regulatory intelligence module; spec exists, repo not scaffolded yet |
| `civicapi` | Planned public read-only data gateway module; spec exists, repo not scaffolded yet |

See [docs/compatibility/index.md](docs/compatibility/index.md) for the canonical module-to-platform version pairings.

## Suite Installer Direction

CivicSuite needs a suite-level installer that starts from a zero-baseline
Windows, macOS, or Linux machine, checks baseline dependencies, installs
CivicCore first, presents a menu-style module selector, installs selected
modules, and records proof that the selected local profile works.

Current installer planning artifacts:

- Contract: [installer/README.md](installer/README.md)
- Module/profile manifest: [installer/modules.json](installer/modules.json)
- Plan: [docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md)
- Dry-run planner: `python scripts/plan-installer.py --profile clerk-core --dry-run`
- Verification: `python scripts/verify-installer-plan.py`

The existing CivicRecords AI Windows installer and the umbrella demo compose
profile are useful inputs, but they do not satisfy the suite installer
requirement.

## Architecture

![CivicSuite suite architecture](docs/diagrams/suite-architecture.svg)

Every module inherits the same deliberately boring stack: FastAPI, PostgreSQL 17 with `pgvector`, Redis 7.2, Celery, Ollama, and React behind nginx. The dependency rule is one-way: modules depend on `civiccore`; `civiccore` never depends on modules. Cities run the stack on their own hardware. No cloud, no telemetry, no per-seat pricing.

The suite is aiming for a first deployable "city starter set," not for all 28 product modules to become equally deep at the same time. That distinction is intentional and load-bearing.

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
