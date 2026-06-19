# Audit Lite: Windows Clerk Notice Deadline Calculator

Scope: CivicClerk notice deadline calculation for the Windows Local desktop path. Reviewed backend workflow contract, CivicClerk module guard, staff/public UI wiring, guided review copy, browser/static coverage, and operator walkthrough alignment.

## Findings

None.

## Evidence

- `desktop/src-tauri/src/workflows.rs`: adds backward ISO date arithmetic, business-day weekend skipping, clerk approval, time zone validation, agenda prerequisite, durable notice checklist persistence, and audit evidence for `calculate-notice-deadline`.
- `desktop/src-tauri/src/main.rs`: adds CivicClerk module gating for `calculate-notice-deadline`.
- `desktop/src/main.js`: exposes lead-day/day-type fields, the guided review panel, staff-only action button, and desktop payload wiring.
- `desktop/tests/browser/workflow-pages.spec.mjs`: proves staff controls are visible, resident/public controls are hidden, and the risky action opens a review panel.
- `desktop/tests/static-smoke.mjs`: pins the UI and workflow contract phrases.
- `docs/installer/operator-walkthrough.md`: adds the notice deadline calculator to the Clerk smoke path.

## Verification

- `cargo fmt`: passed.
- `cargo test clerk_notice_deadline_calculator_skips_weekends_and_records_review_evidence -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: passed, 98 tests.
- `npm test -- --runInBand`: passed.
- `npm run test:browser`: passed on isolated rerun, 11 tests.
- `npm run build`: passed.
- `cargo check`: passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed.

## Residual Risk

This slice verifies the local workflow, browser surface, and release-plan checks. It does not replace the later clean-machine Windows installed-app walkthrough for MSI install, reboot survival, backup/restore, repair, uninstall, reinstall, or jurisdiction-specific holiday calendar proof.
