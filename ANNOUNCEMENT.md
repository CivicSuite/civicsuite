# CivicSuite Windows Local 1.0.1 — GA candidate, now open for public beta

**TL;DR:** CivicSuite city-core for Windows is now a **GA candidate**, and we're opening it as a **public beta** today. It's a single desktop installer that runs an entire local civic-records stack — database, AI model, and five modules — on one Windows machine. A sixth module, **CivicAccess**, is bundled in the next build (its code, database schema, and write-token secret install with the MSI); **its on-screen Accessibility workflow tab lands in v1.0.2**. No cloud, no signup, no telemetry. Download it, run it, try it.

Get it: <https://github.com/CivicSuite/civicsuite/releases/latest>

---

## What this is

CivicSuite is open-source municipal software designed to run **locally on a city's own hardware**. The Windows Local "city-core" build is one MSI installer (~1.6 GB) that sets up, with no terminal and no developer tooling:

- a bundled portable **PostgreSQL 17 + pgvector** data store,
- a bundled portable **Ollama** runtime with a pinned **Gemma 4 12B QAT** model (~6.97 GB, downloaded and checksum-verified on first run),
- and **five city-core modules**: CivicCore (shared platform), CivicRecords AI (public records / FOIA), CivicClerk (meetings / agendas / minutes), CivicCode (municipal code), and CivicNotice (public notices). **CivicAccess** (accessibility + records-ready export, v0.4.0) is the sixth city-core module; the next MSI build bundles its module code, database schema, and write-token secret. **Its on-screen Accessibility workflow tab in the desktop UI lands in v1.0.2** (background: [docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md](docs/audits/civicaccess-citycore-deep-read-2026-06-29/FINAL-REPORT.md)).

Everything — your data, your documents, your audit trail, the AI model — stays on the machine. There is no vendor cloud, no per-seat licensing, and no telemetry by design. Code is Apache-2.0; docs are CC BY 4.0.

## Why "GA candidate" *and* "public beta"

Both are true and they mean different things:

- **GA candidate** describes maturity. This build is feature-complete for city-core and was validated **end-to-end on a clean machine**: install → first-run wizard → 6.97 GB model download + checksum + load → a real local AI completion → a clerk public-records request submitted and looked up through Postgres → backup + restore → uninstall. Two adversarial readiness audits closed with **zero open Blocker or Critical findings** (the remaining items are documented, non-blocking follow-ups — see [PROVENANCE.md](PROVENANCE.md)).
- **Public beta** describes the stage. The one remaining gate between this and General Availability is an **Authenticode code-signing certificate**, which is in progress (free OSS signing via the SignPath Foundation) and takes a few weeks to issue. Rather than make everyone wait on a certificate, we're opening the validated build now.

So: it's ready to download and use for **real, hands-on evaluation and early adoption** — but it is still a **beta**, not yet your city's production system of record. If you're a procurement officer, a pilot is reasonable; a procurement decision on the current state is not.

## Install (60-second version)

1. Download `CivicSuite_1.0.1_x64_en-US.msi` from the [latest release](https://github.com/CivicSuite/civicsuite/releases/latest).
2. Because the beta MSI is **not yet code-signed**, Windows SmartScreen will say "Unknown Publisher." Choose **More info → Run anyway** (only if the file came from the official release above).
3. Follow the installer, open CivicSuite, and complete first-run setup (city profile, first admin, backup folder).
4. On first run the app downloads and verifies the ~6.97 GB model. After that it's fully local.

**Recommended machine:** 64-bit Windows 10/11 with WebView2, **16 GB RAM** (the model needs ~6.7 GB resident), **~15 GB free disk**. No Docker, no WSL, no terminal.

Verify your download: SHA-256 `5a1e5e2e4d2f3d7f77c52f108c4445c85db10ff3edc2c151d6bbae1cd97ce3ea` (1,645,479,777 bytes).

## What it is *not* (yet)

Being honest about the edges matters more than the launch:

- Not production-ready, not city-ready, not procurement-ready. It's a beta.
- Not code-signed yet (certificate in progress — see above and `CODE_SIGNING_POLICY.md`).
- Not the full suite. City-core is six modules — the five in this v1.0.1 build plus **CivicAccess** v0.4.0 (module code/schema/token bundled in the next build; the on-screen Accessibility workflow tab in the desktop UI lands in v1.0.2). **CivicZone / CivicPlan / CivicPermit / CivicInspect** are queued Tier 2.
- macOS lifecycle is not certified; Windows Local is the supported operator path.
- The MSI bundles module source pinned by commit; for two modules the bundled commit is *ahead* of the latest published release tag. The trust path is the `source_commit` pin plus the MSI checksum — see [PROVENANCE.md](PROVENANCE.md).

## Help and feedback

- Install help and recovery: [SUPPORT.md](SUPPORT.md) and the operator walkthrough in [docs/installer/operator-walkthrough.md](docs/installer/operator-walkthrough.md).
- Questions: [FAQ.md](FAQ.md).
- Security issues: open a private advisory — see [SECURITY.md](SECURITY.md).
- Found a bug? Open an issue. This is exactly what a public beta is for.

CivicSuite is unfunded, volunteer-maintained open source. If it's useful to your city, the best thanks is to try it and tell us what broke.
