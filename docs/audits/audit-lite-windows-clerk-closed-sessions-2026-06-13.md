# Audit Lite: Windows Clerk Closed Sessions

Date: 2026-06-13
Slice: CivicClerk closed-session boundary records for the Windows Local 1.0 city-core package.

## Findings

No unresolved findings.

## Evidence

- Durable backend contract exists through `ClosedSessionRecord` at `desktop/src-tauri/src/workflows.rs:193`, meeting persistence defaults at `desktop/src-tauri/src/workflows.rs:1277`, and the `record-closed-session` action at `desktop/src-tauri/src/workflows.rs:2407`.
- The action requires statutory basis, topics, entered/exited timing, and reconvene statement at `desktop/src-tauri/src/workflows.rs:2411`; it rejects archived meeting mutation through the existing meeting-change guard at `desktop/src-tauri/src/workflows.rs:2426`.
- Staff meeting packets include closed-session basis, topics, timing, attendees, reconvene statement, and staff-only notes reference through `closed_sessions_or_default` at `desktop/src-tauri/src/workflows.rs:2570` and packet rendering at `desktop/src-tauri/src/workflows.rs:2960`.
- Public archive rendering uses the public meeting projection before writing the archive payload at `desktop/src-tauri/src/workflows.rs:3036`; that projection clears attendees and staff notes at `desktop/src-tauri/src/workflows.rs:5345`, and pre-archive public views clear closed-session records at `desktop/src-tauri/src/workflows.rs:5366`.
- Desktop UI exposes a guided closed-session review at `desktop/src/main.js:1587` and staff form at `desktop/src/main.js:2351`; public search uses sanitized public meeting projections before indexing closed-session text at `desktop/src/main.js:3146`.
- Module gating maps `record-closed-session` to CivicClerk at `desktop/src-tauri/src/main.rs:158`.
- Browser smoke covers the closed-session form controls at `desktop/tests/browser/workflow-pages.spec.mjs:53`.
- Operator walkthrough now includes the clerk closed-session workflow and public-archive privacy boundary at `docs/installer/operator-walkthrough.md:75`.

## Verification

- `cargo test -- --test-threads=1`: passed, 96 tests.
- `cargo check`: passed.
- `cargo fmt -- --check`: passed.
- `npm test -- --runInBand`: passed.
- `npm run build`: passed.
- `npm run test:browser`: passed, 11 browser tests.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `git diff --check`: passed.

## Residual Risk

- This slice proves the local workflow boundary and browser UI exposure, but it is not a substitute for the later clean-machine MSI install/reboot/uninstall walkthrough.
- The workflow captures clerk-entered statutory basis and evidence boundaries; it does not attempt jurisdiction-specific legal validation of whether a closed session is permitted.
