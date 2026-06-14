# Audit Lite: Windows Local Support Bundle

Date: 2026-06-14

Scope:
- `desktop/runtime/windows-local-runtime.json`
- `desktop/src-tauri/src/supervisor.rs`
- `desktop/src/main.js`
- `desktop/tests/browser/model-readiness.spec.mjs`
- `desktop/tests/static-smoke.mjs`
- `docs/design/windows-desktop-design-control.md`
- `docs/installer/operator-walkthrough.md`

## Findings

None.

## Evidence

- Runtime contract now includes `support-bundle` as a Windows local lifecycle action. Evidence: `desktop/runtime/windows-local-runtime.json:17` and `desktop/src-tauri/src/supervisor.rs:23`.
- The supervisor creates a timestamped support bundle under the configured backup location with `README.txt`, `health-summary.json`, `runtime-state.json`, selected service logs, and `support-manifest.json` SHA-256 file evidence. Evidence: `desktop/src-tauri/src/supervisor.rs:1748` and `desktop/src-tauri/src/supervisor.rs:1838`.
- The backend explicitly avoids copying city records, uploaded documents, backup contents, or local secrets into the bundle. Evidence: `desktop/src-tauri/src/supervisor.rs:1817`.
- The System Health UI exposes `Create Support Bundle`, requires guided review, and explains the bundle contents and visibility boundary. Evidence: `desktop/src/main.js:4198` and `desktop/src/main.js:4424`.
- Regression coverage proves a selected-service support bundle is written under the configured backup location and contains manifest, health, runtime-state, and selected log evidence without `Data` or `config` copies. Evidence: `desktop/src-tauri/src/supervisor.rs:2649`.

## Verification

- `cargo fmt`
- `cargo test support_bundle_action_packages_selected_runtime_evidence -- --test-threads=1 --nocapture`
- `cargo test -- --test-threads=1`
- `npm test -- --runInBand`
- `npm run test:browser`
- `npm run build`
- `cargo check`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-deployment-profile.py --static-only`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `git diff --check`

## Residual Risk

This slice proves the local supervisor action, UI review surface, and repo gates. It is not a clean-machine MSI install, reboot, repair, backup/restore, support-bundle handoff, uninstall, or reinstall walkthrough; that remains an end-stage Windows Local 1.0 gate.
