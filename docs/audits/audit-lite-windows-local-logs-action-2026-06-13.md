# Audit Lite: Windows Local Logs Action

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/supervisor.rs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/supervisor.rs:1667` prepares logs under the selected city data folder.
- `desktop/src-tauri/src/supervisor.rs:1683` creates a selected service log file only when it is missing, avoiding overwrites of real service output.
- `desktop/src-tauri/src/supervisor.rs:1703` writes a local `README.txt` explaining the logs folder for IT/support use.
- `desktop/src-tauri/src/supervisor.rs:1714` opens the prepared local logs folder through the desktop local-shell path.
- `desktop/src-tauri/src/supervisor.rs:2477` verifies the action respects custom selected data folders and creates the README plus selected service log file.
- `desktop/tests/static-smoke.mjs:329` guards the support-facing logs copy.

## Verification

- `cargo fmt --check`
- `cargo test supervisor::tests::logs_action_prepares_selected_logs_folder -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice prepares and opens local log artifacts. It does not yet package logs into a support bundle; that can be added as a later support workflow if beta users need single-file export.
