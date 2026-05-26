# CivicSuite

**An open-source municipal product family designed to run on a city's own hardware. Under release-recovery review as of 2026-05-09.**

This `civicsuite` repository is the umbrella for the CivicSuite product family. It holds suite-wide documentation, governance, the roadmap, ADRs, the compatibility matrix, and the suite-installer scaffolding. Module runtime code lives in per-module repos under <https://github.com/CivicSuite>.

---

## Read Me First

CivicSuite is **not procurement-ready** today. The active city-core promotion package is CivicCore v1.2.0, CivicRecords AI v1.7.3, CivicClerk v1.0.3, CivicCode v1.0.8, and the suite installer. Those four module release cars exist, but the city-core installer still must prove Linux and Windows one-click lifecycle, integration, browser QA, backup/restore, and documentation evidence before any claim beyond beta-ready status. CivicAccess is out of city-core pending gap closure and re-probe. CivicZone, CivicPlan, CivicPermit, and CivicInspect remain queued Tier 2 modules on demotion-truth labels.

Why the freeze: in a five-day window between 2026-05-01 and 2026-05-06, the org pushed multiple v1.0.0 / v0.22.x release labels across 7+ repos as part of a coordination sweep that the project owner subsequently halted. Two follow-on lateral sweeps (2026-05-07 and 2026-05-08) put v1.0.0 tags on `civicinspect`, `civicgrants`, and `civicprocure` against the explicit halt. None of those tags constitute promotion. The recovery-status doc is the operating truth source for which labels are real.

If you are evaluating CivicSuite for a municipality, treat this state as *developer preview* for the most mature module (civicrecords-ai) and *foundation only* for everything else.

---

## Suite Status

Status snapshot: **2026-05-26**

| Tier | Count | What it means today |
|---|---:|---|
| City-core release cars | CivicCore plus 3 product repos | CivicCore v1.2.0 is the shared platform release. CivicRecords AI v1.7.3, CivicClerk v1.0.3, and CivicCode v1.0.8 are the city-core module cars. The city-core installer remains beta-ready pending Linux/Windows one-click lifecycle and integration proof. |
| Queued / excluded modules | Tier 2 and CivicAccess | CivicAccess is out of city-core after a NEEDS-WORK depth probe. CivicZone, CivicPlan, CivicPermit, and CivicInspect are queued on demotion-truth labels, not city-core public-use releases. |
| Foundation / planned | 17 named product modules | The rest of the visible catalog has bounded runtime foundations or implementation specs. These are not city-ready products. `CivicRegWatch` and `CivicAPI` are planned modules with detailed specs but no runtime repos yet. The reconciled unified spec, installer metadata, and live GitHub org state now enumerate 27 product modules plus CivicCore. |

`civiccore` is the shared platform package consumed by every module; v1.2.0 is the current city-core platform release with shared document ingestion, shared `staff_key_gate` support, and the earlier auth-error-payload hardening included.

The most important distinction: **"all repos have releases" is not the same thing as "a city can run on this suite."** That gap is what the recovery gates exist to close.

## What Is Available Today

- **`civicrecords-ai`** (FOIA / public records) - v1.7.3 is the current developer-preview records release car on CivicCore v1.2.0. Repo: <https://github.com/CivicSuite/civicrecords-ai>
- **`civiccore`** (shared platform) - v1.2.0 is the current shared-platform release for city-core. Repo: <https://github.com/CivicSuite/civiccore>
- **`civicclerk`** (meetings/agendas/minutes) - v1.0.3 is the current meeting workflow release car with protected staff auth defaults. Repo: <https://github.com/CivicSuite/civicclerk>
- **`civiccode`** - v1.0.8 is the current municipal-code city-core release car on CivicCore v1.2.0.
- **`civicaccess`** - accessibility and records-ready export module; out of city-core after the 2026-05-23 NEEDS-WORK depth probe.
- **`civiczone`, `civicplan`, `civicpermit`, `civicinspect`** - queued Tier 2 modules on demotion-truth labels; not part of city-core.
- **`civicgrants`, `civicprocure`** - recently tagged v1.0.0 against the 2026-05-07 halt; false labels are being superseded by v0.2.0 recovery releases.
- **`CivicRegWatch` and `CivicAPI`** â€” planned modules. Detailed specs in `specs/05_civicregwatch.md` and `specs/06_civicapi.md`; no runtime repos yet.
- **The remaining 15 modules** are foundation-tier: schemas, sample workflow slices, tests, and release gates. They do not yet ship the workflow, security, identity, connector, or operational depth required for municipal use.

For honest module-by-module status see [STATUS.md](STATUS.md).

## Current Priorities

The canonical roadmap lives at [docs/roadmap/index.md](docs/roadmap/index.md). The active execution target is the city-core nontechnical installability package. The immediate sequence:

1. Make the city-core profile installable by a non-technical municipal operator on Linux and Windows.
2. Keep macOS explicitly beta/archive/readiness only until matching-host proof exists.
3. Prove install/start/health/repair/backup/restore/uninstall for the city-core Docker/browser path.
4. Browser-QA the public and staff city-core paths with real user-flow evidence.
5. Keep queued modules out of scope until city-core closes with evidence.

## Quick Start

**Suite installer (current):** Clerk-Core has a published bounded starter installer release, and city-core is the active beta-ready profile that adds CivicCode to CivicCore + CivicRecords AI + CivicClerk. The city-core package is not yet promoted beyond beta-ready because Linux and Windows one-click lifecycle, cross-module integration, browser QA, backup/restore, and final audit evidence are still being assembled. CivicSuite's core runtime path is Linux/container-first; Windows is a wrapper around the same containerized core; macOS remains beta/archive/readiness only.

