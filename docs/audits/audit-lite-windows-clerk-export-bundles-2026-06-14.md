# Audit Lite: Windows Clerk Export Bundles

Date: 2026-06-14

Scope: CivicClerk meeting packet/notice export bundle records, bundle manifest generation, public projection cleanup, desktop Clerk UI copy, browser smoke coverage, and operator walkthrough wording.

## Findings

### Fixed During Audit - Medium - Public export metadata could leak local paths

Evidence: `desktop/src-tauri/src/workflows.rs:6179` now clears raw `exports` from public meeting projections, `desktop/src-tauri/src/workflows.rs:6203` exposes only public bundle records with path fields cleared, and `desktop/src-tauri/src/workflows.rs:976` now writes public bundle manifest paths as file names rather than absolute local paths.

Impact before fix: an archived public meeting projection or public bundle manifest could carry local workstation paths even though the public archive promise says closed-session files, staff-only material, and local paths must not be exposed.

Fix: public projections clear raw export paths; public bundle state clears `export_path`, `manifest_path`, and `integrity_manifest_path`; public JSON bundle manifests retain file names and checksums but not absolute local paths.

Verification: `desktop/src-tauri/src/workflows.rs:7495` asserts the public meeting exposes only one public bundle and all local path fields are empty; `desktop/src-tauri/src/workflows.rs:6634` asserts public manifest path fields do not contain Windows path separators.

### Fixed During Audit - Low - Bundle IDs could collide under same-second export/archive actions

Evidence: `desktop/src-tauri/src/workflows.rs:3723` and `desktop/src-tauri/src/workflows.rs:3772` now derive the next bundle sequence from the real meeting state before appending each bundle, and `desktop/src-tauri/src/workflows.rs:953` receives that sequence explicitly.

Impact before fix: a staff export and public archive created in the same second could derive duplicate bundle IDs because the archive helper counted the public projection rather than the full meeting export history.

Fix: the export and archive actions pass `meeting.export_bundles.len() + 1` into the manifest writer.

## Final Verdict

No unresolved findings.

Unresolved counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

Residual risk: this is still local workflow evidence, not a clean-machine MSI install/reboot/uninstall proof. The clean-machine gate remains a later stage gate for the Windows Local 1.0 package.

## Verification

- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` - passed
- `cargo test -- --test-threads=1` - passed, 96 tests
- `cargo check` - passed
- `cargo fmt -- --check` - passed
- `npm test -- --runInBand` - passed
- `npm run build` - passed
- `npm run test:browser` - passed, 11 tests
- `python scripts\verify-module-manifest-contract.py` - passed
- `python scripts\verify-deployment-profile.py --static-only` - passed
- `python scripts\verify-installer-plan.py` - passed
- `bash scripts/verify-docs.sh` - passed
- `git diff --check` - passed with CRLF normalization warnings only
