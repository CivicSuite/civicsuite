# CivicSuite FAQ

**Last verified:** 2026-05-27

This FAQ is for civic operators (city CIO, clerk, IT lead, attorney, procurement officer) evaluating whether CivicSuite is right for them. For engineering-level questions, see [CONTRIBUTING.md](CONTRIBUTING.md). For module-by-module status, see [STATUS.md](STATUS.md).

---

## Can my city rely on CivicSuite for live operations today?

**No.** The honest current package is the city-core beta-ready, truth-reconciled installer profile: CivicCore v1.2.0, CivicRecords AI v1.7.3, CivicClerk v1.0.3, CivicCode v1.0.8, and the suite installer. That profile has Linux and Windows matching-host lifecycle evidence, first-run browser QA, green PR CI, and audit-full evidence with zero unresolved Blocker or Critical findings in the active run record.

That is still a bounded beta package. It is **not public-use ready, not city-ready, not procurement-ready, not production-ready, not macOS lifecycle certified, and not a full-suite release**. CivicAccess is out of city-core after the 2026-05-23 NEEDS-WORK depth probe and must go through gap closure plus re-probe before inclusion. CivicZone, CivicPlan, CivicPermit, and CivicInspect remain queued Tier 2 modules on demotion-truth labels.

Any vendor or integrator claiming a completed CivicSuite municipal deployment, a current CivicAccess city-core path, or a full-suite operational release is making a claim the project docs do not support.

## What is the difference between a "release tag" and a reliable operator package?

A release tag means a repository has a version label on a commit. A reliable operator package means the exact package has evidence: lifecycle install and repair, clean verification, browser-tested user flows, security and version checks, documented limitations, and CI/audit evidence.

CivicSuite has many tags. Only the scoped package evidence in [STATUS.md](STATUS.md), [docs/release-recovery-status.md](docs/release-recovery-status.md), and the active run record should be treated as current truth.

## Can I install only one module, say just CivicClerk, without the rest?

In principle, yes. The dependency rule is: every module depends on `civiccore`; modules do not depend on each other except where noted (for example, `civiccode` depends on `civicclerk` for adopted-ordinance handoff intake). A single-module install is a supported design goal.

In practice, use the installer profile that has evidence for your evaluation. Clerk-Core has a bounded starter installer lineage for CivicCore, CivicRecords AI, and CivicClerk. City-core is the active beta-ready profile that adds CivicCode. CivicAccess is not part of city-core today, and the Tier 2 land-use modules are not part of city-core today.

## What does a civic operator need to run the city-core beta?

For the modules that have install paths today:

- A machine with **8+ CPU cores, 32 GB RAM, and 60 GB free disk space** for the full city-core lifecycle checks.
- **Docker Engine** on Linux, or Docker Desktop on Windows/macOS for wrapper-based installs. Linux is the primary runtime proof path. Windows requires WSL 2 and Virtual Machine Platform. macOS remains beta/archive/readiness only until matching-host lifecycle evidence is recorded on a Darwin/macOS Docker Desktop host.
- A staff person comfortable running the one-click wrapper or reading the generated bash/PowerShell output.
- Access to city documents for representative, non-production evaluation.

Linux Guided Setup uses Docker's signed package repositories where supported. If the host is unsupported, use Manual Prerequisite mode after IT installs Docker from Docker's official instructions.

You do not need cloud accounts, SaaS subscriptions, vendor relationships, or per-seat licensing.

## What is the suite launcher?

The suite launcher is a local browser front door packaged with the city-core installer runtime. It gives staff, resident, and IT-admin views over the installed local services and can be overridden by runtime configuration through `window.CIVICSUITE_LAUNCHER_CONFIG`.

The current launcher session is a local browser/runtime session. It is useful for operator orientation and QA state checks, but it is **not** a claim that CivicSuite has completed municipal SSO, shared identity federation, or a cross-city managed service.

## How do I know an installer package is the one I should test?

Use the live trust path, not stale committed artifacts:

1. Check the active run evidence path named in [README.md](README.md) and [STATUS.md](STATUS.md).
2. Verify the generated `SHA256SUMS` or release-manifest hash for the artifact you are about to run.
3. Confirm the package came from the official CivicSuite repo or the recorded local run evidence.
4. Confirm source pins in `installer/modules.json` match the vendored source commits for CivicCore, CivicRecords AI, CivicClerk, and CivicCode.
5. For CivicCode release-car assets, verify the published SHA256 and attestation assets recorded in the module release evidence.

Do not restore old `installer/dist` artifacts unless Scott explicitly decides that the prior committed artifacts should be revived. The default for this run is live regenerated artifacts with evidence paths.

## Why are some modules called "CivicCourt Assist" and others bare "CivicCourt"?

Both names refer to the same module. The "Assist" / "Bridge" / "Research" suffix is the canonical product name when the module needs to be clearly described as a copilot or bridge, not a system-of-record replacement. The bare name is the casual reference used in tier rollout lists. The `CONSISTENCY.md` section 3 documents this convention.

CivicSuite is deliberately not a system-of-record replacement for ERP, utility billing, permitting, CAD/RMS, or court case management. The "Assist" naming is the suite's way of being explicit about that scope boundary.

## Is air-gapped deployment supported today?

Architecturally yes; verified under the full standard no. Every module is designed to operate without outbound network calls in the default local deployment profile. The CivicCore sovereignty principles and the module-level "Air-gap behavior" test areas are explicit about this. Treat air-gap as a design target under verification, not as a completed operator claim.

## Can I migrate from Granicus / Legistar / PrimeGov / NovusAGENDA?

CivicClerk's spec lists imports from these platforms as priority integrations, and `civicclerk` ships local-payload importers for them today. **Local-payload** means: you provide an export file from your incumbent system, and the CivicClerk import path normalizes it through CivicCore's connector contract. This is **not** a live API connection to those vendors. There is no "click here to migrate from Legistar" flow yet. A real migration today is a hands-on exercise with a clerk, an integrator, and exported data files.

## Does CivicSuite document any municipal live deployments?

No. There are mock-city test fixtures, demo seed data ("City of Brookfield"), and Docker Compose product rehearsals, but no documented live municipal deployment in the project docs as of 2026-05-27.

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

- [CHANGELOG.md](CHANGELOG.md) for umbrella-level changes.
- [STATUS.md](STATUS.md) for the plain-English current state.
- [docs/release-recovery-status.md](docs/release-recovery-status.md) for the gate-passing scoreboard.
- [docs/release-lockstep/downstream-pins.md](docs/release-lockstep/downstream-pins.md) for pinned module/version/source evidence.
- Each module repo's CHANGELOG for that module's actual code changes.

## I'm an engineer. Where do I start?

1. Read [CHARTER.md](CHARTER.md) for the engineering principles.
2. Read [STATUS.md](STATUS.md) to know which modules are real today.
3. Pick the relevant module or installer profile and follow its current README.
4. Run that module's verification gates.
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree.

## I'm a procurement officer. What should I tell my city?

That CivicSuite is a credible open-source civic-tech project under active development, and that it is **not yet ready for production procurement**. A pilot evaluation is reasonable; a procurement decision based on the current state is not.

Re-evaluate after the recovery gates pass. The recovery-status doc and STATUS.md will tell you when that has happened, repo by repo.
