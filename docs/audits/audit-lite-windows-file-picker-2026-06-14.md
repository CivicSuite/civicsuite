# Audit Lite: Windows File Picker

Date: 2026-06-14
Scope: Clerk, Records, and Code local source-file selection in the Windows desktop app.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/main.rs` now exposes a signed-in-only `choose_file_path` desktop command. On Windows it opens the native file picker; in tests it uses `CIVICSUITE_TEST_FILE_PICKER_PATH`; on non-Windows desktop builds it returns a clear unsupported message.
- `desktop/src-tauri/Cargo.toml` adds the native file dialog dependency only for Windows targets, avoiding a new end-user Docker, WSL, or terminal dependency.
- `desktop/src/main.js` adds reusable `Choose File` controls beside typed path fields while preserving typed-path fallback for IT-supplied paths.
- The file picker now covers packet attachments, records request documents, records release copies, and CivicCode source imports.
- Browser preview behavior is explicit: clicking `Choose File` without the Tauri bridge tells staff that native file selection is available in the Windows desktop app.
- `docs/installer/operator-walkthrough.md` now tells clerks to use `Choose File` for normal source-document evidence work instead of manually browsing Windows folders.

## Verification Evidence

- `cargo fmt`: passed.
- `cargo test choose_file_path_requires_signed_in_staff_and_uses_native_picker_result -- --test-threads=1 --nocapture`: passed.
- `cargo test -- --test-threads=1`: passed, 106 tests.
- `npm test`: passed.
- `npm run test:browser -- --grep "city workflow pages"`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice proves the desktop command boundary, browser fallback, and clerk-facing controls. It does not replace the end-stage clean-machine proof that the installed MSI opens the native Windows picker, copies selected files into the local city profile, and preserves evidence through backup, restore, uninstall, and reinstall.
