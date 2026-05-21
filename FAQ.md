# CivicSuite FAQ

**Last verified:** 2026-05-21

This FAQ is for civic operators (city CIO, clerk, IT lead, attorney, procurement officer) evaluating whether CivicSuite is right for them. For engineering-level questions, see [CONTRIBUTING.md](CONTRIBUTING.md). For module-by-module status, see [STATUS.md](STATUS.md).

---

## Is CivicSuite ready for production use in my city today?

**No.** As of 2026-05-21, CivicSuite is still under release recovery outside the bounded Clerk-Core starter and the CivicCode module line. Public release tags exist, but only modules that pass the recovery gates may be treated as current public-use module releases. CivicCode v1.0.0 has passed its module release gate; CivicRecords AI and CivicClerk are included in the Clerk-Core public-use starter profile. The full suite is still not procurement-ready. Any vendor or integrator claiming "we've deployed the full CivicSuite in production" is making a claim the project itself does not currently support.

The current public-use path is bounded: the Clerk-Core starter profile (`civiccore`, `civicrecords-ai`, `civicclerk`) and the CivicCode v1.0.0 module release. CivicRecords AI v1.6.1 includes the ingestion worker event-loop recovery patch on top of the v1.6.0 B2 Docker secret-file recovery.

## What is the difference between a "release tag" and a "procurement-ready release"?

A release tag means "we put a version label on this commit." A procurement-ready release means "we verified this version against our recovery gates: full audit packet, real user-flow Playwright tests, runtime install proof on a clean environment, security scans, version consistency, mock-vs-production labeling, documented release notes, and CI evidence." CivicSuite has tags. It does not yet have procurement-ready releases. The recovery-status doc tracks the gap.

## Can I install only one module — say, just civicclerk — without the rest?

In principle, yes. The dependency rule is: every module depends on `civiccore`; modules do not depend on each other except where noted (e.g., `civiccode` depends on `civicclerk` for adopted-ordinance handoff intake; `civiczone` reads `civiccode` for code text). A single-module install is a supported design goal.

In practice, today: the Clerk-Core starter profile (`civiccore`, `civicrecords-ai`, and `civicclerk`) has a public-use installer release at `installer-clerk-core-v0.1.0`. Linux and Windows have matching-host lifecycle evidence for that profile. macOS is supported at beta archive/readiness level until matching-host lifecycle evidence is recorded on a Darwin/macOS Docker Desktop host.

## What does "civic operator" actually need to run CivicSuite?

For the modules that have install paths today:
- A machine with **8+ CPU cores, 32 GB RAM, 50 GB free disk space** (per `civicrecords-ai` requirements; civicclerk roughly similar).
- **Docker Engine** on Linux, or Docker Desktop on Windows/macOS for wrapper-based installs. Linux is the primary development and runtime proof path. WSL 2 + Virtual Machine Platform are required on Windows; Windows and macOS remain archive/readiness wrapper paths until matching-host lifecycle evidence is recorded on those hosts.
- **No internet connection required** after initial install. CivicSuite is local-first by design.
- A staff person comfortable running install scripts and reading PowerShell or bash output.
- Access to your city's documents (file shares, SharePoint, etc.) via the connectors that exist today.

You do not need: cloud accounts, SaaS subscriptions, vendor relationships, or per-seat licensing.

## Why are some modules called "CivicCourt Assist" and others bare "CivicCourt"?

Both names refer to the same module. The "Assist" / "Bridge" / "Research" suffix is the canonical product name when the module needs to be clearly described as a copilot or bridge — not a system-of-record replacement. The bare name is the casual reference used in tier rollout lists. The `CONSISTENCY.md` §3 documents this convention.

CivicSuite is deliberately **not** a system-of-record replacement for ERP, utility billing, permitting, CAD/RMS, or court case management. The "Assist" naming is the suite's way of being explicit about that scope boundary.

## Is air-gapped deployment supported today?

Architecturally yes; verified in production no. Every module is designed to operate without outbound network calls in the default local deployment profile. The CivicCore sovereignty principles and the module-level "Air-gap behavior" test areas are explicit about this. **However**, no module has passed the recovery gate that would certify air-gap behavior under the documented standard. Treat air-gap as a *design promise* under verification.

## Can I migrate from Granicus / Legistar / PrimeGov / NovusAGENDA?

CivicClerk's spec lists imports from these platforms as priority integrations, and `civicclerk` ships local-payload importers for them today. **Local-payload** means: you provide an export file from your incumbent system, and the CivicClerk import path normalizes it through CivicCore's connector contract. This is **not** a live API connection to those vendors. There is no "click here to migrate from Legistar" flow yet. A real migration today is a hands-on exercise with a clerk, an integrator, and exported data files.

## Does CivicSuite have any production deployments?

Not that the project documents. There are mock-city test fixtures, demo seed data ("City of Brookfield"), and Docker Compose product rehearsals, but no documented production municipal deployment. If a city has deployed CivicSuite in production, that deployment has not been recorded in the public docs as of 2026-05-14.

## What's the licensing model? Will I owe per-seat fees?

- **Code:** Apache License 2.0. Permissive. You can run, modify, and redistribute. No per-seat licensing.
- **Documentation:** CC BY 4.0. You can adapt and republish with attribution.
- **No telemetry, no per-seat metering, no vendor cloud dependency** by design.

CivicSuite is unfunded volunteer-maintained open source. There is no paid support contract today.

## What happens if the maintainer disappears?

[SUCCESSION.md](SUCCESSION.md) documents the continuity model. The CivicSuite GitHub org has two active owners (`scottconverse`, `APirateMonk`). Release credentials, recovery procedures, and minimum-knowledge packets are documented. The license guarantees that even if both maintainers vanished tomorrow, your city would still have the code, the right to use it, the right to modify it, and the right to fork it. The suite's local-first, sovereign-by-design posture explicitly avoids vendor lock-in.

## How do I report a security issue?

Open a private GitHub Security Advisory on the affected repo. See [SECURITY.md](SECURITY.md) for routing. For suite-wide architectural issues, advisories on the `civicsuite` umbrella are accepted.

## How do I follow progress?

- [CHANGELOG.md](CHANGELOG.md) for umbrella-level changes (note: the CHANGELOG between 2026-05-01 and 2026-05-06 contains "compatibility publication" entries that are doc-update entries against tags now frozen — do not read those as ship signals).
- [docs/release-recovery-status.md](docs/release-recovery-status.md) for the gate-passing scoreboard.
- [docs/roadmap/index.md](docs/roadmap/index.md) for the strategic plan.
- Each module repo's CHANGELOG for that module's actual code changes.

## I'm an engineer. Where do I start?

1. Read [CHARTER.md](CHARTER.md) — the engineering principles.
2. Read [STATUS.md](STATUS.md) — to know which modules are real.
3. Pick one module (most likely civicrecords-ai) and follow its README's install path.
4. Run that module's verification gates.
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree.

## I'm a procurement officer. What should I tell my city?

That CivicSuite is a credible open-source civic-tech project under active development that is **not yet ready for production procurement**. It demonstrates real engineering discipline (Apache 2.0, hash-chained audit logs, local-first architecture, no telemetry) and a strong direction. It also has, today, one developer-preview FOIA tool and twenty-one foundation-surface modules — not a complete suite. A pilot evaluation is reasonable; a procurement decision based on the current state is not.

Re-evaluate after the recovery gates pass. The recovery-status doc will tell you when that has happened, repo by repo.
