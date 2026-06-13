# Audit Lite: Windows MSI Upgrade Identity

Date: 2026-06-13
Scope: Windows Local MSI WiX identity, unsigned-beta notice evidence, and desktop static smoke coverage.

## Findings

None.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Evidence Reviewed

- `desktop/src-tauri/tauri.conf.json` now pins the WiX `upgradeCode` to `a63fc1d3-5437-5f55-89a2-fef93fb1f930`, matching the Tauri-derived CivicSuite default and preventing update/install drift if product metadata changes later.
- `.github/workflows/desktop-windows-msi.yml` now records the MSI upgrade code, unsigned-beta notice path, and SmartScreen notice inclusion in the uploaded MSI evidence file.
- `desktop/tests/static-smoke.mjs` now fails if the MSI WiX identity or MSI evidence markers are removed.

## Verification

- `npm test`: passed.
- `npm run build`: passed.
- `npm run tauri -- inspect wix-upgrade-code`: passed and reported both the default CivicSuite upgrade code and the application override as `a63fc1d3-5437-5f55-89a2-fef93fb1f930`.
- `git diff --check`: passed with only the repo's normal CRLF warnings for touched files.

## Residual Risk

This slice verifies MSI identity and build evidence, not clean-machine installation behavior. Fresh install, uninstall, repair, backup/restore, reinstall, reboot persistence, and first-run model setup still belong to the clean-machine MSI walkthrough gate.
