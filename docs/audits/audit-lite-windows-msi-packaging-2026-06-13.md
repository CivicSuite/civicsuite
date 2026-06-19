# Audit Lite: Windows MSI Packaging

Date: 2026-06-13
Scope: Default Windows desktop bundle target and installer artifact generation for the full portable runtime payload.

## Findings

None.

## Evidence Reviewed

- `npm run tauri -- build` originally failed on NSIS with `Internal compiler error #12345: error mmapping datablock to 9911228` while embedding the approximately 2.4 GB portable runtime payload.
- `npm run tauri -- build --bundles msi` initially reached MSI bundling and failed only because `bundle.icon` was missing.
- `desktop/src-tauri/tauri.conf.json:29` now defaults the Windows bundle target to MSI, which can carry the full embedded runtime payload on this machine.
- `desktop/src-tauri/tauri.conf.json:31` now declares `icons/icon.ico`, fixing the MSI metadata gate.
- `desktop/src-tauri/tauri.conf.json:33` still includes `../runtime/payload/`, so the installer artifact carries the portable Windows runtime payload instead of requiring Docker, WSL, or a terminal.
- `desktop/tests/static-smoke.mjs:52` and `desktop/tests/static-smoke.mjs:56` now guard the icon and MSI target contract.

## Verification

- `npm run tauri -- build`: passed and produced `desktop/src-tauri/target/release/bundle/msi/CivicSuite_0.1.0_x64_en-US.msi`.
- MSI artifact size: 1,639,121,840 bytes.
- `npm test`: passed.
- `cargo test`: passed, 57 tests.
- `cargo fmt --check`: passed.
- `git diff --check`: passed with only the repo's normal CRLF warnings for touched files.
- Process/temp cleanup check: no leftover `postgres`, `python`, `cargo`, or `node` proof processes and no stale CivicSuite test temp profile remained.

## Residual Risk

- This slice proves package creation, not clean-machine installation. Installing, first-run verification, reboot persistence, repair, backup/restore, uninstall, and reinstall remain part of the later clean-machine walkthrough gate.
