# Audit Lite: Windows MSI Notice Contract

Date: 2026-06-14
Scope: Windows Local MSI installer notice contract, Tauri bundle target, CI evidence, and stale NSIS hook removal.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/tauri.conf.json` now keeps the shipped desktop bundle on the MSI target and no longer carries an unused NSIS installer hook configuration.
- `desktop/installer/windows/unsigned-beta-install-notice.txt` is explicitly labeled as the CivicSuite Windows Beta MSI install notice and explains unsigned beta status, SmartScreen, "More info", "Run anyway", no Docker/WSL/terminal, uninstall, repair, backup, and restore.
- `.github/workflows/desktop-windows-msi.yml` now records MSI-specific evidence: `InstallerBundle=msi`, `UnsignedBetaNoticeSurface=msi-license-file`, and `SmartScreenGuidance=More info -> Run anyway`.
- `desktop/tests/static-smoke.mjs` now fails if the MSI packaging contract relies on NSIS hooks, while still requiring the MSI target, WiX upgrade code, runtime payload resource, and unsigned beta notice.
- Local Tauri MSI build generated `desktop/src-tauri/target/release/wix/LICENSE.rtf` containing the full MSI notice text, including SmartScreen, "More info", and "Run anyway".
- The generated local MSI was `CivicSuite_0.1.0_x64_en-US.msi`, 1,639,699,008 bytes, SHA-256 `cfbeaed0629d84fa2c5ff5a5ff0e278e79c6d9fd3ee95509244d623402b062ce`.

## Verification Evidence

- `npm test`: passed.
- `npm run build`: passed.
- `cargo check`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.
- `npm run tauri -- build --bundles msi`: passed and produced `desktop/src-tauri/target/release/bundle/msi/CivicSuite_0.1.0_x64_en-US.msi`.

## Residual Risk

This slice proves the source and local MSI build notice contract. It does not replace the end-stage clean-machine install, SmartScreen/unsigned-flow observation, first-run setup, reboot survival, backup/restore, repair, uninstall, reinstall, and full city-clerk walkthrough gate.
