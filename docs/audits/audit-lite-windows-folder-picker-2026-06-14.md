# Audit Lite: Windows Folder Picker

Date: 2026-06-14
Scope: Native Windows folder selection for first-run city data and backup locations.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/main.rs` now exposes a `choose_folder_path` desktop command. It allows folder selection before the first local administrator exists, then requires a signed-in local administrator once setup ownership exists.
- The native command uses the Windows folder picker through `rfd` and a deterministic `CIVICSUITE_TEST_FOLDER_PICKER_PATH` test override.
- `desktop/src/main.js` now adds `Choose Folder` controls beside the city data and backup folder fields in first-run setup and Settings.
- Browser preview behavior is explicit: clicking `Choose Folder` without the Tauri bridge tells staff that native folder selection is available in the Windows desktop app.
- `desktop/tests/static-smoke.mjs` guards both the UI copy and the Tauri command invocation contract.
- `docs/installer/operator-walkthrough.md` now tells operators to use `Choose Folder` for city data and backup locations instead of manually copying Windows paths during normal setup.

## Verification Evidence

- `cargo fmt`: passed.
- `cargo test choose_folder_path_allows_first_run_then_requires_local_admin -- --test-threads=1 --nocapture`: passed.
- `cargo test -- --test-threads=1`: passed, 107 tests.
- `npm test`: passed.
- `npm run test:browser -- --grep "module manager"`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice proves the desktop command boundary, first-run/admin authorization rule, browser fallback, and clerk-facing controls. It does not replace the end-stage clean-machine proof that a fresh MSI install can choose real Windows folders, persist those locations, back up, restore, uninstall, and reinstall from the selected backup location.
