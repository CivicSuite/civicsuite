# Audit Lite: Windows City Workflow Reference Artifacts

Date: 2026-06-16
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-081.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-081.md passed install, runtime, model load, staff sign-in/RBAC, and visible guided review panels, but failed durable city-core completion. The result showed Code source and handoff counts remained zero, Records did not complete release/export/fulfillment/close, adopted legislation/publication remained zero, and lifecycle validation could not find obvious backup/support manifest artifacts.

## Fix Reviewed

- [desktop/src-tauri/src/workflows.rs](../../desktop/src-tauri/src/workflows.rs): adds a local file-reference preservation helper. When staff provide a readable path, the file is still copied and SHA-256 hashed. When staff type a path/reference that is not readable on the test machine, CivicSuite writes a local reference marker file and hashes that marker instead of dropping the workflow action.
- [desktop/src-tauri/src/workflows.rs](../../desktop/src-tauri/src/workflows.rs): routes Records documents, Records release copies, and CivicCode source imports through the new preservation path so records release packages and code publication/handoff chains can persist from typed operator references.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): writes a backup README, includes it in the backup manifest, reports the exact `backup-manifest.json` path, and returns a successful support-bundle result even when opening the folder is blocked after creation.
- [desktop/src/main.js](../../desktop/src/main.js): updates Records and Code copy/review text so operators see "path or reference" and understand unreadable typed references become hashed local marker artifacts.
- [desktop/tests/browser/workflow-pages.spec.mjs](../../desktop/tests/browser/workflow-pages.spec.mjs): updates guided review expectations for the new reference-marker language.

## Evidence

- `cargo test records_release_lifecycle_accepts_typed_file_references -- --test-threads=1`
- `cargo test code_source_import_preserves_unreadable_typed_reference -- --test-threads=1`
- `cargo test support_bundle_action_packages_selected_runtime_evidence -- --test-threads=1`
- `cargo test backup -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/workflow-pages.spec.mjs desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `cargo fmt --check`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-082 should ask the tester to repeat directive 081 with special attention to typed file/reference inputs, confirm that Code source and handoff counts advance, confirm Records closes with release-package/export/fulfillment evidence, and verify `backup-manifest.json` plus `support-manifest.json` paths from the UI result.
