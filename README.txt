# Townlight

**An open-source municipal product family designed to run on a city's own hardware. Under release-recovery review as of 2026-05-09.**

This `townlight` repository is the umbrella for the Townlight product family. It holds suite-wide documentation, governance, the roadmap, ADRs, the compatibility matrix, and the suite-installer scaffolding. Module runtime code lives in per-module repos under <https://github.com/townlight>.

---

## Read Me First

Townlight is **not procurement-ready** today. Public release tags exist on multiple module repos, but they are **frozen as provisional** until each repo passes the recovery gates documented in [`docs/release-recovery-status.md`](docs/release-recovery-status.md). CivicCode, CivicAccess, CivicZone, and CivicPlan have now passed their v1.0.0 public-use module release gates and suite installer/module-selection truth reconciliation. CivicPermit, CivicInspect, CivicGrants, and CivicProcure remain on honest v0.2.0 recovery labels. CivicCore v1.1.0 is the current shared-platform release; CivicClerk v1.0.1 is the protected-default recovery patch; CivicRecords AI v1.6.1 is the current developer-preview records release with the ingestion worker recovery patch shipped.

Why the freeze: in a five-day window between 2026-05-01 and 2026-05-06, the org pushed multiple v1.0.0 / v0.22.x release labels across 7+ repos as part of a coordination sweep that the project owner subsequently halted. Two follow-on lateral sweeps (2026-05-07 and 2026-05-08) put v1.0.0 tags on `civicinspect`, `civicgrants`, and `civicprocure` against the explicit halt. None of those tags constitute promotion. The recovery-status doc is the operating truth source for which labels are real.

If you are evaluating Townlight for a municipality, treat this state as *developer preview* for the most mature module (civicrecords-ai) and *foundation only* for everything else.

---

## Suite Status

Status snapshot: **2026-05-21**

| Tier | Count | What it means today |
|---|---:|---|
| Corrective recovery labels | CivicCore plus 10 product repos | CivicCore v1.1.0 is the current shared-platform release. CivicClerk v1.0.1 is the protected-default recovery patch. CivicRecords AI v1.6.1 is shipped as developer preview with the ingestion worker recovery patch. CivicCode v1.0.0, CivicAccess v1.0.0, CivicZone v1.0.0, and CivicPlan v1.0.0 are recovered public-use module releases. CivicPermit, CivicInspect, CivicGrants, and CivicProcure remain demoted to v0.2.0. |
| Foundation / planned | 17 named product modules | The rest of the visible catalog has bounded runtime foundations or implementation specs. These are not city-ready products. `CivicRegWatch` and `CivicAPI` are planned modules with detailed specs but no runtime repos yet. The reconciled unified spec, installer metadata, and live GitHub org state now enumerate 27 product modules plus CivicCore. |

`civiccore` is the shared platform package consumed by every module; v1.1.0 is the current platform release with shared `staff_key_gate` support and the earlier auth-error-payload hardening included.

The most important distinction: **"all repos have releases" is not the same thing as "a city can run on this suite."** That gap is what the recovery gates exist to close.

## What Is Available Today

- **`civicrecords-ai`** (FOIA / public records) â€” the most mature product-shaped repo. v1.6.1 is shipped as developer preview with the ingestion worker event-loop recovery patch. Repo: <https://github.com/townlight/civicrecords-ai>
- **`civiccore`** (shared platform) â€” substantial real subsystems exist (LLM provider abstraction, audit primitives, connector contracts, search helpers, schedule validation, shared staff-key gate). v1.1.0 is the current shared-platform release. Repo: <https://github.com/townlight/core>
- **`civicclerk`** (meetings/agendas/minutes) â€” substantial workflow code, mock-city test fixtures, first React staff workspace. v1.0.1 is the current recovery patch with protected staff auth defaults. Repo: <https://github.com/townlight/civicclerk>
- **`civiccode`** â€” municipal code module; v1.0.0 public-use module release passed source gates, release artifacts, attestation, public browser QA, and suite installer/module-selection truth reconciliation.
- **`civicaccess`** - accessibility, plain-language, multilingual draft, ADA Title II review-support, tagged-PDF expectation, and records-ready export module; v1.0.0 public-use module release passed source gates, release artifacts, public browser QA, release-gate audit, and suite installer/module-selection truth reconciliation.
- **`civiczone`** - parcel-aware zoning and land-use Q&A module; v1.0.0 public-use module release passed source gates, release artifacts, public/staff browser QA, release-gate audit, and suite installer/module-selection truth reconciliation.
- **`civicplan`** - planning policy lookup module; v1.0.0 public-use module release passed source gates, release artifacts, public browser QA, release-gate audit, and suite installer/module-selection truth reconciliation.
- **`civicpermit`** â€” runtime foundation with bounded shipped surfaces; its false v1.0.0 label is being superseded by a v0.2.0 recovery release.
- **`civicinspect`, `civicgrants`, `civicprocure`** â€” recently tagged v1.0.0 against the 2026-05-07 halt; false labels are being superseded by v0.2.0 recovery releases.
- **`CivicRegWatch` and `CivicAPI`** â€” planned modules. Detailed specs in `specs/05_civicregwatch.md` and `specs/06_civicapi.md`; no runtime repos yet.
- **The remaining 15 modules** are foundation-tier: schemas, sample workflow slices, tests, and release gates. They do not yet ship the workflow, security, identity, connector, or operational depth required for municipal use.

For honest module-by-module status see [STATUS.md](STATUS.md).

## Current Priorities

