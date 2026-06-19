# Audit Lite: Windows Model Download State + CI Dependency Gate

Date: 2026-06-13
Scope: Windows Local 1.0 desktop model setup state, local model progress UI, and installer-cleanroom Docker Hub rate-limit classification.

## Findings

No unresolved findings.

## Evidence Reviewed

- `desktop/src-tauri/src/model.rs:183` adds a serialized `ModelDownloadState` contract for the desktop bridge.
- `desktop/src-tauri/src/model.rs:700` derives model download status from verified files, partial files, and the persisted status file.
- `desktop/src-tauri/src/model.rs:969` records durable download state for downloading, failed, and verified model setup paths.
- `desktop/src/main.js:1101` renders a clerk-visible download progress/status panel.
- `desktop/tests/browser/model-readiness.spec.mjs:13` verifies the model progress status appears in the first-run path.
- `scripts/run-installer-package-cleanroom.py:367` classifies Docker Hub pull-rate failures as an external dependency gate instead of a product lifecycle failure.
- `scripts/run-installer-package-cleanroom.py:581` returns success only for passed lifecycle evidence or the explicit dependency-gate classification.
- `scripts/verify-installer-plan.py:121` accepts `dependency_gate_blocked` as a known evidence classification.

## Verification

- `cargo fmt --check`
- `cargo test model -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser -- model-readiness.spec.mjs`
- `npm run test:browser`
- `python -m py_compile scripts\run-installer-package-cleanroom.py scripts\verify-installer-plan.py scripts\plan-installer.py`
- Import-level dependency-gate classification check for Docker Hub rate-limit text.
- `python scripts\verify-installer-plan.py`
- `git diff --check`

## Residual Risk

The full 6.49 GB Gemma model download was not executed locally in this slice. The slice verifies metadata, failure handling, partial download state, and UI visibility; the clean-machine model download remains part of the later MSI cleanroom gate.
