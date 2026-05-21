# CivicSuite — User Manual

**Last verified:** 2026-05-15

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

CivicSuite is under release-recovery review. Public "shipping," "product-ready," and "v1.0.0 proves release maturity" claims are frozen until each repo re-earns that status through the gates in [docs/release-recovery-status.md](docs/release-recovery-status.md).

- `civicrecords-ai` (FOIA / records) is the most mature module today; v1.6.1 is a developer-preview release with the ingestion worker recovery patch shipped.
- `civicclerk` (meetings) has substantial workflow code and a first React staff workspace; v1.0.1 shipped the protected-default recovery patch.
- CivicCode v1.0.0, CivicAccess v1.0.0, CivicZone v1.0.0, and CivicPlan v1.0.0 have passed their public-use module release gates; CivicPermit, CivicInspect, CivicGrants, and CivicProcure remain demoted to v0.2.0.
- The remaining 15 modules are foundation-tier surfaces (sample APIs, sample UI, civiccore alignment) — not yet usable products.
- `civiccore` is the shared platform package under all of them; v1.1.0 is the current shared-platform release.

A municipality cannot today run end-to-end on this suite. Pilot evaluation is reasonable; procurement is not.

### What this means for your city

- **No vendor lock-in.** You run the software on your own hardware.
- **No mandatory cloud dependency.** Local-first by design.
- **No per-seat billing.** The Apache 2.0 license forecloses metering.
- **You can evaluate one module at a time.** No need to adopt the whole suite.
- **You still own operations.** Not a managed SaaS. Your IT team, or a contractor you choose, runs install / upgrades / recovery.

---

## Part 1.5 — Your first task with CivicRecords AI

If you want to *try* CivicSuite today, this is the path. Treat this as a developer-preview walkthrough, not production setup.

### Prerequisites

- A workstation with **8+ CPU cores**, **32 GB RAM**, **50 GB free disk space**.
- **Docker Engine** on Linux, or Docker Desktop on Windows/macOS for wrapper-based installs. Linux is the primary development and runtime proof path. On Windows, also WSL 2 + Virtual Machine Platform. Windows and macOS remain archive/readiness wrapper paths until matching-host lifecycle evidence is recorded on those hosts.
- About 30 minutes for first install (model downloads).

### Install (Windows wrapper)

1. Download `CivicRecordsAI-<version>-Setup.exe` from the latest release at <https://github.com/CivicSuite/civicrecords-ai/releases>.
2. Verify the SHA-256 checksum published alongside the installer.
3. Run the installer. **Windows SmartScreen will warn "Unknown publisher" — this is expected. Click "More info → Run anyway."** The installer is intentionally unsigned today.
4. The installer fires a prereq check, then `install.ps1`. The model picker offers four Gemma 4 sizes; pick `gemma4:e4b` for the default.
5. After install, two Start Menu entries appear:
   - **Start CivicRecords AI** — daily start (`docker compose up -d`).
   - **Install or Repair CivicRecords AI** — bootstrap / repair.

### Install (Linux / macOS)

Linux is the primary runtime target and has matching-host lifecycle evidence for the clerk-core beta. The script path below also runs on macOS today, but macOS is not lifecycle-certified yet.

```bash
git clone https://github.com/CivicSuite/civicrecords-ai.git
cd civicrecords-ai
bash install.sh
```

The script does not install Docker/WSL — those must already be present.

### First task: search a small document set

1. Open <http://localhost:8080> in your browser.
2. Sign in with the admin credentials you configured in `.env`.
3. **Sources → Add Source** → enter a directory path with a few sample PDFs/DOCX files.
4. Click **Ingest Now**. The pipeline parses, chunks, embeds, and indexes the documents.
5. **Search** → type a natural-language query (e.g., "what does the city pay for streetlight maintenance?"). Results show with source attribution and relevance scores.

### What you should expect

- **What works.** Document ingestion, hybrid search with citations, exemption flagging (with required human review), request lifecycle from intake to closure, fee tracking, response letter drafting.
- **What's a developer preview.** SMTP delivery into status transitions is pending; full third-party accessibility audit is pending; production deployments are unverified.
- **What's not in scope.** SharePoint and IMAP connectors are roadmap; MIT-style "drop a CSV in this folder" is the most reliable connector path today.

### Where to go next

- For real evaluation: stand up a non-production tenant, ingest a representative document corpus, and run a week of internal staff requests through it.
- For procurement: wait for the recovery gates to pass.
- For development: read [CONTRIBUTING.md](CONTRIBUTING.md) and the records-ai `docs/`.

---

## Part 2 — For developers and IT staff

### What lives in the umbrella repo?

The `civicsuite` repo is **documentation-, governance-, and coordination-first**. It contains:

- the [Charter](CHARTER.md), [Continuity plan](SUCCESSION.md), [Compatibility matrix](docs/compatibility/index.md), [Roadmap](docs/roadmap/index.md)
- the [Shared extraction consumer rollout playbook](docs/roadmap/shared-extraction-consumer-rollout.md)
- the unified suite specification and module catalog under `docs/` and `specs/`
- suite-level governance and ADRs
- the **suite installer** under `installer/` (a working Clerk-Core public-use starter release path)
- verification scripts under `scripts/`

The umbrella does **not** contain runtime code for individual products — that lives in the per-module repos.

### Module repos

| Repo | Status (see STATUS.md for full detail) |
|---|---|
| `civicrecords-ai` | Most mature; v1.6.1 developer preview with ingestion worker recovery shipped |
| `civiccore` | Shared platform; v1.1.0 current |
| `civicclerk` | v1.0.1 protected-default recovery patch |
| `civiccode` | v1.0.0 public-use module release |
| `civicaccess` | v1.0.0 public-use module release |
| `civiczone` | v1.0.0 public-use module release |
| `civicplan` | v1.0.0 public-use module release |
| `civicpermit` | v0.2.0 demoted recovery label |
| `civicinspect`, `civicgrants`, `civicprocure` | v0.2.0 demoted recovery labels |
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

### Suite topology (text summary)

```
                +----------------------------+
                |   civicsuite (umbrella)    |
                |  docs, governance, ADRs,   |
                |  compatibility, installer  |
                +-------------+--------------+
                              |
              describes & coordinates
                              v
                +----------------------------+
                |   civiccore (shared)       |
                |   v1.1.0 current           |
                +-------------+--------------+
                              ^
                  depends on (pinned)
              +---------------+---------------+
              |               |               |
        +-----+-----+   +-----+-----+   +-----+-----+
        | civic-    |   | civic-    |   | foundation |
        | records-ai|   | clerk     |   | tier       |
        | (preview) |   | (v1 prov) |   | (16 repos) |
        +-----------+   +-----------+   +-----------+
```

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
| Module will not install | The module repo's `README.md` and `CONTRIBUTING.md`; if you hit a Docker/WSL prereq, the module installer should diagnose it. |
| `civiccore` version mismatch | [docs/compatibility/index.md](docs/compatibility/index.md) is the canonical pairing source. |
| README says "shipping," recovery doc says "frozen" | The recovery doc wins. See [docs/release-recovery-status.md](docs/release-recovery-status.md). |
| Unsure where to file a bug | [CONTRIBUTING.md](CONTRIBUTING.md) — bug-routing decision tree. |
| Security issue | [SECURITY.md](SECURITY.md) — open a private GitHub Security Advisory. |
| General support question | [SUPPORT.md](SUPPORT.md). |
| First-time evaluator | [FAQ.md](FAQ.md), then [STATUS.md](STATUS.md), then this manual. |
