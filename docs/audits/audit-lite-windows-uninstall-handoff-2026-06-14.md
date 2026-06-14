# Audit Lite: Windows Uninstall Handoff

Date: 2026-06-14
Scope: System Health uninstall completion path after final backup/profile removal.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/runtime/windows-local-runtime.json` now declares `open-windows-uninstall` as a supported local lifecycle action.
- `desktop/src-tauri/src/local_shell.rs` adds a Windows desktop handoff to Installed apps using `ms-settings:appsfeatures`, while tests and suppressed-open runs do not launch external UI.
- `desktop/src-tauri/src/supervisor.rs` exposes `open-windows-uninstall` behind the existing local-admin-only supervisor action boundary and keeps `uninstall` focused on final backup, service stop, and local profile removal.
- `desktop/src/main.js` shows **Open Windows Uninstall** in System Health and as the post-prepare follow-up after a successful uninstall-preparation action.
- `docs/installer/operator-walkthrough.md` now tells city staff to use **Open Windows Uninstall** or Windows Settings > Installed apps after preparation succeeds.

## Verification Evidence

- `cargo fmt`: passed.
- `cargo test open_windows_uninstall_settings_returns_user_handoff -- --test-threads=1 --nocapture`: passed.
- `cargo test -- --test-threads=1`: passed, 105 tests.
- `npm test`: passed.
- `npm run test:browser -- --grep "system health repair and uninstall"`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice proves the in-app handoff and local supervisor action. It does not replace the later clean-machine proof that Windows Settings actually removes the installed MSI program files and that reinstall can restore from the final-uninstall backup.
