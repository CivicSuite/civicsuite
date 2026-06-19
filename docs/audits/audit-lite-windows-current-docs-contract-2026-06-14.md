# Audit Lite: Windows Current Docs Contract

Date: 2026-06-14

Scope: README, STATUS, USER-MANUAL, and the desktop static smoke guard for current-facing Windows Local 1.0 clerk-path documentation.

## Verdict

No unresolved findings.

## Evidence

- Current-facing README now points evaluators to the Windows Local Tauri/WebView2 city-core desktop path instead of the historical container-wrapper path.
- STATUS now describes the current Windows Local city-core beta target, portable-native runtime, local-only operator path, and remaining clean-machine evidence gate.
- USER-MANUAL now gives a desktop-first Windows Local install and first-task journey instead of Docker/WSL, localhost, or browser launcher instructions.
- Static smoke now fails if README, STATUS, or USER-MANUAL reintroduces stale current-facing container-wrapper phrases.

## Verification

- `npm test` from `desktop`: passed.
- `npm run build` from `desktop`: passed.
- `bash scripts/verify-docs.sh`: passed.
- Stale current-facing phrase scan across README, STATUS, USER-MANUAL: no matches.
- `git diff --check`: passed with expected CRLF normalization warnings only.

## Residual Risk

Historical evidence documents under `docs/installer/`, `docs/process/`, and archived browser QA still contain Docker/WSL references by design. The new guard is intentionally limited to current-facing front-door docs so historical evidence remains auditable.
