# Audit Lite: Windows Records Release Copy Artifacts

## Scope

- Slice: durable CivicRecords release-ready/redacted copy artifacts for Windows-local records packages.
- Files reviewed:
  - `desktop/src-tauri/src/main.rs`
  - `desktop/src-tauri/src/workflows.rs`
  - `desktop/src/main.js`
  - `desktop/tests/browser/workflow-pages.spec.mjs`
  - `docs/installer/operator-walkthrough.md`
- Intended behavior: staff can attach a release-ready or redacted copy for an attached records document. CivicSuite copies the file into the local records release store, records filename/hash/size/reviewer/note evidence, blocks release package build when document release/redaction decisions lack the matching final artifact, and includes safe release artifact evidence in Records exports.

## Findings

None.

## Evidence

- Data contract: `RecordsDocument` stores optional release artifact metadata with serde defaults, and `RecordsReleasePackage` tracks release artifact counts (`desktop/src-tauri/src/workflows.rs:415`, `desktop/src-tauri/src/workflows.rs:485`).
- Backend action: `add_records_release_copy` validates status, copies the file into the local records release store, hashes the stored copy, records timeline/audit evidence, and updates the selected request document (`desktop/src-tauri/src/workflows.rs:4793`).
- Package guard: `build_records_release_package` blocks release/redaction package builds unless matching release-ready/redacted copies are attached (`desktop/src-tauri/src/workflows.rs:5272`).
- Module gate: the desktop module requirement includes `add-records-release-copy` under CivicRecords AI (`desktop/src-tauri/src/main.rs:176`).
- Staff UI: Records Requests now expose release document selection, release copy path/status/note/reviewer controls, guided review, and saved release artifact readback (`desktop/src/main.js:2006`, `desktop/src/main.js:3107`, `desktop/src/main.js:3273`).
- Browser coverage: workflow tests verify staff controls, public-surface hiding, and the guided review panel (`desktop/tests/browser/workflow-pages.spec.mjs:161`, `desktop/tests/browser/workflow-pages.spec.mjs:377`).
- Backend coverage: `records_workflow_requires_human_approval_before_release` verifies package build failure without a redacted copy, successful release-copy attachment, package artifact counts, export evidence, and no release stored-path leak in exported text (`desktop/src-tauri/src/workflows.rs:8742`).

## Verification

- `cargo test records_workflow_requires_human_approval_before_release -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: passed, 96 tests.
- `cargo check`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm test -- --runInBand`: passed.
- `npm run build`: passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `cargo fmt -- --check`: passed.
- `git diff --check`: passed with CRLF normalization warnings only.

## Residual Risk

This slice stores and hashes release-ready/redacted artifacts but does not perform binary/PDF redaction itself. Staff must still prepare the redacted or release-ready file before attaching it. Clean-machine MSI install, reboot survival, repair, backup/restore, uninstall/reinstall, and full clerk walkthrough evidence remain the end-stage Windows Local 1.0 gate.
