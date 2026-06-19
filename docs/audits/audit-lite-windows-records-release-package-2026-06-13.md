# Audit Lite: Windows Records Release Package

Scope: CivicRecords AI release package manifest workflow in the Windows-local desktop shell.

## Findings

No Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence

- Backend profile data now has durable `RecordsReleasePackage` metadata with export path, package hash, source counts, decision counts, and timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:174`.
- The `build-records-release-package` action requires source evidence plus release/redact/exempt decisions, writes a checksummed package manifest, records request timeline, and appends CivicRecords audit evidence. Evidence: `desktop/src-tauri/src/workflows.rs:2769`.
- Fulfillment now blocks unless a release package manifest exists, preventing a request from being marked done with only a response letter. Evidence: `desktop/src-tauri/src/workflows.rs:3008`.
- Response exports include release package metadata, and staff search indexes package path/hash/count evidence. Evidence: `desktop/src-tauri/src/workflows.rs:2896`, `desktop/src-tauri/src/workflows.rs:3781`.
- Public records projections scrub release package local paths and hashes from requester/public status views. Evidence: `desktop/src-tauri/src/workflows.rs:3983`, `desktop/src/main.js:2142`.
- Staff UI exposes guided “Build Release Package,” renders Release Packages on request cards, and documents the package manifest in the operator walkthrough. Evidence: `desktop/src/main.js:1707`, `desktop/src/main.js:2407`, `docs/installer/operator-walkthrough.md:79`.
- Regression coverage proves package build, hash/count persistence, export inclusion, staff search, and public scrub behavior. Evidence: `desktop/src-tauri/src/workflows.rs:4773`, `desktop/src-tauri/src/workflows.rs:4834`, `desktop/src-tauri/src/workflows.rs:5047`.

## Verification

- `cargo fmt`: pass.
- `cargo test records_workflow_requires_human_approval_before_release -- --test-threads=1`: pass.
- `cargo test public_records_intake_creates_trackable_durable_request -- --test-threads=1`: pass.
- `npm test`: pass.
- `npm run test:browser`: pass, 11 tests.
- `cargo test -- --test-threads=1`: pass, 95 tests.
- `cargo check`: pass.
- `npm run build`: pass.
- `python scripts\verify-module-manifest-contract.py`: pass.
- `python scripts\verify-installer-plan.py`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts\verify-deployment-profile.py --static-only`: pass.
- `git diff --check`: pass.

## Residual Risk

This slice completes a real checksummed release package manifest and fulfillment gate. It does not perform binary/PDF redaction rendering; the structured exemption decisions and manifest identify what must be released, redacted, or withheld.
