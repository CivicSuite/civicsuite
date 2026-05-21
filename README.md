# CivicSuite

**An open-source municipal product family designed to run on a city's own hardware. Under release-recovery review as of 2026-05-09.**

This `civicsuite` repository is the umbrella for the CivicSuite product family. It holds suite-wide documentation, governance, the roadmap, ADRs, the compatibility matrix, and the suite-installer scaffolding. Module runtime code lives in per-module repos under <https://github.com/CivicSuite>.

---

## Read Me First

CivicSuite is **not procurement-ready** today. Public release tags exist on multiple module repos, but they are **frozen as provisional** until each repo passes the recovery gates documented in [`docs/release-recovery-status.md`](docs/release-recovery-status.md). False v1.0.0 tags for CivicCode, CivicZone, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure are being replaced with honest recovery labels: CivicCode v0.5.0 and the six scaffold modules v0.2.0. CivicCore v1.1.0 is the current shared-platform release; CivicClerk v1.0.1 is the protected-default recovery patch; CivicRecords AI v1.6.1 is the current developer-preview records release with the ingestion worker recovery patch shipped.

Why the freeze: in a five-day window between 2026-05-01 and 2026-05-06, the org pushed multiple v1.0.0 / v0.22.x release labels across 7+ repos as part of a coordination sweep that the project owner subsequently halted. Two follow-on lateral sweeps (2026-05-07 and 2026-05-08) put v1.0.0 tags on `civicinspect`, `civicgrants`, and `civicprocure` against the explicit halt. None of those tags constitute promotion. The recovery-status doc is the operating truth source for which labels are real.

If you are evaluating CivicSuite for a municipality, treat this state as *developer preview* for the most mature module (civicrecords-ai) and *foundation only* for everything else.

---

## Suite Status

Status snapshot: **2026-05-20**

| Tier | Count | What it means today |
|---|---:|---|
| Corrective recovery labels | CivicCore plus 9 product repos | CivicCore v1.1.0 is the current shared-platform release. CivicClerk v1.0.1 is the protected-default recovery patch. CivicRecords AI v1.6.1 is shipped as developer preview with the ingestion worker recovery patch. CivicCode is demoted to v0.5.0. CivicZone, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure are demoted to v0.2.0. |
| Foundation / planned | 18 named product modules | The rest of the visible catalog has bounded runtime foundations or implementation specs. These are not city-ready products. `CivicRegWatch` and `CivicAPI` are planned modules with detailed specs but no runtime repos yet. The reconciled unified spec, installer metadata, and live GitHub org state now enumerate 27 product modules plus CivicCore. |

`civiccore` is the shared platform package consumed by every module; v1.1.0 is the current platform release with shared `staff_key_gate` support and the earlier auth-error-payload hardening included.

The most important distinction: **"all repos have releases" is not the same thing as "a city can run on this suite."** That gap is what the recovery gates exist to close.

## What Is Available Today

- **`civicrecords-ai`** (FOIA / public records) â€” the most mature product-shaped repo. v1.6.1 is shipped as developer preview with the ingestion worker event-loop recovery patch. Repo: <https://github.com/CivicSuite/civicrecords-ai>
- **`civiccore`** (shared platform) â€” substantial real subsystems exist (LLM provider abstraction, audit primitives, connector contracts, search helpers, schedule validation, shared staff-key gate). v1.1.0 is the current shared-platform release. Repo: <https://github.com/CivicSuite/civiccore>
- **`civicclerk`** (meetings/agendas/minutes) â€” substantial workflow code, mock-city test fixtures, first React staff workspace. v1.0.1 is the current recovery patch with protected staff auth defaults. Repo: <https://github.com/CivicSuite/civicclerk>
- **`civiccode`, `civiczone`, `civicplan`, `civicpermit`** â€” runtime foundations with bounded shipped surfaces; false v1.0.0 labels are being superseded by CivicCode v0.5.0 and CivicZone/CivicPlan/CivicPermit v0.2.0 recovery releases.
- **`civicinspect`, `civicgrants`, `civicprocure`** â€” recently tagged v1.0.0 against the 2026-05-07 halt; false labels are being superseded by v0.2.0 recovery releases.
- **`CivicRegWatch` and `CivicAPI`** â€” planned modules. Detailed specs in `specs/05_civicregwatch.md` and `specs/06_civicapi.md`; no runtime repos yet.
- **The remaining 16 modules** are foundation-tier: schemas, sample workflow slices, tests, and release gates. They do not yet ship the workflow, security, identity, connector, or operational depth required for municipal use.

For honest module-by-module status see [STATUS.md](STATUS.md).

## Current Priorities

The canonical roadmap lives at [docs/roadmap/index.md](docs/roadmap/index.md). The active execution target is now the [Clerk-Core City Release Plan](docs/roadmap/clerk-core-city-release-plan.md). The immediate sequence:

1. Finish the clerk-core starter product around CivicCore, CivicRecords AI, CivicClerk, and the suite installer.
2. Keep public product-ready claims frozen until the release gates pass.
3. Prove install/start/health/repair/backup/restore/uninstall for the Linux-first Docker/browser path.
4. Keep Windows and macOS scoped as wrappers around the Docker/browser workflow unless matching-host lifecycle evidence exists.
5. Browser-QA the public and staff starter-product paths with real user-flow evidence.
6. After the starter product passes its gate, generate the remaining-module queue from the reconciled unified spec.

## Quick Start

**Suite installer (current):** YELLOW beta. The current published clerk-core profile installer release source is `installer-clerk-core-v0.1.0-beta.4` on this repo's Releases page. It is an unsigned OSS beta for outside testing of the CivicCore + CivicRecords AI + CivicClerk starter profile, backed by PR #156, PR #157, main verify run `26134412418`, main installer-cleanroom run `26134412420`, and release-lockstep PR runs `26120937776` and `26134059097`. CivicSuite's core runtime path is Linux/container-first; Windows and macOS are wrapper platforms around that containerized core. Package evidence is now classified as archive/readiness, matching-host lifecycle, host-platform mismatch, or unsupported lifecycle. Linux remains the primary runtime proof path. Windows and macOS remain archive/readiness wrapper paths until matching-host lifecycle evidence is recorded on those hosts.

- Windows package: `CivicSuite-clerk-core-windows-0.1.0.zip`
- Linux package: `CivicSuite-clerk-core-linux-0.1.0.tar.gz`
- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(wrapper/archive only until matching-host macOS lifecycle evidence exists)*

See [installer/README.md](installer/README.md) for the contract and [docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md) for the plan.
Outside testers should use the focused [starter-set outside test guide](docs/installer/starter-set-outside-test-guide.md) for the Linux/Windows install, verify, repair, and uninstall path. Promotion beyond outside-test beta is blocked by the [Clerk-Core public-use readiness gate](docs/installer/starter-set-public-use-readiness-gate.md) until every release-recovery check has current evidence.

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
| `civicrecords-ai` | Most mature product-shaped repo; v1.6.1 developer-preview release with ingestion worker recovery patch |
| `civicclerk` | Meeting workflow; v1.0.1 protected-default recovery patch |
| `civiccode` | Municipal code; v0.5.0 demoted recovery label |
| `civiczone`, `civicplan`, `civicpermit`, `civicinspect`, `civicgrants`, `civicprocure` | v0.2.0 demoted recovery labels; remaining modules are foundation-tier |
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
