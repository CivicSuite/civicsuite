# Handoff - Clerk-Core Beta.3 Release Gate Package

Date: 2026-05-19

## Branch

- Branch: `release/clerk-core-beta3-gate-package`
- Base: `origin/main` at `1ac8c6c`
- PR: `CivicSuite/civicsuite#156`
- Current branch HEAD before post-push propagation: `6f5051321476630f624de6457aa7b062ad992c36`
- Target PR label: `release-tag`

## Scope

Prepare the release-gate truth package for
`installer-clerk-core-v0.1.0-beta.3` as an unsigned OSS beta for outside
testing. This does not publish the GitHub release by itself.

Active product scope remains CivicCore, CivicRecords AI 1.6.1, CivicClerk
1.0.1, and the suite installer. Queued modules remain read-only.

## Evidence Baseline

- Latest merged main verify: `26116871355`
- Latest merged main installer-cleanroom: `26116871385`
- PR verify: `26120468617`
- PR installer-cleanroom: `26120468667`
- PR release-lockstep-gate: `26120471546`
- Required suite truth line: `[civicrecords-ai] PASS 1.6.1`
- Required workflow line: `[clerk-core-workflow-proof] PASS`
- Linux lifecycle proof includes workflow proof, backup, restore, and uninstall.
- Backup/restore log markers include `postgres_backup_dump` and
  `restore_probe_pg_restore`.

## Artifact Decision

Current public release remains `installer-clerk-core-v0.1.0-beta.2`.

Next candidate release tag:

- `installer-clerk-core-v0.1.0-beta.3`

Draft archive checksums after the beta.3 gate package:

- Windows: `9eedc2d9f6f4bc11e53905a2696d503ac67036ad6e52221a771860d0a61cfe8a`
- macOS: `d476bcb0424187f6ea63ecc05e1af39221562be61da6d1b124ec4d01064441fd`
- Linux: `cb2835e62243d947d235da6ab1cd3153135c8adcd0c2567fafaa47fc91540f6f`

## Required Local Gates

Run before push:

```powershell
python scripts\verify-suite-state.py --remote-only
bash scripts/verify-docs.sh
python scripts\verify-installer-plan.py
python scripts\verify-release-lockstep.py
git diff --check
```

## Required PR Gates

- Add `release-tag` label.
- Verify release-lockstep gate passes, not skips.
- Verify PR `verify` passes.
- Verify PR `installer-cleanroom` passes.
- After merge, verify main `verify` and main `installer-cleanroom` pass.

## Forbidden Claims

Do not claim:

- public-use readiness
- city-ready status
- procurement readiness
- production readiness
- live CivicRecords AI/CivicClerk cross-module records exchange
- macOS lifecycle certification
- full-suite release

## Next Step

Open the PR, apply the `release-tag` label, wait for CI, merge only if the
release-lockstep gate is green, then verify main and publish beta.3 only from
the green merged main SHA.
