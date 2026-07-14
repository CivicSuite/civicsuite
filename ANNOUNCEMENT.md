# CivicSuite Windows Local 1.0.4 - public beta - first-run wizard UX Waves 1-3

**TL;DR:** CivicSuite Windows Local v1.0.4 is the current GitHub Latest release. It supersedes v1.0.3, keeps the same six-module city-core suite, and focuses on the first-run wizard UX Waves 1-3 so a new operator gets clearer setup, readiness, and recovery guidance before using the local app. No cloud, no signup, no telemetry.

Get it: <https://github.com/CivicSuite/civicsuite/releases/latest>

---

## Current release facts

- **GitHub Latest tag:** `civicsuite-windows-local-v1.0.4`
- **Published:** `2026-07-13T21:53:01Z`
- **Current main/tag commit:** `e596da3`
- **Installer asset:** `CivicSuite_1.0.4_x64_en-US.msi`
- **SHA-256:** `4d86e7b217a145c72626c7dd38a87f73d41763f7b0458a4188e32a6ebf18ed42`
- **Supersedes:** v1.0.3
- **Release headline:** first-run wizard UX Waves 1-3
- **Suite scope:** the same six-module Windows Local city-core suite

## What changed since v1.0.3

v1.0.4 is a focused Windows Local beta release for the first-run experience. The release headline is the first-run wizard UX Waves 1-3: clearer setup flow, readiness signals, and operator-facing recovery guidance around the local database, local AI model setup, and first admin path.

The suite scope did not expand in this release. The Windows Local MSI still installs the same six-module city-core suite:

- CivicCore v1.2.0
- CivicRecords AI v1.7.3
- CivicClerk v1.0.4
- CivicCode v1.0.8
- CivicNotice v0.2.0
- CivicAccess v0.4.0

The installer remains the local Windows path for trying the city-core suite on one machine: bundled data store, local AI runtime path, clerk workflows, records support, code guidance, notices, and accessibility support.

## Validation status

The verified current release facts above identify the public GitHub Latest release, tag, publication timestamp, commit, installer asset, and SHA-256 hash.

Do not treat inherited v1.0.2 validation records as fresh v1.0.4 proof. v1.0.2 preserved the historical clean-machine and accessibility gate evidence for the city-core integration runway, including the clean-machine acceptance work that supported that release. No execution receipt was found for a fresh v1.0.4 clean-machine pass or a fresh v1.0.4 accessibility pass, so this announcement does not claim either.

## What this is

CivicSuite is open-source municipal software designed to run **locally on a city's own hardware**. The Windows Local city-core build is one MSI installer that sets up, with no terminal and no developer tooling:

- a bundled portable **PostgreSQL 17 + pgvector** data store,
- a bundled portable **Ollama** runtime with a pinned local model downloaded and checksum-verified during setup,
- and **six city-core modules**: CivicCore (shared platform), CivicRecords AI (public records / FOIA), CivicClerk (meetings / agendas / minutes), CivicCode (municipal code), CivicNotice (public notices), and CivicAccess (accessibility + records-ready export).

Everything - your data, your documents, your audit trail, and the AI model - stays on the machine. There is no vendor cloud, no per-seat licensing, and no telemetry by design. Code is Apache-2.0; docs are CC BY 4.0.

## Why "public beta"

Public beta describes the stage. CivicSuite Windows Local is available for public testing and operator feedback, but it is not production-ready, city-ready, or procurement-ready.

The MSI is Authenticode code-signed via Azure Trusted Signing. A new certificate may not have broad Windows SmartScreen reputation yet, so Windows can still prompt on first run. If prompted, use the Windows details flow only after confirming the verified publisher and that the installer came from the official GitHub release page.

## Install

1. Download `CivicSuite_1.0.4_x64_en-US.msi` from the [latest release](https://github.com/CivicSuite/civicsuite/releases/latest).
2. Verify the SHA-256 checksum in PowerShell:
   ```
   Get-FileHash CivicSuite_1.0.4_x64_en-US.msi -Algorithm SHA256
   ```
3. Confirm the hash is `4d86e7b217a145c72626c7dd38a87f73d41763f7b0458a4188e32a6ebf18ed42`. Matching hash means the file you have is byte-for-byte the verified release asset. If it does not match, delete it and re-download from the official release page only.
4. Follow the installer, open CivicSuite, and complete first-run setup.

**Recommended machine:** 64-bit Windows 10/11 with WebView2, **32 GB RAM** recommended, **16 GB RAM** workable minimum, and enough free disk for the app, local database, and local model. No Docker, no WSL, no terminal.

## Upgrade from v1.0.3

v1.0.4 supersedes v1.0.3. In-place upgrade is the intended beta-line path unless release notes or support guidance say otherwise. Keep normal local backups before upgrading any beta software.

## What it is not yet

Being honest about the edges matters more than the launch:

- Not production-ready, not city-ready, not procurement-ready. It is a beta.
- Not a compliance tool. AI drafts are labeled drafts; humans decide; accessibility support is not a certified audit, legal determination, or certified translation.
- Not the full suite. City-core is six modules; **CivicZone / CivicPlan / CivicPermit / CivicInspect** remain queued Tier 2.
- macOS lifecycle is not certified; Windows Local is the supported operator path.
- A release asset hash proves the downloaded MSI matches the verified asset; it does not prove an unreceipted validation run happened.

## Help and feedback

- Install help and recovery: [SUPPORT.md](SUPPORT.md) and the operator walkthrough in [docs/installer/operator-walkthrough.md](docs/installer/operator-walkthrough.md).
- Questions: [FAQ.md](FAQ.md).
- Security issues: open a private advisory - see [SECURITY.md](SECURITY.md).
- Found a bug? Open an issue. This is exactly what a public beta is for.

CivicSuite is unfunded, volunteer-maintained open source. If it is useful to your city, the best thanks is to try it and tell us what broke.
