# CivicSuite — User Manual

**Last verified:** 2026-06-28 (civicsuite-windows-local-v1.0.1)

This is the orientation manual for the CivicSuite umbrella repo. It is written in three parts plus a glossary:

1. **For municipal decision-makers** — non-technical overview.
2. **For developers and IT staff** — how the umbrella repo works.
3. **Architecture reference** — pointer to [ARCHITECTURE.md](ARCHITECTURE.md).

For an at-a-glance honest module status, read [STATUS.md](STATUS.md) first. For common operator questions, read [FAQ.md](FAQ.md).

---

## Part 1 — For municipal decision-makers

### What is CivicSuite?

CivicSuite is an **open-source municipal product family**. It is not one giant program. It is a planned collection of modules a city can install one at a time, on its own hardware, on its own schedule. Cities do not need to send operational data to a vendor cloud, do not pay per seat, and can inspect or modify the source code.

### Current honest state

The Windows Local city-core package (`civicsuite-windows-local-v1.0.1`) is a **GA candidate now open for public beta**: validated end-to-end on a clean machine, with Authenticode code-signing the one remaining gate to GA (in progress). For the **other** modules, public "shipping," "product-ready," and "v1.0.0 proves release maturity" claims remain frozen until each repo re-earns that status through the gates in [docs/release-recovery-status.md](docs/release-recovery-status.md).

- `civiccore` is the shared platform; v1.2.0 is the current city-core platform release.
- `civicrecords-ai` (FOIA / records) is the current developer-preview records release car at v1.7.3.
- `civicclerk` (meetings) is the current meeting workflow release car at v1.0.4.
- `civiccode` is the current municipal-code release car at v1.0.8.
- `civicnotice` is the current public-notice workflow release car at v0.2.0.
- `civicaccess` v0.4.0 (accessibility + records-ready export) is the sixth city-core release car on CivicCore v1.2.0; it ships in the next MSI build.
- CivicZone, CivicPlan, CivicPermit, and CivicInspect are queued Tier 2 modules, not city-core products.
- The active city-core installer path is the Windows Local Tauri/WebView2 desktop app with portable local runtime services, local backup/restore, local file evidence, local model setup, and a normal Windows uninstall entry.
- The desktop app is the staff, resident/public preview, and IT/admin front door for the current city-core beta package. It is local-only by default and does not require Docker, WSL, a terminal, or developer tooling for the clerk path.

A municipality should evaluate the Windows Local city-core package as a beta package, not as a completed full-suite procurement product.

### What this means for your city

- **No vendor lock-in.** You run the software on your own hardware.
- **No mandatory cloud dependency.** Local-first by design.
- **No per-seat billing.** The Apache 2.0 license forecloses metering.
- **You can evaluate one module at a time.** No need to adopt the whole suite.
- **You still own operations.** Not a managed SaaS. Your IT team, or a contractor you choose, runs install / upgrades / recovery.

---

## Part 1.5 - Your first task with the city-core launcher

If you want to try CivicSuite today, start with the Windows Local city-core desktop installer and the operator walkthrough in [docs/installer/operator-walkthrough.md](docs/installer/operator-walkthrough.md).

### Prerequisites

- A Windows workstation with enough CPU, memory, and disk for local services, city data, backups, and the Gemma 4 12B QAT model file.
- Permission to install normal Windows desktop software.
- A stable internet connection for first install and model download unless IT has already staged the model file.
- A city name, records contact, clerk contact, first local administrator name/email, and backup folder location.

### System requirements

- **Operating system.** 64-bit Windows 10 or Windows 11 with the WebView2 runtime (current Windows builds include it).
- **Memory.** 16 GB RAM recommended. The local Gemma 4 12B QAT model needs about 6.7 GB resident at runtime on top of Windows, the portable PostgreSQL store, and the local services; 8 GB will struggle.
- **Disk.** About 15 GB free at minimum: roughly 1.5 GB for the MSI, about 7 GB for the downloaded model file, and headroom for city data and backups. First-run setup enforces a 15 GB free-disk floor before the model download.
- **Network.** A stable internet connection for the first install and the model download, unless IT has already staged the model file.

