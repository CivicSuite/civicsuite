# Clerk-Core Final Package Evidence - 2026-05-21

Status: package evidence recorded for the still-RED Clerk-Core public-use gate.

Scope: regenerated unsigned OSS beta archives for the Clerk-Core starter profile
after CivicClerk main `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d` merged the
staff-session-gated protected API loading fix. This evidence covers CivicCore,
CivicRecords AI, CivicClerk, and the CivicSuite installer package path only.

This document does not claim city-ready status, public-use promotion,
production readiness, procurement readiness, airgap readiness, full-suite
readiness, live cross-module records exchange, native installer signing, or
macOS lifecycle certification.

## Generated Artifacts

Command:

```powershell
python scripts\plan-installer.py --profile clerk-core --generate-release-artifacts --installer-version 0.1.0
```

Release manifest: `installer/dist/CivicSuite-clerk-core-0.1.0-release-manifest.json`

Archive hygiene: passed. The manifest rejects `.agent-runs`, runtime proof
folders, virtualenvs, caches, node modules, Playwright reports, test results,
and installer reports from release archives.

SHA256 checksums:

```text
a5c1ac38922d37983513126a322d6992834acc70cd41917761b87af1ab336c63  CivicSuite-clerk-core-windows-0.1.0.zip
a006e6c9d992de41934c4c1efe59e32b2a8fb711dbd8bae58afae9e35c558e2e  CivicSuite-clerk-core-macos-0.1.0.tar.gz
f2b890cbce15168f0be1c3ec81c91fc9c448e7377685ccfee47b649c377d5780  CivicSuite-clerk-core-linux-0.1.0.tar.gz
```

Signing status: unsigned OSS beta. Operators must verify SHA256 checksums and
the official CivicSuite release source before running package commands.

Native installer status: wrapper manifests generated; signed native installers
were not built.

## Windows Matching-Host Lifecycle

Run id: `local-windows-package-lifecycle-public-use-final-45eaccf`

Command:

```powershell
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-windows-0.1.0.zip --platform windows --run-id local-windows-package-lifecycle-public-use-final-45eaccf --staff-mode bearer --workflow-proof
```

Result: passed.

Evidence classification: `matching_host_lifecycle`.

Certification scope: matching-host install, repair, verify, backup, restore,
and uninstall lifecycle evidence.

Host/target match: `win32` host normalized to `windows`; package target
`windows`; `host_platform_matches_target=true`.

Lifecycle modes:

| Mode | Status |
|---|---|
| install | passed |
| repair | passed |
| verify | passed |
| backup | passed |
| restore | passed |
| uninstall | passed |

Workflow proof: requested and passed during the installed lifecycle. The proof
covered CivicRecords AI request/search/review/response and CivicClerk
agenda/packet/minutes/vote/notice/archive paths.

Backup proof: both CivicRecords AI and CivicClerk emitted
`postgres_backup_dump` steps.

Restore proof: both CivicRecords AI and CivicClerk emitted
`restore_probe_pg_restore` steps.

## macOS Beta-Level Package Check

Run id: `local-macos-package-skipinstall-public-use-final-45eaccf`

Command:

```powershell
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-macos-0.1.0.tar.gz --platform macos --run-id local-macos-package-skipinstall-public-use-final-45eaccf --skip-install
```

Result: passed.

Evidence classification: `archive_readiness_only`.

Certification scope: archive extraction, readiness, and dry-run plan only; not
lifecycle certification.

Host/target match: false. This was run from a Windows/WSL environment and must
not be cited as macOS lifecycle certification.

## Linux Local Package Sanity

Run id: `local-linux-package-skipinstall-public-use-final-45eaccf`

Command:

```powershell
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-linux-0.1.0.tar.gz --platform linux --run-id local-linux-package-skipinstall-public-use-final-45eaccf --skip-install
```

Result: passed.

Evidence classification: `archive_readiness_only`.

Certification scope: archive extraction, readiness, and dry-run plan only; not
lifecycle certification from this Windows host. Linux matching-host lifecycle
must come from the Linux installer-cleanroom CI/self-hosted runner path for the
final promotion SHA.

## Remaining Gate Requirements

## Starter Repo Release Verifiers

### CivicClerk

Source PR: CivicSuite/civicclerk#161.

Merged source SHA: `45eaccfcc69dd1ae7e2e45d7badd5d188b49397d`.

Local command:

```powershell
bash scripts/verify-release.sh
```

Result: passed before merge on the source-fix branch. CivicClerk main CI then
passed after the squash merge.

Proof summary:

- 591 Python tests passed.
- Docs, recovery gates, secret scan, placeholder import check, browser QA, and
  prompt evals passed.
- Frontend audit found 0 vulnerabilities.
- Frontend production build passed.
- 33 Vitest tests passed.
- 4 Playwright desktop/mobile user-flow tests passed.
- Package build, SHA256 generation, runtime install proof, and release contract
  passed.

### CivicRecords AI

Checked branch: `master` at `5fa6b9843e32b6bbe6cc885ffdd4339310f139f2`.

Local command:

```powershell
bash scripts/verify-release.sh
```

Result: passed after cleaning a stale local Compose stack that had occupied
port 8000 during an earlier attempt.

Proof summary:

- Recovery gates passed.
- Tracked-file secret scan passed across 517 tracked files.
- Compose runtime provisioned and hid `JWT_SECRET` and `FIRST_ADMIN_PASSWORD`
  from the API container environment.
- Data sovereignty check passed with warnings already reported by the checker.
- Version lockstep passed for backend, frontend, changelog, and unified spec at
  `1.6.1`.
- Required docs were present.
- Ruff passed through the API container.
- 643 backend tests collected and passed.
- Frontend `npm ci` and `npm audit --audit-level=moderate` passed.
- 36 Vitest tests passed.
- Frontend production build passed.
- 4 Playwright desktop/mobile user-flow tests passed.
- Runtime install proof passed and `/health` returned version `1.6.1`.

## Remaining Gate Requirements

Before the public-use gate can move to GREEN, the final suite PR must still
prove:

- main suite verify passes for the final SHA;
- main installer-cleanroom proves Linux matching-host workflow, backup, and
  restore for the final SHA;
- Windows matching-host lifecycle proof remains cited against the regenerated
  package or is rerun if package artifacts change again;
- release-lockstep passes if a release tag or GitHub release is moved;
- public-facing docs contain no city-ready, public-use, production,
  procurement, full-suite, live cross-module exchange, or macOS lifecycle
  certification overclaim;
- independent release-gate audit returns no unresolved Blocker or Critical
  findings.