The canonical roadmap lives at docs/roadmap/index.md. As of 2026-06-10 the suite runs under the full-suite finishing program (docs/roadmap/full-suite-program.md): all 27 modules finished one at a time behind a clean-VM definition of done, with the Windows profile moving to a portable-native runtime per ADR-0008. The immediate sequence within that program:

1. Core hardening: CivicClerk persistence, CivicCode persistence and frontend, the CivicCore exemptions engine, and CivicRecords AI notification wiring.
2. Installer rebuild to the portable-native Windows runtime (ADR-0008/ADR-0009) with plain-language unsigned-beta trust screens.
3. The core four through the clean-VM definition-of-done gate as one package.
4. Module-by-module finishing in the program's approved order, one module in flight at a time.
5. Keep macOS explicitly beta/archive/readiness only until matching-host proof exists.

## Quick Start

**Suite installer (current):** Clerk-Core public-use starter release. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0`. Townlight's core runtime path is Linux/container-first; Windows and macOS are wrapper platforms around that containerized core. Package evidence is classified as archive/readiness, matching-host lifecycle, host-platform mismatch, or unsupported lifecycle. Linux and Windows have matching-host lifecycle evidence for the Clerk-Core package. macOS is supported at beta archive/readiness level until matching-host lifecycle evidence is recorded on a Darwin/macOS Docker Desktop host.

- Windows package: `CivicSuite-clerk-core-windows-0.1.0.zip`
- Linux package: `CivicSuite-clerk-core-linux-0.1.0.tar.gz`
- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(wrapper/archive only until matching-host lifecycle evidence exists on a Darwin host)*

See [installer/README.md](installer/README.md) for the contract and [docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md) for the plan.

**Per-module install path:**

- FOIA / public records: <https://github.com/townlight/civicrecords-ai> â€” Linux/container-first. Windows and macOS use wrapper/script paths around the same containerized services; platform claims remain bounded by the lifecycle evidence in the release notes.
- Other modules: see each module's README for install instructions. Most modules ship as Python packages depending on `civiccore`.

If you are orienting yourself for the first time, read in this order:

1. [STATUS.md](STATUS.md) â€” module-by-module honest status
2. [FAQ.md](FAQ.md) â€” common operator questions
3. [USER-MANUAL.md](USER-MANUAL.md)
4. [docs/release-recovery-status.md](docs/release-recovery-status.md) â€” what "provisional" actually means
5. [CHARTER.md](CHARTER.md) â€” the engineering principles
6. [docs/TownlightUnifiedSpec.md](docs/TownlightUnifiedSpec.md) â€” architectural intent (note: per-module status lines in the spec are stale; use STATUS.md for current truth)
7. [docs/compatibility/index.md](docs/compatibility/index.md) â€” module â†” civiccore version pairings (this is the single source of truth for version pairings)

## Repo Map

| Repo | Role |
|---|---|
| `townlight` | Umbrella: roadmap, governance, specs, ADRs, compatibility matrix, suite-installer scaffolding |
| `civiccore` | Shared platform package consumed by every module |
| `civicrecords-ai` | Most mature product-shaped repo; v1.6.1 developer-preview release with ingestion worker recovery patch |
| `civicclerk` | Meeting workflow; v1.0.1 protected-default recovery patch |
| `civiccode` | Municipal code; v1.0.0 public-use module release |
| `civicaccess` | Accessibility and plain-language support; v1.0.0 public-use module release |
| `civiczone` | Parcel-aware zoning and land-use Q&A; v1.0.0 public-use module release |
| `civicplan` | Planning policy lookup; v1.0.0 public-use module release |
| `civicpermit`, `civicinspect`, `civicgrants`, `civicprocure` | v0.2.0 demoted recovery labels; remaining modules are foundation-tier |
| `civicregwatch` | Planned federal regulatory intelligence module; spec exists, repo not scaffolded |
| `civicapi` | Planned public read-only data gateway module; spec exists, repo not scaffolded |

## Architecture

Townlight uses a deliberately boring stack. Every module inherits these defaults:

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

The suite is aiming for a first deployable "city starter set," not for all 27 product modules to become equally deep at the same time. That distinction is intentional and load-bearing.

For the full architecture diagram and data-flow rules, see [ARCHITECTURE.md](ARCHITECTURE.md). For the dependency-pinning matrix between modules and civiccore versions, see [docs/compatibility/index.md](docs/compatibility/index.md).

## Continuity

Continuity is now an explicit gate, not a "later" governance item.

- Continuity plan: [SUCCESSION.md](SUCCESSION.md)
- Governance index: [docs/governance/index.md](docs/governance/index.md)
- Charter: [CHARTER.md](CHARTER.md)

The `Townlight` GitHub org has two active owners (`scottconverse` and `APirateMonk`).

## Documentation

- Front door: this README
- Status: [STATUS.md](STATUS.md)
- FAQ: [FAQ.md](FAQ.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Recovery status: [docs/release-recovery-status.md](docs/release-recovery-status.md)
- Roadmap: [docs/roadmap/index.md](docs/roadmap/index.md)
- Governance: [docs/governance/index.md](docs/governance/index.md)
- Compatibility matrix: [docs/compatibility/index.md](docs/compatibility/index.md)
- Unified spec (architectural intent only â€” see STATUS.md for current truth): [docs/TownlightUnifiedSpec.md](docs/TownlightUnifiedSpec.md)
- User manual: [USER-MANUAL.md](USER-MANUAL.md)

## Licensing

- Documentation: CC BY 4.0
- Code snippets in this repo: Apache 2.0
- Module repos: Apache 2.0 for code, CC BY 4.0 for docs

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Support

See [SUPPORT.md](SUPPORT.md) for support paths and [SECURITY.md](SECURITY.md) for vulnerability reporting.
