# Audit Lite: Windows Open Exports Folder

Date: 2026-06-13

Scope: Clerk/Records/Code staff UI and workflow action for opening local export folders from the desktop app.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/workflows.rs:250` creates the requested export folder before trying to open it.
- `desktop/src-tauri/src/workflows.rs:257` uses Explorer on Windows, `open` on macOS, and `xdg-open` on Linux, while suppressing OS launches in unit tests.
- `desktop/src-tauri/src/workflows.rs:2372` tests that only allowlisted export folders can be opened and rejects path-like folder input.
- `desktop/src/main.js:1135` maps the active task screen to the matching export folder.
- `desktop/src/main.js:1607`, `desktop/src/main.js:1828`, and `desktop/src/main.js:1924` expose `Open Exports Folder` from Meetings, Records, and Code staff task controls.
- `desktop/tests/browser/workflow-pages.spec.mjs:12`, `desktop/tests/browser/workflow-pages.spec.mjs:37`, and `desktop/tests/browser/workflow-pages.spec.mjs:44` cover staff visibility.
- `desktop/tests/browser/workflow-pages.spec.mjs:79`, `desktop/tests/browser/workflow-pages.spec.mjs:94`, and `desktop/tests/browser/workflow-pages.spec.mjs:112` cover Resident/Public hiding.

## Verification

- `cargo fmt --check` in `desktop/src-tauri`: PASS.
- `cargo test workflows::tests::export_folder_action_opens_only_allowlisted_local_export_folders` in `desktop/src-tauri`: PASS.
- `cargo test` in `desktop/src-tauri`: PASS, 80 passed.
- `npm test` in `desktop`: PASS.
- `npm run test:browser -- workflow-pages.spec.mjs` in `desktop`: PASS on rerun, 6 passed.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

Unit tests intentionally suppress the live OS folder launch. The later clean-machine walkthrough still needs to prove Explorer opens the installed app's real export folder for a non-technical clerk.
