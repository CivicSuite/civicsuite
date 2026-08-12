# CivicCode v1.0.0 Installer Integration Evidence

Date: 2026-05-21

Scope: CivicCode public-use module release truth in the CivicSuite umbrella
installer/module-selection path. This evidence promotes CivicCode only. It does
not promote queued modules, the full suite, procurement readiness, production
hosting certification, airgap readiness, live cross-module records exchange, or
macOS lifecycle certification.

## Source Release Evidence

- Repo: `CivicSuite/civiccode`
- Release: `https://github.com/CivicSuite/civiccode/releases/tag/v1.0.0`
- Release name: `civiccode v1.0.0`
- Main source head after release-workflow fix: `cb5f23eb437863b602df2ba2825bb72fd26e1154`
- Main verify run: `26219229208`
- Release workflow run: `26219395141`
- Tag object: `d2bff271cd2268452f293a201accfc056fdaed5c`
- Peeled tag commit: `cb5f23eb437863b602df2ba2825bb72fd26e1154`

Published assets:

- `civiccode-1.0.0-py3-none-any.whl`
- `civiccode-1.0.0.tar.gz`
- `SHA256SUMS.txt`
- `release-attestation.json`
- `release-attestation.json.bundle`

## Suite Installer Truth

`installer/modules.json` records:

- `id`: `civiccode`
- `current_version`: `1.0.0`
- `civiccore_requirement`: `1.1.0`
- `installer_status`: `v1_0_0_public_use_module_released`
- proof requirements: `module_selection`, `install_plan`,
  `artifact_resolution`, `health_check`, `restart`, `release_artifacts`, and
  `release_attestation`

The `land-use` profile includes CivicCode in dependency order:

1. `civiccore`
2. `civiccode`
3. `civiczone`
4. `civicplan`
5. `civicpermit`
6. `civicinspect`

The installer planner resolves the `land-use` scenario as:

1. `civiccore`
2. `civicclerk`
3. `civiccode`
4. `civiczone`
5. `civicplan`
6. `civicpermit`
7. `civicinspect`

The additional `civicclerk` dependency is expected because CivicCode receives
adopted-ordinance handoff intake from CivicClerk.

## Verification Commands

Run from the `CivicSuite/civicsuite` umbrella checkout after this change.

```powershell
python scripts\verify-suite-state.py --remote-only
bash scripts/verify-docs.sh
python scripts\verify-installer-plan.py
git diff --check
```

Observed proof in this suite truth pass:

- `[civiccode] PASS 1.0.0`
- `[civicrecords-ai] PASS 1.6.1`
- `VERIFY-SUITE-STATE: PASSED`
- `VERIFY-INSTALLER-PLAN: PASSED`
- `RELEASE-LOCKSTEP-GATE: PASSED`
- `bash scripts/verify-docs.sh`: `PASS`
- `git diff --check`: no whitespace errors
- no current-facing CivicCode `0.5.0` demotion claim
- no macOS lifecycle certification claim

Additional non-mutating planner checks:

- `python scripts\plan-installer.py --profile land-use --menu-style guided --dry-run`
  resolves `civiccore`, `civicclerk`, `civiccode`, `civiczone`,
  `civicplan`, `civicpermit`, and `civicinspect`.
- `python scripts\plan-installer.py --profile custom --module civiccode --menu-style guided --dry-run`
  resolves `civiccore`, `civicclerk`, and `civiccode`.
- `python scripts\plan-installer.py --profile custom --module civiccode --menu-style guided --show-artifacts --dry-run`
  resolves CivicCode `1.0.0` local artifacts and `dist\SHA256SUMS.txt`.
- `python scripts\plan-installer.py --profile custom --module civiccode --menu-style guided --show-health-checks --dry-run`
  plans CivicCode health at `http://localhost:8020/health` with actionable
  failure copy.

`verify-installer-plan.py` regenerates the tracked Clerk-Core source archives
under `installer/dist` after `modules.json` changes. Those regenerated source
artifacts are included so the repository's package metadata and SHA256 manifest
match the new CivicCode `1.0.0` installer truth. This does not alter the
already-published `installer-clerk-core-v0.1.0` GitHub release.
