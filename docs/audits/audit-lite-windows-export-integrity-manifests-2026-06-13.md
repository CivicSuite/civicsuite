# Audit Lite: Windows Workflow Export Integrity Manifests

Date: 2026-06-13

Scope: `desktop/src-tauri/src/workflows.rs` export persistence for Clerk meeting packets/archives, Records response packages, and Code public exports.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/workflows.rs:184` adds an export integrity manifest contract with schema version, export path, format, size, SHA-256, timestamp, and generator.
- `desktop/src-tauri/src/workflows.rs:312` derives the sidecar manifest path from the exported Markdown file name.
- `desktop/src-tauri/src/workflows.rs:320` writes the manifest using the same SHA-256 helper already used for public payload hashes.
- `desktop/src-tauri/src/workflows.rs:364` removes the just-written Markdown file if the sidecar manifest write fails, avoiding state that points at an unverifiable export.
- `desktop/src-tauri/src/workflows.rs:2303` verifies manifest existence, parseability, size, path, format, generator, and hash in tests.
- `desktop/src-tauri/src/workflows.rs:2365`, `desktop/src-tauri/src/workflows.rs:2562`, and `desktop/src-tauri/src/workflows.rs:2693` cover Clerk, Records, and Code exports.

## Verification

- `cargo fmt --check` in `desktop/src-tauri`: PASS.
- `cargo test workflows::tests` in `desktop/src-tauri`: PASS, 9 passed.
- `cargo test` in `desktop/src-tauri`: PASS, 79 passed.
- `npm test` in `desktop`: PASS.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

This slice verifies local workflow exports in unit tests. It does not replace the later clean-machine install and walkthrough gate, which still needs to prove that a clerk can find and inspect the exported files from the installed desktop app.