### Install (Windows Local desktop)

1. Download the current Windows Local MSI artifact from the active PR/release evidence or the matching GitHub release attestation when one is published.
2. Verify the SHA-256 checksum or release manifest from the same source.
3. Open the installer. Windows SmartScreen can warn "Unknown publisher" for this unsigned beta. Use **More info** and **Run anyway** only when the checksum matches the trusted artifact source.
4. Follow the installer screens and open CivicSuite after install.
5. Complete first-run setup: unsigned beta notice, SmartScreen review, local folders, City Core module selection, city profile, first local administrator sign-in, backup folder, Gemma 4 12B QAT download/resume, checksum verification, health verification, and finish.
6. Add clerk, records, code, or city-staff users from Settings when staff need separate local sign-ins.
7. Use Meetings & Notices, Records Requests, Code & Ordinances, Search City Knowledge, System Health, and Settings from the desktop app.

### Install (Linux / macOS)

Linux and macOS are not the current clerk install promise for Windows Local 1.0. Treat older Linux/macOS archive and wrapper evidence as historical until those profiles receive their own refreshed matching-host lifecycle gates.

### Trust path for city-core artifacts

City-core artifacts for this run are live regenerated evidence artifacts, not restored committed `installer/dist` files. Before testing a package:

1. Use the active PR/release evidence path recorded in [README.md](README.md) and [STATUS.md](STATUS.md).
2. Verify the generated MSI checksum or release-manifest hash for the package you will run.
3. Confirm the source pins in `installer/modules.json` match the city-core module commits.
4. For module release-car assets, confirm the published SHA256 and attestation assets recorded in the module release evidence where applicable.

Do not restore old generated installer artifacts unless Scott explicitly decides that those artifacts should be restored.

### First task: complete local setup

1. Open CivicSuite from Windows.
2. Complete the City Core setup checklist.
3. Create the first local administrator and store the passcode in the city's password vault.
4. Add staff users from Settings.
5. Open System Health and verify local services, local model, storage, backup, and task queue status.
6. Start with one real workflow: create a meeting in Meetings & Notices, create a records request in Records Requests, or import a code source in Code & Ordinances.

### What you should expect

- **What works in the Windows Local city-core target.** Local setup, city profile, local users/RBAC, meetings/notices/minutes/votes/archive workflows, public-notice checklist/posting/archive workflows, records intake/search/review/response/export workflows, municipal code import/guidance/publish/handoff workflows, cross-module local search, health, backup/restore, support bundle, repair, and uninstall handoff.
- **What still needs its own proof gate.** Each future module outside the city-core set (the clean-machine walkthrough for the current 1.0.1 MSI artifact has passed).
- **What's not in this package.** The remaining module catalog is installed later through the module-manager contract after each module passes package and proof gates.

### Where to go next

- For real evaluation: stand up a non-production tenant, ingest a representative document corpus, and run a week of internal staff requests through it.
- For procurement: wait for a later procurement-readiness gate; this beta-ready truth-reconciled package is not procurement-ready.
- For development: read [CONTRIBUTING.md](CONTRIBUTING.md) and the records-ai `docs/`.

---

## Part 2 — For developers and IT staff

### What lives in the umbrella repo?

The `civicsuite` repo is **documentation-, governance-, and coordination-first**. It contains:

- the [Charter](CHARTER.md), [Continuity plan](SUCCESSION.md), [Compatibility matrix](docs/compatibility/index.md), [Roadmap](docs/roadmap/index.md)
- the [Shared extraction consumer rollout playbook](docs/roadmap/shared-extraction-consumer-rollout.md)
- the unified suite specification and module catalog under `docs/` and `specs/`
- suite-level governance and ADRs
- the **suite installer** under `installer/` (a prior Clerk-Core starter release path plus the active city-core profile work)
- verification scripts under `scripts/`

The umbrella does **not** contain runtime code for individual products — that lives in the per-module repos.

