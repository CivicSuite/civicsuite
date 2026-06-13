# Audit Lite: Windows Local Folder Opener

Date: 2026-06-13

Scope: shared desktop folder launching for model setup and workflow export folders.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/local_shell.rs:6` creates the target folder and launches it from the desktop app.
- `desktop/src-tauri/src/local_shell.rs:13` uses Explorer on Windows, with macOS/Linux fallbacks for developer/test profiles.
- `desktop/src-tauri/src/local_shell.rs:9` suppresses OS launches under unit tests or explicit `CIVICSUITE_SUPPRESS_OPEN_FOLDER=1`.
- `desktop/src-tauri/src/model.rs:1035` changes `open-model-folder` from folder creation only to the shared opener.
- `desktop/src-tauri/src/model.rs:1254` verifies the model-folder action succeeds, creates the expected folder, and returns the new open-folder message.
- `desktop/src-tauri/src/workflows.rs:1404` keeps the workflow export-folder action on the same shared opener.

## Verification

- `cargo fmt --check` in `desktop/src-tauri`: PASS.
- `cargo test open_folder` in `desktop/src-tauri`: PASS.
- `cargo test export_folder` in `desktop/src-tauri`: PASS.
- `cargo test` in `desktop/src-tauri`: PASS, 80 passed.
- `npm test` in `desktop`: PASS.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

Live Explorer launch is intentionally suppressed in unit tests. The clean-machine walkthrough still needs to verify that `Open Model Folder` and `Open Exports Folder` open the expected installed-app paths on Windows.
