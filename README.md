# Townlight

**An open-source municipal product family designed to run locally on a city's own hardware.**

This `townlight` repository is the umbrella for the Townlight product family. It holds suite-wide documentation, governance, the roadmap, ADRs, the compatibility matrix, and the suite-installer scaffolding. Module runtime code lives in per-module repos under <https://github.com/townlight>.

---

## Read Me First

Townlight's active product is the Windows Local city-core desktop app, a **GA candidate open for public beta**. The current release is `civicsuite-windows-local-v1.0.2` (Latest) — a single Tauri/WebView2 MSI (~1.65 GB) that installs the whole six-module city-core suite: CivicCore v1.2.0 plus CivicRecords AI v1.7.3, CivicClerk v1.0.4, CivicCode v1.0.8, CivicNotice v0.2.0, and CivicAccess v0.4.0, with bundled portable PostgreSQL 17 + pgvector, bundled local services, the pinned Gemma 4 12B QAT model, and local backup/restore — **no Docker, WSL, terminal, or developer tooling**. It supersedes `civicsuite-windows-local-v1.0.1`. See [ANNOUNCEMENT.md](ANNOUNCEMENT.md) to start.

**What "GA candidate, public beta" means:** the build is feature-complete for city-core and passed the Phase D clean-machine acceptance gate — two full clean Windows Sandbox runs of the real installer (install → the full first-run wizard → admin sign-in → the ~6.97 GB model download with the app's own streamed SHA-256 verification and all six readiness checks green → the three CivicAccess AI features producing clean, correctly-labeled output through the real app bridge). The MSI is Authenticode code-signed via Azure Trusted Signing. Use it for real hands-on evaluation and early adoption — it does **not** claim public-use readiness, city-ready status, procurement/production readiness, macOS lifecycle certification, or full-suite release.

Scope: city-core is six modules, and the current v1.0.2 build ships all six — including **CivicAccess v0.4.0** (accessibility + records-ready export), whose on-screen **Accessibility** workflow tab is this release's headline. A clerk sees six workflow areas (Meetings, Records, Code, Notice, Accessibility, Search). Background: [docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md](docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md). CivicZone, CivicPlan, CivicPermit, and CivicInspect remain queued Tier 2 modules on corrected version labels (version lowered to match actual maturity). The MSI bundles module source pinned by commit (for two modules ahead of the latest published tag); the trust path is the `source_commit` pin plus the MSI checksum — see [PROVENANCE.md](PROVENANCE.md). For the history of the 2026-05 release-label freeze and which labels are real, see [docs/release-recovery-status.md](docs/release-recovery-status.md).

**What v1.0.2 changed, for a city (plain English):** the new Accessibility tab helps a clerk make public documents easier to use — it drafts plain-language rewrites of your text, drafts translations into any language you name, and adds a short "fix this first, and here's why" analysis to saved accessibility reviews. All of it runs on the office computer; nothing is sent to the cloud. Every AI output is a labeled draft a human must review, translations go to a qualified human translator before public use, and a review's status comes only from the deterministic rule checks — never from the AI. If the AI engine isn't ready, every tool says so plainly and keeps working in a labeled sample mode. v1.0.2 also fixes a first-run failure on factory-fresh PCs: the bundled database needed a Microsoft runtime component a clean Windows machine doesn't have, and the installer now bundles it.

**What v1.0.2 changed, for IT:** the suite's shared text-generation helper now calls the bundled Ollama's `/api/chat` endpoint instead of `/api/generate` with raw prompts, letting the model apply its own chat template and parser — this fixed output quality for **every** AI feature in the suite (CivicClerk minutes drafts, CivicRecords AI response drafts, CivicCode guidance, and the three new CivicAccess features). The model remains the pinned `gemma-4-12b-it-qat-q4_0` (~6.97 GB, downloaded and SHA-256-verified at first run) served locally by the bundled Ollama at `127.0.0.1:15434`; no cloud calls, no telemetry. The clean-machine fix stages the Microsoft VC++ runtime DLLs (`vcruntime140.dll`, `vcruntime140_1.dll`, `msvcp140.dll`) into `postgres\bin`, so PostgreSQL starts on a machine with no system VC++ redistributable — a pre-existing v1.0.x defect caught by the Phase D clean-sandbox runs and proven fixed in a second clean run.

If you are evaluating Townlight for a municipality, use the Windows Local city-core desktop path and the operator walkthrough in [docs/installer/operator-walkthrough.md](docs/installer/operator-walkthrough.md).

---

## Suite Status

Status snapshot: **2026-07-02** (current release: `civicsuite-windows-local-v1.0.2`, Latest — GA candidate, open for public beta)

| Tier | Scope | What it means today |
|---|---:|---|
| City-core module releases | CivicCore plus 5 product repos | CivicCore v1.2.0 is the shared platform release and now carries the Windows-local platform contracts plus PostgreSQL-backed task queue/worker. CivicRecords AI v1.7.3, CivicClerk v1.0.4, CivicCode v1.0.8, CivicNotice v0.2.0, and CivicAccess v0.4.0 are the city-core module releases. The shipped product path is the Windows Local Tauri/WebView2 desktop app with a portable-native runtime and local-only clerk path. |
| Queued modules | Tier 2 | CivicZone, CivicPlan, CivicPermit, and CivicInspect are queued on corrected version labels, not city-core public-use releases. |
| Foundation / planned | 18 named product modules | The rest of the visible catalog has bounded runtime foundations or implementation specs. These are not city-ready products. `CivicRegWatch` and `CivicAPI` are planned modules with detailed specs but no runtime repos yet. The reconciled unified spec, installer metadata, and live GitHub org state now enumerate 27 product modules plus CivicCore. |

`civiccore` is the shared platform package consumed by every module; v1.2.0 is the current city-core platform release with shared document ingestion, Windows-local platform contracts, the PostgreSQL-backed local task queue/worker, shared `staff_key_gate` support, and the earlier auth-error-payload hardening included.

The most important distinction: **"all repos have releases" is not the same thing as "a city can run on this suite."** That gap is what the [release-verification gates](docs/release-recovery-status.md) exist to close.

## What Is Available Today

- **`civicrecords-ai`** (FOIA / public records) - v1.7.3 — city-core records module, shipped in the v1.0.2 build, on CivicCore v1.2.0. Repo: <https://github.com/townlight/civicrecords-ai>
- **`civiccore`** (shared platform) - v1.2.0 is the current shared-platform release for city-core. Repo: <https://github.com/townlight/core>
- **`civicclerk`** (meetings/agendas/minutes) - v1.0.4 is the current meeting workflow module release with protected staff auth defaults. Repo: <https://github.com/townlight/civicclerk>
- **`civiccode`** - v1.0.8 is the current municipal-code city-core module release on CivicCore v1.2.0.
- **`civicnotice`** - v0.2.0 is the current public-notice city-core module release on CivicCore v1.2.0.
- **`civicaccess`** - v0.4.0 accessibility and records-ready export city-core module release on CivicCore v1.2.0 (sixth city-core module; its clerk-facing Accessibility workflow tab — with three local-AI features — is the headline of the current v1.0.2 build).
- **`civiczone`, `civicplan`, `civicpermit`, `civicinspect`** - queued Tier 2 modules on corrected version labels; not part of city-core.
- **`civicgrants`, `civicprocure`** - tagged v1.0.0 after (in violation of) the 2026-05-07 release halt; those false labels are being superseded by early-stage v0.2.0 recovery releases ([history](docs/release-recovery-status.md)).
- **`CivicRegWatch` and `CivicAPI`** — planned modules. Detailed specs in [specs/05_civicregwatch.md](specs/05_civicregwatch.md) and [specs/06_civicapi.md](specs/06_civicapi.md); no runtime repos yet.
- **The remaining 14 modules** are foundation-tier: schemas, sample workflow slices, tests, and release gates. They do not yet ship the workflow, security, identity, connector, or operational depth required for municipal use.

For honest module-by-module status see [STATUS.md](STATUS.md).

## Current Priorities

The canonical roadmap lives at [docs/roadmap/index.md](docs/roadmap/index.md). As of 2026-07-02 the suite runs under the [full-suite finishing program](docs/roadmap/full-suite-program.md): all 27 modules finished one at a time behind a clean-VM definition of done, on the portable-native Windows runtime per [ADR-0008](docs/architecture/ADR-0008-portable-native-windows-runtime.md)/[ADR-0009](docs/architecture/ADR-0009-postgres-backed-queue-windows-profile.md) — the runtime v1.0.2 already ships. The immediate sequence within that program:

1. Public-beta feedback intake and fixes for the shipped v1.0.2 city-core build.
2. Module-by-module finishing in the program's approved order, one module in flight at a time.

The Windows MSI is Authenticode code-signed via Azure Trusted Signing. Because the certificate is new, Windows SmartScreen may still show *"Windows protected your PC"* on first run — click **More info**, confirm it shows a **verified publisher** (not "Unknown Publisher"), then **Run anyway**. This is normal for a newly-signed app and stops as the certificate builds reputation. See [docs/troubleshooting.md](docs/troubleshooting.md#windows-smartscreen-when-you-run-the-installer).

## Quick Start

**Windows Local city-core (current beta target):** the active installable product path is the Townlight desktop app under `desktop/`. It packages a Tauri/WebView2 Windows MSI, a portable PostgreSQL 17 + pgvector data store, bundled CPython city services, a PostgreSQL-backed task queue, local file storage, local backup/restore, local repair/support-bundle flows, Windows uninstall handoff, and Gemma 4 12B QAT Q4_0 model setup through explicit download/checksum/runtime registration.

- City Core installs CivicCore plus CivicRecords AI, CivicClerk, CivicCode, CivicNotice, and CivicAccess. CivicCore is always installed and cannot be deselected.
- 32 GB RAM is recommended (16 GB is a workable minimum) — headroom for the local model resident alongside PostgreSQL and the services.
- The end-user Windows clerk path does not require Docker, WSL, a terminal, a browser URL, or developer tooling.
- First-run setup covers local folders, module selection, city profile, first Townlight admin sign-in, backup folder, model download/verification, health verification, and finish.
- Trust path: download `CivicSuite_1.0.2_x64_en-US.msi` from the [civicsuite-windows-local-v1.0.2 release](https://github.com/townlight/townlight/releases/tag/civicsuite-windows-local-v1.0.2), verify its SHA-256 `bbdeb1b69e846d3ccb8c961502f4b2f158e92623e7bf4dfa9d4c4bf2f9a0fd02`, and confirm the module pins in [installer/modules.json](installer/modules.json).
- macOS and Linux package paths remain separate future or historical profiles until each has refreshed install-lifecycle testing on the same operating system it ships for.

See [docs/troubleshooting.md](docs/troubleshooting.md) for operator recovery guidance, [installer/README.md](installer/README.md) for the generated-package contract, and [docs/installer/suite-installer-plan.md](docs/installer/suite-installer-plan.md) for the plan.
Operators evaluating the Windows Local city-core beta path should use [docs/installer/operator-walkthrough.md](docs/installer/operator-walkthrough.md).

**Per-module install path:**

- FOIA / public records: <https://github.com/townlight/civicrecords-ai> - module release consumed by the Windows Local city-core package.
- Other modules: see each module's README for install instructions. Most modules ship as Python packages depending on `civiccore`.

If you are orienting yourself for the first time, read in this order:

1. [STATUS.md](STATUS.md) — module-by-module honest status
2. [FAQ.md](FAQ.md) — common operator questions
3. [USER-MANUAL.md](USER-MANUAL.md)
4. [docs/release-recovery-status.md](docs/release-recovery-status.md) — what "provisional" actually means
5. [CHARTER.md](CHARTER.md) — the engineering principles
6. [docs/TownlightUnifiedSpec.md](docs/TownlightUnifiedSpec.md) — architectural intent (note: per-module status lines in the spec are stale; use STATUS.md for current truth)
7. [docs/compatibility/index.md](docs/compatibility/index.md) — module ↔ civiccore version pairings (this is the single source of truth for version pairings)

## Repo Map

| Repo | Role |
|---|---|
| `townlight` | Umbrella: roadmap, governance, specs, ADRs, compatibility matrix, suite-installer scaffolding |
| `civiccore` | Shared platform package consumed by every module |
| `civicrecords-ai` | v1.7.3 — city-core records module (FOIA/public records), shipped in the v1.0.2 build |
| `civicclerk` | v1.0.4 meeting workflow city-core module release |
| `civiccode` | v1.0.8 municipal-code city-core module release |
| `civicnotice` | v0.2.0 public-notice workflow city-core module release |
| `civicaccess` | v0.4.0 city-core module release (sixth city-core module — its Accessibility tab, with three local-AI features, shipped in v1.0.2) |
| `civiczone` | Queued Tier 2 land-use module on a corrected version label |
| `civicplan` | Queued Tier 2 planning module on a corrected version label |
| `civicpermit` | Queued Tier 2 permit module on a corrected version label |
| `civicinspect` | Queued Tier 2 inspection module on a corrected version label |
| `civicgrants`, `civicprocure` | v0.2.0 early-stage recovery releases; remaining modules are foundation-tier |
| `civicregwatch` | Planned federal regulatory intelligence module; spec exists, repo not scaffolded |
| `civicapi` | Planned public read-only data gateway module; spec exists, repo not scaffolded |

## Architecture

Townlight uses a deliberately boring stack. Every module inherits these defaults:

| Layer | Choice | Pin / Notes |
|---|---|---|
| Backend | FastAPI on Uvicorn | — |
| Database | PostgreSQL 17 + `pgvector` | Required for vector search |
| Queue | PostgreSQL-backed CivicCore task queue | Windows Local profile |
| Workers | Bundled CPython city services | Windows Local profile |
| LLM runtime | Ollama (local) | Default Gemma 4 family |
| Embeddings | `nomic-embed-text` | Local |
| Frontend | Tauri/WebView2 desktop shell | Windows Local profile |

**Dependency rule:** modules depend on `civiccore`; `civiccore` never depends on modules. Cities run the stack on their own hardware. No cloud, no telemetry, no per-seat pricing.

The installable six-module city-core beta shipped in `civicsuite-windows-local-v1.0.2`; the remaining modules deepen one at a time rather than all 27 product modules becoming equally deep at once. That distinction is intentional and load-bearing.

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
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- Roadmap: [docs/roadmap/index.md](docs/roadmap/index.md)
- Governance: [docs/governance/index.md](docs/governance/index.md)
- Compatibility matrix: [docs/compatibility/index.md](docs/compatibility/index.md)
- Unified spec (architectural intent only — see STATUS.md for current truth): [docs/TownlightUnifiedSpec.md](docs/TownlightUnifiedSpec.md)
- User manual: [USER-MANUAL.md](USER-MANUAL.md)

## Licensing

- Documentation: CC BY 4.0
- Code snippets in this repo: Apache 2.0
- Module repos: Apache 2.0 for code, CC BY 4.0 for docs

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Support

See [SUPPORT.md](SUPPORT.md) for support paths and [SECURITY.md](SECURITY.md) for vulnerability reporting.