### Module repos

| Repo | Status (see STATUS.md for full detail) |
|---|---|
| `civicrecords-ai` | v1.7.3 developer-preview city-core records release car |
| `civiccore` | Shared platform; v1.2.0 current city-core platform |
| `civicclerk` | v1.0.4 meeting workflow city-core release car |
| `civiccode` | v1.0.8 municipal-code city-core release car |
| `civicnotice` | v0.2.0 public-notice workflow city-core release car |
| `civicaccess` | v0.4.0 accessibility + records-ready export city-core release car (sixth city-core module) |
| `civiczone`, `civicplan`, `civicpermit`, `civicinspect` | Queued Tier 2 modules on demotion-truth labels |
| `civicgrants`, `civicprocure` | v0.2.0 scaffold-depth recovery labels |
| All others | Foundation surfaces (v0.1.x) |
| `civicregwatch`, `civicapi` | Planned; spec only |

### Dependency rule

**Modules depend on `civiccore`. `civiccore` never depends on modules.**

### How to evaluate a module

1. Read the module's `README.md`.
2. Read the module's `USER-MANUAL.md`.
3. Read the module's `CHANGELOG.md`.
4. Follow the module's `CONTRIBUTING.md` install steps on a clean machine.
5. Run the module's verification gates (`scripts/verify-release.sh` if present).
6. Cross-check against [STATUS.md](STATUS.md) and [docs/release-recovery-status.md](docs/release-recovery-status.md) before promoting any claim about the module.

### How releases are coordinated

When shared-platform behavior changes:

1. `civiccore` ships first.
2. Consumer modules adopt via a bounded rollout.
3. The compatibility matrix is updated.
4. Current-facing docs are updated in both the consumer repo and the umbrella repo when suite-level status changes.

The current standardized consumer adoption process: [docs/roadmap/shared-extraction-consumer-rollout.md](docs/roadmap/shared-extraction-consumer-rollout.md).

### How to contribute

- Suite-wide roadmap, governance, compatibility, or umbrella documentation work belongs in this repo.
- Product / module bugs and features belong in the relevant module repo.
- The umbrella repo also holds the suite-installer scaffolding and verification scripts; contributions to those land here.

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/governance/index.md](docs/governance/index.md).

---

## Part 3 — Architecture reference

The full suite architecture, dependency graph, data-flow rules, and CivicCore extraction phasing live in [ARCHITECTURE.md](ARCHITECTURE.md). The text-and-ASCII summary below is a quick orientation; the full diagram is in ARCHITECTURE.md.

### Suite topology (generated summary)

<!-- BEGIN GENERATED SUITE TOPOLOGY -->

Generated from `installer/modules.json`. Re-run `python scripts/docs/render_topology.py --check` before publishing docs.

- Root installer truth label: `city_core_beta_ready_truth_reconciled`.
- City-core profile status: `beta_ready_truth_reconciled`.
- City-core modules are the only modules represented in the current beta-ready profile.
- Disabled profiles and excluded modules remain documented as out of scope until their own gates clear.

| Module | Version | Role | Dependencies | Source commit | Installer status |
|---|---:|---|---|---|---|
| CivicCore | 1.2.0 | shared platform | none | `1a53f0680fff` | `v1_2_0_windows_local_platform_contracts` |
| CivicRecords AI | 1.7.3 | records workflow | `civiccore` | `e2208827b660` | `v1_7_3_city_core_release_car` |
| CivicClerk | 1.0.4 | meetings workflow | `civiccore` | `fa1874edfe97` | `v1_0_4_city_core_release_car` |
| CivicCode | 1.0.8 | municipal code | `civiccore`, `civicclerk` | `a960bba0a224` | `v1_0_8_city_core_release_car` |
| CivicNotice | 0.2.0 | public notice workflow | `civiccore`, `civicclerk` | `2bf0c9d7b764` | `v0_2_0_installed_module_release` |
| CivicAccess | 0.4.0 | accessibility + records-ready export | `civiccore` | `7b24516fd895` | `v0_4_0_city_core_release_car` |

