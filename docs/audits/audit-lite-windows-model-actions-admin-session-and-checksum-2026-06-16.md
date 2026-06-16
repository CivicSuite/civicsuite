# Audit Lite: Windows Model Actions Admin Session And Checksum Stability

Date: 2026-06-16
Branch: `work/windows-local-1-design-contract`
Scope: Fix-forward for `TESTER-RESULT-074.md` failures in the Windows Local MSI cleanroom-equivalent city-core gate.

## Findings

No unresolved findings.

## Evidence Reviewed

- `TESTER-RESULT-074.md` reported that the completed-model status persistence fix passed: after the final `.gguf` existed and the `.part` file was gone, `model-download-status.json` moved to `Needs verification` with full bytes and 100% progress.
- The same result failed the gate because System Health rendered enabled model setup controls after first-admin creation but before local-admin sign-in. `desktop/src/main.js:1017` now requires both `access.signed_in` and `role === "local-admin"` before unlocking model setup controls, and `desktop/src/main.js:5006` rejects DOM/CDP-triggered model actions locally before invoking the backend.
- The backend already rejected signed-out model actions, and that remains covered in `desktop/src-tauri/src/main.rs:887`. `desktop/src-tauri/src/main.rs:412` now runs model setup actions on a blocking worker and wraps the action path in `catch_unwind`, so checksum work cannot block the WebView event loop or terminate the process via an uncaught Rust panic.
- `desktop/tests/static-smoke.mjs:181` now locks the signed-in local-admin UI contract and `desktop/tests/static-smoke.mjs:185` locks the guarded handler result.

## Verification

- `npm --prefix desktop test`: passed.
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`: passed, 5 tests.
- `cargo fmt --check`: passed.
- `cargo test model::tests:: -- --test-threads=1`: passed, 18 tests.
- `cargo test model_actions_require_local_admin_session -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: passed, 112 tests.
- `npm --prefix desktop run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts/verify-deployment-profile.py --static-only`: passed.
- `python scripts/policy/check_stage_evidence.py`: passed.
- `git diff --check`: passed with CRLF normalization warnings only.

## Residual Risk

Local validation covers the UI/admin-session contract and backend command isolation. The exact Windows WebView2 checksum-click path still needs the cleanroom-equivalent MSI retest because the failing behavior involved the installed app, a full 6.9 GB model file, and tester WebView automation.
