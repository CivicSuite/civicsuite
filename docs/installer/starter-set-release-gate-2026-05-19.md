# Starter-Set Release Gate - 2026-05-19

Status: beta.3 published unsigned OSS beta, not a public-use release.

## Decision

The current public GitHub release is
`installer-clerk-core-v0.1.0-beta.3` after the release-tag PR passed.
The supported artifact decision is:

- Tag: `installer-clerk-core-v0.1.0-beta.3`
- Distribution status: unsigned OSS beta
- Supported publish scope: clerk-core starter archives for outside testing
- Starter profile: CivicCore, CivicRecords AI 1.6.1, and CivicClerk 1.0.1
- Runtime truth: Linux/container-first Docker/browser path
- Windows truth: wrapper/readiness path plus prior matching-host Docker Desktop
  lifecycle evidence on Windows 11 with WSL 2
- macOS truth: archive/readiness only until a Darwin/macOS Docker Desktop host
  runs matching-host lifecycle evidence

Beta.3 superseded beta.2 after PR #156 with the `release-tag` label passed
release-lockstep, main verify, and main installer-cleanroom.

## Evidence Baseline

Published release baseline:

- Main SHA: `a3ca9d75dc51f7e0928671b30c1693eca3a3fcae`
- Verify run: `26121483231`
- Installer-cleanroom run: `26121483212`
- Release-lockstep PR run: `26120937776`
- Suite truth: `[civicrecords-ai] PASS 1.6.1`
- Workflow proof: `[clerk-core-workflow-proof] PASS`
- Installer plan: `VERIFY-INSTALLER-PLAN: PASSED`
- Suite verifier: `VERIFY-SUITE-STATE: PASSED`
- Linux lifecycle: matching-host install, repair, verify, backup, restore,
  workflow proof, and uninstall
- Backup evidence: `postgres_backup_dump`
- Restore evidence: `restore_probe_pg_restore`

Published beta.3 archive checksums:

- `CivicSuite-clerk-core-windows-0.1.0.zip`: `69bbf0d2a1378f537bb452337e41dd151e60913fb318d80476d338ac282f16e8`
- `CivicSuite-clerk-core-macos-0.1.0.tar.gz`: `95c1ad5c5f05c59d4356bdf668376af65978f80ee9cefabcb646bb732db39724`
- `CivicSuite-clerk-core-linux-0.1.0.tar.gz`: `c685802e9903a76337f29baf1a7298fe2a8dbd1771b01f9813a847b157efcb4e`

## Release-Tag Lockstep Path

The beta.3 PR included the `release-tag` label and updated or preserved
these lockstep truth artifacts together:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `CHANGELOG.md`
- `docs/release-lockstep/downstream-pins.md`

Required commands before push:

```powershell
python scripts\verify-suite-state.py --remote-only
bash scripts/verify-docs.sh
python scripts\verify-installer-plan.py
python scripts\verify-release-lockstep.py
git diff --check
```

Required CI after merge:

- main `verify` passes
- main `installer-cleanroom` passes
- logs show `[civicrecords-ai] PASS 1.6.1`
- logs show `[clerk-core-workflow-proof] PASS`
- logs show Linux matching-host workflow proof, backup, and restore evidence

## Forbidden Claims

Do not describe beta.3 as:

- public-use ready
- city-ready
- procurement-ready
- production-ready
- a live cross-module CivicRecords/CivicClerk records exchange
- macOS lifecycle certified
- a full-suite release

## Out Of Scope

External municipal validation, procurement certification, air-gap tests, native
app rewrites, and remaining module productization are outside this release gate.
