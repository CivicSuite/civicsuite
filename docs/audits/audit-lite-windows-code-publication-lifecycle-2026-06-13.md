# Audit Lite: Windows CivicCode Publication Lifecycle

Date: 2026-06-13
Scope: CivicCode source public/internal lifecycle, desktop publication controls, public search filtering, and workflow persistence tests.

## Findings

No findings.

## Evidence

- `CodeSource` now stores backward-compatible public lifecycle fields with serde defaults in `desktop/src-tauri/src/workflows.rs:48`.
- Imported code sources default to `internal draft` instead of becoming public automatically in `desktop/src-tauri/src/workflows.rs:577`.
- Publishing a source writes a public export artifact, marks `public_status` as `published`, records the publish timestamp, and writes an audit-chain entry in `desktop/src-tauri/src/workflows.rs:615`.
- Unpublishing returns the source to internal draft and records an audit-chain entry in `desktop/src-tauri/src/workflows.rs:637`.
- The Tauri workflow dispatcher exposes `publish-code-source` and `unpublish-code-source` actions in `desktop/src-tauri/src/workflows.rs:761`.
- The Resident/Public desktop surface filters code sources to `public_status === "published"` in `desktop/src/main.js:941` and `desktop/src/main.js:1007`.
- Public search uses the published-only code-source list while Staff search still sees all local code sources in `desktop/src/main.js:1076`.
- Staff CivicCode controls now include Import, Publish, Unpublish, and Clerk Handoff actions in `desktop/src/main.js:1037`.
- Browser coverage verifies Staff publication controls are visible and Resident/Public hides import, publish, unpublish, and handoff controls in `desktop/tests/browser/workflow-pages.spec.mjs:20` and `desktop/tests/browser/workflow-pages.spec.mjs:50`.
- Rust workflow coverage verifies publish persistence, public export files, retract behavior, and audit-chain continuity in `desktop/src-tauri/src/workflows.rs:897` and `desktop/src-tauri/src/workflows.rs:921`.

## Verification

- `cargo fmt` passed.
- `cargo test` passed: 50 passed.
- `npm test` passed.
- `npm run build` passed.
- `npm run test:browser` passed: 9 passed.
- `git diff --check` passed.

## Residual Risk

- Publication currently targets the first/local current code source, matching the existing single-current-source workflow pattern. A future multi-source selection UX should let staff publish or retract a specific source from a list when the CivicCode module grows beyond the current city-core workflow depth.