Disabled profiles:
- `land-use` (Land Use): queued - depends on Tier 2 module work after city-core ships
- `full-suite` (Full Suite): 14 modules remain pre-1.0 scaffolds pinned to older CivicCore lines; not installable as a coherent suite

<!-- END GENERATED SUITE TOPOLOGY -->

### Upgrade and migration order

When `civiccore` ships a backward-compatible change:
1. `civiccore` releases the new version.
2. Compatibility matrix is updated.
3. Consumers adopt via the rollout playbook.

When `civiccore` ships a breaking change:
1. Change is documented in advance (ADR).
2. `civiccore` releases first.
3. Consumers ship paired changes.
4. Compatibility matrix records the new pairing.

### Continuity and governance

Continuity is now a gate, not a future aspiration. See [SUCCESSION.md](SUCCESSION.md). The roadmap that governs the rest of the program is [docs/roadmap/index.md](docs/roadmap/index.md).

---

## Glossary

- **ADA Title II** — accessibility compliance requirement for public-sector digital services. Cities >50K must comply by 2027; smaller cities by 2028.
- **ADR** — Architecture Decision Record.
- **Air-gap** — operating without an outbound network connection.
- **CC BY 4.0** — Creative Commons Attribution license used for documentation.
- **CI** — continuous integration.
- **Connector** — module-side adapter that imports data from a city system. Read-first by design.
- **FOIA** — Freedom of Information Act and related public-records laws.
- **LLM** — large language model.
- **Local-first** — software designed to run on infrastructure the city controls.
- **Module** — a single CivicSuite product (e.g., civicclerk, civicrecords-ai).
- **Open source** — software available under a license allowing use, modification, and redistribution.
- **Pinned version** — a specific exact dependency pairing rather than a range.
- **Procurement-ready** — has passed the recovery gates and can be evaluated against city procurement standards. Distinct from "has a release tag."
- **Provisional** — has a version label but the label is not currently a promotion claim.
- **Recovery gate** — one of the ten checks documented in `docs/release-recovery-status.md` that must pass before a "shipping" claim can be re-issued.
- **Sovereign deployment** — software running on infrastructure the city controls.
- **Sigstore / cosign** — signing tooling used for `civiccore` release attestations starting v0.22.1.
- **WCAG 2.2 AA** — Web Content Accessibility Guidelines target for public-facing surfaces.
- **Wheel** — Python package distribution format.

---

## When something goes wrong

| Symptom | Where to look |
|---|---|
| Module will not install | Open Settings > Module Catalog, review dependencies and proof status, then use the guided install/update/repair action for ready modules. CivicCore stays installed. |
| Desktop app opens but shows no module activity | Open System Health, check local services, task queue schema, local model, and enabled module state, then use Repair after reviewing the repair panel. |
| Unsure whether an artifact is current | Verify the live `SHA256SUMS` or release manifest from the active run evidence path; do not rely on restored `installer/dist` files unless Scott explicitly approved restoration. |
| `civiccore` version mismatch | [docs/compatibility/index.md](docs/compatibility/index.md) is the canonical pairing source. |
| README says "shipping," recovery doc says "frozen" | The recovery doc wins. See [docs/release-recovery-status.md](docs/release-recovery-status.md). |
| Unsure where to file a bug | [CONTRIBUTING.md](CONTRIBUTING.md) — bug-routing decision tree. |
| Security issue | [SECURITY.md](SECURITY.md) — open a private GitHub Security Advisory. |
| General support question | [SUPPORT.md](SUPPORT.md). |
| Disk still full after uninstall | By design, a plain Windows uninstall (Settings > Installed apps, or Add/Remove Programs) removes the program files but leaves the downloaded ~7 GB Gemma 4 model, your city data, and your backups on disk so a reinstall can restore them. To reclaim that space, delete the configured local data and backup folders, and the model folder, manually after uninstall once you are sure you no longer need them. |
| First-time evaluator | [FAQ.md](FAQ.md), then [STATUS.md](STATUS.md), then this manual. |
