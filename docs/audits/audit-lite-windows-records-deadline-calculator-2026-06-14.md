# Audit Lite: Windows Records Deadline Calculator

Date: 2026-06-14
Branch: `work/windows-local-1-design-contract`
Slice: CivicRecords AI reviewed deadline calculation

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added local ISO date arithmetic, weekend-skipping business-day calculation, `calculate-records-deadline` workflow action, audit/timeline/notification/public-status evidence, and backend tests for weekend behavior plus public projection privacy.
- `desktop/src-tauri/src/main.rs`: added CivicRecords AI module gating for `calculate-records-deadline`.
- `desktop/src/main.js`: added received date, deadline rule, day count, day type, weekend/holiday warning, guided review, and payload wiring for Calculate Deadline.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs`: added UI, public-surface exclusion, guided-review, and static contract coverage.
- `docs/installer/operator-walkthrough.md`: updated the Records clerk smoke path to require the calculation workflow before manual override.

## Verification

- `cargo fmt`
- `cargo test records_deadline_calculator_skips_weekends_and_preserves_public_boundary -- --test-threads=1`
- `cargo test -- --test-threads=1` - 97 passed
- `npm test -- --runInBand`
- `npm run test:browser` - 11 passed
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-deployment-profile.py --static-only`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `git diff --check`

## Residual Risk

The calculator supports reviewed calendar-day and weekend-skipping business-day calculations. It does not ship a jurisdiction-specific holiday calendar or full statutory rules package; the UI and saved basis tell staff to check city/state holidays before saving. Clean-machine MSI install/reboot/repair/backup/restore/uninstall/reinstall and full clerk walkthrough evidence remain end-stage Windows Local 1.0 gates.
