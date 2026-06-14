# Audit Lite: Windows Code Selected Source Targeting

Scope: CivicCode selected-source targeting for the Windows Local desktop path. Reviewed staff UI target visibility, backend publication/retraction selection behavior, staff/public projection boundaries, browser smoke coverage, and static contract coverage.

## Findings

None.

## Evidence

- `desktop/src/main.js`: shows the selected code source before publish, sync, stale, guidance, and handoff actions so staff can see which source will be changed.
- `desktop/src-tauri/src/workflows.rs`: regression test proves `publish-code-source` and `unpublish-code-source` honor `codeSourceId` when multiple sources exist.
- `desktop/tests/browser/workflow-pages.spec.mjs`: browser smoke verifies the Staff Code & Ordinances surface exposes selected-source context.
- `desktop/tests/static-smoke.mjs`: static smoke pins the selected-source UI phrase.

## Verification

- `cargo fmt`: passed.
- `cargo test code_publication_targets_selected_source_when_multiple_sources_exist -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: passed, 99 tests.
- `npm test -- --runInBand`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `cargo check`: passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed.

## Residual Risk

This slice proves selected-source targeting and clerk-visible context for current CivicCode publication actions. It does not add a seeded browser fixture that clicks `Work On This` in a non-empty preview state; selected-ID mutation is covered by Rust workflow tests and source inspection here.