- Published starter packages: `CivicSuite-clerk-core-windows-0.1.0.zip`, `CivicSuite-clerk-core-linux-0.1.0.tar.gz`, and `CivicSuite-clerk-core-macos-0.1.0.tar.gz`.
- City-core generated package surfaces exist under the installer tree, but final Linux/Windows one-click lifecycle evidence is required before status promotion.
- macOS package paths stay beta/archive/readiness only until matching-host macOS lifecycle evidence exists.

See [installer/README.md](installer/README.md) for the contract and [docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md) for the plan.
Operators evaluating the prior starter release should use the [starter-set outside test guide](docs/installer/starter-set-outside-test-guide.md). Operators evaluating city-core should wait for the city-core Linux/Windows one-click lifecycle package and evidence from this run.

**Per-module install path:**

- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€” Linux/container-first. Windows and macOS use wrapper/script paths around the same containerized services; platform claims remain bounded by the lifecycle evidence in the release notes.
- Other modules: see each module's README for install instructions. Most modules ship as Python packages depending on `civiccore`.

If you are orienting yourself for the first time, read in this order:

1. [STATUS.md](STATUS.md) â€” module-by-module honest status
2. [FAQ.md](FAQ.md) â€” common operator questions
3. [USER-MANUAL.md](USER-MANUAL.md)
4. [docs/release-recovery-status.md](docs/release-recovery-status.md) â€” what "provisional" actually means
5. [CHARTER.md](CHARTER.md) â€” the engineering principles
6. [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md) â€” architectural intent (note: per-module status lines in the spec are stale; use STATUS.md for current truth)
7. [docs/compatibility/index.md](docs/compatibility/index.md) â€” module â†” civiccore version pairings (this is the single source of truth for version pairings)

## Repo Map

| Repo | Role |
|---|---|
| `civicsuite` | Umbrella: roadmap, governance, specs, ADRs, compatibility matrix, suite-installer scaffolding |
| `civiccore` | Shared platform package consumed by every module |
| `civicrecords-ai` | v1.7.3 developer-preview city-core records release car |
| `civicclerk` | v1.0.3 meeting workflow city-core release car |
| `civiccode` | v1.0.8 municipal-code city-core release car |
| `civicaccess` | OUT of city-core after NEEDS-WORK depth probe |
| `civiczone` | Queued Tier 2 land-use module on demotion-truth label |
| `civicplan` | Queued Tier 2 planning module on demotion-truth label |
| `civicpermit` | Queued Tier 2 permit module on demotion-truth label |
| `civicinspect` | Queued Tier 2 inspection module on demotion-truth label |
| `civicgrants`, `civicprocure` | v0.2.0 demoted recovery labels; remaining modules are foundation-tier |
| `civicregwatch` | Planned federal regulatory intelligence module; spec exists, repo not scaffolded |
| `civicapi` | Planned public read-only data gateway module; spec exists, repo not scaffolded |

## Architecture

CivicSuite uses a deliberately boring stack. Every module inherits these defaults:

| Layer | Choice | Pin / Notes |
|---|---|---|
| Backend | FastAPI on Uvicorn | â€” |
| Database | PostgreSQL 17 + `pgvector` | Required for vector search |
| Cache / queue | Redis | Pinned `<8.0` (BSD); never SSPL releases |
| Workers | Celery + Celery Beat | â€” |
| LLM runtime | Ollama (local) | Default Gemma 4 family |
| Embeddings | `nomic-embed-text` | Local |
| Frontend | React behind nginx | â€” |

**Dependency rule:** modules depend on `civiccore`; `civiccore` never depends on modules. Cities run the stack on their own hardware. No cloud, no telemetry, no per-seat pricing.

The suite is aiming for a first installable starter beta, not for all 27 product modules to become equally deep at the same time. That distinction is intentional and load-bearing.

For the full architecture diagram and data-flow rules, see [ARCHITECTURE.md](ARCHITECTURE.md). For the dependency-pinning matrix between modules and civiccore versions, see [docs/compatibility/index.md](docs/compatibility/index.md).

## Continuity

Continuity is now an explicit gate, not a "later" governance item.

- Continuity plan: [SUCCESSION.md](SUCCESSION.md)
- Governance index: [docs/governance/index.md](docs/governance/index.md)
- Charter: [CHARTER.md](CHARTER.md)

The `CivicSuite` GitHub org has two active owners (`scottconverse` and `APirateMonk`).

## Documentation

- Front door: this README
- Status: [STATUS.md](STATUS.md)
- FAQ: [FAQ.md](FAQ.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Recovery status: [docs/release-recovery-status.md](docs/release-recovery-status.md)
- Roadmap: [docs/roadmap/index.md](docs/roadmap/index.md)
- Governance: [docs/governance/index.md](docs/governance/index.md)
- Compatibility matrix: [docs/compatibility/index.md](docs/compatibility/index.md)
- Unified spec (architectural intent only â€” see STATUS.md for current truth): [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)
- User manual: [USER-MANUAL.md](USER-MANUAL.md)

## Licensing

- Documentation: CC BY 4.0
- Code snippets in this repo: Apache 2.0
- Module repos: Apache 2.0 for code, CC BY 4.0 for docs

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Support

See [SUPPORT.md](SUPPORT.md) for support paths and [SECURITY.md](SECURITY.md) for vulnerability reporting.
