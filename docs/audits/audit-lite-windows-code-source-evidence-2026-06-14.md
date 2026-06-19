# Audit Lite: Windows CivicCode Source Evidence

## Scope

- Slice: durable CivicCode source-file evidence for Windows-local imports.
- Files reviewed:
  - `desktop/src-tauri/src/workflows.rs`
  - `desktop/src/main.js`
  - `desktop/tests/browser/workflow-pages.spec.mjs`
  - `docs/installer/operator-walkthrough.md`
- Intended behavior: a clerk can import a municipal code source with title, citation, searchable text, optional source file path, and importer name. When a file is provided, CivicSuite copies it into the local profile, records filename/hash/size, includes safe evidence in public exports, and hides clerk workstation paths from public projections.

## Findings

None.

## Evidence

- Data contract: `CodeSource` now stores optional source evidence fields with serde defaults for older profiles (`desktop/src-tauri/src/workflows.rs:552`).
- Import path: `import_code_source` validates an optional local file, copies it under the CivicSuite data profile, hashes the stored copy, and records audit/version evidence (`desktop/src-tauri/src/workflows.rs:5424`).
- Public boundary: code publication includes filename/hash/size evidence but not local paths (`desktop/src-tauri/src/workflows.rs:5819`), and public projection clears original path, stored path, and importer (`desktop/src-tauri/src/workflows.rs:6813`).
- Staff UI: CivicCode import now asks for source file path/importer and shows saved evidence (`desktop/src/main.js:3348`, `desktop/src/main.js:3412`).
- Guided review: code-source import is now a review-before-mutation action (`desktop/src/main.js:1441`, `desktop/src/main.js:2146`).
- Browser coverage: staff/public visibility and guided import review are covered (`desktop/tests/browser/workflow-pages.spec.mjs:185`, `desktop/tests/browser/workflow-pages.spec.mjs:369`).
- Backend coverage: `code_workflow_persists_source_handoff_and_search` verifies copied source evidence, export privacy, public projection privacy, and staff/public search behavior (`desktop/src-tauri/src/workflows.rs:9048`).

## Verification

- `cargo test code_workflow_persists_source_handoff_and_search -- --test-threads=1`: passed.
- `npm run test:browser`: passed, 11 tests.
- `cargo test -- --test-threads=1`: passed, 96 tests.
- `cargo check`: passed.
- `npm test -- --runInBand`: passed.
- `npm run build`: passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `cargo fmt -- --check`: passed.
- `git diff --check`: passed with CRLF normalization warnings only.

## Residual Risk

Clean-machine MSI install, reboot survival, repair, backup/restore, uninstall/reinstall, and full clerk walkthrough evidence were not rerun for this small slice. That remains the end-stage Windows Local 1.0 gate, not an unresolved finding for this source-evidence implementation.
